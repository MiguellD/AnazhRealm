class AnazhRealm_bild_wahl {
    // ===== ATLAS · Bild/wahl — Pass-Wahl · Sicht je Pass · Werfer-Wahl · geteilte Lage und ihr Anker · Treffer-Probe · Instanz-Wahl auf der GPU =====
    // DIE SICHT JE PASS (scene.onBeforeRender / onAfterRender): die Region-Bundles tragen ihren Cull auf `visible`
    // (three-Culling friert im Replay ein). Bis V18.528 galt das Urteil der Haupt-Kamera für JEDEN Pass: ein Bundle im
    // Blick warf in beide Kaskaden (auch 2 km weit), eines hinter dem Blick oder hinter dem Berg warf nie — auch wenn
    // sein Schatten ins Bild fiel. Jetzt liest der Hauptpass das Haupt-Urteil (_archRegionBundleCull: Frustum · die Tiefe
    // der Sicht, Bild/tiefe), jeder Schatten-Pass das EIGENE: je Region die Werfer-Hülle, darin je WERFER (jedes werfende Blatt-Mesh)
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
        const hauptBild = !nach && k < 0 && kamera === this.state.camera;
        if (hauptBild) {
            this._arenaTakt();
            this._wieseAugeTakt(kamera); // das Auge der Wiese für Stoff und Wahl dieses Bilds (die Nah-Wiese wirft nie)
            this._sichtTiefeBeginn(kamera); // die Tiefe des letzten Bilds für den frühen Zug der Sicht (Bild/tiefe)
        } else this._sichtTiefeRuht(); // die Züge der Sicht zeichnen nur im Hauptbild
        if (!nach) this._instanzWahlGpu(kamera, S);
        // Die Sätze (Boden · Wasser · Bau · Streu) wählen ihren Abschnitt nach demselben Gesetz; die Bau-Sätze des Hauptbilds
        // schneiden danach ihre Haufen an der Tiefe (der frühe Zug: EIN Compute vor jedem Zeichnen dieses Bilds).
        this._chunkSatzPass(kamera, nach, k, S);
        if (hauptBild) this._sichtTiefeRechnen(kamera);

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
    // und das Tempo des letzten Schritts der Kamera (unter ZEIT_SPRUNG_M, binnen 0,25 s; im Stand und nach einem Sprung Tempo 0).
    // Leser: die Lage des Wegs (`_lageAnker`), der Anker der Ferne der Wiese (`_wieseFernAnker`) und die Box der Kaskaden über den
    // Weg (`_kaskadenPassen`). Mehrere Pässe eines Bilds lesen denselben Schritt (das Auge steht zwischen ihnen).
    // DAS TEMPO AN DER WELT-UHR (`spielZeit`, s; einheit-sicht S5): an der Gerätezeit hing es an der Dauer jedes Takts — derselbe
    // Weg ergab je Gerät und Last eine andere Box der nahen Kaskade, ihre Schatten-Kanten wanderten (Genesis-Flug Bild 23, GTX 1050:
    // x0 −52,27 / −52,32 / −44,62 m bei 15,5 / 15,7 / 0 m/s). Ein Schritt ohne Welt-Zeit ist ein Sprung.
    _augeWegJetzt() {
        const W = this._augeWeg || (this._augeWeg = { x: NaN, y: 0, z: 0, t: -Infinity, u: [0, 0, 0], v: 0, n: 0 });
        const cam = this.state.camera;
        if (!cam) return W;
        const e = cam.matrixWorld.elements;
        const t = this.state.spielZeit;
        const [dx, dy, dz] = [e[12] - W.x, e[13] - W.y, e[14] - W.z];
        if (dx === 0 && dy === 0 && dz === 0) {
            if (t - W.t > 0.25) W.v = 0;
            return W;
        }
        const s = Math.hypot(dx, dy, dz);
        const dt = t - W.t;
        W.v = s > 1e-4 && s < AnazhRealm.ZEIT_SPRUNG_M && dt > 0 && dt < 0.25 ? s / dt : 0;
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
    // Regional (im Region-Bündel, sein Cull), Tür-Flügel und Haspel-Teile wählt niemand je Instanz.
    _instanzWahlArt(leaf, castShadow, regional) {
        if (regional || !leaf || leaf.tuer || leaf.welle) return null;
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

    // DAS FENSTER EINES GLIEDS IM GANZEN (laub-kante, Kosten am Schirm): behält die Maske der Blende in diesem Pass IRGENDEINE
    // Instanz des Glieds? Dieselbe Rechnung wie `fenster` in `PASS_WAHL_WGSL`, über das Glied als Intervall: der XZ-Abstand vom
    // Auge der Blende zur Kugel des Glieds in der Welt (`c`, `r`) ± ihr Radius und der Rand der Blende, je Maß das Band der
    // Sichthöhen seiner Instanzen (`M`, `_fensterMass`), das Urteil am EINEN Blend-Gesetz (`_blendeBehaelt`). Nein: das Glied
    // zieht in diesem Pass nicht — ein Zug, dessen Instanzen alle jenseits seiner Stufe stehen, ist ein leerer Befehl im Band.
    // Befund (Bildpaar paar4, Dorf, Radeon): 33 Züge ohne eine Instanz, eiche · birke · weide · strauch L1, ihre Bäume standen
    // alle in der Karte. Ohne Fenster (Art 0, die Nähe), ohne Maske im Kanal des Passes oder ohne Maß behält es (die GPU wählt).
    static _fensterTraegt(F, L, c, r, M) {
        if (!F || !(F[0] >= 1 && F[0] <= 4) || !L || !L.an || !(L.fit ? F[2] : F[1]) || !M || M.verdeckt) return true;
        const d = Math.hypot(c.x - L.ex, c.z - L.ez),
            lo = Math.max(0, d - r - L.haltBlende) * L.perf,
            hi = (d + r + L.haltBlende) * L.perf,
            k = (h) => Math.min(L.ref / Math.max(h, 1e-3), 1);
        if (F[0] === 4) return AnazhRealm._blendeBehaelt(L.kanten, "karte", lo * k(M.s1), hi * k(M.s0), 0, 0, false);
        return AnazhRealm._blendeBehaelt(L.kanten, F[0], lo * k(M.s1), hi * k(M.s0), lo * k(M.l1), hi * k(M.l0), false);
    }

    // DAS MASS EINES GLIEDS (`_fensterTraegt`): das Band der Sichthöhen seiner ersten `n` Instanzen — Skelett `aH0` und Blatt
    // `aH0L` (Art 1–3), die Karte `aKarte.w` (Art 4); ein negatives (die Stufe ohne Partner, die verdeckte Karte) behält das
    // Glied voll, wie `fenster` in `PASS_WAHL_WGSL`. Gerechnet, wenn der Block des Glieds kopiert (`_block`: eine neue Version).
    static _fensterMass(at, n, art) {
        const M = { s0: Infinity, s1: 0, l0: Infinity, l1: 0, verdeckt: false };
        const S = art === 4 ? at.aKarte : at.aH0,
            B = art === 4 ? at.aKarte : at.aH0L;
        if (!S || !B || n <= 0) return null;
        const sS = art === 4 ? S.itemSize : 1,
            oS = art === 4 ? 3 : 0;
        for (let i = 0; i < n; i++) {
            const s = S.array[i * sS + oS],
                l = art === 4 ? s : B.array[i];
            if (s < 0 || l < 0) {
                M.verdeckt = true;
                return M;
            }
            if (s < M.s0) M.s0 = s;
            if (s > M.s1) M.s1 = s;
            if (l < M.l0) M.l0 = l;
            if (l > M.l1) M.l1 = l;
        }
        return M;
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
                const zug = a._wahlVor(rend, kamera, S.lage.auge); // das Auge der Wahl (`_wahlRechnen`): das Fenster im Ganzen
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
}
_stammZonen(AnazhRealm, [AnazhRealm_bild_wahl]);

// ===== ATLAS · Bild/wahl — Außen-Konstanten =====
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
// DIE FERNE (Art 6, `_nahWieseBestand`): tot fällt, diesseits der Übergabe legt die Nähe; das Büschel steht, solange seine
// Ordnung (Element 11) unter dem Anteil seines Gesetzes × (1 + Rand) liegt — `_wieseFern` am Fußabdruck-Abstand `_wieseFuss`
// (der Fuß, die EBENE DES GESETZES aus Element 3 und 7, `_wieseHang` — bis w28-pop-treue die Stand-Ebene aus den waagrechten
// Achsen, die Ordnung in Element 7 —, die Höhe des Auges über dem eigenen Boden in `auge.w`), aus
// `WIESE_WGSL` (dieselbe Algebra wie der Stoff). Das Büschel ist unverformt (w28-wiese-schale): seine Kugel die des Teils wie
// in der Nähe. Bis dahin spreizte es die Halme um die Streckung (Element 3 die Grenze), und Art 7 wählte die Karten der Schale.
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
    if (art == 6u) {
        if (m[2].w < 0.0) { return false; }
        let fuss = m[3].xyz;
        let d = length(fuss.xz - lage.auge.xz);
        if (d < a.saum.y) { return false; }
        let n = vec3f(-m[0].w, 1.0, -m[1].w);
        let q = wieseFuss(fuss - lage.auge.xyz, n, lage.auge.w);
        if (m[2].w >= wieseFern(d, q) * (1.0 + a.saum.z)) { return false; }
        let sk = wieseSkala(d, q);
        c = (m * vec4f(a.kugel.xyz * sk, 1.0)).xyz - lage.auge.xyz;
        r = a.kugel.w * sqrt(s2) * sk + a.saum.x;
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
