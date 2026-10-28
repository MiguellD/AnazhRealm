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
        // DIE TRACHT DER EPOCHE (siedlung.K4): der Plan trägt die Kleidung seines Jahrs (fachwerk `kleidung`) — ihr Schnitt
        // kleidet jede Gestalt, die Farbe des Genoms fällt in ihre Farben
        const T = S.plan.kleidung;
        if (!T || !Array.isArray(T.farben) || !T.farben.length || !kc.CLOTH_COLORS)
            return AnazhRealm._kernPflichtBruch("fachwerk:kleidung");
        const tuch = Object.keys(kc.CLOTH_COLORS);
        const aus = [];
        for (let gi = 0; gi < AnazhRealm.BEWOHNER.gestalten; gi++) {
            const gen = this._rollHumanoidGenome(`${S.plan.seed >>> 0}:${gi}`);
            gen.sex = gi % 2 ? 0.75 + gen.sex * 0.25 : gen.sex * 0.25;
            const ov = Object.assign(this._dialsAusGenom(gen), { top: T.top, bottom: T.bottom, shoes: T.shoes });
            for (const k of ["topColor", "bottomColor", "shoeColor"])
                if (!T.farben.includes(ov[k])) ov[k] = T.farben[Math.max(0, tuch.indexOf(ov[k])) % T.farben.length];
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
    // weiter draußen — nie still weg. Wo er bei seiner Geburt steht, sagt die Uhr (`_bewohnerZiel`). IN RATEN (Lehre 14,
    // stadt-takt: die Stadt legte ihre Liste in EINEM Takt, ~16 ms): nach jedem Haus gibt die Liste den Takt zurück
    // (`yield`), der Bewohner-Takt legt höchstens `BEWOHNER.haeuserJeTakt` Häuser je Takt.
    *_bewohnerListe(S) {
        const FC = globalThis.__fachwerkCore;
        if (!FC || typeof FC.leuteVon !== "function") return AnazhRealm._kernPflichtBruch("fachwerk:leuteVon");
        const KC = window.__koerperCore;
        if (!KC || typeof KC.berufVon !== "function") return AnazhRealm._kernPflichtBruch("koerper:berufVon");
        const BW = AnazhRealm.BEWOHNER;
        const plan = S.plan;
        const belegt = new Map(); // das Raster des Raums (`frei`): je Zelle x, z, x, z …
        // DIE GASSE BLEIBT FREI (mensch.K3 Staffel 2): kein Stand näher als `gasseFreiM` an der Mitte einer Straße oder eines
        // Feldwegs des Plans — wer steht, steht am Rand, die Spuren der Gehenden (`spurM`) gehen an ihm vorbei
        const gassen = [];
        for (const rd of (plan.roads || []).concat(plan.feldwege || []))
            for (let i = 1; i < (rd.pts || []).length; i++) {
                const [a, e] = [rd.pts[i - 1], rd.pts[i]];
                if (a && e) gassen.push([S.ox + a.x, S.oz + a.z, S.ox + e.x, S.oz + e.z]);
            }
        const G2 = BW.gasseFreiM * BW.gasseFreiM;
        const amWeg = (x, z) => {
            const pkt = { minX: x, maxX: x, minZ: z, maxZ: z };
            return gassen.some(
                ([ax, az, ex, ez]) =>
                    x > Math.min(ax, ex) - BW.gasseFreiM &&
                    x < Math.max(ax, ex) + BW.gasseFreiM &&
                    z > Math.min(az, ez) - BW.gasseFreiM &&
                    z < Math.max(az, ez) + BW.gasseFreiM &&
                    this._streckeBoxAbstand2(pkt, ax, az, ex, ez) < G2
            );
        };
        // DER PUNKT VOR JEDER TÜR BLEIBT FREI (mensch.K3 Staffel 2): über ihn geht jeder hinein und hinaus (`vorM`). Die
        // Regeln der Liste lesen nur den Plan und seine Bauten — was der Wald-Takt später bringt (Baum, Busch, Fels), richtet
        // der Stand selbst (`_bewohnerStandPruefen`): die Liste nach der Abwesenheit ist dieselbe Funktion
        // DER RAUM (Lehre 25: der billige Filter zuerst, nie über alle): jeder vergebene Stand und der Platz vor jeder Tür
        // liegt im Raster von `raumM` — wer frei fragt, liest die 3 × 3 Zellen um sich statt aller Stände der Stadt
        const raumZelle = (ix, iz) => ix * 2097152 + iz;
        const legen = (x, z) => {
            const k = raumZelle(Math.floor(x / BW.raumM), Math.floor(z / BW.raumM));
            const l = belegt.get(k);
            if (l) l.push(x, z);
            else belegt.set(k, [x, z]);
        };
        const frei = (x, z, amRand = true) => {
            const [ix, iz] = [Math.floor(x / BW.raumM), Math.floor(z / BW.raumM)];
            for (let i = -1; i <= 1; i++)
                for (let j = -1; j <= 1; j++)
                    for (let n = 0, l = belegt.get(raumZelle(ix + i, iz + j)) || []; n < l.length; n += 2)
                        if ((l[n] - x) ** 2 + (l[n + 1] - z) ** 2 < BW.raumM * BW.raumM) return false;
            if (amRand && amWeg(x, z)) return false;
            const g = this._imGrundriss(x, z, BW.saumM);
            const q = { x, z };
            return g !== "haus" && g !== "bau" && this._landAt(x, z, 0.2) && !this._bewohnerWand(q, q, true);
        };
        const nimm = (o) => {
            if (o) legen(o.x, o.z);
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
            // erst am Rand der Gassen (Platz, sein Rand, die Gassen an ihm), dann auch in ihnen
            for (const amRand of [true, false]) {
                for (let v = 0; v < 64; v++) {
                    const lx = (g.axis("px" + v) * 2 - 1) * pz.ex;
                    const lz = (g.axis("pz" + v) * 2 - 1) * pz.ez;
                    const x = mx + lx * pc + lz * ps;
                    const z = mz - lx * ps + lz * pc;
                    if (frei(x, z, amRand)) return nimm({ x, z, blick: zurMitte(x, z) });
                }
                for (let v = 0; v < 192; v++) {
                    const rand = 0.6 + ((v >> 5) / 5) * BW.platzRandM * 0.5;
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
                    if (frei(x, z, amRand)) return nimm({ x, z, blick: zurMitte(x, z) });
                }
                for (const rd of plan.roads || [])
                    for (let i = 1; i < (rd.pts || []).length; i++) {
                        const a = rd.pts[i - 1];
                        const e = rd.pts[i];
                        const l = Math.hypot(e.x - a.x, e.z - a.z);
                        if (!(l > 0.5)) continue;
                        const nx = -(e.z - a.z) / l;
                        const nz = (e.x - a.x) / l;
                        // das Stück fern vom Platz zieht keine Würfe (Lehre 25): sein Kasten im Raum des Platzes, um den Abstand
                        // der Seite gewachsen, liegt weiter als `platzRandM` vom Rechteck — kein Punkt auf ihm steht am Platz
                        const ecken = [a, e].map((q) => [S.ox + q.x - mx, S.oz + q.z - mz]);
                        const [kx, kz] = [0, 1].map((m) =>
                            ecken.map(([x, z]) => (m ? x * ps + z * pc : x * pc - z * ps))
                        );
                        const fernX = Math.max(0, Math.min(...kx) - pz.ex, -pz.ex - Math.max(...kx));
                        const fernZ = Math.max(0, Math.min(...kz) - pz.ez, -pz.ez - Math.max(...kz));
                        if (Math.hypot(fernX, fernZ) > BW.platzRandM + (rd.w || 3) / 2 + 0.81) continue;
                        for (let v = 0; v < 12; v++) {
                            const t = g.axis("gt" + i + ":" + v);
                            const sd = g.axis("gs" + i + ":" + v) < 0.5 ? -1 : 1;
                            const qx = S.ox + a.x + (e.x - a.x) * t;
                            const qz = S.oz + a.z + (e.z - a.z) * t;
                            const o = (rd.w || 3) / 2 + 0.8;
                            const x = qx + sd * nx * o;
                            const z = qz + sd * nz * o;
                            const lx = (x - mx) * pc - (z - mz) * ps;
                            const lz = (x - mx) * ps + (z - mz) * pc;
                            const rd0 = Math.hypot(
                                Math.max(0, Math.abs(lx) - pz.ex),
                                Math.max(0, Math.abs(lz) - pz.ez)
                            );
                            if (rd0 <= BW.platzRandM && frei(x, z, amRand))
                                return nimm({ x, z, blick: Math.atan2(-sd * nx, -sd * nz) });
                        }
                    }
            }
            return null;
        };
        // der Stand im Ring vor der Tür (`wort` trennt den Heim-Stand von der Station des Werks) — am Rand der Gasse; wo der Ring
        // das nicht trägt, in der Gasse und in weiteren Ringen
        const ringStand = (g, wort, tx, tz, ux, uz) => {
            for (const amRand of [true, false])
                for (let v = 0; v < (amRand ? 64 : 128); v++) {
                    const vor = 1.2 + (v >> 3) * 1.5 + g.axis(wort + "vor" + v) * 2;
                    const quer = (g.axis(wort + "quer" + v) * 2 - 1) * (2 + (v >> 3));
                    const x = tx + ux * vor - uz * quer;
                    const z = tz + uz * vor + ux * quer;
                    if (frei(x, z, amRand))
                        return nimm({ x, z, blick: Math.atan2(ux, uz) + (g.axis(wort + "dreh") - 0.5) * 1.6 });
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
        // DIE TÜREN der stehenden Häuser (die Tür, die Richtung aus dem Haus, die Rolle) — die Tür des Heims und die des Besuchs
        const tueren = [];
        for (const [si, sl] of plan.slots.entries()) {
            const wx = S.ox + sl.x;
            const wz = S.oz + sl.z;
            const haus = steht.get(`${sl.seed >>> 0}@${Math.round(wx)},${Math.round(wz)}`);
            if (!haus) continue; // kein Haus, keine Leute
            const c = Math.cos(sl.phi || 0);
            const s = Math.sin(sl.phi || 0);
            const tu = sl.tuer || { x: 0, z: 0 };
            const tx = wx + tu.x * c + tu.z * s;
            const tz = wz - tu.x * s + tu.z * c;
            const mx = sl.obb ? S.ox + sl.obb.cx : wx;
            const mz = sl.obb ? S.oz + sl.obb.cz : wz;
            const ul = Math.hypot(tx - mx, tz - mz) || 1;
            tueren.push({ si, sl, haus, tx, tz, ux: (tx - mx) / ul, uz: (tz - mz) / ul });
        }
        for (const T of tueren) legen(T.tx + T.ux * BW.vorM, T.tz + T.uz * BW.vorM);
        // DER BESUCH (koerper-core `tagesPlan`, mensch.K3 Staffel 2): ein Stand vor der Tür eines anderen Hauses, aus dem Samen
        // unter denen, die `besuchM` fern von seiner Tür und der Mitte des Platzes liegen und höchstens `besuchWeitM` fern von
        // ihnen und seinem Werk (der Plan hält ihn `besuchH` dort: der Gang hin trägt nur einen Teil davon, er kommt an und
        // steht), sonst vor der nächsten der fernen, sonst vor der fernsten — gewählt, wenn jeder seinen Stand vor der eigenen
        // Tür, am Platz und am Werk hat (der Besuch nimmt keinem den Platz). Bis mensch.K3 Staffel 2 galt keine Obergrenze: der
        // Markthändler #85460 der Stadt ging 127 m in der Stunde seines Besuchs und kam nie an.
        const mitte = pz ? { x: S.ox + pz.cx, z: S.oz + pz.cz } : null;
        const besuchStand = (g, T, W) => {
            const ab = (h, o) => (o ? Math.hypot(h.tx - o.x, h.tz - o.z) : NaN);
            const fern = (h) => Math.min(Math.hypot(h.tx - T.tx, h.tz - T.tz), mitte ? ab(h, mitte) : Infinity);
            const reich = (h) => Math.max(Math.hypot(h.tx - T.tx, h.tz - T.tz), ab(h, mitte) || 0, ab(h, W) || 0);
            const andere = tueren.filter((h) => h !== T).sort((a, b) => fern(b) - fern(a));
            const weit = andere.filter((h) => fern(h) >= BW.besuchM && reich(h) <= BW.besuchWeitM);
            const fernNah = andere
                .filter((h) => fern(h) >= BW.besuchM && !weit.includes(h))
                .sort((a, b) => reich(a) - reich(b));
            const k = weit.length ? g.int("besuch", 0, weit.length - 1) : 0;
            const rest = andere.filter((h) => fern(h) < BW.besuchM);
            for (const h of weit.slice(k).concat(weit.slice(0, k), fernNah, rest)) {
                const o = ringStand(g, "b", h.tx, h.tz, h.ux, h.uz);
                if (o) return o;
            }
            return null;
        };
        const liste = [];
        const besuche = [];
        for (const T of tueren) {
            yield;
            const { si, sl, haus, tx, tz, ux, uz } = T;
            const n = FC.leuteVon(sl.ov);
            if (!(n > 0)) continue;
            const rolle = typeof sl.rolle === "string" ? sl.rolle : "wohnhaus";
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
                    orte: { tuer, vor, heim, platz, werk, besuch: null },
                    gestalt: g.int("gestalt", 0, BW.gestalten - 1),
                    groesse: 0.96 + g.axis("groesse") * 0.08,
                    atem: g.axis("atem") * 10,
                    leib: null,
                    uhr: 0,
                    takt: 0,
                });
                besuche.push([g, T, werk]);
            }
        }
        for (const [i, b] of liste.entries()) {
            if (i % 8 === 7) yield;
            b.orte.besuch = besuchStand(...besuche[i]);
        }
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
        this._bewohnerStellen(b, g, b.x, b.z);
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
        g.userData._kzN = this._bewohnerFeldGrenze(); // die Feld-Grenze seiner Art (`_kzLeib` liest sie)
        this.state.scene.add(g);
        b.leib = g;
        if (G.satz === null) G.satz = this._bewohnerSatz(S, G, b);
    }

    // DIE FELD-GRENZE DER BEWOHNER (Gebot 7: die Kosten der Menge an den Schirm, nie an die Kopfzahl): der Satz der
    // Mengen-Stufe trägt einen Bewohner, solange sein Leib (`feldKoerperM` hoch) am Schirm mindestens `feldPx` Bildpunkte
    // deckt (`_schirm().pxJeM`: Zeichenpuffer und Sichtfeld) — jenseits tragen die Glieder-Kapseln im Feld die Gestalt
    // (`_kzLeib`; die Decke ist die Nah-Grenze jedes Leibs, KREATUR_NAH_MESH). Ein kleinerer Schirm schaltet früher.
    // EIN Objekt je Welt, je Takt neu gemessen; jeder Leib liest es (`_kzN`).
    _bewohnerFeldGrenze() {
        const N = this._bewohnerFeldN || (this._bewohnerFeldN = { ein: 0, aus: 0 });
        const K = AnazhRealm.KREATUR_NAH_MESH;
        const BW = AnazhRealm.BEWOHNER;
        const px = this._schirm().pxJeM;
        N.ein = px ? Math.min(K.ein, (BW.feldKoerperM * px) / BW.feldPx) : K.ein;
        N.aus = Math.min(K.aus, N.ein + BW.feldHystM);
        return N;
    }

    // DER STAND DES LEIBS an (x, z): auf dem Boden jedes Körpers (Q4: die Fels-Grenze, nie das Dach), an der Tür auf ihrer
    // Stufe (`_bewohnerTritt`) — die Sohle PLAYER_FOOT_OFFSET unter dem Ursprung (Lehre 22). Leser: die Geburt, die Ankunft.
    _bewohnerStellen(b, g, x, z) {
        const h0 = this._koerperBodenUnter(x, NaN, z);
        const h = Number.isFinite(h0) ? this._bewohnerTritt(x, z, h0, h0) : 0;
        g.position.set(x, h + AnazhRealm.PLAYER_FOOT_OFFSET * b.groesse, z);
        b.grundH = undefined; // der Grund des Schritts liest neu
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
    // Raum des Leibs (`_gangSatzPose`), und die Lage jedes Teils im Raum des Leibs (`_bewohnerLagePose`: der Gang des Felds).
    // Danach steht der Leib wieder im Stand.
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
        this._bewohnerLagePose(satz, k, g);
        if (k < satz.n) {
            this._animateHuman(g, 0, 0, false, false, null);
            this._leibMatrix(g);
        }
    }

    // DIE LAGEN DER ZEILE k (der Gang des Felds, Lehre 14): je Teil des Leibs (`_tierBaum.teile`, "" = die Hülle — die Anker der
    // Glieder, `_kreaturGliederBacken`) seine Welt-Matrix im Raum des Leibs, gestellt wie die Zeile k des Gang-Puffers; die
    // Größe trägt die Wurzel jedes Leibs (`_bewohnerFeldLage`).
    _bewohnerLagePose(satz, k, g) {
        const tb = g.userData._tierBaum;
        if (!satz.lageTeile) {
            satz.lageTeile = ["", ...Object.keys(tb.teile)];
            satz.lagen = new Float32Array((satz.n + 1) * satz.lageTeile.length * 16);
        }
        const inv = (this._bewohnerLageInv || (this._bewohnerLageInv = new THREE.Matrix4()))
            .copy(g.matrixWorld)
            .invert();
        const m = this._bewohnerLageM || (this._bewohnerLageM = new THREE.Matrix4());
        const K = satz.lageTeile.length;
        satz.lageTeile.forEach((nm, i) => {
            const a = nm ? tb.teile[nm] : tb.wrap || g;
            m.multiplyMatrices(inv, a.matrixWorld).toArray(satz.lagen, (k * K + i) * 16);
        });
    }

    // DER GANG IM FELD (mensch.K1, Lehre 14 und 25: der Takt kostet, was ihn betrifft): jenseits des Nah-Kreises trägt das Feld
    // den Leib, und seine Glieder gehen den EINEN gebackenen Gang seiner Gestalt — die Lagen der Zeilen (`_bewohnerLagePose`),
    // gemischt, wie der Knoten des Satzes mischt (`_gangSatzKnoten`: der Stand gegen die Phasen k0 und k1 nach dem Gewicht des
    // Gangs; ungebacken der Stand), auf der Wurzel des Leibs. Ein Leib ohne Glieder (die Liste des Felds erschöpft) zeichnet
    // nirgends und kostet nichts, eine Gestalt ohne Satz brach laut an ihm (`_bewohnerSatz`). Jedes Glied trägt den Namen
    // seines Ankers (`_kreaturGliederBacken`): bis treffer-kalt las die Lage dafür die Gattung und hielt still an, war sie kalt.
    // Bis stadt-takt-z15d ging je Schritt das Rig (`_animateHuman`) und die Welt-Matrix des ganzen Leibs (`_leibMatrix`) — am
    // Messort stadt mittags (165 Gehende) `_bewohnerGangSchritt` 108,7 → 25,6 ms je Sekunde (Radeon); die Lage der Glieder
    // weicht vom Rig höchstens 3,7 cm ab (der Atem, das Tempo des Back-Leibs).
    _bewohnerFeldLage(b, S) {
        const g = b.leib;
        const gl = g.userData._kzGlieder;
        const Z = S.gestalten[b.gestalt].satz;
        if (!gl || !Z) return;
        if (Z.lageVon === undefined) {
            Z.lageVon = gl.map((x) => Z.lageTeile.indexOf(x.name));
            if (Z.lageVon.some((i) => i < 0)) {
                Z.lageVon = false;
                this._bruchMelden(`BEWOHNER: ein Glied ohne Lage im Gang der Gestalt („${S.plan.name || "?"}")`);
            }
        }
        if (!Z.lageVon) return;
        const K = Z.lageTeile.length;
        const L = Z.lagen;
        const w = Z.fertig ? b._gaitW || 0 : 0;
        const ph = Z.fertig ? (b.walkPhase || 0) / (2 * Math.PI) : 0;
        const f = (ph - Math.floor(ph)) * Z.n;
        const k0 = Math.min(Z.n - 1, Math.floor(f));
        const k1 = (k0 + 1) % Z.n;
        const t = f - k0;
        const R = (this._bewohnerFeldR || (this._bewohnerFeldR = new THREE.Matrix4())).compose(
            g.position,
            g.quaternion,
            g.scale
        );
        const M = this._bewohnerFeldM || (this._bewohnerFeldM = new THREE.Matrix4());
        const W = this._bewohnerFeldW || (this._bewohnerFeldW = new THREE.Matrix4());
        const E = M.elements;
        const an = this.state.creaturesHidden !== true;
        for (let i = 0; i < gl.length; i++) {
            const j = Z.lageVon[i];
            const s = (Z.n * K + j) * 16;
            const a0 = (k0 * K + j) * 16;
            const a1 = (k1 * K + j) * 16;
            for (let e = 0; e < 16; e++) {
                const q = L[a0 + e] + (L[a1 + e] - L[a0 + e]) * t;
                E[e] = L[s + e] + (q - L[s + e]) * w;
            }
            this._weltFeldMatrix(gl[i].handle, W.multiplyMatrices(R, M));
            this._weltFeldAktiv(gl[i].handle, an);
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
    // (`_bewohnerSchritt`) auf der Raten-Leiter (`_creatureAnimDiv`), wer drinnen ist, zeichnet nirgends. Wer keinem Zuschauer
    // ging — geboren nach der Abwesenheit, nach einem Sprung der Uhr um `sprungH` —, steht, wo sein Tag ihn sieht
    // (`_bewohnerAnkunft`, je Takt höchstens `ankunftJeTakt`).
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
        let ankuenfte = 0;
        const NF = this._bewohnerFeldGrenze();
        for (const S of alle.values()) {
            const d2 = (S.ox - p.x) ** 2 + (S.oz - p.z) ** 2;
            if (d2 > (A.nearM * BW.fernFaktor) ** 2) {
                if (S.liste || S.listeWerk) this._bewohnerFort(S);
                continue;
            }
            if (!S.liste) {
                if (d2 > A.nearM * A.nearM) continue;
                const q = this._autoSettlementQueue;
                if (q && q.cellKey === S.key) continue; // die Häuser wachsen noch
                if (!S.listeWerk) S.listeWerk = this._bewohnerListe(S);
                let w = null;
                for (let k = 0; k <= BW.haeuserJeTakt && !(w && w.done); k++) w = S.listeWerk.next();
                if (!w.done) continue;
                S.listeWerk = null;
                S.gestalten = this._bewohnerGestalten(S);
                S.liste = w.value;
                S.planStunde = null;
                S.uhrStunde = stunde;
                this._bewohnerWacheSetzen(S);
                this._bewohnerStandPruefen(S, null); // was der Wald-Takt schon brachte
            }
            // DIE WACHE (mensch.K3): wechselt eine Hülle im Rechteck der Wege, prüft jeder Gehende den Rest seines Wegs
            if (S.wache.stand !== S.wegeStand) {
                const trifft = this._bewohnerWechsel(S, S.wegeStand);
                S.wegeStand = S.wache.stand;
                this._bewohnerStandPruefen(S, trifft);
                this._bewohnerWegPruefen(S, trifft);
            }
            let anders = false; // eine Wahl wechselt: der Satz neu (`_bewohnerSatzSchreiben`); sonst rücken die Bewegten
            const bewegt = this._bewohnerBewegt || (this._bewohnerBewegt = []);
            bewegt.length = 0;
            // DER SPRUNG DER UHR (mensch.K2): springt sie um sprungH oder mehr (das Wort des Spielers), stellt sich jeder Leib
            // dorthin, wo sein Tag ihn jetzt sieht (`_bewohnerAnkunft`)
            const dU = Math.abs(stunde - S.uhrStunde);
            S.uhrStunde = stunde;
            if (Math.min(dU, 24 - dU) >= BW.sprungH) for (const b of S.liste) if (b.leib) b.ankunft = true;
            const dS = S.planStunde == null ? 12 : Math.abs(stunde - S.planStunde);
            if (Math.min(dS, 24 - dS) >= BW.planH) {
                S.planStunde = stunde;
                for (const b of S.liste) if (this._bewohnerZiel(b, stunde, true)) anders = true;
            }
            this._bewohnerVorlagen(S, p);
            if (this._bewohnerGangBacken(S, BW.gangJeTakt)) anders = true;
            // DAS RASTER DER LEIBER (mensch.K3, `_bewohnerAusweichen`): wer draußen steht oder geht, je Zelle von `rasterM`;
            // wer steht, steht still (sein Tempo 0)
            const R = S.raster || (S.raster = new Map());
            for (const l of R.values()) l.length = 0;
            for (const b of S.liste) {
                if (!b.leib || b.drinnen) continue;
                if (!b.weg) b.vx = b.vz = 0;
                const k =
                    Math.floor(b.leib.position.x / BW.rasterM) * 2097152 + Math.floor(b.leib.position.z / BW.rasterM);
                const l = R.get(k);
                if (l) l.push(b);
                else R.set(k, [b]);
            }
            const nah = this._bewohnerNah || (this._bewohnerNah = []);
            nah.length = 0;
            for (const b of S.liste) {
                if (!b.leib) {
                    if (b.leib === false || geburten >= BW.geburtenJeTakt) continue;
                    const G = S.gestalten[b.gestalt];
                    if (!memo || G.keys.some((k) => !memo.has(k))) continue;
                    // geboren wird am Ort seines Plans (drinnen an seiner Tür, ungezeichnet) — und dort steht er, wo die Uhr
                    // ihn sieht: die Ankunft geht den Tag nach, den keiner sah
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
                    b.ankunft = true;
                }
                const g = b.leib;
                const u = g.userData;
                if (b.ankunft && ankuenfte < BW.ankunftJeTakt) {
                    b.ankunft = false;
                    ankuenfte++;
                    this._bewohnerAnkunft(S, b, stunde, echt, p);
                    b.lageNeu = true;
                    anders = true;
                }
                const bd2 = (b.d2 = (g.position.x - p.x) ** 2 + (g.position.z - p.z) ** 2);
                // DIE TÜR (mensch.K3 Staffel 2): wer hinaus soll (`_bewohnerZiel`), tritt aus ihr, wenn keiner in ihr und vor
                // ihr steht — bis dahin wartet er drinnen
                if (
                    b.hinaus &&
                    this._bewohnerNaechster(S, b, b.orte.tuer.x, b.orte.tuer.z) >= BW.tuerFreiM &&
                    this._bewohnerNaechster(S, b, b.orte.vor.x, b.orte.vor.z) >= BW.tuerFreiM
                ) {
                    b.hinaus = false;
                    b.drinnen = false;
                    u._drinnen = false;
                    anders = true;
                    b.vx = b.vz = 0;
                    this._bewohnerStellen(b, g, b.orte.tuer.x, b.orte.tuer.z); // er tritt aus der Tür, wo er auch hineinging
                    const k = Math.floor(g.position.x / BW.rasterM) * 2097152 + Math.floor(g.position.z / BW.rasterM);
                    if (R.get(k)) R.get(k).push(b);
                    else R.set(k, [b]); // die anderen sehen ihn ab diesem Takt
                }
                // wer Platz machte, geht zurück, wenn sein Stand frei ist und der, dem er ihn machte (`platz`,
                // `_bewohnerPlatz`), nicht mehr auf ihn zugeht — bis hier ging er, sobald sein Stand frei war: wer auf ihn
                // wartete (`_bewohnerAusweichen`), fand ihn um 21,71 Uhr Takt für Takt wieder dort (wohnhaus #809070, 10
                // Spielminuten 0 m)
                const w = b.platz;
                if (
                    w &&
                    b.da &&
                    !b.weg &&
                    this._bewohnerNaechster(S, b, b.ziel.x, b.ziel.z) >= BW.tuerFreiM &&
                    !(
                        w.weg &&
                        w.leib &&
                        !w.drinnen &&
                        w.wi < w.weg.length &&
                        this._streckeBoxAbstand2(
                            { minX: b.ziel.x, maxX: b.ziel.x, minZ: b.ziel.z, maxZ: b.ziel.z },
                            w.leib.position.x,
                            w.leib.position.z,
                            w.weg[w.wi].x,
                            w.weg[w.wi].z
                        ) <
                            (2 * AnazhRealm.PLAYER_WALL_RADIUS + 0.11) ** 2
                    )
                )
                    [b.platz, b.da] = [false, false];
                // DER GANG: ein neues Ziel sucht seinen Weg (gedeckelt je Takt), der Weg trägt den Leib im Tempo des Gesetzes
                if (!b.da && !b.weg && !b.hinaus && wege < BW.wegeJeTakt) {
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
                        if (this._bewohnerGehen(S, b, dt)) {
                            bewegt.push(b);
                            b.lageNeu = true;
                        }
                        if (b.drinnen) anders = true;
                        // jenseits der Nah-Wahl geht der Leib dasselbe Gang-Gesetz (Phase und Gewicht — der Satz liest sie,
                        // `_bewohnerSatzSchreiben`); fern trägt das Feld die Gestalt: die Glieder gehen den Gang mit
                        if (!b.nah) this._bewohnerGangSchritt(b, b.weg ? b.tempoJetzt : 0, dt, echt, S);
                    }
                }
                // der Glieder-Satz fragt nur, wer seine Seite wechseln kann oder noch keinen Satz trägt — die Knochen eines
                // stehenden Leibs ruhen, seine Glieder stehen nach dem ersten Schreiben (Lehre 25: der Takt kostet, was ihn betrifft)
                const N = NF;
                if (
                    echt &&
                    !b.drinnen &&
                    (u._kzNah === undefined ||
                        !u._kzVersuch ||
                        (u._kzNah === true ? bd2 >= N.aus * N.aus : bd2 < N.ein * N.ein))
                ) {
                    // wer aus dem Feld in den Nah-Kreis tritt, nimmt seine Pose mit: im Feld ging sein Rig nicht
                    // (`_bewohnerFeldLage`), die schwindenden Glieder folgen ab hier seinen Knochen
                    if (u._kzGlieder && this._kzBesitztFeld(g)) {
                        this._animateHuman(g, b.uhr + b.atem, b.walkPhase || 0, !!b.weg, false, null, b._gait);
                        this._leibMatrix(g);
                    }
                    this._kzLeib(g, p, true); // die Glieder backen vorab: wer hinausgeht, trägt sein Feld ab dem ersten Schritt
                    if (this._kzBesitztFeld(g)) this._bewohnerFeldLage(b, S); // wer ins Feld tritt, geht dort seinen Gang
                }
                // DER NAH-KREIS: wer draußen keinem Feld gehört (`_kzBesitztFeld` — diesseits der Nah-Grenze, ohne Bild und
                // fern, bis der Bake-Takt seine Glieder backt: bis dahin trägt der Körper), steht darin: der Satz, die Nächsten
                // leben (`nahM`); wer drinnen ist, steht in keinem Kreis
                const kreis = !b.drinnen && !(echt && this._kzBesitztFeld(g));
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
                if (b.drehen != null && this._bewohnerDrehen(b, delta, echt, S)) {
                    bewegt.push(b);
                    b.lageNeu = true;
                }
                // jenseits der Nah-Wahl klingt der Gang im Stand aus (das Gewicht des EINEN Gang-Tick)
                if (!istNah && !b.weg && b._gaitW > 0) {
                    this._bewohnerGangSchritt(b, 0, delta, echt, S);
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
                        const gang = this._gaitTick(g, b, geht ? (b.tempoJetzt ?? b.tempo) : 0, dtA, null);
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
    // Fuß-Ziel) — der Satz liest Phase und Gewicht; trägt das Feld den Leib (jenseits des Nah-Kreises), gehen seine Glieder
    // denselben gebackenen Gang (`_bewohnerFeldLage`). Steht er, klingt das Gewicht aus und fällt unter 1 % auf 0. Gebacken ist
    // der Doppelschritt seines Tempos (`_bewohnerSatz`): die Phase geht den Weg, den er geht (der Tick seines Tempos über die
    // Zeit, die sein Weg ihm trüge) — wer eilt oder ausweicht, tritt schneller oder langsamer, nie gleitet sein Fuß. Bis hier
    // lief sie im Takt des gehenden Tempos über den Schritt des gebackenen: der Satz glitt um 0,034, wer eilte, um 0,045.
    _bewohnerGangSchritt(b, v, dt, echt, S) {
        const g = b.leib;
        if (v > 0) this._gaitTick(g, b, b.tempo, (dt * v) / b.tempo, null);
        else this._gaitTick(g, b, 0, dt, null);
        if (v === 0 && !(b._gaitW > 0.01)) b._gaitW = 0;
        if (echt && !b.drinnen && this._kzBesitztFeld(g)) this._bewohnerFeldLage(b, S);
    }

    // DER BLICK AM ZIEL (mensch.K2 Staffel 2): wer an seinem Ort steht, schaut auf sein Ziel — am Platz zur Mitte, vor der Tür in
    // die Gasse, am Rand der Gasse auf das Gegenüber (`blick` des Stands, `_bewohnerListe`); er wendet sich mit der Wendegrenze
    // des Steuer-Gesetzes, wie er im Gehen dreht. Liefert, ob sich die Lage änderte.
    _bewohnerDrehen(b, dt, echt, S) {
        const g = b.leib;
        const TC = globalThis.__tetrapodaCore;
        const om = TC.STEUER_GESETZ.wende * Math.sqrt(TC.GANG_GESETZ.g / b.beinL) * dt;
        let dw = b.drehen - g.rotation.y;
        dw -= Math.PI * 2 * Math.round(dw / (Math.PI * 2));
        if (Math.abs(dw) <= om) {
            g.rotation.y += dw;
            b.drehen = null;
        } else g.rotation.y += Math.sign(dw) * om;
        if (echt && !b.nah && !b.drinnen && this._kzBesitztFeld(g)) this._bewohnerFeldLage(b, S);
        return true;
    }

    // DAS SOLL DER STUNDE (mensch.K2): der Plan des Gesetzes (koerper-core `tagesPlan`) aus dem Samen, der Rolle seines
    // Hauses und seinen Orten — drinnen ist das Ziel die Tür. Liefert { ziel, drinnen, akt }. Leser: das Ziel
    // (`_bewohnerZiel`), die Wende (`_bewohnerWende`).
    _bewohnerSoll(b, stunde) {
        const KC = window.__koerperCore;
        if (!KC || typeof KC.tagesPlan !== "function") return AnazhRealm._kernPflichtBruch("koerper:tagesPlan");
        const o = b.orte;
        const soll = KC.tagesPlan(b.same, b.rolle, o.heim, o.werk, stunde, o.platz, o.besuch);
        return { ziel: soll.drinnen ? o.tuer : soll.ort, drinnen: soll.drinnen, akt: soll.akt };
    }

    // DAS ZIEL DER STUNDE (mensch.K2): das Soll (`_bewohnerSoll`). Ein neues Ziel verwirft den alten Weg; wer drinnen war und
    // hinaus soll, tritt aus der Tür (wieder gezeichnet) — im Takt (`tuer`) erst, wenn sie frei ist (`hinaus`, `_tickBewohner`).
    // Liefert, ob sich das Bild ändert.
    _bewohnerZiel(b, stunde, tuer = false) {
        const soll = this._bewohnerSoll(b, stunde);
        const ziel = soll.ziel;
        b.akt = soll.akt;
        if (ziel === b.ziel) return false;
        // DIE LAGE DES TAGS (mensch.K2 Staffel 2: sein Tag ist f(Same, t)): der neue Weg beginnt, wo ihn die Ankunft begänne
        // (`_bewohnerAnkunft`, derselbe Weg ohne Zuschauer) — an der Wende `w` (der Takt bemerkt sie bis planH später) so weit
        // längs des Wegs seines Tags (`b.tag`, `_bewohnerWeg`), wie sein Tempo ihn seit dessen Wende trüge; trug es ihn ans
        // Ziel, oder stand er dort (auch beiseite, `_bewohnerPlatz`), von seinem Stand — beides nur, wo er in gerader Linie frei
        // hingeht (`_bewohnerWand`); sonst (er wartet in der Tür, blieb ohne Weg) geht er von hier. Bis mensch.K3 Staffel 2
        // begann er, wo er nach dem Ausweichen stand: 3,9 m daneben fand die Strecke einen um 3,85 m kürzeren Weg, und wer
        // nach 1 h kam, fand ihn 4,2 m fort.
        const g = b.leib;
        const w = tuer ? (this._bewohnerWende(b, stunde - 2 * AnazhRealm.BEWOHNER.planH, stunde) ?? stunde) : stunde;
        let ende = b.da && b.ziel;
        b.tagVon = null;
        if (b.weg && b.tag) {
            const p = b.tag.pts;
            let L = ((((w - b.tag.ab) % 24) + 24) % 24) * this._bewohnerStundeSek() * b.tempo;
            for (let i = 1; i < p.length && !b.tagVon; i++) {
                const [dx, dz] = [p[i].x - p[i - 1].x, p[i].z - p[i - 1].z];
                const d = Math.hypot(dx, dz);
                if (L < d) b.tagVon = { x: p[i - 1].x + (dx * L) / d, z: p[i - 1].z + (dz * L) / d };
                else L -= d;
            }
            ende = !b.tagVon;
        }
        const D = b.tagVon || (ende ? b.ziel : null);
        const X = g && { x: g.position.x, z: g.position.z };
        const nah = D && X && (Math.hypot(X.x - D.x, X.z - D.z) < 0.5 || !this._bewohnerWand(X, D));
        if (!nah) b.tagVon = null;
        b.stand = nah && !b.tagVon ? b.ziel : null;
        b.tagAb = w;
        b.ziel = ziel;
        b.drehen = null;
        b.drinnenSoll = soll.drinnen;
        b.da = false;
        b.weg = null;
        b.wegRest = null;
        b.hinaus = tuer && b.drinnen && !soll.drinnen;
        b.platz = false;
        if (tuer) [b.zielUhr, b.gegangen] = [b.uhr - (stunde - w) * this._bewohnerStundeSek(), 0];
        if (b.drinnen && !soll.drinnen && !b.hinaus) {
            b.drinnen = false;
            if (b.leib) b.leib.userData._drinnen = false;
            return true;
        }
        return false;
    }

    // DIE ANKUNFT (mensch.K2 Staffel 2: wer nach der Abwesenheit kommt, findet jeden, wo er ihn gesehen hätte): der Tag ist
    // f(Same, t), auch für den, den keiner sah — die Liste entsteht nach der Abwesenheit neu, die Uhr sprang. Der Leib steht am
    // Ziel der Stunde vor `ankunftH` Stunden und spielt die Wenden seines Solls bis jetzt nach (`_bewohnerWende`): je Wende
    // das Ziel (`_bewohnerZiel`), der Weg (`_bewohnerWeg`) und so viele Sekunden des Gangs (`_bewohnerSchritt`), wie die Uhr
    // bis zur nächsten Wende trägt (`_bewohnerStundeSek`) — derselbe Gang wie im Takt, nur ohne Zuschauer. Wer ankam, schaut
    // auf sein Ziel; drinnen gehört er keinem Feld, draußen trägt ihn sein Feld (`_kzLeib`).
    _bewohnerAnkunft(S, b, stunde, echt, p) {
        const BW = AnazhRealm.BEWOHNER;
        const g = b.leib;
        const sek = this._bewohnerStundeSek();
        let h = stunde - BW.ankunftH;
        const s0 = this._bewohnerSoll(b, h);
        this._bewohnerStellen(b, g, s0.ziel.x, s0.ziel.z);
        if (Number.isFinite(s0.ziel.blick)) g.rotation.y = s0.ziel.blick;
        Object.assign(b, { ziel: s0.ziel, akt: s0.akt, drinnenSoll: s0.drinnen, drinnen: s0.drinnen, da: true });
        Object.assign(b, { weg: null, wegRest: 0, stand: null, drehen: null, gehDt: 0 });
        for (let n = 0; n < BW.ankunftWenden && h < stunde; n++) {
            const w = this._bewohnerWende(b, h, stunde);
            if (b.weg) this._bewohnerSchritt(b, ((w === null ? stunde : w) - h) * sek);
            if (w === null) break;
            h = w;
            this._bewohnerZiel(b, h);
            if (!b.da && !b.weg) this._bewohnerWeg(S, b);
        }
        if (b.drehen != null) {
            g.rotation.y = b.drehen;
            b.drehen = null;
        }
        b.zielUhr = NaN; // er steht, wo sein Tag ihn jetzt sieht: nichts aufzuholen
        // die Stufe am Ende neu (der Schritt fragt die Stufe ab der Höhe seines letzten Stands — nach einem Weg ohne
        // Zwischenschritte läge die Frage am Hang unter oder über ihr)
        this._bewohnerStellen(b, g, g.position.x, g.position.z);
        g.userData._drinnen = b.drinnen;
        this._leibMatrix(g);
        if (g.userData._kzGlieder) for (const gl of g.userData._kzGlieder) this._weltFeldAktiv(gl.handle, false);
        if (echt && !b.drinnen) this._kzLeib(g, p, true);
        if (echt && !b.drinnen && this._kzBesitztFeld(g)) this._bewohnerFeldLage(b, S);
    }

    // DIE NÄCHSTE WENDE des Solls in (von, bis]: die erste Stunde, an der `_bewohnerSoll` ein anderes Ziel nennt — gerastert
    // auf `wendeH`, dann halbiert bis 1e-9 h: jede Suche trifft dieselbe Wende, gleich ab wo (der Takt und die Ankunft
    // beginnen dort den Weg, `_bewohnerZiel`). null, wenn keine.
    _bewohnerWende(b, von, bis) {
        const z0 = this._bewohnerSoll(b, von).ziel;
        for (let lo = von; lo < bis; lo += AnazhRealm.BEWOHNER.wendeH) {
            let hi = Math.min(bis, lo + AnazhRealm.BEWOHNER.wendeH);
            if (this._bewohnerSoll(b, hi).ziel === z0) continue;
            while (hi - lo > 1e-9) {
                const m = (lo + hi) / 2;
                if (this._bewohnerSoll(b, m).ziel === z0) lo = m;
                else hi = m;
            }
            return hi;
        }
        return null;
    }

    // DIE SEKUNDEN EINER SPIELSTUNDE: der Tag des Spielers (`dayLengthMinutes`, Echtzeit je Zyklus) — der Gang der Uhr
    // (`tickDayNight`) rückt sie um delta / (Minuten · 60) Tage je Takt.
    _bewohnerStundeSek() {
        return ((this.state.dayLengthMinutes || AnazhRealm.DAY_LENGTH_DEFAULT_MINUTES) * 60) / 24;
    }

    // DER WEG (mensch.K2, „nie durch Hauswände"): vom Stand des Leibs zum Ziel — die Tür liegt in der Wand: wer aus ihr tritt
    // oder in sie geht, geht über den Punkt vor ihr (`orte.vor`, `BEWOHNER.vorM`); dazwischen die Strecke
    // (`_bewohnerStrecke`). Jeder geht
    // in seiner Spur (`spurM` quer zum Weg, aus dem Samen — die Menge geht nebeneinander, nicht durcheinander).
    _bewohnerWeg(S, b) {
        const g = b.leib;
        const o = b.orte;
        // er geht von seinem Stand (ein Ort seines Tags: Anschluss und freie Linien gemerkt) oder, mitten im Weg, von der Lage
        // seines Tags (`_bewohnerZiel`), sonst von hier — wer noch in seiner Tür steht (näher als `vorM`), geht aus ihr über
        // den Punkt vor ihr
        const lage = b.tagVon || g.position;
        const nahTuer = Math.hypot(lage.x - o.tuer.x, lage.z - o.tuer.z) < AnazhRealm.BEWOHNER.vorM;
        const von = b.stand || (nahTuer ? o.tuer : { x: lage.x, z: lage.z });
        b.tagVon = null;
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
        if (von === b.stand && Math.hypot(g.position.x - von.x, g.position.z - von.z) > 1e-3) pts.unshift(von); // vom Stand
        if (e !== ziel) pts.push(ziel);
        if (!pts.length) pts.push(ziel);
        // je Punkt der Rest-Weg bis zum Ziel (die Linse liest, dass er schrumpft)
        const rest = new Float64Array(pts.length);
        for (let i = pts.length - 2; i >= 0; i--)
            rest[i] = rest[i + 1] + Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].z - pts[i].z);
        b.weg = pts;
        b.wegRestAb = rest;
        b.wi = 0;
        // der Weg seines Tags ab seinem Anfang und die Stunde seiner Wende (`_bewohnerZiel` liest ihn an der nächsten Wende);
        // wer neben dem Anfang steht, geht auf das erste Bein zurück (`_bewohnerLinie`), sein Vorsprung zählt als gegangen
        b.tag = { pts: [von].concat(pts), ab: b.tagAb };
        b.linie = von;
        const h = Math.hypot(pts[0].x - g.position.x, pts[0].z - g.position.z);
        b.wegRest = h + rest[0];
        b.gegangen = (b.gegangen || 0) + Math.hypot(pts[0].x - von.x, pts[0].z - von.z) - h;
    }

    // DIE GERADE (mensch.K3): frei in gerader Linie (`_bewohnerWand`) → [ziel]; schneidet EIN Bau sie, geht er um ihn — über
    // den Seitenpunkt neben seinen Boxen (die Kapsel und die Spur, `spurM`, Abstand), links oder rechts der Linie, den
    // kürzeren, dessen beide Beine frei sind: die Laterne an der Gasse, der Baum am Platz kosten einen Schritt zur Seite, nie
    // den Weg über das Netz (Steintal auf der Trasse: 22 m gerade, über das Netz ≥ 45 m — der Gang heim riss an der Wende zur
    // Arbeit). null: es trägt das Netz.
    _bewohnerGerade(von, ziel) {
        const wand = this._bewohnerWand(von, ziel);
        if (!wand) return [ziel];
        const l = Math.hypot(ziel.x - von.x, ziel.z - von.z);
        const [dx, dz] = [(ziel.x - von.x) / l, (ziel.z - von.z) / l];
        const m = AnazhRealm.PLAYER_WALL_RADIUS + AnazhRealm.BEWOHNER.spurM;
        let [lo, hi, t, n] = [Infinity, -Infinity, 0, 0];
        for (const b of wand.blockerAABBs)
            for (const [x, z] of [
                [b.minX, b.minZ],
                [b.maxX, b.minZ],
                [b.minX, b.maxZ],
                [b.maxX, b.maxZ],
            ]) {
                const s = (z - von.z) * dx - (x - von.x) * dz;
                [lo, hi, t, n] = [Math.min(lo, s), Math.max(hi, s), t + (x - von.x) * dx + (z - von.z) * dz, n + 1];
            }
        t = Math.max(0, Math.min(l, t / n));
        let best = null;
        for (const s of [hi + m, lo - m]) {
            const p = { x: von.x + dx * t - dz * s, z: von.z + dz * t + dx * s };
            const lp = Math.hypot(p.x - von.x, p.z - von.z) + Math.hypot(ziel.x - p.x, ziel.z - p.z);
            if (!(best && best.l <= lp) && !this._bewohnerWand(von, p) && !this._bewohnerWand(p, ziel))
                best = { l: lp, p };
        }
        return best ? [best.p, ziel] : null;
    }

    // DIE STRECKE zwischen zwei Orten: frei in gerader Linie oder um die EINE Wand, die sie schneidet (`_bewohnerGerade`, bis
    // `direktM`; je Ort gemerkt), sonst über
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
            von._knoten = von._ausweg = undefined;
        }
        let direkt = von._direkt ? von._direkt.get(ziel) : undefined;
        if (direkt === undefined) {
            direkt =
                Math.hypot(ziel.x - von.x, ziel.z - von.z) < AnazhRealm.BEWOHNER.direktM
                    ? this._bewohnerGerade(von, ziel)
                    : null;
            (von._direkt || (von._direkt = new Map())).set(ziel, direkt);
        }
        if (direkt) return direkt.slice();
        const N = this._bewohnerNetz(S);
        if (ziel._wegeStand !== stand) {
            ziel._wegeStand = stand;
            ziel._direkt = null;
            ziel._knoten = ziel._ausweg = undefined;
        }
        // DER AUSWEG (mensch.K3 Staffel 2): erreicht ein Ort keinen Knoten frei (der Baum, der Fels des Wald-Takts kam nach der
        // Liste), geht der Weg über den nächsten freien Punkt bei ihm, der einen erreicht (`_bewohnerAusweg`)
        let a = this._bewohnerAnschluss(N, von);
        let e = this._bewohnerAnschluss(N, ziel);
        const ausA = a < 0 ? this._bewohnerAusweg(N, von, !!this._bewohnerWand(von, von)) : null;
        const ausE = e < 0 ? this._bewohnerAusweg(N, ziel) : null;
        if (ausA) a = ausA._knoten;
        if (ausE) e = ausE._knoten;
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
        if (ausA) pts.unshift(ausA);
        if (ausE) pts.push(ausE);
        pts.push(ziel);
        if (spur)
            for (let i = 0, p = von; i < pts.length; p = pts[i++])
                if (this._bewohnerWand(p, pts[i])) return this._bewohnerStrecke(S, von, ziel, 0);
        return pts;
    }

    // DER SCHRITT: der Leib geht `tempo · dt` Meter längs seines Wegs — oder mit dem Tempo des Ausweichens (`lenk`,
    // `_bewohnerGehen`; nah am nächsten Punkt gilt der Punkt als erreicht) —, steht auf dem Boden jedes Körpers
    // (`_koerperBodenUnter`, die Sohle PLAYER_FOOT_OFFSET unter dem Ursprung), wendet sich mit der Wendegrenze des
    // Steuer-Gesetzes zum Gang; am Ziel steht er (`da`), drinnen geht er ins Haus. Liefert, ob sich die Lage änderte.
    _bewohnerSchritt(b, dt, lenk = null) {
        const g = b.leib;
        const pts = b.weg;
        let x = g.position.x;
        let z = g.position.z;
        let rest = lenk ? 0 : b.tempo * dt;
        let rx = 0;
        let rz = 0;
        if (lenk && (lenk.vx || lenk.vz)) {
            const l = Math.hypot(lenk.vx, lenk.vz);
            [x, z, rx, rz] = [x + lenk.vx * dt, z + lenk.vz * dt, lenk.vx / l, lenk.vz / l];
            // der Punkt gilt als erreicht, wenn das Bein von hier zum nächsten frei ist (sonst, und am Ende seines Wegs, geht er
            // ihn genau)
            const [n, d] = [pts[b.wi + 1], Math.hypot(pts[b.wi].x - x, pts[b.wi].z - z)];
            if (d <= Math.max(0.3, l * dt) && (n ? !this._bewohnerWand({ x, z }, n) : d < 1e-6))
                this._bewohnerErreicht(b);
        }
        while (rest > 0 && b.wi < pts.length) {
            const q = pts[b.wi];
            const e = this._bewohnerLinie(b, x, z); // wer neben seinem Bein geht, geht auf es zurück
            const dx = e.x - x;
            const dz = e.z - z;
            const d = Math.hypot(dx, dz);
            if (d > 1e-6) {
                rx = dx / d;
                rz = dz / d;
            }
            if (d <= rest && e === q) {
                x = q.x;
                z = q.z;
                rest -= d;
                this._bewohnerErreicht(b);
            } else {
                x += rx * Math.min(rest, d);
                z += rz * Math.min(rest, d);
                rest = 0;
            }
        }
        // DER GRUND DES SCHRITTS (Lehre 22: Körper stehen auf dem Gesetz): der Boden unter dem Körper (`_koerperBodenUnter`, ab
        // seiner Sohle — nie das Dach der Höhle; der Feld-Scan endet bis `BEWOHNER.sohleM` unter der Kante), je halben Meter
        // neu und je Schritt, wo eine Box des Blocker-Netzes in seine Reichweite kommt — dort urteilt die Wand an seiner Sohle;
        // die Stufe darauf trägt `_bewohnerTritt`. Bis mensch.K3 Staffel 2 trug auch dort der Grund des letzten halben Meters:
        // am Hang neben dem Sockel der Laterne #15942 stand der Gehende tiefer, als seine Wand ihn fragte.
        const fuss = AnazhRealm.PLAYER_FOOT_OFFSET * b.groesse;
        const sohle = g.position.y - fuss;
        const kand = this._bewohnerWandKand || (this._bewohnerWandKand = []);
        kand.length = 0;
        this._blockerNahe(x, z, AnazhRealm.PLAYER_WALL_RADIUS + 0.25, 0, kand);
        if (kand.length || !(b.grundH !== undefined && (x - b.grundX) ** 2 + (z - b.grundZ) ** 2 < 0.25)) {
            const h = this._koerperBodenUnter(x, sohle, z);
            [b.grundX, b.grundZ, b.grundH] = [x, z, Number.isFinite(h) ? h : sohle];
        }
        g.position.set(x, this._bewohnerTritt(x, z, sohle, b.grundH) + fuss, z);
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

    // DER ERREICHTE PUNKT (mensch.K3 Staffel 2: das Ausweichen ist ein Versatz zur Lage des Tags, der zurückkehrt, nie eine
    // neue Linie): der nächste Punkt des Wegs zählt; ein Punkt des Tags beginnt das Bein (`linie`), der Umweg-Punkt neben
    // einem Stehenden (`_um`, `_bewohnerUm`) nie — nach ihm geht er auf das Bein seines Tags zurück.
    _bewohnerErreicht(b) {
        const q = b.weg[b.wi++];
        if (!q._um) b.linie = q;
    }

    // DIE LINIE (mensch.K2 Staffel 2: sein Tag ist f(Same, t)): wer neben seinem Bein geht (er wich aus), geht nicht schräg zum
    // nächsten Punkt, sondern auf das Bein zurück — auf den Punkt `linieM` voraus auf ihm (vom Anfang des Beins `linie`, ab
    // `_bewohnerWeg`); so steht er, wo ihn die Ankunft sähe. Schneidet der Weg zurück eine Wand (`_bewohnerWand`: das Bein
    // hielt Abstand, der Schräge daneben nicht — der Mast der Laterne #23861, der Tisch des Marktstands), geht er quer auf das
    // Bein (sein Fußpunkt), sonst an seinen Anfang, sonst zum nächsten Punkt. Liefert den Punkt, auf den er geht (auf dem
    // Bein: den nächsten).
    _bewohnerLinie(b, x, z) {
        const [a, q] = [b.linie, b.weg[b.wi]];
        if (q._um) return q;
        const [lx, lz] = a ? [q.x - a.x, q.z - a.z] : [0, 0];
        const L = Math.hypot(lx, lz);
        if (!(L > 1e-3) || Math.abs((x - a.x) * lz - (z - a.z) * lx) / L < 0.05) return q;
        const s0 = ((x - a.x) * lx + (z - a.z) * lz) / (L * L);
        for (const s of [Math.max(0, s0 + AnazhRealm.BEWOHNER.linieM / L), Math.max(0, s0), 0]) {
            const m = s >= 1 ? q : { x: a.x + lx * s, z: a.z + lz * s };
            if (!this._bewohnerWand({ x, z }, m)) return m;
        }
        return q;
    }

    // DER GANG IM TAKT (mensch.K3 Staffel 2, „Ausweichen ohne Berührung"): der Schritt längs des Wegs (`_bewohnerSchritt`);
    // kommt ein Leib in die Vorschau, wählt das Ausweichen (`_bewohnerAusweichen`) das Tempo, und der Schritt lenkt danach.
    // Sein Tempo (`vx`, `vz`) lesen die anderen. Die Ankunft geht ohne Zuschauer (`_bewohnerSchritt` allein). Liefert, ob sich
    // die Lage änderte.
    _bewohnerGehen(S, b, dt) {
        const g = b.leib;
        const BW = AnazhRealm.BEWOHNER;
        const [x0, z0] = [g.position.x, g.position.z];
        // DAS AUFHOLEN (mensch.K2 Staffel 2: sein Tag ist f(Same, t)): wer an der Tür wartete, auswich oder umging, eilt,
        // wer voraus ist, geht langsamer — schneller höchstens um `aufholen`, langsamer um die Hälfte —, bis er so weit ist,
        // wie ihn sein Tempo seit der Wende trüge (`zielUhr`, `_bewohnerZiel`); gezählt wird sein Fortschritt längs des Wegs
        // (der Rest schrumpft; ein Umweg wächst ihn), so findet ihn, wer nach der Abwesenheit kommt (`_bewohnerAnkunft`:
        // derselbe Weg ohne Zuschauer). Das Mehr trägt das Steuer-Gesetz, keine Frist: so viel, wie er bis zur Lage seines
        // Tags wieder abbremsen kann (√(2 · brems · g · Rückstand), im Schritt nie mehr als der Rückstand), das Tempo
        // wechselt mit Anfahren und Bremsen (`STEUER_GESETZ`) — nie ein Sprung, den der Gang nicht geht. Hinter seinem Tag
        // liegt er nie weiter als sein Rest-Weg (am Ziel stünde er nach seinem Tag), und der Rückstand ist sein Vorrang im
        // Gedränge (`rueck`, `_bewohnerAusweichen`). Bis hier holte er je 2 s die Hälfte auf, und es gab der höhere Same
        // Vorrang: im Strom zur Arbeit lag feld #45665 um 8,18 Uhr 4,6 m hinter seinem Tag.
        const TC = globalThis.__tetrapodaCore;
        const [SG, gE] = [TC.STEUER_GESETZ, TC.GANG_GESETZ.g];
        const roh = Number.isFinite(b.zielUhr) ? (b.uhr - b.zielUhr) * b.tempo - b.gegangen : 0;
        const rueck = (b.rueck = Number.isFinite(b.wegRest) ? Math.min(roh, b.wegRest) : roh);
        const mehr = Math.min(Math.sqrt(2 * SG.brems * gE * Math.abs(rueck)), Math.abs(rueck) / dt);
        const v0 = b.tempoJetzt > 0 && Number.isFinite(b.tempoTag) ? b.tempoTag : b.tempo;
        const soll = Math.max(
            v0 - SG.brems * gE * dt,
            Math.min(v0 + SG.beschl * gE * dt, b.tempo + Math.sign(rueck) * mehr)
        );
        b.tempoTag = Math.max(b.tempo / 2, Math.min(b.tempo * (1 + BW.aufholen), soll));
        const dtW = (dt * b.tempoTag) / b.tempo;
        const [weg0, rest0] = [b.weg, b.wegRest];
        const lenk = b.drinnen || !(dt > 0) ? null : this._bewohnerAusweichen(S, b, dtW);
        const bewegt = this._bewohnerSchritt(b, dtW, lenk);
        b.vx = (g.position.x - x0) / dt;
        b.vz = (g.position.z - z0) / dt;
        if (weg0 && (b.weg === weg0 || !b.weg)) b.gegangen = (b.gegangen || 0) + rest0 - (b.wegRest || 0);
        b.tempoJetzt = b.weg ? Math.hypot(b.vx, b.vz) : 0; // der Gang geht das Tempo, das er geht
        return bewegt;
    }

    // DAS AUSWEICHEN (mensch.K3 Staffel 2, das Muster der Menge: Geschwindigkeit abtasten, Zeit bis zur Berührung): je Leib im
    // Raster um ihn (`S.raster`, Zellen `rasterM`) die Zeit, bis sich zwei Kapseln (PLAYER_WALL_RADIUS) berühren, wenn der
    // andere sein Tempo hält — geachtet werden der Stehende und der Gehende mit Vorrang (wer weiter hinter seinem Tag liegt,
    // `rueck` aus `_bewohnerGehen`, gleich weit der höhere Same: so weicht nie jeder jedem, und der Vorrang geht durch). Berührt das Tempo seines Wegs (zum nächsten Punkt, im Tempo des Gesetzes) in
    // `ausweichS` Sekunden keinen und endet sein Schritt in keiner Kapsel, geht er den Weg (bis zu dessen nächstem Punkt,
    // `weg`; ohne Nachbarn null). Sonst wählt er unter
    // `ausweichRichtungen` Richtungen um den Weg × zwei Tempi und dem Stand das mit der kleinsten Strafe: fern vom Weg, fern vom
    // jetzigen Tempo, früh berührt, links vorbei (rechts geht vor) — nie eines, dessen Schritt in einer Kapsel endet (DIE
    // WACHE, gegen jeden: wer schon zu nah steht, rückt nur fort) oder eine Wand schneidet (`_bewohnerWand`: der Schritt und
    // das Bein von dort zum nächsten Punkt des Wegs; keines frei: er steht). Liefert { vx, vz, weg } oder null.
    _bewohnerAusweichen(S, b, dt) {
        const BW = AnazhRealm.BEWOHNER;
        const p = { x: b.leib.position.x, z: b.leib.position.z }; // eine Kopie: die Wand merkt den Boden am Punkt
        const q = b.weg && b.weg[b.wi];
        if (!q || !S.raster) return null;
        const hl = Math.hypot(q.x - p.x, q.z - p.z);
        if (!(hl > 1e-6) && b.wi + 1 < b.weg.length) {
            this._bewohnerErreicht(b); // er steht auf dem Punkt: der nächste zählt
            return this._bewohnerAusweichen(S, b, dt);
        }
        if (!(hl > 1e-6)) return null;
        const v = b.tempo;
        const e = this._bewohnerLinie(b, p.x, p.z);
        const he = Math.hypot(e.x - p.x, e.z - p.z) || hl;
        const [wx, wz] = [((e.x - p.x) / he) * v, ((e.z - p.z) / he) * v];
        const K = 2 * AnazhRealm.PLAYER_WALL_RADIUS + 0.01;
        // die Vorschau endet am nächsten Punkt seines Wegs (dort wendet er)
        const H = Math.min(BW.ausweichS, hl / v);
        const nb = this._bewohnerNachbarn || (this._bewohnerNachbarn = []);
        nb.length = 0;
        const [ix, iz] = [Math.floor(p.x / BW.rasterM), Math.floor(p.z / BW.rasterM)];
        const reich = (K + 2 * v * BW.ausweichS) ** 2;
        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++)
                for (const o of S.raster.get((ix + i) * 2097152 + iz + j) || [])
                    if (o !== b && !o.drinnen && o.leib)
                        if ((o.leib.position.x - p.x) ** 2 + (o.leib.position.z - p.z) ** 2 < reich) nb.push(o);
        if (!nb.length) return null;
        // DER BESETZTE PUNKT: steht ein Leib auf dem nächsten Punkt seines Wegs und ist er neben ihm (näher als zwei Kapseln),
        // gilt der Punkt als erreicht, wenn das Bein von hier zum übernächsten frei ist — das Bein des Tags beginnt an ihm, und
        // er geht auf es zurück (`_bewohnerLinie`). Bis mensch.K3 Staffel 2 sprang er schon 7 m vor dem Punkt auf eine neue
        // Linie von hier: die Sehne schnitt die Ecke, und wer nach 1 h kam, fand den Feldarbeiter #809070 2,06 m fort.
        const n1 = b.weg[b.wi + 1];
        if (
            n1 &&
            hl < 2 * K &&
            nb.some((o) => Math.hypot(o.leib.position.x - q.x, o.leib.position.z - q.z) < K) &&
            !this._bewohnerWand(p, n1)
        ) {
            this._bewohnerErreicht(b);
            return this._bewohnerAusweichen(S, b, dt);
        }
        // UM DEN STEHENDEN: steht einer auf dem Bein zum nächsten Punkt (vor ihm, näher als zwei Kapseln), geht der Weg über
        // einen Punkt neben ihm — auf der Seite des Beins, sonst der anderen —, dessen Beine keine Wand schneiden und an dem
        // kein Leib steht (`_bewohnerUm`)
        const um = this._bewohnerUm(b, p, q, nb, K, !q._um);
        if (um === true) return this._bewohnerAusweichen(S, b, dt);
        // PLATZ MACHEN: führt kein Umweg an ihm vorbei (die Laterne, die Hauswand), tritt der Stehende zur Seite (`_bewohnerPlatz`)
        if (um && this._bewohnerPlatz(S, um, p, q, b)) return { vx: 0, vz: 0 };
        // DIE WACHE: der Schritt mit (cx, cz) endet in keiner Kapsel (wer schon zu nah ist, entfernt sich) — sonst der, in
        // dessen Kapsel er endete
        const wache = (cx, cz) => {
            const [x, z] = [p.x + cx * dt, p.z + cz * dt];
            for (const o of nb) {
                const [ox, oz] = [o.leib.position.x, o.leib.position.z];
                const d2 = (ox - x) ** 2 + (oz - z) ** 2;
                if (d2 < K * K && d2 < (ox - p.x) ** 2 + (oz - p.z) ** 2) return o;
            }
            return null;
        };
        // die Zeit bis zur Berührung mit dem Tempo (cx, cz) vor dem Stehenden und dem Gehenden mit Vorrang
        const zeit = (cx, cz) => {
            let t = Infinity;
            for (const o of nb) {
                const [rb, ro] = [b.rueck || 0, o.rueck || 0];
                if (o.weg && (rb > ro || (rb === ro && o.same < b.same))) continue;
                const [rx, rz] = [o.leib.position.x - p.x, o.leib.position.z - p.z];
                const [ux, uz] = [cx - (o.vx || 0), cz - (o.vz || 0)];
                const nah = rx * ux + rz * uz;
                const c = rx * rx + rz * rz - K * K;
                const aa = ux * ux + uz * uz;
                if (nah <= 0 || aa < 1e-12) continue;
                if (c <= 0) return 0;
                const disk = nah * nah - aa * c;
                if (disk >= 0) t = Math.min(t, (nah - Math.sqrt(disk)) / aa);
            }
            return t;
        };
        // frei: er geht seinen Weg — mit Nachbarn bis zu dem Punkt, auf den er geht (`_bewohnerLinie`), nie um die Ecke
        // ungeprüft und nie über ihn hinaus (ein Takt der Ferne trägt Sekunden: vom Fußpunkt vor der Tür schoss er 1,2 m
        // über ihn hinaus an den Pfosten)
        const k = Math.min(1, he / (v * dt));
        if (zeit(wx, wz) >= H && !wache(wx * k, wz * k)) return { vx: wx * k, vz: wz * k, weg: true };
        // IM BEIN DURCH DIE TÜR (es schneidet ihre Wand): kein Ausweichen — er geht, wo keiner steht; sonst wartet er, und wer
        // einem mit Vorrang im Weg steht (der Gehende näher an der Tür: sie ist, worum beide gehen), tritt mit halbem Tempo von
        // ihm fort — nie näher an die Tür (er tritt nie schräg über ihre Schwelle). Wer hineingeht und schon auf dem Bein vor
        // ihr steht (zwischen dem Punkt vor ihr und ihr, eine Kapsel neben dem Bein), hat den Punkt vor ihr erreicht. Bis hier
        // galt der kürzere Rest-Weg: um 13,04 Uhr stand wohnhaus #279359 0,59 m vor seiner Tür mit dem Punkt vor ihr noch im
        // Weg, wich dem Nachbarn auf diesem Punkt und konnte nicht, ohne der Tür näher zu treten — beide standen.
        const o = b.orte;
        const zurTuer = (x, z) => Math.hypot(x - o.tuer.x, z - o.tuer.z);
        if (q === o.tuer || (q === o.vor && zurTuer(p.x, p.z) < BW.vorM)) {
            const [lx, lz] = [(o.tuer.x - o.vor.x) / BW.vorM, (o.tuer.z - o.vor.z) / BW.vorM];
            const [ux, uz] = [p.x - o.vor.x, p.z - o.vor.z];
            if (n1 === o.tuer && ux * lx + uz * lz > 0 && Math.abs(ux * lz - uz * lx) < AnazhRealm.PLAYER_WALL_RADIUS) {
                this._bewohnerErreicht(b);
                return this._bewohnerAusweichen(S, b, dt);
            }
            const w = wache(wx * k, wz * k);
            if (!w) return { vx: wx * k, vz: wz * k, weg: true };
            const [dw, db] = [zurTuer(w.leib.position.x, w.leib.position.z), zurTuer(p.x, p.z)];
            if (!(w.weg && (dw < db || (dw === db && w.same > b.same)))) return { vx: 0, vz: 0 };
            const [rx, rz] = [p.x - w.leib.position.x, p.z - w.leib.position.z];
            const l = (Math.hypot(rx, rz) || 1) / (v * 0.5);
            for (const a of [0, 0.5, -0.5, 1, -1]) {
                const [cx, cz] = [(rx * Math.cos(a) - rz * Math.sin(a)) / l, (rx * Math.sin(a) + rz * Math.cos(a)) / l];
                const nach = { x: p.x + cx * dt, z: p.z + cz * dt };
                if (zurTuer(nach.x, nach.z) >= db && !wache(cx, cz) && !this._bewohnerWand(p, nach))
                    return { vx: cx, vz: cz };
            }
            return { vx: 0, vz: 0 };
        }
        const [bvx, bvz] = [b.vx || 0, b.vz || 0];
        const wahl = [];
        const n = BW.ausweichRichtungen;
        const a0 = Math.atan2(wz, wx);
        for (const f of [1, 0.5])
            for (let i = 0; i < n; i++) {
                const a = a0 + (i * 2 * Math.PI) / n;
                const [cx, cz] = [Math.cos(a) * v * f, Math.sin(a) * v * f];
                if (wache(cx, cz)) continue;
                const t = zeit(cx, cz);
                if (t <= dt) continue;
                const links = (cz * wx - cx * wz) / (v * v); // > 0: links des Wegs
                const st =
                    (2 * Math.hypot(cx - wx, cz - wz)) / v +
                    (0.75 * Math.hypot(cx - bvx, cz - bvz)) / v +
                    2.5 / (0.1 + Math.min(t, H) / H) +
                    0.75 * Math.max(0, links);
                wahl.push({ st, vx: cx, vz: cz });
            }
        // das beste Tempo, dessen Schritt und dessen Bein von dort zum nächsten Punkt des Wegs keine Wand schneiden
        wahl.sort((x, y) => x.st - y.st);
        for (const c of wahl.slice(0, BW.ausweichWahl)) {
            const nach = { x: p.x + c.vx * dt, z: p.z + c.vz * dt };
            if (!this._bewohnerWand(p, nach) && !this._bewohnerWand(nach, q)) return c;
        }
        return { vx: 0, vz: 0 };
    }

    // UM DEN STEHENDEN (mensch.K3 Staffel 2, `_bewohnerAusweichen`): der erste Stehende `nb` auf dem Bein p → q (vor q, näher
    // als `K` an ihm) — der Punkt neben ihm (`K` + `umRandM` quer zum Bein, die Seite des Beins zuerst), von dem beide Beine
    // frei von jeder Wand sind und an dem kein Leib näher als `K` steht, tritt als nächster Punkt in den Weg (`_um`; der Rest
    // des Wegs neu gezählt; ist q selbst ein Umweg, keinen zweiten). Liefert true, wenn er einen fand, den Stehenden, wenn
    // nicht, sonst false.
    _bewohnerUm(b, p, q, nb, K, setzen) {
        const hl = Math.hypot(q.x - p.x, q.z - p.z);
        const [hx, hz] = [(q.x - p.x) / hl, (q.z - p.z) / hl];
        const steht = nb
            .filter((o) => !o.weg)
            .map((o) => {
                const [rx, rz] = [o.leib.position.x - p.x, o.leib.position.z - p.z];
                return { o, vor: rx * hx + rz * hz, quer: rz * hx - rx * hz };
            })
            .filter((c) => c.vor > 0 && c.vor < hl && Math.abs(c.quer) < K)
            .sort((a, c) => a.vor - c.vor)[0];
        if (!steht || !setzen) return steht ? steht.o : false;
        const D = K + AnazhRealm.BEWOHNER.umRandM;
        const o = steht.o.leib.position;
        for (const seite of steht.quer > 0 ? [-1, 1] : [1, -1]) {
            const d = { x: o.x - hz * seite * D, z: o.z + hx * seite * D, _um: true };
            if (nb.some((n) => Math.hypot(n.leib.position.x - d.x, n.leib.position.z - d.z) < K)) continue;
            if (this._bewohnerWand(p, d) || this._bewohnerWand(d, q)) continue;
            b.weg.splice(b.wi, 0, d);
            const rest = new Float64Array(b.weg.length);
            for (let i = b.weg.length - 2; i >= 0; i--)
                rest[i] = rest[i + 1] + Math.hypot(b.weg[i + 1].x - b.weg[i].x, b.weg[i + 1].z - b.weg[i].z);
            b.wegRestAb = rest;
            b.wegRest = Math.hypot(d.x - p.x, d.z - p.z) + rest[b.wi];
            return true;
        }
        return steht.o;
    }

    // PLATZ MACHEN (mensch.K3 Staffel 2): der Stehende o tritt auf den nächsten Punkt im Ring um sich (bis 1,8 m), der mehr als
    // zwei Kapseln neben dem Bein p → q des Gehenden liegt, frei von Wand und Leib ist und den er frei erreicht (`platz`; wer
    // schon beiseite steht, tritt wieder); ist sein Stand wieder frei und der Gehende `fuer` an ihm vorbei, geht er zurück
    // (`_tickBewohner`). Liefert, ob er Platz macht.
    _bewohnerPlatz(S, o, p, q, fuer) {
        if (o.platz && o.weg) return true; // er tritt schon beiseite
        const K = 2 * AnazhRealm.PLAYER_WALL_RADIUS + 0.01;
        const g = { x: o.leib.position.x, z: o.leib.position.z };
        for (let r = 0.6; r <= 1.81; r += 0.6)
            for (let i = 0; i < 12; i++) {
                const P = { x: g.x + Math.cos((i * Math.PI) / 6) * r, z: g.z + Math.sin((i * Math.PI) / 6) * r };
                const pkt = { minX: P.x, maxX: P.x, minZ: P.z, maxZ: P.z };
                if (this._streckeBoxAbstand2(pkt, p.x, p.z, q.x, q.z) < (K + 0.1) ** 2) continue;
                if (this._bewohnerNaechster(S, o, P.x, P.z) < K) continue;
                if (this._bewohnerWand(P, P, true) || this._bewohnerWand(g, P)) continue;
                Object.assign(o, {
                    weg: [P],
                    linie: g,
                    wi: 0,
                    wegRestAb: new Float64Array(1),
                    wegRest: r,
                    da: false,
                    stand: null,
                });
                o.platz = fuer;
                return true;
            }
        return false;
    }

    // DER NÄCHSTE LEIB um (x, z) im Raster seiner Siedlung (`S.raster`), außer b: sein Abstand (Infinity: keiner nah).
    _bewohnerNaechster(S, b, x, z) {
        const M = AnazhRealm.BEWOHNER.rasterM;
        const [ix, iz] = [Math.floor(x / M), Math.floor(z / M)];
        let d = Infinity;
        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++)
                for (const o of S.raster.get((ix + i) * 2097152 + iz + j) || [])
                    if (o !== b && !o.drinnen && o.leib)
                        d = Math.min(d, Math.hypot(o.leib.position.x - x, o.leib.position.z - z));
        return d;
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
        // über der Stufe hat sein Kopf Raum (`kopfM`): der Rand des Brunnens unter seinem Dach trägt ihn nicht
        const kopf = (y) => {
            for (const e of kand)
                for (const box of e.blockerAABBs || [])
                    if (
                        box.botY < y + AnazhRealm.BEWOHNER.kopfM &&
                        box.topY > y + AnazhRealm.PLAYER_STEP_UP &&
                        this._boxAbstand2(box, x, z) <= R * R
                    )
                        return false;
            return true;
        };
        for (const e of kand)
            for (const box of e.blockerAABBs || [])
                if (
                    box.gedeckt !== true &&
                    box.topY > top &&
                    box.topY <= hoch &&
                    box.topY >= tief &&
                    this._boxAbstand2(box, x, z) <= R * R &&
                    kopf(box.topY)
                )
                    top = box.topY;
        return top;
    }

    // DIE WAND AN DER STRECKE (mensch.K3): die Kapsel des Leibs — die des Spielers (`_resolveCapsuleVsAABB`: Radius
    // PLAYER_WALL_RADIUS, Wand ab der Stufe PLAYER_STEP_UP über der Sohle) bis zum Scheitel (`BEWOHNER.kopfM`) — längs a → e
    // gegen das EINE Blocker-Netz (`_blockerNahe`, je Box `_streckeBoxAbstand2`): Haus, Bau, Baum, Fels. Die Höhe trägt der
    // Boden unter der Box — längs des Stücks der Strecke, das sie begleitet (die Stufe am tiefsten, der Scheitel am höchsten;
    // mensch.K3 Staffel 2: in der Senke zwischen zwei Enden geht der Leib tiefer, als die Enden sagen) —, an den Enden je Punkt
    // gemerkt bis zum nächsten Edit oder Erdbau (`_editGenZaehler`). Liefert den Eintrag der ersten
    // Wand oder null; a = e fragt den Stand. `stand` (mensch.K3 Staffel 2): wer dort steht, steht auf dem Boden — jede Box über
    // dem Fang des Bodens (PLAYER_GROUND_SNAP) bis eine Stufe über den Scheitel ist Wand (der Rand des Brunnens, die Stufe);
    // `rand`: so viel weiter als die Kapsel fragt er (der Raum eines Gehenden neben dem Stand, `standRandM`).
    _bewohnerWand(a, e, stand = false, rand = 0) {
        const R = AnazhRealm.PLAYER_WALL_RADIUS + rand;
        const kand = this._bewohnerWandKand || (this._bewohnerWandKand = []);
        kand.length = 0;
        this._blockerNahe((a.x + e.x) / 2, (a.z + e.z) / 2, Math.hypot(e.x - a.x, e.z - a.z) / 2 + R, 0, kand);
        const [dx, dz] = [e.x - a.x, e.z - a.z];
        const L = Math.hypot(dx, dz);
        const [unten, oben] = stand
            ? [AnazhRealm.PLAYER_GROUND_SNAP, AnazhRealm.BEWOHNER.kopfM + AnazhRealm.PLAYER_STEP_UP]
            : [AnazhRealm.PLAYER_STEP_UP, AnazhRealm.BEWOHNER.kopfM];
        let st = null;
        let memo = null;
        for (const ent of kand) {
            const boxen = ent.blockerAABBs;
            if (!boxen) continue;
            for (const box of boxen) {
                if (this._streckeBoxAbstand2(box, a.x, a.z, e.x, e.z) >= R * R) continue;
                if (st === null) {
                    this._voxelEditKarte(); // trägt jeden neuen Edit nach: sein Zähler ist der Stand des Bodens
                    st = this._editGenZaehler | 0;
                    memo = new Map();
                }
                const grund = (q) =>
                    q._grundStand === st
                        ? q._grundY
                        : ((q._grundStand = st), (q._grundY = this.getTerrainHeightAt(q.x, q.z)));
                // der Boden unter der Box: längs der Strecke, so weit die Box (samt Kapsel) sie begleitet, je halben Meter
                let [t0, t1] = [0, 1];
                if (L > 1e-6) {
                    const ts = [box.minX, box.maxX].flatMap((x) =>
                        [box.minZ, box.maxZ].map((z) => ((x - a.x) * dx + (z - a.z) * dz) / (L * L))
                    );
                    t0 = Math.max(0, Math.min(...ts) - R / L);
                    t1 = Math.min(1, Math.max(...ts) + R / L);
                }
                const k0 = Math.floor((t0 * L) / 0.5);
                const k1 = Math.ceil((t1 * L) / 0.5);
                const boden = (k) => {
                    const t = Math.max(t0, Math.min(t1, (k * 0.5) / (L || 1)));
                    let g = t <= 0 ? grund(a) : t >= 1 ? grund(e) : memo.get(k);
                    if (g === undefined) memo.set(k, (g = this.getTerrainHeightAt(a.x + dx * t, a.z + dz * t)));
                    return g;
                };
                // ohne Boden ist jede Box Wand; die Sohle steht bis `sohleM` unter dem Gesetz (der Feld-Scan des Schritts,
                // `_bewohnerSchritt`), die Wand fragt um sie tiefer — sonst stand der Sockel der Laterne #15942 (0,593 m über
                // dem Gesetz) dem Gehenden 0,601 m über der Sohle, Wand im Leib, die seine Frage nie sah.
                // EIN Boden urteilt zuerst (Lehre 25: der billige Filter vor der teuren Rechnung): g0 ≤ gm ≤ g1 — ragt die Box über
                // gm + unten und reicht unter gm + oben, ist sie Wand bei jedem Boden des Stücks; nur die Unentschiedene tastet es ab
                const s = AnazhRealm.BEWOHNER.sohleM;
                const gm = boden((k0 + k1) >> 1);
                if (box.topY > gm + unten - s && box.botY < gm + oben) return ent;
                let [g0, g1] = [Infinity, -Infinity];
                for (let k = k0; k <= k1; k++) {
                    const g = boden(k);
                    [g0, g1] = [Math.min(g0, g), Math.max(g1, g)];
                }
                if (!Number.isFinite(g0 + g1) || (box.topY > g0 + unten - s && box.botY < g1 + oben)) return ent;
            }
        }
        return null;
    }

    // DAS WEGE-NETZ einer Siedlung (je Stand der Wache): je Punkt der Straßen und Feldwege des Plans ein Knoten, die Folge
    // eines Wegs seine Kanten, die Kreuzungen (Knoten zweier Wege näher als `kreuzM`) verbunden; es hängt über FREIE Kanten
    // zusammen (`_bewohnerKante`): was getrennt liegt (ein Weg, der seitlich in eine Straße mündet, eine Gasse, über der ein
    // Baum steht), schließt der kürzeste freie Schritt zum Rest (bis `naehtM`) — EIN Netz je Dorf. Wechselt eine Hülle im
    // Rechteck der Wache, urteilt es neu. DER GRUND DES NETZES (Knoten, Folgen, Kreuzungen: die Lage allein, `S.netzGrund`)
    // entsteht je Siedlung einmal — ein neuer Stand urteilt nur die Kanten (Lehre 25: der Takt kostet die Änderung), und jeder
    // Knoten behält seinen Boden (`_bewohnerWand`); jede Naht urteilt über `_bewohnerKante` (gemerkt wie jede Kante).
    // EIN STAND, DER KEIN URTEIL ÄNDERT, ÄNDERT DAS NETZ NICHT: jede gemerkte Kante, die eine gewechselte Hülle berührt
    // (`_bewohnerWechsel`), urteilt neu — bleibt jedes Urteil, gilt das Netz weiter; sonst entsteht es mit dem Geurteilten neu.
    _bewohnerNetz(S) {
        const alt = S.netz;
        if (alt && alt.stand === S.wache.stand) return alt;
        const trifft = alt && this._bewohnerWechsel(S, alt.stand);
        let erbe = null;
        if (trifft) {
            const n = alt.knoten.length;
            let gleich = true;
            erbe = new Map();
            for (const [key, f] of alt.frei) {
                const a = alt.knoten[Math.floor(key / n)];
                const e = alt.knoten[key % n];
                const neu = trifft(a, e) ? !this._bewohnerWand(a, e) : f;
                if (neu !== f) gleich = false;
                erbe.set(key, neu);
            }
            if (gleich) {
                alt.stand = S.wache.stand;
                return alt;
            }
        }
        const G = S.netzGrund || (S.netzGrund = { knoten: [], kanten: [] });
        const knoten = G.knoten;
        const kante = (kanten, i, j) => {
            const w = Math.hypot(knoten[i].x - knoten[j].x, knoten[i].z - knoten[j].z);
            kanten[i].push(j, w);
            kanten[j].push(i, w);
        };
        if (!knoten.length) {
            const zug = [];
            let wi = 0;
            for (const rd of (S.plan.roads || []).concat(S.plan.feldwege || [])) {
                let vor = -1;
                for (const q of rd.pts || []) {
                    if (!q || !Number.isFinite(q.x) || !Number.isFinite(q.z)) continue;
                    knoten.push({ x: S.ox + q.x, z: S.oz + q.z });
                    G.kanten.push([]);
                    zug.push(wi);
                    const i = knoten.length - 1;
                    if (vor >= 0) kante(G.kanten, vor, i);
                    vor = i;
                }
                wi++;
            }
            const K2 = AnazhRealm.BEWOHNER.kreuzM ** 2;
            for (let i = 0; i < knoten.length; i++)
                for (let j = i + 1; j < knoten.length; j++)
                    if (zug[i] !== zug[j] && (knoten[i].x - knoten[j].x) ** 2 + (knoten[i].z - knoten[j].z) ** 2 < K2)
                        kante(G.kanten, i, j);
        }
        const kanten = G.kanten.map((k) => k.slice());
        const N = { knoten, kanten, baeume: new Map(), frei: erbe || new Map(), stand: S.wache.stand };
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
            const naht = paare.find(([, i, j]) => this._bewohnerKante(N, i, j));
            if (!naht) {
                this._bruchMelden(
                    `BEWOHNER: das Wege-Netz von „${S.plan.name || "?"}" zerfällt in ${n} Teile (kein freier Schritt bis ${AnazhRealm.BEWOHNER.naehtM} m)`
                );
                break;
            }
            kante(kanten, naht[1], naht[2]);
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
    // durch die eigene Tür), die eine gewechselte Hülle berühren (`trifft`, `_bewohnerWechsel`; null: jedes); trifft eines
    // eine Wand, legt er den Weg neu von hier (`_bewohnerWeg`, im nächsten Takt).
    _bewohnerWegPruefen(S, trifft = null) {
        for (const b of S.liste) {
            if (!b.weg || !b.leib) continue;
            const o = b.orte;
            let p = { x: b.leib.position.x, z: b.leib.position.z };
            for (let i = b.wi; i < b.weg.length; p = b.weg[i++]) {
                const q = b.weg[i];
                const tuerBein = q === o.tuer || (q === o.vor && (p === o.tuer || (i === b.wi && b.stand === o.tuer)));
                if (tuerBein || (trifft && !trifft(p, q)) || !this._bewohnerWand(p, q)) continue;
                b.weg = null;
                b.stand = null;
                break;
            }
        }
    }

    // DIE WECHSEL SEIT EINEM STAND der Wache (ihr Buch, `_blockerWacheMelden`): die Probe, ob eine Strecke a → e eine Hülle
    // berührt, die seit `seit` wechselte (ihr Kasten samt Kapsel und Spur, wie die Wache); null, wenn das Buch nicht so weit
    // zurück reicht — dann urteilt der Leser alles neu.
    _bewohnerWechsel(S, seit) {
        const w = S.wache;
        const L = w.wechsel || [];
        const n = w.stand - seit;
        if (!(n >= 0 && n <= L.length)) return null;
        const H = L.slice(L.length - n);
        const r = AnazhRealm.PLAYER_WALL_RADIUS + AnazhRealm.BEWOHNER.spurM + 1;
        return (a, e) => {
            const x0 = Math.min(a.x, e.x) - r;
            const x1 = Math.max(a.x, e.x) + r;
            const z0 = Math.min(a.z, e.z) - r;
            const z1 = Math.max(a.z, e.z) + r;
            for (const h of H) if (h[1] >= x0 && h[0] <= x1 && h[3] >= z0 && h[2] <= z1) return true;
            return false;
        };
    }

    // DER ANSCHLUSS eines Orts: der nächste der `anschlussN` nächsten Knoten des Netzes, den er in gerader Linie frei
    // erreicht (`_bewohnerWand`). Kein Knoten: laut, und -1 (die Strecke trägt
    // keinen Weg, `_bewohnerStrecke`: er bleibt) — nie durch die Wand zum nächsten.
    _bewohnerAnschluss(N, o) {
        if (o._knoten !== undefined) return o._knoten;
        const nah = N.knoten
            .map((q, i) => ({ i, d: (q.x - o.x) ** 2 + (q.z - o.z) ** 2 }))
            .sort((a, b) => a.d - b.d)
            .slice(0, AnazhRealm.BEWOHNER.anschlussN);
        const frei = nah.find((c) => !this._bewohnerWand(o, N.knoten[c.i]));
        const k = frei ? frei.i : -1;
        if (k < 0) this._bruchMelden(`BEWOHNER: der Ort ${o.x.toFixed(1)}/${o.z.toFixed(1)} erreicht keinen Weg frei`);
        o._knoten = k;
        return k;
    }

    // DER AUSWEG eines Orts, der keinen Knoten frei erreicht (`_bewohnerStrecke`): der nächste Punkt im Ring um ihn (bis
    // `auswegM`, je 0,6 m zwölf Richtungen), den er in gerader Linie frei erreicht — `ausDerWand`: steht er selbst in einer
    // Hülle, zählt die Linie nicht —, der frei steht (mit `rand` Raum), Land ist, in keinem Grundriss liegt, `raum` (Stände)
    // nicht näher als `raumM` trägt und selbst einen Knoten frei erreicht. Gemerkt je Stand der Wache (`o._ausweg`); null: keiner.
    _bewohnerAusweg(N, o, ausDerWand = false, raum = null, rand = 0) {
        if (o._ausweg !== undefined) return o._ausweg;
        const BW = AnazhRealm.BEWOHNER;
        let gefunden = null;
        for (let r = 0.6; r <= BW.auswegM + 1e-6 && !gefunden; r += 0.6)
            for (let i = 0; i < 12 && !gefunden; i++) {
                const q = { x: o.x + Math.cos((i * Math.PI) / 6) * r, z: o.z + Math.sin((i * Math.PI) / 6) * r };
                if (this._bewohnerWand(q, q, true, rand) || (!ausDerWand && this._bewohnerWand(o, q))) continue;
                if (raum && raum.some((p) => p !== o && (p.x - q.x) ** 2 + (p.z - q.z) ** 2 < BW.raumM * BW.raumM))
                    continue;
                const g = this._imGrundriss(q.x, q.z, BW.saumM);
                if (g === "haus" || g === "bau" || !this._landAt(q.x, q.z, 0.2)) continue;
                if (this._bewohnerAnschluss(N, q) >= 0) gefunden = q;
            }
        return (o._ausweg = gefunden);
    }

    // DER STAND WEICHT DER HÜLLE (mensch.K3 Staffel 2): bei der Geburt der Liste und wenn eine Hülle wechselt (`trifft`,
    // `_bewohnerWechsel`; der Baum, der Busch, der Fels des Wald-Takts), gilt jeder Stand an seinem Ursprung (`ur`, der Ort
    // der Liste), wo dort auf dem Boden Raum für einen Gehenden neben ihm ist (`standRandM`); sonst rückt er auf den Ausweg
    // seines Ursprungs (`_bewohnerAusweg` aus der Wand, `raumM` zum Ursprung jedes anderen Stands; mit dem Raum, sonst ohne
    // ihn) — wer dort steht oder hingeht, geht neu. Vom Ursprung aus, gegen Ursprünge: dieselbe Welt gibt jeder Liste
    // dieselben Stände, in jeder Reihenfolge. Steht der Ursprung in einer Hülle ohne Ausweg: laut, der Stand bleibt.
    _bewohnerStandPruefen(S, trifft) {
        const BW = AnazhRealm.BEWOHNER;
        const N = this._bewohnerNetz(S);
        const staende = new Set();
        for (const b of S.liste)
            for (const k of ["heim", "platz", "werk", "besuch"]) if (b.orte[k]) staende.add(b.orte[k]);
        for (const o of staende) {
            const ur = o.ur || (o.ur = { x: o.x, z: o.z });
            if (trifft && !trifft(o, o) && !trifft(ur, ur)) continue;
            const raum = [...staende].filter((p) => p !== o).map((p) => p.ur || p);
            const neu = (rand) => this._bewohnerAusweg(N, { x: ur.x, z: ur.z }, true, raum, rand);
            const q = !this._bewohnerWand(ur, ur, true, BW.standRandM)
                ? ur
                : neu(BW.standRandM) || (!this._bewohnerWand(ur, ur, true) ? ur : neu(0));
            if (!q) {
                this._bruchMelden(
                    `BEWOHNER: der Stand ${ur.x.toFixed(1)}/${ur.z.toFixed(1)} steht in einer Hülle, kein Ausweg`
                );
                continue;
            }
            if (q.x === o.x && q.z === o.z) continue;
            Object.assign(o, {
                x: q.x,
                z: q.z,
                _knoten: undefined,
                _direkt: null,
                _ausweg: undefined,
                _wegeStand: undefined,
            });
            for (const b of S.liste)
                if (b.leib && !b.drinnen && (b.ziel === o || b.stand === o)) {
                    Object.assign(b, { weg: null, stand: null, wegRest: null });
                    if (b.ziel === o) b.da = false;
                }
        }
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
        S.listeWerk = null;
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
// geburtenJeTakt = Leiber je Takt (Klon aus dem Memo ~1 ms) · haeuserJeTakt = so viele Häuser legt die Liste je Takt · fernFaktor = jenseits nearM × fernFaktor gehen die Leiber ·
// nahM (+ nahHystM zurück) / nahLeiber = so nah und so viele leben als Leib (Atem, Stufen), jeder andere im Nah-Kreis steht
// im Satz seiner Gestalt (`_bewohnerSatz`: die Befehle hängen nie an der Kopfzahl) · feldKoerperM / feldPx (+ feldHystM zurück) = der Satz trägt, solange
// ein Leib so hoch am Schirm so viele Bildpunkte deckt, jenseits das Feld (`_bewohnerFeldGrenze`) · gangPhasen = die Phasen des Doppelschritts im Gang-Puffer, gangJeTakt = so viele backt ein
// Takt · platzRandM = so weit vom Rand des Platzes steht, wer auf ihm keinen Stand fand. DER TAG (mensch.K2): planH = so viele
// Stunden der Uhr, bis jeder seinen Plan neu liest (0,002 h = 0,3 s am Tag von 60 min: so spät geht er nach seiner Wende los,
// ≤ 0,5 m hinter der Ankunft) · DIE ANKUNFT (`_bewohnerAnkunft`): ankunftH = so viele Stunden spielt der Leib seinen Tag nach,
// höchstens ankunftWenden Wenden, die Wende gerastert auf wendeH · ankunftJeTakt = so viele Ankünfte je Takt · sprungH = ein
// Sprung der Uhr ab hier stellt jeden neu (das Zeitraffer-Ereignis der Linse, 0,1 h, ist keiner) · wegeJeTakt = neue Wege je
// Takt · direktM = bis hier geht er frei in gerader Linie, weiter über das Wege-Netz · spurM = seine Spur quer zum Weg · kreuzM = Knoten zweier Wege näher als dies
// kreuzen, naehtM = so weit schließt das Netz eine Lücke · vorM = der Punkt vor der Tür, über den jeder Weg ins Haus und
// aus ihm geht. DIE WEGE (mensch.K3): kopfM = der Scheitel des Leibs über der Sohle — so hoch reicht die Kapsel, die jeder
// Stand und jedes Bein gegen das Blocker-Netz fragt (`_bewohnerWand`). DIE STADT (mensch.K3 Staffel 2): rasterM = die Zelle
// des Rasters der Leiber · ausweichS = so weit voraus (Sekunden) sieht er die Berührung · ausweichRichtungen = so viele
// Richtungen tastet er ab, die ausweichWahl besten fragt er nach der Wand (`_bewohnerAusweichen`) · tuerFreiM = so nah an
// der Tür steht keiner, wenn er aus ihr tritt · aufholen = so viel schneller (je Tempo) eilt, wer hinter seinem Tag ist (`_bewohnerGehen`) · besuchM = so fern von seiner Tür und der Mitte des Platzes liegt die Tür
// seines Besuchs, besuchWeitM = so fern von ihnen und seinem Werk höchstens (`_bewohnerGestalten`) · gasseFreiM = so fern
// von der Mitte jeder Gasse steht jeder Stand · anschlussN = so viele Knoten fragt
// der Anschluss eines Orts (`_bewohnerAnschluss`) · auswegM = so weit sucht ein Ort ohne freien Anschluss seinen Ausweg
// (`_bewohnerAusweg`) · standRandM = so viel Raum hält jeder Stand zu jeder Wand über die Kapsel hinaus: ein Gehender
// passt zwischen beide (`_bewohnerStandPruefen`) · umRandM = so weit über zwei Kapseln geht er am Stehenden vorbei
// (`_bewohnerUm`) · linieM = so weit voraus auf seinem Bein liegt der Punkt, auf den zurückgeht, wer auswich
// (`_bewohnerLinie`).
AnazhRealm.BEWOHNER = Object.freeze({
    gestalten: 4,
    platzAnteil: 0.45,
    raumM: 1.5,
    saumM: 0.45,
    geburtenJeTakt: 2,
    haeuserJeTakt: 4,
    fernFaktor: 1.25,
    nahM: 8,
    nahHystM: 1,
    nahLeiber: 4,
    feldKoerperM: 1.8,
    feldPx: 64,
    feldHystM: 4,
    gangPhasen: 16,
    gangJeTakt: 2,
    platzRandM: 10,
    planH: 0.002,
    ankunftH: 3,
    ankunftWenden: 12,
    wendeH: 0.02,
    ankunftJeTakt: 8,
    sprungH: 0.25,
    wegeJeTakt: 2,
    direktM: 30,
    spurM: 0.8,
    kreuzM: 3,
    naehtM: 25,
    vorM: 1.6,
    kopfM: 1.8,
    rasterM: 5,
    ausweichS: 2.5,
    ausweichRichtungen: 12,
    ausweichWahl: 6,
    tuerFreiM: 0.9,
    aufholen: 1,
    besuchM: 40,
    besuchWeitM: 60,
    gasseFreiM: 1.6,
    anschlussN: 48,
    auswegM: 3,
    standRandM: 0.75,
    umRandM: 0.15,
    linieM: 2,
    sohleM: 0.008,
});
