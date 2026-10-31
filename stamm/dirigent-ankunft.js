class AnazhRealm_dirigent_ankunft {
    // ===== ATLAS · Dirigent/ankunft — init · das erste Weltbild · Ladeschirm · der Boot =====
    async init() {
        this.log(`Initialisiere Anazh Realm V${AnazhRealm.VERSION}... Ewigkeit erwacht!`, "INFO");
        // DIE STUDIO-FÄDEN KOMMEN MIT DER SEITE (B3a): ihre Kerne sind statisch (`?v=`), nichts in ihnen wartet auf die Welt —
        // sie starten, während der Wirt Spielstand, Gerät und Renderer holt, und das Buch liegt bereit, wenn er steht
        // (`_foundryWirtSteht`). Bis B3a gebar sie erst `generateNewWorld` (Radeon kalt 2,55 s nach der Navigation).
        this._ensureAssetFoundry(true); // ihr Boot-Fehler bricht in ihr selbst laut (K22)
        this._startDorfAmBuch(); // der erste Wartende am Buch: der Export des fälligen Start-Dorfs (B5)
        // Versions-Anzeige (title + .version) aus `AnazhRealm.VERSION` — EIN Wahrheits-Ort, kein
        // hartkodierter String in index.html.
        const versionLabel = `v${AnazhRealm.VERSION}`;
        if (typeof document !== "undefined") {
            try {
                document.title = `Anazh Realm ${versionLabel} – Das Ultiversum`;
                const versionSpan = document.querySelector(".version");
                if (versionSpan) versionSpan.textContent = versionLabel;
            } catch (e) {
                this.log(`Versions-DOM-Sync-Fehler: ${e.message}`, "WARN");
            }
        }
        // Boot-Eichung: speed/sprintSpeed/jumpPower aus DENSELBEN Kern-Koeffizienten, die
        // recomputePlayerStats später mit den Seelen-Tags füllt — kein zweiter Zahlensatz; die
        // Konstruktor-Werte sind Null-Sentinels (kalter Kern → der Spieler steht sichtbar). try-Wand: der
        // Boot stirbt nie an der Eichung (_kernPflichtWand meldet). hang.maxSlopeY hat keinen State-Seed —
        // seine Leser lesen _bewegungsBlock (fail-closed).
        try {
            const KS = AnazhRealm._bewegungsKoeff("speed");
            const KJ = AnazhRealm._bewegungsKoeff("jumpPower");
            this.state.speed = KS.base + KS.leicht;
            this.state.sprintSpeed = this.state.speed * AnazhRealm._sprintMulGesetz();
            this.state.jumpPower = KJ.base + KJ.leicht;
        } catch (_e) {}
        // Welle 6.C3 — Keybindings VOR allen DOM-Listenern laden. State muss
        // existieren bevor das Settings-Panel rendert (sonst zeigt es leer).
        this.state.keybindings = this._loadKeybindings();
        this.state.padBelegung = this._loadKeybindings(true);
        this.state.keybindRebind = null;
        // Revozierte Schlüssel aus dem globalen localStorage: ein Artefakt mit revoziertem Schlüssel irgendwo
        // in seiner Herkunftskette fällt beim Laden weg. Global, NIE im Welt-Snapshot
        // (SOVEREIGN_STATE.excludedStateKeys); VOR den Welt-Ladern laden, damit sie sieben können.
        this.state.revokedKeys = this._loadRevokedKeys();
        // W14 Phase 2 — signierte Welt-Manifeste aus dem globalen localStorage.
        this.state.signedWorlds = this._loadSignedWorlds();
        // W14 Phase 3 — empfangene (importierte) Welt-Manifeste.
        this.state.customWorlds = this._loadCustomWorlds();
        this.grokInitDOM();
        this.symphonyInitDOM();
        this.initStatusPanel();
        this.playerSoulInitDOM();
        this.cameraModeInitDOM();
        this.gameModeInitDOM();
        // Welle 6.H Phase 2E V2 — proaktive-Sprache-Toggle aufsetzen.
        this.creatureSpeechInitDOM();
        // V8.37 — Einstellungen-Sektionen faltbar machen.
        this._initCollapsibleSettings();
        // Welle 6.X.2 B1 — Logbuch-Sichtbarkeit-Toggle aufsetzen.
        this.logbookInitDOM();
        // Welle 6.X.4 F1 — Begleiter-Name + Avatar-Name laden + binden.
        this.identityInitDOM();
        // W13 Phase 1 — Vibe-Pass-Sektion verkabeln (Render folgt mit
        // _ensureVibePass nach ensureWorldMeta).
        this.vibePassInitDOM();
        // Welle 6.X.4 D2 — Drei Schieber (Master / Pings / Render-Ring).
        this.slidersInitDOM();
        this.keybindingsInitDOM();
        this.inventoryInitDOM();
        this.creatureDrawerInitDOM();
        // W14 Phase 1 — Bibliothek-Drawer rendern (Welt-Registry browsbar).
        this.libraryInitDOM();
        // KI-Übersetzer Phase 1 — die Übersetzer-Sektion verkabeln.
        this.translatorInitDOM();
        // W15 Phase 1 — die Auto-Vendor-Sektion („Welt andocken") verkabeln.
        this.vendorInitDOM();
        // W16 Phase 1 — die „Welt vom Mitspieler holen"-Sektion verkabeln.
        this.meshWorldInitDOM();
        // Ring 6.5 — Hotbar im DOM rendern. Wird hier einmal aufgesetzt;
        // setHotbarSlot löst ein Re-Render aus.
        this._renderHotbarDOM();
        // Ring 6.6 — Werkstatt-Editor initial mit Default-Bauplan rendern.
        this._renderWorkshopDOM();
        this._updateBuildModeHud();
        this.initTopbar();
        this.initConsoleDOM();
        // V8.00 — Resize-Handles für Konsole + alle Drawer (idempotent).
        this.installResizeHandles();
        // Schicht 2 — LLM-Persistenz aus localStorage holen + UI verkabeln.
        this.llmLoadPersisted();
        this.initLlmUI();
        // Ring 11 V1 — P2P-Persistenz aus localStorage + UI-Verkabelung.
        // Auto-Connect erst nach ensureWorldMeta (sonst hätten wir keine
        // worldId als default-Raum).
        this.p2pLoadPersisted();
        this.initP2PUI();
        const weltVerbunden = await this._weltVorlauf();
        // Welle 3 F — Welt-Info-Sektion im Welt-Drawer.
        this.initWorldInfoUI();
        // Ring 9 — Welt-Tor Drei-Wahl-Dialog beim Import.
        this.initWeltTorUI();
        // Ring 10 — Welt-Fusion-Dialog.
        this.initWorldFusionUI();

        const canvas = document.getElementById("world-canvas");
        if (!canvas) {
            this.log("Canvas fehlt – Ewigkeit unsichtbar!", "ERROR");
            return;
        }
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // ColorManagement an: sRGB-Farben werden intern linear gerechnet. Canvas-Texturen
        // (`_buildVibePassSprite`, `_creatureAuraTextureCache`, `_buildAuraGradient`) sind SRGBColorSpace
        // getaggt; die gradientMap (Toon-LUT) bleibt LinearSRGBColorSpace — Helligkeit, keine Farbe.
        if (typeof THREE !== "undefined" && THREE.ColorManagement) {
            THREE.ColorManagement.enabled = true;
        }
        // WebGPU ist Pflicht: NodeMaterials rendern ausschließlich auf WebGPURenderer (WebGL-Fallback =
        // schwarze Welt). Ohne WebGPU → klare Meldung statt stiller leerer Welt.
        if (typeof navigator === "undefined" || !navigator.gpu) {
            const msg =
                "AnazhRealm braucht WebGPU. Browser bitte aktualisieren " +
                "(Chrome/Edge 113+, Safari 18+, Firefox mit dom.webgpu.enabled).";
            this.log(msg, "ERROR");
            this._showWebGPUGate();
            throw new Error(msg);
        }
        // JEDES-HOLZ-WELLE — die Holz-Wahl VOR dem Renderer-Bau (der Adapter wird
        // billig vorab befragt; Software-Holz → kienspan: kleiner Ring, kein
        // Antialias, Pixel-Cap 1 — volle NÄHE, weniger FERNE).
        const holz = await this._holzWahl();
        this._applyHolzProfil(holz);
        const holzProf = AnazhRealm.HOLZ_PROFILE[holz] || AnazhRealm.HOLZ_PROFILE.voll;
        this.state._traa = holzProf.antialias !== false; // die Post-Kette liest es (_ensurePostProcessing)
        // DIE TEXTUR-GRENZE DES GERÄTS: r184 fordert das Gerät mit den Grenzen des WebGPU-Standards (16 Texturen je Stufe), der
        // Adapter trägt mehr (Radeon 890M 48). Der Boden-Stoff des Fern-Rings sampelt seit der EINEN Atmosphäre und dem Spiegel des
        // Sees 17 — seine Pipeline wurde abgesagt, der Ring fehlte im Bild und die Beweis-Aufnahme brach an der Mess-Wiese ab
        // (ERST-ZEICHNUNG OFFEN, renderPipeline_MeshStandardNodeMaterial). Das Gerät trägt, was der Adapter trägt — der EINE,
        // den die Holz-Wahl gefragt hat (`_holzWahl`, wie r184 ihn fragt; unter dem forceWebGL-Hook keiner); die Grenzen je
        // Stufe liest jeder Renderer der Seite aus `_rendererGeraet` (G1).
        // Opt-in Headless-Null-Renderer (GPU-frei) für Mechanik-Playtest / Server-Sim, sonst der echte
        // WebGPU-Renderer. trackTimestamp anfordern ist sicher: das vendored r184-Backend fordert
        // timestamp-query nur an, wenn der Adapter es trägt, und schaltet es sonst ab (init() wirft nie);
        // dann bleibt perfSense beim Subtraktions-Proxy ("proxy").
        const renderer = this._nullRendererGewaehlt()
            ? this._makeHeadlessRenderer(canvas)
            : new THREE.WebGPURenderer({
                  canvas,
                  // KEIN MSAA: die Kantenglättung ist die zeitliche Auflösung (TRAA) am Anfang der Post-Kette
                  // (_ensurePostProcessing; das Holz-Profil schaltet sie). MSAA 4× kostete gemessen ~7 ms GPU
                  // und 267 MB VRAM (04.10., Radeon 890M).
                  antialias: false,
                  trackTimestamp: true,
                  // KEIN-WEBGPU-GESCHICHTE — der EINE forceWebGL-Hook (gate:webgl-probe) und die Geräte-Grenzen (G1).
                  ...this._rendererGeraet(),
              });
        // DIE TONKURVE (F1, die Foto-Kette): Khronos PBR Neutral (r184 NeutralToneMapping) — bis zur Schulter (0,76) geht die
        // Farbe des Stoffs unverändert ins Bild (nur der Schwarzpunkt 0,04), darüber rollt sie zu Weiß ohne Farbdrehung. Gemessen
        // gegen ACES (Filmic, Sättigung und Kontrast in der Kurve) und AgX in EINER Welt (Radeon 890M, 15.10.): die Öffnung der
        // Tore C*ab ACES 20,9 · AgX 16,8 · Neutral 23,1 (Soll ≥ 20), der Himmel weiß statt blau ACES 53 % · AgX 69 % · Neutral
        // 40 %, die Wiese C*ab ganzes Bild 24,9 · 21,7 · 31,1 (Soll-Bild 01: 28,3). Die Eichung der Belichtung folgt ihr
        // (BELICHTUNG, 26c: die Kurve und ihre Eichung sind EIN Eintrag). Reine Ausgabe-Stufe; die Belichtung setzt das Licht
        // (`_dayNightApplyBelichtung`).
        renderer.toneMapping = THREE[AnazhRealm.BELICHTUNG.kurve];
        renderer.toneMappingExposure = 1.0;
        // V10.0-j.b — Stencil-Buffer global deaktivieren. Three.js' Renderer-
        // Default ist `this.stencil = true` → bei JEDEM RenderPass setzt
        // WebGPUBackend stencilLoadOp + stencilStoreOp. Bei Pure-Depth-Format
        // (V10.0-j.a Shadow-RTT) wirft WebGPU dann „stencilLoadOp must not
        // be set if attachment has no stencil aspect" → CommandEncoder
        // invalidiert → Welt schwarz. Wir nutzen Stencil nirgends → kein
        // visueller Verlust. Plus: Main-Canvas-Depth-Buffer wird Pure-Depth
        // (Depth24Plus statt Depth24PlusStencil8) — 4 Bytes/Pixel statt 5.
        renderer.stencil = false;
        this.log("WebGPU-Renderer instantiiert — init() läuft asynchron …", "INFO");
        // Das Backend-Gesetz an der KLASSE, bevor irgendein Backend der Seite (Welt oder Bühne) ein Attribut anlegt oder sein
        // Device holt (`_backendGesetz`: schmaler Index · Index-Wache · GPU-Wache).
        this._backendGesetz(renderer);
        this._configureRenderer(renderer);
        this.state.rendererReady = false;
        // JEDES-HOLZ — der Boot-Wächter: ein still hängendes init() (Software-
        // Vulkan) bekommt nach 25 s eine LAUTE Diagnose statt einer weißen Welt.
        const initWatch = setTimeout(() => {
            if (!this.state.rendererReady) {
                this.log(
                    "WebGPU-Renderer init() antwortet nach 25 s nicht — schwaches/Software-Holz? " +
                        "Versuche ?holz=kienspan (kleiner Ring, kein AA) oder einen anderen Browser.",
                    "ERROR"
                );
                this._ladeschirmStand("die Grafikkarte antwortet seit 25 s nicht — versuche ?holz=kienspan");
            }
        }, 25000);
        renderer
            .init()
            .then(() => {
                clearTimeout(initWatch);
                this.state.rendererReady = true;
                this.log("WebGPU-Renderer init() abgeschlossen — die Welt rendert jetzt auf der GPU.", "INFO");
                // Trägt das Device timestamp-query? `backend.trackTimestamp` ist die EINE Wahrheit (r184 lässt sie
                // nur mit Feature stehen); `_perfGpuResolveKick` liest dieselbe Flagge pro Frame — hier nur einmal
                // laut benennen, kein Spiegel-Feld.
                try {
                    const tt = renderer.backend && renderer.backend.trackTimestamp === true;
                    this.log(
                        tt
                            ? `GPU-Zeit: timestamp-query aktiv — perfSense misst echtes gpuMs (Quelle „echt").`
                            : `GPU-Zeit: timestamp-query fehlt auf diesem Adapter — der Subtraktions-Proxy bleibt (Quelle „proxy").`,
                        "INFO"
                    );
                } catch (_e) {
                    /* fail-soft — die Quelle-Wahrheit lebt in _perfGpuSample */
                }
                // Backend-Rückfall EINMAL laut benennen: der r184-WebGPURenderer fällt ohne Adapter (oder via
                // forceWebGL-Hook) still auf WebGL2 — dann ruht der WGSL-Konsument (der Fullscreen-Feld-Pass;
                // _gpuComputeFaehig-Wand) und die CPU-Gesetze tragen ganz.
                try {
                    if (!(renderer.backend && renderer.backend.isWebGPUBackend === true)) {
                        this.log(
                            "WebGL2-Rückfall aktiv (kein WebGPU-Backend): der Fullscreen-Feld-Pass ruht — " +
                                "die CPU-Gesetze tragen die Welt GANZ; der Fern-Ring verfeinert auf CPU (+ eigenem WebGPU-Device, falls vorhanden).",
                            "WARN"
                        );
                        AnazhRealm._arenaKann(renderer); // die Geometrie-Arena (G1) fällt mit, laut (`__arenaOhne`, W3)
                    }
                } catch (_e) {
                    /* fail-soft — die Wand selbst urteilt je Konsument */
                }
                this._renderObjektRegister(renderer);
                this._texturAbschied(renderer);
                // Hitch-Telemetrie (d) Upload-Bytes: JEDER Upload läuft durch device.queue.writeBuffer — ein
                // Laufzeit-Wrap hier zählt alles, die vendor-Datei bleibt byte-alt. Idempotent über __anazhTap;
                // Konsum je Frame in _perfSenseFoldFrame.
                try {
                    const q = renderer.backend && renderer.backend.device && renderer.backend.device.queue;
                    if (q && !q.__anazhTap && typeof q.writeBuffer === "function") {
                        const orig = q.writeBuffer.bind(q);
                        q.writeBuffer = (b, off, data, dOff, size) => {
                            const _sz =
                                size != null ? size * (data.BYTES_PER_ELEMENT || 1) : (data && data.byteLength) || 0;
                            this._uploadBytesAcc = (this._uploadBytesAcc || 0) + _sz;
                            // Die Größen-Klasse nennt die Upload-Population: Uniforms (≤16K) vs Instanz-Matrizen (≤256K) vs
                            // Geometrie/Texturen (≥2M). Session-kumulativ, zwei Adds pro Upload.
                            const _B =
                                this._uploadBuckets ||
                                (this._uploadBuckets = { b16K: [0, 0], b256K: [0, 0], b2M: [0, 0], gross: [0, 0] });
                            const _slot =
                                _sz <= 16384 ? _B.b16K : _sz <= 262144 ? _B.b256K : _sz <= 2097152 ? _B.b2M : _B.gross;
                            _slot[0]++;
                            _slot[1] += _sz;
                            return orig(b, off, data, dOff, size);
                        };
                        q.__anazhTap = true;
                    }
                } catch (_e) {
                    /* fail-soft — ohne Tap bleibt uploadBytes ehrlich 0, nie ein Boot-Wurf */
                }
                // die Absage einer asynchronen Pipeline meldet sich laut (r184 verschluckt sie)
                this._erstAbsageWache(renderer);
                // JEDES-HOLZ — DER DEVICE-LOSS-WÄCHTER: stirbt das GPU-Device
                // (Software-Dawn, Treiber-Reset, TDR), wird es LAUT gemeldet +
                // das Gate gezeigt, statt einer weißen Welt mit 60-fps-Lüge.
                try {
                    const dev = renderer.backend && renderer.backend.device;
                    if (dev && dev.lost && typeof dev.lost.then === "function") {
                        dev.lost.then((info) => {
                            this.state._deviceLost = (info && info.reason) || "unknown";
                            const tieferes =
                                this.state._holzProfil === "kienspan"
                                    ? "Dieses Holz trägt selbst kienspan nicht — die Welt braucht eine echte GPU."
                                    : "Versuche ?holz=kienspan (kleiner Ring, keine Schatten, kein AA).";
                            this.log(
                                `GPU-DEVICE VERLOREN (${this.state._deviceLost}) — die Welt kann nicht weiterrendern. ${tieferes}`,
                                "ERROR"
                            );
                            if (typeof this._showWebGPUGate === "function") this._showWebGPUGate();
                        });
                    }
                } catch (_e) {
                    /* Wächter ist fail-soft — ohne lost-Promise kein Wächter */
                }
            })
            .catch((err) => {
                this._ladeschirmStand(`die Grafikkarte verweigert die Welt: ${err && err.message}`);
                this.log(
                    `WebGPU-Renderer init() scheiterte (${err.message}). ` +
                        "navigator.gpu existiert aber requestAdapter/requestDevice scheitert — " +
                        "Hardware-Adapter nicht verfügbar oder Device-Erschaffung blockiert.",
                    "ERROR"
                );
            });
        this.state.renderer = renderer;
        // Der Null-Renderer zeigt kein Bild, auf das der Ladeschirm warten könnte (sein Loop pumpt nur auf Zuruf):
        // er weicht sofort, die UI der Linsen bleibt klickbar.
        if (renderer._isHeadlessNull) this._weltbildSteht();
        this.log("Renderer initialisiert mit Schattenunterstützung (webgpu)", "INFO");
        this.state.selfAwareness.components.push("renderer");

        const scene = new THREE.Scene();
        this.state.scene = scene;
        this.log("Szene initialisiert", "INFO");
        this.state.selfAwareness.components.push("scene");

        // V6 (Look-Finale, 2a) — die Saison-Tönungs-Uniform in init() erzeugen
        // (TSL ist geladen; das Gras-Material liest sie später lazy). Der State ist
        // in der audit-strict-Whitelist (abgeleitet aus seasonPhase, nicht im Snapshot).
        this._ensureSeasonUniforms();

        // P0.1 (Bühnen-Ordnung) — das zweite „Galaxy-Skybox erstellt"-Log ist WEG: der
        // Builder loggt sich selbst (createGalaxySkybox-Ende) — die Doppel-Zeile im
        // Schöpfer-Log war EIN Bau mit ZWEI Log-Sites (Builder + Call-Site), kein Doppel-Bau.
        this.createGalaxySkybox();

        // Sonne + Mond als emissive Sphere-Meshes; die Position setzt _updateCelestialBodies(angle)
        // (Mond gegenüber). Die Sonne trägt den echten Winkel (`HIMMEL.sonneWinkelGrad`, aus 380 m 1,76 m Radius) —
        // 12 m waren 3,6° (sieben Sonnen breit) und deckten den HDR-Hof der Skybox als graue Scheibe.
        const _H = AnazhRealm.HIMMEL;
        const sunGeo = new THREE.SphereGeometry(
            _H.koerperAbstandM * Math.tan(((_H.sonneWinkelGrad / 2) * Math.PI) / 180),
            16,
            16
        );
        const sunMat = AnazhRealm._himmelImUnendlichen(
            new THREE.MeshBasicNodeMaterial({
                color: 0xffe8b0,
                fog: false,
                transparent: true,
                opacity: 0.95,
            })
        );
        const sunMesh = new THREE.Mesh(sunGeo, sunMat);
        sunMesh.name = "himmel-sonne";
        sunMesh.frustumCulled = false; // immer rendern (Himmelskörper)
        scene.add(sunMesh);
        this.state.sunMesh = sunMesh;
        const moonGeo = new THREE.SphereGeometry(9, 16, 16);
        const moonMat = AnazhRealm._himmelImUnendlichen(
            new THREE.MeshBasicNodeMaterial({
                color: 0xd0d4e0,
                fog: false,
                transparent: true,
                opacity: 0.9,
            })
        );
        const moonMesh = new THREE.Mesh(moonGeo, moonMat);
        moonMesh.name = "himmel-mond";
        moonMesh.frustumCulled = false;
        scene.add(moonMesh);
        this.state.moonMesh = moonMesh;
        this.log("Himmelskörper hinzugefügt (Sonne + Mond)", "INFO");

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        // Frustum-Halbbreite aus dem persistierten Schatten-Hebel (Default 170), falls loadState vor der Licht-Erstellung
        // lief; sonst greift setShadowRange in loadState. Den Bias setzt das Gesetz (`_hauptSchattenBias` unten, der Hebel
        // `atmosphere.shadowBias` liest setShadowBias).
        const _atmo = this.state.atmosphere || {};
        const _shRange = Number.isFinite(_atmo.shadowRange) ? Math.max(80, Math.min(400, _atmo.shadowRange)) : 170;
        directionalLight.shadow.camera.left = -_shRange;
        directionalLight.shadow.camera.right = _shRange;
        directionalLight.shadow.camera.top = _shRange;
        directionalLight.shadow.camera.bottom = -_shRange;
        // Shadow-Acne-Schutz: ohne Bias schattet die grobe Map flache, zur Sonne zeigende Flächen selbst
        // (Streifen auf Dächern). normalBias (Sample entlang der Normale) ist der wirksame Acne-Killer,
        // bias nur ein kleiner Tiefen-Nudge; mapSize 2048.
        // Beide aus dem EINEN Gesetz (`_schattenBias`, 0710-12): Texel der Karte = 2 · Reichweite / Kartengröße.
        this._hauptSchattenBias(directionalLight);
        // KRITISCH: nach dem Setzen der Shadow-Camera-Bounds MUSS updateProjectionMatrix() laufen — die
        // OrthographicCamera rechnet sie nur im Konstruktor; sonst ist light.shadow.matrix degeneriert
        // und es fällt nie ein Schatten.
        directionalLight.shadow.camera.updateProjectionMatrix();
        // DIE WURF-EBENE (K72, `_wurfEbene`): die Schatten-Kamera sieht NUR SHADOW_TWIN_LAYER — die Ebene, die `castShadow`
        // jedes Knotens trägt; die Haupt-Kamera (nur Layer 0) sieht sie nie. r184 behält eine Schatten-Maske mit einem Bit
        // jenseits der 0 (`updateShadow`, gate:vendor-anker) und projiziert damit nur Werfer — vorher sah die Kaskade die
        // Welt-Ebene und verwarf 39–72 Nicht-Werfer je Render erst nach Projektion und Sortierung. VOR der CSM-Konstruktion
        // setzen: `light.shadow.clone()` kopiert die Maske in jede Kaskaden-Kamera; der Fallback nutzt dieselbe shadow.camera.
        directionalLight.shadow.camera.layers.set(AnazhRealm.SHADOW_TWIN_LAYER);
        scene.add(directionalLight);
        // Light-Target in den Szenengraph hängen, damit sein matrixWorld pro Frame aktualisiert wird —
        // _applyDayNightToScene setzt es auf den Spieler, das Shadow-Frustum folgt ihm.
        scene.add(directionalLight.target);
        // Schatten-CSM: DREI Kaskaden innerhalb der Schatten-Reichweite (maxFar = die EINE Größe aus
        // `_applyEffectiveShadowRange`, 180–306 m) — die Kontakt-Kaskade bis `SCHATTEN_KASKADE.kontaktM` (15 m, schatten.K1),
        // dann Band 0 bis zur `DETAIL_CASCADE`-Kante (~108 m), dann der Rest bis maxFar. Gemessen 02.10.: die Band-1-Kante
        // (367 m) lag jenseits jeder geregelten Reichweite, die dritte Kaskade klemmte auf 0,95 und deckte einen 5-%-Streifen (285–300 m), für
        // den sie alle Werfer ein drittes Mal zeichnete. Die Box jeder Kaskade misst der Host (`_kaskadenPassen`
        // ersetzt das Addon-updateBefore: Frustum-Scheibe im Licht-Raum statt Diagonal-Quadrat), die Werfer wählt
        // jeder Pass selbst (`_passSicht` an scene.onBeforeRender); `fade` weicht den Übergang. Den Bias setzt jede
        // Kaskade bei ihrem Fit aus dem EINEN Gesetz (`_schattenBias` in `_kaskadeFit`, setShadowBias stellt ihn live),
        // die Karten-Größe folgt der Texel-Dichte (`_kaskadenKarten`). Ohne Vendor-Symbol bleibt die EINE Map.
        if (typeof THREE.CSMShadowNode === "function") {
            try {
                const bands = AnazhRealm.DETAIL_CASCADE;
                const span = this._voxelChunkConfig(0).span; // 43.2 m
                const e0 = (bands[0].maxRing + 0.5) * span; // Band-0-Kante ~108 m
                // DIE KONTAKT-KASKADE davor (schatten.K1): die ersten `kontaktM` Meter in eigener Karte (`texelM[0]`).
                const kontakt = AnazhRealm.SCHATTEN_KASKADE.kontaktM;
                const csm = new THREE.CSMShadowNode(directionalLight, {
                    cascades: 3,
                    maxFar: _shRange * AnazhRealm.SCHATTEN_FERN_FAKTOR, // der Regler fährt es live nach
                    mode: "custom",
                    customSplitsCallback: (cascades, near, far, breaks) => {
                        breaks.push(kontakt / far, Math.min(0.85, e0 / far), 1);
                    },
                });
                csm.fade = true;
                csm._init = (builder) => this._kaskadenGeburt(csm, builder);
                // DIE HORIZONT-KARTE (D3) jenseits der Kaskaden: dort gibt die CSM 1 zurück (ihre Kaskaden enden bei maxFar) —
                // ihr EINER Knoten (einmal je Instanz gebaut, der Eingriff in 07.js) trägt die Sicht der Karte für jeden
                // Empfänger (Boden, Ring, Baum, Haus); `receivedShadowNode` eines Stoffs wirkt nur je Kaskade.
                const aufbauEin = csm.setup;
                const welt = this;
                let mitHorizont = null;
                csm.setup = function (builder) {
                    if (mitHorizont === null) mitHorizont = aufbauEin.call(this, builder).mul(welt._horizontSicht());
                    return mitHorizont;
                };
                // Die Lichter stellt der Haupt-Pass VOR jeder Karte (`_passSicht` → `_kaskadenPassen`). Das Addon
                // stellte sie im Knoten-updateBefore — r184 ruft es NACH den Kaskaden-Pässen (gemessen 04.10.: k0 · k1
                // · Fit), jede Karte lief mit der Box des Vor-Frames. Sein zweiter Schreiber fällt mit:
                // `updateFrustums` (Reichweiten-Wechsel, _applyEffectiveShadowRange) schrieb das Diagonal-Quadrat in
                // jede Kaskaden-Kamera — die Box schreibt EINER, der Fit (Brüche und Frusta rechnet updateFrustums
                // weiter).
                csm.updateBefore = () => {};
                csm._updateShadowBounds = () => {};
                directionalLight.shadow.shadowNode = csm;
                this.state.csmNode = csm;
                this.log("Schatten-CSM aktiv (2 Kaskaden: Band 0 · Rest bis zur Schatten-Reichweite)", "INFO");
            } catch (e) {
                throw this._stoffBruch("die Schatten-Kaskaden (CSM)", e);
            }
        }
        // DIE SICHT JE PASS: der Hauptpass liest das Haupt-Urteil der Region-Bundles, jeder Schatten-Pass sein eigenes
        // (r184 ruft die Szenen-Haken vor der Projektion und nach dem Pass, auch im verschachtelten Schatten-Render).
        scene.onBeforeRender = (_r, _s, kamera) => this._passSicht(kamera, false);
        scene.onAfterRender = (_r, _s, kamera) => this._passSicht(kamera, true);
        // KEIN Studio-Füll-Rig in der Welt (V18.503): Fill · Rim · Back ersetzen im Labor den Himmel, den
        // es nicht hat — die Welt hat ihn (die Himmels-Umgebung aus dem SICHTBAREN Himmel). Gemessen 01.10.
        // an einer 50-%-Fläche: mit Rig las die Schattenseite so hell wie die Sonnenseite (208 vs 214),
        // ohne Rig 145 vs 219 — das Verhältnis der Realität (0,16–0,21).
        // Welle 6.G3 — Refs cachen für tickDayNight. Eine Quelle der Wahrheit
        // (Lights+Skybox werden aus state.timeOfDay abgeleitet pro Frame).
        this.state.ambientLight = ambientLight;
        this.state.directionalLight = directionalLight;
        // HemisphereLight: skyColor oben, groundColor unten, gemischt über normal.y → Tiefe ohne dynamische
        // Schatten. Die Werte sind nur Saat; _applyDayNightToScene überschreibt (Farbe der Nachthimmel des
        // Gesetzes, Ground aus worldFieldAt).
        const hemiLight = new THREE.HemisphereLight(0x88a0c8, 0x3a2818, 0.55);
        scene.add(hemiLight);
        this.state.hemiLight = hemiLight;
        // DIE LUFT (`scene.fogNode`): die EINE Luftperspektive für jedes Material; Farbe, Extinktion und Sonne
        // synct _applyDayNightToScene. Ungebautes deckt der Fern-Ring (Loch-Deckel), nie ein Nebel-Kokon.
        this._luftEnsure();
        this.log("Beleuchtung hinzugefügt: Ambient (0.6), Directional (1.0) mit Schatten", "INFO");
        // Welle 6.G3 — initialer Lichtstand aus timeOfDay (Default 0.5 = Mittag).
        // Pro-Frame-Tick übernimmt danach.
        if (typeof this._applyDayNightToScene === "function") {
            this._applyDayNightToScene();
        }

        const camera = new THREE.PerspectiveCamera(
            AnazhRealm.KAM_FOV_GRAD,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.state.camera = camera;
        this.log("Kamera initialisiert", "INFO");
        this.state.selfAwareness.components.push("camera");

        // DIE SEITE (`_weltAbschied`): was init bis hier schrieb, trägt jeder Welt-Wechsel am Ort — die Felder am Wirt, die
        // Glieder des Zustands, die init neu setzte (Renderer, Szene, Himmel, Licht, Uniformen, Eingabe, Einstellungen), und
        // die Gestalten der Szene; was ab hier entsteht, gehört der Welt (Leib, Stand, Gelände, Leben) und fällt mit ihr
        const geburt = this._zustandGeburt;
        delete this._zustandGeburt;
        this._seite = {
            felder: new Set(Object.keys(this)),
            zustand: Object.keys(this.state).filter(
                (k) => !AnazhRealm.WELT_GRENZE.ankunft.includes(k) && geburt[k] !== this.state[k]
            ),
            szene: new Set(scene.children),
        };
        this._seite.felder.add("_seite");
        await this._weltAnkunft();
        // die Welt steht: Eingabe, Tor und Schleife der Seite (nur init — der Welt-Wechsel am Ort trägt sie weiter)
        // DER LADESCHIRM HÄLT JEDE TASTE (Gegenprüfung Runde 2; Integration V18.536, Gelb 2 der dritten v1-Gegenprüfung): EIN
        // Fänger in der Capture-Phase des Fensters läuft vor jedem anderen Hörer (Spiel, Omnibox Strg+K, Schubladen-Esc,
        // Werkstatt-Tasten, Portal-Weitergabe, Chat-Feld) — solange der Ladeschirm steht, endet jedes Tasten-Ereignis hier.
        // Vorher hielt nur der Spiel-Hörer an: Strg+K öffnete die Omnibox hinter dem Ladeschirm und führte Befehle aus. Die
        // Taste des Browsers (Neuladen, Zoom) bleibt ihm (kein preventDefault).
        for (const art of ["keydown", "keyup"])
            window.addEventListener(
                art,
                (event) => {
                    if (this._ladeschirmSteht()) event.stopImmediatePropagation();
                },
                true
            );
        window.addEventListener("keydown", (event) => {
            // Ist ein Portal offen, ist die Heimat-Welt eingefroren: nur Esc verlässt das Portal, alle anderen
            // Tasten sind gesperrt. Mit Fokus im iframe meldet die Sub-Welt Esc selbst (skeleton.js →
            // {type:"exit"}).
            if (this._portalOverlay) {
                if (event.key === "Escape" && this._verbTaste("cancelBuild", true)) event.preventDefault();
                return;
            }
            // Wenn der Fokus in einem Eingabe-Feld liegt (Chat), keine
            // Spiel-Aktionen aus den Tasten lösen — sonst tippt der User
            // "1" und es geht in den Bau-Modus statt in den Chat.
            const target = event.target;
            const inInput =
                target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
            // Inventar offen + Esc → schließen (der Auslöser, `_verbTaste` cancelBuild). WASD/Space/Hotbar laufen weiter (nur
            // Maus-Look ist gesperrt, via exitPointerLock beim Öffnen).
            if (this.state.inventoryOpen && event.key === "Escape") {
                if (this._verbTaste("cancelBuild", true)) event.preventDefault();
                return;
            }
            // Rebind-Capture: die nächste Taste wird gefangen; Escape bricht ab, jeder andere Code bindet via
            // _completeKeybindRebind.
            if (this.state.keybindRebind && !inInput) {
                const code = this._eventToBindingCode(event);
                if (code) {
                    this._completeKeybindRebind(code);
                    event.preventDefault();
                }
                return;
            }
            // keys-Setzung erst NACH dem inInput-Check — sonst läuft der Avatar beim Tippen im Chat.
            if (inInput) return;
            // DAS GESPRÄCH (Leben-Schau 07.10., L3): die Chat-Taste (Enter) öffnet das Feld — vorher öffneten Enter, T und
            // „/" nichts, der Spieler musste Esc drücken und ins Feld klicken. Keine Spiel-Taste fällt dabei an. Liegt der
            // Fokus auf einem bedienbaren Element (`_uiBedienFokus`) oder hat ein Element die Taste schon verbraucht, gehört
            // sie ihm (Gegenprüfung Runde 1: Enter auf einem Knopf öffnete zusätzlich den Chat und nahm ihm den Fokus).
            if (this._actionForBindingCode(event.code) === "chat") {
                if (event.defaultPrevented || this._uiBedienFokus(target)) return;
                if (this._chatOeffnen()) event.preventDefault();
                return;
            }
            // DIE TASTATUR in die Verb-Tafel (leib.K5): die rohe Taste für den Sammler (die Pfeile schreiben die KANONISCHEN
            // Bewegungs-Tasten über PFEIL_ALIAS), die Aktion (Belegung · feste Taste · Ziffer · Fähigkeit) an den EINEN Auslöser.
            this.state.keys[event.key.toLowerCase()] = true;
            const _pfeil = AnazhRealm.PFEIL_ALIAS[event.key];
            if (_pfeil) this.state.keys[_pfeil] = true;
            const aktion = this._tastenAktion(event);
            if (aktion && this._verbTaste(aktion, true)) event.preventDefault();
        });
        window.addEventListener("keyup", (event) => {
            this.state.keys[event.key.toLowerCase()] = false;
            // FAHR-ABSCHLUSS (19.07.) — der Pfeil-Alias löst symmetrisch; das Lösen der Aktion beendet ihr Halten (Zoom, Mahlen).
            const _pfeil = AnazhRealm.PFEIL_ALIAS[event.key];
            if (_pfeil) this.state.keys[_pfeil] = false;
            const aktion = this._tastenAktion(event);
            if (aktion) this._verbTaste(aktion, false);
        });
        // DIE TASTEN-WAND (Welle L, Befund V-k4): verliert das Fenster den Fokus (Fensterwechsel), wird die Seite
        // unsichtbar oder fällt der Zeiger-Lock, erreicht das keyup der gehaltenen Taste diese Seite nie — W blieb
        // gedrückt, der Avatar lief 4,63 m in 278 Frames ohne Taste. Jeder dieser Wechsel löst ALLE Tasten.
        window.addEventListener("blur", () => this._alleTastenLos());
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") this._alleTastenLos();
        });
        this.log("Tastatureingaben initialisiert: WASD, Space, Shift", "INFO");

        // Maus-Listener-Bindung als Methode (initial-Canvas).
        this._attachWorldCanvasInputListeners(canvas);
        // Scrollrad zyklt durch die Hotbar-Slots (deltaY > 0 → nächster, Modulo 9). Listener auf `window`
        // (Capture), nicht auf canvas: ohne Pointer-Lock (Drawer offen) sähe der Canvas das Event nicht.
        // Die Werkstatt-CAD-Canvas stoppt ihr Wheel-Event selbst (stopPropagation) — CAD-Zoom bleibt.
        window.addEventListener(
            "wheel",
            (event) => {
                if (this.state.inventoryOpen) return;
                if (this.state.keybindRebind) return;
                // Toleranter Pfad statt strict isPointerLocked: das Mausrad wirkt, wenn das Event aus dem
                // Welt-Canvas kommt, kein Drawer offen ist (uiActiveDrawer null) und kein Form-Input fokussiert ist.
                const target = event.target;
                const inInput =
                    target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
                if (inInput) return;
                // Wenn ein Drawer offen ist (target im Drawer), Native-Scroll lassen.
                if (target && typeof target.closest === "function" && target.closest(".drawer")) return;
                // CAD-Werkstatt-Canvas hat eigenen Wheel-Handler (Zoom),
                // den nicht überschreiben.
                if (target && typeof target.closest === "function" && target.closest("#workshop-preview-canvas"))
                    return;
                event.preventDefault();
                this._verbTaste(event.deltaY > 0 ? "slotVor" : "slotZurueck", true);
            },
            { passive: false, capture: true }
        );
        document.addEventListener("pointerlockchange", () => {
            this.state.isPointerLocked = document.pointerLockElement === canvas;
            // IM SPIEL (spielgang.K3): mit dem Zeiger gehört das Bild der Welt — Menü-Leiste, Status-Zeile, Konsole weichen
            document.body.classList.toggle("im-spiel", this.state.isPointerLocked);
            // V17.55 W1 — verliert der Spieler den Lock (Esc/UI), stoppt das Mahlen und jede gehaltene Taste (V-k4).
            if (!this.state.isPointerLocked) this._alleTastenLos();
            this.log(`Pointer-Lock: ${this.state.isPointerLocked ? "Aktiv" : "Inaktiv"}`, "INFO");
        });
        // DIE MAUS dreht über die Verb-Tafel: das Bild verbraucht den Blick vor der Sim (`_eingabeTakt`), wie den Stick
        document.addEventListener("mousemove", (event) => {
            if (this.state.isPointerLocked) {
                this.state.verbTafel.blickGier -= event.movementX * this.state.mouseSensitivity;
                this.state.verbTafel.blickNeig -= event.movementY * this.state.mouseSensitivity;
            }
        });
        this.log("Maussteuerung für Kamera initialisiert", "INFO");

        window.addEventListener("resize", () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            // B4 (V18.130) — die CSM-Frusta hängen an der Kamera-Projektion
            // (Addon-Vertrag: „call every time you change camera settings").
            if (this.state.csmNode && this.state.csmNode.camera) this.state.csmNode.updateFrustums();
            // setSize legt Szene-Tiefe und Tiefen-Abbild im nächsten Frame neu an; die Leser folgen der neuen Textur über die
            // EINE Refresh-Entscheidung der Diät (Vorher-Textur-Wächter, `_diaetVorTextur`) — wie bei jedem anderen Wechsel
            // der Pixel-Ratio. Kein Neubau hier: der frühere Wasser-Neubau war ein Zwilling des Wächters (0910-3 A).
            this.log("Fenstergröße angepasst", "INFO");
        });

        // Das Feld: Enter sendet und gibt die Welt zurück, Esc gibt sie ohne Senden zurück (L3: nach dem Senden blieb
        // der Fokus im Feld, W tippte ein „w", der Avatar stand).
        const chatInput = document.getElementById("chat-input");
        chatInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                const satz = chatInput.value.trim();
                if (satz) this.processChatCommand(satz);
                this._chatSchliessen();
                event.preventDefault();
            } else if (event.key === "Escape") {
                this._chatSchliessen();
                event.preventDefault();
            }
        });
        this.log("Chat-Steuerung initialisiert", "INFO");

        const fileInput = document.getElementById("state-file-input");
        if (fileInput) {
            fileInput.addEventListener("change", (event) => {
                const file = event.target.files && event.target.files[0];
                if (file) this.handleStateFile(file);
            });
            this.log("State-Import (Lade Datei) initialisiert", "INFO");
        }

        // Voxel ist permanent ab Init (`state.voxelTerrainActive = true`); die initialen Chunks streamt der
        // Ring im Game-Loop — keine Welt-Init-Geste nötig.

        this._weltAnschluss(weltVerbunden);
        this.core.startEternalLoop();
        this.log("Hauptschleife gestartet – Ultiversum pulsiert!", "INFO");
    }

    // DIE VORLADE DER WELT (init und der Welt-Wechsel am Ort, `_weltAmOrt`): Identität, Erbgut, Pass, Rolle, Physik, Nexus der
    // aktiven Welt. → ob die Welt verbunden erwacht (Rolle host oder guest)
    async _weltVorlauf() {
        // Aktive Welt-Identität VOR ensureWorldMeta laden, sonst triggert fresh=true (neue UUID + Genesis)
        // für eine bestehende Welt. Migriert nebenbei einen Legacy-Single-Welt-Save. DIE RETTUNGS-KETTE DES BOOTS
        // (Gegenprüfung Runde 4): erst der IndexedDB-Stand der aktiven Welt (V18.151, Faden #6), dann fragt die Vorlade die
        // EINE Kette (IndexedDB ⇄ Abbild am Stempel → .bak), BEVOR ensureWorldMeta eine neue Id vergibt.
        await this._idbPreload();
        this._preloadActiveWorldMeta();
        this.ensureWorldMeta();
        // EINE NEUE WELT NUR, WENN DIE KETTE LEER IST — UND DANN LAUT: was gefunden wurde, warum frisch.
        if (this._bootLeer) {
            const b = this._bootLeer;
            const satz = b.id
                ? `Die Welt ${b.id} ließ sich nicht finden (${b.befund.join(", ")}) — eine neue Welt erwacht.`
                : `Kein gespeicherter Stand (${b.befund.join(", ")}) — eine neue Welt erwacht.`;
            this.log(satz, b.id ? "ERROR" : "INFO");
            this._chatEcho(satz);
        }
        // Die Empfänger-Wand des Erbguts (fail-closed): ein Erbgut, das dieser Build nicht trägt, lässt die Welt nicht
        // erwachen — der Wurf landet auf dem Ladeschirm (`_bootAnazhRealm`), nie fährt sie still als Wildnis.
        this._erbgut();
        // Vibe-Pass laden oder beim ersten Erwachen erzeugen — nach ensureWorldMeta, damit die
        // Genesis-Erinnerung ins Journal der aktiven Welt fließt (die Identität ist welt-unabhängig).
        await this._ensureVibePass();
        // Welle 6.E2 — Intro-Overlay beim ersten Welt-Start. Liest seen.intro
        // aus dem soeben hydrierten worldJournal + localStorage `anazh.ui.skipIntro`.
        this._firstWorldWelcome();
        // Auto-Connect, wenn der Spieler die Verbindung aktiv gelassen hat oder worldMeta.role host/guest
        // ist (welt-intrinsischer Modus); ensureWorldMeta lief schon, die worldId ist Raum-Default.
        // Die Absicht setzt die Tür selbst (initP2PSync); Guests bekamen vom Importer hostInfo.url ins localStorage
        // gespeichert, p2pLoadPersisted oben hat das schon aufgenommen. Verbunden wird erst mit stehendem Leib (vor der
        // Hauptschleife, unten): vorher kannte der Partner die Seite den ganzen Weltbau lang, ohne dass ein Takt von ihr kam.
        const weltRolle = this.state.worldMeta ? this.state.worldMeta.role : null;
        const weltVerbunden = weltRolle === "host" || weltRolle === "guest";
        if (weltVerbunden) this.state.p2p.role = weltRolle;
        try {
            await this.core.initPhysics();
            this.log("Physik erfolgreich initialisiert", "INFO");
        } catch (error) {
            this.log(`Physik fehlgeschlagen: ${error.message} – Ohne Physik fortfahren`, "ERROR");
            this.state.physicsWorld = null;
        }

        try {
            this.initializeNexus();
            this.log("Nexus erfolgreich initialisiert", "INFO");
        } catch (error) {
            this.log(`Nexus-Initialisierung fehlgeschlagen: ${error.message} – Ohne Nexus fortfahren`, "ERROR");
        }
        return weltVerbunden;
    }

    // DIE ANKUNFT DER WELT (init und der Welt-Wechsel am Ort): der Leib, der Stand der aktiven Welt, das Buch in ihr, ihr
    // Gelände — erst dann Eingabe, Tor und Schleife.
    async _weltAnkunft() {
        const scene = this.state.scene;
        // Spieler-Mesh = THREE.Group als Anker (Position + Skalierung); applyPlayerSoul füllt ihn — EIN Pfad
        // für initialen Bau und späteren Wechsel.
        const initialGroup = new THREE.Group();
        initialGroup.position.set(0, 20, 0);
        initialGroup.visible = true;
        scene.add(initialGroup);
        this.state.playerMesh = initialGroup;
        const initialSoul =
            this.state.player.soul && this.playerSoulDefs[this.state.player.soul] ? this.state.player.soul : "human";
        // Der Avatar-Bau blockt den Boot nicht: die Skin-Isosurface ist die große synchrone Blockade
        // (~1.9 s bei res 56). Headless baut synchron (das Gate braucht den Avatar sofort); sonst
        // deferiert — bis dahin ist der Spieler die leere Anker-Group (Physik/Kamera/Bewegung laufen).
        // applyPlayerSoul trägt den Physik-Body aufs fertige Mesh über.
        if (this.state.renderer && this.state.renderer._isHeadlessNull) {
            this._syncBauen("naht", () => this.applyPlayerSoul(initialSoul)); // der Null-Renderer des Gates (`SYNC_STELLEN`)
        } else {
            this.state._deferredAvatarSoul = initialSoul;
        }
        this.log("Spieler erstellt: Position (0, 20, 0), Soul + Schatten aktiviert", "INFO");
        this.state.selfAwareness.components.push("playerMesh");

        // Kein Ammo-Spieler-Body: der Spieler läuft feld-nativ (`_stepCharacter`) — horizontale
        // Intent-Velocity in `state.playerVel` (angelegt in `initPhysics`), Vertikale in `_fieldVy`,
        // Kollision liest das Dichtefeld.
        this.state.playerVel.setValue(0, 0, 0);
        this.state._fieldVy = 0;
        this.state.selfAwareness.components.push("fieldController");

        // Der Zustand der aktiven Welt: dieselbe Rettungs-Kette wie die Vorlade (IndexedDB ⇄ Abbild → .bak; der IDB-Stand
        // des Boot-Vorlaufs wird hier verbraucht).
        this.loadState();
        this._foundryWirtSteht(); // das Buch, das mit der Seite kam, geht jetzt in die Welt (B3a)
        // die Welt steht, wenn ihre Heimat aus dem Voxel-Faden kommt (Karte hydro-faden): erst dann Eingabe, Tor und Schleife
        await this.generateNewWorld();
    }

    // DER ANSCHLUSS DER ANGEKOMMENEN WELT (init und der Welt-Wechsel am Ort): das Tor des Wohnens, dann die Leitung.
    _weltAnschluss(weltVerbunden) {
        // W18-D — wohnt der Spieler in einer Fremd-Welt, kehrt der Boot
        // durch das Tor zurück (die Heimat trägt darunter eingefroren).
        this._portalDwellingBootReturn();
        // der Leib steht, die Schleife beginnt: jetzt erst die Leitung (s. o., Auto-Connect)
        if (this.state.p2p.enabled || weltVerbunden) this.initP2PSync(null);
    }

    // Kein Renderer-Hot-Swap nach WebGL: NodeMaterials rendern nur auf WebGPURenderer (schwarze Welt).

    // DAS ERSTE WELTBILD (Leben-Schau 07.10., L2): ein neuer Spieler sah als erstes Bild die schwarze Leinwand unter fertiger
    // UI — gemessen auf der Radeon 3,7 s bis 25,5 s nach dem Laden (der Weltbau hält den Haupt-Thread), dann sprang die Welt
    // herein. Der Ladeschirm (index.html, `#ladeschirm`) steht ab dem ersten Bild der Seite (sein Glimmen läuft im
    // Compositor weiter, auch wenn der Weltbau den Haupt-Thread hält) und weicht nach dem ersten Frame, in dem das Weltbild
    // FERTIG ist (`_weltbildFehlt` leer): Gegenprüfung Runde 1 — er wich, sobald der eigene Chunk stand, das erste Weltbild
    // (Radeon, 15,9 s) zeigte die Welt ohne einen Baum und die Portale als Platzhalter. Bis dahin sagt die Stand-Zeile, worauf
    // die Welt wartet. Ruht die Arbeit (dieselbe Lücke WELTBILD_STILL_MS lang, nichts wächst), weicht er LAUT: das Log nennt,
    // was fehlt — ein Bau, den das Studio nie liefert, hält den Spieler nie vor der Welt fest.
    _ankunftsBild() {
        const st = this.state;
        if (st._weltbildDa) {
            if (st._nachlauf != null) this._nachlaufTakt();
            return true;
        }
        const luecken = this._weltbildLuecken();
        const fehlt = luecken.map((l) => l.satz);
        if (fehlt.length) {
            const jetzt = performance.now();
            const sig = fehlt.join(" · ");
            if (st._weltbildErsteFrage == null) st._weltbildErsteFrage = jetzt;
            // DIE RUHE IST RUHE (K60): die Uhr läuft nur, solange für keine Lücke etwas unterwegs ist (`arbeitet`). Befund
            // Prüfung K60-1 (m1-6B, Radeon kalt unter Fremdlast): Ring 1 von 4 s bis 19 s, das Buch kam nach 19,6 s — die
            // Stand-Zeile blieb gleich, während beide Fäden arbeiteten, und der Ladeschirm wich nach 15 s „Ruhe" mit dem
            // halben Bild (kein Baum, kein Horizont). Was nie kommt, fängt der Deckel.
            if (st._weltbildLuecke !== sig || luecken.some((l) => l.arbeitet)) {
                st._weltbildLuecke = sig;
                st._weltbildLueckeSeit = jetzt;
            }
            // DER DECKEL (Gegenprüfung Runde 2): eine Lücke, deren Zahl ständig flackert, setzte die Ruhe-Uhr je Wechsel neu
            // und hielt den Ladeschirm ohne Grenze — nach WELTBILD_DECKEL_MS ab der ersten Frage weicht er laut wie bei Ruhe.
            const gedeckelt = jetzt - st._weltbildErsteFrage >= AnazhRealm.WELTBILD_DECKEL_MS;
            if (!st.playerMesh || (!gedeckelt && jetzt - st._weltbildLueckeSeit < AnazhRealm.WELTBILD_STILL_MS)) {
                this._ladeschirmStand(sig);
                return false;
            }
            const taeter = luecken.map((l) => this._lueckeTaeter(l)).filter(Boolean);
            this.log(
                (gedeckelt
                    ? `Das erste Weltbild steht ohne: ${sig} — der Deckel von ${AnazhRealm.WELTBILD_DECKEL_MS} ms ist erreicht.`
                    : `Das erste Weltbild steht ohne: ${sig} — die Arbeit ruhte ${AnazhRealm.WELTBILD_STILL_MS} ms.`) +
                    (taeter.length ? ` Täter: ${taeter.join(" · ")}` : ""),
                "WARN"
            );
        }
        this._weltbildSteht();
        return true;
    }

    // DER TÄTER EINER LÜCKE beim Namen (Gebot 10): das erste Ding, das sie offen hält (`zeuge` aus `_weltbildLuecken`) — seine Art,
    // Stufe und Abstand und warum es hält: ungebaut (keine Instanz, kein Mesh) oder der Stufen-Vorlauf, dessen Arena weder
    // zeichnete noch vorbaute (`_vorlaufOffen`, ihr Schlüssel). null ohne Zeugen.
    _lueckeTaeter(l) {
        const e = l && l.zeuge;
        if (!e || !e.position) return null;
        const p = this.state.playerMesh ? this.state.playerMesh.position : e.position;
        const wer = `${this._foundryPresetForEntry(e) || e.type} L${e._lodLevel} in ${Math.round(Math.hypot(e.position.x - p.x, e.position.z - p.z))} m`;
        if (!this._archIsRendered(e)) return `${wer} ungebaut`;
        const E = this._erstZeichnung;
        const G = this.state.archInstanceGroups;
        const offen = (e.instSlots || [])
            .map((ref) => [ref.key, G && G.get(ref.key)])
            .filter(([, g]) => g && g.mesh.layers.mask & 1)
            .filter(
                ([, g]) =>
                    !(g.mesh.__arena && E && (E.gezeichnet.has(g.mesh.__arena) || E.vorgebaut.has(g.mesh.__arena)))
            )
            .map(([k]) => k);
        return `${wer} im Stufen-Vorlauf, ${offen.length ? "Arena ohne Programm: " + offen.join(", ") : "wartet auf das Bild nach seinen Arenen"}`;
    }

    // Der EINE Schreiber des ersten Weltbilds: seine Zeit (`_weltbildDa`, ab Navigation — gate:boot-stage liest sie), das
    // Ereignis für jeden Wartenden (`_weltbildKommt`), dann weicht der Ladeschirm.
    _weltbildSteht() {
        const st = this.state;
        st._weltbildDa = performance.now();
        st._nachlauf = 0;
        st._rundumDa = null;
        // die Ankunft aus der Ferne gleitet ab jetzt über die gezeichneten Bilder (`_ankunftsFerne`); der Null-Renderer
        // zeichnet keins — dort gilt die Distanz-Stufe ab dem Bild
        if (st.renderer && !st.renderer._isHeadlessNull) st._ankunftGleit = 0;
        this._ersterBlickAus();
        const w = st._weltbildWarten;
        st._weltbildWarten = null;
        if (w) w.erfuellt(st._weltbildDa);
        this._ladeschirmWeg();
    }
    // DER KOPF DER ANKUNFTS-KETTE geht mit dem Buch (`_foundryIngestBook`, B5), vor jedem Baum ins Werk: der Leib des Spielers
    // (`_ofenSpielerVorlagen`, die Stufe seines ersten Bilds — K60-2: bestellte erst der nächste Takt, stand der Guss hinter
    // zwölf Bäumen); er wartet im Werk hinter dem Blatt-Atlas. Das Start-Dorf ist ein WARTENDER am Buch (`_startDorfAmBuch`,
    // K22): rief der Ingest seinen Export, schloss die Dorf-Kette über die Ort-Wahl (`_ortWahl`) einen Zeit-Kreis
    // zurück in den Ingest (gate:v1-pfad W7).
    _buchKoepfe() {
        if (this.state._deferredAvatarSoul) this._ofenSpielerVorlagen();
    }

    // DIE ANKUNFT AUS DER FERNE (B2, die EINE Zahl der Ankunfts-Stufe): bis das erste Weltbild steht, misst jede Stufen-Wahl
    // jedes Ding, als stünde der Spieler ANKUNFT_FERNE-mal weiter weg — der Baum trägt seine Karte (die Höhen-Stufe L1 und
    // der Bake, nie die L0), der Bau seine Grobstufe (die L2 und ihr Wurf): das erste Bild wartet auf keine feinere Stufe
    // als die billigste ganze. Danach gleitet der Faktor über ANKUNFT_GLEIT_BILDER gezeichnete Bilder auf 1
    // (`_ankunftGleit`, gezählt im Zeichen-Takt neben `uLodPerf`): jede Baum-Gestalt verfeinert durch ihr bestehendes Band
    // (Lehre 26), der Bau nach seinen Grenzen mit Hysterese (K43/K64: das Ring-Tor in 11 m hält seine L2). Zwei Leser, EINE
    // Zahl: die Wahrnehmungs-Distanz der Karten-Arten (`_lodPerceptionDistance`, CPU-Wahl UND Shader-Maske `uLodPerf`) und die
    // Grenzen der Bauten
    // (`_tickArchitectureLOD`, `_foundryLodForEntry`). Ohne Studio-Welt trägt keine Karte: 1.
    _ankunftsFerne() {
        const st = this.state;
        if (!this._foundryEnabled()) return 1;
        if (!st._weltbildDa) return AnazhRealm.ANKUNFT_FERNE;
        const g = st._ankunftGleit;
        const N = AnazhRealm.ANKUNFT_GLEIT_BILDER;
        return g >= 0 && g < N ? Math.pow(AnazhRealm.ANKUNFT_FERNE, 1 - g / N) : 1;
    }

    // DER STUFEN-VORLAUF (profiband K4 „keine Hänger", Hänger-Linse 25.10.) — das Gegenstück der Ferne: unter dem Ladeschirm
    // trägt je Karten-Art der nächste Baum im ersten Blick seine L1 (die Höhen-Stufe, die seine Karte schon dockte), voll
    // gehalten und ohne Band-Partner, damit das Programm jeder Stufen-Arena in jedem Pass entsteht, bevor der Spieler die
    // Kontrolle hat. Befund headless (Mess-Wiese, `haenger 60 --wandern bahn`, 4 von 4 Sitzungen): der EINE einmalige Auftrag
    // im Gang war der kalte Programm-Schlüssel der Tannen-Arena (1–2 Knoten-Bauten Σ 52–158 ms, 2–4 Shader-Module, 1–2
    // Pipelines); die Radeon (loadScale 0,01–0,06) trifft die L1-Grenze erst im Gang — je Sitzung EIN GPU-Hänger 200–243 ms —,
    // die GTX (0,29–0,57) vor der Messung. Einmal gebaut, bleibt das Programm der Sitzung (`_renderObjekteLoesen`: der
    // Knoten-Bau gehört seinem Schlüssel, die Pipeline dem Cache). Die Wahl läuft je Lade-Bild mit den Lücken
    // (`_weltbildLuecken`), der Baum hält das Bild als wachsender („bauten"), bis seine Arenen zeichneten (`_vorlaufOffen`);
    // die Kaskaden, deren Box er nicht trifft, baut der Vorbau der Erst-Zeichnung (`_renderObjectDirect`). Er trägt seine L1
    // bis zum Bild — ihr Wechsel zur Karte fällt unter die Blende des Ladeschirms. Der Null-Renderer baut keine Programme:
    // dort wählt sie nie.
    _stufenVorlaufWahl(p, R, imBlick) {
        const st = this.state;
        if (st._weltbildDa || !st.renderer || st.renderer._isHeadlessNull) return;
        const V =
            this._vorlauf ||
            (this._vorlauf = {
                arten: new Map(),
                eintraege: new WeakSet(),
                artVon: new Map(),
                bild: new WeakMap(),
                t: 0,
            });
        const jetzt = performance.now();
        if (jetzt - V.t < AnazhRealm.LADE_BILD_MS) return;
        V.t = jetzt;
        const best = new Map();
        for (const e of st.architectures || []) {
            if (!e || !e.position || !e._lodSpecies || !Number.isFinite(e._lodVariantIndex)) continue;
            const d2 = (e.position.x - p.x) ** 2 + (e.position.z - p.z) ** 2;
            if (d2 > R * R || !imBlick(e.position.x, e.position.z)) continue;
            if (!V.artVon.has(e._lodSpecies)) {
                const preset = this._foundryPresetForEntry(e);
                V.artVon.set(e._lodSpecies, preset && this._foundryPresetIsTree(preset) ? preset : null);
            }
            const preset = V.artVon.get(e._lodSpecies);
            if (!preset || V.arten.has(preset) || (best.has(preset) && best.get(preset).d2 <= d2)) continue;
            if (this._foundryStufeBereit(e, preset, 1)) best.set(preset, { e, d2 });
        }
        for (const [preset, { e }] of best) {
            V.arten.set(preset, e);
            V.eintraege.add(e);
        }
        if (best.size) this._bauRegt(); // die Stufen-Wahl geht
    }
    _imStufenVorlauf(e) {
        return !!this._vorlauf && !this.state._weltbildDa && this._vorlauf.eintraege.has(e);
    }
    // Steht das Programm des Vorlauf-Baums? Jede seiner L1-Gruppen, die das Hauptbild sieht, trat in ihre Arena, die Arena
    // zeichnete (`gezeichnet` der Erst-Zeichnung) ODER baute ihr Programm ohne Draw (`vorgebaut`, der Vorbau des
    // Lade-Takts: keine ihrer Instanzen fällt in den Kegel der Kamera), und danach lief ein weiteres Bild (die GPU-Leine
    // zählt sie): in ihm fand jede Kaskade die Form der Arena stehen und baute vor — ein Wurf-Teil (Ebene 0 aus) lebt nur in
    // den Kaskaden. Befund b-ankunft (Radeon kalt, main 8f1802b1, 4 von 4 Läufen): die Rinde der Birke in 31 m am Rand des
    // Blicks zeichnete nie, ihr Programm stand vorgebaut — der Baum hielt das Bild, bis die Ruhe-Uhr nach 15 s laut wich (das
    // halbe Weltbild). Ohne Arena (WebGL2) zeichnet der Zeichner im Bild.
    _vorlaufOffen(e) {
        if (!this._imStufenVorlauf(e)) return false;
        if (e._lodLevel !== 1 || !e.instSlots || !e.instSlots.length) return true;
        const L = this._gpuLeine;
        if (AnazhRealm.__arenaOhne || !L) return false;
        const G = this.state.archInstanceGroups;
        const E = this._erstZeichnung;
        for (const ref of e.instSlots) {
            const g = G && G.get(ref.key);
            if (!g || (g.mesh.layers.mask & 1) === 0) continue;
            const a = g.mesh.__arena;
            if (!a || !E || !(E.gezeichnet.has(a) || E.vorgebaut.has(a))) return true;
        }
        const B = this._vorlauf.bild;
        if (!B.has(e)) B.set(e, L.gerendert);
        return L.gerendert <= B.get(e);
    }

    // DER BLICK DES ERSTEN BILDS (B3d): das erste Weltbild ist, was der Spieler sieht — der waagrechte Kegel der Haupt-Kamera
    // vom Auge der Stufen (`_lodAuge`; in Third die Kamera auf ihrer Kugel) in der EINEN Vorwärts-Richtung (`state.yaw`,
    // `_blickVorn`), so breit wie ihr Bildwinkel (fov × aspect) plus ERSTER_BLICK.randGrad je Seite, dazu die Kugel um das
    // Auge, die den Spieler trägt (sein Abstand + nahM). Befund OMEN 1610-ankunft-menge (GTX kalt): das Tor wartete rundum auf
    // die ganze Mesh-Zone und jede Karte — 33,4 von 71 Bahn-Sekunden lagen außer Blick. Gemerkt je Stand von Kamera, Gier,
    // Bildwinkel und Spieler: der Rang der Foundry-Schlange fragt ihn je Wartenden. null = kein Spieler.
    _ersterBlick() {
        const st = this.state;
        const pm = st.playerMesh;
        if (!pm) return null;
        const cam = st.camera;
        const c = cam ? cam.position : pm.position;
        const p = pm.position;
        const yaw = Number.isFinite(st.yaw) ? st.yaw : 0;
        const fov = cam && cam.fov > 0 ? cam.fov : 75;
        const asp = cam && cam.aspect > 0 ? cam.aspect : 1;
        const B = this._ersterBlickWert;
        if (
            B &&
            B.yaw === yaw &&
            B.fov === fov &&
            B.asp === asp &&
            B.cx === c.x &&
            B.cz === c.z &&
            B.px === p.x &&
            B.pz === p.z
        )
            return B;
        const E = AnazhRealm.ERSTER_BLICK;
        const auge = this._lodAuge();
        const v = this._blickVorn(yaw, 0);
        return (this._ersterBlickWert = {
            yaw,
            fov,
            asp,
            cx: c.x,
            cz: c.z,
            px: p.x,
            pz: p.z,
            ex: auge.x,
            ez: auge.z,
            fx: v.x,
            fz: v.z,
            halb: Math.atan(Math.tan((fov * Math.PI) / 360) * asp) + (E.randGrad * Math.PI) / 180,
            nah: Math.hypot(p.x - auge.x, p.z - auge.z) + E.nahM,
        });
    }
    // Liegt ein Ding (Mitte x/z, Radius r in m) im Blick des ersten Bilds? Ohne Spieler liegt alles darin. `schirm`: nur der
    // Bildwinkel selbst, ohne den Rand ERSTER_BLICK.randGrad — was der Schirm JETZT zeigt (der Rang des Dorf-Zugs, `_dorfZug`).
    _imErstenBlick(x, z, r, schirm) {
        const B = this._ersterBlick();
        if (!B) return true;
        const dx = x - B.ex;
        const dz = z - B.ez;
        const d = Math.hypot(dx, dz);
        const rr = r > 0 ? r : 0;
        const halb = schirm ? B.halb - (AnazhRealm.ERSTER_BLICK.randGrad * Math.PI) / 180 : B.halb;
        if (d <= B.nah + rr || halb >= Math.PI) return true;
        const w = Math.acos(Math.max(-1, Math.min(1, (dx * B.fx + dz * B.fz) / d)));
        return w - Math.asin(Math.min(1, rr / d)) <= halb;
    }
    // Der Schlüssel des Blicks im Rang der Foundry-Schlange (`_foundryAuftragD2`): bis das erste Weltbild steht, trägt ein Ding
    // außer Blick ERSTER_BLICK.ausserD2 obenauf — nah zuerst gilt in beiden Hälften; `_weltbildSteht` nimmt ihn wieder ab.
    _blickRang(x, z) {
        const E = AnazhRealm.ERSTER_BLICK;
        return this._blickDerAnkunft(x, z, E.dingM) ? 0 : E.ausserD2;
    }
    // Gilt ein Ding (Mitte x/z, Radius r) für die Ankunft JETZT? Bis das erste Weltbild steht nur im Blick, danach rundum —
    // die EINE Frage hinter dem Rang der Schlange und der Pflanzung (Lehre 14/25): die Saat eines Chunks (`_foliageChunkInRadius`),
    // eine neue Streu-Region (`_tickScatterStreaming`) und der Baum der Pflanz-Schlange (`_tickPendingVegSpawns`, über
    // `_rangImErstenBlick`) außer Blick warten auf den Nachlauf. Bis hierher säte, streute und setzte der Lade-Takt den ganzen
    // Ring vor dem Bild — je länger der Boot, desto mehr (Radeon kalt, die Kalt-Zeile: die Klasse Pflanzen 5,5–6,4 s Haupt-Faden
    // bei 34–52 s, mit der Frage 2,2 s bei 13 s; bei 11 s Boot trägt der Blick allein 1,7–2,2 s, fast ganz Streu).
    _blickDerAnkunft(x, z, r) {
        return !!this.state._weltbildDa || this._imErstenBlick(x, z, r);
    }
    // Der Rang eines Auftrags (`_foundryAuftragD2`) im Blick des ersten Bilds: außer Blick trägt er ERSTER_BLICK.ausserD2. Die
    // Frage gilt nur VOR dem Bild — danach ist der Blick rundum: ein Rang ohne Ort (Vorrat, Karte ohne Leser: ∞) läge sonst
    // für immer außer Blick, und die Pumpe gäbe ihm nur die leere Bahn (CI 39003506058, gate:takt T5–T8: im Flug 1 statt 12).
    _rangImErstenBlick(rang) {
        return !!this.state._weltbildDa || rang < AnazhRealm.ERSTER_BLICK.ausserD2;
    }
    // Steht das Bild, fällt der Blick-Schlüssel aus dem Bedarf jeder Karte — ab jetzt gilt nah zuerst rundum. Der Rang eines
    // Auftrags, der eine solche Zahl trägt, misst sie frisch (`_foundryAuftragD2`, B5: in Schlange, Flug und Wächter derselbe).
    _ersterBlickAus() {
        const A = AnazhRealm.ERSTER_BLICK.ausserD2;
        const ab = (v) => (Number.isFinite(v) && v >= A ? v - A : v);
        for (const z of this._impostorAtlas().zellen.values()) z._bedarfD2 = ab(z._bedarfD2);
    }

    // Was dem ersten Weltbild fehlt — leer heißt: es steht. Je Lücke ein Satz für die Stand-Zeile (mit ihrer Zahl, die sinkt,
    // solange die Welt wächst): der Boden bis zum Existenz-Boden des Rings (RING_EXIST_FLOOR, sein Sprung unter dem Ladeschirm), der
    // Horizont, der Leib, das Buch der Studios — und IM BLICK (`_imErstenBlick`, B3d) jeder Bau und Baum der Mesh-Zone
    // (`architectureCullingRadius`) gezeichnet, jede Streu-Region, die der Streamer holt, gebaut (`_streuWartet`: keine fehlt,
    // keine wartet auf ihr Asset), keine Karte offen, deren Leser im Blick steht, kein Dorf der Ankunft im Werden (fällig, im
    // Export oder mit Häusern im Blick in der Schlange). Was dahinter liegt, folgt nah zuerst (der Rundblick, gate:ankunft L2a).
    // Jede Lücke hat ihren Leser im ersten Frame; der Vorrat (`_foundryPrefetchLibrary`) hat keinen und hält das Bild nie
    // (K30: das Tor wartete auf `f._prefetching` — Wagen, Siedlungs-Probe, alle Gestalten des Buchs; kalt 25–30 s). Der
    // Stufen-Vorlauf (`_stufenVorlaufWahl`) hält es als wachsender Baum: sein Leser ist der erste Schritt in den Wald, je
    // Karten-Art EIN Baum, gedockt mit seiner Karte.
    _weltbildFehlt(rundum) {
        return this._weltbildLuecken(rundum).map((l) => l.satz);
    }

    // DIE TERME DES ERSTEN WELTBILDS (K60): je Leser des ersten Frames EIN Term mit Namen aus der Liste `WELTBILD_TERME` und
    // seinem Satz. Die Ankunfts-Linse (gate:ankunft L2a) liest die Liste und stellt je Term einen Fall her — ein Term ohne
    // Fall ist ROT beim Namen (die Pflanz-Schlange kam in K60 ohne Fall dazu: ihr Streichen wäre grün geblieben).
    // `rundum`: jede Richtung zählt (der Nachlauf, `_nachlaufTakt`), nicht nur der Blick.
    _weltbildLuecken(rundum) {
        const st = this.state;
        const out = [];
        // `arbeitet`: für diese Lücke ist etwas unterwegs (ein Faden baut an ihr) — die Ruhe-Uhr von `_ankunftsBild` steht;
        // `n`: so viele Löcher trägt sie (der Rundblick zählt sie); `zeuge`: das erste Ding, das sie offen hält — weicht der
        // Ladeschirm laut, nennt sein Satz den Täter (`_lueckeTaeter`)
        const luecke = (term, satz, arbeitet, n, zeuge) =>
            out.push({ term, satz, arbeitet: !!arbeitet, n: n > 0 ? n : 1, zeuge });
        const pm = st.playerMesh;
        if (!pm) {
            luecke("welt", "die Welt entsteht");
            return out;
        }
        // im Blick (B3d): ein Ding mit seinem Radius (ERSTER_BLICK.dingM), ein Boden-Stück mit seiner halben Diagonale
        const ding = AnazhRealm.ERSTER_BLICK.dingM;
        const imBlick = (x, z, r) => !!rundum || this._imErstenBlick(x, z, r > 0 ? r : ding);
        const { span } = this._voxelChunkConfig();
        const chunkImBlick = (cx, cz) => imBlick((cx + 0.5) * span, (cz + 0.5) * span, span * Math.SQRT1_2);
        // DER BODEN IM BILD (B-Blick): der Ring bis zum Existenz-Boden, soweit die Ankunft ihn sieht — der Chunk des Spielers
        // immer, rundum (der Nachlauf) jeder; was dahinter liegt, baut der Ring in jedem Takt mit seiner eigenen Kappe (`_tickVoxelChunkStreaming`).
        // Bis B-Blick wartete das Bild auf den Boden hinter dem Spieler (GTX kalt: 40 von 122 Ring-Rufen und 10 von 44 Einbauten
        // außer Blick, 0,8 s Haupt-Faden; p3/n2010/blick/f5.txt).
        const pc = st.lastPlayerVoxelChunk;
        const F = AnazhRealm.RING_EXIST_FLOOR;
        let boden = pc ? 0 : 1;
        for (let dz = -F; pc && dz <= F; dz++)
            for (let dx = -F; dx <= F; dx++) {
                const e = st.voxelChunks && st.voxelChunks.get(`${pc.cx + dx},${pc.cz + dz}`);
                if (!(e && (e.mesh || e.empty)) && (!(dx || dz) || chunkImBlick(pc.cx + dx, pc.cz + dz))) boden++;
            }
        if (boden)
            luecke(
                "boden",
                `der Boden wächst (${boden} Stücke im Bild)`,
                st.voxelWorkerPending && st.voxelWorkerPending.size > 0,
                boden
            );
        // DER HORIZONT (K60): der Fern-Ring zeigt seine Schalen erst ganz (`fr.ready`), das Feld-Panorama die Ferne erst
        // gemalt (`panoLaeufe`). Seit K60 zeichnet unter dem Ladeschirm die Scheibe den Ring allein (`_tickFernRing`) —
        // ohne diesen Term stand das Bild ohne Horizont (Prüfung K60-1: in 1 von 4 Kalt-Läufen am Kopf).
        if (this._fernRingGilt()) {
            const fr = st.fernRing;
            const fp = st.feldPass;
            if (!fr || !fr.ready)
                luecke(
                    "horizont",
                    `der Horizont wächst (${fr && fr.totalVerts ? Math.floor((100 * fr.cursor) / fr.totalVerts) : 0} %)`
                );
            // das Panorama malt nur, wer die Ferne auf der GPU zeichnet (`_weltMarchGezeichnet`; der Linsen-Hook trägt den Pass
            // auch headless, dort malt nie ein Panorama)
            else if (fp && this._weltMarchGezeichnet() && !(fp.panoLaeufe > 0))
                luecke("horizont", "der Horizont wird gemalt");
        }
        // DAS LICHT DES ORTS (S7): die Belichtung steht aus dem Licht erst, wenn die Bestrahlungs-Tafel der EINEN Atmosphäre liegt
        // (`_belichtungAnker`, `_himmelsBestrahlung`) — bis dahin trüge das erste Bild die Belichtung des Ladens (1,0) und
        // spränge mit der ersten Tafel (Prüfung S7 Runde 2: die Ankunft in Dämmerung oder Nacht). Dazu die gemalte Umgebung
        // (`_skyEnvLast`: Himmels-Sicht, PMREM und die Licht-Sonde, `_ensureSkyEnvironment`) — jeder Stoff spiegelt sie im ersten
        // Bild; seit ihre Pässe asynchron bauen (`_einmalPass`), kommt sie nicht mehr im selben Takt wie die Tafeln.
        if (!st._belichtungSteht || !(st._skyEnvLast || st._skyEnvFailed))
            luecke("licht", "das Licht des Orts wird gemessen", true);
        // DER LEIB DES SPIELERS (K60-2): sein Guss kommt aus dem Faden (`_leibBereit`, die zwei Vorlagen nach dem Buch) — bis
        // er steht, ist der Spieler der leere Anker, und kein Bild zeigt die Welt ohne ihn.
        if (st._deferredAvatarSoul) luecke("leib", "der Spieler erhält seinen Leib", !!this._foundry);
        if (!this._foundryEnabled()) return out;
        const f = this._foundry;
        if (!f || !f.ready || !f.recipes) {
            luecke("buch", "das Buch der Studios öffnet sich", !!(f && f.worker));
            return out;
        }
        const p = pm.position;
        const R = Number.isFinite(st.architectureCullingRadius) ? st.architectureCullingRadius : 150;
        this._stufenVorlaufWahl(p, R, imBlick);
        let ungebaut = 0;
        let zeuge = null;
        for (const e of st.architectures || []) {
            if (!e || !e.position) continue;
            const dx = e.position.x - p.x;
            const dz = e.position.z - p.z;
            if (
                dx * dx + dz * dz <= R * R &&
                (!this._archIsRendered(e) || this._vorlaufOffen(e)) &&
                imBlick(e.position.x, e.position.z)
            )
                zeuge = ungebaut++ ? zeuge : e;
        }
        if (ungebaut) luecke("bauten", `${ungebaut} Bäume und Bauten wachsen`, false, ungebaut, zeuge);
        // DAS DORF DER ANKUNFT (K60-4): ein Haus, das noch kein Eintrag ist, zählt „bauten" nicht — das Start-Dorf ist fällig
        // (`_startDorfFaellig`, noch nicht bestellt), sein Export ist unterwegs (`_autoSettlementPendingKey`: der Plan und die
        // Ort-Wahl) oder seine Häuser der Mesh-Zone stehen in der Schlange (`_autoSettlementQueue`). Ohne den Term stand das
        // erste Weltbild in 4 von 5 Kalt-Läufen am Kopf von K60-3 ohne das Start-Dorf (Nicht-Baum-Einträge 107 statt 134).
        if (this._dorfTaktLebt()) {
            const q = this._autoSettlementQueue;
            let haeuser = 0;
            if (q && q.plan && Array.isArray(q.plan.slots) && q.origin)
                for (let i = q.idx; i < q.plan.slots.length; i++) {
                    const s = q.plan.slots[q.reihe[i]];
                    const hx = s && q.origin.x + s.x;
                    const hz = s && q.origin.z + s.z;
                    if (s && (hx - p.x) ** 2 + (hz - p.z) ** 2 <= R * R && imBlick(hx, hz)) haeuser++;
                }
            if (haeuser) luecke("dorf", `${haeuser} Häuser des Dorfs wachsen`, false, haeuser);
            else if (this._autoSettlementPendingKey) luecke("dorf", "das Dorf wird geplant", true);
            // der Ort aus dem Gedächtnis (speicher.K3): sein Export ist unterwegs, oder er ist fällig
            else if (this._stlWegePending || (this._autoSettlementChannelLive() && this._dorfWiederkehrZelle(p)))
                luecke("dorf", "das Dorf kehrt wieder", !!this._stlWegePending);
            else if (!q && this._autoSettlementChannelLive() && this._startDorfFaellig(p))
                luecke("dorf", "das Dorf wird gegründet");
        }
        // Die Pflanz-Schlange (`pendingVegSpawns`, K60): ein gepflanzter Baum der Mesh-Zone, der noch nicht gesetzt ist, ist
        // noch kein Eintrag — ohne diesen Term stand das Bild vor ihm, und er wuchs im Bild nach.
        let gesetzt = 0;
        for (const t of st.pendingVegSpawns || []) {
            const q = t && t.position;
            if (q && (q.x - p.x) ** 2 + (q.z - p.z) ** 2 <= R * R && imBlick(q.x, q.z)) gesetzt++;
        }
        // Die Saat (K60-3): ein gebauter Chunk im Laub-Radius, dessen Pflanzung aussteht (`pendingFoliageChunks` — er wartete auf
        // den Radius, `_tickFoliageGrowth` sät zwei je Takt), hat noch keinen Baum in der Schlange: ohne ihn stand das Bild im
        // Takt, in dem der Radius wuchs, bevor sein Wald gesät war.
        let saat = 0;
        for (const key of st.pendingFoliageChunks || []) {
            const ci = key.indexOf(",");
            const cx = Number(key.slice(0, ci));
            const cz = Number(key.slice(ci + 1));
            if (st.voxelChunks && st.voxelChunks.has(key) && this._foliageChunkInRadius(cx, cz) && chunkImBlick(cx, cz))
                saat++;
        }
        // Der Pflanz-Gang, der auf den Plan seines Walds wartet (`_waldPflanzWarten`, K69 — die Stufe nach der Saat): sein Chunk
        // trägt noch keinen Baum — ohne diesen Term wich der Ladeschirm, und der Wald der Mesh-Zone wuchs im Bild nach (K69-2).
        // Die Saat im Takt (`_saatOffen`, `_tickSaat`): ein Chunk, dessen Proben oder Wald noch gesät werden, wie die Pflanzung.
        for (const PW of [this._waldPflanzWarten, this._saatOffen && this._saatOffen.keys()]) {
            if (!PW) continue;
            for (const key of PW) {
                const i = key.indexOf(",");
                const cx = Number(key.slice(0, i));
                const cz = Number(key.slice(i + 1));
                if (((cx + 0.5) * span - p.x) ** 2 + ((cz + 0.5) * span - p.z) ** 2 <= R * R && chunkImBlick(cx, cz))
                    saat++;
            }
        }
        if (gesetzt || saat)
            luecke(
                "pflanzung",
                [gesetzt ? `${gesetzt} Bäume werden gepflanzt` : "", saat ? `${saat} Wald-Böden werden bepflanzt` : ""]
                    .filter(Boolean)
                    .join(", "),
                false,
                gesetzt + saat
            );
        const SC = AnazhRealm.SCATTER;
        const warten = this._streuWartet(p, null, (rx, rz) =>
            imBlick((rx + 0.5) * SC.regionM, (rz + 0.5) * SC.regionM, SC.regionM * Math.SQRT1_2)
        );
        if (warten) luecke("streu", `${warten} Wald-Stücke warten auf ihre Gestalt`, false, warten);
        // die Karte zählt, deren Leser im Blick steht (ihr Bedarf ist sein Rang, `_foundryBuildImpostorFlat`); ein Schlüssel
        // ohne Zelle zählt immer
        const zellen = this._impostorAtlas().zellen;
        const imBild = (k) => {
            const z = zellen.get(k);
            return !z || !!rundum || this._rangImErstenBlick(z._bedarfD2);
        };
        let karten = 0;
        for (const k of this._impostorBakeQueue || []) if (imBild(k)) karten++;
        if (karten) luecke("karten", `${karten} ferne Bäume werden gemalt`, false, karten);
        return out;
    }

    // DER NACHLAUF (B3d): ab dem ersten Bild baut die Welt hinter dem Spieler weiter wie unter dem Ladeschirm — kein
    // Frame-Budget hält sie an (`_frameOverBudget`: Regler und Takt lesen `state._nachlauf`) —, bis rundum steht, was das Bild
    // im Blick verlangte (`_weltbildLuecken(true)` leer, `_rundumDa`), höchstens RUNDBLICK_BILDER Takte; danach laut, was fehlt.
    // Ohne ihn baute ein Frame über PERF_TARGET_MS nichts (gate:ankunft, Null-Renderer: 1 042 Takte bis zum ganzen Rundblick, ein
    // Felsbogen in 119 m ungebaut) — vorher baute ihn das Tor unter dem Ladeschirm. Radeon kalt: rundum 0,10–0,18 s nach dem Bild.
    _nachlaufTakt() {
        const st = this.state;
        const fehlt = this._weltbildLuecken(true);
        if (!fehlt.length) {
            st._rundumDa = performance.now();
            st._nachlauf = null;
        } else if (++st._nachlauf >= AnazhRealm.RUNDBLICK_BILDER) {
            st._nachlauf = null;
            this.log(
                `Der Rundblick steht nach ${AnazhRealm.RUNDBLICK_BILDER} Takten ohne: ${fehlt.map((l) => l.satz).join(" · ")}`,
                "WARN"
            );
        }
    }

    // Die Wahl des Renderers, bevor er steht: der Null-Renderer (GPU-frei, opt-in der Linsen) oder der echte. EINE Frage für
    // `init` und die Studio-Fäden, die vor ihm geboren werden (Platte, Bäcker — `_ensureAssetFoundry`, B3a).
    _nullRendererGewaehlt() {
        return typeof window !== "undefined" && !!window.__anazhHeadlessNullRenderer;
    }

    // Die Stand-Zeile des Ladeschirms (nur solange er steht).
    _ladeschirmStand(text) {
        if (typeof document === "undefined") return;
        const el = document.getElementById("ladeschirm-stand");
        this._hudSchreib(el, text);
    }

    // Der Ladeschirm weicht: nach dem ersten fertigen Weltbild, oder dem WebGPU-Tor (das Tor IST die Antwort — unter dem
    // Ladeschirm läge es unsichtbar).
    _ladeschirmWeg() {
        if (typeof document === "undefined") return;
        const el = document.getElementById("ladeschirm");
        if (!el || el.hidden) return;
        el.classList.add("weg");
        setTimeout(() => {
            el.hidden = true;
        }, 750);
    }

    // Steht der Ladeschirm (die DOM-Wahrheit: da, nicht versteckt, nicht im Weichen)? Solange gehört keine Taste der Welt.
    _ladeschirmSteht() {
        if (typeof document === "undefined") return false;
        const el = document.getElementById("ladeschirm");
        return !!el && !el.hidden && !el.classList.contains("weg");
    }

    // Maus-Listener (Pointer-Lock-Click + Mousedown-Action) als Methode.
    // Wird in createScene am initial-Canvas gerufen.
    _attachWorldCanvasInputListeners(canvas) {
        if (!canvas) return;
        canvas.addEventListener("click", () => {
            // Welle 6.C1 Drag-Fix: Inventar offen → Canvas-Click NICHT
            // re-locken. Sonst würde ein Klick neben das Overlay den
            // Pointer-Lock wieder aktivieren und Drag&Drop tot machen. Dasselbe für jede offene Schublade (Welle L).
            if (this.state.inventoryOpen || this._uiSchubladeOffen()) return;
            if (document.pointerLockElement === canvas) return;
            const p = canvas.requestPointerLock();
            if (p && typeof p.catch === "function") p.catch(() => {}); // Ablehnung (Policy) ist kein Seiten-Fehler
        });
        // Maus-Aktionen (abbauen/platzieren) nur mit aktivem Pointer-Lock, geschlossenem Inventar und geschlossener
        // Schublade (Drag&Drop hat eigene Listener): IST DIE UI OFFEN, IST DER CANVAS TAUB (Welle L, Befund V-D2 — mit
        // offener Werkstatt und gefangenem Zeiger gruben 4 Klicks auf „Bauplan …" 4 Krater r 3,5 m). Im Rebind-Capture
        // bindet der erste Maus-Button die Aktion.
        canvas.addEventListener("mousedown", (event) => {
            if (this.state.keybindRebind) {
                const code = this._eventToBindingCode(event);
                if (code) {
                    this._completeKeybindRebind(code);
                    event.preventDefault();
                }
                return;
            }
            // der Knopf an den EINEN Auslöser: Halten mahlt (`_tickHarvest`), Loslassen löst den gespannten Bogen
            if (!this.state.isPointerLocked) return;
            const aktion = this._actionForBindingCode(this._eventToBindingCode(event));
            if (aktion && this._verbTaste(aktion, true)) event.preventDefault();
        });
        canvas.addEventListener("mouseup", (event) => {
            const aktion = this._actionForBindingCode(this._eventToBindingCode(event));
            if (aktion) this._verbTaste(aktion, false);
        });
    }

    // DIE HORIZONT-KARTE (D3, `HORIZONT_KARTE`): der Schatten JENSEITS der Kaskaden. Die Kaskaden tragen bis zu ihrer Reichweite
    // (an der Mess-Wiese 270 m); dahinter warf bis D3 nichts — kein Grat beschattete am Abend das Tal hinter ihm, der Boden der
    // Chunks bis 540 m und der Fern-Ring bis 8 km lagen im vollen Licht. Das Licht sieht die drei Schalen des Rings (ihre
    // Geometrien, ein eigener Stoff) orthografisch; je Texel bleibt die Fläche, die ihm am nächsten liegt (Max-Blende auf r16f,
    // ohne Tiefen-Puffer). Die Karte ist EINE Größe: `U.karte` bildet die Welt auf (u, v, Licht-Tiefe) ab — der Zeichner schreibt
    // mit ihr, jeder Empfänger liest mit ihr (`_horizontSicht`). Ohne Vendor-Symbol bricht sie laut.
    _horizontKarte() {
        const st = this.state;
        if (st.horizontKarte) return st.horizontKarte;
        const T = typeof THREE !== "undefined" ? THREE.TSL : null;
        if (!T || !THREE.RenderTarget || !THREE.MeshBasicNodeMaterial || !THREE.OrthographicCamera)
            throw new Error("Die Horizont-Karte: THREE trägt TSL/RenderTarget/MeshBasicNodeMaterial nicht (Vendor)");
        const H = AnazhRealm.HORIZONT_KARTE;
        const rt = new THREE.RenderTarget(H.texel, H.texel, {
            type: THREE.HalfFloatType,
            format: THREE.RedFormat,
            depthBuffer: false,
            generateMipmaps: false,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
        });
        rt.name = "horizont-karte";
        rt.texture.name = "horizont-karte";
        const U = this._uniformHeimatTeilen({
            karte: T.uniform(new THREE.Matrix4()),
            aktiv: T.uniform(0),
            ab: T.uniform(0),
            bias: T.uniform(100),
        });
        const stoff = new THREE.MeshBasicNodeMaterial();
        stoff.name = "horizont-karte";
        stoff.colorNode = T.vec4(U.karte.mul(T.vec4(T.positionWorld, 1)).z, 0, 0, 1);
        stoff.blending = THREE.CustomBlending;
        stoff.blendEquation = THREE.MaxEquation;
        stoff.blendSrc = THREE.OneFactor;
        stoff.blendDst = THREE.OneFactor;
        stoff.transparent = true;
        stoff.depthTest = false;
        stoff.depthWrite = false;
        stoff.side = THREE.DoubleSide;
        stoff.fog = false;
        stoff.toneMapped = false;
        const szene = new THREE.Scene();
        szene.name = "horizont-karte";
        const kamera = new THREE.OrthographicCamera(-H.randM, H.randM, H.randM, -H.randM, 0, 2 * H.hoeheM);
        szene.userData.kamera = kamera;
        st.horizontKarte = {
            rt,
            U,
            stoff,
            szene,
            kamera,
            meshes: [],
            geos: null,
            licht: new THREE.Vector3(),
            anker: null,
            malZahl: 0,
        };
        return st.horizontKarte;
    }

    // DIE SICHT DES LICHTS jenseits der Kaskaden (0 Schatten … 1 Licht) am Fragment: die Karte über ihm minus seine Licht-Tiefe
    // gegen den Bias, weich über einen Bias; außerhalb der Karte und diesseits der Kaskaden-Reichweite 1 (über `blende` der
    // Reichweite eingeblendet). Die Abtastung steht im Zweig (`level(0)`, ohne Ableitung) — der nahe Boden zahlt sie nicht.
    _horizontSicht() {
        const T = THREE.TSL;
        const K = this._horizontKarte();
        const H = AnazhRealm.HORIZONT_KARTE;
        const U = K.U;
        return T.Fn(() => {
            const sicht = T.float(1).toVar();
            const tiefe = T.positionView.z.negate();
            const fern = T.smoothstep(U.ab.mul(1 - H.blende), U.ab, tiefe).mul(U.aktiv);
            T.If(fern.greaterThan(0), () => {
                const q = U.karte.mul(T.vec4(T.positionWorld, 1));
                const innen = T.step(0, q.x).mul(T.step(q.x, 1)).mul(T.step(0, q.y)).mul(T.step(q.y, 1));
                const naeher = T.texture(K.rt.texture, q.xy).level(0).r.sub(q.z);
                const licht = T.float(1).sub(T.smoothstep(U.bias, U.bias.mul(2), naeher));
                sicht.assign(T.mix(T.float(1), licht, fern.mul(innen)));
            });
            return sicht;
        })();
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_dirigent_ankunft]);

