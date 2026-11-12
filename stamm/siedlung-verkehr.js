class AnazhRealm_siedlung_verkehr {
    // ===== ATLAS · Siedlung/verkehr — Wagen · Fahrer · Spur · Kreuzung · Wende · Platz =====
    // ═══ DER VERKEHR (PFLICHT-OFFEN C, gesetzt 25.10.): Wagen mit Bewohnern am Steuer auf den Trassen der Stadt ═══
    // Eine städtische Siedlung (fachwerk `verkehrVon`) fährt so viele Wagen, wie ihr Gesetz nennt — jeder gefahren von einem
    // Bewohner ihrer Liste, auf dem Netz des Gesetzes (fachwerk `verkehrsNetz`: die zweispurigen Trassen, Kreuzungen, Engen,
    // Wenden und Plätze), mit dem EINEN Fahrer (`_fahrerSchritt`, `_fahrerLinie`) und dem EINEN Fahr-Schritt des Kerns
    // (`_wagenSchritt` · vehicle-core fahrStand · `_wagenLage`). Der Fahrer hat die Rolle `fahrer` (koerper-core TAGES_GESETZ):
    // sein Werk ist der Platz seines Wagens an der Wende nahe seiner Tür — dorthin geht er am Morgen, steigt ein, fährt bis
    // zum Feierabend von Ziel zu Ziel (die Wenden der Stadt, `_verkehrZielNeu`), kehrt zum Platz zurück, steigt aus und geht
    // heim. Die Wagen leben mit der Liste ihrer Siedlung (`_bewohnerFort` nimmt sie mit) und sind Gesetz, nie Save-Byte
    // (`ausGesetz`).
    // DIE ORDNUNG AUF DER STRASSE: jede Strecke trägt zwei Spuren (rechts der Fahrt), wer vor einem fährt, deckelt sein Tempo
    // (`_verkehrFolge`: Weg bis zu ihm samt Abstand und Bremsweg), wer in der Spur steht oder geht (Bewohner, Spieler), hält
    // ihn an; Kreuzung, Enge und Wende befährt einer zur Zeit (`_verkehrZonen`: der Schlüssel des Orts, in der Reihe der
    // Wartenden, nur mit Platz dahinter — keiner hält in der Kreuzung), wer verträglich fährt, zugleich (zwei Wege durch die
    // Kreuzung, die sich nicht nahe kommen; eine Enge in einer Richtung; die Durchfahrt der Wende hintereinander). Die Bewohner
    // sehen den fahrenden Wagen als Leib mit
    // Vorrang im Raster ihres Gedränges (`_verkehrImRaster`), den stehenden als Wand.
    // DIE KOSTEN (Gebot 7): ein Wagen fern vom Spieler fährt seltener (die Leiter `VERKEHR.leiter`: derselbe Schritt mit der
    // gesammelten Zeit), seine Boxen ziehen erst ab 0,5 m nach; der Leib am Steuer lebt nur, wo sein Wagen ihn trägt (das
    // Komposit erbt die Stufe, `_archTraegt`).

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
            zahl: AnazhRealm._verkehrZahl(von.n),
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
        // trägt ihn nicht, der Abbieger ist verboten, die Wende fällt (die Stellen zählt `zahl.stufen`, je Stelle `wo`: Strecke,
        // Abbieger, Wende; das Gesetz legt Kreuzung und Wende als EINE Fläche, `gate:settlement` Teil K, und jeden Abbieger als
        // Boden, fachwerk `verkehrsBoden` — die Wand hier fängt, was ein anderer Erdbau darüber legt)
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
        for (const [si, s] of VK.strecken.entries())
            if (s.fahrbar)
                for (const P of s.spur) {
                    const st = stufe(P);
                    if (st) [s.fahrbar, s.stelle] = [false, st];
                    if (st) VK.zahl.stufen.push(Object.assign(st, { wo: "s" + si }));
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
                    VK.zahl.stufen.push(Object.assign(st, { wo: "k" + ki + " " + wort }));
                }
            }
        for (const [ki, w] of [...VK.wenden.entries()]) {
            const st = stufe(w.bahn);
            if (st) {
                VK.wenden.delete(ki);
                VK.zahl.stufen.push(Object.assign(st, { wo: "w" + ki }));
            }
        }
        // DAS NETZ IN SEINER RICHTUNG (das Gesetz der Kreuzung, `verboten`): je Strecke zwei Zustände (2·si + dir, dir 0 von a nach
        // b), am Ende die Wende (zurück in die Strecke; ein Ende ohne Wende trägt keinen), an der Kreuzung jeder erlaubte Abbieger
        // (`VK.folge`, die Vorgänger `VK.vor`). Es fährt nur der Teil, in dem jeder Zustand jeden erreicht (stark zusammenhängend),
        // der längste — eine Strecke, die keiner ihrer Zustände darin trägt, fällt, und jeder Weg zu einem Ziel geht über die
        // Abbieger des Gesetzes (`_verkehrWegZu`). Bis hier zählte nur, was sich berührt: an der Kreuzung von stadt-voll verbot das
        // Gesetz 7 von 12 Abbiegern, in die Strecke einer Wende führte keiner — wer dorthin wollte, irrte (10 von 20 Wagen ohne
        // Ziel in 10 min)
        const fahrbarAn = (ki) => VK.kp[ki].strecken.filter((si) => VK.strecken[si].fahrbar);
        const nZ = 2 * VK.strecken.length;
        VK.folge = Array.from({ length: nZ }, (_, z) => {
            const s = VK.strecken[z >> 1];
            const ki = z & 1 ? s.a : s.b; // der Knotenpunkt, in den der Zustand fährt
            const K = VK.kp[ki];
            if (!s.fahrbar) return [];
            if (K.ende) return VK.wenden.has(ki) ? [z ^ 1] : [];
            return fahrbarAn(ki)
                .filter((so) => so !== z >> 1 && !(K.verboten || []).includes((z >> 1) + ">" + so))
                .map((so) => 2 * so + (VK.strecken[so].a === ki ? 0 : 1));
        });
        const vorAus = (folge) => {
            const v = Array.from({ length: nZ }, () => []);
            folge.forEach((l, z) => l.forEach((y) => v[y].push(z)));
            return v;
        };
        const reich = (z0, kanten) => {
            const da = new Uint8Array(nZ);
            const st = [z0];
            da[z0] = 1;
            while (st.length)
                for (const y of kanten[st.pop()])
                    if (!da[y]) {
                        da[y] = 1;
                        st.push(y);
                    }
            return da;
        };
        const vor0 = vorAus(VK.folge);
        const gesehen = new Uint8Array(nZ);
        let [teil, bestL] = [new Uint8Array(nZ), 0];
        for (let z = 0; z < nZ; z++) {
            if (gesehen[z] || !VK.folge[z].length) continue;
            const [hin, her] = [reich(z, VK.folge), reich(z, vor0)];
            let L = 0;
            for (let y = 0; y < nZ; y++)
                if (hin[y] && her[y]) {
                    gesehen[y] = 1;
                    L += VK.strecken[y >> 1].laenge / 2; // je Richtung die halbe Strecke
                }
            if (L > bestL) [teil, bestL] = [hin.map((h, y) => h & her[y]), L];
        }
        for (const [si, s] of VK.strecken.entries()) if (!teil[2 * si] && !teil[2 * si + 1]) s.fahrbar = false;
        VK.folge = VK.folge.map((l, z) => (teil[z] ? l.filter((y) => teil[y]) : []));
        VK.vor = vorAus(VK.folge);
        for (const s of VK.strecken) if (s.fahrbar) VK.zahl.laengeM += s.laenge;
        for (const ki of [...VK.wenden.keys()]) if (!fahrbarAn(ki).length) VK.wenden.delete(ki);
        if (!VK.wenden.size) return VK;
        // DIE WENDE IST BODEN DER STADT (der Hebel der Dörfer, `_stlWegeBuild`): ihr Ring und ihre Plätze tragen Weg — die Natur
        // weicht ihnen (die Natur-Wand, `_aufWeg`), was schon dort wuchs, räumt der Takt. DER GEHWEG gehört zur Straße: jede
        // Trasse (ab `breiteM`) trägt ihn beidseits, so weit die Menge auf ihr geht (`_bewohnerStrecke`: `gehwegM` samt Streuung
        // und Kapsel) — bis hier ging sie neben der gemalten Straße, die Gangzeit auf Wegen fiel von 0,87 auf 0,51
        // DIE ABBIEGER DES NETZES (jeder Weg durch eine Kreuzung, den ein Zustand fährt, `VK.folge`): von der Spur hinein über den
        // Weg des Gesetzes (`wege`: gerade oder im Bogen) an die Spur hinaus — Boden der Stadt wie die Wende (fachwerk
        // `verkehrsBoden` legt ihn als Erdbau), Weg im Bild und Bahn im Raster der Spuren
        const abbieger = [];
        for (const [z, l] of VK.folge.entries())
            for (const y of l) {
                if (y === (z ^ 1)) continue; // die Wende: ihre Bahn liegt unten
                const [a, b] = [VK.strecken[z >> 1], VK.strecken[y >> 1]];
                const [rein, raus, K] = [a.spur[z & 1], b.spur[y & 1], VK.kp[z & 1 ? a.a : a.b]];
                if (rein.length && raus.length)
                    abbieger.push([
                        rein[rein.length - 1],
                        ...((K.wege || {})[(z >> 1) + ">" + (y >> 1)] || []),
                        raus[0],
                    ]);
            }
        const BW = AnazhRealm.BEWOHNER;
        const flaechen = {
            roads: S.plan.roads
                .filter((r) => r.w >= VG.breiteM)
                .map((r) => ({
                    pts: r.pts.map((q) => ({ x: S.ox + q.x, z: S.oz + q.z })),
                    w: 2 * (BW.gehwegM + BW.gehwegBreiteM + AnazhRealm.PLAYER_WALL_RADIUS),
                }))
                .concat(abbieger.map((pts) => ({ pts, w: 2 * VG.halbM }))),
            // DER BODEN DES VERKEHRS FÄLLT NIE UNTER DIE KAPPE (`_stlWegeBuild`): jede Form trägt eine Spur, ihre Zahl folgt dem Netz
            // (je Wende ~150). Bis w13-verkehr-heil schnitt die Kappe der Siedlung (900) still ab, was danach kam — im Netz der vier
            // Wenden von stadt-voll die Plätze der letzten (983/324): die Nachtfahrer der Wagen 2, 5 und 9 stiegen neben dem Weg ein
            kappe: Infinity,
        };
        for (const w of VK.wenden.values()) {
            const ring = [];
            for (let a = 0; a <= 2 * Math.PI + 1e-9; a += 1 / w.r)
                ring.push({ x: w.x + Math.cos(a) * w.r, z: w.z + Math.sin(a) * w.r });
            flaechen.roads.push(
                { pts: ring, w: 2 * VG.halbM + VG.ringRandM },
                { pts: w.ein, w: 2 * VG.halbM },
                { pts: w.aus, w: 2 * VG.halbM }
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
                // DER BOGEN ZWISCHEN PLATZ UND KREIS trägt Weg wie Ring und Platz (aus ihm, in ihn: je seine Sehne mit dem Rand des
                // Rings, der den Pfeil des Bogens, R·(1 − cos 22,5°) = 0,42 m, trägt) — bis pflicht.C#1 fuhr, wer ausparkte, über
                // ungemalten Boden (stadt-voll 23 Uhr: Wagen 5, 14 und 16 je 9 m von der Mitte ihrer Wende, `_aufWeg` nein)
                for (const s of [1, -1]) {
                    const { B } = this._verkehrPlatzBogen(w, p, s);
                    flaechen.roads.push({ pts: [{ x: p.x, z: p.z }, B[B.length - 1]], w: 2 * VG.halbM + VG.ringRandM });
                }
            }
        }
        this._stlWegeBuild(flaechen, { x: 0, z: 0 }, "verkehr:" + S.key);
        // DIE SPUREN IM RASTER (`_verkehrAufSpur`): je Zelle die Stücke der Spuren, der Abbieger, der Bahn und des Rings jeder
        // Wende, je Stück sein Ausscheren (`aus`, das fünfte Feld): in der Kurve schert der Wagen um l²·κ/2 aus seiner Bahn — der
        // längste des Gesetzes (parkL) im Wendekreis (kurveR), (parkL/2)²/(2·kurveR) = 0,66 m, auf jedem Abbieger und in jeder
        // Wende; die Spur der Strecke biegt flach (0). Bis hier war die Fahrbahn überall nur den halben Wagen breit: wer am Rand
        // eines Abbiegers stand, stand nicht „auf ihr“ — der Wagen aber hielt vor ihm (seine Bahn samt Ausscheren, `_verkehrFolge`),
        // und beide warteten (stadt-voll 10 Uhr, die Kreuzung am Markt mit allen zwölf Abbiegern: 250 s, 18 Wagen dahinter)
        VK.spurRaster = new Map();
        const kurveAus = (VG.parkL / 2) ** 2 / (2 * VG.kurveR);
        const stueck = (a, b, aus) => {
            const M = AnazhRealm.BEWOHNER.rasterM;
            const rand = VG.halbM + AnazhRealm.PLAYER_WALL_RADIUS + V.spurRandM + aus; // der weiteste Leser (der Stand)
            for (
                let ix = Math.floor((Math.min(a.x, b.x) - rand) / M);
                ix <= Math.floor((Math.max(a.x, b.x) + rand) / M);
                ix++
            )
                for (
                    let iz = Math.floor((Math.min(a.z, b.z) - rand) / M);
                    iz <= Math.floor((Math.max(a.z, b.z) + rand) / M);
                    iz++
                ) {
                    const k = ix * 2097152 + iz;
                    (VK.spurRaster.get(k) || (VK.spurRaster.set(k, []), VK.spurRaster.get(k))).push(a.x, a.z, b.x, b.z, aus); // prettier-ignore
                }
        };
        const linie = (P, aus = 0) => {
            for (let i = 1; i < P.length; i++) stueck(P[i - 1], P[i], aus);
        };
        for (const s of VK.strecken) if (s.fahrbar) for (const P of s.spur) linie(P);
        // und der Weg durch jede Kreuzung (die Abbieger des Netzes)
        for (const P of abbieger) linie(P, kurveAus);
        for (const w of VK.wenden.values()) {
            linie(w.bahn, kurveAus);
            const ring = [];
            for (let a = 0; a <= 2 * Math.PI + 1e-9; a += 1 / w.r)
                ring.push({ x: w.x + Math.cos(a) * w.r, z: w.z + Math.sin(a) * w.r });
            linie(ring, kurveAus);
        }
        // DIE ORTE, DIE EINER ZUR ZEIT BEFÄHRT (`_verkehrZonen`: verträgliche zugleich): jede Kreuzung (drei und mehr fahrbare
        // Strecken), jede Enge, jede Wende samt Platz und ihren Bahnen bis an ihren Abzweig
        const zone = (art, x, z, r, konflikt = []) => {
            const Z = { art, x, z, r, halter: [], richtung: null, warte: [], konflikt };
            VK.zonen.push(Z);
            return Z;
        };
        // DIE ARME DER KREUZUNG (`Z.arme`, je Strecke die Stücke ihrer beiden Spuren von der Kreuzung nach außen, bis an ihren
        // Kreis verlängert — der Weg durch sie beginnt in ihrer Richtung): an ihnen misst die Durchfahrt, wie weit zwei Bahnen den
        // Raum teilen (`_verkehrLinie`, `_verkehrArmNah`)
        const arme = (ki, K) => {
            const A = new Map();
            for (const si of fahrbarAn(ki)) {
                const [s, l] = [VK.strecken[si], []];
                for (const d of [0, 1]) {
                    const P = (d === 0) === (s.b === ki) ? s.spur[d].slice().reverse() : s.spur[d];
                    if (P.length < 2) continue;
                    const L = Math.hypot(P[1].x - P[0].x, P[1].z - P[0].z) || 1;
                    const vor = Math.max(0, Math.hypot(P[0].x - K.x, P[0].z - K.z) - K.r);
                    let a = { x: P[0].x - ((P[1].x - P[0].x) / L) * vor, z: P[0].z - ((P[1].z - P[0].z) / L) * vor };
                    for (const b of P) {
                        if (Math.hypot(b.x - K.x, b.z - K.z) > K.r + V.armM) break;
                        l.push(a.x, a.z, b.x, b.z);
                        a = b;
                    }
                }
                A.set(si, l);
            }
            return A;
        };
        for (const [ki, K] of VK.kp.entries())
            if (fahrbarAn(ki).length >= 3)
                VK.kpZone.set(
                    ki,
                    Object.assign(zone("kreuzung", K.x, K.z, K.r, K.konflikt || []), { arme: arme(ki, K) })
                );
        // die Enge samt einer Wagenlänge davor (`engeRandM`): wer ihr entgegenkommt, wartet, wo der in ihr an ihm vorbeikommt — nur
        // wo eine gefahrene Spur sie trägt (`_verkehrSpur`): eine Enge hinter dem Abzweig der Wende fährt keiner, ihre Bahnen hinein
        // und heraus trennt das Gesetz (bis hier stand sie dort als Ort, und wer auf der Bahn hinein durch ihren Kreis fuhr, fuhr
        // „ohne Schlüssel“ — stadt-voll, die Enge 914/298 der Wende 908/289, 10 Uhr 157×)
        for (const s of VK.strecken)
            s.engZonen = s.fahrbar
                ? s.engen
                      .filter((e) =>
                          [0, 1].some((d) =>
                              this._verkehrSpur(VK, s, d).some((q) => Math.hypot(q.x - e.x, q.z - e.z) < e.r)
                          )
                      )
                      .map((e) => zone("enge", e.x, e.z, e.r + V.engeRandM))
                : [];
        // DIE WENDE IST IHR RING SAMT PLATZ (der Ort, an dem wer aus dem Platz oder in ihn fährt, den Weg der Durchfahrt kreuzt), IHRE
        // BEGEGNUNG EINE ENGE (fachwerk `engen`: wo Bahn hinein und heraus einander samt dem Ausscheren im Bogen näher als zwei halbe
        // Wagen kommen; je Richtung, hinein 0, heraus 1, `_verkehrZugZonen`, in ihrem genauen Maß ohne den Vorlauf `engeRandM` der
        // Strecke) — sonst kreuzen die Bahnen keinen Wagen, wer auf ihnen fährt, folgt dem vor ihm. Bis w13-verkehr-heil reichte die
        // Wende bis an den Abzweig beider Bahnen (stadt-voll, die Wende 924/354: 44,9 m, 105 m der Linie je Durchfahrt): wer
        // ausparkte, wartete, bis keiner mehr auf 105 m der Bahn fuhr (23 Uhr eine Reihe von sieben 90 s vor dem Abzweig), und wer
        // sie verträglich durchfuhr, begegnete dem Entgegenkommenden, wo beide Bahnen 2,42 m nebeneinander liefen (die Wende 908/289,
        // 0,08 m bis „Wagen in Wagen"). DIE SCHLEIFE TRÄGT, WEN SIE FASST (die Regel des Kreisverkehrs): so viele Wagen samt Abstand,
        // wie ihre Bahn außer der Begegnung lang ist, halten die Wende zugleich, wer dann kommt, wartet draußen — ohne sie hielten
        // zwei Hineinfahrende die Begegnung, der Herausfahrende wartete vor ihr und der Ring hinter ihm (die West-Wende 668/419:
        // 7 Halter, eine Fahrt 671 s).
        for (const w of VK.wenden.values()) {
            w.zone = zone("wende", w.x, w.z, w.r + VG.halbM + VG.parkRandM + VG.parkB + VG.parkL / 2);
            w.engZonen = (w.engen || []).map((e) => zone("enge", e.x, e.z, e.r));
            let L = 0;
            for (let i = 1; i < w.bahn.length; i++)
                if (!w.engZonen.some((Z) => Math.hypot(w.bahn[i].x - Z.x, w.bahn[i].z - Z.z) < Z.r))
                    L += Math.hypot(w.bahn[i].x - w.bahn[i - 1].x, w.bahn[i].z - w.bahn[i - 1].z);
            w.zone.platz = Math.max(1, Math.floor(L / (VG.parkL + V.abstandM)));
        }
        // DIE FAHRER: je Wagen des Gesetzes zwei — bei Tag die erste Person seines Hauses, bei Nacht die zweite (der Nachtfahrer,
        // koerper-core TAGES_GESETZ: am Platz wechselt die Schicht, der Wagen fährt bei Tag und bei Nacht); steht das Haus nicht
        // oder trägt es die Person nicht, fährt die erste freie der folgenden Häuser (bis hier fuhr dort keiner: 4 von 20 Wagen
        // der Metropole ohne Fahrer). Sein Platz liegt an der Wende nächst der Tür des Tagfahrers, die nächste mit freiem Platz.
        const seed = S.plan.seed >>> 0;
        const leute = new Map(S.liste.map((x) => [x.seed, x]));
        const nS = S.plan.slots.length;
        const frei = (si, p) => {
            for (let k = 0; k < nS; k++) {
                const x = leute.get(`${seed}:${(si + k) % nS}:${p}`);
                if (x && !x.wagen) return x;
            }
            return null;
        };
        for (const [w, si] of von.slots.entries()) {
            const b = frei(si, 0);
            if (!b) {
                VK.zahl.ohneFahrer++;
                continue;
            }
            b.wagen = true;
            const nacht = frei(si, 1) || frei(si + 1, 0);
            b.wagen = null;
            if (!nacht) VK.zahl.ohneNacht++;
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
                fahrer: nacht ? [b, nacht] : [b],
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
                reihe: new Set(),
                dtAcc: 0,
                takt: w,
                // der Blick des Fahrers versetzt je Wagen (`folgeTakt`): nie sieht die ganze Stadt im selben Schritt
                folgeH: (w % V.folgeTakt) * AnazhRealm.FIXED_DT,
                leiber: null,
                vorne: null,
                vorder: null,
                grund: null,
                warteS: 0,
                stehtS: 0,
                weg: 0,
                ankunft: true,
                sitzt: false,
                // das Ziel der Fahrt (`_verkehrZielNeu`): die Wende, der Weg dorthin, der Zähler des Samens; die Ankünfte, die Uhr
                // des Wagens (seine Sim-Schritte) und der Anfang der Fahrt (`_verkehrAngekommen`)
                ziel: null,
                zielWeg: null,
                zielN: 0,
                ziele: 0,
                uhr: 0,
                fahrtAb: 0,
            };
            // DER FAHRER: seine Rolle und sein Werk — der Stand neben seinem Wagen, auf der Seite fort vom Ring der Wende (nie in
            // seiner Spur), zum Wagen gewandt
            const [ux, uz] = [Math.cos(park.beta), Math.sin(park.beta)];
            const seite = VG.parkB / 2 + V.standM;
            const stand = { x: park.x + ux * seite, z: park.z + uz * seite, blick: Math.atan2(-ux, -uz) };
            for (const [k, f] of W.fahrer.entries()) {
                f.rolle = f.beruf = k ? "nachtfahrer" : "fahrer";
                f.wagen = W;
                f.orte.werk = stand;
            }
            if (!this._verkehrWagenStellen(W)) {
                VK.zahl.ohnePlatz++;
                for (const f of W.fahrer) f.wagen = null;
                continue;
            }
            VK.wagen.push(W);
        }
        // der Boden der Spur backt ab jetzt (`_verkehrBodenBacken`), nicht erst mit dem ersten Schritt: bis die Fahrer am Steuer
        // sitzen, trägt er (bis hier zahlte die erste Fahrt der Stadt ihn im Sim-Takt, 1,23 gegen 0,91 ms)
        if (VK.wagen.length) this._verkehrBoden(S, VK.wagen[0].entry);
        return VK;
    }

    // LIEGT (x, z) IN DER SPUR EINES WAGENS? Näher als ein halber Wagen samt Kapsel, seinem Ausscheren in der Kurve (das fünfte
    // Feld des Stücks) und `rand` an einer Spur, einem Abbieger, der Bahn oder dem Ring einer Wende (das Raster der Spuren,
    // `VK.spurRaster`) — DIE FAHRBAHN, das EINE Gesetz, nach dem Fuß und Wagen die Straße teilen. Leser: der Stand der Bewohner
    // (`_bewohnerStandPruefen`, `spurRandM` Raum), und mit `rand` 0 jeder Ort, den ein Gehender wählt — der Punkt seines Wegs
    // (`_bewohnerStrecke`), der Punkt um einen Stehenden (`_bewohnerUm`), der Platz, auf den er tritt (`_bewohnerPlatz`), der
    // Schritt, mit dem er ausweicht (`_bewohnerAusweichen`).
    _verkehrAufSpur(S, x, z, rand = AnazhRealm.VERKEHR.spurRandM) {
        const VK = S.verkehr;
        const M = AnazhRealm.BEWOHNER.rasterM;
        const l = VK && VK.spurRaster && VK.spurRaster.get(Math.floor(x / M) * 2097152 + Math.floor(z / M));
        if (!l) return false;
        const r0 = globalThis.__fachwerkCore.VERKEHR_GESETZ.halbM + AnazhRealm.PLAYER_WALL_RADIUS + rand;
        for (let i = 0; i < l.length; i += 5) {
            const [ax, az, bx, bz, r] = [l[i], l[i + 1], l[i + 2], l[i + 3], r0 + l[i + 4]];
            const [dx, dz] = [bx - ax, bz - az];
            const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1)));
            if ((x - ax - dx * t) ** 2 + (z - az - dz * t) ** 2 < r * r) return true;
        }
        return false;
    }

    // QUERT DAS BEIN a → b DIE FAHRBAHN, STATT LÄNGS IHR ZU GEHEN? Die Kapsel liegt auf ihm höchstens `querBreiten` Breiten der
    // Fahrbahn (zwei Spuren samt halbem Wagen und Kapsel) in der Bahn eines Wagens (`_verkehrAufSpur` ohne Rand, je halben Meter):
    // gerade hinüber oder schräg bis 30°. Leser: der Weg der Bewohner (`_bewohnerStrecke`).
    _verkehrQuert(S, a, b) {
        const VG = globalThis.__fachwerkCore.VERKEHR_GESETZ;
        const L = Math.hypot(b.x - a.x, b.z - a.z);
        const n = Math.max(1, Math.ceil(L / 0.5));
        const max = AnazhRealm.VERKEHR.querBreiten * 2 * (VG.spurM + VG.halbM + AnazhRealm.PLAYER_WALL_RADIUS);
        let drin = 0;
        for (let k = 0; k <= n; k++) {
            const t = k / n;
            if (this._verkehrAufSpur(S, a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t, 0) && (drin += L / n) > max)
                return false;
        }
        return true;
    }

    // DIE METER EINES WEGS AUF DER FAHRBAHN (von `von` über die Punkte `pts`, je halben Meter `_verkehrAufSpur` ohne Rand). Leser:
    // die Seite des Gehwegs (`_bewohnerStrecke`: die Seite, die weniger über die Fahrbahn führt) und der Stand diesseits seiner
    // Tür (`_bewohnerStandPruefen`).
    // `genug`: der Leser will nur wissen, ob mehr als so viele Meter auf ihr liegen — sie endet am ersten, der es zeigt (der Stand
    // diesseits seiner Tür fragt `0`: an der Stadt fragte jede Suche eines Stands je Punkt den ganzen Weg ab, 250 146 Wege und
    // 8,38 Mio. `_verkehrAufSpur` in EINER Prüfung der Stände, 3,55 s Null-Renderer).
    _verkehrFahrbahnM(S, von, pts, genug = Infinity) {
        let m = 0;
        for (let i = 0, a = von; i < pts.length; a = pts[i++]) {
            const b = pts[i];
            const L = Math.hypot(b.x - a.x, b.z - a.z);
            const n = Math.max(1, Math.ceil(L / 0.5));
            for (let k = 1; k <= n; k++)
                if (
                    this._verkehrAufSpur(S, a.x + ((b.x - a.x) * k) / n, a.z + ((b.z - a.z) * k) / n, 0) &&
                    (m += L / n) > genug
                )
                    return m;
        }
        return m;
    }

    // DER VORRANG DER FAHRBAHN: beansprucht ein Wagen der Stadt (er fährt) die Querung des Bewohners b? Sie liegt vor seinem Bug,
    // in seiner Bahn, und er ist dort, bevor b hinüber ist (unten) — außer b hält selbst einen Wagen (`W.wer`, `_verkehrFolge`): dann
    // geht b zuerst. Wer steht, beansprucht nichts: vor dem
    // wartenden Wagen geht man hinüber. Bis hier beanspruchte auch der stehende Wagen den Punkt — der Gehende am Rand wartete auf
    // ihn, er auf einen anderen, und der Halter der Kreuzung auf den Gehenden (stadt-voll 10 Uhr, 250 s, 18 Wagen dahinter); davor
    // hielt der Halter einer Enge für den, der in der Kurve am Rand auf ihn wartete. DIE LÜCKE IM STROM: wer schon `vorrangWarteS`
    // vor Leibern steht, beansprucht seine Bahn (`vorrangM`) auch stehend — wer in ihr geht, geht zu Ende, wer an den Rand kommt,
    // wartet. Bis w13-verkehr-heil querte der Markt um 10 Uhr ohne Ende vor dem Halter der Kreuzung (stadt-voll, Minute 5–9 nach
    // dem Sprung: Reihen von 5–7 Wagen dahinter, je 27–29 m in der Minute). Leser: der Gang der Bewohner (`_bewohnerGehen`).
    // DER VORRANG LIEST DIE BAHN, DIE ER FÄHRT (heim2-w20-wald-kosten): beansprucht ist, was in seiner Bahn liegt — das Band um
    // seine Linie voraus (`W.F`: halber Wagen, Kapsel, `seitM` und sein Ausscheren `rund`), dasselbe Band, in dem er vor einem
    // Leib hält (`_verkehrFolge`) —, nie ein Strahl längs seiner Nase; wer einen Ort hält (`hat`), beansprucht seine Bahn durch
    // ihn bis zu seinem Ende (der Ort gehört ihm, bis er hinaus ist). Wer selbst einen Wagen hält, geht zu Ende — ihm gilt kein
    // Vorrang. Bis hier fragte der Strahl geradeaus: in der Kurve der Kreuzung am Markt (stadt-voll 10 Uhr) lag die Bahn des
    // Halters neben ihm, und die Querenden traten hinein — 28 % der Zeit hielt ein Leib den Halter der Kreuzung (jetzt 21–23 %).
    // DIE QUERUNG IST EINE RAUM-ZEIT-RESERVIERUNG (w27-verkehr-leib; Dresner & Stone: wer den geteilten Raum betritt, hat seine
    // Durchfahrt bis hinter ihn): wer mit dem Tempo (vx, vz) von (x, z) auf die Fahrbahn oder in die Bahn eines Wagens träte, prüft
    // seine GANZE Querung — jede Bahn, die er binnen einer Breite der Fahrbahn kreuzt, mit der Zeit, in der er sie belegt
    // (`_verkehrQuerung`): ein Wagen beansprucht sie, wenn er an seinem Ort ist, bevor er sie verlassen hat (samt `querRandS`), und
    // nicht schon vorbei, wenn er hineintritt; ohne Zeit, was ein Halter durch seinen Ort fährt und die Lücke im Strom. Wer schon
    // auf der Fahrbahn oder in einer beanspruchten Bahn ist, hält seine Reservierung und geht zu Ende — der Wagen wartet die Dauer
    // seiner Querung (`_verkehrFolge`). Bis w27-verkehr-leib fragte er nur den nächsten Schritt (0,1 s) gegen die Bahn eines Wagens
    // binnen `lueckeS` (höchstens `vorrangM`): wer die erste Spur betrat, stand in ihr vor dem Wagen der zweiten, und der Wagen der
    // ersten hielt vor ihm (stadt-voll 10 Uhr: Halte vor Querenden ~250 Wagen-Sekunden je Stunde). Liefert true (er wartet am Rand),
    // das Tempo, mit dem er eine Bahn quer räumt (unten), oder false.
    _verkehrVorrang(S, x, z, vx, vz, b) {
        const V = AnazhRealm.VERKEHR;
        const R = AnazhRealm.PLAYER_WALL_RADIUS;
        const VG = globalThis.__fachwerkCore.VERKEHR_GESETZ;
        const sp = Math.hypot(vx, vz);
        const [nx, nz] = [x + (vx / sp) * V.querSchrittM, z + (vz / sp) * V.querSchrittM];
        // der billige Filter zuerst (Lehre 25): wer nicht an die Fahrbahn tritt, fragt keinen Wagen; wer von außen auf sie tritt,
        // fragt seine ganze Querung, wer auf ihr geht, jede Bahn, in die er tritt (die Kreuzung: Fahrbahn von Rand zu Rand)
        if (!(sp > 0) || !this._verkehrAufSpur(S, nx, nz)) return false;
        let [traf, drin, tritt, raeum] = [false, false, !this._verkehrAufSpur(S, x, z, 0) && this._verkehrAufSpur(S, nx, nz, 0), null]; // prettier-ignore
        for (const W of S.verkehr.wagen) {
            const e = W.entry;
            const F = W.F;
            if (W.zustand !== "faehrt" || !e || !e._fahr || !F) continue;
            const v = Math.max(0, e._fahr.vlong);
            // ohne Zeit beansprucht: die Lücke im Strom (`vorrangM`, wer schon `vorrangWarteS` vor Leibern steht) und die Bahn durch
            // den Ort, den er hält
            let bahn = 0;
            if (W.leibS >= V.vorrangWarteS) bahn = V.vorrangM;
            for (const y of W.zonen) if (y.hat && !y.weg) bahn = Math.max(bahn, y.aus - F.s - W.hl);
            const r0 = W.hw + R + V.seitM;
            // so weit fährt er, während einer eine Breite der Fahrbahn samt seiner Bahn quert
            const H = Math.min(V.folgeM, Math.max(bahn, (v * (2 * r0 + VG.breiteM)) / sp + v * V.querRandS));
            if (!(H > 0) || (x - e.position.x) ** 2 + (z - e.position.z) ** 2 > (W.hl + H + r0 + VG.breiteM + 1) ** 2)
                continue;
            // sein Ort an der Linie voraus (der Fußpunkt, `_verkehrFolge`): quer (rechts +) und längs, je Stück der Linie
            let [bq, bi, bs, bQ] = [Infinity, -1, 0, 0];
            for (let i = F.i; i + 1 < F.pts.length && F.bogen[i] <= F.s + W.hl + H; i++) {
                const [a, c] = [F.pts[i], F.pts[i + 1]];
                const [dx, dz] = [c.x - a.x, c.z - a.z];
                const l = Math.hypot(dx, dz) || 1;
                const t = Math.max(0, Math.min(1, ((x - a.x) * dx + (z - a.z) * dz) / (l * l)));
                const q2 = (x - a.x - dx * t) ** 2 + (z - a.z - dz * t) ** 2;
                if (q2 < bq) [bq, bi, bs, bQ] = [q2, i, F.bogen[i] + t * l, ((x - a.x) * -dz + (z - a.z) * dx) / l];
            }
            const d = bs - F.s - W.hl - R;
            if (bi < 0 || d < -R) continue;
            const [a, c] = [F.pts[bi], F.pts[bi + 1]];
            const l = Math.hypot(c.x - a.x, c.z - a.z) || 1;
            const B = r0 + F.rund[bi];
            const u = (vx * -(c.z - a.z) + vz * (c.x - a.x)) / l;
            // wer längs in die Bahn tritt (quer langsamer als `querMs`), belegt sie, solange er in ihr ginge
            const Q =
                AnazhRealm._verkehrQuerung(bQ, u, B) ||
                (Math.abs(bQ + (u / sp) * V.querSchrittM) <= B ? [0, Infinity] : null);
            if (!Q || Math.abs(bQ) > B + VG.breiteM) continue;
            // der Wagen, der vor ihm hält (`W.wer`), beansprucht seine Bahn gegen ihn: wer aus ihr trat, tritt nicht wieder hinein
            const belegt =
                W.wer === b ||
                Math.max(0, d) <= bahn ||
                (v * (Q[1] + V.querRandS) > d && d + 2 * (W.hl + R) > v * Q[0]);
            if (!belegt) continue;
            if (Math.abs(bQ) <= B) {
                // er steht schon in der Bahn, die einer beansprucht: verlässt er sie in der Dauer einer Querung, geht er hinüber;
                // sonst RÄUMT ER SIE QUER (er gibt sie frei), nie längs
                drin = true;
                if (d > 0 && Q[1] > (2 * B) / sp + V.querRandS) raeum = { q: bQ, B, nx: -(c.z - a.z) / l, nz: (c.x - a.x) / l }; // prettier-ignore
                continue;
            }
            traf = true;
            tritt = tritt || Q[0] * sp <= V.querSchrittM;
        }
        // DER LEIB GIBT DIE BAHN FREI (w27-verkehr-leib): wer vor dem Bug in ihr steht oder längs geht, tritt mit seinem Tempo quer
        // aus ihr an den Rand neben der Fahrbahn (dort fährt kein Wagen) — auf seiner Seite, nie über die Linie —, wo keine Wand
        // den Schritt schneidet und auf ihm kein Leib näher als zwei Kapseln steht; und wartet dort, bis die Bahn frei ist (oben).
        // Trägt seine Seite nicht, geht er seinen Weg, und der Wagen umfährt ihn (`_verkehrFolge`). Bis hier ging er, wohin sein Weg
        // und sein Ausweichen ihn führten: an der Kreuzung am Markt tänzelten #7:58:0 und #7:54:4 längs der Bahn ihres Halters
        // (stadt-voll 10 Uhr, 22–49 s, die Kreuzung stand, „fahrend je Minute“ 0 m)
        if (raeum) {
            const K = 2 * R + 0.01;
            const s = Math.sign(raeum.q) || 1;
            const w = raeum.B - s * raeum.q + V.querSchrittM; // so weit bis jenseits der Bahn
            const [ux, uz] = [raeum.nx * s, raeum.nz * s];
            const [p, m] = [1, 0.5].map((f) => ({ x: x + ux * w * f, z: z + uz * w * f }));
            const frei =
                !this._verkehrAufSpur(S, p.x, p.z, 0) &&
                !this._bewohnerWand({ x, z }, p) &&
                this._bewohnerNaechster(S, b, p.x, p.z) >= K &&
                this._bewohnerNaechster(S, b, m.x, m.z) >= K;
            return frei && { vx: ux * sp, vz: uz * sp };
        }
        return traf && tritt && !drin;
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
        [e._rideYaw, e._sitzHeight] = [p.fahrt, this._sitzHoehe(e)]; // der Ursprung seines Fahrers: der Sitz des Gesetzes
        const fz = (e._fahr = vc.fahrZustand(p.x, p.z, p.fahrt - Math.PI / 2));
        vc.fahrStand(fz, G, this._fahrBoden(e), 0);
        if (Number.isFinite(fz.y)) this._wagenLage(e, fz);
        const um = this._fahrUmriss(e);
        [W.hl, W.hw, W.bug] = [(um.bug - um.heck) / 2, um.hw, um.bug];
        this._verkehrBild(e);
        return true;
    }

    // IM BLICK DER KAMERA: die Kugel (Mitte `m` — die Lage des Wagens oder sein letztes Bild —, Radius r) schneidet das Frustum
    // der Kamera dieses Schritts (ohne Kamera: ja). Leser: das Bild des Verkehrs (`_verkehrSchritt`).
    _verkehrImBlick(m, r) {
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
        K.center.set(m.x, m.y, m.z);
        K.radius = r;
        return B.intersectsSphere(K);
    }

    // DAS BILD DES WAGENS: der EINE Visual-Weg (die Instanz-Matrix des Studio-Wagens samt Rädern, sonst die Gruppen-Pose) — an
    // seiner Sim-Lage oder an der gleitenden Lage `q` dieses Bilds (`_verkehrGleit`), die Sim-Lage bleibt unberührt.
    _verkehrBild(e, q) {
        const fz = q && e._fahr;
        const s = fz && (this._verkehrBildSim || (this._verkehrBildSim = { x: 0, y: 0, z: 0, g: 0, r: 0 }));
        const lege = (L, aus) => {
            if (aus) [aus.x, aus.y, aus.z, aus.g, aus.r] = [e.position.x, e.position.y, e.position.z, e._rideYaw, fz.wheelAng];
            [e.position.x, e.position.y, e.position.z] = [L.x, L.y, L.z]; // die Lage des Eintrags ist ein Feld-Satz, kein Vektor
            e._rideYaw = L.g;
            fz.wheelAng = L.r;
            e.rotationY = this._rittGier(e, L.g);
        };
        if (fz) lege(q, s);
        if (e.instanced) this._archInstanceUpdate(e);
        else if (e.mesh) this._rittMeshPose(e);
        if (fz) lege(s);
        const W = e._verkehrWagen; // wo sein Bild steht (`_verkehrSchritt`: steht es im Blick, zeichnet er nach)
        if (W) {
            const [L, o] = [q || e.position, W.bildOrt || (W.bildOrt = { x: 0, y: 0, z: 0 })];
            [o.x, o.y, o.z] = [L.x, L.y, L.z];
        }
    }

    // EIN ZUSTAND IN DIE SPUR (`W.spur`, höchstens `spurN`, der älteste fällt): die Lage, Gier und Rad-Winkel des Wagens zur Zeit
    // `t` seiner Uhr (`W.uhr`). Leser: `_verkehrGleit`.
    _verkehrZustand(W, Sp, t) {
        const [e, n] = [W.entry, AnazhRealm.VERKEHR.spurN];
        const z = Sp.length >= n ? Sp.shift() : {};
        [z.t, z.x, z.y, z.z, z.g, z.r] = [t, e.position.x, e.position.y, e.position.z, e._rideYaw, e._fahr.wheelAng];
        Sp.push(z);
    }

    // DIE LAGE IM BILD (Fiedler „Fix Your Timestep!", der Leib des Spielers `_applyFixedInterpolation`): zwischen den zwei Zuständen
    // der Spur (`_verkehrZustand`), die die Uhr des Bilds dieses Wagens (`W.bildD`) einschließen. Die Uhr geht mit der Wanduhr der
    // Bilder (`R`: die Uhr des Wagens, die Schritte seither `dtAcc` und der Rest des Akkumulators `_fixedAlpha`) und holt je Bild
    // `bildHolen` ihres Abstands zum Soll ein — das Soll liegt die Dauer seines jüngsten Schritts weniger einen Sim-Schritt hinter
    // R (`h − FIXED_DT`, k · FIXED_DT seiner Stufe): der ferne Wagen, der jeden k-ten Schritt schreitet, gleitet durch die k
    // Bilder, statt k − 1 zu stehen und dann zu springen. Wechselt die Stufe (k 1 · 2 · 4 · 8 mit Abstand und Blick, die Kappe
    // schiebt auf), wandert das Soll — die Uhr folgt ihm weich durch die Spur, nie im Sprung; ein aufgeschobener Schritt gleitet
    // höchstens einen Sim-Schritt über den jüngsten Zustand hinaus. Ohne Spur, nach einer Lage, die kein Schritt schrieb
    // (gestellt, geparkt, die Ankunft, der Ritt), oder ohne Bewegung in der Spur: null — das Bild zeigt die Sim-Lage. Leser: das
    // Bild des Wagens und der Leib am Steuer (`_tickVerkehr`, `_verkehrSitz`).
    _verkehrGleit(W) {
        const [Sp, e] = [W.spur, W.entry];
        const N = Sp && Sp.length > 1 ? Sp[Sp.length - 1] : null;
        if (!N || !e || !e._fahr || e.position.x !== N.x || e.position.z !== N.z || e.position.y !== N.y) return null;
        if (Sp.every((s) => s.x === N.x && s.z === N.z && s.y === N.y && s.g === N.g)) return null;
        const [V, DT] = [AnazhRealm.VERKEHR, AnazhRealm.FIXED_DT];
        const fa = this.state._fixedAlpha;
        const R = N.t + W.dtAcc - (1 - (Number.isFinite(fa) ? Math.max(0, Math.min(1, fa)) : 1)) * DT;
        const soll = R - (N.t - Sp[Sp.length - 2].t - DT);
        let D = W.bildD + (R - W.bildR);
        D = Math.abs(soll - D) < N.t - Sp[0].t ? D + (soll - D) * V.bildHolen : soll;
        D = Math.max(Sp[0].t, Math.min(N.t + DT, D));
        [W.bildD, W.bildR] = [D, R];
        let i = Sp.length - 2;
        while (i > 0 && Sp[i].t > D) i--;
        const [A, B] = [Sp[i], Sp[i + 1]];
        const a = B.t > A.t ? (D - A.t) / (B.t - A.t) : 1;
        const q = W.gleit || (W.gleit = { x: 0, y: 0, z: 0, g: 0, r: 0, a: 1 });
        q.x = A.x + (B.x - A.x) * a;
        q.y = A.y + (B.y - A.y) * a;
        q.z = A.z + (B.z - A.z) * a;
        q.g = A.g + Math.atan2(Math.sin(B.g - A.g), Math.cos(B.g - A.g)) * a;
        q.r = A.r + (B.r - A.r) * a;
        q.a = a;
        return q;
    }

    // DER VERKEHR IM BILD-TAKT (nach den Bewohnern, `_loopWeatherAndGrowth`): wer an seinem Werk steht und dessen Wagen parkt,
    // steigt ein; wessen Soll vom Werk geht, fährt heim; wessen Wagen heimkam, steigt aus. Der Leib am Steuer sitzt, wo der Sitz
    // des Wagens ihn trägt (`_applySeatPose` am Wagen, `_sitzLage`), gezeichnet nur in der 3D-Stufe seines Wagens (`_archTraegt`).
    _tickVerkehr() {
        const alle = this._bewohnerSiedlungen;
        const pm = this.state.playerMesh;
        if (!alle || !pm) return;
        const V = AnazhRealm.VERKEHR;
        const p = this._lodAuge() || pm.position; // das Auge der Stufen: die Nah-Wahl und die Stufe der Fahrer messen von ihm
        for (const S of alle.values()) {
            const VK = S.verkehr;
            if (!VK || !VK.wagen.length || !S.liste) continue;
            if (VK.boden && VK.boden.offen && VK.boden.offen.length) this._verkehrBodenPumpe(VK.boden);
            for (const W of VK.wagen) {
                // DAS BILD DES WAGENS je Bild (`_verkehrSchritt` merkt, wer sich bewegte, `bildAlt`): die Instanz-Matrix samt Rädern
                // schreibt das Bild, nicht der Schritt — bis w13-verkehr-heil schrieb sie jeder Sim-Schritt (stadt-voll 10 Uhr 0,25 von
                // 1,53 ms je Schritt, `_archInstanceUpdate`). DAS BILD GLEITET (`_verkehrGleit`): zwischen zwei Schritten zeichnet
                // jedes Bild die Lage seiner Zeit, sobald sie sich bewegt — der Leib am Steuer sitzt an derselben
                const sicht = W.entry && W.zustand === "faehrt" && (W.d2 < V.blickNahM * V.blickNahM || W.imBlick);
                const q = (W.gleitJetzt = sicht && !(this.state.player && this.state.player.mountedArch === W.entry.id) ? this._verkehrGleit(W) : null); // prettier-ignore
                const o = W.bildOrt;
                if (sicht && (W.bildAlt || (q && (!o || q.x !== o.x || q.y !== o.y || q.z !== o.z)))) {
                    this._verkehrBild(W.entry, q);
                    W.bildAlt = false;
                }
                // DER SCHICHTWECHSEL: steht der Wagen und will sein Fahrer nicht ans Werk, fährt, wer jetzt dorthin soll
                if (W.zustand === "steht" && !W.b.amSteuer && W.b.ziel !== W.b.orte.werk) {
                    const f = W.fahrer.find((x) => x.ziel === x.orte.werk);
                    if (f) W.b = f;
                }
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
                if (b.amSteuer) this._verkehrSitz(W, p);
            }
        }
    }

    // DER FAHRER IM BILD: DAS KOMPOSIT ERBT (das EINE Stufen-Gesetz) — wessen Wagen in einer 3D-Stufe gezeichnet ist
    // (`_archTraegt`), dessen Fahrer sitzt sichtbar am Steuer; die Kosten trägt die Stufe des Wagens (der Schirm, nie die Stadt),
    // je Bild zieht ein sichtbarer Leib seine Knochen nur nach, wenn sein Wagen sich bewegte. Leser: der Takt des Verkehrs
    // (`_tickVerkehr`, je Wagen nach dem Einsteigen — wer in diesem Takt einstieg, sitzt in diesem Bild) und DIE NAHT DER STUFE
    // (`_kompositErbt`: Culling und Stufen-Wahl laufen nach dem Takt des Verkehrs, vor dem Bild — der Wechsel setzt den Fahrer
    // im selben Bild). Bis w4-verkehr-c2 wählte das Maß der Bewohner (`BEWOHNER.nahLeiber`, 4) die Bedeutendsten (stadt-voll um
    // 10 Uhr fuhr jeder dritte Wagen im Bild leer, 4266 von 12098 Wagen-Bildern), danach urteilte der Takt vor dem Wechsel der
    // Stufe: der Wagen, der ins Bild kam, fuhr ein Bild lang leer (10 Uhr 24×, 23 Uhr 11× „im Bild ohne gezeichneten Fahrer").
    _verkehrSitz(W, p) {
        const g = W.b.leib;
        const e = W.entry;
        const sicht = this._archTraegt(e);
        if (sicht !== g.visible) g.visible = sicht;
        if (!sicht) {
            // ungezeichnet folgt der Leib seinem Wagen nur mit der Lage (kein Knochen): wer ihn liest (die Linse, die Ankunft),
            // findet ihn im Wagen — bis hier blieb er am Platz, an dem er einstieg
            g.position.set(e.position.x, e.position.y, e.position.z);
            W.sitzt = false;
            return;
        }
        // DER SICHTBARE LEIB AM STEUER: die Sitz-Pose hängt am Sitz des Wagens, nie an seiner Lage — gesetzt beim Eintritt ins
        // Bild und nach jedem Wechsel der Gelenk-Stufe (`_gelenkStufe` stellt die Knochen fern in Ruhe); die Knochen zieht er nur
        // nach, wenn sein Wagen sich seit dem letzten Bild bewegte (Kosten an Änderung). Bis hier rechnete `_sitzLage` je Bild
        // dieselbe Lage samt eigenem Knochen-Gang neu (Messort stadt, Null-Renderer: 0,12 ms je Takt im Stand)
        const fern = this._gelenkStufe(g, p, e.position); // die Stufe des Fahrers misst vom Wagen
        const sitzH = Number.isFinite(e._sitzHeight) ? e._sitzHeight : AnazhRealm.MOUNT_FOLLOW_HEIGHT;
        const q = W.gleitJetzt || e.position; // er sitzt, wo sein Wagen in diesem Bild gezeichnet ist (`_verkehrGleit`)
        const [x, y, z] = [q.x, q.y - 0.5 + sitzH + (e._rideHeave || 0), q.z];
        const gier = W.gleitJetzt ? W.gleitJetzt.g : Number.isFinite(e._rideYaw) ? e._rideYaw : g.rotation.y;
        const L = W.leibLage || (W.leibLage = { x: NaN, y: NaN, z: NaN, gier: NaN });
        if (W.sitzt && W.fern === fern && L.x === x && L.y === y && L.z === z && L.gier === gier) return;
        g.position.set(x, y, z);
        g.rotation.set(0, gier, 0);
        if (!W.sitzt || W.fern !== fern) {
            this._applySeatPose(g, 0, e);
            [W.sitzt, W.fern] = [true, fern];
        }
        this._leibMatrix(g);
        Object.assign(L, { x, y, z, gier });
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
        this._bewohnerRasterLage(S, b);
        g.userData._drinnen = true; // kein Feld trägt ihn (`_kzBesitztFeld`)
        if (g.userData._kzGlieder) for (const gl of g.userData._kzGlieder) this._weltFeldAktiv(gl.handle, false);
        g.visible = false;
        (e._passagiere || (e._passagiere = new Set())).add(g); // das Komposit: er zeigt sich nur mit der Stufe des Wagens
        W.sitzt = false;
        this._bewohnerSatzSchreiben(S);
        this._blockerWacheMelden(e._blockerHuelle, false, e);
        e._verkehrFaehrt = true;
        this._archFahrt(e, true); // seine Stufe folgt auch dem wandernden Auge (`_archBewegteUrteilen`)
        W.zustand = "faehrt";
        W.heim = false;
        W.letzter = null;
        this._verkehrZielNeu(S, W, W.ki); // die erste Fahrt: von der Wende seines Platzes zu einer anderen
        W.fahrtAb = W.uhr;
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
            // kein Leib und kein Stand eines Bewohners unter ihm (wer dort steht, geht oder noch hinkommt, stünde in der Hülle).
            // WER NOCH ANKOMMT, STEHT NIRGENDS (w28-verkehr-takt, mensch.K2: der Tag nach dem Sprung ist f(Same, t)): sein Leib
            // steht, wo er VOR dem Sprung stand — das Raster der Leiber führt ihn nicht (`_bewohnerRasterLage`, seit heil-wackler),
            // der Wagen sah ihn hier weiter. Der Fahrer steigt in der Reihe der Liste ein, die Köpfe hinter ihm kommen erst an:
            // stand einer von ihnen vor dem Sprung auf dem Punkt des Samens, rückte der Wagen weiter oder blieb am Platz, und die
            // Stunde danach hing an der Vorgeschichte der Seite (stadt-voll 10 Uhr, vier Läufe desselben Stands: Wagen 16 begann
            // 82,9 · 0 · 0 · 98,0 m auf seiner Route; fahrend je Minute 67 · 67 · 48 · 39 · 39 · 52 m, im Zug 28)
            const nah = (o) => o && Math.hypot(o.x - q.x, o.z - q.z) < W.hl + 1;
            const unter = (b) =>
                (b.leib && !b.drinnen && !b.amSteuer && !b.ankunft && nah(b.leib.position)) ||
                nah(b.orte.heim) ||
                nah(b.orte.platz) ||
                nah(b.orte.werk) ||
                nah(b.orte.besuch);
            if (S.liste.some(unter)) continue;
            if (W.zonen.some((z) => s + W.hl >= z.ein - 2 && s - W.hl <= z.aus + 2)) continue;
            const fahrt = Math.atan2(r.x - q.x, r.z - q.z);
            Object.assign(fz, { x: q.x, z: q.z, yaw: fahrt - Math.PI / 2, ...AnazhRealm.VERKEHR_STEHT, y: NaN });
            e._rideYaw = fahrt;
            e.position.x = q.x;
            e.position.z = q.z;
            const { vc } = AnazhRealm._fahrSchrittGesetz();
            vc.fahrStand(fz, e._fahrSatz, this._fahrBoden(e), 0);
            if (Number.isFinite(fz.y)) this._wagenLage(e, fz);
            // der neue Platz gestempelt (kein Beweger); der nächste Fahr-Schritt stempelt mit seinem Rand (`_wagenSchritt`)
            this._blockerBewegt(e, e.blockerAABBs ? 0 : undefined);
            if (e.blockerAABBs) {
                this._populateBlockerAABBs(e);
                e._blockerStampAt = null;
            }
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
        W.heimWeg = this._verkehrWegZu(S, W.ki);
    }

    // DAS ZIEL DER FAHRT (PFLICHT-OFFEN C: jeder Wagen erreicht sein Ziel): eine Wende der Stadt außer der, an der er ist (`von`),
    // gewählt vom Samen seines Wagens — dorthin fährt er den kürzesten Weg (`_verkehrWegZu`), durch ihren Kreis, dann zur nächsten.
    // Bis hier wählte der Same an jeder Kreuzung eine Strecke: der Wagen fuhr, kam aber nirgends an.
    _verkehrZielNeu(S, W, von) {
        const wahl = [...S.verkehr.wenden.keys()].filter((ki) => ki !== von);
        if (!wahl.length) return;
        W.ziel = wahl[Math.floor(W.gen.axis("ziel" + W.zielN++) * wahl.length) % wahl.length];
        W.zielWeg = this._verkehrWegZu(S, W.ziel);
        S.verkehr.zahl.ziele.gesetzt++;
    }

    // ANGEKOMMEN (die Wende seines Ziels liegt hinter ihm, `_verkehrZonen`; heim: er parkt): die Fahrt ist gezählt — ihre Dauer in
    // der Uhr seines Wagens (`W.uhr`, die Zeit seiner Sim-Schritte), die längste je Stadt; die nächste beginnt hier.
    _verkehrAngekommen(S, W) {
        const Z = S.verkehr.zahl.ziele;
        const d = W.uhr - W.fahrtAb;
        W.ziele++;
        Z.erreicht++;
        if (d > Z.laengsteS) Z.laengsteS = d;
        W.fahrtAb = W.uhr;
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
            Object.assign(fz, { x: p.x, z: p.z, yaw: p.fahrt - Math.PI / 2, ...AnazhRealm.VERKEHR_STEHT, y: NaN });
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
        if (W.entry && W.entry._passagiere) W.entry._passagiere.delete(g);
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
        this._bewohnerRasterLage(S, b);
        this._bewohnerWecken(S, b); // sein Takt geht ab hier wieder im Gedränge
        W.sitzt = false;
    }

    // DER WAGEN PARKT: er steht (Federn null, die Ebene seiner Räder), seine Orte gibt er frei, er wird Wand der Wege.
    _verkehrParken(S, W) {
        const e = W.entry;
        const fz = e._fahr;
        Object.assign(fz, AnazhRealm.VERKEHR_STEHT, {
            vy: 0,
            fNick: 0,
            fNickV: 0,
            fWank: 0,
            fWankV: 0,
            fHub: 0,
            fHubV: 0,
        });
        for (const Z of S.verkehr.zonen) {
            AnazhRealm._verkehrLos(Z, W);
            AnazhRealm._verkehrReihe(Z, W, false);
        }
        W.zustand = "steht";
        W.zonen = [];
        W.letzter = null;
        W.F = null;
        e._verkehrFaehrt = false;
        this._archFahrt(e, false);
        this._blockerBewegt(e, e.blockerAABBs ? 0 : undefined); // er steht: sein Platz ohne Rand, kein Beweger
        if (e._fahrAchseX) this._wagenGrund(e); // der Halm weicht dem geparkten Wagen
        if (e.blockerAABBs) {
            this._populateBlockerAABBs(e);
            e._blockerStampAt = null;
        }
        this._verkehrBild(e);
    }

    // DER SPRUNG DER UHR (`_tickBewohner`, mensch.K2: der Tag danach ist f(Same, t)) trifft auch den Wagen: wer am Steuer sitzt,
    // steigt aus, jeder Wagen steht frisch auf seinem Platz (ein neuer Fahr-Zustand, der Fahrer ohne Gas und Lenkung), seine nächste
    // Fahrt beginnt, wo sein Tag ihn sähe (`ankunft`), die Ziele und Züge seines Samens zählen von vorn, sein Takt steht wie beim
    // Anlegen, und kein Warten, Stehen oder Umfahren der Fahrt davor bleibt. Bis w13-verkehr-heil trug der Wagen seine Geschichte
    // über den Sprung (Lenkwinkel, Zähler des Samens, Takt): wer vorher öfter fuhr, wählte danach ein anderes Ziel, und dieselbe
    // Stunde fuhr je Lauf anders (die Linse VK um 10 Uhr: drei Läufe desselben Stands, drei Urteile).
    _verkehrSprung(S) {
        const { vc } = AnazhRealm._fahrSchrittGesetz();
        for (const W of S.verkehr.wagen) {
            if (W.b.amSteuer) this._verkehrAussteigen(S, W.b, true);
            const [e, p] = [W.entry, W.park];
            [e._rideYaw, e.position.x, e.position.z] = [p.fahrt, p.x, p.z];
            const fz = (e._fahr = vc.fahrZustand(p.x, p.z, p.fahrt - Math.PI / 2));
            vc.fahrStand(fz, e._fahrSatz, this._fahrBoden(e), 0);
            if (Number.isFinite(fz.y)) this._wagenLage(e, fz);
            const folgeH = (W.nr % AnazhRealm.VERKEHR.folgeTakt) * AnazhRealm.FIXED_DT; // wie beim Anlegen
            Object.assign(W, {
                T: { gas: 0, bremse: 0, lenken: 0, handbremse: true },
                ankunft: true,
                zielN: 0,
                zugN: 0,
            });
            Object.assign(W, { takt: W.nr, denk: 0, folgeH, dtAcc: 0, aufgeschoben: false, kurz: false, heim: false });
            Object.assign(W, {
                leibS: 0,
                warteS: 0,
                stehtS: 0,
                festOrt: null,
                umfahr: null,
                weicht: null,
                gesperrt: false,
                wartet: null,
            });
            Object.assign(W, {
                vorne: null,
                vorder: null,
                grund: null,
                wer: null,
                platzLeib: null,
                bildRuht: false,
                bildAlt: true,
                // das gleitende Bild (`_verkehrGleit`): die Spur der Zustände, die Uhr des Bilds, die Lage dieses Bilds, wo es steht
                ...{ spur: null, bildD: NaN, bildR: NaN, gleit: null, gleitJetzt: null, bildOrt: null },
            });
        }
    }

    // DIE ROUTE IM VORAUS: die nächsten Züge (Strecke in einer Richtung, Wende, aus dem Platz, in den Platz) nach dem letzten
    // (`W.letzter`; keiner: aus dem Platz), bis `vorausM` Meter neu sind. Nach einer Strecke an einer Kreuzung die Strecke des
    // kürzesten Wegs zu seinem Ziel (`W.zielWeg`; trägt der Abbieger sie nicht, wählt der Same eine der anderen fahrbaren, nie
    // zurück), am Ende die Wende — ist sie sein Ziel, trägt ihr Zug es (`ziel`) und das nächste gilt; heim (`W.heimWeg`) der
    // kürzeste Weg zur Wende seines Platzes, dort hinein — dann endet die Route.
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
                const ziel = !W.heim && ki === W.ziel;
                legen(W.heim && ki === W.ki ? { art: "ein", ki } : { art: "wende", ki, ziel });
                if (ziel) this._verkehrZielNeu(S, W, ki);
                continue;
            }
            // die Abbieger des Netzes in seiner Richtung (`VK.folge`) und der kürzeste zu seinem Ziel (`_verkehrWegZu`); trägt
            // keiner das Ziel (es liegt außer dem Netz — nie im stark zusammenhängenden Teil), irrt er, gezählt (`zahl.irrweg`)
            const an = VK.folge[2 * m.si + m.dir].map((y) => y >> 1);
            const zu = W.heim ? W.heimWeg : W.zielWeg;
            let si = zu ? zu.get(2 * m.si + m.dir) : undefined;
            if (si === undefined || !an.includes(si)) {
                VK.zahl.irrweg++;
                si = an[Math.floor(W.gen.axis("zug" + W.zugN++) * an.length) % an.length];
            }
            if (si === undefined) break;
            // durch die Kreuzung der Weg des Gesetzes (gerade oder im Bogen, `wege`)
            const vor = (VK.kp[ki].wege || {})[m.si + ">" + si] || [];
            legen({ art: "strecke", si, dir: VK.strecken[si].a === ki ? 0 : 1, vor, von: m.si });
        }
        return neu;
    }

    // DER WEG ZUR WENDE `ki` (heim zur Wende seines Platzes, `_verkehrHeim`; zum Ziel der Fahrt, `_verkehrZielNeu`) im Netz in
    // seiner Richtung (`VK.folge`, Strecke × Richtung): je Zustand die Strecke, über die der kürzeste Weg aus seinem Ende zu ihr
    // geht — rückwärts von den Zuständen, die in ihr Ende fahren (Dijkstra über die Vorgänger `VK.vor`), je Wende einmal: das
    // Netz steht. Bis hier zählte die Richtung nicht (Dijkstra über die Knotenpunkte): verbot das Gesetz der Kreuzung den
    // Abbieger, wählte der Same, und der Wagen irrte.
    _verkehrWegZu(S, ki) {
        const VK = S.verkehr;
        const memo = VK.wegZu || (VK.wegZu = new Map());
        if (memo.has(ki)) return memo.get(ki);
        const nZ = VK.folge.length;
        const lang = (z) => VK.strecken[z >> 1].laenge;
        const dist = new Float64Array(nZ).fill(Infinity);
        const offen = [];
        for (let z = 0; z < nZ; z++) {
            const s = VK.strecken[z >> 1];
            if (VK.folge[z].length && (z & 1 ? s.a : s.b) === ki) [dist[z], offen[offen.length]] = [lang(z), z];
        }
        while (offen.length) {
            offen.sort((a, b) => dist[b] - dist[a]);
            const z = offen.pop();
            for (const y of VK.vor[z])
                if (dist[z] + lang(y) < dist[y]) {
                    dist[y] = dist[z] + lang(y);
                    offen.push(y);
                }
        }
        const ueber = new Map();
        for (let z = 0; z < nZ; z++) {
            let b = -1;
            for (const y of VK.folge[z]) if (dist[y] < (b < 0 ? Infinity : dist[b])) b = y;
            if (b >= 0) ueber.set(z, b >> 1);
        }
        memo.set(ki, ueber);
        return ueber;
    }

    // DIE PUNKTE EINES ZUGS: die Spur der Strecke in seiner Richtung; die Bahn der Wende; aus dem Platz (vorwärts auf den Kreis,
    // den Bogen bis zum Übergang der Wende `aus` in die Spur) und in ihn (über den Übergang `ein` an den Kreis, den Bogen bis vor den
    // Platz, auf ihn). Zwischen Platz und Kreis
    // fährt er erst den Bogen seines Wendekreises (`kurveR`, bis 45°), der in der Richtung des Platzes beginnt (endet): so fährt
    // ihn der Wagen — und der Wagen im Platz vor (hinter) ihm steht auf ihm, er wartet, bis der fort ist. Bis hier lief die Sehne
    // zum Kreis 48° aus dem Stand: der Wagen fuhr geradeaus in den Platz vor ihm (23 Uhr, die Wende der Metropole: 92 und 123
    // Berührungen).
    _verkehrZugPunkte(S, W, m) {
        const VK = S.verkehr;
        if (m.art === "strecke") {
            return (m.vor || []).concat(this._verkehrSpur(VK, VK.strecken[m.si], m.dir));
        }
        const w = VK.wenden.get(m.ki);
        if (m.art === "wende") return w.bahn;
        const pk = W.park;
        const kreis = (a) => ({ x: w.x + Math.cos(a) * w.r, z: w.z + Math.sin(a) * w.r });
        const um = (a, b) => {
            let d = (b - a) * w.dreh;
            d -= Math.floor(d / (2 * Math.PI)) * 2 * Math.PI;
            return d;
        };
        const [tx, tz] = [Math.sin(pk.fahrt), Math.cos(pk.fahrt)];
        const bogen = (s) => this._verkehrPlatzBogen(w, pk, s);
        const schritt = AnazhRealm.VERKEHR.platzBogenM / w.r;
        const pts = [];
        if (m.art === "aus") {
            const { B, a } = bogen(1);
            pts.push({ x: pk.x, z: pk.z }, ...B);
            const a0 = a + w.dreh * schritt;
            const span = um(a0, w.aout);
            for (let t = 0; t <= span + 1e-9; t += 1 / w.r) pts.push(kreis(a0 + w.dreh * t));
            pts.push(...w.aus); // vom Kreis über den Übergang der Wende in die Spur hinaus (fachwerk `uebergang`)
            return pts;
        }
        const { B, a } = bogen(-1);
        const span = um(w.ain, a - w.dreh * schritt);
        pts.push(...w.ein); // aus der Spur über den Übergang der Wende an den Kreis
        for (let t = 0; t <= span + 1e-9; t += 1 / w.r) pts.push(kreis(w.ain + w.dreh * t));
        pts.push(...B.reverse());
        pts.push({ x: pk.x, z: pk.z });
        pts.push({ x: pk.x + tx * 0.6, z: pk.z + tz * 0.6 });
        return pts;
    }

    // DER BOGEN ZWISCHEN PLATZ UND KREIS (die Wende `w`, der Platz `pk`): vom Platz (vorwärts, s = 1: aus ihm; rückwärts, s = −1:
    // in ihn) der Bogen seines Wendekreises (`kurveR`) zur Seite der Mitte, bis 45° oder bis er den Kreis trifft — { B: seine
    // Punkte, a: der Winkel am Kreis }. Leser: die Züge aus dem Platz und in ihn (`_verkehrZugPunkte`) und der Boden der Wende
    // (`_verkehrAnlegen`: er trägt Weg wie Ring und Platz).
    _verkehrPlatzBogen(w, pk, s) {
        const R = globalThis.__fachwerkCore.VERKEHR_GESETZ.kurveR;
        const [tx, tz] = [Math.sin(pk.fahrt), Math.cos(pk.fahrt)];
        const innen = -tz * (w.x - pk.x) + tx * (w.z - pk.z) > 0 ? 1 : -1;
        const [nx, nz] = [-tz * innen, tx * innen];
        const B = [];
        const n = Math.ceil((Math.PI / 4) * R);
        for (let k = 1; k <= n; k++) {
            const f = (k * Math.PI) / 4 / n;
            const q = {
                x: pk.x + nx * R * (1 - Math.cos(f)) + s * tx * R * Math.sin(f),
                z: pk.z + nz * R * (1 - Math.cos(f)) + s * tz * R * Math.sin(f),
            };
            B.push(q);
            if (Math.hypot(q.x - w.x, q.z - w.z) <= w.r) break;
        }
        const q = B[B.length - 1];
        return { B, a: Math.atan2(q.z - w.z, q.x - w.x) };
    }

    // DIE GEFAHRENE SPUR einer Strecke in der Richtung `dir` (0: von a nach b) — DER ABZWEIG DER WENDE (fachwerk `verkehrsNetz`:
    // `einAb`, `ausAb`): die Spur in ein Ende endet, wo die Bahn hinein sie verlässt; die Spur aus ihm beginnt, wo die Bahn heraus
    // sie trifft — das Stück dahinter fährt keiner. Leser: die Punkte eines Zugs (`_verkehrZugPunkte`) und die Engen
    // (`_verkehrAnlegen`: ein Ort nur, wo eine gefahrene Spur ihn trägt).
    _verkehrSpur(VK, s, dir) {
        const [wA, wB] =
            dir === 0 ? [VK.wenden.get(s.a), VK.wenden.get(s.b)] : [VK.wenden.get(s.b), VK.wenden.get(s.a)];
        const P = s.spur[dir];
        return P.slice(wA ? wA.ausAb : 0, P.length - (wB ? wB.einAb : 0));
    }

    // DIE ORTE EINES ZUGS, die einer zur Zeit befährt (in seiner Folge, je Ort {Z, dir}): die Kreuzung an seinem Anfang (durch sie
    // führt sein Weg, `vor` — so liegt sie in derselben Linie wie der Zug, der sie durchfährt), dann die Engen der Strecke in ihrer
    // Richtung (dir: wer in derselben Richtung fährt, folgt dem, der schon darin ist); die Wende samt Platz.
    _verkehrZugZonen(S, m) {
        const VK = S.verkehr;
        if (m.art !== "strecke") {
            // DIE BEGEGNUNG DER WENDE (`w.engZonen`, vom Abzweig her): wer hinein fährt (Durchfahrt, in den Platz), durchfährt sie
            // vor der Wende in Richtung 0, wer heraus fährt (Durchfahrt, aus dem Platz), danach in Richtung 1 — dieselbe Enge zweimal
            // in EINEM Zug, die zweite Durchfahrt hinter der ersten (`_verkehrLinie`). Bis hier begegneten sich dort zwei Wagen, die
            // beide den Schlüssel der Wende hielten (die Durchfahrten verträglich): stadt-voll 908/289, 0,08 m bis „Wagen in Wagen"
            const w = VK.wenden.get(m.ki);
            const hin = m.art === "aus" ? [] : w.engZonen.map((Z) => ({ Z, dir: 0 }));
            const her = m.art === "ein" ? [] : w.engZonen.map((Z) => ({ Z, dir: 1 })).reverse();
            return [...hin, { Z: w.zone, dir: null, ziel: !!m.ziel, durch: m.art === "wende" }, ...her];
        }
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
        // DER REST DER ALTEN LINIE AUS IHRER ROUTE (`roh`, die Punkte vor der Glättung): bis w13-verkehr-heil glättete jedes Anhängen
        // und jedes Umfahren den schon geglätteten Rest noch einmal über ±`kurveM` — der Ring der Wende (7 m) schrumpfte mit jedem
        // Durchgang zu seiner Mitte, und wer ihn fuhr, fuhr in sein Inneres (stadt-voll 23 Uhr: Wagen 1 stand 2,8 m neben der Mitte
        // der Wende 924/354 vor dem Hang, 35 s ohne Grund)
        if (!anfang && alt) {
            dazu({ x: e.position.x, z: e.position.z });
            for (let i = alt.i + 2; i < alt.roh.length; i++) dazu(alt.roh[i]);
            for (const z of W.zonen)
                if (!z.weg)
                    Z.push({
                        Z: z.Z,
                        dir: z.dir,
                        wort: z.wort,
                        ziel: z.ziel,
                        durch: z.durch,
                        hat: z.hat,
                        von: Math.max(0, z.ein - alt.s) - 3,
                        bis: z.aus - alt.s + 3,
                    });
        }
        for (const m of zuege) {
            const von = L - 3;
            for (const q of m.pts) dazu(q);
            for (const z of m.zonen)
                if (!Z.length || Z[Z.length - 1].Z !== z.Z)
                    Z.push({
                        Z: z.Z,
                        dir: z.dir,
                        wort: z.wort,
                        ziel: z.ziel,
                        durch: z.durch,
                        von,
                        bis: L + 2 * z.Z.r + 5,
                    });
        }
        const F = this._fahrerLinie(pts, AnazhRealm.VERKEHR.kurveM, AnazhRealm.VERKEHR.stil);
        if (!F) return;
        W.F = F;
        // die Ausscherung je Punkt (`_verkehrFolge`, `rundAn`): l²·κ/2, κ die schärfste Krümmung binnen seiner halben Länge um ihn
        // (höchstens die des Wendekreises) — einmal je Linie, nie je Ecke und Leib
        const kR = globalThis.__fachwerkCore.VERKEHR_GESETZ.kurveR;
        F.rund = F.k.map((_, i) => {
            let k = 0;
            for (let j = i; j >= 0 && F.bogen[i] - F.bogen[j] <= W.hl; j--) if (F.k[j] > k) k = F.k[j];
            for (let j = i + 1; j < F.k.length && F.bogen[j] - F.bogen[i] <= W.hl; j++) if (F.k[j] > k) k = F.k[j];
            return (W.hl * W.hl * Math.min(2 * k, 1 / kR)) / 2;
        });
        const vorher = W.zonen;
        W.zonen = [];
        // DIE DURCHFAHRT (EIN Gesetz, unten ihr Ende): tritt ein Ort zweimal in die Linie (die Enge vor der Wende hinein und
        // heraus), beginnt die zweite Durchfahrt hinter der ersten
        const nach = new Map();
        for (const { Z: z, dir, wort, ziel, durch, hat, von, bis } of Z) {
            const i0 = nach.has(z) ? nach.get(z) + 1 : 0;
            let i = i0;
            while (i < F.pts.length && F.bogen[i] < von) i++;
            while (i < F.pts.length && F.bogen[i] <= bis && Math.hypot(F.pts[i].x - z.x, F.pts[i].z - z.z) >= z.r) i++;
            if (i >= F.pts.length || F.bogen[i] > bis) continue;
            // die Durchfahrt beginnt, wo die Linie in EINEM Zug in den Kreis tritt — auch vor dem Fenster ihres Zugs: die Bahn heraus
            // der Wende läuft schon im Kreis der Enge, deren Spur sie trifft (stadt-voll, die Wende 741/579: 5 m vor der Mitte der
            // Enge 736/556), und wer dort wartete, wartete in ihr (10 Uhr 521× „ohne Schlüssel im Ort")
            while (i > i0 && Math.hypot(F.pts[i - 1].x - z.x, F.pts[i - 1].z - z.z) < z.r) i--;
            let j = i;
            while (j + 1 < F.pts.length && Math.hypot(F.pts[j + 1].x - z.x, F.pts[j + 1].z - z.z) < z.r) j++;
            // DIE KREUZUNG REICHT, SO WEIT ZWEI BAHNEN DEN RAUM TEILEN (Dresner & Stone: reserviert ist die Fläche, die zwei
            // Bahnen teilen, nie ein Kreis): die Durchfahrt beginnt, wo seine Bahn (halber Wagen samt Ausscheren und `seitM`) der
            // Spur eines ANDEREN Arms näher kommt als deren halbe Breite, und endet, wo sie hinter der Kreuzung wieder frei von
            // jedem anderen Arm liegt — vor ihr hält er dort (die Haltelinie), in ihr hält er sie bis dorthin. Bis w28-verkehr-graph
            // war sie der Kreis des Gesetzes (`K.r`): wo zwei Arme spitz zusammenlaufen, lag die Haltelinie des einen in der Bahn
            // aus der Kreuzung in den anderen — stadt („dorf 7 120"), die Kreuzung am Markt 663/422, Arme West und Nordwest 28°
            // auseinander: die Limousine 2 hielt 0,9 m vor dem Kreis, ihre Ecke 0,54 m neben der Linie des Halters 4 (halbe
            // Breite 0,95), 4 stand in der Kreuzung vor ihr, sie vor 4 — nach 20 s stand der Markt, 3 Ankünfte in 190 s
            if (z.arme && wort) {
                const [arm0, arm1] = wort.split(">").map(Number);
                const breit = W.hw + globalThis.__fachwerkCore.VERKEHR_GESETZ.halbM + AnazhRealm.VERKEHR.seitM;
                const teilt = (k, arm) => AnazhRealm._verkehrArmNah(z, F.pts[k], arm, breit + F.rund[k]);
                while (i > i0 && teilt(i - 1, arm0)) i--;
                while (j + 1 < F.pts.length && teilt(j + 1, arm1)) j++;
            }
            nach.set(z, j);
            // die Wende beginnt eine Wagenlänge vor ihrer Bahn: wer aus ihr in seine Spur einbiegt, hat den Bogen am Ende der
            // Strecke hinter sich, bevor er den Wartenden passiert — bis hier wartete der im Bogen (10 Uhr: beide 40 s, der
            // Wartende 1,21 m neben der Bahn bei 1,31 m Breite samt Bogen)
            const vorlauf = z.art === "wende" ? globalThis.__fachwerkCore.VERKEHR_GESETZ.parkL : 0;
            W.zonen.push({
                Z: z,
                dir,
                wort,
                ziel,
                durch,
                ein: Math.max(0, F.bogen[i] - vorlauf),
                aus: F.bogen[j],
                weg: false,
                hat: !!hat,
            });
        }
        W.zonen.sort((a, b) => a.ein - b.ein);
        // DIE DURCHFAHRT HÄLT, SOLANGE ER ZWISCHEN DEN ORTEN NIE HÄLT (das Gesetz der Kette: wer zwischen zwei Orten nicht halten
        // kann, fährt beide mit einem Schlüssel): verlässt die Linie den Kreis einer Enge und tritt sie wieder in ihn, ohne
        // dazwischen einen Punkt außerhalb jedes Orts seiner Linie zu berühren (der Ring der Wende, deren Bahn hinein und heraus
        // den Kreis kreuzen), reicht die Durchfahrt bis zum letzten Punkt dieses Wiedereintritts — vor der nächsten Durchfahrt
        // desselben Orts (oben, `nach`). Bis hier endete sie am ersten Austritt: an der Wende 994/372 von stadt-voll fuhr die Bahn heraus durch
        // den Kreis der Enge 980,8/366, ohne dass eine Durchfahrt sie trug — Wagen 18 fuhr dort ohne Schlüssel (10 Uhr 207×,
        // 23 Uhr 247×), verdeckt, solange die Kette den Schlüssel der gefahrenen Durchfahrt noch einmal nahm und nie abgab.
        const imOrt = (k) => W.zonen.some((y) => Math.hypot(F.pts[k].x - y.Z.x, F.pts[k].z - y.Z.z) < y.Z.r);
        for (const [n, y] of W.zonen.entries()) {
            if (y.Z.art !== "enge") continue;
            const naechste = W.zonen.slice(n + 1).find((x) => x.Z === y.Z);
            const drin = (k) => Math.hypot(F.pts[k].x - y.Z.x, F.pts[k].z - y.Z.z) < y.Z.r;
            let k = 0;
            while (k < F.pts.length && F.bogen[k] <= y.aus) k++;
            for (; k < F.pts.length && imOrt(k) && !(naechste && F.bogen[k] >= naechste.ein); k++)
                if (drin(k)) y.aus = F.bogen[k];
        }
        // was er hielt und in der neuen Linie nicht mehr hält (keine gehaltene Durchfahrt desselben Orts), gibt er frei
        for (const a of vorher) if (a.hat && !W.zonen.some((z) => z.hat && z.Z === a.Z)) AnazhRealm._verkehrLos(a.Z, W);
    }

    // DER VERKEHR IM SIM-SCHRITT (`_stepFixedSim`, nach dem Nachlauf): je fahrendem Wagen nach seiner Stufe (die Ferne und der
    // Schirm sparen Aufrufe, nie Zeit — derselbe Schritt mit der gesammelten Zeit) der Fahrer (Folge, Orte, `_fahrerSchritt`), der
    // EINE Fahr-Schritt des Kerns, die Lage und das Bild; vorn hängt die Route ihre nächsten Züge an, heim parkt der Wagen am Ende.
    // DIE KOSTEN (Gebot 7: an Schirm und Änderung, nie an der Zahl der Wagen): die Stufe ist die Leiter vom Auge (`VERKEHR.leiter`)
    // und außer dem Blick der Kamera (jenseits der Hülle) mindestens `ausBlick`; höchstens `kappe` Wagen schreiten je Sim-Schritt —
    // wer fällig ist und darüber liegt, schreitet im nächsten mit seiner Zeit, zuerst wer am weitesten hinter seiner Stufe liegt
    // (keiner verhungert), im Blick vor dem Rest. Wer vor ihm fährt, findet die Belegung (`_verkehrBelegung`), nie die ganze Stadt.
    // Bis w13-verkehr-heil schritt jeder Fällige, und jeder fragte jeden (stadt-voll 23 Uhr an der Radeon: CPU-Takt p50 16,5 →
    // 37,3 ms, die Fege-Takte der Nah-Wiese verhungerten über dem Markt)
    _verkehrSchritt(dt) {
        const alle = this._bewohnerSiedlungen;
        const pm = this.state.playerMesh;
        if (!alle || !pm) return;
        this._verkehrBlick = null; // das Frustum der Kamera, einmal je Schritt (`_verkehrImBlick`)
        const V = AnazhRealm.VERKEHR;
        const { vc } = AnazhRealm._fahrSchrittGesetz();
        const p = pm.position;
        const auge = this._lodAuge() || p;
        const pl = this.state.player;
        for (const S of alle.values()) {
            const VK = S.verkehr;
            if (!VK || !VK.wagen.length) continue;
            this._verkehrBelegung(VK);
            const faellig = VK.faellig || (VK.faellig = []);
            faellig.length = 0;
            for (const W of VK.wagen) {
                const e = W.entry;
                if (W.zustand !== "faehrt" || !e || !e._fahr || !W.F) continue;
                if (pl && pl.mountedArch === e.id) continue; // der Spieler sitzt am Steuer: der Ritt führt
                W.dtAcc += dt;
                W.d2 = (e.position.x - p.x) ** 2 + (e.position.z - p.z) ** 2;
                const a2 = (e.position.x - auge.x) ** 2 + (e.position.z - auge.z) ** 2;
                let k = 1;
                for (const [m, n] of V.leiter) if (a2 >= m * m) k = n;
                // DAS LETZTE BILD ZÄHLT MIT (w28-verkehr-bild): wer außer Blick fuhr, ließ sein Bild am Rand des Blicks stehen — dreht
                // die Kamera, stand dort ein Wagen, der längst weiterfuhr (Werkbank am Messort stadt: Bild 17–94 m neben der Lage
                // dreier Wagen außer Blick). Steht sein Bild im Blick, zeichnet er nach und verlässt ihn
                W.imBlick =
                    this._verkehrImBlick(e.position, W.hl + 1) ||
                    (W.bildAlt && !!W.bildOrt && this._verkehrImBlick(W.bildOrt, W.hl + 1));
                if (!W.imBlick && W.d2 >= V.huelleM * V.huelleM) k = Math.max(k, V.ausBlick);
                W.k = k;
                if ((W.takt = (W.takt + 1) % k) !== 0 && !W.aufgeschoben) continue;
                faellig.push(W);
            }
            if (faellig.length > V.kappe) {
                // der Verzug: die gesammelte Zeit je Schritt seiner Stufe — wer aufgeschoben wurde, liegt vorn
                faellig.sort((a, b) => b.dtAcc / b.k - a.dtAcc / a.k || b.imBlick - a.imBlick);
                for (let n = V.kappe; n < faellig.length; n++) faellig[n].aufgeschoben = true;
                VK.zahl.aufgeschoben = (VK.zahl.aufgeschoben || 0) + faellig.length - V.kappe;
                faellig.length = V.kappe;
            }
            for (const W of faellig) {
                W.aufgeschoben = false;
                const e = W.entry;
                const [d2, k] = [W.d2, W.k];
                const h = W.dtAcc;
                W.dtAcc = 0;
                W.uhr += h; // die Uhr des Wagens: die Dauer jeder Fahrt (`_verkehrAngekommen`)
                let F = W.F;
                // DER FAHRER SIEHT (Folge, Orte) je `folgeTakt` Sim-Schritte seiner Zeit (nah und fern: wer fern seltener schreitet,
                // sieht in seinem Schritt, sobald die Zeit voll ist — bis hier sah der Wagen zwischen 40 und 100 m öfter als der nahe)
                // und LENKT nah jeden `denkTakt`-ten Schritt — die Physik und das Bild tragen jeden (Lehre 25: 50 ms Blick bei 30 km/h
                // sind 0,42 m, die Haltelinie fragt `frageM` voraus; der Wagen fährt glatt); fern lenkt er in jedem seiner Schritte
                W.folgeH = (W.folgeH || 0) + h;
                if (W.folgeH >= V.folgeTakt * AnazhRealm.FIXED_DT - 1e-9) {
                    F.deckel = this._verkehrFolge(S, W, p, W.folgeH);
                    W.folgeH = 0;
                    if (W.umfahr && this._verkehrUmfahren(S, W, W.umfahr)) F = W.F;
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
                // DIE SPUR DER ZUSTÄNDE (Fiedler „Fix Your Timestep!", der Puffer der Interpolation wie in Source „entity
                // interpolation"): die Lagen der letzten `spurN` Schritte auf der Uhr des Wagens — das Bild gleitet zwischen ihnen
                // (`_verkehrGleit`). Steht der Wagen nicht, wo der letzte Schritt ihn ließ (gestellt, die Ankunft), beginnt sie neu
                const Sp = W.spur || (W.spur = []);
                const L0 = Sp[Sp.length - 1];
                if (!L0 || L0.x !== e.position.x || L0.z !== e.position.z || L0.y !== e.position.y) Sp.length = 0;
                if (!Sp.length) this._verkehrZustand(W, Sp, W.uhr - h);
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
                this._verkehrZustand(W, Sp, W.uhr);
                // DAS BILD zahlt, wer sich bewegte und im Blick ist (Gebot 7: Kosten an Schirm und Änderung) — einmal je Bild im
                // Takt des Verkehrs (`_tickVerkehr`), nie je Sim-Schritt: wer außer Blick fuhr, zeichnet nach, sobald er hineinkommt
                W.bildAlt = W.bildAlt || !ruht || !W.bildRuht;
                W.bildRuht = ruht;
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
                // die Route voraus: trägt die Linie keine `vorausM` / 2 mehr oder nicht die ganze Kette vor ihm (`kurz`,
                // `_verkehrZonen`), hängen die nächsten Züge an
                if (W.letzter && W.letzter.art !== "ein" && (W.kurz || F.lang - F.s < V.vorausM / 2)) {
                    W.kurz = false;
                    this._verkehrLinie(S, W, this._verkehrZuege(S, W), false);
                }
                if (W.heim && F.ende && fz.speed < V.parkMs) {
                    this._verkehrAngekommen(S, W); // heim: sein Platz ist das Ziel der letzten Fahrt
                    this._verkehrParken(S, W);
                }
            }
        }
    }

    // DIE BELEGUNG (Gebot 7: wer vor ihm fährt, kostet die Nachbarschaft, nie die Stadt): je Zelle von `belegungM` die Wagen, deren
    // Mitte in ihr liegt — einmal je Sim-Schritt gelegt; die Folge (`_verkehrFolge`) fragt nur die Zellen um ihr Fenster, samt
    // `belegungRandM` (so weit fährt ein Wagen der fernsten Stufe in einem Schritt) — dieselben Wagen wie die ganze Liste.
    _verkehrBelegung(VK) {
        const B = VK.belegung || (VK.belegung = new Map());
        for (const l of B.values()) l.length = 0;
        const M = AnazhRealm.VERKEHR.belegungM;
        for (const W of VK.wagen) {
            const e = W.entry;
            if (!e) continue;
            const k = Math.floor(e.position.x / M) * 2097152 + Math.floor(e.position.z / M);
            (B.get(k) || (B.set(k, []), B.get(k))).push(W);
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
        [W.grund, W.wer, W.umfahr] = [null, null, null];
        // DIE ANKUNFT (die Uhr sprang, `_tickBewohner` stellt jeden Leib, wo sein Tag ihn sieht — `ankunftJeTakt` je Takt): bis
        // jeder steht, hält der Wagen — bis hier stand einer 2 m vor einem Wagen mit 6,5 m/s, den er nie kommen sah
        if (S.ankunftOffen) {
            W.grund = "ankunft";
            return 0;
        }
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
        // DIE RAUM-ZEIT DER QUERUNG (`tAus`, `_verkehrQuerung`): verlässt der Leib die Bahn, bevor der Wagen an seinem Ort ist, fährt
        // er so, dass er erst `querRandS` danach dort ankommt (Lücke durch Zeit), nie schneller, als er vor dem Leib noch hielte, wenn
        // der stehen bliebe (`querHaltM` vor seiner Kapsel) — er wartet die Dauer der Querung, nie bis zum Stand
        const halt = (gap, vO, grund, wer = null, tAus = Infinity) => {
            let w =
                gap > V.abstandM
                    ? Math.sqrt(vO * vO + 2 * V.bremsMs2 * (gap - V.abstandM))
                    : gap > 0
                      ? vO * (gap / V.abstandM)
                      : 0;
            if (tAus < Infinity)
                w = Math.max(w, Math.min(gap / (tAus + V.querRandS), Math.sqrt(2 * V.bremsMs2 * Math.max(0, gap - V.querHaltM)))); // prettier-ignore
            if (w < deckel) [deckel, W.grund, W.wer] = [w, grund, wer]; // der Täter beim Namen (die Linse VK)
        };
        // DER WAGEN VOR IHM: nur wer in der Hülle des Fensters steht (samt seiner halben Länge und der Bahn), wird gefragt.
        // In der Kurve schert der starre Wagen um l²·κ/2 aus seiner Bahn (κ höchstens die des Wendekreises `kurveR`; die gemittelte
        // Krümmung der Linie zählt doppelt) — so viel breiter ist seine Bahn dort (bis hier streifte er im Ring der Wende den Wagen
        // am Platz, in der Kreuzung den Stehenden an ihrer Innenseite). κ ist die schärfste AM ORT des anderen (`rundAn`: binnen
        // seiner halben Länge um dessen Fußpunkt — dort steht sein Leib, wenn er ihn passiert); die des ganzen Fensters (`rund`)
        // filtert nur vor. Bis hier galt sie überall: wer an der Haltelinie der Wende wartete, sperrte dem, der aus dem Ring kam,
        // die gerade Bahn heraus (beide standen 40 s)
        [W.vorne, W.vorder] = [null, null];
        let [hx0, hx1, hz0, hz1] = [Infinity, -Infinity, Infinity, -Infinity];
        let kMax = 0;
        for (let i = F.i; i <= j1; i++) {
            const q = F.pts[i];
            if (q.x < hx0) hx0 = q.x;
            if (q.x > hx1) hx1 = q.x;
            if (q.z < hz0) hz0 = q.z;
            if (q.z > hz1) hz1 = q.z;
            if (F.k[i] > kMax) kMax = F.k[i];
        }
        const kurveR = globalThis.__fachwerkCore.VERKEHR_GESETZ.kurveR;
        const rund = (W.hl * W.hl * Math.min(2 * kMax, 1 / kurveR)) / 2;
        const rundAn = (i) => F.rund[i];
        const rand = W.hw + V.seitM + 3;
        // nur wer in den Zellen der Belegung um das Fenster steht (`_verkehrBelegung`, samt dem Weg eines Schritts), nie die Stadt
        const BM = V.belegungM;
        const [bx0, bx1] = [Math.floor((hx0 - rand - V.belegungRandM) / BM), Math.floor((hx1 + rand + V.belegungRandM) / BM)]; // prettier-ignore
        const [bz0, bz1] = [Math.floor((hz0 - rand - V.belegungRandM) / BM), Math.floor((hz1 + rand + V.belegungRandM) / BM)]; // prettier-ignore
        const kandidaten = this._verkehrKandidaten || (this._verkehrKandidaten = []);
        kandidaten.length = 0;
        for (let ix = bx0; ix <= bx1; ix++)
            for (let iz = bz0; iz <= bz1; iz++) {
                const l = S.verkehr.belegung.get(ix * 2097152 + iz);
                if (l) for (const O of l) kandidaten.push(O);
            }
        const A = S.verkehr.zahl.arbeit;
        [A.folge, A.paare] = [A.folge + 1, A.paare + kandidaten.length];
        for (const O of kandidaten) {
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
            // WER STEHT, kommt ihm weder entgegen noch fährt er neben ihm: an ihm vorbei genügt der Raum der Begegnung. Bis
            // heim2-w13-verkehr-heil verlangte er den Seitenraum eines Fahrenden (`seitM`) auch vor dem, der an der Haltelinie
            // wartete: der Halter der Kreuzung am Markt, der um den Spieler ausscherte, sah die Nase von Wagen 19 am Arm daneben
            // 1,61 m neben seiner Linie, 19 wartete auf ihn, er auf 19 (VK 10 und 23 Uhr: ab Minute 4–9 fuhr keiner, 0 m)
            const ruht = !(O.zustand === "faehrt" && o._fahr && !(o._fahr.speed < V.ruheMs));
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
                if (q.quer > W.hw + rundAn(q.i) + (ruht || Math.cos(ry - t) < -0.5 ? V.begegnungM : V.seitM)) continue;
                [a, lt] = [q, t];
            }
            if (!a) continue;
            const of = o._fahr;
            const vO = of && O.zustand === "faehrt" ? Math.max(0, of.vlong * Math.cos(ry - lt)) : 0;
            const gap = a.s - F.s - W.hl;
            const d = { gap, v: vO, s: a.s, O, quer: a.quer, rund: rundAn(a.i) };
            if (!W.vorne || gap < W.vorne.gap) W.vorne = d;
            // DER VORDERE IN SEINER RICHTUNG (`vorder`: sein Weg liegt längs der Linie, wie die Begegnung entgegen cos < −0,5): der
            // Kopf der Reihe vor ihm, die der Stauraum und der Kopf der Wartenden lesen (`_verkehrZonen`) — wer seine Linie quert,
            // steht im Ort, nie in seiner Ausfahrt. Bis heim2-w20-wald-kosten las beide `vorne`: wer an der Haltelinie wartete, sah
            // den Halter, der vor seinem Bug durch die Kreuzung bog, mit dem Tempo längs seiner Linie (quer: 0) als stehende Reihe
            // in seiner Ausfahrt, hieß `gesperrt` und verlor den Kopf der Reihe — sechs Wagen anderer Arme fuhren vor ihm
            // (stadt-voll 10 Uhr: Wagen 14 am Arm Ost 39 s an der Haltelinie, 8 m in Minute 8)
            if (Math.cos(ry - lt) > 0.5 && (!W.vorder || gap < W.vorder.gap)) W.vorder = d;
            halt(gap, vO, "wagen", O);
        }
        // WER IN DER SPUR STEHT ODER GEHT: die Bewohner im Raster um das Fenster, der Spieler
        // (nur vor seinem Bug: wer neben ihm geht, weicht ihm selbst — `_verkehrImRaster`)
        const R = AnazhRealm.PLAYER_WALL_RADIUS;
        // wer vor ihm in seiner Richtung geht, dem folgt er in dessen Tempo (der Gang längs der Linie); wer steht oder entgegen
        // kommt, vor dem hält er
        const pruefe = (x, z, leib, vx, vz) => {
            const a = auf(x, z, jL);
            if (!a || a.s <= F.s + W.hl - R) return;
            const gap = a.s - F.s - W.hl - R;
            const [p, b] = [F.pts[a.i], F.pts[Math.min(F.pts.length - 1, a.i + 1)]];
            const l = Math.hypot(b.x - p.x, b.z - p.z) || 1;
            const [tx, tz] = [(b.x - p.x) / l, (b.z - p.z) / l];
            // DER RAUM NEBEN IHM wie neben einem Wagen (oben): an dem, der steht oder ihm entgegenkommt, genügt der Raum der
            // Begegnung, wer quert oder vor ihm geht, braucht den Seitenraum (bis w27-verkehr-leib jeder: wer am Rand entgegenkam,
            // hielt ihn, ~150 Wagen-Sekunden je Stunde, stadt-voll 10 Uhr)
            const sp = Math.hypot(vx || 0, vz || 0);
            const B = W.hw + R + rundAn(a.i) + (sp < V.umfahrMs || (vx || 0) * tx + (vz || 0) * tz < -0.5 * sp ? V.begegnungM : V.seitM); // prettier-ignore
            if (a.quer > B) return;
            // wer quert, ist nach `tAus` aus seiner Bahn (quer zur Linie am Fußpunkt, rechts +: (−tz, tx)) — der Wagen wartet die
            // Dauer der Querung; wer steht oder ihr folgt, hält ihn, bis er beiseite tritt (unten)
            const Q = AnazhRealm._verkehrQuerung((x - p.x) * -tz + (z - p.z) * tx, (vx || 0) * -tz + (vz || 0) * tx, B);
            const tAus = Q ? Q[1] : Infinity;
            halt(gap, Math.max(0, (vx || 0) * tx + (vz || 0) * tz), "leib", leib, tAus);
            // WER STEHT UND NICHT WEICHT, um den fährt er (`_verkehrUmfahren`), den nächsten zuerst: der Spieler (`leib` null — kein
            // Gedränge fragt ihn nach Platz) sofort, ein Bewohner, der nach `umfahrNachS` noch in der Bahn steht (sein Platz fand
            // keinen Ort; bis w13-verkehr-heil hielt er drei Wagen eine Minute vor der Wende 924/354, 10 Uhr)
            // (wer die Bahn nicht verlässt, w27-verkehr-leib: wer steht, und wer in ihr längs geht — `tAus` Infinity — wie er)
            const steht = sp < V.umfahrMs || (leib && tAus === Infinity);
            if (steht && (!leib || W.leibS >= V.umfahrNachS) && !(W.umfahr && W.umfahr.s <= a.s))
                W.umfahr = { x, z, i: a.i, s: a.s };
            // Platz verlangt er von dem, der ihn hält — dem Stehenden wie dem Gehenden, der nicht aus der Bahn kommt (ein langsamer
            // Gänger hielt die Enge 30 s, sechs Wagen dahinter) — gegen die Bahn AM ORT des Leibs (das Stück der Linie um seinen
            // Fußpunkt, je `platzBahnM` davor und dahinter, jedes Stück der Bahn — nie ihre Sehne) und je `platzS` wieder, solange
            // er bleibt: auch wer schon beiseite trat (für einen anderen oder zu knapp), tritt weiter. Bis hier fragte er nur, wer
            // noch nie beiseite trat, gegen die Sehne von 6 m — in der Kurve der Kreuzung lag der Platz „daneben" 0,6 m in der Bahn,
            // und Wagen und Bewohner warteten aufeinander (10 Uhr: Kreuzung und Enge der Metropole standen 40 s). DER LEIB, DER DIE
            // BAHN NICHT VERLÄSST (`tAus` Infinity: er steht in ihr, er folgt ihr, er kommt entgegen), GIBT SIE FREI: er tritt
            // beiseite, sobald er den Wagen hält, nie erst nach `platzS` — wer quert, ist nach der Querung aus ihr. Bis w27-verkehr-leib
            // wartete der Wagen vor jedem `platzS`, der Querende wie der Stehende (stadt-voll 10 Uhr: ~210 Halte vor Leibern je
            // Stunde, die Reihen dahinter 640–760 Wagen-Sekunden)
            const frage = tAus === Infinity && !(W.warteS > 0);
            if (leib && gap < V.abstandM + 1 && v < 0.5 && ((W.warteS += h) > V.platzS || frage)) {
                let [i0, i2] = [a.i, a.i + 1];
                while (i0 > 0 && F.bogen[a.i] - F.bogen[i0] < V.platzBahnM) i0--;
                while (i2 < F.pts.length - 1 && F.bogen[i2] - F.bogen[a.i] < V.platzBahnM) i2++;
                const q = F.pts[i2];
                const fuer = W.platzLeib || (W.platzLeib = { leib: e, weg: [q], wi: 0, drinnen: false, kF: 0 });
                [fuer.weg[0], fuer.kF, W.warteS] = [q, W.hw + R + V.seitM + rundAn(a.i), 1e-9]; // gefragt: wieder nach `platzS`
                this._bewohnerPlatz(S, leib, F.pts.slice(i0, i2 + 1), null, fuer, fuer.kF);
            }
        };
        // die Leiber zählen nur bis zu seinem Bremsweg samt Abstand voraus (Lehre 25): die Zellen des Rasters längs der Linie
        // dort (je Stück von höchstens der Bahn-Breite die Zellen um seinen Punkt, jede einmal: `vkStempel`), nie das Rechteck
        // des ganzen Fensters — bis hier fragte er das Rechteck: in der Gasse am Markt der Löwenanteil seines Sim-Takts
        const BW = AnazhRealm.BEWOHNER;
        const RS = S.raster;
        const bis = F.s + W.hl + (v * v) / (2 * V.bremsMs2) + V.abstandM + V.leuteRandM;
        let jL = F.i;
        while (jL < j1 && F.bogen[jL] <= bis) jL++;
        if (RS && j1 > F.i) {
            const r2 = W.hw + R + V.seitM + rund;
            const M = BW.rasterM;
            const st = (this._verkehrStempel = (this._verkehrStempel || 0) + 1);
            // die Punkte der Linie je höchstens r2 + 1 m (die Punkte liegen je Meter): wer der Linie näher ist als r2, ist einem
            // von ihnen näher als r2 + (r2 + 1) / 2 — der billige Filter vor dem Fußpunkt (`auf`)
            const P = this._verkehrProben || (this._verkehrProben = []);
            P.length = 0;
            for (let i = F.i, sZ = -Infinity; i <= jL; i++)
                if (i === jL || F.bogen[i] - sZ >= r2) [sZ, P[P.length]] = [F.bogen[i], F.pts[i]];
            const g2 = (r2 + (r2 + 1) / 2) ** 2;
            for (const q of P)
                for (let ix = Math.floor((q.x - r2) / M); ix <= Math.floor((q.x + r2) / M); ix++)
                    for (let iz = Math.floor((q.z - r2) / M); iz <= Math.floor((q.z + r2) / M); iz++) {
                        const l = RS.get(ix * 2097152 + iz);
                        if (!l || l.vkStempel === st) continue;
                        l.vkStempel = st;
                        for (const o of l) {
                            if (o.wagenLeib || !o.leib || o.drinnen) continue;
                            const lp = o.leib.position;
                            let nah = false;
                            for (let k = 0; !nah && k < P.length; k++)
                                nah = (lp.x - P[k].x) ** 2 + (lp.z - P[k].z) ** 2 < g2;
                            if (nah) pruefe(lp.x, lp.z, o, o.vx, o.vz);
                        }
                    }
        }
        const sa = this._spielerLageAlt;
        if (sp && !(this.state.player && this.state.player.mountedArch === e.id))
            pruefe(sp.x, sp.z, null, sa ? sa.vx : 0, sa ? sa.vz : 0);
        if (W.grund !== "leib" || v >= 0.5) W.warteS = 0;
        // wie lange er schon vor Leibern steht (`_verkehrVorrang`: ab `vorrangWarteS` beansprucht er seine Bahn auch stehend)
        W.leibS = W.grund === "leib" && v < 0.5 ? (W.leibS || 0) + h : 0;
        // DIE ORTE, DIE EINER ZUR ZEIT BEFÄHRT
        const z = this._verkehrZonen(S, W, v);
        if (z < deckel) [deckel, W.grund, W.wer] = [z, "ort", null];
        return deckel;
    }

    // DER STEHENDE, DER NIE WEICHT (der Spieler in der Bahn, der Bewohner ohne Platz, `_verkehrFolge`): der Wagen fährt um ihn —
    // seine Linie schert im Stück um ihn aus (je `umfahrRampeM` davor und danach, dazwischen voll), so weit, dass zwischen der
    // Flanke und der Kapsel `seitM` samt Ausscheren und `umfahrRandM` bleibt; zur Seite fort von ihm, rechts (fort vom
    // Gegenverkehr), solange `umfahrMaxM` trägt, sonst links (wer entgegenkommt, sieht ihn in seiner Bahn, `_verkehrFolge`). Die
    // Orte der Kette rechnet die neue Linie (`_verkehrLinie`, aus der Route vor der Glättung). Bis w13-verkehr-heil hielt jeder
    // vor ihm, bis er ging: an der Radeon stand der Spieler 0,5 m neben der Mitte der Kreuzung am Markt (der Ort des Messorts
    // stadt-voll), ihre Halter warteten auf ihn, die Stadt dahinter — 15–55 s nach dem Sprung fuhren 8 und 9 von 20 Wagen 30 m.
    // Liefert, ob die Linie neu ist.
    _verkehrUmfahren(S, W, u) {
        const V = AnazhRealm.VERKEHR;
        const F = W.F;
        const R = AnazhRealm.PLAYER_WALL_RADIUS;
        const P = F.roh; // die Route vor der Glättung: die neue Linie glättet aus ihr (`_verkehrLinie`)
        const a = F.pts[u.i]; // der Stehende quer zur gefahrenen Linie
        const b = F.pts[Math.min(F.pts.length - 1, u.i + 1)];
        const l = Math.hypot(b.x - a.x, b.z - a.z) || 1;
        const q = ((u.x - a.x) * -(b.z - a.z) + (u.z - a.z) * (b.x - a.x)) / l; // rechts der Fahrt (+): (−tz, tx)
        const noetig = W.hw + R + V.seitM + F.rund[u.i] + V.umfahrRandM;
        if (Math.abs(q) >= noetig) return false;
        // die Linie rechts an ihm vorbei (er bleibt links), sonst links (er bleibt rechts) — `off` > 0 schert nach links
        const rechts = noetig + q;
        const off = rechts <= V.umfahrMaxM ? -rechts : noetig - q;
        const kern = W.hl + R + 1;
        const w = (s) => {
            const d = Math.abs(s - u.s);
            return d <= kern ? 1 : d >= kern + V.umfahrRampeM ? 0 : 1 - (d - kern) / V.umfahrRampeM;
        };
        const neu = P.map((p, i) => {
            const g = w(F.bogen[i]);
            if (!g) return p;
            const [p0, p1] = [P[Math.max(0, i - 1)], P[Math.min(P.length - 1, i + 1)]];
            const L = Math.hypot(p1.x - p0.x, p1.z - p0.z) || 1;
            const [rx, rz] = [-(p1.z - p0.z) / L, (p1.x - p0.x) / L];
            return { x: p.x - rx * off * g, z: p.z - rz * off * g };
        });
        // nie in einen Ort, den seine Kette nicht trägt: wer neben der Spur an einer Kreuzung vorbei umführe, führe ohne Schlüssel
        // durch sie (bis hier, 10 Uhr: Wagen 3 umfuhr einen Bewohner vor der Kreuzung am Markt, 614 Proben ohne Schlüssel in ihr)
        const fremd = (q) => (Z) => (q.x - Z.x) ** 2 + (q.z - Z.z) ** 2 < Z.r * Z.r && !W.zonen.some((z) => z.Z === Z);
        if (neu.some((q, i) => q !== P[i] && S.verkehr.zonen.some(fremd(q)))) return false;
        const deckel = F.deckel;
        F.roh = neu;
        this._verkehrLinie(S, W, [], false);
        if (W.F === F) {
            F.roh = P;
            return false;
        }
        W.F.deckel = deckel;
        W.umfahren = (W.umfahren || 0) + 1;
        S.verkehr.zahl.umfahren = (S.verkehr.zahl.umfahren || 0) + 1;
        return true;
    }

    // DER SCHLÜSSEL DER ORTE (Kreuzung, Enge, Wende): wer einen Ort hinter sich hat, gibt ihn frei; vor dem nächsten fragt er ihn,
    // sobald sein Bremsweg samt `frageM` an dessen Haltelinie (`vorM` vor der Einfahrt) reicht — mit den Orten, die gleich
    // dahinter folgen (näher als zwei Wagen samt Abstand: er hält nie zwischen ihnen), in der Reihe der Wartenden, nur wenn
    // hinter dem letzten Platz für ihn ist (der Wagen vor ihm). Bekommt er ihn nicht, hält er an der Linie (der Deckel).
    // DER SCHLÜSSEL GILT JE DURCHFAHRT (`hat` am Ort seiner Linie): was er von einer Kette schon hält, fährt er; gefragt wird ab
    // dem ersten Ort, den er nicht hält — bis hier fuhr, wer den ersten Ort der Kette hielt, ohne den Rest zu fragen. DIE KETTE
    // TRÄGT EINEN ORT JE RICHTUNG EINMAL: die Enge vor der Wende (der Strecke wie die Begegnung der Wende) fährt er hinein und
    // heraus — liegen beide Durchfahrten näher als zwei Wagen samt Abstand an der Wende, hält er sie in einer Kette hin und zurück
    // (die Richtung „hin und zurück": kein anderer fährt in ihr, bis er hinaus ist), sonst fragt er die Durchfahrt heraus vor ihr
    // wie jede andere Enge (bis w13-verkehr-heil trug die Kette einen Ort nie zweimal). DIE KETTE IST GANZ: reicht seine
    // Linie nicht über ihr Ende hinaus (zwei Wagen, Abstand und der Vorlauf einer Wende), hängt die Route erst an (`kurz`, der
    // Sim-Schritt), dann fragt er. Bis hier gab er die Enge hinter der ersten Durchfahrt frei, deren zweite seine Kette schon
    // trug: der Entgegenkommende nahm sie, und beide standen Bug an Bug in ihr — stadt-voll 10 Uhr an beiden Sackgassen mit Enge
    // (736/556 und 679/441), die halbe Stadt dahinter (8 Ankünfte in 10 min).
    _verkehrZonen(S, W, v) {
        const V = AnazhRealm.VERKEHR;
        const F = W.F;
        const vor = F.s + W.hl;
        // DER WARTE-GRAPH (w28-verkehr-graph; Coffman 1971: ein Stau ist ein Kreis im Graphen „wer wartet auf wen“): steht er
        // (unter 0,5 m/s), sucht er den Kreis durch sich — seine Kanten aus dem letzten Schritt (`wartet`), die der anderen, wie sie
        // zuletzt fragten (`_verkehrKreis`). Im Kreis gibt EINER nach, immer derselbe: der kleinste, der einen Ort hält, gibt seine
        // Kette ab und lässt den fahren, der auf ihn wartet (`weicht`); hält keiner einen Ort, wird der kleinste Kopf einer Reihe im
        // Kreis übergangen (`gesperrt`). Diese EINE Regel ersetzt drei Orts-Regeln: „wer hält und vor einem steht, der auf denselben
        // Ort wartet, gibt ihn ab“ (w12), „der Kopf der Reihe hält sie nur, wenn seine Kette frei ist“ (5192ad31) und „der Kopf ohne
        // Platz gibt sie frei“ (e35b2c72) — jede war ein Kreis, an einer Geometrie benannt (23 Uhr: drei Wagen einer Wende 40 s; 23 Uhr
        // ab Minute 5 keiner der 20 Wagen; 10 Uhr: im Netz der vier Wenden ab Minute 1 keiner)
        const kreis = v < 0.5 ? AnazhRealm._verkehrKreis(W, S.verkehr.zahl.arbeit) : null;
        W.wartet = null;
        // kreis[i] = [Wagen, Art seiner Kante zum nächsten]; der letzte wartet auf ihn selbst (kreis[0])
        const n = kreis ? kreis.length : 0;
        const nrn = (wer) => (kreis || []).filter(wer).map(([X]) => X.nr);
        const halter = nrn(([X]) => !!X.F && X.zonen.some((z) => z.hat && !z.weg));
        const koepfe = nrn((_, i) => kreis[(i + n - 1) % n][1] === "kopf");
        const gibtAb = halter.length > 0 && Math.min(...halter) === W.nr;
        W.gesperrt = !halter.length && koepfe.length > 0 && Math.min(...koepfe) === W.nr;
        for (const z of W.zonen)
            if (!z.weg && F.s - W.hl > z.aus) {
                [z.weg, z.hat] = [true, false];
                if (!W.zonen.some((y) => y.hat && y.Z === z.Z)) AnazhRealm._verkehrLos(z.Z, W);
                if (z.ziel) this._verkehrAngekommen(S, W); // die Wende seines Ziels liegt hinter ihm
            }
        const i0 = W.zonen.findIndex((z) => !z.weg);
        if (i0 < 0) return Infinity;
        // DIE KETTE TRÄGT NUR, WAS VOR IHM LIEGT: eine Durchfahrt, die er schon hinter sich hat (`weg`), gehört ihr nie — auch wo sie
        // in der Folge nach dem ersten offenen Ort steht (die Enge, die die Bahn hinein der Wende kreuzt, endet vor der Wende). Bis
        // hier trug die Kette sie mit und er nahm ihren Schlüssel noch einmal (`drinnen`), den er nie wieder abgab: stadt-voll
        // 23 Uhr hielt Wagen 7 die Enge 980,8/366 vor der Wende 994/372 vom Ring bis ans Ende, ab Minute 9 fuhr dort keiner mehr;
        // 10 Uhr fragte er die Durchfahrt heraus derselben Enge nie (17 040× „ohne Schlüssel im Ort", eine Fahrt 712 s).
        const voll = [W.zonen[i0]];
        for (let k = i0 + 1; k < W.zonen.length; k++) {
            const z = W.zonen[k];
            if (z.weg) continue;
            if (
                z.ein - voll[voll.length - 1].aus < 2 * W.hl + V.abstandM &&
                !voll.some((y) => y.Z === z.Z && y.dir === z.dir)
            )
                voll.push(z);
            else break;
        }
        // ER GIBT AB (der Warte-Graph oben): die ganze Kette, die er hält (sonst hielte er dem anderen den Ort dahinter), und er
        // fragt erst wieder, wenn der, der auf ihn wartete, an keinem Ort seiner Route mehr wartet
        if (gibtAb && voll[0].hat) {
            for (const z of voll) z.hat = false;
            for (const z of voll) if (!W.zonen.some((y) => y.hat && y.Z === z.Z)) AnazhRealm._verkehrLos(z.Z, W);
            W.weicht = kreis[n - 1][0];
        }
        if (W.weicht && !W.zonen.some((z) => !z.weg && W.weicht.reihe.has(z.Z))) W.weicht = null;
        const rand = 2 * W.hl + V.abstandM + globalThis.__fachwerkCore.VERKEHR_GESETZ.parkL;
        if (W.letzter && W.letzter.art !== "ein" && F.lang < voll[voll.length - 1].aus + rand) W.kurz = true;
        // DER STAURAUM (jede Kette bleibt frei — wer in sie fährt, muss aus ihr hinaus können; SUMO „keep clear“): hinter ihrem Ende
        // braucht er Platz, wo die Reihe vor ihm STEHEN WIRD, nicht wo sie fährt — jeder vor ihm hält, wo er steht (unter 1 m/s), an
        // der Haltelinie seines nächsten Orts, den er noch nicht hält, oder hinter dem vor ihm mit Abstand, das Engste gilt. Bis
        // w13-verkehr-heil genügte, dass der Vordere fuhr (über 1 m/s): er hielt kurz danach vor dem nächsten Ort, und der Halter
        // blieb in der Kette (stadt-voll 23 Uhr, Minute 10: Wagen 18 mit dem Heck 0,5 m in der Enge 818/467 hinter 19 und 4 vor der
        // Kreuzung am Markt, die 9 mit dem Heck 1,5 m hielt, 9 hinter 5 und 14 vor der Enge — ein Kreis, keiner der 20 Wagen fuhr)
        const raum = (ende) => {
            let stopp = Infinity;
            if (!W.vorder) return true;
            const reihe = [];
            let [O, s, vO] = [W.vorder.O, W.vorder.s, W.vorder.v];
            for (const war = new Set(); O && !war.has(O) && war.size < 20;) {
                war.add(O);
                const z = O.F && O.zonen.find((y) => !y.weg && !y.hat);
                const eigen = vO <= 1 || !O.F ? s : z ? s + Math.max(0, z.ein - V.vorM - O.F.s - O.hl) : Infinity;
                reihe.push([O, eigen]);
                if (!O.vorder || eigen === s) break;
                [s, vO, O] = [s + 2 * O.hl + O.vorder.gap, O.vorder.v, O.vorder.O];
            }
            for (let k = reihe.length - 1; k >= 0; k--)
                stopp = Math.min(reihe[k][1], stopp - V.abstandM - 2 * reihe[k][0].hl);
            return stopp > ende + 2 * W.hl + V.abstandM;
        };
        // DER STAURAUM GILT BIS ZUR EINFAHRT: wer seine Kette hält, aber noch vor ihr halten kann, prüft ihn bis dorthin — füllt sich
        // der Raum hinter ihr, seit er sie bekam (ein Wagen bog vor ihm ein, die Reihe vor der nächsten Enge wuchs), gibt er sie
        // zurück und wartet davor. Bis w13-verkehr-heil galt der Schlüssel, sobald er gegeben war: der Halter fuhr ein und stand mit
        // dem Heck in der Kreuzung am Markt (stadt-voll 23 Uhr, Minute 2: Wagen 16 0,5 m in ihr hinter 6 und 9 vor der Enge 818/467,
        // die 0 mit dem Heck hielt, 0 hinter 18 und 4 vor der Kreuzung — derselbe Kreis wie ohne Stauraum, nur früher)
        const vorKette = (z) => z.ein - V.vorM - vor > (v * v) / (2 * V.bremsMs2);
        if (voll[0].hat && voll.every((z) => z.hat)) {
            if (!vorKette(voll[0]) || raum(voll[voll.length - 1].aus)) return Infinity;
            for (const z of voll) z.hat = false;
            for (const z of voll) if (!W.zonen.some((y) => y.hat && y.Z === z.Z)) AnazhRealm._verkehrLos(z.Z, W);
        }
        const j0 = voll.findIndex((z) => !z.hat);
        const kette = voll.slice(j0);
        const z0 = kette[0];
        const dEin = z0.ein - V.vorM - vor;
        if (dEin > (v * v) / (2 * V.bremsMs2) + V.frageM) return Infinity;
        const halt = Math.sqrt(2 * V.bremsMs2 * Math.max(0, dEin));
        if (W.kurz) return halt;
        const Z = z0.Z;
        for (const o of Z.warte.slice())
            if (!(o.zustand === "faehrt" && o.zonen.some((z) => z.Z === Z && !z.weg)))
                AnazhRealm._verkehrReihe(Z, o, false);
        const ende = kette[kette.length - 1].aus;
        const platz = raum(ende);
        // wer schon im Ort steht (seine Einfahrt hinter seinem Bug: vom Platz an der Wende, nach einem Halt in ihr), muss hinaus —
        // ihn hält die Reihe der Wartenden nicht (bis hier wartete er hinter dem Kopf der Reihe, dem er selbst im Weg stand:
        // sieben Wagen an einer Wende, keiner hielt den Schlüssel)
        const drinnen = z0.ein <= vor;
        // VERTRÄGLICH sind zwei Wege durch dieselbe Kreuzung, die das Gesetz zugleich fahren lässt (fachwerk `konflikt`), und zwei,
        // die durch die Wende fahren (ihre Bahn kreuzt keinen Wagen, fachwerk `verkehrsNetz`: sie folgen einander) — wer aus dem Platz
        // oder in ihn fährt, fährt allein in ihr. Bis w4-verkehr-c2 fuhr einer zur Zeit durch jede Wende (stadt-voll: 35 Ziele in
        // 10 min, 8 Wagen ohne Ziel)
        const vertraeglich = (z, o) => {
            if (z.Z.art === "wende") return !!z.durch && o.zonen.some((y) => y.Z === z.Z && !y.weg && y.durch);
            if (z.Z.art !== "kreuzung" || !z.wort) return false;
            const q = o.zonen.find((y) => y.Z === z.Z && !y.weg);
            return !!(q && q.wort && !z.Z.konflikt.includes(z.wort + "|" + q.wort));
        };
        // frei ist ein Ort, den keiner hält, den nur er hält, eine Enge, durch die schon einer in seiner Richtung fährt, oder eine
        // Kreuzung, deren Halter alle verträgliche Wege fahren (bis hier einer zur Zeit: an der Mitte der Metropole kam in 40 s
        // nicht jeder 30 m weit)
        const darf = (z) =>
            (!z.Z.platz || z.Z.halter.includes(W) || z.Z.halter.length < z.Z.platz) &&
            (!z.Z.halter.length ||
                z.Z.halter.every((o) => o === W || vertraeglich(z, o)) ||
                (z.Z.art === "enge" && z.Z.richtung === z.dir));
        // der Kopf der Reihe: der erste Wartende, vor dem keiner in seiner Spur auf denselben Ort wartet (bis hier stand an der
        // Spitze, wer zuerst fragte — auch hinter einem, der nach ihm kam: beide warteten aufeinander), außer dem, den der
        // Warte-Graph übergeht (`gesperrt`, oben)
        const kopf = Z.warte.find((o) => o === W || (!o.gesperrt && !(o.vorder && o.vorder.O.reihe.has(Z))));
        // vor dem Kopf vorbei nur, wer ihm nicht im Weg ist (verträglich mit ihm: der Kopf wartet nie länger seinetwegen)
        if (!W.weicht && kette.every(darf) && (drinnen || !kopf || kopf === W || vertraeglich(z0, kopf)) && platz) {
            for (const z of kette) {
                z.hat = true;
                const zurueck = z.Z.halter.includes(W) && z.Z.richtung !== null && z.Z.richtung !== z.dir;
                if (!z.Z.halter.includes(W)) z.Z.halter.push(W);
                z.Z.richtung = zurueck || z.Z.richtung === "hin und zurück" ? "hin und zurück" : z.dir;
            }
            AnazhRealm._verkehrReihe(Z, W, false);
            return Infinity;
        }
        // SEINE KANTEN IM WARTE-GRAPHEN (`wartet`, gelesen im nächsten Schritt von `_verkehrKreis`): wem er weicht, wer einen Ort
        // seiner Kette hält, der ihm nicht verträglich ist, der Kopf der Reihe vor ihm, der vor ihm, hinter dem kein Platz ist
        const wo = `${Math.round(Z.x)}/${Math.round(Z.z)}`;
        W.wartet = { auf: W.weicht ? [[W.weicht, "weicht", wo]] : [] };
        for (const z of kette)
            if (!darf(z))
                for (const o of z.Z.halter)
                    if (o !== W && !W.wartet.auf.some((a) => a[0] === o)) W.wartet.auf.push([o, "halter", wo]);
        if (kopf && kopf !== W && !drinnen && !vertraeglich(z0, kopf)) W.wartet.auf.push([kopf, "kopf", wo]);
        if (!platz && W.vorder) W.wartet.auf.push([W.vorder.O, "platz", wo]);
        AnazhRealm._verkehrReihe(Z, W, true);
        return halt;
    }

    // DER BODEN DER SPUR (Lehre 14 und 25: der Takt kostet, was ihn betrifft): die Wagen einer Stadt fahren dieselben Spuren —
    // der Boden ihrer Räder (`_fahrBoden`, der EINE Boden des Fahr-Schritts) gemerkt im Raster von `bodenM`, je Punkt bilinear
    // aus seinen vier Ecken (jede einmal gefragt, solange kein Edit den Boden ändert: `_editGenZaehler`). Bis hier fragte jeder
    // Schritt jedes Rads die Säule (`_koerperBodenUnter` 0,04 ms — in der Metropole 3 ms je Schritt).
    // DIE ECKE IST EINE FUNKTION IHRES ORTS: gefragt von der Oberkante ihrer Säule (`_voxelSurfaceY`), nie aus der Höhe des Wagens,
    // der sie zuerst braucht, oder des Takts, der sie vorab backt (`backMs`, Wanduhr). Bis w13-verkehr-heil trug sie die Höhe dessen,
    // der zuerst fragte (`_werkBoden`: der Grund unter seinem Fahr-Zustand) — derselbe Stand fuhr je Lauf um Millimeter anders
    // (stadt-voll 10 Uhr: Wagen 9 am Anfang 43,084 gegen 43,082 m seiner Linie), und die Stadt lief auseinander.
    _verkehrBoden(S, e) {
        const VK = S.verkehr;
        this._voxelEditKarte(); // trägt jeden neuen Edit nach: sein Zähler ist der Stand des Bodens
        const gen = this._editGenZaehler | 0;
        let B = VK.boden;
        if (!B || B.gen !== gen) {
            const ecke = (x, z) => this._koerperBodenUnter(x, this._voxelSurfaceY(x, z), z);
            B = VK.boden = { gen, karte: new Map(), roh: ecke };
            VK.zahl.bodenNeu = (VK.zahl.bodenNeu || 0) + 1;
            this._verkehrBodenBacken(S, B);
        }
        if (e._verkehrBodenFn && e._verkehrBodenKarte === B) return e._verkehrBodenFn;
        e._verkehrBodenKarte = B;
        const roh = this._fahrBodenRoh(e);
        const m = AnazhRealm.VERKEHR.bodenM;
        const ecke = (i, j) => {
            const k = i * 2097152 + j;
            let v = B.karte.get(k);
            if (v === undefined && Number.isFinite((v = B.roh(i * m, j * m)))) B.karte.set(k, v); // ungebaut: nie gemerkt
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

    // DER BODEN DER SPUR VORAB (Lehre 14: gecacht und vorgebacken, frame-adaptiv): jede Ecke des Rasters (`bodenM`) unter den
    // Stücken des Spur-Rasters (die Spuren, die Wege durch die Kreuzungen, Bahn und Ring jeder Wende) bis `bodenRandM` neben
    // ihnen — die Liste hier, gebacken je Bild höchstens `backMs` im Takt des Verkehrs (`_tickVerkehr`); ein neuer Stand des
    // Bodens (ein Edit) backt neu. Bis hier zahlte der Sim-Schritt jede neue Ecke unter einem Rad (`_koerperBodenUnter`): ein
    // Drittel seines Takts in den ersten 40 s der Metropole (der Leerlauf des Fadens kam im Takt der Sonde nie).
    _verkehrBodenBacken(S, B) {
        const V = AnazhRealm.VERKEHR;
        const m = V.bodenM;
        const ecken = new Set();
        for (const l of S.verkehr.spurRaster.values())
            for (let i = 0; i < l.length; i += 5) {
                const [ax, az, bx, bz] = [l[i], l[i + 1], l[i + 2], l[i + 3]];
                const L = Math.hypot(bx - ax, bz - az) || 1;
                const [nx, nz] = [-(bz - az) / L, (bx - ax) / L];
                for (let t = 0; t <= L; t += m)
                    for (let q = -V.bodenRandM; q <= V.bodenRandM; q += m) {
                        const [x, z] = [ax + ((bx - ax) * t) / L + nx * q, az + ((bz - az) * t) / L + nz * q];
                        const [ci, cj] = [Math.floor(x / m), Math.floor(z / m)];
                        for (const d of [0, 1, 2097152, 2097153]) ecken.add(ci * 2097152 + cj + d); // die vier Ecken der Zelle
                    }
            }
        B.offen = [...ecken];
    }
    _verkehrBodenPumpe(B) {
        const m = AnazhRealm.VERKEHR.bodenM;
        const t0 = performance.now();
        for (let n = 0; B.offen.length; n++) {
            if (!(n & 15) && performance.now() - t0 > AnazhRealm.VERKEHR.backMs) return;
            const k = B.offen.pop();
            const i = Math.round(k / 2097152);
            const v = B.karte.has(k) ? NaN : B.roh(i * m, (k - i * 2097152) * m);
            if (Number.isFinite(v)) B.karte.set(k, v);
        }
    }

    // DER WAGEN IM GEDRÄNGE (`_tickBewohner`, vor dem Takt der Köpfe; die Zelle legt `_bewohnerRasterLage`): je fahrendem Wagen drei Leiber längs seiner Achse
    // (Bug, Mitte, Heck; je Radius die halbe Breite × √2 — so deckt der vordere und hintere Leib die Ecken, deren Abstand zu
    // seiner Mitte; `kR` die Berührung samt Kapsel) mit seinem Tempo und Vorrang (`rueck` ∞; der fahrende mit `weg`: keiner
    // geht um ihn wie um einen Stehenden; der ruhende ohne — um ihn geht man; seinen Platz verlangt keiner) — das Ausweichen der
    // Bewohner (`_bewohnerAusweichen`) sieht ihn wie den Spieler.
    _verkehrImRaster(S) {
        const VK = S.verkehr;
        if (!VK || !VK.wagen.length) return;
        // ein neues Raster (die Liste der Siedlung wechselte, `_tickBewohner`) kennt keinen Leib des Wagens
        if (VK.raster !== S.raster) for (const W of VK.wagen) for (const o of W.leiber || []) o.rk = undefined;
        VK.raster = S.raster;
        for (const W of VK.wagen) {
            const e = W.entry;
            const faehrt = W.zustand === "faehrt" && e && e._fahr;
            // wer nicht fährt, steht auf seinem Platz als Wand der Wege: seine Leiber verlassen das Raster
            if (!faehrt) {
                for (const o of W.leiber || []) {
                    o.drinnen = true;
                    this._bewohnerRasterLage(S, o);
                }
                continue;
            }
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
                    // DER LEIB DES WAGENS heißt `wagenLeib`, nie `wagen`: `wagen` trägt der Bewohner, der ihn fährt (Fahrer und
                    // Nachtfahrer, `_verkehrAnlegen`) — auch zu Fuß. Bis hier hieß beides `wagen`, und jeder Leser, der den Leib des
                    // Wagens überging, überging den Fahrer mit: kein Wagen hielt vor einem Fahrer, der über seine Bahn ging, keiner
                    // bat ihn um Platz (stadt-voll 10 Uhr: Wagen 3 fuhr mit 7,6 m/s durch den Nachtfahrer 7:82:1 an der Bahn der
                    // Wende 924/354, 9 Proben „berührt Bewohner")
                    wagenLeib: W,
                    kR: W.hw * Math.SQRT2 + AnazhRealm.PLAYER_WALL_RADIUS + 0.05,
                    rk: undefined, // seine Zelle (`_bewohnerRasterLage`): die Gestalt steht ab der Geburt (Lehre 25)
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
                o.drinnen = false;
                this._bewohnerRasterLage(S, o);
            }
        }
    }

    // DER VERKEHR GEHT MIT SEINER SIEDLUNG (`_bewohnerFort`): jeder Wagen verlässt den Bestand, jeder Fahrer seinen Wagen.
    _verkehrFort(S) {
        const VK = S.verkehr;
        if (!VK) return;
        for (const W of VK.wagen) {
            for (const f of W.fahrer) {
                f.amSteuer = false;
                f.wagen = null;
            }
            if (W.entry) W.entry._passagiere = null;
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
// (parkL/2)²/(2·kurveR) = 0,66 m: kein Stand liegt in der Bahn, vor der ein Wagen hält) · querBreiten = so viele Breiten der
// Fahrbahn trägt ein Bein des Fußes in ihr, das sie quert (`_verkehrQuert`; mehr geht längs) · vorrangM = so weit vor seinem
// Bug beansprucht ein Wagen die Fahrbahn auch stehend, wenn er schon `vorrangWarteS` vor Leibern wartet (die Lücke im Strom;
// sonst beansprucht er sie in der Zeit, `_verkehrVorrang`) · DIE RAUM-ZEIT DER QUERUNG (`_verkehrQuerung`): querMs = wer quer
// langsamer geht, quert nicht (er steht, folgt, kommt entgegen), querRandS = so lange nach dem Ende der Querung ist ein Wagen
// frühestens an ihrem Ort, querHaltM = so weit vor der Kapsel eines Querenden hielte der Wagen noch, bliebe der stehen,
// querSchrittM = so weit vor der Fahrbahn oder einer Bahn entscheidet der Leib seine Querung · stil = der Fahrstil der Stadt (`_fahrerLinie`):
// quer = so viel des Reibkreises trägt seine Kurve (3,9 m/s² quer), lenk = so viel des Einschlags, den die Säule bei diesem Tempo
// trägt, brems = so fest bremst er vor ihr (3,9 m/s²), kriechMs = so langsam fährt er höchstens um eine Kehre; bis hier fuhr die
// Stadt den Stil des Ritts (85 % des Reibkreises, 8,3 m/s²
// quer): der Wagen kam mit 7 m/s in den Abbieger, und jede Korrektur der Linie ließ ihn schleudern · bodenM = das Raster des gemerkten Bodens der Spur (`_verkehrBoden`), bodenRandM = so weit neben jedem Stück der Spur backt er ihn vorab (`_verkehrBodenBacken`), backMs = so lange backt er ihn je Bild (`_verkehrBodenPumpe`) · kurveM = so weit mittelt die Linie seines Fahrers (`_fahrerLinie`; seine Spuren, Bögen und Kreise sind Gesetz — über die ±8 m des Wegenetzes schrumpfte der Kreis der Wende von 6,5 auf 5 m, der Knick am Ende der Strecke schnitt 2 m in die Gegenspur)
// · radFeinM = so nah federt jedes Rad einzeln auf seinem Boden ·
// standM = der Stand des Fahrers neben der Tür seines Wagens · einsteigM = so nah an ihm steigt er ein · tempoMs = das
// Tempo der Stadt (30 km/h) · folgeM = so weit sieht der Fahrer voraus (Wagen, Leiber) · abstandM = so weit hält er hinter
// einem Wagen und vor einem Leib · seitM = der Raum quer neben ihm · begegnungM = so viel Raum braucht er zwischen sich und
// einem, der ihm entgegenkommt · bremsMs2 = so fest bremst er für die Folge und vor einem
// Ort · vorM = die Haltelinie vor einem Ort · frageM = so viel vor seinem Bremsweg fragt er den Ort · platzS = so lange
// wartet er auf einen, der in seiner Spur steht, dann macht der ihm Platz (neben der Bahn je `platzBahnM` um seinen Fußpunkt) ·
// engeRandM = so weit vor einer Enge wartet, wer ihr entgegenkommt · armM = so weit über ihren Kreis hinaus misst eine Kreuzung
// die Spuren ihrer Arme (`Z.arme`: wo zwei Bahnen den Raum teilen) · blickNahM = so nah zeichnet ein Wagen auch außer dem Blick
// der Kamera (sein Schatten, die Ego-Sicht) · folgeTakt / denkTakt = nah sieht (Folge, Orte) und lenkt der Fahrer jeden so
// vielten Sim-Schritt (fern: jeden seiner Schritte der Leiter) · boxFernM = fern vom Spieler (über `huelleM`) ziehen seine
// Blocker erst nach so vielen Metern nach (dort fragt sie keiner) · eckeStueck = so viele Punkte der Linie (je Meter) um den
// Fußpunkt seiner Mitte sucht er die Ecken eines anderen · vorausM = so weit reicht seine Route voraus ·
// platzBogenM = der Bogen zwischen Platz und Kreis · leuteRandM = so weit über Bremsweg und Abstand hinaus sieht er Leiber · parkMs = darunter steht er (am Platz parkt er) · festS = so lange
// steht er ohne Grund, dann steckt er (gezählt, `zahl.fest`) · ankunftAbstandM /
// ankunftSchrittM = die Ankunft auf der Route: Abstand zum nächsten Wagen, Schritt der Suche · leiter = [Abstand m,
// Schritt-Teiler]: so selten fährt ein ferner Wagen · genauM = so nah zieht er seine Boxen je Schritt nach (sonst ab 0,5 m) ·
// huelleM = so nah fährt er mit der Probe seiner Hülle (Bau, Leib, Spieler; fern trägt die freie Spur des Gesetzes) · kappe = so
// viele Wagen schreiten höchstens je Sim-Schritt (`_verkehrSchritt`: der Rest mit seiner Zeit im nächsten) · ausBlick = so selten
// schreitet ein Wagen außer dem Blick der Kamera mindestens (jenseits der Hülle) · belegungM / belegungRandM = die Zelle der
// Belegung (`_verkehrBelegung`) und der Weg, den ein Wagen in einem Schritt höchstens fährt · umfahrMs = unter diesem Tempo steht,
// wen er umfährt (`_verkehrUmfahren`; den Bewohner erst nach umfahrNachS), umfahrRandM = so viel Raum hält er über `seitM` hinaus, umfahrRampeM = so lang schert er
// aus und ein, umfahrMaxM = so weit schert er höchstens rechts aus (sonst links). Wie nah der Leib sichtbar am Steuer sitzt, sagt
// die Stufe seines Wagens (`_archTraegt`), kein eigener Kreis.
AnazhRealm.VERKEHR = Object.freeze({
    wagen: Object.freeze(["kompakt_fwd", "limousine", "suv"]),
    stufeM: 0.2,
    ruheMs: 0.05,
    platzBahnM: 3,
    blickNahM: 8,
    trasseM: 30,
    trasseRandM: 3,
    bildHolen: 0.1,
    spurN: 4,
    eckeStueck: 5,
    denkTakt: 2,
    folgeTakt: 3,
    boxFernM: 2,
    armM: 16,
    engeRandM: 5,
    spurRandM: 1,
    querBreiten: 2,
    vorrangM: 8,
    vorrangWarteS: 3,
    querMs: 0.3,
    querRandS: 0.5,
    querHaltM: 0.5,
    querSchrittM: 0.5,
    stil: Object.freeze({ quer: 0.4, lenk: 1, brems: 0.4, kriechMs: 2.5 }),
    bodenM: 0.5,
    bodenRandM: 1.5,
    kurveM: 4,
    backMs: 0.5,
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
    kappe: 12,
    ausBlick: 4,
    belegungM: 16,
    belegungRandM: 2,
    umfahrMs: 0.3,
    umfahrNachS: 4,
    umfahrRandM: 0.25,
    umfahrRampeM: 6,
    umfahrMaxM: 2.2,
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
});

// DER WAGEN STEHT (gestellt: in den Platz, an den Ort der Ankunft, nach dem Sprung der Uhr): jedes Tempo des Fahr-Zustands null,
// auch das abgeleitete `speed` (vehicle-core: hypot(vlong, vlat) je Unter-Schritt) — bis w4-verkehr-c2 trug der gestellte Wagen
// das Tempo seiner letzten Fahrt (5,55 m/s im Platz nach dem Sprung auf 23 Uhr: er hieß fahrend, ruhte nie)
AnazhRealm.VERKEHR_STEHT = Object.freeze({ vlong: 0, vlat: 0, yawRate: 0, speed: 0 });

// DIE ZAHLEN DES VERKEHRS einer Siedlung (`S.verkehr.zahl`), EINE Quelle: der Verkehr der Stadt (`_verkehrAnlegen`) und jede Linse,
// die einen Verkehr stellt (diag-takt T11), bauen sie hier — bis hier baute die Takt-Wand ihr eigenes `zahl: {}`, und die gezählte
// Arbeit des Warte-Graphen warf in ihr (z403: „Cannot read properties of undefined (reading 'folge')"). `soll`: die Wagen des Gesetzes.
AnazhRealm._verkehrZahl = (soll) => ({
    soll,
    ohnePlatz: 0,
    ohneFahrer: 0,
    ohneNacht: 0,
    laengeM: 0,
    km: 0,
    fest: 0,
    irrweg: 0,
    stoss: { wagen: 0, bau: 0, leib: 0 },
    ziele: { gesetzt: 0, erreicht: 0, laengsteS: 0 },
    // DIE ARBEIT DES TAKTS (gezählt, nie die Wanduhr): Blicke eines Fahrers (`_verkehrFolge`), die Wagen, die er dabei prüft (die
    // Zellen der Belegung um sein Fenster), die Suchen und die Schritte des Warte-Graphen (`_verkehrKreis`)
    arbeit: { folge: 0, paare: 0, kreise: 0, kreis: 0 },
});

// DIE REIHE DER WARTENDEN eines Orts (`Z.warte`, in der Folge ihrer Frage) und je Wagen die Orte, an denen er wartet (`W.reihe`):
// wer in einer Reihe steht, fragt die Menge des Wagens, nie die Liste (die Kopf-Suche, `_verkehrZonen`, ging je Wartendem die
// Reihe ab — die Quadrat-Suche je Ort und Wagen bis w13-verkehr-heil). `an`: hinein (einmal), sonst hinaus.
AnazhRealm._verkehrReihe = function (Z, W, an) {
    if (an === W.reihe.has(Z)) return;
    if (an) {
        W.reihe.add(Z);
        Z.warte.push(W);
    } else {
        W.reihe.delete(Z);
        Z.warte.splice(Z.warte.indexOf(W), 1);
    }
};

// DER KREIS DURCH W IM WARTE-GRAPHEN (`_verkehrZonen`): die Kanten eines Wagens sind, worauf er an einem Ort wartet (`wartet`), und
// der Wagen vor ihm, vor dem er hält (`grund` „wagen“, `wer`) — Tiefe höchstens 12. Liefert [[Wagen, Art seiner Kante], …] ab W
// oder null; jeder Schritt zählt in `A` (`zahl.arbeit.kreis`). Leser: `_verkehrZonen` (wer nachgibt).
AnazhRealm._verkehrKreis = function (W, A) {
    A.kreise++;
    const pfad = [];
    let ohne = null; // von dort führt kein Weg zu W
    const gang = (X) => {
        A.kreis++;
        const a = X.wartet ? X.wartet.auf : null;
        const n = (a ? a.length : 0) + (X.grund === "wagen" && X.wer && X.wer.zonen ? 1 : 0);
        for (let i = 0; i < n; i++) {
            const [O, art] = a && i < a.length ? a[i] : [X.wer, "wagen"];
            if (O === W) return pfad.concat([[X, art]]);
            if (O === X || (ohne && ohne.has(O)) || pfad.length >= 12 || pfad.some((p) => p[0] === O)) continue;
            pfad.push([X, art]);
            const k = gang(O);
            pfad.pop();
            if (k) return k;
            (ohne || (ohne = new Set())).add(O);
        }
        return null;
    };
    return gang(W);
};

// LIEGT p NÄHER ALS r AN DER SPUR EINES ARMS DER KREUZUNG Z, außer dem Arm `ausser` (die Strecke, auf der er selbst fährt)? Die
// Stücke je Arm legt `_verkehrAnlegen` (`Z.arme`). Leser: die Durchfahrt der Kreuzung (`_verkehrLinie`).
AnazhRealm._verkehrArmNah = function (Z, p, ausser, r) {
    for (const [si, l] of Z.arme) {
        if (si === ausser) continue;
        for (let i = 0; i < l.length; i += 4) {
            const [dx, dz] = [l[i + 2] - l[i], l[i + 3] - l[i + 1]];
            const t = Math.max(0, Math.min(1, ((p.x - l[i]) * dx + (p.z - l[i + 1]) * dz) / (dx * dx + dz * dz || 1)));
            if ((p.x - l[i] - dx * t) ** 2 + (p.z - l[i + 1] - dz * t) ** 2 < r * r) return true;
        }
    }
    return false;
};

// DER SCHLÜSSEL GEHT ZURÜCK: W hält den Ort Z nicht mehr (hält ihn keiner, hat er keine Richtung).
AnazhRealm._verkehrLos = function (Z, W) {
    const k = Z.halter.indexOf(W);
    if (k >= 0) Z.halter.splice(k, 1);
    if (!Z.halter.length) Z.richtung = null;
};

// DIE RAUM-ZEIT DER QUERUNG (w27-verkehr-leib, Dresner & Stone): ein Leib quer zur Linie eines Wagens — Abstand q, Tempo u quer
// (rechts +) — belegt dessen Bahn (halbe Breite B) von [0] bis [1] Sekunden ab jetzt; wer quer langsamer als `querMs` geht (er
// steht, er folgt ihr, er kommt entgegen), belegt sie, solange er in ihr ist (Infinity); wer neben ihr nicht in sie geht, nie
// (null). Das EINE Gesetz, nach dem Wagen und Leib den Raum der Straße in der Zeit teilen: der Wagen wartet die Dauer der Querung
// (`_verkehrFolge`), der Leib betritt die Bahn nur, wo kein Wagen vor ihrem Ende an seinem Ort ist (`_verkehrVorrang`).
AnazhRealm._verkehrQuerung = function (q, u, B) {
    const drin = Math.abs(q) <= B;
    if (!(Math.abs(u) >= AnazhRealm.VERKEHR.querMs)) return drin ? [0, Infinity] : null;
    const [s, au] = [Math.sign(u), Math.abs(u)];
    const aus = (B - q * s) / au;
    return aus > 0 ? [Math.max(0, (-B - q * s) / au), aus] : null;
};
