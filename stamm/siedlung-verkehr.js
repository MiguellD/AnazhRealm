class AnazhRealm_siedlung_verkehr {
    // ===== ATLAS · Siedlung/verkehr — Wagen · Fahrer · Spur · Kreuzung · Wende · Platz =====
    // ═══ DER VERKEHR (PFLICHT-OFFEN C, gesetzt 25.10.): Wagen mit Bewohnern am Steuer auf den Trassen der Stadt ═══
    // Eine städtische Siedlung (fachwerk `verkehrVon`) fährt so viele Wagen, wie ihr Gesetz nennt — jeder gefahren von einem
    // Bewohner ihrer Liste, auf dem Netz des Gesetzes (fachwerk `verkehrsNetz`: die zweispurigen Trassen, Kreuzungen, Engen,
    // Wenden und Plätze), mit dem EINEN Fahrer (`_fahrerSchritt`, `_fahrerLinie`) und dem EINEN Fahr-Schritt des Kerns
    // (`_wagenSchritt` · vehicle-core fahrStand · `_wagenLage`). Der Fahrer hat die Rolle `fahrer` (koerper-core TAGES_GESETZ):
    // sein Werk ist der Platz seines Wagens an der Wende nahe seiner Tür — dorthin geht er am Morgen, steigt ein, fährt bis
    // zum Feierabend durch die Stadt, kehrt zum Platz zurück, steigt aus und geht heim. Die Wagen leben mit der Liste ihrer
    // Siedlung (`_bewohnerFort` nimmt sie mit) und sind Gesetz, nie Save-Byte (`ausGesetz`).
    // DIE ORDNUNG AUF DER STRASSE: jede Strecke trägt zwei Spuren (rechts der Fahrt), wer vor einem fährt, deckelt sein Tempo
    // (`_verkehrFolge`: Weg bis zu ihm samt Abstand und Bremsweg), wer in der Spur steht oder geht (Bewohner, Spieler), hält
    // ihn an; Kreuzung, Enge und Wende befährt einer zur Zeit (`_verkehrZonen`: der Schlüssel des Orts, in der Reihe der
    // Wartenden, nur mit Platz dahinter — keiner hält in der Kreuzung). Die Bewohner sehen den fahrenden Wagen als Leib mit
    // Vorrang im Raster ihres Gedränges (`_verkehrImRaster`), den stehenden als Wand.
    // DIE KOSTEN (Gebot 7): ein Wagen fern vom Spieler fährt seltener (die Leiter `VERKEHR.leiter`: derselbe Schritt mit der
    // gesammelten Zeit), seine Boxen ziehen erst ab 0,5 m nach; der Leib am Steuer lebt nur nah (`leibM`).

    // DER VERKEHR EINER SIEDLUNG entsteht mit ihrer Liste (`_tickBewohner`, nach dem Stand der Stände): das Netz und die Wenden
    // ihres Plans v2 (`plan.verkehr`, fachwerk `verkehrsBoden` — ein Ende ohne Wende trägt keinen Wagen, und was nur noch zu
    // ihm führt, auch nicht), je Fahrer des Gesetzes der Bewohner des Hauses (Person 0) und ein Platz an der Wende nahe seiner
    // Tür (die nächste mit freiem Platz). Wer keinen findet, fährt nicht (gezählt: `ohnePlatz`).
    _verkehrAnlegen(S) {
        const FC = globalThis.__fachwerkCore;
        if (!FC || typeof FC.verkehrsNetz !== "function" || typeof FC.verkehrVon !== "function")
            return AnazhRealm._kernPflichtBruch("fachwerk:verkehrsNetz");
        const V = AnazhRealm.VERKEHR;
        const VG = FC.VERKEHR_GESETZ;
        const von = FC.verkehrVon(S.plan);
        const VK = (S.verkehr = {
            wagen: [],
            zonen: [],
            strecken: [],
            kp: [],
            wenden: new Map(),
            kpZone: new Map(),
            zahl: {
                soll: von.n,
                ohnePlatz: 0,
                ohneFahrer: 0,
                laengeM: 0,
                km: 0,
                fest: 0,
                stoss: { wagen: 0, bau: 0, leib: 0 },
            },
        });
        if (!von.n) return VK;
        // DAS NETZ UND SEINE WENDEN trägt der Plan v2 (fachwerk `ortPlan` → `verkehrsBoden`, im Ort-Faden gerechnet): die Wende
        // jedes Endes, die Land und Hang tragen, liegt dort schon als Boden der Stadt
        const N = S.plan.verkehr;
        if (!N || !Array.isArray(N.kreuzungen)) return VK;
        VK.strecken = N.strecken.map((s) => Object.assign({}, s, { fahrbar: s.frei }));
        VK.kp = N.kreuzungen.map((K) => Object.assign({}, K, { verboten: (K.verboten || []).slice() }));
        for (const [ki, K] of VK.kp.entries())
            if (K.wende) VK.wenden.set(ki, Object.assign({}, K.wende, { frei: K.wende.plaetze.slice() }));
        const h = (x, z) => this.getTerrainHeightAt(x, z);
        // DIE STUFE: wo der Boden längs einer Spur, eines Abbiegers oder der Bahn einer Wende je halben Meter um mehr als `stufeM`
        // springt (die Kante einer Erdbau-Platte, die Böschung neben der Trasse), steht der Wagen vor einer Wand — die Strecke
        // trägt ihn nicht, der Abbieger ist verboten, die Wende fällt (die Stellen zählt `zahl.stufen`; das Gesetz legt Kreuzung
        // und Wende als EINE Fläche, `gate:settlement` Teil K — die Wand hier fängt, was ein anderer Erdbau darüber legt)
        VK.zahl.stufen = [];
        const stufe = (P) => {
            for (let i = 1; i < P.length; i++) {
                const n = Math.max(1, Math.ceil(Math.hypot(P[i].x - P[i - 1].x, P[i].z - P[i - 1].z) / 0.5));
                let h0 = h(P[i - 1].x, P[i - 1].z);
                for (let k = 1; k <= n; k++) {
                    const [x, z] = [
                        P[i - 1].x + ((P[i].x - P[i - 1].x) * k) / n,
                        P[i - 1].z + ((P[i].z - P[i - 1].z) * k) / n,
                    ];
                    const h1 = h(x, z);
                    if (!(Math.abs(h1 - h0) <= V.stufeM))
                        return { x: Math.round(x * 10) / 10, z: Math.round(z * 10) / 10 };
                    h0 = h1;
                }
            }
            return null;
        };
        for (const s of VK.strecken)
            if (s.fahrbar)
                for (const P of s.spur) {
                    const st = stufe(P);
                    if (st) [s.fahrbar, s.stelle] = [false, st];
                    if (st) VK.zahl.stufen.push(st);
                    if (st) break;
                }
        for (const [ki, K] of VK.kp.entries())
            for (const [wort, A] of Object.entries(K.wege || {})) {
                const [si, so] = wort.split(">").map(Number);
                const [a, b] = [VK.strecken[si], VK.strecken[so]];
                const rein = a.b === ki ? a.spur[0] : a.spur[1];
                const raus = b.a === ki ? b.spur[0] : b.spur[1];
                const st = rein.length && raus.length ? stufe([rein[rein.length - 1], ...A, raus[0]]) : null;
                if (st) {
                    K.verboten = (K.verboten || []).concat(wort);
                    VK.zahl.stufen.push(st);
                }
            }
        for (const [ki, w] of [...VK.wenden.entries()]) {
            const st = stufe(w.bahn);
            if (st) {
                VK.wenden.delete(ki);
                VK.zahl.stufen.push(st);
            }
        }
        // WAS NUR NOCH ZU EINEM ENDE OHNE WENDE FÜHRT, TRÄGT KEINEN WAGEN: das Ende ohne Wende nimmt seine Strecke, ein
        // Knotenpunkt mit nur noch einer Strecke die seine, und eine Strecke, aus der an einer Kreuzung kein Abbieger erlaubt
        // ist (`verboten`), sich selbst — bis keiner mehr fällt; dann der größte zusammenhängende Teil
        const fahrbarAn = (ki) => VK.kp[ki].strecken.filter((si) => VK.strecken[si].fahrbar);
        for (let weiter = true; weiter;) {
            weiter = false;
            for (const [ki, K] of VK.kp.entries()) {
                const an = fahrbarAn(ki);
                if (!an.length) continue;
                if (K.ende ? !VK.wenden.has(ki) : an.length < 2) {
                    for (const si of an) VK.strecken[si].fahrbar = false;
                    weiter = true;
                    continue;
                }
                if (K.ende) continue;
                for (const si of an)
                    if (!an.some((so) => so !== si && !(K.verboten || []).includes(si + ">" + so))) {
                        VK.strecken[si].fahrbar = false;
                        weiter = true;
                    }
            }
        }
        const teil = new Int32Array(VK.kp.length).fill(-1);
        let best = -1;
        let bestL = 0;
        for (let r = 0; r < VK.kp.length; r++) {
            if (teil[r] >= 0 || !fahrbarAn(r).length) continue;
            let L = 0;
            const st = [r];
            teil[r] = r;
            while (st.length) {
                const k = st.pop();
                for (const si of fahrbarAn(k)) {
                    const s = VK.strecken[si];
                    const j = s.a === k ? s.b : s.a;
                    if (teil[j] < 0) {
                        teil[j] = r;
                        st.push(j);
                        L += s.laenge;
                    }
                }
            }
            if (L > bestL) [best, bestL] = [r, L];
        }
        for (const s of VK.strecken) if (s.fahrbar && teil[s.a] !== best) s.fahrbar = false;
        for (const s of VK.strecken) if (s.fahrbar) VK.zahl.laengeM += s.laenge;
        for (const ki of [...VK.wenden.keys()]) if (!fahrbarAn(ki).length) VK.wenden.delete(ki);
        if (!VK.wenden.size) return VK;
        // DIE WENDE IST BODEN DER STADT (der Hebel der Dörfer, `_stlWegeBuild`): ihr Ring und ihre Plätze tragen Weg — die Natur
        // weicht ihnen (die Natur-Wand, `_aufWeg`), was schon dort wuchs, räumt der Takt
        const flaechen = { roads: [] };
        for (const w of VK.wenden.values()) {
            const ring = [];
            for (let a = 0; a <= 2 * Math.PI + 1e-9; a += 1 / w.r)
                ring.push({ x: w.x + Math.cos(a) * w.r, z: w.z + Math.sin(a) * w.r });
            flaechen.roads.push(
                { pts: ring, w: 2 * VG.halbM + VG.ringRandM },
                { pts: w.bahn.slice(0, 2), w: 2 * VG.halbM },
                { pts: w.bahn.slice(-2), w: 2 * VG.halbM }
            );
            for (const p of w.plaetze) {
                const [fx, fz] = [Math.sin(p.fahrt) * VG.parkL * 0.5, Math.cos(p.fahrt) * VG.parkL * 0.5];
                flaechen.roads.push({
                    pts: [
                        { x: p.x - fx, z: p.z - fz },
                        { x: p.x + fx, z: p.z + fz },
                    ],
                    w: VG.parkB,
                });
            }
        }
        this._stlWegeBuild(flaechen, { x: 0, z: 0 }, "verkehr:" + S.key);
        // DIE SPUREN IM RASTER (`_verkehrAufSpur`): je Zelle die Stücke der Spuren, der Bahn und des Rings jeder Wende
        VK.spurRaster = new Map();
        const stueck = (a, b) => {
            const M = AnazhRealm.BEWOHNER.rasterM;
            for (
                let ix = Math.floor((Math.min(a.x, b.x) - 2) / M);
                ix <= Math.floor((Math.max(a.x, b.x) + 2) / M);
                ix++
            )
                for (
                    let iz = Math.floor((Math.min(a.z, b.z) - 2) / M);
                    iz <= Math.floor((Math.max(a.z, b.z) + 2) / M);
                    iz++
                ) {
                    const k = ix * 2097152 + iz;
                    (VK.spurRaster.get(k) || (VK.spurRaster.set(k, []), VK.spurRaster.get(k))).push(a.x, a.z, b.x, b.z);
                }
        };
        const linie = (P) => {
            for (let i = 1; i < P.length; i++) stueck(P[i - 1], P[i]);
        };
        for (const s of VK.strecken) if (s.fahrbar) s.spur.forEach(linie);
        // und der Weg durch jede Kreuzung (von Spur zu Spur, jeder erlaubte Abbieger)
        for (const [ki, K] of VK.kp.entries())
            for (const si of fahrbarAn(ki))
                for (const so of fahrbarAn(ki)) {
                    if (si === so || (K.verboten || []).includes(si + ">" + so)) continue;
                    const [a, b] = [VK.strecken[si], VK.strecken[so]];
                    const rein = a.b === ki ? a.spur[0] : a.spur[1];
                    const raus = b.a === ki ? b.spur[0] : b.spur[1];
                    if (rein.length && raus.length)
                        linie([rein[rein.length - 1], ...((K.wege || {})[si + ">" + so] || []), raus[0]]);
                }
        for (const w of VK.wenden.values()) {
            linie(w.bahn);
            const ring = [];
            for (let a = 0; a <= 2 * Math.PI + 1e-9; a += 1 / w.r)
                ring.push({ x: w.x + Math.cos(a) * w.r, z: w.z + Math.sin(a) * w.r });
            linie(ring);
        }
        // DIE ORTE, DIE EINER ZUR ZEIT BEFÄHRT: jede Kreuzung (drei und mehr fahrbare Strecken), jede Enge, jede Wende samt Platz
        // und ihren Bahnen bis ans Ende der Strecke (liegt die Wende seitlich des Endes, kreuzen sich die Bahn hinein und heraus:
        // zwei Wagen gegeneinander standen dort Bug an Bug, außerhalb des Kreises)
        const zone = (art, x, z, r, konflikt = []) => {
            const Z = { art, x, z, r, halter: [], richtung: null, warte: [], konflikt };
            VK.zonen.push(Z);
            return Z;
        };
        for (const [ki, K] of VK.kp.entries())
            if (fahrbarAn(ki).length >= 3) VK.kpZone.set(ki, zone("kreuzung", K.x, K.z, K.r, K.konflikt || []));
        // die Enge samt einer Wagenlänge davor (`engeRandM`): wer ihr entgegenkommt, wartet, wo der in ihr an ihm vorbeikommt
        for (const s of VK.strecken)
            s.engZonen = s.fahrbar ? s.engen.map((e) => zone("enge", e.x, e.z, e.r + V.engeRandM)) : [];
        for (const w of VK.wenden.values())
            w.zone = zone(
                "wende",
                w.x,
                w.z,
                Math.max(
                    w.r + VG.halbM + VG.parkRandM + VG.parkB + VG.parkL / 2,
                    ...[w.bahn[0], w.bahn[w.bahn.length - 1]].map((q) => Math.hypot(q.x - w.x, q.z - w.z) + VG.halbM)
                )
            );
        // DIE FAHRER: je Haus des Gesetzes sein erster Bewohner, sein Platz an der nächsten Wende mit freiem Platz
        const seed = S.plan.seed >>> 0;
        for (const [w, si] of von.slots.entries()) {
            const b = S.liste.find((x) => x.seed === `${seed}:${si}:0`);
            if (!b) {
                VK.zahl.ohneFahrer++;
                continue;
            }
            const tuer = b.orte.tuer;
            const wahl = [...VK.wenden.entries()]
                .filter(([, x]) => x.frei.length)
                .sort(
                    (p, q) =>
                        Math.hypot(p[1].x - tuer.x, p[1].z - tuer.z) - Math.hypot(q[1].x - tuer.x, q[1].z - tuer.z)
                )[0];
            if (!wahl) {
                VK.zahl.ohnePlatz++;
                continue;
            }
            const [ki, wende] = wahl;
            const park = wende.frei.shift();
            const gen = this._rollGenome(`${seed}:${si}`, "verkehr");
            const typ = gen.pick("wagen", V.wagen);
            const W = {
                S,
                b,
                nr: w,
                gen,
                typ,
                ki,
                wende,
                park,
                entry: null,
                zustand: "steht",
                heim: false,
                letzter: null,
                zugN: 0,
                F: null,
                T: { gas: 0, bremse: 0, lenken: 0, handbremse: true },
                zonen: [],
                dtAcc: 0,
                takt: w,
                leiber: null,
                vorne: null,
                grund: null,
                warteS: 0,
                stehtS: 0,
                weg: 0,
                ankunft: true,
                sitzt: false,
            };
            // DER FAHRER: seine Rolle und sein Werk — der Stand neben seinem Wagen, auf der Seite fort vom Ring der Wende (nie in
            // seiner Spur), zum Wagen gewandt
            const [ux, uz] = [Math.cos(park.beta), Math.sin(park.beta)];
            const seite = VG.parkB / 2 + V.standM;
            b.rolle = "fahrer";
            b.beruf = "fahrer";
            b.wagen = W;
            b.orte.werk = { x: park.x + ux * seite, z: park.z + uz * seite, blick: Math.atan2(-ux, -uz) };
            if (!this._verkehrWagenStellen(W)) {
                VK.zahl.ohnePlatz++;
                b.wagen = null;
                continue;
            }
            VK.wagen.push(W);
        }
        return VK;
    }

    // LIEGT (x, z) IN DER SPUR EINES WAGENS? Näher als ein halber Wagen samt Kapsel und `spurRandM` an einer Spur, der Bahn oder
    // dem Ring einer Wende (das Raster der Spuren, `VK.spurRaster`). Leser: der Stand der Bewohner (`_bewohnerStandPruefen`).
    _verkehrAufSpur(S, x, z) {
        const VK = S.verkehr;
        const M = AnazhRealm.BEWOHNER.rasterM;
        const l = VK && VK.spurRaster && VK.spurRaster.get(Math.floor(x / M) * 2097152 + Math.floor(z / M));
        if (!l) return false;
        const r =
            globalThis.__fachwerkCore.VERKEHR_GESETZ.halbM +
            AnazhRealm.PLAYER_WALL_RADIUS +
            AnazhRealm.VERKEHR.spurRandM;
        for (let i = 0; i < l.length; i += 4) {
            const [ax, az, bx, bz] = [l[i], l[i + 1], l[i + 2], l[i + 3]];
            const [dx, dz] = [bx - ax, bz - az];
            const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
            if ((x - ax - dx * t) ** 2 + (z - az - dz * t) ** 2 < r * r) return true;
        }
        return false;
    }

    // DER WAGEN STEHT AUF SEINEM PLATZ: das Werk des Gesetzes (`fahrzeug_<typ>`, ausGesetz, präzise — die Wende ist sein Platz),
    // sein Fahr-Zustand auf der Ebene seiner Räder (vehicle-core fahrZustand · fahrStand), seine Lage, sein Bild.
    _verkehrWagenStellen(W) {
        const p = W.park;
        const e = this.spawnArchitecture(
            "fahrzeug_" + W.typ,
            { x: p.x, y: this.getTerrainHeightAt(p.x, p.z) + 0.5, z: p.z },
            {
                seed: Math.floor(W.gen.axis("same") * 4294967296) >>> 0,
                rotationY: p.fahrt - Math.PI / 2,
                silent: true,
                precise: true,
                ausGesetz: true,
            }
        );
        if (!e) return false;
        W.entry = e;
        e._verkehrWagen = W;
        const prof = this._vehicleProfile(e);
        const G = prof && this._fahrSatz(e, prof);
        if (!G) {
            this.removeArchitecture(e, { still: true });
            return false;
        }
        const { vc } = AnazhRealm._fahrSchrittGesetz();
        e._rideYaw = p.fahrt;
        const fz = (e._fahr = vc.fahrZustand(p.x, p.z, p.fahrt - Math.PI / 2));
        vc.fahrStand(fz, G, this._fahrBoden(e), 0);
        if (Number.isFinite(fz.y)) this._wagenLage(e, fz);
        const um = this._fahrUmriss(e);
        [W.hl, W.hw, W.bug] = [(um.bug - um.heck) / 2, um.hw, um.bug];
        this._verkehrBild(e);
        return true;
    }

    // IM BLICK DER KAMERA: die Kugel (Mitte des Wagens, Radius r) schneidet das Frustum der Kamera dieses Schritts (ohne Kamera:
    // ja). Leser: das Bild des Verkehrs (`_verkehrSchritt`).
    _verkehrImBlick(e, r) {
        const cam = this.state.camera;
        if (!cam) return true;
        let B = this._verkehrBlick;
        if (!B) {
            const M = this._verkehrBlickM || (this._verkehrBlickM = new THREE.Matrix4());
            const F = this._verkehrBlickF || (this._verkehrBlickF = new THREE.Frustum());
            F.setFromProjectionMatrix(M.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
            B = this._verkehrBlick = F;
        }
        const K = this._verkehrBlickK || (this._verkehrBlickK = new THREE.Sphere());
        K.center.copy(e.position);
        K.radius = r;
        return B.intersectsSphere(K);
    }

    // DAS BILD DES WAGENS: der EINE Visual-Weg (die Instanz-Matrix des Studio-Wagens samt Rädern, sonst die Gruppen-Pose).
    _verkehrBild(e) {
        if (e.instanced) this._archInstanceUpdate(e);
        else if (e.mesh) this._rittMeshPose(e);
    }

    // DER VERKEHR IM BILD-TAKT (nach den Bewohnern, `_loopWeatherAndGrowth`): wer an seinem Werk steht und dessen Wagen parkt,
    // steigt ein; wessen Soll vom Werk geht, fährt heim; wessen Wagen heimkam, steigt aus. Der Leib am Steuer sitzt, wo der Sitz
    // des Wagens ihn trägt (`_applySeatPose` am Wagen, `_sitzLage`), gezeichnet nur nah (`leibM`).
    _tickVerkehr() {
        const alle = this._bewohnerSiedlungen;
        const pm = this.state.playerMesh;
        if (!alle || !pm) return;
        const V = AnazhRealm.VERKEHR;
        const p = pm.position;
        for (const S of alle.values()) {
            const VK = S.verkehr;
            if (!VK || !VK.wagen.length || !S.liste) continue;
            for (const W of VK.wagen) {
                const b = W.b;
                const g = b.leib;
                if (!g || !W.entry) continue;
                const werk = b.orte.werk;
                if (
                    W.zustand === "steht" &&
                    !b.amSteuer &&
                    b.da &&
                    b.ziel === werk &&
                    Math.hypot(g.position.x - werk.x, g.position.z - werk.z) < V.einsteigM
                )
                    this._verkehrEinsteigen(S, W);
                else if (b.amSteuer && W.zustand === "faehrt" && !W.heim && b.ziel !== werk) this._verkehrHeim(S, W);
                else if (b.amSteuer && W.zustand === "steht") this._verkehrAussteigen(S, b);
                if (!b.amSteuer) continue;
                const e = W.entry;
                const d2 = (e.position.x - p.x) ** 2 + (e.position.z - p.z) ** 2;
                const sicht = d2 < V.leibM * V.leibM;
                if (sicht !== g.visible) g.visible = sicht;
                if (!sicht) {
                    W.sitzt = false;
                    continue;
                }
                this._gelenkStufe(g, d2);
                const sitzH = Number.isFinite(e._sitzHeight) ? e._sitzHeight : AnazhRealm.MOUNT_FOLLOW_HEIGHT;
                g.position.set(e.position.x, e.position.y - 0.5 + sitzH + (e._rideHeave || 0), e.position.z);
                g.rotation.set(0, Number.isFinite(e._rideYaw) ? e._rideYaw : g.rotation.y, 0);
                if (!W.sitzt) {
                    this._applySeatPose(g, 0, e);
                    W.sitzt = true;
                } else this._sitzLage(g, g.userData.rig, e);
                this._leibMatrix(g);
            }
        }
    }

    // DER FAHRER STEIGT EIN: er verlässt das Gedränge (kein Kreis, kein Satz, kein Feld, keine Ankunft im Takt — sein Leib gehört
    // dem Wagen), der Wagen verlässt die Wand der Wege (`_verkehrFaehrt`: ab hier ist er ein Leib mit Vorrang; die Wache
    // erfährt, dass seine Hülle vom Platz ging), und er fährt los — vom Platz über die Wende auf die Trasse. Die ERSTE Fahrt
    // nach der Ankunft der Siedlung beginnt, wo sein Tag ihn sähe (`_verkehrAnkunft`): unterwegs auf seiner Route.
    _verkehrEinsteigen(S, W) {
        const b = W.b;
        const g = b.leib;
        const e = W.entry;
        b.amSteuer = true;
        [b.kreis, b.nah, b.weg, b.drehen, b.vx, b.vz, b.platz] = [false, false, null, null, 0, 0, false];
        g.userData._drinnen = true; // kein Feld trägt ihn (`_kzBesitztFeld`)
        if (g.userData._kzGlieder) for (const gl of g.userData._kzGlieder) this._weltFeldAktiv(gl.handle, false);
        g.visible = false;
        W.sitzt = false;
        this._bewohnerSatzSchreiben(S);
        this._blockerWacheMelden(e._blockerHuelle);
        e._verkehrFaehrt = true;
        W.zustand = "faehrt";
        W.heim = false;
        W.letzter = null;
        this._verkehrLinie(S, W, this._verkehrZuege(S, W), true);
        if (W.ankunft) this._verkehrAnkunft(S, W);
        W.ankunft = false;
    }

    // DIE ERSTE FAHRT (die Ankunft: der Tag ist f(Same, t), auch für den, den keiner sah): der Wagen steht nicht am Platz, sondern
    // so weit auf seiner Route, wie sein Same sagt (`ankunft` × die Länge der Route), mindestens `ankunftAbstandM` von jedem
    // anderen Wagen und außerhalb jedes Orts, den einer zur Zeit befährt — sonst `ankunftSchrittM` weiter, und wo keiner
    // trägt, fährt er vom Platz.
    _verkehrAnkunft(S, W) {
        const V = AnazhRealm.VERKEHR;
        const F = W.F;
        const e = W.entry;
        const fz = e._fahr;
        if (!F || !fz) return;
        // jeder andere Wagen, auch der am Platz (er fährt gleich los oder steht dort bis zum Abend)
        const andere = S.verkehr.wagen.filter((o) => o !== W && o.entry);
        for (
            let s = F.lang * (0.15 + 0.7 * W.gen.axis("ankunft")), n = 0;
            n < 24 && s < F.lang - 30;
            s += V.ankunftSchrittM, n++
        ) {
            let i = 0;
            while (i + 1 < F.pts.length - 1 && F.bogen[i + 1] < s) i++;
            const q = F.pts[i];
            const r = F.pts[i + 1];
            if (andere.some((o) => Math.hypot(o.entry.position.x - q.x, o.entry.position.z - q.z) < V.ankunftAbstandM))
                continue;
            // kein Leib und kein Stand eines Bewohners unter ihm (wer dort steht, geht oder noch hinkommt, stünde in der Hülle)
            const nah = (o) => o && Math.hypot(o.x - q.x, o.z - q.z) < W.hl + 1;
            const unter = (b) =>
                (b.leib && !b.drinnen && !b.amSteuer && nah(b.leib.position)) ||
                nah(b.orte.heim) ||
                nah(b.orte.platz) ||
                nah(b.orte.werk) ||
                nah(b.orte.besuch);
            if (S.liste.some(unter)) continue;
            if (W.zonen.some((z) => s + W.hl >= z.ein - 2 && s - W.hl <= z.aus + 2)) continue;
            const fahrt = Math.atan2(r.x - q.x, r.z - q.z);
            Object.assign(fz, { x: q.x, z: q.z, yaw: fahrt - Math.PI / 2, vlong: 0, vlat: 0, yawRate: 0, y: NaN });
            e._rideYaw = fahrt;
            e.position.x = q.x;
            e.position.z = q.z;
            const { vc } = AnazhRealm._fahrSchrittGesetz();
            vc.fahrStand(fz, e._fahrSatz, this._fahrBoden(e), 0);
            if (Number.isFinite(fz.y)) this._wagenLage(e, fz);
            this._blockerBewegt(e);
            if (e.blockerAABBs) this._populateBlockerAABBs(e);
            [F.i, F.s] = [i, F.bogen[i]];
            W.ankunftOrt = { x: q.x, z: q.z, s: Math.round(s) };
            for (const z of W.zonen) if (z.aus + W.hl < s) z.weg = true;
            this._verkehrBild(e);
            return;
        }
    }

    // DER FAHRER FÄHRT HEIM (sein Soll ging vom Werk): die Route, die er voraus hat, fährt er zu Ende; was sie danach verlängert,
    // ist der kürzeste Weg über die fahrbaren Strecken zur Wende seines Platzes und dort in den Platz (`_verkehrZuege`).
    _verkehrHeim(S, W) {
        W.heim = true;
        W.heimWeg = this._verkehrHeimWeg(S, W);
    }

    // DER FAHRER STEIGT AUS (der Wagen steht auf seinem Platz — oder sofort: die Uhr sprang, `_tickBewohner` stellt ihn neu): der
    // Wagen wird wieder Wand (die Wache erfährt seinen Stand), der Leib steht neben der Tür (sein Werk, `orte.werk`) in der
    // Ruhe der Vorlage und gehört wieder dem Gedränge; sein Weg beginnt dort (`stand`).
    _verkehrAussteigen(S, b, sofort = false) {
        const W = b.wagen;
        if (!W) return;
        if (sofort && W.zustand === "faehrt") {
            const e = W.entry;
            const fz = e._fahr;
            const p = W.park;
            Object.assign(fz, { x: p.x, z: p.z, yaw: p.fahrt - Math.PI / 2, vlong: 0, vlat: 0, yawRate: 0, y: NaN });
            e._rideYaw = p.fahrt;
            e.position.x = p.x;
            e.position.z = p.z;
            const { vc } = AnazhRealm._fahrSchrittGesetz();
            vc.fahrStand(fz, e._fahrSatz, this._fahrBoden(e), 0);
            if (Number.isFinite(fz.y)) this._wagenLage(e, fz);
            this._verkehrParken(S, W);
            W.ankunft = true; // die Uhr sprang: seine nächste Fahrt beginnt, wo sein Tag ihn sähe
        }
        const g = b.leib;
        b.amSteuer = false;
        if (!g) return;
        const rig = g.userData.rig;
        if (rig && rig._sitzLage) this._sitzLageLoesen(rig);
        this._animateHuman(g, 0, 0, false, false, null);
        const werk = b.orte.werk;
        this._bewohnerStellen(b, g, werk.x, werk.z);
        g.rotation.set(0, werk.blick, 0);
        g.userData._drinnen = false;
        g.visible = false;
        this._leibMatrix(g);
        Object.assign(b, { stand: werk, da: b.ziel === werk, weg: null, tagVon: null, zielUhr: NaN, lageNeu: true });
        W.sitzt = false;
    }

    // DER WAGEN PARKT: er steht (Federn null, die Ebene seiner Räder), seine Orte gibt er frei, er wird Wand der Wege.
    _verkehrParken(S, W) {
        const e = W.entry;
        const fz = e._fahr;
        fz.vlong = fz.vlat = fz.yawRate = fz.vy = 0;
        fz.fNick = fz.fNickV = fz.fWank = fz.fWankV = fz.fHub = fz.fHubV = 0;
        for (const Z of S.verkehr.zonen) {
            AnazhRealm._verkehrLos(Z, W);
            const k = Z.warte.indexOf(W);
            if (k >= 0) Z.warte.splice(k, 1);
        }
        W.zustand = "steht";
        W.zonen = [];
        W.letzter = null;
        W.F = null;
        e._verkehrFaehrt = false;
        this._blockerBewegt(e);
        if (e.blockerAABBs) {
            this._populateBlockerAABBs(e);
            e._blockerStampAt = null;
        }
        this._verkehrBild(e);
    }

    // DIE ROUTE IM VORAUS: die nächsten Züge (Strecke in einer Richtung, Wende, aus dem Platz, in den Platz) nach dem letzten
    // (`W.letzter`; keiner: aus dem Platz), bis `vorausM` Meter neu sind. Nach einer Strecke an einer Kreuzung wählt der Same eine
    // der anderen fahrbaren Strecken (nie zurück), am Ende die Wende; heim (`W.heimWeg`) der kürzeste Weg zur Wende seines
    // Platzes, dort hinein — dann endet die Route.
    _verkehrZuege(S, W) {
        const V = AnazhRealm.VERKEHR;
        const VK = S.verkehr;
        const neu = [];
        let vor = 0;
        const legen = (m) => {
            m.pts = this._verkehrZugPunkte(S, W, m);
            m.zonen = this._verkehrZugZonen(S, m);
            for (let i = 1; i < m.pts.length; i++)
                vor += Math.hypot(m.pts[i].x - m.pts[i - 1].x, m.pts[i].z - m.pts[i - 1].z);
            neu.push((W.letzter = m));
        };
        if (!W.letzter) legen({ art: "aus", ki: W.ki });
        for (let n = 0; vor < V.vorausM && n < 64 && W.letzter.art !== "ein"; n++) {
            const m = W.letzter;
            if (m.art === "aus" || m.art === "wende") {
                const si = VK.kp[m.ki].strecken.find((x) => VK.strecken[x].fahrbar);
                legen({ art: "strecke", si, dir: VK.strecken[si].a === m.ki ? 0 : 1 });
                continue;
            }
            const s = VK.strecken[m.si];
            const ki = m.dir === 0 ? s.b : s.a;
            if (VK.kp[ki].ende) {
                legen(W.heim && ki === W.ki ? { art: "ein", ki } : { art: "wende", ki });
                continue;
            }
            const verboten = VK.kp[ki].verboten || [];
            const an = VK.kp[ki].strecken.filter(
                (x) => x !== m.si && VK.strecken[x].fahrbar && !verboten.includes(m.si + ">" + x)
            );
            let si = W.heim && W.heimWeg ? W.heimWeg.get(ki) : undefined;
            if (si === undefined || !an.includes(si))
                si = an[Math.floor(W.gen.axis("zug" + W.zugN++) * an.length) % an.length];
            if (si === undefined) break;
            // durch die Kreuzung der Weg des Gesetzes (gerade oder im Kreisel, `wege`)
            const vor = (VK.kp[ki].wege || {})[m.si + ">" + si] || [];
            legen({ art: "strecke", si, dir: VK.strecken[si].a === ki ? 0 : 1, vor, von: m.si });
        }
        return neu;
    }

    // DER WEG HEIM: je Knotenpunkt die Strecke, über die der kürzeste Weg zur Wende seines Platzes geht (Dijkstra von ihr aus).
    _verkehrHeimWeg(S, W) {
        const VK = S.verkehr;
        const n = VK.kp.length;
        const dist = new Float64Array(n).fill(Infinity);
        const ueber = new Map();
        const offen = [W.ki];
        dist[W.ki] = 0;
        while (offen.length) {
            offen.sort((a, b) => dist[b] - dist[a]);
            const k = offen.pop();
            for (const si of VK.kp[k].strecken) {
                const s = VK.strecken[si];
                if (!s.fahrbar) continue;
                const j = s.a === k ? s.b : s.a;
                const d = dist[k] + s.laenge;
                if (d < dist[j]) {
                    dist[j] = d;
                    ueber.set(j, si);
                    offen.push(j);
                }
            }
        }
        return ueber;
    }

    // DIE PUNKTE EINES ZUGS: die Spur der Strecke in seiner Richtung; die Bahn der Wende; aus dem Platz (vorwärts auf den Kreis,
    // den Bogen bis zur Spur heraus) und in ihn (die Spur hinein, den Bogen bis vor den Platz, auf ihn).
    _verkehrZugPunkte(S, W, m) {
        const VK = S.verkehr;
        if (m.art === "strecke") return (m.vor || []).concat(VK.strecken[m.si].spur[m.dir]);
        const w = VK.wenden.get(m.ki);
        if (m.art === "wende") return w.bahn;
        const pk = W.park;
        const kreis = (a) => ({ x: w.x + Math.cos(a) * w.r, z: w.z + Math.sin(a) * w.r });
        const um = (a, b) => {
            let d = (b - a) * w.dreh;
            d -= Math.floor(d / (2 * Math.PI)) * 2 * Math.PI;
            return d;
        };
        const schritt = AnazhRealm.VERKEHR.platzBogenM / w.r;
        const pts = [];
        if (m.art === "aus") {
            const a0 = pk.beta + w.dreh * schritt;
            const span = um(a0, w.aout);
            pts.push({ x: pk.x, z: pk.z });
            for (let t = 0; t <= span + 1e-9; t += 1 / w.r) pts.push(kreis(a0 + w.dreh * t));
            pts.push(w.bahn[w.bahn.length - 1]);
            return pts;
        }
        const a1 = pk.beta - w.dreh * schritt;
        const span = um(w.ain, a1);
        pts.push(w.bahn[0]);
        for (let t = 0; t <= span + 1e-9; t += 1 / w.r) pts.push(kreis(w.ain + w.dreh * t));
        pts.push({ x: pk.x, z: pk.z });
        pts.push({ x: pk.x + Math.sin(pk.fahrt) * 0.6, z: pk.z + Math.cos(pk.fahrt) * 0.6 });
        return pts;
    }

    // DIE ORTE EINES ZUGS, die einer zur Zeit befährt (in seiner Folge, je Ort {Z, dir}): die Kreuzung an seinem Anfang (durch sie
    // führt sein Weg, `vor` — so liegt sie in derselben Linie wie der Zug, der sie durchfährt), dann die Engen der Strecke in ihrer
    // Richtung (dir: wer in derselben Richtung fährt, folgt dem, der schon darin ist); die Wende samt Platz.
    _verkehrZugZonen(S, m) {
        const VK = S.verkehr;
        if (m.art !== "strecke") return [{ Z: VK.wenden.get(m.ki).zone, dir: null }];
        const s = VK.strecken[m.si];
        const ki = m.dir === 0 ? s.a : s.b;
        // (durch die Kreuzung sein Weg `wort`, von>nach: wer einen verträglichen fährt, fährt zugleich — `_verkehrZonen`)
        const z = VK.kpZone.has(ki)
            ? [{ Z: VK.kpZone.get(ki), dir: null, wort: m.von === undefined ? null : m.von + ">" + m.si }]
            : [];
        for (const Z of m.dir === 0 ? s.engZonen : s.engZonen.slice().reverse()) z.push({ Z, dir: m.dir });
        return z;
    }

    // DIE LINIE DES FAHRERS (`_fahrerLinie`, dieselbe wie am Steuer des Spielers) aus den Punkten der neuen Züge — am Anfang der
    // Fahrt sie allein (`anfang`), sonst ab dem Wagen der Rest der alten Linie und dahinter sie; ihre Orte (je Ort Ein- und
    // Ausfahrt auf der Linie, in ihrer Folge): die Orte vor ihm, die er noch nicht hinter sich hat, dann die der neuen Züge. Was
    // er hält und nicht mehr vor sich hat, gibt er frei.
    // Jeder Ort gilt im Fenster seines Zugs (`von`–`bis`, Meter der Punkte): die Kreuzung am Ende ihrer Strecke samt dem Weg durch
    // sie, die Enge in ihrer Strecke, die Wende in ihrem Zug — wer an einem Ort vorbeistreift, ehe er ihn durchfährt, fährt dort
    // nicht ohne Schlüssel hindurch.
    _verkehrLinie(S, W, zuege, anfang) {
        const e = W.entry;
        const alt = W.F;
        const pts = [];
        const Z = [];
        let L = 0;
        const dazu = (q) => {
            const p = pts[pts.length - 1];
            if (p) L += Math.hypot(q.x - p.x, q.z - p.z);
            pts.push(q);
        };
        if (!anfang && alt) {
            dazu({ x: e.position.x, z: e.position.z });
            for (let i = alt.i + 2; i < alt.pts.length; i++) dazu(alt.pts[i]);
            for (const z of W.zonen)
                if (!z.weg)
                    Z.push({
                        Z: z.Z,
                        dir: z.dir,
                        wort: z.wort,
                        von: Math.max(0, z.ein - alt.s) - 3,
                        bis: z.aus - alt.s + 3,
                    });
        }
        for (const m of zuege) {
            const von = L - 3;
            for (const q of m.pts) dazu(q);
            for (const z of m.zonen)
                if (!Z.length || Z[Z.length - 1].Z !== z.Z)
                    Z.push({ Z: z.Z, dir: z.dir, wort: z.wort, von, bis: L + 2 * z.Z.r + 5 });
        }
        const F = this._fahrerLinie(pts);
        if (!F) return;
        W.F = F;
        const vorher = W.zonen;
        W.zonen = [];
        for (const { Z: z, dir, wort, von, bis } of Z) {
            let i = 0;
            while (i < F.pts.length && F.bogen[i] < von) i++;
            while (i < F.pts.length && F.bogen[i] <= bis && Math.hypot(F.pts[i].x - z.x, F.pts[i].z - z.z) >= z.r) i++;
            if (i >= F.pts.length || F.bogen[i] > bis) continue;
            let j = i;
            while (j + 1 < F.pts.length && Math.hypot(F.pts[j + 1].x - z.x, F.pts[j + 1].z - z.z) < z.r) j++;
            W.zonen.push({ Z: z, dir, wort, ein: F.bogen[i], aus: F.bogen[j], weg: false });
        }
        W.zonen.sort((a, b) => a.ein - b.ein);
        for (const a of vorher) if (!W.zonen.some((z) => z.Z === a.Z)) AnazhRealm._verkehrLos(a.Z, W);
    }

    // DER VERKEHR IM SIM-SCHRITT (`_stepFixedSim`, nach dem Nachlauf): je fahrendem Wagen nach seiner Stufe der Leiter (die Ferne
    // spart Aufrufe, nie Zeit — derselbe Schritt mit der gesammelten Zeit) der Fahrer (Folge, Orte, `_fahrerSchritt`), der EINE
    // Fahr-Schritt des Kerns, die Lage und das Bild; vorn hängt die Route ihre nächsten Züge an, heim parkt der Wagen am Ende.
    _verkehrSchritt(dt) {
        const alle = this._bewohnerSiedlungen;
        const pm = this.state.playerMesh;
        if (!alle || !pm) return;
        this._verkehrBlick = null; // das Frustum der Kamera, einmal je Schritt (`_verkehrImBlick`)
        const V = AnazhRealm.VERKEHR;
        const { vc } = AnazhRealm._fahrSchrittGesetz();
        const p = pm.position;
        const pl = this.state.player;
        for (const S of alle.values()) {
            const VK = S.verkehr;
            if (!VK || !VK.wagen.length) continue;
            for (const W of VK.wagen) {
                const e = W.entry;
                if (W.zustand !== "faehrt" || !e || !e._fahr || !W.F) continue;
                if (pl && pl.mountedArch === e.id) continue; // der Spieler sitzt am Steuer: der Ritt führt
                W.dtAcc += dt;
                const d2 = (e.position.x - p.x) ** 2 + (e.position.z - p.z) ** 2;
                let k = 1;
                for (const [m, n] of V.leiter) if (d2 >= m * m) k = n;
                if ((W.takt = (W.takt + 1) % k) !== 0) continue;
                const h = W.dtAcc;
                W.dtAcc = 0;
                const F = W.F;
                // DER FAHRER SIEHT (Folge, Orte) nah jeden `folgeTakt`-ten Schritt und LENKT jeden `denkTakt`-ten — die Physik und
                // das Bild tragen jeden (Lehre 25: 50 ms Blick bei 30 km/h sind 0,42 m, die Haltelinie fragt `frageM` voraus; der
                // Wagen fährt glatt, Sehen und Lenken kosten ein Drittel und die Hälfte); fern jeden seiner Schritte der Leiter
                W.folgeH = (W.folgeH || 0) + h;
                if (k > 1 || (W.folgeN = ((W.folgeN || 0) + 1) % V.folgeTakt) === 0) {
                    F.deckel = this._verkehrFolge(S, W, p, W.folgeH);
                    W.folgeH = 0;
                }
                if (k > 1 || (W.denk = ((W.denk || 0) + 1) % V.denkTakt) === 0)
                    this._fahrerSchritt(W.T, F, e, e.position);
                const fz = e._fahr;
                const x0 = fz.x;
                const z0 = fz.z;
                // nah die volle Hülle (`huelleM`), je Schritt die Boxen (`genauM`) und jedes Rad auf seinem Boden (`radFeinM`); fern
                // die Spur des Gesetzes. Wer steht und kein Gas gibt, schiebt nichts: keine Hülle, keine Boxen, kein neues Bild
                // (Lehre 25 — in der Warteschlange stand die Hälfte der Stadt und zahlte je Schritt wie ein Fahrender)
                // Wer schon einen Schritt ruht (die Handbremse hält ihn, der Kern trüge ihn nirgends hin), rechnet keine Kräfte und
                // keinen Stand, bis sein Fahrer wieder Gas gibt (Gebot 7: Kosten an Änderung)
                const ruht = fz.speed < V.ruheMs && !(W.T.gas > 0);
                let gegner = null;
                if (!(ruht && W.bildRuht && W.T.handbremse)) {
                    e._radGrob = d2 >= V.radFeinM * V.radFeinM;
                    gegner = this._wagenSchritt(
                        e,
                        { throttle: W.T.gas, brake: W.T.bremse, steer: W.T.lenken, hand: W.T.handbremse },
                        h,
                        !ruht && d2 < V.genauM * V.genauM,
                        !ruht && d2 < V.huelleM * V.huelleM,
                        d2 < V.huelleM * V.huelleM ? 0.5 : V.boxFernM
                    );
                    vc.fahrStand(fz, e._fahrSatz, this._fahrBoden(e), h);
                    if (Number.isFinite(fz.y)) this._wagenLage(e, fz);
                    e._rideSteerYaw = fz.steer;
                }
                // DAS BILD zahlt, wer sich bewegte und im Blick ist (Gebot 7: Kosten an Schirm und Änderung) — wer außer Blick
                // fuhr, zeichnet nach, sobald er hineinkommt
                W.bildAlt = W.bildAlt || !ruht || !W.bildRuht;
                W.bildRuht = ruht;
                if (W.bildAlt && (d2 < V.blickNahM * V.blickNahM || this._verkehrImBlick(e, W.hl + 1))) {
                    this._verkehrBild(e);
                    W.bildAlt = false;
                }
                const dw = Math.hypot(fz.x - x0, fz.z - z0);
                W.weg += dw;
                VK.zahl.km += dw / 1000;
                if (gegner)
                    for (const o of gegner) {
                        const art = o && o._verkehrWagen ? "wagen" : o && o.isObject3D ? "leib" : "bau";
                        VK.zahl.stoss[art]++;
                    }
                // WER STECKT: steht er ohne Grund (kein Wagen, kein Leib, kein Ort vor ihm), zählt die Zeit; über `festS` ein Fall
                if (fz.speed < V.parkMs && !W.grund && !F.ende) {
                    if ((W.stehtS += h) > V.festS && !W.festOrt) {
                        W.festOrt = {
                            x: Math.round(fz.x * 10) / 10,
                            z: Math.round(fz.z * 10) / 10,
                            s: Math.round(F.s),
                        };
                        VK.zahl.fest++;
                    }
                } else [W.stehtS, W.festOrt] = [0, null];
                // die Route voraus: trägt die Linie keine `vorausM` / 2 mehr, hängen die nächsten Züge an
                if (W.letzter && W.letzter.art !== "ein" && F.lang - F.s < V.vorausM / 2)
                    this._verkehrLinie(S, W, this._verkehrZuege(S, W), false);
                if (W.heim && F.ende && fz.speed < V.parkMs) this._verkehrParken(S, W);
            }
        }
    }

    // DER DECKEL DES FAHRERS (m/s): das Tempo der Stadt (`tempoMs`), der Wagen vor ihm in seiner Spur (der Weg bis zu seinem Heck
    // samt `abstandM`, sein Tempo und der Bremsweg `bremsMs2`), wer in seiner Spur steht oder geht (Bewohner, Spieler: bis
    // `abstandM` vor ihm hält er; wer steht, macht ihm nach `platzS` Platz, `_bewohnerPlatz`), und der nächste Ort, den einer zur
    // Zeit befährt (`_verkehrZonen`).
    _verkehrFolge(S, W, sp, h) {
        const V = AnazhRealm.VERKEHR;
        const F = W.F;
        const e = W.entry;
        const fz = e._fahr;
        const v = Math.max(0, fz.vlong);
        let deckel = V.tempoMs;
        W.grund = null;
        // das Fenster der Linie voraus: von F.i bis folgeM
        let j1 = F.i;
        while (j1 + 1 < F.pts.length && F.bogen[j1 + 1] < F.s + V.folgeM) j1++;
        // ein Punkt (x, z) auf der Linie voraus zwischen den Punkten `vonI` und `bisI`: Weg und Abstand quer (null: nicht im
        // Fenster)
        const auf = (x, z, bisI = j1, vonI = F.i) => {
            let [bq, bs, bi] = [Infinity, 0, -1];
            for (let i = vonI; i < bisI; i++) {
                const a = F.pts[i];
                const b = F.pts[i + 1];
                const dx = b.x - a.x;
                const dz = b.z - a.z;
                const l2 = dx * dx + dz * dz || 1;
                const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / l2));
                const qx = x - a.x - dx * t;
                const qz = z - a.z - dz * t;
                const q2 = qx * qx + qz * qz;
                if (q2 < bq) {
                    bq = q2;
                    bs = F.bogen[i] + t * Math.sqrt(l2);
                    bi = i;
                }
            }
            return bi < 0 ? null : { s: bs, quer: Math.sqrt(bq), i: bi };
        };
        // er hält `abstandM` hinter dem Punkt, an dem der vor ihm hielte (v² = vO² + 2·b·(Lücke − Abstand); wer näher ist als der
        // Abstand, fährt langsamer als der vor ihm, im Maß der Lücke — ohne Lücke steht er, nie in ihn)
        const halt = (gap, vO, grund) => {
            const w =
                gap > V.abstandM
                    ? Math.sqrt(vO * vO + 2 * V.bremsMs2 * (gap - V.abstandM))
                    : gap > 0
                      ? vO * (gap / V.abstandM)
                      : 0;
            if (w < deckel) [deckel, W.grund] = [w, grund];
        };
        // DER WAGEN VOR IHM: nur wer in der Hülle des Fensters steht (samt seiner halben Länge und der Bahn), wird gefragt.
        // In der Kurve schert der starre Wagen um l²·κ/2 aus seiner Bahn (κ: die schärfste Krümmung im Fenster, höchstens die des
        // Wendekreises `kurveR`; die gemittelte Krümmung der Linie zählt doppelt) — so viel breiter ist seine Bahn dort (bis hier
        // streifte er im Ring der Wende den Wagen am Platz, in der Kreuzung den Stehenden an ihrer Innenseite)
        W.vorne = null;
        let [hx0, hx1, hz0, hz1] = [Infinity, -Infinity, Infinity, -Infinity];
        let kMax = 0;
        for (let i = F.i; i <= j1; i++) {
            const q = F.pts[i];
            [hx0, hx1, hz0, hz1] = [Math.min(hx0, q.x), Math.max(hx1, q.x), Math.min(hz0, q.z), Math.max(hz1, q.z)];
            if (F.k[i] > kMax) kMax = F.k[i];
        }
        const rund = (W.hl * W.hl * Math.min(2 * kMax, 1 / globalThis.__fachwerkCore.VERKEHR_GESETZ.kurveR)) / 2;
        const rand = W.hw + V.seitM + 3;
        for (const O of S.verkehr.wagen) {
            if (O === W || !O.entry) continue;
            const o = O.entry;
            if (
                o.position.x < hx0 - rand ||
                o.position.x > hx1 + rand ||
                o.position.z < hz0 - rand ||
                o.position.z > hz1 + rand
            )
                continue;
            // sein Rechteck (er kann quer stehen: in der Kreuzung, am Platz, einscherend): die Ecke, die auf der Linie vor seiner
            // Mitte am nächsten liegt und quer in seiner Bahn (`seitM`; wer ihm entgegenkommt, fährt in seiner eigenen Spur — die
            // Enge befährt einer zur Zeit: er fährt an ihm vorbei, solange zwischen beiden `begegnungM` bleibt). Bis hier zählte
            // nur die Mitte des anderen vor der seinen: wer vom Platz neben ihm einscherte, blieb unsichtbar (103 Berührungen in 40 s)
            // (der billige Filter zuerst: seine Mitte fern der Linie, dann die Ecken nur im Stück um ihren Fußpunkt — Lehre 25)
            const c = auf(o.position.x, o.position.z);
            if (!c || c.quer > O.hl + W.hw + rund + V.seitM) continue;
            const [von, bis] = [Math.max(F.i, c.i - V.eckeStueck), Math.min(j1, c.i + V.eckeStueck + 1)];
            const ry = Number.isFinite(o._rideYaw) ? o._rideYaw : 0;
            const [fx, fzz] = [Math.sin(ry), Math.cos(ry)];
            let a = null;
            let lt = 0;
            for (let ek = 0; ek < 5; ek++) {
                const [u, w] = AnazhRealm._verkehrEcken[ek];
                const q = auf(
                    o.position.x + fx * O.hl * u + fzz * O.hw * w,
                    o.position.z + fzz * O.hl * u - fx * O.hw * w,
                    bis,
                    von
                );
                if (!q || q.s <= F.s || (a && q.s >= a.s)) continue;
                const b = F.pts[Math.min(F.pts.length - 1, q.i + 1)];
                const t = Math.atan2(b.x - F.pts[q.i].x, b.z - F.pts[q.i].z);
                if (q.quer > W.hw + rund + (Math.cos(ry - t) < -0.5 ? V.begegnungM : V.seitM)) continue;
                [a, lt] = [q, t];
            }
            if (!a) continue;
            const of = o._fahr;
            const vO = of && O.zustand === "faehrt" ? Math.max(0, of.vlong * Math.cos(ry - lt)) : 0;
            const gap = a.s - F.s - W.hl;
            if (!W.vorne || gap < W.vorne.gap) W.vorne = { gap, v: vO, s: a.s, O };
            halt(gap, vO, "wagen");
        }
        // WER IN DER SPUR STEHT ODER GEHT: die Bewohner im Raster um das Fenster, der Spieler
        // (nur vor seinem Bug: wer neben ihm geht, weicht ihm selbst — `_verkehrImRaster`)
        const R = AnazhRealm.PLAYER_WALL_RADIUS;
        // wer vor ihm in seiner Richtung geht, dem folgt er in dessen Tempo (der Gang längs der Linie); wer steht oder entgegen
        // kommt, vor dem hält er
        const pruefe = (x, z, leib, vx, vz) => {
            const a = auf(x, z, jL);
            if (!a || a.s <= F.s + W.hl - R || a.quer > W.hw + R + V.seitM + rund) return;
            const gap = a.s - F.s - W.hl - R;
            const b = F.pts[Math.min(F.pts.length - 1, a.i + 1)];
            const l = Math.hypot(b.x - F.pts[a.i].x, b.z - F.pts[a.i].z) || 1;
            halt(gap, Math.max(0, ((vx || 0) * (b.x - F.pts[a.i].x) + (vz || 0) * (b.z - F.pts[a.i].z)) / l), "leib");
            // Platz verlangt er von dem, der ihn `platzS` lang hält — dem Stehenden wie dem Gehenden, der nicht aus der Bahn kommt
            // (ein langsamer Gänger hielt die Enge 30 s, sechs Wagen dahinter) — gegen die Bahn AM ORT des Leibs (das Stück der
            // Linie um seinen Fußpunkt, je `platzBahnM` davor und dahinter): bis hier galt die Sehne vom Wagen bis zum Ende des
            // Fensters — in der Kurve der Kreuzung lag der Platz „daneben" wieder auf der Bahn, der Bewohner stand dort, der Wagen
            // wartete ewig
            if (leib && gap < V.abstandM + 1 && v < 0.5 && (W.warteS += h) > V.platzS && !leib.platz) {
                let [i0, i2] = [a.i, a.i + 1];
                while (i0 > 0 && F.bogen[a.i] - F.bogen[i0] < V.platzBahnM) i0--;
                while (i2 < F.pts.length - 1 && F.bogen[i2] - F.bogen[a.i] < V.platzBahnM) i2++;
                const q = F.pts[i2];
                const fuer = W.platzLeib || (W.platzLeib = { leib: e, weg: [q], wi: 0, drinnen: false, kF: 0 });
                [fuer.weg[0], fuer.kF] = [q, W.hw + R + V.seitM + rund];
                this._bewohnerPlatz(S, leib, F.pts[i0], q, fuer, fuer.kF);
            }
        };
        // die Leiber zählen nur bis zu seinem Bremsweg samt Abstand voraus (Lehre 25): je Zelle des Rasters längs der Linie
        // dort, nie das Rechteck des ganzen Fensters
        const BW = AnazhRealm.BEWOHNER;
        const RS = S.raster;
        const bis = F.s + W.hl + (v * v) / (2 * V.bremsMs2) + V.abstandM + V.leuteRandM;
        let jL = F.i;
        while (jL < j1 && F.bogen[jL] <= bis + BW.rasterM) jL++;
        if (RS && j1 > F.i) {
            // die Zellen des Rasters über der Hülle der Linie bis dorthin samt Bahn
            let [lx0, lx1, lz0, lz1] = [Infinity, -Infinity, Infinity, -Infinity];
            for (let i = F.i; i <= jL; i++) {
                const q = F.pts[i];
                if (q.x < lx0) lx0 = q.x;
                if (q.x > lx1) lx1 = q.x;
                if (q.z < lz0) lz0 = q.z;
                if (q.z > lz1) lz1 = q.z;
            }
            const r2 = W.hw + R + V.seitM + rund;
            const M = BW.rasterM;
            for (let ix = Math.floor((lx0 - r2) / M); ix <= Math.floor((lx1 + r2) / M); ix++)
                for (let iz = Math.floor((lz0 - r2) / M); iz <= Math.floor((lz1 + r2) / M); iz++)
                    for (const o of RS.get(ix * 2097152 + iz) || []) {
                        if (o.wagen || !o.leib || o.drinnen) continue;
                        const lp = o.leib.position;
                        if (lp.x < lx0 - r2 || lp.x > lx1 + r2 || lp.z < lz0 - r2 || lp.z > lz1 + r2) continue;
                        pruefe(lp.x, lp.z, o, o.vx, o.vz);
                    }
        }
        const sa = this._spielerLageAlt;
        if (sp && !(this.state.player && this.state.player.mountedArch === e.id))
            pruefe(sp.x, sp.z, null, sa ? sa.vx : 0, sa ? sa.vz : 0);
        if (W.grund !== "leib" || v >= 0.5) W.warteS = 0;
        // DIE ORTE, DIE EINER ZUR ZEIT BEFÄHRT
        const z = this._verkehrZonen(S, W, v);
        if (z < deckel) [deckel, W.grund] = [z, "ort"];
        return deckel;
    }

    // DER SCHLÜSSEL DER ORTE (Kreuzung, Enge, Wende): wer einen Ort hinter sich hat, gibt ihn frei; vor dem nächsten fragt er ihn,
    // sobald sein Bremsweg samt `frageM` an dessen Haltelinie (`vorM` vor der Einfahrt) reicht — mit den Orten, die gleich
    // dahinter folgen (näher als zwei Wagen samt Abstand: er hält nie zwischen ihnen), in der Reihe der Wartenden, nur wenn
    // hinter dem letzten Platz für ihn ist (der Wagen vor ihm). Bekommt er ihn nicht, hält er an der Linie (der Deckel).
    _verkehrZonen(S, W, v) {
        const V = AnazhRealm.VERKEHR;
        const F = W.F;
        const vor = F.s + W.hl;
        for (const z of W.zonen)
            if (!z.weg && F.s - W.hl > z.aus) {
                z.weg = true;
                AnazhRealm._verkehrLos(z.Z, W);
            }
        const i0 = W.zonen.findIndex((z) => !z.weg);
        if (i0 < 0) return Infinity;
        const z0 = W.zonen[i0];
        if (z0.Z.halter.includes(W)) return Infinity;
        const dEin = z0.ein - V.vorM - vor;
        if (dEin > (v * v) / (2 * V.bremsMs2) + V.frageM) return Infinity;
        const kette = [z0];
        for (let k = i0 + 1; k < W.zonen.length; k++) {
            const z = W.zonen[k];
            if (z.ein - kette[kette.length - 1].aus < 2 * W.hl + V.abstandM) kette.push(z);
            else break;
        }
        const Z = z0.Z;
        Z.warte = Z.warte.filter((o) => o.zustand === "faehrt" && o.zonen.some((z) => z.Z === Z && !z.weg));
        const ende = kette[kette.length - 1].aus;
        const platz = !W.vorne || W.vorne.s > ende + 2 * W.hl + V.abstandM || W.vorne.v > 1;
        // wer schon im Ort steht (seine Einfahrt hinter seinem Bug: vom Platz an der Wende, nach einem Halt in ihr), muss hinaus —
        // ihn hält die Reihe der Wartenden nicht (bis hier wartete er hinter dem Kopf der Reihe, dem er selbst im Weg stand:
        // sieben Wagen an einer Wende, keiner hielt den Schlüssel)
        const drinnen = z0.ein <= vor;
        // VERTRÄGLICH sind zwei Wege durch dieselbe Kreuzung, die das Gesetz zugleich fahren lässt (fachwerk `konflikt`)
        const vertraeglich = (z, o) => {
            if (z.Z.art !== "kreuzung" || !z.wort) return false;
            const q = o.zonen.find((y) => y.Z === z.Z && !y.weg);
            return !!(q && q.wort && !z.Z.konflikt.includes(z.wort + "|" + q.wort));
        };
        // frei ist ein Ort, den keiner hält, den nur er hält, eine Enge, durch die schon einer in seiner Richtung fährt, oder eine
        // Kreuzung, deren Halter alle verträgliche Wege fahren (bis hier einer zur Zeit: an der Mitte der Metropole kam in 40 s
        // nicht jeder 30 m weit)
        const darf = (z) =>
            !z.Z.halter.length ||
            z.Z.halter.every((o) => o === W || vertraeglich(z, o)) ||
            (z.Z.art === "enge" && z.Z.richtung === z.dir);
        // der Kopf der Reihe: der erste Wartende, vor dem keiner in seiner Spur auf denselben Ort wartet (bis hier stand an der
        // Spitze, wer zuerst fragte — auch hinter einem, der nach ihm kam: beide warteten aufeinander)
        const kopf = Z.warte.find((o) => o === W || !(o.vorne && Z.warte.includes(o.vorne.O)));
        // vor dem Kopf vorbei nur, wer ihm nicht im Weg ist (verträglich mit ihm: der Kopf wartet nie länger seinetwegen)
        if (kette.every(darf) && (drinnen || !kopf || kopf === W || vertraeglich(z0, kopf)) && platz) {
            for (const z of kette) {
                if (!z.Z.halter.includes(W)) z.Z.halter.push(W);
                z.Z.richtung = z.dir;
            }
            const k = Z.warte.indexOf(W);
            if (k >= 0) Z.warte.splice(k, 1);
            return Infinity;
        }
        if (!Z.warte.includes(W)) Z.warte.push(W);
        return Math.sqrt(2 * V.bremsMs2 * Math.max(0, dEin));
    }

    // DER BODEN DER SPUR (Lehre 14 und 25: der Takt kostet, was ihn betrifft): die Wagen einer Stadt fahren dieselben Spuren —
    // der Boden ihrer Räder (`_fahrBoden`, der EINE Boden des Fahr-Schritts) gemerkt im Raster von `bodenM`, je Punkt bilinear
    // aus seinen vier Ecken (jede einmal gefragt, solange kein Edit den Boden ändert: `_editGenZaehler`). Bis hier fragte jeder
    // Schritt jedes Rads die Säule (`_koerperBodenUnter` 0,04 ms — in der Metropole 3 ms je Schritt).
    _verkehrBoden(S, e) {
        const VK = S.verkehr;
        this._voxelEditKarte(); // trägt jeden neuen Edit nach: sein Zähler ist der Stand des Bodens
        const gen = this._editGenZaehler | 0;
        const B = VK.boden && VK.boden.gen === gen ? VK.boden : (VK.boden = { gen, karte: new Map() });
        if (e._verkehrBodenFn && e._verkehrBodenKarte === B) return e._verkehrBodenFn;
        e._verkehrBodenKarte = B;
        const roh = this._fahrBodenRoh(e);
        const m = AnazhRealm.VERKEHR.bodenM;
        const ecke = (i, j) => {
            const k = i * 2097152 + j;
            let v = B.karte.get(k);
            if (v === undefined) B.karte.set(k, (v = roh(i * m, j * m)));
            return v;
        };
        return (e._verkehrBodenFn = (x, z) => {
            const [fx, fz] = [x / m, z / m];
            const [i, j] = [Math.floor(fx), Math.floor(fz)];
            const [tx, tz] = [fx - i, fz - j];
            const [a, b, c, d] = [ecke(i, j), ecke(i + 1, j), ecke(i, j + 1), ecke(i + 1, j + 1)];
            if (!(Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(c) && Number.isFinite(d)))
                return roh(x, z);
            return (a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz;
        });
    }

    // DER WAGEN IM GEDRÄNGE (`_tickBewohner`, nach dem Raster der Leiber): je fahrendem Wagen drei Leiber längs seiner Achse
    // (Bug, Mitte, Heck; je Radius die halbe Breite × √2 — so deckt der vordere und hintere Leib die Ecken, deren Abstand zu
    // seiner Mitte; `kR` die Berührung samt Kapsel) mit seinem Tempo und Vorrang (`rueck` ∞; der fahrende mit `weg`: keiner
    // geht um ihn wie um einen Stehenden; der ruhende ohne — um ihn geht man; seinen Platz verlangt keiner) — das Ausweichen der
    // Bewohner (`_bewohnerAusweichen`) sieht ihn wie den Spieler.
    _verkehrImRaster(S, R) {
        const VK = S.verkehr;
        if (!VK || !VK.wagen.length) return;
        const M = AnazhRealm.BEWOHNER.rasterM;
        for (const W of VK.wagen) {
            const e = W.entry;
            if (W.zustand !== "faehrt" || !e || !e._fahr) continue;
            const fz = e._fahr;
            const [cy, sy] = [Math.cos(fz.yaw), Math.sin(fz.yaw)];
            const vx = fz.vlong * cy - fz.vlat * sy;
            const vz = -fz.vlong * sy - fz.vlat * cy;
            const [fx, fzz] = [Math.sin(e._rideYaw || 0), Math.cos(e._rideYaw || 0)];
            const L =
                W.leiber ||
                (W.leiber = [0, 1, 2].map(() => ({
                    leib: { position: { x: 0, z: 0 } },
                    vx: 0,
                    vz: 0,
                    weg: true,
                    rueck: Infinity,
                    same: -2,
                    drinnen: false,
                    wagen: W,
                    kR: W.hw * Math.SQRT2 + AnazhRealm.PLAYER_WALL_RADIUS + 0.05,
                })));
            const mitte = W.bug - W.hl;
            const ab = Math.max(0, W.hl - W.hw);
            // der ruhende Wagen ist ein Stehender: um ihn geht der Gehende (`_bewohnerUm`), statt vor ihm zu warten, während er auf
            // ihn wartet (die Enge stand 40 s: ein Gehender 2,9 m vor dem Bug, beide warteten)
            const geht = !(fz.speed < AnazhRealm.VERKEHR.ruheMs);
            for (const [n, o] of L.entries()) {
                o.weg = geht;
                const s = mitte + (n - 1) * ab;
                [o.leib.position.x, o.leib.position.z, o.vx, o.vz] = [
                    e.position.x + fx * s,
                    e.position.z + fzz * s,
                    vx,
                    vz,
                ];
                const k = Math.floor(o.leib.position.x / M) * 2097152 + Math.floor(o.leib.position.z / M);
                const l = R.get(k);
                if (l) l.push(o);
                else R.set(k, [o]);
            }
        }
    }

    // DER VERKEHR GEHT MIT SEINER SIEDLUNG (`_bewohnerFort`): jeder Wagen verlässt den Bestand, jeder Fahrer seinen Wagen.
    _verkehrFort(S) {
        const VK = S.verkehr;
        if (!VK) return;
        for (const W of VK.wagen) {
            if (W.b) {
                W.b.amSteuer = false;
                W.b.wagen = null;
            }
            if (W.entry) this.removeArchitecture(W.entry, { still: true });
            W.entry = null;
        }
        S.verkehr = null;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_siedlung_verkehr]);

