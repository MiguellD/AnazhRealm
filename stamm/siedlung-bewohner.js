class AnazhRealm_siedlung_bewohner {
    // ===== ATLAS · Siedlung/bewohner — Bewohner · Tag · Wege · Tür · Gang im Satz =====
    // ═══ DIE BEWOHNER (Meisterkarte mensch.K1): der Plan des Fachwerk-Studios wird Leib ═══
    // Jede Siedlung meldet sich, wo ihr Erlebnis steht (`_spawnSettlementErlebnis`: der Akt, der Dorf-Zug, der Wege-Rebuild nach
    // dem Reload — die EINE Stelle, an der die Welt eine Siedlung je Sitzung kennt). Ihre Bewohner sind eine FUNKTION des Plans
    // und keine Save-Byte: je stehendem Haus so viele, wie das Gesetzbuch nennt (fachwerk-core `leuteVon`), jeder aus dem
    // Genom-Roller (`_rollGenome`, Same „Plan:Haus:Person") und einer der Gestalten seiner Siedlung (`_bewohnerGestalten`); der
    // Leib ist der EINE Mensch-Bau (`_buildHumanGroup`: Mensch-Ofen, Gelenk-Gestalt mit Grobstufe, Rig) wie Spieler und
    // Mitspieler. Ihr Budget ist der Plan (Σ leute), nie der Tier-Deckel `maxCreatures`.
    _bewohnerMelden(plan, origin, key) {
        if (!plan || !Array.isArray(plan.slots) || !origin || !key) return;
        const B = this._bewohnerSiedlungen || (this._bewohnerSiedlungen = new Map());
        if (B.has(key)) return;
        B.set(key, { key, plan, ox: origin.x, oz: origin.z, liste: null, gestalten: null });
    }

    // DIE GESTALTEN EINER SIEDLUNG: `BEWOHNER.gestalten` Genome aus dem Samen des Plans (beide Geschlechter im Wechsel), je
    // Gestalt die Dials des Bauplans (`_koerperStudioDials` ohne die Übergabe des Spielers — der Sentinel des Mitspielers)
    // unter dem Genom, ihre Farben aus dem EINEN Farb-Münzer und die Ofen-Schlüssel beider Stufen — derselbe Merge wie der
    // Bau (`_buildHumanGroup` → `_buildHumanoidRig`), damit die Geburt das Memo warm trifft.
    _bewohnerGestalten(S) {
        const kc = window.__koerperCore;
        if (!kc || !kc.START_PARAMS) return AnazhRealm._kernPflichtBruch("koerper:START_PARAMS");
        const alt = this._activePeerUebergabe;
        this._activePeerUebergabe = {};
        let buch;
        try {
            buch = this._koerperStudioDials();
        } finally {
            this._activePeerUebergabe = alt;
        }
        const aus = [];
        for (let gi = 0; gi < AnazhRealm.BEWOHNER.gestalten; gi++) {
            const gen = this._rollHumanoidGenome(`${S.plan.seed >>> 0}:${gi}`);
            gen.sex = gi % 2 ? 0.75 + gen.sex * 0.25 : gen.sex * 0.25;
            const ov = this._dialsAusGenom(gen);
            const dB = Object.assign({}, buch || {}, ov);
            const dK = Object.assign({}, kc.START_PARAMS, dB);
            const f = this._menschGussFarben(dB);
            const keys = [0, 1, 2, 3].map((lod) => this._ofenMenschKey(dK, f.skin, f.hair, lod));
            aus.push({ ov, dK, f, keys, bestellt: keys.map(() => false), satz: null });
        }
        return aus;
    }

    // DIE LISTE DER BEWOHNER (einmal je Siedlung, wenn ihre Häuser stehen): je stehendem Haus (der Bau mit dem Samen des
    // Slots an seinem Ort) `leuteVon` Personen, jede mit den ORTEN ihres Tags (mensch.K2, koerper-core `tagesPlan`): die Tür
    // (drinnen), der Stand vor ihr (heim, vom Grundriss fort), ein Stand auf dem Dorfplatz des Plans (platz, zur Mitte
    // gewandt) und das Werk ihres Berufs (`berufVon`): die Station vor dem Haus ihrer Rolle (Schmiede, Kirche, Gasthaus — ein
    // zweiter Stand vor der eigenen Tür) · markt der Stand auf dem Platz · feld ein Stand im nächsten Acker des Plans · hof
    // der Stand vor der Tür. Jeder Stand ist frei: kein Grundriss eines Baus (`_imGrundriss`, mit dem Saum des Leibs), Land
    // (`_landAt`) und der persönliche Raum (`BEWOHNER.raumM`) zu jedem anderen; wer im Ring um die Tür keinen findet, steht
    // weiter draußen — nie still weg. Wo er bei seiner Geburt steht, sagt die Uhr (`_bewohnerZiel`).
    _bewohnerListe(S) {
        const FC = globalThis.__fachwerkCore;
        if (!FC || typeof FC.leuteVon !== "function") return AnazhRealm._kernPflichtBruch("fachwerk:leuteVon");
        const KC = window.__koerperCore;
        if (!KC || typeof KC.berufVon !== "function") return AnazhRealm._kernPflichtBruch("koerper:berufVon");
        const BW = AnazhRealm.BEWOHNER;
        const plan = S.plan;
        const belegt = [];
        const frei = (x, z) => {
            for (const p of belegt) if ((p.x - x) ** 2 + (p.z - z) ** 2 < BW.raumM * BW.raumM) return false;
            const g = this._imGrundriss(x, z, BW.saumM);
            const q = { x, z };
            return g !== "haus" && g !== "bau" && this._landAt(x, z, 0.2) && !this._bewohnerWand(q, q);
        };
        const nimm = (o) => {
            if (o) belegt.push(o);
            return o;
        };
        const steht = new Map();
        for (const e of this.state.architectures || [])
            if (e && Number.isFinite(e.seed))
                steht.set(`${e.seed >>> 0}@${Math.round(e.position.x)},${Math.round(e.position.z)}`, e);
        const pz = plan.platz && Number.isFinite(plan.platz.cx) ? plan.platz : null;
        // der Stand auf dem Platz (ein gedrehtes Rechteck um seine Mitte, zur Mitte gewandt); ist er voll, der Rand des Platzes
        // (Ringe bis `platzRandM` um das Rechteck, zur Mitte gewandt), dann der Rand seiner Gassen (die Straßen des Plans bis
        // `platzRandM` vom Rand, je Seite neben der Fahrbahn, dem Gegenüber zugewandt) — wem der Tag den Platz gibt, der steht dort
        const platzStand = (g) => {
            if (!pz) return null;
            const pc = Math.cos(pz.phi || 0);
            const ps = Math.sin(pz.phi || 0);
            const mx = S.ox + pz.cx;
            const mz = S.oz + pz.cz;
            const zurMitte = (x, z) => Math.atan2(mx - x, mz - z) + (g.axis("dreh") - 0.5) * 2.4;
            for (let v = 0; v < 64; v++) {
                const lx = (g.axis("px" + v) * 2 - 1) * pz.ex;
                const lz = (g.axis("pz" + v) * 2 - 1) * pz.ez;
                const x = mx + lx * pc + lz * ps;
                const z = mz - lx * ps + lz * pc;
                if (frei(x, z)) return nimm({ x, z, blick: zurMitte(x, z) });
            }
            for (let v = 0; v < 96; v++) {
                const rand = 0.6 + ((v >> 4) / 5) * BW.platzRandM * 0.5;
                const ex = pz.ex + rand;
                const ez = pz.ez + rand;
                let u = g.axis("pr" + v) * 4 * (ex + ez);
                let lx;
                let lz;
                if (u < 2 * ex) [lx, lz] = [u - ex, ez];
                else if ((u -= 2 * ex) < 2 * ez) [lx, lz] = [ex, u - ez];
                else if ((u -= 2 * ez) < 2 * ex) [lx, lz] = [ex - u, -ez];
                else [lx, lz] = [-ex, ez - (u - 2 * ex)];
                const x = mx + lx * pc + lz * ps;
                const z = mz - lx * ps + lz * pc;
                if (frei(x, z)) return nimm({ x, z, blick: zurMitte(x, z) });
            }
            for (const rd of plan.roads || [])
                for (let i = 1; i < (rd.pts || []).length; i++) {
                    const a = rd.pts[i - 1];
                    const e = rd.pts[i];
                    const l = Math.hypot(e.x - a.x, e.z - a.z);
                    if (!(l > 0.5)) continue;
                    const nx = -(e.z - a.z) / l;
                    const nz = (e.x - a.x) / l;
                    for (let v = 0; v < 6; v++) {
                        const t = g.axis("gt" + i + ":" + v);
                        const sd = g.axis("gs" + i + ":" + v) < 0.5 ? -1 : 1;
                        const qx = S.ox + a.x + (e.x - a.x) * t;
                        const qz = S.oz + a.z + (e.z - a.z) * t;
                        const o = (rd.w || 3) / 2 + 0.8;
                        const x = qx + sd * nx * o;
                        const z = qz + sd * nz * o;
                        const lx = (x - mx) * pc - (z - mz) * ps;
                        const lz = (x - mx) * ps + (z - mz) * pc;
                        const rd0 = Math.hypot(Math.max(0, Math.abs(lx) - pz.ex), Math.max(0, Math.abs(lz) - pz.ez));
                        if (rd0 <= BW.platzRandM && frei(x, z))
                            return nimm({ x, z, blick: Math.atan2(-sd * nx, -sd * nz) });
                    }
                }
            return null;
        };
        // der Stand im Ring vor der Tür (`wort` trennt den Heim-Stand von der Station des Werks)
        const ringStand = (g, wort, tx, tz, ux, uz) => {
            for (let v = 0; v < 64; v++) {
                const vor = 1.2 + (v >> 3) * 1.5 + g.axis(wort + "vor" + v) * 2;
                const quer = (g.axis(wort + "quer" + v) * 2 - 1) * (2 + (v >> 3));
                const x = tx + ux * vor - uz * quer;
                const z = tz + uz * vor + ux * quer;
                if (frei(x, z)) return nimm({ x, z, blick: Math.atan2(ux, uz) + (g.axis(wort + "dreh") - 0.5) * 1.6 });
            }
            return null;
        };
        // der Stand im nächsten Acker (fachwerk: die lange Achse des Ackers längs cos/sin seines phi)
        const aecker = (plan.felder || []).filter((f) => f && Number.isFinite(f.cx) && Number.isFinite(f.ex));
        const feldStand = (g, tx, tz) => {
            let F = null;
            let fd = Infinity;
            for (const f of aecker) {
                const d = (S.ox + f.cx - tx) ** 2 + (S.oz + f.cz - tz) ** 2;
                if (d < fd) {
                    fd = d;
                    F = f;
                }
            }
            if (!F) return null;
            const c = Math.cos(F.phi || 0);
            const s = Math.sin(F.phi || 0);
            for (let v = 0; v < 16; v++) {
                const lx = (g.axis("fx" + v) * 2 - 1) * F.ex * 0.85;
                const lz = (g.axis("fz" + v) * 2 - 1) * F.ez * 0.85;
                const x = S.ox + F.cx + lx * c - lz * s;
                const z = S.oz + F.cz + lx * s + lz * c;
                if (frei(x, z)) return nimm({ x, z, blick: g.axis("fdreh") * Math.PI * 2 });
            }
            return null;
        };
        const liste = [];
        plan.slots.forEach((sl, si) => {
            const wx = S.ox + sl.x;
            const wz = S.oz + sl.z;
            const haus = steht.get(`${sl.seed >>> 0}@${Math.round(wx)},${Math.round(wz)}`);
            if (!haus) return; // kein Haus, keine Leute
            const n = FC.leuteVon(sl.ov);
            if (!(n > 0)) return;
            const rolle = typeof sl.rolle === "string" ? sl.rolle : "wohnhaus";
            const c = Math.cos(sl.phi || 0);
            const s = Math.sin(sl.phi || 0);
            const tu = sl.tuer || { x: 0, z: 0 };
            const tx = wx + tu.x * c + tu.z * s;
            const tz = wz - tu.x * s + tu.z * c;
            const mx = sl.obb ? S.ox + sl.obb.cx : wx;
            const mz = sl.obb ? S.oz + sl.obb.cz : wz;
            const ul = Math.hypot(tx - mx, tz - mz) || 1;
            const ux = (tx - mx) / ul;
            const uz = (tz - mz) / ul;
            const tuer = { x: tx, z: tz, blick: Math.atan2(-ux, -uz), haus };
            const vor = { x: tx + ux * BW.vorM, z: tz + uz * BW.vorM };
            for (let k = 0; k < n; k++) {
                const g = this._rollGenome(`${plan.seed >>> 0}:${si}:${k}`, "bewohner");
                const same = Math.floor(g.axis("tag") * 4294967296) >>> 0;
                const beruf = KC.berufVon(same, rolle);
                const heim = ringStand(g, "", tx, tz, ux, uz);
                if (!heim) {
                    this._bruchMelden(
                        `BEWOHNER: ${rolle} #${sl.seed >>> 0} in „${plan.name || "?"}" — kein freier Stand vor der Tür`
                    );
                    continue;
                }
                const platz = platzStand(g);
                const werk =
                    beruf === "markt"
                        ? platz
                        : beruf === "feld"
                          ? feldStand(g, tx, tz)
                          : beruf === "hof"
                            ? null
                            : ringStand(g, "w", tx, tz, ux, uz) || heim; // die Station, sonst sein Stand vor der Tür
                liste.push({
                    heim: sl.seed >>> 0,
                    rolle,
                    beruf,
                    same,
                    orte: { tuer, vor, heim, platz, werk },
                    gestalt: g.int("gestalt", 0, BW.gestalten - 1),
                    groesse: 0.96 + g.axis("groesse") * 0.08,
                    atem: g.axis("atem") * 10,
                    leib: null,
                    uhr: 0,
                    takt: 0,
                });
            }
        });
        return liste;
    }

    // DIE VORLAGEN DER GESTALTEN im Faden (der Mensch-Ofen der Foundry, nah zuerst — nie ein Guss im Haupt-Faden): je Stufe
    // EIN Auftrag; die Antwort legt die Vorlage `fest` ins Memo (die Geburt bindet sie, `_bewohnerFort` gibt sie frei).
    _bewohnerVorlagen(S, wo) {
        const memo = AnazhRealm._tierOfenMemo || (AnazhRealm._tierOfenMemo = new Map());
        for (const G of S.gestalten)
            for (let lod = 0; lod < G.keys.length; lod++) {
                const key = G.keys[lod];
                if (G.bestellt[lod] || memo.has(key)) continue;
                G.bestellt[lod] = true;
                this._foundryRequest(
                    "mensch",
                    0,
                    lod,
                    { dials: G.dK, skinColor: G.f.skin, hairColor: G.f.hair },
                    this._foundryRang(wo, false)
                ).then((meshes) => {
                    if (!meshes || !meshes.length) {
                        G.bestellt[lod] = false;
                        return this._bruchMelden(`BEWOHNER: der Mensch-Ofen lieferte die Gestalt nicht (lod ${lod})`);
                    }
                    if (S.gestalten === null) return; // die Siedlung ging, bevor die Vorlage kam
                    this._ofenVorlage(key, false, () => this._ofenAssembleAsset(meshes), true);
                });
            }
    }

    // DIE GEBURT EINES BEWOHNERS: der EINE Mensch-Bau unter den Dials seiner Gestalt (die Übergabe des Spielers ruht — der
    // Sentinel des Mitspielers), die Marke seines Hauses (`heim`), der Fern-Satz je Gestalt (`gattung`), sein Stand auf dem
    // Gesetz (Lehre 22: die Sohle liegt PLAYER_FOOT_OFFSET unter dem Ursprung des Leibs). Er hält seine Haltung jenseits der
    // Stufen-Grenze (`haltungFest`: kein Sprung in die A-Pose der Vorlage); die Glieder der Gestalt (`_tierBaum`: Teile, Hülle,
    // Ruhe) trägt der Glieder-Satz des Welt-March (`_kzLeib`).
    _bewohnerGeburt(S, b) {
        const G = S.gestalten[b.gestalt];
        const alt = this._activePeerUebergabe;
        this._activePeerUebergabe = {};
        let g = null;
        try {
            g = this._buildHumanGroup(G.ov);
        } finally {
            this._activePeerUebergabe = alt;
        }
        const gl = g && g.userData._gelenk;
        if (!g || !g.userData.rig || !gl) {
            b.leib = false;
            if (g) this._disposeSoulGroup(g);
            return this._bruchMelden(`BEWOHNER: der Mensch-Bau lieferte keinen Leib („${S.plan.name || "?"}")`);
        }
        g.name = "bewohner";
        g.userData.heim = b.heim;
        g.userData.gattung = `mensch:${S.key}:${b.gestalt}`;
        g.scale.setScalar(b.groesse);
        const h0 = this._koerperBodenUnter(b.x, NaN, b.z); // der Boden jedes Körpers (Q4: die Fels-Grenze, nie das Dach)
        const h = Number.isFinite(h0) ? this._bewohnerTritt(b.x, b.z, h0, h0) : 0; // an der Tür auf ihrer Stufe
        g.position.set(b.x, h + AnazhRealm.PLAYER_FOOT_OFFSET * b.groesse, b.z);
        g.rotation.y = b.blick;
        gl.haltungFest = true;
        const teile = {};
        gl.nah.traverse((n) => {
            if ((n.isGroup || n.isBone) && n.name) teile[n.name] = n;
        });
        const ruhe = {};
        for (const [k, p, q, s] of gl.ruhe || []) if (k.name) ruhe[k.name] = { position: p, quaternion: q, scale: s };
        g.userData._tierBaum = { teile, wrap: gl.nah.parent, ruhe };
        // DER LEIB OHNE SZENEN-GANG (die Klasse der Ruhe, K59: `_ruhendeWurzel`): seine Matrizen stehen, der Szenen-Gang
        // überspringt ihn; was ihn bewegt (Atem, Gang, Schritt — `_tickBewohner`), zieht sie selbst nach (`_leibMatrix`)
        g.updateMatrixWorld(true);
        g.updateMatrixWorld = AnazhRealm._ruhendeWurzel;
        // DAS TEMPO DES GANGS (mensch.K2): die Tempo-Einheit des Steuer-Gesetzes an seiner Beinlänge × `gang` des Tags
        b.beinL = Math.max(0.3, this._gaitBeinMass(g.userData.rig).L);
        b.tempo = globalThis.__tetrapodaCore.tempoEinheit(b.beinL) * window.__koerperCore.TAGES_GESETZ.gang;
        // DER WURF IST DER SATZ (`_bewohnerSatz`): kein Teil des Leibs wirft, auch der nahe nicht — die Kaskaden zeichnen jeden
        // Bewohner im Nah-Kreis aus dem Wurf-Satz seiner Gestalt; sichtbar wird der Leib erst durch die Nah-Wahl (`_tickBewohner`)
        g.traverse((n) => {
            if (n.isMesh) n.castShadow = false;
        });
        g.visible = false;
        this.state.scene.add(g);
        b.leib = g;
        if (G.satz === null) G.satz = this._bewohnerSatz(S, G, b);
    }

    // DER SATZ EINER GESTALT (der EINE Gang-Satz, `_gangSatz` — Lehre 23: die Kosten der Menge hängen nie an der Kopfzahl): die
    // Mengen-Stufe des Mensch-Ofens (koerper-core Zeile 2) als drei Senken: die Haut in ihrem Stoff, jeder andere Teil (Kleid,
    // Schuh, Haar beidseitig, Auge) im Stoff des größten Kleids (jenseits der Armlänge ist ein Auge < 3 px), und der Wurf aus der
    // NUR-WURF-Stufe 3 (Studio-Vertrag B2: sie wird nie gezeigt und wirft für die Art — die Teile `wurf.seh` der
    // Grobstufen-Zeile, nur auf der Wurf-Ebene, jeder im Nah-Kreis, auch die Nah-Wahl). DER GANG IM SATZ: der Satz geht das
    // EINE Gang-Gesetz des nahen Leibs in EINEM Band — `gangPhasen` Phasen des Doppelschritts und der Stand
    // (`_bewohnerGangPose`), je Instanz Phase und Gewicht seines Gangs (`_bewohnerSatzSchreiben`). Ein Bewohner im Satz ist
    // eine Matrix; der Satz geht mit seiner Siedlung.
    _bewohnerSatz(S, G, b) {
        const T = THREE;
        const KC = window.__koerperCore;
        const stufen = [2, 3].map((lod) => this._ofenMenschTemplate(G.dK, G.f.skin, G.f.hair, lod));
        const z1 = this._ofenZeile(KC, "koerper", 1).zeile;
        if (stufen.some((t) => !t || !t.root) || !z1 || !z1.wurf) {
            this._bruchMelden(`BEWOHNER: die Mengen-Stufen der Gestalt fehlen („${S.plan.name || "?"}")`);
            return false;
        }
        const quellen = [];
        const teilVon = { haut: [], rest: [], wurf: [] };
        let haut = null;
        let stoff = null;
        let groesst = 0;
        stufen.forEach((t, si) =>
            t.root.traverse((m) => {
                if (!m.isSkinnedMesh) return;
                const seh = (m.material.userData && m.material.userData.__seh) || m.userData.__seh;
                const tris = m.geometry.index.count / 3;
                if (si === 0 && seh === "haut") haut = m.material;
                else if (si === 0 && seh === "stoff" && tris > groesst) {
                    groesst = tris;
                    stoff = m.material;
                }
                const q = { m, beid: m.material.side === T.DoubleSide };
                quellen.push(q);
                if (si === 0) teilVon[seh === "haut" ? "haut" : "rest"].push(q);
                else if (z1.wurf.seh.indexOf(seh) >= 0) teilVon.wurf.push(q);
            })
        );
        if (!haut || !stoff || !teilVon.wurf.length) {
            this._bruchMelden(
                `BEWOHNER: die Mengen-Stufen tragen Haut, Kleid und Wurf nicht („${S.plan.name || "?"}")`
            );
            return false;
        }
        const stoffVon = { haut, rest: stoff, wurf: stoff };
        const satz = this._gangSatz(
            {
                name: "bewohner-satz",
                inventar: "bewohner",
                n: AnazhRealm.BEWOHNER.gangPhasen,
                quellen,
                cap: S.liste.filter((x) => x.gestalt === b.gestalt).length,
                senken: ["haut", "rest", "wurf"].map((k) => ({
                    teil: k,
                    quellen: teilVon[k],
                    stoff: stoffVon[k],
                    wurf: k === "wurf",
                })),
            },
            // der Stand zuerst (der Satz steht, bis sein Gang gebacken ist — `_bewohnerGangBacken` im Takt)
            (Z) => this._bewohnerGangPose(b.leib, Object.assign(Z, { gebacken: 0, tempo: b.tempo }), Z.n)
        );
        return satz;
    }

    // DIE POSE k DES GANG-PUFFERS (k < n: die Phase 2πk/n des Doppelschritts im EINEN Gang-Gesetz — `_gaitTick` mit dem Tempo
    // des Leibs, eingeschwungen, dann `_animateHuman`; k = n: der Stand, der Kontrapost des Atems bei 0) am Leib, geskinnt in den
    // Raum des Leibs (`_gangSatzPose`). Danach steht der Leib wieder im Stand.
    _bewohnerGangPose(g, satz, k) {
        if (k < satz.n) {
            if (!satz.gang) {
                const h = {};
                for (let i = 0; i < 40; i++) satz.gang = this._gaitTick(g, h, satz.tempo, 0.1, null);
            }
            this._animateHuman(g, 0, (2 * Math.PI * k) / satz.n, true, false, null, satz.gang);
        } else this._animateHuman(g, 0, 0, false, false, null);
        this._leibMatrix(g);
        this._gangSatzPose(satz, k, g.userData._tierBaum.teile, g.matrixWorld);
        if (k < satz.n) {
            this._animateHuman(g, 0, 0, false, false, null);
            this._leibMatrix(g);
        }
    }

    // DER GANG WIRD GEBACKEN (Lehre 14: schwere deterministische Arbeit im Takt, nie als Spitze): je Takt höchstens `je`
    // Phasen am ersten Leib der Gestalt, der nicht als Leib lebt (ein Leib der Nah-Wahl trägt seine eigene Pose); sind alle
    // gebacken, lädt die Textur EINMAL neu und der Satz geht (`fertig`). Liefert, ob ein Satz eben fertig wurde.
    _bewohnerGangBacken(S, je) {
        let fertig = false;
        S.gestalten.forEach((G, gi) => {
            const Z = G.satz;
            if (!Z || Z.fertig || je <= 0) return;
            const b = S.liste.find((x) => x.gestalt === gi && x.leib && !x.nah);
            if (!b) return;
            for (; je > 0 && Z.gebacken < Z.n; je--) this._bewohnerGangPose(b.leib, Z, Z.gebacken++);
            if (Z.gebacken >= Z.n) {
                Z.tex.needsUpdate = true;
                Z.fertig = fertig = true;
            }
        });
        return fertig;
    }

    // DIE MATRIZEN DER SÄTZE (nur, wenn sich eine Wahl oder Lage ändert — Lehre 25): je Gestalt dicht ([0, n) lebt) — im Auge
    // (Haut und Kleid) jeder Bewohner im Nah-Kreis, den die Nah-Wahl nicht trägt, im Wurf jeder im Nah-Kreis. Je Instanz Phase (`walkPhase` / 2π) und Gewicht (`_gaitW`) seines Gangs — bis der Gang
    // gebacken ist, der Stand. Die Laufzeit-Marke `_satz` sagt jedem Leser, dass der Leib im Satz gezeichnet wird. Jeder
    // merkt seine Plätze (`satzOrt`: Wurf, Haut, Kleid); wechselt keine Wahl, rückt der Takt nur die Bewegten (`bewegt`) an
    // ihren Plätzen — der Takt kostet die Gehenden, nie die Menge (mensch.K3: der Morgengang trägt das ganze Dorf).
    _bewohnerSatzSchreiben(S, bewegt = null) {
        const m4 = this._bewohnerM4 || (this._bewohnerM4 = new THREE.Matrix4());
        const ARTEN = ["wurf", "haut", "rest"];
        const setze = (Z, k, i, b) =>
            AnazhRealm._gangSatzInstanz(
                Z[k],
                i,
                m4,
                0,
                Z.fertig ? (b.walkPhase || 0) / (2 * Math.PI) : 0,
                Z.fertig ? b._gaitW || 0 : 0
            );
        if (bewegt) {
            const dran = new Set();
            for (const b of bewegt) {
                const Z = b.satzOrt && b.leib ? S.gestalten[b.gestalt].satz : null;
                if (!Z) continue;
                const g = b.leib;
                m4.compose(g.position, g.quaternion, g.scale);
                b.satzOrt.forEach((i, k) => {
                    if (i < 0) return;
                    setze(Z, ARTEN[k], i, b);
                    dran.add(Z[ARTEN[k]]);
                });
            }
            for (const m of dran) AnazhRealm._gangSatzNeu(m);
            return;
        }
        S.gestalten.forEach((G, gi) => {
            const Z = G.satz;
            if (!Z) return;
            const zahl = { haut: 0, rest: 0, wurf: 0 };
            for (const b of S.liste) {
                if (b.gestalt !== gi || !b.leib) continue;
                const g = b.leib;
                g.userData._satz = !!b.kreis && !b.nah;
                b.satzOrt = null;
                if (!b.kreis) continue;
                m4.compose(g.position, g.quaternion, g.scale);
                b.satzOrt = ARTEN.map((k) => (k !== "wurf" && b.nah ? -1 : zahl[k]++));
                b.satzOrt.forEach((i, k) => i >= 0 && setze(Z, ARTEN[k], i, b));
            }
            for (const k of ARTEN) AnazhRealm._gangSatzZahl(Z[k], zahl[k]);
        });
    }

    // DER BEWOHNER-TAKT (Lehre 13: im Frame-Takt der Wesen, nie am Render-Signal): je gemeldeter Siedlung nahe dem Spieler
    // (`AUTO_SETTLEMENT.nearM`, die Nähe des Dorf-Zugs) die Liste, sobald ihre Häuser stehen, die Vorlagen im Faden und je
    // Takt höchstens `BEWOHNER.geburtenJeTakt` Geburten; jenseits nearM × `fernFaktor` gehen die Leiber (`_bewohnerFort`).
    // DER TAG (mensch.K2): die Uhr der Welt ist das Wort des Spielers — je `BEWOHNER.planH` Stunden (oder nach einem Sprung
    // der Uhr) liest jeder Bewohner seinen Plan (`_bewohnerZiel`, koerper-core `tagesPlan`); wer ein neues Ziel hat, GEHT
    // den Weg des Dorf-Plans (`_bewohnerWeg`, höchstens `wegeJeTakt` neue Wege je Takt) im Tempo seines Leibs
    // (`_bewohnerSchritt`) auf der Raten-Leiter (`_creatureAnimDiv`), wer drinnen ist, zeichnet nirgends.
    // Je Leib: jenseits der Nah-Grenze der Glieder-Satz (`_kzLeib`, echte GPU), diesseits der Satz seiner Gestalt
    // (`_bewohnerSatzSchreiben`, neu nur, wenn eine Lage oder Wahl wechselt) — nur die Nah-Wahl lebt als Leib: der
    // Stufen-Schalter (`_gelenkStufe`) und das EINE Gang-Gesetz (`_gaitTick` → `_animateHuman`: Gang, Stand mit Kontrapost).
    _tickBewohner(delta) {
        const st = this.state;
        const pm = st.playerMesh;
        const alle = this._bewohnerSiedlungen;
        if (!pm || !alle || !alle.size || !st.scene) return;
        const A = AnazhRealm.AUTO_SETTLEMENT;
        const BW = AnazhRealm.BEWOHNER;
        const p = pm.position;
        const echt = !(st.renderer && st.renderer._isHeadlessNull);
        const memo = AnazhRealm._tierOfenMemo;
        const tag = Number.isFinite(st.timeOfDay) ? st.timeOfDay : 0.5;
        const stunde = (((tag % 1) + 1) % 1) * 24;
        let geburten = 0;
        let wege = 0;
        for (const S of alle.values()) {
            const d2 = (S.ox - p.x) ** 2 + (S.oz - p.z) ** 2;
            if (d2 > (A.nearM * BW.fernFaktor) ** 2) {
                if (S.liste) this._bewohnerFort(S);
                continue;
            }
            if (!S.liste) {
                if (d2 > A.nearM * A.nearM) continue;
                const q = this._autoSettlementQueue;
                if (q && q.cellKey === S.key) continue; // die Häuser wachsen noch
                S.gestalten = this._bewohnerGestalten(S);
                S.liste = this._bewohnerListe(S);
                S.planStunde = null;
                this._bewohnerWacheSetzen(S);
            }
            // DIE WACHE (mensch.K3): wechselt eine Hülle im Rechteck der Wege, prüft jeder Gehende den Rest seines Wegs
            if (S.wache.stand !== S.wegeStand) {
                S.wegeStand = S.wache.stand;
                this._bewohnerWegPruefen(S);
            }
            let anders = false; // eine Wahl wechselt: der Satz neu (`_bewohnerSatzSchreiben`); sonst rücken die Bewegten
            const bewegt = this._bewohnerBewegt || (this._bewohnerBewegt = []);
            bewegt.length = 0;
            const dS = S.planStunde == null ? 12 : Math.abs(stunde - S.planStunde);
            if (Math.min(dS, 24 - dS) >= BW.planH) {
                S.planStunde = stunde;
                for (const b of S.liste) if (this._bewohnerZiel(b, stunde)) anders = true;
            }
            this._bewohnerVorlagen(S, p);
            if (this._bewohnerGangBacken(S, BW.gangJeTakt)) anders = true;
            const nah = this._bewohnerNah || (this._bewohnerNah = []);
            nah.length = 0;
            for (const b of S.liste) {
                if (!b.leib) {
                    if (b.leib === false || geburten >= BW.geburtenJeTakt) continue;
                    const G = S.gestalten[b.gestalt];
                    if (!memo || G.keys.some((k) => !memo.has(k))) continue;
                    // geboren wird, wo die Uhr ihn sieht: am Ort seines Plans (drinnen an seiner Tür, ungezeichnet)
                    b.x = b.ziel.x;
                    b.z = b.ziel.z;
                    b.blick = Number.isFinite(b.ziel.blick) ? b.ziel.blick : 0;
                    this._bewohnerGeburt(S, b);
                    geburten++;
                    if (!b.leib) continue;
                    b.da = true;
                    b.drinnen = b.drinnenSoll;
                    b.leib.userData._drinnen = b.drinnen;
                    b.wegRest = 0;
                }
                const g = b.leib;
                const u = g.userData;
                const bd2 = (b.d2 = (g.position.x - p.x) ** 2 + (g.position.z - p.z) ** 2);
                // DER GANG: ein neues Ziel sucht seinen Weg (gedeckelt je Takt), der Weg trägt den Leib im Tempo des Gesetzes
                if (!b.da && !b.weg && wege < BW.wegeJeTakt) {
                    this._bewohnerWeg(S, b);
                    wege++;
                }
                if (b.weg) {
                    b.gehDt = (b.gehDt || 0) + delta;
                    const div = Math.max(
                        1,
                        this._creatureAnimDiv(Math.sqrt(bd2), u._gelenk.abM * g.scale.x, 0, delta, true)
                    );
                    if ((b.gehTakt = ((b.gehTakt || 0) + 1) % div) === 0) {
                        const dt = b.gehDt;
                        b.gehDt = 0;
                        if (this._bewohnerSchritt(b, dt)) {
                            bewegt.push(b);
                            b.lageNeu = true;
                        }
                        if (b.drinnen) anders = true;
                        // jenseits der Nah-Wahl geht der Leib dasselbe Gang-Gesetz (Phase und Gewicht — der Satz liest sie,
                        // `_bewohnerSatzSchreiben`); fern trägt das Feld die Gestalt: die Glieder gehen den Gang mit
                        if (!b.nah) this._bewohnerGangSchritt(b, b.weg ? b.tempo : 0, dt, echt, p);
                    }
                }
                // der Glieder-Satz fragt nur, wer seine Seite wechseln kann oder noch keinen Satz trägt — die Knochen eines
                // stehenden Leibs ruhen, seine Glieder stehen nach dem ersten Schreiben (Lehre 25: der Takt kostet, was ihn betrifft)
                const N = AnazhRealm.KREATUR_NAH_MESH;
                if (
                    echt &&
                    !b.drinnen &&
                    (u._kzNah === undefined ||
                        !u._kzVersuch ||
                        (u._kzNah === true ? bd2 >= N.aus * N.aus : bd2 < N.ein * N.ein))
                )
                    this._kzLeib(g, p, true); // die Glieder backen vorab: wer hinausgeht, trägt sein Feld ab dem ersten Schritt
                // DER NAH-KREIS (diesseits trägt kein Feld; ohne Bild jeder): darin der Satz, die Nächsten leben (`nahM`);
                // wer drinnen ist, steht in keinem Kreis
                const kreis = !b.drinnen && (!echt || u._kzNah === true);
                if (kreis !== b.kreis) anders = true;
                b.kreis = kreis;
                const rN = b.nah ? BW.nahM + BW.nahHystM : BW.nahM;
                if (kreis && bd2 < rN * rN) nah.push(b);
            }
            // DIE NAH-WAHL: höchstens `nahLeiber` der Nächsten leben (Gang, Atem, Stufen, Blick des Leibs) — jeder andere im
            // Nah-Kreis steht im Satz seiner Gestalt; der Wechsel schaltet nur `visible` und schreibt die Sätze neu
            nah.sort((a, b) => a.d2 - b.d2);
            if (nah.length > BW.nahLeiber) nah.length = BW.nahLeiber;
            for (const b of S.liste) {
                const g = b.leib;
                if (!g) continue;
                const istNah = nah.indexOf(b) >= 0;
                if (istNah !== !!b.nah) {
                    b.nah = istNah;
                    g.visible = istNah;
                    anders = true;
                }
                b.uhr += delta;
                b.animDt = (b.animDt || 0) + delta;
                // DER BLICK AM ZIEL: wer steht, wendet sich seinem Ziel zu (`_bewohnerDrehen`)
                if (b.drehen != null && this._bewohnerDrehen(b, delta, echt, p)) {
                    bewegt.push(b);
                    b.lageNeu = true;
                }
                // jenseits der Nah-Wahl klingt der Gang im Stand aus (das Gewicht des EINEN Gang-Tick)
                if (!istNah && !b.weg && b._gaitW > 0) {
                    this._bewohnerGangSchritt(b, 0, delta, echt, p);
                    bewegt.push(b);
                }
                if (!istNah) continue;
                // der Leib zieht seine Matrizen selbst nach (K59 `_ruhendeWurzel`): nach jeder Pose und jedem Schritt
                let neu = b.lageNeu === true;
                b.lageNeu = false;
                if (!this._gelenkStufe(g, b.d2)) {
                    const u = g.userData;
                    const geht = !!b.weg;
                    const om = b._gait ? b._gait.omega : 0;
                    const div = this._creatureAnimDiv(Math.sqrt(b.d2), u._gelenk.abM * g.scale.x, om, delta, geht);
                    if (div !== 0 && (b.takt = (b.takt + 1) % div) === 0) {
                        const dtA = Math.min(0.25, b.animDt);
                        b.animDt = 0;
                        const gang = this._gaitTick(g, b, geht ? b.tempo : 0, dtA, null);
                        this._animateHuman(g, b.uhr + b.atem, b.walkPhase || 0, geht, false, null, gang);
                        neu = true;
                    }
                }
                if (neu) this._leibMatrix(g);
                if (neu && (b.weg || b._gaitW > 0)) bewegt.push(b); // sein Wurf geht im Satz mit
            }
            if (anders) this._bewohnerSatzSchreiben(S);
            else if (bewegt.length) this._bewohnerSatzSchreiben(S, bewegt);
        }
    }

    // DER GANG JENSEITS DER NAH-WAHL (mensch.K1 Staffel 2): derselbe Gang-Tick wie der nahe Leib (`_gaitTick`: Phase, Gewicht,
    // Fuß-Ziel) — der Satz liest Phase und Gewicht; trägt das Feld den Leib (jenseits des Nah-Kreises), geht sein Rig den Gang
    // (`_animateHuman`) und die Glieder folgen (`_kzLeib`). Steht er, klingt das Gewicht aus und fällt unter 1 % auf 0.
    _bewohnerGangSchritt(b, v, dt, echt, p) {
        const g = b.leib;
        const gang = this._gaitTick(g, b, v, dt, null);
        if (v === 0 && !(b._gaitW > 0.01)) b._gaitW = 0;
        if (echt && !b.drinnen && this._kzBesitztFeld(g)) {
            this._animateHuman(g, b.uhr + b.atem, b.walkPhase || 0, v > 0, false, null, gang);
            this._leibMatrix(g);
            this._kzLeib(g, p);
        }
    }

    // DER BLICK AM ZIEL (mensch.K2 Staffel 2): wer an seinem Ort steht, schaut auf sein Ziel — am Platz zur Mitte, vor der Tür in
    // die Gasse, am Rand der Gasse auf das Gegenüber (`blick` des Stands, `_bewohnerListe`); er wendet sich mit der Wendegrenze
    // des Steuer-Gesetzes, wie er im Gehen dreht. Liefert, ob sich die Lage änderte.
    _bewohnerDrehen(b, dt, echt, p) {
        const g = b.leib;
        const TC = globalThis.__tetrapodaCore;
        const om = TC.STEUER_GESETZ.wende * Math.sqrt(TC.GANG_GESETZ.g / b.beinL) * dt;
        let dw = b.drehen - g.rotation.y;
        dw -= Math.PI * 2 * Math.round(dw / (Math.PI * 2));
        if (Math.abs(dw) <= om) {
            g.rotation.y += dw;
            b.drehen = null;
        } else g.rotation.y += Math.sign(dw) * om;
        if (echt && !b.nah && !b.drinnen && this._kzBesitztFeld(g)) {
            this._leibMatrix(g);
            this._kzLeib(g, p);
        }
        return true;
    }

    // DAS ZIEL DER STUNDE (mensch.K2): der Plan des Gesetzes (koerper-core `tagesPlan`) aus dem Samen, der Rolle seines
    // Hauses und seinen Orten — drinnen ist das Ziel die Tür. Ein neues Ziel verwirft den alten Weg; wer drinnen war und
    // hinaus soll, tritt aus der Tür (wieder gezeichnet). Liefert, ob sich das Bild ändert.
    _bewohnerZiel(b, stunde) {
        const KC = window.__koerperCore;
        if (!KC || typeof KC.tagesPlan !== "function") return AnazhRealm._kernPflichtBruch("koerper:tagesPlan");
        const o = b.orte;
        const soll = KC.tagesPlan(b.same, b.rolle, o.heim, o.werk, stunde, o.platz);
        const ziel = soll.drinnen ? o.tuer : soll.ort;
        b.akt = soll.akt;
        if (ziel === b.ziel) return false;
        // sein Stand ist der Ort, an dem er steht — wer ohne Weg blieb (`_bewohnerWeg`), geht von hier
        const g = b.leib;
        b.stand =
            b.da && g && b.ziel && Math.hypot(g.position.x - b.ziel.x, g.position.z - b.ziel.z) < 0.5 ? b.ziel : null;
        b.ziel = ziel;
        b.drehen = null;
        b.drinnenSoll = soll.drinnen;
        b.da = false;
        b.weg = null;
        b.wegRest = null;
        if (b.drinnen && !soll.drinnen) {
            b.drinnen = false;
            if (b.leib) b.leib.userData._drinnen = false;
            return true;
        }
        return false;
    }

    // DER WEG (mensch.K2, „nie durch Hauswände"): vom Stand des Leibs zum Ziel — die Tür liegt in der Wand: wer aus ihr tritt
    // oder in sie geht, geht über den Punkt vor ihr (`orte.vor`, `BEWOHNER.vorM`); dazwischen die Strecke
    // (`_bewohnerStrecke`). Jeder geht
    // in seiner Spur (`spurM` quer zum Weg, aus dem Samen — die Menge geht nebeneinander, nicht durcheinander).
    _bewohnerWeg(S, b) {
        const g = b.leib;
        const o = b.orte;
        // er geht von seinem Stand (ein Ort seines Tags: Anschluss und freie Linien gemerkt) oder, mitten im Weg, von hier
        const von = b.stand || { x: g.position.x, z: g.position.z };
        const ziel = b.ziel;
        const a = von === o.tuer ? o.vor : von;
        const e = ziel === o.tuer ? o.vor : ziel;
        const spur = (((b.same >>> 8) & 255) / 255 - 0.5) * 2 * AnazhRealm.BEWOHNER.spurM;
        const strecke = a === e ? [] : this._bewohnerStrecke(S, a, e, spur);
        // kein Weg (laut, `_bewohnerStrecke`): er bleibt, wo er steht — nie geradeaus durch die Wand
        if (!strecke) {
            b.da = true;
            b.wegRest = 0;
            return;
        }
        const pts = (a !== von ? [a] : []).concat(strecke);
        if (e !== ziel) pts.push(ziel);
        if (!pts.length) pts.push(ziel);
        // je Punkt der Rest-Weg bis zum Ziel (die Linse liest, dass er schrumpft)
        const rest = new Float64Array(pts.length);
        for (let i = pts.length - 2; i >= 0; i--)
            rest[i] = rest[i + 1] + Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].z - pts[i].z);
        b.weg = pts;
        b.wegRestAb = rest;
        b.wi = 0;
        b.wegRest = Math.hypot(pts[0].x - g.position.x, pts[0].z - g.position.z) + rest[0];
    }

    // DIE STRECKE zwischen zwei Orten: frei in gerader Linie (`_bewohnerWand`, bis `direktM`; je Ort gemerkt), sonst über
    // das Wege-Netz des Dorf-Plans (`_bewohnerNetz`: Straßen und Feldwege, ihre Kreuzungen): an den nächsten frei
    // erreichbaren Knoten, den kürzesten Weg über freie Kanten (je Start-Knoten EIN Baum, gemerkt), vom Knoten des Ziels frei
    // zum Ziel. Jedes Gemerkte gilt für den Stand der Wache (`_blockerWacheMelden`): wechselt eine Hülle, fällt es. Die Spur
    // neben der Mitte (`spurM`) geht nur, wo jedes ihrer Beine frei ist (`_bewohnerWand`) — sonst geht er die Mitte der
    // Gasse, deren Kanten frei sind. Kein Weg: laut, und null (er bleibt, `_bewohnerWeg`).
    _bewohnerStrecke(S, von, ziel, spur) {
        const stand = S.wache.stand;
        if (von._wegeStand !== stand) {
            von._wegeStand = stand;
            von._direkt = null;
            von._knoten = undefined;
        }
        let direkt = von._direkt ? von._direkt.get(ziel) : undefined;
        if (direkt === undefined) {
            direkt =
                Math.hypot(ziel.x - von.x, ziel.z - von.z) < AnazhRealm.BEWOHNER.direktM &&
                !this._bewohnerWand(von, ziel);
            (von._direkt || (von._direkt = new Map())).set(ziel, direkt);
        }
        if (direkt) return [ziel];
        const N = this._bewohnerNetz(S);
        if (ziel._wegeStand !== stand) {
            ziel._wegeStand = stand;
            ziel._direkt = null;
            ziel._knoten = undefined;
        }
        const a = this._bewohnerAnschluss(N, von);
        const e = this._bewohnerAnschluss(N, ziel);
        const vor = a >= 0 && e >= 0 ? this._bewohnerBaum(N, a) : null;
        if (!vor || (e !== a && vor[e] < 0)) {
            this._bruchMelden(
                `BEWOHNER: kein Weg im Dorf-Plan „${S.plan.name || "?"}" von ${von.x.toFixed(1)}/${von.z.toFixed(1)} zu ${ziel.x.toFixed(1)}/${ziel.z.toFixed(1)}`
            );
            return null;
        }
        const kette = [];
        for (let k = e; k >= 0 && k !== a; k = vor[k]) kette.push(k);
        kette.push(a);
        kette.reverse();
        const pts = kette.map((k, i) => {
            const q = N.knoten[k];
            const q0 = N.knoten[kette[Math.max(0, i - 1)]];
            const q1 = N.knoten[kette[Math.min(kette.length - 1, i + 1)]];
            const l = Math.hypot(q1.x - q0.x, q1.z - q0.z) || 1;
            return { x: q.x - ((q1.z - q0.z) / l) * spur, z: q.z + ((q1.x - q0.x) / l) * spur };
        });
        pts.push(ziel);
        if (spur)
            for (let i = 0, p = von; i < pts.length; p = pts[i++])
                if (this._bewohnerWand(p, pts[i])) return this._bewohnerStrecke(S, von, ziel, 0);
        return pts;
    }

    // DER SCHRITT: der Leib geht `tempo · dt` Meter längs seines Wegs, steht auf dem Boden jedes Körpers (`_koerperBodenUnter`,
    // die Sohle PLAYER_FOOT_OFFSET unter dem Ursprung), wendet sich mit der Wendegrenze des Steuer-Gesetzes zum Weg; am Ziel
    // steht er (`da`), drinnen geht er ins Haus. Liefert, ob sich die Lage änderte.
    _bewohnerSchritt(b, dt) {
        const g = b.leib;
        const pts = b.weg;
        let x = g.position.x;
        let z = g.position.z;
        let rest = b.tempo * dt;
        let rx = 0;
        let rz = 0;
        while (rest > 0 && b.wi < pts.length) {
            const q = pts[b.wi];
            const dx = q.x - x;
            const dz = q.z - z;
            const d = Math.hypot(dx, dz);
            if (d > 1e-6) {
                rx = dx / d;
                rz = dz / d;
            }
            if (d <= rest) {
                x = q.x;
                z = q.z;
                rest -= d;
                b.wi++;
            } else {
                x += rx * rest;
                z += rz * rest;
                rest = 0;
            }
        }
        // der Grund je halben Meter Weg neu (die Cache-Weite des Tier-Grunds, `_creatureGroundY`) — dazwischen trägt der letzte
        const fuss = AnazhRealm.PLAYER_FOOT_OFFSET * b.groesse;
        if (!(b.grundY !== undefined && (x - b.grundX) ** 2 + (z - b.grundZ) ** 2 < 0.25)) {
            const h = this._koerperBodenUnter(x, g.position.y - fuss, z);
            b.grundX = x;
            b.grundZ = z;
            b.grundY = this._bewohnerTritt(x, z, g.position.y - fuss, Number.isFinite(h) ? h : g.position.y - fuss);
        }
        g.position.set(x, b.grundY + fuss, z);
        if (rx || rz) {
            const TC = globalThis.__tetrapodaCore;
            const om = TC.STEUER_GESETZ.wende * Math.sqrt(TC.GANG_GESETZ.g / b.beinL) * dt;
            const soll = Math.atan2(rx, rz);
            let dw = soll - g.rotation.y;
            dw -= Math.PI * 2 * Math.round(dw / (Math.PI * 2));
            g.rotation.y += Math.max(-om, Math.min(om, dw));
        }
        if (b.wi >= pts.length) {
            b.weg = null;
            b.da = true;
            b.wegRest = 0;
            if (!b.drinnenSoll && Number.isFinite(b.ziel.blick)) b.drehen = b.ziel.blick; // am Ziel der Blick des Plans
            if (b.drinnenSoll) {
                b.drinnen = true;
                g.userData._drinnen = true;
                if (g.userData._kzGlieder)
                    for (const gl of g.userData._kzGlieder) this._weltFeldAktiv(gl.handle, false);
            }
        } else {
            const q = pts[b.wi];
            b.wegRest = Math.hypot(q.x - x, q.z - z) + b.wegRestAb[b.wi];
        }
        return true;
    }

    // DER TRITT (mensch.K3): der Grund des Leibs ist der Boden des Gesetzes (`grund`) oder die höchste Oberkante einer Box des
    // Blocker-Netzes unter seiner Kapsel im Haft-Band der Kapsel des Spielers ([Fuß − PLAYER_GROUND_SNAP, Fuß + PLAYER_STEP_UP]
    // über dem Fuß `fuss`, die Fuge trägt nie — `_resolveCapsuleVsAABB`): die Stufen vor der Tür, die Schwelle — so tritt
    // er ins Haus und aus ihm, nie mit den Schienbeinen durch die Diele.
    _bewohnerTritt(x, z, fuss, grund) {
        const R = AnazhRealm.PLAYER_WALL_RADIUS;
        const kand = this._bewohnerWandKand || (this._bewohnerWandKand = []);
        kand.length = 0;
        this._blockerNahe(x, z, R, 0, kand);
        let top = grund;
        const hoch = fuss + AnazhRealm.PLAYER_STEP_UP;
        const tief = fuss - AnazhRealm.PLAYER_GROUND_SNAP;
        for (const e of kand)
            for (const box of e.blockerAABBs || [])
                if (
                    box.gedeckt !== true &&
                    box.topY > top &&
                    box.topY <= hoch &&
                    box.topY >= tief &&
                    this._boxAbstand2(box, x, z) <= R * R
                )
                    top = box.topY;
        return top;
    }

    // DIE WAND AN DER STRECKE (mensch.K3): die Kapsel des Leibs — die des Spielers (`_resolveCapsuleVsAABB`: Radius
    // PLAYER_WALL_RADIUS, Wand ab der Stufe PLAYER_STEP_UP über der Sohle) bis zum Scheitel (`BEWOHNER.kopfM`) — längs a → e
    // gegen das EINE Blocker-Netz (`_blockerNahe`, je Box `_streckeBoxAbstand2`): Haus, Bau, Baum, Fels. Die Höhe trägt der
    // Boden an beiden Enden (die Stufe am tieferen, der Scheitel am höheren). Liefert den Eintrag der ersten Wand oder null;
    // a = e fragt den Stand.
    _bewohnerWand(a, e) {
        const R = AnazhRealm.PLAYER_WALL_RADIUS;
        const kand = this._bewohnerWandKand || (this._bewohnerWandKand = []);
        kand.length = 0;
        this._blockerNahe((a.x + e.x) / 2, (a.z + e.z) / 2, Math.hypot(e.x - a.x, e.z - a.z) / 2 + R, 0, kand);
        let lo = NaN;
        let hi = NaN;
        for (const ent of kand) {
            const boxen = ent.blockerAABBs;
            if (!boxen) continue;
            for (const box of boxen) {
                if (this._streckeBoxAbstand2(box, a.x, a.z, e.x, e.z) >= R * R) continue;
                if (lo !== lo) {
                    const ya = this.getTerrainHeightAt(a.x, a.z);
                    const ye = a === e ? ya : this.getTerrainHeightAt(e.x, e.z);
                    lo = Math.min(ya, ye) + AnazhRealm.PLAYER_STEP_UP;
                    hi = Math.max(ya, ye) + AnazhRealm.BEWOHNER.kopfM;
                    if (!Number.isFinite(lo + hi)) [lo, hi] = [-Infinity, Infinity]; // ohne Boden ist jede Box Wand
                }
                if (box.topY > lo && box.botY < hi) return ent;
            }
        }
        return null;
    }

    // DAS WEGE-NETZ einer Siedlung (je Stand der Wache): je Punkt der Straßen und Feldwege des Plans ein Knoten, die Folge
    // eines Wegs seine Kanten, die Kreuzungen (Knoten zweier Wege näher als `kreuzM`) verbunden; es hängt über FREIE Kanten
    // zusammen (`_bewohnerKante`): was getrennt liegt (ein Weg, der seitlich in eine Straße mündet, eine Gasse, über der ein
    // Baum steht), schließt der kürzeste freie Schritt zum Rest (bis `naehtM`) — EIN Netz je Dorf. Wechselt eine Hülle im
    // Rechteck der Wache, entsteht es neu.
    _bewohnerNetz(S) {
        if (S.netz && S.netz.stand === S.wache.stand) return S.netz;
        const knoten = [];
        const kanten = [];
        const zug = [];
        const N = { knoten, kanten, baeume: new Map(), frei: new Map(), stand: S.wache.stand };
        const kante = (i, j) => {
            const w = Math.hypot(knoten[i].x - knoten[j].x, knoten[i].z - knoten[j].z);
            kanten[i].push(j, w);
            kanten[j].push(i, w);
        };
        let wi = 0;
        for (const rd of (S.plan.roads || []).concat(S.plan.feldwege || [])) {
            let vor = -1;
            for (const q of rd.pts || []) {
                if (!q || !Number.isFinite(q.x) || !Number.isFinite(q.z)) continue;
                knoten.push({ x: S.ox + q.x, z: S.oz + q.z });
                kanten.push([]);
                zug.push(wi);
                const i = knoten.length - 1;
                if (vor >= 0) kante(vor, i);
                vor = i;
            }
            wi++;
        }
        const K2 = AnazhRealm.BEWOHNER.kreuzM ** 2;
        for (let i = 0; i < knoten.length; i++)
            for (let j = i + 1; j < knoten.length; j++)
                if (zug[i] !== zug[j] && (knoten[i].x - knoten[j].x) ** 2 + (knoten[i].z - knoten[j].z) ** 2 < K2)
                    kante(i, j);
        const teil = new Int32Array(knoten.length);
        const N2 = AnazhRealm.BEWOHNER.naehtM ** 2;
        for (;;) {
            teil.fill(-1);
            let n = 0;
            for (let i = 0; i < knoten.length; i++) {
                if (teil[i] >= 0) continue;
                const offen = [i];
                teil[i] = n;
                while (offen.length) {
                    const k = offen.pop();
                    for (let e = 0; e < kanten[k].length; e += 2) {
                        const j = kanten[k][e];
                        if (teil[j] < 0 && this._bewohnerKante(N, k, j)) {
                            teil[j] = n;
                            offen.push(j);
                        }
                    }
                }
                n++;
            }
            if (n < 2) break;
            // der kürzeste freie Schritt aus dem Teil des ersten Knotens hinaus
            const paare = [];
            for (let i = 0; i < knoten.length; i++) {
                if (teil[i] !== 0) continue;
                for (let j = 0; j < knoten.length; j++) {
                    if (teil[j] === 0) continue;
                    const d = (knoten[i].x - knoten[j].x) ** 2 + (knoten[i].z - knoten[j].z) ** 2;
                    if (d <= N2) paare.push([d, i, j]);
                }
            }
            paare.sort((p, q) => p[0] - q[0]);
            const naht = paare.find(([, i, j]) => !this._bewohnerWand(knoten[i], knoten[j]));
            if (!naht) {
                this._bruchMelden(
                    `BEWOHNER: das Wege-Netz von „${S.plan.name || "?"}" zerfällt in ${n} Teile (kein freier Schritt bis ${AnazhRealm.BEWOHNER.naehtM} m)`
                );
                break;
            }
            kante(naht[1], naht[2]);
            N.frei.set(naht[1] < naht[2] ? naht[1] * knoten.length + naht[2] : naht[2] * knoten.length + naht[1], true);
        }
        return (S.netz = N);
    }

    // DIE KANTE i–j des Netzes ist frei (`_bewohnerWand` längs ihrer Mitte), je Stand der Wache einmal geurteilt und gemerkt
    // (`N.frei`) — der Baum der kürzesten Wege geht nur freie Kanten: ein Haus, ein Baum, ein Fels quer über der Gasse
    // nimmt sie aus dem Netz, bis seine Hülle geht.
    _bewohnerKante(N, i, j) {
        const key = i < j ? i * N.knoten.length + j : j * N.knoten.length + i;
        let f = N.frei.get(key);
        if (f === undefined) N.frei.set(key, (f = !this._bewohnerWand(N.knoten[i], N.knoten[j])));
        return f;
    }

    // DIE WACHE ÜBER DEN WEGEN einer Siedlung (mensch.K3, `_blockerWacheMelden`): das Rechteck um jeden Ort ihrer Bewohner und
    // jeden Punkt ihrer Gassen und Feldwege (plus die Kapsel und das Spiel der Spur) — jede Hülle, die dort wechselt, zählt
    // ihren Stand; das Gemerkte der Wege gilt je Stand (`_bewohnerStrecke`, `_bewohnerNetz`).
    _bewohnerWacheSetzen(S) {
        let x0 = Infinity;
        let x1 = -Infinity;
        let z0 = Infinity;
        let z1 = -Infinity;
        const um = (x, z) => {
            if (!Number.isFinite(x) || !Number.isFinite(z)) return;
            x0 = Math.min(x0, x);
            x1 = Math.max(x1, x);
            z0 = Math.min(z0, z);
            z1 = Math.max(z1, z);
        };
        for (const b of S.liste) for (const k in b.orte) if (b.orte[k]) um(b.orte[k].x, b.orte[k].z);
        for (const rd of (S.plan.roads || []).concat(S.plan.feldwege || []))
            for (const q of rd.pts || []) if (q) um(S.ox + q.x, S.oz + q.z);
        const r = AnazhRealm.PLAYER_WALL_RADIUS + AnazhRealm.BEWOHNER.spurM + 1;
        S.wache = { x0: x0 - r, x1: x1 + r, z0: z0 - r, z1: z1 + r, stand: 0 };
        S.wegeStand = 0;
        (this._blockerWachen || (this._blockerWachen = new Set())).add(S.wache);
    }

    // DER REST DES WEGS nach einem Wechsel der Wache: wer geht, prüft die Beine vor sich (vom Leib bis zum Ziel, ohne das Bein
    // durch die eigene Tür); trifft eines eine Wand, legt er den Weg neu von hier (`_bewohnerWeg`, im nächsten Takt).
    _bewohnerWegPruefen(S) {
        for (const b of S.liste) {
            if (!b.weg || !b.leib) continue;
            const o = b.orte;
            let p = { x: b.leib.position.x, z: b.leib.position.z };
            for (let i = b.wi; i < b.weg.length; p = b.weg[i++]) {
                const q = b.weg[i];
                const tuerBein = q === o.tuer || (q === o.vor && (p === o.tuer || (i === b.wi && b.stand === o.tuer)));
                if (tuerBein || !this._bewohnerWand(p, q)) continue;
                b.weg = null;
                b.stand = null;
                break;
            }
        }
    }

    // DER ANSCHLUSS eines Orts: der nächste Knoten des Netzes, den er frei erreicht (die zwölf nächsten geprüft; sonst der
    // nächste — laut, nie still weg).
    _bewohnerAnschluss(N, o) {
        if (o._knoten !== undefined) return o._knoten;
        const nah = N.knoten
            .map((q, i) => ({ i, d: (q.x - o.x) ** 2 + (q.z - o.z) ** 2 }))
            .sort((a, b) => a.d - b.d)
            .slice(0, 12);
        let k = nah.length ? nah[0].i : -1;
        const frei = nah.find((c) => !this._bewohnerWand(o, N.knoten[c.i]));
        if (frei) k = frei.i;
        else if (k >= 0)
            this._bruchMelden(`BEWOHNER: der Ort ${o.x.toFixed(1)}/${o.z.toFixed(1)} erreicht keinen Weg frei`);
        o._knoten = k;
        return k;
    }

    // DER BAUM der kürzesten Wege ab einem Knoten (Dijkstra, binärer Haufen) — je Start-Knoten einmal gerechnet, gemerkt.
    _bewohnerBaum(N, a) {
        const gemerkt = N.baeume.get(a);
        if (gemerkt) return gemerkt;
        const n = N.knoten.length;
        const dist = new Float64Array(n).fill(Infinity);
        const vor = new Int32Array(n).fill(-1);
        const haufen = [[0, a]];
        dist[a] = 0;
        const hoch = (i) => {
            while (i > 0) {
                const e = (i - 1) >> 1;
                if (haufen[e][0] <= haufen[i][0]) break;
                [haufen[e], haufen[i]] = [haufen[i], haufen[e]];
                i = e;
            }
        };
        const runter = (i) => {
            for (;;) {
                const l = 2 * i + 1;
                const r = l + 1;
                let m = i;
                if (l < haufen.length && haufen[l][0] < haufen[m][0]) m = l;
                if (r < haufen.length && haufen[r][0] < haufen[m][0]) m = r;
                if (m === i) return;
                [haufen[m], haufen[i]] = [haufen[i], haufen[m]];
                i = m;
            }
        };
        while (haufen.length) {
            const [d, i] = haufen[0];
            const letzt = haufen.pop();
            if (haufen.length) {
                haufen[0] = letzt;
                runter(0);
            }
            if (d > dist[i]) continue;
            const K = N.kanten[i];
            for (let k = 0; k < K.length; k += 2) {
                const j = K[k];
                const dj = d + K[k + 1];
                if (dj < dist[j] && this._bewohnerKante(N, i, j)) {
                    dist[j] = dj;
                    vor[j] = i;
                    haufen.push([dj, j]);
                    hoch(haufen.length - 1);
                }
            }
        }
        N.baeume.set(a, vor);
        return vor;
    }

    // DIE BEWOHNER GEHEN (die Siedlung fern, die Welt wechselt): jeder Leib verlässt Feld und Szene über die EINEN Abschiede
    // (`_kreaturZiegelTod`, `_disposeSoulGroup`), die Vorlagen der Gestalten verlieren `fest` — das Memo räumt sie, sobald kein
    // Leib sie hält. Die Liste fällt mit: kehrt der Spieler zurück, entsteht sie neu aus dem Plan (dieselbe Funktion).
    _bewohnerFort(S) {
        for (const b of S.liste || []) {
            const g = b.leib;
            if (!g) continue;
            this._kreaturZiegelTod(g);
            if (g.parent) g.parent.remove(g);
            this._disposeSoulGroup(g);
        }
        const memo = AnazhRealm._tierOfenMemo;
        for (const G of S.gestalten || []) {
            if (G.satz) this._gangSatzAbschied(G.satz);
            for (const key of G.keys) {
                const v = memo && memo.get(key);
                if (v && v.__ofen) v.__ofen.fest = false;
            }
        }
        if (S.wache && this._blockerWachen) this._blockerWachen.delete(S.wache);
        S.liste = null;
        S.gestalten = null;
        S.netz = null; // das Netz hing an der Wache (`frei`, `stand`): mit der Liste entsteht es neu
        this._ofenMemoRaeumen();
    }
    _bewohnerFortAlle() {
        if (this._bewohnerSiedlungen) for (const S of this._bewohnerSiedlungen.values()) this._bewohnerFort(S);
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_siedlung_bewohner]);

