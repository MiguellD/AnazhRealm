class AnazhRealm_siedlung_instanz {
    // ===== ATLAS · Siedlung/instanz — Arch-Instanzen · Gruppen · LOD-Fassade · Slots · Werfer · Berg-Cull · Bündel-Abfrage =====
    // DIE WERFER-HÜLLE eines Region-Bundles (W7): die Welt-AABB seiner WERFENDEN Kinder (castShadow), aus dem Inhalt —
    // je Instanz die Geometrie-Kugel (drehungsfest: Billboards, Wind), je Mesh seine Box, plus `randM`. Einmal je
    // Schatten-Takt (`_shadowFrame`, die Kaskaden-Box und jeder Schatten-Pass lesen dieselbe Hülle); je Kind hält ein
    // Zahlen-Schlüssel (Instanz-/Positions-Version · Zahl · Geometrie · Welt-Lage) seine Box, nur geänderte Kinder
    // rechnen neu. Ohne Bundle-Version: dieselbe Hülle trägt eine schlichte Gruppe. null = wirft nicht.
    // DER STAND DER WERFER (K72): derselbe Gang stempelt, was die Werfer-Wahl je Pass liest — die Folge der sichtbaren
    // Knoten mit Wurf und Kinderzahl und jede neu gerechnete Box; ändert sich etwas, steigt `u._werferStand`. Die Wahl
    // eines Passes (`_werferWahlSteht`) gilt, solange Lage und Stand stehen — sie geht die Kinder nicht in jedem Render.
    _bundleWerferHuelle(bg) {
        const u = bg.userData;
        const takt = this._shadowFrame || 0;
        if (u._werferTakt === takt && u._werferHuelle !== undefined) return u._werferHuelle;
        // DAS REGISTER (E-Bauart): die Hülle STEHT, solange das Bündel nicht neu aufnimmt (seine Version), keines seiner Kinder
        // Puffer oder Sicht meldete (der Halter, `_anazhHaltR`) und jedes statisch ist — kein Gang über die Kinder je Schatten-Takt
        if (u._werferR !== undefined && u._werferV === bg.version && !(bg._anazhHaltR > u._werferR)) {
            u._werferTakt = takt;
            return u._werferHuelle;
        }
        const box = u._werferBox || (u._werferBox = new THREE.Box3());
        box.makeEmpty();
        const spur = this._wfSpur || (this._wfSpur = { h: 0, neu: false, bg: null, beweglich: false });
        spur.h = bg.children.length | 0;
        spur.neu = false;
        spur.bg = bg;
        spur.beweglich = false;
        const r0 = AnazhRealm._regungN;
        for (const c of bg.children) this._werferBoxDazu(box, c);
        u._werferV = bg.version;
        u._werferR = spur.beweglich ? undefined : r0;
        if (spur.neu || u._werferSig !== spur.h || u._werferStand === undefined) {
            u._werferSig = spur.h;
            u._werferStand = (u._werferStand | 0) + 1;
            // die gemerkten Wahlen dieses Bundles gelten nicht mehr — sie halten keinen gegangenen Werfer fest
            if (u._werferJe) u._werferJe.clear();
        }
        u._werferTakt = takt;
        u._werferHuelle = box.isEmpty() ? null : box.expandByScalar(AnazhRealm.SCHATTEN_KASKADE.randM);
        return u._werferHuelle;
    }
    _werferBoxDazu(box, o) {
        // der Zeichner einer Senke (1410-1) wirft mit ihr: ihre Hülle trägt jede Instanz, er ist kein eigener Werfer
        if (!o || o.isInstanzZeichner === true) return;
        const spur = this._wfSpur;
        // das Register: das Bündel hört Sicht und Puffer jedes Kindes; ein Kind mit matrixAutoUpdate hält die Hülle im Gang
        AnazhRealm._regungHalter(o, spur.bg);
        if (o.matrixAutoUpdate !== false) spur.beweglich = true;
        if (o.visible === false) return;
        const g = o.geometry;
        spur.h = Math.imul(
            spur.h ^ (o.id * 4 + (o.castShadow === true ? 2 : 0) + (o.isMesh === true ? 1 : 0)),
            0x9e3779b1
        );
        spur.h = Math.imul(spur.h ^ o.children.length, 0x85ebca6b);
        if (o.isMesh === true && o.castShadow === true && g && g.attributes && g.attributes.position) {
            const im = o.isInstancedMesh === true ? o.instanceMatrix : null;
            AnazhRealm._regungHalter(im || g.attributes.position, spur.bg);
            const mw = o.matrixWorld.elements;
            const ud = o.userData;
            const ver = im ? im.version : g.attributes.position.version;
            const zahl = im ? o.count | 0 : mw[0];
            if (
                ud._wfVer !== ver ||
                ud._wfZahl !== zahl ||
                ud._wfGeo !== g.id ||
                ud._wfX !== mw[12] ||
                ud._wfY !== mw[13] ||
                ud._wfZ !== mw[14]
            ) {
                const b = ud._werferKind || (ud._werferKind = new THREE.Box3());
                b.makeEmpty();
                spur.neu = true;
                if (im) {
                    if (!g.boundingSphere) g.computeBoundingSphere();
                    const bs = g.boundingSphere;
                    const c = bs.center,
                        R = bs.radius;
                    const a = im.array;
                    const n = Math.min(o.count | 0, (a.length / 16) | 0);
                    let x0 = Infinity,
                        y0 = Infinity,
                        z0 = Infinity,
                        x1 = -Infinity,
                        y1 = -Infinity,
                        z1 = -Infinity;
                    // Jede Instanz in [0, count) lebt (die Gruppe ist dicht, `_archGroupFree`).
                    for (let i = 0, k = 0; i < n; i++, k += 16) {
                        const s2 = Math.max(
                            a[k] * a[k] + a[k + 1] * a[k + 1] + a[k + 2] * a[k + 2],
                            a[k + 4] * a[k + 4] + a[k + 5] * a[k + 5] + a[k + 6] * a[k + 6],
                            a[k + 8] * a[k + 8] + a[k + 9] * a[k + 9] + a[k + 10] * a[k + 10]
                        );
                        const r = R * Math.sqrt(s2);
                        const cx = a[k] * c.x + a[k + 4] * c.y + a[k + 8] * c.z + a[k + 12];
                        const cy = a[k + 1] * c.x + a[k + 5] * c.y + a[k + 9] * c.z + a[k + 13];
                        const cz = a[k + 2] * c.x + a[k + 6] * c.y + a[k + 10] * c.z + a[k + 14];
                        if (cx - r < x0) x0 = cx - r;
                        if (cy - r < y0) y0 = cy - r;
                        if (cz - r < z0) z0 = cz - r;
                        if (cx + r > x1) x1 = cx + r;
                        if (cy + r > y1) y1 = cy + r;
                        if (cz + r > z1) z1 = cz + r;
                    }
                    if (x1 >= x0) {
                        b.min.set(x0, y0, z0);
                        b.max.set(x1, y1, z1);
                        b.applyMatrix4(o.matrixWorld);
                    }
                } else {
                    // die Box der Geometrie, wie three die Kugel liest (Bundle-Inhalt ist statisch: einmal je
                    // Geometrie)
                    if (!g.boundingBox) g.computeBoundingBox();
                    b.copy(g.boundingBox).applyMatrix4(o.matrixWorld);
                }
                ud._wfVer = ver;
                ud._wfZahl = zahl;
                ud._wfGeo = g.id;
                ud._wfX = mw[12];
                ud._wfY = mw[13];
                ud._wfZ = mw[14];
            }
            if (!ud._werferKind.isEmpty()) box.union(ud._werferKind);
        }
        const kinder = o.children;
        for (let i = 0; i < kinder.length; i++) this._werferBoxDazu(box, kinder[i]);
    }

    // ═══ DER BERG-SCHATTEN (feld-natives Hi-Z) ═══
    // Verdeckung aus dem EIGENEN Gesetz statt Depth-Pyramide: Sichtlinie Kamera → Kugel-OBERKANTE gegen
    // `_terrainMacroSurfaceY`, drei Azimut-Linien (Mitte ± Radius); nur wenn ALLE drei überragt sind, ist
    // die Region verdeckt. Amortisiert (Verdikt gecacht, Re-Test alle testMs); verdeckte Regionen testen
    // HÄUFIGER (schneller Un-Cull). < minDist nie verdeckt. Headless aus (Hook __anazhBergCull=true).
    _bergSchattenVerdeckt(s) {
        const cam = this.state.camera;
        if (!cam) return false;
        const B = AnazhRealm.BERG_CULL;
        const cx = cam.position.x,
            cy = cam.position.y,
            cz = cam.position.z;
        const dx = s.center.x - cx,
            dz = s.center.z - cz;
        const distXZ = Math.hypot(dx, dz);
        if (!(distXZ > B.minDist)) return false; // nahe Regionen nie verdeckt
        const topY = s.center.y + s.radius;
        const px = -dz / distXZ,
            pz = dx / distXZ; // horizontale Senkrechte zur Sichtlinie
        this._bergCullTests = (this._bergCullTests || 0) + 1; // Linse
        for (let seit = -1; seit <= 1; seit++) {
            let blockiert = false;
            for (let i = 0; i < B.proben; i++) {
                const t = B.tMin + ((B.tMax - B.tMin) * i) / (B.proben - 1);
                const lx = cx + dx * t + px * seit * s.radius * t;
                const lz = cz + dz * t + pz * seit * s.radius * t;
                const ly = cy + (topY - cy) * t; // Sichtlinie zur Oberkante
                if (this._terrainMacroSurfaceY(lx, lz, false) > ly + B.marge) {
                    blockiert = true;
                    break;
                }
            }
            if (!blockiert) return false; // EINE freie Linie → sichtbar
        }
        return true;
    }

    // Pro Frame (aus _loopFrustumCulling): die Bundle-Sichtbarkeit IST das Region-Culling (_projectObject
    // wertet `visible` auch für gecachte Bundles aus). Frustum (jeden Frame) → BERG-SCHATTEN (amortisiert,
    // nur frustum-sichtbare Kugeln, 2-Treffer-Hysterese).
    _archRegionBundleCull() {
        const map = this.state._regionBundles;
        if (!map || map.size === 0) return;
        const fr = this._frustumCache;
        if (!fr) return;
        this._occlProbeFrame = (this._occlProbeFrame || 0) + 1; // der Query-Probe-Takt (④)
        const hook = typeof window !== "undefined" ? window.__anazhBergCull : undefined;
        const bergAktiv =
            hook !== false &&
            (hook === true || !(this.state.renderer && this.state.renderer._isHeadlessNull)) &&
            !!this.state.camera;
        const B = AnazhRealm.BERG_CULL;
        const now = performance.now();
        let budget = B.budgetJeFrame;
        for (const bg of map.values()) {
            const s = bg.userData.cullSphere;
            if (!s) {
                bg.visible = true;
                bg.userData._sichtHaupt = true;
                continue;
            }
            let vis = fr.intersectsSphere(s);
            if (vis && bergAktiv) {
                const u = bg.userData;
                const testMs = u._bergVerdeckt ? B.testMsVerdeckt : B.testMsSichtbar;
                if (budget > 0 && (!u._bergTestAt || now - u._bergTestAt > testMs)) {
                    budget--;
                    u._bergTestAt = now;
                    if (this._bergSchattenVerdeckt(s)) {
                        u._bergTreffer = (u._bergTreffer || 0) + 1;
                        if (u._bergTreffer >= 2) u._bergVerdeckt = true; // Hysterese: 2 Verdikte
                    } else {
                        u._bergTreffer = 0;
                        u._bergVerdeckt = false; // frei → SOFORT sichtbar
                    }
                }
                if (u._bergVerdeckt) {
                    vis = false;
                    this._bergCullVerdeckt = (this._bergCullVerdeckt || 0) + 1; // Linse (Frame-Summen)
                }
            }
            bg.visible = vis;
            if (s && this.state.camera) {
                const cp = this.state.camera.position;
                const kante = Math.hypot(s.center.x - cp.x, s.center.z - cp.z) - s.radius;
                // ④ WALD-VOR-WALD (echtes Depth-Occlusion): der Query-Proxy testet
                // die KOMPLETTE Frame-Tiefe (Bäume + Fern-Schirm) — nativ.
                if (bergAktiv) this._bundleQueryTick(bg, s, kante);
            }
            // Das HAUPT-Urteil (Frustum · Berg · Query) — der Hauptpass liest es, jeder Schatten-Pass wählt selbst
            // (_passSicht).
            bg.userData._sichtHaupt = bg.visible;
        }
    }

    // ═══ WALD-VOR-WALD (natives Depth-Occlusion) ═══
    // Ein unsichtbarer Kugel-Kasten (colorWrite=false, transparent-Liste → nach allem Opaken) trägt
    // occlusionTest (ANY_SAMPLES_PASSED): 0 Fragmente → Region TOTAL verdeckt. Verdikt async (1–2 Frames
    // alt), 2er-Hysterese, Un-Cull sofort, < BERG_CULL.minDist nie. Der Render-Kontext wird am Proxy
    // gefangen (onBeforeRender) → backend.isOccluded(ctx, proxy).
    _bundleQueryTick(bg, s, kante) {
        const st = this.state;
        const u = bg.userData;
        if (kante < AnazhRealm.BERG_CULL.minDist) {
            if (u._occlProxy) u._occlProxy.visible = false;
            u._occlTreffer = 0;
            u._occlVerdeckt = false;
            return;
        }
        // PROBE-TAKT: Queries jeden Frame zwängen den Vendor in QuerySet-Bau/-Destroy + Resolve + Map pro
        // Frame → nur jeder queryTakt-te Frame fragt (dazwischen Proxys unsichtbar = 0 Queries); das Verdikt
        // hält bis zur nächsten Probe (Verdeckung ist zeitlich kohärent).
        this._occlProbeFrame = this._occlProbeFrame === undefined ? 0 : this._occlProbeFrame;
        const probeFenster = this._occlProbeFrame % AnazhRealm.BERG_CULL.queryTakt === 0;
        if (!probeFenster) {
            if (u._occlProxy) u._occlProxy.visible = false;
            if (u._occlVerdeckt) {
                bg.visible = false;
                this._bergCullVerdeckt = (this._bergCullVerdeckt || 0) + 1;
            }
            return;
        }
        let q = u._occlProxy;
        if (!q) {
            if (!this._occlProxyGeo) this._occlProxyGeo = new THREE.BoxGeometry(2, 2, 2);
            if (!this._occlProxyMat) {
                const m = new THREE.MeshBasicMaterial({ transparent: true });
                m.colorWrite = false;
                m.depthWrite = false;
                this._occlProxyMat = m;
            }
            q = new THREE.Mesh(this._occlProxyGeo, this._occlProxyMat);
            q.occlusionTest = true;
            q.userData.inventar = "occl-proxy";
            q.onBeforeRender = (r) => {
                if (r && r._currentRenderContext) this._occlKontext = r._currentRenderContext;
                q.userData._occlGerufen = this._occlProbeFrame; // der Renderer wollte ihn zeichnen (nach dem Culling)
            };
            u._occlProxy = q;
            if (st.scene) st.scene.add(q);
        }
        q.visible = true;
        q.position.set(s.center.x, s.center.y, s.center.z);
        q.scale.setScalar(Math.max(1e-3, s.radius));
        const be = st.renderer && st.renderer.backend;
        const okt = this._occlKontext;
        // DER STUMME STELLVERTRETER (0910-3 A, Gegenprüfung): wollte der Renderer ihn im letzten Probe-Fenster zeichnen, steht
        // er im Abfrage-Feld dieses Renders (`occlusionQueryObjects`, r184 ersetzt es nur bei Zähler > 0 — also bis zum
        // nächsten Probe-Frame). Fehlt er dort `STUMM_FENSTER` Fenster in Folge, steht seine Pipeline nicht oder gilt als
        // gescheitert (r184s Fehler-Bereich um den asynchronen Bau vergiftet sie still mit einem FREMDEN Fehler) — ohne
        // Abfrage gibt es nie wieder ein Verdikt: laut beim Namen, einmal je Welt.
        if (be && okt && q.userData._occlGerufen !== undefined && q.userData._occlGerufen !== this._occlProbeFrame) {
            const d = be.get(okt);
            const begann = !!(d && d.occlusionQueryObjects && d.occlusionQueryObjects.indexOf(q) >= 0);
            u._occlStumm = begann ? 0 : (u._occlStumm || 0) + 1;
            q.userData._occlGerufen = undefined;
            if (u._occlStumm >= AnazhRealm.BERG_CULL.stummFenster && !this._occlStummGemeldet) {
                this._occlStummGemeldet = true;
                this.log(
                    `BERG-CULL STUMM: der Stellvertreter von ${bg.name} begann in ${u._occlStumm} Probe-Fenstern keine ` +
                        "Verdeckungs-Abfrage — seine Pipeline steht nicht oder gilt als gescheitert (die GPU-Wache nennt den " +
                        "Fehler); ohne Abfrage kein Verdikt",
                    "ERROR"
                );
            }
        }
        if (be && okt && typeof be.isOccluded === "function") {
            if (be.isOccluded(okt, q)) {
                u._occlTreffer = (u._occlTreffer || 0) + 1;
                if (u._occlTreffer >= 2) u._occlVerdeckt = true; // Hysterese: 2 Verdikte
            } else {
                u._occlTreffer = 0;
                u._occlVerdeckt = false; // sichtbar → SOFORT zurück
            }
            if (u._occlVerdeckt) {
                bg.visible = false;
                this._bergCullVerdeckt = (this._bergCullVerdeckt || 0) + 1; // dieselbe Linse
            }
        }
    }

    // Proxy-Abbau (der Bundle-Tod räumt sein Query-Objekt — kein Szene-Leck).
    _bundleQueryProxyTod(bg) {
        const q = bg && bg.userData && bg.userData._occlProxy;
        if (!q) return;
        if (q.parent) q.parent.remove(q);
        bg.userData._occlProxy = null;
    }

    // V18.300 — `regionKey` (optional): eine REGION-gekeyte Gruppe trägt nur die
    // Instanzen EINER 256m-Streu-Region → ihre instanz-bewusste Bounding-Sphere ist
    // LOKAL → frustumCulled=true (die Engine cullt sie beim Wegschauen = die Heilung
    // des „kann mich kaum drehen"). Ohne regionKey (placed Architektur) bleibt die
    // Gruppe global + frustumCulled=false (welt-verteilte Instanzen, Group-BBox nutzlos).
    // SUBSYSTEM 5 (Vorlage: `forestGroup.traverse(...o.layers.set(1))`) — die non-breaking
    // Laub-Layer-Trennung: eine Vegetations-Instanz-/Gras-Gruppe bekommt die FOLIAGE_LAYER
    // ZUSÄTZLICH (`enable`, Layer 0 bleibt) → Render + Schatten sind heute byte-identisch (die
    // Haupt-Kamera + der Schatten-Pass sehen sie weiter über Layer 0), aber der künftige
    // reduziert-aufgelöste Laub-Pass kann sie über `pass.setLayers(FOLIAGE_LAYER)` ISOLIERT
    // wählen. Placed Architektur (`p:`-Region-Key ODER global) bleibt Layer-0-only (kein Laub).
    _markFoliageLayer(mesh, regionKey, regional) {
        if (!mesh || !mesh.layers || typeof mesh.layers.enable !== "function") return;
        // Foliage = region-gestreute Vegetation; die platzierte Architektur ist global (Welle B).
        const isFoliage = regional !== false && regionKey != null;
        if (isFoliage) mesh.layers.enable(AnazhRealm.FOLIAGE_LAYER);
    }

    // INSTANZ-FASSADE: das Studio rechnet SSE-Metrik und Billboard-vOcc PER INSTANZ
    // (`min(uLodRef/(aH0*_isy),1)`), die geteilte Quell-Geometrie (fCache) trägt keine Instanz-Werte.
    // Die Fassade TEILT alle Vertex-Buffer (zero-copy) und ersetzt aH0/aH0L/aKarte durch INSTANZIERTE
    // Attribute (je Slot am Slot-Chokepoint gestempelt: Template-Höhe × Instanz-Skala; die Karte Schicht, Rahmen und
    // ±Sichthöhe). EIN Fassade-Objekt je Gruppe, über Grow wiederverwendet; nie geometry.dispose().
    _lodInstanceFacade(srcGeom, capacity) {
        const g2 = new THREE.BufferGeometry();
        if (srcGeom.index) g2.setIndex(srcGeom.index);
        for (const k in srcGeom.attributes) {
            if (AnazhRealm.LOD_INSTANZ_ATTRIBUTE[k]) continue;
            g2.setAttribute(k, srcGeom.attributes[k]);
        }
        const a0 = srcGeom.attributes.aH0;
        const a0L = srcGeom.attributes.aH0L;
        const h0 = a0 && a0.array && a0.array.length ? a0.array[0] : 0;
        const h0L = a0L && a0L.array && a0L.array.length ? a0L.array[0] : h0;
        if (a0) {
            g2.setAttribute("aH0", new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1));
            g2.setAttribute("aH0L", new THREE.InstancedBufferAttribute(new Float32Array(capacity), 1));
        }
        // Die Karte: Atlas-Schicht + Rahmen + Billboard-Verdeckung je Slot in EINEM vec4 (`_lodSlotStamp`).
        for (const k of ["aKarte"]) {
            const n = AnazhRealm.LOD_INSTANZ_ATTRIBUTE[k];
            if (srcGeom.attributes[k])
                g2.setAttribute(k, new THREE.InstancedBufferAttribute(new Float32Array(capacity * n), n));
        }
        g2.boundingSphere = srcGeom.boundingSphere;
        g2.boundingBox = srcGeom.boundingBox;
        // Die Fassade zeichnet, was ihre Quelle zeichnet (der Wurf-Teil des Schatten-Zwillings ist ein drawRange).
        g2.setDrawRange(srcGeom.drawRange.start, srcGeom.drawRange.count);
        g2.userData._lodFacade = true;
        g2.userData._h0Tpl = h0;
        g2.userData._h0LTpl = h0L;
        return g2;
    }
    // Grow-Pfad der Fassade: die Instanz-Arrays auf die neue Kapazität heben (Werte
    // kopieren) — dasselbe Geometrie-Objekt bleibt (die Vertex-Buffer sind geteilt).
    _lodFacadeGrow(geom, newCap) {
        if (!geom || !geom.userData || !geom.userData._lodFacade) return;
        for (const k in AnazhRealm.LOD_INSTANZ_ATTRIBUTE) {
            const a = geom.attributes[k];
            if (!a || !a.isInstancedBufferAttribute) continue;
            const n = a.itemSize;
            const arr = new Float32Array(newCap * n);
            arr.set(a.array.subarray(0, Math.min(a.array.length, newCap * n)));
            geom.setAttribute(k, new THREE.InstancedBufferAttribute(arr, n));
        }
    }
    // DER EINE SLOT-STEMPEL (beide Slot-Chokepoints rufen ihn): Sichthöhe = Template ×
    // Instanz-Skala (exakt das Studio-`aH0*_isy`) + VOLL (`_lodSlotVoll`: die Karte des Verdeckten und der Brücke, die
    // Stufe ohne Partner — das Vorzeichen von aKarte.w bzw. aH0L, die Maske hält) + — trägt das Leaf eine Karte —
    // ihre Atlas-Schicht und ihr Rahmen (der Occlusion-Refresh reicht kein Leaf: Schicht und Rahmen bleiben).
    _lodSlotStamp(g, slot, scale, voll, leaf) {
        const geom = g && g.mesh && g.mesh.geometry;
        if (!geom || !geom.userData || !geom.userData._lodFacade) return;
        g.slotStand = (g.slotStand | 0) + 1; // der Slot-Stand (`_instanzSlotStand`): Sichthöhe und Karte der Wahl
        const s = Number.isFinite(scale) && scale > 0 ? scale : 1;
        const a0 = geom.attributes.aH0;
        if (a0 && a0.isInstancedBufferAttribute && slot < a0.array.length) {
            a0.array[slot] = geom.userData._h0Tpl * s;
            a0.needsUpdate = true;
            const a0L = geom.attributes.aH0L;
            if (a0L && slot < a0L.array.length) {
                // der Halt der 3D-Stufe reist im Vorzeichen der Blatt-Sichthöhe (aH0 liest der Wind, er bleibt positiv)
                a0L.array[slot] = geom.userData._h0LTpl * s * (voll ? -1 : 1);
                a0L.needsUpdate = true;
            }
        }
        // Die Karte: EIN vec4 je Slot (Schicht, Halbbreite, Höhe, ±Sichthöhe). Schicht, Rahmen und Sichthöhe (Vorlage ×
        // Instanz-Skala, wie aH0) stempelt nur ein Ruf mit Karten-Leaf; die Verdeckung trägt das Vorzeichen der Sichthöhe
        // (negativ = verdeckt: die Karte blendet voll) — der Verdeckungs-Refresh ohne Leaf kehrt nur das Vorzeichen.
        const ak = geom.attributes.aKarte;
        if (ak && ak.isInstancedBufferAttribute && slot * 4 < ak.array.length) {
            let h = Math.abs(ak.array[slot * 4 + 3]);
            if (leaf && Number.isFinite(leaf.zelle)) {
                ak.array[slot * 4] = leaf.zelle;
                ak.array[slot * 4 + 1] = leaf.rahmen[0];
                ak.array[slot * 4 + 2] = leaf.rahmen[1];
                h = leaf.sicht * s;
            }
            ak.array[slot * 4 + 3] = voll ? -h : h;
            ak.needsUpdate = true;
        }
        // SUBMIT-WAL — Facade-Attribut-Mutation (auch via _lodSlotOcclusionRefresh,
        // AUSSERHALB des Alloc-Pfads): das Region-Bundle re-recorden, sonst friert
        // der Wert im gecachten Replay ein.
        if (!g.mesh.__arena) this._archMeshBundleTouch(g.mesh); // eine Arena liest Zahl und Puffer im Takt (G1)
    }
    // Occlusion-Wechsel OHNE LOD-Switch (fern-verdeckt ↔ fern-frei): die Verdeckung (Vorzeichen von aKarte.w)
    // der lebenden Slots nachziehen (das Studio schreibt vOcc pro Tick — der Host
    // nur am WECHSEL, derselbe Wert dazwischen).
    _lodSlotOcclusionRefresh(entry) {
        for (const band of [false, true]) {
            const list = band ? entry.instSlotsBand : entry.instSlots;
            if (!Array.isArray(list)) continue;
            for (const ref of list) {
                const g = this.state.archInstanceGroups && this.state.archInstanceGroups.get(ref.key);
                if (g) this._lodSlotStamp(g, ref.slot, entry.scale, this._lodSlotVoll(entry, band));
            }
        }
    }
    // Zeichnet die Stufe dieses Eintrags VOLL (kein Distanz-Fade)? Die Karte des verdeckt-demotierten Baums (Studio-vOcc)
    // und die Brücke eines kalten Baums, dessen Wunsch-Stufe noch lädt (`_rebuildArchitectureMesh`); die Primär-Stufe, deren
    // Partner fehlt (`_lodHalt`, K36). Der Band-Partner hält nie: er steht nur neben seiner Primär-Stufe (die 3D-Stufe
    // neben einer verdeckten Karte zeichnete sonst voll mit ihr doppelt) — nur eine Karte im Band trägt Verdeckung und Brücke.
    _lodSlotVoll(entry, band, bandLod = entry._lodBandLevel) {
        const karte = entry._occluded === true || entry._bruecke === true;
        if (band) return karte && bandLod === 2;
        return karte || entry._lodHalt === true;
    }
    _archInstanceGroupFor(name, leafIdx, leaf, regionKey) {
        // W6 — die Karte zeichnet in der EINEN globalen Atlas-Gruppe (leaf.atlasGruppe), gleich welche Art, Gestalt,
        // Streu oder Setzung: die Schicht wählt die Instanz (aKarte.x).
        const atlasGruppe = leaf && typeof leaf.atlasGruppe === "string" ? leaf.atlasGruppe : null;
        // V18.474 — die EINE Fern-Key-Ableitung VOR jedem Keying: Fern-Leaves (Impostor-Quads/L2)
        // kollabieren von der Region auf die SUPER-REGION (s. _archFernRegionKey — Chokepoint, kein zweiter
        // Ableitungs-Ort).
        regionKey = atlasGruppe ? null : this._archFernRegionKey(name, leaf, regionKey);
        // JEDES Leaf ist eine InstancedMesh: EIN Draw je Leaf × Region, gleich wie viele Platzierungen. Der
        // BatchedMesh-Pfad (bis V18.509) fiel: r184-WebGPU kennt kein Multi-Draw, der Batch gibt je INSTANZ
        // einen drawIndexed aus (WebGPUBackend: Schleife über _multiDrawCount) — gemessen 02.10. an der
        // Mess-Wiese 7 339 Draws je Pass für 58 Batches, ×4 mit den Schatten-Kaskaden 29 191 von 29 943
        // GPU-Befehlen eines Frames.
        if (!this.state.archInstanceGroups) this.state.archInstanceGroups = new Map();
        const regional = regionKey != null && this.state.useRegionFoliageCull !== false;
        // Welle B — ein Bau-Schlüssel ist Studio-Geometrie: ruft der platzierte Bau mit leerem Typ (das Leaf trägt
        // eine Studio-Identität), ist der Leaf-Schlüssel selbst die Gruppe (felsbogen und felsturm teilen zacken).
        const basis = atlasGruppe || (name ? name + "#" + leafIdx : String(leafIdx));
        const key = regional ? basis + "@" + regionKey : basis;
        let g = this.state.archInstanceGroups.get(key);
        if (g) return g;
        const capacity = 16;
        // V18.349 — per-Leaf-Override (der opake Kronen-Kern setzt castShadow:false): ein einzelner
        // Leaf darf den Namen-basierten Schatten-Default überstimmen; sonst der LOD-Default via Name.
        const castShadow = leaf.castShadow !== undefined ? !!leaf.castShadow : this._archGroupCastsShadow(name);
        // DER BAU-SATZ (Welle 6): ist das Leaf ein gesetzter Studio-Bau einer Satz-Art, zeichnet die Gruppe nie selbst —
        // ihr Bereich lebt im Satz ihres Stoffs (`_bauSatzArt`, `_tickBauSatz`).
        const satz = this._bauSatzArt(leaf, regionKey, castShadow);
        // AUSLÖSCHUNGS-WELLE (Feld B) — trägt die Quell-Geometrie LOD-Attribute (aH0 =
        // Baum-Stufen · aKarte = die Karte), bekommt die Gruppe die INSTANZ-FASSADE
        // (per-Instanz-Metrik wie das Studio; s. _lodInstanceFacade).
        const wantsFacade =
            leaf.geom && leaf.geom.attributes && (leaf.geom.attributes.aH0 || leaf.geom.attributes.aKarte);
        const groupGeom = wantsFacade ? this._lodInstanceFacade(leaf.geom, capacity) : leaf.geom;
        const mesh = AnazhRealm._instanzMesh(groupGeom, leaf.mat, capacity);
        mesh.castShadow = castShadow;
        mesh.receiveShadow = true;
        // regional → lokale BBox → die Engine cullt beim Umsehen; global → die Instanz-Wahl je Pass (`_instanzWahlPass`).
        mesh.frustumCulled = regional;
        mesh.userData.archInstanceKey = key;
        // der Rang im Bündel (`_buendelKinderReihe`): die Stufe des Leafs, die Atlas-Karte (fern) zuletzt
        mesh.userData.buendelStufe = atlasGruppe ? 9 : Number.isFinite(leaf.stufe) ? leaf.stufe : 0;
        const wahl = satz ? null : this._instanzWahlArt(leaf, castShadow, regional);
        if (wahl) mesh.userData.instanzWahl = wahl;
        // V18.389 — der Schatten-Zwilling verlässt die Ebene 0 (unsichtbar für die Kamera); er wirft auf der Wurf-Ebene
        // SHADOW_TWIN_LAYER, die sein `castShadow` trägt (K72, `_wurfEbene`). Kein FOLIAGE_LAYER (kein Laub-Pass-Mitglied).
        if (leaf.shadowTwin) mesh.layers.disable(0);
        else this._markFoliageLayer(mesh, regionKey, regional); // Subsystem 5: Laub bekommt ZUSÄTZLICH die FOLIAGE_LAYER
        // Auch die REGIONALE InstancedMesh-Gruppe hängt in der Region-BundleGroup; jede Mutation (Alloc/Free/
        // Slot-Stempel/Matrix/Grow) läuft durch die Chokepoints mit _archMeshBundleTouch. Tür-Flügel
        // (leaf.tuer) bleiben DRAUSSEN (per-Frame-Matrizen, _tickTorFluegel). GLOBALE Gruppen ziehen in EIN
        // "@global"-Bundle: der Key matcht das Kugel-Regex nicht → keine cullSphere → immer sichtbar,
        // Submit ≈ 0. Nicht-WebGPU/Kill-Switch → Szene-Pfad.
        // Eine Satz-Gruppe hängt nirgends: sie ist Slot-Wahrheit und Raycast-Ziel, gezeichnet wird ihr Bereich im Satz.
        // Die Wahl-Gruppen (Welle 7: die Pflanzen-Stufen und die EINE Atlas-Gruppe der Karten) ziehen in EIN eigenes
        // "@wahl"-Bundle: ändert der Blick die Wahl, nimmt das Hauptbild nur sie neu auf, nie die übrigen globalen Gruppen.
        const bundle =
            !leaf.tuer && !satz ? this._archRegionBundleFor(regional ? regionKey : wahl ? "@wahl" : "@global") : null;
        if (satz) {
            mesh.frustumCulled = false;
            mesh.userData.bauSatz = satz;
        } else if (bundle) {
            mesh.frustumCulled = false; // der Region-Cull wandert auf die Bundle-Sichtbarkeit
            mesh.matrixAutoUpdate = false; // STATISCH (E-Bauart): die Lage der Gruppe liegt in ihren Instanz-Matrizen
            bundle.add(mesh);
            AnazhRealm._buendelKinderReihe(bundle, this._buendelAuge);
            bundle.needsUpdate = true; // ein Bürger ohne fertige Pipeline: die Erst-Zeichnung nimmt neu auf, wenn sie steht
        } else if (this.state.scene) this.state.scene.add(mesh);
        // slotRef: Slot-Index → die Slot-Marke {key, slot} (der Rückverweis des Umzugs, `_archGroupAlloc`); slotEntry:
        // Slot-Index → Architektur-Eintrag (der Crosshair-Raycast). Leer geboren: count 0, unsichtbar, bis der erste Bewohner kommt.
        AnazhRealm._instanzZahl(mesh, 0);
        g = {
            key,
            mesh,
            geom: groupGeom,
            mat: leaf.mat,
            capacity,
            liveCount: 0,
            slotRef: [],
            slotEntry: [],
            castShadow,
            regional,
            shadowTwin: !!leaf.shadowTwin, // V18.389 — Growth muss die Layer neu setzen
            tuer: leaf.tuer || null, // V18.465 — Tür-Flügel-Scharnier (Template-Raum)
            satz, // Welle 6 — die Satz-Art (null = die Gruppe zeichnet selbst)
            wahl, // Welle 7 — "haupt" | "schatten": die Instanz-Wahl je Pass (null = die Gruppe zeichnet jede Instanz)
            // das Fenster der Blende: der Stufen-Stempel (1 · 2 · 3) oder "karte" (die Einblendung des Billboards)
            wahlStufe: wahl ? (atlasGruppe ? "karte" : leaf.geom.attributes.aLodLevel.array[0]) : 0,
        };
        if (wahl) this._instanzWahlGruppen().add(g);
        // Nur im NEU-Gruppen-Zweig (nicht in _archInstanceGroupGrow → g-Identität
        // bleibt): der Ref-Zähler der Cache-Gruppe steigt um 1, solange eine lebende InstancedMesh-Gruppe ihre
        // geteilte Geometrie hält; _disposeArchInstanceGroup dekrementiert 1:1.
        if (leaf && leaf._srcGroup) {
            g._foundrySrc = leaf._srcGroup;
            leaf._srcGroup._liveRefs = (leaf._srcGroup._liveRefs || 0) + 1;
        }
        this.state.archInstanceGroups.set(key, g);
        this._archGruppenMintMerke(key); // CHURN-LINSE (18.07.) — s. _archGruppenMintMerke
        return g;
    }

    // CHURN-LINSE: die zwei Gruppen-Münz-Chokepoints zählen Mints, der Disposer Tode; ein kleiner Ring
    // merkt die letzten Schlüssel MIT Wiederkehr-Zähler → der Export nennt die KONKRETE Familie, die im
    // Kreis stirbt und wiederaufersteht (Re-Mints kosten Pipeline-Einträge + volle Matrix-Uploads).
    _archGruppenMintMerke(key) {
        this._archGruppenMints = (this._archGruppenMints || 0) + 1;
        let m = this._archGruppenMintMap;
        if (!m) m = this._archGruppenMintMap = new Map();
        m.set(key, (m.get(key) || 0) + 1);
        // Bounded: der Sweep läuft AMORTISIERT (alle 256 Mints, nicht O(size) je Mint), Einmal-Mints fallen
        // zuerst; bei > 6144 Wiederkehrern hält der harte Fallback nur die Top-256.
        if (m.size > 4096 && (this._archGruppenMints & 255) === 0) {
            for (const [k, n] of m) {
                if (n <= 1) m.delete(k);
                if (m.size <= 2048) break;
            }
            if (m.size > 6144) {
                const top = Array.from(m.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 256);
                m.clear();
                for (const [k, n] of top) m.set(k, n);
            }
        }
    }
    // Die Top-Wiederkehrer (Mint-Zahl ≥ 2) — der Export-Leser.
    _archGruppenChurnZensus() {
        const m = this._archGruppenMintMap;
        const top = [];
        if (m) {
            for (const [k, n] of m) if (n >= 2) top.push({ key: k, mints: n });
            top.sort((a, b) => b.mints - a.mints);
        }
        return {
            mints: this._archGruppenMints || 0,
            tode: this._archGruppenDisposes || 0,
            wiederkehrer: top.length,
            top: top.slice(0, 10).map((t) => ({ key: String(t.key).slice(0, 64), mints: t.mints })),
        };
    }

    // Kapazität verdoppeln: neue InstancedMesh, alte Matrizen kopieren.
    _archInstanceGroupGrow(g) {
        const newCap = g.capacity * 2;
        this._lodFacadeGrow(g.geom, newCap); // AUSLÖSCHUNGS-WELLE (Feld B) — Instanz-Attribute mitziehen
        const next = AnazhRealm._instanzMesh(g.geom, g.mat, newCap);
        next.castShadow = g.castShadow !== false; // V18.265 — Schatten-Distanz mitführen
        next.receiveShadow = true;
        next.frustumCulled = g.regional === true; // V18.300 — regionale Gruppen cullen weiter
        next.userData.archInstanceKey = g.key;
        next.userData.buendelStufe = g.mesh.userData.buendelStufe;
        if (g.satz) next.userData.bauSatz = g.satz; // Welle 6 — die Satz-Gruppe bleibt ohne Eltern (der Satz zeichnet)
        if (g.wahl) next.userData.instanzWahl = g.wahl; // Welle 7 — die Instanz-Wahl je Pass reist mit
        // V18.389 — die Layer-Zuordnung des Schatten-Zwillings mitführen (sonst kippt der gewachsene
        // Mesh auf Layer 0 zurück → sichtbar für die Kamera). Nur der Zwilling braucht das; die Laub-
        // Layer bleibt wie im bestehenden Growth-Pfad (unberührt). Den Wurf trägt `castShadow` (oben, K72 `_wurfEbene`).
        if (g.shadowTwin) next.layers.disable(0);
        // Die lebenden Instanzen liegen dicht in [0, liveCount) (`_archGroupFree` verdichtet) — nur sie reisen mit.
        const n = g.liveCount || 0;
        const tmp = this._archTmpCopyM || (this._archTmpCopyM = new THREE.Matrix4());
        for (let i = 0; i < n; i++) {
            g.mesh.getMatrixAt(i, tmp);
            next.setMatrixAt(i, tmp);
        }
        // Beim Wachstum den instanceColor-Buffer (lazy von setColorAt) aller Slots mitkopieren — sonst kippen
        // alle Bäume auf default-Weiß.
        if (g.mesh.instanceColor) {
            const tmpC = this._archTmpCopyColor || (this._archTmpCopyColor = new THREE.Color());
            for (let i = 0; i < n; i++) {
                g.mesh.getColorAt(i, tmpC);
                next.setColorAt(i, tmpC);
            }
            if (next.instanceColor) next.instanceColor.needsUpdate = true;
        }
        AnazhRealm._instanzZahl(next, n);
        next.instanceMatrix.needsUpdate = true;
        // SUBMIT-WAL — parent-bewusster Swap (die scene.remove-Falle): eine regionale
        // Gruppe hängt in ihrer Region-BundleGroup — der gewachsene Mesh bleibt im
        // SELBEN Parent, das Bundle re-recorded (der alte Mesh referenziert tote Buffer).
        const parent = g.mesh.parent;
        if (parent) {
            parent.remove(g.mesh);
            parent.add(next);
            if (parent.isBundleGroup) {
                next.matrixAutoUpdate = false; // STATISCH wie die Gruppe vor ihr (E-Bauart)
                AnazhRealm._buendelKinderReihe(parent, this._buendelAuge);
                parent.needsUpdate = true;
            }
        } else if (!g.satz && this.state.scene) this.state.scene.add(next);
        this._instanzAbschied(g.mesh); // die eigenen Instanz-Puffer verlassen die GPU (geom/mat geteilt → bleiben)
        g.mesh = next;
        g.capacity = newCap;
    }

    // DER EINE SLOT-CHOKEPOINT (Belegen · Freigeben): die lebenden Instanzen einer Gruppe liegen DICHT in
    // [0, liveCount), `mesh.count` IST liveCount — einen freien Slot gibt es nicht, eine leere Hülle zeichnet nicht
    // (count 0, unsichtbar — in keinem Pass, auch nicht in der Gnadenfrist). Befund 05.10. (Radeon 890M, Mess-Wiese,
    // drei Schleifen à 1,2 km): die Free-Liste hielt count am Höchststand, die Null-3×3 lief durch jeden Vertex-Shader
    // — 890 freie Slots mit 1,73 M Dreiecken in 202 Gruppen, 92 leere Hüllen zeichneten 0,99 M Dreiecke ins Hauptbild.
    // Belegen hängt an das Ende; die Rückgabe ist die SLOT-MARKE {key, slot} (`g.slotRef[slot]`, der Rückverweis des
    // Umzugs; `g.slotEntry[slot]` trägt den Architektur-Eintrag für den Raycast, Streu null). Wer eine Marke hält, liest
    // `slot` frisch: Freigeben zieht die letzte Instanz in die Lücke und schreibt ihre Marke um.
    _archGroupAlloc(g, entry) {
        const slot = g.liveCount || 0;
        if (slot >= g.capacity) this._archInstanceGroupGrow(g);
        const ref = { key: g.key, slot };
        g.slotRef[slot] = ref;
        g.slotEntry[slot] = entry || null;
        g.liveCount = slot + 1;
        g.slotStand = (g.slotStand | 0) + 1; // der Slot-Stand (`_instanzSlotStand`): jede Wahl eines Passes wählt neu
        AnazhRealm._instanzZahl(g.mesh, g.liveCount);
        // SUBMIT-WAL — der Aufrufer schreibt gleich Matrix/Farbe in diesen Slot
        // (synchron, vor dem nächsten Render): das Region-Bundle re-recorden.
        if (!g.mesh.__arena) this._archMeshBundleTouch(g.mesh); // eine Arena liest Zahl und Puffer im Takt (G1)
        g._leerSeit = 0; // GNADENFRIST — ein Bewohner kehrt zurück: die Hülle lebt, kein Re-Mint
        return ref;
    }

    // Freigeben = verdichten: die LETZTE lebende Instanz zieht in die Lücke (`_instanzUmzug`: Matrix, Farbe, die
    // Instanz-Attribute der Fassade) und ihre Marke mit; count sinkt. Eine Marke, die in dieser Gruppe nicht (mehr)
    // lebt — doppelt freigegeben, oder ihre Gruppe fiel und wurde neu gemünzt —, gibt nichts frei (false): sie
    // besitzt hier keinen Slot.
    _archGroupFree(g, ref) {
        const slot = ref ? ref.slot : -1;
        if (!(slot >= 0) || g.slotRef[slot] !== ref) return false;
        const letzt = g.liveCount - 1;
        if (slot !== letzt) {
            AnazhRealm._instanzUmzug(g.mesh, letzt, slot);
            const zieht = g.slotRef[letzt];
            zieht.slot = slot;
            g.slotRef[slot] = zieht;
            g.slotEntry[slot] = g.slotEntry[letzt];
        }
        g.slotRef[letzt] = null;
        g.slotEntry[letzt] = null;
        ref.slot = -1;
        g.liveCount = letzt;
        g.slotStand = (g.slotStand | 0) + 1; // der Slot-Stand (`_instanzSlotStand`)
        AnazhRealm._instanzZahl(g.mesh, letzt);
        if (!g.mesh.__arena) this._archMeshBundleTouch(g.mesh); // SUBMIT-WAL — count-/Matrix-Mutation → Bündel neu (eine Arena liest sie im Takt, G1)
        // V12.0-perf.e-fix — boundingSphere invalidieren: InstancedMesh.raycast
        // (Crosshair-Pick) sphere-cullt gegen die gecachte Bounding; ohne Reset
        // verfehlt der Raycast Instanzen, die nach dem letzten Cache dazukamen.
        g.mesh.boundingSphere = null;
        return true;
    }

    // Zwei lebende Slots tauschen ihre Bewohner — Instanz-Größen, Marken (die Halter lesen `slot` frisch) und Einträge.
    _archGroupTausch(g, a, b) {
        // der Tausch der Wahl zählt, um wie viel er die Versionen hebt (der Slot-Stand zieht es ab, `_instanzSlotStand`)
        const im = g.mesh.instanceMatrix;
        const ak = g.mesh.geometry.attributes.aKarte;
        const v = im.version,
            vk = ak ? ak.version : 0;
        AnazhRealm._instanzTausch(g.mesh, a, b);
        g._ordnung = (g._ordnung | 0) + 1; // die Ordnung der Slots (die Wahl eines Passes merkt sie, `_instanzWahlSteht`)
        g._tauschMat = (g._tauschMat | 0) + (im.version - v);
        if (ak) g._tauschKarte = (g._tauschKarte | 0) + (ak.version - vk);
        const ra = g.slotRef[a],
            rb = g.slotRef[b];
        ra.slot = b;
        rb.slot = a;
        g.slotRef[a] = rb;
        g.slotRef[b] = ra;
        const e = g.slotEntry[a];
        g.slotEntry[a] = g.slotEntry[b];
        g.slotEntry[b] = e;
    }

    // DER UMZUG EINER INSTANZ (Verdichten): alles, was je Slot reist, rückt von `von` nach `nach` — die Matrix, die
    // Farbe und die Instanz-Attribute der LOD-Fassade (`LOD_INSTANZ_ATTRIBUTE`, nur wo die Geometrie die Fassade der
    // Gruppe ist; eine geteilte Quell-Geometrie trägt keine Instanz-Werte). Die EINE Liste der Instanz-Größen für jede
    // verdichtende Senke (Instanz-Gruppen · Fundament-Pool). Volle Uploads (needsUpdate ohne Bereich): ein Bereich
    // schnitte die Schreiber desselben Frames ab.
    static _instanzUmzug(mesh, von, nach) {
        const im = mesh.instanceMatrix;
        im.array.copyWithin(nach * 16, von * 16, von * 16 + 16);
        im.needsUpdate = true;
        const ic = mesh.instanceColor;
        if (ic) {
            ic.array.copyWithin(nach * 3, von * 3, von * 3 + 3);
            ic.needsUpdate = true;
        }
        const geo = mesh.geometry;
        if (geo && geo.userData && geo.userData._lodFacade)
            for (const k in AnazhRealm.LOD_INSTANZ_ATTRIBUTE) {
                const a = geo.attributes[k];
                if (!a || !a.isInstancedBufferAttribute) continue;
                const s = a.itemSize;
                a.array.copyWithin(nach * s, von * s, von * s + s);
                a.needsUpdate = true;
            }
    }
    // DER TAUSCH ZWEIER INSTANZEN (die Instanz-Wahl je Pass ordnet ihre Gruppe): dieselbe Liste der Instanz-Größen wie
    // der Umzug, in beide Richtungen.
    static _instanzTausch(mesh, a, b) {
        const tausch = (attr, n) => {
            if (!attr) return;
            const x = attr.array;
            for (let j = 0, ia = a * n, ib = b * n; j < n; j++, ia++, ib++) {
                const t = x[ia];
                x[ia] = x[ib];
                x[ib] = t;
            }
            attr.needsUpdate = true;
        };
        tausch(mesh.instanceMatrix, 16);
        tausch(mesh.instanceColor, 3);
        const geo = mesh.geometry;
        if (geo && geo.userData && geo.userData._lodFacade)
            for (const k in AnazhRealm.LOD_INSTANZ_ATTRIBUTE) {
                const at = geo.attributes[k];
                if (at && at.isInstancedBufferAttribute) tausch(at, at.itemSize);
            }
    }

    // Die EINE Fern-Key-Ableitung: trägt ein Leaf die FERN-Stufe (Impostor `fimp:` · Foundry-L2 `f:…|2|…`
    // · Grammatik `_lod2` · Streu `fscatter:…:2`), mappt sein Region-Key auf die SUPER-REGION (4×4, Marker
    // `s:`) — camera-facing Quads nutzen den Region-Cull kaum. Der platzierte Bau ist global (null-Key, Welle B);
    // BAUM-Streu bleibt global (null-Key). Ein Super-Key ist über Regionen GETEILT: _disposeScatterRegion
    // räumt nur den eigenen `@regX,regZ`-Suffix, die Empty-Dispose (`_archInstanceRemove`) den Rest.
    _archFernRegionKey(name, leaf, regionKey) {
        if (regionKey == null) return regionKey;
        const lk = leaf && typeof leaf.leafKey === "string" ? leaf.leafKey : "";
        const fern =
            lk.startsWith("fimp:") ||
            /^f:[^|]*\|\d+\|2[|:]/.test(lk) ||
            (typeof name === "string" && (name.endsWith("_lod2") || /^fscatter:.*:2$/.test(name)));
        if (!fern) return regionKey;
        const S = AnazhRealm.SCATTER_FERN_SUPERREGION;
        if (!(Number.isFinite(S) && S > 1)) return regionKey; // S=1 = das alte per-Region-Keying (A/B-Hebel der Linse)
        const m = /^(-?\d+),(-?\d+)$/.exec(String(regionKey));
        if (!m) return regionKey; // schon gemappt (s:) oder fremdes Format → unberührt (idempotent)
        return "s:" + Math.floor(Number(m[1]) / S) + "," + Math.floor(Number(m[2]) / S);
    }

    // Die EINE Slot-Farbe (Chokepoint von _archInstanceAdd + _scatterInstanceAdd): Part-Farbe (leaf.tint)
    // × Entry-/Streu-Tint (useInstanceTint); null = kein Farb-Write (Buffer bleibt un-alloziert). Beide
    // MULTIPLIZIEREN auf den colorNode (neutral WEISS); leaf.tint via setHex (sRGB→linear), Tint roh.
    _archSlotColor(leaf, entryTint) {
        const useTint = !!(leaf.mat && leaf.mat.userData && leaf.mat.userData.useInstanceTint);
        const leafTint = leaf.tint;
        if (leafTint === undefined && !useTint) return null;
        const c = this._archTmpSlotColor || (this._archTmpSlotColor = new THREE.Color());
        if (leafTint !== undefined) c.setHex(leafTint);
        else c.setRGB(1, 1, 1);
        if (useTint && entryTint) c.multiply(entryTint);
        return c;
    }

    _archInstanceAdd(entry, flat, opts) {
        // KEIN FALLBACK: ist der Eintrag eine foundry-bekannte Art (Baum/Fels/Kristall/Blume/Strauch) und der
        // Flat KEIN Studio-Flat (`!flat.foundry`), wird NICHTS platziert — der Eintrag wartet kalt, bis das
        // Studio liefert (Culling-Tick/Refill). Grammatik-Fixturen öffnen die Wand nur unter
        // `__withNoFoundry` (`_foundryEnabled()` false).
        if (
            flat &&
            !flat.foundry &&
            typeof this._foundryEnabled === "function" &&
            this._foundryEnabled() &&
            this._foundryPresetForEntry(entry)
        ) {
            return;
        }
        const ew = this._archEntryWorldMatrix(
            entry,
            this._archTmpEntryM || (this._archTmpEntryM = new THREE.Matrix4())
        );
        const m = this._archTmpLeafM || (this._archTmpLeafM = new THREE.Matrix4());
        // DER HALT AB GEBURT (K36): eine neue Primär-Stufe hält VOLL, bis die Band-Pflege ihren Partner geurteilt hat
        // (`_updateFoundryLodBand` löst ihn nur, wo der Partner steht). Bis K36 blendete sie vom ersten
        // Bild an — und urteilte die schlafende Stufen-Wahl nie über sie, stand die L1 vor der ungebackenen Karte halb
        // durchsichtig (Genesis-Ankunft, echte GPU: 5 Bäume nach 71 Takten).
        if (!(opts && opts.band)) {
            entry._lodHalt = true;
            entry._lodHaltWartet = false;
        }
        const slots = [];
        // instanceColor trägt die Farbe als RGB (0..1); InstancedMesh alloziert mesh.instanceColor LAZY beim
        // ersten setColorAt. OB und WAS geschrieben wird, entscheidet `_archSlotColor`. instanceColor
        // MULTIPLIZIERT die Material-Farbe → neutral ist WEISS (Grau verdunkelte jede tint-lose Instanz).
        const tintColor = this._archTmpTintColor || (this._archTmpTintColor = new THREE.Color());
        if (Number.isFinite(entry.tintH) && Number.isFinite(entry.tintS) && Number.isFinite(entry.tintV)) {
            tintColor.setRGB(entry.tintH, entry.tintS, entry.tintV);
        } else {
            tintColor.setRGB(1, 1, 1);
        }
        // Welle B — der platzierte Bau ist GLOBAL (kein Regions-Schlüssel): er lebt in der Mesh-Zone (Cull-Radius
        // 100–150 m; ein Karten-Ding als Karte bis zum Karten-Horizont), jenseits trägt der Box-Satz im Welt-March; eine
        // 256-m-Region brachte keinen Cull (ihre Kugel R·√½ + 140 m schneidet das Frustum praktisch immer), sie
        // vervielfachte nur die Gruppen je Leaf (@p:).
        for (let i = 0; i < flat.leaves.length; i++) {
            const leaf = flat.leaves[i];
            // Der Leaf-Schluessel ist normal der Array-Index; ein Leaf DARF ihn ueberschreiben
            // (leaf.leafKey) — so bekommt Foundry-Geometrie je Art:Variante:LOD:Teil eine EIGENE
            // InstancedMesh-Gruppe im BESTEHENDEN HISM (Vielfalt + LOD + Instancing, kein Parallelpfad).
            // Trägt das Leaf eine Studio-Identität (f:/fimp:), IST sie die Gruppe — ohne den Bau-Typ (zwei Typen
            // mit derselben Studio-Geometrie zeichnen in EINER Gruppe).
            const studio = typeof leaf.leafKey === "string" && /^(f|fimp):/.test(leaf.leafKey);
            const g = this._archInstanceGroupFor(
                studio ? "" : entry.type,
                leaf.leafKey != null ? leaf.leafKey : i,
                leaf,
                null
            );
            const ref = this._archGroupAlloc(g, entry);
            // DIE FLÜGEL-INSTANZ (1310-4): zeichnen mehrere Flügel in EINER Gruppe, trägt die Marke den Schwenk-Träger ihres
            // Flügels (Scharnier, Lage der Gestalt) — `g.tuer` ist nur der des ersten
            if (leaf.tuer) ref.tuer = leaf.tuer;
            const slot = ref.slot;
            m.multiplyMatrices(ew, leaf.localMatrix);
            g.mesh.setMatrixAt(slot, m);
            // V18.181-merge-Λ Sub 3d / V18.475: die EINE Slot-Farbe (leaf.tint ×
            // Entry-Tint, _archSlotColor) — lazy Allocation des Color-Buffers.
            const slotColor = this._archSlotColor(leaf, tintColor);
            g.mesh.instanceMatrix.needsUpdate = true;
            if (slotColor) {
                g.mesh.setColorAt(slot, slotColor);
                if (g.mesh.instanceColor) g.mesh.instanceColor.needsUpdate = true;
            }
            // boundingSphere invalidieren (V18.358: THREE cacht sie sonst stale → spät platzierte Bauten
            // cullen im Blickfeld; Raycast-Cull, s. _archGroupFree).
            g.mesh.boundingSphere = null;
            // AUSLÖSCHUNGS-WELLE (Feld B) — die per-Instanz-Metrik stempeln (Studio aH0·_isy + vOcc), die Karte ihre Schicht.
            this._lodSlotStamp(
                g,
                slot,
                entry.scale,
                this._lodSlotVoll(entry, !!(opts && opts.band), opts && opts.bandLod),
                leaf
            );
            slots.push(ref);
        }
        // W5.4 — Band-Add: NUR die Band-Felder (transient wie instSlots, nicht im Snapshot); der Primär-Zustand bleibt.
        if (opts && opts.band) {
            entry.instSlotsBand = slots;
            entry._lodBandLevel = Number.isFinite(opts.bandLod) ? opts.bandLod : null;
            return;
        }
        entry.instanced = true;
        entry.instSlots = slots;
        this._cullWecken(entry); // die gezeichnete Stufe wechselt: der Cull urteilt neu (`_cullWache`)
        this._fluegelLeib(entry); // der Tür- und Tor-Flügel trägt seinen Leib aus der Matrix, die er zeichnet (leib.K4)
        // DIE HÜLLE DER STUFE (Welle L, Kollision == Optik): ein Haus kollidiert, wie es gezeichnet ist — die Stufe 0 mit den
        // Solids des Gesetzbuchs (Böden, Tritte, Wände mit Öffnungen), JEDE Stufe dieselben (die fernen tragen die Solids der
        // Stufe 0, `hausSolids`); ein Stufen-Wechsel mit derselben Zeile schreibt die Blocker nicht neu.
        if (flat && flat.foundry && flat.huelle) this._hausHuelleSetzen(entry, flat.huelle);
        // ein Bau ohne Haus-Hülle, dessen Form oben schließt (Marktstand · Brunnen · Tor), trägt seine Decke in den Dach-Pool
        else if (flat && flat.foundry && entry._dachKasten === undefined) this._dachKastenSetzen(entry, flat.leaves);
        // Merker: aus dem Studio (Foundry) platziert → der LOD-Tick (`_switchArchitectureLOD`) serviert die
        // neue Stufe aus der Foundry statt aus `grown_..._lodN`. Transientes Render-Feld (wie
        // `instanced`/`instSlots`) — nicht im Snapshot.
        entry.instFoundry = !!(flat && flat.foundry);
        // Die SERVIERTE Stufe (flat.lod nach der kindStages-Klammer; Impostor-Flat lod:2): der
        // Clamp-Kurzschluss in _switchArchitectureLOD liest sie, damit eine Ein-Stufen-Art (fels [0]) beim
        // Schwellen-Übertritt nicht neu alloziert. Transient (nicht im Snapshot).
        entry._servedLod = flat && flat.foundry && Number.isFinite(flat.lod) ? flat.lod : null;
        this._kompositErbt(entry); // die Stufe wechselte: trägt sie seine Passagiere nicht (die Karte), verbergen sie sich
        // die Trittfläche der Ausstattung (einmal je Eintrag, idempotent) — der Studio-Platz hat das Buch
        if (entry.instFoundry) this._trittFlaecheSetzen(entry);
    }

    // Instanz-Matrizen eines Eintrags neu schreiben — auch der Mount-Follow eines FOUNDRY-Fahrzeugs
    // (instanziert, entry.mesh = null). Flat-Quelle wie `_rebuildArchitectureMesh`: instFoundry →
    // `_foundryFlattenFor` auf der SERVIERTEN Stufe (Cache-Treffer: die Slots stammen aus exakt diesem
    // Flat), sonst der Bauplan-Flat. STEER_VIS.instance = "entry-yaw": nur ew * leaf.localMatrix — die
    // geteilte localMatrix nie mutieren. JEDE ZEICHNENDE STUFE ZIEHT MIT: die Primär-Stufe (`instSlots`) und ihr Partner im
    // Stufen-Band (`instSlotsBand`, die Stufe `_lodBandLevel`). Befund Spielgang 17.10. (Radeon, GT nach 20 m in Third): nur die
    // Primär-Stufe fuhr, der L1-Partner des Bands stand mit 19 Slots am Ort des Aufstiegs — dort zeichnete der Aufbau, am
    // Wagen blendete die L0 im Band aus: in Third verschwand das Fahrzeug.
    _archInstanceUpdate(entry) {
        if (!entry.instanced || !entry.instSlots) return;
        const fPreset = entry.instFoundry && this._foundryEnabled() ? this._foundryPresetForEntry(entry) : null;
        const lod = Number.isFinite(entry._servedLod) ? entry._servedLod : entry._lodLevel;
        this._archInstanzSlotsSetzen(entry, entry.instSlots, fPreset, lod);
        if (entry.instSlotsBand && fPreset && Number.isFinite(entry._lodBandLevel))
            this._archInstanzSlotsSetzen(entry, entry.instSlotsBand, fPreset, entry._lodBandLevel, true);
    }
    // `band`: die Slots des Partners paaren mit dem Flat seiner GEBURT — ohne die Zwillinge, die die Primär-Stufe wirft
    // (`_bandOhneZwilling`, `_updateFoundryLodBand`); der ungefilterte Flat verschöbe jedes Blatt hinter einem Zwilling um eins.
    _archInstanzSlotsSetzen(entry, slots, fPreset, lod, band) {
        let flat = fPreset ? this._foundryFlattenFor(entry, fPreset, lod) : this._archFlattenBlueprint(entry.type);
        if (band && flat)
            flat = this._bandOhneZwilling(flat, this._foundryFlattenFor(entry, fPreset, entry._lodLevel | 0));
        if (!flat || !flat.instanceable) return;
        const ew = this._archEntryWorldMatrix(
            entry,
            this._archTmpEntryM || (this._archTmpEntryM = new THREE.Matrix4())
        );
        const m = this._archTmpLeafM || (this._archTmpLeafM = new THREE.Matrix4());
        let ewU = null; // die ungefederte Lage der Räder (erst beim ersten Rad-Leaf)
        for (let i = 0; i < slots.length && i < flat.leaves.length; i++) {
            const { key, slot } = slots[i];
            const g = this.state.archInstanceGroups && this.state.archInstanceGroups.get(key);
            if (!g) continue;
            const lf = flat.leaves[i];
            if (lf.rad && entry._fahr) {
                if (!ewU)
                    ewU = this._archEntryWorldMatrix(
                        entry,
                        this._archTmpRadU || (this._archTmpRadU = new THREE.Matrix4()),
                        true
                    );
                this._archRadMatrix(entry, lf, ewU, m);
            } else m.multiplyMatrices(ew, lf.localMatrix);
            g.mesh.setMatrixAt(slot, m);
            g.mesh.instanceMatrix.needsUpdate = true;
            // SUBMIT-WAL — Matrix-Mutation einer ggf. gebündelten Gruppe (Fahrzeug-
            // Mount-Follow): das Region-Bundle re-recorden (nur während gefahren wird).
            if (!g.mesh.__arena) this._archMeshBundleTouch(g.mesh); // eine Arena liest Zahl und Puffer im Takt (G1)
            // boundingSphere invalidieren (Frustum-/Raycast-Cull, s. _archGroupFree; die V18.358-Lehre:
            // THREE cacht sie sonst stale).
            g.mesh.boundingSphere = null;
        }
    }

    // DAS RAD IM RITT (Welle L, Q13 F-D8 — Befund 06.10.: die Studio-Instanz war starr, 12 Blätter mit unveränderter
    // relativer Matrix — kein Rad rollte oder lenkte, beim Bremsen tauchten die Vorderräder 7,4–11,1 cm in den Boden).
    // Die Matrix eines Rad-Leafs je Schritt: ungefedert (`ewU`: Gelände-Lage ohne Aufbau-Federn) · Welt-Skala · Nabe ·
    // Lenk-Einschlag (vorn, `_rideSteerYaw` = Lenksäule des Kerns) · Drehung π der Gegenseite · Rolle um die Achse
    // (`_fahr.wheelAng` = Weg/radR des Kerns, die Gegenseite dreht im Rad-Raum gegenläufig, rollt also gleich), und das Rad
    // federt einzeln auf seinen Boden (der Aufstandspunkt der Ruhe-Lage gegen `_fahrBoden`, gedeckelt bei ±Rad-Hub
    // vehicle-core FAHR.schritt.radHub × radR) — die Ebene der vier Räder ist eine Ebene, der Boden nicht. Nur das DREHENDE
    // Teil rollt (`rd.dreht`, im Studio der Knoten radDreht); der Bremssattel (R:s) hängt an der Nabe wie im Labor (garage
    // corners: grp lenkt, wheelSpin rollt) — er lenkt und federt mit, rollt aber nie (Gegenprüfung 07.10.: er kreiste mit).
    _archRadMatrix(entry, lf, ewU, out) {
        const rd = lf.rad;
        const fz = entry._fahr;
        const R = this._archTmpRadR || (this._archTmpRadR = new THREE.Matrix4());
        const Q = this._archTmpRadQ || (this._archTmpRadQ = new THREE.Matrix4());
        const lenk = rd.front && Number.isFinite(entry._rideSteerYaw) ? entry._rideSteerYaw : 0;
        const ang = Number.isFinite(fz.wheelAng) ? fz.wheelAng : 0;
        R.makeRotationY(lenk + rd.dreh);
        if (rd.dreht) R.multiply(Q.makeRotationZ(rd.dreh ? ang : -ang));
        R.setPosition(rd.hx, rd.hy, rd.hz);
        out.multiplyMatrices(ewU, rd.welt).multiply(R);
        // das Rad federt einzeln auf seinen Boden: der Aufstandspunkt (unter der Nabe, y 0 im Vorlagen-Raum) gegen den Boden, den
        // das Auge sieht — der Stand-Leser der Sicht um den Boden des Fahr-Schritts (`_standSicht`, wie Huf und Fuß; die Sim
        // bleibt auf dem Gesetz). Bis H5 federte das Rad auf das Gesetz: an der Mess-Wiese p95 4,9 cm neben dem Mesh (K8).
        const P = this._archTmpRadP || (this._archTmpRadP = new THREE.Vector3());
        if (entry._radGrob) return out; // fern (jenseits `VERKEHR.genauM`) steht das Rad in der Ebene der vier, ohne Hub
        P.set(rd.hx, 0, rd.hz).applyMatrix4(rd.welt).applyMatrix4(ewU);
        // je Nabe EIN Boden in der ungefederten Lage (Ort und Gier): Rad, Sattel und Nabe fragten je Blatt Säule und Mesh
        const E = ewU.elements;
        let M = entry._radBodenMerk;
        if (!M || M.x !== E[12] || M.z !== E[14] || M.c !== E[0] || M.s !== E[2])
            M = entry._radBodenMerk = { x: E[12], z: E[14], c: E[0], s: E[2], naben: new Map() };
        let boden = M.naben.get(rd.hx * 1009 + rd.hz);
        if (boden === undefined) {
            const g = this._fahrBoden(entry)(P.x, P.z);
            M.naben.set(rd.hx * 1009 + rd.hz, (boden = Number.isFinite(g) ? this._standSicht(P.x, P.z, g, false) : g));
        }
        if (Number.isFinite(boden)) {
            // der Federweg je Rad aus dem Fahr-Satz (vehicle-core fahrAufstand: radHub × radR × Skala — derselbe, mit dem die
            // Ebene des Kerns rechnet: was er nicht trägt, hob sie schon; `_fahr` lebt nur mit dem Satz)
            const hub = entry._fahrSatz.auf.hub;
            out.elements[13] += Math.max(-hub, Math.min(hub, boden - P.y));
        }
        return out;
    }

    // Eintrag aus der Registry entfernen (Slots freigeben). Default räumt IMMER BEIDE Slot-Sätze (Primär +
    // Band) → jeder Aufrufer (Cull · Prune · Remove · Rewarm · LOD-Switch) gibt Band-Slots mit frei.
    // `opts.bandOnly` räumt NUR das Band (`_updateFoundryLodBand`); der Primär-Zustand bleibt unberührt.
    _archInstanceRemove(entry, opts) {
        const bandOnly = !!(opts && opts.bandOnly);
        const lists = [];
        if (!bandOnly && entry.instSlots) lists.push(entry.instSlots);
        if (entry.instSlotsBand) lists.push(entry.instSlotsBand);
        if (!lists.length) {
            entry.instSlotsBand = null;
            entry._lodBandLevel = null;
            if (!bandOnly) [(entry.instanced = false), this._cullWecken(entry)];
            return;
        }
        // Gruppen, die nach dem Freigeben LEER sind, GANZ entsorgen (wie _disposeScatterRegion) → keine leeren
        // Gruppen beim Erkunden; Neuaufbau lazy (_archInstanceGroupFor). Welle B: JEDE Gruppe ist reapbar (die
        // geteilte Geometrie geht via _disposeArchInstanceGroup deferred frei; Leer-Bedingung liveCount<=0).
        const geleerte = new Set();
        for (const list of lists)
            for (const ref of list) {
                const g = this.state.archInstanceGroups && this.state.archInstanceGroups.get(ref.key);
                if (g) {
                    this._archGroupFree(g, ref);
                    geleerte.add(ref.key);
                }
            }
        entry.instSlotsBand = null;
        entry._lodBandLevel = null;
        if (!bandOnly) {
            this._cullWecken(entry);
            entry.instSlots = null;
            entry.instanced = false;
            entry._bruecke = false; // die Brücke lebt nur mit ihrer Karten-Instanz
            entry._lodHalt = false; // der Halt lebt nur mit seiner Stufe (die Band-Pflege urteilt neu)
            entry._lodHaltWartet = false;
        }
        for (const key of geleerte) {
            // Vollständig leer = liveCount 0 (die EINE Leer-Quelle, count folgt ihr).
            // Durch den EINEN Leer-Chokepoint mit Gnadenfrist (headless sofort).
            this._archGroupLeerDispose(key);
        }
    }

    // Alle Instancing-Gruppen abbauen (Welt-Wechsel/Restore). Geometrie +
    // Material leben im archFlattenCache (geteilt) → NICHT disposen; nur die
    // Instanz-Puffer der Senken verlassen die GPU (_instanzAbschied) + Map leeren.
    _archDisposeAllInstanceGroups() {
        if (this.state.archInstanceGroups) {
            for (const g of this.state.archInstanceGroups.values()) {
                if (g.satz) this._bauSatzMarke(g.key, g.satz); // Welle 6 — die Bereiche verlassen den Satz
                // SUBMIT-WAL — parent-bewusst: regionale InstancedMesh-Gruppen hängen
                // in Region-BundleGroups (scene.remove wäre dort ein No-op = Leck).
                if (g.mesh) this._archBundleSceneRemove(g.mesh);
                if (g.mesh) this._instanzAbschied(g.mesh);
            }
            this.state.archInstanceGroups.clear();
            this._instanzWahlGruppen().clear();
        }
        // T3 — verwaiste (bereits leere) Region-Bundles mit abbauen (Welt-Wechsel/Restore);
        // NACH den Gruppen (die Instanzen-Räumung oben kann Bundles schon leeren+löschen).
        if (this.state._regionBundles) {
            for (const bg of this.state._regionBundles.values()) {
                if (bg.parent) bg.parent.remove(bg);
                this._bundleQueryProxyTod(bg); // ④ — Query-Proxys fallen mit (kein Szene-Leck)
            }
            this.state._regionBundles.clear();
        }
        // DORF-ERLEBNIS — Zaun-Pool + Wege-Karte fallen mit; der settlementCells-Rebuild
        // (`_tickAutoSettlement`) baut sie lazy + deterministisch neu.
        this._stlWegeDispose();
    }

    // Mesh aus Eintrag (re-)bauen: Daten getrennt von Sicht — ein Eintrag in `state.architectures` kann
    // ohne Mesh existieren (gepruned) und später wieder einen bekommen. Gleiches Seed → gleicher Mesh.
    _rebuildArchitectureMesh(entry) {
        if (!this.state.scene || !entry) return null;
        // Instanzierbare Baupläne gehen in die HISM-Registry statt in eine eigene Group (Kollision aus
        // Leaf-AABBs, kein entry.mesh). Foundry-fähige Einträge platzieren ihr ECHTES Studio-Asset, nicht
        // nachgebaut: die Distanz-LOD (`entry._lodLevel`) FÜHRT, die Foundry serviert genau diese Stufe;
        // flat.instanceable → HISM, sonst bleibt der Eintrag KALT, bis der Culling-Tick (`_archIsRendered`
        // = false) ihn nachbaut. Den Klassik-Zweig prüfen Unit-Bänder unter __withNoFoundry.
        const fPreset = this._foundryEnabled() ? this._foundryPresetForEntry(entry) : null;
        if (fPreset) {
            // KALT-Platzierung: ZUERST die Distanz-LOD setzen — `_tickArchitectureLOD` überspringt kalte Einträge;
            // sonst erzwänge jeder ferne Eintrag ein L0-On-Demand-Bake (~170k) statt des vorgebackenen
            // L2-Billboards. Gilt JEDEM kalten Foundry-Eintrag (auch haus_/tor_/fels_var…), sonst klebt er auf
            // seiner Bau-Stufe. Ein-Stufen-Arten (fels [0]) klammert _foundryFlattenFor identisch.
            if (!entry.instanced && !entry.mesh) {
                const dlod = this._foundryLodForEntry(entry);
                if (Number.isFinite(dlod)) entry._lodLevel = dlod;
            }
            const fFlat = this._foundryFlattenFor(entry, fPreset, entry._lodLevel);
            if (fFlat && fFlat.instanceable) {
                entry._bruecke = false;
                this._archInstanceAdd(entry, fFlat);
                return null;
            }
            // DIE BRÜCKE: lädt die Wunsch-Stufe eines kalten Baums noch (die Anfrage ist eben gestellt), steht bis dahin
            // seine gedockte Studio-Karte — VOLL gestempelt (`_lodSlotVoll`), denn diesseits ihres Bands blendete die
            // Stufen-Maske sie aus. Der LOD-Tick wechselt auf die Wunsch-Stufe, sobald sie gedockt ist (er hält die
            // Karte bis dahin). Vorher stand hier nichts: der Kapsel-Satz des Felds war nah und mittel die Gestalt.
            // Eine 3D-Stufe kann keine Brücke sein — die Maske blendet L0/L1 außerhalb ihres Bands aus.
            // DIE BRÜCKE IST NUR BRÜCKE, WENN SIE DA IST (gedockt, `_foundryStufeBereit`): sie bestellt nichts und hebt keinen
            // Rang. Ihr Bedarf-Stempel hob bis 05.10. den kalten Karten-Bake des nahen Baums vor dessen eigene Geometrie,
            // die um Größen schneller ist (gemessen, gate:arch-feld Erst-Boot: die Karte einer Birke in 5 m ging vor elf
            // nahen Körpern in den Worker und hielt ihn 387 Takte; die Eichen-L0 brauchte 5). Den Rang einer Karte setzt,
            // wer sie als GESTALT braucht (die Fernstufe, `_foundryBuildImpostorFlat`).
            if (
                !entry.instanced &&
                entry._lodLevel < 2 &&
                this._foundryPresetIsTree(fPreset) &&
                this._foundryStufeBereit(entry, fPreset, 2)
            ) {
                const karte = this._foundryFlattenFor(entry, fPreset, 2);
                if (karte && karte.instanceable) {
                    entry._bruecke = true;
                    entry._brueckeT = performance.now(); // seit wann die Karte nah trägt (die Nah-Linse nennt die Dauer)
                    entry._lodLevel = 2;
                    this._archInstanceAdd(entry, karte);
                    return null;
                }
            }
            // Kennt die Foundry die Art, ist sie die EINE Quelle: null (lädt) ODER false (Bake-Lücke) → KALT
            // lassen, NIE die Grammatik; Culling-Tick/Refill bauen ihn als Studio, sobald das Asset da ist.
            return null;
        }
        // DIE STUDIO-GESTALT WARTET KALT (Integration 06.10.: die Glut gehört ins Studio): trägt der Bauplan eine
        // studioGestalt-Zeile (Feuerstelle · Marktstand · Ziehbrunnen · die Tore) und ist das Buch noch kalt, zeichnet
        // der Wirt NICHTS — seine Teile sind unsichtbare Substanz (Tags · Blocker · Trigger), nie ein Ersatz-Bild; der
        // Rewarm (`_foundryRewarmColdTrees`) platziert das Studio, sobald das Buch antwortet. Bis 06.10. zeichneten die
        // Wirts-Teile beim Boot (leer:g:glutbrunnen:L0 hielt danach seinen High-Water-count, 2 Befehle).
        if (this._foundryEnabled() && !(this._foundry && this._foundry.recipes)) {
            const gbp = this.state.blueprints && this.state.blueprints[entry.type];
            if (gbp && typeof gbp.studioGestalt === "string") return null;
        }
        const flat = this._archFlattenBlueprint(entry.type);
        // DETERMINISMUS-BOGEN P3 — die Architektur-Kollision ist feld-nativ
        // (`entry.blockerAABBs` aus dem Spawn + `_stepCharacterStructures`); kein
        // lazy Ammo-Collision-Build/Radius mehr.
        if (flat.instanceable) {
            this._archInstanceAdd(entry, flat);
            return null;
        }
        const builders = this._architectureBuilders();
        const builder = builders[entry.type];
        if (!builder) {
            // fail-LAUT: ein Eintrag OHNE Builder (z. B. fahrzeug_<preset> aus einem Save vor der Registrierung)
            // wäre stumm unsichtbar → ratenbegrenztes Konsolen-Wort; bei BEREITEM Buch zusätzlich ein
            // Magenta-Platzhalter, beim kalten Buch bleibt er kalt (der Ingest-Refill baut).
            const now = Date.now();
            if (!this._archKaltWarnAt || now - this._archKaltWarnAt > 10000) {
                this._archKaltWarnAt = now;
                this.log(
                    `ARCHITEKTUR OHNE BUILDER: "${entry.type}" (Buch ${this._foundry && this._foundry.ready ? "BEREIT — unbekannter Typ!" : "kalt — heilt beim Ingest"})`,
                    "WARN"
                );
            }
            if (this._foundry && this._foundry.ready && this._foundry.recipes) {
                const ph = new THREE.Mesh(
                    new THREE.BoxGeometry(0.6, 0.6, 0.6),
                    new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })
                );
                ph.position.set(entry.position.x || 0, (entry.position.y || 0) + 0.3, entry.position.z || 0);
                ph.name = "bau-platzhalter";
                ph.userData.__kaltPlatzhalter = entry.type;
                this.state.scene.add(ph);
                return ph;
            }
            return null;
        }
        const baseY = Number.isFinite(entry.position.y) ? entry.position.y - 0.5 : 0;
        const group = builder(entry.seed);
        group.name = "bau:" + entry.type;
        group.position.set(entry.position.x || 0, baseY, entry.position.z || 0);
        if (Number.isFinite(entry.scale) && entry.scale !== 1) {
            group.scale.setScalar(entry.scale);
        }
        // W-H (V18.179) — die Pro-Instanz-Rotation auch im Nicht-HISM-Pfad
        // (nah gerendert / Edit), damit ein Baum bei Annäherung nicht „einrastet".
        if (Number.isFinite(entry.rotationY) && entry.rotationY !== 0) {
            group.rotation.y = entry.rotationY;
        }
        this.state.scene.add(group);
        entry.mesh = group;
        this._cullWecken(entry);
        return group;
    }

    // Mesh disposen, Eintrag bleibt als reine Daten erhalten. Fenster für
    // späteren Wieder-Aufbau wenn der Spieler zurückkehrt.
    _cullArchitectureMesh(entry) {
        if (!entry) return;
        // V12.0-perf.c.2 — instancierter Eintrag: Slots zurück in die Registry
        // (Matrix auf Null-Scale, Free-List). P3: keine Ammo-Kollision mehr freizugeben
        // (die Feld-Kollision lebt in `entry.blockerAABBs`, render-unabhängig).
        // Ohne Bild trägt er keinen Passagier (`_kompositErbt`) — hier, nicht in `_archInstanceRemove`: der Stufen-Wechsel räumt
        // und setzt im selben Ruf, sein Fahrer bliebe sonst ein Bild lang aus.
        if (entry.instanced) {
            this._archInstanceRemove(entry);
            this._kompositErbt(entry);
            return;
        }
        if (!entry.mesh) return;
        if (this.state.scene) this.state.scene.remove(entry.mesh);
        this._disposeSoulGroup(entry.mesh);
        entry.mesh = null;
        this._cullWecken(entry);
        this._kompositErbt(entry);
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_siedlung_instanz]);

