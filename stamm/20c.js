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
    // positionNode VOR der Instanzierung (vendor three.webgpu.min.js: `setupPosition` legt die Zuweisung des positionNode
    // auf den Stapel, die Instanz-, Batch- und Skin-Knoten hängen ihr `positionLocal = M × positionLocal` erst in ihrem
    // setup an, und `StackNode.build` baut die nachgereichten Knoten NACH den ersten): die Phase liest die Welt-Lage aus der
    // EINEN Naht (`_weltNaht`), der Ausschlag (Welt-Meter in Windrichtung, das Flattern entlang der Welt-Normale) geht über
    // sie in die Vorlage zurück — bis K20-N1 wehte der Wind jedes Baums in der Drehung seiner Instanz und wuchs mit ihrer
    // Skala (gate:foundry-impostor C4). Die Naht ist EIN Satz Knoten (`_weltNaht` teilt ihn), der Knoten je Art bleibt einer.
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
        // die Art-Größen: der Stoff-Wert — zeichnet die Arena (`_arenaNimmt`, viele Arten in EINEM Zug), trägt ihn die Instanz
        const uB = AnazhRealm._windArtKnoten(this._stoffWert(T, "userData.windArt", "vec3"));
        const A = AnazhRealm._windTsl(T);
        const pG = T.positionGeometry;
        const naht = this._weltNaht(T);
        const pW = naht.lage;
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
        if (laub) off = off.add(naht.richtung(T.normalLocal).mul(w.flattern.mul(uB.z)));
        mat.positionNode = this._baumWindKnoten[laub ? "laub" : "ast"] = T.positionLocal.add(naht.vorlage(off));
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
        const hat = ov && typeof ov === "object" && Object.keys(ov).length ? ov : null;
        const T = this._foundryGestalten(preset);
        if (!(T >= 2 && gestalt === T && AnazhRealm._solitaerVon(preset, T - 1) === T)) return hat;
        return hat ? Object.assign({}, hat, AnazhRealm.FREISTAND_OV) : AnazhRealm.FREISTAND_OV;
    }
    // Der Same, dessen Gestalt der Ort wählt (K20): `_foundryVariantFor` liest h = Same × 2654435761 in T Eimern; der Ort
    // legt den Eimer fest (frei: der Solitär T, Bestand: 1..T−1 = die V Bestand-Gestalten nach dem eigenen Wurf), die Lage
    // im Eimer bleibt die des Samens, und das Inverse des Knuth-Faktors gibt den Samen zurück. Synchron am Spawn aus dem
    // Kern (der Bestand pflanzt vor dem Buch). Eine Art ohne Solitär behält ihren Samen; `stehtFrei` fragt den Ort nur dann.
    _foundryGestaltSame(seed, preset, stehtFrei) {
        const T = AnazhRealm._studioGestaltenKern(preset);
        if (!(T >= 2) || AnazhRealm._solitaerVon(preset, T - 1) !== T) return seed >>> 0;
        const h = Math.imul(seed >>> 0 || 0, 2654435761) >>> 0;
        const lage = h / 4294967296;
        const eimer = stehtFrei() ? T - 1 : Math.floor(lage * (T - 1));
        const h2 = Math.ceil((eimer * 4294967296) / T) + Math.floor(lage * (Math.floor(4294967296 / T) - 1));
        return Math.imul(h2 >>> 0, AnazhRealm.KNUTH_INVERS) >>> 0;
    }
    // DIE GESTALT DES ORTS (K20), das EINE Gesetz und das EINE Gedächtnis für jeden Baum mit Lage — den Eintrag (auch den
    // geladenen und den gesetzten, `_foundryGestaltFor`) und die Streu-Zelle (`_scatterFoundrySeed`): der Baum am Ort (x, z)
    // mit der eigenen Krone T (FOREST.crown × Größe, m) fragt das Wald-Gesetz (`_forestStehtFrei`), der Same wählt danach
    // seinen Eimer (`_foundryGestaltSame`). Gemerkt je Ort, Krone, Same und Art am Stand jeder Eingabe des Urteils: dem
    // Stand des Wald-Gesetzes (`_forestDartStand`: Same, Buch, Hydrosphäre) und dem der Grundrisse am Ort — das Gedächtnis
    // liegt in Eimern von `ORT_SAME_EIMER` m, ein Grundriss fällt nur in den Eimern seiner Reichweite (`_grundrissFaellt`).
    // Vor dem Worldgen wartet die Gestalt (null, nie gemerkt) — für jeden Leser gleich.
    _ortGestaltSame(x, z, T, seed, preset) {
        const seedInt = this._forestSeedInt();
        const stand = this._forestDartStand(seedInt);
        if (this._ortSameStand !== stand || !this._ortSame || this._ortSameN > 16384) {
            this._ortSame = new Map();
            this._ortSameN = 0;
            this._ortSameStand = stand;
        }
        const B = AnazhRealm.ORT_SAME_EIMER;
        const ek = Math.floor(x / B) + "," + Math.floor(z / B);
        let eimer = this._ortSame.get(ek);
        const k = x + "," + z + "," + T + "," + seed + "," + preset;
        const hat = eimer ? eimer.get(k) : undefined;
        if (hat !== undefined) return hat;
        let wartet = false;
        const same = this._foundryGestaltSame(seed, preset, () => {
            if (!(T > 0)) return false;
            // die Wahrheit des Gesetzes und der Plan des Walds um den Ort (`_waldPlanSteht`, K69): fehlt eins, wartet sie
            if (!this._forestGesetzWahr()) {
                wartet = true;
                return false;
            }
            // fehlt der Plan, bestellt ihn die Frage in der EINEN Schlange des Walds (ihr Rechner ist der Wald-Faden, K60-3);
            // wer warten kann (die Streu-Scheibe), wartet benannt auf ihre leere Schlange (`_waldPlanZusage`)
            if (!this._waldPlanSteht(x, z)) {
                wartet = true;
                if (this._streuSammler) this._streuWartetAuf(this._waldPlanZusage());
                return false;
            }
            return this._forestStehtFrei(x, z, T, (gx, gz) => this._forestCellDarts(gx, gz, seedInt));
        });
        if (wartet) return null;
        if (!eimer) this._ortSame.set(ek, (eimer = new Map()));
        eimer.set(k, same);
        this._ortSameN = (this._ortSameN | 0) + 1;
        return same;
    }
    // DIE GESTALT EINES EINTRAGS (K20), der EINE Leser: ein Baum mit Lage fragt die Gestalt seines Orts (`_ortGestaltSame`),
    // sein Same bleibt; null = sie wartet (wie auf ein kaltes Buch). Ein Datensatz ohne Lage trägt den Samen seines Orts schon.
    // `Vk` (optional) reicht die Gestalten-Zahl des Kerns durch (der gefühlte Baum fragt synchron, `_baumGestaltTeile`). Die
    // Hülle folgt der Gestalt: wartete sie oder wechselte die Gestalt des Orts, fühlt der Baum neu (`_populateBlockerAABBs`).
    _foundryGestaltFor(entry, preset, Vk) {
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
            this._foundryZug(key, preset, variant, lod, entryOv, entry.position, {
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
    // Die Senke projiziert r184 als LOD OHNE TAKT (`_projectObject`: ein LOD zeichnet nicht, ohne `autoUpdate` stellt er nichts,
    // seine Kinder projizieren mit der Reihe seiner Eltern) — sie zeichnet nur über ihr Kind, den Zeichner, und der sortiert wie
    // die Senke zuvor (Reihe der Eltern · ihre renderOrder · ihr Abstand). Als GRUPPE setzte sie die Reihe ihrer Kinder auf ihre
    // eigene renderOrder (r = e.renderOrder): eine Senke außerhalb der Bündel zeichnete in anderer Folge (gpu-bank am Tor nah
    // +0,29 ms, 1410-1). Die Gänge der Welt (`traverse`) sehen den Zeichner nicht: er ist r184s Werkzeug, nicht ein Teil der
    // Welt (Zählungen, Kehraus und Linsen lesen die Senke, wie bisher).
    // Jede neue Senke meldet sich zum Eintritt in die Arena ihres Stoffs (`_arenaKommt`, im Takt vor dem ersten Zug).
    static _instanzZeichner(m) {
        const Z = AnazhRealm._instanzZeichnerKlasse();
        const z = new Z(m);
        m.isLOD = true;
        m.add(z);
        m.__zeichner = z;
        m.traverse = function (cb) {
            cb(this);
            for (const c of this.children) if (c !== this.__zeichner) c.traverse(cb);
        };
        m.traverseVisible = function (cb) {
            if (this.visible === false) return;
            cb(this);
            for (const c of this.children) if (c !== this.__zeichner) c.traverseVisible(cb);
        };
        AnazhRealm._arenaMelden(m);
        return z;
    }
    // EIN FRISCHER ZEICHNER, wenn die Matrizen seiner Senke die GPU verlassen (`_arenaTakt`): r184 baut die Bindegruppe eines
    // Render-Objekts nur bei einer neuen Gruppen-Version neu (`Nodes.updateGroup`) und zieht unter der Observer-Diät ohne
    // jedes Auffrischen — ein Render-Objekt des alten hielte den gefallenen Speicher-Puffer. Der alte verlässt die Senke samt
    // seinen Render-Objekten (`_renderObjekteLoesen`, nach dem Submit des Frames), der neue hat keines: kehrt die Senke zu ihm
    // zurück, legt r184 sein Render-Objekt mit dem Puffer von dann an. Befund 16.10. (G1-n2/diag8, Radeon, Genesis Third):
    // ein zurückgekehrter Zeichner band den gefallenen Puffer weiter — 615 Meldungen der GPU-Wache.
    static _zeichnerFrisch(m) {
        const alt = m.__zeichner;
        if (!alt) return;
        if (alt.parent === m) m.remove(alt);
        m.__zeichner = new (AnazhRealm._instanzZeichnerKlasse())(m);
        setTimeout(() => AnazhRealm._renderObjekteLoesen(alt), 0);
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
                this.__fassade = fassade;
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
                // die Fassade zeichnet, was ihre Quelle zeichnet (Bereich), so viele Instanzen, wie die Senke zählt
                // (`_instanzZahl` bleibt der EINE Schreiber der Zahl — hier wird sie nur gelesen)
                f.setDrawRange(g.drawRange.start, g.drawRange.count);
                // nimmt die Arena ihres Stoffs die Senke (G1, im Takt: `_arenaKommt`), verlässt er den Graphen vor dem ersten Pass
                f.instanceCount = s.count;
                return f;
            }
            // Zieht der Zeichner, meldet er seine Senke zum Eintritt im nächsten Takt (`_arenaKommt`: eine spät gehängte Senke,
            // eine Rückkehr nach `__arenaOhne`) — nie nimmt ihn eine Arena mitten im Render.
            onBeforeRender() {
                AnazhRealm._arenaMelden(this.__instanzQuelle);
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
    // r184 (`positionLocal` · `transformNormal`, die Zuweisung baut NACH der des positionNode, Lehre 22), die Instanz-Farbe als
    // `vInstanceColor` (r184s Farb-Pfad liest sie), die Matrix am Builder für die Naht `_weltNaht` (Wind, Karte, Blende).
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
        // je Objekt der Speicher-Puffer `feld` seiner Quelle: die Matrizen jeder Senke, die Art-Größen des Winds der Arena
        class SenkenPuffer extends SB {
            constructor(feld, typ, n, name) {
                super(new THREE.StorageInstancedBufferAttribute(new Float32Array(n), n), typ, 0);
                this.feld = feld;
                this.updateType = "object";
                this.setName(name);
            }
            quelle(o) {
                return o && o.__instanzQuelle ? o.__instanzQuelle[this.feld] : null;
            }
            setup(builder) {
                const p = this.quelle(builder.object);
                if (p) this.value = p;
                return super.setup(builder);
            }
            update(frame) {
                const p = this.quelle(frame.object);
                if (p) this.value = p;
            }
        }
        const matrix = new SenkenPuffer("instanceMatrix", "mat4", 16, "instanzMatrix")
            .toReadOnly()
            .element(T.instanceIndex);
        // DIE ART-GRÖSSEN DES WINDS IN DER ARENA (G1): je Instanz ein vec4 im Speicher-Puffer, nie ein Vertex-Puffer — die
        // Arena belegt genau die Vertex-Puffer ihres Zeichners (r184 bindet je gelesenes Attribut einen; WebGPU trägt höchstens
        // `maxVertexBuffers` 8). Befund 16.10. (Radeon, Genesis Third, GPU-Wache): `aWindArt` als neunter Vertex-Puffer, „Vertex
        // buffer count (9) exceeds the maximum" — die Pipeline des Laubs abgesagt, jede nahe Krone fehlte im Bild.
        const windArt = new SenkenPuffer("windArt", "vec4", 4, "arenaWindArt")
            .toReadOnly()
            .element(T.instanceIndex).xyz;
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
        AnazhRealm.__senkenKnoten = { matrix, windArt, instanz: new SenkenInstanz() };
        return AnazhRealm.__senkenKnoten;
    }
    // DIE GEOMETRIE-ARENA (G1, die GPU-Welt): EIN Render-Objekt je Stoff. Befund 16.10. (Radeon, EINE Welt, je Ort ein
    // gezählter Frame; Rohdaten G1-gpu-welt/b3/s0): je Pass zog jede Senke ihr eigenes Render-Objekt — Genesis Third haupt
    // 41 · k0 14 · k1 3, Mess-Wiese Ego 33 · 15 · 5, Dorf 29 · 13 · 2 — mit ~3 Instanzen je Senke, und die CPU zahlt je
    // Render-Objekt (Projektion · Diät · Knoten · Bindungen · Zug). Die Senken eines Stoffs unterscheiden sich nur in Gestalt,
    // Stufe und Art: die Arena hält je Wirt (Bündel oder Szene) × Stoff-Schlüssel (`_arenaSchluessel`: Attribut-Form,
    // Schichten, Wurf, jeder Regler, Knoten und Stoff-Wert — die Art-Größen des Winds trägt die Instanz) die Instanz-Größen
    // ihrer Glieder in Blöcken (erste Instanz) und die Matrizen in EINEM Speicher-Puffer, den der EINE Instanz-Knoten
    // (`_senkenKnoten`) liest. Die Gestalten liegen im LAGER ihrer Vertex-Form (je Szene EIN Vertex- und Index-Puffer, Basis-
    // Vertex und erster Index je Gestalt), das jede Arena dieser Form teilt: eine Gestalt liegt EINMAL auf der GPU, gleich wie
    // viele Bündel sie zeichnen, und ihre Quelle verlässt die GPU (der Kehraus, `_gpuKehraus`: eine Senke in der Arena
    // zeichnet nicht). Befund 16.10. (Prüfung, Genesis Third): je Bündel eine eigene Kopie, die Quelle blieb — VRAM 69,8 →
    // 73,2 MB. Je Pass schreibt die Arena aus der EINEN Wahl der CPU (`count` der Senke, Sicht und Frustum wie r184) die
    // Zeichen-Aufträge (5 uint: Indizes · Instanzen · erster Index · Basis-Vertex · erste Instanz) in den Abschnitt DIESER
    // Kamera ihres EINEN Auftrags-Puffers (der Schatten-Render läuft verschachtelt mitten im Hauptbild), und r184 gibt sie aus
    // EINEM Render-Objekt als N drawIndexedIndirect aus (backend `_draw`: `getIndirectOffset` als Liste — vendor
    // three.webgpu.min.js gelesen). Die Wahl bleibt die EINE der CPU (`_passTrifft`): ein Cull-Compute wäre ihr Zwilling und
    // trüge nach dem Profil höchstens ihre 0,147 / 0,142 ms (Genesis Third / Wiese Ego). Die erste Instanz eines indirekten
    // Zugs braucht `indirect-first-instance`; ohne das Merkmal (WebGL2) zeichnet jede Senke über ihren Zeichner, und die Arena
    // meldet sich einmal laut ab (`__arenaOhne`, gate:webgl-probe W3). Ein Wurf in ihrem Takt ist ein BRUCH (`_bruchMelden`):
    // sie gibt jedes Glied seinem Zeichner zurück und nimmt keines mehr (`__arenaBruch`) — r184 bliebe nach einem Wurf
    // mitten im Render stehen.
    // DIE ARENA LEBT IN DER WELT-SZENE: ihr Takt (`_arenaTakt`) ordnet Lager und Glieder; eine Szene ohne ihn (eine Bühne, die
    // Prüfbühne einer Linse) zeichnet über die Zeichner. Befund 16.10. (gate:kamera-treue SENKE 0,9562 seit 328ae617): in der
    // Bühne der Linse nahm die Arena die Senken, ihr Lager baute nie — die Senken fehlten im Bild.
    static _arenaNimmt(m, renderer) {
        if (m.__arena || !m.__zeichner || !AnazhRealm._arenaKann(renderer)) return;
        let w = m;
        while (w.parent) w = w.parent;
        const welt = globalThis.anazhRealm;
        if (!welt || w !== welt.state.scene) return;
        const schl = AnazhRealm._arenaSchluessel(m);
        if (schl === null) return;
        // ein Bündel nimmt nur auf, wenn es sich ändert: einmal je Szene nimmt jedes neu auf — so kommt jede Senke an
        if (w.__arenaAn !== true) {
            w.__arenaAn = true;
            w.traverse((o) => {
                if (o.isBundleGroup) o.needsUpdate = true;
            });
        }
        // DIE ARENA IM BÜNDEL: eine Senke im Bündel zeichnet aus der Arena ihres Bündels — ihre Plätze nimmt das Bündel auf;
        // Zahl, Wahl und Matrizen schreibt danach der Takt (`_arenaTakt`) in ihre Puffer, das Bündel nimmt nur neu auf, wenn
        // die Plätze nicht reichen (bis G1 hieß jeder Wechsel der Wahl: das ganze Bündel neu aufnehmen, r184 backt die
        // Instanz-Zahl in den Zug)
        const wirt = m.parent && m.parent.isBundleGroup === true ? m.parent : w;
        const reg = AnazhRealm.__arenen || (AnazhRealm.__arenen = new Map());
        const k = wirt.uuid + "|" + schl;
        let a = reg.get(k);
        if (!a) {
            const K = AnazhRealm._arenaKlasse();
            a = new K(k, schl, m, K.lager(w, m.geometry), 0);
            a._imBuendel(wirt.isBundleGroup === true ? wirt : null);
            a._rend = renderer;
            reg.set(k, a);
        }
        if (a.parent !== wirt) wirt.add(a);
        a.nehmen(m);
    }
    // DER TAKT DER ARENEN — je Frame nach der Wahl des Hauptbilds (`_instanzWahlPass`), vor jedem Zug: die Bündel, deren
    // Aufnahme ein Wechsel mitten in ihr traf, nehmen neu auf; die gemeldeten Senken treten ein (`_arenaKommt`); jede Arena
    // gleicht ihre Glieder ab (wer ihren Wirt verließ, geht — und tritt im selben Takt in die Arena seines neuen Wirts), die
    // eines Bündels schreibt Blöcke und Aufträge ihrer aufgenommenen Plätze (ein Wurf ist ein Bruch).
    _arenaTakt() {
        const auf = AnazhRealm.__arenaAuf;
        if (auf && auf.size) {
            for (const b of auf) b.needsUpdate = true;
            auf.clear();
        }
        if (AnazhRealm.__arenaBruch) return;
        AnazhRealm.__arenaJetzt = performance.now();
        try {
            this._arenaKommt();
            const reg = AnazhRealm.__arenen;
            if (reg && reg.size) {
                for (const a of [...reg.values()]) a._takt(false); // ohne Arena (`__arenaOhne`) gibt sie alles zurück
                const neu = this._arenaKommt();
                if (neu) for (const a of neu) a._takt(false);
            }
            // Zog der Zeichner eines Glieds, bevor es eintrat (eine spät gehängte Senke, eine Rückkehr), liegen seine Matrizen
            // auf der GPU: sie verlassen sie jetzt — vor dem ersten Pass dieses Renders (`scene.onBeforeRender` vor
            // `beginRender`), jeder frühere Pass ist abgeschickt — und der Zeichner, dessen Render-Objekte sie banden, mit ihnen
            // (`_zeichnerFrisch`).
            const quelle = AnazhRealm.__quelleWeg;
            if (quelle && quelle.size) {
                for (const m of quelle)
                    if (m.__arena && this._gpuAbschied(m.instanceMatrix)) AnazhRealm._zeichnerFrisch(m);
                quelle.clear();
            }
            if (reg && reg.size) for (const a of [...reg.values()]) a._takt(true);
        } catch (e) {
            this._arenaBruch(e);
        }
    }
    // DER EINTRITT IM TAKT (G1): jede neue oder zurückgekehrte Senke (`_arenaMelden`) tritt vor dem ersten Pass des Frames in
    // die Arena ihres Stoffs — ihr Zeichner zieht nie, ihre Matrizen betreten die GPU nie. Bis 16.10. trat sie im Zug ihres
    // Zeichners ein (`onBeforeRender`): er hatte sie eben hochgeladen, ihr Abschied traf Bindegruppen, die noch zogen
    // (G1-n2/diag8: „used in submit while destroyed", 4 je Boot). Das ist der EINE Eintritt: ein Zeichner, der zieht, meldet
    // seine Senke nur (`onBeforeRender`). Auch eine verborgene tritt ein (die Sicht urteilt die Arena je Pass, `_sichtbar`) —
    // sonst zöge ihr Zeichner, sobald ihre Region in den Blick kommt. Wer in keiner Szene hängt, wartet 120 Takte (zieht er
    // danach, meldet er sich neu); wer in einer fremden hängt (eine Bühne), bleibt beim Zeichner. Die Arenen, die Glieder
    // nahmen, gehen zurück (ihr Takt ordnet sie).
    static _arenaMelden(m) {
        if (m.__arena || AnazhRealm.__arenaOhne || AnazhRealm.__arenaBruch) return;
        (AnazhRealm.__arenaKommt || (AnazhRealm.__arenaKommt = new Map())).set(m, 0);
    }
    _arenaKommt() {
        const k = AnazhRealm.__arenaKommt;
        if (!k || k.size === 0) return null;
        const rend = this.state.renderer,
            szene = this.state.scene;
        if (!AnazhRealm._arenaKann(rend)) return void k.clear();
        let neu = null;
        for (const [m, t] of k) {
            if (m.__arena || !m.__zeichner) {
                k.delete(m);
                continue;
            }
            let w = m;
            while (w.parent) w = w.parent;
            if (w !== szene) {
                if (w.isScene || t >= 120) k.delete(m);
                else k.set(m, t + 1);
                continue;
            }
            k.delete(m);
            AnazhRealm._arenaNimmt(m, rend);
            if (m.__arena) (neu || (neu = new Set())).add(m.__arena);
        }
        return neu;
    }
    // DER ZUG EINER ARENA (ihr `onBeforeRender`): Glieder abgleichen, den Abschnitt des Passes wählen, die Aufträge
    // schreiben — ein Wurf hier ließe r184 mitten im Render stehen: er wird zum lauten Bruch, der Pass zeichnet nichts.
    _arenaZug(a, renderer, camera) {
        a._rend = renderer;
        a._stapel.push(null);
        try {
            if (!a._ordnen(renderer, false)) return;
            // nimmt ein Bündel die Arena auf, legt sie ihre Plätze fest (der Takt schreibt danach ihre Aufträge)
            const auf = a._fest && !!renderer._currentRenderBundle;
            const zug = a._zugFuer(camera, auf);
            a._auftraege(zug, auf ? null : camera, renderer, auf);
            a._stapel[a._stapel.length - 1] = zug;
        } catch (e) {
            this._arenaBruch(e);
        }
    }
    static _arenaKann(renderer) {
        if (AnazhRealm.__arenaOhne || AnazhRealm.__arenaBruch) return false;
        const be = renderer && renderer.backend;
        if (!be) return false;
        if (be.device && be.device.features && be.device.features.has("indirect-first-instance")) return true;
        AnazhRealm.__arenaOhne = be.isWebGLBackend ? "WebGL2" : "ohne indirect-first-instance";
        console.warn("DIE GEOMETRIE-ARENA: " + AnazhRealm.__arenaOhne + " — jede Senke zeichnet über ihren Zeichner");
        return false;
    }
    // Der Stoff-Schlüssel einer Senke — null, wo die Arena sie nicht tragen kann (verschränkte Puffer, Morph, Stoff-Reihe);
    // das Nein gilt, bis Geometrie oder Stoff wechseln: kein Zug baut seine Zeichenketten neu.
    static _arenaSchluessel(m) {
        const geo = m.geometry,
            s = m.material,
            nein = m.__arenaNein;
        if (nein && nein.geo === geo && nein.s === s && nein.v === (s && s.version)) return null;
        let form = s && s.isNodeMaterial === true ? AnazhRealm._arenaForm(geo, true) : null;
        if (form === null) {
            m.__arenaNein = { geo, s, v: s && s.version };
            return null;
        }
        if (m.instanceColor) form += "farbe:" + m.instanceColor.itemSize;
        return [form, m.layers.mask, m.castShadow, m.receiveShadow, m.renderOrder, AnazhRealm._arenaStoff(s)].join("|");
    }
    // Die Attribut-Form einer Geometrie, mit oder ohne Instanz-Größen — null: keine Geometrie, Morph oder verschränkt.
    static _arenaForm(geo, mitInstanz) {
        if (!geo || (geo.morphAttributes && Object.keys(geo.morphAttributes).length)) return null;
        let form = "";
        for (const k of Object.keys(geo.attributes).sort()) {
            const a = geo.attributes[k];
            if (a.isInterleavedBufferAttribute || !a.array) return null;
            if (a.isInstancedBufferAttribute && !mitInstanz) continue;
            const t = a.array.constructor.name;
            form += k + ":" + a.itemSize + t + (a.normalized ? "n" : "") + (a.isInstancedBufferAttribute ? "I," : ",");
        }
        return form;
    }
    // Der Stoff als Wert: jede Eigenschaft (Knoten als id, Texturen als uuid, Funktionen über den Programm-Schlüssel des
    // Stoffs), die Stoff-Werte bis auf die Art-Größen des Winds — gemerkt je Stoff-Version.
    static _arenaStoff(s) {
        if (s.__arenaStoff && s.__arenaStoffV === s.version) return s.__arenaStoff;
        const J = AnazhRealm._arenaWert;
        let t = s.type + ";a" + s.alphaTest + ";p" + s.customProgramCacheKey();
        for (const k of Object.keys(s).sort()) {
            if (k.startsWith("__") || k === "_listeners" || k.startsWith("_anazh") || k === "uuid" || k === "id")
                continue;
            if (k === "name" || k === "version" || k === "userData" || typeof s[k] === "function") continue;
            t += ";" + k + "=" + J(s[k], 0);
        }
        const ud = Object.assign({}, s.userData);
        delete ud.windArt;
        delete ud.baumWind;
        s.__arenaStoff = t + ";ud" + J(ud, 0);
        s.__arenaStoffV = s.version;
        return s.__arenaStoff;
    }
    static _arenaWert(v, tiefe) {
        if (v === null || v === undefined) return "";
        const t = typeof v;
        if (t !== "object") return t === "function" ? "fn" : String(v);
        if (v.isNode) return "#" + v.id;
        if (v.isTexture || v.isObject3D || v.isMaterial || v.isBufferGeometry) return "@" + v.uuid;
        if (v.isColor) return "c" + v.getHexString();
        if (ArrayBuffer.isView(v)) return "[" + Array.prototype.slice.call(v, 0, 32).join(",") + "]";
        if (tiefe > 5) return "…";
        let r = Array.isArray(v) ? "[" : "{";
        for (const k of Array.isArray(v) ? v.keys() : Object.keys(v).sort())
            r += k + ":" + AnazhRealm._arenaWert(v[k], tiefe + 1) + ",";
        return r + (Array.isArray(v) ? "]" : "}");
    }
    // DER BRUCH DER ARENA: jeder Pfad meldet über den EINEN Melder (`_bruchMelden`), der erste gibt jedes Glied zurück
    _arenaBruch(e) {
        const text = "DIE GEOMETRIE-ARENA BRICHT: " + String((e && e.stack) || e).slice(0, 500);
        this._bruchMelden(text);
        if (AnazhRealm.__arenaBruch) return;
        AnazhRealm.__arenaBruch = text;
        for (const a of [...(AnazhRealm.__arenen || new Map()).values()])
            for (const m of a.glieder.slice()) a.lassen(m, true);
    }
    // Der Knoten der Art-Größen des Winds: trägt die Geometrie `aWindArt` (die Arena — dort die Marke ihres Speicher-Puffers,
    // nie ein gelesenes Attribut), liest er den Puffer je Instanz (`_senkenKnoten().windArt`), sonst den Stoff-Wert — EIN Wert
    // (der Stoff trägt ihn), zwei Wege dorthin, je Programm beim Bau entschieden.
    static _windArtKnoten(stoff) {
        if (!AnazhRealm.__windArtK) {
            const N = Object.getPrototypeOf(THREE.InstanceNode);
            AnazhRealm.__windArtK = class WindArt extends N {
                constructor(q) {
                    super("vec3");
                    this.stoffWert = q;
                }
                setup(builder) {
                    return builder.hasGeometryAttribute("aWindArt")
                        ? AnazhRealm._senkenKnoten().windArt
                        : this.stoffWert;
                }
            };
        }
        return THREE.TSL.nodeObject(new AnazhRealm.__windArtK(stoff));
    }
    static _arenaKlasse() {
        if (AnazhRealm.__arenaK) return AnazhRealm.__arenaK;
        const T = THREE;
        const IND = T.StorageInstancedBufferAttribute; // r184 legt jeden Puffer als Auftrags-Puffer an (`createIndirectStorageAttribute`)
        const fr = new T.Frustum(),
            pm = new T.Matrix4(),
            kugel = new T.Sphere();
        const EINS = new T.Matrix4().elements;
        const istEins = (e) => {
            for (let i = 0; i < 16; i++) if (e[i] !== EINS[i]) return false;
            return true;
        };
        // o[oi..] = a × b[bi..] (spaltenweise, wie three)
        const mal = (o, oi, a, b, bi) => {
            for (let c = 0; c < 4; c++) {
                const b0 = b[bi + c * 4],
                    b1 = b[bi + c * 4 + 1],
                    b2 = b[bi + c * 4 + 2],
                    b3 = b[bi + c * 4 + 3];
                for (let r = 0; r < 4; r++)
                    o[oi + c * 4 + r] = a[r] * b0 + a[4 + r] * b1 + a[8 + r] * b2 + a[12 + r] * b3;
            }
        };
        const vier = (n) => Math.ceil(n / 4) * 4; // jede Puffer-Länge ein Vielfaches von 4 Bytes (writeBuffer)
        // DIE RESIDENZ FOLGT DEM BILD — auch in der Arena (Lehre 27, das Gesetz des Kehraus `_gpuKehraus`): sie hält eine
        // Gestalt, solange ein Glied sie mit Instanzen trägt, und einen Instanz-Platz je Instanz, die ein Glied zieht —
        // GPU_KEHRAUS_MS über das letzte Mal hinaus, dann wird ihr Platz frei. Befund 16.10. (Prüfung Runde 2 und Messung
        // G1-n2/vorher, Radeon, EINE Welt): die Arena hielt das 1,64- bis 2,07-Fache der Quellen, die der Kehraus freigab —
        // VRAM gegen A ohne Arena +1,3 bis +3,3 MB. Die Klasse: der Index immer 32 bit (Wiese 0,60 statt 0,27 MB), ein Viertel
        // Reserve und bis zu einem Viertel Brache im Lager, die Gestalten jeder je genommenen Senke (nach der Reise Genesis
        // 3,21 → 6,67 MB), die Instanz-Seite nach der Kapazität der Senken ×1,25 (Wiese 0,63 MB für 2 800 gezogene Instanzen)
        // — und die Matrizen jeder Quelle blieben daneben auf der GPU (0,49–0,51 MB). Der Platz-Raum (`raumNimm`/`raumGib`)
        // ist der EINE Verwalter beider Seiten; was frei wird, nimmt erst der nächste Takt (`spaet`): ein offener Pass (das
        // Hauptbild um den verschachtelten Schatten-Render) liest den alten Inhalt noch.
        const raumNimm = (frei, n) => {
            for (let k = 0; k < frei.length; k += 2) {
                if (frei[k + 1] < n) continue;
                const s = frei[k];
                if (frei[k + 1] === n) frei.splice(k, 2);
                else {
                    frei[k] += n;
                    frei[k + 1] -= n;
                }
                return s;
            }
            return -1;
        };
        const raumGib = (frei, s, n) => {
            let k = 0;
            while (k < frei.length && frei[k] < s) k += 2;
            frei.splice(k, 0, s, n);
            if (k + 2 < frei.length && s + n === frei[k + 2]) {
                frei[k + 1] += frei[k + 3];
                frei.splice(k + 2, 2);
            }
            if (k > 0 && frei[k - 2] + frei[k - 1] === s) {
                frei[k - 1] += frei[k + 1];
                frei.splice(k, 2);
            }
        };
        const raumSpaet = (frei, spaet) => {
            for (let k = 0; k < spaet.length; k += 2) raumGib(frei, spaet[k], spaet[k + 1]);
            spaet.length = 0;
        };
        // der Block eines Glieds: seine Zahl und ein Viertel darüber (eine Senke wächst Instanz um Instanz)
        const platz = (n) => (n > 0 ? vier(n + (n >> 2) + 4) : 0);
        // DIE QUELLE VERLÄSST DIE GPU: zog der Zeichner eines Glieds, bevor es eintrat, fallen seine Matrizen im Takt des
        // Eintritts (`_arenaTakt`) mit ihm (`_zeichnerFrisch`); jedes Bündel, das ihn trug, nimmt neu auf (`_arenaBuendel`).
        const quelleWeg = (m) => (AnazhRealm.__quelleWeg || (AnazhRealm.__quelleWeg = new Set())).add(m);
        // in die Warteschlange vor dem Submit dieses Passes; ohne GPU-Puffer lädt r184 beim ersten Zug das ganze Array
        const schreib = (rend, a, start, n) => {
            const be = rend && rend.backend;
            if (!be || !be.device || !a || n <= 0 || !rend._attributes.has(a)) return;
            const d = be.get(a);
            if (!d.buffer) return;
            const bpe = a.array.BYTES_PER_ELEMENT;
            const s = Math.floor((start * bpe) / 4) * 4,
                e = Math.min(vier((start + n) * bpe), a.array.byteLength);
            be.device.queue.writeBuffer(d.buffer, s, a.array.buffer, a.array.byteOffset + s, e - s);
        };
        // ein Puffer fällt erst nach dem Submit des Frames: ein offener Pass (das Hauptbild um den verschachtelten
        // Schatten-Render) trägt ihn noch in seinem Kommando-Paket („used in submit while destroyed")
        const weg = (rend, a) => {
            const A = rend && rend._attributes;
            if (!a || !A || !A.has(a)) return;
            const w = AnazhRealm.__arenaWeg || (AnazhRealm.__arenaWeg = []);
            if (w.push({ A, a }) === 1)
                setTimeout(() => {
                    AnazhRealm.__arenaWeg = null;
                    for (const x of w) if (x.A.has(x.a)) x.A.delete(x.a);
                }, 0);
        };
        // der Stand einer Gestalt — ohne die Sprünge ihres GPU-Abschieds (`_gpuAbschied` hebt die Version, der Inhalt bleibt)
        const stand = (g) => {
            const v = (a) => (a ? a.version - (a.__abschiede | 0) : 0);
            return v(g.attributes.position) * 65536 + v(g.index);
        };
        // DAS LAGER einer Vertex-Form in einer Szene: die Gestalten aller Arenen dieser Form in EINEM Vertex- und Index-Puffer.
        // Eine Gestalt liegt, solange ein Glied sie mit Instanzen trägt (`halten`, gestempelt im Takt und in jedem Zug), in der
        // ersten freien Strecke, die passt; GPU_KEHRAUS_MS nach dem letzten Stempel räumt sie ihre Strecken. Reicht keine
        // Strecke oder liegt mehr als ein Achtel frei, baut der Takt das Lager neu — so groß wie seine liegenden Gestalten und
        // ein Sechzehntel —, und jede Arena zeigt ihre Geometrie im selben Takt darauf (`_geoNeu`, ihr Bündel nimmt neu auf),
        // bevor die alten Puffer fallen; nie in einem Pass (r184 zeichnet ihn mit der Geometrie, die er projizierte). Der Index
        // ist schmal (16 bit), solange keine Gestalt mehr als 65 536 Vertices trägt: jede zieht mit ihrem Basis-Vertex, ihre
        // Indizes bleiben ihre eigenen (die Foundry liefert sie so, `_schmalerIndex`; r184 bindet das Format nach dem Typ).
        class Lager {
            constructor(key) {
                this.key = key;
                this.gestalten = new Map(); // Positions-Id:Index-Id → { geo, bv, fi, nv, ni, nutzer, stand, zuletzt }
                this.attr = null;
                this.index = null;
                this.vCap = this.iCap = this.liegt = this.iLiegt = 0;
                this.vFrei = [];
                this.iFrei = [];
                this.spaet = []; // geräumte Strecken [Vertex-Anfang, Länge, Index-Anfang, Länge, …] bis zum nächsten Takt
                this.neu = true;
                this.taktT = -1;
                this.arenen = new Set();
                this.rend = null;
            }
            nehmen(g) {
                const p = g.attributes.position;
                const key = p.id + ":" + (g.index ? g.index.id : -1);
                const b = this.gestalten.get(key);
                if (b) b.nutzer++;
                else {
                    const nv = p.count;
                    this.gestalten.set(key, {
                        geo: g,
                        bv: -1,
                        fi: -1,
                        nv,
                        ni: g.index ? g.index.count : nv,
                        nutzer: 1,
                        stand: stand(g),
                        zuletzt: -Infinity,
                    });
                }
                return key;
            }
            lassen(key) {
                const b = this.gestalten.get(key);
                if (!b || --b.nutzer > 0) return;
                this.gestalten.delete(key);
                this.raeumen(b);
            }
            raeumen(b) {
                if (b.bv < 0) return;
                this.spaet.push(b.bv, b.nv, b.fi, b.ni);
                this.liegt -= b.nv;
                this.iLiegt -= b.ni;
                b.bv = b.fi = -1;
            }
            // ein Glied mit Instanzen zieht die Gestalt: sie liegt (oder legt sich in die erste freie Strecke, die passt);
            // false — kein Platz, der nächste Takt baut neu
            halten(b, jetzt) {
                b.zuletzt = jetzt;
                if (b.bv >= 0) return true;
                if (this.attr && (b.nv <= 65536 || this.index.array instanceof Uint32Array)) {
                    const bv = raumNimm(this.vFrei, b.nv);
                    const fi = bv < 0 ? -1 : raumNimm(this.iFrei, b.ni);
                    if (fi >= 0) {
                        b.bv = bv;
                        b.fi = fi;
                        this.liegt += b.nv;
                        this.iLiegt += b.ni;
                        this.kopie(b);
                        return true;
                    }
                    if (bv >= 0) raumGib(this.vFrei, bv, b.nv);
                }
                this.neu = true;
                return false;
            }
            // im Takt (vor jedem Pass des Frames), einmal je Frame: räumen, was GPU_KEHRAUS_MS kein Glied zog, und die Strecken
            // des letzten Frames freigeben
            takt(rend, jetzt) {
                this.rend = rend;
                if (this.taktT === jetzt) return;
                this.taktT = jetzt;
                const grenze = jetzt - AnazhRealm.GPU_KEHRAUS_MS;
                for (const b of this.gestalten.values()) if (b.bv >= 0 && b.zuletzt < grenze) this.raeumen(b);
                for (let k = 0; k < this.spaet.length; k += 4) {
                    raumGib(this.vFrei, this.spaet[k], this.spaet[k + 1]);
                    raumGib(this.iFrei, this.spaet[k + 2], this.spaet[k + 3]);
                }
                this.spaet.length = 0;
            }
            // im Takt, nachdem die Glieder ihre Gestalten hielten: neu bauen, wenn der Platz nicht reichte oder mehr als ein
            // Achtel frei liegt
            ordnen(jetzt) {
                const brach =
                    this.vCap - this.liegt > (this.vCap >> 3) + 256 || this.iCap - this.iLiegt > (this.iCap >> 3) + 768;
                if ((this.neu || brach) && this.gestalten.size > 0) this.bauen(jetzt - AnazhRealm.GPU_KEHRAUS_MS);
            }
            kopie(b) {
                const q = b.geo;
                for (const k in this.attr) {
                    const a = this.attr[k];
                    a.array.set(q.attributes[k].array.subarray(0, b.nv * a.itemSize), b.bv * a.itemSize);
                    schreib(this.rend, a, b.bv * a.itemSize, b.nv * a.itemSize);
                }
                const ix = this.index.array;
                if (q.index) ix.set(q.index.array.subarray(0, b.ni), b.fi);
                else for (let i = 0; i < b.ni; i++) ix[b.fi + i] = i;
                schreib(this.rend, this.index, b.fi, b.ni);
            }
            bauen(grenze) {
                const altA = this.attr || {},
                    altI = this.index;
                let nv = 0,
                    ni = 0,
                    v0 = null,
                    breit = false;
                for (const b of this.gestalten.values()) {
                    v0 = v0 || b.geo;
                    b.bv = b.fi = -1;
                    if (b.zuletzt < grenze) continue;
                    nv += b.nv;
                    ni += b.ni;
                    if (b.nv > 65536) breit = true;
                }
                this.vCap = vier(nv + (nv >> 4) + 64);
                this.iCap = vier(ni + (ni >> 4) + 192);
                this.attr = {};
                for (const k in v0.attributes) {
                    const a = v0.attributes[k];
                    if (a.isInstancedBufferAttribute) continue;
                    const arr = new a.array.constructor(this.vCap * a.itemSize);
                    this.attr[k] = new T.BufferAttribute(arr, a.itemSize, a.normalized);
                }
                this.index = new T.BufferAttribute(breit ? new Uint32Array(this.iCap) : new Uint16Array(this.iCap), 1);
                this.vFrei = [0, this.vCap];
                this.iFrei = [0, this.iCap];
                this.spaet.length = 0;
                this.liegt = this.iLiegt = 0;
                this.neu = false;
                for (const b of this.gestalten.values()) if (b.zuletzt >= grenze) this.halten(b, b.zuletzt);
                AnazhRealm.__lagerBau = (AnazhRealm.__lagerBau | 0) + 1;
                // eine Arena ohne Instanz-Seite legt sie in ihrem eigenen Ordnen an, nach den Blöcken ihrer Glieder
                for (const a of this.arenen) if (a.__instanzQuelle.instanceMatrix) a._geoNeu();
                for (const k in altA) weg(this.rend, altA[k]);
                weg(this.rend, altI);
            }
            fallen() {
                const L = AnazhRealm.__lager;
                if (L && L.get(this.key) === this) L.delete(this.key);
                for (const k in this.attr || {}) weg(this.rend, this.attr[k]);
                weg(this.rend, this.index);
            }
        }
        class GeometrieArena extends T.Mesh {
            // das Lager der Vertex-Form einer Geometrie in ihrer Szene (`_arenaForm` ohne Instanz-Größen)
            static lager(szene, geo) {
                const L = AnazhRealm.__lager || (AnazhRealm.__lager = new Map());
                const key = szene.uuid + "|" + AnazhRealm._arenaForm(geo, false);
                let l = L.get(key);
                if (!l) L.set(key, (l = new Lager(key)));
                return l;
            }
            constructor(key, schl, m, lager, nCap) {
                super(new T.InstancedBufferGeometry(), m.material);
                this.name = "geometrie-arena";
                this.isInstanzZeichner = true;
                this.isGeometrieArena = true;
                this.__key = key;
                this.__schl = schl;
                this.__instanzQuelle = { isInstancedMesh: true, instanceMatrix: null, instanceColor: null, count: 0 };
                this.__instanzQuelle.matrixWorld = this.matrixWorld;
                this.layers.mask = m.layers.mask;
                this.castShadow = m.castShadow;
                this.receiveShadow = m.receiveShadow;
                this.renderOrder = m.renderOrder;
                this.frustumCulled = false;
                this.matrixAutoUpdate = false;
                this.matrixWorldAutoUpdate = false;
                this._wind = !!(m.material.userData && m.material.userData.windArt);
                this._marke = m.__zeichner.__fassade.attributes.aInstanzSenke;
                this._lager = lager;
                lager.arenen.add(this);
                this.glieder = [];
                // die Instanz-Seite: je Glied ein Block nach seiner Zahl (`_blockFuer`) im Platz-Raum; vor dem ersten Zug wächst
                // sie frei, danach folgt eine Arena (`_folgen`), wenn der Platz nicht reicht oder mehr als die Hälfte frei liegt
                this._nCap = vier(nCap);
                this._nFrei = this._nCap > 0 ? [0, this._nCap] : [];
                this._nSpaet = [];
                this._nBelegt = 0;
                // die Senken ohne Platz auf der Instanz-Seite: ihnen folgt eine größere Arena (`_folgen`), einmal gezählt
                this._wartend = new Set();
                // die Glieder mit Instanzen: ohne eines betritt die Arena keinen Pass (die Instanz-Zahl zaehlt mit)
                this._lebend = 0;
                // DER EINE AUFTRAGS-PUFFER (`_ind`): je Pass-Kamera (lose) und je aufnehmender Kamera (Bündel) ein Abschnitt
                this._ind = null;
                this._segCap = this._segZahl = this._segN = 0;
                this._segFrei = [];
                this._zuege = new Map(); // Kamera → Zug { seg, arr, offs, zuege, tri, plaetze } — je Pass neu geschrieben
                this._zuegeB = new Map(); // Kamera → der Zug, den ein Bündel aufnahm (seine Plätze schreibt der Takt)
                this.__buendel = null;
                this._fest = false;
                this._stapel = [];
                this._rend = null;
                this._folgt = false;
                this._fassade(this.geometry);
            }
            // r184 liest Auftrags-Puffer, Versätze und Zahl am Zug: den EINEN Puffer, die Versätze des Passes, der gerade zeichnet
            _fassade(g) {
                const a = this;
                const jetzt = () => a._stapel[a._stapel.length - 1] || null;
                delete g.indirect;
                delete g.indirectOffset;
                delete g.instanceCount;
                Object.defineProperties(g, {
                    indirect: { get: () => a._ind, set: () => {}, configurable: true },
                    indirectOffset: { get: () => (jetzt() ? jetzt().offs : 0), set: () => {}, configurable: true },
                    instanceCount: {
                        get: () => (jetzt() && jetzt().offs.length ? 1 : 0),
                        set: () => {},
                        configurable: true,
                    },
                });
                g.setDrawRange(0, 3); // r184 bucht EINEN Zug mit einem Dreieck; den Rest bucht `onAfterRender`
                g.boundingSphere = new T.Sphere(new T.Vector3(), Infinity);
            }
            nehmen(m) {
                // nach dem ersten Zug wächst die Instanz-Seite nicht mehr: reicht ihr Platz nicht, folgt eine Arena mit Platz
                // für den Bedarf
                if (this.__instanzQuelle.instanceMatrix && !this._nPasst(platz(m.count | 0))) {
                    this._wartend.add(m);
                    return void this._folgen();
                }
                this._wartend.delete(m);
                // die Glieder zeichnen nach ihrer Stufe (die nahe zuerst schreibt die Tiefe, `_buendelKinderReihe`)
                const stufe = (o) =>
                    o.userData && Number.isFinite(o.userData.buendelStufe) ? o.userData.buendelStufe : 0;
                let i = this.glieder.length;
                while (i > 0 && stufe(this.glieder[i - 1]) > stufe(m)) i--;
                this.glieder.splice(i, 0, m);
                this.userData.buendelStufe = stufe(this.glieder[0]);
                m.__arena = this;
                m.__arenaZ = {
                    mat: m.material,
                    mv: m.material.version,
                    farbe: !!m.instanceColor,
                    mw: new Float32Array(16),
                    im: m.instanceMatrix,
                    erst: -1, // der Block auf der Instanz-Seite (`_blockFuer`)
                    cap: 0,
                    n: -1,
                    stempel: [],
                    spitze: 0, // die größte Zahl dieses und des letzten Fensters (GPU_KEHRAUS_MS)
                    spitzeVor: 0,
                    spitzeT: AnazhRealm.__arenaJetzt || 0,
                };
                m.__arenaZ.mw[0] = NaN;
                if ((m.count | 0) > 0) this._lebend++;
                this._sicht();
                this._gestaltNehmen(m);
                if (m.__zeichner.parent === m) m.remove(m.__zeichner); // die Senke zeichnet nicht mehr selbst
                quelleWeg(m);
                // das Bündel nimmt neu auf: es trug den Zeichner (auch wenn es gerade aufnimmt — `_neuAuf`)
                AnazhRealm._arenaBuendel(m);
                this._neuAuf();
            }
            lassen(m, zurueck) {
                const i = this.glieder.indexOf(m);
                if (i < 0) return;
                this.glieder.splice(i, 1);
                const za = m.__arenaZ;
                this._lager.lassen(za.gestalt);
                if (za.erst >= 0) {
                    this._nSpaet.push(za.erst, za.cap);
                    this._nBelegt -= za.cap;
                }
                if ((m.count | 0) > 0) this._lebend--;
                this._sicht();
                // seine Plätze ziehen ab jetzt nichts (der nächste Takt verdichtet sie) — kein Frame zeigt ein gegangenes Glied
                for (const z of [...this._zuege.values(), ...this._zuegeB.values()]) {
                    const j = z.zuege.indexOf(m);
                    if (j < 0) continue;
                    z.zuege[j] = this;
                    z.arr[j * 5 + 1] = 0;
                    schreib(this._rend, this._ind, z.seg * this._segCap * 5 + j * 5 + 1, 1);
                }
                m.__arena = null;
                m.__arenaZ = null;
                if (zurueck && m.__zeichner && m.__zeichner.parent !== m) {
                    m.add(m.__zeichner);
                    AnazhRealm._arenaBuendel(m);
                    this._neuAuf();
                    AnazhRealm._arenaMelden(m); // im nächsten Takt in die Arena ihres (neuen) Wirts
                }
                if (this.glieder.length === 0) this._fallen();
            }
            // Im Bündel (`__buendel`) nimmt es die Arena auf; zeichnet sie im Hauptbild (Ebene 0), bleibt sie sichtbar, solange
            // sie Glieder trägt — ein Wechsel der Sicht nähme das Bündel neu auf. Sonst betritt sie nur einen Pass, in dem ein
            // Glied Instanzen zählt (die Instanz-Zahl zählt mit, `_instanzZahl`).
            _imBuendel(b) {
                this.__buendel = b;
                this._fest = !!b && (this.layers.mask & 1) !== 0;
                // die Werfer-Wahl je Kaskade urteilt über die Glieder (ihre Sicht liest `_sichtbar`), nie über die Arena
                if (b)
                    this.userData._werferKind = new T.Box3(
                        new T.Vector3(-1e7, -1e7, -1e7),
                        new T.Vector3(1e7, 1e7, 1e7)
                    );
            }
            _sicht() {
                this.visible = this._fest ? this.glieder.length > 0 : this._lebend > 0;
            }
            // Das Bündel nimmt neu auf — sofort und im nächsten Takt (`_arenaTakt`, auch wenn die Arena dabei fällt): r184 merkt
            // sich am Ende einer Aufnahme die Version des Bündels, ein Wechsel MITTEN in ihr ginge sonst unter.
            _neuAuf() {
                const b = this.__buendel;
                if (!b) return;
                b.needsUpdate = true;
                (AnazhRealm.__arenaAuf || (AnazhRealm.__arenaAuf = new Set())).add(b);
            }
            // der Takt (`_arenaTakt`): Glieder abgleichen; die aufgenommenen Plätze lesen Zahl, Wahl und Matrizen von JETZT
            // in zwei Gängen über alle Arenen (`_arenaTakt`): erst ordnen jede ihre Glieder und ihr Lager (ein Neubau zeigt jede
            // Arena des Lagers neu), dann schreiben die Bündel-Arenen ihre Aufträge — auf die Lage, die dieser Frame zeichnet
            _takt(auftraege) {
                if (!this._rend) return;
                if (!auftraege) return void (this._bereit = this._ordnen(this._rend, true));
                if (this._bereit && this.glieder.length)
                    for (const z of this._zuegeB.values()) this._auftraege(z, null, this._rend, false);
            }
            // DER ABSCHIED: durch das Bündel (`_archBundleSceneRemove`) — wird es leer, verlässt es mit seinem Verdeckungs-
            // Proxy Szene und Register. Befund 16.10. (Prüfung, Reise Wiese → Dorf): die Arena nahm sich still aus ihrem
            // Bündel, das leere Bündel blieb samt Proxy in Szene und `_regionBundles` (1 → 5 leer, ohne Arena 0).
            _fallen() {
                const reg = AnazhRealm.__arenen;
                if (reg && reg.get(this.__key) === this) reg.delete(this.__key);
                const p = this.parent,
                    welt = globalThis.anazhRealm,
                    B = welt && welt.state._regionBundles;
                if (p && p.isBundleGroup && B && B.get(p.userData.regionKey) === p) welt._archBundleSceneRemove(this);
                else if (p) p.remove(this);
                this._neuAuf();
                this._lager.arenen.delete(this);
                if (this._lager.arenen.size === 0) this._lager.fallen();
                // die Instanz-Seite und der Auftrags-Puffer gehören ihr, die Vertex-Puffer dem Lager
                const G = this.geometry.attributes;
                for (const k in G) if (G[k].isInstancedBufferAttribute) weg(this._rend, G[k]);
                weg(this._rend, this.__instanzQuelle.instanceMatrix);
                weg(this._rend, this._ind);
                this._zuege.clear();
                this._zuegeB.clear();
                // ihre Bindegruppen (Uniform-Puffer) fallen nach dem Submit des Frames, wie jeder Puffer der Arena
                setTimeout(() => AnazhRealm._renderObjekteLoesen(this), 0);
            }
            _gestaltNehmen(m) {
                const g = m.geometry,
                    z = m.__arenaZ;
                z.geo = g;
                z.pos = g.attributes.position;
                z.idx = g.index;
                z.gestalt = this._lager.nehmen(g);
            }
            // die Geometrie der Arena: die Puffer ihres Lagers, die Marke des Zeichners und ihre Instanz-Seite
            _geoNeu() {
                const L = this._lager;
                if (!this.glieder.length || !L.attr) return;
                const alt = this.geometry,
                    g = new T.InstancedBufferGeometry();
                for (const k in L.attr) g.setAttribute(k, L.attr[k]);
                g.setAttribute("aInstanzSenke", this._marke);
                this._instanzSeite(g, alt);
                g.setIndex(L.index);
                this._fassade(g);
                this.geometry = g;
                this._neuAuf(); // neue Vertex-/Index-Puffer
            }
            // DIE INSTANZ-SEITE: je Glied ein Block nach seiner Zahl (`_blockFuer`) — den Speicher-Puffer der Matrizen bindet
            // r184 in die Bindegruppe jedes Render-Objekts: die Arena tauscht ihn nie. Ein Block zieht um, wenn die Zahl über
            // ihn wächst oder er das Doppelte seines Bedarfs hält; sein alter Platz wird erst im nächsten Takt frei (ein offener
            // Pass zeichnet aus ihm). Reicht der Platz nicht oder liegt die Hälfte frei, folgt ihr nach dem Frame eine Arena
            // desselben Stoffs (`_folgen`). Beim Anlegen trägt sie über ihre Blöcke ein Achtel.
            _instanzSeite(g, alt) {
                const m0 = this.glieder[0],
                    q = this.__instanzQuelle;
                if (q.instanceMatrix) {
                    for (const k in alt.attributes)
                        if (alt.attributes[k].isInstancedBufferAttribute) g.setAttribute(k, alt.attributes[k]);
                    return;
                }
                const zu = vier((this._nBelegt >> 3) + 64) - (this._nCap - this._nBelegt);
                if (zu > 0) {
                    raumGib(this._nFrei, this._nCap, zu);
                    this._nCap += zu;
                }
                const neu = (k, a) =>
                    g.setAttribute(
                        k,
                        new T.InstancedBufferAttribute(
                            new a.array.constructor(this._nCap * a.itemSize),
                            a.itemSize,
                            a.normalized
                        )
                    );
                for (const k in m0.geometry.attributes)
                    if (m0.geometry.attributes[k].isInstancedBufferAttribute) neu(k, m0.geometry.attributes[k]);
                if (m0.instanceColor) neu("instanzFarbe", m0.instanceColor);
                q.instanceMatrix = new T.StorageInstancedBufferAttribute(new Float32Array(this._nCap * 16), 16);
                // die Art-Größen des Winds: ein Speicher-Puffer wie die Matrizen (`_senkenKnoten().windArt`), in der Geometrie
                // nur die Marke, die das Programm der Arena vom Programm des Zeichners trennt (kein Shader liest sie als Attribut)
                if (this._wind) {
                    q.windArt = new T.StorageInstancedBufferAttribute(new Float32Array(this._nCap * 4), 4);
                    g.setAttribute("aWindArt", q.windArt);
                }
            }
            _nPasst(n) {
                if (n <= 0 || !this.__instanzQuelle.instanceMatrix) return true;
                for (let k = 1; k < this._nFrei.length; k += 2) if (this._nFrei[k] >= n) return true;
                return false;
            }
            // Der Block eines Glieds folgt seiner Zahl über ein Fenster (die größte Zahl dieses und des letzten Fensters von
            // GPU_KEHRAUS_MS: die Wahl des Hauptbilds wechselt mit dem Blick, der Block nicht). false: kein Platz.
            _blockFuer(z, n, jetzt) {
                if (jetzt - z.spitzeT >= AnazhRealm.GPU_KEHRAUS_MS) {
                    z.spitzeVor = z.spitze;
                    z.spitze = 0;
                    z.spitzeT = jetzt;
                }
                if (n > z.spitze) z.spitze = n;
                const soll = platz(Math.max(z.spitze, z.spitzeVor));
                if (z.erst >= 0 ? n <= z.cap && z.cap <= 2 * soll : soll === 0) return true;
                if (z.erst >= 0) {
                    this._nSpaet.push(z.erst, z.cap);
                    this._nBelegt -= z.cap;
                    z.erst = -1;
                    z.cap = 0;
                    if (soll === 0) return true;
                }
                let e = raumNimm(this._nFrei, soll);
                // vor dem ersten Zug wächst die Instanz-Seite frei
                if (e < 0 && !this.__instanzQuelle.instanceMatrix) {
                    raumGib(this._nFrei, this._nCap, soll);
                    this._nCap += soll;
                    e = raumNimm(this._nFrei, soll);
                }
                if (e < 0) return false;
                z.erst = e;
                z.cap = soll;
                z.n = -1;
                z.stempel = [];
                this._nBelegt += soll;
                return true;
            }
            _folgen() {
                if (this._folgt) return;
                this._folgt = true;
                setTimeout(() => {
                    const reg = AnazhRealm.__arenen;
                    if (!reg || reg.get(this.__key) !== this || !this.parent || !this.glieder.length) return;
                    // der Bedarf: jedes Glied mit seinem Block, jede wartende Senke mit ihrer Zahl von JETZT — jede einmal gezählt,
                    // und ein Achtel darüber
                    let n = 0;
                    for (const m of this.glieder) n += Math.max(m.__arenaZ.cap, platz(m.count | 0));
                    for (const m of this._wartend) if (!m.__arena && m.parent) n += platz(m.count | 0);
                    this._wartend.clear();
                    AnazhRealm.__arenaFolgen = (AnazhRealm.__arenaFolgen | 0) + 1;
                    const a = new GeometrieArena(
                        this.__key,
                        this.__schl,
                        this.glieder[0],
                        this._lager,
                        n + (n >> 3) + 64
                    );
                    a._imBuendel(this.__buendel);
                    a._rend = this._rend;
                    reg.set(this.__key, a);
                    this.parent.add(a);
                    // die Gestalten bleiben im Lager: die Folgerin nimmt sie, bevor die Arena sie lässt
                    for (const m of this.glieder.splice(0)) {
                        const g = m.__arenaZ.gestalt;
                        m.__arena = null;
                        a.nehmen(m);
                        this._lager.lassen(g);
                    }
                    this._fallen();
                }, 0);
            }
            // Gehört das Glied noch hierher? 0 ja · 2 sein Stoff-Schlüssel wechselte (es geht in eine andere Arena) · 3 kein
            // Platz für seine Instanzen · 4 es verließ den Wirt der Arena (ein Bündel räumte es, es zog um)
            _pruefen(m) {
                let p = m.parent;
                while (p && p !== this.parent) p = p.parent;
                if (!p) return 4;
                const z = m.__arenaZ,
                    g = m.geometry,
                    s = m.material;
                if (
                    s !== z.mat ||
                    s.version !== z.mv ||
                    g !== z.geo ||
                    !!m.instanceColor !== z.farbe ||
                    m.layers.mask !== this.layers.mask ||
                    m.castShadow !== this.castShadow ||
                    m.receiveShadow !== this.receiveShadow ||
                    m.renderOrder !== this.renderOrder
                ) {
                    if (AnazhRealm._arenaSchluessel(m) !== this.__schl) return 2;
                    z.mat = s;
                    z.mv = s.version;
                    z.farbe = !!m.instanceColor;
                    z.stempel = []; // die Art-Größen des neuen Stoffs
                }
                if (g !== z.geo || g.attributes.position !== z.pos || g.index !== z.idx) {
                    const alt = z.gestalt;
                    this._gestaltNehmen(m);
                    this._lager.lassen(alt);
                } else {
                    const b = this._lager.gestalten.get(z.gestalt);
                    if (b.stand !== stand(g)) {
                        b.stand = stand(g);
                        if (b.bv >= 0) this._lager.neu = true; // die liegende Gestalt änderte ihren Inhalt: das Lager kopiert neu
                    }
                }
                if (m.instanceMatrix !== z.im) {
                    z.im = m.instanceMatrix; // die Senke wuchs: ihr Block kopiert ganz neu
                    z.n = -1;
                    z.stempel = [];
                }
                // zurück zum Zeichner, bis die größere Arena steht
                if (!this._blockFuer(z, m.count | 0, AnazhRealm.__arenaJetzt || 0)) return 3;
                return 0;
            }
            _sichtbar(m, renderer) {
                if (m.visible === false) return false;
                let p = m.parent;
                while (p && p !== this.parent) {
                    if (p.visible === false) return false;
                    if (p.occlusionTest === true && renderer.isOccluded(p)) return false;
                    p = p.parent;
                }
                return p === this.parent;
            }
            // der Block eines Glieds: kopiert, wenn eine seiner Instanz-Größen eine neue Version trägt, die Zahl wuchs oder
            // die Welt-Matrix der Senke wechselte (die Matrizen tragen sie, die Arena steht im Ursprung)
            _block(m, z, n) {
                // ein frischer Block trägt zuerst die Art-Größen des Winds aus dem Stoff seines Glieds (je Instanz gleich)
                if (this._wind && z.stempel.length === 0) {
                    const art = m.material.userData.windArt,
                        wa = this.__instanzQuelle.windArt;
                    for (let i = z.erst * 4; i < (z.erst + z.cap) * 4; i += 4) {
                        wa.array[i] = art ? art.x : 1;
                        wa.array[i + 1] = art ? art.y : 0;
                        wa.array[i + 2] = art ? art.z : 0;
                    }
                    schreib(this._rend, wa, z.erst * 4, z.cap * 4);
                }
                const im = m.instanceMatrix,
                    q = m.geometry.attributes,
                    c = m.instanceColor,
                    st = z.stempel,
                    mw = m.matrixWorld.elements;
                let neu = n > z.n || st[0] !== im.version,
                    k = 1;
                for (let i = 0; i < 16; i++)
                    if (z.mw[i] !== mw[i]) {
                        z.mw.set(mw);
                        neu = true;
                        break;
                    }
                for (const nm in q) {
                    const a = q[nm];
                    if (!a.isInstancedBufferAttribute) continue;
                    if (st[k] !== a || st[k + 1] !== a.version) neu = true;
                    st[k++] = a;
                    st[k++] = a.version;
                }
                if (c && st[k] !== c.version) neu = true;
                if (c) st[k] = c.version;
                st[0] = im.version;
                if (!neu) return;
                z.n = n;
                const e = z.erst,
                    G = this.geometry,
                    M = this.__instanzQuelle.instanceMatrix;
                if (istEins(mw)) M.array.set(im.array.subarray(0, n * 16), e * 16);
                else for (let i = 0; i < n; i++) mal(M.array, (e + i) * 16, mw, im.array, i * 16);
                schreib(this._rend, M, e * 16, n * 16);
                for (const nm in q) {
                    const a = q[nm];
                    if (!a.isInstancedBufferAttribute) continue;
                    const d = G.attributes[nm];
                    d.array.set(a.array.subarray(0, n * a.itemSize), e * a.itemSize);
                    schreib(this._rend, d, e * a.itemSize, n * a.itemSize);
                }
                if (c) {
                    const d = G.attributes.instanzFarbe;
                    d.array.set(c.array.subarray(0, n * c.itemSize), e * c.itemSize);
                    schreib(this._rend, d, e * c.itemSize, n * c.itemSize);
                }
            }
            // der Zug je Kamera — lose je Pass, im Bündel die aufgenommenen Plätze —, jeder ein Abschnitt des EINEN
            // Auftrags-Puffers, so lang wie die Glieder
            _zugFuer(camera, fest) {
                const reg = fest ? this._zuegeB : this._zuege;
                let z = reg.get(camera);
                if (!z) {
                    if (reg.size >= 16) {
                        const [k0, z0] = reg.entries().next().value;
                        this._segFrei.push(z0.seg);
                        reg.delete(k0);
                    }
                    const seg = this._segFrei.length ? this._segFrei.pop() : this._segN++;
                    z = { seg, arr: null, offs: [], zuege: [], tri: 0, plaetze: 0 };
                    reg.set(camera, z);
                }
                if (this.glieder.length > this._segCap || this._segN > this._segZahl) this._indNeu();
                else if (!z.arr) z.arr = this._ansicht(z.seg);
                return z;
            }
            _ansicht(seg) {
                const L = this._segCap * 5;
                return this._ind.array.subarray(seg * L, (seg + 1) * L);
            }
            // der Auftrags-Puffer wächst (mehr Glieder oder Kameras): die Abschnitte ziehen um, das Bündel nimmt neu auf
            _indNeu() {
                const alt = this._ind,
                    altCap = this._segCap;
                this._segCap = Math.max(this._segCap, Math.ceil(this.glieder.length * 1.5), 8);
                this._segZahl = Math.max(this._segZahl, this._segN) + 1;
                this._ind = new IND(new Uint32Array(this._segZahl * this._segCap * 5), 1);
                for (const z of [...this._zuege.values(), ...this._zuegeB.values()]) {
                    const neu = this._ansicht(z.seg);
                    if (z.arr) neu.set(z.arr.subarray(0, Math.min(altCap, this._segCap) * 5));
                    z.arr = neu;
                }
                // er liegt sofort auf der GPU: r184 lädt ihn nur beim Auffrischen des Render-Objekts, und die Observer-Diät
                // sieht `indirect` nicht (Befund 16.10., G1-n2: der Zug fand keinen Puffer, „drawIndexedIndirect … not of
                // type GPUBuffer", der Render brach ab). 4 = r184 AttributeType.INDIRECT (vendor `Cy=4`, `Attributes.update`)
                const A = this._rend && this._rend._attributes;
                if (A && typeof A.update === "function") A.update(this._ind, 4);
                weg(this._rend, alt);
                this._neuAuf();
            }
            onBeforeRender(renderer, scene, camera) {
                globalThis.anazhRealm._arenaZug(this, renderer, camera);
            }
            onAfterRender(renderer) {
                const zug = this._stapel.pop();
                if (zug && zug.offs.length > 0 && renderer.info) {
                    renderer.info.render.drawCalls += zug.offs.length - 1;
                    renderer.info.render.triangles += zug.tri - 1;
                }
            }
            // Glieder abgleichen, Lager und Geometrie ordnen — false: nichts zu zeichnen. Im Takt (`takt`, vor jedem Pass des
            // Frames) wird frei, was der letzte Frame räumte, jedes Glied mit Instanzen hält seine Gestalt, und das Lager baut neu,
            // wenn es muss — in einem Pass nie (r184 zeichnet ihn mit der Geometrie, die er projizierte).
            _ordnen(renderer, takt) {
                if (!AnazhRealm._arenaKann(renderer)) {
                    for (const m of this.glieder.slice()) this.lassen(m, true);
                    return false;
                }
                if (takt) raumSpaet(this._nFrei, this._nSpaet);
                let fremd = null;
                for (const m of this.glieder) {
                    const p = this._pruefen(m);
                    if (p !== 0) (fremd || (fremd = [])).push(m, p);
                }
                if (fremd)
                    for (let i = 0; i < fremd.length; i += 2) {
                        const m = fremd[i],
                            p = fremd[i + 1];
                        this.lassen(m, true);
                        if (p === 2) AnazhRealm._arenaNimmt(m, renderer);
                        else if (p === 3) {
                            this._wartend.add(m);
                            this._folgen();
                        }
                    }
                // verdichten: liegt die Hälfte der Instanz-Seite frei, folgt eine Arena nach dem Bedarf
                if (this.__instanzQuelle.instanceMatrix && this._nCap > 512 && this._nBelegt < this._nCap / 2)
                    this._folgen();
                if (this.glieder.length === 0) return false;
                if (takt) {
                    // vor dem ersten Pass liegt jede Gestalt, die das Hauptbild zieht (im Bündel jedes sichtbare Glied mit
                    // Instanzen, lose dazu im Blick der Kamera, wie `_auftraege`); was nur eine Kaskade zieht, legt sich in
                    // ihrem Zug in eine freie Strecke (reicht keine, wirft es einen Frame später). Befund 16.10. (G1-n2/diag1,
                    // Genesis Third): mit jedem Schatten-Glied mit Instanzen lagen 0,27 MB Zwillinge, die keine Kaskade zog.
                    const L = this._lager,
                        jetzt = AnazhRealm.__arenaJetzt || 0,
                        cam = globalThis.anazhRealm && globalThis.anazhRealm.state.camera,
                        haupt = (this.layers.mask & 1) !== 0,
                        blick = !this._fest && haupt && !!cam;
                    if (blick) {
                        pm.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
                        fr.setFromProjectionMatrix(pm, cam.coordinateSystem, cam.reversedDepth);
                    }
                    L.takt(renderer, jetzt);
                    if (haupt)
                        for (const m of this.glieder) {
                            if ((m.count | 0) <= 0 || !this._sichtbar(m, renderer)) continue;
                            if (blick && m.frustumCulled !== false) {
                                if (m.boundingSphere === null) m.computeBoundingSphere();
                                if (!fr.intersectsSphere(kugel.copy(m.boundingSphere).applyMatrix4(m.matrixWorld)))
                                    continue;
                            }
                            L.halten(L.gestalten.get(m.__arenaZ.gestalt), jetzt);
                        }
                    L.ordnen(jetzt);
                }
                if (this.geometry.index !== this._lager.index) this._geoNeu();
                return true;
            }
            // Die Aufträge eines Zugs aus der EINEN Wahl der CPU (`count` der Senke; lose dazu Sicht und Frustum wie r184),
            // VERDICHTET: nur Glieder mit Instanzen im Blick ziehen. `camera` null: die Plätze eines Bündels — die Aufnahme
            // (`auf`) legt so viele, wie Glieder ziehen, und ein Viertel Reserve (`plaetze`, Plätze ohne Instanzen); der Takt
            // füllt sie, und reichen sie nicht oder liegt mehr als die Hälfte brach, nimmt das Bündel neu auf — sonst nie, die
            // Wahl wechselt ohne Aufnahme. Befund 16.10. (Prüfung, Dorf): bis hier zog jedes Glied seinen Platz, auch leer —
            // die Züge des Hauptbilds 58 → 66.
            _auftraege(zug, camera, renderer, auf) {
                const fest = camera === null;
                const args = zug.arr,
                    basis = zug.seg * this._segCap * 5,
                    platz = fest && !auf ? zug.plaetze : this._segCap;
                zug.offs.length = 0;
                zug.zuege.length = 0;
                zug.tri = 0;
                let k = 0,
                    ziehen = 0,
                    frust = false,
                    lebend = 0;
                for (const m of this.glieder) {
                    let n = m.count | 0;
                    if (n > 0) lebend++;
                    if (n > 0 && !this._sichtbar(m, renderer)) n = 0;
                    if (n > 0 && !fest && m.frustumCulled !== false) {
                        if (!frust) {
                            pm.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
                            fr.setFromProjectionMatrix(pm, camera.coordinateSystem, camera.reversedDepth);
                            frust = true;
                        }
                        if (m.boundingSphere === null) m.computeBoundingSphere();
                        if (!fr.intersectsSphere(kugel.copy(m.boundingSphere).applyMatrix4(m.matrixWorld))) n = 0;
                    }
                    if (n <= 0) continue;
                    const z = m.__arenaZ,
                        b = this._lager.gestalten.get(z.gestalt),
                        dr = m.geometry.drawRange;
                    const s0 = Math.max(0, dr.start | 0);
                    const ni = Math.min(b.ni - s0, Number.isFinite(dr.count) ? dr.count : b.ni);
                    if (ni <= 0) continue;
                    // die Gestalt liegt (oder legt sich in eine freie Strecke) — ohne Platz zieht das Glied ab dem Takt, der das
                    // Lager neu baut (im Takt hält jedes Glied mit Instanzen seine Gestalt vor jedem Pass)
                    if (z.erst < 0 || !this._lager.halten(b, AnazhRealm.__arenaJetzt || 0)) continue;
                    ziehen++;
                    if (k >= platz) continue; // die Plätze des Bündels reichen nicht: es nimmt neu auf (unten)
                    n = Math.min(n, z.cap);
                    this._block(m, z, n);
                    const o = k * 5;
                    args[o] = ni;
                    args[o + 1] = n;
                    args[o + 2] = b.fi + s0;
                    args[o + 3] = b.bv;
                    args[o + 4] = z.erst;
                    zug.offs.push((basis + o) * 4);
                    zug.zuege.push(m);
                    zug.tri += (ni / 3) * n;
                    k++;
                }
                // gezählt am Stand dieses Passes (heilt jeden Schreiber an der Instanz-Zahl vorbei)
                this._lebend = lebend;
                this._sicht();
                if (fest) {
                    if (auf) zug.plaetze = Math.min(this.glieder.length, k + (k > 0 ? (k >> 2) + 1 : 0));
                    else if (ziehen > zug.plaetze || zug.plaetze > 2 * ziehen + 2) this.__buendel.needsUpdate = true;
                    for (; k < zug.plaetze; k++) {
                        const o = k * 5;
                        args[o] = args[o + 1] = args[o + 2] = args[o + 3] = args[o + 4] = 0;
                        zug.offs.push((basis + o) * 4);
                        zug.zuege.push(this);
                    }
                }
                if (k > 0) schreib(renderer, this._ind, basis, k * 5);
            }
            raycast() {}
        }
        AnazhRealm.__arenaK = GeometrieArena;
        return GeometrieArena;
    }
    // Ein Bündel, das eine Senke trug, nimmt sich neu auf, wenn sie Arena oder Zeichner wechselt — auch eines, das gerade
    // aufnimmt (der Eintritt geschieht im Zug ihres Zeichners): r184 merkt sich am Ende der Aufnahme die Version, der nächste
    // Takt setzt es erneut (`__arenaAuf`). Befund 16.10. (G1-n2, Radeon, Etiketten der GPU-Wache): ein Bündel spielte den
    // Zeichner weiter ab, nachdem seine Matrizen gefallen waren — „used in submit while destroyed".
    static _arenaBuendel(m) {
        for (let p = m.parent; p; p = p.parent)
            if (p.isBundleGroup) {
                p.needsUpdate = true;
                (AnazhRealm.__arenaAuf || (AnazhRealm.__arenaAuf = new Set())).add(p);
            }
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
        // die Observer-Diät) die Änderung und lädt es hoch — ohne sie fände sein Draw keinen Puffer. Der Sprung zählt mit
        // (`__abschiede`): wer den INHALT an der Version misst (das Lager der Arena), zieht ihn ab.
        attr.needsUpdate = true;
        attr.__abschiede = (attr.__abschiede | 0) + 1;
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
        if (mesh.__arena) mesh.__arena.lassen(mesh, false);
        if (AnazhRealm.__arenaKommt) AnazhRealm.__arenaKommt.delete(mesh);
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
    // DER ABSCHIED EINER GEBUNDENEN TEXTUR (die Klasse „Destroyed texture … used in a submit": szene:tiefenabbild, spiegel:strahl,
    // horizont-karte): r184 legt ein Ziel, das eine Bindegruppe schon hält, beim ersten Bild oder einem Größen-Wechsel neu an
    // (`updateRenderTarget` → `updateTexture` → `destroyTexture`) — mitten im Frame, während ein offener Befehls-Puffer oder ein
    // aufgenommenes Bündel die alte Textur bindet; der ganze Befehls-Puffer fiel aus. Die EINE Regel für jede solche Textur, an
    // der KLASSE der Textur-Verwaltung (jeder Renderer der Seite): die alte GPU-Textur fällt erst nach den Submits dieser Aufgabe,
    // und jedes Bündel der Welt nimmt neu auf (seine Aufnahme hält die alte Bindegruppe); die losen Leser frischt der Wächter der
    // Diät auf (`_diaetVorTextur`). Die Wand: gate:fenster-wechsel (jeder Größen-Schritt, jede Meldung beim Namen).
    // DIE GEWACHSENE TEXTUR (Karten-Atlas, Bogen- und Ziel-Atlas der Tore): ein Atlas wächst IN SEINER Textur (neues Bild,
    // needsUpdate) und geht denselben Weg — r184 lädt eine gewöhnliche Textur in ihre alte GPU-Form, die neue Form legt diese
    // Regel an (die Schichten-Updates fallen: die neue Form lädt ganz). Bis 16.10. baute jedes Wachsen eine NEUE Textur, tauschte
    // den Knoten-Wert und entsorgte die alte — doch die Vorlage des Programms bindet die Textur seines Baus, und `Bindings._init`
    // lädt sie für jedes neue Render-Objekt hoch, bevor `update()` den Knoten liest: die entsorgte stieg wieder auf und blieb
    // (Mess-Wiese, Radeon: Karten-Atlas 16 neben 20 Schichten, +4,0 MB VRAM). Die Wand: gate:foundry-impostor C5.
    _texturAbschied(renderer) {
        const inst = renderer && renderer._textures;
        const P = inst && Object.getPrototypeOf(inst);
        if (!P || P.__anazhAbschied || typeof P.updateTexture !== "function") return;
        P.__anazhAbschied = true;
        const welt = this;
        const roh = P.updateTexture;
        P.updateTexture = function (t, o) {
            const d = this.get(t);
            const ziel = t.isRenderTargetTexture || t.isDepthTexture || t.isFramebufferTexture;
            const anders = d.initialized === true && d.version !== t.version;
            // die Form der GPU-Textur einer gewöhnlichen Textur (nie die geteilte Vorgabe-Textur: die fällt nie)
            const formTraeger = !ziel && t.isStorageTexture !== true && t.isExternalTexture !== true;
            const s = formTraeger && (anders || d.initialized !== true) ? this.getSize(t) : null;
            const form = s ? s.width + "x" + s.height + "x" + s.depth : null;
            const gewachsen =
                anders && form !== null && d.isDefaultTexture === false && d.__form !== undefined && d.__form !== form;
            const neu = (ziel && anders && d.bindGroups && d.bindGroups.size > 0) || gewachsen;
            const g = neu ? this.backend.get(t) : null;
            const alt = g ? [g.texture, g.msaaTexture].filter(Boolean) : [];
            for (const x of alt) {
                const weg = Object.getPrototypeOf(x).destroy;
                x.destroy = () => Promise.resolve().then(() => weg.call(x));
            }
            // Der Sampler lebt in den Backend-Daten der Textur (`updateSampler`) und die Sampler-Bindung steht VOR der Textur-
            // Bindung: er folgt der neuen Form, sonst fehlt er der nächsten Bindegruppe (die Post-Kette fiel am 16.10. so beim
            // Wachsen des Karten-Atlas, „Required member is undefined").
            const sampler = gewachsen ? { sampler: g.sampler, samplerKey: g.samplerKey } : null;
            if (gewachsen) {
                this.backend.destroyTexture(t);
                d.isDefaultTexture = undefined;
                if (t.layerUpdates && t.layerUpdates.size > 0) t.clearLayerUpdates();
            }
            const aus = roh.call(this, t, o);
            if (form !== null && d.isDefaultTexture === false) d.__form = form;
            if (gewachsen) {
                const n = this.backend.get(t);
                if (n.sampler === undefined && sampler.sampler !== undefined) Object.assign(n, sampler);
                this.info.destroyTexture(t);
                this.info.createTexture(t);
            }
            const B = welt.state._regionBundles;
            if (alt.length && B && this.backend.get(t).texture !== alt[0])
                for (const bg of B.values()) bg.needsUpdate = true;
            return aus;
        };
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
        const vor = mesh.count | 0;
        mesh.count = n;
        mesh.visible = n > 0;
        // die Arena zählt ihre Glieder mit Instanzen: ohne eines betritt sie keinen Pass (kein leeres Render-Objekt)
        const a = mesh.__arena;
        if (a && vor > 0 !== n > 0) {
            a._lebend += n > 0 ? 1 : -1;
            a._sicht();
        }
        // der Zeichner zählt mit (1410-1): seine Fassade zeichnet so viele Instanzen, wie die Senke JETZT zählt — r184 liest die
        // Zahl zur Zeichen-Zeit, und der verschachtelte Schatten-Render stellt sie mitten im Hauptbild um und zurück, ohne neu
        // zu projizieren (die Zahl der Projektion war dann die der Kaskade: Instanzen fehlten oder standen doppelt im Bild)
        if (mesh.__zeichner) mesh.__zeichner.__fassade.instanceCount = n;
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
