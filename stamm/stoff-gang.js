class AnazhRealm_stoff_gang {
    // ===== ATLAS · Stoff/gang — Der Gang-Satz: je Gestalt EIN Knochen-Puffer · Pose · Ecken · Instanz-Gang · die Hülle der Wahl (Bewohner und Tiere) =====
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
            m.__wahlGpu = this._instanzWahlArt({ geom: geo }, !!sk.wurf, false) === "gpu";
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
        satz.kugeln = AnazhRealm._gangSatzKugeln(satz);
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
        if (satz.kugeln) AnazhRealm._gangSatzHuelle(satz, zeile);
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

    // DER KNOTEN DES GANGS (Lehre 22: r184 rechnet den positionNode VOR der Instanz-Matrix — die Vorlage ist der Raum des
    // Leibs): je Ecke ihre vier Knochen, je Knochen die Matrix zwischen den zwei Phasen um die Phase der Instanz in ihrem Band,
    // gemischt mit dem Stand nach dem Gewicht des Gangs, an die Vorlage der Ecke; die Normale ebenso — sie geht als
    // normalLocal in die Instanz-Normale. Die Mischung ist linear in der Matrix, also dieselbe wie zwischen den Lagen.
    static _gangSatzKnoten(tex, n, baender) {
        const T = THREE.TSL;
        return T.Fn(() => {
            const a = AnazhRealm._senkenKnoten().gang; // der Gang der Instanz (in der Wahl der GPU am Index ihrer Liste)
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

    // DIE HÜLLE DES GANGS (die Kugel der Wahl einer Gestalt im Satz, `_gangSatz`): die Kugel jeder Senke maß der Stand — jede
    // gebackene Zeile des Knochen-Puffers (`_gangSatzPose`) weitet sie um das Bild der Kugel jedes Knochen-Platzes (`kugeln`:
    // die Ecken, die er trägt, im Raum ihrer Bindung; ihr Bild liegt höchstens die größte Streckung der Zeile mal den Radius
    // neben dem Bild der Mitte). Jede Ecke einer Zeile mischt solche Bilder, der Knoten mischt die Zeilen: die Kugel deckt jede
    // Pose des Gangs, nicht nur den Stand.
    static _gangSatzKugeln(satz) {
        const K = new Float64Array(satz.J * 4),
            B = new Float64Array(satz.J * 6).fill(Infinity),
            v = [0, 0, 0];
        for (let gang = 0; gang < 2; gang++)
            for (const q of satz.quellen) {
                const a = q.m.geometry.attributes;
                for (let i = 0; i < a.position.count; i++) {
                    v[0] = a.position.getX(i);
                    v[1] = a.position.getY(i);
                    v[2] = a.position.getZ(i);
                    for (let c = 0; c < 4; c++) {
                        if (!(a.skinWeight.getComponent(i, c) > 0)) continue;
                        const p = q.platz[a.skinIndex.getComponent(i, c)] * 4;
                        if (gang)
                            K[p + 3] = Math.max(K[p + 3], Math.hypot(v[0] - K[p], v[1] - K[p + 1], v[2] - K[p + 2]));
                        else
                            for (let k = 0; k < 3; k++) {
                                B[p * 1.5 + k] = Math.min(B[p * 1.5 + k], v[k]);
                                B[p * 1.5 + 3 + k] = Math.min(B[p * 1.5 + 3 + k], -v[k]);
                                K[p + k] = (B[p * 1.5 + k] - B[p * 1.5 + 3 + k]) / 2;
                            }
                    }
                }
            }
        return K;
    }
    static _gangSatzHuelle(satz, zeile) {
        const D = satz.tex.image.data,
            K = satz.kugeln;
        for (const geo of satz.geos) {
            const s = geo.boundingSphere,
                c = [s.center.x, s.center.y, s.center.z];
            for (let p = 0; p < satz.J; p++) {
                const o = (zeile * satz.J + p) * 12;
                let d2 = 0,
                    st = 0;
                for (let r = 0; r < 3; r++) {
                    const b = o + r * 4,
                        w = D[b] * K[p * 4] + D[b + 1] * K[p * 4 + 1] + D[b + 2] * K[p * 4 + 2] + D[b + 3] - c[r];
                    d2 += w * w;
                    st = Math.max(st, D[o + r] ** 2 + D[o + 4 + r] ** 2 + D[o + 8 + r] ** 2); // die Spalte r der Zeile
                }
                s.radius = Math.max(s.radius, Math.sqrt(d2) + Math.sqrt(st) * K[p * 4 + 3]);
            }
        }
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_stoff_gang]);
