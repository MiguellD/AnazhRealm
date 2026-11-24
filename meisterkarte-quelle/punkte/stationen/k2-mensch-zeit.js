// DIE RICHTER-STATIONEN DER PERSPEKTIVE zeit (Meisterkarte 2, Kapitel mensch; die Fabrik k2-mensch.js): je Leiter EINE Probe in der
// warmen Welt der Sitzung, die ALLE Sprossen der Leiter über dieselbe Messung urteilt. Die Zeit eines Orts ist in der Welt der
// Export der Foundry (`_foundryRequestSettlement`): der Akt mit Jahr (der Satz „dorf 7 12 jahr Y“ wählt die Epoche, fachwerk
// `epocheImJahr`, siedlung-ort.js `_dorfAkt`) und das Wachstum eines Orts (`_ortDp`: die Epoche seiner Gründung, das Jahr seines
// Gedächtnisses — derselbe Auftrag, mit dem `_ortWaechst` den Ort am neuen Jahr Welt werden lässt, und dieselbe Regel des Tauschs:
// ein Haus bleibt, wenn der neue Plan seinen Slot trägt, Same:Kultur@Ort). Dazu der Brand im Feld (`_brandEntfachen`, der Takt der
// Welt) und das Gedächtnis der Orte (`settlementCells`, ihre Akten). Gemessen wird das Ergebnis, nie der Code-Text.
"use strict";

// DER FÄCHER (stationen/faecher.js) und DAS GESETZ DES ORTS an einer Adresse (k2-mensch-bau.js ORT_AN: der Plan, den das Spiel beim Faden
// bestellt; mit a.zeit der Satz mit Jahr, `epocheImJahr`) samt der blinden Trennung am Rezept (TRENNE) — EINE Funktion, nie ein Zwilling
const { FAECHER } = require("./faecher.js");
const { ORT_AN, TRENNE } = require("./k2-mensch-bau.js");

