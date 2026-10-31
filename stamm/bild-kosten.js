class AnazhRealm_bild_kosten {
    // ===== ATLAS · Bild/kosten — Renderer · TAAU und die EINE Skala · Ausgabe · Post · Schatten-Kaskaden · Pass-Wahl · Schirm · GPU-Kehraus · Bündel- und Zeichen-Reihe =====
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
        const CSM = THREE.CSMShadowNode;
        if (typeof CSM !== "function" || typeof CSM.prototype.setup !== "function")
            this.log("EIN KNOTEN: CSMShadowNode.setup nicht gefunden (Vendor-Drift)", "ERROR");
        else if (!CSM.__anazhEinAufbau) {
            const aufbauRoh = CSM.prototype.setup;
            const aufbau = new WeakMap();
            CSM.prototype.setup = function (builder) {
                let n = aufbau.get(this);
                if (n === undefined) {
                    n = aufbauRoh.call(this, builder);
                    aufbau.set(this, n);
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
            const zeichne = (rend, ro, aufnahme, asynchron, nurBauen) => {
                const N = rend._nodes,
                    P = rend._pipelines;
                E.bau = null; // das Versprechen gehört dem Bau DIESES Aufrufs (`_erstAbsageWache`)
                // wer auf seine Pipeline wartet, läuft durch keinen Knoten (`_renderObjectDirect`: wer nicht zeichnet …)
                const imBau = P.get(ro).pipeline;
                if (imBau !== undefined && !P.isReady(ro) && !E.abgesagt.has(imBau)) {
                    welt._erstWartet(rend.backend, imBau, aufnahme !== null ? aufnahme.bundleGroup : null);
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
                    welt._erstWartet(rend.backend, P.get(ro).pipeline, aufnahme !== null ? aufnahme.bundleGroup : null);
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
                // er im Gang näher, kompilierte sie dort kalt.
                const vorbau = ro.getDrawParameters() === null;
                if (
                    vorbau &&
                    !(
                        object.isGeometrieArena === true &&
                        object.geometry.index !== null &&
                        scene === welt.state.scene &&
                        welt._ladeTakt()
                    )
                )
                    return;
                const aufnahme = this._currentRenderBundle;
                if (aufnahme !== null) ro.bundle = aufnahme.bundleGroup;
                // DIE BÜHNE DER KARTE (`_karteWeltBacken`) zeichnet wie die Welt: sie wiederholt ihren Bake, bis jeder Bürger
                // zeichnete — ihre Hüllen wechseln den Stoff, darum zählt dort kein Pass, und ihre Bau-Frist gilt dem ganzen
                // Bake-Versuch (13 Render-Aufrufe), nie je Aufruf
                const B = welt._karteBuehneSatz;
                const buehne = !!B && scene === B.szene;
                // DIE BÜHNEN (Werkstatt-Vorschau, Ich-, Hof-, Feed-Bühne: `_buehneRender` → `_buehneJetzt`) zeichnen wie die
                // Welt — bis 30.10. eigene Renderer, deren erster Render jede Pipeline synchron baute (Tab: 5 054 ms ohne Bild)
                if (scene !== welt.state.scene && !buehne && scene !== welt._buehneJetzt) {
                    zeichne(this, ro, aufnahme, false);
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
                const ungebaut =
                    ro._nodeBuilderState === null &&
                    N.get(ro).nodeBuilderState === undefined &&
                    N.nodeBuilderCache.get(ro.initialCacheKey) === undefined;
                const ctx = this._currentRenderContext.id;
                const k = passId == null ? ctx : ctx + "|" + passId;
                let pass = buehne ? undefined : E.gezeichnet.get(object);
                const vor = vorbau ? E.vorgebaut.get(object) : undefined;
                if (vorbau && ((pass !== undefined && pass.has(k)) || (vor !== undefined && vor.has(k)))) return;
                if (pass !== undefined && pass.has(k)) {
                    // der Neubau eines Objekts, das in diesem Pass schon zeichnete: wie der Vendor, im Frame
                    if (ungebaut) E.neubauN++;
                    zeichne(this, ro, aufnahme, false);
                    return;
                }
                let bau = -1;
                if (ungebaut) {
                    const aufruf = buehne ? B.versuch : this.info.calls;
                    if (E.aufruf !== aufruf) {
                        E.aufruf = aufruf;
                        E.aufrufMs = 0;
                        // unter dem Ladeschirm sieht kein Spieler den Takt: ein Lade-Bild (`_ladeBildFaellig`, alle
                        // LADE_BILD_MS) baut je Aufruf bis zur Frist des Lade-Frames, nicht nur einen Stoff
                        E.deckel = welt._ladeTakt() ? AnazhRealm.LADE_TAKT_MS : AnazhRealm.ERST_BAU_MS;
                    } else if (E.aufrufMs >= E.deckel) {
                        E.verschoben++;
                        if (aufnahme !== null) welt._erstWartet(this.backend, null, aufnahme.bundleGroup);
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
                deckel: AnazhRealm.ERST_BAU_MS, // die Bau-Zeit je Render-Aufruf (unter dem Ladeschirm LADE_TAKT_MS)
                bauN: 0,
                bauMs: 0,
                verschoben: 0,
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
            };
        return this._erstZeichnung;
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
    _erstWartet(be, pipe, bg) {
        const E = this._erstZeichnung;
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
    // (r184 und die BUNDLE-REIHENFOLGE führen jedes vor jedem losen Draw aus) @global · die Regionen · @wahl, dann lose, was
    // auf dem Boden steht (Bau-Satz, jede lose Senke, Tor, Membran, Leib — ohne Marke), der Boden, der Fern-Ring, der Himmel
    // (im Unendlichen zahlt er zuletzt nur seine eigenen Pixel). Ein Erzeuger nennt seine Schicht als Laufzeit-Marke
    // (`userData.zeichenSchicht`). Bis T3 sortierte r184 die losen Opaken nach renderOrder · Tiefe · Objekt-id, die Satz-Hülle
    // liegt am Ursprung (gleiche Tiefe): die Boot-Ankunft entschied, der Himmel (id 20) zeichnete vor Boden und Bau. Gemessen
    // (Radeon 890M, EINE Welt, gpu-bank-Median): Genesis Ego 28,25 → 23,38 ms, Dorf Ego 27,27 → 22,05 ms, Wiese 22,02 → 21,78.
    static _zeichenRang(o) {
        const u = (o && o.userData) || {};
        if (o && o.isBundleGroup === true) return u.regionKey === "@global" ? 0 : u.regionKey === "@wahl" ? 2 : 1;
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

    // DAS GESETZ DES SCHATTEN-BIAS (0710-12) — je Karte aus ihrer Texel-Kante, nie ein Meter-Wert für alle Kaskaden. Befund
    // (Studio-Welle S3, Familie kreatur): `normalBias` 1,0 m für beide Kaskaden; r184 schiebt die Probe jedes Empfängers um
    // `normalWorld × normalBias` in WELT-METERN (ShadowNode: `positionWorld.add(normalWorld.mul(normalBias))`), der Boden fragte
    // die Karte 1 m über sich ab — Wolf, Fuchs, Busch, Zaun-Pfosten und die Beine des Spielers warfen keinen sichtbaren
    // Schatten (Boden-IoU ≈ 0; die Kaskaden tragen an der Wiese 0,11–0,16 / 0,16–0,41 m je Texel, 1 m waren 3–9 Texel). Akne
    // entsteht innerhalb EINES Texels — der Bias, der sie hält, ist ein Bruchteil der Texel-Kante:
    //   normalBias = normalTexel · Hebel · Texel   (`_schattenNormalBias`, die EINE Quelle `atmosphere.shadowBias`)
    //   bias       = −tiefeTexel · Texel / Tiefe der Box   (r184 addiert ihn auf die Tiefe der Schatten-Koordinate, 0..1)
    // `texel` = die gröbere Kante der Karte (Welt-Meter), `tiefe` = Fern- minus Nah-Ebene ihrer Kamera. Gemessen 09.10. (GTX 1060,
    // gate:schatten-bias --echt, 2-mm-Platten eben · im Streiflicht 10° · Dach 40° bei 11° und 26° Sonne): die Akne-Kante liegt
    // zwischen 0,1/0 und 0,25/0,4 Texel (normal/Tiefe); ohne Normal-Anteil (0/1) streift das Streiflicht 4,9 %; das Gesetz 0,5/0,75
    // hält jede Platte bei 0,00 % und die kleinen Werfer am Fuß (Boden-IoU mit Saum 0,97–1,0).
    // KEIN HANG-BIAS: r184 trägt den hang-skalierten Tiefen-Bias (polygonOffset des Schatten-Stoffs → Pipeline
    // depthBiasSlopeScale) nicht verlässlich — der Pipeline-Schlüssel enthält ihn nicht (WebGPUBackend.getRenderCacheKey), der
    // Stoff-Schlüssel kennt Zahlen nur als 0/≠0, und r184 legt den Schatten-Stoff einer Kaskade neu an (bei der Geburt gesetzt,
    // im Lauf wieder 0: gemessen 09.10.). Ein Bias, der nach dem nächsten Neubau still fehlt, wäre der Bruch.
    _schattenBias(licht, texel, tiefe) {
        const K = AnazhRealm.SCHATTEN_KASKADE;
        const sh = licht && licht.shadow;
        if (!sh || !(texel > 0) || !(tiefe > 0)) return;
        sh.normalBias = this._schattenNormalBias(texel);
        sh.bias = (-K.tiefeTexel * texel) / tiefe;
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
                this._gammaRuhe = uniform(AnazhRealm.ZEIT_GAMMA_RUHE);
                // DAS DECKUNGS-GEDÄCHTNIS (A3b): der Resolve schreibt neben dem Bild je Ausgabe-Pixel, wie oft sein 3×3 eine
                // Deckungs-Kante trug (r8, `FLACKER`) — ein zweites Ziel des Resolve-Quads (MRT, Schlüssel = Name der Textur).
                // DIE GESCHICHTE IST DAS ZIEL DES LETZTEN RESOLVE (G7): zwei solche Ziele wechseln je Frame die Rolle
                // (`updateBefore`), keines wird kopiert. Bis G7 kopierte r184s Weg das Bild in die Geschichte und A3b das
                // Gedächtnis in seine — jede Kopie ein eigener Befehls-Puffer mit Submit außerhalb jedes Pass-Stempels (Radeon,
                // Mess-Wiese, gpu-bank in EINER Welt, 120 Paare: die zwei Kopien 0,69 ± 0,25 ms je Frame, die eine von main
                // 93539122 0,23 ± 0,14). Die Ziele des Vendors (1×1, nie gezeichnet) fallen. Je Ziel EIN Resolve-Stoff, der fest
                // das andere liest (seine Bindung steht); die Kette liest das Ziel der Lage über EINE Textur, deren Wert wechselt
                // (`updateBefore`, DIE LAGE IST DIE GENERATION). Ein Zweig je Abtastung der Kette kostete den Post-Pass 1,67 → 3,14
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
                const zweiter = new this._resolveMaterial.constructor(); // r184 NodeMaterial (der Stoff des Vendors)
                zweiter.name = this._resolveMaterial.name;
                this._resolveStoffe = [this._resolveMaterial, zweiter]; // Stoff k schreibt in Ziel k
                const F = AnazhRealm.FLACKER;
                this._flacker = {
                    kante: uniform(F.kante),
                    rate: uniform(F.rate),
                    an: uniform(new THREE.Vector2(F.an[0], F.an[1])),
                    ruhePx: uniform(F.ruhePx),
                };
                this._versatzIndex = 0;
                this._quads = this._resolveStoffe.map((m) => Object.assign(new Quad(m), { name: "TRAA" }));
                this._gr = new THREE.Vector2();
            }
            dispose() {
                super.dispose();
                this._resolveStoffe[1].dispose();
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
                this._anlauf.value = neu || sprung ? 0 : Math.min(this._anlauf.value + 1, 1e6);
                // der Resolve liest das Ziel des letzten Frames (Bild mit Vortiefe, Gedächtnis) und schreibt in das andere,
                // die Kette liest dieses; danach tauschen die zwei die Rolle — keine Kopie (G7)
                const k = 1 - this._lage;
                r.setRenderTarget(this._ziele[k]);
                this._quads[k].render(r);
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
                // Stoff k schreibt in Ziel k und liest fest das andere: die Geschichte und ihr Gedächtnis (G7)
                const stoff = (k) => {
                    const vor = this._ziele[1 - k];
                    const geschichte = texture(vor.textures[0]);
                    const flackerAlt = texture(vor.textures[1]);
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
                        // die Bewegung des nächsten Texels (NDC → UV), die Geschichte an ihrer Stelle im Vorbild
                        const versatz = this.velocityNode.load(nahT.add(0.5)).xy.mul(vec2(0.5, -0.5)).toVar();
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
                        const lauf = uvA.sub(gUV).mul(ausGr).length().div(this.maxVelocityLength).saturate();
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
                    this._resolveStoffe[k].mrtNode = T.mrt({
                        "TRAANode.resolve": resolve(),
                        "TRAANode.flacker": flackerNeu,
                    });
                };
                stoff(0);
                stoff(1);
                return this._textureNode;
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
        const pipe = dev.createRenderPipeline({
            label: "ausgabe-sonde",
            layout: "auto",
            vertex: { module: modul, entryPoint: "vs" },
            fragment: { module: modul, entryPoint: "fs", targets: [{ format: "rg11b10ufloat" }] },
            primitive: { topology: "triangle-list" },
        });
        const buf = dev.createBuffer({
            label: "ausgabe-sonde",
            size: 256,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
        });
        const enc = dev.createCommandEncoder({ label: "ausgabe-sonde" });
        const pass = enc.beginRenderPass({
            label: "ausgabe-sonde",
            colorAttachments: [{ view: tex.createView(), loadOp: "clear", clearValue: [0, 0, 0, 0], storeOp: "store" }],
        });
        pass.setPipeline(pipe);
        pass.draw(3);
        pass.end();
        enc.copyTextureToBuffer({ texture: tex }, { buffer: buf, bytesPerRow: 256 }, [1, 1]);
        dev.queue.submit([enc.finish()]);
        return buf
            .mapAsync(GPUMapMode.READ)
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

    // Post-Processing-Pipeline: EIN THREE.PostProcessing mit Bloom + Color-Grading (Sättigung + Kontrast),
    // aus TSL-Primitiven selbst gebaut (kein Vendor-Addon). Lazy nach rendererReady; bei jedem Fehler
    // postProcessingFailed=true → der Loop rendert direkt renderer.render() (nie schwarzer Schirm).
    _ensurePostProcessing() {
        if (this.state.postProcessing || this.state.postProcessingFailed) return this.state.postProcessing;
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
    _traaKameraBewegung(TSL, tiefe) {
        const { vec2, vec4 } = TSL;
        const R = TSL.uniform(new THREE.Matrix4());
        this.state._traaR = { R, jetzt: new THREE.Matrix4(), vor: new THREE.Matrix4(), neu: true };
        // Die Tiefen-Textur trägt [0, 1]; die NDC-Tiefe der Projektion ist es nur im WebGPU-Raum. Im WebGL2-Raum
        // (forceWebGL, gate:webgl-probe) liegt sie in [−1, 1]: z = 2·Tiefe − 1, sonst reprojiziert jeder Pixel beim
        // Laufen an die falsche Stelle (Schlieren). Die Textur-Zeilen dreht TSL je Rückend selbst (load, isFlipY).
        const webgpuRaum = this.state.renderer.coordinateSystem === THREE.WebGPUCoordinateSystem;
        return {
            load: (texel) => {
                const uvT = texel.div(vec2(tiefe.size()));
                const ndc = vec2(uvT.x.mul(2).sub(1), uvT.y.oneMinus().mul(2).sub(1));
                const d = tiefe.load(texel).r;
                const vor = R.mul(vec4(ndc, webgpuRaum ? d : d.mul(2).sub(1), 1));
                return ndc.sub(vor.xy.div(vor.w));
            },
        };
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

    // Alle Schatten-Maps im nächsten Render neu — die EINE Markierung (Werkzeuge vor einer Aufnahme): je Licht am
    // echten Leser, und jede Kaskade legt ihre Box frisch aus dem Blick, der jetzt gilt (A9-n2: der Halt des Takts und die
    // Größen-Hysterese trugen die Box des Boots in den Schuss — Erst- und Zweit-Boot zeichneten verschiedene Karten).
    _schattenAlleNeu() {
        const csm = this.state.csmNode;
        const dl = this.state.directionalLight;
        const lichter = csm && csm.lights && csm.lights.length ? csm.lights : dl ? [dl] : [];
        for (const l of lichter) if (l.shadow) l.shadow.needsUpdate = true;
        if (csm && csm._anazhFit) csm._anazhFit.length = 0;
    }

    // ═══ DIE KASKADEN-BOX (W7) ═══
    // Das r184-Addon setzte jede Kaskade auf ein QUADRAT mit der Diagonale ihrer Frustum-Scheibe (echte GPU,
    // Mess-Wiese, 306 m Reichweite: k0 339 m, k1 961 m): der Blick deckte ein Viertel davon, und beide Kaskaden
    // zeichneten dieselbe Werfer-Menge (echte GPU 04.10., V18.528: k0 = k1 = 209 Befehle · 1,23 M Dreiecke). Hier misst
    // die Box die SCHEIBE im Licht-Raum: ihre acht Ecken (mit dem Fade-Saum des Shaders), geschnitten mit dem Höhenband
    // der Empfänger (die Hüllen unter der Scheibe — Bundles UND Boden-Satz; Himmel und Fels-Inneres empfangen nichts);
    // die Größe rastet in Schritten von Scheiben-Tiefe / rasterTeiler (eine Drehung schimmert nicht bei jedem Grad;
    // gemessen 04.10., echte GPU, stehende Render-Kamera, Box-Blick je 1° gedreht: Bild-Änderung 1,4–1,9 Luma-Stufen
    // mit und ohne Rast-Wechsel, das Addon-Quadrat ohne Wechsel ebenso — der Wechsel liegt im Rauschen der zeitlichen
    // Auflösung), das Zentrum auf das Texel-Raster der festen Licht-Basis (Gehen schimmert nicht). Die nahe Ebene steht
    // über dem höchsten Werfer der Box (die Szene-Kante entlang des Lichts), die ferne unter der tiefsten
    // Scheiben-Ecke. Eine Kaskade außerhalb ihres Takts behält ihre Karte, solange die Box die Scheibe deckt — sonst
    // rendert sie in diesem Frame neu. Ersetzt die Licht-Stellung des Addons (`CSMShadowNode.updateBefore`, je Instanz
    // stumm; die Vendor-Datei bleibt unberührt) und läuft im Haken des Haupt-Passes VOR den Karten (`_passSicht`);
    // Licht und Ziel der Kaskade tragen ihre Welt-Matrix sofort — `updateMatrices` liest sie im selben Frame.
    _kaskadenPassen(csm) {
        const licht = csm.light;
        const eltern = licht && licht.parent;
        const cam = csm.camera;
        if (!eltern || !cam || !csm.lights || csm.lights.length === 0 || !csm.mainFrustum) return;
        for (const lw of csm.lights)
            if (lw.parent === null) {
                eltern.add(lw.target);
                eltern.add(lw);
            }
        const S = this._kaskadenSchmier();
        S.basis.lookAt(licht.position, licht.target.position, S.oben);
        S.basisInv.copy(S.basis).invert();
        S.dir.subVectors(licht.target.position, licht.position).normalize();
        const huellen = this._kaskadenHuellen(S);
        if (!csm._anazhFit) csm._anazhFit = [];
        for (let i = 0; i < csm.lights.length; i++) {
            const sh = csm.lights[i].shadow;
            const n = this._kaskadenScheibe(csm, i, huellen, S);
            const alt = csm._anazhFit[i];
            let rendert = sh.needsUpdate === true || sh.autoUpdate === true;
            const deckt = !!alt && this._kaskadeDeckt(alt, S, n);
            if (!rendert && !deckt) {
                sh.needsUpdate = true; // die Scheibe lief aus der Box — diese Kaskade rendert jetzt
                rendert = true;
            }
            // auf ihrem Takt rendert die Kaskade mit derselben Box, solange sie hält (`_kaskadeHaelt`)
            if (rendert && !(deckt && this._kaskadeHaelt(csm, i, alt, S, huellen, n)))
                csm._anazhFit[i] = this._kaskadeFit(csm, i, huellen, S, n, alt);
        }
    }

    _kaskadenSchmier() {
        if (this._kaskadenS) return this._kaskadenS;
        const V = () => new THREE.Vector3();
        this._kaskadenS = {
            basis: new THREE.Matrix4(),
            basisInv: new THREE.Matrix4(),
            m: new THREE.Matrix4(),
            frustum: new THREE.Frustum(),
            oben: new THREE.Vector3(0, 1, 0),
            dir: V(),
            v: V(),
            ecken: Array.from({ length: 8 }, V),
            punkte: Array.from({ length: 32 }, V),
            huellen: [],
            werferY: -Infinity, // die Welt-Höhe des höchsten Werfers der zuletzt gemessenen Box (`_kaskadenWerferOben`)
            band0: 0, // das Höhenband der Empfänger der zuletzt gelegten Scheibe (`_kaskadenScheibe`)
            band1: 0,
            ab: [],
            saum: [0, 1],
            wahlHaupt: [], // die Gruppen, die der Haupt-Pass gewählt hat (sein Nachher-Haken gibt sie zurück)
            wahlSchatten: [], // dasselbe für den laufenden Kaskaden-Pass
        };
        return this._kaskadenS;
    }

    // Die Tiefen-Spanne der Kaskade i in normierter Linear-Tiefe, mit dem Fade-Saum des Addon-Shaders (`_setupFade`:
    // margin = 0,25·Kante² um jede innere Grenze, je zur Hälfte in die Nachbarn) — die Empfänger, die sie liest.
    _kaskadenSaum(breaks, i, fade, aus) {
        let a = i === 0 ? 0 : breaks[i - 1];
        let b = breaks[i];
        if (fade) {
            if (i > 0) a -= 0.125 * a * a;
            if (i < breaks.length - 1) b += 0.125 * b * b;
        }
        aus[0] = Math.max(0, a);
        aus[1] = b;
        return aus;
    }

    // Die WERFER-HÜLLEN der Welt: jedes Region-Bundle (null = wirft nicht) und jeder Bereich eines werfenden Satzes (der
    // Boden lebt außerhalb jedes Bundles — ohne ihn fiele der Boden unter dem Band aus der Box, und ein Hang zur Sonne
    // hin läge über der nahen Ebene; ebenso der werfende Bau-Satz, Welle 6). Auf dem WebGL2-Rückfall (keine Bundles)
    // tragen die Sätze das Band allein.
    _kaskadenHuellen(S) {
        const aus = S.huellen;
        aus.length = 0;
        const map = this.state._regionBundles;
        if (map)
            for (const bg of map.values()) {
                const h = this._bundleWerferHuelle(bg);
                if (h) aus.push(h);
            }
        // Jeder werfende Satz (der Boden, die werfenden Bau-Sätze) trägt seine Bereichs-Hüllen bei — nach seiner Grund-Sicht,
        // nie nach seiner Sicht im letzten Pass (ein Blick in den Himmel zeigt keinen Abschnitt).
        const saetze = this.state.chunkSaetze;
        if (saetze)
            for (const s of saetze.values()) {
                if (s.spec.schatten !== true || !this._chunkSatzGrund(s)) continue;
                for (const b of s.bloecke.values()) if (b.huelle && !b.huelle.isEmpty()) aus.push(b.huelle);
            }
        return aus;
    }

    // Die Empfänger-Punkte der Kaskade i in Welt-Koordinaten (S.punkte, Rückgabe = Anzahl): die acht Scheiben-Ecken,
    // geschnitten mit dem Höhenband der Werfer-Hüllen unter der Scheibe (Ecken im Band + Kanten-Schnitte mit seinen
    // Ebenen — die Ecken des geschnittenen konvexen Körpers). Ohne Hülle unter der Scheibe bleiben die Ecken.
    _kaskadenScheibe(csm, i, huellen, S) {
        const ab = this._kaskadenSaum(csm.breaks, i, csm.fade === true, S.saum);
        const mf = csm.mainFrustum.vertices;
        const mw = csm.camera.matrixWorld;
        let x0 = Infinity,
            x1 = -Infinity,
            z0 = Infinity,
            z1 = -Infinity;
        for (let j = 0; j < 4; j++) {
            S.ecken[j].lerpVectors(mf.near[j], mf.far[j], ab[0]).applyMatrix4(mw);
            S.ecken[j + 4].lerpVectors(mf.near[j], mf.far[j], ab[1]).applyMatrix4(mw);
        }
        for (const e of S.ecken) {
            if (e.x < x0) x0 = e.x;
            if (e.x > x1) x1 = e.x;
            if (e.z < z0) z0 = e.z;
            if (e.z > z1) z1 = e.z;
        }
        let y0 = Infinity,
            y1 = -Infinity;
        for (const h of huellen) {
            if (h.max.x < x0 || h.min.x > x1 || h.max.z < z0 || h.min.z > z1) continue;
            if (h.min.y < y0) y0 = h.min.y;
            if (h.max.y > y1) y1 = h.max.y;
        }
        let n = 0;
        S.band0 = S.band1 = 0;
        if (y1 >= y0) {
            const pm = this.state.playerMesh;
            if (pm) {
                y0 = Math.min(y0, pm.position.y - 2);
                y1 = Math.max(y1, pm.position.y + 4);
            }
            S.band0 = y0;
            S.band1 = y1;
            for (const e of S.ecken) if (e.y >= y0 && e.y <= y1) S.punkte[n++].copy(e);
            const KA = AnazhRealm.KASKADEN_KANTEN;
            for (let k = 0; k < KA.length; k += 2) {
                const A = S.ecken[KA[k]],
                    B = S.ecken[KA[k + 1]];
                for (let s = 0; s < 2; s++) {
                    const Y = s === 0 ? y0 : y1;
                    const da = A.y - Y,
                        db = B.y - Y;
                    if (da * db < 0) S.punkte[n++].lerpVectors(A, B, da / (da - db));
                }
            }
        }
        if (n === 0) for (const e of S.ecken) S.punkte[n++].copy(e);
        return n;
    }

    // HÄLT DIE BOX IHREN TAKT (Welle C)? Sie deckt die Scheibe samt Wahl-Scheibe (`_kaskadeDeckt`), das Licht steht (dieselbe
    // Basis bis auf die Rundung) und kein Werfer der Box steigt über ihre nahe Ebene (`_kaskadenWerferOben` ≤ zt) — dann
    // rendert die Kaskade auf ihrem Takt mit DERSELBEN Kamera: die Karte fängt die bewegten Werfer, die Lage des Passes steht
    // (`_passLageGen`) und keine Wahl rechnet neu. Bis hier legte jeder Takt-Render die Box neu an die Scheibe — beim Drehen
    // trug jeder Render eine neue Lage (OMEN-Urteil 06.10.: Drehen 360 × 1° teurer als vorher). Die Box bleibt so groß wie
    // gerastet; dreht die Scheibe aus ihr heraus oder hebt sich ein Werfer, legt sie sich neu (`_kaskadeFit`). Und sie hat die
    // Größe, die der Fit der jetzigen Scheibe legte (`_kaskadeMass` samt Hysterese — Gegenprüfung 07.10.: nach dem Hineinzoomen
    // hielt die größere Box ihre gröberen Texel bis zur nächsten Stufe der Sonne).
    _kaskadeHaelt(csm, i, alt, S, huellen, n) {
        const a = alt.basisInv.elements,
            b = S.basisInv.elements;
        for (let j = 0; j < 16; j++) if (!(Math.abs(a[j] - b[j]) <= 1e-9)) return false;
        let x0 = Infinity,
            x1 = -Infinity,
            y0 = Infinity,
            y1 = -Infinity;
        for (let k = 0; k < n; k++) {
            const p = S.v.copy(S.punkte[k]).applyMatrix4(S.basisInv);
            if (p.x < x0) x0 = p.x;
            if (p.x > x1) x1 = p.x;
            if (p.y < y0) y0 = p.y;
            if (p.y > y1) y1 = p.y;
        }
        const sh = csm.lights[i].shadow;
        const schritt = this._kaskadeSchritt(csm, i, S);
        if (
            this._kaskadeMass(x1 - x0, sh.mapSize.width, alt.W, schritt) !== alt.W ||
            this._kaskadeMass(y1 - y0, sh.mapSize.height, alt.H, schritt) !== alt.H
        )
            return false;
        return this._kaskadenWerferOben(huellen, S, alt.x0, alt.x1, alt.y0, alt.y1) <= alt.zt;
    }

    // DER RAST der Box der Kaskade i: Scheiben-Tiefe (mit dem Fade-Saum) / rasterTeiler.
    _kaskadeSchritt(csm, i, S) {
        const cam = csm.camera;
        const far = Math.min(cam.far, csm.maxFar);
        const ab = this._kaskadenSaum(csm.breaks, i, csm.fade === true, S.saum);
        return Math.max(1, ((ab[1] - ab[0]) * (far - cam.near)) / AnazhRealm.SCHATTEN_KASKADE.rasterTeiler);
    }

    // DIE GRÖSSE der Box über eine Ausdehnung `w` (Karte `n` Texel): sie rastet und trägt mindestens einen Texel Luft je Seite
    // (der Raster-Versatz des Zentrums); eine alte Größe `altM` hält, solange sie die Scheibe so deckt und höchstens einen
    // Schritt zu groß ist (Hysterese gegen das Pendeln an einer Raster-Kante).
    _kaskadeMass(w, n, altM, schritt) {
        let m = schritt * Math.ceil(w / schritt);
        if (m - w < (2 * m) / n) m += schritt;
        if (altM && altM - w >= (2 * altM) / n && altM <= m + schritt) return altM;
        return m;
    }

    // Deckt die gerenderte Box (in IHRER Licht-Basis) die Empfänger-Punkte noch — und liegen sie in der Wahl-Scheibe, gegen
    // die der Pass seine Werfer gewählt hat (die Scheibe beim Rendern, um `saum` geweitet)?
    _kaskadeDeckt(fit, S, n) {
        for (let k = 0; k < n; k++) {
            const p = S.v.copy(S.punkte[k]).applyMatrix4(fit.basisInv);
            if (p.x < fit.x0 || p.x > fit.x1 || p.y < fit.y0 || p.y > fit.y1 || p.z < fit.zb || p.z > fit.zt)
                return false;
            if (fit.ebenen)
                for (let j = 0; j < fit.ebenen.length; j++)
                    if (fit.ebenen[j].distanceToPoint(S.punkte[k]) < -fit.saum) return false;
        }
        return true;
    }

    // Die sechs Ebenen einer Frustum-Scheibe (Ecken 0–3 nah, 4–7 fern, zyklisch — CSMFrustum), die Normalen nach innen.
    _scheibenEbenen(E, aus, mitte) {
        mitte.set(0, 0, 0);
        for (let j = 0; j < 8; j++) mitte.add(E[j]);
        mitte.multiplyScalar(1 / 8);
        aus[0].setFromCoplanarPoints(E[0], E[1], E[2]);
        aus[1].setFromCoplanarPoints(E[4], E[5], E[6]);
        for (let j = 0; j < 4; j++) aus[2 + j].setFromCoplanarPoints(E[j], E[(j + 1) % 4], E[((j + 1) % 4) + 4]);
        for (let j = 0; j < 6; j++) if (aus[j].distanceToPoint(mitte) < 0) aus[j].negate();
        return aus;
    }

    // Die Box der Kaskade i aus den Empfänger-Punkten: Licht-Raum-AABB → gerastete Größe → Zentrum auf dem Texel-Raster
    // → nahe Ebene über dem höchsten Werfer der Box (Hüllen · Tiere · Spieler · Inseln) → Licht, Ziel, Kamera, Bias.
    _kaskadeFit(csm, i, huellen, S, n, alt) {
        const K = AnazhRealm.SCHATTEN_KASKADE;
        const lw = csm.lights[i];
        const sh = lw.shadow;
        let x0 = Infinity,
            x1 = -Infinity,
            y0 = Infinity,
            y1 = -Infinity,
            z0 = Infinity,
            z1 = -Infinity;
        for (let k = 0; k < n; k++) {
            const p = S.v.copy(S.punkte[k]).applyMatrix4(S.basisInv);
            if (p.x < x0) x0 = p.x;
            if (p.x > x1) x1 = p.x;
            if (p.y < y0) y0 = p.y;
            if (p.y > y1) y1 = p.y;
            if (p.z < z0) z0 = p.z;
            if (p.z > z1) z1 = p.z;
        }
        // Die Größe rastet (`_kaskadeMass`, Schritt `_kaskadeSchritt`)
        const schritt = this._kaskadeSchritt(csm, i, S);
        const W = this._kaskadeMass(x1 - x0, sh.mapSize.width, alt && alt.W, schritt);
        const H = this._kaskadeMass(y1 - y0, sh.mapSize.height, alt && alt.H, schritt);
        const tx = W / sh.mapSize.width,
            ty = H / sh.mapSize.height;
        const cx = Math.round((x0 + x1) / 2 / tx) * tx;
        const cy = Math.round((y0 + y1) / 2 / ty) * ty;
        const bx0 = cx - W / 2,
            bx1 = cx + W / 2,
            by0 = cy - H / 2,
            by1 = cy + H / 2;
        // die nahe Ebene über jedem Werfer der Box samt Licht-Rand (ein Werfer, den die Wahl über die Stufen der Sonne hält)
        const lr = AnazhRealm.PASS_WAHL.lichtRandTexel * Math.min(tx, ty);
        let zt = Math.max(z1, this._kaskadenWerferOben(huellen, S, bx0 - lr, bx1 + lr, by0 - lr, by1 + lr));
        zt += K.luftM;
        const zb = z0 - K.luftM;
        S.v.set(cx, cy, zt).applyMatrix4(S.basis);
        lw.position.copy(S.v);
        lw.target.position.copy(S.v).add(S.dir);
        lw.updateMatrixWorld();
        lw.target.updateMatrixWorld();
        const c = sh.camera;
        c.left = -W / 2;
        c.right = W / 2;
        c.bottom = -H / 2;
        c.top = H / 2;
        c.near = 0;
        c.far = zt - zb;
        c.updateProjectionMatrix();
        if (sh.anazhBoxM) sh.anazhBoxM.set(W, H);
        sh.anazhTiefeM = zt - zb;
        this._schattenBias(lw, Math.max(tx, ty), zt - zb);
        const f = alt || { basisInv: new THREE.Matrix4() };
        f.basisInv.copy(S.basisInv);
        f.x0 = bx0;
        f.x1 = bx1;
        f.y0 = by0;
        f.y1 = by1;
        f.zb = zb;
        f.zt = zt;
        f.W = W;
        f.H = H;
        f.texel = tx;
        f.texelMin = Math.min(tx, ty); // der feinere Texel der Karte (die Stufe der Sonne, der Licht-Rand)
        // DER LÄNGSTE LICHT-WEG der Box (die Stufe der Sonne, `_sonnenStufe`): ein Schatten fällt vom Werfer (höchstens
        // `S.werferY`, eben von `_kaskadenWerferOben` über dieser Box gemessen) zum Empfänger (wenigstens der tiefste Punkt der
        // Scheibe) — sein Weg entlang des Lichts ist der Fall geteilt durch die Höhe des Lichts, nie länger als die Box tief.
        let yTief = Infinity;
        for (let k = 0; k < n; k++) if (S.punkte[k].y < yTief) yTief = S.punkte[k].y;
        const hoch = -S.dir.y;
        const fall = Math.max(0, S.werferY - yTief);
        f.weg = hoch > 0 ? Math.min(zt - zb, fall / hoch) : zt - zb;
        f.band0 = S.band0;
        f.band1 = S.band1;
        f.bild = (f.bild || 0) + 1;
        // DIE WAHL-SCHEIBE (`_passTrifft`): die Scheibe dieses Renders (S.ecken, eben von `_kaskadenScheibe` gelegt) — gegen
        // sie wählt der Kaskaden-Pass jeden Werfer (Zelle, Bündel-Werfer, Instanz) nach der Licht-Kapsel, `_kaskadeDeckt` hält sie.
        if (!f.ebenen) f.ebenen = Array.from({ length: 6 }, () => new THREE.Plane());
        this._scheibenEbenen(S.ecken, f.ebenen, S.v);
        const saum = AnazhRealm.PASS_WAHL.saumM;
        f.saum = saum[Math.min(i, saum.length - 1)];
        return f;
    }

    // Der höchste Werfer über der Licht-Raum-Box [bx0,bx1]×[by0,by1] (Licht-z, zum Licht hin wachsend): die
    // Werfer-Hüllen (Bundles und Boden-Satz, ihre acht Ecken) und die freien Werfer außerhalb davon — Tiere, Spieler,
    // Inseln, Bauplan-Bauten als eigene Gruppe.
    _kaskadenWerferOben(huellen, S, bx0, bx1, by0, by1) {
        let zt = -Infinity;
        let yTop = -Infinity; // die Welt-Höhe des höchsten Werfers über der Box (`S.werferY`, der Licht-Weg der Stufe)
        const v = S.v;
        for (const h of huellen) {
            let lx0 = Infinity,
                lx1 = -Infinity,
                ly0 = Infinity,
                ly1 = -Infinity,
                lz1 = -Infinity;
            for (let e = 0; e < 8; e++) {
                v.set(e & 1 ? h.max.x : h.min.x, e & 2 ? h.max.y : h.min.y, e & 4 ? h.max.z : h.min.z);
                v.applyMatrix4(S.basisInv);
                if (v.x < lx0) lx0 = v.x;
                if (v.x > lx1) lx1 = v.x;
                if (v.y < ly0) ly0 = v.y;
                if (v.y > ly1) ly1 = v.y;
                if (v.z > lz1) lz1 = v.z;
            }
            if (lx1 < bx0 || lx0 > bx1 || ly1 < by0 || ly0 > by1) continue;
            if (lz1 > zt) zt = lz1;
            if (h.max.y > yTop) yTop = h.max.y;
        }
        const st = this.state;
        const frei = (x, y, z, r) => {
            v.set(x, y, z).applyMatrix4(S.basisInv);
            if (v.x + r < bx0 || v.x - r > bx1 || v.y + r < by0 || v.y - r > by1) return;
            if (v.z + r > zt) zt = v.z + r;
            if (y + r > yTop) yTop = y + r;
        };
        // jeder Leib im Bild wirft: die Wesen und die Gefallenen (ein Leichnam liegt mit Schatten, bis er versunken ist)
        for (const liste of [st.creatures || [], st.leichname || []])
            for (const cr of liste)
                if (cr && cr.visible !== false) frei(cr.position.x, cr.position.y, cr.position.z, 6);
        if (st.playerMesh) frei(st.playerMesh.position.x, st.playerMesh.position.y, st.playerMesh.position.z, 4);
        for (const is of st.floatingIslands || []) {
            const g = is && is.geometry;
            if (!g) continue;
            if (!g.boundingSphere) g.computeBoundingSphere();
            const bs = g.boundingSphere;
            frei(is.position.x + bs.center.x, is.position.y + bs.center.y, is.position.z + bs.center.z, bs.radius);
        }
        // Bauplan-Bauten, die als eigene Gruppe in der Szene stehen (kein Bundle, kein Instanz-Satz): ihre Welt-Kugel,
        // einmal je Lage gerechnet (gate:schatten-werfer W6 nennt jede Werfer-Klasse, die hier fehlt).
        for (const e of st.architectures || []) {
            const m = e && e.mesh;
            if (!m || m.parent !== st.scene || m.visible === false) continue;
            const k = this._werferKugel(m);
            if (k) frei(k.center.x, k.center.y, k.center.z, k.radius);
        }
        S.werferY = yTop;
        return zt;
    }

    // Die Welt-Kugel eines freien Werfers (Gruppe), gecacht je Lage und Kinderzahl; null = leer.
    _werferKugel(m) {
        const ud = m.userData;
        const mw = m.matrixWorld.elements;
        if (
            ud._wfKugel !== undefined &&
            ud._wfKx === mw[12] &&
            ud._wfKy === mw[13] &&
            ud._wfKz === mw[14] &&
            ud._wfKn === m.children.length
        )
            return ud._wfKugel;
        const box = new THREE.Box3().setFromObject(m);
        ud._wfKugel = box.isEmpty() ? null : box.getBoundingSphere(new THREE.Sphere());
        ud._wfKx = mw[12];
        ud._wfKy = mw[13];
        ud._wfKz = mw[14];
        ud._wfKn = m.children.length;
        return ud._wfKugel;
    }

    // DIE KASKADEN-GEBURT (ersetzt `CSMShadowNode._init` je Instanz, die Vendor-Datei bleibt unberührt): das Addon legt
    // beim ersten Material-Bau die Kaskaden-Lichter und ihre Schatten-Knoten an; DANACH, noch vor dem Bau der Karten-
    // Ziele, setzt der Host Größe und Format. Nichts wird später umgebaut: eine Karte, die nach dem ersten Frame
    // wechselt, risse jedes aufgezeichnete Render-Bundle (seine Bind-Gruppe hält die alte Textur — gemessen 04.10.:
    // „Destroyed texture used in a submit").
    _kaskadenGeburt(csm, builder) {
        THREE.CSMShadowNode.prototype._init.call(csm, builder);
        csm.lights.forEach((lw, i) => {
            const sh = lw.shadow;
            sh.anazhBoxM = new THREE.Vector2(1, 1);
            sh.anazhTiefeM = 1;
            sh.filterNode = this._schattenFilter(i);
        });
        this._kaskadenKarten(csm);
        this._kaskadenZiele(csm);
    }

    // DAS SCHATTEN-GESETZ DER SONNEN-SCHEIBE (schatten.K1, die Kontakt-Härtung) — der EINE Filter jeder Kaskade
    // (`shadow.filterNode`: r184 `ShadowNode.setupShadow` nimmt ihn vor dem Filter des Karten-Typs, gate:vendor-anker). Der
    // Halbschatten ist so breit, wie die Sonne (`sonneTan`, 0,53°) ihn über den Abstand Werfer → Empfänger zieht, auf dem Boden
    // von `filterTexel` Texeln der Karte: die Werfer sucht er im Umkreis `sucheM` der Kaskade (5 Vogel-Punkte, Karten-Tiefen ohne
    // Vergleich), ihr Mittel längs des Lichts in Metern (`anazhTiefeM`, orthographisch linear); dann der Vergleich wie r184-PCF
    // (5 Vogel-Punkte, gedreht je Bildpunkt) im Radius Halbschatten/2 + Boden — die Sonne weicht ab dem ersten Zentimeter
    // Abstand (schatten.K1#2: unter max(Halbschatten/2, Boden) trug der Boden jede Kante bis 4,9 m gleich breit). Ohne Suche (k0 ab 15 m, k1: `sucheM` 0; WebGL2:
    // GLSL lädt keine Tiefe aus sampler2DShadow, gate:webgl-probe W5) bleibt der Boden-Radius, der r184-PCF. Box + Tiefe: `_kaskadeFit`.
    _schattenFilter(i) {
        const T = THREE.TSL;
        const K = AnazhRealm.SCHATTEN_KASKADE;
        const je = (l) => l[Math.min(i, l.length - 1)];
        const sucheM = je(K.sucheM);
        return T.Fn(({ depthTexture, shadowCoord, shadow }, builder) => {
            const ref = (n, t) => T.reference(n, t, shadow).setGroup(T.renderGroup);
            const [box, karte] = [ref("anazhBoxM", "vec2"), ref("mapSize", "vec2")];
            const phi = T.interleavedGradientNoise(T.screenCoordinate.xy).mul(6.28318530718);
            const z = shadowCoord.z;
            const vogel = (k, r) => shadowCoord.xy.add(T.vogelDiskSample(k, 5, phi).mul(r));
            let r = T.vec2(je(K.filterTexel)).div(karte);
            if (sucheM > 0 && builder.renderer.backend.isWebGPUBackend === true) {
                const summe = T.float(0).toVar();
                const zahl = T.float(0).toVar();
                for (let k = 0; k < 5; k++) {
                    const d = T.textureLoad(
                        depthTexture,
                        vogel(k, T.vec2(sucheM).div(box)).clamp(0, 1).mul(karte).min(karte.sub(1))
                    );
                    const wirft = builder.renderer.reversedDepthBuffer === true ? d.greaterThan(z) : d.lessThan(z);
                    summe.addAssign(T.select(wirft, d, 0));
                    zahl.addAssign(T.select(wirft, 1, 0));
                }
                const abstand = z
                    .sub(summe.div(zahl.max(1)))
                    .abs()
                    .mul(ref("anazhTiefeM", "float"));
                const halb = T.select(zahl.greaterThan(0), abstand.mul(K.sonneTan * 0.5).min(sucheM), 0);
                r = T.vec2(halb).div(box).add(r);
            }
            let s = T.texture(depthTexture, vogel(0, r)).compare(z);
            for (let k = 1; k < 5; k++) s = s.add(T.texture(depthTexture, vogel(k, r)).compare(z));
            return s.mul(0.2);
        });
    }

    // DIE KARTEN-GRÖSSE aus der Texel-Dichte (einmal, am Standard-Bereich PERF_SHADOW_RANGE_MAX,
    // Bezugs-Seitenverhältnis `bezugAspekt`): die Scheibe des Referenz-Blicks (Kamera waagrecht, Licht im Zenit —
    // Breite = Frustum-Breite am fernen Rand, Tiefe = Scheiben-Tiefe, beide mit Fade-Saum) liegt in der FESTEN
    // Licht-Basis je nach Blickrichtung gedreht; ihre Box ist höchstens so lang wie ihre Diagonale (Drehung um 45°
    // gegen die Basis). Die Karte trägt diese längste Kante bei `texelM` — quadratisch, eine Zweierpotenz (gedeckelt
    // auf karteMax). Eine Flächen-Regel (√(Breite·Tiefe)) gab k1 1024 und damit auf der langen Achse 0,84 m je Texel
    // statt 0,47 (gemessen 04.10., Prüfer W7): ferne Schatten in Blickbreite wurden 1,8-fach gröber als beim Addon.
    // 306 m Reichweite, 75° · 16:9: k0 308 × 113 m (Diagonale 328 m) → 2048, k1 835 × 203 m (859 m) → 2048. Eine
    // Eigenschaft des Inhalts, nie des Fensters.
    _kaskadenKarten(csm) {
        const K = AnazhRealm.SCHATTEN_KASKADE;
        const cam = csm.camera;
        const far = AnazhRealm.PERF_SHADOW_RANGE_MAX * AnazhRealm.SCHATTEN_FERN_FAKTOR;
        const br = [];
        csm.customSplitsCallback(csm.cascades, cam.near, far, br);
        const halb = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * K.bezugAspekt;
        const saum = [0, 1];
        const groessen = [];
        for (let i = 0; i < csm.lights.length; i++) {
            this._kaskadenSaum(br, i, csm.fade === true, saum);
            const dA = cam.near + saum[0] * (far - cam.near);
            const dB = cam.near + saum[1] * (far - cam.near);
            const texel = K.texelM[Math.min(i, K.texelM.length - 1)];
            const bedarf = Math.hypot(2 * halb * dB, dB - dA) / texel;
            const n = Math.min(K.karteMax, 2 ** Math.ceil(Math.log2(Math.max(1, bedarf))));
            csm.lights[i].shadow.mapSize.set(n, n);
            groessen.push(n);
        }
        csm._anazhKarten = groessen;
        return groessen;
    }

    // DIE SCHLANKEN KARTEN-ZIELE: r184 legt jede Schatten-Karte als Render-Ziel mit rgba8-Farbe + depth24plus an
    // (ShadowNode.setupRenderTarget). Die Farbe liest der Schatten-Filter nur mit `renderer.shadowMap.transmitted` (aus) —
    // der Ziel-Zensus (`werkbank ziele`, 07.10., GTX 1060, Mess-Wiese, 12 Frames) nannte sie OHNE LESER: kaskade0:farbe
    // und kaskade1:farbe, je r8 2048² = 4 MB, geschrieben in k0/k1, gelesen von keinem Pass. Darum trägt die Karte auf
    // WebGPU KEINE Farbe: das Ziel behält sein Textur-Objekt (r184 liest Größe, Farbraum und Ton-Abbildung des Ziels daraus
    // — `Textures.updateRenderTarget` misst `textures[0]`, `currentColorSpace` liest `texture`), aber die GPU legt es nie an
    // (`updateTexture` überspringt es), und die Ziel-Daten tragen eine LEERE Farb-Liste: der Pass-Deskriptor baut keinen
    // Farb-Anhang, der Pipeline-Bau keine Farb-Ziele (eine reine Tiefen-Pipeline — ein Fragment-Ergebnis ohne Ziel verwirft
    // WebGPU), und Format und Farbraum des Kontexts sind auf der leeren Liste null (r184 las dort blind `textures[0]`, das
    // war der Grund für r8). Eine geteilte Farbe beider Kaskaden trug r184 nicht (W7: „Destroyed texture used in a submit")
    // — jetzt gibt es keine. Der WebGL2-Rückfall bindet `textures[0]` selbst an seinen Framebuffer: dort bleibt r8. Die Tiefe
    // trägt 16 bit (die enge Box spannt ≤ 650 m Licht-Tiefe: ≤ 1 cm je Stufe). Der Knoten baut sein Ziel durch diese Hülle —
    // Format, Name und die Farb-Freiheit stehen, bevor die GPU es je belegt. gate:vendor-anker pinnt jede gelesene r184-
    // Stelle, gate:ziel-zensus hält die Klasse, gate:schatten-werfer Z1 das Ziel.
    _kaskadenZiele(csm) {
        const rend = this.state.renderer;
        if (
            rend &&
            !rend._isHeadlessNull &&
            rend.backend &&
            rend.backend.isWebGPUBackend === true &&
            !rend.__anazhOhneFarbe
        ) {
            const T = rend._textures;
            const U = rend.backend.utils;
            if (
                !T ||
                typeof T.updateRenderTarget !== "function" ||
                typeof T.updateTexture !== "function" ||
                !U ||
                typeof U.getCurrentColorFormat !== "function" ||
                typeof U.getCurrentColorSpace !== "function"
            )
                this.log(
                    "KASKADEN-ZIELE: r184 Textures/Backend-Utils fehlen (Vendor-Drift) — die Karten tragen Farbe",
                    "ERROR"
                );
            else {
                const KEINE = Object.freeze([]);
                const zielRoh = T.updateRenderTarget;
                T.updateRenderTarget = function (ziel, stufe) {
                    const o = zielRoh.call(this, ziel, stufe);
                    if (ziel.__anazhOhneFarbe === true) this.get(ziel).textures = KEINE;
                    return o;
                };
                const texRoh = T.updateTexture;
                T.updateTexture = function (t, o) {
                    if (t.__anazhOhneGpu === true) return undefined;
                    return texRoh.call(this, t, o);
                };
                const formatRoh = U.getCurrentColorFormat;
                U.getCurrentColorFormat = function (ctx) {
                    return ctx.textures !== null && ctx.textures.length === 0 ? null : formatRoh.call(this, ctx);
                };
                const raumRoh = U.getCurrentColorSpace;
                U.getCurrentColorSpace = function (ctx) {
                    return ctx.textures !== null && ctx.textures.length === 0 ? null : raumRoh.call(this, ctx);
                };
                rend.__anazhOhneFarbe = true;
            }
        }
        const ohneFarbe = !!(rend && rend.__anazhOhneFarbe === true);
        const knoten = csm._shadowNodes || [];
        for (let i = 0; i < knoten.length; i++) {
            const sn = knoten[i];
            if (!sn || typeof sn.setupRenderTarget !== "function") {
                // laut statt still: ohne die r184-Stelle bliebe die Karte rgba8 + depth24plus (gate:vendor-anker pinnt
                // sie)
                this.log(`KASKADEN-ZIELE: Kaskade ${i} ohne ShadowNode.setupRenderTarget (Vendor-Drift)`, "ERROR");
                continue;
            }
            const roh = sn.setupRenderTarget;
            sn.setupRenderTarget = (shadow, builder) => {
                const z = roh.call(sn, shadow, builder);
                z.shadowMap.texture.format = THREE.RedFormat;
                z.shadowMap.texture.name = "kaskade" + i + ":farbe";
                if (ohneFarbe) {
                    z.shadowMap.__anazhOhneFarbe = true;
                    z.shadowMap.texture.__anazhOhneGpu = true;
                }
                z.depthTexture.type = THREE.UnsignedShortType;
                z.depthTexture.name = "kaskade" + i + ":tiefe";
                return z;
            };
        }
    }

    // DIE WURF-EBENE (K72): der Wurf eines Knotens IST ein Bit seiner Ebenen — `castShadow` liest und schreibt das Bit
    // SHADOW_TWIN_LAYER (ein Accessor am Prototyp von THREE.Object3D; r184 weist `castShadow` im Konstruktor NACH den Ebenen
    // zu, `copy` beide, gate:vendor-anker), und die Schatten-Kamera sieht NUR diese Ebene (Licht-Setup). r184 testet die
    // Ebene in `_projectObject` VOR Frustum, Liste und Sortierung: ein Nicht-Werfer kostet den Kaskaden-Render einen Ebenen-
    // Test statt Projektion, Fassade, Listen-Platz, Sortier-Schritt und den Ruf der Schatten-Funktion, die ihn erst dort
    // verwarf. Befund 15.10. (Radeon, Zerlegung je Kaskaden-Render, Third): Genesis k0 72 Nicht-Werfer neben 42 Werfern in
    // der Liste, k1 47 neben 8; Wiese 39–48. Der Zwilling ist ein Werfer ohne Ebene 0 (nur die Kaskaden sehen ihn); wer die
    // Ebenen des Auges schaltet, lässt das Wurf-Bit stehen. Ein eigenes Wurf-Feld neben der Ebene gibt es nicht: der
    // Accessor steht, bevor die Welt ihren ersten Knoten baut (Konstruktor), gate:schatten-werfer W10 nennt jeden Knoten der
    // Szene, der ein eigenes Feld trägt oder für die Kaskade gesehen ≠ wirft ist.
    // JEDES LICHT liegt auf der Wurf-Ebene, sein `castShadow` ist sein eigenes Wort (`_wurfLicht`): r184 hält EINEN Lichter-
    // Knoten je Szene (`Lighting.getNode(scene)`, gate:vendor-anker), und der Schatten-Pass läuft MITTEN im Hauptbild — sähe
    // die Kaskade ein anderes Licht-Set als das Auge, setzte ihr Pass den geteilten Knoten um, und alles danach Gezeichnete
    // verlöre die übrigen Lichter (gate:ego-schatten 15.10.: die Bühne ohne ihr Umgebungslicht, Boden 145 → 98).
    static _wurfEbene() {
        const P = THREE.Object3D.prototype;
        const d = Object.getOwnPropertyDescriptor(P, "castShadow");
        if (d && typeof d.get === "function") return;
        const W = 1 << AnazhRealm.SHADOW_TWIN_LAYER;
        Object.defineProperty(P, "castShadow", {
            configurable: true,
            enumerable: true,
            get() {
                return (this.layers.mask & W) !== 0;
            },
            set(v) {
                const l = this.layers;
                l.mask = (v ? l.mask | W : l.mask & ~W) >>> 0;
            },
        });
        Object.defineProperty(THREE.Light.prototype, "castShadow", {
            configurable: true,
            enumerable: true,
            get() {
                return this._wurfLicht === true;
            },
            set(v) {
                this._wurfLicht = !!v;
                this.layers.mask = (this.layers.mask | W) >>> 0;
            },
        });
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
            S.m.copy(kamera.projectionMatrix);
            if (kamera.isPerspectiveCamera === true) S.m.elements[8] = S.m.elements[9] = 0;
            S.m.multiply(kamera.matrixWorldInverse);
            S.frustum.setFromProjectionMatrix(S.m, kamera.coordinateSystem);
            if (kamera.isPerspectiveCamera === true) this._passMatrixWeit(S.m, kamera, AnazhRealm.PASS_WAHL.drehRand);
            this._passWahlLage(S, kamera, k);
        }
        const L = S.lage;
        // Die Instanz-Wahl: die Gruppen der Wahl (Baum- und Strauch-Stufen, die Karten) zeichnen in diesem Pass nur ihre
        // gewählten Instanzen, danach wieder alle.
        if (nach) {
            if (kamera === this.state.camera) this._instanzWahlZurueck(S.wahlHaupt);
            else if (this._schattenKameraIndex(kamera) >= 0) this._instanzWahlZurueck(S.wahlSchatten);
        } else if (k >= 0) this._instanzWahlPass("schatten", S);
        else if (kamera === this.state.camera) this._instanzWahlPass("haupt", S);
        // die Wahl der GPU: die Arenen ihrer Senken legen die Aufträge dieses Passes, EIN Compute zählt sie (nach dem Takt)
        if (!nach) this._instanzWahlGpu(kamera, S);
        // Die Sätze (Boden · Wasser · Bau · Streu) wählen ihren Abschnitt nach demselben Gesetz.
        this._chunkSatzPass(kamera, nach, k, S);
        // Die Nah-Wiese legt ihren Satz für das Auge dieses Passes (eine Kaskade sieht sie nie: sie wirft nicht).
        if (!nach && k < 0) this._nahWieseSicht(kamera, L);
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
    // solange seine Lage (`L.gen`), sein Werfer-Stand (`_bundleWerferHuelle`) und die Instanz-Wahl dieses Passes stehen
    // (`S.wahlNeu` — sie schaltet die Sicht der Wahl-Gruppen, die dieser Gang liest): kein Gang über die Kinder, keine
    // Prüfung, nur die gemerkte Wahl. Gemessen 15.10. (Radeon, Genesis/Wiese Third, Ruhe): je Kaskaden-Render 18–37
    // Prüfungen in 22 Gängen, in jedem Render dieselbe Wahl.
    _werferWahlPass(map, S) {
        const L = S.lage,
            ab = S.ab;
        const instanzSteht = S.wahlNeu === 0;
        let n = 0;
        for (const bg of map.values()) {
            const h = this._bundleWerferHuelle(bg);
            const u = bg.userData;
            const je = u._werferJe || (u._werferJe = new Map());
            let w = je.get(L.key);
            if (instanzSteht && w && w.gen === L.gen && w.stand === u._werferStand) {
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
                dreh: 0,
                licht: 0,
                gen: 0,
                key: "",
            });
        const we = kamera.matrixWorld.elements;
        const PW = AnazhRealm.PASS_WAHL;
        L.fr = S.frustum;
        L.ax = we[12];
        L.ay = we[13];
        L.az = we[14];
        L.rand = PW.sichtRand;
        // der Halt (`_passLageGen`): die Ebenen und das Auge wandern um höchstens haltM, der Rand je Meter mit dem Auge
        L.halt = PW.haltM * (1 + PW.sichtRand);
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
        this._passLageGen(L, kamera, k);
        return L;
    }

    // Die Matrix einer Perspektive ohne den Versatz der zeitlichen Auflösung, ihr Sichtfeld je Halbwinkel um 1,5 × `dreh`
    // geweitet: jeder Strahl, den eine um höchstens `dreh` gedrehte Kamera sieht, liegt darin (der Abstand eines Strahls zur
    // Seiten-Ebene wächst um höchstens `dreh`, sein Winkel in der Bild-Achse um höchstens dreh / cos(Höhe) — an den Ecken
    // eines 75°-Bilds 16:9 das 1,1-Fache).
    _passMatrixWeit(aus, kamera, dreh) {
        aus.copy(kamera.projectionMatrix);
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
            const pe = kamera.projectionMatrix.elements;
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
        if (a.gen > 0 && a.kamera === kamera.id && this._passLageHaelt(a.sig, s, a)) {
            L.gen = a.gen;
            L.key = key;
            L.ax = a.ax;
            L.ay = a.ay;
            L.az = a.az;
            // das Auge der Blende hält wie das Auge der Kamera: jeder Leser urteilt vom Auge des Ankers
            L.ex = a.sig[67];
            L.ez = a.sig[68];
            L.licht = a.sig[85];
            if (s[86] > a.wegMax) a.wegMax = s[86];
            return false;
        }
        a.sig.set(s);
        a.kamera = kamera.id;
        a.ax = L.ax;
        a.ay = L.ay;
        a.az = L.az;
        a.wegMax = s[86];
        a.gen = this._passLageZahl = (this._passLageZahl || 0) + 1;
        L.gen = a.gen;
        L.key = key;
        return true;
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
            if (!this._blendeHaelt(a, s)) return false;
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
        if (!steht(Math.sqrt(dx * dx + dy * dy + dz * dz))) return false;
        const persp = s[84] === 1;
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
            if (!this._wahlHaelt(dreh, 1, PW.drehRand)) return false;
        } else for (let i = 75; i < 84; i++) if (!(Math.abs(s[i] - a[i]) <= 1e-9)) return false;
        return this._blendeHaelt(a, s);
    }

    // HÄLT DIE BLENDE (66…74) gegen ihren Anker? Ihr Auge (das Auge jeder Maske, `uLodAuge` in XZ — 67, 68) ist ein Ort der
    // Lage wie das Auge der Kamera: es hält nach dem Gesetz des Halts, höchstens den halben Halt vom Anker (`_wahlHaelt` gegen
    // haltM); an, Perf-Streck, Bezug und die Kanten des Blend-Gesetzes gleich. Das Fenster jeder Wahl trägt den Halt als
    // Rand (`_instanzFenster`), und unter der gehaltenen Lage urteilt jeder Leser vom Auge des Ankers (`_passLageGen`).
    // Gegenprüfung 07.10.: der Vergleich war exakt — eine zweite Signatur neben dem Halt-Gesetz; atmete das Auge ±1 mm
    // quer (die Kamera hielt), wählte jeder Pass in jedem Frame jede Wahl neu (gate:sicht-arbeit, atmendes Auge: 14 999
    // Prüfungen je Frame).
    _blendeHaelt(a, s) {
        if (s[66] !== a[66]) return false;
        if (!this._wahlHaelt(Math.hypot(s[67] - a[67], s[68] - a[68]), 1, AnazhRealm.PASS_WAHL.haltM)) return false;
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

    // DIE INSTANZ-WAHL JE PASS (Welle 7). Befund 06.10. (echte GPU, Mess-Wiese, Band in Ruhe, fester Blick): die Baum-
    // Gruppen sind global (eine Instanz-Gruppe je Art × Gestalt × Stufe × Teil, ein Befehl je Pass), und jeder Pass zog JEDE
    // Instanz — das Hauptbild 380k Baum-Dreiecke, davon im Blick 251k (yaw 0) bzw. 164k (yaw −0,88); jede Kaskade jeden
    // Zwilling (k0 182k, k1 blickabhängig 14k oder 182k); und die Stufen-Bänder der CPU (Hysterese ±3,4 m AUSSERHALB der
    // Dither-Fenster) hielten Stufen, deren Maske vom Auge alles verwirft (eine L0 jenseits d0 kostet 17k Dreiecke je Tanne
    // und zeigt nichts). Ebenso die EINE Atlas-Gruppe der Karten: im @global-Bündel zeichnete sie jede Karte des Rings (1 889
    // Karten bis 385 m, ein Drittel im Blick) — sie ist eine Gruppe der Wahl wie jede Pflanzen-Stufe (W7-Vereinigung: ihre
    // Senken-Kopie je Sicht fiel). Jeder Pass wählt: die Gruppe ordnet ihre Slots (`_archGroupTausch`), die gewählten vorn,
    // und zeichnet nur sie (`count` über `_instanzZahl`); nach dem Pass zählt sie wieder alle (die Slot-Wahrheit: count =
    // liveCount außerhalb jedes Passes). Gewählt ist, was (1) das EINE Gesetz der Pass-Wahl trifft (`_passTrifft`: Kugel der
    // Instanz gegen das Frustum, im Schatten-Pass ihre Licht-Kapsel gegen die Scheibe) und (2) dessen Stufen-Maske vom Auge
    // etwas behält (`_instanzFenster` — nur, wenn der Stoff die Maske trägt). Eine Gruppe zeichnet in genau EINER Pass-Art
    // (`_instanzWahlArt`): so schreibt kein Pass die Puffer eines anderen, auch nicht der Kaskaden-Pass mitten im
    // Hauptbild. Das Hauptbild nimmt sein Bündel neu auf, wenn die Wahl sich ändert (Zahl oder Ordnung); die Kaskaden
    // zeichnen Bündel-Kinder direkt.
    // `S.wahlNeu` zählt die Gruppen, deren Wahl dieser Pass neu legte oder fallen ließ (0: die Wahl des Passes stand ganz —
    // die Werfer-Wahl liest die Sicht der Wahl-Gruppen und hält ihre Wahl nur dann, `_werferWahlPass`).
    _instanzWahlPass(art, S) {
        const set = this._instanzWahlGruppen();
        const liste = art === "haupt" ? S.wahlHaupt : S.wahlSchatten;
        if (liste.length) this._instanzWahlZurueck(liste); // ein Pass ohne Nachher-Haken (Abbruch) hinterlässt nichts
        S.wahlNeu = 0;
        // die Arenen der Bündel lesen die Wahl des Hauptbilds (G1, `_arenaTakt`): ihre Plätze ziehen, was sie eben legte
        if (set.size === 0) return void (art === "haupt" && this._arenaTakt());
        const L = S.lage;
        for (const g of set) {
            if (g.wahl !== art) continue;
            const m = g.mesh;
            const n = g.liveCount | 0;
            if (!m || n === 0 || m.visible === false) {
                // Eine leere oder verborgene Gruppe zeichnet in diesem Pass nichts: ihre gehaltene Wahl fällt mit (die
                // nächste sichtbare Belegung wählt neu). Sonst hielt sie die Marke eines freigegebenen Slots — CI 07.10.,
                // gate:sicht-arbeit (I): der Stufen-Wechsel einer einzelnen Erle 1→0 leerte f:weide|1|1:0#S, k0 und k1
                // hielten Slot −1.
                if (g._wahlJe && L && g._wahlJe.delete(L.key)) S.wahlNeu++;
                continue;
            }
            // die Wahl steht (Welle C): die Gruppe liegt (wieder), wie dieser Pass sie zuletzt ordnete
            if (this._instanzWahlSteht(g, L)) {
                AnazhRealm._instanzZahl(m, g._wahlJe.get(L.key).refs.length);
                liste.push(g);
                continue;
            }
            S.wahlNeu++;
            const fenster = L.an && this._instanzFensterGilt(g);
            let kk = 0,
                tausch = 0;
            for (let i = 0; i < n; i++) {
                if (!this._instanzBehalten(g, i, L, fenster)) continue;
                if (i !== kk) {
                    this._archGroupTausch(g, i, kk);
                    tausch++;
                }
                kk++;
            }
            AnazhRealm._instanzZahl(m, kk);
            liste.push(g);
            if (art === "haupt" && !m.__arena && (tausch > 0 || g._wahlZahl !== kk)) this._archMeshBundleTouch(m); // die Arena liest die Wahl im Takt (G1)
            if (art === "haupt") g._wahlZahl = kk;
            this._instanzWahlMerke(g, L, kk);
        }
        if (art === "haupt") this._arenaTakt();
    }

    // STEHT die Wahl einer Gruppe (Welle C)? Dieser Pass (`L.key`: haupt · k<i>) wählte sie zuletzt in derselben Lage
    // (`L.gen`), ihr SLOT-STAND ist der, den er dabei merkte (`_instanzSlotStand`), und Geometrie, Stoff und Zahl sind dieselben.
    // Eine Schatten-Gruppe ordnen BEIDE Kaskaden eines Frames (ein Puffer, zwei Präfixe): hat die andere sie umgeordnet, rücken
    // die gemerkten Instanzen dieses Passes (ihre Slot-Marken, `slotRef`) wieder nach vorn — ein Tausch je verschobene, keine
    // Prüfung. Gegenprüfung 07.10.: bis hier merkte die GRUPPE die Version ihrer Slots nach der letzten Wahl (`_wahlVer`) —
    // ordnete k0 nach einem fremden Schreiber neu (der Stufen-Wechsel eines Baums: Freigeben + Belegen, die Zahl bleibt), fand
    // k1 alles gleich und hielt ihre alten Marken, darunter eine freigegebene (Slot −1): der Tausch schrieb NaN in einen
    // lebenden Slot und warf in jedem Frame dieser Kaskade (gate:sicht-arbeit (I): 2 Würfe, 2 NaN-Slots, 1 fehlender Werfer).
    _instanzWahlSteht(g, L) {
        const w = g._wahlJe ? g._wahlJe.get(L.key) : null;
        if (!w || w.gen !== L.gen) return false;
        const m = g.mesh;
        const jetzt = this._instanzSlotStand(g, this._slotStandJetzt || (this._slotStandJetzt = {}));
        if (
            jetzt.belegt !== w.belegt ||
            jetzt.im !== w.im ||
            jetzt.vMat !== w.vMat ||
            jetzt.vKarte !== w.vKarte ||
            w.geo !== m.geometry ||
            w.mat !== g.mat ||
            w.live !== (g.liveCount | 0)
        )
            return false;
        // DIE ORDNUNG STEHT (K72): tauschte seit der Wahl dieses Passes niemand einen Slot der Gruppe (`_archGroupTausch`
        // zählt `g._ordnung`), liegen ihre gemerkten Instanzen noch vorn — kein Gang über die Marken
        if (w.ordnung === (g._ordnung | 0)) return true;
        const refs = w.refs;
        let tausch = 0;
        for (let j = 0; j < refs.length; j++) {
            const i = refs[j].slot;
            if (i === j) continue;
            this._archGroupTausch(g, i, j);
            tausch++;
        }
        w.ordnung = g._ordnung | 0;
        if (tausch > 0 && g.wahl === "haupt" && !m.__arena) this._archMeshBundleTouch(m);
        return true;
    }

    _instanzWahlMerke(g, L, kk) {
        const je = g._wahlJe || (g._wahlJe = new Map());
        let w = je.get(L.key);
        if (!w)
            je.set(
                L.key,
                (w = {
                    gen: 0,
                    geo: null,
                    mat: null,
                    live: 0,
                    refs: null,
                    belegt: 0,
                    im: null,
                    vMat: 0,
                    vKarte: 0,
                    ordnung: -1,
                })
            );
        const m = g.mesh;
        w.gen = L.gen;
        w.geo = m.geometry;
        w.mat = g.mat;
        w.live = g.liveCount | 0;
        w.refs = g.slotRef.slice(0, kk);
        w.ordnung = g._ordnung | 0;
        this._instanzSlotStand(g, w);
    }

    // DER SLOT-STAND einer Instanz-Gruppe (Welle C) — was ihre Slots trägt, ohne die Ordnung der Wahl: Belegen, Freigeben und
    // Stempel (`g.slotStand`), der Puffer ihrer Instanz-Matrizen und die Versionen der Matrizen und des Karten-Stempels, von
    // denen die Tausche der Wahl abgezogen sind (`_archGroupTausch` zählt, was sie selbst hebt). Ihn hebt jeder fremde
    // Schreiber — auch eine Tür, die schwingt —, nie die Wahl eines Passes; jeder Pass merkt ihn in seiner Wahl. Schreibt den
    // Stand in `aus`.
    _instanzSlotStand(g, aus) {
        const m = g.mesh;
        const ak = m.geometry.attributes.aKarte;
        aus.belegt = g.slotStand | 0;
        aus.im = m.instanceMatrix;
        aus.vMat = m.instanceMatrix.version - (g._tauschMat | 0);
        aus.vKarte = ak ? ak.version - (g._tauschKarte | 0) : -1;
        return aus;
    }

    _instanzWahlZurueck(liste) {
        for (let i = 0; i < liste.length; i++) {
            const g = liste[i];
            if (g.mesh) AnazhRealm._instanzZahl(g.mesh, g.liveCount | 0);
        }
        liste.length = 0;
    }

    _instanzWahlGruppen() {
        return this._wahlGruppen || (this._wahlGruppen = new Set());
    }

    // Welche Gruppe je Pass wählt: eine GLOBALE Gruppe, die in genau EINER Pass-Art zeichnet — die Pflanzen-Stufe (ihre
    // Geometrie trägt den Stufen-Stempel der Studio-Blende, aLodLevel 1 L0 · 2 L1 · 3 Zwilling/einzige Nah-Stufe, und die
    // Instanz-Fassade aH0): der Zwilling (SHADOW_TWIN_LAYER) nur in den Kaskaden, die Stufe ohne Schatten nur im Hauptbild;
    // die Karte (die EINE Atlas-Gruppe, ihr Quad trägt aKarte) wirft nie und zeichnet im Hauptbild. Eine Gruppe, die in
    // beiden zeichnet, teilte ihre Puffer zwischen den Pässen eines Frames — sie zeichnet weiter jede Instanz.
    // "gpu": JEDE Senke eines Gang-Satzes (`aGang`) — Haut, Kleid und Wurf der Bewohner, Fell, Glimmen, Rest und Wurf der
    // Tiere — wählt auf der GPU (`_instanzWahlGpu`), in jedem Pass, der sie zieht: das Auge im Frustum, der Wurf je Kaskade
    // mit seiner Licht-Kapsel. Sie betritt keine Gruppe der CPU-Wahl; die CPU-Wahl (`_instanzWahlPass`) trägt nur noch die
    // Pflanzen-Stufen und die Karte (ihr Fenster der Blende liest aH0 · aKarte).
    _instanzWahlArt(leaf, castShadow, regional) {
        if (regional || !leaf || leaf.tuer) return null;
        const at = leaf.geom && leaf.geom.attributes;
        if (!at) return null;
        if (at.aGang) return "gpu";
        if (leaf.atlasGruppe) return at.aKarte && !castShadow ? "haupt" : null;
        if (!at.aH0 || !at.aLodLevel || !(at.aLodLevel.array[0] >= 1)) return null;
        if (leaf.shadowTwin) return "schatten";
        return castShadow ? null : "haupt";
    }

    // Trägt der Stoff der Gruppe die Maske, deren Fenster die Wahl liest — in dem Kanal, den ihr Pass liest? Die Stufen-
    // Stoffe der Foundry markieren sie am Bau (`userData.foundryCrossfade` samt Kanal: der Schattenpass liest nur die Farbe,
    // nie die Deckung), der Karten-Stoff ebenso (`userData.kartenMaske`, er zeichnet nur im Hauptbild). Ohne Maske zeichnet
    // die GPU jede Instanz voll — ein Fenster schnitte dort ein Loch: die Wahl liest dann nur das Gesetz der Pass-Wahl.
    _instanzFensterGilt(g) {
        const ud = g.mat && g.mat.userData;
        if (!ud) return false;
        if (g.wahlStufe === "karte") return ud.kartenMaske === true;
        return ud.foundryCrossfade === true && (g.wahl === "haupt" || ud.foundryCrossfadeKanal === "farbe");
    }

    // Behält der Pass die Instanz im Slot i? Ihr Körper (die Kugel der Geometrie × Instanz-Matrix + `pflanzeRandM` für den
    // Wind; die Karte: ihr Quad auf der Stammachse, Höhe aKarte.z und Halbbreite aKarte.y × Instanz-Skala, das sich um die
    // Hochachse zum Auge dreht) trifft nach dem EINEN Gesetz; trägt der Stoff die Maske, behält ihr Fenster etwas.
    _instanzBehalten(g, i, L, fenster) {
        const m = g.mesh;
        const a = m.instanceMatrix.array;
        const o = i * 16;
        const mw = m.matrixWorld.elements;
        let cx, cy, cz, r;
        if (g.wahlStufe === "karte") {
            const ak = m.geometry.attributes.aKarte.array;
            const h = ak[i * 4 + 2] * 0.5;
            const hw = ak[i * 4 + 1];
            const s = Math.sqrt(a[o] * a[o] + a[o + 1] * a[o + 1] + a[o + 2] * a[o + 2]);
            cx = a[o + 12] + a[o + 4] * h;
            cy = a[o + 13] + a[o + 5] * h;
            cz = a[o + 14] + a[o + 6] * h;
            r = s * Math.sqrt(h * h + hw * hw);
        } else {
            const geo = m.geometry;
            if (!geo.boundingSphere) geo.computeBoundingSphere();
            const bs = geo.boundingSphere;
            const c = bs.center;
            const s2 = Math.max(
                a[o] * a[o] + a[o + 1] * a[o + 1] + a[o + 2] * a[o + 2],
                a[o + 4] * a[o + 4] + a[o + 5] * a[o + 5] + a[o + 6] * a[o + 6],
                a[o + 8] * a[o + 8] + a[o + 9] * a[o + 9] + a[o + 10] * a[o + 10]
            );
            cx = a[o] * c.x + a[o + 4] * c.y + a[o + 8] * c.z + a[o + 12];
            cy = a[o + 1] * c.x + a[o + 5] * c.y + a[o + 9] * c.z + a[o + 13];
            cz = a[o + 2] * c.x + a[o + 6] * c.y + a[o + 10] * c.z + a[o + 14];
            r = bs.radius * Math.sqrt(s2) + AnazhRealm.PASS_WAHL.pflanzeRandM;
        }
        // in die Welt (die Gruppe hängt an der Szene oder in ihrem Bündel, beide ohne Lage — die Matrix bleibt exakt)
        const wx = mw[0] * cx + mw[4] * cy + mw[8] * cz + mw[12],
            wy = mw[1] * cx + mw[5] * cy + mw[9] * cz + mw[13],
            wz = mw[2] * cx + mw[6] * cy + mw[10] * cz + mw[14];
        if (!this._passTrifft(L, wx, wy, wz, 0, 0, 0, r)) return false;
        return !fenster || this._instanzFenster(g, i, L);
    }

    // DAS FENSTER DER STUFE: behält ihre Maske vom Auge auf der Instanz etwas? Die Maske misst je INSTANZ die Distanz vom
    // Auge zu ihrem Ursprung in XZ × uLodPerf × min(uLodRef/Sichthöhe, 1) (`_instanzMitteNode`, Studio `_iw`; Stufen:
    // Skelett-Metrik aH0, Blatt-Metrik aH0L; die Karte: zu ihrem Anker, Sichthöhe |aKarte.w|, ein negativer Stempel =
    // verdeckt, sie blendet voll) — das Intervall ist der Punkt der Instanz, nur der Halt macht es breit; das Urteil fällt
    // `_blendeBehaelt` an den Kanten des Blend-Gesetzes. Bis 1110-11 maß die Maske je Fragment und das Fenster über die
    // Weite der Gestalt: die L1 einer Birke in 5 m (Krone 10 m) behielt ihre fernen Äste und wurde ganz gezeichnet. Das Auge der
    // Maske hält wie jeder Ort der Lage um den halben Halt (`_blendeHaelt`) — die Distanz trägt den Halt als Rand (`L.halt`,
    // wie `_passTrifft`): eine gehaltene Wahl verliert nichts, solange das Auge atmet.
    _instanzFenster(g, i, L) {
        const m = g.mesh;
        const geo = m.geometry;
        const a = m.instanceMatrix.array;
        const o = i * 16;
        const mw = m.matrixWorld.elements;
        const dx = a[o + 12] + mw[12] - L.ex,
            dz = a[o + 14] + mw[14] - L.ez;
        const d = Math.sqrt(dx * dx + dz * dz);
        const halt = L.halt;
        if (g.wahlStufe === "karte") {
            const ak = geo.attributes.aKarte.array;
            const sicht = ak[i * 4 + 3];
            const k = Math.min(L.ref / Math.max(Math.abs(sicht), 1e-3), 1);
            const dSmin = Math.max(0, d - halt) * L.perf * k,
                dSmax = (d + halt) * L.perf * k;
            return AnazhRealm._blendeBehaelt(L.kanten, "karte", dSmin, dSmax, dSmin, dSmax, sicht < 0);
        }
        const dMin = Math.max(0, d - halt) * L.perf,
            dMax = (d + halt) * L.perf;
        const kS = Math.min(L.ref / Math.max(geo.attributes.aH0.array[i], 1e-3), 1);
        const hL = geo.attributes.aH0L.array[i]; // das Vorzeichen: der Halt der Stufe ohne Partner (sie zeichnet voll)
        const kL = Math.min(L.ref / Math.max(Math.abs(hL), 1e-3), 1);
        return AnazhRealm._blendeBehaelt(L.kanten, g.wahlStufe, dMin * kS, dMax * kS, dMin * kL, dMax * kL, hL < 0);
    }

    // DIE WAHL DER GPU (Rang 7 des Luft-Urteils 28.10., gebaut nach dem Spike gpu-wahl). Befund (Luft-Urteil, Stadt-Gipfel
    // stadt-voll): der Hauptpass zog 1 368k Dreiecke, davon die Klasse bewohner 868k — Haut und Kleid jedes Bewohners im
    // Nah-Kreis, auch hinter dem Blick —, jede Kaskade ihren Wurf ganz (je ~110k): die Senken des Gang-Satzes wählte keine
    // Pass-Art (`_instanzWahlArt` kannte nur Pflanzen-Stufen und Karten). Jetzt wählt eine
    // Arena, deren Senken die Art "gpu" tragen, im Haken jedes Passes, vor seinem Encoder (r184 reicht ihn bei `finishRender`
    // ein, die Queue ordnet: Aufträge · Rechnung · Zug): sie legt die Aufträge dieser Kamera (`_wahlVor`: die Zahl jedes Zugs 0,
    // seine erste Instanz der Abschnitt der Liste dieser Kamera), und EIN Compute je Kamera prüft jede ihrer Instanzen nach dem
    // EINEN Gesetz der Pass-Wahl (`_passTrifft` als WGSL, `PASS_WAHL_WGSL`), schreibt die getroffenen verdichtet in die Liste
    // und zählt die Zahl des Zugs atomar im Auftrags-Puffer der Arena; der Instanz-Knoten liest `matrizen[liste[instance_index]]`
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
            if (arenen.length) this._wahlRechnen(rend, S.lage, arenen);
        } catch (e) {
            this._arenaBruch(e);
        }
    }

    // EIN COMPUTE JE KAMERA: die Lage (`_wahlLage`) und die Aufträge jeder Arena (`_wahlAuftraege`, je Arena ein Block nach der
    // Ausrichtung der Speicher-Versätze) in je EINEM Puffer, je Arena eine Bindegruppe (Matrizen, Liste, Auftrags-Puffer —
    // gemerkt, solange ihre Puffer stehen) und EIN Dispatch (x: die Instanzen zu 64, y: ihre Züge).
    _wahlRechnen(rend, L, arenen) {
        const be = rend.backend,
            dev = be.device,
            U = GPUBufferUsage;
        let W = AnazhRealm.__wahlGpu;
        if (!W || W.dev !== dev) {
            const lay = dev.createBindGroupLayout({
                label: "pass-wahl",
                entries: ["uniform", "read-only-storage", "read-only-storage", "storage", "storage"].map((type, i) => ({
                    binding: i,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: { type, hasDynamicOffset: i === 1 },
                })),
            });
            const module = dev.createShaderModule({ label: "pass-wahl", code: AnazhRealm.PASS_WAHL_WGSL });
            const layout = dev.createPipelineLayout({ bindGroupLayouts: [lay] });
            const pipe = dev.createComputePipeline({
                label: "pass-wahl",
                layout,
                compute: { module, entryPoint: "wahl" },
            });
            const lage = dev.createBuffer({ label: "pass-wahl-lage", size: 272, usage: U.UNIFORM | U.COPY_DST });
            W = AnazhRealm.__wahlGpu = {
                dev,
                lay,
                pipe,
                lage,
                lageF: new Float32Array(68),
                puffer: null,
                f: null,
                u: null,
            };
        }
        const al = dev.limits.minStorageBufferOffsetAlignment;
        const off = [];
        let bytes = 0;
        for (let i = 1; i < arenen.length; i += 2) {
            off.push(bytes);
            bytes += Math.ceil(((arenen[i].wahl.length / 5) * 48) / al) * al;
        }
        if (!W.puffer || W.puffer.size < bytes) {
            const size = Math.max(bytes, 2 * (W.puffer ? W.puffer.size : 0));
            if (W.puffer) W.puffer.destroy();
            W.puffer = dev.createBuffer({ label: "pass-wahl-auftraege", size, usage: U.STORAGE | U.COPY_DST });
            W.f = new Float32Array(size / 4);
            W.u = new Uint32Array(W.f.buffer);
        }
        const nMax = off.map((o, j) => AnazhRealm._wahlAuftraege(arenen[2 * j + 1].wahl, W.f, W.u, o / 4));
        dev.queue.writeBuffer(W.lage, 0, AnazhRealm._wahlLage(L, W.lageF));
        dev.queue.writeBuffer(W.puffer, 0, W.f.buffer, 0, bytes);
        const enc = dev.createCommandEncoder({ label: "pass-wahl" });
        const pass = enc.beginComputePass({ label: "pass-wahl" });
        pass.setPipeline(W.pipe);
        for (let j = 0; j < off.length; j++) {
            const a = arenen[2 * j],
                q = a.__instanzQuelle,
                n = arenen[2 * j + 1].wahl.length / 5;
            for (const x of [q.instanceMatrix, q.liste]) rend._attributes.update(x, 3); // r184 AttributeType.STORAGE
            const puf = [W.lage, W.puffer, ...[q.instanceMatrix, q.liste, a._ind].map((x) => be.get(x).buffer)];
            let bg = a.__wahlBG;
            if (!bg || bg.n !== n || puf.some((p, k) => p !== bg.puf[k])) {
                const entries = puf.map((buffer, i) => ({
                    binding: i,
                    resource: { buffer, size: i === 1 ? n * 48 : undefined },
                }));
                bg = a.__wahlBG = { n, puf, bg: dev.createBindGroup({ label: "pass-wahl", layout: W.lay, entries }) };
            }
            pass.setBindGroup(0, bg.bg, [off[j]]);
            pass.dispatchWorkgroups(Math.ceil(nMax[j] / 64), n);
        }
        pass.end();
        dev.queue.submit([enc.finish()]);
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
        if (!f) return aus.fill(0, 32);
        for (let p = 0; p < 6; p++) ebene(f.ebenen[p], 32 + p * 4);
        const b = f.basisInv.elements,
            d = L.dir;
        aus.set([b[2], b[6], b[10], b[2] * ax + b[6] * ay + b[10] * az + b[14] - f.zb], 56);
        aus.set([d.x, d.y, d.z, 1, f.saum + 2 * L.halt + L.licht, 0, 0, 0], 60);
        return aus;
    }

    // Die Aufträge einer Arena ab dem Wort `o` (das `Auftrag`-Gefüge, 12 Worte): die Kugel der Gestalt (`_gangSatzHuelle`),
    // erste Instanz · Zahl · Platz der Zahl im Auftrags-Puffer · Abschnitt der Liste, der Saum (die Gestalt des Gangs trägt
    // keinen: ihre Kugel deckt jede Pose). `wahl` aus `_auftraege`: [Glied, erste Instanz, Zahl, Platz, Abschnitt] je Zug.
    // Liefert die größte Zahl (die Breite des Dispatch).
    static _wahlAuftraege(wahl, f, u, o) {
        let nMax = 0;
        for (let j = 0; j < wahl.length; j += 5, o += 12) {
            const g = wahl[j].geometry;
            if (!g.boundingSphere) g.computeBoundingSphere();
            const s = g.boundingSphere;
            f.set([s.center.x, s.center.y, s.center.z, s.radius], o);
            u.set([wahl[j + 1], wahl[j + 2], wahl[j + 3], wahl[j + 4]], o + 4);
            f.set([0, 0, 0, 0], o + 8);
            nMax = Math.max(nMax, wahl[j + 2]);
        }
        return nMax;
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

    // Kaskaden-Index einer Schatten-Kamera (die EINE Map ohne CSM = 0), sonst −1.
    _schattenKameraIndex(kamera) {
        const csm = this.state.csmNode;
        if (csm && csm.lights)
            for (let i = 0; i < csm.lights.length; i++)
                if (csm.lights[i].shadow && csm.lights[i].shadow.camera === kamera) return i;
        const dl = this.state.directionalLight;
        return dl && dl.shadow && dl.shadow.camera === kamera ? 0 : -1;
    }

    // DER SCHATTEN-TAKT je Kaskade (04.10., echte GPU): r184 liest `renderer.shadowMap.needsUpdate` NICHT — der
    // EINE Leser ist `ShadowNode.updateBefore` mit `shadow.needsUpdate || shadow.autoUpdate` je Licht, und
    // `LightShadow.autoUpdate` (true) reist in jede CSM-Kaskade. Der alte Cache (V18.264) schrieb ins Leere: beide
    // Kaskaden renderten JEDEN Frame (Profil: updateShadow ~9,5 ms CPU je Frame). Hier fährt der Takt die echten
    // Leser: die NAHE Kaskade rendert jeden `nahMax`-ten Frame (laufende Tiere werfen nah), die FERNE im
    // `fernFaktor`-fachen Takt des Regler-Intervalls (höchstens so dicht wie die nahe); ein Sonnen-Sprung erzwingt
    // alle. JE FRAME HÖCHSTENS EINE KASKADE (1410-3): unter Regler voll renderte die nahe JEDEN Frame und jeder dritte
    // trug beide — der CPU-Takt eines Frames mit zwei Schatten-Renders hob den p95 (ABAB OMEN GTX, Regler voll, CPU-Takt p95:
    // Wiese Ego 6,0 → 5,8 · Third 6,7 → 6,4 · Genesis Ego 6,8 → 6,3 · Third 8,4 → 7,5 ms; GPU und Frame gleich). Eine
    // fällige Kaskade wartet hinter der Vor-Kaskade dieses Frames auf den
    // nächsten; die nahe Phase und die ferne wechseln. Ohne CSM trägt das Haupt-Licht die EINE Map im Nah-Takt.
    // Eine übersprungene Kaskade bleibt konsistent: `shadow.updateMatrices` läuft nur in `renderShadow`
    // (Vendor-Anker), die Matrix gehört zur Map.
    _loopShadowUpdate() {
        const r = this.state.renderer;
        if (!r || !r.shadowMap) return;
        const dl = this.state.directionalLight;
        const frame = (this._shadowFrame = (this._shadowFrame || 0) + 1);
        if (!this._shadowLast) this._shadowLast = { sx: 0, sy: 0, sz: 0, k: [] };
        const L = this._shadowLast;
        const sx = dl ? dl.position.x : 0,
            sy = dl ? dl.position.y : 0,
            sz = dl ? dl.position.z : 0;
        // `sunMoved` fängt nur den DISKRETEN Sprung (manueller Tageszeit-Wechsel, Δ² ≥ 10³): die Sonnen-Position
        // (focus + sunDir·200) trägt auch die Tag-Nacht-Drift (Δ² ~1e-3/Frame), die der Takt ohnehin mitnimmt.
        const sunMoved = (sx - L.sx) ** 2 + (sy - L.sy) ** 2 + (sz - L.sz) ** 2 > 4.0;
        if (sunMoved) {
            L.sx = sx;
            L.sy = sy;
            L.sz = sz;
        }
        const T = AnazhRealm.SCHATTEN_TAKT;
        const minInterval = Math.max(1, Math.round(this.state._shadowMinInterval || 1));
        const csm = this.state.csmNode;
        const lichter = csm && csm.lights && csm.lights.length ? csm.lights : dl ? [dl] : [];
        // DIE KOSTEN AN DER ÄNDERUNG (Gebot 7): bewegt sich die Kamera (Gang, Drehung, die Kamera folgt dem Spieler), folgt
        // die nahe Kaskade jedem Frame im Regler-Takt und beide dürfen in einen Frame — der Schatten des gehenden Spielers
        // stünde sonst jeden zweiten Frame einen Frame zurück. In Ruhe gilt je Frame höchstens eine Kaskade. Gemessen in
        // EINER Sitzung (Genesis Third): stehend CPU-Takt p50/p95 5,7/7,4 → 5,25/6,95 ms (die Kamera in 0 von 2 700 Frames
        // bewegt), gehend und drehend gleich — dort gilt das Gesetz vor 1410-3 (p95 21,7 gegen 22,6/23,1 ms).
        const cam = this.state.camera;
        const me = cam && cam.matrixWorld ? cam.matrixWorld.elements : null;
        let bewegt = false;
        if (me) {
            const alt = L.kamera || (L.kamera = new Float64Array(16).fill(NaN));
            for (let j = 0; j < 16; j++)
                if (!(Math.abs(me[j] - alt[j]) <= AnazhRealm.SCHATTEN_RUHE_EPS)) {
                    bewegt = true;
                    break;
                }
            alt.set(me);
        }
        let gerendert = false;
        for (let i = 0; i < lichter.length; i++) {
            const sh = lichter[i].shadow;
            if (!sh) continue;
            sh.autoUpdate = false;
            const takt = bewegt
                ? i === 0
                    ? Math.min(T.nahMax, minInterval)
                    : minInterval * T.fernFaktor
                : i === 0
                  ? T.nahMax
                  : Math.max(T.nahMax, minInterval) * T.fernFaktor;
            const faellig = !(frame - (L.k[i] != null ? L.k[i] : -1e9) < takt);
            if (sunMoved || (faellig && (bewegt || !gerendert))) {
                sh.needsUpdate = true;
                L.k[i] = frame;
                gerendert = true;
            }
        }
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

    // DER TAKT DER HORIZONT-KARTE (aus `_atmoTakt`): die Reichweite der Kaskaden je Takt; neu gezeichnet, wenn der Ring voll ist
    // und das Licht sich um einen Texel über die Karte gedreht hat oder der Anker wandert — Kosten an Änderung (Gebot 7), der
    // Null-Renderer zeichnet nichts.
    _horizontKarteTakt() {
        const st = this.state;
        const K = st.horizontKarte;
        if (!K) return null;
        const H = AnazhRealm.HORIZONT_KARTE;
        const csm = st.csmNode;
        const cam = st.camera;
        K.U.ab.value = csm && cam ? Math.min(csm.maxFar, cam.far) : 0;
        const fr = st.fernRing;
        const dl = st.directionalLight;
        const rend = st.renderer;
        if (!fr || !fr.ready || fr.cursor < fr.totalVerts || !dl || !rend || rend._isHeadlessNull || !st.rendererReady)
            return K;
        const L = this._horizontLicht || (this._horizontLicht = new THREE.Vector3());
        L.copy(dl.position);
        if (dl.target) L.sub(dl.target.position);
        if (!(L.lengthSq() > 0) || !(L.normalize().y > 0)) {
            K.U.aktiv.value = 0;
            return K;
        }
        const texelM = (2 * H.randM) / H.texel;
        const gleich =
            K.anker &&
            K.anker[0] === fr.anchorX &&
            K.anker[1] === fr.anchorZ &&
            K.geos === fr.geos &&
            K.licht.dot(L) >= Math.cos(texelM / H.randM);
        if (gleich) {
            K.U.aktiv.value = 1;
            return K;
        }
        if (K.geos !== fr.geos) {
            this._horizontKarteLeeren();
            for (const geo of fr.geos) {
                const m = new THREE.Mesh(geo, K.stoff);
                m.matrixAutoUpdate = false;
                m.frustumCulled = false;
                K.szene.add(m);
                K.meshes.push(m);
            }
            K.geos = fr.geos;
        }
        const wl = Number.isFinite(st.waterLevel) ? st.waterLevel : 0;
        const c = this._horizontMitte || (this._horizontMitte = new THREE.Vector3());
        c.set(fr.anchorX, wl, fr.anchorZ);
        const kam = K.kamera;
        kam.position.copy(c).addScaledVector(L, H.hoeheM);
        if (Math.abs(L.y) > 0.99) kam.up.set(0, 0, 1);
        else kam.up.set(0, 1, 0);
        kam.lookAt(c);
        kam.updateMatrixWorld(true);
        // DIE BREITE DER KARTE quer zum Licht: der Ring (Radius randM, Höhen bis hMax über dem Bezug) liegt im Bild des Lichts in
        // ±randM waagrecht und ±(randM·sin h + hMax·cos h) senkrecht — die Karte nimmt genau das (am Abend 6,8 statt 32,8 m je
        // Texel), sonst trüge ein Texel auf ebenem Boden texelM / tan h Licht-Tiefe und der Bias äße jeden Schatten unter 280 m.
        let hMax = 0;
        for (const geo of fr.geos) {
            const a = geo.attributes.position.array;
            for (let i = 1; i < a.length; i += 3) hMax = Math.max(hMax, Math.abs(a[i] - wl));
        }
        const sinH = L.y;
        const cosH = Math.sqrt(Math.max(0, 1 - sinH * sinH));
        const randV = Math.min(H.randM, H.randM * sinH + hMax * cosH);
        kam.top = randV;
        kam.bottom = -randV;
        kam.updateProjectionMatrix();
        // die Karte: u, v aus den Achsen der Kamera, die Licht-Tiefe längs L. Die Zeilen des Ziels liegen im WebGPU-Raum von oben
        // (NDC +1 in Zeile 0, die Rücklesung 15.10.: 279 von 355 Ring-Ecken treffen ihre Tiefe nur mit 1 − v), und r184 dreht die
        // Abtastung unter `level()` nicht — v dreht hier, im WebGL2-Raum nicht.
        const e = kam.matrixWorld.elements;
        const k = 1 / (2 * H.randM);
        const kV = 1 / (2 * randV);
        const dreh = rend.coordinateSystem === THREE.WebGPUCoordinateSystem ? -1 : 1;
        const X = [e[0], e[1], e[2]];
        const Y = [e[4] * dreh, e[5] * dreh, e[6] * dreh];
        const pc = (a) => a[0] * c.x + a[1] * c.y + a[2] * c.z;
        K.U.karte.value.set(
            X[0] * k,
            X[1] * k,
            X[2] * k,
            0.5 - k * pc(X),
            Y[0] * kV,
            Y[1] * kV,
            Y[2] * kV,
            0.5 - kV * pc(Y),
            L.x,
            L.y,
            L.z,
            H.versatzM - (L.x * c.x + L.y * c.y + L.z * c.z),
            0,
            0,
            0,
            1
        );
        // der Bias: ein Texel deckt auf ebenem Boden seine senkrechte Kante / tan h Licht-Tiefe, am Hang quer bis die halbe waagrechte
        const texelV = (2 * randV) / H.texel;
        K.U.bias.value = H.biasTexel * (texelV / Math.max(H.hoeheMin, sinH / Math.max(1e-3, cosH)) + 0.5 * texelM);
        this._atmoZeichne(K.szene, K.rt, true);
        K.licht.copy(L);
        K.anker = [fr.anchorX, fr.anchorZ];
        K.malZahl++;
        K.U.aktiv.value = 1;
        return K;
    }

    // Die Zeichen-Meshes der Karte fallen (Ring-Abschied, neue Geometrien); die Geometrien gehören dem Ring.
    _horizontKarteLeeren() {
        const K = this.state.horizontKarte;
        if (!K) return;
        for (const m of K.meshes) K.szene.remove(m);
        K.meshes = [];
        K.geos = null;
        K.anker = null;
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
// Die Wurf-Ebene (0 = Welt, 1 = Laub-Pass, 2 = Wurf): K72 — `castShadow` IST das Bit dieser Ebene (`_wurfEbene`), jedes
// Licht liegt auf ihr, die Schatten-Kamera sieht NUR sie (`layers.set(2)` vor der CSM-Konstruktion, die Kaskaden erben
// es). Der Zwilling (der opake Kronen-Caster, die Grobstufe nah, der Wurf-Satz, der Leib im 1st) verlässt Ebene 0 und
// wirft auf ihr — die Haupt-Kamera sieht ihn nie.
AnazhRealm.SHADOW_TWIN_LAYER = 2;
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
// Der Takt des GPU-Kehraus (`_gpuKehraus`): je Gang Graph + r184-Register (nach dem Kehraus beide nur das Bild); was zwischen
// zwei Gängen den Graphen verlässt, hält die GPU höchstens so lange.
AnazhRealm.GPU_KEHRAUS_MS = 2000;
AnazhRealm.PERF_SHADOW_RANGE_MAX = 170; // = der Default-Ceiling (Fallback, wenn atmosphere.shadowRange fehlt)
// Die CSM-Tiefe (maxFar) je Meter Schatten-Reichweite: EINE Zahl für Boot und Regler (100–170 → 180–306 m).
AnazhRealm.SCHATTEN_FERN_FAKTOR = 1.8;
// DIE ERST-ZEICHNUNG (`_configureRenderer`): je Render-Aufruf der Welt-Szene baut der erste Erst-Bau immer, jeder weitere nur,
// solange der Aufruf unter dieser Zeit (ms) baute — ein Frame trägt so höchstens einen schweren Knoten-Bau je Pass.
AnazhRealm.ERST_BAU_MS = 4;
// DER SCHATTEN-TAKT je Kaskade (_loopShadowUpdate): die nahe Kaskade (seit schatten.K1 die Kontakt-Kaskade, 15 m) rendert im
// Regler-Intervall, höchstens jeden `nahMax`-ten Frame (laufende Tiere werfen nah); jede weitere im `fernFaktor`-fachen Takt.
AnazhRealm.SCHATTEN_TAKT = Object.freeze({ nahMax: 2, fernFaktor: 3 });
// Die Ruhe der Kamera für den Schatten-Takt (_loopShadowUpdate): jedes Element der Welt-Matrix höchstens so weit vom
// vorigen Frame (Meter bzw. Drehung) — darüber gilt die Kamera als bewegt, die nahe Kaskade folgt jedem Frame.
AnazhRealm.SCHATTEN_RUHE_EPS = 1e-4;
// DIE KASKADEN-BOX (_kaskadenPassen): jede Kaskade misst die Frustum-Scheibe im Licht-Raum statt ihrer Diagonale.
// `texelM` = die Texel-Kante je Kaskade, die die längste Box-Kante bei jeder Blickrichtung hält — die des
// Addon-Quadrats (k0 339 m / 2048, k1 961 m / 2048): kein Schatten wird gröber als bis V18.529. Die Karten-Größe folgt
// daraus am Standard-Bereich und Bezugs-Seitenverhältnis `bezugAspekt` (kleinste Zweierpotenz, einmal bei der
// Kaskaden-Geburt; k0 = k1 = 2048, gate:schatten-werfer K5/K6). `rasterTeiler`: die Box wächst in Schritten von
// Scheiben-Tiefe / rasterTeiler (eine Größe hält, solange die Scheibe hineinpasst — sonst schimmert jede Drehung);
// `randM` = Saum der Werfer-Hülle (Wind, Morph), `luftM` = Saum über dem höchsten Werfer und unter der tiefsten
// Scheibe. DER BIAS (0710-12, `_schattenBias`) in Texeln der Karte, nie in Metern: `normalTexel` = der normalBias je Texel
// (mal dem Hebel `atmosphere.shadowBias`), `tiefeTexel` = der Tiefen-Nudge entlang des Lichts. Den Versatz trägt die
// End-Normale des Empfänger-Stoffs (r184 `normalWorld`), am geflachten Boden also die Senkrechte (TERRAIN_NORMAL_FLATTEN);
// darum trägt der Boden die Zuwendung seiner wahren Normale selbst (`receivedShadowNode`, 1110-5): abgewandt im Schatten,
// über N·L 0 … `zuwendungSaum` weich (der Saum am Terminator, sonst die Hang-Akne).
// DIE KONTAKT-KASKADE (schatten.K1): die ersten `kontaktM` Meter tragen eine eigene Kaskade bei `texelM[0]` (≤ 5 cm, 1024²);
// DER FILTER jeder Kaskade ist das EINE Gesetz der Sonnen-Scheibe (`_schattenFilter`): Halbschatten = Abstand Werfer →
// Empfänger längs des Lichts × `sonneTan` (0,53°), die Werfer gesucht im Umkreis `sucheM` je Kaskade, der Radius `filterTexel`
// Texel + Halbschatten/2 (k0 und k1: 1 Texel ohne Suche, der r184-PCF bis K1 — ihr Texel trägt den Halbschatten der Sonne nie).
AnazhRealm.SCHATTEN_KASKADE = Object.freeze({
    kontaktM: 15,
    texelM: Object.freeze([0.045, 0.17, 0.47]),
    filterTexel: Object.freeze([0.25, 1, 1]),
    sonneTan: 0.00925,
    sucheM: Object.freeze([0.25, 0, 0]),
    bezugAspekt: 16 / 9,
    karteMax: 2048,
    rasterTeiler: 8,
    randM: 2,
    luftM: 4,
    normalTexel: 0.5,
    tiefeTexel: 0.75,
    zuwendungSaum: 0.08,
});
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
});
// DAS GESETZ DER PASS-WAHL AUF DER GPU (`_passTrifft` für die Kugel, h = 0; `_instanzWahlGpu`): je Instanz eines Auftrags
// ihre Kugel (die Mitte der Gestalt durch die Instanz-Matrix, der Radius mal deren größte Streckung, dazu der Saum) gegen
// jede Ebene des Frustums, relativ zum Auge, mit dem Rand der Lage; im Kaskaden-Pass dazu ihre LICHT-KAPSEL — die Kugel
// entlang des Lichts, bis sie ganz unter der Box liegt — gegen jede Ebene der Scheibe: liegen beide Enden jenseits einer
// Ebene, wirft sie dort nicht. Getroffen → ein Platz in der Liste ihres Abschnitts, die Zahl des Zugs atomar.
AnazhRealm.PASS_WAHL_WGSL = `
struct Lage {
    ebenen: array<vec4f, 6>, auge: vec4f, rand: vec4f,
    kapsel: array<vec4f, 6>, tiefe: vec4f, licht: vec4f, saum: vec4f
}
struct Auftrag { kugel: vec4f, platz: vec4u, saum: vec4f }
@group(0) @binding(0) var<uniform> lage: Lage;
@group(0) @binding(1) var<storage, read> auftraege: array<Auftrag>;
@group(0) @binding(2) var<storage, read> matrizen: array<mat4x4f>;
@group(0) @binding(3) var<storage, read_write> liste: array<u32>;
@group(0) @binding(4) var<storage, read_write> args: array<atomic<u32>>;
@compute @workgroup_size(64)
fn wahl(@builtin(global_invocation_id) id: vec3u) {
    let a = auftraege[id.y];
    if (id.x >= a.platz.y) { return; }
    let i = a.platz.x + id.x;
    let m = matrizen[i];
    let c = (m * vec4f(a.kugel.xyz, 1.0)).xyz - lage.auge.xyz;
    let s2 = max(dot(m[0].xyz, m[0].xyz), max(dot(m[1].xyz, m[1].xyz), dot(m[2].xyz, m[2].xyz)));
    let r = a.kugel.w * sqrt(s2) + a.saum.x;
    let rr = r + lage.rand.x + lage.rand.y * length(c);
    for (var p = 0u; p < 6u; p++) {
        let e = lage.ebenen[p];
        if (dot(e.xyz, c) + e.w < -rr) { return; }
    }
    if (lage.licht.w > 0.5) {
        let ende = c + lage.licht.xyz * max(0.0, dot(lage.tiefe.xyz, c) + lage.tiefe.w + r);
        let st = r + lage.saum.x;
        for (var p = 0u; p < 6u; p++) {
            let e = lage.kapsel[p];
            if (dot(e.xyz, c) + e.w < -st && dot(e.xyz, ende) + e.w < -st) { return; }
        }
    }
    liste[a.platz.w + atomicAdd(&args[a.platz.z], 1u)] = i;
}
`;
// Die zwölf Kanten einer Frustum-Scheibe (Ecken 0–3 nah, 4–7 fern, CSMFrustum-Reihenfolge) als Index-Paare.
AnazhRealm.KASKADEN_KANTEN = Object.freeze([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7]);
