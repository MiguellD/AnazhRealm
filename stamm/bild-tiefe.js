class AnazhRealm_bild_tiefe {
    // ===== ATLAS · Bild/tiefe — Tiefen-Pyramide des Bilds · Haufen-Schnitt der Bau-Sätze in zwei Zügen · Verdeckung der Region-Bündel =====
    // DIE SICHT DER EINHEIT (E7, „gezeichnet wird, was Pixel trägt"): EIN Ort im Stamm entscheidet, ob ein Körper hinter dem
    // steht, was das Bild schon zeigt — für jedes System dasselbe Gesetz `verdeckt` (WGSL, `SICHT_TIEFE_WGSL`). Befund
    // Schritt 0 (Pixel-Zensus, Radeon, spike/einheit-sicht/BLATT.md): kein Ort des Stamms las die Tiefe je Haufen; der Bau-Satz
    // zeichnete jede Zelle im Frustum, die Region-Bündel kannten nur den Berg aus der Makro-Höhe und den Query-Kasten
    // „Wald-vor-Wald" (1–2 Bilder Verzug, ein Stellvertreter je Bündel). Beide fallen: die Pyramide ist die EINE Verdeckung.
    //
    // DIE PYRAMIDE: das Tiefen-Abbild des Hauptbilds (`_tiefenAbbild`, r32float, die fernste Tiefe je waagrechtem Pixel-Paar,
    // gezeichnet im Pass-Bruch — die opake Tiefe) wird auf demselben Encoder, bevor der Szenen-Pass wieder beginnt
    // (`_sichtTiefeBruch`), zu einer Pyramide aus linearer Tiefe (fernste, nächste) je Block von `blockPx` × `blockPx` Pixeln
    // und jeder Halbierung darüber. Den Bruch schuldet jedes Hauptbild: der Auslöser (`_sichtAusloeser`, ein Leser der
    // Szenen-Tiefe ohne Fläche) zeichnet nach allen opaken Körpern, wenn kein Leser vor ihm brach.
    //
    // DAS GESETZ `verdeckt(Kiste, Weg, Schirm)`: die Kiste in der Lage des Bilds der Pyramide (seine Projektion samt dem Versatz
    // der zeitlichen Auflösung, das Auge im Ursprung) — liegt eine Ecke hinter der Nah-Ebene, ist sie sichtbar. Ein Haufen
    // (`Schirm`, sein Urteil gilt nur in DIESEM Bild) zählt nur den Teil im Schirm: ganz außerhalb ist er verdeckt, am Rand
    // gilt das Rechteck im Schirm. Ein Bündel (sein Urteil überlebt eine Drehung des Kopfs) ist sichtbar, sobald sein Rechteck
    // nicht ganz im Bild liegt. Sonst ihr Rechteck, geweitet um den Rand `randPx` und die PARALLAXE des Wegs (nur die Bündel
    // tragen einen): ein Weg verschiebt einen Verdecker in Tiefe z um höchstens f · Weg / z Pixel gegen den Körper dahinter —
    // z ist die NÄCHSTE Tiefe im geweiteten Rechteck (bis der Rand steht). Verdeckt ist die Kiste, wenn ihre nächste Ecke
    // hinter der FERNSTEN Tiefe des geweiteten Rechtecks liegt. In derselben Lage, in der die Pyramide entstand, ist das
    // Urteil wahr: ein Verdecker verdeckt vom Auge seines Bilds.
    //
    // DER HAUFEN-SCHNITT IN ZWEI ZÜGEN (Bau-Sätze): der Abschnitt des Hauptbilds (`_chunkSatzAbschnitt`) zerfällt in Haufen zu
    // `haufen` Dreiecken in Index-Folge, jeder mit seiner Kiste aus den Ecken (und dem Morph-Ziel).
    //   FRÜH (im Haken des Hauptbilds, vor jedem Zeichnen): EIN Compute prüft je Satz jeden Haufen gegen die Pyramide des
    //   LETZTEN Bilds in dessen Lage, summiert die Plätze (exklusives Präfix), schreibt den Auftrag und kopiert die Indizes
    //   der sichtbaren Haufen dicht in den frühen Sicht-Index — der Satz zeichnet als EIN drawIndexedIndirect.
    //   SPÄT (im Bruch, auf dem Encoder des Szenen-Passes): jeder früh verdeckte Haufen gegen die Pyramide DIESES Bilds in
    //   seiner Lage — die nun sichtbaren zeichnet der späte Zug (`ordnung`, nach dem Auslöser). Was früh fehlte, weil das
    //   Auge ging oder ein Verdecker ging oder verschwand, steht im selben Bild: kein Pop, kein Rand für Bewegung, keine
    //   Wanduhr. Die Kaskaden zeichnen wie bisher.
    //
    // DIE BÜNDEL: jede Region-Kugel als Kiste durch dasselbe Gesetz gegen die Pyramide des letzten Bilds mit dem Weg
    // `buendelM`; das Urteil liest der Takt zurück (1–3 Bilder) und gilt, solange das Auge seit dem Bild der Pyramide samt
    // bewegtem Verdecker in `buendelM` bleibt (`_sichtBuendelVerdeckt` in `_archRegionBundleCull`). Ein Bündel hat keinen
    // späten Zug (es zeichnet als Render-Bündel): ein verschwindender Verdecker zeigt es 1–3 Bilder später.

    // Der Zustand (lazy). `bild` zählt die Hauptbilder; `lage` ist die Lage des jüngsten Hauptbilds; `pyramideBild` das Bild,
    // dessen Tiefe die Pyramide trägt.
    _sichtTiefeZustand() {
        if (this._sichtTiefeZ) return this._sichtTiefeZ;
        this._sichtTiefeZ = {
            bild: 0,
            aktiv: false,
            bruchOffen: false,
            frisch: false,
            pyramideBild: -1,
            lage: null,
            buendelLage: null,
            auftraege: [],
            buendel: [],
            urteile: new WeakMap(),
            gpu: null,
            lesen: [],
            offen: null,
            zellen: new WeakMap(),
            saetze: new Set(),
            ausloeser: null,
            gemeldet: false,
            zahl: {
                bilder: 0,
                ohneTiefe: 0,
                ohneBruch: 0,
                haufen: 0,
                frueh: 0,
                spaet: 0,
                verdeckt: 0,
                trisSatz: 0,
                trisSicht: 0,
                buendel: 0,
                buendelVerdeckt: 0,
                leseVoll: 0,
            },
        };
        return this._sichtTiefeZ;
    }

    // Das Gerät der Sicht: WebGPU trägt Compute und indirekte Züge im Kern (kein Merkmal nötig). Der Null-Renderer zeichnet nie
    // (null, still); jeder andere Renderer ohne WebGPU-Gerät meldet den Bruch EINMAL laut beim Namen — die Verdeckung fehlt dort.
    _sichtTiefeGeraet() {
        const rend = this.state.renderer;
        if (!rend || rend._isHeadlessNull) return null;
        const be = rend.backend;
        if (be && be.isWebGPUBackend === true && be.device) return be.device;
        const T = this._sichtTiefeZustand();
        if (!T.gemeldet) {
            T.gemeldet = true;
            this.log(
                "SICHT-TIEFE: der Renderer trägt kein WebGPU-Gerät (Compute + drawIndexedIndirect) — die Verdeckung der " +
                    "Bau-Sätze und Region-Bündel fehlt auf diesem Gerät",
                "ERROR"
            );
        }
        return null;
    }

    // DAS SPEICHER-ATTRIBUT (Storage, auf Wunsch Indirect): r184 kennt beide nur als Flagge am BufferAttribute
    // (`StorageBufferAttribute` / `IndirectStorageBufferAttribute` setzen `isStorageBufferAttribute` / `isIndirectStorageBufferAttribute`,
    // spec/vendor-anker.json „DIE SICHT DER EINHEIT") — die Klassen leben nur im three/webgpu-Bundle, der Stamm setzt die Flaggen
    // hier, an EINER Stelle.
    _sichtSpeicher(arr, indirekt) {
        const a = new THREE.BufferAttribute(arr, 1);
        a.isStorageBufferAttribute = true;
        if (indirekt) a.isIndirectStorageBufferAttribute = true;
        return a;
    }

    // DER BEGINN IM HAKEN DES HAUPTBILDS (`_passSicht`: die Spiel-Kamera, kein Schatten-Pass — derselbe Haken, der die Arenen
    // taktet): trägt die Pyramide die Tiefe des letzten Hauptbilds, prüft der frühe Zug gegen sie. Ein Bild, das begann und
    // nie brach (kein Leser zeichnete), zählt (`ohneBruch`).
    _sichtTiefeBeginn(kamera) {
        const T = this._sichtTiefeZustand();
        T.aktiv = false;
        T.auftraege.length = 0;
        // jeder Zug ruht, bis sein Satz in diesem Bild wieder ruft (`_sichtSatz`) — nie zeichnet ein Auftrag des letzten Bilds
        this._sichtTiefeRuht();
        if (T.bruchOffen) {
            T.bruchOffen = false;
            T.zahl.ohneBruch++;
        }
        if (!this._sichtTiefeGeraet()) return false;
        const L = T.lage;
        T.frisch = !!(L && T.pyramideBild === T.bild && kamera.isPerspectiveCamera === true);
        T.bild++;
        T.zahl.bilder++;
        if (!T.frisch) T.zahl.ohneTiefe++;
        T.aktiv = true;
        this._sichtAusloeser().visible = true;
        return true;
    }

    // JEDER ANDERE HAKEN (Kaskaden, Spiegel, der Nachher-Haken): die Züge der Sicht und der Auslöser zeichnen nur im Hauptbild.
    _sichtTiefeRuht() {
        const T = this._sichtTiefeZ;
        if (!T) return;
        if (T.ausloeser) T.ausloeser.visible = false;
        for (const V of T.saetze) V.mesh.visible = V.spaet.mesh.visible = false;
    }

    // DER AUSLÖSER DES BRUCHS: ein Dreieck ohne Fläche, dessen Stoff das Abbild der Szenen-Tiefe zum Zeitpunkt der Sicht
    // zeichnet — sein Zug bricht den Pass (je Render einmal); er zeichnet nach allen opaken Körpern und vor dem späten Zug.
    // EIGENER KNOTEN (E9 S5): r184 bucht `updateBefore` je Referenz, ein Textur-Knoten referenziert seine Textur — las der
    // Auslöser `_szeneTiefe`, galt sein Bruch für jeden Leser dieses Renders, und Wasser, Feld-Pass und Rauch lasen die Tiefe
    // ohne die spät gezeichneten Haufen. Sein Knoten ist ein eigener Wert, die Leser brechen hinter dem späten Zug.
    _sichtAusloeser() {
        const T = this._sichtTiefeZ;
        if (T.ausloeser) return T.ausloeser;
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(9), 3));
        const m = new THREE.MeshBasicNodeMaterial({ depthWrite: false, depthTest: false });
        m.colorWrite = false;
        m.fog = false;
        this._szeneTiefe();
        const abbild = this._szeneTiefeKnoten.value;
        const zeitpunkt = THREE.TSL.uniform(0);
        zeitpunkt.updateBeforeType = "render";
        zeitpunkt.updateBefore = (frame) => this._tiefenAbbild(frame, abbild, "sicht");
        m.colorNode = THREE.TSL.vec4(zeitpunkt, 0, 0, 1);
        const mesh = new THREE.Mesh(g, m);
        mesh.name = "sicht-ausloeser";
        mesh.frustumCulled = false;
        mesh.matrixAutoUpdate = false;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        mesh.renderOrder = AnazhRealm.SICHT_TIEFE.ordnung - 0.5;
        mesh.visible = false;
        this.state.scene.add(mesh);
        T.ausloeser = mesh;
        return mesh;
    }

    // DER SATZ IM HAUPTBILD (aus `_chunkSatzPass`): ein opaker Bau-Satz mit Abschnitt zeichnet über seine zwei Züge — der Satz
    // selbst ruht diesen Pass (`ab` bringt ihn im nächsten Haken zurück), sein Auftrag wartet auf den Compute am Ende des
    // Hakens. Ein durchsichtiger Satz zeichnet wie bisher (er verdeckt nichts, die Reihenfolge seiner Liste bleibt).
    _sichtSatz(s, a, S) {
        const T = this._sichtTiefeZ;
        const V0 = s.sicht;
        if (!T || !T.aktiv || !a || a.n === 0 || !s.mesh.visible || s.mesh.material.transparent === true) {
            if (V0) V0.mesh.visible = V0.spaet.mesh.visible = false;
            return;
        }
        const V = V0 || this._sichtSatzNeu(s);
        this._sichtSatzFolgen(s, V);
        this._sichtSatzHaufen(s, a, V, T);
        s.mesh.visible = false;
        S.ab.push(s.mesh);
        V.mesh.visible = V.spaet.mesh.visible = true;
        T.auftraege.push(V);
    }

    // Die zwei Züge eines Satzes: dieselben Ecken (geteilte Attribute), je Zug ein Sicht-Index (Storage, der Compute füllt ihn
    // dicht) und ein Auftrag (Storage + Indirect). Derselbe Name wie der Satz: im Hauptbild zeichnen NUR die Züge, der Täter
    // bleibt „bauSatz" (Band, Haushalt). r184 bucht einen Zug mit EINEM Dreieck; den Rest bucht `onAfterRender` aus dem
    // zurückgelesenen Auftrag.
    _sichtSatzNeu(s) {
        const zug = (art, ordnung) => {
            const g = new THREE.BufferGeometry();
            g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e9);
            const auftrag = this._sichtSpeicher(new Uint32Array(8), true);
            auftrag.name = "sicht:auftrag:" + art;
            g.indirect = auftrag;
            g.indirectOffset = 0;
            g.setDrawRange(0, 3);
            const mesh = new THREE.Mesh(g, s.mesh.material);
            mesh.name = s.spec.name;
            mesh.matrixAutoUpdate = false;
            mesh.frustumCulled = false;
            mesh.castShadow = false;
            mesh.receiveShadow = s.mesh.receiveShadow;
            mesh.renderOrder = ordnung;
            mesh.visible = false;
            mesh.userData.sichtSatz = s.art;
            mesh.userData.sichtZug = art;
            if (s.spec.userData && s.spec.userData.zeichenSchicht)
                mesh.userData.zeichenSchicht = s.spec.userData.zeichenSchicht;
            const Z = {
                art,
                mesh,
                geom: g,
                auftrag,
                index: null,
                kap: 0,
                tris: 0,
                zielPuffer: null,
                zielKap: 0,
                uni: null,
                gruppe: null,
                gruppeVon: null,
            };
            mesh.onAfterRender = (renderer) => {
                if (renderer.info && Z.tris > 1) renderer.info.render.triangles += Z.tris - 1;
            };
            this.state.scene.add(mesh);
            return Z;
        };
        const V = zug("frueh", s.mesh.renderOrder);
        V.s = s;
        V.ver = null;
        V.n = 0;
        V.nIdx = 0;
        V.tafel = null;
        V.tafelPuffer = null;
        V.tafelNeu = false;
        V.haufenZelle = [];
        V.spaet = zug("spaet", AnazhRealm.SICHT_TIEFE.ordnung);
        s.sicht = V;
        this._sichtTiefeZ.saetze.add(V);
        return V;
    }

    // WAS FÜR EINEN SATZ ZEICHNET: er selbst und, trägt er die Sicht, seine zwei Züge (früh · spät) — im Hauptbild zeichnen nur
    // sie (`_sichtSatz`), in jedem anderen Pass er. Der EINE Leser jeder Frage „zeichnete der Satz?" am gezeichneten Objekt (die
    // Nah-Bühne der S0-Probe, der Werkstatt-Weg): fragte eine Wand nur das Satz-Mesh, fiel der Satz aus ihrem Hauptbild (S0:
    // die Feuerstelle fehlte im Schuss, Nacht-Luma 22,4 → 21,4).
    _sichtZeichner(s) {
        const V = s.sicht;
        return V ? [s.mesh, V.mesh, V.spaet.mesh] : [s.mesh];
    }

    // Die Züge folgen den Puffern und dem Stoff ihres Satzes (ein Wachsen tauscht die Puffer, `_chunkSatzGeometrie`).
    _sichtSatzFolgen(s, V) {
        for (const Z of [V, V.spaet]) {
            let anders = false;
            for (const name of s.attrNamen) {
                const at = s.geom.attributes[name];
                if (Z.geom.attributes[name] !== at) {
                    Z.geom.setAttribute(name, at);
                    anders = true;
                }
            }
            if (Z.mesh.material !== s.mesh.material) Z.mesh.material = s.mesh.material;
            if (anders) AnazhRealm._renderObjekteFolgen(Z.mesh);
        }
    }

    // DIE HAUFEN-TAFEL eines Abschnitts: je Zelle der Wahl (in Satz-Ordnung, nah → fern) ihre Haufen zu `haufen` Dreiecken —
    // Kiste, Anfang im Satz-Index, Zahl der Indizes. Neu gelegt nur, wenn der Abschnitt sich änderte (Liste, Lage, Schreib-Stand
    // `a.ver`, Stand des Satzes): die Kosten folgen der Änderung, nie dem Bild.
    _sichtSatzHaufen(s, a, V, T) {
        const ver = V.ver;
        if (
            ver &&
            ver.liste === a.liste &&
            ver.start === a.start &&
            ver.ende === a.ende &&
            ver.schreib === (a.ver | 0) &&
            ver.stand === s.stand &&
            ver.index === s.geom.index
        )
            return;
        const H = AnazhRealm.SICHT_TIEFE.haufen * 3;
        const teile = [];
        let n = 0,
            nIdx = 0;
        for (const z of a.liste) {
            const off = a.platz.get(z);
            if (off === undefined) continue;
            const k = this._sichtZellHaufen(s, z, T);
            teile.push(a.start + off, k, z);
            n += k.length / 6;
            nIdx += z.idx.length;
        }
        let tafel = V.tafel;
        if (!tafel || tafel.length < n * 8) tafel = V.tafel = new Float32Array(Math.max(64, Math.ceil(n * 1.25)) * 8);
        const u = new Uint32Array(tafel.buffer);
        // je Haufen seine Zelle — der Zähler der Züge liest daran, welche Instanz-Klasse sichtbar zeichnete (draw-zaehler)
        const zelle = V.haufenZelle;
        zelle.length = n;
        let h = 0;
        for (let t = 0; t < teile.length; t += 3) {
            const start = teile[t],
                k = teile[t + 1],
                z = teile[t + 2];
            const len = k.zahl;
            for (let j = 0; j < k.length; j += 6) {
                const o = h * 8;
                const von = (j / 6) * H;
                tafel[o] = k[j];
                tafel[o + 1] = k[j + 1];
                tafel[o + 2] = k[j + 2];
                u[o + 3] = start + von;
                tafel[o + 4] = k[j + 3];
                tafel[o + 5] = k[j + 4];
                tafel[o + 6] = k[j + 5];
                u[o + 7] = Math.min(H, len - von);
                zelle[h] = z;
                h++;
            }
        }
        V.n = n;
        V.nIdx = nIdx;
        V.tafelNeu = true;
        V.ver = {
            liste: a.liste,
            start: a.start,
            ende: a.ende,
            schreib: a.ver | 0,
            stand: s.stand,
            index: s.geom.index,
        };
    }

    // Die Haufen EINER Zelle (gemerkt, solange ihre Hülle steht): je `haufen` Dreiecke ihres Index-Laufs die Kiste aus den Ecken
    // und dem Morph-Ziel (der Geomorph legt die Ecke dazwischen), um `randM` geweitet, in der Höhe um den Hub des Satzes.
    _sichtZellHaufen(s, z, T) {
        const hu = z.huelle;
        const alt = T.zellen.get(z);
        if (
            alt &&
            alt.n === z.idx.length &&
            alt.h[0] === hu.min.x &&
            alt.h[1] === hu.min.y &&
            alt.h[2] === hu.min.z &&
            alt.h[3] === hu.max.x &&
            alt.h[4] === hu.max.y &&
            alt.h[5] === hu.max.z &&
            alt.idx === z.idx
        )
            return alt.k;
        const pa = s.geom.attributes.position;
        if (!(pa.array instanceof Float32Array))
            throw new Error(
                `SICHT-TIEFE: die Lage des Satzes ${s.spec.name} ist nicht Float32 — die Haufen-Kiste liest sie roh`
            );
        const P = pa.array,
            gs = pa.itemSize;
        const mt = s.geom.attributes.aMorphTarget;
        const Z = mt ? mt.array : null,
            zs = mt ? mt.itemSize : 0;
        const I = z.idx;
        const H = AnazhRealm.SICHT_TIEFE.haufen * 3;
        const rand = AnazhRealm.SICHT_TIEFE.randM;
        const hub = s.spec.hub || 0;
        const k = new Float32Array(Math.ceil(I.length / H) * 6);
        for (let von = 0, o = 0; von < I.length; von += H, o += 6) {
            let x0 = Infinity,
                y0 = Infinity,
                z0 = Infinity,
                x1 = -Infinity,
                y1 = -Infinity,
                z1 = -Infinity;
            const bis = Math.min(I.length, von + H);
            for (let i = von; i < bis; i++) {
                const v = I[i];
                let p = v * gs;
                let x = P[p],
                    y = P[p + 1],
                    w = P[p + 2];
                if (x < x0) x0 = x;
                if (x > x1) x1 = x;
                if (y < y0) y0 = y;
                if (y > y1) y1 = y;
                if (w < z0) z0 = w;
                if (w > z1) z1 = w;
                if (Z) {
                    p = v * zs;
                    x = Z[p];
                    y = Z[p + 1];
                    w = Z[p + 2];
                    if (x < x0) x0 = x;
                    if (x > x1) x1 = x;
                    if (y < y0) y0 = y;
                    if (y > y1) y1 = y;
                    if (w < z0) z0 = w;
                    if (w > z1) z1 = w;
                }
            }
            k[o] = x0 - rand;
            k[o + 1] = y0 - rand - hub;
            k[o + 2] = z0 - rand;
            k[o + 3] = x1 + rand;
            k[o + 4] = y1 + rand + hub;
            k[o + 5] = z1 + rand;
        }
        k.zahl = I.length;
        T.zellen.set(z, {
            n: I.length,
            idx: I,
            h: [hu.min.x, hu.min.y, hu.min.z, hu.max.x, hu.max.y, hu.max.z],
            k,
        });
        return k;
    }

    // Die Puffer eines Zugs: Sicht-Index (Storage + Index, Platz ≥ alle Indizes des Abschnitts), Ziel je Haufen (sein Platz
    // oder 0xffffffff), die Uniform des Auftrags, die Bindegruppe (frisch, wenn ein Puffer wechselt). `frueh`: das Ziel des
    // frühen Zugs liest der späte (Bindung 6); der frühe liest dort die leere Attrappe.
    _sichtZugPuffer(V, Z, dev, rend, be, G, quelle) {
        // der Sicht-Index gehört der GPU (`_gpuEigen`: der Compute füllt ihn, kein CPU-Leser) — ein gefallener legt sich neu
        if (!AnazhRealm._gpuEigenSteht(Z.index) || Z.kap < V.nIdx) {
            const kap = Math.max(3072, Math.ceil((V.nIdx * 1.25) / 3072) * 3072);
            const alt = Z.index;
            Z.index = this._sichtSpeicher(new Uint32Array(kap));
            Z.index.name = "sicht:index:" + Z.art;
            Z.geom.setIndex(Z.index);
            Z.kap = kap;
            AnazhRealm._gpuEigen(rend, Z.index, 2); // r184 AttributeType.INDEX
            if (alt) this._gpuAbschied(alt);
            AnazhRealm._renderObjekteFolgen(Z.mesh);
        }
        rend._attributes.update(Z.auftrag, 4); // r184 AttributeType.INDIRECT: der Auftrag liegt vor dem Zug auf der GPU
        if (!Z.zielPuffer || Z.zielKap < V.n) {
            if (Z.zielPuffer) Z.zielPuffer.destroy();
            Z.zielKap = Math.max(64, Math.ceil(V.n * 1.25));
            Z.zielPuffer = dev.createBuffer({
                label: "sicht:ziel:" + Z.art,
                size: Z.zielKap * 4,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
            });
        }
        if (!Z.uni)
            Z.uni = dev.createBuffer({
                label: "sicht:satz:" + Z.art,
                size: 16,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
        const aus = be.get(Z.index).buffer;
        const auftrag = be.get(Z.auftrag).buffer;
        const frueh = Z === V ? G.leer : V.zielPuffer;
        const von = [V.tafelPuffer, Z.zielPuffer, auftrag, quelle, aus, frueh];
        if (!Z.gruppe || von.some((p, i) => Z.gruppeVon[i] !== p)) {
            Z.gruppe = dev.createBindGroup({
                layout: G.satzLayout,
                entries: [
                    { binding: 0, resource: { buffer: V.tafelPuffer } },
                    { binding: 1, resource: { buffer: Z.zielPuffer } },
                    { binding: 2, resource: { buffer: auftrag } },
                    { binding: 3, resource: { buffer: Z.uni } },
                    { binding: 4, resource: { buffer: quelle } },
                    { binding: 5, resource: { buffer: aus } },
                    { binding: 6, resource: { buffer: frueh } },
                ],
            });
            Z.gruppeVon = von;
        }
        return auftrag;
    }

    // Die Uniform eines Auftrags: Zahl der Haufen, „alle sichtbar", Weg, Zug (0 früh, 1 spät).
    _sichtAuftragSchreiben(dev, Z, n, alle, weg, spaet) {
        const ja = new ArrayBuffer(16);
        const ju = new Uint32Array(ja),
            jf = new Float32Array(ja);
        ju[0] = n;
        ju[1] = alle ? 1 : 0;
        jf[2] = weg;
        ju[3] = spaet ? 1 : 0;
        dev.queue.writeBuffer(Z.uni, 0, ja);
    }

    // DER FRÜHE ZUG AM ENDE DES HAKENS (vor jedem Zeichnen dieses Bilds; der Encoder geht vor dem des Szenen-Passes ab): je
    // Satz Prüfen + Summe und Kopie gegen die Pyramide des letzten Bilds, die Bündel; der späte Auftrag jedes Satzes wird
    // geleert (bricht das Bild nie, zeichnet er nichts). Dann die Lage DIESES Bilds für den Bruch.
    _sichtTiefeRechnen(kamera) {
        const T = this._sichtTiefeZ;
        if (!T || !T.aktiv) return;
        T.aktiv = false;
        const st = this.state;
        const rend = st.renderer;
        const be = rend.backend;
        const dev = be.device;
        const G = this._sichtTiefeGpu(dev);
        const ST = AnazhRealm.SICHT_TIEFE;
        // die Rücklesung des letzten Bilds (ihre Kopie ging mit seinem Szenen-Pass ab)
        this._sichtLesen();
        const B = T.buendel;
        B.length = 0;
        const map = st._regionBundles;
        if (map) for (const bg of map.values()) if (bg.userData.cullSphere) B.push(bg);
        const enc = dev.createCommandEncoder({ label: "sicht:frueh" });
        const pass = enc.beginComputePass({ label: "sicht:frueh" });
        const alle = !T.frisch;
        for (const V of T.auftraege) {
            const s = V.s;
            rend._attributes.update(s.geom.index, 2); // r184 AttributeType.INDEX: die Teil-Uploads des Abschnitts jetzt
            const quelle = be.get(s.geom.index).buffer;
            if (!V.tafelPuffer || V.tafelPuffer.size < V.n * 32) {
                if (V.tafelPuffer) V.tafelPuffer.destroy();
                V.tafelPuffer = dev.createBuffer({
                    label: "sicht:haufen",
                    size: Math.max(64, Math.ceil(V.n * 1.25)) * 32,
                    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
                });
                V.tafelNeu = true;
            }
            if (V.tafelNeu) {
                dev.queue.writeBuffer(V.tafelPuffer, 0, V.tafel.buffer, 0, V.n * 32);
                V.tafelNeu = false;
            }
            this._sichtZugPuffer(V, V, dev, rend, be, G, quelle);
            this._sichtZugPuffer(V, V.spaet, dev, rend, be, G, quelle);
            this._sichtAuftragSchreiben(dev, V, V.n, alle, 0, false);
            this._sichtAuftragSchreiben(dev, V.spaet, V.n, false, 0, true);
            pass.setBindGroup(0, G.lageGruppe);
            pass.setBindGroup(1, V.gruppe);
            pass.setPipeline(G.pruefe);
            pass.dispatchWorkgroups(1);
            pass.setPipeline(G.kopiere);
            pass.dispatchWorkgroups(Math.max(1, Math.min(V.n, 65535)), Math.max(1, Math.ceil(V.n / 65535)));
            T.zahl.haufen += V.n;
            T.zahl.trisSatz += V.nIdx / 3;
        }
        // die Bündel: dieselbe Prüfung mit dem Weg `buendelM`
        if (B.length > 0) {
            if (!G.kisten || G.kistenKap < B.length) {
                if (G.kisten) G.kisten.destroy();
                if (G.urteil) G.urteil.destroy();
                G.kistenKap = Math.max(64, Math.ceil(B.length * 1.5));
                G.kisten = dev.createBuffer({
                    label: "sicht:kisten",
                    size: G.kistenKap * 32,
                    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
                });
                G.urteil = dev.createBuffer({
                    label: "sicht:urteil",
                    size: G.kistenKap * 4,
                    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
                });
                G.buendelGruppe = dev.createBindGroup({
                    layout: G.buendelLayout,
                    entries: [
                        { binding: 0, resource: { buffer: G.kisten } },
                        { binding: 1, resource: { buffer: G.urteil } },
                        { binding: 2, resource: { buffer: G.buendelUni } },
                    ],
                });
            }
            const kf = new Float32Array(B.length * 8);
            for (let i = 0; i < B.length; i++) {
                const sp = B[i].userData.cullSphere;
                const c = sp.center,
                    r = sp.radius;
                kf.set([c.x - r, c.y - r, c.z - r, 0, c.x + r, c.y + r, c.z + r, 0], i * 8);
            }
            dev.queue.writeBuffer(G.kisten, 0, kf);
            const ja = new ArrayBuffer(16);
            const ju = new Uint32Array(ja),
                jf = new Float32Array(ja);
            ju[0] = B.length;
            ju[1] = alle ? 1 : 0;
            jf[2] = ST.buendelM;
            dev.queue.writeBuffer(G.buendelUni, 0, ja);
            pass.setBindGroup(0, G.lageGruppe);
            pass.setBindGroup(1, G.buendelGruppe);
            pass.setPipeline(G.buendel);
            pass.dispatchWorkgroups(Math.ceil(B.length / 64));
        }
        pass.end();
        for (const V of T.auftraege) enc.clearBuffer(be.get(V.spaet.auftrag).buffer, 0, 32);
        dev.queue.submit([enc.finish()]);
        // das Bild der Pyramide, gegen die die Bündel prüften (ihr Urteil gilt vom Auge jenes Bilds)
        const L = T.lage;
        T.buendelLage = L ? { auge: L.auge.slice(), t: L.t, frisch: T.frisch } : null;
        // die Lage DIESES Bilds (den Schirm setzt der Bruch aus dem Abbild)
        const N = L || (T.lage = { m: new THREE.Matrix4(), r: new THREE.Matrix4(), auge: [0, 0, 0], w: 0, h: 0, f: 0 });
        N.r.copy(kamera.matrixWorldInverse).setPosition(0, 0, 0);
        N.m.copy(kamera.projectionMatrix).multiply(N.r);
        const e = kamera.matrixWorld.elements;
        N.auge[0] = e[12];
        N.auge[1] = e[13];
        N.auge[2] = e[14];
        N.p5 = kamera.projectionMatrix.elements[5];
        N.nah = kamera.near;
        N.fern = kamera.far;
        N.t = this.state.spielZeit; // die Welt-Uhr (s): der bewegte Verdecker fährt in ihr, die Pause hält ihn
        T.bruchOffen = true;
    }

    // DER BRUCH (aus dem Haken des Tiefen-Abbilds in Bild/sicht, auf dem Encoder des Szenen-Passes nach dem Abbild-Pass und vor
    // seinem Wiederbeginn): die Pyramide DIESES Bilds, der späte Zug jedes Satzes gegen sie, die Kopien der Rücklesung. Der
    // Schirm der Lage ist der Schirm der Tiefe (`A.w`, `A.h`: Post-Kette, Direktpfad und TAAU-Skala gleich).
    _sichtTiefeBruch(enc, A) {
        const T = this._sichtTiefeZ;
        if (!T || !T.bruchOffen) return;
        T.bruchOffen = false;
        // die Leser der Szenen-Tiefe brechen hinter dem späten Zug noch einmal (Bild/sicht `_tiefenAbbild` "leser")
        A.spaet = T.auftraege.length > 0;
        const st = this.state;
        const rend = st.renderer;
        const be = rend.backend;
        const dev = be.device;
        const G = this._sichtTiefeGpu(dev);
        const L = T.lage;
        L.w = A.w;
        L.h = A.h;
        L.f = (L.p5 * A.h) / 2;
        this._sichtPyramideStufen(G, L);
        this._sichtLageSchreiben(G, L, dev);
        if (G.abbild !== A.ziel) {
            G.abbild = A.ziel;
            G.abbildAnsicht = A.ziel.createView();
            G.stufenGruppen = null;
        }
        if (!G.stufenGruppen)
            G.stufenGruppen = G.stufen.map((u) =>
                dev.createBindGroup({
                    layout: G.bauLayout,
                    entries: [
                        { binding: 0, resource: G.abbildAnsicht },
                        { binding: 1, resource: { buffer: G.pyramide } },
                        { binding: 2, resource: { buffer: u.puffer } },
                    ],
                })
            );
        const pass = enc.beginComputePass({ label: "sicht:spaet" });
        for (let k = 0; k < G.stufen.length; k++) {
            const u = G.stufen[k];
            pass.setPipeline(k === 0 ? G.stufe0 : G.stufe);
            pass.setBindGroup(0, G.stufenGruppen[k]);
            pass.dispatchWorkgroups(Math.ceil(u.zw / 8), Math.ceil(u.zh / 8));
        }
        for (const V of T.auftraege) {
            pass.setBindGroup(0, G.lageGruppe);
            pass.setBindGroup(1, V.spaet.gruppe);
            pass.setPipeline(G.pruefe);
            pass.dispatchWorkgroups(1);
            pass.setPipeline(G.kopiere);
            pass.dispatchWorkgroups(Math.max(1, Math.min(V.n, 65535)), Math.max(1, Math.ceil(V.n / 65535)));
        }
        pass.end();
        T.pyramideBild = T.bild;
        // DIE RÜCKLESUNG (angefordert im nächsten Haken): je Satz der frühe und der späte Auftrag, je Bündel sein Urteil
        const B = T.buendel;
        const groesse = T.auftraege.length * 64 + B.length * 4;
        if (groesse === 0) return;
        let rb = T.lesen.find((x) => !x.belegt && x.puffer.size >= groesse) || null;
        if (!rb) {
            if (T.lesen.length >= AnazhRealm.SICHT_TIEFE.lesePuffer) {
                T.zahl.leseVoll++;
                return;
            }
            rb = {
                puffer: dev.createBuffer({
                    label: "sicht:lesen",
                    size: Math.max(256, Math.ceil((groesse * 1.5) / 256) * 256),
                    usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
                }),
                belegt: false,
            };
            T.lesen.push(rb);
        }
        let o = 0;
        for (const V of T.auftraege) {
            enc.copyBufferToBuffer(be.get(V.auftrag).buffer, 0, rb.puffer, o, 32);
            enc.copyBufferToBuffer(be.get(V.spaet.auftrag).buffer, 0, rb.puffer, o + 32, 32);
            o += 64;
        }
        if (B.length > 0) enc.copyBufferToBuffer(G.urteil, 0, rb.puffer, o, B.length * 4);
        rb.belegt = true;
        T.offen = { rb, saetze: T.auftraege.slice(), buendel: B.slice(), lage: T.buendelLage };
    }

    // Die Rücklesung des letzten Bilds: die Dreiecke beider Züge (Buchung und Zahl), früh und spät gezeichnete und verdeckte
    // Haufen, je Bündel sein Urteil mit dem Auge des Bilds seiner Pyramide.
    _sichtLesen() {
        const T = this._sichtTiefeZ;
        const O = T.offen;
        if (!O) return;
        T.offen = null;
        const rb = O.rb;
        rb.puffer.mapAsync(GPUMapMode.READ).then(
            () => {
                const u = new Uint32Array(rb.puffer.getMappedRange());
                let o = 0;
                for (const V of O.saetze) {
                    V.tris = u[o] / 3;
                    V.spaet.tris = u[o + 8] / 3;
                    T.zahl.trisSicht += (u[o] + u[o + 8]) / 3;
                    T.zahl.frueh += u[o + 7];
                    T.zahl.spaet += u[o + 15];
                    T.zahl.verdeckt += u[o + 5] - u[o + 15];
                    o += 16;
                }
                const L = O.lage;
                for (let i = 0; i < O.buendel.length; i++) {
                    const v = !!(L && L.frisch) && u[o + i] === 1;
                    T.urteile.set(O.buendel[i], { verdeckt: v, auge: L ? L.auge : null, t: L ? L.t : 0 });
                    T.zahl.buendel++;
                    if (v) T.zahl.buendelVerdeckt++;
                }
                rb.puffer.unmap();
                rb.belegt = false;
            },
            () => {
                rb.belegt = false;
            }
        );
    }

    // Die Stufen der Pyramide für die Lage L (neu, wenn der Schirm wechselt): Stufe 0 = Blöcke von `blockPx` Pixeln, jede
    // weitere die Halbierung (aufgerundet) bis 1 × 1.
    _sichtPyramideStufen(G, L) {
        const B = AnazhRealm.SICHT_TIEFE.blockPx;
        const w0 = Math.ceil(L.w / B),
            h0 = Math.ceil(L.h / B);
        if (G.w0 === w0 && G.h0 === h0 && G.nah === L.nah && G.fern === L.fern && G.qw === Math.ceil(L.w / 2)) return;
        const dev = G.dev;
        for (const u of G.stufen) u.puffer.destroy();
        G.stufen = [];
        let off = 0,
            w = w0,
            h = h0;
        const tafel = new Uint32Array(64);
        for (let k = 0; ; k++) {
            if (k >= 16) throw new Error(`SICHT-TIEFE: ${L.w}×${L.h} trägt mehr als 16 Stufen`);
            const q = k === 0 ? { off: 0, zw: Math.ceil(L.w / 2), zh: L.h } : G.stufen[k - 1];
            const ab = new ArrayBuffer(32);
            const au = new Uint32Array(ab),
                af = new Float32Array(ab);
            au[0] = q.off;
            au[1] = off;
            au[2] = q.zw;
            au[3] = q.zh;
            au[4] = w;
            au[5] = h;
            af[6] = L.nah;
            af[7] = L.fern;
            const puffer = dev.createBuffer({
                label: "sicht:stufe" + k,
                size: 32,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
            dev.queue.writeBuffer(puffer, 0, ab);
            G.stufen.push({ puffer, off, zw: w, zh: h });
            tafel[k * 4] = off;
            tafel[k * 4 + 1] = w;
            tafel[k * 4 + 2] = h;
            off += w * h;
            if (w === 1 && h === 1) break;
            w = Math.ceil(w / 2);
            h = Math.ceil(h / 2);
        }
        if (G.pyramide.size < off * 8) {
            G.pyramide.destroy();
            G.pyramide = dev.createBuffer({ label: "sicht:pyramide", size: off * 8, usage: GPUBufferUsage.STORAGE });
            G.lageGruppe = dev.createBindGroup({
                layout: G.lageLayout,
                entries: [
                    { binding: 0, resource: { buffer: G.lage } },
                    { binding: 1, resource: { buffer: G.pyramide } },
                    { binding: 2, resource: { buffer: G.stufenTafel } },
                ],
            });
        }
        dev.queue.writeBuffer(G.stufenTafel, 0, tafel);
        G.n = G.stufen.length;
        G.w0 = w0;
        G.h0 = h0;
        G.qw = Math.ceil(L.w / 2);
        G.nah = L.nah;
        G.fern = L.fern;
        G.stufenGruppen = null;
    }

    // Die Lage des Bilds der Pyramide für das Gesetz (uniform): seine Projektion × Drehung, sein Auge, der Schirm, die Ränder.
    _sichtLageSchreiben(G, L, dev) {
        const ST = AnazhRealm.SICHT_TIEFE;
        const ab = new ArrayBuffer(128);
        const f = new Float32Array(ab),
            u = new Uint32Array(ab);
        f.set(L.m.elements, 0);
        f[16] = L.auge[0];
        f[17] = L.auge[1];
        f[18] = L.auge[2];
        f[20] = L.w;
        f[21] = L.h;
        f[22] = L.f;
        f[23] = L.nah;
        f[24] = ST.blockPx;
        f[25] = ST.randPx;
        f[26] = ST.epsM;
        f[27] = ST.epsRel;
        u[28] = G.n;
        dev.queue.writeBuffer(G.lage, 0, ab);
    }

    // Die Pipelines (einmal je Gerät; explizite Layouts — kein „auto", der Zensus und die Diät lesen jede Bindung).
    _sichtTiefeGpu(dev) {
        const T = this._sichtTiefeZ;
        if (T.gpu && T.gpu.dev === dev) return T.gpu;
        const W = AnazhRealm.SICHT_TIEFE_WGSL;
        const C = GPUShaderStage.COMPUTE;
        const puffer = (type) => ({ visibility: C, buffer: { type } });
        const lageLayout = dev.createBindGroupLayout({
            label: "sicht:lage",
            entries: [
                { binding: 0, ...puffer("uniform") },
                { binding: 1, ...puffer("read-only-storage") },
                { binding: 2, ...puffer("uniform") },
            ],
        });
        const satzLayout = dev.createBindGroupLayout({
            label: "sicht:satz",
            entries: [
                { binding: 0, ...puffer("read-only-storage") },
                { binding: 1, ...puffer("storage") },
                { binding: 2, ...puffer("storage") },
                { binding: 3, ...puffer("uniform") },
                { binding: 4, ...puffer("read-only-storage") },
                { binding: 5, ...puffer("storage") },
                { binding: 6, ...puffer("read-only-storage") },
            ],
        });
        const buendelLayout = dev.createBindGroupLayout({
            label: "sicht:buendel",
            entries: [
                { binding: 0, ...puffer("read-only-storage") },
                { binding: 1, ...puffer("storage") },
                { binding: 2, ...puffer("uniform") },
            ],
        });
        const bauLayout = dev.createBindGroupLayout({
            label: "sicht:bau",
            entries: [
                { binding: 0, visibility: C, texture: { sampleType: "unfilterable-float" } },
                { binding: 1, ...puffer("storage") },
                { binding: 2, ...puffer("uniform") },
            ],
        });
        const pipe = (label, code, eintritt, layouts) =>
            dev.createComputePipeline({
                label,
                layout: dev.createPipelineLayout({ label, bindGroupLayouts: layouts }),
                compute: { module: dev.createShaderModule({ label, code }), entryPoint: eintritt },
            });
        const satzCode = W.gesetz + W.satz;
        const buendelCode = W.gesetz + W.buendel;
        const G = {
            dev,
            lageLayout,
            satzLayout,
            buendelLayout,
            bauLayout,
            stufe0: pipe("sicht:stufe0", W.bau, "stufe0", [bauLayout]),
            stufe: pipe("sicht:stufe", W.bau, "stufe", [bauLayout]),
            pruefe: pipe("sicht:pruefe", satzCode, "pruefe", [lageLayout, satzLayout]),
            kopiere: pipe("sicht:kopiere", satzCode, "kopiere", [lageLayout, satzLayout]),
            buendel: pipe("sicht:buendel", buendelCode, "buendel", [lageLayout, buendelLayout]),
            lage: dev.createBuffer({
                label: "sicht:lage",
                size: 128,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            }),
            stufenTafel: dev.createBuffer({
                label: "sicht:stufen",
                size: 256,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            }),
            buendelUni: dev.createBuffer({
                label: "sicht:buendel",
                size: 16,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            }),
            // die Attrappe der Bindung 6 im frühen Zug (er liest kein frühes Ziel)
            leer: dev.createBuffer({ label: "sicht:leer", size: 16, usage: GPUBufferUsage.STORAGE }),
            // vor der ersten Pyramide prüft jeder Auftrag mit „alle sichtbar" — die Bindung braucht trotzdem eine
            pyramide: dev.createBuffer({ label: "sicht:pyramide", size: 8, usage: GPUBufferUsage.STORAGE }),
            lageGruppe: null,
            stufen: [],
            stufenGruppen: null,
            n: 0,
        };
        G.lageGruppe = dev.createBindGroup({
            layout: lageLayout,
            entries: [
                { binding: 0, resource: { buffer: G.lage } },
                { binding: 1, resource: { buffer: G.pyramide } },
                { binding: 2, resource: { buffer: G.stufenTafel } },
            ],
        });
        T.gpu = G;
        return G;
    }

    // DAS URTEIL EINES BÜNDELS im Frame-Cull: verdeckt, solange sein letztes Urteil gilt — das Auge blieb seit dem Bild der
    // Pyramide samt bewegtem Verdecker im Weg `buendelM`, gegen den es geprüft wurde.
    _sichtBuendelVerdeckt(bg) {
        const T = this._sichtTiefeZ;
        if (!T) return false;
        const u = T.urteile.get(bg);
        if (!u || !u.verdeckt || !u.auge) return false;
        const cam = this.state.camera;
        if (!cam) return false;
        const e = cam.matrixWorld.elements;
        const ST = AnazhRealm.SICHT_TIEFE;
        const weg =
            Math.hypot(e[12] - u.auge[0], e[13] - u.auge[1], e[14] - u.auge[2]) +
            ST.bewegtMs * Math.max(0, this.state.spielZeit - u.t);
        return weg <= ST.buendelM;
    }

    // Die Zahlen der Sicht (Flugschreiber, Linse): Bilder, Bilder ohne Pyramide, Bilder ohne Bruch, geprüfte Haufen, früh und
    // spät gezeichnete, verdeckte, Dreiecke des Satzes und der Züge (zurückgelesen), Bündel-Urteile.
    _sichtTiefeZahl() {
        const T = this._sichtTiefeZ;
        return T ? Object.assign({}, T.zahl) : null;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_bild_tiefe]);

// ===== ATLAS · Bild/tiefe — Außen-Konstanten =====
// DIE SICHT DER EINHEIT (E7): `haufen` Dreiecke je Haufen (Index-Folge) · `blockPx` Pixel je Block der Stufe 0 · `randPx` der
// Rand für Rundung und den Versatz der zeitlichen Auflösung · `bewegtMs` der schnellste bewegte Verdecker (m/s — der Wagen
// auf der Trasse) · `buendelM` der Weg, gegen den ein Bündel geprüft wird und in dem sein Urteil gilt · `randM` die Kiste
// eines Haufens über seine Ecken · `epsM`/`epsRel` die Tiefen-Marge (die Fläche, die die Kiste berührt, verdeckt sie nie
// selbst) · `lesePuffer` die Rücklese-Puffer im Flug · `ordnung` die Zeichen-Ordnung des späten Zugs (nach allen opaken
// Körpern, vor dem Feld-Pass 9998 — der Auslöser eine halbe Stelle davor).
AnazhRealm.SICHT_TIEFE = Object.freeze({
    haufen: 128,
    blockPx: 4,
    randPx: 2,
    bewegtMs: 15,
    buendelM: 4,
    randM: 0.02,
    epsM: 0.1,
    epsRel: 0.002,
    lesePuffer: 4,
    ordnung: 9997,
});

// DAS GESETZ in WGSL: `gesetz` (Lage, Pyramide, `bereich`, `verdeckt`) — von Satz und Bündel geteilt; `bau` baut die Pyramide.
AnazhRealm.SICHT_TIEFE_WGSL = Object.freeze({
    gesetz: `
struct Lage { m: mat4x4f, auge: vec4f, schirm: vec4f, rand: vec4f, n: vec4u };
@group(0) @binding(0) var<uniform> L: Lage;
@group(0) @binding(1) var<storage, read> P: array<vec2f>;
@group(0) @binding(2) var<uniform> S: array<vec4u, 16>;

fn lese(k: u32, x: i32, y: i32) -> vec2f {
    let s = S[k];
    let xx = u32(clamp(x, 0, i32(s.y) - 1));
    let yy = u32(clamp(y, 0, i32(s.z) - 1));
    return P[s.x + yy * s.y + xx];
}

// fernste (x) und nächste (y) lineare Tiefe über das Rechteck [a, b] in Blöcken der Stufe 0
fn bereich(a: vec2i, b: vec2i) -> vec2f {
    let n = L.n.x;
    var k = 0u;
    loop {
        if (k + 1u >= n) { break; }
        let a2 = a >> vec2u(k);
        let b2 = b >> vec2u(k);
        if (b2.x - a2.x <= 1 && b2.y - a2.y <= 1) { break; }
        k = k + 1u;
    }
    let a2 = a >> vec2u(k);
    let b2 = b >> vec2u(k);
    var r = vec2f(0.0, 3.4e38);
    for (var y = a2.y; y <= b2.y; y = y + 1) {
        for (var x = a2.x; x <= b2.x; x = x + 1) {
            let v = lese(k, x, y);
            r = vec2f(max(r.x, v.x), min(r.y, v.y));
        }
    }
    return r;
}

fn verdeckt(lo: vec3f, hi: vec3f, weg: f32, schirm: bool) -> bool {
    let nah = L.schirm.w;
    let W = L.schirm.xy;
    var zmin = 3.4e38;
    var r0 = vec2f(3.4e38);
    var r1 = vec2f(-3.4e38);
    for (var i = 0u; i < 8u; i = i + 1u) {
        let c = vec3f(select(lo.x, hi.x, (i & 1u) != 0u), select(lo.y, hi.y, (i & 2u) != 0u), select(lo.z, hi.z, (i & 4u) != 0u)) - L.auge.xyz;
        let p = L.m * vec4f(c, 1.0);
        if (p.w <= nah) { return false; }
        let s = vec2f(p.x / p.w * 0.5 + 0.5, 0.5 - p.y / p.w * 0.5) * W;
        r0 = min(r0, s);
        r1 = max(r1, s);
        zmin = min(zmin, p.w);
    }
    let B = L.rand.x;
    var m = L.rand.y;
    for (var it = 0u; it < 4u; it = it + 1u) {
        // jenseits des Schirms trägt kein Pixel: ganz außerhalb verdeckt, am Rand zählt nur der Teil im Schirm
        let a0 = r0 - vec2f(m);
        let b0 = r1 + vec2f(m);
        let innen = a0.x >= 0.0 && a0.y >= 0.0 && b0.x < W.x && b0.y < W.y;
        if (!schirm && !innen) { return false; }
        if (b0.x < 0.0 || b0.y < 0.0 || a0.x >= W.x || a0.y >= W.y) { return true; }
        let a = max(a0, vec2f(0.0));
        let b = min(b0, W - vec2f(1.0));
        let t = bereich(vec2i(a / B), vec2i(b / B));
        let m2 = L.rand.y + L.schirm.z * weg / max(t.y, nah);
        if (m2 <= m) { return zmin > t.x + L.rand.z + L.rand.w * t.x; }
        m = m2;
    }
    return false;
}
`,
    satz: `
struct Haufen { lo: vec3f, start: u32, hi: vec3f, n: u32 };
struct Auftrag { n: u32, alle: u32, weg: f32, spaet: u32 };
@group(1) @binding(0) var<storage, read> H: array<Haufen>;
@group(1) @binding(1) var<storage, read_write> Z: array<u32>;
@group(1) @binding(2) var<storage, read_write> A: array<u32>;
@group(1) @binding(3) var<uniform> J: Auftrag;
@group(1) @binding(4) var<storage, read> Q: array<u32>;
@group(1) @binding(5) var<storage, read_write> O: array<u32>;
@group(1) @binding(6) var<storage, read> F: array<u32>;

var<workgroup> summe: array<u32, 256>;

// Prüfen und Summe (EINE Gruppe je Satz): je Haufen sein Platz im Sicht-Index (exklusives Präfix) oder 0xffffffff. Früh: gegen
// die Pyramide des letzten Bilds mit dem Weg (oder alle sichtbar); spät: nur, was früh verdeckt war (F), gegen die Pyramide
// dieses Bilds. A: der Auftrag (indexCount, 1, 0, 0, 0), dann die nicht gezeichneten Haufen, die Zahl, die gezeichneten.
@compute @workgroup_size(256)
fn pruefe(@builtin(local_invocation_index) l: u32) {
    var basis = 0u;
    var gezeigt = 0u;
    for (var b = 0u; b < J.n; b = b + 256u) {
        let i = b + l;
        var c = 0u;
        if (i < J.n) {
            let h = H[i];
            var zeigt = false;
            if (J.spaet != 0u) {
                zeigt = F[i] == 0xffffffffu && !verdeckt(h.lo, h.hi, 0.0, true);
            } else {
                zeigt = J.alle != 0u || !verdeckt(h.lo, h.hi, J.weg, true);
            }
            if (zeigt) { c = h.n; gezeigt = gezeigt + 1u; }
        }
        summe[l] = c;
        workgroupBarrier();
        for (var o = 1u; o < 256u; o = o << 1u) {
            var v = 0u;
            if (l >= o) { v = summe[l - o]; }
            workgroupBarrier();
            summe[l] = summe[l] + v;
            workgroupBarrier();
        }
        if (i < J.n) { Z[i] = select(0xffffffffu, basis + summe[l] - c, c > 0u); }
        basis = basis + summe[255];
        workgroupBarrier();
    }
    summe[l] = gezeigt;
    workgroupBarrier();
    for (var o = 128u; o > 0u; o = o >> 1u) {
        if (l < o) { summe[l] = summe[l] + summe[l + o]; }
        workgroupBarrier();
    }
    if (l == 0u) {
        A[0] = basis; A[1] = 1u; A[2] = 0u; A[3] = 0u; A[4] = 0u;
        A[5] = J.n - summe[0]; A[6] = J.n; A[7] = summe[0];
    }
}

// Die Kopie: je Haufen eine Gruppe, die sichtbaren legen ihre Indizes an ihren Platz
@compute @workgroup_size(128)
fn kopiere(@builtin(workgroup_id) w: vec3u, @builtin(num_workgroups) nw: vec3u, @builtin(local_invocation_index) l: u32) {
    let i = w.x + w.y * nw.x;
    if (i >= J.n) { return; }
    let o = Z[i];
    if (o == 0xffffffffu) { return; }
    let h = H[i];
    for (var j = l; j < h.n; j = j + 128u) { O[o + j] = Q[h.start + j]; }
}
`,
    buendel: `
struct Kiste { lo: vec4f, hi: vec4f };
struct Auftrag { n: u32, alle: u32, weg: f32, frei: u32 };
@group(1) @binding(0) var<storage, read> K: array<Kiste>;
@group(1) @binding(1) var<storage, read_write> U: array<u32>;
@group(1) @binding(2) var<uniform> J: Auftrag;

@compute @workgroup_size(64)
fn buendel(@builtin(global_invocation_id) g: vec3u) {
    let i = g.x;
    if (i >= J.n) { return; }
    let k = K[i];
    U[i] = select(0u, 1u, J.alle == 0u && verdeckt(k.lo.xyz, k.hi.xyz, J.weg, false));
}
`,
    bau: `
struct Stufe { quelle: u32, ziel: u32, qw: u32, qh: u32, zw: u32, zh: u32, nah: f32, fern: f32 };
@group(0) @binding(0) var abbild: texture_2d<f32>;
@group(0) @binding(1) var<storage, read_write> P: array<vec2f>;
@group(0) @binding(2) var<uniform> U: Stufe;

fn linear(d: f32) -> f32 { return U.nah * U.fern / (U.fern - d * (U.fern - U.nah)); }

// Stufe 0: ein Block von 4 × 4 Pixeln = 2 × 4 Texel des Abbilds (je Texel das fernste Paar)
@compute @workgroup_size(8, 8)
fn stufe0(@builtin(global_invocation_id) g: vec3u) {
    if (g.x >= U.zw || g.y >= U.zh) { return; }
    var mx = 0.0;
    var mn = 3.4e38;
    let qx = i32(g.x) * 2;
    let qy = i32(g.y) * 4;
    for (var y = 0; y < 4; y = y + 1) {
        for (var x = 0; x < 2; x = x + 1) {
            let d = textureLoad(abbild, vec2i(min(qx + x, i32(U.qw) - 1), min(qy + y, i32(U.qh) - 1)), 0).x;
            let z = linear(d);
            mx = max(mx, z);
            mn = min(mn, z);
        }
    }
    P[U.ziel + g.y * U.zw + g.x] = vec2f(mx, mn);
}

@compute @workgroup_size(8, 8)
fn stufe(@builtin(global_invocation_id) g: vec3u) {
    if (g.x >= U.zw || g.y >= U.zh) { return; }
    var mx = 0.0;
    var mn = 3.4e38;
    for (var y = 0u; y < 2u; y = y + 1u) {
        for (var x = 0u; x < 2u; x = x + 1u) {
            let v = P[U.quelle + min(g.y * 2u + y, U.qh - 1u) * U.qw + min(g.x * 2u + x, U.qw - 1u)];
            mx = max(mx, v.x);
            mn = min(mn, v.y);
        }
    }
    P[U.ziel + g.y * U.zw + g.x] = vec2f(mx, mn);
}
`,
});
