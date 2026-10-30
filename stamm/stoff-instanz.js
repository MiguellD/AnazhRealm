class AnazhRealm_stoff_instanz {
    // ===== ATLAS · Stoff/instanz — Instanz-Senken und ihr Zeichner · Laub-Licht · Baum-Wind =====
    // DIE NORMALE DES LAUB-STOFFS (K68-N1): eine Krone mit der Normale der Krone lichtet FLIP-FREI — r184 kehrt die Normale
    // back-facender Fragmente eines doppelseitigen Stoffs um (normalView = normalViewGeometry × faceDirection), die Rückseite
    // einer Karte läse das Ellipsoid nach innen (Prüfer K68: 45–51 % der nahen Dreiecke vom Auge weg, die Nadel-Wedel
    // milchig). Die Normale ist die Geometrie-Normale des Renderers selbst (Instanz-, Batch- und Modell-Rotation), ohne die
    // Seite: beide Seiten einer Karte tragen die Krone an ihrer Stelle. EIN Ort für jeden Kronen-Stoff (Studio, Grammatik).
    _laubStoffNormale(T, mat) {
        mat.normalNode = T.normalViewGeometry;
        return mat;
    }

    // DIE BLATT-UNTERSEITE (phyto-core BLATT_UNTERSEITE, 05.10.; K68-N1): ist die GESEHENE Seite des Blatts nach unten gewandt,
    // trägt das Laub die hellere, mattere Unterseite — die Seite ist die Fläche selbst (`normalFlat`, zum Auge gewandt), nie die
    // Licht-Normale: mit der Normale der Krone hieß von unten die ganze Krone Unterseite (Prüfer K68: Nadel-Wedel von unten
    // mint-weiß, Kronen-Luma +15–49 %). Dieselben Zahlen wie das Labor (foundry-core `injectWind`). EIN Ort für jeden Laub-Stoff.
    _laubUnterseite(T, farbe) {
        const BU = globalThis.__phytoCore.BLATT_UNTERSEITE;
        const ny = T.normalFlat.transformDirection(T.cameraViewMatrix).y;
        const grau = T.mix(farbe, T.vec3(farbe.dot(T.vec3(0.2126, 0.7152, 0.0722))), BU.grau).mul(BU.hell);
        return T.mix(farbe, grau, T.float(0.5).sub(ny.mul(BU.steil)).clamp(0.0, 1.0));
    }

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
        const vier = (n) => Math.ceil(n / 4) * 4; // jede Kapazität ein Vielfaches von 4 Elementen
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
        // in die Warteschlange vor dem Submit dieses Passes über die EINE Wort-Schrift; ohne GPU-Puffer lädt r184 beim
        // ersten Zug das ganze Array
        const schreib = (rend, a, start, n) => {
            const be = rend && rend.backend;
            if (!be || !be.device || !a || n <= 0 || !rend._attributes.has(a)) return;
            const d = be.get(a),
                b = a.array.BYTES_PER_ELEMENT;
            if (d.buffer) AnazhRealm._schreibWorte(be.device.queue, d.buffer, a.array, start * b, (start + n) * b);
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
                // DIE INSTANZ-FARBE (A11): r184 multipliziert `vInstanceColor` nur in die Farbe eines Objekts, das selbst
                // `instanceColor` trägt (NodeMaterial.setupDiffuseColor, vendor gelesen) — die Arena trägt die Farben ihrer
                // Glieder in `instanzFarbe`, hielt aber keinen Halter: seit G1 fiel der Tint jeder Senke (Büschel der
                // Nah-Wiese, Kronen-Karten, Sterne), Mess-Wiese Ego farbtonStreuung 11,06 → 8,91.
                Object.defineProperty(this, "instanceColor", {
                    get: () => this.geometry.attributes.instanzFarbe || null,
                    configurable: true,
                });
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
                    // die Reserve: ein Viertel über den Zügen der Aufnahme, abgerundet — ein leerer Platz ist ein Befehl im Band
                    // (Befund 16.10., G1-n3/linse: mit „ein Viertel und eins" 9 leere Züge im Hauptbild der Mess-Wiese, baum 26 → 35)
                    if (auf) zug.plaetze = Math.min(this.glieder.length, k + (k >> 2));
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
            // DER HÖRER ZIEHT MIT (bausatz-absage): r184 hängt `onGeometryDispose` an die ERSTE Geometrie des Render-Objekts, und
            // `setGeometry` lässt ihn dort — tauscht ein Satz die Geometrie am selben Mesh (`_chunkSatzGeometrie`), löscht das
            // Entsorgen der alten die Attribute des LEBENDEN Render-Objekts: es zeichnet aus `vertexBuffers` weiter, aber die
            // Diät prüft es jeden Takt voll (Genesis Third: 4 bauSatz + bodenSatz), und die alte Geometrie hält es fest.
            const RO = Object.getPrototypeOf(ro);
            if (RO.__anazhHoerer !== true && typeof RO.setGeometry === "function") {
                RO.__anazhHoerer = true;
                const setze = RO.setGeometry;
                RO.setGeometry = function (g) {
                    if (this.geometry && this.geometry !== g) {
                        this.geometry.removeEventListener("dispose", this.onGeometryDispose);
                        g.addEventListener("dispose", this.onGeometryDispose);
                    }
                    return setze.call(this, g);
                };
            }
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
    // Wer den Index schmal hält, schreibt ihn auch nach: jedes Nachschreiben eines Arrays unter 4 B je Element (der
    // Uint16-Index, unorm16/unorm8 — ganz oder je Bereich) geht durch die EINE Wort-Schrift `_schreibWorte`, die auch
    // die Arena ruft (gate:vendor-anker pinnt beide Vendor-Stellen, gate:weltbild-frost P2 jeden writeBuffer).
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
            const ba = attr.isInterleavedBufferAttribute ? attr.data : attr;
            if (ba.array.BYTES_PER_ELEMENT >= 4 || this.get(ba)._force3to4BytesAlignment === true)
                return nachschreiben.call(this, attr);
            const [q, buf, a] = [this.device.queue, this.get(ba).buffer, ba.array],
                b = a.BYTES_PER_ELEMENT;
            if (!ba.updateRanges.length) AnazhRealm._schreibWorte(q, buf, a, 0, a.byteLength);
            for (const r of ba.updateRanges) AnazhRealm._schreibWorte(q, buf, a, r.start * b, (r.start + r.count) * b);
            ba.clearUpdateRanges();
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
    // DIE WORT-SCHRIFT (K-ICH-BÜHNE-PUFFER): WebGPU schreibt nur in 4-Byte-Wörtern (Versatz und Länge), r184 reicht ein
    // schmales Array (der Uint16-Index des Gesetzes, unorm16/unorm8) beim Nachschreiben roh — ein Index ungerader Länge oder
    // ein Bereich ab ungeradem Element warf (CI voll 14, 1 von ~15 Läufen: Mensch 8097 × Uint16 = 16 194 B nach
    // `_gpuAbschied`). Darum ist dies der EINE Schreiber eines Array-Bereichs in die Queue — die Hülle (jedes Array unter
    // 4 B je Element, ganz oder je updateRange) und die Arena (`schreib`) rufen ihn: die Bytes [von, bis) des Arrays an
    // dieselbe Stelle des Puffers, Anfang ab-, Ende aufgerundet, das letzte halbe Wort als gepolsterte Kopie
    // (r184 polstert jeden Puffer beim Anlegen auf 4 B).
    static _schreibWorte(q, buf, a, von, bis) {
        const voll = a.byteLength & ~3;
        bis = Math.min(bis, a.byteLength);
        von &= ~3;
        const ganz = Math.min(voll, (bis + 3) & ~3);
        if (ganz > von) q.writeBuffer(buf, von, a.buffer, a.byteOffset + von, ganz - von);
        if (bis > voll) {
            const rest = new Uint8Array(4);
            rest.set(new Uint8Array(a.buffer, a.byteOffset + voll, a.byteLength - voll));
            q.writeBuffer(buf, voll, rest, 0, 4);
        }
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
        if (vor > 0 !== n > 0) AnazhRealm._regtHalter(mesh); // die Werfer-Hülle ihres Bündels (das Register)
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
    // DER GANG-SATZ — der EINE Baustein jeder Menge gelenkiger Gestalten (Bewohner, Tiere; Lehre 23: WebGPU zieht jeden Draw
    // einzeln — die Kosten der Menge hängen nie an der Kopfzahl): je Gestalt EIN Knochen-Puffer, eine Textur — `baender` Bänder
    // zu je `n` Phasen des Doppelschritts und der Stand (Zeile baender·n), je Zeile die Matrix jedes Knochens jeder Quelle in den
    // Raum des Leibs (`_gangSatzPose`, drei Texel je Knochen: die Zeilen der affinen Matrix). Die Kosten gehören dem Skelett,
    // nie den Ecken (Lehre 19: je Gestalt 3·J·(baender·n + 1) Texel statt einer Lage je Ecke und Phase). Jede Senke
    // (`spec.senken`: ihr Teil, ihre Quellen, ihr Stoff, ob sie wirft) ist eine Instanz-Senke über den EINEN Zeichner
    // (`_instanzMesh`); jede Ecke trägt ihre Vorlage (`aRoh`, `aRohN` — die Rückseite eines beidseitigen Teils mit gekehrter
    // Normale), ihre vier Knochen (`aKnochen`, Platz im Puffer) und Gewichte (`aGewicht`), ihre Lage im Stand (`position`,
    // `normal`: `_gangSatzEcke`); jede Instanz Band + Phase und Gewicht ihres Gangs (`aGang`, `_gangSatzInstanz`). Der Knoten
    // liest VOR der Instanz-Matrix (Lehre 22), die Normale mit, und der Wurf liest denselben Puffer (Lehre 26: der Schatten
    // geht, wie das Auge sieht). Ein Stoff wird EINMAL geklont (der Gang-Knoten ist EINER je Gestalt). `stand(satz)` schreibt
    // die Stand-Zeile, bevor die Senken ihre Ecken aus ihr nehmen. Eine Gestalt im Satz ist eine Matrix.
    _gangSatz(spec, stand) {
        const T = THREE;
        // DIE PLÄTZE DER KNOCHEN: ein Knochen, den mehrere Quellen mit derselben Bindung tragen (Name und Inverse × Bindung
        // gleich), hat EINEN Platz — je Quelle `q.platz[j]`, je Platz seine Quelle und sein Knochen (`knochen`)
        const knochen = [];
        const plaetze = new Map();
        const bindung = new T.Matrix4();
        for (const q of spec.quellen) {
            const m = q.m;
            q.platz = m.userData.__skinJoints.map((nm, j) => {
                const b = bindung.multiplyMatrices(m.skeleton.boneInverses[j], m.bindMatrix).elements;
                const key = nm + "|" + Array.from(b, (x) => x.toFixed(6)).join(",");
                if (!plaetze.has(key)) {
                    plaetze.set(key, knochen.length);
                    knochen.push({ q, j, nm });
                }
                return plaetze.get(key);
            });
        }
        const J = knochen.length;
        const N = spec.n;
        const B = spec.baender || 1;
        const tex = new T.DataTexture(
            new Float32Array(3 * J * (B * N + 1) * 4),
            3 * J,
            B * N + 1,
            T.RGBAFormat,
            T.FloatType
        );
        tex.name = spec.name + "-gang";
        tex.minFilter = tex.magFilter = T.NearestFilter;
        tex.generateMipmaps = false;
        const satz = {
            quellen: spec.quellen,
            n: N,
            baender: B,
            J,
            knochen,
            tex,
            geos: [],
            stoffe: [],
            senken: [],
            cap: spec.cap,
        };
        stand(satz);
        tex.needsUpdate = true;
        const knoten = AnazhRealm._gangSatzKnoten(tex, N, B);
        // DER TON JE ECKE (mensch.K4): tragen die Quellen ihn (der Mensch, koerper `menschTon`), färbt jede Instanz ihre Ecken nach
        // ihrer Palette — die Zeilen der Ton-Tafel [Leib, Gestalt] reisen je Instanz in `aGang.zw` (`_gangSatzInstanz`)
        const ton = spec.quellen.every((q) => !!q.m.geometry.attributes.aTon);
        satz.ton = ton;
        const TSL = T.TSL;
        const tonFarbe = ton
            ? TSL.vec4(
                  TSL.varying(
                      TSL.attribute("color", "vec3").mul(this._tonFaktor(TSL, TSL.attribute("aGang", "vec4").zw)),
                      "vTonFarbe"
                  ),
                  1
              )
            : null;
        const S = ton ? 15 : 14; // die Ecke im EINEN Puffer: Vorlage, Normale, Knochen, Gewichte (und ihr Ton)
        const klone = new Map();
        const D = tex.image.data;
        const e = new Float32Array(6);
        for (const sk of spec.senken) {
            let stoff = klone.get(sk.stoff);
            if (!stoff) {
                stoff = sk.stoff.clone();
                stoff.name = spec.name;
                stoff.positionNode = knoten;
                if (tonFarbe) stoff.colorNode = tonFarbe;
                klone.set(sk.stoff, stoff);
                satz.stoffe.push(stoff);
            }
            const P = [];
            const Nn = [];
            const C = [];
            const R = [];
            const RN = [];
            const KI = [];
            const KW = [];
            const TN = [];
            const I = [];
            for (const q of sk.quellen) {
                const a = q.m.geometry.attributes;
                const ix = q.m.geometry.index.array;
                const basis = P.length / 3;
                for (let i = 0; i < a.position.count; i++) {
                    AnazhRealm._gangSatzEcke(D, J, B * N, q, i, e);
                    P.push(e[0], e[1], e[2]);
                    Nn.push(e[3], e[4], e[5]);
                    C.push(a.color.getX(i), a.color.getY(i), a.color.getZ(i));
                    R.push(a.position.getX(i), a.position.getY(i), a.position.getZ(i));
                    RN.push(a.normal.getX(i), a.normal.getY(i), a.normal.getZ(i));
                    if (ton) TN.push(a.aTon.getX(i));
                    for (let c = 0; c < 4; c++) {
                        KI.push(q.platz[a.skinIndex.getComponent(i, c)]);
                        KW.push(a.skinWeight.getComponent(i, c));
                    }
                }
                for (let t = 0; t < ix.length; t++) I.push(basis + ix[t]);
                // ein beidseitiger Teil (die Strähnen-Kreuzquads des Haars) trägt im Satz seine Rückseite als eigene Fläche
                if (q.beid && !sk.wurf) {
                    const b2 = P.length / 3;
                    for (let i = basis; i < b2; i++) {
                        for (let c = 0; c < 3; c++) {
                            P.push(P[i * 3 + c]);
                            Nn.push(-Nn[i * 3 + c]);
                            C.push(C[i * 3 + c]);
                            R.push(R[i * 3 + c]);
                            RN.push(-RN[i * 3 + c]);
                        }
                        for (let c = 0; c < 4; c++) {
                            KI.push(KI[i * 4 + c]);
                            KW.push(KW[i * 4 + c]);
                        }
                        if (ton) TN.push(TN[i]);
                    }
                    for (let t = 0; t < ix.length; t += 3) I.push(b2 + ix[t], b2 + ix[t + 2], b2 + ix[t + 1]);
                }
            }
            const geo = new T.BufferGeometry();
            const n = P.length / 3;
            geo.setAttribute("position", new T.BufferAttribute(new Float32Array(P), 3));
            geo.setAttribute("normal", new T.BufferAttribute(new Float32Array(Nn), 3));
            geo.setAttribute("color", new T.BufferAttribute(new Float32Array(C), 3));
            // die Vorlage und die Knochen in EINEM Puffer (WebGPU trägt höchstens 8 Vertex-Puffer je Pipeline), der Ton mit ihnen
            const V = new Float32Array(n * S);
            for (let i = 0; i < n; i++) {
                V.set(R.slice(i * 3, i * 3 + 3), i * S);
                V.set(RN.slice(i * 3, i * 3 + 3), i * S + 3);
                V.set(KI.slice(i * 4, i * 4 + 4), i * S + 6);
                V.set(KW.slice(i * 4, i * 4 + 4), i * S + 10);
                if (ton) V[i * S + 14] = TN[i];
            }
            const vb = new T.InterleavedBuffer(V, S);
            geo.setAttribute("aRoh", new T.InterleavedBufferAttribute(vb, 3, 0));
            geo.setAttribute("aRohN", new T.InterleavedBufferAttribute(vb, 3, 3));
            geo.setAttribute("aKnochen", new T.InterleavedBufferAttribute(vb, 4, 6));
            geo.setAttribute("aGewicht", new T.InterleavedBufferAttribute(vb, 4, 10));
            if (ton) geo.setAttribute("aTon", new T.InterleavedBufferAttribute(vb, 1, 14));
            // der Mensch blendet nie (`_foundryTreeMaterial`): seine Menge trägt keinen Stufen-Stempel
            if (!ton)
                for (const nm of ["aLodLevel", "aH0", "aH0L"])
                    geo.setAttribute(nm, new T.BufferAttribute(new Float32Array(n), 1));
            const G = ton ? 4 : 2; // je Instanz Band + Phase und Gewicht (und die Zeilen ihrer Palette)
            geo.setAttribute("aGang", new T.InstancedBufferAttribute(new Float32Array(spec.cap * G), G));
            geo.setIndex(new T.BufferAttribute(AnazhRealm._indexSchmal(Uint32Array.from(I), n), 1));
            geo.computeBoundingSphere();
            satz.geos.push(geo);
            const m = AnazhRealm._instanzMesh(geo, stoff, spec.cap);
            m.name = spec.name;
            m.userData.inventar = spec.inventar;
            m.userData.teil = sk.teil;
            m.userData.gang = { n: N, baender: B, J, puffer: D };
            m.receiveShadow = !sk.wurf;
            m.layers.mask = sk.wurf ? 0 : 1; // der Wurf nur auf der Wurf-Ebene (`_wurfEbene`), das Auge nur auf Ebene 0
            m.castShadow = !!sk.wurf;
            AnazhRealm._instanzZahl(m, 0);
            this.state.scene.add(m);
            satz[sk.teil] = m;
            satz.senken.push(m);
        }
        return satz;
    }

    // DIE ZEILE `zeile` DES KNOCHEN-PUFFERS an der gestellten Gestalt: je Platz sein Knochen (`teile` je Name) Pose × Inverse
    // der Vorlage × Bindung seiner Quelle in den Raum der Wurzel (`wurzel`, ihre Welt-Matrix). Die Pose stellt der Rufer (der Bewohner mit
    // dem Gang-Gesetz des Menschen, das Tier mit dem seines Leibs); jede Quelle ist eine geskinnte Stufe mit ihren
    // Knochen-Namen (`__skinJoints`).
    _gangSatzPose(satz, zeile, teile, wurzel) {
        const inv = (this._gangSatzInv || (this._gangSatzInv = new THREE.Matrix4())).copy(wurzel).invert();
        const k = this._gangSatzK || (this._gangSatzK = new THREE.Matrix4());
        const D = satz.tex.image.data;
        satz.knochen.forEach(({ q, j, nm }, p) => {
            const e = k
                .multiplyMatrices(inv, teile[nm].matrixWorld)
                .multiply(q.m.skeleton.boneInverses[j])
                .multiply(q.m.bindMatrix).elements;
            const o = (zeile * satz.J + p) * 12;
            for (let r = 0; r < 3; r++) {
                D[o + r * 4] = e[r];
                D[o + r * 4 + 1] = e[4 + r];
                D[o + r * 4 + 2] = e[8 + r];
                D[o + r * 4 + 3] = e[12 + r];
            }
        });
    }
    // DIE ECKE i DER QUELLE q in der Zeile `zeile` auf der CPU, wie der Knoten sie zeichnet: Lage und Normale nach `aus`
    static _gangSatzEcke(D, J, zeile, q, i, aus) {
        const a = q.m.geometry.attributes;
        const v = [a.position.getX(i), a.position.getY(i), a.position.getZ(i)];
        const nv = [a.normal.getX(i), a.normal.getY(i), a.normal.getZ(i)];
        aus.fill(0);
        for (let c = 0; c < 4; c++) {
            const w = a.skinWeight.getComponent(i, c);
            if (w === 0) continue;
            const o = (zeile * J + q.platz[a.skinIndex.getComponent(i, c)]) * 12;
            for (let r = 0; r < 3; r++) {
                const b = o + r * 4;
                aus[r] += w * (D[b] * v[0] + D[b + 1] * v[1] + D[b + 2] * v[2] + D[b + 3]);
                aus[3 + r] += w * (D[b] * nv[0] + D[b + 1] * nv[1] + D[b + 2] * nv[2]);
            }
        }
        const l = Math.hypot(aus[3], aus[4], aus[5]) || 1;
        for (let r = 3; r < 6; r++) aus[r] /= l;
    }

    // DIE INSTANZ i EINER SENKE DES SATZES: die Matrix und der Gang (Band + Phase in Zyklen — der ganze Teil wählt das Band,
    // der Rest die Phase — und das Gewicht des Gangs, 0 = der Stand); trägt der Satz den Ton (mensch.K4), die Zeilen ihrer
    // Palette in der Ton-Tafel [Leib, Gestalt] (`zeilen`, ohne sie die Eins)
    static _gangSatzInstanz(m, i, m4, band, phase, w, zeilen) {
        m.setMatrixAt(i, m4);
        const a = m.geometry.attributes.aGang;
        const x = band + phase - Math.floor(phase);
        if (a.itemSize === 4) a.setXYZW(i, x, w, zeilen ? zeilen[0] : 0, zeilen ? zeilen[1] : 0);
        else a.setXY(i, x, w);
    }
    // DIE ZAHL EINER SENKE DES SATZES (dicht, [0, n) lebt): `_instanzZahl`, und was sich schrieb, lädt neu
    static _gangSatzZahl(m, n) {
        AnazhRealm._instanzZahl(m, n);
        if (n > 0) AnazhRealm._gangSatzNeu(m);
    }
    // WAS SICH IN EINER SENKE DES SATZES SCHRIEB, LÄDT NEU: Matrizen und Gang, die Kugel misst neu
    static _gangSatzNeu(m) {
        m.instanceMatrix.needsUpdate = true;
        m.geometry.attributes.aGang.needsUpdate = true;
        m.boundingSphere = null;
    }
    // DER ABSCHIED EINES SATZES: jede Senke über `_instanzAbschied`, ihre Geometrien, die geklonten Stoffe, der Gang-Puffer
    _gangSatzAbschied(satz) {
        for (const m of satz.senken) {
            if (m.parent) m.parent.remove(m);
            this._instanzAbschied(m);
        }
        for (const geo of satz.geos) geo.dispose();
        for (const st of satz.stoffe) st.dispose();
        satz.tex.dispose();
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
    // `auge` {x, z}: die Wahl an einem anderen Ort als dem Auge der Maske (der Vorrat des Dorfs am Ort seines Erwachens).
    _foundryLodForEntry(entry, auge) {
        const p = auge || this._lodAuge(); // vom Auge der Maske (K36), wie der LOD-Tick
        if (!p || !entry || !entry.position) return 1;
        if (this._imStufenVorlauf(entry)) return 1; // der Stufen-Vorlauf der Ankunft, wie der LOD-Tick
        const d = Math.hypot(entry.position.x - p.x, entry.position.z - p.z);
        // DIE EINE STUFEN-WAHL: der Kalt-Schätzer fragt dieselbe Wahl wie der LOD-Tick — Wahrnehmungs-Distanz aus der
        // Sichthöhe (`_lodTreeVisHeight`, 0 = roh für Nicht-Bäume), ohne Hysterese-Zustand. Vorher las er nur die rohe
        // Distanz: die Rampe setzte einen großen Baum in 40 m auf die Karte (dithernd, grau), und der LOD-Tick holte
        // ihn erst Takte später auf L1 (5 Wechsel je Takt, 04.10. an der Mess-Wiese 191 Plätze im ersten Takt). Nennt die Art
        // ihre Grenzen (K43: Haus, Tor), fragt er sie wie der Takt — bis B2 las er dort die Baum-Distanzen 12/26 m: das
        // Ring-Tor in 11 m bestellte kalt seine L0 (Grenze 9,5 m), der Takt wechselte danach auf die L1 (Radeon kalt an
        // Genesis: 7 Tor-L0 und 9 Tor-L1 vor dem ersten Bild). In der Ankunft aus der Ferne (B2) wählt er die Grobstufe.
        const treeLike = !!entry._lodSpecies && Number.isFinite(entry._lodVariantIndex);
        const G = treeLike ? null : this._archStufenGrenzen(entry);
        if (G)
            return AnazhRealm._stufeNachGrenzen(
                d * this._ankunftsFerne(),
                undefined,
                G,
                Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1
            );
        const visH = this._lodTreeVisHeight(entry);
        // ein Baum ohne bekannte Höhe hat in der Ankunft kein Urteil der Nähe: er steht als Karte (sie bestellt die Höhe)
        if (visH === null && this._ankunftsFerne() > 1) return 2;
        return this._chooseLODForDistance(d, undefined, visH);
    }

    // DER KNOTEN DES GANGS (Lehre 22: r184 rechnet den positionNode VOR der Instanz-Matrix — die Vorlage ist der Raum des
    // Leibs): je Ecke ihre vier Knochen, je Knochen die Matrix zwischen den zwei Phasen um die Phase der Instanz in ihrem Band,
    // gemischt mit dem Stand nach dem Gewicht des Gangs, an die Vorlage der Ecke; die Normale ebenso — sie geht als
    // normalLocal in die Instanz-Normale. Die Mischung ist linear in der Matrix, also dieselbe wie zwischen den Lagen.
    static _gangSatzKnoten(tex, n, baender) {
        const T = THREE.TSL;
        return T.Fn(() => {
            const a = T.attribute("aGang", "vec2");
            const ki = T.attribute("aKnochen", "vec4");
            const kw = T.attribute("aGewicht", "vec4");
            const roh = T.vec4(T.attribute("aRoh", "vec3"), 1);
            const rohN = T.attribute("aRohN", "vec3");
            const band = T.floor(a.x).mul(n);
            const f = T.fract(a.x).mul(n);
            const k0 = T.floor(f);
            const t = f.sub(k0).toVar();
            const zs = T.int(baender * n);
            const z0 = T.int(band.add(k0)).toVar();
            const z1 = T.int(band.add(T.mod(k0.add(1), n))).toVar();
            const lage = T.vec3(0).toVar();
            const nrm = T.vec3(0).toVar();
            for (const c of ["x", "y", "z", "w"]) {
                const j = T.int(ki[c]).mul(3).toVar();
                const lies = (r, z) => T.textureLoad(tex, T.ivec2(j.add(r), z), T.int(0));
                const R = [0, 1, 2].map((r) => T.mix(lies(r, zs), T.mix(lies(r, z0), lies(r, z1), t), a.y).toVar());
                lage.addAssign(T.vec3(T.dot(R[0], roh), T.dot(R[1], roh), T.dot(R[2], roh)).mul(kw[c]));
                nrm.addAssign(T.vec3(T.dot(R[0].xyz, rohN), T.dot(R[1].xyz, rohN), T.dot(R[2].xyz, rohN)).mul(kw[c]));
            }
            T.normalLocal.assign(T.normalize(nrm));
            return lage;
        })();
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_stoff_instanz]);

// ===== ATLAS · Stoff/instanz — Außen-Konstanten =====
// DIE PLATZIERUNG DES KERNS (Leben-Schau 2, 09.10.): die Welt-Skala je Preset (`placement.scale`, `treeScaleMul`) lebt
// EINMAL in foundry-core.js (`PORTAL_RENDER_CONFIG.placement`) und reist synchron im Terrain-Namensraum — der Leser vor
// dem Buch (`_foundryWorldScaleMatrix`). Der Hand-Spiegel STUDIO_WORLD_SCALE (acht Baum-/Busch-Zeilen) fiel: ohne Fels-
// und Kristall-Zeilen kollidierte jeder Fels bis zum Buch in Vorlagen-Größe. Fehlt der Kern, bricht es laut.
AnazhRealm._studioPlatzKern = function () {
    const tc = typeof globalThis !== "undefined" ? globalThis.__terrainCore : null;
    const pl = tc && tc.PORTAL_RENDER_CONFIG ? tc.PORTAL_RENDER_CONFIG.placement : null;
    if (!pl || !pl.scale || typeof pl.treeScaleMul !== "number")
        throw new Error("Die Platzierung: foundry-core.js fehlt (__terrainCore.PORTAL_RENDER_CONFIG.placement)");
    return pl;
};
