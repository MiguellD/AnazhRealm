class AnazhRealm_stoff_material {
    // ===== ATLAS · Stoff/material — Uniform-Heimat · PBR-Knoten · Substanz-Antwort · Gras-Stoff und Wind · Stoff-Regler =====
    // DER HALM-STOFF (w4-wiese-nah, phyto-core HALM_GESETZ): jedes Studio-Gras (die Nah-Wiese, ein gesetztes Gras) liest sein
    // Gesetz je Pixel aus seinen Stoff-Koordinaten — uv.x quer in Adern (die Mittel-Rippe bei 0), uv.y die Narbe über der Ecke
    // (foundry-core `emitGrass`):
    //   die NORMALE des Querschnitts: die Geometrie-Normale (Lehre 26: `normalWorldGeometry` × Seite, nie `normalWorld`), um den
    //   Kiel und die Rippen gegen die Breiten-Richtung t = Y × n gekippt (`halmQuer`; u wächst längs t, die Vorlage legt es so
    //   an) — der Pixel (`fwidth` von u) rundet den Kiel und filtert die Rippen: auf Armlänge Detail je Pixel, fern das Mittel,
    //   kein Flimmern; ein liegender Halm (n nahe Y) trägt keine Breiten-Richtung und bleibt eben;
    //   die ALBEDO × die Adern und die hellere Mittel-Rippe (`halmAder`, mittelfrei, gefiltert);
    //   die NARBE: das Himmels-Licht × exp(−kHimmel · Λ) als Verdeckung — das direkte Licht dämpft das Laub-Licht des Halms
    //   (`_laubLichtStoff` mit der Narbe: Lambert, Glanz und Durchlass der Quelle × exp(−K(θ) · Λ));
    //   das DACH (licht.K1, w3v-licht; `HALM_GESETZ.dach`): trägt der Pixel des Schirms mehrere Halme, lichtet die Wiese als Dach —
    //   die Normale zu 0,9 oben, die Rauheit 1 (der doppelseitige Halm lichtete sonst wie eine Wand: die Stunde 0,33 über dem
    //   Mittag, +0,37 EV); auf Armlänge trägt der Halm seinen Querschnitt und die Cuticula der Stoff-Zeile (Satz: `aRegler`).
    // Bis dahin war der Halm ein flaches Band in seiner Vertex-Farbe (die Normale über die Breite gleich), kein Durchscheinen,
    // kein Schatten am Fuß, 18 % des Himmels; der Zwilling `_grassInstanceMat` (eigener Verlauf, eigenes Gegenlicht-Leuchten)
    // zeichnete nichts mehr und fiel. Das Dach stand bis dahin als zweite Normale hinter dem Halm (`_foundryTreeMaterial`).
    _halmStoff(T, mat) {
        const PC = globalThis.__phytoCore;
        const H = PC.HALM_GESETZ;
        const A = AnazhRealm._windTsl(T);
        const uv = T.uv();
        const fw = T.fwidth(uv.x).mul(this._ensureAtmoUniforms().schirmJeSzene);
        const nGeo = T.normalize(T.normalWorldGeometry);
        const quer = T.cross(T.vec3(0.0, 1.0, 0.0), nGeo);
        const ql = quer.length();
        const t = quer.div(ql.max(1e-4)).mul(T.smoothstep(0.02, 0.12, ql));
        const n = T.normalize(nGeo.sub(t.mul(PC.halmQuer(A, uv.x, fw)))).mul(T.faceDirection);
        // der Pixel des Schirms in Metern quer über den Halm: fw Adern × aderM
        const dach = T.smoothstep(H.dach.px[0], H.dach.px[1], fw.mul(H.aderM));
        mat.normalNode = T.cameraViewMatrix.transformDirection(
            T.normalize(T.mix(n, T.vec3(0.0, 1.0, 0.0), dach.mul(H.dach.oben)))
        );
        mat.roughnessNode = T.mix(mat.roughnessNode || T.float(mat.roughness), T.float(1.0), dach);
        mat.colorNode = T.vec4(mat.colorNode.rgb.mul(PC.halmAder(A, uv.x, fw)), mat.colorNode.a);
        mat.aoNode = PC.halmNarbe(A, uv.y, T.float(1.0)).himmel;
        mat.userData.halm = true;
        mat.userData.liestUv = true; // der Halm liest seine Ecken (`_foundryBuildMesh`: nur dann trägt die Gestalt uv)
        return mat;
    }

    // DIE KANONISCHE WIND-SWAY-GRÖSSE — jeder Wind-Leser LIEST sie;
    // Charakter als Parameter: `ampX` (Gras 1.5), `windScale` (Wipfel-Dämpfen, fehlt → 1).
    // phase = uWindTime·1.7 + dot(worldXZ, uWindDir)·0.35; hf = max(positionLocal.y, 0);
    // gust = sin(uWindTime·omega − dot(worldXZ, uWindDir)·k)·amp + mitte — die wandernde Böe, Zahlen aus WIND_BOE (das Ohr
    // liest dieselben, `_windAt`).
    // uBend-Sphären biegen Halme radial weg (min(hf,1)). Render-rein; gibt den vec3-Versatz zurück.
    _windSwayOffset(TSL, opts = {}) {
        const wu = this._windUniformsEnsure();
        this._ensureWindCoupling(TSL);
        const { vec3, float, sin, cos, max } = TSL;
        const naht = this._weltNaht(TSL);
        const positionWorld = naht.lage;
        const ampX = typeof opts.ampX === "number" ? opts.ampX : 1.5;
        const wd = wu.uWindDir || null;
        const dotWW = wd ? positionWorld.x.mul(wd.x).add(positionWorld.z.mul(wd.y)) : null;
        const phase = wu.uWindTime
            .mul(float(1.7))
            .add(
                dotWW ? dotWW.mul(float(0.35)) : positionWorld.x.mul(float(0.28)).add(positionWorld.z.mul(float(0.21)))
            );
        // Höhen-Gewicht = Höhe über der Wurzel. r184 setzt den positionNode VOR die Instanzierung: Phase, Böe und Biegung
        // lesen die Welt-Lage des Vertex aus der EINEN Naht (`_weltNaht`), der Versatz (Welt-Meter, Welt-Richtung) geht
        // über sie in die Vorlage zurück (K20-N1; bis dahin sah jeder Halm die Vorlage — die Wiese wiegte im Gleichtakt,
        // jede Instanz in ihrer eigenen Drehung, die Biegung des Spielers maß gegen die Vorlage). Ein Satz (Welt-Lage,
        // keine Instanz — die Nah-Streu) liest dieselbe Naht (die Einheit). Die Geometrie-Position (`positionGeometry`,
        // Wurzel bei y = 0) trägt die Halm-Höhe; `opts.hoehe` reicht eine eigene Höhe in Metern.
        const hf = max(opts.hoehe || TSL.positionGeometry.y, float(0.0));
        // Die Böe liest WIND_BOE — dieselben Zahlen hört das Ohr (`_windAt`).
        const B = AnazhRealm.WIND_BOE;
        const gust = sin(
            wu.uWindTime
                .mul(float(B.omega))
                .sub(
                    dotWW
                        ? dotWW.mul(float(B.k))
                        : positionWorld.x.mul(float(0.03)).add(positionWorld.z.mul(float(0.024)))
                )
        )
            .mul(float(B.amp))
            .add(float(B.mitte));
        let windEff = wu.uWindStrength.mul(gust);
        if (typeof opts.windScale === "number") windEff = windEff.mul(float(opts.windScale));
        let offX = sin(phase).mul(windEff).mul(hf).mul(float(ampX));
        let offZ = cos(phase.mul(float(0.7)))
            .mul(windEff)
            .mul(hf);
        // uBend: vec4 xyz+Radius (Radius 0 = Slot aus); Halme biegen radial weg, quadratisch auslaufend.
        // NaN-Wand: dist trägt +1e-4 unter der Wurzel; tote Slots liegen bei y=−1e6 mit Radius 0 →
        // max(w, 0.05) hält den Nenner endlich, der Falloff wird exakt 0.
        const uB = wu.uBend;
        const sqrtN = TSL.sqrt;
        const minN = TSL.min;
        if (uB && uB.length && sqrtN && minN) {
            let bendX = float(0.0);
            let bendZ = float(0.0);
            for (let i = 0; i < uB.length; i++) {
                const b = uB[i];
                const dx = positionWorld.x.sub(b.x);
                const dy = positionWorld.y.sub(b.y);
                const dz = positionWorld.z.sub(b.z);
                const dist = sqrtN(dx.mul(dx).add(dy.mul(dy)).add(dz.mul(dz)).add(float(1e-4)));
                const fall = max(float(0.0), float(1.0).sub(dist.div(max(b.w, float(0.05)))));
                const soft = fall.mul(fall);
                bendX = bendX.add(dx.div(dist).mul(soft));
                bendZ = bendZ.add(dz.div(dist).mul(soft));
            }
            const hfB = minN(hf, float(1.0)); // Interaktion wirkt bodennah (Halm/Busch), nicht am Wipfel
            offX = offX.add(bendX.mul(hfB).mul(float(0.4)));
            offZ = offZ.add(bendZ.mul(hfB).mul(float(0.4)));
        }
        return naht.vorlage(vec3(offX, float(0.0), offZ));
    }

    // CPU-Seite der EINEN Wind-Richtung: der Kern (phyto-core `windRichtung`, ±~41° Mäander um die Grundrichtung der Saat,
    // eigener Strom Γ5). Reine Funktion (Saat, t) → Peers/Replays sehen denselben Wind. Liefert {x, z} (Einheitsvektor in XZ,
    // wohin der Wind weht).
    _windDirAt(tSec) {
        return globalThis.__phytoCore.windRichtung(
            (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed",
            tSec
        );
    }

    // DER EINE WIND AM ORT (wetter.K5) — jeder Wind-Leser der Welt liest ihn (Gras und Krone über die Uniforms, Wasser,
    // Regen, Tuch, Rauch, Wagen, Ohr, Nase): die Richtung `_windDirAt`, die Stärke U des Wetters (der Wind-Kanal des
    // Wetter-Felds × die Böen-Drift `_weatherWob`, 0 ruhig … 1 Sturm) vom Gelände geformt (gelaende-core `windForm`: Lee bis
    // −40 %, Tal-Düse bis +20 %, an der Höhe des Gesetzes ohne Detail) und die wandernde Böe am Ort (WIND_BOE, dieselben Zahlen
    // wie der Shader). `staerke` = U · Form (die Böen-Amplitude am Ort ist staerke · WIND_BOE.amp), `ms` der Wind in m/s
    // (staerke · Böe · WIND_FELD.sturmMS). t: die Wind-Uhr — das Bild liest die Bild-Uhr (A9), der Sim-Schritt seine Uhr
    // (`state._simZeit`); der Wind ist eine reine Funktion von Saat, Wetter, Ort und t.
    _windAt(x, z, t) {
        const tt = Number.isFinite(t) ? t : 0;
        const d = this._windDirAt(tt);
        const B = AnazhRealm.WIND_BOE;
        const boe = Math.sin(tt * B.omega - (x * d.x + z * d.z) * B.k) * B.amp + B.mitte;
        const form = this._windForm(x, z, d);
        const staerke = this._weatherFieldFor(this.state.weather).wind * this._windWob(tt) * form;
        return { x: d.x, z: d.z, staerke, boe, form, ms: staerke * boe * globalThis.__phytoCore.WIND_FELD.sturmMS };
    }
    // DIE BÖEN-DRIFT der Wind-Uhr t (Math.random-frei, ~±18 % um die Wort-Basis): bis wetter.K5 ein Feld, das nur das Bild schrieb
    // — der Wagen im Wind hing an der Bildrate (gate:fahr-leben L8 Lockstep 0,37 mm).
    _windWob(t) {
        return 1 + 0.18 * (Math.sin(t * 0.19) * 0.6 + Math.sin(t * 0.47 + 1.3) * 0.3 + Math.sin(t * 1.13 + 3.7) * 0.1);
    }
    // Die Form des Geländes je Zelle von 16 m und 1/64 Drehung, gemerkt je Stand des Gesetzes (Saat, Erbgut, Erdbau — ein
    // neuer Ort formt den Wind neu); der Merker gehört der Instanz.
    _windForm(x, z, d) {
        const L = this._gelaende();
        const stand = [L.seed, L.erbgut, L.erdbau];
        let M = Object.hasOwn(this, "_windFormMerk") ? this._windFormMerk : null;
        if (!M || M.stand.some((s, i) => s !== stand[i]) || M.karte.size > 4096)
            M = this._windFormMerk = { stand, karte: new Map() };
        const ci = Math.floor(x / 16);
        const cj = Math.floor(z / 16);
        const di = (Math.round((Math.atan2(d.x, d.z) / (2 * Math.PI)) * 64) + 64) % 64;
        const k = ci + "," + cj + "," + di;
        let f = M.karte.get(k);
        if (f === undefined) {
            const a = (di / 64) * 2 * Math.PI;
            const H = (hx, hz) => this._terrainMacroSurfaceY(hx, hz, false);
            f = globalThis.__gelaendeCore.windForm(H, (ci + 0.5) * 16, (cj + 0.5) * 16, Math.sin(a), Math.cos(a));
            M.karte.set(k, f);
        }
        return f;
    }

    // Geteilte Kopplungs-Uniforms auf dem EINEN windUniforms-Slot: `uWindDir` (vec2; Leser: Gras/Streu
    // via `_windSwayOffset`, Baum-Laub `_applyVegetationResponse`, Impostor) und `uBend`
    // (GRAS_BEND_SLOTS × vec4). Idempotent; ohne TSL.uniform (Skalar-Mock in gate:kopplung) bleibt ein
    // gesetztes wu stehen. `_loopRender` speist beide pro Frame (`_windDirAt`, `_tickGrasBend`).
    _ensureWindCoupling(TSL) {
        const wu = this._windUniformsEnsure();
        if (!wu.uWindDir) {
            const d0 = this._windDirAt(0);
            wu.uWindDir = TSL.uniform(new THREE.Vector2(d0.x, d0.z));
        }
        if (!wu.uBend) {
            wu.uBend = [];
            for (let i = 0; i < AnazhRealm.GRAS_BEND_SLOTS; i++) {
                wu.uBend.push(TSL.uniform(new THREE.Vector4(0, -1e6, 0, 0)));
            }
        }
        // UNIFORM-HEIMAT: auch die späten Kopplungs-Uniforms (uWindDir/uBend)
        // reisen geteilt — der Satz bleibt EIN renderGroup-Buffer (idempotent).
        this._uniformHeimatTeilen(wu);
        return wu;
    }

    // Füllt die uBend-Slots pro Frame: Spieler · gerittenes Gefährt · die ≤4 nächsten Kreaturen in
    // GRAS_BEND_CREATURE_DIST. Render-rein; O(Kreaturen) ohne Alloc (persistente Arrays,
    // Insertion-Auswahl statt Sort).
    _tickGrasBend() {
        const wu = this.state.windUniforms;
        if (!wu || !wu.uBend) return;
        const B = wu.uBend;
        let slot = 0;
        const pm = this.state.playerMesh;
        if (pm && slot < B.length) B[slot++].value.set(pm.position.x, pm.position.y - 0.4, pm.position.z, 1.3);
        const me = this._mountedEntry;
        if (me && me.position && slot < B.length) {
            B[slot++].value.set(
                me.position.x,
                me.position.y,
                me.position.z,
                Math.max(1.6, (me._rideHalfLen || 1) + 0.6)
            );
        }
        // jeder Leib im Bild biegt das Gras: die Wesen und die Gefallenen (ein Leichnam liegt im Gras, nie das Gras in ihm)
        const crs = this.state.creatures;
        const LG = this.state.leichname;
        const nLeib = crs.length + LG.length;
        if (nLeib && pm) {
            const selD = this._bendSelD || (this._bendSelD = [Infinity, Infinity, Infinity, Infinity]);
            const selI = this._bendSelI || (this._bendSelI = [-1, -1, -1, -1]);
            selD[0] = selD[1] = selD[2] = selD[3] = Infinity;
            selI[0] = selI[1] = selI[2] = selI[3] = -1;
            for (let i = 0; i < nLeib; i++) {
                const c = i < crs.length ? crs[i] : LG[i - crs.length];
                if (!c || !c.position) continue;
                const dx = c.position.x - pm.position.x;
                const dz = c.position.z - pm.position.z;
                const d2 = dx * dx + dz * dz;
                if (d2 > AnazhRealm.GRAS_BEND_CREATURE_DIST_SQ) continue;
                for (let k = 0; k < 4; k++) {
                    if (d2 < selD[k]) {
                        for (let m = 3; m > k; m--) {
                            selD[m] = selD[m - 1];
                            selI[m] = selI[m - 1];
                        }
                        selD[k] = d2;
                        selI[k] = i;
                        break;
                    }
                }
            }
            for (let k = 0; k < 4 && slot < B.length; k++) {
                if (selI[k] < 0) break;
                const c = selI[k] < crs.length ? crs[selI[k]] : LG[selI[k] - crs.length];
                const r = 0.8 + 0.5 * ((c.scale && c.scale.x) || 1);
                B[slot++].value.set(c.position.x, c.position.y - 0.4, c.position.z, r);
            }
        }
        while (slot < B.length) B[slot++].value.set(0, -1e6, 0, 0);
    }

    // Schmal-Wrapper auf _applyDayNightToScene: Skybox-Tint = Tag-Nacht-Tint × Wetter-Tint, pro Frame
    // aus state.timeOfDay + state.weather. Wetterwechsel laufen über requestWeatherTransition
    // (Cross-Fade).
    updateSkyboxWeather() {
        if (typeof this._applyDayNightToScene === "function") {
            this._applyDayNightToScene();
        }
    }

    // DER ZWEIG IM STOFF (K17-2): ein Term, der nur rechnen soll, wo sein Gewicht trägt (der Fels-Term: die Wiese zahlt ihn
    // nicht), reist als ARGUMENT in EINEN Fn-Rumpf, der nur seine Argumente liest — TSL erzeugt den Code des Arguments dort,
    // wo es zuerst gebraucht wird: im Zweig. Der Knoten-Graph sieht den Inhalt (die Argumente sind Kinder des Aufrufs), die
    // Shader-Kosten-Linse (`stoffGraph`) kennt diesen Rumpf (`zweig`); jeder andere Fn ohne Layout bleibt `verborgen` (bis
    // K17-2 trug der Fels-Term seinen Inhalt im Rumpf: RAUSCH-GESETZ (B) 1 verborgener Rumpf). EIN Zweig je TSL-Modul.
    // zweig(inhalt: vec3, gewicht: float) → inhalt, wo gewicht > 1e-3, sonst vec3(1).
    static _zweigTSL(T) {
        if (AnazhRealm._zweigMemo && AnazhRealm._zweigMemo.T === T) return AnazhRealm._zweigMemo.fn;
        const fn = T.Fn(([inhalt, gewicht]) => {
            const v = T.vec3(1, 1, 1).toVar("zweig");
            T.If(gewicht.greaterThan(1e-3), () => {
                v.assign(inhalt);
            });
            return v;
        });
        AnazhRealm._zweigMemo = { T, fn };
        return fn;
    }

    // DAS RECHENWERK DES FELS-GESETZES IM SHADER (K17, Nachbesserung 2): gelaende-core rechnet seinen Fein-Term (`felsFein`,
    // `schuttKorn`) über ein Rechenwerk — hier dieselben Schritte als TSL-Knoten, die Ziehung `zufall` als dieselben 32-Bit-
    // Ganzzahl-Schritte (u32: Multiplikation modulo 2^32, Xor, logisches Schieben), `rausch` als EINE Probe im Rausch-Atlas
    // (`raum` aus `_rauschAtlas`, gelaende-core `rauschRaum` auf der CPU). EIN Rechenwerk je TSL-Modul und Atlas.
    static _felsRechenwerkTSL(T, raum) {
        if (typeof raum !== "function")
            throw new Error("_felsRechenwerkTSL: ohne Rausch-Atlas kein Rechenwerk (raum fehlt)");
        if (AnazhRealm._felsRwMemo && AnazhRealm._felsRwMemo.T === T && AnazhRealm._felsRwMemo.raum === raum)
            return AnazhRealm._felsRwMemo.o;
        const N = (v) => (typeof v === "number" ? T.float(v) : v);
        // gelaende-core `zufall(sh, i, j, k)` als EINE WGSL-Funktion: h = sh ^ i·0x27d4eb2d ^ j·0x165667b1 ^ (k + 1)·0x9e3779b1,
        // zwei Misch-Runden (u32: Multiplikation modulo 2^32, Xor, logisches Schieben) — i, j, k ganz, als f32 gereicht
        const zufallFn = T.Fn(([sh, i, j, k]) => {
            let h = sh
                .bitXor(T.uint(T.int(i)).mul(T.uint(0x27d4eb2d)))
                .bitXor(T.uint(T.int(j)).mul(T.uint(0x165667b1)))
                .bitXor(T.uint(T.int(k).add(1)).mul(T.uint(0x9e3779b1)));
            h = h.bitXor(h.shiftRight(T.uint(15))).mul(T.uint(0x85ebca6b));
            h = h.bitXor(h.shiftRight(T.uint(13))).mul(T.uint(0xc2b2ae35));
            h = h.bitXor(h.shiftRight(T.uint(16)));
            return T.float(h).div(4294967296);
        }).setLayout({
            name: "felsZufall",
            type: "float",
            inputs: [
                { name: "sh", type: "uint" },
                { name: "i", type: "float" },
                { name: "j", type: "float" },
                { name: "k", type: "float" },
            ],
        });
        const o = Object.freeze({
            // gelaende-core `fest` (K17-3): ein Wert, den das Gesetz mehrfach liest, als EINE Variable an der Stelle seiner
            // Rechnung — r184 zählt die Leser eines Knotens in einem Fn-Rumpf nicht und baute ihn je Leser neu (die Lage des
            // Pakets stand 13-mal in der Fels-Funktion)
            fest: (v) => N(v).toVar(),
            // gelaende-core `falte` (K17-3): EINE Schleife — der Zustand lebt in Variablen, je Durchlauf rechnet der Schritt
            // alle neuen Werte aus den alten, erst dann gehen sie in den Zustand (ein Wert liest nie den neuen Nachbarn). Nur
            // in einem Fn-Rumpf (der Stapel der Schleife): der Fels-Term rechnet in `felsFein` (`_terrainGeologyAlbedo`).
            falte: (n, start, schritt) => {
                if (start.length !== 4)
                    throw new Error("_felsRechenwerkTSL.falte: der Zustand trägt vier Werte (ein vec4)");
                const z = T.vec4(...start.map(N)).toVar();
                const zl = [z.x, z.y, z.z, z.w];
                T.Loop(n, ({ i }) => {
                    // EINE Anweisung je Durchlauf: r184 zählt die Leser eines Knotens nur in seiner Anweisung — getrennt
                    // gebaut stand die Bank-Grenze je Ausgang neu (fünfmal je Durchlauf)
                    z.assign(T.vec4(...schritt(T.float(i), zl).map(N)));
                });
                return zl;
            },
            add: (a, b) => N(a).add(N(b)),
            sub: (a, b) => N(a).sub(N(b)),
            mul: (a, b) => N(a).mul(N(b)),
            div: (a, b) => N(a).div(N(b)),
            min: (a, b) => T.min(N(a), N(b)),
            max: (a, b) => T.max(N(a), N(b)),
            floor: (a) => T.floor(N(a)),
            sin: (a) => T.sin(N(a)),
            exp: (a) => T.exp(N(a)),
            abs: (a) => T.abs(N(a)),
            sqrt: (a) => T.sqrt(N(a)),
            step: (e, v) => T.step(N(e), N(v)),
            glatt: (a, b, v) => T.smoothstep(N(a), N(b), N(v)),
            clamp01: (v) => N(v).clamp(0, 1),
            // die Wahl als Auswahl, nie als Mischung: mix(−1e9, a, 1) verlöre a in f32 (Stelle 64 bei 1e9) — als WGSL `select`
            // (`uniformFlow`), nie als if-Block: r184 baut je Zweig eines Blocks jeden noch ungebauten Vorgänger neu (die Lage
            // des Pakets stand je Wahl in jedem Zweig, K17-3: die Fels-Funktion 18 458 Zeichen)
            wahl: (c, a, b) => T.uniformFlow(T.select(N(c).greaterThan(0.5), N(a), N(b))),
            rausch: (x, y, z) => raum(T.vec3(N(x), N(y), N(z))),
            zufall: (sh, i, j, k) => zufallFn(T.uint(sh >>> 0), N(i), N(j), N(k)),
        });
        AnazhRealm._felsRwMemo = { T, raum, o };
        return o;
    }

    // V12.0-f — Toon-Material-Helper: alle Toon-Materials der Welt (Voxel-
    // Chunks, Architektur-Parts, Inseln, Avatar-Torso) sind native
    // `THREE.MeshToonNodeMaterial` (r184, lights=true). Die EINE Wahrheits-
    // ═══ DIE UNIFORM-HEIMAT (18.07., sechster Schöpfer-Trace: 60M Klein-Uploads
    // ≤16K = 9.3 GB, ~9k writeBuffer je Frame bei 631 Draws — die per-Draw-
    // Uniform-Bahn). WURZEL im Vendor gelesen (nie geraten): r184 KLONT jede
    // Uniform-Gruppe, deren groupNode nicht shared ist, JE RenderObject
    // (createBindings) — unsere geteilten Welt-Uniform-Sätze (Wind · Atmo ·
    // LOD · Hydro) lebten als per-Objekt-Kopien, die der Monitor jedes Objekt
    // jeden Frame neu hochladen ließ. Der Umzug in die GETEILTE renderGroup:
    // EIN Buffer je Satz, EIN Write je Render, alle Konsumenten lesen
    // denselben Speicher. Semantisch identisch per Konstruktion: die Sätze
    // sind geteilte Singletons an geteilten Materialien — per-Objekt-Variation
    // reist in dieser Welt IMMER als Attribut/Instanz-Daten, nie als Uniform.
    // Idempotent (setGroup ist ein Setter); ohne renderGroup-Export byte-alt. ═══
    // DER WIND-SATZ (EINE Stelle legt ihn an): Wind-Uhr, Wind-Stärke und die Richtung des aktiven Körpers (`uSunDir`,
    // Sonne oder Mond — `_dayNightApplyDirectionalLight` schreibt sie mit dem Richtlicht). Gras (Gegenlicht) und Boden
    // (Gegenlicht-Glanz, die Zuwendung des Schattens) lesen ihn; er reist als EIN renderGroup-Buffer.
    _windUniformsEnsure() {
        if (!this.state.windUniforms) {
            const { uniform } = THREE.TSL;
            this.state.windUniforms = this._uniformHeimatTeilen({
                uWindTime: uniform(0.0),
                uWindStrength: uniform(0.12),
                uSunDir: uniform(new THREE.Vector3(1, 1, 1).normalize()),
            });
        }
        return this.state.windUniforms;
    }

    _uniformHeimatTeilen(satz) {
        const rg = THREE.TSL.renderGroup;
        if (!satz) return satz;
        const teile = (u) => {
            if (u && u.isUniformNode === true && typeof u.setGroup === "function") u.setGroup(rg);
        };
        for (const k in satz) {
            const u = satz[k];
            if (Array.isArray(u)) for (const e of u) teile(e);
            else teile(u);
        }
        return satz;
    }

    // ═══ DIE OBSERVER-DIÄT ═══
    // r184s Monitor schließt needsRefresh auf hasNode kurz (für JEDES TSL-Material true) → jedes Objekt
    // wird jeden Frame refresht. Welt-Materialien, deren Graph NUR geteilte renderGroup-Uniforms +
    // Attribute + Builtins trägt, fahren die ehrliche equals()-Bahn (Änderungen laden weiter hoch; das
    // erste Objekt je Material/Render refresht). Eine mutierte Uniform ohne _uniformHeimatTeilen lädt der Uniform-Wächter
    // (9, `_diaetRefresh`) je Wechsel im Objekt-Gang ihres Objekts (bis A1-n1 fror sie still ein, bis E1-n1 frischte sie voll
    // auf); die geteilte Heimat lädt sie EINMAL je Render. Headless inert.
    // EIN RUFER (E1): die Erst-Zeichnung der Welt-Szene (`_renderObjectDirect`, `_configureRenderer`) schreibt JEDEN Stoff
    // der Welt ein, bevor er baut — bis E1 riefen fünf Bau-Stellen, jeder andere Welt-Stoff frischte je Render voll auf.
    _materialObserverDiaet(mat) {
        if (!mat || mat._anazhDiaet === true || typeof mat.setupObserver !== "function") return mat;
        // PFLICHT-PAAR-WÄCHTER (Review-Notiz C): ohne renderGroup-Export wäre die
        // Uniform-Heimat ein No-op — die Diät fröre dann per-Objekt-Klone ein.
        // Kein renderGroup → keine Diät (byte-alt, der Vendor refresht weiter).
        mat._anazhDiaet = true;
        const alt = mat.setupObserver;
        // EIN STOFF, EIN SCHLÜSSEL (B-K1): der Beobachter ist eine NICHT-aufzählbare eigene Eigenschaft. r184 schreibt jede
        // aufzählbare eigene Eigenschaft in den Bau-Schlüssel (`getMaterialCacheKey`: Object.keys, eine Funktion als Text), und
        // die Erst-Zeichnung legt das Render-Objekt VOR der Diät an — ein aufzählbarer Beobachter machte dessen Schlüssel alt:
        // jedes weitere Objekt des Stoffs baute neu, jeder Versions-Sprung baute neu. Linse: gate:kamera-treue (i).
        Object.defineProperty(mat, "setupObserver", {
            configurable: true,
            writable: true,
            enumerable: false,
            value: function (builder) {
                const o = alt.call(this, builder);
                if (!o) return o;
                o.hasNode = false;
                // Vendor-Loch: equals() walkt nur geometry.attributes — instanceMatrix/instanceColor leben am MESH
                // und wären unter der Diät unsichtbar. Der Versions-Wächter prüft sie VOR der Vendor-Bahn (Mutation
                // → genau EIN Refresh).
                if (typeof o.needsRefresh === "function") {
                    const altNR = o.needsRefresh;
                    o.needsRefresh = function (ro, frame) {
                        return AnazhRealm._diaetRefresh(this, ro, frame, altNR);
                    };
                }
                return o;
            },
        });
        return mat;
    }

    // DER WURF OHNE FARBE (B-K1): r184 `_getShadowNodes` hängt je Werfer den Farb-Graphen des Originals in den Schatten-
    // Stoff (vec4(0, colorNode.a · map.a)) — auch dort, wo diese Alpha nichts schneidet: ein Werfer ohne Ausschnitt wirft
    // opak (der Stoff setzt seine Alpha auf 1), die Karte trägt keine Farbe (PCF, `transmitted` aus). Gebaut wurde sie
    // trotzdem: je Farb-Graph ein eigenes Schatten-Programm (Knoten-Bau im Haupt-Faden, eine Pipeline je Graph). Ein Werfer
    // OHNE Ausschnitt wirft jetzt mit dem Standard-Fragment des Schatten-Stoffs (vec4(0,0,0,1)); Lage (castShadowPositionNode
    // vor positionNode) und Tiefe (depthNode) bleiben, gemerkt je Paar. Ein Werfer MIT Ausschnitt (alphaTest · alphaTestNode
    // · alphaHash · alphaMap · Durchsicht · castShadowNode · Masken) wirft byte-alt (Lehre 26: der Schattenpass liest
    // colorNode.a · map.a · maskShadowNode). Der EINE Rufer: `_configureRenderer`. Linse: gate:kamera-treue (j).
    _wurfOhneFarbe(renderer) {
        if (typeof renderer._getShadowNodes !== "function")
            return this.log("WURF OHNE FARBE: r184-Renderer._getShadowNodes nicht gefunden (Vendor-Drift)", "ERROR");
        if (renderer.__anazhWurfOhneFarbe) return;
        const knotenRoh = renderer._getShadowNodes;
        const knoten = (n) => (n && n.isNode === true ? n : null);
        const MASKEN = [
            "alphaTestNode",
            "transmissionNode",
            "backdropNode",
            "castShadowNode",
            "maskShadowNode",
            "maskNode",
        ];
        const schneidet = (m) =>
            m.alphaTest > 0 ||
            m.alphaHash === true ||
            m.alphaMap != null ||
            m.transparent === true ||
            m.transmission > 0 ||
            MASKEN.some((k) => knoten(m[k]) !== null);
        const OHNE = {};
        const paare = new WeakMap();
        // EIN WURF-PROGRAMM ÜBER ALLE KASKADEN (w4-ankunft-5): r184 gibt jedem Licht seinen eigenen Schatten-Stoff mit eigenem
        // Farb-Knoten (`vec4(0, 0, 0, 1)` je Kaskade, `getShadowMaterial`) — der Knoten-Bau desselben Werfers schlüsselte so je
        // Kaskade ein Programm desselben Texts (Radeon kalt vor dem Bild: drei Kaskaden × vier Formen, 12 Bauten eines Texts).
        // Der Werfer ohne Ausschnitt trägt in jeder Kaskade DENSELBEN Farb-Knoten; r184 stellt danach den des Lichts zurück.
        const farbe = THREE.TSL.vec4(0, 0, 0, 1);
        // EIN WURF-PROGRAMM JE GRAPH (w4-ankunft-5): für den Werfer MIT Ausschnitt baut r184 die Wurf-Knoten je Stoff neu
        // (vec4(0, colorNode.a), die Maske als Fn) — Stoffe, die ihren Graphen teilen (`_graphTeilen`), bauten so je Stoff ein
        // Programm desselben Texts (Radeon kalt vor dem Bild: die Teile des Wagens 5 Bauten, die Sätze 3). Ohne Karte (`map`
        // liest r184 am Stoff) gelten die Wurf-Knoten des ersten Stoffs mit denselben Knoten für jeden.
        const schnitte = new Map();
        renderer._getShadowNodes = function (m) {
            if (schneidet(m)) {
                if (m.map) return knotenRoh.call(this, m);
                const quellen = [m.castShadowNode, m.colorNode, m.maskShadowNode || m.maskNode, m.depthNode];
                const s = quellen.concat(m.castShadowPositionNode || m.positionNode).map((n) => (knoten(n) ? n.id : "-")).join(); // prettier-ignore
                if (!schnitte.has(s)) schnitte.set(s, knotenRoh.call(this, m));
                return schnitte.get(s);
            }
            const lage = knoten(m.castShadowPositionNode) || knoten(m.positionNode);
            const tiefe = knoten(m.depthNode);
            let je = paare.get(lage || OHNE);
            if (je === undefined) paare.set(lage || OHNE, (je = new WeakMap()));
            let k = je.get(tiefe || OHNE);
            if (k === undefined)
                je.set(tiefe || OHNE, (k = { version: 0, colorNode: farbe, depthNode: tiefe, positionNode: lage }));
            return k;
        };
        renderer.__anazhWurfOhneFarbe = true;
    }

    _ensureAtmoUniforms() {
        if (this.state.atmoUniforms) return this.state.atmoUniforms;
        const TSL = THREE.TSL;
        this.state.atmoUniforms = {
            // 2.5D-Lichtung als Konsolen-Hebel (Init aus der Konstante, NICHT persistiert, render-only):
            //   anazhRealm.state.atmoUniforms.terrainFlatten.value = 0.7
            terrainFlatten: TSL.uniform(AnazhRealm.TERRAIN_NORMAL_FLATTEN),
            // M7 (V18.160, Befund 21) — die Mikro-Struktur als LEBENDIGER Hebel:
            // vorher war AERIAL.microStrength als KONSTANTE in den Tree gebacken
            // (ein Settings-Slider wäre der tote Knopf, V18.65-Klasse) → Uniform.
            microStrength: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.microStrength)
                    ? this.state.atmosphere.microStrength
                    : AnazhRealm.AERIAL.microStrength
            ),
            // Isolations-Regler (Default 1 = unverändert): `aoScale`=0 schaltet die Kavitäts-AO ab (der
            // `fwidth`-Term zeichnet Surface-Nets-Facetten-Kanten als Linien):
            //   anazhRealm.state.atmoUniforms.aoScale.value = 0
            aoScale: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.cavityAO)
                    ? this.state.atmosphere.cavityAO
                    : 1.0
            ),
            // Regler „Oberflächen-Textur" (0..1): skaliert die triplanar Fels-/Boden-Striation; 0 = glatte
            // Farbe. Nur der Terrain-colorNode (render-only, kein Naht-/Determinismus-Risiko).
            triplanarScale: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.triplanar)
                    ? this.state.atmosphere.triplanar
                    : 1.0
            ),
            // Regler „Farb-Variation" (0..1): skaliert die Makro-Tint (warm/kühl-Patches λ~25 m + Sättigung),
            // pre-lighting auf die Albedo; 0 = uniforme Basisfarbe. Render-only.
            tintScale: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.colorVar)
                    ? this.state.atmosphere.colorVar
                    : 1.0
            ),
            // Multi-Klassen-Geologie-Regler (render-only; 0 = aus → reiner Biom-Albedo): `geoRock` = Fels/Geröll
            // an der Steile, `geoMoss` = Moos auf flach+feucht.
            //   anazhRealm.state.atmoUniforms.geoRock.value = 0
            geoRock: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.geoRock)
                    ? this.state.atmosphere.geoRock
                    : 1.0
            ),
            geoMoss: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.geoMoss)
                    ? this.state.atmosphere.geoMoss
                    : 1.0
            ),
            // Cross-LOD-Geomorph-Stärke: wie stark Boundary-Vertices eines feinen Chunks an die grobe Nachbar-
            // Oberfläche gezogen werden (1 = Naht zu, 0 = rohe T-junction):
            //   anazhRealm.state.atmoUniforms.geomorph.value = 0
            geomorph: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.geomorph)
                    ? this.state.atmosphere.geomorph
                    : 1.0
            ),
            // DAS AUGE DER STUFEN (K51-2, `_stufeAugeTakt`): der Spieler des Streaming-Takts — der Geomorph des Bodens misst daran
            // den Chebyshev-Abstand jedes Vertex zu seinem Übergangs-Band
            stufeAuge: TSL.uniform(new THREE.Vector2(0, 0)),
            // DER LICHT-POOL (K11, `_leuchtStoff`): je Platz der Welt-Ort (xyz) mit der Reichweite (w, 0 = leer), die
            // lineare Farbe × Stärke (rgb) mit dem Abfall (a), der Himmels-Ersatz (0 | 1: ein Licht, das nur trägt, wo der
            // Himmel fehlt — das Licht des Auges) und der Kern der Quelle (k², K11b `lichtAbfall`) — eine feste Zahl ab dem Boot (`LICHT_POOL.plaetze`): ein Wechsel der
            // Quellen baut kein Programm. Der Welt-Ort gilt jedem Renderer der Seite (der Stoff rechnet ihn mit der Kamera
            // SEINES Renderers in den Blick-Raum). Dazu die Glut der wachen Fenster (lineare Farbe × Glut des Zeitplans).
            // EIN Schreiber: `_leuchtTakt`.
            lichtLage: Array.from({ length: AnazhRealm.LICHT_POOL.plaetze }, () =>
                TSL.uniform(new THREE.Vector4(0, 0, 0, 0))
            ),
            lichtFarbe: Array.from({ length: AnazhRealm.LICHT_POOL.plaetze }, () =>
                TSL.uniform(new THREE.Vector4(0, 0, 0, 2))
            ),
            lichtErsatz: Array.from({ length: AnazhRealm.LICHT_POOL.plaetze }, () => TSL.uniform(0)),
            lichtKern: Array.from({ length: AnazhRealm.LICHT_POOL.plaetze }, () => TSL.uniform(0)),
            // DER SCHIRM-PIXEL JE SZENEN-PIXEL (w4-wiese-nah, `_szeneSkalaWirk`): unter dem zeitlichen Hochskalierer rendert die
            // Szene in 0,75 × Ausgabe, ihr `fwidth` und ihr `screenSize` messen den Pixel der SZENE — das Mikro-Detail der Stoffe
            // (`_mikroRelief`, `_halmStoff`, das Schutt-Korn) gilt dem Pixel des SCHIRMS: die Geschichte löst welt-feste Oktaven
            // über den Zitter auf (der Mip-Versatz log2(Szene/Ausgabe) jedes Hochskalierers). EIN Schreiber: `_loopRender`.
            schirmJeSzene: TSL.uniform(1).setName("schirmJeSzene"),
            // DIE NÄSSE DER WELT (wetter.K2, EIN Schreiber `_naesseTakt`) und der Dach-Pool ihrer Himmels-Sicht (`_dachTakt`)
            naesse: TSL.uniform(0),
            dachLage: Array.from({ length: AnazhRealm.NAESSE.dachPlaetze }, () =>
                TSL.uniform(new THREE.Vector4(0, 0, 1, 0))
            ),
            dachMass: Array.from({ length: AnazhRealm.NAESSE.dachPlaetze }, () =>
                TSL.uniform(new THREE.Vector4(0, 0, -1e6, 0))
            ),
            // die Hülle des Pools (min x, min z, max x, max z) und seine höchste Oberkante — leer ohne Decke (`_dachTakt`)
            dachHuelle: TSL.uniform(new THREE.Vector4(1, 1, -1, -1)),
            dachOben: TSL.uniform(-1e6),
            // je Datum des Leuchtquellen-Gesetzes EINE Glut (fachwerk LICHT_GESETZ: die wachen Fenster, der Kopf der Laterne)
            // — der Stoff, dessen Gesetzbuch das Datum stempelt (`mp.licht`), glüht in SEINER Farbe und Zeit
            lichtGlut: Object.fromEntries(
                Object.keys(globalThis.__fachwerkCore.LICHT_GESETZ).map((k) => [k, TSL.uniform(new THREE.Color())])
            ),
            // Struktur-Boost als LIVE-Uniform: Multiplier auf das micro-Gewicht des werk-Profils, vom Settings-
            // Slider „Struktur-Tiefe" getrieben. Init aus `atmosphere.r5StructureBoost` (persistiert) oder
            // R5_STRUCTURE_TEXTURE.microBoost (1.3); `_applySubstanceResponse` liest ihn live.
            r5StructureBoost: TSL.uniform(
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.r5StructureBoost)
                    ? this.state.atmosphere.r5StructureBoost
                    : AnazhRealm.R5_STRUCTURE_TEXTURE.microBoost
            ),
        };
        // UNIFORM-HEIMAT: der geteilte Welt-Satz reist als EIN renderGroup-Buffer.
        this._uniformHeimatTeilen(this.state.atmoUniforms);
        return this.state.atmoUniforms;
    }

    // Das Antwort-Profil emergiert aus den 10 Substanz-Tags (eine weitere LESART der Substanz-Wahrheit):
    // tiefe = dichte (AO) · glimmen = magieleitung + wärmeleitung·brennbar (Emissiv). Den Wind trägt kein Tag: er ist das
    // Wind-Gesetz des Baums (K19). Kein Tag trägt Licht (F6): Rim, Nacht-Boden, Mond-Rim und der Gegenlicht-Glow (detail) sind
    // gefallen — das Licht ist die EINE Licht-Kette.
    // Nimmt ein Material oder ein tags-Objekt. Darunter die FEATURE-Gewichte (Antennen → Render-Hebel):
    _substanceResponseProfile(materialOrTags) {
        let tags = null;
        if (materialOrTags && typeof materialOrTags === "object") {
            // {tags: {...}} (Material-Objekt) ODER direkt {...} (Tag-Map).
            if (materialOrTags.tags && typeof materialOrTags.tags === "object") {
                tags = materialOrTags.tags;
            } else {
                tags = materialOrTags;
            }
        } else if (typeof materialOrTags === "string" && this.state && this.state.materials) {
            const mat = this.state.materials[materialOrTags];
            if (mat && mat.tags) tags = mat.tags;
        }
        if (!tags) tags = {};
        const t = (k) => {
            const v = +tags[k];
            return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
        };
        const dichte = t("dichte");
        const magieleitung = t("magieleitung");
        const brennbar = t("brennbar");
        const waermeleitung = t("wärmeleitung");
        const tiefe = dichte;
        const glimmen = Math.min(1, magieleitung * 0.55 + waermeleitung * brennbar * 0.6);
        return {
            tiefe,
            glimmen,
            micro: 0.5 + 0.5 * tiefe,
            // emissiv darf > 1 (Glut glüht ÜBER den Familien-Floor hinaus);
            // der Leser deckelt bei 1.6.
            emissiv: 0.5 + glimmen,
        };
    }

    // ===== DIE EINE GETEILTE UMGEBUNGS-FUNKTION (Render-Harmonie) =====
    // Die Mikro-Tiefe POST-lighting (`TSL.output`, bricht `material.color` nicht) — ein FAKTOR auf dem Licht, nie ein
    // Licht: die Luftperspektive trägt allein die Luft (`scene.fogNode`, `_luftEnsure`), das Licht allein die EINE Licht-
    // Kette (Sonne/Mond, Himmel, Hemi, Ambient, der Pool). Das additive Band (warmes Rim, Nacht-Boden, Mond-Rim, dazu der
    // Gegenlicht-Glow der Vegetation) fiel mit F6 (17.10.): es leuchtete aus sich selbst, nur auf Host-Stoffen (Karte, Boden,
    // Fern-Ring, Werk, Gras), nie auf der Studio-
    // Gestalt, und am streifenden Blick der Ferne am stärksten — die Karte der Fichte stand in der Dämmerung 8,3 ×, nachts
    // 4,8 × so hell wie ihre Gestalt (Radeon, Mess-Wiese; `werkbank licht --laub --karte --uhr`). Lehre 21: Fill und Rim
    // leben im Labor.
    // Gewicht 0 = kein Knoten (der Stoff behält den Ausgang des Vendors). `werte` (der Werk-Stoff, `_substanceCharacter`): das
    // Mikro-Gewicht reist als Stoff-Wert, nie als Konstante.
    _applySubstanceResponse(mat, profile = {}, werte) {
        if (!mat) return;
        try {
            const _T = THREE.TSL;
            const _au = this._ensureAtmoUniforms();
            const cfg = AnazhRealm.AERIAL;
            // Antennen-Gewicht [0..1]: 0 = der Block fällt (kein toter Shader-Ast).
            const _p = (k) => Math.max(0, Math.min(1, Number(profile[k]) || 0));
            // (J2) Mikro-Tiefe/Kavitäts-AO — die tiefe-Antenne (das Terrain trägt
            // seine eigene reichere triplanar-Schicht im colorNode → Gewicht 0).
            if (_p("micro") > 0) {
                const _mikro = werte
                    ? ((werte.mikro = _p("micro")), this._stoffWert(_T, "userData.stoffWerte.mikro"))
                    : _p("micro");
                const _o = _T.output; // die FERTIGE lit-Farbe (post-lighting)
                const _wp = _T.positionWorld;
                const _ra = this._rauschAtlas();
                const _n1 = _ra.raum(_wp.mul(0.33));
                const _n2 = _ra.raum(_wp.mul(1.6));
                const _det = _n1.mul(0.7).add(_n2.mul(0.3));
                // microStrength ist ein UNIFORM (der Settings-Regler lebt), profil-gewichtet. `_au.r5StructureBoost`
                // ist in `_ensureAtmoUniforms` GARANTIERT vorhanden → kein Fallback-Branch.
                const _micro = (_au.microStrength || _T.float(cfg.microStrength)).mul(_au.r5StructureBoost.mul(_mikro));
                let _shade = _T.float(1.0).add(_det.mul(_micro));
                // Kavitäts-AO (wie Terrain V15.2): Welt-Raum-Krümmung aus den
                // Fragment-Derivaten → Kontakt-Schatten in Kanten/Mulden.
                const _curv = _T.fwidth(_T.normalWorld).length().div(_T.fwidth(_wp).length().add(0.0001));
                // J4-DEBUG: aoScale (default 1) schaltet die Kavitäts-AO ab (=0).
                const _aoStr = (_au.aoScale ? _T.float(cfg.aoStrength).mul(_au.aoScale) : _T.float(cfg.aoStrength)).mul(
                    _mikro
                );
                const _ao = _T.float(1.0).sub(_curv.mul(_aoStr).clamp(0.0, cfg.aoCap));
                mat.outputNode = _T.vec4(_o.xyz.mul(_shade.mul(_ao)), _o.w);
            }
        } catch (_e) {
            throw this._stoffBruch("die Umgebungs-Antwort (outputNode)", _e);
        }
    }

    // PBR-Material: `vertexColors`/`color`/`opacity`/`side` sind native Properties; _buildToonNodeMaterial
    // delegiert hierher. Rauheit und Metall LIEST der Stoff aus seiner Zeile (material.K5, `_stoffOptik`: `opts.stoff` beim
    // Namen, sonst der nächste Verwandte seiner `opts.tags`) und merkt sich dort — eine Änderung der Zeile setzt ihn neu.
    // Ohne Zeile ein Mittel-Stoff (0,7, kein Metall); `opts.roughness`/`opts.metalness` setzen ihn ausdrücklich. Bis material.K5
    // leitete ein Zweig-Gesetz sie aus den Tags (Eisen nur mit magieleitung ≥ 0,7 metallisch — die Zeile Eisen trägt 0: sie
    // zeichnete als rauer Stein, ebenso Bronze und Stahl).
    _buildPbrNodeMaterial(opts = {}) {
        if (typeof THREE === "undefined") return null;
        if (typeof THREE.MeshStandardNodeMaterial !== "function") return null;
        const zeile = this._stoffOptik(opts.stoff, opts.tags);
        const roughness = zeile ? zeile.rauheit : 0.7;
        const metalness = zeile ? zeile.metall : 0;
        let emissiveColor = null;
        let emissiveIntensity = 0;
        const params = {};
        if (opts.color !== undefined) params.color = opts.color;
        if (opts.side !== undefined) params.side = opts.side;
        if (opts.transparent !== undefined) params.transparent = opts.transparent;
        if (opts.opacity !== undefined) params.opacity = opts.opacity;
        if (opts.vertexColors) params.vertexColors = true;
        params.roughness = opts.roughness !== undefined ? +opts.roughness : roughness;
        params.metalness = opts.metalness !== undefined ? +opts.metalness : metalness;
        const mat = new THREE.MeshStandardNodeMaterial(params);
        if (zeile && opts.roughness === undefined && opts.metalness === undefined)
            this._stoffOptikMerke(zeile.name, mat);
        // Die Welt-Antenne: derselbe Substance-Response wie im Toon-Pfad (profil-gewichteter Aerial-/Mikro-/
        // Rim-Term POST-lighting); _ensureAtmoUniforms ist idempotent + lazy. Das Emissiv folgt NACH
        // responseProfile (liest `responseProfile.emissiv`).
        this._ensureAtmoUniforms();
        const _SR = AnazhRealm.SUBSTANCE_RESPONSE;
        const isFlatStructure = !opts.vertexColors && opts.color !== undefined;
        const responseProfile = opts.tags
            ? this._substanceResponseProfile(opts.tags)
            : opts.vertexColors === true
              ? _SR.defaults.feld
              : isFlatStructure
                ? _SR.defaults.werk
                : _SR.defaults.frei;
        // Emissiv aus der Glow-Achse `responseProfile.emissiv` (wie Toon, dichte-unabhängig), PBR-Skala 0.4,
        // Farbe = opts.color. NUR der glimmen-Anteil (emissiv − 0.5-Floor) — mit PBR-Skala ließe der Floor
        // jeden Stein glühen.
        const _glimmen = Math.max(0, (Number(responseProfile.emissiv) || 0) - 0.5);
        if (_glimmen > 0.01 && mat.emissive && opts.color !== undefined) {
            emissiveColor = opts.color;
            mat.emissive.setHex(emissiveColor);
            // Per-Variante-Glanz: ein Genom reicht `emissiveBoost` durch; er SKALIERT nur das tag-getragene
            // Glimmen (das SEIN bleibt der magieleitung/wärmeleitung-Tag) — tag-neutral, Affinität unberührt.
            const _boost = Number.isFinite(opts.emissiveBoost) ? Math.max(0, opts.emissiveBoost) : 1;
            emissiveIntensity = Math.min(1.5, _glimmen * 0.6 * _boost);
            mat.emissiveIntensity = emissiveIntensity;
        }
        if (!opts.transparent && typeof this._applySubstanceResponse === "function") {
            let albedoNode = null;
            let werte = null; // die Werte je Stoff des Werk-Stoffs (der flache Zweig unten)
            try {
                const _Ta = THREE.TSL;
                if (opts.vertexColors === true) {
                    // PBR-Terrain trägt denselben Geologie-Albedo wie Toon: per-Vertex-Feldfarbe → per-Fragment
                    // Multi-Klassen-Geologie, als Füll-Licht-Albedo UND als colorNode.
                    // der Boden (K51-2): die Stoff-Farbe wandert im Übergangs-Band mit der Lage zur Farbe der gröberen Stufe
                    albedoNode = opts.geomorph ? this._bodenStufenKnoten().farbe : _Ta.attribute("color", "vec3");
                    if (opts.vertexColorAlbedo) {
                        // FELS: der Stoff am Vertex (das Fels-Gesetz, gelaende-core `felsNetz`) IST die Albedo; der EINE Substanz-Kern legt
                        // Korn + Kavität + Roughness drauf (instanz-stabil via positionLocal). KEIN Terrain-Geologie-Overlay
                        // (positionWorld schmiert über instanzierte Felsen), KEIN Normal-Flatten (plättet die Krümmung); das
                        // Mikro-Relief (`_mikroRelief`, material.K2) kippt die Normale der Gestalt nur in ihrer Tangential-Ebene.
                        if (typeof this._substanceCharacter === "function") {
                            const _rk = this._substanceCharacter(_Ta, albedoNode, {
                                pos: _Ta.positionLocal,
                                worldPos: _Ta.positionWorld,
                                tags: opts.tags || {},
                                metal: 0,
                                roughBase: _Ta.materialRoughness,
                            });
                            albedoNode = _rk.albedo || albedoNode;
                            if (_rk.roughNode) mat.roughnessNode = _rk.roughNode;
                        }
                        mat.colorNode = _Ta.vec4(albedoNode, _Ta.float(1.0));
                        this._mikroGestalt(_Ta, mat);
                    } else if (!opts.pflanzenStoff && typeof this._terrainGeologyAlbedo === "function") {
                        // Roughness-Variation für den Boden aus DEMSELBEN Substanz-Kern wie die Geologie
                        // (`_terrainGeologyAlbedo` → `_substanceCharacter`), sonst uniform 0.7 = Plastik-Sheen unterm IBL.
                        // Out-Param statt neuem Rückgabe-Typ → die `_terrainGeologyAlbedo`-Tests bleiben unberührt.
                        const _terrRough = {};
                        // DIE WEGE-KARTE (Chunk-Boden, V18.530): der Weg IST die Boden-Farbe des Fragments — die
                        // Vertex-Farbe mischt zur Pfad-Erde (`_wegeBodenFarbe`), und DIESE Farbe liest die Geologie.
                        const _bodenVc = opts.wegeKarte === true ? this._wegeBodenFarbe(_Ta, albedoNode) : null;
                        const _geo = this._terrainGeologyAlbedo(
                            _Ta,
                            _bodenVc || albedoNode,
                            _Ta.positionWorld,
                            _terrRough,
                            opts.felsImVertex === true
                        );
                        {
                            // DAS KRONENDACH (0910-8, K16 — EINE Quelle): wo kein echter Wald zeichnet, trägt der Boden mit Wege-Karte
                            // das Kronendach × Saison nach der Deckung (`_fernKroneNahMisch`) — der Chunk-Boden UND der Fern-Ring,
                            // derselbe Stoff; der Ring reicht seine Ecken-Krone (`opts.kroneVertex`) für den Ort jenseits der Karte.
                            let _alb =
                                opts.wegeKarte === true
                                    ? this._fernKroneNahMisch(_Ta, _geo, opts.kroneVertex || null)
                                    : _geo;
                            // DAS WASSER DES RINGS (K16, die Naht des Wassers): der Anteil des Wassers (`opts.wasserVertex`,
                            // aNass) ist kein Boden — er wirft zurück, was der Wasser-Stoff zurückwirft (`_wasserBlick`: der
                            // Körper R∞ im Licht des Orts, der Himmel × Fresnel, der Glanz; dieselben Uniforms), der Boden
                            // trägt den Rest. Bis K16 mischte der Ring ein Fern-Blau in die Boden-Farbe (Luma 4,8× zu hell).
                            if (opts.wasserVertex) {
                                // im Fern-Fenster die Fluss-Karte je Fragment, jenseits der Kasten-Anteil des Punkts
                                const _fk = this._flussKarteNode(_Ta);
                                const _nass = _Ta.mix(opts.wasserVertex, _fk.wert, _fk.imFenster).clamp(0.0, 1.0);
                                _alb = _alb.mul(_Ta.float(1.0).sub(_nass));
                                mat.emissiveNode = this._fernWasserBlickNode(_Ta).mul(_nass);
                            }
                            albedoNode = _alb;
                            mat.colorNode = _Ta.vec4(_alb, 1.0);
                            if (_terrRough.node) mat.roughnessNode = _terrRough.node;
                        }
                    } else if (opts.pflanzenStoff) {
                        // Vegetation (Rinde + Laub) trägt die Per-Vertex-Albedo EXPLIZIT als colorNode (VOR der Response) —
                        // sonst fällt sie aus `_T.output` und die Krone wäscht zur reinen Licht-Farbe.
                        let _alpha = _Ta.float(1.0);
                        if (opts.impostorAtlas) {
                            // DIE KARTE (der EINE Karten-Atlas, `_impostorAtlas`): der ferne LOD2-Baum ist EIN camera-facing
                            // Quad, das die ZWEI angrenzenden Peilungs-Ansichten SEINER Atlas-Schicht (aKarte.x) sampelt (Blend
                            // über fract) und die Instanz-Rotation respektiert. Instanz-Dekodierung ohne Instanz-Matrix: die
                            // Geometrie-Normale ist ein PROBE (1,0,0) → normalLocal = (cos r, 0, −sin r)/s. Schicht, Rahmen
                            // (Halbbreite, Höhe — template-lokal) und der Sichthöhen-Stempel (die Höhe der L1 × Instanz-Skala,
                            // negativ = verdeckt) reisen je Instanz in EINEM vec4 (aKarte): EIN Programm für jede Karte jeder
                            // Art, fünf Vertex-Puffer (position · normal · uv · aKarte · instanceColor). Normal-Atlas (rg) →
                            // mat.normalNode (VIEW-space) an die EINE PBR-Lichtung.
                            try {
                                const _at = this._impostorAtlas();
                                if (!this._impostorAtlasTexturen(_at))
                                    throw this._stoffBruch("die Karte: der Karten-Atlas fehlt beim Bau ihres Stoffs");
                                {
                                    if (!_at.mapNode) {
                                        _at.mapNode = _Ta.texture(_at.map);
                                        _at.nmapNode = _Ta.texture(_at.nmap);
                                        _at.lmapNode = _Ta.texture(_at.lmap);
                                    }
                                    const _V = _Ta.float(_at.V); // die Peilungen je Ring
                                    // DIE HEBUNGS-RINGE (lod.K3): die Tafel der Schicht (phyto-core `karteRinge`, aufsteigend) — je
                                    // Ring Hebung, Teiler und erste Zeile; die Schicht misst cw × _Hs Texel
                                    const _rg = _at.ringe.ringe;
                                    const _Hs = _at.masse.h;
                                    const _alg = AnazhRealm._windTsl(_Ta); // die Algebra der Gesetze (`karteRingHalbe`)
                                    const _uv = _Ta.attribute("uv", "vec2");
                                    const _ecke = _uv.x.mul(_Ta.float(2.0)).sub(_Ta.float(1.0)); // die Ecke ±1
                                    // (Schicht, Halbbreite, Höhe, ±Sichthöhe)
                                    const _karte = _Ta.attribute("aKarte", "vec4");
                                    const _rahmen = _karte.yz;
                                    // die Schicht: ein interpolierter Instanz-Wert kann 2,9999 lesen — gerundet, nie gekappt
                                    const _schicht = _Ta.floor(_karte.x.add(_Ta.float(0.5)));
                                    // ── Instanz-Dekodierung (die Instanz-Matrix, `_instanzMatrixNode`) ──
                                    // r184 setzt den positionNode VOR die Instanzierung (WGSL der Karte gelesen, K20 13.10.): dort
                                    // lasen positionLocal und der Normal-Probe den VORLAGEN-Raum (Skala 1, Drehung 0), die Matrix
                                    // drehte das Quad danach mit der Instanz — jede Karte stand als feste Tafel in der Drehung ihres
                                    // Baums, von der Seite ein Strich. Spalte 0 = s·(cos r, 0, −sin r), Spalte 3 = der Anker.
                                    // Jede gezeichnete Instanz lebt: die Gruppe ist dicht, count = lebende Instanzen (`_archGroupFree`
                                    // verdichtet) — die Null-3×3 eines freien Slots erreicht den Shader nie.
                                    const _naht = this._weltNaht(_Ta);
                                    const _m0 = _naht.spalte(0);
                                    const _sV = _naht.skala; // die Instanz-Skala im Vertex-Takt
                                    const _sInst = _Ta.varying(_sV, "vKarteSkala");
                                    // DIE PEILUNG OHNE VORZEICHEN-NULL (S2b, gate:foundry-impostor C auf swiftshader): eine Instanz
                                    // ohne Drehung trägt Spalte 0 = (1, 0, +0), negiert −0 — swiftshader liest am Vorzeichen-Bit
                                    // atan2(−0, 1) = π, die Karte zeigte ihre Rückseite (gespiegelt). Jede Peilung der Karte geht
                                    // darum durch EINEN Leser, der die Null als +0 reicht.
                                    const _peil = (y, x) => _Ta.atan(_Ta.select(y.equal(0.0), _Ta.float(0.0), y), x);
                                    const _aRot = _Ta.varying(_peil(_m0.z.negate(), _m0.x), "vKarteDreh");
                                    // ── DIE HEBUNG DES AUGES (lod.K3, Vertex): φ über der Mitte der Karte (Anker + halbe Rahmen-Höhe ×
                                    //    Instanz-Skala, die EINE Naht `_weltNaht`) — je Instanz fest; der Vertex kippt die Karte zum
                                    //    Auge, das Fragment wählt mit ihr den Ring. ──
                                    const _hHv = _rahmen.y.mul(0.5);
                                    const _phiV = _Ta.atan(
                                        _Ta.cameraPosition.y.sub(_naht.anker.y).sub(_hHv.mul(_sV)),
                                        _Ta.cameraPosition.xz.sub(_naht.anker.xz).length().max(1e-4)
                                    );
                                    const _phiF = _Ta.varying(_phiV, "vKarteHebung");
                                    // ── exakte Anker-Peilung im Fragment: posW = Anker + right·k + Hub der gekippten Karte entlang
                                    //    look (right ⟂ look) ⇒ ang(look) = atan2(−h) + atan2(k, d'), d' = √(|h|²−k²) — kein
                                    //    Varying-Emissions-Risiko, exakt; d' trägt den Hub (`_dAchse` zieht ihn ab). ──
                                    const _k = _ecke.mul(_rahmen.x).mul(_sInst);
                                    const _hx = _Ta.positionWorld.x.sub(_Ta.cameraPosition.x);
                                    const _hz = _Ta.positionWorld.z.sub(_Ta.cameraPosition.z);
                                    const _hl2 = _hx.mul(_hx).add(_hz.mul(_hz));
                                    const _dA = _Ta.sqrt(_hl2.sub(_k.mul(_k)).max(_Ta.float(1e-4)));
                                    const _ang = _peil(_hx.negate(), _hz.negate()).add(_peil(_k, _dA));
                                    // ── View-Wahl + Blend (Vorlage: vView=fract((ang−aRot)/2π)); Studio-Layout: die Ansichten
                                    //    VERTIKAL gestapelt, Zeile 0 = Unterkante der Ansicht 0 (readPixels bottom-up) ──
                                    const _vView = _Ta.fract(
                                        _ang.sub(_aRot).div(_Ta.float(6.283185307179586)).add(_Ta.float(2.0))
                                    );
                                    const _fV = _vView.mul(_V);
                                    const _v0 = _Ta.floor(_fV);
                                    const _fb = _Ta.fract(_fV);
                                    const _v1 = _Ta.mod(_v0.add(_Ta.float(1.0)), _V);
                                    // ── DER RING DER HEBUNG (lod.K3): φ steht im Bruch-Index rF der Ringe (stückweise linear über
                                    //    ihre Hebungen, außerhalb geklemmt) — je Pixel EIN Ring ⌊rF + Rauschen⌋ (`_ditherIGN`,
                                    //    zeitlich: die Kante löst TAAU), so viele Abtastungen wie mit einem Ring. Hebung, Teiler und
                                    //    erste Zeile des Rings liest EINE Tafel (`_at.ringTafel`, aus `karteRinge`). ──
                                    const _eR = _rg.map((r) => (r.hebung * Math.PI) / 180);
                                    let _rF = _Ta.float(0.0);
                                    for (let i = 0; i + 1 < _rg.length; i++)
                                        _rF = _rF.add(
                                            _phiF
                                                .sub(_eR[i])
                                                .div(_eR[i + 1] - _eR[i])
                                                .clamp(0.0, 1.0)
                                        );
                                    if (!_at.ringTafel)
                                        _at.ringTafel = _Ta.uniformArray(
                                            _rg.map((r, i) => new THREE.Vector4(_eR[i], r.teiler, r.y, 0)),
                                            "vec4"
                                        );
                                    const _ring = _at.ringTafel.element(
                                        _rF
                                            .add(this._ditherIGN(_Ta, 1))
                                            .floor()
                                            .min(_rg.length - 1)
                                            .toInt()
                                    );
                                    const _eW = _ring.x;
                                    const _tW = _ring.y;
                                    const _bw = _Ta.float(_at.cw).div(_tW),
                                        _bh = _Ta.float(_at.ch).div(_tW); // die Zelle des Rings in Texeln
                                    // ── DIE GEKIPPTE KARTE IM RING: ein Punkt b der Karte (Höhe ±_hPhi um ihre Mitte) liegt im Bild des
                                    //    Rings e bei b / cos(φ − e) — der Strahl des Auges durch die Ebene des Rings; die halbe
                                    //    Bild-Höhe ist die des Rahmen-Zylinders (`karteRingHalbe`, dieselbe Formel liest die Bühne).
                                    //    Außerhalb seines Bilds ist der Ring leer. ──
                                    const _hPhi = globalThis.__phytoCore.karteRingHalbe(_alg, _hHv, _rahmen.x, _phiF);
                                    const _hE = globalThis.__phytoCore.karteRingHalbe(_alg, _hHv, _rahmen.x, _eW);
                                    const _bK = _uv.y.mul(2.0).sub(1.0).mul(_hPhi);
                                    const _mR = _hPhi.div(_hE.mul(_Ta.cos(_phiF.sub(_eW)).max(1e-3))); // dv / d(uv.y)
                                    const _vC = _uv.y.mul(2.0).sub(1.0).mul(_mR).mul(0.5).add(0.5);
                                    const _imRing = _Ta.step(0.0, _vC).mul(_Ta.step(_vC, 1.0));
                                    // Die Ansichten liegen Kante an Kante: die Unterkante (Stammfuß) der Ansicht v+1 grenzt an die
                                    // Oberkante der Ansicht v, im Ring in ¼ der Zellfläche auch die rechte Kante an die linke. Die
                                    // Klemme hält den Filter in SEINER Ansicht: einen halben Texel der gröberen gemischten Stufe
                                    // Abstand (≈ 1 fwidth der Ansichts-Höhe), vergrößert mindestens einen halben Texel der Stufe 0 (ein
                                    // fwidth ist dort kleiner als der bilineare Fußabdruck).
                                    const _halb = _Ta
                                        .max(_Ta.fwidth(_uv.y).mul(_mR), _Ta.float(0.5).div(_bh))
                                        .clamp(0.0, 0.25);
                                    const _vIn = _vC.clamp(_halb, _Ta.float(1.0).sub(_halb));
                                    const _halbU = _Ta.max(_Ta.fwidth(_uv.x), _Ta.float(0.5).div(_bw)).clamp(0.0, 0.25);
                                    const _uIn = _Ta.select(
                                        _tW.greaterThan(1.5),
                                        _uv.x.clamp(_halbU, _Ta.float(1.0).sub(_halbU)),
                                        _uv.x
                                    );
                                    // Die Schicht liegt, wie der Welt-Renderer sie zeichnet (S2): die Zeile 0 oben (die Ansicht im
                                    // Ring von oben, ihr Wipfel zuerst) — die Zellen-Höhe läuft gespiegelt. Die Zelle der Peilung a:
                                    // τ Ansichten je Zeile ab der ersten Zeile des Rings (phyto-core `karteRinge`).
                                    const _vZ = _Ta.float(1.0).sub(_vIn);
                                    const _yW = _ring.z;
                                    const _zelle = (a) => {
                                        const x0 = _Ta.mod(a, _tW).mul(_bw);
                                        const y0 = _yW.add(_Ta.floor(a.div(_tW)).mul(_bh));
                                        const uv = _Ta.vec2(
                                            x0.add(_uIn.mul(_bw)).div(_at.cw),
                                            y0.add(_vZ.mul(_bh)).div(_Hs)
                                        );
                                        return { x0, y0, uv };
                                    };
                                    const _zA = _zelle(_v0),
                                        _zB = _zelle(_v1);
                                    const _uvA = _zA.uv;
                                    const _uvB = _zB.uv;
                                    // DER STAMM-STRICH (Echt-GPU 05.10., Höhen-Sonde): die Anker-Peilung ist für das ganze Quad
                                    // dieselbe; steht sie GENAU auf einer Ansichts-Grenze, kippt ihr Rundungs-Rauschen einzelne Pixel
                                    // auf die Nachbar-Ansicht (v0 springt um 1 bzw. 7). Die Hardware-Ableitung des 2×2-Blocks las den
                                    // Sprung als Gradienten über die halbe Textur, griff die gröbste Stufe, und deren Filter zog den
                                    // Stammfuß der Nachbar-Ansicht als senkrechten Strich über die Krone (30–40 px über der L1-Spitze,
                                    // jede Peilung auf einer Ansicht). Die Gradienten kommen aus der STETIGEN Koordinate (die
                                    // Quad-Koordinate ohne Sprung, auf die Zelle des Rings skaliert) — alle vier Stichproben, Albedo
                                    // und Normale (gate:foundry-impostor D).
                                    const _skZ = _Ta.vec2(_bw.div(_at.cw), _mR.mul(_bh).div(_Hs).negate());
                                    const _gX = _uv.dFdx().mul(_skZ);
                                    const _gY = _uv.dFdy().mul(_skZ);
                                    const _probeA = (tex, uv) =>
                                        tex
                                            .sample(this._laubVersatz(_Ta, uv, _gX, _gY))
                                            .depth(_schicht)
                                            .grad(_gX, _gY);
                                    // DIE VERGRÖSSERTE KARTE (K20, 12.10.): steht ein Texel der Stufe 0 auf mehr als einem Pixel, liest
                                    // die Karte ihre Zelle KUBISCH (B-Spline, vier bilineare Abgriffe in der eigenen Ansicht) statt
                                    // bilinear. Die Stufe 0 ist binär (Karten-Gesetz, BC1): bilinear gelesen schnitt der alphaTest
                                    // jede Krone in Texel-Treppen — Blöcke von 3–10 px mit rechteckigen Löchern zwischen 30 und 60 m
                                    // (Werkbank, Radeon: Texel bis 3,3 px). Die geglättete Deckung trägt die Kante zwischen den
                                    // Texeln; unter einem Pixel je Texel bleibt die deckungstreue Mip-Wahl allein (Gewicht `_kubW`).
                                    const _gpX = _Ta.vec2(_gX.x.mul(_at.cw), _gX.y.mul(_Hs)).length();
                                    const _gpY = _Ta.vec2(_gY.x.mul(_at.cw), _gY.y.mul(_Hs)).length();
                                    const _kubW = _Ta
                                        .float(1.0)
                                        .div(_gpX.max(_gpY).max(_Ta.float(1e-4)))
                                        .sub(_Ta.float(1.0))
                                        .clamp(0.0, 1.0);
                                    const _kubisch = (tex, z) => {
                                        const cx = _uIn.mul(_bw).sub(_Ta.float(0.5));
                                        const cy = _vZ.mul(_bh).sub(_Ta.float(0.5));
                                        const ix = _Ta.floor(cx),
                                            iy = _Ta.floor(cy);
                                        const fx = cx.sub(ix),
                                            fy = cy.sub(iy);
                                        const gew = (f) => {
                                            const e = _Ta.float(1.0).sub(f);
                                            const w0 = e.mul(e).mul(e).div(6.0);
                                            const w1 = _Ta
                                                .float(2.0 / 3.0)
                                                .sub(f.mul(f).mul(_Ta.float(2.0).sub(f)).mul(0.5));
                                            const w2 = _Ta
                                                .float(2.0 / 3.0)
                                                .sub(e.mul(e).mul(_Ta.float(2.0).sub(e)).mul(0.5));
                                            const w3 = f.mul(f).mul(f).div(6.0);
                                            return {
                                                g0: w0.add(w1),
                                                g1: w2.add(w3),
                                                h0: w1.div(w0.add(w1)).sub(0.5),
                                                h1: w3.div(w2.add(w3)).add(1.5),
                                            };
                                        };
                                        const wx = gew(fx),
                                            wy = gew(fy);
                                        // in der eigenen Zelle: die Abgriffe bleiben einen Texel vor ihrer Kante
                                        const ziel = (hx, hy) =>
                                            _Ta.vec2(
                                                z.x0.add(ix.add(hx).clamp(_Ta.float(1.0), _bw.sub(1.0))).div(_at.cw),
                                                z.y0.add(iy.add(hy).clamp(_Ta.float(1.0), _bh.sub(1.0))).div(_Hs)
                                            );
                                        const lies = (hx, hy) =>
                                            tex.sample(ziel(hx, hy)).depth(_schicht).level(_Ta.float(0.0));
                                        return lies(wx.h0, wy.h0)
                                            .mul(wx.g0)
                                            .add(lies(wx.h1, wy.h0).mul(wx.g1))
                                            .mul(wy.g0)
                                            .add(
                                                lies(wx.h0, wy.h1)
                                                    .mul(wx.g0)
                                                    .add(lies(wx.h1, wy.h1).mul(wx.g1))
                                                    .mul(wy.g1)
                                            );
                                    };
                                    const _liesA = (tex, z) => _Ta.mix(_probeA(tex, z.uv), _kubisch(tex, z), _kubW);
                                    // vormultipliziert: außerhalb des Bilds seines Rings ist die Karte leer (0 = durchsichtig)
                                    const _samp = _Ta
                                        .mix(_liesA(_at.mapNode, _zA), _liesA(_at.mapNode, _zB), _fb)
                                        .mul(_imRing);
                                    // die Deckung an der Codec-Schwelle (alphaTest unten); ihre Probe trägt den Versatz des Laubs
                                    // (`_probeA` über `_laubVersatz`, A3) wie jede Karte der Klasse
                                    _alpha = _samp.a;
                                    // fin-Einblendung des Billboards aus der EINEN Quelle `__phytoCore.lodCrossfadeMask` lod=2 (via
                                    // `_lodCrossfadeMaskNode`); Distanz = Fragment-Anker-Peilung (√_hl2), Sichthöhe = der Stempel
                                    // |aKarte.w| (die Höhe der Höhen-Stufe × Instanz-Skala — dieselbe Zahl wie der aH0-Stempel der L1
                                    // und die CPU, nie die Rahmen-Höhe des Bakes); ein negativer Stempel ist der verdeckt-demotierte
                                    // Baum (die Karte blendet voll). Maske + CPU-Doppel-Mitgliedschaft (`_updateFoundryLodBand`)
                                    // schalten zusammen am foundryCrossfade-Flag (default an).
                                    if (this.state && this.state.foundryCrossfade === true) {
                                        // Kein Horizont in der Maske: eine Distanz-Blende ins Nichts lässt jede Karte, die IM
                                        // Band steht, dauerhaft halb durchsichtig (unter TRAA ein Geist am Grat) — der Rand
                                        // des gesetzten Waldes lebt auf der CPU (`_archKartenHorizont`).
                                        const _keepFin = this._lodCrossfadeMaskNode(_Ta, {
                                            impostor: true,
                                            // die Distanz zur ACHSE der Instanz (der Anker, `_dA` ohne den Hub der gekippten
                                            // Karte), wie das Studio-Billboard (`vCD` aus `instanceMatrix[3]`), nie zum Fragment
                                            distNode: _dA.sub(_sInst.mul(_bK).mul(_Ta.sin(_phiF))),
                                            visHeightNode: _karte.w.abs(),
                                            occlNode: _karte.w
                                                .lessThan(_Ta.float(0.0))
                                                .select(_Ta.float(1.0), _Ta.float(0.0)),
                                        });
                                        {
                                            _alpha = _alpha.mul(_keepFin);
                                            // der Stoff trägt die Maske: die Instanz-Wahl darf ihr Fenster lesen
                                            // (`_instanzFensterGilt`)
                                            mat.userData.kartenMaske = true;
                                        }
                                    }
                                    // Die Schicht ist VORMULTIPLIZIERT (transparent = 0, Karten-Gesetz): rgb / alpha — kein dunkler
                                    // Saum auf keiner Mip-Stufe. Der Atlas trägt die volle Baumfarbe, vertex-color = weiß. Seit A7
                                    // ist er reine Albedo (linear, ohne Tonkurve): das Licht kommt allein aus der EINEN Licht-Kette —
                                    // die Tag-Licht-Achse, die ein eingebackenes Tageslicht mit der Sonne fallen ließ, fiel mit ihm.
                                    const _rgbK = _samp.rgb.div(_samp.a.max(_Ta.float(1e-3)));
                                    // Die Karte ist Golden-Sommer gebacken; das Jahr färbt sie wie der Studio-Impostor:
                                    // alb × mix(1, uSeasonMul, SAISON_GESETZ.kartenGewicht) (V18.527, kein Neubau).
                                    const _suK = this._ensureSeasonUniforms();
                                    const _albK = _rgbK.mul(
                                        _Ta.mix(
                                            _Ta.vec3(1.0, 1.0, 1.0),
                                            _suK.uSeasonMul,
                                            _Ta.float(AnazhRealm._saisonGesetz().kartenGewicht)
                                        )
                                    );
                                    albedoNode = _albK;
                                    mat.alphaTest = globalThis.__phytoCore.KARTEN_GESETZ.schwelle; // die Codec-Schwelle
                                    // DAS JAHR DER KARTE (vegetation.K5, der Studio-Impostor): sie ist Sommer gebacken (die volle
                                    // Krone, `_karteBuehne`), ihre Schwelle hebt sich um Δ = (1 − Laub-Präsenz) × SAISON_GESETZ
                                    // .karteSchwelle — im Winter steht nur, was dicht deckt; die Nadel-Art (`_karteNadel`, je
                                    // Programm-Bau gelesen: die Reihe wächst mit dem Atlas) fällt nie. Δ geht von der Deckung ab,
                                    // nie in einen Schwellen-Knoten (K68-N1): r184 verwirft a ≤ alphaTest, a − Δ ≤ s heißt a ≤ s + Δ,
                                    // und die Zahl des Stoffs regiert den Schnitt — der Klon des Phantoms (`_ghostMaterialFor`: Zahl
                                    // × Deckkraft) trägt das Jahr mit, opak setzt r184 die Alpha nach dem Test auf 1. Bis zur Heilung
                                    // trug die Karte `alphaTestNode` mit der Zahl als Konstante (gate:werkstatt-weg L-Werkstatt ROT).
                                    _alpha = _alpha.sub(
                                        _Ta.Fn(() => {
                                            const nadel = this._karteNadel(_Ta).element(_schicht.toInt());
                                            const p = _Ta.mix(_suK.uLaubPraesenz.x, _Ta.float(1), nadel).clamp(0, 1);
                                            return _Ta.float(1).sub(p).mul(AnazhRealm._saisonGesetz().karteSchwelle);
                                        })()
                                    );
                                    // ── Normal-Atlas (rg, z = √(1−x²−y²)) → Billboard-Rahmen → per-Fragment-Licht ──
                                    // Das rgba8-Ziel trägt die Normale vormultipliziert mit der Deckung (z) — kein Saum der
                                    // Leer-Normale an der Silhouette; BC5 trägt das Mittel der deckenden Texel (leer = die Normale der
                                    // Nachbarn, `_karteRechenPlan`)
                                    const _vm = _at.fmt === "rgba8";
                                    // DIE NORMALE DER NÄCHSTEN ANSICHT (S2b): die Albedo mischt die beiden Ansichten, die Normale
                                    // nie — dieselbe Stelle des Quads trifft in zwei Ansichten 45° auseinander verschiedene Blätter,
                                    // ihr Mittel kippte die lichte Krone zum Auge (Radeon, Genesis Ego, Birke: Zenit-Sonne 54 %,
                                    // Seiten-Sonne 63–70 %, Front 111 % ihrer L1 — Karte/Gestalt 0,64 → 1,04)
                                    const _nP = _probeA(_at.nmapNode, _Ta.select(_fb.lessThan(0.5), _uvA, _uvB));
                                    const _nxy = (_vm ? _nP.xy.div(_nP.z.max(_Ta.float(1e-3))) : _nP.xy)
                                        .mul(_Ta.float(2.0))
                                        .sub(_Ta.float(1.0));
                                    // DIE GANZE NORMALE (F6): der Atlas trägt sie oktaedrisch (die Bühne `_karteBuehne`, der
                                    // Rechner `oktAuf`/`oktZu`) — die Nadel der Rückseite bleibt vom Auge abgewandt wie an der
                                    // Gestalt. Bis F6 hieß z = +√(1 − x² − y²): jede Normale stand zum Bäcker, die Karte der Fichte
                                    // nahm nachts 0,755 des Himmels-Lichts ihrer Gestalt.
                                    const _oz = _Ta.float(1.0).sub(_nxy.x.abs()).sub(_nxy.y.abs());
                                    const _ot = _oz.negate().max(_Ta.float(0.0));
                                    const _nO = _Ta.normalize(
                                        _Ta.vec3(
                                            _nxy.x.add(_Ta.select(_nxy.x.greaterThanEqual(0.0), _ot.negate(), _ot)),
                                            _nxy.y.add(_Ta.select(_nxy.y.greaterThanEqual(0.0), _ot.negate(), _ot)),
                                            _oz
                                        )
                                    );
                                    const _sinA = _Ta.sin(_ang);
                                    const _cosA = _Ta.cos(_ang);
                                    // DER RAHMEN DES BÄCKERS (F6): der Atlas trägt die Welt-Normale der gebackenen Nadel in der
                                    // waagrechten Ansicht — rechts, oben, zum Bäcker —, und so steht sie in der Welt, aus welcher
                                    // Höhe das Auge auch blickt. Der Rahmen, der seit A7 zum Auge kippte, glich die halbe Normale
                                    // (z ≥ 0) und das gefallene Licht-Band aus; mit der ganzen Normale hob er die Fichte mittags
                                    // auf 1,28 × ihrer Gestalt (waagrecht 1,19, die Sicht des Zenits 0,97). Im Ring der Hebung e
                                    // (lod.K3) ist es der Rahmen seiner Bake-Kamera: oben und zum Bäcker um e gekippt.
                                    const _cE = _Ta.cos(_eW),
                                        _sE = _Ta.sin(_eW);
                                    const _look3 = _Ta.vec3(_cE.mul(_sinA), _sE, _cE.mul(_cosA));
                                    const _up3 = _Ta.vec3(_sE.negate().mul(_sinA), _cE, _sE.negate().mul(_cosA));
                                    const _right3 = _Ta.vec3(_cosA, _Ta.float(0.0), _sinA.negate());
                                    const _nW = _Ta.normalize(
                                        _right3.mul(_nO.x).add(_up3.mul(_nO.y)).add(_look3.mul(_nO.z))
                                    );
                                    // normalNode ist VIEW-space (NodeMaterial.setupNormal → normalView):
                                    // die Welt-Normale über die Kamera-Matrix transformieren — Welt → Sicht ist
                                    // MATRIX.transformDirection(n) (V·n), nie n.transformDirection(MATRIX) (Vᵀ·n).
                                    mat.normalNode = _Ta.cameraViewMatrix.transformDirection(_nW);
                                    // ── DIE SONNEN-SICHT DER KRONE (A7): die volle Krone beschattet sich in der Kaskade selbst,
                                    //    die Karte wirft nie — ihr Bake misst je Texel, welchen Teil des Richtlichts die eigene
                                    //    Krone durchlässt (`_karteBuehne`), und er liegt auf dem EMPFANGENEN Schatten der Karte: das
                                    //    Sonnen-Licht der EINEN Licht-Kette fällt wie an der Gestalt, der Himmel bleibt frei. Bis A7
                                    //    stand die Karte 1,06–1,67 × so hell wie ihre Gestalt (Werkbank, Radeon, 16.10.). ──
                                    //    BC: rg8 (r der Zenit, g der 45°-Kranz), leer = das Mittel der Schicht; rgba8: r und b,
                                    //    vormultipliziert mit der Deckung (g). DIE HÖHE DES LICHTS (F6): die Sicht folgt der Höhe
                                    //    des aktiven Körpers (`uSunDir`, dieselbe Richtung wie das Richtlicht) — bis 45° der Kranz,
                                    //    darüber zum Zenit, im Sinus der Höhe. Das eine Mittel aller Richtungen ließ die
                                    //    Mittagssonne durch die hohe Fichte wie durch ihre Flanke (ihr Sonnen-Licht 1,42 × das der
                                    //    Gestalt).
                                    const _lP = _Ta.mix(_probeA(_at.lmapNode, _uvA), _probeA(_at.lmapNode, _uvB), _fb);
                                    const _s2 = _vm
                                        ? _Ta
                                              .vec2(_lP.r, _lP.b)
                                              .div(_lP.g.max(_Ta.float(1e-3)))
                                              .min(_Ta.vec2(1.0))
                                        : _lP.rg;
                                    const _sk = Math.SQRT1_2;
                                    const _hoch = _Ta
                                        .normalize(this._windUniformsEnsure().uSunDir)
                                        .y.sub(_sk)
                                        .div(1 - _sk)
                                        .clamp(0.0, 1.0);
                                    const _sicht = _Ta.mix(_s2.y, _s2.x, _hoch);
                                    mat.receivedShadowNode = (schatten) => schatten.mul(_sicht);
                                    // ── CAMERA-FACING (Vertex) im VORLAGEN-Raum: der positionNode läuft VOR der Instanz-Matrix
                                    //    (r184, WGSL gelesen), die Matrix dreht, skaliert und schiebt das Quad danach. Also blickt die
                                    //    Karte in der Vorlage auf das Auge, wie die Instanz es sieht: Auge im Objekt-Raum minus Anker
                                    //    (Spalte 3), zurück in die Vorlage (die EINE Naht `_weltNaht.vorlage`). Das Einheits-Quad
                                    //    steht von y=0 bis y=1; Halbbreite und Höhe sind Vorlagen-Maß, die Skala trägt die Matrix.
                                    //    DIE GEKIPPTE KARTE (lod.K3): sie kippt um ihre Rechte zum Auge (up = (−sin φ·look, cos φ)),
                                    //    ihre Mitte bleibt auf der Achse in halber Höhe, ihre halbe Höhe ist die des Rahmen-Zylinders
                                    //    aus φ (`karteRingHalbe`) — bei φ = 0 steht sie wie das waagrechte Quad von 0 bis zur Höhe. ──
                                    const _axis = _Ta.positionLocal;
                                    const _dAuge = _naht.vorlage(_Ta.cameraPosition.sub(_naht.anker));
                                    const _lkX = _dAuge.x;
                                    const _lkZ = _dAuge.z;
                                    const _ll = _Ta.sqrt(_lkX.mul(_lkX).add(_lkZ.mul(_lkZ))).max(_Ta.float(1e-4));
                                    const _lx = _lkX.div(_ll);
                                    const _lz = _lkZ.div(_ll);
                                    // right = cross(up, look) = (look.z, 0, −look.x)
                                    const _off = _ecke.mul(_rahmen.x);
                                    const _cPhi = _Ta.cos(_phiV),
                                        _sPhi = _Ta.sin(_phiV);
                                    const _bV = _Ta.positionGeometry.y
                                        .mul(2.0)
                                        .sub(1.0)
                                        .mul(globalThis.__phytoCore.karteRingHalbe(_alg, _hHv, _rahmen.x, _phiV));
                                    // DER WIND DER KARTE (K19): derselbe Wind-Term wie Rinde und Laub der nahen Stufen (phyto-core
                                    // `windAusschlag`, das Stamm-Glied: ζ = uv.y, die Kronenspitze pendelt ζ²) — die Last aus der
                                    // Wind-Zeile des Wetters, die Böe aus WIND_BOE, die Richtung uWindDir, H = Rahmen-Höhe × Instanz-Skala,
                                    // f0 = kF · δ / H mit der mittleren Schlankheit der Baum-Arten (`_karteWindDelta`: die Karte trägt
                                    // ihre Art nur als Atlas-Schicht). Bis K19 pendelte die Karte 0,22 m in jedem Wetter. Die Phase liest
                                    // den Welt-Anker der Instanz, der Ausschlag (Welt-Meter in Windrichtung) geht über die EINE Naht
                                    // (`_weltNaht.vorlage`) in die Vorlage zurück — sonst drehte und skalierte ihn die Matrix mit dem Baum.
                                    this._windUniformsEnsure();
                                    const _wu = this._ensureWindCoupling(_Ta);
                                    const _WB = AnazhRealm.WIND_BOE;
                                    const _Hk = _rahmen.y.mul(_sV).max(0.5);
                                    const _ankerW = _naht.anker;
                                    const _ortK = _ankerW.x.mul(_wu.uWindDir.x).add(_ankerW.z.mul(_wu.uWindDir.y));
                                    const _wK = globalThis.__phytoCore.windAusschlag(
                                        AnazhRealm._windTsl(_Ta),
                                        {
                                            t: _wu.uWindTime,
                                            U: _wu.uWindStrength.div(AnazhRealm.WEATHER_WIND_AMP),
                                            g: _Ta
                                                .sin(_wu.uWindTime.mul(_WB.omega).sub(_ortK.mul(_WB.k)))
                                                .mul(_WB.amp)
                                                .add(_WB.mitte),
                                            f0: this._karteWindDelta()
                                                .mul(globalThis.__phytoCore.WIND_GESETZ.kF)
                                                .div(_Hk),
                                            H: _Hk,
                                            zeta: _uv.y,
                                            rho: _Ta.float(0),
                                            phi: _ortK.mul(-_WB.k),
                                            psi: _Ta.float(0),
                                        },
                                        false
                                    );
                                    const _swayW = _Ta.vec3(
                                        _wu.uWindDir.x.mul(_wK.quer),
                                        _Ta.float(0.0),
                                        _wu.uWindDir.y.mul(_wK.quer)
                                    );
                                    const _swayT = _naht.vorlage(_swayW);
                                    mat.positionNode = _Ta.vec3(
                                        _axis.x.add(_lz.mul(_off)).sub(_sPhi.mul(_lx).mul(_bV)).add(_swayT.x),
                                        _hHv.add(_cPhi.mul(_bV)).add(_swayT.y),
                                        _axis.z.add(_lx.negate().mul(_off)).sub(_sPhi.mul(_lz).mul(_bV)).add(_swayT.z)
                                    );
                                    mat.userData = mat.userData || {};
                                    mat.userData.impostorBillboard = true; // Linsen-Marker (diag-impostor)
                                    // Schicht-Upload und Wachsen sieht der Textur-Wächter der Diät (`_diaetVorTextur`): EIN Refresh.
                                    // DAS LAUB-LICHT DER KARTE (K19): die ferne Stufe lichtet mit dem EINEN Laub-Licht-Term der
                                    // nahen (phyto-core `laubDurchlass`) über der Normale des Normal-Atlas; die Nadel trägt ihre
                                    // Schicht (`_karteNadel`). Bis K19 leuchtete die nahe Krone im Gegenlicht, ihre Karte nicht.
                                    this._laubLichtStoff(mat, () => this._karteNadel(_Ta).element(_schicht.toInt()));
                                }
                            } catch (_e) {
                                // die Karten-Verdrahtung fällt nie in die Fernstufen-Geometrie: ihr Bruch bricht den Bau
                                throw this._stoffBruch("die Karten-Verdrahtung", _e);
                            }
                        } else if (opts.foliageLeaf && opts.foliageBlade) {
                            // Die Klinge ist Geometrie: das L0-Blatt (phyto-core `buildLeafBlades`) braucht keinen Atlas, alpha
                            // bleibt 1. alphaTest bleibt gesetzt, damit das Dither-Crossfade die Klingen am L0→L1-Band ausblendet.
                            mat.alphaTest = 0.5;
                        } else if (opts.foliageLeaf) {
                            // Die Karte sampelt den EINEN Blatt-Atlas über den EINEN Leser (`_blattAtlasProbe`): ALPHA = die
                            // Zweig-Silhouette, RGB = der Blatt-Wert, der die Vertex-Farbe tönt. Fehlt der Kern, bricht
                            // `_ensureFoliageClusterAtlas` laut (KERN-PFLICHT) — die stille Ellipsen-Maske hinter einem
                            // catch ist gefallen (05.10.: kein Stoff ohne seinen Atlas, wie der Laub-Stoff der Welt);
                            // headless (kein document) zeichnet kein Stoff.
                            const _atl = this._blattAtlasProbe(_Ta);
                            if (_atl) {
                                _alpha = _atl.a;
                                albedoNode = albedoNode.mul(_atl.rgb);
                            }
                            mat.alphaTest = 0.5;
                        }
                        // DIE NORMALE DER KRONE, flip-frei, und die gesehene Blatt-Seite (K68-N1): das Grammatik-Laub trägt
                        // die Normale der Krone (`_kronenNormalenAuf`, das Kern-Gesetz) und liest sie wie die Studio-Krone
                        // (`_laubStoffNormale`: die Geometrie-Normale des Renderers ohne die Seite), die Unterseite aus der
                        // gesehenen Fläche (`_laubUnterseite`) — EIN Laub-Look für Werkstatt und Welt.
                        if (opts.foliageLeaf === true && !opts.impostorAtlas) {
                            this._laubStoffNormale(_Ta, mat);
                            albedoNode = this._laubUnterseite(_Ta, albedoNode);
                        }
                        // Rinden-Maserung prozedural aus dem holz-Tag (keine Bitmap): Längs-Faser (hohe Frequenz quer x/z,
                        // niedrige längs y) + Risse aus härte (ridged-Noise); moduliert die per-Vertex-Rinden-Albedo.
                        // positionLocal hält die Maserung instanz-stabil. Marker bei TSL-Fehler.
                        if (opts.bark) {
                            // Rinde über den EINEN Substanz-Charakter-Kern (bark-Modus): Längs-Faser + Riss-Kavität + Ton + Moos
                            // + Roughness. KEIN Bump: `bumpMap` (screen-space, ohne UVs) kippt auf dem dünnen, gekrümmten Stamm
                            // die Normale → er liest konkav; der Bump bleibt dem flachen Boden.
                            const _rb = this._substanceCharacter(_Ta, albedoNode, {
                                pos: _Ta.positionLocal,
                                worldPos: _Ta.positionWorld,
                                tags: opts.tags || {},
                                metal: 0,
                                bark: true,
                                roughBase: _Ta.materialRoughness,
                            });
                            albedoNode = _rb.albedo;
                            if (_rb.roughNode) mat.roughnessNode = _rb.roughNode;
                        }
                        mat.colorNode = _Ta.vec4(albedoNode, _alpha);
                    }
                    // DIE VERTEX-FARBE EINMAL (der EINE Ort der Klasse „Albedo = Farbe²"): r184 setupDiffuseColor
                    // multipliziert den colorNode mit der Vertex-Farbe, solange vertexColors an ist und die Geometrie ein
                    // color-Attribut trägt. Jeder colorNode dieses Zweigs TRÄGT sie schon — Fels (`vertexColorAlbedo`),
                    // Boden (Chunk, Insel, Voxel-Test, Bauplan-Verschmelzung), Rinde, Laub, Klinge, Kronen-Kern; die
                    // Karte ersetzt sie durch den Atlas und hat kein color-Attribut. Bis 06.10. schaltete nur der Boden ab:
                    // Grammatik-Rinde/-Laub und der Fels zeichneten Farbe², die Werkstatt-Vorschau desselben Baums Farbe¹.
                    if (mat.colorNode) mat.vertexColors = false;
                } else if (isFlatStructure) {
                    // Flach-Farb-Werke (Tempel · Schwert · Rüstung · Esse · …) fließen durch den EINEN Substanz-
                    // Charakter-Kern (Korn · Kavität · Ton · Verwitterung · Moos · Counter-Shading · Roughness),
                    // instanz-stabil (positionLocal), tag-getrieben, LOD-gegated. DIE WERTE JE STOFF (material.K5): die Farbe
                    // liest r184 aus dem Stoff (`materialColor` — auch die Wahl-Tönung der Werkstatt-Vorschau, die bis dahin auf
                    // keinem flachen Teil stand), die Maße seiner Zeile der Kern als Stoff-Wert (`werte`) — Werke gleicher
                    // Gestalt teilen EIN Programm (`_graphTeilen` unten). Bis dahin trug jede Farbe und jede Zeile ihre
                    // Konstanten im Graphen: die Glanz-Bühne (Eisen, Bronze, Quarz, Stahl) übersetzte vier Programme.
                    werte = mat.userData.stoffWerte = {};
                    const _r = this._substanceCharacter(_Ta, _Ta.materialColor, {
                        pos: _Ta.positionLocal,
                        worldPos: _Ta.positionWorld,
                        tags: opts.tags || {},
                        metal: params.metalness || 0,
                        roughBase: _Ta.materialRoughness,
                        werte,
                    });
                    albedoNode = _r.albedo;
                    mat.colorNode = _Ta.vec4(_r.albedo, _Ta.float(1.0));
                    if (_r.roughNode) mat.roughnessNode = _r.roughNode;
                }
            } catch (_e) {
                throw this._stoffBruch("der PBR-Stoff (Albedo-Quelle)", _e);
            }
            this._applySubstanceResponse(mat, responseProfile, werte);
            // DER WERK-STOFF zeichnet mit dem Graphen seiner Gestalt (die Folge seiner Stoff-Werte); Leuchten und Nässe
            // (`_leuchtStoff`) hängen an diesen Knoten und teilen sich mit ihnen
            if (werte)
                this._graphTeilen(mat, "werk:" + Object.keys(werte).join(","), [
                    "colorNode",
                    "roughnessNode",
                    "outputNode",
                ]);
        }
        // Geflattete Shading-Normale (2.5D-Lichtung) NUR für Terrain (vertexColors ohne pflanzenStoff).
        // Vegetation (pflanzenStoff) behält ihre echte Normale — nach oben gerichtete Laub-Karten wären mittags
        // voll sonnen-lit, ACES wüsche die Krone teal/weiß.
        let _mikroH = null; // die Höhe des Mikro-Reliefs (`_mikroStoff`: Kavität auf der Himmels-Sicht, Korn in der Albedo)
        if (opts.vertexColors && !opts.pflanzenStoff && !opts.vertexColorAlbedo) {
            try {
                const _Tn = THREE.TSL;
                const _aun = this._ensureAtmoUniforms();
                {
                    const _up = _Tn.vec3(0.0, 1.0, 0.0);
                    const _flat = _aun.terrainFlatten;
                    // DIE GEOMETRIE-NORMALE DIESES GRAPHEN ist `normalWorldGeometry` × Flächen-Vorzeichen, nie r184s
                    // `normalWorld`: das ist EINE Variable je Programm, und las dieser normalNode (er baut in der
                    // NORMAL-Stufe) sie zuerst, übernahmen der Schatten-Lookup (normalBias), das Halbkugel- und das
                    // Umgebungslicht ihre NORMAL-Fassung — die Geometrie-Normale mit Flächen-Vorzeichen. Die Boden-
                    // Dreiecke zeigen oben ihre Rückseite (DoubleSide), die Normale zeigte nach unten, der normalBias schob
                    // die Probe 1 m in den Boden. Welche Fassung ein Programm bekam, hing an seiner Bau-Reihenfolge
                    // (echte GPU, Mess-Wiese, Zweit-Boot nach kurzem Erst-Boot: 4 von 5 Läufen dunkel, Boden-Helligkeit
                    // 68 statt 133 — gate:altlasten Normal-Wand). Derselbe Wert wie vorher, `normalWorld` baut nur die
                    // Licht-Stufe (die End-Normale aus diesem normalNode).
                    // der Boden (K51-2): die Geometrie-Normale wandert im Übergangs-Band mit der Lage zur Normale der gröberen Stufe
                    const _nWG = opts.geomorph ? this._bodenStufenKnoten().normalWelt : _Tn.normalWorldGeometry;
                    const _nGeo = _nWG.mul(_Tn.faceDirection);
                    // DIE 2.5D-LICHTUNG GILT UNTER DEM HIMMEL (K02a, Auge 11 bei 762/−138): die geflattete Normale zeigt
                    // jede Boden-Fläche zum Himmel — in der Höhle lag so jede Decke und Wand als Wiese im Licht von oben
                    // (der Himmel als blaugrauer Schleier, die Sonne ohne Schatten auf dem Fels), und kein Licht von unten
                    // erreichte die Decke. Mit der Himmels-Sicht (`himmelsSicht`, je Vertex `aHimmel`, gelaende-core `himmelsSicht`)
                    // flacht sie nur, soweit der Himmel die Fläche sieht; in der Höhle trägt die WAHRE Normale (−∇d, in die
                    // Luft — ohne Flächen-Vorzeichen: die Windung des Netzes kennt die Seite der Luft nicht). Unter dem
                    // Himmel (aHimmel 1) ist sie dieselbe Zahl wie vorher.
                    const _hS = opts.himmelsSicht ? this._bodenStufenKnoten().himmel : null;
                    let _baseN = _hS ? _Tn.mix(_nWG, _up, _flat.mul(_hS)) : _Tn.mix(_nGeo, _up, _flat);
                    const _nWahr = _hS ? _nWG : _nGeo; // die wahre Normale (Steile des Reliefs, Zuwendung des Schattens)
                    // Mikro-Relief (`_mikroRelief`, TERRAIN_BUMP): die festen Oktaven (Klumpen, Kiesel) und die drei am Schirm kippen
                    // die geflattete Normale entgegen dem Gradienten, LOD-gegated.
                    {
                        const _B = AnazhRealm.TERRAIN_BUMP;
                        const _wp = _Tn.positionWorld;
                        // Bump NUR auf flachem Boden (auf steilen Wänden ist xz-Höhen-Noise sinnlos). Schwellen (0.55, 0.85)
                        // sind gemessen (`diag-bump-flatdist`, top-surface-gefiltert): flache Wiese liegt bei ny 0.90–0.98 →
                        // voller Bump > 0.85, aus unter 0.55. Tiefere Schwellen schöben den Bump auf 32–52°-Hänge zurück.
                        // Die Steile liest die WAHRE Normale (in die Luft, `_nWahr`): unter der Himmels-Sicht zeigt `_nGeo` auf der
                        // Oberseite nach unten (DoubleSide, die Rückseite) — dort stand das Tor bis material.K2 auf 0, das Relief
                        // erreichte keinen Pixel der Wiese (Armlänge 0,5 und 1 m byte-gleich ohne es, Radeon).
                        const _flatGate = _Tn.smoothstep(_Tn.float(0.55), _Tn.float(0.85), _nWahr.y).clamp(0.0, 1.0);
                        const _lod = _Tn
                            .float(1.0)
                            .sub(
                                _Tn.smoothstep(
                                    _Tn.float(_B.lodNear),
                                    _Tn.float(_B.lodFar),
                                    _wp.sub(_Tn.cameraPosition).length()
                                )
                            )
                            .clamp(0.0, 1.0)
                            .mul(_flatGate);
                        const _mk = this._mikroRelief(_Tn, _wp);
                        _baseN = _baseN.add(_mk.neigung.mul(_lod));
                        _mikroH = _mk.hoehe.mul(_lod);
                    }
                    // normalNode ist VIEW-space (NodeMaterial.setupNormal → normalView): die geflattete Welt-Normale
                    // über die Kamera-Matrix. Bis 05.10. stand sie roh als Welt-Normale darin — die Licht-Normale des
                    // Bodens kippte mit der Kamera-Neigung, und `normalWorld` (= normalView zurück in die Welt) las aus
                    // 45 m senkrecht von oben eine Wand: die flache Wiese wurde Fels (Linse 05.10., echte GPU).
                    // Welt → Sicht ist MATRIX.transformDirection(n) (= V·n, three's transformNormalToView);
                    // n.transformDirection(MATRIX) rechnet Vᵀ·n (Sicht → Welt, three's normalWorld) und verdoppelte den
                    // Fehler (Normal-Sonde 06.10.: Kugel-Pixel 24 Grauwerte neben three's eigener Normale).
                    mat.normalNode = _Tn.cameraViewMatrix.transformDirection(_Tn.normalize(_baseN));
                    // DIE ZUWENDUNG DES SCHATTENS (1110-5, die Hang-Akne): die 2,5D-Lichtung schattiert jede Fläche, als sähe
                    // sie senkrecht zum Himmel — ob die Sonne sie trifft, entschied am Terminator allein der Schatten-Test, und
                    // der rauscht dort (der Normal-Versatz folgt der geflatteten Normale, nicht der Fläche). Gemessen an einer
                    // ebenen 30°-Rampe im Software-Holz (holz voll), Sonne 22° aus Azimut 45°, N·L −0,002: 11,7 % der Rampe
                    // fleckig gegen 0,2 % ohne Schatten (gate:schatten-terminator). Jetzt trägt der empfangene Schatten die Zuwendung der WAHREN
                    // Normale (dieselbe, aus der die Lichtung mischt) zur Richtung des aktiven Körpers: abgewandt im Schatten,
                    // der Saum am Terminator (N·L 0 … `zuwendungSaum`, ~5° Sonne) weich.
                    const _zu = _Tn.smoothstep(
                        _Tn.float(0.0),
                        _Tn.float(AnazhRealm.SCHATTEN_KASKADE.zuwendungSaum),
                        _Tn.dot(_Tn.normalize(_nWahr), this._windUniformsEnsure().uSunDir)
                    );
                    mat.receivedShadowNode = (schatten) => schatten.mul(_zu);
                }
            } catch (_e) {
                throw this._stoffBruch("die Boden-Normale (Flatten · Relief · Zuwendung)", _e);
            }
            // DIE HIMMELS-SICHT als Verdeckung: das Himmels-Licht (Umgebung, Hemi, Ambient) erreicht nur, was den Himmel
            // sieht — r184 multipliziert `aoNode` in das indirekte Licht (diffus und Glanz).
            if (opts.himmelsSicht) mat.aoNode = this._bodenStufenKnoten().himmel;
            if (_mikroH) this._mikroStoff(THREE.TSL, mat, _mikroH);
            // DAS LICHT DES AUGES (K02a, K15, K11 — `_dayNightApplyAugenLicht`, `AUGEN_LICHT`) ist ein Platz des Licht-Pools mit
            // Himmels-Ersatz: es trägt nur, wo der Himmel fehlt — der Boden reicht dem Pool seine Himmels-Sicht (`aHimmel`) unten
            // durch `_leuchtStoff`, ein Stoff ohne Himmels-Sicht gilt als offen (er trägt das Himmels-Licht ganz).
            // DER GEOMORPH DES BODENS (K51-2, CDLOD): jeder Vertex wandert im Übergangs-Band seiner Stufe stetig auf sein Ziel im
            // Netz der nächst gröberen Stufe (`aMorphTarget`, `stufeZiel`), an der Grenze `bis` liegt er ganz auf ihr — dort
            // wechselt der Chunk (`_voxelChunkLodFor`), deckungsgleich. `aMorphWeight` trägt den Morph-Code 2 · Stufe + Naht
            // (`_morphCode`): die Naht (T2, die Grenz-Zeile am gröberen Nachbarn) und das Stufen-Gewicht vereinen sich zu
            // Naht + Stufe − Naht · Stufe. Der CPU-Spiegel ist `_morphFaktor` (Boden-Leser, Sprung-Linse).
            if (opts.geomorph) {
                try {
                    const _Tm = THREE.TSL;
                    const _aum = this._ensureAtmoUniforms();
                    {
                        const _tgt = _Tm.attribute("aMorphTarget", "vec3");
                        const _f = this._bodenStufenKnoten().f;
                        void _aum;
                        mat.positionNode = _Tm.positionLocal.add(_tgt.sub(_Tm.positionLocal).mul(_f));
                    }
                } catch (_e) {
                    throw this._stoffBruch("der Geomorph des Bodens", _e);
                }
            }
        }
        // Die geteilte Vegetations-Antwort (Wind-Sway + Instance-Tint + Subsurface-Backlit) wie in Toon.
        // Laub (pflanzenStoff) trägt die Vertex-Farbe EINMAL im colorNode; die Instanz-Farbe multipliziert die Pipeline.
        this._applyVegetationResponse(mat, opts);
        // das Leuchtquellen-Gesetz: der Licht-Pool im Leuchten des Stoffs (K11), der Boden mit seiner Himmels-Sicht
        if (opts.pflanzenStoff && !opts.bark) mat.userData.poren = AnazhRealm.NAESSE.poren.foliage; // das Laub trägt Wachs
        this._leuchtStoff(mat, null, opts.himmelsSicht ? this._bodenStufenKnoten().himmel : null);
        // Marker für das Test-Band (kein semantisches Verhalten)
        mat.userData = mat.userData || {};
        mat.userData.isPbrMaterial = true;
        mat.userData.pbrRoughness = params.roughness;
        mat.userData.pbrMetalness = params.metalness;
        return mat;
    }

    // DIE KNOTEN DES STUFEN-MORPHS (K51-2, CDLOD) — EIN Satz für den Boden-Stoff (Lage, Normale, Stoff-Farbe, Himmels-Sicht,
    // Schutt). Der Satz trägt je Vertex in der vierten Komponente: die Farbe den Morph-Code (2 · Stufe + Naht, `_morphCode`), das
    // Normal-Ziel die Himmels-Sicht, das Farb-Ziel den Schutt (`_chunkSatzArt` boden). Der Faktor f = (Naht + w − Naht · w) ·
    // geomorph, w = smoothstep(bis − band, bis, d) im Chebyshev-Abstand d zum Auge der Stufen (`stufeAuge`); Lage, Normale und
    // Farbe wandern mit demselben f zum Ziel der gröberen Stufe — am Wechsel deckungsgleich. CPU-Spiegel: `_morphFaktor`.
    _bodenStufenKnoten() {
        if (this._bodenStufenK) return this._bodenStufenK;
        const T = THREE.TSL;
        const U = this._ensureAtmoUniforms();
        const farbe4 = T.attribute("color", "vec4");
        const code = farbe4.w;
        const L = code.mul(0.5).floor();
        const s = code.sub(L.mul(2.0));
        const ST = AnazhRealm.BODEN_STUFEN.stufen;
        const je = (k) =>
            T.select(
                L.lessThan(0.5),
                T.float(ST[0][k]),
                T.select(L.lessThan(1.5), T.float(ST[1][k]), T.float(ST[2][k]))
            );
        const bis = je("bis");
        const rel = T.positionLocal.xz.sub(U.stufeAuge).abs();
        const w = T.smoothstep(bis.sub(je("band")), bis, T.max(rel.x, rel.y));
        const f = U.geomorph.mul(s.add(w).sub(s.mul(w)));
        const nZ4 = T.attribute("aNormalZiel", "vec4");
        const fZ4 = T.attribute("aFarbeZiel", "vec4");
        const nLokal = T.normalize(T.mix(T.normalGeometry, nZ4.xyz, f));
        this._bodenStufenK = {
            f,
            farbe: T.mix(farbe4.xyz, fZ4.xyz, f),
            normalWelt: T.normalize(T.modelNormalMatrix.mul(nLokal)),
            himmel: nZ4.w,
            schutt: fZ4.w,
        };
        return this._bodenStufenK;
    }

    // DAS LEUCHTQUELLEN-GESETZ IM STOFF (K11): JEDER beleuchtete Stoff der Welt trägt den Licht-Pool als Term seines Leuchtens
    // — der Stoff-Bau `_buildPbrNodeMaterial` (und mit ihm jeder Toon-Aufruf), der Foundry-Stoff `_foundryTreeMaterial` und
    // jeder Stoff, den eine Schicht selbst baut (Gras, Fern-Ring, Sockel, Wege und Zaun, Rauch, Schatten-Zwilling, Vorschau);
    // die Wand: die S0-Probe der Mess-Bühne (Zensus der Bauer im Stamm UND jedes beleuchteten Stoffs der Szene). Ein Stoff, dessen
    // Gesetzbuch ein Datum mit Zeitplan stempelt (`mp.licht`: "fenster" am fachwerk `glas`, "laterne" am `laternenglas`),
    // glüht in der Glut SEINES Datums (`atmoUniforms.lichtGlut[licht]`, Farbe aus `kelvin` × Zeitplan); die Glut selbst (Seh-Klasse glut, das Leucht-Gesetz) ist Quelle und liest den Pool nicht.
    // `himmel` (ein Knoten 0…1, der Boden: `aHimmel`) ist die Himmels-Sicht der Fläche — ein Platz mit Himmels-Ersatz (das
    // Licht des Auges) trägt nur, wo sie fehlt; ohne sie gilt der Stoff als offen. KEIN Szenen-Licht: r184 sammelt jedes
    // Szenen-Licht in den Licht-Hash jedes beleuchteten Stoffs und rechnet seine BRDF auch auf Stärke 0 — der Pool ist eine
    // feste Zahl geteilter Uniforms ab dem Boot (EIN Schreiber `_leuchtTakt`), ein Wechsel der Quellen baut kein Programm.
    // EIN KNOTEN JE GRAPH (1310-18): dasselbe Leuchten über derselben Basis (dem Leucht-Knoten des Stoffs oder r184s
    // `materialEmissive`), demselben Zeitplan und derselben Himmels-Sicht ist DERSELBE Knoten — Stoffe mit geteiltem Graphen
    // (`_foundryTreeMaterial`) teilen so auch ihr Leuchten und mit ihm ihr Programm (r184 schlüsselt nach der Knoten-Identität).
    _leuchtStoff(mat, mp, himmel) {
        if (!mat || mat.isNodeMaterial !== true) throw new Error("_leuchtStoff: kein Knoten-Stoff");
        const Te = THREE.TSL;
        const atmo = this._ensureAtmoUniforms();
        mat.userData = mat.userData || {};
        if (mp && (mp.seh === "glut" || mp.leucht > 0)) {
            mat.userData.lichtPool = "quelle";
            return mat;
        }
        this._naesseImStoff(mat, himmel);
        // EIN KNOTEN JE GRAPH: das Leuchten haengt an der Basis, der Himmels-Sicht und daran, ob der Stoff ein Licht-Datum traegt
        // (`mp.licht`, fachwerk LICHT_GESETZ) — ohne Datum glueht der Stoff nur im Pool. WELCHES Datum, ist sein Stoff-Wert
        // (`stoffWerte.licht`, die Stelle im Gesetz): der Knoten traegt die Glut jedes Datums und waehlt die seine (w4-ankunft-5 —
        // bis dahin je Datum ein Knoten: Laterne und Fenster bauten vor dem Bild zwei Programme desselben Texts, Radeon kalt
        // 70–75 ms je Bau)
        const ohne = this._leuchtOhne || (this._leuchtOhne = {});
        const jeBasis = this._leuchtKnoten || (this._leuchtKnoten = new WeakMap());
        const basis = mat.emissiveNode || ohne;
        if (!jeBasis.has(basis)) jeBasis.set(basis, new WeakMap());
        const jeHimmel = jeBasis.get(basis);
        if (!jeHimmel.has(himmel || ohne)) jeHimmel.set(himmel || ohne, {});
        const knoten = jeHimmel.get(himmel || ohne);
        const licht = mp && mp.licht ? String(mp.licht) : "";
        const daten = Object.keys(atmo.lichtGlut);
        if (licht) {
            if (!daten.includes(licht))
                throw new Error(`_leuchtStoff: das Licht-Datum „${licht}“ fehlt im Leuchtquellen-Gesetz`);
            (mat.userData.stoffWerte || (mat.userData.stoffWerte = {})).licht = daten.indexOf(licht);
        }
        const art = licht ? "datum" : "";
        if (!knoten[art]) {
            let em = mat.emissiveNode ? Te.vec3(mat.emissiveNode) : Te.materialEmissive;
            if (licht) {
                const wahl = this._stoffWert(Te, "userData.stoffWerte.licht");
                for (let i = 0; i < daten.length; i++)
                    em = em.add(wahl.equal(i).select(atmo.lichtGlut[daten[i]], Te.vec3(0)));
            }
            knoten[art] = em.add(this._lichtPoolTerm(Te, atmo, himmel || null));
        }
        mat.emissiveNode = knoten[art];
        mat.userData.lichtPool = true;
        return mat;
    }

    // DIE NÄSSE IM STOFF (wetter.K2) — an der Engstelle jedes beleuchteten Welt-Stoffs (`_leuchtStoff`: Boden, Fern-Ring, Fels,
    // Werk, Studio- und Satz-Stoff, Gras, Wege): das Gesetz nasser Oberflächen (`_naesseGesetz`) mit dem Gewicht w = Nässe der
    // Welt (`atmoUniforms.naesse`, EIN Schreiber `_naesseTakt`) × Himmels-Sicht (unter einer Decke des Dach-Pools 0, am Boden ×
    // `aHimmel`) × Poren der Art (`NAESSE.poren`, Laub und Haut tragen Wachs bzw. Fett). Durchsichtiges (Glas, Rauch) bleibt;
    // die Ausschnitt-Alpha bleibt in colorNode.a (Lehre 26). Die Albedo des Gesetzes ist die ganze Farbe: trägt sie r184 nach dem
    // colorNode mit (die Instanz-Farbe des Zauns), nennt der Stoff den Faktor in `userData.naesseFarbe`. EIN KNOTEN JE GRAPH: dieselbe Farbe, Rauheit, Metall-Quelle,
    // Himmels-Sicht und Poren-Zahl ergeben DENSELBEN Knoten — Stoffe einer Studio-Signatur behalten ihr Programm.
    _naesseImStoff(mat, himmel) {
        const ud = mat.userData || {};
        const poren = ud.poren ?? AnazhRealm.NAESSE.poren[ud.foundryKind] ?? 1;
        if (mat.transparent || ud.shadowTwin || !(poren > 0)) return;
        const T = THREE.TSL;
        const quellen = [mat.colorNode, mat.roughnessNode, mat.metalnessNode, himmel, ud.naesseFarbe];
        const schluessel = quellen.map((n) => (n ? n.id : "-")).join("|") + "|" + poren;
        const karte = this._naesseKnoten || (this._naesseKnoten = new Map());
        if (!karte.has(schluessel)) {
            const farbe = mat.colorNode || T.vec4(T.materialColor, 1);
            const w = this._ensureAtmoUniforms()
                .naesse.mul(this._naesseHimmel(T))
                .mul(himmel ? T.float(poren).mul(himmel) : T.float(poren));
            const A = { k: (n) => T.float(n), mul: (a, b) => a.mul(b), sub: (a, b) => a.sub(b), mix: T.mix };
            const n = AnazhRealm._naesseGesetz(
                A,
                ud.naesseFarbe ? farbe.rgb.mul(ud.naesseFarbe) : farbe.rgb,
                mat.roughnessNode || T.materialRoughness,
                mat.metalnessNode || T.materialMetalness,
                w
            );
            karte.set(schluessel, { farbe: T.vec4(farbe.rgb.mul(n.faktor), farbe.a), rauh: n.rauh });
        }
        const k = karte.get(schluessel);
        mat.colorNode = k.farbe;
        mat.roughnessNode = k.rauh;
    }

    // DAS GESETZ NASSER OBERFLÄCHEN (Lagarde 2013, „Water drop 3b — Physically based wet surfaces"; Lekner & Dorf 1988): das
    // Wasser in den Poren hält das gestreute Licht länger im Stoff — die Albedo geht gegen ihr Quadrat (`faktor` auf die Farbe:
    // dunkle Stoffe dunkeln stärker), der Wasserfilm glättet die Rauheit; Metall hat keine Poren (Gewicht × 1 − Metall). Über einer Algebra A: TSL-Knoten
    // im Stoff (`_naesseImStoff`), Zahlen in der Linse (`werkbank licht --naesse`: dicht) — EINE Formel.
    static _naesseGesetz(A, albedo, rauh, metall, w) {
        const N = AnazhRealm.NAESSE;
        const p = A.mul(w, A.sub(A.k(1), metall));
        return {
            faktor: A.mix(A.k(1), albedo, p),
            rauh: A.mix(rauh, A.mul(rauh, A.k(N.glatt)), p),
        };
    }

    // DIE NÄSSE UNTER DEM HIMMEL (EIN Knoten je Seite): die Himmels-Sicht des Regens (`_offenerHimmel`) am Welt-Ort des Fragments;
    // ein Fragment unter einer Decke steht trocken (Boden, Wände und Dinge des Innenraums; die Außenwand liegt außerhalb der Decke).
    _naesseHimmel(T) {
        if (this._naesseHimmelK) return this._naesseHimmelK;
        const U = this._ensureAtmoUniforms();
        const p = T.positionWorld;
        // die trockene Welt zahlt den Pool nie: r184s select schreibt ein if/else, die Bedingung liest den Welt-Ort (EINE
        // Variable je Programm, wie die Bedingung des Licht-Pools); trocken ist das Gewicht ohnehin 0
        const nass = U.naesse.greaterThan(0).and(p.y.greaterThan(-1e9));
        this._naesseHimmelK = T.select(nass, this._offenerHimmel(T, p), T.float(0));
        return this._naesseHimmelK;
    }

    // DIE HIMMELS-SICHT DES REGENS am Welt-Ort `p`: 1 unter offenem Himmel, 0 unter einer Decke des Dach-Pools — je Platz die
    // Decke eines Baus (Mitte xz, Gier cos/sin; halbe Kanten, Oberkante y), ein Ort darunter und im Grundriss der Decke liegt
    // unter ihr. Leser: die Nässe der Stoffe (`_naesseHimmel`, je Fragment) und die Schliere des Regens (`_ensureRainSystem`,
    // je Schliere: unter der Decke fällt kein Regen — bis dahin fiel er durch jedes Dach, gate:naesse:echt sah ihn am Haus des
    // Dorfs auf der Trasse: 27 Regen-Punkte innen).
    _offenerHimmel(T, p) {
        const U = this._ensureAtmoUniforms();
        let unter = T.float(0);
        for (let k = 0; k < U.dachLage.length; k++) {
            const L = U.dachLage[k];
            const M = U.dachMass[k];
            const d = p.xz.sub(L.xy);
            const lx = d.x.mul(L.z).sub(d.y.mul(L.w)).abs();
            const lz = d.x.mul(L.w).add(d.y.mul(L.z)).abs();
            unter = unter.max(T.step(lx, M.x).mul(T.step(lz, M.y)).mul(T.step(p.y, M.z)));
        }
        // DIE HÜLLE DES POOLS (naesse-kosten): die Plätze prüft nur ein Ort im Kasten um alle Decken und unter ihrer höchsten
        // Oberkante (`dachHuelle`/`dachOben`, `_dachTakt`) — draußen steht er unter offenem Himmel, ohne Decke ist der Kasten leer.
        // Gemessen GTX in EINER Welt (Wiese Ego, Regen 10 min, gpu-bank): der Pool kostete jedes nasse Fragment +0,54 ms je Bild,
        // auch ohne ein Dach im Umkreis; das Gesetz selbst +0,05
        const H = U.dachHuelle;
        const drin = p.x
            .greaterThanEqual(H.x)
            .and(p.x.lessThanEqual(H.z))
            .and(p.z.greaterThanEqual(H.y))
            .and(p.z.lessThanEqual(H.w))
            .and(p.y.lessThanEqual(U.dachOben));
        return T.select(drin, T.float(1).sub(unter), T.float(1));
    }

    // DER DACH-POOL (EIN Schreiber, aus `_naesseTakt`): die Decken der `NAESSE.dachPlaetze` Bauten, die dem Auge am nächsten
    // stehen (im `dachUmkreisM`), neu gewählt nach `dachSchrittM` Weg des Auges, einem neuen Stand der Grundrisse oder einer
    // neuen Decke (`_dachKastenSetzen`). Die Decke eines Hauses: die höchste Box seiner festen Hülle, deren Fläche mindestens
    // die Hälfte der größten trägt (die Decke über dem Erdgeschoss, über dem Obergeschoss, nie der Kamin) — gemerkt je Hülle;
    // die eines Baus ohne Haus-Hülle sein Kasten (`_dachKasten`). Ein leerer Platz hat die Kanten 0.
    _dachTakt() {
        const st = this.state;
        const N = AnazhRealm.NAESSE;
        const auge = st.camera && st.camera.position;
        const stand = this._grundrissStand();
        const w = this._dachWahl;
        if (!auge || (w && w.stand === stand && Math.hypot(auge.x - w.x, auge.z - w.z) < N.dachSchrittM)) return;
        this._dachWahl = { stand, x: auge.x, z: auge.z };
        const decken = [];
        for (const e of st.architectures || []) {
            const hu = e._hausHuelle;
            if (!(hu || e._dachKasten) || !e.position) continue;
            if (Math.hypot(e.position.x - auge.x, e.position.z - auge.z) > N.dachUmkreisM) continue;
            if (hu && (!e._dachDecke || e._dachDecke.hu !== hu)) {
                const b = (AnazhRealm._huelleVon(hu, "fest", "fachwerk:__huelle") || []).filter((t) => t.art === "box");
                const fl = (t) => t.h[0] * t.h[2];
                const gross = Math.max(0, ...b.map(fl));
                e._dachDecke = {
                    hu,
                    t: b.filter((t) => fl(t) >= gross / 2).sort((a, c) => c.c[1] + c.h[1] - a.c[1] - a.h[1])[0],
                };
            }
            const t = hu ? e._dachDecke.t : e._dachKasten;
            if (!t) continue;
            const k = hu ? (Number.isFinite(e._hausHuelleSkala) ? e._hausHuelleSkala : 1) : t.k;
            const ry = Number.isFinite(e.rotationY) ? e.rotationY : 0;
            const [co, si] = [Math.cos(ry), Math.sin(ry)];
            const x = e.position.x + (t.c[0] * co + t.c[2] * si) * k;
            const z = e.position.z + (t.c[2] * co - t.c[0] * si) * k;
            decken.push({
                d: Math.hypot(x - auge.x, z - auge.z),
                x,
                z,
                co,
                si,
                ex: t.h[0] * k,
                ez: t.h[2] * k,
                y: e.position.y + (hu ? 0 : t.dy) + (t.c[1] + t.h[1]) * k,
            });
        }
        decken.sort((a, b) => a.d - b.d);
        const U = this._ensureAtmoUniforms();
        // die Hülle des Pools: der achsparallele Kasten um alle gewählten Decken (je Decke ihr gedrehter Grundriss) und die höchste
        // Oberkante — leer (min > max) ohne Decke; `_naesseHimmel` prüft die Plätze nur darin
        const h = [Infinity, Infinity, -Infinity, -Infinity, -1e6];
        for (let i = 0; i < U.dachLage.length; i++) {
            const d = decken[i];
            U.dachLage[i].value.set(d ? d.x : 0, d ? d.z : 0, d ? d.co : 1, d ? d.si : 0);
            U.dachMass[i].value.set(d ? d.ex : 0, d ? d.ez : 0, d ? d.y : -1e6, 0);
            if (!d) continue;
            const hx = Math.abs(d.co) * d.ex + Math.abs(d.si) * d.ez;
            const hz = Math.abs(d.si) * d.ex + Math.abs(d.co) * d.ez;
            h[0] = Math.min(h[0], d.x - hx);
            h[1] = Math.min(h[1], d.z - hz);
            h[2] = Math.max(h[2], d.x + hx);
            h[3] = Math.max(h[3], d.z + hz);
            h[4] = Math.max(h[4], d.y);
        }
        if (h[0] > h[2]) h.splice(0, 4, 1, 1, -1, -1);
        U.dachHuelle.value.set(h[0], h[1], h[2], h[3]);
        U.dachOben.value = h[4];
    }

    // DIE DECKE OHNE HAUS-HÜLLE (wetter.K2, beim Platz der Studio-Gestalt `_archInstanceAdd`): ein Bau der `NAESSE.dachArten`
    // (Marktstand · Brunnen · Tor) trägt keine Hülle mit Decke, seine Form schließt oben über ihrem Grundriss (die Plane, das
    // Schindeldach, das Gewölbe) — seine Decke ist der Kasten der gezeichneten Teile im Raum des Eintrags (`leaf.localMatrix` ×
    // Geometrie-Kasten, die Welt-Matrix `_archEntryWorldMatrix`: Skala und 0,5 m unter der Lage), einmal je Eintrag (null: ohne Dach).
    _dachKastenSetzen(entry, leaves) {
        const preset = this._foundryPresetForEntry(entry);
        const rec = preset && this._foundry && this._foundry.recipes ? this._foundry.recipes[preset] : null;
        const arten = AnazhRealm.NAESSE.dachArten;
        if (!rec) return; // das Buch ist kalt: der nächste Platz fragt wieder
        if (!(arten.includes(preset) || arten.includes(rec.kind))) {
            entry._dachKasten = null; // kein Dach: nie wieder gefragt
            return;
        }
        const b = new THREE.Box3();
        const t = new THREE.Box3();
        for (const lf of leaves || []) {
            const g = lf && lf.geom;
            if (!g || !g.attributes || !g.attributes.position) continue;
            if (!g.boundingBox) g.computeBoundingBox();
            t.copy(g.boundingBox);
            if (lf.localMatrix) t.applyMatrix4(lf.localMatrix);
            b.union(t);
        }
        if (b.isEmpty()) return;
        const k = Number.isFinite(entry.scale) && entry.scale > 0 ? entry.scale : 1;
        const c = b.getCenter(new THREE.Vector3());
        const h = b.getSize(new THREE.Vector3()).multiplyScalar(0.5);
        entry._dachKasten = { c: c.toArray(), h: h.toArray(), k, dy: -0.5 };
        this._dachWahl = null;
    }

    // DER LICHT-POOL ALS TERM (K11) — DAS EINE PUNKTLICHT-GESETZ des Stamms (jede Leuchtquelle und das Licht des Auges): je
    // Platz ein Zweig mit dem Abfall des Gesetzes (fachwerk `lichtAbfall`, K11b: (1 − (d/R)⁴)² · (d² + k²)^(−abfall/2); den
    // Bezug in 1 m, (1 + k²)^(abfall/2), trägt die Stärke des Platzes, `_leuchtTakt`), die Stärke schon durch LEGACY_LICHT
    // (`_laborLichtStaerke`) — und r184s BRDF (`_punktLichtBrdf`). Der Kern k (`lichtKern` = k²) beschränkt den Abfall nah an
    // der Quelle (eine Flamme ist keine Punkt-Singularität: r184s nacktes 1/d² legte die Steine am Bett auf das Zehnfache ihrer
    // Glut, und das Licht des Auges lag mit 1/d an der Wand weiß), weit draußen fällt das Feuer mit 1/d² (bis K11b mit dem
    // Legacy-Abfall des r128-Labors (1 − d/R)^abfall: in 4 m noch 31 % — der Boden glühte über mehrere Meter), und an der
    // Reichweite stetig auf 0. Der Welt-Ort des Platzes geht
    // mit `cameraViewMatrix` (der Kamera DES zeichnenden Renderers) in den Blick-Raum. Die BEDINGUNG liest `positionView` und
    // `normalView` (EINE Variable je Programm: r184 baut das Leuchten VOR der Lichtung — zuerst im Zweig gelesen, stünde ihre
    // Zuweisung nur dort, die Falle des Lichts des Auges): eine Reichweite, ein Gewicht (der Himmels-Ersatz), die Fläche in ihr
    // und ihm zugewandt. Die Blick-Richtung rechnet der Zweig aus `positionView`. WAS DER ZWEIG KOSTET (berichtigt beim Merge
    // V18.542 aus der Quelle, nicht aus der Annahme „WGSL select wertet beide Seiten aus"): r184s `select` ist ein
    // ConditionalNode und schreibt außerhalb von `uniformFlow` ein `if`/`else` ins WGSL, kein WGSL-`select` — das erzeugte
    // Boden-Fragment (`werkbank shader --stoff boden`) trägt je Platz `if (Bedingung) { Lambert + GGX } else { 0 }` und kein
    // `select(`. Jedes Fragment zahlt also die Bedingung je Platz (Ort in den Blick-Raum, Abstand, N·L); die BRDF zahlt eine
    // Welle der GPU nur, wenn eines ihrer Fragmente den Zweig nimmt.
    _lichtPoolTerm(Te, atmo, himmel) {
        const N = Te.normalView;
        const P = Te.positionView;
        let summe = null;
        for (let k = 0; k < atmo.lichtLage.length; k++) {
            const lage = atmo.lichtLage[k];
            const farbe = atmo.lichtFarbe[k];
            const ersatz = atmo.lichtErsatz[k];
            const kern = atmo.lichtKern[k];
            const gewicht = himmel ? ersatz.mul(himmel).oneMinus() : ersatz.oneMinus();
            const Lv = Te.cameraViewMatrix.mul(Te.vec4(lage.xyz, 1)).xyz.sub(P);
            const d = Lv.length();
            const bedingung = lage.w
                .greaterThan(0)
                .and(gewicht.greaterThan(0))
                .and(d.lessThan(lage.w))
                .and(N.dot(Lv).greaterThan(0));
            const L = Lv.div(d);
            const nl = N.dot(L).clamp();
            const q = d.div(lage.w).pow2();
            const abst = q
                .pow2()
                .oneMinus()
                .clamp()
                .pow2()
                .mul(d.mul(d).add(kern).pow(farbe.a.mul(-0.5)));
            const beitrag = farbe.rgb
                .mul(nl.mul(abst).mul(gewicht))
                .mul(this._punktLichtBrdf(Te, N, L, P.negate().normalize(), nl));
            const term = Te.select(bedingung, beitrag, Te.vec3(0));
            summe = summe ? summe.add(term) : term;
        }
        return summe;
    }

    // DIE EINE BRDF EINES PUNKTLICHTS (K11, jeder Platz des Licht-Pools): r184s Lambert + GGX ausgeschrieben — BRDF_Lambert,
    // BRDF_GGX und F_Schlick tragen kein Layout (ein Fn-Aufruf ohne Layout baut seinen Rumpf erst im Compiler, der Stoff-Graph
    // sieht ihn nicht), D_GGX und V_GGX_SmithCorrelated tragen ihres; die Stoff-Werte aus `diffuseColor` · `metalness` ·
    // `specularColor` · `specularF90` (wie r184 sie mischt — `three/tsl` der Seite kennt `diffuseContribution`/
    // `specularColorBlended` nicht). N, L, V normiert im Blick-Raum, `nl` = N·L geklemmt.
    _punktLichtBrdf(Te, N, L, V, nl) {
        const alb = Te.diffuseColor.rgb;
        const met = Te.metalness;
        const a = Te.roughness.pow2();
        const f0 = Te.mix(Te.specularColor, alb, met);
        const H = L.add(V).normalize();
        const vh = V.dot(H).clamp();
        const nv = N.dot(V).clamp();
        const nh = N.dot(H).clamp();
        const fres = Te.exp2(vh.mul(-5.55473).sub(6.98316).mul(vh)); // r184 F_Schlick: 2^((−5,55473 · V·H − 6,98316) · V·H)
        const F = f0.mul(fres.oneMinus()).add(Te.specularF90.mul(fres));
        const glanz = F.mul(Te.V_GGX_SmithCorrelated({ alpha: a, dotNL: nl, dotNV: nv })).mul(
            Te.D_GGX({ alpha: a, dotNH: nh })
        );
        return alb
            .mul(met.oneMinus())
            .mul(1 / Math.PI)
            .add(glanz); // r184 BRDF_Lambert + GGX
    }

    // DER RAUSCH-ATLAS (Welle G, der Boden-Stoff): das RAUSCH-GESETZ als EINE Textur, gelesen von zwei Knoten-Bauern, die
    // jeder Boden- und Substanz-Stoff ruft. Befund 06.10. (Zerlege-Linse, GTX 1060, Mess-Wiese): der Boden-Satz kostete
    // 6,90 ms GPU für 6 Befehle und die Hälfte des Bildes; je Boden-Fragment liefen 26 `mx_noise_float` (je Aufruf 8
    // Gitter-Hashes — die Shader-Kosten-Linse zählt 548 Ops je Aufruf, 15 722 je Fragment). Ein 3D-Wert (`raum`) liest 6 Texel,
    // eine Ebene (`ebene`: die dritte Achse ganzzahlig, z. B. `vec3(x, z, 11)` oder der Schnitt y = 0) 2 Texel — dieselbe
    // Blende, dieselbe Gradienten-Verteilung, dieselbe Skala. `ebene(p, k, achse)`: p = die zwei Achsen der Ebene, k = die
    // ganzzahlige dritte, achse = welche Gradienten-Komponente die zweite Achse trägt ("y": der Schnitt z = k mit p = (x, y);
    // "z": der Schnitt y = k mit p = (x, z)) — so trägt jeder Schnitt die Verteilung, die mx_noise in genau diesem Schnitt hat.
    // Die Bauer legen die Knoten IN den Graph des Stoffs (keine WGSL-Funktion mit Layout): r184 baut den Code einer
    // Layout-Funktion EINMAL je Builder-Klasse und hält ihn für jeden weiteren Stoff — eine Textur darin bekäme nur der
    // erste Stoff gebunden, jeder weitere Shader liefe ungültig („unresolved value", Rausch-Probe 06.10.).
    _rauschAtlas() {
        if (this._rauschAtlasCache) return this._rauschAtlasCache;
        const T = THREE.TSL;
        const R = AnazhRealm.RAUSCH_GESETZ;
        const P = R.P;
        const tex = new THREE.DataTexture(
            AnazhRealm._rauschAtlasDaten(),
            3 * P,
            P,
            THREE.RGBAFormat,
            THREE.UnsignedByteType
        );
        tex.name = "rausch-atlas";
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;
        const [A, B] = R.schraeg;
        const m = T.int(P - 1);
        // die Komponente c der vier Ecken der Zelle (i, j): EIN Texel, roh geladen — die Ladung steht im Programm, das die
        // Probe ruft (eine Bindung lebt nie in einer Layout-Funktion: r184 baut sie EINMAL je Builder-Klasse, jedes weitere
        // Programm erbte den Namen der Textur aus dem ersten)
        const ecken = (i, j, c) => T.textureLoad(tex, T.ivec2(i.mul(3).add(c), j));
        // 0 · 127 · 254 → −1 · 0 · +1
        const dekod = (e) => e.mul(255 / 127).sub(1.0);
        const blende = (t) =>
            t
                .mul(t)
                .mul(t)
                .mul(t.mul(t.mul(6.0).sub(15.0)).add(10.0));
        // bilinear über die vier Ecken (00 · 10 · 01 · 11) mit der Fünftgrad-Blende
        const zelle = (d, u) => T.mix(T.mix(d.x, d.y, u.x), T.mix(d.z, d.w, u.x), u.y);
        // DIE MISCHUNG als EINE WGSL-Funktion je Form (K17-3 Runde 2): rein (die Lage in der Zelle und die geladenen Ecken
        // als Parameter), dieselbe Rechnung wie ausgeschrieben — ausgeschrieben stand sie je Probe im Programm (der Boden
        // trug 13 Proben, mit Schatten 103 369 Zeichen WGSL).
        const ebeneMisch = T.Fn(([f, a, b]) => {
            const fx1 = f.x.sub(1.0);
            const fy1 = f.y.sub(1.0);
            const d = dekod(a)
                .mul(T.vec4(f.x, fx1, f.x, fx1))
                .add(dekod(b).mul(T.vec4(f.y, f.y, fy1, fy1)));
            return zelle(d, blende(f)).mul(R.skala);
        }).setLayout({
            name: "rauschEbene",
            type: "float",
            inputs: [
                { name: "f", type: "vec2" },
                { name: "a", type: "vec4" },
                { name: "b", type: "vec4" },
            ],
        });
        const raumMisch = T.Fn(([f, a0, a1, a2, b0, b1, b2]) => {
            const fx1 = f.x.sub(1.0);
            const fy1 = f.y.sub(1.0);
            const fx4 = T.vec4(f.x, fx1, f.x, fx1);
            const fy4 = T.vec4(f.y, f.y, fy1, fy1);
            const schicht = (e0, e1, e2, fz) => dekod(e0).mul(fx4).add(dekod(e1).mul(fy4)).add(dekod(e2).mul(fz));
            const u = blende(f);
            return zelle(T.mix(schicht(a0, a1, a2, f.z), schicht(b0, b1, b2, f.z.sub(1.0)), u.z), u).mul(R.skala);
        }).setLayout({
            name: "rauschRaum",
            type: "float",
            inputs: [
                { name: "f", type: "vec3" },
                ...["a0", "a1", "a2", "b0", "b1", "b2"].map((name) => ({ name, type: "vec4" })),
            ],
        });
        // DIE NEIGUNG DER EBENE (material.K2): derselbe Wert wie `rauschEbene` und seine Ableitung nach der Lage in der Zelle —
        // die Ecken-Gradienten, bilinear gemischt, plus die Ableitung der Fünftgrad-Blende (30 t²(t − 1)²) mal dem Sprung der
        // Ecken-Werte. EINE Probe trägt die Neigung, die vorher vier Proben als Differenz schätzten.
        const ebeneNeigungMisch = T.Fn(([f, a, b]) => {
            const ga = dekod(a);
            const gb = dekod(b);
            const fx1 = f.x.sub(1.0);
            const fy1 = f.y.sub(1.0);
            const d = ga.mul(T.vec4(f.x, fx1, f.x, fx1)).add(gb.mul(T.vec4(f.y, f.y, fy1, fy1)));
            const u = blende(f);
            const du = f.mul(f).mul(f.sub(1.0)).mul(f.sub(1.0)).mul(30.0);
            const unten = T.mix(d.x, d.y, u.x);
            const oben = T.mix(d.z, d.w, u.x);
            return T.vec3(
                T.mix(unten, oben, u.y),
                zelle(ga, u).add(du.x.mul(T.mix(d.y.sub(d.x), d.w.sub(d.z), u.y))),
                zelle(gb, u).add(du.y.mul(oben.sub(unten)))
            ).mul(R.skala);
        }).setLayout({
            name: "rauschEbeneNeigung",
            type: "vec3",
            inputs: [
                { name: "f", type: "vec2" },
                { name: "a", type: "vec4" },
                { name: "b", type: "vec4" },
            ],
        });
        // die Ebene (x, y | z) in Schicht k: `misch` ist der Wert (`rauschEbene`) oder Wert und Neigung (`rauschEbeneNeigung`)
        const ebeneProbe = (misch) => (p, k, achse) => {
            const c = T.floor(p);
            const ci = T.ivec2(c);
            const i0 = ci.x.add(A * k).bitAnd(m);
            const j0 = ci.y.add(B * k).bitAnd(m);
            return misch(p.sub(c), ecken(i0, j0, 0), ecken(i0, j0, achse === "z" ? 2 : 1));
        };
        const ebene = ebeneProbe(ebeneMisch);
        const ebeneNeigung = ebeneProbe(ebeneNeigungMisch);
        const raum = (p) => {
            const c = T.floor(p);
            const ci = T.ivec3(c);
            const i0 = ci.x.add(ci.z.mul(A)).bitAnd(m);
            const j0 = ci.y.add(ci.z.mul(B)).bitAnd(m);
            const i1 = i0.add(A).bitAnd(m);
            const j1 = j0.add(B).bitAnd(m);
            return raumMisch(
                p.sub(c),
                ecken(i0, j0, 0),
                ecken(i0, j0, 1),
                ecken(i0, j0, 2),
                ecken(i1, j1, 0),
                ecken(i1, j1, 1),
                ecken(i1, j1, 2)
            );
        };
        this._rauschAtlasCache = { tex, raum, ebene, ebeneNeigung };
        return this._rauschAtlasCache;
    }

    // DAS MIKRO-RELIEF (TERRAIN_BUMP, material.K2): Neigung und Kavität einer Fläche aus dem Rausch-Gesetz in Oktaven, die der
    // Pixel trägt. Drei Oktaven folgen der Pixelgröße (`fwidth` der Welt-Lage): die feinste trägt `mikroPx` Pixel je Periode (zwei Zellen),
    // jede weitere die halbe Frequenz, und zwischen zwei Stufen blendet die feinste ein, die gröbste aus (Gewichte fract · 1 ·
    // 1 − fract — die Summe bleibt, keine Frequenz springt am Schirm). Was feiner als ein Pixel ist, flimmert und kostet; was
    // gröber ist, fehlt bei Armlänge: die EINE Regel bindet beides an den Schirm, nie an die Weltgröße (Gebot 7). Jede Oktave
    // ist EINE Probe mit Wert und Neigung (`ebeneNeigung`), die Lage modulo ihrer Periode (P Zellen) hält die Zahl klein, der
    // Versatz im Zell-Raum trennt die Gitter der Oktaven (Perlin ist 0 auf jedem Gitterpunkt). `n` (Welt, Einheit): ohne sie die
    // Ebene (x, z) des Bodens mit seinen festen Oktaven (Klumpen `freq`, Kiesel `freq2`), mit ihr die Fläche in jeder Lage
    // (dreiplanar nach |n|⁴, in ihre Tangential-Ebene gelegt). Rückgabe { neigung (Welt, kippt die Normale gegen den Gradienten),
    // hoehe (die Höhe der Oktaven am Schirm, mittelfrei in −1 … 1) } — die Höhe trägt KAVITÄT und KORN (`_mikroStoff`): unter der
    // Mittags-Sonne kippt die Normale das Licht nur zweiter Ordnung (cos), im Schatten sieht das Auge nur das Himmels-Licht.
    _mikroRelief(T, wp, n) {
        const B = AnazhRealm.TERRAIN_BUMP;
        const ra = this._rauschAtlas();
        const P = AnazhRealm.RAUSCH_GESETZ.P;
        // die Zelle des Rauschens ist eine HALBE Periode (Perlin ist 0 auf jedem Gitterpunkt, seine Energie liegt bei ½ Zyklus je
        // Zelle): bis mk2-mikro trug die Zelle die ganze Periode, die feinste Oktave lag eine Oktave unter dem Nyquist (offline,
        // dasselbe Rauschen des Kerns, TAAU-Box 4×4: nyquist 0,04 statt 0,14 — die Boden-Station GTX 0,13 < 0,15). Die Oktaven
        // folgen dem Pixel des SCHIRMS (`schirmJeSzene`): bis w4-wiese-nah dem der Szene, unter dem Hochskalierer 0,42 Oktaven
        // zu grob (offline, der Messweg mit Zitter, Resolve und Nach-Schärfe: nyquist 0,132 → 0,169, β 1,30 → 0,82; Radeon 0,147)
        const px = T.fwidth(wp).length().mul(this._ensureAtmoUniforms().schirmJeSzene);
        const L = T.log2(px.mul(B.mikroPx).max(B.mikroMinM).mul(0.5)).negate();
        const fr = T.fract(L);
        const L0 = L.sub(fr);
        // die Höhe je Oktave fällt mit `mikroHoehe` zur gröberen (0,75: Amplitude ∝ f^0,42, das Spektrum β ≈ 1,2 — die Energie
        // liegt am Pixel, wo das Auge das Korn sieht; gleiche Höhe je Oktave wäre β 2 und legte sie in die gröbste)
        const oktaven = [
            [T.exp2(L0), fr, 1],
            [T.exp2(L0.sub(1.0)), T.float(1.0), B.mikroHoehe],
            [T.exp2(L0.sub(2.0)), T.float(1.0).sub(fr), B.mikroHoehe * B.mikroHoehe],
        ].map(([f, w, h]) => [f, w.mul(-B.mikro), w.mul(0.6 * h)]);
        if (!n)
            oktaven.push(
                [T.float(B.freq), T.float(-B.strength), T.float(0.0)],
                [T.float(B.freq2), T.float(-B.strength2), T.float(0.0)]
            );
        // je Ebene (a, b) die Neigung (x, y) und die Höhe (z)
        const ebene = (a, b) => {
            let g = T.vec3(0.0, 0.0, 0.0);
            for (const [f, w, h] of oktaven) {
                const q = T.vec2(a, b).mod(T.float(P).div(f)).mul(f).add(T.vec2(0.37, 0.71));
                const e = ra.ebeneNeigung(q, 0, "z");
                g = g.add(T.vec3(e.y.mul(w), e.z.mul(w), e.x.mul(h)));
            }
            return g;
        };
        if (!n) {
            const g = ebene(wp.x, wp.z);
            return { neigung: T.vec3(g.x, 0.0, g.y), hoehe: g.z };
        }
        const w4 = n.abs().pow(4.0);
        const w = w4.div(w4.x.add(w4.y).add(w4.z));
        const gx = ebene(wp.z, wp.y);
        const gy = ebene(wp.x, wp.z);
        const gz = ebene(wp.x, wp.y);
        const g = T.vec3(0.0, gx.y, gx.x)
            .mul(w.x)
            .add(T.vec3(gy.x, 0.0, gy.y).mul(w.y))
            .add(T.vec3(gz.x, gz.y, 0.0).mul(w.z));
        return { neigung: g.sub(n.mul(n.dot(g))), hoehe: gx.z.mul(w.x).add(gy.z.mul(w.y)).add(gz.z.mul(w.z)) };
    }

    // DER STOFF des Mikro-Reliefs: die Höhe der Oktaven am Schirm trägt die KAVITÄT (aoNode: r184 multipliziert sie in das
    // indirekte Licht, diffus und Glanz — die Mulde verdeckt ihren Himmel) und das KORN (colorNode: die Albedo der Mulde dunkler,
    // der Erhebung heller — sie trägt auch das Sonnen-Licht). Beide mittelfrei um 1 (`kavitaet`, `korn` × Höhe), so bleibt die
    // Albedo der Fläche im Mittel dieselbe (K53: was der Pixel nicht trägt, ist kein Mittel-Versatz); die Alpha des Stoffs bleibt
    // (Lehre 26: der Schattenpass liest colorNode.a). Ohne colorNode trägt die Stoff-Farbe (r184 multipliziert die Vertex-Farbe danach).
    _mikroStoff(T, mat, hoehe) {
        const B = AnazhRealm.TERRAIN_BUMP;
        const ao = T.float(1.0).add(hoehe.mul(B.kavitaet)).max(0.0);
        mat.aoNode = mat.aoNode ? mat.aoNode.mul(ao) : ao;
        const c = T.vec4(mat.colorNode || T.materialColor);
        mat.colorNode = T.vec4(c.rgb.mul(T.float(1.0).add(hoehe.mul(B.korn)).max(0.0)), c.a);
    }

    // DIE GESTALT mit ihrem Mikro-Relief (der Fels: Vertex-Stoff und Studio-Fels) setzt normalNode, aoNode und Korn des Stoffs: die
    // Geometrie-Normale × Seite (Lehre 26, nie `normalWorld`) — facettiert (`flach`) die Normale der Facette aus den Ableitungen
    // der Welt-Lage, zum Auge gewandt —, in ihrer Tangential-Ebene gekippt, fern mit dem Bump des Bodens ausgeblendet
    // (lodNear … lodFar), mal `staerke` (Knoten oder Zahl), in Sicht-Lage (normalNode ist VIEW-space).
    _mikroGestalt(T, mat, flach, staerke) {
        const B = AnazhRealm.TERRAIN_BUMP;
        const wp = T.positionWorld;
        const zumAuge = T.cameraPosition.sub(wp);
        const nF = T.normalize(T.cross(T.dFdx(wp), T.dFdy(wp)));
        const n = flach ? nF.mul(T.sign(nF.dot(zumAuge))) : T.normalize(T.normalWorldGeometry.mul(T.faceDirection));
        const nah = T.float(1.0).sub(T.smoothstep(T.float(B.lodNear), T.float(B.lodFar), zumAuge.length()));
        const k = nah.mul(staerke == null ? 1.0 : staerke);
        const m = this._mikroRelief(T, wp, n);
        mat.normalNode = T.cameraViewMatrix.transformDirection(T.normalize(n.add(m.neigung.mul(k))));
        this._mikroStoff(T, mat, m.hoehe.mul(k));
    }

    // DAS STEIN-GESETZ (porta STEIN_GESETZ, w4-genesis-tore): ein Stein-Stoff eines Studio-Rahmens trägt seine Lage im Verband im uv
    // (u = die Nummer des Steins + der Weg durch ihn, eine ganze Zahl ist eine Fuge; v = seine Länge in Metern). Je Pixel daraus: der
    // BRUCHTON je Stein (floor(u), ± `ton`), die FUGE als Box-Abdeckung des Pixels (die halbe Fuge in Metern, die Spanne des Pixels
    // aus der Ableitung von u — fern mittelt die Fuge zu ihrem Anteil, nie zu einer Linie), die KANTE als Normale (die Fase zwischen
    // Fuge und Stirn fällt 45° zur Fuge; der Gradient von u in der Fläche aus den Ableitungen am Schirm, Mikkelsen 2010 — kein
    // Tangenten-Raum; unter einem Pixel blendet sie aus) und das MIKRO-RELIEF des Felsens (`_mikroRelief`, `_mikroStoff`: Neigung,
    // Kavität und Korn, mal `staerke`). Dieselbe Rechnung zeigt das Labor (worlds/portale/porta.js `steinLabor`). Setzt colorNode
    // (aus `farbe`, der Farbe der Ecke), normalNode und aoNode.
    _steinStoff(T, mat, farbe, G, staerke) {
        const B = AnazhRealm.TERRAIN_BUMP;
        const uv = T.attribute("uv", "vec2");
        const u = uv.x;
        const L = uv.y.max(1e-3);
        const t = T.fract(u);
        const d = T.min(t, T.float(1.0).sub(t)).mul(L); // Meter zur nächsten Fuge
        const aa = T.fwidth(u).mul(L).max(1e-5); // die Spanne des Pixels in Metern
        const halb = aa.mul(0.5);
        const fuge = T.min(d.add(halb), T.float(G.fuge))
            .sub(T.max(d.sub(halb), T.float(-G.fuge)))
            .div(aa)
            .clamp(0.0, 1.0);
        const zufall = T.fract(T.sin(T.floor(u).mul(12.9898)).mul(43758.5453));
        const ton = T.float(1.0).add(zufall.mul(2.0).sub(1.0).mul(G.ton));
        mat.colorNode = T.vec4(
            T.vec3(farbe)
                .mul(ton)
                .mul(T.mix(T.float(1.0), T.float(G.fugeTon), fuge)),
            1.0
        );
        const wp = T.positionWorld;
        const n = T.normalize(T.normalWorldGeometry.mul(T.faceDirection));
        const dpx = T.dFdx(wp);
        const dpy = T.dFdy(wp);
        const r1 = T.cross(dpy, n);
        const det = T.dot(dpx, r1);
        const gU = r1
            .mul(T.dFdx(u))
            .add(T.cross(n, dpx).mul(T.dFdy(u)))
            .div(T.select(det.abs().greaterThan(1e-12), det, T.float(1e-12)));
        // zur Fuge hin fällt die Fase: die Normale kippt gegen den Gradienten des Abstands (er zeigt zur Mitte des Steins)
        const gD = gU.mul(T.select(t.lessThan(0.5), T.float(1.0), T.float(-1.0)));
        const gl = gD.length();
        const kante = T.smoothstep(T.float(G.fuge).sub(halb), T.float(G.fuge).add(halb), d)
            .mul(
                T.float(1.0).sub(
                    T.smoothstep(T.float(G.fuge + G.fase).sub(halb), T.float(G.fuge + G.fase).add(halb), d)
                )
            )
            .mul(T.float(G.fase).div(aa).clamp(0.0, 1.0))
            .mul(T.step(1e-6, gl));
        const nah = T.float(1.0).sub(
            T.smoothstep(T.float(B.lodNear), T.float(B.lodFar), T.cameraPosition.sub(wp).length())
        );
        const k = nah.mul(staerke == null ? 1.0 : staerke);
        const m = this._mikroRelief(T, wp, n);
        const kipp = m.neigung.mul(k).sub(gD.div(gl.max(1e-6)).mul(kante));
        mat.normalNode = T.cameraViewMatrix.transformDirection(T.normalize(n.add(kipp)));
        this._mikroStoff(T, mat, m.hoehe.mul(k));
        // der Stein liest seine Ecken (`_foundryBuildMesh`: nur dann trägt die Gestalt uv, und ihr Bau-Satz packt es,
        // `BAU_STEIN_ATTR`) — ohne die Marke fiel das uv jedes Stein-Rahmens, und der Satz brach („Attribut uv fehlt")
        mat.userData.liestUv = true;
    }

    // ── DER EINE SUBSTANZ-CHARAKTER-KERN ──
    // Terrain · Vegetation · Flach-Werke lesen alle diese Quelle (Korn · Kavität · Ton · Verwitterung ·
    // Moos · Counter-Shading · Roughness, LOD-gegated); der Domänen-Unterschied reist als Parameter
    // (`pos`-Skala · tags · metal · mossDrive · bark). Render-only, tag-neutral; Fehler → der
    // unveränderte Albedo. Gibt { albedo, roughNode|null }.
    // KEIN BUMP AUS DEM RAUSCHEN (material.K5): r184s `bumpMap` ist ein Textur-Bump — er wertet die Höhe an der um dFdx/dFdy
    // verschobenen Koordinate JEDER Textur in ihr neu aus. Das Rauschen liest seine Ecken ganzzahlig (`textureLoad`,
    // `_rauschAtlas`): wo die Albedo die Probe schon trug (Stein, Quarz, Holz), las der Bump dieselben Knoten — Höhen-Differenz 0,
    // die Kugel mit und ohne ihn byte-gleich (640 × 360, 0 Pixel); wo erst er sie baute (die Schichtung des Metalls), stand
    // `dpdx(vec2<i32>)` im Programm — ungültiges WGSL, Eisen, Bronze und Stahl zeichneten seit ihrer Metall-Zeile (w3w-glanz)
    // gar nicht, und die Glanz-Bühne wartete auf die abgesagte Pipeline (swiftshader 126 s, GTX über den Deckel 60 s). Das
    // Mikro-Relief einer Fläche ist EIN Gesetz (`_mikroRelief`).
    // DIE WERTE JE STOFF (`opts.werte`, material.K5): was nur diesen Stoff unterscheidet (die Maße aus Härte, Dichte, Lebendig
    // und Metall), legt der Kern in `werte` ab und liest es als Stoff-Wert (`_stoffWert`), nie als eingefaltete Konstante —
    // Stoffe gleicher Gestalt teilen so EIN Programm (`_graphTeilen`). Jede Weiche des Baus legt ihre Werte oder lässt sie: die
    // Folge der Namen IST die Gestalt. Ohne `werte` steht jeder Wert als Zahl im Graphen (Boden, Fels, Rinde: je EIN Stoff).
    _substanceCharacter(_T, baseAlbedo, opts = {}) {
        const out = { albedo: baseAlbedo, roughNode: null };
        try {
            const _ra = this._rauschAtlas();
            const f = (v) => _T.float(v);
            const W = (name, v) =>
                opts.werte ? ((opts.werte[name] = v), this._stoffWert(_T, "userData.stoffWerte." + name)) : f(v);
            const asNode = (v, d) => (v == null ? f(d) : v && v.mul ? v : f(v));
            const pos = opts.pos || _T.positionLocal;
            const wp = opts.worldPos || _T.positionWorld;
            const t = opts.tags || {};
            const ht = Math.max(0, Math.min(1, Number(t["härte"]) || 0.4));
            const di = Math.max(0, Math.min(1, (Number(t.dichte) || 0) / 3));
            const metal = Math.max(0, Math.min(1, Number(opts.metal) || 0));
            // Objekt-lokal (Default): Strata-Y · Verwitterung-unten · Counter-Shading lesen object-lokales
            // y ∈ [−1..1]. Terrain hat kein object-y → `objectLocal:false` schaltet sie ab; Korn · Ton · Kavität ·
            // Moos tragen weiter.
            const objLocal = opts.objectLocal !== false;
            // LOD-Fade: feines Korn verblasst mit der Distanz (Perf, kein Aliasing), Ton-/Moos-Zonen bleiben. Schwellen aus der
            // EINEN Quelle `TERRAIN_BUMP` (fineNear/fineFar).
            const _BD = AnazhRealm.TERRAIN_BUMP;
            const fineFade = f(1.0)
                .sub(_T.smoothstep(f(_BD.fineNear), f(_BD.fineFar), wp.sub(_T.cameraPosition).length()))
                .clamp(0, 1);
            let albedo = baseAlbedo;
            // (1) KORN — Mehr-Oktav-Noise. Metall: anisotrop längs y (geschmiedeter Schliff);
            //     Rinde: Längs-Faser (bark); sonst körnig. `pos` trägt die Domänen-Skala.
            const grainF = 2.2 + ht * 3.4;
            let gPos;
            // RINDE — KOHÄRENTE LÄNGS-FASER (V18.338, „holz hat fasern, wachstumsrichtung"): das Korn
            // wird STARK längs der Wachstumsachse (y) gestreckt → lange vertikale Furchen statt
            // isotropem Rauschen; fein um den Stamm (x/z hoch). So WEISS das Holz seine Richtung.
            if (opts.bark) gPos = _T.vec3(pos.x.mul(13 + ht * 11), pos.y.mul(0.42), pos.z.mul(13 + ht * 11));
            else if (metal > 0.5) {
                const quer = W("kornQuer", grainF * 2.6);
                gPos = _T.vec3(pos.x.mul(quer), pos.y.mul(W("kornLaengs", grainF * 0.4)), pos.z.mul(quer));
            } else gPos = pos.mul(W("korn", grainF));
            const mottle = _ra.raum(gPos);
            const broad = _ra.raum(pos.mul(f(0.85)));
            // RINDE — die Risse FOLGEN der Faser (vertikale Furchen/Platten), kein isotroper Krater.
            const crN = opts.bark
                ? _ra.raum(_T.vec3(pos.x.mul(19 + ht * 12), pos.y.mul(0.7), pos.z.mul(19 + ht * 12)))
                : _ra.raum(pos.mul(W("riss", 6.5 + ht * 9)));
            const cavity = _T.pow(f(1.0).sub(crN.mul(crN)), f(2.4));
            // Härte → kantiger Bruch: harte, nicht-hölzerne, nicht-metallene Materialien (Fels · Stein · Kristall)
            // brechen per ridged noise (Grate + Bruch-Linien) + stärkere Schichtung; weich bleibt weich, Metall
            // behält den Schliff (1−metal). `hardF` ist ein NODE: Basis aus den Tags, per-Fragment moduliert von
            // `opts.hardDrive` (Terrain reicht `rockW` → steiniger Boden bricht karstig, Wiese bleibt weich).
            const hardBase = ht * ht * (1.0 - metal) * (opts.bark ? 0.0 : 1.0);
            const hardDriveOk = (1.0 - metal) * (opts.bark ? 0.0 : 1.0);
            let hardF = W("haerte", hardBase);
            if (opts.hardDrive != null)
                hardF = hardF.add(asNode(opts.hardDrive, 0).mul(f(hardDriveOk))).clamp(0.0, 1.0);
            // Ein Term mit dem Gewicht 0 rechnet kein Rauschen: der Bruch nur, wo Härte ihn trägt (die Rinde nie), die
            // Schichtung nur, wo sie zählt (object-lokal, nie am Metall; das Terrain las sie × 0 — 1 von 26 Boden-Rauschen).
            const bruch = hardBase > 0 || (opts.hardDrive != null && hardDriveOk > 0);
            const ridge = bruch
                ? f(1.0)
                      .sub(_ra.raum(pos.mul(W("grat", 3.0 + ht * 6.0))).abs())
                      .sub(f(0.5))
                      .mul(f(2.0)) // [-1..1] scharfe Grate/Täler
                : null;
            // V18.337 — die RINDE bekommt stärkeren Kontrast: die Längs-Faser (mottle, vertikale
            // Streifen) + die Risse (cavity) sind das definierende Rinden-Detail (§0 „kaum Rinde-
            // Kontrast") → für bark verstärkt; Terrain/Werke unberührt (Faktor 1.0).
            const mottleAmp = (0.12 + di * 0.18) * (metal > 0.5 ? 0.7 : 1.0) * (opts.bark ? 1.7 : 1.0);
            const broadAmp = 0.12 + di * 0.12;
            const cavityAmpJs = (0.08 + ht * 0.16) * (opts.bark ? 2.2 : 1.0);
            const strataAmpJs = (1.0 - metal) * (0.07 + di * 0.17) * (opts.bark ? 0.4 : 1.0) * (objLocal ? 1 : 0);
            const strata =
                strataAmpJs > 0
                    ? _ra.raum(_T.vec3(pos.x.mul(0.5), pos.y.mul(opts.bark ? 1.2 : 3.4), pos.z.mul(0.5)))
                    : null;
            let mod = f(1.0).add(
                mottle
                    .mul(fineFade)
                    .mul(W("fleck", mottleAmp))
                    .mul(f(1.0).sub(hardF.mul(f(0.5))))
            ); // weiches Korn weicht dem Bruch
            if (ridge) mod = mod.add(ridge.mul(fineFade).mul(hardF.mul(f(0.3)))); // angulärer Bruch — skaliert mit hardF
            mod = mod.add(broad.mul(W("flaeche", broadAmp)));
            if (strataAmpJs > 0)
                mod = mod.add(strata.mul(W("schicht", strataAmpJs)).mul(f(1.0).add(hardF.mul(f(1.8))))); // Schichtung ∝ Härte
            mod = mod.sub(
                cavity
                    .mul(fineFade)
                    .mul(W("mulde", cavityAmpJs))
                    .mul(f(1.0).add(hardF.mul(f(1.3))))
            ); // Risse ∝ Härte
            albedo = albedo.mul(mod.clamp(0.5, 1.5));
            // Höhen-Gradient [0..1] (EINE Quelle für Verwitterung + Moos + Counter-Shading).
            const yLow = pos.y.mul(f(0.7)).add(f(0.5)).clamp(0, 1);
            // (2) TON warm↔kühl — ein Hue-Shift LIEST, wo Helligkeit auf Dunkel verschwindet.
            const toneMix = broad
                .mul(f(0.6))
                .add(mottle.mul(f(0.4)))
                .mul(f(0.5))
                .add(f(0.5))
                .clamp(0, 1);
            const toneTint = _T.mix(_T.vec3(0.9, 0.97, 1.12), _T.vec3(1.12, 1.0, 0.86), toneMix);
            albedo = albedo.mul(_T.mix(_T.vec3(1, 1, 1), toneTint, f(metal > 0.5 ? 0.28 : 0.46)));
            // (3) VERWITTERUNG/SCHMUTZ — Mulden + untere Zonen sammeln Schmutz (dunkler, entsättigt).
            // Der Schmutz der Kavität blendet mit ihr aus (`fineFade`, K53): was der Pixel nicht trägt, ist kein Mittel-Versatz —
            // unaufgelöst zog er jeden fernen Boden um 0,3 × Kavitäts-Mittel zur Erde (gate:nah-fern Luft aus: Y −4,5 %, Grün −0,022).
            const grime = cavity
                .mul(fineFade)
                .mul(f(0.5))
                .add(objLocal ? f(1.0).sub(yLow).mul(f(0.45)) : f(0.0))
                .clamp(0, 1);
            const lumA = albedo.x
                .mul(f(0.3))
                .add(albedo.y.mul(f(0.59)))
                .add(albedo.z.mul(f(0.11)));
            const dirt = _T.vec3(
                lumA.mul(f(0.52)).add(f(0.045)),
                lumA.mul(f(0.46)).add(f(0.032)),
                lumA.mul(f(0.38)).add(f(0.022))
            );
            albedo = _T.mix(albedo, dirt, grime.mul(f(opts.bark ? 0.18 : 0.3)));
            // (4) MOOS/FLECHTEN — DIE EINE Quelle. Treiber als Param: Werke = lebendig-Tag,
            //     Terrain = Feucht/Grün-Knoten, Rinde = klein. Geometrie (Patch × flach × tief) geteilt.
            const lebTag = Math.max(0, Math.min(1, (Number(t.lebendig) || 0) / 3));
            const mossDrive = opts.mossDrive != null || opts.bark ? asNode(opts.mossDrive, 0.12) : W("moos", lebTag);
            const flatN = asNode(opts.flatness, 1.0);
            const mossPatch = _ra
                .raum(wp.mul(f(0.55)))
                .mul(f(0.5))
                .add(f(0.5));
            const mossLow = objLocal ? f(1.0).sub(yLow) : f(1.0); // Terrain: Flachheit treibt, kein object-y
            const mossW = mossDrive.mul(mossPatch).mul(mossLow).mul(flatN).clamp(0, 1);
            // Die EINE Moos-Farbe: das Moos des Bodens (TERRAIN_GEOLOGY.mossTint = der nasse Grund der Palette, linear)
            // für jeden Leser — Boden, Fels, Rinde, Werke. Bis 06.10. trug der Kern daneben ein Literal (0,26/0,38/0,18,
            // eine Absichts-Farbe roh als linear).
            const moos = AnazhRealm.TERRAIN_GEOLOGY.mossTint;
            albedo = _T.mix(albedo, _T.vec3(moos[0], moos[1], moos[2]), mossW.mul(f(0.4)));
            // (5) COUNTER-SHADING (unten dunkler, oben heller) — nur object-lokal (Terrain: kein object-y).
            if (objLocal) albedo = albedo.mul(_T.mix(f(0.8), f(1.16), yLow));
            out.albedo = albedo;
            // (6) ROUGHNESS-VARIATION — nur mit Basis vom Aufrufer: das Korn variiert fein (Erhebung rau, Mulde
            // glänzt), Moos ist matt, eine feuchte kahle Niederung glänzt (`wetDrive`, Terrain). Für Werke sind
            // mossW/wetDrive ~0/null (kein Effekt).
            // DIE RAUHEIT DER ZEILE IST IHR MITTEL (material.K5): Korn, Fläche und Kavität schwanken um die Basis, im Verhältnis zu
            // ihr (die Ausschläge von 0,85 wie bis dahin) — eine polierte Bronze (0,25) bleibt poliert, und die Kavität zählt um
            // ihr Mittel (0,851 = E[(1 − n²)^2,4] über gelaende-core `rauschRaum`, σ 0,266). Bis material.K5 trug sie Absolut-Werte
            // und zog jedes Fragment im Nah-Feld um 0,153 glatter, als der Stoff sagt. Die Basis ist ein Knoten (die Rauheit des
            // Stoffs, `materialRoughness`: r184 liest sie je Bild, eine Änderung der Zeile wirkt ohne neues Programm) oder eine Zahl.
            if (opts.roughBase != null) {
                let _rN = asNode(opts.roughBase, 0.7)
                    .mul(
                        mottle
                            .mul(fineFade)
                            .mul(f(0.3 / 0.85))
                            .add(broad.mul(f(0.14 / 0.85)))
                            .sub(
                                cavity
                                    .sub(f(0.851))
                                    .mul(fineFade)
                                    .mul(f(0.18 / 0.85))
                            )
                            .add(f(1.0))
                    )
                    .add(mossW.mul(f(0.22)));
                if (opts.wetDrive != null) _rN = _rN.sub(asNode(opts.wetDrive, 0).mul(f(0.4)));
                out.roughNode = _rN.clamp(0.05, 1.0);
            }
        } catch (_e) {
            throw this._stoffBruch("der Substanz-Charakter", _e);
        }
        return out;
    }

    // Per-Fragment Multi-Klassen-Geologie als EIN geteilter Auslesewert (Toon UND PBR identisch): STEILE
    // (rohe Geometrie-Normale) → Fels/Geröll bricht durch; FLACH + FEUCHT (dampEarth im Basis-Albedo) →
    // Moos. smoothstep-Konkurrenz, per-Fragment (kein Vertex-Trapez). Render-only; Fehler → der
    // unveränderte Albedo.
    _terrainGeologyAlbedo(_T, albedo, wp, roughOut, felsImVertex) {
        try {
            const G = AnazhRealm.TERRAIN_GEOLOGY;
            const au = this.state.atmoUniforms;
            const _ra = this._rauschAtlas();
            // STEILE ∈ [0,1] aus der ROHEN Geometrie-Normale (NICHT der geflatteten
            // Shading-Normale, die `normalWorld` im Farb-Knoten trägt) = die echte Hangneigung.
            const _steep = _T.float(1.0).sub(_T.normalWorldGeometry.y).clamp(0.0, 1.0);
            const _rockW = _T.smoothstep(_T.float(G.rockLo), _T.float(G.rockHi), _steep);
            // DER SCHUTT liegt, wo das Schicht-Gesetz den Schutthang legt — das Gewicht trägt der Vertex (`aSchutt`, `_felsStoff`
            // aus gelaende-core `hoehe(…, aus).schutt`), nie die Steile der Masche: bis zur Nachbesserung 2 lag er ab 28° auf
            // jedem Hang (der grüne Hügel grau, der 42°-Dorfhang zu 85 % Schutt), und das 28°–34°-Band streifte die 30°-Rampe in
            // den Reihen des Netzes. Die Ferne trägt das Mittel des Schutts in ihrer Farbe (`_fernSchutt`, dasselbe Gesetz).
            const _screeW = felsImVertex ? this._bodenStufenKnoten().schutt : _T.float(0);
            const _gRock = au && au.geoRock ? au.geoRock : _T.float(1.0);
            // DER FELS-STOFF (K17, gelaende-core `FELS`): wo das Netz den Fels trägt (der Chunk-Boden, `felsImVertex`),
            // IST die Vertex-Farbe der Fels — `_felsStoff` hat Pakete, Rinde, Mulden, Flechte und Moos aus dem Gesetz
            // aufgelegt und trägt die Mittel dessen, was die Masche nicht trägt (`felsMittelWerte`); die Ferne (Fern-Ring)
            // trägt das Mittel des Stoffs (`FELS_STOFF.mittel`). Der EINE Detail-Term legt das Feine nach DEMSELBEN Gesetz
            // (`felsLage`, `felsKanten`) relativ zu diesen Mitteln auf: die Bank im Paket (Mächtigkeit je Paket, Grenzen
            // gezogen und je Fuge gewellt — wo zwei Fugen sich kreuzen, keilt die Bank aus), die Fuge als KANTE (die Kehle
            // dunkel, die Oberkante hell, je Fuge ihre Weite, auf einem Teil der Länge ausgekeilt) und die Klüfte (schräg,
            // ihre Lage je Paket, an der Fuge nur ein Versatz). EINE Probe im Rausch-Atlas wellt die Schichten im Großen,
            // das Auge blendet aus, was der Pixel nicht trägt. Bis zur Nachbesserung lasen sich gleich hohe Bänke mit
            // geraden Strich-Fugen und je Bank neu ansetzenden Klüften als Ziegelmauer.
            const FS = AnazhRealm.FELS_STOFF;
            const FF = FS.gesetz.fein;
            const GK = globalThis.__gelaendeCore;
            // EIN Rechenwerk (K17, Nachbesserung 2): der Fein-Term IST das Gesetz (gelaende-core `felsFein`, `schuttKorn`) —
            // derselbe Code wie im Vertex, hier mit TSL-Knoten gerechnet (`_felsRechenwerkTSL`, dieselbe 32-Bit-Ziehung, die Welle
            // aus EINER Probe im Rausch-Atlas — der Vertex liest denselben Wert, gelaende-core `rauschRaum`). Er läuft nur, wo Fels oder Schutt liegt (ein Zweig: die Wiese zahlt ihn nicht), das Auge blendet aus, was
            // der Pixel nicht trägt: Bänke und Klüfte `fern` m, Kanten `fugeFern` m, das Schutt-Korn nach seinen Pixeln (die
            // Kante eines Steins unter 1,5 … 4 Pixeln — Schirm-Meter je Pixel aus Abstand, Projektion und Schirmhöhe).
            const _O = AnazhRealm._felsRechenwerkTSL(_T, _ra.raum);
            const _camD = wp.sub(_T.cameraPosition).length();
            const _nahB = _T.float(1).sub(_T.smoothstep(FF.fern[0], FF.fern[1], _camD));
            const _nahF = _T.float(1).sub(_T.smoothstep(FF.fugeFern[0], FF.fugeFern[1], _camD));
            const _pxM = _camD
                .mul(2)
                .div(_T.cameraProjectionMatrix.element(1).y.mul(_T.screenSize.y))
                .mul(this._ensureAtmoUniforms().schirmJeSzene);
            const _kornSicht = _T.smoothstep(1.5, 4, _T.float(FS.gesetz.geroell.korn).div(_pxM));
            const _gate = _rockW.add(_screeW).mul(_gRock);
            // DIE FELS-FUNKTION (K17-3): das Gesetz rechnet in EINER WGSL-Funktion (`felsFein`), ihre Wiederholungen als Schleifen
            // (gelaende-core `falte`: die neun Zellen des Schutts, die vier Bank-Grenzen) und die Ziehung als EINE Funktion
            // (`felsZufall`) — ausgeschrieben stand jede Ziehung 78-mal im Boden-Programm (96 050 → 149 521 Zeichen WGSL), und
            // swiftshader übersetzte sie vor dem ersten Bild. Die Welle liest der Graph (EINE Probe im Rausch-Atlas, `felsWelle`)
            // und reicht sie hinein; der Aufruf steht im Zweig (die Wiese zahlt ihn nicht).
            const _welle = GK.felsWelle(_O, wp.x, wp.y, wp.z);
            const _felsFn = _T
                .Fn(([x, y, z, w]) => {
                    const _f = GK.felsFein(_O, FS.basis, x, y, z, w);
                    return _T.vec3(_f.bank, _f.kante, GK.schuttKorn(_O, x, z));
                })
                .setLayout({
                    name: "felsFein",
                    type: "vec3",
                    inputs: [
                        { name: "x", type: "float" },
                        { name: "y", type: "float" },
                        { name: "z", type: "float" },
                        { name: "w", type: "float" },
                    ],
                });
            const _feinV = AnazhRealm._zweigTSL(_T)(_felsFn(wp.x, wp.y, wp.z, _welle), _gate);
            const _fein = _T.mix(_T.float(1), _feinV.x, _nahB).mul(_T.mix(_T.float(1), _feinV.y, _nahF));
            const _felsGrund = felsImVertex ? albedo : _T.vec3(FS.mittel[0], FS.mittel[1], FS.mittel[2]);
            const _rockCol = _felsGrund.mul(_fein);
            // Der Schutthang trägt sein Korn mit dem Gewicht des Schutts im Vertex (`aSchutt`, `_felsStoff`); der Fels dominiert.
            // Wo der Pixel den Stein nicht trägt, bleibt das Mittel des Gerölls (`schuttMittel`: es wirft Schatten in sich).
            // Die Steine liegen, wo das Gesetz Schutt sagt, ganz (`aSchutt` / `schutt`): die 15 % Boden im Ton des Vertex tragen
            // kein eigenes Korn — mit dem Gewicht des Tons (0,85) fehlte dem Hang ein Sechstel seiner Streuung.
            const _kornFern = _T.mix(_T.float(GK.schuttMittel()), _feinV.z, _kornSicht);
            const _kornW = _screeW.div(G.schutt).clamp(0, 1).mul(_gRock);
            let _out = albedo.mul(_T.mix(_T.float(1), _kornFern, _kornW));
            _out = _T.mix(_out, _rockCol, _rockW.mul(_gRock));
            // Moos + Ton/Korn/Kavität aus dem EINEN Substanz-Kern (wie Werke + Rinde); die Geologie-Basis
            // (Fels/Geröll) bleibt terrain-eigen. objectLocal:false (absolute Welt-Höhe). Feucht-/Grün-Treiber
            // × Flachheit speisen das Moos; `wp·0.16` = welt-kohärente Feature-Skala (naht-frei).
            const _flat = _T.float(1.0).sub(_steep);
            const _g2 = _out.y;
            const _rb2 = _out.x.add(_out.z).mul(0.5);
            const _lum2 = _out.x.mul(0.3).add(_out.y.mul(0.59)).add(_out.z.mul(0.11));
            const _green = _T.smoothstep(_T.float(0.0), _T.float(G.gruenSchwelle), _g2.sub(_rb2));
            const _damp = _T.float(1.0).sub(_T.smoothstep(_T.float(G.mossDampLo), _T.float(G.mossDampHi), _lum2));
            const _gMoss = au && au.geoMoss ? au.geoMoss : _T.float(1.0);
            const _mossDrive = _green.mul(_damp).mul(_gMoss).mul(_T.float(G.mossMax));
            // Feuchte-Glanz: eine nasse, KAHLE Niederung (damp hoch, nicht grün) glänzt (niedrigere Rauheit);
            // Moos bleibt matt. Aus DEMSELBEN Feld, das das Moos treibt.
            const _wetDrive = _damp.mul(_T.float(1.0).sub(_green)).clamp(0.0, 1.0);
            // (Die „trockenen braun-gelben Flecken" — Albedo × (1,32 · 1,12 · 0,6) auf jedem nicht-grünen, nicht-
            // feuchten Boden — sind gefallen: sie färbten die Laubstreu orange, Farben außerhalb der Palette.)
            // DER WIESEN-GRUND liegt im Gesetz (K53, `_bodenFarbeAt` · `attachFieldColors`, `WIESEN_GRUND`): der Vertex trägt das
            // Mittel des Halms schon — Chunk, Fern-Ring, Feld-Pass und Panorama lesen EINE Zahl. Bis K53 mischte ihn nur dieses
            // Fragment (Gewicht Grün × Flachheit × Fleck): Boden-Satz und Fern-Ring lagen +20 % über dem CPU-Gesetz, das der
            // Feld-Pass zeichnet (gate:nah-fern, Luft aus). Hier lebt nur noch die Farbe des Halms für das Relief der Nähe.
            const _mg = AnazhRealm.MEADOW_GREEN;
            const _sp = AnazhRealm.GRAS_SPITZE;
            const _wg = AnazhRealm.WIESEN_GRUND.farbe;
            const _wurzel = _T.vec3(_mg[0], _mg[1], _mg[2]);
            const _spitze = _T.vec3(_sp[0], _sp[1], _sp[2]);
            const _krone = _T.vec3(_wg[0], _wg[1], _wg[2]);
            // (Der Waldboden liegt unter den echten Kronen — `_wegeBodenFarbe` mischt die Laubstreu der Kronen-Karte;
            // der Fragment-Zwilling, der grüne feuchte Niederungen zum dunklen Wald-Kern-Ton zog, ist gefallen.)
            // Gras als Oberflächen-Funktion: keine Halm-Geometrie — die Wiese lebt als hochfrequente Blatt-
            // Schattierung des Bodens, NAH eingeblendet (fern trägt der Meadow-Grund). ≈0 Kosten (Noise + Mix),
            // DIESELBEN Gras-Farben wie das Nah-Gras.
            {
                // Die Wiese mit Tiefe: die Halme sind eine PARALLAX-FUNKTION — ein Halm-Noise-Höhenfeld, das der
                // Blick in 8 Schichten durchsticht (Relief-March): hohe Halme fangen den Strahl früh (helle Spitze),
                // Lücken lassen ihn zum dunklen Wurzelgrund. Das Höhenfeld wird per smoothstep an die ECHTE
                // mx_noise-Verteilung (eng um 0.5) gemappt — sonst kollabiert es auf 1-2 Schichten. Halm-Frequenz
                // 9/m (~11-cm-Büschel), Büschel-Maske 2.7/m; die Farben MEADOW_GREEN → GRAS_SPITZE.
                const _camD = wp.sub(_T.cameraPosition).length();
                const _nah = _T.float(1.0).sub(_camD.mul(_T.float(1.0 / 90.0)).clamp(0.0, 1.0)); // 1 am Fuß → 0 bei 90 m
                const _blick = wp.sub(_T.cameraPosition).normalize(); // Auge → Boden
                // Schräg-Projektion: flacher Blick wandert weit durch die Halm-Schicht
                // (starke Parallaxe), steiler Blick kaum — der 0.18-Boden hält die
                // Wanderung am Horizont endlich (dort blendet _nah ohnehin aus).
                const _steil = _blick.y.abs().max(0.18);
                const _halmHoch = _T.float(0.32); // m sichtbare Halm-Schicht
                const _wanderX = _blick.x.div(_steil).mul(_halmHoch);
                const _wanderZ = _blick.z.div(_steil).mul(_halmHoch);
                const _f = _T.float(9.0); // Halm-Frequenz (~11 cm — Armlängen-lesbar)
                // Büschel-Maske (2.7/m, in halber Wander-Tiefe abgetastet): Halme
                // wachsen in Büscheln, die Lücken dazwischen zeigen den Wurzelgrund —
                // die Wiese liest auch auf 10-30 m als Wiese, nicht als Rauschen.
                const _bX = wp.x.add(_wanderX.mul(_T.float(0.5)));
                const _bZ = wp.z.add(_wanderZ.mul(_T.float(0.5)));
                const _tuft = _T.smoothstep(
                    _T.float(0.3),
                    _T.float(0.62),
                    _ra
                        .ebene(_T.vec2(_bX.mul(_T.float(2.7)), _bZ.mul(_T.float(2.7))), 11, "y")
                        .mul(0.5)
                        .add(0.5)
                );
                // Die acht Schichten stehen ausgeschrieben im Programm (der Knoten-Graph sieht jede Ladung, RAUSCH-GESETZ (B)),
                // ihre Mischung rechnet die EINE reine Funktion des Atlas (`rauschEbene`, K17-3 Runde 2) — je Schicht nur die
                // Lage und zwei Ladungen. Eine Schleife hiesse ein Fn-Rumpf: als Layout-Funktion las er die Bindung des Atlas
                // (r184 baut sie EINMAL je Builder-Klasse, jedes weitere Programm erbte den Namen der Textur — die Prüf-Welt sagte
                // die Pipeline ab), ohne Layout blieb er dem Graph verborgen.
                let _traf = _T.float(0.0); // 0 = noch kein Halm getroffen (branchenlos)
                let _trefH = _T.float(0.0); // Halm-Höhe des Treffers (0 = Wurzelgrund)
                for (let _s = 0; _s < 8; _s++) {
                    const _li = 1.0 - _s / 8.0; // Schicht von oben (1.0) nach unten (0.125)
                    const _px = wp.x.add(_wanderX.mul(_T.float(_s / 8.0)));
                    const _pz = wp.z.add(_wanderZ.mul(_T.float(_s / 8.0)));
                    const _hN = _ra
                        .ebene(_T.vec2(_px.mul(_f), _pz.mul(_f)), 11, "y")
                        .mul(0.5)
                        .add(0.5);
                    // Remap an die echte Noise-Verteilung: unter 0.36 = Lücke (0), über
                    // 0.64 = volle Halm-Höhe (1) — so TRAGEN alle 8 Schichten.
                    const _h = _T.smoothstep(_T.float(0.36), _T.float(0.64), _hN).mul(_tuft);
                    const _erst = _T.step(_T.float(_li), _h).mul(_T.float(1.0).sub(_traf));
                    // Die Treffer-Höhe ist die HALM-Höhe (stetig), nie die Schicht: acht Schicht-Stufen lasen sich
                    // auf Armlänge als Höhenlinien (Linse 05.10.).
                    _trefH = _trefH.add(_erst.mul(_h));
                    _traf = _traf.add(_erst);
                }
                // Der getroffene Halm trägt die Farbe SEINER Höhe — derselbe Verlauf Wurzel → Spitze wie das Nah-Gras —,
                // tiefer liegende Treffer im Eigen-Schatten der Büschel (0,65 … 1); die Lücke zeigt den Wurzelgrund im
                // Schatten (0,5 × Wurzel). Bis 05.10. war der Halm die Wurzelfarbe × 0,35 … 1,30: ein Oliv-Tarnmuster
                // unter grellen Nah-Halmen.
                // Wo die Nah-Wiese steht (Radius NAH_WIESE.radius), tragen IHRE Halme das Gras; der Boden darunter ist
                // ihr ruhigerer Wurzelgrund (das Relief zu 40 % über dem Halm-Mittel im Schatten, × 0,7) — das volle
                // Relief erst zu ihrem Rand hin (die acht Schichten lasen sich auf Armlänge als Höhenlinien, Linse 05.10.).
                // w4-wiese-nah legte hier den Grund UNTER die Narbe (flach der Fuß-Ton, Sonne und Himmel × `halmNarbe`) im ganzen
                // Band der Nah-Wiese um das Auge, auch wo sie keinen Büschel zeichnet: am Feuer der Prüfbühne stand kein Halm,
                // und der Boden ohne Feuer fiel nachts auf Luma 6,1 (Soll ≥ 22), das Feuer auf ihm auf 25,4° (Soll 28–45°,
                // gate:pruefbuehne-licht S0, Radeon) — heil-w4-wiese-nah: der Grund folgt dem Band, nie dem Bestand, darum fiel er.
                const _nwR = AnazhRealm.NAH_WIESE.radius;
                const _relief = _T
                    .smoothstep(_T.float(_nwR * 0.5), _T.float(_nwR), _camD)
                    .mul(0.6)
                    .add(0.4);
                const _halmCol = _T.mix(
                    _krone.mul(_T.float(0.7)),
                    _T.mix(
                        _wurzel.mul(_T.float(0.5)),
                        _T.mix(_wurzel, _spitze, _trefH).mul(_T.float(0.65).add(_trefH.mul(_T.float(0.35)))),
                        _traf
                    ),
                    _relief
                );
                const _halmW = _green
                    .mul(_flat.mul(_T.float(1.0).sub(_rockW)))
                    .mul(_nah)
                    // Wo die Gewichte Wiese sagen, BESITZT das Gras den Pixel (0.95) — ein niedrigerer Deckel gibt
                    // Büschel-Fleckung; der Kontrast kommt aus _halmCol (Lücke ↔ Spitze), nie aus der Verdünnung.
                    .mul(_T.float(0.95))
                    .clamp(0.0, 1.0);
                _out = _T.mix(_out, _halmCol, _halmW);
            }
            // Die Geologie treibt die Bruch-Struktur: wo Fels/Geröll durchbricht (`rockW`+`screeW`), bricht der
            // Boden karstig (hardDrive); die flache Wiese bleibt weich (Basis-härte 0.36). Kein neuer Noise.
            const _hardDrive = _rockW.add(_screeW).clamp(0.0, 1.0);
            const _r = this._substanceCharacter(_T, _out, {
                pos: wp.mul(_T.float(0.16)),
                worldPos: wp,
                tags: { härte: 0.36, dichte: 0.5 },
                metal: 0,
                objectLocal: false,
                flatness: _flat.mul(_T.float(1.0).sub(_rockW)),
                mossDrive: _mossDrive,
                roughBase: G.roughBase,
                wetDrive: _wetDrive,
                hardDrive: _hardDrive,
            });
            if (roughOut && _r.roughNode) roughOut.node = _r.roughNode;
            return _r.albedo;
        } catch (_e) {
            throw this._stoffBruch("die Boden-Geologie", _e);
        }
    }

    // Die EINE LOD-Uniform-Quelle, die JEDES Laub-Karten-Material liest: `uLodRef` (pro Frame aus
    // `state.lodRef` — dieselbe Zahl wie die CPU-`_lodPerceptionDistance`, live ohne Rebuild),
    // `uLodMaskOn` (0 → harte Kanten, A/B) und `uDitherT` (golden-ratio-Rotation pro Frame → zeitliche
    // Dither-Streuung). Lazy wie `windUniforms`; ohne TSL → null. `state.lodUniforms` gehört in die
    // audit:strict-Whitelist.
    _ensureLodUniforms() {
        const st = this.state;
        if (st.lodUniforms) return st.lodUniforms;
        const _T = THREE.TSL;
        const _ref = Number.isFinite(st.lodRef) && st.lodRef > 0 ? +st.lodRef : 14;
        // Crossfade-Band-Zahlen als LIVE-Uniforms, geseedet aus der EINEN Quelle `AnazhRealm.LOD_DISTANCES`
        // und pro Frame in `_loopRender` gespiegelt → ein Studio-Live-Ingest (`_foundryIngestRenderConfig`)
        // greift sofort in der Shader-Maske (kein eingefrorener Zweit-Satz).
        const _D = AnazhRealm.LOD_DISTANCES;
        this._stufenSchirm(); // die Schwellen aus dem Gesetz des Schirms, bevor die Masken sie säen
        const u = {
            uLodRef: _T.uniform(_ref),
            uLodMaskOn: _T.uniform(st.lodMaskOn === false ? 0 : 1),
            uDitherT: _T.uniform(0),
            // DER VERSATZ DES LAUBS (A3, `_laubVersatz`): xy die Phase der Deckungs-Probe dieses Frames — die Halton-Achsen 5
            // und 7 am Frame der Geschichte (`_zeitAufloesung`), je Pixel gedreht —, z die Weite in Eingangs-Pixeln
            // (LAUB_VERSATZ), ohne zeitliche Auflösung 0
            uLaubVersatz: _T.uniform(new THREE.Vector3(0, 0, 0)),
            uLodD0: _T.uniform(_D.thresh01),
            uLodD1: _T.uniform(_D.thresh12),
            uLodFade: _T.uniform(_D.fade),
            uLodFade0: _T.uniform(_D.fade0),
            // DAS AUGE: die Welt-Position der Haupt-Kamera, je Frame gespiegelt. Jede LOD-Maske misst von
            // HIER, nie von `cameraPosition` — die ist im Schattenpass die Kaskaden-Kamera (r184:
            // `renderer.render(scene, shadow.camera)`; bis V18.529 stand sie 200 m über der Box, heute über
            // dem höchsten Werfer): dort lagen nahe Bäume 145 m „weit", jenseits jeder Stufe, und die Maske
            // verwarf ihre Schatten-Fragmente alle.
            uLodAuge: _T.uniform(new THREE.Vector3()),
            // DAS ZIEL DER DURCHSICHT (xyz) und ihr Radius (w), dazu das Auge, für das es gilt (`uKamAuge`: die
            // Stellung der Spieler-Kamera, nie die Kamera einer Sonde): `_kamZielSetzen` aus `_loopCamera`,
            // gelesen von `_kameraDurchsichtNode` (der Sicht-Strahl vom Auge zum Ziel).
            uKamZiel: _T.uniform(new THREE.Vector4(0, 0, 0, 0)),
            uKamAuge: _T.uniform(new THREE.Vector3()),
            // DIE NAH-KUGEL der Durchsicht um das Auge (Leben-Schau 2, 09.10.): ihr Radius je Stoff-Art — x Laub,
            // y Rinde, z Boden (die wiegende Nah-Streu) — `_kamZielSetzen`; −Saum heißt: nichts fällt.
            uKamNah: _T.uniform(
                new THREE.Vector3(
                    -AnazhRealm.KAMERA_DURCHSICHT.saumM,
                    -AnazhRealm.KAMERA_DURCHSICHT.saumM,
                    -AnazhRealm.KAMERA_DURCHSICHT.saumM
                )
            ),
        };
        // UNIFORM-HEIMAT: der geteilte LOD-Satz reist als EIN renderGroup-Buffer.
        this._uniformHeimatTeilen(u);
        st.lodUniforms = u;
        return u;
    }

    // DAS AUGE DER STUFEN (K36): EIN Ort, von dem jede Stufen-Frage misst — die Welt-Position der Haupt-Kamera. Die Maske
    // liest ihn je Frame (`uLodAuge`), die Stufen-Wahl, ihr Band, die Verdeckung und der Kalt-Schätzer je Takt; bis K36 maß
    // die CPU vom Spieler: in der Verfolger-Kamera (Arm 9,6 m) wählte sie für Tore und Bäume die Partner der Spieler-Distanz,
    // die Maske blendete nach der Auge-Distanz — am Genesis-Ring standen 9 Tore und Ruinen halb durchsichtig im Bild.
    // Das Auge ist die Kamera, wo zuletzt jemand sie SETZTE — das Rig je Bild (`_lodAugeGesetzt` am Ende von `_loopCamera`),
    // eine Sonde für ihren Schuss (jede Bewegung der Kamera seit der letzten Lesung ist eine Setzung) —, und es REIST MIT
    // DEM SPIELER, bis sie neu gesetzt wird: der Welt-Takt läuft vor dem Rig, ein Sprung (Ankunft, Tor, Rettung, ein Gate
    // ohne Spiel-Takt) trüge die Wahl sonst vom alten Ort. Vor der ersten Setzung steht es, wo das Ego-Rig es setzt: im
    // Kopf des Spielers (der kopflose Boot hält die Kamera im Ursprung, 36 m neben ihm — das Tor kam ohne L0 und ohne
    // Flügel). null = weder Kamera noch Spieler.
    _lodAuge() {
        const pm = this.state.playerMesh && this.state.playerMesh.position;
        const cam = this.state.camera;
        const out = this._lodAugeV || (this._lodAugeV = new THREE.Vector3());
        const r = this._lodAugeR || (this._lodAugeR = { cam: new THREE.Vector3(), pl: new THREE.Vector3(), stand: 0 });
        if (!cam) return pm ? out.set(pm.x, pm.y + AnazhRealm.EGO_AUGE_M, pm.z) : null;
        const c = cam.getWorldPosition(this._lodAugeC || (this._lodAugeC = new THREE.Vector3()));
        if (r.stand === 0) {
            r.cam.copy(c); // die Kamera, wie sie geboren wurde: ungesetzt
            r.stand = 1;
        } else if (c.distanceToSquared(r.cam) > 1e-10) this._lodAugeGesetzt(c);
        if (r.stand === 1) return pm ? out.set(pm.x, pm.y + AnazhRealm.EGO_AUGE_M, pm.z) : out.copy(c);
        out.copy(c);
        if (pm) out.add(pm).sub(r.pl); // der Sprung des Spielers seit der Setzung
        return out;
    }

    // DER URSPRUNG DER INSTANZ — das Maß der Blende (Studio foundry-core `_iw = instanceMatrix[3].xz`, `_cd =
    // length(cameraPosition.xz − _iw)`): die Welt-XZ der Achse der gezeichneten Instanz, im Vertex-Takt aus der EINEN Naht
    // (`_weltNaht`: Objekt × Instanz-Matrix; ohne Instanzen der Ursprung des Objekts, eine InstancedMesh ohne Matrix bricht
    // laut). Die Blende misst je INSTANZ, wie die CPU ihre Stufen legt (`_lodPerceptionDistance` am Eintrag): je Fragment
    // gemessen löste sich die ferne Krone eines nahen Baums auf, und die Stufen-Wahl musste dafür die zweite Stufe
    // zeichnen (1110-11: die Birke in 5 m stand doppelt, 0,6–2,7 ms GPU an der Mess-Wiese).
    _instanzMitteNode(T) {
        if (this._instanzMitteKnoten) return this._instanzMitteKnoten;
        if (!T.varying) {
            const text = "URSPRUNG DER INSTANZ: r184 varying fehlt (Vendor-Drift)";
            this.log(text, "ERROR");
            throw new Error(text);
        }
        this._instanzMitteKnoten = T.varying(this._weltNaht(T).anker.xz, "vInstanzMitte");
        return this._instanzMitteKnoten;
    }

    // DIE WELT IM POSITIONS-KNOTEN (K20-N1) — die EINE Naht zwischen Vorlage und Welt für jeden Stoff, der im positionNode
    // die Welt braucht (der Wind von Gras, Streu, Rinde, Laub und Karte, die Karte, die das Auge ansieht, die Blende): r184
    // rechnet den positionNode VOR der Instanz-Matrix (WGSL der Karte und der Nah-Wiesen-Senke gelesen: erst
    // `positionLocal = …positionNode…`, dann `positionLocal = instanzMatrix × positionLocal`), dort lesen positionLocal,
    // normalLocal und positionWorld den VORLAGEN-Raum. Jede InstancedMesh entsteht in `_instanzMesh`, also gilt das für
    // jeden Stoff einer Instanz. Die Naht trägt Mw = Objekt × Instanz-Matrix: `lage` die Welt-Lage des Vertex, `anker` die
    // des Instanz-Ursprungs, `skala` die Instanz-Skala, `spalte(i)` die Achsen, `richtung(n)` eine Vorlagen-Richtung in
    // der Welt und `vorlage(w)` einen Welt-Versatz (Meter, Welt-Richtung) zurück in die Vorlage (Spalten c_i ⟂: c_i·w / |c_i|²)
    // — sonst drehte und skalierte die Matrix ihn mit jeder Instanz (der Wind wehte in der Drehung seines Baums,
    // gate:foundry-impostor C4). Die Wurzel der Reihenfolge im Vendor (three.webgpu.min.js): `setupPosition` legt die
    // Zuweisung des positionNode auf den Stapel; Instanz-, Batch- und Skin-Knoten hängen ihr `positionLocal.assign(M × …)`
    // erst in ihrem setup an den aktiven Stapel, und `StackNode.build` baut nachgereichte Knoten NACH den ersten — das gilt
    // für jede InstancedMesh, die Foundry-Senken eingeschlossen. EIN Satz Knoten (1310-18): r184 schlüsselt ein Programm
    // nach der Identität seiner Knoten — die Naht entsteht EINMAL, `richtung` und `vorlage` merken sich ihren Knoten je
    // Eingang, sonst trüge jeder Leser, der seinen Graphen teilt (der Wind je Art), doch frische Knoten.
    _weltNaht(T) {
        if (this._weltNahtKnoten) return this._weltNahtKnoten;
        const Mw = T.modelWorldMatrix.mul(this._instanzMatrixNode(T));
        const c0 = Mw.element(0).xyz;
        const c1 = Mw.element(1).xyz;
        const c2 = Mw.element(2).xyz;
        const jeRichtung = new WeakMap();
        const jeVorlage = new WeakMap();
        const merk = (karte, n, bau) => {
            if (!karte.has(n)) karte.set(n, bau(n));
            return karte.get(n);
        };
        this._weltNahtKnoten = {
            anker: Mw.element(3).xyz,
            lage: Mw.mul(T.vec4(T.positionLocal, 1.0)).xyz,
            skala: c0.length(),
            spalte: (i) => (i === 0 ? c0 : i === 1 ? c1 : c2),
            richtung: (n) => merk(jeRichtung, n, (r) => T.normalize(Mw.mul(T.vec4(r, 0.0)).xyz)),
            vorlage: (w) =>
                merk(jeVorlage, w, (v) =>
                    T.vec3(
                        c0.dot(v).div(c0.dot(c0).max(1e-12)),
                        c1.dot(v).div(c1.dot(c1).max(1e-12)),
                        c2.dot(v).div(c2.dot(c2).max(1e-12))
                    )
                ),
        };
        return this._weltNahtKnoten;
    }

    // DIE INSTANZ-MATRIX IM POSITIONS-KNOTEN (K20): die Matrix der gezeichneten Instanz (der Haken an
    // `_createInstanceMatrixNode` legt sie je Bau am Builder ab), ohne Instanzen die Einheit — der EINE Leser des Hakens,
    // gelesen über die Naht `_weltNaht`. Fehlt sie an einer InstancedMesh, bricht der Bau LAUT — nie ein Stoff, der still
    // in der Drehung seiner Instanz steht.
    _instanzMatrixNode(T) {
        if (this._instanzMatrixKnoten) return this._instanzMatrixKnoten;
        const N = THREE.InstanceNode ? Object.getPrototypeOf(THREE.InstanceNode) : null;
        if (!N || N.type !== "Node" || !T.mat4) {
            const text = "INSTANZ-MATRIX: r184 Node (über InstanceNode) · mat4 fehlen (Vendor-Drift)";
            this.log(text, "ERROR");
            throw new Error(text);
        }
        const realm = this;
        class InstanzMatrix extends N {
            constructor() {
                super("mat4");
            }
            setup(builder) {
                const m = builder.__anazhInstanzMatrix;
                if (m) return m;
                // eine Senke zeichnet über ihren Zeichner (1410-1): auch er trägt Instanzen und bricht ohne Matrix laut
                if (builder.object && (builder.object.isInstancedMesh || builder.object.isInstanzZeichner === true)) {
                    const text =
                        "INSTANZ-MATRIX: der Bau einer InstancedMesh fragt vor ihrer Instanz-Matrix (r184-Reihenfolge)";
                    realm.log(text, "ERROR");
                    throw new Error(text);
                }
                return T.mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
            }
        }
        this._instanzMatrixKnoten = new InstanzMatrix();
        return this._instanzMatrixKnoten;
    }

    // DER BRUCH DER BLENDE (1110-11 Nachtrag): fehlt der Blende ein Glied (ein Uniform des LOD-Satzes, ein TSL-Knoten, die
    // Distanz der Karte, der Kanal des Stoffs), bricht der Bau des Stoffs LAUT beim Namen. Bis hierher gab die Blende still
    // null zurück (ihr catch legte den Fehler in eine Fenster-Variable, die niemand las), und jeder Aufrufer zeichnete weiter:
    // der Baum-Stoff ohne Maske (L0 und Band-L1 deckungsgleich voll, die Instanz-Wahl ohne Fenster), die Karte ohne
    // Ausblendung, die Blatt-Karte ohne Stufen-Blende — gate:foundry-crossfade (9) DIE LAUTE BLENDE.
    _blendeBruch(was) {
        const e = this._stoffBruch("BLENDE: " + was + " — kein Stoff zeichnet ohne seine Maske");
        e.blende = true;
        return e;
    }

    // DER BRUCH DES STOFFS (K22): fehlt einem Stoff oder dem Render-Graphen ein Glied — ein Uniform-Satz, ein Knoten, eine
    // Karte, ein Bau-Schritt wirft —, bricht der Bau LAUT beim Namen: ERROR ins Log, ein Fehler mit der Marke `stoff`. Bis
    // hierher fingen 95 Stellen den Fehler still (ein catch ohne Wurf, eine Fenster-Variable ohne Leser, ein Wenn um ein
    // TSL-Glied, ein Knoten-Bauer, der null gab), und der Stoff zeichnete byte-alt ohne sein Glied weiter — gate:altlasten
    // DIE STOFF-WAND. `ursache`: ein fremder Fehler wird einmal mit dem Ort eingewickelt, ein Bruch reist unverändert weiter.
    _stoffBruch(was, ursache) {
        if (ursache && ursache.stoff === true) return ursache;
        const text = "STOFF: " + was + (ursache ? " — " + ((ursache && ursache.message) || ursache) : "");
        this._bruchMelden(text);
        const e = new Error(text);
        e.stoff = true;
        return e;
    }

    // DAS RAUSCHEN DER BLENDE: Interleaved-Gradient-Noise, BYTE-GENAU __phytoCore.lodDitherIGN (52.9829189 · 0.06711056 ·
    // 0.00583715; foundry-core.js Z.212), zeitlich über uDitherT — EIN Knoten-Bauer für die Durchsicht, das Laub-Band und den
    // Ring der Karte (lod.K3). `versatz` n schiebt das Raster um n · 5,588 px (die Ring-Wahl, unkorreliert mit der Blende).
    _ditherIGN(T, versatz) {
        const fc = versatz ? T.screenCoordinate.add(T.vec2(versatz * 5.588238)) : T.screenCoordinate;
        return T.fract(
            T.float(52.9829189)
                .mul(T.fract(fc.x.mul(0.06711056).add(fc.y.mul(0.00583715))))
                .add(this._ensureLodUniforms().uDitherT)
        );
    }

    // Studio-Dither-Blende als TSL-Knoten = `__phytoCore.lodCrossfadeMask` symbolisch — jede Formel MUSS
    // ihr entsprechen (Linse `gate:foundry-crossfade`); Zahlen aus uLodD0/uLodD1/uLodFade/uLodFade0 +
    // `_ensureLodUniforms`. opts.impostor → fin-Einblendung (lod=2) aus opts.distNode × Wahrnehmungs-k;
    // sonst 3D-Stufen über aLodLevel (1 = L0 · 2 = L1 · 0 = ungemaskt) + aH0/aH0L; opts.foliage = Laub
    // vs. Rinde. Rückgabe: keep-Knoten (1 = behalten → der Aufrufer faltet ihn in die Alpha) oder null.
    _lodCrossfadeMaskNode(T, opts) {
        try {
            const _lu = this._ensureLodUniforms();
            if (!T || !_lu)
                throw this._blendeBruch(!T ? "TSL fehlt" : "der LOD-Uniform-Satz fehlt (_ensureLodUniforms)");
            const _fehlt = ["uLodRef", "uLodMaskOn", "uDitherT", "uLodD0", "uLodD1", "uLodFade", "uLodFade0"]
                .filter((k) => !_lu[k])
                .concat(
                    ["float", "fract", "screenCoordinate", "step", "mix"].filter((k) => !T[k]).map((k) => "TSL." + k)
                );
            if (_fehlt.length) throw this._blendeBruch("es fehlt " + _fehlt.join(" · "));
            // W5.4 (Schritt 3) — die Band-Zahlen als LIVE-Uniforms (Quelle LOD_DISTANCES via
            // `_ensureLodUniforms`-Seed + `_loopRender`-Spiegel): Rampen-Kanten als Knoten-Mathe.
            const _edge1 = _lu.uLodD1.sub(_lu.uLodFade); // D1 − FADE
            const _edge0 = _lu.uLodD0.sub(_lu.uLodFade0); // D0 − FADE0
            const _fadeW = _lu.uLodFade.max(T.float(1e-3));
            const _fadeW0 = _lu.uLodFade0.max(T.float(1e-3));
            // _dh — Interleaved-Gradient-Noise, BYTE-GENAU __phytoCore.lodDitherIGN
            // (52.9829189 · 0.06711056 · 0.00583715; foundry-core.js Z.212).
            const _fc = T.screenCoordinate;
            const _dh = T.fract(
                T.float(52.9829189)
                    .mul(T.fract(_fc.x.mul(0.06711056).add(_fc.y.mul(0.00583715))))
                    .add(_lu.uDitherT)
            );
            if (opts && opts.impostor === true) {
                // __phytoCore.lodCrossfadeMask lod=2: keep = max(min(2·f1,1), vOcc) ≥ dh — die Verdeckung reist als
                // Instanz-Attribut (verdeckt-demotierte Bäume blenden VOLL; Default 0 = altes Verhalten).
                const _dist = opts.distNode;
                if (!_dist) throw this._blendeBruch("die Karte reicht keine Distanz (opts.distNode)");
                let _vCD = _dist; // dieselbe Distanz wie die CPU (`_lodPerceptionDistance`)
                if (opts.visHeightNode) {
                    // × min(uLodRef/Sichthöhe, 1) AUF die gestreckte Distanz — bis 04.10. ersetzte dieser Zweig sie
                    // durch die rohe: unter Last (Perf ×1,3) blendete die L1 nach der gestreckten Distanz aus, das
                    // Billboard ohne Streck ein, bei 20 m stand der Baum zu 50 % durchsichtig.
                    const _k = _lu.uLodRef.div(opts.visHeightNode.max(T.float(1e-3))).min(T.float(1.0));
                    _vCD = _vCD.mul(_k);
                }
                const _f1i = _vCD.sub(_edge1).div(_fadeW).clamp(0.0, 1.0);
                const _occl = opts.occlNode || null; // die Verdeckung der Karte (aKarte.w < 0)
                const _fin = _f1i.mul(2.0).min(T.float(1.0));
                const _keepFin = T.step(_dh, _occl ? _fin.max(_occl) : _fin);
                return T.mix(T.float(1.0), _keepFin, _lu.uLodMaskOn);
            }
            // 3D-Stufen (Stufe L0/L1) — die Stempel-Attribute + die SSE-Distanzen, gemessen vom AUGE (`uLodAuge`):
            // so maskiert der Schattenpass jede Stufe, wie das Auge sie sieht — jede Stufe wirft genau dort, wo sie
            // gezeichnet wird.
            const _auge = _lu.uLodAuge;
            if (!T.attribute || !_auge || !T.length || !T.vec2)
                throw this._blendeBruch("die 3D-Stufen-Maske: TSL.attribute · uLodAuge · TSL.length · TSL.vec2 fehlen");
            const _aLod = T.attribute("aLodLevel", "float");
            const _aH0 = T.attribute("aH0", "float");
            const _aH0L = T.attribute("aH0L", "float");
            // dieselbe Wahrnehmungs-Distanz, nach der die CPU die Stufen legt (`_lodPerceptionDistance`) — vom Auge zum
            // URSPRUNG der Instanz (`_instanzMitteNode`), wie das Studio und die CPU, nie zum Fragment.
            const _mitte = this._instanzMitteNode(T);
            const _cd = T.length(T.vec2(_auge.x.sub(_mitte.x), _auge.z.sub(_mitte.y)));
            const _lk = _lu.uLodRef.div(_aH0.max(T.float(1e-3))).min(T.float(1.0));
            // |aH0L|: das Vorzeichen trägt den HALT (`_lodSlotStamp`), der Betrag die Blatt-Sichthöhe
            const _lkL = _lu.uLodRef.div(_aH0L.abs().max(T.float(1e-3))).min(T.float(1.0));
            const _dS = _cd.mul(_lk); // vLodD (Skelett-Metrik)
            const _dL = _cd.mul(_lkL); // vLodDL (Blatt-Metrik)
            // __phytoCore.lodCrossfadeMask: f1/f0/f1o — dieselben Rampen, symbolisch.
            const _f1 = _dS.sub(_edge1).div(_fadeW).clamp(0.0, 1.0);
            const _f0 = _dL.sub(_edge0).div(_fadeW0).clamp(0.0, 1.0);
            const _f1o = _f1.mul(2.0).sub(1.0).clamp(0.0, 1.0);
            const _foliage = !!(opts && opts.foliage);
            // keep Stufe L0 (lod=0): Laub keep = clamp(2f0−1) < dh · Rinde keep = f0 < dh.
            const _keep0 = _foliage ? T.step(_f0.mul(2.0).sub(1.0).clamp(0.0, 1.0), _dh) : T.step(_f0, _dh);
            // keep Stufe L1 (lod=1): (Laub min(2f0,1) ≥ dh · Rinde f0 ≥ dh) UND f1o < dh. Die einzige Nah-Stufe einer
            // Art ohne L0 (aLodLevel 3) blendet nie ein, nur zum Billboard aus: keep = f1o < dh.
            const _fadeIn = _foliage ? T.step(_dh, _f0.mul(2.0).min(T.float(1.0))) : T.step(_dh, _f0);
            const _keep1 = _fadeIn.max(T.step(T.float(2.5), _aLod)).mul(T.step(_f1o, _dh));
            // Stufen-Wahl per aLodLevel (1 → keep0 · 2 → keep1) + das vLod>0.5-Gate (0 → ungemaskt).
            // DER HALT (K36): aH0L < 0 — die Stufe steht ohne ihren Partner und weicht keinem Nichts, sie zeichnet voll.
            const _halt = T.float(1.0).sub(T.step(T.float(0.0), _aH0L));
            const _stageKeep = T.mix(_keep0, _keep1, T.step(T.float(1.5), _aLod)).max(_halt);
            const _masked = T.step(T.float(0.5), _aLod);
            const _keep = T.mix(T.float(1.0), _stageKeep, _masked);
            return T.mix(T.float(1.0), _keep, _lu.uLodMaskOn);
        } catch (_e) {
            throw _e && _e.blende === true
                ? _e
                : this._blendeBruch("der Bau der Maske scheiterte: " + ((_e && _e.message) || _e));
        }
    }

    // DIE DURCHSICHT DER KAMERA (Leben-Schau 07.10. L-Kamera, Gegenprüfung Runde 1): eine Pflanze zwischen Auge und Spieler
    // ist durchsichtig, statt die Kamera zu halten — der Profi-Weg für Laub (kein Wald ist für eine Kamera mit 9,6 m Arm frei:
    // die Kronen-Hülle hielt die Verfolger-Kamera am Wagendach). Was zwischen Auge (`uKamAuge`) und Ziel (`uKamZiel.xyz`,
    // `_kamZielSetzen`) näher als der Radius `uKamZiel.w` am Sicht-Strahl liegt, fällt, und ebenso, was in der NAH-KUGEL um
    // das Auge liegt (Radius `uKamNah` je Stoff-Art: x Laub, y Rinde, z Boden — Leben-Schau 2, 09.10.: das Rohr um den
    // Sicht-Strahl ließ die Krone um die Linse stehen) — die EINE Formel `_durchsichtGewicht`; über den Saum
    // KAMERA_DURCHSICHT.saumM dithert es aus — dasselbe Interleaved-Gradient-Rauschen wie die Stufen-Blende
    // (`__phytoCore.lodDitherIGN`, rotiert mit uDitherT: das zeitliche Mittel der Auflösung ist die weiche Kante). `art` ∈
    // "laub" · "rinde" · "boden" (die wiegende Nah-Streu: Blume, Farn, Gestrüpp, Schilf): je Art EIN Knoten
    // (`_kamDurchKnoten`, die Linse erkennt ihn). Rückgabe: der bool-Knoten für `maskNode` (true = behalten) — der
    // Schatten-Pass liest ihn nie (der Aufrufer setzt `maskShadowNode`): der Baum wirft seinen ganzen Schatten.
    _kameraDurchsichtNode(T, art) {
        const knoten = this._kamDurchKnoten || (this._kamDurchKnoten = {});
        const a = art === "rinde" || art === "boden" ? art : "laub";
        if (knoten[a]) return knoten[a];
        const lu = this._ensureLodUniforms();
        const A = {
            k: (n) => T.float(n),
            sub: (a, b) => a.sub(b),
            mul: (a, b) => a.mul(b),
            div: (a, b) => a.div(b),
            dot: (a, b) => T.dot(a, b),
            len: (a) => T.length(a),
            max: (a, b) => a.max(b),
            min: (a, b) => a.min(b),
            clamp01: (a) => a.clamp(0.0, 1.0),
        };
        const n = a === "rinde" ? lu.uKamNah.y : a === "boden" ? lu.uKamNah.z : lu.uKamNah.x;
        const w = AnazhRealm._durchsichtGewicht(A, T.positionWorld, lu.uKamAuge, lu.uKamZiel.xyz, lu.uKamZiel.w, n);
        knoten[a] = w.greaterThan(this._ditherIGN(T, 0));
        return knoten[a];
    }

    // DIE EINE FORMEL DER DURCHSICHT (Gegenprüfung Runde 2): das Gewicht w ∈ [0, 1], mit dem ein Punkt p steht (0 fällt
    // ganz, 1 steht; der Stoff vergleicht es mit dem Rauschen) — Auge E, Ziel Z, Radius r, Nah-Radius n. DURCHSICHTIG IST,
    // WAS ZWISCHEN AUGE UND ZIEL LIEGT: näher als r am Sicht-Strahl (QUER, über den Saum KAMERA_DURCHSICHT.saumM
    // ausgeblendet) UND vor der Ebene des Ziels (VOR, über denselben Saum vor ihr ausgeblendet) — der Strahl des Fadenkreuzes
    // beginnt auf dieser Ebene (`_fadenkreuzStrahl`), was er trifft, steht. Die Kugel um das Ziel fiel: sie schnitt im 1st
    // (das Ziel ist das Auge) die Rinde bis 1,1 m vom Auge (7 von 8 Anläufen an einen Stamm, das Auge 0,01–1,24 m von ihm:
    // ein Loch im Baum, an dem man steht) und in 3rd den Stamm VOR dem Spieler um die Brust. Im 1st ist die Strecke leer.
    // UND DURCHSICHTIG IST, WAS IN DER NAH-KUGEL UM DAS AUGE LIEGT (NAH: näher als n am Auge, über denselben Saum
    // ausgeblendet; Leben-Schau 2, 09.10.: das Rohr allein ließ die Krone um die Linse stehen — die Kamera in der Eichenkrone
    // am Ufer, im Ich-Auge ein Strauch vor dem Gesicht). Der Schreiber (`_kamZielSetzen`) hält die Kugel in 3rd vor der Ebene
    // des Ziels, n = −Saum heißt: nichts fällt. Sie rechnet über einer Algebra A: TSL-Knoten im Stoff
    // (`_kameraDurchsichtNode`), Zahlen in den Linsen (`DURCHSICHT_ZAHLEN`, gate:ankunft LK, gate:kamera-laub) — EINE Formel.
    static _durchsichtGewicht(A, p, E, Z, r, n) {
        const S = A.k(AnazhRealm.KAMERA_DURCHSICHT.saumM);
        const ez = A.sub(Z, E);
        const pe = A.sub(p, E);
        const L = A.len(ez);
        const Lm = A.max(L, A.k(1e-4));
        const s = A.div(A.dot(pe, ez), Lm); // Meter längs des Sicht-Strahls ab dem Auge
        const t = A.clamp01(A.div(s, Lm));
        const quer = A.clamp01(A.div(A.sub(A.len(A.sub(pe, A.mul(ez, t))), r), S));
        const vor = A.clamp01(A.sub(A.k(1), A.div(A.sub(L, s), S)));
        const nah = A.clamp01(A.div(A.sub(A.len(pe), n), S));
        return A.min(A.max(quer, vor), nah);
    }

    // STEHT DER TREFFER IM BILD? (ein Raycaster-Treffer { point, object, face }): trägt sein Stoff die Durchsicht der Kamera
    // (`maskNode` = der Knoten seiner Art), steht er mit dem Gewicht der EINEN Formel über der Mitte des Saums (die Werte, die
    // `_kamZielSetzen` der GPU schrieb) — die Probe durch die Bildmitte trifft nie, was das Bild nicht zeigt (Laub in der
    // Nah-Kugel des Ich-Auges). Jeder andere Stoff steht.
    _durchsichtSteht(h) {
        const kn = this._kamDurchKnoten;
        const k = this.state._kamZiel;
        if (!h || !kn || !k || !h.object) return true;
        const m = h.object.material;
        const mat = Array.isArray(m) ? m[(h.face && h.face.materialIndex) || 0] : m;
        const mk = mat ? mat.maskNode : null;
        const n = !mk ? null : mk === kn.laub ? k.nl : mk === kn.rinde ? k.nr : mk === kn.boden ? k.nb : null;
        if (n === null) return true;
        const w = AnazhRealm._durchsichtGewicht(
            AnazhRealm.DURCHSICHT_ZAHLEN,
            h.point,
            { x: k.ex, y: k.ey, z: k.ez },
            { x: k.x, y: k.y, z: k.z },
            k.r,
            n
        );
        return w >= 0.5;
    }

    _applyVegetationResponse(mat, opts) {
        if (opts.useInstanceTint) {
            if (!mat.userData) mat.userData = {};
            mat.userData.useInstanceTint = true;
        }
        // DER WIND DES WERKSTATT-BAUMS (K19): der Grammatik-Baum (`_buildTreeSkeletonLeaves`) trägt den EINEN Wind-Term der
        // Foundry-Pflanze (`_baumWindStoff`): Höhe und Schlankheit aus seinem Skelett (`opts.baumWind`, `_skelettWindDaten`),
        // die Welt-Höhe aus dem Instanz-Stempel aH0, die Last aus der Wind-Zeile des Wetters. Was kein Skelett trägt (Holz,
        // Leder, Fleisch der Bauteile), steht im Wind: bis K19 bog die Tag-Achse `wiegen` jedes lebendige Bauteil mit eigener
        // Sinus-Formel ohne Wind-Zeile (der Sturm sah aus wie die Brise). Die Karte (impostorAtlas) trägt ihren eigenen Term.
        if (opts.baumWind && !opts.impostorAtlas)
            this._baumWindStoff(mat, opts.foliageLeaf === true ? "foliage" : "bark", opts.baumWind);
        // DAS LAUB-LICHT (K19): das Grammatik-Laub (Blatt-Karte und Klinge) lichtet mit dem EINEN Laub-Licht-Term des Foundry-
        // Laubs (`_laubLichtStoff`, phyto-core `laubDurchlass`) — die unbelichtete Silhouetten-Aufhellung (die Fresnel-Kopie des
        // Labors) und der sonnen-blinde Gegenlicht-Glow sind gefallen; die Klinge ist Laub, die Karte erkennt die Nadel am Atlas.
        if (opts.foliageLeaf === true) this._laubLichtStoff(mat, opts.foliageBlade !== true);
        // SSE-Metrik + Dither-Crossfade NUR für Laub-Karten (`opts.foliageLeaf` trägt aH0/aH0L aus
        // `_buildTreeFoliageCardGeometry`; sonst attribute()-Crash). Dieselbe `uLodRef`-Quelle wie die CPU:
        //   vLodD  = |Auge.xz − Ursprung der Instanz.xz| · min(uLodRef/aH0, 1) (großer Baum behält Detail länger;
        //            `_instanzMitteNode`, Studio `_iw`); vLodDL = dasselbe mit aH0L (Blatt-Sichthöhe).
        // Der Discard faltet in die Alpha (alphaTest cullt); uLodMaskOn=0 oder NAH-Band → keep=1, byte-gleich.
        if (opts.foliageLeaf === true) {
            try {
                const _Tl = THREE.TSL;
                const _lu = this._ensureLodUniforms();
                const _fehlt = [
                    ["TSL", _Tl],
                    ["uLodRef", _lu.uLodRef],
                    ["uLodAuge", _lu.uLodAuge],
                    [
                        "uLodD0 · uLodD1 · uLodFade · uLodFade0",
                        _lu.uLodD0 && _lu.uLodD1 && _lu.uLodFade && _lu.uLodFade0,
                    ],
                    [
                        "die Farbe mit Alpha",
                        mat.colorNode && mat.colorNode.rgb !== undefined && mat.colorNode.a !== undefined,
                    ],
                ]
                    .concat(
                        [
                            "attribute",
                            "vec2",
                            "vec4",
                            "float",
                            "length",
                            "screenCoordinate",
                            "fract",
                            "step",
                            "mix",
                        ].map((k) => ["TSL." + k, _Tl[k]])
                    )
                    .filter((x) => !x[1])
                    .map((x) => x[0]);
                if (_fehlt.length) throw this._blendeBruch("die Blatt-Karte: es fehlt " + _fehlt.join(" · "));
                {
                    const _aH0 = _Tl.attribute("aH0", "float");
                    const _aH0L = _Tl.attribute("aH0L", "float");
                    const _cam = _lu.uLodAuge; // das AUGE, nie die Pass-Kamera (Schattenpass = Kaskaden-Kamera)
                    // xz-Distanz Auge → URSPRUNG der Instanz (`_instanzMitteNode`, Studio `_iw`), nie zum Vertex
                    const _mitte = this._instanzMitteNode(_Tl);
                    const _cd = _Tl.length(_Tl.vec2(_cam.x.sub(_mitte.x), _cam.z.sub(_mitte.y)));
                    const _ref = _lu.uLodRef;
                    const _lk = _ref.div(_aH0.max(_Tl.float(1e-3))).min(_Tl.float(1.0));
                    const _lkL = _ref.div(_aH0L.abs().max(_Tl.float(1e-3))).min(_Tl.float(1.0)); // |aH0L|: Vorzeichen = Halt
                    const _vLodD = _cd.mul(_lk); // Skelett-SSE
                    const _vLodDL = _cd.mul(_lkL); // Blatt-SSE (absolut-nah)
                    // golden-ratio Screen-Space-Dither (phytogenesis Fragment): wandert mit uDitherT →
                    // über ~6-8 Frames glättet die zeitliche Streuung den Übergang (TAA-Idee).
                    const _dh = this._ditherIGN(_Tl, 0);
                    // Übergangs-Rampen: _f0 = L0→L1-Band (Blatt-Distanz), _f1 = L1→L2/Impostor-Band
                    // (Skelett-Distanz). Laub = ÜBERLAPPENDE Rampen (phytogenesis FIX v37): die Karte
                    // weicht erst in der oberen Bandhälfte (2f−1) → Deckung bleibt ≥ Maximum, kein Loch. Die Schwellen und
                    // Bänder sind die LIVE-Uniforms der EINEN Quelle (das Gesetz des Schirms legt sie, lod.K5) — bis w3v-lod
                    // standen sie als Zahlen im Programm, eingefroren beim Bau des Stoffs.
                    const _f0 = _vLodDL
                        .sub(_lu.uLodD0.sub(_lu.uLodFade0))
                        .div(_lu.uLodFade0.max(_Tl.float(1e-3)))
                        .clamp(0.0, 1.0);
                    const _f1 = _vLodD
                        .sub(_lu.uLodD1.sub(_lu.uLodFade))
                        .div(_lu.uLodFade.max(_Tl.float(1e-3)))
                        .clamp(0.0, 1.0);
                    const _fadeOut = _f0.mul(2.0).sub(1.0).clamp(0.0, 1.0).max(_f1);
                    // Dither-Discard als reine Arithmetik: keepRaw = step(fadeOut, dh) (1 = behalten); uLodMaskOn faltet
                    // als mix (0 → keep=1, harte Kante); im NAH-Band fadeOut=0 → keep=1 → alpha byte-unverändert.
                    // DER HALT (K36, `_lodSlotStamp`): aH0L < 0 — die Stufe ohne Partner zeichnet voll
                    const _keepRaw = _Tl.step(_fadeOut, _dh).max(_Tl.float(1.0).sub(_Tl.step(_Tl.float(0.0), _aH0L)));
                    const _keep = _Tl.mix(_Tl.float(1.0), _keepRaw, _lu.uLodMaskOn);
                    mat.colorNode = _Tl.vec4(mat.colorNode.rgb, mat.colorNode.a.mul(_keep));
                    mat.userData = mat.userData || {};
                    mat.userData.lodCrossfade = true; // Marker für das Test-Band (kein Verhalten)
                }
            } catch (_e) {
                throw _e && _e.blende === true
                    ? _e
                    : this._blendeBruch("die Blatt-Karte: " + ((_e && _e.message) || _e));
            }
        }
        return mat;
    }

    _buildToonNodeMaterial(opts = {}) {
        // PBR ist die EINE Material-Wahrheit: dieser Aufruf baut IMMER PBR (roughness/metalness aus den
        // Material-Tags); der Name bleibt für die ~14 Aufrufstellen — kein Toon-Zwilling.
        return this._buildPbrNodeMaterial(opts);
    }

    // Wasser-Cull (uMinDepth): dünnes Wasser pro Pixel verwerfen (optischer Weg < uMinDepth → Alpha 0
    // via mat.alphaTest). Wert in METERN optischen Wegs (0 … 0,05 m, seit dem Durchlass-Gesetz); 0 = aus.
    setWaterCull(minDepth) {
        const m = Math.max(0.0, Math.min(0.05, Number(minDepth) || 0.0));
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.waterCull = m;
        // Das geteilte Hydro-Surface-Uniform live setzen (lazy initialisiert beim
        // ersten Material-Bau; nur setzen, wenn schon da).
        if (this.state.hydroSurfaceUniforms && this.state.hydroSurfaceUniforms.minDepth) {
            this.state.hydroSurfaceUniforms.minDepth.value = m;
        }
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // V18.15 Phase 3 — der See-Wellen-Floor (uLakeRipple, 0..1): wie stark See/Fluss
    // kräuseln (0 = flach, 0.06 sanft, 1 = wie Ozean). Live an die Uniform.
    setLakeRipple(v) {
        const m = Math.max(0.0, Math.min(1.0, Number(v) || 0.06));
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.waterLakeRipple = m;
        if (this.state.hydroSurfaceUniforms && this.state.hydroSurfaceUniforms.lakeRipple) {
            this.state.hydroSurfaceUniforms.lakeRipple.value = m;
        }
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // V18.14 M1 — die MAKRO-bewusste Schaum-Tiefe (uDepthFoam, in Metern): der Schaum
    // schäumt nur Wasser flacher als dieser Tiefe (die echte Uferlinie). Kleiner = der
    // flache Fluss schäumt weniger; grösser = mehr Schaum auch im flachen Wasser.
    setWaterDepthFoam(meters) {
        const m = Math.max(0.1, Math.min(6.0, Number(meters) || 1.2));
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.waterDepthFoam = m;
        if (this.state.hydroSurfaceUniforms && this.state.hydroSurfaceUniforms.depthFoam) {
            this.state.hydroSurfaceUniforms.depthFoam.value = m;
        }
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // (V18.111 — A4: setWaterfallSteep ist GESCHNITTEN — die Plane fiel,
    // das CA-Wildwasser [aSlope] trägt steile Läufe.)

    // Mikro-Struktur-Regler (microStrength, 0…0.4): setzt das Uniform live + persistiert in atmosphere.
    setMicroStrength(v) {
        const val = Math.max(0, Math.min(0.4, Number(v) || 0));
        if (!this.state.atmosphere) this.state.atmosphere = {};
        this.state.atmosphere.microStrength = val;
        const au = this._ensureAtmoUniforms();
        if (au && au.microStrength) au.microStrength.value = val;
        if (typeof this.saveState === "function") this.saveState();
        return val;
    }

    // R5-Struktur-Boost: Mikro-Tiefe der OPAKEN Strukturen (werk-Profil: Bauwerke/Deko/Avatare/
    // Kreaturen), multipliziert das micro-Gewicht in `_applySubstanceResponse`; live + persistiert in
    // atmosphere.r5StructureBoost. 1.0 = neutral, 1.3 = Default, bis 2.5. NICHT das Terrain (eigener
    // colorNode-Triplanar).
    setStructureBoost(v) {
        const val = Math.max(0.5, Math.min(2.5, Number(v) || 1.3));
        if (!this.state.atmosphere) this.state.atmosphere = {};
        this.state.atmosphere.r5StructureBoost = val;
        const au = this._ensureAtmoUniforms();
        if (au && au.r5StructureBoost) au.r5StructureBoost.value = val;
        if (typeof this.saveState === "function") this.saveState();
        return val;
    }

    setCavityAO(scale) {
        // V17.109 — Headroom: Bereich 0..2 (200 %), damit 100 % die Mitte ist
        // (Schöpfer-Wunsch „nicht am Anschlag"). >1 verstärkt die AO über den
        // Default; der aoCap im Shader bleibt der Sicherheits-Deckel.
        const v = Math.max(0, Math.min(2, Number(scale)));
        const m = Number.isFinite(v) ? v : 1.0;
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.cavityAO = m;
        if (this.state.atmoUniforms && this.state.atmoUniforms.aoScale) this.state.atmoUniforms.aoScale.value = m;
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // (V18.106 — B3: setTerrainFlatten ist GESCHNITTEN — die 2.5D-Lichtung ist
    // in die Geometrie gebacken [TERRAIN_NORMAL_FLATTEN], der Slider weicht.)

    // V17.104-Regler — die Farb-Variation (V17.12-Makro-Tint-Stärke, 0..1). 0 = reine
    // Basisfarbe (testet, ob die warm/kühl-Patches die „zwei Basisfarben" sind, die
    // unter Licht zu Trapeze-Parzellen auseinanderdriften — Schöpfer-Diagnose).
    setColorVariation(scale) {
        const v = Math.max(0, Math.min(2, Number(scale))); // V17.109 Headroom 0..2
        const m = Number.isFinite(v) ? v : 1.0;
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.colorVar = m;
        if (this.state.atmoUniforms && this.state.atmoUniforms.tintScale) this.state.atmoUniforms.tintScale.value = m;
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // V17.103-Regler — die Oberflächen-Textur (triplanar Striation-Stärke, 0..1).
    // 0 = glatte Terrain-Farbe (testet, ob die „Holzmaserung" die Trapeze betont).
    setSurfaceTexture(scale) {
        const v = Math.max(0, Math.min(4, Number(scale))); // V17.109 Headroom 0..4 (Schöpfer liebt die Striation, will >200%)
        const m = Number.isFinite(v) ? v : 1.0;
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.triplanar = m;
        if (this.state.atmoUniforms && this.state.atmoUniforms.triplanarScale)
            this.state.atmoUniforms.triplanarScale.value = m;
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // WELLE J4-Regler — die Kanten-Schärfe (Post-FX local-contrast/Unsharp).
    // Verstärkt Helligkeits-Kanten (schärft Cel-/Facetten-Grenzen NACH, screen-
    // space → flackert) — der zweite Verdacht. 0 = aus und Default (F1, die Foto-Kette).
    setEdgeSharp(amount) {
        const v = Math.max(0, Math.min(1, Number(amount)));
        const m = Number.isFinite(v) ? v : 0;
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.kantenSchaerfe = m;
        if (this.state.postProcessingUniforms && this.state.postProcessingUniforms.localContrast)
            this.state.postProcessingUniforms.localContrast.value = m;
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // Schatten-Reichweite = Frustum-Halbbreite der Shadow-Camera in Metern; Texel = 2·m / mapSize →
    // kleiner = schärfer + billiger (weniger Caster), aber weniger Abdeckung; der Light-Space-Snap folgt.
    // DIE EINE Anwende-Quelle (Kamera + CSM), OHNE persist: der Perf-Regler ruft sie pro Frame mit der
    // effektiven Reichweite, ohne den User-Ceiling (`atmosphere.shadowRange`) oder saveState zu berühren.
    _applyEffectiveShadowRange(m) {
        const dl = this.state.directionalLight;
        if (dl && dl.shadow && dl.shadow.camera) {
            const sc = dl.shadow.camera;
            sc.left = -m;
            sc.right = m;
            sc.top = m;
            sc.bottom = -m;
            sc.updateProjectionMatrix();
            this._hauptSchattenBias(dl); // der Texel der Haupt-Karte folgt der Reichweite
        }
        const csm = this.state.csmNode;
        if (csm) {
            csm.maxFar = m * AnazhRealm.SCHATTEN_FERN_FAKTOR;
            if (csm.camera) csm.updateFrustums();
        }
        this._shadowRangeApplied = m;
    }

    setShadowRange(meters) {
        const v = Math.max(80, Math.min(400, Number(meters)));
        const m = Number.isFinite(v) ? v : 300;
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.shadowRange = m; // der User-CEILING (der Regler skaliert darunter)
        this._applyEffectiveShadowRange(m);
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }

    // DER SCHATTEN-HEBEL (`atmosphere.shadowBias`, 0..3, Standard 1): er skaliert das GESETZ des Bias (`_schattenBias`) — bis
    // 0710-12 war er der normalBias selbst, ein fester Meter-Wert für jede Kaskade (1,0 m: kein Werfer unter ~1 m erreichte den
    // Boden). Jeder gespeicherte Stand trägt 1 = das Gesetz. Er stellt jede Karte sofort: das Haupt-Licht (der Rückfall ohne
    // Kaskaden) und jede Kaskade mit der Box ihres letzten Renders (B4, V18.130: die Kaskaden-Lichter klonen nur beim Init).
    setShadowBias(bias) {
        const v = Math.max(0, Math.min(3, Number(bias)));
        const m = Number.isFinite(v) ? v : 1.0;
        if (!this.state.atmosphere) this.state.atmosphere = { waterCull: 0.0025 };
        this.state.atmosphere.shadowBias = m;
        this._hauptSchattenBias(this.state.directionalLight);
        const csm = this.state.csmNode;
        if (csm && Array.isArray(csm.lights) && csm._anazhFit)
            csm.lights.forEach((lw, i) => {
                const f = csm._anazhFit[i];
                if (lw && lw.shadow && f)
                    this._schattenBias(
                        lw,
                        Math.max(f.W / lw.shadow.mapSize.width, f.H / lw.shadow.mapSize.height),
                        f.zt - f.zb
                    );
            });
        if (typeof this.saveState === "function") this.saveState();
        return m;
    }
    _schattenNormalBias(texel) {
        const a = this.state.atmosphere;
        const hebel = a && Number.isFinite(a.shadowBias) ? Math.max(0, Math.min(3, a.shadowBias)) : 1;
        return AnazhRealm.SCHATTEN_KASKADE.normalTexel * hebel * texel;
    }
    // Das Haupt-Licht: der Rückfall ohne Kaskaden und die Vorlage, aus der die Kaskaden-Lichter klonen. Seine Karte deckt
    // ±Reichweite um den Spieler — ein Texel ist 2 · Reichweite / Kartengröße.
    _hauptSchattenBias(dl) {
        const c = dl && dl.shadow && dl.shadow.camera;
        if (!c) return;
        this._schattenBias(dl, (c.right - c.left) / dl.shadow.mapSize.width, c.far - c.near);
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_stoff_material]);

// ===== ATLAS · Stoff/material — Außen-Konstanten =====
// DER LICHT-POOL (K11, `_leuchtTakt`, `_leuchtStoff`): `plaetze` Punktlicht-Plätze ab dem Boot (eine feste Zahl geteilter
// Uniforms — ein Wechsel der Quellen baut kein Programm) an den Leuchtquellen im `umkreisM` um das Auge, deren Reichweite ihm
// am nächsten kommt (das Licht des Auges, ein Feuer 9 m, eine Laterne 12 m, ein Tor 14 m), neu gewählt je `wahlS` Sekunden
// oder nach `wahlM` Metern Weg; ein Platz blendet in `blendeS` Sekunden aus und ein (kein Licht springt).
AnazhRealm.LICHT_POOL = Object.freeze({ plaetze: 4, umkreisM: 48, wahlS: 0.25, wahlM: 1, blendeS: 0.5 });
// DIE NÄSSE (wetter.K2, `_naesseTakt`, `_naesseImStoff`): Regen benetzt mit τ = `benetzenS` / Regen-Stärke (Wetter-Feld `rain` über
// `regenAb`; Regen 0,6 nach 10 min 0,91), ohne Regen trocknet die Welt mit τ = `trocknenS` / max(Sonne, 0,2); voll nass geht die
// Albedo zu ihrem Quadrat, die Rauheit auf `glatt` × sich. `poren` je Art (sonst 1): Laub und Halm tragen Wachs,
// Haut Fett, der Schatten-Stoff zeichnet keine Farbe. Der Dach-Pool: `dachPlaetze` Decken im `dachUmkreisM`, neu nach `dachSchrittM`;
// Decken tragen die Häuser (Hülle) und die `dachArten` (Rezept oder Art: ihre Form schließt oben, `_dachKastenSetzen`). Näher als
// `ruhe` an ihrem Ziel steht die Nässe dort (ein Tausendstel verschiebt eine Albedo um höchstens 2,5e-4) — der Fixpunkt, an dem
// der Regen schläft (feld.K3, `_tickRain`). Wie nass ein Reifen greift, trägt die Stoff-Zeile je Stoff (`muRadNass`, `_fahrHaft`).
AnazhRealm.NAESSE = Object.freeze({
    regenAb: 0.05,
    benetzenS: 150,
    trocknenS: 1500,
    ruhe: 1e-3,
    glatt: 0.5,
    poren: Object.freeze({ foliage: 0.6, foliageTex: 0.6, grass: 0.6, skin: 0.3, haut: 0.3, schatten: 0 }),
    dachPlaetze: 8,
    dachUmkreisM: 64,
    dachSchrittM: 4,
    dachArten: Object.freeze(["marktstand", "brunnen", "gate"]),
});
// Substanz-Antwort: microStrength = Oberflächen-Mikrostruktur, ao* = Kavitäts-AO. Default-Quelle in
// `_ensureAtmoUniforms` (SUBSTANCE_RESPONSE-Antennen lesen daraus); die Luftperspektive ist `LUFT`.
AnazhRealm.AERIAL = Object.freeze({
    microStrength: 0.14,
    aoStrength: 0.38,
    aoCap: 0.18,
});
// GRASS_BLADE_H = die lokale Referenz-Halm-Höhe (die Brennstoff-Tiefe der Wiese im Brand-Gesetz, `bau-vorlagen`).
// V18.492: GRASS_MAX_BLADES/GRASS_POOL_CAP sind mit dem Halm-Mesh-Pool gefallen (die Wiese ist Boden-Funktion, 21.07.).
AnazhRealm.GRASS_BLADE_H = 0.42;
// DIE DURCHSICHT DER KAMERA (`_durchsichtGewicht`): zwischen Auge und Ziel (`_kamZielSetzen`) wird eine Pflanze um den
// Sicht-Strahl bis zum Radius durchsichtig und über den Saum ausgedithert, quer zum Strahl wie vor der Ebene des Ziels (m)
// — zu Fuß der Leib (Schultern ± 0,25 m, der Kopf 0,7 m über der Brust), im Ritt der Wagen (4,5 × 1,9 m um die Kabine).
// Dazu die NAH-KUGEL um das Auge (Leben-Schau 2, 09.10.: in allen drei Spuren füllte Laub, Strauch oder Ast die Linse): in
// 3rd fallen Laub und Rinde bis an die Ebene des Ziels (der Freiraum der Kamera), die Boden-Streu bis bodenM (im Ritt
// bodenRittM); im Ich-Auge Laub und Boden-Streu bis ichM — die Rinde, an der der Leib steht, bleibt.
AnazhRealm.KAMERA_DURCHSICHT = Object.freeze({
    fussM: 0.9,
    rittM: 2.0,
    saumM: 0.6,
    bodenM: 2.0,
    bodenRittM: 3.0,
    ichM: 0.8,
});
// Die Zahlen-Algebra der EINEN Durchsichts-Formel (`_durchsichtGewicht`): Skalare oder {x, y, z} — die Linse rechnet damit,
// was der Stoff rechnet.
AnazhRealm.DURCHSICHT_ZAHLEN = Object.freeze({
    k: (n) => n,
    sub: (a, b) => (typeof a === "number" ? a - b : { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }),
    mul: (a, b) => (typeof a === "number" ? a * b : { x: a.x * b, y: a.y * b, z: a.z * b }),
    div: (a, b) => a / b,
    dot: (a, b) => a.x * b.x + a.y * b.y + a.z * b.z,
    len: (a) => Math.hypot(a.x, a.y, a.z),
    max: (a, b) => Math.max(a, b),
    min: (a, b) => Math.min(a, b),
    clamp01: (a) => Math.min(1, Math.max(0, a)),
});
// GRAS_BEND_SLOTS: Interaktions-Sphären im Wind-Uniform (1 Spieler + 1 Ritt +
// ≤4 nahe Kreaturen — GoT-Interaktions-Budget, vertex-shader-billig).
AnazhRealm.GRAS_BEND_SLOTS = 6;
// GRAS_BEND_CREATURE_DIST_SQ: nur Kreaturen im 18-m-Umkreis des Spielers biegen
// Gras (18² = 324) — weiter draußen ist der Effekt sub-pixel (Distanz-LOD-Lehre).
AnazhRealm.GRAS_BEND_CREATURE_DIST_SQ = 324;