// ===== ATLAS · Dirigent/ankunft — Außen-Konstanten =====
AnazhRealm.DETAIL_CASCADE = Object.freeze([
    // Band 0 ist 5×5 (maxRing 2): seine Kante (~108 m) teilt Kaskade 0 und 1 des Schattens. (Die Deko-Bänder fielen 04.10.
    // mit dem Klein-Vegetations-Zwilling: die Nah-Streu hängt am Schirm.)
    Object.freeze({ maxRing: 2, aiDiv: 1 }), // Band 0 — ≤ 130 m (5×5): volles Detail
    Object.freeze({ maxRing: 8, aiDiv: 1 }), // Band 1 — ≤ 346 m: die geliebte Mittelsicht
    Object.freeze({ maxRing: 10, aiDiv: 3 }), // Band 2 — ≤ 432 m: ferner Ring
    Object.freeze({ maxRing: Infinity, aiDiv: 6 }), // Band 3 — ≤ 518 m
]);
// ZWILLINGS-ABSCHIED (18.07.) — der EINE Sprint-Faktor-Leser, fail-closed
// (dieselbe Domänen-Disziplin wie _bewegungsKoeff — kein stiller ×2-Zwilling).
AnazhRealm._sprintMulGesetz = function () {
    const m = AnazhRealm.Gesetz("koerper:bewegung.sprintMul", null);
    if (Number.isFinite(m) && m > 0) return m;
    return AnazhRealm._kernPflichtBruch("koerper:bewegung.sprintMul");
};
// DIE FAHR-TASTEN (Leben-Schau 2, fahr-bahn — Befund: in der Tastenliste fehlten E und die Handbremse): die Tasten der Fahrt, die
// der Sammler der Verb-Tafel liest (`_verbTafelSammeln`: Gas · Bremse · Lenkung · Handbremse; E über TASTEN_FEST) und die Hilfe
// (`_hilfeZeilen`) und der Tacho (`_fahrAnzeige`) nennen. `tasten` = Namen in state.keys (event.key klein; die Pfeile schreiben
// w/a/s/d über PFEIL_ALIAS), `code` = KeyboardEvent.code, `zeigen` = die Taste für den Spieler.
AnazhRealm.FAHR_TASTEN = Object.freeze({
    einsteigen: Object.freeze({ code: "KeyE", zeigen: "E", label: "einsteigen/aussteigen" }),
    gas: Object.freeze({ tasten: Object.freeze(["w"]), zeigen: "W", label: "Gas" }),
    bremse: Object.freeze({ tasten: Object.freeze(["s"]), zeigen: "S", label: "Bremse/rückwärts" }),
    lenken: Object.freeze({ tasten: Object.freeze(["a", "d"]), zeigen: "A/D", label: "lenken" }),
    handbremse: Object.freeze({ tasten: Object.freeze(["shift"]), zeigen: "Shift", label: "Handbremse" }),
});
// FAHR-ABSCHLUSS (19.07.) — die Pfeil-Tasten schreiben die kanonischen
// Bewegungs-Tasten (die Studio-Eingabe-Wahrheit: KeyW||ArrowUp usw.); der
// EINE Input-Chokepoint (keydown/keyup) konsumiert die Map, kein Zweit-Leser.
AnazhRealm.PFEIL_ALIAS = Object.freeze({ ArrowUp: "w", ArrowDown: "s", ArrowLeft: "a", ArrowRight: "d" });
// Die FESTEN TASTEN der Verb-Tafel (KeyboardEvent.code → Aktion, `_tastenAktion`): E steigt auf/ab oder betritt ein Portal, Z hält das
// Fernglas, H blendet das HUD, Esc ist das Zurück (Bau verlassen, Inventar schließen, Portal verlassen) — auch wenn cancelBuild
// umgebunden ist. Das Gamepad bindet dieselben Aktionen frei (PAD_BELEGUNG).
AnazhRealm.TASTEN_FEST = Object.freeze({
    [AnazhRealm.FAHR_TASTEN.einsteigen.code]: "einsteigen",
    KeyZ: "zoom",
    KeyH: "hud",
    Escape: "cancelBuild",
});
// DAS ERSTE WELTBILD (`_ankunftsBild`): steht dieselbe Lücke so lange (ms), ohne dass etwas wächst, weicht der Ladeschirm
// laut — das Log nennt, was fehlt (ein Bau, den das Studio nie liefert, hält den Spieler nie vor der Welt fest).
AnazhRealm.WELTBILD_STILL_MS = 15000;
// Der Deckel des ersten Weltbilds (ms ab der ersten Frage): danach weicht der Ladeschirm laut, auch wenn die Lücke nie ruht
// (ihre Zahl flackert). Auf der Radeon stand das ganze Weltbild nach 31,8 s.
AnazhRealm.WELTBILD_DECKEL_MS = 60000;
// DIE ANKUNFT AUS DER FERNE (B2, `_ankunftsFerne`): bis das erste Weltbild steht, misst jede Stufen-Wahl so, als stünde der
// Spieler ANKUNFT_FERNE-mal weiter weg — jedes Ding trägt seine billigste GANZE Stufe (der Baum seine Karte, der Bau seine
// Grobstufe); danach gleitet der Faktor über ANKUNFT_GLEIT_BILDER gezeichnete Bilder auf 1.
AnazhRealm.ANKUNFT_FERNE = 128;
AnazhRealm.ANKUNFT_GLEIT_BILDER = 90;
// DER BLICK DES ERSTEN BILDS (B3d, `_ersterBlick`): der Rand je Seite über den halben Bildwinkel (Grad), die Kugel um das
// Auge über den Abstand zum Spieler hinaus (m), der Radius eines Dings (m) und der Schlüssel, den ein Auftrag außer Blick vor
// dem Bild auf seinem Rang trägt (d², über jeder Welt-Distanz). Der RUNDBLICK (gate:ankunft L2a): gleich nach der Kontrolle
// dreht die Kamera in RUNDBLICK_BILDER Takten einmal ganz herum, und kein Takt zeigt ein Loch in seinem Blick.
AnazhRealm.ERSTER_BLICK = Object.freeze({ randGrad: 15, nahM: 6, dingM: 12, ausserD2: 1e12 });
AnazhRealm.RUNDBLICK_BILDER = 120;
// Der Takt der Stufen-Wahl in der Ankunft (`_tickArchitectureLOD`, `_tickScatterLod`): Wechsel der Bauten, Wechsel und
// Scan der Streu je Bild — die Wahl hält mit der gleitenden Maske Schritt (sonst 5 · 4 · 160).
AnazhRealm.ANKUNFT_TAKT = Object.freeze({ bau: 32, streu: 16, streuScan: 640 });
// DIE HORIZONT-KARTE (D3, `_horizontKarte`): der Schatten JENSEITS der Kaskaden. Das Licht sieht die drei Schalen des Fern-Rings
// (dieselben Geometrien, ein eigener Stoff) orthografisch auf `texel`² Texel über ±`randM` um den Anker; je Texel bleibt die
// Fläche, die dem Licht am nächsten liegt (r16f, Max-Blende, ohne Tiefen-Puffer: 0,5 MB). Ein Empfänger liegt im Schatten,
// wenn die Karte über ihm mehr als den Bias näher am Licht trägt. Quer zum Licht nimmt die Karte nur das Bild des Rings
// (±randM · sin h + Höhe · cos h); der Bias ist `biasTexel` × (senkrechte Texel-Kante / tan h, ab `hoeheMin`, + die halbe waagrechte). `versatzM` hält jede Licht-Tiefe positiv (r16f: ≤ 16 m Stufe), die
// Kamera steht `hoeheM` vor dem Anker. Neu gezeichnet wird, wenn das Licht sich um einen Texel über die Karte gedreht hat
// (`texelM / randM`), der Anker wandert oder der Ring voll ist — nie je Frame. Die Kaskaden tragen bis `SCHATTEN_FERN_FAKTOR`
// × Reichweite; die Karte blendet über `blende` dieser Reichweite ein.
AnazhRealm.HORIZONT_KARTE = Object.freeze({
    texel: 512,
    randM: 8400,
    versatzM: 16384,
    hoeheM: 30000,
    biasTexel: 1.5,
    hoeheMin: 0.08,
    blende: 0.2,
});
// Three.js lädt als ESM über das Bootstrap-Module; dieses defer-Script kann trotz document order vor
// ihm laufen (großer Addon-Graph). Der AnazhRealm-Constructor nutzt `new THREE.Vector3()` → auf
// `window.THREE` warten, BEVOR er gerufen wird (Polling alle 10 ms).
function _bootAnazhRealm() {
    if (typeof window !== "undefined" && typeof window.THREE === "undefined") {
        setTimeout(_bootAnazhRealm, 10);
        return;
    }
    const anazhRealm = new AnazhRealm();
    // Globale Referenz für DevTools-Debug und automatisierten Playtest.
    if (typeof window !== "undefined") {
        window.anazhRealm = anazhRealm;
    }
    // DAS ERWACHEN: das Versprechen des Boots samt der Heimat aus dem Faden (true: die Welt steht, false: der Boot brach) —
    // die Welt-Warte jeder Linse (`__weltDa`) taktet erst danach; bis dahin taktet sie nur die Schleife des Boots.
    const erwachen = Promise.resolve(anazhRealm.init());
    anazhRealm.erwacht = erwachen.then(
        () => true,
        () => false
    );
    // Ein Boot, der scheitert, sagt es auf dem Ladeschirm (nie ein stummes Warten).
    erwachen.catch((e) => {
        anazhRealm._ladeschirmStand(`die Welt konnte nicht erwachen: ${(e && e.message) || e}`);
        throw e;
    });
}
_bootAnazhRealm();
