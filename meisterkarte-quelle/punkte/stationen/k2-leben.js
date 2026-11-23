// stationen/k2-leben.js — DIE LEITER-RICHTER DES KAPITELS leben der Meisterkarte 2 (33 Leitern, 223 Sprossen; 18.11., Zweig
// richter-planet-leben-zusammenspiel). Der Kern ist der von k2-planet.js (EIN Kern, kein Zwilling).
"use strict";
const K = require("./k2-planet.js").kern;
const L = K.kapitel("leben");

// ── DIE PERSPEKTIVE leben.pflanzen (6 Leitern, 37 Sprossen; belegt: kraft S1 vegetation.K2#1, jahreslauf S1 vegetation.K5#2) ────────
// Die Leser des Spiels: der BESTAND am Spieler (r.state.architectures — die Wald-Darts mit `_lodSpecies`/`_lodVariantIndex` — und die
// Streu `r.state.scatterRegions` je Zelle mit species/variantIndex), der WALD-FADEN (`r._voxelWorkerWaldDarts` → voxel-worker waldDarts →
// phyto-core planForestCell/forestStehende: dieselbe Bestellung, die `_waldFadenSchicken` schickt — an fernen Zellen und fremden Saaten),
// der PLANET-FADEN (`r._planetAuftrag` planet-ort → delta.klima/wuchs, derselbe Weg wie die Reise), das EINE Jahr (`_saisonPraesenz`,
// `setSeason`/`_tickSeason` → uLaubPraesenz), der EINE Wind (`_windAt`, `_windWiegen`, das Wetter nur über `window.__wetterSetzen`), die
// Temperatur am Ort (`_temperaturFeld`), das Wasser (`_atlasWaterLevelAt`), die Höhe (`_terrainMacroSurfaceY`) und die Zeit der Prozesse
// (`state.spielZeit` → `_baumAlter`, synchron verschoben und im selben Zug zurückgestellt). Die Erd-Referenzen (Köppen, Ertragstafel,
// DWD-Phänologie, Taylor, Einstrahlung) sind das Vorbild der Station, nie eine Formel der Welt.
L.perspektive("pflanzen", (() => {
    const A_ID = "leben.pflanzen.arten";
    const B_ID = "leben.pflanzen.biome";
    const LL_ID = "leben.pflanzen.lebenslauf";
    const J_ID = "leben.pflanzen.jahreslauf";
    const D_ID = "leben.pflanzen.dichte";
    const KR_ID = "leben.pflanzen.kraft";
    const PFAD_WALD = ["stamm/vegetation-*.js", "phyto-core.js", "voxel-worker.js", "stamm/studio-bruecke.js", "scripts/werkbank.cjs"];
    const PFAD_PLANET = ["planet-core.js", "voxel-worker.js", "stamm/gelaende-chunks.js", "gelaende-core.js", "phyto-core.js", "stamm/vegetation-*.js", "scripts/werkbank.cjs"];
    // DER RICHTER OHNE ZAHL (lebenslauf S1, jahreslauf S4, dichte S1, kraft S3, S4): K.soll kann ihn nicht fassen (keine Zahl im Wort) —
    // das Soll steht wörtlich, sein Vergleich „gegen“ die Referenz hält NIE (kein GRÜN ohne Schwelle; das Blatt nennt es `unklar`),
    // die Sprosse urteilt über den Prüfer-Satz (R6/R11: ein Urteil ohne Maß ist das Blindpaar) und trägt darum ein Auge
    const ohneZahl = (id, nr, wort, key, einheit) => {
        const r = K.sprosseVon(id, nr).richter;
        if (!r.includes(wort)) throw new Error("Soll „" + wort + "“ steht nicht wörtlich im Richter " + id + " S" + nr);
        if (K.zahlenIn(r).length) throw new Error(id + " S" + nr + ": der Richter trägt eine Zahl — das Soll gehört K.soll");
        return { wort, key, rel: "gegen", a: "die Referenz (der Richter nennt keine Schwelle)", einheit: einheit || "" };
    };
    // DIE POTENZ DES WORTS („Chao1 ≥ 10⁵“): der Kern liest sie als 10 (kern.js:68 ZAHL_RE — die Alternative `\d+` greift „10“ vor
    // `10[⁰…⁹]+`); das Soll prüft K.soll wörtlich und trägt die Zahl, die das Wort nennt (10 hoch der Hochzahl hinter „10“)
    const hoch = (id, nr, wort, o) => {
        const s = K.soll(id, nr, wort, o);
        const m = /10([⁰¹²³⁴⁵⁶⁷⁸⁹]+)/.exec(wort);
        if (!m) throw new Error("Soll „" + wort + "“ " + id + " S" + nr + ": keine Potenz im Wort");
        return Object.assign({}, s, { a: Math.pow(10, Number([...m[1]].map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(c)).join(""))) });
    };

    // ── die Zeugen der Welt ──
    const zeugeArten = (minAntworten, minPflanzen) => (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "die Messung warf: " + z.fehler;
        if (!(z.antworten >= minAntworten)) return "nur " + (z.antworten || 0) + " Zellen beantwortete der Wald-Faden (Soll ≥ " + minAntworten + ")";
        if (!(z.arten >= 2)) return "die Welt trug " + (z.arten || 0) + " Art — keine Streuung, kein Bestand";
        if (!(z.individuen >= minPflanzen)) return "nur " + (z.individuen || 0) + " Pflanzen gezählt (Soll ≥ " + minPflanzen + ")";
        return null;
    };
    const zeugePlanet = (minAntworten) => (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "die Messung warf: " + z.fehler;
        if (!(z.antworten >= minAntworten)) return "nur " + (z.antworten || 0) + " Antworten des Planet-Fadens (Soll ≥ " + minAntworten + ")";
        if (!(z.landPunkte >= 20)) return "nur " + (z.landPunkte || 0) + " Land-Punkte";
        if (!(z.streuungWald > 0)) return "der Wuchs trägt keine Streuung über die Punkte (eine Konstante, nicht die Welt)";
        if (!z.version) return "keine Fassung des Planet-Kerns in der Antwort";
        return null;
    };
    const zeugeLokal = (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "die Messung warf: " + z.fehler;
        if (!(z.pflanzen >= 30)) return "nur " + (z.pflanzen || 0) + " Pflanzen im Bestand am Spieler";
        if (!(z.arten >= 2)) return "der Bestand trägt keine zwei Arten";
        if (!(z.uferArten >= 3)) return "nur " + (z.uferArten || 0) + " Uferarten im Bestand — keine Stichprobe";
        if (!(z.wasserPunkte >= 1)) return "der Leser des Wassers sah in ±2 km kein Wasser (Atlas und Fluss) — das Ufer ist ungemessen";
        if (!(z.gipfelZellen >= 1)) return "kein Gipfel über der Baumgrenze in ±4 km (das Bild am Gipfel ist nicht gestellt)";
        if (!(z.talDarts >= 1)) return "der Wald-Faden setzte auch im Tal keinen Baum — sein Schweigen am Gipfel beweist nichts";
        if (z.gipfelBaeume > 0) return z.gipfelBaeume + " Bäume über der Baumgrenze am Gipfel (das Bild ist nicht baumfrei)";
        return null;
    };
    const zeugeRegion = (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "die Messung warf: " + z.fehler;
        if (!(z.antworten >= 300)) return "nur " + (z.antworten || 0) + " Zellen des Wald-Fadens";
        if (!(z.haenge >= 50)) return "nur " + (z.haenge || 0) + " Hänge mit Stufen-Wechsel (Soll 50)";
        return null;
    };
    const zeugeZeit = (minJahre) => (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "die Messung warf: " + z.fehler;
        if (!(z.baeume >= 50)) return "nur " + (z.baeume || 0) + " Bäume im Bestand der Orte";
        if (!(z.jahre >= minJahre)) return "die Zeitreise spannte " + (z.jahre || 0) + " Jahre (Soll ≥ " + minJahre + ")";
        if (z.gleich === true) return "der Bestand blieb über " + z.jahre + " Jahre byte-gleich (die Uhr ändert die Welt nicht)";
        if (z.gleich !== false) return "keine Zeitreise in der Welt (vor ↔ nach ungemessen)";
        return null;
    };
    const zeugeJahr = (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "die Messung warf: " + z.fehler;
        if (!(z.wochen >= 52)) return "der Kalender trägt " + (z.wochen || 0) + " Wochen (Soll 52)";
        if (!(z.winterLaub < z.sommerLaub)) return "das Jahr der Welt änderte das Laub nicht (Winter " + z.winterLaub + " · Sommer " + z.sommerLaub + ")";
        if (!(z.arten >= 3)) return "nur " + (z.arten || 0) + " Laub-Arten im Bestand";
        return null;
    };
    const zeugeWind = (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "die Messung warf: " + z.fehler;
        if (!(z.proben >= 100)) return "nur " + (z.proben || 0) + " Proben des Winds";
        if (!(z.sturmStaerke > z.ruheStaerke)) return "das Wetter änderte den Wind nicht (Sturm " + z.sturmStaerke + " · Ruhe " + z.ruheStaerke + ")";
        if (!(z.streuung > 0)) return "der Wind trägt keine Streuung über die Zeit";
        if (z.zurueck !== true) return "das Wetter stand nach der Messung nicht zurück";
        return null;
    };
    const zeugeFrame = (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "die Messung warf: " + z.fehler;
        if (!(z.bilder >= 30)) return "nur " + (z.bilder || 0) + " Bilder der Welt gezählt";
        if (!(z.pflanzen >= 30)) return "nur " + (z.pflanzen || 0) + " Pflanzen im Bestand";
        return null;
    };
    const zeugeBestand = (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "die Messung warf: " + z.fehler;
        if (!(z.pflanzen >= 30)) return "nur " + (z.pflanzen || 0) + " Pflanzen im Bestand";
        if (!(z.fernsteM > 0)) return "keine Entfernung gemessen";
        return null;
    };

    const ART_Z = { antworten: 900, zellen: 1000, arten: 9, individuen: 640, saaten: 100 };
    const PLANET_Z = { antworten: 1000, landPunkte: 310, streuungWald: 0.41, version: "planet-h2-4" };

    return {
        leitern: {
            // ══ ARTEN: der Bestand am Spieler, Zufallsgänge des Wald-Fadens über ±20 km und über 100 fremde Saaten ══
            [A_ID]: {
                sek: 25,
                pfad: PFAD_WALD,
                ungefahren: "die Bilder der Blindtests (Gattung, Wuchsform, Herbar, Foto ↔ Spiel), die Arten im Bild per Blindbenennung (R11)",
                mess: async function (H, U, M) {
                    const seite = (fn, A) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(A || {}) + ");");
                    let w = null;
                    let fehler = null;
                    try {
                        w = await seite(async function (r, T, A) {
                            const st = r.state;
                            const p = st.playerMesh.position;
                            const cam = st.camera;
                            cam.updateMatrixWorld(true);
                            const fr = new T.Frustum().setFromProjectionMatrix(new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
                            const art = (t) => String(t || "").replace(/^grown_/, "").replace(/_v[0-9]+$/, "");
                            const pflanze = /^(baum_|busch_|farn_|blume_)/;
                            const je = {};
                            const gestalt = {};
                            const bild = {};
                            const ha = {};
                            const v = new T.Vector3();
                            let n = 0;
                            const nimm = (sp, g, x, y, z) => {
                                n++;
                                je[sp] = (je[sp] || 0) + 1;
                                gestalt[sp + ":" + g] = (gestalt[sp + ":" + g] || 0) + 1;
                                v.set(x, y + 2, z);
                                if (Math.hypot(x - p.x, z - p.z) <= A.bildM && fr.containsPoint(v)) bild[sp] = (bild[sp] || 0) + 1;
                                if (/^baum_/.test(sp)) {
                                    const k = Math.floor(x / 100) + "," + Math.floor(z / 100);
                                    (ha[k] = ha[k] || {})[sp] = 1;
                                }
                            };
                            for (const e of st.architectures) {
                                const sp = art(e._lodSpecies || e.type);
                                if (pflanze.test(sp)) nimm(sp, e._lodVariantIndex == null ? "?" : e._lodVariantIndex, e.position.x, e.position.y, e.position.z);
                            }
                            for (const reg of st.scatterRegions.values())
                                for (const c of reg.cells || []) {
                                    const sp = art(c.species);
                                    if ((c.layer === "tree" || c.layer === "under") && pflanze.test(sp))
                                        nimm(sp, c.variantIndex == null ? c.gestalt : c.variantIndex, c.x, c.fuss && Number.isFinite(c.fuss.y) ? c.fuss.y : p.y, c.z);
                                }
                            const wuchs = new Set(Object.keys(je).map((s) => s.split("_")[0]));
                            if (st.voxelChunkGrass && st.voxelChunkGrass.size) wuchs.add("gras");
                            const tafel = new Set(Object.keys(AnazhRealm.SPECIES_TREE_PARAMS || {}).concat(Object.values(AnazhRealm.SAAT_BUSCH || {})));
                            const fnv = (s) => {
                                let h = 2166136261 >>> 0;
                                for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
                                return h >>> 0;
                            };
                            const C = AnazhRealm.FOREST.cell;
                            const extras = r._forestExtraSpecies();
                            let antworten = 0;
                            let zellen = 0;
                            const gang = async (seedInt, nZ, R) => {
                                let h = (seedInt ^ 0x9e3779b9) >>> 0;
                                const q = () => {
                                    h = (h + 0x6d2b79f5) >>> 0;
                                    let t = h;
                                    t = Math.imul(t ^ (t >>> 15), t | 1);
                                    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                                    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
                                };
                                const z = [];
                                for (let i = 0; i < nZ; i++) z.push(Math.floor((p.x + (q() * 2 - 1) * R) / C), Math.floor((p.z + (q() * 2 - 1) * R) / C));
                                zellen += nZ;
                                const a = await r._voxelWorkerWaldDarts(new Int32Array(z), seedInt, extras, null, "probe-pflanzen-" + seedInt);
                                antworten += a.anzahl.length;
                                const cnt = {};
                                let j = 0;
                                for (let i = 0; i < a.anzahl.length; i++)
                                    for (let m = a.anzahl[i]; m > 0; m--, j += 13) {
                                        const sp = a.arten[a.werte[j + 2]];
                                        cnt[sp] = (cnt[sp] || 0) + 1;
                                    }
                                return { cnt, n: a.anzahl.length };
                            };
                            const wg = (await gang(r._forestSeedInt(), A.gangZellen, A.gangM)).cnt;
                            const saaten = [];
                            for (let i = 0; i < A.saaten; i += 10)
                                saaten.push(...(await Promise.all(Array.from({ length: Math.min(10, A.saaten - i) }, (_, k) => gang(fnv("pflanzen-saat-" + (i + k)), A.saatZellen, A.gangM)))));
                            let haMax = 0;
                            for (const k of Object.keys(ha)) haMax = Math.max(haMax, Object.keys(ha[k]).length);
                            return { n, je, gestalten: Object.keys(gestalt).length, bild, haMax, wuchs: [...wuchs], tafel: tafel.size, vps: AnazhRealm.VARIANTS_PER_SPECIES, wg, saaten: saaten.map((x) => x.cnt), saatAntw: saaten.filter((x) => x.n === A.saatZellen).length, antworten, zellen };
                        }, { bildM: 600, gangZellen: 200, gangM: 20000, saaten: 100, saatZellen: 8 });
                    } catch (e) {
                        fehler = String((e && e.message) || e).slice(0, 200);
                    }
                    const chao1 = (cnt) => {
                        const v = Object.values(cnt).filter((x) => x > 0);
                        const f1 = v.filter((x) => x === 1).length;
                        const f2 = v.filter((x) => x === 2).length;
                        return v.length + (f1 * (f1 - 1)) / (2 * (f2 + 1));
                    };
                    const plus = (a, b) => {
                        for (const k of Object.keys(b)) a[k] = (a[k] || 0) + b[k];
                        return a;
                    };
                    const aus = M.teil || {};
                    if (!w) {
                        for (const nr of Object.keys(U)) aus[nr] = { werte: {}, zeuge: { fehler } };
                        return { sprossen: aus };
                    }
                    const welt = plus(plus({}, w.je), w.wg);
                    const saatenZ = w.saaten.reduce((a, c) => plus(a, c), {});
                    const alle = plus(plus({}, welt), saatenZ);
                    const beantwortet = w.saatAntw;
                    const dartsWelt = Object.values(w.wg).reduce((s, x) => s + x, 0);
                    const zeuge = { antworten: w.antworten, zellen: w.zellen, arten: Object.keys(alle).length, individuen: w.n + dartsWelt, saaten: beantwortet };
                    const artenBestand = Object.keys(w.je).length;
                    const artenWelt = Object.keys(welt).length;
                    const artenSaaten = Object.keys(saatenZ).length;
                    const bildArten = Object.keys(w.bild).length;
                    const dup = w.n ? 100 * (1 - w.gestalten / w.n) : null;
                    const tafel = "die Arten stehen in EINER Tafel (" + w.tafel + " Zeilen: stamm/vegetation-baum.js SPECIES_TREE_PARAMS, phyto-core FOREST_SPECIES), je Art " + w.vps + " Gestalten";
                    const roh = {
                        1: { werte: { gestaltenImBestand: w.gestalten, artenImBestand: artenBestand }, ...(artenBestand < 10 ? { nicht: "der Bestand am Spieler trägt " + artenBestand + " Gestalten (Soll 10)" } : {}) },
                        2: { werte: { saaten: beantwortet, artenUeberSaaten: artenSaaten, wuchsformen: w.wuchs.length }, nicht: "über " + beantwortet + " Saaten trägt die Welt " + artenSaaten + " Arten (Soll 10²) in " + w.wuchs.length + " Wuchsformen (" + w.wuchs.join(", ") + ") — " + tafel },
                        3: { werte: { artenPlanet: artenWelt, artenImBild: bildArten }, nicht: "der Planet trägt " + artenWelt + " Arten (Soll 10³), das Bild zugleich " + bildArten + " (Soll ≥ 50) — " + tafel },
                        4: { werte: { artenPlanet: artenWelt, baumartenJeHektar: w.haMax }, nicht: artenWelt + " Arten (Soll 10⁴), ein Hektar trägt höchstens " + w.haMax + " Baumarten (Soll ~300)" },
                        5: { werte: { chao1: chao1(welt), angetroffen: zeuge.individuen }, nicht: "Chao1 " + chao1(welt).toFixed(1) + " über " + w.antworten + " Zellen der Zufallsgänge (±20 km) und den Bestand (Soll 10⁵); keine Gattung trägt Schwesterarten — " + tafel },
                        6: { werte: { chao1Planeten: chao1(saatenZ), saaten: beantwortet }, nicht: "Chao1 " + chao1(saatenZ).toFixed(1) + " über " + beantwortet + " Saaten (Soll 10⁶); eine Saat trägt EINEN Planeten, keine fremden Arten — " + tafel },
                        7: { werte: { chao1Alle: chao1(alle), saaten: beantwortet, duplikatProzent: dup }, nicht: "Chao1 " + chao1(alle).toFixed(1) + " über alles (Soll ≥ 10⁷); " + (dup == null ? "" : dup.toFixed(1) + " % der Pflanzen im Bestand sind Duplikate einer Gestalt; ") + "kein Leser sagt die Nische je Art aus Klima und Boden voraus — " + tafel },
                    };
                    for (const nr of Object.keys(U)) {
                        const x = roh[nr] || { werte: {} };
                        x.zeuge = zeuge;
                        if (U[nr].auge) x.auge = await M.auge("pflanzen-arten-s" + nr, U[nr].auge);
                        aus[nr] = x;
                    }
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(A_ID, 1, "Gattung ≥ 80 % richtig", { key: "gattungProzent", einheit: "%" }), K.soll(A_ID, 1, "Herbar-Bildpaar je Gestalt ≥ 0,7", { key: "herbar" })],
                        auge: { pose: "Ego am Waldrand der Mess-Wiese, 10 Bilder je Gestalt", vorbild: "Blindtest Gattung (≥ 80 %) und Herbarfoto je Gestalt (Bildpaar ≥ 0,7, R11)" },
                        taeter: "stamm/vegetation-baum.js SPECIES_TREE_PARAMS (die Gestalten von Hand)",
                        gruen: { werte: { gattungProzent: 86, herbar: 0.74, gestaltenImBestand: 30 }, zeuge: ART_Z },
                        attrappen: [{ name: "Blindtest-Zahlen ohne Bild", roh: { werte: { gattungProzent: 86, herbar: 0.74 }, zeuge: { antworten: 0 } } }],
                    },
                    2: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(A_ID, 2, "100 Saaten", { key: "saaten", rel: "≥", einheit: "Saaten" }), K.soll(A_ID, 2, "Silhouetten-Paare unterscheidbar ≥ 95 %", { key: "silhouettenProzent", einheit: "%" })],
                        auge: { pose: "je Saat eine Pflanze freigestellt vor neutralem Grund (Werkbank /bild)", vorbild: "Wuchsform-Blindtest (Baum, Strauch, Gras, Kletterer, Sukkulente, Farn, Moos) und Silhouetten-Paare ≥ 95 % (R11)" },
                        taeter: "phyto-core.js FOREST_SPECIES + stamm/vegetation-baum.js SPECIES_TREE_PARAMS (Tafel statt Merkmalsraum)",
                        nicht: "Arten aus einer Tafel, kein Merkmalsraum",
                        leser: "phyto-core.js:3299 FOREST_SPECIES / stamm/vegetation-baum.js:3205 SPECIES_TREE_PARAMS — kein Zug Saat → Art aus einem Merkmalsraum",
                        gruen: { werte: { saaten: 100, silhouettenProzent: 97, artenUeberSaaten: 140 }, zeuge: ART_Z },
                        attrappen: [{ name: "100 Saaten gezählt ohne Antwort des Fadens", roh: { werte: { saaten: 100, silhouettenProzent: 97 }, zeuge: { antworten: 0 } } }],
                    },
                    3: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(A_ID, 3, "Histogramm-Distanz Spiel ↔ Erde ≤ 0,2", { key: "histDistanz" })],
                        auge: { pose: "die artenreichste Szene des Bestands (heute die Mess-Wiese)", vorbild: "Merkmalsverteilung TRY (Díaz 2016) aus Bild-Morphometrie; Artenzahl im Bild per Blindbenennung (R11)" },
                        taeter: "phyto-core.js FOREST_SPECIES (Tafel statt Merkmalsraum)",
                        nicht: "10³ Arten, ≥ 50 zugleich im Bild",
                        leser: "phyto-core.js:2446 treeParams — kein Merkmalsraum (Höhe, Blattgröße, Holzdichte) je Art",
                        gruen: { werte: { histDistanz: 0.15, artenPlanet: 1200, artenImBild: 60 }, zeuge: ART_Z },
                        attrappen: [{ name: "Distanz 0,15 ohne Bestand", roh: { werte: { histDistanz: 0.15 }, zeuge: { antworten: 0 } } }],
                    },
                    4: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(A_ID, 4, "Trefferquote ≤ 60 %", { key: "trefferProzent", einheit: "%" })],
                        auge: { pose: "Regenwald-Hektar (heute nicht erzeugbar; geschossen an der Mess-Wiese)", vorbild: "200 Paare Foto ↔ Spiel, Trefferquote ≤ 60 % (R11)" },
                        taeter: "phyto-core.js FOREST_SPECIES (keine Tropen-Arten)",
                        nicht: "10⁴ Arten, ~300 Baumarten je Tropen-Hektar",
                        leser: "phyto-core.js:3631 planForestCell — kein Artenpool je Biom",
                        gruen: { werte: { trefferProzent: 55, artenPlanet: 12000, baumartenJeHektar: 290 }, zeuge: ART_Z },
                        attrappen: [{ name: "Trefferquote ohne Welt", roh: { werte: { trefferProzent: 55 }, zeuge: { antworten: 0 } } }],
                    },
                    5: {
                        u: {},
                        soll: [hoch(A_ID, 5, "Chao1 ≥ 10⁵", { key: "chao1" }), K.soll(A_ID, 5, "Schwesterarten trennbar ≥ 95 %", { key: "schwesterProzent", einheit: "%" })],
                        zeuge: zeugeArten(150, 100),
                        zeugeText: "Zufallsgänge des Wald-Fadens und der Bestand gezählt",
                        taeter: "phyto-core.js FOREST_SPECIES (Tafel statt Merkmalsraum)",
                        nicht: "10⁵ Arten je Planet",
                        leser: "phyto-core.js:3631 planForestCell — keine Art aus der Saat, keine Gattung mit Schwesterarten",
                        gruen: { werte: { chao1: 140000, schwesterProzent: 96 }, zeuge: ART_Z },
                        attrappen: [
                            { name: "Chao1 aus einer Liste ohne Gang", roh: { werte: { chao1: 140000, schwesterProzent: 96 }, zeuge: { antworten: 0, arten: 9, individuen: 640 } } },
                            { name: "eine Art in jedem Gang (keine Streuung)", roh: { werte: { chao1: 140000, schwesterProzent: 96 }, zeuge: { antworten: 900, arten: 1, individuen: 640 } } },
                        ],
                    },
                    6: {
                        u: { auge: { ort: "wiese" } },
                        soll: [hoch(A_ID, 6, "Chao1 ≥ 10⁶", { key: "chao1Planeten" }), K.soll(A_ID, 6, "paarweise unterscheidbar ≥ 95 %", { key: "paarProzent", einheit: "%" })],
                        auge: { pose: "500 fremde Arten am fremden Planeten (heute nicht erzeugbar; geschossen an der Mess-Wiese)", vorbild: "Fremdwelt-Probe (R10): Ursache, Gegenlauf, Neuheit" },
                        taeter: "phyto-core.js FOREST_SPECIES (keine fremden Arten)",
                        nicht: "10⁶ Arten über die Planeten einer Saat",
                        leser: "planet-core.js:307 planetPlan — eine Saat trägt einen Planeten; phyto-core.js — keine Art aus ihrer Welt",
                        gruen: { werte: { chao1Planeten: 1200000, paarProzent: 97 }, zeuge: ART_Z },
                        attrappen: [{ name: "Chao1 der Planeten ohne Saat", roh: { werte: { chao1Planeten: 1200000, paarProzent: 97 }, zeuge: { antworten: 0 } } }],
                    },
                    7: {
                        u: {},
                        soll: [
                            K.soll(A_ID, 7, "Zufallsgänge auf 1 000 Saaten", { key: "saaten", rel: "≥", einheit: "Saaten" }),
                            hoch(A_ID, 7, "über alle ≥ 10⁷", { key: "chao1Alle" }),
                            K.soll(A_ID, 7, "vorhergesagt ≥ 90 %", { key: "nischeProzent", einheit: "%" }),
                            K.soll(A_ID, 7, "Duplikate ≤ 1 %", { key: "duplikatProzent", einheit: "%" }),
                        ],
                        zeuge: zeugeArten(150, 100),
                        zeugeText: "Zufallsgänge über die Saaten und der Bestand gezählt",
                        taeter: "phyto-core.js FOREST_SPECIES (Tafel statt Merkmalsraum)",
                        nicht: "10⁷ Arten aus einem Samen",
                        leser: "phyto-core.js:3047 forestNische — sagt die Art des Orts, nie die Nische einer Art aus Klima und Boden",
                        gruen: { werte: { saaten: 1000, chao1Alle: 12000000, nischeProzent: 93, duplikatProzent: 0.4 }, zeuge: ART_Z },
                        attrappen: [
                            { name: "10⁷ aus einer Tafel ohne Gang", roh: { werte: { saaten: 1000, chao1Alle: 12000000, nischeProzent: 93, duplikatProzent: 0.4 }, zeuge: { antworten: 0, arten: 9, individuen: 640 } } },
                            { name: "ein leerer Bestand", roh: { werte: { saaten: 1000, chao1Alle: 12000000, nischeProzent: 93, duplikatProzent: 0.4 }, zeuge: { antworten: 900, arten: 9, individuen: 3 } } },
                        ],
                    },
                },
            },

            // ══ BIOME: Ufer, Wärme und Gipfel am Spieler; 50 Hänge des Wald-Fadens; Kontinent, Planet und 100 Saaten des Planet-Fadens ══
            [B_ID]: {
                sek: 30,
                pfad: PFAD_PLANET.concat(["stamm/bild-himmel.js", "stamm/wasser-hydro.js", "stamm/gelaende-boden.js"]),
                ungefahren: "das Bild am Gipfel und im Luftbild, das Orbitbild gegen das Satellitenmosaik, die Blindbewertung „lebendige Welt“",
                mess: async function (H, U, M) {
                    const seite = (fn, A) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(A || {}) + ");");
                    const aus = M.teil || {};
                    let lok = null;
                    let lokFehler = null;
                    try {
                        lok = await seite(async function (r, T, A) {
                            const st = r.state;
                            const p = st.playerMesh.position;
                            const art = (t) => String(t || "").replace(/^grown_/, "").replace(/_v[0-9]+$/, "");
                            const pflanze = /^(baum_|busch_|farn_|blume_)/;
                            const liste = [];
                            for (const e of st.architectures) {
                                const sp = art(e._lodSpecies || e.type);
                                if (pflanze.test(sp)) liste.push([sp, e.position.x, e.position.y, e.position.z]);
                            }
                            for (const reg of st.scatterRegions.values())
                                for (const c of reg.cells || []) {
                                    const sp = art(c.species);
                                    if ((c.layer === "tree" || c.layer === "under") && pflanze.test(sp)) liste.push([sp, c.x, c.fuss && Number.isFinite(c.fuss.y) ? c.fuss.y : r._terrainMacroSurfaceY(c.x, c.z, false), c.z]);
                                }
                            const ufer = new Set(A.ufer);
                            const waerme = new Set(A.waerme);
                            const tSommer = (y) => {
                                const f = r._temperaturFeld(y);
                                return f.mittel + f.jahr.amp - f.kuehlung;
                            };
                            const tWinter = (y) => {
                                const f = r._temperaturFeld(y);
                                return f.mittel - f.jahr.amp - f.kuehlung;
                            };
                            const wasserDa = (qx, qz, y) => {
                                const sy = r._terrainMacroSurfaceY(qx, qz, true);
                                const wl = r._atlasWaterLevelAt(qx, qz, Number.isFinite(sy) ? sy : y);
                                if (Number.isFinite(wl) && Number.isFinite(sy) && wl > sy) return true;
                                const rv = r._hydroRiverAt(qx, qz);
                                return !!(rv && rv.breite > 0);
                            };
                            const nass = (x, z, y) => {
                                for (const rad of [0, 5, 10, 15])
                                    for (let k = 0; k < (rad ? 8 : 1); k++) if (wasserDa(x + Math.cos((k * Math.PI) / 4) * rad, z + Math.sin((k * Math.PI) / 4) * rad, y)) return true;
                                return false;
                            };
                            let wasserPunkte = 0;
                            for (let i = -25; i <= 25; i++) for (let j = -25; j <= 25; j++) if (wasserDa(p.x + i * 80, p.z + j * 80, p.y)) wasserPunkte++;
                            const z = { pflanzen: liste.length, arten: new Set(liste.map((e) => e[0])).size, wasserPunkte, uferArten: 0, uferNass: 0, waermeArten: 0, waermeAussen: 0, waermeWinterMin: null };
                            for (const [sp, x, y, zz] of liste) {
                                if (ufer.has(sp)) {
                                    z.uferArten++;
                                    if (nass(x, zz, y)) z.uferNass++;
                                }
                                if (waerme.has(sp)) {
                                    z.waermeArten++;
                                    const tw = tWinter(y);
                                    if (tw < A.waermeWinterC) z.waermeAussen++;
                                    z.waermeWinterMin = z.waermeWinterMin == null ? tw : Math.min(z.waermeWinterMin, tw);
                                }
                            }
                            const C = AnazhRealm.FOREST.cell;
                            const seedInt = r._forestSeedInt();
                            const extras = r._forestExtraSpecies();
                            const raster = [];
                            for (let i = -20; i <= 20; i++) for (let j = -20; j <= 20; j++) raster.push([p.x + i * 200, p.z + j * 200, r._terrainMacroSurfaceY(p.x + i * 200, p.z + j * 200, false)]);
                            raster.sort((a, b) => b[2] - a[2]);
                            const gipfel = raster.slice(0, 20).filter((g) => tSommer(g[2]) < A.baumgrenzeC);
                            const tal = raster.filter((g) => g[2] > st.waterLevel + 1 && tSommer(g[2]) >= A.baumgrenzeC).slice(-20);
                            z.gipfelZellen = gipfel.length;
                            z.gipfelBaeume = 0;
                            z.talDarts = 0;
                            z.hoechsterM = raster[0][2];
                            z.baumgrenzeSommerC = tSommer(raster[0][2]);
                            const zl = [];
                            for (const g of gipfel.concat(tal)) for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) zl.push(Math.floor(g[0] / C) + i, Math.floor(g[1] / C) + j);
                            const a = await r._voxelWorkerWaldDarts(new Int32Array(zl), seedInt, extras, null, "probe-biome-gipfel-" + seedInt);
                            let jg = 0;
                            for (let i = 0; i < a.anzahl.length; i++)
                                for (let m = a.anzahl[i]; m > 0; m--, jg += 13) {
                                    if (i < gipfel.length * 9) {
                                        if (!Number.isFinite(a.werte[jg + 10]) || tSommer(a.werte[jg + 10]) < A.baumgrenzeC) z.gipfelBaeume++;
                                    } else z.talDarts++;
                                }
                            let h = (seedInt ^ 0x51ed270b) >>> 0;
                            const q = () => {
                                h = (h + 0x6d2b79f5) >>> 0;
                                let t = h;
                                t = Math.imul(t ^ (t >>> 15), t | 1);
                                t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
                            };
                            const tz = [];
                            const hY = (x, zz) => r._terrainMacroSurfaceY(x, zz, false);
                            for (let i = 0; i < A.transekte; i++) {
                                const x0 = p.x + (q() * 2 - 1) * A.regionM;
                                const z0 = p.z + (q() * 2 - 1) * A.regionM;
                                const wi = Math.atan2(hY(x0, z0 + 30) - hY(x0, z0 - 30), hY(x0 + 30, z0) - hY(x0 - 30, z0));
                                for (let k = 0; k < A.punkte; k++) tz.push(Math.floor((x0 + Math.cos(wi) * (k - A.punkte / 2) * A.schrittM) / C), Math.floor((z0 + Math.sin(wi) * (k - A.punkte / 2) * A.schrittM) / C));
                            }
                            const b = await r._voxelWorkerWaldDarts(new Int32Array(tz), seedInt, extras, null, "probe-biome-hang-" + seedInt);
                            const zellen = [];
                            let j = 0;
                            for (let i = 0; i < b.anzahl.length; i++) {
                                const sp = {};
                                let y = 0;
                                for (let m = b.anzahl[i]; m > 0; m--, j += 13) {
                                    const s = b.arten[b.werte[j + 2]];
                                    sp[s] = (sp[s] || 0) + 1;
                                    y += b.werte[j + 10];
                                }
                                zellen.push(b.anzahl[i] ? { sp, y: y / b.anzahl[i] } : null);
                            }
                            return { z, zellen, antworten: b.anzahl.length };
                        }, { ufer: ["baum_erle", "farn_busch"], waerme: ["baum_palme"], waermeWinterC: 2.2, baumgrenzeC: 10, transekte: 90, punkte: 12, schrittM: 80, regionM: 5000 });
                    } catch (e) {
                        lokFehler = String((e && e.message) || e).slice(0, 200);
                    }
                    let pl = null;
                    let plFehler = null;
                    try {
                        pl = await seite(async function (r, T, A) {
                            await r._fadenQuelle();
                            const kh = r._gelaende().ort.klimaHeute;
                            const grad = 180 / Math.PI;
                            const frage = (samen, P) => Promise.all(P.map((b) => r._planetAuftrag({ type: "planet-ort", samen, breite: b[0], laenge: b[1], zeitMa: 0 })));
                            const zeile = (x) => [x.land ? 1 : 0, kh.sommer + x.delta.klima.sommer, kh.spendeMm * x.delta.klima.spendeVerh, x.delta.wuchs.wald, x.delta.klima.sommerPhase];
                            let h = 0x2545f491;
                            const q = () => {
                                h = (h + 0x6d2b79f5) >>> 0;
                                let t = h;
                                t = Math.imul(t ^ (t >>> 15), t | 1);
                                t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
                            };
                            const kugel = (n) => Array.from({ length: n }, () => [Math.asin(2 * q() - 1) * grad, q() * 360 - 180]);
                            const anker = await r._planetAuftrag({ type: "planet-anker", samen: A.samen, zeitMa: 0 });
                            const ab = anker.breite * grad;
                            const al = anker.laenge * grad;
                            const kont = await frage(A.samen, Array.from({ length: A.kontinent }, () => [Math.max(-89, Math.min(89, ab + (q() * 2 - 1) * A.kontGrad)), al + ((q() * 2 - 1) * A.kontGrad) / Math.max(0.2, Math.cos(anker.breite))]));
                            const planet = await frage(A.samen, kugel(A.planet));
                            const saaten = [];
                            for (let i = 0; i < A.saaten; i += 10) {
                                const teil = await Promise.all(Array.from({ length: Math.min(10, A.saaten - i) }, (_, k) => frage("pflanzen-planet-" + (i + k), kugel(A.saatPunkte))));
                                saaten.push(...teil.map((t) => t.map(zeile)));
                            }
                            return { version: anker.version, kont: kont.map(zeile), planet: planet.map(zeile), saaten };
                        }, { samen: "anazh-realm-seed", kontinent: 300, kontGrad: 20, planet: 1000, saaten: 100, saatPunkte: 12 });
                    } catch (e) {
                        plFehler = String((e && e.message) || e).slice(0, 200);
                    }
                    const ref = (z) => (z[1] < 10 ? 0 : z[2] < 50 ? 0 : 1);
                    const spiel = (z) => (z[3] >= 0.5 ? 1 : 0);
                    const land = (L) => L.filter((z) => z[0] === 1);
                    const passt = (L) => (L.length ? (100 * L.filter((z) => ref(z) === spiel(z)).length) / L.length : null);
                    const kappa = (L) => {
                        const n = L.length;
                        if (!n) return null;
                        const a1 = L.filter((z) => spiel(z) === 1).length / n;
                        const b1 = L.filter((z) => ref(z) === 1).length / n;
                        const po = L.filter((z) => ref(z) === spiel(z)).length / n;
                        const pe = a1 * b1 + (1 - a1) * (1 - b1);
                        return pe >= 1 - 1e-9 ? null : (po - pe) / (1 - pe);
                    };
                    const streu = (L) => {
                        const v = L.map((z) => z[3]);
                        const m = v.reduce((s, x) => s + x, 0) / Math.max(1, v.length);
                        return Math.sqrt(v.reduce((s, x) => s + (x - m) * (x - m), 0) / Math.max(1, v.length));
                    };
                    let planetZ = { fehler: plFehler };
                    let kont = [];
                    let planet = [];
                    let jeSaat = [];
                    if (pl) {
                        kont = land(pl.kont);
                        planet = land(pl.planet);
                        jeSaat = pl.saaten.map(land);
                        const alle = pl.kont.length + pl.planet.length + pl.saaten.reduce((s, x) => s + x.length, 0);
                        planetZ = { antworten: alle, landPunkte: kont.length + planet.length, streuungWald: streu(kont.concat(planet)), version: pl.version };
                    }
                    let haenge = 0;
                    let richtig = 0;
                    let kanten = 0;
                    let wechsel = 0;
                    if (lok) {
                        const rang = { baum_eiche: 1, baum_buche: 1, baum_birke: 1, baum_erle: 1, baum_tanne: 2, baum_mammut: 2, baum_kiefer: 3 };
                        const rk = (v) => {
                            const o = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]);
                            const R = new Array(v.length);
                            for (let i = 0; i < o.length; ) {
                                let k = i;
                                while (k + 1 < o.length && o[k + 1][0] === o[i][0]) k++;
                                for (let m = i; m <= k; m++) R[o[m][1]] = (i + k) / 2;
                                i = k + 1;
                            }
                            return R;
                        };
                        const pearson = (a, b) => {
                            const n = a.length;
                            const ma = a.reduce((s, x) => s + x, 0) / n;
                            const mb = b.reduce((s, x) => s + x, 0) / n;
                            let sab = 0, saa = 0, sbb = 0;
                            for (let i = 0; i < n; i++) {
                                sab += (a[i] - ma) * (b[i] - mb);
                                saa += (a[i] - ma) * (a[i] - ma);
                                sbb += (b[i] - mb) * (b[i] - mb);
                            }
                            return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : null;
                        };
                        const P = 12;
                        for (let t = 0; t < lok.zellen.length / P; t++) {
                            const reihe = lok.zellen.slice(t * P, t * P + P);
                            const da = reihe.filter((c) => c);
                            for (let i = 1; i < reihe.length; i++) {
                                const a = reihe[i - 1];
                                const b = reihe[i];
                                if (!a || !b) continue;
                                const da1 = Object.keys(a.sp).sort((x, y) => a.sp[y] - a.sp[x])[0];
                                const db1 = Object.keys(b.sp).sort((x, y) => b.sp[y] - b.sp[x])[0];
                                if (da1 === db1) continue;
                                wechsel++;
                                if (Object.keys(a.sp).length === 1 && Object.keys(b.sp).length === 1) kanten++;
                            }
                            if (da.length < 4) continue;
                            const ys = da.map((c) => c.y);
                            if (Math.max(...ys) - Math.min(...ys) < 20) continue;
                            const rs = da.map((c) => {
                                let s = 0, n = 0;
                                for (const k of Object.keys(c.sp)) if (rang[k]) (s += rang[k] * c.sp[k]), (n += c.sp[k]);
                                return n ? s / n : 0;
                            });
                            const rho = pearson(rk(ys), rk(rs));
                            if (rho == null) continue;
                            haenge++;
                            if (rho > 0) richtig++;
                        }
                    }
                    const ss = jeSaat.filter((L) => L.length >= 3);
                    const vorhersagbar = ss.length ? (100 * ss.filter((L) => passt(L) >= 90).length) / ss.length : null;
                    const saatAlle = [].concat(...jeSaat);
                    const lz = lok ? Object.assign({}, lok.z) : { fehler: lokFehler };
                    const roh = {
                        1: { werte: lok ? { uferProzent: lz.uferArten ? (100 * lz.uferNass) / lz.uferArten : null, waermeAussen: lz.waermeAussen, gipfelBaeume: lz.gipfelBaeume } : {}, zeuge: lz },
                        2: { werte: lok ? { stufenProzent: haenge ? (100 * richtig) / haenge : null, kantenProzent: wechsel ? (100 * kanten) / wechsel : null, haenge } : {}, zeuge: lok ? { antworten: lok.antworten, haenge } : { fehler: lokFehler } },
                        3: { werte: pl ? { kappa: kappa(kont), landPunkte: kont.length, waldProzent: kont.length ? (100 * kont.filter((z) => spiel(z) === 1).length) / kont.length : null } : {}, zeuge: Object.assign({}, planetZ, { klassen: new Set(kont.map(ref)).size }) },
                        4: { werte: pl ? { passtProzent: passt(planet), landPunkte: planet.length } : {}, zeuge: planetZ, nicht: "keine Orbit-Pose (scripts/werkbank.cjs /bild); der Wuchs des Planeten trägt nur Decke und Wald — keine Mangrove, kein Moor, keine Küstenwüste (voxel-worker.js planetOrtAuftrag delta.wuchs)" },
                        5: { werte: pl ? { vorhersagbarProzent: vorhersagbar, planeten: ss.length } : {}, zeuge: planetZ, nicht: "fremde Klimata: jede Saat steht an ihrem Anker im Klima der Heimat (klimaHeute " + "18/−4 °C), Stern, Achse und Atmosphäre reisen nicht durch den Planet-Faden" },
                        6: { werte: pl ? { konsistenzProzent: passt(saatAlle), saaten: ss.length } : {}, zeuge: planetZ },
                    };
                    for (const nr of Object.keys(U)) {
                        const x = roh[nr] || { werte: {} };
                        if (U[nr].auge) x.auge = await M.auge("pflanzen-biome-s" + nr, U[nr].auge);
                        aus[nr] = x;
                    }
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [
                            K.soll(B_ID, 1, "Uferarten am Wasser ≥ 90 %", { key: "uferProzent", einheit: "%" }),
                            K.soll(B_ID, 1, "Wärme-Arten außerhalb der Wärme 0", { key: "waermeAussen", einheit: "Pflanzen" }),
                        ],
                        zeuge: zeugeLokal,
                        zeugeText: "der Bestand am Spieler, Wasser und Temperatur an jeder Pflanze, der Wald-Faden am Gipfel",
                        taeter: "stamm/vegetation-streu.js _scatterSpeciesForCell (die Palme folgt `lebendig`, nicht der Wärme)",
                        gruen: { werte: { uferProzent: 94, waermeAussen: 0, gipfelBaeume: 0 }, zeuge: { pflanzen: 400, arten: 10, wasserPunkte: 30, uferArten: 20, gipfelZellen: 5, gipfelBaeume: 0, talDarts: 60 } },
                        attrappen: [
                            { name: "die Stichprobe ohne Uferart", roh: { werte: { uferProzent: 94, waermeAussen: 0 }, zeuge: { pflanzen: 400, arten: 10, wasserPunkte: 30, uferArten: 0, gipfelZellen: 5, gipfelBaeume: 0, talDarts: 60 } } },
                            { name: "am Wasser ohne Wasser", roh: { werte: { uferProzent: 94, waermeAussen: 0 }, zeuge: { pflanzen: 400, arten: 10, wasserPunkte: 0, uferArten: 20, gipfelZellen: 5, gipfelBaeume: 0, talDarts: 60 } } },
                            { name: "baumfrei ohne Gipfel (kein Ort über der Baumgrenze)", roh: { werte: { uferProzent: 94, waermeAussen: 0 }, zeuge: { pflanzen: 400, arten: 10, wasserPunkte: 30, uferArten: 20, gipfelZellen: 0, gipfelBaeume: 0, talDarts: 60 } } },
                            { name: "baumfrei, weil der Faden schweigt (auch im Tal kein Baum)", roh: { werte: { uferProzent: 94, waermeAussen: 0 }, zeuge: { pflanzen: 400, arten: 10, wasserPunkte: 30, uferArten: 20, gipfelZellen: 5, gipfelBaeume: 0, talDarts: 0 } } },
                            { name: "Bäume am Gipfel", roh: { werte: { uferProzent: 94, waermeAussen: 0 }, zeuge: { pflanzen: 400, arten: 10, wasserPunkte: 30, uferArten: 20, gipfelZellen: 5, gipfelBaeume: 7, talDarts: 60 } } },
                        ],
                    },
                    2: {
                        u: {},
                        soll: [K.soll(B_ID, 2, "Stufenfolge richtig ≥ 90 %", { key: "stufenProzent", einheit: "%" }), K.soll(B_ID, 2, "scharfe Biom-Kanten im Luftbild ≤ 10 %", { key: "kantenProzent", einheit: "%" })],
                        zeuge: zeugeRegion,
                        zeugeText: "50 Hänge des Wald-Fadens über 10² km² (Rang Höhe ↔ Stufe der Art)",
                        taeter: "phyto-core.js forestNische (die Art folgt dry/wet/clim, keine Höhenstufe)",
                        gruen: { werte: { stufenProzent: 92, kantenProzent: 6, haenge: 55 }, zeuge: { antworten: 600, haenge: 55 } },
                        attrappen: [{ name: "50 Hänge aus einer Tafel", roh: { werte: { stufenProzent: 92, kantenProzent: 6 }, zeuge: { antworten: 0, haenge: 0 } } }],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(B_ID, 3, "Kappa ≥ 0,6", { key: "kappa" })],
                        zeuge: zeugePlanet(250),
                        zeugeText: "300 Punkte des Planet-Fadens auf dem Kontinent des Ankers, Köppen (E: wärmster Monat < 10 °C; B: Abfluss < 50 mm/a) gegen den Wald des Orts",
                        taeter: "planet-core.js pflanzenDeckung (der Wuchs des Orts)",
                        gruen: { werte: { kappa: 0.71, landPunkte: 180 }, zeuge: PLANET_Z },
                        attrappen: [
                            { name: "Kappa ohne Antwort des Fadens", roh: { werte: { kappa: 0.71 }, zeuge: { antworten: 0 } } },
                            { name: "ein Wald überall (keine Streuung)", roh: { werte: { kappa: 0.71 }, zeuge: { antworten: 1000, landPunkte: 310, streuungWald: 0, version: "planet-h2-4" } } },
                        ],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(B_ID, 4, "Biom passt zum lokalen Klima ≥ 90 %", { key: "passtProzent", einheit: "%" }), K.soll(B_ID, 4, "Orbitbild ↔ Satellitenmosaik ≥ 0,7", { key: "orbitAehnlich" })],
                        zeuge: zeugePlanet(800),
                        zeugeText: "1 000 Punkte des Planet-Fadens über die Kugel",
                        taeter: "voxel-worker.js planetOrtAuftrag (delta.wuchs nur Decke und Wald) + scripts/werkbank.cjs (keine Orbit-Pose)",
                        nicht: "keine Orbit-Pose, keine Mangrove/Moor/Küstenwüste",
                        leser: "voxel-worker.js:1184 planetOrtAuftrag — reicht o.biom (koeppen, hauptklasse) des Kerns nicht durch; scripts/werkbank.cjs /bild — keine Orbit-Pose",
                        gruen: { werte: { passtProzent: 92, orbitAehnlich: 0.74 }, zeuge: PLANET_Z },
                        attrappen: [{ name: "92 % ohne Punkte", roh: { werte: { passtProzent: 92, orbitAehnlich: 0.74 }, zeuge: { antworten: 0 } } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(B_ID, 5, "Anteil Planeten, deren Biom-Verteilung aus ihrem Klima vorhersagbar ist ≥ 90 %", { key: "vorhersagbarProzent", einheit: "%" })],
                        zeuge: zeugePlanet(800),
                        zeugeText: "100 Saaten × 12 Punkte des Planet-Fadens",
                        taeter: "gelaende-core.js ortGesetz klimaHeute (jeder Anker im Klima der Heimat)",
                        nicht: "keine fremden Klimata (Stern, Achse, Atmosphäre)",
                        leser: "voxel-worker.js:1184 planetOrtAuftrag — reicht Körper und Bahn des Planeten (jahrTage, Stern) nicht durch",
                        gruen: { werte: { vorhersagbarProzent: 93, planeten: 100 }, zeuge: PLANET_Z },
                        attrappen: [{ name: "93 % ohne Planeten", roh: { werte: { vorhersagbarProzent: 93 }, zeuge: { antworten: 0 } } }],
                    },
                    6: {
                        u: { auge: { ort: "wiese" } },
                        soll: [
                            K.soll(B_ID, 6, "1 000 Saaten × 10 Punkte", { key: "saaten", rel: "≥", zahl: 1000, einheit: "Saaten" }),
                            K.soll(B_ID, 6, "Konsistenz ≥ 95 %", { key: "konsistenzProzent", einheit: "%" }),
                            K.soll(B_ID, 6, "Blindbewertung „lebendige Welt“ ≥ 80 %", { key: "lebendigProzent", einheit: "%" }),
                        ],
                        auge: { pose: "10 Punkte je Saat (heute: die Mess-Wiese der Heimat)", vorbild: "Blindbewertung „lebendige Welt“ ≥ 80 % (R11); fremde Biome über die Fremdwelt-Probe (R10)" },
                        taeter: "planet-core.js pflanzenDeckung (Decke und Wald, keine fremden Biome)",
                        nicht: "jeder Planet jeder Saat mit fremden Biomen",
                        leser: "planet-core.js:2143 pflanzenDeckung — kein Biom ohne irdisches Gegenstück",
                        gruen: { werte: { saaten: 1000, konsistenzProzent: 96, lebendigProzent: 85 }, zeuge: PLANET_Z },
                        attrappen: [{ name: "die Bewertung ohne Saat", roh: { werte: { saaten: 1000, konsistenzProzent: 96, lebendigProzent: 85 }, zeuge: { antworten: 0 } } }],
                    },
                },
            },

            // ══ LEBENSLAUF: der Bestand am Spieler, 20 Orte über 10² km² und 100 Orte; die Zeitreise der Prozess-Uhr (synchron, zurückgestellt) ══
            [LL_ID]: {
                sek: 20,
                mutiert: true,
                pfad: PFAD_WALD.concat(["stamm/feld-leben.js", "stamm/bild-himmel.js"]),
                ungefahren: "das Höhenhistogramm und die Bildreihe aus dem Bild (Ertragstafel, Fotoreihe)",
                mess: async function (H, U, M) {
                    const seite = (fn, A) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(A || {}) + ");");
                    let w = null;
                    let fehler = null;
                    try {
                        w = await seite(async function (r, T, A) {
                            const st = r.state;
                            const p = st.playerMesh.position;
                            const C = AnazhRealm.FOREST.cell;
                            const seedInt = r._forestSeedInt();
                            const extras = r._forestExtraSpecies();
                            const art = (t) => String(t || "").replace(/^grown_/, "").replace(/_v[0-9]+$/, "");
                            const lok = [];
                            let totholz = 0;
                            for (const e of st.architectures) {
                                if (Math.hypot(e.position.x - p.x, e.position.z - p.z) > A.lokalM) continue;
                                if (/gefallen|totholz/.test(e.type)) totholz++;
                                else if (/^baum_/.test(art(e._lodSpecies || e.type))) lok.push(e.scale);
                            }
                            const Kl = A.klassen;
                            const hist = Kl.slice(1).map((_, i) => lok.filter((s) => s >= Kl[i] && s < Kl[i + 1]).length);
                            let h = (seedInt ^ 0x3c6ef372) >>> 0;
                            const q = () => {
                                h = (h + 0x6d2b79f5) >>> 0;
                                let t = h;
                                t = Math.imul(t ^ (t >>> 15), t | 1);
                                t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
                            };
                            const zl = [];
                            const orte = [];
                            for (let i = 0; i < A.orte + A.orteViele; i++) {
                                const gx = Math.floor((p.x + (q() * 2 - 1) * A.regionM) / C);
                                const gz = Math.floor((p.z + (q() * 2 - 1) * A.regionM) / C);
                                const k = i < A.orte ? A.fenster : 1;
                                orte.push([zl.length / 2, k * k, k]);
                                for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) zl.push(gx + a, gz + b);
                            }
                            const W = await r._voxelWorkerWaldDarts(new Int32Array(zl), seedInt, extras, null, "probe-lebenslauf-" + seedInt);
                            const start = [];
                            let j = 0;
                            for (let i = 0; i < W.anzahl.length; i++) {
                                start.push(j);
                                j += W.anzahl[i] * 13;
                            }
                            const ortDarts = orte.map(([z0, n]) => {
                                const d = [];
                                for (let i = z0; i < z0 + n; i++) for (let m = 0, o = start[i]; m < W.anzahl[i]; m++, o += 13) d.push([W.werte[o], W.werte[o + 1], W.arten[W.werte[o + 2]], W.werte[o + 3], W.werte[o + 12]]);
                                return d;
                            });
                            const gx0 = Math.floor(p.x / C);
                            const gz0 = Math.floor(p.z / C);
                            const K = r._kalender();
                            const tagS = K.tagS;
                            const jahrS = Math.max(365 * tagS, (K.jahrK * K.tagS) / K.normS);
                            const sz0 = st.spielZeit;
                            const lage = {};
                            try {
                                for (const J of A.jahre) {
                                    st.spielZeit = sz0 + J * jahrS;
                                    const je = ortDarts.map((d) => {
                                        let n = 0, s = 0, s2 = 0;
                                        for (const x of d)
                                            if (r._baumAlter(x[0], x[1]) > 0) {
                                                n++;
                                                s += x[3];
                                                s2 += x[3] * x[3];
                                            }
                                        return [n, s, s2];
                                    });
                                    const geb = [];
                                    for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) for (const d of r._forestGeborene(gx0 + a, gz0 + b, seedInt, true)) geb.push(d.sp + ":" + d.s.toFixed(4) + ":" + d.x.toFixed(2));
                                    lage[J] = { je, geb: geb.join("|") };
                                }
                            } finally {
                                st.spielZeit = sz0;
                            }
                            const zurueck = st.spielZeit === sz0;
                            const pflanzen = [];
                            for (const d of ortDarts.slice(0, A.orte)) for (const x of d) pflanzen.push([x[4], x[3], x[2]]);
                            return { lok: lok.length, hist, totholz, orte: orte.map((o) => [o[1], o[2]]), lage, pflanzen: pflanzen.slice(0, 4000), zurueck, jahrS, flaecheM2: A.fenster * A.fenster * C * C, ortZahl: A.orte };
                        }, { lokalM: 150, klassen: [0.55, 0.8, 1.05, 1.3, 1.55, 2.0], orte: 20, orteViele: 100, fenster: 8, regionM: 5000, jahre: [0, 10, 50, 100, 150, 500] });
                    } catch (e) {
                        fehler = String((e && e.message) || e).slice(0, 200);
                    }
                    const aus = M.teil || {};
                    if (!w) {
                        for (const nr of Object.keys(U)) {
                            aus[nr] = { werte: {}, zeuge: { fehler } };
                            if (U[nr].auge) aus[nr].auge = await M.auge("pflanzen-lebenslauf-s" + nr, U[nr].auge);
                        }
                        return { sprossen: aus };
                    }
                    const N = w.ortZahl;
                    const ha = w.flaecheM2 / 10000;
                    const summe = (J, a, b) => w.lage[J].je.slice(a, b).reduce((s, x) => [s[0] + x[0], s[1] + x[1], s[2] + x[2]], [0, 0, 0]);
                    const gleichAb = (J) => JSON.stringify(w.lage[J].je) === JSON.stringify(w.lage[0].je) && w.lage[J].geb === w.lage[0].geb;
                    const formJahre = Math.max(0, ...[10, 50, 100, 150, 500].filter((J) => !gleichAb(J)));
                    const s0 = summe(0, 0, N);
                    const s50 = summe(50, 0, N);
                    const s150 = summe(150, 0, N);
                    const baeume = s0[0];
                    const ref4 = U[4].ref || { n: 0.42, h: 1.55 };
                    let imBand = 0;
                    for (let i = 0; i < N; i++) {
                        const a = w.lage[0].je[i];
                        const b = w.lage[50].je[i];
                        if (!a[0]) continue;
                        const nV = b[0] / a[0];
                        const hV = b[0] && a[0] ? b[1] / b[0] / (a[1] / a[0]) : 0;
                        if (Math.abs(nV - ref4.n) <= 0.2 * ref4.n && Math.abs(hV - ref4.h) <= 0.2 * ref4.h) imBand++;
                    }
                    const besetzt = w.lage[0].je.slice(0, N).filter((x) => x[0] > 0).length;
                    const viele = w.lage[0].je.slice(N);
                    let chrono = 0;
                    viele.forEach((x, i) => {
                        if ([10, 50, 150, 500].some((J) => JSON.stringify(w.lage[J].je[N + i]) !== JSON.stringify(x))) chrono++;
                    });
                    const rk = (v) => {
                        const o = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]);
                        const R = new Array(v.length);
                        for (let i = 0; i < o.length; ) {
                            let k = i;
                            while (k + 1 < o.length && o[k + 1][0] === o[i][0]) k++;
                            for (let m = i; m <= k; m++) R[o[m][1]] = (i + k) / 2;
                            i = k + 1;
                        }
                        return R;
                    };
                    const pearson = (a, b) => {
                        const n = a.length;
                        if (n < 3) return null;
                        const ma = a.reduce((s, x) => s + x, 0) / n;
                        const mb = b.reduce((s, x) => s + x, 0) / n;
                        let sab = 0, saa = 0, sbb = 0;
                        for (let i = 0; i < n; i++) {
                            sab += (a[i] - ma) * (b[i] - mb);
                            saa += (a[i] - ma) * (a[i] - ma);
                            sbb += (b[i] - mb) * (b[i] - mb);
                        }
                        return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : 0;
                    };
                    const alterGroesse = pearson(rk(w.pflanzen.map((x) => x[0])), rk(w.pflanzen.map((x) => x[1])));
                    const alterMax = Math.max(0, ...w.pflanzen.map((x) => x[0]));
                    const zeit = (J) => ({ baeume, jahre: J, gleich: gleichAb(J), zurueck: w.zurueck });
                    const keineUhr = "der Bestand ist keine Funktion der Zeit: " + baeume + " Bäume an " + N + " Orten blieben über 500 Jahre der Prozess-Uhr byte-gleich (phyto-core planForestCell liest keine Uhr; _baumAlter altert nur Taten)";
                    const roh = {
                        1: { werte: { baeumeLokal: w.lok, reverseJ: w.hist[0] >= w.hist[1] && w.hist[1] >= w.hist[2] ? 1 : 0, totholz: w.totholz, staemmeJeHa: Math.round((w.lok / (Math.PI * 150 * 150)) * 10000) }, zeuge: zeit(0) },
                        2: { werte: { jahreMitFormwechsel: formJahre }, zeuge: zeit(150), ...(formJahre < 150 ? { nicht: "die Pflanze wechselt ihre Form über 150 Jahre nicht — ihr Alter ist die Schicht des Bestands (phyto-core forestSchicht), keine Funktion der Zeit" } : {}) },
                        3: { werte: { staemmeVerh: s0[0] ? s150[0] / s0[0] : null, basalVerh: s0[2] ? s150[2] / s0[2] : null, staemmeJeHa: Math.round(s0[0] / (besetzt * ha || 1)) }, zeuge: zeit(150), ...(gleichAb(150) ? { nicht: keineUhr } : {}) },
                        4: { werte: { orte: besetzt, jahre: 50, orteImBandProzent: besetzt ? (100 * imBand) / besetzt : null, staemmeVerh50: s0[0] ? s50[0] / s0[0] : null }, zeuge: zeit(50), ...(gleichAb(50) ? { nicht: keineUhr } : {}) },
                        5: { werte: { pflanzen: w.pflanzen.length, alterGroesseRang: alterGroesse, alterJahreMax: alterMax > 1 ? alterMax : 0 }, zeuge: { baeume, jahre: 500, gleich: false, zurueck: w.zurueck, alterJahre: alterMax > 1 }, nicht: "keine Pflanze trägt ein Alter in Jahren (der Dart trägt die Schicht " + alterMax.toFixed(2) + " ≤ 1, phyto-core forestSchicht) und keine Lebensdauer je Wuchsform" },
                        6: { werte: { orte: viele.length, chronoProzent: viele.length ? (100 * chrono) / viele.length : null }, zeuge: zeit(500), ...(chrono === 0 ? { nicht: "an " + viele.length + " Orten × 5 Zeitabständen (10–500 Jahre) blieb jeder Bestand gleich — keine Chronosequenz" } : {}) },
                    };
                    for (const nr of Object.keys(U)) {
                        const x = roh[nr] || { werte: {} };
                        if (U[nr].auge) x.auge = await M.auge("pflanzen-lebenslauf-s" + nr, U[nr].auge);
                        aus[nr] = x;
                    }
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: { auge: { ort: "wiese" } },
                        soll: [ohneZahl(LL_ID, 1, "Höhenhistogramm aus dem Bild gegen Ertragstafel", "hoehenAbstand")],
                        auge: { pose: "Ego im Wald am Rand der Mess-Wiese", vorbild: "Höhenhistogramm des Bestands gegen die Ertragstafel (Prüfer-Satz R11, die Schwelle fehlt dem Richter)" },
                        taeter: "phyto-core.js forestTreeSize (reverse-J als statischer Parameter)",
                        unklar: "der Richter nennt keine Schwelle — Vorschlag: Kolmogorow-Smirnow-Abstand Höhenhistogramm ↔ Ertragstafel ≤ 0,15.",
                        gruen: { werte: { hoehenAbstand: 0.1, baeumeLokal: 300, reverseJ: 1 }, zeuge: { baeume: 300, jahre: 0, gleich: false } },
                        attrappen: [{ name: "das Histogramm ohne Bestand", roh: { werte: { hoehenAbstand: 0.1 }, zeuge: { baeume: 0 } } }],
                    },
                    2: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(LL_ID, 2, "Bildreihe 0/10/50/150 Jahre", { key: "jahreMitFormwechsel", rel: "≥", zahl: 150, einheit: "Jahre" })],
                        auge: { pose: "dieselbe Pflanze nach 0/10/50/150 Jahren der Welt-Uhr (Ego, 8 m)", vorbild: "Fotoreihe derselben Art (Prüfer-Satz R11)" },
                        taeter: "phyto-core.js forestSchicht (das Alter ist die Schicht, keine Uhr)",
                        nicht: "die Pflanze altert nicht",
                        leser: "phyto-core.js:3631 planForestCell — kein Eingang für die Zeit der Welt (spielZeit)",
                        gruen: { werte: { jahreMitFormwechsel: 150 }, zeuge: { baeume: 300, jahre: 150, gleich: false } },
                        attrappen: [{ name: "die Bildreihe ohne Zeitreise", roh: { werte: { jahreMitFormwechsel: 150 }, zeuge: { baeume: 300, jahre: 0 } } }],
                    },
                    3: {
                        u: {},
                        soll: [
                            K.soll(LL_ID, 3, "gegen Ertragstafel ±20 %", { key: "staemmeVerh", ref: 0.3, refQuelle: "Ertragstafel Fichte I. Ekl. mäßige Df. (Wiedemann 1936/42), gerundet: Stammzahl Alter 150 / Alter 50 ≈ 0,3" }),
                            K.soll(LL_ID, 3, "gegen Ertragstafel ±20 %", { key: "basalVerh", ref: 1.4, refQuelle: "Ertragstafel Fichte I. Ekl. mäßige Df. (Wiedemann 1936/42), gerundet: Grundfläche Alter 150 / Alter 50 ≈ 1,4" }),
                        ],
                        zeuge: zeugeZeit(100),
                        zeugeText: "20 Hektar des Wald-Fadens vor und nach 150 Jahren der Prozess-Uhr",
                        taeter: "phyto-core.js planForestCell (der Bestand liest keine Uhr)",
                        nicht: "1 ha über 10² Jahre",
                        leser: "phyto-core.js:3631 planForestCell — kein Eingang für die Zeit der Welt; stamm/vegetation-wiese.js:2198 _baumAlter altert nur Taten",
                        gruen: { werte: { staemmeVerh: 0.31, basalVerh: 1.38 }, zeuge: { baeume: 900, jahre: 150, gleich: false } },
                        attrappen: [
                            { name: "die Verhältnisse der Tafel, der Bestand byte-gleich", roh: { werte: { staemmeVerh: 0.31, basalVerh: 1.38 }, zeuge: { baeume: 900, jahre: 150, gleich: true } } },
                            { name: "ohne Zeitreise", roh: { werte: { staemmeVerh: 0.31, basalVerh: 1.38 }, zeuge: { baeume: 900, jahre: 0 } } },
                        ],
                    },
                    4: {
                        u: { ref: { n: 0.42, h: 1.55, quelle: "Ertragstafel Fichte I. Ekl. mäßige Df. (Wiedemann 1936/42), gerundet: Alter 50 → 100 Stammzahl × 0,42, Höhe × 1,55" } },
                        soll: [
                            K.soll(LL_ID, 4, "Rückkehr an 20 Orte", { key: "orte", rel: "≥", einheit: "Orte" }),
                            K.soll(LL_ID, 4, "nach 50 Spieljahren", { key: "jahre", rel: "≥", einheit: "Jahre" }),
                            K.soll(LL_ID, 4, "an ≥ 90 %", { key: "orteImBandProzent", einheit: "%" }),
                        ],
                        zeuge: zeugeZeit(50),
                        zeugeText: "20 Orte über 10² km² vor und nach 50 Jahren der Prozess-Uhr",
                        taeter: "phyto-core.js planForestCell (der Bestand liest keine Uhr)",
                        nicht: "10² km² leben ungesehen weiter",
                        leser: "phyto-core.js:3631 planForestCell — kein Eingang für die Zeit der Welt",
                        gruen: { werte: { orte: 20, jahre: 50, orteImBandProzent: 95 }, zeuge: { baeume: 900, jahre: 50, gleich: false } },
                        attrappen: [{ name: "95 % ohne Rückkehr (vor = nach)", roh: { werte: { orte: 20, jahre: 50, orteImBandProzent: 95 }, zeuge: { baeume: 900, jahre: 50, gleich: true } } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(LL_ID, 5, "1 000 Pflanzen", { key: "pflanzen", rel: "≥", einheit: "Pflanzen" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (z.fehler) return "die Messung warf: " + z.fehler;
                            if (!(z.baeume >= 50)) return "nur " + (z.baeume || 0) + " Bäume";
                            if (z.alterJahre !== true) return "keine Pflanze trägt ein Alter in Jahren — die Alter-Größe-Beziehung ist ungemessen";
                            return null;
                        },
                        zeugeText: "Alter und Größe je Pflanze aus dem Wald-Faden",
                        taeter: "phyto-core.js forestSchicht (kein Alter in Jahren)",
                        nicht: "Zeitskalen vom Tag bis zum Jahrtausend",
                        leser: "phyto-core.js:3631 planForestCell — kein Alter in Jahren und keine Lebensdauer je Wuchsform",
                        gruen: { werte: { pflanzen: 1200 }, zeuge: { baeume: 1200, alterJahre: true } },
                        attrappen: [{ name: "1 000 Pflanzen ohne Alter in Jahren", roh: { werte: { pflanzen: 1200 }, zeuge: { baeume: 1200, alterJahre: false } } }],
                    },
                    6: {
                        u: { auge: { ort: "wiese" } },
                        soll: [
                            K.soll(LL_ID, 6, "100 Orte × 5 Zeitabstände", { key: "orte", rel: "≥", zahl: 100, einheit: "Orte" }),
                            K.soll(LL_ID, 6, "Bestand im Band der Chronosequenz des Bioms ≥ 90 %", { key: "chronoProzent", einheit: "%" }),
                        ],
                        auge: { pose: "100 Orte × 5 Zeitabstände (heute die Mess-Wiese)", vorbild: "Chronosequenz des Bioms; fremde Planeten über die Fremdwelt-Probe (R10)" },
                        taeter: "phyto-core.js planForestCell (der Bestand liest keine Uhr)",
                        nicht: "jede Pflanze jedes Planeten als Funktion der Zeit",
                        leser: "phyto-core.js:3631 planForestCell — kein Eingang für die Zeit der Welt",
                        gruen: { werte: { orte: 100, chronoProzent: 92 }, zeuge: { baeume: 900, jahre: 500, gleich: false } },
                        attrappen: [{ name: "92 % ohne Zeitabstände", roh: { werte: { orte: 100, chronoProzent: 92 }, zeuge: { baeume: 900, jahre: 0 } } }],
                    },
                },
            },

            // ══ JAHRESLAUF (S2–S6): der Kalender der EINEN Präsenz über 52 Wochen, das Jahr der Welt (setSeason, zurückgestellt), der Planet ══
            [J_ID]: {
                sek: 12,
                mutiert: true,
                pfad: ["stamm/bild-himmel.js", "stamm/stoff-instanz.js", "stamm/gelaende-fern.js", "foundry-core.js", "phyto-core.js", "planet-core.js", "voxel-worker.js", "stamm/vegetation-*.js", "scripts/werkbank.cjs"],
                ungefahren: "die Bildreihe der Blüte gegen die Webcam, das Austriebsdatum im Bild gegen Satelliten-NDVI, der Orbit-Zeitraffer",
                mess: async function (H, U, M) {
                    const seite = (fn, A) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(A || {}) + ");");
                    let w = null;
                    let fehler = null;
                    try {
                        w = await seite(async function (r, T, A) {
                            const st = r.state;
                            const kurve = [];
                            const o = {};
                            for (let k = 0; k < 52; k++) {
                                r._saisonPraesenz(k / 52, o);
                                kurve.push([o.x, o.y, o.z]);
                            }
                            const su = r._ensureSeasonUniforms();
                            const vor = { phase: st.seasonPhase, season: st.season, anker: r._saisonAnker ? Object.assign({}, r._saisonAnker) : null, auto: st.autoSeason };
                            let sommer = null;
                            let winter = null;
                            try {
                                r.setSeason("summer");
                                r._tickSeason();
                                sommer = su.uLaubPraesenz.value.x;
                                r.setSeason("winter");
                                r._tickSeason();
                                winter = su.uLaubPraesenz.value.x;
                            } finally {
                                st.seasonPhase = vor.phase;
                                st.season = vor.season;
                                r._saisonAnker = vor.anker;
                                st.autoSeason = vor.auto;
                                r._tickSeason();
                            }
                            const zurueck = st.seasonPhase === vor.phase;
                            const kurven = Object.keys(st.seasonUniforms || {}).filter((k) => /Praesenz/.test(k)).length;
                            const art = (t) => String(t || "").replace(/^grown_/, "").replace(/_v[0-9]+$/, "");
                            const arten = new Set();
                            for (const e of st.architectures) arten.add(art(e._lodSpecies || e.type));
                            for (const reg of st.scatterRegions.values()) for (const c of reg.cells || []) arten.add(art(c.species));
                            await r._fadenQuelle();
                            const anker = await r._planetAuftrag({ type: "planet-anker", samen: "anazh-realm-seed", zeitMa: 0 });
                            let h = 0x1b873593;
                            const q = () => {
                                h = (h + 0x6d2b79f5) >>> 0;
                                let t = h;
                                t = Math.imul(t ^ (t >>> 15), t | 1);
                                t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
                                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
                            };
                            const P = Array.from({ length: A.punkte }, () => [(Math.asin(2 * q() - 1) * 180) / Math.PI, q() * 360 - 180]);
                            const pl = await Promise.all(P.map((b) => r._planetAuftrag({ type: "planet-ort", samen: "anazh-realm-seed", breite: b[0], laenge: b[1], zeitMa: 0 })));
                            const ankerSued = anker.breite < 0;
                            let gegen = 0;
                            let andere = 0;
                            for (const x of pl)
                                if (x.breite < 0 !== ankerSued) {
                                    andere++;
                                    if (Math.abs(x.delta.klima.sommerPhase - 0.5) < 1e-6) gegen++;
                                }
                            return { kurve, sommer, winter, zurueck, kurven, arten: [...arten], ankerBreite: anker.breite, sommerPhase: r._gelaende().ort.klimaHeute.sommerPhase, andere, gegen, version: anker.version };
                        }, { punkte: 200 });
                    } catch (e) {
                        fehler = String((e && e.message) || e).slice(0, 200);
                    }
                    const aus = M.teil || {};
                    if (!w) {
                        for (const nr of Object.keys(U)) {
                            aus[nr] = { werte: {}, zeuge: { fehler } };
                            if (U[nr].auge) aus[nr].auge = await M.auge("pflanzen-jahreslauf-s" + nr, U[nr].auge);
                        }
                        return { sprossen: aus };
                    }
                    const x = w.kurve.map((k) => k[0]);
                    const y = w.kurve.map((k) => k[1]);
                    const tief = x.indexOf(Math.min(...x));
                    let austrieb = null;
                    for (let k = 1; k <= 52; k++) {
                        const i = (tief + k) % 52;
                        if (x[i] >= 0.5) {
                            austrieb = i;
                            break;
                        }
                    }
                    const reihe = U[2].reihe;
                    const laub = reihe.filter((a) => w.arten.includes(a));
                    const kalender = laub.map(() => austrieb);
                    const rk = (v) => {
                        const o = v.map((q, i) => [q, i]).sort((a, b) => a[0] - b[0]);
                        const R = new Array(v.length);
                        for (let i = 0; i < o.length; ) {
                            let k = i;
                            while (k + 1 < o.length && o[k + 1][0] === o[i][0]) k++;
                            for (let m = i; m <= k; m++) R[o[m][1]] = (i + k) / 2;
                            i = k + 1;
                        }
                        return R;
                    };
                    const pearson = (a, b) => {
                        const n = a.length;
                        if (n < 2) return null;
                        const ma = a.reduce((s, q) => s + q, 0) / n;
                        const mb = b.reduce((s, q) => s + q, 0) / n;
                        let sab = 0, saa = 0, sbb = 0;
                        for (let i = 0; i < n; i++) {
                            sab += (a[i] - ma) * (b[i] - mb);
                            saa += (a[i] - ma) * (a[i] - ma);
                            sbb += (b[i] - mb) * (b[i] - mb);
                        }
                        return saa > 0 && sbb > 0 ? sab / Math.sqrt(saa * sbb) : 0;
                    };
                    const rang = pearson(rk(kalender), rk(laub.map((_, i) => i)));
                    const bluehWochen = y.filter((v, i) => Math.abs(v - y[(i + 51) % 52]) > 1e-6).length;
                    const phi = w.ankerBreite;
                    const sol = w.sommerPhase - 1 / 12;
                    const ein = w.kurve.map((_, k) => {
                        const d = ((23.44 * Math.PI) / 180) * Math.cos(2 * Math.PI * (k / 52 - sol));
                        const c = -Math.tan(phi) * Math.tan(d);
                        const h0 = Math.acos(Math.max(-1, Math.min(1, c)));
                        return h0 * Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.sin(h0);
                    });
                    const rEin = pearson(x, ein);
                    const zeuge = { wochen: w.kurve.length, sommerLaub: w.sommer, winterLaub: w.winter, arten: laub.length, zurueck: w.zurueck, version: w.version };
                    const eine = "EINE Präsenz des Laubs für jede Art (" + w.kurven + " Kurve: stamm/bild-himmel.js _saisonPraesenz → uLaubPraesenz)";
                    const roh = {
                        2: { werte: { rang, arten: laub.length, kalender: new Set(kalender).size }, zeuge },
                        3: { werte: { wochen: bluehWochen ? 52 : 0, bluehKurven: w.kurven }, zeuge, nicht: "Blüte und Frucht an 10² Arten: " + eine + ", die Blüte ist dieselbe Kurve (y), keine Frucht und keine Mast" },
                        4: { werte: { tageJe100m: 0, austriebWoche: austrieb }, zeuge, nicht: "die Präsenz liest nur die Phase des Jahrs — Höhe und Breite verschieben den Kalender nicht (" + eine + ")" },
                        5: { werte: { gegenHalbkugelProzent: w.andere ? (100 * w.gegen) / w.andere : null }, zeuge, nicht: "kein Orbit-Zeitraffer (scripts/werkbank.cjs /bild ohne Orbit-Pose) und keine NDVI-Kurve je Biom: " + eine + ", keine Trockenzeit, kein Monsun" },
                        6: { werte: { r: rEin, planeten: 1 }, zeuge, nicht: "ein Planet: der Faden reicht weder Bahn noch Jahr fremder Planeten durch (voxel-worker.js planetOrtAuftrag); gemessen die Heimat, r Präsenz ↔ Einstrahlung " + (rEin == null ? "—" : rEin.toFixed(3)) },
                    };
                    for (const nr of Object.keys(U)) {
                        const q = roh[nr] || { werte: {} };
                        if (U[nr].auge) q.auge = await M.auge("pflanzen-jahreslauf-s" + nr, U[nr].auge);
                        aus[nr] = q;
                    }
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: { reihe: ["busch_hazel", "baum_erle", "baum_birke", "baum_buche", "baum_eiche"] },
                        soll: [K.soll(J_ID, 2, "Rangkorrelation ≥ 0,8", { key: "rang" })],
                        zeuge: zeugeJahr,
                        zeugeText: "der Kalender der Laub-Arten des Bestands, das Jahr der Welt Winter ↔ Sommer",
                        taeter: "stamm/bild-himmel.js _saisonPraesenz (EINE Kurve für jede Art)",
                        leser: "stamm/bild-himmel.js:882 _saisonPraesenz(phase, out) — kein Eingang für die Art (DWD-Phänologie: Hasel vor Erle vor Birke vor Buche vor Eiche)",
                        gruen: { werte: { rang: 0.9, arten: 5 }, zeuge: { wochen: 52, sommerLaub: 1, winterLaub: 0.06, arten: 5 } },
                        attrappen: [
                            { name: "die Rangkorrelation aus der Tafel, das Jahr der Welt steht", roh: { werte: { rang: 0.9 }, zeuge: { wochen: 52, sommerLaub: 1, winterLaub: 1, arten: 5 } } },
                            { name: "eine Art", roh: { werte: { rang: 0.9 }, zeuge: { wochen: 52, sommerLaub: 1, winterLaub: 0.06, arten: 1 } } },
                        ],
                    },
                    3: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(J_ID, 3, "12-Wochen-Bildreihe", { key: "wochen", rel: "≥", einheit: "Wochen" })],
                        auge: { pose: "die Mess-Wiese, Ego, je Woche ein Bild über 12 Wochen der Blüte", vorbild: "Webcam-Zeitreihe derselben Lage (Prüfer-Satz R11)" },
                        taeter: "stamm/bild-himmel.js _saisonPraesenz (EINE Blüh-Kurve, keine Frucht)",
                        nicht: "Blüte und Frucht als Ereignis an 10² Arten",
                        leser: "stamm/bild-himmel.js:882 _saisonPraesenz — keine Blüte je Art, kein Leser für Frucht und Mast",
                        gruen: { werte: { wochen: 52 }, zeuge: { wochen: 52, sommerLaub: 1, winterLaub: 0.06, arten: 5 } },
                        attrappen: [{ name: "12 Wochen ohne Jahr", roh: { werte: { wochen: 52 }, zeuge: { wochen: 0 } } }],
                    },
                    4: {
                        u: { auge: { ort: "wiese" } },
                        soll: [ohneZahl(J_ID, 4, "Austriebsdatum über Höhe und Breite gegen Satelliten-NDVI", "tageJe100m", "Tage je 100 m")],
                        auge: { pose: "Flug über die Region im Austrieb (heute: die Mess-Wiese)", vorbild: "Satelliten-NDVI des Austriebs über Höhe und Breite (Prüfer-Satz R11, die Schwelle fehlt dem Richter)" },
                        taeter: "stamm/bild-himmel.js _saisonPraesenz (kein Eingang für Höhe und Breite)",
                        nicht: "Höhe und Breite verschieben den Kalender nicht",
                        leser: "stamm/bild-himmel.js:882 _saisonPraesenz(phase, out) — kein Eingang für Höhe und Breite",
                        unklar: "der Richter nennt keine Schwelle — Vorschlag: Grünwelle 3–4 Tage je 100 m Höhe (die Tiefe der Sprosse) gegen MODIS-NDVI, Abweichung ≤ 1 Tag.",
                        gruen: { werte: { tageJe100m: 3.5 }, zeuge: { wochen: 52, sommerLaub: 1, winterLaub: 0.06, arten: 5 } },
                        attrappen: [{ name: "3,5 Tage ohne Jahr", roh: { werte: { tageJe100m: 3.5 }, zeuge: { wochen: 0 } } }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(J_ID, 5, "r ≥ 0,8", { key: "r" })],
                        zeuge: zeugeJahr,
                        zeugeText: "die Halbkugeln des Planet-Fadens und das Jahr der Welt",
                        taeter: "stamm/bild-himmel.js _saisonPraesenz (keine Trockenzeit, kein Monsun) + scripts/werkbank.cjs (keine Orbit-Pose)",
                        nicht: "kein Orbit-Zeitraffer, keine NDVI-Kurve je Biom",
                        leser: "scripts/werkbank.cjs:2110 /bild — keine Orbit-Pose; stamm/bild-himmel.js:882 _saisonPraesenz — kein Eingang für Niederschlag",
                        gruen: { werte: { r: 0.85 }, zeuge: { wochen: 52, sommerLaub: 1, winterLaub: 0.06, arten: 5 } },
                        attrappen: [{ name: "r 0,85 aus MODIS ohne Spiel", roh: { werte: { r: 0.85 }, zeuge: { wochen: 0 } } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(J_ID, 6, "100 Planeten", { key: "planeten", rel: "≥", einheit: "Planeten" }), K.soll(J_ID, 6, "Phänologie folgt der Einstrahlung, r ≥ 0,8", { key: "r" })],
                        zeuge: zeugeJahr,
                        zeugeText: "die Präsenz des Laubs über 52 Wochen gegen die Tages-Einstrahlung am Anker (Breite des Planet-Fadens)",
                        taeter: "voxel-worker.js planetOrtAuftrag (Bahn und Jahr fremder Planeten fehlen)",
                        nicht: "fremde Planeten mit eigenem Jahr",
                        leser: "voxel-worker.js:1184 planetOrtAuftrag — reicht jahrTage und Bahn nicht durch; stamm/bild-himmel.js _tickSeason — EIN Jahr (der Kalender `_kalender().jahrK`)",
                        gruen: { werte: { planeten: 100, r: 0.86 }, zeuge: { wochen: 52, sommerLaub: 1, winterLaub: 0.06, arten: 5 } },
                        attrappen: [{ name: "100 Planeten aus einer Liste, das Jahr steht", roh: { werte: { planeten: 100, r: 0.86 }, zeuge: { wochen: 52, sommerLaub: 1, winterLaub: 1, arten: 5 } } }],
                    },
                },
            },

            // ══ DICHTE: der Bestand nach Entfernung, der Wald von innen (Wald-Faden), die Bilder der Welt (Takt), die Sichtweite, /zaehlen ══
            [D_ID]: {
                sek: 20,
                pfad: PFAD_WALD.concat(["stamm/gelaende-fern.js", "stamm/bild-*.js", "scripts/lib/draw-zaehler.cjs", "spec/profiband/haushalt.json"]),
                ungefahren: "die Ring-Bildanteile und Bildpaare (Foto, REF real-mischwald), der Pop-Zähler im Bild, Frame p95 an der Karte",
                mess: async function (H, U, M) {
                    const seite = (fn, A) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(A || {}) + ");");
                    let w = null;
                    let fehler = null;
                    try {
                        w = await seite(async function (r, T, A) {
                            const st = r.state;
                            const p = st.playerMesh.position;
                            const art = (t) => String(t || "").replace(/^grown_/, "").replace(/_v[0-9]+$/, "");
                            const pflanze = /^(baum_|busch_|farn_|blume_)/;
                            const ringe = A.ringe.slice(1).map(() => 0);
                            let n = 0;
                            let fernste = 0;
                            let unter = 0;
                            const nimm = (sp, x, z) => {
                                const d = Math.hypot(x - p.x, z - p.z);
                                n++;
                                fernste = Math.max(fernste, d);
                                for (let i = 0; i < ringe.length; i++) if (d >= A.ringe[i] && d < A.ringe[i + 1]) ringe[i]++;
                                if (!/^baum_/.test(sp) && d < 50) unter++;
                            };
                            for (const e of st.architectures) {
                                const sp = art(e._lodSpecies || e.type);
                                if (pflanze.test(sp)) nimm(sp, e.position.x, e.position.z);
                            }
                            for (const reg of st.scatterRegions.values())
                                for (const c of reg.cells || []) {
                                    const sp = art(c.species);
                                    if ((c.layer === "tree" || c.layer === "under") && pflanze.test(sp)) nimm(sp, c.x, c.z);
                                }
                            const C = AnazhRealm.FOREST.cell;
                            const seedInt = r._forestSeedInt();
                            const zl = [];
                            for (let f = 0; f < A.fenster; f++) {
                                const a = (2 * Math.PI * f) / A.fenster;
                                const gx = Math.floor((p.x + Math.cos(a) * A.fensterM) / C);
                                const gz = Math.floor((p.z + Math.sin(a) * A.fensterM) / C);
                                for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) zl.push(gx + i, gz + j);
                            }
                            const W = await r._voxelWorkerWaldDarts(new Int32Array(zl), seedInt, r._forestExtraSpecies(), null, "probe-dichte-" + seedInt);
                            const jeHa = [];
                            for (let f = 0; f < A.fenster; f++) {
                                let s = 0;
                                for (let i = f * 64; i < f * 64 + 64; i++) s += W.anzahl[i];
                                jeHa.push((s * 10000) / (64 * C * C));
                            }
                            const bilder = await Promise.race([
                                new Promise((ok) => {
                                    const d = [];
                                    let t = performance.now();
                                    const f = (jetzt) => {
                                        d.push(jetzt - t);
                                        t = jetzt;
                                        if (d.length < A.bilder) requestAnimationFrame(f);
                                        else ok(d);
                                    };
                                    requestAnimationFrame(f);
                                }),
                                new Promise((ok) => setTimeout(() => ok(null), A.bildMs)),
                            ]);
                            return { n, fernste, ringe, unter, jeHa, far: st.camera.far, bilder: bilder ? bilder.slice(1) : [], gras: st.voxelChunkGrass ? st.voxelChunkGrass.size : 0 };
                        }, { ringe: [0, 20, 40, 100, 300, 1000, 10000], fenster: 12, fensterM: 400, bilder: 61, bildMs: 4000 });
                    } catch (e) {
                        fehler = String((e && e.message) || e).slice(0, 200);
                    }
                    let zl = null;
                    try {
                        zl = await Promise.race([H.ruf("/zaehlen", {}), new Promise((_, nein) => setTimeout(() => nein(new Error("/zaehlen > 8 s")), 8000))]);
                    } catch (e) {
                        zl = { fehler: String((e && e.message) || e).slice(0, 160) };
                    }
                    const aus = M.teil || {};
                    if (!w) {
                        for (const nr of Object.keys(U)) {
                            aus[nr] = { werte: {}, zeuge: { fehler } };
                            if (U[nr].auge) aus[nr].auge = await M.auge("pflanzen-dichte-s" + nr, U[nr].auge);
                        }
                        return { sprossen: aus };
                    }
                    const kl = (zl && zl.klassen) || [];
                    const wiese = kl.filter((k) => /wiese|gras|halm/i.test(k.klasse));
                    const wieseBis = wiese.length ? Math.max(...wiese.map((k) => k.dMax || 0)) : null;
                    const fern = kl.filter((k) => /fern|kamm|panorama|ring/i.test(k.klasse)).length;
                    const b = w.bilder.slice().sort((x, y) => x - y);
                    const p95 = b.length ? b[Math.min(b.length - 1, Math.ceil(0.95 * b.length) - 1)] : null;
                    const wald = w.jeHa.filter((x) => x > 0);
                    const staemme = wald.length ? wald.reduce((s, x) => s + x, 0) / wald.length : 0;
                    const zeuge = { pflanzen: w.n, fernsteM: w.fernste, bilder: w.bilder.length, zaehlen: zl && zl.fehler ? zl.fehler : kl.length + " Klassen" };
                    const roh = {
                        1: { werte: { wieseBisM: wieseBis, pflanzen0bis20: w.ringe[0], pflanzen20bis40: w.ringe[1], staemmeJeHaWald: staemme }, zeuge },
                        2: { werte: { wieseBisM: wieseBis, staemmeJeHaWald: staemme, unterholzJe50m: w.unter }, zeuge },
                        3: { werte: { fernstePflanzeM: w.fernste, pflanzen300bis1000: w.ringe[4] }, zeuge, ...(w.fernste < 1000 ? { nicht: "die fernste einzelne Pflanze steht bei " + Math.round(w.fernste) + " m (Soll 1 km), dahinter zeichnet die Ferne Kronen-Mittel (fern-ring)" } : {}) },
                        4: { werte: { sichtweiteM: w.far, fernKlassen: fern }, zeuge, ...(w.far < 10000 ? { nicht: "die Kamera endet bei " + w.far + " m (Soll Horizont 10 km)" } : {}) },
                        5: { werte: { fernstePflanzeM: w.fernste }, zeuge, nicht: "kein Anflug 10 km → 1 m (die Werkbank kennt keinen Flug) und keine einzelne Pflanze jenseits " + Math.round(w.fernste) + " m — die Ferne zeichnet Kronen-Mittel, nicht die Pflanze, die man anfliegt" },
                        6: { werte: { p95Ms: p95 }, zeuge, nicht: "kein Flug Orbit → Halm: die Kamera reicht " + w.far + " m; gemessen Frame p95 am Stand (" + b.length + " Bilder)" },
                    };
                    for (const nr of Object.keys(U)) {
                        const q = roh[nr] || { werte: {} };
                        if (U[nr].auge) q.auge = await M.auge("pflanzen-dichte-s" + nr, U[nr].auge);
                        aus[nr] = q;
                    }
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: { auge: { ort: "wiese" } },
                        soll: [ohneZahl(D_ID, 1, "Ring-Bildanteil gegen Foto", "ringAbstand")],
                        auge: { pose: "stehend an der Mess-Wiese, Ego", vorbild: "Wiesenfoto (Ring-Bildanteil 2–5/5–10/10–20 m) und REF real-mischwald (Prüfer-Satz R11)" },
                        taeter: "stamm/vegetation-wiese.js (die Nah-Wiese und ihr Saum)",
                        unklar: "der Richter nennt keine Schwelle — Vorschlag: Ring-Bildanteil je Ring 2–5/5–10/10–20 m ±10 % gegen das Wiesenfoto, Bildpaar gegen REF ≤ 70 % (2AFC).",
                        gruen: { werte: { ringAbstand: 0.05 }, zeuge: { pflanzen: 300, fernsteM: 400, bilder: 60 } },
                        attrappen: [{ name: "der Ring ohne Bestand", roh: { werte: { ringAbstand: 0.05 }, zeuge: { pflanzen: 0 } } }],
                    },
                    2: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(D_ID, 2, "Ring-Bildanteil 20–40 m wie 0–20 m", { key: "wieseBisM", rel: "≥", zahl: 40, einheit: "m" })],
                        auge: { pose: "im Wald-Innern, gehend (heute: die Mess-Wiese)", vorbild: "Bildpaar Wald-innen gegen REF real-mischwald (Prüfer-Satz R11)" },
                        taeter: "stamm/vegetation-wiese.js (Saum der Nah-Wiese) + phyto-core.js FOREST_PACK (Stämme je ha)",
                        gruen: { werte: { wieseBisM: 45, staemmeJeHaWald: 500 }, zeuge: { pflanzen: 300, fernsteM: 400, bilder: 60 } },
                        attrappen: [{ name: "die Wiese bis 45 m ohne Bestand", roh: { werte: { wieseBisM: 45 }, zeuge: { pflanzen: 0 } } }],
                    },
                    3: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(D_ID, 3, "Pop-Zähler unter Bewegung = 0", { key: "pops", einheit: "Pops" }), K.soll(D_ID, 3, "Bildpaar 1 km", { key: "gangKm", rel: "≥", zahl: 1, einheit: "km" })],
                        auge: { pose: "gehend und fahrend über 1 km (Werkbank /gang)", vorbild: "Bildpaar 1 km gegen Foto (Prüfer-Satz R11)" },
                        taeter: "stamm/gelaende-fern.js (die Ferne als Kronen-Mittel) + stamm/vegetation-streu.js (die Reichweite der Streu)",
                        nicht: "jede Pflanze bis 1 km",
                        leser: "stamm/vegetation-streu.js:1603 _streuRegionInReichweite — keine einzelne Pflanze jenseits der Streu-Region",
                        // ZAHL (auge-klasse.cjs): die Station urteilt die Zahl, das Bild ist Beleg
                        zeuge: zeugeFrame,
                        gruen: { werte: { pops: 0, gangKm: 1.2, fernstePflanzeM: 1200 }, zeuge: { pflanzen: 300, fernsteM: 1200, bilder: 60 } },
                        attrappen: [{ name: "0 Pops ohne Gang", roh: { werte: { pops: 0 }, zeuge: { pflanzen: 0 } } }],
                    },
                    4: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(D_ID, 4, "Trefferquote ≤ 70 %", { key: "trefferProzent", einheit: "%" })],
                        auge: { pose: "Flug über die Mess-Wiese, Blick zum Kamm 10 km", vorbild: "Landschaftsfoto, Blindtest ≤ 70 % (R11)" },
                        taeter: "stamm/gelaende-fern.js (die Ferne bis camera.far)",
                        gruen: { werte: { trefferProzent: 62, sichtweiteM: 12000 }, zeuge: { pflanzen: 300, fernsteM: 400, bilder: 60 } },
                        attrappen: [{ name: "die Trefferquote ohne Bild", roh: { werte: { trefferProzent: 62 }, zeuge: { pflanzen: 0 } } }],
                    },
                    5: {
                        u: {},
                        soll: [
                            K.soll(D_ID, 5, "Lage- und Farbabweichung der Ziel-Pflanze 0", { key: "lageAbwM", einheit: "m" }),
                            K.soll(D_ID, 5, "Lage- und Farbabweichung der Ziel-Pflanze 0", { key: "farbAbw" }),
                        ],
                        zeuge: zeugeBestand,
                        zeugeText: "der Bestand nach Entfernung am Spieler",
                        taeter: "stamm/gelaende-fern.js (Kronen-Mittel statt adressierter Pflanze) + scripts/werkbank.cjs (kein Anflug)",
                        nicht: "kein Anflug 10 km → 1 m, keine adressierte Pflanze in der Ferne",
                        leser: "scripts/werkbank.cjs:2110 /bild — kein Flug 10 km → 1 m; stamm/gelaende-fern.js:5 _pruneDistantVoxelChunks — die Ferne trägt keine Kennung der Pflanze",
                        gruen: { werte: { lageAbwM: 0, farbAbw: 0 }, zeuge: { pflanzen: 300, fernsteM: 10000 } },
                        attrappen: [{ name: "0 m ohne Bestand", roh: { werte: { lageAbwM: 0, farbAbw: 0 }, zeuge: { pflanzen: 0 } } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(D_ID, 6, "Frame p95 ≤ 33 ms", { key: "p95Ms", einheit: "ms" }), K.soll(D_ID, 6, "Bildvergleich je Maßstab ≥ 0,7", { key: "bildVergleich" })],
                        zeuge: zeugeFrame,
                        zeugeText: "die Bilder der Welt am Stand gezählt",
                        taeter: "scripts/werkbank.cjs (kein Flug Orbit → Halm) + stamm/gelaende-fern.js",
                        nicht: "kein Flug Orbit → Halm",
                        leser: "scripts/werkbank.cjs:2110 /bild — keine Orbit-Pose, kein durchgehender Flug",
                        gruen: { werte: { p95Ms: 21, bildVergleich: 0.74 }, zeuge: { pflanzen: 300, bilder: 60 } },
                        attrappen: [{ name: "p95 aus dem Haushalt ohne Bild", roh: { werte: { p95Ms: 21, bildVergleich: 0.74 }, zeuge: { pflanzen: 300, bilder: 0 } } }],
                    },
                },
            },

            // ══ KRAFT (S2–S6): der EINE Wind unter Ruhe und Sturm (`__wetterSetzen`, zurückgestellt), der Bestand im Sturm, das Biegen ══
            [KR_ID]: {
                sek: 12,
                mutiert: true,
                pfad: ["stamm/stoff-material.js", "stamm/bild-himmel.js", "stamm/vegetation-*.js", "phyto-core.js", "foundry-core.js", "gelaende-core.js", "scripts/werkbank.cjs", "scripts/lib/ausgabe-aufnahme.cjs"],
                ungefahren: "die Luma-Reihen von Gras und Krone im Bild, der Durchgang gegen Video, der Sturm im Bild gegen Sturm-Video, Frame p95 im Sturm",
                mess: async function (H, U, M) {
                    const seite = (fn, A) => H.seite("return await (" + String(fn) + ")(r, T, " + JSON.stringify(A || {}) + ");");
                    let w = null;
                    let fehler = null;
                    try {
                        w = await seite(async function (r, T, A) {
                            const st = r.state;
                            const p = st.playerMesh.position;
                            const w0 = st.weather;
                            const reihe = (x, z) => {
                                const a = [];
                                let ms = 0;
                                let amp = 0;
                                for (let i = 0; i < A.n; i++) {
                                    const t = A.t0 + i * A.dt;
                                    const wd = r._windAt(x, z, t);
                                    a.push(wd.staerke * wd.boe);
                                    ms += wd.ms;
                                    const o = r._windWiegen(wd, 0.37, t, 1);
                                    amp = Math.max(amp, Math.hypot(o[0], o[1]));
                                }
                                return { a, ms: ms / A.n, amp };
                            };
                            const art = (t) => String(t || "").replace(/^grown_/, "").replace(/_v[0-9]+$/, "");
                            const stand = () => {
                                const m = {};
                                let tot = 0;
                                for (const e of st.architectures) {
                                    if (Math.hypot(e.position.x - p.x, e.position.z - p.z) > A.wurfM) continue;
                                    if (/gefallen/.test(e.type)) tot++;
                                    else if (/^baum_/.test(art(e._lodSpecies || e.type))) m[e.id] = [e.position.x, e.position.y, e.position.z, e.rotationY].map((v) => +(+v).toFixed(3)).join(",");
                                }
                                return { m, tot };
                            };
                            const d = r._windDirAt(A.t0);
                            const bx = p.x + d.x * A.abstandM;
                            const bz = p.z + d.z * A.abstandM;
                            let ruhe;
                            let sturmA;
                            let sturmB;
                            let feld = [];
                            let vor;
                            let nach;
                            let biege = 0;
                            try {
                                window.__wetterSetzen("sunny");
                                ruhe = reihe(p.x, p.z);
                                vor = stand();
                                window.__wetterSetzen("stormy");
                                sturmA = reihe(p.x, p.z);
                                sturmB = reihe(bx, bz);
                                for (let i = 0; i < 200; i++) feld.push(r._windAt(p.x + d.x * i * 50, p.z + d.z * i * 50, A.t0).ms);
                                await new Promise((ok) => setTimeout(ok, A.wurfMs));
                                nach = stand();
                                const wu = st.windUniforms;
                                const B = wu && wu.uBend && wu.uBend.value;
                                if (Array.isArray(B)) for (const v of B) if (v && (v.w || v.z)) biege++;
                            } finally {
                                window.__wetterSetzen(w0);
                            }
                            let geworfen = 0;
                            for (const k of Object.keys(vor.m)) if (k in nach.m && nach.m[k] !== vor.m[k]) geworfen++;
                            return { ruhe, sturmA, sturmB, feld, geworfen, baeume: Object.keys(vor.m).length, totVor: vor.tot, totNach: nach.tot, biege, zurueck: st.weather === w0, w0, dt: A.dt, abstandM: A.abstandM, phase: AnazhRealm.WIND_BOE.omega / AnazhRealm.WIND_BOE.k };
                        }, { n: 240, dt: 0.25, t0: 100, abstandM: 100, wurfM: 150, wurfMs: 2500 });
                    } catch (e) {
                        fehler = String((e && e.message) || e).slice(0, 200);
                    }
                    const aus = M.teil || {};
                    if (!w) {
                        for (const nr of Object.keys(U)) {
                            aus[nr] = { werte: {}, zeuge: { fehler } };
                            if (U[nr].auge) aus[nr].auge = await M.auge("pflanzen-kraft-s" + nr, U[nr].auge);
                        }
                        return { sprossen: aus };
                    }
                    const mittel = (v) => v.reduce((s, x) => s + x, 0) / Math.max(1, v.length);
                    const varz = (v) => {
                        const m = mittel(v);
                        return mittel(v.map((x) => (x - m) * (x - m)));
                    };
                    const korr = (a, b, L) => {
                        const x = a.slice(0, a.length - L);
                        const y = b.slice(L);
                        const mx = mittel(x);
                        const my = mittel(y);
                        let sxy = 0, sxx = 0, syy = 0;
                        for (let i = 0; i < x.length; i++) {
                            sxy += (x[i] - mx) * (y[i] - my);
                            sxx += (x[i] - mx) * (x[i] - mx);
                            syy += (y[i] - my) * (y[i] - my);
                        }
                        return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0;
                    };
                    let best = 0;
                    let bestR = -2;
                    for (let L = 0; L <= 80; L++) {
                        const k = korr(w.sturmA.a, w.sturmB.a, L);
                        if (k > bestR) (bestR = k), (best = L);
                    }
                    const lag = best * w.dt;
                    const soll = w.abstandM / Math.max(1e-6, w.sturmA.ms);
                    const fm = mittel(w.feld);
                    const fs = Math.sqrt(varz(w.feld));
                    let null0 = 0;
                    for (let i = 1; i < w.feld.length; i++) if ((w.feld[i] - fm) * (w.feld[i - 1] - fm) < 0) null0++;
                    const ampV = w.sturmA.amp / Math.max(1e-9, w.ruhe.amp);
                    const lastV = Math.pow(w.sturmA.ms / Math.max(1e-9, w.ruhe.ms), 2);
                    const zeuge = { proben: w.sturmA.a.length + w.sturmB.a.length + w.ruhe.a.length, sturmStaerke: mittel(w.sturmA.a), ruheStaerke: mittel(w.ruhe.a), streuung: Math.sqrt(varz(w.sturmA.a)), zurueck: w.zurueck };
                    const roh = {
                        2: { werte: { laufzeitAbw: (100 * Math.abs(lag - soll)) / soll, laufzeitS: lag, laufzeitWindS: soll, kreuzR: bestR, varianzVerh: varz(w.sturmA.a) / Math.max(1e-12, varz(w.ruhe.a)) }, zeuge },
                        3: { werte: { biegeSlots: w.biege, schneeLast: 0 }, zeuge, nicht: "Schnee beugt keinen Ast (kein Leser der Schnee-Last an der Krone); das Biegen am Körper trägt " + w.biege + " Slots" },
                        4: { werte: { geworfen: w.geworfen, baeume: w.baeume, totholzNeu: w.totNach - w.totVor, sturmMs: w.sturmA.ms }, zeuge, ...(w.geworfen + w.totNach - w.totVor === 0 ? { nicht: "im Sturm (" + w.sturmA.ms.toFixed(1) + " m/s) fiel keiner von " + w.baeume + " Bäumen — kein Windwurf, kein Astbruch" } : {}) },
                        5: { werte: { sturmfeldStreuungMs: fs, wellenlaengeM: null0 ? (2 * 200 * 50) / null0 : null, boeTempoMs: w.phase }, zeuge },
                        6: { werte: { biegungAbw: 100 * Math.abs(ampV / lastV - 1), planeten: 1 }, zeuge, nicht: "die Biegung liest weder Schwere noch Luftdichte (stamm/stoff-material.js _windWiegen) — kein zweiter Planet unter fremder Last" },
                    };
                    for (const nr of Object.keys(U)) {
                        const q = roh[nr] || { werte: {} };
                        if (U[nr].auge) q.auge = await M.auge("pflanzen-kraft-s" + nr, U[nr].auge);
                        aus[nr] = q;
                    }
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: {},
                        soll: [K.soll(KR_ID, 2, "Kreuzkorrelation Gras ↔ Krone mit Laufzeit ±20 %", { key: "laufzeitAbw", rel: "≤", zahl: 20, einheit: "%" })],
                        zeuge: zeugeWind,
                        zeugeText: "der EINE Wind an Gras und Krone 100 m windab, Ruhe ↔ Sturm, die Laufzeit gegen den mittleren Wind (Taylor 1938)",
                        taeter: "stamm/stoff-material.js _windAt (die Böe wandert mit ω/k, nicht mit dem Wind)",
                        gruen: { werte: { laufzeitAbw: 12 }, zeuge: { proben: 720, sturmStaerke: 1.1, ruheStaerke: 0.07, streuung: 0.3, zurueck: true } },
                        attrappen: [
                            { name: "die Laufzeit aus der Tafel ohne Sturm", roh: { werte: { laufzeitAbw: 12 }, zeuge: { proben: 720, sturmStaerke: 0.07, ruheStaerke: 0.07, streuung: 0.3, zurueck: true } } },
                            { name: "der Sturm bleibt stehen (Wetter nicht zurück)", roh: { werte: { laufzeitAbw: 12 }, zeuge: { proben: 720, sturmStaerke: 1.1, ruheStaerke: 0.07, streuung: 0.3, zurueck: false } } },
                        ],
                    },
                    3: {
                        u: { auge: { ort: "wiese" } },
                        soll: [ohneZahl(KR_ID, 3, "Bildreihe Durchgang gegen Video derselben Lage", "rueckstellS", "s")],
                        auge: { pose: "gehend durch Wiese und Gebüsch der Mess-Wiese (Werkbank /gang)", vorbild: "Video derselben Lage (Prüfer-Satz R11, die Schwelle fehlt dem Richter)" },
                        taeter: "stamm/stoff-material.js _tickGrasBend (Körper) + kein Leser der Schnee-Last",
                        nicht: "Schnee beugt keine Äste",
                        leser: "stamm/stoff-material.js:150 _windSwayOffset — kein Eingang für die Schnee-Last der Krone",
                        unklar: "der Richter nennt keine Schwelle — Vorschlag: Rückstellzeit des Halms nach dem Durchgang ±20 % gegen das Video (Zeitlupe derselben Lage).",
                        gruen: { werte: { rueckstellS: 1.2 }, zeuge: { proben: 720, sturmStaerke: 1.1, ruheStaerke: 0.07, streuung: 0.3, zurueck: true } },
                        attrappen: [{ name: "die Rückstellzeit ohne Gang", roh: { werte: { rueckstellS: 1.2 }, zeuge: { proben: 0 } } }],
                    },
                    4: {
                        u: { auge: { ort: "wiese" } },
                        soll: [ohneZahl(KR_ID, 4, "Anteil geworfener Bäume über Windstärke gegen Sturm-Statistik", "geworfenAnteil")],
                        auge: { pose: "im Sturm über 1 km² Wald (heute: die Mess-Wiese)", vorbild: "Sturm-Statistik (Windwurf über Windstärke und Wurzelboden; Prüfer-Satz R11, die Schwelle fehlt dem Richter)" },
                        taeter: "stamm/vegetation-baum.js (kein Windwurf: der Baum liest den Sturm nur als Wiegen)",
                        nicht: "kein Windwurf, kein Astbruch",
                        leser: "stamm/vegetation-baum.js:2660 tickArchitectures — kein Leser wirft einen Baum nach Windstärke und Wurzelboden",
                        unklar: "der Richter nennt keine Schwelle — Vorschlag: Anteil geworfener Bäume je Beaufort-Stufe ±25 % gegen die Sturm-Statistik (Lothar 1999).",
                        gruen: { werte: { geworfenAnteil: 0.08 }, zeuge: { proben: 720, sturmStaerke: 1.1, ruheStaerke: 0.07, streuung: 0.3, zurueck: true } },
                        attrappen: [{ name: "der Anteil ohne Sturm", roh: { werte: { geworfenAnteil: 0.08 }, zeuge: { proben: 0 } } }],
                    },
                    5: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(KR_ID, 5, "Trefferquote ≤ 60 %", { key: "trefferProzent", einheit: "%" })],
                        auge: { pose: "Flug im Sturm über Wald und Feld, 10 km", vorbild: "Sturm-Video, Blindtest ≤ 60 % (R11)" },
                        taeter: "phyto-core.js WIND_FELD (die Front) + stamm/stoff-material.js _windAt",
                        gruen: { werte: { trefferProzent: 55 }, zeuge: { proben: 720, sturmStaerke: 1.1, ruheStaerke: 0.07, streuung: 0.3, zurueck: true } },
                        attrappen: [{ name: "die Trefferquote ohne Sturm", roh: { werte: { trefferProzent: 55 }, zeuge: { proben: 0 } } }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(KR_ID, 6, "gleiche Art auf 3 Planeten", { key: "planeten", rel: "≥", einheit: "Planeten" }), K.soll(KR_ID, 6, "Biegung ∝ Last ±20 %", { key: "biegungAbw", rel: "≤", zahl: 20, einheit: "%" })],
                        zeuge: zeugeWind,
                        zeugeText: "das Wiegen am Ort unter Ruhe und Sturm gegen die Last ∝ v²",
                        taeter: "stamm/stoff-material.js _windWiegen (Biegung ∝ v, ohne Schwere und Luftdichte)",
                        nicht: "keine fremde Schwere, keine Luftdichte",
                        leser: "stamm/stoff-material.js:255 _windWiegen — kein Eingang für g und Luftdichte, die Weite wächst mit v statt mit der Last",
                        gruen: { werte: { planeten: 3, biegungAbw: 9 }, zeuge: { proben: 720, sturmStaerke: 1.1, ruheStaerke: 0.07, streuung: 0.3, zurueck: true } },
                        attrappen: [{ name: "3 Planeten ohne Wind", roh: { werte: { planeten: 3, biegungAbw: 9 }, zeuge: { proben: 0 } } }],
                    },
                },
            },
        },
    };
})());

// ── DIE PERSPEKTIVE leben.tiere (7 Leitern, 52 Sprossen; belegt: mensch S1 · masse S1 · verhalten S1 · wanderung S1 · lebenszyklus S1 —
// die Stationen FLUCHT_SITZUNG (g1.js), HERDE/VERHALTEN/KASKADE (g2.js)): die Tiere der Welt in der warmen Welt der Sitzung.
// Die Leser des Spiels: der Leib (stamm/kreatur-leben.js `spawnCreatureAt` · `removeCreature` · `damageCreature`, die Gattung
// `_kreaturGattung` stamm/studio-glieder.js), der Takt der Tiere wie im Sim-Schritt (stamm/dirigent-takt.js: `_kreaturStossSchritt` →
// `_trittDerLeiber` → `_leibKontakte`, dann `updateCreatures` stamm/kreatur-verhalten.js), der Bestand (`_bestandRegion` ·
// `_bestandNah` · `_bestandStirbt`), die Furcht (stamm/kreatur-furcht.js), der Verband (`_kreaturVerbinden`), der Gang (die Linse
// scripts/diag-tier-gang.cjs LAUF/SCHLUPF/gangart über H.quelle — die EINE Quelle der Gang-Messung), die gezeichneten Pools der Luft
// und des Wassers (`vogelPool` · `vogelSchwarmPool` · `fischPool` · `bestaeuberPool`), die Seele des Spielers (`applyPlayerSoul`
// stamm/koerper-fahrt.js), der Tritt (stamm/siedlung-wege.js `_tritt`, worldMeta.tritt), die Uhr (`_uhrSetzen`), die Jahreszeit
// (`setSeason`) und das Wetter (`window.__wetterSetzen`). Jede Leiter stellt am Ende zurück, was sie änderte (G.zurueck: Leiber,
// Spieler, Modus, Kappe, Wurf des Felds, Schwere, Uhr, Jahreszeit, Wetter, Tritt-Zellen, Regionen).
L.perspektive("tiere", (() => {
    const AR = "leben.tiere.arten";
    const BW = "leben.tiere.bewegung";
    const VH = "leben.tiere.verhalten";
    const LZ = "leben.tiere.lebenszyklus";
    const MA = "leben.tiere.masse";
    const WA = "leben.tiere.wanderung";
    const ME = "leben.tiere.mensch";
    const PFAD = [
        "tetrapoda-core.js",
        "koerper-core.js",
        "stamm/kreatur-*.js",
        "stamm/koerper-leib.js",
        "stamm/koerper-fahrt.js",
        "stamm/studio-glieder.js",
        "stamm/dirigent-takt.js",
        "stamm/siedlung-wege.js",
        "stamm/bild-himmel.js",
        "scripts/diag-tier-gang.cjs",
        "scripts/werkbank.cjs",
    ];
    // DER ZEUGE DER WELT: N Antworten der Welt (Leiber, Läufe, Takte …) mit Streuung > 0; mit `aenderung` dazu vor ≠ nach (die Welt hat
    // sich beobachtbar geändert, beim Gegenlauf R7 verschwindet die Wirkung)
    const zeugeWelt = (min, aenderung) => (roh) => {
        const z = roh.zeuge || {};
        if (!(z.antworten >= min)) return "nur " + (z.antworten || 0) + " Antworten der Welt (Soll ≥ " + min + ")";
        if (!(z.streuung > 0)) return "die Antworten tragen keine Streuung (eine Konstante, nicht die Welt)";
        if (aenderung && !(z.vor !== undefined && z.nach !== undefined && z.vor !== z.nach)) return "die Welt änderte sich nicht (vor " + z.vor + " = nach " + z.nach + ")";
        return null;
    };
    const gut = (werte, n, extra) => ({ werte, zeuge: Object.assign({ antworten: n, streuung: 1.7, vor: 0, nach: 1 }, extra || {}) });
    const flach = (werte) => ({ werte, zeuge: { antworten: 0, streuung: 0 } });
    const konstant = (werte, n) => ({ werte, zeuge: { antworten: n, streuung: 0, vor: 0, nach: 1 } });
    const still = (werte, n) => ({ werte, zeuge: { antworten: n, streuung: 1.7, vor: 3, nach: 3 } });
    // die Attrappen je Sprosse: der Wortlaut ohne Antwort der Welt, als Konstante, ohne Änderung
    const atr = (werte, n, aenderung) => [
        { name: "die Zahl ohne Antwort der Welt (eine Tabelle)", roh: flach(werte) },
        { name: "die Zahl als Konstante (keine Streuung)", roh: konstant(werte, n) },
        ...(aenderung ? [{ name: "die Welt änderte sich nicht (vor = nach)", roh: still(werte, n) }] : []),
    ];
    const AUGE_ORT = { ort: "wiese" };
    return {
        leitern: {
            // ═══ ARTEN: wie viele unterscheidbare Arten die Welt in allen Medien trägt — gezählt im Spielgang an drei Biomen ═══
            [AR]: {
                sek: 30,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "die Klassen-Maske des Bilds (/bild --klasse) und die Bilder der Auge-Sprossen S2–S4, S6, S8 — headless zählt die Probe die projizierte Leib-Box (1920 × 1080)",
                mess: async function (H, U, M) {
                    const grund = function (r, T) {
                        const s = r.state;
                        const A = r.constructor;
                        const pm = s.playerMesh.position;
                        const fl = s.faunaLifecycle;
                        const wm = s.worldMeta;
                        const alt = { p: pm.clone(), yaw: s.yaw, pitch: s.pitch, modus: r.getGameMode(), max: s.maxCreatures, wurf: fl ? fl.lastTick : null, vor: new Set(s.creatures), perf: s.perfRegulator, grav: s.gravity, tod: s.timeOfDay, wetter: s.weather, season: s.season, tritt: new Set(Object.keys((wm && wm.tritt) || {})), schwach: new Set((r._trittSchwach || new Map()).keys()), reg: new Set(Object.keys(r._bestandRegionen().regionen)), lf: s.lifeField ? new Map([...s.lifeField].map(([k, e]) => [k, Object.assign({}, e)])) : null, seele: s.player && s.player.soul };
                        const RUHE = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
                        const flicken = [];
                        const flick = (n, f) => {
                            if (Object.prototype.hasOwnProperty.call(r, n)) throw new Error("flick: " + n + " trägt schon eine eigene Zeile");
                            flicken.push(n);
                            r[n] = f;
                        };
                        let t = performance.now();
                        const welt = (n) => {
                            s.perfRegulator = false;
                            for (let i = 0; i < n; i++) r._gameLoopTick((t += 1000 / 60));
                        };
                        const takt = (n, d) => {
                            for (let i = 0; i < n; i++) {
                                r._kreaturStossSchritt(d || 1 / 60);
                                r._trittDerLeiber();
                                r._leibKontakte();
                                r.updateCreatures(d || 1 / 60);
                            }
                        };
                        const boden = (x, z) => r.getTerrainHeightAt(x, z) + 0.5;
                        const ab = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const ruhig = (c) => (c.userData.emotions = Object.assign({}, RUHE));
                        const ruhigSpieler = () => s.player.emotions && Object.assign(s.player.emotions, RUHE);
                        const trocken = (x, z) => r._landAt(x, z) && !r._nassAt(x, z) && !(typeof r._imGrundriss === "function" && r._imGrundriss(x, z));
                        const land = (x0, z0, R, dMin) => {
                            for (let d = dMin || 0; d <= 600; d += 15) {
                                const n = Math.max(1, Math.round(d / 10));
                                for (let q = 0; q < n; q++) {
                                    const w = (q / n) * 2 * Math.PI;
                                    const x = x0 + Math.cos(w) * d;
                                    const z = z0 + Math.sin(w) * d;
                                    let ok = trocken(x, z);
                                    for (let k = 0; ok && k < 8; k++) ok = trocken(x + Math.cos(k * 0.785) * R, z + Math.sin(k * 0.785) * R);
                                    if (ok) return { x, z };
                                }
                            }
                            return null;
                        };
                        const tier = (x, z, seele, bs) => {
                            s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 2);
                            let nein = null;
                            const c = r.spawnCreatureAt(x, boden(x, z), z, "happy", seele, { precise: true, bodySize: bs || 1, absage: (g) => (nein = g) });
                            if (!c) throw new Error("spawnCreatureAt " + seele + ": " + nein);
                            ruhig(c);
                            return c;
                        };
                        const stelle = (x, z) => {
                            pm.set(x, r.getTerrainHeightAt(x, z) + A.PLAYER_FOOT_OFFSET, z);
                            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                        };
                        const stillFeld = () => {
                            if (fl) fl.lastTick = 1e12;
                        };
                        const zurueck = () => {
                            for (const n of flicken.splice(0)) delete r[n];
                            if (s.player && alt.seele && s.player.soul !== alt.seele) r.applyPlayerSoul(alt.seele);
                            for (const c of [...s.creatures]) if (!alt.vor.has(c)) r.removeCreature(c);
                            s.maxCreatures = alt.max;
                            if (fl) fl.lastTick = alt.wurf;
                            if (r.getGameMode() !== alt.modus) r.setGameMode(alt.modus);
                            pm.copy(alt.p);
                            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                            [s.yaw, s.pitch, s.perfRegulator, s.gravity] = [alt.yaw, alt.pitch, alt.perf, alt.grav];
                            if (s.season !== alt.season) r.setSeason(alt.season);
                            if (Math.abs(s.timeOfDay - alt.tod) > 1e-6) r._uhrSetzen(alt.tod, "regler");
                            if (s.weather !== alt.wetter && window.__wetterSetzen) window.__wetterSetzen(alt.wetter);
                            if (wm && wm.tritt) for (const k of Object.keys(wm.tritt)) if (!alt.tritt.has(k)) delete wm.tritt[k];
                            if (r._trittSchwach) for (const k of [...r._trittSchwach.keys()]) if (!alt.schwach.has(k)) r._trittSchwach.delete(k);
                            const F = r._bestandRegionen().regionen;
                            for (const k of Object.keys(F)) if (!alt.reg.has(k)) delete F[k];
                            if (alt.lf && s.lifeField) {
                                for (const k of [...s.lifeField.keys()]) if (!alt.lf.has(k)) s.lifeField.delete(k);
                                for (const [k, e] of alt.lf) {
                                    const n = s.lifeField.get(k);
                                    if (n) Object.assign(n, e);
                                    else s.lifeField.set(k, e);
                                }
                            }
                        };
                        return { s, A, pm, fl, wm, alt, RUHE, flick, welt, takt, boden, ab, r3, ruhig, ruhigSpieler, trocken, land, tier, stelle, stillFeld, zurueck };
                    };
                    const lauf = (fn, a) => H.seite("const G = (" + grund + ")(r, T); try { return await (" + fn + ")(r, T, " + JSON.stringify(a || {}) + ", G); } finally { G.zurueck(); }");
                    // DER SPIELGANG: drei Orte verschiedener Boden-Klasse (`_bodenKlasseAt`, die Klasse des Lebensraums) um den Spieler, je Ort
                    // der Takt des Spiels (`_gameLoopTick`), dann je Ort 8 Blicke (1920 × 1080, das fov der Kamera) über die gezeichneten Leiber:
                    // die Tiere (Leib oder Feld) und die Pools der Luft und des Wassers — je Art die Box ≥ minPx im Bild; dazu die Angetroffenen
                    // im Umkreis (Chao1, Massen-Dekaden, Nische) und die Duplikate (gleiche Gestalt, Maßstab ±5 %)
                    const zensus = async function (r, T, a, G) {
                        const { s, A, pm, welt, r3, trocken, stelle, alt } = G;
                        const LG = A._lebensraumGesetz();
                        const [W, HH] = [1920, 1080];
                        const K = new T.PerspectiveCamera(s.camera.fov || 75, W / HH, 0.1, 4000);
                        const v = new T.Vector3();
                        const m4 = new T.Matrix4();
                        const px = (bx) => {
                            let [x0, y0, x1, y1] = [Infinity, Infinity, -Infinity, -Infinity];
                            for (let i = 0; i < 8; i++) {
                                v.set(i & 1 ? bx.max.x : bx.min.x, i & 2 ? bx.max.y : bx.min.y, i & 4 ? bx.max.z : bx.min.z).project(K);
                                if (!(v.z > -1 && v.z < 1)) return 0;
                                [x0, x1, y0, y1] = [Math.min(x0, v.x), Math.max(x1, v.x), Math.min(y0, v.y), Math.max(y1, v.y)];
                            }
                            [x0, x1, y0, y1] = [Math.max(x0, -1), Math.min(x1, 1), Math.max(y0, -1), Math.min(y1, 1)];
                            return x1 > x0 && y1 > y0 ? ((x1 - x0) / 2) * W * (((y1 - y0) / 2) * HH) : 0;
                        };
                        const sig = (c) => {
                            const t = [];
                            c.traverse((o) => {
                                if (!o.isMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
                                const p = o.geometry.attributes.position.array;
                                let h = p.length;
                                for (let i = 0; i < p.length; i += 7) h = (h * 31 + Math.round(p[i] * 1000)) % 1000000007;
                                t.push(h + ":" + (o.material && o.material.color ? o.material.color.getHexString() : "-"));
                            });
                            return t.sort().join("|");
                        };
                        const masse = (c) => {
                            try {
                                return r._leibMasse(c);
                            } catch (_e) {
                                return null;
                            }
                        };
                        const POOLS = { vogelPool: ["singvogel", "luft"], vogelSchwarmPool: ["star", "luft"], fischPool: ["forelle", "wasser"], bestaeuberPool: ["hummel", "luft"] };
                        const leiber = () => {
                            const L = [];
                            for (const c of s.creatures) {
                                const b = new T.Box3().setFromObject(c);
                                if (b.isEmpty()) continue;
                                L.push({ art: r._kreaturGattung(c), medium: "land", box: b, kg: masse(c), x: c.position.x, z: c.position.z, sig: sig(c), sc: c.scale.x });
                            }
                            for (const k of Object.keys(POOLS)) {
                                const m = s[k] && s[k].mesh;
                                if (!m || !m.count) continue;
                                if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
                                m.updateMatrixWorld(true);
                                for (let i = 0; i < m.count; i++) {
                                    m.getMatrixAt(i, m4);
                                    m4.premultiply(m.matrixWorld);
                                    const b = m.geometry.boundingBox.clone().applyMatrix4(m4);
                                    const g = b.getSize(new T.Vector3());
                                    if (!(g.x > 0 && g.y > 0 && g.z > 0)) continue;
                                    L.push({ art: POOLS[k][0], medium: POOLS[k][1], box: b, kg: g.x * g.y * g.z * 1000 * 0.52, x: (b.min.x + b.max.x) / 2, z: (b.min.z + b.max.z) / 2, sig: k, sc: Math.cbrt(g.x * g.y * g.z) });
                                }
                            }
                            return L;
                        };
                        if (window.__wetterSetzen) window.__wetterSetzen("sunny");
                        r._uhrSetzen(0.42, "regler");
                        const KL = ["fluss", "hang", "wald", "waldrand", "wiese"];
                        const orte = [];
                        const da = new Set();
                        for (let d = 0; d <= 1500 && orte.length < 3; d += 60) {
                            const n = Math.max(1, Math.round(d / 40));
                            for (let q = 0; q < n && orte.length < 3; q++) {
                                const w = (q / n) * 2 * Math.PI;
                                const [x, z] = [alt.p.x + Math.cos(w) * d, alt.p.z + Math.sin(w) * d];
                                if (!trocken(x, z)) continue;
                                const kl = r._bodenKlasseAt(x, z);
                                if (!KL.includes(kl) || da.has(kl)) continue;
                                da.add(kl);
                                orte.push({ x, z, kl });
                            }
                        }
                        const [imBild, angetroffen, kg, nische, dupl, pxAlle, jeOrt] = [{}, {}, [], [0, 0], [0, 0], [], []];
                        let [n, takte] = [0, 0];
                        for (const o of orte) {
                            stelle(o.x, o.z);
                            welt(a.takte);
                            takte += a.takte;
                            const L = leiber();
                            const y = pm.y + 1.6;
                            const hier = new Set();
                            K.updateProjectionMatrix();
                            for (let h = 0; h < 8; h++) {
                                K.position.set(pm.x, y, pm.z);
                                K.lookAt(pm.x + Math.sin((h * Math.PI) / 4) * 10, y, pm.z + Math.cos((h * Math.PI) / 4) * 10);
                                K.updateMatrixWorld(true);
                                for (const l of L) {
                                    const p = px(l.box);
                                    if (p > 0) pxAlle.push(p);
                                    if (p >= a.minPx) {
                                        hier.add(l.art);
                                        imBild[l.art] = (imBild[l.art] || 0) + 1;
                                    }
                                }
                            }
                            const je = {};
                            for (const l of L) {
                                (je[l.art] = je[l.art] || []).push(l);
                                if (Math.hypot(l.x - pm.x, l.z - pm.z) > a.nahM) continue;
                                n++;
                                angetroffen[l.art] = (angetroffen[l.art] || 0) + 1;
                                if (Number.isFinite(l.kg) && l.kg > 0) kg.push(l.kg);
                                if (l.medium === "land" && LG.L.gattung[l.art]) {
                                    nische[1]++;
                                    if (LG.lebensraum(l.art, r._bodenKlasseAt(l.x, l.z), LG.L) > 0) nische[0]++;
                                }
                            }
                            for (const g of Object.values(je))
                                for (let i = 0; i < g.length; i++)
                                    for (let j = i + 1; j < g.length; j++) {
                                        dupl[1]++;
                                        if (g[i].sig === g[j].sig && Math.abs(g[i].sc / g[j].sc - 1) < 0.05) dupl[0]++;
                                    }
                            jeOrt.push({ kl: o.kl, x: Math.round(o.x), z: Math.round(o.z), leiber: L.length, arten: [...hier] });
                        }
                        const F = Object.values(angetroffen);
                        const [f1, f2] = [F.filter((x) => x === 1).length, F.filter((x) => x === 2).length];
                        const chao1 = F.length + (f2 > 0 ? (f1 * f1) / (2 * f2) : (f1 * (f1 - 1)) / 2);
                        // die Massen-Dekaden der Angetroffenen gegen die Erde (Artenzahl je Dekade ∝ M^−0,5 über dem Gipfel, Siemann et al.
                        // 1996): der größte Faktor zwischen gemessenem und erwartetem Anteil je besetzter Dekade des Bands
                        let massenFaktor = null;
                        if (kg.length) {
                            const dek = kg.map((x) => Math.floor(Math.log10(x)));
                            const [d0, d1] = [Math.min(...dek), Math.max(...dek)];
                            const ref = [];
                            for (let d = d0; d <= d1; d++) ref.push(Math.pow(10, -0.5 * d));
                            const sr = ref.reduce((x, y) => x + y, 0);
                            massenFaktor = 1;
                            for (let d = d0; d <= d1; d++) {
                                const ist = dek.filter((x) => x === d).length / dek.length;
                                const soll = ref[d - d0] / sr;
                                const da = Math.max(ist, 0.5 / dek.length);
                                massenFaktor = Math.max(massenFaktor, da / soll, soll / da);
                            }
                        }
                        const mittel = pxAlle.reduce((x, y) => x + y, 0) / Math.max(1, pxAlle.length);
                        const katalog = { land: (A.CREATURE_SOUL_NAMES || []).length, luft: ["vogelPool", "vogelSchwarmPool", "bestaeuberPool"].filter((k) => s[k]).length, wasser: ["fischPool"].filter((k) => s[k]).length };
                        return {
                            orte: jeOrt,
                            biome: orte.length,
                            arten: Object.keys(imBild).length,
                            imBild,
                            angetroffen,
                            n,
                            chao1: r3(chao1),
                            massenFaktor: r3(massenFaktor),
                            kgMin: r3(Math.min(...kg)),
                            kgMax: r3(Math.max(...kg)),
                            nische: nische[1] ? r3(nische[0] / nische[1]) : null,
                            nischeN: nische[1],
                            duplProzent: dupl[1] ? r3((100 * dupl[0]) / dupl[1]) : null,
                            paare: dupl[1],
                            pxStreu: r3(Math.sqrt(pxAlle.reduce((x, y) => x + (y - mittel) * (y - mittel), 0) / Math.max(1, pxAlle.length))),
                            leiber: pxAlle.length,
                            spielStunden: r3((takte / 60 / (60 * A.DAY_LENGTH_DEFAULT_MINUTES)) * 24),
                            katalog,
                            artenWelt: katalog.land + katalog.luft + katalog.wasser,
                        };
                    };
                    const z = await lauf(zensus, { takte: 40, minPx: 200, nahM: 150 });
                    const augeNoetig = Object.keys(U).some((nr) => U[nr].auge);
                    const auge = augeNoetig ? await M.auge("tiere-arten", U[Object.keys(U).find((nr) => U[nr].auge)].auge) : undefined;
                    const zeuge = { antworten: z.leiber, streuung: z.pxStreu, vor: 0, nach: z.biome, biome: z.biome };
                    const welt = "die Welt trägt " + z.artenWelt + " Arten (Land " + z.katalog.land + ", Luft " + z.katalog.luft + ", Wasser " + z.katalog.wasser + ")";
                    const aus = M.teil || {};
                    const nimm = (nr, werte, nicht, mitAuge) => {
                        if (!U[nr]) return;
                        aus[nr] = { werte, zeuge, ...(mitAuge ? { auge } : {}), ...(nicht ? { nicht } : {}) };
                    };
                    nimm(1, { arten: z.arten, minPx: 200, spielStunden: z.spielStunden, biome: z.biome }, z.biome < 3 ? "nur " + z.biome + " Biome um den Spieler gefunden" : null);
                    nimm(2, { duplProzent: z.duplProzent }, z.artenWelt < 100 ? welt + " statt 10² aus dem Samen; jedes Individuum gleicht dem anderen bis auf den Maßstab (Duplikate " + z.duplProzent + " % von " + z.paare + " Paaren)" : null, true);
                    nimm(3, { arten: z.artenWelt }, z.artenWelt < 1000 ? welt + " statt 10³ in allen Wirbeltier-Klassen (nur Säuger, Vögel, Fisch)" : null, true);
                    nimm(4, { arten: z.artenWelt }, welt + " statt 10⁴; kein Gliederfüßer außer der Hummel, kein Weichtier, kein Nesseltier", true);
                    nimm(5, { chao1: z.chao1, massenFaktor: z.massenFaktor }, welt + ": Chao1 der Angetroffenen " + z.chao1 + " statt 10⁵");
                    nimm(6, { chao1: z.chao1, nische: z.nische }, welt + ": Chao1 " + z.chao1 + " statt 10⁶", true);
                    nimm(7, { chao1: z.chao1 }, welt + " je Planet (die Seelen-Liste liest keinen Samen): Chao1 " + z.chao1 + " statt 10⁷, keine zweite Fauna");
                    nimm(8, { duplProzent: z.duplProzent }, "keine fremde Saat und keine Fauna aus fremder Schwere, Atmosphäre, Chemie; Duplikate " + z.duplProzent + " %", true);
                    return { sprossen: aus, zensus: z };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [
                            K.soll(AR, 1, "≥ 5 Arten im Bild", { key: "arten", einheit: "Arten" }),
                            K.soll(AR, 1, "Klassen-Maske ≥ 200 px", { key: "minPx", einheit: "px" }),
                            K.soll(AR, 1, "Spielgang 1 h an 3 Biomen", { rel: "≥", zahl: 1, key: "spielStunden", einheit: "Spielstunden" }),
                            K.soll(AR, 1, "Spielgang 1 h an 3 Biomen", { rel: "≥", zahl: 3, key: "biome", einheit: "Biome" }),
                        ],
                        zeuge: zeugeWelt(5, true),
                        taeter: "stamm/kreatur-leben.js spawnCreatureAt / die Pools der Luft und des Wassers (stamm/kreatur-fauna.js)",
                        unklar: "1 h Spielgang passt in keinen Deckel ≤ 60 s: die Probe fährt 3 Biome × 40 Takte × 8 Blicke und urteilt die Stunde streng (ROT bis ein Zeitraffer des Gangs sie trägt).",
                        gruen: gut({ arten: 6, minPx: 200, spielStunden: 1, biome: 3 }, 120, { biome: 3 }),
                        attrappen: atr({ arten: 6, minPx: 200, spielStunden: 1, biome: 3 }, 120, true),
                    },
                    2: {
                        u: { auge: AUGE_ORT },
                        soll: [K.soll(AR, 2, "Blind-Panel „echt möglich“ ≥ 0,7", { key: "panel" }), K.soll(AR, 2, "kein Paar im Bild-Embedding näher als zwei Fotos desselben realen Tiers", { rel: "≤", zahl: 1, key: "duplProzent", refQuelle: "die Duplikat-Schwelle von Sprosse 8 (≤ 1 %): ein Paar gleicher Gestalt und Größe ist näher als zwei Fotos eines Tiers", einheit: "%" })],
                        auge: { pose: "Ego auf eine Herde von 20 aus 10 m (heute: die Wiese)", vorbild: "Fotos realer Tiere je Art; Blind-Panel „echt möglich“ ≥ 0,7, Bild-Embedding der Herde" },
                        taeter: "tetrapoda-core.js GESTALTEN_JE_REZEPT = 1 (ein Leib je Gattung)",
                        nicht: "8 Leib-Typen statt 10² Arten; jedes Individuum gleicht dem anderen bis auf den Maßstab",
                        leser: "tetrapoda-core.js:39 — GESTALTEN_JE_REZEPT = 1: kein Individuum (Alter, Geschlecht, Fell, Narbe) trägt eine eigene Gestalt",
                        gruen: gut({ panel: 0.8, duplProzent: 0 }, 50),
                        attrappen: atr({ panel: 0.8, duplProzent: 0 }, 50),
                    },
                    3: {
                        u: { auge: AUGE_ORT },
                        soll: [K.soll(AR, 3, "je Klasse Panel ≥ 0,7", { key: "panel" }), K.soll(AR, 3, "Schlankheit ↔ Reisetempo Rangkorrelation ≥ 0,6", { key: "rang" })],
                        auge: { pose: "Ego auf ein Riff mit ≥ 30 Arten (heute: die Wiese)", vorbild: "Fotos je Wirbeltier-Klasse; Panel ≥ 0,7" },
                        taeter: "stamm/kreatur-leben.js CREATURE_SOUL_NAMES (4 Säuger-Seelen)",
                        nicht: "10³ Arten aller Wirbeltier-Klassen — die Welt trägt Säuger, Vögel, einen Fisch",
                        leser: "stamm/kreatur-leben.js:3622 — CREATURE_SOUL_NAMES aus CREATURE_SOULS von Hand, kein Leser erzeugt Arten aus dem Samen",
                        gruen: gut({ panel: 0.8, rang: 0.7 }, 50),
                        attrappen: atr({ panel: 0.8, rang: 0.7 }, 50),
                    },
                    4: {
                        u: { auge: AUGE_ORT },
                        soll: [K.soll(AR, 4, "Makro-Bildpaar gegen Foto-Korpus Panel ≥ 0,7", { key: "panel" }), K.soll(AR, 4, "Klassifikator ordnet Tiefenzone ≥ 80 %", { key: "tiefenzone", einheit: "%" })],
                        auge: { pose: "Makro 0,2 m an einem Gliederfüßer (heute: die Wiese)", vorbild: "Foto-Korpus Makro; Panel ≥ 0,7" },
                        taeter: "tetrapoda-core.js BESTAEUBER_GESETZ (die Hummel als einziger Gliederfüßer)",
                        nicht: "10⁴ Arten mit Gliederfüßern, Weichtieren, Nesseltieren",
                        leser: "tetrapoda-core.js:2908 — BESTAEUBER_GESETZ trägt einen Leib; kein Leser baut Chitin, Facettenauge, Tentakel",
                        gruen: gut({ panel: 0.8, tiefenzone: 85 }, 50),
                        attrappen: atr({ panel: 0.8, tiefenzone: 85 }, 50),
                    },
                    5: {
                        u: {},
                        soll: [K.soll(AR, 5, "Chao1 der angetroffenen Arten ≥ 10⁵", { key: "chao1" }), K.soll(AR, 5, "Häufigkeit je Massen-Dekade der Angetroffenen gegen die reale Verteilung ≤ Faktor 2", { key: "massenFaktor" })],
                        zeuge: zeugeWelt(5, true),
                        taeter: "stamm/kreatur-leben.js CREATURE_SOUL_NAMES (kein Artbildner)",
                        nicht: "10⁵ Arten — die Welt trägt 8",
                        leser: "stamm/kreatur-leben.js:3622 — CREATURE_SOUL_NAMES: kein Leser bildet Arten aus dem Samen",
                        gruen: gut({ chao1: 120000, massenFaktor: 1.6 }, 1000),
                        attrappen: atr({ chao1: 120000, massenFaktor: 1.6 }, 1000, true),
                    },
                    6: {
                        u: { auge: AUGE_ORT },
                        soll: [
                            K.soll(AR, 6, "Chao1 ≥ 10⁶", { key: "chao1" }),
                            K.soll(AR, 6, "2AFC gegen den Foto-Korpus ≤ 70 %", { key: "afc", einheit: "%" }),
                            K.soll(AR, 6, "in ihrer Nische angetroffen ≥ 0,9", { key: "nische" }),
                            K.soll(AR, 6, "paarweise trennbar ≥ 95 %", { key: "trennbar", einheit: "%" }),
                        ],
                        auge: { pose: "Ego an 1 000 angetroffenen Arten (heute: die Wiese)", vorbild: "Foto-Korpus je Art; 2AFC ≤ 70 %" },
                        taeter: "stamm/kreatur-leben.js CREATURE_SOUL_NAMES (kein Artbildner)",
                        nicht: "10⁶ Arten je Planet — die Welt trägt 8",
                        leser: "stamm/kreatur-leben.js:3622 — CREATURE_SOUL_NAMES: kein Leser bildet Arten aus dem Samen",
                        gruen: gut({ chao1: 2e6, afc: 60, nische: 0.95, trennbar: 97 }, 1000),
                        attrappen: atr({ chao1: 2e6, afc: 60, nische: 0.95, trennbar: 97 }, 1000),
                    },
                    7: {
                        u: {},
                        soll: [K.soll(AR, 7, "Chao1 je Planet ≥ 10⁷", { key: "chao1" }), K.soll(AR, 7, "Faunen paarweise im Bild-Embedding trennbar ≥ 0,95", { key: "trennbar" })],
                        zeuge: zeugeWelt(5, true),
                        taeter: "stamm/kreatur-leben.js CREATURE_SOUL_NAMES (eine Fauna für jeden Samen)",
                        nicht: "10⁷ Arten je Planet und eine eigene Fauna je Same",
                        leser: "stamm/kreatur-leben.js:3622 — CREATURE_SOUL_NAMES liest keinen Samen: jede Saat trägt dieselben 4 Seelen",
                        gruen: gut({ chao1: 2e7, trennbar: 0.97 }, 1000),
                        attrappen: atr({ chao1: 2e7, trennbar: 0.97 }, 1000, true),
                    },
                    8: {
                        u: { auge: AUGE_ORT },
                        soll: [K.soll(AR, 8, "im Bild ununterscheidbare Duplikate ≤ 1 %", { key: "duplProzent", einheit: "%" }), K.soll(AR, 8, "100 fremde Saaten", { rel: "≥", zahl: 100, key: "saaten" })],
                        auge: { pose: "Ego an den angetroffenen Arten fremder Saaten (heute: die Wiese)", vorbild: "Fremdwelt-Probe R10 (Prüfer-Satz R11)" },
                        taeter: "tetrapoda-core.js GESTALTEN_JE_REZEPT = 1 (Duplikate)",
                        nicht: "keine fremde Saat, keine Fauna aus fremder Schwere, Atmosphäre, Chemie",
                        leser: "tetrapoda-core.js:39 — GESTALTEN_JE_REZEPT = 1; stamm/kreatur-leben.js:3622 — die Seelen lesen keine Schwere, keine Atmosphäre",
                        gruen: gut({ duplProzent: 0.5, saaten: 100 }, 1000),
                        attrappen: atr({ duplProzent: 0.5, saaten: 100 }, 1000),
                    },
                },
            },
            // ═══ BEWEGUNG: der Gang aus dem Leib — die Linse LAUF (scripts/diag-tier-gang.cjs) in der Welt der Sitzung ═══
            [BW]: {
                sek: 25,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "die Third-Aufnahme im Fenster (S1), das Ausgabe-Bild (S2) und die Bilder der Auge-Sprossen S3, S5 — headless misst die Probe die Füße am Knochen",
                mess: async function (H, U, M) {
                    const grund = function (r, T) {
                        const s = r.state;
                        const A = r.constructor;
                        const pm = s.playerMesh.position;
                        const fl = s.faunaLifecycle;
                        const wm = s.worldMeta;
                        const alt = { p: pm.clone(), yaw: s.yaw, pitch: s.pitch, modus: r.getGameMode(), max: s.maxCreatures, wurf: fl ? fl.lastTick : null, vor: new Set(s.creatures), perf: s.perfRegulator, grav: s.gravity, tod: s.timeOfDay, wetter: s.weather, season: s.season, tritt: new Set(Object.keys((wm && wm.tritt) || {})), schwach: new Set((r._trittSchwach || new Map()).keys()), reg: new Set(Object.keys(r._bestandRegionen().regionen)), lf: s.lifeField ? new Map([...s.lifeField].map(([k, e]) => [k, Object.assign({}, e)])) : null, seele: s.player && s.player.soul };
                        const RUHE = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
                        const flicken = [];
                        const flick = (n, f) => {
                            if (Object.prototype.hasOwnProperty.call(r, n)) throw new Error("flick: " + n + " trägt schon eine eigene Zeile");
                            flicken.push(n);
                            r[n] = f;
                        };
                        let t = performance.now();
                        const welt = (n) => {
                            s.perfRegulator = false;
                            for (let i = 0; i < n; i++) r._gameLoopTick((t += 1000 / 60));
                        };
                        const takt = (n, d) => {
                            for (let i = 0; i < n; i++) {
                                r._kreaturStossSchritt(d || 1 / 60);
                                r._trittDerLeiber();
                                r._leibKontakte();
                                r.updateCreatures(d || 1 / 60);
                            }
                        };
                        const boden = (x, z) => r.getTerrainHeightAt(x, z) + 0.5;
                        const ab = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const ruhig = (c) => (c.userData.emotions = Object.assign({}, RUHE));
                        const ruhigSpieler = () => s.player.emotions && Object.assign(s.player.emotions, RUHE);
                        const trocken = (x, z) => r._landAt(x, z) && !r._nassAt(x, z) && !(typeof r._imGrundriss === "function" && r._imGrundriss(x, z));
                        const land = (x0, z0, R, dMin) => {
                            for (let d = dMin || 0; d <= 600; d += 15) {
                                const n = Math.max(1, Math.round(d / 10));
                                for (let q = 0; q < n; q++) {
                                    const w = (q / n) * 2 * Math.PI;
                                    const x = x0 + Math.cos(w) * d;
                                    const z = z0 + Math.sin(w) * d;
                                    let ok = trocken(x, z);
                                    for (let k = 0; ok && k < 8; k++) ok = trocken(x + Math.cos(k * 0.785) * R, z + Math.sin(k * 0.785) * R);
                                    if (ok) return { x, z };
                                }
                            }
                            return null;
                        };
                        const tier = (x, z, seele, bs) => {
                            s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 2);
                            let nein = null;
                            const c = r.spawnCreatureAt(x, boden(x, z), z, "happy", seele, { precise: true, bodySize: bs || 1, absage: (g) => (nein = g) });
                            if (!c) throw new Error("spawnCreatureAt " + seele + ": " + nein);
                            ruhig(c);
                            return c;
                        };
                        const stelle = (x, z) => {
                            pm.set(x, r.getTerrainHeightAt(x, z) + A.PLAYER_FOOT_OFFSET, z);
                            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                        };
                        const stillFeld = () => {
                            if (fl) fl.lastTick = 1e12;
                        };
                        const zurueck = () => {
                            for (const n of flicken.splice(0)) delete r[n];
                            if (s.player && alt.seele && s.player.soul !== alt.seele) r.applyPlayerSoul(alt.seele);
                            for (const c of [...s.creatures]) if (!alt.vor.has(c)) r.removeCreature(c);
                            s.maxCreatures = alt.max;
                            if (fl) fl.lastTick = alt.wurf;
                            if (r.getGameMode() !== alt.modus) r.setGameMode(alt.modus);
                            pm.copy(alt.p);
                            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                            [s.yaw, s.pitch, s.perfRegulator, s.gravity] = [alt.yaw, alt.pitch, alt.perf, alt.grav];
                            if (s.season !== alt.season) r.setSeason(alt.season);
                            if (Math.abs(s.timeOfDay - alt.tod) > 1e-6) r._uhrSetzen(alt.tod, "regler");
                            if (s.weather !== alt.wetter && window.__wetterSetzen) window.__wetterSetzen(alt.wetter);
                            if (wm && wm.tritt) for (const k of Object.keys(wm.tritt)) if (!alt.tritt.has(k)) delete wm.tritt[k];
                            if (r._trittSchwach) for (const k of [...r._trittSchwach.keys()]) if (!alt.schwach.has(k)) r._trittSchwach.delete(k);
                            const F = r._bestandRegionen().regionen;
                            for (const k of Object.keys(F)) if (!alt.reg.has(k)) delete F[k];
                            if (alt.lf && s.lifeField) {
                                for (const k of [...s.lifeField.keys()]) if (!alt.lf.has(k)) s.lifeField.delete(k);
                                for (const [k, e] of alt.lf) {
                                    const n = s.lifeField.get(k);
                                    if (n) Object.assign(n, e);
                                    else s.lifeField.set(k, e);
                                }
                            }
                        };
                        return { s, A, pm, fl, wm, alt, RUHE, flick, welt, takt, boden, ab, r3, ruhig, ruhigSpieler, trocken, land, tier, stelle, stillFeld, zurueck };
                    };
                    // die Linse des Gangs aus dem Spiel-Baum (H.quelle: LAUF, SCHLUPF, gangart — nie abgeschrieben)
                    const Q = H.quelle("scripts/diag-tier-gang.cjs", ["SCHLUPF", "LAUF", "kreis", "zyklus", "gangart"]);
                    const kopf = "const st = r.state; const AnazhRealm = r.constructor; window.__schlupf = " + String(Q.SCHLUPF) + "; const LAUF = " + String(Q.LAUF) + "; const kreis = " + String(Q.kreis) + "; const zyklus = " + String(Q.zyklus) + "; " + String(Q.gangart) + ";";
                    const lauf = (fn, a) => H.seite("const G = (" + grund + ")(r, T); " + kopf + " try { return await (" + fn + ")(r, T, " + JSON.stringify(a || {}) + ", G, LAUF, gangart, kreis, zyklus); } finally { delete window.__schlupf; G.zurueck(); }");
                    // DER GANG: je Gattung der Lauf bei v̂ 0,3 · 1,2 · 3,5 (Schlupf, Tastgrad, Fußfolge) und die Leiter der Froude-Zahl um die Schwellen
                    // der Natur (Trab Fr 0,5, Galopp Fr 2,5 — Alexander & Jayes 1983): der Wechsel liegt zwischen der letzten Stufe der alten
                    // und der ersten der neuen Gangart, gemessen an den Fußfolgen (gangart der Linse). Unter fremder Schwere (der Wolf bei g/2
                    // und 2g, `state.gravity`) dieselbe Leiter: das Wechsel-Tempo v = √(Fr · g · L). Dazu der Sprung (Höhe und Flugzeit des
                    // Tiers gegen die ballistische Bahn), die Spur eines gehenden Tiers im Boden (der Tritt) und die Massen der Bestände
                    const gang = async function (r, T, a, G, LAUF, gangart, kreis) {
                        const { s, A, pm, r3, takt, land, tier, stelle, stillFeld, wm } = G;
                        const aus = { je: {}, laeufe: 0, schlupf: [], schwere: {} };
                        const lf = (seele, vh, g) => {
                            const e = LAUF({ seele, vh, g });
                            if (e.fehler) throw new Error(e.fehler);
                            aus.laeufe++;
                            if (Number.isFinite(e.schlupf)) aus.schlupf.push(e.schlupf);
                            const k = gangart(e.ph);
                            return { art: k.art, rel: k.rel, schlupf: e.schlupf, stand: e.standAnteil };
                        };
                        const wechsel = (seele, gitter, von, nach, g) => {
                            let vor = null;
                            for (const fr of gitter) {
                                const x = lf(seele, Math.sqrt(fr), g);
                                if (x.art === nach && vor && vor.art !== nach) return r3((fr + vor.fr) / 2);
                                if (x.art === nach && !vor) return r3(fr);
                                vor = Object.assign(x, { fr });
                            }
                            return null;
                        };
                        for (const seele of a.seelen) {
                            const J = { schritt: lf(seele, 0.3), trab: lf(seele, 1.2), galopp: lf(seele, 3.5) };
                            J.frTrab = wechsel(seele, a.frT, "schritt", "trab");
                            J.frGalopp = wechsel(seele, a.frG, "trab", "galopp");
                            aus.je[seele] = J;
                        }
                        const g0 = -s.gravity;
                        for (const f of a.gFaktor) aus.schwere[f] = wechsel("wolf", a.frT, "schritt", "trab", g0 * f);
                        aus.schwere[1] = aus.je.wolf ? aus.je.wolf.frTrab : wechsel("wolf", a.frT, "schritt", "trab", g0);
                        // die Fußfolge des Schritts gegen Muybridge (lateral: je ¼ Takt; beide Lesarten des Versatzes)
                        const REF = [[0, 0.5, 0.25, 0.75], [0, 0.5, 0.75, 0.25]];
                        aus.fussfallAbw = r3(Math.max(...a.seelen.map((x) => Math.min(...REF.map((R) => Math.max(...aus.je[x].schritt.rel.map((q, i) => kreis(q, R[i]))))))));
                        // der Sprung: Höhe und Flugzeit des Tiers (`_kreaturSprungHoehe`, `_kreaturSprungZeit`) gegen die ballistische Bahn
                        // 2·√(2h/g)
                        stillFeld();
                        const ort = land(pm.x, pm.z, 6, 30);
                        if (!ort) throw new Error("kein trockenes Land 30–600 m um den Spieler");
                        const w = tier(ort.x, ort.z, "wolf");
                        const h = r._kreaturSprungHoehe(w);
                        const tf = r._kreaturSprungZeit(w);
                        aus.sprung = { h: r3(h), t: r3(tf), tBallistisch: r3(2 * Math.sqrt((2 * h) / g0)), abwProzent: r3(Math.abs(tf / (2 * Math.sqrt((2 * h) / g0)) - 1) * 100) };
                        r.removeCreature(w);
                        // die Spur: ein Hirsch geht 40 s im Takt des Spiels; die Zellen, die sein Gang trat (worldMeta.tritt sichtbar ab der Stufe
                        // des Pfads, `_trittSchwach` darunter), gegen seine Bahn
                        stelle(ort.x + 40, ort.z);
                        const c = tier(ort.x, ort.z, "wesen");
                        const bahn = [];
                        const vorT = new Set(Object.keys((wm && wm.tritt) || {}));
                        const vorS = new Set((r._trittSchwach || new Map()).keys());
                        for (let k = 0; k < 2400; k++) {
                            takt(1);
                            if (k % 10 === 0) bahn.push([c.position.x, c.position.z]);
                        }
                        const zellen = (keys) => keys.map((k) => k.split(",").map((x) => (Number(x) + 0.5) * A.TRITT.zelleM));
                        const sicht = zellen(Object.keys((wm && wm.tritt) || {}).filter((k) => !vorT.has(k)));
                        const schwach = zellen([...(r._trittSchwach || new Map()).keys()].filter((k) => !vorS.has(k)));
                        const abst = (p) => Math.min(...bahn.map((b) => Math.hypot(b[0] - p[0], b[1] - p[1])));
                        let weg = 0;
                        for (let i = 1; i < bahn.length; i++) weg += Math.hypot(bahn[i][0] - bahn[i - 1][0], bahn[i][1] - bahn[i - 1][1]);
                        aus.spur = { wegM: r3(weg), sichtbar: sicht.length, schwach: schwach.length, abwM: sicht.length ? r3(sicht.reduce((x, p) => x + abst(p), 0) / sicht.length) : null, abwSchwachM: schwach.length ? r3(schwach.reduce((x, p) => x + abst(p), 0) / schwach.length) : null };
                        r.removeCreature(c);
                        // die Massen der Gang-Leiber (`_leibMasse` je Gattung): die Dekaden, über die der Gang läuft
                        const kg = [];
                        for (const seele of a.seelen) {
                            const c2 = tier(ort.x, ort.z, seele);
                            try {
                                const m = r._leibMasse(c2);
                                if (m > 0) kg.push(m);
                            } catch (_e) {
                                kg.push(NaN);
                            }
                            r.removeCreature(c2);
                        }
                        if (kg.some((x) => !(x > 0))) throw new Error("_leibMasse ohne Masse an einer der Gattungen " + a.seelen.join(","));
                        aus.kg = kg.length ? { n: kg.length, min: r3(Math.min(...kg)), max: r3(Math.max(...kg)), dekaden: r3(Math.log10(Math.max(...kg) / Math.min(...kg))) } : { n: 0, dekaden: 0 };
                        // der Fisch: seine Weise ist gesetzt (Schlag schlagHz eines starren Leibs), kein Leib mit Welle — die Pools zählen ihn
                        aus.fisch = { gezeichnet: s.fischPool && s.fischPool.mesh ? s.fischPool.mesh.count : 0 };
                        const m = aus.schlupf.reduce((x, y) => x + y, 0) / Math.max(1, aus.schlupf.length);
                        aus.schlupfMax = r3(Math.max(...aus.schlupf));
                        aus.schlupfStreu = r3(Math.sqrt(aus.schlupf.reduce((x, y) => x + (y - m) * (y - m), 0) / Math.max(1, aus.schlupf.length)));
                        return aus;
                    };
                    const z = await lauf(gang, { seelen: ["wolf", "fuchs", "baer", "wesen"], frT: [0.36, 0.4, 0.44, 0.48, 0.52, 0.56, 0.6, 0.66], frG: [2.0, 2.2, 2.4, 2.6, 2.8, 3.0, 3.3], gFaktor: [0.5, 2] });
                    const NATUR = { trab: 0.5, galopp: 2.5 };
                    const seelen = Object.keys(z.je);
                    const abwT = seelen.map((x) => (Number.isFinite(z.je[x].frTrab) ? Math.abs(z.je[x].frTrab / NATUR.trab - 1) * 100 : Infinity));
                    const abwG = seelen.map((x) => (Number.isFinite(z.je[x].frGalopp) ? Math.abs(z.je[x].frGalopp / NATUR.galopp - 1) * 100 : Infinity));
                    const froudeAbw = Math.round(Math.max(...abwT, ...abwG) * 10) / 10;
                    const SOLL_ART = { schritt: /^schritt/, trab: /^trab$/, galopp: /^galopp$/ };
                    let [imBand, alle] = [0, 0];
                    for (const x of seelen) for (const k of ["schritt", "trab", "galopp"]) (alle += 1), (imBand += SOLL_ART[k].test(z.je[x][k].art) ? 1 : 0);
                    const gangBand = alle ? Math.round((1000 * imBand) / alle) / 1000 : null;
                    const g1 = z.schwere[1];
                    const tempoAbw = Math.max(...[0.5, 2].map((f) => (Number.isFinite(z.schwere[f]) && Number.isFinite(g1) ? Math.abs(Math.sqrt(z.schwere[f] / g1) - 1) * 100 : Infinity)));
                    const zeuge = { antworten: z.laeufe, streuung: z.schlupfStreu, vor: 0, nach: z.laeufe };
                    const augeNoetig = Object.keys(U).some((nr) => U[nr].auge);
                    const auge = augeNoetig ? await M.auge("tiere-bewegung", U[Object.keys(U).find((nr) => U[nr].auge)].auge) : undefined;
                    const aus = M.teil || {};
                    const nimm = (nr, werte, nicht, mitAuge, z2) => {
                        if (!U[nr]) return;
                        aus[nr] = { werte, zeuge: z2 || zeuge, ...(mitAuge ? { auge } : {}), ...(nicht ? { nicht } : {}) };
                    };
                    const pct = (x) => (Number.isFinite(x) ? Math.round(x * 1000) / 10 : null);
                    nimm(1, { gleitProzent: pct(z.schlupfMax), froudeAbw: Number.isFinite(froudeAbw) ? froudeAbw : null }, null, false, Object.assign({}, zeuge, { trab: seelen.map((x) => z.je[x].frTrab), galopp: seelen.map((x) => z.je[x].frGalopp) }));
                    nimm(2, { fussfallAbw: z.fussfallAbw, massDekaden: z.kg.dekaden }, "kein Laufvogel, der Fisch ein starrer Leib ohne Körperwelle (gezeichnet " + z.fisch.gezeichnet + "); Massen des Bestands über " + z.kg.dekaden + " Dekaden");
                    nimm(3, {}, "kein Flug aus der Körperform, keine Schwimmweise aus dem Leib (Aal, Barsch, Thun, Rückstoß, Flossenflug)", true);
                    nimm(4, { spurAbwM: z.spur.abwM, sprungAbwProzent: z.sprung.abwProzent, spurSichtbar: z.spur.sichtbar }, "kein Kriechen, Klettern, Graben, kein Säuger oder Vogel im Wasser; die Spur eines Gangs " + z.spur.wegM + " m: " + z.spur.sichtbar + " sichtbare Zellen (" + z.spur.schwach + " unter der Stufe des Pfads)");
                    nimm(5, { massDekaden: z.kg.dekaden }, "6 Dekaden 1 g – 1 t: der Bestand trägt " + z.kg.dekaden + " Dekaden (" + z.kg.min + "–" + z.kg.max + " kg), kein Insekt mit Gang", true);
                    nimm(6, { gleitProzent: pct(z.schlupfMax), gangBand }, "1 000 Arten × 5 Gelände: die Welt trägt 4 Gangarten-Leiber auf ebenem Grund");
                    nimm(7, {}, "kein Schlag-Stopp mit Gleitstrecke, kein Strouhal: der Fisch schlägt starr (FISCH_GESETZ schlagHz)");
                    nimm(8, { gangTempoAbw: Number.isFinite(tempoAbw) ? Math.round(tempoAbw * 10) / 10 : null }, "keine Atmosphäre im Flug-Gesetz (die Gegenprobe dünne Luft hat keinen Leser) und keine drei Planeten", false, Object.assign({}, zeuge, { schwere: z.schwere }));
                    return { sprossen: aus, gang: { je: z.je, schwere: z.schwere, sprung: z.sprung, spur: z.spur, kg: z.kg } };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [
                            K.soll(BW, 1, "Fußgleiten", { quelleFeld: "tiefe", quelleWort: "Gleiten ≤ 5 % der Schrittlänge", rel: "≤", zahl: 5, key: "gleitProzent", einheit: "%" }),
                            K.soll(BW, 1, "Gangwechsel", { quelleFeld: "tiefe", quelleWort: "Gangwechsel bei der Froude-Zahl der Natur ±10 %", rel: "≤", zahl: 10, key: "froudeAbw", einheit: "%" }),
                        ],
                        zeuge: zeugeWelt(12, true),
                        taeter: "tetrapoda-core.js gangSchritt / gangArt (GANG_FOLGE)",
                        unklar: "der Richter nennt keine Zahl: das Soll trägt die Tiefe (Gleiten ≤ 5 %, Wechsel bei Fr der Natur ±10 % gegen Alexander & Jayes 1983: Trab 0,5, Galopp 2,5).",
                        gruen: gut({ gleitProzent: 1.3, froudeAbw: 4 }, 76),
                        attrappen: atr({ gleitProzent: 1.3, froudeAbw: 4 }, 76, true),
                    },
                    2: {
                        u: {},
                        soll: [
                            K.soll(BW, 2, "Fußfall-Diagramm", { quelleFeld: "tiefe", quelleWort: "Fußfall gegen Muybridge ±0,05", rel: "≤", zahl: 0.05, key: "fussfallAbw", einheit: "Takt" }),
                            K.soll(BW, 2, "St = f·A/U", { quelleFeld: "tiefe", quelleWort: "Strouhal 0,2–0,4", rel: "band", zahl: 0.2, bis: 0.4, key: "strouhal" }),
                        ],
                        zeuge: zeugeWelt(12, true),
                        taeter: "tetrapoda-core.js FISCH_GESETZ (starrer Leib) / kein Laufvogel",
                        nicht: "kein Laufvogel, kein Fisch mit Körperwelle",
                        leser: "tetrapoda-core.js:2832 — FISCH_GESETZ schlagHz: der Fisch pendelt als starrer Leib, keine Körperwelle (St = f·A/U ohne Amplitude der Welle)",
                        unklar: "der Richter nennt keine Zahl: das Soll trägt die Tiefe (Fußfall ±0,05 gegen Muybridge, Strouhal 0,2–0,4).",
                        gruen: gut({ fussfallAbw: 0.03, strouhal: 0.3, massDekaden: 3 }, 76),
                        attrappen: atr({ fussfallAbw: 0.03, strouhal: 0.3, massDekaden: 3 }, 76, true),
                    },
                    3: {
                        u: { auge: AUGE_ORT },
                        soll: [
                            K.soll(BW, 3, "Blindtest Schwimmweise ≥ 80 %", { key: "blindProzent", einheit: "%" }),
                            K.soll(BW, 3, "Frequenz gegen Pennycuick", { quelleFeld: "tiefe", quelleWort: "Schlagfrequenz ±20 % zur Allometrie", rel: "≤", zahl: 20, key: "frequenzAbw", einheit: "%" }),
                        ],
                        auge: { pose: "Third auf einen Trupp oder Schwarm von 3 000 (heute: die Wiese)", vorbild: "Filme der fünf Schwimmweisen; Blindtest ≥ 80 %" },
                        taeter: "tetrapoda-core.js VOGEL_GESETZ / FISCH_GESETZ (die Weise zugewiesen, nicht aus dem Leib)",
                        nicht: "kein Flug und keine Schwimmweise aus der Körperform",
                        leser: "tetrapoda-core.js:2392 — VOGEL_GESETZ leib.schlagHz 12 fest je Leib, keine Allometrie aus Masse und Spanne (Pennycuick)",
                        gruen: gut({ blindProzent: 85, frequenzAbw: 10 }, 100),
                        attrappen: atr({ blindProzent: 85, frequenzAbw: 10 }, 100),
                    },
                    4: {
                        u: {},
                        soll: [K.soll(BW, 4, "je Medium 10 Arten im Band ≥ 0,8", { key: "bandAnteil" }), K.soll(BW, 4, "Spur folgt der Bahn ±0,5 m", { rel: "≤", zahl: 0.5, key: "spurAbwM", einheit: "m" })],
                        zeuge: zeugeWelt(12, true),
                        taeter: "stamm/siedlung-wege.js _tritt (die Spur eines Gangs bleibt unter der Stufe des Pfads)",
                        nicht: "kein Kriechen, Springen-Medium, Klettern, Graben; kein Säuger oder Vogel im Wasser",
                        leser: "stamm/siedlung-wege.js:1712 — _trittStufe: ein Gang tritt die Zelle einmal, sichtbar wird erst der Pfad (TRITT.tritte 20) — keine Fährte",
                        gruen: gut({ bandAnteil: 0.85, spurAbwM: 0.3, sprungAbwProzent: 5, spurSichtbar: 40 }, 76),
                        attrappen: atr({ bandAnteil: 0.85, spurAbwM: 0.3, sprungAbwProzent: 5, spurSichtbar: 40 }, 76, true),
                    },
                    5: {
                        u: { auge: AUGE_ORT },
                        soll: [K.soll(BW, 5, "Panel gegen Hochgeschwindigkeits-Referenz ≥ 0,7", { key: "panel" })],
                        auge: { pose: "Makro-Zeitlupe an einem Insekt (heute: die Wiese)", vorbild: "Hochgeschwindigkeits-Filme (Tripod-Gang, Flügelschlag 100–200 Hz); Panel ≥ 0,7" },
                        taeter: "tetrapoda-core.js BESTAEUBER_GESETZ (kein Gang, kein Flügelschlag-Leib)",
                        nicht: "6 Dekaden 1 g – 1 t: kein Insekt mit Tripod-Gang",
                        leser: "tetrapoda-core.js:2908 — BESTAEUBER_GESETZ: die Hummel fliegt als Doppelkeil, kein Leser trägt Beine oder Flügelschlag",
                        gruen: gut({ panel: 0.8, massDekaden: 6 }, 76),
                        attrappen: atr({ panel: 0.8, massDekaden: 6 }, 76),
                    },
                    6: {
                        u: {},
                        soll: [K.soll(BW, 6, "Gleiten ≤ 5 %", { key: "gleitProzent", einheit: "%" }), K.soll(BW, 6, "Gang im Band ≥ 0,95", { key: "gangBand" })],
                        zeuge: zeugeWelt(12, true),
                        taeter: "tetrapoda-core.js gangSchritt (4 Leiber auf ebenem Grund)",
                        nicht: "1 000 Arten × 5 Gelände (Hang, Fels, Schnee, Schlamm, Strömung)",
                        leser: "stamm/kreatur-leben.js:3622 — CREATURE_SOUL_NAMES (4 Leiber); kein Leser erzeugt Arten über 11 Dekaden",
                        gruen: gut({ gleitProzent: 1.3, gangBand: 1 }, 76),
                        attrappen: atr({ gleitProzent: 1.3, gangBand: 1 }, 76, true),
                    },
                    7: {
                        u: {},
                        soll: [K.soll(BW, 7, "Gleitstrecke nach Schlag-Stopp ±30 % zur Re-Theorie", { rel: "≤", zahl: 30, key: "gleitAbw", einheit: "%" }), K.soll(BW, 7, "St im Band bei ≥ 95 %", { key: "stBand", einheit: "%" })],
                        zeuge: zeugeWelt(12, true),
                        taeter: "tetrapoda-core.js FISCH_GESETZ (kein Schlag-Stopp, keine Reynolds-Skalierung)",
                        nicht: "10³ Zufalls-Arten je Saat; kein Gleiten nach dem Schlag",
                        leser: "tetrapoda-core.js:2832 — FISCH_GESETZ: Schlag als fester Takt, kein Leser der Reynolds-Zahl",
                        gruen: gut({ gleitAbw: 12, stBand: 97 }, 76),
                        attrappen: atr({ gleitAbw: 12, stBand: 97 }, 76, true),
                    },
                    8: {
                        u: {},
                        soll: [K.soll(BW, 8, "Gangwechsel-Tempo ±10 %", { rel: "≤", zahl: 10, key: "gangTempoAbw", einheit: "%" })],
                        zeuge: zeugeWelt(12, true),
                        taeter: "tetrapoda-core.js gangArt (die Schwere der Welt) / VOGEL_GESETZ (keine Atmosphäre)",
                        nicht: "keine Atmosphäre im Flug-Gesetz, keine drei Planeten",
                        leser: "tetrapoda-core.js:2376 — VOGEL_GESETZ: der Flug liest weder Luftdichte noch Schwere (die Gegenprobe dünne Luft hat keinen Leser)",
                        gruen: gut({ gangTempoAbw: 4 }, 76),
                        attrappen: atr({ gangTempoAbw: 4 }, 76, true),
                    },
                },
            },
            // ═══ VERHALTEN: das Ethogramm, die Alarm-Kette des Verbands, die Witterung im Wind, das Gedächtnis und die Gegenprobe Sinn aus ═══
            [VH]: {
                sek: 40,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "die Bilder der Auge-Sprossen S3, S6, S7 (die Lebensweise blind zugeordnet) — headless zählt die Probe Akte und Fluchten im Takt",
                mess: async function (H, U, M) {
                    const grund = function (r, T) {
                        const s = r.state;
                        const A = r.constructor;
                        const pm = s.playerMesh.position;
                        const fl = s.faunaLifecycle;
                        const wm = s.worldMeta;
                        const alt = { p: pm.clone(), yaw: s.yaw, pitch: s.pitch, modus: r.getGameMode(), max: s.maxCreatures, wurf: fl ? fl.lastTick : null, vor: new Set(s.creatures), perf: s.perfRegulator, grav: s.gravity, tod: s.timeOfDay, wetter: s.weather, season: s.season, tritt: new Set(Object.keys((wm && wm.tritt) || {})), schwach: new Set((r._trittSchwach || new Map()).keys()), reg: new Set(Object.keys(r._bestandRegionen().regionen)), lf: s.lifeField ? new Map([...s.lifeField].map(([k, e]) => [k, Object.assign({}, e)])) : null, seele: s.player && s.player.soul };
                        const RUHE = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
                        const flicken = [];
                        const flick = (n, f) => {
                            if (Object.prototype.hasOwnProperty.call(r, n)) throw new Error("flick: " + n + " trägt schon eine eigene Zeile");
                            flicken.push(n);
                            r[n] = f;
                        };
                        let t = performance.now();
                        const welt = (n) => {
                            s.perfRegulator = false;
                            for (let i = 0; i < n; i++) r._gameLoopTick((t += 1000 / 60));
                        };
                        const takt = (n, d) => {
                            for (let i = 0; i < n; i++) {
                                r._kreaturStossSchritt(d || 1 / 60);
                                r._trittDerLeiber();
                                r._leibKontakte();
                                r.updateCreatures(d || 1 / 60);
                            }
                        };
                        const boden = (x, z) => r.getTerrainHeightAt(x, z) + 0.5;
                        const ab = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const ruhig = (c) => (c.userData.emotions = Object.assign({}, RUHE));
                        const ruhigSpieler = () => s.player.emotions && Object.assign(s.player.emotions, RUHE);
                        const trocken = (x, z) => r._landAt(x, z) && !r._nassAt(x, z) && !(typeof r._imGrundriss === "function" && r._imGrundriss(x, z));
                        const land = (x0, z0, R, dMin) => {
                            for (let d = dMin || 0; d <= 600; d += 15) {
                                const n = Math.max(1, Math.round(d / 10));
                                for (let q = 0; q < n; q++) {
                                    const w = (q / n) * 2 * Math.PI;
                                    const x = x0 + Math.cos(w) * d;
                                    const z = z0 + Math.sin(w) * d;
                                    let ok = trocken(x, z);
                                    for (let k = 0; ok && k < 8; k++) ok = trocken(x + Math.cos(k * 0.785) * R, z + Math.sin(k * 0.785) * R);
                                    if (ok) return { x, z };
                                }
                            }
                            return null;
                        };
                        const tier = (x, z, seele, bs) => {
                            s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 2);
                            let nein = null;
                            const c = r.spawnCreatureAt(x, boden(x, z), z, "happy", seele, { precise: true, bodySize: bs || 1, absage: (g) => (nein = g) });
                            if (!c) throw new Error("spawnCreatureAt " + seele + ": " + nein);
                            ruhig(c);
                            return c;
                        };
                        const stelle = (x, z) => {
                            pm.set(x, r.getTerrainHeightAt(x, z) + A.PLAYER_FOOT_OFFSET, z);
                            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                        };
                        const stillFeld = () => {
                            if (fl) fl.lastTick = 1e12;
                        };
                        const zurueck = () => {
                            for (const n of flicken.splice(0)) delete r[n];
                            if (s.player && alt.seele && s.player.soul !== alt.seele) r.applyPlayerSoul(alt.seele);
                            for (const c of [...s.creatures]) if (!alt.vor.has(c)) r.removeCreature(c);
                            s.maxCreatures = alt.max;
                            if (fl) fl.lastTick = alt.wurf;
                            if (r.getGameMode() !== alt.modus) r.setGameMode(alt.modus);
                            pm.copy(alt.p);
                            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                            [s.yaw, s.pitch, s.perfRegulator, s.gravity] = [alt.yaw, alt.pitch, alt.perf, alt.grav];
                            if (s.season !== alt.season) r.setSeason(alt.season);
                            if (Math.abs(s.timeOfDay - alt.tod) > 1e-6) r._uhrSetzen(alt.tod, "regler");
                            if (s.weather !== alt.wetter && window.__wetterSetzen) window.__wetterSetzen(alt.wetter);
                            if (wm && wm.tritt) for (const k of Object.keys(wm.tritt)) if (!alt.tritt.has(k)) delete wm.tritt[k];
                            if (r._trittSchwach) for (const k of [...r._trittSchwach.keys()]) if (!alt.schwach.has(k)) r._trittSchwach.delete(k);
                            const F = r._bestandRegionen().regionen;
                            for (const k of Object.keys(F)) if (!alt.reg.has(k)) delete F[k];
                            if (alt.lf && s.lifeField) {
                                for (const k of [...s.lifeField.keys()]) if (!alt.lf.has(k)) s.lifeField.delete(k);
                                for (const [k, e] of alt.lf) {
                                    const n = s.lifeField.get(k);
                                    if (n) Object.assign(n, e);
                                    else s.lifeField.set(k, e);
                                }
                            }
                        };
                        return { s, A, pm, fl, wm, alt, RUHE, flick, welt, takt, boden, ab, r3, ruhig, ruhigSpieler, trocken, land, tier, stelle, stillFeld, zurueck };
                    };
                    const lauf = (fn, a) => H.seite("const G = (" + grund + ")(r, T); try { return await (" + fn + ")(r, T, " + JSON.stringify(a || {}) + ", G); } finally { G.zurueck(); }");
                    // DIE PROBE: (1) das Ethogramm — drei Hirsche 1 Spielstunde im Takt (dt 0,1, die Uhr läuft), der Spieler ruhig in 25 m im frieden
                    // (die 50-m-Wand des Verhaltens-Ticks): je Takt die Tätigkeit (`_gezeigt`) und die Aktion (`_verhaltenAktion`) — die Akte und
                    // das Zeitbudget gegen das Feld-Ethogramm des Rothirschs. (2) Die Annäherung wie FLUCHT_SITZUNG (pfad, Stufen ab 3·Feldmaß, je 20
                    // gehende Takte): fünf Hirsche als Verband (`_kreaturVerbinden`) → die Alarm-Kette (der erste bis der letzte Flüchtende); je ein
                    // Hirsch mit dem Wind und gegen ihn (`_windDirAt`) → das Verhältnis der Entdeckungsdistanzen; zwei geschlagene Hirsche
                    // (`damageCreature`, Quelle Spieler: das Gedächtnis) gegen zwei Fremde → die Meidequoten; ein Hirsch, dem der Sinn für den
                    // Spieler fehlt (`_creatureWarinessSpieler` → 0), gegen einen mit Sinn → die Gegenprobe
                    const probe = async function (r, T, a, G) {
                        const { s, A, pm, r3, takt, land, tier, stelle, stillFeld, ruhigSpieler, RUHE, flick, trocken } = G;
                        stillFeld();
                        const ort = land(pm.x, pm.z, 40, 60);
                        if (!ort) throw new Error("kein trockenes Land 60–600 m um den Spieler");
                        const aus = { ort: [Math.round(ort.x), Math.round(ort.z)] };
                        // (1) das Ethogramm im frieden
                        r.setGameMode("frieden");
                        const herde = [0, 1, 2].map((k) => tier(ort.x + k * 4, ort.z + (k % 2) * 3, "wesen"));
                        stelle(ort.x - 25, ort.z);
                        const tod0 = s.timeOfDay;
                        const dayS = 60 * A.DAY_LENGTH_DEFAULT_MINUTES;
                        const budget = {};
                        const akte = {};
                        let proben = 0;
                        for (let k = 0; k < a.ethoTakte; k++) {
                            ruhigSpieler();
                            takt(1, a.ethoDt);
                            if (k % 150 === 149) r._uhrSetzen((tod0 + ((k + 1) * a.ethoDt) / dayS) % 1, "regler");
                            for (const c of herde) {
                                const ud = c.userData;
                                const zust = ud._motionZustand === "flucht" ? "flucht" : ud._gezeigt || "ziehen";
                                budget[zust] = (budget[zust] || 0) + 1;
                                const va = ud._verhaltenAktion && ud._verhaltenAktion.name;
                                if (va) akte[va] = (akte[va] || 0) + 1;
                                proben++;
                            }
                        }
                        for (const c of herde) r.removeCreature(c);
                        r._uhrSetzen(tod0, "regler");
                        const anteil = {};
                        for (const k of Object.keys(budget)) anteil[k] = budget[k] / proben;
                        // das Zeitbudget: äsen ↔ nahrung, ruhen ↔ ruhen, ziehen ↔ ziehen, sichern ↔ die Aktion scan (Anteil der Takte mit ihr)
                        const ist = { nahrung: anteil.nahrung || 0, ruhen: anteil.ruhen || 0, ziehen: anteil.ziehen || 0, sichern: (akte.scan || 0) / proben };
                        const ref = a.etho;
                        const rang = (o) => {
                            const k = Object.keys(o).sort((x, y) => o[x] - o[y]);
                            const R = {};
                            for (let i = 0; i < k.length; ) {
                                let j = i;
                                while (j + 1 < k.length && o[k[j + 1]] === o[k[i]]) j++;
                                for (let q = i; q <= j; q++) R[k[q]] = (i + j) / 2 + 1;
                                i = j + 1;
                            }
                            return R;
                        };
                        const [ri, rr] = [rang(ist), rang(ref)];
                        const ks = Object.keys(ref);
                        const mi = ks.reduce((x, k) => x + ri[k], 0) / ks.length;
                        const mr = ks.reduce((x, k) => x + rr[k], 0) / ks.length;
                        const kov = ks.reduce((x, k) => x + (ri[k] - mi) * (rr[k] - mr), 0);
                        const vi = Math.sqrt(ks.reduce((x, k) => x + (ri[k] - mi) * (ri[k] - mi), 0));
                        const vr = Math.sqrt(ks.reduce((x, k) => x + (rr[k] - mr) * (rr[k] - mr), 0));
                        Object.assign(aus, { etho: { proben, anteil: Object.fromEntries(Object.entries(ist).map(([k, v]) => [k, r3(v)])), akte, akteN: new Set([...Object.keys(akte), ...Object.keys(budget)]).size, rang: vi > 0 && vr > 0 ? r3(kov / (vi * vr)) : 0, spielStunden: r3((a.ethoTakte * a.ethoDt) / (dayS / 24)) } });
                        // (2) die Annäherung im pfad
                        r.setGameMode("pfad");
                        const F = A._furchtGesetz().F.fluchtDistanzM.deer;
                        const dt = 1 / 60;
                        const fuss = (x, z) => r.getTerrainHeightAt(x, z) + A.PLAYER_FOOT_OFFSET;
                        const richtung = (ux, uz) => {
                            let n = 0;
                            for (let d = 20; d <= 3 * F; d += 20) if (trocken(ort.x + ux * d, ort.z + uz * d)) n++;
                            return n;
                        };
                        let rich = null;
                        for (let q = 0; q < 8; q++) {
                            const [ux, uz] = [Math.cos((q * Math.PI) / 4), Math.sin((q * Math.PI) / 4)];
                            const n = richtung(ux, uz);
                            if (!rich || n > rich.n) rich = { ux, uz, n };
                        }
                        const naehern = (liste, u) => {
                            const ziel = liste[0];
                            const flieht = new Map();
                            let takte = 0;
                            const schritt = (gehen) => {
                                const [dx, dz] = [ziel.position.x - pm.x, ziel.position.z - pm.z];
                                const d = Math.hypot(dx, dz) || 1;
                                if (gehen) (pm.x += (dx / d) * s.speed * dt), (pm.z += (dz / d) * s.speed * dt);
                                pm.y = fuss(pm.x, pm.z);
                                if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                                [s.yaw, s.pitch] = [Math.atan2(dx, dz), 0];
                                ruhigSpieler();
                                for (const c of liste) if (!flieht.has(c)) c.userData.emotions = Object.assign(c.userData.emotions || {}, RUHE);
                                takt(1, dt);
                                takte++;
                                for (const c of liste) if (!flieht.has(c) && c.userData._motionZustand === "flucht") flieht.set(c, { d: Math.hypot(c.position.x - pm.x, c.position.z - pm.z), k: takte });
                            };
                            for (let k = 0; k < 30; k++) {
                                pm.set(ziel.position.x + u.ux * 3 * F, 0, ziel.position.z + u.uz * 3 * F);
                                schritt(false);
                            }
                            const steht = flieht.size;
                            for (let d = 3 * F; ; d = Math.max(8, d * 0.88)) {
                                pm.set(ziel.position.x + u.ux * d, 0, ziel.position.z + u.uz * d);
                                for (let k = 0; k < 20 && !flieht.has(ziel); k++) schritt(true);
                                if (flieht.has(ziel) || d === 8) break;
                            }
                            for (let k = 0; k < 300 && flieht.size > 0 && flieht.size < liste.length; k++) schritt(false);
                            const ks = [...flieht.values()].map((x) => x.k);
                            return { d: flieht.has(ziel) ? flieht.get(ziel).d : null, n: flieht.size, von: liste.length, kette: ks.length > 1 ? (Math.max(...ks) - Math.min(...ks)) * dt : null, takte, steht };
                        };
                        const allein = (u, vor) => {
                            const c = tier(ort.x, ort.z, "wesen");
                            for (let k = 0; k < 20; k++) takt(1, dt);
                            if (vor) vor(c);
                            const e = naehern([c], u);
                            r.removeCreature(c);
                            return e;
                        };
                        // die Alarm-Kette des Verbands
                        const verband = [0, 1, 2, 3, 4].map((k) => tier(ort.x + (k % 3) * 3, ort.z + Math.floor(k / 3) * 3, "wesen"));
                        r._kreaturVerbinden(verband);
                        for (let k = 0; k < 30; k++) takt(1, dt);
                        aus.alarm = naehern(verband, rich);
                        for (const c of verband) r.removeCreature(c);
                        // der Wind: mit dem Wind (der Spieler steht im Wind vor dem Tier, sein Geruch weht hin) und gegen ihn
                        const w = r._windDirAt(s.spielZeit);
                        aus.wind = { dir: [r3(w.x), r3(w.z)], mit: allein({ ux: -w.x, uz: -w.z }), gegen: allein({ ux: w.x, uz: w.z }) };
                        // das Gedächtnis: geschlagen (die Kampf-Furcht klingt ab, die Erinnerung bleibt) gegen fremd
                        const schlag = (c) => {
                            stelle(c.position.x + 3, c.position.z);
                            r.damageCreature(c, 4, { source: "player", fromPos: pm.clone() });
                            for (let k = 0; k < 1200 && c.userData.fearUntil > s.creatureAnimationTime; k++) takt(1, 1 / 30);
                            for (let k = 0; k < 60; k++) takt(1, dt);
                        };
                        aus.gedaechtnis = { geschlagen: [allein(rich, schlag), allein(rich, schlag), allein(rich, schlag)], fremd: [allein(rich), allein(rich), allein(rich)] };
                        // die Gegenprobe: der Sinn für den Spieler aus
                        aus.sinn = { mit: allein(rich) };
                        flick("_creatureWarinessSpieler", function () {
                            return 0;
                        });
                        aus.sinn.ohne = allein(rich);
                        aus.feldM = F;
                        aus.lebensdauerS = A.FAUNA_MAX_AGE_MS / 1000;
                        aus.spieltagS = dayS;
                        return aus;
                    };
                    const z = await lauf(probe, { ethoTakte: 1500, ethoDt: 0.1, etho: { nahrung: 0.52, ruhen: 0.33, ziehen: 0.1, sichern: 0.05 } });
                    const augeNoetig = Object.keys(U).some((nr) => U[nr].auge);
                    const auge = augeNoetig ? await M.auge("tiere-verhalten", U[Object.keys(U).find((nr) => U[nr].auge)].auge) : undefined;
                    const fl = [z.alarm.d, z.wind.mit.d, z.wind.gegen.d, ...z.gedaechtnis.geschlagen.map((x) => x.d), ...z.gedaechtnis.fremd.map((x) => x.d), z.sinn.mit.d].filter((x) => Number.isFinite(x));
                    const mfl = fl.reduce((x, y) => x + y, 0) / Math.max(1, fl.length);
                    const zeuge = { antworten: z.etho.proben + fl.length, streuung: Math.round(Math.sqrt(fl.reduce((x, y) => x + (y - mfl) * (y - mfl), 0) / Math.max(1, fl.length)) * 1000) / 1000, vor: 0, nach: fl.length };
                    const fremdMed = z.gedaechtnis.fremd.map((x) => x.d).filter(Number.isFinite);
                    const basis = fremdMed.length ? fremdMed.reduce((x, y) => x + y, 0) / fremdMed.length : null;
                    const meide = (L) => (basis ? Math.round((1000 * L.filter((x) => Number.isFinite(x.d) && x.d > 1.2 * basis).length) / L.length) / 1000 : null);
                    const windRatio = Number.isFinite(z.wind.mit.d) && Number.isFinite(z.wind.gegen.d) && z.wind.gegen.d > 0 ? Math.round((1000 * z.wind.mit.d) / z.wind.gegen.d) / 1000 : null;
                    const aus = M.teil || {};
                    const nimm = (nr, werte, nicht, mitAuge) => {
                        if (!U[nr]) return;
                        aus[nr] = { werte, zeuge, ...(mitAuge ? { auge } : {}), ...(nicht ? { nicht } : {}) };
                    };
                    nimm(2, { rang: z.etho.rang, alarmS: z.alarm.kette, akte: z.etho.akteN, spielStunden: z.etho.spielStunden }, z.etho.akteN < 30 ? "der Hirsch trägt " + z.etho.akteN + " Akte statt ≥ 30 (kein Alarmruf, kein Komfort, kein Markieren, kein Drohen)" : null);
                    nimm(3, { akte: z.etho.akteN }, "10² Stichproben-Arten aus dem Samen: die Welt trägt 4 Gattungen mit einem Buch der Aktionen", true);
                    nimm(4, { windRatio }, "der Spieler wird an Abstand, Näherung und Gedächtnis erkannt: kein Gehör, kein Geruch im Wind, keine Vibration, keine Wärme gegen ihn (Entdeckung mit Wind " + Math.round(10 * z.wind.mit.d) / 10 + " m, gegen Wind " + Math.round(10 * z.wind.gegen.d) / 10 + " m)");
                    nimm(5, { meideInd: meide(z.gedaechtnis.geschlagen), meideFremd: meide(z.gedaechtnis.fremd), spieltage: Math.round((100 * z.lebensdauerS) / z.spieltagS) / 100 }, "7 Spieltage (" + 7 * z.spieltagS + " s) überlebt kein Tier: die Lebensdauer ist " + z.lebensdauerS + " s");
                    nimm(6, {}, "kein Echo-Jäger, kein Zugvogel mit Kurs, kein Sinn jenseits des Menschen (UV, Magnetfeld, Echo, Elektro)", true);
                    nimm(7, { fluchtMitSinn: z.sinn.mit.d, fluchtOhneSinn: z.sinn.ohne.d === null ? 0 : z.sinn.ohne.d }, "keine fremde Saat, keine fremden Sinne", true);
                    return { sprossen: aus, verhalten: z };
                },
                sprossen: {
                    2: {
                        u: {},
                        soll: [
                            K.soll(VH, 2, "Rangkorrelation ≥ 0,7", { key: "rang" }),
                            K.soll(VH, 2, "Feld-Ethogramm", { quelleFeld: "tiefe", quelleWort: "Alarm-Kette ≤ 1 s", rel: "≤", zahl: 1, key: "alarmS", einheit: "s" }),
                            K.soll(VH, 2, "Feld-Ethogramm", { quelleFeld: "umfang", quelleWort: "≥ 30 Akte", rel: "≥", zahl: 30, key: "akte", einheit: "Akte" }),
                            K.soll(VH, 2, "1 h Beobachtung", { rel: "≥", zahl: 1, key: "spielStunden", einheit: "Spielstunden" }),
                        ],
                        zeuge: zeugeWelt(100, true),
                        taeter: "tetrapoda-core.js VERHALTEN.aktionen (das Buch der Aktionen) / ETHOGRAMM_GESETZ",
                        nicht: "eine Art mit vollem Ethogramm (≥ 30 Akte)",
                        leser: "tetrapoda-core.js:99 — VERHALTEN.aktionen trägt 13 Aktionen ohne Alarmruf, Komfort, Markieren, Drohen",
                        gruen: gut({ rang: 0.8, alarmS: 0.5, akte: 32, spielStunden: 1 }, 4500),
                        attrappen: atr({ rang: 0.8, alarmS: 0.5, akte: 32, spielStunden: 1 }, 4500, true),
                    },
                    3: {
                        u: { auge: AUGE_ORT },
                        soll: [K.soll(VH, 3, "Ethologe ordnet die Lebensweise blind zu ≥ 0,8", { key: "zuordnung" })],
                        auge: { pose: "Third auf 10² Stichproben-Arten je 1 h Zeitraffer (heute: die Wiese)", vorbild: "der Ethologe ordnet die Lebensweise blind zu ≥ 0,8" },
                        taeter: "stamm/kreatur-leben.js CREATURE_SOUL_NAMES (4 Gattungen, Lebensweise von Hand)",
                        nicht: "10² Stichproben-Arten aus dem Samen",
                        leser: "stamm/kreatur-leben.js:3622 — CREATURE_SOUL_NAMES: die Lebensweise ist je Gattung zugewiesen, kein Leser leitet sie aus Leib und Samen ab",
                        gruen: gut({ zuordnung: 0.85 }, 4500),
                        attrappen: atr({ zuordnung: 0.85 }, 4500),
                    },
                    4: {
                        u: {},
                        soll: [K.soll(VH, 4, "Entdeckungsdistanz mit Wind / gegen Wind ≥ 3", { key: "windRatio" })],
                        zeuge: zeugeWelt(100, true),
                        taeter: "stamm/kreatur-furcht.js _kreaturMenschFlucht (die Flucht vor dem Spieler liest keinen Wind)",
                        nicht: "5 Sinne gegen den Spieler: Richtungsgehör, Geruch im Wind, Vibration, Wärme, Sicht",
                        leser: "stamm/kreatur-furcht.js:160 `_kreaturMenschFlucht` — die Fluchtdistanz liest Abstand, Erinnerung, Aura und Näherung, nie den Wind",
                        gruen: gut({ windRatio: 3.5 }, 4500),
                        attrappen: atr({ windRatio: 3.5 }, 4500, true),
                    },
                    5: {
                        u: {},
                        soll: [
                            K.soll(VH, 5, "Meidequote ≥ 0,8 beim Individuum", { key: "meideInd" }),
                            K.soll(VH, 5, "≤ 0,2 bei Fremden", { key: "meideFremd" }),
                            K.soll(VH, 5, "nach 7 Spieltagen", { rel: "≥", zahl: 7, key: "spieltage", einheit: "Spieltage" }),
                        ],
                        zeuge: zeugeWelt(100, true),
                        taeter: "stamm/daten.js FAUNA_MAX_AGE_MS (35 Spielminuten) / stamm/kreatur-furcht.js _creatureWarinessSpieler",
                        nicht: "Gedächtnis über Wochen: kein Tier lebt 7 Spieltage",
                        leser: "stamm/daten.js:176 `FAUNA_MAX_AGE_MS` — 35 min Lebensdauer: das Gedächtnis eines Individuums endet vor dem ersten Spieltag",
                        gruen: gut({ meideInd: 0.9, meideFremd: 0.1, spieltage: 7 }, 4500),
                        attrappen: atr({ meideInd: 0.9, meideFremd: 0.1, spieltage: 7 }, 4500, true),
                    },
                    6: {
                        u: { auge: AUGE_ORT },
                        soll: [K.soll(VH, 6, "Fang-Quote der Echo-Jäger bei 0 lux = Tag ±20 %", { rel: "≤", zahl: 20, key: "fangAbw", einheit: "%" }), K.soll(VH, 6, "blinde Zuordnung an 10⁴ Saaten ≥ 0,8", { key: "zuordnung" })],
                        auge: { pose: "Nacht 0 lux, Third auf einen Echo-Jäger (heute: die Wiese)", vorbild: "Fang-Quote bei Nacht = Tag ±20 %; blinde Zuordnung ≥ 0,8" },
                        taeter: "stamm/kreatur-furcht.js _kreaturMenschFlucht (die Sinne: Abstand und Gedächtnis)",
                        nicht: "10⁴ Stichproben-Arten; kein Sinn jenseits des Menschen",
                        leser: "stamm/kreatur-furcht.js:160 `_kreaturMenschFlucht` — kein Leser trägt Echo, UV, Magnetfeld oder Elektro-Sinn",
                        gruen: gut({ fangAbw: 10, zuordnung: 0.85 }, 4500),
                        attrappen: atr({ fangAbw: 10, zuordnung: 0.85 }, 4500),
                    },
                    7: {
                        u: { auge: AUGE_ORT },
                        soll: [K.soll(VH, 7, "Lebensweise blind benannt ≥ 0,8", { key: "benannt" }), K.soll(VH, 7, "100 fremde Saaten", { rel: "≥", zahl: 100, key: "saaten" })],
                        auge: { pose: "Third auf die Tiere fremder Saaten (heute: die Wiese)", vorbild: "Lebensweise blind benannt ≥ 0,8; Gegenprobe Sinn aus → Verhalten bricht" },
                        taeter: "stamm/kreatur-leben.js CREATURE_SOUL_NAMES (keine fremde Fauna)",
                        nicht: "jede Art jedes Planeten",
                        leser: "stamm/kreatur-leben.js:3622 — CREATURE_SOUL_NAMES liest keinen Samen: keine Fauna fremder Saaten",
                        gruen: gut({ benannt: 0.85, saaten: 100 }, 4500),
                        attrappen: atr({ benannt: 0.85, saaten: 100 }, 4500),
                    },
                },
            },
            // ═══ LEBENSZYKLUS: Jungtier, Jahreszeit, Brut, Stadien, Wurf und der Bestand über Generationen — im Gesetz des Bestands ═══
            [LZ]: {
                sek: 30,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "das Bildpaar Kitz/Hirsch (S2) und die Ereignisse im Bild (S3) — headless zählt die Probe Akte, Nester und den Bestand",
                mess: async function (H, U, M) {
                    const grund = function (r, T) {
                        const s = r.state;
                        const A = r.constructor;
                        const pm = s.playerMesh.position;
                        const fl = s.faunaLifecycle;
                        const wm = s.worldMeta;
                        const alt = { p: pm.clone(), yaw: s.yaw, pitch: s.pitch, modus: r.getGameMode(), max: s.maxCreatures, wurf: fl ? fl.lastTick : null, vor: new Set(s.creatures), perf: s.perfRegulator, grav: s.gravity, tod: s.timeOfDay, wetter: s.weather, season: s.season, tritt: new Set(Object.keys((wm && wm.tritt) || {})), schwach: new Set((r._trittSchwach || new Map()).keys()), reg: new Set(Object.keys(r._bestandRegionen().regionen)), lf: s.lifeField ? new Map([...s.lifeField].map(([k, e]) => [k, Object.assign({}, e)])) : null, seele: s.player && s.player.soul };
                        const RUHE = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
                        const flicken = [];
                        const flick = (n, f) => {
                            if (Object.prototype.hasOwnProperty.call(r, n)) throw new Error("flick: " + n + " trägt schon eine eigene Zeile");
                            flicken.push(n);
                            r[n] = f;
                        };
                        let t = performance.now();
                        const welt = (n) => {
                            s.perfRegulator = false;
                            for (let i = 0; i < n; i++) r._gameLoopTick((t += 1000 / 60));
                        };
                        const takt = (n, d) => {
                            for (let i = 0; i < n; i++) {
                                r._kreaturStossSchritt(d || 1 / 60);
                                r._trittDerLeiber();
                                r._leibKontakte();
                                r.updateCreatures(d || 1 / 60);
                            }
                        };
                        const boden = (x, z) => r.getTerrainHeightAt(x, z) + 0.5;
                        const ab = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const ruhig = (c) => (c.userData.emotions = Object.assign({}, RUHE));
                        const ruhigSpieler = () => s.player.emotions && Object.assign(s.player.emotions, RUHE);
                        const trocken = (x, z) => r._landAt(x, z) && !r._nassAt(x, z) && !(typeof r._imGrundriss === "function" && r._imGrundriss(x, z));
                        const land = (x0, z0, R, dMin) => {
                            for (let d = dMin || 0; d <= 600; d += 15) {
                                const n = Math.max(1, Math.round(d / 10));
                                for (let q = 0; q < n; q++) {
                                    const w = (q / n) * 2 * Math.PI;
                                    const x = x0 + Math.cos(w) * d;
                                    const z = z0 + Math.sin(w) * d;
                                    let ok = trocken(x, z);
                                    for (let k = 0; ok && k < 8; k++) ok = trocken(x + Math.cos(k * 0.785) * R, z + Math.sin(k * 0.785) * R);
                                    if (ok) return { x, z };
                                }
                            }
                            return null;
                        };
                        const tier = (x, z, seele, bs) => {
                            s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 2);
                            let nein = null;
                            const c = r.spawnCreatureAt(x, boden(x, z), z, "happy", seele, { precise: true, bodySize: bs || 1, absage: (g) => (nein = g) });
                            if (!c) throw new Error("spawnCreatureAt " + seele + ": " + nein);
                            ruhig(c);
                            return c;
                        };
                        const stelle = (x, z) => {
                            pm.set(x, r.getTerrainHeightAt(x, z) + A.PLAYER_FOOT_OFFSET, z);
                            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                        };
                        const stillFeld = () => {
                            if (fl) fl.lastTick = 1e12;
                        };
                        const zurueck = () => {
                            for (const n of flicken.splice(0)) delete r[n];
                            if (s.player && alt.seele && s.player.soul !== alt.seele) r.applyPlayerSoul(alt.seele);
                            for (const c of [...s.creatures]) if (!alt.vor.has(c)) r.removeCreature(c);
                            s.maxCreatures = alt.max;
                            if (fl) fl.lastTick = alt.wurf;
                            if (r.getGameMode() !== alt.modus) r.setGameMode(alt.modus);
                            pm.copy(alt.p);
                            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                            [s.yaw, s.pitch, s.perfRegulator, s.gravity] = [alt.yaw, alt.pitch, alt.perf, alt.grav];
                            if (s.season !== alt.season) r.setSeason(alt.season);
                            if (Math.abs(s.timeOfDay - alt.tod) > 1e-6) r._uhrSetzen(alt.tod, "regler");
                            if (s.weather !== alt.wetter && window.__wetterSetzen) window.__wetterSetzen(alt.wetter);
                            if (wm && wm.tritt) for (const k of Object.keys(wm.tritt)) if (!alt.tritt.has(k)) delete wm.tritt[k];
                            if (r._trittSchwach) for (const k of [...r._trittSchwach.keys()]) if (!alt.schwach.has(k)) r._trittSchwach.delete(k);
                            const F = r._bestandRegionen().regionen;
                            for (const k of Object.keys(F)) if (!alt.reg.has(k)) delete F[k];
                            if (alt.lf && s.lifeField) {
                                for (const k of [...s.lifeField.keys()]) if (!alt.lf.has(k)) s.lifeField.delete(k);
                                for (const [k, e] of alt.lf) {
                                    const n = s.lifeField.get(k);
                                    if (n) Object.assign(n, e);
                                    else s.lifeField.set(k, e);
                                }
                            }
                        };
                        return { s, A, pm, fl, wm, alt, RUHE, flick, welt, takt, boden, ab, r3, ruhig, ruhigSpieler, trocken, land, tier, stelle, stillFeld, zurueck };
                    };
                    const lauf = (fn, a) => H.seite("const G = (" + grund + ")(r, T); try { return await (" + fn + ")(r, T, " + JSON.stringify(a || {}) + ", G); } finally { G.zurueck(); }");
                    // DIE PROBE: die Jungtiere der nahen Regionen (Alter unter dem Bruchteil der Lebensdauer) und die Gestalt desselben Hirschs
                    // klein und groß (Höhe/Länge der Leib-Box); die Akte einer Herde in jeder Jahreszeit (`setSeason`); die Nester der Szene
                    // gegen die gezeichneten Vögel; die Stadien im Verzeichnis des Bestands; dann eine FRISCHE Region (eine Kachel ohne Bestand,
                    // deren Hydro steht): ihr Aufholen (`_bestandRegion`) und der Takt des Gesetzes weiter (`_bestandSchritt`) — die Würfe je
                    // Gattung (gezählt am Leser `_creatureNaturalBirth`) gegen PanTHERIA, die Generationen, die der Bestand trägt, und die
                    // Gegenprobe: die Geburt aus, der Takt läuft weiter
                    const probe = async function (r, T, a, G) {
                        const { s, A, pm, r3, welt, takt, land, tier, stelle, stillFeld, ruhigSpieler, flick } = G;
                        stillFeld();
                        const aus = {};
                        const maxS = A.FAUNA_MAX_AGE_MS / 1000;
                        const F = r._bestandRegionen().regionen;
                        let [jung, alle] = [0, 0];
                        for (const k of r._bestandNah())
                            for (const t of (F[k] || { tiere: [] }).tiere) {
                                alle++;
                                if (t.alterS < a.jungBruch * maxS) jung++;
                            }
                        aus.jung = { jung, alle, prozent: alle ? r3((100 * jung) / alle) : null };
                        const ort = land(pm.x, pm.z, 20, 40);
                        if (!ort) throw new Error("kein trockenes Land 40–600 m um den Spieler");
                        const form = (bs) => {
                            const c = tier(ort.x, ort.z, "wesen", bs);
                            const g = new T.Box3().setFromObject(c).getSize(new T.Vector3());
                            r.removeCreature(c);
                            return g.y / Math.max(g.x, g.z);
                        };
                        const [fk, fg] = [form(0.6), form(1.3)];
                        aus.proportion = { klein: r3(fk), gross: r3(fg), abwProzent: r3(Math.abs(fk / fg - 1) * 100) };
                        // die Jahreszeiten: die Akte einer Herde je Jahreszeit
                        r.setGameMode("frieden");
                        stelle(ort.x - 25, ort.z);
                        const jz = {};
                        for (const sz of ["spring", "summer", "autumn", "winter"]) {
                            r.setSeason(sz);
                            const h = [0, 1, 2].map((k) => tier(ort.x + k * 4, ort.z + (k % 2) * 3, "wesen"));
                            const n = {};
                            for (let k = 0; k < a.saisonTakte; k++) {
                                ruhigSpieler();
                                takt(1, 0.1);
                                for (const c of h) {
                                    const v = c.userData._verhaltenAktion && c.userData._verhaltenAktion.name;
                                    if (v) n[v] = (n[v] || 0) + 1;
                                }
                            }
                            for (const c of h) r.removeCreature(c);
                            jz[sz] = n;
                        }
                        const BRUNFT = /brunft|roehr|röhr|balz|kampf|revier|paar|werb/i;
                        const ereig = {};
                        for (const sz of Object.keys(jz)) ereig[sz] = Object.keys(jz[sz]).filter((k) => BRUNFT.test(k)).reduce((x, k) => x + jz[sz][k], 0);
                        const summe = Object.values(ereig).reduce((x, y) => x + y, 0);
                        const MONAT = { spring: 4, summer: 7, autumn: 10, winter: 1 };
                        const top = summe > 0 ? Object.keys(ereig).sort((x, y) => ereig[y] - ereig[x])[0] : null;
                        const dm = top ? Math.abs(MONAT[top] - a.brunftMonat) : null;
                        aus.saison = { akte: jz, ereignisse: summe, gipfel: top, gipfelAbw: top ? Math.min(dm, 12 - dm) : null };
                        // die Brut: Nester in der Szene gegen die gezeichneten Vögel
                        welt(a.weltTakte);
                        let nester = 0;
                        s.scene.traverse((o) => {
                            if (/nest|brut|gelege/i.test(o.name || "")) nester++;
                        });
                        const voegel = (s.vogelPool && s.vogelPool.mesh ? s.vogelPool.mesh.count : 0) + (s.vogelSchwarmPool && s.vogelSchwarmPool.mesh ? s.vogelSchwarmPool.mesh.count : 0);
                        aus.brut = { nester, voegel, paare: Math.floor(voegel / 2), quote: voegel >= 2 ? r3(Math.min(1, nester / Math.floor(voegel / 2))) : 0 };
                        // die Stadien: trägt ein Tier des Bestands ein Stadium (Ei, Larve, Puppe)?
                        const STAD = ["stadium", "stufe", "larve", "ei", "puppe", "imago", "metamorphose"];
                        let [mitSt, nT] = [0, 0];
                        for (const k of Object.keys(F))
                            for (const t of F[k].tiere) {
                                nT++;
                                if (STAD.some((x) => x in t)) mitSt++;
                            }
                        aus.stadien = { tiere: nT, mitStadium: mitSt, quote: nT ? r3(mitSt / nT) : null };
                        // die frische Region
                        const nah = r._bestandNah();
                        const [i0, j0] = nah[0].split(",").map(Number);
                        let key = null;
                        for (let d = 1; d <= 3 && !key; d++)
                            for (let i = -d; i <= d && !key; i++)
                                for (let j = -d; j <= d && !key; j++) {
                                    const k = i0 + i + "," + (j0 + j);
                                    if (!F[k] && r._bestandBereit(k)) key = k;
                                }
                        if (!key) throw new Error("keine frische Region mit stehender Hydro-Kachel um " + nah[0]);
                        const wuerfe = [];
                        const orig = r._creatureNaturalBirth;
                        flick("_creatureNaturalBirth", function (...x) {
                            const g = orig.apply(this, x);
                            for (const t of g) wuerfe.push({ g: t.g, v: t.v });
                            return g;
                        });
                        const B = A._bestandGesetz().B;
                        const tode = [];
                        const R = r._bestandRegion(key, true, 0, Infinity, tode);
                        const nachAufholen = R.tiere.length;
                        let [schritte, minN, leerBei, leer] = [0, Infinity, null, 0];
                        const t0 = performance.now();
                        const ziel = Math.ceil((a.generationen * maxS - A.BESTAND_REGION.aufholS) / B.taktS);
                        while (schritte < ziel && performance.now() - t0 < a.msDeckel) {
                            r._bestandSchritt(key, R, true, tode);
                            schritte++;
                            minN = Math.min(minN, R.tiere.length);
                            if (!R.tiere.length) {
                                leer++;
                                if (leerBei === null) leerBei = schritte;
                            }
                        }
                        const gen = (A.BESTAND_REGION.aufholS + schritte * B.taktS) / maxS;
                        // getragen: die Generationen bis zum ersten leeren Takt (danach wirft das Gesetz die Region aus dem Leeren neu)
                        const genGetragen = (A.BESTAND_REGION.aufholS + (leerBei === null ? schritte : leerBei) * B.taktS) / maxS;
                        const jeV = {};
                        for (const w of wuerfe) (jeV[w.v] = jeV[w.v] || { g: w.g, n: 0 }).n++;
                        const jeG = {};
                        for (const w of Object.values(jeV)) (jeG[w.g] = jeG[w.g] || []).push(w.n);
                        const mittel = {};
                        let faktor = null;
                        for (const g of Object.keys(jeG)) {
                            mittel[g] = r3(jeG[g].reduce((x, y) => x + y, 0) / jeG[g].length);
                            const ref = a.wurfRef[g];
                            if (ref) faktor = Math.max(faktor || 1, mittel[g] / ref, ref / mittel[g]);
                        }
                        aus.region = { key, nachAufholen, schritte, generationen: r3(gen), genGetragen: r3(genGetragen), leereTakte: leer, getragen: minN > 0 && R.tiere.length > 0, minN: Number.isFinite(minN) ? minN : null, ende: R.tiere.length, wuerfe: Object.keys(jeV).length, wurfMittel: mittel, wurfFaktor: r3(faktor) };
                        // die Gegenprobe: die Geburt aus, der Takt weiter (drei Lebensdauern)
                        delete r._creatureNaturalBirth;
                        flick("_creatureNaturalBirth", function () {
                            return [];
                        });
                        const vorG = R.tiere.length;
                        const n2 = Math.ceil((a.gegenLeben * maxS) / B.taktS);
                        window.__raffer(n2, () => r._bestandSchritt(key, R, true, tode), "gegenprobe");
                        aus.gegen = { vor: vorG, nach: R.tiere.length, lebensdauern: a.gegenLeben, alleAlt: R.tiere.length ? r3(Math.min(...R.tiere.map((t) => t.alterS)) / maxS) : null };
                        aus.taktS = B.taktS;
                        aus.lebensdauerS = maxS;
                        return aus;
                    };
                    const z = await lauf(probe, { jungBruch: 0.1, saisonTakte: 200, brunftMonat: 10, weltTakte: 20, generationen: 100, msDeckel: 9000, gegenLeben: 3, wurfRef: { deer: 1, wolf: 5, fox: 4.5, bear: 2.2 } });
                    const augeNoetig = Object.keys(U).some((nr) => U[nr].auge);
                    const auge = augeNoetig ? await M.auge("tiere-lebenszyklus", U[Object.keys(U).find((nr) => U[nr].auge)].auge) : undefined;
                    const zeuge = { antworten: z.region.schritte + z.jung.alle, streuung: z.region.ende !== z.region.nachAufholen || z.region.wuerfe > 1 ? Math.abs(z.region.ende - z.region.nachAufholen) + z.region.wuerfe : 0, vor: z.gegen.vor, nach: z.gegen.nach };
                    const aus = M.teil || {};
                    const nimm = (nr, werte, nicht, mitAuge) => {
                        if (!U[nr]) return;
                        aus[nr] = { werte, zeuge, ...(mitAuge ? { auge } : {}), ...(nicht ? { nicht } : {}) };
                    };
                    nimm(2, { jungProzent: z.jung.prozent, proportionAbw: z.proportion.abwProzent }, z.proportion.abwProzent < 5 ? "kein Leib wächst: klein und groß tragen dieselbe Gestalt (Höhe/Länge " + z.proportion.klein + " ↔ " + z.proportion.gross + ")" : null, true);
                    nimm(3, { ereignisse: z.saison.ereignisse, gipfelAbw: z.saison.gipfelAbw }, z.saison.ereignisse === 0 ? "keine Brunft, keine Balz, kein Revierkampf: 0 Ereignisse über vier Jahreszeiten" : null);
                    nimm(4, { nestQuote: z.brut.quote, voegel: z.brut.voegel }, "kein Nest, keine Brut, kein Laich: " + z.brut.nester + " Nester bei " + z.brut.voegel + " gezeichneten Vögeln");
                    nimm(5, { stadienQuote: z.stadien.quote }, "keine Stadien: " + z.stadien.mitStadium + " von " + z.stadien.tiere + " Tieren des Bestands tragen ein Stadium");
                    nimm(6, { wurfFaktor: z.region.wurfFaktor }, "10⁴ Stichproben-Arten mit der Strategie aus dem Genom: die Welt trägt 4 Gattungen mit einer Wurf-Zeile");
                    nimm(7, { generationen: z.region.genGetragen, ohneGeburtRest: z.gegen.nach }, "keine fremde Saat, keine fremde Fortpflanzung (Knospung, Generationswechsel); die Region stand " + z.region.leereTakte + " Takte leer und warf sich aus dem Leeren neu, ohne Geburt blieben " + z.gegen.nach + " von " + z.gegen.vor + " Tieren nach " + z.gegen.lebensdauern + " Lebensdauern");
                    return { sprossen: aus, zyklus: z };
                },
                sprossen: {
                    2: {
                        u: { auge: AUGE_ORT },
                        soll: [K.soll(LZ, 2, "Bildpaar Kitz/Hirsch Panel ≥ 0,7", { key: "panel" }), K.soll(LZ, 2, "Jungtiere ≥ 10 % einer Herde im Frühsommer", { key: "jungProzent", einheit: "%" })],
                        auge: { pose: "Third auf eine Herde mit Kitz aus 15 m im Frühsommer (heute: die Wiese)", vorbild: "Foto Kitz/Hirsch; Panel ≥ 0,7" },
                        taeter: "stamm/kreatur-leben.js _creatureNaturalBirth (die Größe fällt bei der Geburt, nie mit dem Alter)",
                        nicht: "ein sichtbares Jungtier, das wächst",
                        leser: "stamm/kreatur-leben.js:1993 `_creatureBodySize` — die Größe des Geworfenen fällt einmal aus dem Strom; kein Leser liest `alterS` für Größe und Proportion",
                        gruen: gut({ panel: 0.8, jungProzent: 15, proportionAbw: 20 }, 300),
                        attrappen: atr({ panel: 0.8, jungProzent: 15, proportionAbw: 20 }, 300),
                    },
                    3: {
                        u: {},
                        soll: [K.soll(LZ, 3, "Gipfel im Monat der Natur ±1", { rel: "≤", zahl: 1, key: "gipfelAbw", einheit: "Monate" })],
                        zeuge: zeugeWelt(100, true),
                        taeter: "tetrapoda-core.js VERHALTEN (keine Stimmung liest die Jahreszeit)",
                        nicht: "Brunft, Balz, Revierkampf zur Jahreszeit der Art",
                        leser: "tetrapoda-core.js:99 `VERHALTEN` — das Buch der Aktionen trägt keine Brunft, kein Röhren, keine Balz",
                        unklar: "„der Monat der Natur“: der Rothirsch röhrt im Oktober (Clutton-Brock, Guinness & Albon 1982) — die Probe misst die Brunft-Akte je Jahreszeit (Frühling 4, Sommer 7, Herbst 10, Winter 1).",
                        gruen: gut({ ereignisse: 40, gipfelAbw: 0 }, 300),
                        attrappen: atr({ ereignisse: 40, gipfelAbw: 0 }, 300, true),
                    },
                    4: {
                        u: {},
                        soll: [K.soll(LZ, 4, "Brutpaare mit sichtbarem Nest ≥ 0,8", { key: "nestQuote" })],
                        zeuge: zeugeWelt(100, true),
                        taeter: "tetrapoda-core.js VOGEL_GESETZ (der Vogel als Pool ohne Brut)",
                        nicht: "Nest, Bau, Brut, Laich, Brutpflege",
                        leser: "tetrapoda-core.js:2376 `VOGEL_GESETZ` — der Vogel fliegt als Instanz eines Pools; kein Leser baut Nest, Gelege oder Fütterung",
                        gruen: gut({ nestQuote: 0.9, voegel: 30 }, 300),
                        attrappen: atr({ nestQuote: 0.9, voegel: 30 }, 300, true),
                    },
                    5: {
                        u: {},
                        soll: [K.soll(LZ, 5, "richtig ≥ 0,9", { key: "stadienQuote" })],
                        zeuge: zeugeWelt(100, true),
                        taeter: "stamm/kreatur-leben.js _creatureNaturalBirth (das Geworfene ist ein fertiger Leib)",
                        nicht: "Lebenszyklen aller Klassen: Metamorphose, Larve, Laichzug",
                        leser: "stamm/kreatur-leben.js:1996 `alterS` — das Geworfene beginnt mit alterS 0 als fertiger Leib, kein Stadium",
                        gruen: gut({ stadienQuote: 0.95 }, 300),
                        attrappen: atr({ stadienQuote: 0.95 }, 300, true),
                    },
                    6: {
                        u: {},
                        soll: [K.soll(LZ, 6, "Wurfgröße", { rel: "≤", zahl: 2, key: "wurfFaktor", refQuelle: "PanTHERIA (Jones et al. 2009, Ecology 90:2648): Wurfgröße Rothirsch 1,0 · Wolf 5,0 · Rotfuchs 4,5 · Braunbär 2,2 — das Band der Allometrie ±Faktor 2" })],
                        zeuge: zeugeWelt(100, true),
                        taeter: "tetrapoda-core.js VERHALTEN.herde.wurf (die Kopfzahl der Geburt als Zeile)",
                        nicht: "10⁴ Stichproben-Arten, Fortpflanzungs-Strategie aus dem Genom",
                        leser: "tetrapoda-core.js:289 `wurf` — die Kopfzahl der Geburt ist eine Zeile je Gattung (das Rudel), nie aus Masse und Umwelt",
                        gruen: gut({ wurfFaktor: 1.4 }, 300),
                        attrappen: atr({ wurfFaktor: 1.4 }, 300, true),
                    },
                    7: {
                        u: {},
                        soll: [K.soll(LZ, 7, "Bestand über 100 Generationen getragen", { rel: "≥", zahl: 100, key: "generationen" }), K.soll(LZ, 7, "100 fremde Saaten", { rel: "≥", zahl: 100, key: "saaten" })],
                        zeuge: zeugeWelt(100, true),
                        taeter: "stamm/kreatur-leben.js _bestandTakt (der Bestand einer Saat)",
                        nicht: "jedes Tier jedes Planeten, fremde Fortpflanzung",
                        leser: "stamm/kreatur-leben.js:3622 — CREATURE_SOUL_NAMES liest keinen Samen: keine fremde Fauna, keine Knospung, kein Generationswechsel",
                        gruen: gut({ generationen: 120, saaten: 100, ohneGeburtRest: 0 }, 300),
                        attrappen: atr({ generationen: 120, saaten: 100, ohneGeburtRest: 0 }, 300, true),
                    },
                },
            },
            // ═══ MASSE: der Star-Trupp aus den gezeichneten Leibern (Φ, Kohäsion, Korrelationslänge), die Herde im Gras, die Dichte ═══
            [MA]: {
                sek: 25,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "die Bilder der Auge-Sprossen S2, S3, S6, S7 und der Bild-Flicker an der Sichtgrenze (S5) — headless misst die Probe die Instanzen der Pools",
                mess: async function (H, U, M) {
                    const grund = function (r, T) {
                        const s = r.state;
                        const A = r.constructor;
                        const pm = s.playerMesh.position;
                        const fl = s.faunaLifecycle;
                        const wm = s.worldMeta;
                        const alt = { p: pm.clone(), yaw: s.yaw, pitch: s.pitch, modus: r.getGameMode(), max: s.maxCreatures, wurf: fl ? fl.lastTick : null, vor: new Set(s.creatures), perf: s.perfRegulator, grav: s.gravity, tod: s.timeOfDay, wetter: s.weather, season: s.season, tritt: new Set(Object.keys((wm && wm.tritt) || {})), schwach: new Set((r._trittSchwach || new Map()).keys()), reg: new Set(Object.keys(r._bestandRegionen().regionen)), lf: s.lifeField ? new Map([...s.lifeField].map(([k, e]) => [k, Object.assign({}, e)])) : null, seele: s.player && s.player.soul };
                        const RUHE = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
                        const flicken = [];
                        const flick = (n, f) => {
                            if (Object.prototype.hasOwnProperty.call(r, n)) throw new Error("flick: " + n + " trägt schon eine eigene Zeile");
                            flicken.push(n);
                            r[n] = f;
                        };
                        let t = performance.now();
                        const welt = (n) => {
                            s.perfRegulator = false;
                            for (let i = 0; i < n; i++) r._gameLoopTick((t += 1000 / 60));
                        };
                        const takt = (n, d) => {
                            for (let i = 0; i < n; i++) {
                                r._kreaturStossSchritt(d || 1 / 60);
                                r._trittDerLeiber();
                                r._leibKontakte();
                                r.updateCreatures(d || 1 / 60);
                            }
                        };
                        const boden = (x, z) => r.getTerrainHeightAt(x, z) + 0.5;
                        const ab = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const ruhig = (c) => (c.userData.emotions = Object.assign({}, RUHE));
                        const ruhigSpieler = () => s.player.emotions && Object.assign(s.player.emotions, RUHE);
                        const trocken = (x, z) => r._landAt(x, z) && !r._nassAt(x, z) && !(typeof r._imGrundriss === "function" && r._imGrundriss(x, z));
                        const land = (x0, z0, R, dMin) => {
                            for (let d = dMin || 0; d <= 600; d += 15) {
                                const n = Math.max(1, Math.round(d / 10));
                                for (let q = 0; q < n; q++) {
                                    const w = (q / n) * 2 * Math.PI;
                                    const x = x0 + Math.cos(w) * d;
                                    const z = z0 + Math.sin(w) * d;
                                    let ok = trocken(x, z);
                                    for (let k = 0; ok && k < 8; k++) ok = trocken(x + Math.cos(k * 0.785) * R, z + Math.sin(k * 0.785) * R);
                                    if (ok) return { x, z };
                                }
                            }
                            return null;
                        };
                        const tier = (x, z, seele, bs) => {
                            s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 2);
                            let nein = null;
                            const c = r.spawnCreatureAt(x, boden(x, z), z, "happy", seele, { precise: true, bodySize: bs || 1, absage: (g) => (nein = g) });
                            if (!c) throw new Error("spawnCreatureAt " + seele + ": " + nein);
                            ruhig(c);
                            return c;
                        };
                        const stelle = (x, z) => {
                            pm.set(x, r.getTerrainHeightAt(x, z) + A.PLAYER_FOOT_OFFSET, z);
                            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                        };
                        const stillFeld = () => {
                            if (fl) fl.lastTick = 1e12;
                        };
                        const zurueck = () => {
                            for (const n of flicken.splice(0)) delete r[n];
                            if (s.player && alt.seele && s.player.soul !== alt.seele) r.applyPlayerSoul(alt.seele);
                            for (const c of [...s.creatures]) if (!alt.vor.has(c)) r.removeCreature(c);
                            s.maxCreatures = alt.max;
                            if (fl) fl.lastTick = alt.wurf;
                            if (r.getGameMode() !== alt.modus) r.setGameMode(alt.modus);
                            pm.copy(alt.p);
                            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                            [s.yaw, s.pitch, s.perfRegulator, s.gravity] = [alt.yaw, alt.pitch, alt.perf, alt.grav];
                            if (s.season !== alt.season) r.setSeason(alt.season);
                            if (Math.abs(s.timeOfDay - alt.tod) > 1e-6) r._uhrSetzen(alt.tod, "regler");
                            if (s.weather !== alt.wetter && window.__wetterSetzen) window.__wetterSetzen(alt.wetter);
                            if (wm && wm.tritt) for (const k of Object.keys(wm.tritt)) if (!alt.tritt.has(k)) delete wm.tritt[k];
                            if (r._trittSchwach) for (const k of [...r._trittSchwach.keys()]) if (!alt.schwach.has(k)) r._trittSchwach.delete(k);
                            const F = r._bestandRegionen().regionen;
                            for (const k of Object.keys(F)) if (!alt.reg.has(k)) delete F[k];
                            if (alt.lf && s.lifeField) {
                                for (const k of [...s.lifeField.keys()]) if (!alt.lf.has(k)) s.lifeField.delete(k);
                                for (const [k, e] of alt.lf) {
                                    const n = s.lifeField.get(k);
                                    if (n) Object.assign(n, e);
                                    else s.lifeField.set(k, e);
                                }
                            }
                        };
                        return { s, A, pm, fl, wm, alt, RUHE, flick, welt, takt, boden, ab, r3, ruhig, ruhigSpieler, trocken, land, tier, stelle, stillFeld, zurueck };
                    };
                    const lauf = (fn, a) => H.seite("const G = (" + grund + ")(r, T); try { return await (" + fn + ")(r, T, " + JSON.stringify(a || {}) + ", G); } finally { G.zurueck(); }");
                    // DIE PROBE: der Spieler an der nächsten Zelle der Schwarm-Karte (`_schwarmKarte`), der Takt des Spiels; zwei Frames der
                    // Instanzen des Star-Pools (`vogelSchwarmPool`) — der größte Trupp (Bindung 30 m): Ausrichtung Φ = |Σ v̂|/N, Kohäsion (Anteil
                    // mit Nachbar unter 3 × Median-Abstand), Glied im Glied (Paare unter der Leib-Länge), die Korrelationslänge der
                    // Geschwindigkeits-Schwankung (erster Nulldurchgang von C(r), Cavagna 2010) über die Ausdehnung L; die Dichte: gezeichnete
                    // Instanzen gegen die Glieder des Gesetzes. Dann zehn Hirsche als Verband im pfad, vom Spieler getrieben: die Zellen, deren
                    // Gras der Durchzug senkt (worldMeta.tritt ab der Stufe des Pfads)
                    const probe = async function (r, T, a, G) {
                        const { s, A, pm, wm, r3, welt, takt, land, tier, stelle, stillFeld, ruhigSpieler } = G;
                        stillFeld();
                        if (window.__wetterSetzen) window.__wetterSetzen("sunny");
                        r._uhrSetzen(0.42, "regler");
                        const aus = {};
                        const sk = r._schwarmKarte;
                        const zellen = sk && sk.zellen ? [...sk.zellen.values()] : [];
                        let ziel = null;
                        for (const c of zellen) {
                            const d = Math.hypot(c.x - pm.x, c.z - pm.z);
                            if (Number.isFinite(d) && (!ziel || d < ziel.d)) ziel = { x: c.x, z: c.z, d };
                        }
                        if (ziel) stelle(ziel.x + 30, ziel.z + 30);
                        welt(a.takte);
                        // der Blick auf den nächsten fliegenden Trupp (das Bild zeichnet nur, was im Blick steht): 40 m vor sein Leittier
                        for (let v = 0; v < 3 && !((s.schwarm || {}).imBild > 0); v++) {
                            let best = null;
                            for (const c of sk && sk.zellen ? sk.zellen.values() : []) {
                                if (!c.leit) continue;
                                const L = c.leit;
                                const [x, z] = [Number.isFinite(L.x) ? L.x : c.x, Number.isFinite(L.z) ? L.z : c.z];
                                const d = Math.hypot(x - pm.x, z - pm.z);
                                if (!best || d < best.d) best = { x, z, d };
                            }
                            if (!best) break;
                            stelle(best.x - 40, best.z);
                            [s.yaw, s.pitch] = [Math.atan2(best.x - pm.x, best.z - pm.z), 0.15];
                            welt(10);
                        }
                        const pool = s.vogelSchwarmPool && s.vogelSchwarmPool.mesh;
                        const m4 = new T.Matrix4();
                        // die gezeichneten Glieder: die Vögel der Karte, die das Bild dieses Takts trägt (`_vogelZeichnen` zeichnet je Vogel
                        // seine Teile in den Pool — gezählt wird der Vogel, nicht das Teil)
                        const lese = () => (sk && sk.voegel ? sk.voegel.map((v) => [v.x, v.y, v.z]) : []);
                        const P1 = lese();
                        const lage1 = Object.assign({}, s.schwarm || {});
                        welt(1);
                        const P2 = lese();
                        const n0 = Math.min(P1.length, P2.length);
                        const d3 = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
                        // der größte Trupp (Bindung 30 m)
                        const teil = new Array(n0).fill(-1);
                        let best = [];
                        for (let i = 0; i < n0; i++) {
                            if (teil[i] >= 0) continue;
                            const st = [i];
                            const komp = [];
                            teil[i] = i;
                            while (st.length) {
                                const j = st.pop();
                                komp.push(j);
                                for (let k = 0; k < n0; k++) if (teil[k] < 0 && d3(P1[j], P1[k]) < 30) (teil[k] = i), st.push(k);
                            }
                            if (komp.length > best.length) best = komp;
                        }
                        const N = best.length;
                        let leibM = 0.2;
                        if (pool && pool.count) {
                            if (!pool.geometry.boundingBox) pool.geometry.computeBoundingBox();
                            const g = pool.geometry.boundingBox.getSize(new T.Vector3());
                            pool.getMatrixAt(0, m4);
                            leibM = Math.max(0.05, Math.max(g.x, g.y, g.z) * new T.Vector3().setFromMatrixScale(m4).x);
                        }
                        if (N >= 3) {
                            const V = best.map((i) => [P2[i][0] - P1[i][0], P2[i][1] - P1[i][1], P2[i][2] - P1[i][2]]);
                            const sum = [0, 0, 0];
                            const mv = [0, 0, 0];
                            for (const v of V) {
                                const l = Math.hypot(v[0], v[1], v[2]) || 1;
                                for (let q = 0; q < 3; q++) (sum[q] += v[q] / l), (mv[q] += v[q] / N);
                            }
                            const phi = Math.hypot(sum[0], sum[1], sum[2]) / N;
                            const nn = best.map((i) => Math.min(...best.filter((j) => j !== i).map((j) => d3(P1[i], P1[j]))));
                            const med = [...nn].sort((x, y) => x - y)[Math.floor(N / 2)];
                            const koh = nn.filter((x) => x <= 3 * med).length / N;
                            let ueber = 0;
                            const bins = new Array(a.binN).fill(0);
                            const zahl = new Array(a.binN).fill(0);
                            const dv = V.map((v) => [v[0] - mv[0], v[1] - mv[1], v[2] - mv[2]]);
                            let L = 0;
                            for (let i = 0; i < N; i++)
                                for (let j = i + 1; j < N; j++) {
                                    const r0 = d3(P1[best[i]], P1[best[j]]);
                                    L = Math.max(L, r0);
                                    if (r0 < leibM) ueber++;
                                    const b = Math.floor(r0 / a.binM);
                                    if (b < a.binN) (bins[b] += dv[i][0] * dv[j][0] + dv[i][1] * dv[j][1] + dv[i][2] * dv[j][2]), zahl[b]++;
                                }
                            let r0 = null;
                            for (let b = 0; b < a.binN; b++) if (zahl[b] > 0 && bins[b] / zahl[b] < 0) {
                                r0 = (b + 0.5) * a.binM;
                                break;
                            }
                            aus.trupp = { n: N, phi: r3(phi), kohaesion: r3(koh), ueberlapp: ueber, leibM: r3(leibM), L: r3(L), r0: r3(r0), xiL: r0 && L ? r3(r0 / L) : null, nnMedian: r3(med), vMittel: r3(Math.hypot(mv[0], mv[1], mv[2]) * 60) };
                        } else aus.trupp = { n: N, phi: null };
                        aus.dichte = { gezeichnet: P1.length, gesetz: lage1.glieder || 0, imBild: lage1.imBild || 0, fliegen: lage1.fliegen || 0, teile: pool ? pool.count : 0, zellen: zellen.length };
                        aus.fisch = { gezeichnet: s.fischPool && s.fischPool.mesh ? s.fischPool.mesh.count : 0 };
                        // die Herde treibt durch das Gras
                        const ort = land(pm.x, pm.z, 25, 40);
                        if (!ort) throw new Error("kein trockenes Land 40–600 m um den Spieler");
                        r.setGameMode("pfad");
                        const herde = [];
                        for (let k = 0; k < 10; k++) herde.push(tier(ort.x + (k % 4) * 3, ort.z + Math.floor(k / 4) * 3, "wesen"));
                        r._kreaturVerbinden(herde);
                        const vorT = new Set(Object.keys((wm && wm.tritt) || {}));
                        const vorS = new Set((r._trittSchwach || new Map()).keys());
                        stelle(ort.x - 60, ort.z);
                        const start = herde.map((c) => [c.position.x, c.position.z]);
                        for (let k = 0; k < a.treibTakte; k++) {
                            const cx = herde.reduce((x, c) => x + c.position.x, 0) / herde.length;
                            const cz = herde.reduce((x, c) => x + c.position.z, 0) / herde.length;
                            const [dx, dz] = [cx - pm.x, cz - pm.z];
                            const d = Math.hypot(dx, dz) || 1;
                            if (d > 20) (pm.x += (dx / d) * s.speed * 2 * (1 / 60)), (pm.z += (dz / d) * s.speed * 2 * (1 / 60));
                            pm.y = r.getTerrainHeightAt(pm.x, pm.z) + A.PLAYER_FOOT_OFFSET;
                            ruhigSpieler();
                            takt(1, 1 / 60);
                        }
                        const neu = Object.keys((wm && wm.tritt) || {}).filter((k) => !vorT.has(k));
                        const gras = neu.filter((k) => A._trittStufe(wm.tritt[k][0]) > 0).length;
                        const weg = herde.reduce((x, c, i) => x + Math.hypot(c.position.x - start[i][0], c.position.z - start[i][1]), 0) / herde.length;
                        aus.herde = { n: herde.length, grasZellen: gras, trittZellen: neu.length, schwach: [...(r._trittSchwach || new Map()).keys()].filter((k) => !vorS.has(k)).length, wegM: r3(weg), flucht: herde.filter((c) => c.userData._motionZustand === "flucht").length };
                        return aus;
                    };
                    const z = await lauf(probe, { takte: 40, binM: 2, binN: 40, treibTakte: 600 });
                    const augeNoetig = Object.keys(U).some((nr) => U[nr].auge);
                    const auge = augeNoetig ? await M.auge("tiere-masse", U[Object.keys(U).find((nr) => U[nr].auge)].auge) : undefined;
                    const zeuge = { antworten: z.trupp.n + z.herde.trittZellen, streuung: z.trupp.nnMedian || z.herde.wegM || 0, vor: 0, nach: z.herde.trittZellen + z.trupp.n };
                    const dichteAbw = z.dichte.gesetz > 0 ? Math.round(Math.abs(z.dichte.gezeichnet / z.dichte.gesetz - 1) * 1000) / 10 : null;
                    const aus = M.teil || {};
                    const nimm = (nr, werte, nicht, mitAuge) => {
                        if (!U[nr]) return;
                        aus[nr] = { werte, zeuge, ...(mitAuge ? { auge } : {}), ...(nicht ? { nicht } : {}) };
                    };
                    nimm(2, { phi: z.trupp.phi, kohaesion: z.trupp.kohaesion, glieder: z.trupp.n, ueberlapp: z.trupp.ueberlapp }, "10² Glieder im Fischschwarm: die Welt zeichnet " + z.fisch.gezeichnet + " Fische in Trupps zu höchstens 4; der Star-Trupp trägt " + z.trupp.n + " Glieder", true);
                    nimm(3, { glieder: z.trupp.n }, "10³ Glieder (Köderball, Gnu-Herde): der größte Trupp trägt " + z.trupp.n, true);
                    nimm(4, { xiL: z.trupp.xiL }, "10²–10⁴ Glieder: eine Trupp-Größe (" + z.trupp.n + "), die Korrelationslänge über L " + z.trupp.xiL + " ist nicht über Größen vergleichbar");
                    nimm(5, { grasZellen: z.herde.grasZellen, trittZellen: z.herde.trittZellen }, "10⁵ Leiber bis zum Horizont: die Kappe der Leiber ist 20 (die Herde " + z.herde.n + " zog " + z.herde.wegM + " m und trat " + z.herde.schwach + " Zellen unter der Stufe des Pfads, " + z.herde.grasZellen + " darüber: das Gras sinkt nicht)");
                    nimm(6, {}, "10⁶ Glieder: Murmuration, Sardinenzug", true);
                    nimm(7, {}, "10⁹ Glieder: kein Heuschreckenschwarm, kein Kahlfraß", true);
                    nimm(8, { dichteAbw }, "Krill-Maß 10¹⁴ Leiber: gezeichnet " + z.dichte.gezeichnet + " gegen " + z.dichte.gesetz + " Glieder des Gesetzes");
                    return { sprossen: aus, masse: z };
                },
                sprossen: {
                    2: {
                        u: { auge: AUGE_ORT },
                        soll: [K.soll(MA, 2, "Φ und Kohäsion aus den gezeichneten Leibern", { rel: "≥", zahl: 0.8, key: "phi", refQuelle: "die Stufe S1 dieser Leiter (Ausrichtung Φ ≥ 0,8); Ballerini et al. 2008 (PNAS 105:1232): Star-Trupp Φ 0,96" })],
                        auge: { pose: "Third auf eine Murmuration von 10² Staren (heute: die Wiese)", vorbild: "Murmuration-Film; die Silhouette gegen den Film" },
                        taeter: "tetrapoda-core.js FISCH_GESETZ glieder [1, 4] (der Fisch-Trupp)",
                        nicht: "10² Glieder: Fischschwarm",
                        leser: "tetrapoda-core.js:2824 `glieder` — der Fisch-Trupp trägt 1–4 Glieder, kein Schwarm",
                        gruen: gut({ phi: 0.95, kohaesion: 0.95, glieder: 120, ueberlapp: 0 }, 150),
                        attrappen: atr({ phi: 0.95, kohaesion: 0.95, glieder: 120, ueberlapp: 0 }, 150),
                    },
                    3: {
                        u: { auge: AUGE_ORT },
                        soll: [K.soll(MA, 3, "Nachbarzahl im Band Ballerini", { quelleFeld: "tiefe", quelleWort: "topologisch 6–7 Nachbarn", rel: "band", zahl: 6, bis: 7, key: "nachbarn" })],
                        auge: { pose: "Unterwasser auf einen Köderball von 10³ (heute: die Wiese)", vorbild: "Unterwasser-Film; Konvexität und Lückenfläche" },
                        taeter: "tetrapoda-core.js VOGEL_GESETZ.schwarm glieder [60, 140]",
                        nicht: "10³ Glieder: Köderball, Gnu-Herde am Fluss",
                        leser: "tetrapoda-core.js:2426 `glieder` — der Star-Trupp trägt 60–140 Glieder; kein Leser zeichnet 10³",
                        gruen: gut({ nachbarn: 6.5, glieder: 1000 }, 150),
                        attrappen: atr({ nachbarn: 6.5, glieder: 1000 }, 150),
                    },
                    4: {
                        u: {},
                        soll: [K.soll(MA, 4, "Korrelationslänge/Größe konstant ±20 % über 10²–10⁴ (Cavagna)", { rel: "≤", zahl: 20, key: "xiKonstAbw", einheit: "%" }), K.soll(MA, 4, "Wellentempo ±30 %", { rel: "≤", zahl: 30, key: "welleAbw", einheit: "%" })],
                        zeuge: zeugeWelt(10, true),
                        taeter: "tetrapoda-core.js VOGEL_GESETZ.schwarm glieder [60, 140]",
                        nicht: "10⁴ Glieder",
                        leser: "tetrapoda-core.js:2426 `glieder` — höchstens 140 Glieder je Trupp: die Korrelationslänge ist über 10²–10⁴ nicht vergleichbar",
                        gruen: gut({ xiKonstAbw: 10, welleAbw: 15, xiL: 0.35 }, 150),
                        attrappen: atr({ xiKonstAbw: 10, welleAbw: 15, xiL: 0.35 }, 150, true),
                    },
                    5: {
                        u: {},
                        soll: [K.soll(MA, 5, "Bild-Flicker an der Sichtgrenze < 1 % der Pixel", { key: "flicker", einheit: "%" }), K.soll(MA, 5, "Grashöhe nach Durchzug sinkt messbar", { rel: ">", zahl: 0, key: "grasZellen", refQuelle: "die Gras-Senke des Tritts (TRITT.pfadGras, `_trittStufe`): mindestens eine Zelle über der Stufe des Pfads" })],
                        zeuge: zeugeWelt(10, true),
                        taeter: "stamm/dirigent-kern.js maxCreatures 20 (die Kappe der Leiber)",
                        nicht: "10⁵ Leiber: Gnu-Strom bis zum Horizont, Vogelfelsen, Krillwolke",
                        leser: "stamm/dirigent-kern.js:280 `maxCreatures` — 20 Leiber; kein Leser zeichnet eine Masse bis zum Horizont",
                        gruen: gut({ flicker: 0.5, grasZellen: 30, trittZellen: 200 }, 150),
                        attrappen: atr({ flicker: 0.5, grasZellen: 30, trittZellen: 200 }, 150, true),
                    },
                    6: {
                        u: { auge: AUGE_ORT },
                        soll: [K.soll(MA, 6, "Draufsicht gegen Luftbild des Sardinenzugs", { quelleFeld: "tiefe", quelleWort: "Dichtewellen 20–40 m/s", rel: "band", zahl: 20, bis: 40, key: "welleMS", einheit: "m/s" })],
                        auge: { pose: "Draufsicht aus 300 m auf 10⁶ Glieder (heute: die Wiese)", vorbild: "Luftbild des Sardinenzugs; Zoom-Probe an 10 Stellen" },
                        taeter: "tetrapoda-core.js VOGEL_GESETZ.schwarm glieder [60, 140]",
                        nicht: "10⁶ Glieder: Murmuration über dem Ried, Sardinenzug über 10 km",
                        leser: "tetrapoda-core.js:2426 `glieder` — höchstens 140 Glieder je Trupp",
                        gruen: gut({ welleMS: 30 }, 150),
                        attrappen: atr({ welleMS: 30 }, 150),
                    },
                    7: {
                        u: { auge: AUGE_ORT },
                        soll: [K.soll(MA, 7, "Horizont-Bild Panel ≥ 0,7", { key: "panel" })],
                        auge: { pose: "Horizont unter einem Heuschreckenschwarm (heute: die Wiese)", vorbild: "Horizont-Foto eines Heuschreckenschwarms; Kahlfraß je Stunde nach FAO" },
                        taeter: "tetrapoda-core.js BESTAEUBER_GESETZ (kein Fraß-Schwarm)",
                        nicht: "10⁹ Glieder: Heuschreckenschwarm",
                        leser: "tetrapoda-core.js:2908 `BESTAEUBER_GESETZ` — das einzige Insekt fliegt einzeln, frisst nicht",
                        gruen: gut({ panel: 0.8 }, 150),
                        attrappen: atr({ panel: 0.8 }, 150),
                    },
                    8: {
                        u: {},
                        soll: [K.soll(MA, 8, "Dichte je Zelle ±10 % über alle Stufen", { rel: "≤", zahl: 10, key: "dichteAbw", einheit: "%" })],
                        zeuge: zeugeWelt(10, true),
                        taeter: "tetrapoda-core.js VOGEL_GESETZ.schwarm (Zellen nur nah am Spieler)",
                        nicht: "Krill-Maß 10¹⁴ Leiber auf dem Planeten",
                        leser: "tetrapoda-core.js:2426 `glieder` — die Schwarm-Karte trägt Trupps nur um den Spieler; kein Leser trägt eine Dichte über alle Stufen",
                        gruen: gut({ dichteAbw: 5 }, 150),
                        attrappen: atr({ dichteAbw: 5 }, 150, true),
                    },
                },
            },
            // ═══ WANDERUNG: ein Individuum über einen Spieltag im Takt, der Anker des Bestands unter Jahreszeit und Regen ═══
            [WA]: {
                sek: 40,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "die Spur im Bild (der Wildwechsel als Pfad im Boden, S3) — headless misst die Probe Bahn, Hülle und Tritt-Zellen",
                mess: async function (H, U, M) {
                    const grund = function (r, T) {
                        const s = r.state;
                        const A = r.constructor;
                        const pm = s.playerMesh.position;
                        const fl = s.faunaLifecycle;
                        const wm = s.worldMeta;
                        const alt = { p: pm.clone(), yaw: s.yaw, pitch: s.pitch, modus: r.getGameMode(), max: s.maxCreatures, wurf: fl ? fl.lastTick : null, vor: new Set(s.creatures), perf: s.perfRegulator, grav: s.gravity, tod: s.timeOfDay, wetter: s.weather, season: s.season, tritt: new Set(Object.keys((wm && wm.tritt) || {})), schwach: new Set((r._trittSchwach || new Map()).keys()), reg: new Set(Object.keys(r._bestandRegionen().regionen)), lf: s.lifeField ? new Map([...s.lifeField].map(([k, e]) => [k, Object.assign({}, e)])) : null, seele: s.player && s.player.soul };
                        const RUHE = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
                        const flicken = [];
                        const flick = (n, f) => {
                            if (Object.prototype.hasOwnProperty.call(r, n)) throw new Error("flick: " + n + " trägt schon eine eigene Zeile");
                            flicken.push(n);
                            r[n] = f;
                        };
                        let t = performance.now();
                        const welt = (n) => {
                            s.perfRegulator = false;
                            for (let i = 0; i < n; i++) r._gameLoopTick((t += 1000 / 60));
                        };
                        const takt = (n, d) => {
                            for (let i = 0; i < n; i++) {
                                r._kreaturStossSchritt(d || 1 / 60);
                                r._trittDerLeiber();
                                r._leibKontakte();
                                r.updateCreatures(d || 1 / 60);
                            }
                        };
                        const boden = (x, z) => r.getTerrainHeightAt(x, z) + 0.5;
                        const ab = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const ruhig = (c) => (c.userData.emotions = Object.assign({}, RUHE));
                        const ruhigSpieler = () => s.player.emotions && Object.assign(s.player.emotions, RUHE);
                        const trocken = (x, z) => r._landAt(x, z) && !r._nassAt(x, z) && !(typeof r._imGrundriss === "function" && r._imGrundriss(x, z));
                        const land = (x0, z0, R, dMin) => {
                            for (let d = dMin || 0; d <= 600; d += 15) {
                                const n = Math.max(1, Math.round(d / 10));
                                for (let q = 0; q < n; q++) {
                                    const w = (q / n) * 2 * Math.PI;
                                    const x = x0 + Math.cos(w) * d;
                                    const z = z0 + Math.sin(w) * d;
                                    let ok = trocken(x, z);
                                    for (let k = 0; ok && k < 8; k++) ok = trocken(x + Math.cos(k * 0.785) * R, z + Math.sin(k * 0.785) * R);
                                    if (ok) return { x, z };
                                }
                            }
                            return null;
                        };
                        const tier = (x, z, seele, bs) => {
                            s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 2);
                            let nein = null;
                            const c = r.spawnCreatureAt(x, boden(x, z), z, "happy", seele, { precise: true, bodySize: bs || 1, absage: (g) => (nein = g) });
                            if (!c) throw new Error("spawnCreatureAt " + seele + ": " + nein);
                            ruhig(c);
                            return c;
                        };
                        const stelle = (x, z) => {
                            pm.set(x, r.getTerrainHeightAt(x, z) + A.PLAYER_FOOT_OFFSET, z);
                            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                        };
                        const stillFeld = () => {
                            if (fl) fl.lastTick = 1e12;
                        };
                        const zurueck = () => {
                            for (const n of flicken.splice(0)) delete r[n];
                            if (s.player && alt.seele && s.player.soul !== alt.seele) r.applyPlayerSoul(alt.seele);
                            for (const c of [...s.creatures]) if (!alt.vor.has(c)) r.removeCreature(c);
                            s.maxCreatures = alt.max;
                            if (fl) fl.lastTick = alt.wurf;
                            if (r.getGameMode() !== alt.modus) r.setGameMode(alt.modus);
                            pm.copy(alt.p);
                            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                            [s.yaw, s.pitch, s.perfRegulator, s.gravity] = [alt.yaw, alt.pitch, alt.perf, alt.grav];
                            if (s.season !== alt.season) r.setSeason(alt.season);
                            if (Math.abs(s.timeOfDay - alt.tod) > 1e-6) r._uhrSetzen(alt.tod, "regler");
                            if (s.weather !== alt.wetter && window.__wetterSetzen) window.__wetterSetzen(alt.wetter);
                            if (wm && wm.tritt) for (const k of Object.keys(wm.tritt)) if (!alt.tritt.has(k)) delete wm.tritt[k];
                            if (r._trittSchwach) for (const k of [...r._trittSchwach.keys()]) if (!alt.schwach.has(k)) r._trittSchwach.delete(k);
                            const F = r._bestandRegionen().regionen;
                            for (const k of Object.keys(F)) if (!alt.reg.has(k)) delete F[k];
                            if (alt.lf && s.lifeField) {
                                for (const k of [...s.lifeField.keys()]) if (!alt.lf.has(k)) s.lifeField.delete(k);
                                for (const [k, e] of alt.lf) {
                                    const n = s.lifeField.get(k);
                                    if (n) Object.assign(n, e);
                                    else s.lifeField.set(k, e);
                                }
                            }
                        };
                        return { s, A, pm, fl, wm, alt, RUHE, flick, welt, takt, boden, ab, r3, ruhig, ruhigSpieler, trocken, land, tier, stelle, stillFeld, zurueck };
                    };
                    const lauf = (fn, a) => H.seite("const G = (" + grund + ")(r, T); try { return await (" + fn + ")(r, T, " + JSON.stringify(a || {}) + ", G); } finally { G.zurueck(); }");
                    // DIE PROBE: ein Hirsch einen Spieltag im Takt (dt 0,25, die Uhr läuft mit), der Spieler ruhig in 30 m (frieden) — die Bahn,
                    // ihre konvexe Hülle (das Streifgebiet), die größte Entfernung vom Geburtsort, der Weg und die Zellen, die er trat; dazu die
                    // Lebensdauer gegen den Spieltag. Dann eine FRISCHE Region (Kachel ohne Bestand, Hydro steht), aufgeholt im Sommer und im
                    // Winter (`setSeason`), in Sonne und Regen (`__wetterSetzen`), das Leben des Felds zwischen den Läufen zurückgestellt: die
                    // Höhen-Mediane der Anker und die Verlegung ihres Schwerpunkts
                    const probe = async function (r, T, a, G) {
                        const { s, A, pm, wm, r3, takt, land, tier, stelle, stillFeld, ruhigSpieler } = G;
                        stillFeld();
                        r.setGameMode("frieden");
                        const ort = land(pm.x, pm.z, 30, 40);
                        if (!ort) throw new Error("kein trockenes Land 40–600 m um den Spieler");
                        const c = tier(ort.x, ort.z, "wesen");
                        stelle(ort.x - 30, ort.z);
                        const dayS = 60 * A.DAY_LENGTH_DEFAULT_MINUTES;
                        const tod0 = s.timeOfDay;
                        const vorT = new Set(Object.keys((wm && wm.tritt) || {}));
                        const bahn = [];
                        const n = Math.round((a.tage * dayS) / a.dt);
                        const t0 = performance.now();
                        let k = 0;
                        for (; k < n && performance.now() - t0 < a.msDeckel && s.creatures.includes(c); k++) {
                            ruhigSpieler();
                            takt(1, a.dt);
                            if (k % 20 === 0) bahn.push([c.position.x, c.position.z]);
                            if (k % a.uhrJe === a.uhrJe - 1) r._uhrSetzen((tod0 + ((k + 1) * a.dt) / dayS) % 1, "regler");
                        }
                        r._uhrSetzen(tod0, "regler");
                        const lebt = s.creatures.includes(c);
                        if (lebt) r.removeCreature(c);
                        const P = bahn.map((p) => p.slice()).sort((p, q) => p[0] - q[0] || p[1] - q[1]);
                        const kreuz = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
                        const unten = [];
                        for (const p of P) {
                            while (unten.length >= 2 && kreuz(unten[unten.length - 2], unten[unten.length - 1], p) <= 0) unten.pop();
                            unten.push(p);
                        }
                        const oben = [];
                        for (const p of [...P].reverse()) {
                            while (oben.length >= 2 && kreuz(oben[oben.length - 2], oben[oben.length - 1], p) <= 0) oben.pop();
                            oben.push(p);
                        }
                        const huelle = unten.slice(0, -1).concat(oben.slice(0, -1));
                        let flaeche = 0;
                        for (let i = 0; i < huelle.length; i++) {
                            const [p, q] = [huelle[i], huelle[(i + 1) % huelle.length]];
                            flaeche += p[0] * q[1] - q[0] * p[1];
                        }
                        let weg = 0;
                        for (let i = 1; i < bahn.length; i++) weg += Math.hypot(bahn[i][0] - bahn[i - 1][0], bahn[i][1] - bahn[i - 1][1]);
                        const weit = Math.max(...bahn.map((p) => Math.hypot(p[0] - ort.x, p[1] - ort.z)));
                        const neu = Object.keys((wm && wm.tritt) || {}).filter((q) => !vorT.has(q));
                        const aus = { tag: { takte: k, tage: r3((k * a.dt) / dayS), lebt, flaecheM2: r3(Math.abs(flaeche) / 2), weitM: r3(weit), wegM: r3(weg), proben: bahn.length, trittZellen: neu.length, pfadZellen: neu.filter((q) => A._trittStufe(wm.tritt[q][0]) > 0).length }, dayS, lebensdauerS: A.FAUNA_MAX_AGE_MS / 1000, leineM: A._verhaltenGesetz ? null : null };
                        // die frische Region unter Jahreszeit und Regen
                        const F = r._bestandRegionen().regionen;
                        const nah = r._bestandNah();
                        const [i0, j0] = nah[0].split(",").map(Number);
                        let key = null;
                        for (let d = 1; d <= 3 && !key; d++)
                            for (let i = -d; i <= d && !key; i++)
                                for (let j = -d; j <= d && !key; j++) {
                                    const q = i0 + i + "," + (j0 + j);
                                    if (!F[q] && r._bestandBereit(q)) key = q;
                                }
                        if (!key) throw new Error("keine frische Region mit stehender Hydro-Kachel um " + nah[0]);
                        const lf = s.lifeField;
                        const snap = () => (lf ? new Map([...lf].map(([q, e]) => [q, Object.assign({}, e)])) : null);
                        const zurueckLF = (S) => {
                            if (!S || !lf) return;
                            for (const q of [...lf.keys()]) if (!S.has(q)) lf.delete(q);
                            for (const [q, e] of S) {
                                const x = lf.get(q);
                                if (x) Object.assign(x, e);
                                else lf.set(q, Object.assign({}, e));
                            }
                        };
                        const fang = (vor) => {
                            const S = snap();
                            vor();
                            const R = r._bestandRegion(key, true, 0, Infinity, []);
                            const L = R.tiere.map((t) => ({ x: t.x, z: t.z, h: r.getTerrainHeightAt(t.x, t.z), g: t.g }));
                            delete F[key];
                            zurueckLF(S);
                            return L;
                        };
                        const median = (L) => {
                            const h = L.map((t) => t.h).sort((x, y) => x - y);
                            return h.length ? h[Math.floor(h.length / 2)] : null;
                        };
                        const mitte = (L) => (L.length ? [L.reduce((x, t) => x + t.x, 0) / L.length, L.reduce((x, t) => x + t.z, 0) / L.length] : null);
                        const sommer = fang(() => r.setSeason("summer"));
                        const winter = fang(() => r.setSeason("winter"));
                        r.setSeason(G.alt.season);
                        const sonne = fang(() => window.__wetterSetzen("sunny"));
                        const regen = fang(() => window.__wetterSetzen("rainy"));
                        const S = r._bestandSeite();
                        const hs = [];
                        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) hs.push(r.getTerrainHeightAt((Number(key.split(",")[0]) + (i + 0.5) / 4) * S, (Number(key.split(",")[1]) + (j + 0.5) / 4) * S));
                        const [ms, mr] = [mitte(sonne), mitte(regen)];
                        aus.region = { key, seiteM: r3(S), reliefM: r3(Math.max(...hs) - Math.min(...hs)), sommer: { n: sommer.length, median: r3(median(sommer)) }, winter: { n: winter.length, median: r3(median(winter)) }, hoehenDeltaM: sommer.length && winter.length ? r3(Math.abs(median(winter) - median(sommer))) : null, sonne: sonne.length, regen: regen.length, routeShiftM: ms && mr ? r3(Math.hypot(ms[0] - mr[0], ms[1] - mr[1])) : null };
                        return aus;
                    };
                    const z = await lauf(probe, { tage: 1, dt: 0.05, uhrJe: 1200, msDeckel: 20000 });
                    const zeuge = { antworten: z.tag.proben, streuung: z.tag.weitM || 0, vor: 0, nach: z.tag.wegM || 0 };
                    const km2 = z.tag.flaecheM2 / 1e6;
                    const faktor = km2 > 0 ? Math.round(1000 * (km2 < 1 ? 1 / km2 : km2 > 10 ? km2 / 10 : 1)) / 1000 : null;
                    const tageLeben = Math.round((100 * z.lebensdauerS) / z.dayS) / 100;
                    const aus = M.teil || {};
                    const nimm = (nr, werte, nicht) => {
                        if (!U[nr]) return;
                        aus[nr] = { werte, zeuge, ...(nicht ? { nicht } : {}) };
                    };
                    nimm(2, { ausdehnungM: z.tag.weitM, spieltage: z.tag.tage, wegM: z.tag.wegM }, z.tag.lebt ? null : "das Tier starb vor dem Ende des Spieltags (" + z.tag.tage + " Spieltage)");
                    nimm(3, { faktor, streifKm2: Math.round(km2 * 1e6) / 1e6, spieltage: z.tag.tage, pfadZellen: z.tag.pfadZellen }, "7 Spieltage: das Tier lebt " + tageLeben + " Spieltage, an der Leine seines Ankers");
                    nimm(4, { hoehenDeltaM: z.region.hoehenDeltaM, reliefM: z.region.reliefM }, "10⁴ m Sommer- ↔ Wintereinstand: der Anker des Bestands liegt in seiner Region (Seite " + z.region.seiteM + " m) und wandert nie");
                    nimm(5, { routeShiftM: z.region.routeShiftM }, "kein Zug und kein Lachs: der Fisch-Trupp kennt keinen Geburtsbach");
                    nimm(6, { lebensdauerTage: tageLeben }, "kein Individuum lebt ein Spieljahr (" + tageLeben + " Spieltage), kein Vogelzug über Kontinente");
                    nimm(7, { streckeM: z.tag.weitM }, "keine planetare Wanderung: das weiteste Tier des Tags " + z.tag.weitM + " m vom Geburtsort");
                    return { sprossen: aus, wanderung: z };
                },
                sprossen: {
                    2: {
                        u: {},
                        soll: [K.soll(WA, 2, "Streifgebiet eines Individuums über 1 Spieltag", { quelleFeld: "umfang", quelleWort: "10² m", rel: "≥", zahl: 100, key: "ausdehnungM", einheit: "m" }), K.soll(WA, 2, "Streifgebiet eines Individuums über 1 Spieltag", { rel: "≥", zahl: 1, key: "spieltage", einheit: "Spieltage" })],
                        zeuge: zeugeWelt(50, true),
                        taeter: "tetrapoda-core.js wandern.leashBaseM (die Leine um den Anker) / stamm/daten.js FAUNA_MAX_AGE_MS",
                        unklar: "der Richter nennt keine Zahl: das Soll trägt den Umfang (10² m Streifgebiet über einen Spieltag).",
                        gruen: gut({ ausdehnungM: 300, spieltage: 1, wegM: 2000 }, 300),
                        attrappen: atr({ ausdehnungM: 300, spieltage: 1, wegM: 2000 }, 300, true),
                    },
                    3: {
                        u: {},
                        soll: [K.soll(WA, 3, "Streifgebiet im Band der Telemetrie ±Faktor 2", { rel: "≤", zahl: 2, key: "faktor" }), K.soll(WA, 3, "Spur über 7 Spieltage", { rel: "≥", zahl: 7, key: "spieltage", einheit: "Spieltage" })],
                        zeuge: zeugeWelt(50, true),
                        taeter: "tetrapoda-core.js wandern.leashBaseM 18 m (die Leine um den Geburtsort)",
                        nicht: "10³ m Streifgebiet nach Feldmaß über 7 Spieltage",
                        leser: "tetrapoda-core.js:225 `leashBaseM` — die Leine um den Anker hält das Tier bei 18 m × Größe; stamm/daten.js:176 `FAUNA_MAX_AGE_MS` — das Tier lebt keine 7 Spieltage",
                        gruen: gut({ faktor: 1, streifKm2: 3, spieltage: 7, pfadZellen: 40 }, 300),
                        attrappen: atr({ faktor: 1, streifKm2: 3, spieltage: 7, pfadZellen: 40 }, 300, true),
                    },
                    4: {
                        u: {},
                        soll: [K.soll(WA, 4, "Höhen-Median der Art Winter vs. Sommer im Band", { rel: "band", zahl: 300, bis: 1000, key: "hoehenDeltaM", einheit: "m", refQuelle: "Georgii & Schröder 1983 (Oecologia 58:238): Rothirsch der Alpen, Sommer- über Wintereinstand 300–1000 m" })],
                        zeuge: zeugeWelt(50, true),
                        taeter: "stamm/kreatur-leben.js _creatureNaturalBirth (der Ort des Wurfs liest keine Jahreszeit)",
                        nicht: "10⁴ m Sommer- ↔ Wintereinstand",
                        leser: "stamm/kreatur-leben.js:1955 `_creatureNaturalBirth` — der Ort des Wurfs liest Saat und Lebensraum, nie die Jahreszeit; der Anker wandert nie",
                        gruen: gut({ hoehenDeltaM: 500, reliefM: 800 }, 300),
                        attrappen: atr({ hoehenDeltaM: 500, reliefM: 800 }, 300, true),
                    },
                    5: {
                        u: {},
                        soll: [K.soll(WA, 5, "Lachs findet den Geburtsbach ≥ 0,9", { key: "lachs" })],
                        zeuge: zeugeWelt(50, true),
                        taeter: "tetrapoda-core.js FISCH_GESETZ (der Fisch-Trupp ohne Zug)",
                        nicht: "10⁵ m: Gnu-Zug folgt dem Regen, Lachs zieht stromauf",
                        leser: "tetrapoda-core.js:2832 `schlagHz` — FISCH_GESETZ trägt Schlag und Trupp, keinen Geburtsbach und keinen Zug",
                        gruen: gut({ lachs: 0.95, routeShiftM: 400 }, 300),
                        attrappen: atr({ lachs: 0.95, routeShiftM: 400 }, 300, true),
                    },
                    6: {
                        u: {},
                        soll: [K.soll(WA, 6, "Ankunft im Brutgebiet ±7 Spieltage", { rel: "≤", zahl: 7, key: "ankunftAbw", einheit: "Spieltage" })],
                        zeuge: zeugeWelt(50, true),
                        taeter: "stamm/daten.js FAUNA_MAX_AGE_MS / tetrapoda-core.js VOGEL_GESETZ (kein Zug)",
                        nicht: "10⁶–10⁷ m: Vogelzug über Kontinente",
                        leser: "tetrapoda-core.js:2376 `VOGEL_GESETZ` — der Vogel kreist um seine Zelle, kein Kurs aus Magnet-, Sternen- oder Sonnenkompass",
                        gruen: gut({ ankunftAbw: 3, lebensdauerTage: 400 }, 300),
                        attrappen: atr({ ankunftAbw: 3, lebensdauerTage: 400 }, 300, true),
                    },
                    7: {
                        u: {},
                        soll: [K.soll(WA, 7, "Zugscheide verschiebt sich mit der Isotherme", { quelleFeld: "umfang", quelleWort: "7·10⁷ m", rel: "≥", zahl: 7e7, key: "streckeM", einheit: "m" })],
                        zeuge: zeugeWelt(50, true),
                        taeter: "tetrapoda-core.js wandern.leashBaseM (kein Zug)",
                        nicht: "7·10⁷ m: planetare Wanderung auf jedem Planeten",
                        leser: "tetrapoda-core.js:225 `leashBaseM` — jedes Tier hängt an der Leine seines Ankers; kein Leser trägt Zug oder Klima-Route",
                        unklar: "der Richter nennt keine Zahl: das Soll trägt den Umfang (7·10⁷ m Strecke).",
                        gruen: gut({ streckeM: 8e7 }, 300),
                        attrappen: atr({ streckeM: 8e7 }, 300, true),
                    },
                },
            },
            // ═══ MENSCH: der Spieler wird das Tier, folgt der Spur, ruft den Gefährten ═══
            [ME]: {
                sek: 25,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "die Ego-Aufnahme als Tier (S6, S7) — headless misst die Probe Tempo, Sprung, Spur und Ruf",
                mess: async function (H, U, M) {
                    const grund = function (r, T) {
                        const s = r.state;
                        const A = r.constructor;
                        const pm = s.playerMesh.position;
                        const fl = s.faunaLifecycle;
                        const wm = s.worldMeta;
                        const alt = { p: pm.clone(), yaw: s.yaw, pitch: s.pitch, modus: r.getGameMode(), max: s.maxCreatures, wurf: fl ? fl.lastTick : null, vor: new Set(s.creatures), perf: s.perfRegulator, grav: s.gravity, tod: s.timeOfDay, wetter: s.weather, season: s.season, tritt: new Set(Object.keys((wm && wm.tritt) || {})), schwach: new Set((r._trittSchwach || new Map()).keys()), reg: new Set(Object.keys(r._bestandRegionen().regionen)), lf: s.lifeField ? new Map([...s.lifeField].map(([k, e]) => [k, Object.assign({}, e)])) : null, seele: s.player && s.player.soul };
                        const RUHE = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
                        const flicken = [];
                        const flick = (n, f) => {
                            if (Object.prototype.hasOwnProperty.call(r, n)) throw new Error("flick: " + n + " trägt schon eine eigene Zeile");
                            flicken.push(n);
                            r[n] = f;
                        };
                        let t = performance.now();
                        const welt = (n) => {
                            s.perfRegulator = false;
                            for (let i = 0; i < n; i++) r._gameLoopTick((t += 1000 / 60));
                        };
                        const takt = (n, d) => {
                            for (let i = 0; i < n; i++) {
                                r._kreaturStossSchritt(d || 1 / 60);
                                r._trittDerLeiber();
                                r._leibKontakte();
                                r.updateCreatures(d || 1 / 60);
                            }
                        };
                        const boden = (x, z) => r.getTerrainHeightAt(x, z) + 0.5;
                        const ab = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
                        const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const ruhig = (c) => (c.userData.emotions = Object.assign({}, RUHE));
                        const ruhigSpieler = () => s.player.emotions && Object.assign(s.player.emotions, RUHE);
                        const trocken = (x, z) => r._landAt(x, z) && !r._nassAt(x, z) && !(typeof r._imGrundriss === "function" && r._imGrundriss(x, z));
                        const land = (x0, z0, R, dMin) => {
                            for (let d = dMin || 0; d <= 600; d += 15) {
                                const n = Math.max(1, Math.round(d / 10));
                                for (let q = 0; q < n; q++) {
                                    const w = (q / n) * 2 * Math.PI;
                                    const x = x0 + Math.cos(w) * d;
                                    const z = z0 + Math.sin(w) * d;
                                    let ok = trocken(x, z);
                                    for (let k = 0; ok && k < 8; k++) ok = trocken(x + Math.cos(k * 0.785) * R, z + Math.sin(k * 0.785) * R);
                                    if (ok) return { x, z };
                                }
                            }
                            return null;
                        };
                        const tier = (x, z, seele, bs) => {
                            s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 2);
                            let nein = null;
                            const c = r.spawnCreatureAt(x, boden(x, z), z, "happy", seele, { precise: true, bodySize: bs || 1, absage: (g) => (nein = g) });
                            if (!c) throw new Error("spawnCreatureAt " + seele + ": " + nein);
                            ruhig(c);
                            return c;
                        };
                        const stelle = (x, z) => {
                            pm.set(x, r.getTerrainHeightAt(x, z) + A.PLAYER_FOOT_OFFSET, z);
                            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                        };
                        const stillFeld = () => {
                            if (fl) fl.lastTick = 1e12;
                        };
                        const zurueck = () => {
                            for (const n of flicken.splice(0)) delete r[n];
                            if (s.player && alt.seele && s.player.soul !== alt.seele) r.applyPlayerSoul(alt.seele);
                            for (const c of [...s.creatures]) if (!alt.vor.has(c)) r.removeCreature(c);
                            s.maxCreatures = alt.max;
                            if (fl) fl.lastTick = alt.wurf;
                            if (r.getGameMode() !== alt.modus) r.setGameMode(alt.modus);
                            pm.copy(alt.p);
                            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
                            [s.yaw, s.pitch, s.perfRegulator, s.gravity] = [alt.yaw, alt.pitch, alt.perf, alt.grav];
                            if (s.season !== alt.season) r.setSeason(alt.season);
                            if (Math.abs(s.timeOfDay - alt.tod) > 1e-6) r._uhrSetzen(alt.tod, "regler");
                            if (s.weather !== alt.wetter && window.__wetterSetzen) window.__wetterSetzen(alt.wetter);
                            if (wm && wm.tritt) for (const k of Object.keys(wm.tritt)) if (!alt.tritt.has(k)) delete wm.tritt[k];
                            if (r._trittSchwach) for (const k of [...r._trittSchwach.keys()]) if (!alt.schwach.has(k)) r._trittSchwach.delete(k);
                            const F = r._bestandRegionen().regionen;
                            for (const k of Object.keys(F)) if (!alt.reg.has(k)) delete F[k];
                            if (alt.lf && s.lifeField) {
                                for (const k of [...s.lifeField.keys()]) if (!alt.lf.has(k)) s.lifeField.delete(k);
                                for (const [k, e] of alt.lf) {
                                    const n = s.lifeField.get(k);
                                    if (n) Object.assign(n, e);
                                    else s.lifeField.set(k, e);
                                }
                            }
                        };
                        return { s, A, pm, fl, wm, alt, RUHE, flick, welt, takt, boden, ab, r3, ruhig, ruhigSpieler, trocken, land, tier, stelle, stillFeld, zurueck };
                    };
                    const lauf = (fn, a) => H.seite("const G = (" + grund + ")(r, T); try { return await (" + fn + ")(r, T, " + JSON.stringify(a || {}) + ", G); } finally { G.zurueck(); }");
                    // DIE PROBE: (S5) der Spieler wird jedes Tier (`applyPlayerSoul`): sein Sprint-Tempo und seine Sprunghöhe (der Abdruck
                    // `_sprungAbdruck`, h = v²/2g) gegen den wilden Artgenossen — dessen Höchsttempo auf der Flucht vor dem Spieler (pfad, die
                    // Näherung in der Fluchtdistanz) und seine Sprunghöhe (`_kreaturSprungHoehe`). (S2) Ein Hirsch und ein Wolf gehen je 40 s:
                    // trägt der Boden eine Fährte (Zellen ab der Stufe des Pfads), deren jüngste Zelle zum Tier führt? (S3) ein Wolf, gebunden
                    // (bond 1, Auftrag follow_player): der Spieler geht 30 m in drei Richtungen — kehrt er zurück? Reitbar: die Fahr-Affordanz
                    // neben ihm (`_findNearestAffordanceEntry`). (S4) die Haustiere unter den Seelen
                    const probe = async function (r, T, a, G) {
                        const { s, A, pm, wm, r3, takt, land, tier, stelle, stillFeld, ruhigSpieler, RUHE } = G;
                        stillFeld();
                        const ort = land(pm.x, pm.z, 30, 40);
                        if (!ort) throw new Error("kein trockenes Land 40–600 m um den Spieler");
                        const g0 = Math.abs(s.gravity);
                        const aus = { je: {} };
                        const dt = 1 / 60;
                        for (const [als, wild] of a.paare) {
                            const P = {};
                            r.applyPlayerSoul(als);
                            P.seele = s.player.soul;
                            P.sprint = r3(s.sprintSpeed);
                            try {
                                const v0 = r._sprungAbdruck();
                                P.sprungH = r3((v0 * v0) / (2 * g0));
                            } catch (e) {
                                P.sprungFehler = String((e && e.message) || e).slice(0, 160);
                            }
                            r.applyPlayerSoul(G.alt.seele);
                            r.setGameMode("pfad");
                            const c = tier(ort.x, ort.z, wild);
                            const W = { sprungH: r3(r._kreaturSprungHoehe(c)) };
                            const D = A._furchtGesetz().F.fluchtDistanzM[r._kreaturGattung(c)];
                            stelle(c.position.x - 0.7 * D, c.position.z);
                            let vmax = 0;
                            let floh = -1;
                            let vor = [c.position.x, c.position.z];
                            for (let k = 0; k < a.fluchtTakte; k++) {
                                const [dx, dz] = [c.position.x - pm.x, c.position.z - pm.z];
                                const d = Math.hypot(dx, dz) || 1;
                                if (floh < 0) (pm.x += (dx / d) * s.speed * dt), (pm.z += (dz / d) * s.speed * dt);
                                pm.y = r.getTerrainHeightAt(pm.x, pm.z) + A.PLAYER_FOOT_OFFSET;
                                ruhigSpieler();
                                takt(1, dt);
                                if (floh < 0 && c.userData._motionZustand === "flucht") floh = k;
                                // wer den nahenden Spieler nicht flieht (der Wolf jagt ihn), flieht den Hieb: die Kampf-Furcht (damageCreature)
                                if (floh < 0 && k === a.hiebNach) {
                                    r.damageCreature(c, 1, { source: "player", fromPos: pm.clone() });
                                    W.geschlagen = true;
                                }
                                if (floh >= 0) vmax = Math.max(vmax, Math.hypot(c.position.x - vor[0], c.position.z - vor[1]) / dt);
                                vor = [c.position.x, c.position.z];
                            }
                            W.vFlucht = r3(vmax);
                            W.flohNachTakten = floh;
                            r.removeCreature(c);
                            r.setGameMode(G.alt.modus);
                            aus.je[wild] = { spieler: P, wild: W, tempoAbw: P.sprint > 0 && vmax > 0 ? r3(Math.abs(P.sprint / vmax - 1) * 100) : null, sprungAbw: Number.isFinite(P.sprungH) && W.sprungH > 0 ? r3(Math.abs(P.sprungH / W.sprungH - 1) * 100) : null };
                        }
                        // (S2) die Fährte
                        r.setGameMode("frieden");
                        const spur = [];
                        for (const seele of ["wesen", "wolf"]) {
                            const vorT = new Set(Object.keys((wm && wm.tritt) || {}));
                            const vorS = new Set((r._trittSchwach || new Map()).keys());
                            const c = tier(ort.x, ort.z, seele);
                            stelle(ort.x + 40, ort.z);
                            for (let k = 0; k < a.spurTakte; k++) {
                                ruhigSpieler();
                                takt(1, dt);
                            }
                            const neu = Object.keys((wm && wm.tritt) || {}).filter((q) => !vorT.has(q));
                            const sicht = neu.filter((q) => A._trittStufe(wm.tritt[q][0]) > 0);
                            let jung = null;
                            for (const q of sicht) if (!jung || wm.tritt[q][1] > wm.tritt[jung][1]) jung = q;
                            const zm = jung ? jung.split(",").map((x) => (Number(x) + 0.5) * A.TRITT.zelleM) : null;
                            const bis = zm ? Math.hypot(zm[0] - c.position.x, zm[1] - c.position.z) : null;
                            spur.push({ seele, getreten: neu.length, schwach: [...(r._trittSchwach || new Map()).keys()].filter((q) => !vorS.has(q)).length, sichtbar: sicht.length, jungsteBisTierM: r3(bis), gefunden: sicht.length >= 3 && bis !== null && bis <= 30 });
                            r.removeCreature(c);
                        }
                        aus.spur = spur;
                        // (S3) der Ruf und das Reiten
                        const w = tier(ort.x, ort.z, "wolf");
                        w.userData.bond = 1;
                        r.assignCreatureTask(w, "follow_player", {}, { silent: true });
                        stelle(ort.x + 2, ort.z);
                        const reit = r._findNearestAffordanceEntry("moveable", A.MOUNT_RANGE_M);
                        aus.reiten = { gefunden: !!reit, istTier: !!reit && Object.values(reit).includes(w) };
                        let zurueck = 0;
                        const halt = A.CREATURE_FOLLOW_DISTANCE || 3;
                        const ruf = [];
                        for (let q = 0; q < 3; q++) {
                            const wq = (q * 2 * Math.PI) / 3;
                            stelle(w.position.x + Math.cos(wq) * 30, w.position.z + Math.sin(wq) * 30);
                            let d = Infinity;
                            for (let k = 0; k < a.rufTakte; k++) {
                                ruhigSpieler();
                                w.userData.emotions = Object.assign(w.userData.emotions || {}, RUHE, { joy: 0.2 });
                                takt(1, dt);
                                d = Math.hypot(w.position.x - pm.x, w.position.z - pm.z);
                                if (d <= halt + 2) break;
                            }
                            ruf.push(r3(d));
                            if (d <= halt + 2) zurueck++;
                        }
                        aus.ruf = { abstandM: ruf, quote: r3(zurueck / 3), task: w.userData.task && w.userData.task.name };
                        r.removeCreature(w);
                        const HAUS = /hund|rind|pferd|katze|schaf|ziege|huhn|haus|dog|horse|cow|cat/i;
                        aus.haus = { seelen: A.CREATURE_SOUL_NAMES.length, haustiere: A.CREATURE_SOUL_NAMES.filter((x) => HAUS.test(x)).length };
                        return aus;
                    };
                    const z = await lauf(probe, { paare: [["wolf", "wolf"], ["fuchs", "fuchs"], ["baer", "baer"], ["hirsch", "wesen"]], fluchtTakte: 360, hiebNach: 120, spurTakte: 2400, rufTakte: 900 });
                    const augeNoetig = Object.keys(U).some((nr) => U[nr].auge);
                    const auge = augeNoetig ? await M.auge("tiere-mensch", U[Object.keys(U).find((nr) => U[nr].auge)].auge) : undefined;
                    const je = Object.values(z.je);
                    const tAbw = je.map((x) => x.tempoAbw).filter(Number.isFinite);
                    const sAbw = je.map((x) => x.sprungAbw).filter(Number.isFinite);
                    const tempoAbw = tAbw.length === je.length ? Math.max(...tAbw) : null;
                    const sprungAbw = sAbw.length === je.length ? Math.max(...sAbw) : null;
                    const mT = tAbw.reduce((x, y) => x + y, 0) / Math.max(1, tAbw.length);
                    const zeuge = { antworten: je.length * 240 + z.spur.reduce((x, y) => x + y.getreten, 0), streuung: Math.round(Math.sqrt(tAbw.reduce((x, y) => x + (y - mT) * (y - mT), 0) / Math.max(1, tAbw.length)) * 1000) / 1000 || z.spur.reduce((x, y) => x + y.getreten, 0), vor: 0, nach: je.length };
                    const findeQuote = z.spur.filter((x) => x.gefunden).length / z.spur.length;
                    const aus = M.teil || {};
                    const nimm = (nr, werte, nicht, mitAuge) => {
                        if (!U[nr]) return;
                        aus[nr] = { werte, zeuge, ...(mitAuge ? { auge } : {}), ...(nicht ? { nicht } : {}) };
                    };
                    nimm(2, { findeQuote }, "keine Fährte und keine Losung: " + z.spur.map((x) => x.seele + " " + x.sichtbar + " sichtbare von " + x.getreten + " getretenen Zellen").join(", "));
                    nimm(3, { rufQuote: z.ruf.quote, fussfallAbw: null }, "kein Reittier (Fahr-Affordanz am Wolf: " + (z.reiten.istTier ? "ja" : "nein") + "), kein Hund");
                    nimm(4, { haustiere: z.haus.haustiere }, "keine Domestikation: " + z.haus.haustiere + " Haustiere unter " + z.haus.seelen + " Seelen");
                    nimm(5, { tempoAbw, sprungAbw }, "10 Arten: der Spieler wird eine von " + je.length + " Seelen");
                    nimm(6, {}, "10² Stichproben-Arten mit ihren Sinnen (Adler, Hund, Maulwurf)", true);
                    nimm(7, { tempoAbw }, "keine fremde Saat: jede Art jedes Planeten", true);
                    return { sprossen: aus, mensch: z };
                },
                sprossen: {
                    2: {
                        u: {},
                        soll: [K.soll(ME, 2, "Tier in ≤ 10 min ≥ 0,8", { rel: "≥", zahl: 0.8, key: "findeQuote" })],
                        zeuge: zeugeWelt(50, true),
                        taeter: "stamm/siedlung-wege.js _trittStufe (ein Gang tritt keine Fährte)",
                        nicht: "Fährte, Losung, Beobachten, Jagd",
                        leser: "stamm/siedlung-wege.js:1712 `_trittStufe` — ein Gang tritt die Zelle einmal, sichtbar wird erst der Pfad; keine Fährte, keine Losung",
                        gruen: gut({ findeQuote: 0.9 }, 300),
                        attrappen: atr({ findeQuote: 0.9 }, 300, true),
                    },
                    3: {
                        u: {},
                        soll: [K.soll(ME, 3, "Fußfall des Pferds unter Reiter ±0,05", { rel: "≤", zahl: 0.05, key: "fussfallAbw", einheit: "Takt" }), K.soll(ME, 3, "Hund kehrt auf Ruf ≥ 0,9", { key: "rufQuote" })],
                        zeuge: zeugeWelt(50, true),
                        taeter: "stamm/koerper-fahrt.js _findNearestAffordanceEntry (moveable trägt Fahrzeuge, kein Tier)",
                        nicht: "Haus- und Reittier: Hund folgt, Pferd reitbar",
                        leser: "stamm/koerper-fahrt.js:1375 `_findNearestAffordanceEntry` — das Aufsitzen sucht Fahrzeuge (moveable) und Sitze, kein Tier",
                        gruen: gut({ fussfallAbw: 0.03, rufQuote: 1 }, 300),
                        attrappen: atr({ fussfallAbw: 0.03, rufQuote: 1 }, 300, true),
                    },
                    4: {
                        u: {},
                        soll: [K.soll(ME, 4, "Haustier liegt näher an seiner Wildform als an jeder anderen Art ≥ 0,9", { key: "naeher" })],
                        zeuge: zeugeWelt(50, true),
                        taeter: "stamm/kreatur-leben.js CREATURE_SOULS (vier Wildformen)",
                        nicht: "Domestikation aus der Wildform über Generationen",
                        leser: "stamm/kreatur-leben.js:3567 `CREATURE_SOULS` — vier Wildformen, kein Haustier und keine Ableitung",
                        gruen: gut({ naeher: 0.95, haustiere: 2 }, 300),
                        attrappen: atr({ naeher: 0.95, haustiere: 2 }, 300, true),
                    },
                    5: {
                        u: {},
                        soll: [K.soll(ME, 5, "Tempo und Sprung ±10 % zum wilden Artgenossen", { rel: "≤", zahl: 10, key: "tempoAbw", einheit: "%" }), K.soll(ME, 5, "Tempo und Sprung ±10 % zum wilden Artgenossen", { rel: "≤", zahl: 10, key: "sprungAbw", einheit: "%" })],
                        zeuge: zeugeWelt(50, true),
                        taeter: "stamm/koerper-fahrt.js applyPlayerSoul (die Tier-Seele des Spielers) / stamm/koerper-bewegung.js _sprungAbdruck",
                        nicht: "der Spieler WIRD ein Tier (10 Arten)",
                        leser: "stamm/koerper-fahrt.js:2744 `applyPlayerSoul` — vier Tier-Seelen (hirsch, wolf, fuchs, baer) statt 10 Arten",
                        gruen: gut({ tempoAbw: 6, sprungAbw: 8 }, 300),
                        attrappen: atr({ tempoAbw: 6, sprungAbw: 8 }, 300, true),
                    },
                    6: {
                        u: { auge: AUGE_ORT },
                        soll: [K.soll(ME, 6, "Blind-Panel erkennt die Art an der Ego-Aufnahme ≥ 0,7", { key: "panel" })],
                        auge: { pose: "Ego als Tier (Wolf, Hirsch) auf der Wiese", vorbild: "Ego-Aufnahmen realer Tiere; Blind-Panel ≥ 0,7" },
                        taeter: "stamm/koerper-fahrt.js applyPlayerSoul (die Sicht des Menschen im Tier-Leib)",
                        nicht: "10² Stichproben-Arten spielbar mit ihren Sinnen",
                        leser: "stamm/koerper-fahrt.js:2744 `applyPlayerSoul` — die Seele tauscht Leib und Tempo, nie die Wahrnehmung (Sehschärfe, Geruch, Tastsinn)",
                        gruen: gut({ panel: 0.8 }, 300),
                        attrappen: atr({ panel: 0.8 }, 300),
                    },
                    7: {
                        u: { auge: AUGE_ORT },
                        soll: [K.soll(ME, 7, "Tempo ±10 %", { rel: "≤", zahl: 10, key: "tempoAbw", einheit: "%" }), K.soll(ME, 7, "Panel ≥ 0,7", { key: "panel" })],
                        auge: { pose: "Ego als Tier einer fremden Saat (heute: die Wiese)", vorbild: "Panel ≥ 0,7 an der Ego-Aufnahme" },
                        taeter: "stamm/kreatur-leben.js CREATURE_SOUL_NAMES (keine Fauna fremder Saaten)",
                        nicht: "jedes Tier jedes Planeten spielbar, fremde Sinne als Perspektive",
                        leser: "stamm/kreatur-leben.js:3622 — CREATURE_SOUL_NAMES liest keinen Samen: keine Fauna fremder Saaten",
                        gruen: gut({ tempoAbw: 6, panel: 0.8 }, 300),
                        attrappen: atr({ tempoAbw: 6, panel: 0.8 }, 300),
                    },
                },
            },
        },
    };
})());

// ── DIE PERSPEKTIVE leben.wasser (4 Leitern, 26 Sprossen, belegt: lebensraeume S1 und rhythmen S1 — luftwasser.K3): das Leben im Wasser ──
// Die Leser des Spiels: die Fische (stamm/kreatur-fauna.js `_fischTakt` · `_fischZelle` · `_fischTiefeY` → tetrapoda-core FISCH_GESETZ,
// fischStand/fischSchritt/fischFlucht; gezeichnet im Pool `tier:fisch`), die Orte des Wassers (scripts/lib/wasser-linse.cjs `__wasserOrte`:
// Bach, Fluss, See, Küste und Meer am Gesetz nächst der Mess-Wiese), das Medium der Kamera unter Wasser (stamm/bild-himmel.js
// `_applyDayNightToScene` → `_luftSichtM`, WASSER_GESETZ.koerper je Art), die Nah-Streu am Ufer (stamm/vegetation-wiese.js
// `_nahStreuKachel`, das Ufer-Band des Schilfs), der Bestand der Tiere (stamm/kreatur-leben.js `faunaBestand`) und der Planet-Faden
// (`r._planetAuftrag` planet-ort: derselbe Weg wie die Reise). Ein Richter ohne Zahl (lebensraeume S5, bild S1, netz S1) bekommt sein
// Soll aus der Tiefe der Karte oder aus einer benannten Erd-Referenz (K.soll mit quelleFeld oder refQuelle, geprüft am Wortlaut) und trägt `unklar`.
L.perspektive("wasser", (() => {
    const LR = "leben.wasser.lebensraeume";
    const BI = "leben.wasser.bild";
    const NE = "leben.wasser.netz";
    const RH = "leben.wasser.rhythmen";
    const PFAD = [
        "stamm/kreatur-fauna.js",
        "stamm/kreatur-leben.js",
        "tetrapoda-core.js",
        "stamm/wasser-*.js",
        "stamm/gelaende-*.js",
        "stamm/bild-himmel.js",
        "stamm/bild-sicht.js",
        "stamm/vegetation-wiese.js",
        "gelaende-core.js",
        "planet-core.js",
        "voxel-worker.js",
        "scripts/lib/wasser-linse.cjs",
        "scripts/lib/welt-orte.cjs",
        "scripts/werkbank.cjs",
    ];
    // DAS SOLL EINES RICHTERS OHNE ZAHL: das Wort steht wörtlich im Richter; die Zahl steht wörtlich in Tiefe, Umfang oder Preis der
    // Sprosse (quelleFeld + quelleWort) oder trägt eine benannte Erd-Referenz (refQuelle) — nie eine erfundene Schwelle ohne Namen
    // DER ZEUGE DER WELT: N Antworten der Welt (Orte, Fische, Saaten …) mit Streuung, und wo verlangt die Änderung vor → nach
    const zeugeWelt = (min, mitAenderung) => (roh) => {
        const z = roh.zeuge || {};
        if (!(z.antworten >= min)) return "nur " + (z.antworten || 0) + " Antworten der Welt (Soll ≥ " + min + ")";
        if (!(z.streuung > 0)) return "die Antworten tragen keine Streuung (eine Konstante, nicht die Welt)";
        if (mitAenderung && !(z.vor !== undefined && z.nach !== undefined && z.vor !== z.nach)) return "die Welt änderte sich nicht (vor " + z.vor + " = nach " + z.nach + ")";
        return null;
    };
    const gut = (werte, n, extra) => ({ werte, zeuge: Object.assign({ antworten: n, streuung: 1.7 }, extra || {}) });
    const flach = (werte) => ({ werte, zeuge: { antworten: 0, streuung: 0 } });
    return {
        leitern: {
            // ═══ LEBENSRÄUME: welche der 15 Wasser-Lebensräume die Welt trägt, mit welcher Fauna ═══
            [LR]: {
                sek: 35,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "die Bilder der Auge-Sprossen (S2–S4: Klassifikator und Tauchbild) — swiftshader schießt nicht",
                mess: async function (H, U, M) {
                    const seite = (fn, a) => H.seite("return await (" + fn.toString() + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    await H.seite(require(require("path").resolve("scripts/lib/wasser-linse.cjs")).WASSER_INSTALL + "\nreturn true;");
                    const inventar = async (r, T, a) => {
                        const s = r.state;
                        const A = r.constructor;
                        const R2 = (v) => (Number.isFinite(v) ? Math.round(v * 100) / 100 : null);
                        const O = await window.__wasserOrte({});
                        if (!r._fischKarte) r._fischTakt(0);
                        const F = A._fischGesetz().F;
                        const fk = { saat: r._fischKarte.saat };
                        const felder = new Set();
                        const fenster = async (x, z, n) => {
                            await __weltDa(() => !r._ensureHydroTilesAround(x, z, 64));
                            const ix0 = Math.floor(x / F.zelleM);
                            const iz0 = Math.floor(z / F.zelleM);
                            const o = { art: r._wasserArtAt(x, z), nass: 0, staende: 0, fische: 0, ohneStrom: 0 };
                            for (let i = -n; i <= n; i++)
                                for (let j = -n; j <= n; j++) {
                                    if (r._nassAt((ix0 + i + 0.5) * F.zelleM, (iz0 + j + 0.5) * F.zelleM)) o.nass++;
                                    const c = r._fischZelle(fk, { ix: ix0 + i, iz: iz0 + j });
                                    if (!c.stand) continue;
                                    Object.keys(c.stand).forEach((k) => felder.add(k));
                                    o.staende++;
                                    o.fische += c.stand.n;
                                    const w = r._waterFlowAt(c.stand.x, c.stand.z);
                                    if (!(w && Math.hypot(w.x, w.z) >= F.minMs)) o.ohneStrom++;
                                }
                            return o;
                        };
                        const hab = {};
                        if (O.bach) hab.bach = await fenster(O.bach.x, O.bach.z, 5);
                        if (O.see) hab.see = await fenster(O.see.mitte[0], O.see.mitte[1], 5);
                        if (O.meer) hab.meer = await fenster(O.meer[0], O.meer[1], 5);
                        const artFelder = [...felder].filter((k) => !["x", "y", "z", "u", "n"].includes(k));
                        const WG = A.Gesetz("terrain:WASSER_GESETZ", null);
                        const koerper = WG ? Object.keys(WG.koerper) : [];
                        let landImWasser = 0;
                        let tiere = 0;
                        const FB = s.faunaBestand;
                        for (const k in (FB && FB.regionen) || {})
                            for (const t of FB.regionen[k].tiere) {
                                tiere++;
                                if (r._nassAt(t.x, t.z)) landImWasser++;
                            }
                        for (const c of s.creatures || []) if (r._nassAt(c.position.x, c.position.z)) landImWasser++;
                        const arten = r._nahStreuArten();
                        const uferArt = new Set(arten.map((x, i) => (x.zeile && x.zeile.ufer ? i : -1)).filter((i) => i >= 0));
                        const KA = A.NAH_STREU.kachel;
                        const kach = new Map();
                        const kachel = (x, z) => {
                            const k = Math.floor(x / KA) + "," + Math.floor(z / KA);
                            if (!kach.has(k)) kach.set(k, r._nahStreuKachel(Math.floor(x / KA), Math.floor(z / KA), arten));
                            return kach.get(k);
                        };
                        const ufer = { punkte: 0, gebaut: 0, mitFlora: 0 };
                        const regionen = [s.hydrosphere].concat(s.hydroTiles ? [...s.hydroTiles.values()] : []).filter((h) => h && h.ready);
                        for (const h of regionen)
                            for (const rv of h.rivers || [])
                                for (let k = 0; k + 1 < (rv.points || []).length; k++) {
                                    const p = rv.points[k];
                                    const q = rv.points[k + 1];
                                    if (p.inLake || !O.bach || Math.hypot(p.x - O.bach.x, p.z - O.bach.z) > a.uferR) continue;
                                    const l = Math.hypot(q.x - p.x, q.z - p.z) || 1;
                                    const nx = -(q.z - p.z) / l;
                                    const nz = (q.x - p.x) / l;
                                    for (const sg of [-1, 1]) {
                                        let d = (p.width || 2) / 2;
                                        while (d < 15 && r._nassAt(p.x + sg * nx * d, p.z + sg * nz * d)) d += 0.25;
                                        const x = p.x + sg * nx * (d + 0.5);
                                        const z = p.z + sg * nz * (d + 0.5);
                                        ufer.punkte++;
                                        const kk = kachel(x, z);
                                        if (!kk) continue;
                                        ufer.gebaut++;
                                        if ((kk.items || []).some((it) => uferArt.has(it.art) && Math.hypot(it.x - x, it.z - z) <= 3)) ufer.mitFlora++;
                                    }
                                }
                        const wl = Number.isFinite(s.waterLevel) ? s.waterLevel : 0;
                        let tief = { d: -Infinity, x: 0, z: 0 };
                        const hs = [];
                        if (O.meer)
                            for (let i = -30; i <= 30; i++)
                                for (let j = -30; j <= 30; j++) {
                                    const x = O.meer[0] + i * 200;
                                    const z = O.meer[1] + j * 200;
                                    const g = r._terrainMacroSurfaceY(x, z, false);
                                    hs.push(g);
                                    if (wl - g > tief.d) tief = { d: wl - g, x, z };
                                }
                        const mH = hs.reduce((q, x) => q + x, 0) / Math.max(1, hs.length);
                        const tiefStreu = Math.sqrt(hs.reduce((q, x) => q + (x - mH) * (x - mH), 0) / Math.max(1, hs.length));
                        let gezeit = null;
                        if (O.meer) {
                            const g = r._voxelSurfaceY(O.meer[0], O.meer[1]);
                            const tod = s.timeOfDay;
                            const w0 = r._atlasWaterLevelAt(O.meer[0], O.meer[1], g);
                            r.setTimeOfDay((tod + 0.5) % 1, "regler");
                            const w1 = r._atlasWaterLevelAt(O.meer[0], O.meer[1], g);
                            r.setTimeOfDay(tod, "regler");
                            gezeit = { w0: R2(w0), w1: R2(w1), hub: R2(Math.abs(w1 - w0)) };
                        }
                        let pose = null;
                        if (O.bach) {
                            const bb = r._voxelSurfaceY(O.bach.x, O.bach.z);
                            const sp = r._koerperWasser(O.bach.x, O.bach.z, bb);
                            pose = { px: R2(O.bach.x + 2), py: R2((bb + sp) / 2), pz: R2(O.bach.z), lx: R2(O.bach.x), ly: R2((bb + sp) / 2), lz: R2(O.bach.z) };
                        }
                        const meerPose = O.meer ? { px: O.meer[0], py: R2(wl - 0.5), pz: O.meer[1], lx: O.meer[0] + 6, ly: R2(wl - 1), lz: O.meer[1] } : null;
                        await r._fadenQuelle();
                        const P = [];
                        for (let i = 0; i < a.saaten; i++)
                            P.push(r._planetAuftrag({ type: "planet-ort", samen: "leben-wasser-" + i, breite: ((i * 37) % 150) - 75, laenge: ((i * 53) % 360) - 180, zeitMa: 0 }));
                        const ant = await Promise.all(P);
                        const leben = /leben|habitat|riff|kelp|seegras|mangrove|provinz|fauna|chemie|nische|plankton|koralle/i;
                        const tragen = (o) => Object.keys(o || {}).some((k) => leben.test(k) || (o[k] && typeof o[k] === "object" && tragen(o[k])));
                        const ph = ant.map((x) => x.hoeheM);
                        const pm = ph.reduce((q, x) => q + x, 0) / Math.max(1, ph.length);
                        const planet = {
                            antworten: ant.length,
                            meer: ant.filter((x) => !x.land).length,
                            mitLebensraum: ant.filter((x) => tragen(x)).length,
                            tiefsteM: R2(-Math.min(...ph)),
                            streuungM: R2(Math.sqrt(ph.reduce((q, x) => q + (x - pm) * (x - pm), 0) / Math.max(1, ph.length))),
                            felder: Object.keys((ant[0] && ant[0].delta) || {}),
                        };
                        return { O, hab, artFelder, koerper, tiere, landImWasser, ufer, tief: { d: R2(tief.d), x: tief.x, z: tief.z, streuung: R2(tiefStreu), punkte: hs.length }, gezeit, pose, meerPose, planet };
                    };
                    const W = await seite(inventar, { saaten: Math.max(...Object.values(U).map((u) => u.saaten || 0)), uferR: 60 });
                    const hab = W.hab || {};
                    const hn = Object.keys(hab);
                    const mitFisch = hn.filter((k) => hab[k].staende > 0);
                    const fischGezaehlt = hn.reduce((q, k) => q + hab[k].fische, 0);
                    const streuFisch = new Set(hn.map((k) => hab[k].fische)).size > 1 ? 1 : 0;
                    const faunen = W.artFelder.length ? mitFisch.length : mitFisch.length ? 1 : 0;
                    const eigene = Math.min(mitFisch.length, faunen);
                    const P = W.planet;
                    const aus = M.teil || {};
                    const art = hn.map((k) => k + " " + hab[k].staende + " Stände/" + hab[k].fische + " Fische (Körper " + hab[k].art + ")").join(", ");
                    for (const nr of Object.keys(U)) {
                        const u = U[nr];
                        let roh;
                        if (u.mass === "ufer") {
                            const auge = await M.auge("wasser-lr-s" + nr, W.pose || { ort: "wiese" });
                            roh = {
                                werte: { uferProzent: W.ufer.gebaut ? Math.round((1000 * W.ufer.mitFlora) / W.ufer.gebaut) / 10 : undefined, habitateMitEigenerFauna: eigene, habitateMitFisch: mitFisch.length, landImWasser: W.landImWasser },
                                zeuge: { antworten: W.ufer.gebaut + fischGezaehlt, streuung: streuFisch, uferPunkte: W.ufer.punkte, tiere: W.tiere },
                                auge,
                            };
                            if (eigene < 3)
                                roh.nicht = "keine eigene Fauna in See und Küstenflachwasser: der Stand des FISCH_GESETZ trägt keine Art (Felder " + (W.artFelder.join("/") || "x/y/z/u/n") + ") — " + art + ", dieselbe Bachforelle überall";
                        } else if (u.mass === "kueste") {
                            const auge = await M.auge("wasser-lr-s" + nr, W.meerPose || { ort: "wiese" });
                            roh = {
                                werte: { saaten: Math.min(P.antworten, u.saaten), saatenMitLebensraum: P.mitLebensraum, gezeitenHubM: W.gezeit ? W.gezeit.hub : undefined, lebensraeumeImGesetz: W.koerper.length },
                                zeuge: { antworten: P.antworten, streuung: P.streuungM },
                                auge,
                                nicht: u.fehlt + " — die Welt trägt " + W.koerper.length + " Wasser-Körper (" + W.koerper.join("/") + "), der Tidenhub an der Küste ist " + (W.gezeit ? W.gezeit.hub : "?") + " m, " + P.mitLebensraum + " von " + P.antworten + " Antworten des Planeten tragen ein Lebensraum-Feld (" + P.felder.join("/") + ")",
                            };
                        } else if (u.mass === "riff") {
                            const auge = await M.auge("wasser-lr-s" + nr, W.meerPose || { ort: "wiese" });
                            roh = {
                                werte: { saaten: Math.min(P.antworten, u.saaten), riffFlaecheM2: 0 },
                                zeuge: { antworten: P.antworten, streuung: P.streuungM },
                                auge,
                                nicht: u.fehlt + " — " + P.mitLebensraum + " von " + P.antworten + " Antworten des Planeten (" + P.meer + " im Meer) tragen ein Riff- oder Lebensraum-Feld",
                            };
                        } else if (u.mass === "zonen") {
                            const zonen = [0, 200, 1000].filter((z) => W.tief.d > z).length;
                            roh = {
                                werte: { zonenMitFaunenwechsel: 0, zonenErreicht: zonen, tiefeMaxM: W.tief.d, planetTiefeMaxM: P.tiefsteM },
                                zeuge: { antworten: W.tief.punkte, streuung: W.tief.streuung },
                                nicht: "die Welt trägt am Meer höchstens " + W.tief.d + " m Tiefe (" + zonen + " von 3 Zonen erreicht, der Planet nennt " + P.tiefsteM + " m) und dort dieselbe Bachforelle (" + art + ") — kein Faunenwechsel, kein Leben ohne Licht",
                            };
                        } else if (u.mass === "provinzen") {
                            roh = {
                                werte: { saaten: P.antworten, provinzen: 0 },
                                zeuge: { antworten: P.antworten, streuung: P.streuungM },
                                nicht: u.fehlt + " — " + P.mitLebensraum + " von " + P.antworten + " Antworten tragen ein Lebensraum-Feld",
                            };
                        } else {
                            const ohne = hn.reduce((q, k) => q + hab[k].ohneStrom, 0);
                            const staende = hn.reduce((q, k) => q + hab[k].staende, 0);
                            roh = {
                                werte: { ohneEnergieProzent: staende ? Math.round((1000 * ohne) / staende) / 10 : undefined, fremdeSaaten: 0 },
                                zeuge: { antworten: staende, streuung: streuFisch },
                                nicht: u.fehlt + " — die Welt kennt " + W.koerper.length + " Wasser-Körper (" + W.koerper.join("/") + "), keine fremde Chemie in der Antwort des Planeten (" + P.felder.join("/") + ")",
                            };
                        }
                        aus[nr] = roh;
                    }
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: { mass: "ufer" },
                        soll: [
                            K.soll(LR, 2, "Klassifikator erkennt den Lebensraum ≥ 80 %", { key: "klassifikatorProzent", einheit: "%" }),
                            K.soll(LR, 2, "Ufer-Stichprobe ≥ 90 %", { key: "uferProzent", einheit: "%" }),
                        ],
                        auge: { pose: "unter Wasser im Bach der Mess-Wiese (__wasserOrte bach), 2 m vor der Mitte, halbe Säule", vorbild: "eingefrorener Klassifikator der Lebensräume (R11) gegen Unterwasser-Fotos von Bach, See und Küstenflachwasser" },
                        taeter: "tetrapoda-core.js FISCH_GESETZ / fischStand (EIN Leib, keine Art je Lebensraum)",
                        nicht: "See und Küste tragen dieselbe Bachforelle — keine eigene Fauna",
                        leser: "stamm/kreatur-fauna.js:562 _fischZelle — der Stand trägt keine Art je Lebensraum (See, Küste)",
                        gruen: gut({ klassifikatorProzent: 86, uferProzent: 93, habitateMitEigenerFauna: 3 }, 40),
                        attrappen: [{ name: "Ufer 93 % ohne einen Punkt am Ufer", roh: flach({ klassifikatorProzent: 86, uferProzent: 93 }) }],
                    },
                    3: {
                        u: { mass: "kueste", saaten: 50, fehlt: "kein Kelpwald, kein Seegras, keine Mangrove, keine Gezeitenzone" },
                        soll: [
                            K.soll(LR, 3, "50 Saaten", { key: "saaten", rel: "≥", einheit: "Saaten" }),
                            K.soll(LR, 3, "Lage gegen Meeresklima ≥ 90 %", { key: "lageProzent", einheit: "%" }),
                            K.soll(LR, 3, "Tauchbild gegen Unterwasserfoto ≥ 0,7", { key: "tauchbild" }),
                        ],
                        auge: { pose: "unter Wasser am Meer nächst der Mess-Wiese (__wasserOrte meer), 0,5 m unter dem Spiegel", vorbild: "Unterwasserfoto von Kelpwald, Seegraswiese, Mangrove (Ähnlichkeit ≥ 0,7)" },
                        taeter: "phyto-core.js (keine Meeres-Art) · stamm/wasser-hydro.js (kein Tidenhub)",
                        nicht: "kein Kelp, Seegras, Mangrove, keine Gezeiten",
                        leser: "stamm/wasser-hydro.js:605 _wasserArtAt — nur bach/see/fluss, kein Meeres-Lebensraum; kein Leser der Gezeit",
                        gruen: gut({ saaten: 50, lageProzent: 94, tauchbild: 0.74 }, 50),
                        attrappen: [{ name: "50 Saaten behauptet, keine Antwort des Planeten", roh: flach({ saaten: 50, lageProzent: 94, tauchbild: 0.74 }) }],
                    },
                    4: {
                        u: { mass: "riff", saaten: 50, fehlt: "kein Riff, keine offene See, kein Polarmeer, kein Ästuar als Lebensraum" },
                        soll: [
                            K.soll(LR, 4, "50 Saaten", { key: "saaten", rel: "≥", einheit: "Saaten" }),
                            K.soll(LR, 4, "Fehlplatzierung < 5 % der Riff-Fläche", { key: "fehlplatzierungProzent", einheit: "%" }),
                            K.soll(LR, 4, "Klassifikator erkennt das Riff ≥ 80 %", { key: "klassifikatorRiffProzent", einheit: "%" }),
                        ],
                        auge: { pose: "unter Wasser am Meer nächst der Mess-Wiese, Blick über den Grund", vorbild: "eingefrorener Klassifikator (R11) gegen Riff-Fotos (warm, klar, flach)" },
                        taeter: "phyto-core.js / tetrapoda-core.js (kein Riff-Gesetz)",
                        nicht: "kein Riff in der Welt",
                        leser: "voxel-worker.js:1193 planetOrtAuftrag — die Antwort trägt kein Riff- oder Lebensraum-Feld (delta: klima/meer/wetter/wuchs/wildnis)",
                        gruen: gut({ saaten: 50, fehlplatzierungProzent: 3, klassifikatorRiffProzent: 85 }, 50),
                        attrappen: [{ name: "Riff-Fläche aus einer Tabelle", roh: flach({ saaten: 50, fehlplatzierungProzent: 3, klassifikatorRiffProzent: 85 }) }],
                    },
                    5: {
                        u: { mass: "zonen" },
                        soll: [
                            K.soll(LR, 5, "Faunenwechsel je Zone gegen das Referenz-Profil (Epi- bis Bathypelagial)", {
                                key: "zonenMitFaunenwechsel",
                                rel: "≥",
                                zahl: 3,
                                einheit: "Zonen",
                                refQuelle: "das Referenz-Profil der Pelagial-Zonen: Epi- 0–200 m, Meso- 200–1 000 m, Bathypelagial 1 000–4 000 m — drei Zonen mit eigener Fauna im Abstieg 0 → 4 000 m der Karte",
                            }),
                        ],
                        zeuge: zeugeWelt(1000),
                        taeter: "stamm/kreatur-fauna.js _fischZelle (eine Fauna, keine Tiefe) · gelaende-core.js (das Meer der Welt ~17 m flach)",
                        nicht: "keine Tiefsee in der Welt, keine Fauna je Zone",
                        leser: "stamm/kreatur-fauna.js:590 _fischTiefeY — die Tiefe ist ein Anteil der Säule, keine Zone",
                        unklar: "der Richter nennt keine Zahl — Vorschlag: „Fauna wechselt an 3 von 3 Zonen (Epi/Meso/Bathy), Jaccard ≤ 0,3 je Grenze“",
                        gruen: gut({ zonenMitFaunenwechsel: 3 }, 3721),
                        attrappen: [{ name: "drei Zonen behauptet ohne Tiefe der Welt", roh: flach({ zonenMitFaunenwechsel: 3 }) }],
                    },
                    6: {
                        u: { mass: "provinzen", saaten: 200, fehlt: "keine Lebensraum-Karte, kein Nischenfeld (30–100 Provinzen)" },
                        soll: [K.soll(LR, 6, "200 Saaten", { key: "saaten", rel: "≥", einheit: "Saaten" }), K.soll(LR, 6, "Fehlplatzierung < 5 %", { key: "fehlplatzierungProzent", einheit: "%" })],
                        zeuge: zeugeWelt(200),
                        taeter: "planet-core.js planetOrt (keine Lebensraum-Karte)",
                        nicht: "keine Lebensraum-Karte",
                        leser: "planet-core.js:2290 planetOrt — delta trägt klima/meer/wetter/wuchs/wildnis, kein Nischenfeld",
                        gruen: gut({ saaten: 200, fehlplatzierungProzent: 3.1 }, 200),
                        attrappen: [{ name: "200 Saaten ohne Antwort", roh: flach({ saaten: 200, fehlplatzierungProzent: 3.1 }) }],
                    },
                    7: {
                        u: { mass: "fremd", fehlt: "keine fremden Ozeane (Methan, unter Eis, Superdruck)" },
                        soll: [
                            K.soll(LR, 7, "≥ 50 % der fremden Saaten mit bewohntem Lebensraum ohne Erd-Gegenstück", { key: "fremdBewohntProzent", einheit: "%" }),
                            K.soll(LR, 7, "0 % bewohnte Zonen ohne Energiequelle", { key: "ohneEnergieProzent", einheit: "%" }),
                        ],
                        zeuge: zeugeWelt(10),
                        taeter: "foundry-core.js:152 WASSER_GESETZ (drei Körper, keine Chemie)",
                        nicht: "keine fremde Chemie",
                        leser: "planet-core.js:307 planetPlan — kein Eingang für Chemie oder fremde Meere",
                        gruen: gut({ fremdBewohntProzent: 62, ohneEnergieProzent: 0 }, 40),
                        attrappen: [{ name: "62 % ohne eine fremde Saat", roh: flach({ fremdBewohntProzent: 62, ohneEnergieProzent: 0 }) }],
                    },
                },
            },
            // ═══ DAS BILD UNTER WASSER: Sicht, Leib, Licht, Farbe, Tiefe ═══
            [BI]: {
                sek: 10,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "die Bilder (S2 Fischleib, S6 Riff, S7 Szenen) und die Pixel der Lichtfinger — swiftshader schießt nicht",
                mess: async function (H, U, M) {
                    const seite = (fn, a) => H.seite("return await (" + fn.toString() + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    await H.seite(require(require("path").resolve("scripts/lib/wasser-linse.cjs")).WASSER_INSTALL + "\nreturn true;");
                    const bild = async (r, T, a) => {
                        const s = r.state;
                        const A = r.constructor;
                        const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const O = await window.__wasserOrte({});
                        const WG = A.Gesetz("terrain:WASSER_GESETZ", null);
                        const wl = Number.isFinite(s.waterLevel) ? s.waterLevel : 0;
                        const cam = s.camera;
                        const camAlt = cam.position.clone();
                        const quatAlt = cam.quaternion.clone();
                        const luft = r._luftEnsure();
                        const tod = s.timeOfDay;
                        const regionen = [s.hydrosphere].concat(s.hydroTiles ? [...s.hydroTiles.values()] : []).filter((h) => h && h.ready);
                        let fluss = null;
                        let breitM = 0;
                        for (const h of regionen)
                            for (const rv of h.rivers || [])
                                for (const p of rv.points || []) {
                                    if (p.inLake) continue;
                                    if (p.width > breitM) breitM = p.width;
                                    if (!fluss && __gelaendeCore.gewaesserArt(p.width) === "fluss" && r._wasserArtAt(p.x, p.z) === "fluss" && r._nassAt(p.x, p.z)) fluss = [p.x, p.z];
                                }
                        let lo = 0.1;
                        let hi = 500;
                        for (let i = 0; i < 40; i++) {
                            const m = (lo + hi) / 2;
                            if (__gelaendeCore.gewaesserArt(m) === "fluss") hi = m;
                            else lo = m;
                        }
                        let tief = { d: -Infinity };
                        if (O.meer)
                            for (let i = -30; i <= 30; i++)
                                for (let j = -30; j <= 30; j++) {
                                    const x = O.meer[0] + i * 200;
                                    const z = O.meer[1] + j * 200;
                                    const d = wl - r._terrainMacroSurfaceY(x, z, false);
                                    if (d > tief.d) tief = { d, x, z };
                                }
                        const modus = (x, z, y) => {
                            cam.position.set(x, y, z);
                            cam.updateMatrixWorld(true);
                            r._applyDayNightToScene();
                            return { unter: !!s.kameraUnterWasser, art: r._wasserArtAt(x, z), sichtM: R3(r._luftSichtM(y)), farbe: luft.U.farbe.value.toArray().map(R3), beta: R3(luft.U.beta.value) };
                        };
                        const aus = { tiefeM: R3(tief.d), fluss, laeufe: { regionen: regionen.length, breitM: R3(breitM), flussAbM: R3(hi) } };
                        try {
                            if (O.bach) {
                                const bb = r._voxelSurfaceY(O.bach.x, O.bach.z);
                                aus.bach = modus(O.bach.x, O.bach.z, (bb + r._koerperWasser(O.bach.x, O.bach.z, bb)) / 2);
                            }
                            if (fluss) {
                                const fb = r._voxelSurfaceY(fluss[0], fluss[1]);
                                aus.fluss = modus(fluss[0], fluss[1], (fb + r._koerperWasser(fluss[0], fluss[1], fb)) / 2);
                            }
                            if (O.see) {
                                await __weltDa(() => !r._ensureHydroTilesAround(O.see.mitte[0], O.see.mitte[1], 0));
                                aus.see = modus(O.see.mitte[0], O.see.mitte[1], O.see.level - 2);
                                aus.oben = modus(O.see.mitte[0], O.see.mitte[1], O.see.level + 10);
                            }
                            if (Number.isFinite(tief.d) && tief.d > 1) {
                                await __weltDa(() => !r._ensureHydroTilesAround(tief.x, tief.z, 0));
                                aus.tiefe = a.tiefen.filter((d) => d < tief.d).map((d) => Object.assign({ d }, modus(tief.x, tief.z, wl - d)));
                            }
                            const sonne = [];
                            for (const t of [0.4, 0.6]) {
                                r.setTimeOfDay(t, "regler");
                                const v = r._sonnenRichtung();
                                sonne.push([v.x, v.y, v.z].map(R3));
                            }
                            aus.sonne = sonne;
                        } finally {
                            r.setTimeOfDay(tod, "regler");
                            cam.position.copy(camAlt);
                            cam.quaternion.copy(quatAlt);
                            cam.updateMatrixWorld(true);
                            r._applyDayNightToScene();
                        }
                        const namen = Object.keys(s.hydroSurfaceUniforms || {}).concat(Object.keys(luft.U));
                        aus.uniforms = namen.length;
                        aus.lichtTraeger = namen.filter((k) => /kaustik|caustic|finger|godray|strahl/i.test(k));
                        aus.koerper = WG ? Object.keys(WG.koerper).map((k) => [k].concat(A._wasserKoerper({ wK: WG.koerper[k].kd, koerperStreu: WG.koerperStreu }, r._wasserOptik().n).map(R3))) : [];
                        aus.amOrt = [O.bach && r._wasserArtAt(O.bach.x, O.bach.z), O.see && r._wasserArtAt(O.see.mitte[0], O.see.mitte[1]), O.meer && r._wasserArtAt(O.meer[0], O.meer[1])];
                        const P = s.fischPool;
                        const g = P && P.mesh.geometry;
                        aus.fischLeib = { dreiecke: g ? (g.index ? g.index.count / 3 : g.attributes.position.count / 3) : null, groesse: A._fischGesetz().F.leib.groesse };
                        if (!r._fischKarte) r._fischTakt(0);
                        const F = A._fischGesetz().F;
                        let stand = null;
                        if (O.bach) {
                            await __weltDa(() => !r._ensureHydroTilesAround(O.bach.x, O.bach.z, 64));
                            const ix0 = Math.floor(O.bach.x / F.zelleM);
                            const iz0 = Math.floor(O.bach.z / F.zelleM);
                            for (let i = -5; i <= 5 && !stand; i++) for (let j = -5; j <= 5 && !stand; j++) stand = r._fischZelle({ saat: r._fischKarte.saat }, { ix: ix0 + i, iz: iz0 + j }).stand;
                        }
                        aus.pose = stand ? { px: R3(stand.x + stand.u.x), py: R3(stand.y), pz: R3(stand.z + stand.u.z), lx: R3(stand.x), ly: R3(stand.y), lz: R3(stand.z) } : null;
                        aus.meerPose = O.meer ? { px: O.meer[0], py: R3(wl - 0.5), pz: O.meer[1], lx: O.meer[0] + 6, ly: R3(wl - 1), lz: O.meer[1] } : null;
                        return aus;
                    };
                    const B = await seite(bild, { tiefen: [1, 5, 10, 15, 100, 200, 300, 400, 500, 600, 700, 800, 900, 1000] });
                    const arten = ["bach", "see", "fluss"].filter((k) => B[k] && B[k].unter);
                    const sichten = arten.map((k) => B[k].sichtM);
                    const streu = new Set(sichten).size > 1 ? 1 : 0;
                    const kref = [0.35, 0.064, 0.017];
                    const fehler = (e) => {
                        const g = e.farbe;
                        const sg = g[0] + g[1] + g[2];
                        const rr = kref.map((k) => Math.exp(-k * e.d));
                        const sr = rr[0] + rr[1] + rr[2];
                        if (!(sg > 0)) return 100;
                        return Math.round(((Math.abs(g[0] / sg - rr[0] / sr) + Math.abs(g[1] / sg - rr[1] / sr) + Math.abs(g[2] / sg - rr[2] / sr)) / 2) * 1000) / 10;
                    };
                    const tiefe = B.tiefe || [];
                    const je100 = tiefe.filter((e) => e.d >= 100 && e.unter);
                    const aus = M.teil || {};
                    for (const nr of Object.keys(U)) {
                        const u = U[nr];
                        let roh;
                        if (u.mass === "sicht") {
                            roh = {
                                werte: { sichtBachM: B.bach ? B.bach.sichtM : undefined, sichtSeeM: B.see ? B.see.sichtM : undefined, sichtFlussM: B.fluss ? B.fluss.sichtM : undefined },
                                zeuge: { antworten: arten.length + (B.oben && B.oben.unter === false ? 1 : 0), streuung: streu, oben: B.oben ? B.oben.unter : null },
                            };
                            if (!B.fluss) roh.nicht = "kein Fluss am Messort: der breiteste Lauf in " + B.laeufe.regionen + " geladenen Hydro-Regionen um die Mess-Wiese ist " + B.laeufe.breitM + " m, ein Fluss beginnt bei " + B.laeufe.flussAbM + " m (gelaende-core.js:762 gewaesserArt) — gemessen Bach und See";
                        } else if (u.mass === "leib") {
                            roh = {
                                werte: { poseAbstandM: B.pose ? 1 : undefined, dreieckeJeFisch: B.fischLeib.dreiecke, artenImWasser: 1 },
                                zeuge: { antworten: B.pose ? 1 : 0, streuung: 0 },
                                auge: await M.auge("wasser-bild-s" + nr, B.pose || { ort: "wiese" }),
                                nicht: "der Fischleib ist ein Doppel-Keil (Oktaeder, " + B.fischLeib.dreiecke + " Dreiecke, " + B.fischLeib.groesse.join(" × ") + " m) — keine Flossen, kein Schuppenglanz, keine Seitenlinie, eine Art",
                            };
                        } else if (u.mass === "licht") {
                            roh = {
                                werte: { lichtfinger: B.lichtTraeger.length },
                                zeuge: { antworten: B.uniforms, streuung: B.sonne && B.sonne[0].join() !== B.sonne[1].join() ? 1 : 0 },
                                nicht: "kein Lichtfinger, keine Kaustik unter Wasser: " + B.uniforms + " Uniforms des Wassers und der Luft, keiner trägt Licht-Strahlen" + (B.lichtTraeger.length ? " außer " + B.lichtTraeger.join("/") : ""),
                            };
                        } else if (u.mass === "farbe") {
                            const typen = new Set(B.amOrt.filter(Boolean)).size;
                            roh = {
                                werte: { koerperTypen: B.koerper.length, typenAmOrt: typen },
                                zeuge: { antworten: B.koerper.length, streuung: new Set(B.koerper.map((k) => k.slice(1).join())).size > 1 ? 1 : 0 },
                                nicht: B.koerper.length + " feste Wasser-Körper (" + B.koerper.map((k) => k[0]).join("/") + ") statt 14 Jerlov-Typen; das Meer liest den Körper „" + B.amOrt[2] + "“ — keine Farbe aus Plankton und Schwebstoff am Ort",
                            };
                        } else if (u.mass === "tiefe") {
                            const t10 = tiefe.find((e) => e.d === 10);
                            roh = {
                                werte: { fehlerJe100mProzent: je100.length ? Math.max(...je100.map(fehler)) : undefined, fehler10mProzent: t10 ? fehler(t10) : undefined, tiefeMaxM: B.tiefeM, stufen100m: je100.length },
                                zeuge: { antworten: je100.length, streuung: new Set(tiefe.map((e) => e.farbe.join())).size > 1 ? 1 : 0 },
                                nicht: "die Welt trägt am Meer höchstens " + B.tiefeM + " m Wasser — kein Abstieg 0 → 1 000 m, keine Biolumineszenz" + (t10 ? "; bei 10 m trägt das Auge " + t10.farbe.join("/") + " (Grün vor Blau, das Meer liest den See-Körper)" : ""),
                            };
                        } else {
                            roh = {
                                werte: { koerperTypen: B.koerper.length },
                                zeuge: { antworten: B.koerper.length, streuung: 0 },
                                auge: await M.auge("wasser-bild-s" + nr, B.meerPose || { ort: "wiese" }),
                                nicht: u.fehlt,
                            };
                        }
                        aus[nr] = roh;
                    }
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: { mass: "sicht" },
                        soll: [
                            K.soll(BI, 1, "Sichtweite in m an fester Pose gegen das Band des Gewässertyps", { key: "sichtBachM", rel: "band", zahl: 5, bis: 20, einheit: "m", refQuelle: "klare Bäche: schwarze Scheibe 5–20 m (Davies-Colley & Smith 2001; dieselbe Quelle wie diag-wasser-leben K5)" }),
                            K.soll(BI, 1, "Sichtweite in m an fester Pose gegen das Band des Gewässertyps", { key: "sichtSeeM", rel: "band", zahl: 2, bis: 16, einheit: "m", refQuelle: "oligo- bis mesotrophe Seen: Sichttiefe 2–16 m (Carlson 1977, Trophie-Index 20–50)" }),
                            K.soll(BI, 1, "Sichtweite in m an fester Pose gegen das Band des Gewässertyps", { key: "sichtFlussM", rel: "band", zahl: 1, bis: 1.5, einheit: "m", refQuelle: "Tieflandfluss: schwarze Scheibe 1–1,5 m (Davies-Colley & Smith 2001)" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.antworten >= 4)) return "nur " + (z.antworten || 0) + " Medien gemessen (Bach, See, Fluss unter Wasser und die Kontrolle darüber)";
                            if (z.oben !== false) return "die Kontrolle über dem Spiegel liest auch Wasser (das Medium folgt der Kamera nicht)";
                            if (!(z.streuung > 0)) return "alle Gewässer tragen dieselbe Sicht (ein Körper für alle)";
                            return null;
                        },
                        taeter: "stamm/bild-himmel.js _applyDayNightToScene (WASSER_GESETZ.koerper je Art)",
                        nicht: "kein Fluss am Messort",
                        unklar: "der Richter nennt kein Band — die Station setzt Bach 5–20 m, See 2–16 m, Fluss 1–1,5 m aus Davies-Colley & Smith 2001 und Carlson 1977",
                        gruen: gut({ sichtBachM: 12, sichtSeeM: 8, sichtFlussM: 1.2 }, 4, { oben: false }),
                        attrappen: [
                            { name: "drei Sichten ohne Kamera unter Wasser", roh: flach({ sichtBachM: 12, sichtSeeM: 8, sichtFlussM: 1.2 }) },
                            { name: "ein Körper für alle (keine Streuung)", roh: { werte: { sichtBachM: 12, sichtSeeM: 12, sichtFlussM: 1.2 }, zeuge: { antworten: 4, streuung: 0, oben: false } } },
                        ],
                    },
                    2: {
                        u: { mass: "leib" },
                        soll: [K.soll(BI, 2, "Bildpaar 1 m vor dem Fisch", { key: "poseAbstandM", rel: "≤", zahl: 1, einheit: "m" }), K.soll(BI, 2, "Blindtest erkennt die Art ≥ 80 %", { key: "blindProzent", einheit: "%" })],
                        auge: { pose: "1 m stromab vor dem Stand der Forelle im Bach der Mess-Wiese, auf Höhe des Fischs", vorbild: "Foto einer Bachforelle 1 m vor der Kamera (Blindtest erkennt die Art ≥ 80 %)" },
                        taeter: "stamm/kreatur-fauna.js _kleintierZeichnen (OctahedronGeometry, eine Art)",
                        nicht: "Fischleib ein Oktaeder, eine Art",
                        leser: "stamm/kreatur-fauna.js:735 _kleintierZeichnen — new THREE.OctahedronGeometry(0.5) statt eines Leibs aus dem Ofen",
                        gruen: gut({ poseAbstandM: 1, blindProzent: 84 }, 1),
                        attrappen: [{ name: "Blindtest 84 % ohne Bild", roh: flach({ poseAbstandM: 1, blindProzent: 84 }) }],
                    },
                    3: {
                        u: { mass: "licht" },
                        soll: [K.soll(BI, 3, "Richtung der Lichtfinger ±5° zur Sonne", { key: "richtungAbwGrad", ref: 0, refQuelle: "die Richtung der Sonne unter Wasser nach Snellius (n 1,33): Abweichung 0°", einheit: "°" })],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!((roh.werte || {}).lichtfinger > 0)) return "kein Lichtfinger im Wasser gezählt";
                            if (!(z.streuung > 0)) return "die Sonne stand still (die Richtung folgt keinem Sonnenstand)";
                            return null;
                        },
                        taeter: "stamm/bild-himmel.js _applyDayNightToScene (unter Wasser kein Lichtfinger, keine Kaustik)",
                        nicht: "keine Lichtfinger, keine Kaustik",
                        leser: "stamm/bild-himmel.js:2480 _dayNightApplyHemiUndLuft (aus _applyDayNightToScene) — das Medium unter Wasser trägt Farbe und Abfall, keinen Strahl der Sonne",
                        unklar: "„Kaustik-Kontrast im Band des Fotos“ nennt kein Band — Vorschlag: Michelson-Kontrast der Kaustik 0,2–0,6 im Flachwasser ≤ 3 m",
                        gruen: gut({ richtungAbwGrad: 3, lichtfinger: 40 }, 30),
                        attrappen: [{ name: "Richtung 3° ohne einen Finger", roh: { werte: { richtungAbwGrad: 3, lichtfinger: 0 }, zeuge: { antworten: 30, streuung: 1 } } }],
                    },
                    4: {
                        u: { mass: "farbe" },
                        soll: [K.soll(BI, 4, "ΔE ≤ 10 je Typ", { key: "deltaEMax" })],
                        zeuge: zeugeWelt(14),
                        taeter: "foundry-core.js:152 WASSER_GESETZ.koerper (drei feste Körper)",
                        nicht: "drei Körper statt 14 Jerlov-Typen",
                        leser: "stamm/wasser-hydro.js:605 _wasserArtAt — die Farbe wählt die Breite des Laufs, kein Plankton, kein Schwebstoff am Ort",
                        gruen: gut({ deltaEMax: 7 }, 14),
                        attrappen: [{ name: "ΔE 7 aus einer Tabelle", roh: flach({ deltaEMax: 7 }) }],
                    },
                    5: {
                        u: { mass: "tiefe" },
                        soll: [K.soll(BI, 5, "Fehler ≤ 20 %", { key: "fehlerJe100mProzent", einheit: "%" })],
                        zeuge: zeugeWelt(10),
                        taeter: "gelaende-core.js (das Meer der Welt ~17 m) · WASSER_GESETZ.koerper.see (kd Grün < Blau)",
                        nicht: "keine 1 000 m Wasser in der Welt",
                        leser: "stamm/bild-himmel.js:2505 — das Meer liest den See-Körper (WGu.koerper[_wasserArtAt]), keine Biolumineszenz",
                        gruen: gut({ fehlerJe100mProzent: 14 }, 10),
                        attrappen: [{ name: "14 % ohne eine Stufe von 100 m", roh: flach({ fehlerJe100mProzent: 14 }) }],
                    },
                    6: {
                        u: { mass: "nahbild", fehlt: "kein Riff, kein Kelpwald, kein Meeresschnee" },
                        soll: [K.soll(BI, 6, "Panel unterscheidet Spiel und Foto in ≤ 60 %", { key: "panelProzent", einheit: "%" })],
                        auge: { pose: "unter Wasser am Meer nächst der Mess-Wiese (Riff und Kelp gibt es nicht)", vorbild: "Fotos von Riff und Kelpwald im Nahbild (Panel ≤ 60 %)" },
                        taeter: "phyto-core.js (kein Riff, kein Kelp)",
                        nicht: "kein Riff, kein Kelp",
                        leser: "foundry-core.js:4985 — schilf ist die einzige Art am Wasser im Buch der Gestalten; kein Kelp, kein Seegras, keine Koralle (Absenz-Grep über alle *-core.js)",
                        gruen: gut({ panelProzent: 55 }, 1),
                        attrappen: [{ name: "Panel 55 % ohne Bild", roh: flach({ panelProzent: 55 }) }],
                    },
                    7: {
                        u: { mass: "szenen", fehlt: "drei feste Wasser-Körper, keine fremde Sonne und Chemie im Wasser" },
                        soll: [
                            K.soll(BI, 7, "Blindtest 100 Szenen", { key: "szenen", rel: "≥", einheit: "Szenen" }),
                            K.soll(BI, 7, "erdähnlich: Blindtest 100 Szenen ≤ 55 %", { key: "blindProzent", einheit: "%" }),
                            K.soll(BI, 7, "fremd: gegen offline spektrales Path-Tracing ΔE ≤ 5", { key: "deltaEFremd" }),
                        ],
                        auge: { pose: "unter Wasser am Meer nächst der Mess-Wiese (eine Szene von 100)", vorbild: "Unterwasser-Fotos (100 Szenen, Blindtest ≤ 55 %) und offline spektrales Path-Tracing (fremd, ΔE ≤ 5)" },
                        taeter: "foundry-core.js:152 WASSER_GESETZ (feste Körper, keine Chemie)",
                        nicht: "keine fremde Wasser-Optik",
                        leser: "stamm/wasser-hydro.js:853 _wasserOptik — die Brechzahl des Wassers fest, keine Chemie je Planet",
                        gruen: gut({ szenen: 100, blindProzent: 52, deltaEFremd: 4 }, 100),
                        attrappen: [{ name: "100 Szenen ohne Bild", roh: flach({ szenen: 100, blindProzent: 52, deltaEFremd: 4 }) }],
                    },
                },
            },
            // ═══ DAS NETZ IM WASSER: Fisch liest Pegel und Spieler, Plankton, Größenspektrum ═══
            [NE]: {
                sek: 10,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "der Pegel-Hub selbst (Sturm bis +5 cm, ~240 s Spielzeit) passt nicht in den Deckel — S1 liest den Hub aus der Lage der gezeichneten Fische in der Säule; die Flucht im Bild am Gerät",
                mess: async function (H, U, M) {
                    const seite = (fn, a) => H.seite("return await (" + fn.toString() + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    await H.seite(require(require("path").resolve("scripts/lib/wasser-linse.cjs")).WASSER_INSTALL + "\nreturn true;");
                    const netz = async (r, T, a) => {
                        const s = r.state;
                        const A = r.constructor;
                        const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const O = await window.__wasserOrte({});
                        const pm = s.playerMesh;
                        const alt = pm.position.clone();
                        const F = A._fischGesetz().F;
                        const gezeichnet = (x, z, rM) => {
                            const L = [];
                            const P = s.fischPool;
                            if (!P) return L;
                            const m4 = new T.Matrix4();
                            const p = new T.Vector3();
                            P.mesh.updateMatrixWorld(true);
                            for (let i = 0; i < P.mesh.count; i++) {
                                P.mesh.getMatrixAt(i, m4);
                                p.setFromMatrixPosition(m4.premultiply(P.mesh.matrixWorld));
                                if (Math.hypot(p.x - x, p.z - z) <= rM) L.push({ x: p.x, y: p.y, z: p.z });
                            }
                            return L;
                        };
                        const aus = {};
                        try {
                            if (!O.bach) throw new Error("kein Bach an der Mess-Wiese (__wasserOrte)");
                            await __weltDa(() => !r._ensureHydroTilesAround(O.bach.x, O.bach.z, 64));
                            let land = null;
                            for (let d = 15; d <= 40 && !land; d += 5)
                                for (let k = 0; k < 16 && !land; k++) {
                                    const x = O.bach.x + d * Math.cos((k / 16) * 2 * Math.PI);
                                    const z = O.bach.z + d * Math.sin((k / 16) * 2 * Math.PI);
                                    if (!r._nassAt(x, z)) land = [x, z];
                                }
                            pm.position.set(land[0], r._voxelSurfaceY(land[0], land[1]) + A.PLAYER_FOOT_OFFSET, land[1]);
                            for (let i = 0; i < 12; i++) r._fischTakt(1 / 60);
                            const F0 = gezeichnet(O.bach.x, O.bach.z, 40);
                            const saeule = F0.map((f) => {
                                const b = r._voxelSurfaceY(f.x, f.z);
                                const sp = r._koerperWasser(f.x, f.z, b);
                                return sp - b > 0.05 ? (f.y - b) / (sp - b) : null;
                            }).filter((x) => x !== null);
                            aus.fische = F0.length;
                            aus.anteil = saeule.length ? R3(saeule.reduce((q, x) => q + x, 0) / saeule.length) : null;
                            aus.anteilStreu = saeule.length > 1 ? R3(Math.max(...saeule) - Math.min(...saeule)) : 0;
                            if (F0.length) {
                                const P0 = F0[0];
                                const vor = gezeichnet(P0.x, P0.z, 15).map((f) => Math.hypot(f.x - P0.x, f.z - P0.z));
                                pm.position.set(P0.x, r._voxelSurfaceY(P0.x, P0.z) + A.PLAYER_FOOT_OFFSET, P0.z);
                                for (let i = 0; i < 180; i++) r._fischTakt(1 / 60);
                                const nach = gezeichnet(P0.x, P0.z, 15).map((f) => Math.hypot(f.x - P0.x, f.z - P0.z));
                                aus.flucht = { vor: vor.length ? R3(Math.min(...vor)) : null, nach: nach.length ? R3(Math.min(...nach)) : null, n: nach.length };
                            }
                        } finally {
                            pm.position.copy(alt);
                            if (r._fischKarte) r._fischKarte.fische.clear();
                            r._fischTakt(1 / 60);
                        }
                        const cam = s.camera;
                        const camAlt = cam.position.clone();
                        const luft = r._luftEnsure();
                        const sa = { season: s.season, phase: s.seasonPhase, anker: r._saisonAnker, auto: s.autoSeason };
                        const trueb = [];
                        try {
                            if (O.see) {
                                await __weltDa(() => !r._ensureHydroTilesAround(O.see.mitte[0], O.see.mitte[1], 0));
                                for (const w of ["fruehling", "sommer", "herbst", "winter"]) {
                                    r.setSeason(w);
                                    cam.position.set(O.see.mitte[0], O.see.level - 2, O.see.mitte[1]);
                                    cam.updateMatrixWorld(true);
                                    r._applyDayNightToScene();
                                    trueb.push([w, s.kameraUnterWasser ? R3(luft.U.beta.value) : null]);
                                }
                            }
                        } finally {
                            s.season = sa.season;
                            s.seasonPhase = sa.phase;
                            r._saisonAnker = sa.anker;
                            s.autoSeason = sa.auto;
                            cam.position.copy(camAlt);
                            cam.updateMatrixWorld(true);
                            r._applyDayNightToScene();
                        }
                        aus.trueb = trueb;
                        if (!r._fischKarte) r._fischTakt(0);
                        const fk = { saat: r._fischKarte.saat };
                        const regionen = [s.hydrosphere].concat(s.hydroTiles ? [...s.hydroTiles.values()] : []).filter((h) => h && h.ready);
                        const orte = [];
                        for (const h of regionen)
                            for (const rv of h.rivers || [])
                                for (let k = 0; k < (rv.points || []).length; k += 7) if (!rv.points[k].inLake) orte.push([rv.points[k].x, rv.points[k].z]);
                        const wahl = [];
                        for (let i = 0; i < a.orte && orte.length; i++) wahl.push(orte[Math.floor((i * orte.length) / a.orte)]);
                        if (O.see) wahl.push(O.see.mitte);
                        if (O.meer) wahl.push(O.meer);
                        const dichte = [];
                        for (const [x, z] of wahl) {
                            const ix0 = Math.floor(x / F.zelleM);
                            const iz0 = Math.floor(z / F.zelleM);
                            let n = 0;
                            let nass = 0;
                            for (let i = -2; i <= 2; i++)
                                for (let j = -2; j <= 2; j++) {
                                    if (r._nassAt((ix0 + i + 0.5) * F.zelleM, (iz0 + j + 0.5) * F.zelleM)) nass++;
                                    const c = r._fischZelle(fk, { ix: ix0 + i, iz: iz0 + j });
                                    if (c.stand) n += c.stand.n;
                                }
                            if (nass) dichte.push(R3(n / nass));
                        }
                        aus.dichte = dichte;
                        aus.groessen = [F.leib.groesse[2]];
                        await r._fadenQuelle();
                        const ant = await Promise.all([0, 1, 2, 3, 4].map((i) => r._planetAuftrag({ type: "planet-ort", samen: "leben-wasser-" + i, breite: ((i * 37) % 150) - 75, laenge: ((i * 53) % 360) - 180, zeitMa: 0 })));
                        aus.planetFelder = Object.keys((ant[0] && ant[0].delta) || {});
                        aus.planetAntworten = ant.length;
                        return aus;
                    };
                    const N = await seite(netz, { orte: 50 });
                    const tb = (N.trueb || []).map((x) => x[1]).filter((x) => x !== null);
                    const tMit = tb.length ? tb.reduce((q, x) => q + x, 0) / tb.length : 0;
                    const truebHub = tb.length && tMit > 0 ? Math.round(((Math.max(...tb) - Math.min(...tb)) / tMit) * 1000) / 1000 : undefined;
                    const d = N.dichte || [];
                    const dm = d.reduce((q, x) => q + x, 0) / Math.max(1, d.length);
                    const dStreu = Math.sqrt(d.reduce((q, x) => q + (x - dm) * (x - dm), 0) / Math.max(1, d.length));
                    const aus = M.teil || {};
                    for (const nr of Object.keys(U)) {
                        const u = U[nr];
                        let roh;
                        if (u.mass === "flucht") {
                            const fl = N.flucht || {};
                            roh = {
                                werte: { fischHubJePegelHub: N.anteil === null ? undefined : N.anteil, fluchtAbstandM: fl.nach === null ? undefined : fl.nach },
                                zeuge: { antworten: N.fische, streuung: N.anteilStreu, vor: fl.vor, nach: fl.nach },
                            };
                        } else if (u.mass === "bluete") {
                            roh = {
                                werte: { truebeJahresHub: truebHub, jahreszeiten: tb.length },
                                zeuge: { antworten: tb.length, streuung: truebHub || 0 },
                                nicht: "kein Plankton-Feld: die Trübe des Sees ist über vier Jahreszeiten " + (N.trueb || []).map((x) => x[0] + " " + x[1]).join(", ") + " (WASSER_GESETZ.koerper.see fest) — keine Blüte",
                            };
                        } else if (u.mass === "kette") {
                            roh = {
                                werte: { orte: d.length },
                                zeuge: { antworten: d.length, streuung: Math.round(dStreu * 1000) / 1000 },
                                nicht: "kein Plankton-Feld, gegen das die Fischdichte korrelierte — die Dichte an " + d.length + " Orten streut " + Math.round(dStreu * 1000) / 1000 + " Fische/Zelle aus dem Wurf der Zelle (FISCH_GESETZ.anteil), kein Räuber im Wasser",
                            };
                        } else if (u.mass === "spektrum") {
                            roh = {
                                werte: { groessenklassen: N.groessen.length },
                                zeuge: { antworten: N.groessen.length, streuung: 0 },
                                nicht: "eine Größenklasse im Wasser (die Forelle " + N.groessen.join("/") + " m) — kein Plankton, kein Wal, keine Steigung",
                            };
                        } else if (u.mass === "orbit") {
                            roh = { werte: {}, zeuge: { antworten: 0, streuung: 0 }, nicht: u.fehlt };
                        } else {
                            roh = {
                                werte: { saaten: N.planetAntworten },
                                zeuge: { antworten: N.planetAntworten, streuung: 0 },
                                nicht: u.fehlt + " — die Antwort des Planeten trägt " + (N.planetFelder || []).join("/") + ", keine Primärproduktion",
                            };
                        }
                        aus[nr] = roh;
                    }
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: { mass: "flucht" },
                        soll: [
                            K.soll(NE, 1, "Hub und Flucht aus dem Bild", { key: "fischHubJePegelHub", rel: "≥", zahl: 0.8, einheit: "× Pegel-Hub", quelleFeld: "tiefe", quelleWort: "Fisch-Hub ≥ 0,8 × Pegel-Hub" }),
                            K.soll(NE, 1, "Hub und Flucht aus dem Bild", { key: "fluchtAbstandM", rel: "≥", zahl: 3, einheit: "m", quelleFeld: "tiefe", quelleWort: "Fluchtabstand ≥ 3 m" }),
                        ],
                        zeuge: (roh) => {
                            const z = roh.zeuge || {};
                            if (!(z.antworten >= 3)) return "nur " + (z.antworten || 0) + " gezeichnete Fische am Bach (Soll ≥ 3)";
                            if (!(z.vor !== null && z.vor !== undefined && z.nach > z.vor)) return "der Fisch wich dem Spieler nicht (nächster vor " + z.vor + " m, nach " + z.nach + " m)";
                            return null;
                        },
                        taeter: "tetrapoda-core.js FISCH_GESETZ.tiefe 0,4 (stamm/kreatur-fauna.js _fischTiefeY: der Fisch hält 0,4 der Säule, steigt mit 0,4 × Pegel-Hub)",
                        unklar: "der Richter nennt keine Zahl — die Station liest die Zahlen der Tiefe der Karte (Fisch-Hub ≥ 0,8 × Pegel-Hub, Fluchtabstand ≥ 3 m)",
                        gruen: { werte: { fischHubJePegelHub: 0.9, fluchtAbstandM: 8.4 }, zeuge: { antworten: 15, streuung: 0.2, vor: 0.4, nach: 8.4 } },
                        attrappen: [
                            { name: "Flucht 8,4 m ohne gezeichneten Fisch", roh: { werte: { fischHubJePegelHub: 0.9, fluchtAbstandM: 8.4 }, zeuge: { antworten: 0 } } },
                            { name: "der Fisch stand schon fern (kein Weichen)", roh: { werte: { fischHubJePegelHub: 0.9, fluchtAbstandM: 8.4 }, zeuge: { antworten: 15, streuung: 0.2, vor: 8.4, nach: 8.4 } } },
                        ],
                    },
                    2: {
                        u: { mass: "bluete" },
                        soll: [K.soll(NE, 2, "Phase der Blüte ±1 Monat", { key: "phaseAbwMonate", ref: 0, refQuelle: "Ozeanfarben-Zeitreihe (SeaWiFS-Klimatologie): Abweichung der Blüten-Phase 0 Monate", einheit: "Monate" })],
                        zeuge: zeugeWelt(4),
                        taeter: "foundry-core.js:152 WASSER_GESETZ.koerper (kein Plankton-Feld)",
                        nicht: "kein Plankton-Feld",
                        leser: "foundry-core.js:179 WASSER_GESETZ.koerper — Plankton nur als Wort zur Trübe des See-Körpers, kein Feld aus Licht × Nährstoff",
                        gruen: gut({ phaseAbwMonate: 0.5 }, 4),
                        attrappen: [{ name: "Phase ohne Jahreszeit", roh: flach({ phaseAbwMonate: 0.5 }) }],
                    },
                    3: {
                        u: { mass: "kette" },
                        soll: [K.soll(NE, 3, "an 50 Orten", { key: "orte", rel: "≥", einheit: "Orte" }), K.soll(NE, 3, "räumliche Korrelation Fischbiomasse ↔ Plankton r ≥ 0,6 an 50 Orten", { key: "rFischPlankton" })],
                        zeuge: zeugeWelt(50),
                        taeter: "tetrapoda-core.js FISCH_GESETZ.anteil (die Dichte ist der Wurf der Zelle)",
                        nicht: "kein Plankton, kein Räuber im Wasser",
                        leser: "stamm/kreatur-fauna.js:562 _fischZelle — der Stand liest Strömung und Wurf, keine Primärproduktion",
                        gruen: gut({ orte: 52, rFischPlankton: 0.68 }, 52),
                        attrappen: [{ name: "r 0,68 ohne einen Ort", roh: flach({ orte: 52, rFischPlankton: 0.68 }) }],
                    },
                    4: {
                        u: { mass: "spektrum" },
                        soll: [K.soll(NE, 4, "Steigung −1 ±0,2", { key: "steigung", ref: -1, refQuelle: "Sheldon et al. 1972: normalisiertes Biomasse-Spektrum, Steigung −1" })],
                        zeuge: zeugeWelt(5),
                        taeter: "tetrapoda-core.js FISCH_GESETZ.leib (eine Größe)",
                        nicht: "eine Größenklasse",
                        leser: "tetrapoda-core.js:2818 FISCH_GESETZ — ein Leib 0,3 m, kein Plankton bis Wal",
                        gruen: gut({ steigung: -1.05 }, 8),
                        attrappen: [{ name: "Steigung −1,05 aus einer Klasse", roh: flach({ steigung: -1.05 }) }],
                    },
                    5: {
                        u: { mass: "orbit", fehlt: "kein Orbitbild, kein Chlorophyll-Feld (keine Pose über der Atmosphäre)" },
                        soll: [K.soll(NE, 5, "r ≥ 0,7", { key: "rOrbit" })],
                        zeuge: zeugeWelt(12),
                        taeter: "scripts/werkbank.cjs /bild (keine Orbit-Pose) · kein Plankton-Feld",
                        nicht: "kein Orbit, kein Chlorophyll",
                        leser: "scripts/werkbank.cjs:2110 /bild — keine Pose über der Atmosphäre, kein Chlorophyll-Feld zu schießen",
                        gruen: gut({ rOrbit: 0.74 }, 12),
                        attrappen: [{ name: "r 0,74 ohne Zeitraffer", roh: flach({ rOrbit: 0.74 }) }],
                    },
                    6: {
                        u: { mass: "fremd", fehlt: "keine fremde Primärproduktion (Chemosynthese, fremdes Licht)" },
                        soll: [
                            K.soll(NE, 6, "100 fremde Saaten", { key: "saaten", rel: "≥", einheit: "Saaten" }),
                            K.soll(NE, 6, "Spektrum-Steigung −1 ±0,3", { key: "steigung", ref: -1, refQuelle: "Sheldon et al. 1972: normalisiertes Biomasse-Spektrum, Steigung −1" }),
                        ],
                        zeuge: zeugeWelt(100),
                        taeter: "planet-core.js planetPlan (keine Chemie, keine Primärproduktion)",
                        nicht: "keine fremde Primärproduktion",
                        leser: "voxel-worker.js:1193 planetOrtAuftrag — die Antwort trägt keine Primärproduktion",
                        gruen: gut({ saaten: 100, steigung: -0.9 }, 100),
                        attrappen: [{ name: "100 Saaten ohne Antwort", roh: flach({ saaten: 100, steigung: -0.9 }) }],
                    },
                },
            },
            // ═══ DIE RHYTHMEN: Tag, Jahr, Jahrzehnt, Jahrhundert ═══
            [RH]: {
                sek: 10,
                mutiert: true,
                pfad: PFAD,
                ungefahren: "der Zeitraffer über Jahre (S3–S5) am Gerät; headless misst die Station vier Jahreszeiten und Mittag ↔ Mitternacht",
                mess: async function (H, U, M) {
                    const seite = (fn, a) => H.seite("return await (" + fn.toString() + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    await H.seite(require(require("path").resolve("scripts/lib/wasser-linse.cjs")).WASSER_INSTALL + "\nreturn true;");
                    const takt = async (r, T, a) => {
                        const s = r.state;
                        const A = r.constructor;
                        const R3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
                        const O = await window.__wasserOrte({});
                        const pm = s.playerMesh;
                        const alt = pm.position.clone();
                        const tod = s.timeOfDay;
                        const sa = { season: s.season, phase: s.seasonPhase, anker: r._saisonAnker, auto: s.autoSeason };
                        const F = A._fischGesetz().F;
                        const gezeichnet = (x, z, rM) => {
                            const L = [];
                            const P = s.fischPool;
                            if (!P) return L;
                            const m4 = new T.Matrix4();
                            const p = new T.Vector3();
                            P.mesh.updateMatrixWorld(true);
                            for (let i = 0; i < P.mesh.count; i++) {
                                P.mesh.getMatrixAt(i, m4);
                                p.setFromMatrixPosition(m4.premultiply(P.mesh.matrixWorld));
                                if (Math.hypot(p.x - x, p.z - z) <= rM) L.push({ x: p.x, y: p.y, z: p.z });
                            }
                            return L;
                        };
                        const aus = { tag: [], jahr: [] };
                        try {
                            if (!O.bach) throw new Error("kein Bach an der Mess-Wiese (__wasserOrte)");
                            await __weltDa(() => !r._ensureHydroTilesAround(O.bach.x, O.bach.z, 64));
                            let land = null;
                            for (let d = 15; d <= 40 && !land; d += 5)
                                for (let k = 0; k < 16 && !land; k++) {
                                    const x = O.bach.x + d * Math.cos((k / 16) * 2 * Math.PI);
                                    const z = O.bach.z + d * Math.sin((k / 16) * 2 * Math.PI);
                                    if (!r._nassAt(x, z)) land = [x, z];
                                }
                            pm.position.set(land[0], r._voxelSurfaceY(land[0], land[1]) + A.PLAYER_FOOT_OFFSET, land[1]);
                            for (const t of [0.5, 0.0]) {
                                r.setTimeOfDay(t, "regler");
                                for (let i = 0; i < 30; i++) r._fischTakt(1 / 60);
                                const L = gezeichnet(O.bach.x, O.bach.z, 40);
                                aus.tag.push({ t, n: L.length, y: L.length ? R3(L.reduce((q, f) => q + f.y, 0) / L.length) : null, sonne: R3(r._sonnenRichtung().y) });
                            }
                            for (const w of ["fruehling", "sommer", "herbst", "winter"]) {
                                r.setSeason(w);
                                if (r._fischKarte) r._fischKarte.zellen.clear();
                                for (let i = 0; i < 12; i++) r._fischTakt(1 / 60);
                                aus.jahr.push([w, gezeichnet(O.bach.x, O.bach.z, 40).length]);
                            }
                        } finally {
                            s.season = sa.season;
                            s.seasonPhase = sa.phase;
                            r._saisonAnker = sa.anker;
                            s.autoSeason = sa.auto;
                            r.setTimeOfDay(tod, "regler");
                            pm.position.copy(alt);
                            if (r._fischKarte) r._fischKarte.fische.clear();
                            r._fischTakt(1 / 60);
                        }
                        const wl = Number.isFinite(s.waterLevel) ? s.waterLevel : 0;
                        let tief = -Infinity;
                        if (O.meer) for (let i = -30; i <= 30; i++) for (let j = -30; j <= 30; j++) tief = Math.max(tief, wl - r._terrainMacroSurfaceY(O.meer[0] + i * 200, O.meer[1] + j * 200, false));
                        aus.tiefeM = R3(tief);
                        aus.standFelder = ["x", "y", "z", "u", "n"].length;
                        return aus;
                    };
                    const Z = await seite(takt, {});
                    const [mittag, nacht] = Z.tag || [];
                    const hub = mittag && nacht && mittag.y !== null && nacht.y !== null ? Math.round(Math.abs(mittag.y - nacht.y) * 1000) / 1000 : undefined;
                    const jz = (Z.jahr || []).map((x) => x[1]);
                    const jm = jz.reduce((q, x) => q + x, 0) / Math.max(1, jz.length);
                    const jahrHub = jz.length && jm > 0 ? Math.round(((Math.max(...jz) - Math.min(...jz)) / jm) * 1000) / 1000 : undefined;
                    const aus = M.teil || {};
                    for (const nr of Object.keys(U)) {
                        const u = U[nr];
                        let roh;
                        if (u.mass === "tag") {
                            roh = {
                                werte: { hubM: hub, tiefeMaxM: Z.tiefeM },
                                zeuge: { antworten: mittag && nacht ? Math.min(mittag.n, nacht.n) : 0, streuung: mittag && nacht ? Math.abs(mittag.sonne - nacht.sonne) : 0, vor: mittag && mittag.y, nach: nacht && nacht.y },
                                nicht: "keine Vertikalwanderung: die Fische stehen mittags und mitternachts in derselben Höhe (" + (mittag && mittag.y) + " / " + (nacht && nacht.y) + " m, FISCH_GESETZ ohne Uhr), kein Zooplankton, das Meer der Welt ist " + Z.tiefeM + " m tief",
                            };
                        } else if (u.mass === "jahr") {
                            roh = {
                                werte: { bestandJahresHub: jahrHub, zuege: 0 },
                                zeuge: { antworten: jz.length, streuung: jahrHub || 0 },
                                nicht: "kein Zug im Jahr: die gezeichneten Fische am Bach zählen über vier Jahreszeiten " + (Z.jahr || []).map((x) => x[0] + " " + x[1]).join(", ") + " — kein Lachs, kein Wal, keine Blüte",
                            };
                        } else {
                            roh = { werte: { bestandJahresHub: jahrHub }, zeuge: { antworten: jz.length, streuung: jahrHub || 0 }, nicht: u.fehlt + " — der Stand ist ein Wurf der Zelle, über vier Jahreszeiten " + jz.join("/") + " Fische" };
                        }
                        aus[nr] = roh;
                    }
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: { mass: "tag" },
                        soll: [K.soll(RH, 2, "Hub ≥ 200 m", { key: "hubM", einheit: "m" })],
                        zeuge: zeugeWelt(3, true),
                        taeter: "tetrapoda-core.js FISCH_GESETZ (keine Uhr, kein Zooplankton)",
                        nicht: "keine Vertikalwanderung",
                        leser: "stamm/kreatur-fauna.js:590 _fischTiefeY — die Höhe liest Bett und Spiegel, nie die Uhr",
                        gruen: { werte: { hubM: 320 }, zeuge: { antworten: 20, streuung: 1.2, vor: -150, nach: -470 } },
                        attrappen: [{ name: "Hub 320 m, Mittag = Mitternacht", roh: { werte: { hubM: 320 }, zeuge: { antworten: 20, streuung: 1.2, vor: -150, nach: -150 } } }],
                    },
                    3: {
                        u: { mass: "jahr" },
                        soll: [K.soll(RH, 3, "Ankunft der Züge in ihrem Monat ±1", { key: "ankunftAbwMonate", ref: 0, refQuelle: "Feldkalender der Art (Lachszug, Walwanderung): Abweichung 0 Monate", einheit: "Monate" })],
                        zeuge: zeugeWelt(4),
                        taeter: "tetrapoda-core.js FISCH_GESETZ (keine Jahreszeit, kein Zug)",
                        nicht: "kein Zug im Jahr",
                        leser: "stamm/kreatur-fauna.js:461 _fischTakt — der Bestand liest keine Jahreszeit",
                        gruen: gut({ ankunftAbwMonate: 0.6 }, 4),
                        attrappen: [{ name: "Ankunft ohne Jahreszeit", roh: flach({ ankunftAbwMonate: 0.6 }) }],
                    },
                    4: {
                        u: { mass: "riff", fehlt: "kein Riff, keine Korallendeckung, keine Bleiche" },
                        soll: [K.soll(RH, 4, "Korallendeckung über die Zeit gegen Feld-Zeitreihen ±50 %", { key: "deckungVerhaeltnis", ref: 1, refQuelle: "Feld-Zeitreihen der Korallendeckung (Hughes et al. 2018, Erholung 10–15 Jahre): Verhältnis Spiel ÷ Feld 1" })],
                        zeuge: zeugeWelt(10),
                        taeter: "phyto-core.js / tetrapoda-core.js (kein Riff)",
                        nicht: "kein Riff",
                        leser: "tetrapoda-core.js:2818 FISCH_GESETZ / foundry-core.js:4985 — keine Koralle als Lebewesen (Absenz-Grep über alle *-core.js)",
                        gruen: gut({ deckungVerhaeltnis: 1.2 }, 15),
                        attrappen: [{ name: "Deckung 1,2 ohne Zeitreihe", roh: flach({ deckungVerhaeltnis: 1.2 }) }],
                    },
                    5: {
                        u: { mass: "regime", fehlt: "kein Bestands-Regime (Sardine ↔ Sardelle), keine Dynamik des Fisch-Bestands über Jahre" },
                        soll: [K.soll(RH, 5, "Periode des Regimewechsels 40–80 Spieljahre", { key: "periodeJahre", einheit: "Spieljahre" })],
                        zeuge: zeugeWelt(40),
                        taeter: "tetrapoda-core.js FISCH_GESETZ (der Stand ist ein Wurf, kein Bestand)",
                        nicht: "kein Bestands-Regime",
                        leser: "stamm/kreatur-fauna.js:562 _fischZelle — kein Bestand, keine Wassertemperatur",
                        unklar: "„Gegenprobe ohne Temperatur-Schwankung kein Wechsel“ nennt keine Zahl — Vorschlag: „Gegenprobe: 0 Wechsel in 200 Spieljahren“",
                        gruen: gut({ periodeJahre: 60 }, 200),
                        attrappen: [{ name: "Periode 60 ohne Zeitraffer", roh: flach({ periodeJahre: 60 }) }],
                    },
                    6: {
                        u: { mass: "planeten", fehlt: "keine Gezeit fremder Monde, kein Takt des Wasserlebens aus Bahn und Gezeit" },
                        soll: [K.soll(RH, 6, "100 Planeten", { key: "planeten", rel: "≥", einheit: "Planeten" }), K.soll(RH, 6, "r ≥ 0,8", { key: "rTakt" })],
                        zeuge: zeugeWelt(100),
                        taeter: "stamm/wasser-hydro.js (kein Tidenhub) · FISCH_GESETZ (keine Uhr)",
                        nicht: "kein Takt aus Bahn und Gezeit",
                        leser: "stamm/wasser-hydro.js:67 _atlasWaterLevelAt — der Spiegel liest keinen Mond, keine Gezeit; FISCH_GESETZ ohne Einstrahlung",
                        gruen: gut({ planeten: 100, rTakt: 0.85 }, 100),
                        attrappen: [{ name: "r 0,85 ohne Planeten", roh: flach({ planeten: 100, rTakt: 0.85 }) }],
                    },
                },
            },
        },
    };
})());

// ── DIE PERSPEKTIVE leben.oeko (7 Leitern, 49 Sprossen; belegt: netz S1 und dynamik S1 — Station g2.js KASKADE_SITZUNG —,
// vielfalt S1 — Tafel tiere.K5#1 —, partner S1 — Tafel luftwasser.K4#1): das Netz, die Vielfalt, die Dynamik, der Zerfall, die
// Sukzession, die Stoffe und die Partner. Die Leser des Spiels: der BESTAND je Region (stamm/kreatur-leben.js `_bestandRegion` ·
// `_bestandSchritt` · `_kreaturBestand` · `_bestandStirbt` · `_kreaturFrass`, tetrapoda-core BESTAND_GESETZ und LEBENSRAUM_GESETZ),
// die Saaten über die Ströme des Bestands (`r._faunaStroeme`, derselbe Weg wie gate:kreatur-takt kaskade), das GEDÄCHTNIS DER TATEN
// (stamm/feld-leben.js `_tatSchreiben` · `_tatIndex`, TAT_NARBE) mit Nährstoff, Wuchs und Sukzession (stamm/vegetation-wiese.js
// `_naehrstoffAt` · `_wuchsAt` · `_sukzession` · `_baumAlter`), die Nah-Streu und der Wald (`_nahStreuKachel`, `_forestCellDarts`),
// der Kadaver (`_kreaturFaellt` · `_kreaturAasZug`), die Bestäuber (`_bestaeuberGesetz().aktiv`), die Fische (`_fischZelle`) und der
// Planet-Faden (`r._planetAuftrag` planet-ort). Jede Probe, die die Welt ändert, tut es in einem SANDKASTEN: der Bestand als Kopie
// ohne Leib, das Leben- und das Gefühl-Feld getauscht, die Taten als Kopie — am Ende steht jede Referenz der Welt wieder.
// Ein Richter ohne Zahl bekommt sein Soll aus Tiefe oder Umfang der Karte oder aus einer benannten Referenz (K.soll mit quelleFeld oder refQuelle) und trägt
// `unklar`; was die Welt nicht trägt (10¹…10⁷ Arten, Lachszug, Pilze, C/N/O, Seuche, Riff …), urteilt „Umfang nicht erzeugbar“.
L.perspektive("oeko", (() => {
    const NE = "leben.oeko.netz";
    const VI = "leben.oeko.vielfalt";
    const DY = "leben.oeko.dynamik";
    const ZE = "leben.oeko.zerfall";
    const SU = "leben.oeko.sukzession";
    const ST = "leben.oeko.stoffe";
    const PA = "leben.oeko.partner";
    const PFAD_TIER = ["stamm/kreatur-leben.js", "stamm/kreatur-verhalten.js", "stamm/kreatur-fauna.js", "stamm/kreatur-gehege.js", "tetrapoda-core.js", "stamm/feld-leben.js", "scripts/werkbank.cjs"];
    const PFAD_FELD = ["stamm/feld-leben.js", "stamm/feld-brand.js", "stamm/vegetation-wiese.js", "stamm/vegetation-baum.js", "stamm/vegetation-streu.js", "stamm/kreatur-leben.js", "tetrapoda-core.js", "phyto-core.js", "foundry-core.js", "scripts/werkbank.cjs"];
    const PFAD_PLANET = ["planet-core.js", "voxel-worker.js", "stamm/gelaende-chunks.js", "stamm/feld-leben.js", "stamm/vegetation-wiese.js", "gelaende-core.js", "scripts/werkbank.cjs"];
    // DAS SOLL EINES RICHTERS OHNE ZAHL geht den EINEN Weg des Kerns: K.soll mit quelleFeld + quelleWort (die Zahl steht in Tiefe oder
    // Umfang der Sprosse) oder mit refQuelle allein, wenn das Wort keine Zahl trägt — nie eine Schwelle ohne Namen
    // DER ZEUGE DER WELT: N Antworten der Welt (Saaten, Orte, Tode, Zellen) mit Streuung, und wo verlangt die Änderung vor → nach
    const zeugeWelt = (min, mitAenderung) => (roh) => {
        const z = roh.zeuge || {};
        if (!(z.antworten >= min)) return "nur " + (z.antworten || 0) + " Antworten der Welt (Soll ≥ " + min + ")";
        if (!(z.streuung > 0)) return "die Antworten tragen keine Streuung (eine Konstante, nicht die Welt)";
        if (mitAenderung && !(z.vor !== undefined && z.nach !== undefined && z.vor !== z.nach)) return "die Welt änderte sich nicht (vor " + z.vor + " = nach " + z.nach + ")";
        return null;
    };
    const gut = (werte, n) => ({ werte, zeuge: { antworten: n, streuung: 1.3, vor: 1, nach: 0.7 } });
    const flach = (werte) => ({ werte, zeuge: { antworten: 0, streuung: 0 } });
    const starr = (werte, n) => ({ werte, zeuge: { antworten: n, streuung: 0, vor: 1, nach: 1 } });
    const still = (werte, n) => ({ werte, zeuge: { antworten: n, streuung: 1.3, vor: 1, nach: 1 } });
    const AUGE = { ort: "wiese" };
    return {
        leitern: {
            // ═══ DAS NETZ: Arten aus Saaten, Fraß-Paare, Ebenen, Massenverhältnis, Trennbarkeit, Kopplung Meer–Land ═══
            [NE]: {
                sek: 35,
                mutiert: true,
                pfad: PFAD_TIER.concat(["stamm/wasser-hydro.js", "stamm/vegetation-wiese.js"]),
                ungefahren: "das Bild der Fremdwelt-Probe (S7) — swiftshader schießt nicht",
                mess: async function (H, U, M) {
                    const seite = (fn, a) => H.seite("return await (" + fn.toString() + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    // DER RAFFER: je Saat das Tal der Wildnis (ganze Regionen westlich der Ankunft, keine Zelle auf dem Genesis-Ort), der
                    // Bestand frisch aus den Strömen der Saat, Takt um Takt `_bestandSchritt` — im Sandkasten (Bestand, Leben, Gefühl, Uhr
                    // getauscht); je Tod die Ursache und das Fraß-Paar (`_bestandStirbt`), je Takt die äsenden Gattungen (`_kreaturFrass`)
                    const raffer = async (r, T, a) => {
                        const s = r.state;
                        const A = r.constructor;
                        const B = A._bestandGesetz().B;
                        const S = r._bestandSeite();
                        const pm = s.playerMesh.position;
                        let ix = Math.floor(pm.x / S);
                        const iz = Math.floor(pm.z / S);
                        const park = (k) => r._bestandFeld(k).zellen.filter((c) => r._genesisFlaeche(c.x, c.z)).length;
                        let k0 = ix + "," + iz;
                        for (let n = 0; park(k0) && n < 20; n++) k0 = --ix + "," + iz;
                        for (let i = 0; i < 100 && !r._bestandBereit(k0); i++) await new Promise((f) => setTimeout(f, 50));
                        if (!r._bestandBereit(k0)) throw new Error("das Tal " + k0 + " steht nicht bereit");
                        const jahrT = Math.round(r._kalender().jahrK / B.taktS);
                        const G = Object.keys(A._lebensraumGesetz().L.gattung);
                        const diet = r._bestandDiet();
                        const kg = {};
                        for (const g of G) kg[g] = Math.round(r._gattungLeib(g).v * r._leibRho(false) * 10) / 10;
                        const leihe = (m, f) => {
                            const e = Object.prototype.hasOwnProperty.call(r, m);
                            const alt = r[m];
                            r[m] = f(alt);
                            return () => {
                                if (e) r[m] = alt;
                                else delete r[m];
                            };
                        };
                        const alt = { fb: s.faunaBestand, lf: s.lifeField, af: s.aasFeld, aq: r._aasFrist, ef: s.emotionField, fs: r._faunaStroeme, sz: s.spielZeit, gen: r._lebenGen, seq: s._creatureNetSeq };
                        const paare = {};
                        const ursache = {};
                        const frass = {};
                        const zurueck = [];
                        const laeufe = [];
                        const t0 = performance.now();
                        try {
                            zurueck.push(leihe("_bestandStirbt", (f) => function (R, t, u, tode, jaeger) {
                                ursache[u] = (ursache[u] || 0) + 1;
                                if (u === "jagd" && jaeger) for (const h of jaeger) paare[h.g + ">" + t.g] = (paare[h.g + ">" + t.g] || 0) + 1;
                                return f.call(this, R, t, u, tode, jaeger);
                            }));
                            zurueck.push(leihe("_kreaturFrass", (f) => function (bestand, zellen) {
                                for (const g in bestand) if (bestand[g].n * bestand[g].frass > 0) frass[g] = (frass[g] || 0) + 1;
                                return f.call(this, bestand, zellen);
                            }));
                            for (const saat of a.saaten) {
                                if (performance.now() - t0 > a.budgetMs || (laeufe.length && window.__rafferRest() < 1.2 * laeufe[laeufe.length - 1].ms)) break;
                                r._faunaStroeme = { seed: s.worldMeta.seed, rng: new Proxy(Object.create(null), { get: (o, k) => o[k] || (String(k).includes("@") ? r._streamRng(a.praefix + saat + "-" + String(k)) : (o[k] = r._streamRng(a.praefix + saat + "-" + String(k)))) }) };
                                s.faunaBestand = undefined;
                                s.lifeField = undefined;
                                [s.aasFeld, r._aasFrist] = [new Map(), null]; // die Leichname der Probe (`_aasTat`) bleiben in ihr
                                s.emotionField = new Map();
                                s.spielZeit = 0;
                                const R = r._bestandRegion(k0, false);
                                const reihe = {};
                                for (const g of G) reihe[g] = [];
                                const t1 = performance.now();
                                const tode = [];
                                let K0 = 0;
                                window.__raffer(a.jahre * jahrT, (k) => {
                                    r._bestandSchritt(k0, R, true, tode);
                                    if (a.ohne) for (let i = R.tiere.length - 1; i >= 0; i--) if (R.tiere[i].g === a.ohne) R.tiere.splice(i, 1);
                                    if (k === jahrT) K0 = Object.values(r._kreaturBestand(null, k0)).reduce((q, b) => q + b.K, 0);
                                    if (k % a.probeT === a.probeT - 1) {
                                        const je = {};
                                        for (const t of R.tiere) je[t.g] = (je[t.g] || 0) + 1;
                                        for (const g of G) reihe[g].push(je[g] || 0);
                                    }
                                }, "netz saat " + saat);
                                laeufe.push({ saat, reihe, K0: Math.round(K0 * 100) / 100, ms: Math.round(performance.now() - t1) });
                            }
                        } finally {
                            for (const f of zurueck.reverse()) f();
                            s.faunaBestand = alt.fb;
                            s.lifeField = alt.lf;
                            [s.aasFeld, r._aasFrist] = [alt.af, alt.aq];
                            s.emotionField = alt.ef;
                            r._faunaStroeme = alt.fs;
                            s.spielZeit = alt.sz;
                            r._lebenGen = alt.gen;
                            s._creatureNetSeq = alt.seq;
                        }
                        return { k0, jahrT, G, diet, kg, laeufe, paare, ursache, frass, wieder: Object.prototype.hasOwnProperty.call(r, "_bestandStirbt") || Object.prototype.hasOwnProperty.call(r, "_kreaturFrass") };
                    };
                    // DER ZUFALLSORT (S4): eine bereite Region im Ring der Ankunft, ihr Bestand als Kopie ohne Leib nachgeholt, dann 10
                    // Spielminuten Takt — gezählt jede Gattung, die frisst (äst oder reißt) oder gefressen wird
                    const zufall = async (r, T, a) => {
                        const s = r.state;
                        const A = r.constructor;
                        const B = A._bestandGesetz().B;
                        const S = r._bestandSeite();
                        const pm = s.playerMesh.position;
                        const ix = Math.floor(pm.x / S);
                        const iz = Math.floor(pm.z / S);
                        const kand = [];
                        for (let dx = -5; dx <= 5; dx++) for (let dz = -5; dz <= 5; dz++) if (Math.abs(dx) + Math.abs(dz) >= 2 && r._bestandBereit(ix + dx + "," + (iz + dz))) kand.push(ix + dx + "," + (iz + dz));
                        if (!kand.length) throw new Error("keine bereite Region im Ring");
                        const key = kand[Math.floor(a.wurf * kand.length) % kand.length];
                        const leihe = (m, f) => {
                            const e = Object.prototype.hasOwnProperty.call(r, m);
                            const alt = r[m];
                            r[m] = f(alt);
                            return () => {
                                if (e) r[m] = alt;
                                else delete r[m];
                            };
                        };
                        const F = s.faunaBestand;
                        const alt = { fb: F, lf: s.lifeField, af: s.aasFeld, aq: r._aasFrist, ef: s.emotionField, sz: s.spielZeit, gen: r._lebenGen, seq: s._creatureNetSeq };
                        const aktiv = new Set();
                        const zurueck = [];
                        let tiere = 0;
                        let tiere0 = 0;
                        try {
                            s.faunaBestand = F && F.regionen ? { seed: F.seed, regionen: Object.fromEntries(Object.entries(F.regionen).map(([k, R]) => [k, Object.assign({}, R, { tiere: R.tiere.map((t) => Object.assign({}, t, { leib: null })) })])) } : undefined;
                            s.lifeField = s.lifeField instanceof Map ? new Map([...s.lifeField].map(([k, v]) => [k, v && typeof v === "object" ? Object.assign({}, v) : v])) : undefined;
                            [s.aasFeld, r._aasFrist] = [new Map([...(alt.af || [])].map(([k, L]) => [k, L.slice()])), null]; // die Leichname als Kopie
                            s.emotionField = new Map();
                            const R = r._bestandRegion(key, true, 0, Infinity, []);
                            zurueck.push(leihe("_bestandStirbt", (f) => function (R2, t, u, tode, jaeger) {
                                if (u === "jagd" && jaeger) {
                                    aktiv.add(t.g);
                                    for (const h of jaeger) aktiv.add(h.g);
                                }
                                return f.call(this, R2, t, u, tode, jaeger);
                            }));
                            zurueck.push(leihe("_kreaturFrass", (f) => function (bestand, zellen) {
                                for (const g in bestand) if (bestand[g].n * bestand[g].frass > 0) aktiv.add(g);
                                return f.call(this, bestand, zellen);
                            }));
                            const takte = Math.round((a.minuten * 60) / B.taktS);
                            tiere0 = R.tiere.map((t) => t.id).join(",");
                            window.__raffer(takte, () => r._bestandSchritt(key, R, true, []), "minuten");
                            tiere = R.tiere.length;
                            tiere0 = tiere0 === R.tiere.map((t) => t.id).join(",") ? 0 : 1;
                        } finally {
                            for (const f of zurueck.reverse()) f();
                            s.faunaBestand = alt.fb;
                            s.lifeField = alt.lf;
                            [s.aasFeld, r._aasFrist] = [alt.af, alt.aq];
                            s.emotionField = alt.ef;
                            s.spielZeit = alt.sz;
                            r._lebenGen = alt.gen;
                            s._creatureNetSeq = alt.seq;
                        }
                        return { key, kandidaten: kand.length, arten: [...aktiv], tiere, anders: tiere0, gattungen: Object.keys(A._lebensraumGesetz().L.gattung).length };
                    };
                    // DER LACHS-GEGENLAUF (S5): Ufer-Punkte an den Flüssen der Hydrosphäre nahe der Ankunft, der Wuchs (`_wuchsAt`) mit dem
                    // Fisch-Gesetz und ohne (der Fisch gekappt: `_fischZelle` ohne Stand, keine Fisch-Karte) — die Folge am Ufer
                    const ufer = async (r, T, a) => {
                        const s = r.state;
                        const pm = s.playerMesh.position;
                        const pkt = [];
                        const regionen = [s.hydrosphere].concat(s.hydroTiles ? [...s.hydroTiles.values()] : []).filter((h) => h && h.ready);
                        for (const h of regionen)
                            for (const rv of h.rivers || [])
                                for (let k = 0; k + 1 < (rv.points || []).length; k += 7) {
                                    const p = rv.points[k];
                                    const q = rv.points[k + 1];
                                    if (p.inLake || Math.hypot(p.x - pm.x, p.z - pm.z) > a.radiusM) continue;
                                    const dx = q.x - p.x;
                                    const dz = q.z - p.z;
                                    const l = Math.hypot(dx, dz) || 1;
                                    const w = (p.width || 1) / 2 + a.uferM;
                                    const x = p.x - (dz / l) * w;
                                    const z = p.z + (dx / l) * w;
                                    if (!r._nassAt(x, z)) pkt.push([x, z]);
                                }
                        const wahl = [];
                        for (let i = 0; i < a.n && pkt.length; i++) wahl.push(pkt[Math.floor((i * pkt.length) / a.n)]);
                        const mit = wahl.map(([x, z]) => r._wuchsAt(x, z));
                        const e = Object.prototype.hasOwnProperty.call(r, "_fischZelle");
                        const fz = r._fischZelle;
                        const fk = r._fischKarte;
                        let ohne;
                        try {
                            r._fischZelle = () => ({ stand: null });
                            r._fischKarte = null;
                            ohne = wahl.map(([x, z]) => r._wuchsAt(x, z));
                        } finally {
                            if (e) r._fischZelle = fz;
                            else delete r._fischZelle;
                            r._fischKarte = fk;
                        }
                        return { punkte: pkt.length, mit, ohne };
                    };
                    const R = await seite(raffer, { saaten: Array.from({ length: 32 }, (_, i) => i + 1), jahre: 100, probeT: 24, budgetMs: 26000, praefix: "netz-", ohne: null });
                    const Z = await seite(zufall, { minuten: 10, wurf: Math.random() });
                    const UF = await seite(ufer, { radiusM: 900, uferM: 4, n: 12 });
                    const G = R.G;
                    const n = R.laeufe.length;
                    const jahrS = 10;
                    // je Gattung: in wie vielen Saaten am Ende (letztes Spieljahr) wieder angetroffen
                    const wieder = {};
                    for (const g of G) wieder[g] = n ? Math.round((100 * R.laeufe.filter((l) => l.reihe[g].slice(-jahrS).some((x) => x > 0)).length) / n) : 0;
                    const wiederMin = Math.min(...G.map((g) => wieder[g]));
                    // die Fraß-Paare: beobachtete Risse (Jäger > Beute) und die Äsung (Jungwuchs > Gattung) — die Arten sind die Gattungen + der Jungwuchs
                    const links = Object.keys(R.paare).filter((p) => R.paare[p] > 0);
                    for (const g of G) if (R.frass[g] > 0) links.push(g + ">jungwuchs");
                    const arten = G.concat(["jungwuchs"]);
                    const paareJeArt = Math.round((100 * links.length) / arten.length) / 100;
                    // die Ebenen (kürzester Weg vom Jungwuchs) und die Omnivorie (Kost aus ≥ 2 Ebenen); jedes Paar heißt Fresser > Futter
                    const beute = {};
                    for (const a of arten) beute[a] = new Set();
                    for (const p of links) {
                        const [j, b] = p.split(">");
                        if (j !== b && beute[j]) beute[j].add(b);
                    }
                    const ebene = { jungwuchs: 1 };
                    for (let it = 0; it < arten.length; it++)
                        for (const g of G) {
                            const e = [...beute[g]].map((b) => ebene[b]).filter((x) => x !== undefined);
                            if (e.length) ebene[g] = 1 + Math.min(...e);
                        }
                    const ebenen = Math.max(...Object.values(ebene));
                    const omni = G.filter((g) => new Set([...beute[g]].map((b) => ebene[b]).filter((x) => x !== undefined)).size >= 2).length;
                    const omnivorie = Math.round((100 * omni) / G.length) / 100;
                    // das Räuber-Beute-Massenverhältnis: Median über die Risse (Masse Jäger ÷ Masse Beute)
                    const verh = [];
                    for (const p of Object.keys(R.paare)) {
                        const [j, b] = p.split(">");
                        if (j !== b) for (let i = 0; i < R.paare[p]; i++) verh.push(R.kg[j] / R.kg[b]);
                    }
                    verh.sort((x, y) => x - y);
                    const massen = verh.length ? Math.round(verh[Math.floor(verh.length / 2)] * 1000) / 1000 : null;
                    // die Paarprobe: je Paar der Gattungen Gestalt (Masse um ≥ 25 % verschieden) UND Rolle (Kost oder Beute verschieden)
                    const rolle = (g) => [...beute[g]].sort().join(",") + "|" + R.diet[g];
                    const paarL = [];
                    for (let i = 0; i < G.length; i++)
                        for (let j = i + 1; j < G.length; j++) {
                            const q = R.kg[G[i]] / R.kg[G[j]];
                            paarL.push((q >= 1.25 || q <= 0.8) && rolle(G[i]) !== rolle(G[j]));
                        }
                    let rng = 7;
                    const zufallsPaare = Array.from({ length: 50 }, () => ((rng = (rng * 16807) % 2147483647), paarL[rng % paarL.length]));
                    const trenn = Math.round((100 * zufallsPaare.filter(Boolean).length) / 50);
                    // der Kollaps: eine Gattung fehlt im ganzen letzten Spieljahr
                    const kollaps = n ? Math.round((100 * R.laeufe.filter((l) => G.some((g) => !l.reihe[g].slice(-jahrS).some((x) => x > 0))).length) / n) : 100;
                    const alle = R.laeufe.flatMap((l) => G.map((g) => l.reihe[g].reduce((q, x) => q + x, 0)));
                    const mittel = alle.reduce((q, x) => q + x, 0) / Math.max(1, alle.length);
                    const sd = Math.sqrt(alle.reduce((q, x) => q + (x - mittel) * (x - mittel), 0) / Math.max(1, alle.length));
                    const zeuge = { antworten: n, streuung: Math.round(sd * 100) / 100, vor: Object.values(R.ursache).reduce((q, x) => q + x, 0), nach: 0, tal: R.k0, saaten: n, jahre: 100, ms: R.laeufe.map((l) => l.ms), risse: R.paare, ursache: R.ursache, aesung: R.frass, kg: R.kg, wieder: R.wieder };
                    const nArten = G.length;
                    const aus = M.teil || {};
                    aus[2] = { werte: { saaten: n, jahre: 100, wiederProzent: wiederMin, paareJeArt }, zeuge: Object.assign({ jeArt: wieder, links }, zeuge) };
                    if (nArten < 10 || ebenen < 4) aus[2].nicht = "10¹ Arten in 4 Ebenen — der Bestand trägt " + nArten + " Gattungen (" + G.join(", ") + ") in " + ebenen + " Ebenen; im Deckel " + n + " von 32 Saaten × 100 Spieljahre";
                    aus[3] = { werte: { ebenen, omnivorie, massenVerhaeltnis: massen, paarTrennProzent: trenn }, zeuge: Object.assign({ ebene, paare: paarL.length }, zeuge) };
                    if (nArten < 100) aus[3].nicht = "10² Arten je Biom — der Bestand trägt " + nArten + " Gattungen; ein Netz realer Breite fehlt (LEBENSRAUM_GESETZ.gattung, tetrapoda-core.js:2072)";
                    aus[4] = { werte: { artenFressen: Z.arten.length }, zeuge: { antworten: Z.kandidaten, streuung: Z.tiere, vor: 0, nach: Z.anders, tiere: Z.tiere, ort: Z.key, arten: Z.arten } };
                    if (Z.gattungen < 30) aus[4].nicht = "10³ Arten — am Zufallsort " + Z.key + " fressen oder werden gefressen " + Z.arten.length + " Gattungen; der Bestand kennt " + Z.gattungen;
                    const d = UF.mit.map((w, i) => UF.ohne[i] - w);
                    const mw = UF.mit.reduce((q, x) => q + x, 0) / Math.max(1, UF.mit.length);
                    const sdw = Math.sqrt(UF.mit.reduce((q, x) => q + (x - mw) * (x - mw), 0) / Math.max(1, UF.mit.length));
                    aus[5] = { werte: d.length ? { kiOben: Math.round((1e4 * Math.max(...d)) / Math.max(1e-9, mw)) / 1e4, effekt: Math.round((1e4 * d.reduce((q, x) => q + x, 0)) / d.length / Math.max(1e-9, mw)) / 1e4 } : {}, zeuge: { antworten: d.length, streuung: Math.round(sdw * 1e4) / 1e4, vor: Math.round(mw * 1e4) / 1e4, nach: Math.round((1e4 * UF.ohne.reduce((q, x) => q + x, 0)) / Math.max(1, UF.ohne.length)) / 1e4, uferPunkte: UF.punkte } };
                    if (!d.length || d.every((x) => x === 0)) aus[5].nicht = "kein Lachszug: ohne das Fisch-Gesetz bleibt der Wuchs an " + d.length + " Ufer-Punkten gleich — das Fisch-Gesetz trägt Stände ohne Wanderung, der Nährstoff am Ufer liest nur Taten (vegetation-wiese.js:2097)";
                    aus[6] = { werte: { kollapsProzent: kollaps, paarProzent: trenn, saaten: n, jahre: 100 }, zeuge: Object.assign({}, zeuge) };
                    aus[6].nicht = "10⁶ Arten über 1 000 Spieljahre an 64 Saaten — der Bestand trägt " + nArten + " Gattungen, der Deckel trägt " + n + " Saaten × 100 Spieljahre";
                    aus[7] = { werte: { saaten: 0, planetentypen: 1 }, zeuge: { antworten: 1, streuung: 0 }, auge: await M.auge("oeko-netz-s7", { ort: "wiese" }), nicht: "fremde Biosphären auf 3 Planetentypen — der Bestand liest EINE Tafel der Gattungen für jeden Samen (LEBENSRAUM_GESETZ, tetrapoda-core.js:2072)" };
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: { saaten: 32, jahre: 100 },
                        soll: [
                            K.soll(NE, 2, "32 Saaten × 100 Spieljahre", { key: "saaten", rel: "≥", zahl: 32 }),
                            K.soll(NE, 2, "32 Saaten × 100 Spieljahre", { key: "jahre", rel: "≥", zahl: 100, einheit: "Spieljahre" }),
                            K.soll(NE, 2, "in ≥ 80 % der Saaten", { key: "wiederProzent", einheit: "%" }),
                            K.soll(NE, 2, "beobachtete Fraß-Paare je Art im Band realer Wald-Netze", { key: "paareJeArt", rel: "band", zahl: 2, bis: 10, refQuelle: "Dunne, Williams & Martinez 2002 (PNAS 99): Fraß-Paare je Art L/S realer Netze ≈ 2–10" }),
                        ],
                        zeuge: zeugeWelt(32, true),
                        taeter: "tetrapoda-core.js LEBENSRAUM_GESETZ.gattung (4 Gattungen) · stamm/kreatur-leben.js _bestandSchritt",
                        nicht: "10¹ Arten in 4 Ebenen (der Bestand trägt 4 Gattungen)",
                        leser: "tetrapoda-core.js:2072 LEBENSRAUM_GESETZ — die Gattungen deer, fox, wolf, bear; kein Vogel, Insekt, Fisch im Netz des Bestands",
                        unklar: "„im Band realer Wald-Netze“ ohne Zahl — gesetzt L/S 2–10 (Dunne 2002); Vorschlag: das Band als Zahl in die Karte",
                        gruen: gut({ saaten: 32, jahre: 100, wiederProzent: 91, paareJeArt: 3.4 }, 32),
                        attrappen: [
                            { name: "91 % aus einer Tafel ohne Lauf", roh: flach({ saaten: 32, jahre: 100, wiederProzent: 91, paareJeArt: 3.4 }) },
                            { name: "32 Saaten behauptet, 8 gelaufen", roh: gut({ saaten: 32, jahre: 100, wiederProzent: 91, paareJeArt: 3.4 }, 8) },
                            { name: "kein Tod im Raffer (der Takt lief nicht)", roh: still({ saaten: 32, jahre: 100, wiederProzent: 91, paareJeArt: 3.4 }, 32) },
                        ],
                    },
                    3: {
                        u: { paare: 50 },
                        soll: [
                            K.soll(NE, 3, "Kennzahlen des Netzes (Ebenen, Omnivorie, Massenverhältnis)", { key: "ebenen", rel: "band", zahl: 3, bis: 5, refQuelle: "Pimm 1982 / Post 2002 (TREE 17): Ketten realer Netze 3–5 Ebenen" }),
                            K.soll(NE, 3, "Kennzahlen des Netzes (Ebenen, Omnivorie, Massenverhältnis)", { key: "omnivorie", rel: "band", zahl: 0.2, bis: 0.6, refQuelle: "Thompson et al. 2007 (TREE 22): Anteil der Omnivoren realer Netze ≈ 0,2–0,6" }),
                            K.soll(NE, 3, "Kennzahlen des Netzes (Ebenen, Omnivorie, Massenverhältnis)", { key: "massenVerhaeltnis", rel: "band", zahl: 0.1, bis: 1000, refQuelle: "Brose et al. 2006 (Ecology 87): Masse Räuber ÷ Beute realer Netze ≈ 10⁻¹…10³" }),
                            K.soll(NE, 3, "trennbar ≥ 90 %", { key: "paarTrennProzent", einheit: "%" }),
                        ],
                        zeuge: zeugeWelt(32, true),
                        taeter: "tetrapoda-core.js LEBENSRAUM_GESETZ.gattung (4 Gattungen, keine 10² je Biom)",
                        nicht: "10² Arten je Biom",
                        leser: "tetrapoda-core.js:2072 LEBENSRAUM_GESETZ — ein Netz aus 4 Gattungen, keine Arten aus der Saat",
                        unklar: "das 90-%-Band der ≥ 20 realen Netze trägt keine Zahl — gesetzt Ebenen 3–5, Omnivorie 0,2–0,6, Masse 10⁻¹…10³; Vorschlag: die Bänder aus dem Korpus in die Karte",
                        gruen: gut({ ebenen: 4, omnivorie: 0.35, massenVerhaeltnis: 2.4, paarTrennProzent: 94 }, 32),
                        attrappen: [
                            { name: "Kennzahlen einer Literatur-Tafel", roh: flach({ ebenen: 4, omnivorie: 0.35, massenVerhaeltnis: 2.4, paarTrennProzent: 94 }) },
                            { name: "Netz ohne einen Tod (kein Fraß beobachtet)", roh: still({ ebenen: 4, omnivorie: 0.35, massenVerhaeltnis: 2.4, paarTrennProzent: 94 }, 32) },
                        ],
                    },
                    4: {
                        u: { minuten: 10 },
                        soll: [K.soll(NE, 4, "≥ 30 sichtbar verschiedene Arten", { key: "artenFressen" })],
                        zeuge: zeugeWelt(1, true),
                        taeter: "tetrapoda-core.js LEBENSRAUM_GESETZ.gattung (4 Gattungen)",
                        nicht: "10³ Arten (der Bestand trägt 4 Gattungen)",
                        leser: "tetrapoda-core.js:2072 LEBENSRAUM_GESETZ — 4 Gattungen; Vögel, Fische und Bestäuber fressen und werden nicht gefressen (kein Netz)",
                        gruen: gut({ artenFressen: 34 }, 40),
                        attrappen: [
                            { name: "34 Arten aus einem Katalog ohne Ort", roh: flach({ artenFressen: 34 }) },
                            { name: "der Ort ohne Tier (nichts frisst)", roh: starr({ artenFressen: 34 }, 40) },
                        ],
                    },
                    5: {
                        u: { uferPunkte: 12 },
                        soll: [K.soll(NE, 5, "Intervall ohne 0", { key: "kiOben", rel: "<", zahl: 0 })],
                        zeuge: zeugeWelt(8, true),
                        taeter: "tetrapoda-core.js FISCH_GESETZ (keine Wanderung) · stamm/vegetation-wiese.js _naehrstoffAt (liest nur Taten)",
                        nicht: "kein Lachszug",
                        leser: "stamm/vegetation-wiese.js:2097 _naehrstoffAt — liest nur die Taten, kein Stoff aus dem Meer; tetrapoda-core.js:2818 FISCH_GESETZ — Stände ohne Zug",
                        gruen: gut({ kiOben: -0.04, effekt: -0.11 }, 12),
                        attrappen: [
                            { name: "das Intervall einer Studie ohne Gegenlauf", roh: flach({ kiOben: -0.04, effekt: -0.11 }) },
                            { name: "Gegenlauf ohne Wirkung am Ufer (vor = nach)", roh: still({ kiOben: -0.04, effekt: -0.11 }, 12) },
                        ],
                    },
                    6: {
                        u: { saaten: 64, jahre: 1000 },
                        soll: [
                            K.soll(NE, 6, "64 Saaten", { key: "saaten", rel: "≥", zahl: 64 }),
                            K.soll(NE, 6, "kein Kollaps", { key: "kollapsProzent", rel: "=", zahl: 0, refQuelle: "der Richter: kein Kollaps — in keiner Saat fehlt am Ende eine Art (0 %)" }),
                            K.soll(NE, 6, "Paarprobe ≥ 95 %", { key: "paarProzent", einheit: "%" }),
                            K.soll(NE, 6, "64 Saaten: kein Kollaps", { key: "jahre", rel: "≥", zahl: 1000, quelleFeld: "tiefe", quelleWort: "1 000 Spieljahre" }),
                        ],
                        zeuge: zeugeWelt(64, true),
                        taeter: "tetrapoda-core.js LEBENSRAUM_GESETZ.gattung (4 Gattungen eines Tals, kein Planet)",
                        nicht: "10⁶ Arten über 1 000 Spieljahre",
                        leser: "tetrapoda-core.js:2072 LEBENSRAUM_GESETZ — 4 Gattungen, kein Netz vom Tiefseegraben bis zur Wüste",
                        gruen: gut({ kollapsProzent: 0, paarProzent: 97, saaten: 64, jahre: 1000 }, 64),
                        attrappen: [
                            { name: "kein Kollaps, behauptet ohne Lauf", roh: flach({ kollapsProzent: 0, paarProzent: 97, saaten: 64, jahre: 1000 }) },
                            { name: "16 Saaten", roh: gut({ kollapsProzent: 0, paarProzent: 97, saaten: 64, jahre: 1000 }, 16) },
                        ],
                    },
                    7: {
                        u: { saaten: 64, planetentypen: 3, auge: { ort: "wiese" } },
                        soll: [K.soll(NE, 7, "64 Saaten × 3 Planetentypen", { key: "saaten", rel: "≥", zahl: 64 }), K.soll(NE, 7, "64 Saaten × 3 Planetentypen", { key: "planetentypen", rel: "≥", zahl: 3 })],
                        auge: { pose: "Ego an der Wiese (die Ankunft eines fremden Planeten ist nicht erzeugbar)", vorbild: "Fremdwelt-Probe R10 am beobachteten Netz: Ursachen-Probe ≥ 0,7, Gegenlauf ≥ 80 %, Neuheit ≥ 30 %; Kennzahl-Tafeln gegen reale (Fachleute-2AFC)" },
                        taeter: "tetrapoda-core.js LEBENSRAUM_GESETZ (eine Tafel für jeden Samen)",
                        nicht: "keine fremde Biosphäre",
                        leser: "tetrapoda-core.js:2072 LEBENSRAUM_GESETZ — liest keinen Planetentyp und keine fremde Biochemie",
                        gruen: gut({ saaten: 64, planetentypen: 3 }, 192),
                        attrappen: [{ name: "Tafeln ohne Netz", roh: flach({ saaten: 64, planetentypen: 3 }) }],
                    },
                },
            },
            // ═══ DIE VIELFALT: Arten je Hektar, Tag/Nacht und Sommer/Winter, Arten-Areal, Breite, Beta, Rückkehr nach einem Spieljahr ═══
            [VI]: {
                sek: 30,
                mutiert: true,
                pfad: PFAD_TIER.concat(["stamm/vegetation-wiese.js", "stamm/vegetation-streu.js", "stamm/bild-himmel.js", "planet-core.js", "voxel-worker.js", "stamm/gelaende-chunks.js"]),
                ungefahren: "Ego und Third im Bild (Preis) — die Zählung liest die Gesetze am Ort",
                mess: async function (H, U, M) {
                    const seite = (fn, a) => H.seite("return await (" + fn.toString() + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    // DAS INVENTAR AM ORT: der Hektar um die Ankunft (Nah-Streu je 4-m-Kachel, Wald je Zelle, der Bestand der Regionen
                    // im 500-m-Ring als Kopie ohne Leib nachgeholt, Vögel, Bestäuber, Fische), dazu Tag/Nacht und Sommer/Winter (die Uhr
                    // und die Saison nur für die Lesung gesetzt), die verschachtelten Flächen 1/4/9 ha über Saaten des Walds, die
                    // Beta-Vielfalt der Regionen und die Rückkehr nach einem Spieljahr an 100 Regionen
                    const inventar = async (r, T, a) => {
                        const s = r.state;
                        const A = r.constructor;
                        const B = A._bestandGesetz().B;
                        const S = r._bestandSeite();
                        const pm = s.playerMesh.position;
                        const X = pm.x;
                        const Z = pm.z;
                        const KA = A.NAH_STREU.kachel;
                        const C = A.FOREST ? A.FOREST.cell : 12;
                        // die Nah-Streu antwortet null, solange der Boden ihrer Chunks nicht steht (vegetation-wiese.js:1312): warten,
                        // VOR jedem Tausch der Welt, bis die Mitte und die vier Ecken des Hektars stehen (≤ 5 s)
                        let warte = 0;
                        for (; warte < 100; warte++) {
                            const ar = r._nahStreuArten();
                            if (ar && [[0, 0], [-1, -1], [1, 1], [-1, 1], [1, -1]].every(([u, v]) => r._nahStreuKachel(Math.floor((X + u * 46) / KA), Math.floor((Z + v * 46) / KA), ar))) break;
                            await new Promise((f) => setTimeout(f, 50));
                        }
                        const arten = r._nahStreuArten();
                        const pflanze = new Set(arten.filter((x) => ["flower", "fern", "brush", "reed"].includes(x.kind)).map((x) => x.id));
                        const totholz = new Set(arten.filter((x) => x.kind === "deadwood").map((x) => x.id));
                        const streuIn = (halb) => {
                            const je = {};
                            let leer = 0;
                            for (let x = X - halb; x < X + halb; x += KA)
                                for (let z = Z - halb; z < Z + halb; z += KA) {
                                    const k = r._nahStreuKachel(Math.floor(x / KA), Math.floor(z / KA), arten);
                                    if (!k) {
                                        leer++;
                                        continue;
                                    }
                                    for (const it of k.items) {
                                        const id = arten[it.art] ? arten[it.art].id : "?";
                                        je[id] = (je[id] || 0) + 1;
                                    }
                                }
                            return { je, leer };
                        };
                        const waldIn = (halb, seed) => {
                            const je = {};
                            for (let cx = Math.floor((X - halb) / C); cx <= Math.floor((X + halb) / C); cx++)
                                for (let cz = Math.floor((Z - halb) / C); cz <= Math.floor((Z + halb) / C); cz++)
                                    for (const d of r._forestCellDarts(cx, cz, seed) || []) if (Math.abs(d.x - X) <= halb && Math.abs(d.z - Z) <= halb) je[d.sp] = (je[d.sp] || 0) + 1;
                            return je;
                        };
                        const seed0 = r._forestSeedInt();
                        const F = s.faunaBestand;
                        const alt = { fb: F, lf: s.lifeField, af: s.aasFeld, aq: r._aasFrist, ef: s.emotionField, sz: s.spielZeit, gen: r._lebenGen, seq: s._creatureNetSeq, season: s.season, tod: s.timeOfDay };
                        const kopie = () => (F && F.regionen ? { seed: F.seed, regionen: Object.fromEntries(Object.entries(F.regionen).map(([k, R]) => [k, Object.assign({}, R, { tiere: R.tiere.map((t) => Object.assign({}, t, { leib: null })) })])) } : undefined);
                        // das Feld des Lebens als Kopie — samt den Leichnamen (`_aasTat`), die der Takt der Probe legt
                        const lfKopie = () => {
                            [s.aasFeld, r._aasFrist] = [new Map([...(alt.af || [])].map(([k, L]) => [k, L.slice()])), null];
                            return alt.lf instanceof Map ? new Map([...alt.lf].map(([k, v]) => [k, v && typeof v === "object" ? Object.assign({}, v) : v])) : undefined;
                        };
                        const aus = { t0: performance.now() };
                        const ix = Math.floor(X / S);
                        const iz = Math.floor(Z / S);
                        let jagd = 0;
                        const eSt = Object.prototype.hasOwnProperty.call(r, "_bestandStirbt");
                        const fSt = r._bestandStirbt;
                        try {
                            r._bestandStirbt = function (R, t, u, tode, jaeger) {
                                if (u === "jagd") jagd++;
                                return fSt.call(this, R, t, u, tode, jaeger);
                            };
                            s.faunaBestand = kopie();
                            s.lifeField = lfKopie();
                            s.emotionField = new Map();
                            const ring = [];
                            const rr = Math.ceil(a.ringM / S) + 1;
                            for (let dx = -rr; dx <= rr; dx++) for (let dz = -rr; dz <= rr; dz++) ring.push(ix + dx + "," + (iz + dz));
                            let tiereRing = 0;
                            const haArten = new Set();
                            let kgRing = 0;
                            let flaecheHa = 0;
                            for (const k of ring) {
                                if (!r._bestandBereit(k)) continue;
                                const R = r._bestandRegion(k, true, 0, Infinity, []);
                                flaecheHa += (S * S) / 1e4;
                                for (const t of R.tiere) {
                                    kgRing += r._bestandKg(t);
                                    if (Math.hypot(t.x - X, t.z - Z) <= a.ringM) tiereRing++;
                                    if (Math.abs(t.x - X) <= 50 && Math.abs(t.z - Z) <= 50) haArten.add(t.g);
                                }
                            }
                            aus.tiereRing = tiereRing;
                            aus.tierKgJeHa = flaecheHa ? Math.round((kgRing / flaecheHa) * 100) / 100 : null;
                            aus.ringRegionen = ring.length;
                            const st = streuIn(50);
                            const wa = waldIn(50, seed0);
                            const sets = {};
                            const satz = () => {
                                const o = new Set();
                                for (const id of Object.keys(st.je)) if (pflanze.has(id)) o.add("streu:" + id);
                                for (const id of Object.keys(wa)) o.add("baum:" + id);
                                for (const g of haArten) o.add("tier:" + g);
                                if ((s.voegel || []).some((v) => Math.abs(v.x - X) <= 50 && Math.abs(v.z - Z) <= 50)) o.add("vogel");
                                const BG = A._bestaeuberGesetz();
                                const blueten = Object.keys(st.je).some((id) => arten.find((x) => x.id === id && x.kind === "flower"));
                                if (blueten && BG.aktiv(r._sonnenRichtung().y, r._weatherFieldFor(s.weather).rain, 0, BG.B) > 0) o.add("bestaeuber");
                                return o;
                            };
                            sets.jetzt = [...satz()];
                            s.timeOfDay = 0.5;
                            sets.tag = [...satz()];
                            s.timeOfDay = 0.0;
                            sets.nacht = [...satz()];
                            s.timeOfDay = alt.tod;
                            s.season = "summer";
                            sets.sommer = [...satz()];
                            s.season = "winter";
                            sets.winter = [...satz()];
                            s.season = alt.season;
                            aus.sets = sets;
                            aus.streu = st;
                            aus.wald = wa;
                            aus.totholz = Object.keys(st.je).filter((id) => totholz.has(id)).reduce((q, id) => q + st.je[id], 0);
                            aus.baeume = Object.values(wa).reduce((q, x) => q + x, 0);
                            const flaechen = [];
                            for (const halb of a.halbe) {
                                const je = [];
                                const stH = halb <= 50 ? st.je : streuIn(Math.min(halb, a.streuHalbMax)).je;
                                for (let sd = 0; sd < a.saaten; sd++) {
                                    const w = waldIn(halb, seed0 + sd * 7919);
                                    je.push(Object.keys(w).length + Object.keys(stH).filter((id) => pflanze.has(id)).length);
                                }
                                flaechen.push({ ha: Math.round((4 * halb * halb) / 1e4), arten: je });
                            }
                            aus.flaechen = flaechen;
                            const satzK = (k) => Object.entries(r._kreaturBestand(null, k)).filter(([, b]) => b.K > 0).map(([g]) => g);
                            const jac = (x, y) => {
                                const u = new Set(x.concat(y));
                                return u.size ? x.filter((q) => y.includes(q)).length / u.size : 1;
                            };
                            const verb = [];
                            const getr = [];
                            const vorkommen = {};
                            for (let i = 0; i < a.betaPaare; i++) {
                                const ax = ix + ((i * 5) % 11) - 5;
                                const az = iz + ((i * 3) % 11) - 5;
                                const p = satzK(ax + "," + az);
                                const q = satzK(ax + 1 + "," + az);
                                const w = satzK(ax + 9 + "," + (az + 9));
                                verb.push(1 - jac(p, q));
                                getr.push(1 - jac(p, w));
                                for (const g of p.concat(q, w)) vorkommen[g] = (vorkommen[g] || 0) + 1;
                            }
                            aus.beta = { verbunden: verb, getrennt: getr, vorkommen };
                            s.faunaBestand = kopie();
                            s.lifeField = lfKopie();
                            const orte = [];
                            for (let dx = -6; dx <= 6 && orte.length < a.orte; dx++) for (let dz = -6; dz <= 6 && orte.length < a.orte; dz++) if (r._bestandBereit(ix + dx + "," + (iz + dz))) orte.push(ix + dx + "," + (iz + dz));
                            const sig = (R) => R.tiere.map((t) => t.id + t.g).join(",");
                            const vor = orte.map((k) => {
                                const R = r._bestandRegion(k, true, 0, Infinity, []);
                                return { sig: sig(R), seq: R.seq, n: R.tiere.length };
                            });
                            const jagd0 = jagd;
                            s.spielZeit = alt.sz + ((K) => (K.jahrK * K.tagS) / K.normS)(r._kalender());
                            const nach = orte.map((k) => {
                                const R = r._bestandRegion(k, true, 0, Infinity, []);
                                return { sig: sig(R), seq: R.seq, n: R.tiere.length };
                            });
                            const jagdJahr = jagd - jagd0;
                            s.season = alt.season === "winter" ? "summer" : "winter";
                            s.spielZeit = alt.sz;
                            s.faunaBestand = kopie();
                            s.lifeField = lfKopie();
                            for (const k of orte.slice(0, a.saisonOrte)) r._bestandRegion(k, true, 0, Infinity, []);
                            s.spielZeit = alt.sz + ((K) => (K.jahrK * K.tagS) / K.normS)(r._kalender());
                            const saison = orte.slice(0, a.saisonOrte).map((k, i) => sig(r._bestandRegion(k, true, 0, Infinity, [])) !== nach[i].sig);
                            aus.rueckkehr = { orte: orte.length, veraendert: vor.filter((v, i) => v.sig !== nach[i].sig).length, zurueck: vor.filter((v, i) => nach[i].seq < v.seq).length, saisonAnders: saison.filter(Boolean).length, saisonOrte: saison.length, jagdJahr, n: vor.map((v) => v.n), nNach: nach.map((v) => v.n) };
                        } finally {
                            if (eSt) r._bestandStirbt = fSt;
                            else delete r._bestandStirbt;
                            s.faunaBestand = alt.fb;
                            s.lifeField = alt.lf;
                            [s.aasFeld, r._aasFrist] = [alt.af, alt.aq];
                            s.emotionField = alt.ef;
                            s.spielZeit = alt.sz;
                            r._lebenGen = alt.gen;
                            s._creatureNetSeq = alt.seq;
                            s.season = alt.season;
                            s.timeOfDay = alt.tod;
                        }
                        aus.ms = Math.round(performance.now() - aus.t0);
                        aus.streuBereit = warte < 100 ? 1 : 0;
                        aus.streuWarteMs = warte * 50;
                        aus.streuLeer = aus.streu.leer;
                        return aus;
                    };
                    const meridian = async (r, T, a) => {
                        await r._fadenQuelle();
                        const samen = r.state.worldMeta.seed;
                        const L = await Promise.all(a.breiten.map((b) => r._planetAuftrag({ type: "planet-ort", samen, breite: b, laenge: a.laenge, zeitMa: 0 })));
                        const schluessel = new Set();
                        const walk = (o, p) => {
                            if (o && typeof o === "object") for (const k of Object.keys(o)) (schluessel.add(p + k), walk(o[k], p + k + "."));
                        };
                        L.forEach((x) => walk(x, ""));
                        return { je: L.map((x, i) => ({ b: a.breiten[i], land: x.land, decke: x.delta && x.delta.wuchs ? x.delta.wuchs.decke : null, wald: x.delta && x.delta.wuchs ? x.delta.wuchs.wald : null })), arten: [...schluessel].filter((k) => /art|spezies|species|biomass|vielfalt/i.test(k)) };
                    };
                    const I = await seite(inventar, { ringM: 500, halbe: [50, 100, 150], streuHalbMax: 100, saaten: 4, betaPaare: 20, orte: 100, saisonOrte: 20 });
                    const ME = await seite(meridian, { breiten: [0, 10, 20, 30, 40, 50, 60, 70, 80], laenge: 10 });
                    const aus = M.teil || {};
                    const haArten = I.sets.jetzt.length;
                    const faktor = (w, ref) => (w > 0 ? Math.round(Math.max(w / ref, ref / w) * 100) / 100 : 1e6);
                    const pfl = Object.keys(I.streu.je).length + Object.keys(I.wald).length;
                    const zg = { antworten: pfl + I.ringRegionen, streuung: new Set([I.tiereRing, I.baeume, Object.values(I.streu.je).reduce((q, x) => q + x, 0)]).size - 1, ms: I.ms };
                    aus[2] = { werte: { faktor: faktor(haArten, U[2].refArten), artenHa: haArten, tiereRing: I.tiereRing }, zeuge: Object.assign({ arten: I.sets.jetzt }, zg) };
                    if (I.tiereRing < 150 || haArten < 10) aus[2].nicht = "10¹ Arten je ha mit Vögeln, Insekten, Pflanzen und 150 Tiere im 500-m-Ring — die Welt trägt " + haArten + " Arten im Hektar und " + I.tiereRing + " Tiere im Ring";
                    const jac = (x, y) => {
                        const u = new Set(x.concat(y));
                        return u.size ? Math.round((1000 * x.filter((q) => y.includes(q)).length) / u.size) / 1000 : 1;
                    };
                    const jTN = jac(I.sets.tag, I.sets.nacht);
                    const jSW = jac(I.sets.sommer, I.sets.winter);
                    aus[3] = { werte: { jaccardTagNacht: jTN, jaccardSommerWinter: jSW, artenHa: haArten }, zeuge: Object.assign({ tag: I.sets.tag, nacht: I.sets.nacht, sommer: I.sets.sommer, winter: I.sets.winter }, zg, { vor: jTN, nach: jSW }) };
                    if (haArten < 100) aus[3].nicht = "10² Arten je Hektar und ≥ 50 Pflanzenarten im Bild — die Welt trägt " + haArten + " Arten im Hektar (" + pfl + " Pflanzen-Arten); die Akkumulationskurve sättigt";
                    aus[4] = { werte: { faktor: faktor(haArten, U[4].refArten), artenHa: haArten }, zeuge: Object.assign({}, zg), nicht: "kein Regenwald-Hektar — die Welt trägt am Ort den Wald der Heimat (" + Object.keys(I.wald).join(", ") + "), keine Gliederfüßer, kein Kronendach als eigener Lebensraum" };
                    const lnA = I.flaechen.map((f) => Math.log(f.ha));
                    const zJe = [];
                    for (let sd = 0; sd < I.flaechen[0].arten.length; sd++) {
                        const lnS = I.flaechen.map((f) => Math.log(Math.max(1, f.arten[sd])));
                        const mx = lnA.reduce((q, x) => q + x, 0) / lnA.length;
                        const my = lnS.reduce((q, x) => q + x, 0) / lnS.length;
                        const b = lnA.reduce((q, x, i) => q + (x - mx) * (lnS[i] - my), 0) / Math.max(1e-9, lnA.reduce((q, x) => q + (x - mx) * (x - mx), 0));
                        zJe.push(Math.round(b * 1000) / 1000);
                    }
                    const zs = zJe.slice().sort((x, y) => x - y);
                    const zImBand = Math.round((100 * zJe.filter((z) => z >= 0.15 && z <= 0.35).length) / Math.max(1, zJe.length));
                    const artenFl = I.flaechen.flatMap((f) => f.arten);
                    aus[5] = { werte: { zImBandProzent: zImBand, zMedian: zs[Math.floor(zs.length / 2)] }, zeuge: { antworten: artenFl.length, streuung: Math.max(...artenFl) - Math.min(...artenFl), vor: artenFl[0], nach: artenFl[artenFl.length - 1], flaechen: I.flaechen, z: zJe }, nicht: "Flächen 1 ha … 10⁴ km² — die Zählung reicht bis " + I.flaechen[I.flaechen.length - 1].ha + " ha (die Nah-Streu nur im Ring der Ankunft), die Artenzahl sättigt bei " + Math.max(...artenFl) };
                    const tr = ME.je.find((x) => x.b === 0);
                    const tu = ME.je.find((x) => x.b === 70);
                    aus[6] = { werte: { deckeTropen: tr ? tr.decke : null, deckeTundra: tu ? tu.decke : null, tierKgJeHa: I.tierKgJeHa }, zeuge: { antworten: ME.je.length, streuung: new Set(ME.je.map((x) => x.decke)).size - 1, meridian: ME.je, artSchluessel: ME.arten }, nicht: "Arten und Biomasse über die Breite — der Planet-Faden antwortet je Breite mit Land, Höhe, Klima und Wuchs (" + (ME.arten.length ? ME.arten.join(", ") : "kein Schlüssel einer Art oder Biomasse") + "); keine Pflanzen-Biomasse im Spiel" };
                    const m = (v) => v.reduce((q, x) => q + x, 0) / Math.max(1, v.length);
                    const bG = Math.round(m(I.beta.getrennt) * 1000) / 1000;
                    const bV = Math.round(m(I.beta.verbunden) * 1000) / 1000;
                    const endem = Object.values(I.beta.vorkommen).filter((n) => n === 1).length;
                    aus[7] = { werte: { saaten: 1, betaDiff: Math.round((bG - bV) * 1000) / 1000, endemitenDiff: 0, endemiten: endem }, zeuge: { antworten: I.beta.getrennt.length * 3, streuung: new Set(I.beta.getrennt.concat(I.beta.verbunden)).size - 1, vor: bV, nach: bG, vorkommen: I.beta.vorkommen } };
                    aus[7].nicht = "Endemiten-Zentren an 200 Saaten — jede Gattung lebt, wo ihr Lebensraum ist (LEBENSRAUM_GESETZ), " + endem + " Endemiten; die Welt läuft an EINER Saat (kein Wechsel ohne Neustart)";
                    const rk = I.rueckkehr;
                    aus[8] = { werte: { orte: rk.orte, veraendertProzent: Math.round((100 * rk.veraendert) / Math.max(1, rk.orte)), zurueckProzent: Math.round((100 * rk.zurueck) / Math.max(1, rk.orte)), saisonProzent: Math.round((100 * rk.saisonAnders) / Math.max(1, rk.saisonOrte)), jagdJahr: rk.jagdJahr }, zeuge: { antworten: rk.orte, streuung: Math.max(...rk.n) - Math.min(...rk.n), vor: rk.n.reduce((q, x) => q + x, 0), nach: rk.nNach.reduce((q, x) => q + x, 0), saisonOrte: rk.saisonOrte } };
                    if (rk.saisonAnders === 0) aus[8].nicht = "der Bestand folgt der Saison nicht: an " + rk.saisonOrte + " Regionen gleich nach Sommer und Winter (`_kreaturBestand` liest keine Saison, kreatur-leben.js:2114); jeder Ort jedes Planeten: nur die Regionen um die Ankunft";
                    // stand die Nah-Streu nach 5 s nicht (der Boden ihrer Chunks fehlte), zählt der Hektar ohne seine Pflanzen —
                    // dann trägt keine Sprosse der Artenzahl eine Zahl und kein Urteil (ungemessen, der Grund im Zeugen)
                    if (!I.streuBereit)
                        for (const nr of [2, 3, 4, 5]) aus[nr] = { werte: {}, zeuge: { antworten: 0, streuung: 0, streuBereit: 0, streuWarteMs: I.streuWarteMs, streuLeer: I.streuLeer } };
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: { refArten: 10 },
                        soll: [K.soll(VI, 2, "±Faktor 2", { key: "faktor", rel: "≤", zahl: 2 })],
                        zeuge: zeugeWelt(20, false),
                        taeter: "stamm/vegetation-wiese.js _nahStreuArten (7 Arten der Streu) · tetrapoda-core.js LEBENSRAUM_GESETZ (4 Gattungen)",
                        unklar: "die Feldkartierung trägt keine Zahl und die 10 min keinen Gang — gezählt der Hektar der Ankunft im Stand (Streu, Wald, Bestand, Vogel, Bestäuber) gegen 10 Arten aus dem Umfang (10¹); Vorschlag: die Kartierung eines Hektars als Zahl in die Karte",
                        gruen: gut({ faktor: 1.4, artenHa: 14, tiereRing: 160 }, 40),
                        attrappen: [
                            { name: "14 Arten aus einer Artenliste ohne Ort", roh: flach({ faktor: 1.4, artenHa: 14, tiereRing: 160 }) },
                            { name: "der Hektar leer gelesen (keine Antwort trägt Streuung)", roh: starr({ faktor: 1.4, artenHa: 14, tiereRing: 160 }, 40) },
                        ],
                    },
                    3: {
                        u: {},
                        soll: [
                            K.soll(VI, 3, "Jaccard Tag/Nacht und Sommer/Winter ±0,15", { key: "jaccardTagNacht", ref: 0.5, refQuelle: "Feldkurve ohne Zahl auf der Karte — gesetzt J 0,5 (Tag- und Nacht-Fauna gemäßigter Wälder zur Hälfte geteilt)" }),
                            K.soll(VI, 3, "Jaccard Tag/Nacht und Sommer/Winter ±0,15", { key: "jaccardSommerWinter", ref: 0.6, refQuelle: "Feldkurve ohne Zahl auf der Karte — gesetzt J 0,6 (Sommer- und Winter-Arten gemäßigter Breiten)" }),
                        ],
                        zeuge: zeugeWelt(20, false),
                        taeter: "stamm/vegetation-wiese.js _nahStreuKachel · stamm/kreatur-leben.js _kreaturBestand (Uhr und Saison ohne Wirkung)",
                        nicht: "10² Arten je Hektar",
                        leser: "stamm/kreatur-leben.js:2114 _kreaturBestand — liest weder Uhr noch Saison; stamm/vegetation-wiese.js:1249 _nahStreuArten — wechselt keine Arten mit der Saison",
                        unklar: "„Feldkurve“ und das Jaccard-Soll tragen keinen Referenzwert — gesetzt J 0,5 (Tag/Nacht) und 0,6 (Sommer/Winter); Vorschlag: die Feldkurve mit Quelle in die Karte",
                        gruen: gut({ jaccardTagNacht: 0.45, jaccardSommerWinter: 0.62, artenHa: 120 }, 40),
                        attrappen: [
                            { name: "Jaccard einer Studie, ohne Lesung", roh: flach({ jaccardTagNacht: 0.45, jaccardSommerWinter: 0.62, artenHa: 120 }) },
                            { name: "Lesung ohne Streuung", roh: starr({ jaccardTagNacht: 0.45, jaccardSommerWinter: 0.62, artenHa: 120 }, 40) },
                        ],
                    },
                    4: {
                        u: { refArten: 1000 },
                        soll: [K.soll(VI, 4, "Zählung je Hektar gegen Regenwald-Inventur ±Faktor 2", { key: "faktor", rel: "≤", zahl: 2 })],
                        zeuge: zeugeWelt(20, false),
                        taeter: "stamm/vegetation-wiese.js _forestCellDarts (5 Baumarten der Heimat)",
                        nicht: "kein Regenwald-Hektar",
                        leser: "stamm/vegetation-wiese.js:2717 _forestCellDarts — setzt die Baumarten der Heimat; kein Regenwald, keine Gliederfüßer",
                        unklar: "die Regenwald-Inventur trägt keine Zahl — gesetzt 1 000 Arten je ha aus dem Umfang (10³)",
                        gruen: gut({ faktor: 1.3, artenHa: 780 }, 40),
                        attrappen: [{ name: "780 Arten aus der Inventur abgeschrieben", roh: flach({ faktor: 1.3, artenHa: 780 }) }],
                    },
                    5: {
                        u: {},
                        soll: [
                            K.soll(VI, 5, "im Band bei ≥ 80 % der Saaten", { key: "zImBandProzent", einheit: "%" }),
                            K.soll(VI, 5, "z aus Zählungen im Spiel", { key: "zMedian", rel: "band", zahl: 0.15, bis: 0.35, quelleFeld: "tiefe", quelleWort: "Land z 0,15–0,35" }),
                        ],
                        zeuge: zeugeWelt(9, true),
                        taeter: "stamm/vegetation-wiese.js _forestCellDarts · _nahStreuArten (die Artenzahl sättigt in einem Hektar)",
                        nicht: "Flächen bis 10⁴ km²",
                        leser: "stamm/vegetation-wiese.js:2717 _forestCellDarts — der Wald kennt 5 Baumarten; stamm/vegetation-wiese.js:1249 _nahStreuArten — lebt nur im Ring der Ankunft; keine Zählung über 1 ha … 10⁴ km²",
                        gruen: gut({ zImBandProzent: 85, zMedian: 0.24 }, 12),
                        attrappen: [
                            { name: "z = 0,25 aus der Literatur", roh: flach({ zImBandProzent: 85, zMedian: 0.24 }) },
                            { name: "dieselbe Zahl auf jeder Fläche", roh: starr({ zImBandProzent: 85, zMedian: 0.24 }, 12) },
                        ],
                    },
                    6: {
                        u: {},
                        soll: [
                            K.soll(VI, 6, "Arten je Fläche über die Breite", { key: "gradient", rel: "≥", zahl: 10, quelleFeld: "tiefe", quelleWort: "Breitengradient Tropen ÷ Tundra ≥ 10" }),
                            K.soll(VI, 6, "Biomasse-Anteile gegen Bar-On 2018", { key: "pflanzenProzent", rel: "=", zahl: 80, einheit: "%", quelleFeld: "tiefe", quelleWort: "Pflanzen ~80 %", refQuelle: "Bar-On, Phillips & Milo 2018 (PNAS 115): Pflanzen ≈ 82 % der Biomasse" }),
                            K.soll(VI, 6, "Biomasse-Anteile gegen Bar-On 2018", { key: "tierProzent", rel: "<", zahl: 1, quelleFeld: "tiefe", quelleWort: "Tiere < 1 %" }),
                        ],
                        zeuge: zeugeWelt(9, false),
                        taeter: "planet-core.js planetOrt (keine Art, keine Biomasse je Breite)",
                        nicht: "keine Arten und keine Biomasse über die Breite",
                        leser: "planet-core.js:2290 planetOrt — trägt den Wuchs (ORT_WUCHS decke, wald), keine Artenzahl und keine Biomasse je Breite",
                        unklar: "„~80 %“ ohne Toleranz — die Station urteilt nach der Zahl der Tiefe (= 80 %); Vorschlag: das Band um Bar-On 82 % als Zahl in die Karte",
                        gruen: gut({ gradient: 14, pflanzenProzent: 80, tierProzent: 0.4 }, 9),
                        attrappen: [{ name: "Bar-On abgeschrieben ohne Meridian", roh: flach({ gradient: 14, pflanzenProzent: 80, tierProzent: 0.4 }) }],
                    },
                    7: {
                        u: {},
                        soll: [
                            K.soll(VI, 7, "200 Saaten", { key: "saaten", rel: "≥", zahl: 200 }),
                            K.soll(VI, 7, "Beta-Diversität getrennt > verbunden", { key: "betaDiff", rel: ">", zahl: 0, refQuelle: "der Richter: Beta getrennt − Beta verbunden > 0" }),
                            K.soll(VI, 7, "Endemiten-Anteil Insel > Festland", { key: "endemitenDiff", rel: ">", zahl: 0, refQuelle: "der Richter: Endemiten-Anteil Insel − Festland > 0" }),
                        ],
                        zeuge: zeugeWelt(60, true),
                        taeter: "tetrapoda-core.js LEBENSRAUM_GESETZ (jede Gattung überall in ihrem Lebensraum, kein Endemit)",
                        nicht: "keine Endemiten-Zentren, EINE Saat je Welt",
                        leser: "tetrapoda-core.js:2072 LEBENSRAUM_GESETZ — die Gattung folgt nur der Boden-Klasse, keine Trennung durch Insel, Tal oder Becken",
                        gruen: gut({ saaten: 200, betaDiff: 0.31, endemitenDiff: 0.22, endemiten: 6 }, 600),
                        attrappen: [{ name: "Beta aus der Literatur", roh: flach({ saaten: 200, betaDiff: 0.31, endemitenDiff: 0.22, endemiten: 6 }) }],
                    },
                    8: {
                        u: { orte: 100 },
                        soll: [
                            K.soll(VI, 8, "Rückkehr nach 1 Spieljahr an 100 Orte", { key: "orte", rel: "≥", zahl: 100 }),
                            K.soll(VI, 8, "Bestand verändert nach Saison und Jagd", { key: "veraendertProzent", rel: "≥", zahl: 80, refQuelle: "der Richter: Bestand verändert — gesetzt an ≥ 80 % der Orte" }),
                            K.soll(VI, 8, "Bestand verändert nach Saison und Jagd", { key: "saisonProzent", rel: ">", zahl: 0, refQuelle: "der Richter: nach Saison — die Saison ändert den Bestand an mindestens einem Ort" }),
                            K.soll(VI, 8, "nie zurückgesetzt", { key: "zurueckProzent", rel: "=", zahl: 0, refQuelle: "der Richter: nie zurückgesetzt (0 von 100 Orten)" }),
                        ],
                        zeuge: zeugeWelt(100, true),
                        taeter: "stamm/kreatur-leben.js _kreaturBestand (liest keine Saison)",
                        nicht: "der Bestand folgt der Saison nicht",
                        leser: "stamm/kreatur-leben.js:2114 _kreaturBestand — liest keine Saison (Kapazität nur aus Boden-Klasse × Äsung)",
                        unklar: "„verändert“ ohne Anteil — gesetzt ≥ 80 % der Orte",
                        gruen: gut({ orte: 100, veraendertProzent: 96, zurueckProzent: 0, saisonProzent: 60, jagdJahr: 140 }, 100),
                        attrappen: [
                            { name: "100 Orte gezählt ohne Rückkehr", roh: flach({ orte: 100, veraendertProzent: 96, zurueckProzent: 0, saisonProzent: 60, jagdJahr: 140 }) },
                            { name: "der Bestand stand still (vor = nach)", roh: still({ orte: 100, veraendertProzent: 96, zurueckProzent: 0, saisonProzent: 60, jagdJahr: 140 }, 100) },
                        ],
                    },
                },
            },
            // ═══ DIE DYNAMIK: Kaskade im Bild, Schwingung, Ausbruch, Kelp, Front, Zyklus nur mit Paar ═══
            [DY]: {
                sek: 45,
                mutiert: true,
                pfad: PFAD_TIER,
                ungefahren: "die Bilder (S2 Bildpaar, S4 Luftbild-Reihe) — swiftshader schießt nicht",
                mess: async function (H, U, M) {
                    const seite = (fn, a) => H.seite("return await (" + fn.toString() + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const raffer = async (r, T, a) => {
                        const s = r.state;
                        const A = r.constructor;
                        const B = A._bestandGesetz().B;
                        const S = r._bestandSeite();
                        const pm = s.playerMesh.position;
                        let ix = Math.floor(pm.x / S);
                        const iz = Math.floor(pm.z / S);
                        const park = (k) => r._bestandFeld(k).zellen.filter((c) => r._genesisFlaeche(c.x, c.z)).length;
                        let k0 = ix + "," + iz;
                        for (let n = 0; park(k0) && n < 20; n++) k0 = --ix + "," + iz;
                        for (let i = 0; i < 100 && !r._bestandBereit(k0); i++) await new Promise((f) => setTimeout(f, 50));
                        if (!r._bestandBereit(k0)) throw new Error("das Tal " + k0 + " steht nicht bereit");
                        const jahrT = Math.round(r._kalender().jahrK / B.taktS);
                        const G = Object.keys(A._lebensraumGesetz().L.gattung);
                        const alt = { fb: s.faunaBestand, lf: s.lifeField, af: s.aasFeld, aq: r._aasFrist, ef: s.emotionField, fs: r._faunaStroeme, sz: s.spielZeit, gen: r._lebenGen, seq: s._creatureNetSeq };
                        const laeufe = [];
                        const t0 = performance.now();
                        const fern = [];
                        try {
                            for (const ohne of a.varianten)
                                for (const saat of a.saaten) {
                                    if (performance.now() - t0 > a.budgetMs * (ohne ? 1 : 0.5) && laeufe.filter((l) => l.ohne === ohne).length >= 2) break;
                                    // die Front und die Läufe ohne Wolf brauchen ihren Rest: ein Lauf beginnt nur, wenn er und die Front ins Budget passen
                                    if (laeufe.length && window.__rafferRest() < (ohne ? 2.6 : 4) * laeufe[laeufe.length - 1].ms && laeufe.filter((l) => l.ohne === ohne).length >= 2) break;
                                    r._faunaStroeme = { seed: s.worldMeta.seed, rng: new Proxy(Object.create(null), { get: (o, k) => o[k] || (String(k).includes("@") ? r._streamRng(a.praefix + saat + "-" + String(k)) : (o[k] = r._streamRng(a.praefix + saat + "-" + String(k)))) }) };
                                    s.faunaBestand = undefined;
                                    s.lifeField = undefined;
                                    [s.aasFeld, r._aasFrist] = [new Map(), null]; // die Leichname der Probe (`_aasTat`) bleiben in ihr
                                    s.emotionField = new Map();
                                    s.spielZeit = 0;
                                    const R = r._bestandRegion(k0, false);
                                    const reihe = {};
                                    for (const g of G) reihe[g] = [];
                                    let K0 = 0;
                                    let jung = null;
                                    let kappe = 0;
                                    const t1 = performance.now();
                                    // Rotwild und Wolf leben seit Leben C2b im Gau: die Region der Altlast trägt kein `deer` — dann ist
                                    // der Jungwuchs ungemessen (null); der Lauf fährt am Budget der Leiter (`window.__raffer`, k2-planet.js)
                                    window.__raffer(a.jahre * jahrT, (k) => {
                                        r._bestandSchritt(k0, R, true, []);
                                        if (ohne) for (let i = R.tiere.length - 1; i >= 0; i--) if (R.tiere[i].g === ohne) R.tiere.splice(i, 1);
                                        if (k === jahrT) K0 = Object.values(r._kreaturBestand(null, k0)).reduce((q, b) => q + b.K, 0);
                                        if (k === a.jungJahre * jahrT - 1) jung = (r._kreaturBestand(null, k0).deer || { K: null }).K;
                                        if (k % a.probeT === a.probeT - 1) {
                                            const je = {};
                                            for (const t of R.tiere) je[t.g] = (je[t.g] || 0) + 1;
                                            for (const g of G) reihe[g].push(je[g] || 0);
                                            if (K0 > 0 && R.tiere.length > 3 * K0 + 10) kappe++;
                                        }
                                    }, "dynamik saat " + saat + (ohne ? " ohne " + ohne : ""));
                                    laeufe.push({ saat, ohne, reihe, K0: Math.round(K0 * 100) / 100, jung, kappe, ms: Math.round(performance.now() - t1) });
                                }
                            // DIE FRONT (S6): eine Zeile aus 5 Regionen östlich des Tals, frisch und leer; je Region der Takt, an dem der erste
                            // Fuchs steht — gleich überall heißt: keine Front, die Gattung entsteht in jeder Region aus ihrer Kapazität
                            r._faunaStroeme = { seed: s.worldMeta.seed, rng: new Proxy(Object.create(null), { get: (o, k) => o[k] || (String(k).includes("@") ? r._streamRng("front-" + String(k)) : (o[k] = r._streamRng("front-" + String(k)))) }) };
                            s.faunaBestand = undefined;
                            s.lifeField = undefined;
                            [s.aasFeld, r._aasFrist] = [new Map(), null];
                            s.spielZeit = 0;
                            const [x0, z0] = k0.split(",").map(Number);
                            const zeile = [0, 1, 2, 3, 4].map((d) => x0 + d + "," + z0);
                            const Rz = zeile.map((k) => r._bestandRegion(k, false));
                            const erst = zeile.map(() => null);
                            window.__raffer(2 * jahrT, (k) =>
                                zeile.forEach((key, i) => {
                                    if (!r._bestandBereit(key)) return;
                                    r._bestandSchritt(key, Rz[i], true, []);
                                    if (erst[i] === null && Rz[i].tiere.some((t) => t.g === a.front)) erst[i] = k;
                                }), "dynamik front");
                            fern.push(...erst);
                        } finally {
                            s.faunaBestand = alt.fb;
                            s.lifeField = alt.lf;
                            [s.aasFeld, r._aasFrist] = [alt.af, alt.aq];
                            s.emotionField = alt.ef;
                            r._faunaStroeme = alt.fs;
                            s.spielZeit = alt.sz;
                            r._lebenGen = alt.gen;
                            s._creatureNetSeq = alt.seq;
                        }
                        return { k0, jahrT, G, laeufe, front: fern, seiteM: S, marin: Object.values(A._lebensraumGesetz().L.gattung).filter((h) => Object.keys(h).some((k) => /meer|kueste|riff|see/i.test(k))).length };
                    };
                    const R = await seite(raffer, { varianten: [null, "wolf"], saaten: [1, 2, 3, 4, 5, 6, 7, 8], jahre: 50, jungJahre: 10, probeT: 12, budgetMs: 20000, praefix: "dyn-", front: "fox" });
                    const proJahr = R.jahrT / 12;
                    // DIE SCHWINGUNG: die Autokorrelation der Hirsch-Reihe (ohne Mittel) — ihr erstes Maximum nach dem ersten Nulldurchgang
                    // ist die Periode, das Maximum der Kreuzkorrelation Wolf gegen Hirsch der Verzug des Räubers
                    const ak = (v, lag) => {
                        const m = v.reduce((q, x) => q + x, 0) / v.length;
                        let z = 0;
                        let n = 0;
                        for (let i = 0; i + lag < v.length; i++) z += (v[i] - m) * (v[i + lag] - m);
                        for (let i = 0; i < v.length; i++) n += (v[i] - m) * (v[i] - m);
                        return n > 0 ? z / n : 0;
                    };
                    const kk = (x, y, lag) => {
                        const mx = x.reduce((q, v) => q + v, 0) / x.length;
                        const my = y.reduce((q, v) => q + v, 0) / y.length;
                        let z = 0;
                        let nx = 0;
                        let ny = 0;
                        for (let i = 0; i + lag < x.length; i++) z += (x[i] - mx) * (y[i + lag] - my);
                        for (let i = 0; i < x.length; i++) (nx += (x[i] - mx) ** 2), (ny += (y[i] - my) ** 2);
                        return nx > 0 && ny > 0 ? z / Math.sqrt(nx * ny) : 0;
                    };
                    const zyklus = (v) => {
                        const L = Math.floor(v.length / 3);
                        let null0 = 0;
                        for (let l = 1; l < L; l++)
                            if (ak(v, l) <= 0) {
                                null0 = l;
                                break;
                            }
                        if (!null0) return { periode: null, staerke: 0 };
                        let best = null0;
                        for (let l = null0; l < L; l++) if (ak(v, l) > ak(v, best)) best = l;
                        return { periode: best / proJahr, staerke: ak(v, best) };
                    };
                    const mit = R.laeufe.filter((l) => !l.ohne);
                    const ohne = R.laeufe.filter((l) => l.ohne);
                    const zm = mit.map((l) => zyklus(l.reihe.deer));
                    const zo = ohne.map((l) => zyklus(l.reihe.deer));
                    const per = zm.map((z) => z.periode).filter((x) => x !== null).sort((x, y) => x - y);
                    const verz = mit.map((l) => {
                        let best = 0;
                        for (let lag = 0; lag < 3 * proJahr; lag++) if (kk(l.reihe.deer, l.reihe.wolf, lag) > kk(l.reihe.deer, l.reihe.wolf, best)) best = lag;
                        return best / proJahr;
                    }).sort((x, y) => x - y);
                    const med = (v) => (v.length ? Math.round(v[Math.floor(v.length / 2)] * 1000) / 1000 : null);
                    const alle = R.laeufe.flatMap((l) => l.reihe.deer);
                    const mw = alle.reduce((q, x) => q + x, 0) / Math.max(1, alle.length);
                    const sd = Math.round(Math.sqrt(alle.reduce((q, x) => q + (x - mw) ** 2, 0) / Math.max(1, alle.length)) * 100) / 100;
                    const jm = mit.filter((l) => l.jung !== null).map((l) => l.jung);
                    const jo = ohne.filter((l) => l.jung !== null).map((l) => l.jung);
                    const mj = (v) => v.reduce((q, x) => q + x, 0) / Math.max(1, v.length);
                    const jungMinus = jm.length && jo.length ? Math.round((1e4 * (mj(jm) - mj(jo))) / Math.max(1e-9, mj(jm))) / 100 : null;
                    const zg = { antworten: R.laeufe.length, streuung: sd, vor: mit.length ? mit[0].reihe.deer.reduce((q, x) => q + x, 0) : 0, nach: ohne.length ? ohne[0].reihe.deer.reduce((q, x) => q + x, 0) : 0, tal: R.k0, mit: mit.length, ohne: ohne.length, ms: R.laeufe.map((l) => l.ms) };
                    const aus = M.teil || {};
                    aus[2] = { werte: jungMinus === null ? {} : { jungwuchsMinusProzent: jungMinus }, zeuge: Object.assign({ jungMit: jm, jungOhne: jo }, zg), auge: await M.auge("oeko-dynamik-s2", { ort: "wiese" }) };
                    aus[3] = { werte: { periodeJahre: med(per), verzugJahre: med(verz) }, zeuge: Object.assign({ perioden: per, verzug: verz }, zg, { antworten: mit.length }) };
                    const aSaaten = mit.filter((l) => l.kappe > 0).length;
                    aus[4] = { werte: { ausbruchSaaten: aSaaten, saaten: mit.length }, zeuge: Object.assign({ kappe: mit.map((l) => l.kappe) }, zg, { antworten: mit.length }), auge: await M.auge("oeko-dynamik-s4", { ort: "wiese" }), nicht: "keine Massenvermehrung eines Waldschädlings — kein Insekt im Bestand (" + R.G.join(", ") + "), keine braune Waldfläche" };
                    aus[5] = { werte: { meerArten: R.marin }, zeuge: { antworten: R.G.length, streuung: 0 }, nicht: "kein Otter, kein Seeigel, kein Kelp — " + R.marin + " Gattungen des Bestands leben im Meer (LEBENSRAUM_GESETZ)" };
                    // eine FRONT heißt: der erste Fuchs steht in jeder ferneren Region später (monoton im Abstand) — sonst entsteht er
                    // überall aus seiner Kapazität, und ein Tempo aus erster und letzter Region wäre eine erfundene Zahl
                    const fr = R.front;
                    const monoton = fr.every((x, i) => x !== null && (i === 0 || x > fr[i - 1]));
                    const frontKm = monoton ? Math.round((((4 * R.seiteM) / 1000) / ((fr[4] - fr[0]) / R.jahrT)) * 100) / 100 : null;
                    const umkehr = fr.filter((x, i) => i > 0 && (x === null || fr[i - 1] === null || x <= fr[i - 1])).length;
                    aus[6] = { werte: frontKm === null ? { frontUmkehrungen: umkehr } : { frontKmJahr: frontKm }, zeuge: { antworten: fr.filter((x) => x !== null).length, streuung: new Set(fr).size - 1, front: fr, monoton }, nicht: "keine eingeschleppte Art: jede Gattung entsteht in jeder Region aus ihrer Kapazität (`_creatureNaturalBirth`, kreatur-leben.js:1949), der erste Fuchs steht an den Takten " + fr.join(", ") + " — keine Front" };
                    const zmP = Math.round((100 * zm.filter((z) => z.staerke > 0.3).length) / Math.max(1, zm.length));
                    const zoP = Math.round((100 * zo.filter((z) => z.staerke > 0.3).length) / Math.max(1, zo.length));
                    aus[7] = { werte: { saaten: mit.length, zyklusMitProzent: zmP, zyklusOhneProzent: zoP }, zeuge: Object.assign({ staerkeMit: zm.map((z) => Math.round(z.staerke * 100) / 100), staerkeOhne: zo.map((z) => Math.round(z.staerke * 100) / 100) }, zg), nicht: "jeder Planet, 10⁴ Jahre — der Bestand lebt in den Regionen eines Tals; der Deckel trägt " + mit.length + " + " + ohne.length + " Saaten × 50 Spieljahre" };
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: { jahre: 10, auge: { ort: "wiese" } },
                        soll: [K.soll(DY, 2, "Jungwuchs-Deckung −≥ 20 % gegen Gegenlauf", { key: "jungwuchsMinusProzent", einheit: "%" })],
                        auge: { pose: "Ego an der Wiese, dieselbe Kamera vor und nach 10 Spieljahren ohne Wölfe", vorbild: "Bildpaar gegen den Gegenlauf mit Wölfen: Jungwuchs-Deckung im Bild (Prüfer-Satz R11)" },
                        taeter: "stamm/kreatur-leben.js _kreaturFrass (die Äsung der Herde am Jungwuchs)",
                        // ZAHL (auge-klasse.cjs): die Station urteilt die Zahl, das Bild ist Beleg
                        zeuge: zeugeWelt(2, true),
                        gruen: gut({ jungwuchsMinusProzent: 26 }, 16),
                        attrappen: [{ name: "−26 % aus dem Kaskaden-Lauf ohne Bild", roh: flach({ jungwuchsMinusProzent: 26 }) }],
                    },
                    3: {
                        u: { jahre: 50 },
                        soll: [K.soll(DY, 3, "Periode 8–11 Jahre", { key: "periodeJahre", einheit: "Jahre" }), K.soll(DY, 3, "Räuber hinkt 1–2 Jahre nach", { key: "verzugJahre", einheit: "Jahre" })],
                        zeuge: zeugeWelt(2, true),
                        taeter: "tetrapoda-core.js BESTAND_GESETZ (bilanz/riss) · stamm/kreatur-leben.js _bestandTakt",
                        gruen: gut({ periodeJahre: 9.6, verzugJahre: 1.4 }, 8),
                        attrappen: [
                            { name: "eine Sinus-Reihe ohne Bestand", roh: flach({ periodeJahre: 9.6, verzugJahre: 1.4 }) },
                            { name: "Reihen ohne Streuung", roh: starr({ periodeJahre: 9.6, verzugJahre: 1.4 }, 8) },
                        ],
                    },
                    4: {
                        u: { saaten: 8, jahre: 50, auge: { ort: "wiese" } },
                        soll: [K.soll(DY, 4, "Ausbruch in ≥ 1 von 8 Saaten je 50 Spieljahre", { key: "ausbruchSaaten" }), K.soll(DY, 4, "Ausbruch in ≥ 1 von 8 Saaten je 50 Spieljahre", { key: "saaten", rel: "≥", zahl: 8 })],
                        auge: { pose: "Luftbild über dem Tal (heute: Ego an der Wiese)", vorbild: "braune Waldfläche gegen die Luftbild-Reihe eines Borkenkäfer-Ausbruchs (Prüfer-Satz R11)" },
                        taeter: "tetrapoda-core.js LEBENSRAUM_GESETZ (kein Waldschädling)",
                        nicht: "kein Waldschädling",
                        leser: "tetrapoda-core.js:2072 LEBENSRAUM_GESETZ — trägt kein Insekt; kein Leser färbt Wald braun",
                        gruen: gut({ ausbruchSaaten: 2, saaten: 8 }, 8),
                        attrappen: [{ name: "Ausbruch behauptet ohne Raffer", roh: flach({ ausbruchSaaten: 2, saaten: 8 }) }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(DY, 5, "Räuber entfernt: Kelpfläche fällt nach dem Muster der Feldstudien", { key: "kelpEffekt", rel: "<", zahl: 0, refQuelle: "Estes & Palmisano 1974 (Science 185): ohne Otter fällt die Kelpfläche" })],
                        zeuge: zeugeWelt(3, true),
                        taeter: "tetrapoda-core.js LEBENSRAUM_GESETZ (kein Meer im Bestand)",
                        nicht: "kein Netz an der Küste",
                        leser: "tetrapoda-core.js:2072 LEBENSRAUM_GESETZ — kennt keinen Lebensraum im Meer; tetrapoda-core.js:2818 FISCH_GESETZ — ohne Fraß",
                        gruen: gut({ kelpEffekt: -0.6 }, 8),
                        attrappen: [{ name: "Estes 1974 abgeschrieben", roh: flach({ kelpEffekt: -0.6 }) }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(DY, 6, "Front-Tempo im Band realer Invasionen (10–60 km/Jahr)", { key: "frontKmJahr", einheit: "km/Jahr" })],
                        zeuge: zeugeWelt(5, false),
                        taeter: "stamm/kreatur-leben.js _creatureNaturalBirth (jede Gattung entsteht in jeder Region, keine Ausbreitung)",
                        nicht: "keine eingeschleppte Art, keine Front",
                        leser: "stamm/kreatur-leben.js:1949 _creatureNaturalBirth — wirft jede Gattung in ihrer Region aus der Kapazität; kein Zuzug aus Nachbar-Regionen",
                        gruen: gut({ frontKmJahr: 24 }, 5),
                        attrappen: [{ name: "Front-Tempo aus einer Studie", roh: flach({ frontKmJahr: 24 }) }],
                    },
                    7: {
                        u: { saaten: 64 },
                        soll: [
                            K.soll(DY, 7, "64 Saaten", { key: "saaten", rel: "≥", zahl: 64 }),
                            K.soll(DY, 7, "Bestandsreihen schwingen nur, wo Räuber-Beute-Paare es tragen", { key: "zyklusMitProzent", rel: ">", zahl: 0, refQuelle: "der Richter: mit dem Paar schwingt die Reihe (Anteil > 0)" }),
                            K.soll(DY, 7, "Gegenprobe Paar entfernt → Zyklus weg", { key: "zyklusOhneProzent", rel: "=", zahl: 0, refQuelle: "der Richter: Zyklus weg — keine Saat ohne Paar schwingt (0 %)" }),
                        ],
                        zeuge: zeugeWelt(64, true),
                        taeter: "stamm/kreatur-leben.js _bestandTakt (EIN Tal statt eines Planeten)",
                        nicht: "jeder Planet, 10⁴ Jahre",
                        leser: "stamm/kreatur-leben.js:2284 _bestandRegion — lebt in Regionen um den Spieler; kein Planet im Zeitsprung",
                        gruen: gut({ saaten: 64, zyklusMitProzent: 70, zyklusOhneProzent: 0 }, 128),
                        attrappen: [{ name: "Zyklus behauptet ohne Gegenprobe", roh: flach({ saaten: 64, zyklusMitProzent: 70, zyklusOhneProzent: 0 }) }],
                    },
                },
            },
            // ═══ DER ZERFALL: Kadaver und Nährstoff nach jedem Tod, Verwesung, Totholz, Pilze, Streu, Bilanz ═══
            [ZE]: {
                sek: 10,
                mutiert: true,
                pfad: PFAD_TIER.concat(["stamm/vegetation-wiese.js", "foundry-core.js"]),
                ungefahren: "die Bildreihen (S2 Verwesung, S3 Totholz, S6 Walfall) — swiftshader schießt nicht",
                mess: async function (H, U, M) {
                    const seite = (fn, a) => H.seite("return await (" + fn.toString() + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    // DER TOD IM SANDKASTEN: die Region des Tals frisch aus ihren Strömen gefüllt (eine Stunde Takt), dann je Ursache ein
                    // Tier durch `_bestandStirbt` (Riss, Alter, Hunger) und die Tat des Spieler-Tods (`_tatSchreiben("riss")`, der Weg von
                    // kreatur-leben.js:919) — je Tod der Nährstoff am Ort vorher und nachher; dazu ein Spieljahr Bilanz am Feld
                    const tod = async (r, T, a) => {
                        const s = r.state;
                        const A = r.constructor;
                        const B = A._bestandGesetz().B;
                        const S = r._bestandSeite();
                        const pm = s.playerMesh.position;
                        const wm = s.worldMeta;
                        let ix = Math.floor(pm.x / S);
                        const iz = Math.floor(pm.z / S);
                        const park = (k) => r._bestandFeld(k).zellen.filter((c) => r._genesisFlaeche(c.x, c.z)).length;
                        let k0 = ix + "," + iz;
                        for (let n = 0; park(k0) && n < 20; n++) k0 = --ix + "," + iz;
                        for (let i = 0; i < 100 && !r._bestandBereit(k0); i++) await new Promise((f) => setTimeout(f, 50));
                        const jahrT = Math.round(r._kalender().jahrK / B.taktS);
                        const alt = { fb: s.faunaBestand, lf: s.lifeField, af: s.aasFeld, aq: r._aasFrist, ef: s.emotionField, fs: r._faunaStroeme, sz: s.spielZeit, gen: r._lebenGen, seq: s._creatureNetSeq, L0: wm.taten, nf: r._nachwuchsFaellig, sn: r._sukzessionNeu, idx: r._tatIdx };
                        const stubs = ["_scheduleEditSave", "_nahStreuTat", "_weltRegt"].map((m) => [m, Object.prototype.hasOwnProperty.call(r, m), r[m]]);
                        const eDL = Object.prototype.hasOwnProperty.call(r, "_depositLife");
                        const fDL = r._depositLife;
                        const aus = { tode: [] };
                        let gabe = 0;
                        let nahme = 0;
                        try {
                            for (const [m] of stubs) r[m] = () => {};
                            wm.taten = Array.isArray(alt.L0) ? alt.L0.slice() : [];
                            r._sukzessionNeu = [];
                            r._faunaStroeme = { seed: s.worldMeta.seed, rng: new Proxy(Object.create(null), { get: (o, k) => o[k] || (String(k).includes("@") ? r._streamRng("tod-" + String(k)) : (o[k] = r._streamRng("tod-" + String(k)))) }) };
                            s.faunaBestand = undefined;
                            s.lifeField = undefined;
                            s.emotionField = new Map();
                            s.spielZeit = 0;
                            [s.aasFeld, r._aasFrist] = [new Map(), null];
                            const R = r._bestandRegion(k0, false);
                            window.__raffer(a.fuellT, () => r._bestandSchritt(k0, R, true, []), "zerfall fuellen");
                            // JE URSACHE EIN TIER, erzwungen: trägt das Tal nach dem Füllen weniger als drei, füllen die Regionen westwärts
                            // nach (ddaf883d: nur ein Bär im Tal — Alter und Hunger fielen aus, naehrMinPlus ungemessen)
                            const tiere = R.tiere.map((t) => [R, t]);
                            for (let n = 1, jx = ix - 1; tiere.length < 3 && n < 6; n++, jx--) {
                                const k = jx + "," + iz;
                                if (park(k)) continue;
                                for (let i = 0; i < 100 && !r._bestandBereit(k); i++) await new Promise((f) => setTimeout(f, 50));
                                if (!r._bestandBereit(k)) continue;
                                const R2 = r._bestandRegion(k, false);
                                window.__raffer(a.fuellT, () => r._bestandSchritt(k, R2, true, []), "zerfall fuellen " + k);
                                for (const t of R2.tiere) tiere.push([R2, t]);
                            }
                            // DER BODEN DER MESSUNG: die Leichname des Füllens legten sich in die Zellen der Tiere, die nun sterben —
                            // ddaf883d stand ihre Zelle schon an der Kappe des Nährstoffs (1,6 = WUCHS.naehrMax), kein Tod konnte sie
                            // heben. Gemessen wird nach dem Füllen auf frischem Feld der Leichname: der Leser bleibt `_naehrstoffAt`.
                            [s.aasFeld, r._aasFrist] = [new Map(), null];
                            for (const u of ["jagd", "alter", "hunger"]) {
                                const [RT, t] = tiere.shift() || [];
                                if (!t) continue;
                                const vor = r._naehrstoffAt(t.x, t.z);
                                const aeVor = r._kreaturNahrung(t.x, t.z);
                                const jaeger = RT.tiere.filter((x) => x !== t && x.g === "wolf").slice(0, 1);
                                r._bestandStirbt(RT, t, u, [], jaeger);
                                aus.tode.push({ u, id: t.id, g: t.g, vor, nach: r._naehrstoffAt(t.x, t.z), aeVor, aeNach: r._kreaturNahrung(t.x, t.z) });
                            }
                            const x = pm.x + a.dx;
                            const z = pm.z + a.dz;
                            const vor = r._naehrstoffAt(x, z);
                            r._tatSchreiben("riss", x, z);
                            aus.tode.push({ u: "spieler", vor, nach: r._naehrstoffAt(x, z) });
                            r._depositLife = function (x2, z2, m) {
                                if (m > 0) gabe += m;
                                else nahme -= m;
                                return fDL.call(this, x2, z2, m);
                            };
                            window.__raffer(jahrT, () => r._bestandSchritt(k0, R, true, []), "zerfall jahr");
                            aus.bilanz = { gabe: Math.round(gabe * 1000) / 1000, nahme: Math.round(nahme * 1000) / 1000 };
                        } finally {
                            if (eDL) r._depositLife = fDL;
                            else delete r._depositLife;
                            wm.taten = alt.L0;
                            r._nachwuchsFaellig = alt.nf;
                            r._sukzessionNeu = alt.sn;
                            r._tatIdx = alt.idx;
                            for (const [m, e, f] of stubs) {
                                if (e) r[m] = f;
                                else delete r[m];
                            }
                            s.faunaBestand = alt.fb;
                            s.lifeField = alt.lf;
                            [s.aasFeld, r._aasFrist] = [alt.af, alt.aq];
                            s.emotionField = alt.ef;
                            r._faunaStroeme = alt.fs;
                            s.spielZeit = alt.sz;
                            r._lebenGen = alt.gen;
                            s._creatureNetSeq = alt.seq;
                        }
                        aus.tal = k0;
                        aus.wieder = (wm.taten === alt.L0) + 0;
                        return aus;
                    };
                    // DER KADAVER: ein Hirsch fällt (`_kreaturFaellt`, sein Fleisch nach dem Gesetz), daneben ein oder drei hungrige Wölfe;
                    // je Kreatur-Sekunde `_kreaturAasZug` — das Fleisch je Sekunde mit 1 und mit 3 Fressern; danach fällt jeder Leib
                    const kadaver = async (r, T, a) => {
                        const s = r.state;
                        const pm = s.playerMesh.position;
                        const altUhr = s.creatureAnimationTime;
                        const neu = [];
                        const aus = { rate: {} };
                        const ort = () => {
                            for (let k = 0; k < 40; k++) {
                                const x = pm.x + a.dx + (k % 8) * 3;
                                const z = pm.z + a.dz + Math.floor(k / 8) * 3;
                                if (r._landAt(x, z)) return { x, z };
                            }
                            return { x: pm.x + a.dx, z: pm.z + a.dz };
                        };
                        try {
                            for (const n of a.fresser) {
                                const p = ort();
                                const k = r.spawnCreatureAt(p.x, pm.y, p.z, "happy", "wesen", { precise: true, bodySize: 1 });
                                if (!k) throw new Error("Spawn Hirsch");
                                neu.push(k);
                                r._kreaturFaellt(k);
                                const K = k.userData.kadaver;
                                if (!K) throw new Error("der Gefallene trägt keinen Kadaver");
                                aus.nachklangS = k.userData.dying ? k.userData.dying.nachklang : null;
                                aus.sinkenS = k.userData.dying ? k.userData.dying.sinken : null;
                                const wl = [];
                                for (let i = 0; i < n; i++) {
                                    const w = r.spawnCreatureAt(k.position.x + Math.cos(i * 2.1) * 0.6, k.position.y, k.position.z + Math.sin(i * 2.1) * 0.6, "happy", "wolf", { precise: true, bodySize: 1 });
                                    if (!w) throw new Error("Spawn Wolf");
                                    neu.push(w);
                                    w.userData.magen = 0;
                                    w.position.set(k.position.x + Math.cos(i * 2.1) * 0.6, k.position.y, k.position.z + Math.sin(i * 2.1) * 0.6);
                                    wl.push(w);
                                }
                                const f0 = K.fleisch;
                                const dir = new T.Vector3();
                                // je Versuch liegt nur SEIN Kadaver in der Liste der Gefallenen (kein fremder im Geruch der Fresser)
                                const L0 = s.leichname;
                                try {
                                    s.leichname = [k];
                                    for (let t = 0; t < a.sekunden; t++) {
                                        s.creatureAnimationTime += 1;
                                        for (const w of wl) r._kreaturAasZug(w, dir, 1, w.userData._tierBaum ? w.userData._tierBaum.beinL : 0.8);
                                    }
                                } finally {
                                    s.leichname = L0;
                                }
                                aus.rate[n] = Math.round(((f0 - K.fleisch) / a.sekunden) * 1000) / 1000;
                                aus.fleisch0 = Math.round(f0 * 10) / 10;
                                aus.rest = Object.assign(aus.rest || {}, { [n]: Math.round(K.fleisch * 1000) / 1000 });
                                aus.fresserIm = Object.assign(aus.fresserIm || {}, { [n]: wl.filter((w) => w.userData._motionZustand === "fressen").length });
                                for (const c of neu.splice(0)) r.removeCreature(c);
                            }
                        } finally {
                            for (const c of neu) {
                                try {
                                    r.removeCreature(c);
                                } catch (_e) {
                                    /* fort */
                                }
                            }
                            s.creatureAnimationTime = altUhr;
                        }
                        aus.tagS = r._kalender().tagS;
                        return aus;
                    };
                    const holz = async (r, T, a) => {
                        const s = r.state;
                        const A = r.constructor;
                        const pm = s.playerMesh.position;
                        const KA = A.NAH_STREU.kachel;
                        const C = A.FOREST ? A.FOREST.cell : 12;
                        let warte = 0;
                        for (; warte < 100; warte++) {
                            const ar = r._nahStreuArten();
                            if (ar && [[0, 0], [-1, -1], [1, 1], [-1, 1], [1, -1]].every(([u, v]) => r._nahStreuKachel(Math.floor((pm.x + u * (a.halb - 4)) / KA), Math.floor((pm.z + v * (a.halb - 4)) / KA), ar))) break;
                            await new Promise((f) => setTimeout(f, 50));
                        }
                        const arten = r._nahStreuArten();
                        const je = {};
                        let leer = 0;
                        for (let x = pm.x - a.halb; x < pm.x + a.halb; x += KA)
                            for (let z = pm.z - a.halb; z < pm.z + a.halb; z += KA) {
                                const k = r._nahStreuKachel(Math.floor(x / KA), Math.floor(z / KA), arten);
                                if (!k) {
                                    leer++;
                                    continue;
                                }
                                for (const it of k.items) {
                                    const t = arten[it.art] ? arten[it.art].kind + ":" + arten[it.art].id : "?";
                                    je[t] = (je[t] || 0) + 1;
                                }
                            }
                        let baeume = 0;
                        for (let cx = Math.floor((pm.x - a.halb) / C); cx <= Math.floor((pm.x + a.halb) / C); cx++)
                            for (let cz = Math.floor((pm.z - a.halb) / C); cz <= Math.floor((pm.z + a.halb) / C); cz++)
                                for (const d of r._forestCellDarts(cx, cz, r._forestSeedInt()) || []) if (Math.abs(d.x - pm.x) <= a.halb && Math.abs(d.z - pm.z) <= a.halb) baeume++;
                        const W = A.TAT_NARBE;
                        return { streuBereit: warte < 100 ? 1 : 0, streuWarteMs: warte * 50, je, leer, baeume, pilzArten: arten.filter((x) => /pilz|fung|mush/i.test(x.id + x.kind)).length, rissStunden: W.riss.stunden, wuchsHier: r._wuchsAt(pm.x, pm.z), jahrH: ((K) => (K.tagStunden * K.jahrK) / K.normS)(r._kalender()), aasGattungen: Object.entries(r._bestandDiet()).filter(([, d]) => d > A._verhaltenGesetz().temperament.gattung.pflanzDiet).map(([g]) => g) };
                    };
                    const TD = await seite(tod, { fuellT: 360, dx: 35, dz: -25 });
                    let KD;
                    try {
                        KD = await seite(kadaver, { fresser: [1, 3], sekunden: 10, dx: 14, dz: 14 });
                    } catch (e) {
                        KD = { fehler: String((e && e.message) || e).slice(0, 200), rate: {} };
                    }
                    const HO = await seite(holz, { halb: 50 });
                    const aus = M.teil || {};
                    const plus = TD.tode.map((d) => Math.round((d.nach - d.vor) * 1000) / 1000);
                    const verh = KD.rate[1] > 0 ? Math.round((KD.rate[3] / KD.rate[1]) * 100) / 100 : null;
                    aus[1] = { werte: Object.assign({ naehrMinPlus: plus.length >= 4 ? Math.min(...plus) : null }, verh !== null ? { fresserVerhaeltnis: verh } : {}), zeuge: { antworten: TD.tode.length + Object.keys(KD.rate).length, streuung: new Set(plus).size > 1 || (KD.rate[1] || 0) !== (KD.rate[3] || 0) ? 1 : 0, vor: KD.fleisch0 || 0, nach: KD.rest ? KD.rest[1] : KD.fleisch0 || 0, tode: TD.tode, kadaver: KD, tal: TD.tal } };
                    const ohne = TD.tode.filter((d) => !(d.nach > d.vor)).map((d) => d.u);
                    if (ohne.length) aus[1].taeter = "stamm/kreatur-leben.js _bestandStirbt — kein Nährstoff nach " + ohne.join(", ") + " (nur die Tat riss des Spielers düngt)";
                    const tage = KD.nachklangS ? Math.round(((KD.nachklangS + (KD.sinkenS || 0)) / KD.tagS) * 1000) / 1000 : null;
                    aus[2] = { werte: tage === null ? {} : { kadaverTage: tage, aasGilden: 1 }, zeuge: { antworten: 1, streuung: 0, aasGattungen: HO.aasGattungen }, auge: await M.auge("oeko-zerfall-s2", { ort: "wiese" }), nicht: "keine Verwesungsstufen und keine Gilde-Folge — der Kadaver trägt Fleisch und sinkt nach " + (tage === null ? "?" : tage) + " Spieltagen; Aasfresser nur die Säuger (" + HO.aasGattungen.join(", ") + ")" };
                    const tot = Object.entries(HO.je).filter(([k]) => /^deadwood:/.test(k)).reduce((q, [, n]) => q + n, 0);
                    const tp = HO.streuBereit && HO.baeume + tot > 0 ? Math.round((1000 * tot) / (HO.baeume + tot)) / 10 : null;
                    aus[3] = { werte: tp === null ? {} : { totholzProzent: tp }, zeuge: { antworten: HO.streuBereit ? HO.baeume + tot : 0, streuung: tot > 0 ? 1 : 0, je: HO.je, baeume: HO.baeume, streuBereit: HO.streuBereit, streuWarteMs: HO.streuWarteMs }, auge: await M.auge("oeko-zerfall-s3", { ort: "wiese" }), nicht: "Totholz ohne Zeit — Stumpf und Totstamm der Nah-Streu ohne Zerfallsklasse, Moos und Ammenstamm; der Anteil zählt Stücke, keine Biomasse" };
                    aus[4] = { werte: { pilzArten: HO.pilzArten }, zeuge: { antworten: Object.keys(HO.je).length, streuung: 0 }, nicht: "keine Pilze: die Nah-Streu trägt " + HO.pilzArten + " Pilz-Arten (vegetation-wiese.js:1249)" };
                    const hw = Math.round(((HO.rissStunden / Math.max(0.1, HO.wuchsHier)) / 2 / HO.jahrH) * 1000) / 1000;
                    aus[5] = { werte: { hwHierJahre: hw }, zeuge: { antworten: 1, streuung: 0 }, nicht: "keine Streu und kein Humus je Zelle — der Nährstoff eines Leichnams klingt mit der Narbe ab (Halbzeit hier " + hw + " Spieljahre, nach dem Wuchs des Orts, nie nach Klima-Zone)" };
                    const b = TD.bilanz || { gabe: 0, nahme: 0 };
                    const fb = Math.max(b.gabe, b.nahme) > 0 ? Math.round((1e4 * Math.abs(b.gabe - b.nahme)) / Math.max(b.gabe, b.nahme)) / 100 : null;
                    aus[6] = { werte: fb === null ? {} : { fehlbetragProzent: fb }, zeuge: { antworten: 240, streuung: b.gabe + b.nahme > 0 ? 1 : 0, bilanz: b }, auge: await M.auge("oeko-zerfall-s6", { ort: "wiese" }), nicht: "keine geschlossene Stoffbilanz und kein Walfall — das Leben-Feld verblasst (LIFE_FIELD.decayPerSec), Gabe der Tode gegen Fraß ein Spieljahr: " + b.gabe + " gegen " + b.nahme };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [
                            K.soll(ZE, 1, "Kadaver-Masse sinkt mit Fresser-Zahl", { key: "fresserVerhaeltnis", rel: ">", zahl: 1, refQuelle: "der Richter: Masse sinkt mit Fresser-Zahl — 3 Fresser schneller als 1 (Verhältnis > 1)" }),
                            K.soll(ZE, 1, "Nährstoff steigt nach jedem Tod (Wolf, Alter, Spieler)", { key: "naehrMinPlus", rel: ">", zahl: 0, refQuelle: "der Richter: steigt nach jedem Tod — die kleinste Zunahme über Riss, Alter, Hunger und Spieler > 0" }),
                        ],
                        zeuge: zeugeWelt(5, true),
                        taeter: "stamm/kreatur-leben.js _bestandStirbt (der Tod am Riss und am Alter gibt dem Boden keinen Nährstoff)",
                        leser: "stamm/kreatur-leben.js:2433 _bestandStirbt — gibt dem Leben-Feld, nie dem Nährstoff der Zelle; stamm/kreatur-leben.js:919 _tatSchreiben — riss nur von Spieler-Hand",
                        gruen: gut({ naehrMinPlus: 0.12, fresserVerhaeltnis: 2.8 }, 6),
                        attrappen: [
                            { name: "Verhältnis und Zunahme ohne Tod", roh: flach({ naehrMinPlus: 0.12, fresserVerhaeltnis: 2.8 }) },
                            { name: "der Kadaver blieb unberührt (vor = nach)", roh: still({ naehrMinPlus: 0.12, fresserVerhaeltnis: 2.8 }, 6) },
                        ],
                    },
                    2: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(ZE, 2, "Bildreihe 0/3/10/30 Tage", { key: "kadaverTage", rel: "≥", zahl: 30, einheit: "Tage" })],
                        auge: { pose: "Ego vor 10 Kadavern jeder Größe (heute: die Wiese)", vorbild: "Bildreihe 0/3/10/30 Tage gegen eine forensische Referenz; Gilde-Folge gegen Kamerafallen-Studien (Prüfer-Satz R11)" },
                        taeter: "stamm/kreatur-leben.js _tickLeichname (keine Verwesungsstufe)",
                        nicht: "keine Verwesungsstufen, keine Gilde-Folge",
                        leser: "stamm/kreatur-leben.js:3179 _tickLeichname — kennt Fleisch und Sinken, keine Verwesungsstufe; kein Vogel, kein Insekt am Aas",
                        gruen: gut({ kadaverTage: 32, aasGilden: 4 }, 10),
                        attrappen: [{ name: "30 Tage behauptet ohne Kadaver", roh: flach({ kadaverTage: 32, aasGilden: 4 }) }],
                    },
                    3: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(ZE, 3, "Totholz 10–30 % der Biomasse", { key: "totholzProzent", einheit: "%" })],
                        auge: { pose: "Ego im Altwald am selben Stamm (heute: die Wiese)", vorbild: "Bildreihe 0/10/40 Spieljahre am selben Stamm (Prüfer-Satz R11)" },
                        taeter: "foundry-core.js Totholz (zeitlose Gestalt)",
                        nicht: "Totholz ohne Zeit",
                        leser: "foundry-core.js:2045 __totholzSchnitt — Totholz als zeitlose Gestalt (Krone gebrochen, Reisig ab), keine Zerfallsklasse, die mit den Jahren fortschreitet",
                        // ZAHL (auge-klasse.cjs): die Station urteilt die Zahl, das Bild ist Beleg
                        zeuge: zeugeWelt(1, false),
                        gruen: gut({ totholzProzent: 18 }, 120),
                        attrappen: [{ name: "18 % aus der Forst-Inventur", roh: flach({ totholzProzent: 18 }) }],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(ZE, 4, "Pilzdichte 3–10 Tage nach Regen ≥ 5× Trockenzeit", { key: "pilzVerhaeltnis" })],
                        zeuge: zeugeWelt(10, true),
                        taeter: "stamm/vegetation-wiese.js _nahStreuArten (keine Pilz-Art)",
                        nicht: "keine Pilze",
                        leser: "stamm/vegetation-wiese.js:1249 _nahStreuArten — trägt keinen Pilz; kein Fruchtkörper nach Regen × Temperatur",
                        gruen: gut({ pilzVerhaeltnis: 6.5, pilzArten: 3 }, 40),
                        attrappen: [{ name: "Pilzdichte aus der Literatur", roh: flach({ pilzVerhaeltnis: 6.5, pilzArten: 3 }) }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(ZE, 5, "Streu-Halbwertzeit Tropen < 1 Jahr", { key: "hwTropenJahre", einheit: "Jahre" }), K.soll(ZE, 5, "Boreal > 5 Jahre", { key: "hwBorealJahre", einheit: "Jahre" })],
                        zeuge: zeugeWelt(2, true),
                        taeter: "stamm/vegetation-wiese.js _naehrstoffAt (EIN Skalar ohne Streu und Klima-Zone)",
                        nicht: "kein Boden-Profil je Zelle",
                        leser: "stamm/vegetation-wiese.js:2097 _naehrstoffAt — ein Nährstoff aus den Taten, keine Streu, kein Humus, kein Tempo nach Klima",
                        gruen: gut({ hwTropenJahre: 0.7, hwBorealJahre: 8, hwHierJahre: 2 }, 2),
                        attrappen: [{ name: "Halbwertzeiten aus der Literatur", roh: flach({ hwTropenJahre: 0.7, hwBorealJahre: 8, hwHierJahre: 2 }) }],
                    },
                    6: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(ZE, 6, "Fehlbetrag ≤ 1 %", { key: "fehlbetragProzent", einheit: "%" }), K.soll(ZE, 6, "Walfall-Gemeinschaft über 50 Spieljahre", { key: "walfallJahre", rel: "≥", zahl: 50, einheit: "a" })],
                        auge: { pose: "Tiefsee am Walfall (heute: die Wiese)", vorbild: "Walfall-Gemeinschaft über 50 Spieljahre in der Bildreihe (Prüfer-Satz R11)" },
                        taeter: "stamm/feld-leben.js _depositLife (das Leben-Feld verblasst, keine Bilanz)",
                        nicht: "keine Stoffbilanz, kein Walfall",
                        leser: "stamm/feld-leben.js:2047 _depositLife — schreibt Leben, das verblasst; kein Stoff wird gezählt, kein Meer-Kadaver",
                        // ZAHL (auge-klasse.cjs): die Station urteilt die Zahl, das Bild ist Beleg
                        zeuge: zeugeWelt(1, false),
                        gruen: gut({ fehlbetragProzent: 0.6, walfallJahre: 60 }, 240),
                        attrappen: [{ name: "Fehlbetrag behauptet", roh: flach({ fehlbetragProzent: 0.6 }) }],
                    },
                },
            },
            // ═══ DIE SUKZESSION: Brand, Rodung, Lava, Stadt, Front, viele Pfade — im Sandkasten der Taten ═══
            [SU]: {
                sek: 8,
                mutiert: true,
                pfad: PFAD_FELD,
                ungefahren: "die Bildpaare (S2 Yellowstone, S5 Stadt) — swiftshader schießt nicht",
                mess: async function (H, U, M) {
                    const seite = (fn, a) => H.seite("return await (" + fn.toString() + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    // DIE FOLGE: an Orten im Ring der Ankunft je ein Brand, eine Fällung und ein Lavastrom (`_tatSchreiben` in einer Kopie
                    // der Taten), je Spieljahr die Stufe (`_sukzession`), der Jungwuchs (`_baumAlter`), der Nährstoff und die Narbe —
                    // die Uhr nur für die Lesung gesetzt; am Ende die Taten, der Index und die Uhr der Welt zurück
                    const folge = async (r, T, a) => {
                        const s = r.state;
                        const A = r.constructor;
                        const wm = s.worldMeta;
                        const pm = s.playerMesh.position;
                        const cs = A.LIFE_FIELD.cell;
                        const jahrH = ((K) => (K.tagStunden * K.jahrK) / K.normS)(r._kalender());
                        const alt = { L0: wm.taten, nf: r._nachwuchsFaellig, sn: r._sukzessionNeu, idx: r._tatIdx, sz: s.spielZeit };
                        const stubs = ["_scheduleEditSave", "_nahStreuTat", "_weltRegt"].map((m) => [m, Object.prototype.hasOwnProperty.call(r, m), r[m]]);
                        const orte = [];
                        try {
                            for (const [m] of stubs) r[m] = () => {};
                            wm.taten = Array.isArray(alt.L0) ? alt.L0.slice() : [];
                            r._sukzessionNeu = [];
                            const h0 = r._weltStunde();
                            const bei = (j, f) => {
                                s.spielZeit = alt.sz + j * ((K) => (K.jahrK * K.tagS) / K.normS)(r._kalender());
                                try {
                                    return f();
                                } finally {
                                    s.spielZeit = alt.sz;
                                }
                            };
                            for (let i = 0; i < a.orte; i++) {
                                const w = (i / a.orte) * Math.PI * 2;
                                const d = a.abstand[i % a.abstand.length];
                                const x = Math.floor((pm.x + Math.cos(w) * d) / cs) * cs + cs / 2;
                                const z = Math.floor((pm.z + Math.sin(w) * d) / cs) * cs + cs / 2;
                                const naehrVor = r._naehrstoffAt(x, z);
                                const b = r._tatSchreiben("brand", x, z);
                                const f = r._tatSchreiben("faellen", x + 3 * cs, z);
                                const l = r._tatSchreiben("lava", x + 6 * cs, z);
                                const I = r._tatIndex();
                                const kurve = a.jahre.map((j) => {
                                    const sb = r._sukzession(b, h0 + j * jahrH);
                                    const sf = r._sukzession(f, h0 + j * jahrH);
                                    return {
                                        j,
                                        asche: sb.asche,
                                        busch: sb.busch,
                                        wald: sb.wald,
                                        stubben: sf.stubben,
                                        naehr: Math.round(bei(j, () => r._naehrstoffAt(x, z)) * 1000) / 1000,
                                        baum: bei(j, () => r._baumAlter(f.x, f.z)),
                                        lavaNarbe: Math.round(bei(j, () => r._narbeAt(l.x, l.z)) * 1000) / 1000,
                                    };
                                });
                                orte.push({ x: Math.round(x), z: Math.round(z), w: b.w, dauerBrandJ: Math.round((I.dauer.get(b) / jahrH) * 1000) / 1000, dauerFaellenJ: Math.round((I.dauer.get(f) / jahrH) * 1000) / 1000, naehrVor, kurve });
                            }
                        } finally {
                            wm.taten = alt.L0;
                            r._nachwuchsFaellig = alt.nf;
                            r._sukzessionNeu = alt.sn;
                            r._tatIdx = alt.idx;
                            s.spielZeit = alt.sz;
                            for (const [m, e, f] of stubs) {
                                if (e) r[m] = f;
                                else delete r[m];
                            }
                        }
                        const N = A.TAT_NARBE;
                        return { orte, klassen: Object.keys(N).filter((k) => N[k] && typeof N[k] === "object"), lavaTiefe: N.lava.tiefe, gebaeude: (s.architecture || []).length, wieder: wm.taten === alt.L0 };
                    };
                    const F = await seite(folge, { orte: 16, abstand: [40, 70, 100, 130], jahre: [0, 0.5, 1, 2, 3, 5, 10, 25, 100, 1000] });
                    const O = F.orte;
                    const at = (o, j) => o.kurve.find((k) => k.j === j);
                    const aus = M.teil || {};
                    // S1: die Folge in ihrer Ordnung (Asche liegt → Gras kehrt → Busch → Wald) und die Asche düngt
                    const ordnung = (o) => {
                        const t = (f) => {
                            const k = o.kurve.find(f);
                            return k ? k.j : Infinity;
                        };
                        const tA = t((k) => k.asche < 1);
                        const tG = t((k) => k.asche === 0);
                        const tB = t((k) => k.busch >= 1);
                        const tW = t((k) => k.wald >= 1);
                        return (tA <= tG) + (tG <= tB) + (tB <= tW) + (tW < Infinity);
                    };
                    const uebergaenge = Math.min(...O.map(ordnung));
                    const aschePlus = Math.round(Math.min(...O.map((o) => at(o, 0).naehr - o.naehrVor)) * 1000) / 1000;
                    const ws = O.map((o) => o.w);
                    const zg = { antworten: O.length, streuung: Math.round((Math.max(...ws) - Math.min(...ws)) * 1000) / 1000, vor: O[0].naehrVor, nach: at(O[0], 0).naehr, orte: O.map((o) => ({ w: o.w, brandJ: o.dauerBrandJ, faellenJ: o.dauerFaellenJ })) };
                    aus[1] = { werte: { uebergaengeInFolge: uebergaenge, aschePlus }, zeuge: Object.assign({ kurve0: O[0].kurve }, zg) };
                    const w25 = Math.round(Math.min(...O.map((o) => at(o, 25).wald)) * 1000) / 1000;
                    aus[2] = { werte: { jahre: 25, waldNach1: at(O[0], 1).wald, waldNach5: at(O[0], 5).wald, waldNach25: w25 }, zeuge: zg, auge: await M.auge("oeko-sukzession-s2", { ort: "wiese" }), nicht: "1 km² Waldbrand mit Überlebenden-Inseln — die Folge lebt je 16-m-Zelle (" + F.klassen.join(", ") + "); der Wald steht nach " + Math.min(...O.map((o) => o.dauerBrandJ)) + "–" + Math.max(...O.map((o) => o.dauerBrandJ)) + " Spieljahren wieder" };
                    const imBand = (o) => {
                        const k = o.kurve.find((q) => q.wald >= 0.5);
                        return k && k.j >= U[3].waldJahre[0] && k.j <= U[3].waldJahre[1];
                    };
                    const stoer = F.klassen.filter((k) => ["brand", "faellen"].includes(k)).length;
                    aus[3] = { werte: { stoerungsArten: stoer, saaten: O.length, imBandProzent: Math.round((100 * O.filter(imBand).length) / O.length) }, zeuge: zg, nicht: "5 Störungsarten — das Gedächtnis der Taten trägt eine Folge nach Brand und Fällung (TAT_NARBE: " + F.klassen.join(", ") + "); Flut, Lawine und Verlassen fehlen" };
                    const deck = (o, j) => Math.round((1 - at(o, j).lavaNarbe / F.lavaTiefe) * 1000) / 10;
                    aus[4] = { werte: { deckung10Prozent: deck(O[0], 10), deckung100Prozent: deck(O[0], 100), deckung1000Prozent: deck(O[0], 1000) }, zeuge: Object.assign({}, zg, { vor: at(O[0], 0).lavaNarbe, nach: at(O[0], 1000).lavaNarbe }), nicht: "keine Primärsukzession: die Narbe der Lava liegt nach 1 000 Spieljahren bei " + at(O[0], 1000).lavaNarbe + " (TAT_NARBE.lava ohne Ende)" };
                    aus[5] = { werte: { gebaeude: F.gebaeude, kronenAnstieg: 0 }, zeuge: { antworten: 1, streuung: 0 }, auge: await M.auge("oeko-sukzession-s5", { ort: "wiese" }), nicht: "keine verlassene Metropole — kein Verfall der Bauten, die Folge kennt nur Brand und Fällung (" + F.gebaeude + " Bauten im Verzeichnis)" };
                    const tNah = at(O[0], 0) ? O[0].dauerBrandJ : null;
                    aus[6] = { werte: { waldNahJahre: tNah, waldFernJahre: O[O.length - 1].dauerBrandJ }, zeuge: zg, nicht: "keine Wald-Front und keine Insel-Biogeographie — der Wald kehrt in jeder Narbe aus ihrer eigenen Dauer zurück, ohne Nachbarn (vegetation-wiese.js:2120)" };
                    const sig = (o) => o.kurve.map((k) => k.asche + "/" + k.busch + "/" + k.wald).join(" ");
                    let paare = 0;
                    let versch = 0;
                    for (let i = 0; i < O.length; i++)
                        for (let j = i + 1; j < O.length; j++) {
                            paare++;
                            if (sig(O[i]) !== sig(O[j])) versch++;
                        }
                    aus[7] = { werte: { stoerungen: stoer, imBandProzent: Math.round((100 * O.filter(imBand).length) / O.length), paareVerschiedenProzent: Math.round((100 * versch) / Math.max(1, paare)) }, zeuge: zg, nicht: "4 Störungen auf jedem Planeten — " + stoer + " mit Folge; die Kurven sind EINE Rampe, gestreckt nach dem Wuchs des Orts" };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: {},
                        soll: [
                            K.soll(SU, 1, "Halm-, Asche- und Sämling-Zahlen über die Zeit im Fenster", { key: "uebergaengeInFolge", rel: "≥", zahl: 4, refQuelle: "die Tiefe der Karte: Brand → Asche → Gras → Busch → Wald — 4 Übergänge in dieser Ordnung" }),
                            K.soll(SU, 1, "Halm-, Asche- und Sämling-Zahlen über die Zeit im Fenster", { key: "aschePlus", rel: ">", zahl: 0, refQuelle: "die Tiefe der Karte: Asche düngt — der Nährstoff jedes Orts steigt mit dem Brand über seinen Grund (Zunahme > 0)" }),
                        ],
                        zeuge: zeugeWelt(8, true),
                        taeter: "stamm/vegetation-wiese.js _sukzession · stamm/feld-leben.js _tatSchreiben",
                        unklar: "der Richter nennt keine Zahl — gemessen wird die Ordnung der Folge und die Düngung der Asche; Vorschlag: Halme nach der Heilung ≥ 80 % des Vorbrands, Sämling ≥ 1",
                        gruen: gut({ uebergaengeInFolge: 4, aschePlus: 0.4 }, 16),
                        attrappen: [
                            { name: "die Folge aus dem Kommentar", roh: flach({ uebergaengeInFolge: 4, aschePlus: 0.4 }) },
                            { name: "der Brand schrieb nichts (vor = nach)", roh: still({ uebergaengeInFolge: 4, aschePlus: 0.4 }, 16) },
                        ],
                    },
                    2: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(SU, 2, "Bildpaar nach 1/5/25 Spieljahren", { key: "jahre", rel: "≥", zahl: 25, einheit: "Spieljahre" })],
                        auge: { pose: "Überflug über der Brandfläche (heute: Ego an der Wiese)", vorbild: "Yellowstone-1988-Fotoreihe nach 1/5/25 Jahren (Prüfer-Satz R11)" },
                        taeter: "stamm/feld-brand.js _brandEntfachen (kein Flächenbrand mit Inseln in der Folge)",
                        nicht: "kein 1-km²-Brand mit Überlebenden-Inseln",
                        leser: "stamm/vegetation-wiese.js:2120 _sukzession — EINE Rampe je Zelle, kein Feuer-Regime je Biom, keine Überlebenden",
                        gruen: gut({ jahre: 25, waldNach1: 0, waldNach5: 0.25, waldNach25: 0.75 }, 16),
                        attrappen: [{ name: "Yellowstone-Reihe ohne Lauf", roh: flach({ jahre: 25, waldNach1: 0, waldNach5: 0.25, waldNach25: 0.75 }) }],
                    },
                    3: {
                        u: { waldJahre: [10, 100] },
                        soll: [
                            K.soll(SU, 3, "5 Arten × 8 Saaten", { key: "stoerungsArten", rel: "≥", zahl: 5 }),
                            K.soll(SU, 3, "5 Arten × 8 Saaten", { key: "saaten", rel: "≥", zahl: 8 }),
                            K.soll(SU, 3, "Deckungs-Kurven im Band realer Chronosequenzen ≥ 80 %", { key: "imBandProzent", einheit: "%" }),
                        ],
                        zeuge: zeugeWelt(8, true),
                        taeter: "stamm/feld-leben.js TAT_NARBE (Folge nur nach Brand und Fällung)",
                        nicht: "nur 2 von 5 Störungsarten",
                        leser: "stamm/feld-leben.js:3098 TAT_NARBE — kennt keine Flut, Lawine und kein Verlassen; stamm/vegetation-wiese.js:2120 _sukzession — hängt an keiner Samenbank",
                        unklar: "„Band realer Chronosequenzen“ ohne Zahl — gesetzt Wald-Deckung ≥ 50 % nach 10–100 Jahren; Vorschlag: die Chronosequenzen als Tafel in die Karte",
                        gruen: gut({ stoerungsArten: 5, saaten: 8, imBandProzent: 85 }, 40),
                        attrappen: [{ name: "Kurven aus Chronosequenzen abgeschrieben", roh: flach({ stoerungsArten: 5, saaten: 8, imBandProzent: 85 }) }],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(SU, 4, "im Band der Hawaii-Chronosequenz", { key: "deckung1000Prozent", rel: "≥", zahl: 50, refQuelle: "Hawaii-Chronosequenz (Vitousek 2004, Nutrient Cycling and Limitation: Hawai'i as a Model System): geschlossener Wald auf Lava nach ≤ 1 000 Jahren" })],
                        zeuge: zeugeWelt(8, true),
                        taeter: "stamm/feld-leben.js TAT_NARBE.lava (stunden ∞: die Lava bleibt Stein)",
                        nicht: "keine Primärsukzession",
                        leser: "stamm/feld-leben.js:3103 TAT_NARBE.lava — heilt nie; keine Flechte, kein Moos, kein Farn auf Fels",
                        unklar: "das Band der Hawaii-Chronosequenz ohne Zahl — gesetzt Deckung ≥ 50 % nach 1 000 Jahren",
                        gruen: gut({ deckung10Prozent: 5, deckung100Prozent: 40, deckung1000Prozent: 85 }, 16),
                        attrappen: [{ name: "Hawaii-Zahlen ohne Lava", roh: flach({ deckung10Prozent: 5, deckung100Prozent: 40, deckung1000Prozent: 85 }) }],
                    },
                    5: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(SU, 5, "Kronendeckung steigt", { key: "kronenAnstieg", rel: ">", zahl: 0, refQuelle: "der Richter: Kronendeckung steigt über 0/30/100 Jahre (Zunahme > 0)" })],
                        auge: { pose: "die Stadt im Bild (heute: Ego an der Wiese)", vorbild: "Bildpaar 0/30/100 Jahre gegen Fotoreihen verlassener Städte (Prüfer-Satz R11)" },
                        taeter: "stamm/siedlung-*.js (kein Verfall der Bauten)",
                        nicht: "keine verlassene Metropole",
                        leser: "stamm/vegetation-wiese.js:2120 _sukzession — kennt keine Stadt; kein Leser lässt Dächer fallen oder Asphalt sprengen",
                        gruen: gut({ gebaeude: 12000, kronenAnstieg: 0.4 }, 10),
                        attrappen: [{ name: "Fotoreihe ohne Stadt", roh: flach({ gebaeude: 12000, kronenAnstieg: 0.4 }) }],
                    },
                    6: {
                        u: {},
                        soll: [K.soll(SU, 6, "Wald-Front 100–1 000 m/Jahr", { key: "waldFrontMJahr", einheit: "m/Jahr" })],
                        zeuge: zeugeWelt(8, true),
                        taeter: "stamm/vegetation-wiese.js _sukzession (keine Ausbreitung von Nachbarn)",
                        nicht: "keine Wald-Front, keine Insel",
                        leser: "stamm/vegetation-wiese.js:2120 _sukzession — liest keine Nachbar-Zelle; kein Zuzug, kein Aussterben nach Größe und Abstand",
                        gruen: gut({ waldFrontMJahr: 320 }, 16),
                        attrappen: [{ name: "Pollen-Profil abgeschrieben", roh: flach({ waldFrontMJahr: 320 }) }],
                    },
                    7: {
                        u: {},
                        soll: [
                            K.soll(SU, 7, "16 Saaten × 4 Störungen", { key: "stoerungen", rel: "≥", zahl: 4 }),
                            K.soll(SU, 7, "≥ 90 % im Band realer Chronosequenzen", { key: "imBandProzent", einheit: "%" }),
                            K.soll(SU, 7, "paarweise verschieden", { key: "paareVerschiedenProzent", rel: "≥", zahl: 100, refQuelle: "der Richter: paarweise verschieden — jedes Paar der Kurven (100 %)" }),
                        ],
                        zeuge: zeugeWelt(16, true),
                        taeter: "stamm/vegetation-wiese.js _sukzession (EINE Rampe, nur gestreckt)",
                        nicht: "4 Störungen auf jedem Planeten",
                        leser: "stamm/feld-leben.js:3098 TAT_NARBE — Folge nur nach Brand und Fällung; kein Rückschlag, kein Pfad aus der Ausgangslage",
                        gruen: gut({ stoerungen: 4, imBandProzent: 92, paareVerschiedenProzent: 100 }, 64),
                        attrappen: [{ name: "verschiedene Kurven behauptet", roh: flach({ stoerungen: 4, imBandProzent: 92, paareVerschiedenProzent: 100 }) }],
                    },
                },
            },
            // ═══ DIE STOFFE: Nährstoff je Zelle, N und P, Kohlenstoff, CO₂-Säge, Regen aus Wald, Sauerstoff, Biosignatur ═══
            [ST]: {
                sek: 25,
                mutiert: true,
                pfad: PFAD_FELD.concat(PFAD_PLANET),
                ungefahren: "die Bildpaare (S1 Acker, S2 Wiesen, S6 Bändereisen) — swiftshader schießt nicht",
                mess: async function (H, U, M) {
                    const seite = (fn, a) => H.seite("return await (" + fn.toString() + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    const ernte = async (r, T, a) => {
                        const s = r.state;
                        const A = r.constructor;
                        const wm = s.worldMeta;
                        const pm = s.playerMesh.position;
                        const cs = A.LIFE_FIELD.cell;
                        const alt = { L0: wm.taten, nf: r._nachwuchsFaellig, sn: r._sukzessionNeu, idx: r._tatIdx };
                        const stubs = ["_scheduleEditSave", "_nahStreuTat", "_weltRegt"].map((m) => [m, Object.prototype.hasOwnProperty.call(r, m), r[m]]);
                        const orte = [];
                        try {
                            for (const [m] of stubs) r[m] = () => {};
                            wm.taten = Array.isArray(alt.L0) ? alt.L0.slice() : [];
                            r._sukzessionNeu = [];
                            for (let i = 0; i < a.orte; i++) {
                                const w = (i / a.orte) * Math.PI * 2;
                                const x = Math.floor((pm.x + Math.cos(w) * a.abstand) / cs) * cs + cs / 2;
                                const z = Math.floor((pm.z + Math.sin(w) * a.abstand) / cs) * cs + cs / 2;
                                const vor = r._naehrstoffAt(x, z);
                                const wv = r._wuchsAt(x, z);
                                for (let k = 0; k < a.ernten; k++) r._tatSchreiben("ernten", x, z);
                                orte.push({ vor, nach: r._naehrstoffAt(x, z), wv, wn: r._wuchsAt(x, z) });
                            }
                        } finally {
                            wm.taten = alt.L0;
                            r._nachwuchsFaellig = alt.nf;
                            r._sukzessionNeu = alt.sn;
                            r._tatIdx = alt.idx;
                            for (const [m, e, f] of stubs) {
                                if (e) r[m] = f;
                                else delete r[m];
                            }
                        }
                        return { orte, kanal: typeof r._naehrstoffAt(pm.x, pm.z), wieder: wm.taten === alt.L0 };
                    };
                    const faden = async (r, T, a) => {
                        await r._fadenQuelle();
                        const samen = r.state.worldMeta.seed;
                        const frag = (o) => r._planetAuftrag(Object.assign({ type: "planet-ort", samen, laenge: 10, zeitMa: 0 }, o));
                        const heute = await Promise.all(a.breiten.map((b) => frag({ breite: b })));
                        // die Äonen und die fremden Samen kosten je einen Plan des Planeten (ein fremder Same ~13 s beim ersten Mal):
                        // nacheinander, solange das Budget reicht — gezählt wird, was die Welt beantwortete
                        const t0 = performance.now();
                        const fehler = [];
                        const versuch = async (o) => {
                            try {
                                return await frag(o);
                            } catch (e) {
                                fehler.push(String((e && e.message) || e).slice(0, 160));
                                return null;
                            }
                        };
                        const frueh = [];
                        for (const t of a.zeiten) if (performance.now() - t0 < a.budgetMs) frueh.push(await versuch({ breite: 20, zeitMa: t }));
                        const fremd = [];
                        for (let i = 0; i < a.fremd && performance.now() - t0 < a.budgetMs; i++) fremd.push(await versuch({ samen: "oeko-fremd-" + (i + 1), breite: 20 }));
                        frueh.splice(0, frueh.length, ...frueh.filter(Boolean));
                        fremd.splice(0, fremd.length, ...fremd.filter(Boolean));
                        const schl = new Set();
                        const walk = (o, p) => {
                            if (o && typeof o === "object") for (const k of Object.keys(o)) (schl.add(p + k), walk(o[k], p + k + "."));
                        };
                        heute.concat(frueh, fremd).forEach((x) => walk(x, ""));
                        const gas = [...schl].filter((k) => /co2|kohlen|carbon|sauer|o2\b|oxy|methan|stick|nitro|phosph|atmo|gas|bio/i.test(k));
                        return { gas, fehler, schluessel: schl.size, fremdN: fremd.length, fruehN: frueh.length, ms: Math.round(performance.now() - t0), hoehen: heute.concat(fremd).map((x) => x.hoeheM), regen: heute.map((x) => (x.delta && x.delta.wetter ? x.delta.wetter.regenQuote : null)), wald: heute.map((x) => (x.delta && x.delta.wuchs ? x.delta.wuchs.wald : null)), fruehLand: frueh.map((x) => x.land), n: heute.length + frueh.length + fremd.length };
                    };
                    const E = await seite(ernte, { orte: 8, abstand: 45, ernten: 15 });
                    const P = await seite(faden, { breiten: [-60, -45, -20, 0, 20, 45, 60], zeiten: [-2500, -2000], fremd: 32, budgetMs: 14000 });
                    const O = E.orte;
                    const vor = Math.min(...O.map((o) => o.vor));
                    const nach = Math.max(...O.map((o) => o.nach));
                    const wMinus = Math.min(...O.map((o) => (o.wv - o.wn) / Math.max(1e-9, o.wv)));
                    const aus = M.teil || {};
                    const ws = O.map((o) => o.wv);
                    aus[1] = { werte: { naehrVor: Math.round(vor * 1000) / 1000, naehrNach: Math.round(nach * 1000) / 1000, wuchsMinus: Math.round(wMinus * 1e4) / 1e4 }, zeuge: { antworten: O.length, streuung: Math.round((Math.max(...ws) - Math.min(...ws)) * 1e4) / 1e4, vor: Math.round(vor * 1000) / 1000, nach: Math.round(nach * 1000) / 1000, orte: O }, auge: await M.auge("oeko-stoffe-s1", { ort: "wiese" }) };
                    aus[2] = { werte: { naehrKanaele: E.kanal === "number" ? 1 : 0, jahre: 0 }, zeuge: { antworten: O.length, streuung: 0 }, auge: await M.auge("oeko-stoffe-s2", { ort: "wiese" }), nicht: "N und P getrennt — der Boden trägt EINEN Nährstoff (vegetation-wiese.js:2097), keine Leguminose, keine Erle bindet N" };
                    const zg = { antworten: P.n, streuung: Math.round((Math.max(...P.hoehen) - Math.min(...P.hoehen)) * 10) / 10, gas: P.gas, schluessel: P.schluessel };
                    aus[3] = { werte: { cKanaele: P.gas.length }, zeuge: zg, nicht: "kein Kohlenstoff: weder die Zelle noch der Planet-Faden trägt Biomasse oder Boden-C (" + P.schluessel + " Schlüssel der Antwort, davon Stoff: " + (P.gas.join(", ") || "keiner") + ")" };
                    aus[4] = { werte: { gasKanaele: P.gas.length }, zeuge: zg, nicht: "keine CO₂-Säge: keine Atmosphäre aus Stoffen im Planet-Faden (" + P.gas.length + " Stoff-Schlüssel)" };
                    aus[5] = { werte: { rodungEingang: 0 }, zeuge: Object.assign({ regen: P.regen, wald: P.wald }, zg), nicht: "keine Rodung im Planet-Faden: der Wald ist dort Ausgabe (delta.wuchs.wald), der Regen liest ihn nicht — kein Gegenlauf möglich" };
                    aus[6] = { werte: { o2Kanaele: P.gas.length, saatenProzent: 0 }, zeuge: Object.assign({ frueh: P.fruehLand, fehler: P.fehler }, zg), auge: await M.auge("oeko-stoffe-s6", { ort: "wiese" }), nicht: "kein Sauerstoff über die Äonen — der Planet-Faden antwortet bei −2 500 und −2 000 Ma (" + P.fruehN + " Antworten) mit Land und Höhe, ohne Atmosphäre und ohne Bändereisen" };
                    aus[7] = { werte: { saaten: P.fremdN, biosignaturen: P.gas.length }, zeuge: Object.assign({ ms: P.ms, fehler: P.fehler }, zg), nicht: "keine fremde Biochemie: " + P.fremdN + " fremde Samen (im Budget von 14 s, ein Plan je Same) antworten mit Gelände, keine Atmosphäre im Ungleichgewicht, keine Bilanz" };
                    return { sprossen: aus };
                },
                sprossen: {
                    1: {
                        u: { ernten: 15, auge: { ort: "wiese" } },
                        soll: [
                            K.soll(ST, 1, "Ernte 15× → Nährstoff 1 → 0,7", { key: "naehrVor", rel: "=", zahl: 1 }),
                            K.soll(ST, 1, "Ernte 15× → Nährstoff 1 → 0,7", { key: "naehrNach", rel: "≤", zahl: 0.7 }),
                            K.soll(ST, 1, "Wuchs sinkt sichtbar im Bildpaar", { key: "wuchsMinus", rel: ">", zahl: 0, refQuelle: "der Richter: Wuchs sinkt — die Abnahme des Wuchses nach 15 Ernten > 0" }),
                        ],
                        auge: { pose: "Ego am Acker der Wiese vor und nach 15 Ernten", vorbild: "Bildpaar gleicher Kamera: Wuchs sinkt sichtbar (Prüfer-Satz R11)" },
                        taeter: "stamm/vegetation-wiese.js _naehrstoffAt · _wuchsAt",
                        // ZAHL (auge-klasse.cjs): die Station urteilt die Zahl, das Bild ist Beleg
                        zeuge: zeugeWelt(1, true),
                        gruen: gut({ naehrVor: 1, naehrNach: 0.7, wuchsMinus: 0.05 }, 8),
                        attrappen: [{ name: "0,7 aus dem Beleg ohne Ernte", roh: flach({ naehrVor: 1, naehrNach: 0.7, wuchsMinus: 0.05 }) }],
                    },
                    2: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(ST, 2, "nach 5 Spieljahren", { key: "jahre", rel: "≥", zahl: 5 }), K.soll(ST, 2, "Wuchs-Unterschied", { key: "wuchsUnterschied", rel: ">", zahl: 0, refQuelle: "der Richter: Wuchs-Unterschied Klee gegen ohne > 0" })],
                        auge: { pose: "Ego zwischen zwei Wiesen (mit und ohne Klee)", vorbild: "Bildpaar nach 5 Spieljahren: Wuchs-Unterschied (Prüfer-Satz R11)" },
                        taeter: "stamm/vegetation-wiese.js _naehrstoffAt (EIN Skalar, kein N und P)",
                        nicht: "N und P nicht getrennt",
                        leser: "stamm/vegetation-wiese.js:2097 _naehrstoffAt — ein Nährstoff; keine Bindung von N durch Leguminosen, kein P aus Gestein",
                        // ZAHL (auge-klasse.cjs): die Station urteilt die Zahl, das Bild ist Beleg
                        zeuge: zeugeWelt(1, true),
                        gruen: gut({ jahre: 5, wuchsUnterschied: 0.2, naehrKanaele: 2 }, 8),
                        attrappen: [{ name: "Klee-Effekt behauptet", roh: flach({ jahre: 5, wuchsUnterschied: 0.2, naehrKanaele: 2 }) }],
                    },
                    3: {
                        u: {},
                        soll: [
                            K.soll(ST, 3, "Tropenwald ~200 t C", { key: "cTropenwald", einheit: "t C/ha" }),
                            K.soll(ST, 3, "Steppe ~10 t", { key: "cSteppe", einheit: "t C/ha" }),
                        ],
                        zeuge: zeugeWelt(10, true),
                        taeter: "stamm/vegetation-wiese.js _naehrstoffAt · planet-core.js planetOrt (kein Kohlenstoff)",
                        nicht: "kein Kohlenstoff",
                        leser: "planet-core.js:2290 planetOrt — trägt keinen Kohlenstoff; stamm/vegetation-wiese.js:2097 _naehrstoffAt — keine Biomasse je Zelle",
                        unklar: "„~“ ohne Toleranz — die Station urteilt nach der Zahl des Worts (= 200 und = 10 t C/ha); Vorschlag: die Breite des Bands (z. B. ±25 %) in die Karte",
                        gruen: gut({ cTropenwald: 200, cSteppe: 10 }, 12),
                        attrappen: [{ name: "IPCC-Tafel abgeschrieben", roh: flach({ cTropenwald: 200, cSteppe: 10 }) }],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(ST, 4, "Amplitude nördlich > südlich", { key: "ampNordMinusSued", rel: ">", zahl: 0, refQuelle: "die Mauna-Loa-Kurve: Amplitude nördlich − südlich > 0" })],
                        zeuge: zeugeWelt(10, true),
                        taeter: "planet-core.js planetOrt (keine Atmosphäre aus Stoffen)",
                        nicht: "keine CO₂-Säge",
                        leser: "planet-core.js:2290 planetOrt — kennt kein CO₂ und kein Laub-Jahr des Kontinents",
                        gruen: gut({ ampNordMinusSued: 6 }, 12),
                        attrappen: [{ name: "Mauna Loa abgeschrieben", roh: flach({ ampNordMinusSued: 6 }) }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(ST, 5, "Intervall ohne 0", { key: "kiOben", rel: "<", zahl: 0 })],
                        zeuge: zeugeWelt(8, true),
                        taeter: "planet-core.js planetOrt (der Regen liest den Wald nicht)",
                        nicht: "keine Rodung, kein Wald-Regen",
                        leser: "planet-core.js:2143 pflanzenDeckung — der Wuchs folgt dem Niederschlag (N / PET), der Niederschlag nie dem Wald",
                        gruen: gut({ kiOben: -0.03 }, 8),
                        attrappen: [{ name: "Intervall einer Studie", roh: flach({ kiOben: -0.03 }) }],
                    },
                    6: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(ST, 6, "in ≥ 70 % erdähnlicher Saaten", { key: "saatenProzent", einheit: "%" }), K.soll(ST, 6, "Sauerstoff-Sprung im Fenster 2,5–2,0 Mrd. Jahre", { key: "sprungGa", rel: "band", zahl: 2, bis: 2.5, einheit: "Ga" }), K.soll(ST, 6, "Bändereisen im Gestein sichtbar", { key: "baendereisen", rel: ">", zahl: 0, refQuelle: "der Richter: Bändereisen im Gestein sichtbar (Bändereisen-Lagen im Aufschluss > 0)" })],
                        auge: { pose: "Gestein der Wiese (Aufschluss)", vorbild: "Bändereisen im Gestein sichtbar (Prüfer-Satz R11)" },
                        taeter: "planet-core.js planetOrt (keine Atmosphäre über die Äonen)",
                        nicht: "kein Sauerstoff-Sprung",
                        leser: "planet-core.js:2290 planetOrt — liest die Zeit für das Gelände, keine Photosynthese, kein Eisen, kein Methan",
                        // ZAHL (auge-klasse.cjs): die Station urteilt die Zahl, das Bild ist Beleg
                        zeuge: zeugeWelt(1, false),
                        gruen: gut({ saatenProzent: 75, sprungGa: 2.3, baendereisen: 3 }, 32),
                        attrappen: [{ name: "GOE aus dem Lehrbuch", roh: flach({ saatenProzent: 75, sprungGa: 2.3 }) }],
                    },
                    7: {
                        u: {},
                        soll: [K.soll(ST, 7, "32 fremde Saaten", { key: "saaten", rel: "≥", zahl: 32 }), K.soll(ST, 7, "Bilanzfehler ≤ 1 %", { key: "bilanzFehlerProzent", einheit: "%" })],
                        zeuge: zeugeWelt(32, true),
                        taeter: "planet-core.js planetOrt (keine Biochemie)",
                        nicht: "keine fremde Biochemie",
                        leser: "planet-core.js:2290 planetOrt — trägt keine Atmosphäre und keine Stoffbilanz je Samen",
                        gruen: gut({ saaten: 32, bilanzFehlerProzent: 0.7, biosignaturen: 3 }, 32),
                        attrappen: [{ name: "Biosignatur behauptet", roh: flach({ saaten: 32, bilanzFehlerProzent: 0.7, biosignaturen: 3 }) }],
                    },
                },
            },
            // ═══ DIE PARTNER: Bestäubung beidseits, Pilz-Partner, Seuche, Ko-Evolution, Riff, Mutualisten ═══
            [PA]: {
                sek: 8,
                mutiert: true,
                pfad: PFAD_TIER.concat(["stamm/vegetation-wiese.js", "stamm/bild-himmel.js"]),
                ungefahren: "die Bildpaare (S2 Blüten, S6 Riff) — swiftshader schießt nicht",
                mess: async function (H, U, M) {
                    const seite = (fn, a) => H.seite("return await (" + fn.toString() + ")(r, T, " + JSON.stringify(a || {}) + ");");
                    // DIE BLÜTEN IM GEGENLAUF: die Blumen der Nah-Streu im Hektar der Ankunft heute und ein Spieljahr später, einmal mit
                    // dem Gesetz der Bestäuber und einmal ohne (ihr Besuch auf 0, keine Gäste) — die Uhr nur für die Lesung gesetzt;
                    // dazu der Wuchs im Schatten der Kronen und die Fische
                    const partner = async (r, T, a) => {
                        const s = r.state;
                        const A = r.constructor;
                        const pm = s.playerMesh.position;
                        const KA = A.NAH_STREU.kachel;
                        // der Boden der Kacheln muss stehen, bevor gezählt wird (vegetation-wiese.js:1312) — gewartet VOR jedem Tausch
                        let warte = 0;
                        for (; warte < 100; warte++) {
                            const ar = r._nahStreuArten();
                            if (ar && [[0, 0], [-1, -1], [1, 1], [-1, 1], [1, -1]].every(([u, v]) => r._nahStreuKachel(Math.floor((pm.x + u * (a.halb - 4)) / KA), Math.floor((pm.z + v * (a.halb - 4)) / KA), ar))) break;
                            await new Promise((f) => setTimeout(f, 50));
                        }
                        const arten = r._nahStreuArten();
                        const blume = new Set(arten.map((x, i) => (x.kind === "flower" ? i : -1)).filter((i) => i >= 0));
                        const zaehle = () => {
                            let n = 0;
                            let k = 0;
                            for (let x = pm.x - a.halb; x < pm.x + a.halb; x += KA)
                                for (let z = pm.z - a.halb; z < pm.z + a.halb; z += KA) {
                                    const t = r._nahStreuKachel(Math.floor(x / KA), Math.floor(z / KA), arten);
                                    if (!t) continue;
                                    k++;
                                    for (const it of t.items) if (blume.has(it.art)) n++;
                                }
                            return { n, k };
                        };
                        const altSz = s.spielZeit;
                        const altBG = A._bestaeuberGesetz;
                        const altL = r._bestaeuberListe;
                        const aus = { streuBereit: warte < 100 ? 1 : 0, streuWarteMs: warte * 50 };
                        try {
                            aus.heute = zaehle();
                            s.spielZeit = altSz + ((K) => (K.jahrK * K.tagS) / K.normS)(r._kalender());
                            aus.folgeMit = zaehle();
                            A._bestaeuberGesetz = () => Object.assign({}, altBG.call(A), { besuch: () => 0, aktiv: () => 0 });
                            r._bestaeuberListe = [];
                            aus.folgeOhne = zaehle();
                        } finally {
                            A._bestaeuberGesetz = altBG;
                            r._bestaeuberListe = altL;
                            s.spielZeit = altSz;
                        }
                        const schatten = [];
                        for (let i = 0; i < a.punkte; i++) {
                            const w = i * 2.399963;
                            const d = 8 + (i % 20) * 7;
                            const x = pm.x + Math.cos(w) * d;
                            const z = pm.z + Math.sin(w) * d;
                            const licht = r._bodenLichtFeld(x, z, x, z)(x, z);
                            if (licht < a.schattenLicht) schatten.push({ licht: Math.round(licht * 1000) / 1000, wuchs: Math.round(r._wuchsAt(x, z) * 1e4) / 1e4 });
                        }
                        aus.schatten = schatten;
                        const fk = r._fischKarte;
                        aus.fische = fk ? { zellen: fk.zellen ? fk.zellen.size : 0, liste: (fk.liste || []).length } : null;
                        const BG = A._bestaeuberGesetz();
                        aus.bestaeuberLeib = Object.keys(BG.B.leib || {});
                        aus.gattungen = Object.keys(A._lebensraumGesetz().L.gattung);
                        aus.bestandSchluessel = Object.keys(A._bestandGesetz().B);
                        aus.streuArten = arten.map((x) => x.id + ":" + x.kind);
                        return aus;
                    };
                    const P = await seite(partner, { halb: 50, punkte: 200, schattenLicht: 0.35 });
                    const aus = M.teil || {};
                    const minus = P.streuBereit && P.folgeMit.n > 0 ? Math.round((1000 * (P.folgeMit.n - P.folgeOhne.n)) / P.folgeMit.n) / 10 : null;
                    aus[2] = { werte: minus === null ? {} : { blutenMinusProzent: minus, blueten: P.heute.n }, zeuge: { antworten: P.streuBereit ? P.heute.k : 0, streuung: P.heute.n > 0 ? 1 : 0, vor: P.folgeMit.n, nach: P.folgeOhne.n, streuBereit: P.streuBereit, streuWarteMs: P.streuWarteMs }, auge: await M.auge("oeko-partner-s2", { ort: "wiese" }) };
                    if (minus === 0) aus[2].nicht = "Einbahn: ohne Bestäuber stehen im Folgejahr " + P.folgeOhne.n + " von " + P.folgeMit.n + " Blüten — die Nah-Streu (vegetation-wiese.js:1249) liest keinen Besuch";
                    const wz = P.schatten.map((x) => x.wuchs);
                    aus[3] = { werte: { wuchsMinusProzent: 0, wuchsSchatten: wz.length ? Math.round((1e4 * wz.reduce((q, x) => q + x, 0)) / wz.length) / 1e4 : -1 }, zeuge: { antworten: P.schatten.length, streuung: wz.length ? Math.max(...wz) - Math.min(...wz) : 0, vor: 1, nach: 1, schatten: P.schatten.slice(0, 12) }, nicht: "kein Pilz-Partner: der Wuchs im Schatten (" + P.schatten.length + " Punkte) liest Feuchte, Licht und Nährstoff, keinen Pilz — kein Gegenlauf zu kappen" };
                    aus[4] = { werte: { erreger: P.bestandSchluessel.filter((k) => /seuch|erreger|krank|infekt|para/i.test(k)).length }, zeuge: { antworten: P.gattungen.length, streuung: 0 }, nicht: "kein Erreger: das Bestand-Gesetz trägt " + P.bestandSchluessel.join(", ") + " — keine Ansteckung über einer Dichte" };
                    aus[5] = { werte: { merkmaleRuessel: P.bestaeuberLeib.filter((k) => /ruessel|zunge|rohr/i.test(k)).length }, zeuge: { antworten: P.bestaeuberLeib.length, streuung: 0, leib: P.bestaeuberLeib }, nicht: "keine Ko-Evolution: der Bestäuber trägt " + P.bestaeuberLeib.join(", ") + ", keine Rüssellänge; die Blüte keine Kronröhre" };
                    aus[6] = { werte: { fischArten: P.fische ? 1 : 0 }, zeuge: { antworten: P.fische ? P.fische.zellen : 0, streuung: 0, fische: P.fische }, auge: await M.auge("oeko-partner-s6", { ort: "wiese" }), nicht: "kein Riff, keine Flechte als Lebensraum — das Fisch-Gesetz kennt EINE Gestalt ohne Wärme-Kipp-Punkt" };
                    const nArten = P.gattungen.length + P.streuArten.length + 2;
                    aus[7] = { werte: { mutualistProzent: 0, arten: nArten }, zeuge: { antworten: nArten, streuung: 1, vor: P.folgeMit.n, nach: P.folgeOhne.n }, nicht: "10⁶+ Arten mit Partnern — " + nArten + " Arten in der Welt, keine mit einem Mutualisten (die Blüte merkt den Besuch nicht)" };
                    return { sprossen: aus };
                },
                sprossen: {
                    2: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(PA, 2, "Blüten-Dichte im Folgejahr −≥ 30 %", { key: "blutenMinusProzent", einheit: "%" })],
                        auge: { pose: "Ego an der Mess-Wiese, dieselbe Kamera im Folgejahr mit und ohne Bestäuber", vorbild: "Bildpaar: Blüten-Dichte im Folgejahr −≥ 30 % ohne Bestäuber (Prüfer-Satz R11)" },
                        taeter: "stamm/vegetation-wiese.js _nahStreuKachel (die Blüte liest keinen Besuch)",
                        leser: "stamm/kreatur-fauna.js:656 _bestaeuberBlueten — liest die Blüten, nie umgekehrt; kein Samenansatz aus dem Besuch",
                        // ZAHL (auge-klasse.cjs): die Station urteilt die Zahl, das Bild ist Beleg
                        zeuge: zeugeWelt(1, true),
                        gruen: gut({ blutenMinusProzent: 41, blueten: 180 }, 600),
                        attrappen: [{ name: "−41 % aus einer Studie", roh: flach({ blutenMinusProzent: 41, blueten: 180 }) }],
                    },
                    3: {
                        u: {},
                        soll: [K.soll(PA, 3, "Sämlinge im Schatten −≥ 30 % Wuchs", { key: "wuchsMinusProzent", einheit: "%" })],
                        zeuge: zeugeWelt(5, true),
                        taeter: "stamm/vegetation-wiese.js _wuchsAt (kein Pilz-Partner)",
                        nicht: "kein Pilz-Partner",
                        leser: "stamm/vegetation-wiese.js:2078 _wuchsAt — liest Feuchte × Licht × Nährstoff, kein Netz der Pilze",
                        gruen: gut({ wuchsMinusProzent: 38, wuchsSchatten: 0.21 }, 20),
                        attrappen: [
                            { name: "−38 % behauptet ohne Gegenlauf", roh: flach({ wuchsMinusProzent: 38, wuchsSchatten: 0.21 }) },
                            { name: "Gegenlauf ohne Wirkung (vor = nach)", roh: still({ wuchsMinusProzent: 38, wuchsSchatten: 0.21 }, 20) },
                        ],
                    },
                    4: {
                        u: {},
                        soll: [K.soll(PA, 4, "8 Saaten beidseits der Schwelle", { key: "saaten", rel: "≥", zahl: 8 }), K.soll(PA, 4, "Ausbruchskurve mit R₀ im Band", { key: "r0", rel: "band", zahl: 1, bis: 20, refQuelle: "Anderson & May 1991 (Infectious Diseases of Humans): R₀ realer Erreger ≈ 1–20" })],
                        zeuge: zeugeWelt(8, true),
                        taeter: "tetrapoda-core.js BESTAND_GESETZ (kein Erreger)",
                        nicht: "kein Erreger",
                        leser: "tetrapoda-core.js:2197 BESTAND_GESETZ — trägt Geburt, Tod, Fraß und Riss, keine Ansteckung",
                        unklar: "„R₀ im Band“ ohne Zahl — gesetzt 1–20 (Anderson & May 1991)",
                        gruen: gut({ saaten: 8, r0: 2.4 }, 16),
                        attrappen: [{ name: "R₀ aus der Literatur", roh: flach({ saaten: 8, r0: 2.4 }) }],
                    },
                    5: {
                        u: {},
                        soll: [K.soll(PA, 5, "Rüssellänge ↔ Kronröhre r ≥ 0,7", { key: "rRuessel" }), K.soll(PA, 5, "Laufgeschwindigkeit beider steigt korreliert", { key: "rLauf", rel: ">", zahl: 0, refQuelle: "der Richter: Laufgeschwindigkeit beider steigt korreliert (r > 0)" })],
                        zeuge: zeugeWelt(10, true),
                        taeter: "tetrapoda-core.js BESTAEUBER_GESETZ (keine Rüssellänge)",
                        nicht: "keine Ko-Evolution",
                        leser: "tetrapoda-core.js:2908 BESTAEUBER_GESETZ — der Leib trägt Größe und Farbe; keine Kronröhre der Blüte, kein Wettrüsten der Läufer",
                        gruen: gut({ rRuessel: 0.78, rLauf: 0.5 }, 30),
                        attrappen: [{ name: "r = 0,78 aus der Literatur", roh: flach({ rRuessel: 0.78, rLauf: 0.5 }) }],
                    },
                    6: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(PA, 6, "Korallenfarbe kippt", { key: "korallenKipp", rel: "=", zahl: 1, refQuelle: "der Richter: Wärme-Gegenlauf — die Korallenfarbe kippt (1 = gekippt)" }), K.soll(PA, 6, "Fischarten −≥ 50 %", { key: "fischMinusProzent", einheit: "%" })],
                        auge: { pose: "das Riff im Bild (heute: Ego an der Wiese)", vorbild: "Bildpaar im Wärme-Gegenlauf: Korallenfarbe kippt (Prüfer-Satz R11)" },
                        taeter: "tetrapoda-core.js FISCH_GESETZ (kein Riff, keine Wärme)",
                        nicht: "kein Riff",
                        leser: "tetrapoda-core.js:2818 FISCH_GESETZ — eine Gestalt ohne Art und ohne Wärme; keine Koralle",
                        // ZAHL (auge-klasse.cjs): die Station urteilt die Zahl, das Bild ist Beleg
                        zeuge: zeugeWelt(1, true),
                        gruen: gut({ korallenKipp: 1, fischMinusProzent: 55, fischArten: 40 }, 40),
                        attrappen: [{ name: "Riff-Studie abgeschrieben", roh: flach({ fischMinusProzent: 55, fischArten: 40 }) }],
                    },
                    7: {
                        u: {},
                        soll: [K.soll(PA, 7, "≥ 50 % der Arten mit ≥ 1 Mutualist", { key: "mutualistProzent", einheit: "%" })],
                        zeuge: zeugeWelt(64, true),
                        taeter: "stamm/kreatur-fauna.js _bestaeuberTakt (Einbahn: kein Mutualismus)",
                        nicht: "10⁶+ Arten mit Partnern",
                        leser: "stamm/kreatur-fauna.js:613 _bestaeuberTakt — der Besuch der Bestäuber wirkt auf keine Blüte; kein Ko-Aussterben ohne Partner",
                        gruen: gut({ mutualistProzent: 62, arten: 120 }, 64),
                        attrappen: [{ name: "Mutualisten aus der Literatur", roh: flach({ mutualistProzent: 62, arten: 120 }) }],
                    },
                },
            },
        },
    };
})());

// ── DIE PERSPEKTIVE leben.evolution (9 Leitern, 59 Sprossen; belegt: keine): Arten, Erbe, Muster, Zeitreise, Baupläne, fremde Physik,
// Zivilisation, Mikroben, Fossilien ─────────────────────────────────────────────────────────────────────────────────────────────────
// Die Leser des Spiels: der BESTAND je Region (stamm/kreatur-leben.js `_bestandRegion` — das Verzeichnis der Tiere mit Gattung, Größe
// bs, Alter, Verband v; sein Takt `_bestandSchritt` im Zeitraffer: die Spiel-Uhr synchron verschoben und im selben Zug zurückgestellt,
// die Gaben ans Feld (`_depositLife`/`_depositEmotion`) für die Dauer des Zeitraffers stumm, das Verzeichnis danach byte-gleich
// zurück), der GUSS des Leibs (stamm/koerper-leib.js `_buildCreatureGroup` → tetrapoda-core GATTUNGEN/ART_GESTALT, mit `dialsOv` das
// Zufalls-Genom), der WURF eines Körpers (`spawnCreatureAt` mit dialsOv, dann der Takt der Welt `_gameLoopTick`), das LEBENSRAUM-Gesetz
// (`_lebensraumGesetz`, `_bodenKlasseAt`), das FURCHT-Gesetz (`_furchtGesetz` fluchtDistanz), der GANG (`_gangZeile` + tetrapoda
// gangSchritt an der Schwere der Welt `state.gravity`), der PLANET-FADEN (`r._planetAuftrag` planet-ort/planet-anker mit zeitMa —
// derselbe Weg wie der Satz „reise“), die EPOCHE der Siedlung (`_siedlungEpoche` → fachwerk siedlungsEpoche) und das GESETZ DER WELT
// (`_weltGesetz`: Schwere, Himmel, Wetter, Gelände, Ort). Was die Welt nicht trägt (Abstammung, Erbe, Epochen-Fauna, Mikroben,
// Fossilien, fremde Sterne), stellt die Probe AN DER WELT fest (Felder, Zahl der Gattungen, Antwort des Fadens je Epoche) und urteilt
// ROT „Umfang nicht erzeugbar“ mit dem fehlenden Leser. Ein Richter ohne Zahl bekommt sein Soll aus Umfang, Tiefe oder Preis der Sprosse
// (`K.soll` mit quelleFeld, geprüft am Wortlaut) oder aus einer Referenz beim Namen und trägt `unklar`.
L.perspektive("evolution", (() => {
    const ST = "leben.evolution.stammbaum";
    const ER = "leben.evolution.erbe";
    const MU = "leben.evolution.muster";
    const ZR = "leben.evolution.zeitreise";
    const BP = "leben.evolution.bauplan";
    const FP = "leben.evolution.fremde-physik";
    const ZV = "leben.evolution.zivilisation";
    const MI = "leben.evolution.mikroben";
    const FO = "leben.evolution.fossil";
    const PFAD_TIER = ["tetrapoda-core.js", "koerper-core.js", "stamm/kreatur-*.js", "stamm/koerper-leib.js", "stamm/koerper-fahrt.js", "scripts/werkbank.cjs"];
    const PFAD_PLANET = ["planet-core.js", "voxel-worker.js", "stamm/gelaende-chunks.js", "stamm/feld-leben.js", "stamm/netz-portal.js", "gelaende-core.js", "phyto-core.js", "stamm/kreatur-leben.js", "scripts/werkbank.cjs"];
    const PFAD_KULTUR = ["tetrapoda-core.js", "fachwerk-core.js", "stamm/kreatur-*.js", "stamm/siedlung-*.js", "stamm/klang.js", "scripts/werkbank.cjs"];
    const PFAD_GRUND = ["gelaende-core.js", "stamm/feld-leben.js", "stamm/dirigent-ankunft.js", "stamm/kreatur-leben.js", "stamm/gelaende-*.js", "tetrapoda-core.js", "scripts/werkbank.cjs"];

    // Ein Wort des Richters ohne Zahl: die Zahl kommt über `K.soll` aus Umfang, Tiefe oder Preis der Sprosse (quelleFeld + quelleWort)
    // oder aus einer Referenz beim Namen (refQuelle) — der EINE Weg des Kerns.
    // DAS SOLL EINES AUGE-RICHTERS OHNE JEDE ZAHL („Bildvergleich … gegen Natur-Fotos“): wörtlich, sein Vergleich hält NIE ohne Schwelle —
    // die Sprosse urteilt im Blindpaar am Gerät (R11), das Blatt nennt es `unklar`
    const ohneZahl = (id, nr, wort, key) => {
        const r = K.sprosseVon(id, nr).richter;
        if (!r.includes(wort)) throw new Error("ohneZahl: „" + wort + "“ steht nicht im Richter " + id + " S" + nr);
        if (K.zahlenIn(r).length) throw new Error(id + " S" + nr + ": der Richter trägt eine Zahl — das Soll gehört K.soll");
        return { wort, key, rel: "gegen", a: "die Referenz (der Richter nennt keine Schwelle)", einheit: "" };
    };

    // DER ZEUGE DER WELT: N Antworten der Welt mit Streuung; je nach Sprosse die Änderung vor → nach, der Gegenlauf (R7) und das Erbe
    const zeugeVon = (o) => (roh) => {
        const z = roh.zeuge || {};
        if (z.fehler) return "die Messung warf: " + z.fehler;
        if (!(z.antworten >= o.min)) return "nur " + (z.antworten || 0) + " Antworten der Welt (" + o.was + ", Soll ≥ " + o.min + ")";
        if (o.streu && !(z.streuung > 0)) return "die Antworten tragen keine Streuung (" + o.was + ": eine Konstante, nicht die Welt)";
        if (o.aend && !(Number.isFinite(z.vor) && Number.isFinite(z.nach) && z.vor !== z.nach)) return "die Welt änderte sich nicht (" + o.aend + ": vor " + z.vor + " = nach " + z.nach + ")";
        if (o.gegen && z.gegenlauf !== true) return "der Gegenlauf (" + o.gegen + ") ließ die Wirkung stehen — sie hat keine Ursache in der Welt";
        if (o.erbe && z.erbe !== true) return "ohne Erbe in der Welt (" + o.erbe + ") — die Zahl entsteht nicht aus Abstammung";
        return null;
    };
    // DIE SPROSSE aus ihren Teilen: der Selbsttest (gruen im Soll mit sprechendem Zeugen; je Bedingung des Zeugen eine Attrappe, die den
    // Wortlaut erfüllt, ohne die Welt zu ändern)
    const S = (d) => {
        const zg = d.zeuge;
        const gz = Object.assign({ antworten: Math.max(zg.min, 1) * 2, streuung: 1.7, vor: 1, nach: 2, gegenlauf: true, erbe: true }, d.gz || {});
        const gruen = { werte: d.werte, zeuge: gz };
        const attrappen = [{ name: "die Zahl als Konstante ohne Antwort der Welt (" + zg.was + ")", roh: { werte: d.werte, zeuge: { antworten: 0 } } }];
        if (zg.streu) attrappen.push({ name: "N Antworten ohne Streuung — eine Konstante statt der Welt", roh: { werte: d.werte, zeuge: Object.assign({}, gz, { streuung: 0 }) } });
        if (zg.aend) attrappen.push({ name: "die Welt blieb vor = nach (" + zg.aend + ")", roh: { werte: d.werte, zeuge: Object.assign({}, gz, { nach: gz.vor }) } });
        if (zg.gegen) attrappen.push({ name: "der Gegenlauf ließ die Wirkung stehen (" + zg.gegen + ")", roh: { werte: d.werte, zeuge: Object.assign({}, gz, { gegenlauf: false }) } });
        if (zg.erbe) attrappen.push({ name: "die Zahl ohne Erbe in der Welt (" + zg.erbe + ")", roh: { werte: d.werte, zeuge: Object.assign({}, gz, { erbe: false }) } });
        const sp = { u: d.u || {}, soll: d.soll, zeuge: zeugeVon(zg), zeugeText: d.zeugeText || zg.was, gruen, attrappen, taeter: d.taeter };
        for (const k of ["auge", "nicht", "leser", "unklar"]) if (d[k]) sp[k] = d[k];
        return sp;
    };

    const L_BODY = "stamm/kreatur-leben.js:1993 _creatureBodySize — die Geburt (_creatureNaturalBirth) würfelt die Größe des Kindes aus dem Strom der Region, kein Eltern-Feld, kein Erbe";
    const L_GATT = "tetrapoda-core.js:62 GATTUNGEN — 4 Gattungen aus 5 Dials ohne Ahn, ohne Klade (der STAMMBAUM des Kerns ist der Name eines Studios)";
    const L_ZEIT = "stamm/kreatur-leben.js:1687 _pickFaunaSoulAtPlayer — liest keine Zeit: der Bestand jeder Epoche ist der von heute; voxel-worker.js:1175 planetOrtAuftrag trägt kein Feld der Fauna";

    return {
        leitern: {
            // ═══ STAMMBAUM: Arten mit Abstammung ═══
            [ST]: {
                sek: 25,
                mutiert: true,
                pfad: PFAD_TIER.concat(["planet-core.js", "voxel-worker.js"]),
                ungefahren: "die Third-Bilder des Gestalt-Baums und das Blindtest-Bild (S7) — auf swiftshader kein Schuss",
                mess: async function (H, U, M) {
                    const P = async (r, T, A) => {
                        const mittel = (l) => (l.length ? l.reduce((s, x) => s + x, 0) / l.length : NaN);
                        const sd = (l) => {
                            const m = mittel(l);
                            return l.length > 1 ? Math.sqrt(l.reduce((s, x) => s + (x - m) * (x - m), 0) / (l.length - 1)) : 0;
                        };
                        const s = r.state;
                        const C = r.constructor;
                        const TC = globalThis.__tetrapodaCore;
                        const LG = C._lebensraumGesetz();
                        const aus = { fehler: null };
                        const meine = [];
                        const alt = { wurf: s.faunaLifecycle ? s.faunaLifecycle.lastTick : null, max: s.maxCreatures, p: s.playerMesh.position.clone(), yaw: s.yaw, pitch: s.pitch };
                        try {
                            const gattungen = Object.keys(LG.L.gattung);
                            const gesetze = ["_vogelGesetz", "_fischGesetz", "_bestaeuberGesetz"].filter((k) => typeof C[k] === "function");
                            aus.arten = gattungen.length + gesetze.length;
                            const AHN = ["ahn", "eltern", "klade", "vorfahr", "abstammung", "elter", "linie"];
                            let ahnen = 0;
                            for (const g of gattungen) {
                                const q = Object.assign({}, (TC.GATTUNGEN && TC.GATTUNGEN[g]) || {}, (TC.ART_GESTALT && TC.ART_GESTALT[g]) || {});
                                if (AHN.some((k) => q[k] !== undefined)) ahnen++;
                            }
                            aus.ahnen = ahnen;
                            const B = new T.Box3();
                            const V = new T.Vector3();
                            const gest = [];
                            for (const soul of C.CREATURE_SOUL_NAMES) {
                                const g = r._buildCreatureGroup(soul);
                                if (!g) continue;
                                g.updateMatrixWorld(true);
                                B.setFromObject(g).getSize(V);
                                const tb = g.userData._tierBaum || {};
                                gest.push([V.x, V.y, V.z, tb.beinL || 1e-6, tb.leibV || 1e-6].map((x) => Math.log(Math.max(1e-6, x))));
                                r._disposeSoulGroup(g);
                            }
                            const dist = [];
                            for (let i = 0; i < gest.length; i++) for (let j = i + 1; j < gest.length; j++) dist.push(Math.hypot(...gest[i].map((x, k) => x - gest[j][k])));
                            aus.gestalten = gest.length;
                            aus.gestaltStreuung = sd(dist);
                            const F = r._bestandRegionen().regionen;
                            const tiere = [];
                            for (const k of r._bestandNah()) tiere.push(...(F[k] || r._bestandRegion(k)).tiere);
                            aus.tiere = tiere.length;
                            let passt = 0;
                            for (const t of tiere) if (LG.lebensraum(t.g, r._bodenKlasseAt(t.x, t.z), LG.L) > 0) passt++;
                            aus.passt = passt;
                            aus.bsStreuung = sd(tiere.map((t) => t.bs));
                            aus.gattungenImBestand = new Set(tiere.map((t) => t.g)).size;
                            const fl = s.faunaLifecycle;
                            if (fl) fl.lastTick = 1e12;
                            s.maxCreatures = Math.max(s.maxCreatures || 0, (s.creatures || []).length + 6);
                            const pm = s.playerMesh.position;
                            for (const soul of C.CREATURE_SOUL_NAMES) {
                                const g = C.TETRAPODA_SOUL_MAP[soul];
                                let ort = null;
                                for (let d = 30; d <= 240 && !ort; d += 15)
                                    for (let q = 0; q < 16 && !ort; q++) {
                                        const x = pm.x + Math.cos((q * Math.PI) / 8 + d) * d;
                                        const z = pm.z + Math.sin((q * Math.PI) / 8 + d) * d;
                                        if (r._landAt(x, z) && !r._nassAt(x, z) && LG.lebensraum(g, r._bodenKlasseAt(x, z), LG.L) > 0) ort = { x, z };
                                    }
                                if (!ort) continue;
                                const c = r.spawnCreatureAt(ort.x, r.getTerrainHeightAt(ort.x, ort.z) + 0.5, ort.z, "happy", soul, { precise: true, bodySize: 1 });
                                if (c) meine.push({ c, g, x0: c.position.x, z0: c.position.z, weg: 0, lx: c.position.x, lz: c.position.z });
                            }
                            let t = performance.now();
                            for (let i = 0; i < A.takte; i++) {
                                r._gameLoopTick((t += 1000 / 60));
                                for (const m of meine) {
                                    m.weg += Math.hypot(m.c.position.x - m.lx, m.c.position.z - m.lz);
                                    m.lx = m.c.position.x;
                                    m.lz = m.c.position.z;
                                }
                            }
                            aus.koerper = meine.length;
                            aus.laufend = meine.filter((m) => m.weg > 0.3 && Math.abs(m.c.position.y - r.getTerrainHeightAt(m.c.position.x, m.c.position.z)) < 0.5 && LG.lebensraum(m.g, r._bodenKlasseAt(m.c.position.x, m.c.position.z), LG.L) > 0).length;
                            aus.wege = meine.map((m) => Math.round(m.weg * 100) / 100);
                            await r._fadenQuelle();
                            const an = await r._planetAnker();
                            const grad = (x) => Math.round(((x * 180) / Math.PI) * 100) / 100;
                            const o = await r._planetAuftrag({ type: "planet-ort", samen: r._planetSamen(), breite: grad(an.breite), laenge: grad(an.laenge), zeitMa: -100 });
                            aus.deltaFelder = Object.keys(o.delta || {});
                            aus.faunaFelder = aus.deltaFelder.filter((k) => !["klima", "meer", "wetter", "wuchs", "wildnis"].includes(k)).length;
                            const c0 = (s.creatures || []).find((c) => !meine.some((m) => m.c === c));
                            if (c0) {
                                const p = c0.position;
                                aus.pose = { px: p.x + 4, py: p.y + 1.8, pz: p.z + 4, lx: p.x, ly: p.y + 0.6, lz: p.z };
                            }
                        } catch (e) {
                            aus.fehler = String((e && e.message) || e).slice(0, 200);
                        } finally {
                            for (const m of meine) r.removeCreature(m.c);
                            if (s.faunaLifecycle) s.faunaLifecycle.lastTick = alt.wurf;
                            s.maxCreatures = alt.max;
                            s.playerMesh.position.copy(alt.p);
                            s.yaw = alt.yaw;
                            s.pitch = alt.pitch;
                        }
                        return aus;
                    };
                    const a = await H.seite("return await (" + P.toString() + ")(r, T, " + JSON.stringify({ takte: 180 }) + ");");
                    const ohneBaum = !(a.ahnen > 0) ? "kein Baum des Samens: " + a.arten + " Arten, " + (a.ahnen || 0) + " mit Ahn (tetrapoda-core GATTUNGEN), 0 ausgestorben" : null;
                    const z = { fehler: a.fehler, antworten: a.gestalten || 0, streuung: a.gestaltStreuung || 0, blaetter: a.arten };
                    const auge = await M.auge("evolution-stammbaum-s7", a.pose || { ort: "wiese" });
                    const nichtA = (n) => (a.arten >= n ? null : "die Welt trägt " + a.arten + " Arten (4 Gattungen + Vogel, Fisch, Bestäuber), nicht " + n);
                    const und = (...l) => l.filter(Boolean).join("; ") || undefined;
                    return {
                        sprossen: {
                            1: { werte: { arten: a.arten }, zeuge: Object.assign({}, z, { antworten: a.arten }), nicht: und(ohneBaum, nichtA(10)) },
                            2: { werte: { saaten: a.ahnen > 0 ? 1 : 0, arten: a.arten }, zeuge: Object.assign({}, z, { antworten: a.arten }), nicht: und(ohneBaum, nichtA(100)) },
                            3: { werte: { laufendProzent: a.koerper ? (100 * a.laufend) / a.koerper : undefined, blaetter: a.koerper, arten: a.arten }, zeuge: { fehler: a.fehler, antworten: a.koerper || 0, streuung: (a.wege || []).length > 1 ? Math.max(...a.wege) - Math.min(...a.wege) : 0 }, nicht: und(nichtA(1000)) },
                            4: { werte: { arten: a.arten }, zeuge: z, nicht: und(ohneBaum, nichtA(1e4)) },
                            5: { werte: { plausibelProzent: a.tiere ? (100 * a.passt) / a.tiere : undefined, stichprobe: a.tiere, arten: a.arten }, zeuge: { fehler: a.fehler, antworten: a.tiere || 0, streuung: a.bsStreuung || 0 }, nicht: und(nichtA(1e6)) },
                            6: { werte: { blaetter: a.faunaFelder, arten: a.arten }, zeuge: Object.assign({}, z, { antworten: a.arten }), nicht: und("kein ausgestorbenes Blatt: die Antwort des Planet-Fadens zur Epoche trägt " + (a.faunaFelder || 0) + " Felder der Fauna (" + (a.deltaFelder || []).join(", ") + ")", nichtA(1e9)) },
                            7: { werte: { blaetter: a.arten, saaten: 1 }, zeuge: z, auge, nicht: und(nichtA(1e9)) },
                        },
                    };
                },
                sprossen: {
                    1: S({
                        soll: [K.soll(ST, 1, "Robinson-Foulds ≤ 0,3", { key: "rf" }), K.soll(ST, 1, "Gestalt-Baum aus Third-Bildern gegen den Baum des Samens", { key: "arten", rel: "≥", zahl: 10, quelleFeld: "umfang", quelleWort: "10 Arten" })],
                        werte: { rf: 0.2, arten: 12 },
                        zeuge: { min: 10, was: "Gestalten je Blatt aus dem Guss der Welt", streu: true },
                        zeugeText: "Gestalt-Abstände aus dem Guss der Welt, Mutante „Erbe aus“ → Zufall",
                        taeter: "tetrapoda-core.js GATTUNGEN (kein Baum des Samens)",
                        nicht: "kein Baum des Samens (keine Abstammung)",
                        leser: L_GATT,
                        unklar: "„Mutante „Erbe aus“ → Zufall“ nennt keine Zahl — Vorschlag: RF der Mutante ≥ 0,8 (Zufallsbäume teilen fast keine Spaltung)",
                    }),
                    2: S({
                        soll: [K.soll(ST, 2, "Colless aus 100 Saaten", { key: "saaten", rel: "≥", zahl: 100 }), K.soll(ST, 2, "Colless aus 100 Saaten gegen reale Kladen", { key: "arten", rel: "≥", zahl: 100, quelleFeld: "umfang", quelleWort: "10² Arten" })],
                        werte: { saaten: 100, arten: 140 },
                        zeuge: { min: 100, was: "Blätter der Bäume aus der Welt", streu: true },
                        taeter: "tetrapoda-core.js GATTUNGEN (kein Baum, kein Colless)",
                        nicht: "kein Baum des Samens",
                        leser: L_GATT,
                        unklar: "„gegen reale Kladen“ nennt kein Band — Vorschlag: normierter Colless-Index im Band realer Kladen (Blum & François 2006) als Zahl der Karte",
                    }),
                    3: S({
                        soll: [K.soll(ST, 3, "≥ 90 %", { key: "laufendProzent", einheit: "%" }), K.soll(ST, 3, "100 Zufallsblätter", { key: "blaetter", rel: "≥", zahl: 100 }), K.soll(ST, 3, "als laufender Körper im Lebensraum", { key: "arten", rel: "≥", zahl: 1000, quelleFeld: "umfang", quelleWort: "10³ Arten" })],
                        werte: { laufendProzent: 96, blaetter: 100, arten: 1200 },
                        zeuge: { min: 100, was: "Körper im Lebensraum, gelaufen im Takt der Welt", streu: true },
                        taeter: "stamm/kreatur-leben.js spawnCreatureAt / _lebensraumGesetz (4 Gattungen)",
                        nicht: "10³ Arten — die Welt trägt 4 Gattungen",
                        leser: L_GATT,
                    }),
                    4: S({
                        soll: [K.soll(ST, 4, "r ≥ 0,5", { key: "mantelR" }), K.soll(ST, 4, "Mantel-Korrelation Bild-Deskriptoren ↔ Baum-Distanz", { key: "arten", rel: "≥", zahl: 1e4, quelleFeld: "umfang", quelleWort: "10⁴ Arten" })],
                        werte: { mantelR: 0.62, arten: 12000 },
                        zeuge: { min: 10, was: "Gestalten aus dem Guss der Welt", streu: true },
                        taeter: "tetrapoda-core.js GATTUNGEN (keine Baum-Distanz)",
                        nicht: "keine Baum-Distanz",
                        leser: L_GATT,
                    }),
                    5: S({
                        soll: [K.soll(ST, 5, "Zufallsstichprobe 1 000 ≥ 95 %", { key: "plausibelProzent", einheit: "%" }), K.soll(ST, 5, "Zufallsstichprobe 1 000", { key: "stichprobe", rel: "≥", zahl: 1000 }), K.soll(ST, 5, "Ankunft-ABAB 10⁶", { key: "arten", rel: "≥", zahl: 1e6 })],
                        werte: { plausibelProzent: 97, stichprobe: 1000, arten: 1.2e6 },
                        zeuge: { min: 1000, was: "Tiere des Bestands an ihrem Anker im Lebensraum", streu: true },
                        taeter: "stamm/kreatur-leben.js _bestandRegion (4 Gattungen)",
                        nicht: "10⁶ lebende Arten — die Welt trägt 4 Gattungen",
                        leser: L_GATT,
                        unklar: "„Ankunft-ABAB 10⁶ ↔ 10³“ nennt keine Schwelle — den Preis liest die Maschine aus dem Strom (R8)",
                    }),
                    6: S({
                        soll: [K.soll(ST, 6, "≥ 95 %", { key: "epocheProzent", einheit: "%" }), K.soll(ST, 6, "100 Zufallsblätter", { key: "blaetter", rel: "≥", zahl: 100 }), K.soll(ST, 6, "100 Zufallsblätter der ganzen Geschichte", { key: "arten", rel: "≥", zahl: 1e9, quelleFeld: "umfang", quelleWort: "10⁹ Arten" })],
                        werte: { epocheProzent: 96, blaetter: 100, arten: 1.5e9 },
                        zeuge: { min: 100, was: "Blätter der Geschichte, als Körper in ihrer Epoche", streu: true },
                        taeter: "voxel-worker.js planetOrtAuftrag (keine Fauna der Epoche)",
                        nicht: "keine ausgestorbene Art, keine Epochen-Fauna",
                        leser: L_ZEIT,
                    }),
                    7: S({
                        soll: [K.soll(ST, 7, "Blindtest ≤ 60 %", { key: "blindProzent", einheit: "%" }), K.soll(ST, 7, "1 000 Blätter aus 10 Saaten", { key: "blaetter", rel: "≥", zahl: 1000 }), K.soll(ST, 7, "10 Saaten", { key: "saaten", rel: "≥", zahl: 10 })],
                        werte: { blindProzent: 55, blaetter: 1000, saaten: 10 },
                        zeuge: { min: 1000, was: "Blätter aus 10 Saaten", streu: true },
                        auge: { pose: "Third am ersten Tier der Welt (4 m seitlich, 1,8 m hoch)", vorbild: "Natur-Fotos derselben Kladen, Blindtest ≤ 60 % (Prüfer-Satz R11)" },
                        taeter: "tetrapoda-core.js GATTUNGEN (4 Gattungen)",
                        nicht: "10⁹ Arten aus 10 Saaten — die Welt trägt 4 Gattungen in jeder Saat",
                        leser: L_GATT,
                    }),
                },
            },

            // ═══ ERBE: Individuum und Abstammung im Zeitraffer des Bestands ═══
            [ER]: {
                sek: 25,
                mutiert: true,
                pfad: PFAD_TIER,
                ungefahren: "die Morphometrie aus Third-Bildern (S1) und das Bild der Herde (S3, S4) — die Zahl misst die Größe bs des Verzeichnisses, das Bild am Gerät",
                mess: async function (H, U, M) {
                    const P = async (r, T, A) => {
                        const mittel = (l) => (l.length ? l.reduce((s, x) => s + x, 0) / l.length : NaN);
                        const sd = (l) => {
                            const m = mittel(l);
                            return l.length > 1 ? Math.sqrt(l.reduce((s, x) => s + (x - m) * (x - m), 0) / (l.length - 1)) : 0;
                        };
                        const steigung = (xs, ys) => {
                            const mx = mittel(xs), my = mittel(ys);
                            let a = 0, b = 0;
                            for (let i = 0; i < xs.length; i++) {
                                a += (xs[i] - mx) * (ys[i] - my);
                                b += (xs[i] - mx) * (xs[i] - mx);
                            }
                            return b > 0 ? a / b : NaN;
                        };
                        const s = r.state;
                        const C = r.constructor;
                        const aus = { fehler: null };
                        const jetzt = s.spielZeit;
                        const eigen = (k) => (Object.prototype.hasOwnProperty.call(r, k) ? r[k] : undefined);
                        const altF = { l: eigen("_depositLife"), e: eigen("_depositEmotion"), s: eigen("_bestandStirbt") };
                        const F = r._bestandRegionen().regionen;
                        const keys = r._bestandNah();
                        const hier = r._bestandHier();
                        for (const k of keys) if (!F[k]) r._bestandRegion(k);
                        const sichern = (R) => ({ R, t: R.t, seq: R.seq, tiere: R.tiere.slice(), felder: R.tiere.map((t) => Object.assign({}, t)) });
                        const zurueck = (a) => {
                            a.R.t = a.t;
                            a.R.seq = a.seq;
                            a.R.tiere = a.tiere;
                            a.tiere.forEach((t, i) => {
                                for (const k of Object.keys(t)) if (!(k in a.felder[i])) delete t[k];
                                Object.assign(t, a.felder[i]);
                            });
                        };
                        const stand = keys.map((k) => sichern(F[k]));
                        const tod = new Map();
                        const ELTERN = ["eltern", "mutter", "vater", "ahn", "elter"];
                        const lebensS = C.FAUNA_MAX_AGE_MS / 1000;
                        const lauf = (key, dauer) => {
                            const R = F[key];
                            const geb = [];
                            const tode = [];
                            for (let t = 0; t < dauer;) {
                                const dt = Math.min(3000, dauer - t);
                                const vor = new Set(R.tiere.map((x) => x.id));
                                const alte = {};
                                for (const x of R.tiere) if (x.alterS > 300) (alte[x.g] = alte[x.g] || []).push(x.bs);
                                t += dt;
                                s.spielZeit = jetzt + t;
                                try {
                                    r._bestandRegion(key, true, 0, Infinity, tode);
                                } finally {
                                    s.spielZeit = jetzt;
                                }
                                for (const x of R.tiere) if (!vor.has(x.id)) geb.push({ g: x.g, bs: x.bs, v: x.v, eltern: ELTERN.some((k) => x[k] !== undefined), m: alte[x.g] ? mittel(alte[x.g]) : null });
                            }
                            return geb;
                        };
                        try {
                            r._depositLife = function () {};
                            r._depositEmotion = function () {};
                            const orig = C.prototype._bestandStirbt;
                            r._bestandStirbt = function (R, t, ursache, tode, j) {
                                tod.set(t.id, ursache);
                                return orig.call(this, R, t, ursache, tode, j);
                            };
                            const alle = [].concat(...keys.map((k) => F[k].tiere));
                            aus.tiere = alle.length;
                            aus.imSchirm = (s.creatures || []).length;
                            aus.maxCreatures = s.maxCreatures;
                            const cv = [];
                            const je = {};
                            for (const t of alle) (je[t.g] = je[t.g] || []).push(t.bs);
                            for (const g of Object.keys(je)) if (je[g].length >= 3) cv.push((100 * sd(je[g])) / mittel(je[g]));
                            aus.cvProzent = cv.length ? mittel(cv) : undefined;
                            aus.bsStreuung = sd(alle.map((t) => t.bs));
                            const herden = {};
                            for (const t of alle) herden[t.v] = (herden[t.v] || 0) + 1;
                            aus.herdeMax = Math.max(0, ...Object.values(herden));
                            let nah = 0, fern = 0, nN = 0, nF = 0;
                            for (const k of keys) {
                                const T0 = F[k].tiere;
                                for (let i = 0; i < T0.length; i++)
                                    for (let j = i + 1; j < T0.length; j++) {
                                        if (T0[i].g !== T0[j].g) continue;
                                        const d = Math.abs(T0[i].bs - T0[j].bs);
                                        if (T0[i].v === T0[j].v) {
                                            nah += d;
                                            nN++;
                                        } else {
                                            fern += d;
                                            nF++;
                                        }
                                    }
                            }
                            aus.verwandtMinusFremd = nN && nF ? fern / nF - nah / nN : undefined;
                            aus.paare = nN + nF;
                            aus.paareVerwandt = nN;
                            aus.mitAhnenlinie = alle.filter((t) => ELTERN.some((k) => t[k] !== undefined)).length;
                            aus.regionN = Math.max(0, ...keys.map((k) => F[k].tiere.length));
                            aus.alleRegionen = Object.values(F).reduce((n, R) => n + R.tiere.length, 0);
                            const marke = new Map(alle.map((t) => [t.id, t.bs]));
                            const einzig = (t, liste) => !liste.some((o) => o !== t && o.g === t.g && Math.abs(o.bs - t.bs) < 0.02);
                            const tagS = C.DAY_LENGTH_DEFAULT_MINUTES * 60;
                            for (const k of keys) lauf(k, tagS);
                            const nachTag = [].concat(...keys.map((k) => F[k].tiere));
                            aus.wiedererkannt = nachTag.filter((t) => marke.has(t.id) && Math.abs(marke.get(t.id) - t.bs) < 1e-9 && einzig(t, nachTag)).length;
                            aus.markiert = marke.size;
                            aus.lebensS = lebensS;
                            const da = new Set(nachTag.map((t) => t.id));
                            aus.wiedergefunden = [...marke.keys()].filter((id) => da.has(id)).length;
                            aus.verbleibErklaert = [...marke.keys()].filter((id) => da.has(id) || tod.has(id)).length;
                            aus.todAlter = [...marke.keys()].filter((id) => tod.get(id) === "alter").length;
                            aus.nachher = nachTag.length;
                            const lang = lauf(hier, A.generationen * lebensS - tagS);
                            const geb = lang.filter((b) => b.m !== null);
                            aus.geburten = lang.length;
                            aus.mitEltern = lang.filter((b) => b.eltern).length;
                            const gm = {};
                            for (const b of geb) (gm[b.g] = gm[b.g] || []).push(b);
                            const xs = [], ys = [];
                            for (const g of Object.keys(gm)) {
                                const mx = mittel(gm[g].map((b) => b.m)), my = mittel(gm[g].map((b) => b.bs));
                                for (const b of gm[g]) {
                                    xs.push(b.m - mx);
                                    ys.push(b.bs - my);
                                }
                            }
                            aus.ekRegression = geb.length >= 5 ? steigung(xs, ys) : undefined;
                            aus.gebStreuung = sd(lang.map((b) => b.bs));
                            aus.generationen = (A.generationen * lebensS) / lebensS;
                            stand.forEach(zurueck);
                            const R = F[hier];
                            const hirsche = R.tiere.filter((t) => t.g === "deer");
                            if (hirsche.length >= 4) {
                                const m0 = mittel(hirsche.map((t) => t.bs));
                                const grenze = hirsche.map((t) => t.bs).sort((a, b) => a - b)[Math.floor(hirsche.length / 2)];
                                R.tiere = R.tiere.filter((t) => t.g !== "deer" || t.bs >= grenze);
                                const S0 = mittel(R.tiere.filter((t) => t.g === "deer").map((t) => t.bs)) - m0;
                                const nach = lauf(hier, 3 * 3600).filter((b) => b.g === "deer");
                                aus.selektion = { m0, S: S0, n: nach.length, R: nach.length ? mittel(nach.map((b) => b.bs)) - m0 : undefined, sd: sd(nach.map((b) => b.bs)) };
                                const h2 = aus.ekRegression;
                                const soll = Number.isFinite(h2) ? h2 * S0 : NaN;
                                aus.antwortAbwProzent = Number.isFinite(soll) && Math.abs(soll) > 1e-6 && Number.isFinite(aus.selektion.R) ? (100 * Math.abs(aus.selektion.R - soll)) / Math.abs(soll) : undefined;
                            }
                            stand.forEach(zurueck);
                            const proto = [];
                            for (let p = Object.getPrototypeOf(r); p && p !== Object.prototype; p = Object.getPrototypeOf(p)) for (const k of Object.getOwnPropertyNames(p)) if (k.toLowerCase().includes("zucht") || k.toLowerCase().includes("zuecht") || k.toLowerCase().includes("paarung")) proto.push(k);
                            aus.zuchtAkte = proto.length;
                        } catch (e) {
                            aus.fehler = String((e && e.message) || e).slice(0, 200);
                        } finally {
                            stand.forEach(zurueck);
                            s.spielZeit = jetzt;
                            for (const [k, v] of [["_depositLife", altF.l], ["_depositEmotion", altF.e], ["_bestandStirbt", altF.s]]) {
                                if (v === undefined) delete r[k];
                                else r[k] = v;
                            }
                        }
                        aus.zurueck = keys.map((k) => F[k].tiere.length).join(",");
                        return aus;
                    };
                    const a = await H.seite("return await (" + P.toString() + ")(r, T, " + JSON.stringify({ generationen: 10 }) + ");");
                    const ohneErbe = !(a.mitEltern > 0) ? "kein Erbe: " + (a.geburten || 0) + " Geburten im Zeitraffer, " + (a.mitEltern || 0) + " mit Eltern — die Größe des Kindes würfelt der Strom der Region" : null;
                    const und = (...l) => l.filter(Boolean).join("; ") || undefined;
                    const pr = (x, n) => (n > 0 && Number.isFinite(x) ? (100 * x) / n : undefined);
                    const sel = a.selektion || {};
                    return {
                        sprossen: {
                            1: { werte: { ekRegression: a.ekRegression, generationen: a.generationen }, zeuge: { fehler: a.fehler, antworten: a.geburten || 0, streuung: a.gebStreuung || 0, erbe: a.mitEltern > 0 }, nicht: und(ohneErbe) },
                            2: { werte: { wiedererkanntProzent: pr(a.wiedererkannt, a.markiert), herde: a.herdeMax, spieltage: 1 }, zeuge: { fehler: a.fehler, antworten: a.markiert || 0, streuung: a.bsStreuung || 0, vor: a.markiert, nach: a.wiedererkannt }, nicht: und(a.herdeMax < 100 ? "die größte Herde trägt " + a.herdeMax + " Tiere (tetrapoda-core.js:289 herde.wurf), und ein Tier trägt nur die Größe — kein Muster, keine Narbe, kein Gang je Individuum" : null) },
                            3: { werte: { antwortAbwProzent: a.antwortAbwProzent, generationen: a.generationen }, zeuge: { fehler: a.fehler, antworten: sel.n || 0, streuung: sel.sd || 0, vor: sel.m0, nach: Number.isFinite(sel.R) ? sel.m0 + sel.R : undefined, erbe: a.mitEltern > 0 }, nicht: und(!(a.zuchtAkte > 0) ? "der Spieler züchtet nicht: kein Akt der Zucht im Spiel" : null, ohneErbe) },
                            4: { werte: { cvProzent: a.cvProzent, imSchirm: a.imSchirm }, zeuge: { fehler: a.fehler, antworten: a.tiere || 0, streuung: a.bsStreuung || 0 }, nicht: und(a.imSchirm < 1e4 ? "10⁴ Individuen im Schirm: die Welt zeichnet " + a.imSchirm + " Leiber (maxCreatures " + a.maxCreatures + ")" : null) },
                            5: { werte: { wiedergefundenProzent: pr(a.wiedergefunden, a.markiert), verbleibProzent: pr(a.verbleibErklaert, a.markiert), markiert: a.markiert, regionN: a.regionN }, zeuge: { fehler: a.fehler, antworten: a.markiert || 0, streuung: a.bsStreuung || 0, vor: a.markiert, nach: a.wiedergefunden }, nicht: und(a.regionN < 1e6 ? "10⁶ in einer Region: die volle Region trägt " + a.regionN + " Tiere" : null, "nach einem Spieltag fern leben " + a.wiedergefunden + " von " + a.markiert + " markierten Tieren, " + a.todAlter + " starben am Alter (FAUNA_MAX_AGE_MS: ein Leben von " + Math.round((a.lebensS || 0) / 60) + " Spielminuten)") },
                            6: { werte: { mitAhnenlinie: a.mitAhnenlinie, verwandtMinusFremd: a.verwandtMinusFremd, planetN: a.alleRegionen }, zeuge: { fehler: a.fehler, antworten: a.paare || 0, streuung: a.bsStreuung || 0, erbe: a.mitEltern > 0 }, nicht: und(!(a.mitAhnenlinie > 0) ? "keine Ahnenlinie: 0 von " + a.tiere + " Tieren tragen Eltern (" + (a.paareVerwandt || 0) + " Paare aus einem Wurf, ihre Größe würfelt je Tier der Strom)" : null,"10¹⁰⁺ je Planet: der Bestand der gelesenen Regionen trägt " + a.alleRegionen + " Tiere") },
                        },
                    };
                },
                sprossen: {
                    1: S({
                        soll: [K.soll(ER, 1, "Eltern-Kind-Regression 0,2–0,8", { key: "ekRegression" }), K.soll(ER, 1, "Morphometrie aus Third-Bildern", { key: "generationen", rel: "≥", zahl: 10, quelleFeld: "umfang", quelleWort: "≥ 10 Generationen" })],
                        werte: { ekRegression: 0.45, generationen: 12 },
                        zeuge: { min: 20, was: "Geburten im Zeitraffer des Bestands", streu: true, erbe: "Kind mit Eltern im Verzeichnis" },
                        zeugeText: "Geburten im Zeitraffer, Kind mit Eltern; Mutante „Erbe aus“ → ≈ 0",
                        taeter: "stamm/kreatur-leben.js _creatureNaturalBirth (die Größe aus dem Strom, kein Erbe)",
                        nicht: "kein Erbe",
                        leser: L_BODY,
                        unklar: "„Mutante „Erbe aus“ → ≈ 0“ nennt keine Toleranz — Vorschlag: |Regression der Mutante| ≤ 0,05",
                    }),
                    2: S({
                        soll: [K.soll(ER, 2, "ein Individuum nach 1 Spieltag aus 100 wiedererkannt ≥ 90 %", { key: "wiedererkanntProzent", einheit: "%" }), K.soll(ER, 2, "aus 100", { key: "herde", rel: "≥", zahl: 100 }), K.soll(ER, 2, "nach 1 Spieltag", { key: "spieltage", rel: "≥", zahl: 1 })],
                        werte: { wiedererkanntProzent: 93, herde: 100, spieltage: 1 },
                        zeuge: { min: 100, was: "markierte Tiere des Bestands nach einem Spieltag", streu: true, aend: "der Spieltag" },
                        taeter: "tetrapoda-core.js VERHALTEN.herde.wurf (Herde 3–7) / stamm/kreatur-leben.js (ein Tier trägt nur bs)",
                        nicht: "keine Herde mit 100, keine Merkmale je Individuum",
                        leser: "stamm/kreatur-leben.js:1996 wurf.push — das Tier des Bestands trägt { id, soul, g, bs, alterS, x, z, v }: kein Muster, keine Narbe, kein Gang je Individuum",
                    }),
                    3: S({
                        soll: [K.soll(ER, 3, "Merkmalsmittel vorher ↔ nachher", { key: "antwortAbwProzent", rel: "≤", zahl: 20, quelleFeld: "tiefe", quelleWort: "±20 %", einheit: "%" }), K.soll(ER, 3, "Merkmalsmittel vorher ↔ nachher im Bild der Herde", { key: "generationen", rel: "≥", zahl: 10, quelleFeld: "umfang", quelleWort: "10 Generationen" })],
                        werte: { antwortAbwProzent: 12, generationen: 10 },
                        zeuge: { min: 10, was: "Geburten nach der Auslese im Zeitraffer", streu: true, aend: "das Merkmalsmittel", erbe: "Kind mit Eltern" },
                        taeter: "stamm/kreatur-leben.js _creatureNaturalBirth (kein Erbe — die Auslese verschiebt nichts)",
                        nicht: "kein Züchten, kein Erbe",
                        leser: "stamm/kreatur-leben.js:1949 _creatureNaturalBirth — kennt keine Eltern; kein Akt der Zucht des Spielers",
                        unklar: "der Richter nennt keine Zahl — die Station liest die Antwort R = h²·S ±20 % aus der Tiefe (h² die Eltern-Kind-Regression der Welt)",
                    }),
                    4: S({
                        soll: [K.soll(ER, 4, "Variationskoeffizient der Körpermaße", { key: "cvProzent", rel: "band", zahl: 4, bis: 10, refQuelle: "Säuger: CV linearer Körpermaße 4–10 % (Yablokov 1974; Lande 1977)", einheit: "%" }), K.soll(ER, 4, "Variationskoeffizient der Körpermaße aus dem Bild", { key: "imSchirm", rel: "≥", zahl: 1e4, quelleFeld: "umfang", quelleWort: "10⁴ Individuen" })],
                        werte: { cvProzent: 7, imSchirm: 12000 },
                        zeuge: { min: 30, was: "Tiere des Bestands mit ihrer Größe", streu: true },
                        taeter: "stamm/koerper-leib.js _creatureBodySize (Größe aus dem Hash, Streuung ohne Natur-Band)",
                        nicht: "10⁴ Individuen im Schirm",
                        leser: "stamm/kreatur-leben.js:2557 _bestandVerkoerpern — zeichnet höchstens maxCreatures Leiber",
                        unklar: "„im Band“ nennt kein Band — die Station misst gegen CV 4–10 % linearer Säuger-Maße",
                    }),
                    5: S({
                        soll: [K.soll(ER, 5, "wiedergefunden ≥ 99 %", { key: "wiedergefundenProzent", einheit: "%" }), K.soll(ER, 5, "im Band der Sterbe- und Zugraten der Art ≥ 90 %", { key: "verbleibProzent", einheit: "%" }), K.soll(ER, 5, "100 markierte Tiere", { key: "markiert", rel: "≥", zahl: 100 }), K.soll(ER, 5, "100 markierte Tiere nach Abreise und Rückkehr", { key: "regionN", rel: "≥", zahl: 1e6, quelleFeld: "umfang", quelleWort: "10⁶ in einer Region" })],
                        werte: { wiedergefundenProzent: 99.5, verbleibProzent: 95, markiert: 100, regionN: 1.2e6 },
                        zeuge: { min: 100, was: "markierte Tiere nach Abreise und Rückkehr (Zeitraffer)", streu: true, aend: "die Abreise" },
                        taeter: "stamm/kreatur-leben.js _bestandRegion (Bestand ~10 je Region)",
                        nicht: "10⁶ in einer Region",
                        leser: "stamm/kreatur-leben.js:2284 _bestandRegion — trägt die Tiere einer Kachel von revierM·√π (~10 Tiere); kein Zug",
                    }),
                    6: S({
                        soll: [K.soll(ER, 6, "100 Zufallsindividuen", { key: "mitAhnenlinie", rel: "≥", zahl: 100 }), K.soll(ER, 6, "Verwandte im Revier gleichen ihm messbar mehr als Fremde", { key: "verwandtMinusFremd", rel: ">", zahl: 0, refQuelle: "das Wort des Richters: |Δ Größe| Fremder − |Δ Größe| Verwandter (Wurf-Geschwister, Verband v) > 0" }), K.soll(ER, 6, "Ahnenlinie zurück bis zur Klade", { key: "planetN", rel: "≥", zahl: 1e10, quelleFeld: "umfang", quelleWort: "10¹⁰⁺ je Planet" })],
                        werte: { mitAhnenlinie: 100, verwandtMinusFremd: 0.08, planetN: 2e10 },
                        zeuge: { min: 50, was: "Paare von Tieren einer Gattung im Revier", streu: true, erbe: "Ahnenlinie im Verzeichnis" },
                        taeter: "stamm/kreatur-leben.js _creatureNaturalBirth (keine Ahnenlinie)",
                        nicht: "keine Ahnenlinie, kein Planet-Bestand",
                        leser: L_BODY,
                    }),
                },
            },

            // ═══ MUSTER: die Experimente der Natur im Zeitraffer, mit Gegenlauf ═══
            [MU]: {
                sek: 25,
                mutiert: true,
                pfad: PFAD_TIER,
                ungefahren: "das Bild der Herde (S1) und das Bild-Embedding der Inseln (S2) — gemessen an der Größe bs des Verzeichnisses",
                mess: async function (H, U, M) {
                    const P = async (r, T, A) => {
                        const mittel = (l) => (l.length ? l.reduce((s, x) => s + x, 0) / l.length : NaN);
                        const sd = (l) => {
                            const m = mittel(l);
                            return l.length > 1 ? Math.sqrt(l.reduce((s, x) => s + (x - m) * (x - m), 0) / (l.length - 1)) : 0;
                        };
                        const auc = (a, b) => {
                            if (!a.length || !b.length) return NaN;
                            let n = 0;
                            for (const x of a) for (const y of b) n += x > y ? 1 : x === y ? 0.5 : 0;
                            const v = n / (a.length * b.length);
                            return Math.max(v, 1 - v);
                        };
                        const s = r.state;
                        const C = r.constructor;
                        const TC = globalThis.__tetrapodaCore;
                        const aus = { fehler: null };
                        const jetzt = s.spielZeit;
                        const eigen = (k) => (Object.prototype.hasOwnProperty.call(r, k) ? r[k] : undefined);
                        const altF = { l: eigen("_depositLife"), e: eigen("_depositEmotion") };
                        const F = r._bestandRegionen().regionen;
                        const keys = r._bestandNah();
                        const hier = r._bestandHier();
                        for (const k of keys) if (!F[k]) r._bestandRegion(k);
                        const sichern = (R) => ({ R, t: R.t, seq: R.seq, tiere: R.tiere.slice(), felder: R.tiere.map((t) => Object.assign({}, t)) });
                        const zurueck = (a) => {
                            a.R.t = a.t;
                            a.R.seq = a.seq;
                            a.R.tiere = a.tiere;
                            a.tiere.forEach((t, i) => {
                                for (const k of Object.keys(t)) if (!(k in a.felder[i])) delete t[k];
                                Object.assign(t, a.felder[i]);
                            });
                        };
                        const stand = keys.map((k) => sichern(F[k]));
                        const ELTERN = ["eltern", "mutter", "vater", "ahn", "elter"];
                        const lauf = (key, dauer) => {
                            const R = F[key];
                            let eltern = 0, geb = 0;
                            const tode = [];
                            for (let t = 0; t < dauer;) {
                                const dt = Math.min(3000, dauer - t);
                                const vor = new Set(R.tiere.map((x) => x.id));
                                t += dt;
                                s.spielZeit = jetzt + t;
                                try {
                                    r._bestandRegion(key, true, 0, Infinity, tode);
                                } finally {
                                    s.spielZeit = jetzt;
                                }
                                for (const x of R.tiere)
                                    if (!vor.has(x.id)) {
                                        geb++;
                                        if (ELTERN.some((k) => x[k] !== undefined)) eltern++;
                                    }
                            }
                            return { geb, eltern };
                        };
                        try {
                            r._depositLife = function () {};
                            r._depositEmotion = function () {};
                            const lebensS = C.FAUNA_MAX_AGE_MS / 1000;
                            const raeuber = (k) => F[k].tiere.filter((t) => t.g === "wolf" || t.g === "bear").length;
                            const kandidat = keys.filter((k) => F[k].tiere.filter((t) => t.g === "deer").length >= 2).sort((a, b) => raeuber(b) - raeuber(a));
                            const ort = kandidat[0] || hier;
                            aus.raeuberImOrt = raeuber(ort);
                            const R = F[ort];
                            const hirsch = () => R.tiere.filter((t) => t.g === "deer").map((t) => t.bs);
                            const m0 = mittel(hirsch());
                            const mit = lauf(ort, A.dauerS);
                            const m1 = mittel(hirsch());
                            const nMit = hirsch().length;
                            stand.forEach(zurueck);
                            R.tiere = R.tiere.filter((t) => t.g !== "wolf" && t.g !== "bear");
                            const ohne = lauf(ort, A.dauerS);
                            const m2 = mittel(hirsch());
                            stand.forEach(zurueck);
                            aus.selektion = { m0, mit: m1, ohne: m2, dMit: m1 - m0, dOhne: m2 - m0, nMit, geb: mit.geb + ohne.geb, eltern: mit.eltern + ohne.eltern };
                            aus.generationen = A.dauerS / lebensS;
                            const inseln = keys.map((k) => F[k].tiere.filter((t) => t.g === "deer").map((t) => t.bs)).filter((l) => l.length >= 2).sort((a, b) => a.length - b.length);
                            aus.inseln = inseln.map((l) => l.length);
                            aus.auc = inseln.length >= 2 ? auc(inseln[0], inseln[inseln.length - 1]) : undefined;
                            aus.inselStreuung = sd([].concat(...inseln));
                            aus.nKlein = inseln.length ? inseln[0].length : 0;
                            aus.nGross = Math.max(0, ...keys.map((k) => F[k].tiere.length));
                            const start = TC.PARAMS_BY_KIND.kreatur.map((p) => p.id);
                            let neu = 0;
                            for (const g of Object.keys(TC.GATTUNGEN)) for (const k of Object.keys(TC.GATTUNGEN[g])) if (!start.includes(k)) neu++;
                            aus.neueMerkmale = neu;
                            aus.gattungen = Object.keys(TC.GATTUNGEN).length;
                            aus.spindelLinien = typeof C._fischGesetz === "function" ? 1 : 0;
                            const hash = (g) => {
                                let h = 0, n = 0;
                                g.updateMatrixWorld(true);
                                g.traverse((o) => {
                                    const p = o.geometry && o.geometry.attributes && o.geometry.attributes.position;
                                    if (!p) return;
                                    const e = o.matrixWorld.elements;
                                    for (let i = 0; i < p.array.length; i += 7) h = (h * 31 + Math.round(p.array[i] * 1e4) + Math.round(e[12] * 1e4)) % 2147483647;
                                    n += p.count;
                                });
                                return h + ":" + n;
                            };
                            const bau = (d) => {
                                const g = r._buildCreatureGroup("wolf", { dialsOv: d });
                                const h = g ? hash(g) : null;
                                if (g) r._disposeSoulGroup(g);
                                return h;
                            };
                            const paare = [[{ size: 2.1, neck: 0.3, leg: 0.25, diet: 0.8, build: 0.5 }, { size: 3.3, neck: 0.2, leg: 0.3, diet: 0.2, build: 0.7 }], [{ size: 1.4, neck: 0.36, leg: 0.18, diet: 1, build: 0.3 }, { size: 2.6, neck: 0.25, leg: 0.33, diet: 0.4, build: 0.9 }]];
                            let gleich = 0, anders = 0;
                            for (const [a, b] of paare) {
                                const h1 = bau(a), h2 = bau(a), h3 = bau(b);
                                if (h1 && h1 === h2) gleich++;
                                if (h1 && h3 && h1 !== h3) anders++;
                            }
                            aus.gleichAnteil = gleich / paare.length;
                            aus.anderAnteil = anders / paare.length;
                            aus.kontingenzPaare = paare.length * 3;
                            aus.mutationsFolge = Object.keys(TC).filter((k) => /mutat|mutier|genom/i.test(k)).length;
                            const G = C._weltGesetz(s.worldMeta);
                            aus.gesetzTeile = Object.keys(G);
                            aus.saatenFremd = aus.gesetzTeile.filter((k) => /stern|licht|loesung|lösung|solvens/i.test(k)).length;
                        } catch (e) {
                            aus.fehler = String((e && e.message) || e).slice(0, 200);
                        } finally {
                            stand.forEach(zurueck);
                            s.spielZeit = jetzt;
                            for (const [k, v] of [["_depositLife", altF.l], ["_depositEmotion", altF.e]]) {
                                if (v === undefined) delete r[k];
                                else r[k] = v;
                            }
                        }
                        return aus;
                    };
                    const a = await H.seite("return await (" + P.toString() + ")(r, T, " + JSON.stringify({ dauerS: 6 * 3600 }) + ");");
                    const se = a.selektion || {};
                    const erbe = se.eltern > 0;
                    const ohneErbe = !erbe ? "kein Erbe: " + (se.geb || 0) + " Geburten im Zeitraffer (Region mit " + (a.raeuberImOrt || 0) + " Räubern), 0 mit Eltern — die Auslese verschiebt, wer lebt, nie was geboren wird" : null;
                    const selektion = erbe && se.dMit < 0 && se.dOhne - se.dMit > 0;
                    const drift = a.auc >= 0.9;
                    const kontingenz = a.mutationsFolge > 0 && a.gleichAnteil === 1 && a.anderAnteil === 1;
                    const neuheit = a.neueMerkmale > 0;
                    const konvergenz = a.spindelLinien >= 2;
                    const musterZahl = [selektion, drift, kontingenz, neuheit, konvergenz].filter(Boolean).length;
                    const und = (...l) => l.filter(Boolean).join("; ") || undefined;
                    return {
                        sprossen: {
                            1: { werte: { dGroesseMit: se.dMit, gegenlauf: se.dOhne - se.dMit, generationen: a.generationen }, zeuge: { fehler: a.fehler, antworten: se.geb || 0, streuung: Math.abs(se.dMit || 0) + Math.abs(se.dOhne || 0), vor: se.m0, nach: se.mit, gegenlauf: se.dOhne - se.dMit > 0, erbe }, nicht: und(ohneErbe) },
                            2: { werte: { auc: a.auc, nKlein: a.nKlein, nGross: a.nGross }, zeuge: { fehler: a.fehler, antworten: (a.inseln || []).reduce((s, x) => s + x, 0), streuung: a.inselStreuung || 0, erbe }, nicht: und(ohneErbe, a.nGross < 2000 ? "keine Insel mit 2 000: die volle Region trägt " + a.nGross + " Tiere" : null) },
                            3: { werte: { saaten: 1, musterZahl }, zeuge: { fehler: a.fehler, antworten: (se.geb || 0) + (a.kontingenzPaare || 0), streuung: a.inselStreuung || 0, gegenlauf: se.dOhne - se.dMit > 0 }, nicht: und(musterZahl < 10 ? musterZahl + " von 5 gemessenen Mustern erscheinen (Selektion, Drift, Kontingenz, Neuheit, Konvergenz)" : null, ohneErbe) },
                            4: { werte: { konvergenzProzent: konvergenz ? 100 : 0, neuheitProzent: neuheit ? 100 : 0, spindelLinien: a.spindelLinien, musterZahl }, zeuge: { fehler: a.fehler, antworten: a.gattungen || 0, streuung: a.gattungen > 1 ? 1 : 0 }, nicht: und(!neuheit ? "kein Merkmal außerhalb des Start-Bauplans: " + a.gattungen + " Gattungen tragen dieselben 5 Dials" : null, !konvergenz ? "Spindelform in " + a.spindelLinien + " Linie (das Fisch-Gesetz), nicht ≥ 2" : null) },
                            5: { werte: { gleichAnteil: a.gleichAnteil, anderAnteil: a.anderAnteil, musterZahl }, zeuge: { fehler: a.fehler, antworten: a.kontingenzPaare || 0, streuung: a.anderAnteil || 0, erbe }, nicht: und(!(a.mutationsFolge > 0) ? "keine Mutations-Folge: der Guss liest 5 Dials, kein Genom, das mutiert" : null) },
                            6: { werte: { musterZahl, saatenFremd: a.saatenFremd }, zeuge: { fehler: a.fehler, antworten: (a.gesetzTeile || []).length, streuung: musterZahl }, nicht: "das Gesetz der Welt trägt " + (a.gesetzTeile || []).join(", ") + " — keine Saat mit fremdem Licht oder Lösungsmittel" },
                        },
                    };
                },
                sprossen: {
                    1: S({
                        soll: [
                            K.soll(MU, 1, "Größe sinkt im Bild", { key: "dGroesseMit", rel: "<", zahl: 0, refQuelle: "das Vorzeichen des Richters: „Größe sinkt“ — Δ mittlere Größe der Hirsche unter Räuberdruck < 0" }),
                            K.soll(MU, 1, "Gegenlauf ohne Räuber", { key: "gegenlauf", rel: ">", zahl: 0, refQuelle: "der Gegenlauf (R7): Δ Größe ohne Räuber − Δ Größe mit Räubern > 0" }),
                            K.soll(MU, 1, "Räuberdruck auf große Hirsche", { key: "generationen", rel: "≥", zahl: 1000, quelleFeld: "preis", quelleWort: "10³ Generationen" }),
                        ],
                        werte: { dGroesseMit: -0.12, gegenlauf: 0.15, generationen: 1000 },
                        zeuge: { min: 20, was: "Geburten im Zeitraffer mit und ohne Räuber", streu: true, aend: "der Räuberdruck", gegen: "ohne Räuber", erbe: "Kind mit Eltern" },
                        taeter: "stamm/kreatur-leben.js _creatureNaturalBirth (kein Erbe der Größe)",
                        nicht: "kein Erbe — keine Antwort auf Selektion",
                        leser: L_BODY,
                        unklar: "„Steigung im Band der Natur“ nennt kein Band — Vorschlag: Haldane-Rate der Größe 0,01–0,1 (Gingerich 2009) als Zahl der Karte",
                    }),
                    2: S({
                        soll: [K.soll(MU, 2, "trennbar ≥ 0,9", { key: "auc" }), K.soll(MU, 2, "Insel N = 20", { key: "nKlein" }), K.soll(MU, 2, "2 000", { key: "nGross", rel: "≥", zahl: 2000 })],
                        werte: { auc: 0.94, nKlein: 20, nGross: 2000 },
                        zeuge: { min: 20, was: "Hirsche zweier getrennter Bestände", streu: true, erbe: "Kind mit Eltern" },
                        taeter: "stamm/kreatur-leben.js _bestandRegion (keine Insel, kein Erbe)",
                        nicht: "kein Erbe, keine Insel mit 2 000",
                        leser: L_BODY,
                    }),
                    3: S({
                        soll: [K.soll(MU, 3, "Statistik aus 100 Saaten", { key: "saaten", rel: "≥", zahl: 100 }), K.soll(MU, 3, "je Muster mit Gegenlauf", { key: "musterZahl", rel: "≥", zahl: 10, quelleFeld: "umfang", quelleWort: "10/30" })],
                        werte: { saaten: 100, musterZahl: 11 },
                        zeuge: { min: 20, was: "Experimente der Leiter in der Welt", streu: true, gegen: "je Muster" },
                        taeter: "stamm/kreatur-leben.js (kein Erbe — kein Muster der Evolution)",
                        nicht: "0 von 30 Mustern",
                        leser: L_BODY,
                    }),
                    4: S({
                        soll: [K.soll(MU, 4, "Konvergenz in ≥ 80 % der Saaten", { key: "konvergenzProzent", einheit: "%" }), K.soll(MU, 4, "Anteil Saaten mit neuer Funktion", { key: "neuheitProzent", rel: ">", zahl: 0, refQuelle: "das Wort des Richters: ein Anteil Saaten mit neuer Funktion > 0 (Tiefe: ein Merkmal, das nicht im Start-Bauplan stand)" }), K.soll(MU, 4, "Konvergenz in ≥ 80 % der Saaten", { key: "spindelLinien", rel: "≥", zahl: 2, quelleFeld: "tiefe", quelleWort: "≥ 2 getrennten Linien" }), K.soll(MU, 4, "Anteil Saaten mit neuer Funktion", { key: "musterZahl", rel: "≥", zahl: 20, quelleFeld: "umfang", quelleWort: "20/30" })],
                        werte: { konvergenzProzent: 85, neuheitProzent: 30, spindelLinien: 2, musterZahl: 21 },
                        zeuge: { min: 4, was: "Gattungen mit ihrem Bauplan", streu: true },
                        taeter: "tetrapoda-core.js GATTUNGEN (5 Dials, kein neues Merkmal)",
                        nicht: "keine Neuheit, keine Konvergenz",
                        leser: L_GATT,
                    }),
                    5: S({
                        soll: [
                            K.soll(MU, 5, "gleiche Folge → byte-gleiches Bild", { key: "gleichAnteil", rel: "=", zahl: 1, refQuelle: "byte-gleich: jedes Paar gleicher Folge gießt denselben Leib (Anteil 1)" }),
                            K.soll(MU, 5, "andere Folge → anderes", { key: "anderAnteil", rel: "=", zahl: 1, refQuelle: "jedes Paar anderer Folge gießt einen anderen Leib (Anteil 1)" }),
                            K.soll(MU, 5, "Wiederholungs-Paare", { key: "musterZahl", rel: "≥", zahl: 30, quelleFeld: "umfang", quelleWort: "30/30" }),
                        ],
                        werte: { gleichAnteil: 1, anderAnteil: 1, musterZahl: 30 },
                        zeuge: { min: 6, was: "Güsse gleicher und anderer Folge", streu: true, erbe: "eine Mutations-Folge" },
                        taeter: "stamm/koerper-leib.js _buildCreatureGroup (5 Dials, keine Mutations-Folge)",
                        nicht: "keine Mutations-Folge",
                        leser: "stamm/koerper-leib.js:2469 _buildCreatureGroup — (soul, { dialsOv }) gießt aus 5 Dials, kein Genom mit Mutations-Folge",
                    }),
                    6: S({
                        soll: [K.soll(MU, 6, "K30", { key: "musterZahl", rel: "≥", zahl: 30 }), K.soll(MU, 6, "10 Planeten-Saaten", { key: "saatenFremd", rel: "≥", zahl: 10 })],
                        werte: { musterZahl: 30, saatenFremd: 10 },
                        zeuge: { min: 4, was: "Teile des Gesetzes der Welt", streu: true },
                        taeter: "stamm/speicher-welten.js _weltGesetz (kein Licht, kein Lösungsmittel)",
                        nicht: "keine fremde Physik",
                        leser: "stamm/speicher-welten.js:88 _weltGesetz — trägt Schwere, Himmel, Wetter, Gelände, Ort: keinen Stern, kein Lösungsmittel",
                    }),
                },
            },

            // ═══ ZEITREISE: die Geschichte des Planeten im Faden ═══
            [ZR]: {
                sek: 50,
                pfad: PFAD_PLANET,
                ungefahren: "die Bildpaare und Blind-Sortierungen (S1, S5, S6) — auf swiftshader kein Schuss; die Epoche selbst ist nur als Antwort des Fadens erreichbar (die Reise lädt eine Welt)",
                mess: async function (H, U, M) {
                    const P = async (r, T, A) => {
                        const mittel = (l) => (l.length ? l.reduce((s, x) => s + x, 0) / l.length : NaN);
                        const sd = (l) => {
                            const m = mittel(l);
                            return l.length > 1 ? Math.sqrt(l.reduce((s, x) => s + (x - m) * (x - m), 0) / (l.length - 1)) : 0;
                        };
                        const C = r.constructor;
                        const LG = C._lebensraumGesetz();
                        const aus = { fehler: null };
                        try {
                            await r._fadenQuelle();
                            const samen = r._planetSamen();
                            const an = await r._planetAnker();
                            const grad = (x) => Math.round(((x * 180) / Math.PI) * 100) / 100;
                            const B0 = grad(an.breite), L0 = grad(an.laenge);
                            const frage = (sa, b, l, z) => r._planetAuftrag({ type: "planet-ort", samen: sa, breite: b, laenge: l, zeitMa: z });
                            const rein = (o) => JSON.stringify(o, (k, v) => (k === "requestId" || k === "type" ? undefined : v));
                            const punkte = [];
                            for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) punkte.push([Math.round((B0 + (i - 1.5) * 1.5) * 100) / 100, Math.round((L0 + (j - 1) * 1.5) * 100) / 100]);
                            const je = {};
                            let antworten = 0;
                            for (const z of A.epochen) {
                                const o = await Promise.all(punkte.map((p) => frage(samen, p[0], p[1], z)));
                                antworten += o.length;
                                je[z] = o.map((x) => ({ land: x.land, sommer: x.delta.klima.sommer, wald: x.delta.wuchs.wald, decke: x.delta.wuchs.decke, extra: Object.keys(x.delta).filter((k) => !["klima", "meer", "wetter", "wuchs", "wildnis"].includes(k)).length, fp: JSON.stringify(x.delta.wuchs) }));
                            }
                            aus.antworten = antworten;
                            aus.epochen = A.epochen.length;
                            const sommer = (z) => je[z].map((x) => x.sommer);
                            aus.klimaStreuung = sd(A.epochen.map((z) => mittel(sommer(z))));
                            aus.dSommer = A.epochen.map((z) => Math.round((mittel(sommer(z)) - mittel(sommer(0))) * 100) / 100);
                            const waldAnteil = (z) => {
                                const l = je[z].filter((x) => x.land);
                                return l.length ? mittel(l.map((x) => x.wald)) : NaN;
                            };
                            aus.waldVerh = waldAnteil(-0.1) / waldAnteil(0);
                            aus.wuchsBilder = new Set([].concat(...A.epochen.map((z) => je[z].map((x) => x.fp)))).size;
                            aus.faunaFelder = Math.max(...A.epochen.map((z) => Math.max(...je[z].map((x) => x.extra))));
                            const h1 = await frage(samen, punkte[0][0], punkte[0][1], -0.01);
                            const h0 = await frage(samen, punkte[0][0], punkte[0][1], 0);
                            const h2 = await frage(samen, punkte[0][0], punkte[0][1], -0.01);
                            aus.hinZurueckGleich = rein(h1) === rein(h2) && rein(h0) !== rein(h1) ? 1 : 0;
                            const zeiten = [];
                            for (let i = 0; i < 50; i++) zeiten.push(-Math.round((540 * i) / 49));
                            const k50 = await Promise.all(zeiten.map((z) => frage(samen, B0, L0, z)));
                            aus.zeitpunkte = k50.filter((x) => x && x.delta).length;
                            aus.k50Streuung = sd(k50.map((x) => x.delta.klima.sommer));
                            aus.artenJeZeit = 1;
                            const saaten = [samen].concat(A.saaten);
                            let gleich = 0, n = 0;
                            for (const sa of saaten) {
                                const E = [0, -1, -10, -50, -100, -200, -300, -500, -1000, -4000];
                                const a1 = await Promise.all(E.map((z) => frage(sa, B0, L0, z)));
                                const a2 = await Promise.all(E.map((z) => frage(sa, B0, L0, z)));
                                for (let i = 0; i < E.length; i++) {
                                    n++;
                                    if (rein(a1[i]) === rein(a2[i])) gleich++;
                                }
                            }
                            aus.konsistentProzent = n ? (100 * gleich) / n : undefined;
                            aus.konsistentEpochen = n / saaten.length;
                            aus.saaten = saaten.length;
                            aus.konsistentN = n;
                            const gattungen = Object.keys(LG.L.gattung);
                            aus.arten = gattungen.length + ["_vogelGesetz", "_fischGesetz", "_bestaeuberGesetz"].filter((k) => typeof C[k] === "function").length;
                            const TC = globalThis.__tetrapodaCore;
                            aus.verwandt = gattungen.filter((g) => ["ahn", "schwester", "klade", "vorfahr"].some((k) => TC.GATTUNGEN[g] && TC.GATTUNGEN[g][k] !== undefined)).length;
                            aus.bauplaene = aus.arten;
                        } catch (e) {
                            aus.fehler = String((e && e.message) || e).slice(0, 200);
                        }
                        return aus;
                    };
                    const a = await H.seite("return await (" + P.toString() + ")(r, T, " + JSON.stringify({ epochen: [0, -0.01, -0.1, -1, -10, -50, -100, -300, -500, -4000], saaten: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => "evo-saat-" + i) }) + ");");
                    const ohneFauna = "Flora und Fauna der Epoche sind die von heute: die Antwort des Fadens trägt " + (a.faunaFelder || 0) + " Felder der Fauna, der Wuchs " + (a.wuchsBilder || 0) + " Bild(er) über " + (a.epochen || 0) + " Epochen";
                    const z = { fehler: a.fehler, antworten: a.antworten || 0, streuung: a.klimaStreuung || 0 };
                    const auge = (n) => M.auge("evolution-zeitreise-s" + n, { ort: "wiese" });
                    return {
                        sprossen: {
                            1: { werte: { hinZurueckGleich: a.hinZurueckGleich }, zeuge: z, auge: await auge(1), nicht: ohneFauna + "; die Konsole reist nur in ganzen Ma (10⁴ Jahre nicht erreichbar)" },
                            2: { werte: { waldVerh: a.waldVerh }, zeuge: z, nicht: ohneFauna + " — kein Körpermassen-Median der Eiszeit" },
                            3: { werte: { arten: a.arten, verwandtProzent: a.arten ? (100 * (a.verwandt || 0)) / a.arten : undefined }, zeuge: z, nicht: ohneFauna + "; " + (a.verwandt || 0) + " Gattungen mit Ahn oder Schwester" },
                            4: { werte: { heutigeArten: a.arten, vorfahrAnteil: a.arten ? (a.verwandt || 0) / a.arten : undefined }, zeuge: z, nicht: ohneFauna + "; kein Vorfahr auffindbar" },
                            5: { werte: { epochen: a.epochen }, zeuge: z, auge: await auge(5), nicht: ohneFauna + " — keine Organe nach ihrem Erfinden" },
                            6: { werte: {}, zeuge: z, auge: await auge(6), nicht: "Baupläne je Epoche: " + (a.bauplaene || 0) + " zu jeder Zeit (der Bestand liest keine Zeit)" },
                            7: { werte: { zeitpunkte: a.zeitpunkte }, zeuge: { fehler: a.fehler, antworten: a.zeitpunkte || 0, streuung: a.k50Streuung || 0 }, nicht: "die Vielfalt liest keine Zeit: " + (a.arten || 0) + " Arten an jedem der " + (a.zeitpunkte || 0) + " Zeitpunkte — keine Kurve gegen Sepkoski" },
                            8: { werte: { konsistentProzent: a.konsistentProzent, saaten: a.saaten, epochen: a.konsistentEpochen }, zeuge: { fehler: a.fehler, antworten: a.konsistentN || 0, streuung: a.klimaStreuung || 0 }, nicht: "kein Ereignis der Vergangenheit, das verlegt werden kann: die Scheibe liest den Plan und die Zeit (planet-core planetScheibe), keinen Verlauf; " + (a.saaten || 0) + " Saaten gefragt" },
                        },
                    };
                },
                sprossen: {
                    1: S({
                        soll: [K.soll(ZR, 1, "Panel ordnet Bildpaare Gegenwart/Epoche ≥ 0,8", { key: "panel" }), K.soll(ZR, 1, "Hin- und Rücksprung byte-gleiches Bild", { key: "hinZurueckGleich", rel: "=", zahl: 1, refQuelle: "byte-gleich: Hin- und Rücksprung liefern dieselbe Antwort des Fadens (Anteil 1)" })],
                        werte: { panel: 0.85, hinZurueckGleich: 1 },
                        zeuge: { min: 24, was: "Antworten des Planet-Fadens je Epoche", streu: true },
                        auge: { pose: "Ego an der Wiese (Gegenwart; die Epoche lädt eine Reise-Welt)", vorbild: "Panel ordnet Bildpaare Gegenwart/Epoche ≥ 0,8 (Prüfer-Satz R11)" },
                        taeter: "stamm/kreatur-leben.js _pickFaunaSoulAtPlayer (keine Epochen-Fauna)",
                        nicht: "keine Epochen-Flora und -Fauna",
                        leser: L_ZEIT + "; stamm/feld-leben.js:1272 reise — der Satz der Konsole nimmt nur ganze Ma (10⁴ Jahre nicht erreichbar)",
                    }),
                    2: S({
                        soll: [K.soll(ZR, 2, "Körpermassen-Median über dem der Gegenwart", { key: "medianVerh", rel: ">", zahl: 1, refQuelle: "das Wort des Richters: Median der Körpermasse der Eiszeit / der Gegenwart > 1" }), K.soll(ZR, 2, "Biom-Anteile gegen Paläo-Rekonstruktion ±20 %", { key: "waldVerh", ref: 0.5, refQuelle: "Erde, Letztes Glaziales Maximum: Waldfläche ≈ halb der heutigen (Adams & Faure 1997, QEN-Paläovegetations-Atlas)" })],
                        werte: { medianVerh: 1.6, waldVerh: 0.52 },
                        zeuge: { min: 24, was: "Antworten des Planet-Fadens je Epoche", streu: true },
                        taeter: "phyto-core.js / stamm/kreatur-leben.js (keine Eiszeit-Biome, keine Megafauna)",
                        nicht: "keine Megafauna, keine Tundra-Flora der Epoche",
                        leser: L_ZEIT,
                    }),
                    3: S({
                        soll: [K.soll(ZR, 3, "20 Arten am Zielpunkt", { key: "arten", rel: "≥", zahl: 20 }), K.soll(ZR, 3, "Ahn oder Schwester einer heutigen = 100 %", { key: "verwandtProzent", einheit: "%" })],
                        werte: { arten: 22, verwandtProzent: 100 },
                        zeuge: { min: 24, was: "Antworten des Planet-Fadens je Epoche", streu: true },
                        taeter: "tetrapoda-core.js GATTUNGEN (keine Ahnen, keine Schwestern)",
                        nicht: "keine Ahnen und Schwestern",
                        leser: L_GATT,
                    }),
                    4: S({
                        soll: [K.soll(ZR, 4, "100 heutige Arten", { key: "heutigeArten", rel: "≥", zahl: 100 }), K.soll(ZR, 4, "≥ 0,8", { key: "vorfahrAnteil" })],
                        werte: { heutigeArten: 100, vorfahrAnteil: 0.85 },
                        zeuge: { min: 24, was: "Antworten des Planet-Fadens je Epoche", streu: true },
                        taeter: "tetrapoda-core.js GATTUNGEN (kein Vorfahr)",
                        nicht: "kein Vorfahr, kein Grasland der Epoche",
                        leser: L_GATT,
                    }),
                    5: S({
                        soll: [K.soll(ZR, 5, "Blind-Sortierung von Bildern aus 10 Epochen nach Alter ≥ 90 %", { key: "blindProzent", einheit: "%" }), K.soll(ZR, 5, "aus 10 Epochen", { key: "epochen", rel: "≥", zahl: 10 })],
                        werte: { blindProzent: 92, epochen: 10 },
                        zeuge: { min: 24, was: "Antworten des Planet-Fadens je Epoche", streu: true },
                        auge: { pose: "Ego an der Wiese (die Epochen laden je eine Reise-Welt)", vorbild: "Blind-Sortierung von Bildern aus 10 Epochen nach Alter ≥ 90 % (R11)" },
                        taeter: "phyto-core.js (keine Epochen-Flora: Wuchs liest kein zeitMa)",
                        nicht: "keine Epochen-Flora",
                        leser: L_ZEIT,
                    }),
                    6: S({
                        soll: [K.soll(ZR, 6, "Panel ordnet 20 Unterwasserbilder ≥ 70 %", { key: "panelProzent", einheit: "%" }), K.soll(ZR, 6, "Baupläne je Epoche steigen früh steil", { key: "bauplanAnstieg", rel: ">", zahl: 1, refQuelle: "Fossilbericht: Baupläne steigen im Kambrium steil an (Erwin et al. 2011) — Baupläne der späten / der frühen Epoche > 1" })],
                        werte: { panelProzent: 75, bauplanAnstieg: 3 },
                        zeuge: { min: 24, was: "Antworten des Planet-Fadens je Epoche", streu: true },
                        auge: { pose: "unter Wasser an der Wiese (das Kambrium-Meer lädt eine Reise-Welt)", vorbild: "Panel ordnet 20 Unterwasserbilder ≥ 70 % (R11)" },
                        taeter: "stamm/kreatur-leben.js (Baupläne je Epoche konstant)",
                        nicht: "kein Kambrium-Meer",
                        leser: L_ZEIT,
                    }),
                    7: S({
                        soll: [K.soll(ZR, 7, "Rangkorrelation ≥ 0,6", { key: "rang" }), K.soll(ZR, 7, "Diversität an 50 Zeitpunkten", { key: "zeitpunkte", rel: "≥", zahl: 50 })],
                        werte: { rang: 0.7, zeitpunkte: 50 },
                        zeuge: { min: 50, was: "Antworten des Planet-Fadens an 50 Zeitpunkten", streu: true },
                        taeter: "stamm/kreatur-leben.js _lebensraumGesetz (Vielfalt ohne Zeit)",
                        nicht: "keine Vielfaltskurve",
                        leser: L_ZEIT,
                    }),
                    8: S({
                        soll: [K.soll(ZR, 8, "konsistent ≥ 95 %", { key: "konsistentProzent", einheit: "%" }), K.soll(ZR, 8, "100 Saaten", { key: "saaten", rel: "≥", zahl: 100 }), K.soll(ZR, 8, "10 Epochen", { key: "epochen", rel: "≥", zahl: 10 })],
                        werte: { konsistentProzent: 98, saaten: 100, epochen: 10 },
                        zeuge: { min: 20, was: "doppelt gefragte Antworten des Fadens je Saat und Epoche", streu: true },
                        taeter: "planet-core.js planetScheibe (kein Ereignis-Verlauf)",
                        nicht: "kein verlegbares Ereignis",
                        leser: "planet-core.js:1633 planetScheibe — (plan, zeitMa) liest Plan und Zeit, keinen Verlauf von Ereignissen, den ein Eingriff verlegt",
                        unklar: "„Ereignis der Vergangenheit verlegt → Gegenwart ändert sich“ nennt keine Zahl — Vorschlag: Anteil geänderter Gegenwart-Antworten > 0 bei verlegtem Ereignis, = 0 ohne",
                    }),
                },
            },

            // ═══ BAUPLAN: der Morphoraum der Zufalls-Genome ═══
            [BP]: {
                sek: 40,
                mutiert: true,
                pfad: PFAD_TIER,
                ungefahren: "das Blindtest-Video (S4) und die Fremdwelt-Probe (S6) — auf swiftshader kein Schuss; die Silhouette misst die Hülle des Leibs, nicht das Bild",
                mess: async function (H, U, M) {
                    const P = async (r, T, A) => {
                        const mittel = (l) => (l.length ? l.reduce((s, x) => s + x, 0) / l.length : NaN);
                        const sd = (l) => {
                            const m = mittel(l);
                            return l.length > 1 ? Math.sqrt(l.reduce((s, x) => s + (x - m) * (x - m), 0) / (l.length - 1)) : 0;
                        };
                        const s = r.state;
                        const C = r.constructor;
                        const TC = globalThis.__tetrapodaCore;
                        const LG = C._lebensraumGesetz();
                        const aus = { fehler: null };
                        const meine = [];
                        const alt = { wurf: s.faunaLifecycle ? s.faunaLifecycle.lastTick : null, max: s.maxCreatures, p: s.playerMesh.position.clone(), yaw: s.yaw, pitch: s.pitch };
                        const B = new T.Box3();
                        const V = new T.Vector3();
                        const desk = (g) => {
                            g.updateMatrixWorld(true);
                            B.setFromObject(g).getSize(V);
                            const tb = g.userData._tierBaum || {};
                            return [V.x, V.y, V.z, tb.beinL || 1e-6, tb.leibV || 1e-6].map((x) => Math.log(Math.max(1e-6, x)));
                        };
                        try {
                            const heute = [];
                            const F = r._bestandRegionen().regionen;
                            const bs = {};
                            for (const k of r._bestandNah()) for (const t of (F[k] || { tiere: [] }).tiere) (bs[t.g] = bs[t.g] || []).push(t.bs);
                            for (const soul of C.CREATURE_SOUL_NAMES) {
                                const g = r._buildCreatureGroup(soul);
                                if (!g) continue;
                                const d = desk(g);
                                r._disposeSoulGroup(g);
                                for (const b of bs[C.TETRAPODA_SOUL_MAP[soul]] || [1]) {
                                    const l = Math.log(b);
                                    heute.push([d[0] + l, d[1] + l, d[2] + l, d[3] + l, d[4] + 3 * l]);
                                }
                            }
                            const PK = TC.PARAMS_BY_KIND.kreatur;
                            let u = A.saat >>> 0;
                            const zz = () => (u = (Math.imul(u, 1664525) + 1013904223) >>> 0) / 4294967296;
                            const fl = s.faunaLifecycle;
                            if (fl) fl.lastTick = 1e12;
                            s.maxCreatures = Math.max(s.maxCreatures || 0, (s.creatures || []).length + A.n + 2);
                            const pm = s.playerMesh.position;
                            const zufall = [];
                            for (let i = 0; i < A.n; i++) {
                                const soul = C.CREATURE_SOUL_NAMES[Math.floor(zz() * C.CREATURE_SOUL_NAMES.length)];
                                const dials = {};
                                for (const p of PK) dials[p.id] = p.min + (p.max - p.min) * zz();
                                const gat = C.TETRAPODA_SOUL_MAP[soul];
                                let ort = null;
                                for (let d = 25 + 6 * i; d <= 260 && !ort; d += 15)
                                    for (let q = 0; q < 16 && !ort; q++) {
                                        const x = pm.x + Math.cos((q * Math.PI) / 8 + d + i) * d;
                                        const z = pm.z + Math.sin((q * Math.PI) / 8 + d + i) * d;
                                        if (r._landAt(x, z) && !r._nassAt(x, z) && LG.lebensraum(gat, r._bodenKlasseAt(x, z), LG.L) > 0) ort = { x, z };
                                    }
                                if (!ort) continue;
                                const c = r.spawnCreatureAt(ort.x, r.getTerrainHeightAt(ort.x, ort.z) + 0.5, ort.z, "happy", soul, { precise: true, bodySize: 1, dialsOv: dials });
                                if (!c) continue;
                                const alleBs = [].concat(...Object.values(bs));
                                const l = alleBs.length ? Math.log(alleBs[i % alleBs.length]) : 0;
                                const d0 = desk(c);
                                const m = { c, d: [d0[0] + l, d0[1] + l, d0[2] + l, d0[3] + l, d0[4] + 3 * l], weg: 0, lx: c.position.x, lz: c.position.z, dials };
                                meine.push(m);
                                zufall.push(m.d);
                            }
                            let t = performance.now();
                            for (let i = 0; i < A.takte; i++) {
                                r._gameLoopTick((t += 1000 / 60));
                                for (const m of meine) {
                                    m.weg += Math.hypot(m.c.position.x - m.lx, m.c.position.z - m.lz);
                                    m.lx = m.c.position.x;
                                    m.lz = m.c.position.z;
                                }
                            }
                            const ok = (m) => m.weg > 0.3 && Number.isFinite(m.c.position.y) && Math.abs(m.c.position.y - r.getTerrainHeightAt(m.c.position.x, m.c.position.z)) < 0.6;
                            aus.genome = meine.length;
                            aus.bewegt = meine.filter(ok).length;
                            aus.wegStreuung = sd(meine.map((m) => m.weg));
                            aus.tempoMs = meine.length ? mittel(meine.map((m) => m.weg)) / (A.takte / 60) : undefined;
                            const vol = (l) => (l.length > 1 ? [0, 1, 2, 3, 4].reduce((p, k) => p * Math.max(1e-9, sd(l.map((d) => d[k]))), 1) : NaN);
                            aus.volHeute = vol(heute);
                            aus.volZufall = vol(zufall);
                            aus.volumenFaktor = aus.volZufall / aus.volHeute;
                            aus.heute = heute.length;
                            const lo = [0, 1, 2, 3, 4].map((k) => Math.min(...heute.map((d) => d[k])));
                            const hi = [0, 1, 2, 3, 4].map((k) => Math.max(...heute.map((d) => d[k])));
                            const draussen = meine.filter((m) => m.d.some((x, k) => x < lo[k] - 1e-6 || x > hi[k] + 1e-6));
                            aus.ausserhalb = draussen.length;
                            aus.tragend = draussen.filter(ok).length;
                            aus.modi = new Set(meine.filter(ok).map((m) => (Number.isFinite(m.c.position.y) && !r._nassAt(m.c.position.x, m.c.position.z) ? "lauf" : "schwimm"))).size;
                            const c0 = (s.creatures || []).find((c) => !meine.some((m) => m.c === c));
                            if (c0) {
                                const p = c0.position;
                                aus.pose = { px: p.x + 4, py: p.y + 1.8, pz: p.z + 4, lx: p.x, ly: p.y + 0.6, lz: p.z };
                            }
                        } catch (e) {
                            aus.fehler = String((e && e.message) || e).slice(0, 200);
                        } finally {
                            for (const m of meine) r.removeCreature(m.c);
                            if (s.faunaLifecycle) s.faunaLifecycle.lastTick = alt.wurf;
                            s.maxCreatures = alt.max;
                            s.playerMesh.position.copy(alt.p);
                            s.yaw = alt.yaw;
                            s.pitch = alt.pitch;
                        }
                        return aus;
                    };
                    const a = await H.seite("return await (" + P.toString() + ")(r, T, " + JSON.stringify({ n: 20, takte: 180, saat: 20261119 }) + ");");
                    const pr = (x, n) => (n > 0 ? (100 * x) / n : undefined);
                    const z = { fehler: a.fehler, antworten: a.genome || 0, streuung: a.wegStreuung || 0 };
                    const und = (...l) => l.filter(Boolean).join("; ") || undefined;
                    const ohneNatur = "kein Natur-Bildsatz in der Welt und keine Gangart aus dem Genom: die Zufalls-Genome laufen alle (Schwimmen und Fliegen sind eigene Gesetze, FISCH_GESETZ und Vogel)";
                    return {
                        sprossen: {
                            1: { werte: { bewegtProzent: pr(a.bewegt, a.genome), genome: a.genome, volumenFaktor: a.volumenFaktor }, zeuge: z, nicht: und(a.genome < 1000 ? "1 000 Zufalls-Genome: im Deckel gegossen und gelaufen " + a.genome + " (der Guss eines Genoms kostet den Ofen der Gattung)" : null) },
                            2: { werte: { volumenFaktor: a.volumenFaktor, modi: a.modi }, zeuge: z, nicht: ohneNatur },
                            3: { werte: { volumenFaktor: a.volumenFaktor }, zeuge: z, nicht: "nur Tetrapoden: keine Gliederfüßer, Weichtiere oder Wuchsformen aus einem Genom; " + ohneNatur },
                            4: { werte: { tempoMs: a.tempoMs }, zeuge: z, auge: await M.auge("evolution-bauplan-s4", a.pose || { ort: "wiese" }) },
                            5: { werte: { ausserhalbProzent: pr(a.ausserhalb, a.genome), tragendProzent: pr(a.tragend, a.ausserhalb) }, zeuge: z },
                            6: { werte: { wesen: a.genome, planeten: 1, volumenVsErde: a.volumenFaktor }, zeuge: z, auge: await M.auge("evolution-bauplan-s6", a.pose || { ort: "wiese" }), nicht: "ein Planet, 4 Gattungen — keine Wesen anderer Planeten" },
                        },
                    };
                },
                sprossen: {
                    1: S({
                        soll: [K.soll(BP, 1, "Bewegungs-Anteil ≥ 95 %", { key: "bewegtProzent", einheit: "%" }), K.soll(BP, 1, "1 000 Zufalls-Genome", { key: "genome", rel: "≥", zahl: 1000 }), K.soll(BP, 1, "1 000 Zufalls-Genome", { key: "volumenFaktor", rel: "≥", zahl: 10, quelleFeld: "umfang", quelleWort: "×10" })],
                        werte: { bewegtProzent: 97, genome: 1000, volumenFaktor: 12 },
                        zeuge: { min: 10, was: "Zufalls-Genome gegossen und im Takt der Welt gelaufen", streu: true },
                        taeter: "stamm/koerper-leib.js _buildCreatureGroup (5 Dials — der Raum der Genome)",
                        leser: "stamm/koerper-leib.js:2469 _buildCreatureGroup — gießt je neuem Genom den Ofen der Gattung (1 000 im Deckel nicht)",
                    }),
                    2: S({
                        soll: [K.soll(BP, 2, "Deskriptoren gegen Natur-Bildsatz der Tetrapoden", { key: "abdeckungProzent", rel: "≥", zahl: 50, quelleFeld: "tiefe", quelleWort: "≥ 50 %", einheit: "%" }), K.soll(BP, 2, "Deskriptoren gegen Natur-Bildsatz der Tetrapoden", { key: "volumenFaktor", rel: "≥", zahl: 100, quelleFeld: "umfang", quelleWort: "×10²" }), K.soll(BP, 2, "Deskriptoren gegen Natur-Bildsatz", { key: "modi", rel: "≥", zahl: 4, refQuelle: "die vier Gangarten des Umfangs: Laufen, Schwimmen, Fliegen, Schlängeln ENTSTEHEN" })],
                        werte: { abdeckungProzent: 55, volumenFaktor: 120, modi: 4 },
                        zeuge: { min: 10, was: "Zufalls-Genome gegossen und gelaufen", streu: true },
                        taeter: "tetrapoda-core.js (Gangarten als eigene Gesetze, kein Genom)",
                        nicht: "kein Natur-Bildsatz, keine entstehende Gangart",
                        leser: "tetrapoda-core.js:62 GATTUNGEN — 5 Dials eines Vierbeiners; Fisch und Vogel sind eigene Gesetze, keine Form des Genoms",
                    }),
                    3: S({
                        soll: [K.soll(BP, 3, "über alle Natur-Bildsätze", { key: "abdeckungAlleProzent", rel: "≥", zahl: 50, quelleFeld: "tiefe", quelleWort: "≥ 50 %", einheit: "%" }), K.soll(BP, 3, "wie Sprosse 2, über alle Natur-Bildsätze", { key: "volumenFaktor", rel: "≥", zahl: 1000, quelleFeld: "umfang", quelleWort: "×10³" })],
                        werte: { abdeckungAlleProzent: 55, volumenFaktor: 1200 },
                        zeuge: { min: 10, was: "Zufalls-Genome gegossen und gelaufen", streu: true },
                        taeter: "tetrapoda-core.js (nur Tetrapoden)",
                        nicht: "keine Stämme jenseits der Tetrapoden",
                        leser: "tetrapoda-core.js:62 GATTUNGEN — trägt nur Vierbeiner; kein Genom für Gliederfüßer, Weichtiere, Wuchsformen",
                        unklar: "„wie Sprosse 2“ nennt die Zahl nicht selbst — die Station liest die Abdeckung ≥ 50 % aus der Tiefe",
                    }),
                    4: S({
                        soll: [K.soll(BP, 4, "Blindtest Spiel-Video ↔ Natur-Video in Bewegung ≤ 60 %", { key: "blindProzent", einheit: "%" })],
                        werte: { blindProzent: 55 },
                        zeuge: { min: 10, was: "Zufalls-Genome gelaufen", streu: true },
                        auge: { pose: "Third am ersten Tier der Welt (4 m seitlich, 1,8 m hoch), Video im Takt", vorbild: "Natur-Video derselben Gangart, Blindtest ≤ 60 % (R11)" },
                        taeter: "tetrapoda-core.js gangSchritt / cpgStep",
                    }),
                    5: S({
                        soll: [K.soll(BP, 5, "Hüllen-Abstand", { key: "ausserhalbProzent", rel: "≥", zahl: 30, quelleFeld: "umfang", quelleWort: "≥ 30 %", einheit: "%" }), K.soll(BP, 5, "Physik-Proben im Spiel", { key: "tragendProzent", rel: "≥", zahl: 90, quelleFeld: "tiefe", quelleWort: "≥ 90 %", einheit: "%" })],
                        werte: { ausserhalbProzent: 35, tragendProzent: 92 },
                        zeuge: { min: 10, was: "Zufalls-Genome gegossen und gelaufen", streu: true },
                        taeter: "stamm/koerper-leib.js _buildCreatureGroup (Dials im Band der vier Erd-Gattungen)",
                        unklar: "ein Natur-Bildsatz der irdischen Hülle fehlt — die Station misst gegen die Hülle der vier Erd-Gattungen der Welt (Hirsch, Wolf, Fuchs, Bär mit ihren Größen im Bestand)",
                    }),
                    6: S({
                        soll: [K.soll(BP, 6, "1 000 Wesen", { key: "wesen", rel: "≥", zahl: 1000 }), K.soll(BP, 6, "10 Planeten", { key: "planeten", rel: "≥", zahl: 10 }), K.soll(BP, 6, "Rang ≥ 0,7", { key: "rang" }), K.soll(BP, 6, "Morphoraum-Volumen > Erde", { key: "volumenVsErde", rel: ">", zahl: 1, refQuelle: "das Wort des Richters: Volumen des Morphoraums / Volumen der Erde > 1" })],
                        werte: { wesen: 1000, planeten: 10, rang: 0.75, volumenVsErde: 1.4 },
                        zeuge: { min: 10, was: "Zufalls-Genome gegossen", streu: true },
                        auge: { pose: "Third am ersten Tier der Welt", vorbild: "Fremdwelt-Probe (R10): Lebensweise aus dem Körper gelesen, Rang ≥ 0,7" },
                        taeter: "tetrapoda-core.js GATTUNGEN (ein Planet, 4 Gattungen)",
                        nicht: "keine Wesen anderer Planeten",
                        leser: L_GATT,
                        unklar: "„Erde“ ohne Natur-Morphoraum in der Welt — die Station misst gegen die vier Erd-Gattungen der Welt mit ihren Größen im Bestand (Produkt der Streuungen über 5 Deskriptoren)",
                    }),
                },
            },

            // ═══ FREMDE PHYSIK: Schwere, Luft, Stern, Lösungsmittel ═══
            [FP]: {
                sek: 25,
                mutiert: true,
                faecher: true,
                pfad: PFAD_TIER.concat(["stamm/speicher-welten.js", "planet-core.js", "voxel-worker.js"]),
                ungefahren: "die Bilder der Statik (S1) und die Fremdwelt-Probe (S7) — auf swiftshader kein Schuss",
                mess: async function (H, U, M) {
                    const P = async (r, T, A) => {
                        const mittel = (l) => (l.length ? l.reduce((s, x) => s + x, 0) / l.length : NaN);
                        const sd = (l) => {
                            const m = mittel(l);
                            return l.length > 1 ? Math.sqrt(l.reduce((s, x) => s + (x - m) * (x - m), 0) / (l.length - 1)) : 0;
                        };
                        const s = r.state;
                        const C = r.constructor;
                        const aus = { fehler: null };
                        try {
                            const G = C._weltGesetz(s.worldMeta);
                            aus.gesetzTeile = Object.keys(G);
                            const hat = (w) => aus.gesetzTeile.some((k) => k.toLowerCase().includes(w));
                            aus.luft = hat("luft") || hat("dichte") ? 1 : 0;
                            aus.stern = hat("stern") || hat("sonne") ? 1 : 0;
                            aus.loesung = hat("loesung") || hat("lösung") ? 1 : 0;
                            const gattungen = Object.keys(C._lebensraumGesetz().L.gattung);
                            const flieger = ["_vogelGesetz", "_bestaeuberGesetz"].filter((k) => typeof C[k] === "function").length;
                            aus.arten = gattungen.length + flieger + (typeof C._fischGesetz === "function" ? 1 : 0);
                            aus.fliegerAnteil = flieger / aus.arten;
                            aus.lebensS = C.FAUNA_MAX_AGE_MS / 1000;
                            await r._fadenQuelle();
                            const an = await r._planetAnker();
                            const grad = (x) => Math.round(((x * 180) / Math.PI) * 100) / 100;
                            const saaten = [r._planetSamen()].concat(A.saaten);
                            aus.saaten = [];
                            for (const sa of saaten) {
                                const o = await r._planetAuftrag({ type: "planet-ort", samen: sa, breite: grad(an.breite), laenge: grad(an.laenge), zeitMa: 0 });
                                aus.saaten.push({ sa, sommer: o.delta.klima.sommer, arten: aus.arten });
                            }
                            aus.energieStreuung = sd(aus.saaten.map((x) => x.sommer));
                            aus.artenStreuung = sd(aus.saaten.map((x) => x.arten));
                        } catch (e) {
                            aus.fehler = aus.fehler || String((e && e.message) || e).slice(0, 200);
                        }
                        return aus;
                    };
                    const a = await H.seite("return await (" + P.toString() + ")(r, T, " + JSON.stringify({ saaten: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => "evo-saat-" + i) }) + ");");
                    // S1 ÜBER DEN FÄCHER (stationen/faecher.js): 50 Saaten und die Saat der Welt × die Schweren 0,3 · 1 · 3 g; je Adresse der Guss
                    // des Leibs (stamm/koerper-leib.js:2574 `_buildCreatureGroup` „wolf“, der Ofen der Welt) unter der Schwere der Adresse
                    // (state.gravity, das Wort der Welt) — sein Bein-Querschnitt und sein Gang (tetrapoda `gangSchritt`). Die Schwere setzt das
                    // Gesetz der Welt, nie die Saat: eine andere Saat zählt ohne Fähigkeit
                    const FP_AN = async (r, T, a) => {
                        const s = r.state;
                        if (!s.worldMeta || a.saat !== s.worldMeta.seed)
                            return { fehlt: "keine Saat trägt ihr g: die Schwere setzt das Gesetz der Welt (state.gravity), der Faden baut jeden Planeten mit PLANET_ERDE (voxel-worker.js:1429; planet-core.js:319 g der Saat ungelesen)" };
                        const TC = globalThis.__tetrapodaCore;
                        const g0 = s.gravity;
                        try {
                            s.gravity = -9.81 * a.ort;
                            const g = r._buildCreatureGroup("wolf");
                            g.updateMatrixWorld(true);
                            const tb = g.userData._tierBaum || {};
                            const q = (tb.quer || []).filter((x) => x > 0);
                            const radius = q.length ? (q.reduce((u, v) => u + v, 0) / q.length) * (tb.f || 1) : NaN;
                            const gs = TC.gangSchritt(1.5, tb.beinL, r._gangZeile(false));
                            r._disposeSoulGroup(g);
                            return { f: a.ort, A: radius * radius, schritt: gs.schritt, omega: gs.omega };
                        } finally {
                            s.gravity = g0;
                        }
                    };
                    const geladen = await H.seite("return r.state.worldMeta && r.state.worldMeta.seed;");
                    const R1 = await FAECHER((c) => H.seite(c), {
                        gesetz: { fn: FP_AN, export: "stamm/koerper-leib.js:2574 _buildCreatureGroup (Guss unter state.gravity)", leser: "stamm/koerper-leib.js:492 _gangZeile" },
                        adressen: { saaten: [geladen, ...Array.from({ length: 50 }, (_, i) => "evo-g-saat-" + (i + 1))], orte: [0.3, 1, 3] },
                        ms: 8000,
                        masse: { gMin: { wie: "min", feld: "f" }, gMax: { wie: "max", feld: "f" }, guesse: { wie: "anzahl", nur: "saat" } },
                        schlecht: { feld: "A", richtung: "max" },
                        pose: (q) => "der Wolf unter " + q.ort + " g im Profil (Bein-Querschnitt im Bild), Saat " + q.saat,
                        ungemessen: ["die Regression aus Bildern (am Gerät)"],
                    });
                    const je = R1.je.map((e) => e.w).sort((u, v) => u.f - v.f);
                    const mw = (l) => (l.length ? l.reduce((u, v) => u + v, 0) / l.length : NaN);
                    const lx = je.map((x) => Math.log(x.f)), ly = je.map((x) => Math.log(x.A));
                    const sxx = lx.reduce((u, v) => u + (v - mw(lx)) ** 2, 0);
                    a.steigung = sxx > 0 ? lx.reduce((u, v, i) => u + (v - mw(lx)) * (ly[i] - mw(ly)), 0) / sxx : NaN;
                    const om = je.map((x) => x.omega);
                    a.gangStreuung = om.length > 1 ? Math.sqrt(om.reduce((u, v) => u + (v - mw(om)) ** 2, 0) / (om.length - 1)) : 0;
                    a.gMin = R1.werte.gMin;
                    a.gMax = R1.werte.gMax;
                    const saatenJeG = Math.min(...[0.3, 1, 3].map((g) => new Set(R1.je.filter((e) => e.a.ort === g).map((e) => e.a.saat)).size));
                    const n = (a.saaten || []).length;
                    const gesetz = "das Gesetz der Welt trägt " + (a.gesetzTeile || []).join(", ");
                    const p1 = a.steigung >= 0.75 && a.steigung <= 1;
                    const pruef = [p1, a.luft > 0, a.stern > 0, a.loesung > 0].filter(Boolean).length;
                    return {
                        sprossen: {
                            1: { werte: { steigung: a.steigung, saatenJeG, gMin: a.gMin, gMax: a.gMax }, zeuge: { fehler: R1.fehler.length ? R1.fehler.length + " Adressen warfen (" + R1.fehler[0].fehler + ")" : null, antworten: je.length, streuung: a.gangStreuung || 0, vor: je[0] && je[0].A, nach: je.length && je[je.length - 1].A }, nicht: (R1.fehlt || "") + " — " + saatenJeG + " Saat je g; das Quer-Maß des Leibs unter g × " + je.map((x) => x.f).join(" / ") + ": " + je.map((x) => Math.round(x.A * 1e4) / 1e4).join(" / ") + " m², der Gang (ω) " + je.map((x) => Math.round(x.omega * 100) / 100).join(" / ") + " rad/s · " + R1.akte },
                            2: { werte: { saaten: a.luft > 0 ? n : 0, fliegerAnteil: a.fliegerAnteil }, zeuge: { fehler: a.fehler, antworten: a.arten || 0, streuung: a.fliegerAnteil || 0 }, nicht: gesetz + " — keine Luftdichte" },
                            3: { werte: { sternKlassen: a.stern }, zeuge: { fehler: a.fehler, antworten: (a.gesetzTeile || []).length, streuung: 0 }, nicht: gesetz + " — kein Stern, keine gezeitengebundene Welt" },
                            4: { werte: { milieus: 1 + a.loesung }, zeuge: { fehler: a.fehler, antworten: (a.gesetzTeile || []).length, streuung: 0 }, nicht: gesetz + " — kein Lösungsmittel; die Lebensdauer ist eine Zahl der Welt (" + a.lebensS + " s), kein Tempo liest die Temperatur" },
                            5: { werte: { prueflisteProzent: (100 * pruef) / 4, saaten: n }, zeuge: { fehler: a.fehler, antworten: n, streuung: a.energieStreuung || 0 }, nicht: n + " Saaten gefragt — die Prüfliste trägt " + pruef + " von 4" },
                            6: { werte: {}, zeuge: { fehler: a.fehler, antworten: n, streuung: a.energieStreuung || 0 }, nicht: "die Artenzahl liest keine Energie: " + a.arten + " Arten in jeder Saat (Streuung " + (a.artenStreuung || 0) + ")" },
                            7: { werte: { welten: n, prueflisteProzent: (100 * pruef) / 4 }, zeuge: { fehler: a.fehler, antworten: n, streuung: a.energieStreuung || 0 }, auge: await M.auge("evolution-fremde-physik-s7", { ort: "wiese" }), nicht: "keine fremde Welt mit eigener Geschichte des Lebens" },
                        },
                    };
                },
                sprossen: {
                    1: S({
                        soll: [
                            K.soll(FP, 1, "Regression aus 50 Saaten je g", { key: "saatenJeG", rel: "≥", zahl: 50 }),
                            K.soll(FP, 1, "Steigung im Band der Statik", { key: "steigung", rel: "band", zahl: 0.75, bis: 1, refQuelle: "Statik des Beins: Querschnitt A ∝ (M·g)^b, b 0,75 (elastische Ähnlichkeit, McMahon 1975) bis 1,0 (konstante Spannung, Galilei 1638)" }),
                            K.soll(FP, 1, "Regression aus 50 Saaten je g aus Bildern", { key: "gMin", rel: "≤", zahl: 0.3, quelleFeld: "umfang", quelleWort: "g 0,3–3" }),
                            K.soll(FP, 1, "Regression aus 50 Saaten je g aus Bildern", { key: "gMax", rel: "≥", zahl: 3, quelleFeld: "umfang", quelleWort: "g 0,3–3" }),
                        ],
                        werte: { saatenJeG: 50, steigung: 0.85, gMin: 0.3, gMax: 3 },
                        zeuge: { min: 3, was: "Güsse des Leibs unter drei Schweren", streu: true, aend: "der Bein-Querschnitt unter anderer Schwere" },
                        taeter: "stamm/koerper-leib.js _buildCreatureGroup (der Guss liest keine Schwere)",
                        nicht: "keine Saat je g",
                        leser: "stamm/koerper-leib.js:2469 _buildCreatureGroup — liest state.gravity nicht (nur der Gang, stamm/koerper-leib.js:492 _gangZeile): der Bein-Querschnitt folgt keiner Schwere",
                    }),
                    2: S({
                        soll: [K.soll(FP, 2, "über 20 Saaten", { key: "saaten", rel: "≥", zahl: 20 }), K.soll(FP, 2, "Kurve monoton", { key: "monotonVerstoesse", rel: "=", zahl: 0, refQuelle: "das Wort „monoton“: kein Abstieg zwischen zwei Stufen der Dichte (0 Verstöße)" }), K.soll(FP, 2, "Anteil fliegender Arten", { key: "dichteMin", rel: "≤", zahl: 0.1, quelleFeld: "umfang", quelleWort: "0,1–10 bar" }), K.soll(FP, 2, "Anteil fliegender Arten über 20 Saaten", { key: "dichteMax", rel: "≥", zahl: 10, quelleFeld: "umfang", quelleWort: "0,1–10 bar" })],
                        werte: { saaten: 20, monotonVerstoesse: 0, dichteMin: 0.1, dichteMax: 10 },
                        zeuge: { min: 20, was: "Saaten mit ihrer Luftdichte", streu: true },
                        taeter: "stamm/speicher-welten.js _weltGesetz (keine Luftdichte)",
                        nicht: "keine Luftdichte",
                        leser: "stamm/speicher-welten.js:88 _weltGesetz — trägt keine Luftdichte (nur rayleighTiefe des Himmels)",
                    }),
                    3: S({
                        soll: [K.soll(FP, 3, "Laubfarbe gegen Absorptions-Optimum", { key: "sternKlassen", rel: "≥", zahl: 4, refQuelle: "Morgan-Keenan: vom M- bis zum F-Stern 4 Klassen (M, K, G, F) — der Umfang der Sprosse" }), K.soll(FP, 3, "Biomasse-Profil über die Terminator-Linie", { key: "terminatorWelten", rel: "≥", zahl: 1, refQuelle: "eine gezeitengebundene Welt (Umfang: „gezeitengebundene Welten“)" })],
                        werte: { sternKlassen: 4, terminatorWelten: 2 },
                        zeuge: { min: 4, was: "Sterne und Welten mit ihrer Biomasse", streu: true },
                        taeter: "stamm/speicher-welten.js _weltGesetz (kein Stern)",
                        nicht: "kein Stern",
                        leser: "stamm/speicher-welten.js:88 _weltGesetz — trägt keinen Stern; phyto-core färbt das Laub ohne Spektrum",
                        unklar: "der Richter nennt keine Zahl — Vorschlag: Laub-Reflexionskante ±30 nm am Optimum des Sternspektrums (Kiang et al. 2007)",
                    }),
                    4: S({
                        soll: [K.soll(FP, 4, "Bewegungs- und Lebensdauer-Tempo gegen Arrhenius", { key: "q10", rel: "band", zahl: 2, bis: 3, refQuelle: "biologische Raten: Q10 ≈ 2–3 (Gillooly et al. 2001, E ≈ 0,65 eV)" }), K.soll(FP, 4, "Bewegungs- und Lebensdauer-Tempo", { key: "milieus", rel: "≥", zahl: 4, refQuelle: "die vier Milieus des Umfangs: Wasser, Ammoniak, Methan-Kälte, Eis-Ozean" })],
                        werte: { q10: 2.4, milieus: 4 },
                        zeuge: { min: 4, was: "Milieus mit ihrem Lebenstempo", streu: true },
                        taeter: "stamm/kreatur-leben.js FAUNA_MAX_AGE_MS (Lebensdauer ohne Temperatur)",
                        nicht: "kein Lösungsmittel, kein Q10",
                        leser: "stamm/kreatur-leben.js:2422 FAUNA_MAX_AGE_MS — der Tod am Alter liest eine Zahl, keine Temperatur; stamm/speicher-welten.js:88 _weltGesetz trägt kein Lösungsmittel",
                        unklar: "der Richter nennt keine Zahl — die Station misst gegen Q10 2–3 (Gillooly et al. 2001)",
                    }),
                    5: S({
                        soll: [K.soll(FP, 5, "auf 1 000 Saaten ≥ 95 %", { key: "prueflisteProzent", einheit: "%" }), K.soll(FP, 5, "1 000 Saaten", { key: "saaten", rel: "≥", zahl: 1000 })],
                        werte: { prueflisteProzent: 96, saaten: 1000 },
                        zeuge: { min: 2, was: "Planeten-Saaten mit ihrem Anker", streu: true },
                        taeter: "stamm/speicher-welten.js _weltGesetz (Physik nicht je Saat)",
                        nicht: "keine Saat mit eigener Physik",
                        leser: "planet-core.js:307 planetPlan — (samen) trägt keine Schwere, keine Luft, keinen Stern je Saat",
                    }),
                    6: S({
                        soll: [K.soll(FP, 6, "Korrelation positiv, Intervall ohne 0", { key: "ciUnten", rel: ">", zahl: 0 })],
                        werte: { ciUnten: 0.2 },
                        zeuge: { min: 2, was: "Planeten-Saaten mit Energie und Artenzahl", streu: true },
                        taeter: "stamm/kreatur-leben.js _lebensraumGesetz (Artenzahl ohne Energie)",
                        nicht: "Artenzahl ohne Energie",
                        leser: "stamm/kreatur-leben.js:1687 _pickFaunaSoulAtPlayer — wählt aus 4 Gattungen in jeder Saat; kein Leser des Energieflusses",
                    }),
                    7: S({
                        soll: [K.soll(FP, 7, "100 Welten", { key: "welten", rel: "≥", zahl: 100 }), K.soll(FP, 7, "Prüfliste ≥ 95 %", { key: "prueflisteProzent", einheit: "%" }), K.soll(FP, 7, "bei ≥ 50 %", { key: "fremdProzent", einheit: "%" }), K.soll(FP, 7, "Rang ≥ 0,7", { key: "rang" })],
                        werte: { welten: 100, prueflisteProzent: 96, fremdProzent: 55, rang: 0.75 },
                        zeuge: { min: 2, was: "Planeten-Saaten", streu: true },
                        auge: { pose: "Ego an der Wiese (keine fremde Welt erzeugbar)", vorbild: "Fremdwelt-Probe (R10): Morphoraum-Abstand zur Erde, Ursache aus dem Körper gelesen Rang ≥ 0,7" },
                        taeter: "stamm/speicher-welten.js _weltGesetz",
                        nicht: "keine fremde Welt",
                        leser: "planet-core.js:307 planetPlan — (samen) trägt keine eigene Geschichte des Lebens je Welt",
                    }),
                },
            },

            // ═══ ZIVILISATION: Verhalten, Kultur, fremde Personen ═══
            [ZV]: {
                sek: 15,
                pfad: PFAD_KULTUR,
                ungefahren: "die Bilder der Werkzeuge und Feuer (S3, S6) und die Blind-Sortierung (S7) — auf swiftshader kein Schuss",
                mess: async function (H, U, M) {
                    const P = async (r, T, A) => {
                        const mittel = (l) => (l.length ? l.reduce((s, x) => s + x, 0) / l.length : NaN);
                        const sd = (l) => {
                            const m = mittel(l);
                            return l.length > 1 ? Math.sqrt(l.reduce((s, x) => s + (x - m) * (x - m), 0) / (l.length - 1)) : 0;
                        };
                        const rang = (l) => {
                            const o = l.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]);
                            const rg = new Array(l.length);
                            for (let i = 0; i < o.length;) {
                                let j = i;
                                while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++;
                                for (let k = i; k <= j; k++) rg[o[k][1]] = (i + j) / 2;
                                i = j + 1;
                            }
                            return rg;
                        };
                        const pearson = (a, b) => {
                            const ma = mittel(a), mb = mittel(b);
                            let x = 0, y = 0, z = 0;
                            for (let i = 0; i < a.length; i++) {
                                x += (a[i] - ma) * (b[i] - mb);
                                y += (a[i] - ma) ** 2;
                                z += (b[i] - mb) ** 2;
                            }
                            return y > 0 && z > 0 ? x / Math.sqrt(y * z) : NaN;
                        };
                        const auc = (a, b) => {
                            if (!a.length || !b.length) return NaN;
                            let n = 0;
                            for (const x of a) for (const y of b) n += x > y ? 1 : x === y ? 0.5 : 0;
                            const v = n / (a.length * b.length);
                            return Math.max(v, 1 - v);
                        };
                        const s = r.state;
                        const C = r.constructor;
                        const aus = { fehler: null };
                        try {
                            const FG = C._furchtGesetz();
                            const F = r._bestandRegionen().regionen;
                            const regionen = Object.keys(F).filter((k) => F[k].tiere.length);
                            const alle = [].concat(...regionen.map((k) => F[k].tiere));
                            aus.tiere = alle.length;
                            const flucht = {};
                            for (const t of alle) (flucht[t.g] = flucht[t.g] || []).push(FG.fluchtDistanz(FG.F.fluchtDistanzM[t.g], 0, 0, 0, FG.F));
                            aus.fluchtStreuungInnen = Math.max(0, ...Object.values(flucht).map(sd));
                            aus.fluchtJeGattung = Object.fromEntries(Object.entries(flucht).map(([g, l]) => [g, Math.round(mittel(l))]));
                            const gr = [], rd = [];
                            for (const k of regionen) {
                                const R = F[k];
                                const herden = {};
                                for (const t of R.tiere) if (t.g === "deer") herden[t.v] = (herden[t.v] || 0) + 1;
                                const h = Object.values(herden);
                                if (!h.length) continue;
                                gr.push(mittel(h));
                                rd.push(R.tiere.filter((t) => t.g === "wolf" || t.g === "bear").length);
                            }
                            aus.regionen = gr.length;
                            aus.rho = gr.length >= 3 ? pearson(rang(gr), rang(rd)) : undefined;
                            aus.herdeStreuung = sd(gr);
                            const pops = regionen.map((k) => F[k].tiere.filter((t) => t.g === "deer").map((t) => t.bs)).filter((l) => l.length >= 2).sort((a, b) => b.length - a.length);
                            aus.aucGesang = pops.length >= 2 ? auc(pops[0], pops[1]) : undefined;
                            aus.rufer = pops.slice(0, 2).map((l) => l.length);
                            if (pops.length >= 1 && pops[0].length >= 4) {
                                const p = pops[0];
                                aus.aucInnen = auc(p.slice(0, Math.floor(p.length / 2)), p.slice(Math.floor(p.length / 2)));
                            }
                            aus.rufStreuung = sd([].concat(...pops));
                            const cs = s.creatures || [];
                            aus.koerper = cs.length;
                            aus.mitWerkzeug = cs.filter((c) => c.userData && c.userData.equipped && c.userData.equipped.tool).length;
                            const ep = [];
                            for (let sa = 1; sa <= A.saaten; sa++) ep.push(r._siedlungEpoche(sa));
                            aus.saaten = ep.length;
                            aus.epochen = new Set(ep.map((x) => x || "gewuerfelt")).size;
                            aus.metallEpoche = ep.filter((x) => x).length;
                            aus.siedlungen = Object.keys((s.worldMeta && s.worldMeta.settlementCells) || {}).length;
                            const gattungen = Object.keys(C._lebensraumGesetz().L.gattung);
                            aus.bauendeGattungen = gattungen.filter((g) => typeof C["_" + g + "Bau"] === "function").length;
                            aus.nichtMenschlich = aus.bauendeGattungen;
                        } catch (e) {
                            aus.fehler = String((e && e.message) || e).slice(0, 200);
                        }
                        return aus;
                    };
                    const a = await H.seite("return await (" + P.toString() + ")(r, T, " + JSON.stringify({ saaten: 100 }) + ");");
                    const z = { fehler: a.fehler, antworten: a.tiere || 0, streuung: a.rufStreuung || 0 };
                    return {
                        sprossen: {
                            1: { werte: {}, zeuge: { fehler: a.fehler, antworten: a.tiere || 0, streuung: a.fluchtStreuungInnen || 0 }, nicht: "Verhalten nicht erblich: die Fluchtdistanz ist eine Zahl je Gattung " + JSON.stringify(a.fluchtJeGattung || {}) + " (Streuung innerhalb " + (a.fluchtStreuungInnen || 0) + "), kein Tier trägt Eltern" },
                            2: { werte: { saaten: 1, rho: a.rho }, zeuge: { fehler: a.fehler, antworten: a.regionen || 0, streuung: a.herdeStreuung || 0 }, nicht: "Sozialität evolviert nicht: die Herde ist ein Wurf aus VERHALTEN.herde.wurf (deer 3–7) — keine Selektion; " + (a.regionen || 0) + " Regionen gelesen" },
                            3: { werte: { aucGesang: a.aucGesang, aucInnen: a.aucInnen, werkzeugProzent: a.koerper ? (100 * a.mitWerkzeug) / a.koerper : undefined }, zeuge: z, nicht: "keine Tradition: der Ruf folgt nur dem Körper (stamm/klang.js _tierRuf: Länge und Stimmung), die Trennung zweier Rufer-Gruppen (" + (a.rufer || []).join(" / ") + " Hirsche) ist die Streuung ihrer gewürfelten Größe; kein Werkzeug an " + (a.koerper || 0) + " Tieren" },
                            4: { werte: {}, zeuge: z, nicht: "keine kumulative Kultur: " + (a.mitWerkzeug || 0) + " Tiere mit Werkzeug, die Epoche der Siedlung würfelt der Samen (" + (a.epochen || 0) + " Epochen aus " + (a.saaten || 0) + " Saaten)" },
                            5: { werte: { nichtMenschlich: a.nichtMenschlich }, zeuge: { fehler: a.fehler, antworten: a.siedlungen || 0, streuung: a.siedlungen || 0 }, nicht: "keine nicht-menschliche Siedlung: " + (a.siedlungen || 0) + " Siedlung(en) der Bewohner, " + (a.bauendeGattungen || 0) + " Gattungen bauen" },
                            6: { werte: { saaten: a.saaten }, zeuge: { fehler: a.fehler, antworten: a.saaten || 0, streuung: a.epochen || 0 }, nicht: "kein Erz-Leser: die Epoche der Siedlung liest nur den Samen (" + (a.metallEpoche || 0) + " von " + (a.saaten || 0) + " Saaten in einer Metall-Epoche der Tafel), keine Wasserwesen" },
                            7: { werte: { zivilisationen: a.nichtMenschlich }, zeuge: z, auge: await M.auge("evolution-zivilisation-s7", { ort: "wiese" }), nicht: "keine nicht-menschliche Zivilisation" },
                        },
                    };
                },
                sprossen: {
                    1: S({
                        soll: [K.soll(ZV, 1, "Fluchtdistanz Eltern ↔ Kind korreliert", { key: "rEltern", rel: ">", zahl: 0, refQuelle: "das Wort des Richters „korreliert“: Korrelation der Fluchtdistanz Eltern ↔ Kind > 0" }), K.soll(ZV, 1, "Räuberdruck macht scheuer", { key: "scheuDelta", rel: ">", zahl: 0, refQuelle: "das Wort des Richters „scheuer“: Fluchtdistanz unter Räuberdruck − ohne > 0 (m)" })],
                        werte: { rEltern: 0.35, scheuDelta: 12 },
                        zeuge: { min: 20, was: "Tiere mit ihrer Fluchtdistanz", streu: true, gegen: "ohne Räuberdruck" },
                        taeter: "tetrapoda-core.js FURCHT_GESETZ.fluchtDistanzM (eine Zahl je Gattung)",
                        nicht: "Verhalten nicht erblich",
                        leser: "tetrapoda-core.js:1998 fluchtDistanzM — { deer 120, wolf 106, bear 55, fox 40 }: eine Zahl je Gattung, kein Erbe je Tier",
                        unklar: "der Richter nennt keine Zahl — Vorschlag: Eltern-Kind-Korrelation der Fluchtdistanz 0,2–0,5 (Heritabilität der Scheu, Møller 2014)",
                    }),
                    2: S({
                        soll: [K.soll(ZV, 2, "über 100 Saaten", { key: "saaten", rel: "≥", zahl: 100 }), K.soll(ZV, 2, "Gruppengröße steigt mit Räuberdichte", { key: "rho", rel: ">", zahl: 0, refQuelle: "das Wort „steigt“: Rang-Korrelation Herdengröße ↔ Räuberdichte > 0" })],
                        werte: { saaten: 100, rho: 0.4 },
                        zeuge: { min: 3, was: "Regionen mit Herde und Räubern", streu: true },
                        taeter: "tetrapoda-core.js VERHALTEN.herde.wurf (Herdengröße fest)",
                        nicht: "Sozialität evolviert nicht",
                        leser: "tetrapoda-core.js:289 wurf — herde.wurf { wolf 3–6, deer 3–7, fox 1, bear 1 }: fest, nicht aus Selektion",
                    }),
                    3: S({
                        soll: [K.soll(ZV, 3, "trennbar ≥ 0,9", { key: "aucGesang" }), K.soll(ZV, 3, "innerhalb nicht", { key: "aucInnen", rel: "<", zahl: 0.9, refQuelle: "das Wort „innerhalb nicht“: innerhalb einer Population unter der Trennschwelle 0,9 des Richters" }), K.soll(ZV, 3, "Werkzeug in ≥ 10 % der Saaten im Bild", { key: "werkzeugProzent", einheit: "%" })],
                        werte: { aucGesang: 0.93, aucInnen: 0.6, werkzeugProzent: 12 },
                        zeuge: { min: 20, was: "Rufer zweier Populationen", streu: true },
                        taeter: "stamm/klang.js _tierRuf (Ruf aus dem Körper, kein Dialekt)",
                        nicht: "keine Tradition, kein Werkzeug",
                        leser: "stamm/klang.js:506 _tierRuf — liest Körperlänge und Stimmung, keine Überlieferung je Population; stamm/kreatur-leben.js:413 equipCreatureTool legt ein Werkzeug nur von außen an, kein Tier erfindet eines",
                    }),
                    4: S({
                        soll: [K.soll(ZV, 4, "Werkzeug-Komplexität über Generationen", { key: "komplexSteigung", rel: ">", zahl: 0, refQuelle: "das Wort des Richters: Werkzeug-Komplexität je Generation steigt (Steigung > 0)" }), K.soll(ZV, 4, "Gegenlauf ohne Weitergabe", { key: "gegenlaufSteigung", rel: "≤", zahl: 0, refQuelle: "der Gegenlauf (R7): ohne Weitergabe steigt die Komplexität nicht (Steigung ≤ 0)" })],
                        werte: { komplexSteigung: 0.3, gegenlaufSteigung: 0 },
                        zeuge: { min: 20, was: "Tiere und Siedlungen über Generationen", streu: true, gegen: "ohne Weitergabe" },
                        taeter: "fachwerk-core.js siedlungsEpoche (Epoche aus dem Samen, keine Weitergabe)",
                        nicht: "keine kumulative Kultur",
                        leser: "fachwerk-core.js:3718 siedlungsEpoche — (seed) würfelt die Epoche aus dem Samen, keine Kultur, die weitergegeben wird",
                    }),
                    5: S({
                        soll: [K.soll(ZV, 5, "Bau-Maße gegen Körper-Maße der Erbauer im Band", { key: "tuerJeKoerper", rel: "band", zahl: 1.1, bis: 1.3, refQuelle: "Mensch: Türhöhe 2,0–2,1 m (DIN 18101) bei Körperhöhe 1,6–1,9 m → 1,1–1,3" }), K.soll(ZV, 5, "Bau-Maße gegen Körper-Maße der Erbauer", { key: "nichtMenschlich", rel: "≥", zahl: 1, refQuelle: "eine Siedlung (Umfang: „erste nicht-menschliche Siedlung“)" })],
                        werte: { tuerJeKoerper: 1.2, nichtMenschlich: 1 },
                        zeuge: { min: 1, was: "Siedlungen mit ihren Erbauern", streu: true },
                        taeter: "fachwerk-core.js (Türhöhe 2,05 m fest, nur menschliche Bauten)",
                        nicht: "keine nicht-menschliche Siedlung",
                        leser: "fachwerk-core.js:181 doorH — 2.05 fest, kein Leser des Körpers der Erbauer; keine Gattung baut",
                    }),
                    6: S({
                        soll: [K.soll(ZV, 6, "an 100 Saaten", { key: "saaten", rel: "≥", zahl: 100 }), K.soll(ZV, 6, "Saat ohne Erz → 0 Metallwerkzeuge im Bild", { key: "ohneErzMetall", rel: "=", zahl: 0 }), K.soll(ZV, 6, "mit Erz ≥ 1 in ≥ 80 %", { key: "mitErzProzent", zahl: 80, einheit: "%" }), K.soll(ZV, 6, "Wasserwesen: 0 offene Feuer im Bild", { key: "wasserFeuer", rel: "=", zahl: 0 })],
                        werte: { saaten: 100, ohneErzMetall: 0, mitErzProzent: 85, wasserFeuer: 0 },
                        zeuge: { min: 100, was: "Saaten mit der Epoche ihrer Siedlung", streu: true },
                        taeter: "fachwerk-core.js siedlungsEpoche (kein Erz-Leser)",
                        nicht: "kein Erz-Leser, keine Wasserwesen",
                        leser: "fachwerk-core.js:3718 siedlungsEpoche — (seed) liest kein Erz der Saat",
                    }),
                    7: S({
                        soll: [K.soll(ZV, 7, "10 Zivilisationen", { key: "zivilisationen", rel: "≥", zahl: 10 }), K.soll(ZV, 7, "Blind-Sortierung nach Herkunft ≥ 90 %", { key: "blindProzent", einheit: "%" }), K.soll(ZV, 7, "Rang ≥ 0,7", { key: "rang" }), K.soll(ZV, 7, "bei ≥ 50 %", { key: "fremdProzent", einheit: "%" })],
                        werte: { zivilisationen: 10, blindProzent: 92, rang: 0.75, fremdProzent: 55 },
                        zeuge: { min: 10, was: "Zivilisationen aus Saaten", streu: true },
                        auge: { pose: "Ego an der Wiese (keine nicht-menschliche Stadt erzeugbar)", vorbild: "Blind-Sortierung nach Herkunft ≥ 90 %; Fremdwelt-Probe (R10) der Bauten" },
                        taeter: "fachwerk-core.js (nur menschliche Siedlungen)",
                        nicht: "keine nicht-menschliche Zivilisation",
                        leser: "fachwerk-core.js:3622 EPOCHEN — menschliche Epochen der Erde (antike … moderne), keine fremde Kultur",
                    }),
                },
            },

            // ═══ MIKROBEN: die unsichtbare Mehrheit ═══
            [MI]: {
                sek: 10,
                pfad: PFAD_GRUND,
                ungefahren: "die Bildvergleiche der Matten und des Zooms (S1–S3) — auf swiftshader kein Schuss",
                mess: async function (H, U, M) {
                    const P = async (r, T, A) => {
                        const s = r.state;
                        const C = r.constructor;
                        const aus = { fehler: null };
                        try {
                            aus.nearM = s.camera.near;
                            const WORTE = ["mikrob", "biofilm", "matte", "kolonie", "algen", "bakter", "pilzfaden"];
                            let objekte = 0, treffer = 0;
                            s.scene.traverse((o) => {
                                objekte++;
                                const n = String(o.name || "").toLowerCase() + " " + String((o.userData && (o.userData.kind || o.userData.type)) || "").toLowerCase();
                                if (WORTE.some((w) => n.includes(w))) treffer++;
                            });
                            aus.objekte = objekte;
                            aus.matten = treffer;
                            const pm = s.playerMesh.position;
                            const klassen = {};
                            let n = 0;
                            for (let i = 0; i < A.orte; i++) {
                                const w = (i * 2.399963) % (2 * Math.PI);
                                const d = 20 + 9 * i;
                                const k = r._bodenKlasseAt(pm.x + Math.cos(w) * d, pm.z + Math.sin(w) * d);
                                klassen[k] = (klassen[k] || 0) + 1;
                                n++;
                            }
                            aus.orte = n;
                            aus.klassen = Object.keys(klassen).length;
                            aus.abbauProS = C.LIFE_FIELD.decayPerSec;
                            aus.lebenZellen = s.lifeField ? s.lifeField.size : 0;
                            const gattungen = Object.keys(C._lebensraumGesetz().L.gattung);
                            aus.lebenJeSaat = gattungen.length;
                        } catch (e) {
                            aus.fehler = String((e && e.message) || e).slice(0, 200);
                        }
                        return aus;
                    };
                    const a = await H.seite("return await (" + P.toString() + ")(r, T, " + JSON.stringify({ orte: 40 }) + ");");
                    const z = { fehler: a.fehler, antworten: a.orte || 0, streuung: Math.max(0, (a.klassen || 0) - 1) };
                    const keine = "kein mikrobielles Leben: " + (a.matten || 0) + " Treffer unter " + (a.objekte || 0) + " Objekten der Szene";
                    const zoom = "die Kamera sieht bis " + Math.round((a.nearM || 0) * 1000) + " mm (near)";
                    return {
                        sprossen: {
                            1: { werte: { matten: a.matten }, zeuge: z, auge: await M.auge("evolution-mikroben-s1", { ort: "wiese" }), nicht: keine },
                            2: { werte: { zoomMinMm: a.nearM * 1000 }, zeuge: z, auge: await M.auge("evolution-mikroben-s2", { ort: "wiese" }), nicht: keine + "; " + zoom },
                            3: { werte: { orte: a.orte, zoomMinM: a.nearM }, zeuge: z, auge: await M.auge("evolution-mikroben-s3", { ort: "wiese" }), nicht: keine + "; " + zoom },
                            4: { werte: { mikrobenArten: a.matten }, zeuge: { fehler: a.fehler, antworten: a.lebenZellen || 0, streuung: a.abbauProS || 0 }, nicht: keine + "; das Feld des Lebens zerfällt mit einer Konstante (" + a.abbauProS + "/s) — keine Mutante „Mikroben aus“" },
                            5: { werte: {}, zeuge: z, nicht: "Leben entsteht nicht: jede Saat trägt dieselben " + (a.lebenJeSaat || 0) + " Gattungen (der Lebensraum liest keinen Samen, keine Energie)" },
                            6: { werte: { orte: a.orte, planeten: 1 }, zeuge: z, nicht: keine + "; " + zoom },
                        },
                    };
                },
                sprossen: {
                    1: S({
                        soll: [ohneZahl(MI, 1, "Bildvergleich der Zonierung gegen Natur-Fotos", "zonierung"), K.soll(MI, 1, "Bildvergleich der Zonierung", { key: "matten", rel: "≥", zahl: 1, refQuelle: "eine sichtbare Matte (Umfang: „Matten, Biofilme, Algenbeläge sichtbar“)" })],
                        werte: { matten: 3 },
                        zeuge: { min: 20, was: "Orte am Spieler", streu: true },
                        auge: { pose: "Ego an der Wiese (keine heiße Quelle, kein Watt erzeugbar)", vorbild: "Natur-Fotos der Zonierung (heiße Quelle, Watt, Fels), Prüfer-Satz R11" },
                        taeter: "gelaende-core.js / stamm/feld-leben.js (kein mikrobielles Leben)",
                        nicht: "keine Matten",
                        leser: "stamm/feld-leben.js:3079 LIFE_FIELD — ein Feld des Lebens ohne Mikroben; kein Leser einer Matte im Gelände",
                        unklar: "der Richter nennt keine Schwelle — Vorschlag: Panel-2AFC gegen Natur-Fotos ≤ 70 %",
                    }),
                    2: S({
                        soll: [ohneZahl(MI, 2, "Bildvergleich am Ende des Zooms gegen Mikroskop-Aufnahmen", "zoomBild"), K.soll(MI, 2, "Bildvergleich am Ende des Zooms", { key: "zoomMinMm", rel: "≤", zahl: 1, quelleFeld: "umfang", quelleWort: "1 mm", einheit: "mm" })],
                        werte: { zoomMinMm: 0.8 },
                        zeuge: { min: 20, was: "Orte am Spieler", streu: true },
                        auge: { pose: "Ego an der Wiese, Kamera am Boden", vorbild: "Mikroskop-Aufnahmen von Pilzfäden, Milben, Kolonien (R11)" },
                        taeter: "stamm/dirigent-ankunft.js (Kamera near 0,1 m)",
                        nicht: "kein Zoom unter 0,1 m, keine Mikroben",
                        leser: "stamm/dirigent-ankunft.js:468 PerspectiveCamera — die Kamera schneidet bei near 0,1 m; kein Zoom bis 1 mm",
                        unklar: "der Richter nennt keine Schwelle — Vorschlag: 2AFC gegen Mikroskop-Aufnahmen ≤ 75 % (wie Sprosse 3)",
                    }),
                    3: S({
                        soll: [K.soll(MI, 3, "2AFC Zoom-Bild gegen Lichtmikroskopie desselben Lebensraums ≤ 75 %", { key: "afcProzent", einheit: "%" }), K.soll(MI, 3, "Formen passen zum Lebensraum (Teich, Boden, Darm) ≥ 90 %", { key: "formenProzent", einheit: "%" }), K.soll(MI, 3, "100 Zufallsorte", { key: "orte", rel: "≥", zahl: 100 }), K.soll(MI, 3, "2AFC Zoom-Bild gegen Lichtmikroskopie", { key: "zoomMinM", rel: "≤", zahl: 1e-5, quelleFeld: "umfang", quelleWort: "10⁻⁵ m", einheit: "m" })],
                        werte: { afcProzent: 70, formenProzent: 92, orte: 100, zoomMinM: 1e-5 },
                        zeuge: { min: 100, was: "Zufallsorte", streu: true },
                        auge: { pose: "Ego an der Wiese, Kamera am Boden", vorbild: "Lichtmikroskopie desselben Lebensraums, 2AFC ≤ 75 % (R11)" },
                        taeter: "stamm/dirigent-ankunft.js (Kamera near 0,1 m)",
                        nicht: "kein Zoom auf 10⁻⁵ m",
                        leser: "stamm/dirigent-ankunft.js:468 PerspectiveCamera — near 0,1 m; kein Leser einer Gemeinschaft im Milieu",
                    }),
                    4: S({
                        soll: [K.soll(MI, 4, "Mutante „Mikroben aus“ → Streu bleibt liegen", { key: "abbauVerh", rel: "<", zahl: 0.5, refQuelle: "das Wort „Streu bleibt liegen“: Abbau der Mutante / Abbau der Welt < 0,5" }), K.soll(MI, 4, "Kreisläufe brechen sichtbar", { key: "mikrobenArten", rel: "≥", zahl: 1e6, quelleFeld: "umfang", quelleWort: "10⁶ Mikroben-Arten" })],
                        werte: { abbauVerh: 0.1, mikrobenArten: 2e6 },
                        zeuge: { min: 20, was: "Zellen des Felds des Lebens", streu: true, gegen: "Mikroben aus" },
                        taeter: "stamm/feld-leben.js LIFE_FIELD.decayPerSec (Abbau ohne Mikroben)",
                        nicht: "keine Mikroben, keine Mutante",
                        leser: "stamm/feld-leben.js:3079 decayPerSec — 0,008: der Abbau ist eine Konstante, kein Werk der Mikroben",
                        unklar: "der Richter nennt keine Zahl — Vorschlag: mit der Mutante Abbau < 0,1 des Normalen (sterile Streu, Swift et al. 1979)",
                    }),
                    5: S({
                        soll: [K.soll(MI, 5, "Anteil Planeten-Saaten mit Leben steigt monoton mit dem Energiefluss", { key: "rangLebenEnergie", rel: ">", zahl: 0, refQuelle: "das Wort „steigt monoton“: Rang-Korrelation Anteil mit Leben ↔ Energiefluss > 0" })],
                        werte: { rangLebenEnergie: 0.8 },
                        zeuge: { min: 20, was: "Saaten mit Leben und Energiefluss", streu: true },
                        taeter: "stamm/kreatur-leben.js _lebensraumGesetz (Leben in jeder Saat)",
                        nicht: "kein Ursprung des Lebens",
                        leser: "stamm/kreatur-leben.js:1687 _pickFaunaSoulAtPlayer — dieselben Gattungen in jeder Saat, kein Ursprung aus Energie und Chemie",
                    }),
                    6: S({
                        soll: [K.soll(MI, 6, "Zoom-Stichprobe 1 000 Orte auf 10 Planeten ≥ 95 %", { key: "zoomProzent", einheit: "%" }), K.soll(MI, 6, "1 000 Orte", { key: "orte", rel: "≥", zahl: 1000 }), K.soll(MI, 6, "10 Planeten", { key: "planeten", rel: "≥", zahl: 10 })],
                        werte: { zoomProzent: 96, orte: 1000, planeten: 10 },
                        zeuge: { min: 1000, was: "Zoom-Orte", streu: true },
                        taeter: "stamm/dirigent-ankunft.js (kein Zoom)",
                        nicht: "keine Mikroben, kein Zoom",
                        leser: "stamm/dirigent-ankunft.js:468 PerspectiveCamera — near 0,1 m",
                    }),
                },
            },

            // ═══ FOSSIL: das Leben im Gestein ═══
            [FO]: {
                sek: 10,
                pfad: PFAD_GRUND,
                ungefahren: "das Bild der Fundstelle — auf swiftshader kein Schuss (keine Sprosse verlangt ein Auge)",
                mess: async function (H, U, M) {
                    const P = async (r, T, A) => {
                        const s = r.state;
                        const C = r.constructor;
                        const TC = globalThis.__tetrapodaCore;
                        const aus = { fehler: null };
                        try {
                            const WORTE = ["fossil", "faehrte", "fährte", "koprolith", "trittsiegel", "versteiner", "leitart"];
                            let objekte = 0, treffer = 0;
                            s.scene.traverse((o) => {
                                objekte++;
                                const n = String(o.name || "").toLowerCase() + " " + String((o.userData && (o.userData.kind || o.userData.type)) || "").toLowerCase();
                                if (WORTE.some((w) => n.includes(w))) treffer++;
                            });
                            aus.objekte = objekte;
                            aus.funde = treffer;
                            const statisch = Object.getOwnPropertyNames(C).filter((k) => WORTE.some((w) => k.toLowerCase().includes(w))).length;
                            aus.gesetzeFossil = statisch;
                            const pm = s.playerMesh.position;
                            const klassen = {};
                            for (let i = 0; i < A.orte; i++) {
                                const w = (i * 2.399963) % (2 * Math.PI);
                                const d = 20 + 11 * i;
                                const k = r._bodenKlasseAt(pm.x + Math.cos(w) * d, pm.z + Math.sin(w) * d);
                                klassen[k] = (klassen[k] || 0) + 1;
                            }
                            aus.orte = A.orte;
                            aus.klassen = Object.keys(klassen).length;
                            const schritte = [];
                            for (const soul of C.CREATURE_SOUL_NAMES) {
                                const leib = r._buildCreatureGroup(soul);
                                if (!leib) continue;
                                const tb = leib.userData._tierBaum || {};
                                const g = tb.beinL > 0 ? TC.gangSchritt(1.2, tb.beinL, r._gangZeile(false)) : null;
                                r._disposeSoulGroup(leib);
                                if (g && g.schritt > 0) schritte.push(g.schritt);
                            }
                            aus.gang = schritte.length;
                            aus.schrittStreuung = schritte.length > 1 ? Math.max(...schritte) - Math.min(...schritte) : 0;
                            aus.schrittMittel = schritte.length ? schritte.reduce((a, b) => a + b, 0) / schritte.length : undefined;
                        } catch (e) {
                            aus.fehler = String((e && e.message) || e).slice(0, 200);
                        }
                        return aus;
                    };
                    const a = await H.seite("return await (" + P.toString() + ")(r, T, " + JSON.stringify({ orte: 40 }) + ");");
                    const z = { fehler: a.fehler, antworten: a.orte || 0, streuung: Math.max(0, (a.klassen || 0) - 1) };
                    const keine = "keine Fossilien: " + (a.funde || 0) + " Funde unter " + (a.objekte || 0) + " Objekten der Szene, " + (a.gesetzeFossil || 0) + " Gesetze des Fossils";
                    return {
                        sprossen: {
                            1: { werte: { funde: a.funde }, zeuge: z, nicht: keine },
                            2: { werte: {}, zeuge: z, nicht: keine + " — keine Schichtfolge mit Leitfossilien" },
                            3: { werte: {}, zeuge: { fehler: a.fehler, antworten: a.gang || 0, streuung: a.schrittStreuung || 0 }, nicht: keine + " — keine Fährte; der lebende Gang schreitet " + (a.schrittMittel ? Math.round(a.schrittMittel * 100) / 100 + " m" : "ungemessen") },
                            4: { werte: {}, zeuge: z, nicht: keine },
                            5: { werte: {}, zeuge: z, nicht: keine },
                            6: { werte: { funde: a.funde }, zeuge: z, nicht: keine },
                        },
                    };
                },
                sprossen: {
                    1: S({
                        soll: [K.soll(FO, 1, "Anteil im Baum des Samens = 100 %", { key: "imBaumProzent", einheit: "%" }), K.soll(FO, 1, "100 Funde", { key: "funde", rel: "≥", zahl: 100 })],
                        werte: { imBaumProzent: 100, funde: 100 },
                        zeuge: { min: 20, was: "Orte am Spieler, Objekte der Szene", streu: true },
                        taeter: "gelaende-core.js (kein Fossil im Gestein)",
                        nicht: "keine Fossilien",
                        leser: "gelaende-core.js:397 schichtDicke — Schichten ohne Inhalt; kein Leser eines Fossils (0 Treffer im Spiel)",
                    }),
                    2: S({
                        soll: [K.soll(FO, 2, "Superposition ≥ 99 %", { key: "superpositionProzent", einheit: "%" }), K.soll(FO, 2, "100 Aufschlüsse", { key: "aufschluesse", rel: "≥", zahl: 100 })],
                        werte: { superpositionProzent: 99.5, aufschluesse: 100 },
                        zeuge: { min: 20, was: "Orte am Spieler", streu: true },
                        taeter: "gelaende-core.js (Schichten ohne Leitfossil)",
                        nicht: "keine Leitfossilien",
                        leser: "gelaende-core.js:1043 schichtDicke — die Schicht trägt Mächtigkeit, kein Alter und keine Form des Lebens",
                    }),
                    3: S({
                        soll: [K.soll(FO, 3, "Schrittlänge und Fußfall der Fährte ±10 %", { key: "faehrteAbwProzent", rel: "≤", zahl: 10, einheit: "%" })],
                        werte: { faehrteAbwProzent: 6 },
                        zeuge: { min: 3, was: "lebende Gänge der Tiere", streu: true },
                        taeter: "stamm/kreatur-*.js (keine Fährte)",
                        nicht: "keine Fährte",
                        leser: "stamm/koerper-leib.js:492 _gangZeile — der Gang schreitet, aber kein Leser legt seinen Fußfall als Spur ins Gestein",
                    }),
                    4: S({
                        soll: [K.soll(FO, 4, "Paar-Aufschlüsse an getrennten Küsten", { key: "leitPaare", rel: "≥", zahl: 1, refQuelle: "Erde: Mesosaurus beidseits des Südatlantiks (du Toit 1937) — mindestens ein Paar mit derselben Leitart" })],
                        werte: { leitPaare: 3 },
                        zeuge: { min: 20, was: "Orte, Objekte der Szene", streu: true },
                        taeter: "gelaende-core.js (keine Leitfossilien)",
                        nicht: "keine Leitfossilien über Kontinente",
                        leser: "gelaende-core.js:397 schichtDicke — kein Fossil in der Schicht",
                        unklar: "der Richter nennt keine Zahl — Vorschlag: ≥ 80 % der Paar-Aufschlüsse tragen dieselbe Leitart",
                    }),
                    5: S({
                        soll: [K.soll(FO, 5, "Erhaltungs-Anteile je Bauplan gegen die Natur", { key: "hartZuWeich", rel: ">", zahl: 1, refQuelle: "Erde: Hartteile weit häufiger fossil als Weichkörper (Allison & Briggs 1991, Konservat-Lagerstätten selten)" })],
                        werte: { hartZuWeich: 8 },
                        zeuge: { min: 20, was: "Orte, Objekte der Szene", streu: true },
                        taeter: "gelaende-core.js (keine Erhaltung)",
                        nicht: "keine Erhaltung",
                        leser: "gelaende-core.js:397 schichtDicke — kein Fossil in der Schicht",
                        unklar: "der Richter nennt keine Zahl — Vorschlag: Erhaltungs-Anteil Hartteile / Weichkörper ≥ 10 (Allison & Briggs 1991)",
                    }),
                    6: S({
                        soll: [K.soll(FO, 6, "deckungsgleich ≥ 95 %", { key: "deckungProzent", einheit: "%" }), K.soll(FO, 6, "100 Funde", { key: "funde", rel: "≥", zahl: 100 })],
                        werte: { deckungProzent: 96, funde: 100 },
                        zeuge: { min: 20, was: "Orte, Objekte der Szene", streu: true },
                        taeter: "gelaende-core.js (keine Fossilien) / stamm/kreatur-leben.js (keine Epochen-Fauna)",
                        nicht: "keine Fossilien, keine Epochen-Fauna",
                        leser: L_ZEIT,
                    }),
                },
            },
        },
    };
})());

module.exports = L.stationen();
