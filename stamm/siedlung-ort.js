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
    // (`spawnSettlement` über `_ortPlanWarten`), der Export (`_spawnSettlementFromExport`) und das Auto-Dorf
    // (`_tickAutoSettlement`); die Slot-Quelle liest `slot.y`.
    // DIE ORT-WAHL (K10, Pflicht-OFFEN C: „Häuser im Fluss-Bett heilen am Plan"): der Anker ist der Wunsch; der Plan steht am
    // nächsten Ort der Ringe um ihn (`ORT_WAHL`: je `schrittM` ein Ring bis zur halben Siedlungs-Zelle, auf jedem Ring Orte im
    // Abstand ≤ `schrittM`), an dem er JEDES Haus trägt (`_ortTraegt`: jede Platte samt Saum und Vorplatz liegt auf dem
    // Boden des Plans, `WERK_LAND_M` über dem Wasser des Gesetzes — das Urteil der Wasser-Wand jedes Werks, `_fundamentLand` —,
    // kein Haus in einem Bau, `_bauFrei`, keins auf dem Spieler). Bis K10-6 stand das Auto-Dorf der Welt am Wunsch: vier
    // Platten lagen 0,6 m unter dem Spiegel des Flusses, die Wand warf die Häuser (12/16); die Ringe bis 72 m fanden keinen
    // Ort (der Fluss läuft 18 m neben dem Anker, das Dorf misst 65 m Radius, der nächste trockene Ort liegt 80 m weit). Der
    // Anker folgt dem Ort des Plans (`origin` x, z und seine Mitte). Ohne trockenen Ort bleibt der Wunsch, laut.
    // DIE ARBEIT IM TAKT (Lehre 14): die Wahl ist EIN Generator (`_ortWahl`), der nach jedem Kandidaten und jedem Haus abgibt
    // — bis K10-6 rechnete der Takt bis zu 49 Pläne samt Raster am Stück (≈ 34 ms je Kandidat, 1,7 s im Takt). Ihn fahren
    // `_ortPlanSetzen` ganz (der Export, der Prüfstand), `_ortPlanWarten` über Takte (der Akt) und der Dorf-Zug je Takt eine
    // Scheibe (`_tickAutoSettlement`); jede Scheibe `ORT_WAHL.taktMs` (`_ortWahlScheibe`).
    _ortPlanSetzen(plan, origin) {
        return this._ortWahlScheibe(this._ortWahl(plan, origin), Infinity).value;
    }
    _ortPlanWarten(plan, origin) {
        const job = this._ortWahl(plan, origin);
        return new Promise((fertig) => {
            const takt = () => {
                const s = this._ortWahlScheibe(job, AnazhRealm.ORT_WAHL.taktMs);
                if (s.done) fertig(s.value);
                else setTimeout(takt, 16); // eine Scheibe je Bild (60 Hz), nie die Lücke zwischen zwei Bildern ganz
            };
            takt();
        });
    }
    // EINE Scheibe der Ort-Wahl: der Generator läuft, bis er fertig ist oder `ms` verstrichen sind (mindestens ein Schritt).
    // Die Kosten der laufenden Wahl stehen in `_ortWahlMass` (Kandidaten, Scheiben, Summe, die längste Scheibe, der Abstand
    // des Orts zum Wunsch) — gate:settlement Teil O liest sie.
    _ortWahlScheibe(job, ms) {
        const t0 = performance.now();
        let s;
        do s = job.next();
        while (!s.done && performance.now() - t0 < ms);
        const d = performance.now() - t0;
        const m = this._ortWahlMass;
        if (m) {
            m.scheiben++;
            m.ms += d;
            if (d > m.maxMs) m.maxMs = d;
        }
        return s;
    }

    // ═══ DIE WELT-MEMBRAN: die Portal-PASSAGE in der Hauptwelt ═══
    // Liest DASSELBE Gesetz wie das Lab (porta-core MEMBRAN_GESETZ + membranUniforms + membranPalette) als
    // TSL-Material — Technik ist Leser-Sache, die ZAHLEN sind EINE Quelle (diag-membran-gesetz). Bogen-
    // Beschnitt faltet in die Alpha statt discard. Aktivierung = Spieler-Nähe (aktivDepth/finalK);
    // Durchqueren der Membran-Ebene = BETRETEN (derselbe enterPortal-Chokepoint wie die E-Taste).

    // Die geteilte Membran-Geometrie je Gestalt (Plane spanW×height, Gesetz-seg).
    // DIE HÜLLE UM DIE WELLE (0910-4, Spike der Prüf-Welt 10.10.): die Membran trug `frustumCulled = false` („Wellen-
    // Verformung sprengt die statische Hülle") und zeichnete am Genesis-Ring 8 Befehle und 129 600 Dreiecke auch mit dem
    // Ring im Rücken. Die Welle (`positionNode = (x, y, d0)`) verschiebt jede Ecke NUR in z, und |d0| ≤ der Amplitude des
    // Gesetzes (`_membranAmplitude`): die Hülle trägt sie, das Culling bleibt an. Die Notfall-Fläche liegt in z = 0, also darin.
    _membranGeometryFor(tor) {
        if (!this._membranGeoMemo) this._membranGeoMemo = new Map();
        let geo = this._membranGeoMemo.get(tor.gestalt);
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
            this._membranGeoMemo.set(tor.gestalt, geo);
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
        // der Film spiegelt die Heimat: den EINEN Himmel (`_himmelUmgebungTex`, wie das Wasser) in der Spiegel-Richtung, aus dem
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
    // Kopie, nie den Bau einer Welt). Jedes Ziel ist EINE Zeile EINES Atlas (rgba16float, 512 × 256·N, +1 MB je Ziel); die
    // Membran liest ihre Zeile als Stoff-Wert `ziel` mit demselben Knoten. Das TOR lebt ohne sein Ziel (Hindurchgehen, Flügel,
    // Licht: `_tickPortalMembranes`), nur das FENSTER wartet darauf — ohne Ziel kein Zwischen-Bild. Eine Welt, die der Export
    // benannt ohne Panorama führt (`ohne`: die sandgesicherten Welten ohne Skript), zeigt keins; eine, die er nicht kennt, bricht
    // laut beim Namen (`_bruchMelden`).
    static get TOR_ZIEL() {
        return { w: 512, h: 256, format: 1, karte: "worlds/tor-ziele.json" };
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
        return (
            this._torZielAtlas ||
            (this._torZielAtlas = {
                welten: new Map(),
                n: 0,
                tex: null,
                uZeilen: TSL.uniform(1),
                uBelicht: TSL.uniform(1),
                buendel: null,
            })
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
    _torZielEinsetzen(da) {
        const G = AnazhRealm.TOR_ZIEL;
        const Z = this._torZiele();
        const zeile = G.w * G.h * 4;
        const n = Z.n + da.length;
        const platz = Z.tex ? Z.tex.image.height / G.h : 0;
        if (n > platz) {
            let offen = 0; // die angefragten Welten mit Bild (keine benannt ohne, keine gebrochene)
            for (const x of Z.welten.values()) if (!x.ohne && !x.fehler) offen++;
            const hoch = Math.max(n, offen);
            const neu = new Uint16Array(zeile * hoch);
            if (Z.tex) {
                neu.set(Z.tex.image.data.subarray(0, Z.n * zeile));
                Z.tex.image = { data: neu, width: G.w, height: G.h * hoch };
            } else {
                Z.tex = new THREE.DataTexture(neu, G.w, G.h * hoch, THREE.RGBAFormat, THREE.HalfFloatType);
                Z.tex.name = "tor-ziel";
                Z.tex.wrapS = THREE.RepeatWrapping;
                Z.tex.minFilter = THREE.LinearFilter;
                Z.tex.magFilter = THREE.LinearFilter;
                Z.tex.generateMipmaps = false;
            }
            Z.uZeilen.value = hoch;
        }
        for (const [z, daten] of da) {
            Z.tex.image.data.set(daten, Z.n * zeile);
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
        const o = z.zeile * G.w * G.h * 4;
        const roh = Z.tex.image.data.subarray(o, o + G.w * G.h * 4);
        const daten = new Float32Array(roh.length);
        for (let i = 0; i < roh.length; i++) {
            const h = roh[i];
            const e = (h >> 10) & 31,
                m = h & 1023,
                s = h & 0x8000 ? -1 : 1;
            daten[i] =
                e === 0 ? s * m * 2 ** -24 : e === 31 ? (m ? NaN : s * Infinity) : s * (1 + m / 1024) * 2 ** (e - 15);
        }
        return { w: G.w, h: G.h, daten, quelle: z.quelle, stempel: z.stempel, world: z.world };
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
            rec.puls = 0.5 + 0.5 * Math.sin(currentTime * MG.puls);
            if (rec.u) {
                rec.u.time.value = currentTime;
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
            rec._fluegel = [];
            const groups = this.state.archInstanceGroups;
            if (groups) {
                for (const s of slots) {
                    const g = groups.get(s.key);
                    const t = s.tuer || (g && g.tuer);
                    if (g && t) rec._fluegel.push({ g, ref: s, tuer: t });
                }
            }
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
    }

    // ═══ KAMIN-RAUCH ═══
    // Quellen aus Settlement-Einträgen mit rauchQuelle; Lab-Partikel (matte Box) wenn THREE+scene da,
    // sonst Quellen-Liste + einmaliger Log/Flugschreiber-Stempel. Invariante: Rauch ⟺ chimney.
    // Haus-Türen: _tickHausTueren dreht nahe Häuser (< 40 m) durch DENSELBEN _tickTorFluegel.
    _updateDorfRauch(_dt) {
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
        for (let k = dr.teilchen.length - 1; k >= 0; k--) {
            const T2 = dr.teilchen[k];
            T2.y += T2.vy;
            T2.x += T2.dx;
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
    _foundryRequestSettlement(dp) {
        const f = this._ensureAssetFoundry();
        if (!f || !f.ready || !f.worker) return Promise.resolve(null);
        // Durch DIE EINE WORKER-SCHLANGE, sofort dran (ein deliberater Akt, reine Daten). Dieselbe EINE Frist (45 s
        // Arbeit): ohne Uhr hielte ein verlorener Export die FIFO-Uhr aller späteren Aufträge an.
        return this._foundryAuftrag(
            f,
            "stl-",
            { type: "export-settlement", dp: dp || {} },
            0,
            45000,
            "FOUNDRY TIMEOUT: export-settlement nach 45 s Arbeit ohne Reply → null"
        );
    }
    // DIE EINE SLOT-QUELLE: `_spawnSettlementFromExport` (alle Slots sofort) und `_tickAutoSettlement`
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
        for (const e of this.state.architectures || []) {
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
            const g = this._grundrissVon(e);
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

    // Die Bau-Wand für einen runden Bau des Dorfs (Brunnen, Marktstand): das Quadrat in seinem Fußabdruck-Kreis (Radius aus
    // dem Bauplan) — ein Nachbar, der den Kreis nur streift, sperrt nicht.
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

    // DER GRUNDRISS EINES SLOTS (haus-lokal): das obb des Exports um seine Mitte — die obb-Mitte (Siedlungs-Rahmen wie
    // slot.x/z) liegt bis 1,8 m neben dem Haus-Ursprung (das Hof-Haus 4 m), haus-lokal als Versatz {ox,oz}. Ohne obb
    // (fremder Export) der Kern der Tür-Zeile — derselbe Grundriss, den die Wand jedes Werks an der Wurzel aus den
    // Optionen liest (`_werkGrundriss`). `fundament` nur mit obb (das Haus eines Orts trägt den Saum seines Erdbaus).
    // Leser: die Slot-Quelle (`_spawnSettlementSlot`) und die Ort-Wahl (`_ortTraegt`).
    static _slotGrundriss(slot) {
        const ry = slot.phi || 0;
        const rc = Math.cos(ry);
        const rs = Math.sin(ry);
        const obb = slot.obb;
        const tu = slot.tuer;
        let fundament = null;
        if (obb && Number.isFinite(obb.ex) && Number.isFinite(obb.ez) && obb.ex > 0 && obb.ez > 0) {
            const dxw = Number.isFinite(obb.cx) ? obb.cx - slot.x : 0;
            const dzw = Number.isFinite(obb.cz) ? obb.cz - slot.z : 0;
            fundament = { ex: obb.ex, ez: obb.ez, ox: dxw * rc - dzw * rs, oz: dxw * rs + dzw * rc };
        }
        const fp =
            fundament ||
            (tu && Number.isFinite(tu.W) && Number.isFinite(tu.D)
                ? { ex: tu.W / 2, ez: tu.D / 2, ox: 0, oz: 0 }
                : null);
        return { fundament, fp };
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
        const rec = f && f.recipes ? f.recipes[slot.kultur] : null;
        const pol = rec && AnazhRealm.KIND_POLICY[rec.kind];
        const name = pol && pol.prefix ? pol.prefix + slot.kultur : null;
        if (!name || !this.state.blueprints[name]) return false; // fail-closed
        const ry = slot.phi || 0;
        const tu = slot.tuer;
        const { fundament, fp } = AnazhRealm._slotGrundriss(slot);
        const wx = origin.x + slot.x;
        const wz = origin.z + slot.z;
        // DIE WASSER-WAND über dem ganzen Grundriss und dem Vorplatz der Tür (`_fundamentLand`, die EINE Probe mit der Wand
        // jedes Werks) und DIE BAU-WAND (kein Haus IN einem bestehenden Bau, keine Haustür an dessen Wand, `_bauFrei`): der
        // Slot fällt an seinem Ort geschlossen — der Plan ist das Dorf, die Welt rückt kein Haus.
        if (!this._fundamentLand(wx, wz, ry, fp, tu, fundament ? globalThis.__fachwerkCore.ORT_GESETZ.saumM : 0))
            return false;
        if (!this._bauFrei(wx, wz, ry, fp || { ex: 0.5, ez: 0.5, ox: 0, oz: 0 }, tu, slot.y)) return false;
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
                fundament,
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
        return entry || false; // das gesetzte Haus (die Dorf-Mitte summiert, wo es steht)
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
                seed: ((plan.seed >>> 0 || 1) + 97 + k * 7919) >>> 0,
                rotationY: Number.isFinite(l.th) ? -l.th : 0,
                silent: true,
                autonomous: !!(so && so.autonomous),
            }
        );
    }
    // ═══ DORF-ERLEBNIS: der EINE Hebe-Chokepoint für die Nicht-Haus-Schichten des Exports ═══
    // Wege/Feldwege/Platz → Wege-Pool (`_stlWegeBuild`, dieselbe Höhen-Quelle wie die Häuser); Brunnen
    // über `spawnArchitecture` (Bauplan `brunnen_dorf`). Aufrufer: `spawnSettlement` ·
    // `_autoSettlementSpawnCell` · Reload-Rebuild (so.nurWege — Brunnen sind persistierte Architektur).
    // Konsum: fences/felder/trees/staende/brunnen/laternen (die Studio-Gestalt `laterne_dorf`, ihr Licht das Datum ihres
    // Rezepts); unkonsumiert (export-stripped): mauer/fluss.
    _spawnSettlementErlebnis(plan, origin, so) {
        if (!plan || !origin) return;
        this._stlWegeBuild(plan, origin, so && so.key ? so.key : null);
        if (so && so.nurWege) return;
        // DIE LATERNEN (K10 × K11): jede Laterne des Plans steht als Studio-Gestalt (Bauplan `laterne_dorf`, fachwerk
        // AUSSTATTUNG `laterne`) — der Leib und das Licht EINER Quelle: das Verzeichnis „licht" stempelt den Eintrag aus dem
        // Datum seines Rezepts (`_lichtDatumDerGestalt`), der Licht-Takt liest ihn wie jede Feuerstelle. Keine Kappe: das
        // Gesetz des Plans setzt die Zahl (je Platz eine, je 25 m Weg eine); Wasser- und Bau-Wand wie der Brunnen. Die Laterne
        // des Plans mit `wand` (K66-2) ist die Wandlaterne: sie hängt an der Wand ihres Hauses und steht MIT ihm
        // (`_spawnSettlementSlot`), nie hier.
        if (Array.isArray(plan.laternen)) {
            let k = 0;
            for (const l of plan.laternen) {
                if (!l || l.wand) continue;
                const ort = this._dorfLaterneOrt(l, origin);
                if (ort) this._dorfLaterneSetzen(plan, l, ort, k++, so);
            }
        }
        if (!Array.isArray(plan.brunnen) || !this.state.blueprints || !this.state.blueprints.brunnen_dorf) return;
        let n = 0;
        for (const b of plan.brunnen) {
            if (n >= 5) break; // Kappe (Kernel-Brunnen + je 8 Häuser einer)
            if (!b || !Number.isFinite(b.x) || !Number.isFinite(b.z)) continue;
            const wx = origin.x + b.x;
            const wz = origin.z + b.z;
            if (!this._landAt(wx, wz, 0.2)) continue; // die Wasser-Wand (EINE Quelle)
            const wy = this.getTerrainHeightAt(wx, wz);
            if (!Number.isFinite(wy)) continue;
            if (!this._bauFreiRund("brunnen_dorf", wx, wz, wy)) continue; // die Bau-Wand: nie in einem Bau
            const entry = this.spawnArchitecture(
                "brunnen_dorf",
                { x: wx, y: wy + 0.5, z: wz },
                {
                    seed: ((plan.seed >>> 0 || 1) + n * 7919) >>> 0, // deterministisch je Siedlung+Platz
                    silent: true,
                    autonomous: !!(so && so.autonomous),
                }
            );
            if (entry) n++;
        }
        // SCHICHT-VOLLENDUNG (18.07.) — DIE MARKTSTÄNDE (staende-Schicht, nur
        // Markt-Plätze): das brunnen_dorf-Muster — builtIn-Bauplan, der EINE
        // Chokepoint, Kappe 3, Wasser-Wand, deterministisch je Siedlung+Platz.
        if (Array.isArray(plan.staende) && this.state.blueprints && this.state.blueprints.marktstand_dorf) {
            let m = 0;
            for (const st of plan.staende) {
                if (m >= 3) break;
                if (!st || !Number.isFinite(st.x) || !Number.isFinite(st.z)) continue;
                const wx = origin.x + st.x;
                const wz = origin.z + st.z;
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
                        seed: ((plan.seed >>> 0 || 1) + 53 + m * 7919) >>> 0,
                        rotationY: pz && Number.isFinite(pz.cx) ? Math.atan2(-(pz.cx - st.x), -(pz.cz - st.z)) : 0,
                        silent: true,
                        autonomous: !!(so && so.autonomous),
                    }
                );
                if (entry) m++;
            }
        }
        // Hof-Bäume der Siedlung: die Export-Plätze ({x,z,h}) heben als Studio-Bäume durch spawnArchitecture;
        // h skaliert auf die Export-Höhe (eiche fx.height 6.2). Kappe 12 (Architektur-LOD/Instanzen-Budget),
        // Wasser-Wand, deterministisch je Siedlung + Platz.
        if (!Array.isArray(plan.trees)) return;
        const baumArten = ["baum_eiche", "baum_birke"];
        let t = 0;
        for (const b of plan.trees) {
            if (t >= 12) break;
            if (!b || !Number.isFinite(b.x) || !Number.isFinite(b.z)) continue;
            const wx = origin.x + b.x;
            const wz = origin.z + b.z;
            if (!this._landAt(wx, wz, 0.2)) continue;
            const wy = this.getTerrainHeightAt(wx, wz);
            if (!Number.isFinite(wy)) continue;
            const seedT = ((plan.seed >>> 0 || 1) + 31 + t * 7919) >>> 0;
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
                }
            );
            if (entry) t++;
        }
    }
    _spawnSettlementFromExport(plan, origin, so) {
        if (!plan || !Array.isArray(plan.slots) || !origin) return { placed: 0, skipped: 0, mitte: null };
        plan = this._ortPlanSetzen(plan, origin); // der Ort auf dem Gelände (K10): jeder Slot trägt seinen Boden
        const f = this._foundry;
        let placed = 0;
        let skipped = 0;
        let mx = 0;
        let mz = 0;
        const haeuser = [];
        for (let si = 0; si < plan.slots.length; si++) {
            // das gesetzte Haus (`_spawnSettlementSlot`): am Anker + seinem Slot, auf dem Boden des Plans (K10), mit seinen
            // Wandlaternen (K66-2: `plan` + `si`)
            const haus = this._spawnSettlementSlot(plan.slots[si], origin, f, {
                autonomous: !!(so && so.autonomous),
                plan,
                si,
            });
            if (haus) {
                placed++;
                haeuser.push(haus);
                mx += haus.position.x;
                mz += haus.position.z;
            } else skipped++;
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

    async spawnSettlement(opts) {
        const o = opts && typeof opts === "object" ? opts : {};
        let seed = Number.isFinite(o.seed) ? Number(o.seed) : NaN;
        if (!Number.isFinite(seed)) seed = this._bauSame("stadt");
        // ZENSUS-REST V18.488 — der Stamm KLEMMT nur, er defaultet nie: ohne
        // o.nH führt der Kern-Default (fachwerk DORF: DP.nH — die EINE
        // Wahrheit; der divergente Stamm-Zwilling 18 vs Kern 24 ist gefallen).
        let nH = Number.isFinite(o.nH) ? Math.max(4, Math.min(120, Number(o.nH))) : undefined;
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
        if (o.nHAusGesetz && nH === undefined) {
            const SG = AnazhRealm._siedlungGesetz();
            if (!SG) {
                this.log("SIEDLUNGS-GESETZ FEHLT im Buch: Dorf-Spawn BLOCKIERT (keine Größe ohne Gesetz).", "ERROR");
                this._chatEcho?.(AnazhRealm.SIEDLUNG_KALT_SATZ);
                return null;
            }
            nH = SG.nHMin + ((seed >>> 24) % SG.nHSpan);
        }
        return this._foundryRequestSettlement({ seed, nH, epoche: o.epoche, budget: o.budget }).then(async (plan) => {
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
            // die Ort-Wahl rechnet in Takt-Scheiben (`_ortPlanWarten`, Lehre 14), der Akt wartet auf sie
            plan = await this._ortPlanWarten(plan, anchor);
            const res = this._spawnSettlementFromExport(plan, anchor, { autonomous: !!o.autonomous });
            // DORF-ERLEBNIS — Wege/Platz/Brunnen + das Rebuild-Gedächtnis („d:<seed>"
            // im selben settlementCells-Pfad: die Wege-Streifen überleben den Reload).
            const wmD = this.state.worldMeta || (this.state.worldMeta = {});
            if (!wmD.settlementCells || typeof wmD.settlementCells !== "object") wmD.settlementCells = {};
            // der Wege-Schlüssel trägt den ORT: zwei Siedlungen mit demselben Samen bauen je ihre Wege (vorher gewann die
            // erste, die Stadt `dorf 7 120` neben `dorf 7 18` stand ohne einen Weg — Leben-Prüfung S-W1)
            const dKey = "d:" + seed + "@" + Math.round(anchor.x) + "," + Math.round(anchor.z);
            if (!wmD.settlementCells[dKey]) wmD.settlementCells[dKey] = { seed, nH, x: anchor.x, z: anchor.z };
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
    // Nexus. Der Zähler ist Welt-Gedächtnis (`worldMeta.bauSame`, reist im Snapshot und zum Gast): als Sitzungs-Feld
    // begann er nach jedem Reload neu, und derselbe Satz am selben Ort stellte einen deckungsgleichen zweiten Hain.
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
    // `bm` (Vorschau, Hand) zeigt der Name das Werk der Art; ein Wurf der Werkstatt steht genau so, wie gewürfelt.
    _werkSame(bp, name, bm) {
        const wurf = bp ? bp._grownSeed || bp._rockSeedBase || bp._crystalSeedBase : null;
        const art = name != null ? name : bp && bp.name;
        if (wurf == null && bm) {
            if (!bm.setzSame || bm.setzSame.art !== art) bm.setzSame = { art, same: this._bauSame("bau:" + art) };
            return bm.setzSame.same;
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
    _autoSettlementCellInfo(cx, cz) {
        // ZENSUS 17.07. — Existenz/Raster/Größe sind fachwerk-Gesetz (SIEDLUNG); kaltes Buch → keine Zelle.
        const A = AnazhRealm._siedlungGesetz();
        if (!A) return null;
        const wm = this.state.worldMeta || {};
        const s = `${wm.seed || "anazh-realm-seed"}:dorf:${cx},${cz}`;
        let h = 2166136261 >>> 0;
        for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619) >>> 0;
        }
        if (h % A.rarity !== 0) return null; // Dörfer sind besonders (selten)
        // getrennte Seed-Bit-Bänder (die V18.181-Disziplin): Anker-Jitter (>>>8/>>>16,
        // ±¼ Zelle — kein Raster-Look) + Dorf-Größe (>>>24).
        const jx = (((h >>> 8) & 0xff) / 255 - 0.5) * A.cellM * 0.5;
        const jz = (((h >>> 16) & 0xff) / 255 - 0.5) * A.cellM * 0.5;
        return {
            key: cx + "," + cz,
            seed: h >>> 0 || 1,
            nH: A.nHMin + ((h >>> 24) % A.nHSpan),
            x: (cx + 0.5) * A.cellM + jx,
            z: (cz + 0.5) * A.cellM + jz,
        };
    }
    // Site-Wände am Anker (die Slot-Wände prüft `_spawnSettlementSlot` je Haus zusätzlich). `noSpawnClear`
    // öffnet NUR dem Start-Dorf die Spawn-Klar-Wand; Wasser/Steil bleiben für jede Site dieselbe Wand.
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

    _autoSettlementSiteOk(x, z, noSpawnClear) {
        // Der Dorf-Ort ist ein Wurf des Feldes (Auto-Dorf, Start-Dorf): wo die Wildnis nicht trägt, steht keins.
        if (!this._wildnisTraegt(x, z)) return false;
        const A = AnazhRealm.AUTO_SETTLEMENT; // Wirt-Streaming (spawnClearM)
        if (!noSpawnClear) {
            const g = this._genesisMitte();
            if (Math.hypot(x - g.x, z - g.z) < A.spawnClearM) return false; // die Warmup-Welt bleibt dorffrei
        }
        if (!this._landAt(x, z, 0.2)) return false; // die Wasser-Wand (EINE Quelle)
        const slope = this._slopeAt ? this._slopeAt(x, z) : 0;
        // ZENSUS 17.07. — die Steil-Wand ist fachwerk-Gesetz (SIEDLUNG.slopeMax).
        const SG = AnazhRealm._siedlungGesetz();
        return !!SG && !(Number.isFinite(slope) && slope > SG.slopeMax); // flach genug
    }
    // Site-Suche: der flache, trockene Fleck NAHE des Ankers statt Tod an einem Punkt (sonst fällt die
    // Mehrheit der Zellen an der Steil-Wand). Γ5 aus dem Zell-Seed: Anker zuerst, dann je Probe-Ring
    // 4 Proben (Phase aus Seed, Ring 2 um 45° verdreht) durch `_autoSettlementSiteOk`. null = kein Dorf.
    _autoSettlementFindSite(info) {
        const A = AnazhRealm.AUTO_SETTLEMENT; // Wirt-Streaming (siteProbeR)
        if (this._autoSettlementSiteOk(info.x, info.z)) return { x: info.x, z: info.z };
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
                if (this._autoSettlementSiteOk(px, pz)) return { x: px, z: pz };
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
                return { key: "start", seed: h >>> 0 || 1, nH: S.nHMin + ((h >>> 24) % S.nHSpan), x, z };
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
    // Funktion des Zell-Seeds → der Wege-Rebuild trifft dieselbe Epoche. Fail-closed bei kaltem Kern.
    _siedlungEpoche(seed) {
        const E = AnazhRealm.Gesetz("fachwerk:EPOCHEN", null);
        const namen = E && typeof E === "object" ? Object.keys(E) : [];
        if (!namen.length) return AnazhRealm._kernPflichtBruch("fachwerk:EPOCHEN");
        let h = (Math.imul(seed >>> 0 || 1, 2654435761) + 0x9e3779b9) >>> 0;
        h = (h ^ (h >>> 16)) >>> 0;
        if (h % 3 !== 0) return undefined; // 2 von 3 bleiben Region-Historie (die legitime Weiche)
        return namen[(h >>> 4) % namen.length];
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
        if (wm.settlementCells[key] || this._autoSettlementPendingKey) return Promise.resolve(null);
        this._autoSettlementPendingKey = key;
        return this._foundryRequestSettlement({
            seed: i2.seed,
            nH: i2.nH,
            epoche: this._siedlungEpoche(i2.seed), // ZENSUS-REST V18.488 — die Epochen-Legende
        }).then((plan) => {
            this._autoSettlementPendingKey = null;
            if (!plan || !Array.isArray(plan.slots)) return null; // fail-closed (Foundry kalt)
            // Der Anker misst den Plan selbst (`_siedlungsAnker`, die EINE Regel jedes Dorfs): nie um den Spieler —
            // relevant nur im Restore-nahe-einer-unbesiedelten-Zelle-Fall, fern bleibt die Zelle, wie sie ist. Die
            // Schätzung `_structureSpawnPos("haus_basis")` vor dem Plan ist gefallen (Gegenprüfung Runde 1).
            const anchor = this._siedlungsAnker(plan, { x: i2.x, y: 0, z: i2.z });
            // DER ORT AUF DEM GELÄNDE (K10): der Plan v2 am Ort, den die Ort-Wahl um den Anker findet (der Anker folgt ihm),
            // sein Erdbau liegt, bevor das erste Haus steht; die Wahl rechnet in Takt-Scheiben (`_ortPlanWarten`, Lehre 14) —
            // so lange gilt der Export als unterwegs (der Zug beginnt keine zweite Zelle, die Messung schwingt nicht ein)
            this._autoSettlementPendingKey = key;
            return this._ortPlanWarten(plan, anchor).then((v2) => {
                this._autoSettlementPendingKey = null;
                // Die Reservierung trägt das Rebuild-Gedächtnis {seed,nH,x,z}: Häuser/Brunnen persistieren als
                // architectures, die Wege (kein Save-Byte) baut `_tickAutoSettlement` nach Reload am Anker neu.
                // Alle Leser fragen nur Existenz (truthy).
                wm.settlementCells[key] = { seed: i2.seed, nH: i2.nH, x: anchor.x, z: anchor.z };
                this._autoSettlementQueue = { plan: v2, origin: { x: anchor.x, z: anchor.z }, idx: 0, cellKey: key };
                // Wege/Platz/Brunnen sofort bei ANKUNFT (klein + einmalig; die Häuser
                // materialisieren budgetiert über die Ticks).
                this._spawnSettlementErlebnis(v2, { x: anchor.x, z: anchor.z }, { key });
                if (typeof this._scheduleEditSave === "function") this._scheduleEditSave();
                return v2;
            });
        });
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

    _tickAutoSettlement(playerPos) {
        const st = this.state;
        if (!playerPos || !this._dorfTaktLebt()) return;
        const A = AnazhRealm.AUTO_SETTLEMENT; // Wirt-Streaming (perTick/nearM)
        // (a) BUDGETIERTE MATERIALISIERUNG zuerst: ein angekommener Export baut seine
        // Häuser über Ticks verteilt — erst fertig wachsen, dann die nächste Zelle.
        // EXISTENZ VOR FRAMERATE (Lehre 13, Leben-Prüfung N-D9): das Frame-Budget drosselt das TEMPO des Dorf-Akts, nie
        // seine Existenz — über dem Budget trägt jeder A.drosselTakte-te Takt EINEN Slot bzw. EINEN Akt. Vorher kehrte der
        // Takt über dem Budget um (60 von 60 Proben): auf jedem Gerät über dem Sollwert entstand das Start-Dorf nie.
        const ueber = !!st._frameOverBudget;
        if (ueber) {
            this._dorfDrossel = (this._dorfDrossel || 0) + 1;
            if (this._dorfDrossel % A.drosselTakte !== 0) return;
        }
        const q = this._autoSettlementQueue;
        if (q && q.plan) {
            const f = this._foundry;
            let n = 0;
            while (q.idx < q.plan.slots.length && n < (ueber ? 1 : A.perTick)) {
                const si = q.idx++;
                this._spawnSettlementSlot(q.plan.slots[si], q.origin, f, { plan: q.plan, si }); // mit seinen Wandlaternen (K66-2)
                n++;
            }
            if (q.idx >= q.plan.slots.length) {
                this._autoSettlementQueue = null;
                this.log(
                    `Siedlung „${q.plan.name || "?"}" gewachsen (Zelle ${q.cellKey}, ${q.plan.slots.length} Slots).`,
                    "INFO"
                );
            }
            return;
        }
        if (this._autoSettlementPendingKey) return; // ein Export-Roundtrip zur Zeit
        if (!this._autoSettlementChannelLive()) return; // der Dispatch-Kanal entscheidet (M8)
        const wm = st.worldMeta || {};
        const cells = wm.settlementCells && typeof wm.settlementCells === "object" ? wm.settlementCells : null;
        // Wege-Rebuild: Zellen mit Gedächtnis {seed,nH,x,z} bauen ihre Wege je Session lazy aus DEMSELBEN
        // Export am gemerkten Anker neu (nurWege — Häuser/Brunnen sind persistiert). Alt-Saves mit Wert 1 →
        // keine Wege. EIN Roundtrip zur Zeit, nur nahe Zellen.
        if (cells && !this._stlWegePending) {
            for (const k in cells) {
                const c = cells[k];
                if (!c || typeof c !== "object" || !Number.isFinite(c.x) || !Number.isFinite(c.seed)) continue;
                if (this._stlWegeKeys && this._stlWegeKeys.has(k)) continue;
                const rdx = c.x - playerPos.x;
                const rdz = c.z - playerPos.z;
                if (rdx * rdx + rdz * rdz > A.nearM * A.nearM) continue;
                this._stlWegePending = true; // Instanz-Feld (die _editSaveTimer-Klasse)
                this._foundryRequestSettlement({
                    seed: c.seed,
                    nH: c.nH,
                    epoche: this._siedlungEpoche(c.seed), // dieselbe EINE Epochen-Funktion (Rebuild-Treue)
                }).then((plan2) => {
                    this._stlWegePending = false;
                    if (plan2) this._spawnSettlementErlebnis(plan2, { x: c.x, z: c.z }, { key: k, nurWege: true });
                });
                return; // EIN Dorf-Akt pro Tick
            }
        }
        // Start-Dorf zuerst (einmalig je Welt): nur nahe des Genesis-Orts materialisieren (kein Fern-Spawn hinter
        // dem Rücken). Fail-closed + session-gemerkt: eine Welt ohne Fleck urteilt immer gleich.
        if (this._startDorfFaellig(playerPos)) {
            const si = this._autoSettlementStartInfo();
            if (!si)
                this._autoSettlementStartHopeless = true; // Instanz-Feld (die _editSaveTimer-Klasse)
            else {
                this._autoSettlementSpawnCell(0, 0, si);
                return; // EIN Dorf-Akt pro Tick
            }
        }
        if (!this._autoSettlementRejected) this._autoSettlementRejected = new Set(); // Instanz-Feld (die _editSaveTimer-Klasse)
        // ZENSUS 17.07. — DASSELBE Zell-Raster wie die Zell-Wahrheit
        // (_autoSettlementCellInfo): SIEDLUNG.cellM, das fachwerk-Gesetz.
        const SGz = AnazhRealm._siedlungGesetz();
        if (!SGz) return;
        const cellM = SGz.cellM;
        const pcx = Math.floor(playerPos.x / cellM);
        const pcz = Math.floor(playerPos.z / cellM);
        for (let dz = -1; dz <= 1; dz++) {
            for (let dx = -1; dx <= 1; dx++) {
                const cx = pcx + dx;
                const cz = pcz + dz;
                const key = cx + "," + cz;
                if ((cells && cells[key]) || this._autoSettlementRejected.has(key)) continue;
                const info = this._autoSettlementCellInfo(cx, cz);
                if (!info) {
                    this._autoSettlementRejected.add(key); // Zelle trägt kein Dorf (Hash)
                    continue;
                }
                const ddx = info.x - playerPos.x;
                const ddz = info.z - playerPos.z;
                if (ddx * ddx + ddz * ddz > A.nearM * A.nearM) continue; // noch fern — später
                const site = this._autoSettlementFindSite(info); // Anker zuerst, dann die Probe-Ringe
                if (!site) {
                    this._autoSettlementRejected.add(key); // die ganze Zelle untauglich (Wasser/steil/Spawn-nah)
                    continue;
                }
                this._autoSettlementSpawnCell(
                    cx,
                    cz,
                    site.x === info.x && site.z === info.z ? info : Object.assign({}, info, { x: site.x, z: site.z })
                );
                return; // EIN Dorf-Akt pro Tick
            }
        }
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
    // jedem späteren Bau (gate:settlement Teil O „das Werk derselben Art").
    _weichtDemBau(e) {
        return this._istNatur(e) || (!!e && e.feldWurf === true);
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_siedlung_ort]);

// ===== ATLAS · Siedlung/ort — Außen-Konstanten =====
// DAS LAND EINES WERKS (m über dem Wasser des Gesetzes, `_fundamentLand` → `_landAt`): so hoch liegt jeder Punkt eines
// Fundaments samt Saum und Vorplatz über dem Spiegel — die Wand jedes Werks und die Ort-Wahl (`_ortTraegt`) urteilen gleich.
AnazhRealm.WERK_LAND_M = 0.2;
// Worldgen-Auto-Dorf-Daten (Konsument `_tickAutoSettlement`, Wände + Γ5-Disziplin dort):
// nearM Materialisierungs-Distanz · spawnClearM dorffreier Radius um den Genesis-Ort (nearM < spawnClearM →
// am Spawn wirkt nur das START-DORF) · siteProbeR zwei Probe-Ringe (×cellM), falls der Anker scheitert ·
// startRadiusM Start-Dorf-Radien (einmalig je Welt, Seed ":startdorf") · perTick Häuser je Idle-Tick ·
// drosselTakte das Tempo über dem Frame-Budget.
// DAS WIRT-STREAMING der Auto-Dörfer (nur Host-Größen: wann und wie schnell die Welt baut). Das SIEDLUNGS-GESETZ
// (Raster cellM · Seltenheit rarity · Größe nHMin/nHSpan · Steil-Wand slopeMax) lebt EINMAL in
// fachwerk-core (SIEDLUNG) — der Zwilling hier fiel (Welle L, Karte Dorf/Stadt DEFEKT 4: stiller Fallback mit Kopien).
AnazhRealm.AUTO_SETTLEMENT = Object.freeze({
    nearM: 260,
    spawnClearM: 320,
    siteProbeR: Object.freeze([0.15, 0.3]),
    startRadiusM: Object.freeze([110, 130, 150, 170]),
    perTick: 2,
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
