// kreatur-mensch.cjs — DIE PROBEN DES MENSCHEN der Kreatur-Proben (mensch.K1–K5: `bewohner`, `begegnung`): ihre Bühnen, ihr Urteil,
// ihre Täter. Geteilt nach Domäne (12.11., w28-stadt-grammatik: scripts/lib/kreatur-proben.cjs trug 4003 Zeilen, die Datei-Decke
// ist 4000) — wie die Lebens-Proben in scripts/diag-kreatur-leben.cjs. Die Bühnen stehen an der Marke MENSCH_BUEHNEN im Leib von
// `kreaturProben`: r, s, A, T, opts, taeter, ort, buehne, decke, startDorf, wer, angekommen, leute, uhrAuf, stehtUm und jeder Helfer
// der Proben sind dort im Gültigkeitsbereich — keine zweite Liste.
"use strict";
async function menschBuehnen() {
    // ── bewohner (mensch.K1–K3): das Start-Dorf wächst, bis jeder Bewohner seinen Leib trägt (je Haus `leuteVon`), am
    // Dorfplatz die Menschen im Blick; DER TAG mit der Uhr des Spiels: Soll-Orte, Schmiede, Sprung-Wand, Wege, Wiederkehr.
    await buehne("bewohner", async (restore) => {
        const W = window;
        // Täter (Selbsttest): alle in EINEM Lauf (`EIN_LAUF`), je einer an seinem Ort im Lauf — vor dem Tag gezählt und
        // zurück, im Tag an seiner Messung, nach ihm je ein Fenster mit eigenem Messer (`sicht`: das Urteil je Täter)
        const [hat, sicht] = [(t) => [].concat(taeter).includes(t), {}];
        const FC = globalThis.__fachwerkCore;
        const q3 = (v) => Math.round(v * 1000) / 1000;
        const [DT, tagS] = [0.1, s.dayLengthMinutes * 60];
        const takte = Math.round((0.1 / 24) * tagS * 10);
        const nahR = A.BEWOHNER.nahM + A.BEWOHNER.nahHystM;
        // ── DIE WEGE (mensch.K3): je Takt jeder draußen als Spieler-Kapsel gegen das Blocker-Netz (die Box nennt den Bau), ins
        // Haus nur durch die Tür, die Gangzeit auf Wegen (`_aufWeg`), die Wege je Tag und der Weg je Leib, der Sprung > 2 m im
        // Nahbereich (mensch.K2) — Staffel 2: der Steckenbleiber (ein Ziel, nicht dort — draußen 1,5 m, ins Haus erst drinnen,
        // drinnen wartet er an der Tür —, und weniger als 1 m in 5 Spielminuten) und die Berührung zweier Kapseln draußen (je
        // Paar, das sich berührte); EIN Messer je Siedlung (`wegeMesser`), dasselbe im Start-Dorf und in der Stadt
        const RW = A.PLAYER_WALL_RADIUS;
        const nameVon = (e) => `${e.type} #${e.seed >>> 0}`;
        const kernVon = (e) => (e?.tuer && e.tuer.W > 1.5 && e.tuer.D > 1.5 ? e.tuer : null);
        const hausLage = (e, x, z) => {
            const [c, sn, k] = [Math.cos(e.rotationY || 0), Math.sin(e.rotationY || 0), e.scale > 0 ? e.scale : 1];
            const [dx, dz] = [x - e.position.x, z - e.position.z];
            return { x: (dx * c - dz * sn) / k, z: (dx * sn + dz * c) / k };
        };
        const durchTuer = (e, ax, az, ex, ez) => {
            const [t, p, q] = [kernVon(e), hausLage(e, ax, az), hausLage(e, ex, ez)];
            return [[t.z, t.x, t.w], t.hinten ? [-t.z, t.hinten.x, t.hinten.w] : []].some(([zF, xT, wT]) => {
                const [u, v] = [p.z - zF, q.z - zF];
                if (!(wT > 0) || (u * v > 0 && Math.abs(u) > 1e-3 && Math.abs(v) > 1e-3)) return false;
                const k = Math.abs(u - v) > 1e-9 ? Math.max(0, Math.min(1, u / (u - v))) : 1;
                return Math.abs(p.x + (q.x - p.x) * k - xT) <= wT / 2 + 0.05;
            });
        };
        const wegeMesser = (liste) => {
            const WG = { wand: new Map(), durch: 0, tuer: 0, falsch: [], geh: 0, aufWeg: 0, sprungN: 0 };
            const [stecken, beruehr, kandW, wSpur, akten] = [[], [], [], new Map(), []];
            let minute = 0;
            const wann = (b) => `${b.rolle} #${b.heim} um ${(s.timeOfDay * 24).toFixed(2)} Uhr`;
            // DER UMSTAND DES STECKENBLEIBERS (w28-stadt-grammatik): worauf er wartet — die Leiber um ihn (2 m), die Wahl seines
            // Ausweichens (`frist`: steht er, weil keine Richtung frei ist?), die Fahrbahn unter und vor ihm und der nächste Wagen
            // der Stadt (sein Zustand, sein Tempo, wie lange er vor Leibern steht) — nur lesen, nie fragen, was reserviert
            // die Siedlung dieser Leiber: die, deren Liste den ersten trägt (`liste` ist ein Auszug: die Leiber im Bild) — bis hier
            // suchte der Umstand die Liste selbst, fand keine und brach an der ersten Akte (TypeError statt Steckenbleiber)
            const siedlungDer = () => {
                const S = [...(r._bewohnerSiedlungen || new Map()).values()].find((q) => (q.liste || []).includes(liste[0]));
                if (!S) throw new Error("wegeMesser: die Leiber der Probe gehören keiner Siedlung der Welt");
                return S;
            };
            // DER PLAN UM DAS KNÄUEL (25 m um den ersten Steckenbleiber, plan-lokal am Ursprung ox/oz): Wege, Grundrisse, Laternen
            // und die Linien, die die Wagen fahren — das Maß der Enge steht im Plan
            const steckPlan = () => {
                const S = siedlungDer();
                const [mx, mz] = [akten[0].bei[0] - S.ox, akten[0].bei[1] - S.oz];
                const e2 = (v) => Math.round(v * 100) / 100;
                const nah = (q) => q && Math.hypot(q.x - mx, q.z - mz) < 25;
                const VK = S.verkehr;
                return {
                    ox: S.ox,
                    oz: S.oz,
                    roads: (S.plan.roads || []).map((rd, i) => ({ i, w: rd.w, gen: rd.gen, pts: rd.pts.filter(nah).map((q) => [e2(q.x), e2(q.z)]) })).filter((rd) => rd.pts.length), // prettier-ignore
                    slots: S.plan.slots.map((q, i) => ({ i, x: e2(q.x), z: e2(q.z), phi: e2(q.phi || 0), rolle: q.rolle, same: q.seed >>> 0, obb: q.obb && [q.obb.cx, q.obb.cz, q.obb.phi, q.obb.ex, q.obb.ez].map(e2), tuer: q.tuer && [q.tuer.x, q.tuer.z, q.tuer.W, q.tuer.D].map(e2) })).filter(nah), // prettier-ignore
                    laternen: (S.plan.laternen || []).filter(nah).map((q) => [e2(q.x), e2(q.z), q.wand ? 1 : 0]),
                    wagen: VK ? VK.wagen.length : null,
                    strecken: VK ? (VK.strecken || []).map((s2, i) => ({ i, fahrbar: s2.fahrbar, spur: (s2.spur || []).map((l) => (l || []).filter((q) => nah(q) || nah({ x: q.x - S.ox, z: q.z - S.oz })).map((q) => [e2(q.x), e2(q.z)])) })).filter((s2) => s2.spur.some((l) => l.length)) : null, // prettier-ignore
                    streckeForm: VK && VK.strecken[0] ? Object.keys(VK.strecken[0]) : null,
                    spur: [-4, -3.5, -3, -2.5, -2, 2, 2.5, 3, 3.5, 4].map((d) => [d, VK ? !!r._verkehrAufSpur(S, akten[0].bei[0], akten[0].bei[1] + d, 0) : null]),
                };
            };
            const umstand = (b, x, z) => {
                const S = siedlungDer();
                const nb = liste.filter((o) => o !== b && !o.drinnen && o.leib && ab(o.leib.position, { x, z }) < 2).length;
                const c = b.frist && b.frist.c;
                const W = ((S && S.verkehr && S.verkehr.wagen) || [])
                    .filter((w) => w.entry && w.entry.position)
                    .map((w) => [ab(w.entry.position, { x, z }), w])
                    .sort((u, v) => u[0] - v[0])[0];
                // DIE AKTE DES KNÄUELS (die ersten drei): sein Weg um den nächsten Punkt, die Leiber bis 3 m (Lage, Tempo, Ziel, Weg,
                // Wahl, ob einer ihm Platz macht) und die Bauten bis 3 m — wer steht vor wem?
                if (akten.length < 3) {
                    const e1 = (v) => Math.round(v * 10) / 10;
                    const kurz = (o) => ({
                        wer: `${o.rolle} #${o.heim}`,
                        bei: [e1(o.leib.position.x), e1(o.leib.position.z)],
                        v: [e1(o.vx || 0), e1(o.vz || 0)],
                        ziel: o.ziel ? [e1(o.ziel.x), e1(o.ziel.z)] : null,
                        weg: o.weg ? `${o.wi}/${o.weg.length}` : null,
                        vor: o.weg && o.weg[o.wi] ? [e1(o.weg[o.wi].x), e1(o.weg[o.wi].z), o.weg[o.wi]._um ? "um" : ""] : null,
                        da: !!o.da,
                        platz: !!o.platz,
                        wahl: o.frist && o.frist.c ? [e1(o.frist.c.vx), e1(o.frist.c.vz)] : null,
                        rueck: e1(o.rueck || 0),
                    });
                    const bau = [];
                    r._blockerNahe(x, z, 3, -Infinity, bau);
                    akten.push({
                        ...kurz(b),
                        wegUm: b.weg ? b.weg.slice(Math.max(0, b.wi - 2), b.wi + 3).map((q) => [e1(q.x), e1(q.z), q._um ? "um" : ""]) : null,
                        linie: b.linie ? [e1(b.linie.x), e1(b.linie.z)] : null,
                        um: liste.filter((o) => o !== b && !o.drinnen && o.leib && ab(o.leib.position, { x, z }) < 3).map(kurz),
                        bau: bau.map((e) => `${nameVon(e)} ${Math.sqrt(Math.min(...(e.blockerAABBs || []).map((q) => r._boxAbstand2(q, x, z)))).toFixed(1)} m`),
                        // DAS TASTEN (die Wand-Frage seines Ausweichens, `_bewohnerAusweichen`): das Bein von hier zum nächsten Punkt und
                        // zur Linie seines Tags, und je Schritt-Weite zwölf Richtungen ab der Richtung zum Punkt — „p" der Schritt
                        // schneidet eine Wand, „q" das Bein von dort zum Punkt, „." beide frei
                        tast: (() => {
                            const q = b.weg && b.weg[b.wi];
                            if (!q) return null;
                            const P = () => ({ x, z });
                            const e = r._bewohnerLinie(b, x, z);
                            const a0 = Math.atan2(q.z - z, q.x - x);
                            const je = (s) => Array.from({ length: 12 }, (_, i) => { const n = () => ({ x: x + Math.cos(a0 + (i * Math.PI) / 6) * s, z: z + Math.sin(a0 + (i * Math.PI) / 6) * s }); return r._bewohnerWand(P(), n()) ? "p" : r._bewohnerWand(n(), { x: q.x, z: q.z }) ? "q" : "."; }).join(""); // prettier-ignore
                            // wer auf dem Bein zum Punkt steht (vor ihm, näher als zwei Kapseln quer — `_bewohnerUm`), bis 8 m
                            const [hl, K2] = [Math.hypot(q.x - x, q.z - z), 2 * RW + 0.01];
                            const aufBein = liste.filter((o) => o !== b && !o.drinnen && o.leib && !o.weg).map((o) => { const [rx, rz] = [o.leib.position.x - x, o.leib.position.z - z]; return { wer: `${o.rolle} #${o.heim}`, vor: e1(((rx * (q.x - x) + rz * (q.z - z)) / hl)), quer: e1((rz * (q.x - x) - rx * (q.z - z)) / hl), platz: !!o.platz, amSteuer: !!o.amSteuer, wagen: o.wagen != null }; }).filter((c) => c.vor > 0 && c.vor < Math.min(hl, 8) && Math.abs(c.quer) < K2); // prettier-ignore
                            return { aufBein, frist: b.frist ? { weg: !!b.frist.weg, bis: e1(b.frist.bis - b.uhr) } : null, zumPunkt: !!r._bewohnerWand(P(), { x: q.x, z: q.z }), linie: [e1(e.x), e1(e.z)], zurLinie: !!r._bewohnerWand(P(), { x: e.x, z: e.z }), tempo: e1(b.tempo), je002: je(0.02), je013: je(0.13), je05: je(0.5), je1: je(1) }; // prettier-ignore
                        })(),
                    });
                }
                return (
                    ` · ${nb} Leiber um ihn` +
                    (c ? `, Wahl ${c.vx.toFixed(2)}/${c.vz.toFixed(2)}` : "") +
                    (b.weg ? `, Weg ${b.wi}/${b.weg.length}` : ", ohne Weg") +
                    (S && S.verkehr ? `, Fahrbahn ${!!r._verkehrAufSpur(S, x, z, 0)}` : ", kein Verkehr") +
                    (W ? `, Wagen ${W[1].typ} ${W[1].zustand} ${W[0].toFixed(1)} m v ${((W[1].entry._fahr || {}).vlong || 0).toFixed(1)} leibS ${(W[1].leibS || 0).toFixed(0)}` : "") // prettier-ignore
                );
            };
            const messen = (dt) => {
                minute += (dt / tagS) * 1440;
                const draus = liste.filter((b) => !b.drinnen).map((b) => b.leib.position);
                for (const b of liste) {
                    const P = b.leib.position;
                    const { x, z } = P;
                    const innen0 = b.drinnen ? b.orte.tuer.haus : null;
                    const sp =
                        wSpur.get(b) ||
                        wSpur
                            .set(b, { x, z, innen: innen0, ziel: b.ziel, n: new Set(), gesamt: 0, ax: x, az: z })
                            .get(b);
                    const d = ab(P, sp);
                    sp.gesamt += d;
                    if (d > 2 && Math.min(ab(sp, pm), ab(P, pm)) < nahR) WG.sprungN++;
                    // die Bauten um den Leib (Tür und Wand) fragt nur, wer draußen ist (Lehre 25), und er fragt, was die Kapsel des
                    // Spielers fragt: die Nachbarschaft ihres Radius (`_blockerNahe`, die Hülle jedes Baus, wie `_stepCharacterStructures`)
                    // — bis w4-stationen-schnell-a jeden Platz 4 m um ihn (`_blockerUmPlatz`), am Start-Dorf 25,3 s Messer je Tag statt 5,5
                    kandW.length = 0;
                    if (!b.drinnen) r._blockerNahe(x, z, RW + 1e-6, -Infinity, kandW);
                    let innen = innen0;
                    for (const e of kandW) {
                        const [t, l] = [kernVon(e), hausLage(e, x, z)];
                        if (t && Math.abs(l.x) < t.W / 2 - 1e-3 && Math.abs(l.z) < t.D / 2 - 1e-3) innen = e;
                    }
                    for (const e of innen === sp.innen ? [] : [sp.innen, innen].filter(Boolean)) {
                        WG.durch++;
                        if (durchTuer(e, sp.x, sp.z, x, z)) WG.tuer++;
                        else WG.falsch.push(`${b.rolle} #${b.heim} an ${nameVon(e)}`);
                    }
                    const fuss = P.y - A.PLAYER_FOOT_OFFSET * (b.groesse || 1);
                    const imLeib = (box) =>
                        box.topY > fuss + A.PLAYER_STEP_UP && box.botY < fuss + 1.7 * (b.groesse || 1);
                    const wand = kandW.find((e) =>
                        (e.blockerAABBs || []).some((q) => imLeib(q) && r._boxAbstand2(q, x, z) < RW * RW)
                    );
                    if (wand) WG.wand.set(nameVon(wand), (WG.wand.get(nameVon(wand)) || 0) + 1);
                    if (b.weg && !b.drinnen && d > 0) {
                        WG.geh++;
                        if (r._aufWeg(x, z, 0)) WG.aufWeg++;
                    }
                    // DER WEG DES TAGS: jede Wende seines Plans zwischen zwei Orten ≥ 2 m, einmal je Stunde der Wende
                    // (`tagAb`, `_bewohnerZiel`, gleich ab wo gesucht) — der Tag misst ≥ 24 Spielstunden, die Wende an
                    // seinem Rand zählt einmal; Beiseitetreten (`_bewohnerPlatz`), der Weg zurück und der gerückte Stand
                    // wechseln kein Ziel
                    if (b.ziel !== sp.ziel && ab(sp.ziel, b.ziel) >= 2) sp.n.add(((b.tagAb + 24) % 24).toFixed(4));
                    sp.ziel = b.ziel;
                    // (am Steuer gehört der Leib dem Wagen: ob er steckt, urteilt der Verkehr — gate:fahr-leben VK `fest`)
                    const da =
                        b.amSteuer || (b.drinnen ? !b.hinaus : !b.ziel || (!b.drinnenSoll && ab(P, b.ziel) < 1.5));
                    if (da || Math.hypot(x - sp.ax, z - sp.az) >= 1) Object.assign(sp, { ax: x, az: z, seit: minute });
                    // der Steckenbleiber beim Ort (w28-stadt-grammatik): wo er steht, wohin er will und an welchem Bau — bis hier nannte
                    // die Zeile nur Rolle, Haus und Stunde, der Täter (eine Gasse ohne Anschluss, eine Tür an der Wand) blieb zu suchen
                    else if (minute - sp.seit >= 5 && !sp.steckt)
                        stecken.push(
                            `${wann(b)} bei ${x.toFixed(1)}/${z.toFixed(1)}${b.drinnen ? " drinnen" : ""}` +
                                (b.ziel ? ` → ${b.ziel.x.toFixed(1)}/${b.ziel.z.toFixed(1)} (${ab(P, b.ziel).toFixed(1)} m${b.drinnenSoll ? ", ins Haus" : ""})` : "") +
                                (wand ? ` an ${nameVon(wand)}` : "") +
                                umstand(b, x, z)
                        );
                    // die Berührung: ein anderer Leib draußen näher als zwei Kapseln
                    const nah =
                        !b.drinnen && draus.some((q) => q !== P && Math.abs(q.x - x) < 2 * RW && ab(q, P) < 2 * RW);
                    if (nah && !sp.nah) beruehr.push(wann(b));
                    Object.assign(sp, { x, z, innen, nah, steckt: !da && minute - sp.seit >= 5 });
                }
            };
            // die Zahl: die Wand je Bau, die Tür, die Wege und die Strecke je Leib, Steckenbleiber, Berührung (je die ersten vier)
            const zahl = () => {
                const je = liste.map((b) => ({ wer: wer(b), ...wSpur.get(b) }));
                const vier = (n, l) => ({ [n + "N"]: l.length, [n]: l.slice(0, 4) });
                return {
                    wandN: [...WG.wand.values()].reduce(addiere, 0),
                    wand: [...WG.wand]
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 4)
                        .map(([n, k]) => `${n}: ${k}`),
                    durch: WG.durch,
                    tuer: WG.tuer,
                    falsch: WG.falsch.slice(0, 4),
                    aufWeg: WG.geh ? q3(WG.aufWeg / WG.geh) : null,
                    sprungN: WG.sprungN,
                    wegeMin: Math.min(...je.map((q) => q.n.size)),
                    wegeMax: Math.max(...je.map((q) => q.n.size)),
                    streckeMin: Math.round(Math.min(...je.map((q) => q.gesamt))),
                    ...vier(
                        "ausser",
                        je.filter((q) => q.n.size < 4 || q.n.size > 10).map((q) => `${q.wer}: ${q.n.size}`)
                    ),
                    ...vier(
                        "kurz",
                        je.filter((q) => !(q.gesamt >= 100)).map((q) => `${q.wer}: ${Math.round(q.gesamt)} m`)
                    ),
                    ...vier("stecken", stecken),
                    ...(akten.length ? { steckAkte: akten, steckPlan: steckPlan() } : null),
                    ...vier("beruehr", beruehr),
                };
            };
            return { messen, zahl, wSpur };
        };
        // der Takt mit der Uhr des Spiels (`tickDayNight`) und die Wege seiner Siedlung (`wegeMesser`)
        const takt = (dt, M) => {
            r._uhrSetzen((s.timeOfDay + dt / tagS) % 1, "uhr");
            const t0 = performance.now();
            leute(dt);
            M.messen(dt, performance.now() - t0);
        };
        // DER NAH-RING (mensch.K1 Staffel 2), ein Messer wie `wegeMesser`: Bewohner gesamt, im Nah-Ring (draußen, näher
        // als die Feld-Grenze der Menge `_feldGrenzen(true).ein`: dort trägt ihn der Satz) und davon mit laufendem Gang (die Phase
        // lief in den letzten 10 Takten über 0,2 rad) — gezählt unter der Decke des Täters
        // DIE MENGE (mensch.K4 Staffel 2) im selben Messer, roh — das Urteil fällt in der Station: die 50 Nächsten draußen, je
        // Bewohner [Same, Typ, Höhe, Breite, Tiefe, nah, Farben] (die Matrix seines Satzes und seine eigenen Farben — Haut, Haar,
        // Tracht: die Palette, die Leib, Satz und Feld zeigen), je Typ seine Dials (die Form: Geschlecht, Bau, Schnitt, Alter), die
        // Maße seiner Vorlage in m (in der Ruhe × die Skala seines Rigs) und die Dreiecke seiner Senken (leib, wurf), der Schirm
        // (Bildpunkte je m am Rand der Nah-Wahl), der Takt `_tickBewohner` (Mittel, p95 in ms)
        const ringMesser = (liste, ph = new Map(), k = 0, ms = []) => ({
            messen: (dt, t) => (ms.push(t), ++k === 591 && liste.forEach((b) => ph.set(b, b.walkPhase))),
            zahl: (N = r._feldGrenzen(true).ein) => {
                const nah = liste.filter((b) => !b.drinnen && ab(b.leib.position, pm) < N);
                const gang = nah.filter((b) => Math.abs(wrap(b.walkPhase - ph.get(b))) > 0.2).length;
                return { gesamt: liste.filter((b) => b.leib).length, ring: q3(N), nah: nah.length, nahGang: gang };
            },
            menge: (S) => {
                const M = liste.filter((b) => b.leib && !b.drinnen).sort((a, b) => ab(a.leib.position, pm) - ab(b.leib.position, pm)).slice(0, 50); // prettier-ignore
                const f = M[0].leib.userData._tierBaum.wrap.scale.x;
                ms.sort(aufsteigend);
                // die Dreiecke der Senken des EINEN Satzes der Siedlung (Leib, Wurf) — jeder Typ zeichnet in ihm
                const dreiecke = ["leib", "wurf"].map((k) => S.satz[k].geometry.index.count / 3);
                return {
                    je: M.map((b) => [b.seed, b.gestalt, b.groesse, b.breite, b.tiefe, !!b.nah, b.farben]),
                    // je Typ (die Gestalt der Nah-Wahl, Stufen 0 und 1) seine Dials und der Kasten seiner Grobstufe
                    typ: S.gestalten.map((G) => ({
                        dials: G.dK,
                        mass: new T.Box3().setFromObject(r._ofenMenschTemplate(G.dK, G.f.skin, G.f.hair, 1).root).getSize(new T.Vector3()).multiplyScalar(f).toArray(), // prettier-ignore
                        dreiecke,
                    })),
                    pxM: r._schirm().pxJeM / A.BEWOHNER.nahM,
                    kaskaden: A.SCHATTEN_KASKADE.texelM.length,
                    takt: [q3(ms.reduce(addiere, 0) / ms.length), q3(rang(ms, 0.95))],
                };
            },
        });
        // ── DIE STADT AM MESSORT `ort` des Profi-Bands (spec/profiband/haushalt.json): das Wort des Spielers
        // „dorf <Same> <nH>" an ihrem Anker (`spawnSettlement`), der Spieler am Rand ihres Platzes, bis jeder Bewohner
        // seinen Leib trägt; dann je Täter (Selbsttest) ein Fenster mit seiner Decke: die Uhr springt auf ihre Stunde (jeder
        // steht, wo ihn sein Tag sieht), ihre Takte mit der Uhr des Spiels und ihr Messer.
        // · stadt (mensch.K3 Staffel 2): „dorf <Same> 30" (nH ≥ 27 wie mensch.K1), 5 Uhr, 24 Spielstunden (der Täter: 3),
        //   das Wege-Messer. Täter: wer ausweicht, weicht nie · die EINE Frage an die Wand (`_bewohnerWand`: der Weg, die
        //   Wache, das Ausweichen, die Linie zurück auf das Bein) ist blind
        // · stadt-voll (mensch.K1 Staffel 2, `--ort stadt-voll`): „dorf 7 300" (die Metropole), der Spieler an ihrem
        //   Ursprung am Markt im Gedränge (am Rand des Platzes stehen 81 statt 136 im Nah-Ring), 7 Uhr (der Morgengang über
        //   den Platz), 600 Takte zu 1/60 s, der Nah-Ring. Täter: der Gang steht (`_gaitTick` ohne Tempo und Zeit) · der
        //   Nah-Ring ist leer (die Feld-Grenze 0)
        // DER RAUM DER STÄNDE (mensch.K3 Staffel 2, `_bewohnerStandPruefen`; Stand: wer einen Ursprung trägt): je zwei Stände der
        // Liste liegen ≥ `raumM` auseinander und jeder ≥ `raumM` vom Punkt vor jeder Tür (`orte.vor`: über ihn geht jeder hinein
        // und hinaus), auch die aus der Hülle oder der Spur gerückten — sonst findet, wer Platz machte, seinen Stand nie frei,
        // und wer heimkommt, steht vor dem Stehenden (w28-stadt-grammatik: 3 Steckenbleiber vor wohnhaus #91693)
        const standRaum = (liste) => {
            const staende = [...new Set(liste.flatMap((b) => Object.values(b.orte)))].filter((o) => o?.ur);
            const tueren = [...new Set(liste.map((b) => b.orte.vor))];
            const nah = (p, q) => (ab(p, q) < A.BEWOHNER.raumM - 1e-6 ? [`${q3(p.x)}/${q3(p.z)}${q.ur ? "" : " vor einer Tür"}`] : []); // prettier-ignore
            return staende.flatMap((p, i) => [...staende.slice(i + 1), ...tueren].flatMap((q) => nah(p, q)));
        };
        const stadtTag = async (ort = "stadt") => {
            const G = await stadtAm(ort, "bewohner");
            if (G.fehler) return G;
            const { S, da, nH, voll } = G;
            const T = voll
                ? [
                      ["bewohner-voll-starr", "_gaitTick", (alt) => (g, h, v, d, q) => alt.call(r, g, h, 0, 0, q)],
                      ["bewohner-voll-leer", "_feldGrenzen", () => () => ({ erste: 3, grenzen: [] })],
                  ]
                : [
                      ["bewohner-stadt-rempeln", "_bewohnerAusweichen"],
                      ["bewohner-stadt-blind", "_bewohnerWand"],
                  ];
            for (const [t, ueber, mit = () => () => null] of taeter ? T : [[]]) {
                const [ab, M] = [[], (voll ? ringMesser : wegeMesser)(S.liste)];
                await uhrAuf(voll ? 7 : 5, `bewohner: ${ort}`, da, 4 * nH);
                if (ueber) decke(ueber, mit, ab);
                for (let i = 0; i < (voll ? 600 : (taeter ? 30 : 240) * takte); i++) takt(voll ? 1 / 60 : DT, M);
                sicht[t] = {
                    stadt: {
                        haeuser: haeuserIn(S.plan.slots, S.ox, S.oz).length,
                        [voll ? "ring" : "wege"]: M.zahl(),
                        menge: voll ? M.menge(S) : undefined,
                        stapel: voll ? undefined : standRaum(S.liste),
                    },
                };
                for (const f of ab) f();
            }
            return taeter ? null : sicht[undefined].stadt;
        };
        const haeuserIn = (slots, ox, oz) =>
            slots.filter((sl) =>
                s.architectures.some(
                    (e) => e && e.seed >>> 0 === sl.seed >>> 0 && ab(e.position, { x: ox + sl.x, z: oz + sl.z }) < 1
                )
            );
        // DER ORT der Probe (`--ort`): ein Messort mit Gründung (stadt · stadt-voll) misst seine Stadt, der Genesis-Ort sein
        // Start-Dorf (das Dorf, das der Wirt dort baut); ohne Ort beide — das Start-Dorf, dann die Stadt am Messort stadt
        const ort = opts && opts.ort;
        if (ort && ort !== "genesis") return { stadt: await stadtTag(ort), sicht: taeter ? sicht : undefined };
        const S = await startDorf(restore);
        const plan = S.plan;
        const hausE = s.architectures.filter((e) => e?.tuer && plan.slots.some((sl) => e.seed >>> 0 === sl.seed >>> 0));
        const haeuser = haeuserIn(plan.slots, S.ox, S.oz).map((sl) => ({
            seed: sl.seed >>> 0,
            rolle: sl.rolle,
            kultur: sl.kultur,
            soll: FC.leuteVon(sl.ov),
        }));
        const pz = plan.platz;
        const rand = amPlatz(S.ox, S.oz, pz);
        if (!rand) return { fehler: "kein freier Stand am Rand des Dorfplatzes" };
        const { pc, ax, az } = rand;
        const leiber = () => s.scene.children.filter((o) => o?.userData && o.userData.rig && o.userData.heim != null);
        const sollSumme = haeuser.reduce((a, h) => a + (h.soll || 0), 0);
        // mit Bild trägt jeder Leib draußen sein Feld (`_weltOffen().leiber`), jedes Haus die Hülle seines Studios — bricht der
        // Deckel, bricht die Probe bei seinem Namen (nie misst die Quote ein halb geborenes Dorf)
        await bisDa(
            "bewohner: die Leiber",
            () => leiber().length < sollSumme || r._weltOffen().leiber > 0 || hausE.some((e) => !e._hausHuelle)
        );
        await stehtUm("bewohner: das Start-Dorf");
        // Täter (Selbsttest), gezählt und zurück: die Leiber des ersten bewohnten Hauses fallen aus der Szene
        const h1 = haeuser.find((x) => x.soll > 0);
        const fort = leiber().filter((b) => hat("bewohner-haus") && h1 && b.userData.heim === h1.seed);
        for (const b of fort) s.scene.remove(b);
        const L = leiber();
        // Täter (Selbsttest), gezählt und zurück: jeder Bewohner zeichnet seinen eigenen Leib (Befehle je Kopf)
        const sah = L.map((b) => b.visible);
        if (hat("bewohner-menge")) for (const b of L) b.visible = true;
        const jeHaus = new Map();
        for (const b of L) jeHaus.set(b.userData.heim, (jeHaus.get(b.userData.heim) || 0) + 1);
        const leer = haeuser
            .filter((h) => h.soll > 0 && !jeHaus.get(h.seed))
            .map((h) => `${h.rolle} ${h.kultur} #${h.seed}: 0 von ${h.soll}`);
        const alsLeibStart = L.filter((b) => b.visible && !b.userData._drinnen).length;
        L.forEach((b, i) => (b.visible = sah[i]));
        for (const b of fort) s.scene.add(b);
        const cam = s.camera;
        const gezeichnet = (b) => b.visible || b.userData._satz === true || r._kzBesitztFeld(b);
        const blickZaehlen = (sicht, zaehlt) => {
            const auge = new T.Vector3(pm.x, pm.y + 0.9, pm.z);
            if (sicht !== "ego") auge.set(pm.x - ax * THIRD_M, pm.y + 2.6, pm.z - az * THIRD_M);
            cam.position.copy(auge);
            cam.lookAt(pc.x, pm.y + 0.6, pc.z);
            cam.updateMatrixWorld(true);
            r._lodAugeGesetzt(); // der Schuss setzt das Auge der Stufen wie die Kamera der Bühne (`kamera`)
            return zaehlt.filter((b) => {
                const [x, y, z] = [b.position.x, b.position.y + 0.4, b.position.z];
                const d = auge.distanceTo({ x, y, z });
                if (!gezeichnet(b) || !imBlick(x, y, z) || d > cam.far) return false;
                for (let t = 0.6; t < d - 0.6; t += 0.5)
                    if (r._imGrundriss(auge.x + ((x - auge.x) * t) / d, auge.z + ((z - auge.z) * t) / d, 0) === "haus")
                        return false;
                return true;
            });
        };
        // ── DER TAG (mensch.K2): je Ereignis (0,1 Spielstunden) die Soll-Orte (`tagesPlan`) jedes Leibs, je Takt Sprung und Weg
        const KC = window.__koerperCore;
        const planFn = KC && typeof KC.tagesPlan === "function" ? KC.tagesPlan : null;
        const liste = (S.liste || []).filter((b) => L.includes(b.leib));
        const tag0 = s.timeOfDay;
        restore.push(() => r._uhrSetzen(tag0, "regler"));
        // der Tag beginnt um 12,5 Uhr: die Wiederkehr prüft je 1,5 h (14 · 15,5 · 17 … 5 · 6,5 · 8 … 12,5) am Rand des
        // Feierabends, des Wachens und der Arbeit — dort, wo die Menge im Strom geht
        const alleDa = () => liste.every((b) => b.leib && !b.ankunft);
        await uhrAuf(12.5, "bewohner: der Tag", alleDa);
        // Täter (Selbsttest): der Tag beginnt mit Geschichte — die Bewohner gehen 12 s auf der Uhr von 12,5, ohne Sprung
        if (hat("bewohner-uhr")) for (let k = 0; k < 120; k++) leute(DT);
        const SD = wegeMesser(liste);
        const treffer = new Map();
        const vorher = new Map();
        // DER TAG BEGINNT MIT DEM SPRUNG (`uhrAuf`): der Takt der Bewohner lief seit ihm 0 s (`taktUhr`)
        const z = { alsLeib: alsLeibStart, schmiede10: null, schmiede2: null, tagTakt: q3(S.taktUhr) };
        let blick10 = [[], []];
        let planGleich = !!planFn;
        const stationen = liste.filter((b) => b.rolle === "schmiede" && b.orte.werk).map((b) => b.orte.werk);
        const anStation = () => L.filter((g) => gezeichnet(g) && stationen.some((o) => ab(g.position, o) < 1.5)).length;
        // DER GANG IM SATZ: der Fuß jedes gehenden Satz-Bewohners (`satzGang`), je Seite Ferse und Ballen der Sohle
        const saetze = () => s.scene.children.filter((o) => o && o.name === "bewohner-satz" && o.isInstancedMesh);
        const fussIx = (geo) => {
            const P = geo.attributes.position;
            const [fuss, Y] = [
                [
                    [-1, -1],
                    [-1, -1],
                ],
                [],
            ];
            for (let v = 0; v < P.count; v++) Y.push(P.getY(v));
            const ymin = Math.min(...Y);
            for (let v = 0; v < P.count; v++) {
                if (Y[v] > ymin + 0.03) continue;
                const f = fuss[P.getX(v) < 0 ? 0 : 1];
                if (f[0] < 0 || P.getZ(v) < P.getZ(f[0])) f[0] = v;
                if (f[1] < 0 || P.getZ(v) > P.getZ(f[1])) f[1] = v;
            }
            // die Sohle liegt PLAYER_FOOT_OFFSET unter dem Ursprung des Leibs — die Haut endet am Knöchel
            return ymin > -A.PLAYER_FOOT_OFFSET + 0.03 ? null : fuss;
        };
        let gehend = [];
        const gang = satzGang(fussIx, (x, z) => {
            const b = gehend.find((q) => ab({ x, z }, q.leib.position) <= 1e-3);
            const g = b && b.leib;
            return b
                ? {
                      key: b.same,
                      bein: (b.beinL || 0.9) / (b.groesse || 1),
                      x: g.position.x,
                      z: g.position.z,
                      ry: g.rotation.y,
                  }
                : null;
        });
        const gangMessen = (SZ) => {
            gehend = liste.filter((b) => b.weg && b.leib && b.leib.userData._satz === true);
            if (gehend.length) gang.messen(SZ);
        };
        // DER BLICK DER STEHENDEN (mensch.K2): am Platz zur Mitte, vor einer Tür vom Haus fort; die Streuung je Sektor von 30°
        const blicke = { n: 0, treffer: 0, sektor: new Array(12).fill(0) };
        const blickMessen = () => {
            for (const b of liste) {
                const g = b.leib;
                if (!g || !b.da || b.drinnen || !gezeichnet(g) || !b.ziel) continue;
                if (hat("bewohner-nord")) g.rotation.y = 0;
                const o = b.orte;
                const th = g.rotation.y;
                blicke.sektor[((Math.round(th / (Math.PI / 6)) % 12) + 12) % 12]++;
                // (der Stand im Ring vor einer Tür — der eigenen, der seines Werks, seines Tischs, seines Besuchs — trägt sie als `anker`)
                const soll =
                    b.ziel === o.platz
                        ? Math.atan2(pc.x - g.position.x, pc.z - g.position.z)
                        : b.ziel.anker
                          ? Math.atan2(g.position.x - b.ziel.anker.x, g.position.z - b.ziel.anker.z)
                          : null;
                if (soll === null) continue;
                blicke.n++;
                const d = th - soll;
                if (Math.abs(wrap(d)) <= 1.3) blicke.treffer++;
            }
        };
        // DER PLATZ (mensch.K2): jeder hat einen Stand am Platz, seinem Rand oder seinen Gassen (bis 12 m über ihn hinaus) — auch
        // wo die Spur der Wagen ihn trifft: trägt der Platz neben ihr keinen Ort seines Gesetzes, fällt der Stand
        // (`_bewohnerOhneStand`), und die Linse nennt den Plan, der zu wenig Platz bietet, an seinen Leuten
        // Täter (Selbsttest), gezählt und zurück: sechs ohne Platz
        const platz6 = liste.slice(0, 6).map((b) => b.orte.platz);
        if (hat("bewohner-daheim")) for (const b of liste.slice(0, 6)) b.orte.platz = null;
        const platzR = Math.hypot(pz.ex, pz.ez) + 12;
        const ohnePlatz = liste.filter((b) => !(b.orte.platz && ab(b.orte.platz, pc) <= platzR));
        platz6.forEach((p, i) => (liste[i].orte.platz = p));
        // DIE WIEDERKEHR (mensch.K2 Staffel 2): wer blieb, sah jede Lage; wer nach 1 h Abwesenheit kommt, findet sie (≤ 2 m)
        const Sx = () => r._bewohnerSiedlungen.get(S.key).liste || [];
        const lagen = () => new Map(Sx().map((b) => [`${wer(b)}:${b.same}`, b.leib && b.leib.position.clone()]));
        const blieb = new Map();
        for (let i = 1; i <= 240; i++) {
            const stunde = (s.timeOfDay * 24 + 0.1) % 24;
            const um = (h) => Math.abs(stunde - h) < 0.05;
            const SZ = saetze();
            for (let k = 0; k < takte; k++) takt(DT, SD);
            // DAS GANG-FENSTER: die Wege zum Werk, zum Platz, nach Hause, 10 s zu 1/60 s
            if ([7.5, 12, 17.2].some(um)) {
                gang.luecke(); // das Fenster beginnt jede Spur neu
                for (let k = 0; k < 600; k++) {
                    takt(1 / 60, SD);
                    // Täter (Selbsttest): jede Instanz des Satzes steht in der Phase 0
                    if (hat("bewohner-gleiten"))
                        for (const m of SZ) {
                            const a = m.geometry.attributes.aGang;
                            if (a) for (let q = 0; q < a.count; q++) a.setX(q, 0);
                        }
                    gangMessen(SZ);
                }
            }
            z.alsLeib = Math.max(z.alsLeib, L.filter((g) => g.visible && !g.userData._drinnen).length);
            // die Soll-Orte: am Ort (≤ 1,5 m, gezeichnet) · drinnen (an der Tür) · unterwegs (sein Weg zu DIESEM Soll begann
            // eben oder schrumpfte um die Hälfte dessen, was sein Tempo seit dem letzten Ereignis trägt)
            for (const b of planFn ? liste : []) {
                const o = b.orte;
                const sh = (stunde + (hat("bewohner-plan6") ? 6 : 0)) % 24;
                const planJetzt = () => planFn(b.same, b.rolle, sh, o);
                const soll = planJetzt();
                if (JSON.stringify(soll) !== JSON.stringify(planJetzt())) planGleich = false;
                const ziel = soll.drinnen ? o.tuer : soll.ort;
                const g = b.leib;
                const alt = vorher.get(b);
                const rest = b.ziel === ziel && Number.isFinite(b.wegRest) ? b.wegRest : null;
                const unterwegs =
                    rest !== null && (!alt || alt.ziel !== ziel || alt.rest - rest >= 0.5 * b.tempo * takte * DT);
                const da = ab(g.position, ziel) < 1.5 && gezeichnet(g) !== soll.drinnen;
                treffer.set(b, (treffer.get(b) || 0) + (da || unterwegs ? 1 / 240 : 0));
                vorher.set(b, { ziel: b.ziel, rest });
            }
            if (um(10)) {
                z.schmiede10 = anStation();
                blick10 = [blickZaehlen("ego", L), blickZaehlen("third", L)];
            }
            if ([10, 12.5, 19].some(um)) blickMessen();
            if (um(2)) z.schmiede2 = anStation();
            if (i % 15 === 0) blieb.set(s.timeOfDay * 24, lagen()); // je 1,5 h
        }
        // gezählt: ein Leib mit Rig, der im Tag ging
        const gegangen = (g) => liste.some((b) => b.leib === g && SD.wSpur.get(b).gesamt > 0.5);
        // DIE STÄNDE (`standRaum`). Täter (Selbsttest), gezählt und zurück: der zweite Stand 0,3 m neben dem Punkt vor der ersten Tür
        const [s1, v0] = [liste.flatMap((b) => Object.values(b.orte)).filter((o) => o?.ur)[1], liste[0].orte.vor];
        const alt = [s1.x, s1.z];
        if (hat("bewohner-stapel")) [s1.x, s1.z] = [v0.x + 0.3, v0.z];
        const stapel = standRaum(liste);
        [s1.x, s1.z] = alt;
        const unter = liste.filter((b) => !(treffer.get(b) >= 0.9));
        // der Heimkehrer geht 1 h vor jeder Prüf-Stunde fort und findet die neu Geborenen (Takt 0). Täter: geboren am Ziel
        const wiederkehr = async () => {
            const ab0 = [];
            if (hat("bewohner-wiederkehr")) decke("_bewohnerAnkunft", () => () => {}, ab0);
            const [ueber, P] = [[], pm.clone()];
            let [n, maxM] = [0, 0];
            for (const [T, sah] of blieb) {
                pm.x = P.x + A.AUTO_SETTLEMENT.nearM * A.BEWOHNER.fernFaktor + 80;
                r._uhrSetzen(((T + 23) / 24) % 1, "regler");
                leute(0); // fern gehen die Leiber
                r._uhrSetzen(T / 24, "regler");
                pm.copy(P);
                // die Vorlagen der Gestalten kommen aus dem Faden zurück (die Fortgegangenen gaben sie frei): die Freigabe
                // der Foundry wie je Bild, die Uhr steht — das Werk der Leute ohne Zeit (`leuteTakt`), bis jeder zurück ist
                for (const weiter = W.__deckel("bewohner: die Wiederkehr", 60); weiter(); await sleep())
                    if (
                        (r._tickFoundryIngest(),
                        leuteTakt(),
                        Sx().length && Sx().every((b) => b.leib !== null && !b.ankunft))
                    )
                        break;
                const kam = lagen();
                for (const [id, v] of sah) {
                    const d = v && kam.get(id) ? kam.get(id).distanceTo(v) : NaN;
                    [n, maxM] = [n + 1, Math.max(maxM, d)];
                    if (!(d <= 2)) ueber.push(`${id} um ${q3(T)} Uhr ${q3(d)} m`);
                }
            }
            for (const f of ab0) f();
            return { n, maxM: q3(maxM), ueberN: ueber.length, ueber: ueber.slice(0, 5) };
        };
        // Täter (Selbsttest) im eigenen Fenster nach dem Tag: der Teleport an den Soll-Ort, eine Spielstunde nach der Ankunft
        // um 7 Uhr, mit eigenem Messer
        if (hat("bewohner-sprung")) {
            await uhrAuf(7, "bewohner: der Morgen", alleDa);
            const SP = wegeMesser(liste);
            for (let k = 0; k < 10 * takte; k++) {
                takt(DT, SP);
                for (const b of liste) if (b.ziel) b.leib.position.set(b.ziel.x, b.leib.position.y, b.ziel.z);
            }
            sicht["bewohner-sprung"] = { wege: SP.zahl() };
        }
        return Object.assign(z, {
            haeuser: haeuser.length,
            sollSumme,
            leiber: L.length,
            quote: sollSumme > 0 ? q3(L.length / sollSumme) : null,
            leer: leer.slice(0, 6),
            leerN: leer.length,
            imBlick: {
                ego: blick10[0].filter(gegangen).length,
                third: blick10[1].filter(gegangen).length,
            },
            nahLeiber: A.BEWOHNER.nahLeiber,
            planGleich,
            trefferMin: liste.length ? q3(Math.min(...liste.map((b) => treffer.get(b) || 0))) : null,
            unter: unter.slice(0, 5).map((b) => `${wer(b)}: ${Math.round((treffer.get(b) || 0) * 100)} %`),
            unterN: unter.length,
            stationen: stationen.length,
            satzGang: gang.schlupf(),
            blick: {
                n: blicke.n,
                quote: blicke.n ? q3(blicke.treffer / blicke.n) : null,
                sektorMax: q3(Math.max(...blicke.sektor) / Math.max(1, blicke.sektor.reduce(addiere, 0))),
            },
            ohnePlatz: ohnePlatz.length,
            ohnePlatzWer: ohnePlatz.slice(0, 4).map(wer),
            stapel,
            huellen: hausE.filter((e) => e._hausHuelle).length,
            wege: SD.zahl(),
            wiederkehr: await wiederkehr(),
            stadt: ort ? undefined : await stadtTag(),
            sicht: taeter ? sicht : undefined,
        });
    });

    // ── begegnung (mensch.K5 Staffel 1, ohne Modell): im Start-Dorf um 10 Uhr (Uhr und Wetter als Wort des Reglers) ein Bewohner,
    // der an seinem Ort steht; der Spieler geht in Ego mit 1,4 m/s aus 9 m schräg vor ihm (der Weg frei von Grundriss und
    // fremdem Stand) durch seinen Stand und 12 m weiter (der Vorbeigang 2 m daneben), dann steht er, bis der Bewohner wieder an
    // seinem Ort steht. Je Gang ab dem Ereignis (der Spieler auf `begegnungM`) die Zeit, bis der Kopf-Knoten (seine
    // Welt-Matrix, wie das Bild ihn zeichnet; im Fenster nach dem echten Frame `_loopRender`) auf 10° zum Spieler zeigt; der
    // kleinste Abstand des Spielers zu ihm und jede Berührung (näher als zwei Kapseln) mit jedem Bewohner draußen. Der
    // Vorbeigang und zwei Gänge ohne Erinnerung (der dritte die Gegenprobe), dann schlägt der Spieler ein Wesen 5 m neben ihm
    // (`damageCreature`, Quelle Spieler), dann der vierte Gang.
    // Täter (Selbsttest, EIN Lauf): der starre Kopf · wer steht, macht keinen Platz · der Zeuge vergisst.
    await buehne("begegnung", async (restore) => {
        const [dt, tag0] = [1 / 60, s.timeOfDay];
        const S = await startDorf(restore);
        const stell = (x, z) => pm.set(x, r.getTerrainHeightAt(x, z) + A.PLAYER_FOOT_OFFSET, z);
        stell(S.ox + S.plan.platz.cx, S.oz + S.plan.platz.cz);
        restore.push(() => r._uhrSetzen(tag0, "regler"));
        r._setWeather("sunny", "regler");
        const da = angekommen(S);
        await bisDa("begegnung: die Leiber", () => !da());
        await uhrAuf(10, "begegnung: 10 Uhr", da);
        await stehtUm("begegnung: das Start-Dorf");
        const schritt = () => [takt(dt), leute(dt)];
        // DER WEG: aus 9 m schräg vor ihm (± 0,6 rad zu seinem Blick) durch seinen Stand und 12 m weiter, je halben Meter frei
        // von Grundriss — und derselbe 2 m daneben (der Vorbeigang); wer sonst dort steht, macht dem Spieler Platz
        const offen = (x, z) => r._landAt(x, z) && !["haus", "bau"].includes(r._imGrundriss(x, z, 0.5));
        const frei = (a, u) => [...Array(43).keys()].every((t) => offen(a.x + (u.x * t) / 2, a.z + (u.z * t) / 2));
        // der Vorbeigang 2 m daneben auf der Seite, die die Peilung auf 3 m weitet: ±0,6 rad + atan(2/√5) ≈ 76° neben seinem Blick
        // (der Kopf muss sich wenden, der Leib nicht)
        let [b, w] = [];
        for (const k of S.liste)
            for (const dw of [0.6, -0.6]) {
                const u = { x: -Math.sin(k.leib.rotation.y + dw), z: -Math.cos(k.leib.rotation.y + dw) };
                const [a, v] = [{ x: k.leib.position.x - u.x * 9, z: k.leib.position.z - u.z * 9 }, { x: -2 * Math.sign(dw) * u.z, z: 2 * Math.sign(dw) * u.x }]; // prettier-ignore
                if (!b && !k.drinnen && !k.weg && k.da && frei(a, u) && frei({ x: a.x + v.x, z: a.z + v.z }, u))
                    [b, w] = [k, { a, u, v }];
            }
        if (!b) return { fehler: "kein Stehender mit freiem Weg um 10 Uhr" };
        const [g, stand] = [b.leib, b.ziel];
        // DER KOPF IM BILD: seine Welt-Matrix (die dritte Spalte: wohin das Gesicht zeigt) gegen den Spieler
        const kopf = () => g.userData.rig.head.matrixWorld.elements;
        const gier = (e = kopf()) =>
            Math.abs(grad(wrap(Math.atan2(pm.x - e[12], pm.z - e[14]) - Math.atan2(e[8], e[10]))));
        // EIN GANG (versatz quer zum Weg): je Takt der Kreatur-Takt und die Bewohner, im Fenster der echte Frame aus Ego
        const gang = (v) => {
            const a = { x: w.a.x + w.v.x * v, z: w.a.z + w.v.z * v };
            stell(a.x, a.z);
            r._spielerLageAlt = null;
            for (let i = 0; i < 60; i++) schritt();
            const z = { zuS: null, dMin: 99, beruehrt: 0, imBild: null };
            for (let l = 0, t = 0, e = null; l <= 21; l += 1.4 * dt, t += dt) {
                stell(a.x + w.u.x * l, a.z + w.u.z * l); // der Lauf: der Kreatur-Takt liest ihn aus der Lage
                schritt();
                if (echt) [kamera(w.u.x, w.u.z), r._loopRender()];
                const d = ab(pm, g.position);
                z.dMin = Math.min(z.dMin, Math.round(d * 1000) / 1000);
                z.beruehrt += S.liste.filter((o) => !o.drinnen && ab(pm, o.leib.position) < 2 * A.PLAYER_WALL_RADIUS).length; // prettier-ignore
                if (e === null && d <= A.BEWOHNER.begegnungM) [e, z.amEreignis] = [t, Math.round(gier())];
                if (e !== null && z.zuS === null && gier() <= 10)
                    [z.zuS, z.imBild] = [Math.round((t - e) * 1000) / 1000, !!b.nah && (!echt || (g.visible && imBlick(kopf()[12], kopf()[13], kopf()[14])))]; // prettier-ignore
            }
            // der Spieler steht am Ende, bis der Bewohner wieder an seinem Ort steht
            for (let i = 0; i < 1800 && !(b.da && !b.weg && !b.platz && ab(g.position, stand) < 0.5); i++) schritt();
            return z;
        };
        // DER LAUF: der Vorbeigang, zwei Gänge ohne Erinnerung, der Schlag 5 m neben ihm, der vierte Gang
        const lauf = () => {
            g.userData.memory = [];
            const G = [gang(1), gang(0), gang(0)];
            const ort = spirale(stand.x + 5 - P0.x, stand.z - P0.z, 4, 1.5, (x, z) => offen(x, z) && neben(x, z));
            r.damageCreature(tier(ort, "wesen"), 1e9, { source: "player" }); // ohne Ort wirft der Wurf beim Namen
            const furcht = r._kreaturFurchtErinnert(g);
            G.push(gang(0));
            const je = (k) => G.map((x) => x[k]);
            return {
                ...{ wer: wer(b), furcht, zuS: je("zuS"), amEreignis: G[0].amEreignis },
                ...{ imBild: je("imBild"), dMin: je("dMin"), beruehrt: je("beruehrt") },
            };
        };
        if (!taeter) return lauf();
        const sicht = {};
        for (const [t, name] of Object.entries({
            "begegnung-starr": "_bewohnerKopf",
            "begegnung-steht": "_bewohnerPlatz",
            "begegnung-vergessen": "_bewohnerZeuge",
        })) {
            const zurueck = [];
            decke(name, () => () => false, zurueck);
            if ([].concat(taeter).includes(t)) sicht[t] = lauf();
            for (const f of zurueck) f();
        }
        return { sicht };
    });
}

