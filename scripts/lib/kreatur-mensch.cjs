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
        // DIE ZEILE OHNE WEG (krieg-lage, „die Frage meldet keinen Bruch“): wer weder einen Anschluss an das Netz noch einen Ausweg
        // hat, meldet EINE Bruch-Zeile je Bewohner und Ort (`_bewohnerStrecke`) — gezählt im Buch des EINEN Melders (`_bruchBuch`,
        // dienst `_bruchMelden`), nie aus der Konsole: was seit `buch0` neu kam oder wiederkehrte (der Stand des Buchs vor der
        // Gründung der Stadt, leer für das Start-Dorf — es wächst mit der Seite —, im Fenster eines Täters vor seinem Messer)
        const buchStand = () => new Map([...(r._bruchBuch || [])].map(([t, e]) => [t, e.n]));
        const wegeMesser = (liste, buch0 = buchStand()) => {
            const WG = { wand: new Map(), durch: 0, tuer: 0, falsch: [], geh: 0, aufWeg: 0, sprungN: 0, standN: 0, standUeber: 0, standMax: 0, standWer: "—" }; // prettier-ignore
            const [stecken, beruehr, kandW, wSpur, akten] = [[], [], [], new Map(), []];
            let minute = 0;
            const tage = new Set(); // die Tage der Prozesse, die der Messer sah (`_weltTag`, der Lebenslauf: wer an einem krank war)
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
                tage.add(Math.floor(r._weltTag()));
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
                        // der Gang durch die Wand beim Ort (tages-gesetz 2): Uhr, Richtung, von wo nach wo — in der Welt und im Haus
                        // (`hausLage`: x quer zur Front, z von der Mitte zur Front) —, ob er drinnen steht; bis hier nur Rolle und Haus
                        else {
                            const [f1, hl] = [(v) => v.toFixed(1), (px, pz) => { const l = hausLage(e, px, pz); return `${l.x.toFixed(1)}/${l.z.toFixed(1)}`; }]; // prettier-ignore
                            WG.falsch.push(`${wann(b)} an ${nameVon(e)} ${innen === e ? "hinein" : "hinaus"} von ${f1(sp.x)}/${f1(sp.z)} nach ${f1(x)}/${f1(z)} (im Haus ${hl(sp.x, sp.z)} → ${hl(x, z)}${b.drinnen ? ", drinnen" : ""}; Ziel ${b.ziel ? `${Object.keys(b.orte).find((k) => b.orte[k] === b.ziel) || "—"} ${f1(b.ziel.x)}/${f1(b.ziel.z)}, ${f1(ab(b.ziel, b.orte.tuer))} m von seiner Tür` : "keins"}, Akt ${b.akt}, drinnen soll ${!!b.drinnenSoll}, ${f1(ab(P, b.orte.tuer))} m von seiner Tür, steht an ${Object.entries(b.orte).filter(([, v]) => v && Number.isFinite(v.x) && ab(v, P) < 2).map(([k]) => k).join("+") || "keinem seiner Orte"})`); // prettier-ignore
                        }
                    }
                    // (die Höhe des Leibs ist die seines Genoms, 8 Kopf-Einheiten `kh` — die Höhe seiner Gestalt × `groesse`; bis
                    // generationen-band las die Linse 1,7 m × `groesse`, die Höhe eines Erwachsenen: das Kind, 1,22 × seine
                    // Gestalt von 8 J, stieß als 2,07 m großer Leib in jeder Tür an den Sturz 1,96 m über der Sohle)
                    const fuss = P.y - A.PLAYER_FOOT_OFFSET * (b.groesse || 1);
                    const imLeib = (box) =>
                        box.topY > fuss + A.PLAYER_STEP_UP && box.botY < fuss + 8 * b.genom.kh;
                    const wand = kandW.find((e) =>
                        (e.blockerAABBs || []).some((q) => imLeib(q) && r._boxAbstand2(q, x, z) < RW * RW)
                    );
                    if (wand) WG.wand.set(nameVon(wand), (WG.wand.get(nameVon(wand)) || 0) + 1);
                    // DER STAND NACH DEM GANG (w28-stand-hoehe): wer eben ging und jetzt steht, steht mit der Sohle auf dem Boden
                    // seines Punkts — das Gesetz der Geburt (`_bewohnerStellen`: der Boden der Säule, an der Tür ihre Stufe), einmal
                    // je Halt gelesen. Bis dahin trug der Stehende den Grund des letzten halben Meters seines Schritts.
                    const geht = !!b.weg && !b.drinnen;
                    if (sp.ging && !geht && !b.drinnen && !b.amSteuer) {
                        const h0 = r._koerperBodenUnter(x, NaN, z);
                        const ab0 = Number.isFinite(h0) ? Math.abs(fuss - r._bewohnerTritt(x, z, h0, h0)) : 0;
                        WG.standN++;
                        if (ab0 > 0.01) WG.standUeber++;
                        if (ab0 > WG.standMax) [WG.standMax, WG.standWer] = [ab0, wann(b)];
                    }
                    sp.ging = geht;
                    if (b.weg && !b.drinnen && d > 0) {
                        WG.geh++;
                        if (r._aufWeg(x, z, 0)) WG.aufWeg++;
                    }
                    // DER WEG DES TAGS: jede Wende seines Plans zwischen zwei Orten ≥ `gangM` (der Gang der Tafel, mit dem
                    // der Wirt die Orte eines Menschen stellt), einmal je Stunde der Wende (`tagAb`, `_bewohnerZiel`, gleich ab
                    // wo gesucht) — der Tag misst ≥ 24 Spielstunden, die Wende an seinem Rand zählt einmal; Beiseitetreten
                    // (`_bewohnerPlatz`), der Weg zurück und der gerückte Stand wechseln kein Ziel
                    // (die Runde der Wache ist Weg IM Werk — koerper TAGES_GESETZ.zeitArt streife „arbeit“, HETUS 2008: „travel
                    // during main job“ —: der Schritt vom Posten in die Runde, von Punkt zu Punkt und zurück wechselt kein Ziel des
                    // Tags; der Gang von daheim zum ersten Punkt bleibt ein Weg, rollen-des-tages)
                    const runde = b.akt === "streife" ? sp.akt === "streife" || sp.akt === "arbeit" : sp.akt === "streife" && b.akt === "arbeit"; // prettier-ignore
                    if (b.ziel !== sp.ziel && !runde && ab(sp.ziel, b.ziel) >= A.BEWOHNER.gangM) sp.n.add(((b.tagAb + 24) % 24).toFixed(4)); // prettier-ignore
                    [sp.ziel, sp.akt] = [b.ziel, b.akt];
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
                // DER KRANKE GEHT NICHT (mensch.menge.seuche#1, `_bewohnerSoll`): wer an einem Tag der Messung krank war, sitzt daheim —
                // seine Wege und seine Strecke misst das Soll seines Tags (Soll-Orte), nie das Band des Gesunden (4–10 Wege, ≥ 100 m)
                const krankAn = (b) => [...tage].some((t) => r._bewohnerLauf(null, b, "krank", t));
                const je = liste.map((b) => ({ wer: wer(b), krank: krankAn(b), ...wSpur.get(b) }));
                const gesund = je.filter((q) => !q.krank);
                const vier = (n, l) => ({ [n + "N"]: l.length, [n]: l.slice(0, 4) });
                const ohneWeg = [...(r._bruchBuch || [])].filter(([t, e]) => /erreicht keinen Weg frei/.test(t) && e.n > (buch0.get(t) || 0)); // prettier-ignore
                return {
                    ohneWeg: {
                        zeilen: ohneWeg.length,
                        n: ohneWeg.reduce((a, [t, e]) => a + e.n - (buch0.get(t) || 0), 0),
                        wer: ohneWeg.slice(0, 2).map(([t]) => t.replace(/^BEWOHNER: /, "")),
                    },
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
                    stand: { n: WG.standN, ueber: WG.standUeber, mm: Math.round(WG.standMax * 1000), wer: WG.standWer },
                    wegeMin: Math.min(...gesund.map((q) => q.n.size)),
                    wegeMax: Math.max(...gesund.map((q) => q.n.size)),
                    streckeMin: Math.round(Math.min(...gesund.map((q) => q.gesamt))),
                    ...vier(
                        "ausser",
                        gesund.filter((q) => q.n.size < 4 || q.n.size > 10).map((q) => `${q.wer}: ${q.n.size}`)
                    ),
                    ...vier(
                        "kurz",
                        gesund.filter((q) => !(q.gesamt >= 100)).map((q) => `${q.wer}: ${Math.round(q.gesamt)} m`)
                    ),
                    ...vier("krank", je.filter((q) => q.krank).map((q) => `${q.wer}: ${Math.round(q.gesamt)} m`)),
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
                // (die Skala der Vorlage liest die Probe am nächsten LEIB-Träger — der Stand trägt keinen Baum, w28-leib-im-ring)
                const T0 = M.find((b) => b.leib.userData._tierBaum);
                if (!T0) throw new Error(`bewohner: die Menge trägt keinen Leib unter den ${M.length} Nächsten`);
                const f = T0.leib.userData._tierBaum.wrap.scale.x;
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
        // KEIN STAND IN EINEM STÜCK DES PLATZES (w28-stadt-grammatik, fachwerk `imPlatzStueck`): kein Stand der Liste liegt im Tritt
        // eines Marktstands oder im Kreis eines Brunnens des Plans — bis hier kannte der Wurf des Wirts die Stücke nicht (sie
        // stehen erst mit dem Erlebnis des Dorfs): an stadt-voll lagen 30 Stände in einem, 3 Leiber standen um 12 Uhr darin
        const standImStueck = (liste, S) =>
            [...new Set(liste.flatMap((b) => Object.values(b.orte)))]
                .filter((o) => o?.ur)
                .flatMap((o) => {
                    const n = globalThis.__fachwerkCore.imPlatzStueck(S.plan, o.x - S.ox, o.z - S.oz, 0, false);
                    return n ? [`${q3(o.x)}/${q3(o.z)} im ${n}`] : [];
                });
        // JEDER STAND TRÄGT SEINEN HÄNDLER (w28-stadt-grammatik, `_bewohnerListe`; koerper TAGES_GESETZ.rollen.haendler): je Stand des
        // Plans (fachwerk `platzAnziehung` „haendler") trägt EIN Bewohner die Rolle, sein Werk ist der Punkt hinter der Theke, und
        // mittags steht er dort — `leibhaftig`: sein Leib binnen 1,5 m des Punkts (das Start-Dorf um 12:30, mitten im Mittag der
        // anderen), sonst das Soll der Stunde 12 (`_bewohnerSoll`: die Stadt, deren Tag die Probe nicht bis Mittag fährt)
        const ohneHaendler = (S, leibhaftig) =>
            globalThis.__fachwerkCore
                .platzAnziehung(S.plan)
                .punkte.filter((p) => p.art === "haendler")
                .filter((p) => {
                    const h = (S.liste || []).find((b) => b.rolle === "haendler" && b.orte.werk && b.orte.werk.stand === p.stand);
                    if (!h) return true;
                    if (!leibhaftig) return r._bewohnerSoll(h, 12).ziel !== h.orte.werk;
                    return !(h.leib && !h.drinnen && ab(h.leib.position, h.orte.werk) < 1.5);
                })
                .map((p) => `Stand ${p.stand}`);
        const stadtTag = async (ort = "stadt") => {
            const buchAb = buchStand();
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
                      // (der Händler geht mittags heim: das Soll der Stunde nennt seinen Stand vor der Tür)
                      ["bewohner-stand-leer", "_bewohnerSoll", (alt) => (b, h) => ((s) => (b.rolle === "haendler" ? { ...s, ziel: b.orte.heim } : s))(alt.call(r, b, h))], // prettier-ignore
                      // (der Stand vor tages-gesetz 2: jedes Ende eines Wegs trägt ins Haus, wer drinnen soll — auch der Schritt
                      // beiseite, `_bewohnerPlatz`; am Abend bittet die Probe jeden auf dem Heimweg einmal beiseite, wie der Wagen
                      // kind #946741 bat, 80,0 m vor seiner Tür)
                      ["bewohner-tuer", "_bewohnerSchritt", (alt) => {
                          const gebeten = new Set();
                          return function (b, dt, lenk) {
                              const g = b.leib;
                              if (b.drinnenSoll && !b.drinnen && b.weg && !b.platz && !gebeten.has(b) && b.wi < b.weg.length && ab(g.position, b.orte.tuer) > 5) { // prettier-ignore
                                  gebeten.add(b);
                                  const P = { x: g.position.x, z: g.position.z };
                                  if (r._bewohnerPlatz(b.sied, b, P, b.weg[b.wi], { leib: g, weg: null, drinnen: false, kF: 0 })) lenk = null; // prettier-ignore
                              }
                              const w = b.weg;
                              const v = alt.call(r, b, dt, lenk);
                              if (w && !b.weg && b.drinnenSoll && !b.drinnen) [b.drinnen, g.userData._drinnen] = [true, true];
                              return v;
                          };
                      }, 19.5],
                      // (die Frage findet nie einen Knoten frei: jeder Ort ohne Anschluss und ohne Ausweg, um 7 Uhr der Morgengang —
                      // die Strecke meldet ihn je Bewohner und Ort; zuletzt: das Netz merkt den leeren Ausweg)
                      ["bewohner-ohne-weg", "_bewohnerAnschluss", () => () => -1, 7],
                  ];
            for (const [t, ueber, mit = () => () => null, uhr = 5] of taeter ? T : [[]]) {
                const [ab, M] = [[], voll ? ringMesser(S.liste) : wegeMesser(S.liste, taeter ? undefined : buchAb)];
                await uhrAuf(voll ? 7 : uhr, `bewohner: ${ort}`, da, 4 * nH);
                if (ueber) decke(ueber, mit, ab);
                for (let i = 0; i < (voll ? 600 : (taeter ? 30 : 240) * takte); i++) takt(voll ? 1 / 60 : DT, M);
                sicht[t] = {
                    stadt: {
                        haeuser: haeuserIn(S.plan.slots, S.ox, S.oz).length,
                        [voll ? "ring" : "wege"]: M.zahl(),
                        menge: voll ? M.menge(S) : undefined,
                        stapel: voll ? undefined : standRaum(S.liste),
                        imStueck: voll ? undefined : standImStueck(S.liste, S),
                        haendler: voll ? undefined : ohneHaendler(S, false),
                        staende: (S.plan.staende || []).length,
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
        // DIE STÄNDE (w28-leib-im-ring): jeder Bewohner steht als Hülle in der Szene (`_bewohnerGeburt`: Lage, Heim, Feld und
        // Satz); seinen Leib trägt nur, wen das Gesetz ihn tragen heißt (Nah-Wahl, Erster je Gestalt, Fahrer im Bild). Was die
        // Probe zählt und wo sie steht, liest sie am Stand; ob jeder verlangte Leib steht, sagt die Welt (`_weltOffen().leute`).
        const leiber = () => s.scene.children.filter((o) => o?.userData?._feldLageVon && o.userData.heim != null);
        const sollSumme = haeuser.reduce((a, h) => a + (h.soll || 0), 0);
        // mit Bild trägt jeder Stand draußen sein Feld (`_weltOffen().leiber`), jedes Haus die Hülle seines Studios — bricht der
        // Deckel, bricht die Probe bei seinem Namen (nie misst die Quote ein halb geborenes Dorf)
        await bisDa(
            "bewohner: die Stände",
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
        // Täter (Selbsttest): der Schritt liest seinen Grund am Raster des halben Meters — der Stehende trägt den Boden daneben
        if (hat("bewohner-grund"))
            decke("_koerperBodenUnter", (alt) => (x, y, z) => (Number.isFinite(y) ? alt.call(r, Math.round(x * 2) / 2, y, Math.round(z * 2) / 2) : alt.call(r, x, y, z))); // prettier-ignore
        const SD = wegeMesser(liste, new Map());
        // DAS KÖNNEN IM GANG (mensch-zahlen, koerper `leibKoennen`): je Bewohner das Tempo seines Gangs gegen das Gesetz (tetrapoda
        // koerper `leibGehen` an seinem Bein × `lauf` seines Könnens aus den Dials seines Genoms und seinem Alter)
        // und im Gang-Fenster das Tempo, das er wirklich geht (Weg ÷ Geh-Zeit, ≥ 5 s am Stück des Fensters): wer mehr kann,
        // kommt weiter — die Rang-Korrelation Können ↔ gegangenes Tempo über die Geher. Das Gesetz trägt sein Satz (`leibSatzTempo`:
        // der Kranke), sein EINER Schreiber ist `_bewohnerGang` (Geburt und Kante des Satzes, leib-liest-satz-2)
        // Täter (Selbsttest): der Stand vor dem Gesetz — jeder geht das Tempo seines Beins (am EINEN Schreiber: die Geburt allein
        // zu decken, sah die Kante des Satzes nicht — sie schrieb das Gesetz zurück, der Täter blieb unsichtbar)
        if (hat("bewohner-koennen")) {
            decke("_bewohnerGang", (alt) => (b) => (alt.call(r, b), b.tempoBand > 0 && (b[b.gangTempo != null ? "gangTempo" : "tempo"] = b.tempoBand), undefined)); // prettier-ignore
            for (const b of liste) r._bewohnerGang(b);
        }
        // DAHEIM AM WERK (mensch-zahlen, der Griff von `binden`): wessen Werk sein eigenes Haus ist (Beruf = Rolle, kein Posten),
        // der trägt den Stand seines Werks nie als Abend oder Tisch — der Abend daheim sitzt vor der Tür, der Tisch daheim ist
        // drinnen (koerper `tagesPlan` ohne Ort)
        // Täter (Selbsttest): der Stand vor dem Schnitt — der Griff reicht den Stand des Werks als Abend durch
        // (wer spielt, `rollen.kind.spiel`, hat kein Werk in seinem Haus: sein Werk ist der Ort seines Spiels, koerper `tagesBindung`)
        const amEigenenWerk = (b) => b.rolle !== "wohnhaus" && b.beruf === b.rolle && !(KC.TAGES_GESETZ.rollen[b.rolle] || {}).regenfest && !(KC.TAGES_GESETZ.rollen[b.rolle] || {}).spiel && !!b.orte.werk; // prettier-ignore
        if (hat("bewohner-abendstand")) for (const b of liste) if (amEigenenWerk(b)) b.orte.abend = b.orte.werk;
        const daheimWerk = () => {
            const eigen = liste.filter(amEigenenWerk);
            const falsch = eigen.filter((b) => b.orte.abend === b.orte.werk || b.orte.mahl === b.orte.werk);
            return { n: eigen.length, falsch: falsch.length, wer: falsch.slice(0, 3).map(wer) };
        };
        const koennen = (() => {
            let spur = new Map();
            const paare = [];
            const rang = (A) => {
                const R = new Array(A.length);
                A.map((x, i) => [x, i]).sort((a, c) => a[0] - c[0]).forEach((x, k) => (R[x[1]] = k)); // prettier-ignore
                return R;
            };
            return {
                fenster: () => (spur = new Map(liste.filter((b) => b.leib).map((b) => [b, { x: b.leib.position.x, z: b.leib.position.z, m: 0, s: 0 }]))),
                messen: (dt) => {
                    for (const [b, q] of spur) {
                        const p = b.leib && b.leib.position;
                        if (!p) continue;
                        const d = Math.hypot(p.x - q.x, p.z - q.z);
                        // (ein Sprung — die Ankunft, die Tür — ist kein Gang)
                        if (b.weg && !b.drinnen && d < 1) [q.m, q.s] = [q.m + d, q.s + dt];
                        [q.x, q.z] = [p.x, p.z];
                    }
                },
                ende: () => {
                    for (const [b, q] of spur) if (q.s >= 5 && b.koennen) paare.push([b.koennen.lauf, q.m / q.s]);
                },
                zahl: () => {
                    const ohne = liste.filter((b) => {
                        const v = b.gangTempo != null ? b.gangTempo : b.tempo; // (das Tempo seines Gangs, nicht das geliehene des Laufs)
                        if (!b.koennen || !(v > 0)) return true;
                        const d = Object.assign({}, r._dialsAusGenom(b.genom), { age: b.genom.alter });
                        return Math.abs(v - KC.leibSatzTempo(KC.leibGehen(b.beinL) * KC.leibKoennen(d).lauf, b)) > 1e-9;
                    });
                    const [ra, rb, m] = [rang(paare.map((q) => q[0])), rang(paare.map((q) => q[1])), (paare.length - 1) / 2];
                    let [sab, sa, sb] = [0, 0, 0];
                    for (let i = 0; i < paare.length; i++) [sab, sa, sb] = [sab + (ra[i] - m) * (rb[i] - m), sa + (ra[i] - m) ** 2, sb + (rb[i] - m) ** 2];
                    const nachLauf = paare.slice().sort((a, c) => a[0] - c[0]);
                    const mittel = (A) => A.reduce((a, q) => a + q[1], 0) / Math.max(1, A.length);
                    const h = Math.floor(nachLauf.length / 2);
                    const T = liste.map((b) => b.tempo).filter((v) => v > 0);
                    const tm = T.reduce(addiere, 0) / Math.max(1, T.length);
                    // DER BEZUGS-LEIB DES GANGS (eine-huelle, koerper KOENNEN_BEZUG): der Bezug ist der erwachsene Median der
                    // Bevölkerung mit 30 J — je erwachsenem Bewohner der Liste sein eigener Leib mit 30 J, der Median ihres `lauf`
                    // liegt bei 1 (Schranke: 3 Standardfehler des Medians dieser Liste, mindestens 0,015)
                    // Täter (Selbsttest): der Bezug vor dem Schnitt — START_PARAMS (ein Mann von 27 J, Gewicht 0,35) läuft 1
                    const BZ = KC.KOENNEN_BEZUG;
                    const lauf30 = hat("bewohner-bezug") ? (d) => KC.leibKoennen(d).lauf / KC.leibKoennen(KC.START_PARAMS).lauf : (d) => KC.leibKoennen(d).lauf;
                    const L30 = BZ ? liste.filter((b) => b.genom && b.genom.alter >= 0).map((b) => lauf30(Object.assign({}, r._dialsAusGenom(b.genom), { age: BZ.age }))).sort((a, c) => a - c) : []; // prettier-ignore
                    const m30 = L30.length ? L30[(L30.length - 1) >> 1] : 0;
                    const mw30 = L30.reduce(addiere, 0) / Math.max(1, L30.length);
                    const s30 = L30.length > 1 ? Math.sqrt(L30.reduce((a, v) => a + (v - mw30) ** 2, 0) / (L30.length - 1)) : 0;
                    return {
                        bezug: q3(m30),
                        bezugN: L30.length,
                        bezugTol: q3(Math.max(0.015, (3 * 1.2533 * s30) / Math.sqrt(Math.max(1, L30.length)))),
                        n: liste.length,
                        ohne: ohne.length,
                        wer: ohne.slice(0, 3).map(wer),
                        geher: paare.length,
                        rho: sa && sb ? q3(sab / Math.sqrt(sa * sb)) : 0,
                        haelften: h ? q3(mittel(nachLauf.slice(nachLauf.length - h)) / mittel(nachLauf.slice(0, h))) : 0,
                        cv: T.length > 1 ? q3(Math.sqrt(T.reduce((a, v) => a + (v - tm) ** 2, 0) / (T.length - 1)) / tm) : 0,
                    };
                },
            };
        })();
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
        // (der Stand im Ring vor einer Tür — der eigenen, der seines Werks, seines Tischs, seines Besuchs — trägt sie als `anker`
        // und sieht von ihr fort; jeder andere sieht auf seinen `anker`: der Stand auf dem Platz zur Mitte oder zum Gegenüber,
        // der am Markt zur Theke — `platzStand`, `marktStand`. Bis bewohner-satz las die Linse jeden Stand außer `orte.platz`
        // als einen vor der Tür: das Kind, dessen Spiel auf dem Platz einen eigenen Stand trägt, sah ihr „von der Mitte fort")
        const tuerAnker = new Set(liste.map((b) => `${b.orte.tuer.x},${b.orte.tuer.z}`));
        const blickMessen = () => {
            for (const b of liste) {
                const g = b.leib;
                if (!g || !b.da || b.drinnen || !gezeichnet(g) || !b.ziel) continue;
                if (hat("bewohner-nord")) g.rotation.y = 0;
                const o = b.orte;
                const th = g.rotation.y;
                blicke.sektor[((Math.round(th / (Math.PI / 6)) % 12) + 12) % 12]++;
                const A = b.ziel.anker;
                const [dx, dz] = A ? [A.x - g.position.x, A.z - g.position.z] : [0, 0];
                const soll =
                    b.ziel === o.platz
                        ? Math.atan2(pc.x - g.position.x, pc.z - g.position.z)
                        : !A
                          ? null
                          : tuerAnker.has(`${A.x},${A.z}`)
                            ? Math.atan2(-dx, -dz)
                            : Math.atan2(dx, dz);
                if (soll === null) continue;
                blicke.n++;
                const d = th - soll;
                if (Math.abs(wrap(d)) <= 1.3) blicke.treffer++;
            }
        };
        // DIE HALTUNG DES STANDS IM SATZ (w28-steh-haltung): wer im Satz steht, steht in der Haltung, in der sein naher Leib steht —
        // je stehendem Bewohner im Satz der Winkel zwischen der Stand-Zeile, die seine Instanz liest (`aGang.y`: 2 · Stand +
        // Gewicht, wie der Knoten `_gangSatzKnoten`), und der Pose des nahen Wegs (`_animateHuman` mit SEINEM Gemüt an einem Leib
        // mit Rig, auf die Vorlage gelegt wie das Backen, `_bewohnerRaumStellen`), an Schulter und Ellbogen beider Arme. Bis hier
        // buk der Satz EINEN Stand ohne Haltung: beim Akt besuch sprang die Schulter an der Nah-Grenze um 8,2°.
        const haltung = { n: 0, mit: 0, maxGrad: 0, wer: "", je: {}, ruheGrad: 0, zwischen: {}, zwischenGrad: 0, zwischenWer: "" };
        const haltungMessen = () => {
            const Z = S.satz;
            const modell = liste.find((b) => b.leib && b.leib.userData.rig && !b.amSteuer && !b.backt);
            if (!Z || !Z.fertig || !Z.leib || !modell) return;
            const g = modell.leib;
            const rig = g.userData.rig;
            const namen = [rig.armL.shoulder, rig.armL.elbow, rig.armR.shoulder, rig.armR.elbow].map((k) => k.name);
            const aG = Z.leib.geometry.attributes.aGang;
            const D = Z.tex.image.data;
            // Täter (Selbsttest): der Satz ohne Haltung — jede Instanz liest den neutralen Stand
            if (hat("bewohner-haltung")) for (let q = 0; q < aG.count; q++) aG.setY(q, aG.getY(q) % 2);
            const [mA, mB, inv] = [new T.Matrix4(), new T.Matrix4(), new T.Matrix4()];
            const [qA, qB, p3, s3] = [new T.Quaternion(), new T.Quaternion(), new T.Vector3(), new T.Vector3()];
            // der Winkel zweier Drehungen: an der normierten Differenz (2 · atan2(|v|, |w|)) — `angleTo` rauscht an den Drehungen
            // einer zerlegten Matrix nahe 0 um 0,3–1,1° (acos nahe 1, die Norm weicht um 1e-5)
            const winkel = (a, b) => {
                const d = a.clone().normalize().multiply(b.clone().normalize().invert());
                return (2 * Math.atan2(Math.hypot(d.x, d.y, d.z), Math.abs(d.w)) * 180) / Math.PI;
            };
            // der neutrale Stand: am Modell (der nahe Weg ohne Gemüt) und im Satz (die Zeile des Stands 0), je Knochen
            const [nahe0, satz0] = [new Map(), new Map()];
            const lies = (zeile, p, q) => {
                const o = A._gangOrt(Z, zeile, p);
                return mB.set(D[o], D[o + 1], D[o + 2], D[o + 3], D[o + 4], D[o + 5], D[o + 6], D[o + 7], D[o + 8], D[o + 9], D[o + 10], D[o + 11], 0, 0, 0, 1).decompose(p3, q, s3); // prettier-ignore
            };
            // DIE ZEILEN, DIE SEINE INSTANZ LIEST (stand-lebt, wie der Knoten `_gangSatzKnoten`): die Zeile `hs` und die nächste
            // ihres Zyklus (`STAND.zeilen` je Stand und tragendem Bein), gemischt im Anteil `an` (`aGang.w`)
            const KC = window.__koerperCore;
            const [NZ, ZY] = [KC.STAND.zeilen, KC.STAND.zyklus];
            const qC = new T.Quaternion();
            const liesStand = (hs, an, p, q) => {
                const k = hs % NZ;
                lies(Z.n * Z.baender + hs, p, q);
                if (!(an > 0)) return q;
                lies(Z.n * Z.baender + hs - k + ((k + 1) % NZ), p, qC);
                const v = q.dot(qC) < 0 ? -1 : 1;
                return q.set(q.x + (v * qC.x - q.x) * an, q.y + (v * qC.y - q.y) * an, q.z + (v * qC.z - q.z) * an, q.w + (v * qC.w - q.w) * an).normalize(); // prettier-ignore
            };
            // (die Pose des nahen Wegs zur Uhr t für die Person `person` — ihr Gewichtswechsel, `rig.standPerson` wie im Takt,
            // `_tickBewohner`; ohne Person nennt das Gemüt der Zeile ihr Bein, wie der Ofen backt —, eingeschwungen wie das Backen,
            // `leibRigEingeschwungen`)
            const pose = (gm, je, t = 0, person = undefined) => {
                rig.standPerson = person;
                window.__koerperCore.leibRigEingeschwungen(g.userData.rig);
                r._animateHuman(g, t, 0, false, false, gm);
                r._leibMatrix(g);
                const P = r._bewohnerRaumStellen(S, g);
                inv.copy(P.wurzel.matrixWorld).invert();
                Z.knochen.forEach(({ q, j, nm }, p) => {
                    if (!namen.includes(nm)) return;
                    mA.multiplyMatrices(inv, P.teile[nm].matrixWorld)
                        .multiply(q.m.skeleton.boneInverses[j])
                        .multiply(q.m.bindMatrix)
                        .decompose(p3, qA, s3);
                    je(p, qA);
                });
            };
            // (der neutrale Bezug zu den Bedingungen der Zeile 0, wie der Ofen sie backt, `_bewohnerGangPose`: ihr Gemüt nennt ihr
            // Bein, ihre Uhr die Mitte ihres Teils des Zyklus — bis mittag-heiler stand das Modell hier ohne Gemüt zur Uhr 0 auf dem
            // Bein SEINER Person, und die Körper-Ruhe trug das fremde Bein mit: 2,27°)
            pose(
                r._bewohnerStandGemuet(0),
                (p, q) => {
                    nahe0.set(p, q.clone());
                    lies(Z.n * Z.baender, p, qB);
                    satz0.set(p, qB.clone());
                    // DIE KÖRPER-RUHE (gemessen, nie geurteilt): der neutrale Stand des Modells gegen den des Satzes — die Arme hängen
                    // am Leib nach SEINEM Bau (koerper `leibBauArme`), im Satz nach dem der Vorlage
                    haltung.ruheGrad = Math.max(haltung.ruheGrad, q3(winkel(q, qB)));
                },
                r._bewohnerStandZeit(0)
            );
            const neutral = A.MOTION_PROFILE_MAP.koerper.idle;
            for (const b of liste) {
                if (!b.leib || b.leib.userData._satz !== true || b.weg || b._gaitW > 0 || b.drinnen) continue;
                if (!b.satzOrt || !(b.satzOrt[1] >= 0)) continue;
                const gm = r._bewohnerGemuet(b);
                const name = r._koerperMotionName(false, gm);
                // WAS ER JETZT LIEST, GEGEN DAS, WAS SEIN NAHER LEIB JETZT STELLT (mittag-heiler, stand-lebt 3): im Satz die Zeile
                // und der Anteil SEINER Instanz (der Täter bleibt wirksam), nah der EINE Weg des Spiels für IHN — sein Gemüt, seine
                // Person (`atem / 10`: ihr tragendes Bein, koerper `leibStandBein`) zur Uhr, die seine Instanz zeigt (die Uhr ihrer
                // Zeile samt Anteil, `leibStandZeile` — die letzte an seiner Uhr `uhr + atem`: der Satz rückt im Takt des Stands,
                // `_bewohnerStandTakt`). Bis hier stand das Modell zur Uhr der Zeile auf dem Bein seiner EIGENEN Person: jeder Stand
                // lag über 1° (idle 2,271° = die Körper-Ruhe), sobald die Zeilen ihr tragendes Bein nannten
                const hs = Math.floor(aG.getY(b.satzOrt[1]) / 2);
                const an = aG.getW(b.satzOrt[1]) - Math.floor(aG.getW(b.satzOrt[1]));
                const u = (b.uhr || 0) + (b.atem || 0);
                let dU = (((u - (ZY * ((hs % NZ) + 0.5 + an)) / NZ) % ZY) + ZY) % ZY;
                if (dU > ZY / 2) dU -= ZY;
                const person = (b.atem || 0) / 10;
                // (im Wechsel des Gewichts gleitet der nahe Leib eine `wechselDauerS` lang, der ferne wechselt im Schritt einer Zeile)
                const uZ = u - dU - (ZY * an) / NZ;
                const imWechsel = Math.abs(KC.leibStandBein(uZ, person)) < 1 || Math.abs(KC.leibStandBein(u - dU, person)) < 1;
                // die Haltung als Drehung GEGEN den neutralen Stand — am nahen Weg und im Satz dieselbe (die Körper-Ruhe fällt heraus)
                const gegen = (t, a) => {
                    let grad = 0;
                    pose(
                        gm,
                        (p, q) => {
                            liesStand(hs, a, p, qB);
                            const dN = q.clone().normalize().multiply(nahe0.get(p).clone().normalize().invert());
                            const dS = qB.clone().normalize().multiply(satz0.get(p).clone().normalize().invert());
                            grad = Math.max(grad, winkel(dN, dS));
                        },
                        t,
                        person
                    );
                    return grad;
                };
                // DAS URTEIL AN DER ZEILE (zur Uhr ihrer Mitte: was der Ofen buk, gegen den nahen Weg für IHN) — und GEMESSEN, was
                // zwischen zwei Zeilen steht (sein Anteil jetzt): der Satz mischt `STAND.zeilen` Zeilen je Zyklus gerade, der nahe
                // Leib fährt den Bogen seiner Geste (koerper `leibTunWert`, `leibGesteWert`)
                const [grad, zw] = [gegen(uZ, 0), an > 0 ? gegen(u - dU, an) : 0];
                haltung.n++;
                if (name !== neutral) haltung.mit++;
                if (imWechsel) {
                    haltung.wechsel = (haltung.wechsel || 0) + 1;
                    haltung.wechselGrad = Math.max(haltung.wechselGrad || 0, q3(Math.max(grad, zw)));
                    continue;
                }
                haltung.verzugS = Math.max(haltung.verzugS || 0, q3(Math.abs(dU)));
                haltung.je[name] = Math.max(haltung.je[name] || 0, q3(grad));
                haltung.zwischen[name] = Math.max(haltung.zwischen[name] || 0, q3(zw));
                if (zw > haltung.zwischenGrad) [haltung.zwischenGrad, haltung.zwischenWer] = [q3(zw), `${wer(b)} (${b.akt}: ${name})`];
                if (grad > haltung.maxGrad) [haltung.maxGrad, haltung.wer] = [q3(grad), `${wer(b)} (${b.akt}: ${name})`];
            }
            // das Modell steht wieder in seiner eigenen Pose
            rig.standPerson = modell.atem / 10;
            r._animateHuman(g, modell.uhr + modell.atem, modell.walkPhase || 0, !!modell.weg, false, r._bewohnerGemuet(modell), modell._gait); // prettier-ignore
            r._leibMatrix(g);
        };
        // DIE GESTALT DES STANDS IM SATZ (w28-gestalt, das zweite Urteil neben der Haltung): wer im Satz steht, steht in der Gestalt
        // seines nahen Leibs. Je Bewohner im Satz die bedeckte Breite (die Summe der x-Strecken der Scheibe, wie sie das Bild von vorn
        // füllt) an Schulter, Taille und Hüfte als Anteil der Körperhöhe — am Satz gelesen, wie ihn die Welt zeichnet: der Punkt aus
        // SEINER Zeile der Ton-Tafel (`aGang.z`), die Breite aus SEINER Instanz-Matrix, die Vorlage der Stufe an diesem Punkt
        // (`_leibRaumLeib`) — gegen den nahen Leib seiner Gestalt (die Hüllen ihrer Vorlage im Ofen, ihre Geometrie × seine Breite).
        // Die Achsen des Baus trägt nah der Knochen, fern der Punkt: sie stehen im Vergleich am Kanon (ihr Leser: gate:mensch-anatomie
        // `leser.menge`). Bis hier stand der Satz am Punkt des eigenen Genoms, schmal gegossen, und der Leib an der nächsten Gestalt:
        // Taille bis 39 %, Schulter bis 17,5 % neben dem Leib (40 Bewohner, Ofen).
        const gestalt = { n: 0, gestalten: 0, max: 0, wer: "", mass: "", je: [0, 0, 0] };
        const gestaltK = { n: 0, gestalten: 0, max: 0, wer: "", mass: "", je: [0, 0, 0] }; // (das Konto des Täters bewohner-kreuz)
        const gestaltMessen = () => {
            const Z = S.satz;
            const kc = window.__koerperCore;
            if (gestalt.n || !Z || !Z.fertig || !Z.leib || !S.raum) return;
            const q2 = Z.knochen.map((k) => k.q).find((q) => q.raum && q.m && q.m.geometry === Z.leib.geometry) || Z.knochen.map((k) => k.q).find((q) => q.raum);
            if (!q2) return;
            const [tafel, ix2] = [q2.raum, q2.m.geometry.index.array];
            // die Scheiben: Schulter die größte Breite y 4,4…4,9 E · Taille die kleinste 3,5…4,1 · Hüfte die größte 2,9…3,3 (am
            // Kanon des Skeletts: Hüfte 3,18 · Schulter 4,91 · Kopf-Gelenk 5,33 E, die Höhe des Maßes)
            const breite = (T3, y) => {
                const seg = [];
                for (const t of T3) {
                    let [a, b] = [Infinity, -Infinity];
                    for (let k = 0; k < 3; k++) {
                        const [p, q] = [t[k], t[(k + 1) % 3]];
                        if ((p[1] - y) * (q[1] - y) > 0 || p[1] === q[1]) continue;
                        const x = p[0] + ((y - p[1]) / (q[1] - p[1])) * (q[0] - p[0]);
                        [a, b] = [Math.min(a, x), Math.max(b, x)];
                    }
                    if (b >= a) seg.push([a, b]);
                }
                seg.sort((p, q) => p[0] - q[0]);
                let [sum, e] = [0, -Infinity];
                for (const [a, b] of seg) {
                    if (a > e) sum += b - a;
                    else if (b > e) sum += b - e;
                    e = Math.max(e, b);
                }
                return sum;
            };
            const band = (T3, a, b, min) => {
                let w = min ? Infinity : -Infinity;
                for (let y = a; y <= b + 1e-6; y += 0.05) w = min ? Math.min(w, breite(T3, y)) : Math.max(w, breite(T3, y));
                return w / 5.33;
            };
            const masse = (T3) => [band(T3, 4.4, 4.9, false), band(T3, 3.5, 4.1, true), band(T3, 2.9, 3.3, false)];
            const dreiecke = (P, I, aus = []) => {
                for (let t = 0; t < I.length; t += 3) aus.push([0, 1, 2].map((k) => [P[3 * I[t + k]], P[3 * I[t + k] + 1], P[3 * I[t + k] + 2]]));
                return aus;
            };
            // der nahe Leib je Gestalt: die Hüllen mit Skelett (ohne Haar und Auge), am Kanon ihrer Breite
            const [nah, nahAkte] = [new Map(), new Map()];
            // (die Vorlage des Ofens, aus der `_buildHumanGroup` jeden nahen Leib dieser Gestalt stellt — gelesen, nie gegossen)
            S.gestalten.forEach((G, gi) => {
                const da = A._tierOfenMemo && A._tierOfenMemo.get(G.keys[0]);
                if (!da || !da.root) return;
                const T3 = [];
                da.root.traverse((o) => {
                    const kl = String((o.userData && o.userData.__klasse) || (o.material && o.material.userData && o.material.userData.__klasse) || "");
                    if (!o.isSkinnedMesh || !o.geometry.index || /hair|haar|eye|iris|pupil|cornea|brow|braue|lash/i.test(kl)) return;
                    dreiecke(o.geometry.attributes.position.array, o.geometry.index.array, T3);
                });
                if (T3.length) nah.set(gi, masse(T3));
                // (für die Akte: die Dreiecke und die Gelenke des nahen Leibs in SEINEM Raum — die Bind-Lage jedes Knochens)
                const gel = new Map();
                da.root.traverse((o) => {
                    if (!o.isSkinnedMesh || !o.skeleton) return;
                    o.skeleton.bones.forEach((bn, i) => gel.has(bn.name) || gel.set(bn.name, new T.Matrix4().copy(o.skeleton.boneInverses[i]).invert().elements[13])); // prettier-ignore
                });
                if (T3.length) nahAkte.set(gi, { T3, gel });
            });
            gestalt.gestalten = gestaltK.gestalten = nah.size;
            // die Achsen des Baus am Kanon (der Punkt seiner Gestalt: sie gießt im Kanon des Skeletts), jede andere aus der Zeile des Bewohners
            const kanon = S.gestalten.map((G) => kc.leibRaumPunkt(G.dK));
            const bau = kc.LEIB_RAUM.achsen.map((a) => kc.BAU_GESETZ.achsen.some((q) => q.achse === a.achse));
            const mitte = kc.LEIB_RAUM.achsen.map((a) => (a.knoten.length - 1) / 2);
            const tex = r._tonTafel();
            const [D, breiteT, nT] = [tex.image.data, tex.image.width, kc.MENSCH_TON.length];
            const aG = Z.leib.geometry.attributes.aGang;
            const [m4, p3, q4, s3] = [new T.Matrix4(), new T.Vector3(), new T.Quaternion(), new T.Vector3()];
            const NAMEN = ["Schulter", "Taille", "Hüfte"];
            const lage = new Float32Array(tafel.n * 3);
            const ki = kc.LEIB_RAUM.achsen.findIndex((a) => a.kreuz);
            for (const b of liste) {
                if (!b.leib || b.leib.userData._satz !== true || !b.satzOrt || !(b.satzOrt[1] >= 0) || !nah.has(b.gestalt)) continue;
                const o = (Math.round(aG.getZ(b.satzOrt[1])) * breiteT + nT) * 4;
                // Täter (Selbsttest): der Satz ohne Gestalt — jede Instanz liest die Mitte des Leib-Raums (die Vorlage)
                const punkt = mitte.map((m, ai) => (bau[ai] ? kanon[b.gestalt][ai] : hat("bewohner-gestalt") ? m : D[o + ai]));
                Z.leib.getMatrixAt(b.satzOrt[1], m4);
                m4.decompose(p3, q4, s3);
                const n0 = nah.get(b.gestalt).map((x) => x * b.breite);
                // je Bewohner das Maß des Satzes gegen nah, ins Konto G; die Zelle des Leib-Raums am Schlimmsten: Ton, Masse und der
                // Wert der Ecke Ton × Masse (koerper LEIB_RAUM `kreuz`)
                const zaehle = (G, P) => {
                    const fern = masse(dreiecke(A._leibRaumLeib(tafel, P, lage), ix2)).map((x) => (x * s3.x) / s3.y);
                    G.n++;
                    fern.forEach((x, k) => {
                        const pct = Math.abs((x - n0[k]) / n0[k]) * 100;
                        G.je[k] = Math.max(G.je[k], q3(pct));
                        const d = b.genom ? r._dialsAusGenom(b.genom) : {};
                        const zelle = ki >= 0 ? `; Ton ${q3(d.tone)}, Masse ${q3(d.mass)}, Achse ${kc.LEIB_RAUM.achsen[ki].achse} ${q3(P[ki] * 2 - 1)}` : ""; // prettier-ignore
                        if (pct > G.max) [G.max, G.wer, G.mass] = [q3(pct), `${wer(b)} (Gestalt ${b.gestalt})`, NAMEN[k] + zelle];
                    });
                    return fern;
                };
                const fern = zaehle(gestalt, punkt);
                // Täter (Selbsttest): die Tafel ohne die Ecke Ton × Masse — ihre Achse liest die Mitte (0), im eigenen Konto
                if (hat("bewohner-kreuz")) zaehle(gestaltK, mitte.map((m, ai) => (ai === ki ? m : bau[ai] ? kanon[b.gestalt][ai] : D[o + ai])));
                // die Akte (nur gelesen, kein Urteil): je Gestalt das Höchste je Maß, das schlechteste Kind und der schlechteste Erwachsene
                const pcts = fern.map((x, k) => ((x - n0[k]) / n0[k]) * 100);
                const zl = akte.zeilen.get(b.gestalt) || [0, 0, 0];
                akte.zeilen.set(b.gestalt, zl.map((v, k) => (Math.abs(pcts[k]) > Math.abs(v) ? q3(pcts[k]) : v)));
                const schlimm = Math.max(...pcts.map(Math.abs));
                const art = b.rolle === "kind" ? "kind" : "gross";
                if (!akte[art] || schlimm > akte[art].schlimm) akte[art] = { b, schlimm, pcts, punkt: punkt.slice(), s3: s3.clone() };
            }
            // DIE SCHEIBE AM LEIB? je Maß die Höhe y, an der das Band seine Breite fand (von–bis des Bands, der Kanon `:710`), die Breite
            // nah und im Satz (E), die Körperhöhe des nahen Leibs (E, und in cm über die Höhen-Skala der Instanz) und die Gelenke des
            // nahen Leibs (Bind-Lage, E) — liegt die Scheibe am Kind an Hüfte und Schulter, oder an Hand und Oberschenkel?
            const bandY = (T3, a, e, min) => {
                let [w, y0] = [min ? Infinity : -Infinity, a];
                for (let y = a; y <= e + 1e-6; y += 0.05) {
                    const v = breite(T3, y);
                    if (min ? v < w : v > w) [w, y0] = [v, y];
                }
                return [w, y0];
            };
            const BAENDER = [[4.4, 4.9, false], [3.5, 4.1, true], [2.9, 3.3, false]]; // prettier-ignore
            // (die Akte urteilt nicht: bricht ihr Lesen, steht der Bruch in ihr, das Urteil der Gestalt bleibt)
            try {
                akteLesen(BAENDER, bandY, nahAkte, tafel, lage, ix2, dreiecke, NAMEN, breite);
            } catch (e) {
                akte.fehler = String((e && e.message) || e);
            }
            gestalt.akte = {
                zeilen: [...akte.zeilen].sort((p, q) => p[0] - q[0]).map(([gi, v]) => `G${gi} (${q3(S.gestalten[gi].J ?? NaN)} J): ${v.join(" · ")}`),
                kind: akte.kindZeile || null,
                gross: akte.grossZeile || null,
                kindProfil: akte.kindProfil || null,
                grossProfil: akte.grossProfil || null,
                kindBau: akte.kindBau || null,
                grossBau: akte.grossBau || null,
                fehler: akte.fehler || null,
            };
        };
        const akteLesen = (BAENDER, bandY, nahAkte, tafel, lage, ix2, dreiecke, NAMEN, breite) => {
            for (const art of ["kind", "gross"]) {
                const a = akte[art];
                if (!a) continue;
                const { b, s3: sk } = a;
                const N = nahAkte.get(b.gestalt);
                const TF = dreiecke(A._leibRaumLeib(tafel, a.punkt, lage), ix2);
                let [lo, hi] = [Infinity, -Infinity];
                for (const t of N.T3) for (const p of t) [lo, hi] = [Math.min(lo, p[1]), Math.max(hi, p[1])];
                const H = hi - lo;
                // (cm: E × das Maß des Leibs — der Wrap des Rigs trägt f = 8 · PLAYER_KH / 6 m je E (`_buildHumanoidRig`), seine
                // Größe zur Gestalt `groesse` (die Kopf-Höhe seines Genoms über der ihren, `_bewohnerGenome`))
                const mjE = ((8 * A.PLAYER_KH) / 6) * (b.groesse > 0 ? b.groesse : NaN);
                const cm = (e) => Math.round(e * mjE * 100);
                const mass = BAENDER.map(([u, o, min], k) => {
                    const [wN, yN] = bandY(N.T3, u, o, min);
                    const [wF, yF] = bandY(TF, u, o, min);
                    const [n1, f1] = [wN * b.breite, (wF * sk.x) / sk.y];
                    return `${NAMEN[k]} ${q3(a.pcts[k])} % y ${u}–${o} E (nah bei ${q3(yN)}, Satz bei ${q3(yF)}): nah ${q3(n1)} E = ${cm(n1)} cm, Satz ${q3(f1)} E = ${cm(f1)} cm, Δ ${cm(f1 - n1)} cm`; // prettier-ignore
                });
                const gel = [...N.gel].map(([nm, y]) => `${nm} ${q3(y)}`);
                // das Profil der bedeckten Breite (E, nah / Satz) von 2,5 bis 5,0 E je 0,1 — wo die Scheibe auf dem Leib liegt
                const prof = [];
                for (let y = 2.5; y <= 5.0 + 1e-6; y += 0.1) prof.push(`${q3(y)}:${q3(breite(N.T3, y) * b.breite)}/${q3((breite(TF, y) * sk.x) / sk.y)}`);
                akte[art + "Profil"] = prof.join(" ");
                // (für den Nachbau in Node: die Dials seiner Gestalt, sein Punkt im Leib-Raum, seine Breite und die der Vorlage der Siedlung)
                akte[art + "Bau"] = { dK: S.gestalten[b.gestalt].dK, f: S.gestalten[b.gestalt].f, punkt: Array.from(a.punkt), breite: b.breite, sx: sk.x, sy: sk.y, raum: S.raum && S.raum.dK, raumF: S.raum && S.raum.f }; // prettier-ignore
                akte[art + "Zeile"] = `${wer(b)} (Gestalt ${b.gestalt}, Alter ${q3(b.genom ? b.genom.alter : NaN)}, m je E ${q3(mjE)}, Satz-Skala ${q3(sk.y)}): Körperhöhe ${q3(H)} E = ${cm(H)} cm (Fuß ${q3(lo)}) · ${mass.join(" · ")} · Gelenke ${gel.slice(0, 40).join(", ")}`; // prettier-ignore
            }
        };
        const akte = { zeilen: new Map(), kind: null, gross: null };
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
        // (der Heimkehrer kommt am Tag der Prozesse, an dem der Bleibende sah: der Lebenslauf liest ihn, `_weltTag` — der Zug am
        // Regler der Uhr bewegt keine Krankheit; bis bewohner-satz las er den Tag der Sicht, und wer am Morgen krank daheim saß,
        // stand nach dem Zug über Mitternacht gesund 34 m fort an seinem Werk)
        const merke = () => blieb.set(s.timeOfDay * 24, lagen());
        // DIE ZERLEGUNG DER WIEDERKEHR (je Prüf-Stunde, nur gelesen): der Rückstand des Bleibenden hinter seinem Tag (`rueck`,
        // `_bewohnerGehen` — die Länge, um die ihn die Ankunft weiter längs seines Wegs stellt), sein gegangener Weg seit der Wende
        // und die Sekunden, die er mit Weg stand (Vorrang der Fahrbahn, Ausweichen) seit der letzten Prüf-Stunde
        const [zuege, warten] = [new Map(), new Map()];
        const zug = () => new Map(Sx().map((b) => [`${wer(b)}:${b.same}`, { rueck: b.rueck || 0, gegangen: b.gegangen || 0, warten: warten.get(b) || 0, tempo: b.tempo }])); // prettier-ignore
        let haendlerFehlt = [];
        // ENG GESCHNITTEN (`--art gestalt`: die Akte der Gestalt neben dem echt-Job, Deckel 180 s — Form und Lage, keine Zeit): kein
        // Tag, nur die Gestalt des Stands im Satz am Tag-Beginn (12,5 Uhr, wie die Messung des Tags um 12,5 Uhr), bis der Satz steht
        if (opts && opts.art === "gestalt") {
            for (let k = 0; k < 600 && !gestalt.n; k++) {
                takt(DT, SD);
                if (k % 10 === 9) gestaltMessen();
            }
            return { nur: "gestalt", gestalt };
        }
        // ENG GESCHNITTEN (`--art wiederkehr`: die Zerlegung der Wiederkehr neben dem echt-Job): derselbe Tag, ohne Gang-Fenster und
        // ohne die Messungen der Stunde — nur die Lagen der Prüf-Stunden und die Wiederkehr
        // (`--art wiederkehr:<id>`: dazu je Prüf-Stunde die Zeile jedes Leibs, dessen Name die id trägt)
        const eng = opts && /^wiederkehr(:|$)/.test(String(opts.art || ""));
        const engWer = eng ? String(opts.art).split(":")[1] || null : null;
        // (`--art wiederkehr:<id>:<messung>`: GENAU EINE Messung der Stunde zugeschaltet — haltung · blick · gestalt)
        const engMit = eng ? String(opts.art).split(":")[2] || null : null;
        // (… `:gang`: das Gang-Fenster mit seinen Messern — Können und Gang des Satzes)
        const engGang = engMit === "gang";
        const engMessung = { haltung: () => haltungMessen(), blick: () => blickMessen(), gestalt: () => gestaltMessen() }[engMit] || null; // prettier-ignore
        if (engMit && !engMessung && !engGang) throw new Error(`bewohner: --art wiederkehr:<id>:${engMit} — keine Messung dieses Namens`);
        for (let i = 1; i <= 240; i++) {
            const stunde = (s.timeOfDay * 24 + 0.1) % 24;
            const um = (h) => Math.abs(stunde - h) < 0.05;
            const SZ = saetze();
            for (let k = 0; k < takte; k++) {
                takt(DT, SD);
                for (const b of Sx()) if (b.weg && !b.drinnen && !(b.tempoJetzt > 0)) warten.set(b, (warten.get(b) || 0) + DT);
            }
            // DAS GANG-FENSTER: die Wege zum Werk, zum Platz, nach Hause, 10 s zu 1/60 s (eng: derselbe Gang, ohne seine Messer)
            if ([7.5, 12, 17.2].some(um) && eng && !engGang) for (let k = 0; k < 600; k++) takt(1 / 60, SD);
            if (eng && !engGang) {
                if (engMessung && [10, 12.5, 19].some(um)) engMessung();
                if (i % 15 === 0) [merke(), zuege.set(s.timeOfDay * 24, zug()), warten.clear()];
                continue;
            }
            if ([7.5, 12, 17.2].some(um)) {
                gang.luecke(); // das Fenster beginnt jede Spur neu
                koennen.fenster();
                for (let k = 0; k < 600; k++) {
                    takt(1 / 60, SD);
                    koennen.messen(1 / 60);
                    // Täter (Selbsttest): jede Instanz des Satzes steht in der Phase 0
                    if (hat("bewohner-gleiten"))
                        for (const m of SZ) {
                            const a = m.geometry.attributes.aGang;
                            if (a) for (let q = 0; q < a.count; q++) a.setX(q, 0);
                        }
                    gangMessen(SZ);
                }
                koennen.ende();
            }
            if (eng) {
                if (i % 15 === 0) [merke(), zuege.set(s.timeOfDay * 24, zug()), warten.clear()];
                continue;
            }
            z.alsLeib = Math.max(z.alsLeib, L.filter((g) => g.visible && !g.userData._drinnen).length);
            // die Soll-Orte: am Ort (≤ 1,5 m, gezeichnet) · drinnen (an der Tür) · unterwegs (sein Weg zu DIESEM Soll begann
            // eben oder schrumpfte um die Hälfte dessen, was sein Tempo seit dem letzten Ereignis trägt)
            for (const b of planFn ? liste : []) {
                const o = b.orte;
                const sh = (stunde + (hat("bewohner-plan6") ? 6 : 0)) % 24;
                // der Plan des Kerns, bit-gleich je Same (der Regen der Welt, wie der Wirt ihn reicht)
                const planJetzt = () => planFn(b.same, b.rolle, sh, o, r._weatherFieldFor().rain);
                if (JSON.stringify(planJetzt()) !== JSON.stringify(planJetzt())) planGleich = false;
                // DAS SOLL IST DAS DES WIRTS (`_bewohnerSoll`: der Plan des Kerns samt dem Regen an der Tür und dem Kranken, der daheim
                // bleibt — der Lebenslauf). Bis bewohner-satz las die Linse den Plan des Kerns allein, einen Zwilling des Solls: der
                // Kranke saß daheim, wie sein Gesetz es will, und die Linse zählte ihn fehlend (Steintal wohnhaus/feld #431794: 57 %)
                const soll = r._bewohnerSoll(b, sh);
                const ziel = soll.ziel;
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
            if ([10, 12.5, 19].some(um)) haltungMessen();
            if ([10, 12.5, 19].some(um)) gestaltMessen();
            if (um(12.5)) haendlerFehlt = ohneHaendler(S, true);
            if (um(2)) z.schmiede2 = anStation();
            if (i % 15 === 0) {
                merke(); // je 1,5 h
                zuege.set(s.timeOfDay * 24, zug());
                warten.clear();
            }
        }
        // gezählt: ein Leib mit Rig, der im Tag ging
        const gegangen = (g) => liste.some((b) => b.leib === g && SD.wSpur.get(b).gesamt > 0.5);
        // DIE STÄNDE (`standRaum`). Täter (Selbsttest), gezählt und zurück: der zweite Stand 0,3 m neben dem Punkt vor der ersten Tür
        const [s1, v0] = [liste.flatMap((b) => Object.values(b.orte)).filter((o) => o?.ur)[1], liste[0].orte.vor];
        const alt = [s1.x, s1.z];
        if (hat("bewohner-stapel")) [s1.x, s1.z] = [v0.x + 0.3, v0.z];
        const stapel = standRaum(liste);
        // Täter (Selbsttest), gezählt und zurück: derselbe Stand im Tritt des ersten Marktstands des Plans (ohne Stand: im ersten Brunnen)
        const stk = (S.plan.staende || [])[0] || (S.plan.brunnen || [])[0];
        if (hat("bewohner-im-stand") && stk) [s1.x, s1.z] = [S.ox + stk.x, S.oz + stk.z];
        const imStueck = standImStueck(liste, S);
        [s1.x, s1.z] = alt;
        const unter = liste.filter((b) => !(treffer.get(b) >= 0.9));
        // der Heimkehrer geht 1 h vor jeder Prüf-Stunde fort und findet die neu Geborenen (Takt 0). Täter: geboren am Ziel
        const wiederkehr = async () => {
            const ab0 = [];
            if (hat("bewohner-wiederkehr")) decke("_bewohnerAnkunft", () => () => {}, ab0);
            const [ueber, P, je] = [[], pm.clone(), new Map()];
            let [n, maxM, weit] = [0, 0, null];
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
                    if (d > maxM) weit = id;
                    [n, maxM] = [n + 1, Math.max(maxM, d)];
                    const zg = (zuege.get(T) || new Map()).get(id);
                    const zl = zg ? ` (Rückstand ${q3(zg.rueck)} m, gegangen ${q3(zg.gegangen)} m, gewartet ${q3(zg.warten)} s, Tempo ${q3(zg.tempo)} m/s)` : ""; // prettier-ignore
                    (je.get(id) || je.set(id, []).get(id)).push(`${q3(T)} Uhr ${q3(d)} m${zl}`);
                    if (!(d <= 2)) ueber.push(`${id} um ${q3(T)} Uhr ${q3(d)} m${zl}`);
                }
            }
            for (const f of ab0) f();
            // der Weiteste je Prüf-Stunde: die Lage des Bleibenden gegen die der Ankunft (aus Plan und Uhr), zerlegt
            const ueberWer = [...new Set(ueber.map((u) => u.split(" um ")[0]))];
            return { n, maxM: q3(maxM), ueberN: ueber.length, ueber: ueber.slice(0, 5), weitester: weit ? `${weit}: ${je.get(weit).join(" · ")}` : null, ueberJe: ueberWer.map((id) => `${id}: ${je.get(id).join(" · ")}`), gesucht: engWer ? [...je].filter(([id]) => id.includes(engWer)).map(([id, z]) => `${id}: ${z.join(" · ")}`) : undefined }; // prettier-ignore
        };
        if (eng) return { nur: "wiederkehr", wiederkehr: await wiederkehr(), gestalt: engMit === "gestalt" ? gestalt : undefined, haltung: engMit === "haltung" ? haltung : undefined }; // prettier-ignore
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
        if (hat("bewohner-kreuz")) sicht["bewohner-kreuz"] = { gestalt: gestaltK };
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
            koennen: koennen.zahl(),
            daheimWerk: daheimWerk(),
            haltung,
            gestalt,
            blick: {
                n: blicke.n,
                quote: blicke.n ? q3(blicke.treffer / blicke.n) : null,
                sektorMax: q3(Math.max(...blicke.sektor) / Math.max(1, blicke.sektor.reduce(addiere, 0))),
            },
            ohnePlatz: ohnePlatz.length,
            ohnePlatzWer: ohnePlatz.slice(0, 4).map(wer),
            stapel,
            imStueck,
            haendlerFehlt,
            staende: (S.plan.staende || []).length,
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
    // (`damageCreature`, Quelle Spieler) — der Zeuge weicht (`_bewohnerWeichen`, kollektiv#1): sein Stand liegt im Kreis der Tat;
    // steht er wieder, steht er weiter von ihr als sein alter Stand (`fort`), und der vierte Gang geht durch den Stand, den er jetzt hat.
    // Täter (Selbsttest, EIN Lauf): der starre Kopf · kein Reiz (der Blick folgt dem Bewegten nicht) · wer steht, macht keinen Platz ·
    // der Zeuge vergisst · der Zeuge bleibt stehen.
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
        // DER VERKEHR GEHT MIT (Welle SAMEN), wie im Spiel (`_gameLoopTick`): der Schritt der Wagen vor den Leuten (`_verkehrSchritt`,
        // im Sim-Schritt), nach ihnen Einsteigen, Heimfahrt, Aussteigen (`_tickVerkehr`, im Takt des Bilds). Ohne ihn stand ein Wagen im
        // Zustand „fährt“ still und hielt seine Querung (`_verkehrVorrang`: die Bahn durch den Ort, den er hält) für immer — am
        // Samen-Wurf wartete der Zeuge wohnhaus/schmiede #724672 3 600 Takte am Rand der Fahrbahn vor einem Wagen 25,5 m fort
        // (vlong 1,915 m/s): er wich 0,712 m statt 22,2 m. Der Takt der übrigen Leute-Proben geht noch ohne ihn (offen, `leute`)
        const schritt = () => [takt(dt), r._verkehrSchritt(dt), leute(dt), r._tickVerkehr()];
        // DER WEG: aus 9 m schräg vor ihm (± 0,6 rad zu seinem Blick) durch seinen Stand und 12 m weiter, je halben Meter frei
        // von Grundriss — und derselbe 2 m daneben (der Vorbeigang); wer sonst dort steht, macht dem Spieler Platz
        const offen = (x, z) => r._landAt(x, z) && !["haus", "bau"].includes(r._imGrundriss(x, z, 0.5));
        const frei = (a, u) => [...Array(43).keys()].every((t) => offen(a.x + (u.x * t) / 2, a.z + (u.z * t) / 2));
        // der Vorbeigang 2 m daneben auf der Seite, die die Peilung auf 3 m weitet: ±0,6 rad + atan(2/√5) ≈ 76° neben seinem Blick
        // (der Kopf muss sich wenden, der Leib nicht)
        // EINER, DER ALLEIN GENUG STEHT (w28-stadt-grammatik): die Probe misst die Begegnung mit EINEM. Von den Bewohnern im
        // Nah-Kreis leben höchstens `nahLeiber` der Bedeutendsten (`_tickBewohner`); wer in einer Gruppe der Fünfte ist, steht im
        // Satz seiner Gestalt und wendet den Kopf nicht. Am Markt der Grammatik stehen um 10 Uhr vier Leute des Gasthauses
        // #419347 binnen 3,2 m — der erste Stehende der Liste war ihr Fünfter (Bedeutung 134 gegen 139–241: als Leib im Bild
        // true,false,false,true). Die Gruppe ist eine eigene Klasse, offen im Rumpf der Abgabe.
        const allein = (k) => S.liste.filter((o) => o !== k && o.leib && !o.drinnen && ab(o.leib.position, k.leib.position) < 2 * A.BEWOHNER.begegnungM).length < A.BEWOHNER.nahLeiber - 1; // prettier-ignore
        // DER WEG UM IHN: aus 9 m schräg vor seinem Gesicht (±0,6 rad) durch seinen Stand, der Vorbeigang 2 m daneben — der erste freie
        const wegAm = (p, blick, faecher) => {
            for (const dw of faecher) {
                const u = { x: -Math.sin(blick + dw), z: -Math.cos(blick + dw) };
                const [a, v] = [{ x: p.x - u.x * 9, z: p.z - u.z * 9 }, { x: -2 * Math.sign(dw) * u.z, z: 2 * Math.sign(dw) * u.x }]; // prettier-ignore
                if (frei(a, u) && frei({ x: a.x + v.x, z: a.z + v.z }, u)) return { a, u, v };
            }
            return null;
        };
        const wegUm = (k, faecher = [0.6, -0.6]) => wegAm(k.leib.position, k.leib.rotation.y, faecher);
        // DER FÄCHER DES VIERTEN GANGS (w28-bau-rezept-tuer): der Weich-Ort ist ein Stand des Gesetzes, oft vor Häusern — der
        // Gang sucht den ersten freien von acht Winkeln (0,3–1,2 rad neben seinem Blick: der Kopf wendet sich immer). Bis hier nur
        // ±0,6 rad: im Dorf des Bau-Rezepts stand #946581 4–5 m vor zwei Häusern, beide Wege zu (+0,6 nach 14 m, −0,6 im Haus)
        const FAECHER4 = [0.6, -0.6, 0.9, -0.9, 0.3, -0.3, 1.2, -1.2];
        // DER ORT DER TAT NACH DEM GESETZ (pendler-anschluss): wo der Spieler schlägt, wählt die Probe — wohin der Zeuge flieht, das
        // Gesetz (`_bewohnerWeichOrt`: derselbe Ort, den ihm `_bewohnerWeichen` im Schlag gibt, aus derselben Lage, Stunde und
        // Belegung). Die Tat liegt am ersten freien Punkt der Spirale 5 m neben seinem Stand, nach dem ihn das Gesetz an einen Ort
        // weichen lässt, durch den der vierte Gang geht — das Gesetz des Stands verspricht Raum für einen Gehenden neben ihm
        // (`standRandM`), nie 21 m gerade Bahn im Fächer seines Blicks. Bis hier schlug sie am ersten freien Punkt: seit dem Werk am
        // Weg (die Stände der Pendler an der Tür ihres Werks) floh #946581 an den Stand vor pfarrhaus #16036 (−39,2/−171,1), um ihn
        // trug nur −112° einen Gang (begegnung-starr und begegnung-steht rot aus fremdem Grund); eine Wahl des Zeugen vorab sagte
        // im ganzen Teil 3 den Ort falsch voraus (#809070 floh an −62,7/−147,9, ohne Gang rundum — Uhr und Belegung gehen weiter)
        const tatAm = (k, um = k.ziel) => {
            const stunde = (((s.timeOfDay % 1) + 1) % 1) * 24; // wie der Zeuge sie liest (`_bewohnerZeuge`)
            const belegt = new Set(S.liste.map((x) => x.ziel));
            return spirale(um.x + 5 - P0.x, um.z - P0.z, 4, 1.5, (x, z) => {
                if (!offen(x, z)) return null;
                const t = neben(x, z);
                // die Zeugen vor ihm in der Liste weichen zuerst und belegen ihren Ort (`_bewohnerZeuge`, in derselben Reihe)
                const B = new Set(belegt);
                // (wie `_bewohnerWeichen`: sein altes Weichen fällt, bevor er sein Soll liest — die Frage stellt es danach zurück)
                const weichOrt = (o) => {
                    const alt = o.weichen;
                    o.weichen = null;
                    try {
                        return r._bewohnerWeichOrt(S, o, t, stunde, B);
                    } finally {
                        o.weichen = alt;
                    }
                };
                for (const o of S.liste) {
                    if (o === k) break;
                    if (!o.leib || o.drinnen || o.amSteuer || o.ankunft || !o.ziel || ab(o.leib.position, t) ** 2 >= A.BEWOHNER.zeugeM ** 2) continue; // prettier-ignore
                    const V = weichOrt(o);
                    if (V) B.add(V.ort);
                }
                const W = weichOrt(k);
                return W && wegAm(W.ort, Number.isFinite(W.ort.blick) ? W.ort.blick : k.leib.rotation.y, FAECHER4) ? Object.assign(t, { weich: W.ort }) : null; // prettier-ignore
            });
        };
        let [b, w] = [];
        for (const k of S.liste)
            if (!b && !k.drinnen && !k.weg && k.da && allein(k) && (w = wegUm(k)) && tatAm(k)) b = k;
        if (!b) return { fehler: "kein Stehender mit freiem Weg um 10 Uhr, an seinem Stand und am Ort, an den er vor einer Tat neben ihm wiche" }; // prettier-ignore
        const [g, stand] = [b.leib, b.ziel];
        // DER KOPF IM BILD: seine Welt-Matrix (die dritte Spalte: wohin das Gesicht zeigt) gegen den Spieler
        // (den Kopf trägt nur der Leib: in 3 m hat ihn die Nah-Wahl gegeben — fehlt er, bricht die Probe beim Namen)
        const kopf = () => {
            const R = g.userData.rig;
            const d = ab(pm, g.position).toFixed(2);
            if (!R) throw new Error(`begegnung: ${b.rolle} #${b.heim} trägt in ${d} m keinen Leib`);
            return R.head.matrixWorld.elements;
        };
        const gier = (e = kopf()) =>
            Math.abs(grad(wrap(Math.atan2(pm.x - e[12], pm.z - e[14]) - Math.atan2(e[8], e[10]))));
        // DER KOPF ENDET AM RING (w28-leib-im-ring): jenseits des Nah-Kreises gibt der Ring den Leib zurück (bei
        // nahM + nahHystM + ringHystM = 12 m) — dort gibt es keinen Kopf, der sich wenden könnte, die Frage endet. Im Nah-Kreis
        // selbst MUSS er ihn tragen: dort bricht `kopf()` weiter beim Namen
        const traegt = () => !!g.userData.rig || ab(pm, g.position) <= A.BEWOHNER.nahM;
        // EIN GANG (versatz quer zum Weg): je Takt der Kreatur-Takt und die Bewohner, im Fenster der echte Frame aus Ego
        const gang = (v, W = w) => {
            const a = { x: W.a.x + W.v.x * v, z: W.a.z + W.v.z * v };
            stell(a.x, a.z);
            r._spielerLageAlt = null;
            // DER BLICK GEHT MIT (w28-bau-rezept-tuer): der Spieler sieht in seine Richtung, auch ohne Fenster — die Nah-Wahl fragt
            // das Bild (`_bedeutung`), und ein Blick, den keiner setzt, ist der von gestern
            kamera(W.u.x, W.u.z);
            for (let i = 0; i < 60; i++) schritt();
            const z = { zuS: null, dMin: 99, beruehrt: 0, imBild: null };
            for (let l = 0, t = 0, e = null; l <= 21; l += 1.4 * dt, t += dt) {
                stell(a.x + W.u.x * l, a.z + W.u.z * l); // der Lauf: der Kreatur-Takt liest ihn aus der Lage
                schritt();
                kamera(W.u.x, W.u.z);
                if (echt) r._loopRender();
                const d = ab(pm, g.position);
                z.dMin = Math.min(z.dMin, Math.round(d * 1000) / 1000);
                z.beruehrt += S.liste.filter((o) => !o.drinnen && ab(pm, o.leib.position) < 2 * A.PLAYER_WALL_RADIUS).length; // prettier-ignore
                // am Ereignis: der Kopf neben dem Spieler (`amEreignis`) und der Spieler neben dem LEIB des Zeugen (`seitEreignis`:
                // der Vorbeigang kommt von der Seite — der Leib wendet sich dem Reiz nicht zu, `_bewohnerKopf`)
                if (e === null && d <= A.BEWOHNER.begegnungM)
                    [e, z.amEreignis, z.seitEreignis] = [t, Math.round(gier()), Math.round(Math.abs(grad(wrap(Math.atan2(pm.x - g.position.x, pm.z - g.position.z) - g.rotation.y))))]; // prettier-ignore
                if (e !== null && z.zuS === null && traegt() && gier() <= 10)
                    [z.zuS, z.imBild] = [Math.round((t - e) * 1000) / 1000, !!b.nah && (!echt || (g.visible && imBlick(kopf()[12], kopf()[13], kopf()[14])))]; // prettier-ignore
            }
            // der Spieler steht am Ende, bis der Bewohner wieder an seinem Ort steht (der vierte Gang ist der letzte: kein Warten)
            for (let i = 0; W === w && i < 1800 && !(b.da && !b.weg && !b.platz && ab(g.position, stand) < 0.5); i++) schritt(); // prettier-ignore
            return z;
        };
        // DER LAUF: der Vorbeigang, zwei Gänge ohne Erinnerung, der Schlag 5 m neben ihm, der vierte Gang
        let zugebaut = false; // (der Täter „zugebaut“: nach der Flucht ist jeder Punkt Grundriss)
        const lauf = () => {
            g.userData.memory = [];
            // wer im Lauf davor (ein Täter des Selbsttests) wich, kehrt erst an seinen Stand zurück (die Uhr der Probe steht: er
            // liest seinen Plan hier, `_bewohnerZiel`)
            if (b.weichen) [b.weichen, b.ziel] = [null, null];
            r._bewohnerZiel(b, (((s.timeOfDay % 1) + 1) % 1) * 24, true);
            for (let i = 0; i < 3600 && !(b.da && !b.weg && !b.platz && ab(g.position, stand) < 0.5); i++) schritt();
            const G = [gang(1), gang(0), gang(0)];
            const ort = tatAm(b, stand); // im Schlag selbst gefragt: dieselbe Lage, Stunde und Belegung wie das Weichen
            if (!ort) return { fehler: `kein Ort der Tat neben ${wer(b)}, nach dem ihn das Gesetz an einen Ort mit freiem Gang weichen ließe` }; // prettier-ignore
            const opfer = tier(ort, "wesen"); // ohne Ort wirft der Wurf beim Namen
            const tat = { x: opfer.position.x, z: opfer.position.z };
            r.damageCreature(opfer, 1e9, { source: "player" });
            const furcht = r._kreaturFurchtErinnert(g);
            // DER VIERTE GANG GEHT DURCH DEN STAND, AN DEM DER ZEUGE JETZT STEHT (Welle SAMEN): er weicht (`_bewohnerWeichen`, sein
            // Weg beginnt im Schlag) — die Probe wartet, bis er wieder steht, misst dort, wie weit er von der Tat fortging (`fort`, gegen
            // seinen alten Stand), und geht dann aus 9 m schräg vor ihm durch diesen Stand: das Gesetz der Furcht (der Raum, den ein
            // Stehender dem Spieler lässt, `_bewohnerSpielerAbstand` bei Furcht 1: 1,84 m) an einem, der steht. Bis hier begann der
            // Gang am alten Stand im Schlag selbst und lief mit der Flucht um die Wette: am main ging feld #617311 aus dem Weg (d 8,534 m,
            // keine Begegnung — die Zeile bestand, ohne zu messen), am Samen-Wurf floh wohnhaus/schmiede #724672 in den Gang
            // (0,45 m, 31 Takte Berührung, b0b898696, Lauf 44710772496). Wer weicht, geht als Gehender (`_bewohnerAusweichen`) —
            // dass der Spieler ihn auf der Flucht überholen kann, ist ehrlich offen, nicht die Frage dieser Zeile
            // (das Warten gilt dem Ort, den das Gesetz ihm gab — `b.weichen.ort`; im Schlag selbst steht er noch: sein Weg beginnt erst
            // im nächsten Takt, ein Warten auf „steht“ endete dort sofort, fort 0,712 m. Ohne Weichen gibt es nichts zu warten)
            const W4 = b.weichen && b.weichen.ort;
            for (let i = 0; W4 && i < 3600 && !(b.da && !b.weg && !b.platz && ab(g.position, W4) < 0.5); i++) schritt();
            const fort = Math.round((ab(g.position, tat) - ab(stand, tat)) * 1000) / 1000;
            zugebaut = true;
            // (der Fächer um den Blick seines Weich-Orts — dasselbe Maß, nach dem die Tat gewählt ist; der Leib selbst dreht nicht
            // unter jedem Täter dorthin, `_bewohnerKopf`)
            const w4 = wegAm(g.position, W4 && Number.isFinite(W4.blick) ? W4.blick : g.rotation.y, FAECHER4);
            zugebaut = false;
            if (!w4) {
                // (wo er steht und wohin er sieht, und welche der 16 Richtungen um ihn einen Gang tragen — Grad zu seinem Blick)
                const rund = [...Array(16).keys()].map((j) => (j * Math.PI) / 8 - Math.PI).filter((dw) => wegUm(b, [dw]));
                const G4 = b.leib.position;
                const von = W4 && S.liste.find((k) => Object.values(k.orte).includes(W4));
                const wessen = von ? `${wer(von)} ${Object.keys(von.orte).find((n) => von.orte[n] === W4)}${W4.anker ? " an " + W4.anker.x.toFixed(1) + "/" + W4.anker.z.toFixed(1) : ""}${W4.ur ? " ur " + W4.ur.x.toFixed(1) + "/" + W4.ur.z.toFixed(1) : ""}` : "-"; // prettier-ignore
                return { fehler: `kein freier Weg um den Zeugen ${wer(b)} an seinem neuen Stand (${G4.x.toFixed(1)}/${G4.z.toFixed(1)}, Weich-Ort ${W4 ? W4.x.toFixed(1) + "/" + W4.z.toFixed(1) : "-"} der Stand von ${wessen}, das Gesetz sagte vor der Tat ${ort.weich ? ort.weich.x.toFixed(1) + "/" + ort.weich.z.toFixed(1) : "-"}, frei rundum: ${rund.map((dw) => Math.round(grad(dw)) + "°").join(" ") || "keine"})` }; // prettier-ignore
            }
            G.push(gang(0, w4));
            const je = (k) => G.map((x) => x[k]);
            return {
                ...{ wer: wer(b), furcht, zuS: je("zuS"), amEreignis: G[0].amEreignis, begegnungM: A.BEWOHNER.begegnungM },
                ...{ seitEreignis: G[0].seitEreignis, augeNurGrad: +grad(A.BEWOHNER.augeNurRad).toFixed(1), reizM: A.BEWOHNER.reizM },
                ...{ imBild: je("imBild"), dMin: je("dMin"), beruehrt: je("beruehrt"), fort },
                weichOrt: W4 ? [+W4.x.toFixed(1), +W4.z.toFixed(1)] : null,
            };
        };
        if (!taeter) return lauf();
        const sicht = {};
        for (const [t, name] of Object.entries({
            "begegnung-starr": "_bewohnerKopf",
            "begegnung-reizlos": "_bewohnerReiz",
            "begegnung-steht": "_bewohnerPlatz",
            "begegnung-vergessen": "_bewohnerZeuge",
            "begegnung-bleibt": "_bewohnerWeichen",
            "begegnung-zugebaut": "_imGrundriss",
        })) {
            const zurueck = [];
            const zu = (f) => function (...a) { return zugebaut ? "haus" : f.apply(this, a); }; // prettier-ignore
            decke(name, name === "_imGrundriss" ? zu : () => () => false, zurueck);
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
    if (st && st.imStueck) soll(!st.imStueck.length, `Stadt: Stände in einem Stück des Platzes: ${st.imStueck.length} (${st.imStueck.slice(0, 4)})`); // prettier-ignore
    if (st && st.haendler) soll(!st.haendler.length, `Stadt: Stände ohne Händler: ${st.haendler.length} von ${st.staende} (${st.haendler.slice(0, 4)})`); // prettier-ignore
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
        const ow = v.ohneWeg || { zeilen: "ungemessen", n: "ungemessen", wer: [] };
        soll(
            ow.zeilen === 0,
            `${wo}ohne Weg: ${ow.zeilen} Bruch-Zeilen „erreicht keinen Weg frei“ im Buch des Melders (${ow.n}×; ${ow.wer.join(" · ") || "—"})`
        );
        soll(
            v.durch > 0 && v.tuer === v.durch,
            `${wo}nicht über die Tür: ${v.durch - v.tuer} von ${v.durch} (${v.falsch})`
        );
        soll(
            !v.ausserN && !v.steckenN && v.aufWeg >= 0.85 && !v.kurzN && !v.beruehrN,
            `${wo}Wege ${v.wegeMin}–${v.wegeMax} (${v.ausser}), ${v.steckenN} Steckenbleiber (${v.stecken}), auf Wegen ${v.aufWeg} (Soll ≥ 0,85), Strecke min ${v.streckeMin} m (Soll ≥ 100 je Tag: ${v.kurz}; krank ${v.krankN}: ${v.krank}), Berührung: ${v.beruehrN} (${v.beruehr})`
        );
        soll(
            v.stand.n >= 10 && v.stand.mm <= 10,
            `${wo}der Stand nach dem Gang: die Sohle höchstens ${v.stand.mm} mm vom Boden ihres Punkts (Soll ≤ 10; ${v.stand.ueber} von ${v.stand.n} Halten darüber; ${v.stand.wer})`
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
            `Wiederkehr nach 1 h Abwesenheit: ${wk.ueberN} von ${wk.n} über ±2 m (max ${wk.maxM} m: ${wk.ueber}; der Weiteste je Prüf-Stunde ${wk.weitester})`
        );
        soll(sg.schlupf <= 0.05 && sg.wegLeib >= 10, `der Satz gleitet: Schlupf ${sg.schlupf} über ${sg.wegLeib} m`);
        const kn = z.koennen || { n: 0, ohne: "ungemessen", wer: [], geher: 0, rho: "ungemessen", haelften: "ungemessen" };
        soll(
            kn.n > 0 && kn.ohne === 0 && kn.geher >= 10 && kn.rho >= 0.5,
            `das Können trägt den Gang nicht: ${kn.ohne} von ${kn.n} Bewohnern gehen nicht Einheit × gang × lauf (${kn.wer}), Rang-Korrelation Können ↔ gegangenes Tempo ${kn.rho} über ${kn.geher} Geher (Soll ≥ 0,5; die Hälfte mit mehr Können geht × ${kn.haelften}, Streuung des Tempos ${kn.cv})`
        );
        soll(
            kn.bezugN >= 10 && Math.abs(kn.bezug - 1) <= kn.bezugTol,
            `der Bezugs-Leib des Gangs ist nicht der erwachsene Median: ${kn.bezugN} Erwachsene der Liste laufen mit 30 J im Median ${kn.bezug} des Bezugs (Soll 1 ± ${kn.bezugTol}; koerper KOENNEN_BEZUG)`
        );
        const dw = z.daheimWerk || { n: 0, falsch: "ungemessen", wer: [] };
        soll(
            dw.n > 0 && dw.falsch === 0,
            `daheim am Werk: ${dw.falsch} von ${dw.n} Bewohnern, deren Werk ihr Haus ist, tragen den Stand ihres Werks als Abend oder Tisch (${dw.wer}) — der Abend daheim sitzt vor der Tür, der Tisch daheim ist drinnen`
        );
        const ht = z.haltung || { n: 0, mit: 0, maxGrad: "ungemessen", wer: "", je: {} };
        soll(
            ht.n >= 10 && ht.mit >= 3 && ht.maxGrad <= 1,
            `die Haltung des Stands im Satz: ${ht.maxGrad}° zum nahen Leib an ${ht.wer || "—"} (Soll ≤ 1°; ${ht.n} Stehende, ${ht.mit} mit Haltung, die Körper-Ruhe des Mess-Leibs ${ht.ruheGrad}°; je Stand an der Zeile ${Object.entries(ht.je).map(([k, v]) => `${k} ${v}°`).join(" · ")}; gemessen zwischen zwei Zeilen ${ht.zwischenGrad}° an ${ht.zwischenWer || "—"} — ${Object.entries(ht.zwischen || {}).map(([k, v]) => `${k} ${v}°`).join(" · ")}; im Wechsel des Gewichts ${ht.wechsel || 0} Stehende, ${ht.wechselGrad || 0}°; der Satz hinter der Uhr ≤ ${ht.verzugS || 0} s)`
        );
        const gs = z.gestalt || { n: 0, gestalten: 0, max: "ungemessen", wer: "", mass: "", je: [] };
        // das Soll: 5 % je Maß — die Welt der Linse (Pullover) hält es (9a1552f3: Schulter 2,4 · Taille 2,0 · Hüfte 3,8 %, 73 im
        // Satz). Offen am Dorf unter dem Poncho (Werkbank, GTX 1050: Schulter ≤ 4,8 · Taille ≤ 12,7 · Hüfte ≤ 7,4 %): dem Netz der
        // Menge (Kante 0,21 E) fehlt die Ecke unter dem Arm, die Anlage (koerper armAnlage) drückt die Ecken vorn und hinten nicht
        // ein — eine Runde Entspannung tauscht Taille gegen Hüfte (Ofen, 40 Bewohner: Taille Median 7,4 → 5,5 %, Hüfte 2,8 → 8,5 %)
        const GESTALT_SOLL = [5, 5, 5];
        soll(
            gs.n >= 10 && gs.gestalten >= 2 && gs.je.length === 3 && gs.je.every((x, k) => x <= GESTALT_SOLL[k]),
            `die Gestalt des Stands im Satz: ${gs.max} % zum nahen Leib an ${gs.wer || "—"} (${gs.mass || "—"}; bedeckte Breite je Körperhöhe; ${gs.n} im Satz, ${gs.gestalten} Gestalten mit nahem Leib; Schulter · Taille · Hüfte höchstens ${gs.je.join(" · ")} %, Soll ≤ ${GESTALT_SOLL.join(" · ")} %, Ziel 5 % je Maß)`
        );
        soll(
            b.n >= 10 && b.quote >= 0.9 && b.sektorMax <= 0.5,
            `der Blick der Stehenden: ${b.quote} von ${b.n} auf ihr Ziel, ${b.sektorMax} in einer Richtung`
        );
        soll(!z.ohnePlatz, `ohne Platz: ${z.ohnePlatz} (${z.ohnePlatzWer.join(" · ")})`);
        soll(!z.stapel.length, `Stände gestapelt: ${z.stapel.length} näher als raumM (${z.stapel.slice(0, 4)})`);
        soll(!z.imStueck.length, `Stände in einem Stück des Platzes: ${z.imStueck.length} (${z.imStueck.slice(0, 4)})`);
        soll(!z.haendlerFehlt.length, `Stände ohne Händler um 12:30: ${z.haendlerFehlt.length} von ${z.staende} (${z.haendlerFehlt.slice(0, 4)})`);
        // jedes Haus trägt die Hülle seines Studios (die Wand der Wege)
        soll(z.huellen === z.haeuser, `${z.haeuser - z.huellen} Häuser ohne Hülle`);
    }
    // DIE BEGEGNUNG (mensch.K5 Staffel 1): je Gang (der Vorbeigang 2 m daneben, drei durch seinen Stand) der Kopf auf 10° zum
    // Spieler ≤ 0,5 s ab 3 m (als Leib, im Fenster im Bild), der Blick folgt dem Reiz, kein Bewohner näher als zwei Kapseln; die Gewalt neben ihm weitet
    // den Abstand des vierten Gangs um ≥ 0,3 m, die Gegenprobe ohne Erinnerung bleibt auf 0,15 m beim zweiten; nach der Gewalt WEICHT
    // der Zeuge (`_bewohnerWeichen`): steht er wieder, steht er ≥ begegnungM weiter von der Tat als sein alter Stand; kam der
    // Spieler ihm im vierten Gang (durch seinen neuen Stand) nicht auf begegnungM nahe, gab es keinen Kopf zu wenden
    if (name === "begegnung") {
        const [zu, d] = [z.zuS, z.dMin];
        const begegnet = (i) => i < 3 || d[3] <= z.begegnungM;
        soll(
            zu.every((t, i) => !begegnet(i) || (t !== null && t <= 0.5)) && z.imBild.every((x, i) => !begegnet(i) || x),
            `Kopf-Zuwendung ab 3 m: ${zu.join(" / ")} s (Soll ≤ 0,5; als Leib im Bild ${z.imBild})`
        );
        // DER BLICK FOLGT DEM REIZ (stand-lebt 2, `_bewohnerReiz`): wer steht, schaut dem nächsten Bewegten schon ab `reizM` nach —
        // am Ereignis (3 m) kommt der Vorbeigang von der Seite seines Leibs (≥ 30°), und sein Kopf steht bis auf die Spanne der
        // Augen (`augeNurRad`) auf dem Spieler. Bis stand-lebt 2 wandte sich der Kopf erst ab 3 m (das Maß hieß „der Vorbeigang ab
        // ≥ 30°“ am Kopf selbst); der Täter „reizlos“ (kein Reiz) steht am Ereignis wie damals neben dem Spieler.
        soll(
            z.seitEreignis >= 30 && z.amEreignis <= Math.round(z.augeNurGrad),
            `der Blick folgt dem Reiz nicht: am Ereignis steht der Kopf ${z.amEreignis}° neben dem Spieler (Soll ≤ ${Math.round(z.augeNurGrad)}°, die Spanne der Augen — ab ${z.reizM} m schaut, wer steht, dem Bewegten nach), der Vorbeigang kommt ${z.seitEreignis}° neben seinem Leib (Soll ≥ 30)`
        );
        soll(
            Math.max(...z.beruehrt) === 0 && Math.min(...d) > 0.7,
            `Berührung: ${z.beruehrt}, Abstand min ${d.join(" / ")} m`
        );
        soll(
            z.furcht > 0 && d[3] - d[1] >= 0.3 && Math.abs(d[2] - d[1]) <= 0.15,
            `die Erinnerung lenkt den Abstand nicht: ohne ${d[1]} · Gegenprobe ${d[2]} · nach der Gewalt ${d[3]} m (Furcht ${z.furcht})`
        );
        soll(z.fort >= z.begegnungM, `der Zeuge weicht nicht: ${z.fort} m weiter von der Tat als sein Stand (Soll ≥ begegnungM ${z.begegnungM} m)`);
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
            ["bewohner-koennen", /das Können trägt den Gang nicht/],
            ["bewohner-bezug", /der Bezugs-Leib des Gangs ist nicht der erwachsene Median/],
            ["bewohner-abendstand", /daheim am Werk/],
            ["bewohner-haltung", /die Haltung des Stands im Satz/],
            ["bewohner-gestalt", /die Gestalt des Stands im Satz/],
            ["bewohner-kreuz", /die Gestalt des Stands im Satz: [\d.]+ % zum nahen Leib an kind\/kind #\d+ \(Gestalt \d+\) \(Hüfte; Ton [\d.]+, Masse [\d.]+, Achse __tonMasse/], // prettier-ignore
            ["bewohner-grund", /der Stand nach dem Gang/],
            ["bewohner-nord", /der Blick der Stehenden/],
            ["bewohner-daheim", /ohne Platz/],
            ["bewohner-stapel", /Stände gestapelt: [1-9]/],
            ["bewohner-im-stand", /Stände in einem Stück des Platzes: [1-9]/],
            ["bewohner-stand-leer", /Stadt: Stände ohne Händler: [1-9]/],
            ["bewohner-wiederkehr", /Wiederkehr nach 1 h Abwesenheit: [1-9]/],
            ["bewohner-stadt-blind", /Stadt: Durchdringung: [1-9]/],
            ["bewohner-stadt-rempeln", /Berührung: [1-9]/],
            ["bewohner-tuer", /Stadt: nicht über die Tür: [1-9]\d* von \d+ \([^·]*drinnen soll true, [\d.]+ m von seiner Tür/],
            ["bewohner-ohne-weg", /Stadt: ohne Weg: [1-9]\d* Bruch-Zeilen „erreicht keinen Weg frei“ im Buch des Melders \(\d+×; [^#]+ #\d+ — der Ort/], // prettier-ignore
        ],
        // die volle Stadt (`--ort stadt-voll`)
        "bewohner@stadt-voll": [
            ["bewohner-voll-starr", /[1-9]\d* draußen, 0 mit laufendem Gang/],
            ["bewohner-voll-leer", /im Nah-Ring 0 draußen/],
        ],
        begegnung: [
            ["begegnung-starr", /Kopf-Zuwendung/],
            ["begegnung-reizlos", /der Blick folgt dem Reiz nicht/],
            ["begegnung-steht", /Berührung/],
            ["begegnung-vergessen", /die Erinnerung lenkt den Abstand nicht/],
            ["begegnung-bleibt", /der Zeuge weicht nicht/],
            ["begegnung-zugebaut", /kein freier Weg um den Zeugen/],
        ],
    },
    urteil: menschUrteil,
};
