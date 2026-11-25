// DIE RICHTER-STATIONEN DER PERSPEKTIVE macht (Meisterkarte 2, Kapitel mensch; die Fabrik k2-mensch.js): je Leiter EINE Probe in der
// warmen Welt der Sitzung, die ALLE Sprossen der Leiter über dieselbe Messung urteilt — die Sprossen unterscheiden sich im Umfang und
// im Soll. Gemessen wird am ERGEBNIS der Welt: die Pläne der Orte (`_ortPlaene`, ihre Slots, Rollen, Mauern), der Export der Foundry
// (`_foundryRequestSettlement`, derselbe Weg, auf dem der Akt und das Wachstum Welt werden), der Mauer-Pool (`state.stlMauer`), die
// Bewohner (`_bewohnerSiedlungen`) und ihre Antwort auf eine Tat des Spielers über die Zeit (`damageCreature` → `_bewohnerZeuge`).
// Wo die Welt den Umfang nicht stellt (zehn Gemeinwesen mit Grenze, zwei Bewaffnete, eine Wache), misst die Probe, was sie stellt,
// und urteilt „Umfang nicht erzeugbar“ oder „fehlender Leser“ mit der Stelle im Spiel-Baum — nie ein Skip.
"use strict";

module.exports = (F) => [
    // ───────────────────────── mensch.macht.grenze — Gemeinwesen, Grenzen, Reiche ─────────────────────────
    // EINE Messung: die Orte mit Herrn (ein Slot der Rolle burg) um den Messort, das Reich des Gesetzes (fachwerk `siedlungsReich`, das
    // `_imReichEinesOrts` liest), die Zeichen einer Grenze in der Szene (ein Bau, dessen Bauplan Grenze oder Markstein heißt), die
    // Gemeinwesen des Rang-Gesetzes auf 32 × 32 km (`_autoSettlementCellInfo`) und die Ebenen über dem Ort (Bund, Kolonie, fremde Art).
    F.leiter("mensch.macht.grenze", {
        sek: 45,
        pfad: ["stamm/siedlung-ort.js", "stamm/siedlung-wege.js", "fachwerk-core.js"],
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const w = await K.welt("return await (" + H.seite.GRENZE + ")(r, T, " + JSON.stringify({ fristMs: 12000 }) + ");", 40000);
            if (!w || w.fehler) throw new Error("die Welt der Grenze: " + ((w && w.fehler) || "ohne Antwort"));
            H.zeile("Grenze: " + JSON.stringify(w));
            const reich = "Reich " + w.reichM + " m um den Ort mit Herrn (" + w.reichKm2 + " km²)";
            const keine = "keine Grenze im Land: das Reich eines Orts (fachwerk siedlungsReich, `_imReichEinesOrts`) hält nur Gründungen und Herden fern — kein Bau, kein Weg, kein Zeichen zeigt es (" + w.zeichen + " Grenzzeichen in der Szene; " + reich + ")";
            // die Grenze im Bild (Marksteine der Szene binnen 300 m des Rands, Band 250–600 m Steinweite) gegen die Karte (der Rand des Reichs)
            await K.schritt(1, async () =>
                K.zahl(1, {
                    n: w.herren,
                    werte: { grenzeKarte: w.grenzeKarte, burgLage: w.burgLage },
                    beleg: reich + " · Grenzzeichen in der Szene " + w.steine + ", davon am Rand " + w.steineAmRand + " · Rand im Bild " + w.imBild + " von " + w.randPunkte + " Punkten · Burg in Lage " + w.burgLage,
                    taeter: "stamm/siedlung-ort.js _markSteinSetzen — der Stein steht nur, wo der Weg eines Paars geladener Orte das Reich verlässt (fachwerk grenzeAmWeg), je Paar einer; der Rand des Reichs zwischen den Wegen trägt kein Zeichen (" + keine + ")",
                })
            );
            await K.schritt(2, async () => K.leser(2, { n: w.gemein, fehlt: "keine Grenze aus der Kostenfläche: " + w.gemein + " Gemeinwesen in " + w.zellen + " von " + w.zellenSoll + " Zellen (32 × 32 km) tragen kein Reich mit Grenze, kein Fluss und kein Kamm verlegt eine", wo: "stamm/siedlung-ort.js:1609" }));
            await K.schritt(3, async () => K.nicht(3, { n: w.bund, fehlt: "keine zweite Ebene: kein Bund, kein Stadtstaat über den Orten (" + w.gemein + " Gemeinwesen ohne Ordnung über sich)" }));
            await K.schritt(4, async () => K.nicht(4, { n: w.chronikJ, fehlt: "keine Herrschaft über die Zeit: der Ort mit Herrn trägt eine Chronik von " + w.chronikJ + " Jahren, kein Aufstieg, kein Fall, der Hauptort wandert nie" }));
            await K.schritt(5, async () => K.nicht(5, { n: w.reichKm2, fehlt: "kein Reich über den Ort hinaus: das größte Reich misst " + w.reichKm2 + " km², keine Straße, Garnison oder Münze eines Reichs" }));
            await K.schritt(6, async () => K.nicht(6, { n: w.kolonien, fehlt: "keine Menschenzeit und kein Übersee: kein Ort trägt eine Kolonie, keine Hochseeschifffahrt" }));
            await K.schritt(7, async () => K.nicht(7, { n: w.ordnungen, fehlt: "keine Stufenfolge der Ordnung (Horde bis Weltordnung): die Welt trägt " + w.ordnungen + " Stufe (den Ort)" }));
            await K.schritt(8, async () => K.nicht(8, { n: w.fremd, fehlt: "keine fremde Art mit Ordnung: alle Orte der Welt sind Orte von Menschen" }));
        },
        seite: {
            GRENZE: async (r, T, arg) => {
                const AR = r.constructor;
                const SG = AR._siedlungGesetz && AR._siedlungGesetz();
                if (!SG) return { fehler: "das Siedlungs-Gesetz fehlt im Buch" };
                const pm = r.state.playerMesh.position;
                const reich = AR.Gesetz("fachwerk:siedlungsReich");
                const plaene = [...(r._ortPlaene || new Map()).values()].filter((p) => p && p.ort && Array.isArray(p.slots));
                const nah = plaene.filter((p) => Math.hypot(p.ort.x - pm.x, p.ort.z - pm.z) < 2000);
                const herren = nah.filter((p) => p.slots.some((s) => s.rolle === "burg"));
                // das Reich des Orts mit Herrn: die ganze Stadt (ihre Kacheln) zählt ihre Häuser
                const haeuser = nah.reduce((s, p) => s + p.slots.length, 0);
                const reichM = herren.length ? Math.round(reich(SG, haeuser)) : 0;
                const reichKm2 = +((Math.PI * reichM * reichM) / 1e6).toFixed(3);
                let zeichen = 0;
                const steine = [];
                for (const e of r.state.architectures || []) {
                    const t = e && typeof e.type === "string" ? e.type.toLowerCase() : "";
                    if (t.indexOf("grenz") >= 0 || t.indexOf("markstein") >= 0 || t.indexOf("schlagbaum") >= 0) (zeichen++, e.position && steine.push(e.position));
                }
                // DIE GRENZE IM BILD GEGEN DIE KARTE (Sprosse 1): die Karte ist der Rand des Reichs um den Ort mit Herrn (fachwerk
                // siedlungsReich, reichM), 360 Punkte; ein Punkt steht im Bild, wo ein Grenzzeichen der Szene (Markstein, stamm/siedlung-ort.js
                // _markSteinSetzen) binnen der halben Weite zweier Steine liegt — Band: die Hauptgrenzsteine standen 250–600 m voneinander
                // (Kleindenkmale Baden-Württemberg, Kreisarchiv Bodenseekreis), die halbe größte Weite 300 m
                const herr = herren[0];
                let [randPunkte, imBild, steineAmRand] = [0, 0, 0];
                if (herr && reichM > 0) {
                    for (let k = 0; k < 360; k++) {
                        const a = (k * Math.PI) / 180;
                        const [x, z] = [herr.ort.x + reichM * Math.cos(a), herr.ort.z + reichM * Math.sin(a)];
                        randPunkte++;
                        if (steine.some((q) => Math.hypot(q.x - x, q.z - z) <= 300)) imBild++;
                    }
                    steineAmRand = steine.filter((q) => Math.abs(Math.hypot(q.x - herr.ort.x, q.z - herr.ort.z) - reichM) <= 300).length;
                }
                // DIE BURG, WO LAGE UND REICHTUM SIE TRAGEN: je Ort mit Herrn steht der Palas (Rolle burg) im obersten Viertel der Höhen
                // seiner Lose (fachwerk STADT_GRAMMATIK burg lage "hoehe"; die Höhe des Slots sl.y) und der Ort ist eine Stadt (das
                // BURG-GESETZ: herrBar nur städtisch)
                const burgOk = herren.filter((p) => {
                    const ys = p.slots.map((sl) => sl.y).filter(Number.isFinite).sort((a, b) => a - b);
                    const b = p.slots.find((sl) => sl.rolle === "burg");
                    return b && Number.isFinite(b.y) && ys.length && b.y >= ys[Math.floor(0.75 * (ys.length - 1))] && !!p.staedtisch;
                }).length;
                // die Gemeinwesen des Rang-Gesetzes auf 32 × 32 km um den Messort (eine Zelle je `cellM`), mit Frist
                const cellM = SG.cellM;
                const halb = Math.round(16000 / cellM);
                const [c0x, c0z] = [Math.floor(pm.x / cellM), Math.floor(pm.z / cellM)];
                const bis = performance.now() + arg.fristMs;
                let [zellen, gemein, bund] = [0, 0, 0];
                for (let dz = -halb; dz < halb && performance.now() < bis; dz++)
                    for (let dx = -halb; dx < halb; dx++) {
                        zellen++;
                        const i = r._autoSettlementCellInfo(c0x + dx, c0z + dz);
                        if (!i) continue;
                        gemein++;
                        if (i.bund || i.reich || i.herr) bund++;
                    }
                const cells = (r.state.worldMeta && r.state.worldMeta.settlementCells) || {};
                let [kolonien, fremd] = [0, 0];
                for (const p of plaene) {
                    if (p.kolonie || p.uebersee) kolonien++;
                    if (p.art && p.art !== "mensch") fremd++;
                }
                for (const k in cells) if (cells[k] && (cells[k].bund || cells[k].herr)) bund++;
                const ch = herren.map((p) => p.chronik).find((c) => c && Number.isFinite(c.ende) && Number.isFinite(c.gr0));
                return {
                    herren: herren.length,
                    plaene: nah.length,
                    haeuser,
                    reichM,
                    reichKm2,
                    zeichen,
                    steine: steine.length,
                    steineAmRand,
                    randPunkte,
                    imBild,
                    grenzeKarte: randPunkte ? +(imBild / randPunkte).toFixed(3) : null,
                    burgLage: herren.length ? +(burgOk / herren.length).toFixed(3) : null,
                    zellen,
                    zellenSoll: 4 * halb * halb,
                    gemein,
                    bund,
                    kolonien,
                    fremd,
                    ordnungen: gemein > 0 ? 1 + (bund > 0 ? 1 : 0) : 0,
                    chronikJ: ch ? ch.ende - ch.gr0 : 0,
                };
            },
        },
        sprossen: {
            1: {
                umfang: { soll: 1, wort: "Herrschaftsgebiet" },
                masse: [
                    { key: "grenzeKarte", wort: "Grenze im Bild deckt die Karte (Anteil)", soll: 1, richtung: "≥" },
                    { key: "burgLage", wort: "Burg, wo Lage und Reichtum sie tragen (Anteil)", soll: 1, richtung: "≥" },
                ],
            },
            2: {
                umfang: { soll: 10, wort: "Gemeinwesen auf 32 × 32 km" },
                masse: [
                    { key: "folgt", wort: "Fluss/Kamm verlegt → Grenze folgt (Anteil von 32 Saaten)", soll: 0.7, richtung: "≥" },
                    { key: "zeichen", wort: "Grenzzeichen", soll: 1, richtung: "≥" },
                ],
                erwartet: "leser",
                fehlt: "keine Grenze aus der Kostenfläche: kein Reich trägt eine Grenze, die Fluss oder Kamm folgen könnte",
                wo: "stamm/siedlung-ort.js:1609",
            },
            3: {
                umfang: { soll: 100, wort: "Gemeinwesen in 2 Ebenen (Stadtstaat + Bund)" },
                masse: [{ key: "imBand", wort: "Größenverteilung im Band historischer Atlanten (1 = ja)", soll: 1, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine zweite Ebene: kein Bund über den Orten",
            },
            4: {
                umfang: { soll: 1000, wort: "Jahre Aufstieg und Fall" },
                masse: [{ key: "ksP", wort: "Lebensdauer gegen Seshat (KS p)", soll: 0.05, richtung: ">" }],
                erwartet: "nicht",
                fehlt: "keine Herrschaft über die Zeit: kein Aufstieg, kein Fall, der Hauptort wandert nie",
            },
            5: {
                auge: { pose: "stadt-voll: Vogelschau 170 m über dem Platz (25 m südlich), Blick senkrecht auf das Reich", vorbild: "historische Atlanten: Reichsgrenzen im Gelände (Limes, Landwehr) und die Seite der Grenze" },
                erwartet: "nicht",
                fehlt: "kein Reich über den Ort hinaus: keine Grenze, deren Seite man erkennt",
            },
            6: {
                umfang: { soll: 64, wort: "Orte × 20 Jahre über die Menschenzeit, mit Übersee" },
                masse: [{ key: "seshat", wort: "im Seshat-Band", soll: 0.8, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Menschenzeit und kein Übersee: keine Kolonie, keine Hochseeschifffahrt",
            },
            7: {
                umfang: { soll: 256, wort: "Saaten mit jeder Stufe von Horde bis Weltordnung" },
                masse: [{ key: "stufen", wort: "jede Stufe ≥ 1× (Anteil der Saaten)", soll: 0.9, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Stufenfolge der Ordnung: die Welt trägt den Ort, nichts darüber",
            },
            8: {
                umfang: { soll: 100, wort: "Planeten mit fremden Arten" },
                masse: [{ key: "abstand", wort: "Abstand der Ordnungstypen zur Erde ÷ Abstand Erde–Erde", soll: 1, richtung: ">", herkunft: "„Abstand zur Erde > Erde–Erde“ ist der Quotient beider Abstände über 1" }],
                erwartet: "nicht",
                fehlt: "keine fremde Art mit Ordnung",
            },
        },
        proben: {
            1: [
                {
                    name: "die Attrappe: Grenze und Burg im Soll, aber kein Herrschaftsgebiet in der Welt",
                    j: { leiter: "mensch.macht.grenze", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 1: { art: "zahl", n: 0, werte: { grenzeKarte: 1, burgLage: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Umfang 0 < 1 Herrschaftsgebiet/,
                },
                {
                    name: "die Marksteine genommen: ein Herrschaftsgebiet, sein Rand nirgends im Bild",
                    j: { leiter: "mensch.macht.grenze", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 1: { art: "zahl", n: 1, werte: { grenzeKarte: 0, burgLage: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Grenze im Bild deckt die Karte \(Anteil\) 0 /,
                },
                {
                    name: "drei Steine an drei Wegen: der Rand zu 0,4 im Bild",
                    j: { leiter: "mensch.macht.grenze", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 1: { art: "zahl", n: 1, werte: { grenzeKarte: 0.4, burgLage: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Grenze im Bild deckt die Karte \(Anteil\) 0\.4 /,
                },
            ],
            2: [
                {
                    name: "die Grenze folgt dem verlegten Fluss nur in 21 von 32 Saaten (0,66)",
                    j: { leiter: "mensch.macht.grenze", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 2: { art: "zahl", n: 12, werte: { folgt: 0.66, zeichen: 3 } } } },
                    gruen: false,
                    zahl: /ROT an Fluss\/Kamm verlegt → Grenze folgt \(Anteil von 32 Saaten\) 0\.66 /,
                },
            ],
        },
    }),

    // ───────────────────────── mensch.macht.wehrbau — Spuren der Macht im Stein ─────────────────────────
    // EINE Messung: die Mauer, die die Welt einem Ort gibt — der Export der Foundry (`_foundryRequestSettlement`, derselbe Auftrag
    // wie der Akt „dorf 7 24 jahr Y“ und das Wachstum `_ortDp`), seine Mauer (segs, towers, R) und Straßen (roads), die Pläne der vollen
    // Stadt (Rollen, Maße) und der Mauer-Pool der Szene (`state.stlMauer` gegen die Kästen der Orte, `_wegeKarteEnsure().siedlungen`).
    F.leiter("mensch.macht.wehrbau", {
        sek: 55,
        pfad: ["stamm/siedlung-ort.js", "stamm/siedlung-wege.js", "fachwerk-core.js"],
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const m = await K.welt("return await (" + H.seite.MACHT + ")(r, T, {});", 30000);
            if (!m || m.fehler) throw new Error("die Welt der Machtbauten: " + ((m && m.fehler) || "ohne Antwort"));
            H.zeile("Machtbauten: " + JSON.stringify(m));
            // die Exporte ohne Pose zuerst, das Bild am Ende: seine Pose liegt 25 m vom Platz (die Werkbank stellt nicht um), die Probe
            // endet am Ort der niedrigsten gemessenen Sprosse (S2, der Platz der vollen Stadt)
            await K.schritt(2, async () => {
                const soll = { 900: "Palisade", 1350: "Steinring", 1650: "Bastion", 1900: "kein Wall" };
                const f = await K.welt("return await (" + H.seite.FORM + ")(r, T, " + JSON.stringify({ saaten: [7, 11], jahre: [900, 1350, 1650, 1900], nH: 24 }) + ");", 60000);
                if (!f || f.fehler) throw new Error("der Export der Form: " + ((f && f.fehler) || "ohne Antwort"));
                const treffer = f.aus.filter((x) => x.form === soll[x.jahr]).length / f.aus.length;
                const jahre = new Set(f.aus.map((x) => x.jahr)).size;
                K.zahl(2, {
                    n: jahre,
                    werte: { treffer: +treffer.toFixed(3) },
                    beleg: f.aus.map((x) => x.jahr + " " + x.epoche + " → " + x.form + (x.R ? " R" + x.R : "") + " (Soll " + soll[x.jahr] + ", Same " + x.seed + ")").join(" · ") + " · " + f.ms + " ms",
                    taeter: "fachwerk-core.js mauerRing/STADTMAUER: eine Wand (dick " + f.dick + " m, hoch " + f.hoch + " m) für jede Epoche, nach MAUER_BIS keine",
                });
            });
            await K.schritt(3, async () => {
                const g = await K.welt("return await (" + H.seite.RING + ")(r, T, " + JSON.stringify({ gruendung: 1320, alt: 1700, jung: 1900, ringe: 32, maxSaat: 64, m: 4, fristMs: Math.max(5000, (H.rest() - 22) * 1000) }) + ");", 60000);
                if (!g || g.fehler) throw new Error("der Export der Ringe: " + ((g && g.fehler) || "ohne Antwort"));
                const mit = g.saaten.filter((x) => x.ring);
                const deck = mit.length ? mit.reduce((s, x) => s + x.deck, 0) / mit.length : 0;
                K.zahl(3, {
                    n: mit.length,
                    werte: { ringStrasse: +deck.toFixed(3) },
                    beleg: mit.length + " Saaten mit Ring " + g.alt + " (von " + g.saaten.length + "), Deckung des alten Rings durch die Straßen " + g.jung + " ≤ " + g.m + " m: " + mit.slice(0, 12).map((x) => x.seed + ":" + x.deck.toFixed(2)).join(" ") + " · " + g.ms + " ms",
                    taeter: "fachwerk-core.js exportSettlement: die Straßen des jüngeren Jahrs kennen den alten Ring nicht (die Mauer steht oder fällt, nie wird sie Gasse)",
                });
            });
            await K.schritt(4, async () => K.nicht(4, { n: m.burgen, fehlt: "keine Burgen in der Fläche: " + m.burgen + " Burg als Slot der vollen Stadt, keine Festung an Hügel oder Furt" }));
            await K.schritt(5, async () => K.nicht(5, { n: m.grenzKm, fehlt: "keine Grenzbefestigung: " + m.poolWaende + " Wände im Pool, " + m.poolFrei + " außerhalb eines Orts (" + m.grenzKm + " km) — jede Mauer ist ein Ring um einen Ort" }));
            await K.schritt(6, async () => K.nicht(6, { n: m.wehrbauten, fehlt: "keine Familien von Wehrbauten: " + m.wehrbauten + " Wehrbauten (Ringe, Türme, Burgen) in einer Form (STADTMAUER) für jede Epoche" }));
            await K.schritt(8, async () => K.nicht(8, { n: 0, fehlt: "keine fremde Welt mit eigener Waffe: der Wehrbau kennt nur die Wand der Menschen" }));
            await K.schritt(7, async () => {
                const b = await K.bild(7, m.pose);
                K.auge(7, {
                    bild: b.datei,
                    pose: "stadt-voll: Vogelschau " + m.hoch + " m über dem Platz " + m.platz.join("/") + " (25 m südlich), Blick senkrecht",
                    mass: m.machtbauten + " Machtbauten von " + m.slots + " Bauten, ihr Volumen das " + m.volFaktor + "-Fache des mittleren Hauses, Größe ↔ Macht ρ " + m.rho,
                });
            });
        },
        seite: {
            // die Pläne der vollen Stadt um den Platz: Rollen, Maße und Volumen, Größe ↔ Macht, Burgen, Wehrbauten; der Mauer-Pool der Szene
            MACHT: async (r, T, arg) => {
                const pm = r.state.playerMesh.position;
                const plaene = [...(r._ortPlaene || new Map()).values()].filter((p) => p && p.ort && Array.isArray(p.slots) && Math.hypot(p.ort.x - pm.x, p.ort.z - pm.z) < 1500);
                if (!plaene.length) return { fehler: "kein Ortsplan binnen 1,5 km vom Platz" };
                const RANG = { burg: 3, bergfried: 3, torhaus: 2, rathaus: 2, kirche: 2, kapelle: 1, pfarrhaus: 1, kontor: 1, kaufhaus: 1, patrizierhaus: 1, wohnturm: 1, halle: 2 };
                const xs = [];
                let [burgen, tuerme, ringe] = [0, 0, 0];
                for (const p of plaene) {
                    if (p.mauer && Array.isArray(p.mauer.segs) && p.mauer.segs.length) (ringe++, (tuerme += (p.mauer.towers || []).length));
                    for (const s of p.slots) {
                        const ov = s.ov || {};
                        const vol = (ov.W || 2 * ((s.obb && s.obb.ex) || 3)) * (ov.D || 2 * ((s.obb && s.obb.ez) || 3)) * (ov.storeys || 1) * 3;
                        if (s.rolle === "burg") burgen++;
                        xs.push({ rang: RANG[s.rolle] || 0, vol });
                    }
                }
                const rangOf = (a) => {
                    const o = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]);
                    const rk = new Array(a.length);
                    for (let i = 0; i < o.length; ) {
                        let j = i;
                        while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++;
                        for (let k = i; k <= j; k++) rk[o[k][1]] = (i + j) / 2;
                        i = j + 1;
                    }
                    return rk;
                };
                const [ra, rb] = [rangOf(xs.map((x) => x.rang)), rangOf(xs.map((x) => x.vol))];
                const mw = (a) => a.reduce((s, v) => s + v, 0) / a.length;
                const [ma, mb] = [mw(ra), mw(rb)];
                let [sab, saa, sbb] = [0, 0, 0];
                for (let i = 0; i < xs.length; i++) (sab += (ra[i] - ma) * (rb[i] - mb), (saa += (ra[i] - ma) ** 2), (sbb += (rb[i] - mb) ** 2));
                const rho = saa && sbb ? sab / Math.sqrt(saa * sbb) : 0;
                const macht = xs.filter((x) => x.rang >= 2);
                const volle = xs.map((x) => x.vol).sort((a, b) => a - b);
                const median = volle[volle.length >> 1] || 1;
                // der Mauer-Pool: jede Wand (Maß x = die Wand-Dicke EINER Form des Kerns, fachwerk `MAUER_FORM`: Palisade · Steinring ·
                // Bastion — bis 25.11. nur der Steinring der Konstante STADTMAUER) außerhalb der Kästen der Orte ist Grenzbefestigung
                const FORMEN = Object.values(globalThis.__fachwerkCore.MAUER_FORM).filter((f) => f && f.wand);
                const istWand = (s) => FORMEN.some((f) => Math.abs(s.x - f.wand.dick) < 0.01 && s.y > f.wand.hoch);
                const P = r.state.stlMauer;
                const wk = r._wegeKarteEnsure();
                const inBox = (i) => (wk.siedlungen || []).some((b) => b && b.streifen && i >= b.streifen[0] && i < b.streifen[1]);
                let [poolWaende, poolFrei, freiM] = [0, 0, 0];
                if (P && P.mesh) {
                    const M4 = new T.Matrix4(), pos = new T.Vector3(), q = new T.Quaternion(), sk = new T.Vector3();
                    for (let i = 0; i < (P.top || 0); i++) {
                        M4.fromArray(P.mesh.instanceMatrix.array, i * 16);
                        M4.decompose(pos, q, sk);
                        if (!istWand(sk)) continue;
                        poolWaende++;
                        if (!inBox(i)) (poolFrei++, (freiM += sk.z));
                    }
                }
                const y0 = r.getTerrainHeightAt(pm.x, pm.z);
                const hoch = 170;
                return {
                    slots: xs.length,
                    plaene: plaene.length,
                    machtbauten: macht.length,
                    volFaktor: macht.length ? +(mw(macht.map((x) => x.vol)) / median).toFixed(2) : 0,
                    rho: +rho.toFixed(3),
                    burgen,
                    wehrbauten: ringe + tuerme + burgen,
                    poolWaende,
                    poolFrei,
                    grenzKm: +(freiM / 1000).toFixed(3),
                    platz: [+pm.x.toFixed(1), +pm.z.toFixed(1)],
                    hoch,
                    pose: { px: +pm.x.toFixed(2), py: +(y0 + hoch).toFixed(2), pz: +(pm.z + 25).toFixed(2), lx: +pm.x.toFixed(2), ly: +y0.toFixed(2), lz: +pm.z.toFixed(2) },
                };
            },
            // die Form des Walls je Jahr: der Export des Akts „dorf <Same> <nH> jahr <Y>“ (die Epoche aus dem Jahr, fachwerk epocheImJahr)
            FORM: async (r, T, arg) => {
                const AR = r.constructor;
                const ep = AR.Gesetz("fachwerk:epocheImJahr");
                const SM = globalThis.__fachwerkCore.STADTMAUER;
                const t0 = performance.now();
                const aus = [];
                for (const seed of arg.saaten)
                    for (const Y of arg.jahre) {
                        const plan = await r._foundryRequestSettlement({ seed, nH: arg.nH, epoche: ep(Y) });
                        if (!plan) return { fehler: "die Foundry ist kalt: export-settlement null (Same " + seed + ", Jahr " + Y + ")" };
                        const m = plan.mauer;
                        let form = "kein Wall";
                        if (m && Array.isArray(m.segs) && m.segs.length) {
                            const wand = m.wand || SM.wand;
                            const art = String(m.art || m.form || "").toLowerCase();
                            // der Vorsprung der Türme vor dem Ring (um die Mitte seiner Segmente): eine Bastion springt vor, ein Turm sitzt im Ring
                            const mid = m.segs.map((s) => [(s.x0 + s.x1) / 2, (s.z0 + s.z1) / 2]);
                            const [cx, cz] = [mid.reduce((a, q) => a + q[0], 0) / mid.length, mid.reduce((a, q) => a + q[1], 0) / mid.length];
                            const R0 = mid.reduce((a, q) => a + Math.hypot(q[0] - cx, q[1] - cz), 0) / mid.length;
                            const vor = (m.towers || []).map((t) => Math.hypot(t.x - cx, t.z - cz) - R0);
                            if (art.indexOf("palis") >= 0 || wand.dick < 0.6) form = "Palisade";
                            else if (art.indexOf("bastion") >= 0 || (vor.length && Math.min(...vor) > 4)) form = "Bastion";
                            else form = "Steinring";
                        }
                        aus.push({ seed, jahr: Y, epoche: ep(Y), form, R: m && Number.isFinite(m.R) ? Math.round(m.R) : null });
                    }
                return { aus, dick: SM.wand.dick, hoch: SM.wand.hoch, ms: Math.round(performance.now() - t0) };
            },
            // der alte Ring als Straße: je Same der Ort aus dem Gründungsjahr im Wachstum (`_ortDp`: Epoche der Gründung, jahr des
            // Gedächtnisses) am alten Jahr (sein Ring) und am jungen (seine Straßen) — die Deckung der Ring-Punkte durch Straßen ≤ m Meter
            RING: async (r, T, arg) => {
                const AR = r.constructor;
                const ep = AR.Gesetz("fachwerk:epocheImJahr");
                const d = (px, pz, a, b) => {
                    const [dx, dz] = [b.x - a.x, b.z - a.z];
                    const l2 = dx * dx + dz * dz || 1;
                    const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (pz - a.z) * dz) / l2));
                    return Math.hypot(px - a.x - t * dx, pz - a.z - t * dz);
                };
                const t0 = performance.now();
                const bis = t0 + arg.fristMs;
                const saaten = [];
                for (let seed = 1; seed <= arg.maxSaat && saaten.filter((x) => x.ring).length < arg.ringe && performance.now() < bis; seed++) {
                    const A = await r._foundryRequestSettlement({ seed, epoche: ep(arg.gruendung), jahr: arg.alt });
                    const B = await r._foundryRequestSettlement({ seed, epoche: ep(arg.gruendung), jahr: arg.jung });
                    if (!A || !B) return { fehler: "die Foundry ist kalt: export-settlement null (Same " + seed + ")" };
                    if (!A.mauer || !Array.isArray(A.mauer.segs) || !A.mauer.segs.length) {
                        saaten.push({ seed, ring: false });
                        continue;
                    }
                    let [tot, hit] = [0, 0];
                    for (const s of A.mauer.segs)
                        for (let k = 0; k <= 4; k++) {
                            const [px, pz] = [s.x0 + ((s.x1 - s.x0) * k) / 4, s.z0 + ((s.z1 - s.z0) * k) / 4];
                            let best = Infinity;
                            for (const rd of B.roads || []) for (let i = 1; i < rd.pts.length; i++) best = Math.min(best, d(px, pz, rd.pts[i - 1], rd.pts[i]));
                            tot++;
                            if (best <= arg.m) hit++;
                        }
                    saaten.push({ seed, ring: true, deck: tot ? hit / tot : 0, mauerJung: !!(B.mauer && B.mauer.segs && B.mauer.segs.length) });
                }
                return { saaten, alt: arg.alt, jung: arg.jung, m: arg.m, ms: Math.round(performance.now() - t0) };
            },
        },
        bestehend: { 1: "karte2.mensch.macht.wehrbau#1" },
        sprossen: {
            2: {
                umfang: { soll: 4, wort: "Stichjahre 900/1350/1650/1900", herkunft: "die Stichjahre, die der Richter aufzählt (900/1350/1650/1900), gezählt: vier" },
                masse: [{ key: "treffer", wort: "Jahrhundert erkannt (Palisade → Steinring → Bastion → kein Wall)", soll: 0.7, richtung: "≥" }],
            },
            3: {
                umfang: { soll: 32, wort: "Saaten mit Mauerring" },
                masse: [{ key: "ringStrasse", wort: "Ring als Straße", soll: 0.7, richtung: "≥" }],
            },
            4: {
                umfang: { soll: 100, wort: "Burgen je 10⁴ km²" },
                masse: [{ key: "wandert", wort: "Hügel/Furt entfernt → Festung wandert", soll: 0.8, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Burgen in der Fläche, keine Festung an Hügel oder Furt",
            },
            5: {
                umfang: { soll: 1000, wort: "km Grenzbefestigung" },
                masse: [{ key: "luecken", wort: "Lücken ≤ Sichtweite (Anteil)", soll: 0.9, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Grenzbefestigung: jede Mauer ist ein Ring um einen Ort",
            },
            6: {
                umfang: { soll: 10000, wort: "Wehrbauten aller Epochen" },
                masse: [{ key: "cluster", wort: "Form-Cluster, je näher an realer Familie als an Zufall", soll: 20, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Familien von Wehrbauten: eine Form für jede Epoche",
            },
            7: {
                auge: {
                    pose: "stadt-voll: Vogelschau 170 m über dem Platz (25 m südlich), Blick senkrecht",
                    vorbild: "Luftbilder von Residenzstädten mit dem Sitz der Macht über der Stadt (Prag mit dem Hradschin, Carcassonne mit der Cité)",
                },
            },
            8: {
                umfang: { soll: 2, wort: "fremde Welten mit eigener Waffe", herkunft: "„fremde Welten“ in der Mehrzahl: mindestens zwei Welten, deren Waffe der Wehrbau folgt" },
                masse: [{ key: "wechsel", wort: "Waffe getauscht → Form-Cluster wechselt", soll: 0.7, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine fremde Welt mit eigener Waffe",
            },
        },
        proben: {
            2: [
                {
                    name: "eine Form für jede Epoche (der Steinring 900 bis 1650, 1900 kein Wall): 2 von 4 Jahrhunderten",
                    j: { leiter: "mensch.macht.wehrbau", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 2: { art: "zahl", n: 4, werte: { treffer: 0.5 } } } },
                    gruen: false,
                    zahl: /ROT an Jahrhundert erkannt .* 0\.5 verfehlt ≥ 0\.7/,
                },
            ],
            3: [
                {
                    name: "der Ring wird Straße, aber nur in 20 Saaten gemessen",
                    j: { leiter: "mensch.macht.wehrbau", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 3: { art: "zahl", n: 20, werte: { ringStrasse: 0.9 } } } },
                    gruen: false,
                    zahl: /ROT an Umfang 20 < 32 Saaten mit Mauerring/,
                },
            ],
        },
    }),

    // ───────────────────────── mensch.macht.stand — Stand, Kaste, Klasse ─────────────────────────
    // EINE Messung: die Wohnfläche der Wohnbauten der vollen Stadt (Grundriss W × D × Geschosse aus dem Plan, `_ortPlaene`), ihr Gini,
    // das reichste und das ärmste Haus nebeneinander (das Bildpaar), die Viertel und der Anteil des Wohlstands zwischen ihnen
    // (η²), die Stände (Rollen der Wohnbauten) und die Bewohner (`_bewohnerSiedlungen`).
    F.leiter("mensch.macht.stand", {
        sek: 50,
        pfad: ["stamm/siedlung-ort.js", "stamm/siedlung-bewohner.js", "fachwerk-core.js"],
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const w = await K.welt("return await (" + H.seite.STAND + ")(r, T, {});", 30000);
            if (!w || w.fehler) throw new Error("die Welt der Stände: " + ((w && w.fehler) || "ohne Antwort"));
            H.zeile("Stand: " + JSON.stringify(w));
            await K.schritt(4, async () => K.nicht(4, { n: w.bewohner, fehlt: "die Welt trägt " + w.bewohner + " Bewohner, keinen Lebenslauf und keine Lebensdauer nach Stand" }));
            await K.schritt(5, async () => K.nicht(5, { n: w.bewohner, fehlt: "keine Epochen der Bewohner: " + w.bewohner + " Bewohner der Gegenwart, keine Revolution, keine Reform" }));
            await K.schritt(6, async () => {
                if (w.fremd < 1) return K.nicht(6, { n: w.fremd, fehlt: "keine fremde Art mit Rängen: jede Siedlung ist eine der Menschen" });
                const b = await K.bild(6, w.poseNah);
                return K.auge(6, { bild: b.datei, pose: "stadt-voll: der Bewohner der fremden Art", mass: w.fremd + " fremde Arten" });
            });
            // S2 vor S1: die Probe endet an der Pose der niedrigsten Sprosse (das Bildpaar arm/reich)
            await K.schritt(2, async () => {
                const b = await K.bild(2, w.poseNah);
                K.auge(2, {
                    bild: b.datei,
                    pose: "stadt-voll: Nah-Bild des nächsten Bewohners draußen, 3,5 m vor ihm in Augenhöhe (" + w.nahBei.join("/") + ")",
                    mass: w.staende + " Stände (Rollen der Wohnbauten: " + w.rollen.join(", ") + ") · " + w.viertel + " Viertel · Wohlstand zwischen den Vierteln η² " + w.eta2 + " · eine Kleidung je Ort (" + w.kleidung + ")",
                });
            });
            await K.schritt(1, async () => {
                const b = await K.bild(1, w.posePaar);
                K.auge(1, {
                    bild: b.datei,
                    pose: "stadt-voll: das reichste und das ärmste Wohnhaus binnen " + w.paar.d + " m, die Kamera 30 m quer über ihrer Mitte, 18 m hoch",
                    mass: "Gini der Wohnfläche " + w.gini + " über " + w.wohnbauten + " Wohnbauten; das Paar " + w.paar.reich + " m² (" + w.paar.reichRolle + ") / " + w.paar.arm + " m² (" + w.paar.armRolle + ")",
                });
            });
        },
        seite: {
            STAND: async (r, T, arg) => {
                const pm = r.state.playerMesh.position;
                const plaene = [...(r._ortPlaene || new Map()).values()].filter((p) => p && p.ort && Array.isArray(p.slots) && Math.hypot(p.ort.x - pm.x, p.ort.z - pm.z) < 1500);
                if (!plaene.length) return { fehler: "kein Ortsplan binnen 1,5 km vom Platz" };
                const WOHN = { wohnhaus: 1, patrizierhaus: 1, wohnturm: 1, pfarrhaus: 1, kontor: 1 };
                const haus = [];
                const vw = new Map();
                for (const p of plaene)
                    for (const s of p.slots) {
                        if (!WOHN[s.rolle]) continue;
                        const ov = s.ov || {};
                        const fl = (ov.W || 2 * ((s.obb && s.obb.ex) || 3)) * (ov.D || 2 * ((s.obb && s.obb.ez) || 3)) * (ov.storeys || 1);
                        haus.push({ x: p.ort.x + s.x, z: p.ort.z + s.z, fl, rolle: s.rolle, wohl: Number.isFinite(ov.wohl) ? ov.wohl : 1, viertel: s.viertel || "?" });
                        const v = vw.get(s.viertel || "?") || [];
                        v.push(Number.isFinite(ov.wohl) ? ov.wohl : 1);
                        vw.set(s.viertel || "?", v);
                    }
                if (haus.length < 2) return { fehler: "weniger als zwei Wohnbauten in den Plänen" };
                const f = haus.map((h) => h.fl).sort((a, b) => a - b);
                const n = f.length;
                const sum = f.reduce((s, v) => s + v, 0);
                let g = 0;
                for (let i = 0; i < n; i++) g += (2 * (i + 1) - n - 1) * f[i];
                const gini = g / (n * sum);
                // das Bildpaar: das nächste Paar aus dem reichsten und dem ärmsten Zehntel
                const [lo, hi] = [f[Math.floor(n * 0.1)], f[Math.ceil(n * 0.9) - 1]];
                const arm = haus.filter((h) => h.fl <= lo), reich = haus.filter((h) => h.fl >= hi);
                let paar = null;
                for (const a of arm) for (const b of reich) { const d = Math.hypot(a.x - b.x, a.z - b.z); if (d > 4 && (!paar || d < paar.d)) paar = { a, b, d }; }
                if (!paar) return { fehler: "kein Paar arm/reich" };
                const [mx, mz] = [(paar.a.x + paar.b.x) / 2, (paar.a.z + paar.b.z) / 2];
                const [ux, uz] = [(paar.b.x - paar.a.x) / paar.d, (paar.b.z - paar.a.z) / paar.d];
                const my = r.getTerrainHeightAt(mx, mz);
                const posePaar = { px: +(mx - uz * 30).toFixed(2), py: +(my + 18).toFixed(2), pz: +(mz + ux * 30).toFixed(2), lx: +mx.toFixed(2), ly: +(my + 3).toFixed(2), lz: +mz.toFixed(2) };
                // die Viertel: der Anteil der Streuung des Wohlstands zwischen ihnen (η²)
                const alle = [...vw.values()].flat();
                const mAll = alle.reduce((s, v) => s + v, 0) / alle.length;
                let [zw, tot] = [0, 0];
                for (const v of vw.values()) { const m = v.reduce((s, x) => s + x, 0) / v.length; zw += v.length * (m - mAll) ** 2; }
                for (const v of alle) tot += (v - mAll) ** 2;
                // die Bewohner der Welt und der nächste draußen (das Nah-Bild)
                let [bewohner, fremd] = [0, 0];
                let nah = null;
                const arten = new Set();
                for (const S of (r._bewohnerSiedlungen || new Map()).values())
                    for (const b of S.liste || []) {
                        bewohner++;
                        if (b.art && b.art !== "mensch") arten.add(b.art);
                        if (!b.leib || b.drinnen) continue;
                        const d = Math.hypot(b.leib.position.x - pm.x, b.leib.position.z - pm.z);
                        if (d > 1.5 && (!nah || d < nah.d)) nah = { b, d };
                    }
                fremd = arten.size;
                if (!nah) return { fehler: "kein Bewohner draußen am Platz" };
                const bp = nah.b.leib.position;
                const [vx, vz] = [(pm.x - bp.x) / nah.d, (pm.z - bp.z) / nah.d];
                const poseNah = { px: +(bp.x + vx * 3.5).toFixed(2), py: +(bp.y + 1.6).toFixed(2), pz: +(bp.z + vz * 3.5).toFixed(2), lx: +bp.x.toFixed(2), ly: +(bp.y + 1.5).toFixed(2), lz: +bp.z.toFixed(2) };
                const kl = plaene.map((p) => p.kleidung && p.kleidung.top).filter(Boolean);
                return {
                    gini: +gini.toFixed(3),
                    wohnbauten: n,
                    paar: { d: Math.round(paar.d), arm: Math.round(paar.a.fl), armRolle: paar.a.rolle, reich: Math.round(paar.b.fl), reichRolle: paar.b.rolle },
                    posePaar,
                    viertel: vw.size,
                    eta2: tot ? +(zw / tot).toFixed(3) : 0,
                    rollen: [...new Set(haus.map((h) => h.rolle))],
                    staende: new Set(haus.map((h) => h.rolle)).size,
                    kleidung: [...new Set(kl)].join("/") || "?",
                    bewohner,
                    fremd,
                    poseNah,
                    nahBei: [+bp.x.toFixed(1), +bp.z.toFixed(1)],
                };
            },
        },
        sprossen: {
            1: {
                auge: {
                    pose: "stadt-voll: das reichste und das ärmste Wohnhaus nebeneinander, die Kamera 30 m quer über ihrer Mitte, 18 m hoch",
                    vorbild: "archäologische Hausflächen einer mittelalterlichen Stadt (Kohler et al. 2017, Gini der Hausflächen) und ein reales Paar Patrizierhaus/Kleinhaus (Lübeck, Mengstraße)",
                },
            },
            2: {
                auge: {
                    pose: "stadt-voll: Nah-Bild des nächsten Bewohners draußen, 3,5 m vor ihm in Augenhöhe",
                    vorbild: "ständische Kleidung und Viertel einer spätmittelalterlichen Stadt (Kleiderordnungen, Nürnberg um 1500)",
                },
            },
            4: {
                umfang: { soll: 1e6, wort: "Bewohner mit Stand und Lebenslauf" },
                masse: [{ key: "lebensdauer", wort: "Lebensdauer oben/unten gegen die Quelle (rel. Fehler, ± 20 %)", soll: 0.2, richtung: "≤" }],
                erwartet: "nicht",
                fehlt: "die Welt trägt ≤ 1092 Bewohner, keinen Lebenslauf",
            },
            5: {
                umfang: { soll: 1e9, wort: "Bewohner über alle Epochen" },
                masse: [{ key: "umsturz", wort: "Umstürze folgen Gini-Spitzen", soll: 0.7, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Epochen der Bewohner, keine Revolution, keine Reform",
            },
            6: {
                auge: { pose: "stadt-voll: der nächste Bewohner einer fremden Art, 3,5 m vor ihm", vorbild: "Rangordnungen sozialer Arten (Ameisen-Kasten, Primaten-Hierarchien) aus dem Bild" },
                erwartet: "nicht",
                fehlt: "keine fremde Art mit Rängen",
            },
        },
        unklar: {
            3: "Das Gini-Band als Zahl setzen (Gini der Hausflächen je Epoche nach Kohler et al. 2017, von–bis) und dann je Saat × Epoche den Export der Welt (`_foundryRequestSettlement`) rechnen: ≥ 80 % der 256 Paare im Band, der Gini steigt mit dem Überschuss (`wohl`).",
        },
        proben: {
            1: [
                {
                    name: "das Bild fehlt im Lauf (die Abnahme speicherte nichts)",
                    j: { leiter: "mensch.macht.stand", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 1: { art: "auge", bild: "", pose: "Probe", vorbild: "Probe" } } },
                    gruen: false,
                    zahl: /keine Messung der Sprosse$/,
                },
            ],
            4: [
                {
                    name: "die Attrappe: die Lebensdauer im Soll an 1092 statt 10⁶ Bewohnern",
                    j: { leiter: "mensch.macht.stand", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 4: { art: "zahl", n: 1092, werte: { lebensdauer: 0.1 } } } },
                    gruen: false,
                    zahl: /ROT an Umfang 1092 < 1000000 /,
                },
            ],
        },
    }),

    // ───────────────────────── mensch.macht.recht — Gesetz, Verwaltung, Steuer, Strafe ─────────────────────────
    // EINE Messung: die Tat des Spielers (er schlägt einen Fuchs, `damageCreature` mit source player → `_bewohnerZeuge`) in Sicht von
    // Bewohnern und ungesehen (≥ 45 m von jedem Bewohner draußen), und über ein Fenster der Welt-Uhr (der Takt der Werkbank) die Folge:
    // ein Zeuge, der dem Spieler nachgeht (auf ≤ 3 m, um ≥ 3 m näher), der Spieler versetzt (≥ 2 m ohne Eingabe), eine Akte des Orts;
    // die Wache: wer die Rolle waechter/nachtwaechter trägt (koerper TAGES_GESETZ) und ob sie auf die Tat in ihrer Sicht zugeht.
    F.leiter("mensch.macht.recht", {
        sek: 55,
        mutiert: true,
        pfad: ["stamm/siedlung-bewohner.js", "stamm/kreatur-leben.js", "stamm/siedlung-verkehr.js", "koerper-core.js", "fachwerk-core.js"],
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const w = await K.welt("return await (" + H.seite.WACHE + ")(r, T, {});", 20000);
            if (!w || w.fehler) throw new Error("die Welt der Wache: " + ((w && w.fehler) || "ohne Antwort"));
            H.zeile("Wache: " + JSON.stringify(w));
            const proben = [];
            for (let i = 0; i < 6 && H.rest() > 14; i++) {
                const p = await K.welt("return await (" + H.seite.TAT + ")(r, T, " + JSON.stringify({ gesehen: i % 2 === 0, fensterS: 4, start: w.spieler, i }) + ");", 40000);
                H.zeile("Tat " + i + ": " + JSON.stringify(p));
                if (p && !p.fehler) proben.push(p);
            }
            const ges = proben.filter((p) => p.gueltig && p.gesehen);
            const unges = proben.filter((p) => p.gueltig && !p.gesehen);
            const folge = ges.filter((p) => p.folge).length;
            await K.schritt(2, async () =>
                K.zahl(2, {
                    n: ges.length,
                    werte: Object.assign({ folge: ges.length ? +(folge / ges.length).toFixed(3) : 0 }, unges.length ? { ohneFolge: +(unges.filter((p) => !p.folge).length / unges.length).toFixed(3) } : {}),
                    beleg: "gesehen " + ges.map((p) => p.zeugen + " Zeugen → " + (p.folge ? "Folge" : "keine Folge") + " (" + p.fliehen + " weichen, " + p.nach + " nahen, Akten +" + p.akten + ")").join(" · ") +
                        " | ungesehen " + unges.map((p) => (p.folge ? "Folge" : "keine Folge") + " (Akten +" + p.akten + ")").join(" · ") + " | Fenster 4 s Welt-Uhr",
                    taeter: "stamm/siedlung-bewohner.js `_bewohnerZeuge`/`_bewohnerWeichen`: der Zeuge erinnert und weicht, keiner verfolgt oder straft den Spieler",
                })
            );
            await K.schritt(1, async () => {
                if (w.waechter < 1)
                    return K.leser(1, { n: 0, fehlt: "keine Wache: kein Bewohner trägt die Rolle waechter/nachtwaechter (koerper TAGES_GESETZ trägt sie, der Genesis-Plan den Wache-Punkt" + (w.wachePunkt ? " " + w.wachePunkt.join("/") : "") + ", der Wirt gibt sie nie)", wo: "stamm/siedlung-bewohner.js:933" });
                const inSicht = proben.filter((p) => p.gueltig && p.wachen > 0);
                return K.zahl(1, {
                    n: inSicht.length,
                    werte: { antwort: inSicht.length ? +(inSicht.filter((p) => p.wacheAntwort > 0).length / inSicht.length).toFixed(3) : 0 },
                    beleg: w.waechter + " Wächter in der Welt; " + inSicht.length + " Taten in ihrer Sicht",
                    taeter: "stamm/siedlung-bewohner.js `_bewohnerZeuge`: die Wache weicht wie jeder Zeuge",
                });
            });
            await K.schritt(3, async () => K.leser(3, { n: w.bewohner, fehlt: "kein Bewohner begeht eine Tat: kein Verbrechen, keine Rate — der Tag eines Bewohners kennt Werk, Markt, Mahl, Treff und Ruhe (koerper tagesPlan; " + w.bewohner + " Bewohner)", wo: "stamm/siedlung-bewohner.js:2223" }));
            await K.schritt(4, async () => K.leser(4, { n: w.wagen, fehlt: "keine Steuer: kein Zehnt, kein Zoll, keine Fron — " + w.wagen + " Fahrer am Steuer fahren die Trassen der Stadt, keiner trägt Abgaben zum Sitz", wo: "stamm/siedlung-verkehr.js:431" }));
            const orte = new Set(ges.filter((p) => p.folge).map((p) => p.ort)).size;
            await K.schritt(5, async () => K.nicht(5, { n: orte, fehlt: "keine Rechtsordnung: dieselbe Tat hat in keinem Gemeinwesen eine Folge (" + ges.length + " gesehene Taten)" }));
            await K.schritt(6, async () => K.nicht(6, { n: w.bewohner, fehlt: "keine Verwaltung: " + w.bewohner + " Bewohner, kein Beamter, keine Verwaltung über Fläche" }));
            await K.schritt(7, async () => K.nicht(7, { n: folge > 0 ? 1 : 0, fehlt: "kein Recht in keiner Epoche: kein Strafmaß, das sich wandeln könnte" }));
        },
        seite: {
            WACHE: async (r, T, arg) => {
                const pm = r.state.playerMesh.position;
                let [bewohner, waechter, wagen] = [0, 0, 0];
                for (const S of (r._bewohnerSiedlungen || new Map()).values())
                    for (const b of S.liste || []) {
                        bewohner++;
                        if (b.rolle === "waechter" || b.rolle === "nachtwaechter" || b.beruf === "waechter" || b.beruf === "nachtwaechter") waechter++;
                        if (b.amSteuer) wagen++;
                    }
                const G = r._genesisWerkListe && r._genesisWerkListe.plan;
                const g = r._genesisMitte && r._genesisMitte();
                const wp = G && G.wache && g ? [+(g.x + G.wache.x).toFixed(1), +(g.z + G.wache.z).toFixed(1)] : null;
                return { bewohner, waechter, wagen, wachePunkt: wp, spieler: [+pm.x.toFixed(2), +pm.z.toFixed(2)] };
            },
            // EINE TAT des Spielers und ihr Fenster: gesehen am Platz (der Fuchs 1,5 m neben ihm, Zeugen ≤ 25 m), ungesehen an einer
            // Stelle 60–220 m vom Platz, ≥ 45 m von jedem Bewohner draußen; danach steht der Spieler wieder am Platz
            TAT: async (r, T, arg) => {
                const st = r.state;
                const pm = st.playerMesh.position;
                const draussen = [];
                for (const S of (r._bewohnerSiedlungen || new Map()).values()) for (const b of S.liste || []) if (b.leib && !b.drinnen) draussen.push({ b, S });
                const fern = (x, z, R) => draussen.every((q) => Math.hypot(q.b.leib.position.x - x, q.b.leib.position.z - z) >= R);
                let ort = { x: arg.start[0], z: arg.start[1] };
                if (!arg.gesehen) {
                    ort = null;
                    for (const R of [60, 110, 160, 220]) {
                        for (let k = 0; k < 24 && !ort; k++) {
                            const a = (k / 24) * 2 * Math.PI + arg.i;
                            const [x, z] = [arg.start[0] + Math.cos(a) * R, arg.start[1] + Math.sin(a) * R];
                            if (r._landAt(x, z, 0.2) && !(r._imGrundriss && r._imGrundriss(x, z, 2)) && fern(x, z, 45)) ort = { x, z };
                        }
                        if (ort) break;
                    }
                    if (!ort) return { gueltig: false, gesehen: false, grund: "keine Stelle ≥ 45 m von jedem Bewohner draußen binnen 220 m" };
                }
                pm.set(ort.x, r._voxelSurfaceY(ort.x, ort.z) + 1.8, ort.z);
                const P0 = { x: pm.x, z: pm.z };
                const [fx, fz] = [ort.x + 1.2, ort.z + 0.9];
                const zeugen = draussen.filter((q) => Math.hypot(q.b.leib.position.x - fx, q.b.leib.position.z - fz) < r.constructor.BEWOHNER.zeugeM);
                const istW = (b) => b.rolle === "waechter" || b.rolle === "nachtwaechter" || b.beruf === "waechter" || b.beruf === "nachtwaechter";
                const wachen = zeugen.filter((q) => istW(q.b));
                const dSp = (b) => Math.hypot(b.leib.position.x - pm.x, b.leib.position.z - pm.z);
                const dF = (b) => Math.hypot(b.leib.position.x - fx, b.leib.position.z - fz);
                const vor = new Map(draussen.map((q) => [q.b, { sp: dSp(q.b), f: dF(q.b) }]));
                const cells = (st.worldMeta && st.worldMeta.settlementCells) || {};
                const akten = () => Object.values(cells).reduce((s, c) => s + ((c && c.akten) || []).length, 0);
                const a0 = akten();
                const tier = r.spawnCreatureAt(fx, r.getTerrainHeightAt(fx, fz), fz, "happy", "fuchs", { bodySize: 1, precise: true });
                if (!tier) return { gueltig: false, gesehen: !!arg.gesehen, grund: "kein Fuchs an der Stelle" };
                const schlag = r.damageCreature(tier, 0.001, { source: "player" });
                if (!(schlag && schlag.ok)) return { gueltig: false, gesehen: !!arg.gesehen, grund: "der Schlag traf nicht" };
                const [t0, w0] = [st.spielZeit, performance.now()];
                while (st.spielZeit - t0 < arg.fensterS && performance.now() - w0 < arg.fensterS * 3000) await window.__werkTakt();
                let [nach, fliehen, wacheAntwort] = [0, 0, 0];
                for (const q of draussen) {
                    if (!q.b.leib) continue;
                    const v = vor.get(q.b);
                    const [sp, f] = [dSp(q.b), dF(q.b)];
                    if (sp <= 3 && sp <= v.sp - 3) nach++;
                    if (zeugen.includes(q) && f >= v.f + 3) fliehen++;
                    if (wachen.includes(q) && f <= v.f - 1) wacheAntwort++;
                }
                const versetzt = Math.hypot(pm.x - P0.x, pm.z - P0.z);
                const da = akten() - a0;
                const S0 = zeugen.length ? zeugen[0].S.key : null;
                pm.set(arg.start[0], r._voxelSurfaceY(arg.start[0], arg.start[1]) + 1.8, arg.start[1]);
                const gesehen = zeugen.length > 0;
                return {
                    gueltig: gesehen === !!arg.gesehen,
                    gesehen,
                    zeugen: zeugen.length,
                    wachen: wachen.length,
                    wacheAntwort,
                    nach,
                    fliehen,
                    versetzt: +versetzt.toFixed(2),
                    akten: da,
                    ort: S0,
                    folge: nach > 0 || versetzt >= 2 || (!gesehen && da > 0),
                    uhr: +(st.spielZeit - t0).toFixed(2),
                };
            },
        },
        sprossen: {
            1: {
                umfang: { soll: 20, wort: "Regelbrüche in Sicht der Wache" },
                masse: [{ key: "antwort", wort: "Antwort der Wache", soll: 0.8, richtung: "≥" }],
                erwartet: "leser",
                fehlt: "keine Wache: kein Bewohner trägt die Rolle waechter/nachtwaechter, der Wirt gibt sie nie",
                wo: "stamm/siedlung-bewohner.js:933",
            },
            2: {
                umfang: null,
                masse: [
                    { key: "folge", wort: "gesehen → Folge binnen 60 s (verfolgen, strafen)", soll: 0.8, richtung: "≥" },
                    { key: "ohneFolge", wort: "ungesehen ohne Folge", soll: 0.8, richtung: "≥" },
                ],
            },
            3: {
                umfang: { soll: 1000, wort: "Bewohner" },
                masse: [
                    { key: "gini", wort: "Rate steigt mit Gini (Anteil)", soll: 0.8, richtung: "≥" },
                    { key: "wache2", wort: "Wache × 2 → Rate fällt (1 = ja)", soll: 1, richtung: "≥" },
                ],
                erwartet: "leser",
                fehlt: "kein Bewohner begeht eine Tat: kein Verbrechen, keine Rate",
                wo: "stamm/siedlung-bewohner.js:2223",
            },
            4: {
                umfang: null,
                masse: [
                    { key: "wagenSitz", wort: "Wagen mit Abgaben am Sitz", soll: 1, richtung: "≥" },
                    { key: "unmut", wort: "Steuer × 2 → Unmut steigt (1 = ja)", soll: 1, richtung: "≥" },
                ],
                erwartet: "leser",
                fehlt: "keine Steuer: kein Zehnt, kein Zoll, keine Fron, kein Wagen trägt Abgaben zum Sitz",
                wo: "stamm/siedlung-verkehr.js:431",
            },
            5: {
                umfang: { soll: 1000, wort: "Rechtsordnungen" },
                masse: [{ key: "folgen", wort: "dieselbe Tat in 10 Gemeinwesen: verschiedene Folgen", soll: 5, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Rechtsordnung: keine Tat hat in einem Gemeinwesen eine Folge",
            },
            6: {
                umfang: { soll: 1e8, wort: "Köpfe unter Verwaltung" },
                masse: [{ key: "beamte", wort: "Beamte je Kopf im Seshat-Band", soll: 0.8, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Verwaltung, ≤ 1092 Bewohner",
            },
            7: {
                umfang: { soll: 1, wort: "Planet über alle Epochen mit Recht" },
                masse: [{ key: "rho", wort: "Strafmaß ↔ historische Folge ρ", soll: 0.6, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "kein Recht in keiner Epoche",
            },
        },
        proben: {
            2: [
                {
                    name: "die Zeugen weichen, keiner folgt (der Stand der Welt): ungesehen ohne Folge, gesehen ohne Folge",
                    j: { leiter: "mensch.macht.recht", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 2: { art: "zahl", n: 3, werte: { folge: 0, ohneFolge: 1 } } } },
                    gruen: false,
                    zahl: /ROT an gesehen → Folge binnen 60 s \(verfolgen, strafen\) 0 verfehlt ≥ 0\.8/,
                },
                {
                    name: "die Attrappe der Strafe: jede Tat hat Folge, auch die ungesehene",
                    j: { leiter: "mensch.macht.recht", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 2: { art: "zahl", n: 3, werte: { folge: 1, ohneFolge: 0 } } } },
                    gruen: false,
                    zahl: /ROT an ungesehen ohne Folge 0 verfehlt ≥ 0\.8/,
                },
            ],
        },
    }),

    // ───────────────────────── mensch.macht.krieg — Krieg, Belagerung, Diplomatie ─────────────────────────
    // EINE Messung: die Bewaffneten der Welt — der Spieler (sein Schwung, stamm/kampf.js) und jeder Bewohner, der ein Gerät oder eine
    // Waffe trägt —, dazu die Gemeinwesen im Krieg oder im Vertrag (das Gedächtnis der Orte, `settlementCells`).
    F.leiter("mensch.macht.krieg", {
        sek: 30,
        pfad: ["stamm/kampf.js", "stamm/siedlung-bewohner.js", "stamm/siedlung-ort.js"],
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const w = await K.welt("return await (" + H.seite.KRIEG + ")(r, T, {});", 20000);
            if (!w || w.fehler) throw new Error("die Welt des Kriegs: " + ((w && w.fehler) || "ohne Antwort"));
            H.zeile("Krieg: " + JSON.stringify(w));
            const nur = "der Spieler (" + (w.haelt || "die leere Hand") + ") und " + w.bewaffneteBewohner + " von " + w.bewohner + " Bewohnern bewaffnet (die Wache), " + w.imZweikampf + " im Kampf";
            // S1: seit bewohner-satz tragen die Wachen ihre Waffe (`b.waffe`, der Lebenslauf) — der Umfang sind die Bewaffneten IM
            // Zweikampf: wer einen Gegner trägt oder im Akt eines Kampfs steht; Treffer, Antwort und Deckung zählt erst ein Zweikampf
            await K.schritt(1, async () =>
                K.zahl(1, {
                    n: w.imZweikampf,
                    werte: { sitzt: null, antwortet: null, durchDeckung: null },
                    beleg: w.bewaffnet + " Bewaffnete (" + w.bewaffneteBewohner + " von " + w.bewohner + " Bewohnern mit Waffe " + JSON.stringify(w.waffen) + " und der Spieler, " + (w.haelt || "die leere Hand") + "), " + w.imZweikampf + " im Zweikampf",
                    taeter: "stamm/siedlung-bewohner.js _bewohnerNahen — die Wache tritt mit der Waffe 1,5 m vor die Tat und hält: kein Hieb, keine Deckung, kein Gegenhieb; den Schwung führt nur der Spieler gegen Wesen (stamm/kampf.js _playerAttackCreature)",
                })
            );
            await K.schritt(2, async () => {
                if (w.bewaffnet < 10) return K.nicht(2, { n: w.bewaffnet, fehlt: nur + ", keine zehn Kämpfer, keine Moral, keine Flucht" });
                const b = await K.bild(2, w.pose);
                return K.auge(2, { bild: b.datei, pose: "stadt-voll: der Platz", mass: w.bewaffnet + " Bewaffnete" });
            });
            await K.schritt(3, async () => K.nicht(3, { n: w.bewaffnet, fehlt: nur + ", kein Scharmützel" }));
            await K.schritt(4, async () => K.nicht(4, { n: w.bewaffnet, fehlt: nur + ", keine Formation, keine Feldschlacht" }));
            await K.schritt(5, async () => K.nicht(5, { n: w.bewaffnet, fehlt: nur + ", keine Belagerung, keine Bresche, keine Flickmauer" }));
            await K.schritt(6, async () => K.nicht(6, { n: w.bewaffnet, fehlt: nur + ", keine Schlacht, keine Versorgung" }));
            await K.schritt(7, async () => K.nicht(7, { n: w.imKrieg, fehlt: "kein Krieg, kein Bündnis, kein Tribut: " + w.imKrieg + " von " + w.orte + " Orten im Gedächtnis tragen einen Gegner oder Vertrag" }));
            await K.schritt(8, async () => {
                if (w.bewaffnet < 1e7) return K.nicht(8, { n: w.bewaffnet, fehlt: nur + ", keine Front, kein Graben, keine Ruine des Kriegs" });
                const b = await K.bild(8, w.pose);
                return K.auge(8, { bild: b.datei, pose: "stadt-voll: Vogelschau", mass: w.bewaffnet + " Kämpfer" });
            });
            await K.schritt(9, async () => K.nicht(9, { n: 0, fehlt: "keine interplanetaren Konflikte: eine Welt, eine Art mit Klinge (der Spieler)" }));
        },
        seite: {
            KRIEG: async (r, T, arg) => {
                const st = r.state;
                const pm = st.playerMesh.position;
                let [bewohner, bewaffneteBewohner, imZweikampf] = [0, 0, 0];
                const waffen = {};
                const KAMPF = /kampf|hieb|duell|fecht|streit/i;
                for (const S of (r._bewohnerSiedlungen || new Map()).values())
                    for (const b of S.liste || []) {
                        bewohner++;
                        const u = (b.leib && b.leib.userData) || {};
                        const wf = b.waffe || u.waffe || (b.equipped && b.equipped.held) || (u.equipped && u.equipped.held) || (b.bewaffnet ? "?" : null);
                        if (!wf) continue;
                        bewaffneteBewohner++;
                        waffen[wf] = (waffen[wf] || 0) + 1;
                        if (b.gegner || u.gegner || KAMPF.test(String(b.akt || ""))) imZweikampf++;
                    }
                const cells = (st.worldMeta && st.worldMeta.settlementCells) || {};
                let [orte, imKrieg] = [0, 0];
                for (const k in cells) {
                    orte++;
                    const c = cells[k] || {};
                    if (c.krieg || c.feind || c.vertrag || c.tribut) imKrieg++;
                }
                const haelt = st.player && st.player.equipped && st.player.equipped.held;
                const y0 = r.getTerrainHeightAt(pm.x, pm.z);
                return {
                    bewohner,
                    bewaffneteBewohner,
                    bewaffnet: bewaffneteBewohner + (st.player ? 1 : 0),
                    imZweikampf,
                    waffen,
                    haelt: haelt || null,
                    orte,
                    imKrieg,
                    pose: { px: +pm.x.toFixed(2), py: +(y0 + 40).toFixed(2), pz: +(pm.z + 25).toFixed(2), lx: +pm.x.toFixed(2), ly: +y0.toFixed(2), lz: +pm.z.toFixed(2) },
                };
            },
        },
        sprossen: {
            1: {
                umfang: { soll: 2, wort: "Bewaffnete im Zweikampf" },
                masse: [
                    { key: "sitzt", wort: "der Treffer sitzt, wo die Klinge den Leib kreuzt (Anteil von 20)", soll: 1, richtung: "≥" },
                    { key: "antwortet", wort: "der Getroffene antwortet (Anteil)", soll: 1, richtung: "≥" },
                    { key: "durchDeckung", wort: "Treffer durch die Deckung", soll: 0, richtung: "≤" },
                ],
            },
            2: {
                auge: { pose: "stadt-voll: der Platz, 40 m über ihm", vorbild: "Berichte und Bilder von Kämpfen Mensch gegen Mensch: Flucht statt Tod (Marshall, Men against Fire)" },
                erwartet: "nicht",
                fehlt: "keine zehn Kämpfer, keine Moral, keine Flucht",
            },
            3: {
                umfang: { soll: 100, wort: "Kämpfer im Scharmützel" },
                masse: [{ key: "hoehe", wort: "Höhe gewinnt bei gleicher Stärke", soll: 0.65, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "kein Scharmützel, keine Formation",
            },
            4: {
                umfang: { soll: 1000, wort: "Kämpfer in der Feldschlacht" },
                masse: [{ key: "flanke", wort: "Flankenangriff → Bruch", soll: 0.7, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Feldschlacht",
            },
            5: {
                umfang: { soll: 1e4, wort: "Belagerer" },
                masse: [{ key: "flick", wort: "nach 100 J Flickmauer sichtbar", soll: 0.8, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Belagerung, keine Bresche",
            },
            6: {
                umfang: { soll: 1e5, wort: "Kämpfer in der Schlacht" },
                masse: [{ key: "schwaeche", wort: "Versorgung geschnitten → Schwäche", soll: 0.7, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Schlacht, keine Versorgung",
            },
            7: {
                umfang: { soll: 1000, wort: "Gemeinwesen in Krieg und Frieden" },
                masse: [{ key: "ungleich", wort: "Kriege an Ungleichgewichten", soll: 0.7, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "kein Krieg, kein Bündnis, kein Tribut",
            },
            8: {
                auge: { pose: "stadt-voll: Vogelschau 40 m über dem Platz", vorbild: "Luftbilder der Westfront 1916 (Gräben, Ruinen der Dörfer)" },
                erwartet: "nicht",
                fehlt: "keine Front, kein Graben, keine Ruine des Kriegs",
            },
            9: {
                umfang: { soll: 2, wort: "Planeten im Konflikt", herkunft: "„interplanetar“ heißt zwischen Planeten: ein Konflikt dieser Art braucht mindestens zwei Planeten" },
                masse: [{ key: "spuren", wort: "Konflikt-Spuren aus dem Samen", soll: 0.7, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine interplanetaren Konflikte",
            },
        },
        proben: {
            1: [
                {
                    name: "der Spieler allein (der Stand vor bewohner-satz): ein Bewaffneter, der Treffer sitzt am Tier",
                    j: { leiter: "mensch.macht.krieg", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 1: { art: "zahl", n: 1, werte: { sitzt: 1, antwortet: 1, durchDeckung: 0 } } } },
                    gruen: false,
                    zahl: /ROT an Umfang 1 < 2 Bewaffnete im Zweikampf/,
                },
                {
                    name: "die Wache bewaffnet, keiner kämpft (der Stand von heute) — ROT am Umfang",
                    j: { leiter: "mensch.macht.krieg", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 1: { art: "zahl", n: 0, werte: { sitzt: null, antwortet: null, durchDeckung: null } } } },
                    gruen: false,
                    zahl: /ROT an Umfang 0 < 2 Bewaffnete im Zweikampf/,
                },
                {
                    name: "der Zweikampf, dessen Hieb durch die Deckung trifft — ROT an der Deckung",
                    j: { leiter: "mensch.macht.krieg", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 1: { art: "zahl", n: 2, werte: { sitzt: 1, antwortet: 1, durchDeckung: 2 } } } },
                    gruen: false,
                    zahl: /ROT an Treffer durch die Deckung 2 verfehlt ≤ 0/,
                },
            ],
        },
    }),

    // ───────────────────────── mensch.macht.megastadt — Macht in der Megastadt ─────────────────────────
    // EINE Messung an der Metropole der Moderne (das Hochhaus-Dach): die Pläne um den Spieler (Rollen, Geschosse), die Wache und die
    // Streife (Rollen und Fahrer), die Türme, die Bewohner und wer von ihnen über dem Grund lebt oder protestiert.
    F.leiter("mensch.macht.megastadt", {
        sek: 30,
        pfad: ["stamm/siedlung-ort.js", "stamm/siedlung-bewohner.js", "stamm/siedlung-verkehr.js", "fachwerk-core.js"],
        messe: async (H, K) => {
            await K.messort("hochhaus-dach");
            const w = await K.welt("return await (" + H.seite.MEGA + ")(r, T, {});", 20000);
            if (!w || w.fehler) throw new Error("die Welt der Megastadt: " + ((w && w.fehler) || "ohne Antwort"));
            H.zeile("Megastadt: " + JSON.stringify(w));
            // S1: der Umfang ist die Wache MIT Streife (wer aus ihr ausrückt); ρ (Antwortzeit ↔ Weg zur Wache) und das Sichtfeld misst
            // erst eine Streife, die aus der Wache kommt — ohne sie null (ROT beim Namen), nie ein Wert der Wache am Posten
            await K.schritt(1, async () =>
                K.zahl(1, {
                    n: w.mitStreife,
                    werte: { rho: null, imSicht: null },
                    beleg: w.wachen + " Bauten mit der Rolle Wache in " + w.plaene + " Plänen um den Spieler (" + w.wacheBau + " in den Plänen der Bewohner), " + w.inWache + " Bewohner wohnen in ihr, " + w.ausWache + " davon bewaffnet oder am Steuer; " + w.bewaffnet + " Wächter mit Waffe in der Welt, " + w.fahrer + " Fahrer am Steuer",
                    taeter: "stamm/siedlung-bewohner.js _bewohnerListe (DIE WACHE: der Wächter wird aus den Wohnhäusern nächst dem Posten gewählt, sein Werk ist der Posten) · koerper-core.js TAGES_GESETZ.angebot (die Wache ist ein Ort ohne eigenes Angebot) — keiner rückt aus der Wache aus, kein Wagen fährt Streife (stamm/siedlung-verkehr.js)",
                })
            );
            await K.schritt(2, async () => {
                if (w.reviere < 10) return K.nicht(2, { n: w.reviere, fehlt: "keine Banden, keine Reviere, kein Graffiti" });
                const b = await K.bild(2, w.pose);
                return K.auge(2, { bild: b.datei, pose: "hochhaus-dach: Blick über die Türme", mass: w.reviere + " Reviere" });
            });
            await K.schritt(3, async () => K.nicht(3, { n: w.tuerme, fehlt: "eine Metropole mit " + w.tuerme + " Türmen (≥ 10 Geschosse) in " + w.plaene + " Plänen, kein Bodenpreis, keine Macht, der die Höhe folgt" }));
            await K.schritt(4, async () => K.nicht(4, { n: w.protest, fehlt: "kein Protest: " + w.protest + " von " + w.bewohner + " Bewohnern versammelt, kein Schock, der eine Masse bewegt" }));
            await K.schritt(5, async () => K.nicht(5, { n: w.bewohner, fehlt: "keine Überwachung: " + w.bewohner + " Bewohner, keine Kontrolle" }));
            await K.schritt(6, async () => {
                if (w.oben < 1) return K.nicht(6, { n: w.oben, fehlt: "keine vertikale Schichtung: kein Bewohner lebt über dem Grund der Türme (" + w.bewohner + " Bewohner)" });
                const b = await K.bild(6, w.pose);
                return K.auge(6, { bild: b.datei, pose: "hochhaus-dach: Blick über die Türme", mass: w.oben + " Bewohner über dem Grund" });
            });
            await K.schritt(7, async () => K.nicht(7, { n: 0, fehlt: "keine fremde Megastadt: eine Welt, eine Art" }));
        },
        seite: {
            MEGA: async (r, T, arg) => {
                const pm = r.state.playerMesh.position;
                const plaene = [...(r._ortPlaene || new Map()).values()].filter((p) => p && p.ort && Array.isArray(p.slots) && Math.hypot(p.ort.x - pm.x, p.ort.z - pm.z) < 1500);
                let [wachen, tuerme] = [0, 0];
                for (const p of plaene)
                    for (const s of p.slots) {
                        const ro = String(s.rolle || "");
                        if (ro.indexOf("wache") >= 0 || ro.indexOf("polizei") >= 0 || ro.indexOf("revier") >= 0) wachen++;
                        if (((s.ov && s.ov.storeys) || 0) >= 10) tuerme++;
                    }
                let [bewohner, fahrer, protest, oben, reviere, wacheBau] = [0, 0, 0, 0, 0, 0];
                // DIE WACHE ALS BAU (ort-ausstattung, fachwerk `wacheLose`: die Rolle „wache“ eines Slots) und IHRE STREIFE: wer aus ihr
                // ausrückt — ein Bewohner mit der Waffe der Wache (`b.waffe`, der Lebenslauf; er naht der Tat, `_bewohnerNahen`), der in
                // ihr wohnt, oder ein Wagen, dessen Fahrer in ihr wohnt
                const streifeJe = new Map();
                let [inWache, bewaffnet, ausWache] = [0, 0, 0];
                for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
                    if (S.revier || S.bande) reviere++;
                    const wsl = new Set(((S.plan && S.plan.slots) || []).filter((s) => s && s.rolle === "wache").map((s) => s.seed >>> 0));
                    wacheBau += wsl.size;
                    for (const b of S.liste || []) {
                        if (wsl.has(b.heim)) inWache++;
                        if (b.waffe) bewaffnet++;
                        if (wsl.has(b.heim) && (b.waffe || b.amSteuer)) {
                            ausWache++;
                            streifeJe.set(S.key + ":" + b.heim, (streifeJe.get(S.key + ":" + b.heim) || 0) + 1);
                        }
                    }
                    for (const b of S.liste || []) {
                        bewohner++;
                        if (b.amSteuer) fahrer++;
                        if (b.akt === "protest" || b.protest) protest++;
                        if (b.leib && !b.drinnen) {
                            const p = b.leib.position;
                            if (p.y - r.getTerrainHeightAt(p.x, p.z) > 6) oben++;
                        }
                    }
                }
                return {
                    plaene: plaene.length,
                    wachen,
                    wacheBau,
                    mitStreife: streifeJe.size,
                    inWache,
                    bewaffnet,
                    ausWache,
                    tuerme,
                    bewohner,
                    fahrer,
                    protest,
                    oben,
                    reviere,
                    pose: { px: +pm.x.toFixed(2), py: +(pm.y + 1.7).toFixed(2), pz: +pm.z.toFixed(2), lx: +(pm.x - 60).toFixed(2), ly: +(pm.y - 30).toFixed(2), lz: +(pm.z + 100).toFixed(2) },
                };
            },
        },
        sprossen: {
            1: {
                umfang: { soll: 1, wort: "Wache mit Streife" },
                masse: [
                    { key: "rho", wort: "Antwortzeit ∝ Weg zur Wache ρ", soll: 0.7, richtung: "≥" },
                    { key: "imSicht", wort: "wer im Sichtfeld erscheint (Zahl)", soll: 0, richtung: "≤" },
                ],
            },
            2: {
                auge: { pose: "hochhaus-dach: Blick über die Türme zum Platz", vorbild: "Bandenreviere und Graffiti einer Megastadt (Los Angeles, Gang-Karten; Rio, Favelas)" },
                erwartet: "nicht",
                fehlt: "keine Banden, keine Reviere, kein Graffiti",
            },
            3: {
                umfang: { soll: 100, wort: "Machtzentren" },
                masse: [{ key: "tuerme", wort: "Türme an maximaler Erreichbarkeit", soll: 0.8, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "eine Metropole, kein Bodenpreis, keine Macht, der die Höhe folgt",
            },
            4: {
                umfang: { soll: 1e4, wort: "Bewohner im Protest" },
                masse: [{ key: "schock", wort: "Protest nach Schock", soll: 0.7, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "kein Protest, keine Masse mit Ursache",
            },
            5: {
                umfang: { soll: 1e7, wort: "Köpfe unter Überwachung" },
                masse: [{ key: "kontrolle", wort: "Kontrolldichte ↔ Preis und Verbrechen", soll: 0.8, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Überwachung, ≤ 1092 Bewohner",
            },
            6: {
                auge: { pose: "hochhaus-dach: Blick über die Türme zum Platz", vorbild: "vertikal geschichtete Megastädte (Hongkong, Kowloon Walled City; São Paulo)" },
                erwartet: "nicht",
                fehlt: "keine vertikale Schichtung der Bewohner",
            },
            7: {
                umfang: { soll: 64, wort: "fremde Saaten" },
                masse: [{ key: "richter", wort: "Richter 1–6 in 64 fremden Saaten", soll: 0.7, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine fremde Megastadt",
            },
        },
        proben: {
            1: [
                {
                    name: "die Wache als Bau ohne Streife (der Stand von heute) — ROT am Umfang",
                    j: { leiter: "mensch.macht.megastadt", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 1: { art: "zahl", n: 0, werte: { rho: null, imSicht: null } } } },
                    gruen: false,
                    zahl: /ROT an Umfang 0 < 1 Wache mit Streife/,
                },
                {
                    name: "die Streife antwortet ohne Bezug zum Weg (ρ 0,2) — ROT an ρ",
                    j: { leiter: "mensch.macht.megastadt", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 1: { art: "zahl", n: 1, werte: { rho: 0.2, imSicht: 0 } } } },
                    gruen: false,
                    zahl: /ROT an Antwortzeit ∝ Weg zur Wache ρ 0\.2 verfehlt ≥ 0\.7/,
                },
                {
                    name: "die Streife erscheint im Sichtfeld (sie fährt nicht aus der Wache)",
                    j: { leiter: "mensch.macht.megastadt", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 1: { art: "zahl", n: 1, werte: { rho: 0.9, imSicht: 2 } } } },
                    gruen: false,
                    zahl: /ROT an wer im Sichtfeld erscheint \(Zahl\) 2 verfehlt ≤ 0/,
                },
            ],
        },
    }),
];