// DAS URTEIL (Node) der Proben des Menschen: `soll(bedingung, text)` sammelt im Urteil von kreatur-proben.cjs
function menschUrteil(name, z, soll) {
    // DIE WEGE (mensch.K3) je Siedlung — das Start-Dorf und die Stadt (Staffel 2: nH ≥ 27): keine Kapsel in einer Wand, jeder
    // Durchgang durch die Tür, 4–10 Wege, 24 Spielstunden ohne Steckenbleiber, auf Wegen ≥ 0,85, ≥ 100 m je Bewohner und
    // Tag, keine Berührung
    const st = name === "bewohner" ? z.stadt : null;
    if (st) soll(!st.fehler && st.haeuser >= 27, `Stadt: ${st.fehler || st.haeuser + " Häuser (Soll nH ≥ 27)"}`);
    if (st && st.stapel) soll(!st.stapel.length, `Stadt: Stände gestapelt: ${st.stapel.length} näher als raumM (${st.stapel.slice(0, 4)})`); // prettier-ignore
    // DIE VOLLE STADT (mensch.K1 Staffel 2, ihr Nah-Ring): ≥ 200 Bewohner, ≥ 40 im Nah-Ring mit laufendem Gang
    const ri = st && st.ring;
    if (ri)
        soll(
            ri.gesamt >= 200 && ri.nahGang >= 40,
            `Stadt: ${ri.gesamt} Bewohner, im Nah-Ring ${ri.nah} draußen, ${ri.nahGang} mit laufendem Gang (Soll ≥ 200, ≥ 40)`
        );
    for (const [v, wo] of [
        [name === "bewohner" && z.wege, ""],
        [st && st.wege, "Stadt: "],
    ]) {
        if (!v) continue;
        soll(v.wandN === 0, `${wo}Durchdringung: ${v.wandN} Takte in einer Wand (${v.wand})`);
        soll(
            v.durch > 0 && v.tuer === v.durch,
            `${wo}nicht über die Tür: ${v.durch - v.tuer} von ${v.durch} (${v.falsch})`
        );
        soll(
            !v.ausserN && !v.steckenN && v.aufWeg >= 0.85 && !v.kurzN && !v.beruehrN,
            `${wo}Wege ${v.wegeMin}–${v.wegeMax} (${v.ausser}), ${v.steckenN} Steckenbleiber (${v.stecken}), auf Wegen ${v.aufWeg} (Soll ≥ 0,85), Strecke min ${v.streckeMin} m (Soll ≥ 100 je Tag: ${v.kurz}), Berührung: ${v.beruehrN} (${v.beruehr})`
        );
    }
    // das Start-Dorf (ohne `--ort` und am Genesis-Ort: seine Wege)
    if (name === "bewohner" && z.wege) {
        const [sg, b, wk] = [z.satzGang || {}, z.blick, z.wiederkehr || { ueberN: "ungemessen" }];
        soll(
            z.leiber > 0 && Math.abs(z.quote - 1) <= 0.05,
            `Bewohner-Quote ${z.quote} (${z.leiber} Leiber, Σ leute ${z.sollSumme})`
        );
        soll(!z.leerN, `${z.leerN} Haus ohne Bewohner: ${z.leer.join(" · ")}`);
        soll(
            z.imBlick.ego >= 10 && z.imBlick.third >= 10,
            `Dorfplatz 10 Uhr im Blick: ${z.imBlick.ego} Ego / ${z.imBlick.third} Third`
        );
        soll(z.alsLeib <= z.nahLeiber, `${z.alsLeib} Leiber als Leib gezeichnet (Soll ≤ ${z.nahLeiber})`);
        // DER TAG (mensch.K2): das Gesetz der Uhr, bit-gleich je Same, jeder trifft seine Soll-Orte, springt nie nah, und wer
        // nach 1 h Abwesenheit zurückkommt, findet jeden auf ±2 m dort, wo ihn sah, wer blieb
        soll(z.planGleich, "kein Tagesplan, bit-gleich je Same");
        soll(z.tagTakt === 0, `der Tag beginnt mit Geschichte: ${z.tagTakt} s Takt der Bewohner vor ihm`);
        soll(
            z.trefferMin >= 0.9,
            `Soll-Orte über 24 Spielstunden: min ${z.trefferMin} (Soll ≥ 0,9; ${z.unterN} darunter: ${z.unter.join(" · ")})`
        );
        soll(
            z.stationen > 0 && z.schmiede10 > 0 && z.schmiede2 === 0,
            `Schmiede um 10/2 Uhr: ${z.schmiede10}/${z.schmiede2} am Werk`
        );
        soll(z.wege.sprungN === 0, `Sprung im Nahbereich: ${z.wege.sprungN} Takte > 2 m`);
        soll(
            wk.n > 0 && wk.ueberN === 0,
            `Wiederkehr nach 1 h Abwesenheit: ${wk.ueberN} von ${wk.n} über ±2 m (max ${wk.maxM} m: ${wk.ueber})`
        );
        soll(sg.schlupf <= 0.05 && sg.wegLeib >= 10, `der Satz gleitet: Schlupf ${sg.schlupf} über ${sg.wegLeib} m`);
        soll(
            b.n >= 10 && b.quote >= 0.9 && b.sektorMax <= 0.5,
            `der Blick der Stehenden: ${b.quote} von ${b.n} auf ihr Ziel, ${b.sektorMax} in einer Richtung`
        );
        soll(!z.ohnePlatz, `ohne Platz: ${z.ohnePlatz} (${z.ohnePlatzWer.join(" · ")})`);
        soll(!z.stapel.length, `Stände gestapelt: ${z.stapel.length} näher als raumM (${z.stapel.slice(0, 4)})`);
        // jedes Haus trägt die Hülle seines Studios (die Wand der Wege)
        soll(z.huellen === z.haeuser, `${z.haeuser - z.huellen} Häuser ohne Hülle`);
    }
    // DIE BEGEGNUNG (mensch.K5 Staffel 1): je Gang (der Vorbeigang 2 m daneben, drei durch seinen Stand) der Kopf auf 10° zum
    // Spieler ≤ 0,5 s ab 3 m (als Leib, im Fenster im Bild), kein Bewohner näher als zwei Kapseln; die Gewalt neben ihm weitet
    // den Abstand des vierten Gangs um ≥ 0,3 m, die Gegenprobe ohne Erinnerung bleibt auf 0,15 m beim zweiten
    if (name === "begegnung") {
        const [zu, d] = [z.zuS, z.dMin];
        soll(
            zu.every((t) => t !== null && t <= 0.5) && z.amEreignis >= 30 && z.imBild.every(Boolean),
            `Kopf-Zuwendung ab 3 m: ${zu.join(" / ")} s (Soll ≤ 0,5, der Vorbeigang ab ${z.amEreignis}° ≥ 30; als Leib im Bild ${z.imBild})`
        );
        soll(
            Math.max(...z.beruehrt) === 0 && Math.min(...d) > 0.7,
            `Berührung: ${z.beruehrt}, Abstand min ${d.join(" / ")} m`
        );
        soll(
            z.furcht > 0 && d[3] - d[1] >= 0.3 && Math.abs(d[2] - d[1]) <= 0.15,
            `die Erinnerung lenkt den Abstand nicht: ohne ${d[1]} · Gegenprobe ${d[2]} · nach der Gewalt ${d[3]} m (Furcht ${z.furcht})`
        );
    }
}

