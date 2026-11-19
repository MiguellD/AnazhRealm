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
                    const aus = {};
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
                        leser: "phyto-core.js treeParams — kein Merkmalsraum (Höhe, Blattgröße, Holzdichte) je Art",
                        gruen: { werte: { histDistanz: 0.15, artenPlanet: 1200, artenImBild: 60 }, zeuge: ART_Z },
                        attrappen: [{ name: "Distanz 0,15 ohne Bestand", roh: { werte: { histDistanz: 0.15 }, zeuge: { antworten: 0 } } }],
                    },
                    4: {
                        u: { auge: { ort: "wiese" } },
                        soll: [K.soll(A_ID, 4, "Trefferquote ≤ 60 %", { key: "trefferProzent", einheit: "%" })],
                        auge: { pose: "Regenwald-Hektar (heute nicht erzeugbar; geschossen an der Mess-Wiese)", vorbild: "200 Paare Foto ↔ Spiel, Trefferquote ≤ 60 % (R11)" },
                        taeter: "phyto-core.js FOREST_SPECIES (keine Tropen-Arten)",
                        nicht: "10⁴ Arten, ~300 Baumarten je Tropen-Hektar",
                        leser: "phyto-core.js planForestCell — kein Artenpool je Biom",
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
                        leser: "phyto-core.js planForestCell — keine Art aus der Saat, keine Gattung mit Schwesterarten",
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
                        leser: "planet-core.js planetPlan — eine Saat trägt einen Planeten; phyto-core.js — keine Art aus ihrer Welt",
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
                        leser: "phyto-core.js forestNische — sagt die Art des Orts, nie die Nische einer Art aus Klima und Boden",
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
                    const aus = {};
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
                        leser: "planet-core.js pflanzenDeckung — kein Biom ohne irdisches Gegenstück",
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
                            const tagS = AnazhRealm.PEGEL_TAG_S;
                            const jahrS = Math.max(365 * tagS, st.seasonYearSeconds || 0);
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
                    const aus = {};
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
                        leser: "phyto-core.js planForestCell — kein Eingang für die Zeit der Welt (spielZeit)",
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
                        leser: "phyto-core.js planForestCell — kein Eingang für die Zeit der Welt; stamm/vegetation-wiese.js _baumAlter altert nur Taten",
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
                        leser: "phyto-core.js planForestCell — kein Eingang für die Zeit der Welt",
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
                        leser: "phyto-core.js planForestCell — kein Alter in Jahren und keine Lebensdauer je Wuchsform",
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
                        leser: "phyto-core.js planForestCell — kein Eingang für die Zeit der Welt",
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
                    const aus = {};
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
                        leser: "scripts/werkbank.cjs /bild — keine Orbit-Pose; stamm/bild-himmel.js:882 _saisonPraesenz — kein Eingang für Niederschlag",
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
                        leser: "voxel-worker.js:1184 planetOrtAuftrag — reicht jahrTage und Bahn nicht durch; stamm/bild-himmel.js _tickSeason — EIN Jahr (seasonYearSeconds)",
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
                    const aus = {};
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
                        soll: [K.soll(D_ID, 3, "Pop-Zähler unter Bewegung = 0", { key: "pops", einheit: "Pops" })],
                        auge: { pose: "gehend und fahrend über 1 km (Werkbank /gang)", vorbild: "Bildpaar 1 km gegen Foto (Prüfer-Satz R11)" },
                        taeter: "stamm/gelaende-fern.js (die Ferne als Kronen-Mittel) + stamm/vegetation-streu.js (die Reichweite der Streu)",
                        nicht: "jede Pflanze bis 1 km",
                        leser: "stamm/vegetation-streu.js — keine einzelne Pflanze jenseits der Streu-Region",
                        gruen: { werte: { pops: 0, fernstePflanzeM: 1200 }, zeuge: { pflanzen: 300, fernsteM: 1200, bilder: 60 } },
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
                        leser: "scripts/werkbank.cjs — kein Flug 10 km → 1 m; stamm/gelaende-fern.js — die Ferne trägt keine Kennung der Pflanze",
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
                        leser: "scripts/werkbank.cjs — keine Orbit-Pose, kein durchgehender Flug",
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
                    const aus = {};
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
                        leser: "stamm/stoff-material.js _windSwayOffset — kein Eingang für die Schnee-Last der Krone",
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
                        leser: "stamm/vegetation-baum.js tickArchitectures — kein Leser wirft einen Baum nach Windstärke und Wurzelboden",
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

// ── DIE PERSPEKTIVE leben.wasser (4 Leitern, 26 Sprossen, belegt: lebensraeume S1 und rhythmen S1 — luftwasser.K3): das Leben im Wasser ──
// Die Leser des Spiels: die Fische (stamm/kreatur-fauna.js `_fischTakt` · `_fischZelle` · `_fischTiefeY` → tetrapoda-core FISCH_GESETZ,
// fischStand/fischSchritt/fischFlucht; gezeichnet im Pool `tier:fisch`), die Orte des Wassers (scripts/lib/wasser-linse.cjs `__wasserOrte`:
// Bach, Fluss, See, Küste und Meer am Gesetz nächst der Mess-Wiese), das Medium der Kamera unter Wasser (stamm/bild-himmel.js
// `_applyDayNightToScene` → `_luftSichtM`, WASSER_GESETZ.koerper je Art), die Nah-Streu am Ufer (stamm/vegetation-wiese.js
// `_nahStreuKachel`, das Ufer-Band des Schilfs), der Bestand der Tiere (stamm/kreatur-leben.js `faunaBestand`) und der Planet-Faden
// (`r._planetAuftrag` planet-ort: derselbe Weg wie die Reise). Ein Richter ohne Zahl (lebensraeume S5, bild S1, netz S1) bekommt sein
// Soll aus der Tiefe der Karte oder aus einer benannten Erd-Referenz (`sollFrei`, geprüft am Wortlaut) und trägt `unklar`.
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
    const sollFrei = (ID, nr, wort, o) => {
        const sp = K.sprosseVon(ID, nr);
        if (!sp.richter.includes(wort)) throw new Error("sollFrei: „" + wort + "“ steht nicht im Richter " + ID + " S" + nr);
        if (o.quelleFeld) {
            const t = String(sp[o.quelleFeld] || "");
            if (!t.includes(o.quelleWort)) throw new Error("sollFrei: „" + o.quelleWort + "“ steht nicht in " + o.quelleFeld + " " + ID + " S" + nr);
            const z = K.zahlenIn(o.quelleWort);
            for (const v of [o.zahl, o.bis]) if (v !== undefined && !z.some((x) => Math.abs(x - v) < 1e-9)) throw new Error("sollFrei: " + v + " steht nicht in „" + o.quelleWort + "“");
        } else if (!(typeof o.refQuelle === "string" && o.refQuelle.length >= 8)) throw new Error("sollFrei " + ID + " S" + nr + ": ohne Zahl der Karte verlangt das Soll refQuelle");
        if (!Number.isFinite(o.zahl) || !["≥", "≤", ">", "<", "=", "band", "±"].includes(o.rel)) throw new Error("sollFrei " + ID + " S" + nr + ": rel/zahl");
        return { wort, key: o.key, rel: o.rel, a: o.zahl, b: o.bis, ref: o.ref, refQuelle: o.refQuelle || o.quelleFeld + ": " + o.quelleWort, einheit: o.einheit || "" };
    };
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
                    const aus = {};
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
                            sollFrei(LR, 5, "Faunenwechsel je Zone gegen das Referenz-Profil (Epi- bis Bathypelagial)", {
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
                    const aus = {};
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
                            sollFrei(BI, 1, "Sichtweite in m an fester Pose gegen das Band des Gewässertyps", { key: "sichtBachM", rel: "band", zahl: 5, bis: 20, einheit: "m", refQuelle: "klare Bäche: schwarze Scheibe 5–20 m (Davies-Colley & Smith 2001; dieselbe Quelle wie diag-wasser-leben K5)" }),
                            sollFrei(BI, 1, "Sichtweite in m an fester Pose gegen das Band des Gewässertyps", { key: "sichtSeeM", rel: "band", zahl: 2, bis: 16, einheit: "m", refQuelle: "oligo- bis mesotrophe Seen: Sichttiefe 2–16 m (Carlson 1977, Trophie-Index 20–50)" }),
                            sollFrei(BI, 1, "Sichtweite in m an fester Pose gegen das Band des Gewässertyps", { key: "sichtFlussM", rel: "band", zahl: 1, bis: 1.5, einheit: "m", refQuelle: "Tieflandfluss: schwarze Scheibe 1–1,5 m (Davies-Colley & Smith 2001)" }),
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
                        leser: "stamm/bild-himmel.js:2480 _applyDayNightToScene —das Medium unter Wasser trägt Farbe und Abfall, keinen Strahl der Sonne",
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
                    const aus = {};
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
                            sollFrei(NE, 1, "Hub und Flucht aus dem Bild", { key: "fischHubJePegelHub", rel: "≥", zahl: 0.8, einheit: "× Pegel-Hub", quelleFeld: "tiefe", quelleWort: "Fisch-Hub ≥ 0,8 × Pegel-Hub" }),
                            sollFrei(NE, 1, "Hub und Flucht aus dem Bild", { key: "fluchtAbstandM", rel: "≥", zahl: 3, einheit: "m", quelleFeld: "tiefe", quelleWort: "Fluchtabstand ≥ 3 m" }),
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
                    const aus = {};
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

module.exports = L.stationen();