// ===== ATLAS · Siedlung/bewohner — Außen-Konstanten =====
// Worldgen-Auto-Dorf-Daten (Konsument `_tickAutoSettlement`, Wände + Γ5-Disziplin dort):
// nearM Materialisierungs-Distanz · spawnClearM dorffreier Radius um den Genesis-Ort (nearM < spawnClearM →
// am Spawn wirkt nur das START-DORF) · siteProbeR zwei Probe-Ringe (×cellM), falls der Anker scheitert ·
// startRadiusM Start-Dorf-Radien (einmalig je Welt, Seed ":startdorf") · perTick Häuser je Idle-Tick ·
// drosselTakte das Tempo über dem Frame-Budget.
// DAS WIRT-STREAMING der Auto-Dörfer (nur Host-Größen: wann und wie schnell die Welt baut). Das SIEDLUNGS-GESETZ
// (Raster cellM · Seltenheit rarity · Größe nHMin/nHSpan · Steil-Wand slopeMax) lebt EINMAL in
// fachwerk-core (SIEDLUNG) — der Zwilling hier fiel (Welle L, Karte Dorf/Stadt DEFEKT 4: stiller Fallback mit Kopien).
// DIE BEWOHNER (Meisterkarte mensch.K1, `_tickBewohner`): gestalten = die Gestalten je Siedlung (Vorlagen im Ofen, je
// Gestalt beide Stufen ~2,45 MB Geometrie: vier halten das Profi-Band 118 MB, gemessen 21.10. Radeon) · platzAnteil = so viele
// stehen am Tag auf dem Dorfplatz · raumM = der persönliche Raum zwischen zwei Ständen · saumM = der Saum um jeden Grundriss ·
// geburtenJeTakt = Leiber je Takt (Klon aus dem Memo ~1 ms) · fernFaktor = jenseits nearM × fernFaktor gehen die Leiber ·
// nahM (+ nahHystM zurück) / nahLeiber = so nah und so viele leben als Leib (Atem, Stufen), jeder andere im Nah-Kreis steht
// im Satz seiner Gestalt (`_bewohnerSatz`: die Befehle hängen nie an der Kopfzahl) · gangPhasen = die Phasen des Doppelschritts im Gang-Puffer, gangJeTakt = so viele backt ein
// Takt · platzRandM = so weit vom Rand des Platzes steht, wer auf ihm keinen Stand fand. DER TAG (mensch.K2): planH = so viele
// Stunden der Uhr, bis jeder seinen Plan neu liest · wegeJeTakt = neue Wege je Takt · direktM = bis hier geht er frei in
// gerader Linie, weiter über das Wege-Netz · spurM = seine Spur quer zum Weg · kreuzM = Knoten zweier Wege näher als dies
// kreuzen, naehtM = so weit schließt das Netz eine Lücke · vorM = der Punkt vor der Tür, über den jeder Weg ins Haus und
// aus ihm geht. DIE WEGE (mensch.K3): kopfM = der Scheitel des Leibs über der Sohle — so hoch reicht die Kapsel, die jeder
// Stand und jedes Bein gegen das Blocker-Netz fragt (`_bewohnerWand`).
AnazhRealm.BEWOHNER = Object.freeze({
    gestalten: 4,
    platzAnteil: 0.45,
    raumM: 1.1,
    saumM: 0.45,
    geburtenJeTakt: 2,
    fernFaktor: 1.25,
    nahM: 8,
    nahHystM: 1,
    nahLeiber: 4,
    gangPhasen: 16,
    gangJeTakt: 2,
    platzRandM: 10,
    planH: 0.01,
    wegeJeTakt: 2,
    direktM: 30,
    spurM: 0.8,
    kreuzM: 3,
    naehtM: 25,
    vorM: 1.6,
    kopfM: 1.8,
});