module.exports = (F) => [
    // ───────────────────────── mensch.zeit.spanne — die Kultur-Zeit am Ort, datierbar ─────────────────────────
    // EINE Messung: die Halte des Jahres — je Jahr der Ort, den der Akt mit diesem Jahr stellt (Same 7, 12 Häuser), und wie viele
    // verschiedene Orte die Reihe der Jahre einer Sprosse trägt; für die vier Halte der ersten Sprosse stehen vier Orte in der Welt
    // (der Akt `spawnSettlement` mit Jahr, auf ebenem Land 500–800 m vor dem Genesis-Ort), je einer im Bild.
    F.leiter("mensch.zeit.spanne", {
        sek: 60,
        mutiert: true,
        pfad: ["stamm/siedlung-ort.js", "stamm/siedlung-wege.js", "fachwerk-core.js"],
        messe: async (H, K) => {
            // S1 AM GESETZ (der Fächer, stationen/faecher.js): dieselbe Zelle (5 Saaten) unter den 4 Jahren des Satzes, je Adresse der Plan,
            // den der Satz mit Jahr bestellt (ORT_AN mit a.zeit: `epocheImJahr` → exportSettlement) — gleichen sich zwei Halte einer Zelle
            // Haus für Haus, ist ihre Folge im Bild ein Wurf: die Schranke der Blind-Datierung ist das Mittel über die Zellen von Π 1/g!
            // (g die Größe jeder Gruppe gleicher Orte). Liegt sie unter 80 %, urteilt die Sprosse am Gesetz „nicht“, nie ein Bild
            let fa = null;
            await K.schritt(1, async () => {
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.ORT_AN, export: "fachwerk-core.js:4961 epocheImJahr → :11165 exportSettlement → :4395 epocheDerSaat (die Epoche, die der Stand der Saat trägt)", leser: "stamm/siedlung-ort.js:1227" },
                    adressen: { saaten: [7, 1, 2, 3, 4], zeiten: [1300, 1600, 1800, 1950] },
                    mit: { nH: 12 },
                    masse: {
                        adressen: { wie: "anzahl" },
                        zellen: {
                            wie: (v, aus) => {
                                const m = {};
                                for (const x of aus) {
                                    const sig = x.w.tracht + "|" + JSON.stringify(x.w.bauten.map((b) => [b.rolle, b.kultur, b.x, b.z, b.num, b.kat]));
                                    ((m[x.a.saat] = m[x.a.saat] || {})[sig] = m[x.a.saat][sig] || []).push(x.a.zeit + " " + x.w.epoche + " (Plan " + x.w.jahr + ")");
                                }
                                const fak = (n) => (n <= 1 ? 1 : n * fak(n - 1));
                                const zs = Object.keys(m);
                                const gleich = zs.flatMap((k) => Object.values(m[k]).filter((g) => g.length > 1).map((g) => "Saat " + k + ": " + g.join(" ≡ ")));
                                const schranke = zs.reduce((q, k) => q + Object.values(m[k]).reduce((p, g) => p / fak(g.length), 1), 0) / Math.max(1, zs.length);
                                return { zellen: zs.length, vier: zs.filter((k) => Object.keys(m[k]).length >= 4).length, schranke: +schranke.toFixed(3), gleich };
                            },
                        },
                        datiert: { wie: (v, aus) => H.seite.TRENNE(aus.flatMap((x) => x.w.bauten.map((b) => Object.assign({}, b, { halt: String(x.a.zeit) }))), "halt", { farbe: true }) },
                    },
                    ungemessen: ["die Blind-Datierung der 4 Bilder am Panel (die Folge ≥ 80 %): ungemessen bis zum Gerät"],
                    ms: Math.max(3000, Math.min(9000, Math.floor((H.rest() - 30) * 1000))),
                });
                const w = R.werte;
                H.zeile("Spanne S1: " + R.akte.slice(0, 500) + " · gleich " + JSON.stringify(w.zellen.gleich).slice(0, 400) + " · datiert " + JSON.stringify(w.datiert));
                if (R.fehlt && !R.gemessen) return K.leser(1, { fehlt: "der Plan des Jahrs: " + R.fehlt, wo: "stamm/siedlung-ort.js:1227" });
                if (!R.gemessen) throw new Error("der Fächer der Jahre maß keine Adresse (" + R.akte.slice(0, 200) + ")");
                if (w.zellen.schranke < 0.8)
                    return K.nicht(1, {
                        n: w.zellen.vier,
                        fehlt: "4 Halte derselben Zelle: " + (w.zellen.zellen - w.zellen.vier) + " von " + w.zellen.zellen + " Zellen tragen zwei gleiche Orte (" + (w.zellen.gleich[0] || "—") +
                            ": die Epoche fällt auf die, die der Stand der Saat trägt, fachwerk-core.js:4395) — die Folge der Bilder ist höchstens zu " + Math.round(w.zellen.schranke * 100) + " % richtig, am Rezept datiert " + Math.round((w.datiert.balanciert || 0) * 100) + " %",
                    });
                fa = R;
            });
            await K.messort("genesis");
            const reihen = {
                2: { von: -1000, schritt: 50, n: 60 },
                3: { von: -10000, schritt: 10, n: 1200 },
                4: { von: 2000, schritt: 1, n: 1001 },
                5: { zufall: [-300000, 12000], n: 1000 },
                6: { zufall: [-3000, 2020], n: 1000, orte: 4 },
                7: { von: -1000000, schritt: 1000, n: 1001 },
            };
            const h = await K.welt("return await (" + H.seite.HALTE + ")(r, T, " + JSON.stringify({ reihen, seed: 7, nH: 12 }) + ");", 45000);
            if (!h || h.fehler) throw new Error("die Halte: " + ((h && h.fehler) || "ohne Antwort"));
            H.zeile("Halte: " + JSON.stringify(h));
            const was = {
                2: "das Jahr wählt nur die Epoche (fachwerk epocheImJahr): 60 Halte über 3 000 J, Schritt 50 J, tragen ",
                3: "vor 1560 steht derselbe Ort des Mittelalters, kein Lager, kein Dorf ohne Metall, kein Tell: 1 200 Halte über 12 000 J tragen ",
                4: "die Zukunft ist ein Halt (moderne), kein Zeitraffer, keine wachsende Stadt: 1 001 Jahre 2000–3000 tragen ",
                5: "300 000 J und 10⁴ J Zukunft geben dieselben Halte, keine Kultur vor dem Mittelalter: 1 000 Zufallsjahre tragen ",
                6: "der Ort trägt die Kultur seiner Region und Epoche, kein Schlüssel der Erde: 1 000 Stichproben (4 Orte × Jahr) tragen ",
                7: "eine Welt, eine Art (Mensch), keine 10⁶ J: 1 001 Halte tragen ",
            };
            for (const n of [2, 3, 4, 5, 6, 7])
                await K.schritt(n, async () => {
                    const q = h.je[n];
                    if (q.verschieden < reihen[n].n) return K.nicht(n, { n: q.verschieden, fehlt: was[n] + q.verschieden + " verschiedene Orte (" + q.epochen.join(", ") + "; der Ort ist eine Funktion seines Auftrags: " + (h.rein ? "derselbe Auftrag, derselbe Ort" : "UNREIN") + ")" });
                    const b = await K.bild(n, h.pose);
                    return K.auge(n, { bild: b.datei, pose: "genesis", mass: q.verschieden + " Halte" });
                });
            await K.schritt(1, async () => {
                if (!fa) return null; // S1 steht schon (nicht · leser) oder warf am Fächer: UNGEMESSEN beim Namen
                const fristMs = Math.max(8000, Math.round((H.rest() - 26) * 1000));
                const o = await K.welt("return await (" + H.seite.VIER + ")(r, T, " + JSON.stringify({ jahre: [1300, 1600, 1800, 1950], seed: 7, nH: 12, fristMs }) + ");", fristMs + 15000);
                if (!o || o.fehler) throw new Error("die vier Orte: " + ((o && o.fehler) || "ohne Antwort"));
                H.zeile("Vier Orte: " + JSON.stringify(o));
                const s = String(H.AUS);
                const basis = s.endsWith(".json") ? s.slice(0, -5) : s;
                const bilder = [];
                for (const q of o.orte) {
                    if (H.rest() < 6) break;
                    const b = await K.bild(1, q.pose);
                    if (!b.datei) throw new Error("das Bild des Jahres " + q.jahr + " fehlt (" + b.abnahme + ")");
                    const ziel = basis + "-S1-" + q.jahr + (b.datei.endsWith("-rot.png") ? "-rot.png" : ".png");
                    H.fs.renameSync(b.datei, ziel);
                    bilder.push(Object.assign({ datei: ziel }, q));
                }
                if (bilder.length < 4) throw new Error("nur " + bilder.length + " von 4 Halten im Bild (Frist " + H.sek() + " s)");
                K.auge(1, {
                    bild: bilder[0].datei,
                    pose: "genesis: vier Orte (Same 7, 12 Häuser) der Jahre 1300/1600/1800/1950, je die Kamera 70 m vor ihrer Mitte, 22 m über dem Grund, Blick auf die Mitte",
                    mass: bilder.map((q) => q.jahr + " " + q.epoche + " " + q.haeuser + " Häuser → " + H.path.basename(q.datei)).join(" · ") + " (die Folge blind zu ordnen) · Fächer: " + fa.werte.zellen.vier + "/" + fa.werte.zellen.zellen +
                        " Zellen mit 4 Orten, Schranke der Folge " + fa.werte.zellen.schranke + ", am Rezept datiert " + Math.round((fa.werte.datiert.balanciert || 0) * 100) + " %",
                });
            });
        },
        seite: {
            FAECHER,
            ORT_AN,
            TRENNE,
            // je Sprosse die Reihe der Jahre, je Jahr der Auftrag des Akts (Epoche aus dem Jahr), je verschiedenem Auftrag EIN Export;
            // verschieden heißt: ein anderer Ort (Jahr des Plans, Region, Größe, Slots, Straßen, die ersten Slots)
            HALTE: async (r, T, arg) => {
                const AR = r.constructor;
                const ep = AR.Gesetz("fachwerk:epocheImJahr");
                const t0 = performance.now();
                const sig = (p) => JSON.stringify([p.jahr, p.region, p.groesse, p.slots.length, (p.roads || []).length, p.slots.slice(0, 3).map((s) => [s.kultur, Math.round(s.x), Math.round(s.z)])]);
                const cache = new Map();
                const ort = async (seed, epoche) => {
                    const k = seed + "|" + epoche;
                    if (!cache.has(k)) {
                        const p = await r._foundryRequestSettlement({ seed, nH: arg.nH, epoche });
                        if (!p) throw new Error("die Foundry ist kalt: export-settlement null (Same " + seed + ", " + epoche + ")");
                        cache.set(k, sig(p));
                    }
                    return cache.get(k);
                };
                let z = 2654435761;
                const rnd = () => ((z = (Math.imul(z, 1103515245) + 12345) >>> 0) / 4294967296);
                const je = {};
                for (const [n, q] of Object.entries(arg.reihen)) {
                    const sigs = new Set();
                    const epochen = new Set();
                    for (let i = 0; i < q.n; i++) {
                        const jahr = q.zufall ? Math.round(q.zufall[0] + rnd() * (q.zufall[1] - q.zufall[0])) : q.von + i * q.schritt;
                        const e = ep(jahr);
                        epochen.add(e);
                        sigs.add(await ort(q.orte ? arg.seed + (i % q.orte) : arg.seed, e));
                    }
                    je[n] = { halte: q.n, verschieden: sigs.size, epochen: [...epochen] };
                }
                // die Welt ist eine Funktion: derselbe Auftrag ein zweites Mal, derselbe Ort
                const p2 = await r._foundryRequestSettlement({ seed: arg.seed, nH: arg.nH, epoche: ep(1300) });
                const rein = !!p2 && sig(p2) === (await ort(arg.seed, ep(1300)));
                const g = r._genesisMitte();
                const y = r.getTerrainHeightAt(g.x, g.z);
                return { je, rein, exporte: cache.size + 1, ms: Math.round(performance.now() - t0), pose: { px: g.x, py: +(y + 30).toFixed(2), pz: g.z + 40, lx: g.x, ly: +y.toFixed(2), lz: g.z } };
            },
            // die vier Halte in der Welt: je Jahr ein Ort (der Akt mit Jahr, `spawnSettlement` → { placed, mitte, name }) auf dem
            // ebensten Land 500–800 m vor dem Genesis-Ort, ≥ 300 m voneinander — sagt der Akt ab (im Reich einer Stadt, kein Grund),
            // nimmt das Jahr die nächste Stelle; je Ort seine Häuser und die Pose (70 m vor der Mitte der Häuser, 22 m hoch)
            VIER: async (r, T, arg) => {
                const AR = r.constructor;
                const ep = AR.Gesetz("fachwerk:epocheImJahr");
                const t0 = performance.now();
                const g = r._genesisMitte();
                const land = (x, z) => r._landAt(x, z, 0.2);
                const hoch = (x, z) => r.getTerrainHeightAt(x, z);
                const kand = [];
                for (const R of [500, 650, 800])
                    for (let k = 0; k < 24; k++) {
                        const a = (k / 24) * 2 * Math.PI;
                        const [x, z] = [g.x + Math.cos(a) * R, g.z + Math.sin(a) * R];
                        const ys = [0, 1, 2, 3, 4, 5, 6, 7].map((j) => [x + Math.cos(j * 0.785) * 70, z + Math.sin(j * 0.785) * 70]);
                        if (!land(x, z) || !ys.every(([u, v]) => land(u, v))) continue;
                        const hs = ys.map(([u, v]) => hoch(u, v));
                        kand.push({ x, z, hang: Math.max(...hs) - Math.min(...hs) });
                    }
                kand.sort((a, b) => a.hang - b.hang);
                if (kand.length < arg.jahre.length) return { fehler: "nur " + kand.length + " ebene Stellen 500–800 m vor dem Genesis-Ort" };
                const orte = [];
                const abgesagt = [];
                for (const jahr of arg.jahre) {
                    let res = null;
                    while (!res && kand.length && performance.now() - t0 < arg.fristMs) {
                        const c = kand.shift();
                        if (orte.some((o) => Math.hypot(o.x - c.x, o.z - c.z) < 300)) continue;
                        res = await r.spawnSettlement({ seed: arg.seed, nH: arg.nH, jahr, position: { x: c.x, y: 0, z: c.z } });
                        if (!res || !res.placed || !res.mitte) (abgesagt.push(Math.round(c.x) + "/" + Math.round(c.z)), (res = null));
                    }
                    if (!res) return { fehler: "der Ort des Jahres " + jahr + " steht nicht (" + orte.length + " Orte stehen; abgesagt an " + (abgesagt.join(" ") || "–") + "; " + Math.round(performance.now() - t0) + " ms)" };
                    const m = res.mitte;
                    const y = hoch(m.x, m.z);
                    orte.push({ jahr, epoche: ep(jahr), name: res.name, haeuser: res.placed, x: +m.x.toFixed(1), z: +m.z.toFixed(1), pose: { px: +m.x.toFixed(2), py: +(y + 22).toFixed(2), pz: +(m.z + 70).toFixed(2), lx: +m.x.toFixed(2), ly: +(y + 3).toFixed(2), lz: +m.z.toFixed(2) } });
                }
                return { orte, abgesagt, ms: Math.round(performance.now() - t0) };
            },
        },
        sprossen: {
            // am Fächer (5 Zellen × 4 Jahre, headless 24.11.): 5 von 5 Zellen geben 1600 und 1800 denselben Ort (hanse statt barock: der Stand
            // der Saat trägt kalkmoertel/glas/kupfer nicht; über 10 Saaten 9 von 10) — die Folge ist höchstens zu 50 % richtig, ein ganzes
            // ROT am Gesetz, kein Panel
            1: {
                auge: {
                    pose: "genesis: vier Orte (Same 7, 12 Häuser) der Jahre 1300/1600/1800/1950, je die Kamera 70 m vor ihrer Mitte, 22 m über dem Grund",
                    vorbild: "datierte Ansichten derselben Stadt zu vier Zeiten (Merian-Stich um 1640, Ansichten um 1800, Fotos um 1900 und 1950) — die Folge der vier Bilder",
                },
                erwartet: "nicht",
                fehlt: "4 Halte derselben Zelle: 1600 und 1800 geben denselben Ort (die Epoche fällt auf die, die der Stand der Saat trägt)",
            },
            2: {
                auge: { pose: "genesis: 40 m vor der Mitte, 30 m hoch", vorbild: "datierte Bildquellen eines Orts über 3 000 Jahre (Rekonstruktionen je 50 Jahre)" },
                erwartet: "nicht",
                fehlt: "das Jahr wählt nur die Epoche: 60 Halte geben ≤ 5 verschiedene Orte, kein Regler",
            },
            3: {
                auge: { pose: "genesis: 40 m vor der Mitte, 30 m hoch", vorbild: "Grabungsbefunde und Rekonstruktionen von Lager, Dorf ohne Metall und Tell (Çatalhöyük, Jericho)" },
                erwartet: "nicht",
                fehlt: "kein Lager, kein Dorf ohne Metall, kein Tell: vor 1560 derselbe Ort des Mittelalters",
            },
            4: {
                auge: { pose: "genesis: 40 m vor der Mitte, 30 m hoch", vorbild: "Zeitraffer gewachsener Städte (Luftbildreihen 1950–2020) — Anfang und Ende blind geordnet" },
                erwartet: "nicht",
                fehlt: "kein Zeitraffer, keine Zukunft über einen Halt",
            },
            5: {
                auge: { pose: "genesis: 40 m vor der Mitte, 30 m hoch", vorbild: "Rekonstruktionen jeder Kultur am Ort über 300 000 Jahre; Fremdwelt-Probe (R10) für die Zukunft" },
                erwartet: "nicht",
                fehlt: "keine Kultur vor dem Mittelalter, keine 300 000 J",
            },
            6: {
                auge: { pose: "genesis: 40 m vor der Mitte, 30 m hoch", vorbild: "datierte Bildquellen und Rekonstruktionen je Ort und Epoche (2AFC)" },
                erwartet: "nicht",
                fehlt: "kein Ort des Planeten je Jahr: die Kultur folgt Region und Epoche",
            },
            7: {
                auge: { pose: "genesis: 40 m vor der Mitte, 30 m hoch", vorbild: "Fremdwelt-Probe (R10): fünf Halte eines Orts einer fremden Art" },
                erwartet: "nicht",
                fehlt: "eine Welt, eine Art, keine 10⁶ J",
            },
        },
        proben: {
            1: [
                {
                    name: "zwei Halte derselben Zelle gleich (1600 ≡ 1800) — ROT am Gesetz, nie ein Bild",
                    j: { leiter: "mensch.zeit.spanne", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 1: { art: "nicht", n: 0, fehlt: "4 Halte derselben Zelle: 5 von 5 Zellen tragen zwei gleiche Orte" } } },
                    gruen: false,
                    zahl: /ROT: Umfang nicht erzeugbar: 4 Halte derselben Zelle: 5 von 5 Zellen tragen zwei gleiche Orte \(gemessen 0\)/,
                },
                {
                    name: "die Abnahme speicherte kein Bild (das Bild fehlt im Lauf)",
                    j: { leiter: "mensch.zeit.spanne", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 1: { art: "auge", bild: "", pose: "Probe", vorbild: "Probe" } } },
                    gruen: false,
                    zahl: /keine Messung der Sprosse$/,
                },
            ],
            2: [
                {
                    name: "fünf Halte statt sechzig (der Stand der Welt)",
                    j: { leiter: "mensch.zeit.spanne", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 2: { art: "nicht", n: 2, fehlt: "das Jahr wählt nur die Epoche: 60 Halte tragen 2 verschiedene Orte" } } },
                    gruen: false,
                    zahl: /ROT: Umfang nicht erzeugbar: das Jahr wählt nur die Epoche/,
                },
            ],
        },
    }),

    // ───────────────────────── mensch.zeit.palimpsest — Hervorgehen: das Jüngere trägt das Ältere ─────────────────────────
    // EINE Messung: der Ort von 1320 (Same 7) im Wachstum der Welt — sein Plan an den Jahren seines Gedächtnisses (`_ortDp`: Epoche
    // der Gründung, jahr), welche Häuser bleiben (die Regel von `_ortWaechst`: Same:Kultur@Ort), welche dazukommen, ob ein Haus sich
    // wandelt (seine Maße über die Jahre), ob ein Sprung zwischen Nachbarjahren liegt, sein Name, seine Chronik; dazu je Same 1–8
    // die Mauer von 1560 und die Straßen von 1860 desselben wachsenden Orts.
    F.leiter("mensch.zeit.palimpsest", {
        sek: 45,
        pfad: ["stamm/siedlung-ort.js", "fachwerk-core.js"],
        messe: async (H, K) => {
            await K.messort("wiese");
            const w = await K.welt("return await (" + H.seite.WACHSEN + ")(r, T, " + JSON.stringify({ seed: 7, gruendung: 1320, jahre: [1400, 1500, 1600, 1700, 1800, 1900, 1935], nachbar: [1320, 1920, 20] }) + ");", 40000);
            if (!w || w.fehler) throw new Error("das Wachstum: " + ((w && w.fehler) || "ohne Antwort"));
            H.zeile("Wachstum: " + JSON.stringify(w));
            await K.schritt(2, async () =>
                K.zahl(2, {
                    n: w.ringe,
                    werte: { ueberdeckung: w.ueberdeckung },
                    beleg: "Slots " + w.stufen.map((q) => q.jahr + ":" + q.slots + (q.neu ? "+" + q.neu : "") + (q.weg ? "−" + q.weg : "")).join(" ") + " · Jahresringe (Jahrhunderte mit neuen Häusern) " + w.ringe + " · von " + w.gruendSlots + " Häusern 1320 stehen 1935 noch " + w.bleiben + " · " + w.ms + " ms",
                    taeter: "fachwerk-core.js exportSettlement (das Wachstum am Jahr, `_ortWaechst` vorTausch): der neue Plan trägt den alten Slot nicht, das Haus fällt",
                })
            );
            await K.schritt(3, async () => {
                const e = await K.welt("return await (" + H.seite.ERBE + ")(r, T, " + JSON.stringify({ saaten: [1, 2, 3, 4, 5, 6, 7, 8], gruendung: 1320, alt: 1560, jung: 1860, mTrasse: 4, mGasse: 2 }) + ");", 40000);
                if (!e || e.fehler) throw new Error("das Erbe: " + ((e && e.fehler) || "ohne Antwort"));
                const mit = e.saaten.filter((q) => q.ring);
                const trasse = mit.length ? mit.reduce((s, q) => s + q.trasse, 0) / mit.length : 0;
                const gassen = e.saaten.reduce((s, q) => s + q.gassen, 0) / e.saaten.length;
                K.zahl(3, {
                    n: e.saaten.length,
                    werte: { trasse: +trasse.toFixed(3), kerngassen: +gassen.toFixed(3) },
                    beleg: mit.length + " von " + e.saaten.length + " Saaten tragen 1560 eine Mauer" + (mit.length ? "" : " (die Trasse fehlt: 0)") + " · je Same Trasse/Gassen " + e.saaten.map((q) => q.seed + ":" + (q.ring ? q.trasse.toFixed(2) : "–") + "/" + q.gassen.toFixed(2)).join(" ") + " · " + e.ms + " ms",
                    taeter: "fachwerk-core.js exportSettlement im Wachstum: " + (mit.length ? "die Straßen von 1860 kennen die Trasse der Mauer von 1560 nicht" : "der wachsende Ort trägt 1560 keine Mauer, deren Trasse er erben könnte"),
                });
            });
            await K.schritt(4, async () =>
                K.zahl(4, {
                    n: w.spanne4,
                    werte: { sprung: w.sprung, bauphasen: w.bauphasen },
                    beleg: w.paare + " Nachbarjahr-Paare 1320–1920, " + w.wechsel + " Wechselstellen (halbiert je 20 J), größter Sprung " + w.sprung + (w.sprungJ ? " an " + (w.sprungJ - 1) + "→" + w.sprungJ : "") + " · " + w.umbau + " von " + w.gruendSlots + " Häusern der Altstadt mit ≥ 2 Bauphasen (Geschosse, Maße, Dach)",
                    taeter: "fachwerk-core.js exportSettlement: ein Haus bleibt, wie es gebaut wurde, oder fällt — kein Umbau, keine Aufstockung, keine Spolie",
                })
            );
            await K.schritt(5, async () => K.nicht(5, { n: w.chronikJ, fehlt: "keine Schichten im Boden, keine Grabung: die Chronik des Orts reicht " + w.chronikJ + " Jahre (" + w.gr0 + " → " + w.ende + "), ein Haus fällt ohne Spur" }));
            await K.schritt(6, async () => K.nicht(6, { n: w.chronikJ, fehlt: "der Name erbt nicht: „" + w.namen.join("“ → „") + "“ über 1320–1935, die Chronik reicht " + w.chronikJ + " Jahre (keine 1 000)" }));
            await K.schritt(7, async () => {
                if (w.chronikJ < 5000) return K.nicht(7, { n: w.chronikJ, fehlt: "kein Niedergang: der Ort wächst nur (" + w.niedergang + " Schritte mit weniger Häusern), keine Ruine, kein Wald über ihr; die Chronik reicht " + w.chronikJ + " Jahre" });
                const b = await K.bild(7, w.pose);
                return K.auge(7, { bild: b.datei, pose: "wiese", mass: w.niedergang + " Schritte Niedergang" });
            });
            await K.schritt(8, async () => K.nicht(8, { n: w.chronikJ, fehlt: "keine Metropole über 10⁴ J: die Chronik reicht " + w.chronikJ + " Jahre, ein Ort trägt den Plan seines Jahres, nie eine Spur früherer Epochen daneben" }));
        },
        seite: {
            WACHSEN: async (r, T, arg) => {
                const AR = r.constructor;
                const ep = AR.Gesetz("fachwerk:epocheImJahr");
                const t0 = performance.now();
                const E = ep(arg.gruendung);
                const ex = async (jahr) => {
                    const p = await r._foundryRequestSettlement(jahr == null ? { seed: arg.seed, epoche: E } : { seed: arg.seed, epoche: E, jahr });
                    if (!p) throw new Error("die Foundry ist kalt: export-settlement null (Jahr " + jahr + ")");
                    return p;
                };
                const id = (s) => (s.seed >>> 0) + ":" + s.kultur + "@" + Math.round(s.x * 20) + "," + Math.round(s.z * 20);
                const form = (s) => JSON.stringify([s.ov && s.ov.storeys, s.ov && s.ov.W, s.ov && s.ov.D, s.ov && s.ov.dachTyp, s.rolle]);
                const A = await ex(null);
                const ids0 = A.slots.map(id);
                const formen = new Map(A.slots.map((s) => [id(s), new Set([form(s)])]));
                const stufen = [];
                let vor = new Set(ids0);
                let niedergang = 0;
                const ringJ = new Set(); // die Jahrhunderte, in denen neue Häuser kommen (die Jahresringe)
                let letzter = A;
                const namen = [A.name];
                for (const J of arg.jahre) {
                    const B = await ex(J);
                    const ids = new Set(B.slots.map(id));
                    const neu = [...ids].filter((k) => !vor.has(k)).length;
                    const weg = [...vor].filter((k) => !ids.has(k)).length;
                    if (neu > 0) ringJ.add(Math.floor(J / 100));
                    if (B.slots.length < vor.size) niedergang++;
                    for (const s of B.slots) if (formen.has(id(s))) formen.get(id(s)).add(form(s));
                    stufen.push({ jahr: J, slots: B.slots.length, neu, weg });
                    if (namen[namen.length - 1] !== B.name) namen.push(B.name);
                    vor = ids;
                    letzter = B;
                }
                const bleiben = ids0.filter((k) => vor.has(k)).length;
                // die Nachbarjahre (S4): jedes Paar (Y − 1, Y) über die Spanne — die Menge der Slots wechselt nur an Stellen; je
                // Schritt (nachbar[2] J) halbiert die Probe bis zu jeder Wechselstelle und misst dort den Anteil der Slots, die
                // kommen oder gehen (die Paare ohne Wechsel tragen 0)
                const menge = async (J) => {
                    const p = await ex(J);
                    for (const s of p.slots) if (formen.has(id(s))) formen.get(id(s)).add(form(s));
                    return new Set(p.slots.map(id));
                };
                const gleich = (a, b) => a.size === b.size && [...a].every((k) => b.has(k));
                const anteil = (a, b) => ([...a].filter((k) => !b.has(k)).length + [...b].filter((k) => !a.has(k)).length) / Math.max(1, a.size);
                let [sprung, paare, wechsel, sprungJ] = [0, 0, 0, null];
                let [Ya, Ma] = [arg.nachbar[0], await menge(arg.nachbar[0])];
                while (Ya < arg.nachbar[1]) {
                    const Yb = Math.min(arg.nachbar[1], Ya + arg.nachbar[2]);
                    const Mb = await menge(Yb);
                    let [lo, Mlo] = [Ya, Ma];
                    while (!gleich(Mlo, Mb)) {
                        let [a, b] = [lo, Yb];
                        while (b - a > 1) {
                            const m = Math.floor((a + b) / 2);
                            if (gleich(await menge(m), Mlo)) a = m;
                            else b = m;
                        }
                        const Ms = b === Yb ? Mb : await menge(b);
                        const f = anteil(Mlo, Ms);
                        if (f > sprung) [sprung, sprungJ] = [f, b];
                        wechsel++;
                        [lo, Mlo] = [b, Ms];
                    }
                    paare += Yb - Ya;
                    [Ya, Ma] = [Yb, Mb];
                }
                const umbau = ids0.filter((k) => formen.get(k).size >= 2).length;
                const ch = A.chronik || {};
                const y = r.getTerrainHeightAt(r.state.playerMesh.position.x, r.state.playerMesh.position.z);
                const pm = r.state.playerMesh.position;
                return {
                    gruendSlots: ids0.length,
                    stufen,
                    bleiben,
                    ueberdeckung: +(bleiben / Math.max(1, ids0.length)).toFixed(3),
                    ringe: ringJ.size,
                    sprung: +sprung.toFixed(3),
                    sprungJ,
                    wechsel,
                    paare,
                    spanne4: arg.nachbar[1] - arg.nachbar[0],
                    umbau,
                    bauphasen: +(umbau / Math.max(1, ids0.length)).toFixed(3),
                    niedergang,
                    namen,
                    gr0: ch.gr0 == null ? null : ch.gr0,
                    ende: ch.ende == null ? null : ch.ende,
                    chronikJ: Number.isFinite(ch.ende) && Number.isFinite(ch.gr0) ? ch.ende - ch.gr0 : 0,
                    letzterJahr: letzter.jahr,
                    ms: Math.round(performance.now() - t0),
                    pose: { px: +pm.x.toFixed(2), py: +(y + 30).toFixed(2), pz: +(pm.z + 40).toFixed(2), lx: +pm.x.toFixed(2), ly: +y.toFixed(2), lz: +pm.z.toFixed(2) },
                };
            },
            // das Erbe der Wege: je Same der wachsende Ort von 1320 am alten Jahr (Mauer, Gassen) und am jungen (Straßen) — die
            // Deckung der Mauer-Punkte durch Straßen ≤ mTrasse, die der alten Gassen-Punkte ≤ mGasse
            ERBE: async (r, T, arg) => {
                const AR = r.constructor;
                const ep = AR.Gesetz("fachwerk:epocheImJahr");
                const E = ep(arg.gruendung);
                const d = (px, pz, a, b) => {
                    const [dx, dz] = [b.x - a.x, b.z - a.z];
                    const l2 = dx * dx + dz * dz || 1;
                    const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (pz - a.z) * dz) / l2));
                    return Math.hypot(px - a.x - t * dx, pz - a.z - t * dz);
                };
                const deck = (pts, roads, m) => {
                    let hit = 0;
                    for (const [px, pz] of pts) {
                        let best = Infinity;
                        for (const rd of roads || []) for (let i = 1; i < rd.pts.length; i++) best = Math.min(best, d(px, pz, rd.pts[i - 1], rd.pts[i]));
                        if (best <= m) hit++;
                    }
                    return pts.length ? hit / pts.length : 0;
                };
                const t0 = performance.now();
                const saaten = [];
                for (const seed of arg.saaten) {
                    const A = await r._foundryRequestSettlement({ seed, epoche: E, jahr: arg.alt });
                    const B = await r._foundryRequestSettlement({ seed, epoche: E, jahr: arg.jung });
                    if (!A || !B) return { fehler: "die Foundry ist kalt: export-settlement null (Same " + seed + ")" };
                    const ring = !!(A.mauer && Array.isArray(A.mauer.segs) && A.mauer.segs.length);
                    const rp = [];
                    if (ring) for (const s of A.mauer.segs) for (let k = 0; k <= 4; k++) rp.push([s.x0 + ((s.x1 - s.x0) * k) / 4, s.z0 + ((s.z1 - s.z0) * k) / 4]);
                    const gp = [];
                    for (const rd of A.roads || []) for (const q of rd.pts) gp.push([q.x, q.z]);
                    saaten.push({ seed, ring, trasse: ring ? deck(rp, B.roads, arg.mTrasse) : 0, gassen: deck(gp, B.roads, arg.mGasse) });
                }
                return { saaten, ms: Math.round(performance.now() - t0) };
            },
        },
        bestehend: { 1: "siedlung.K4#2" },
        sprossen: {
            2: {
                umfang: { soll: 4, wort: "Jahresringe (Jahrhunderte mit neuen Häusern, 1320 → 1935)" },
                masse: [{ key: "ueberdeckung", wort: "Überdeckung je Slot 1320 → 1935", soll: 0.9, richtung: "≥" }],
            },
            3: {
                umfang: null,
                masse: [
                    { key: "trasse", wort: "Mauertrasse 1560 als Straße 1860", soll: 0.8, richtung: "≥" },
                    { key: "kerngassen", wort: "Kerngassen 1560 in 1860", soll: 0.9, richtung: "≥" },
                ],
            },
            4: {
                umfang: { soll: 600, wort: "Jahre stufenlos (1320 → 1920)" },
                masse: [
                    { key: "sprung", wort: "größter Sprung zwischen Nachbarjahren", soll: 0.05, richtung: "≤" },
                    { key: "bauphasen", wort: "Altstadt mit ≥ 2 Bauphasen (Anteil)", soll: 0.5, richtung: "≥" },
                ],
            },
            5: {
                umfang: { soll: 5000, wort: "Jahre Schichten im Boden" },
                masse: [
                    { key: "schichtfolge", wort: "Schichtfolge = gefahrene Zustände", soll: 1, richtung: "≥" },
                    { key: "persistenz", wort: "Trassen-Persistenz", soll: 0.3, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "keine Schichten im Boden, keine Grabung",
            },
            6: {
                umfang: { soll: 1000, wort: "Jahre Namensgeschichte (100 Orte)" },
                masse: [{ key: "ableitbar", wort: "Ortsname lautgesetzlich ableitbar", soll: 0.9, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "der Name erbt nicht, die Chronik reicht keine 1 000 Jahre",
            },
            7: {
                auge: { pose: "wiese: 40 m vor dem Spieler, 30 m hoch", vorbild: "Wüstungen und überwachsene Ruinen (Angkor, mittelalterliche Wüstungen Mitteleuropas)" },
                erwartet: "nicht",
                fehlt: "kein Niedergang, keine Ruine, kein Wald über ihr",
            },
            8: {
                umfang: { soll: 10000, wort: "Jahre Metropole" },
                masse: [{ key: "epochen2", wort: "≥ 2 Epochen sichtbar (Anteil der Blicke)", soll: 0.6, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Metropole über 10⁴ J, keine Spur früherer Epochen",
            },
        },
        proben: {
            2: [
                {
                    name: "ein Ort, der nur in einem Jahrhundert wächst: jedes Haus bleibt, ein Ring",
                    j: { leiter: "mensch.zeit.palimpsest", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 2: { art: "zahl", n: 1, werte: { ueberdeckung: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Umfang 1 < 4 Jahresringe/,
                },
            ],
            4: [
                {
                    name: "Ersatz statt Umbau (der Stand der Welt): kein Sprung, kein Haus mit zweiter Bauphase",
                    j: { leiter: "mensch.zeit.palimpsest", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 4: { art: "zahl", n: 600, werte: { sprung: 0, bauphasen: 0 } } } },
                    gruen: false,
                    zahl: /ROT an Altstadt mit ≥ 2 Bauphasen \(Anteil\) 0 verfehlt ≥ 0\.5/,
                },
            ],
        },
    }),

    // ───────────────────────── mensch.zeit.kausal — die Kausalkette aus dem Samen ─────────────────────────
    // EINE Messung: die Geschichte je Same — der Ort von 1320 (Same 1–100, 4 Häuser) im Wachstum der Welt über 10³ J (935 → 1935, je
    // 200 J), die Epoche seines Plans (fachwerk epocheImJahr über das Jahr des Plans), ihre Varianz über die Saaten je Jahr (die
    // Epochen in der Folge der Zeit: 0, 1, 2 …) und ob das Jahr des Plans je rückwärts springt; dazu das Gedächtnis der Orte
    // (`settlementCells`, ihre Akten: die Glieder, die die Welt von einer Tat behält). Am Kern gerechnet (Node, 100 Saaten je 100 J):
    // Varianz 0 bis 1635, 0,25 an 1735 und 1835, 0,227 an 1935; 0 Ordnungsbrüche; 33 ms je Export.
    F.leiter("mensch.zeit.kausal", {
        sek: 60,
        pfad: ["stamm/siedlung-ort.js", "stamm/siedlung-bewohner.js", "fachwerk-core.js"],
        messe: async (H, K) => {
            await K.messort("wiese");
            const fristMs = Math.max(8000, Math.round((H.rest() - 8) * 1000));
            const g = await K.welt("return await (" + H.seite.GESCHICHTE + ")(r, T, " + JSON.stringify({ saaten: 100, nH: 4, gruendung: 1320, jahre: [935, 1135, 1335, 1535, 1735, 1935], fristMs }) + ");", fristMs + 10000);
            if (!g || g.fehler) throw new Error("die Geschichte: " + ((g && g.fehler) || "ohne Antwort"));
            H.zeile("Geschichte: " + JSON.stringify(g).slice(0, 1500));
            await K.schritt(2, async () =>
                K.zahl(2, {
                    n: g.n,
                    werte: { varianz: g.varianz, brueche: g.brueche },
                    beleg: g.n + " Saaten × " + g.jahre.length + " Jahre über " + (g.jahre[g.jahre.length - 1] - g.jahre[0]) + " J: Varianz der Epoche je Jahr " + g.jahre.map((J, i) => J + ":" + g.varJe[i]).join(" ") + " (" + g.folge.join(" < ") + "; Jahre der Pläne " + g.spanne.join("–") + ") · " + g.msJe + " ms je Geschichte",
                    taeter: "fachwerk-core.js exportSettlement im Wachstum (`_ortDp`): die Epoche des Plans folgt dem Jahr allein (eine Kalendertafel, Varianz " + g.varianz + ") oder das Jahr des Plans springt rückwärts (" + g.brueche + " Brüche); " + g.n + " von 100 Saaten in der Frist",
                })
            );
            await K.schritt(3, async () => K.leser(3, { n: g.orteMitAkten, fehlt: "keine Kette: die Akte eines Orts trägt Zeit und Art ({t, type}), kein Glied, keinen Vorgänger, keine Antwort auf „Warum?“ (" + g.orteMitAkten + " von " + g.orte + " Orten mit Akten, " + g.akten + " Akten)", wo: "stamm/siedlung-bewohner.js:2169" }));
            await K.schritt(4, async () => K.leser(4, { n: g.n, fehlt: "keine Kette über die Saaten: " + g.verlaeufe + " verschiedene Verläufe der Epoche unter " + g.n + " Saaten, kein Glied mit Vorgänger, kein Weg, den die Erde nie ging", wo: "stamm/siedlung-bewohner.js:2169" }));
            await K.schritt(5, async () => K.leser(5, { fehlt: "keine Zeitreise: das Gedächtnis des Wachstums überschreibt seinen Stand (wachs = {jahr, kraft, uhr}), kein Stand der Vergangenheit ist anspringbar, keine Gabelung", wo: "stamm/siedlung-ort.js:2899" }));
            await K.schritt(6, async () => K.nicht(6, { n: 0, fehlt: "eine Welt, keine Kette über 10⁶ J: die Chronik eines Orts reicht " + g.chronikJ + " Jahre" }));
        },
        seite: {
            GESCHICHTE: async (r, T, arg) => {
                const AR = r.constructor;
                const ep = AR.Gesetz("fachwerk:epocheImJahr");
                const E = ep(arg.gruendung);
                const t0 = performance.now();
                const bis = t0 + arg.fristMs;
                const je = arg.jahre.map(() => []);
                const verlauf = new Set();
                const frueh = new Map(); // je Epoche das früheste Jahr eines Plans: ihre Folge in der Zeit
                let [n, brueche, lo, hi, chronikJ] = [0, 0, Infinity, -Infinity, 0];
                for (let seed = 1; seed <= arg.saaten && performance.now() < bis; seed++) {
                    const ps = [];
                    for (const J of arg.jahre) {
                        const p = await r._foundryRequestSettlement({ seed, nH: arg.nH, epoche: E, jahr: J });
                        if (!p) return { fehler: "die Foundry ist kalt: export-settlement null (Same " + seed + ")" };
                        ps.push(p);
                    }
                    const es = ps.map((p) => ep(p.jahr));
                    es.forEach((e, i) => (je[i].push(e), frueh.set(e, Math.min(frueh.has(e) ? frueh.get(e) : Infinity, ps[i].jahr))));
                    for (let i = 1; i < ps.length; i++) if (ps[i].jahr < ps[i - 1].jahr) brueche++;
                    for (const p of ps) (lo = Math.min(lo, p.jahr)), (hi = Math.max(hi, p.jahr));
                    verlauf.add(es.join(">"));
                    if (seed === 1 && ps[0].chronik) chronikJ = ps[0].chronik.ende - ps[0].chronik.gr0;
                    n++;
                }
                const folge = [...frueh.entries()].sort((a, b) => a[1] - b[1]).map((q) => q[0]);
                const varJe = je.map((a) => {
                    const v = a.map((e) => folge.indexOf(e));
                    const m = v.reduce((s, x) => s + x, 0) / Math.max(1, v.length);
                    return v.length ? +(v.reduce((s, x) => s + (x - m) * (x - m), 0) / v.length).toFixed(4) : 0;
                });
                const cells = (r.state.worldMeta && r.state.worldMeta.settlementCells) || {};
                let [orte, orteMitAkten, akten] = [0, 0, 0];
                for (const k in cells) {
                    orte++;
                    const a = (cells[k] && cells[k].akten) || [];
                    if (a.length) (orteMitAkten++, (akten += a.length));
                }
                return {
                    n,
                    jahre: arg.jahre,
                    varianz: Math.max(...varJe),
                    varJe,
                    folge,
                    brueche,
                    spanne: [lo, hi],
                    verlaeufe: verlauf.size,
                    msJe: n ? Math.round((performance.now() - t0) / n) : null,
                    orte,
                    orteMitAkten,
                    akten,
                    chronikJ,
                };
            },
        },
        bestehend: { 1: "karte2.mensch.zeit.kausal#1" },
        sprossen: {
            2: {
                umfang: { soll: 100, wort: "Saaten mit Geschichte über 10³ J" },
                masse: [
                    { key: "varianz", wort: "Varianz der Epoche über die Saaten (größte je Jahr)", soll: 0, richtung: ">" },
                    { key: "brueche", wort: "Ordnungsbrüche", soll: 0, richtung: "≤" },
                ],
            },
            3: {
                umfang: { soll: 100, wort: "Orte mit Kette" },
                masse: [
                    { key: "kette5", wort: "Kette ≥ 5 Glieder bis zum Samen (Anteil)", soll: 0.95, richtung: "≥" },
                    { key: "ohneUrsache", wort: "Brüche ohne Ursache (Anteil)", soll: 0.05, richtung: "≤" },
                ],
                erwartet: "leser",
                fehlt: "keine Kette: die Akte eines Orts trägt Zeit und Art, kein Glied, keinen Vorgänger",
                wo: "stamm/siedlung-bewohner.js:2169",
            },
            4: {
                umfang: { soll: 10000, wort: "Saaten mit alternativer Geschichte" },
                masse: [
                    { key: "lueckenlos", wort: "Kette lückenlos", soll: 0.9, richtung: "≥" },
                    { key: "verschieden", wort: "Verläufe paarweise verschieden", soll: 0.9, richtung: "≥" },
                    { key: "ohneErde", wort: "ohne Erd-Vorbild", soll: 0.3, richtung: "≥" },
                ],
                erwartet: "leser",
                fehlt: "keine Kette über die Saaten: kein Glied mit Vorgänger",
                wo: "stamm/siedlung-bewohner.js:2169",
            },
            5: {
                umfang: null,
                masse: [
                    { key: "anders", wort: "Bildpaar nach dem Eingriff anders (1 = ja)", soll: 1, richtung: "≥" },
                    { key: "gleich", wort: "ohne Eingriff byte-gleich (1 = ja)", soll: 1, richtung: "≥" },
                ],
                erwartet: "leser",
                fehlt: "keine Zeitreise: kein Stand der Vergangenheit ist anspringbar, keine Gabelung",
                wo: "stamm/siedlung-ort.js:2899",
            },
            6: {
                umfang: { soll: 1000, wort: "Stichproben über viele Planeten, je EINE Kette über 10⁶ J" },
                masse: [
                    { key: "lueckenlos", wort: "Kette lückenlos", soll: 1, richtung: "≥" },
                    { key: "gegenlauf", wort: "Gegenlauf: Glied entfernt → die Folge bleibt aus", soll: 0.95, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "eine Welt, keine Kette über 10⁶ J",
            },
        },
        proben: {
            2: [
                {
                    name: "die Kalendertafel (der Stand der Welt): jede Saat dieselbe Epoche im selben Jahr",
                    j: { leiter: "mensch.zeit.kausal", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 2: { art: "zahl", n: 100, werte: { varianz: 0, brueche: 0 } } } },
                    gruen: false,
                    zahl: /ROT an Varianz der Epoche über die Saaten \(größte je Jahr\) 0 verfehlt > 0/,
                },
            ],
        },
    }),

    // ───────────────────────── mensch.zeit.erleben — Geschichte erleben ─────────────────────────
    // EINE Messung: der Brand im Feld am Dorf (`_brandEntfachen` an einer trockenen Gras-Zelle neben Bewohnern, der Takt der Welt
    // brennt ihn und bewegt die Bewohner) — wer flieht, wie weit, ob ein Haus brennt —, dazu die Ereignisarten, die die Welt trägt
    // (der Brand, die Akten der Orte) und die Perspektiven, die der Spieler nehmen kann.
    F.leiter("mensch.zeit.erleben", {
        sek: 45,
        mutiert: true,
        pfad: ["stamm/feld-brand.js", "stamm/siedlung-bewohner.js", "stamm/dirigent-takt.js", "stamm/siedlung-ort.js"],
        messe: async (H, K) => {
            await K.messort("dorf");
            const w = await K.welt("return await (" + H.seite.BRAND + ")(r, T, " + JSON.stringify({ fensterS: 10 }) + ");", 40000);
            if (!w || w.fehler) throw new Error("der Brand am Dorf: " + ((w && w.fehler) || "ohne Antwort"));
            H.zeile("Brand: " + JSON.stringify(w));
            await K.schritt(3, async () => K.nicht(3, { n: w.arten.length, fehlt: "die Welt trägt " + w.arten.length + " Ereignisarten (" + w.arten.join(", ") + "), keine Flut, keine Belagerung, kein Beben" }));
            await K.schritt(4, async () => K.leser(4, { n: w.akten, fehlt: "kein Ereignis ist anspringbar: die Akte trägt Zeit und Art ({t, type}), nur die letzten 16 (WACHSTUM.aktenMax), kein Stand des Tags, auf den man springt", wo: "stamm/siedlung-bewohner.js:2169" }));
            await K.schritt(5, async () => K.nicht(5, { n: w.perspektiven, fehlt: "eine Perspektive: der Spieler (Ego/Third), kein Bürger, Soldat, Herrscher oder Tier, dessen Blick derselben Stunde man nimmt" }));
            await K.schritt(6, async () => K.nicht(6, { n: 0, fehlt: "kein Ereignis einer realen Zivilisation: die Welt trägt " + w.arten.join(", ") + ", kein Pompeji, keine Landung" }));
            await K.schritt(2, async () => {
                const b = await K.bild(2, w.pose);
                K.auge(2, {
                    bild: b.datei,
                    pose: "dorf: 22 m hinter dem Herd " + w.herd.join("/") + " (von der Dorfmitte aus), 8 m hoch, Blick über den Brand zum Dorf",
                    mass: w.brennt + " Zellen brennen nach " + w.uhr + " s; von " + w.nah + " Bewohnern binnen 30 m fliehen " + w.fliehen + " (≥ 5 m weiter vom Herd), " + w.naeher + " gehen näher; Häuser binnen 15 m des Brands " + w.haeuserNah,
                });
            });
        },
        seite: {
            BRAND: async (r, T, arg) => {
                const AR = r.constructor;
                const st = r.state;
                const pm = st.playerMesh.position;
                if (window.__wetterSetzen("sunny") !== "sunny") return { fehler: "das Wetter der Probe gilt nicht: sunny (es gilt " + st.weather + ")" };
                r._naesseTakt(1e6);
                const cs = AR.LIFE_FIELD.cell;
                const draussen = [];
                for (const S of (r._bewohnerSiedlungen || new Map()).values()) for (const b of S.liste || []) if (b.leib && !b.drinnen && Math.hypot(b.leib.position.x - pm.x, b.leib.position.z - pm.z) < 120) draussen.push(b);
                if (!draussen.length) return { fehler: "kein Bewohner draußen binnen 120 m vom Dorf-Platz" };
                const [mx, mz] = [draussen.reduce((s, b) => s + b.leib.position.x, 0) / draussen.length, draussen.reduce((s, b) => s + b.leib.position.z, 0) / draussen.length];
                const [ccx, ccz] = [Math.floor(mx / cs), Math.floor(mz / cs)];
                const nahAn = (x, z, R) => draussen.filter((b) => Math.hypot(b.leib.position.x - x, b.leib.position.z - z) < R);
                let herd = null;
                for (let d = 1; d <= 10 && !herd; d++)
                    for (let i = -d; i <= d && !herd; i++)
                        for (const [cx, cz] of [[ccx + i, ccz - d], [ccx + i, ccz + d], [ccx - d, ccz + i], [ccx + d, ccz + i]]) {
                            const f = r._brandStoff(cx, cz);
                            const [x, z] = [(cx + 0.5) * cs, (cz + 0.5) * cs];
                            if (f && f.zeile && f.zeile.name === "gras" && r._brandFeuchte(f.boden) < f.zeile.brenn.mx && !r._nassAt(x, z) && nahAn(x, z, 30).length) {
                                herd = [x, z];
                                break;
                            }
                        }
                if (!herd) return { fehler: "keine trockene Gras-Zelle mit Bewohnern binnen 30 m (10 Zellen um das Dorf, Zelle " + cs + " m)" };
                const nah = nahAn(herd[0], herd[1], 30);
                const vor = new Map(nah.map((b) => [b, Math.hypot(b.leib.position.x - herd[0], b.leib.position.z - herd[1])]));
                if (!r._brandEntfachen(herd[0], herd[1])) return { fehler: "der Herd fing nicht Feuer (" + herd.map(Math.round).join("/") + ")" };
                const [t0, w0] = [st.spielZeit, performance.now()];
                while (st.spielZeit - t0 < arg.fensterS && performance.now() - w0 < arg.fensterS * 3000) await window.__werkTakt();
                const brennt = [...(st.brandFeld || new Map()).values()].filter((q) => q.t0 !== null).length;
                let [fliehen, naeher] = [0, 0];
                for (const b of nah) {
                    if (!b.leib) continue;
                    const dn = Math.hypot(b.leib.position.x - herd[0], b.leib.position.z - herd[1]);
                    if (dn >= vor.get(b) + 5) fliehen++;
                    if (dn <= vor.get(b) - 2) naeher++;
                }
                const haeuserNah = (st.architectures || []).filter((e) => e && typeof e.type === "string" && e.type.indexOf("haus_") === 0 && Math.hypot(e.position.x - herd[0], e.position.z - herd[1]) < 15).length;
                const cells = (st.worldMeta && st.worldMeta.settlementCells) || {};
                const arten = new Set();
                let akten = 0;
                for (const k in cells) for (const a of (cells[k] && cells[k].akten) || []) (arten.add(a.type), akten++);
                if (brennt > 0) arten.add("brand");
                const [dx, dz] = [herd[0] - mx, herd[1] - mz];
                const l = Math.hypot(dx, dz) || 1;
                const [kx, kz] = [herd[0] + (dx / l) * 22, herd[1] + (dz / l) * 22];
                const ky = r.getTerrainHeightAt(kx, kz);
                const ly = r.getTerrainHeightAt((herd[0] + mx) / 2, (herd[1] + mz) / 2);
                return {
                    herd: herd.map((v) => +v.toFixed(1)),
                    brennt,
                    uhr: +(st.spielZeit - t0).toFixed(1),
                    nah: nah.length,
                    fliehen,
                    naeher,
                    haeuserNah,
                    arten: [...arten],
                    akten,
                    perspektiven: st.player ? 1 : 0,
                    pose: { px: +kx.toFixed(2), py: +(ky + 8).toFixed(2), pz: +kz.toFixed(2), lx: +((herd[0] + mx) / 2).toFixed(2), ly: +(ly + 1).toFixed(2), lz: +((herd[1] + mz) / 2).toFixed(2) },
                };
            },
        },
        bestehend: { 1: "karte2.mensch.zeit.erleben#1" },
        sprossen: {
            2: {
                auge: {
                    pose: "dorf: 22 m hinter dem Herd (von der Dorfmitte aus), 8 m hoch, Blick über den Brand zum Dorf",
                    vorbild: "Fluchtwege bei Orts- und Flächenbränden (Berichte und Karten großer Stadtbrände, Lübeck 1251, Hamburg 1842): wer flieht wohin, das Feuer nach Bauart und Wind",
                },
            },
            3: {
                umfang: { soll: 10, wort: "Ereignisarten" },
                masse: [
                    { key: "verschieden", wort: "Abläufe paarweise verschieden (100 Saaten je Art)", soll: 0.9, richtung: "≥" },
                    { key: "faktor2", wort: "Phasen im Faktor 2 gegen reale Ereignisse der Art", soll: 0.85, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "die Welt trägt den Brand im Feld und die Gewalt als Akte, keine Flut, keine Belagerung",
            },
            4: {
                umfang: { soll: 100, wort: "Ereignisse einer Kette" },
                masse: [{ key: "anspringbar", wort: "anspringbar und sichtbar", soll: 0.95, richtung: "≥" }],
                erwartet: "leser",
                fehlt: "kein Ereignis ist anspringbar: die Akte trägt Zeit und Art, kein Stand des Tags",
                wo: "stamm/siedlung-bewohner.js:2169",
            },
            5: {
                umfang: { soll: 5, wort: "Perspektiven derselben Stunde (Bürger, Soldat, Herrscher, Tier)" },
                masse: [{ key: "gleichOrt", wort: "jedes Ereignis in allen fünf Bildfolgen am selben Ort zur selben Zeit (±1 s, ±1 m)", soll: 1, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "eine Perspektive: der Spieler",
            },
            6: {
                auge: { pose: "dorf: der Platz", vorbild: "Referenz-Inszenierungen realer Ereignisse (Pompeji 79, die erste Mondlandung 1969)" },
                erwartet: "nicht",
                fehlt: "kein Ereignis einer realen Zivilisation",
            },
        },
        proben: {
            2: [
                {
                    name: "die Abnahme speicherte kein Bild (das Bild fehlt im Lauf)",
                    j: { leiter: "mensch.zeit.erleben", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 2: { art: "auge", bild: "", pose: "Probe", vorbild: "Probe" } } },
                    gruen: false,
                    zahl: /keine Messung der Sprosse$/,
                },
            ],
            3: [
                {
                    name: "zwei Ereignisarten mit Abläufen im Soll (der Umfang fehlt)",
                    j: { leiter: "mensch.zeit.erleben", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 3: { art: "zahl", n: 2, werte: { verschieden: 1, faktor2: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Umfang 2 < 10 Ereignisarten/,
                },
            ],
        },
    }),

    // ───────────────────────── mensch.zeit.erde — Orte und Zeiten der echten Menschheit ─────────────────────────
    // EINE Messung: der Ort, den die Welt an Jahr und Same eines realen Vorbilds stellt (der Akt mit Jahr: die Epoche aus dem Jahr), und
    // ob er einen Schlüssel der Erde trägt (ein Ort, ein Befund, ein Vorbild im Plan oder im Gedächtnis der Welt).
    F.leiter("mensch.zeit.erde", {
        sek: 30,
        pfad: ["stamm/siedlung-ort.js", "fachwerk-core.js"],
        messe: async (H, K) => {
            await K.messort("wiese");
            const refs = [
                { ort: "Augusta Raurica", jahr: 100 },
                { ort: "Köln", jahr: 1300 },
                { ort: "Wien", jahr: 1860 },
            ];
            const w = await K.welt("return await (" + H.seite.ERDE + ")(r, T, " + JSON.stringify({ refs, seed: 7 }) + ");", 30000);
            if (!w || w.fehler) throw new Error("die Erde: " + ((w && w.fehler) || "ohne Antwort"));
            H.zeile("Erde: " + JSON.stringify(w));
            const ist = w.orte.map((q) => q.ref + " " + q.jahr + " → „" + q.name + "“ (" + q.region + ", " + q.epoche + ", " + q.kulturen.join("/") + ")").join(" · ");
            const kein = "kein Schlüssel der Erde: " + ist;
            const auge = async (n, was) => {
                if (w.erde < 1) return K.nicht(n, { n: w.erde, fehlt: kein + " — " + was });
                const b = await K.bild(n, w.pose);
                return K.auge(n, { bild: b.datei, pose: "wiese", mass: w.erde + " Orte der Erde" });
            };
            // S1 AM GESETZ (der Fächer, stationen/faecher.js): je Ort der Erde mit seinem Jahr (Augusta Raurica 100 · Köln 1300 · Wien 1860)
            // und 2 Saaten der Plan, den der Satz mit Jahr bestellt (ORT_AN: `epocheImJahr` → exportSettlement) — trägt er einen Schlüssel
            // der Erde (ein Feld des Orts, Befund, Vorbild), die Region des Orts, die Kultur seines Befunds? Der Auftrag des Satzes trägt
            // seed · nH · epoche · budget · kachel (stamm/siedlung-ort.js:1247), keinen Ort der Erde
            await K.schritt(1, async () => {
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.ORT_AN, export: "fachwerk-core.js:4961 epocheImJahr → :11165 exportSettlement (dp: seed · nH · epoche — kein Ort der Erde)", leser: "stamm/siedlung-ort.js:1227" },
                    adressen: {
                        saaten: [7, 1],
                        orte: [
                            { name: "Augusta Raurica", jahr: 100, region: "antik", kultur: "roemisch" },
                            { name: "Köln", jahr: 1300, region: "mitteleuropa" },
                            { name: "Wien", jahr: 1860, region: "mitteleuropa" },
                        ],
                    },
                    mit: { nH: 36 },
                    masse: {
                        adressen: { wie: "anzahl" },
                        erde: { wie: (v, aus) => aus.filter((x) => x.w.erde).length },
                        region: { wie: (v, aus) => aus.filter((x) => x.w.region === x.a.ort.region).length },
                        roemisch: { wie: (v, aus) => { const A = aus.filter((x) => x.a.ort.kultur); const n = A.reduce((q, x) => q + x.w.haeuser, 0); return n ? +(A.reduce((q, x) => q + (x.w.kulturen[x.a.ort.kultur] || 0), 0) / n).toFixed(3) : null; } },
                        je: { wie: (v, aus) => [...new Set(aus.filter((x) => x.a.saat === 7).map((x) => x.a.ort.name + " " + x.a.ort.jahr + " → „" + x.w.name + "“ (" + x.w.region + ", " + x.w.epoche + ", Plan " + x.w.jahr + ")"))] },
                        felder: { wie: "erste", feld: "felder" },
                    },
                    ungemessen: ["die Straßenachsen gegen den archäologischen Plan und das Fach-Panel 2AFC: ohne Schlüssel der Erde kein Plan zu decken, ungemessen bis zum Gerät"],
                    ms: Math.max(3000, Math.min(8000, Math.floor((H.rest() - 10) * 1000))),
                });
                const v = R.werte;
                H.zeile("Erde S1: " + R.akte.slice(0, 500) + " · " + JSON.stringify(v.je));
                if (R.fehlt && !R.gemessen) return K.leser(1, { fehlt: "der Plan des Jahrs: " + R.fehlt, wo: "stamm/siedlung-ort.js:1227" });
                if (!R.gemessen) throw new Error("der Fächer der Erde maß keine Adresse (" + R.akte.slice(0, 200) + ")");
                if (v.erde < 1)
                    return K.nicht(1, {
                        n: v.erde,
                        fehlt: "kein Schlüssel der Erde: der Auftrag trägt seed · nH · epoche (stamm/siedlung-ort.js:1247), der Plan kein Feld eines Orts — am Fächer " + R.gemessen + " Adressen römische Häuser um 100 " + Math.round((v.roemisch || 0) * 100) + " %, Region der Erde " + v.region + "/" + R.gemessen + ": " + v.je.join(" · "),
                    });
                return auge(1, "der Schlüssel steht im Plan: die Straßenachsen gegen den Befund");
            });
            await K.schritt(2, async () => K.nicht(2, { n: w.erde, fehlt: kein + " — keine 10 Orte × 3 Epochen" }));
            await K.schritt(3, () => auge(3, "keine Stadt, die wächst, brennt und überbaut wird, wie sie es tat"));
            await K.schritt(4, async () => K.nicht(4, { n: w.erde, fehlt: kein + " — keine bewohnte Erde je Jahrhundert, kein Bevölkerungsraster, keine Reichsgrenze" }));
            await K.schritt(5, () => auge(5, "kein Alltag, keine Tracht, keine Sprache eines realen Orts"));
            await K.schritt(6, () => auge(6, "keine eigene Stadt im Jahr der Großeltern"));
        },
        seite: {
            FAECHER,
            ORT_AN,
            ERDE: async (r, T, arg) => {
                const AR = r.constructor;
                const ep = AR.Gesetz("fachwerk:epocheImJahr");
                const orte = [];
                let erde = 0;
                for (const q of arg.refs) {
                    const p = await r._foundryRequestSettlement({ seed: arg.seed, epoche: ep(q.jahr) });
                    if (!p) return { fehler: "die Foundry ist kalt: export-settlement null (" + q.ort + ")" };
                    if (p.erde || p.befund || p.vorbild) erde++;
                    orte.push({ ref: q.ort, jahr: q.jahr, epoche: ep(q.jahr), name: p.name, region: p.region, kulturen: [...new Set(p.slots.map((s) => s.kultur))] });
                }
                const wm = r.state.worldMeta || {};
                if (wm.erde || wm.erdSchluessel) erde++;
                const pm = r.state.playerMesh.position;
                const y = r.getTerrainHeightAt(pm.x, pm.z);
                return { orte, erde, pose: { px: +pm.x.toFixed(2), py: +(y + 30).toFixed(2), pz: +(pm.z + 40).toFixed(2), lx: +pm.x.toFixed(2), ly: +y.toFixed(2), lz: +pm.z.toFixed(2) } };
            },
        },
        sprossen: {
            1: {
                auge: { pose: "wiese: die Stadt des Jahres 100", vorbild: "Augusta Raurica um 100 (archäologischer Gesamtplan und wissenschaftliche Rekonstruktion, Augst)" },
                erwartet: "nicht",
                fehlt: "kein Schlüssel der Erde: der Auftrag trägt seed · nH · epoche, das Jahr 100 gibt die Epoche mittelalter, keine römische Stadt nach dem Befund",
            },
            2: {
                umfang: { soll: 30, wort: "Orte der Erde × Epochen (10 × 3)", herkunft: "„10 Orte × 3 Epochen“ des Umfangs ausmultipliziert: 30 Paare (Ort, Epoche)" },
                masse: [
                    { key: "deckung", wort: "Plan-Deckung je Ort", soll: 0.7, richtung: "≥" },
                    { key: "einwohnerFehler", wort: "Einwohner gegen die Schätzung der Forschung (rel. Fehler, ± 30 %)", soll: 0.3, richtung: "≤" },
                ],
                erwartet: "nicht",
                fehlt: "kein Schlüssel der Erde: keine 10 Orte × 3 Epochen",
            },
            3: {
                auge: { pose: "wiese: die Stadt je Zeitschnitt", vorbild: "historische Atlanten: Stadtumrisse je Zeitschnitt (Köln 50/1000/1500/1900)" },
                erwartet: "nicht",
                fehlt: "kein Schlüssel der Erde: keine Stadt, die wächst, brennt und überbaut wird, wie sie es tat",
            },
            4: {
                umfang: { soll: 51, wort: "Jahrhunderte der bewohnten Erde seit −3000", herkunft: "„jedes Jahrhundert seit −3000“ bis 2000: (2000 − (−3000)) / 100 + 1 = 51 Jahrhunderte" },
                masse: [
                    { key: "hyde", wort: "Bevölkerungsraster gegen HYDE Rang-r", soll: 0.7, richtung: "≥" },
                    { key: "iou", wort: "Reichsgrenzen gegen Seshat IoU", soll: 0.5, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "kein Schlüssel der Erde: keine bewohnte Erde je Jahrhundert",
            },
            5: {
                auge: { pose: "wiese: der Ort des Jahres", vorbild: "datierte Bildquellen der Schriftzeit je Ort und Jahr (2AFC, Fach-Panel)" },
                erwartet: "nicht",
                fehlt: "kein Schlüssel der Erde: kein Alltag eines realen Orts",
            },
            6: {
                auge: { pose: "wiese: der Heimatort um 1950", vorbild: "alte Fotos der Heimatorte um 1950 (100 Menschen, 2AFC)" },
                erwartet: "nicht",
                fehlt: "kein Schlüssel der Erde: keine eigene Stadt im Jahr der Großeltern",
            },
        },
        proben: {
            1: [
                {
                    name: "Augusta Raurica 100 wird ein Dorf des Mittelalters (kein Schlüssel der Erde) — ROT am Gesetz",
                    j: { leiter: "mensch.zeit.erde", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 1: { art: "nicht", n: 0, fehlt: "kein Schlüssel der Erde: der Auftrag trägt seed · nH · epoche" } } },
                    gruen: false,
                    zahl: /ROT: Umfang nicht erzeugbar: kein Schlüssel der Erde: der Auftrag trägt seed · nH · epoche \(gemessen 0\)/,
                },
            ],
            2: [
                {
                    name: "die Attrappe: Plan und Einwohner im Soll an keinem Ort der Erde",
                    j: { leiter: "mensch.zeit.erde", adapter: "[linse-gpu] amd/rdna-3 (Probe)", sprossen: { 2: { art: "zahl", n: 0, werte: { deckung: 0.8, einwohnerFehler: 0.1 } } } },
                    gruen: false,
                    zahl: /ROT an Umfang 0 < 30 Orte der Erde/,
                },
            ],
        },
    }),
];
