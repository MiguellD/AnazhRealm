class AnazhRealm_bild_kosten {
    // ===== ATLAS · Bild/kosten — Renderer · TAAU und die EINE Skala · Ausgabe · Post · Pass-Wahl · Schirm · GPU-Kehraus · Bündel- und Zeichen-Reihe =====
    // V12.0-a — WebGPURenderer-Konfiguration. Hot-Swap-WebGL-Fallback weg
    // (r164 hat webgl-legacy/WebGLNodeBuilder entfernt → NodeMaterials laufen
    // nur auf WebGPU). `kind`-Param gestrichen.
    _configureRenderer(renderer) {
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(1);
        renderer.setClearColor(0x000000, 1);
        // JEDES-HOLZ: kienspan schaltet Schatten GANZ aus (der CSM-Erst-Frame-
        // Kompilierschock tötet Software-Dawn-Devices; ohne Schatten-Pipeline
        // überlebt der Boot — die NÄHE bleibt voll, nur das Licht wird flach).
        renderer.shadowMap.enabled = this.state._holzProfil !== "kienspan";
        // V9.84 Perf-1.a — PCFShadowMap statt PCFSoftShadowMap (4 statt 16
        // Samples — Performance-Win).
        renderer.shadowMap.type = THREE.PCFShadowMap;
        // DIE ZEICHEN-REIHE DER WELT (T3): die losen Opaken jedes Renders nach dem EINEN Gesetz (`_zeichenFolge`), nie nach der
        // Boot-Ankunft (Objekt-id).
        if (typeof renderer.setOpaqueSort !== "function")
            this.log("ZEICHEN-REIHE: r184-Renderer.setOpaqueSort nicht gefunden (Vendor-Drift)", "ERROR");
        else renderer.setOpaqueSort(AnazhRealm._zeichenFolge);
        // Native Shadow-Pipeline (MeshToonNodeMaterial konsumiert die Shadow-Map). Der Takt der Schatten-Renders lebt
        // JE LICHT (`shadow.autoUpdate`/`needsUpdate`, `_loopShadowUpdate`) — `renderer.shadowMap.autoUpdate/
        // needsUpdate` liest r184 nicht.
        // autoReset AUS: `_loopRender` ruft `info.reset()` EINMAL pro Frame und liest am Ende die volle Last
        // (Schatten + Haupt + Post-FX) für perfSense — sonst sähe es nur den letzten Post-FX-Pass.
        if (renderer.info) renderer.info.autoReset = false;
        // DER STABILE PUFFER-NAME: r184 nennt den Instanz-Matrix-Puffer im WGSL `NodeBuffer_<Knoten-id>`
        // (WGSLNodeBuilder, ohne setName) — jede InstancedMesh bekam so ihren EIGENEN Quelltext, ihr eigenes
        // Programm, ihre eigene Pipeline: gemessen 02.10. an der Mess-Wiese 675 Vertex-Programme, ohne die
        // Ziffern 39 Familien — jede neue Streu-Gruppe ein Kompilat beim Laufen. Je Draw gibt es genau EINE
        // Instanz-Matrix (und die Vorgänger-Matrix für Velocity) → ein fester Name macht gleiche Objekte gleich.
        const IN = THREE.InstanceNode;
        if (!IN || !IN.prototype || typeof IN.prototype._createInstanceMatrixNode !== "function")
            this.log(
                "INSTANZ-PUFFER-NAME: r184-InstanceNode._createInstanceMatrixNode nicht gefunden (Vendor-Drift)",
                "ERROR"
            );
        else if (!IN.__anazhName) {
            const matrixRoh = IN.prototype._createInstanceMatrixNode;
            IN.prototype._createInstanceMatrixNode = function (assignBuffer, builder) {
                const n = matrixRoh.call(this, assignBuffer, builder);
                const puffer = n && n.node;
                if (puffer && puffer.isBufferNode && typeof puffer.setName === "function")
                    puffer.setName(assignBuffer ? "instanzMatrix" : "instanzMatrixVor");
                // DER URSPRUNG DER INSTANZ (`_instanzMitteNode`, das Maß der Blende): r184 legt den InstancedMeshNode je
                // Bau neu an (`setupPosition`, auch im Schattenpass) und baut die Matrix dort VOR jedem Fragment-Knoten
                if (assignBuffer && builder) builder.__anazhInstanzMatrix = n;
                return n;
            };
            IN.__anazhName = true;
        }
        // DER STABILE KNOCHEN-NAME: dieselbe Klasse für die Haut jedes Leibs (`_knochenPufferName`)
        this._knochenPufferName();
        // DIE SCHATTEN-DIÄT: r184 zeichnet jede Kaskade mit EINEM geteilten Schatten-Material je Licht
        // (isShadowPassMaterial), in das je Objekt die Knoten des Original-Materials gehängt werden. Sein Beobachter
        // meldet über context.getShadow immer hasNode → jedes Diät-Objekt refreshte je Kaskade und Frame
        // (gemessen 04.10. nach der Haupt-Diät: Blume 360, Geröll 224 von 1176 Refreshs je Frame). Trägt das
        // ORIGINAL die Diät (nur geteilte renderGroup-Uniforms), fährt der Schatten-Beobachter dieselbe EINE Prüfung.
        // Die Basisklasse exportiert window.THREE nicht — sie ist der Prototyp von MeshBasicNodeMaterial.
        const NM =
            THREE.MeshBasicNodeMaterial && Object.getPrototypeOf(THREE.MeshBasicNodeMaterial.prototype).constructor;
        if (!NM || !NM.prototype || typeof NM.prototype.setupObserver !== "function")
            this.log("SCHATTEN-DIÄT: r184-NodeMaterial.setupObserver nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!NM.__anazhSchattenDiaet) {
            const beobRoh = NM.prototype.setupObserver;
            NM.prototype.setupObserver = function (builder) {
                const o = beobRoh.call(this, builder);
                if (!o || this.isShadowPassMaterial !== true || typeof o.needsRefresh !== "function") return o;
                const altNR = o.needsRefresh;
                o.needsRefresh = function (ro, frame) {
                    const om = ro && ro.object ? ro.object.material : null;
                    if (!om || om._anazhDiaet !== true) return altNR.call(this, ro, frame);
                    return AnazhRealm._diaetRefresh(this, ro, frame, altNR);
                };
                return o;
            };
            NM.__anazhSchattenDiaet = true;
        }
        // DIE SENKE ZEICHNET ÜBER IHREN ZEICHNER (1410-1, `_instanzZeichner`): r184 instanziert in `setupPosition` nur eine
        // InstancedMesh (InstanceNode, der die Puffer des Objekts in den Graphen bindet — und den Schlüssel trägt die uuid).
        // Zeichnet ein Zeichner, steht der EINE Instanz-Knoten (`_senkenKnoten`) dort, wo r184 seinen InstanceNode auf den Stapel
        // legt: sein setup legt die Matrix am Builder ab (die Naht `_weltNaht` des positionNode liest sie), seine Zuweisung von Lage,
        // Normale und Farbe baut NACH der des positionNode (Lehre 22) — im Hauptbild wie in jeder Kaskade (der Schatten-Stoff ist
        // ein Knoten-Stoff).
        if (NM && NM.prototype && typeof NM.prototype.setupPosition === "function" && !NM.__anazhSenke) {
            const posRoh = NM.prototype.setupPosition;
            NM.prototype.setupPosition = function (builder) {
                if (builder.object && builder.object.isInstanzZeichner === true)
                    AnazhRealm._senkenKnoten().instanz.toStack();
                return posRoh.call(this, builder);
            };
            NM.__anazhSenke = true;
        } else if (!NM || !NM.prototype || typeof NM.prototype.setupPosition !== "function")
            this.log("DIE SENKE: r184-NodeMaterial.setupPosition nicht gefunden (Vendor-Drift)", "ERROR");
        // DER EINE KNOTEN JE QUELLE (r184 gelesen, vendor/three.webgpu.min.js + vendor/CSMShadowNode.js): eine geteilte
        // Uniform-Gruppe (renderGroup: Kamera · Lichter · Welt-Sätze) teilt r184 über Programme hinweg nur bei GLEICHEN
        // Knoten — `_getBindGroup` schlüsselt sie nach den sortierten Knoten-ids, je Render-Kontext EIN Puffer. Zwei
        // Erzeuger bauten ihre Knoten je Programm neu: `reference(…)` legt seinen Uniform-Knoten je ReferenceNode an
        // (setNodeType), und der Schatten-Filter ruft es je Bau (ShadowNode: radius · mapSize je Kaskade); die CSM baut in
        // `setup` je Programm camera.near · cascades · shadowFar. Jedes beleuchtete Programm trug so seine EIGENE Render-
        // Gruppe, und jede Änderung von Kamera, TRAA-Zittern, Sonne oder Wind schrieb sie je Programm. Gemessen 07.10. an
        // der Mess-Wiese (echte GPU, Stand, ein Frame): 192 Programme, 153 geteilte Gruppen, 121 Gruppen-Uploads und 1 042
        // writeBuffer — dieselbe Kamera 80-mal hochgeladen. Ein Verweis einer geteilten Gruppe auf dasselbe Objekt und
        // dieselbe Eigenschaft trägt jetzt EINEN Uniform-Knoten, die CSM baut ihren Knoten einmal je Instanz (TSL baut einen
        // Knoten in jedem Programm für sich); Verweise ohne festes Objekt (je Zeichen-Objekt) bleiben je Knoten.
        // gate:vendor-anker pinnt beide Stellen und den Schlüssel, gate:kamera-treue zählt die Gruppen am echten Bild.
        const REF = THREE.TSL.reference;
        let refProto = Object.getPrototypeOf(REF("x", "float", { x: 0 }));
        while (refProto && !Object.prototype.hasOwnProperty.call(refProto, "setNodeType"))
            refProto = Object.getPrototypeOf(refProto);
        if (!refProto) this.log("EIN KNOTEN: r184-ReferenceNode.setNodeType nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!refProto.__anazhEinKnoten) {
            const typRoh = refProto.setNodeType;
            const jeQuelle = new WeakMap();
            refProto.setNodeType = function (typ) {
                const g = this.group;
                const o = this.object;
                if (!g || g.shared !== true || o === null || typeof o !== "object") return typRoh.call(this, typ);
                let m = jeQuelle.get(o);
                if (!m) jeQuelle.set(o, (m = new Map()));
                const k = `${this.property}|${typ}|${this.count}|${g.name}|${this.name}`;
                const n = m.get(k);
                if (n) {
                    this.node = n;
                    return;
                }
                typRoh.call(this, typ);
                m.set(k, this.node);
            };
            refProto.__anazhEinKnoten = true;
        }
        // DER EINE AUFBAU WIRD OHNE STAPEL GEBOREN (w28-ankunft-stapel, ankunft K3): der Graph, den JEDES Programm liest, entsteht im
        // Bau des Programms, das zuerst kommt — und r184 hängt jede Variable an den Stapel, der bei ihrer Geburt läuft (`toStack`:
        // der laufende Stapel der TSL; jeder Eingang einer TSL-Funktion ist eine solche Variable, `toVarIntent`). Der Licht-Stapel
        // des ERSTEN Programms trug so den Schatten-Teil als eigene Anweisungen, jeder Knoten darin zählte zwei Leser und stand als
        // Variable im Text; jedes spätere Programm schrieb denselben Graphen als Ausdruck. Wer zuerst kommt, hängt am Gang des
        // Boots: GTX 1050 am Kopf von w28-ankunft-reihe, 6 Kalt- und 6 Zweit-Boots — die Arena des Lebens (Vögel, Fische,
        // Bestäuber) trug kalt 6-mal 68 205 Bytes Fragment, an der Wiederkehr 4-mal 71 007 (48 Variablen mehr, `linearDepth` 26-
        // statt 23-mal gezählt): die EINE Pipeline, die den Pipeline-Cache des Browsers noch verfehlte. Der Aufbau läuft jetzt
        // ohne laufenden Stapel — jedes Programm, das erste wie das letzte, liest den Graphen als Ausdruck. Die Sonnen-Sicht über
        // den Kaskaden (`anazhSicht`, dirigent-ankunft) entsteht im selben Aufbau: EIN Ort, EIN Gedächtnis (`anazhAufbau`, an der
        // Instanz — die Linse stellt die Geburt nach, gate:kamera-treue). Der Stapel der TSL ist gerufen, nie gefragt: fehlt er dem
        // Vendor, wirft der erste Bau (gate:vendor-anker pinnt die Stelle).
        const CSM = THREE.CSMShadowNode;
        if (typeof CSM !== "function" || typeof CSM.prototype.setup !== "function")
            this.log("EIN KNOTEN: CSMShadowNode.setup nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!CSM.__anazhEinAufbau) {
            const aufbauRoh = CSM.prototype.setup;
            CSM.prototype.setup = function (builder) {
                let n = this.anazhAufbau;
                if (n === undefined) {
                    const vor = THREE.TSL.getCurrentStack();
                    THREE.TSL.setCurrentStack(null);
                    try {
                        n = aufbauRoh.call(this, builder).mul(this.anazhSicht());
                    } finally {
                        THREE.TSL.setCurrentStack(vor);
                    }
                    this.anazhAufbau = n;
                }
                return n;
            };
            CSM.__anazhEinAufbau = true;
        }
        // DAS REGISTER DER REGUNG: der EINE needsUpdate-Setter meldet jede Version (`_regungMelder`, in der Diät-Scheibe)
        this._regungMelder();
        // Ab hier hängen die Eingriffe am Renderer-EXEMPLAR; der Null-Renderer (headless) zeichnet nie. Fehlt einem
        // echten Renderer eine der r184-Stellen, meldet sich der Eingriff laut (gate:vendor-anker pinnt jede).
        if (renderer._isHeadlessNull) return;
        // DIE SCHATTEN-FARBE DES LICHTS, dieselbe Klasse an der zweiten Stelle (r184 `AnalyticLightNode.setupShadow`): das Licht
        // baut sein Produkt Farbe × Schatten EINMAL (`shadowColorNode`), im Bau des Programms, das es zuerst beleuchtet — die
        // Variable darum hing an dessen Licht-Stapel, und `LightsNode.analyze` baut jeden Eintrag seines Stapels: nur dieses eine
        // Programm zählte das Produkt zweimal und schrieb es als Variable (die Arena des Lebens 68 268 statt 68 205 Bytes, an 4
        // von 12 Boots — kalt wie an der Wiederkehr). Der erste Ruf läuft ohne laufenden Stapel, jeder weitere wie im Vendor.
        // Die Klasse steht im Register des Renderers (der Knoten des Richtungslichts erbt sie).
        let LICHT = renderer.library.getLightNodeClass(THREE.DirectionalLight).prototype;
        while (LICHT && !Object.prototype.hasOwnProperty.call(LICHT, "setupShadow"))
            LICHT = Object.getPrototypeOf(LICHT);
        if (!LICHT) this.log("EIN KNOTEN: r184-AnalyticLightNode.setupShadow nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!LICHT.__anazhEinAufbau) {
            const schattenRoh = LICHT.setupShadow;
            LICHT.setupShadow = function (builder) {
                if (this.shadowColorNode !== null) return schattenRoh.call(this, builder);
                const vor = THREE.TSL.getCurrentStack();
                THREE.TSL.setCurrentStack(null);
                try {
                    return schattenRoh.call(this, builder);
                } finally {
                    THREE.TSL.setCurrentStack(vor);
                }
            };
            LICHT.__anazhEinAufbau = true;
        }
        // DIE REIHE DER GLIEDER FOLGT DEM GRAPHEN (w28-ankunft-reihe, ankunft K3 — r184 gelesen, vendor/three.webgpu.min.js):
        // `NodeBuilder._getBindGroup` sortiert die Glieder jeder geteilten Uniform-Gruppe nach der GEBURTS-Nummer ihres Knotens
        // (`uniforms.sort` nach `node.id`), und `buildCode` schreibt die Struktur in dieser Folge ins WGSL (`sortBindingGroups`
        // steht vor `getUniforms`). Die Geburten hängen am Gang des Boots: die Kamera-Matrizen des Vendors, die Schatten-Verweise
        // und die Uniformen des Rückstrahls entstehen IM Knoten-Bau, und der geht in Raten, verschränkt (`_knotenRate`) — kalt
        // standen `cameraProjectionMatrix`/`cameraViewMatrix` vor dem Atmo-Satz (41 Glieder), am Zweit-Boot dahinter. Dieselben
        // Programme trugen so je Boot-Art andere Bytes, und der Pipeline-Cache des Browsers (`DawnWebGPUCache`, er trifft nur
        // gleiche Bytes) verfehlte an der ersten Wiederkehr 20 von 42 Pipelines: GTX 1050, kalt → Zweit-Boot im selben Profil,
        // fremd 20 (je 1,25–1,36 s, Σ 21–23 s in der Schlange des GPU-Prozesses), Weltbild 13,0–13,4 s; ab der zweiten
        // Wiederkehr 10,2–11,1 s. Jetzt bleibt die Reihe, wie der Bau des Stoffs sie ging (die Sortierung ruht): der Text ist
        // eine Funktion des Graphen, der Schlüssel der geteilten Gruppe die Folge ihrer Knoten in dieser Reihe — gleiche Graphen
        // teilen wie zuvor (geteilte Gruppen kalt 40 ↔ 40, Zweit-Boot 38 ↔ 38). Die Klasse des Bauers exportiert das Bündel
        // nicht in die Welt: der erste Bauer des Backends nennt sie, EINMAL. gate:vendor-anker pinnt die Stellen, die
        // Programm-Zeile von gate:boot-stage (`--profil`) zählt die fremden Bytes der Wiederkehr.
        const be = renderer.backend;
        if (!be || typeof be.createNodeBuilder !== "function")
            this.log("DIE REIHE DER GLIEDER: r184-Backend.createNodeBuilder nicht gefunden (Vendor-Drift)", "ERROR");
        else {
            const welt = this;
            const bauerRoh = be.createNodeBuilder;
            const reiheHalten = function () {
                return this;
            };
            be.createNodeBuilder = function (object, rend) {
                const b = bauerRoh.call(this, object, rend);
                be.createNodeBuilder = bauerRoh;
                let K = Object.getPrototypeOf(b);
                while (K && !Object.prototype.hasOwnProperty.call(K, "_getBindGroup")) K = Object.getPrototypeOf(K);
                if (!K)
                    welt.log(
                        "DIE REIHE DER GLIEDER: r184-NodeBuilder._getBindGroup nicht gefunden (Vendor-Drift)",
                        "ERROR"
                    );
                else if (!K.__anazhReihe) {
                    const gruppeRoh = K._getBindGroup;
                    K._getBindGroup = function (name, bindings) {
                        for (const g of bindings)
                            if (
                                g &&
                                g.isNodeUniformsGroup === true &&
                                g.groupNode &&
                                g.groupNode.shared === true &&
                                g.uniforms.sort !== reiheHalten
                            )
                                Object.defineProperty(g.uniforms, "sort", { value: reiheHalten });
                        return gruppeRoh.call(this, name, bindings);
                    };
                    K.__anazhReihe = true;
                }
                return b;
            };
        }
        // DIE DRAW-WAHRHEIT IM INFO: r184 bucht einen Draw nur, wenn der Backend-Draw läuft — beim AUFNEHMEN
        // eines RenderBundles; der Replay (`_renderBundle`, Versions-Treffer) zieht die aufgenommenen
        // RenderObjects ohne Buchung. Die Region-Bundles tragen den ganzen statischen Bestand: HUD, Regler und
        // Flugschreiber lasen an der Mess-Wiese 148 dc, wo die GPU 1 149 Befehle ausführte (02.10.). Der
        // Replay bucht jetzt jeden aufgenommenen RenderObject wie der Backend-Draw (info.update).
        // DAS SIEGEL TRÄGT DIE MARKE DER ERST-ZEICHNUNG (`_erstWartet` (2)): versiegelte eine Aufnahme ohne einen Bürger,
        // der auf seinen Knoten-Bau wartet oder dessen Pipeline absagte, nimmt das Bündel im NÄCHSTEN Render neu auf — die
        // Marke fällt hier, gleich nach r184s Siegel (`u.version=s.version`, 6:413962, es schluckte eine Marke von mittendrin).
        // Ein Mikrotask kam zu spät: jedes Bild im selben Task (die Warm-Frames einer Aufnahme, die Proben der Wand) spielte das
        // Bündel ohne den Bürger ab und zählte keinen wartenden Draw — die Beweis-Aufnahme stand still grün (Erst-Zeichnungs-
        // Wand, Absage einer Pipeline, 30.10.: das erste Bild der Aufnahme wartete 0, sie endete nach 1 Frame ohne Wurf).
        if (!renderer.info || typeof renderer._renderBundle !== "function")
            this.log("DRAW-WAHRHEIT: r184-Renderer._renderBundle nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!renderer.__anazhReplayBuchung) {
            const replayRoh = renderer._renderBundle;
            const welt = this;
            renderer._renderBundle = function (bundle, sceneRef, lightsNode) {
                const rb = this._bundles.get(bundle.bundleGroup, bundle.camera, this._currentRenderContext);
                const daten = this.backend.get(rb);
                const replay = daten.bundleGPU !== undefined && bundle.bundleGroup.version === daten.version;
                const aus = replayRoh.call(this, bundle, sceneRef, lightsNode);
                if (replay && daten.renderObjects)
                    for (const ro of daten.renderObjects) {
                        const dp = ro.getDrawParameters();
                        if (dp) this.info.update(ro.object, dp.vertexCount, dp.instanceCount);
                    }
                const E = welt._erstZeichnung;
                if (!replay && E && E.aufnehmen.delete(bundle.bundleGroup)) bundle.bundleGroup.needsUpdate = true;
                // DAS ABSPIEL OHNE BÜRGER (`_bildWartet`): ein Bündel der Welt-Szene, das ohne einen Bürger versiegelte, spielt
                // bis zu dessen Pipeline ohne ihn ab — in DIESEM Bild fehlt er wie in dem seiner Aufnahme
                if (replay && E && E.offen.size > 0 && sceneRef === welt.state.scene)
                    for (const [pipe, warten] of E.offen)
                        if (warten.has(bundle.bundleGroup) && !E.bildWartet.has(pipe))
                            E.bildWartet.set(pipe, { ro: null, fest: false });
                return aus;
            };
            renderer.__anazhReplayBuchung = true;
        }
        // DIE BUNDLE-WAHRHEIT AM CHOKEPOINT `_renderScene` (r184 gelesen, vendor/three.webgpu.min.js): jeder Render —
        // Hauptbild, jede Schatten-Kaskade, jeder Post-Pass — läuft durch ihn, auch verschachtelt (der Schatten startet
        // am ersten Licht-Empfänger MITTEN im Hauptbild).
        // (1) DER AUFNAHME-STAPEL: `_renderBundle` setzt `_currentRenderBundle` zum Aufnehmen und danach auf null, ohne
        //     Stapel; `_renderObjectDirect` verfolgt einen Draw nur, solange der Zeiger steht, und der Replay refresht nur
        //     Verfolgte. Der Schatten-Render nullte den Zeiger der Haupt-Aufnahme: gemessen 04.10. (echte GPU, Mess-
        //     Wiese) 107 von 237 aufgenommenen Draws verfolgt, der Rest behielt die Kamera seiner Aufnahme. Jeder Render
        //     sichert den Zeiger der äußeren Aufnahme und gibt ihn zurück; ein verschachtelter Render nimmt nie in sie auf.
        // (2) KEIN BUNDLE UNTER EINEM OVERRIDE-STOFF: `renderObject` richtet den geteilten Override-Stoff (Schatten:
        //     isShadowPassMaterial) je Objekt ein (alphaTest · alphaMap · Seite · Knoten des Originals); Knoten und Seite
        //     setzt es danach zurück, alphaTest · alphaMap bleiben vom zuletzt direkt gezeichneten Werfer. Der Replay
        //     refresht seine Bürger außerhalb davon — gegen diesen fremden Stoff-Zustand. Gemessen 04.10.: der Schatten-
        //     Replay warf das ausgeschnittene Laub voll (81 % gleiche Pixel gegen den direkten Pfad, Rauschboden 90 %;
        //     mit dem alphaTest eines vollen Werfers reproduzierbar 0,817 gegen 0,902), eine Neuaufnahme je Frame stellte
        //     90 % her. Ein Render mit overrideMaterial sammelt keine Bundles: `_projectObject` liest eine BundleGroup als
        //     Gruppe, solange `backend.beginBundle` fehlt. gate:vendor-anker pinnt beide Stellen und fährt den Block am
        //     Schein-Renderer, gate:kamera-treue an einer Bühne am echten WebGPU mit Schatten.
        if (typeof renderer._renderScene !== "function" || !renderer.backend)
            this.log("BUNDLE-WAHRHEIT: r184-Renderer._renderScene nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!renderer.__anazhBundleWahrheit) {
            const szeneRoh = renderer._renderScene;
            const be = renderer.backend;
            // (3) DIE WELT-MATRIZEN EINMAL JE BILD (Welle K): r184 rechnet in JEDEM `_renderScene` den ganzen Szenen-
            //     Graphen neu (`scene.updateMatrixWorld()` bei matrixWorldAutoUpdate) — auch in jeder Kaskade, die mitten im
            //     Hauptbild derselben Szene startet. Gemessen 07.10. (Radeon, Mess-Wiese, echter Loop): 2,1 Graph-Gänge je
            //     gerendertem Bild (Hauptbild + Kaskaden), ~1000 Knoten je Gang. Zwischen dem Hauptbild und seinen
            //     verschachtelten Pässen bewegt sich nichts (kein Spiel-Takt läuft, kein Haken schreibt Matrizen): ein
            //     verschachtelter Render DERSELBEN Szene liest die Matrizen, die ihr äußerer Render eben rechnete.
            const offen = new Set();
            renderer._renderScene = function (scene, camera, useFrameBufferTarget) {
                const aufnahme = this._currentRenderBundle;
                const override = !!(scene && scene.overrideMaterial);
                const eigen = Object.prototype.hasOwnProperty.call(be, "beginBundle");
                const beginRoh = be.beginBundle;
                const innen = !!scene && offen.has(scene) && scene.matrixWorldAutoUpdate === true;
                this._currentRenderBundle = null;
                if (override) be.beginBundle = undefined;
                if (innen) scene.matrixWorldAutoUpdate = false;
                const aussen = !!scene && !offen.has(scene);
                if (aussen) offen.add(scene);
                try {
                    return szeneRoh.call(this, scene, camera, useFrameBufferTarget);
                } finally {
                    if (aussen) offen.delete(scene);
                    if (innen) scene.matrixWorldAutoUpdate = true;
                    this._currentRenderBundle = aufnahme;
                    if (override) {
                        if (eigen) be.beginBundle = beginRoh;
                        else delete be.beginBundle;
                    }
                }
            };
            renderer.__anazhBundleWahrheit = true;
        }
        // DIE BUNDLE-REIHENFOLGE: r184 sammelt die Bundles eines Passes und führt sie erst in finishRender aus — NACH
        // allen direkten Draws. Der Feld-Pass („letzter Draw, nur Himmel-Pixel überleben") und das Wasser liefen so
        // VOR Pflanzen, Boden und Bauten (alles Bundles): der Feld-March traced JEDES Pixel gegen einen fast leeren
        // Tiefenpuffer, das Wasser mischte sich gegen den leeren Grund und seine Ufer-Tiefe sah keinen Boden (gemessen
        // 04.10., echte GPU, Mess-Wiese). Die Bundles laufen jetzt sofort nach ihrer Aufnahme/ihrem Replay, die
        // direkten Draws danach — die Reihenfolge, die der Code behauptet. executeBundles leert den Pass-Zustand, der
        // gemerkte Zustand fällt mit (dasselbe Muster wie r184 nach dem Pass-Bruch). Array-Kameras behalten ihren Pfad.
        // Nur das WebGPU-Backend nimmt Bundles auf (der WebGL2-Rückfall liest jede BundleGroup als Gruppe).
        if (renderer.backend && renderer.backend.isWebGPUBackend) {
            if (
                typeof renderer._renderBundles !== "function" ||
                typeof renderer.backend._isRenderCameraDepthArray !== "function"
            )
                this.log("BUNDLE-REIHENFOLGE: r184-Renderer._renderBundles nicht gefunden (Vendor-Drift)", "ERROR");
            else if (!renderer.__anazhBundleReihenfolge) {
                const bundlesRoh = renderer._renderBundles;
                const welt = this;
                renderer._renderBundles = function (bundles, sceneRef, lightsNode) {
                    for (let i = 0; i < bundles.length; i++)
                        if (bundles[i].bundleGroup.userData._creatureSkin === true)
                            welt._leibBuendelStand(this, bundles[i]);
                    const aus = bundlesRoh.call(this, bundles, sceneRef, lightsNode);
                    const rc = this._currentRenderContext;
                    const d = rc ? this.backend.get(rc) : null;
                    if (
                        d &&
                        d.currentPass &&
                        d.renderBundles &&
                        d.renderBundles.length > 0 &&
                        !this.backend._isRenderCameraDepthArray(rc)
                    ) {
                        d.currentPass.executeBundles(d.renderBundles);
                        d.renderBundles = [];
                        d.currentSets = { attributes: {}, bindingGroups: [], pipeline: null, index: null };
                    }
                    return aus;
                };
                renderer.__anazhBundleReihenfolge = true;
            }
            // EIN SCHREIBEN JE PUFFER: r184 lädt eine Uniform-Gruppe Bereich für Bereich hoch — je geänderter Uniform ein
            // eigenes writeBuffer (bindingUtils.updateBinding). Kamera-Matrizen, Licht-Richtung und Zeit ändern sich
            // zusammen: gemessen 07.10. (Mess-Wiese, Stand) 18 Gruppen-Uploads in 170 writeBuffer je Frame. Eine Gruppe
            // mit mehreren geänderten Bereichen lädt jetzt EINEN Bereich vom ersten bis zum letzten (dazwischen liegen
            // die gültigen Werte der Gruppe); r184 leert die Bereiche nach dem Upload (`_update`).
            const be = renderer.backend;
            if (typeof be.updateBinding !== "function")
                this.log("EIN SCHREIBEN: r184-Backend.updateBinding nicht gefunden (Vendor-Drift)", "ERROR");
            else if (!be.__anazhEinSchreiben) {
                const bindungRoh = be.updateBinding;
                be.updateBinding = function (b) {
                    const rs = b && b.isNodeUniformsGroup === true ? b.updateRanges : null;
                    if (rs && rs.length > 1) {
                        let a = rs[0].start,
                            z = a + rs[0].count;
                        for (let i = 1; i < rs.length; i++) {
                            if (rs[i].start < a) a = rs[i].start;
                            if (rs[i].start + rs[i].count > z) z = rs[i].start + rs[i].count;
                        }
                        rs.length = 0;
                        rs.push({ start: a, count: z - a });
                    }
                    return bindungRoh.call(this, b);
                };
                be.__anazhEinSchreiben = true;
            }
            // DIE VERDECKUNGS-ABFRAGE SCHLIESST NUR, WAS SIE BEGANN (0910-3 A, Leben-Schau 2: am Bach beim Aussteigen „No
            // occlusion queries are active" in renderContext_4/_6, danach ungültige Command-Buffer und „Invalid value used in
            // weak set"). r184 hält die offene Occlusion-Query nur indirekt: sie beginnt im Draw eines Objekts mit
            // `occlusionTest` und endet träge beim Draw des NÄCHSTEN (`lastOcclusionObject`). Drei Vendor-Stellen nehmen dabei
            // an, dass JEDES gezählte Objekt (`renderContext.occlusionQueryCount`, die Render-Liste) in einem durchgehenden
            // Pass begann:
            //   (1) `copyFramebufferToTexture` (das Tiefen-Abbild für Wasser und Feld-Pass, jede Viewport-Textur) beendet den
            //       Pass mitten im Bild: die offene Query endet nie („ended with incomplete occlusion query"), die nächste
            //       Zeichnung schließt sie im neuen Pass, in dem keine offen ist;
            //   (2) `finishRender` schließt, sobald weniger begonnen als gezählt wurden — auch wenn keine offen ist. Ein
            //       gezähltes Objekt beginnt nicht, wenn seine Pipeline nicht steht (die Erst-Zeichnung wartet oder verschiebt
            //       es) oder als gescheitert gilt (`pipelineData.error`, auch durch einen FREMDEN Fehler, den r184s Fehler-
            //       Bereich um den asynchronen Bau einfängt) → „No occlusion queries are active", der Frame ungültig;
            //   (3) `resolveOccludedAsync` legt jedes Objekt mit 0 Proben in ein WeakSet — die Lücke eines nie begonnenen
            //       Index ist `undefined` → „Invalid value used in weak set" (das Ergebnis eines ungültigen Frames ist 0);
            //   (4) `beginRender` setzt `lastOcclusionObject` (und den Abfrage-Satz) nur bei Zähler > 0 zurück: war in einem
            //       Probe-Frame ein Stellvertreter der LETZTE Draw, schließt der nächste Frame mit Zähler 0 (der Berg-Cull fragt
            //       jeden `queryTakt`-ten) seine Abfrage beim ersten Draw — in einem Pass ohne Abfrage-Satz (Gegenprüfung
            //       10.10., Radeon, Mess-Wiese, Bündel seitlich: 176 Meldungen in 45 s am Kopf 1457bfa9, 382 an main).
            // Der EINE Ort: der Bruch schließt die offene Abfrage im alten Pass, `finishRender` schließt nur eine offene, und mit
            // ihm endet die Abfrage des Kontexts (`lastOcclusionObject` fällt; den Satz zerstört r184 selbst im nächsten
            // Probe-Frame), das Auflösen überspringt Lücken. Nachgestellt in gate:verdeckungs-abfrage (am Bach, Aussteigen;
            // die Stationen Bruch, Gift, Letzter).
            const VERDECKT_LEER = {};
            const offen = (d) => {
                const o = d.lastOcclusionObject;
                return !!(o && o.occlusionTest === true);
            };
            if (
                typeof be.copyFramebufferToTexture !== "function" ||
                typeof be.finishRender !== "function" ||
                typeof be.resolveOccludedAsync !== "function"
            )
                this.log(
                    "VERDECKUNGS-ABFRAGE: r184-Backend copyFramebufferToTexture/finishRender/resolveOccludedAsync nicht gefunden (Vendor-Drift)",
                    "ERROR"
                );
            else if (!be.__anazhVerdeckung) {
                const bruchRoh = be.copyFramebufferToTexture;
                be.copyFramebufferToTexture = function (textur, kontext, rechteck) {
                    const d = this.get(kontext);
                    if (d && d.currentPass && d.occlusionQuerySet !== undefined) {
                        if (offen(d)) {
                            d.currentPass.endOcclusionQuery();
                            d.occlusionQueryIndex++;
                        }
                        d.lastOcclusionObject = null;
                    }
                    return bruchRoh.call(this, textur, kontext, rechteck);
                };
                const schlussRoh = be.finishRender;
                be.finishRender = function (kontext) {
                    const d = this.get(kontext);
                    // keine offen → r184s Vergleich `occlusionQueryCount > occlusionQueryIndex` schließt nichts; danach liest
                    // r184 nur noch den Zähler (resolveQuerySet über occlusionQueryCount)
                    if (d && d.occlusionQuerySet !== undefined && !offen(d))
                        d.occlusionQueryIndex = Math.max(d.occlusionQueryIndex, kontext.occlusionQueryCount);
                    const aus = schlussRoh.call(this, kontext);
                    // (4) die Abfrage endet mit ihrem Render — der nächste Frame (Zähler 0) erbt keinen offenen Stellvertreter
                    if (d) d.lastOcclusionObject = null;
                    return aus;
                };
                const aufloesenRoh = be.resolveOccludedAsync;
                be.resolveOccludedAsync = function (kontext) {
                    const d = this.get(kontext);
                    const objekte = d ? d.currentOcclusionQueryObjects : null;
                    if (objekte)
                        for (let i = 0; i < objekte.length; i++)
                            if (objekte[i] === undefined) objekte[i] = VERDECKT_LEER;
                    return aufloesenRoh.call(this, kontext);
                };
                be.__anazhVerdeckung = true;
            }
        }
        // DER SCHATTEN-STOFF JE OBJEKT: r184 setzt in `renderObject` je Objekt `alphaTest` (und Seite, Knoten) des
        // Originals auf den EINEN geteilten Schatten-Stoff; der Material-Setter zählt bei jedem Wechsel über 0 die
        // Version hoch. Ausgeschnittene Blätter und volle Stämme wechseln sich ab → die Version sprang je Objekt, jeder
        // Schatten-Bürger rechnete je Kaskade und Frame seinen ganzen Material-Schlüssel neu (getCacheKey ·
        // getMaterialCacheKey) und prüfte seine Pipeline neu (gemessen 04.10., echte GPU, Mess-Wiese, Schattenpass
        // direkt: 342 ms Schlüssel-Rechnung in 8 s, die Schatten-Pässe 1330 → 585 ms). Der Schatten-Stoff trägt jetzt je
        // Objekt die Version des Original-Materials: ein Bürger prüft seinen Schlüssel genau dann, wenn SEIN Material
        // sich änderte (auch dessen eigener alphaTest-Wechsel), der geteilte Setter zählt nichts mehr.
        if (typeof renderer.renderObject !== "function")
            this.log("SCHATTEN-STOFF: r184-Renderer.renderObject nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!renderer.__anazhSchattenStoff) {
            const objektRoh = renderer.renderObject;
            const still = new WeakSet();
            renderer.renderObject = function (
                object,
                scene,
                camera,
                geometry,
                material,
                group,
                lightsNode,
                clip,
                passId
            ) {
                const sm = scene ? scene.overrideMaterial : null;
                if (sm && sm.isShadowPassMaterial === true && material && material.allowOverride === true) {
                    if (!still.has(sm)) {
                        Object.defineProperty(sm, "alphaTest", {
                            configurable: true,
                            get() {
                                return this._alphaTest;
                            },
                            set(v) {
                                this._alphaTest = v;
                            },
                        });
                        // DIE SCHATTEN-FORM JE KASKADE EINMAL (w4-b-knoten): r184 legt je Licht einen Schatten-Stoff an, jeden
                        // mit EIGENEM Grund-Knoten `vec4(0,0,0,1)` — dessen id steht im Programm-Schlüssel, und ein Werfer ohne
                        // Ausschnitt (`_wurfOhneFarbe`) wirft mit ihm: jede der drei Kaskaden baute dieselbe Form neu (headless
                        // kalt 01.11.: 14 Bauten EINES Programms, je Werfer k0 · k1 · k2). Jeder Schatten-Stoff trägt den EINEN.
                        sm.colorNode = AnazhRealm._schattenGrund();
                        still.add(sm);
                    }
                    sm.version = material.version;
                }
                return objektRoh.call(this, object, scene, camera, geometry, material, group, lightsNode, clip, passId);
            };
            renderer.__anazhSchattenStoff = true;
        }
        // DER WURF OHNE FARBE (B-K1): ein Werfer ohne Ausschnitt wirft ohne seinen Farb-Graphen (die Hülle um _getShadowNodes)
        this._wurfOhneFarbe(renderer);
        // DIE ERST-ZEICHNUNG (Welle K — die Hänger-Klasse „ein Frame trägt synchron eine schwere Arbeit"; r184 gelesen):
        // `_renderObjectDirect` baut beim ERSTEN Zeichnen eines RenderObjects synchron, was ihm fehlt — den Knoten-Graphen
        // seines Stoffs (`needsRefresh` → `getNodeBuilderState`) und die GPU-Pipeline (`updateForRender` →
        // `device.createRenderPipeline`: der GPU-Prozess übersetzt den Shader, bevor er das nächste Bild zeigt). Die Hänger-
        // Linse nannte 07.10. an der Radeon: 1,4–4,2 s Warten nach synchronen Pipelines (haupt/k0/k1 tier:baer · tier:fuchs ·
        // fimp:atlas:L2 · bauSatz · feld-pass), Knoten-Bauten 50–270 ms je Stoff, bis zu sechs in EINEM Frame (ein Tier:
        // Leib, Fell, Kopf, Kiefer). Für die WELT-Szene gilt hier: (1) jede Pipeline entsteht asynchron — ihr Deskriptor liest
        // Stoff und Ziel synchron im Pass (wie das Vendor-Kompilat), das Objekt zeichnet ab dem Frame, in dem sie steht;
        // (2) der Knoten-Bau bleibt im Pass (er liest MRT, Ziel und contextNode des Renderers, die nur dort gelten — ein
        // buildAsync liefe daneben), aber je Render-Aufruf baut höchstens EINER (weitere nur, solange der Aufruf unter
        // ERST_BAU_MS baute); jeder andere zeichnet ab dem nächsten Aufruf. Wer nicht zeichnen kann, meldet sich in der EINEN
        // Warteschlange an (`_erstWartet`), auf JEDEM Weg — Erstbau, Neubau, fremde Szene: ein Bundle, dessen Bürger so wartet,
        // nimmt neu auf, sobald die fertige Pipeline in r184s Zustand steht (der Vendor-Record droppt unfertige Draws und
        // versiegelt das Bundle; das Vendor-Versprechen hängt am Fehler-Scope und zählt nie). Das gilt der ERSTEN
        // Zeichnung eines Objekts in einem Pass (Render-Kontext · Pass-Kennung): ein Objekt, das dort schon zeichnete, baut
        // einen Neubau (ein Licht kam dazu — r184 schlüsselt das RenderObject je Lichter-Satz und verwirft den Vorgänger im
        // selben `_objects.get` —, sein Stoff wechselte die Variante) wie der Vendor im Frame: was schon zu sehen war, blinkt
        // nicht aus — nur wenn eine Erst-Zeichnung seinen neuen Schlüssel eben asynchron anlegte, wartet er auf dieselbe
        // Pipeline wie sie; der Neubau zählt mit (`neubauN`). Ein Render einer anderen Szene (die Umgebung, ein Post-Quad)
        // zeichnet wie bisher — ein Einmal-Render bliebe leer. Das ist der
        // EINE Ort der Klasse: kein Vorwärmen daneben (das r184-compileAsync baute die Knoten ohnehin synchron —
        // `_geometries.updateForRender` liest die Attribute vor `getForRenderAsync`).
        // Nodes und Pipelines legt erst init() an (dieser Eingriff läuft davor): die Nachbildung liest sie je Aufruf am
        // Renderer; ihre Vendor-Stellen pinnt gate:vendor-anker.
        if (typeof renderer._renderObjectDirect !== "function")
            this.log("ERST-ZEICHNUNG: r184-Renderer._renderObjectDirect nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!renderer.__anazhErstZeichnung) {
            const welt = this;
            const E = this._erstZeichnungStand();
            // der Vendor-Körper: auffrischen, Pipeline (asynchron mit Versprechen-Liste, sonst synchron), zeichnen, wenn sie
            // steht — sonst meldet sich der Bürger an. Auch der synchrone Weg trifft im Cache eine noch offene Pipeline (r184
            // `getForRender`: Cache-Treffer → `e.pipeline=d`, ob fertig oder nicht), wenn eine Erst-Zeichnung ihren Schlüssel
            // eben asynchron anlegte: ein Neubau wartet dann wie sie.
            // trägt das Render-Objekt noch keinen Knoten-Bau (weder eigen noch im Bau-Cache seines Schlüssels)?
            const ungebautVon = (N, ro) =>
                ro._nodeBuilderState === null &&
                N.get(ro).nodeBuilderState === undefined &&
                N.nodeBuilderCache.get(N.getForRenderCacheKey(ro)) === undefined;
            const zeichne = (rend, ro, aufnahme, asynchron, nurBauen) => {
                const N = rend._nodes,
                    P = rend._pipelines;
                E.bau = null; // das Versprechen gehört dem Bau DIESES Aufrufs (`_erstAbsageWache`)
                // wer auf seine Pipeline wartet, läuft durch keinen Knoten (`_renderObjectDirect`: wer nicht zeichnet …)
                const imBau = P.get(ro).pipeline;
                // wer in diesem Bild zeichnen will und nicht zeichnet, nennt sich der Warteschlange (`buerger`, `_bildWartet`) —
                // der Vorbau ohne Draw (`nurBauen`) will nichts zeichnen
                const buerger = nurBauen ? null : ro;
                if (imBau !== undefined && !P.isReady(ro) && !E.abgesagt.has(imBau)) {
                    welt._erstWartet(rend.backend, imBau, aufnahme !== null ? aufnahme.bundleGroup : null, buerger);
                    return false;
                }
                const refresh = N.needsRefresh(ro);
                if (refresh) {
                    N.updateBefore(ro);
                    rend._geometries.updateForRender(ro);
                    N.updateForRender(ro);
                    rend._bindings.updateForRender(ro);
                }
                if (asynchron) {
                    // das Vendor-Versprechen einer neuen Pipeline wartet nach dem Bau noch auf popErrorScope — die Welt
                    // hält es nicht (die Bereitschaft liest `_erstWartet` am Zustand)
                    P.getForRender(ro, E.neu);
                    if (E.neu.length > 0) {
                        E.neu.length = 0;
                        E.pipeAsync++;
                    }
                } else P.updateForRender(ro);
                if (nurBauen) return false;
                if (!P.isReady(ro)) {
                    welt._erstWartet(
                        rend.backend,
                        P.get(ro).pipeline,
                        aufnahme !== null ? aufnahme.bundleGroup : null,
                        buerger
                    );
                    return false;
                }
                if (aufnahme !== null) rend.backend.get(aufnahme).renderObjects.push(ro);
                rend.backend.draw(ro, rend.info);
                if (refresh) N.updateAfter(ro);
                return true;
            };
            renderer._renderObjectDirect = function (object, material, scene, camera, lightsNode, group, clip, passId) {
                const N = this._nodes;
                const ro = this._objects.get(
                    object,
                    material,
                    scene,
                    camera,
                    lightsNode,
                    this._currentRenderContext,
                    clip,
                    passId
                );
                ro.drawRange = object.geometry.drawRange;
                ro.group = group;
                // WER NICHT ZEICHNET, ARBEITET NICHT (Gebot 7): ein Objekt ohne Instanz baut, frischt und zieht nichts, eines,
                // dessen Pipeline noch im Bau steht, läuft durch keinen Knoten (`zeichne`) — kein Zug der Szenen-Tiefe, kein
                // Schatten, keine Kopie ohne Draw (der leere Welt-March zog das Tiefen-Abbild je Frame: ziel-zensus OHNE LESER)
                // — außer im VORBAU des Stufen-Vorlaufs (`_stufenVorlaufWahl`): unter dem Ladeschirm baut eine Arena, deren Form
                // steht, ihr Programm auch in dem Pass, in den gerade keine ihrer Instanzen fällt, ohne Draw. Jede Kaskade rendert
                // in ihr eigenes Ziel (der Schlüssel trägt den Render-Kontext): der Vorlauf-Baum in 30 m fällt in keine nahe — kam
                // er im Gang näher, kompilierte sie dort kalt. Seit w4-b-knoten baut er nach dem Bild (`_vorbauWahl`).
                // DER GAST DER BEDIENUNG (spielgang.K3, `_vorbauBedienung`): was die nächste Eingabe zeigen wird (der Geist eines
                // Hotbar-Bauplans, der Leib einer Seele), baut hier vorab ohne Draw wie die Arena — nach dem Bild, unter der Frist
                // des Render-Aufrufs und nur, wenn die Eingabe ruht (`_eingabeRuht`); der Klick findet Knoten und Pipeline vor.
                // DER GAST DER ANKUNFT (w28-leben-vorbau, `__vorbauGast` "ankunft"): wessen Programm unter dem Ladeschirm bekannt ist
                // und wessen Daten erst nach dem Bild kommen (die Kamm-Krone, `_kammKroneVorbau`), baut GLEICH NACH DEM BILD — er
                // wartet auf keine ruhende Eingabe (seine Daten sind unterwegs). Vor dem Bild merkt er nur, wie jeder Vorbau: dort
                // kostete sein Bau die Ankunft (GTX 1050 kalt, ab dem Buch gemessen, je 4 ↔ 4: mit der Pipeline unter dem Ladeschirm
                // +0,7…+1,5 s — der GPU-Prozess übersetzt in EINER Schlange, jede Pipeline vor dem Bild verschiebt die, auf die es
                // wartet —, nur der Knoten-Graph als letzter Bau +0,5 s: 4 von 4 Paaren später, der Haupt-Faden ist dort belegt).
                const gastArt = object.__vorbauGast;
                // EIN GAST NIMMT KEINEN RAUM (`_gastOhneRaum`): trägt ein Bürger die Prägung, ist das ein Bruch beim Namen, und er
                // zeichnet wie jeder Bürger — die Ausnahme ist nie das Loch.
                const gast = (gastArt === true || gastArt === "ankunft") && welt._gastOhneRaum(object);
                const vorbau = gast || ro.getDrawParameters() === null;
                const ctx = this._currentRenderContext.id;
                const k = passId == null ? ctx : ctx + "|" + passId;
                let merk;
                const aufnahme = this._currentRenderBundle;
                if (vorbau) {
                    const arena = gast || (object.isGeometrieArena === true && object.geometry.index !== null);
                    if (!arena || scene !== welt.state.scene) return;
                    const wahl =
                        gastArt === true && !welt._eingabeRuht()
                            ? null
                            : AnazhRealm._vorbauWahl(
                                  E,
                                  object,
                                  k,
                                  welt._ladeTakt(),
                                  welt.state._weltbildDa,
                                  N.nodeFrame.frameId,
                                  gast
                              );
                    if (wahl !== "bauen") {
                        // ein Gast im Bündel (der Leib) wartet wie ein Bürger ohne Bau: sein Bündel nimmt neu auf, bis er
                        // baute — versiegelt ohne ihn, spielte es ihn nie wieder vor
                        if (gast && aufnahme !== null) welt._erstWartet(this.backend, null, aufnahme.bundleGroup);
                        return;
                    }
                    merk = E.vorgemerkt.get(object);
                }
                if (aufnahme !== null) ro.bundle = aufnahme.bundleGroup;
                // DIE BÜHNE DER KARTE (`_karteWeltBacken`) zeichnet wie die Welt: sie wiederholt ihren Bake, bis jeder Bürger
                // zeichnete — ihre Hüllen wechseln den Stoff, darum zählt dort kein Pass, und ihre Bau-Frist gilt dem ganzen
                // Bake-Versuch (13 Render-Aufrufe), nie je Aufruf
                const B = welt._karteBuehneSatz;
                const buehne = !!B && scene === B.szene;
                // DIE BÜHNEN (Werkstatt-Vorschau, Ich-, Hof-, Feed-Bühne: `_buehneRender` → `_buehneJetzt`) zeichnen wie die
                // Welt — bis 30.10. eigene Renderer, deren erster Render jede Pipeline synchron baute (Tab: 5 054 ms ohne Bild)
                // DER PSO-VORBAU (w16-lade-atem, ankunft.K5 — der Pipeline-Precache von Unreal/Fortnite): im Takt unter dem Ladeschirm
                // entsteht auch die Pipeline eines solchen Renders asynchron (der Treiber übersetzt sie neben dem Bild, nie im
                // GPU-Prozess vor dem nächsten); bis sie steht, zeichnet er nicht und zählt `einmalOffen` — ein Einmal-Render
                // (Atmosphären-Tafel, Umgebung, Wolken- und Horizont-Karte, Welt-Licht, Rückstrahl) liest daran, dass er nicht
                // ganz ist, und zeichnet im nächsten Takt neu (`_atmoZeichne` → false). Bis hier entstanden 16 Pipelines des
                // Boots synchron (Atmosphäre ×5, PMREM ×2, Wolken, Welt-Licht, Post-Kette, Kontakt ×2, Rückstrahl; headless
                // kalt) — Radeon kalt die längste Aufgabe 1,25 s, nur auf der echten GPU.
                // Im Einmal-Render (`_einmalRender`, sein Sammler steht) gilt der Vorbau auch nach dem Bild (`_einmalVorbau`).
                // DAS GESETZ DER SCHEIBE (w27-ankunft-erstbild, ankunft.K5): auch sein KNOTEN-BAU geht in Raten unter der EINEN Frist
                // der Aufgabe (`_knotenRate` → `_bauFrist`), wie jeder Bau der Welt-Szene — bis hier baute der Einmal-Render seinen
                // Graphen am Stück neben der Frist: headless kalt (main da0e790f) hielten Umgebung (PMREM-Filter 138 ms),
                // Rückstrahl (114), Spiegel (126) und Atmosphäre (37–72) im Takt des Lade-Bilds 451 ms in 13 langen Aufgaben, die
                // längste 704 ms. Wartet sein Bau, ist der Render nicht ganz (`einmalOffen`), sein Leser zeichnet im nächsten Takt neu.
                if (scene !== welt.state.scene && !buehne && scene !== welt._buehneJetzt) {
                    if (!welt._psoVorbau() && !E.einmalSammel) zeichne(this, ro, aufnahme, false);
                    else if (E.einmalSammel && ungebautVon(N, ro) && !welt._knotenRate(N, ro, E)) {
                        E.verschoben++;
                        E.einmalOffen++;
                    } else if (!zeichne(this, ro, aufnahme, true)) {
                        E.einmalOffen++;
                        if (E.einmalSammel && E.wartetAuf) E.einmalSammel.add(E.wartetAuf); // worauf er wartet (`_einmalRender`)
                    }
                    return;
                }
                // DIE DIÄT IST DAS GESETZ JEDES WELT-STOFFS (E1, Lehre 25): r184s Beobachter frischt jedes Knoten-Material in
                // JEDEM Render voll auf (hasNode) — die Diät war ein Opt-in an fünf Bau-Stellen, jeder andere Stoff der Welt zahlte
                // je Pass und Bild den vollen Gang über Knoten, Gruppen und Geometrie, auch ohne jede Änderung. Gemessen 17.10.
                // (Radeon, Genesis Third, Regler voll): 2,9 ms je Bild Voll-Refresh — Fern-Ring, Inseln, Arena, Plattform, Himmel,
                // Membranen, Kopf. Jetzt schreibt die Erst-Zeichnung jeden Stoff der Welt-Szene ein, bevor er baut (der Schatten-
                // Stoff trägt die Diät seines Originals); was sich bewegt, atmet oder Knochen trägt, stellt nur seine eigenen Werte (der Objekt-Gang, `_diaetObjektGang`).
                const urStoff = material.isShadowPassMaterial === true ? object.material : material;
                if (urStoff && urStoff._anazhDiaet !== true && !Array.isArray(urStoff))
                    welt._materialObserverDiaet(urStoff);
                const ungebaut = ungebautVon(N, ro);
                let pass = buehne ? undefined : E.gezeichnet.get(object);
                const vor = vorbau ? E.vorgebaut.get(object) : undefined;
                if (vorbau && ((pass !== undefined && pass.has(k)) || (vor !== undefined && vor.has(k))))
                    return void merk.delete(k);
                if (pass !== undefined && pass.has(k)) {
                    // der Neubau eines Objekts, das in diesem Pass schon zeichnete: wie der Vendor, im Frame
                    if (ungebaut) E.neubauN++;
                    zeichne(this, ro, aufnahme, false);
                    return;
                }
                let bau = -1;
                // DER BAU IN RATEN (`_knotenRate`): im laufenden Spiel nach dem Weltbild UND unter dem Ladeschirm baut kein Bild einen
                // Knoten-Graphen am Stück — wer seinen noch nicht hat, wartet wie ein verschobener; der ruhende Loop baut wie bisher.
                // UNTER DEM LADESCHIRM (w19-ankunft-takt, ankunft.K5): bis hier baute dort JEDER Render-Aufruf eines Lade-Bilds am Stück
                // bis zu seinen eigenen LADE_TAKT_MS (Hauptpass, jede Kaskade, jedes Bündel, jeder Bake-Versuch der Karte) — eine
                // Aufgabe hielt 250–480 ms Knoten-Bau (headless kalt 5fb21e29: `build` 18× ≥ 50 ms, die längste Aufgabe 737 ms;
                // Radeon ed7d3d23: 23× ≥ 50 ms vor dem ersten Bild, die längste Aufgabe 832 ms). Jetzt geht der Bau Schritt für
                // Schritt bis zur EINEN Frist der Bau-Arbeit (`_bauFrist`, unter dem Ladeschirm die der Zeichnung `_ladeFrist(true)`,
                // im Bild-Takt ihre zweite Hälfte); was wartet, macht
                // das nächste Bild fällig (`ladeSchuld`, `_ladeBildFaellig`).
                // DAS LADE-BILD IST DIE WELT: unter dem Ladeschirm baut in Raten, was das Lade-Bild zeichnet (Welt-Szene, Kaskaden,
                // Bündel, Karten-Bühne) — nie eine Bühne (`_buehneJetzt`: Ich, Hof, Feed, Werkstatt). Sie öffnet die Eingabe, ihr
                // Vorbau läuft erst nach dem Weltbild (`_vorbauBedienung`); unter dem Ladeschirm zeichnet sie eine Probe, und dort baut
                // sie wie vor w19-ankunft-takt am Stück bis LADE_TAKT_MS je Aufruf. In Raten ließ der Seelenwechsel unter dem
                // Ladeschirm die Bauten der Zwischen-Seelen offen, der zweite Durchgang baute nach (Frost-Wand S2 headless, swiftshader:
                // +13 Module / +11 Pipelines, am Stück +0 / +0; z287 2/2 rot).
                if (
                    ungebaut &&
                    ((welt._ladeTakt() && scene !== welt._buehneJetzt) || (welt.state._weltbildDa && !welt._loopRuht()))
                ) {
                    if (!welt._knotenRate(N, ro, E)) {
                        E.verschoben++;
                        if (welt._ladeTakt()) E.ladeSchuld = true;
                        welt._erstWartet(
                            this.backend,
                            null,
                            aufnahme !== null ? aufnahme.bundleGroup : null,
                            vorbau ? null : ro
                        );
                        return;
                    }
                } else if (ungebaut) {
                    const aufruf = buehne ? B.versuch : this.info.calls;
                    if (E.aufruf !== aufruf) {
                        E.aufruf = aufruf;
                        E.aufrufMs = 0;
                        // unter dem Ladeschirm (nur noch eine Bühne, oben) baut ein Aufruf bis zur Frist des Lade-Frames
                        E.deckel = welt._ladeTakt() ? AnazhRealm.LADE_TAKT_MS : AnazhRealm.ERST_BAU_MS;
                    } else if (E.aufrufMs >= E.deckel) {
                        E.verschoben++;
                        welt._erstWartet(
                            this.backend,
                            null,
                            aufnahme !== null ? aufnahme.bundleGroup : null,
                            vorbau ? null : ro
                        );
                        return;
                    }
                    bau = performance.now();
                }
                const gezeichnet = zeichne(this, ro, aufnahme, true, vorbau);
                if (bau >= 0) {
                    const ms = performance.now() - bau;
                    E.aufrufMs += ms;
                    E.bauN++;
                    E.bauMs += ms;
                }
                if (vorbau) {
                    if (vor === undefined) E.vorgebaut.set(object, new Set([k]));
                    else vor.add(k);
                    merk.delete(k);
                    if (bau >= 0) E.vorbauBild = N.nodeFrame.frameId; // nur ein Knoten-Bau nimmt den Platz des Bilds
                } else if (gezeichnet && !buehne) {
                    if (pass === undefined) E.gezeichnet.set(object, (pass = new Set()));
                    pass.add(k);
                }
            };
            renderer.__anazhErstZeichnung = true;
        }
    }
    // DER STAND DER ERST-ZEICHNUNG (der EINE Ort in `_configureRenderer`): je Render-Aufruf die Bau-Zeit, die Zähler für
    // Flugschreiber und Hänger-Linse (Knoten-Bauten · verschobene Erst-Zeichnungen · asynchrone Pipelines · bereit
    // gewordene) und je offener Pipeline die Bundles, die ohne ihren Bürger versiegelt wurden.
    _erstZeichnungStand() {
        if (!this._erstZeichnung)
            this._erstZeichnung = {
                aufruf: -1,
                aufrufMs: 0,
                deckel: AnazhRealm.ERST_BAU_MS, // die Bau-Zeit je Render-Aufruf am Stück (eine Bühne unter dem Ladeschirm: LADE_TAKT_MS)
                ladeSchuld: false, // unter dem Ladeschirm wartete ein Bau auf die nächste Aufgabe — das nächste Bild ist fällig
                ladeGuthaben: 0, // so lange hielt die GPU-Leine das Bild der offenen Schuld: so lange baut das fällige (`_knotenRate`)
                bauN: 0, // die Knoten-Bauten der Erst-Zeichnung und ihre Zeit — am Stück wie in Raten (`_knotenRate`), EIN Zähler
                bauMs: 0,
                verschoben: 0,
                einmalOffen: 0, // Renders außerhalb der Welt-Szene, deren Pipeline unter dem Ladeschirm noch im Bau stand (PSO-Vorbau)
                pflichtTakt: null, // der Takt, in dem der Bau in Raten sein Pflicht-Stück ging (`_knotenRate`, `_taktZeit`)
                imFlug: new Map(), // Bau-Schlüssel → der laufende Bau in Raten (`_knotenRate`): EINER je Schlüssel
                pipeAsync: 0,
                bereitN: 0,
                absagenN: 0,
                wartetN: 0, // Draws, die nicht zeichnen konnten (ihre Pipeline stand nicht) — der Zähler jedes Backends
                wartetAuf: null, // die Pipeline des letzten wartenden Draws (die Beweis-Aufnahme nennt sie)
                neubauN: 0,
                neu: [],
                bau: null, // { p, label } — das Geräte-Versprechen des eben angelegten Baus
                offen: new Map(),
                namen: new WeakMap(), // Pipeline → ihr Label `renderPipeline_<Stoff>_<id>`
                abgesagt: new WeakSet(),
                aufnehmen: new WeakSet(), // Bundles, versiegelt ohne einen Bürger — ihr Siegel setzt die Marke (`_renderBundle`)
                gezeichnet: new WeakMap(), // Objekt → die Pässe (Render-Kontext|Pass-Kennung), in denen es schon zeichnete
                vorgebaut: new WeakMap(), // Arena → die Pässe, in denen der Vorbau ihr Programm ohne Draw baute
                vorgemerkt: new WeakMap(), // Arena → die Pässe ohne Draw unter dem Ladeschirm: ihr Vorbau folgt nach dem Bild
                bildWartet: new Map(), // Pipeline bzw. Stoff → der Bürger der Welt-Szene, der in DIESEM Bild nicht zeichnete (`_bildWartet`)
                vorbauBild: -1, // das Bild (nodeFrame.frameId) des letzten Vorbaus nach dem Bild — höchstens einer je Bild
            };
        return this._erstZeichnung;
    }
    // DER VORBAU NACH DEM BILD (w4-b-knoten): ein Bau ohne Draw (die Arena im Pass, in den keine ihrer Instanzen fällt) steht
    // nicht im ersten Bild — unter dem Ladeschirm merkt die Erst-Zeichnung seinen Pass vor („merken"), nach dem Bild baut der
    // vorgemerkte („bauen"), höchstens EINER je Bild (jeder Pass ist ein Render-Aufruf mit eigenem Deckel); sonst null. Headless
    // kalt 01.11.: der Vorbau einer Laub-Arena hielt 169 ms Haupt-Faden vor dem Bild. Der Rufer: `_renderObjectDirect` oben.
    static _vorbauWahl(E, arena, pass, lade, bild, frame, gast = false) {
        let merk = E.vorgemerkt.get(arena);
        if (lade) return (merk ? merk.add(pass) : E.vorgemerkt.set(arena, new Set([pass])), "merken");
        // ein Gast merkt jeden Pass selbst vor, in dem er noch nicht baute (der der Bedienung kam nach dem Ladeschirm, der der
        // Ankunft hing schon davor und merkte dort wie jeder Vorbau), und baut wie jede Erst-Zeichnung unter der Frist des
        // Render-Aufrufs (`ERST_BAU_MS`) — der Schutz des Gasts der Bedienung ist die ruhende Eingabe
        const vor = gast && bild ? E.vorgebaut.get(arena) : undefined;
        if (gast && bild && !(vor && vor.has(pass))) {
            if (!merk) E.vorgemerkt.set(arena, (merk = new Set()));
            merk.add(pass);
        }
        return bild && merk && merk.has(pass) && (gast || E.vorbauBild !== frame) ? "bauen" : null;
    }
    // DER KNOTEN-BAU IN RATEN (profiband.K2): r184 baut den Knoten-Graphen eines Render-Objekts am Stück (`NodeBuilder.build`:
    // prebuild, je Stufe setup · analyze · generate jede Shader-Stufe fragment · vertex · compute, buildCode) — 60–100 ms je
    // Stoff (Radeon, Genesis Ego im Stand: das Vorwärmen der Leiber, 11 Bauten Σ 825 ms, je Bild einer, Belegung p95 113,6 ms).
    // Hier geht derselbe Gang Schritt für Schritt (eine Shader-Stufe einer Stufe) im Pass des Render-Objekts — der Bau liest MRT,
    // Ziel und contextNode des Renderers, die nur dort gelten (darum nie buildAsync daneben) —, bis zur EINEN Frist der Bau-Arbeit
    // (`_bauFrist`), auch IM Schritt: zwischen zwei Fluss-Knoten einer Shader-Stufe fragt er sie (der erste Knoten immer; `R.k` ist
    // der nächste, der Vendor setzt je Knoten nur Bau- und Shader-Stufe — headless Erst-Boot: eine Stufe trug bis 90 ms am Stück);
    // der fertige Bau tritt wie im Vendor in den Bau-Cache, ein Zwilling gleichen
    // Schlüssels übernimmt ihn, ein werfender Schritt meldet sich laut und der Vendor baut am Stück. true = der Bau steht.
    // EIN BAU JE SCHLÜSSEL IM FLUG (w4-knoten-wurzel): der laufende Bau eines Schlüssels steht in `E.imFlug`, jedes Render-Objekt
    // desselben Schlüssels geht DENSELBEN Bau weiter — bis hier legte jedes, das im selben Bild kam, seinen eigenen an (die Teile
    // eines Geists, die Kaskaden eines Satzes: Radeon kalt V18.546.159 im Vorbau 48 Zwillings-Bauten, bis neun je Schlüssel).
    _knotenRate(N, ro, E) {
        const d = N.get(ro);
        // DIE FRIST IST DIE EINE DER BAU-ARBEIT (`_bauFrist`, w19-gang-hitch): im Spiel geteilt mit jedem Bauer des Takts (Strom,
        // Planer, Pflanzung, Hüllen, Karte …), unter dem Ladeschirm die der Zeichnung (`_ladeFrist(true)`: die ganze Frist des
        // Lade-Frames samt dem Guthaben der gehaltenen Leine). Bis hier trug der Bau in Raten eine zweite Uhr daneben (`rateFrist`:
        // ERST_BAU_MS ab seinem ersten Schritt, unter dem Ladeschirm das Guthaben).
        // DIE BAU-ZEIT FOLGT DER WANDUHR, NIE DER BILDRATE (w19-ankunft-takt; das Zeit-Budget je Bild der Precache-Lader, Unreals
        // PSO-Precache `BatchTime`, hier wie der Ingest mit `INGEST_RATE_PER_S`): hielt die GPU-Leine das fällige Bild, während die
        // Schuld der Erst-Zeichnung offen war (`ladeGuthaben`, `_ladeBildFaellig`), baut es ab seinem ersten Schritt die gehaltene
        // Zeit, höchstens die Frist EINES Lade-Frames (LADE_TAKT_MS — keine Aufgabe trägt mehr Bau als der Lade-Frame); ohne
        // gespannte Leine bleibt es der Rest der EINEN Frist. Bis hier baute es nur diesen Rest, den die Leser des Takts oft schon
        // verbraucht hatten (bis −127 ms), und das Bild kam nur bei freier Leine: swiftshader, 4 Kerne, CPU ×4 — 11 Lade-Bilder in
        // 15 s, 7 Knoten-Bauten bis zur Messung (main am Stück 27); Boden-Satz und 9 Geometrie-Arenen zeichneten nie, ihre Puffer
        // (Teil-Uploads je 14–118 KB, ~5,5 MB) luden nie hoch: die Erst-Zeichnungs-Wand Teil 1 zählte 0,7 statt > 1 MB (CI z287:
        // 0,2 · 0,2 · 0,7 MB, main 4,8 MB).
        const frist = this._bauFrist("knoten", true);
        const t0 = performance.now();
        // SEIN PFLICHT-STÜCK (w19-gang-hitch): der erste Ruf des Takts baut einen Schritt auch nach der Frist, jeder weitere wartet.
        // IM SPIEL IST ES DAS EINE DES TAKTS (w28-takt-frist, `_bauStueck`): ging nach der Frist schon ein Bauer des Planers seines,
        // wartet der Knoten-Bau und wird hungriger (bis hier ging er seines NEBEN jedem: Radeon, Wiese im Gang, 9,0 ms ab p95).
        if (!this._bauStueck("knoten", t0 >= frist)) return false;
        const key = N.getForRenderCacheKey(ro);
        let s = N.nodeBuilderCache.get(key);
        // ein Bau, den ein Zwilling vollendete, dessen Eintrag mit seinem letzten Leser fiel (`usedTimes`), tritt wieder ein
        if (s === undefined && d.rate && d.rate.s) N.nodeBuilderCache.set(key, (s = d.rate.s));
        const bild = N.nodeFrame.frameId;
        try {
            let R = null;
            if (s !== undefined) E.imFlug.delete(key);
            else if (!(R = d.rate || E.imFlug.get(key))) {
                // ein Bau, den seit KNOTEN_FLUG_BILDER kein Leser weiterging (sein Objekt fiel im Bau), verlässt den Flug
                if (E.imFlug.size >= 32)
                    for (const [k, x] of E.imFlug)
                        if (bild - x.bild > AnazhRealm.KNOTEN_FLUG_BILDER) E.imFlug.delete(k);
                E.imFlug.set(
                    key,
                    (R = { b: N._createNodeBuilder(ro, ro.material), i: -1, k: 0, bild, s: null, ms: 0 })
                );
            }
            if (R) [d.rate, R.bild] = [R, bild];
            const b = R && R.b;
            let arbeit = !!R && R.i < 0 && (b.prebuild(), (R.i = 0), true);
            // DER GANG GEHT BIS ZUR FRIST, NIE EINEN SCHRITT JE AUFRUF (w19-ankunft-takt): bis hier kehrte jeder Aufruf nach EINER
            // Shader-Stufe zurück — ein Bau brauchte mindestens zehn Bilder, gleich wie viel Frist blieb, und unter dem Ladeschirm
            // kommt das Bild nur bei freier GPU-Leine (swiftshader, CPU ×4: je Aufgabe ein Schritt je Objekt, bis zu 13 Bauten zugleich
            // im Flug, kaum einer fertig; 2 Kerne, CPU ×6 mit Guthaben, ohne diesen Gang: 6 Knoten-Bauten, 0,9 MB). Der erste Schritt
            // geht immer (nie verhungert); jeder weitere, solange die EINE Frist trägt (`_bauFrist`), ein Schritt darüber endet wie
            // bisher. Ein begonnener Schritt geht mindestens EINEN Knoten: der Gang der Position (`flowNodeFromShaderStage`) steht am
            // Anfang der Stufe (`R.k` 0) — ein Schritt ohne Knoten ginge ihn beim nächsten Ruf ein zweites Mal.
            const ueber = () => performance.now() >= frist;
            for (const [STUFE, SHADER] = AnazhRealm.KNOTEN_GANG; R && R.i < 9 && !(arbeit && ueber());) {
                const stufe = STUFE[(R.i / 3) | 0];
                const shader = SHADER[R.i % 3];
                b.setBuildStage(stufe);
                if (R.k === 0 && R.i % 3 === 0 && b.context.position && b.context.position.isNode)
                    b.flowNodeFromShaderStage("vertex", b.context.position);
                b.setShaderStage(shader);
                // eine leere Shader-Stufe geht im selben Schritt mit; die volle bis zur Frist, je Knoten gefragt
                const [F, k0] = [b.flowNodes[shader], R.k];
                for (; R.k < F.length && (R.k === k0 || !ueber()); R.k++) {
                    if (stufe === "generate") b.flowNode(F[R.k]);
                    else F[R.k].build(b);
                    arbeit = true;
                }
                if (R.k >= F.length) [R.i, R.k] = [R.i + 1, 0];
            }
            if (arbeit && ueber()) return ((R.ms += performance.now() - t0), false);
            if (R) {
                b.setBuildStage(null);
                b.setShaderStage(null);
                b.buildCode();
                b.buildUpdateNodes();
                N.nodeBuilderCache.set(key, (s = R.s = N._createNodeBuilderState(b)));
                E.imFlug.delete(key);
                // DER FERTIGE BAU ZÄHLT AM EINEN ZÄHLER der Erst-Zeichnung (`bauN`, `bauMs` = Σ seiner Schritte), wie ein Bau am
                // Stück: bis hier zählte der Bau in Raten nur in einem eigenen Paar (`rateN`/`rateMs`, ohne Leser) — seit der Bau
                // unter dem Ladeschirm in Raten geht (w19-ankunft-takt), las der Flugschreiber (`erstBauN`) und die Erst-Zeichnungs-
                // Wand (Konsum im Boot) 0 Knoten-Bauten bei 714 verschobenen (swiftshader, Teil 1)
                E.bauN++;
                E.bauMs += R.ms + performance.now() - t0;
            }
        } catch (e) {
            d.rate = undefined;
            E.imFlug.delete(key);
            this._bruchMelden(`KNOTEN-RATE: ein Schritt warf (${(e && e.message) || e}) — der Vendor baut am Stück`);
            return (N.getForRender(ro), true);
        }
        [d.rate, d.nodeBuilderState] = [undefined, s];
        s.usedTimes++;
        return true;
    }
    // Der EINE Grund-Knoten jedes Schatten-Stoffs (r184 `vec4(0,0,0,1)`, je Licht neu gebaut) — `renderObject` oben
    static _schattenGrund() {
        return AnazhRealm.__schattenGrund || (AnazhRealm.__schattenGrund = THREE.TSL.vec4(0, 0, 0, 1));
    }
    // DER BAU-SCHLÜSSEL AUS DEM STOFF-GESETZ (w4-b-knoten): r184 schlüsselt den Knoten-Bau (`Nodes.getForRender`, der Cache
    // `nodeBuilderCache`) mit dem Schlüssel des Render-Objekts (`initialCacheKey`), und darin trägt JEDE Zahl des Stoffs den
    // Term „0"/„1" (`getMaterialCacheKey`). Die Zahlen in BAU_NEUTRAL liest der Bau nie als Wert — nur als Stoff-Referenz
    // (`materialMetalness`, `getFloat("emissiveIntensity")`, die Umgebung im `onObjectUpdate`; Vendor gelesen, gate:vendor-anker
    // pinnt die Stellen): Stoffe EINER Gestalt (EIN Graph je Signatur, `_graphTeilen`) mit Metall 0 und 0,1 bauten byte-gleich
    // je ein Programm (headless kalt 01.11.: die Karten-Bühne dreimal dasselbe). Ebenso den Index der Geometrie (`index,` im
    // Geometrie-Schlüssel): der Bau liest ihn nie, die Pipeline schlüsselt ihn selbst (`getRenderCacheKey`) — die Arena und der
    // Zeichner EINES Stoffs bauten dasselbe Programm zweimal (52 + 56 ms). Der Bau-Schlüssel ist der r184s, gelesen mit diesen
    // Zahlen als 1 und ohne den Index — Pipeline, Neuanlage des Render-Objekts und jeder andere Leser behalten den Vendor-
    // Schlüssel; gemerkt je Render-Objekt (`delete` zählt `usedTimes` unter demselben). Der Rufer: der Anschluss nach init().
    // DIE FORM DES RENDER-OBJEKTS (w4-knoten-takt): die Sicht ist eine flache KOPIE seiner Felder (ohne Prototyp: ruft r184s
    // `getMaterialCacheKey` je eine andere Methode, bricht sie laut), der Schlüssel steht in einer WeakMap — nie ein Erbe des
    // Render-Objekts, nie ein Feld an ihm. `Object.create(ro)` machte jedes Render-Objekt zum Prototyp, V8 gibt einem
    // Prototyp eine EIGENE Form: jeder Zugriff des Takts auf ein Render-Objekt (Vendor-Draw, Bündel-Replay, Diät) ging den
    // langsamen Weg (z119c GTX, Stadt im Stand: CPU-Takt p95 9,88 → 10,95 ms; Radeon: zwei Schreibe je Render-Objekt 5,5 →
    // 30,5 ns, CPU je Bild der stehenden Stadt 4,50 → 5,20 ms, mit der Kopie 4,60). Die Wand: gate:altlasten (Zwillings-Wand,
    // `Object.create` nur mit null).
    _gestaltSchluessel(renderer) {
        const N = renderer && renderer._nodes;
        if (!N || typeof N.getForRenderCacheKey !== "function")
            return this.log("BAU-SCHLÜSSEL: r184-Nodes.getForRenderCacheKey nicht gefunden (Vendor-Drift)", "ERROR");
        if (N.__anazhBauSchluessel) return;
        const NEUTRAL = AnazhRealm.BAU_NEUTRAL;
        const blick = { get: (m, p) => (NEUTRAL.includes(p) && typeof m[p] === "number" ? 1 : Reflect.get(m, p, m)) };
        const bau = new WeakMap(); // Render-Objekt → sein Bau-Schlüssel
        N.getForRenderCacheKey = function (ro) {
            let k = bau.get(ro);
            if (k !== undefined) return k;
            const m = ro.material;
            const null0 = !!m && NEUTRAL.some((p) => m[p] === 0);
            k = ro.initialCacheKey;
            if (null0 || (ro.geometry && ro.geometry.index)) {
                const geo = ro.getGeometryCacheKey().replace(/index,$/, "");
                const sicht = { ...ro, material: null0 ? new Proxy(m, blick) : m, getGeometryCacheKey: () => geo };
                k = ro.getMaterialCacheKey.call(sicht) + ro.getDynamicCacheKey();
            }
            bau.set(ro, k);
            return k;
        };
        N.__anazhBauSchluessel = true;
        // DER ABSCHIED OHNE BAU (w19-ankunft-takt, ankunft.K5): r184 löst ein Render-Objekt, dessen Schlüssel wechselte (ein Licht
        // kam, der Stoff wechselte die Variante — `_objects.get` → `dispose`), über `bindings.deleteForRender` → `getBindings` →
        // `getNodeBuilderState`: ein Objekt, das nie band (es wartete auf seinen Bau in Raten, `_knotenRate`), baute seinen ganzen
        // Knoten-Graphen SYNCHRON, nur um ihn zu löschen (headless kalt, Bau in Raten unter dem Ladeschirm: eine Aufgabe 640 ms,
        // davon 361 ms `dispose › deleteForRender › build`). Ohne Bindungen (`_bindings` null) gibt es nichts zu lösen — kein Bau;
        // `nodes.delete` zählt nur einen Bau, der stand (gate:vendor-anker pinnt die drei Stellen).
        const BI = renderer._bindings;
        if (!BI || typeof BI.deleteForRender !== "function")
            return this.log("ABSCHIED OHNE BAU: r184-Bindings.deleteForRender nicht gefunden (Vendor-Drift)", "ERROR");
        if (BI.__anazhAbschiedOhneBau) return;
        const loese = BI.deleteForRender;
        BI.deleteForRender = function (ro) {
            if (ro._bindings === null) return;
            return loese.call(this, ro);
        };
        BI.__anazhAbschiedOhneBau = true;
    }

    // DIE ABSAGE EINER PIPELINE (Welle K): r184 verschluckt die Absage von createRenderPipelineAsync (`catch(e){}`,
    // vendor/three.webgpu.min.js 6:590437), und ein Fehler-Scope sieht asynchrone Fehler nach Spezifikation nie — ein Stoff,
    // dessen Pipeline scheitert, bliebe STILL für immer unsichtbar (der synchrone Bau meldete denselben Fehler laut). Der EINE
    // Abgriff am Gerät (wie der writeBuffer-Abgriff, nach init): das Original-Versprechen geht unverändert an r184 zurück,
    // seine Absage meldet sich als `PIPELINE-ABSAGE <label>: <message>` (das Label nennt den Stoff:
    // `renderPipeline_<Stoff>_<id>`, 6:589557) über den EINEN Melder der GPU-Wache (`_gpuWacheMeldung`: ERROR beim Namen,
    // gezählt in `_gpuWache` — eine Absage ist eine Validierung wie jede andere, Integration V18.535), und die Erst-Zeichnung
    // trägt die Pipeline aus ihrer Warteschlange aus (`_erstWartet` hält das Versprechen ihres Baus). Gerufen wird je Aufruf
    // der Prototyp — Linsen hängen sich dort ein.
    _erstAbsageWache(renderer) {
        const be = renderer.backend;
        const dev = be && be.isWebGPUBackend === true ? be.device : null;
        if (!dev || dev.__anazhAbsage || typeof dev.createRenderPipelineAsync !== "function") return;
        const E = this._erstZeichnungStand();
        const welt = this;
        dev.createRenderPipelineAsync = function (desc) {
            const p = Object.getPrototypeOf(this).createRenderPipelineAsync.call(this, desc);
            const label = (desc && desc.label) || "renderPipeline_(ohne Label)";
            E.bau = { p, label };
            p.catch((e) => {
                E.absagenN++;
                welt._gpuWacheMeldung("pipeline", `PIPELINE-ABSAGE ${label}: ${(e && e.message) || e}`);
            });
            return p;
        };
        dev.__anazhAbsage = true;
    }

    // DER EINMAL-RENDER IM PSO-VORBAU (w16-lade-atem): `fn` zeichnet einen Einmal-Render (eine Tafel, die Umgebung, den Boden des
    // Rückstrahls); true, wenn jede seiner Pipelines stand und er ganz zeichnete. Wartete er auf Pipelines (`einmalOffen`), läuft
    // `fn` erst wieder, wenn jede von ihnen steht (`E.offen` trägt sie bis dahin) — bis hier malte jeder Takt ihn neu, ohne Bild
    // (PMREM samt seiner Filter-Pässe je Takt). `schluessel`: der Render (sein Quad, der PMREM-Generator).
    // NACH DEM BILD GILT DER VORBAU WEITER (w25-ankunft-block): in jedem Takt des laufenden Loops entsteht die Pipeline eines
    // Einmal-Renders asynchron (`_einmalVorbau`) — sein Leser hält den alten Stand, bis sie steht (Spiegel, Horizont-Karte,
    // Tafeln, Umgebung, Rückstrahl). Bis hier baute der erste Lauf eines Passes, der nach dem Bild begann, seine Pipeline synchron
    // im GPU-Prozess: Radeon kalt der Spiegel 0,4 s nach dem Bild (73 k Zeichen WGSL), die Horizont-Karte nach 2,5 s — der rAF
    // stand 1,3–2,2 s bei freiem Haupt-Faden, das Halten der W-Taste kam erst 1,7–2,4 s nach dem Bild.
    _einmalRender(schluessel, fn) {
        const E = this._erstZeichnungStand();
        const W = E.einmalWarte || (E.einmalWarte = new WeakMap());
        const w = W.get(schluessel);
        // außerhalb des Vorbaus (ein Leser außerhalb des Takts, der ruhende Loop) zeichnet er ganz, worauf er auch wartete
        if (!this._einmalVorbau()) {
            W.delete(schluessel);
            fn();
            return true;
        }
        if (w) {
            for (const p of w) if (E.offen.has(p)) return false;
            W.delete(schluessel);
        }
        const vorbau = E.einmalOffen;
        const vorSammel = E.einmalSammel;
        const sammel = (E.einmalSammel = new Set());
        try {
            fn();
        } finally {
            E.einmalSammel = vorSammel || null;
        }
        if (E.einmalOffen === vorbau) return true;
        if (sammel.size) W.set(schluessel, sammel);
        return false;
    }

    // DIE EINE WARTESCHLANGE der Erst-Zeichnung: ein Bürger, der nicht zeichnen kann, meldet sich hier an — auf jedem Weg
    // (Erstbau, Neubau, fremde Szene); `bg` ist das Bundle, dessen Aufnahme ohne ihn versiegelt (null: ein direkter Draw,
    // er versucht es im nächsten Aufruf selbst).
    // (1) Er wartet auf seine PIPELINE (`pipe`): bereit ist sie, sobald r184 die fertige GPU-Pipeline in seinen Zustand
    //     schreibt — `h.pipeline=await d.createRenderPipelineAsync(A)` (vendor/three.webgpu.min.js 6:590389), genau das Feld,
    //     das `isReady` liest (6:221094). Ein Setter an diesem Feld nimmt im SELBEN Moment jedes Bundle neu auf, das ohne
    //     einen ihrer Bürger versiegelt wurde (die Zuweisung läuft nach einem await, nie mitten in einer Aufnahme). Das
    //     Vendor-Versprechen wartet danach noch auf `popErrorScope` (6:590447) — auf der Spielseite > 5 s, auf Windows-
    //     swiftshader nie aufgelöst (gemessen 07.10.: ein Bundle-Bürger mit fertiger Pipeline 120 s ohne Neuaufnahme); an
    //     ihm hängt nichts.
    // (2) Er wartet nur auf seinen KNOTEN-BAU (`pipe` null: der Aufruf hat sein Bau-Budget verbraucht): das Bundle nimmt
    //     nach der laufenden Aufnahme neu auf — r184 versiegelt an ihrem Ende (`u.version=s.version`, 6:413962) und schluckte
    //     eine Marke von mittendrin; die Marke setzt das Siegel selbst (`_renderBundle`, die Draw-Wahrheit), so nimmt auch
    //     das nächste Bild im selben Task neu auf.
    // Eine Pipeline, deren Bau scheitert, meldet sich laut (`_erstAbsageWache`) und fällt aus der Warteschlange; ihr Bürger
    // zählt weiter als wartender Draw — die Beweis-Aufnahme nennt ihn beim Namen und bricht ab. Auch im Bündel: es nimmt nach
    // jeder Aufnahme neu auf wie in (2), statt ohne ihn zu versiegeln und still abzuspielen (mensch.K4, 30.10.: 8 abgesagte
    // Stoffe im Bündel des Leibs — Auge und Kleid fehlten im Bild, die Beweis-Aufnahme stand grün).
    // Der WebGL2-Rückfall kennt keine Bundles, und sein `_completeCompile` ersetzt das Datenobjekt der Pipeline (vendor
    // 6:513930 über Backend.set 6:457928) — ein Setter am alten Objekt feuerte nie, die Schlange wüchse die ganze Sitzung:
    // dort zählt der wartende Draw nur (`wartetN`), er versucht es im nächsten Aufruf selbst.
    // (3) DAS BILD IST NICHT GANZ (w28-bild-ganz, `buerger`): ein Bürger der Welt-Szene, der in diesem Bild zeichnen WOLLTE (Zug-
    //     Parameter, kein Vorbau ohne Draw) und nicht zeichnete, steht bis zum nächsten Bild in `bildWartet` — unter seiner
    //     Pipeline, oder unter seinem Stoff, solange sein Knoten-Bau wartet. Der Leser ist das erste Weltbild (`_bildWartet`,
    //     der Term „zeichnung"). Eine abgesagte Pipeline hält nichts: sie meldete sich laut (`_erstAbsageWache`).
    _erstWartet(be, pipe, bg, buerger = null) {
        const E = this._erstZeichnung;
        if (buerger !== null && buerger.scene === this.state.scene && !(pipe && E.abgesagt.has(pipe)))
            E.bildWartet.set(pipe || buerger.material, { ro: buerger, fest: !pipe || be.isWebGPUBackend !== true });
        if (!pipe) {
            if (bg !== null) E.aufnehmen.add(bg);
            return;
        }
        E.wartetN++;
        E.wartetAuf = pipe;
        const bau = E.bau;
        E.bau = null;
        if (be.isWebGPUBackend !== true) return;
        if (E.abgesagt.has(pipe)) return this._erstWartet(be, null, bg);
        let bundles = E.offen.get(pipe);
        if (bundles === undefined) {
            const h = be.get(pipe);
            let wert = h.pipeline;
            const warten = (bundles = new Set());
            E.offen.set(pipe, warten);
            if (bau !== null) {
                E.namen.set(pipe, bau.label);
                bau.p.catch(() => {
                    E.abgesagt.add(pipe);
                    E.offen.delete(pipe);
                    for (const b of warten) b.needsUpdate = true;
                });
            }
            Object.defineProperty(h, "pipeline", {
                configurable: true,
                enumerable: true,
                get: () => wert,
                set: (v) => {
                    wert = v;
                    if (v === undefined || v === null) return;
                    Object.defineProperty(h, "pipeline", {
                        value: v,
                        writable: true,
                        configurable: true,
                        enumerable: true,
                    });
                    E.offen.delete(pipe);
                    E.bereitN++;
                    for (const b of warten) b.needsUpdate = true;
                },
            });
        }
        if (bg !== null) bundles.add(bg);
    }

    // WER IM BILD NOCH NICHT ZEICHNETE (w28-bild-ganz) — die EINE Antwort für das erste Weltbild (`_weltbildLuecken`, der Term
    // „zeichnung"): wie viele Programme des letzten Bilds der Welt-Szene noch ausstehen, und der erste Wartende beim Namen.
    // Bis hier zählte jeder Term GESETZTES (der Chunk trägt ein Mesh, die Back-Schlange ist leer), nie GEZEICHNETES: der
    // Ladeschirm wich, während Boden, Fern-Ring, Karten-Atlas, Ferne der Wiese, Himmel und Sonne auf ihre Pipeline warteten
    // (GTX 1050, main 523e3a38, echter Renderer, je Bild von außen gezählt, 3 ↔ 3 Läufe: kalt 6–8 Bürger des Hauptbilds offen —
    // der Karten-Atlas mit 209 von 219 Bäumen im Blick +1,7–1,8 s, die Schalen des Fern-Rings +2,4–3,5 s, das ganze Bild
    // 3,4–4,3 s nach dem „Weltbild“; am Zweit-Boot 5–11 — dazu Boden-Satz, Himmel und Sonne: ein fast schwarzes Bild mit sechs
    // Bäumen, das ganze 2,1–3,1 s danach). Nur der Baum auf L0/L1 fragte es für sich (`_stufeOffen`). Jetzt IST das Weltbild
    // das ganze Bild: kalt 23,1–24,2 s (vorher „Weltbild“ 20,3–21,5 s, ganz 24,4–25,0 s), Zweit-Boot 13,6–14,6 s (12,0–13,0 s,
    // ganz 15,0–15,7 s).
    // DAS BILD ZÄHLT SICH SELBST: jeder Takt, der zeichnet, leert die Liste an seinem Anfang (die Phase des Takts im Loop,
    // `bild`), sein Render trägt jeden ein, der zeichnen wollte und nicht zeichnete (`_erstWartet` (3), das Abspiel eines
    // Bündels ohne Bürger in `_renderBundle`) — nie die Welt hinter dem Spieler (Gebot 7: wer in keinen Pass fällt, will nichts
    // zeichnen). Zwischen zwei Bildern fällt, wessen Pipeline steht (`offen` der Warteschlange): das nächste Bild ist dann
    // sofort fällig (`_ladeBildFaellig`). `fest` bleibt bis zum nächsten Bild: der Knoten-Bau in Raten (er macht es selbst
    // fällig, `ladeSchuld`) und jeder Wartende des WebGL2-Rückfalls (dort führt die Warteschlange keine Pipeline).
    _bildWartet() {
        const E = this._erstZeichnung;
        let n = 0;
        let zeuge = null;
        if (E)
            for (const [k, b] of E.bildWartet) {
                if (!b.fest && !E.offen.has(k)) E.bildWartet.delete(k);
                else if (!n++) zeuge = { programm: this._bildWartetName(E, k, b) };
            }
        return { n, zeuge };
    }
    // Der Wartende beim Namen: sein Objekt (eine Arena nennt die Senken ihrer Glieder), sein Stoff, das Etikett seiner Pipeline
    _bildWartetName(E, k, b) {
        const etikett = String(E.namen.get(k) || "").replace("renderPipeline_", "");
        const o = b.ro ? b.ro.object : null;
        if (!o) return etikett || "ein Bürger im Bündel";
        const m = b.ro.material;
        const stoff = etikett || `${m.name || m.type}_${m.id}`;
        const glieder = o.isGeometrieArena === true && Array.isArray(o.glieder) ? o.glieder : null;
        const wer = glieder
            ? glieder
                  .slice(0, 3)
                  .map((g) => (g.userData && g.userData.archInstanceKey) || g.name || g.type)
                  .join(", ") + (glieder.length > 3 ? ` und ${glieder.length - 3} weitere` : "")
            : o.name || (o.userData && (o.userData.inventar || o.userData.archInstanceKey)) || o.type;
        return `${wer} (${stoff}${b.ro.material.isShadowPassMaterial === true ? ", Wurf" : ""})`;
    }

    // HEADLESS-NULL-RENDERER (opt-in via window.__anazhHeadlessNullRenderer): No-op-Hülle ohne GPU —
    // die Welt bootet + simuliert voll (CPU), nur die Rasterung entfällt (Mechanik-Playtest GPU-frei;
    // der Look gehört der echten WebGPU-Bahn). Deckt exakt die vom Code berührte Renderer-API; `init()`
    // resolvt (rendererReady=true), `backend=null` nimmt die Sofort-Dispose-Bahn in _drainPools.
    _makeHeadlessRenderer(canvas) {
        const noop = () => {};
        const resolved = () => Promise.resolve();
        // der Zeichenpuffer folgt setSize × Pixel-Verhältnis wie am echten Renderer (r184 CanvasTarget): die Bühnen
        // (`_buehneRenderer`) gleichen ihren Canvas an der CSS-Größe ab (`_workshopSyncCanvasSize`)
        const mass = { w: canvas ? canvas.width : 0, h: canvas ? canvas.height : 0, pr: 1 };
        const setSize = (w, h, stil = true) => {
            Object.assign(mass, { w, h });
            if (!canvas) return;
            canvas.width = Math.floor(w * mass.pr);
            canvas.height = Math.floor(h * mass.pr);
            if (stil === true) Object.assign(canvas.style, { width: w + "px", height: h + "px" });
        };
        return {
            domElement: canvas,
            shadowMap: { enabled: false, type: 0, autoUpdate: false, needsUpdate: false },
            toneMapping: 0,
            toneMappingExposure: 1,
            stencil: false,
            outputColorSpace: "srgb",
            backend: null,
            info: { render: { calls: 0, drawCalls: 0, triangles: 0 }, memory: {}, autoReset: false, reset: () => {} },
            init: resolved,
            // render() lässt die Rasterung weg, aktualisiert aber die Welt-Matrizen — sonst veraltet
            // matrixWorld und der echte Raycast (Graben/Picken) verfehlt das Terrain.
            render: (scene, camera) => {
                if (scene && scene.updateMatrixWorld) scene.updateMatrixWorld();
                if (camera && camera.updateMatrixWorld) camera.updateMatrixWorld();
            },
            renderAsync: (scene, camera) => {
                if (scene && scene.updateMatrixWorld) scene.updateMatrixWorld();
                if (camera && camera.updateMatrixWorld) camera.updateMatrixWorld();
                return Promise.resolve();
            },
            compute: noop,
            computeAsync: resolved,
            setAnimationLoop: noop,
            setSize,
            setPixelRatio: (pr = 1) => pr !== mass.pr && ((mass.pr = pr), setSize(mass.w, mass.h, false)),
            setClearColor: noop,
            getPixelRatio: () => mass.pr,
            getContext: () => null,
            // Der Zeichenpuffer ist der Canvas (der resize-Handler setzt ihn): der EINE Schirm-Maßstab (`_schirm`)
            // liest headless denselben Schirm wie am echten Renderer.
            getDrawingBufferSize: (t) => {
                const w = canvas && canvas.width > 0 ? canvas.width : 0;
                const h = canvas && canvas.height > 0 ? canvas.height : 0;
                return t && typeof t.set === "function" ? t.set(w, h) : { x: w, y: h, width: w, height: h };
            },
            setRenderTarget: noop,
            getRenderTarget: () => null,
            clear: noop,
            dispose: noop,
            _isHeadlessNull: true,
        };
    }

    // DIE REIHE DER BÜNDEL (1310-1): r184 zeichnet die Region-Bündel in der Reihenfolge der Szene und vor jedem losen
    // Objekt — wer zuerst zeichnet, schreibt die Tiefe, hinter der die übrigen ihre Fragmente verwerfen. Die Verdecker
    // zuerst: @global (die gesetzten Gruppen ohne Wahl), dann die Regionen, @wahl zuletzt (Pflanzen-Stufen, Atlas-Karten,
    // Zwillinge — Ausschnitt je Fragment). Bis 1310-1 entschied die Ankunft beim Boot: am Genesis-Ring legte der Tor-
    // Zwilling @wahl vor @global an — bei gleichen Befehlen in EINER Sitzung gpu-bank +1,6 ms und 47,5 statt 50,1 fps unter
    // Regler voll (OMEN, GTX 1060). Jedes neue Bündel stellt die Reihe neu (stabil im Rang); die Plätze der übrigen Kinder
    // der Szene bleiben, nur die Bündel tauschen ihre Plätze untereinander.
    // DIE REIHE IM BÜNDEL (1310-8): auch die Gruppen EINES Bündels zeichnen in seiner Kinder-Folge — bis 1310-8 die Ankunft ihrer
    // Assets beim Boot. Die nahe Stufe zuerst (L0 vor L1 vor der Atlas-Karte), im Gleichstand der Schlüssel: wer nah steht,
    // schreibt die Tiefe, hinter der die fernen Stufen ihre Fragmente verwerfen. Gemessen an der Mess-Wiese (OMEN, GTX 1060,
    // EINE Sitzung, Gier 0, alle Bäume an/aus): der Baum-Preis in der Ankunft 5,02/5,25 ms, nach Stufe aufsteigend 3,46/3,33,
    // absteigend 7,26 — gpu-bank 14,1 → 12,4 ms. Jede Aufnahme eines Kinds stellt die Reihe neu (`_archInstanceGroupFor`, das
    // Wachsen der Gruppe); das Bündel nimmt danach ohnehin neu auf.
    // DIE REIHE NACH ABSTAND (1310-9): trägt der Ruf das Auge (`_buendelAuge`, der Anker der Reihe), zeichnet innerhalb einer
    // Stufe die Gruppe zuerst, deren nächste Instanz dem Auge am nächsten steht (vorn schreibt die Tiefe); ohne Auge der Schlüssel.
    static _buendelKinderReihe(bundle, auge) {
        const rang = (c) => (c.userData && Number.isFinite(c.userData.buendelStufe) ? c.userData.buendelStufe : 0);
        const key = (c) => String((c.userData && c.userData.archInstanceKey) || "");
        const nah = new Map();
        if (auge)
            for (const c of bundle.children) {
                let m = 1e30;
                const a = c.instanceMatrix && c.instanceMatrix.array;
                const n = c.count | 0;
                if (a)
                    for (let i = 0; i < n; i++) {
                        const dx = a[i * 16 + 12] - auge.x;
                        const dz = a[i * 16 + 14] - auge.z;
                        const d = dx * dx + dz * dz;
                        if (d < m) m = d;
                    }
                nah.set(c, m);
            }
        bundle.children.sort(
            (a, b) =>
                rang(a) - rang(b) ||
                (auge ? nah.get(a) - nah.get(b) : 0) ||
                (key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0)
        );
    }
    // DIE ZEICHEN-REIHE DER WELT (T3): EIN Gesetz für alles Opake, die Bündel und jedes lose Objekt — wer vorn steht, zeichnet
    // zuerst und schreibt die Tiefe, hinter der die Übrigen ihre Fragmente verwerfen. Die Schichten vorn → hinten: die Bündel
    // (r184 und die BUNDLE-REIHENFOLGE führen jedes vor jedem losen Draw aus) @global · die Regionen, dann lose, was auf dem
    // Boden steht (Bau-Satz, jede lose Senke samt den Arenen der GPU-Wahl, Tor, Membran, Leib — ohne Marke), der Boden, der Fern-Ring, der Himmel
    // (im Unendlichen zahlt er zuletzt nur seine eigenen Pixel). Ein Erzeuger nennt seine Schicht als Laufzeit-Marke
    // (`userData.zeichenSchicht`). Bis T3 sortierte r184 die losen Opaken nach renderOrder · Tiefe · Objekt-id, die Satz-Hülle
    // liegt am Ursprung (gleiche Tiefe): die Boot-Ankunft entschied, der Himmel (id 20) zeichnete vor Boden und Bau. Gemessen
    // (Radeon 890M, EINE Welt, gpu-bank-Median): Genesis Ego 28,25 → 23,38 ms, Dorf Ego 27,27 → 22,05 ms, Wiese 22,02 → 21,78.
    static _zeichenRang(o) {
        const u = (o && o.userData) || {};
        if (o && o.isBundleGroup === true) return u.regionKey === "@global" ? 0 : 1;
        const s = u.zeichenSchicht;
        return s === "boden" ? 4 : s === "fern" ? 5 : s === "himmel" ? 6 : 3;
    }
    // Die Folge der losen Opaken in JEDEM Render (`setOpaqueSort`, `_configureRenderer`): r184s Schlüssel (Gruppe · renderOrder,
    // die erklärte Folge wie der Feld-Pass zuletzt) und darin die Schicht vor Tiefe und id.
    static _zeichenFolge(a, b) {
        return (
            a.groupOrder - b.groupOrder ||
            a.renderOrder - b.renderOrder ||
            AnazhRealm._zeichenRang(a.object) - AnazhRealm._zeichenRang(b.object) ||
            a.z - b.z ||
            a.id - b.id
        );
    }
    _buendelReihe(scene) {
        const kinder = scene.children;
        const plaetze = [];
        const buendel = [];
        for (let i = 0; i < kinder.length; i++) {
            const c = kinder[i];
            if (c && c.isBundleGroup && c.userData && c.userData.regionKey != null) {
                plaetze.push(i);
                buendel.push(c);
            }
        }
        const rang = AnazhRealm._zeichenRang;
        const reihe = buendel.map((b, k) => ({ b, k })).sort((x, y) => rang(x.b) - rang(y.b) || x.k - y.k);
        for (let k = 0; k < plaetze.length; k++) kinder[plaetze[k]] = reihe[k].b;
    }

    // DER STAND EINES LEIB-BÜNDELS (E2, `_leibHuelle`): r184 spielt ein Bündel ab, solange seine Version steht — was die
    // Projektion dieses Passes ihm gibt, liest es dann nie (`_renderBundle`). Ein Leib wechselt aber, was er zeichnet: die
    // Sicht (Ego nimmt ihn aus der Ebene des Auges), die Stufe (`_gelenkStufe`), das Gerät in der Hand, ein neues Kleid, der
    // Blick, der ihn verlässt. Je Bündel-Aufnahme (Bündel · Kamera · Render-Kontext) merkt der Stand die Projektion — je Zug
    // Objekt, Stoff und seine Version, Geometrie und die Summe ihrer Attribut-Versionen, Gruppe; weicht sie ab, nimmt GENAU
    // diese Aufnahme neu auf (andere Kameras, der See-Spiegel, spielen weiter ab). Ein durchsichtiger Leib-Stoff zeichnete
    // im Bündel vor der opaken Welt: der Melder nennt ihn.
    _leibBuendelStand(rend, b) {
        const d = rend.backend.get(rend._bundles.get(b.bundleGroup, b.camera, rend._currentRenderContext));
        const s = d._anazhLeib || (d._anazhLeib = []);
        const L = b.renderList;
        if (L.transparent.length > 0 || L.transparentDoublePass.length > 0)
            this._bruchMelden(
                `LEIB-BÜNDEL: ein durchsichtiger Stoff im Leib „${b.bundleGroup.name || "?"}" — opak ist sein Gesetz`
            );
        let i = 0,
            anders = false;
        for (const it of L.opaque) {
            const g = it.geometry;
            let v = g.index ? g.index.version : 0;
            for (const k in g.attributes) v += g.attributes[k].version;
            const w0 = it.object.id,
                w1 = it.material.id,
                w2 = it.material.version,
                w3 = g.id,
                w4 = it.group ? it.group.start : -1;
            if (
                s[i] !== w0 ||
                s[i + 1] !== w1 ||
                s[i + 2] !== w2 ||
                s[i + 3] !== w3 ||
                s[i + 4] !== v ||
                s[i + 5] !== w4
            ) {
                s[i] = w0;
                s[i + 1] = w1;
                s[i + 2] = w2;
                s[i + 3] = w3;
                s[i + 4] = v;
                s[i + 5] = w4;
                anders = true;
            }
            i += 6;
        }
        if (s.length !== i) {
            s.length = i;
            anders = true;
        }
        if (anders && d.bundleGPU !== undefined) {
            d.bundleGPU = undefined;
            d.renderObjects = undefined;
            this._leibBuendelNeu = (this._leibBuendelNeu || 0) + 1;
        }
    }

    // DIE KEHRAUS-MARKE: r184s Lebenszeit-Zähler der render()-Aufrufe (`info.render.calls` — NIE eine Frame-Metrik, die
    // liest der EINE Tap über drawCalls); `attributeCall` trägt je Attribut seinen Wert beim letzten Zeichnen, der Kehraus
    // vergleicht dagegen. Die einzige Lesung des Zählers im Stamm (gate:pipeline-constitution · gate:render-tap).
    _gpuKehrausMarke() {
        const ri = this.state.renderer && this.state.renderer.info;
        return ri && ri.render ? ri.render.calls : 0;
    }
    // DER GPU-KEHRAUS — die Residenz folgt dem BILD, nie der Geschichte: nach dem Frame verlässt jeder Geometrie-Puffer die
    // GPU, den kein Objekt des Szenen-Graphen zeichnet und den dieser Frame nicht zeichnete (die r184-Quads der Post-Kette
    // tragen ihren Frame-Zähler in `attributeCall`). Was der Foundry-Cache nur auf der CPU behält, was ein Wachsen ersetzte,
    // was eine Gruppe beim Fallen zurückließ — gleich welcher Erzeuger, EIN Chokepoint. Die Instanz-Matrizen (Speicher-
    // Puffer) fallen nur über `_instanzAbschied` (ihre Bindegruppe hält sie). Kosten: ein Gang durch Graph und Register je
    // GPU_KEHRAUS_MS — beide tragen nach dem Kehraus nur, was das Bild trägt. `zaehlerVor` = r184 `info.render.calls` vor
    // dem Frame.
    _gpuKehraus(zaehlerVor, jetzt) {
        const st = this.state;
        const rend = st.renderer;
        if (!rend || !rend._attributes || !rend._geometries || !rend.info || !st.scene) return 0;
        if (st._gpuKehrausT && jetzt - st._gpuKehrausT < AnazhRealm.GPU_KEHRAUS_MS) return 0;
        st._gpuKehrausT = jetzt;
        const lebt = new Set();
        const sammle = (o) => {
            // eine Senke in der Arena (G1) zeichnet nicht: ihre Gestalt trägt das Lager, ihre Instanzen die Arena
            if (o.__arena) return;
            const g = o.geometry;
            if (g && g.attributes) {
                for (const k in g.attributes) lebt.add(g.attributes[k]);
                if (g.index) lebt.add(g.index);
            }
            if (o.isInstancedMesh) {
                lebt.add(o.instanceMatrix);
                if (o.instanceColor) lebt.add(o.instanceColor);
            }
            // Was seine Render-Objekte zeichnen (r184 `getAttributes`, gecacht): auch die Knoten-Attribute. Ein Objekt unter
            // der Observer-Diät lädt NICHTS neu hoch, solange sich keine Version ändert — ein Attribut, das es zeichnet,
            // darf nie fallen.
            const ros = o.__renderObjekte;
            if (ros) for (const ro of ros) if (ro.attributes) for (const a of ro.attributes) lebt.add(a);
            // eine Senke zeichnet über ihren Zeichner (1410-1): dessen Render-Objekte zeichnen ihre Attribute
            const zro = o.__zeichner && o.__zeichner.__renderObjekte;
            if (zro) for (const ro of zro) if (ro.attributes) for (const a of ro.attributes) lebt.add(a);
        };
        st.scene.traverse(sammle);
        // die Bühnen sind Bild: was eine Bühne seit dem letzten Kehraus zeichnete (`_buehneRender`), lebt wie der Graph
        if (this._buehnenBild) for (const s of this._buehnenBild) s.traverse(sammle);
        if (this._buehnenBild) this._buehnenBild.clear();
        const gezeichnet = rend._geometries.attributeCall;
        const weg = [];
        // ein verschränkter Puffer (die Jahres-Ecken, `_jahrEcken`) fällt nur GANZ: je Puffer [Sichten im Register, die
        // ungezeichneten] — zeichnet eine Sicht, bleibt er (`_gpuAbschiedVerschraenkt`)
        const verschraenkt = new Map();
        for (const [a, v] of rend.info.memoryMap) {
            if (!v || (v.type !== "attributes" && v.type !== "indexAttributes")) continue;
            const tot = !(lebt.has(a) || gezeichnet.get(a) >= zaehlerVor);
            if (a.isInterleavedBufferAttribute) {
                const z = verschraenkt.get(a.data) || verschraenkt.set(a.data, [0, []]).get(a.data);
                z[0]++;
                if (tot) z[1].push(a);
            } else if (tot) weg.push(a);
        }
        let n = 0;
        for (const a of weg) if (this._gpuAbschied(a)) n++;
        for (const [d, [alle, tot]] of verschraenkt)
            if (tot.length === alle) n += this._gpuAbschiedVerschraenkt(d, tot);
        st._gpuKehrausN = (st._gpuKehrausN || 0) + n;
        return n;
    }

    // DER EINE LEINWAND-WEG (06.10., 0910-1) — was der Direktpfad an der Leinwand braucht, lebt nur, solange er zeichnet.
    // DIE TIEFE: in die Leinwand zeichnet die Post-Kette nur ihr Ausgabe-Quad (die Szene
    // lebt im Ziel des Szene-Passes, mit eigener Tiefe) — r184 legt für jeden Leinwand-Pass dennoch eine Tiefe in Leinwand-
    // Größe an (`depthBuffer`, depth24plus, 7,9 MB bei 1080p), die dort kein Pixel liest. Der Direktpfad dagegen zeichnet
    // die Szene in das Rahmen-Ziel des Renderers (`_getFrameBufferTarget`, das Tonemapping zur Leinwand), dessen Tiefe
    // `renderer.depth` folgt: ohne sie zeichnete er ohne Tiefentest, und der erste Leser der Szenen-Tiefe (`_szeneTiefe`:
    // Wasser, Feld-Pass) warf in r184 `copyFramebufferToTexture` („Invalid value used as weak map key" — das Rahmen-Ziel
    // trägt keine Tiefen-Textur). Bis V18.532 stellten ZWEI Stellen die Tiefe (der Ketten-Bau nahm sie, nur der Fang eines
    // Render-Fehlers gab sie zurück) — jeder andere Weg in den Direktpfad (die Weiche der Zerleg-Linse `post`/`leer`) fuhr
    // ohne und stürzte. Jetzt stellt sie die Weiche in `_loopRender` je Frame hier: Direktpfad → mit Tiefe, Post-Kette →
    // ohne, und die GPU-Textur der Leinwand-Tiefe fällt dabei mit (sonst hielte ein Ausflug in den Direktpfad die 7,9 MB
    // für immer). Nur WebGPU: das WebGL2-Rückend legt die Tiefe mit dem Kontext an.
    // DAS RAHMEN-ZIEL (0910-1, Koordinator + OMEN): r184 legt es beim ersten Leinwand-Render mit Tonemapping an
    // (`_getFrameBufferTarget`: rgba16float + depth24plus, 15,8 + 7,9 MB bei 1080p, `isPostProcessingRenderTarget`) und
    // entsorgt es nur mit dem Leinwand-Ziel. Die Post-Kette legt es nie an (r184 schaltet Tonemapping und Farbraum für ihr
    // Quad ab) — jeder Ausflug in den Direktpfad hielt es für immer: `zerlegen` (die Weiche `post`) ließ 23,7 MB
    // `tex:r184-ausgabe` in der Sitzung, und `band --ort genesis` danach maß sie mit (0710-6, 0710-9). Zeichnet die Kette,
    // verlässt jedes Rahmen-Ziel die GPU (`_rahmenZielAbschied`), gleich wer es anlegte — die Weiche oder eine Linse mit
    // eigenem Leinwand-Render; eine Prüfung der Map-Größe je Frame. Die Wand: gate:post-kette (b) und (g).
    _leinwandWeg(direkt) {
        const rend = this.state.renderer;
        if (rend && direkt !== true && rend._frameBufferTargets && rend._frameBufferTargets.size > 0)
            this._rahmenZielAbschied(rend);
        const be = rend && rend.backend;
        if (!be || be.isWebGPUBackend !== true) return;
        const soll = direkt === true;
        if (rend.depth === soll) return;
        rend.depth = soll;
        // r184 hält den Deskriptor des Leinwand-Passes im Backend-Datensatz der Leinwand — updateSize verwirft ihn, der
        // nächste Leinwand-Pass baut ihn mit bzw. ohne Tiefe neu (gate:vendor-anker pinnt beides).
        be.updateSize();
        if (!soll) {
            const t = rend.getCanvasTarget().depthTexture;
            if (t && be.has(t)) be.destroyTexture(t);
        }
    }

    // DER ABSCHIED DES RAHMEN-ZIELS: r184s eigener — der dispose-Hörer, den `_getFrameBufferTarget` an das Leinwand- bzw.
    // Ausgabe-Ziel hängt (Hörer ab, Ziel entsorgt: seine Farb- und Tiefen-Textur verlassen die GPU, der Eintrag fällt). Er
    // ist am Text erkennbar (er löscht aus `_frameBufferTargets`; gate:vendor-anker pinnt ihn). Fehlt er (Vendor-Drift),
    // fällt das Ziel trotzdem — LAUT, mit dem Grund.
    _rahmenZielAbschied(rend) {
        for (const [ziel, rahmen] of [...rend._frameBufferTargets]) {
            const hoerer = (ziel && ziel._listeners && ziel._listeners.dispose) || [];
            const abschied = hoerer.find((h) =>
                /_frameBufferTargets\.delete\(/.test(Function.prototype.toString.call(h))
            );
            if (abschied) {
                abschied.call(ziel);
                continue;
            }
            this.log(
                "RAHMEN-ZIEL: r184s Abschied am Leinwand-Ziel fehlt (Vendor-Drift) — das Ziel fällt ohne ihn, der Hörer bleibt",
                "ERROR"
            );
            rahmen.dispose();
            rend._frameBufferTargets.delete(ziel);
        }
    }

    // DIE ZEITLICHE HOCHSKALIERUNG (K50, TAAU): die Szene rendert in der EINEN Szenen-Skala (`_szeneSkalaWirk`, der
    // Szenen-Pass `setResolutionScale`), die zeitliche Auflösung löst auf die AUSGABE-Auflösung auf. Die Kamera springt je Frame
    // um einen Halton-Versatz in EINGANGS-Pixeln (die Folge des Knotens, `setViewOffset` mit der Eingangs-Größe), jedes
    // Eingangs-Texel trägt so über die Folge eine andere Stelle der Ausgabe. Je Ausgabe-Pixel wiegt der Resolve die 3×3 Texel
    // um seine Stelle nach ihrem Abstand in AUSGABE-Pixeln (exp(−ZEIT_KERN·d²): 7 statt Unreals 2,29 — gemessen schärfer und ruhiger), die Deckung des
    // nächsten Texels wiegt das Gewicht des Jetzt (ein Pixel ohne nahen Abtastpunkt in diesem Frame hält seine Geschichte),
    // die Varianz-Klemme spannt dieselben 3×3 Texel (im Stand ZEIT_GAMMA_RUHE σ: das gröbere Gitter streut weiter). Geschichte und Resolve bleiben rgba16float in der Ausgabe-Auflösung (W7:
    // 11/11/10 posterisierte die Geschichte). DIE VORTIEFE lebt im Kanal a der Geschichte (die Sicht-Tiefe des Vorbilds je
    // Ausgabe-Pixel, float16 relativ 2⁻¹¹ — 0,05 mm Tiefen-Stufe auf 1 m gegen die Disokklusions-Schwelle 0,0005): kein
    // eigenes Tiefen-Ziel der Geschichte, kein Vollbild-Zug je Frame. Ein Größenwechsel der Ausgabe oder ein Kamera-Sprung
    // (`_traaReprojektion`, ZEIT_SPRUNG_M) startet die Geschichte neu, danach läuft sie als Mittel an (K68: das Jetzt wiegt
    // mindestens 1/(n+1)); ein Wechsel der Skala lässt sie stehen (sie lebt in der Ausgabe). Basis ist r184s
    // TRAANode (vendor/TRAANode.js unverändert): Bau, Ziele, Halton-Folge, Kamera-Uniformen und `clearViewOffset` erbt der
    // Knoten, Resolve, Größen und Lauf sind seine. Das Quad nimmt die Klasse des Quads der Post-Kette (`pp._quadMesh`,
    // gate:vendor-anker); fehlt sie, bricht die Kette LAUT.
    _zeitAufloesung(pp, farbe, tiefe, bewegung, kamera) {
        const T = THREE.TSL;
        const Quad = pp && pp._quadMesh && pp._quadMesh.constructor;
        if (typeof Quad !== "function" || typeof THREE.TRAANode !== "function")
            throw new Error("ZEIT-AUFLÖSUNG: Quad der Post-Kette oder TRAANode fehlt (Vendor-Drift)");
        const { Fn, If, float, vec2, vec3, vec4, uv, texture, uniform, max, exp, floor, mix, luminance } = T;
        const realm = this;
        const klemme = (h, lo, hi) => {
            const p = hi.add(lo).mul(0.5);
            const e = hi.sub(lo).mul(0.5).add(1e-7);
            const v = h.sub(p);
            const u = v.div(e).abs();
            const m = max(u.x, u.y, u.z);
            return m.greaterThan(1).select(p.add(v.div(m)), h);
        };
        class ZeitAufloesung extends THREE.TRAANode {
            constructor() {
                super(farbe, tiefe, bewegung, kamera);
                this._zitter = uniform(new THREE.Vector2());
                this._neustart = uniform(1);
                // DAS ANLAUFEN (K68): Frames seit dem Beginn der Geschichte (Größen-Wechsel, Kamera-Sprung `_traaR.sprung`)
                this._anlauf = uniform(0);
                this._kern = uniform(AnazhRealm.ZEIT_KERN);
                // die Unschärfe der Bewegung (spielgang.K4, `_zugangTakt` → `laufPxSetzen`): ab so vielen Ausgabe-Pixeln Bewegung
                // je Bild trägt das Jetzt allein — an r184s `maxVelocityLength`, aus `ZUGANG.laufPxAus`. Eine KONSTANTE des
                // Resolve, nie eine Uniform: an (der Default) ist der Resolve byte-gleich dem ohne Zugang (vp-0611g: die Teilung
                // durch eine Uniform rundete auf 6,2 % der Pixel um 1 LSB); der Wechsel baut den Resolve-Stoff neu.
                this._laufPx = this.maxVelocityLength;
                this._gammaRuhe = uniform(AnazhRealm.ZEIT_GAMMA_RUHE);
                // DAS DECKUNGS-GEDÄCHTNIS (A3b): der Resolve schreibt neben dem Bild je Ausgabe-Pixel, wie oft sein 3×3 eine
                // Deckungs-Kante trug (r8, `FLACKER`) — ein zweites Ziel des Resolve-Quads (MRT, Schlüssel = Name der Textur).
                // DIE GESCHICHTE IST DAS ZIEL DES LETZTEN RESOLVE (G7): zwei solche Ziele wechseln je Frame die Rolle
                // (`updateBefore`), keines wird kopiert. Bis G7 kopierte r184s Weg das Bild in die Geschichte und A3b das
                // Gedächtnis in seine — jede Kopie ein eigener Befehls-Puffer mit Submit außerhalb jedes Pass-Stempels (Radeon,
                // Mess-Wiese, gpu-bank in EINER Welt, 120 Paare: die zwei Kopien 0,69 ± 0,25 ms je Frame, die eine von main
                // 93539122 0,23 ± 0,14). Die Ziele des Vendors (1×1, nie gezeichnet) fallen. EIN Resolve-Stoff liest das Ziel der
                // Lage und schreibt in das andere; er und die Kette lesen es über Texturen, deren Wert wechselt (`updateBefore`,
                // DIE LAGE IST DIE GENERATION). Ein Zweig je Abtastung der Kette kostete den Post-Pass 1,67 → 3,14
                // ms (Radeon, Genesis, Pass-Stempel).
                const zielBau = () => {
                    const z = new THREE.RenderTarget(1, 1, { depthBuffer: false, type: THREE.HalfFloatType, count: 2 });
                    z.name = "TRAANode.resolve";
                    z.textures[0].name = "TRAANode.resolve";
                    z.textures[1].name = "TRAANode.flacker";
                    z.textures[1].type = THREE.UnsignedByteType;
                    z.textures[1].format = THREE.RedFormat;
                    return z;
                };
                this._resolveRenderTarget.dispose();
                this._historyRenderTarget.dispose();
                this._ziele = [zielBau(), zielBau()];
                // die Lage: das Ziel des letzten Resolve (die Geschichte des nächsten); `setSize` des Vendors und der Neubeginn
                // lesen die zwei Rollen-Namen
                this._lage = 0;
                this._historyRenderTarget = this._ziele[0];
                this._resolveRenderTarget = this._ziele[1];
                this._textureNode = T.passTexture(this, this._ziele[0].texture);
                // EIN RESOLVE-STOFF (w14-ankunft-weg, FUND 06.11. `bild-kosten.js:1304`): er liest die Geschichte und ihr
                // Gedächtnis über zwei Texturen, deren Wert die Lage wechselt (`updateBefore`, wie die Kette `_textureNode`) —
                // r184 hält je Paar der Texturen eine Bindegruppe (`createBindings`, Schlüssel = ihre Ids). Bis hier stand je
                // Ziel ein eigener Stoff, der fest das andere las: zwei Knoten-Bauten desselben Programms im ersten Lade-Bild
                // (swiftshader kalt `updateBefore` 593 ms in der längsten Aufgabe).
                const vor = this._ziele[1];
                this._geschichte = texture(vor.textures[0]);
                this._flackerAlt = texture(vor.textures[1]);
                const F = AnazhRealm.FLACKER;
                this._flacker = {
                    kante: uniform(F.kante),
                    rate: uniform(F.rate),
                    an: uniform(new THREE.Vector2(F.an[0], F.an[1])),
                    ruhePx: uniform(F.ruhePx),
                };
                this._versatzIndex = 0;
                this._quad = Object.assign(new Quad(this._resolveMaterial), { name: "TRAA" });
                this._gr = new THREE.Vector2();
            }
            // die Eingangs-Größe, wie r184s Szenen-Pass sie anlegt (PassNode.setSize: CSS-Größe × Pixel-Verhältnis × Skala)
            eingang(aus) {
                const r = this._rend;
                const sp = this.beautyNode.passNode;
                r.getSize(aus);
                const k = r.getPixelRatio() * sp.getResolutionScale();
                return aus.set(Math.floor(aus.x * k), Math.floor(aus.y * k));
            }
            setViewOffset(_w, _h) {
                const e = this.eingang(this._gr);
                super.setViewOffset(e.x, e.y);
                const v = this.camera.view;
                this._zitter.value.set(v.offsetX, v.offsetY);
                // DAS MESS-FENSTER (w27-traa-fenster): ein Schuss der Linse zeigt denselben Blick k-fach vergrößert um die Mitte
                // (cx, cy) des ungefensterten Bilds — das Fenster ist ein Ausschnitt des k-fachen Bilds in Eingangs-Größe, der
                // Halton-Versatz liegt auf ihm, die unverzitterte Projektion des Geschwindigkeits-Passes ist die des Fensters.
                // Nach dem Durchlauf löscht `clearViewOffset` beides: zwischen den Bildern sieht der Takt die ungefensterte Kamera.
                // Die WAHL bleibt die des Spiels: `F.wahl` trägt die ungefensterte, unverzitterte Projektion (`_wahlMatrix`)
                const F = realm.state.messFenster;
                if (F) {
                    F.wahl = (F.wahl || new THREE.Matrix4()).copy(this._originalProjectionMatrix);
                    const [jx, jy] = [v.offsetX, v.offsetY];
                    const [x0, y0] = [F.cx * e.x * F.k - e.x / 2, F.cy * e.y * F.k - e.y / 2];
                    this.camera.setViewOffset(e.x * F.k, e.y * F.k, x0, y0, e.x, e.y);
                    this._originalProjectionMatrix.copy(this.camera.projectionMatrix);
                    this._velocityNode.setProjectionMatrix(this._originalProjectionMatrix);
                    this.camera.setViewOffset(e.x * F.k, e.y * F.k, x0 + jx, y0 + jy, e.x, e.y);
                    F.getragen = (F.getragen || 0) + 1; // der Träger zählt: ein Fenster ohne ihn misst die Linse nie
                }
                // DER VERSATZ DES LAUBS (A3, `_laubVersatz`) gehört zur Folge des Frames: die Halton-Achsen 5 und 7 am Frame
                // seit dem Beginn der Geschichte (ein Neubeginn steht an, wenn ihre Größe nicht die der Ausgabe ist) als Phase, die
                // der Stoff je Pixel dreht (`_laubVersatz`), z die Weite ±LAUB_VERSATZ Eingangs-Pixel. Bis A3b lief er am Index
                // des Zitterns: jedes Ausgabe-Pixel wiegt die Frames nach der Nähe seines Abtastpunkts (`wNah`), so sah jede Phase
                // des Gitters immer dieselben Versätze — ein Raster im Takt des Gitters (Radeon, Tafel-Pose, 256 Frames ohne
                // Klemme: zweiton locker 58 135 → 20 452 px).
                const lu = realm.state.lodUniforms;
                if (lu && lu.uLaubVersatz) {
                    const sch = realm._schirm();
                    const g = this._historyRenderTarget;
                    this._versatzIndex =
                        g.width !== sch.breite || g.height !== sch.hoehe ? 0 : (this._versatzIndex + 1) % 1e6;
                    const o = lu.uLaubVersatz.value;
                    for (let a = 0; a < 2; a++) {
                        const b = a ? 7 : 5;
                        let h = 0;
                        for (let i = this._versatzIndex + 1, f = 1; i > 0; i = Math.floor(i / b))
                            h += (f /= b) * (i % b);
                        o.setComponent(a, h);
                    }
                    o.z = AnazhRealm.LAUB_VERSATZ;
                }
            }
            updateBefore(frame) {
                const r = frame.renderer;
                this._previousCameraWorldMatrix.value.copy(this._cameraWorldMatrix.value);
                this._previousCameraProjectionMatrixInverse.value.copy(this._cameraProjectionMatrixInverse.value);
                this._cameraNearFar.value.set(this.camera.near, this.camera.far);
                this._cameraWorldMatrix.value.copy(this.camera.matrixWorld);
                this._cameraWorldMatrixInverse.value.copy(this.camera.matrixWorldInverse);
                this._cameraProjectionMatrixInverse.value.copy(this.camera.projectionMatrixInverse);
                const sch = realm._schirm();
                const aus = { x: sch.breite, y: sch.hoehe };
                if (this._needsPostProcessingSync === true) {
                    this.setViewOffset(); // der Versatz in Eingangs-Pixeln (`eingang`)
                    this._needsPostProcessingSync = false;
                }
                const g = this._historyRenderTarget;
                const neu = g.width !== aus.x || g.height !== aus.y;
                this.setSize(aus.x, aus.y);
                const ziel = r.getRenderTarget(),
                    mrt = r.getMRT(),
                    rof = r.getRenderObjectFunction(),
                    autoClear = r.autoClear;
                r.setMRT(null);
                r.setRenderObjectFunction(null);
                r.autoClear = true;
                if (neu)
                    this._ziele.forEach((z, i) => {
                        r.initRenderTarget(z);
                        // DIE LAGE IST DIE GENERATION: r184 bindet eine getauschte Textur nur neu, wenn die Generation ihrer
                        // Renderer-Daten (beim Anlegen ihre `version`) nicht die gebundene ist (`Bindings._update`,
                        // gate:vendor-anker) — gleiche Versionen hielten die Kette auf dem alten Ziel; je Ziel eine eigene,
                        // gesetzt nach jedem Anlegen (Größen-Wechsel und Neubeginn laufen hier durch)
                        r._textures.get(z.texture).generation = "zeit:" + i;
                    });
                this._neustart.value = neu ? 1 : 0;
                const sprung = !!(realm.state._traaR && realm.state._traaR.sprung === true);
                // UNTER DEM LADESCHIRM BEGINNT DIE GESCHICHTE MIT JEDEM BILD NEU (w28-bild-ganz): ein Lade-Bild zeigt, was schon
                // zeichnet — die Geschichte trüge es ins erste Weltbild (GTX 1050, Zweit-Boot: der Boden zeichnete zum ersten Mal im
                // Bild, das den Ladeschirm nahm, und die Wurzeln der Bäume und der Deckel des Fern-Rings schienen durch ihn). Das
                // erste Bild des Spielers ist das Jetzt allein, danach läuft das Mittel an wie nach jedem Sprung.
                const lade = realm._ladeTakt();
                this._anlauf.value = neu || sprung || lade ? 0 : Math.min(this._anlauf.value + 1, 1e6);
                // der Resolve liest das Ziel des letzten Frames (Bild mit Vortiefe, Gedächtnis) und schreibt in das andere,
                // die Kette liest dieses; danach tauschen die zwei die Rolle — keine Kopie (G7)
                const k = 1 - this._lage;
                this._geschichte.value = this._ziele[this._lage].textures[0];
                this._flackerAlt.value = this._ziele[this._lage].textures[1];
                r.setRenderTarget(this._ziele[k]);
                this._quad.render(r);
                r.setRenderTarget(null);
                this._lage = k;
                this._textureNode.value = this._ziele[k].texture;
                this._historyRenderTarget = this._ziele[k];
                this._resolveRenderTarget = this._ziele[1 - k];
                r.setRenderTarget(ziel);
                r.setMRT(mrt);
                r.setRenderObjectFunction(rof);
                r.autoClear = autoClear;
            }
            setup(builder) {
                this._rend = builder.renderer;
                const rp = builder.context.renderPipeline;
                if (rp) {
                    this._needsPostProcessingSync = true;
                    rp.context.onBeforeRenderPipeline = () => {
                        this.setViewOffset();
                    };
                    rp.context.onAfterRenderPipeline = () => this.clearViewOffset();
                }
                if (builder.renderer.reversedDepthBuffer === true || builder.renderer.logarithmicDepthBuffer === true)
                    throw new Error("ZEIT-AUFLÖSUNG: umgekehrte oder logarithmische Tiefe trägt der Resolve nicht");
                this._velocityNode = builder.context.velocity !== undefined ? builder.context.velocity : T.velocity;
                const ein = this.beautyNode;
                const tief = this.depthNode;
                const { x: nah, y: fern } = this._cameraNearFar;
                // der EINE Stoff liest die Geschichte und ihr Gedächtnis aus dem Ziel der Lage (G7, `updateBefore`); sein Bau
                // steht als `_stoffBau` für den Wechsel der Lauf-Grenze (`laufPxSetzen`)
                const bau = () => {
                    const geschichte = this._geschichte;
                    const flackerAlt = this._flackerAlt;
                    const flackerNeu = T.property("float", "flackerNeu");
                    const resolve = Fn(() => {
                        const uvA = uv();
                        const einGr = vec2(ein.size());
                        const ausGr = vec2(1).div(this._invSize);
                        const pEin = uvA.mul(einGr);
                        const zelle = floor(pEin);
                        const jePx = ausGr.div(einGr);
                        const hoch = einGr.sub(1);
                        const summeW = float(0).toVar();
                        const summeC = vec3(0).toVar();
                        const m1 = vec3(0).toVar();
                        const m2 = vec3(0).toVar();
                        const wNah = float(0).toVar();
                        const nahD = float(2).toVar();
                        const nahT = vec2(0).toVar();
                        const fernD = float(-1).toVar();
                        for (let y = -1; y <= 1; y++)
                            for (let x = -1; x <= 1; x++) {
                                const t = zelle.add(vec2(x, y)).clamp(vec2(0), hoch).toVar();
                                const c = ein.load(t).rgb.max(0).toVar();
                                const d = t.add(0.5).add(this._zitter).sub(pEin).mul(jePx);
                                const w = exp(d.dot(d).mul(this._kern).negate()).toVar();
                                summeW.addAssign(w);
                                summeC.addAssign(c.mul(w));
                                m1.addAssign(c);
                                m2.addAssign(c.mul(c));
                                wNah.assign(max(wNah, w));
                                const tz = tief.load(t).r.toVar();
                                If(tz.lessThan(nahD), () => {
                                    nahD.assign(tz);
                                    nahT.assign(t);
                                });
                                If(tz.greaterThan(fernD), () => {
                                    fernD.assign(tz);
                                });
                            }
                        const jetzt = summeC.div(max(summeW, 1e-5)).toVar();
                        // die Bewegung des nächsten Texels (NDC → UV; gehört die Mitte dem getragenen Leib, ihre —
                        // `_traaKameraBewegung`), die Geschichte an ihrer Stelle im Vorbild
                        const versatz = this.velocityNode
                            .load(nahT.add(0.5), zelle.clamp(vec2(0), hoch).add(0.5))
                            .xy.mul(vec2(0.5, -0.5))
                            .toVar();
                        const gUV = uvA.sub(versatz).toVar();
                        const hist = geschichte.sample(gUV).toVar();
                        const vorD = T.viewZToPerspectiveDepth(hist.a, nah, fern);
                        const posV = T.getViewPosition(gUV, vorD, this._previousCameraProjectionMatrixInverse);
                        const posW = this._previousCameraWorldMatrix.mul(vec4(posV, 1)).xyz;
                        const vorJetzt = T.viewZToPerspectiveDepth(
                            this._cameraWorldMatrixInverse.mul(vec4(posW, 1)).z,
                            nah,
                            fern
                        );
                        const imBild = gUV.greaterThanEqual(0).all().and(gUV.lessThanEqual(1).all());
                        const kante = fernD.sub(nahD).greaterThan(this.edgeDepthDiff);
                        const frei = nahD.sub(vorJetzt).greaterThan(this.depthThreshold);
                        // der ORT der Geschichte trägt (im Bild, keine Disokklusion); gültig ist sie dazu ohne Neubeginn
                        const ort = imBild.and(kante.or(frei.not()));
                        const gueltig = ort.and(this._neustart.equal(0));
                        const lauf = uvA.sub(gUV).mul(ausGr).length().div(this._laufPx).saturate();
                        // DAS DECKUNGS-GEDÄCHTNIS (A3b): eine stochastische Deckung (Laub, Nadeln, Halme, Karten, die Stufen-Blende)
                        // zeigt je Frame Fläche ODER Grund. In einem Frame, in dem ihre Lücke das 3×3 verlässt, ist die Box nur Fläche,
                        // und die Varianz-Klemme warf das Mittel der Geschichte weg (Radeon, Tafel-Pose, Abstand zum Mittel aus 256
                        // Frames ohne Klemme: 4,06 Luma nach 32 Frames, 4,36 nach 256 — es konvergierte nie; ohne Klemme 2,74). Das
                        // Gedächtnis je Ausgabe-Pixel ist der gleitende Anteil der Frames (`FLACKER.rate`), in denen sein 3×3 eine
                        // DECKUNGS-KANTE trägt (Tiefen-Sprung über `FLACKER.kante` relativ, Δz/z), mit der Geschichte reprojiziert und
                        // nur bei einer Disokklusion neu. Wo es über `FLACKER.an` steht, mittelt die Geschichte ungeklemmt — eine Lücke,
                        // die das 3×3 eben verließ, bleibt im Mittel. Nur in Ruhe (unter `FLACKER.ruhePx` Bewegung je Frame): ein
                        // laufender Blick klemmt wie bisher, und eine Kante, die nur vorbeizieht (ein Tier), hebt das Gedächtnis nicht.
                        const deckKante = fernD
                            .sub(nahD)
                            .div(float(1).sub(nahD).max(1e-6))
                            .greaterThan(this._flacker.kante)
                            .select(float(1), float(0));
                        // EIN NEUBEGINN (Größe, Aufnahme) startet das Gedächtnis offen: die Geschichte danach ist frisch (das Mittel
                        // seit dem Neubeginn, `_anlauf`), die Klemme verwürfe nur gültige Frames; an Flächen ohne Kante klingt es in
                        // ~8 Frames ab, ein laufender Blick klemmt wie immer (`ruhe`). Bis G7 trug ein eigenes Ziel das Gedächtnis
                        // über den Neubeginn (das des Blicks davor); beim Jetzt (0 | 1) begonnen hielt die Tafel-Pose 49 px Raster.
                        const phiAlt = this._neustart.equal(0).select(flackerAlt.sample(gUV).r, float(1));
                        flackerNeu.assign(ort.select(mix(phiAlt, deckKante, this._flacker.rate), float(0)));
                        const ruhe = float(1)
                            .sub(uvA.sub(gUV).mul(ausGr).length().div(this._flacker.ruhePx))
                            .saturate();
                        const lass = T.smoothstep(this._flacker.an.x, this._flacker.an.y, phiAlt).mul(ruhe);
                        // das Gewicht des Jetzt: Grund 0,05, Unterpixel-Korrektur der Bewegung, mal die Deckung des nächsten Texels
                        const phase = versatz.mul(ausGr).fract().abs();
                        const pw = max(phase, phase.oneMinus());
                        const alpha = float(0.05).add(pw.x.mul(pw.y).oneMinus().div(0.75).mul(0.25)).toVar();
                        alpha.mulAssign(wNah);
                        // DAS ANLAUFEN (K68): nach dem Beginn der Geschichte ist sie das MITTEL aller Frames seither — das Jetzt
                        // wiegt mindestens 1/(n+1). Bis K68 wog der erste Frame (Gewicht 1) nach 32 Frames noch 44 % (0,05 ×
                        // Deckung je Frame): die rotierende Dither-Blende stand als Schachbrett im Bild (Radeon, Mess-Wiese,
                        // zweiton des ganzen Bilds 0,0228 nach 32 Frames, 0,0037 nach 120).
                        const anlauf = float(1).div(this._anlauf.add(1));
                        alpha.assign(gueltig.select(max(alpha.add(lauf), anlauf).saturate(), float(1)));
                        // die Varianz-Klemme der Geschichte über die 3×3 Eingangs-Texel, wo das Deckungs-Gedächtnis sie nicht löst
                        const gamma = mix(float(0.5), this._gammaRuhe, lauf.oneMinus().pow2());
                        const mittel = m1.div(9);
                        const sigma = m2.div(9).sub(mittel.mul(mittel)).max(0).sqrt().mul(gamma);
                        const histC = mix(klemme(hist.rgb, mittel.sub(sigma), mittel.add(sigma)), hist.rgb, lass);
                        // die Flimmer-Dämpfung nach Luma (r184 flickerReduction)
                        const wJ = alpha.div(luminance(jetzt.div(max(jetzt.x, jetzt.y, jetzt.z).add(1))).add(1));
                        const wG = alpha
                            .oneMinus()
                            .div(luminance(histC.div(max(histC.x, histC.y, histC.z).add(1))).add(1));
                        const aus = jetzt
                            .mul(wJ)
                            .add(histC.mul(wG))
                            .div(max(wJ.add(wG), 1e-5));
                        const dMitte = tief.load(zelle.clamp(vec2(0), hoch)).r;
                        return vec4(aus, T.perspectiveDepthToViewZ(dMitte, nah, fern));
                    });
                    // Bild mit Vortiefe und Gedächtnis als die zwei Ziele des Quads (MRT, Schlüssel = Namen der Texturen). Bis A3b
                    // lief der Resolve als `colorNode`: r184 setzt a eines undurchsichtigen Stoffs auf 1 — die Vortiefe lag nie in der
                    // Geschichte, die Disokklusion war blind (Radeon, gelesen: a = 1 an jedem Pixel; jetzt die Sicht-Tiefe, −22,5 m).
                    this._resolveMaterial.mrtNode = T.mrt({
                        "TRAANode.resolve": resolve(),
                        "TRAANode.flacker": flackerNeu,
                    });
                };
                bau();
                this._stoffBau = bau;
                return this._textureNode;
            }
            // die Unschärfe der Bewegung wechselt (`_zugangTakt`): die Konstante des Resolve, sein Stoff neu gebaut — nur beim
            // Wechsel, nie je Bild; vor dem ersten Bau (`setup`) liest der Bau sie selbst
            laufPxSetzen(px) {
                if (px === this._laufPx) return;
                this._laufPx = px;
                if (!this._stoffBau) return;
                this._stoffBau();
                this._resolveMaterial.needsUpdate = true;
            }
        }
        return new ZeitAufloesung();
    }

    // DAS AUSGABE-ZIEL DER SZENE IN 32 BIT (0910-1 B, Host-VRAM Runde 2): r184s Szenen-Pass legt `output` als rgba16float an
    // (8 Byte je Pixel, 15,8 MB bei 1080p). Sein Inhalt ist lineares HDR-Licht ≥ 0, und der Kanal a steht an jedem Ort auf 1
    // (der Ziel-Zensus, 07.10.): TRAA reicht `currentColor.a` nur durch (vendor/TRAANode.js clipAABB), kein Leser wertet ihn.
    // rg11b10ufloat trägt dieselben drei Kanäle in 4 Byte (−7,9 MB) mit 6/6/5 Bit Mantisse — für das EINE Bild eines Frames, das
    // jedes Fragment gedithert schreibt (`_ausgabeDither`). Auflösung und Geschichte bleiben rgba16float: dort summiert die zeitliche
    // Auflösung über 32 Frames, und rg11b10 posterisierte die Wolken zu Höhenlinien (W7, alle drei in 11/11/10). Ohne das
    // Geräte-Feature `rg11b10ufloat-renderable` bleibt `output` rgba16float — LAUT (WARN mit Grund und Zahl, und der Ziel-Zensus
    // nennt das Format), nie still.
    _ausgabeFormat(szenePass) {
        const rend = this.state.renderer;
        const be = rend && rend.backend;
        const ziel = szenePass && szenePass.renderTarget;
        if (!ziel || !ziel.texture) return;
        const dev = be && be.isWebGPUBackend === true ? be.device : null;
        if (!(dev && dev.features && dev.features.has("rg11b10ufloat-renderable"))) {
            this.state._ausgabeFormat = "rgba16float";
            this.log(
                "AUSGABE: rg11b10ufloat ist auf diesem Gerät nicht renderbar (Feature rg11b10ufloat-renderable fehlt) — das Szenen-Ziel " +
                    "bleibt rgba16float, +7,9 MB bei 1080p",
                "WARN"
            );
            return;
        }
        // r184 `PassNode.setup` schreibt bei jedem Bau `texture.type = renderer.getOutputBufferType()` (rgba16float) — das Format
        // gehört diesem EINEN Pass, nicht dem Renderer (dessen Typ legt auch das Rahmen-Ziel des Direktpfads an, RGBA: dort gibt es
        // kein 11/11/10). Der Pass stellt es darum nach seinem eigenen Bau.
        const P = Object.getPrototypeOf(szenePass);
        szenePass.setup = function (builder) {
            const o = P.setup.call(this, builder);
            this.renderTarget.texture.type = THREE.UnsignedInt101111Type;
            this.renderTarget.texture.format = THREE.RGBFormat;
            return o;
        };
        ziel.texture.type = THREE.UnsignedInt101111Type;
        ziel.texture.format = THREE.RGBFormat;
        this.state._ausgabeFormat = "rg11b10ufloat";
        this.state._ausgabeVersatz = this._uniformHeimatTeilen({ v: THREE.TSL.uniform(0) }).v;
        this._ausgabeSonde(dev);
    }

    // DIE DITHERUNG DES SZENEN-ZIELS (w4-ferne-blau): 6/6/5 Bit Mantisse teilen jede glatte Rampe — Wolke, Himmel, Dunst — in
    // Stufen von 1/64 bzw. 1/32 ihres Werts (die Wolken-Decke am Kopf 715754fc in Höhenlinien je 1–2 Ausgabe-Stufen, Blau doppelt
    // so grob), und weil das Gerät gegen null rundet, fällt der Fehler je Pixel in jedem Frame gleich: die zeitliche Auflösung
    // mittelt ihn nie weg. Darum trägt jedes Fragment des Szenen-Passes vor dem Schreiben (u − Versatz) ulp seines Kanals, u aus
    // dem Interleaved-Gradient-Rauschen der Stufen-Blende (`__phytoCore.lodDitherIGN`, quer gelesen, rotiert mit `uDitherT`).
    // Der Versatz ist die Rundung des Geräts (`_ausgabeSonde`): gegen null 0, zum nächsten ½ — so ist jeder geschriebene Wert im
    // Mittel das Licht selbst (E[⌊x/q + u⌋] = x/q), für JEDEN Leser des Ziels; über die 32 Frames der Geschichte liest die
    // Auflösung es ohne Stufe. DIE EINE STELLE ist der Eintrag `output` des MRT des Szenen-Passes (`_ensurePostProcessing`): unter
    // einem MRT schreibt r184 (`NodeMaterial.setup`) jeden Stoff über den MRT-Knoten ins Ziel — das `getOutput` im Kontext des
    // Passes (w4-ferne-blau) erreichte nur die Stoffe mit eigenem `outputNode`: zwei Phasen änderten 2,4 % der Pixel statt des
    // ganzen Bilds, die übrigen schrieben ohne Ausgleich, gegen null gerundet (heil-w4-ferne-blau, gate:ziel-zensus RUNDUNG: 0,024
    // → 0,758). `farbe` ohne 11/11/10 unverändert. Bis w4-ferne-blau hob ein Ausgleich nach dem Lesen das Mittel (E[1/m] des
    // Gesetzes, 0,56 % / 1,13 %) — nur in der Post-Kette, der Spiegel des Wassers las das Ziel ohne ihn.
    _ausgabeDither(farbe) {
        const versatz = this.state._ausgabeVersatz;
        if (this.state._ausgabeFormat !== "rg11b10ufloat" || !versatz) return farbe;
        const T = THREE.TSL;
        const fc = T.screenCoordinate;
        const u = T.fract(
            T.float(52.9829189)
                .mul(T.fract(fc.y.mul(0.06711056).add(fc.x.mul(0.00583715))))
                .add(this._ensureLodUniforms().uDitherT)
        );
        const c = farbe.rgb.max(T.vec3(0));
        const ulp = T.exp2(T.floor(T.log2(c.max(T.vec3(2 ** -14)))).sub(T.vec3(6, 6, 5)));
        return T.vec4(c.add(ulp.mul(u.sub(versatz))).max(T.vec3(0)), farbe.a);
    }

    // DIE RUNDUNG DES GERÄTS (0910-1 B): GTX 1060 und Radeon 890M runden beim Schreiben in 11/11/10 GEGEN NULL (Sonde: 1 + ¾ ulp
    // → 1,0; W7 sah es auf der Radeon in der Geschichte) — ohne Ditherung fehlte je Kanal im Mittel ein halbes ulp, das Bild
    // wurde 0,2–0,7 Luma-Stufen dunkler und gelber (gemessen OMEN, 16 Blicke, A/B gegen rgba16float). Die Sonde schreibt 1 + ¾ ulp
    // in ein 1×1-Ziel und liest zurück: rundet das Gerät gegen null, dithert das Ziel um u · ulp, rundet es zum nächsten, um
    // (u − ½) · ulp (`_ausgabeVersatz`).
    _ausgabeSonde(dev) {
        const st = this.state;
        const tex = dev.createTexture({
            label: "ausgabe-sonde",
            size: [1, 1],
            format: "rg11b10ufloat",
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        });
        const modul = dev.createShaderModule({
            label: "ausgabe-sonde",
            code:
                "@vertex fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {\n" +
                "    let p = vec2f(f32((i << 1u) & 2u), f32(i & 2u));\n" +
                "    return vec4f(p * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0), 0.0, 1.0);\n" +
                "}\n" +
                "@fragment fn fs() -> @location(0) vec4f { return vec4f(1.01171875, 1.01171875, 1.0234375, 1.0); }\n",
        });
        // ihre Pipeline entsteht asynchron (w16-lade-atem: der PSO-Vorbau — eine synchrone hält den GPU-Prozess vor dem Bild)
        const buf = dev.createBuffer({
            label: "ausgabe-sonde",
            size: 256,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
        return dev
            .createRenderPipelineAsync({
                label: "ausgabe-sonde",
                layout: "auto",
                vertex: { module: modul, entryPoint: "vs" },
                fragment: { module: modul, entryPoint: "fs", targets: [{ format: "rg11b10ufloat" }] },
                primitive: { topology: "triangle-list" },
            })
            .then((pipe) => {
                const enc = dev.createCommandEncoder({ label: "ausgabe-sonde" });
                const pass = enc.beginRenderPass({
                    label: "ausgabe-sonde",
                    colorAttachments: [
                        { view: tex.createView(), loadOp: "clear", clearValue: [0, 0, 0, 0], storeOp: "store" },
                    ],
                });
                pass.setPipeline(pipe);
                pass.draw(3);
                pass.end();
                enc.copyTextureToBuffer({ texture: tex }, { buffer: buf, bytesPerRow: 256 }, [1, 1]);
                dev.queue.submit([enc.finish()]);
                return buf.mapAsync(GPUMapMode.READ);
            })
            .then(() => {
                const w = new Uint32Array(buf.getMappedRange())[0];
                buf.unmap();
                // R: Mantisse Bit 0–5 über 1 + ¾ ulp: 0 = gegen null, 1 = zum nächsten
                const nullRund = (w & 0x3f) === 0;
                st._ausgabeRundung = nullRund ? "gegen null" : "zum nächsten";
                st._ausgabeVersatz.value = nullRund ? 0 : 0.5;
                this.log(
                    `AUSGABE: rg11b10ufloat, das Gerät rundet ${st._ausgabeRundung} — die Ditherung trägt (u − ${st._ausgabeVersatz.value}) ulp`,
                    "INFO"
                );
            })
            .catch((e) => {
                this.log(
                    "AUSGABE: die Rundungs-Sonde fiel (" +
                        ((e && e.message) || e) +
                        ") — die Ditherung nimmt gegen null an",
                    "WARN"
                );
            })
            .finally(() => {
                tex.destroy();
                buf.destroy();
            });
    }

    // DIE EINE SZENEN-SKALA (K50): die interne Auflösung der Szene relativ zur Ausgabe — `state.szeneSkala` (der Regler
    // „Szene-Auflösung“ im Menü, im Snapshot), sonst `SZENE_SKALA`. Sie lebt nur mit der zeitlichen Auflösung: ohne sie (Holz
    // kienspan) gibt es keinen Hochskalierer, die Szene rendert in der Ausgabe-Auflösung.
    _szeneSkalaWirk() {
        if (!this.state._traa) return 1;
        const s = this.state.szeneSkala;
        const w = s == null || !Number.isFinite(+s) ? AnazhRealm.SZENE_SKALA : +s;
        return Math.max(AnazhRealm.SZENE_SKALA_MIN, Math.min(1, w));
    }

    // DER ZUGANG IM BILD (spielgang.K4), je Bild aus `_loopRender`: der Stand `state.zugang` (Einstellungen › Ton & Sicht, im
    // Snapshot) ist die EINE Quelle, die Kette liest ihn hier — die Farbsicht (`farbsicht`: die Art, ihr Fehler und Schub aus
    // `_farbsichtMatrix`; ihre Ausgabe der Kette nur, wenn eine Art gewählt ist) und die Unschärfe der Bewegung: sie IST die
    // Geschichte der zeitlichen Auflösung, die einem bewegten Pixel bis `maxVelocityLength` (r184: 128 px je Bild) nachzieht;
    // aus (`unschaerfe` false) weicht sie ab `ZUGANG.laufPxAus` Ausgabe-Pixeln Bewegung je Bild ganz dem Jetzt (die Konstante
    // des Resolve, `laufPxSetzen`). Alles nur beim Wechsel: aus ist die Kette der Graph ohne Zugang, Knoten für Knoten.
    _zugangTakt(ppu) {
        const Z = this.state.zugang || {};
        const art = AnazhRealm.FARBSICHT.arten.includes(Z.farbsicht) ? Z.farbsicht : "aus";
        const pp = this.state.postProcessing;
        if (pp && ppu && ppu.ausgabe && ppu._farbArt !== art) {
            const m = AnazhRealm._farbsichtMatrix(art);
            if (m) (ppu.farbFehler.value.set(...m.fehler), ppu.farbSchub.value.set(...m.schub));
            const ziel = m ? ppu.ausgabe.farbsicht : ppu.ausgabe.aus;
            if (pp.outputNode !== ziel) {
                pp.outputNode = ziel;
                pp.needsUpdate = true;
            }
            ppu._farbArt = art;
        }
        const traa = this.state.traaNode;
        if (traa && traa.laufPxSetzen)
            traa.laufPxSetzen(Z.unschaerfe === false ? AnazhRealm.ZUGANG.laufPxAus : traa.maxVelocityLength);
    }

    // Post-Processing-Pipeline: EIN THREE.PostProcessing mit Bloom + Color-Grading (Sättigung + Kontrast),
    // aus TSL-Primitiven selbst gebaut (kein Vendor-Addon). Lazy nach rendererReady; bei jedem Fehler
    // postProcessingFailed=true → der Loop rendert direkt renderer.render() (nie schwarzer Schirm).
    _ensurePostProcessing() {
        if (this.state.postProcessing || this.state.postProcessingFailed) return this.state.postProcessing;
        // DER NULL-RENDERER TRÄGT KEINE KETTE (headless, `_isHeadlessNull`): er zeichnet nie, r184s RenderPipeline liest im
        // render() seinen XR-Zustand (`renderer.xr.enabled`), den er nicht hat — bis hier warf die Kette dort JEDEN Frame, und
        // jeder headless-Lauf meldete ERROR „STOFF: die Post-Kette (Render-Lauf …) — Cannot read properties of undefined
        // (reading 'enabled')" (gate:fern-ring auf main, unbemerkt grün). Der Schirm ohne Pixel hat keine Kette — kein Bruch.
        if (this.state.renderer && this.state.renderer._isHeadlessNull) return null;
        try {
            const TSL = THREE.TSL;
            // V18.113 — der PR-#81-Vendor benennt PostProcessing → RenderPipeline um
            // (die Deprecation-Warnung in der Schöpfer-Konsole); wir nehmen den neuen
            // Namen zuerst, der alte bleibt der Fallback für ältere Vendor-Stände.
            const PPCtor =
                typeof THREE.RenderPipeline === "function"
                    ? THREE.RenderPipeline
                    : typeof THREE.PostProcessing === "function"
                      ? THREE.PostProcessing
                      : null;
            const { pass, uniform, vec2, vec3, float, luminance, smoothstep, screenUV, max, min } = TSL;
            const pp = new PPCtor(this.state.renderer);
            const scenePass = pass(this.state.scene, this.state.camera);
            // DIE EINE SZENEN-SKALA (K50): der Szenen-Pass rendert in ihr, die zeitliche Auflösung löst auf die Ausgabe auf
            // (`_zeitAufloesung`). Gesetzt vor dem ersten Render; ein neuer Wert (der Regler im Menü) legt die Ziele beim
            // nächsten Frame neu an wie ein Fenster-Wechsel (`_loopRender`), nie je Last.
            scenePass.setResolutionScale(this._szeneSkalaWirk());
            this._ausgabeFormat(scenePass); // das Szenen-Ziel in rg11b10ufloat (0910-1 B), vor dem ersten Render
            // DER GLANZ DES BILDS (material.K4): ein zweites Ziel des Szenen-Passes (r8, MRT) trägt je Pixel, wie sehr seine
            // Fläche spiegelt (`_glanzKnoten`) — daran erkennt der EINE Spiegel-Pass (`_spiegelPass`) Glas, Lack, Metall und
            // Nässe wie das Wasser an seiner Zelle. r184 mischt nur `output` nach dem Stoff, das Glanz-Ziel schreibt ohne
            // Mischung (MRTNode `_noBlending`): eine Scheibe trägt ihren Glanz ganz. 1,17 MB bei 1080p und Skala 0,75. Der Eintrag
            // `output` trägt die Ditherung des Ziels (`_ausgabeDither`): durch ihn schreibt jeder Stoff des Passes.
            scenePass.setMRT(TSL.mrt({ output: this._ausgabeDither(TSL.output), glanz: this._glanzKnoten() }));
            const glanz = scenePass.getTexture("glanz");
            glanz.type = THREE.UnsignedByteType;
            glanz.format = THREE.RedFormat;
            glanz.minFilter = glanz.magFilter = THREE.NearestFilter;
            this.state.scenePass = scenePass;
            // EIN Szene-Pass, eine Diät-Wahrheit: ein zweiter Szene-Pass (die Fern-Schicht) ließ Material-Diät
            // und Uniform-Updates zwischen den Pässen racen (Schwarz-Flackern); das Ferne trägt der Welt-March.
            // API-korrekt: der sampelbare Textur-Node kommt aus
            // getTextureNode() (PassNode != TextureNode — .sample() lebt am
            // TextureNode). Das ist das offizielle MRT/pass-Muster.
            let sceneColor = scenePass.getTextureNode();
            // DIE ZEITLICHE AUFLÖSUNG (TRAA, vendor/TRAANode.js = r184 verbatim) statt FXAA am Ende: die Kamera
            // springt je Frame um einen Halton-Subpixel, die Geschichte wird reprojiziert und gegen die Varianz der
            // 3×3-Nachbarschaft geklemmt — Kanten sind echt übersampelt, und die rotierende LOD-Dither-Blende
            // (uDitherT, _loopRender) mittelt sich zu einer glatten Überblendung statt eines Gitters (Befund 04.10.:
            // Birken und Büsche als gerasterte Geister; FXAA sah das Muster als Kante und ließ es stehen). Erste
            // Stufe der Kette (Studio-Gesetz phytogenesis FIX v32: zeitliche Auflösung VOR den Nachbearbeitungen):
            // Bloom, Godrays und lokaler Kontrast lesen das aufgelöste Bild. Die Bewegung je Pixel ist die
            // KAMERA-Bewegung aus der Tiefe (`_traaKameraBewegung`), keine MRT-Velocity. Kosten (04.10., echte GPU
            // Radeon 890M, 1080p, ruhig, gpu-bank 200 Frames × 12 Paare gegen FXAA): +1,1 ms je Frame (die Pass-
            // Stempel sehen nur +0,34 ms — Resolve und Geschichts-Kopie laufen teils außerhalb), VRAM +23,7 MB. Auflösung
            // und Geschichte bleiben rgba16float: alle drei in rg11b10ufloat (−23,7 MB, W7, echte GPU) posterisierten die
            // Wolken zu Höhenlinien, die Radeon rundet beim Schreiben gegen null (Sonde 1,0117 → 1,0; über die Geschichte das
            // Mittel −2…−3 % Luma) und die Ruhe halbierte sich (Frame zu Frame 0,29 → 0,58 Luma auf Armlänge) — 6 bzw. 5
            // Mantissen-Bit tragen die zeitliche Auflösung nicht. Das Szenen-Bild EINES Frames trägt sie: es liegt seit 0910-1 B
            // in rg11b10ufloat (`_ausgabeFormat`, −7,9 MB), gedithert geschrieben (`_ausgabeDither`). Seit K50 ist sie der
            // zeitliche HOCHSKALIERER (`_zeitAufloesung`): die Szene in der Szenen-Skala, Geschichte und Resolve in der Ausgabe.
            // Fehlt TRAANode im THREE der Seite (eine Cache-Kopie des Bootstraps von vor der zeitlichen Auflösung), bricht
            // die Kette LAUT — nie still ohne Kantenglättung, Bloom und Grading weiter.
            if (this.state._traa && typeof THREE.TRAANode !== "function") {
                this.log(
                    "Post-Kette: THREE.TRAANode fehlt — vendor/three-bootstrap.js ist eine veraltete Kopie (der ?v=-Buster folgt der Version).",
                    "ERROR"
                );
                throw new Error("THREE.TRAANode fehlt im Bootstrap");
            }
            const traa = this.state._traa
                ? this._zeitAufloesung(
                      pp,
                      sceneColor,
                      scenePass.getTextureNode("depth"),
                      this._traaKameraBewegung(TSL, scenePass.getTextureNode("depth")),
                      this.state.camera
                  )
                : null;
            if (traa) sceneColor = traa.getTextureNode();

            const u = {
                // Bloom-Schwelle 0.86: nur sehr helle Spitzen (Sonnen-Disc, Wasser-Glitzer) bloomen, nicht der
                // diffuse Himmel — sonst blutet der Blur in die Skyline und die Sonne überstrahlt Berg-Silhouetten.
                // Stärke 0.38; browser-justierbar.
                bloomThreshold: uniform(0.86),
                bloomStrength: uniform(0.38),
                bloomRadius: uniform(2.2),
                // 0 = Tag → 1 = Nacht (`_dayNightApplyDirectionalLight`): das Auge der Nacht liest ihn (unten).
                nightFactor: uniform(0),
                // Der lokale Kontrast (Unsharp-Mask) ist NUR der Spieler-Regler „Kanten-Schärfe" (`kantenSchaerfe`, Default 0 —
                // die Foto-Kette F1: das Bild trägt die Kante, die der Stoff zeichnet; aus = der Zweig fällt mit seinen 4 Abtastungen).
                localContrast: uniform(
                    this.state.atmosphere && Number.isFinite(this.state.atmosphere.kantenSchaerfe)
                        ? this.state.atmosphere.kantenSchaerfe
                        : 0
                ),
                // GODRAYS: additiver Screen-Space-Radial-March als NODE in DIESEM Pass (kein zweiter RenderPipeline,
                // keine MRT-Depth). `godraySun` = Sonnen-Screen-UV (pro Frame projiziert), `godrayStrength` = Pegel
                // (0 → No-op), `godrayDensity` = March-Länge, `godrayThreshold` = Himmels-Helligkeits-Schwelle (nur
                // helle Lücken bluten → Kronen-Occlusion gratis).
                godraySun: uniform(new THREE.Vector2(0.5, 0.6)),
                godrayStrength: uniform(0),
                godrayDensity: uniform(0.55),
                godrayThreshold: uniform(0.8),
                // DIE NACH-SCHÄRFE DER HOCHSKALIERUNG (K50): `ZEIT_SCHAERFE × (1 − Szenen-Skala)`, gestellt in `_loopRender` — bei
                // Skala 1 null (die Stufe kostet dann nichts).
                nachSchaerfe: uniform(0),
                // DIE FARBSICHT (spielgang.K4): der Fehler e und der Schub v der gewählten Art (`state.zugang.farbsicht`,
                // `_farbsichtMatrix`) — `_zugangTakt` stellt sie beim Wechsel und hängt ihre Ausgabe (`ausgabe.farbsicht`) ein.
                farbFehler: uniform(new THREE.Vector3()),
                farbSchub: uniform(new THREE.Vector3()),
            };
            this.state.postProcessingUniforms = u;
            // V8 (Kür) — die EINE benannte Godray-Quelle (Gesetz #0): der Frame-Code (`_loopRender`)
            // + der Perf-Lever (`_nexusPerfActuate` via `_godrayScale`) lesen NUR diese Uniforms.
            this.state.godrayUniforms = {
                sunScreenPos: u.godraySun,
                strength: u.godrayStrength,
                density: u.godrayDensity,
                threshold: u.godrayThreshold,
            };

            // DIE STUFE KOSTET NUR, WENN SIE ZEIGT: eine Nachbild-Stufe mit Stärke-Regler (Godrays: Sonne im Bild ×
            // Wetter × Höhe × Regler; lokaler Kontrast: der Kanten-Schärfe-Regler, 0 = aus) rechnet ihre Abtastungen in
            // einem Zweig, den der Regler wählt — eine Uniform, also einheitlich für jedes Pixel (keine Divergenz, WGSL-
            // Gleichförmigkeit erlaubt die Abtastung darin). Bei Stärke 0 liefert sie 0 wie zuvor das Produkt mit 0, nur
            // ohne die Abtastungen: die Godrays tasteten 20× je Pixel auch ohne Sonne im Bild (06.10., GTX 1060, Mess-
            // Wiese: 0,69 ms je Frame). Die Stufe reist als Argument (der Ketten-Graph bleibt lesbar: die Zerleg-Linse
            // findet sie über ihre Stärke-Uniform, `ketteKante`); TSL erzeugt ihren Code dort, wo sie zuerst gebraucht
            // wird — im Zweig. Was davor UND im Zweig gebraucht wird (das gemischte Bild), steht vor dem Aufruf.
            // Die Wand: gate:post-kette (die Abtastungen der Stufen im erzeugten WGSL stehen im Zweig, das Budget der
            // unbedingten Abtastungen hält).
            const nurBeiStaerke = TSL.Fn(([stufe, staerke]) => {
                const aus = vec3(0, 0, 0).toVar();
                TSL.If(staerke.notEqual(float(0)), () => {
                    aus.assign(stufe);
                });
                return aus;
            });

            // --- Bloom: helle Stellen (luminance > Schwelle) isolieren, weich
            // verschmieren (9-Tap-Gauss via screenUV-Offsets), additiv zurueck
            // -> Glanz/Gluehen an Wasser/Sonne/Highlights. `bright` sampelt den
            // Szene-Textur-Node an versetzter UV. Die MITTE ist zugleich das Bild selbst (`base`): EINE Abtastung
            // trägt beide (vorher zwei an derselben Stelle — die Ausgabe-UV des Quads ist screenUV). Das Szenen-Bild ist im Mittel
            // das Licht selbst: die Rundung des Ziels trägt die Ditherung beim Schreiben (`_ausgabeDither`).
            const bild = (uv) => sceneColor.sample(uv).rgb;
            // DIE NACH-SCHÄRFE (K50): die zeitliche Hochskalierung rekonstruiert die Ausgabe aus einer kleineren Szene, ihr Bild ist
            // um eine Spur weicher (gemessen am Ausgabe-Pfad, Gradient der Kanten). Wie jeder Hochskalierer (FSR2 RCAS, TSR) schärft
            // die Kette NACH dem Resolve — nie in die Geschichte: die Mitte gegen ihre vier Nachbarn in Ausgabe-Pixeln, geklemmt auf
            // deren Spanne (kein Saum über das Minimum und Maximum der Nachbarschaft hinaus). Stärke 0 → der Zweig fällt.
            const roh = bild(screenUV);
            const px1 = vec2(1, 1).div(TSL.screenSize);
            const schaerfeDelta = () => {
                const o = bild(screenUV.sub(vec2(float(0), px1.y)));
                const un = bild(screenUV.add(vec2(float(0), px1.y)));
                const li = bild(screenUV.sub(vec2(px1.x, float(0))));
                const re = bild(screenUV.add(vec2(px1.x, float(0))));
                const mn = min(min(min(o, un), min(li, re)), roh);
                const mx = max(max(max(o, un), max(li, re)), roh);
                const scharf = roh.add(roh.mul(4).sub(o).sub(un).sub(li).sub(re).mul(u.nachSchaerfe));
                return scharf.clamp(mn, mx).sub(roh);
            };
            const mitte = roh.add(nurBeiStaerke(schaerfeDelta(), u.nachSchaerfe));
            const bright = (uv) => {
                const c = uv === screenUV ? mitte : bild(uv);
                const l = luminance(c);
                const m = smoothstep(u.bloomThreshold, u.bloomThreshold.add(float(0.25)), l);
                return c.mul(m);
            };
            const px = float(0.0018).mul(u.bloomRadius);
            const taps = [
                [0, 0, 0.227],
                [1, 0, 0.094],
                [-1, 0, 0.094],
                [0, 1, 0.094],
                [0, -1, 0.094],
                [1, 1, 0.056],
                [-1, 1, 0.056],
                [1, -1, 0.056],
                [-1, -1, 0.056],
            ];
            let acc = bright(screenUV).mul(float(taps[0][2]));
            for (let i = 1; i < taps.length; i++) {
                const [dx, dy, w] = taps[i];
                const uvT = screenUV.add(vec2(px.mul(float(dx)), px.mul(float(dy))));
                acc = acc.add(bright(uvT).mul(float(w)));
            }
            const bloom = acc.mul(u.bloomStrength);

            // --- GODRAYS: radialer Light-Shaft-March (GPU-Gems-3). Je Pixel N feste Schritte Richtung
            // Sonnen-Screen-Position; nur sehr helle Himmels-Lücken tragen bei → Occlusion durch Blatt/Berg
            // gratis, ohne Depth-Buffer. UNROLLT (der JS-Loop akkumuliert TSL-Nodes, kein Shader-Loop); der
            // Beitrag klingt mit 0.96^i ab. Stärke 0 → der Zweig fällt, keine Abtastung (`nurBeiStaerke`).
            const GN = 20;
            const gDelta = u.godraySun.sub(screenUV); // Vektor Pixel → Sonne (Screen-UV)
            let gacc = null;
            for (let i = 0; i < GN; i++) {
                const uvI = screenUV.add(gDelta.mul(u.godrayDensity.mul(float(i / GN))));
                const cI = bild(uvI);
                const mI = smoothstep(u.godrayThreshold, u.godrayThreshold.add(float(0.2)), luminance(cI));
                const wI = Math.pow(0.96, i) * (1 / GN); // JS-Skalar-Gewicht
                const srcI = cI.mul(mI).mul(float(wI));
                gacc = gacc ? gacc.add(srcI) : srcI;
            }
            const godray = nurBeiStaerke(gacc.mul(u.godrayStrength), u.godrayStrength);

            // --- DIE FOTO-KETTE (F1): das Bild, wie die Kamera es sieht — kein Spiel-Filter dazwischen. Bis F1 trug die Kette vier:
            // Sättigung 1,18, Kontrast 1,06 um 0,5, das Entgrauen (grauer Pixel warm angehoben, ein Pflaster gegen graue Albedo) und
            // den lokalen Kontrast 0,46; dazu ACES. Die Farbe kommt aus Gesetz und Albedo-Tafel (Lehre 21): was danach grau oder satt
            // wirkt, ist ein benannter Befund am Stoff, nie ein Regler der Kette.
            const base = mitte;
            const bloomed = base.add(bloom).add(godray);
            // Der lokale Kontrast (Unsharp-Mask, der Spieler-Regler „Kanten-Schärfe", Default 0): die Umgebungs-Luminanz aus 4
            // versetzten Abtastungen, die Differenz Pixel − Umgebung verstärkt. Stärke 0 → der Zweig fällt mit seinen 4
            // Abtastungen (`nurBeiStaerke`).
            const lcPx = float(0.0026);
            const lumAt = (uv) => luminance(bild(uv));
            const localAvg = lumAt(screenUV.add(vec2(lcPx, float(0.0))))
                .add(lumAt(screenUV.add(vec2(lcPx.negate(), float(0.0)))))
                .add(lumAt(screenUV.add(vec2(float(0.0), lcPx))))
                .add(lumAt(screenUV.add(vec2(float(0.0), lcPx.negate()))))
                .mul(float(0.25));
            const selfLum = luminance(bloomed);
            const detail = selfLum.sub(localAvg); // >0 heller als Umgebung (Kante/Spitze)
            const combined = bloomed.add(nurBeiStaerke(bloomed.mul(detail.mul(u.localContrast)), u.localContrast));
            // DAS AUGE DER NACHT (K66, Augen-Runde 15.10.: nachts leuchtete die Giebelwand gesättigt orange, ihr Abfall lief
            // tiefrot — HSV 0,92 an der Wand, 0,99 im Abfall): unter der Nacht sieht das Auge mesopisch — zwischen den
            // Leuchtdichten des Stäbchen- und des Zapfen-Sehens (`NACHT_AUGE`, CIE 191:2010) trägt der Zapfen-Anteil die Farbe
            // (log-linear 0 … 1); die Leuchtdichte des Pixels in cd/m² aus der Eichung der Nacht (der Stoff rechnet Albedo/π ·
            // Bestrahlung in Welt-Einheiten). Es ist die EINE Sättigung der Kette und nur ein Knoten der Nacht: am Tag
            // (`nightFactor` 0) fällt der Zweig (`nurBeiStaerke`), das Bild geht unberührt in die Tonkurve.
            const NA = AnazhRealm.NACHT_AUGE;
            const staebchenSicht = () => {
                const lum = luminance(combined);
                const zapfen = TSL.log(
                    lum.mul(float(NA.luxJeEinheit)).max(float(NA.staebchenCd)).div(float(NA.staebchenCd))
                )
                    .div(float(Math.log(NA.zapfenCd / NA.staebchenCd)))
                    .clamp(0, 1);
                return vec3(lum, lum, lum).sub(combined).mul(float(1).sub(zapfen).mul(u.nightFactor));
            };
            const gesehen = combined.add(nurBeiStaerke(staebchenSicht(), u.nightFactor));
            const graded = gesehen.max(vec3(0, 0, 0));
            // DIE FARBSICHT (spielgang.K4, `AnazhRealm.FARBSICHT`): die Daltonisierung als die LETZTE Abbildung des Lichts vor der
            // Tonkurve, Δ = v · max(e · Bild, 0) — Weiß-treu (Grau trägt e = 0) und je Seite linear: sie vertauscht mit dem Versatz
            // der Tonkurve (PBR Neutral zieht unter ihrem Knie nur einen grauen Sockel ab), im Mittelbereich ist sie dieselbe wie
            // auf dem getonten Bild. Sie ist eine eigene AUSGABE der Kette (`u.ausgabe`), die `_zugangTakt` beim Wechsel der Art
            // einhängt: aus fehlt ihr Knoten im Graphen, das Fragment ist byte-gleich dem ohne Zugang (vp-0611g: ein Zweig hinter
            // einer Uniform rundete auf 6,2 % der Pixel um 1 LSB; swiftshader, Holz nah: Ausgabe 17 802 B und Resolve 23 397 B
            // gleich main, der Zweig trug 18 191 / 23 449 B; die Wand: gate:post-kette (i)). DER HIMMEL BLEIBT (die EINE Himmels-Maske aller Arten): wo die
            // Szenen-Tiefe über der Himmels-Schwelle des Spiegels steht (0,99999, `bild-sicht`), zeichnete nur der Himmel
            // (`_himmelImUnendlichen`: Kuppel, Sterne, Sonne und Mond auf Tiefe 1 — die Sonne rastert ihre 1 eine Spur darunter,
            // gate:post-kette 80 Pixel unter Deuteranopie) — dort wirkt Δ nie. Deut und Prot trafen das Blau nie (e · Himmelsblau
            // < 0), die Tritanopie (e = 0,859 (B − G)) traf genau es (OMEN Ego RGB 71,6/93,1/104,5 → 59,1/85,2/105,2).
            const szenenTiefe = scenePass.getTextureNode("depth");
            const tiefenGr = vec2(szenenTiefe.size());
            const welt = szenenTiefe
                .load(screenUV.mul(tiefenGr).floor().clamp(vec2(0), tiefenGr.sub(1)))
                .r.lessThan(float(0.99999))
                .select(float(1), float(0));
            const farbsichtDelta = u.farbSchub.mul(TSL.dot(u.farbFehler, gesehen).max(0).mul(welt));
            u.ausgabe = { aus: graded, farbsicht: gesehen.add(farbsichtDelta).max(vec3(0, 0, 0)) };

            // Die Ausgabe-Wandlung (die Tonkurve Khronos PBR Neutral + sRGB, `_ensureRenderer`) macht die Pipeline selbst im
            // Ausgabe-Quad — keine Zwischen-Textur.
            pp.outputNode = graded;
            this.state.postProcessing = pp;
            // die Kette liest die Uhr der Welt ab ihrem ersten Bild (K66): `nightFactor` setzt die Tag-Nacht-Anwendung — bis K66 erst beim
            // nächsten Uhr-Wechsel, das erste Bild nach dem Bau trug den Tag (die S0-Probe maß ihren ersten Nacht-Schuss ohne das Auge der Nacht)
            this._applyDayNightToScene();
            // Die Leinwand-Tiefe stellt die Weiche in `_loopRender` (`_leinwandWeg`) je Pfad — nie der Bau.
            // Die Kette steht: ab jetzt rotiert die Dither-Blende (_loopRender liest den Knoten, nie ein Flag).
            this.state.traaNode = traa;
            this.log("Post-Processing-Pipeline gebaut (Bloom + Grading) — V17.0.", "INFO");
            return pp;
        } catch (err) {
            // der Schirm zeichnet dann direkt (nie schwarz) — aber nie still: der Bruch steht beim Namen im Log
            this.state.postProcessingFailed = true;
            this._stoffBruch("die Post-Kette (TRAA · Bloom · Grading) — der Schirm zeichnet direkt", err);
            return null;
        }
    }

    // DIE KAMERA-BEWEGUNG je Pixel für die zeitliche Auflösung — das Studio-Gesetz TAA-Lite (phytogenesis FIX v32):
    // „die Welt ist statisch, also ist Kamerabewegung EXAKT reprojezierbar (Szenentiefe + ViewProj des letzten
    // Frames); Wind/Wasser fängt der Nachbarschafts-Klemm". Ein Pixel (uv, Tiefe) im Clip-Raum dieses Frames, mal
    // R = PV_vor · PV_jetzt⁻¹ (`_traaReprojektion`, je Frame in float64 auf der CPU gefaltet — keine Welt-
    // Translation im Shader), liegt im Clip-Raum des vorigen Frames; die Differenz der NDC ist die Bewegung, die
    // TRAANode als `velocityNode.load(texel)` liest. Keine MRT-Velocity: sie schriebe je Fragment JEDES Materials
    // ein zweites Ziel und rechnete je Vertex die Vorgänger-Transformation, und ihre Objekt-Uniforms
    // (previousModelWorldMatrix) schreibt die Diät (_diaetRefresh) nur, wenn sich das Objekt ändert (equals) —
    // der ganze stehende Wald hätte die Bewegung seines letzten Refreshs getragen. Was sich selbst bewegt (Tiere, Wind),
    // fängt die Varianz-Klemme der Geschichte.
    // DER LEIB, DEN DIE KAMERA TRÄGT (w12-leib-sicht, Befund des Schöpfers 05.11.: am Prüfplatz wurde der eigene Leib beim
    // Seitwärtsgehen durchsichtig): die Welt ist statisch, der Leib des Spielers nicht — er geht MIT der Kamera, steht am Schirm
    // fast still, und die Kamera-Bewegung holte seine Geschichte vom Grund daneben (Radeon, Prüfplatz Third, Strafe: 5–7 % der
    // Leib-Pixel über halb durchsichtig, das Haar ganz). Darum trägt das Feld die TEILE DES GETRAGENEN LEIBS (`_traegerTeile`):
    // je Teil eine Box im Raum seines Ankers (Knochen oder Gerät) und seine eigene Reprojektion PV_vor · W_vor · W⁻¹ · PV⁻¹
    // (`_traegerTakt`, je Frame in float64 gefaltet, die Lage relativ zum Auge). Ein Pixel, dessen Punkt (Tiefe, PV⁻¹) in einer
    // Box liegt, folgt seinem Anker; jeder andere der Kamera wie bisher.
    _traaKameraBewegung(TSL, tiefe) {
        const { vec2, vec3, vec4, float, int, dot, abs, If, Loop, Break } = TSL;
        const R = TSL.uniform(new THREE.Matrix4());
        const N = AnazhRealm.TRAEGER.teile;
        const tr = {
            Q: TSL.uniform(new THREE.Matrix4()), // Clip des Frames → Welt relativ zum Auge
            // DER FESTE NAME (Lehre 23, w28-ankunft-reihe): ohne ihn trägt das WGSL `NodeBuffer_<Knoten-id>`, und die Nummer wandert
            // mit dem Gang des Boots — `TRAA.resolve` trug an der Wiederkehr andere Bytes als kalt (GTX 1050: NodeBuffer_14753 →
            // _17344, der Pipeline-Cache verfehlte sie, 0,44–0,55 s in der Schlange des GPU-Prozesses)
            zeilen: TSL.uniformArray(
                Array.from({ length: 8 * N }, () => new THREE.Vector4()),
                "vec4"
            ).setName("traegerZeilen"), // je Teil 3 Zeilen der Box-Matrix, die Halbachsen, 4 Zeilen der Reprojektion
            zahl: TSL.uniform(0, "int"),
            kugel: TSL.uniform(new THREE.Vector4(0, 0, 0, -1)), // die Kugel um alle Boxen (relativ zum Auge), w < 0: keine
            liste: [],
            vorW: new WeakMap(),
            jetztInv: new THREE.Matrix4(),
            m: new THREE.Matrix4(),
            t: new THREE.Matrix4(),
            v: new THREE.Vector3(),
            box: new THREE.Box3(),
        };
        this.state._traaR = { R, jetzt: new THREE.Matrix4(), vor: new THREE.Matrix4(), neu: true, traeger: tr };
        // Die Tiefen-Textur trägt [0, 1]; die NDC-Tiefe der Projektion ist es nur im WebGPU-Raum. Im WebGL2-Raum
        // (forceWebGL, gate:webgl-probe) liegt sie in [−1, 1]: z = 2·Tiefe − 1, sonst reprojiziert jeder Pixel beim
        // Laufen an die falsche Stelle (Schlieren). Die Textur-Zeilen dreht TSL je Rückend selbst (load, isFlipY).
        const webgpuRaum = this.state.renderer.coordinateSystem === THREE.WebGPUCoordinateSystem;
        // die Bewegung eines Texels: die Kamera, oder liegt sein Punkt in einer Box des getragenen Leibs, ihr Anker
        const bewegung = (texel) => {
            const uvT = texel.div(vec2(tiefe.size()));
            const ndc = vec2(uvT.x.mul(2).sub(1), uvT.y.oneMinus().mul(2).sub(1));
            const d = tiefe.load(texel).r;
            const clip = vec4(ndc, webgpuRaum ? d : d.mul(2).sub(1), 1).toVar();
            const vor = R.mul(clip).toVar();
            const getragen = float(0).toVar();
            const p4 = tr.Q.mul(clip);
            const p = vec4(p4.xyz.div(p4.w), 1).toVar();
            If(p.xyz.sub(tr.kugel.xyz).length().lessThan(tr.kugel.w), () => {
                Loop({ start: int(0), end: tr.zahl, type: "int", condition: "<" }, ({ i }) => {
                    const zeile = (k) => tr.zeilen.element(i.mul(8).add(k));
                    const q = vec3(dot(zeile(0), p), dot(zeile(1), p), dot(zeile(2), p));
                    If(abs(q).lessThanEqual(zeile(3).xyz).all(), () => {
                        vor.assign(
                            vec4(dot(zeile(4), clip), dot(zeile(5), clip), dot(zeile(6), clip), dot(zeile(7), clip))
                        );
                        getragen.assign(1);
                        Break();
                    });
                });
            });
            return { bew: ndc.sub(vor.xy.div(vor.w)), getragen };
        };
        // `load(texel, mitte)`: die Bewegung am Texel der Wahl (der Resolve reicht den nächsten im 3×3 — die Kante eines Bewegten
        // trägt seine Bewegung in den Grund) — gehört die MITTE selbst dem getragenen Leib, ihre: am Fuß liegt der Boden VOR dem
        // Schuh näher am Auge, der nächste Texel war Boden, und der Schuh folgte der Kamera (Radeon, Prüfplatz: die Sohlen hell
        // in der Karte der Durchsicht).
        return {
            load: (texel, mitte) => {
                const n = bewegung(texel);
                if (!mitte) return n.bew;
                const m = bewegung(mitte);
                return m.getragen.greaterThan(0.5).select(m.bew, n.bew);
            },
        };
    }

    // DER TAKT DES GETRAGENEN LEIBS (`_traaKameraBewegung`, aus `_traaReprojektion` je gerendertem Frame): die Teile dieses
    // Frames (`_traegerTeile`) in die Zeilen des Felds — je Teil die Box-Matrix (W · T(Mitte))⁻¹ · T(Auge), die Halbachsen und
    // die Reprojektion PV_vor · W_vor · W⁻¹ · PV_jetzt⁻¹ (W_vor die Welt-Matrix des Ankers im letzten Frame; nach einem Sprung
    // des Auges sein Jetzt), dazu die Kugel um alle Boxen. Mehr Teile als TRAEGER.teile fallen LAUT (`_bruchMelden`).
    _traegerTakt(z, cx, cy, cz) {
        const tr = z.traeger;
        const inv = tr.jetztInv.copy(z.jetzt).invert();
        tr.Q.value.makeTranslation(-cx, -cy, -cz).multiply(inv);
        const teile = this._traegerTeile(tr.liste);
        const A = tr.zeilen.array;
        const N = AnazhRealm.TRAEGER.teile;
        const zeilen = (m, k, n) => {
            const e = m.elements;
            for (let i = 0; i < n; i++) A[k + i].set(e[i], e[4 + i], e[8 + i], e[12 + i]);
        };
        tr.box.makeEmpty();
        if (teile.length > N && !tr.zuViel) {
            tr.zuViel = true;
            this._bruchMelden(`TRÄGER: ${teile.length} Teile des Leibs > ${N} — der Rest folgt der Kamera`);
        }
        const n = Math.min(N, teile.length);
        for (let k = 0; k < n; k++) {
            const t = teile[k];
            const W = t.anker.matrixWorld;
            zeilen(
                tr.m
                    .makeTranslation(t.c.x, t.c.y, t.c.z)
                    .premultiply(W)
                    .invert()
                    .multiply(tr.t.makeTranslation(cx, cy, cz)),
                8 * k,
                3
            );
            A[8 * k + 3].set(t.h.x, t.h.y, t.h.z, 0);
            let wv = tr.vorW.get(t.anker);
            if (!wv) tr.vorW.set(t.anker, (wv = W.clone()));
            else if (z.sprung) wv.copy(W);
            zeilen(tr.m.copy(W).invert().premultiply(wv).premultiply(z.vor).multiply(inv), 8 * k + 4, 4);
            wv.copy(W);
            const r = W.getMaxScaleOnAxis() * t.h.length();
            tr.v.copy(t.c).applyMatrix4(W);
            tr.v.x -= cx;
            tr.v.y -= cy;
            tr.v.z -= cz;
            tr.box.expandByPoint(tr.v.addScalar(r));
            tr.box.expandByPoint(tr.v.addScalar(-2 * r));
        }
        tr.zahl.value = n;
        if (!n) tr.kugel.value.w = -1;
        else {
            tr.box.getCenter(tr.v);
            tr.kugel.value.set(tr.v.x, tr.v.y, tr.v.z, 0.5 * tr.box.max.distanceTo(tr.box.min));
        }
    }

    // DIE TEILE DES GETRAGENEN LEIBS dieses Frames (`_traegerTakt`): der Leib des Spielers, wie ihn das Auge der Haupt-Kamera sieht —
    // je Knochen die Box aus Haut, Kleid und Haar beider Stufen (`_traegerPassung`; die Stufe schaltet nur ihre Gruppe, B5 und
    // `_gelenkStufe`), nur wenn eines ihrer Meshes sichtbar auf einer Ebene der Kamera liegt (Ego nimmt den Leib aus Ebene 0,
    // `_applyEgoSicht`), und das Gerät in der Hand (`heldMesh`) als Box seiner Gestalt (`_traegerStarr`). Ein Leib, der nicht in der
    // Szene hängt oder verborgen ist (der Ritt in der Kabine), trägt nichts. Die Welt-Matrizen dieses Frames stellt `_leibMatrix` (die
    // Kamera stand schon, der Leib ging in diesem Takt). Die Radeon am Prüfplatz zeigte beim Strafe ohne die Grobstufe den Leib in 5 von
    // 8 Bildern durchsichtig, solange die Ankunft die Stufe wählte (gate:kamera-leib:echt).
    _traegerTeile(out) {
        out.length = 0;
        const pm = this.state.playerMesh;
        const cam = this.state.camera;
        if (!pm || !cam || pm.visible === false) return out;
        let wurzel = pm;
        while (wurzel.parent) wurzel = wurzel.parent;
        if (wurzel !== this.state.scene) return out;
        // das Auge sieht ein Mesh, wenn es und jeder Ahn bis zum Leib sichtbar sind (die Stufe schaltet ihre Gruppe) und es auf
        // einer Ebene der Kamera liegt
        const sieht = (m) => {
            for (let o = m; o && o !== pm; o = o.parent) if (o.visible === false) return false;
            return m.layers.test(cam.layers);
        };
        const held = pm.userData.heldMesh;
        for (const t of [...this._traegerPassung(pm), ...(held ? [this._traegerStarr(held)] : [])])
            if (t && t.meshes.some(sieht)) out.push(t);
        if (out.length) this._leibMatrix(pm);
        return out;
    }

    // DIE PASSUNG DES LEIBS (EINMAL je Leib, `_traegerTeile`): jede Ecke von Haut, Kleid und Haar beider Stufen (die Vorlage des Tuchs,
    // seine Ruhe-Lage) im Raum ihres stärksten Knochens — boneInverse · bindMatrix · Ecke (r184 AttachedBindMode: die Welt ist
    // Knochen-Welt · dieser Punkt) —, je Knochen die Box darum, um TRAEGER.saumM (in Welt-Metern) geweitet: Gelenk-Mischung und
    // Tuch weichen um Zentimeter von der Starre ihres Knochens ab. Rückgabe [{ anker, c, h, meshes }].
    _traegerPassung(leib) {
        const memo = this._traegerMemo || (this._traegerMemo = new WeakMap());
        let P = memo.get(leib);
        if (P) return P;
        const v = new THREE.Vector3();
        const je = new Map();
        leib.updateMatrixWorld(true);
        leib.traverse((m) => {
            if (!m.isSkinnedMesh || !m.skeleton) return;
            const geo = (m.userData && m.userData.__tuchVorlage) || m.geometry;
            const pos = geo.attributes.position;
            const si = geo.attributes.skinIndex;
            const sw = geo.attributes.skinWeight;
            if (!pos || !si || !sw) return;
            const S = m.skeleton;
            for (let i = 0; i < pos.count; i++) {
                let b = 0;
                let w = -1;
                for (let c = 0; c < 4; c++) {
                    const x = sw.getComponent(i, c);
                    if (x > w) {
                        w = x;
                        b = si.getComponent(i, c);
                    }
                }
                const knochen = S.bones[b];
                if (!knochen) continue;
                v.fromBufferAttribute(pos, i).applyMatrix4(m.bindMatrix).applyMatrix4(S.boneInverses[b]);
                let e = je.get(knochen);
                if (!e) je.set(knochen, (e = { anker: knochen, box: new THREE.Box3(), meshes: new Set() }));
                e.box.expandByPoint(v);
                e.meshes.add(m);
            }
        });
        P = [];
        for (const e of je.values()) P.push(this._traegerBox(e.anker, e.box, [...e.meshes]));
        memo.set(leib, P);
        return P;
    }

    // EIN STARRES TEIL des getragenen Leibs (das Gerät in der Hand): die Box seiner Gestalt im eigenen Raum, EINMAL je Objekt
    _traegerStarr(held) {
        const memo = this._traegerMemo || (this._traegerMemo = new WeakMap());
        if (memo.has(held)) return memo.get(held);
        held.updateMatrixWorld(true);
        const inv = new THREE.Matrix4().copy(held.matrixWorld).invert();
        const box = new THREE.Box3();
        const b = new THREE.Box3();
        const meshes = [];
        held.traverse((m) => {
            if (!m.isMesh || !m.geometry || !m.geometry.attributes.position) return;
            if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
            box.union(
                b.copy(m.geometry.boundingBox).applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld))
            );
            meshes.push(m);
        });
        const t = meshes.length ? this._traegerBox(held, box, meshes) : null;
        memo.set(held, t);
        return t;
    }

    // Ein Teil: Mitte und Halbachsen der Box im Raum des Ankers, der Saum in Welt-Metern über die Skala des Ankers
    _traegerBox(anker, box, meshes) {
        const s = Math.max(1e-3, anker.matrixWorld.getMaxScaleOnAxis());
        const h = box
            .getSize(new THREE.Vector3())
            .multiplyScalar(0.5)
            .addScalar(AnazhRealm.TRAEGER.saumM / s);
        return { anker, c: box.getCenter(new THREE.Vector3()), h, meshes };
    }

    // Die Reprojektion des Frames: vor dem Post-Render (die Kamera trägt noch keinen TRAA-Versatz, der lebt nur
    // zwischen onBefore-/onAfterRenderPipeline), einmal je gerendertem Frame.
    _traaReprojektion() {
        const z = this.state._traaR;
        const cam = this.state.camera;
        if (!z || !cam) return;
        cam.updateMatrixWorld();
        z.vor.copy(z.jetzt);
        z.jetzt.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
        // DER KAMERA-SPRUNG (K68): springt das Auge in EINEM Frame weiter als ZEIT_SPRUNG_M (Tor, Umsetzen, Aufnahme), beginnt
        // die Geschichte neu und läuft als Mittel an (`_zeitAufloesung` `_anlauf`) — sonst trug der erste Frame nach dem Sprung
        // das Bild noch eine halbe Sekunde lang.
        const e = cam.matrixWorld.elements;
        z.sprung = this._augeSprung(z, e[12], e[13], e[14]) || z.neu;
        if (z.neu) {
            z.vor.copy(z.jetzt);
            z.neu = false;
        }
        z.R.value.copy(z.jetzt).invert().premultiply(z.vor);
        this._traegerTakt(z, e[12], e[13], e[14]);
    }

    // DER SPRUNG DES AUGES (K68, A9-n2) — EIN Maß für jedes Gedächtnis des Blicks: springt das Auge seit dem letzten Blick des
    // Halters `h` weiter als ZEIT_SPRUNG_M (Tor, Umsetzen, Aufnahme), gilt sein Gedächtnis nicht mehr — die Geschichte der
    // zeitlichen Auflösung beginnt neu, jede Stufen-Hysterese der Nah-Sätze wählt frisch aus dem Jetzt. Der erste Blick springt.
    _augeSprung(h, x, y, z) {
        const sprung = h.augeX == null || Math.hypot(x - h.augeX, y - h.augeY, z - h.augeZ) > AnazhRealm.ZEIT_SPRUNG_M;
        h.augeX = x;
        h.augeY = y;
        h.augeZ = z;
        return sprung;
    }

    // DIE SICHT JE PASS (scene.onBeforeRender / onAfterRender): die Region-Bundles tragen ihren Cull auf `visible`
    // (three-Culling friert im Replay ein). Bis V18.528 galt das Urteil der Haupt-Kamera für JEDEN Pass: ein Bundle im
    // Blick warf in beide Kaskaden (auch 2 km weit), eines hinter dem Blick oder hinter dem Berg warf nie — auch wenn
    // sein Schatten ins Bild fiel. Jetzt liest der Hauptpass das Haupt-Urteil (_archRegionBundleCull: Frustum · Berg ·
    // Query), jeder Schatten-Pass das EIGENE: je Region die Werfer-Hülle, darin je WERFER (jedes werfende Blatt-Mesh)
    // sein Urteil nach dem EINEN Gesetz der Pass-Wahl (`_passTrifft`). Was in keiner Kaskade wirft, wirft nicht; was nur
    // im Schatten liegt, wirft. Im Schatten-Pass ist ein Region-Bundle eine Gruppe: ein Render unter dem Override-Stoff
    // sammelt keine Bundles (die Bundle-Wahrheit am Chokepoint `_renderScene`), three projiziert seine Kinder frisch — die
    // Wahl hier wirkt je Pass. Jeder Haken beginnt mit der Rückkehr (abgewählte Werfer sichtbar, Haupt-Urteil) — auch nach
    // einem Abbruch, und VOR der Kaskaden-Box (sie misst den ganzen Bestand). Der Stamm kompiliert nie neben dem Render (kein
    // r184-compileAsync, das den Vorher-Haken ohne den Nachher-Haken riefe — die Erst-Zeichnung, `_configureRenderer`).
    _passSicht(kamera, nach) {
        const S = this._kaskadenSchmier();
        this._passSichtZurueck(S);
        // Der Haupt-Pass stellt die Kaskaden: sein Haken läuft nach der Kamera-Matrix und VOR jedem Schatten-Pass
        // dieses Frames (die Karten rendern im Knoten-updateBefore seiner Objekte) — Loop, Sonde und Zähler gleich.
        const csm = this.state.csmNode;
        if (!nach && csm && csm.camera && kamera === csm.camera) this._kaskadenPassen(csm);
        const k = nach ? -1 : this._schattenKameraIndex(kamera);
        // Die Lage des Passes: EINE Rechnung je Pass (Frustum der Pass-Kamera, Auge, Kaskaden-Scheibe, Blende), jeder Leser
        // urteilt mit ihr nach dem EINEN Gesetz. Die Matrix der Wahl trägt den Versatz der zeitlichen Auflösung NICHT (TRAA
        // verschiebt die Projektion je Frame um einen halben Pixel, die Elemente 8 und 9 einer Perspektive — den Rand dafür
        // trägt `sichtRand`): dieselbe Lage wählt in jedem Frame dasselbe, die gehaltene Wahl ist die frische (Welle C).
        // Die Höhlen-Sicht liest ihre Schirm-Rechtecke aus S.m: perspektivisch um den Dreh-Rand geweitet (`_passMatrixWeit`),
        // damit ihre Wahl über eine kleine Drehung hält wie das Gesetz (`drehRand`).
        if (!nach) {
            S.m.copy(this._wahlMatrix(kamera));
            if (kamera.isPerspectiveCamera === true) S.m.elements[8] = S.m.elements[9] = 0;
            S.m.multiply(kamera.matrixWorldInverse);
            S.frustum.setFromProjectionMatrix(S.m, kamera.coordinateSystem);
            if (kamera.isPerspectiveCamera === true) this._passMatrixWeit(S.m, kamera, AnazhRealm.PASS_WAHL.drehRand);
            this._passWahlLage(S, kamera, k);
        }
        // DER TAKT DER ARENEN im Hauptbild, vor jedem Pass dieses Frames (die Kaskaden rendern verschachtelt in ihm), dann
        // die Wahl der GPU: die Arenen legen die Aufträge dieses Passes, EIN Compute wählt jede Instanz jeder globalen Gruppe
        if (!nach && k < 0 && kamera === this.state.camera) {
            this._arenaTakt();
            this._wieseAugeTakt(kamera); // das Auge der Wiese für Stoff und Wahl dieses Bilds (die Nah-Wiese wirft nie)
        }
        if (!nach) this._instanzWahlGpu(kamera, S);
        // Die Sätze (Boden · Wasser · Bau · Streu) wählen ihren Abschnitt nach demselben Gesetz.
        this._chunkSatzPass(kamera, nach, k, S);

        const map = this.state._regionBundles;
        if (!map || map.size === 0) return;
        if (k < 0) {
            for (const bg of map.values()) {
                const s = bg.userData._sichtHaupt;
                if (s !== undefined) bg.visible = s;
            }
            return;
        }
        const n = this._werferWahlPass(map, S);
        const z = this._werferZensus || (this._werferZensus = []);
        z[k] = { werfer: n, bundles: map.size, abgewaehlt: S.ab.length };
    }

    // Die Werfer-Wahl eines Schatten-Passes: je Region-Bundle die Werfer-Hülle, darin je werfendes Blatt-Mesh (`_werferKind`,
    // frisch aus der Hülle dieses Takts) — beide nach dem EINEN Gesetz (`_passTrifftBox`); was nicht trifft, ruht für diesen
    // Pass (`ab` merkt es für die Rückkehr). Rückgabe: die Zahl der werfenden Bundles.
    // DIE WAHL STEHT (K72 — Welle C für den letzten Leser der Pass-Wahl): ein Bundle behält die Wahl dieses Passes (`L.key`),
    // solange seine Lage (`L.gen`) und sein Werfer-Stand (`_bundleWerferHuelle`) stehen (die Gruppen der Wahl hängen nicht
    // in Bündeln, ihre Wahl trifft die GPU, `_instanzWahlArt`): kein Gang über die Kinder, keine Prüfung, nur die gemerkte Wahl. Gemessen 15.10. (Radeon, Genesis/Wiese Third, Ruhe): je Kaskaden-Render 18–37
    // Prüfungen in 22 Gängen, in jedem Render dieselbe Wahl.
    _werferWahlPass(map, S) {
        const L = S.lage,
            ab = S.ab;
        let n = 0;
        for (const bg of map.values()) {
            const h = this._bundleWerferHuelle(bg);
            const u = bg.userData;
            const je = u._werferJe || (u._werferJe = new Map());
            let w = je.get(L.key);
            if (w && w.gen === L.gen && w.stand === u._werferStand) {
                bg.visible = w.vis;
                if (!w.vis) continue;
                n++;
                for (let i = 0; i < w.ab.length; i++) {
                    const c = w.ab[i];
                    c.visible = false;
                    ab.push(c);
                }
                continue;
            }
            const vis = h !== null && this._passTrifftBox(L, h, 0);
            bg.visible = vis;
            const a0 = ab.length;
            if (vis) {
                n++;
                this._werferWahl(bg, L, ab);
            }
            if (!w) je.set(L.key, (w = { gen: 0, stand: 0, vis: false, ab: [] }));
            this._werferWahlMerke(bg, w, L, vis, ab, a0);
        }
        return n;
    }

    // Merkt die Wahl eines Bundles für diesen Pass: Lage, Werfer-Stand, ob es wirft und welche Werfer darin ruhen.
    _werferWahlMerke(bg, w, L, vis, ab, a0) {
        w.gen = L.gen;
        w.stand = bg.userData._werferStand;
        w.vis = vis;
        w.ab.length = 0;
        for (let i = a0; i < ab.length; i++) w.ab.push(ab[i]);
    }

    _werferWahl(o, L, ab) {
        const kinder = o.children;
        for (let i = 0; i < kinder.length; i++) {
            const c = kinder[i];
            if (c.visible === false) continue;
            // eine Senke ist ein Blatt: ihr einziges Kind ist ihr Zeichner (1410-1), er fällt mit ihr
            const blatt = c.children.length === 0 || (c.__zeichner !== undefined && c.children.length === 1);
            if (c.isMesh === true && c.castShadow === true && blatt) {
                const b = c.userData._werferKind;
                if (!b || b.isEmpty() || !this._passTrifftBox(L, b, 0)) {
                    c.visible = false;
                    ab.push(c);
                }
                continue;
            }
            if (c.children.length > 0) this._werferWahl(c, L, ab);
        }
    }

    _passSichtZurueck(S) {
        for (let i = 0; i < S.ab.length; i++) S.ab[i].visible = true;
        S.ab.length = 0;
    }

    // DAS GESETZ DER PASS-WAHL (W7-Vereinigung). Bis hier wählten im selben Haken drei Wege: die Sätze und die Werfer der
    // Region-Bündel nach ihrer Box gegen das Frustum der Pass-Kamera, die Pflanzen-Stufen nach Kugel, Licht-Kapsel und
    // Fenster (`_instanzWahlPass`), die Karten als Senken-Kopie ihrer Sicht. Befund (echte GPU, Mess-Wiese, Band in Ruhe,
    // Blick yaw −0,88): die Box der fernen Kaskade — ein Licht-Raum-Quader — umschließt bei schrägem Blick den nahen Boden,
    // boden k1 173 784 Dreiecke über der Ratsche 90 845: dieselbe Klasse, die die Kapsel für die Bäume schon schnitt, im
    // Nachbar-Leser offen. Jetzt urteilt EIN Gesetz über jeden Körper jedes Passes — die Zelle eines Satzes, den Werfer eines
    // Bündels, die Instanz einer Gruppe der Wahl (Baum, Strauch, Karte), das Büschel der Nah-Wiese. Der Körper ist eine
    // BOX MIT SAUM (Mitte c, Halb-Ausdehnung h je Achse, Saum-Radius r: h = 0 ist die Kugel, r = 0 die Box). Er zeichnet, wenn
    // (1) er das Frustum der Pass-Kamera schneidet — je Ebene der Stütz-Abstand n·c + d + |n|·h + r, dazu der Rand
    // `sichtRand` je Meter Abstand zum Auge (ein Satz, der seine Wahl über Frames hält, sieht den Versatz der zeitlichen
    // Auflösung nicht) — und (2) im Kaskaden-Pass seine LICHT-KAPSEL, der Körper entlang des Lichts bis ganz unter die Box
    // der Kaskade, die Scheibe dieser Kaskade trifft (`fit.ebenen`, um `saum` geweitet): ein Werfer, dessen Schatten auf
    // keinen Empfänger der Scheibe fällt, wirft dort nicht. Für eine Ebene ist der gefegte Körper die Hülle seiner beiden
    // Enden — liegen beide jenseits, liegt der ganze Weg jenseits.
    _passWahlLage(S, kamera, k) {
        const L =
            S.lage ||
            (S.lage = {
                fr: null,
                ax: 0,
                ay: 0,
                az: 0,
                rand: 0,
                fit: null,
                dir: null,
                v: new THREE.Vector3(),
                an: false,
                ex: 0,
                ez: 0,
                perf: 1,
                ref: 1,
                kanten: null,
                halt: 0,
                haltBlende: 0,
                dreh: 0,
                licht: 0,
                gen: 0,
                key: "",
                neu: false,
            });
        const we = kamera.matrixWorld.elements;
        const PW = AnazhRealm.PASS_WAHL;
        L.fr = S.frustum;
        L.ax = we[12];
        L.ay = we[13];
        L.az = we[14];
        L.rand = PW.sichtRand;
        // der Halt (`_passLageGen`): die Ebenen und das Auge wandern um höchstens haltM, der Rand je Meter mit dem Auge
        L.halt = L.haltBlende = PW.haltM * (1 + PW.sichtRand);
        // der Dreh-Rand: eine Perspektive wählt mit `drehRand` (je Meter Abstand der Sinus) und hält bis zur Hälfte (`_wahlHaelt`)
        L.dreh = kamera.isPerspectiveCamera === true ? Math.sin(PW.drehRand) : 0;
        // Die Scheibe gilt nur dem Pass ihrer Kaskaden-Kamera (die Box beim letzten Rendern dieser Kaskade, `_kaskadeFit`).
        const csm = this.state.csmNode;
        const lw = k >= 0 && csm && csm.lights ? csm.lights[k] : null;
        const fit = lw && lw.shadow && lw.shadow.camera === kamera && csm._anazhFit ? csm._anazhFit[k] : null;
        L.fit = fit && fit.ebenen ? fit : null;
        L.dir = S.dir;
        // DER LICHT-RAND (`lichtRandTexel`): eine Kaskade wählt mit einem Saum von so vielen Texeln ihrer Karte — ihre Wahl
        // hält über die Stufen der Sonne, solange die Drehung des Lichts seit der Wahl jeden Schatten um weniger als die
        // Hälfte davon verschiebt (`_passLageHaelt`); die gehaltene Lage wählt mit dem Rand ihres Ankers weiter
        L.licht = L.fit ? PW.lichtRandTexel * L.fit.texelMin : 0;
        // DIE BLENDE: die LIVE-Uniforms, die jede Maske liest (dasselbe Auge, derselbe Perf-Streck), und die Kanten des
        // Fensters aus dem EINEN Blend-Gesetz (`_blendeKanten`, je Band-Satz einmal).
        const lu = this.state.lodUniforms;
        L.an = !!(lu && lu.uLodMaskOn && lu.uLodMaskOn.value > 0.5 && lu.uLodAuge && lu.uLodPerf);
        if (L.an) {
            L.ex = lu.uLodAuge.value.x;
            L.ez = lu.uLodAuge.value.z;
            L.perf = lu.uLodPerf.value;
            L.ref = lu.uLodRef.value;
            const d0 = lu.uLodD0.value,
                d1 = lu.uLodD1.value,
                fade = lu.uLodFade.value,
                fade0 = lu.uLodFade0.value;
            let K = this._blendeK;
            if (!K || K.d0 !== d0 || K.d1 !== d1 || K.fade !== fade || K.fade0 !== fade0) {
                const pc = globalThis.__phytoCore;
                if (!pc || typeof pc.lodCrossfadeMask !== "function")
                    throw new Error(
                        "_passWahlLage: __phytoCore.lodCrossfadeMask fehlt — ohne das Blend-Gesetz kein Fenster"
                    );
                K = this._blendeK = AnazhRealm._blendeKanten(pc.lodCrossfadeMask, d0, d1, fade, fade0);
            }
            L.kanten = K;
        }
        // DIE LAGE DES AUGES (`L.auge`, w24-fahrt-takt): dieselbe Lage mit dem Halt am Punkt (haltM) — sie lesen, wer vom Auge
        // DIESES Bilds abhängt (die Stufen und die Übergabe der Nah-Wiese, die Höhlen-Sicht und der Höhlen-Satz des Hauptbilds, die
        // Wahl der GPU je Bild); jeder Cull liest die Lage des WEGS (`L`, `_passLageGen`)
        const A = L.auge || (L.auge = { v: new THREE.Vector3() });
        for (const f of AnazhRealm.LAGE_GETEILT) A[f] = L[f];
        // `neu`: dieser Pass legte einen neuen Anker (die Lage hielt nicht) — wer jetzt wählt, wählt am Anker (die Höhlen-Sicht der
        // Kaskade hält darum nur dann ihre Licht-Rechtecke über die Stufen der Sonne, `_hoehlenSichtLicht`)
        L.neu = this._passLageGen(L, kamera, k);
        return L;
    }

    // DER WEG DES AUGES (w24-fahrt-takt, Gebot 7: der Takt kostet, was sich ändert — nie das Tempo): EIN Weg je Bild, die Richtung
    // und das Tempo des letzten Schritts der Kamera (unter ZEIT_SPRUNG_M, binnen 250 ms; im Stand und nach einem Sprung Tempo 0).
    // Leser: die Lage des Wegs (`_lageAnker`) und der Anker der Ferne der Wiese (`_wieseFernAnker`). Mehrere Pässe eines Bilds
    // lesen denselben Schritt (das Auge steht zwischen ihnen).
    _augeWegJetzt() {
        const W = this._augeWeg || (this._augeWeg = { x: NaN, y: 0, z: 0, t: -Infinity, u: [0, 0, 0], v: 0, n: 0 });
        const cam = this.state.camera;
        if (!cam) return W;
        const e = cam.matrixWorld.elements;
        const t = performance.now();
        const [dx, dy, dz] = [e[12] - W.x, e[13] - W.y, e[14] - W.z];
        if (dx === 0 && dy === 0 && dz === 0) {
            if (t - W.t > 250) W.v = 0;
            return W;
        }
        const s = Math.hypot(dx, dy, dz);
        const dt = t - W.t;
        W.v = s > 1e-4 && s < AnazhRealm.ZEIT_SPRUNG_M && dt < 250 ? (s / Math.max(dt, 1)) * 1000 : 0;
        // `n`: so viele Schritte in Folge in derselben Richtung (auf 25°) — ein einzelner Versatz ist noch kein Weg
        const gleich = W.v > 0 && W.n > 0 && (dx * W.u[0] + dy * W.u[1] + dz * W.u[2]) / s > 0.9;
        W.n = W.v > 0 ? (gleich ? W.n + 1 : 1) : 0;
        if (W.v > 0) W.u = [dx / s, dy / s, dz / s];
        [W.x, W.y, W.z, W.t] = [e[12], e[13], e[14], t];
        return W;
    }

    // DIE PROJEKTION DER WAHL (w27-traa-fenster): Sicht, Stufen, Abschnitte, Instanzen, Streu und Werfer wählen aus der Kamera
    // des SPIELS. Trägt ihr Durchlauf das Mess-Fenster (`state.messFenster`; die zeitliche Auflösung legt `wahl` ab, die
    // ungefensterte, unverzitterte Projektion), wählt jeder Pass aus ihr: die Lage steht wie im Bild davor (`_passLageGen`),
    // jeder Leser behält seine Wahl — das Fenster misst nur feiner, was der Spieler sieht. Ohne Fenster die der Kamera selbst.
    _wahlMatrix(kamera) {
        const F = this.state.messFenster;
        return F && F.wahl && kamera === this.state.camera ? F.wahl : kamera.projectionMatrix;
    }

    // Die Matrix einer Perspektive ohne den Versatz der zeitlichen Auflösung, ihr Sichtfeld je Halbwinkel um 1,5 × `dreh`
    // geweitet: jeder Strahl, den eine um höchstens `dreh` gedrehte Kamera sieht, liegt darin (der Abstand eines Strahls zur
    // Seiten-Ebene wächst um höchstens `dreh`, sein Winkel in der Bild-Achse um höchstens dreh / cos(Höhe) — an den Ecken
    // eines 75°-Bilds 16:9 das 1,1-Fache).
    _passMatrixWeit(aus, kamera, dreh) {
        aus.copy(this._wahlMatrix(kamera));
        const e = aus.elements;
        e[8] = e[9] = 0;
        const zu = 1.5 * dreh;
        e[0] = 1 / Math.tan(Math.atan(1 / e[0]) + zu);
        e[5] = 1 / Math.tan(Math.atan(1 / e[5]) + zu);
        return aus.multiply(kamera.matrixWorldInverse);
    }

    // DIE LAGE STEHT (Welle C, Lehre 25 — der Takt kostet, was ihn betrifft). Befund 06.10. (OMEN, GTX 1060 + i7-8750H, CPU-
    // Profil, Regler voll, Blick gepinnt, Mess-Wiese): die Sicht je Pass kostete ~6 ms CPU je Frame — jeder Pass rechnete
    // jeden Frame jede Wahl neu (Abschnitte, Höhlen-Sicht, Instanzen), auch wenn nichts sich bewegte; an der echten GPU
    // (Mess-Wiese, Ruhe) 11 231 Körper-Prüfungen, 22 174 Ecken und 70 kB Index je Frame. Jeder Pass trägt darum die
    // GENERATION seiner Lage (`L.gen`): sie bleibt, solange die Lage steht — und jeder Leser (die Sätze `_satzAbschnittSteht`,
    // die Instanz-Wahl `_instanzWahlSteht`, die Nah-Wiese) behält seine Wahl, solange ihre Generation und sein eigener Stand
    // gleich sind. Die Lage ist, was jedes Urteil liest: die sechs Ebenen des Frustums OHNE den Versatz der zeitlichen
    // Auflösung (TRAA verschiebt die Projektion je Frame um einen halben Pixel, die Elemente 8 und 9 einer Perspektive — den
    // Rand dafür trägt `sichtRand`), das Auge, die Drehung der Kamera (die Licht-Kacheln der Höhlen-Sicht lesen sie), im
    // Kaskaden-Pass die Wahl-Scheibe (`fit.ebenen`, `zb`, `saum`, die Licht-Basis) und das Licht, dazu die Blende (Auge der
    // Maske, Perf-Streck, Bezug, die Kanten des Blend-Gesetzes). Sie STEHT gegen den Anker der letzten Wahl dieses Passes
    // (haupt · k<i> · anders), solange jede Richtung gleich ist (bis auf die Rundung, 1e-9) und jeder Ort — das Auge, jede
    // Ebene, der Boden der Kaskaden-Box — um höchstens `haltM` gewandert ist: das Auge der Spiel-Kamera atmet im Stand um
    // Millimeter, die Kaskaden-Box steigt mit ihm. Den Halt trägt das Gesetz als Rand (`L.halt` in `_passTrifft`). Eine
    // ORTHOGONALE Kamera (die Kaskade) wandert dazu frei entlang ihrer Achse: ihre nahe Ebene steht über dem höchsten Werfer
    // der Box (`_kaskadenWerferOben` — ein laufendes Tier hebt und senkt sie je Render um Meter, gemessen 06.10., k1 bis 30 m),
    // und kein Körper, den ein Leser wählt, liegt darüber; Auge und nahe Ebene zählen darum nur quer zur Achse. Solange die Lage
    // steht, urteilt jeder Leser vom Auge des Ankers (`L.ax`…) — der Rand je Meter ist der, mit dem die gehaltene Wahl fiel.
    _passLageGen(L, kamera, k) {
        const N = 89;
        const key = k >= 0 ? "k" + k : kamera === this.state.camera ? "haupt" : "anders";
        const M = this._passLagen || (this._passLagen = new Map());
        let a = M.get(key);
        if (!a) M.set(key, (a = { sig: new Float64Array(N), gen: 0, kamera: -1, ax: 0, ay: 0, az: 0, wegMax: 0 }));
        const s = this._passLageSig || (this._passLageSig = new Float64Array(N));
        const we = kamera.matrixWorld.elements;
        // die Achse einer orthogonalen Kamera (sie blickt entlang −z ihrer Welt-Matrix)
        const ortho = kamera.isOrthographicCamera === true;
        let fx = 0,
            fy = 0,
            fz = 0;
        if (ortho) {
            const l = Math.hypot(we[8], we[9], we[10]) || 1;
            fx = -we[8] / l;
            fy = -we[9] / l;
            fz = -we[10] / l;
        }
        const t = we[12] * fx + we[13] * fy + we[14] * fz;
        s[0] = we[12] - t * fx;
        s[1] = we[13] - t * fy;
        s[2] = we[14] - t * fz;
        // das Frustum des Passes (`_passSicht` legt es ohne den Versatz der zeitlichen Auflösung)
        const F = L.fr;
        const ebene = (P, o) => {
            s[o] = P.normal.x;
            s[o + 1] = P.normal.y;
            s[o + 2] = P.normal.z;
            s[o + 3] = P.constant;
        };
        // perspektivisch: die Projektion ohne Versatz (ihre Ebenen drehen mit der Kamera — die Drehung zählt als Winkel,
        // s[84] = 1); orthogonal: die Ebenen, ohne die nahe
        s[84] = ortho ? 0 : 1;
        if (!ortho) {
            const pe = this._wahlMatrix(kamera).elements;
            for (let i = 0; i < 24; i++) s[3 + i] = i < 16 && i !== 8 && i !== 9 ? pe[i] : 0;
        } else
            for (let p = 0; p < 6; p++) {
                const P = F.planes[p];
                ebene(P, 3 + 4 * p);
                // die nahe Ebene der orthogonalen Kamera (ihre Normale zeigt entlang der Achse) zählt nicht
                if (P.normal.x * fx + P.normal.y * fy + P.normal.z * fz > 0.99) s[6 + 4 * p] = 0;
            }
        const f = L.fit;
        s[27] = f ? 1 : 0;
        for (let p = 0; p < 6; p++)
            if (f) ebene(f.ebenen[p], 28 + 4 * p);
            else s[28 + 4 * p] = s[29 + 4 * p] = s[30 + 4 * p] = s[31 + 4 * p] = 0;
        const R = [0, 1, 2, 4, 5, 6, 8, 9, 10];
        const bi = f ? f.basisInv.elements : null;
        s[52] = f ? f.zb : 0;
        s[53] = f ? f.saum : 0;
        for (let i = 0; i < 9; i++) {
            s[54 + i] = bi ? bi[R[i]] : 0;
            s[75 + i] = we[R[i]];
        }
        // das Licht liest nur die Licht-Kapsel des Kaskaden-Passes (das Hauptbild wählt ohne Scheibe)
        const d = f ? L.dir : null;
        s[63] = d ? d.x : 0;
        s[64] = d ? d.y : 0;
        s[65] = d ? d.z : 0;
        const K = L.an ? L.kanten : null;
        s[66] = L.an ? 1 : 0;
        s[67] = L.an ? L.ex : 0;
        s[68] = L.an ? L.ez : 0;
        s[69] = L.an ? L.perf : 0;
        s[70] = L.an ? L.ref : 0;
        s[71] = K ? K.d0 : 0;
        s[72] = K ? K.d1 : 0;
        s[73] = K ? K.fade : 0;
        s[74] = K ? K.fade0 : 0;
        // die Kaskade unter der laufenden Sonne: ihr Licht-Rand, der längste Licht-Weg ihrer Box, das Höhenband ihrer Empfänger
        s[85] = L.licht;
        s[86] = f ? f.weg : 0;
        s[87] = f ? f.band0 : 0;
        s[88] = f ? f.band1 : 0;
        // DAS AUGE (`L.auge`): sein Anker hält am Punkt. DER WEG (`L`): nur das Auge der Spiel-Kamera wandert auf ihm — das
        // Hauptbild und die Kaskaden (ihr Fenster misst vom selben Auge); jede andere Kamera hält am Punkt
        if (!a.auge) a.auge = { sig: new Float64Array(N), gen: 0, kamera: -1, ax: 0, ay: 0, az: 0, wegMax: 0 };
        L.auge.neu = this._lageAnker(a.auge, s, kamera, L.auge, key, null);
        return this._lageAnker(a, s, kamera, L, key, key === "anders" ? null : this._augeWegJetzt());
    }

    // EIN ANKER DER LAGE (`_passLageGen`): hält die Lage `s` gegen den Anker `a`, urteilt jeder Leser vom Auge des Ankers mit dessen
    // Halt; sonst legt sie hier einen neuen Anker (true). DER HALT IST DER WEG (w24-fahrt-takt): `weg` (`_augeWegJetzt`) gibt dem
    // Anker die Strecke, die das Auge in `zeitS` fährt (höchstens `wegMax`), quer bis `querM` — er hält, solange das Auge auf ihr
    // bleibt (`_aufStrecke`), und sein Halt ist der Rand, der jede Wahl auf ihr trägt: zwei Augen der Strecke liegen höchstens
    // lw + 2q auseinander, der Rand je Meter misst vom Auge des Ankers (bis lw + q daneben). Die Ebenen einer Perspektive wandern
    // mit dem Auge (`halt`), die einer Kaskade stehen zwischen zwei Fits — sie trägt den Weg nur im Fenster der Blende
    // (`haltBlende`, das Auge der Maske ist die Spiel-Kamera). Ohne Weg der Punkt: lw 0, q haltM/2, der Halt wie bis w24. Befund
    // (gpu-probe 13cac9d9, Radeon, GT 20 m/s am Genesis-Ring): je Bild legte jeder Pass einen neuen Anker (das Auge fährt 0,7 m,
    // der Halt war 1 cm), jeder Leser wählte voll — `_passSicht` 21,6–30,9 ms je Bild in der Mitte.
    _lageAnker(a, s, kamera, L, key, weg) {
        if (a.gen > 0 && a.kamera === kamera.id && this._passLageHaelt(a.sig, s, a)) {
            [L.gen, L.key, L.ax, L.ay, L.az, L.halt, L.haltBlende, L.dreh] = [a.gen, key, a.ax, a.ay, a.az, a.halt, a.haltBlende, a.dreh]; // prettier-ignore
            // das Auge der Blende hält wie das Auge der Kamera: jeder Leser urteilt vom Auge des Ankers
            [L.ex, L.ez, L.licht] = [a.sig[67], a.sig[68], a.sig[85]];
            if (s[86] > a.wegMax) a.wegMax = s[86];
            return false;
        }
        const PW = AnazhRealm.PASS_WAHL;
        const lw = weg && weg.v > 0 ? Math.min(PW.weg.wegMax, weg.v * PW.weg.zeitS) : 0;
        // quer und lotrecht (der Wagen wiegt auf dem Gelände), die Drehung der folgenden Kamera um `drehRad` mehr — eine
        // Perspektive wählt mit dem weiteren Dreh-Rand (`L.dreh`), der Anker hält bis zu seiner Hälfte (`_passLageHaelt`)
        const [q, qv] = lw > 0 ? [PW.weg.querM, PW.weg.lotM] : [PW.haltM / 2, PW.haltM / 2];
        const u = lw > 0 ? weg.u.slice() : [0, 0, 0];
        const h = Math.hypot(u[0], u[2]);
        a.drehRand = PW.drehRand + (lw > 0 ? PW.weg.drehRad : 0);
        a.dreh = L.dreh = kamera.isPerspectiveCamera === true ? Math.sin(a.drehRand) : 0;
        const punkt = PW.haltM * (1 + PW.sichtRand);
        const strecke = punkt + (lw + 2 * (q === qv ? q : Math.hypot(q, qv)) - PW.haltM) * (1 + PW.sichtRand + L.dreh);
        a.sig.set(s);
        Object.assign(a, { kamera: kamera.id, ax: L.ax, ay: L.ay, az: L.az, wegMax: s[86], u, lw, q, qv });
        a.blende = { u: h > 1e-6 ? [u[0] / h, 0, u[2] / h] : [0, 0, 0], lw: lw * h, q, qv };
        [a.halt, a.haltBlende] = [s[84] === 1 ? strecke : punkt, strecke];
        a.gen = this._passLageZahl = (this._passLageZahl || 0) + 1;
        [L.gen, L.key, L.halt, L.haltBlende] = [a.gen, key, a.halt, a.haltBlende];
        return true;
    }

    // Liegt der Schritt (dx, dy, dz) vom Auge des Ankers `w` auf seinem Weg (`_lageAnker`: die Strecke lw entlang u, quer höchstens
    // q, lotrecht höchstens qv, vor ihrem Anfang und hinter ihrem Ende ebenso)? Ohne Weg (lw 0, q = qv = haltM/2) das Gesetz des
    // Halts am Punkt (`_wahlHaelt`).
    _aufStrecke(dx, dy, dz, w) {
        const u = w.u;
        const voran = w.lw > 0 ? dx * u[0] + dy * u[1] + dz * u[2] : 0;
        const t = voran < 0 ? 0 : voran > w.lw ? w.lw : voran;
        const [rx, ry, rz] = [dx - t * u[0], dy - t * u[1], dz - t * u[2]];
        return w.q === w.qv ? Math.hypot(rx, ry, rz) <= w.q : Math.hypot(rx, rz) <= w.q && Math.abs(ry) <= w.qv;
    }

    // DAS GESETZ DES HALTS (Welle C): eine Wahl, die mit einem Rand fiel, hält, solange ihre Drehung seit dem Anker — mal dem
    // Hebel, mit dem sie am Rand wirkt — die HÄLFTE dieses Rands nicht überschreitet. Jede Wahl unter der gehaltenen Lage (der
    // Anker und jeder Leser, der mitten in ihr neu wählt: ein Satz mit neuem Stand, eine Gruppe mit neuen Slots) urteilt vom
    // Blick ihres Frames und liegt höchstens den halben Rand vom Anker, gegen die jetzige Lage also höchstens den ganzen —
    // den ihr Rand trägt. Die Kamera dreht mit dem Hebel 1 gegen ihren Dreh-Rand (`drehRand`, Bogenmaß), das Licht mit dem
    // längsten Licht-Weg gegen seinen Licht-Rand (Meter), jeder Ort der Lage (Auge, Ebenen, Band) gegen den Halt `haltM`. Gemessen 07.10. (gate:sicht-arbeit (D), Mess-Wiese): hielt die
    // Kamera bis zum ganzen Rand, fielen nach einer Neu-Wahl mitten in der Drehung 12 Zellen und Instanzen am Bildrand weg.
    _wahlHaelt(dreh, hebel, rand) {
        return dreh * hebel <= rand / 2;
    }

    // Hält die Lage `s` gegen ihren Anker `a` (Aufbau `_passLageGen`)? Orte (das Auge, die Konstanten der Ebenen, der Boden
    // der Kaskaden-Box, das Auge der Blende — `_blendeHaelt`) um höchstens den halben Halt (`_wahlHaelt` gegen haltM), Richtungen bis auf die Rundung — eine Perspektive: ihre Projektion gleich, ihre
    // Drehung (der Winkel zwischen Anker und Kamera, cos = (Spur(R0ᵀ·R) − 1) / 2) nach dem Gesetz des Halts gegen den
    // Dreh-Rand (`_wahlHaelt`) —, alles andere gleich; eine Kaskade mit Box über die Stufen der Sonne nach ihrem Licht-Rand
    // (unten), nach demselben Gesetz.
    _passLageHaelt(a, s, anker) {
        const PW = AnazhRealm.PASS_WAHL;
        const H = PW.haltM;
        // jeder Ort hält nach dem Gesetz des Halts: höchstens den halben Halt vom Anker (`_wahlHaelt`)
        const steht = (d) => this._wahlHaelt(d, 1, H);
        if (s[84] !== a[84] || s[27] !== a[27]) return false;
        // DIE KASKADE UNTER DER LAUFENDEN SONNE (orthogonal, mit Box): ihre echten Werfer bestimmen die Empfänger (die
        // Wahl-Scheibe und ihr Höhenband) und das Licht — Box, Auge und Licht-Basis legt der Fit aus ihnen. Die Lage hält,
        // solange die Empfänger stehen (die Scheibe um haltM, das Band um haltM, Saum und Blende gleich) und die Drehung des
        // Lichts seit dem Anker, mal dem längsten Licht-Weg seit dem Anker (`wegMax`), unter dem halben Licht-Rand bleibt:
        // ein echter Werfer liegt quer zum Licht so nah an seinem Empfänger in der Box wie Drehung × Weg, und jede Wahl unter
        // dieser Lage (der Anker, ein Satz mit neuem Stand dazwischen) lag selbst höchstens den halben Rand vom Anker —
        // gegen die jetzige Lage also höchstens den ganzen.
        if (s[84] === 0 && s[27] === 1) {
            for (let o = 28; o < 52; o += 4) {
                if (!steht(Math.abs(s[o + 3] - a[o + 3]))) return false;
                for (let j = 0; j < 3; j++) if (!(Math.abs(s[o + j] - a[o + j]) <= 1e-9)) return false;
            }
            if (s[53] !== a[53] || !steht(Math.abs(s[87] - a[87])) || !steht(Math.abs(s[88] - a[88]))) return false;
            if (!this._blendeHaelt(a, s, anker)) return false;
            const cx = a[64] * s[65] - a[65] * s[64],
                cy = a[65] * s[63] - a[63] * s[65],
                cz = a[63] * s[64] - a[64] * s[63];
            const dreh = Math.atan2(
                Math.sqrt(cx * cx + cy * cy + cz * cz),
                a[63] * s[63] + a[64] * s[64] + a[65] * s[65]
            );
            return this._wahlHaelt(dreh, Math.max(anker.wegMax, s[86]), a[85]);
        }
        const dx = s[0] - a[0],
            dy = s[1] - a[1],
            dz = s[2] - a[2];
        const persp = s[84] === 1;
        // das Auge einer Perspektive auf dem Weg ihres Ankers (`_aufStrecke`), das einer orthogonalen Kamera am Punkt
        if (!(persp ? this._aufStrecke(dx, dy, dz, anker) : steht(Math.sqrt(dx * dx + dy * dy + dz * dz))))
            return false;
        // perspektivisch die Projektion (3…26), orthogonal die Ebenen des Frustums; dazu die Wahl-Scheibe (28…51) — die
        // Richtung bis auf die Rundung, die Konstante um haltM
        if (persp) for (let i = 3; i < 27; i++) if (s[i] !== a[i]) return false;
        for (let p = persp ? 6 : 0; p < 12; p++) {
            const o = p < 6 ? 3 + 4 * p : 28 + 4 * (p - 6);
            if (!steht(Math.abs(s[o + 3] - a[o + 3]))) return false;
            for (let j = 0; j < 3; j++) if (!(Math.abs(s[o + j] - a[o + j]) <= 1e-9)) return false;
        }
        if (!steht(Math.abs(s[52] - a[52])) || s[53] !== a[53]) return false;
        // die Richtungen: die Licht-Basis (54…62), das Licht (63…65), die Drehung der Kamera (75…83)
        for (let i = 54; i < 66; i++) if (!(Math.abs(s[i] - a[i]) <= 1e-9)) return false;
        if (persp) {
            let spur = 0;
            for (let i = 75; i < 84; i++) spur += s[i] * a[i];
            const dreh = Math.acos(Math.max(-1, Math.min(1, (spur - 1) / 2)));
            if (!this._wahlHaelt(dreh, 1, anker.drehRand)) return false;
        } else for (let i = 75; i < 84; i++) if (!(Math.abs(s[i] - a[i]) <= 1e-9)) return false;
        return this._blendeHaelt(a, s, anker);
    }

    // HÄLT DIE BLENDE (66…74) gegen ihren Anker? Ihr Auge (das Auge jeder Maske, `uLodAuge` in XZ — 67, 68) ist ein Ort der
    // Lage wie das Auge der Kamera: es hält nach dem Gesetz des Halts, höchstens den halben Halt vom Anker (`_wahlHaelt` gegen
    // haltM); an, Perf-Streck, Bezug und die Kanten des Blend-Gesetzes gleich. Das Fenster jeder Wahl trägt den Halt als
    // Rand (`_instanzFenster`), und unter der gehaltenen Lage urteilt jeder Leser vom Auge des Ankers (`_passLageGen`).
    // Gegenprüfung 07.10.: der Vergleich war exakt — eine zweite Signatur neben dem Halt-Gesetz; atmete das Auge ±1 mm
    // quer (die Kamera hielt), wählte jeder Pass in jedem Frame jede Wahl neu (gate:sicht-arbeit, atmendes Auge: 14 999
    // Prüfungen je Frame).
    // Mit Weg (w24-fahrt-takt) hält es auf der Strecke des Ankers in der Ebene (`anker.blende`, `_aufStrecke`).
    _blendeHaelt(a, s, anker) {
        if (s[66] !== a[66]) return false;
        if (!this._aufStrecke(s[67] - a[67], 0, s[68] - a[68], anker.blende)) return false;
        for (let i = 69; i < 75; i++) if (s[i] !== a[i]) return false;
        return true;
    }

    // Das Urteil über einen Körper (Box mit Saum: Mitte cx/cy/cz, Halb-Ausdehnung hx/hy/hz, Saum-Radius r) in der Lage L.
    _passTrifft(L, cx, cy, cz, hx, hy, hz, r) {
        const ax = cx - L.ax,
            ay = cy - L.ay,
            az = cz - L.az;
        // der Saum, der Rand je Meter Abstand zum Auge (die zeitliche Auflösung und die Drehung, über die die Lage hält), der
        // Halt der Lage (`_passLageGen`) und der Licht-Rand einer Kaskade (die Stufen der Sonne, über die ihre Wahl hält)
        const rr = r + L.halt + L.licht + (L.rand + L.dreh) * Math.sqrt(ax * ax + ay * ay + az * az);
        const E = L.fr.planes;
        for (let p = 0; p < 6; p++) {
            const n = E[p].normal;
            const nx = n.x,
                ny = n.y,
                nz = n.z;
            const st = (nx < 0 ? -nx : nx) * hx + (ny < 0 ? -ny : ny) * hy + (nz < 0 ? -nz : nz) * hz + rr;
            if (nx * cx + ny * cy + nz * cz + E[p].constant < -st) return false;
        }
        const f = L.fit;
        if (!f) return true;
        // Die Licht-Kapsel: der Körper wandert entlang des Lichts (`dir`), bis er ganz unter der Box liegt (Licht-z < zb).
        const d = L.dir;
        const sl = (d.x < 0 ? -d.x : d.x) * hx + (d.y < 0 ? -d.y : d.y) * hy + (d.z < 0 ? -d.z : d.z) * hz + r;
        const v = L.v.set(cx, cy, cz).applyMatrix4(f.basisInv);
        const t = Math.max(0, v.z - f.zb + sl);
        const ex = cx + d.x * t,
            ey = cy + d.y * t,
            ez = cz + d.z * t;
        for (let j = 0; j < f.ebenen.length; j++) {
            const P = f.ebenen[j];
            const n = P.normal;
            const nx = n.x,
                ny = n.y,
                nz = n.z;
            // die Scheibe hält um haltM, der Boden der Box (das Ende der Kapsel) ebenso: zweimal der Halt; dreht das Licht,
            // wandert das Ende der Kapsel um höchstens den Licht-Rand
            const st =
                (nx < 0 ? -nx : nx) * hx +
                (ny < 0 ? -ny : ny) * hy +
                (nz < 0 ? -nz : nz) * hz +
                r +
                f.saum +
                2 * L.halt +
                L.licht;
            if (nx * cx + ny * cy + nz * cz + P.constant < -st && nx * ex + ny * ey + nz * ez + P.constant < -st)
                return false;
        }
        return true;
    }

    // Eine Box (Box3) als Körper des Gesetzes, `r` = ihr Rand.
    _passTrifftBox(L, b, r) {
        const mn = b.min,
            mx = b.max;
        return this._passTrifft(
            L,
            (mn.x + mx.x) * 0.5,
            (mn.y + mx.y) * 0.5,
            (mn.z + mx.z) * 0.5,
            (mx.x - mn.x) * 0.5,
            (mx.y - mn.y) * 0.5,
            (mx.z - mn.z) * 0.5,
            r
        );
    }

    // EINE GPU-WAHL FÜR JEDE INSTANZ (w25-gpu-wahl, Atlas Schnitt 2; der Spike w25-spike-gpu-vegetation maß an der Mess-Wiese
    // Ego im Gang, Radeon, ABAB: die CPU-Wahl `_instanzWahlPass` 3,7/11,4 ms Mittel/p95 je Bild, die GPU 0,045 ms für 3 262
    // Instanzen). JEDE globale Gruppe — die Senke eines Gang-Satzes (`aGang`), die Pflanzen-Stufe und ihr Zwilling, die Karte
    // und ihr Zwilling (die Atlas-Gruppe "#S"), jede übrige globale Gruppe — wählt die GPU (`_instanzWahlGpu`) in JEDEM Pass,
    // der sie zieht, je Pass in ihrer eigenen Liste: das Auge im Frustum, der Wurf je Kaskade mit seiner Licht-Kapsel, das
    // Fenster ihrer Stufe (`__wahlFenster`, `PASS_WAHL_WGSL`). Bis hier wählte die CPU die Pflanzen-Stufen und die Karte je
    // Pass, ordnete ihre Slots und zählte sie zurück — eine Gruppe, die in beiden Pass-Arten zeichnete, zog jede Instanz.
    // Regional (im Region-Bündel, sein Cull) und Tür-Flügel wählt niemand je Instanz.
    _instanzWahlArt(leaf, castShadow, regional) {
        if (regional || !leaf || leaf.tuer) return null;
        return leaf.geom && leaf.geom.attributes ? "gpu" : null;
    }

    // DAS FENSTER EINER GRUPPE (`__wahlFenster`, die Wahl der GPU liest es je Auftrag): [Art, gilt im Hauptbild, gilt in den
    // Kaskaden, 0] — die Art 1 · 2 · 3 der Stufen-Stempel der Studio-Blende (aLodLevel: L0 · L1 · Zwilling/einzige Nah-Stufe,
    // ihr Maß aH0 · aH0L), 4 die Karte (aKarte), 0 ohne Fenster. Es GILT, wo der Stoff die Maske im Kanal des Passes trägt: die
    // Stufen-Stoffe der Foundry markieren sie am Bau (`userData.foundryCrossfade` samt Kanal — der Schattenpass liest nur die
    // Farbe, nie die Deckung), der Karten-Stoff ebenso (`userData.kartenMaske`). Ohne Maske zeichnet die GPU jede Instanz voll
    // — ein Fenster schnitte dort ein Loch: die Wahl liest dann nur das Gesetz der Pass-Wahl.
    static _wahlFenster(leaf, atlasGruppe) {
        const at = leaf.geom.attributes,
            ud = (leaf.mat && leaf.mat.userData) || {};
        if (atlasGruppe) return at.aKarte ? [4, +(ud.kartenMaske === true), +(ud.kartenMaske === true), 0] : [0, 0, 0, 0]; // prettier-ignore
        if (!at.aH0 || !at.aLodLevel || !(at.aLodLevel.array[0] >= 1)) return [0, 0, 0, 0];
        const blende = ud.foundryCrossfade === true;
        return [at.aLodLevel.array[0], +blende, +(blende && ud.foundryCrossfadeKanal === "farbe"), 0];
    }

    // DIE WAHL DER GPU (Rang 7 des Luft-Urteils 28.10., gebaut nach dem Spike gpu-wahl). Befund (Luft-Urteil, Stadt-Gipfel
    // stadt-voll): der Hauptpass zog 1 368k Dreiecke, davon die Klasse bewohner 868k — Haut und Kleid jedes Bewohners im
    // Nah-Kreis, auch hinter dem Blick —, jede Kaskade ihren Wurf ganz (je ~110k): die Senken des Gang-Satzes wählte keine
    // Pass-Art (`_instanzWahlArt` kannte nur Pflanzen-Stufen und Karten). Jetzt wählt eine
    // Arena, deren Senken die Art "gpu" tragen, im Haken jedes Passes, vor seinem Encoder (r184 reicht ihn bei `finishRender`
    // ein, die Queue ordnet: Aufträge · Rechnung · Zug): sie legt die Aufträge dieser Kamera (`_wahlVor`: die Zahl jedes Zugs 0,
    // seine erste Instanz der Abschnitt der Liste dieser Kamera), und EIN Compute je Kamera prüft jede ihrer Instanzen nach dem
    // EINEN Gesetz der Pass-Wahl (`_passTrifft` als WGSL, `PASS_WAHL_WGSL`), schreibt die getroffenen verdichtet in die Liste
    // und schreibt die Zahl des Zugs in den Auftrags-Puffer der Arena (in der Folge der Instanzen, `PASS_WAHL_WGSL`); der Instanz-Knoten liest `matrizen[liste[instance_index]]`
    // (`_senkenKnoten`). Ein Wurf ist der Bruch der Arena (`_arenaBruch`): jedes Glied zeichnet wieder über seinen Zeichner.
    _instanzWahlGpu(kamera, S) {
        const reg = AnazhRealm.__arenen;
        if (!reg || !reg.size || AnazhRealm.__arenaBruch) return;
        const rend = this.state.renderer;
        try {
            const arenen = [];
            for (const a of reg.values()) {
                if (!a._wahl || !kamera.layers.test(a.layers)) continue;
                const zug = a._wahlVor(rend, kamera);
                if (zug && zug.wahl.length) arenen.push(a, zug);
            }
            // je Bild neu, darum in der Lage des Auges (`L.auge`, w24-fahrt-takt: der Halt am Punkt, kein Weg)
            if (arenen.length) this._wahlRechnen(rend, S.lage.auge, arenen, kamera === this.state.camera, kamera);
        } catch (e) {
            this._arenaBruch(e);
        }
    }

    // EIN COMPUTE JE KAMERA: die Lage (`_wahlLage`) und die Aufträge jeder Arena (`_wahlAuftraege`, je Arena ein Block nach der
    // Ausrichtung der Speicher-Versätze) in je EINEM Puffer, je Arena eine Bindegruppe (Matrizen, Liste, Auftrags-Puffer —
    // gemerkt, solange ihre Puffer stehen) und EIN Dispatch (y: ihre Züge, je Zug EINE Arbeitsgruppe, `PASS_WAHL_WGSL`).
    // DER STAND KOSTET NICHTS (w27-takt-streu, Lehre 25): eine Arena rechnet in diesem Pass nur, wenn sich etwas änderte, das
    // ihre Wahl liest — die Lage dieser Kamera (ohne die Hälfte des Zustands), ihre Aufträge (je Zug gepackt und verglichen),
    // ihre Daten (`_datenV`: ein Block kopierte), ihre Zahlen (`argsNeu`: ein neuer Auftrag setzte sie auf 0) oder ihre
    // Bindung; sonst stehen Liste und Zahlen auf der GPU, wie sie der letzte Compute legte, und nichts geht hoch. Die Familien
    // der Nähe (Art 5) rechnen im Hauptbild zusammen: nur dann wechselt die Hälfte des Zustands (gelesen die des letzten,
    // geschrieben die andere). Bis w27-takt-streu rechnete jeder Pass jede Arena und lud alle Aufträge (gemessen an der
    // Mess-Wiese im Stand: 6,5 KB je Bild, `_wahlRechnen` 0,69 ms je Bild allein im Hauptbild).
    _wahlRechnen(rend, L, arenen, haupt, kamera) {
        const be = rend.backend,
            dev = be.device,
            U = GPUBufferUsage;
        let W = AnazhRealm.__wahlGpu;
        if (!W || W.dev !== dev) {
            const lay = dev.createBindGroupLayout({
                label: "pass-wahl",
                entries: [
                    "uniform",
                    "read-only-storage",
                    "read-only-storage",
                    "storage",
                    "storage",
                    ...Array(3).fill("read-only-storage"),
                    "storage",
                ].map((type, i) => ({
                    binding: i,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: { type, hasDynamicOffset: i === 1 },
                })),
            });
            const code = AnazhRealm.WIESE_WGSL + "\n" + AnazhRealm.PASS_WAHL_WGSL; // die Gesetze der Ferne (`WIESE_WGSL`)
            const module = dev.createShaderModule({ label: "pass-wahl", code });
            const layout = dev.createPipelineLayout({ bindGroupLayouts: [lay] });
            const pipe = dev.createComputePipeline({
                label: "pass-wahl",
                layout,
                compute: { module, entryPoint: "wahl" },
            });
            const lage = dev.createBuffer({ label: "pass-wahl-lage", size: 304, usage: U.UNIFORM | U.COPY_DST });
            // der Speicher einer Arena ohne Maß des Fensters (`aH0` · `aH0L` · `aKarte`)
            const leer = dev.createBuffer({ label: "pass-wahl-leer", size: 16, usage: U.STORAGE });
            const leerRW = dev.createBuffer({ label: "pass-wahl-leer-rw", size: 16, usage: U.STORAGE });
            W = AnazhRealm.__wahlGpu = {
                dev,
                lay,
                pipe,
                lage,
                lageF: new Float32Array(76),
                leer,
                leerRW,
                par: 0,
                puffer: null,
                f: null,
                jeKamera: new WeakMap(), // je Kamera die Lage ihres letzten Computes (`lageNeu`)
            };
        }
        const al = dev.limits.minStorageBufferOffsetAlignment;
        const nw = this.state.nahWiese,
            N = this.state.nahe;
        // die Lage dieses Passes (ein Sprung des Auges wählt einmal aus dem Jetzt, `_wieseAugeTakt`), verglichen ohne die Hälfte
        const F = AnazhRealm._wahlLage(L, W.lageF);
        F[30] = 0;
        F[31] = haupt ? 1 : 0;
        F[67] = haupt && N && N.sprung ? 1 : 0;
        F[27] = nw && nw.auge ? nw.auge.h : 0; // die Höhe des Auges über dem eigenen Boden (`_wieseAugeTakt`, die Ferne)
        if (haupt && N) N.sprung = false;
        const K = W.jeKamera.get(kamera) || (W.jeKamera.set(kamera, { lage: new Float32Array(76).fill(NaN) }), W.jeKamera.get(kamera)); // prettier-ignore
        let lageNeu = false;
        for (let i = 0; i < 76 && !lageNeu; i++) lageNeu = i !== 30 && K.lage[i] !== F[i];
        if (lageNeu) K.lage.set(F);
        // je Arena: ihre Aufträge gepackt (`_wahlAuftraege`) und ihre Bindung; rechnet sie? DER GANG BAUT NICHTS (w27-takt-gc):
        // die Zeilen der Prüfung (`W.rechnet`) bleiben, Puffer und Art werden ohne Array und Rückruf verglichen — vorher je Pass und
        // Kamera je Arena zwei Arrays, ein Objekt und zwei Rückrufe, auch bei stehender Lage (GTX 1050, dorf Ego: 1,75 MB/s)
        const zustand = (N && N.zustand) || W.leerRW,
            rechnet = W.rechnet || (W.rechnet = []);
        let nahe = false,
            nR = 0;
        for (let j = 0; j < arenen.length; j += 2) {
            const a = arenen[j],
                zug = arenen[j + 1],
                n = zug.wahl.length / 5,
                bg0 = zug.__wahlBG,
                q = a.__instanzQuelle;
            if (!zug.pack || zug.pack.length < n * 16) zug.pack = new Float32Array(Math.ceil(n * 1.5 + 4) * 16);
            const f = zug.pack,
                alt = zug.packAlt,
                u = zug.packU && zug.packU.buffer === f.buffer ? zug.packU : (zug.packU = new Uint32Array(f.buffer));
            AnazhRealm._wahlAuftraege(zug.wahl, f, u, 0);
            let neu = lageNeu || zug.argsNeu === true || zug.datenV !== a._datenV || !alt || alt.length !== n * 16 || zug.bindung !== zustand || !bg0 || bg0.n !== n; // prettier-ignore
            // die Puffer, die ihr Compute bindet: ein neuer (ein gewachsener Auftrags-Puffer trägt die Zahlen 0, eine neue Liste
            // oder Instanz-Seite ist leer) rechnet
            for (let k = 0; !neu && k < 6; k++) {
                const x = k === 0 ? q.instanceMatrix : k === 1 ? zug.liste : k === 2 ? a._ind : k === 3 ? q.aH0 : k === 4 ? q.aH0L : q.aKarte; // prettier-ignore
                neu = (x ? (be.get(x) || {}).buffer : W.leer) !== bg0.puf[2 + k];
            }
            for (let i = 0; !neu && i < n * 16; i++) neu = alt[i] !== f[i];
            let art5 = false;
            for (let i = 0; !art5 && i < zug.wahl.length; i += 5)
                art5 = !!(zug.wahl[i].__wahlFenster && zug.wahl[i].__wahlFenster[0] === 5);
            if (art5 && neu) nahe = true;
            const x = rechnet[nR] || (rechnet[nR] = { a: null, zug: null, n: 0, neu: false, art5: false });
            nR++;
            x.a = a;
            x.zug = zug;
            x.n = n;
            x.neu = neu;
            x.art5 = art5;
        }
        for (let i = nR; i < rechnet.length; i++) rechnet[i].a = rechnet[i].zug = null; // keine Arena über ihren Gang hinaus halten
        // die Familien der Nähe rechnen im Hauptbild zusammen, dann wechselt die Hälfte des Zustands
        if (haupt && nahe) {
            for (let i = 0; i < nR; i++) if (rechnet[i].art5) rechnet[i].neu = true;
            W.par ^= 1;
        }
        F[30] = W.par;
        let D = null;
        for (let i = 0; i < nR; i++) if (rechnet[i].neu) (D || (D = [])).push(rechnet[i]);
        if (!D) return;
        const off = [];
        let bytes = 0;
        for (const x of D) {
            off.push(bytes);
            bytes += Math.ceil((x.n * 64) / al) * al;
        }
        if (!W.puffer || W.puffer.size < bytes) {
            const size = Math.max(bytes, 2 * (W.puffer ? W.puffer.size : 0));
            if (W.puffer) W.puffer.destroy();
            W.puffer = dev.createBuffer({ label: "pass-wahl-auftraege", size, usage: U.STORAGE | U.COPY_DST });
            W.f = new Float32Array(size / 4);
        }
        D.forEach((x, j) => {
            W.f.set(x.zug.pack.subarray(0, x.n * 16), off[j] / 4);
            x.zug.packAlt = x.zug.pack.slice(0, x.n * 16);
            [x.zug.datenV, x.zug.argsNeu, x.zug.bindung] = [x.a._datenV, false, zustand];
        });
        dev.queue.writeBuffer(W.lage, 0, F);
        dev.queue.writeBuffer(W.puffer, 0, W.f.buffer, 0, bytes);
        const enc = dev.createCommandEncoder({ label: "pass-wahl" });
        const pass = enc.beginComputePass({ label: "pass-wahl" });
        pass.setPipeline(W.pipe);
        for (let j = 0; j < D.length; j++) {
            const { a, zug, n } = D[j],
                q = a.__instanzQuelle;
            for (const x of [q.instanceMatrix, zug.liste]) rend._attributes.update(x, 3); // r184 AttributeType.STORAGE
            const mass = ["aH0", "aH0L", "aKarte"].map((k) => (q[k] ? (rend._attributes.update(q[k], 3), be.get(q[k]).buffer) : W.leer)); // prettier-ignore
            const puf = [
                W.lage,
                W.puffer,
                ...[q.instanceMatrix, zug.liste, a._ind].map((x) => be.get(x).buffer), // die Liste dieser Kamera (`_wahlVor`)
                ...mass,
                zustand, // der Zustand der Stufe jeder Nähe (`_naheZustand`: Wiese und Streu), sonst ein leerer
            ];
            let bg = zug.__wahlBG; // je Zug: die Liste ist die seiner Kamera
            if (!bg || bg.n !== n || puf.some((p, k) => p !== bg.puf[k])) {
                const entries = puf.map((buffer, i) => ({
                    binding: i,
                    resource: { buffer, size: i === 1 ? n * 64 : undefined },
                }));
                bg = zug.__wahlBG = { n, puf, bg: dev.createBindGroup({ label: "pass-wahl", layout: W.lay, entries }) };
            }
            pass.setBindGroup(0, bg.bg, [off[j]]);
            pass.dispatchWorkgroups(1, n); // je Auftrag EINE Arbeitsgruppe: sie verdichtet in der Folge der Instanzen
        }
        pass.end();
        // DIE ZAHL DER GPU FÜR DAS BUCH (w25-gpu-wahl, profiband.K3): je Zug, der rechnete, die gezogenen Instanzen seiner Glieder
        // zurück — ein Lesen im Flug je Zug, ein Bild Verzug —, `_auftraege` bucht damit die Dreiecke (`renderer.info`) statt
        // der Obergrenze; ein Zug, der steht, behält seine Zahl
        const lesen = [];
        for (const { a, zug } of D) {
            if (zug.liest || !zug.offs.length) continue;
            const b = zug.offs[0],
                laenge = zug.offs[zug.offs.length - 1] - b + 20;
            if (!zug.lies || zug.lies.size < laenge) {
                if (zug.lies) zug.lies.destroy();
                zug.lies = dev.createBuffer({ label: "pass-wahl-zahl", size: Math.ceil(laenge / 16) * 16 + 16, usage: U.MAP_READ | U.COPY_DST }); // prettier-ignore
            }
            enc.copyBufferToBuffer(be.get(a._ind).buffer, b, zug.lies, 0, Math.ceil(laenge / 4) * 4);
            lesen.push([zug, zug.zuege.slice(), zug.offs.map((o) => (o - b) / 4 + 1)]);
            zug.liest = true;
        }
        dev.queue.submit([enc.finish()]);
        for (const [zug, glieder, platz] of lesen)
            zug.lies
                .mapAsync(GPUMapMode.READ)
                .then(() => {
                    const u = new Uint32Array(zug.lies.getMappedRange());
                    zug.gpuZahl = new Map(glieder.map((m, k) => [m, u[platz[k]]]));
                    zug.lies.unmap();
                    zug.liest = false;
                })
                .catch(() => (zug.liest = false)); // ein Puffer, der mit seiner Arena fiel
    }

    // Die Lage eines Passes für die GPU (das `Lage`-Gefüge von `PASS_WAHL_WGSL`, 68 Floats): je Ebene des Frustums Normale und
    // Abstand des Auges (n·a + d — die Instanz rechnet relativ zum Auge, f32 trägt keine Kilometer auf Millimeter), das Auge,
    // der Rand (Halt + Licht, je Meter Abstand der Rand der zeitlichen Auflösung + der Drehung); im Kaskaden-Pass die
    // Licht-Kapsel: je Ebene der Scheibe (`fit.ebenen`) dasselbe, die Licht-Tiefe über dem Boden der Box (die dritte Zeile von
    // `fit.basisInv` relativ zum Auge, minus `zb`), das Licht (w = 1: die Kapsel gilt) und ihr Saum (Saum der Scheibe, zweimal
    // der Halt, der Licht-Rand) — die Größen von `_passTrifft`.
    static _wahlLage(L, aus) {
        const ax = L.ax,
            ay = L.ay,
            az = L.az;
        const ebene = (P, o) => {
            const n = P.normal;
            aus.set([n.x, n.y, n.z, n.x * ax + n.y * ay + n.z * az + P.constant], o);
        };
        for (let p = 0; p < 6; p++) ebene(L.fr.planes[p], p * 4);
        aus.set([ax, ay, az, 0, L.halt + L.licht, L.rand + L.dreh, 0, 0], 24);
        const f = L.fit;
        if (!f) aus.fill(0, 32, 68);
        else {
            for (let p = 0; p < 6; p++) ebene(f.ebenen[p], 32 + p * 4);
            const b = f.basisInv.elements,
                d = L.dir;
            aus.set([b[2], b[6], b[10], b[2] * ax + b[6] * ay + b[10] * az + b[14] - f.zb], 56);
            aus.set([d.x, d.y, d.z, 1, f.saum + 2 * L.halt + L.licht, 0, 0, 0], 60);
        }
        // DAS FENSTER DER STUFE (w25-gpu-wahl): der Rand der Blende (`haltBlende`), ob die Maske gilt (`L.an`), die Kanten des EINEN Blend-Gesetzes
        // (`_blendeKanten`, eine offene Kante als größte Zahl) und die Blende — das Auge der Maske, Perf-Streck, Bezug
        // eine Lage ohne ihn ist ein Bruch, nie ein stilles NaN im Fenster (z327: eine von Hand gebaute Lage trug nur `halt`)
        if (typeof L.haltBlende !== "number")
            throw new Error("_wahlLage: die Lage trägt keinen Rand der Blende (`haltBlende`)");
        [aus[65], aus[66]] = [L.haltBlende, L.an ? 1 : 0];
        const K = L.an ? L.kanten : null;
        aus.set(K ? [K.l0Aus, K.l1Ein, K.l1Aus, K.karteEin].map((x) => Math.min(x, 1e30)) : [0, 0, 0, 0], 68);
        aus.set(L.an ? [L.ex, L.ez, L.perf, L.ref] : [0, 0, 0, 0], 72);
        return aus;
    }

    // Die Aufträge einer Arena ab dem Wort `o` (das `Auftrag`-Gefüge, 16 Worte): die Kugel der Gestalt (`_gangSatzHuelle`),
    // erste Instanz · Zahl · Platz der Zahl im Auftrags-Puffer · Abschnitt der Liste, der Saum (die Gestalt des Gangs trägt
    // keinen: ihre Kugel deckt jede Pose; eine Pflanze `pflanzeRandM` für den Wind, `__wahlSaum`) und das Fenster ihrer Stufe
    // (`__wahlFenster`, `_wahlFenster`). `wahl` aus `_auftraege`: [Glied, erste Instanz, Zahl, Platz, Abschnitt] je Zug.
    static _wahlAuftraege(wahl, f, u, o) {
        for (let j = 0; j < wahl.length; j += 5, o += 16) {
            const g = wahl[j].geometry;
            if (!g.boundingSphere) g.computeBoundingSphere();
            const s = g.boundingSphere;
            f.set([s.center.x, s.center.y, s.center.z, s.radius], o);
            u.set([wahl[j + 1], wahl[j + 2], wahl[j + 3], wahl[j + 4]], o + 4);
            f.set([wahl[j].__wahlSaum || 0, ...(wahl[j].__wahlNah || [0, 0, 0])], o + 8);
            f.set(wahl[j].__wahlFenster || [0, 0, 0, 0], o + 12);
        }
    }

    // DIE KANTEN DES FENSTERS aus dem EINEN Blend-Gesetz (`gesetz` = `__phytoCore.lodCrossfadeMask`, die Quelle der Studio-
    // Blende und jeder Maske): je Rampe die Distanz, an der sie 0 verlässt bzw. 1 erreicht — per Bisektion AM GESETZ (seine
    // f0 · f1 · f1o steigen monoton mit der Distanz), auf 1 mm, je Kante die äußere Grenze: das Fenster behält eher zu viel
    // als zu wenig. Rein (kein Zustand): gate:foundry-crossfade fährt es in Node gegen das Gesetz.
    static _blendeKanten(gesetz, d0, d1, fade, fade0) {
        const cfg = { d0, d1, fade, fade0 };
        const hoch = 4 * Math.max(d0, d1, 1) + Math.abs(fade) + Math.abs(fade0);
        // [a, b]: `bed` gilt bei b, nicht bei a (bed steigt monoton von falsch nach wahr)
        const kante = (lod, bed) => {
            let a = 0,
                b = hoch;
            if (bed(gesetz(a, 0, cfg, lod, true, a))) return [0, 0];
            if (!bed(gesetz(b, 0, cfg, lod, true, b))) return [hoch, Infinity];
            while (b - a > 1e-3) {
                const mitte = 0.5 * (a + b);
                if (bed(gesetz(mitte, 0, cfg, lod, true, mitte))) b = mitte;
                else a = mitte;
            }
            return [a, b];
        };
        return {
            d0,
            d1,
            fade,
            fade0,
            l0Aus: kante(0, (x) => x.f0 >= 1)[1], // die L0 behält, solange f0 < 1 (Blatt-Metrik)
            l1Ein: kante(1, (x) => x.f0 > 0)[0], // die L1 blendet ein, sobald f0 > 0 (Blatt-Metrik)
            l1Aus: kante(1, (x) => x.f1o >= 1)[1], // die L1 behält, solange f1o < 1 (Skelett-Metrik)
            karteEin: kante(2, (x) => x.f1 > 0)[0], // die Karte blendet ein, sobald f1 > 0
        };
    }

    // Behält die Stufe über das Distanz-Intervall [dSmin, dSmax] (Skelett) bzw. [dLmin, dLmax] (Blatt) ein Fragment mit
    // positivem Maß der Dither-Werte? Das Gesetz behält die L0 bei ramp(f0) < dh, die L1 bei f1o < dh ≤ ramp(f0) (die
    // einzige Nah-Stufe, Stempel 3, blendet nie ein: f1o < dh), die Karte bei dh ≤ min(2·f1, 1) oder verdeckt — je Rampe
    // die Kante aus `_blendeKanten`. Rein (gate:foundry-crossfade prüft es je Stufe gegen das Gesetz, kein Loch).
    static _blendeBehaelt(K, stufe, dSmin, dSmax, dLmin, dLmax, verdeckt) {
        if (verdeckt === true) return true; // VOLL: die verdeckte Karte, die Stufe im Halt (K36) — die Maske behält alles
        if (stufe === 1) return dLmin < K.l0Aus;
        if (stufe === 2) return dLmax > K.l1Ein && dSmin < K.l1Aus;
        if (stufe === 3) return dSmin < K.l1Aus;
        if (stufe === "karte") return dSmax > K.karteEin;
        return true;
    }

    // DER SCHIRM — die EINE Quelle jeder Schirm-Größe (Gebot 7: Kosten an den Schirm). Einmal je Takt (Loop-Eingang)
    // aus dem Zeichenpuffer des Renderers (Bildpunkte samt Pixel-Verhältnis) und dem Sichtfeld der Kamera: Breite ·
    // Höhe · pxJeM (Bildpunkte, die ein Meter Objekt in einem Meter Abstand senkrecht deckt). Jedes Gesetz, das
    // den Schirm liest, liest IHN, und richtig herum: ein kleinerer Schirm trägt höchstens gleich viel Detail. Bis
    // V18.531 las das Fell-Gesetz die Canvas-Höhe selbst (Rückfall 1080, Sichtfeld-Rückfall 60°), und der Geräte-Seed
    // las `innerWidth·innerHeight·dpr²` VERKEHRT herum (ab 4 MPix weniger Welt: ein größerer Schirm startete ärmer).
    // gate:schirm-monotonie zählt die Welt in drei Fenstergrößen je Pass und Klasse und nennt jeden zweiten Weg.
    // Ohne Renderer oder Perspektiv-Kamera ist pxJeM null — ein fehlender Wert ist nie 0. Eine BÜHNE (`ziel`, eine Leinwand
    // des Welt-Renderers mit ihrem Satz `ziel.buehne`) ist ihr eigener Schirm: derselbe Weg misst ihren Zeichenpuffer in
    // ihren Satz (ohne Welt-Kamera, pxJeM null) — ihr Ziel folgt ihrer Leinwand, nie dem Fenster der Welt.
    _schirmMessen(ziel = null) {
        const st = this.state;
        const rend = ziel || st.renderer;
        const cam = ziel ? null : st.camera;
        const h = ziel ? ziel.buehne : this;
        const v = h._schirmPuffer || (h._schirmPuffer = new THREE.Vector2());
        const s = h._schirmWert || (h._schirmWert = { breite: 0, hoehe: 0, pxJeM: null });
        if (rend && typeof rend.getDrawingBufferSize === "function") rend.getDrawingBufferSize(v);
        else v.set(0, 0);
        s.breite = v.x;
        s.hoehe = v.y;
        s.pxJeM = cam && cam.isPerspectiveCamera && v.y > 0 ? v.y / (2 * Math.tan((cam.fov * Math.PI) / 360)) : null;
        return s;
    }

    _schirm() {
        return this._schirmWert || this._schirmMessen();
    }

    // DER TAKT DER HORIZONT-KARTE (je Bild aus `_weltLichtTakt`, wo das Richtlicht dieses Bilds steht; dazu aus `_atmoTakt`): das
    // Gitter des Gesetzes folgt dem Anker (`_horizontGitterTakt`), die Karte wird neu gemalt, wenn das Licht sich um `lichtRad`
    // gedreht hat oder ein Gitter kam — Kosten an Änderung (Gebot 7), der Null-Renderer zeichnet nichts. Unter dem Horizont, vor
    // dem ersten Gitter, nach einem Bruch des Fadens und ohne Wurf des Lichts (`_lichtWirft`: die Sonnen-Sicht ist ein Schatten wie
    // die Kaskaden jedes Stoffs — ohne Schatten-Karte des Renderers, Holz kienspan, wirft sie so wenig wie sie) ruht die Sicht (1).
    _horizontKarteTakt() {
        const st = this.state;
        const K = st.horizontKarte;
        if (!K) return null;
        const dl = st.directionalLight;
        const rend = st.renderer;
        if (!dl || !rend || rend._isHeadlessNull || !st.rendererReady) return K;
        const H = AnazhRealm.HORIZONT_KARTE;
        this._horizontGitterTakt(K);
        const L = this._horizontLicht || (this._horizontLicht = new THREE.Vector3());
        L.copy(dl.position);
        if (dl.target) L.sub(dl.target.position);
        if (!K.bereit || !this._lichtWirft() || !(L.lengthSq() > 0) || !(L.normalize().y > 0)) {
            K.U.aktiv.value = 0;
            return K;
        }
        if (K.gemalt !== K.stand || K.licht.dot(L) < Math.cos(H.lichtRad)) {
            K.U.licht.value.copy(L);
            if (!this._atmoZeichne(K.pass, K.rt)) return K; // die Pipeline im Vorbau: der nächste Takt malt
            K.licht.copy(L);
            K.gemalt = K.stand;
            K.malZahl++;
        }
        K.U.aktiv.value = 1;
        return K;
    }

    // DAS GITTER DES GESETZES (`HORIZONT_KARTE`): erst nach dem ersten Weltbild, um den Anker des Rings (ohne Ring der Spieler) auf
    // das Raster `zelleM` gelegt; neu, wenn der Anker `nachM` von der Mitte gewandert ist. Der Feld-Faden rechnet die Höhe
    // (`gitter` im voxel-worker, `gelaende-core` `hoehe` ohne Detail) in Aufträgen à `zeilenJeAuftrag` Zeilen nacheinander; das alte
    // Gitter trägt, bis das neue ganz da ist. Eine Welt, die geht (`_horizontKarteLeeren`), lässt den Auftrag fallen (`gen`);
    // ein Bruch des Fadens meldet sich EINMAL laut und hält die Karte an (`gebrochen`).
    _horizontGitterTakt(K) {
        const st = this.state;
        if (K.flug || K.gebrochen || !st._weltbildDa) return;
        const H = AnazhRealm.HORIZONT_KARTE;
        const fr = st.fernRing;
        const pm = st.playerMesh;
        const ax = fr ? fr.anchorX : pm ? pm.position.x : NaN;
        const az = fr ? fr.anchorZ : pm ? pm.position.z : NaN;
        if (!Number.isFinite(ax) || !Number.isFinite(az)) return;
        if (K.mitte && Math.hypot(ax - K.mitte[0], az - K.mitte[1]) <= H.nachM) return;
        const [n, d] = [H.gitter, H.zelleM];
        const [cx, cz] = [Math.round(ax / d) * d, Math.round(az / d) * d];
        const [x0, z0] = [cx - (n / 2) * d, cz - (n / 2) * d];
        const wl = Number.isFinite(st.waterLevel) ? st.waterLevel : 0;
        const neu = new Uint16Array(n * n);
        const gen = K.gen;
        const halb = THREE.DataUtils.toHalfFloat;
        K.flug = true;
        const zeilen = (j0) => {
            if (K.gen !== gen) return;
            if (j0 >= n) {
                K.hoehen.image.data.set(neu);
                K.hoehen.needsUpdate = true;
                K.U.ursprung.value.set(x0, z0);
                K.U.bezug.value = wl;
                K.mitte = [cx, cz];
                K.stand++;
                K.bereit = true;
                K.flug = false;
                return;
            }
            const nz = Math.min(H.zeilenJeAuftrag, n - j0);
            this._fernAuftrag("gitter", { x0, z0: z0 + j0 * d, d, nx: n, nz })
                .then((a) => {
                    if (K.gen !== gen) return;
                    const h = a && a.hoehen;
                    if (!h || h.length !== n * nz)
                        throw new Error(`die Antwort trägt ${h ? h.length : 0} statt ${n * nz} Höhen`);
                    for (let k = 0; k < h.length; k++) {
                        if (!Number.isFinite(h[k])) throw new Error(`die Höhe ${h[k]} am Gitter-Punkt ${j0 * n + k}`);
                        neu[j0 * n + k] = halb(h[k] - wl);
                    }
                    zeilen(j0 + nz);
                })
                .catch((e) => {
                    if (K.gen === gen) [K.flug, K.gebrochen] = [false, true];
                    this._stoffBruch("die Horizont-Karte (das Gitter im Feld-Faden)", e);
                });
        };
        zeilen(0);
    }

    // Eine Welt geht (Ring-Abschied: Saat, Welt-Wechsel, Sicht-Regler): ihr Gitter gilt nicht mehr, ein Auftrag im Flug fällt.
    _horizontKarteLeeren() {
        const K = this.state.horizontKarte;
        if (!K) return;
        K.gen++;
        K.flug = false;
        K.gebrochen = false;
        K.mitte = null;
        K.bereit = false;
        K.U.aktiv.value = 0;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_bild_kosten]);

// ===== ATLAS · Bild/kosten — Außen-Konstanten =====
// DIE LUFT (V18.530, `_luftEnsure`): Koschmieder-Extinktion mit Höhen-Abnahme. Die Anker sind BEOBACHTBARE
// Sichtweiten (Kontrast eines Gelände-Pixels fällt unter `kontrast`): ein klarer Sommertag trägt Gelände-
// Silhouetten 20 km weit (Mitteleuropa, Sommer-Dunst 15–30 km), Starkregen im Sturm 1,5 km. Die reine Luft ist
// Rayleigh bei 550 nm auf Meereshöhe (1,16·10⁻⁵/m, V ≈ 340 km). Der Dunst sitzt in der Grenzschicht: Skalenhöhe
// 1 km über dem Meeresspiegel — dieselbe Luft ist das Aerosol der EINEN Atmosphäre (D3, `_atmoMedium`): ihre Keule zur
// Sonne trägt die Mie-Phase des Gesetzes. Die Anker wohnen EINMAL im Gesetz (foundry-core `ATMO_GESETZ.luft`, auch das Labor
// liest sie); hier kommt nur die Sicht unter Wasser hinzu. Fehlt der Kern, bricht es laut.
AnazhRealm._atmoKern = function () {
    const tc = typeof globalThis !== "undefined" ? globalThis.__terrainCore : null;
    const G = tc ? tc.ATMO_GESETZ : null;
    if (!G || !G.luft || !G.nacht) throw new Error("Die Atmosphäre: foundry-core.js fehlt (__terrainCore.ATMO_GESETZ)");
    return G;
};
// DAS AUGE DER NACHT (K66, die Post-Kette `_ensurePostProcessing`: die Sättigung je Pixel unter der Nacht): das mesopische Band
// der CIE 191:2010 — unter `staebchenCd` sieht das Auge ohne Farbe (Stäbchen), über `zapfenCd` voll (Zapfen); `luxJeEinheit`
// die Eichung der Nacht (Vollmond 0,26 lx ≙ der Nacht-Bestrahlung der Welt 0,224, fachwerk LICHT_GESETZ) — eine Leuchtdichte
// der Welt (Albedo/π · Bestrahlung) mal ihr ist cd/m².
AnazhRealm.NACHT_AUGE = Object.freeze({ luxJeEinheit: 0.26 / 0.224, staebchenCd: 0.005, zapfenCd: 5 });
// DIE EINE SZENEN-SKALA (K50, `_szeneSkalaWirk`): die Szene rendert in SZENE_SKALA × Ausgabe, die zeitliche Auflösung
// (`_zeitAufloesung`, TAAU) löst auf die Ausgabe auf. 0,75 = 56 % der Pixel-Arbeit; der Spieler stellt sie im Menü (0,5..1).
AnazhRealm.SZENE_SKALA = 0.75;
AnazhRealm.SZENE_SKALA_MIN = 0.5;
// Der Resolve der Hochskalierung (`_zeitAufloesung`): das Gewicht je Eingangs-Texel exp(−ZEIT_KERN · d²), d in Ausgabe-Pixeln;
// die Breite der Varianz-Klemme im Stand (r184: 1); die Nach-Schärfe je fehlendem Skalen-Anteil (`nachSchaerfe`).
AnazhRealm.ZEIT_KERN = 7;
AnazhRealm.ZEIT_GAMMA_RUHE = 1.25;
// DAS DECKUNGS-GEDÄCHTNIS des Resolve (A3b, `_zeitAufloesung`): eine Deckungs-Kante ist ein Tiefen-Sprung im 3×3 über `kante`
// relativ (Δz/z: 0,4 m auf 20 m — Blatt vor Blatt zählt); das Gedächtnis folgt ihr mit `rate` je Frame; zwischen `an[0]` und
// `an[1]` löst es die Klemme, voll nur in Ruhe (unter `ruhePx` Ausgabe-Pixeln Bewegung je Frame).
AnazhRealm.FLACKER = Object.freeze({ kante: 0.02, rate: 0.125, an: Object.freeze([0.3, 0.6]), ruhePx: 2 });
// Der Kamera-Sprung der zeitlichen Auflösung (K68, `_traaReprojektion`): weiter in EINEM Frame beginnt die Geschichte neu und
// läuft als Mittel an — der Wagen bei 200 km/h und 15 fps legt 3,7 m je Frame zurück, ein Tor oder ein Umsetzen viele Meter.
AnazhRealm.ZEIT_SPRUNG_M = 6;
// DER GETRAGENE LEIB der zeitlichen Auflösung (`_traaKameraBewegung`, `_traegerTeile`): höchstens `teile` Boxen (der Mensch trägt
// je Knochen eine, ~15, dazu das Gerät in der Hand); `saumM` weitet jede Box (Gelenk-Mischung und Tuch weichen von der Starre
// ihres Knochens ab).
AnazhRealm.TRAEGER = Object.freeze({ teile: 24, saumM: 0.03 });
// Der Takt des GPU-Kehraus (`_gpuKehraus`): je Gang Graph + r184-Register (nach dem Kehraus beide nur das Bild); was zwischen
// zwei Gängen den Graphen verlässt, hält die GPU höchstens so lange.
AnazhRealm.GPU_KEHRAUS_MS = 2000;
// DIE ERST-ZEICHNUNG (`_configureRenderer`): je Render-Aufruf der Welt-Szene baut der erste Erst-Bau immer, jeder weitere nur,
// solange der Aufruf unter dieser Zeit (ms) baute — ein Frame trägt so höchstens einen schweren Knoten-Bau je Pass. Im laufenden
// Spiel nach dem Weltbild baut der Knoten-Bau in Raten unter der EINEN Frist der Bau-Arbeit (`_knotenRate` → `_bauFrist`,
// TAKT_FRIST; der Gang r184 `NodeBuilder.build`: KNOTEN_GANG).
AnazhRealm.ERST_BAU_MS = 4;
// EIN BAU JE SCHLÜSSEL IM FLUG (`_knotenRate`): so viele Bilder darf ein Bau in Raten ohne Leser stehen, bevor er den Flug
// verlässt (sein Objekt fiel mitten im Bau; ein Leser desselben Schlüssels legt ihn dann neu an)
AnazhRealm.KNOTEN_FLUG_BILDER = 600;
AnazhRealm.KNOTEN_GANG = Object.freeze([
    Object.freeze(["setup", "analyze", "generate"]),
    Object.freeze(["fragment", "vertex", "compute"]),
]);
// DER BAU-SCHLÜSSEL (`_gestaltSchluessel`): die Zahlen eines Stoffs, die der Knoten-Bau nur als Stoff-Referenz liest — ihr
// Wert (0 oder nicht) teilt kein Programm
AnazhRealm.BAU_NEUTRAL = Object.freeze(["roughness", "metalness", "envMapIntensity", "emissiveIntensity"]);
// DAS GESETZ DER PASS-WAHL (`_passTrifft`, W7-Vereinigung) — EIN Urteil je Körper und Pass für jeden Leser (Zellen der
// Sätze · Werfer der Bündel · Instanzen der Wahl-Gruppen · Büschel der Nah-Wiese). `sichtRand` je Meter Abstand zum Auge:
// die zeitliche Auflösung versetzt die Projektion um höchstens einen halben Pixel (1080p, 75°: 0,0007 je m), der Rand trägt
// ~2 Pixel — ein Satz, der seine Wahl über Frames hält, verliert am Bildrand nichts. `saumM` je Kaskade: so weit liegt die
// Wahl-Scheibe außerhalb der Scheibe beim Rendern; läuft die Scheibe zwischen zwei Karten darüber hinaus, rendert die
// Kaskade neu (`_kaskadeDeckt`). `pflanzeRandM`: der Wind-Saum um die Kugel einer Pflanzen-Instanz (Krone und Halm wiegen).
// `haltM` (Welle C): DIE LAGE STEHT, solange jede Ebene des Passes ihre Richtung hält und um höchstens so viel wandert
// (`_passLageGen`) — das Auge der Spiel-Kamera atmet im Stand um Millimeter (gemessen 06.10., echte GPU, Mess-Wiese:
// ±4 mm in y je Frame, keine Drehung), und jede neue Wahl darum rechnete jeden Frame dasselbe neu. Das Gesetz trägt den
// Halt in jedem Urteil als Rand (`L.halt`), die gehaltene Wahl verliert darum nichts.
// `drehRand` (Welle C, OMEN-Urteil 06.10.: beim Drehen 360 × 1° war die Kette teurer als vorher): der Rand einer Perspektive
// (Bogenmaß) — das Gesetz trägt den Sinus je Meter Abstand als Rand, die Höhlen-Sicht ihr Sichtfeld je Halbwinkel um das
// 1,5-Fache geweitet; die Wahl hält über eine Drehung bis zur Hälfte (`_wahlHaelt`), dann wählt sie neu.
// `lichtRandTexel` (Welle C, OMEN-Urteil 07.10.: der Tag steht im Spiel nie): der Licht-Rand eines Kaskaden-Passes in Texeln
// seiner Karte — die Wahl der Kaskade hält über die Stufen der Sonne (`_sonnenWinkel`), bis die Drehung des Lichts seit der
// Wahl, mal dem längsten Licht-Weg der Box (`fit.weg`), die Hälfte dieses Rands erreicht (`_wahlHaelt`).
AnazhRealm.PASS_WAHL = Object.freeze({
    sichtRand: 0.003,
    saumM: Object.freeze([2, 8, 24]),
    pflanzeRandM: 2,
    haltM: 0.02,
    drehRand: (2 * Math.PI) / 180,
    lichtRandTexel: 32,
    // DER WEG DES AUGES (`_lageAnker`, w24-fahrt-takt): die Strecke, die das Auge in `zeitS` fährt, höchstens `wegMax`, quer `querM`
    // die Box der Kaskaden liegt über ihn erst in Fahrt (`kaskadeAb` m/s, zwei Schritte in Folge): im Gang hält sie ihre Größe
    weg: Object.freeze({ zeitS: 0.5, wegMax: 12, querM: 0.25, lotM: 0.5, drehRad: 0.05, kaskadeAb: 10 }),
});
// die Felder, die die Lage des Auges mit der des Wegs teilt (`_passWahlLage`): Ebenen, Kapsel, Licht und Blende dieses Passes
AnazhRealm.LAGE_GETEILT = Object.freeze(["fr", "ax", "ay", "az", "rand", "halt", "haltBlende", "dreh", "fit", "dir", "licht", "an", "ex", "ez", "perf", "ref", "kanten"]); // prettier-ignore
// die Drehung der Licht-Basis im Abdruck einer Lage (`_wahlAbdruck`): die Elemente ihrer 3 × 3
AnazhRealm.WAHL_BASIS = Object.freeze([0, 1, 2, 4, 5, 6, 8, 9, 10]);
// DAS GESETZ DER PASS-WAHL AUF DER GPU (`_passTrifft` für die Kugel, h = 0; `_instanzWahlGpu`): je Instanz eines Auftrags
// ihre Kugel (die Mitte der Gestalt durch die Instanz-Matrix, der Radius mal deren größte Streckung, dazu der Saum) gegen
// jede Ebene des Frustums, relativ zum Auge, mit dem Rand der Lage; im Kaskaden-Pass dazu ihre LICHT-KAPSEL — die Kugel
// entlang des Lichts, bis sie ganz unter der Box liegt — gegen jede Ebene der Scheibe: liegen beide Enden jenseits einer
// Ebene, wirft sie dort nicht. DIE VERDICHTUNG IST DETERMINISTISCH (w25-gpu-wahl, Atlas Schnitt 2): je Zug EINE Arbeitsgruppe
// geht seine Instanzen in Blöcken zu 64 durch, eine Präfix-Summe im geteilten Speicher legt jede getroffene auf ihren Platz
// in der Folge der Instanzen, die Zahl des Zugs schreibt sie am Ende. Bis hier zählte `atomicAdd` je Instanz: die Liste
// ordnete sich je Bild anders (Spike w25: die Pop-Treue brach um 109–128 Bytes, zwei Aufnahmen derselben Pose wichen ab).
// DAS FENSTER DER STUFE (`__wahlFenster`, `_wahlFenster`): behält die Maske der Blende vom Auge auf der Instanz etwas? Das Maß
// je Instanz aus dem Speicher der Arena (`aH0`/`aH0L`, die Karte `aKarte`: Höhe, Halbbreite, ±Sichthöhe), die Distanz vom Auge
// der Maske zum Ursprung der Instanz in XZ × Perf × min(Bezug/Sichthöhe, 1), mit dem Halt als Rand — und das Urteil an den
// Kanten des EINEN Blend-Gesetzes (`_blendeKanten` → `_blendeBehaelt`, dieselbe Folge der Bedingungen; die Kanten trägt die
// Lage). Die Karte wählt ihr Quad auf der Stammachse als Kugel. Das Fenster gilt je Pass-Art (Hauptbild · Kaskade).
// DIE NÄHE (Art 5, `_bestandFamilie`: die Nah-Wiese und die Nah-Streu): ein toter Platz (Element 11 < 0) fällt, sonst trägt
// Element 11 seine WEITE — die Wiese die Übergabe `radius`, an die die Ferne zeichnet, die Streu das Rand-Band ihrer Art
// (`_streuWeite`: die Pflanze steht diesseits weite + rand · (½ − ⌊4 · Ordnung⌋/4), die Viertel-Stufen der Würfel-Ordnung);
// die Stufe nach `_nahStufe` — die nahe bis `saum.z`, gehalten bis `saum.w` dahinter — mit dem ZUSTAND des Platzes (`zustand`,
// Basis der Familie + Platz im Glied, zwei Hälften: gelesen die des letzten Rechnens, geschrieben die andere, nur im Hauptbild
// und nur vom ersten Teil der nahen Stufe; nach einem Sprung des Auges aus dem Jetzt); jede Senke behält ihre Stufe (`fenster.y`
// 1 die nahe, 2 die ferne, 3 eine Art mit EINER Stufe: keine Wahl der Stufe).
// DIE FERNE (Art 6) UND DIE SCHALE (Art 7, `_nahWieseBestand`): tot fällt, diesseits der Übergabe legt die Nähe; das Büschel steht,
// solange seine Ordnung (Element 7) unter dem Anteil seines Gesetzes × (1 + Rand) liegt — `_wieseFern` am Fußabdruck-Abstand
// `_wieseFuss` (der Fuß, die Ebene seines Hangs aus den waagrechten Achsen, die Höhe des Auges über dem eigenen Boden in
// `auge.w`), mit seiner Grenze (Element 3) —, die Karte nach `_wieseSchale` am Abstand; beide aus `WIESE_WGSL` (dieselbe
// Algebra wie der Stoff). Die Kugel des gestreckten Büschels: der Teil um seinen Fuß gespreizt, am Hang geneigt, die Halme breiter.
AnazhRealm.PASS_WAHL_WGSL = `
struct Lage {
    ebenen: array<vec4f, 6>, auge: vec4f, rand: vec4f,
    kapsel: array<vec4f, 6>, tiefe: vec4f, licht: vec4f, saum: vec4f,
    kanten: vec4f, blende: vec4f
}
struct Auftrag { kugel: vec4f, platz: vec4u, saum: vec4f, fenster: vec4f }
@group(0) @binding(0) var<uniform> lage: Lage;
@group(0) @binding(1) var<storage, read> auftraege: array<Auftrag>;
@group(0) @binding(2) var<storage, read> matrizen: array<mat4x4f>;
@group(0) @binding(3) var<storage, read_write> liste: array<u32>;
@group(0) @binding(4) var<storage, read_write> args: array<u32>;
@group(0) @binding(5) var<storage, read> h0: array<f32>;
@group(0) @binding(6) var<storage, read> h0l: array<f32>;
@group(0) @binding(7) var<storage, read> karte: array<vec4f>;
@group(0) @binding(8) var<storage, read_write> zustand: array<u32>;
var<workgroup> summe: array<u32, 64>;
fn haelt(art: u32, sLo: f32, sHi: f32, lLo: f32, lHi: f32) -> bool {
    let K = lage.kanten;
    if (art == 1u) { return lLo < K.x; }
    if (art == 2u) { return lHi > K.y && sLo < K.z; }
    if (art == 3u) { return sLo < K.z; }
    return sHi > K.w;
}
fn fenster(art: u32, i: u32, m: mat4x4f) -> bool {
    let B = lage.blende;
    let d = length(vec2f(m[3].x - B.x, m[3].z - B.y));
    let lo = max(0.0, d - lage.saum.y) * B.z;
    let hi = (d + lage.saum.y) * B.z;
    if (art == 4u) {
        let s = karte[i].w;
        let k = min(B.w / max(abs(s), 1e-3), 1.0);
        return s < 0.0 || haelt(art, lo * k, hi * k, lo * k, hi * k);
    }
    let hl = h0l[i];
    let kS = min(B.w / max(h0[i], 1e-3), 1.0);
    let kL = min(B.w / max(abs(hl), 1e-3), 1.0);
    return hl < 0.0 || haelt(art, lo * kS, hi * kS, lo * kL, hi * kL);
}
fn behalten(a: Auftrag, i: u32, j: u32) -> bool {
    let m = matrizen[i];
    let art = u32(a.fenster.x);
    if (art == 5u) {
        if (m[2].w < 0.0) { return false; }
        let d = length(vec2f(m[0].w, m[1].w) - lage.auge.xz);
        let z = (u32(a.fenster.z) + j) * 2u;
        let par = u32(lage.rand.z);
        let war = zustand[z + par] == 1u && lage.saum.w < 0.5;
        let l1 = d <= a.saum.z + select(0.0, a.saum.w, war);
        if (a.fenster.w > 0.5 && lage.rand.w > 0.5) { zustand[z + 1u - par] = select(0u, 1u, l1); }
        if (d >= min(a.saum.y, m[2].w) || (a.fenster.y < 2.5 && l1 != (a.fenster.y < 1.5))) { return false; }
    }
    var c = (m * vec4f(a.kugel.xyz, 1.0)).xyz - lage.auge.xyz;
    let s2 = max(dot(m[0].xyz, m[0].xyz), max(dot(m[1].xyz, m[1].xyz), dot(m[2].xyz, m[2].xyz)));
    var r = a.kugel.w * sqrt(s2) + a.saum.x;
    if (art == 4u) {
        let k = karte[i];
        let h = k.z * 0.5;
        c = m[3].xyz + m[1].xyz * h - lage.auge.xyz;
        r = length(m[0].xyz) * sqrt(h * h + k.y * k.y);
    }
    if (art >= 6u) {
        if (m[2].w < 0.0) { return false; }
        let fuss = m[3].xyz;
        let d = length(fuss.xz - lage.auge.xz);
        if (d < a.saum.y) { return false; }
        if (art == 6u) {
            let n = cross(m[2].xyz, m[0].xyz);
            let G = wieseFern(d, wieseFuss(fuss - lage.auge.xyz, n, lage.auge.w), m[0].w);
            if (m[1].w >= G.z * (1.0 + a.saum.z)) { return false; }
            let hang = length(n.xz) / max(abs(n.y), 1e-3);
            let quer = length((c + lage.auge.xyz - fuss).xz);
            r = (r + quer) * max(G.y, 1.0) * (1.0 + hang) + a.fenster.y * sqrt(s2) * max(G.x - 1.0, 0.0);
        } else {
            let S = wieseSchale(d);
            if (m[1].w >= S.x * (1.0 + a.saum.z)) { return false; }
            c = fuss + vec3f(0.0, a.fenster.z * 0.5, 0.0) - lage.auge.xyz;
            // die Breite nie über die größte ihrer Matrix, längs ihrer Breiten-Achse samt dem Hang (_wieseSchaleDaten)
            let gk = length(m[0].xz) / a.fenster.y;
            r = 0.5 * length(m[0].xyz) * min(1.0, S.y / max(gk, 1e-6)) + a.fenster.z;
        }
    }
    let rr = r + lage.rand.x + lage.rand.y * length(c);
    for (var p = 0u; p < 6u; p++) {
        let e = lage.ebenen[p];
        if (dot(e.xyz, c) + e.w < -rr) { return false; }
    }
    if (lage.licht.w > 0.5) {
        let ende = c + lage.licht.xyz * max(0.0, dot(lage.tiefe.xyz, c) + lage.tiefe.w + r);
        let st = r + lage.saum.x;
        for (var p = 0u; p < 6u; p++) {
            let e = lage.kapsel[p];
            if (dot(e.xyz, c) + e.w < -st && dot(e.xyz, ende) + e.w < -st) { return false; }
        }
    }
    let gilt = select(a.fenster.y, a.fenster.z, lage.licht.w > 0.5);
    return art == 0u || art >= 5u || gilt < 0.5 || lage.saum.z < 0.5 || fenster(art, i, m);
}
@compute @workgroup_size(64)
fn wahl(@builtin(local_invocation_id) lid: vec3u, @builtin(workgroup_id) wid: vec3u) {
    let a = auftraege[wid.y];
    let t = lid.x;
    var basis = 0u;
    for (var k = 0u; k < a.platz.y; k += 64u) {
        let j = k + t;
        var ja = 0u;
        if (j < a.platz.y && behalten(a, a.platz.x + j, j)) { ja = 1u; }
        summe[t] = ja;
        workgroupBarrier();
        for (var o = 1u; o < 64u; o *= 2u) {
            var v = 0u;
            if (t >= o) { v = summe[t - o]; }
            workgroupBarrier();
            summe[t] += v;
            workgroupBarrier();
        }
        if (ja == 1u) { liste[a.platz.w + basis + summe[t] - 1u] = a.platz.x + j; }
        basis += summe[63];
        workgroupBarrier();
    }
    if (t == 0u) { args[a.platz.z] = basis; }
}
`;
// DIE FARBSICHT (spielgang.K4, `_farbsichtMatrix`, die Post-Kette `_ensurePostProcessing`): die Simulation der Dichromasie nach
// Viénot, Brettel & Mollon 1999 („Digital video colourmaps for checking the legibility of displays by dichromats", Color Res. Appl.
// 24:243) — linear-RGB → LMS (`lms`, die Zapfen-Antwort nach Smith & Pokorny), der fehlende Zapfen als Ebene durch Weiß und einen
// Anker des Schirms (`ebene`), zurück nach linear-RGB. Die Daltonisierung nach dem Prinzip von Fidaner, Lin & Ozguven (2005): der
// Fehler, den der Dichromat nicht sieht (Bild − Simulation), geht in die Achsen, die er sieht — HALBSEITIG: nur die eine Seite des
// Fehlers im Kanal des verlorenen Gegensatzes (`kanal`: Rot für protan und deutan, Blau für tritan; e = Zeile von I − Sim), Δ =
// `schub` · staerke · max(e · Bild, 0). Rötliches wird dunkler und blauer, Grünes, Graues und das Blau des Himmels bleiben, wie der
// Dichromat sie sah. Gemessen am Ausgabe-Bild des Genesis-Orts (swiftshader, Grenzen unter Machado-Deuteranopie, je Pixel): ohne
// min ΔE 16,9 / Mittel 22,3; Fidaners Schub (beidseitig, Rot-Fehler in Grün und Blau je 0,7) machte Braun blauer und dem Grau
// ähnlicher (Boden|Bau 16,9 → 11,6); ein beidseitiger Schub hebt die Grenzen, kippt aber den Himmel für den Dichromaten nach Khaki;
// dieser 19,3 / 25,4, der Himmel unberührt. Acht klassische Verwechslungs-Paare (Rot/Grün, Braun/Oliv, Rosa/Grau, Lila/Blau …):
// Deuteranopie min 6,4 → 31,8, Protanopie 4,1 → 29,1; die Tritan-Paare (Blau/Grün, Gelb/Rosa, Himmel/Grau …) 10,4 → 12,1 (Mittel
// 22,1 → 49,0). Weiß, Grau und Schwarz tragen e = 0.
AnazhRealm.FARBSICHT = Object.freeze({
    arten: Object.freeze(["aus", "deuteranopie", "protanopie", "tritanopie"]),
    lms: Object.freeze([
        [17.8824, 43.5161, 4.11935],
        [3.45565, 27.1554, 3.86714],
        [0.0299566, 0.184309, 1.46709],
    ]),
    // der fehlende Zapfen (Zeile von lms) und der Anker seiner Ebene neben Weiß: protan und deutan das Blau des Schirms (Viénot
    // 1999: die Konstanten L = 2,02344·M − 2,52581·S und M = 0,494207·L + 1,24827·S sind genau diese Ebene), tritan sein Rot (der
    // Anker 660 nm bei Brettel, Viénot & Mollon 1997 — die eine Ebene trägt ihn; ihre zwei Halb-Ebenen fallen am Rot zusammen)
    ebene: Object.freeze({ protanopie: [0, 2], deuteranopie: [1, 2], tritanopie: [2, 0] }),
    kanal: Object.freeze({ protanopie: 0, deuteranopie: 0, tritanopie: 2 }),
    schub: Object.freeze({
        protanopie: Object.freeze([-1.5, -2.25, 2.25]),
        deuteranopie: Object.freeze([-1.5, -2.25, 2.25]),
        tritanopie: Object.freeze([-0.75, -0.75, 0]),
    }),
    staerke: 1,
});
// DER ZUGANG (spielgang.K4, `state.zugang`, Einstellungen › Ton & Sicht): das Sichtfeld des Spielers (vertikal, Grad; null =
// KAM_FOV_GRAD) in `zugang.fov` im Bereich `fov`, die Unschärfe der Bewegung aus ab `laufPxAus` Ausgabe-Pixeln Bewegung je Bild (`_zugangTakt`; Genesis-Ort,
// swiftshader, 1,5° Drehung je Bild über 12 Bilder: Kanten-Energie an 3,6, aus 12,5, in Ruhe beide 7,8 — spielgang.K4#2).
AnazhRealm.ZUGANG = Object.freeze({ fov: Object.freeze([60, 100]), laufPxAus: 4 });
// DAS SICHTFELD DES SPIELERS als reine Funktion: die Wahl (Menü, Stand) geklemmt auf ZUGANG.fov, null ohne Zahl — der EINE Weg Menü → Stand
// → `_kamFov`; die Schreiber legen sie mit `Object.assign(zugang, { fov })` ab (`camera.fov` schreibt allein `_kamFov`, gate:fahr-leben T5)
AnazhRealm._zugangFov = function (v) {
    if (v == null || v === "" || !Number.isFinite(+v)) return null;
    const [f0, f1] = AnazhRealm.ZUGANG.fov;
    return Math.max(f0, Math.min(f1, +v));
};
// die Farbsicht als reine Funktion: { sim (Zeilen-Matrix 3×3), fehler (e), schub (v · staerke) } je Art — Δ = schub · max(e · Bild, 0)
AnazhRealm._farbsichtMatrix = function (art, staerke) {
    const F = AnazhRealm.FARBSICHT;
    const E = F.ebene[art];
    if (!E) return null;
    const mul = (A, B) => A.map((z) => [0, 1, 2].map((j) => z[0] * B[0][j] + z[1] * B[1][j] + z[2] * B[2][j]));
    const inv = (m) => {
        const [[a, b, c], [d, e, f], [g, h, i]] = m;
        const A = e * i - f * h,
            B = -(d * i - f * g),
            C = d * h - e * g;
        const det = a * A + b * B + c * C;
        return [
            [A / det, -(b * i - c * h) / det, (b * f - c * e) / det],
            [B / det, (a * i - c * g) / det, -(a * f - c * d) / det],
            [C / det, -(a * h - b * g) / det, (a * e - b * d) / det],
        ];
    };
    // die Ebene durch Weiß (lms · 1) und den Anker: der fehlende Zapfen z = k0·u + k1·v aus den zwei anderen (u, v)
    const [z, a] = E;
    const [u, v] = [0, 1, 2].filter((i) => i !== z);
    const w = F.lms.map((r) => r[0] + r[1] + r[2]);
    const q = F.lms.map((r) => r[a]);
    const det = w[u] * q[v] - w[v] * q[u];
    const k0 = (w[z] * q[v] - w[v] * q[z]) / det,
        k1 = (w[u] * q[z] - w[z] * q[u]) / det;
    const P = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
    ];
    P[z] = [0, 0, 0];
    P[z][u] = k0;
    P[z][v] = k1;
    const sim = mul(inv(F.lms), mul(P, F.lms));
    const s = Number.isFinite(staerke) ? staerke : F.staerke;
    const k = F.kanal[art];
    return { sim, fehler: sim[k].map((v, j) => (k === j ? 1 : 0) - v), schub: F.schub[art].map((v) => s * v) };
};