// ===== ATLAS · Siedlung/instanz — Außen-Konstanten =====
// Die Instanz-Attribute der LOD-Fassade (`_lodInstanceFacade`) mit ihrer Breite: Sichthöhen (aH0/aH0L), Billboard-
// die Karte (aKarte = Atlas-Schicht, Halbbreite, Höhe — template-lokal — und die Sichthöhe, negativ = verdeckt).
AnazhRealm.LOD_INSTANZ_ATTRIBUTE = { aH0: 1, aH0L: 1, aKarte: 4 };
{
    // Die Ökologie der Streu ist das Gesetz des Kerns (phyto-core SCATTER_STRATUM), fail-closed — kein Zahlen-Zwilling hier.
    const _eco = (n) => {
        const s = globalThis.__phytoCore.SCATTER_STRATUM[n];
        if (!s || ![s.floor, s.scaleBase, s.scaleVar, s.slopeMax].every(Number.isFinite))
            throw new Error("phyto-core fehlt: SCATTER_STRATUM." + n + " (die Ökologie der Streu)");
        return s;
    };
    const _ecoTree = _eco("tree");
    const _ecoUnder = _eco("under");
    const _ecoRock = _eco("rock");
    // V18.491.118 — ecology from `__phytoCore.SCATTER_STRATUM`; caps stay Host.
    AnazhRealm.SCATTER = Object.freeze({
        cellM: 3.4, // Plan §3.5 — Baum-Zell-Raster (die Canopy-Schicht)
        regionM: 256, // eine Scatter-Region = 16 Voxel-Chunks (= Bake-Region V18.219)
        promoteM: 64, // < diesem Radius → der Scatter-Baum wird ein ECHTER Bauplan (Touch→Real)
        innerM: 64, // innerhalb: keine Deko-Streu (der promovierte/reale Ring trägt)
        outerM: 384, // äusserer Rand der Deko-Streu (jenseits trägt die Canopy-Shell)
        ringRegions: 1, // ±1 Region = 3×3 (768m²) aktiver Scatter-Ring
        perRegionCap: 1400, // (Legacy — die Baum-Schicht; die layers-Liste trägt jetzt die Caps)
        densityFloor: _ecoTree.floor, // lebendig-Boden für jeden Baum-Scatter
        densityScale: 1.5, // Multiplikator auf die lebendig-getriebene Wahrscheinlichkeit
        slopeMax: _ecoTree.slopeMax, // Steilhänge tragen weniger Scatter (Fels-Zone)
        maxRegionsPerFrame: 1, // bounded: max 1 Region/Frame generieren (Plan §5)
        // Mehrschichtige Dichte: Canopy (Bäume) + Strauch + Kraut + Bodenflora + Fels; Strauch/Kraut/Blume
        // teilen den feineren under-Pass, jeder Pass mit eigenem Zell-Raster + Cap. Region = 256 m ≈ 35 Chunks.
        // Die Streu-Schicht (litter → baum_totholz, eine belaubte Eiche als „Totholz") fiel W1 final.
        layers: Object.freeze([
            // Baum-Schicht: wenige, große, varianz-reiche Bäume (hohes scaleVar → ragende Alte + junge) statt
            // vieler dünner Stacheln; der niedrige cap hält offenes Waldland (Terrain/Fels/Blumen sichtbar).
            Object.freeze({
                name: "tree",
                cellM: 3.4,
                // V18.296 (Schöpfer-Anordnung, 20+ Versionen überfällig: „sehe immernoch
                // hunderte Bäume … wir gehen runter"): cap 300→90 (~2.6 Bäume/Chunk =
                // offenes Waldland, freie Sicht auf Terrain/Fels/Substanz). REVERSIBEL.
                cap: 55, // V18.303 90→55: das Laub war 90 % der GPU-Last (gemessen) + Schöpfer „zu viele Bäume, sonst kaum was"
                floor: _ecoTree.floor,
                scaleBase: _ecoTree.scaleBase,
                scaleVar: _ecoTree.scaleVar,
                slopeMax: _ecoTree.slopeMax,
                kind: "tree",
                promotable: true,
            }),
            // Understory (Strauch+Kraut+Bodenflora): Cap bleibt < treeCap, damit die Bäume die prominente
            // Substanz bleiben — viel Gestrüpp verdeckte sie und kostete FPS.
            Object.freeze({
                name: "under",
                cellM: 2.4,
                cap: 40, // V18.303 70→40 (das Laub = 90 % der GPU-Last); V18.296 250→70
                floor: _ecoUnder.floor,
                scaleBase: _ecoUnder.scaleBase,
                scaleVar: _ecoUnder.scaleVar,
                slopeMax: _ecoUnder.slopeMax,
                kind: "under",
                promotable: false,
            }),
            // FELS: Kiesel + Brocken, wo der Fels durchbricht (rockExposure aus slope+trocken+kahl). Eigener
            // densityScale, hoher slopeMax (Fels mag steil), große Skalen-Varianz. Deko, nicht promotable.
            Object.freeze({
                name: "rock",
                cellM: 2.6,
                cap: 110, // V18.303 350→110: 350 Kiesel/Region = absurd viele Instanzen für winzigen Look-Wert (der größte Instanz-Posten nach den Bäumen)
                floor: _ecoRock.floor,
                scaleBase: _ecoRock.scaleBase,
                scaleVar: _ecoRock.scaleVar,
                slopeMax: _ecoRock.slopeMax,
                densityScale: 1.3,
                kind: "rock",
                promotable: false,
            }),
        ]),
    });
}
// Die Laub-Layer: FOLIAGE_LAYER ist die non-breaking Vorbedingung eines eigenen Laub-Passes: das Laub
// trägt die Layer ZUSÄTZLICH (Layer 0 bleibt → Render/Schatten unverändert), ist so aber für einen
// Laub-Pass (`pass.setLayers(FOLIAGE_LAYER)`) isoliert wählbar. Headless → 1.
AnazhRealm.FOLIAGE_LAYER = 1; // eigene Render-Layer für den reduziert aufgelösten Laub-Pass (Layer 0 bleibt aktiv)
AnazhRealm.BERG_CULL = Object.freeze({
    minDist: 140, // m — nahe Regionen nie verdeckt (Sicherheits-Zone, Pop-frei)
    proben: 5, // Höhen-Proben je Sichtlinie
    tMin: 0.2, // Proben-Fenster entlang der Linie (Kamera 0 → Kugel 1):
    tMax: 0.85, //   nie direkt an Kamera/Kugel (dort deckt minDist bzw. die Kugel selbst)
    marge: 2, // m — das Terrain muss die Linie KLAR überragen (konservativ, nie knapp)
    testMsSichtbar: 400, // Re-Test-Kadenz sichtbarer Regionen (amortisiert)
    testMsVerdeckt: 150, // verdeckte testen HÄUFIGER → schneller Un-Cull hinterm Grat
    budgetJeFrame: 6, // max Berg-Tests je Frame (≤ 6×15 Gesetz-Proben ≈ sub-ms)
    queryTakt: 10, // Occlusion-Query-Probe-Fenster: nur jeder N-te Frame fragt (Dawn-QuerySet-Cliff)
    stummFenster: 6, // so viele Probe-Fenster ohne begonnene Abfrage, dann meldet der Berg-Cull den Stellvertreter laut
});
