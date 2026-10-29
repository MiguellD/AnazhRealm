class AnazhRealm_siedlung_ort {
    // ===== ATLAS · Siedlung/ort — Siedlungs-Plan · Bau-Frei · Dorf-Erlebnis · Tore und Membranen · Fahr-Platz =====
    // DAS LAND EINES WERKS (Schau-2 wasser-wahrheit): der Boden an (x, z) liegt mehr als `marge` über dem Wasser — dem
    // gezeichneten (`_nassAt`: was das Auge sieht, samt Live-Dach und Ufer) UND dem des Gesetzes, aus dem das Bild wird
    // (`_atlasWaterLevelAt` über dem Boden der Spalte: ein Chunk, dessen Sheet ein Wasser noch nicht zeichnet, trägt es
    // schon — am See −1080/−1135 zeichnete der Fern-Chunk den 8 m tiefen See noch nicht, der Wald pflanzte Erlen auf
    // seinen Grund). Eine Höhle, ein Loch (kein Boden) ist kein Land. Leser: jedes Werk, das gesetzt wird — der Hain und
    // der Satz („am Wasser"), die Natur-Wand (Wald, Unterholz, Streu, Hof-Baum, Bau-Phantom), die Siedlung samt Fundament,
    // Wege, Zäune, Brunnen, Stände, der Ort des Dorfs und der Spawn. Billige Beweise zuerst (Lehre 25): kein Wasser des
    // Gesetzes in der Spalte, oder Fels über seinem Spiegel + Marge — Land ohne Spalten-Scan.
    _landAt(x, z, marge = 0) {
        if (this._nassAt(x, z, marge)) return false;
        const oben = this._atlasWaterLevelAt(x, z, -1e9);
        if (!(oben > -Infinity)) return true;
        if (this._felsUeber(x, z, oben + marge)) return true;
        const boden = this._voxelSurfaceY(x, z);
        if (boden === null || !Number.isFinite(boden)) return false;
        return !(boden < this._atlasWaterLevelAt(x, z, boden) + marge);
    }

    // DAS LAND EINES FUNDAMENTS (Schau-2 wasser-wahrheit, Gegenprüfung): steht der Grundriss `fp` {ex, ez, ox, oz} (bau-lokal)
    // eines Werks am Ort (x, z) mit der Drehung `ry` samt dem Vorplatz seiner Haustür (`tuer`) ganz auf dem Land? Jeder
    // Punkt des EINEN Fundament-Rasters (`_fundamentRaster`) fragt das Land eines Werks (`_landAt`, 20 cm über dem Spiegel);
    // ohne Grundriss urteilt der Ort selbst. Der Ursprung zuerst (der billige Beweis: die meisten Würfe im Wasser fallen dort).
    // Leser: die Siedlung (`_spawnSettlementSlot`, Grundriss aus dem Export) und die Wand jedes Werks (`_werkImWasser`).
    // Befund: nur die Siedlung fragte das ganze Fundament — „bau mir ein haus am wasser" stellte an 11 von 11 Uferorten ein
    // Haus, dessen Fundament 6–67 von 81 Raster-Punkten bis 0,92–3,68 m tief im Wasser stand (der Satz fragte die Mitte).
    _fundamentLand(x, z, ry, fp, tuer, saum = 0) {
        if (!this._landAt(x, z, AnazhRealm.WERK_LAND_M)) return false;
        if (!fp) return true;
        const c = Math.cos(ry || 0);
        const s = Math.sin(ry || 0);
        // DER GRUND SAMT SAUM (K10): ein Haus eines Orts steht auf der Platte seines Erdbaus — dem Grundriss samt dem Saum des
        // Orts-Gesetzes (fachwerk `ORT_GESETZ.saumM`, `ortPlan`); das Land fragt dieselbe Fläche, die der Erdbau formt, im
        // halben Meter (gate:werk-im-wasser Z misst ≤ 1 m). Ein Werk ohne Ort (der Satz, der Tempel) trägt keinen Saum.
        const raster = saum > 0 ? { ex: fp.ex + saum, ez: fp.ez + saum, ox: fp.ox, oz: fp.oz } : fp;
        for (const [lx, lz] of AnazhRealm._fundamentRaster(raster, tuer, 0.5))
            if (!this._landAt(x + lx * c + lz * s, z - lx * s + lz * c, AnazhRealm.WERK_LAND_M)) return false;
        return true;
    }
    // DER ORT AUF DEM GELÄNDE (K10): der Export des Studios (2D) wird am Anker zum Plan v2 — dieselbe Formel, die das Studio
    // rechnet (fachwerk `ortPlan`), über DIESELBE Gelände-Funktion (`_terrainMacroSurfaceY`, das Gesetz samt dem Erdbau früherer
    // Orte); sein Erdbau liegt, bevor das erste Haus steht. Ein Plan, der schon v2 ist, bleibt. Leser: der Akt
    // (`spawnSettlement` über `_ortWahl`), der Export (`_spawnSettlementFromExport`) und das Auto-Dorf
    // (`_tickAutoSettlement`); die Slot-Quelle liest `slot.y`.
    // DIE ORT-WAHL (K10, Pflicht-OFFEN C: „Häuser im Fluss-Bett heilen am Plan"): der Anker ist der Wunsch; der Plan steht am
    // nächsten Ort der Ringe um ihn (`ORT_WAHL`: je `schrittM` ein Ring bis zur halben Siedlungs-Zelle, auf jedem Ring Orte im
    // Abstand ≤ `schrittM`), an dem er JEDES Haus trägt (Ort-Faden `ortTraegt`, am Wirt `_ortTraegtWirt`: jede Platte samt Saum und Vorplatz liegt auf dem
    // Boden des Plans, `WERK_LAND_M` über dem Wasser des Gesetzes — das Urteil der Wasser-Wand jedes Werks, `_fundamentLand` —,
    // kein Haus in einem Bau, `_bauFrei`, keins auf dem Spieler). Bis K10-6 stand das Auto-Dorf der Welt am Wunsch: vier
    // Platten lagen 0,6 m unter dem Spiegel des Flusses, die Wand warf die Häuser (12/16); die Ringe bis 72 m fanden keinen
    // Ort (der Fluss läuft 18 m neben dem Anker, das Dorf misst 65 m Radius, der nächste trockene Ort liegt 80 m weit). Der
    // Anker folgt dem Ort des Plans (`origin` x, z und seine Mitte). Ohne trockenen Ort bleibt der Wunsch, laut.
    // DER ORT WIRD WELT: der Plan v2 aus dem Gedächtnis des Orts (`_ortPlaene`, die Wahl `_ortWahl` im Ort-Faden) — `legen`
    // legt seinen Erdbau (`_erdbauSetzen` je Schlüssel einmal), der Anker `origin` (x, z und seine Mitte) rückt an seinen Ort.
    // Ein Plan, der schon v2 ist, bleibt. Ohne Wahl wirft der Ruf laut: die Wahl rechnet im Faden, wer sie braucht, wartet
    // auf `_ortWahl` (der Akt, der Vorlauf, der Prüfstand).
    _ortPlanSetzen(plan, origin, legen = true) {
        if (plan && plan.version === 2) return plan;
        const key = AnazhRealm._ortSchluessel(plan, origin);
        const v2 = this._ortPlaene && this._ortPlaene.get(key);
        if (!v2)
            throw new Error(
                `ORT: der Plan „${plan.name || "?"}" hat an ${key} keine Wahl — der Rufer wartet auf _ortWahl`
            );
        if (legen) this._erdbauSetzen(key, v2.erdbau);
        const dx = v2.ort.x - origin.x;
        const dz = v2.ort.z - origin.z;
        origin.x = v2.ort.x;
        origin.z = v2.ort.z;
        if (origin.mitte) origin.mitte = { x: origin.mitte.x + dx, z: origin.mitte.z + dz };
        return v2;
    }

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
            c: new T.Vector4(MU.height, MU.step, MU.fractal, MU.twist),
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
        const gc = W("c", "vec4"); // height · step · fractal · twist
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
            const twist = a.mul(F(MG.twistK)).add(ga.w.div(r.add(F(MG.swirlR0))));
            const om = t.mul(F(MG.om));
            const outw = TSL.sin(rr.mul(F(MG.kk)).sub(om).add(twist));
            const refl = TSL.sin(F(2.0).sub(rr).mul(F(MG.kk)).sub(om).add(twist));
            const wave = outw.add(refl.mul(F(MG.refl))).mul(TSL.exp(rr.negate().mul(F(MG.damp))));
            const pierce = TSL.sin(t.mul(F(MG.pierce[0])))
                .mul(TSL.exp(rr.mul(rr).negate().mul(F(MG.pierce[1]))))
                .mul(F(MG.pierce[2]));
            const micro = fbmN(
                c.mul(F(MG.micro[0])).sub(TSL.vec2(t.mul(F(MG.micro[1])), t.mul(F(MG.micro[1])))),
                3
            ).mul(F(MG.micro[2]));
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
        const R = gc.x.mul(FI.kugel);
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
        // Rahmen des Tors in die Welt gedreht (Stoff-Wert `dreh` = rotationY), in seinen Interferenz-Farben
        const Rf = TSL.reflect(rd, N);
        const cr = TSL.cos(dreh);
        const sr = TSL.sin(dreh);
        const RfW = TSL.vec3(Rf.x.mul(cr).add(Rf.z.mul(sr)), Rf.y, Rf.z.mul(cr).sub(Rf.x.mul(sr)));
        const spiegel = TSL.texture(this._himmelUmgebungTex(), TSL.equirectUV(RfW)).level(F(0)).rgb;
        const glanz = film.mul(spiegel).mul(F(FI.glanz[0])).mul(pulse.mul(FI.glanz[2]).add(FI.glanz[1]));
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
    static _rgb9e5AusHalb(h) {
        const f = (x) => {
            const e = (x >> 10) & 31,
                m = x & 1023;
            if (x & 0x8000 || e === 31) return e === 31 && !m && !(x & 0x8000) ? 65408 : 0;
            return e === 0 ? m * 2 ** -24 : (1 + m / 1024) * 2 ** (e - 15);
        };
        const aus = new Uint32Array(h.length >> 2);
        for (let i = 0; i < aus.length; i++) {
            const r = Math.min(f(h[4 * i]), 65408),
                g = Math.min(f(h[4 * i + 1]), 65408),
                b = Math.min(f(h[4 * i + 2]), 65408);
            const mx = Math.max(r, g, b);
            let e = Math.max(-16, Math.floor(Math.log2(mx || 2 ** -16))) + 16;
            let s = 2 ** (e - 24);
            if (Math.floor(mx / s + 0.5) === 512) ((s *= 2), e++);
            aus[i] =
                (Math.floor(r / s + 0.5) |
                    (Math.floor(g / s + 0.5) << 9) |
                    (Math.floor(b / s + 0.5) << 18) |
                    (e << 27)) >>>
                0;
        }
        return aus;
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
            // Trägt der Flügel eine gebackene Offen-Pose (t.offen, fachwerk-Haustüren), dreht er RELATIV dazu:
            // fern um −offen zu, nah auf die Offen-Pose. porta-Tore (gebacken zu, kein offen) drehen absolut.
            const sign = (t.seite || 1) * (t.zf >= 0 ? 1 : -1);
            const gz = AnazhRealm._tuerOffenRad() || 1;
            const winkel = Number.isFinite(t.offen) && t.offen !== 0 ? (neu / gz - 1) * t.offen : sign * neu;
            // T(h)·R_y(winkel)·T(−h) — kompakt über drei Matrizen:
            mA.makeRotationY(winkel);
            mB.makeTranslation(t.hx || 0, 0, t.zf || 0);
            mB.multiply(mA); // T(h)·R
            mA.makeTranslation(-(t.hx || 0), 0, -(t.zf || 0));
            mB.multiply(mA); // T(h)·R·T(−h)
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

    // ═══ KAMIN-RAUCH ═══
    // Quellen aus Settlement-Einträgen mit rauchQuelle; Lab-Partikel (matte Box) wenn THREE+scene da,
    // sonst Quellen-Liste + einmaliger Log/Flugschreiber-Stempel. Invariante: Rauch ⟺ chimney.
    // Haus-Türen: _tickHausTueren dreht nahe Häuser (< 40 m) durch DENSELBEN _tickTorFluegel.
    _updateDorfRauch(dt) {
        // RAUCH_VIS.host = "box-lambert" — Feel .125; Box+Lambert via RAUCH_GESETZ (sprites = Redesign).
        const st = this.state;
        if (!st) return;
        let dr = st.dorfRauch;
        if (!dr || typeof dr !== "object") {
            dr = st.dorfRauch = { quellen: [], teilchen: [] };
        }
        if (!Array.isArray(dr.quellen)) dr.quellen = [];
        if (!Array.isArray(dr.teilchen)) dr.teilchen = [];
        // Quellen neu aus Architectures mit rauchQuelle (world tip = origin + φ-rotate).
        const quellen = [];
        // die Kamine aus dem Verzeichnis (`_blockerMit("rauch")`, in der Ordnung des Bestands) — vorher je Frame jeder Eintrag
        const archs = Array.isArray(st.architectures) ? this._blockerMit("rauch") : null;
        if (archs) {
            for (let i = 0; i < archs.length; i++) {
                const e = archs[i];
                if (!e || !e.position) continue;
                const tip =
                    (e.userData && e.userData.rauchQuelle) ||
                    (e.chimney && Number.isFinite(e.chimney.x) ? e.chimney : null);
                if (!tip || !Number.isFinite(tip.x) || !Number.isFinite(tip.y) || !Number.isFinite(tip.z)) continue;
                const phi = Number.isFinite(e.rotationY) ? e.rotationY : 0;
                const c = Math.cos(phi);
                const s = Math.sin(phi);
                const ox = e.position.x || 0;
                const oz = e.position.z || 0;
                // Mesh-Fuß = position.y − 0.5 (spawnArchitecture-Kalibrierung); Lab y=0.
                const oy = (Number.isFinite(e.position.y) ? e.position.y : 0) - 0.5;
                quellen.push({
                    id: e.id,
                    x: ox + tip.x * c + tip.z * s,
                    y: oy + tip.y,
                    z: oz - tip.x * s + tip.z * c,
                });
            }
        }
        // DER BRAND RAUCHT (stoffe.K2#2) aus demselben Zustand, aus dem er leuchtet und knistert: jede glühende Zelle des Felds
        // (`brandFeld`) im Umkreis des Spielers ist eine Quelle über ihrer Mitte — sie verlischt mit ihrer Glut.
        const pm = st.playerMesh;
        if (pm) {
            const R = AnazhRealm.BRAND.rauchM;
            const [px, pz] = [pm.position.x, pm.position.z];
            this._brandGlutUm(px, pz, R, (b) => {
                const o = b.ort || this._brandOrt(b);
                if ((o.x - px) * (o.x - px) + (o.z - pz) * (o.z - pz) <= R * R) quellen.push(o);
            });
        }
        dr.quellen = quellen;
        if (quellen.length && !this._dorfRauchLogged) {
            this._dorfRauchLogged = true;
            try {
                this.log(`KAMIN-RAUCH: ${quellen.length} Quelle(n) live (chimney→rauchQuelle)`, "INFO");
            } catch (_e) {
                /* log optional */
            }
            try {
                const fr = st.flightRecorder;
                if (fr && typeof fr === "object") {
                    fr.rauchQuellen = quellen.length;
                    fr.rauchStamp = Date.now();
                }
            } catch (_e2) {
                /* flight recorder optional */
            }
        }
        const scene = st.scene;
        if (typeof THREE === "undefined" || !scene) {
            // Residual renderer: Quellen stehen; kein Mesh-Pfad (headless / no THREE).
            dr.teilchen.length = 0;
            return;
        }
        // Das Rauch-Gesetz wohnt im fachwerk-Gesetzbuch (EINE Quelle für Lab
        // und Welt) — fail-closed wie jeder Kern-Leser, kein Literal-Zwilling.
        const G =
            AnazhRealm.Gesetz("fachwerk:RAUCH_GESETZ", null) || AnazhRealm._kernPflichtBruch("fachwerk:RAUCH_GESETZ");
        // Lab-Feel: pro Frame, nicht dt-skaliert (Parity worlds/fachwerk frame). Ein Teilchen ist Daten (Lage, Größe,
        // Deckkraft); ohne Quelle entsteht keins, die lebenden steigen und vergehen weiter.
        if (quellen.length && dr.teilchen.length < G.maxTeilchen && Math.random() < G.spawnChance) {
            const qq = quellen[(Math.random() * quellen.length) | 0];
            dr.teilchen.push({
                x: qq.x,
                y: qq.y,
                z: qq.z,
                s: 1,
                vy: G.vyBase + Math.random() * G.vyRange,
                dx: (Math.random() - 0.5) * G.dxSpread,
                a: G.a0,
            });
        }
        // DER RAUCH DES FEUERS ZIEHT MIT DEM EINEN WIND (`_windAt` am Teilchen, die Bild-Uhr): Steigen und Streuen bleiben das
        // Gefühl des Labors je Frame, der Wind trägt jedes Teilchen mit seiner Geschwindigkeit in m/s × dt windab.
        const s = Number.isFinite(dt) && dt > 0 ? dt : 0;
        for (let k = dr.teilchen.length - 1; k >= 0; k--) {
            const T2 = dr.teilchen[k];
            const w = this._windAt(T2.x, T2.z, this._bildZeit);
            T2.y += T2.vy;
            T2.x += T2.dx + w.x * w.ms * s;
            T2.z += w.z * w.ms * s;
            T2.a -= G.fade;
            T2.s *= G.scaleMul;
            if (T2.a <= G.aKill) dr.teilchen.splice(k, 1);
        }
        this._dorfRauchZeichnen(G, dr.teilchen);
    }

    // DER RAUCH IST EIN SATZ (Welle 6): jedes Teilchen war ein eigenes Mesh mit eigenem Stoff (die Deckkraft je Kiste) —
    // ein GPU-Befehl je Teilchen (Mess-Wiese: dorf-rauch 5 Befehle, das Gesetz trägt bis maxTeilchen 26), dazu je Teilchen
    // Geometrie und Stoff neu und wieder entsorgt. Jetzt: EINE InstancedMesh (die matte Kiste des Labors, RAUCH_VIS
    // "box-lambert", in der Welt rau-Standard — r184-Lambert liest scene.environment nie diffus), die Deckkraft je
    // Instanz als Attribut. Gleichfarbige Teilchen mischen ohne Tiefen-Schreiben unabhängig von der Reihenfolge (über
    // a₁, a₂ symmetrisch): das Bild der von fern nach nah sortierten Einzel-Kisten, ohne Sortierung.
    _dorfRauchZeichnen(G, teilchen) {
        const st = this.state;
        let R = st.dorfRauchSatz;
        if (!R && !teilchen.length) return; // kein Rauch, kein Mesh
        if (!R || R.cap < G.maxTeilchen || R.size !== G.size) {
            if (R) {
                if (R.mesh.parent) R.mesh.parent.remove(R.mesh);
                this._instanzAbschied(R.mesh); // die Instanz-Puffer verlassen die GPU (W6, r184s Register)
                R.geo.dispose();
                R.mat.dispose();
            }
            const cap = G.maxTeilchen;
            const geo = new THREE.BoxGeometry(G.size, G.size, G.size);
            const alpha = new THREE.InstancedBufferAttribute(new Float32Array(cap), 1);
            geo.setAttribute("aRauchDeck", alpha);
            const mat = new THREE.MeshStandardNodeMaterial({
                color: G.color,
                transparent: true,
                depthWrite: false,
                roughness: 1,
                metalness: 0,
            });
            mat.opacityNode = THREE.TSL.attribute("aRauchDeck", "float");
            this._leuchtStoff(mat, null); // der Rauch streut das Licht des Feuers (K11, der Licht-Pool)
            const mesh = AnazhRealm._instanzMesh(geo, mat, cap);
            mesh.name = "dorf-rauch";
            mesh.userData.inventar = "dorf-rauch"; // Identitäts-Stempel (gate:asset-inventory: Welt-Substanz)
            mesh.castShadow = false;
            mesh.receiveShadow = false;
            AnazhRealm._instanzZahl(mesh, 0);
            st.scene.add(mesh);
            R = st.dorfRauchSatz = { mesh, geo, mat, alpha, cap, size: G.size, m: new THREE.Matrix4() };
        }
        const n = Math.min(teilchen.length, R.cap);
        const e = R.m.elements;
        for (let k = 0; k < n; k++) {
            const t = teilchen[k];
            R.m.makeScale(t.s, t.s, t.s);
            e[12] = t.x;
            e[13] = t.y;
            e[14] = t.z;
            R.mesh.setMatrixAt(k, R.m);
            R.alpha.array[k] = t.a;
        }
        AnazhRealm._instanzZahl(R.mesh, n);
        if (n > 0) {
            R.mesh.instanceMatrix.needsUpdate = true;
            R.alpha.needsUpdate = true;
            R.mesh.boundingSphere = null; // die Teilchen steigen: die Hülle folgt (three cullt die Wolke als Ganzes)
        }
    }

    _tickHausTueren(currentTime) {
        const st = this.state;
        const pm = st.playerMesh;
        if (!pm || !Array.isArray(st.architectures)) return;
        // `currentTime` sind SEKUNDEN (der Loop: `t / 1000`) — der Scan jede Sekunde. Bis 0710-11 stand hier `> 1000`: die
        // Liste baute sich nur alle 1 000 s neu, ein Haus, das danach in die Nähe kam oder beim Scan noch kein Mesh trug, öffnete
        // seine Tür bis zu ~17 min nicht (gate:brennglas-takt (H)).
        if (!this._hausTuerScanT || currentTime - this._hausTuerScanT > 1) {
            this._hausTuerScanT = currentTime; // Instanz-Felder (die _editSaveTimer-Klasse: nicht serialisiert)
            const nah = [];
            const p = pm.position;
            // die Plätze um den Spieler (`_blockerUmPlatz`, in der Ordnung des Bestands) — vorher jeder Eintrag je Scan
            const kand = this._hausTuerKand || (this._hausTuerKand = []);
            kand.length = 0;
            this._blockerUmPlatz(p.x, p.z, 40 + 1e-6, kand);
            for (const e of kand) {
                if (!e || !e.tuer || !e.position || !e.instSlots) continue;
                const dx = e.position.x - p.x;
                const dz = e.position.z - p.z;
                if (dx * dx + dz * dz < 1600) nah.push(e); // 40 m
            }
            this._hausTuerNah = nah;
        }
        const nah = this._hausTuerNah;
        if (!nah || !nah.length) return;
        const gz = AnazhRealm._tuerOffenRad();
        for (const e of nah) {
            if (!e.instSlots) continue; // zwischenzeitlich geculled
            const d = Math.hypot(e.position.x - pm.position.x, e.position.z - pm.position.z);
            // Reichweite = halbe Kern-Diagonale + Schwelle: die Tür beginnt sich
            // ~5 m vor der Wand zu öffnen und steht offen, wenn man sie erreicht.
            const reach = Math.max(e.tuer.W || 6, e.tuer.D || 6) * 0.5 + 1.2;
            const act = Math.max(0, Math.min(1, 1 - (d - reach) / 5));
            const rec =
                e._tuerRec ||
                (e._tuerRec = {
                    tor: { gestalt: this._foundryPresetForEntry(e) || "haus" },
                    _fluegelStart: gz, // Start = gebackene Offen-Pose (weiches Erst-Schliessen)
                });
            this._tickTorFluegel(rec, e, act);
        }
    }

    // DER PLATZ, DEN DIE WELT WÄHLT (Leben-Schau 2, fahr-bahn — Befund: der Vorschau-GT am Garage-Tor stand 38° steil und
    // 40° gewankt auf dem Felsblock, W 3 s brachte 0,08 m; der Ort lag 8 m radial hinter dem Tor, ohne Neigungs- und Fels-
    // Probe). Ein Wagen, den die Welt hinstellt (`spawnArchitecture` ohne präzisen Ort: die Vorschau, „bau mir einen gt",
    // der Nexus), steht auf fahrbarem Grund (`_fahrPlatzFrei`); ist der gewünschte Ort keiner, wandert er zum nächsten in
    // Ringen um ihn (vehicle-core FAHR.platz: Schritt und Radius; je Ring der Umfang in Schritten, ab der Fahrt-Richtung —
    // deterministisch, jeder Peer gleich). Ein präziser Ort (Wiederherstellen, Mitspieler, das Phantom, die Linsen) bleibt
    // bit-treu. Trägt kein Ort im Radius, stellt die Welt den Wagen nicht hin (false; die Wurzel sagt „platz", das Log nennt
    // den Grund) — nie still auf den Fels. → true, wenn der Wagen steht (oder kein Studio-Wagen ist). Die Suche selbst ist
    // ein Weg in Schritten (`_fahrPlatzWege`): die Wurzel geht ihn ganz, die Vorschau im Takt (`_ensurePortalPreview`).
    _fahrPlatzSuche(entry) {
        const weg = this._fahrPlatzWege(entry);
        let r = weg.next();
        while (!r.done) r = weg.next();
        return r.value;
    }

    // Der Weg der Platz-Suche: je Ort ein Schritt (yield), am Ende true (der Wagen steht dort, Lage und Gier am Eintrag) oder
    // false (kein Platz im Radius).
    *_fahrPlatzWege(entry) {
        const fzg = this._fahrzeugGesetzFor(entry);
        if (!fzg || !fzg.drive || !fzg.drive.huelle) return true;
        entry._fahrAchseX = true; // Studio-Wagen: Bug +x (die Aufstandspunkte lesen das Gesetz)
        const prof = this._vehicleProfile(entry);
        const G = prof ? this._fahrSatz(entry, prof) : null;
        if (!G) return true;
        const P = AnazhRealm._fahrPlatzGesetz().P;
        const k = this._fahrHuelleBau(entry, G);
        const ry = (Number.isFinite(entry.rotationY) ? entry.rotationY : 0) + Math.PI / 2;
        const x0 = entry.position.x;
        const z0 = entry.position.z;
        const grund = this._fahrPlatzFrei(entry, G, k, x0, z0, ry);
        if (!grund) return true;
        for (let r = 0; r <= P.suchRadiusM + 1e-9; r += P.suchSchrittM) {
            const n = r === 0 ? 1 : Math.max(8, Math.round((2 * Math.PI * r) / P.suchSchrittM));
            for (let i = 0; i < n; i++) {
                yield r;
                const a = ry + (i / n) * 2 * Math.PI;
                const x = x0 + Math.sin(a) * r;
                const z = z0 + Math.cos(a) * r;
                for (let j = r === 0 ? 1 : 0; j < P.richtungen; j++) {
                    const rj = ry + (j / P.richtungen) * 2 * Math.PI;
                    const g = this._fahrPlatzFrei(entry, G, k, x, z, rj);
                    // zu steil ist der Grund, nicht die Richtung: die Fallinie der Ebene trägt keine Drehung weiter
                    if (g === "steil") break;
                    if (g) continue;
                    entry.position.x = x;
                    entry.position.z = z;
                    entry.rotationY = rj - Math.PI / 2; // Studio-Wagen: Template-Gier = Fahrt − π/2
                    this._blockerBewegt(entry); // im Bestand meldet er den neuen Platz (vor dem Eintritt: nichts zu melden)
                    this.log(
                        `Fahr-Platz: ${entry.type} steht ${r} m weiter auf fahrbarem Grund (dort: ${grund}).`,
                        "INFO"
                    );
                    return true;
                }
            }
        }
        this.log(
            `Fahr-Platz: kein fahrbarer Grund im Umkreis von ${P.suchRadiusM} m um (${x0.toFixed(1)}, ${z0.toFixed(1)}) — die Welt stellt ${entry.type} nicht hin (dort: ${grund}).`,
            "WARN"
        );
        return false;
    }

    // Steht der Wagen bei (x, z) in Fahrt-Richtung `ry` frei, und hat er eine BAHN? null = ja, sonst der Grund beim Namen:
    // der Stand dort (`_fahrStandFrei`) und derselbe Stand je bahnLaengen Wagenlängen vor und hinter ihm (vehicle-core
    // FAHR.platz) — er fährt in beide Richtungen los, ohne sofort anzustoßen. Die billige Probe zuerst (Lehre 25): die Ebene der
    // Räder an allen drei (vehicle-core fahrPlatz), erst dann die Welt des Wirts.
    _fahrPlatzFrei(entry, G, k, x, z, ry) {
        const { vc, P } = AnazhRealm._fahrPlatzGesetz();
        const L = (k.bug - k.heck) * P.bahnLaengen;
        const fX = Math.sin(ry);
        const fZ = Math.cos(ry);
        const boden = this._werkBoden(entry);
        const wo = (s) => (s === 0 ? "" : ` ${s > 0 ? "vor" : "hinter"} ihm`);
        const ebenen = [];
        for (const s of [0, 1, -1]) {
            const pl = vc.fahrPlatz(G, boden, x + fX * L * s, z + fZ * L * s, ry - Math.PI / 2);
            if (!pl.ok) return pl.grund + wo(s);
            ebenen.push(pl.eb);
        }
        for (let i = 0; i < 3; i++) {
            const s = [0, 1, -1][i];
            const g = this._fahrStandFrei(entry, k, x + fX * L * s, z + fZ * L * s, ry, ebenen[i]);
            if (g) return g + wo(s);
        }
        return null;
    }

    // Der STAND bei (x, z) auf der Ebene `eb` seiner Räder (vehicle-core fahrPlatz auf dem Boden des Werks, `_werkBoden` —
    // derselbe, auf dem `_fahrzeugStand` ihn danach abstellt und der Ritt ihn fährt; `_fahrPlatzFrei` fragt sie) in der Welt
    // des Wirts: E steigt ein (kein Tor reicht mit seiner E-Reichweite an einen Platz, von dem aus der Spieler
    // einsteigt — sonst betritt E das Tor: „bau mir einen gt" stand 5,3 m vor welt_portal), die Hülle steht auf dem Land
    // eines Werks (`_landAt`: die Mitte, dann die vier Ecken), keine Wand des Geländes unter der Hülle (5 × 3 Punkte — der
    // Fels, der in den Wagen ragt), keine Box eines Baus, Baums oder Wagens im Band der Hülle (der EINE Struktur-Löser mit der
    // Hülle als Körper, wie im Ritt), der Spieler nicht unter dem Wagen. Die Wand ist die des Kontakts (`_fahrGelaendeWand`
    // ohne Fahrt-Richtung: jede steile Fläche zählt). Die billigen Proben zuerst (Lehre 25).
    _fahrStandFrei(entry, k, x, z, ry, eb) {
        const torFrei = AnazhRealm.PORTAL_REACH_M + AnazhRealm.MOUNT_RANGE_M;
        for (const t of this._blockerMit("isPortal"))
            if (t.position && (t.position.x - x) ** 2 + (t.position.z - z) ** 2 < torFrei * torFrei) return "tor";
        const fX = Math.sin(ry);
        const fZ = Math.cos(ry);
        const qX = Math.cos(ry);
        const qZ = -Math.sin(ry);
        if (!this._landAt(x, z)) return "wasser";
        for (const l of [k.bug, k.heck])
            for (const q of [-k.hw, k.hw]) if (!this._landAt(x + l * fX + q * qX, z + l * fZ + q * qZ)) return "wasser";
        const tS = Math.tan(eb.steig);
        const tW = Math.tan(eb.wank);
        for (let i = 0; i <= 4; i++) {
            const l = k.heck + ((k.bug - k.heck) * i) / 4;
            for (const q of [-k.hw, 0, k.hw]) {
                const px = x + l * fX + q * qX;
                const pz = z + l * fZ + q * qZ;
                if (this._fahrGelaendeWand(px, pz, eb.y + tS * l + tW * q, k, 0, 0)) return "fels";
            }
        }
        const pm = this.state.playerMesh;
        if (pm && pm.position) {
            const dx = pm.position.x - (x + fX * k.mitte);
            const dz = pm.position.z - (z + fZ * k.mitte);
            const rS = AnazhRealm.PLAYER_WALL_RADIUS;
            if (Math.abs(dx * fX + dz * fZ) < k.hl + rS && Math.abs(dx * qX + dz * qZ) < k.hw + rS) return "spieler";
        }
        k.fX = fX;
        k.fZ = fZ;
        k.qX = qX;
        k.qZ = qZ;
        k.unten = eb.y + k.stufe;
        k.oben = eb.y + k.dach;
        k.schub.length = 0;
        k.schubQuelle.length = 0;
        const pos = this._fahrPlatzPos || (this._fahrPlatzPos = { x: 0, z: 0 });
        pos.x = x;
        pos.z = z;
        this._stepCharacterStructures(pos, 0, 0, 0, k);
        this._stepCharacterIslands(pos, 0, 0, 0, k);
        return k.schub.length ? "bau" : null;
    }
    // Siedlung als DATEN anfragen: der Worker rechnet exportSettlement und liefert reine Slot-Daten (kein
    // Mesh, kein Cache — ein deliberater Akt). Fail-closed: kein Worker/nicht ready → null. Dieselbe
    // pending-Map wie die Assets.
    // DIE TRASSE LIEST DAS GELÄNDE (siedlung.K3): `dp.ort` {x, z}, der Ort, an dem der Plan liegen wird, holt vor dem Export das
    // Höhen-Raster seines Rahmens (fachwerk `trasseRahmen`) aus dem Ort-Faden (`ort-raster`, gelaende-core `hoehenRaster`,
    // Lehre 14) als `dp.hoehe` — die Gassen des Exports folgen dem Grund dort (fachwerk `dorfLayout`). Ohne Ort (der Akt, dessen
    // Anker erst der Plan nennt; der Wege-Bau eines Alt-Saves) liegt der Plan auf ebenem Grund. Steht der Ort-Faden noch nicht, ist der
    // Export null wie bei kalter Foundry (der nächste Takt fragt neu; ein Wurf im Faden meldet sein `_bruchMelden`).
    _foundryRequestSettlement(dp, kopf) {
        const f = this._ensureAssetFoundry();
        if (!f || !f.ready || !f.worker) return Promise.resolve(null);
        const d = Object.assign({}, dp || {});
        const ort = d.ort;
        delete d.ort;
        const raster = ort
            ? this._nebenAuftrag("ort", {
                  type: "ort-raster",
                  x: ort.x,
                  z: ort.z,
                  rahmen: globalThis.__fachwerkCore.trasseRahmen(d.nH),
              }).then(
                  (r) => r.raster,
                  (e) => (
                      this.log(`SIEDLUNG: der Export wartet auf das Höhen-Raster — ${(e && e.message) || e}`, "INFO"),
                      false
                  )
              )
            : Promise.resolve(null);
        // Durch DIE EINE WORKER-SCHLANGE, sofort dran (ein deliberater Akt, reine Daten). Dieselbe EINE Frist (45 s
        // Arbeit): ohne Uhr hielte ein verlorener Export die FIFO-Uhr aller späteren Aufträge an.
        return raster.then((hoehe) => {
            if (hoehe === false) return null;
            if (hoehe) d.hoehe = hoehe;
            return this._foundryAuftrag(
                f,
                "stl-",
                { type: "export-settlement", dp: d },
                this._foundryRang(0, kopf), // das Start-Dorf ist ein Kopf der Ankunft (`_startDorfAmBuch`, die Bahn ohne Arbeit)
                45000,
                "FOUNDRY TIMEOUT: export-settlement nach 45 s Arbeit ohne Reply → null"
            );
        });
    }
    // DIE EINE SLOT-QUELLE: `_spawnSettlementFromExport` (der Akt) und `_tickAutoSettlement`
    // (über Ticks) heben jeden Slot hier. Blueprint-Name aus KIND_POLICY über den kind des LIVE-Rezepts
    // (prefix + kultur, kein "haus_"-Literal); die Spalten-Probe `_nassAt` über dem ganzen Fundament vor JEDEM Spawn; fehlender Blueprint/
    // fremde Kultur → Slot fällt GESCHLOSSEN aus. Γ5: aller Zufall lebt im Export, hier nur lesen +
    // platzieren (spawnArchitecture silent). Rückgabe true = platziert.
    // DIE BAU-WAND (Integration Welle L, Stufe kampf-maus): ein Haus landet nie IN einem bestehenden Bau, und vor seiner
    // Haustür bleibt der Zugang frei. Geprüft werden der Grundriss (haus-lokal Mitte {ox, oz}, halbe Maße {ex, ez}, Gier ry
    // um den Slot-Ort x/z) und der Vorplatz der Tür (1,2 m vor der Front −z, Türbreite) gegen die Hülle jedes Baus, der
    // nicht weicht (Natur und Würfe des Felds weichen dem Haus: `_weichtDemBau`, `_grundrissRaeumen`) — die Boxen über dem Boden des Hauses (Oberkante über
    // bodenY + Stufe), gedreht im Rahmen ihrer obb; ein Haus ohne gestempelte Hülle mit seinem Grundriss. Berührung ist kein
    // Überlapp (die Reihenhäuser einer Siedlung teilen ihre Wand). Seit „vor dir" vorn liegt (_blickVorn), gründet der
    // Chat-Akt „dorf" sein Dorf vor dem Spieler — an der Start-Plattform stand ein Haus 3,6 m tief in ihr (die Treppe
    // versperrt), ein zweites mit der Haustür an ihrer Wand (gate:haus-welt W1/W3/W7). Gibt false, wenn ein Bau im Weg ist.
    _bauFrei(x, z, ry, fp, tuer, bodenY) {
        const c = Math.cos(ry);
        const s = Math.sin(ry);
        const T = 0.05;
        const flaeche = (lx, lz, hx, hz) => ({ cx: x + lx * c + lz * s, cz: z - lx * s + lz * c, hx, hz, c, s });
        const flaechen = [flaeche(fp.ox, fp.oz, Math.max(0, fp.ex - T), Math.max(0, fp.ez - T))];
        if (tuer && Number.isFinite(tuer.x) && Number.isFinite(tuer.z) && Number.isFinite(tuer.w))
            flaechen.push(flaeche(tuer.x, tuer.z - 0.6, tuer.w / 2, 0.6 - T));
        const R = Math.hypot(fp.ex, fp.ez) + Math.hypot(fp.ox, fp.oz) + 2;
        const STEP = AnazhRealm.PLAYER_STEP_UP;
        const b2 = this._bauFreiBox || (this._bauFreiBox = { cx: 0, cz: 0, hx: 0, hz: 0, c: 1, s: 0 });
        const trifft = () => {
            for (const a of flaechen) if (this._rechteckeSchneiden(a, b2)) return true;
            return false;
        };
        // die Nähe aus dem Platz-Netz (`_blockerUmPlatz`: Ort ± Reichweite, eine Obermenge), nie der ganze Bestand — bis
        // stadt-erwachen fragte jede Laterne des Erwachens jeden Bau der Welt (nH 300: 104 × ~2 000)
        const nahe = this._bauFreiNahe || (this._bauFreiNahe = []);
        nahe.length = 0;
        for (const e of this._blockerUmPlatz(x, z, R + 8, nahe)) {
            if (!e || !e.position) continue;
            const r = R + (e._blockerReach || 0) + 8;
            if (Math.abs(e.position.x - x) > r || Math.abs(e.position.z - z) > r) continue;
            if (this._weichtDemBau(e)) continue; // Natur und die Würfe des Felds weichen dem Haus (`_naturRaeumen`)
            // Die Lichtung eines Baus (der Genesis-Platz: Scheibe und Ring der Tore, `_grundrissVon`) sperrt in jeder Höhe: ihr
            // Stein ist im Feld gestempelt, ein Haus fand dort „ebenen Boden" auf Höhe der Scheibe und stand auf ihr (der
            // Ersatz-Ort eines Slots an der Plattform: 6,0 m von ihrer Mitte, die Scheibe trägt 6,5 m); seit K52 steht kein Haus
            // zwischen den Toren.
            const gL = this._grundrissVon(e);
            if (gL && gL.lichtung) {
                b2.cx = e.position.x;
                b2.cz = e.position.z;
                b2.hx = gL.ex;
                b2.hz = gL.ez;
                b2.c = 1;
                b2.s = 0;
                if (trifft()) return false;
                continue;
            }
            const boxen = e.blockerAABBs;
            if (boxen && boxen.length) {
                for (const b of boxen) {
                    if (!(b.topY > bodenY + STEP)) continue;
                    const ob = b.obb;
                    if (ob) {
                        b2.cx = ob.cx;
                        b2.cz = ob.cz;
                        b2.hx = ob.hx;
                        b2.hz = ob.hz;
                        b2.c = ob.c;
                        b2.s = ob.s;
                    } else {
                        b2.cx = (b.minX + b.maxX) / 2;
                        b2.cz = (b.minZ + b.maxZ) / 2;
                        b2.hx = (b.maxX - b.minX) / 2;
                        b2.hz = (b.maxZ - b.minZ) / 2;
                        b2.c = 1;
                        b2.s = 0;
                    }
                    if (trifft()) return false;
                }
                continue;
            }
            // ein Werk ohne Boxen und Grundriss (der gepflanzte Baum, die Wiederkehr) sperrt seinen Fuß, wie die Natur-Wand ihn hält
            // (0,8 m, `_naturWand`) — es weicht keinem Haus, also steht keins auf ihm
            const g = this._grundrissVon(e) || (e.werk === true ? { ex: 0.8, ez: 0.8, ox: 0, oz: 0 } : null);
            if (!g) continue;
            const ery = Number.isFinite(e.rotationY) ? e.rotationY : 0;
            b2.c = Math.cos(ery);
            b2.s = Math.sin(ery);
            b2.cx = e.position.x + g.ox * b2.c + g.oz * b2.s;
            b2.cz = e.position.z - g.ox * b2.s + g.oz * b2.c;
            b2.hx = g.ex;
            b2.hz = g.ez;
            if (trifft()) return false;
        }
        return true;
    }

    // Die Bau-Wand für einen runden Bau des Dorfs (Brunnen, Laterne, Marktstand): das Quadrat in seinem Fußabdruck-Kreis
    // (Radius aus dem Bauplan) — ein Nachbar, der den Kreis nur streift, sperrt nicht. Den Häusern seines eigenen Plans weicht
    // die Ausstattung im Plan (fachwerk `brunnenWeicht`, S4-N4), nie hier.
    _bauFreiRund(type, x, z, bodenY) {
        const R = Math.max(0.5, (this._blueprintFootprintRadius(type, 1) || 0) * Math.SQRT1_2);
        return this._bauFrei(x, z, 0, { ex: R, ez: R, ox: 0, oz: 0 }, null, bodenY);
    }

    // Schneiden sich zwei gedrehte Rechtecke der Ebene? Je Rechteck Mitte {cx, cz}, halbe Maße {hx, hz} und die Drehung
    // {c, s} im Rahmen der Hülle (lokal → Welt: x = cx + lx·c + lz·s, z = cz − lx·s + lz·c; dieselbe wie `box.obb`).
    // Trennende Achsen: die vier Kanten-Richtungen; Berührung zählt nicht.
    _rechteckeSchneiden(a, b) {
        const dx = b.cx - a.cx;
        const dz = b.cz - a.cz;
        for (let i = 0; i < 4; i++) {
            const R = i < 2 ? a : b;
            const nx = i % 2 === 0 ? R.c : R.s;
            const nz = i % 2 === 0 ? -R.s : R.c;
            const ra = a.hx * Math.abs(a.c * nx - a.s * nz) + a.hz * Math.abs(a.s * nx + a.c * nz);
            const rb = b.hx * Math.abs(b.c * nx - b.s * nz) + b.hz * Math.abs(b.s * nx + b.c * nz);
            if (Math.abs(dx * nx + dz * nz) >= ra + rb) return false;
        }
        return true;
    }

    // DAS EINE RASTER EINES FUNDAMENTS (bau-lokal, [lx, lz, flaeche]): die Fläche des Grundrisses `fp` {ex, ez, ox, oz} in
    // Schritten ≤ 2 m samt ihren Kanten (flaeche true) und der Vorplatz der Haustür `tuer` (0,25 m und 1 m vor der Front −z,
    // je drei Punkte über die Türbreite; flaeche false). Integration Welle L: vier Ecken und die Mitte ließen den Buckel
    // zwischen sich durch — an einer Kuppe der Front lag die Haustür 2,9 m unter dem Gelände (gate:haus-welt W1). Leser: die
    // Höhe der Siedlung (`_spawnSettlementSlot`) und das Land jedes Fundaments (`_fundamentLand`).
    // `schritt` (m, Vorgabe 2): die Höhe misst Buckel in 2 m, das Land misst die Wasserlinie in 1 m (werk-ufer: zwischen
    // den 2-m-Punkten lag die Linie 0,85 m tief im Grundriss, das Haus am Gleithang stand 0,27 m im Wasser — Z misst ≤ 1 m).
    static _fundamentRaster(fp, tuer, schritt = 2) {
        const out = [];
        if (!fp || !Number.isFinite(fp.ex) || !Number.isFinite(fp.ez) || !(fp.ex > 0) || !(fp.ez > 0)) return out;
        const ox = Number.isFinite(fp.ox) ? fp.ox : 0;
        const oz = Number.isFinite(fp.oz) ? fp.oz : 0;
        const deckel = Math.ceil(24 / schritt);
        const nx = Math.min(deckel, Math.max(1, Math.ceil((2 * fp.ex) / schritt)));
        const nz = Math.min(deckel, Math.max(1, Math.ceil((2 * fp.ez) / schritt)));
        for (let i = 0; i <= nx; i++)
            for (let j = 0; j <= nz; j++)
                out.push([ox + fp.ex * ((2 * i) / nx - 1), oz + fp.ez * ((2 * j) / nz - 1), true]);
        if (tuer && Number.isFinite(tuer.x) && Number.isFinite(tuer.z) && Number.isFinite(tuer.w))
            for (let i = -1; i <= 1; i++) {
                out.push([tuer.x + (i * tuer.w) / 2, tuer.z - 0.25, false]);
                out.push([tuer.x + (i * tuer.w) / 2, tuer.z - 1, false]);
            }
        return out;
    }

    _spawnSettlementSlot(slot, origin, f, so) {
        if (!slot || typeof slot.kultur !== "string" || !origin) return false;
        // DER BODEN DES PLANS (K10): der Slot trägt seine Höhe `y` aus dem Plan v2 (fachwerk `ortPlan`, `_ortPlanSetzen`) — die
        // Welt erfindet keine Höhe mehr: die hMax-Suche über das Raster, das Podest, die Klippen-Wand und die Ersatz-Orte fielen,
        // der Erdbau des Orts trägt das Haus. Ein Slot ohne y fällt geschlossen und laut.
        if (!Number.isFinite(slot.y)) {
            this.log(
                `SIEDLUNG: der Slot „${slot.kultur}" trägt keinen Boden y — der Plan v2 fehlt (fail-closed)`,
                "ERROR"
            );
            return false;
        }
        const wx = origin.x + slot.x;
        const wz = origin.z + slot.z;
        // DER GRUND FÄLLT MIT DEM SLOT (S4): der Erdbau des Orts trägt den Grund jedes Hauses seines Plans (`ortPlan`); fällt
        // der Slot geschlossen, fällt sein Grund wie beim Abbau (`_erdbauGrundFaellt`) — die Platte des Plans bleibt. Bis S4-N3
        // blieb er: am Start-Dorf schnitt der Grund des Alpenchalets, das am Brunnen des eigenen Plans fällt (Bau-Wand), ein
        // Loch ins Leere (53,7/108,4, gate:haus-welt W9 Waise).
        const zu = () => (this._erdbauGrundFaellt({ position: { x: wx, z: wz } }), false);
        const name = this._slotBauplan(slot, f);
        if (!name) return zu(); // fail-closed
        const ry = slot.phi || 0;
        const tu = slot.tuer;
        const fp = this._grundrissVon(slot);
        // DIE WASSER-WAND über dem ganzen Grundriss und dem Vorplatz der Tür (`_fundamentLand`, die EINE Probe mit der Wand
        // jedes Werks) und DIE BAU-WAND (kein Haus IN einem bestehenden Bau, keine Haustür an dessen Wand, `_bauFrei`): der
        // Slot fällt an seinem Ort geschlossen — der Plan ist das Dorf, die Welt rückt kein Haus.
        if (!this._fundamentLand(wx, wz, ry, fp, tu, (fp && fp.saum) || 0)) return zu();
        if (!this._bauFrei(wx, wz, ry, fp || { ex: 0.5, ez: 0.5, ox: 0, oz: 0 }, tu, slot.y)) return zu();
        // DIE WANDLATERNEN DES HAUSES (K66-2): die Laternen des Plans mit seinem Slot (`so.plan`, `so.si`) hängen an seiner
        // Wand — ihre Wasser- und Bau-Wand fragt VOR dem Haus (das eigene Haus sperrt sie nie), sie stehen NACH ihm. Bis
        // K66-2 Nachbesserung hob der Dorf-Akt sie vor den Häusern: die Laterne sperrte ihr eigenes Haus (Auto-Dorf 13/16).
        const wand = [];
        if (so && so.plan && Array.isArray(so.plan.laternen))
            so.plan.laternen.forEach((l, k) => {
                if (!l || !l.wand || l.slot !== so.si) return;
                const ort = this._dorfLaterneOrt(l, origin);
                if (ort) wand.push([l, ort, k]);
            });
        const wy = slot.y + 0.5; // der Bauplan-Boden liegt 0,5 m unter dem Ursprung (`_archEntryWorldMatrix` baseY)
        // AUSLÖSCHUNGS-WELLE — `autonomous` reist durch (spawn_village vom Nexus →
        // die Häuser zählen in den Nexus-Cap, die V18.297-Hort-Lehre).
        const entry = this.spawnArchitecture(
            name,
            { x: wx, y: wy, z: wz },
            {
                seed: slot.seed >>> 0,
                rotationY: slot.phi || 0,
                silent: true,
                autonomous: !!(so && so.autonomous),
                ausGesetz: true, // der Bau eines Orts kehrt aus dessen Gedächtnis wieder (speicher.K3), der Stand trägt ihn nie
                // das Fundament des Hauses eines Orts (die obb des Exports; ein fremder Export ohne obb trägt keins)
                fundament: fp && fp.saum ? { ex: fp.ex, ez: fp.ez, ox: fp.ox, oz: fp.oz } : null,
                // DORF-ERLEBNIS — die Tür-Zeile des Exports (Blocker-Tür-Lücke +
                // Flügel-Reichweite; alte Exporte ohne Feld → undefined, byte-alt).
                tuer: slot.tuer || undefined,
                // KAMIN-RAUCH (.105): Spitze haus-lokal (exportSettlement) — rauchQuelle; null ist das Nein des Exports
                // (kein Kamin: der Host baut das Haus nicht nach), ein Alt-Export ohne Feld bleibt undefined
                chimney: slot.chimney,
                // Das Slot-Rezept (exportSettlement ov) reist als Guss-Stempel: die Optik baut aus DERSELBEN Wahrheit
                // wie Blocker/ext (ov überstimmt den Kultur-Default). Alt-Exporte ohne ov: must-ignore.
                studioOv: slot.ov && typeof slot.ov === "object" ? slot.ov : undefined,
            }
        );
        if (entry) for (const [l, ort, k] of wand) this._dorfLaterneSetzen(so.plan, l, ort, k, so);
        return entry || zu(); // das gesetzte Haus (die Dorf-Mitte summiert, wo es steht)
    }
    // DER ORT EINER LATERNE DES PLANS (K10 × K11 × K66-2): die Studio-Gestalt (Bauplan `laterne_dorf` bzw. mit `wand` die
    // Wandlaterne `wandlaterne_dorf`, ihr Licht LICHT_GESETZ.wandlaterne) am Anker, hinter Wasser- und Bau-Wand — die
    // Wandlaterne hängt vor der Wand, die Bau-Wand prüft nur ihren Kopf (der Rund-Fußabdruck reichte in die eigene Wand).
    // Null, wo sie nicht stehen darf. Leser: `_spawnSettlementErlebnis` (der Mast) und `_spawnSettlementSlot` (die Wand).
    _dorfLaterneOrt(l, origin) {
        if (!l || !Number.isFinite(l.x) || !Number.isFinite(l.z)) return null;
        const typ = l.wand ? "wandlaterne_dorf" : "laterne_dorf";
        if (!this.state.blueprints || !this.state.blueprints[typ]) return null;
        const wx = origin.x + l.x;
        const wz = origin.z + l.z;
        if (!this._landAt(wx, wz, 0.2)) return null;
        const wy = this.getTerrainHeightAt(wx, wz);
        if (!Number.isFinite(wy)) return null;
        const frei = l.wand
            ? this._bauFrei(wx, wz, 0, { ex: 0.1, ez: 0.1, ox: 0, oz: 0 }, null, wy)
            : this._bauFreiRund(typ, wx, wz, wy);
        return frei ? { typ, x: wx, y: wy + 0.5, z: wz } : null; // die Bau-Wand: nie in einem Bau
    }
    // Die Laterne des Plans steht: Same je Siedlung und Nummer `k`, gedreht nach ihrem Plan (`th`).
    _dorfLaterneSetzen(plan, l, ort, k, so) {
        return this.spawnArchitecture(
            ort.typ,
            { x: ort.x, y: ort.y, z: ort.z },
            {
                seed: this._ausstattungSame(plan, "laterne", k),
                rotationY: Number.isFinite(l.th) ? -l.th : 0,
                silent: true,
                autonomous: !!(so && so.autonomous),
                ausGesetz: true,
            }
        );
    }
    // DER SAME EINES STÜCKS DER AUSSTATTUNG (Laterne · Brunnen · Stand · Hof-Baum): je Siedlung, Art und Nummer `k` im Plan
    // (`ORT_AUSSTATTUNG`) — der Leser ist das Erlebnis (`_dorfErlebnis`, `_dorfLaterneSetzen`) und sein Abbau
    // (`_ortAusstattungFaellt`)
    _ausstattungSame(plan, art, k) {
        return ((plan.seed >>> 0 || 1) + AnazhRealm.ORT_AUSSTATTUNG[art].ab + k * 7919) >>> 0;
    }
    // DIE AUSSTATTUNG FÄLLT (siedlung.K4 Staffel 2): jede Laterne, jeder Brunnen, Stand und Hof-Baum des Plans `plan` (ihre
    // Samen, in seiner Welt am Ort) — der Plan seines neuen Jahrs stellt sie neu (`_dorfErlebnis`): ihre Nummern wechseln mit ihm.
    // Die Wandlaterne hängt an ihrem Haus und steht nur mit ihm (`_spawnSettlementSlot`): sie fällt nur an einem Haus aus `weg`
    // ({x, z, r}: die gefallenen Häuser, r ihre Reichweite).
    _ortAusstattungFaellt(plan, weg) {
        const [A, S, o, w] = [AnazhRealm.ORT_AUSSTATTUNG, new Set(), plan.ort, plan.welt];
        for (const art in A)
            for (let k = 0; k < (A[art].kappe || (plan.laternen || []).length); k++)
                S.add(this._ausstattungSame(plan, art, k));
        for (const e of this.state.architectures.slice()) {
            const p = e && e._ausGesetz && S.has(e.seed >>> 0) && e.position;
            if (!p || p.x < o.x + w.x0 || p.x > o.x + w.x1 || p.z < o.z + w.z0 || p.z > o.z + w.z1) continue;
            if (e.type !== "wandlaterne_dorf" || weg.some((h) => Math.hypot(h.x - p.x, h.z - p.z) <= h.r))
                this.removeArchitecture(e, { still: true });
        }
    }
    // ═══ DORF-ERLEBNIS: der EINE Hebe-Chokepoint für die Nicht-Haus-Schichten des Exports ═══
    // Wege/Feldwege/Platz → Wege-Pool (`_stlWegeBuild`, dieselbe Höhen-Quelle wie die Häuser); Brunnen
    // über `spawnArchitecture` (Bauplan `brunnen_dorf`). Aufrufer: `spawnSettlement` ·
    // `_autoSettlementSpawnCell` · die Wiederkehr nach dem Reload (`_tickAutoSettlement`: der Stand trägt keinen Bau eines Orts).
    // Konsum: fences/felder/trees/staende/brunnen/laternen (die Studio-Gestalt `laterne_dorf`, ihr Licht das Datum ihres
    // Rezepts); unkonsumiert (export-stripped): mauer/fluss. Die Schichten gehen in EINEM Zug (der Akt, der Wege-Neubau).
    _spawnSettlementErlebnis(plan, origin, so) {
        for (const g = this._dorfErlebnis(plan, origin, so); !g.next().done;);
    }
    // DAS ERLEBNIS IN RATEN (stadt-erwachen, Lehre 14): die Schichten des Plans als Gang — je Schritt EINE Rate: die Bewohner
    // und die Wege, je `AUTO_SETTLEMENT.laternenJeTakt` Laternen, die Ausstattung (Brunnen, Stände, Hof-Bäume); dieselbe Folge
    // und dieselben Samen in Raten (der Dorf-Zug des Erwachens, `_dorfErwachen`) wie in einem Zug.
    *_dorfErlebnis(plan, origin, so) {
        if (!plan || !origin) return;
        this._bewohnerMelden(plan, origin, so && so.key ? so.key : null); // die Bewohner des Plans (`_tickBewohner`)
        this._stlWegeBuild(plan, origin, so && so.key ? so.key : null);
        yield;
        // DIE LATERNEN (K10 × K11): jede Laterne des Plans steht als Studio-Gestalt (Bauplan `laterne_dorf`, fachwerk
        // AUSSTATTUNG `laterne`) — der Leib und das Licht EINER Quelle: das Verzeichnis „licht" stempelt den Eintrag aus dem
        // Datum seines Rezepts (`_lichtDatumDerGestalt`), der Licht-Takt liest ihn wie jede Feuerstelle. Keine Kappe: das
        // Gesetz des Plans setzt die Zahl (je Platz eine, je 25 m Weg eine); Wasser- und Bau-Wand wie der Brunnen. Die Laterne
        // des Plans mit `wand` (K66-2) ist die Wandlaterne: sie hängt an der Wand ihres Hauses und steht MIT ihm
        // (`_spawnSettlementSlot`), nie hier.
        if (Array.isArray(plan.laternen)) {
            let k = 0;
            let j = 0;
            for (const l of plan.laternen) {
                if (!l || l.wand) continue;
                const belegt =
                    Number.isFinite(l.x) &&
                    this._dorfBelegt(origin.x + l.x, origin.z + l.z, this._ausstattungSame(plan, "laterne", k));
                const ort = belegt ? null : this._dorfLaterneOrt(l, origin);
                if (belegt) k++;
                else if (ort) this._dorfLaterneSetzen(plan, l, ort, k++, so);
                if (++j % AnazhRealm.AUTO_SETTLEMENT.laternenJeTakt === 0) yield;
            }
            if (j % AnazhRealm.AUTO_SETTLEMENT.laternenJeTakt) yield;
        }
        if (!Array.isArray(plan.brunnen) || !this.state.blueprints || !this.state.blueprints.brunnen_dorf) return;
        const AU = AnazhRealm.ORT_AUSSTATTUNG;
        let n = 0;
        for (const b of plan.brunnen) {
            if (n >= AU.brunnen.kappe) break; // Kappe (Kernel-Brunnen + je 8 Häuser einer)
            if (!b || !Number.isFinite(b.x) || !Number.isFinite(b.z)) continue;
            const wx = origin.x + b.x;
            const wz = origin.z + b.z;
            const same = this._ausstattungSame(plan, "brunnen", n); // deterministisch je Siedlung+Platz
            if (this._dorfBelegt(wx, wz, same) && ++n) continue;
            if (!this._landAt(wx, wz, 0.2)) continue; // die Wasser-Wand (EINE Quelle)
            const wy = this.getTerrainHeightAt(wx, wz);
            if (!Number.isFinite(wy)) continue;
            if (!this._bauFreiRund("brunnen_dorf", wx, wz, wy)) continue; // die Bau-Wand: nie in einem Bau
            const entry = this.spawnArchitecture(
                "brunnen_dorf",
                { x: wx, y: wy + 0.5, z: wz },
                { seed: same, silent: true, autonomous: !!(so && so.autonomous), ausGesetz: true }
            );
            if (entry) n++;
        }
        // SCHICHT-VOLLENDUNG (18.07.) — DIE MARKTSTÄNDE (staende-Schicht, nur
        // Markt-Plätze): das brunnen_dorf-Muster — builtIn-Bauplan, der EINE
        // Chokepoint, Kappe 3, Wasser-Wand, deterministisch je Siedlung+Platz.
        if (Array.isArray(plan.staende) && this.state.blueprints && this.state.blueprints.marktstand_dorf) {
            let m = 0;
            for (const st of plan.staende) {
                if (m >= AU.stand.kappe) break;
                if (!st || !Number.isFinite(st.x) || !Number.isFinite(st.z)) continue;
                const wx = origin.x + st.x;
                const wz = origin.z + st.z;
                const same = this._ausstattungSame(plan, "stand", m);
                if (this._dorfBelegt(wx, wz, same) && ++m) continue;
                if (!this._landAt(wx, wz, 0.2)) continue;
                const wy = this.getTerrainHeightAt(wx, wz);
                if (!Number.isFinite(wy)) continue;
                if (!this._bauFreiRund("marktstand_dorf", wx, wz, wy)) continue; // die Bau-Wand: nie in einem Bau
                // Die Front (−z des Gesetzbuch-Stands) schaut zur Platz-Mitte — dieselbe Regel wie das Labor-Dorf.
                const pz = plan.platz;
                const entry = this.spawnArchitecture(
                    "marktstand_dorf",
                    { x: wx, y: wy + 0.5, z: wz },
                    {
                        seed: same,
                        rotationY: pz && Number.isFinite(pz.cx) ? Math.atan2(-(pz.cx - st.x), -(pz.cz - st.z)) : 0,
                        silent: true,
                        autonomous: !!(so && so.autonomous),
                        ausGesetz: true,
                    }
                );
                if (entry) m++;
            }
        }
        // Hof-Bäume der Siedlung: die Export-Plätze ({x,z,h}) heben als Studio-Bäume durch spawnArchitecture;
        // h skaliert auf die Export-Höhe (eiche fx.height 6.2). Kappe 12 (Architektur-LOD/Instanzen-Budget),
        // Wasser-Wand, deterministisch je Siedlung + Platz.
        const baumArten = ["baum_eiche", "baum_birke"];
        let t = 0;
        for (const b of Array.isArray(plan.trees) ? plan.trees : []) {
            if (t >= AU.baum.kappe) break;
            if (!b || !Number.isFinite(b.x) || !Number.isFinite(b.z)) continue;
            const wx = origin.x + b.x;
            const wz = origin.z + b.z;
            const seedT = this._ausstattungSame(plan, "baum", t);
            if (this._dorfBelegt(wx, wz, seedT) && ++t) continue;
            if (!this._landAt(wx, wz, 0.2)) continue;
            const wy = this.getTerrainHeightAt(wx, wz);
            if (!Number.isFinite(wy)) continue;
            const art = baumArten[seedT % baumArten.length];
            // der Hof-Baum geht durch DENSELBEN Grundriss-Chokepoint wie jeder Wurf der Natur (`_naturSetzen`)
            const entry = this._naturSetzen(
                art,
                { x: wx, y: wy, z: wz },
                {
                    seed: seedT,
                    scale: Math.max(0.35, Math.min(0.8, (Number.isFinite(b.h) ? b.h : 3.4) / 6.2)),
                    rotationY: ((seedT >>> 3) % 628) / 100,
                    silent: true,
                    autonomous: !!(so && so.autonomous),
                    ausGesetz: true,
                }
            );
            if (entry) t++;
        }
        yield;
    }

    // DER AKT HEBT ÜBER DEN ZUG (siedlung.K5): die Slots des Plans v2 in seiner Folge (vom Platz nach außen), je Schritt des
    // Zugs (`_dorfZugSchritt`) ein Bild — das erste zeigt das erste Haus. Bis K5
    // hob der Akt alle Slots in EINER Aufgabe (nH 120: 123 Häuser, 410 ms bis zum ersten Bild). Rückgabe: Promise der Bilanz.
    async _spawnSettlementFromExport(plan, origin, so) {
        if (!plan || !Array.isArray(plan.slots) || !origin) return { placed: 0, skipped: 0, mitte: null };
        plan = this._ortPlanSetzen(plan, origin); // der Ort auf dem Gelände (K10): jeder Slot trägt seinen Boden
        // DIE EINE REIHE (`_dorfZug`): der Schirm zuerst, darin das nächste — bis siedlung-k5-nah hob der Akt in der Slot-Folge
        const q = Object.assign(this._dorfZug(plan, origin, null), { so: { autonomous: !!(so && so.autonomous) } });
        let placed = 0;
        let skipped = 0;
        let mx = 0;
        let mz = 0;
        const haeuser = [];
        for (;;) {
            // das gesetzte Haus (`_spawnSettlementSlot`): am Anker + seinem Slot, auf dem Boden des Plans (K10), mit seinen
            // Wandlaternen (K66-2: `plan` + `si`)
            for (const haus of this._dorfZugSchritt(q, !!this.state._frameOverBudget)) {
                if (haus) {
                    placed++;
                    haeuser.push(haus);
                    mx += haus.position.x;
                    mz += haus.position.z;
                } else skipped++;
            }
            if (q.idx >= plan.slots.length) break;
            await new Promise((weiter) => requestAnimationFrame(weiter)); // der nächste Schritt nach dem Bild, das ihn zeigt
        }
        // die Mitte der gesetzten Häuser — dorthin schaut, wer das Dorf verlangt hat (`_nachDorfOrientieren`)
        const mitte = placed ? { x: mx / placed, z: mz / placed } : null;
        return {
            placed,
            skipped,
            name: plan.name || null,
            groesse: plan.groesse || null,
            mitte,
            haeuser,
        };
    }

    // DAS DORF VOR DIR (Leben-Schau 07.10.: „dorf 7 18" umringte den Spieler — die Mitte 16 m bei cos +0,56, die drei
    // nächsten Häuser HINTER ihm, cos −1,00 / −0,48 / −0,12): der Anker kam aus der Klemme `_structureSpawnPos` mit dem
    // geschätzten Fußabdruck „haus_basis × 3", der Plan des Studios reichte weiter. Jetzt misst der Akt den Plan selbst
    // (Slot-Orte + obb-Reichweite) und legt ihn in den BLICKKEGEL: die Achse ist die EINE Vorwärts-Richtung (`_blickVorn`;
    // mit verlangtem Ort die Richtung zu ihm), die Mitte der Häuser liegt auf ihr, und der Plan rückt genau so weit vor, dass
    // jedes Haus mit seiner Reichweite `STRUCTURE_PLAYER_CLEAR_MARGIN` vor dem Spieler und im Bildwinkel der Welt-Kamera
    // steht — so nah wie möglich, nie um ihn. Ein verlangter Ort, dessen Häuser den Spieler nicht
    // berühren, bleibt, wie er ist. Gibt den Plan-Ursprung (der Bezug der Slot-Orte), die Mitte und den Radius zurück.
    // `blick` {gier, tanH} (das Programm eines Sprechers, „baue dorf hier"): der Sprecher steht am verlangten Ort und blickt
    // mit SEINER Gier durch SEINEN Bildwinkel — der Anker hängt dann an keinem Zustand des ausführenden Peers (Spieler,
    // Blick, Fenster), jeder baut dasselbe Dorf an derselben Stelle (Gegenprüfung Runde 1: ~60 m Versatz).
    _siedlungsAnker(plan, wunsch, blick) {
        const pm = this.state.playerMesh;
        const haeuser = [];
        let cx = 0;
        let cz = 0;
        for (const s of plan.slots || []) {
            if (!s || !Number.isFinite(s.x) || !Number.isFinite(s.z)) continue;
            const o = s.obb;
            haeuser.push([s.x, s.z, o && Number.isFinite(o.ex) && Number.isFinite(o.ez) ? Math.hypot(o.ex, o.ez) : 6]);
            cx += s.x;
            cz += s.z;
        }
        if (haeuser.length) {
            cx /= haeuser.length;
            cz /= haeuser.length;
        }
        let R = 0;
        for (const [x, z, reich] of haeuser) R = Math.max(R, Math.hypot(x - cx, z - cz) + reich);
        const ergebnis = (x, z, y) => {
            const h = this.getTerrainHeightAt(x, z);
            return { x, y: Number.isFinite(h) ? h : y, z, radius: R, mitte: { x: x + cx, z: z + cz } };
        };
        const sprecher = blick && wunsch && Number.isFinite(blick.gier);
        if (!pm && !sprecher) return ergebnis(wunsch.x, wunsch.z, wunsch.y);
        // der Blickende: der Sprecher am verlangten Ort (sein Programm trägt den Blick) oder der eigene Spieler
        const p = sprecher ? wunsch : pm.position;
        const M = AnazhRealm.STRUCTURE_PLAYER_CLEAR_MARGIN;
        let vx;
        let vz;
        if (wunsch && !sprecher) {
            const dx = wunsch.x + cx - p.x;
            const dz = wunsch.z + cz - p.z;
            const d = Math.hypot(dx, dz);
            if (d >= R + M) return ergebnis(wunsch.x, wunsch.z, wunsch.y); // der Ort berührt den Spieler nicht
            if (d > 1e-3) {
                vx = dx / d;
                vz = dz / d;
            }
        }
        if (vx === undefined) {
            const vorn = this._blickVorn(sprecher ? blick.gier : this.state.yaw, 0);
            const l = Math.hypot(vorn.x, vorn.z) || 1;
            vx = vorn.x / l;
            vz = vorn.z / l;
        }
        // Der Bildwinkel (horizontal, aus fov und Seitenverhältnis) — der des Sprechers, sonst der Welt-Kamera; vom
        // Blickenden aus gemessen (die 3rd-Kamera steht hinter ihm und sieht weiter).
        const cam = this.state.camera;
        const fov = cam && Number.isFinite(cam.fov) ? cam.fov : 75;
        const asp = cam && Number.isFinite(cam.aspect) && cam.aspect > 0 ? cam.aspect : 16 / 9;
        const tanH = sprecher && blick.tanH > 0 ? blick.tanH : Math.tan((fov * Math.PI) / 360) * asp;
        // je Haus: vorn f (längs der Achse) und quer q (um die Mitte); die Mitte rückt um t vor, bis f + t − Reichweite
        // ≥ max(M, |q| / tanH) für jedes Haus gilt.
        let t = 0;
        for (const [x, z, reich] of haeuser) {
            const f = (x - cx) * vx + (z - cz) * vz;
            const q = (x - cx) * vz - (z - cz) * vx;
            t = Math.max(t, Math.max(M, Math.abs(q) / tanH) - f + reich);
        }
        return ergebnis(p.x + vx * t - cx, p.z + vz * t - cz, p.y);
    }
    // spawnSettlement (unten) — der Siedlungs-Akt (Chat „dorf [seed] [n]", DSL `spawn_village` je Quelle, Gate): Samen
    // Γ5-treu aus dem Welt-Seed-Stream (Suffix ":stadt", nie Math.random), Export vom Worker, Platzierung
    // am ANKER, den der Plan selbst misst (`_siedlungsAnker`): vor dem Spieler, nie um ihn. Async — der Rückweg
    // meldet ins Chat-Log.

    // WER VERLANGT? Die DSL-Quelle eines Akts (`ctx.source`): der Spieler selbst — „human" (sein Chat, der Befehl „dorf"),
    // seine Werkzeuge (`AnazhRealm.SPIELER_QUELLEN`: die Fähigkeit per Taste „ability:<name>", das Wirken „capability:<key>",
    // der Verzehr „consume:<bauplan>") — und der Begleiter, der seinen Satz ausführt („llm:<name>"); Nexus, Welt-Regeln,
    // Resonanz und Mitspieler („remote-…") handeln für die Welt, nicht für ihn.
    _spielerVerlangt(quelle) {
        if (quelle === "human") return true;
        if (typeof quelle !== "string") return false;
        for (const vor of AnazhRealm.SPIELER_QUELLEN) if (quelle.startsWith(vor)) return true;
        return false;
    }

    // Nach einem Dorf-Spawn: hat der SPIELER das Dorf verlangt (`verlangt`, die Quelle des Akts), schaut er auf die Mitte
    // DIESES Dorfs (`res.mitte`, die gesetzten Häuser; ohne sie der Anker) — ein Nexus- oder Welt-Dorf lässt seinen Blick
    // stehen (OMEN 0710-6, Boot 4B: ein Nexus-Dorf drehte die Gier mitten im Lauf auf −2,745; und der Blick zielte auf den
    // Schwerpunkt ALLER Häuser der Welt, gate:settlement C7). Dazu die Bauten-Zeile und das nächste Haus sofort gemesht.
    _nachDorfOrientieren(res, verlangt) {
        try {
            const list = (this.state && this.state.architectures) || [];
            // die Häuser DIESES Dorfs: die eben gesetzten (`res.haeuser`, ihre Mitte `res.mitte`) — nie die Mitte aller Häuser
            // der Welt (ein Auto-Dorf 300 m weiter drehte den Blick vom neuen Dorf weg), nie ein Kreis um den Anker (er fing die
            // Häuser eines Nachbar-Dorfs mit); ohne gesetztes Haus kein Blick
            const houses = (res && res.haeuser) || [];
            const pm = this.state && this.state.playerMesh;
            const ziel = res && res.mitte;
            if (pm && ziel && this._spielerVerlangt(verlangt)) {
                const dx = ziel.x - pm.position.x;
                const dz = ziel.z - pm.position.z;
                if (Math.hypot(dx, dz) > 0.5) {
                    // der Blick zum Dorf (die Umkehrung der EINEN Vorwärts-Richtung)
                    this.state.yaw = this._blickGierZu(dx, dz);
                }
            }
            const nHaus = houses.length;
            let nZiegel = 0;
            let nearest = null;
            for (const e of houses) {
                if (e._ziegelSlot) nZiegel++;
                if (!pm) continue;
                const d = Math.hypot(e.position.x - pm.position.x, e.position.z - pm.position.z);
                if (!nearest || d < nearest.d) nearest = { d, e };
            }
            const zeile = nearest
                ? `Bauten n=${list.length} haus=${nHaus} ziegel=${nZiegel} nah=${nearest.e.type} @${Math.round(nearest.e.position.x)}/${Math.round(nearest.e.position.y)}/${Math.round(nearest.e.position.z)} d=${Math.round(nearest.d)}m`
                : `Bauten n=${list.length} haus=${nHaus} ziegel=${nZiegel} placed=${res && res.placed}`;
            // Die Zählung ist Entwickler-Telemetrie: sie geht ins Log, nie in den Spieler-Chat (Befund V-D8: „Bauten
            // n=330 haus=21 ziegel=10 nah=… d=10m" nach jeder Dorf-Gründung).
            this.log(zeile, "INFO");
            // Hand-Dichte: nächstes haus_ sofort meshen (nicht auf Cull-Budget warten)
            if (nearest && nearest.e && typeof this._rebuildArchitectureMesh === "function") {
                try {
                    this._rebuildArchitectureMesh(nearest.e);
                    if (nearest.e.mesh) nearest.e.mesh.visible = true;
                    this._archZiegelFern?.(nearest.e);
                } catch (_r) {
                    this._stoffBruch("das Dorf-Haus (Neubau nach der Orientierung)", _r);
                }
            }
        } catch (_e) {
            this._stoffBruch("die Dorf-Orientierung", _e);
        }
    }

    // DAS DORF IM FLUG (stand-treue): ein Akt — Chat, Feld, Nexus — ist offen vom Auftrag bis zum letzten Haus (Export, Ort-Wahl
    // im Faden, Zug über die Bilder); `_weltOffen` zählt ihn (`_dorfOffen`). Vorher „stand" die Welt während der Ort-Wahl, und
    // die Häuser des Nexus kamen in die Runde der Stufen-Wahl (CI 39767254768: archLod 2288 → 2294 mit den Tätern).
    spawnSettlement(opts) {
        this._dorfImFlug = (this._dorfImFlug | 0) + 1;
        const ende = () => this._dorfImFlug--;
        const akt = this._dorfAkt(opts);
        akt.then(ende, ende);
        return akt;
    }
    // Was das Dorf noch baut: die Akte im Flug und die Häuser des Zugs im Takt (und sein Gang, `_dorfErlebnis`) samt dem Export
    // ihrer Zelle (`_tickAutoSettlement`)
    // — der Zug nur, solange sein Takt lebt (`_dorfTaktLebt`, dasselbe Urteil wie der Term „dorf" des ersten Weltbilds): ein Ort
    // ohne Dorf-Zug hält ihn an, und ein Zug, den kein Takt baut, hielt die Welt ewig offen (CI 39780312347: „Dorf offen 18").
    _dorfOffen() {
        const q = this._dorfTaktLebt() && this._autoSettlementQueue;
        const zug =
            q && q.plan && Array.isArray(q.plan.slots) ? Math.max(0, q.plan.slots.length - q.idx) + !!q.gang : 0;
        return (this._dorfImFlug | 0) + zug + (this._autoSettlementPendingKey ? 1 : 0);
    }
    async _dorfAkt(opts) {
        const o = opts && typeof opts === "object" ? opts : {};
        let seed = Number.isFinite(o.seed) ? Number(o.seed) : NaN;
        if (!Number.isFinite(seed)) seed = this._bauSame("stadt");
        // ZENSUS-REST V18.488 — der Stamm defaultet nie: ohne o.nH führt der Kern-Default (fachwerk DORF: DP.nH, ohne Zahl die
        // Klasse der Epoche, sonst 18 — die EINE Wahrheit). DIE EINE KLEMME ist die des Kerns (DORF 4…500, siedlung.K2): bis K2
        // klemmte der Stamm hier zusätzlich bei 120, die Metropole des Rang-Gesetzes stand dem Satz nie offen.
        let nH = Number.isFinite(o.nH) ? Number(o.nH) : undefined;
        // Ein VERLANGTER Ort, den es nicht gibt, wird nie der Spieler-Ort (V-k5-Klasse): ohne `position` gründet der
        // Akt beim Spieler (Chat „dorf"), mit `position` nur dort — eine leere oder unendliche ist eine laute Absage.
        if ("position" in o && !(o.position && Number.isFinite(o.position.x) && Number.isFinite(o.position.z))) {
            this.log("Siedlung ohne Ort: der verlangte Ort fehlt — keine Gründung (nie still beim Spieler).", "ERROR");
            this._chatEcho?.("Hier kann kein Dorf entstehen: der Ort fehlt.");
            return null;
        }
        // FOUNDRY-WARM — Dorf braucht export-settlement. Kaltes Buch → LAUT blockieren
        // (kein WARN-Nichts). Autonome Worldgen-Zellen warten schon auf Channel-Live.
        // Die Größe aus dem Siedlungs-Gesetz (`nHAusGesetz`, der DSL-Akt `spawn_village`) wartet auf das Buch — auch der
        // autonome Akt (das Gesetz kommt im Buch, `_foundryIngestSiedlung`).
        if (!o.autonomous || o.nHAusGesetz) {
            const warm = await this._foundryAwaitBook(45000);
            if (!warm.ok) {
                const msg = `FOUNDRY KALT: Siedlung/Dorf-Spawn BLOCKIERT (${warm.reason}; ready=${warm.ready} recipes=${warm.recipes}) — kein stilles Nichts.`;
                this.log(msg, "ERROR");
                this._chatEcho?.(AnazhRealm.SIEDLUNG_KALT_SATZ);
                return null;
            }
        }
        // DAS JAHR DES AKTS (siedlung.K4, „dorf 7 300 jahr 1560", `spawn_village` mit Jahr): es wählt die Epoche seiner
        // Zeitachse (fachwerk `epocheImJahr`) — der Ort steht am Ende ihrer Spanne, die Zahl ist die Größe seiner Gegenwart
        if (Number.isFinite(o.jahr)) o.epoche = AnazhRealm.Gesetz("fachwerk:epocheImJahr")(o.jahr);
        // eine verlangte Epoche ohne Zahl nimmt die Größe ihrer Klasse (fachwerk DORF, EPOCHEN.groesse), nie die des Dorfs
        if (o.nHAusGesetz && nH === undefined && !o.epoche) {
            const SG = AnazhRealm._siedlungGesetz();
            if (!SG) {
                this.log("SIEDLUNGS-GESETZ FEHLT im Buch: Dorf-Spawn BLOCKIERT (keine Größe ohne Gesetz).", "ERROR");
                this._chatEcho?.(AnazhRealm.SIEDLUNG_KALT_SATZ);
                return null;
            }
            nH = AnazhRealm.Gesetz("fachwerk:siedlungsGroesse")(SG, seed, 0);
        }
        const dp = { seed, nH, epoche: o.epoche, budget: o.budget };
        return this._foundryRequestSettlement(dp).then(async (plan) => {
            if (!plan) {
                this.log(
                    "FOUNDRY KALT: Siedlung — export-settlement leer/aus — Spawn BLOCKIERT (kein stilles Nichts).",
                    "ERROR"
                );
                this._chatEcho?.(AnazhRealm.SIEDLUNG_KALT_SATZ);
                return null;
            }
            // der Ort aus dem Plan selbst: das Dorf liegt vor dem Spieler, nie um ihn (`_siedlungsAnker`)
            const anchor = this._siedlungsAnker(plan, o.position || null, o.blick || null);
            // DER ORT AUF DEM GELÄNDE (K10): der Plan v2 am Anker — Höhen, Wege, Laternen und der Erdbau, den die Welt trägt;
            // die Ort-Wahl rechnet im Ort-Faden (`_ortWahl`, Lehre 14), der Akt wartet auf sie. Seine Gassen folgen dem Grund
            // am Ort, an dem er steht (`_ortMitTrasse`, siedlung.K3): der Plan ohne Raster nennt nur den Anker.
            const b = await this._ortMitTrasse(dp, anchor);
            if (!b || !b.plan) return null;
            anchor.mitte &&= { x: anchor.mitte.x + b.ort.x - anchor.x, z: anchor.mitte.z + b.ort.z - anchor.z };
            Object.assign(anchor, { x: b.ort.x, z: b.ort.z });
            const ort = AnazhRealm._ortSchluessel(b.plan, anchor); // der Schlüssel seines Erdbaus (`_ortPlanSetzen`)
            plan = this._ortPlanSetzen(b.plan, anchor);
            const res = await this._spawnSettlementFromExport(plan, anchor, { autonomous: !!o.autonomous });
            // DORF-ERLEBNIS — Wege/Platz/Brunnen + das Rebuild-Gedächtnis („d:<seed>"
            // im selben settlementCells-Pfad: die Wege-Streifen überleben den Reload).
            const wmD = this.state.worldMeta || (this.state.worldMeta = {});
            if (!wmD.settlementCells || typeof wmD.settlementCells !== "object") wmD.settlementCells = {};
            // der Wege-Schlüssel trägt den ORT: zwei Siedlungen mit demselben Samen bauen je ihre Wege (vorher gewann die
            // erste, die Stadt `dorf 7 120` neben `dorf 7 18` stand ohne einen Weg — Leben-Prüfung S-W1)
            const dKey = "d:" + seed + "@" + Math.round(anchor.x) + "," + Math.round(anchor.z);
            // das Gedächtnis trägt den Akt, aus dem der Ort wiederkehrt (speicher.K3): Epoche, Budget, wer ihn rief, sein Erdbau,
            // der Ort seiner Trasse (wx/wz, siedlung.K3: die Wiederkehr fragt den Export dort, wo seine Gassen lagen)
            if (!wmD.settlementCells[dKey])
                wmD.settlementCells[dKey] = JSON.parse(
                    JSON.stringify({
                        seed,
                        nH,
                        x: anchor.x,
                        z: anchor.z,
                        wx: b.ort.x,
                        wz: b.ort.z,
                        ort,
                        epoche: o.epoche,
                        budget: o.budget,
                        autonomous: o.autonomous || undefined,
                        wachs: this._ortWachsAnfang(plan),
                    })
                );
            this._spawnSettlementErlebnis(plan, anchor, { key: dKey, autonomous: !!o.autonomous });
            // Zwei Kanäle (V-D8): das Log trägt Same, Größe und Slots; wer das Dorf verlangt hat (`_spielerVerlangt`,
            // die Quelle des Akts), hört den Satz der Welt und schaut auf SEIN Dorf — Nexus, Welt-Regeln und Mitspieler handeln
            // für die Welt: kein Satz an den Empfänger, kein Blick.
            this.log(
                `Siedlung „${res.name || "?"}" (${res.groesse || "?"}, Seed ${seed}): ${res.placed} Häuser platziert, ${res.skipped} Slots übersprungen; Mitte ${Math.round(anchor.radius || 0)} m Radius.`,
                "INFO"
            );
            if (this._spielerVerlangt(o.verlangt))
                this._chatEcho?.(
                    res.placed > 0
                        ? `„${res.name || "Das Dorf"}" steht vor dir: ${res.placed} ${res.placed === 1 ? "Haus" : "Häuser"}.`
                        : "Hier findet kein Haus Grund — zu steil, zu nass oder verbaut. Versuch es an einem anderen Ort."
                );
            // Konsum: Blick (nur für den, der das Dorf verlangt hat) + Locator automatisch
            this._nachDorfOrientieren(res, o.verlangt);
            return res;
        });
    }
    // DER BAU-SAME (Γ5): zieht aus dem Welt-Seed-Stream (Suffix ":<art>", FNV-1a — das _worldRuleSeed-Muster); je Art zählt
    // ein Akt-Zähler hoch → jeder neue Bau derselben Welt ein ANDERER, aber deterministischer Same. Die Siedlung trägt die
    // Art "stadt". Leser: `spawnSettlement` (Chat `dorf`), jeder Chat-Satz mit Same (`baue … hier`, Insel, Fraktal, der
    // Studio-Hain — der Same reist im Programm), der Strom jedes Programms ohne eigenen Seed (`dslCtx`), der Standard-Same
    // der Wurzel `spawnArchitecture` (Bau einer Kreatur, Plattform, Portal), der Würfel der Werkstatt, die Komposition des
    // Nexus. Der Zähler ist Welt-Gedächtnis (`worldMeta.bauSame`, reist im
    // Snapshot und zum Gast): als Sitzungs-Feld begann er nach jedem Reload neu, und derselbe Satz am selben Ort stellte einen
    // deckungsgleichen zweiten Hain.
    _bauSame(art) {
        const wm = this.state.worldMeta || (this.state.worldMeta = {});
        const z = wm.bauSame && typeof wm.bauSame === "object" ? wm.bauSame : (wm.bauSame = {});
        const n = (z[art] = (Number(z[art]) || 0) + 1);
        const s = `${wm.seed || "anazh-realm-seed"}:${art}:${n}`;
        let h = 2166136261 >>> 0;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        return h >>> 0 || 1;
    }
    // Der Strom EINES Samens (LCG, [0, 1)): was ein Akt würfelt — Streuung, Drehung, Größe — ist eine Funktion seines Samens,
    // auf jedem Peer und nach jedem Reload dieselbe. Das EINE LCG der Welt: Leser `_streamRng` (der Strom eines Namens),
    // `dslCtx` (der Programm-Strom), `_dslSpawnStudioItems`, die Nexus-Komposition und der Schwebe-Takt eines UFOs.
    _samenStrom(same) {
        let s = Number(same) >>> 0 || 1;
        return () => {
            s = (s * 1664525 + 1013904223) >>> 0;
            return s / 4294967296;
        };
    }
    // DER SAME EINES WERKS (Gegenprüfung 08.10.): EIN Same je Bauplan — der Wurf der Werkstatt (`_grownSeed` · `_rockSeedBase`
    // · `_crystalSeedBase`), sonst sein Name (ein Studio-Rezept ohne Bauplan: seine id) —, gehasht in die Gestalt-Wahl
    // (`_foundryVariantFor`). Leser: die Werkstatt-Vorschau (Bauplan und Rezept), die Hand, das Phantom UND das Setzen
    // (`confirmBuild`): was die Vorschau zeigt, zeigt das Phantom, und genau das steht. Befund: vier Kopien des Hashes, und
    // das Setzen würfelte den Samen aus Math.random — die Eiche des Phantoms (Gestalt 2) stand als Gestalt 1.
    // JEDES SETZEN EIN NEUES WERK (Integration V18.536, Auflage 1 der zweiten Werkstatt-Gegenprüfung): trägt der Bauplan
    // keinen Wurf der Werkstatt, zieht der Bau-Modus (`bm`) je Setzen den nächsten Samen des Welt-Stroms seiner Art
    // (`_bauSame("bau:" + name)`, derselbe Strom wie der Standard-Same der Wurzel) — Phantom, Setzen und Nachricht an den
    // Mitspieler lesen ihn, nach dem Setzen zieht das nächste Phantom neu. Befund: jedes Setzen derselben Eiche stand als
    // dieselbe Gestalt mit derselben Tönung (vorher wählte Math.random zwischen zwei Gestalten und streute ±8 %). Ohne
    // `bm` (Hand) zeigt der Name das Werk der Art; ein Wurf der Werkstatt steht genau so, wie gewürfelt.
    // DER SAME DES NÄCHSTEN SETZENS JE ART (`bm.setzSame[art]`, bauen.K1): Phantom, Werkstatt-Vorschau und Kosten-Leiste lesen
    // ihn für jede Zeile — ein Platz für alle Arten zog bei jedem Zeilen-Wechsel (Eiche → Fels → Eiche) den nächsten Samen des
    // Welt-Stroms, die Eiche zeigte eine neue Gestalt ohne Karte (gate:s4-impostor-workshop B), der Strom lief ohne Setzen.
    _werkSame(bp, name, bm) {
        const wurf = bp ? bp._grownSeed || bp._rockSeedBase || bp._crystalSeedBase : null;
        const art = name != null ? name : bp && bp.name;
        if (wurf == null && bm) {
            const je = bm.setzSame || (bm.setzSame = {});
            return je[art] || (je[art] = this._bauSame("bau:" + art));
        }
        const s = String(wurf != null ? wurf : art);
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (Math.imul(h, 131) + s.charCodeAt(i)) >>> 0;
        return h;
    }
    // ═══ WORLDGEN-AUTO-DÖRFER (der Worldgen-Konsument des "settlement"-Kanals) ═══
    // Γ5: je Welt-Zelle (SIEDLUNG.cellM) entscheidet FNV-1a(worldSeed:dorf:cx,cz) Existenz (1 von
    // `rarity`), Seed, Größe, Anker; Wände: flach · über Wasser · spawnClearM (sonst FindSite).
    // Export async über den Foundry-Worker, Häuser budgetiert (nur `!_frameOverBudget`) über
    // `_spawnSettlementSlot`; `worldMeta.settlementCells` markiert bei Export-ANKUNFT (nie Doppel-Dorf).
    // Headless ruht der Zug (Gate-Hook `__anazhAutoSettlement`). Unten: Zelle → {seed, nH, Anker} | null.
    // DAS RANG-GESETZ (siedlung.K2): Existenz, Anker, Stufe, Größe und Verdrängung rechnet der Kern (fachwerk `siedlungsZelle`:
    // je Raster der Stufe die Stadt seines Siegers, Pareto-Größe, kein Ort in der Reichweite eines höheren); der Wirt reicht
    // den Zell-Hash (FNV-1a über „<Welt-Same>:dorf:cx,cz") und hält das Gedächtnis je Welt-Same. `mehrM`: so viel weiter als
    // ein Dorf reicht der Ort (die Spawn-Klar-Wand und das Erwachen zählen ab seinem Rand). Bis K2 würfelte die Zelle hier
    // 8–17 Häuser — die Welt trug nur Dörfer.
    _autoSettlementCellInfo(cx, cz) {
        // ZENSUS 17.07. — Existenz/Raster/Größe sind fachwerk-Gesetz (SIEDLUNG); kaltes Buch → keine Zelle.
        const A = AnazhRealm._siedlungGesetz();
        if (!A) return null;
        const ws = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        if (!this._siedlungZellMemo || this._siedlungZellMemo.ws !== ws) this._siedlungZellMemo = { ws, M: new Map() }; // Instanz-Feld (die _editSaveTimer-Klasse)
        const hash = (x, z) => {
            const s = `${ws}:dorf:${x},${z}`;
            let h = 2166136261 >>> 0;
            for (let i = 0; i < s.length; i++) {
                h ^= s.charCodeAt(i);
                h = Math.imul(h, 16777619) >>> 0;
            }
            return h;
        };
        const z = AnazhRealm.Gesetz("fachwerk:siedlungsZelle")(A, cx, cz, hash, this._siedlungZellMemo.M);
        if (!z) return null;
        return {
            key: cx + "," + cz,
            seed: z.seed >>> 0 || 1,
            nH: z.nH,
            stufe: z.stufe,
            mehrM: this._siedlungMehrM(z.nH),
            x: z.x,
            z: z.z,
        };
    }
    // So viel weiter als das größte Dorf reicht ein Ort mit nH Häusern (fachwerk `siedlungsReich`; 0 für jedes Dorf): um so viel
    // früher erwacht er, um so viel weiter hält er sich vom Genesis-Ort, um so viel weiter baut der Reload seine Schichten.
    _siedlungMehrM(nH) {
        const A = AnazhRealm._siedlungGesetz();
        if (!A || !Number.isFinite(nH)) return 0;
        const reich = AnazhRealm.Gesetz("fachwerk:siedlungsReich");
        return Math.max(0, reich(A, nH) - reich(A, A.nHMin + A.nHSpan - 1));
    }
    // Site-Wände am Anker (die Slot-Wände prüft `_spawnSettlementSlot` je Haus zusätzlich). `noSpawnClear`
    // öffnet NUR dem Start-Dorf die Spawn-Klar-Wand; Wasser und Hang bleiben für jede Site dieselbe Wand. DIE STEIL-WAND IST DIE
    // BÖSCHUNG DES ERDBAUS (siedlung.K3): ein Ort steht am Hang, solange er flacher liegt als die Böschung, mit der sein Erdbau den
    // Grund schließt (gelaende-core `ERDBAU.boeschung`, 0,6) — steiler schließen die Kegel nie, die Böschung eines Hauses hangauf
    // begräbt die Tür des nächsten (Mess-Dorf −4,−4 am Anker, Neigung 0,81: zwei Scheunen mit 6,1 und 4,7 m Absatz). Die Trasse
    // lenkt seine Gassen (fachwerk `trasseLenk`), der Erdbau seiner Platten trägt jedes Haus (`ortPlan`; Node, 55 Zellen um den
    // Ursprung: zwischen 0,35 und 0,46 hielten alle 13 Gassen ≤ 12 % und jede Tür). Bis siedlung-k3-hang wies eine eigene Zahl
    // (`SIEDLUNG.slopeMax` 0,35) jeden Ort steiler als 0,35 ab.
    // DER GENESIS-ORT (EINE Quelle): die Mitte der Start-Plattform — dort kommt der Spieler an, um sie stehen die
    // Kern-Portale (Schöpfer V18.486: „die kernportale um die genesis-plattform anordnen"), um sie bleibt die
    // Warmup-Welt dorffrei und wächst das Start-Dorf. Ohne Plattform der Welt-Ursprung. Bis 06.10. lasen diese vier
    // den Ursprung, während die Plattform dort stand, wo `_findOpenSpawnSpot` Platz fand (36 m daneben, seit der
    // Kronen-Wand V-D1 dort, wo kein Baum durch die Scheibe wächst).
    _genesisMitte() {
        const p = this._genesisPlattform();
        return p ? { x: p.position.x, z: p.position.z } : { x: 0, z: 0 };
    }
    _genesisPlattform() {
        const p = (this.state.architectures || []).find((a) => a && a.type === "start_plattform");
        return p && p.position ? p : null;
    }

    // `mehrM` (siedlung.K2): so viel weiter als ein Dorf reicht der Ort — die Spawn-Klar-Wand zählt ab seinem Rand.
    _autoSettlementSiteOk(x, z, noSpawnClear, mehrM = 0) {
        // Der Dorf-Ort ist ein Wurf des Feldes (Auto-Dorf, Start-Dorf): wo die Wildnis nicht trägt, steht keins.
        if (!this._wildnisTraegt(x, z)) return false;
        const A = AnazhRealm.AUTO_SETTLEMENT; // Wirt-Streaming (spawnClearM)
        if (!noSpawnClear) {
            const g = this._genesisMitte();
            if (Math.hypot(x - g.x, z - g.z) < A.spawnClearM + mehrM) return false; // die Warmup-Welt bleibt dorffrei
        }
        if (!this._landAt(x, z, 0.2)) return false; // die Wasser-Wand (EINE Quelle)
        return !!AnazhRealm._siedlungGesetz() && !(this._slopeAt(x, z) > globalThis.__gelaendeCore.ERDBAU.boeschung);
    }
    // Site-Suche: der trockene, tragende Fleck NAHE des Ankers statt Tod an einem Punkt (am Ufer, über der Böschung).
    // Γ5 aus dem Zell-Seed: Anker zuerst, dann je Probe-Ring
    // 4 Proben (Phase aus Seed, Ring 2 um 45° verdreht) durch `_autoSettlementSiteOk`. null = kein Dorf.
    _autoSettlementFindSite(info) {
        const A = AnazhRealm.AUTO_SETTLEMENT; // Wirt-Streaming (siteProbeR)
        const mehr = info.mehrM || 0; // die Stadt reicht weiter als das Dorf (siedlung.K2)
        if (this._autoSettlementSiteOk(info.x, info.z, false, mehr)) return { x: info.x, z: info.z };
        const phase = (((info.seed >>> 4) & 0xff) / 255) * 2 * Math.PI;
        for (let ri = 0; ri < A.siteProbeR.length; ri++) {
            // ZENSUS 17.07. — das Zell-Raster ist fachwerk-Gesetz (SIEDLUNG.cellM).
            const SG = AnazhRealm._siedlungGesetz();
            if (!SG) return null;
            const rad = A.siteProbeR[ri] * SG.cellM;
            for (let i = 0; i < 4; i++) {
                const a = phase + (i / 4) * 2 * Math.PI + ri * (Math.PI / 4);
                const px = info.x + Math.cos(a) * rad;
                const pz = info.z + Math.sin(a) * rad;
                if (this._autoSettlementSiteOk(px, pz, false, mehr)) return { x: px, z: pz };
            }
        }
        return null;
    }
    // `_autoSettlementStartInfo` (unten): EINMAL je Welt ein Start-Dorf ~110–170 m vom Spawn (Γ5
    // ":startdorf"), Radien × 8 Winkel durch `_autoSettlementSiteOk` mit offener Spawn-Klar-Wand.
    // GENESIS-PORTAL-RING: EINMAL je Welt stehen alle Built-in-Portale (WORLD_REGISTRY) im Kreis um den
    // Genesis-Ort (`_genesisMitte`), deterministisch. Doppelt idempotent: worldMeta-Stempel UND Existenz-Probe (ein
    // restauriertes Ring-Portal setzt den Stempel nach). Terrain/Bauplan nicht bereit → nächster Tick.
    _genesisPortalRing(playerPos) {
        const st = this.state;
        const wm = st.worldMeta;
        if (!wm || wm.genesisPortalRing || this._genesisRingFertig) return;
        const M = this._genesisMitte();
        if ((playerPos.x - M.x) ** 2 + (playerPos.z - M.z) ** 2 > 60 * 60) return; // nur am Genesis-Ort
        const bps = st.blueprints || {};
        const namen = Object.keys(bps).filter((n) => {
            const b = bps[n];
            return b && b.builtIn && b.role === "portal" && b.portalMeta && b.portalMeta.world;
        });
        if (!namen.length) return;
        // Existenz-Probe: trägt die Welt schon ein Ring-Portal nahe des Genesis-Orts
        // (Restore eines Saves ohne Stempel), gilt der Ring als gebaut.
        for (const e of st.architectures || []) {
            if (!e || !e.position) continue;
            const d2 = (e.position.x - M.x) ** 2 + (e.position.z - M.z) ** 2;
            if (d2 <= 20 * 20 && namen.includes(e.type)) {
                this._genesisRingFertig = true;
                wm.genesisPortalRing = true;
                return;
            }
        }
        const R = AnazhRealm.GENESIS_PLATZ.ringR; // der Kreis der Tore auf dem Genesis-Platz (seine Lichtung trägt ihn)
        let gebaut = 0;
        for (let i = 0; i < namen.length; i++) {
            const a = (i / namen.length) * 2 * Math.PI;
            const x = M.x + Math.cos(a) * R;
            const z = M.z + Math.sin(a) * R;
            const y = this.getTerrainHeightAt(x, z);
            if (!Number.isFinite(y)) return; // Terrain reift noch — nächster Tick
            const entry = this.spawnArchitecture(namen[i], { x, y, z }, { seed: ((i + 1) * 7919) >>> 0 });
            if (entry) gebaut++;
        }
        if (gebaut > 0) {
            wm.genesisPortalRing = true;
            this._genesisRingFertig = true;
            this.log(`Genesis-Ring: ${gebaut} Kern-Portale im Kreis um die Plattform.`, "INFO");
        }
    }
    // DER WUNSCH-ORT DER VORSCHAU vor einem Tor des Genesis-Rings: ~8 m radial nach außen, vom Genesis-Ort aus gesehen (der
    // Ring steht um ihn); `blick` ist die Richtung vom Ring hinaus (sin, cos). Wo ein Wagen dann steht, entscheidet das
    // Platz-Gesetz (`_fahrPlatzSuche`). Leser: `_ensurePortalPreview` und die Fahr-Linse (gate:fahr-leben P: an jedem Tor).
    // → { x, y, z, blick } oder null (kein Boden).
    _portalVorschauOrt(portal) {
        const M = this._genesisMitte();
        const px = portal.position.x || 0;
        const pz = portal.position.z || 0;
        const len = Math.hypot(px - M.x, pz - M.z) || 1;
        const ox = px + ((px - M.x) / len) * 8;
        const oz = pz + ((pz - M.z) / len) * 8;
        const y = this.getTerrainHeightAt(ox, oz);
        if (!Number.isFinite(y)) return null;
        return { x: ox, y: y + 0.5, z: oz, blick: Math.atan2(px - M.x, pz - M.z) };
    }

    // PORTAL-PREVIEW: EIN Preview je Studio-Tor (~8 m radial vor welt_<worldKey>), sichtbar vorm iframe.
    // Doppelt idempotent (worldMeta.portalPreview<Key> + Existenz-Probe auf id); Foundry kalt → Skip + EIN
    // Await-Book je worldKey, nächster Tick retry. Typen: fachwerk→haus_alemannisch, garage→fahrzeug_gt,
    // schmiede→esse, portale→tor_drachentor (spawnArchitecture silent/autonomous).
    _ensurePortalPreview(worldKey, type, id) {
        if (typeof worldKey !== "string" || !worldKey || typeof type !== "string" || !type) return;
        if (typeof id !== "string" || !id) return;
        const st = this.state;
        const wm = st.worldMeta;
        const metaKey = "portalPreview" + worldKey.charAt(0).toUpperCase() + worldKey.slice(1);
        const fertig = (this._portalPreviewFertig = this._portalPreviewFertig || Object.create(null));
        const awaiting = (this._portalPreviewAwaiting = this._portalPreviewAwaiting || Object.create(null));
        if (!wm || wm[metaKey] || fertig[worldKey]) return;
        const arches = st.architectures || [];
        for (const e of arches) {
            if (e && e.id === id) {
                fertig[worldKey] = true;
                wm[metaKey] = true;
                return;
            }
        }
        const portalType = "welt_" + worldKey;
        let portal = null;
        for (const e of arches) {
            if (e && e.type === portalType && e.position) {
                portal = e;
                break;
            }
        }
        if (!portal) return;
        const f = this._foundry;
        const bpOk = !!(st.blueprints && st.blueprints[type]);
        if (!f || !f.ready || !f.recipes || !bpOk) {
            if (awaiting[worldKey]) return;
            awaiting[worldKey] = true;
            Promise.resolve(this._foundryAwaitBook(8000))
                .then((warm) => {
                    awaiting[worldKey] = false;
                    if (warm && warm.ok) this._ensurePortalPreview(worldKey, type, id);
                })
                .catch((e) => {
                    awaiting[worldKey] = false;
                    this._stoffBruch("die Portal-Vorschau " + worldKey, e);
                });
            return;
        }
        const ort = this._portalVorschauOrt(portal);
        if (!ort) return;
        // Deterministische Seeds: fachwerk 49177 · garage 49178 · schmiede 49179 · portale 49180.
        const seed =
            worldKey === "fachwerk"
                ? 49177
                : worldKey === "garage"
                  ? 49178
                  : worldKey === "schmiede"
                    ? 49179
                    : worldKey === "portale"
                      ? 49180
                      : 49170;
        const opts = { silent: true, autonomous: true, id, seed };
        // Der Vorschau-Wagen schaut vom Ring hinaus in die Welt (Studio-Wagen: Template-Gier = Fahrt − π/2); wo er steht,
        // entscheidet das Platz-Gesetz (`_fahrPlatzSuche` in spawnArchitecture: der nächste fahrbare Grund mit Bahn).
        if (worldKey === "garage") opts.rotationY = ort.blick - Math.PI / 2;
        // Nur fachwerk/haus_*: die Vorschau trägt ihre Prägung (studioOv: Stil, Verband, Geschosse, Maße, Dach) — der
        // Bau des Gesetzbuchs liest sie, fremde Schlüssel ignoriert er. Der Stempel gewinnt: ein Eintrag ohne studioOv
        // bleibt; ov nur bei Neu-Spawn.
        // Die Maße (Breite · Tiefe · Dachneigung · Geschosse) sind das fränkische Preset des Gesetzbuchs (fachwerk PRESETS
        // fraenkisch.s), kein Zahlen-Zwilling (K2); Stil, Verband, Gaube und Flügel wählt die Vorschau.
        if (worldKey === "fachwerk" && type.startsWith("haus_")) {
            const PRE =
                AnazhRealm.Gesetz("fachwerk:PRESETS.fraenkisch.s") || AnazhRealm._kernPflichtBruch("fachwerk:PRESETS");
            opts.studioOv = Object.freeze(
                Object.assign({}, PRE, { stil: "alt", brace: "andreas", gaube: true, fluegel: true, fluegelSide: 1 })
            );
        }
        // DER PLATZ DES VORSCHAU-WAGENS IM TAKT: die Suche des Platz-Gesetzes (`_fahrPlatzWege`) läuft vor dem Bau, je Takt
        // höchstens FAHR_PLATZ_JE_TAKT Orte (die Ring-Suche kostete am Garage-Tor bis 0,66 s in EINEM Takt); der Wagen entsteht
        // dort, wo sie endet — die Wurzel prüft den Ort dann in einem Schritt. Kein Platz: dieses Tor bleibt ohne Vorschau.
        if (this._fahrzeugGesetzFor({ type })) {
            const wege = (this._vorschauPlatzWege = this._vorschauPlatzWege || Object.create(null));
            let job = wege[worldKey];
            if (!job) {
                const probe = { type, position: { x: ort.x, y: ort.y, z: ort.z }, rotationY: opts.rotationY, scale: 1 };
                job = wege[worldKey] = { probe, weg: this._fahrPlatzWege(probe), ende: null };
            }
            for (let i = 0; i < AnazhRealm.FAHR_PLATZ_JE_TAKT && job.ende === null; i++) {
                const r = job.weg.next();
                if (r.done) job.ende = r.value;
            }
            if (job.ende === null) return;
            delete wege[worldKey];
            if (!job.ende) {
                fertig[worldKey] = true;
                return;
            }
            ort.x = job.probe.position.x;
            ort.z = job.probe.position.z;
            opts.rotationY = job.probe.rotationY;
        }
        // die Absage der Wurzel beim Namen: findet das Platz-Gesetz keinen fahrbaren Grund, steht dieses Tor ohne Vorschau —
        // einmal (die Suche liefe sonst in jedem Takt neu)
        let absage = null;
        opts.absage = (g) => (absage = g);
        const entry = this.spawnArchitecture(type, { x: ort.x, y: ort.y, z: ort.z }, opts);
        if (entry) {
            wm[metaKey] = true;
            fertig[worldKey] = true;
            this.log(`Portal-Preview ${worldKey}: ${type} ~8 m vor ${portalType}.`, "INFO");
        } else if (absage === "platz") fertig[worldKey] = true;
    }

    // Approach-Prefetch: nähert sich der Spieler einem Genesis-Tor (~22 m), Previews über
    // `_ensurePortalPreview` schärfen und bei kalter Foundry EIN Await-Book feuern.
    // koerperstudio/terrain/klang/tetrapoda haben keinen Preview-Typ.
    _portalApproachPrefetch(playerPos) {
        if (!playerPos) return;
        const rows = [
            ["fachwerk", "haus_alemannisch", "portal-preview-fachwerk"],
            ["garage", "fahrzeug_gt", "portal-preview-garage"],
            ["schmiede", "esse", "portal-preview-schmiede"],
            ["portale", "tor_drachentor", "portal-preview-portale"],
        ];
        const arches = (this.state && this.state.architectures) || [];
        const R2 = 22 * 22;
        let nearAny = false;
        for (let i = 0; i < rows.length; i++) {
            const worldKey = rows[i][0];
            const type = rows[i][1];
            const id = rows[i][2];
            const portalType = "welt_" + worldKey;
            let portal = null;
            for (let j = 0; j < arches.length; j++) {
                const e = arches[j];
                if (e && e.type === portalType && e.position) {
                    portal = e;
                    break;
                }
            }
            if (!portal) continue;
            const dx = (portal.position.x || 0) - playerPos.x;
            const dz = (portal.position.z || 0) - playerPos.z;
            if (dx * dx + dz * dz > R2) continue;
            nearAny = true;
            this._ensurePortalPreview(worldKey, type, id);
        }
        if (!nearAny) return;
        const f = this._foundry;
        if (f && f.ready) return;
        if (this._portalApproachAwaiting) return;
        this._portalApproachAwaiting = true;
        Promise.resolve(this._foundryAwaitBook(8000))
            .then(() => {
                this._portalApproachAwaiting = false;
            })
            .catch((e) => {
                this._portalApproachAwaiting = false;
                this._stoffBruch("das Studio-Buch vor dem Portal (Foundry-Boot)", e);
            });
    }

    _autoSettlementStartInfo() {
        const A = AnazhRealm.AUTO_SETTLEMENT; // Wirt-Streaming (startRadiusM)
        // ZENSUS 17.07. — die Dorf-Größe ist fachwerk-Gesetz (SIEDLUNG.nHMin/nHSpan); kaltes Buch → kein Start-Dorf.
        const S = AnazhRealm._siedlungGesetz();
        if (!S) return null;
        const wm = this.state.worldMeta || {};
        const s = `${wm.seed || "anazh-realm-seed"}:startdorf`;
        let h = 2166136261 >>> 0;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        const phase = (((h >>> 8) & 0xff) / 255) * 2 * Math.PI;
        const M = this._genesisMitte(); // um den Genesis-Ort, wo der Spieler ankommt
        for (let ri = 0; ri < A.startRadiusM.length; ri++) {
            for (let i = 0; i < 8; i++) {
                const a = phase + (i / 8) * 2 * Math.PI;
                const x = M.x + Math.cos(a) * A.startRadiusM[ri];
                const z = M.z + Math.sin(a) * A.startRadiusM[ri];
                if (!this._autoSettlementSiteOk(x, z, true)) continue;
                return {
                    key: "start",
                    seed: h >>> 0 || 1,
                    nH: AnazhRealm.Gesetz("fachwerk:siedlungsGroesse")(S, h, 0),
                    x,
                    z,
                };
            }
        }
        return null;
    }
    // Auto-Dörfer laufen NUR, wenn das LIVE-Buch ein Rezept trägt, dessen Place-Auflösung über
    // `_placeDispatch` auf "settlement" fällt. Gecacht auf Buch-Identität (wie _forestExtraSpecies).
    _autoSettlementChannelLive() {
        const f = this._foundry;
        const book = f && f.ready && f.recipes;
        if (!book) return false;
        if (this._autoStlChannelBook === book && this._autoStlChannelCache != null) return this._autoStlChannelCache;
        let live = false;
        for (const id in book) {
            if (this._placeDispatch(this._placePolicyFor(book[id]), { id }) === "settlement") {
                live = true;
                break;
            }
        }
        this._autoStlChannelCache = live;
        this._autoStlChannelBook = book;
        return live;
    }
    // Epochen-Legende: jede dritte Siedlung trägt seed-deterministisch eine Epoche der fachwerk-EPOCHEN-
    // Tafel (DP.epoche fixiert Region + Zeit), die übrigen würfelt der Same (Region-Historie). Reine
    // Funktion des Zell-Seeds → der Wege-Rebuild trifft dieselbe Epoche. Das Gesetz ist fachwerk `siedlungsEpoche` (siedlung.K2:
    // der Zensus des Rang-Gesetzes liest dieselbe Legende); fail-closed bei kaltem Kern (`AnazhRealm.Gesetz` bricht laut).
    _siedlungEpoche(seed) {
        return AnazhRealm.Gesetz("fachwerk:siedlungsEpoche")(seed);
    }
    // Eine Dorf-Zelle heben (Gate/Test und Tick teilen den Pfad): reserviert bei Export-ANKUNFT
    // (`worldMeta.settlementCells[key]`), Slots in die budgetierte Queue. Kein Export → nichts markiert.
    _autoSettlementSpawnCell(cx, cz, info) {
        const st = this.state;
        const i2 = info || this._autoSettlementCellInfo(cx, cz);
        if (!i2) return Promise.resolve(null);
        const wm = st.worldMeta || (st.worldMeta = {});
        if (!wm.settlementCells || typeof wm.settlementCells !== "object") wm.settlementCells = {};
        const key = i2.key || cx + "," + cz; // Zell-Infos tragen cx,cz — das Start-Dorf trägt "start"
        const q = this._autoSettlementQueue;
        if (wm.settlementCells[key] || this._autoSettlementPendingKey || (q && q.gang)) return Promise.resolve(null);
        // der Plan und seine Ort-Wahl rechnen, solange die Zelle naht (`_dorfBereiten`) — so lange gilt der Export als
        // unterwegs (der Zug beginnt keine zweite Zelle, die Messung schwingt nicht ein)
        this._autoSettlementPendingKey = key;
        return this._dorfBereiten(key, i2).then((b) => {
            this._autoSettlementPendingKey = null;
            this._dorfVorraete.delete(key); // die Zelle ist erwacht: ihr Vorrat ist verbraucht
            if (!b) return null; // fail-closed (Foundry kalt)
            // DER ORT WIRD WELT: die Wahl steht im Gedächtnis des Orts (`_ortPlaene`), der Anker rückt an den Ort des Plans;
            // sein Erdbau und seine Schichten gehen als Gang des Zugs (`_dorfErwachen`) vor dem ersten Haus
            const anchor = Object.assign({}, b.anker);
            const ort = AnazhRealm._ortSchluessel(b.plan, anchor);
            const v2 = this._ortPlanSetzen(b.plan, anchor, false);
            // Die Reservierung IST das Gedächtnis des Orts {seed, nH, x, z, wx, wz, ort}: aus ihm kehrt er nach jedem Reload
            // wieder (`_tickAutoSettlement`) — Häuser, Erdbau (Schlüssel `ort`) und Schichten trägt der Stand nie (speicher.K3);
            // wx/wz der Ort der Trasse (siedlung.K3): die Wiederkehr fragt den Export dort, wo seine Gassen lagen.
            // Alle Leser fragen nur Existenz (truthy).
            wm.settlementCells[key] = {
                seed: i2.seed,
                nH: i2.nH,
                x: anchor.x,
                z: anchor.z,
                wx: b.anker.x,
                wz: b.anker.z,
                ort,
                wachs: this._ortWachsAnfang(v2),
            };
            this._autoSettlementQueue = this._dorfZug(
                v2,
                anchor,
                key,
                this._dorfErwachen(v2, anchor, ort, key, b.wasser)
            );
            return v2;
        }, this._ortWahlWartet(key));
    }
    // DAS ERWACHEN IN RATEN (stadt-erwachen, Lehre 14): der Gang des Zugs einer Zelle, je Takt EIN Schritt — EIN Schritt legt
    // den Erdbau (`_erdbauSetzen` unter dem Schlüssel des Orts `ort`, mit dem Wasser-Urteil `w` des Vorlaufs), einer normt die
    // Welt mit ihm (`_erdbauLage`); dann liegt der Grund (`yield true`), und die Schichten (`_dorfErlebnis`) gehen in den Takten
    // zwischen den Häusern (`_dorfZugSchritt`). Bis stadt-erwachen trug der Rückruf des Erwachens alles: nH 300 192 ms synchron,
    // das Bild 461–469 ms (GTX 22.10.).
    // DAS NÄCHSTE HAUS ZUERST (stadt-erwachen-2, Lehre 25): bis hier gingen das Urteil (3 Raten), der Erdbau und ALLE Schichten
    // (Wege, 4 Laternen-Raten, Ausstattung) vor dem ersten Haus — nH 300 hob das nächste im Takt 13, an der GTX gezeichnet nach
    // 4,67–4,82 s (vorher 0,65 s). Ohne Vorlauf (Teleport, Start-Dorf) fällt das Urteil hier, in Raten vor dem Eintrag.
    *_dorfErwachen(v2, anchor, ort, key, w, so) {
        while (!this._dorfWasserSchritt(w)) yield;
        this._erdbauSetzen(ort, v2.erdbau, w.nass);
        if (typeof this._scheduleEditSave === "function") this._scheduleEditSave();
        yield;
        this._erdbauLage(); // die Normalform der Welt mit dem neuen Ort (ihr erster Leser zahlte sie)
        yield true;
        yield* this._dorfErlebnis(v2, { x: anchor.x, z: anchor.z }, Object.assign({ key }, so));
    }
    // DAS WASSER-URTEIL DES ERDBAUS IM VORLAUF (Lehre 14: im Idle vorgebacken): ändert der Erdbau des Plans v2 (seine Splats
    // `erdbau`) den Grund an gezeichnetem Wasser (`_erdbauAmWasser` VOR dem Eintrag)? Ein Gang in Raten — die Normalform, dann je
    // Rate `AUTO_SETTLEMENT.wasserZellenJeTakt` Zellen —, den der Takt im Vorlauf-Ring treibt (`_tickAutoSettlement`) und
    // der Gang des Erwachens zu Ende geht, falls die Zelle ohne Vorlauf erwacht. Rückgabe { gang, nass } (nass: undefined offen).
    _dorfWasserUrteil(erdbau) {
        const realm = this;
        const gang = (function* () {
            const E = erdbau ? globalThis.__gelaendeCore.erdbauNormal(erdbau) : null;
            yield;
            const n = AnazhRealm.AUTO_SETTLEMENT.wasserZellenJeTakt;
            for (let ab = 0; E && ab < E.zellen.size; ab += n) {
                const nass = realm._erdbauAmWasser(E, ab, n);
                yield;
                if (nass) return true;
            }
            return false;
        })();
        return { gang, nass: undefined };
    }
    // EINE Rate des Urteils `w` (`_dorfWasserUrteil`); true, sobald es steht
    _dorfWasserSchritt(w) {
        if (w.nass === undefined) {
            const s = w.gang.next();
            if (s.done) w.nass = s.value;
        }
        return w.nass !== undefined;
    }
    // OHNE ORT-WAHL (der Ort-Faden steht noch nicht: der Sandbox-Weg holt die Quelle des Voxel-Fadens, `_nebenFaden`) fragt der
    // nächste Takt neu — ein Wurf des Fadens meldet sich dort laut beim Namen (`_bruchMelden`). Der Rückruf der Zell-Kette und
    // des Vorlaufs.
    _ortWahlWartet(key) {
        return (e) => {
            if (this._autoSettlementPendingKey === key) this._autoSettlementPendingKey = null;
            if (this._dorfVorraete) this._dorfVorraete.delete(key);
            this.log(`ORT: die Zelle ${key} wartet auf die Ort-Wahl — ${(e && e.message) || e}`, "INFO");
            return null;
        };
    }
    // DAS DORF IM VORLAUF (siedlung.K5): der Export und die Ort-Wahl einer Zelle rechnen, sobald sie in den Vorlauf-Ring
    // tritt (`AUTO_SETTLEMENT.vorlaufM` vor `nearM`), im Foundry- und im Ort-Faden — ihr Erdbau liegt erst, wenn sie
    // erwacht (`_autoSettlementSpawnCell`). Bis K5 begann beides beim Erwachen: der Export baut jedes Haus zur Probe (der
    // Mass-Bau misst die Welt-Box, die das Layout braucht), das erste Haus der Zelle wartete mit nH (Export nH 12 0,29 s,
    // nH 300 2,0 s). EIN Vorrat JE ZELLE (`_dorfVorraete`, Karte vorrat-pingpong): ein Ruf mit demselben Schlüssel nimmt ihn, das
    // Erwachen der Zelle verbraucht ihn. Mit EINEM Vorrat zur Zeit lösten zwei Zellen im Vorlauf-Ring einander ab, jede fertige
    // rechnete im nächsten Takt neu (Messort dorf, −3,−5 ↔ −5,−3: die Welt stand nie). Rückgabe: Promise {plan, anker} | null.
    _dorfBereiten(key, i2) {
        const M = this._dorfVorraete || (this._dorfVorraete = new Map());
        if (M.has(key)) return M.get(key).fertig;
        const v = { da: false, x: i2.x, z: i2.z, mehrM: i2.mehrM || 0 };
        // DER ORT DER WELT IST EINE FUNKTION (Lehre 7): der Wunsch ist der Ort der Zelle, die Ort-Wahl fragt keinen Spieler
        // (`frei` null) — wer ihn berührt, wartet im Zug (`_dorfZugSchritt`). Bis stadt-erwachen rückte das Dorf vor den
        // Spieler (`_siedlungsAnker`), sobald er im Vorlauf in seiner Reichweite stand: nH 300 reicht 422 m, der Vorlauf
        // beginnt bei 420 m — der Anker folgte seinem Schritt (GTX 22.10.: −835,27 ≠ −835,10 zwischen zwei Boots).
        const dp = { seed: i2.seed, nH: i2.nH, epoche: this._siedlungEpoche(i2.seed) }; // die Epochen-Legende (V18.488)
        v.fertig = this._ortMitTrasse(dp, i2, null, key === "start").then((b) => {
            if (!b || !b.plan) {
                if (M.get(key) === v) M.delete(key); // der nächste Takt fragt neu — eine Trasse ohne Ruhe trägt kein Dorf
                if (b && this._autoSettlementRejected) this._autoSettlementRejected.add(key);
                return null;
            }
            const anker = { x: b.ort.x, y: 0, z: b.ort.z };
            const v2 = this._ortPlaene.get(AnazhRealm._ortSchluessel(b.plan, anker));
            v.wasser = this._dorfWasserUrteil(v2 ? v2.erdbau : null);
            v.v2 = v2;
            v.da = true;
            return { plan: b.plan, anker, wasser: v.wasser };
        });
        M.set(key, v);
        return v.fertig;
    }
    // DIE TRASSE AM ORT DES PLANS (siedlung.K3): der Export liest das Höhen-Raster um `ort` (`_foundryRequestSettlement`), die
    // Ort-Wahl (`_ortWahl`, ohne Erdbau) rückt den Plan bis 128 m an den nächsten Ort, der jedes Haus trägt — dort folgten seine
    // Gassen dem Grund des Wunschs (Node, vier Saaten: Gefälle p95 am Ort des Rasters 5,7–9,3 %, 16 m daneben bis 23,7 %).
    // Rückt die Wahl, rechnet der Export am gewählten Ort neu (sein Mass-Bau kommt aus dem Gedächtnis des Studios), bis die Wahl
    // am Ort ihres Rasters bleibt (56 Zellen um den Mess-Ort dorf: 37 im ersten Lauf, 15 im zweiten, 4 im dritten oder vierten).
    // Rückgabe: Promise { plan, ort } — der Plan v2 steht unter `_ortSchluessel(plan, ort)` —, null bei kalter Foundry; bleibt die
    // Wahl in `ORT_WAHL.trasseRunden` Läufen nicht, ist `plan` null, laut: kein Plan auf fremdem Grund.
    async _ortMitTrasse(dp, wunsch, frei, kopf) {
        const mass = (this._ortTrasseMass = { runden: 0, versatzM: [] });
        let ort = { x: wunsch.x, z: wunsch.z };
        for (; mass.runden < AnazhRealm.ORT_WAHL.trasseRunden;) {
            const plan = await this._foundryRequestSettlement(Object.assign({}, dp, { ort }), kopf);
            if (!plan || !Array.isArray(plan.slots)) return null;
            mass.runden++;
            const o = { x: ort.x, z: ort.z };
            // DER ORT, DER SCHON WELT IST (sein Erdbau liegt, `worldMeta.erdbau`: der zweite Akt am Anker des ersten), trägt kein
            // zweites Dorf aus dem Gedächtnis: die Wahl rechnet neu, und der Wirt weist jeden Ort ab, an dem ein Haus des
            // ersten steht (`_ortTraegtWirt`). Bis siedlung-k3-heil hob der Akt den stehenden Plan ein zweites Mal — sein Zug
            // wartete ohne Ende auf den Slot unter dem Spieler (gate:haus-welt W7: 900 s), jeder abgewiesene Slot nähme dem
            // stehenden Haus den Grund (`_erdbauGrundFaellt`).
            const wm = this.state.worldMeta;
            if (wm && wm.erdbau && wm.erdbau[AnazhRealm._ortSchluessel(plan, ort)] && this._ortPlaene)
                this._ortPlaene.delete(AnazhRealm._ortSchluessel(plan, ort));
            await this._ortWahl(plan, o, false, frei);
            if (o.x === ort.x && o.z === ort.z) return { plan, ort };
            mass.versatzM.push(+Math.hypot(o.x - ort.x, o.z - ort.z).toFixed(1));
            this._ortPlaene.delete(AnazhRealm._ortSchluessel(plan, ort)); // ihr Plan v2 wird nie Welt
            ort = o;
        }
        this.log(
            `ORT: die Trasse des Plans (Same ${dp.seed}) bleibt nach ${mass.runden} Läufen nicht an ihrem Ort ` +
                `(${mass.versatzM.join(" · ")} m) — kein Plan auf fremdem Grund`,
            "WARN"
        );
        return { plan: null, ort };
    }
    // DAS ERSTE HAUS STEHT SOFORT (siedlung.K5, Lehre 14: im Idle vorgebacken): ist der Vorrat einer Zelle bereit, bestellt der Takt
    // die Studio-Stufen der `AUTO_SETTLEMENT.vorbackHaeuser` Häuser, die der Zug zuerst hebt, am Auge ihres Erwachens (der Ring
    // `nah` auf dem Weg vom Spieler zum Anker) — in der Mesh-Zone die Stufe, die die Kette dort wählt (`_foundryLodForEntry` am
    // Auge), dahinter die Fernform des Gesetzbuchs — über DENSELBEN Chokepoint wie das gesetzte Haus (`_foundryFlattenFor`).
    // Bis hier bestellte erst das gesetzte Haus, nach dem Erdbau, und der Faden trug fremde Aufträge: das erste Haus stand nach
    // 148–518 ms (nH 12, Hülle) bzw. 474–800 ms (nH 300, Mesh; Radeon, Station dorf), vorgebacken nach 42–59 bzw. 119–294 ms.
    // DIE REIHE DES ZUGS (sk5-haus): vorgebacken wird, was der Zug zuerst hebt — seine Reihe (`_dorfZug`: die Mitte im Schirm, dann
    // nah) am Auge des Erwachens, mit dem Blick von JETZT, neu je `AUTO_SETTLEMENT.vorbackNeuM` Weg, bis die Zelle erwacht; nie
    // eine eigene nach dem Abstand zum Auge. Bis sk5-haus lagen gebacken die vier nächsten (nH 300, gate:settlement C-K5: 13,7–23,6 m außer
    // Schirm), der Zug hob das Haus 117,7 m in der Mitte des Schirms — das erste Haus wartete 11 Takte auf die Foundry-Schlange.
    // Rückgabe: ob jede Stufe steht (der Takt fragt bis zum Erwachen neu).
    _dorfVorbacken(w, p) {
        const f = this._foundry;
        if (!w.v2 || !f || !f.recipes) return false;
        const A = AnazhRealm.AUTO_SETTLEMENT;
        if (!w.vorback || Math.hypot(p.x - w.vorbackBei.x, p.z - w.vorbackBei.z) >= A.vorbackNeuM) {
            w.vorbackBei = { x: p.x, z: p.z };
            const o = w.v2.ort;
            const d = Math.hypot(p.x - o.x, p.z - o.z) || 1;
            const k = (A.nearM + (w.mehrM || 0)) / d;
            const auge = { x: o.x + (p.x - o.x) * k, z: o.z + (p.z - o.z) * k };
            const d2 = (e) => (e.position.x - auge.x) ** 2 + (e.position.z - auge.z) ** 2;
            const haeuser = [];
            for (const si of this._dorfZug(w.v2, o, null, null, auge).reihe) {
                const sl = w.v2.slots[si];
                const type = this._slotBauplan(sl, f);
                const position = { x: o.x + sl.x, y: sl.y + 0.5, z: o.z + sl.z };
                if (type)
                    haeuser.push({ type, seed: sl.seed >>> 0, position, studioOv: AnazhRealm._stempelVon(sl.ov) });
                if (haeuser.length >= A.vorbackHaeuser) break;
            }
            const R = this.state.architectureCullingRadius;
            w.vorback = [];
            for (const e of haeuser) {
                const preset = this._foundryPresetForEntry(e);
                const fern = d2(e) > R * R;
                if (preset)
                    w.vorback.push([
                        e,
                        preset,
                        fern ? this._foundryFernStufe(preset) : this._foundryLodForEntry(e, auge),
                    ]);
            }
        }
        // bis jede Stufe steht: ein Flat setzt sich erst aus seinen Teilen zusammen (der Schatten-Zwilling bestellt sich dabei)
        let steht = true;
        for (const [e, preset, lod] of w.vorback) if (this._foundryFlattenFor(e, preset, lod) === null) steht = false;
        return steht;
    }
    // Der Bauplan eines Slots: das Präfix seiner Studio-Art (KIND_POLICY) vor seiner Kultur, wenn die Welt ihn kennt — sonst null.
    // Leser: die Slot-Quelle (`_spawnSettlementSlot`) und der Vorrat (`_dorfVorbacken`).
    _slotBauplan(slot, f) {
        const rec = f && f.recipes ? f.recipes[slot.kultur] : null;
        const pol = rec && AnazhRealm.KIND_POLICY[rec.kind];
        const name = pol && pol.prefix ? pol.prefix + slot.kultur : null;
        return name && this.state.blueprints[name] ? name : null;
    }
    // DER RANG DES ZUGS (siedlung.K5): die Häuser eines Plans heben in der Reihe ihres Abstands zum Spieler (`reihe`, das
    // nächste zuerst, gleich weit die Slot-Folge) — bis K5 in der Slot-Folge des Layouts, die vom Kern des Dorfs nach außen
    // wächst: wer am Rand ankam, sah das Dorf hinten beginnen. `idx` zählt die gehobenen.
    // DER SCHIRM ZUERST (siedlung-k5-nah, Gebot 7): die Häuser, die der Schirm beim Erwachen zeigt (`_imErstenBlick` ohne
    // Rand, der Grundriss als Radius), heben vor jedem außer Schirm — in beiden Hälften das nächste zuerst. Bis hier hob der
    // Abstand allein: Radeon nH 300 (Station dorf, M36) hob das nächste Haus 19,6 m neben dem Spieler bei 81° außer Blick
    // nach 60 ms, das erste im Schirm erst im fünften Zug-Schritt (über dem Budget je 8 Bilder einer), gezeichnet nach 553 ms.
    // DIE MITTE IM SCHIRM ZUERST (siedlung-k5-erstes-haus): drei Hälften, in jeder das nächste zuerst — das Haus, dessen Mitte
    // der Schirm zeigt (`_imErstenBlick` am Punkt), dann das, dessen Grundriss den Bildwinkel nur streift, dann jedes außer
    // Schirm. Bis hier galt die Scheibe des Grundrisses allein: am Plan der Trasse (siedlung-k3-heil) hob der Zug an der Radeon
    // (M36 nH 300, über dem Budget ein Haus im ersten Schritt) zuerst eins 11,3 m neben dem Spieler bei 70° (Mitte außer
    // Blick), das erste im Kegel im 20. Takt — gezeichnet nach 954 ms (vorher 134 ms).
    // Der Akt (`_spawnSettlementFromExport`) und der Zug nach dem Reload (`_dorfZugOffen`) heben in DERSELBEN Reihe, der Vorrat
    // backt sie vor (`_dorfVorbacken`).
    // EIN SCHRITT DES ZUGS `q`: die nächsten Slots seiner Reihe — `AUTO_SETTLEMENT.perTick`, über dem Budget (`ueber`) einer,
    // unter dem Ladeschirm bis zur Frist des Lade-Frames (`_kappeOffen`, K60-2: die Häuser der Ankunft gehören ins erste
    // Weltbild, Term „dorf"), je Slot mit seinen Wandlaternen (K66-2). Ihn fahren der Takt (`_tickAutoSettlement`) und der Akt
    // (`_spawnSettlementFromExport`). Rückgabe: je gehobenem Slot das Haus oder false.
    // DER GANG ZUERST (stadt-erwachen): trägt der Zug den Gang seines Erlebnisses (`q.gang`, `_dorfErlebnis`), geht der Schritt
    // EINE seiner Raten und kein Haus (unter dem Ladeschirm bis zur Frist); ein Haus über `AUTO_SETTLEMENT.taktMs` ist das
    // letzte des Takts (frame-adaptiv, Lehre 14: im Zug nH 300 kosteten zwei Häuser bis 50 ms). DER SPIELER IM GRUND: die
    // Ort-Wahl der Welt fragt ihn nie (Lehre 7) — ein Slot, dessen Grundriss samt `STRUCTURE_PLAYER_CLEAR_MARGIN` ihn berührt,
    // rückt ans Ende der Reihe; berührt ihn jeder offene, wartet der Zug, bis er geht.
    _dorfZugSchritt(q, ueber) {
        const f = this._foundry;
        const neu = [];
        // DAS NÄCHSTE HAUS ZUERST (stadt-erwachen-2): bis der Grund liegt (`yield true` des Gangs) geht der Gang allein; danach
        // trägt ein Takt die Häuser, der nächste eine Rate des Gangs (die Schichten), im Wechsel — der Takt, der den Grund
        // legte, hebt schon das nächste Haus; ohne offenes Haus geht der Gang jeden Takt
        const frei = !!q.frei;
        if (q.gang && (!frei || q.gangDran || q.idx >= q.plan.slots.length)) {
            q.gangDran = false;
            for (let n = 0; q.gang && this._kappeOffen(n, 1); n++) {
                const s = q.gang.next();
                if (s.done) q.gang = null;
                else if (s.value === true) {
                    q.frei = true;
                    break;
                }
            }
            if (frei || !q.frei) return neu;
        }
        q.gangDran = !!q.gang;
        const pm = this.state.playerMesh;
        const M = AnazhRealm.STRUCTURE_PLAYER_CLEAR_MARGIN;
        const A = AnazhRealm.AUTO_SETTLEMENT;
        const t0 = performance.now();
        for (
            let warten = 0;
            q.idx < q.plan.slots.length &&
            warten < q.plan.slots.length - q.idx &&
            this._kappeOffen(neu.length, ueber || performance.now() - t0 >= A.taktMs ? 1 : A.perTick);
        ) {
            const sl = q.plan.slots[q.reihe[q.idx]];
            const fp = this._grundrissVon(sl);
            const p = pm && pm.position;
            // der Zug, der wiederkehrt (`q.wieder`), hebt das Haus, das schon stand, als der Spieler kam — auch um ihn
            if (
                fp &&
                p &&
                !q.wieder &&
                Math.hypot(p.x - q.origin.x - sl.x, p.z - q.origin.z - sl.z) < Math.hypot(fp.ex, fp.ez) + M
            ) {
                q.reihe.push(q.reihe.splice(q.idx, 1)[0]);
                warten++;
                continue;
            }
            const si = q.reihe[q.idx++];
            neu.push(this._spawnSettlementSlot(sl, q.origin, f, Object.assign({ plan: q.plan, si }, q.so)));
        }
        return neu;
    }
    // `auge` (der Vorrat, `_dorfVorbacken`): die Reihe, wie sie der Spieler am Ring des Erwachens sieht — der Blick ist
    // verschiebe-gleich (`_imErstenBlick` misst vom Auge der Kamera), das Haus rückt um das, was dem Auge zum Spieler fehlt.
    _dorfZug(plan, origin, cellKey, gang, auge) {
        const pm = this.state.playerMesh;
        const p = auge || (pm ? pm.position : origin);
        const [vx, vz] = pm && auge ? [pm.position.x - auge.x, pm.position.z - auge.z] : [0, 0];
        const aus = AnazhRealm.ERSTER_BLICK.ausserD2;
        const rang = plan.slots.map((s) => {
            const x = origin.x + s.x;
            const z = origin.z + s.z;
            const d2 = (x - p.x) ** 2 + (z - p.z) ** 2;
            if (!pm || !Number.isFinite(d2)) return d2;
            if (this._imErstenBlick(x + vx, z + vz, 0, true)) return d2;
            const fp = this._grundrissVon(s);
            return this._imErstenBlick(x + vx, z + vz, fp ? Math.hypot(fp.ex, fp.ez) : 0, true)
                ? d2 + aus
                : d2 + 2 * aus;
        });
        const reihe = plan.slots.map((_s, i) => i).sort((a, b) => rang[a] - rang[b] || a - b);
        return { plan, origin: { x: origin.x, z: origin.z }, idx: 0, reihe, cellKey, gang: gang || null };
    }
    // Der Worldgen-Konsument des "settlement"-Kanals — gerufen aus dem Idle-Pass
    // `_tickScatterStreaming` (feuert nur, wenn das Chunk-Streaming nichts baut).
    // DER GENESIS-ORT VOR JEDEM BUDGET (Existenz vor Framerate, Lehre 13): der Ring der Kern-Portale (einmalig je Welt,
    // Schöpfer 17.07.) und die Portal-Vorschauen (GT, Haus, Esse, Tor; nur bei Tor-Nähe, frühes Await-Book) stehen in
    // ihrem eigenen Takt (1×/s), nie hinter den Dorf-Akten. Bis 06.10. lagen sie im Siedlungs-Takt hinter
    // `_frameOverBudget` (und der Siedlungs-Takt im Deko-Job, der bei leerem Budget wartet): auf der echten GPU (Radeon
    // 890M, frische Welt) war das Budget in 160 von 160 Proben über 40 s überschritten — kein Ring, kein GT am Ring, der
    // v1-Schritt 6 ohne Wagen. Headless ruht er wie der Siedlungs-Takt (der Hook führt, Gate-Treue).
    _tickGenesisOrt(currentTime) {
        const st = this.state;
        const pm = st.playerMesh;
        if (!pm || !this._dorfTaktLebt()) return;
        if (this._genesisOrtT && currentTime - this._genesisOrtT < 1000) return;
        this._genesisOrtT = currentTime; // Instanz-Feld (die _editSaveTimer-Klasse: nicht serialisiert)
        this._genesisPortalRing(pm.position);
        this._portalApproachPrefetch(pm.position);
    }

    // DER DORF-TAKT LEBT (Gate-Treue): headless ruht der Auto-Zug, der Hook `__anazhAutoSettlement` führt — EIN Urteil für
    // den Siedlungs-Takt, den Genesis-Ort und das erste Weltbild (Term „dorf", `_weltbildLuecken`): ein Dorf, das kein Takt
    // baut, hält kein Bild.
    _dorfTaktLebt() {
        const hook = typeof window !== "undefined" ? window.__anazhAutoSettlement : undefined;
        if (hook === false) return false;
        return hook === true || !(this.state.renderer && this.state.renderer._isHeadlessNull);
    }

    // DAS START-DORF IST FÄLLIG (EIN Urteil für den Takt und das erste Weltbild, K60-4): einmalig je Welt, solange es weder
    // steht (`settlementCells.start`) noch hoffnungslos ist, und nur nahe des Genesis-Orts (kein Fern-Spawn hinter dem Rücken).
    _startDorfFaellig(playerPos) {
        const wm = this.state.worldMeta || {};
        const cells = wm.settlementCells && typeof wm.settlementCells === "object" ? wm.settlementCells : null;
        if ((cells && cells.start) || this._autoSettlementStartHopeless) return false;
        const gM = this._genesisMitte();
        const n = AnazhRealm.AUTO_SETTLEMENT.nearM;
        return (playerPos.x - gM.x) ** 2 + (playerPos.z - gM.z) ** 2 <= n * n;
    }

    // DAS START-DORF BESTELLEN (EIN Weg für das Buch und den Takt, B5): ist es fällig, geht sein Export hinaus — nur nahe des
    // Genesis-Orts (kein Fern-Spawn hinter dem Rücken), fail-closed + session-gemerkt (eine Welt ohne Fleck urteilt immer
    // gleich). Der Kopf der Dorf-Kette wartet auf das Buch (`_startDorfAmBuch`): Befund B5 (OMEN 18.10., GTX kalt) — der Takt
    // im Leerlauf des Streamings bestellte ihn 1,7 s nach dem Buch, die Kette (Export 3,4–5,4 s, Ort-Wahl, 33 Häuser) hielt
    // „bauten" bis 16,07 s. true = bestellt.
    _startDorfBestellen(p) {
        if (!p || !this._dorfTaktLebt() || this._autoSettlementQueue || this._autoSettlementPendingKey) return false;
        if (!this._autoSettlementChannelLive() || !this._startDorfFaellig(p)) return false;
        const si = this._autoSettlementStartInfo();
        if (!si) {
            this._autoSettlementStartHopeless = true; // Instanz-Feld (die _editSaveTimer-Klasse)
            return false;
        }
        this._autoSettlementSpawnCell(0, 0, si);
        return true;
    }
    // DAS START-DORF WARTET AUF DAS BUCH (B5; K22: das Buch ist ein EREIGNIS, der Ingest ruft keinen Leser): EIN Wecker an
    // `buchDa`, angemeldet mit der Geburt der Foundry (`init`) vor jedem anderen Wartenden — der Export geht als erster Auftrag
    // nach dem Leib in die Bahn ohne Arbeit (`_foundryRang(0, kopf)`). Den Rest fängt der Takt (`_tickAutoSettlement`).
    _startDorfAmBuch() {
        const f = this._foundry;
        if (!f || !f.buchDa) return;
        this._foundryWecker(f.buchDa, "start-dorf", () => {
            const pm = this.state.playerMesh;
            try {
                if (pm) this._startDorfBestellen(pm.position);
            } catch (e) {
                this._stoffBruch("das Start-Dorf (Export nach dem Buch)", e);
            }
        });
    }

    _tickAutoSettlement(playerPos) {
        const st = this.state;
        if (!playerPos || !this._dorfTaktLebt()) return;
        const A = AnazhRealm.AUTO_SETTLEMENT; // Wirt-Streaming (perTick/nearM)
        // (a) BUDGETIERTE MATERIALISIERUNG zuerst: ein angekommener Export baut seine
        // Häuser über Ticks verteilt — erst fertig wachsen, dann die nächste Zelle.
        // EXISTENZ VOR FRAMERATE (Lehre 13, Leben-Prüfung N-D9): das Frame-Budget drosselt das TEMPO des Dorf-Akts, nie
        // seine Existenz — über dem Budget trägt jeder A.drosselTakte-te Takt EINEN Slot bzw. EINEN Akt. Vorher kehrte der
        // Takt über dem Budget um (60 von 60 Proben): auf jedem Gerät über dem Sollwert entstand das Start-Dorf nie.
        // DAS ERSTE HAUS IST EXISTENZ (stadt-erwachen-2): bis ein Zug sein erstes Haus hob (`idx` 0: sein Grund und das nächste
        // Haus), drosselt das Budget ihn nicht — an der Radeon (Dorf, über dem Budget) trug er sonst je 8 Bilder einen Schritt
        const q = this._autoSettlementQueue;
        const ueber = !!st._frameOverBudget;
        if (ueber && !(q && q.plan && q.idx === 0)) {
            this._dorfDrossel = (this._dorfDrossel || 0) + 1;
            if (this._dorfDrossel % A.drosselTakte !== 0) return;
        }
        if (q && q.plan) {
            this._dorfZugSchritt(q, ueber);
            if (!q.gang && q.idx >= q.plan.slots.length) {
                this._autoSettlementQueue = null;
                this.log(
                    `Siedlung „${q.plan.name || "?"}" gewachsen (Zelle ${q.cellKey}, ${q.plan.slots.length} Slots).`,
                    "INFO"
                );
                // nach dem Wachstum (`_ortWaechst`) stellen sich die Bewohner aus dem neuen Plan auf: ihre Liste ist seine Funktion
                const S = q.waechst && this._bewohnerSiedlungen && this._bewohnerSiedlungen.get(q.cellKey);
                if (S) this._bewohnerFort(S);
            }
            return;
        }
        if (this._autoSettlementPendingKey) return; // ein Export-Roundtrip zur Zeit
        if (!this._autoSettlementChannelLive()) return; // der Dispatch-Kanal entscheidet (M8)
        const wm = st.worldMeta || {};
        const cells = wm.settlementCells && typeof wm.settlementCells === "object" ? wm.settlementCells : null;
        // DER ORT KEHRT WIEDER (speicher.K3, Lehre 7): eine Zelle mit Gedächtnis {seed, nH, x, z} steht je Sitzung, sobald
        // der Spieler naht, aus DEMSELBEN Export an ihrem gemerkten Ort wieder auf (die Wahl fest) — ihr Gang legt den Erdbau,
        // die Wege und die Schichten, ihr Zug hebt jedes Haus, das nicht steht. Der Stand trägt keinen Bau und keinen Erdbau
        // eines Orts: bis speicher-k3 trug er jeden (30 min Spiel: 7 Orte des Nexus, 140 kB Erdbau). Alt-Saves mit Wert 1 →
        // nichts. EIN Roundtrip zur Zeit, nur nahe Zellen; sein Zug tritt nur in einen leeren Takt (sonst kehrt er später wieder).
        const wk = !this._stlWegePending && this._dorfWiederkehrZelle(playerPos);
        if (wk) {
            const [k, c] = wk;
            this._stlWegePending = true; // Instanz-Feld (die _editSaveTimer-Klasse)
            const anker = { x: c.x, z: c.z };
            const wieder = (plan2) =>
                plan2 &&
                this._ortWahl(plan2, { x: c.x, z: c.z }, false, null, true).then((v2) => {
                    const E = this.state.worldMeta.erdbau || {};
                    const ort =
                        c.ort ||
                        Object.keys(E).find((e) => e.startsWith(`ort:${c.seed >>> 0}:`)) ||
                        AnazhRealm._ortSchluessel(plan2, anker);
                    const so = { autonomous: !!c.autonomous };
                    if (this._autoSettlementQueue || this._autoSettlementPendingKey) return;
                    const w = this._dorfWasserUrteil(v2.erdbau);
                    const gang = this._dorfErwachen(v2, anker, ort, k, w, so);
                    this._autoSettlementQueue = Object.assign(
                        this._dorfZug(this._dorfZugOffen(v2, anker), anker, k, gang),
                        {
                            so,
                            wieder: true,
                        }
                    );
                });
            this._foundryRequestSettlement(this._ortDp(k, c), k === "start")
                .then(wieder)
                .catch(this._ortWahlWartet(k))
                .then(() => (this._stlWegePending = false));
            return; // EIN Dorf-Akt pro Tick
        }
        if (this._ortWachstumTakt(playerPos)) return; // EIN Dorf-Akt pro Tick
        // Start-Dorf zuerst (einmalig je Welt) — bestellt schon sein Wecker am Buch (`_startDorfAmBuch`), der Takt fängt den Rest
        if (this._startDorfBestellen(playerPos)) return; // EIN Dorf-Akt pro Tick
        if (!this._autoSettlementRejected) this._autoSettlementRejected = new Set(); // Instanz-Feld (die _editSaveTimer-Klasse)
        // ZENSUS 17.07. — DASSELBE Zell-Raster wie die Zell-Wahrheit
        // (_autoSettlementCellInfo): SIEDLUNG.cellM, das fachwerk-Gesetz.
        const SGz = AnazhRealm._siedlungGesetz();
        if (!SGz) return;
        const cellM = SGz.cellM;
        const pcx = Math.floor(playerPos.x / cellM);
        const pcz = Math.floor(playerPos.z / cellM);
        // die Vorräte (`_dorfBereiten`): EIN Export zur Zeit fliegt; ein fertiger, dessen Zelle hinter dem Spieler zurückbleibt
        // (jenseits des doppelten Vorlauf-Rings), fällt — kehrt er zurück, bereitet sie sich neu vor
        const V = this._dorfVorraete || (this._dorfVorraete = new Map());
        let fliegt = false;
        let rate = 1; // je Takt EINE Rate des Wasser-Urteils eines bereiten Vorrats (`_dorfWasserUrteil`)
        for (const [k, w] of V) {
            fliegt = fliegt || !w.da;
            if (w.da && (w.x - playerPos.x) ** 2 + (w.z - playerPos.z) ** 2 > (A.nearM + w.mehrM + 2 * A.vorlaufM) ** 2)
                V.delete(k);
            else if (w.da && rate && w.wasser.nass === undefined) {
                this._dorfWasserSchritt(w.wasser);
                rate = 0;
            }
            if (w.da && V.has(k)) w.vorgebacken = this._dorfVorbacken(w, playerPos);
        }
        // die Zellen um den Spieler: der Ring 1 (jeder Ort), dann der Ring 2 — dort nur die Stadt des Rang-Gesetzes (siedlung.K2):
        // sie erwacht um ihr `mehrM` früher, ihr Rand liegt so viel weiter vom Anker als der eines Dorfs
        for (let j = 0; j < 9; j++)
            if (
                this._autoSettlementZelle(
                    pcx + (j % 3) - 1,
                    pcz + Math.floor(j / 3) - 1,
                    false,
                    playerPos,
                    cells,
                    V,
                    fliegt
                )
            )
                return; // EIN Dorf-Akt pro Tick
        for (let j = 0; j < 25; j++) {
            const dx = (j % 5) - 2;
            const dz = Math.floor(j / 5) - 2;
            if (
                Math.max(Math.abs(dx), Math.abs(dz)) === 2 &&
                this._autoSettlementZelle(pcx + dx, pcz + dz, true, playerPos, cells, V, fliegt)
            )
                return;
        }
    }
    // DAS GEDÄCHTNIS DES WACHSTUMS (siedlung.K4 Staffel 2): ein Ort mit Chronik beginnt im Jahr seines Plans, ohne Kraft, zur Uhr
    // der Welt; ohne Chronik (keine Zeitachse) wächst er nicht
    _ortWachsAnfang(plan) {
        return plan && plan.chronik
            ? { jahr: plan.jahr + plan.spanne, kraft: 0, uhr: this.state.spielZeit }
            : undefined;
    }
    // DER ORT WÄCHST IN SPIELZEIT (siedlung.K4 Staffel 2): je `SIEDLUNG_WACHS.taktS` s der Welt-Uhr rechnet jeder Ort mit Chronik,
    // der in dieser Sitzung steht (seine Wege, `_stlWegeKeys`) und dessen Rand der Spieler auf `nearM` naht, das Gesetz seines
    // Wachstums bis zur Uhr (fachwerk `wachstum`: die Kraft seiner Bewohner, ihre Furcht aus seinen Akten nach dem EINEN
    // Furcht-Gesetz) — sein Gedächtnis (`wachs`) geht mit; trägt das Jahr ein Los, das sein Plan nicht trägt, wird er am neuen Jahr
    // Welt (`_ortWaechst`). Ein ferner Ort holt nach, wenn der Spieler naht (das Gesetz ist taktfrei). EIN Ort zur Zeit; der Zug
    // seiner neuen Häuser tritt in den nächsten freien Takt. Rückgabe true = der Takt tat seinen Dorf-Akt.
    _ortWachstumTakt(p) {
        if (this._ortWachsFlug) return false;
        const H = this._ortWachsHaeuser;
        if (H && H.size) {
            const [k, q] = H.entries().next().value;
            H.delete(k);
            this._autoSettlementQueue = q;
            return true;
        }
        const st = this.state;
        const takt = Math.floor(st.spielZeit / AnazhRealm.SIEDLUNG_WACHS.taktS);
        if (takt === this._ortWachsTakt) return false;
        this._ortWachsTakt = takt; // Instanz-Feld (die _editSaveTimer-Klasse)
        const [cells, FC, FG] = [
            (st.worldMeta || {}).settlementCells || {},
            globalThis.__fachwerkCore,
            AnazhRealm._furchtGesetz(),
        ];
        for (const k in cells) {
            const c = cells[k];
            const alt = c && c.wachs && this._stlWegeKeys && this._stlWegeKeys.has(k) && this._ortPlaene.get(c.ort);
            const nah = AnazhRealm.AUTO_SETTLEMENT.nearM + this._siedlungMehrM(c && c.nH);
            if (!alt || !alt.chronik || (c.x - p.x) ** 2 + (c.z - p.z) ** 2 > nah * nah) continue;
            const furcht = (a) => FG.furchtErinnert(a, FG.F);
            const Z = FC.wachstum(alt.chronik, c.wachs, c.akten || [], st.spielZeit, furcht, FG.F.fluchtJeFurcht);
            c.wachs = { jahr: Z.jahr, kraft: Z.kraft, uhr: Z.uhr };
            if (Z.jahr === alt.jahr + alt.spanne) continue;
            this._ortWachsFlug = this._ortWaechst(k, c, alt)
                .catch((e) => this._stoffBruch(`das Wachstum von „${alt.name || k}"`, e))
                .finally(() => (this._ortWachsFlug = null));
            return true;
        }
        return false;
    }
    // DER ORT WIRD AM NEUEN JAHR WELT (siedlung.K4 Staffel 2): der Export am Jahr seines Gedächtnisses (`_ortDp`) wird an genau
    // seinem Ort gewählt (`_ortNeuPlanen`: derselbe Weg, auf dem seine Gasse einem gesetzten Haus weicht — Erdbau, das Objekt des
    // Plans, Wege, das Netz der Bewohner). Vor dem Tausch fällt jedes Haus, dessen Slot der neue Plan nicht trägt (Same, Kultur,
    // Ort: das Los wird neu bebaut), und die Ausstattung des alten (ihre Nummern wechseln); danach steht die Mauer neu, wenn sie
    // wechselt (der Ring des Schnitts wächst, nach MAUER_BIS fällt er), und der Zug hebt die neuen Häuser und die Ausstattung
    // (`_dorfZugOffen`, `_dorfErlebnis`: was steht, bleibt); ist er durch, stellen sich die Bewohner neu auf (`_tickAutoSettlement`).
    async _ortWaechst(k, c, alt) {
        const plan = await this._foundryRequestSettlement(this._ortDp(k, c));
        if (!plan) return false;
        const mauer = JSON.stringify(alt.mauer || null);
        const id = (s) => `${s.seed >>> 0}:${s.kultur}@${Math.round(s.x * 20)},${Math.round(s.z * 20)}`;
        const vorTausch = (a, neu) => {
            const [traegt, weg] = [new Set(neu.slots.map(id)), []];
            for (const s of a.slots) {
                const e = !traegt.has(id(s)) && this._dorfHaus(a.ort.x + s.x, a.ort.z + s.z, s.seed >>> 0);
                const fp = e && this._grundrissVon(s);
                if (e) weg.push({ x: e.position.x, z: e.position.z, r: (fp ? Math.hypot(fp.ex, fp.ez) : 4) + 1.5 });
                if (e) this.removeArchitecture(e, { still: true });
            }
            this._ortAusstattungFaellt(a, weg);
        };
        if (!(await this._ortNeuPlanen(c.ort, plan, vorTausch))) return false;
        if (JSON.stringify(alt.mauer || null) !== mauer) this._stlMauerNeu(alt);
        const so = { key: k, autonomous: !!c.autonomous };
        const gang = this._dorfErlebnis(alt, { x: alt.ort.x, z: alt.ort.z }, so);
        const q = this._dorfZug(this._dorfZugOffen(alt, alt.ort), alt.ort, k, gang);
        (this._ortWachsHaeuser || (this._ortWachsHaeuser = new Map())).set(
            k,
            Object.assign(q, { so, wieder: true, waechst: true })
        );
        if (typeof this._scheduleEditSave === "function") this._scheduleEditSave();
        this.log(
            `Siedlung „${alt.name || "?"}" (${k}) wächst ins Jahr ${c.wachs.jahr}: ${alt.slots.length} Slots.`,
            "INFO"
        );
        return true;
    }
    // DIE MAUER WÄCHST MIT (siedlung.K4 Staffel 2, `_ortWaechst`): wechselt die Mauer des Plans `plan` mit seinem Jahr (der Ring
    // des Schnitts wächst mit der Stadt, nach MAUER_BIS fällt er), fallen ihre Streifen (Maß 0, der Pool behält die Plätze) und
    // ihre Linie in der Wege-Karte, und die Mauer seines Plans steht neu
    _stlMauerNeu(plan) {
        const [wk, P] = [this._wegeKarteEnsure(), this.state.stlMauer];
        const null4 = this._stlMauerNull || (this._stlMauerNull = new THREE.Matrix4().makeScale(0, 0, 0));
        for (let i = wk.siedlungen.length - 1; i >= 0; i--) {
            const b = wk.siedlungen[i];
            if (b.mauerVon !== plan) continue;
            wk.siedlungen.splice(i, 1);
            if (wk.raeumen.includes(b)) wk.raeumen.splice(wk.raeumen.indexOf(b), 1);
            for (let k = b.streifen[0]; P && k < b.streifen[1]; k++) P.mesh.setMatrixAt(k, null4);
            if (P) P.mesh.instanceMatrix.needsUpdate = true;
            this._grundrissFaellt(b.x0, b.z0, b.x1, b.z1);
        }
        return this._stlMauerBuild(plan, plan.ort);
    }
    // DER AKT EINES ORTS AUS SEINEM GEDÄCHTNIS (speicher.K3): sein Same, seine Zahl, seine Epoche (der Akt eines Satzes oder des
    // Nexus trägt seine eigene, die Zelle ihre Legende), sein Budget, das Jahr seines Wachstums (`wachs`, siedlung.K4 Staffel 2) und
    // der Grund seiner Trasse (siedlung.K3: der Export liest das Raster, wo seine Gassen lagen; ein Ort ohne wx/wz stammt von vor
    // der Trasse und lag eben). Leser: die Wiederkehr (`_tickAutoSettlement`) und das Wachstum (`_ortWaechst`).
    _ortDp(k, c) {
        const akt = k.startsWith("d:");
        return {
            seed: c.seed,
            nH: c.nH,
            epoche: akt ? c.epoche : this._siedlungEpoche(c.seed),
            budget: akt ? c.budget : undefined,
            jahr: c.wachs ? c.wachs.jahr : undefined,
            ort: Number.isFinite(c.wx) && Number.isFinite(c.wz) ? { x: c.wx, z: c.wz } : undefined,
        };
    }
    // DIE ZELLE, DIE WIEDERKEHRT: der erste Ort des Gedächtnisses (in der Folge seiner Gründung), der nahe dem Spieler steht und
    // in dieser Sitzung noch nicht wiederkam (`_stlWegeKeys`: seine Wege) — [Schlüssel, Gedächtnis] oder null. Leser: der Takt
    // (`_tickAutoSettlement`) und das erste Weltbild (der Term „dorf").
    _dorfWiederkehrZelle(p) {
        const wm = this.state.worldMeta || {};
        const cells = wm.settlementCells && typeof wm.settlementCells === "object" ? wm.settlementCells : null;
        for (const k in cells || {}) {
            const c = cells[k];
            if (!c || typeof c !== "object" || !Number.isFinite(c.x) || !Number.isFinite(c.seed)) continue;
            if (this._stlWegeKeys && this._stlWegeKeys.has(k)) continue;
            const nahW = AnazhRealm.AUTO_SETTLEMENT.nearM + this._siedlungMehrM(c.nH); // die Stadt ab ihrem Rand (siedlung.K2)
            if ((c.x - p.x) ** 2 + (c.z - p.z) ** 2 <= nahW * nahW) return [k, c];
        }
        return null;
    }
    // EINE ZELLE IM TAKT (`_tickAutoSettlement`): verworfen, im Vorlauf bereitet oder erwacht — true, wenn der Takt dabei seinen
    // EINEN Dorf-Akt getan hat. `nurStadt`: der Ring 2 nimmt nur die Stadt (Stufe ≥ 1); ein Dorf dort wartet auf den Ring 1.
    _autoSettlementZelle(cx, cz, nurStadt, playerPos, cells, V, fliegt) {
        const A = AnazhRealm.AUTO_SETTLEMENT;
        const key = cx + "," + cz;
        if ((cells && cells[key]) || this._autoSettlementRejected.has(key)) return false;
        const info = this._autoSettlementCellInfo(cx, cz);
        if (!info) {
            this._autoSettlementRejected.add(key); // Zelle trägt kein Dorf (Hash, verdrängt)
            return false;
        }
        if (nurStadt && !(info.stufe > 0)) return false;
        const ddx = info.x - playerPos.x;
        const ddz = info.z - playerPos.z;
        const d2 = ddx * ddx + ddz * ddz;
        const nah = A.nearM + info.mehrM; // die Stadt erwacht an ihrem Rand, das Dorf bei nearM (`mehrM` 0)
        const vor = d2 > nah * nah; // noch nicht erwacht: im Vorlauf-Ring bereitet sie sich vor, ferner später
        if (vor && (d2 > (nah + A.vorlaufM) ** 2 || V.has(key) || fliegt)) return false;
        const site = this._autoSettlementFindSite(info); // Anker zuerst, dann die Probe-Ringe
        if (!site) {
            this._autoSettlementRejected.add(key); // die ganze Zelle untauglich (Wasser/steil/Spawn-nah)
            return false;
        }
        const i3 = site.x === info.x && site.z === info.z ? info : Object.assign({}, info, { x: site.x, z: site.z });
        if (vor) this._dorfBereiten(key, i3).catch(this._ortWahlWartet(key));
        else this._autoSettlementSpawnCell(cx, cz, i3);
        return true;
    }

    // DER ORT KEHRT WIEDER (speicher.K3, Lehre 7): der Stand trägt je Ort nur sein Gedächtnis (`settlementCells`), nie seine
    // Häuser und seinen Erdbau — der Zug der Wiederkehr hebt jeden Slot des Plans v2 `plan` (am Anker `c`), dessen Haus (sein
    // Same an seiner Mitte) nicht steht; was dort sonst steht, urteilt die Bau-Wand des Slots, eine Tat sperrt ihn
    // (`_tatSperrt`: ein abgebautes Haus kehrt nie zurück, sein Grund fällt mit dem Slot). Ein Reload mitten im Zug ist
    // derselbe Fall. Rückgabe: der Plan des offenen Zugs, seine Wandlaternen an ihren Slots.
    _dorfZugOffen(plan, c) {
        // liegt sein Grund schon (ein Zug, der in der Sitzung fiel, ein älterer Stand), trägt er die Höhe des Slots
        const gruende = this._erdbauRoh().filter((g) => g && g.art === "grund");
        const neu = new Map();
        const slots = [];
        (plan.slots || []).forEach((sl, i) => {
            const [x, z] = [c.x + sl.x, c.z + sl.z];
            if (this._dorfSteht(x, z, sl.seed >>> 0)) return;
            const g = gruende.find((q) => Math.abs(q.cx - x) < 0.05 && Math.abs(q.cz - z) < 0.05);
            neu.set(i, slots.length);
            slots.push(g ? Object.assign({}, sl, { y: g.y }) : sl);
        });
        // die Wandlaternen hängen an ihrem Slot im offenen Zug (die Reihe des Exports bleibt: ihr Same je Nummer)
        const laternen = (plan.laternen || []).map((l) =>
            l && l.wand ? Object.assign({}, l, { slot: neu.has(l.slot) ? neu.get(l.slot) : -1 }) : l
        );
        return Object.assign({}, plan, { slots, laternen });
    }
    // Der Bau eines Orts (sein Same `same`) an (x, z), oder undefined. Der Zug, der wiederkehrt, hebt nur, was nicht steht; das
    // Wachstum nimmt, was sein neuer Plan nicht trägt (`_ortWaechst`).
    _dorfHaus(x, z, same) {
        return this.state.architectures.find(
            (e) => e && e.seed === same && Math.abs(e.position.x - x) < 0.05 && Math.abs(e.position.z - z) < 0.05
        );
    }
    _dorfSteht(x, z, same) {
        return !!this._dorfHaus(x, z, same);
    }
    // Ist der Platz eines Stücks des Orts belegt — es steht schon, oder eine Tat nahm es? Er zählt dann als gesetzt: der Same
    // der folgenden Stücke bleibt der seiner ersten Gründung.
    _dorfBelegt(x, z, same) {
        return this._dorfSteht(x, z, same) || this._tatSperrt(x, z);
    }

    // DER STAND DER GRUNDRISSE FÄLLT AM ORT (K51-5, Lehre 25): ein neuer oder gefallener Grundriss (Bau, Lichtung, Fläche eines
    // Dorfs, Trittfläche) im Kasten x0…x1 · z0…z1 legt das Gitter neu an und nimmt der Gestalt des Orts (`_ortGestaltSame`)
    // nur die Antworten, die er ändern kann: ein Baum fragt die Natur-Wand für jeden Nachbarn bis ±4 Wald-Zellen
    // (`_forestStehtFrei`) samt dessen Krone — die Reichweite `ORT_SAME_REICH`. Bis K51-4 fiel jede Antwort der Welt mit
    // (Mess-Wiese gehend, Null-Renderer, 15 s: 14 Fälle, 10 772 `_forestStehtFrei`, 288 311 Sichthöhen). Ohne Kasten fällt alles.
    _grundrissFaellt(x0, z0, x1, z1) {
        this._grundrissGitter = null;
        if (!this._ortSame) return;
        if (![x0, z0, x1, z1].every(Number.isFinite)) {
            this._ortSame = null;
            return;
        }
        const R = AnazhRealm.ORT_SAME_REICH;
        this._ortSameFaellt(x0 - R, z0 - R, x1 + R, z1 + R);
    }
    // Die Gestalt des Orts fällt in den Eimern, die der Kasten x0…x1 · z0…z1 (m) berührt — der EINE Räumer ihres Gedächtnisses
    // für jeden, der ihre Eingaben am Ort ändert: den Grundriss (`_grundrissFaellt`) und den Wald (`_forestDartsFallen`).
    _ortSameFaellt(x0, z0, x1, z1) {
        const M = this._ortSame;
        if (!M) return;
        const B = AnazhRealm.ORT_SAME_EIMER;
        for (let bx = Math.floor(x0 / B); bx <= Math.floor(x1 / B); bx++)
            for (let bz = Math.floor(z0 / B); bz <= Math.floor(z1 / B); bz++) {
                const ek = bx + "," + bz;
                const eimer = M.get(ek);
                if (!eimer) continue;
                this._ortSameN -= eimer.size;
                M.delete(ek);
            }
    }

    // Weicht der Eintrag dem Bau? Die Natur (`_istNatur`) und jeder Wurf des Felds (die Marke `feldWurf`, die nur der Wurf
    // trägt: `_enqueueVegetationSpawn` → `spawnArchitecture`, eine Art aus `FELD_WURF`; die Feuerstelle des Glut-Felds ist Bau
    // ihrer Gestalt nach — Kollision, Grundriss, Trittfläche —, aber ein Wurf). Was weicht, sperrt keinem Ort den Grund
    // (`_bauFrei`) und fällt im Grundriss eines Baus und auf dem Weg eines Dorfs (`_naturRaeumen`). Bis K10-6 wich der Wurf nur,
    // wenn er NACH dem Bau kam: eine Feuerstelle im Grundriss des Orts 80 m weit schob die Ort-Wahl im Spiel auf 96 m. Es
    // entscheidet die HERKUNFT, nie die Art: bis K10-6 Nachbesserung 2 wich auch die Feuerstelle des Satzes und des Bau-Modus
    // jedem späteren Bau (gate:settlement Teil O „das Werk derselben Art"). Bis zur Wiederkehr wich auch das Werk eines Worts
    // aus dem Stoff der Natur (ein stein_block ist basalt): auf der Lichtung beim Satz erlaubt, beim Reload geräumt
    // (gate:persistence Teil W 0/2). Das Werk (`werk`, die Herkunft an der Wurzel `spawnArchitecture`) weicht nie.
    // Ein Tier weicht nach SEINER Herkunft: der Wurf des Felds (`userData.feldWurf`, `_kreaturWurf`), nie das gerufene Tier.
    _weichtDemBau(e) {
        if (!e || e.werk === true) return false;
        if (e.userData && e.userData.kind === "creature") return e.userData.feldWurf === true;
        return e.feldWurf === true || this._istNatur(e);
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_siedlung_ort]);

// ===== ATLAS · Siedlung/ort — Außen-Konstanten =====
// DAS LAND EINES WERKS (m über dem Wasser des Gesetzes, `_fundamentLand` → `_landAt`): so hoch liegt jeder Punkt eines
// Fundaments samt Saum und Vorplatz über dem Spiegel — die Wand jedes Werks und die Ort-Wahl (`ortTraegt` im Ort-Faden) urteilen gleich.
AnazhRealm.WERK_LAND_M = 0.2;
// DIE AUSSTATTUNG EINES ORTS (`_ausstattungSame`): je Art der Versatz ihres Samens und ihre Kappe (Brunnen: der Kernel-Brunnen und je
// 8 Häuser einer; Stände: Markt-Plätze; Hof-Bäume: das Architektur-LOD/Instanzen-Budget; die Laterne zählt die Liste des Plans)
AnazhRealm.ORT_AUSSTATTUNG = Object.freeze({
    laterne: Object.freeze({ ab: 97 }),
    brunnen: Object.freeze({ ab: 0, kappe: 5 }),
    stand: Object.freeze({ ab: 53, kappe: 3 }),
    baum: Object.freeze({ ab: 31, kappe: 12 }),
});
// DAS WACHSTUM DER ORTE IN DER WELT (siedlung.K4 Staffel 2, `_ortWachstumTakt`): je so viele s der Welt-Uhr rechnet ein naher
// Ort sein Gesetz (fachwerk `wachstum`, taktfrei: ein seltenerer Takt holt nach) und zeigt, was gewachsen ist
AnazhRealm.SIEDLUNG_WACHS = Object.freeze({ taktS: 300 });
AnazhRealm.AUTO_SETTLEMENT = Object.freeze({
    nearM: 260,
    // der Vorlauf-Ring vor `nearM` (siedlung.K5, `_dorfBereiten`): 160 m tragen Export und Ort-Wahl auch im Wagen
    vorlaufM: 160,
    spawnClearM: 320,
    siteProbeR: Object.freeze([0.15, 0.3]),
    startRadiusM: Object.freeze([110, 130, 150, 170]),
    perTick: 2,
    // so viele Häuser des Vorrats bestellen ihre Studio-Stufen vor dem Erwachen (`_dorfVorbacken`)
    vorbackHaeuser: 4,
    // so viel Weg des Spielers, und der Vorrat liest die Reihe des Zugs neu (`_dorfVorbacken`, sk5-haus)
    vorbackNeuM: 8,
    // über so viel ms eines Zug-Schritts trägt der Takt kein Haus mehr (`_dorfZugSchritt`, stadt-erwachen)
    taktMs: 8,
    // die Laternen je Rate des Erlebnis-Gangs (`_dorfErlebnis`, stadt-erwachen)
    laternenJeTakt: 32,
    // die Zellen des Erdbaus je Rate seines Wasser-Urteils (`_dorfErwachen`, stadt-erwachen)
    wasserZellenJeTakt: 200,
    // Über dem Frame-Budget trägt jeder drosselTakte-te Takt einen Slot (das Tempo fällt, die Siedlung entsteht).
    drosselTakte: 8,
});
// DER EINE SIEDLUNGS-GESETZ-LESER (Zensus 17.07.): das Memo setzt der Buch-Ingest (`_foundryIngestSiedlung`, validiert
// ganz-oder-gar-nicht); kaltes Buch → null: ohne Gesetz entsteht kein Dorf (fail-closed, die Leser prüfen), nie ein
// Ersatz-Gesetz.
AnazhRealm._siedlungGesetz = function () {
    return AnazhRealm._siedlungGesetzMemo || null;
};
// Max Foundry-Baum-Bauten je Frame (kein 300-Burst-Main-Thread-Spike). Klein halten — jeder
// Bau lädt bis ~170k Verts als WebGPU-Buffer hoch; der per-Frame-Drain (_tickFoliageGrowth,
// budget-gegated) tropft sie rein, wenn der Frame Luft hat. Tunable (Schöpfer-GPU balanciert).
AnazhRealm.FOUNDRY_BUILD_PER_TICK = 4;
// Der EINE Platz-Leser (Leben-Schau 2, fahr-bahn): das Platz-Gesetz eines Wagens, den die Welt hinstellt (vehicle-core
// fahrPlatz + FAHR.platz: Anfahrt-Anteil, Such-Schritt, Such-Radius). Fail-closed: ein Kern ohne Platz-Gesetz bricht laut,
// nie stellt die Welt einen Wagen still ungeprüft hin. Memo je Kern-Objekt.
AnazhRealm._fahrPlatzGesetz = function () {
    const vc = typeof globalThis !== "undefined" ? globalThis.__vehicleCore : null;
    const memo = AnazhRealm._fahrPlatzMemo;
    if (memo && memo.vc === vc) return memo;
    const P = vc && vc.FAHR && vc.FAHR.platz;
    if (
        P &&
        typeof vc.fahrPlatz === "function" &&
        typeof vc.fahrPlatzGrenze === "function" &&
        ["anfahrAnteil", "bahnLaengen", "suchRadiusM", "suchSchrittM", "richtungen"].every((k) =>
            Number.isFinite(P[k])
        ) &&
        P.suchSchrittM > 0 &&
        P.richtungen >= 1
    ) {
        AnazhRealm._fahrPlatzMemo = { vc, P };
        return AnazhRealm._fahrPlatzMemo;
    }
    return AnazhRealm._kernPflichtBruch("vehicle:FAHR.platz/fahrPlatz");
};
// DER GENESIS-PLATZ (K52): die Lichtung der Start-Plattform trägt den Ring der Kern-Portale — `ringR` ist der Kreis der Tore
// (`_genesisPortalRing`), `rand` die Tiefe eines Tors über ihn hinaus; über dem Platz steht keine Krone, auf ihm kein Busch und
// kein Fels (`_grundrissVon` → `_imGrundriss`). Bis K52 trug die Lichtung nur die Scheibe (6,5 m), der Ring stand 11 m weit
// außerhalb: ein Kristall stand 1,2 m vor dem Tor des Terrain-Studios, der Wald wuchs bis an die Tore.
AnazhRealm.GENESIS_PLATZ = Object.freeze({ ringR: 11, rand: 4 });
// DAS GEDÄCHTNIS DER GESTALT DES ORTS (K51-5, `_ortGestaltSame`): Eimer in Metern und die Reichweite eines Grundrisses — ein
// Baum fragt die Natur-Wand für Nachbarn bis ±4 Wald-Zellen (5 × 12 m bis zur fernsten Ecke) samt deren Krone (≤ 36 m,
// `KRONE_MAX_M`: die größte Krone eines Darts; auch die Reichweite, in der ein Erdbau Darts fällt, `_forestDartsFallen`)
AnazhRealm.KRONE_MAX_M = 36;
AnazhRealm.ORT_SAME_EIMER = 48;
// DER PLATZ DES VORSCHAU-WAGENS im Takt (`_ensurePortalPreview`): so viele Orte der Platz-Suche (`_fahrPlatzWege`) je Takt —
// je Ort eine Ebene der Räder (4 Proben des Bodens, ~0,13 ms), an einem tragenden Ort die Bahn und die Welt.
AnazhRealm.FAHR_PLATZ_JE_TAKT = 6;
// Offener Flügel-Winkel der Welt-Tore (Nähe öffnet): wohnt NUR im porta-Gesetzbuch
// (__portaCore.TUER_GESETZ.offen — Shell UND Welt lesen die EINE Quelle); Leser fail-closed nach dem
// _sprintMulGesetz-Muster (Gesetz() memoisiert je Pfad).
AnazhRealm._tuerOffenRad = function () {
    const o = AnazhRealm.Gesetz("porta:TUER_GESETZ.offen", null);
    if (Number.isFinite(o) && o > 0) return o;
    return AnazhRealm._kernPflichtBruch("porta:TUER_GESETZ.offen");
};
// Die Fern-Pose der Tor-Flügel (K43-2): der Anteil von `offen`, in dem die Flügel jenseits der Tür-Nähe stehen — die Stufe 1
// trägt ihn im Körper (porta-core `baueStufe`), die Stufe 0 öffnet von ihm (`_tickTorFluegel`). Fail-closed.
AnazhRealm._tuerFernAnteil = function () {
    const f = AnazhRealm.Gesetz("porta:TUER_GESETZ.fern", null);
    if (Number.isFinite(f) && f >= 0 && f <= 1) return f;
    return AnazhRealm._kernPflichtBruch("porta:TUER_GESETZ.fern");
};
// DIE WELT-AKTE DER DSL (0710-7): jeder Op, der die Welt, ihre Wesen oder den Spieler verändert — Bauten und Spawns, der
// Boden und seine Sichtbarkeit, Zeit und Himmel, die Würfel auf Größe/Tempo/Farbe/Stimmung der Tiere, die Werte und die
// Ausrüstung des Spielers, das Feld. Unter dem Halt einer Messung (`_messHalt`) verweigert `dslEval` jeden von ihnen; das Wetter hält sein eigener
// Schreiber (`_setWeather`). Nicht hier: Definitionen (define_* · set_*_role · register_tool …), Erzählung (say ·
// record_narrative) und Kontrollfluss — sie verändern keine gemessene Welt. gate:weltakt-wache hält den Pool des Nexus
// (`dslComposeAtomic`) in dieser Liste.
// DIE QUELLEN DES SPIELERS (`_spielerVerlangt`, neben „human"): der Begleiter, der seinen Satz ausführt, und seine Werkzeuge —
// die Fähigkeit per Taste, das Wirken, der Verzehr (gate:settlement C7).
AnazhRealm.SPIELER_QUELLEN = Object.freeze(["llm:", "ability:", "capability:", "consume:"]);

// Große Strukturen werden footprint-bewusst aus dem Spieler-Bereich geschoben (sonst Remesh seines
// Chunks + Überlappung → Fall durch den Boden); kleine, intentional platzierte bleiben unangetastet.
AnazhRealm.STRUCTURE_PLAYER_CLEAR_MARGIN = 3.5; // m über den Footprint hinaus
// Der Satz der Welt, wenn ein Dorf nicht entstehen kann, weil das Studio-Buch noch nicht da ist (V-D8: das Log nennt den
// Grund mit Worker-Zustand, der Spieler hört Worte).
AnazhRealm.SIEDLUNG_KALT_SATZ = "Die Werkstatt der Welt erwacht noch — versuch es gleich noch einmal.";