// ===== ATLAS · Siedlung/verkehr — Außen-Konstanten =====
// die Mitte und die vier Ecken eines Wagens (je ±halbe Länge, ±halbe Breite: `_verkehrFolge`)
AnazhRealm._verkehrEcken = Object.freeze([
    [0, 0],
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
]);
// DER VERKEHR DES WIRTS (das Gesetz der Menge, des Netzes, der Wende und des Platzes lebt in fachwerk VERKEHR_GESETZ; hier, wie
// der Wirt fährt): wagen = die Gestalten des Fahrzeug-Kerns, die die Stadt fährt (der Same des Fahrers wählt; Sport- und
// Geländewagen fahren nicht in der Stadt) · stufeM = so viel darf der Boden der Spur je halben Meter springen (mehr ist eine
// Wand: die Kante einer Erdbau-Platte) · ruheMs = darunter (ohne Gas) ruht ein Wagen: keine Hülle, keine Boxen, kein neues
// Bild · spurRandM = so viel Raum hält ein Stand über
// den halben Wagen und die Kapsel hinaus von jeder Spur (der Seitenraum `seitM` und das Ausscheren in der engsten Kurve,
// (parkL/2)²/(2·kurveR) = 0,66 m: kein Stand liegt in der Bahn, vor der ein Wagen hält) · bodenM = das Raster des gemerkten Bodens der Spur (`_verkehrBoden`)
// · radFeinM = so nah federt jedes Rad einzeln auf seinem Boden ·
// standM = der Stand des Fahrers neben der Tür seines Wagens · einsteigM = so nah an ihm steigt er ein · tempoMs = das
// Tempo der Stadt (30 km/h) · folgeM = so weit sieht der Fahrer voraus (Wagen, Leiber) · abstandM = so weit hält er hinter
// einem Wagen und vor einem Leib · seitM = der Raum quer neben ihm · begegnungM = so viel Raum braucht er zwischen sich und
// einem, der ihm entgegenkommt · bremsMs2 = so fest bremst er für die Folge und vor einem
// Ort · vorM = die Haltelinie vor einem Ort · frageM = so viel vor seinem Bremsweg fragt er den Ort · platzS = so lange
// wartet er auf einen, der in seiner Spur steht, dann macht der ihm Platz (neben der Bahn je `platzBahnM` um seinen Fußpunkt) ·
// engeRandM = so weit vor einer Enge wartet, wer ihr entgegenkommt · blickNahM = so nah zeichnet ein Wagen auch außer dem Blick
// der Kamera (sein Schatten, die Ego-Sicht) · folgeTakt / denkTakt = nah sieht (Folge, Orte) und lenkt der Fahrer jeden so
// vielten Sim-Schritt (fern: jeden seiner Schritte der Leiter) · boxFernM = fern vom Spieler (über `huelleM`) ziehen seine
// Blocker erst nach so vielen Metern nach (dort fragt sie keiner) · eckeStueck = so viele Punkte der Linie (je Meter) um den
// Fußpunkt seiner Mitte sucht er die Ecken eines anderen · vorausM = so weit reicht seine Route voraus ·
// platzBogenM = der Bogen zwischen Platz und Kreis · leuteRandM = so weit über Bremsweg und Abstand hinaus sieht er Leiber · parkMs = darunter steht er (am Platz parkt er) · festS = so lange
// steht er ohne Grund, dann steckt er (gezählt, `zahl.fest`) · ankunftAbstandM /
// ankunftSchrittM = die Ankunft auf der Route: Abstand zum nächsten Wagen, Schritt der Suche · leiter = [Abstand m,
// Schritt-Teiler]: so selten fährt ein ferner Wagen · genauM = so nah zieht er seine Boxen je Schritt nach (sonst ab 0,5 m) ·
// huelleM = so nah fährt er mit der Probe seiner Hülle (Bau, Leib, Spieler; fern trägt die freie Spur des Gesetzes) · leibM = so nah
// sitzt der Leib sichtbar am Steuer.
AnazhRealm.VERKEHR = Object.freeze({
    wagen: Object.freeze(["kompakt_fwd", "limousine", "suv"]),
    stufeM: 0.2,
    ruheMs: 0.05,
    platzBahnM: 3,
    blickNahM: 8,
    eckeStueck: 5,
    denkTakt: 2,
    folgeTakt: 3,
    boxFernM: 2,
    engeRandM: 5,
    spurRandM: 1,
    bodenM: 0.5,
    radFeinM: 20,
    standM: 0.7,
    einsteigM: 1.5,
    tempoMs: 8.3,
    folgeM: 40,
    abstandM: 2.5,
    seitM: 0.3,
    begegnungM: 0.1,
    bremsMs2: 3.5,
    vorM: 1,
    frageM: 4,
    platzS: 2,
    vorausM: 160,
    platzBogenM: 4,
    leuteRandM: 4,
    parkMs: 0.3,
    festS: 10,
    ankunftAbstandM: 14,
    ankunftSchrittM: 15,
    leiter: Object.freeze([
        Object.freeze([0, 1]),
        Object.freeze([40, 2]),
        Object.freeze([100, 4]),
        Object.freeze([200, 8]),
    ]),
    genauM: 12,
    huelleM: 12,
    leibM: 30,
});

// DER SCHLÜSSEL GEHT ZURÜCK: W hält den Ort Z nicht mehr (hält ihn keiner, hat er keine Richtung).
AnazhRealm._verkehrLos = function (Z, W) {
    const k = Z.halter.indexOf(W);
    if (k >= 0) Z.halter.splice(k, 1);
    if (!Z.halter.length) Z.richtung = null;
};