module.exports = {
    BUEHNEN: `await (${menschBuehnen.toString()})();`,
    // DIE DORF-PROBEN (`startDorf`): ihr Start-Dorf bleibt in der Welt der Seite — sie laufen nach allen anderen, auch nach den
    // Lebens-Proben (die Reihe des Laufs ist die Reihe von PROBEN, je Teil gefiltert)
    PROBEN: ["bewohner", "begegnung", "zielplan"],
    // die Probe mit EINEM Lauf im Selbsttest: alle ihre Täter in ihm, das Urteil je Täter an seiner Sicht (`sicht`)
    EIN_LAUF: ["bewohner", "begegnung"],
    TAETER: {
        bewohner: [
            ["bewohner-haus", /Haus ohne Bewohner/],
            ["bewohner-menge", /Leiber als Leib gezeichnet/],
            ["bewohner-plan6", /Soll-Orte über 24 Spielstunden/],
            ["bewohner-sprung", /Sprung im Nahbereich/],
            ["bewohner-uhr", /der Tag beginnt mit Geschichte/],
            ["bewohner-gleiten", /der Satz gleitet/],
            ["bewohner-nord", /der Blick der Stehenden/],
            ["bewohner-daheim", /ohne Platz/],
            ["bewohner-stapel", /Stände gestapelt: [1-9]/],
            ["bewohner-wiederkehr", /Wiederkehr nach 1 h Abwesenheit: [1-9]/],
            ["bewohner-stadt-blind", /Stadt: Durchdringung: [1-9]/],
            ["bewohner-stadt-rempeln", /Berührung: [1-9]/],
        ],
        // die volle Stadt (`--ort stadt-voll`)
        "bewohner@stadt-voll": [
            ["bewohner-voll-starr", /[1-9]\d* draußen, 0 mit laufendem Gang/],
            ["bewohner-voll-leer", /im Nah-Ring 0 draußen/],
        ],
        begegnung: [
            ["begegnung-starr", /Kopf-Zuwendung/],
            ["begegnung-steht", /Berührung/],
            ["begegnung-vergessen", /die Erinnerung lenkt den Abstand nicht/],
        ],
    },
    urteil: menschUrteil,
};
