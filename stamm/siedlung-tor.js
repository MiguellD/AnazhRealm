class AnazhRealm_siedlung_tor {
    // ===== ATLAS · Siedlung/tor — Tore und Membranen · das Bild des Ziels im Tor (Atlas rgb9e5) · Portal-Licht · Tor-Flügel =====
    // ═══ DIE WELT-MEMBRAN: die Portal-PASSAGE in der Hauptwelt ═══
    // Liest DASSELBE Gesetz wie das Lab (porta-core MEMBRAN_GESETZ + membranUniforms + membranPalette) als
    // TSL-Material — Technik ist Leser-Sache, die ZAHLEN sind EINE Quelle (diag-membran-gesetz). Bogen-
    // Beschnitt faltet in die Alpha statt discard. Aktivierung = Spieler-Nähe (aktivDepth/finalK);
    // Durchqueren der Membran-Ebene = BETRETEN (derselbe enterPortal-Chokepoint wie die E-Taste).

    // Die geteilte Membran-Geometrie je Gestalt und Stempel (Plane spanW×height, Gesetz-seg; der Schlüssel des Tor-Gesetzes).
    // DIE HÜLLE UM DIE WELLE (0910-4, Spike der Prüf-Welt 10.10.): die Membran trug `frustumCulled = false` („Wellen-
    // Verformung sprengt die statische Hülle") und zeichnete am Genesis-Ring 8 Befehle und 129 600 Dreiecke auch mit dem
    // Ring im Rücken. Die Welle (`positionNode = (x, y, d0)`) verschiebt jede Ecke NUR in z, und |d0| ≤ der Amplitude des
    // Gesetzes (`_membranAmplitude`): die Hülle trägt sie, das Culling bleibt an. Die Notfall-Fläche liegt in z = 0, also darin.
    _membranGeometryFor(tor) {
        if (!this._membranGeoMemo) this._membranGeoMemo = new Map();
        let geo = this._membranGeoMemo.get(tor.key);
        if (!geo) {
            const mu = tor.mu;
            const seg = tor.gesetz.seg;
            geo = new THREE.PlaneGeometry(mu.spanW, mu.height, seg, seg);
            geo.translate(0, mu.midY, 0);
            const a = AnazhRealm._membranAmplitude(tor);
            geo.computeBoundingBox();
            geo.boundingBox.min.z = -a;
            geo.boundingBox.max.z = a;
            geo.boundingSphere = geo.boundingBox.getBoundingSphere(new THREE.Sphere());
            this._membranGeoMemo.set(tor.key, geo);
        }
        return geo;
    }

    // Die größte Auslenkung der Membran-Welle (Gesetz porta-core MEMBRAN_GESETZ): h ist auf ±1 geklemmt, die Tiefe
    // `uWaveDepth` atmet im Membran-Tick bis zFace · (aktivDepth[0] + aktivDepth[1]) (act ≤ 1; der Start-Wert waveDepth
    // liegt darunter oder ist das Minimum), der Shader multipliziert (waveDepthK[0] + waveDepthK[1] · wave).
    static _membranAmplitude(tor) {
        const MG = tor.gesetz;
        const MU = tor.mu;
        const tiefe = Math.max(MU.waveDepth, MU.zFace * (MG.aktivDepth[0] + MG.aktivDepth[1]));
        return tiefe * (MG.waveDepthK[0] + MG.waveDepthK[1] * MU.wave);
    }

    // TSL-Port des Shell-Shaders (Formel-Referenz: worlds/portale/porta.js buildMembrane); Konstanten aus
    // MEMBRAN_GESETZ/membranUniforms. Liefert { mat, u } mit vier Atem-Werten je Tor: time · act · pulse · waveDepth
    // (`u.x.value`, der Membran-Tick schreibt sie); das Auge liest der Graph selbst (`_membranGraph`). DIE GESTALT IST EIN STOFF-WERT (1310-18): die Maße, Fenster und Farben des Tors stehen in
    // `userData.tor` seines Stoffs und reisen als Uniform je Objekt (`_stoffWert`); der Graph entsteht EINMAL je Gesetz
    // (`_membranGraph`) — jedes Tor zeichnet mit DEMSELBEN Programm. Bis dahin faltete der Bau sie als Konstanten ein: je Tor
    // ein Programm, 59–504 ms Knoten-Bau auf dem Haupt-Faden (1310-17: 5 Membranen, 1,01 s). D8: `ziel` ist die Zeile des Ziels im
    // Atlas der Ziele (`_torZielZeile`), `dreh` die Drehung des Tors (der Spiegel des Films liest den Himmel in der Welt).
    _membranMaterialFor(tor, ziel, dreh) {
        const T = THREE;
        const MG = tor.gesetz;
        const MU = tor.mu;
        const u = {
            time: { value: 0 },
            act: { value: 0 },
            pulse: { value: 1 },
            waveDepth: { value: MU.waveDepth },
        };
        const P = MU.pal;
        const mat = new T.MeshBasicNodeMaterial({ side: T.DoubleSide });
        mat.userData.tor = {
            u,
            a: new T.Vector4(MU.centerY, MU.rimAx, MU.rimAy, MU.swirl),
            b: new T.Vector4(MU.wave, MU.left, MU.spanW, MU.baseY),
            c: new T.Vector4(MU.height, MU.tiefe, MU.fraktal, MU.drall),
            spiegel: MU.spiegel,
            zeile: this._torProfilZeile(MG.profilW, MU.profil),
            ziel,
            dreh: Number.isFinite(dreh) ? dreh : 0,
            pa: new T.Vector3(P.PA[0], P.PA[1], P.PA[2]),
            pb: new T.Vector3(P.PB[0], P.PB[1], P.PB[2]),
            pc: new T.Vector3(P.PC[0], P.PC[1], P.PC[2]),
            pd: new T.Vector3(P.PD[0], P.PD[1], P.PD[2]),
        };
        const G = this._membranGraph(MG);
        mat.positionNode = G.positionNode;
        mat.colorNode = G.colorNode;
        mat.opacityNode = G.opacityNode;
        mat.alphaTest = 0.5;
        mat.transparent = false;
        mat.userData.portalMembran = true; // Linsen-Marker
        return { mat, u };
    }

    // DER BOGEN-ATLAS DER TORE (1310-18): jede Bogen-Oberkante (die 64er-Gesetz-Tabelle `mu.profil` der Gestalt, dieselbe wie die
    // Shell) ist EINE Zeile EINER Textur — jede Membran liest ihre Zeile (Stoff-Wert `zeile`) mit demselben Knoten, statt eine
    // eigene Textur in ihr Programm zu binden. Gleiche Tabelle, gleiche Zeile. Gelesen wird exakt auf der Texel-Mitte der Zeile:
    // die lineare Filterung mischt nur waagrecht, wie zuvor die Textur je Tor. Ist der Atlas voll, wächst er auf das Doppelte
    // IN seiner Textur (die neue GPU-Form legt `_texturAbschied` an), die Höhe ist eine geteilte Uniform.
    _torProfilZeile(W, profil) {
        const TSL = THREE.TSL;
        const A =
            this._torProfile ||
            (this._torProfile = {
                zeilen: new Map(),
                n: 0,
                hoch: 0,
                breit: W,
                tex: null,
                uHoch: TSL.uniform(1),
            });
        if (W !== A.breit)
            throw this._stoffBruch("der Bogen-Atlas der Tore", new Error(`Tabellen-Breite ${W} ≠ ${A.breit}`));
        const bytes = profil.map((x) => Math.round(x * 255));
        const k = bytes.join(",");
        const da = A.zeilen.get(k);
        if (da !== undefined) return da;
        if (A.n >= A.hoch) {
            const hoch = Math.max(16, A.hoch * 2);
            const data = new Uint8Array(W * hoch * 4);
            if (A.tex) {
                data.set(A.tex.image.data);
                A.tex.image = { data, width: W, height: hoch };
            } else {
                A.tex = new THREE.DataTexture(data, W, hoch, THREE.RGBAFormat);
                A.tex.name = "portal-membran";
                A.tex.minFilter = THREE.LinearFilter;
                A.tex.magFilter = THREE.LinearFilter;
            }
            A.hoch = hoch;
            A.uHoch.value = hoch;
        }
        const d = A.tex.image.data;
        for (let i = 0; i < W; i++) {
            const o = (A.n * W + i) * 4;
            d[o] = d[o + 1] = d[o + 2] = bytes[i];
            d[o + 3] = 255;
        }
        A.tex.needsUpdate = true;
        A.zeilen.set(k, A.n);
        return A.n++;
    }

    // DER EINE MEMBRAN-GRAPH JE GESETZ — D8 (das Tor als Fenster): die Öffnung ist EIN Parallaxen-Zugriff auf das Panorama der
    // Ziel-Welt (ihre Zeile im Atlas der Ziele, `_torZielZeile`: der EINE Export der Welt je SHA, Equirekt rgba16float) über einer
    // Stellvertreter-Kugel um die Tor-Mitte (Lagarde & Zanuttini 2012: der Strahl trifft die Kugel, die Richtung von der Mitte
    // zum Treffer liest das Panorama), darüber der Seifenfilm (Dünnschicht-Interferenz: die Filmdicke aus dem Bogen-Radius und
    // der Welle, die Bänder aus `membranPalette`, Gewicht Fresnel + Rand). Der 12-Schritt-March und der Nebel-Kasten fallen.
    // Die Welle bleibt (positionNode); ihre Normale rechnet der Vertex (wie die Shell), das Fragment liest sie interpoliert.
    _membranGraph(MG) {
        if (!this._membranGraphen) this._membranGraphen = new WeakMap();
        const da = this._membranGraphen.get(MG);
        if (da) return da;
        const TSL = THREE.TSL;
        const W = (p, typ) => this._stoffWert(TSL, "userData.tor." + p, typ);
        const time = W("u.time.value");
        // DAS AUGE IM RAHMEN DES TORS: die Kamera des Renders, in die Geometrie des Tors zurückgerechnet (die Parallaxe rechnet
        // im Lab-Rahmen) — der Graph liest sie selbst, je Render. Vorher schrieb der Membran-Tick sie als Stoff-Wert aus der
        // Spieler-Kamera: jeder Render ohne Tick davor (der Schuss der Linse, ein Render vor dem Kamera-Folgen) las ein fremdes
        // Auge — die Treue des L1-Schusses sprang mit dem letzten Takt (r 0,23–0,46), seither 0,62 stabil, ein Prüf-Muster im
        // Atlas 0,92 (Radeon, 15.10.).
        const camL = TSL.modelWorldMatrixInverse.mul(TSL.vec4(TSL.cameraPosition, 1.0)).xyz;
        const act = W("u.act.value");
        const pulse = W("u.pulse.value");
        const waveDepth = W("u.waveDepth.value");
        const ga = W("a", "vec4"); // centerY · rimAx · rimAy · swirl
        const gb = W("b", "vec4"); // wave · left · spanW · baseY
        const gc = W("c", "vec4"); // height · tiefe · fraktal · drall (die Regler der Passage im Gesetz, studios.K1)
        const spiegelK = W("spiegel");
        const zeile = W("zeile");
        const zielZeile = W("ziel");
        const dreh = W("dreh");
        const vPA = W("pa", "vec3");
        const vPB = W("pb", "vec3");
        const vPC = W("pc", "vec3");
        const vPD = W("pd", "vec3");
        const F = (x) => TSL.float(x);
        const hash2 = TSL.Fn(([q]) => {
            const p = TSL.fract(q.mul(TSL.vec2(123.34, 345.45)));
            const p2 = p.add(TSL.dot(p, p.add(F(34.345))));
            return TSL.fract(p2.x.mul(p2.y));
        });
        const vn2 = TSL.Fn(([q]) => {
            const i = TSL.floor(q);
            const f0 = TSL.fract(q);
            const f = f0.mul(f0).mul(F(3.0).sub(f0.mul(2.0)));
            return TSL.mix(
                TSL.mix(hash2(i), hash2(i.add(TSL.vec2(1.0, 0.0))), f.x),
                TSL.mix(hash2(i.add(TSL.vec2(0.0, 1.0))), hash2(i.add(TSL.vec2(1.0, 1.0))), f.x),
                f.y
            );
        });
        const fbmN = (q, okt) => {
            let s = F(0.0);
            let p = q;
            let a = 0.5;
            for (let o = 0; o < okt; o++) {
                s = s.add(vn2(p).mul(a));
                p = p.mul(2.05).add(1.3);
                a *= 0.5;
            }
            return s;
        };
        // ── Hfull(q): die stehende Welle (Vertex-Verformung, Shell-verbatim) ──
        const centerXY = TSL.vec2(0.0, ga.x);
        const Hfull = (q) => {
            const c = q.sub(centerXY);
            const r = TSL.length(c);
            const a = TSL.atan(c.y, c.x);
            const t = time;
            const Rb = F(1.0).div(
                TSL.sqrt(
                    TSL.pow(TSL.cos(a).div(ga.y), F(2.0))
                        .add(TSL.pow(TSL.sin(a).div(ga.z), F(2.0)))
                        .add(F(1e-4))
                )
            );
            const rr = TSL.clamp(r.div(Rb), F(0.0), F(1.4));
            const twist = a
                .mul(F(MG.twistK))
                .mul(gc.w)
                .add(ga.w.div(r.add(F(MG.swirlR0))));
            const om = t.mul(F(MG.om));
            const outw = TSL.sin(rr.mul(F(MG.kk)).sub(om).add(twist));
            const refl = TSL.sin(F(2.0).sub(rr).mul(F(MG.kk)).sub(om).add(twist));
            const wave = outw.add(refl.mul(F(MG.refl))).mul(TSL.exp(rr.negate().mul(F(MG.damp))));
            const pierce = TSL.sin(t.mul(F(MG.pierce[0])))
                .mul(TSL.exp(rr.mul(rr).negate().mul(F(MG.pierce[1]))))
                .mul(F(MG.pierce[2]));
            const micro = fbmN(c.mul(F(MG.micro[0])).sub(TSL.vec2(t.mul(F(MG.micro[1])), t.mul(F(MG.micro[1])))), 3)
                .mul(F(MG.micro[2]))
                .mul(gc.z);
            const h = TSL.clamp(wave.mul(F(MG.hGain[0])).add(pierce).add(micro).mul(F(MG.hGain[1])), F(-1.0), F(1.0));
            return h.mul(waveDepth).mul(F(MG.waveDepthK[0]).add(gb.x.mul(F(MG.waveDepthK[1]))));
        };
        const xy = TSL.positionGeometry.xy;
        const d0 = Hfull(xy);
        const positionNode = TSL.vec3(xy.x, xy.y, d0);
        // Normale und Auslenkung im VERTEX (die Shell-Differenzen je Ecke), interpoliert gelesen
        const e = MG.eps;
        const dxx = Hfull(xy.add(TSL.vec2(e, 0.0)));
        const dyy = Hfull(xy.add(TSL.vec2(0.0, e)));
        const nrmV = TSL.varying(
            TSL.normalize(TSL.cross(TSL.vec3(e, 0.0, dxx.sub(d0)), TSL.vec3(0.0, e, dyy.sub(d0)))),
            "vTorNormale"
        );
        const d0V = TSL.varying(d0, "vTorWelle");
        // ── Fragment: Beschnitt (Alpha-Fold) aus der Zeile des Bogen-Atlas ──
        const uu = TSL.clamp(xy.x.sub(gb.y).div(gb.z), F(0.0), F(1.0));
        const A = this._torProfile;
        const profil = TSL.texture(A.tex, TSL.vec2(uu, zeile.add(0.5).div(A.uHoch)));
        const topY = gb.w.add(profil.r.mul(gc.x));
        const keep = TSL.step(xy.y, topY.add(F(0.002)));
        const vLocal = TSL.vec3(xy.x, xy.y, d0V);
        const Vd = TSL.normalize(camL.sub(vLocal));
        const rd = Vd.negate();
        const N0 = TSL.normalize(nrmV);
        const N = N0.mul(TSL.step(F(0.0), TSL.dot(N0, Vd)).mul(2.0).sub(1.0)); // dem Auge zugewandt (beidseitig)
        // ── DIE PARALLAXE: der Strahl trifft die Stellvertreter-Kugel (Radius = Tor-Höhe × FI.kugel) um die Tor-Mitte ──
        // Die Zahlen des Films liest der Graph im Gesetz (`MEMBRAN_GESETZ.film`, porta-core) — dieselben wie das Labor.
        const FI = MG.film;
        const center3 = TSL.vec3(0.0, ga.x, 0.0);
        const R = gc.x.mul(FI.kugel).mul(gc.y);
        const oc = vLocal.sub(center3);
        const bq = TSL.dot(oc, rd);
        const cq = TSL.dot(oc, oc).sub(R.mul(R));
        const tq = bq.negate().add(TSL.sqrt(TSL.max(bq.mul(bq).sub(cq), F(0.0))));
        // die Welle bricht den Blick ein wenig (die Film-Normale verschiebt die Richtung)
        const dir = TSL.normalize(
            oc
                .add(rd.mul(tq))
                .div(R)
                .sub(TSL.vec3(N.x, N.y, F(0.0)).mul(FI.brechung))
        );
        // DAS ZIEL: die Zeile dieses Tors im Atlas (Stoff-Wert `ziel`), die Zeilenhöhe geklemmt (keine Nachbar-Zeile blutet ein),
        // waagrecht umlaufend; die Bild-Werte der Welt durch die Belichtung der Heimat geteilt — die Heimat tont sie, wie die Welt
        // sich selbst zeigt
        const Z = this._torZiele();
        const zv = 0.5 / AnazhRealm.TOR_ZIEL.h;
        const eq = TSL.equirectUV(dir);
        const zielTex = TSL.texture(
            Z.tex,
            TSL.vec2(eq.x, zielZeile.add(TSL.clamp(eq.y, F(zv), F(1 - zv))).div(Z.uZeilen))
        );
        const ziel = zielTex.rgb.mul(Z.uBelicht);
        // ── DER SEIFENFILM: Dicke aus Bogen-Radius (die Ellipse rimAx × rimAy) und Welle, Gangunterschied je Blickwinkel ──
        const rr = TSL.length(xy.sub(centerXY).div(TSL.vec2(ga.y, ga.z)));
        const cosI = TSL.max(TSL.dot(N, Vd), F(0.0));
        const cosT = TSL.sqrt(
            F(1.0).sub(
                F(1.0)
                    .sub(cosI.mul(cosI))
                    .div(F(FI.n * FI.n))
            )
        );
        const dicke = F(FI.dicke[0])
            .add(rr.mul(FI.dicke[1]))
            .add(d0V.div(TSL.max(waveDepth, F(1e-3))).mul(FI.dicke[2]))
            .add(TSL.sin(time.mul(FI.dicke[4]).add(xy.y.mul(FI.dicke[5]))).mul(FI.dicke[3]));
        // DIE DISPERSION (D8): der Gangunterschied 2·n·d·cos θt in Wellenlängen ist je Farbe ein anderer (λ_R / λ, `film.welle`) —
        // die Bänder laufen in Blau schneller als in Rot (die Newton-Folge)
        const welle = TSL.vec3(FI.welle[0], FI.welle[1], FI.welle[2]);
        const filmRoh = TSL.max(
            vPA.add(vPB.mul(TSL.cos(vPC.mul(welle).mul(dicke.mul(cosT).mul(2.0)).add(vPD).mul(F(6.28318))))),
            F(0.0)
        );
        // DIE FARBE DER BÄNDER (`film.farbe`): die Buntheit des Films um seine Helligkeit — Farbe statt Licht, damit der Film ein
        // blasses Ziel tönt, statt es zu Milch zu waschen
        const filmL = TSL.dot(filmRoh, TSL.vec3(0.2126, 0.7152, 0.0722));
        const film = TSL.max(TSL.mix(TSL.vec3(filmL, filmL, filmL), filmRoh, F(FI.farbe)), F(0.0));
        const fres = F(FI.fresnel[0]).add(F(1 - FI.fresnel[0]).mul(TSL.pow(F(1.0).sub(cosI), F(FI.fresnel[1]))));
        const rand = TSL.smoothstep(F(FI.rand[0]), F(FI.rand[1]), rr);
        // DER RAND GEZÄHMT (D8): das Gewicht des Films trägt einen Deckel — bei streifendem Blick bleibt das Ziel sichtbar
        const filmW = TSL.min(fres.add(rand.mul(FI.rand[2])).add(F(FI.basis)), F(FI.gewichtMax)).mul(
            act.mul(FI.act[1]).add(FI.act[0])
        );
        // der Film spiegelt die Heimat: die EINE Umgebung (`_himmelUmgebungTex`, wie die IBL jedes PBR-Stoffs) in der Spiegel-Richtung, aus dem
        // Rahmen des Tors in die Welt gedreht (Stoff-Wert `dreh` = rotationY), in seinen Interferenz-Farben, im Licht jetzt (`_umgebungLicht`)
        const Rf = TSL.reflect(rd, N);
        const cr = TSL.cos(dreh);
        const sr = TSL.sin(dreh);
        const RfW = TSL.vec3(Rf.x.mul(cr).add(Rf.z.mul(sr)), Rf.y, Rf.z.mul(cr).sub(Rf.x.mul(sr)));
        const spiegel = TSL.texture(this._himmelUmgebungTex(), TSL.equirectUV(RfW))
            .level(F(0))
            .rgb.mul(this._umgebungLicht());
        const glanz = film.mul(spiegel).mul(F(FI.glanz[0])).mul(pulse.mul(FI.glanz[2]).add(FI.glanz[1])).mul(spiegelK);
        const col = TSL.mix(ziel, glanz, filmW);
        // `ohneFilm`: dieselbe Öffnung ohne den Film — nur das Ziel (die Linse milchweiss: Milch ist, was der Film dem Ziel
        // hinzufügt; `__membranOhneFilm` in scripts/lib/ausgabe-aufnahme.cjs)
        const G = {
            positionNode,
            colorNode: TSL.vec4(col, 1.0),
            opacityNode: keep,
            ohneFilm: TSL.vec4(ziel, 1.0),
        };
        this._membranGraphen.set(MG, G);
        return G;
    }

    // ═══ DAS ZIEL DER TORE (D8, „Das Tor als Fenster") ═══
    // Jedes Tor zeigt seine Ziel-Welt: das Panorama, das die Welt SELBST rendert (die Hülle der Studios `AnazhHuelle.panorama`,
    // Labor = Welt) — EIN Export je Welt und SHA ihrer Quellen, gebacken vom Studio in seiner eigenen Welt
    // (`node scripts/diag-studio-huelle.cjs --panorama`), geliefert als Datei (`worlds/tor-ziele.json` nennt je Welt ihre Datei
    // rgba16float 512 × 256 und ihren Stempel = SHA-256 der Quellen; gate:studio-huelle H5 hält den Stempel an den Quellen von
    // heute). Die Heimat rendert und bootet keine Ziel-Welt: sie liest die Datei (der Haupt-Faden trägt einen Abruf und eine
    // Kopie, nie den Bau einer Welt). Jedes Ziel ist EINE Zeile EINES Atlas (rgb9e5ufloat, 512 × 256·N, +0,5 MB je Ziel); die
    // Membran liest ihre Zeile als Stoff-Wert `ziel` mit demselben Knoten. Das TOR lebt ohne sein Ziel (Hindurchgehen, Flügel,
    // Licht: `_tickPortalMembranes`), nur das FENSTER wartet darauf — ohne Ziel kein Zwischen-Bild. Eine Welt, die der Export
    // benannt ohne Panorama führt (`ohne`: die sandgesicherten Welten ohne Skript), zeigt keins; eine, die er nicht kennt, bricht
    // laut beim Namen (`_bruchMelden`).
    static get TOR_ZIEL() {
        return this._einmal("TOR_ZIEL", { w: 512, h: 256, format: 1, karte: "worlds/tor-ziele.json" });
    }

    // Die Ziel-Welt eines Tors: dieselbe Auflösung wie das Betreten (`enterPortal`: Eintrag vor Bauplan, `_sanitizePortalMeta`).
    // Ein Web-Portal (signierte Adresse) hat keine Welt auf diesem Boden — sein Tor zeigt keine.
    _torZielWelt(entry) {
        const bp = this.state.blueprints && entry ? this.state.blueprints[entry.type] : null;
        const roh = (entry && entry.portalMeta) || (bp && bp.portalMeta) || null;
        if (roh && roh.worldAddress) return null;
        if (roh && (roh.gesetz || roh.weltId)) return null; // ein Welt-Tor des Ultiversums führt in eine Welt, kein Studio-Fenster
        return this._sanitizePortalMeta(roh, entry ? entry.type : "Portal");
    }

    _torZiele() {
        const TSL = THREE.TSL;
        // DIE HEIMAT DER ATLAS-WERTE (Pflicht-Paar der Diät, E1): Zeilen-Zahl und Belichtung gelten jeder Membran gleich, die
        // Belichtung wechselt je Takt — als geteilte renderGroup lädt sie EINMAL je Render statt je Membran-Gruppe.
        return (
            this._torZielAtlas ||
            (this._torZielAtlas = this._uniformHeimatTeilen({
                welten: new Map(),
                n: 0,
                tex: null,
                uZeilen: TSL.uniform(1),
                uBelicht: TSL.uniform(1),
                buendel: null,
            }))
        );
    }

    // Die Zeile des Ziels eines Tors: steht sie, ihre Nummer; sonst null — der erste Frager setzt den Abruf in Gang. Alle Fragen
    // EINES Takts (der Scan nennt die Tore des Rings zusammen) bilden EIN Bündel: EIN Einsetzen, EIN Hochladen des Atlas.
    // `kommt` ist das Versprechen der Zeile (null, wenn das Ziel nicht kommt).
    _torZielZeile(entry) {
        const meta = this._torZielWelt(entry);
        if (!meta) return null;
        const Z = this._torZiele();
        let z = Z.welten.get(meta.world);
        if (!z) {
            z = {
                world: meta.world,
                meta,
                zeile: null,
                quelle: null,
                stempel: null,
                fehler: null,
                ohne: null,
                kommt: null,
            };
            z.kommt = new Promise((ja) => (z.ja = ja));
            Z.welten.set(meta.world, z);
            if (!Z.buendel) {
                const b = (Z.buendel = []);
                Promise.resolve().then(() => {
                    Z.buendel = null;
                    return this._torZielBuendel(b);
                });
            }
            Z.buendel.push(z);
        }
        return z.zeile;
    }

    // Die Karte des Exports (`TOR_ZIEL.karte`, je Version EINMAL abgerufen): { format, w, h, welten: { world: { datei, stempel } },
    // ohne: { world: Grund } }.
    _torZielKarte() {
        const G = AnazhRealm.TOR_ZIEL;
        if (!this._torZielKarteKommt)
            this._torZielKarteKommt = fetch(`${G.karte}?v=${AnazhRealm.VERSION}`).then((r) => {
                if (!r.ok) throw new Error(`${G.karte} antwortet ${r.status}`);
                return r.json();
            });
        return this._torZielKarteKommt;
    }

    // Ein Bündel von Zielen: nach dem ersten Weltbild (`_weltbildKommt`) die Karte, dann jede Datei zugleich; die angekommenen
    // Zeilen setzt EIN Schreiber in den Atlas (`_torZielEinsetzen`). Ein Ziel, das nicht kommt, bricht laut beim Namen.
    async _torZielBuendel(b) {
        const G = AnazhRealm.TOR_ZIEL;
        const da = [];
        try {
            await this._weltbildKommt();
            const K = await this._torZielKarte();
            if (!K || K.format !== G.format || K.w !== G.w || K.h !== G.h)
                throw new Error(
                    `${G.karte} trägt Format ${K && K.format} ${K && K.w}×${K && K.h} statt ${G.format} ${G.w}×${G.h}`
                );
            await Promise.all(
                b.map(async (z) => {
                    try {
                        const e = K.welten && K.welten[z.world];
                        if (!e) {
                            if (K.ohne && K.ohne[z.world]) return void (z.ohne = K.ohne[z.world]);
                            throw new Error(`der Export kennt die Welt nicht (${G.karte})`);
                        }
                        const r = await fetch(`${e.datei}?v=${String(e.stempel).slice(0, 16)}`);
                        if (!r.ok) throw new Error(`${e.datei} antwortet ${r.status}`);
                        const daten = new Uint16Array(await r.arrayBuffer());
                        if (daten.length !== G.w * G.h * 4)
                            throw new Error(`${e.datei} trägt ${daten.length} Texel-Werte statt ${G.w * G.h * 4}`);
                        z.stempel = e.stempel;
                        da.push([z, daten]);
                    } catch (e) {
                        this._torZielBruch(z, e);
                    }
                })
            );
        } catch (e) {
            for (const z of b) if (!z.fehler) this._torZielBruch(z, e);
        }
        if (da.length) this._torZielEinsetzen(da);
        for (const z of b) z.ja(z.zeile);
    }

    _torZielBruch(z, e) {
        z.fehler = (e && e.message) || String(e);
        this._bruchMelden(`das Ziel des Tors ${z.world}: ${z.fehler}`);
    }

    // Die Ziele in den Atlas: ihre Zeilen in DENSELBEN Puffer, EIN needsUpdate je Bündel. Der Atlas wächst nur, wenn der Platz
    // nicht reicht — dann mit einer Zeile je ANGEFRAGTER Welt, IN seiner Textur (die neue GPU-Form legt `_texturAbschied` an,
    // die Zeilenzahl ist eine geteilte Uniform): eine neue Textur je Wachsen stieg nach dem Entsorgen wieder auf, weil r184 beim
    // ersten Binden die Textur des Stoff-BAUS hochlädt (`Bindings._init`) — Puffer-Zensus: tex:tor-ziel 512×256, 1 MB.
    // DER ATLAS IN rgb9e5ufloat (profiband-k3, VRAM Genesis Third 118,9 > 118 MB): die Membran liest nur `.rgb` des Ziels, und
    // die Zeile ist lineares HDR-Licht ≥ 0 — drei Kanäle mit geteiltem Exponenten (9 Bit Mantisse je Kanal, wie half 10) in 4 Byte
    // statt rgba16float in 8: 7,0 → 3,5 MB an den sieben Zeilen des Genesis-Rings. Der Export bleibt rgba16float (die Datei und
    // ihr Stempel, gate:studio-huelle H5); das Einsetzen packt ihn (`_rgb9e5AusHalb`), `_torZielDaten` entpackt für die Linse.
    _torZielEinsetzen(da) {
        const G = AnazhRealm.TOR_ZIEL;
        const Z = this._torZiele();
        const zeile = G.w * G.h;
        const n = Z.n + da.length;
        const platz = Z.tex ? Z.tex.image.height / G.h : 0;
        if (n > platz) {
            let offen = 0; // die angefragten Welten mit Bild (keine benannt ohne, keine gebrochene)
            for (const x of Z.welten.values()) if (!x.ohne && !x.fehler) offen++;
            const hoch = Math.max(n, offen);
            const neu = new Uint32Array(zeile * hoch);
            if (Z.tex) {
                neu.set(Z.tex.image.data.subarray(0, Z.n * zeile));
                Z.tex.image = { data: neu, width: G.w, height: G.h * hoch };
            } else {
                Z.tex = new THREE.DataTexture(neu, G.w, G.h * hoch, THREE.RGBFormat, THREE.UnsignedInt5999Type);
                Z.tex.name = "tor-ziel";
                Z.tex.wrapS = THREE.RepeatWrapping;
                Z.tex.minFilter = THREE.LinearFilter;
                Z.tex.magFilter = THREE.LinearFilter;
                Z.tex.generateMipmaps = false;
            }
            Z.uZeilen.value = hoch;
        }
        for (const [z, daten] of da) {
            Z.tex.image.data.set(AnazhRealm._rgb9e5AusHalb(daten), Z.n * zeile);
            z.zeile = Z.n;
            z.quelle = "export";
            Z.n++;
        }
        Z.tex.needsUpdate = true;
    }

    // Das Ziel einer Membran als lineare Werte (die Linse zielTreue, `werkbank bild`): { w, h, daten Float32 rgba, Zeile 0 unten,
    // quelle "export", stempel, world } oder null.
    _torZielDaten(rec) {
        const G = AnazhRealm.TOR_ZIEL;
        const meta = rec && rec.entry ? this._torZielWelt(rec.entry) : null;
        const Z = this._torZielAtlas;
        const z = meta && Z ? Z.welten.get(meta.world) : null;
        if (!z || z.zeile == null) return null;
        const o = z.zeile * G.w * G.h;
        const roh = Z.tex.image.data.subarray(o, o + G.w * G.h);
        const daten = new Float32Array(roh.length * 4);
        for (let i = 0; i < roh.length; i++) {
            const p = roh[i];
            const s = 2 ** ((p >>> 27) - 24); // 2^(e − B − N), B 15, N 9
            daten[4 * i] = (p & 511) * s;
            daten[4 * i + 1] = ((p >>> 9) & 511) * s;
            daten[4 * i + 2] = ((p >>> 18) & 511) * s;
            daten[4 * i + 3] = 1;
        }
        return { w: G.w, h: G.h, daten, quelle: z.quelle, stempel: z.stempel, world: z.world };
    }

    // half rgba (der Export) → rgb9e5 (der Atlas): je Texel der geteilte Exponent des größten Kanals (WebGPU/GL-Packregel, B 15,
    // N 9, Emax 31), die Kanäle gerundet; negativ und NaN → 0, über 65408 geklemmt. Alpha fällt (die Membran liest es nie).
    // DIE TAFEL JE HALB-WERT (w16-haenger, profiband.K4): Wert (geklemmt) und Exponent jedes der 65 536 Halb-Werte EINMAL, je
    // Texel nur Nachschlagen — der Exponent des Größten ist der größte der drei (floor·log2 steigt monoton). Bis hier rechnete
    // jeder Kanal `2 **` und jedes Texel `Math.log2`: die sieben Zeilen des Genesis-Rings (917 504 Texel) trugen EINE Aufgabe
    // von 340–1 252 ms im Haupt-Faden (headless Erst-Boot, Gehen), Node 266 → 24 ms, byte-gleich über jeden Halb-Wert je Kanal.
    static _rgb9e5AusHalb(h) {
        const { wert, ex, stufe } = AnazhRealm._rgb9e5Tafel();
        const aus = new Uint32Array(h.length >> 2);
        for (let i = 0, j = 0; i < aus.length; i++, j += 4) {
            const a = h[j],
                b = h[j + 1],
                c = h[j + 2];
            const r = wert[a],
                g = wert[b],
                bl = wert[c];
            const mx = r > g ? (r > bl ? r : bl) : g > bl ? g : bl;
            const xa = ex[a],
                xb = ex[b],
                xc = ex[c];
            let e = (xa > xb ? (xa > xc ? xa : xc) : xb > xc ? xb : xc) + 16;
            let s = stufe[e];
            if (Math.floor(mx / s + 0.5) === 512) ((s *= 2), e++);
            aus[i] =
                (Math.floor(r / s + 0.5) |
                    (Math.floor(g / s + 0.5) << 9) |
                    (Math.floor(bl / s + 0.5) << 18) |
                    (e << 27)) >>>
                0;
        }
        return aus;
    }
    // Die Tafel (`_rgb9e5AusHalb`): je Halb-Wert x sein Wert (negativ, NaN → 0, ∞ und darüber → 65408) und max(−16, ⌊log2⌋),
    // dazu 2^(e − 24) je Exponent e des Pakets.
    static _rgb9e5Tafel() {
        if (AnazhRealm.__rgb9e5Tafel) return AnazhRealm.__rgb9e5Tafel;
        const wert = new Float64Array(65536),
            ex = new Int8Array(65536),
            stufe = new Float64Array(34);
        for (let x = 0; x < 65536; x++) {
            const e = (x >> 10) & 31,
                m = x & 1023;
            let v;
            if (x & 0x8000 || e === 31) v = e === 31 && !m && !(x & 0x8000) ? 65408 : 0;
            else v = e === 0 ? m * 2 ** -24 : (1 + m / 1024) * 2 ** (e - 15);
            wert[x] = v = Math.min(v, 65408);
            ex[x] = Math.max(-16, Math.floor(Math.log2(v || 2 ** -16)));
        }
        for (let e = 0; e < 34; e++) stufe[e] = 2 ** (e - 24);
        return (AnazhRealm.__rgb9e5Tafel = { wert, ex, stufe });
    }

    // Membran-Tick: je sichtbarem Portal-Eintrag mit Tor-Gestalt EINE Membran (Registry je entry.id),
    // Uniforms atmen, HINDURCHGEHEN prüfen (Ebenen-Kreuzung in der Apertur → enterPortal, derselbe
    // Chokepoint wie die E-Taste). Scan 1 Hz (bounded), Uniform-Atem pro Frame.
    _tickPortalMembranes(currentTime) {
        const st = this.state;
        if (!st || !st.scene || typeof THREE === "undefined") return;
        if (!this._portalMembranes) this._portalMembranes = new Map();
        const reg = this._portalMembranes;
        const pm = st.playerMesh;
        if (!pm || !pm.position) return;
        const px = pm.position.x;
        const py = pm.position.y;
        const pz = pm.position.z;
        const SICHT = 180;
        // ── 1-Hz-Scan: Kandidaten einsammeln + Verwaiste räumen ──
        if (!this._membranScanAt || currentTime - this._membranScanAt > 1) {
            this._membranScanAt = currentTime;
            const seen = new Set();
            const arches = st.architectures;
            if (Array.isArray(arches)) {
                for (const entry of arches) {
                    if (!entry || !entry.position) continue;
                    if (!(entry.affordances && entry.affordances.isPortal)) continue;
                    const tor = this._torGesetzFor(entry);
                    if (!tor) continue; // Part-Gestalt-Portale tragen ihre eigene sichtbare Passage
                    // Der Eintrag bleibt registriert, solange er LEBT — lazy beim ersten Sicht-Kontakt gebaut, danach nie
                    // wieder. Nie dispose beim Verlassen: sonst TSL-Bau + Pipeline-Compile pro Grenzübertritt + Geo-Leck.
                    seen.add(entry.id);
                    let rec = reg.get(entry.id);
                    if (!rec) {
                        const dx = entry.position.x - px;
                        const dz = entry.position.z - pz;
                        if (dx * dx + dz * dz > SICHT * SICHT) continue;
                        // DAS TOR LEBT OHNE SEIN ZIEL (D8): Hindurchgehen, Flügel und Licht hängen am Eintrag, nie am Fenster
                        rec = { entry, tor, mesh: null, u: null, armed: true, lastLz: null };
                        reg.set(entry.id, rec);
                    }
                    // DAS FENSTER WARTET AUF SEIN ZIEL (D8): erst mit der Zeile seiner Ziel-Welt der Bau (der Abruf läuft); ein
                    // Web-Portal und eine Welt ohne Panorama zeigen keins
                    if (!rec.mesh) {
                        const ziel = this._torZielZeile(entry);
                        if (ziel != null) this._membranBauFor(rec, ziel);
                    }
                }
            }
            for (const [id, rec] of reg) {
                if (!seen.has(id)) {
                    // Nur ein WIRKLICH gefallener Eintrag räumt — mit seinem Stoff (er trägt den topTex-dispose-
                    // Listener und gehört dem Tor). Die Geometrie gehört dem Memo je Gestalt (`_membranGeometryFor`) und
                    // allen Toren dieser Gestalt — sie bleibt (Frost-Nachbesserung 4: die Entsorgungs-Wand nannte sie, ein
                    // Tor außer Sicht entsorgte die Geometrie seiner Geschwister).
                    if (rec.mesh) {
                        st.scene.remove(rec.mesh);
                        if (rec.mesh.material) rec.mesh.material.dispose();
                    }
                    reg.delete(id);
                }
            }
        }
        if (reg.size === 0) {
            this._tickPortalLicht(null); // kein Tor, kein Licht des Tors (mit dem letzten fällt sein Platz im Licht-Pool)
            return;
        }
        // ── pro Frame: Atem + Hindurchgehen ──
        const reach = AnazhRealm.PORTAL_REACH_M;
        // die Belichtung der Heimat teilt die Bild-Werte des Ziels (die Heimat tont sie danach, wie die Welt sich zeigt)
        if (this._torZielAtlas && st.renderer)
            this._torZielAtlas.uBelicht.value = 1 / Math.max(1e-3, st.renderer.toneMappingExposure || 1);
        for (const rec of reg.values()) {
            const entry = rec.entry;
            const mu = rec.tor.mu;
            const MG = rec.tor.gesetz;
            const scale = Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1;
            const ry = Number.isFinite(entry.rotationY) ? entry.rotationY : 0;
            const c = Math.cos(ry);
            const s = Math.sin(ry);
            const dx = px - entry.position.x;
            const dz = pz - entry.position.z;
            const d = Math.hypot(dx, dz);
            // Fern-Schlaf: jenseits der Sicht ruht die Membran (unsichtbar, kein
            // Uniform-Takt) — das Material bleibt kompiliert stehen (Erstarren-Lehre).
            // DER SCHLAF VERLÄSST DEN GRAPHEN (0910-4): ein unsichtbares Mesh im Graphen hält seine Puffer auf der GPU (der
            // Kehraus `_gpuKehraus` lässt, was ein Objekt des Graphen trägt) — gemessen an der Wiese 1 000 m vom Ring: 1,98 MB
            // `szene:portal-membran` für sieben schlafende Passagen. Schläft sie, verlässt sie den Graphen,
            // und der EINE Kehraus nimmt die Puffer, die keine wache Schwester derselben Gestalt mehr trägt; erwacht sie,
            // kehrt sie zurück und lädt hoch — Stoff und Pipeline stehen weiter.
            if (d > SICHT) {
                if (rec.mesh && rec.mesh.visible) rec.mesh.visible = false;
                if (rec.mesh && rec.mesh.parent) rec.mesh.parent.remove(rec.mesh);
                rec.lastLz = null;
                rec.wach = false;
                continue;
            }
            rec.wach = true;
            if (rec.mesh && !rec.mesh.parent) st.scene.add(rec.mesh);
            if (rec.mesh && !rec.mesh.visible) rec.mesh.visible = true;
            let act = Math.max(0, Math.min(1, 1 - (d - reach) / 12));
            // V18.491.75 — Heimkehr-Linger: Ausgangstor bleibt kurz warm (Kontinuum).
            const hk = this._portalHeimkehr;
            if (hk) {
                if (currentTime >= hk.until) {
                    this._portalHeimkehr = null;
                } else if (!hk.entryId || (entry && entry.id === hk.entryId)) {
                    const span = Math.max(0.001, hk.until - hk.start);
                    const fade = Math.max(0, Math.min(1, (hk.until - currentTime) / span));
                    act = Math.max(act, 0.55 + 0.45 * fade);
                    rec.armed = false;
                }
            }
            rec._act = act;
            // Puls und Welle auf der Bild-Uhr (A9); der Scan und das Nachglühen der Heimkehr sind Gänge der Loop-Zeit
            rec.puls = 0.5 + 0.5 * Math.sin(this._bildZeit * MG.puls);
            if (rec.u) {
                rec.u.time.value = this._bildZeit;
                rec.u.act.value = act;
                rec.u.pulse.value = rec.puls;
                rec.u.waveDepth.value = mu.zFace * (MG.aktivDepth[0] + MG.aktivDepth[1] * act);
            }
            // ── HINDURCHGEHEN: Spieler kreuzt die Membran-Ebene in der Apertur ──
            const lx = (dx * c - dz * s) / scale;
            const lz = (dx * s + dz * c) / scale;
            const ly = (py - (entry.position.y - 0.5)) / scale;
            const inApertur =
                Math.abs(lx) < mu.rimAx * 0.92 &&
                ly > mu.baseY - 0.2 &&
                ly < mu.apexY + 0.4 &&
                Math.abs(lz) < mu.zFace + 1.2;
            // Re-Arm beim VERLASSEN der Apertur-Zone: ein Durchgang verbraucht die
            // Waffnung (kein Doppelfeuer in einem Pass), wer die Zone verlässt und
            // erneut kreuzt (egal welche Richtung), betritt wieder.
            if (rec.armed === false && !inApertur) rec.armed = true;
            // Tür-Flügel öffnen sich dem Reisenden: g.tuer-Meshes drehen um die Hinge-Achse, Ziel = Nähe ×
            // _tuerOffenRad() (EINE Quelle TUER_GESETZ.offen, wie das Lab-DOOR_OPEN), weich geglättet.
            // Nur Registry-Portale (≤ Handvoll); ferne Tore stehen zu.
            // DIE TÜR LEBT IN DER STUFE 0 (K43): nennt das Gesetzbuch die Grenze seiner Stufe 1 (B2c `ab`, `hyst`), stehen die
            // Flügel jenseits in der FERN-POSE (K43-2, `TUER_GESETZ.fern` — die Stufe 1 trägt sie fest im Körper, die Stufe 0
            // zeigt an der Grenze dieselbe) — sie öffnen von der Grenze, an der die Stufe 0 sicher steht ((1 − h)·ab), bis zur
            // Reichweite ganz; die Nähe nie weiter als der Atem des Tors (act).
            const tg = this._archStufenGrenzen(entry);
            const tNah = tg ? tg.grenzen[0].ab * (1 - tg.h) * scale : null;
            const fern = tg ? AnazhRealm._tuerFernAnteil() : 0;
            const tuerAct = tg
                ? fern + (1 - fern) * Math.min(act, Math.max(0, Math.min(1, (tNah - d) / Math.max(0.5, tNah - reach))))
                : act;
            this._tickTorFluegel(rec, entry, tuerAct);
            if (
                rec.armed !== false &&
                inApertur &&
                typeof rec.lastLz === "number" &&
                Math.sign(rec.lastLz) !== 0 &&
                Math.sign(lz) !== 0 &&
                Math.sign(lz) !== Math.sign(rec.lastLz) &&
                !this._portalOverlay
            ) {
                rec.armed = false;
                this.enterPortal(entry);
            }
            rec.lastLz = inApertur ? lz : null;
        }
        // Das Lab-portalLight als EIN geteiltes Welt-Licht (nie ein Licht je Tor — der Genesis-Ring trüge
        // zehn): steht am NÄCHSTEN aktiven Tor, atmet (0.3 + act·3.4)·(0.8 + 0.28·puls); kein Tor nah → aus.
        let naeh = null;
        for (const rec of reg.values()) {
            if (!rec.wach || !(rec._act > 0.02)) continue;
            if (!naeh || rec._act > naeh._act) naeh = rec;
        }
        this._tickPortalLicht(naeh);
    }

    // DAS LICHT DES TORS (K11): das Lab-portalLight ist ein Bürger des Licht-Pools — das wache Tor (das nächste aktive) trägt
    // sein Emitter-Datum aus porta GLUT_GESETZ (Farbe, Reichweite, Abfall, Höhe am Spring-Punkt; der Kern des Abfalls ist
    // der halbe Bogen der Membran, K11b) und die Stärke des Labors
    // `glutIntensity(act, puls)`; der Licht-Takt liest es (`_leuchtQuellen`). Kein Szenen-Licht (bis K11 ein PointLight, das
    // beim ersten Tor in die Szene trat und dort auf 0 blieb). Ohne waches Tor kein Licht.
    _tickPortalLicht(rec) {
        if (!rec) {
            this._portalLeuchte = null;
            return;
        }
        const PC = globalThis.__portaCore;
        const G = PC.GLUT_GESETZ;
        const e = rec.entry;
        const mu = rec.tor.mu;
        const sc = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
        const q =
            this._portalLeuchte ||
            (this._portalLeuchte = {
                quelle: "tor",
                L: { farbe: G.color, staerke: 0, reichweiteM: G.dist, abfall: G.decay, kernM: 0 },
                masse: 1,
                phase: 0,
            });
        q.L.kernM = 0.5 * mu.spanW * sc; // der Kern des Abfalls (fachwerk `lichtAbfall`): die Membran leuchtet als Fläche, ihr halber Bogen
        q.x = e.position.x;
        q.y = e.position.y - 0.5 + mu.springY * G.ySpring * sc;
        q.z = e.position.z;
        q.L.staerke = PC.glutIntensity(rec._act, rec.puls);
    }

    // Eine Membran für einen Eintrag bauen (fail-LAUT: schlägt der TSL-Bau fehl, bricht er beim Namen —
    // `_stoffBruch`; die schlichte Ersatz-Fläche ist gefallen, K22).
    _membranBauFor(rec, ziel) {
        const st = this.state;
        const { entry, tor } = rec;
        let mesh = null;
        let u = null;
        try {
            const built = this._membranMaterialFor(tor, ziel, entry.rotationY);
            u = built.u;
            mesh = new THREE.Mesh(this._membranGeometryFor(tor), built.mat);
        } catch (err) {
            throw this._stoffBruch(`die Welt-Membran (${tor.gestalt})`, err);
        }
        mesh.position.set(entry.position.x, entry.position.y - 0.5, entry.position.z);
        if (Number.isFinite(entry.rotationY) && entry.rotationY !== 0) mesh.rotation.y = entry.rotationY;
        if (Number.isFinite(entry.scale) && entry.scale !== 1) mesh.scale.setScalar(entry.scale);
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        // das Culling bleibt an: die Hülle der geteilten Geometrie trägt die Welle (`_membranGeometryFor`)
        mesh.userData.inventar = "portal-membran"; // Identitäts-Stempel (gate:asset-inventory-Familie)
        st.scene.add(mesh);
        rec.mesh = mesh;
        rec.u = u;
    }

    // Flügel drehen im Template-Raum VOR der Welt-Scale auf den gebackenen Geschlossen-Vertices:
    // M = EntryWorld · WorldScale · T(h)·R_y(±a)·T(−h); Vorzeichen = seite·sign(zf) (leafL −a · leafR +a,
    // hinten gespiegelt). Flügel-Marken je Eintrag EINMAL aus entry.instSlots, neu bei Slot-Wechsel; der Slot wird je
    // Tick frisch aus der Marke gelesen (das Verdichten der Gruppe zieht ihn um, `_archGroupFree`).
    _tickTorFluegel(rec, entry, act) {
        const slots = entry.instSlots;
        if (!Array.isArray(slots) || !slots.length) return;
        if (rec._fluegelSrc !== slots) {
            rec._fluegelSrc = slots;
            // die Flügel der Stufe sammelt ihr Leib, wo die Slots entstehen (`_fluegelLeib`)
            if (entry._fluegelSlots !== slots) this._fluegelLeib(entry);
            rec._fluegel = entry._fluegel;
            // DORF-ERLEBNIS — Haus-Recs starten in der GEBACKENEN Offen-Pose
            // (rec._fluegelStart = Gesetz-Winkel): die Tür schliesst beim ersten
            // Fern-Tick WEICH statt zu springen. Tore (gebacken zu) stehen beim ersten Tick SOFORT im Ziel (K43-2): ihre
            // Flügel kommen mit dem Wechsel aus der Stufe 1, die die Fern-Pose trägt — ein weicher Start bei 0 schlösse sie.
            rec._fluegelWinkel = Number.isFinite(rec._fluegelStart) ? rec._fluegelStart : null;
        }
        if (!rec._fluegel || !rec._fluegel.length) return;
        // ZENSUS 17.07. — der Öffnungswinkel ist das EINE porta-Gesetz
        // (TUER_GESETZ.offen; der TOR_FLUEGEL_OFFEN-Zwilling fiel 19.07.,
        // der Leser ist fail-closed).
        const ziel = act * AnazhRealm._tuerOffenRad();
        const alt = rec._fluegelWinkel;
        const neu = alt == null ? ziel : alt + (ziel - alt) * 0.12;
        if (alt != null && Math.abs(neu - alt) < 0.0005 && Math.abs(neu - ziel) < 0.001) return; // eingeschwungen
        rec._fluegelWinkel = neu;
        const T = THREE;
        const ew = this._archEntryWorldMatrix(entry, this._torTmpEw || (this._torTmpEw = new T.Matrix4()));
        const mA = this._torTmpA || (this._torTmpA = new T.Matrix4());
        const mB = this._torTmpB || (this._torTmpB = new T.Matrix4());
        for (const f of rec._fluegel) {
            const t = f.tuer;
            AnazhRealm._fluegelSchwenk(t, neu, mB, mA);
            // EntryWorld enthält bereits die Welt-Skala/Rotation des Eintrags;
            // die Flügel-Leaves tragen localMatrix = WorldScale — die steckt in
            // den Instanz-Matrizen des Erst-Baus. Wir komponieren neu:
            mA.multiplyMatrices(ew, this._foundryWorldScaleMatrix(rec.tor.gestalt));
            mA.multiply(mB);
            // DIE FLÜGEL-INSTANZ (1310-4): zeichnet der Flügel die Gestalt eines anderen, setzt seine Basis sie an ihren Platz
            if (t.basis) mA.multiply(t.basis);
            if (!(f.ref.slot >= 0)) continue; // die Marke ist frei (Rebuild): der nächste Slot-Wechsel sammelt neu
            f.g.mesh.setMatrixAt(f.ref.slot, mA);
            f.g.mesh.instanceMatrix.needsUpdate = true;
            f.g.mesh.boundingSphere = null;
        }
        this._fluegelLeib(entry, true); // der Leib folgt dem Schwenk (der Kamera-Wurf `_fieldRaycast` liest ihn)
    }
    // DER SCHWENK EINES FLÜGELS im Template-Raum: `out` = T(h)·R_y(winkel)·T(−h) um sein Scharnier (`t.hx`, `t.zf`) beim Öffnungs-
    // Winkel `neu` (0 … `_tuerOffenRad`). Trägt der Flügel eine gebackene Offen-Pose (t.offen, fachwerk-Haustüren), dreht er
    // RELATIV dazu: fern um −offen zu, nah auf die Offen-Pose. porta-Tore (gebacken zu, kein offen) drehen absolut. EINE Quelle
    // für die Welt (`_tickTorFluegel`) und die Bühne der Studios (worlds/huelle/huelle.js `werk`, w28-studio-seiten).
    static _fluegelSchwenk(t, neu, out, tmp) {
        const sign = (t.seite || 1) * (t.zf >= 0 ? 1 : -1);
        const gz = AnazhRealm._tuerOffenRad() || 1;
        const winkel = Number.isFinite(t.offen) && t.offen !== 0 ? (neu / gz - 1) * t.offen : sign * neu;
        // T(h)·R_y(winkel)·T(−h) — kompakt über drei Matrizen:
        tmp.makeRotationY(winkel);
        out.makeTranslation(t.hx || 0, 0, t.zf || 0);
        out.multiply(tmp); // T(h)·R
        tmp.makeTranslation(-(t.hx || 0), 0, -(t.zf || 0));
        return out.multiply(tmp); // T(h)·R·T(−h)
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_siedlung_tor]);
