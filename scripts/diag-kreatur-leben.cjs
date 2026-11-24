#!/usr/bin/env node
// gate:kreatur-leben — DIE LEBENS-LINSE: als Skript die Seele im Kern; als Stück der Seiten-Funktion der Kreatur-Proben
// (`BUEHNEN` an ihrer Marke) Furcht, Lebensraum, Tages-Budget, die Kaskade samt dem Bestand und Folgen am ECHTEN Takt (gate:kreatur-takt).
"use strict";

// ── furcht (Ökologie K3, tetrapoda FURCHT_GESETZ): (A) je Ort und Rolle ein Tier allein — geschlagen, gefüttert, gebunden,
// zur Kontrolle, der Bär vor ruhiger, zorniger, friedlicher Aura, Wolf und Fuchs fremd — über den Speicherstand, dann geht der
// Spieler in Stufen aus 480 m auf es zu, bis es flieht (der Abstand dann: die Fluchtdistanz, tetrapoda fluchtDistanz) oder bis 8 m, und
// steht 15 s: der Median des Abstands. Seit leben.tiere.mensch S1 flieht jedes Wild den gehenden Menschen ab der Distanz seiner
// Gattung, Gedächtnis und Aura weiten sie; vorher ging er aus 30 m bis 8 m heran, und der Median nach 40 s Hetze maß den Sprint
// des Tiers, nicht sein Gedächtnis (Kontrolle 342 m, geschlagen 358 m). (B) ein Rudel um einen Riss: sein Aufenthalt in dessen Zelle über 90 s,
// gegen den Gegenlauf ohne Feld-Furcht. (C) eine Herde 15 m vom Herd eines Brands: wer binnen 10 s flieht, gegen den Lauf ohne
// Brand (w28-brand-flucht: vorher las die Furcht die Glut nie) ──
// Die Bühnen stehen an der Marke LEBEN_BUEHNEN im Leib von `kreaturProben` (scripts/lib/kreatur-proben.cjs): r, s, A, pm, buehne,
// decke, kamera, ab und jeder Helfer der Proben sind dort im Gültigkeitsbereich — keine zweite Liste.
async function lebenBuehnen() {
    const dt = 1 / 60;
    const boden = (x, z) => r.getTerrainHeightAt(x, z) + 0.5;
    // DER GAU DER PROBE (Leben C2b): Hirsch und Wolf leben im Gau-Faden. Eine Bühne, die die Zeit rafft, fährt den Gau der
    // Regionen `keys` selbst — `fahrt(takt)` ist der Ruf des Spiels (`_gauBis` → `_gauAntwort`, wie `_gauTakt` ihn je Bild
    // stellt) in der Saat `saat` der Probe; danach liest jeder Leser das Bild am EINEN Leser des Bestands einer Art
    // (`_bestandArt`). Der Takt des Spiels ruht, solange die Bühne fährt; Akte, offene Annahmen und Bilder beginnen leer.
    // `opt.tode`: die Antwort trägt die Tode des letzten Takts (der Ruf geht dann Takt für Takt). `ganz`: der Ruf liest jedes
    // Revier der Gaue (der Gau ist die Einheit des Gesetzes — wer ihn zählt oder eingreift, liest ihn ganz). → fahrt(takt, ganz?)
    // → { ms, tode, keys? } (keys: bei `ganz` jede Region der Gaue)
    const gauFahrt = (keys, saat, opt = {}) => {
        decke("_gauTakt", () => () => {});
        aufraeumen.push(leihe(r, { _gauBildStand: null, _gauHaltStand: null, _gauOffen: null }));
        const je = new Map();
        for (const key of keys) {
            const o = r._gauOrt(...key.split(",").map(Number));
            const k = o.gx + "," + o.gz;
            (je.get(k) || je.set(k, { o, lesen: new Set() }).get(k)).lesen.add(o.revier);
        }
        const L = [...je].map(([k, { o, lesen }]) => [k, o, [...lesen].sort((p, q) => p - q)]);
        const n = A.GAU.n;
        const alle = Array.from({ length: n * n }, (_, i) => i);
        return async (takt, ganz) => {
            const aus = { ms: 0, tode: [], keys: ganz ? [] : undefined };
            for (const [k, o, teil] of L) {
                const lesen = ganz ? alle : teil;
                if (ganz) for (const i of alle) aus.keys.push(o.x0 + (i % n) + "," + (o.z0 + Math.floor(i / n)));
                const b = r._gauBild(o.gx, o.gz);
                const aktN = (r._gauHalt().get(k) || []).length;
                b.bestellt = Math.max(b.bestellt, takt);
                const a = await r._gauBis(o.gx, o.gz, takt, Object.assign({ lesen, saat }, opt));
                const t0 = performance.now();
                r._gauAntwort(b, a, lesen.join(), aktN);
                aus.ms += performance.now() - t0;
                for (const q of a.tode || [])
                    aus.tode.push(Object.assign(q, { id: r._gauKopf(o.gx, o.gz) + q.id, gau: k }));
            }
            return aus;
        };
    };
    // DER FADEN AUS EINEM GEÄNDERTEN KERN (der Weg der Bühne gau): der Quelltext von `datei`, je Paar [von, zu] JEDE Stelle
    // ersetzt (fehlt eine, bricht die Bühne beim Namen), als Blob in der Tafel eines frischen Fadens — die Mutante eines Gesetzes,
    // das im Faden rechnet. Der alte Faden kehrt mit dem Ruf der Rückgabe zurück, spätestens im Aufräumen der Bühne.
    const fadenKern = async (datei, paare) => {
        const Q = r._quelleStand();
        await r._fadenQuelle();
        const FQ = A.FADEN_QUELLE;
        const u = (p) => new URL(p + "?v=" + A.VERSION, location.href).href;
        let text = await (await fetch(u(datei))).text();
        for (const [von, zu] of paare) {
            if (text.split(von).length < 2) throw new Error("der Kern " + datei + " trägt die Stelle nicht: " + von);
            text = text.split(von).join(zu);
        }
        const blob = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
        const adr = (p) => (p === datei ? blob : u(p));
        const tafel = { kerne: FQ.kerne.map(adr), spaet: Object.fromEntries(Object.entries(FQ.spaet).map(([k, p]) => [k, adr(p)])) }; // prettier-ignore
        const rumpf = await (await fetch(u(FQ.faden))).text();
        const frisch = () => {
            if (r._gauFadenStand) r._gauFadenStand.worker.terminate();
            r._gauFadenStand = null;
        };
        const alt = Q.url;
        Q.url = URL.createObjectURL(new Blob(["self.__anazhQuelle = " + JSON.stringify(tafel) + ";", rumpf], { type: "text/javascript" })); // prettier-ignore
        frisch();
        let zurueck = () => ((Q.url = alt), frisch(), (zurueck = () => {}));
        aufraeumen.push(() => zurueck());
        return () => zurueck();
    };
    await buehne("furcht", async (restore) => {
        if (taeter === "furcht-gedaechtnis") decke("_kreaturFurchtErinnert", () => () => 0);
        if (taeter === "furcht-ort") decke("_kreaturFurchtOrt", () => (c, NAT, von, w) => w);
        if (taeter === "furcht-mensch") decke("_kreaturMenschFlucht", () => () => 0);
        if (taeter === "furcht-speicher")
            decke("_serializeCreature", (alt) => (c) => Object.assign(alt.call(r, c), { memory: [] }));
        if (taeter === "furcht-aura") {
            const F = A._furchtGesetz();
            A._furchtGesetzMemo = Object.freeze(Object.assign({}, F, { bedrohung: () => 0 }));
            restore.push(() => (A._furchtGesetzMemo = F));
        }
        const lauf = (n, e) => {
            for (let k = 0; k < n; k++) {
                ruhigSpieler(e);
                takt(dt);
            }
        };
        const zorn = { chaos: 0.9 };
        const rollen = {
            kontrolle: ["wesen"],
            geschlagen: ["wesen"],
            gefuettert: ["wesen"],
            gebunden: ["wesen"],
            baerRuhig: ["baer"],
            baerZornig: ["baer", zorn],
            baerFrieden: ["baer", zorn, "frieden"],
            wolf: ["wolf"], // satt
            fuchs: ["fuchs"],
        };
        // DREI TEILE (Kreatur-Takt 22.11.): das Gedächtnis je Rolle, der Ort des Risses, die Glut — ein Täter fährt den seinen
        const erinnert = await teil("erinnert", async () => {
        const erinnert = {};
        for (const [rolle, [seele, e, modus]] of Object.entries(rollen)) {
            const R = { abstand: [], naeher: [], erinnerungen: [], flucht: [] };
            r.setGameMode(modus || "pfad");
            for (let o = 0; o < 4; o++) {
                s.creatureAnimationTime = 100;
                r._creatureAiFrame = 0;
                const ort = frei(70 + Math.cos(o * 1.57) * 60, -40 + Math.sin(o * 1.57) * 60, 20) || land(70, -40);
                pm.set(ort.x + 3, boden(ort.x + 3, ort.z), ort.z);
                const c0 = tier(ort, seele, 1);
                ruhig(c0);
                if (rolle === "geschlagen") r.damageCreature(c0, 4, { source: "player", fromPos: pm.clone() });
                if (rolle === "gefuettert" && !r.activateCreatureConsumable(c0, "trank_lebenssaft").ok)
                    throw new Error("keine Gabe");
                pm.set(ort.x + 150, boden(ort.x + 150, ort.z), ort.z);
                lauf(600);
                const snap = jsonKlon(r._serializeCreature(c0));
                r.removeCreature(c0);
                const c = r._restoreCreatureFromSnapshot(snap);
                ruhig(c);
                if (rolle === "gebunden") c.userData.bond = 1;
                // der Wolf satt (VERHALTEN.aas): ein hungriger jagt den Spieler und flieht ihn nicht (`_kreaturJagdBereit`)
                if (rolle === "wolf") c.userData.magen = r._kreaturMagenVoll(c);
                R.erinnerungen.push((c.userData.memory || []).length);
                // DIE LEITER DER NÄHERUNG: der Spieler tritt in Stufen aus 480 m heran (je Stufe 12 % näher am Tier), geht dort 1 s
                // in seinem Lauf auf es zu, bis es flieht (`_motionZustand` "flucht"): `fluchtM` (0 = es floh nicht); sonst steht
                // er nach der letzten Stufe bei 8 m (ein Gang aus 480 m wären bei s.speed Minuten je Tier)
                let fluchtM = 0;
                for (let d = 480; !fluchtM; d = Math.max(8, d * 0.88)) {
                    pm.set(c.position.x + d, boden(c.position.x + d, c.position.z), c.position.z);
                    for (let k = 0; k < 60 && !fluchtM; k++) {
                        const dk = ab(c.position, pm);
                        pm.x += ((c.position.x - pm.x) / dk) * s.speed * dt;
                        pm.z += ((c.position.z - pm.z) / dk) * s.speed * dt;
                        pm.y = boden(pm.x, pm.z);
                        lauf(1, e);
                        if (c.userData._motionZustand === "flucht") fluchtM = ab(c.position, pm);
                    }
                    if (d === 8) break;
                }
                R.flucht.push(rund(fluchtM, 1));
                const d0 = ab(c.position, pm);
                for (let k = 0; k < 900; k++) {
                    lauf(1, e);
                    R.abstand.push(ab(c.position, pm));
                }
                R.naeher.push(d0 - Math.min(...R.abstand.slice(-900)));
                leer(1);
            }
            erinnert[rolle] = {
                medianM: rund(quantil(R.abstand, 0.5), 2),
                naeherM: rund(quantil(R.naeher, 0.5), 2),
                fluchtM: rund(quantil(R.flucht, 0.5), 1),
                flucht: R.flucht,
                erinnerungen: R.erinnerungen,
            };
        }
        return erinnert;
        });
        r.setGameMode("pfad");
        const Z = A.LIFE_FIELD.cell;
        const zelle = (x, z, mx, mz) =>
            Math.floor(x / Z) === Math.floor(mx / Z) && Math.floor(z / Z) === Math.floor(mz / Z);
        const ort = await teil("ort", async () => {
        const ort = { riss: [], gegenlauf: [] };
        for (const gegen of [false, true])
            for (let o = 0; o < 3; o++) {
                s.creatureAnimationTime = 100;
                r._creatureAiFrame = 0;
                s.emotionField = undefined;
                const f =
                    frei(-80 + Math.cos(o * 2.1 + 0.4) * 70, 60 + Math.sin(o * 2.1 + 0.4) * 70, 28) || land(-80, 60);
                const mx = (Math.floor(f.x / Z) + 0.5) * Z,
                    mz = (Math.floor(f.z / Z) + 0.5) * Z;
                pm.set(mx + 150, boden(mx + 150, mz), mz);
                const herde = [];
                for (let i = 0; i < 5; i++) {
                    const x = mx + Math.cos(i * 2.4) * 3 * Math.sqrt(i + 0.5),
                        z = mz + Math.sin(i * 2.4) * 3 * Math.sqrt(i + 0.5);
                    const c = tier({ x, y: boden(x, z), z }, "wesen", 1);
                    ruhig(c);
                    c.userData.wanderAnchor = { x: mx, z: mz };
                    herde.push(c);
                }
                r._kreaturVerbinden(herde);
                lauf(300);
                const opfer = tier({ x: mx, y: boden(mx, mz), z: mz }, "wesen", 1);
                r.damageCreature(opfer, 1e9, { source: "jagd" });
                if (!s.leichname.includes(opfer)) throw new Error("der Riss fällt nicht");
                if (gegen) s.emotionField = undefined; // der Gegenlauf: Feld-Furcht 0
                let drin = 0;
                for (let k = 0; k < 5400; k++) {
                    lauf(1);
                    for (const c of herde) if (zelle(c.position.x, c.position.z, mx, mz)) drin++;
                }
                ort[gegen ? "gegenlauf" : "riss"].push(rund(drin / 5400 / herde.length, 3));
                leer(1);
            }
        return ort;
        });
        // (C) DIE GLUT IST BEDROHUNG (w28-brand-flucht): eine Herde von fünf, ihr Herd 15 m entfernt (`_brandEntfachen`, das Brennglas
        // der Seite; die Welt trocken) — der Anteil, der binnen 10 s Spielzeit flieht (`_motionZustand` "flucht"), gegen denselben
        // Lauf ohne Brand an denselben Orten. Der Brand geht seinen Takt (`_tickBrand`) je Bild auf der Spiel-Uhr; gezählt werden
        // die ersten drei Orte, an denen der Herd fängt (ein Ort ohne Bett ist kein Lauf).
        const { brand, orte } = await teil("brand", async () => {
        const brand = { feuer: [], gegenlauf: [], herde: 0 };
        const altNaesse = s.naesse;
        const orte = [];
        if (taeter === "brand-flucht") decke("_kreaturGlutNah", () => () => false);
        // die Bühne führt die Uhr von Hand (`r._weltUhrNimm(s.spielZeit + dt)`, `_tickBrand`) und rechnet keinen Takt des Bestands: das Entfachen ist am
        // Eingang an der Reihe (`_feldFolgeSteht`, w28-mp-boden — im Spiel tritt es hinter die Takte, die die nahen Regionen nachholen)
        decke("_feldFolgeSteht", () => () => true);
        for (const gegen of [false, true])
            for (let o = 0; o < 8 && (gegen ? o < orte.length : orte.length < 3); o++) {
                s.creatureAnimationTime = 100;
                r._creatureAiFrame = 0;
                s.emotionField = undefined;
                s.naesse = 0;
                const p = gegen ? orte[o] : o;
                const f = frei(120 + Math.cos(p * 2.1) * 60, -60 + Math.sin(p * 2.1) * 60, 24) || land(120, -60);
                let herd = gegen;
                for (let q = 0; q < 8 && !herd; q++)
                    herd = !!r._brandEntfachen(f.x + Math.cos(q * 0.785) * 15, f.z + Math.sin(q * 0.785) * 15);
                if (!herd) continue;
                if (!gegen) orte.push(o);
                pm.set(f.x + 150, boden(f.x + 150, f.z), f.z);
                const herde = [];
                for (let i = 0; i < 5; i++) {
                    const x = f.x + Math.cos(i * 2.4) * 3 * Math.sqrt(i + 0.5),
                        z = f.z + Math.sin(i * 2.4) * 3 * Math.sqrt(i + 0.5);
                    const c = tier({ x, y: boden(x, z), z }, "wesen", 1);
                    ruhig(c);
                    c.userData.wanderAnchor = { x: f.x, z: f.z };
                    herde.push(c);
                }
                r._kreaturVerbinden(herde);
                lauf(120); // die Herde steht (die Spiel-Uhr ruht: der Herd glüht erst mit dem ersten Schritt des Brands)
                const floh = new Set();
                for (let k = 0; k < 600; k++) {
                    r._weltUhrNimm(s.spielZeit + dt);
                    r._tickBrand();
                    lauf(1);
                    for (const c of herde) if (c.userData._motionZustand === "flucht") floh.add(c);
                }
                brand[gegen ? "gegenlauf" : "feuer"].push(rund(floh.size / herde.length, 2));
                if (s.brandFeld) s.brandFeld.clear(); // gelöscht: der nächste Lauf beginnt ohne Glut
                r._brandRest = r._brandBett = null;
                leer(1);
            }
        s.naesse = altNaesse;
        return { brand, orte };
        });
        const mittel = (a) => rund(a.reduce(addiere, 0) / a.length, 3);
        return {
            erinnert,
            witterungM: A._verhaltenGesetz().furcht.noticeRadius,
            ort: { aufenthalt: mittel(ort.riss), gegenlauf: mittel(ort.gegenlauf) },
            brand: {
                flieht: mittel(brand.feuer),
                gegenlauf: mittel(brand.gegenlauf),
                herde: orte.length,
                je: brand.feuer,
            },
        };
    });
    // ── DER ZEITRAFFER (Ökologie K1/K2): `tickFaunaLifecycle` je 10 s Spiel-Zeit, der Spieler an P0 — der Ecke von vier nahen
    // Regionen —, im Lauf „halb“ lebendig × ½ von Anfang an; gemessen wird der Bestand des Tals am EINEN Leser des Bestands einer
    // Art (`_bestandArt`: Fuchs und Bär im Verzeichnis ihrer Region, Hirsch und Wolf im Bild ihres Gaus — Leben C2b; die Bühne
    // fährt den Gau im Gleichschritt mit der Uhr, je Takt des Lebenszyklus ein Takt des Gaus, `gauFahrt`) und je Takt die Kosten
    // des Lebenszyklus samt der Lesung des Gaus ──
    const GATTUNGEN = Object.keys(A._lebensraumGesetz().L.gattung);
    // die Äsenden der Altlast: Gattungen außerhalb des Gaus, deren Kost Äsung trägt (diet < 1 — der Fuchs lebt von der Beute)
    const AESEND = GATTUNGEN.filter((g) => !r._gauRolle(g) && r._bestandDiet()[g] < 1);
    // die Köpfe einer Region über alle Gattungen (`nur`: "alt" die Altlast, "gau" die Gattungen des Gesetzes)
    const koepfe = (key, nur) =>
        GATTUNGEN.reduce((n, g) => {
            if (nur && (nur === "gau") !== !!r._gauRolle(g)) return n;
            const B = r._bestandArt(key, g);
            return n + (B ? B.n : 0);
        }, 0);
    const zeitraffer = () => {
        if (taeter === "bestand-nahrung") decke("_kreaturNahrung", () => () => 0.5);
        if (taeter === "bestand-deckel")
            decke("_kreaturBestand", (alt) => (...a) => {
                const b = alt.apply(r, a);
                for (const g in b) Object.assign(b[g], { geburt: 1, tod: 0 });
                return b;
            });
        let halb = false;
        decke("worldFieldAt", (wfa) => (x, z) => {
            const f = wfa.call(r, x, z);
            return halb ? Object.assign({}, f, { lebendig: f.lebendig / 2 }) : f;
        });
        // DIE HALBE NAHRUNG IM GAU: das Feld des Fadens nährt je Zelle die halbe Fläche (K je Zelle ∝ ha — dieselbe Hälfte)
        decke("_gauWirt", (alt) => (kg) => {
            const w = alt.call(r, kg);
            return halb ? Object.assign({}, w, { feld: Object.assign({}, w.feld, { ha: w.feld.ha / 2 }) }) : w;
        });
        const tod = { n: 0, trauer: 0, journal: 0, bestand: 0, leicht: 0, pLeicht: 0, kg: 0, kgSoll: 0 };
        // DAS OPFER DES HUNGERS im Verzeichnis der Altlast (leben-erbe): wem die Reserve zuerst ausgeht — gezogen mit dem Risiko
        // 1/fastenRang seiner Masse unter den Freien seiner Gattung in seiner Region; gemessen gegen die Erwartung dieses Zugs je
        // Wahl (wie oft das Leichteste, welche Masse). Bis leben-erbe nahm der Hunger das Älteste, bis zur Heilung von leben-erbe
        // immer genau das Leichteste (eine Auslese unendlicher Schärfe: ohne Wölfe lief die Größe davon).
        const LK = A._lebenKern();
        decke("_bestandStirbt", (alt) => (R, t, ursache, ...rest) => {
            const kand = ursache === "hunger" ? r._bestandFreie(R).filter((o) => o.g === t.g) : [];
            if (kand.length > 1) {
                const m = kand.map((o) => r._bestandKg(o));
                const w = m.map((x) => 1 / LK.fastenRang(x));
                const W = w.reduce(addiere, 0);
                const il = m.indexOf(Math.min(...m));
                Object.assign(tod, {
                    bestand: tod.bestand + 1,
                    leicht: tod.leicht + (kand[il] === t),
                    pLeicht: tod.pLeicht + w[il] / W,
                    kg: tod.kg + r._bestandKg(t),
                    kgSoll: tod.kgSoll + m.reduce((q, x, i) => q + (x * w[i]) / W, 0),
                });
            }
            return alt.call(r, R, t, ursache, ...rest);
        });
        decke("_creatureNaturalDeath", (dies) => (c, grund, ...rest) => {
            const o = dies.call(r, c, grund, ...rest);
            const j = s.worldJournal.entries;
            if (grund === "hunger")
                Object.assign(tod, {
                    n: tod.n + 1,
                    trauer: tod.trauer + (s.player.emotions.sorrow > 0),
                    journal: tod.journal + (j[j.length - 1].type === "loss"),
                });
            return o;
        });
        return async (saat, takte, mitHalb, fern, eingriff, ganzAm) => {
            // die Saat setzt die Ströme je Zweck (die Region liest `bestand:<Region>`, aus ihm auch die Größe ihrer Tiere) und den
            // Gau; die Spiel-Zeit beginnt bei 0 (ihre Differenzen sind sonst je Boot andere Fließkomma-Zahlen)
            const rng = new Proxy(Object.create(null), {
                get: (o, k) => o[k] || (o[k] = r._streamRng("bestand-" + saat + "-" + String(k))),
            });
            r._faunaStroeme = { seed: s.worldMeta.seed, rng };
            [s._creatureNetSeq, s.faunaLifecycle] = [1e4 * saat, { lastTick: 0 }];
            r._weltUhrNeu(0); // je Saat eine neue Welt-Uhr: bestellt bei der Welt (nur die Geburt stellt sie zurück)
            [s.lifeField, s.faunaBestand] = [];
            halb = !!mitHalb;
            const [n, ms, msGau, nah] = [[], [], [], r._bestandNah()];
            // leer gelesen AN DER UHR 0 (seit w27-tiere-sicht beginnt eine junge Region eine Stunde davor)
            for (const k of nah) r._bestandRegion(k, false).t = 0;
            const gau = gauFahrt([...nah, ...fern], 3e6 + saat);
            await gau(0);
            // DAS TAL: von den nahen Regionen die mit der größten Kapazität des Rotwilds — dort misst die Kaskade
            const tal = nah.reduce((a, b) => (r._bestandArt(b, "deer").K > r._bestandArt(a, "deer").K ? b : a));
            let [kappe, K] = [0, 0];
            for (let k = 0; k < takte; k++) {
                r._weltUhrNimm(s.spielZeit + 10);
                ruhigSpieler();
                const t0 = performance.now();
                r.tickFaunaLifecycle();
                const dt = performance.now() - t0;
                // die Antwort des Gaus wird das Bild in ihrem eigenen Ereignis (der Takt bestellt nur, `_gauTakt`): ihre Kosten
                // stehen neben denen des Takts; ein ganzer Gau gelesen (`ganzAm`) ist die Lesung der Probe, nicht die des Spiels
                const ganz = !!(ganzAm && ganzAm(k));
                const g = await gau(k + 1, ganz);
                ms.push(dt);
                if (!ganz) msGau.push(g.ms);
                if (eingriff) eingriff(k, nah, tal, g.keys);
                for (const c of s.leichname.slice()) r.removeCreature(c);
                // der Leerlauf zwischen den Takten (`_imLeerlauf` kommt im Zeitraffer nie): die Tod-Lage der Entfernten fällt
                r._todLageTick();
                // DER AUSBRUCH: über 3 × die Kapazität der Region (+ 10) bricht der Bestand über seine Nahrung aus — dort misst der
                // Lauf nichts mehr (bis oekologie.K2#2 die Körper an der Kosten-Kappe, die heute nur zeichnet)
                if (k % 36 === 0) K = GATTUNGEN.reduce((q, g) => q + (r._bestandArt(tal, g) || { K: 0 }).K, 0);
                const je = { alle: 0 };
                for (const g of GATTUNGEN) {
                    const B = r._bestandArt(tal, g);
                    [je[g], je.alle] = [B ? B.n : 0, je.alle + (B ? B.n : 0)];
                }
                if (je.alle > 3 * K + 10 && ++kappe) break;
                n.push(je);
            }
            leer();
            const mittel = (a, b, g) =>
                rund(n.slice(a, b).reduce((p, je) => p + (je[g || "alle"] || 0), 0) / (b - a), 2);
            return { kappe, mittel, tod, ms, msGau, nah, tal };
        };
    };
    // je nahe Region verlassen n Tiere der Art den Bestand (der Eingriff der Kaskade: gejagt, entfernt), ihr Leib mit ihnen —
    // gelesen am EINEN Leser; ein Kopf des Gaus ohne Leib geht mit dem Akt „aus“ (`_gauAus`, wie `_bestandAus` am Leib)
    const nimm = (art, n) => (k, nah) => {
        for (const key of nah)
            for (const t of (r._bestandArt(key, art) || { tiere: [] }).tiere.slice(0, n)) {
                const c = t.leib;
                if (c) (r._bestandAus(c), r.removeCreature(c));
                else if (t.gau) r._gauAus(t);
                else s.faunaBestand.regionen[key].tiere.splice(s.faunaBestand.regionen[key].tiere.indexOf(t), 1);
            }
    };
    // DER EFFEKT eines Gegenlaufs: das Mittel der Differenzen je Saat durch das Mittel des Grundlaufs und sein Intervall — die
    // Ordnungs-Statistik [kleinste, größte Differenz] (über 8 Saaten deckt sie den Median mit 1 − 2 · 0,5⁸ = 99,2 %), mit `t`
    // das 95-%-Intervall des Mittels (t × Standardfehler; bei ~8 Tieren je Region streut eine Saat um einen Wurf)
    const effekt = (G, H, wert, t) => {
        const m = (v) => v.reduce(addiere, 0) / v.length;
        const g0 = m(G.map(wert));
        const d = G.map((g, i) => rund((wert(H[i]) - wert(g)) / Math.max(1e-9, g0), 3));
        const se = t * Math.sqrt((m(d.map((q) => (q - m(d)) ** 2)) * (d.length / (d.length - 1))) / d.length);
        const ki = t ? [m(d) - se, m(d) + se].map((q) => rund(q, 3)) : [Math.min(...d), Math.max(...d)];
        return { grund: rund(g0, 2), effekt: rund(m(d), 3), ki };
    };
    // ── kaskade (Ökologie K1): je Saat der Grundlauf, je Gattung das Mittel der Takte 80–160 gegen 560–640 (der Anfang besiedelt);
    // gegen ihn je Saat 480 Takte (80 Minuten des Spiels, 18 Jahre des Gaus) die Szenarien — die Wölfe entfernt, das Leben des Felds
    // halbiert (Ökologie K2: Geburt und Hungertod folgen der Nahrung — und die Wölfe der Beute).
    // Im Mittel der Takte 240–480 je Gattung der Bestand und der Jungwuchs: die Äsung des Tals, wie die Kapazität des Rotwilds sie
    // liest (K ∝ Σ Lebensraum × Äsung; die Äsung liest den Fraß des Gaus, `_gauFrassAt`). Die Mutante „Fraß-Leser aus“ liest
    // denselben Lauf mit stummem Fraß-Leser — der Jungwuchs trägt dann keinen Wolf mehr. DER BESTAND (oekologie.K2#2: überall;
    // fern als Zahl, nah als Körper): dieselben Läufe gezeichnet unter der Kappe des Spiels (20, dirigent-kern maxCreatures), dazu
    // die Mutante „Kappe halbiert“ — die Wölfe entfernt unter halber Kappe (Soll: je Takt dieselben Tiere in jeder nahen Region
    // wie unter der ganzen; 28.10. fiel hier ein Eingriff, der den Leib nicht nahm); je 10 Takte von 160 an die vier nahen und vier
    // ferne Regionen (eine Kachel Abstand: `_bestandRegion` holt nach, was die Altlast versäumte, ohne Leib; der Gau liest sie im
    // Bild) gegen die halbe Nahrung (Soll: weniger an jedem Ort); je Takt die Leiber (≤ Kappe, jeder aus einer nahen Region) und
    // die Kosten des Lebenszyklus ──
    await buehne("kaskade", async () => {
        const lauf = zeitraffer();
        if (taeter === "bestand-kappe") decke("_creatureNaturalBirth", (alt) => (...a) => (s.creatures.length < s.maxCreatures ? alt.apply(r, a) : [])); // prettier-ignore
        // der Täter der Dichte (tiere.K5): das Revier auf dem Land von vor w27-tiere-sicht (Kachel 354 m)
        if (taeter === "bestand-duenn") decke("_bestandSeite", () => () => 354);
        // der Täter der jungen Welt: die Region beginnt ohne ihre Stunde (bis w27-tiere-sicht frühestens an der Welt-Uhr 0)
        if (taeter === "bestand-jung")
            aufraeumen.push(leihe(A, { BESTAND_REGION: { ...A.BESTAND_REGION, aufholS: 0 } }));
        // der Täter des Risses: der Gau reißt nicht (der Riss des Kerns fällt aus — der Wolf jagt ins Leere)
        if (taeter === "kaskade-riss")
            await fadenKern("leben-core.js", [["const o = zug(list, wahl, rng);", "const o = (rng(), null);"]]);
        // DAS TAL DER WILDNIS: die Kaskade misst, wo das Feld wirft — keine Zelle des Bestands der nahen Regionen liegt auf einer
        // Fläche des Genesis-Orts (Kern, Ring, Mall, Wiese, Ufer, die Bühnen: dort fällt jede Geburt und jeder Leib,
        // `_kreaturGrundFrei`). Der Zeitraffer steht ganze Regionen westlich der Ankunft, bis keine mehr dort liegt (709 m). Bis
        // Pflicht F begann die Wildnis an der Ankunft; seit dem Plan lagen 7 Zellen auf ihm, und ohne die Wölfe wuchs das Rotwild
        // um 0,222 statt 0,391 (dieselben Saaten, die Flächen still). Täter (Selbsttest): der Zeitraffer an der Ankunft
        const park = () => r._bestandNah().flatMap((k) => r._bestandFeld(k).zellen).filter((c) => r._genesisFlaeche(c.x, c.z)).length; // prettier-ignore
        for (let x = pm.x; taeter !== "kaskade-park" && park(); kamera(0, -1))
            ((x -= r._bestandSeite()), pm.set(x, boden(x, pm.z), pm.z));
        if (park()) throw new Error(`das Tal liegt im Genesis-Ort: ${park()} Zellen`);
        // die vier Regionen schräg an den Ecken des Tals (nicht nah, ihr Bestand nur als Zahl)
        const [ix, iz] = [pm.x, pm.z].map((v) => Math.round(v / r._bestandSeite()));
        const fern = [[-2, -2], [1, -2], [-2, 1], [1, 1]].map(([a, b]) => ix + a + "," + (iz + b)); // prettier-ignore
        // der Täter der Ferne: die fernen Regionen holen nicht nach (Altlast), und das Bild des Gaus trägt sie nicht
        if (taeter === "bestand-fern") {
            decke(
                "_bestandRegion",
                (alt) =>
                    (key, auf, ...a) =>
                        alt.call(r, key, !fern.includes(key) && auf, ...a)
            );
            decke("_gauRevier", (alt) => (key) => (fern.includes(key) ? null : alt.call(r, key)));
        }
        // ein Täter fährt den Grundlauf und nur die Szenarien, die seinen Befund tragen, in 2 Saaten (der Selbsttest fuhr je
        // Täter alle in 4 Saaten — 230 000 Takte, mehr als die Probe selbst, und riss die 20-min-Frist seiner Gruppe)
        const TRAEGT = {
            "kaskade-riss": ["ohneWolf"],
            "bestand-nahrung": ["halb"],
            "bestand-kappe": ["ohneWolf", "kappeHalb"],
        };
        // DIE JUNGE WELT: an der Welt-Uhr 0 holen die nahen Regionen der Altlast ihre Stunde nach (100 Takte des Spiels, die Uhr
        // steht); der Gau steht an seinem Takt 0 mit dem vollen Gründer-Bestand (leben-core `gauAnfang`)
        // (die Folge der Altlast wartet auf das Bild des Gaus, `_bestandGauSteht`: erst die Antwort, dann die Takte)
        r._weltUhrNeu(0);
        await gauFahrt(r._bestandNah(), 3e6)(0);
        for (let k = 0; k < 100; k++) r.tickFaunaLifecycle();
        const jung = {
            alt: r._bestandNah().reduce((n, k) => n + koepfe(k, "alt"), 0),
            gau: r._bestandNah().reduce((n, k) => n + koepfe(k, "gau"), 0),
            je: Object.fromEntries(GATTUNGEN.map((g) => [g, r._bestandNah().reduce((n, k) => n + ((r._bestandArt(k, g) || { n: 0 }).n), 0)])), // prettier-ignore
        };
        const [GRUND, LAUF] = [640, 480];
        // DER JUNGWUCHS: die Kapazität des Rotwilds über den acht Regionen (vier nah, vier fern — ein Tal von vier streut je Saat
        // mit der Herde, die gerade dort äst), je 10 Takte. DIE MUTANTE „Fraß-Leser aus“: derselbe Lauf, der Jungwuchs gelesen
        // ohne den Fraß des Gaus und der Herde
        const jungwuchs = (keys, ohneFrass) => {
            const ab = [];
            if (ohneFrass) (decke("_gauFrassAt", () => () => 0, ab), decke("_kreaturFrass", () => () => {}, ab));
            try {
                return keys.reduce((K, key) => K + (r._bestandArt(key, "deer") || { K: 0 }).K, 0);
            } finally {
                for (const f of ab) f();
            }
        };
        // DER GAU IST DIE EINHEIT DES GESETZES (Leben C2b): Hirsch und Wolf leben in ihm (2 304 Regionen, ≈ 14 000 Hirsche, ≈ 50
        // Wölfe in ≈ 10 Rudeln — ein Rudel steht am Ort seines letzten Risses); die Kaskade greift in den GANZEN Gau des Tals ein und
        // zählt ihn ganz am EINEN Leser (`_bestandArt` je Region; je 20 Takte im Fenster 240–480): die Wölfe entfernt (am Takt 0
        // jeder, den die Lesung findet — ein Gau ohne Wolf bekommt keinen, S10: keine Einwanderung — und jeder, den eine Lesung
        // danach findet); die Wölfe folgen der Beute, wenn das Feld sie halb nährt (die halbe Nahrung: weniger Hirsche ohne einen
        // Akt — bis Leben C2b bejagte die Bühne je Region einen Hirsch je halbe Spielminute; im Gau wären das Tausende Akte „aus“
        // je Jahr in seiner Reihe). Bis Leben C2b fuhr sie im Tal von vier Regionen — dort steht im Gau kaum je ein Wolf (0,05
        // im Mittel), und kein Eingriff dort erreicht die Kaskade des Gesetzes. Gelesen wird der ganze Gau nur, wo ein Eingriff
        // oder das Fenster ihn braucht (`ganz`: ≈ 0,4 s je Lesung)
        const L = {};
        const gauZahl = (G, g) => G.reduce((n, key) => n + (r._bestandArt(key, g) || { n: 0 }).n, 0);
        const fenster = (k) => k >= LAUF / 2 && k < LAUF && !(k % 20);
        const GANZ = { grund: fenster, ohneWolf: (k) => !k || fenster(k), kappeHalb: (k) => !k, halb: fenster };
        for (const [name, eingriff] of Object.entries({
            grund: null,
            ohneWolf: (k, nah, G) => G && nimm("wolf")(k, G),
            kappeHalb: (k, nah, G) => G && nimm("wolf")(k, G),
            halb: null,
        })) {
            if (taeter && name !== "grund" && !(TRAEGT[taeter] || []).includes(name)) continue;
            L[name] = [];
            for (let i = 1; i <= (taeter ? 2 : 8); i++) {
                s.maxCreatures = name === "kappeHalb" ? 10 : 20;
                const z = {
                    jung: 0,
                    jungMut: 0,
                    aesend: 0,
                    spur: [],
                    orte: [],
                    leiber: 0,
                    fremd: 0,
                    fremdWer: {},
                    gesehen: new WeakSet(),
                    gau: { deer: 0, wolf: 0, proben: 0 },
                };
                const l = await lauf(
                    i,
                    name === "grund" ? GRUND : LAUF,
                    name === "halb",
                    fern,
                    (k, nah, tal, G) => {
                        if (eingriff) eingriff(k, nah, G);
                        if (G && fenster(k)) for (const g of ["deer", "wolf", "proben"]) z.gau[g] += g === "proben" ? 1 : gauZahl(G, g); // prettier-ignore
                        if (k >= LAUF / 2 && k < LAUF && !(k % 10)) (z.jung += jungwuchs([...nah, ...fern]) / (LAUF / 20), (z.jungMut += jungwuchs([...nah, ...fern], true) / (LAUF / 20))); // prettier-ignore
                        // die fernen Regionen der Altlast holen je 10 Takte nach, was sie versäumten (ohne Leib)
                        if (!(k % 10)) for (const key of fern) (ruhigSpieler(), r._bestandRegion(key));
                        if (k >= 160 && k < LAUF && !(k % 10)) [...nah, ...fern].forEach((key, j) => (z.orte[j] = (z.orte[j] || 0) + koepfe(key) / ((LAUF - 160) / 10))); // prettier-ignore
                        if (k >= LAUF / 2 && k < LAUF && !(k % 10)) z.aesend += [...nah, ...fern].reduce((n, key) => n + AESEND.reduce((m, g) => m + (r._bestandArt(key, g) || { n: 0 }).n, 0), 0) / (LAUF / 20); // prettier-ignore
                        if (/ohneWolf|kappeHalb/.test(name)) z.spur.push(nah.map((key) => GATTUNGEN.flatMap((g) => (r._bestandArt(key, g) || { tiere: [] }).tiere.map((t) => t.id)).join()).join("|")); // prettier-ignore
                        z.leiber = Math.max(z.leiber, s.creatures.length);
                        // jeder Leib wird aus einer nahen Region GEZEICHNET (gezählt, wo er zuerst steht: ein Jährling des Gaus, der danach
                        // abwandert — Bock 0,80, leben-core Satz 5 —, trägt sein Tier in dessen neues Revier, das kann fern sein)
                        for (const c of s.creatures.filter(
                            (c) =>
                                c.userData._bestand &&
                                !z.gesehen.has(c) &&
                                z.gesehen.add(c) &&
                                !nah.includes(r._bestandKey(c.userData._bestand.x, c.userData._bestand.z))
                        ))
                            // prettier-ignore
                            (z.fremd++, (z.fremdWer[c.userData._bestand.g] = (z.fremdWer[c.userData._bestand.g] || 0) + 1));
                    },
                    GANZ[name]
                );
                L[name].push(Object.assign(l, z));
                // zwischen den Läufen eine Aufgaben-Grenze (der EINE Schlaf der Seite): erst dort räumt die Speicher-Bereinigung die
                // Leiber eines Laufs — ohne sie wuchs die Seite über die Läufe bis 4 GB (28.10., vier Regionen)
                await sleep(1);
            }
        }
        const richtung = (b, g, soll, a = "grund") => {
            // der Jungwuchs mit dem 95-%-Intervall des Mittels (er folgt den Hirschen des Gaus, je Saat um das Äsen der Herde gestreut)
            const t = /^jung/.test(g) ? 2.365 : undefined;
            const e = effekt(L[a], L[b], (l) => (g === "jung" ? l.jung : g === "jungMut" ? l.jungMut : g === "aesend" ? l.aesend : r._gauRolle(g) ? l.gau[g] / l.gau.proben : l.mittel(LAUF / 2, LAUF, g)), t); // prettier-ignore
            return Object.assign(e, { soll, haelt: soll > 0 ? e.ki[0] > 0 && e.effekt >= soll : e.ki[1] < 0 && e.effekt <= soll }); // prettier-ignore
        };
        const richtungen = {};
        for (const [k, b, g, soll] of [
            // das Soll der Hirsche ist die Hälfte dessen, was das Gesetz im Gleichgewicht trägt (LAUF4 S4: mit Wolf 0,8613 der Beute
            // ohne ihn → ohne Wolf +0,161); die Altlast verlangte im Tal +0,3
            ["hirsche", "ohneWolf", "deer", 0.08],
            // der Jungwuchs fällt, wo die Hirsche des Gaus steigen (die Altlast verlangte −0,2 bei +0,3 Hirschen im Tal)
            ["jungwuchs", "ohneWolf", "jung", -0.03],
            ["woelfe", "halb", "wolf", 0],
            // die halbe Nahrung an JEDEM ihrer Leser: die Äsenden der Altlast (Kost < 1, der Bär: `_kreaturNahrung` je Takt am Feld,
            // in allen nahen und fernen Regionen) und der Gau (das Feld seines Fadens, `_gauWirt`) — eine Zahl über alle trug den Gau
            // und den Fuchs (er folgt der Beute), der Leser der Altlast konnte schweigen
            ["nahrung", "halb", "aesend", -0.3],
            ["nahrungGau", "halb", "deer", -0.3],
            ["mutante", "ohneWolf", "jungMut", -0.03],
        ])
            if (L[b]) richtungen[k] = richtung(b, g, soll);
        const [G, H, ms] = [L.grund, L.kappeHalb, L.grund.flatMap((l) => l.ms).sort(aufsteigend)];
        return {
            saaten: G.map((l) => Object.fromEntries(GATTUNGEN.map((g) => [g, [l.mittel(80, 160, g), l.mittel(GRUND - 80, GRUND, g)]]))), // prettier-ignore
            kappe: Object.values(L)
                .flat()
                .reduce((p, l) => p + l.kappe, 0),
            richtungen,
            jung,
            hungertod: G[0].tod, // je Hungertod aller Läufe
            bestand: {
                nah: G[0].nah.length,
                anders: (H || []).reduce(
                    (p, h, i) => p + h.spur.filter((x, k) => x !== L.ohneWolf[i].spur[k]).length,
                    0
                ),
                takte: (H || []).reduce((p, h) => p + h.spur.length, 0),
                leiber: [G, H || []].map((X) => Math.max(...X.map((l) => l.leiber))),
                zahl: rund(G.reduce((p, l) => p + l.orte.slice(0, 4).reduce(addiere, 0), 0) / G.length, 1),
                fremd: [...G, ...(H || [])].reduce((p, l) => p + l.fremd, 0),
                fremdWer: [...G, ...(H || [])].reduce((p, l) => (Object.entries(l.fremdWer).forEach(([g, n]) => (p[g] = (p[g] || 0) + n)), p), {}), // prettier-ignore
                ha: rund((G[0].nah.length * r._bestandSeite() ** 2) / 1e4, 1),
                nahrung: G[0].orte.map((x, j) => effekt(G, L.halb || G, (l) => l.orte[j], 2.365)),
                ms: rund(rang(ms, 0.95), 2),
                msGau: rund(rang(L.grund.flatMap((l) => l.msGau).sort(aufsteigend), 0.95), 2),
            },
        };
    });
    // ── folgen (Ökologie K5, der Parcours): „folge mir“, dann geht der Spieler 10 min mit W (`_stepFixedSim`) über Hang und
    // Wasser, um Wand und gedrehtes Haus, über den Sockel; Gegenlauf ohne die Geste ──
    await buehne("folgen", async (restore) => {
        const um = (name, fn) => decke(name, (alt) => fn(alt));
        if (taeter === "folgen")
            um(
                "_tickCreatureFollowPlayer",
                (alt) =>
                    (...a) =>
                        alt.apply(r, a).set(0, 0, 0)
            );
        if (taeter === "folgen-wand") um("_kreaturHuellenKontakt", () => () => {});
        // der alte Stand: das Gemüt wählt, als trüge das Tier keinen Auftrag · das Gegenteil: wer folgt, spielt nie
        if (taeter === "folgen-spiel")
            um("_tickKreaturVerhalten", (alt) => (c, ...a) => {
                const [ud, auftrag] = [c.userData, c.userData.task];
                ud.task = null;
                try {
                    return alt.call(r, c, ...a);
                } finally {
                    ud.task = auftrag;
                }
            });
        if (taeter === "folgen-ernst")
            um("_tickKreaturVerhalten", (alt) => (c, ...a) => {
                if ((c.userData.task || {}).name !== "follow_player") return alt.call(r, c, ...a);
                c.userData._verhaltenAktion = null;
            });
        if (taeter === "sockel") um("_kreaturAuflage", () => () => -Infinity);
        if (taeter === "gedreht-kontakt")
            um(
                "_resolveCapsuleVsAABB",
                (alt) => (b, pos, f, h, rad, st, k) => alt.call(r, b, pos, f, h, rad, st, b.obb ? null : k)
            );
        if (taeter === "gedreht-rahmen")
            um(
                "_boxAbstand2",
                (alt) => (b, x, z) => alt.call(r, { minX: b.minX, maxX: b.maxX, minZ: b.minZ, maxZ: b.maxZ }, x, z)
            );
        if (taeter === "hindernis")
            um("updateCreatures", (alt) => (dt) => {
                alt.call(r, dt);
                for (const { position: p } of s.creatures)
                    r._fieldRaycast(p.x, p.y + 0.5, p.z, p.x + 2, p.y + 0.5, p.z + 2);
            });
        if (taeter === "hindernis-leib")
            um("_kreaturHuellenKontakt", (alt) => (...a) => {
                const echt = r._kreaturLeib;
                r._kreaturLeib = (...b) => A.prototype._kreaturLeib.apply(r, b); // der Zwilling: dieselben Zahlen, nicht der Leser
                try {
                    return alt.apply(r, a);
                } finally {
                    r._kreaturLeib = echt;
                }
            });
        const n = { leib: 0, strahlen: 0, takt: 0, kontakt: 0, spielerWand: 0 };
        const H = [];
        um(
            "_kreaturLeib",
            (alt) =>
                (...a) => (n.kontakt && n.leib++, alt.apply(r, a))
        );
        um("_kreaturHuellenKontakt", (alt) => (c, ...a) => {
            const [x, z] = [c.position.x, c.position.z];
            n.kontakt++;
            try {
                return alt.call(r, c, ...a);
            } finally {
                n.kontakt--;
                if (c.position.x !== x || c.position.z !== z)
                    for (const h of H) if (Math.hypot(h.cx - x, h.cz - z) < 7) h.kontakt++;
            }
        });
        um(
            "_fieldRaycast",
            (alt) =>
                (...a) => (n.takt && n.strahlen++, alt.apply(r, a))
        );
        const WK = ["_wandKontaktAt", "_wandKontaktNx", "_wandKontaktNz"];
        um("updateCreatures", (alt) => (dt) => {
            const vor = WK.map((k) => s[k]);
            for (const k of WK) s[k] = NaN;
            n.takt++;
            try {
                return alt.call(r, dt);
            } finally {
                n.takt--;
                if (WK.some((k) => !Number.isNaN(s[k]))) n.spielerWand++;
                else WK.forEach((k, i) => (s[k] = vor[i]));
            }
        });
        r.setGameMode("pfad");
        const v = s.speed;
        const hang = (x, z) => {
            const h = (dx, dz) => r.getTerrainHeightAt(x + dx, z + dz);
            return (Math.atan(Math.hypot(h(1, 0) - h(-1, 0), h(0, 1) - h(0, -1)) / 2) * 180) / Math.PI;
        };
        const P = pm.clone();
        const [sx, sz] = [
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
        ].find(([a, b]) => [100, 200, 300].every((d) => r._landAt(P.x + a * d, P.z + b * d))) || [0, 0];
        if (!sx) return { fehler: "kein Land auf einer Diagonale bis 300 m" };
        const ziele = [];
        let [wx, wz] = [P.x, P.z];
        for (let i = 0; i < Math.ceil((v * 640) / 60); i++) {
            const [ux, uz] = i % 2 ? [0, sz] : [sx, 0];
            const art = i % 3 === 1 && ["wand", "haus", "sockel", "wand"][H.length];
            if (art) {
                const [mx, mz] = [wx + ux * 30, wz + uz * 30];
                H.push({ art, cx: mx, cz: mz, ux, kontakt: 0, drin: 0, quer: 0, vornMinM: Infinity, seite: 0 });
                if (art !== "sockel")
                    for (const [a, b] of [
                        [-3, 0],
                        [-3, 1],
                        [3, 1],
                        [3, 0],
                    ])
                        ziele.push([mx + ux * a + (ux ? 0 : 5.5) * b, mz + uz * a + (ux ? 5.5 : 0) * b]);
            }
            [wx, wz] = [wx + ux * 60, wz + uz * 60];
            ziele.push([wx, wz]);
        }
        // die Wand ragt überall 2,5 m, das Haus 34° gedreht, der Sockel 0,35 m über dem Boden
        const gebaut = H.map((h, i) => {
            const name = "_t_folgen_" + i;
            const g = (f, q = 0) => r.getTerrainHeightAt(h.cx + (h.ux ? q : 4 * f), h.cz + (h.ux ? 4 * f : q));
            const [lo, hi] = [
                Math.min(...[-1, -0.5, 0, 0.5, 1].map((f) => g(f))) - 0.2,
                Math.max(...[-1, 0, 1].map((f) => g(f))),
            ];
            const size =
                h.art === "sockel"
                    ? { x: 0.1, y: 0.1, z: 0.1 }
                    : { x: h.ux ? 0.8 : 8, y: hi - lo + 2.5, z: h.ux ? 8 : 0.8 };
            s.blueprints[name] = {
                name,
                parts: [{ shape: "box", material: "stein", position: { x: 0, y: size.y / 2, z: 0 }, size }],
            };
            restore.push(() => delete s.blueprints[name]);
            const y = h.art === "wand" ? lo : g(0) + 0.5;
            const e = r.spawnArchitecture(
                name,
                { x: h.cx, y, z: h.cz },
                { silent: true, rotationY: h.art === "haus" ? 0.6 : 0 }
            );
            const unten = Math.min(...[-0.5, 0, 0.5].flatMap((f) => [-2, 0, 2].map((q) => g(f, q)))) - 0.3 - g(0);
            const teil =
                h.art === "haus"
                    ? { c: [0, 0, 0], h: h.ux ? [0.4, 6, 4] : [4, 6, 0.4] }
                    : h.art === "sockel" && { c: [0, (unten + 0.35) / 2, 0], h: [2, (0.35 - unten) / 2, 2] };
            if (e && teil)
                r._hausHuelleSetzen(e, r.constructor._huellePacken({ stufe: 0, teile: [Object.assign({ art: "box", rolle: "fest" }, teil)] }, "probe"));
            const b = e && (e.blockerAABBs || []).find((q) => h.art !== "haus" || q.obb);
            const o = b && rahmen(b);
            Object.assign(h, { box: b, F: o });
            return e;
        });
        restore.push(() => gebaut.forEach((e) => e && r.removeArchitecture(e)));
        if (H.length < 4 || H.some((h) => !h.box))
            return { fehler: "ein Hindernis ohne Hülle (" + H.length + " gebaut)" };
        // steht der Spieler 1 s, lenkt er 1 s 60° zur Seite
        const gehen = (sek, je) => {
            pm.set(P.x, boden(P.x, P.z), P.z);
            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
            const tasten = halt;
            s.verbTafel.gehalten = { vor: true };
            const t0 = (s._simZeit || 0) + 1;
            let [zi, seite, aus, mark] = [0, 1, 0, [pm.x, pm.z]];
            try {
                for (let k = 0; k < sek * 60; k++) {
                    const [zx, zz] = ziele[Math.min(zi, ziele.length - 1)];
                    if (Math.hypot(zx - pm.x, zz - pm.z) < 1.5) zi++;
                    if (k % 60 === 59) {
                        if (!aus && Math.hypot(pm.x - mark[0], pm.z - mark[1]) < 0.3 * v) [aus, seite] = [60, -seite];
                        mark = [pm.x, pm.z];
                    }
                    s.yaw = Math.atan2(zx - pm.x, zz - pm.z) + (aus > 0 ? (seite * Math.PI) / 3 : 0);
                    if (aus > 0) aus--;
                    ruhigSpieler();
                    r._stepFixedSim(t0 + k * dt, dt);
                    r.updateCreatures(dt);
                    je(k);
                }
            } finally {
                s.verbTafel.gehalten = tasten;
            }
        };
        const hirsch = (gebunden) => {
            const [hx, hz] = [P.x - sx * 2.8, P.z - sz * 2.8];
            const c = tier({ x: hx, y: boden(hx, hz), z: hz }, "wesen", 1);
            ruhig(c);
            if (gebunden) r.dslRun(r.parseChatToDsl("folge mir").program, { source: "human" });
            return c;
        };
        const c = hirsch(true);
        if ((c.userData.task || {}).name !== "follow_player") return { fehler: "die Geste „folge mir“ bindet nicht" };
        const bond0 = c.userData.bond;
        const z = { proben: 0, aufgabe: 0, nassS: 0, steilS: 0 };
        const [abstand, leibVon, abstand2] = [[], A.prototype._kreaturLeib, A.prototype._boxAbstand2];
        n.strahlen = 0;
        gehen(600, (k) => {
            const p = c.position;
            const lb = leibVon.call(r, c);
            const [vx, vz] = [p.x + lb.fx * lb.halb, p.z + lb.fz * lb.halb];
            for (const h of H) {
                const [b, F] = [h.box, h.F];
                if (h.art === "sockel") {
                    const stufe = b.topY - r.getTerrainHeightAt(p.x, p.z);
                    if (abstand2.call(r, b, p.x, p.z) === 0 && stufe > 0.05 && stufe < A.PLAYER_STEP_UP) {
                        h.ueber = (h.ueber || 0) + 1;
                        const tief = b.topY - p.y;
                        if (tief > 0.05)
                            [h.imSockel, h.tiefMaxM] = [
                                (h.imSockel || 0) + 1,
                                rund(Math.max(h.tiefMaxM || 0, tief), 3),
                            ];
                    }
                    h.stufeM = rund(b.topY - r.getTerrainHeightAt(h.cx, h.cz), 2);
                    continue;
                }
                const lok = (x, y) => [(x - F.cx) * F.c - (y - F.cz) * F.s, (x - F.cx) * F.s + (y - F.cz) * F.c];
                const [a, q] = lok(p.x, p.z);
                if (Math.abs(a) < F.hx && Math.abs(q) < F.hz) h.drin++;
                const [lang, duenn] = F.hx > F.hz ? [Math.abs(a) < F.hx, q] : [Math.abs(q) < F.hz, a];
                if (h.seite && Math.sign(duenn) && Math.sign(duenn) !== h.seite && lang) h.quer++;
                h.seite = Math.sign(duenn) || h.seite;
                const [va, vq] = lok(vx, vz);
                const [oa, oq] = [Math.max(Math.abs(va) - F.hx, 0), Math.max(Math.abs(vq) - F.hz, 0)];
                const innen = Math.min(F.hx - Math.abs(va), F.hz - Math.abs(vq));
                h.vornMinM = Math.min(h.vornMinM, rund(oa > 0 || oq > 0 ? Math.hypot(oa, oq) : -innen, 3));
            }
            if (k % 60 !== 59) return;
            z.proben++;
            abstand.push(ab(p, pm));
            if ((c.userData.task || {}).name === "follow_player") z.aufgabe++;
            if (r._nassAt(p.x, p.z)) z.nassS++;
            if (hang(p.x, p.z) > 15) z.steilS++;
        });
        Object.assign(z, {
            abstand: {
                p50: rund(quantil(abstand, 0.5), 2),
                p95: rund(quantil(abstand, 0.95), 2),
                max: rund(Math.max(...abstand), 1),
            },
            bindung: [rund(bond0, 2), rund(c.userData.bond, 2)],
            hindernisse: H.map(({ art, kontakt, drin, quer, vornMinM, ueber, imSockel, tiefMaxM, stufeM }) =>
                art === "sockel"
                    ? { art, ueber: ueber || 0, imSockel: imSockel || 0, tiefMaxM: tiefMaxM || 0, stufeM }
                    : { art, kontakt, drin, quer, vornMinM }
            ),
            leibRufe: n.leib,
            strahlenJeTakt: rund(n.strahlen / 36000, 3),
            spielerWand: n.spielerWand,
        });
        r.removeCreature(c);
        const u = hirsch(false);
        gehen(120, () => {});
        z.gegenlauf = { abstandM: rund(ab(u.position, pm), 1) };
        // DER FROHE BEGLEITER (mensch-zahlen, nahrung.tier#1 — der Auftrag trägt den Leib): ein frohes gebundenes Tier (joy 0,9 je
        // Takt) folgt 60 s; in keinem Takt, in dem es für seinen Auftrag unterwegs ist (sein Wunsch `aiDir` ist nicht null), hält
        // es eine Aktion des Gemüts (tempo < 1: Verbeugung, Kreisel). Dann steht der Spieler 30 s: am Ziel spielt es wieder.
        r.removeCreature(u);
        pm.set(P.x, boden(P.x, P.z), P.z); // die Geste bindet das Tier neben dem Spieler
        const f = hirsch(true);
        if ((f.userData.task || {}).name !== "follow_player") return { fehler: "die Geste bindet das frohe Tier nicht" };
        const froh = { unterwegs: 0, gehalten: 0, spiel: 0 };
        const fern = [];
        // ein ruhiges Wesen trägt kein Gemüt (null): die Freude setzt es je Takt neu
        const freude = (ud) => (ud.emotions = Object.assign(ud.emotions || {}, { joy: 0.9 }));
        gehen(60, (k) => {
            const fu = f.userData;
            freude(fu);
            const [w, VA] = [fu.aiDir, fu._verhaltenAktion];
            if (k % 60 === 59) fern.push(ab(f.position, pm));
            if (!(w && w.x * w.x + w.z * w.z > 0)) return;
            froh.unterwegs++;
            if (VA && s.creatureAnimationTime < VA.bis && VA.def.tempo < 1) froh.gehalten++;
        });
        for (let k = 0, vor = null; k < 30 * 60; k++) {
            ruhigSpieler();
            r.updateCreatures(dt);
            freude(f.userData);
            const VA = f.userData._verhaltenAktion;
            if (VA && VA !== vor) froh.spiel++;
            vor = VA;
        }
        z.froh = Object.assign(froh, { abstandP95: rund(quantil(fern, 0.95), 2) });
        r.removeCreature(f);
        return z;
    });
    // ── tagesbudget (Tiere K4, ETHOGRAMM_GESETZ · DURST_GESETZ): je Gattung drei Tiere ohne Verband am Ufer (15–30 m vom Fluss), im
    // frieden (ohne Jagd), der Spieler ruhig 90 m fern. Die Uhr des Spieler-Worts läuft 12 Spielstunden ein und misst 72: je Tier
    // und Takt die Tätigkeit, die es zeigt (Auftrag und Flucht sind wach), sein Lauf in der Ruhe, seine Trünke am Wasser; der
    // Gegenlauf „Durst aus“ (drei Hirsche, 10 Spielstunden). DAS GESETZ IST EIN MITTEL (Pegel- und Magen-Bilanz): bis
    // w27-wagen-spalt-3 maß die Probe 24 Spielstunden, wenige Ruhe-Zyklen — der Hirsch ruhte je nach Ort und Rempelei 0,41–0,44
    // und zog 0,076–0,096 (Soll 0,1 ± 20 %: main an einem zweiten Ufer ROT 0,076, der Kopf im CI 0,079); über 72 Stunden steht er
    // an main bei 0,402 · 0,500 · 0,098, mit der gezeichneten Haut bei 0,403 · 0,494 · 0,104. Woraus das Ziehen des Hirschs
    // besteht (24 h, Kopf): entschieden 0,7 % — der Rest ist der Heimweg jenseits der Leine beim Äsen (6,2 %) und das Trinken ──
    await buehne("tagesbudget", async (restore) => {
        const LG = A._lebensraumGesetz(),
            SW = A._verhaltenGesetz().stimmung.schwellen;
        // die Täter: kein Durst · der Ruhe-Pegel leer · die alte Uhr (Ruhe, solange die Sonne unter nachtSin steht, am Tag weidet,
        // wer weidet) · die Ruhe läuft
        const durstAus = () => decke("_kreaturDurstig", () => () => false);
        if (taeter === "durst") durstAus();
        if (taeter === "tagesbudget-ruhe")
            decke(
                "_kreaturTaetigkeit",
                (alt) =>
                    function (c) {
                        const t = alt.call(this, c);
                        c.userData._ruhe = 0;
                        return t;
                    }
            );
        if (taeter === "tagesbudget-sonne")
            decke(
                "_kreaturTaetigkeit",
                () =>
                    function (c) {
                        c.userData._gezeigt = null;
                        const nacht = this._sonnenRichtung().y < SW.nachtSin;
                        return (c.userData._taetigkeit = nacht
                            ? "ruhen"
                            : this._kreaturDiet(c) <= SW.weideDiet
                              ? "nahrung"
                              : "ziehen");
                    }
            );
        if (taeter === "nacht")
            decke(
                "updateCreatures",
                (alt) =>
                    function (dt) {
                        alt.call(this, dt);
                        for (const c of this.state.creatures) if (c.userData._gezeigt === "ruhen") c.position.x += 0.02;
                    }
            );
        let U = null;
        for (let k = 0; k < 441 && !U; k++) {
            const x = pm.x + ((k % 21) - 10) * 25,
                z = pm.z + (Math.floor(k / 21) - 10) * 25;
            const h = r._hydroDistAt(x, z),
                rand = h.dist - Math.max(1, h.halfW);
            if (rand > 15 && rand < 30 && r._landAt(x, z)) U = { x, z };
        }
        if (!U) throw new Error("kein Fluss im Umkreis von 250 m");
        r.setGameMode("frieden");
        const tag0 = s.timeOfDay;
        restore.push(() => r._uhrSetzen(tag0, "regler"));
        r._uhrSetzen(0.5, "regler");
        const takte = Math.round((0.1 / 24) * (s.dayLengthMinutes || A.DAY_LENGTH_DEFAULT_MINUTES) * 600);
        const z = { budget: {}, soll: {}, ruhe: [0, 0] };
        const amUfer = (seele, i) => ({
            x: U.x + Math.cos(i * 2.1 + seele.length) * 6,
            z: U.z + Math.sin(i * 2.1 + seele.length) * 6,
        });
        const tagLauf = (seelen, ein, mess, z, ort = amUfer) => {
            const tiere = seelen.flatMap((seele) =>
                [0, 1, 2].map((i) => {
                    const { x, z: zz } = ort(seele, i);
                    const c = tier({ x, y: boden(x, zz), z: zz }, seele, 1);
                    ruhig(c);
                    return { c, g: A.TETRAPODA_SOUL_MAP[seele], x, z: zz, ruhK: 0, trunk: 0, nass: 0, spur: [] };
                })
            );
            pm.set(U.x, r.getTerrainHeightAt(U.x, U.z + 90) + 0.5, U.z + 90);
            for (let i = 0; i < (ein + mess) * 10; i++) {
                r._uhrSetzen(((s.timeOfDay * 24 + 0.1) % 24) / 24, "regler");
                for (let k = 0; k < takte; k++) {
                    ruhigSpieler();
                    takt(0.1);
                    // die Lage je Spiel-Minute (der Schritt der Uhr: 0,1 Spielstunde = 6 Minuten in `takte` Takten)
                    const minute = i >= ein * 10 && Math.floor(((k + 1) * 6) / takte) > Math.floor((k * 6) / takte);
                    for (const t of tiere) {
                        if (minute) t.spur.push({ x: t.c.position.x, z: t.c.position.z });
                        const ud = t.c.userData,
                            p = t.c.position;
                        if (t.g0 !== undefined && ud._getrunken !== t.g0)
                            (t.trunk++, (t.nass += r._findNearestWaterPoint(p.x, p.z, 4) ? 1 : 0));
                        t.g0 = ud._getrunken;
                        const kat = (ud.task && ud.task.name === "drink") || !ud._gezeigt ? "ziehen" : ud._gezeigt;
                        t.ruhK = kat === "ruhen" ? t.ruhK + 1 : 0;
                        if (i >= ein * 10) {
                            const B = z.budget[t.g] || (z.budget[t.g] = { ruhen: 0, nahrung: 0, ziehen: 0 });
                            B[kat]++;
                            if (t.ruhK > 20) (z.ruhe[0]++, (z.ruhe[1] += ab(p, t) > 0.01 ? 1 : 0));
                        }
                        [t.x, t.z] = [p.x, p.z];
                    }
                }
            }
            for (const t of tiere) {
                // der Anker und die Leine, wie der Takt sie liest (_creatureCharacterWander: wanderAnchor, leashM)
                const ud = t.c.userData;
                t.anker = ud.wanderAnchor ? { x: ud.wanderAnchor.x, z: ud.wanderAnchor.z } : null;
                t.leineM = r._creatureMoveCharacter(t.c).leashM;
                r.removeCreature(t.c);
            }
            return tiere;
        };
        const tiere = tagLauf(["wesen", "baer", "fuchs", "wolf"], ...(taeter ? [2, 12] : [12, 72]), z);
        for (const g in z.budget) {
            const B = z.budget[g],
                n = B.ruhen + B.nahrung + B.ziehen,
                G = LG.E.gattung[g];
            for (const k in B) B[k] = rund(B[k] / n, 3);
            z.soll[g] = { ruhen: G.ruhen, nahrung: G.nahrung, ziehen: rund(1 - G.ruhen - G.nahrung, 3) };
        }
        z.truenke = tiere.map((t) => t.trunk);
        z.amWasser = tiere.reduce((a, t) => a + t.nass, 0);
        // DIE WANDERUNG (leben.tiere.wanderung S1): je Gattung drei Tiere, geboren, wo die Geburt des Spiels wirft — in ihrem
        // Lebensraum (_bodenKlasseAt × LG.lebensraum > 0), auf trockenem Land, ≥ CREATURE_SPAWN_FAR_MIN vom Spieler, gleichverteilt
        // im Quadrat 400 m um das Ufer (die Folge des goldenen Schnitts: kein Ort ist gewählt, auch der Saum nicht) — über 24
        // Spielstunden nach 2 Einlauf. Je Tier die Aufenthaltsfläche aus seiner Spur, die konvexe Hülle der 95 % ankernächsten Lagen
        // (MCP 95, Hülle und Fläche des Spiels: _convexHull2D, _polygonArea2D), gegen seine Leine, und der Anteil der Lagen in
        // seinem Lebensraum. Die Probe 68f84acf maß am Ufer U und setzte die Tiere an den ufernächsten Ort ihres Lebensraums, den
        // Saum (die halbe Leine draußen, das Wasser jenseits trinkSuchM: Hirsch, Fuchs und Wolf tranken nie) — der Tag am Ufer
        // (Ethogramm, Durst) blieb, wie er war
        if (!taeter) {
            const lebt = (g, x, zz) => LG.lebensraum(g, r._bodenKlasseAt(x, zz), LG.L) > 0;
            const spieler = { x: U.x, z: U.z + 90 };
            const orte = {};
            const imRaum = (seele, i) => {
                const g = A.TETRAPODA_SOUL_MAP[seele];
                const O = orte[g] || (orte[g] = []);
                for (let k = O.k || 0; O.length <= i && k < 20000; k++) {
                    const x = U.x + (((k * 0.6180339887) % 1) - 0.5) * 400,
                        zz = U.z + (((k * 0.7548776662) % 1) - 0.5) * 400;
                    O.k = k + 1;
                    if (Math.hypot(x - spieler.x, zz - spieler.z) < A.CREATURE_SPAWN_FAR_MIN) continue;
                    if (r._landAt(x, zz) && !r._nassAt(x, zz) && lebt(g, x, zz)) O.push({ x, z: zz });
                }
                if (!O[i]) throw new Error("kein Lebensraum der Gattung " + g + " im Quadrat 400 m um das Ufer");
                return O[i];
            };
            z.wander = tagLauf(["wesen", "baer", "fuchs", "wolf"], 2, 24, { budget: {}, ruhe: [0, 0] }, imRaum).map(
                (t) => {
                    const w = {
                        g: t.g,
                        leineM: rund(t.leineM, 2),
                        punkte: t.spur.length,
                        flaecheM2: null,
                        anteil: null,
                    };
                    if (!t.anker || !t.spur.length) return Object.assign(w, { fehler: "kein Anker der Leine" });
                    const nah = t.spur
                        .map((p) => [Math.hypot(p.x - t.anker.x, p.z - t.anker.z), p])
                        .sort((a, b) => a[0] - b[0])
                        .slice(0, Math.ceil(0.95 * t.spur.length))
                        .map((e) => e[1]);
                    w.flaecheM2 = rund(r._polygonArea2D(r._convexHull2D(nah)), 1);
                    w.anteil = rund(t.spur.filter((p) => lebt(t.g, p.x, p.z)).length / t.spur.length, 3);
                    // der Anker gegen das Ufer U (der Ort im Bild der Spur)
                    w.anker = [rund(t.anker.x - U.x, 1), rund(t.anker.z - U.z, 1)];
                    // DIE GETRAGENE SCHEIBE (der Maßstab der Fläche): im Raster zu Leine/10 der Anteil der Leinen-Scheibe um den Anker,
                    // den der Lebensraum auf trockenem Grund trägt (traegt), und davon der vom Anker aus über ihn erreichbare (erreicht:
                    // vier Nachbarn, Wasser trennt): trägt er ≥ 0,5, ist die Fläche ≥ 0,5·π·Leine² dort erreichbar, und ihr Fehlen ist
                    // das Wandern, nicht der Ort (17.11.: getragen 0,64–0,97 je Tier, die Bären 0,74/0,92/0,85)
                    const G = new Map();
                    for (let i = -10; i <= 10; i++)
                        for (let j = -10; j <= 10; j++) {
                            if (i * i + j * j > 100) continue;
                            const [x, zz] = [t.anker.x + (i * t.leineM) / 10, t.anker.z + (j * t.leineM) / 10];
                            G.set(i + "," + j, lebt(t.g, x, zz) && !r._nassAt(x, zz));
                        }
                    const [zu, weg] = [[[0, 0]], new Set(["0,0"])];
                    let n = 0;
                    while (zu.length) {
                        const [i, j] = zu.pop();
                        if (!G.get(i + "," + j)) continue;
                        n++;
                        for (const [a, b] of [
                            [1, 0],
                            [-1, 0],
                            [0, 1],
                            [0, -1],
                        ]) {
                            const k = i + a + "," + (j + b);
                            if (G.has(k) && !weg.has(k)) (weg.add(k), zu.push([i + a, j + b]));
                        }
                    }
                    w.traegt = rund([...G.values()].filter(Boolean).length / G.size, 3);
                    w.erreicht = rund(n / G.size, 3);
                    return w;
                }
            );
        }
        durstAus();
        z.durstAus = tagLauf(["wesen"], 0, 10, { budget: {}, ruhe: [0, 0] }).reduce((a, t) => a + t.trunk, 0);
        return z;
    });
    // ── lebensraum (Tiere K4; die Geburt fern, außer Blick, in Gruppen): an neun Orten (Raster 300 m) je 25 Geburten — je Tier
    // Gattung, Boden-Klasse, Abstand, Blick, der Nächste der Gruppe, je Wurf der Bär am Fluss; die Gegenprobe in anderer Saat ──
    await buehne("lebensraum", async () => {
        if (taeter === "lebensraum")
            decke("_pickFaunaSoulAtPlayer", () => (x, z, rng) => A.CREATURE_SOUL_NAMES[Math.floor(rng() * 4)]);
        if (taeter === "geburt") decke("_bestandLeibOrt", () => () => ({ x: pm.x + 15, z: pm.z }));
        if (taeter === "geburt-einzeln")
            decke(
                "_creatureNaturalBirth",
                (alt) =>
                    (...a) =>
                        alt.apply(r, a).slice(0, 1)
            );
        // der Täter: das Weichen vor w13-kreatur-blick — der Blick am Fuß-Punkt
        if (taeter === "weichen-rand") decke("_bestandAusserBlick", () => (c) => !r._kreaturImBlick(c.position.x, c.position.z)); // prettier-ignore
        const LG = A._lebensraumGesetz();
        const z = { n: 0, drin: 0, gattung: {}, klasse: {}, geburten: 0, gruppen: 0, journal: 0, minM: Infinity };
        Object.assign(z, {
            imBlick: 0,
            fensterMax: 0,
            fernMin: A.CREATURE_SPAWN_FAR_MIN,
            baer: { fluss: [0, 0], sonst: [0, 0] },
        });
        const p0 = pm.clone();
        for (let i = 0; i < (taeter ? 3 : 9); i++) {
            pm.set(p0.x + ((i % 3) - 1) * 300, p0.y, p0.z + (Math.floor(i / 3) - 1) * 300);
            kamera(1, 0);
            for (let k = 0; k < 25; k++) {
                // geboren wird in den Bestand der Region (oekologie.K2#2), gemessen am Leib seiner Zeichnung
                const tiere = r._creatureNaturalBirth();
                const j = s.worldJournal.entries[s.worldJournal.entries.length - 1];
                const neu = tiere.length ? r._bestandLeiber(tiere) : [];
                if (!neu.length) continue;
                z.geburten++;
                if (tiere.length > 1) z.gruppen++;
                if (j && j.type === "growth" && j.ctx && j.ctx.gruppe === tiere.length) z.journal++;
                // DER BÄR AM FLUSS (Staffel 2): je Wurf [Würfe, Bären] an seinem Ort am Fluss und abseits
                const B = z.baer[r._bodenKlasseAt(tiere[0].x, tiere[0].z) === "fluss" ? "fluss" : "sonst"];
                (B[0]++, (B[1] += tiere[0].g === "bear" ? 1 : 0));
                const paar = (2 * r._kreaturRaum(neu[0])) / neu[0].userData.bodySize;
                for (const c of neu) {
                    const g = A.TETRAPODA_SOUL_MAP[c.userData.soul],
                        kl = r._bodenKlasseAt(c.position.x, c.position.z);
                    z.n++;
                    if (LG.lebensraum(g, kl, LG.L) > 0) z.drin++;
                    z.gattung[g] = (z.gattung[g] || 0) + 1;
                    z.klasse[kl] = (z.klasse[kl] || 0) + 1;
                    z.minM = Math.min(z.minM, rund(ab(c.position, pm), 1));
                    if (imBlick(c.position.x, c.position.y + 0.5, c.position.z)) z.imBlick++;
                    const nn = Math.min(...neu.filter((o) => o !== c).map((o) => ab(c.position, o.position) / paar));
                    if (nn < Infinity) z.fensterMax = rund(Math.max(z.fensterMax, nn), 2);
                }
                leer();
            }
        }
        // DER RAND DES BLICKS (das Weichen an der vollen Kappe, `_bestandWeicht`): ein gezeichneter Leib des Bestands allein in
        // der Welt, der Blick so gedreht, dass sein Fuß-Punkt 0,2 m jenseits der Seiten-Ebene steht, sein Leib aber ins Bild ragt
        // — ein Akt an der vollen Kappe nimmt ihm den Platz nicht; die Gegenprobe vom Leib weg: dort weicht er
        pm.copy(p0);
        kamera(1, 0);
        let leib;
        for (let k = 0; k < 25 && !leib; k++) {
            const tiere = r._creatureNaturalBirth();
            leib = tiere.length && r._bestandLeiber(tiere)[0];
        }
        if (leib) {
            for (const c of s.creatures.slice()) if (c !== leib) r.removeCreature(c);
            const [P, cam, kappe] = [leib.position, s.camera, s.maxCreatures];
            const a = Math.atan2(P.z - pm.z, P.x - pm.x);
            // der Blick um `w` neben dem Leib, ein Akt an der vollen Kappe (der Gerufene steht im Nah-Kreis: er hält)
            const akt = (w) => {
                kamera(Math.cos(a + w), Math.sin(a + w));
                const [punktImBlick, leibAusser] = [r._kreaturImBlick(P.x, P.z), r._kreaturAusserBlick(leib, r._frustumCache, r._kreaturBlickRand())]; // prettier-ignore
                s.maxCreatures = s.creatures.length;
                r.spawnCreatureAt(pm.x + 3, pm.y, pm.z, "happy", "wesen", { precise: true });
                s.maxCreatures = kappe;
                return { punktImBlick, leibAusser, wich: !s.creatures.includes(leib) };
            };
            z.rand = akt(Math.atan(Math.tan((cam.fov * Math.PI) / 360) * cam.aspect) + 0.2 / ab(P, pm));
            z.rand.fernWich = z.rand.wich ? null : akt(Math.PI).wich;
            leer();
        }
        return Object.assign(z, {
            anteil: z.n ? rund(z.drin / z.n, 3) : null,
            saat: s.worldMeta.seed,
            fensterRaum: A._verhaltenGesetz().herde.fensterRaum,
        });
    });
    // ── zielplan (mensch Breite: „Bewohner folgen Tagesplänen mit Zielen — Arbeit, Markt, Hafen, Heimweg —, je Ziel ein Ort“):
    // die Stadt am Messort (`--ort stadt-voll`: die Metropole; sonst stadt), ein Tag an fünf Stunden (6 · 10 · 13 · 18 · 23 Uhr:
    // der Sprung der Uhr stellt jeden, wo sein Tag ihn sieht, dann 5 s Takt mit der Uhr des Spiels). DER RICHTER LIEST DEN PLAN,
    // nie die Liste des Wirts: die Orte sind die Türen der Slots mit ihrer Rolle, der Platz und die Äcker; das Ziel jedes
    // Bewohners (der Punkt, auf den er geht oder an dem er steht) fällt in den Ort, in dem es liegt. Es PASST zur Stunde: nachts
    // das eigene Haus (drinnen) oder ein Haus mit Rolle (die Nachtschicht), zur Arbeit ein Werk-Ort — der Platz, ein Acker, ein
    // Haus mit Rolle (wer in einem Haus mit Rolle wohnt: ein Haus SEINER Rolle), am Steuer der Wagen —, mittags ein Werk-Ort
    // oder der eigene Tisch (drinnen), abends jeder Ort. Gezählt je Stunde: am passenden Ort angekommen (≤ 1,5 m, drinnen an
    // der Tür) · unterwegs zu ihm (sein Rest-Weg schrumpft) · OHNE ZIEL (sein Ziel passt nicht, oder er kommt nicht voran); über
    // den Tag die Ziel-Orte, die ein Fremder erreichte (nicht sein eigenes Haus), je Rolle des Plans. ──
    await buehne("zielplan", async (restore) => {
        dorf.hier = true; // eine eigene Stadt am Messort, nie das Start-Dorf
        const G = await stadtAm((opts && opts.ort) || "stadt", "zielplan");
        if (G.fehler) return G;
        const { S, da, nH } = G;
        const [plan, tagS, q3] = [S.plan, s.dayLengthMinutes * 60, (v) => Math.round(v * 1000) / 1000];
        const rolleVon = (sl) => (typeof sl.rolle === "string" ? sl.rolle : "wohnhaus");
        const tueren = plan.slots.map((sl, si) => {
            const [c, sn, t] = [Math.cos(sl.phi || 0), Math.sin(sl.phi || 0), sl.tuer || { x: 0, z: 0 }];
            // der Eingang (fachwerk `eingangVon`, die EINE Regel, die auch der Wirt fährt): beim Hof-Haus das Tor vor dem Hof — dort liegt
            // die Mitte des Rings (`ringStand`), an ihr misst die Schranke `ringM`; bis w28-bau-rezept maß sie an der Tür, 5–9 m dahinter
            const e = sl.tuer && window.__fachwerkCore.eingangVon(sl), ez = e && e.hof ? e.z : t.z; // prettier-ignore
            return { x: S.ox + sl.x + t.x * c + t.z * sn, z: S.oz + sl.z - t.x * sn + t.z * c, ein: { x: S.ox + sl.x + t.x * c + ez * sn, z: S.oz + sl.z - t.x * sn + ez * c }, rolle: rolleVon(sl), k: "haus#" + (sl.seed >>> 0), si, mitte: { x: S.ox + sl.x, z: S.oz + sl.z } }; // prettier-ignore
        });
        const heimVon = new Map(tueren.map((t) => [t.k, t]));
        // im gedrehten Rechteck q (Mitte, Halbachsen, phi) samt Rand — der Platz dreht wie der Wirt ihn liest, der Acker längs phi
        const im = (q, x, z, rand, acker) => {
            const [c, sn, dx, dz] = [Math.cos(q.phi || 0), Math.sin(q.phi || 0), x - S.ox - q.cx, z - S.oz - q.cz];
            const [lx, lz] = acker ? [dx * c + dz * sn, dz * c - dx * sn] : [dx * c - dz * sn, dx * sn + dz * c];
            return Math.hypot(Math.max(0, Math.abs(lx) - q.ex), Math.max(0, Math.abs(lz) - q.ez)) <= rand;
        };
        const pz = plan.platz && Number.isFinite(plan.platz.cx) ? plan.platz : null;
        const aecker = (plan.felder || []).filter((f) => f && Number.isFinite(f.cx) && Number.isFinite(f.ex));
        // DER ORT EINES PUNKTS: der Kern des Platzes oder eines Ackers; der Ring der Stände vor der eigenen Tür oder der eines
        // Hauses mit Rolle (die nähere, bis 20 m); der Rand des Platzes (`platzRandM`); der Ring vor dem nächsten Wohnhaus (bis
        // 16 m); der Rand eines Ackers — sonst keiner
        const ortVon = (p, heim) => {
            const platz = (rand) => (pz && im(pz, p.x, p.z, rand) ? { k: "platz", rolle: "platz" } : null);
            const tuer = (wahl, bis) => {
                let [t, d] = [null, bis];
                for (const q of tueren) if (wahl(q) && ab(p, q) < d) [t, d] = [q, ab(p, q)];
                return t && { k: t.k, rolle: t.rolle, haus: true };
            };
            const feld = (rand, f = aecker.findIndex((q) => im(q, p.x, p.z, rand, true))) =>
                f >= 0 ? { k: "feld#" + f, rolle: "feld" } : null;
            return (
                platz(0) ||
                feld(0) ||
                tuer((q) => q.k === heim || q.rolle !== "wohnhaus", 20) ||
                platz(A.BEWOHNER.platzRandM + 2) ||
                tuer(() => true, 16) ||
                feld(1)
            );
        };
        // (der Fahrer: sein Werk ist sein Wagen — am Steuer oder am Stand neben ihm; der Frühaufsteher geht schon über den Platz)
        // DIE STUNDE DES MENSCHEN (koerper TAGES_GESETZ): die Nachtschicht lebt den Tag um `versatzH` versetzt — ihre Stunde ist die
        // Uhr minus den Versatz, ihr Urteil das der Stunde, in die sie fällt: der Morgen bis nach dem Gang über den Platz, das Werk
        // bis zum Mittag, das Mittag samt Streuung, dann der Abend. DIE NACHT urteilt nur über den, den der Kern schlafen legt (sein
        // Plan zur Uhr, `tagesPlan`: die Ruhe seiner Rolle, seine Streuung, der gesellige Abend seines Zugs) — wer noch wach ist, lebt
        // seinen Abend. Bis hier las die Probe eine Tafel (10 → 23 Uhr) und die Stunde ohne die Wenden des Menschen: der
        // Nachtwächter um 10 Uhr (sein Tag 22 Uhr, im Akt des Abends vor seiner Tür) und um 23 Uhr drei, deren Zug später ruht,
        // zählten ohne Ziel (Stadt 10 Uhr 1, 23 Uhr 4 von 145, a62d5eeb; 23 Uhr ebenso am Kopf 3c9bed7f)
        const TG = window.__koerperCore.TAGES_GESETZ;
        const stundeVon = (uhr, b) => {
            const hs = (((uhr - ((TG.rollen[b.rolle] || {}).versatzH || 0)) % 24) + 24) % 24;
            if (hs >= TG.ruhe - TG.streuH || hs < TG.wach + TG.streuH)
                return window.__koerperCore.tagesPlan(b.same, b.rolle, s.timeOfDay * 24, b.orte, 0, b.krank).akt === "schlaf" ? 23 : 18; // prettier-ignore
            return hs < TG.wach + TG.streuH + TG.morgenPlatzH ? 6 : hs < TG.mittag[0] ? 10 : hs <= TG.mittag[1] + TG.streuH ? 13 : 18; // prettier-ignore
        };
        const passt = (o, uhr, b, drinnen) => {
            const h = stundeVon(uhr, b);
            const [eigen, hr] = [
                !!o && o.k === "haus#" + b.heim,
                (heimVon.get("haus#" + b.heim) || {}).rolle || "wohnhaus",
            ];
            const wagen = !!b.amSteuer || (!!b.wagen && !o);
            // DER KRANKE IST DAHEIM (mensch.menge.seuche#1): sein Lebenslauf (`b.krank`, am Tag der Prozesse) setzt ihn zu jeder
            // Stunde vor seine Tür oder hinein — sein Ort ist sein Haus; der Posten hält seine Schicht und misst wie jeder. Bis
            // bewohner-satz las die Probe den Satz nicht: die Kranken des Tags zählten ohne Ziel (Stadt 10 Uhr 3 von 145, 3c9bed7f)
            if (b.krank && eigen) return true;
            const werk = wagen || (!!o && o.rolle !== "wohnhaus" && (hr === "wohnhaus" || !o.haus || o.rolle === hr));
            if (h === 6 || h === 23) return (eigen && drinnen) || wagen || (!!o && o.rolle !== "wohnhaus");
            return h === 10 ? werk : h === 13 ? werk || (eigen && drinnen) : !!o || wagen;
        };
        // Täter (Selbsttest): keiner trägt einen Plan — jeder steht den ganzen Tag vor seiner Tür · jeder Plan nennt den Platz
        if (taeter === "zielplan-planlos") decke("_bewohnerSoll", () => (b) => ({ ziel: b.orte.heim, drinnen: false, akt: "ohne" })); // prettier-ignore
        if (taeter === "zielplan-einort")
            decke("_bewohnerSoll", (alt) => (b, h) => {
                const z = alt.call(r, b, h);
                return z.drinnen ? z : { ziel: b.orte.platz || b.orte.heim, drinnen: false, akt: z.akt };
            });
        // DER ORT EINES STANDS VOR EINER TÜR IST DIE TÜR, FÜR DIE DER WIRT IHN LEGTE (w28-stadt-grammatik): der Stand trägt sie
        // (`anker`, `_bewohnerListe` ringStand; ihr Leser im Spiel: die Seite der Fahrbahn, `_bewohnerStandPruefen`). Bis hier riet
        // die Probe die NÄCHSTE Tür (`ortVon`: die eigene oder ein Haus mit Rolle bis 20 m) — im lockeren Dorf trifft das, in der
        // geschlossenen Stadt nicht: sieben Leute der Burg #304883 an ihrem Werk (4–12 m vor der eigenen Tür) zählten als „an der
        // Kapelle #899220" (2,4–4,7 m), der Wirt des Gasthauses #846868 (sein Stand 21,9 m vor seiner Tür) als „am Wohnhaus
        // #91693", der Fahrer neben seinem Wagen als „am Wohnhaus 15 m daneben" — 26 von 30 „ohne Ziel" standen an ihrem
        // gebundenen Ort (10 Uhr 11 %, 13 Uhr 11 %; mit der Marke 2 % · 2 %). Die Geometrie bleibt die SCHRANKE der Marke: der
        // Ursprung des Stands liegt im Ring des Wirts um seine Tür (BEWOHNER.ring — dieselbe Tafel, die `ringStand` fährt), sonst
        // „fern von seiner Tür" (Täter zielplan-fremd); jedes Ziel ohne Marke (der Platz, der Acker, die Tür selbst) liest `ortVon`.
        const RG = A.BEWOHNER.ring;
        const ringM = Math.hypot(
            RG.vor0M + (RG.alle / RG.jeStufe - 1) * RG.stufeM + RG.streuM,
            RG.quer0M + RG.alle / RG.jeStufe - 1
        );
        const standVon = (b, ziel) => Object.values(b.orte).find((q) => q && q.anker && ab(q, ziel) < 0.05);
        // DER ORT EINES STANDS AM PLATZ IST DER PLATZ (bewohner-satz): der Stand, den der Wirt dem Platz gibt (`platzStand`), trägt
        // dessen Mitte als Marke (`anker`); die Schranke ist sein Rand (`platzRandM` + 2 m, wie `ortVon`), jenseits steht er „fern
        // von seiner Marke" (Täter zielplan-platzfern). Bis hier las die Probe nur die Marke der Tür: der Stand am Rand des Platzes
        // zählte als „an der Kirche" (die nächste Tür mit Rolle bis 20 m) — Stadt 10 Uhr 1 von 145 (3c9bed7f), mit dem eigenen
        // Stand des Spiels jedes Kinds 6 von 145
        const mitte = pz && { x: S.ox + pz.cx, z: S.oz + pz.cz };
        const platzRandM = A.BEWOHNER.platzRandM + 2;
        const vomPlatz = (p) => {
            const [c, sn, dx, dz] = [Math.cos(pz.phi || 0), Math.sin(pz.phi || 0), p.x - mitte.x, p.z - mitte.z];
            return Math.hypot(Math.max(0, Math.abs(dx * c - dz * sn) - pz.ex), Math.max(0, Math.abs(dx * sn + dz * c) - pz.ez));
        };
        // DER STAND HINTER SEINER SCHRANKE (die Täter platzfern · torfern): der Stand st steht mit seinem Ursprung (`ur`) auf dem
        // ersten Punkt jenseits von R0 um `von`, den der Wirt dort trägt (keine Wand, keine Spur: sonst geht der Mensch ohne ihn,
        // `_bewohnerOhneStand`, und der Täter fiele an der Wache des Wirts statt an der Linse)
        const hinaus = (st, von, R0) => {
            const frei = (p) => !r._bewohnerWand(p, p, true, A.BEWOHNER.standRandM) && !(S.verkehr && r._verkehrAufSpur(S, p.x, p.z)); // prettier-ignore
            let p = null;
            for (let d = 8; !p && d <= 48; d += 4)
                for (let i = 0; !p && i < 16; i++) {
                    const q = { x: von.x + Math.cos((i * Math.PI) / 8) * (R0 + d), z: von.z + Math.sin((i * Math.PI) / 8) * (R0 + d) }; // prettier-ignore
                    if (frei(q)) p = q;
                }
            const alt = { x: st.x, z: st.z, ur: st.ur && { x: st.ur.x, z: st.ur.z } };
            Object.assign(st, { x: p.x, z: p.z });
            if (st.ur) Object.assign(st.ur, { x: p.x, z: p.z });
            restore.push(() => (Object.assign(st, { x: alt.x, z: alt.z }), alt.ur && Object.assign(st.ur, alt.ur)));
        };
        // der erste Stand eines Werks, dessen Marke `marke` trifft — eines Gesunden (der Kranke geht nicht an sein Werk)
        const werkStand = (marke) => S.liste.map((b) => !b.krank && b.orte.werk).find((q) => q && q.anker && marke(q.anker)); // prettier-ignore
        // Täter (Selbsttest): der erste Stand am Platz, der dem Werk eines Gesunden gehört, steht jenseits des Rands
        if (taeter === "zielplan-platzfern")
            hinaus(werkStand((a) => mitte && ab(a, mitte) < 0.05), mitte, Math.hypot(pz.ex, pz.ez) + platzRandM);
        // DER POSTEN AM TOR IST EIN ORT DES WERKS (mensch.macht.recht#1, bewohner-satz): der Plan nennt die Tore (`plan.mauer.gates`),
        // der Posten liegt `torInnenM` innerhalb (LEBENSLAUF.wache), der Stand der Wache trägt ihn als Marke (`anker`, `postenStand`);
        // die Schranke ist der Ring des Wirts um ihn (LEBENSLAUF.wache.ring), jenseits steht er „fern von seiner Marke" (Täter
        // zielplan-torfern). Bis hier kannte die Probe kein Tor: der Wächter am Posten zählte als „an seinem eigenen Wohnhaus"
        // (die nächste Tür bis 20 m) und um 10 und 13 Uhr ohne Ziel (Stadt je 1 von 145, a62d5eeb)
        const WL = A.LEBENSLAUF.wache;
        const tore = ((plan.mauer && plan.mauer.gates) || []).flatMap((t, i) => {
            const R = plan.mauer.R || 0;
            const [gx, gz] = Number.isFinite(t.x) ? [t.x, t.z] : [Math.cos(t.th) * R, Math.sin(t.th) * R];
            const l = Math.hypot(gx, gz);
            return l > WL.torInnenM ? [{ x: S.ox + gx * (1 - WL.torInnenM / l), z: S.oz + gz * (1 - WL.torInnenM / l), k: "tor#" + i }] : []; // prettier-ignore
        });
        const torVon = (a) => tore.find((t) => ab(a, t) < 0.05);
        const torRingM = WL.ring.r0M + (WL.ring.alle / WL.ring.jeStufe - 1) * WL.ring.stufeM;
        // Täter (Selbsttest): der erste Stand am Posten eines Tors steht jenseits seines Rings
        if (taeter === "zielplan-torfern") {
            const st = werkStand(torVon);
            hinaus(st, st.anker, torRingM);
        }
        // Täter (Selbsttest): die Marke eines Werk-Stands nennt die fernste Tür der Stadt, er steht, wo er stand
        if (taeter === "zielplan-fremd") {
            const st = S.liste.map((b) => b.orte.werk).find((q) => q && q.anker);
            const [alt, f] = [st.anker, tueren.reduce((m, q) => (ab(q, st) > ab(m, st) ? q : m))];
            st.anker = { x: f.x, z: f.z };
            restore.push(() => (st.anker = alt));
        }
        const [rollen, bruch] = [{}, []];
        // die lauten Brüche der Bewohner im Tag (kein Weg, kein Ort): je Text einmal
        decke(
            "_bruchMelden",
            (alt) => (t) => (/^BEWOHNER/.test(t) && !bruch.includes(t) && bruch.push(t), alt.call(r, t))
        );
        // DIE ROLLEN AUS DEN STEHENDEN HÄUSERN GEGEN DEN PLAN (w28-stadt-grammatik): ein Los, das der Plan trägt und dessen Haus
        // nicht steht, hat keine Tür — niemand wohnt dort, niemand bindet sich an sie (`_bewohnerListe` nimmt nur stehende Häuser).
        // Bis hier zählte die Probe die Rollen aus `plan.slots`: an der Stadt „dorf 7 30" fielen Bergfried #771582 und Kapelle
        // #899220 an der Bau-Wand (ihre Lose überdecken das Torhaus um 0,21 m, ein Wohnhaus um 0,39 m), die Probe meldete „kein
        // Fremder erreicht den Bergfried". Jetzt nennt sie die Lücke: das Los, seine Rolle und die Wand des Wirts
        // (`plan.gefallen`, `_spawnSettlementSlot`); ein Los, das ohne Namen fehlt, fiel still.
        const hausAn = (q) => s.architectures.some((e) => /^haus_/.test(e.type || "") && (e.seed >>> 0) === +q.k.slice(5) && ab(e.position, q.mitte) < 2); // prettier-ignore
        // Täter (Selbsttest): ein Haus mit Rolle fällt nach dem Bau, keine Zeile nennt es
        if (taeter === "zielplan-los") {
            const q = tueren.find((d) => d.rolle !== "wohnhaus");
            const e = s.architectures.find((x) => /^haus_/.test(x.type || "") && (x.seed >>> 0) === +q.k.slice(5) && ab(x.position, q.mitte) < 2); // prettier-ignore
            r.removeArchitecture(e);
        }
        const fehlt = tueren
            .filter((q) => !hausAn(q))
            .map((q) => {
                const g = (plan.gefallen || []).find((x) => x.si === q.si);
                return `Los ${q.si} ${q.rolle} #${q.k.slice(5)} steht nicht: ${g ? g.wand : "fiel still"}`;
            });
        for (const t of tueren)
            if (t.rolle !== "wohnhaus" && hausAn(t)) rollen[t.rolle] = [0, (rollen[t.rolle] || [0, 0])[1] + 1];
        const liste = () => S.liste.filter((b) => b.leib);
        // DER TAG IST EIN TEIL (Kreatur-Takt 22.11.): fünf Stunden zu 300 Takten — die Täter des Plans (das Los, die Wand) lesen
        // ihn nicht und nehmen den Tag des Grund-Laufs
        const tag = await teil("tag", async () => {
        const [je, fremd, fern] = [{}, new Map(), []];
        for (const h of [6, 10, 13, 18, 23]) {
            await uhrAuf(h, `zielplan: ${h} Uhr`, da, 4 * nH);
            const rest0 = new Map(liste().map((b) => [b, b.weg ? b.wegRest : null]));
            for (let k = 0; k < 300; k++) (r._uhrSetzen((s.timeOfDay + 1 / 60 / tagS) % 1, "uhr"), leute(1 / 60));
            const z = { am: 0, unterwegs: 0, ohne: 0, n: 0, wer: [] };
            for (const b of liste()) {
                const ziel = b.ziel || b.leib.position;
                const drinnen = !!b.drinnenSoll;
                const st = standVon(b, ziel);
                const tuer = st && tueren.find((q) => ab(q, st.anker) < 0.05);
                const fernM = tuer ? ab(st.ur || st, tuer.ein) : 0;
                if (fernM > ringM && !fern.some((f) => f.st === st)) fern.push({ st, text: `${wer(b)}: ${q3(fernM)} m von ${tuer.k}` }); // prettier-ignore
                const amPlatz = !tuer && !!st && !!mitte && ab(st.anker, mitte) < 0.05;
                const platzM = amPlatz ? vomPlatz(st.ur || st) : 0;
                if (platzM > platzRandM && !fern.some((f) => f.st === st)) fern.push({ st, text: `${wer(b)}: ${q3(platzM)} m vom Platz` }); // prettier-ignore
                const tor = !tuer && !amPlatz && !!st && torVon(st.anker);
                const torM = tor ? ab(st.ur || st, st.anker) : 0;
                if (torM > torRingM + 0.05 && !fern.some((f) => f.st === st)) fern.push({ st, text: `${wer(b)}: ${q3(torM)} m vom Posten an ${tor.k}` }); // prettier-ignore
                // (der Stand neben dem eigenen Wagen ist der Ort des Fahrers, `_verkehrAnlegen` — kein Haus daneben; am Steuer
                // ist es der Wagen selbst, `_bewohnerSoll`: kein Haus, an dem er vorbeifährt)
                const o = tuer
                    ? { k: tuer.k, rolle: tuer.rolle, haus: true }
                    : amPlatz
                      ? platzM <= platzRandM
                          ? { k: "platz", rolle: "platz" }
                          : null
                      : tor
                        ? torM <= torRingM + 0.05
                            ? { k: tor.k, rolle: "tor" }
                            : null
                        : b.wagen && (ziel === b.orte.werk || ziel === (b.wagen.entry && b.wagen.entry.position))
                        ? null
                        : ortVon(ziel, "haus#" + b.heim);
                const dort = b.amSteuer || (drinnen ? !!b.drinnen : !b.weg && ab(b.leib.position, ziel) < 1.5);
                // voran: wer geht, dessen Rest-Weg schrumpfte in den 5 s (oder er ging eben los, wartet in der Tür)
                const voran = !!b.weg && (rest0.get(b) == null || b.wegRest < rest0.get(b) - 0.5 || b.hinaus);
                z.n++;
                if (!passt(o, h, b, drinnen) || !(dort || voran || b.hinaus)) {
                    z.ohne++;
                    if (z.wer.length < 3) z.wer.push(`${wer(b)} → ${o ? o.k : "kein Ort"}${dort ? "" : voran ? " (geht)" : " (steht fern)"}`); // prettier-ignore
                } else if (dort) z.am++;
                else z.unterwegs++;
                // der Ziel-Ort, den ein Fremder erreichte: ein Werk-Ort (kein Wohnhaus), nicht sein eigenes Haus
                if (dort && o && o.rolle !== "wohnhaus" && o.k !== "haus#" + b.heim && passt(o, h, b, drinnen))
                    fremd.set(o.k, o.rolle);
            }
            je[h] = { am: q3(z.am / z.n), unterwegs: q3(z.unterwegs / z.n), ohne: q3(z.ohne / z.n), wer: z.wer };
        }
        return { je, fremd: [...fremd], fern: fern.map((f) => f.text) };
        });
        const [je, fremd, fern] = [tag.je, new Map(tag.fremd), tag.fern];
        // DER STAND HÄNGT NAHE SEINER TÜR AM NETZ (pendler-anschluss): wer zu einem Stand vor einer Tür geht, geht über das
        // Wege-Netz des Orts an seinen Anschluss (`_bewohnerAnschluss`: der erste der `anschlussN` nächsten Knoten, frei in
        // gerader Linie) — der Ursprung jedes Stands erreicht den Punkt vor seiner Tür über das Netz (der kürzeste Weg, hier
        // eigens gerechnet) höchstens auf JENSEITS.umweg × der Luftlinie + JENSEITS.nahtM. Bis hier fragte der Wirt nur,
        // OB ein Knoten frei liegt: an stadt-voll hingen 21 Stände der Werkstatt an der Kante der Klippe (die Tür auf der
        // Terrasse) an Knoten an ihrem Fuß, 17–28 m vor der Tür, 630–730 m über das Netz — 21 ihrer Leute kamen um 10 Uhr
        // nicht an; an der Stadt (`dorf 7 120`) lagen 231 von 1 902 Ständen jenseits (mit der Frage 0 von 1 834; der Punkt vor
        // der Tür wie der Wirt ihn fragt — an der Tür selbst gemessen nannte die Probe 18 Ecken falsch). GERICHTET werden beide
        // Listen des Wirts: die in DIESER Welt trocken neu gestellte (`_bewohnerListe`, dieselbe Funktion wie nach der
        // Abwesenheit) und die der Stadt nach dem Tag (`jenseitsLeben`). Solange eine Tür, die keinen Knoten sah, ihre Stände
        // ungefragt nahm, lagen nach dem Tag an der Stadt (dorf 7 30) 2 von 555 jenseits (beide an haus#134516, 16,7 m Luft,
        // 182 m über das Netz); seit die Tür zur Seite tritt (stamm `amTuer`) 0 von 562. Täter (Selbsttest): der Stand fragt das
        // Netz nicht (tetrapoda `wegLaengen` trägt 0).
        const JENSEITS = { umweg: 2, nahtM: 25 };
        // Der Täter greift am Chokepoint der Längen (netz-index: der lebende Grund merkt sie, `G.laengen`, `_bewohnerAnTuer`):
        // sein Trocken-Lauf rechnet an einem Grund OHNE Gemerktes und gibt ihm danach seine Längen zurück — sonst träfe die
        // Null-Tafel den gemerkten Wert nie, und der Täter wirkte nicht
        const trocken = (mut) => {
            const TC0 = globalThis.__tetrapodaCore;
            const G = S.netzGrund;
            const LL0 = G && G.laengen;
            if (mut) globalThis.__tetrapodaCore = Object.assign(Object.create(TC0), { wegLaengen: (n) => new Float64Array(n) }); // prettier-ignore
            if (mut && G) G.laengen = new Map();
            try {
                const it = r._bewohnerListe(S);
                let w;
                while (!(w = it.next()).done);
                return w.value || [];
            } finally {
                globalThis.__tetrapodaCore = TC0;
                if (mut && G) G.laengen = LL0;
                // ein Grund, den erst der Trocken-Lauf legte, vergisst die Null-Längen des Täters
                if (mut && S.netzGrund && S.netzGrund !== G) S.netzGrund.laengen = null;
            }
        };
        const standListe = trocken(taeter === "zielplan-jenseits");
        const jenseitsVon = (standListe) => {
            const G = S.netzGrund, K = G.knoten, n = K.length, LW = new Map(), vorM = A.BEWOHNER.vorM;
            // der kürzeste Weg von a zu jedem Knoten über die Kanten des Grunds (kanten[i] = [j, Länge, …])
            const laengen = (a) => {
                const [D, H] = [new Float64Array(n).fill(Infinity), [[0, a]]];
                D[a] = 0;
                while (H.length) {
                    const [d, i] = H[0];
                    const l = H.pop();
                    for (let p = 0; H.length; ) {
                        const c = 2 * p + 1, m = c + 1 < H.length && H[c + 1][0] < (H[c] || l)[0] ? c + 1 : c; // prettier-ignore
                        if (c >= H.length || H[m][0] >= l[0]) {
                            H[p] = l;
                            break;
                        }
                        [H[p], p] = [H[m], m];
                    }
                    if (d > D[i]) continue;
                    const E = G.kanten[i] || [];
                    for (let k = 0; k < E.length; k += 2) {
                        const [j, dj] = [E[k], d + E[k + 1]];
                        if (!(dj < D[j])) continue;
                        D[j] = dj;
                        H.push([dj, j]);
                        for (let p = H.length - 1, q; p && H[(q = (p - 1) >> 1)][0] > dj; p = q) [H[p], H[q]] = [H[q], H[p]];
                    }
                }
                return D;
            };
            const amNetz = (p) => {
                const nah = K.map((k, i) => [(k.x - p.x) ** 2 + (k.z - p.z) ** 2, i]).sort((u, v) => u[0] - v[0] || u[1] - v[1]);
                const c = nah.slice(0, A.BEWOHNER.anschlussN).find(([, i]) => !r._bewohnerWand(p, K[i]));
                return c ? c[1] : -1;
            };
            // der Punkt vor jeder Tür (der Eingang, `vorM` aus dem Haus — der Ort, über den jeder Weg hinein und hinaus geht)
            const vor = new Map();
            for (const t of tueren) {
                const sl = plan.slots[t.si], m = sl.obb ? { x: S.ox + sl.obb.cx, z: S.oz + sl.obb.cz } : t.mitte; // prettier-ignore
                const [ul, hof] = [ab(t, m) || 1, t.ein.x !== t.x || t.ein.z !== t.z];
                const u = hof ? { x: -Math.sin(sl.phi || 0), z: -Math.cos(sl.phi || 0) } : { x: (t.x - m.x) / ul, z: (t.z - m.z) / ul }; // prettier-ignore
                vor.set(t, { x: t.ein.x + u.x * vorM, z: t.ein.z + u.z * vorM });
            }
            const [aus, an] = [[], new Map()];
            let N = 0;
            for (const b of standListe)
                for (const q of Object.values(b.orte)) {
                    const t = q && q.anker && tueren.find((d) => ab(d, q.anker) < 0.05);
                    if (!t) continue;
                    // (der Ort, an dem er steht und zu dem man geht — nach dem Tag auch der gerückte; die Liste neu gestellt steht am
                    // Ursprung. Bis hier richtete die Linse den verlassenen Ursprung: an der Stadt dorf 7 30 rückten nach den Proben
                    // davor zwei Stände an haus#134516 fort, weil eine Hülle ihren Ursprung vom Netz schnitt — die Linse nannte den Ursprung)
                    const [v, p] = [vor.get(t), q];
                    if (!an.has(t)) an.set(t, amNetz(v));
                    const [a, e] = [an.get(t), amNetz(p)];
                    if (a < 0 || e < 0) continue; // ohne Anschluss: die Probe der Wege nennt ihn (`kein Weg`)
                    N++;
                    if (!LW.has(a)) LW.set(a, laengen(a));
                    const [weg, luft] = [ab(v, K[a]) + LW.get(a)[e] + ab(p, K[e]), ab(v, p)];
                    if (weg > JENSEITS.umweg * luft + JENSEITS.nahtM) aus.push(`${wer(b)} an ${t.k}: ${q3(luft)} m Luft, ${Math.round(weg)} m über das Netz, die Tür am Netz: ${q.tuerVor ? ((ta) => (ta ? "Knoten " + ta.i : "keiner"))(r._bewohnerTuerAm(G, q.tuerVor)) : "-"}${q.ur && (q.x !== q.ur.x || q.z !== q.ur.z) ? ", gerückt" : ""}`); // prettier-ignore
                }
            return { N, n: aus.length, erste: aus.slice(0, 3) };
        };
        const [jenseits, jenseitsLeben] = [jenseitsVon(standListe), jenseitsVon(S.liste)];
        for (const ro of fremd.values()) if (rollen[ro]) rollen[ro][0]++;
        // je Rolle: so viele Fremde tragen einen Stand vor einer ihrer Türen (die Bindung des Wirts) — „keiner kommt an" und
        // „keiner ist gebunden" sind zwei Täter
        const gebunden = {};
        for (const b of S.liste)
            for (const tk of new Set(
                Object.values(b.orte)
                    .map((q) => q && q.anker && tueren.find((d) => ab(d, q.anker) < 0.05))
                    .filter(Boolean)
            ))
                // prettier-ignore
                if (tk.rolle !== "wohnhaus" && tk.k !== "haus#" + b.heim) gebunden[tk.rolle] = (gebunden[tk.rolle] || 0) + 1;
        for (const ro in rollen) rollen[ro][2] = gebunden[ro] || 0;
        // DAS GESETZ DER BINDUNG JE ROLLE (Welle SAMEN): wie oft lässt das Gesetz eine Rolle ohne Fremden? Die Wahl ist ein Wurf
        // (tetrapoda `zielWahl`: Güte × Nähe, die Menge aus dem Samen — je Ort mit dem Anteil seines Nutzens), die Nähe fällt mit
        // 0,5^((d / wegM)²): die EINE Scheune der Stadt am Würfel je Los, 95 m vom Herd ihrer Leute (arbeit 2 gegen den Markt 5),
        // zog keinen — am alten Wurf zog eine von zwei Scheunen genau einen. Die Probe fragt den Kern selbst (`tagesBindung`, je
        // Mensch `GESETZ_PROBEN` Samen) und fordert den Fremden nur, wo das Gesetz die Leere unwahrscheinlich macht (`GESETZ_LEER`):
        // die Rolle, die der Wurf leer lassen darf, nennt sie mit ihrer Wahrscheinlichkeit, nie still.
        const [KC, TC, GESETZ_PROBEN] = [window.__koerperCore, globalThis.__tetrapodaCore, 200];
        const orteK = KC.tagesOrte(plan, (si) => tueren.some((t) => t.si === si && hausAn(t)));
        const siVon = new Map(tueren.map((t) => [t.k, t.si]));
        // die Nähe der Wahl ist der Weg, wie der Wirt ihn misst (koerper `tagesWege` über das Netz des Orts, pendler-anschluss)
        const wegK = KC.tagesWege(TC, orteK, S.netzGrund, S.ox, S.oz);
        const gesetzLeer = {};
        for (const ro in rollen) gesetzLeer[ro] = 1;
        let gesetzN = 0;
        for (const b of S.liste) {
            const heimI = orteK.findIndex((o) => o.slot === siVon.get("haus#" + b.heim));
            if (heimI < 0) continue;
            gesetzN++;
            const zahl = {};
            for (let k = 0; k < GESETZ_PROBEN; k++) {
                const B = KC.tagesBindung(TC, (b.same ^ Math.imul(k + 1, 0x9e3779b9)) >>> 0, b.rolle, heimI, orteK, null, wegK);
                for (const art of new Set([B.werk, B.mahl, B.abend, B.besuch].filter((i) => i >= 0 && i !== heimI).map((i) => orteK[i].art))) // prettier-ignore
                    if (art in gesetzLeer) zahl[art] = (zahl[art] || 0) + 1;
            }
            for (const art in zahl) gesetzLeer[art] *= 1 - zahl[art] / GESETZ_PROBEN;
        }
        for (const ro in gesetzLeer) gesetzLeer[ro] = q3(gesetzLeer[ro]);
        return {
            haeuser: tueren.length,
            gesamt: liste().length,
            je,
            zielOrte: fremd.size,
            orte: tueren.filter((t) => t.rolle !== "wohnhaus").length + (pz ? 1 : 0) + aecker.length,
            rollen,
            gesetzLeer,
            gesetzN,
            bruchN: bruch.length,
            bruch: bruch.slice(0, 3),
            ringM: q3(ringM),
            platzRandM: q3(platzRandM),
            torRingM: q3(torRingM),
            fehlt,
            fernN: fern.length,
            fern: fern.slice(0, 3),
            jenseits,
            jenseitsLeben,
            jenseitsSoll: JENSEITS,
        };
    });
    // ── gehege (Pflicht F, w28-gehege; tetrapoda GEHEGE_GESETZ): das Wolfs-Gehege des Ort-Plans, wie die Welt es liest
    // (`_gehegeListe`: die Zeile aus `plan.gehege` — kein Haken der Bühne). Der Gast naht aus 100 m südlich der Zoo-Mitte (das
    // Gehege ist fällig, seine Leiber entstehen fern an ihren Ruhe-Plätzen), steht 300 s an der Station S8 des Plans (Blick ins
    // Gehege, der Schritt des Spiels 1/30 s), sieht den Tieren einen Spieltag zu (der Schritt des Tages-Budgets, 0,1 s), geht
    // jenseits der Fälligkeit (residentM × (1 + GEHEGE_HALT), den Blick fort) und kehrt wieder. Je Bild jeder Leib im Rand (die
    // Tiefe seines Punkts hinter der nächsten Kante), je Takt des Lebens dieselben Nummern im Verzeichnis, kein Tier des Geheges
    // im wilden Gesetz (`_kreaturBestand` zählt die Freien) und keines gealtert; über den Tag der Anteil der Ruhe gegen das
    // Ethogramm seiner Gattung; unter dem Hieb hält der Rand, ein gefallenes Tier steht im nächsten Takt wieder in der Zeile;
    // fern kein Leib, zurück dieselben an ihren Plätzen; an S8 gestellt (die Ankunft) alle im ersten Bild ──
    await buehne("gehege", async (restore) => {
        if (taeter === "gehege-rand") decke("_gehegeRandKontakt", () => () => {});
        // die Zeile tritt ins wilde Gesetz (bis w28-gehege zählte die Bilanz das Gehege): ihr Leib wird angenommen wie ein freies Tier
        if (taeter === "gehege-term")
            decke("_bestandAdoptieren", (alt) => () => {
                for (const c of s.creatures)
                    if (c.userData._bestand && c.userData._bestand.gehege) c.userData._bestand = null;
                return alt.call(r);
            });
        // die Zeile tritt je Region einmal ein (bis w28-gehege): ein gefallenes Tier fehlte bis zum nächsten Laden
        if (taeter === "gehege-zeile")
            decke("_gehegeEinsetzen", (alt) => (key, R) => (R._gehege ? undefined : alt.call(r, key, R)));
        // die Ankunft wartet auf den Takt und auf den Blick (bis w28-gehege): wer mit dem Blick ins Gehege ankam, sah es leer
        if (taeter === "gehege-ankunft") {
            decke("_gehegeKommtAn", () => () => false);
            decke("_gehegeLeiber", (alt) => (fehlt, gruppe) => alt.call(r, fehlt, gruppe, false));
        }
        const [GG, LG, P] = [A._gehegeGesetz(), A._lebensraumGesetz(), r._genesisPlan];
        const Z = r._gehegeListe()[0];
        if (!Z) throw new Error("die Welt trägt kein Gehege (`_gehegeListe` leer: ohne Plan oder ohne Wildnis)");
        const S8 = P.stationen.find((q) => q.name === "S8");
        const [gast, mitte] = [S8.third, S8.blick].map((q) => ({ x: P.ort.x + q.x, z: P.ort.z + q.z }));
        const fernM = globalThis.__fachwerkCore.GENESIS_ORT.regel.residentM * (1 + A.GEHEGE_HALT);
        // die Tiefe im Rand: der kleinste Abstand des Punkts zu einer Kante, nach innen positiv
        const tiefe = (x, z) =>
            Z.rand.reduce((m, p, i) => {
                const q = Z.rand[(i + 1) % Z.rand.length];
                return Math.min(
                    m,
                    ((q.x - p.x) * (z - p.z) - (q.z - p.z) * (x - p.x)) / Math.hypot(q.x - p.x, q.z - p.z)
                );
            }, Infinity);
        const ort = (dz, blick) => (pm.set(gast.x, boden(gast.x, gast.z - dz) + 0.7, gast.z - dz), kamera(0, blick));
        const nummern = GG.tiere(Z, GG.G).map((t) => t.id).sort().join(); // prettier-ignore
        const z = {
            tiere: Z.n,
            bilder: 0,
            aus: 0,
            randMin: Infinity,
            leer: 0,
            anders: 0,
            wild: 0,
            wildLesen: 0,
            alterS: 0,
            takte: 0,
        };
        const leiber = () => r._gehegeTiereVon(Z).map((t) => t.leib).filter(Boolean); // prettier-ignore
        const eintritt = new Map(); // je Kennung das Alter, mit dem ihr Tier in die Zeile trat
        const bild = (voll, B) => {
            const L = leiber();
            z.leer += voll && L.length !== Z.n;
            for (const c of L) {
                const d = tiefe(c.position.x, c.position.z);
                [z.bilder, z.aus, z.randMin] = [z.bilder + 1, z.aus + (d < 0), Math.min(z.randMin, d)];
                const ud = c.userData;
                if (B) B[(ud.task && ud.task.name === "drink") || !ud._gezeigt ? "ziehen" : ud._gezeigt]++;
            }
        };
        // ein Takt des Lebens (taktS der Spiel-Zeit): das Verzeichnis trägt die Zeile, das wilde Gesetz zählt sie nicht
        const leben = () => {
            r._weltUhrNimm(s.spielZeit + (A._bestandGesetz().B.taktS));
            ruhigSpieler();
            r.tickFaunaLifecycle();
            const T = r._gehegeTiereVon(Z);
            z.takte++;
            z.anders += T.map((t) => t.id).sort().join() !== nummern; // prettier-ignore
            // gealtert gegen den Eintritt: die Zeile tritt erwachsen ein (alterS = reifeS(M∞), leben-erbe) und altert nie im Takt
            for (const t of T) {
                if (!eintritt.has(t.id)) eintritt.set(t.id, t.alterS);
                z.alterS = Math.max(z.alterS, t.alterS - eintritt.get(t.id));
            }
        };
        // DAS WILDE GESETZ ZÄHLT DIE ZEILE NICHT — gelesen am EINEN Leser des Bestands einer Art (`_bestandArt`; der Wolf lebt im
        // Gau, Leben C2b): kein Tier im Bestand ist eines der Zeile, trägt einen ihrer Leiber oder trat als Annahme eines Leibs im
        // Rand ein. Gelesen wird der GANZE Gau der Zeile: ein angenommener Wolf tritt ins Rudel, dem das Revier gehört, und steht
        // dort, wo es zuletzt riss (leben-core `akt` „ein“) — im Revier des Geheges fände ihn keine Lesung
        const [zeilenLeib, angenommen] = [new Set(), new Set()];
        decke(
            "_gauAnnahme",
            (alt) =>
                function (c, ...a) {
                    alt.call(this, c, ...a);
                    if (tiefe(c.position.x, c.position.z) >= -2 && c.userData._bestand)
                        angenommen.add(c.userData._bestand.id);
                }
        );
        const wildLesen = async () => {
            for (const c of leiber()) zeilenLeib.add(c);
            const n = A.GAU.n;
            const gaue = new Map(r._gehegeTiereVon(Z).map((t) => { const o = r._gauOrt(...r._bestandKey(t.x, t.z).split(",").map(Number)); return [o.gx + "," + o.gz, o]; })); // prettier-ignore
            const keys = [...gaue.values()].flatMap((o) => Array.from({ length: n * n }, (_, i) => o.x0 + (i % n) + "," + (o.z0 + Math.floor(i / n)))); // prettier-ignore
            await gauLies(keys);
            for (const key of keys) {
                const B = r._bestandArt(key, Z.gattung);
                z.wildLesen += !!B;
                if (B)
                    z.wild += B.tiere.filter((t) => t.gehege || zeilenLeib.has(t.leib) || angenommen.has(t.id)).length;
            }
        };
        s.faunaLifecycle = { lastTick: 0 }; // die Marke der Bühne reist als Verweis — der Takt des Lebens beginnt hier
        const tag0 = s.timeOfDay;
        restore.push(() => r._uhrSetzen(tag0, "regler"));
        r._uhrSetzen(0.5, "regler");
        // (1) der Gast naht: die Leiber entstehen fern
        ort(100, 1);
        for (let k = 0; k < 3; k++) (leben(), bild(false));
        z.nahen = leiber().length;
        // (2) der Gast steht 300 s an S8 (ein Täter fährt 60 s und 1,2 Stunden des Tags: sein Befund steht am Hieb und am ersten Takt)
        const blick = () => (
            pm.set(gast.x, boden(gast.x, gast.z) + 0.7, gast.z),
            kamera(mitte.x - gast.x, mitte.z - gast.z)
        );
        for (let k = 0; k < (taeter ? 1800 : 9000); k++) {
            if (k % 300 === 0) (leben(), blick());
            takt(1 / 30);
            bild(true);
        }
        await wildLesen();
        // (3) ein Spieltag am Gehege (der Schritt des Tages-Budgets)
        const takte = Math.round((0.1 / 24) * (s.dayLengthMinutes || A.DAY_LENGTH_DEFAULT_MINUTES) * 600);
        const B = { ruhen: 0, nahrung: 0, ziehen: 0 };
        for (let i = 0, n = 0; i < (taeter ? 12 : 240); i++) {
            r._uhrSetzen(((s.timeOfDay * 24 + 0.1) % 24) / 24, "regler");
            for (let k = 0; k < takte; k++, n++) {
                if (n % 100 === 0) (leben(), blick());
                ruhigSpieler();
                takt(0.1);
                bild(true, B);
            }
        }
        await wildLesen();
        const summe = B.ruhen + B.nahrung + B.ziehen;
        z.budget = Object.fromEntries(Object.entries(B).map(([k, v]) => [k, rund(v / Math.max(1, summe), 3)]));
        z.sollRuhen = LG.E.gattung[Z.gattung].ruhen;
        z.plaetze = leiber().map((c) => rund(Math.min(...Z.ruhe.map((q) => ab(c.position, q))), 1));
        // (3b) DER HIEB: der Gast trifft jedes Tier von S8 aus (`damageCreature` — der eine Fall, in dem es ihn liest): sie fliehen
        // 30 s lang von ihm fort an den fernen Rand, und der Rand hält den Leib (`hieb`: die kleinste Tiefe dieser Bilder)
        const vor = [z.bilder, z.randMin];
        z.randMin = Infinity;
        for (const c of leiber()) r.damageCreature(c, 1, { source: "player", fromPos: pm.clone() });
        for (let k = 0; k < 900; k++) (ruhigSpieler(), takt(1 / 30), bild(true));
        z.hieb = { bilder: z.bilder - vor[0], randMin: rund(z.randMin, 2) };
        z.randMin = Math.min(z.randMin, vor[1]);
        // (3c) DER TOD: ein Tier fällt unter der Hand des Gasts — der Feld-Akt „aus“ nimmt es aus dem Verzeichnis, sobald die
        // Folge des Felds an seinem Stempel steht (die Regionen holen ihre Stunde mit aufholJeTakt je Takt nach: die Bühne taktet,
        // bis sie steht). Die Zeile IST der Bestand: das alte Tier ist fort (`fort`), der nächste Takt liest dieselben Nummern,
        // und sein Leib steht nach (5) wieder an seinem Ruhe-Platz
        // (der Takt der Altlast liest die Spur des Gaus an seinem Takt: die Bühne wartet je Takt auf die Antwort des Fadens, wie
        // das Spiel sie zwischen zwei Bildern bekommt — ein Takt ohne sie wartet geordnet, `_bestandGauSteht`; die Uhr steht dabei)
        for (let k = 0; k < 400 && !r._feldFolgeSteht(s.spielZeit); k++)
            (await gauLies(r._bestandNah()), r.tickFaunaLifecycle());
        const opfer = leiber()[0]; // ohne Leib (das Gehege steht leer) fällt keiner: `fiel` 0
        const alt = opfer && opfer.userData._bestand;
        if (opfer) r.damageCreature(opfer, 1e9, { source: "player", fromPos: pm.clone() });
        restore.push(() => s.leichname.includes(opfer) && r.removeCreature(opfer));
        leben();
        const zeile = r._gehegeTiereVon(Z);
        z.tod = { fiel: +s.leichname.includes(opfer), fort: +(!!alt && !zeile.includes(alt)), zeile: zeile.length };
        // (4) der Gast geht jenseits der Fälligkeit, den Blick fort: kein Leib trägt das Gehege
        ort(fernM + 30, -1);
        for (let k = 0; k < 3; k++) leben();
        z.fern = leiber().length;
        // (5) und kehrt wieder: dieselben Tiere an ihren Plätzen
        ort(100, 1);
        for (let k = 0; k < 3; k++) (leben(), bild(false));
        z.wieder = leiber().length;
        z.wiederPlatz = rund(
            Math.max(-1, ...leiber().map((c) => Math.min(...Z.ruhe.map((q) => ab(c.position, q))))),
            2
        );
        // (6) DIE ANKUNFT: der Gast geht wieder fort (kein Leib) und wird an S8 GESTELLT, den Blick ins Gehege (ein Stand lädt ihn
        // dorthin, ein Tor, ein Instrument) — im ersten Bild des Spiels danach (ein Schritt von 1/30 s, kein Takt des Lebens)
        // stehen alle Tiere an ihren Ruhe-Plätzen
        ort(fernM + 30, -1);
        for (let k = 0; k < 3; k++) leben();
        const davor = leiber().length;
        blick();
        r._weltUhrNimm(s.spielZeit + (1 / 30));
        r.tickFaunaLifecycle();
        const nebenM = rund(Math.max(-1, ...leiber().map((c) => Math.min(...Z.ruhe.map((q) => ab(c.position, q))))), 2);
        z.ankunft = { vor: davor, erstes: leiber().length, platz: nebenM };
        z.randMin = rund(z.randMin, 2);
        return z;
    });
    // ── DAS ERBE (leben.evolution.erbe#1 · muster#1, leben-erbe): der ECHTE Takt des Bestands (`_bestandSchritt` →
    // `_bestandTakt`, die Geburt aus Mutter und Vater, Hunger, Riss und Alter des Gesetzes `__lebenCore`) rechnet Regionen fern
    // als Zahl, ohne Leib, je Saat aus eigenen Strömen (wie der Zeitraffer der Kaskade) — kein Zweit-Modell im Skript. Die Probe
    // liest nur: den EINEN Leser `_lebenKern` umhüllt sie, um je Kind seine Eltern zu kennen (die Erb-Vektoren `a` der Mutter und
    // des Vaters, wie `_creatureNaturalBirth` sie an `kind` gibt — dieselben Objekte wie in den Datensätzen der Eltern); der
    // Phänotyp ist ln(M∞ / M_guss) des Datensatzes (`_bestandMasseAdult`, mit der Umwelt-Streuung seiner Kennung). Die MUTANTE
    // `kind → gruender` ist ein Probe-Eingriff an dieser Hülle, kein Schalter im Spiel. Hirsch und Wolf leben im Gau (Leben C2b):
    // ihren Takt rechnet der Gau-Faden, die Probe fährt ihn (`gauFahrt`) und liest ihn am EINEN Leser des Bestands einer Art
    // (`_bestandArt`); ihre Mutante rechnet ein Faden aus dem geänderten Kern (`fadenKern`). Mit `opts.saaten` fährt die Akte
    // (`node scripts/diag-kreatur-leben.cjs --akte`) dieselben Läufe an 30 Saaten; das Tor fährt eine ──
    const SAATEN = Math.max(1, Math.floor((opts && opts.saaten) || 1));
    const L0 = A._lebenKern();
    const huelle = { mutante: false, eltern: new Map() };
    const lebenHuelle = () =>
        aufraeumen.push(
            leihe(A, {
                _lebenKernMemo: Object.freeze(
                    Object.assign({}, L0, {
                        kind: (aM, aV, nSeg, nMut, nVater) => {
                            const a = huelle.mutante ? L0.gruender(nSeg) : L0.kind(aM, aV, nSeg, nMut, nVater);
                            huelle.eltern.set(a, [aM, aV]);
                            return a;
                        },
                    })
                ),
            })
        );
    // die Regionen der Probe: die 3 × 3 Kacheln um den Spieler, deren Boden steht (`_bestandBereit`), ohne Gehege
    const lebenRegionen = async () => {
        const [ix, iz] = r._bestandHier().split(",").map(Number);
        const keys = [];
        for (let dx = -1; dx <= 1; dx++) for (let dz = -1; dz <= 1; dz++) keys.push(ix + dx + "," + (iz + dz));
        for (let k = 0; k < 200 && !keys.every((key) => r._bestandBereit(key)); k++) await sleep(50);
        return keys.filter((key) => r._bestandBereit(key));
    };
    // EIN LAUF: die Regionen `keys` leer an der Welt-Uhr 0, `takte` Takte des Gesetzes je Region; `vor(k, R)` greift vor jedem
    // Takt ein (der Gegenlauf), `nach(k, R)` liest danach
    const lebenLauf = (saat, keys, takte, vor, nach) => {
        const rng = new Proxy(Object.create(null), {
            get: (o, k) => o[k] || (o[k] = r._streamRng("leben-" + saat + "-" + String(k))),
        });
        r._faunaStroeme = { seed: s.worldMeta.seed, rng };
        r._weltUhrNeu(0); // je Lauf eine neue Welt-Uhr (nur die Geburt stellt sie zurück)
        [s.lifeField, s.faunaBestand] = [undefined, undefined];
        const R = keys.map((key) => Object.assign(r._bestandRegion(key, false), { t: 0 }));
        const frei = R.map((Rj) => !Rj.tiere.some((t) => t.gehege));
        const t0 = performance.now();
        for (let k = 0; k < takte; k++)
            for (let j = 0; j < keys.length; j++) {
                if (!frei[j]) continue;
                if (vor) vor(k, R[j]);
                const tode = [];
                r._bestandSchritt(keys[j], R[j], true, tode);
                r._bestandTode(tode);
                if (nach) nach(k, R[j]);
            }
        // die Uhr steht nach dem Lauf, wo er sie stellte (0): `_bestandSchritt` gibt sie nach jedem Takt zurück
        return { R: R.filter((x, j) => frei[j]), s: (performance.now() - t0) / 1000 };
    };
    const lnM = (t) => Math.log(r._bestandMasseAdult(t) / r._gattungKg(t.g));
    // die Regression y auf x (Steigung, ihr Standardfehler, n)
    const regression = (P) => {
        const n = P.length;
        if (n < 3) return { steigung: null, se: null, n };
        const mx = P.reduce((q, p) => q + p[0], 0) / n,
            my = P.reduce((q, p) => q + p[1], 0) / n;
        let [sxx, sxy, syy] = [0, 0, 0];
        for (const [x, y] of P) [sxx, sxy, syy] = [sxx + (x - mx) ** 2, sxy + (x - mx) * (y - my), syy + (y - my) ** 2];
        const b = sxy / sxx;
        const se = Math.sqrt(Math.max(0, (syy - b * sxy) / (n - 2)) / sxx);
        return { steigung: rund(b, 3), se: rund(se, 3), n };
    };
    await buehne("erbe", async () => {
        lebenHuelle();
        const keys = await lebenRegionen();
        // ≥ 10 Generationen: die Generation eines Kinds ist die seiner Mutter + 1 (ein Gründer 0)
        const TAKTE = 2160; // 6 Spielstunden je Region (der Fuchs ist reif nach Minuten) — und 82 Jahre des Gaus (26,25 Takte je Jahr)
        // je Tier sein Phänotyp und seine Generation (die Kennung der Mutter `m` nennt sie): die Paare Mutter → Kind
        const paare = () => {
            const wer = new Map();
            const P = { mutter: [], gen: 0 };
            P.sieh = (t, mutterId) => {
                if (wer.has(t.id)) return;
                const M = mutterId != null ? wer.get(mutterId) : null;
                const ich = { p: lnM(t), gen: M ? M.gen + 1 : 0 };
                wer.set(t.id, ich);
                P.gen = Math.max(P.gen, ich.gen);
                if (M) P.mutter.push([M.p, ich.p]);
            };
            return P;
        };
        // DIE ALTLAST (Fuchs, Bär): der Takt der Region, die Mutter aus der Hülle des Kerns (die Erb-Vektoren `a` ihrer Eltern)
        const erbeAlt = (saat, mutante) => {
            Object.assign(huelle, { mutante: mutante || taeter === "erbe-kind", eltern: new Map() });
            const P = paare();
            const id = new WeakMap(); // der Erb-Vektor `a` → die Kennung seines Tiers
            const l = lebenLauf(saat, keys, TAKTE, null, (k, R) => {
                for (const t of R.tiere) {
                    if (r._gauRolle(t.g) || id.has(t.a)) continue;
                    id.set(t.a, t.id);
                    const e = huelle.eltern.get(t.a);
                    P.sieh(t, e ? id.get(e[0]) : null);
                }
            });
            huelle.mutante = false;
            return Object.assign(P, { s: l.s, regionen: l.R.length });
        };
        // DIE GATTUNGEN DES GESETZES (Hirsch, Wolf — Leben C2b): ihr Erbe rechnet der Gau-Faden (leben-core `kind` im Takt des
        // Gaus); die Bühne fährt den Gau der 5 × 5 Regionen um den Spieler und liest je 5 Takte ihre Tiere am EINEN Leser
        // (`_bestandArt`), die Mutter nennt `m`. Die Mutante rechnet der Faden aus dem Kern mit `gruender` statt `kind`
        // (dieselben Würfe des Stroms) — derselbe Probe-Eingriff wie die Hülle, im Faden.
        const [ix, iz] = r._bestandHier().split(",").map(Number);
        const gauKeys = [];
        for (let dx = -2; dx <= 2; dx++) for (let dz = -2; dz <= 2; dz++) gauKeys.push(ix + dx + "," + (iz + dz));
        const GG = [A.GAU.beute, A.GAU.jaeger];
        const erbeGau = async (saat, mutante) => {
            const zurueck = mutante || taeter === "erbe-kind" ? await fadenKern("leben-core.js", [["kind(mu.a, va.a, normale(rng), normale(rng), normale(rng))", "(normale(rng), normale(rng), gruender(normale(rng)))"]]) : () => {}; // prettier-ignore
            const P = paare();
            const fahrt = gauFahrt(gauKeys, 1e6 + saat);
            const t0 = performance.now();
            for (let k = 0; k <= TAKTE; k += 5) {
                await fahrt(k);
                for (const key of gauKeys)
                    for (const g of GG) for (const t of (r._bestandArt(key, g) || { tiere: [] }).tiere) P.sieh(t, t.m);
            }
            zurueck();
            return Object.assign(P, { s: (performance.now() - t0) / 1000 });
        };
        const z = { regionen: 0, gauRegionen: gauKeys.length, saaten: [], s: 0 };
        const [alle, aus] = [[], []];
        for (let i = 1; i <= SAATEN; i++) {
            const [E, M, EG, MG] = [
                erbeAlt(i, false),
                erbeAlt(i, true),
                await erbeGau(i, false),
                await erbeGau(i, true),
            ];
            alle.push(...E.mutter, ...EG.mutter);
            aus.push(...M.mutter, ...MG.mutter);
            z.regionen = E.regionen;
            z.s += E.s + M.s + EG.s + MG.s;
            z.saaten.push({
                steigung: regression([...E.mutter, ...EG.mutter]).steigung,
                mutante: regression([...M.mutter, ...MG.mutter]).steigung,
                gau: regression(EG.mutter).steigung,
                alt: regression(E.mutter).steigung,
                gen: Math.min(E.gen, EG.gen),
                paare: [E.mutter.length, EG.mutter.length],
            });
            await sleep(1);
        }
        Object.assign(z, {
            erbe: regression(alle),
            mutante: regression(aus),
            gen: Math.min(...z.saaten.map((q) => q.gen)),
            s: rund(z.s, 1),
            takte: TAKTE,
        });
        return z;
    });
    // ── muster#1 (Räuberdruck → Größe; Gegenlauf ohne Räuber): Hirsch und Wolf leben im Gau (Leben C2b) — die Bühne fährt den
    // Gau der 3 × 3 Regionen um den Spieler Takt für Takt (`gauFahrt`, mit den Toden des Takts), 2 600 Takte (≈ 100 Jahre, ≈ 25
    // Hirsch-Generationen); der Gegenlauf nimmt nach jedem Takt jeden Wolf, der im Bild steht (der Akt „aus“, `_gauAus` — wie der
    // Eingriff der Kaskade); gemessen das Mittel von ln(M∞ / M_guss) der reifen Hirsche über die zweite Hälfte, gelesen am EINEN
    // Leser (`_bestandArt`). Das Vorzeichen ist ERGEBNIS — das Tor urteilt nur, dass die Kräfte wirken: der Riss wählt sein Opfer
    // nach seiner VERWUNDBARKEIT (leben-core ZEIT_JAGD jagd: Kitz und Greis je `jung`/`greis`, sonst 1 — Satz 3 des Gesetzes),
    // gegen die Erwartung an jeder Wahl im Revier des Risses (wie oft ein Greis, welche Masse) ──
    await buehne("muster", async () => {
        // der Täter: der Riss nimmt das Älteste (das Opfer bis leben-erbe) — im Kern des Fadens
        if (taeter === "riss-aeltester")
            await fadenKern("leben-core.js", [["const o = zug(list, wahl, rng);", "const o = (rng(), list.reduce((b, t) => (wahl(t) > 0 && (!b || t.alterS > b.alterS) ? t : b), null));"]]); // prettier-ignore
        // der Täter: die Rückkraft fällt — das Kind erbt das Erbe seiner Eltern anderthalbfach (die Größe hat keinen Halt mehr)
        if (taeter === "rueckkraft")
            await fadenKern("leben-core.js", [["kind(mu.a, va.a, normale(rng), normale(rng), normale(rng))", "kind(mu.a, va.a, normale(rng), normale(rng), normale(rng)).map((v) => 1.5 * v)"]]); // prettier-ignore
        const [J, TS] = [L0.zeitJagd().jagd, A._bestandGesetz().B.taktS];
        // die Verwundbarkeit am Takt des Risses (das Alter nach dem Schritt 0 des Takts)
        const klasse = (t) => {
            const a = t.alterS + TS;
            return !(t.r || a >= L0.reifeS(t.M)) ? "jung" : a >= J.greisAb * L0.lebensdauerS(t.M) ? "greis" : "adult";
        };
        const vw = (t) => (klasse(t) === "adult" ? 1 : J[klasse(t)]);
        const greis = (t) => klasse(t) === "greis";
        const riss = { n: 0, aeltest: 0, pAeltest: 0, vAeltest: 0, kg: 0, kgSoll: 0, kgVar: 0 };
        const keys = await lebenRegionen();
        const [H, W] = [A.GAU.beute, A.GAU.jaeger];
        const TAKTE = 2600;
        const lauf = async (saat, ohneWolf) => {
            const q = { hirsch: 0, woelfe: 0, proben: 0, mittel: 0, reif: 0, ueber: 0 };
            const fahrt = gauFahrt(keys, 2e6 + saat, { tode: true });
            const t0 = performance.now();
            let pool = new Map(); // je Revier „gau:i“ die Beute vor dem Takt (Kopien: das Bild schreibt seine Datensätze fort)
            for (let k = 0; k <= TAKTE; k++) {
                const { tode } = await fahrt(k);
                for (const d of tode) {
                    if (d.ursache !== "jagd") continue;
                    const P = pool.get(d.gau + ":" + d.wo);
                    const o = P && P.find((t) => t.id === d.id);
                    if (!o) continue;
                    if (P.length >= 2) {
                        const w = P.map(vw);
                        const Wsum = w.reduce(addiere, 0);
                        const p = P.reduce((s, t, i) => s + (greis(t) ? w[i] : 0), 0) / Wsum;
                        const eM = P.reduce((s, t, i) => s + (t.kg * w[i]) / Wsum, 0);
                        const vM = P.reduce((s, t, i) => s + ((t.kg - eM) ** 2 * w[i]) / Wsum, 0);
                        Object.assign(riss, {
                            n: riss.n + 1,
                            aeltest: riss.aeltest + greis(o),
                            pAeltest: riss.pAeltest + p,
                            vAeltest: riss.vAeltest + p * (1 - p),
                            kg: riss.kg + o.kg,
                            kgSoll: riss.kgSoll + eM,
                            kgVar: riss.kgVar + vM,
                        });
                    }
                    P.splice(P.indexOf(o), 1); // das nächste Opfer desselben Takts wählt unter den übrigen
                }
                if (ohneWolf)
                    for (const key of keys)
                        for (const t of (r._bestandArt(key, W) || { tiere: [] }).tiere) r._gauAus(t);
                pool = new Map();
                for (const key of keys) {
                    const B = r._bestandArt(key, H);
                    if (!B) continue;
                    const o = r._gauOrt(...key.split(",").map(Number));
                    pool.set(o.gx + "," + o.gz + ":" + o.revier, B.tiere.map((t) => ({ id: t.id, r: t.r, alterS: t.alterS, M: t.M, kg: t.kg }))); // prettier-ignore
                }
                if (k < TAKTE / 2 || k % 10) continue;
                const hirsche = keys.flatMap((key) => (r._bestandArt(key, H) || { tiere: [] }).tiere);
                const reif = hirsche.filter((t) => t.r);
                q.woelfe += keys.reduce((n, key) => n + (r._bestandArt(key, W) || { n: 0 }).n, 0);
                q.hirsch += hirsche.length;
                q.proben++;
                if (reif.length) q.mittel += reif.reduce((p, t) => p + lnM(t), 0) / reif.length;
                // jenseits der Spanne des Gesetzes: M∞ über dem größten Erwachsenen (+4σ), das der Leib noch zeigt, oder ebenso weit
                // darunter (−4σ: ohne Rückkraft läuft die Größe nach beiden Seiten — die Mutante trug den Zwerg, ln M̄ −1,2)
                [q.reif, q.ueber] = [q.reif + reif.length, q.ueber + reif.filter((t) => Math.abs(lnM(t)) > 3 * Math.log(L0.spanne()[1])).length]; // prettier-ignore
            }
            return {
                lnM: rund(q.mittel / Math.max(1, q.proben), 4),
                hirsch: rund(q.hirsch / Math.max(1, q.proben), 2),
                woelfe: rund(q.woelfe / Math.max(1, q.proben), 2),
                ueberSpanne: rund(q.ueber / Math.max(1, q.reif), 3),
                s: rund((performance.now() - t0) / 1000, 1),
            };
        };
        const z = { regionen: keys.length, takte: TAKTE, saaten: [] };
        // das Ergebnis am Stand: nach dem Lauf mit Wölfen steht der Riss (der Gegenlauf reißt nicht) — dort hält ein Täter, dessen
        // Wort schon steht (Kreatur-Takt 22.11.)
        const ergebnis = () => {
            const D = z.saaten.filter((q) => q.aus).map((q) => q.delta);
            return {
                ...z,
                saaten: [...z.saaten],
                delta: rund(D.reduce(addiere, 0) / D.length, 4),
                negativ: D.filter((d) => d < 0).length,
                wanduhrMaxS: Math.max(...z.saaten.flatMap((q) => [q.an.s, q.aus ? q.aus.s : 0])),
                riss: {
                n: riss.n,
                aeltest: riss.aeltest,
                aeltestSoll: rund(riss.pAeltest, 1),
                aeltestZ: rund((riss.aeltest - riss.pAeltest) / Math.sqrt(Math.max(1e-9, riss.vAeltest)), 2),
                kgZ: rund((riss.kg - riss.kgSoll) / Math.sqrt(Math.max(1e-9, riss.kgVar)), 2),
                aeltestRel: rund(riss.aeltest / Math.max(1e-9, riss.pAeltest) - 1, 4),
                kgRel: rund(riss.kg / Math.max(1e-9, riss.kgSoll) - 1, 4),
            },
            };
        };
        for (let i = 1; i <= SAATEN; i++) {
            const an = await lauf(i, false);
            z.saaten.push({ an });
            await stelle(ergebnis());
            const aus = await lauf(i, true);
            z.saaten[i - 1] = { delta: rund(an.lnM - aus.lnM, 4), an, aus };
            await sleep(1);
        }
        return ergebnis();
    });
    // ── gau (Leben C2a): DER GAU IM FADEN — der Bestand unter dem Gesetz der Zeit und der Jagd lebt je Gau im Gau-Faden
    // (`_gauAuftrag` → voxel-worker `gauAuftrag` → leben-core `gauBis`). Die Bühne fragt den Gau (0, 0) der Heimat, mit der Saat
    // und der Masse von Lauf 4 (E6: die Linse „Bestand = Gesetz“ bleibt an Lauf 4; das Spiel reicht die Masse des Gusses):
    //   G1  der B4-Lauf (die Welt-Bindung, gemessen am Feld des HAUPT-Fadens: `_bodenKlasseAt` · `_kreaturNahrung`) zahlengleich
    //       aus dem Faden — das Feld des Fadens (Boden-Klasse, Substrat-Spiegel) ist das des Stamms, sonst verlässt die Spur ihn
    //   G3  zwei Fäden (der zweite frisch geboren: Feld und Lauf ab der Saat) geben denselben Stand, Byte für Byte; EIN Akt
    //       „aus“ am Takt 100 ändert ihn; derselbe Akt wieder gibt denselben
    //   G4  der Stand am Takt 100 reist heraus, herein und rechnet bis 160 weiter = der Lauf geradeaus, Byte für Byte
    // Täter (alle in EINEM Lauf, je einer an seiner Sicht): gau-feld (ein Formel-Zwilling: die Änderung am Kern erreicht nur die Seite) · gau-akt (der Wirt
    // verliert den Akt) · gau-stand (der Stand verliert die Fraß-Schicht auf der Reise) · gau-reihe (das Leben des Stands
    // verliert die Akte der Gaue). `opts.gau.jahre` (nur `--gau`): das
    // Aufholen eines Gaus ohne Akte über n Jahre, im Faden gemessen (G5); `haupt`: die längste Arbeit des Haupt-Fadens (G2).
    await buehne("gau", async () => {
        const O = (opts && opts.gau) || {};
        const TT = [].concat(taeter || []);
        const KG = { deer: 94.24042032034154, wolf: 64.01114942302421 };
        const [T1, T2] = [100, 160];
        const haupt = { maxMs: 0, wo: "", rufe: 0 };
        const uhr = (wo, fn) =>
            function (...a) {
                const t = performance.now();
                try {
                    return fn.apply(this, a);
                } finally {
                    const d = performance.now() - t;
                    haupt.rufe++;
                    if (d > haupt.maxMs) [haupt.maxMs, haupt.wo] = [d, wo];
                }
            };
        const faden = () => {
            const f = r._gauFadenStand;
            if (f && !f.worker.__uhr) [f.worker.onmessage, f.worker.__uhr] = [uhr("antwort", f.worker.onmessage), true];
        };
        decke("_gauAuftrag", (alt) => uhr("auftrag", alt));
        decke("_gauFrage", (alt) => {
            const mit = uhr("frage", alt);
            return function (m, tr) {
                const p = mit.call(this, m, tr);
                faden();
                return p;
            };
        });
        const frage = (takt, akte, opt) =>
            r._gauAuftrag(0, 0, takt, akte || [], Object.assign({ saat: 1, kg: KG }, opt));
        const gleich = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
        const fnv = (b) => {
            let h = 2166136261;
            for (let i = 0; i < b.length; i++) h = Math.imul(h ^ b[i], 16777619);
            return (h >>> 0).toString(16);
        };
        // ein Täter an seinem Ort: `tausch` deckt den Sender des Wirts, solange `fn` läuft
        const unter = async (tausch, fn) => {
            const ab = [];
            decke("_gauFrage", (alt) => (m, tr) => alt.call(r, tausch(m) || m, tr), ab);
            try {
                return await fn();
            } finally {
                for (const f of ab) f();
            }
        };
        const z = { sicht: {} };
        // G1 — die Spur von B4: Wolf und Beute nach den Takten 1, 106, …, 946 (je 4 Jahre)
        const zeit = { feldMs: 0, hydroMs: 0, kacheln: 0, rechenMs: 0, takte: 0 };
        const [wolf, reh] = [[], []];
        let a = null;
        for (let k = 0; k < 10; k++) {
            a = await frage(1 + 105 * k);
            wolf.push(a.jaeger);
            reh.push(a.beute);
            for (const f of ["rechenMs", "takte"]) zeit[f] += a.zeit[f];
            if (a.zeit.neu)
                Object.assign(zeit, { feldMs: a.zeit.feldMs, hydroMs: a.zeit.hydroMs, kacheln: a.zeit.kacheln });
        }
        Object.assign(z, { wolf, reh, feld: Object.assign({}, a.feld, { kSumme: rund(a.feld.kSumme, 0) }) });
        z.zeit = {
            feldS: rund(zeit.feldMs / 1000, 2),
            hydroS: rund(zeit.hydroMs / 1000, 2),
            kacheln: zeit.kacheln,
            msJeJahr: rund((zeit.rechenMs / Math.max(1, zeit.takte)) * 26.25, 1),
        };
        // Z — EINE QUELLE (C2a2): das Feld des Fadens ist das des Stamms, Zelle für Zelle (Substrat der Äsung: gelaende-core
        // `weltFeld`; Lebensraum aus der Boden-Klasse: tetrapoda `bodenKlasseAm`), und EINE Änderung am Quelltext des Kerns —
        // dem, den Seite UND Faden laden — bewegt beide, und sie bleiben gleich. Fährt irgendwo ein Formel-Zwilling, bewegt sich
        // nur eine Seite. Gelesen an den 36 Regionen um den Ursprung (576 Zellen).
        {
            const [zn, seite] = [A.BESTAND_REGION.zellen, r._bestandSeite()];
            const orte = [];
            for (let iz = -3; iz < 3; iz++)
                for (let ix = -3; ix < 3; ix++) orte.push([ix, iz, r._gauOrt(ix, iz).revier]);
            const stamm = () =>
                orte.map(([ix, iz]) => {
                    const [LG, lr, sub] = [A._lebensraumGesetz(), [], []];
                    for (let a = 0; a < zn; a++)
                        for (let b = 0; b < zn; b++) {
                            const [x, zz] = [(ix + (a + 0.5) / zn) * seite, (iz + (b + 0.5) / zn) * seite];
                            const v = LG.lebensraum(A.GAU.beute, r._bodenKlasseAt(x, zz), LG.L);
                            lr.push(v);
                            sub.push(v > 0 ? r.worldFieldAt(x, zz).lebendig : 0);
                        }
                    return { lr, s: sub };
                });
            const imFaden = async () =>
                (await frage(0, [], { lesen: orte.map((o) => o[2]) })).reviere.map((R) => ({ lr: R.lr, s: R.s }));
            const eins = (p, q) => JSON.stringify(p) === JSON.stringify(q);
            const frisch = () => {
                if (r._gauFadenStand) r._gauFadenStand.worker.terminate();
                r._gauFadenStand = null;
            };
            const [s0, f0] = [stamm(), await imFaden()];
            // der Kern mit EINER geänderten Stelle: sein Quelltext, wie ihn der Faden lädt (die Tafel der Quelle im Rumpf des
            // Fadens), einmal ersetzt — die Seite wertet denselben Text aus, der Faden entsteht aus ihm
            const mutant = async ([wer, datei, ns, von, zu], nurSeite) => {
                const Q = r._quelleStand();
                await r._fadenQuelle();
                const FQ = A.FADEN_QUELLE;
                const u = (p) => new URL(p + "?v=" + A.VERSION, location.href).href;
                const text = await (await fetch(u(datei))).text();
                if (text.split(von).length !== 2)
                    return { wer, fehler: "der Kern " + datei + " trägt die Formel nicht" };
                const neu = text.replace(von, () => zu);
                // der Rumpf des Fadens, wie ihn die Quelle baut (`_quelleFaden`): die Tafel der Kerne vor dem Faden — der eine
                // geänderte Kern als Blob, jeder andere an seiner Adresse
                const blob = URL.createObjectURL(new Blob([neu], { type: "text/javascript" }));
                const adr = (p) => (p === datei ? blob : u(p));
                const tafel = {
                    kerne: FQ.kerne.map(adr),
                    spaet: Object.fromEntries(Object.entries(FQ.spaet).map(([k, p]) => [k, adr(p)])),
                };
                const rumpf = await (await fetch(u(FQ.faden))).text();
                const [altUrl, altKern] = [Q.url, globalThis[ns]];
                await new Promise((ok, nein) => {
                    const sk = document.createElement("script");
                    [sk.src, sk.onload, sk.onerror] = [
                        blob,
                        ok,
                        () => nein(new Error("der geänderte Kern " + datei + " lädt nicht")),
                    ];
                    document.head.appendChild(sk);
                });
                A._lebensraumMemo = null;
                let s1, f1;
                try {
                    s1 = stamm();
                    if (!nurSeite)
                        Q.url = URL.createObjectURL(
                            new Blob(["self.__anazhQuelle = " + JSON.stringify(tafel) + ";", rumpf], {
                                type: "text/javascript",
                            })
                        );
                    frisch();
                    f1 = await imFaden();
                } finally {
                    [Q.url, globalThis[ns], A._lebensraumMemo] = [altUrl, altKern, null];
                    frisch();
                }
                const anders = (p, q) =>
                    p.reduce(
                        (n, R, i) => n + R.lr.filter((v, j) => v !== q[i].lr[j] || R.s[j] !== q[i].s[j]).length,
                        0
                    );
                return { wer, stamm: anders(s1, s0), faden: anders(f1, f0), gleich: eins(s1, f1) };
            };
            const M = [
                [
                    "Substrat (gelaende-core weltFeld)",
                    "gelaende-core.js",
                    "__gelaendeCore",
                    "const n01 = (v) => Math.max(0, Math.min(1, (v + 1) / 2));",
                    "const n01 = (v) => Math.max(0, Math.min(1, (v + 1) / 2.5));",
                ],
                [
                    "Boden-Klasse (tetrapoda bodenKlasseAm)",
                    "tetrapoda-core.js",
                    "__tetrapodaCore",
                    "welt.hang(x, z) || 0, welt.bestand(x, z), L);",
                    "welt.hang(x, z) || 0, welt.bestand(x, z) * 0.5, L);",
                ],
            ];
            z.quelle = {
                zellen: s0.length * zn * zn,
                land: s0.reduce((n, R) => n + R.lr.filter((v) => v > 0).length, 0),
                gleich: eins(s0, f0),
                mut: [await mutant(M[0]), await mutant(M[1])],
            };
            // Täter gau-feld: der Zwilling — die Änderung erreicht nur die Seite, der Faden rechnet seine eigene Formel
            if (TT.includes("gau-feld"))
                z.sicht["gau-feld"] = { quelle: Object.assign({}, z.quelle, { mut: [await mutant(M[0], true)] }) };
        }
        // DIE LESE-NAHT am Takt T1: die Reviere der mittleren Zeile — Köpfe, Tiere, Fraß; der erste Kopf der Beute fällt im Akt
        const n = A.GAU.n;
        const zeile = Array.from({ length: n }, (_, k) => r._gauOrt(k - n / 2, 0).revier);
        const L = (await frage(T1, [], { lesen: zeile })).reviere;
        const mitBeute = L.find((R) => R.tiere.some((t) => t.g === "beute"));
        z.lesen = {
            reviere: L.length,
            beute: L.reduce((p, R) => p + R.koepfe.beute, 0),
            jaeger: L.reduce((p, R) => p + R.koepfe.jaeger, 0),
            // die Zeilen der Tiere sind die Köpfe; jede trägt Verband, Leib und Erbe; der Fraß je Zelle steht
            treu: L.every(
                (R) =>
                    R.tiere.length === R.koepfe.beute + R.koepfe.jaeger &&
                    R.frass.length === 16 &&
                    R.tiere.every((t) => t.id && t.v && t.kg > 0 && t.M > 0 && t.a.length && t.e.length)
            ),
            abgeaest: L.reduce((p, R) => p + R.frass.filter((o) => o < 0).length, 0),
        };
        if (!mitBeute)
            return Object.assign(z, { fehler: "die mittlere Zeile des Gaus trägt am Takt " + T1 + " keine Beute" });
        const AKT = [{ takt: T1, art: "aus", id: mitBeute.tiere.find((t) => t.g === "beute").id }];
        const stand = async (akte, opt) => (await frage(T2, akte, Object.assign({ packen: true }, opt))).stand;
        const neuerFaden = () => {
            if (r._gauFadenStand) r._gauFadenStand.worker.terminate();
            r._gauFadenStand = null;
        };
        // G3 — Faden A: ohne Akt, mit Akt; Faden B (frisch geboren): mit Akt, ohne Akt
        const [a0, a1] = [await stand([]), await stand(AKT)];
        neuerFaden();
        const [b1, b0] = [await stand(AKT), await stand([])];
        z.g3 = {
            gleich: gleich(a0, b0) && gleich(a1, b1),
            akt: !gleich(a0, a1),
            bytes: a0.length,
            hash: fnv(a0),
            hashAkt: fnv(a1),
        };
        if (TT.includes("gau-akt")) {
            const c1 = await unter(
                (m) => void (m.akte = []),
                () => stand(AKT)
            );
            z.sicht["gau-akt"] = { g3: Object.assign({}, z.g3, { akt: !gleich(a0, c1) }) };
        }
        // G4 — der Stand am Takt T1 (mit dem Akt) reist heraus; geradeaus bis T2; dann herein und weiter bis T2
        const s1 = (await frage(T1, AKT, { packen: true })).stand;
        const gerade = await stand(AKT);
        const reise = async (bytes) => {
            const h = await frage(T2, AKT, { stand: bytes, packen: true });
            return {
                gleich: gleich(gerade, h.stand),
                geradeaus: gleich(gerade, a1),
                takte: h.zeit.takte,
                soll: T2 - T1,
                bytes: s1.length,
            };
        };
        z.g4 = await reise(s1.slice());
        if (TT.includes("gau-stand")) {
            // die Fraß-Schicht sind die letzten Zahlen des Float64-Teils: je Zelle der Beute eine
            const ohne = s1.slice();
            const kopfLang = new DataView(ohne.buffer).getUint32(0, true);
            const kopf = JSON.parse(new TextDecoder().decode(ohne.subarray(8, 8 + kopfLang)));
            const ende = ((8 + kopfLang + 7) & ~7) + kopf.nD * 8;
            ohne.fill(0, ende - a.feld.zellen * 8, ende);
            z.sicht["gau-stand"] = { g4: await reise(ohne) };
        }
        // G4 AM STAND DER SEITE: der Akt tritt in die Reihe des Wirts (`_gauAkt`), das Leben des Stands trägt sie (`_lebenImStand`),
        // und nach dem Laden (`_lebenAusStand`) rechnet ein frischer Faden aus Saat und Akten bis T2 = der Lauf geradeaus (a1).
        // Was das Laden sonst setzt (Feld, Bestand, Reihe der Feld-Akte), kehrt danach zurück.
        const halt = r._gauHalt();
        const haltAlt = new Map(halt);
        const merk = [
            s.lifeField,
            s.feldAkte,
            s.faunaBestand,
            r._lebenStand,
            r._lebenWecker,
            r._annahmeOffen,
            r._feldAktGewirkt,
        ];
        halt.clear();
        r._gauAkt(0, 0, AKT[0]);
        const doppelt = r._gauAkt(0, 0, Object.assign({}, AKT[0]));
        const laden = async (v) => {
            neuerFaden();
            halt.clear();
            r._lebenAusStand(JSON.parse(JSON.stringify(v)));
            const h = await r._gauBis(0, 0, T2, { saat: 1, kg: KG, packen: true });
            return gleich(h.stand, a1);
        };
        const v = r._lebenImStand();
        const reihen = v.gaue || [];
        z.stand = {
            gleich: await laden(v),
            akte: reihen.reduce((p, g) => p + g[1].length, 0),
            doppelt,
            zeichen: JSON.stringify(reihen).length,
        };
        if (TT.includes("gau-reihe"))
            z.sicht["gau-reihe"] = {
                stand: Object.assign({}, z.stand, { gleich: await laden(Object.assign({}, v, { gaue: undefined })) }),
            };
        halt.clear();
        for (const [k, l] of haltAlt) halt.set(k, l);
        [s.lifeField, s.feldAkte, s.faunaBestand, r._lebenStand, r._lebenWecker, r._annahmeOffen, r._feldAktGewirkt] =
            merk;
        // DER WEG DES SPIELS (E6): der Wirt mit der Masse des GUSSES und der Saat des Gaus — die Geburt des Wirts (der Guss
        // zweier Leiber, einmal je Sitzung) und der Gau am Takt 1
        const w0 = performance.now();
        const wirt = r._gauWirt();
        const wirtMs = performance.now() - w0;
        const echt = await r._gauAuftrag(0, 0, 1, []);
        z.spiel = {
            kg: [rund(wirt.beute.M, 2), rund(wirt.jaeger.M, 2)],
            saat: r._gauSaat(0, 0),
            beute: echt.beute,
            jaeger: echt.jaeger,
            wirtMs: rund(wirtMs, 2),
        };
        // G5 (nur `--gau`): das Aufholen eines Gaus ohne Akte — je Jahres-Zahl ab Takt 0 bis zu ihrem Takt, die Zeit im Faden
        if (O.jahre) {
            z.aufholen = [];
            for (const j of O.jahre) {
                await frage(0);
                const t = Math.round(j * 26.25);
                const h = await frage(t);
                z.aufholen.push({
                    jahre: j,
                    takte: h.zeit.takte,
                    s: rund(h.zeit.rechenMs / 1000, 2),
                    msJeJahr: rund((h.zeit.rechenMs / t) * 26.25, 1),
                    beute: h.beute,
                    jaeger: h.jaeger,
                });
            }
        }
        z.haupt = { maxMs: rund(haupt.maxMs, 2), wo: haupt.wo, rufe: haupt.rufe };
        return z;
    });

    // ── zerfall (oeko.zerfall#1): JEDER TOD DÜNGT SEINE ZELLE — gemessen am Verhalten, nie am Namen. (A) die Altlast: die Region
    // des Tals (westlich der Ankunft, keine Zelle im Genesis-Ort) aus ihren Strömen gefüllt, dann je Ursache (Riss, Alter, Hunger)
    // ein Tier durch `_bestandStirbt`: der Nährstoff (`_naehrstoffAt`, der EINE Leser) seiner 16-m-Zelle vorher ↔ nachher, die
    // Nachbar-Zelle ↔ und derselbe Tod ein zweites Mal (nachgeholt) — er düngt nicht doppelt. (B) der Gau: die nahen Reviere
    // lesen ihre Spur aus dem Faden (`_gauBis` → `_gauAntwort`, der Ruf des Spiels); gezählt: die Tode der Spur, deren Leichnam
    // noch liegt, davon gedüngt (Leichname mit der Kennung des Gaus im Feld des Lebens, `state.aasFeld`), der Nährstoff je Kopf
    // an den Ankern, und dieselbe Antwort ein zweites Mal düngt nicht. Kein Tod schreibt eine Tat (`worldMeta.taten`: ein
    // Welt-Prozess ist Funktion der Zeit, kein Eintrag im Stand des Spielers). Die Taten der Welt, ihr Index, das Feld der
    // Leichname und das Speichern ruhen in der Bühne.
    await buehne("zerfall", async () => {
        const wm = s.worldMeta;
        aufraeumen.push(leihe(wm, { taten: [] }), leihe(s, { aasFeld: new Map() }), leihe(r, { _tatIdx: null, _sukzessionNeu: null, _nachwuchsFaellig: Infinity, _aasFrist: null })); // prettier-ignore
        decke("_scheduleEditSave", () => () => {});
        decke("_nahStreuTat", () => () => {});
        decke("_weltRegt", () => () => {});
        decke("_gauTakt", () => () => {});
        if (taeter === "zerfall-aas") decke("_aasTat", () => () => null);
        if (taeter === "zerfall-gau") decke("_gauAas", () => () => {});
        const cs = A.LIFE_FIELD.cell;
        const N = (x, z0) => +r._naehrstoffAt(x, z0).toFixed(4);
        const z = { tode: [], gau: {} };
        // (G) EIN GESETZ: derselbe Leichnam als Riss (die Tat von Spieler-Hand) und als Aas (das Feld des Lebens), gleiche Stunde,
        // gleicher Ort → derselbe Nährstoff zur Stunde 0, zur halben Dauer und zur Dauer (die Welt-Stunde der Leser um `dh` gerückt);
        // nach der Dauer heilt das Feld: der nächste Tod fegt, die Zelle ohne liegenden Leichnam ist aus ihm
        {
            const [gx, gz] = [(Math.floor(pm.x / cs) + 3.5) * cs, (Math.floor(pm.z / cs) + 0.5) * cs];
            const alt = r._weltStunde;
            const um = (dh) => leihe(r, { _weltStunde: function (uhr) { return alt.call(this, uhr) + (uhr === undefined ? dh : 0); } }); // prettier-ignore
            const riss = r._tatSchreiben("riss", gx, gz);
            const d = r._tatIndex().dauer.get(riss);
            const mess = () =>
                [0, d / 2, d].map((dh) => {
                    const zurueck = um(dh);
                    const v = r._naehrstoffAt(gx, gz);
                    zurueck();
                    return +v.toFixed(6);
                });
            const vRiss = mess();
            wm.taten = [];
            r._tatIdx = null;
            r._aasTat({ id: "probe-gesetz", x: gx, z: gz });
            const vAas = mess();
            const abw = Math.max(...vRiss.map((v, i) => Math.abs(v - vAas[i])));
            z.gesetz = { dauerH: +d.toFixed(3), riss: vRiss, aas: vAas, abw: +abw.toFixed(6) };
            const zurueck = um(d + 1e-3);
            r._aasTat({ id: "probe-feger", x: gx - 2 * cs, z: gz });
            const jetzt = r._weltStunde();
            const liegend = [...s.aasFeld].filter(([, L]) => L.some((c) => c[1] + r._tatDauer({ tat: "aas", w: c[2] }) > jetzt)).length; // prettier-ignore
            z.feld = { zellen: s.aasFeld.size, liegend, alte: s.aasFeld.has(r._lifeCellKey(gx, gz)) };
            zurueck();
            s.aasFeld.clear();
            r._aasFrist = null;
        }
        // (A) die Altlast
        const S = r._bestandSeite();
        let ix = Math.floor(pm.x / S);
        const iz = Math.floor(pm.z / S);
        const park = (k) => r._bestandFeld(k).zellen.filter((c) => r._genesisFlaeche(c.x, c.z)).length;
        // je Ursache ein Tier: die Regionen des Tals westwärts, bis jede Ursache ihren Tod hat
        const tiere = [];
        const tal = [];
        for (let n = 0; tiere.length < 3 && n < 24; n++, ix--) {
            const k0 = ix + "," + iz;
            if (park(k0)) continue;
            for (let i = 0; i < 100 && !r._bestandBereit(k0); i++) await sleep(50);
            const R = r._bestandRegion(k0, false);
            for (let k = 0; k < 360; k++) r._bestandSchritt(k0, R, true, []);
            for (const t of r._bestandFreie(R).slice(0, 3 - tiere.length)) tiere.push([R, t]);
            tal.push(k0);
        }
        const t1 = performance.now();
        for (const u of ["jagd", "alter", "hunger"]) {
            if (!tiere.length) break;
            const [R, t] = tiere.shift();
            const vor = [N(t.x, t.z), N(t.x + cs, t.z)];
            r._bestandStirbt(R, t, u, [], []);
            const nach = [N(t.x, t.z), N(t.x + cs, t.z)];
            R.tiere.push(t);
            r._bestandStirbt(R, t, u, [], []);
            const d = { u, id: t.id, g: t.g, vor: vor[0], nach: nach[0], nachbar: +(nach[1] - vor[1]).toFixed(4) };
            z.tode.push(Object.assign(d, { plus: +(nach[0] - vor[0]).toFixed(4), doppel: +(N(t.x, t.z) - nach[0]).toFixed(4) }));
        }
        z.msJeTod = z.tode.length ? +((performance.now() - t1) / (2 * z.tode.length)).toFixed(3) : null;
        z.tal = tal.join(" ");
        // (B) der Gau am Schirm
        const gz0 = performance.now();
        const T = A._bestandGesetz().B.taktS;
        const nah = r._bestandNah();
        const je = new Map();
        for (const key of nah) {
            const o = r._gauOrt(...key.split(",").map(Number));
            (je.get(o.gx + "," + o.gz) || je.set(o.gx + "," + o.gz, { o, lesen: [] }).get(o.gx + "," + o.gz)).lesen.push(o.revier);
        }
        const G = { reviere: 0, takte: 0, tode: 0, lebend: 0, gedungt: 0, naehr: 0, doppel: 0, ms: 0 };
        const stunden = A.TAT_NARBE.aas ? A.TAT_NARBE.aas.stunden : A.TAT_NARBE.riss.stunden;
        // je Zelle des Felds der Leichname die des Kopfs
        const aasZellen = (kopf) => [...(s.aasFeld || [])].filter(([, L]) => L.some(([id]) => id.startsWith(kopf)));
        const aasVon = (kopf) => aasZellen(kopf).reduce((n, [, L]) => n + L.filter(([id]) => id.startsWith(kopf)).length, 0);
        for (const { o, lesen } of je.values()) {
            lesen.sort((p, q) => p - q);
            const takt = Math.floor(s.spielZeit / T) + 300; // der Gau eine Stunde voraus: die Spur trägt die Tode ab dem Takt der Altlast
            const b = r._gauBild(o.gx, o.gz);
            b.bestellt = Math.max(b.bestellt, takt);
            const a = await r._gauBis(o.gx, o.gz, takt, { lesen });
            const kopf = r._gauKopf(o.gx, o.gz);
            const sp = a.spur;
            if (sp && sp.tod)
                for (let q = 0; q < sp.tod.length; q += 2) {
                    const n = Math.max(0, sp.tod[q]) + Math.max(0, sp.tod[q + 1]);
                    const k = sp.von + Math.floor(q / 2 / lesen.length);
                    G.tode += n;
                    if (r._weltStunde(k * T) + stunden > r._weltStunde()) G.lebend += n;
                }
            G.reviere += lesen.length;
            G.takte = Math.max(G.takte, sp ? sp.beute.length / lesen.length : 0);
            const g0 = performance.now();
            r._gauAntwort(b, a, lesen.join(), 0);
            G.ms += performance.now() - g0;
            const n1 = aasVon(kopf);
            r._gauAntwort(b, a, lesen.join(), 0);
            G.doppel += aasVon(kopf) - n1;
            G.gedungt += n1;
            const zellen = new Set(aasZellen(kopf).map(([k]) => k));
            G.zellen = (G.zellen || 0) + zellen.size;
            for (const c of zellen) {
                const [cx, cz] = c.split(",").map(Number);
                G.naehr += r._naehrstoffAt((cx + 0.5) * cs, (cz + 0.5) * cs) - 1;
            }
        }
        G.naehrJeKopf = G.gedungt ? +(G.naehr / G.gedungt).toFixed(4) : 0;
        G.ms = +G.ms.toFixed(2);
        G.fahrtMs = Math.round(performance.now() - gz0);
        G.naehr = +G.naehr.toFixed(4);
        z.gau = G;
        z.taten = (wm.taten || []).length; // kein Tod schreibt eine Tat
        return z;
    });
}
// die Leere einer Rolle, die das Gesetz der Bindung trägt (zielplan `gesetzLeer`): so wahrscheinlich bleibt sie nach dem Gesetz
// ohne Fremden — darunter ist die leere Rolle der Täter
const GESETZ_LEER = 0.01;
// das Soll der Lebens-Proben (`soll(bedingung, grund)` aus dem Urteil der Kreatur-Proben)
// B4 — die Welt-Bindung, Saat 1 (gemessen am Feld des Haupt-Fadens: `--bestand-welt`): Wolf und Beute je 4 Jahre, Land, Zellen
// der Beute und Σ K des Gaus (0, 0) der Heimat — das Soll des Gaus im Faden (G1). Am 20.11. neu gemünzt, seit der Kern den EINEN
// Strom der Welt zieht (samen-core `samenStrom` statt seines mulberry32): dieselbe Rechnung an anderen Würfen, das Feld
// gleich (Land 2240 · Zellen 10884 · Σ K 33989); vorher Wolf 27 … 58 · Beute 11339 … 14476 (18.11., Kopf 2672c409)
const GAU_B4 = {
    wolf: [24, 36, 40, 44, 62, 47, 52, 53, 57, 58],
    reh: [11449, 11776, 14053, 14199, 14143, 14012, 14157, 14239, 14387, 14135],
    feld: { land: 2240, zellen: 10884, kSumme: 33989 },
};
function lebenUrteil(name, z, soll) {
    if (name === "zerfall") {
        soll(z.tode.length >= 3, `nur ${z.tode.length} Tode der Altlast im Tal ${z.tal} (Soll je Ursache einer: Riss, Alter, Hunger)`);
        for (const d of z.tode) {
            soll(d.plus > 0, `der Tod ${d.u} düngt seine Zelle nicht (${d.g}: Nährstoff ${d.vor} → ${d.nach})`);
            soll(d.nachbar === 0, `der Tod ${d.u} düngt die Nachbar-Zelle (+${d.nachbar})`);
            soll(d.doppel === 0, `derselbe Tod ${d.u} nachgeholt düngt ein zweites Mal (+${d.doppel})`);
        }
        const G = z.gau;
        soll(G.lebend > 0, `der Gau fällt keinen Kopf in der Spur der Reviere am Schirm (${G.reviere} Reviere, ${G.takte} Takte, Tode ${G.tode})`); // prettier-ignore
        soll(
            G.gedungt === G.lebend && G.naehrJeKopf > 0,
            `Gau-Tode ohne Aas: ${G.gedungt} gedüngt von ${G.lebend} Toten, deren Leichnam liegt (Spur ${G.tode} Tode), Nährstoff je Kopf ${G.naehrJeKopf}`
        );
        soll(G.doppel === 0, `dieselbe Spur ein zweites Mal düngt ${G.doppel} Köpfe doppelt`);
        soll(z.taten === 0, `die Tode schreiben ${z.taten} Taten in worldMeta.taten — ein Welt-Prozess ist keine Tat des Spielers`);
        const Ge = z.gesetz;
        soll(
            Ge.abw === 0 && Ge.riss[0] > Ge.riss[2],
            `zwei Gesetze für denselben Leichnam: Riss ${Ge.riss.join(" → ")} ↔ Aas ${Ge.aas.join(" → ")} (Dauer ${Ge.dauerH} h, Abweichung ${Ge.abw})`
        );
        soll(
            z.feld.zellen === z.feld.liegend && z.feld.liegend > 0 && !z.feld.alte,
            `das Feld der Leichname heilt nicht: ${z.feld.zellen} Zellen, ${z.feld.liegend} mit liegendem Leichnam, die vergangene ${z.feld.alte ? "steht noch" : "fiel"}`
        );
    }
    if (name === "gau") {
        const B = GAU_B4;
        const feld = (f) => `Land ${f.land} · Zellen ${f.zellen} · Σ K ${f.kSumme}`;
        soll(
            z.wolf.join(" ") === B.wolf.join(" ") &&
                z.reh.join(" ") === B.reh.join(" ") &&
                feld(z.feld) === feld(B.feld),
            `der Gau im Faden verlässt den B4-Lauf: Wolf ${z.wolf.join(" ")} (Soll ${B.wolf.join(" ")}) · Beute ${z.reh.join(" ")} (Soll ${B.reh.join(" ")}) · ${feld(z.feld)} (Soll ${feld(B.feld)})`
        );
        const Q = z.quelle;
        soll(
            Q.gleich && Q.zellen === 576 && Q.land > 0,
            `das Feld des Gaus im Faden ist nicht das des Stamms: ${Q.zellen} Zellen um den Ursprung (Soll 576), davon Land ${Q.land}, Zelle für Zelle gleich ${Q.gleich}`
        );
        for (const m of Q.mut)
            soll(
                !m.fehler && m.stamm > 0 && m.faden > 0 && m.gleich,
                `EINE Änderung am Kern bewegt Stamm und Gau-Feld nicht gleich — ${m.wer}: ${m.fehler || `Stamm ${m.stamm} Zellen anders · Faden ${m.faden} · danach gleich ${m.gleich}`}`
            );
        const L = z.lesen;
        soll(
            L.reviere === 48 && L.beute > 0 && L.treu && L.abgeaest > 0,
            `die Lese-Naht des Gaus trägt nicht: ${L.reviere} Reviere, Beute ${L.beute}, Zeilen = Köpfe ${L.treu}, abgeäste Zellen ${L.abgeaest}`
        );
        soll(
            z.g3.gleich,
            `zwei Fäden geben nicht denselben Gau (Stand ${z.g3.hash} · mit Akt ${z.g3.hashAkt}, ${z.g3.bytes} Bytes)`
        );
        soll(z.g3.akt, `der Akt ändert den Gau nicht: der Stand mit EINEM Akt „aus“ ist der ohne (${z.g3.hash})`);
        soll(
            z.g4.gleich && z.g4.geradeaus && z.g4.takte === z.g4.soll,
            `der Stand des Gaus reist nicht: heraus, herein, weiter ≠ geradeaus (gleich ${z.g4.gleich}, geradeaus = erster Lauf ${z.g4.geradeaus}, ${z.g4.takte} von ${z.g4.soll} Takten ab dem Stand, ${z.g4.bytes} Bytes)`
        );
        soll(
            z.stand.gleich && z.stand.akte === 1 && z.stand.doppelt === false,
            `der Stand der Seite trägt die Akte des Gaus nicht: speichern, laden, weiter ≠ geradeaus (gleich ${z.stand.gleich}, ${z.stand.akte} Akt im Stand, derselbe Akt zweimal ${z.stand.doppelt}, ${z.stand.zeichen} Zeichen)`
        );
        soll(
            z.spiel.beute > 0 && z.spiel.jaeger > 0,
            `der Gau des Spiels (Masse des Gusses ${z.spiel.kg}) ist leer: Beute ${z.spiel.beute}, Wolf ${z.spiel.jaeger}`
        );
        return;
    }
    // DER ZIEL-PLAN (mensch Breite): zu jeder der fünf Stunden trägt höchstens jeder Zwanzigste kein Ziel, um 10 Uhr steht die
    // Hälfte an ihrem Werk-Ort, und jede Rolle des Plans hat einen Ort, den ein Fremder am Tag erreicht, wo das Gesetz es trägt
    if (name === "zielplan") {
        const H = Object.entries(z.je);
        soll(
            z.gesamt >= 60 && z.haeuser >= 27,
            `die Stadt ist leer: ${z.gesamt} Bewohner in ${z.haeuser} Häusern (Soll ≥ 60 in ≥ 27)`
        );
        soll(
            H.every(([, v]) => v.ohne <= 0.05),
            `Bewohner ohne Ziel: ${H.map(([h, v]) => `${h} Uhr ${Math.round(v.ohne * 100)} %`).join(" · ")} (Soll ≤ 5 % je Stunde; ${H.flatMap(([h, v]) => v.wer.slice(0, 1).map((w) => `${h} Uhr ${w}`)).join(" · ")})`
        );
        soll(
            !z.fehlt.length,
            `Lose des Plans stehen nicht: ${z.fehlt.length} von ${z.haeuser} (${z.fehlt.join(" · ")})`
        );
        soll(!z.fernN, `Stand fern von seiner Marke (Tür: Ring ${z.ringM} m, Platz: Rand ${z.platzRandM} m, Posten: Ring ${z.torRingM} m): ${z.fernN} (${z.fern.join(" · ")})`); // prettier-ignore
        // der Stand hängt nahe seiner Tür am Netz (pendler-anschluss): über das Netz höchstens umweg × Luftlinie + nahtM
        const [J, JL] = [z.jenseits, z.jenseitsLeben];
        const JR = J.n || !JL.n ? J : JL; // die Liste, die fällt: die neu gestellte zuerst, sonst die nach dem Tag
        soll(
            J.N > 0 && !J.n && !JL.n,
            `Stand jenseits der Wand: ${JR.n} von ${JR.N} Ständen vor einer Tür erreichen sie über das Netz erst nach mehr als ${z.jenseitsSoll.umweg} × der Luftlinie + ${z.jenseitsSoll.nahtM} m (${JR === J ? "die Liste neu gestellt" : "die Liste nach dem Tag"}: ${JR.erste.join(" · ")})` // prettier-ignore
        );
        soll(z.je[10].am >= 0.5, `um 10 Uhr am Werk-Ort angekommen: ${Math.round(z.je[10].am * 100)} % (Soll ≥ 50 %)`);
        // die Leere, die das Gesetz trägt (`gesetzLeer` ≥ GESETZ_LEER: der Wurf lässt die Rolle so oft ohne Fremden), fällt nicht —
        // sie steht benannt in der Zeile; jede andere leere Rolle ist der Täter
        const GL = z.gesetzLeer || {};
        const darf = ([ro, [n]]) => !n && GL[ro] >= GESETZ_LEER;
        const leer = Object.entries(z.rollen)
            .filter((e) => !e[1][0] && !darf(e))
            .map(([ro, [, m, g]]) => `${ro} (${m}, gebunden ${g}, das Gesetz lässt sie leer ${Math.round((GL[ro] || 0) * 1000) / 10} %)`); // prettier-ignore
        const gesetzLeer = Object.entries(z.rollen)
            .filter(darf)
            .map(([ro]) => `${ro} ${Math.round(GL[ro] * 1000) / 10} %`);
        soll(
            z.gesetzN > 0 && z.gesetzN >= z.gesamt,
            `das Gesetz der Bindung fragt ${z.gesetzN} Menschen von ${z.gesamt} (Soll: jeden mit Leib)`
        );
        soll(
            !leer.length,
            `Rollen ohne Ziel-Ort: ${leer.join(" · ")} — kein Fremder erreicht einen ihrer Orte (belebt ${z.zielOrte} von ${z.orte} Orten${gesetzLeer.length ? `; leer nach dem Gesetz: ${gesetzLeer.join(" · ")}` : ""})` // prettier-ignore
        );
    }
    // DAS GEHEGE (Pflicht F): der Rand hält, die Zeile ist der Bestand, die Wildnis zählt sie nicht, die Tiere leben ihren Tag
    if (name === "gehege") {
        soll(
            z.nahen === z.tiere && z.leer === 0 && z.bilder > 0,
            `das Gehege steht leer: ${z.nahen} von ${z.tiere} Leibern nach dem Nahen, ${z.leer} Bilder am Rand ohne alle ${z.tiere}`
        );
        soll(
            z.aus === 0,
            `Ausbruch: ${z.aus} von ${z.bilder} Leib-Bildern jenseits des Rands (tiefster ${z.randMin} m; Soll 0)`
        );
        soll(
            z.hieb.bilder > 0 && z.hieb.randMin < 1,
            `LEER: der Hieb trieb kein Tier an den Rand (${z.hieb.bilder} Bilder, nächstes ${z.hieb.randMin} m vor ihm; Soll < 1 m)`
        );
        soll(
            z.tod.fiel === 1 && z.tod.fort === 1,
            `LEER: der Tod nahm kein Tier aus dem Verzeichnis (gefallen ${z.tod.fiel}, das alte Tier fort ${z.tod.fort}; Soll 1 · 1)`
        );
        soll(
            z.anders === 0 && z.tod.zeile === z.tiere,
            `die Zeile ist nicht der Bestand: ${z.anders} von ${z.takte} Takten mit anderen Nummern, nach dem Tod eines Tiers trägt sie ${z.tod.zeile} von ${z.tiere}`
        );
        soll(
            z.wild === 0 && z.alterS === 0 && z.wildLesen > 0,
            `das wilde Gesetz zählt das Gehege: ${z.wild} seiner Tiere im Bestand der Region (gelesen ${z.wildLesen}-mal), gealtert ${z.alterS} s gegen den Eintritt (Soll 0 · 0)`
        );
        soll(
            Math.abs(z.budget.ruhen - z.sollRuhen) <= 0.2 * z.sollRuhen,
            `das Gehege verfehlt das Ethogramm: ruhen ${z.budget.ruhen} (Soll ${z.sollRuhen} ± 20 %; ${JSON.stringify(z.budget)})`
        );
        soll(
            z.fern === 0 && z.wieder === z.tiere && z.wiederPlatz <= 0.5,
            `das Gehege folgt dem Gast nicht: fern ${z.fern} Leiber (Soll 0), zurück ${z.wieder} (Soll ${z.tiere}), ${z.wiederPlatz} m neben ihrem Ruhe-Platz (Soll ≤ 0,5)`
        );
        soll(
            z.ankunft.vor === 0 && z.ankunft.erstes === z.tiere && z.ankunft.platz <= 0.5,
            `die Ankunft steht leer: ${z.ankunft.erstes} von ${z.tiere} Leibern im ersten Bild des Gasts, der mit dem Blick ins Gehege ankommt (davor ${z.ankunft.vor}, Soll 0; ${z.ankunft.platz} m neben ihrem Ruhe-Platz, Soll ≤ 0,5)`
        );
    }
    // DAS ERBE (leben.evolution.erbe#1): das Kind trägt das Erbe seiner Mutter — die Steigung von ln M∞ des Kinds auf die Mutter
    // liegt im Band [0,1; 0,4] (das Gesetz: h²/2 = 0,23; der Vater steht im Gau nicht im Bild) über ≥ 10 Generationen, Altlast
    // und Gau zusammen; die Mutante `kind → gruender` erbt nicht
    if (name === "erbe") {
        const [E, M] = [z.erbe, z.mutante];
        soll(
            z.gen >= 10 && E.n >= 200 && M.n >= 200,
            `zu wenig Leben für die Regression: ${z.gen} Generationen (Soll ≥ 10), ${E.n} Mutter-Kind-Paare, Mutante ${M.n} (Soll ≥ 200)`
        );
        soll(
            E.steigung >= 0.1 && E.steigung <= 0.4,
            `das Erbe reist nicht von den Eltern zum Kind (kind): Steigung ${E.steigung} ± ${E.se} an ${E.n} Mutter-Kind-Paaren (Soll 0,1–0,4, das Gesetz h²/2 = 0,23)`
        );
        soll(
            Math.abs(M.steigung) <= Math.max(0.1, 3 * M.se),
            `die Mutante kind → gruender erbt: Steigung ${M.steigung} ± ${M.se} (Soll |·| ≤ ${Math.max(0.1, 3 * M.se)})`
        );
    }
    // muster#1: die Kräfte wirken — der Riss wählt nach der Verwundbarkeit (ZEIT_JAGD jagd), gegen die Erwartung des Gesetzes an
    // jeder Wahl im Revier des Risses (wie oft ein Greis, welche Masse: je |z| ≤ 3 — der Täter „das Älteste“ nimmt fast nur
    // Greise); Wölfe im Lauf, keiner im Gegenlauf; das Vorzeichen von Δ ln M̄ ist Befund, kein Soll
    if (name === "muster") {
        const Rz = z.riss;
        soll(Rz.n >= 30, `der Riss wählte ${Rz.n}-mal unter ≥ 2 Beuten (Soll ≥ 30, vakuös)`);
        soll(
            z.saaten.every((q) => q.an.woelfe > 0 && q.aus?.woelfe === 0 && q.an.hirsch > 0 && q.aus.hirsch > 0),
            `der Gegenlauf trägt keinen Unterschied: ${JSON.stringify(z.saaten.map((q) => [q.an.woelfe, q.aus?.woelfe, q.an.hirsch, q.aus?.hirsch]))} (Wölfe an > 0, aus 0; Hirsche > 0)`
        );
        soll(
            Math.abs(Rz.aeltestZ) <= 3 && Math.abs(Rz.kgZ) <= 3,
            `der Riss wählt sein Opfer nicht nach der Verwundbarkeit (ZEIT_JAGD jagd): ${Rz.aeltest} von ${Rz.n} ein Greis (Soll ${Rz.aeltestSoll}, ${Rz.aeltestRel}, z ${Rz.aeltestZ}), Masse ${Rz.kgRel} gegen die Erwartung (z ${Rz.kgZ}; Soll je |z| ≤ 3)`
        );
        soll(z.wanduhrMaxS <= 60, `ein Lauf von ${z.takte} Takten dauert ${z.wanduhrMaxS} s (Soll ≤ 60 s)`);
        // DIE GRÖSSE BLEIBT IM GESETZ: mit und ohne Räuber trägt höchstens jeder zwanzigste reife Hirsch ein M∞ jenseits der
        // Spanne des Gesetzes (+4σ, bs 1,31) — die Nische (`eignung`) und das Wurf-Gewicht halten die Art im Gau
        const weg = z.saaten.flatMap((q, i) => [["an", q.an], ["aus", q.aus]].filter(([, l]) => l && !(l.ueberSpanne <= 0.05)).map(([k, l]) => `Saat ${i + 1} ${k}: ln M̄ ${l.lnM}, ${l.ueberSpanne} jenseits`)); // prettier-ignore
        soll(
            !weg.length,
            `die Größe läuft davon (Rückkraft eignung · Wurf-Gewicht): ${weg.join(" · ")} (Soll ≤ 0,05 der reifen Hirsche jenseits der Spanne)`
        );
    }
    if (name === "kaskade") {
        soll(
            z.kappe === 0,
            `der Bestand bricht über seine Nahrung aus: ${z.kappe} Takte über 3 × K (Soll 0 — die Nahrung begrenzt, die Kappe zeichnet nur)`
        );
        const T = z.hungertod;
        const [leichtRel, kgRel] = [T.leicht / Math.max(1e-9, T.pLeicht) - 1, T.kg / Math.max(1e-9, T.kgSoll) - 1];
        soll(
            T.n >= 1 &&
                T.trauer === T.n &&
                T.journal === T.n &&
                T.bestand >= 30 &&
                Math.abs(leichtRel) <= 0.1 &&
                Math.abs(kgRel) <= 0.05,
            `der Hungertod nimmt nicht, wem die Reserve zuerst ausgeht (Risiko 1/fastenRang), trauert nicht oder schreibt kein Journal: ${T.bestand} Wahlen im Bestand (Soll ≥ 30), das Leichteste ${T.leicht}-mal gegen ${Math.round(T.pLeicht)} erwartet (${leichtRel.toFixed(3)}, Soll |·| ≤ 0,1), Masse ${kgRel.toFixed(3)} gegen die Erwartung (Soll |·| ≤ 0,05); gezeichnet ${T.n}, ${T.trauer} betrauert, ${T.journal} im Journal`
        );
        const paare = z.saaten.flatMap((je, i) =>
            Object.entries(je).map(([g, [a, e]]) => ({ wo: `Saat ${i + 1} ${g} ${a} → ${e}`, a, e }))
        );
        const da = paare.filter((p) => p.a >= 1).length;
        const bruch = paare.filter((p) => (p.a >= 1 ? !(p.e >= p.a / 3 && p.e <= 3 * p.a) : p.e > 3));
        soll(
            z.saaten.length >= 8 && da >= 16 && !bruch.length,
            `der Bestand bricht aus oder stirbt aus: ${bruch.map((p) => p.wo).join(" · ") || da + " Bestände in " + z.saaten.length + " Saaten"} (Soll je Gattung in [⅓×, 3×], 8 Saaten)`
        );
        // DER BESTAND (oekologie.K2#2)
        const B = z.bestand;
        const bruchB = B.nahrung.filter((o) => !(o.grund >= 1 && o.effekt <= -0.15 && o.ki[1] < 0));
        soll(
            B.nah >= 2 && B.takte > 0 && !B.anders && B.leiber[0] <= 20 && B.leiber[1] <= 10 && !B.fremd,
            `die Kappe am Schirm ändert den Bestand (Soll: dieselben Tiere bei halber Kappe): ${JSON.stringify(B)}`
        );
        soll(!bruchB.length, `die halbe Nahrung senkt den Bestand nicht an jedem Ort: ${JSON.stringify(bruchB)}`);
        // DIE DICHTE (tiere.K5: der Geher trifft Tiere; die Karte verlangt 150 im 500-m-Ring, 1,9 je ha — und mehr als die Kappe 20)
        soll(B.zahl >= 1.5 * B.ha, `der Bestand ist dünn: ${B.zahl} Köpfe auf ${B.ha} ha (Soll ≥ 1,5 je ha)`);
        // die junge Welt: die Altlast holt ihre Stunde nach, der Gau steht mit dem Gründer-Bestand
        soll(
            z.jung.alt >= 1 && z.jung.gau >= B.ha,
            `die junge Welt ist leer: ${z.jung.alt} Tiere der Altlast (Soll ≥ 1) und ${z.jung.gau} des Gaus (Soll ≥ ${B.ha}) an der Welt-Uhr 0`
        );
        soll(B.nahrung.length >= 8 && B.nahrung.every((o) => o.grund >= 1), "fern lebt keine Zahl");
        soll(B.ms <= 5.8, `der Lebenszyklus kostet p95 ${B.ms} ms je Takt (Soll ≤ 5,8 ms, der CPU-Takt des Bands)`);
        soll(B.msGau <= 2, `die Antwort des Gaus kostet p95 ${B.msGau} ms (Soll ≤ 2 ms: acht Reviere werden das Bild)`);
        const fehlt = ["hirsche", "jungwuchs", "woelfe", "nahrung", "nahrungGau", "mutante"].filter(
            (k) => !z.richtungen[k]
        );
        soll(!fehlt.length, `der Kaskade fehlt ein Szenario: ${fehlt.join(", ")}`);
        for (const [k, q] of Object.entries(z.richtungen))
            soll(
                q.haelt === (k !== "mutante"),
                `die Kaskade ${k}: ${q.effekt} [${q.ki}] gegen den Grundlauf (Soll ${q.soll}${k === "mutante" ? ", ohne Fraß-Leser ROT" : ""})`
            );
    }
    if (name === "folgen") {
        soll(z.bindung[0] > 0 && z.bindung[1] > z.bindung[0], `die Geste bindet nicht: bond ${z.bindung}`);
        soll(
            z.proben >= 600 && z.aufgabe === z.proben && z.abstand.p95 <= 10,
            `das gebundene Tier folgt nicht: ${z.aufgabe} von ${z.proben} s in der Aufgabe, Abstand p95 ${z.abstand.p95} m, max ${z.abstand.max} m (Soll p95 ≤ 10 m über 600 s)`
        );
        const W = z.hindernisse.filter((h) => h.art !== "sockel");
        const bruch = W.filter((h) => !(h.kontakt > 0 && h.drin === 0 && h.quer === 0 && h.vornMinM > 0));
        soll(
            W.length >= 3 && !bruch.length,
            `die Hindernisse halten nicht: ${bruch.map((h) => `${h.art === "haus" ? "in der gedrehten Wand" : "in der Wand"} ${h.drin} Takte, ${h.quer}× quer hindurch, die Schnauze ${-h.vornMinM} m, ${h.kontakt} Schübe`).join(" · ")}`
        );
        const S = z.hindernisse.find((h) => h.art === "sockel") || { ueber: 0 };
        soll(S.ueber >= 30, `der Hirsch kommt nicht über den Sockel (${S.ueber} Takte, vakuös)`);
        soll(
            !S.imSockel,
            `das Tier steht im Sockel: ${S.imSockel} von ${S.ueber} Takten über ihm, bis ${S.tiefMaxM} m tief (Oberkante ${S.stufeM} m über dem Boden)`
        );
        soll(z.strahlenJeTakt === 0, `${z.strahlenJeTakt} Feld-Strahlen je Takt im Kreatur-Takt (Lehre 25)`);
        soll(z.leibRufe > 0, `der Hüllen-Kontakt liest keinen benannten Leib (_kreaturLeib: ${z.leibRufe} Rufe)`);
        soll(
            z.spielerWand === 0,
            `${z.spielerWand} Takte des Tiers schrieben die Parkour-Wand des Spielers (state._wandKontakt*)`
        );
        soll(
            z.gegenlauf.abstandM >= 30,
            `das ungebundene Tier folgt auch (${z.gegenlauf.abstandM} m nach 2 min, vakuös)`
        );
        soll(
            z.froh.unterwegs >= 1800 && z.froh.gehalten === 0,
            `das Gemüt hält das frohe folgende Tier an: ${z.froh.gehalten} von ${z.froh.unterwegs} Takten unterwegs mit einer haltenden Aktion (Soll 0 von ≥ 1 800; Abstand p95 ${z.froh.abstandP95} m)`
        );
        soll(z.froh.spiel >= 1, `am Ziel spielt das frohe Tier nicht: ${z.froh.spiel} Aktionen in 30 s Stand`);
    }
    if (name === "tagesbudget") {
        // DAS ETHOGRAMM (±20 % je Tätigkeit; was die Gattung nicht tut, tut sie nie)
        for (const [g, S] of Object.entries(z.soll))
            for (const [k, v] of Object.entries(S)) {
                const ist = z.budget[g][k];
                soll(
                    v > 0 ? Math.abs(ist / v - 1) <= 0.2 : ist <= 0.01,
                    `das Tages-Budget verfehlt das Ethogramm (${g} ${k}): ${ist} gegen ${v} (±20 %)`
                );
            }
        soll(Object.keys(z.soll).length >= 4, `nur ${Object.keys(z.soll).length} Gattungen im Tag (vakuös)`);
        soll(
            z.ruhe[0] >= 1000 && z.ruhe[1] < 0.03 * z.ruhe[0],
            `${((100 * z.ruhe[1]) / z.ruhe[0]).toFixed(1)} % bewegt während ruhen (${z.ruhe[0]} Takte)`
        );
        soll(
            z.truenke.length >= 12 && z.truenke.every((n) => n >= 1) && z.amWasser === z.truenke.reduce(addiere, 0),
            `kein Tier trinkt aus Durst: Trünke ${z.truenke}, ${z.amWasser} am Wasser`
        );
        soll(z.durstAus === 0, `das Trinken folgt dem Durst nicht: ohne Durst ${z.durstAus} Trünke`);
    }
    if (name === "lebensraum") {
        // DER RAND DES BLICKS: der Leib im Bild weicht dem Akt an der vollen Kappe nie, außer Blick weicht er
        const RB = z.rand || {};
        soll(RB.punktImBlick === false && RB.leibAusser === false, `LEER: kein Leib am Rand des Blicks: ${JSON.stringify(z.rand)}`); // prettier-ignore
        soll(!RB.wich, `ein Leib wich dem Akt vor dem Auge — sein Fuß-Punkt 0,2 m draußen (${JSON.stringify(RB)})`);
        soll(RB.wich || RB.fernWich, "der Leib außer Blick wich dem Akt an der vollen Kappe nicht (vakuös)");
        soll(z.minM >= 0.99 * z.fernMin, `Geburt ${z.minM} m vor dem Spieler (Soll ≥ ${z.fernMin} m)`);
        soll(z.imBlick === 0, `${z.imBlick} Geburten im Blick`);
        soll(
            z.gruppen >= 10 && z.gattung.wolf && z.gattung.deer,
            `keine Gruppe: ${z.gruppen} von ${z.geburten} Würfen`
        );
        soll(z.fensterMax <= z.fensterRaum, `ein Tier ${z.fensterMax} Paar-Räume vom Nächsten seiner Gruppe`);
        soll(z.journal === z.geburten, `${z.geburten - z.journal} Würfe ohne growth-Eintrag ihrer Gruppe`);
        for (const [wo, L] of [
            ["", z],
            ["Gegenprobe ", z.gegen || { fehler: "die Gegenprobe in einer Welt anderer Saat lief nicht" }],
        ]) {
            if (L.fehler) soll(false, wo + L.fehler);
            else
                soll(
                    L.n >= 150 &&
                        Object.keys(L.gattung).length >= 3 &&
                        L.anteil >= 0.9 &&
                        L.saat !== (wo ? z.saat : null),
                    `${wo}Geburten außerhalb des Lebensraums: ${L.drin} von ${L.n} (Soll ≥ 0,9; ${JSON.stringify(L.gattung)}, Saat ${L.saat})`
                );
        }
        const gb = z.gegen?.baer || { fluss: [0, 0], sonst: [0, 0] };
        const [F, N] = ["fluss", "sonst"].map((k) => [z.baer[k][0] + gb[k][0], z.baer[k][1] + gb[k][1]]);
        soll(
            F[0] >= 10 && N[0] >= 10 && F[1] > 0 && F[1] / F[0] >= (2 * N[1]) / N[0],
            `der Bär sucht den Fluss nicht: am Fluss ${F[1]}/${F[0]} Würfe ein Bär, abseits ${N[1]}/${N[0]} (Soll ≥ 2×)`
        );
    }
    if (name !== "furcht") return;
    const { kontrolle: K, geschlagen: G, gefuettert: F, gebunden: B, baerRuhig, baerZornig, baerFrieden } = z.erinnert;
    const { wolf: W, fuchs: Fu } = z.erinnert;
    soll(
        [...G.erinnerungen, ...F.erinnerungen].every((n) => n >= 1),
        `das Gedächtnis reist nicht über den Speicherstand: geschlagen ${G.erinnerungen}, gefüttert ${F.erinnerungen}`
    );
    soll(K.medianM >= 5, `der Kontroll-Hirsch hält keinen Abstand (Median ${K.medianM} m, vakuös)`);
    // DER MENSCH IST DER SUPER-RÄUBER (leben.tiere.mensch S1): das Wild flieht den gehenden Fremden jenseits der Witterung der
    // Aura (VERHALTEN.furcht.noticeRadius) — vorher floh der Hirsch erst bei 14 m, Wolf und Bär nie
    soll(
        [K, baerRuhig, W, Fu].every((R) => R.fluchtM > z.witterungM),
        `das Wild flieht den Menschen nicht: Hirsch ab ${K.fluchtM} m, Bär ${baerRuhig.fluchtM} m, Wolf ${W.fluchtM} m, Fuchs ${Fu.fluchtM} m (Soll > ${z.witterungM} m)`
    );
    soll(
        G.fluchtM >= 2 * K.fluchtM,
        `das Wesen vergisst, wer es schlug: es flieht ab ${G.fluchtM} m gegen ${K.fluchtM} m der Kontrolle (Soll ≥ 2×)`
    );
    soll(
        F.medianM <= 0.5 * K.medianM && F.naeherM >= 2 && F.fluchtM <= 0.5 * K.fluchtM,
        `das gefütterte Wesen nähert sich nicht: ${F.medianM} m (Soll ≤ ½×), selbst ${F.naeherM} m näher (Soll ≥ 2 m), flieht ab ${F.fluchtM} m (Soll ≤ ½×)`
    );
    soll(
        B.medianM <= 0.8 * K.medianM && B.fluchtM <= 0.8 * K.fluchtM,
        `die Bindung macht nicht mutig: ${B.medianM} m, flieht ab ${B.fluchtM} m`
    );
    soll(
        baerZornig.fluchtM >= 2 * baerRuhig.fluchtM && baerFrieden.fluchtM <= 0.5 * baerZornig.fluchtM,
        `die Aura treibt die Furcht nicht: der Bär flieht ruhig ab ${baerRuhig.fluchtM} m, zornig ${baerZornig.fluchtM} m, im frieden ${baerFrieden.fluchtM} m`
    );
    const O = z.ort;
    soll(O.gegenlauf >= 0.2, `das Rudel steht im Gegenlauf nicht am Riss-Ort (${O.gegenlauf}, vakuös)`);
    soll(
        O.aufenthalt <= 0.5 * O.gegenlauf,
        `die Herde meidet den Riss nicht: Aufenthalt ${O.aufenthalt} gegen ${O.gegenlauf} ohne Feld-Furcht (Soll −50 %)`
    );
    const Br = z.brand;
    soll(Br.herde === 3, `der Herd fängt an ${Br.herde} von 3 Orten neben der Herde (vakuös)`);
    soll(
        Br.flieht >= 0.8 && Br.gegenlauf === 0,
        `die Glut ist keine Bedrohung: binnen 10 s fliehen ${Br.flieht} der Herde 15 m vom Herd (${Br.je}; Soll ≥ 0,8), ohne Brand ${Br.gegenlauf} (Soll 0)`
    );
}
const lebenQuelle = lebenBuehnen.toString();
module.exports = {
    BUEHNEN: `await (${lebenQuelle})();`,
    PROBEN: ["furcht", "lebensraum", "tagesbudget", "kaskade", "folgen", "gehege", "erbe", "muster", "gau", "zerfall"],
    // die Probe mit EINEM Lauf im Selbsttest (alle Täter in ihm, das Urteil je Täter an seiner Sicht)
    EIN_LAUF: ["gau"],
    TAETER: {
        gau: [
            ["gau-feld", /EINE Änderung am Kern bewegt Stamm und Gau-Feld nicht gleich/],
            ["gau-akt", /der Akt ändert den Gau nicht/],
            ["gau-stand", /der Stand des Gaus reist nicht/],
            ["gau-reihe", /der Stand der Seite trägt die Akte des Gaus nicht/],
        ],
        erbe: [["erbe-kind", /das Erbe reist nicht von den Eltern zum Kind \(kind\)/]],
        zerfall: [
            ["zerfall-aas", /der Tod \w+ düngt seine Zelle nicht[\s\S]*Gau-Tode ohne Aas/],
            ["zerfall-gau", /Gau-Tode ohne Aas: 0 gedüngt/],
        ],
        muster: [
            ["riss-aeltester", /nicht nach der Verwundbarkeit \(ZEIT_JAGD jagd\)/],
            ["rueckkraft", /die Größe läuft davon/],
        ],
        gehege: [
            ["gehege-rand", /Ausbruch: [1-9]/],
            ["gehege-term", /das wilde Gesetz zählt das Gehege: [1-9]/],
            ["gehege-zeile", /die Zeile ist nicht der Bestand: [1-9]/],
            ["gehege-ankunft", /die Ankunft steht leer: [0-2] von/],
        ],
        zielplan: [
            ["zielplan-planlos", /Bewohner ohne Ziel/],
            ["zielplan-einort", /Rollen ohne Ziel-Ort/],
            ["zielplan-fremd", /Stand fern von seiner Marke.*m von haus#/],
            ["zielplan-platzfern", /Stand fern von seiner Marke.*m vom Platz/],
            ["zielplan-torfern", /Stand fern von seiner Marke.*m vom Posten an tor#/],
            ["zielplan-los", /steht nicht: fiel still/, []],
            ["zielplan-jenseits", /Stand jenseits der Wand: [1-9]/, []],
        ],
        tagesbudget: [
            ["durst", /kein Tier trinkt aus Durst/],
            ["tagesbudget-ruhe", /verfehlt das Ethogramm \(\w+ ruhen\)/],
            ["tagesbudget-sonne", /verfehlt das Ethogramm/],
            ["nacht", /bewegt während ruhen/],
        ],
        kaskade: [
            ["kaskade-riss", /die Kaskade hirsche/],
            ["kaskade-park", /Tal liegt im Genesis-Ort: [1-9]/],
            ["bestand-nahrung", /die Kaskade nahrung:/],
            ["bestand-deckel", /über seine Nahrung aus/],
            ["bestand-kappe", /die Kappe am Schirm ändert den Bestand/],
            ["bestand-fern", /fern lebt keine Zahl/],
            ["bestand-duenn", /der Bestand ist dünn/],
            ["bestand-jung", /die junge Welt ist leer/],
        ],
        folgen: [
            ["folgen", /das gebundene Tier folgt nicht/],
            ["folgen-wand", /die Hindernisse halten nicht/],
            ["folgen-spiel", /das Gemüt hält das frohe folgende Tier an/],
            ["folgen-ernst", /am Ziel spielt das frohe Tier nicht/],
            ["hindernis", /Feld-Strahlen/],
            ["hindernis-leib", /benannten Leib/],
            ["sockel", /steht im Sockel/],
            ["gedreht-kontakt", /Parkour-Wand des Spielers/],
            ["gedreht-rahmen", /gedrehten Wand/],
        ],
        lebensraum: [
            [
                "lebensraum",
                /Geburten außerhalb des Lebensraums[\s\S]*Gegenprobe Geburten außerhalb[\s\S]*der Bär sucht den Fluss nicht/,
            ],
            ["geburt", /vor dem Spieler/],
            ["geburt-einzeln", /keine Gruppe/],
            ["weichen-rand", /ein Leib wich dem Akt vor dem Auge/],
        ],
        furcht: [
            ["furcht-gedaechtnis", /vergisst, wer es schlug[\s\S]*nähert sich nicht/, ["erinnert"]],
            ["furcht-ort", /meidet den Riss nicht/, ["ort"]],
            ["furcht-mensch", /das Wild flieht den Menschen nicht/, ["erinnert"]],
            ["furcht-speicher", /reist nicht über den Speicherstand/, ["erinnert"]],
            ["furcht-aura", /die Aura treibt die Furcht nicht/, ["erinnert"]],
            ["brand-flucht", /die Glut ist keine Bedrohung/, ["brand"]],
        ],
    },
    urteil: lebenUrteil,
};
if (require.main !== module) return;
// DIE AKTE DES ERBES (leben.evolution.erbe#1 · muster#1): `--akte [--saaten 30]` fährt die Proben erbe und muster headless an
// n Saaten (dieselben Bühnen wie gate:kreatur-takt, dort eine Saat) und schreibt ihre Zahlen — das Urteil bleibt beim Tor
if (process.argv.includes("--akte")) {
    const { statikServer, nullWelt, hauptLauf, argOpt } = require("./lib/welt-boot.cjs");
    const { KREATUR_PROBEN_SRC, urteil } = require("./lib/kreatur-proben.cjs");
    const saaten = Number(argOpt("--saaten", "30"));
    hauptLauf(async () => {
        const server = statikServer();
        const port = Number(process.env.KREATUR_TAKT_PORT || 4478);
        const { browser, page } = await nullWelt(
            server,
            { port, frist: 3600000 },
            120000,
            "index.html",
            "networkidle0"
        );
        page.setDefaultTimeout(3500000);
        try {
            await page.evaluate(() => window.__weltDa((r) => r.state.voxelWorkerReady));
            await page.evaluate(() => window.__weltStehtNach(() => r._gameLoopTick(performance.now())));
            const t0 = Date.now();
            const aus = await page.evaluate(
                (src, o) => (0, eval)("(" + src + ")")(r, window.THREE, o),
                KREATUR_PROBEN_SRC,
                { proben: ["erbe", "muster"], saaten }
            );
            for (const p of ["erbe", "muster"]) {
                const u = urteil(p, aus[p]);
                console.log(`${u.ok ? "✅" : "❌"} ${p} ${JSON.stringify(aus[p])}${u.ok ? "" : "\n   ↳ " + u.grund}`);
            }
            console.log(`AKTE ${saaten} Saaten, Wanduhr ${Math.round((Date.now() - t0) / 1000)} s`);
        } finally {
            await browser.close();
            server.close();
        }
    });
    return;
}
const { pruefer, urteilEnde, jsonKlon, path, ROOT: root } = require("./lib/welt-boot.cjs");
const { errs, check } = pruefer();

// ── Kern laden (Namensraum-Muster: self/globalThis) ──
global.self = global;
require(path.join(root, "tetrapoda-core.js"));
const core = global.__tetrapodaCore;

const V = core?.VERHALTEN || null;

// ── die Seele in sich: die Aktionen jeder Stimmung prüft gate:studio-vertrag (§B6+), hier der Takt alle=[min,max] ──
if (V) {
    check(
        "je Stimmung alle=[min,max] (min ≤ max)",
        Object.entries(V.stimmung).every(([k, z]) => k === "schwellen" || (z.alle && z.alle[0] <= z.alle[1]))
    );
    // die Felder der Haltung sind die des Kerns (MOTION, je Stimmung dieselben) — keine Abschrift
    const bekannt = new Set(Object.keys(core.MOTION.idle));
    const fremd = [];
    for (const name in V.aktionen) {
        const p = V.aktionen[name].profil;
        if (!p) continue;
        for (const k in p) if (!bekannt.has(k)) fremd.push(name + ":" + k);
    }
    check("Aktions-Profile nutzen nur bekannte MOTION-Felder", fremd.length === 0, fremd.join(","));
    // (die Blöcke des Buchs prüft der EINE Leser _verhaltenGesetz beim Boot, die Rezepte der Umschlag: gate:studio-vertrag)
}
// ── die Größe ist das Gesetz des Lebens (leben-core `__lebenCore`, leben-erbe): die Spanne des Gesetzes umschließt das Art-Mittel
// (das Neugeborene unten, das größte Erwachsene bei +4σ oben) — bis leben-erbe vier Größen-Bänder im Buch der Tiere ──
require(path.join(root, "leben-core.js"));
// der EINE Strom der Welt (samen-core `samenStrom`), den der Wirt dem Kern reicht — wie Seite und Faden
require(path.join(root, "samen-core.js"));
const SAMEN_STROM = global.__samenCore.samenStrom;
const LK = global.__lebenCore;
const sp = LK && LK.spanne();
check(
    "Spanne des Lebens-Gesetzes [Neugeborenes < 1 < größtes Erwachsenes]",
    !!sp && sp[0] > 0 && sp[0] < 1 && sp[1] > 1
);

// ── DER BESTAND IST DAS GESETZ (leben-core `bestand`: das Gesetz der Zeit und der Jagd, sieben Sätze — Blatt und Läufe 1–4 im
// Zweig koordination, vision/leben). Der Kern rechnet LAUF 4 des Spikes zahlengleich nach; die Welt von Lauf 4 (das Feld des
// Spikes) und die Arten (tetrapoda) reicht dieser Treiber als Leser hinein, der Kern hält weder Feld noch Gattung.
//   das Tor      Saat 1 · 2, Jahre 0–40: die Spur von Wolf und Beute je 4 Jahre gegen die VORLAGE (`ergebnis-zeit-4.json` des
//                Spikes, nie aus dem Kern; seit 20.11. zieht der Kern den EINEN Strom der Welt statt des mulberry32 des Spikes —
//                die Spur ist dieselbe Rechnung an anderen Würfen, einmal am Kern neu gemünzt: Wolf 48–77 → 50–79, Beute ~17 400;
//                die S-Zeilen unten bleiben die Zahlen des Spikes, `--bestand` liest sie seither als Vergleich, nicht als Gleichheit), dazu der Mutant (V½ des Satzes 3: 246 → 300 muss die Spur verlassen; das Gesetz als Wert gereicht, kein Quelltext gelesen)
//   --bestand    der volle Lauf (8 Saaten × 160 Jahre, ohne und mit Wolf, die S13-Zweige): S1–S15 Vorlage ↔ Kern
//   --bestand --vorlage <zeit-kern-4.cjs> [--jahre 40]   Kern und Vorlage im Gleichschritt: Köpfe je Takt, ms je Jahres-Schritt
const LAUF4 = {
    soll: {
        S1: { wert: "8 von 8", jeSaat: [68, 80, 61, 66, 74, 56, 63, 69] },
        S2: { wert: 3.9865, jeSaat: [4.0013, 4.0579, 3.9253, 3.9355, 4.0322, 3.9131, 3.9669, 4.0596] },
        S3: { wert: 0.0841, jeSaat: [0.0885, 0.0918, 0.0935, 0.0739, 0.0685, 0.077, 0.0927, 0.0868] },
        S4: { wert: 0.8613, jeSaat: [0.8479, 0.8404, 0.8462, 0.883, 0.8924, 0.8802, 0.8459, 0.8545] },
        S5: { wert: 0.6046, jeSaat: [0.6053, 0.6049, 0.6051, 0.6037, 0.6009, 0.6043, 0.6087, 0.6042] },
        S6: { wert: 1.4844, jeSaat: [1.4789, 1.4524, 1.4569, 1.5519, 1.5316, 1.5442, 1.4373, 1.4223] },
        S7: { wert: 0.4786, jeSaat: [0.4767, 0.4762, 0.4732, 0.4828, 0.4872, 0.4819, 0.4731, 0.4775] },
        S8: { wert: 0.0011, jeSaat: [0.0014, 0.0013, 0.0011, 0.0009, 0.0007, 0.0008, 0.0014, 0.0011] },
        S9: { wert: 0.0134, jeSaat: [0.0131, 0.011, 0.0105, 0.0127, 0.0148, 0.0173, 0.017, 0.011] },
        S10: { wert: "0 · 0", jeSaat: ["0·0", "0·0", "0·0", "0·0", "0·0", "0·0", "0·0", "0·0"] },
        S11: { wert: 1.0047, jeSaat: [1.1236, 1.1078, 0.9399, 0.7154, 0.8641, 1.0376, 1.2625, 0.9864] },
        S12: { wert: 0.9689, jeSaat: [0.9683, 0.9724, 0.9691, 0.9698, 0.9665, 0.9654, 0.9723, 0.9674] },
        S13: {
            wert: "Fall 38.3 % (7 von 8 Saaten ≥ 25 %) · Beute 98.5 % (8 von 8 ≥ 85 %) · lebt 8 von 8",
            jeSaat: [
                "33%/98%/lebt",
                "45%/101%/lebt",
                "35%/97%/lebt",
                "47%/100%/lebt",
                "48%/98%/lebt",
                "38%/99%/lebt",
                "39%/97%/lebt",
                "23%/99%/lebt",
            ],
        },
        S14: {
            wert: "D 0,9–1,2: 0.0328 GRÜN (21279.2 Rudel-Jahre) · D ≥ 1,5: 0.8385 ROT (161.4 Rudel-Jahre) · D ≤ 0,6: -4.3839 GRÜN (16 Rudel-Jahre)",
            jeSaat: [],
        },
        S15: {
            wert: 250.8978,
            jeSaat: [249.9186, 246.4353, 254.7589, 254.0979, 248.0043, 255.5524, 252.0837, 246.3311],
        },
    },
    spur: {
        1: {
            wolf: [24, 49, 49, 65, 69, 65, 60, 65, 60, 59, 50],
            reh: [11820, 14684, 17024, 17022, 16853, 16754, 17342, 17646, 17621, 17348, 17690],
        },
        2: {
            wolf: [23, 43, 55, 78, 78, 56, 68, 79, 69, 55, 68],
            reh: [11816, 15114, 17213, 16727, 16499, 16944, 17058, 17082, 17340, 17256, 17401],
        },
    },
};
function bestandTreiber(T, L, gesetz) {
    const B = T.BESTAND_GESETZ;
    const TG = T.VERHALTEN.temperament.gattung;
    const dietVon = (g) => {
        const d = T.GATTUNGEN[g];
        const x = d && (d.dials ? d.dials.diet : d.diet);
        if (!Number.isFinite(x)) throw new Error("bestand: GATTUNGEN." + g + ".diet fehlt");
        return x;
    };
    const DIET = { deer: dietVon("deer"), wolf: dietVon("wolf") };
    // „jagt mit“ ist das Temperament „wild“ des Tier-Buchs: für den Fleischfresser genau kg ≥ jagdKg (temperamentDerGattung)
    if (!(DIET.wolf >= TG.fleischDiet))
        throw new Error("bestand: der Wolf ist kein Fleischfresser — jagdKg trägt sein Temperament nicht");
    const TJ = L.gesetz().refS / B.taktS / L.zeitJagd().jahreRef;
    const SEITE = B.revierM * Math.sqrt(Math.PI);
    const M_ART = { deer: 94.24042032034154, wolf: 64.01114942302421 }; // die Masse des Gusses, wie Lauf 4 sie trug
    const HA = (SEITE / 4) ** 2 / 1e4;
    const K = L.bestand(
        {
            taktS: B.taktS,
            samen: SAMEN_STROM,
            revierSeiteM: SEITE,
            // das Feld des Gaus (C2a): 16 Zellen je Revier, die Zahlen von LIFE_FIELD (Zerfall, Klemme), K je Zelle = die Formel des Stamms
            feld: {
                zellen: 16,
                zerfallJeS: 0.008,
                epsilon: 0.004,
                kahl: -1,
                max: 0.7,
                kopfJeHa: B.kopfJeHa,
                kZelle: (aes, lr) => lr * HA * T.bestandNahrung(DIET.deer, aes, 0),
            },
            beute: {
                M: M_ART.deer,
                verband: T.VERHALTEN.herde.wurf.deer,
                frassJeJahr: T.bestandFrass(DIET.deer, B) * TJ,
            },
            jaeger: {
                M: M_ART.wolf,
                verband: T.VERHALTEN.herde.wurf.wolf,
                beuteMasse: T.VERHALTEN.jagd.beuteMasse,
                jagdKg: TG.jagdKg,
            },
        },
        gesetz
    );
    // DIE WELT VON LAUF 4 — das Feld des Spikes als Leser: 16 Zellen je Revier, 9 von 16 tragen Äsung 0,2–0,42 (Wiese), darüber
    // das Leben-Overlay des Felds (Halbwert 8,66 Takte); vor dem Schritt zerfällt es und K liest die Äsung (takt), nach dem
    // Schritt äst die Herde den Fraß des Kerns hinein (aesen). Dieselbe Welt für jede Saat.
    // `quelle` (B4, `--bestand-welt`): das Feld einer ECHTEN Welt statt des Spike-Felds — je Revier die Zellen mit Lebensraum (C),
    // ihr Substrat (S) und ihr Lebensraum je Zelle (LR); ohne `quelle` rechnet jede Zeile wie zuvor (Lauf 4 zahlengleich).
    // DIE RECHNUNG DES FELDS LEBT IM KERN (C2a: leben-core `gauFeld` · `feldTakt` · `feldAesen` — Zerfall, K je Revier, Fraß); der
    // Treiber reicht nur die Zellen: S (Substrat) und LR (Lebensraum, 0 = keine Zelle der Beute), dicht ab der ersten Stelle.
    function welt(W, H, von, quelle) {
        const [n, Z] = [W * H, 16];
        let F = von ? von.F : null;
        if (!F) {
            const [S, LR] = [new Float64Array(n * Z), new Float64Array(n * Z)];
            if (quelle) (S.set(quelle.S), LR.set(quelle.LR));
            else {
                const LR0 = T.lebensraum("deer", "wiese", T.LEBENSRAUM_GESETZ);
                const fr = L.strom(1, 0, 9, W * 1000 + H, SAMEN_STROM);
                for (let i = 0; i < n; i++) {
                    let c = 0;
                    for (let k = 0; k < Z; k++) {
                        const [u, s] = [fr(), fr()];
                        if (u < 9 / 16) ((S[i * Z + c] = 0.2 + s * (0.42 - 0.2)), (LR[i * Z + c++] = LR0));
                    }
                }
            }
            F = K.gauFeld({ W, H, S, LR });
        }
        const O = von ? von.O.slice() : new Float64Array(n * Z);
        const Kap = new Float64Array(n);
        return {
            F,
            O,
            land: (i) => F.C[i] > 0,
            futter: (i) => Kap[i],
            takt: () => K.feldTakt(F, O, Kap),
            aesen: (frass) => K.feldAesen(F, O, frass),
            klon() {
                return welt(W, H, this);
            },
        };
    }
    const zaehl = (z) => {
        let [d, w] = [0, 0];
        for (const l of z.beute) d += l.length;
        for (const R of z.rudel) w += R.tiere.length;
        return [d, w];
    };
    // die Spur eines Laufs: Wolf und Beute nach jedem 105. Takt (4 Jahre), wie die Vorlage sie schreibt
    function spur(saat, takte, W = 48) {
        const feld = welt(W, W);
        let z = K.anfang({ W, H: W, saat }, feld);
        const aus = { wolf: [], reh: [] };
        for (let k = 0; k < takte; k++) {
            feld.takt();
            z = K.schritt(z, saat, k, feld);
            feld.aesen(z.frass);
            if (!(k % 105)) {
                const [d, w] = zaehl(z);
                aus.wolf.push(w);
                aus.reh.push(d);
            }
        }
        return aus;
    }
    return { K, TJ, M_ART, welt, zaehl, spur };
}
function bestandUrteil(L, gesetz) {
    if (!L || typeof L.bestand !== "function" || typeof L.zeitJagd !== "function")
        return "leben-core trägt keinen Bestand (bestand · zeitJagd fehlen)";
    const { spur } = bestandTreiber(core, L, gesetz);
    const fehl = [];
    for (const saat of [1, 2]) {
        const [ist, soll] = [spur(saat, 1051), LAUF4.spur[saat]];
        for (const f of ["wolf", "reh"])
            if (ist[f].join(" ") !== soll[f].join(" "))
                fehl.push("Saat " + saat + " " + f + ": Kern " + ist[f].join(" ") + " ≠ Vorlage " + soll[f].join(" "));
    }
    return fehl.join(" · ");
}
// B4 — DIE WELT-BINDUNG (`--bestand-welt [--aus <datei>]`): derselbe Lauf wie der Gesetz-Beweis (48 × 48 Reviere, 40 Jahre, Saaten
// 1–4), aber land und futter kommen vom ECHTEN Äsungs-Leser der Heimat um den Start-Anker — eine Seite ohne GPU liest je Revier
// ihre 16 Zellen wie `_bestandFeld` (Boden-Klasse `_bodenKlasseAt` über stehender Hydro-Wahrheit, Substrat `_kreaturNahrung` bei
// leerem Leben-Feld), K je Revier ist die Formel des Stamms für das Rotwild. Kein Maßstabs-Faktor. Soll (vor der Rechnung):
// W1 Wolf lebt am Ende 4 von 4 · W2 2–8 Wölfe je 1 000 Beute · W3 180–390 WÄ je Wolf (Mittel der zweiten Hälfte, wie S2 und S15).
if (process.argv.includes("--bestand-welt")) {
    const fs = require("fs");
    const { statikServer, nullWelt, hauptLauf, argOpt } = require("./lib/welt-boot.cjs");
    const { K, TJ, welt, zaehl } = bestandTreiber(core, LK);
    const [W, JAHRE, SAATEN] = [48, 40, [1, 2, 3, 4]];
    const TAKTE = Math.round(JAHRE * TJ);
    const rund = (x, d = 2) => (Number.isFinite(x) ? +x.toFixed(d) : x);
    hauptLauf(async () => {
        const server = statikServer();
        const port = Number(process.env.KREATUR_TAKT_PORT || 4478);
        const { browser, page } = await nullWelt(
            server,
            { port, frist: 3600000 },
            120000,
            "index.html",
            "networkidle0"
        );
        page.setDefaultTimeout(3500000);
        let F;
        try {
            await page.evaluate(() => window.__weltDa((r) => r.state.voxelWorkerReady && r.state.playerMesh));
            F = await page.evaluate(async (N) => {
                const [s, A] = [r.state, r.constructor];
                const [S, zn, LG] = [r._bestandSeite(), A.BESTAND_REGION.zellen, A._lebensraumGesetz()];
                const p = s.playerMesh.position;
                const [x0, z0] = [Math.floor(p.x / S) - N / 2, Math.floor(p.z / S) - N / 2];
                // die stehende Hydro-Wahrheit über dem ganzen Gau (`_bestandBereit` bestellt die fehlenden Kacheln im Faden)
                const t0 = performance.now();
                await window.__weltDa((r) => {
                    let fehlt = 0;
                    for (let i = 0; i < N * N; i++)
                        if (!r._bestandBereit(x0 + (i % N) + "," + (z0 + Math.floor(i / N)))) fehlt++;
                    return fehlt === 0;
                });
                const hydroS = (performance.now() - t0) / 1000;
                s.lifeField = undefined; // das Substrat: die Äsung ohne das Overlay dieser Sitzung
                const [C, Sub, LR, klassen, wolfZellen] = [[], [], [], {}, []];
                for (let i = 0; i < N * N; i++) {
                    const [ix, iz] = [x0 + (i % N), z0 + Math.floor(i / N)];
                    let [c, w] = [0, 0];
                    for (let a = 0; a < zn; a++)
                        for (let b = 0; b < zn; b++) {
                            const [x, z] = [(ix + (a + 0.5) / zn) * S, (iz + (b + 0.5) / zn) * S];
                            const kl = r._bodenKlasseAt(x, z);
                            klassen[kl] = (klassen[kl] || 0) + 1;
                            if (LG.lebensraum("wolf", kl, LG.L) > 0) w++;
                            const lr = LG.lebensraum("deer", kl, LG.L);
                            if (!(lr > 0)) continue;
                            Sub[i * zn * zn + c] = r._kreaturNahrung(x, z);
                            LR[i * zn * zn + c++] = lr;
                        }
                    C.push(c);
                    wolfZellen.push(w);
                }
                const kg = {};
                for (const g of ["deer", "wolf"])
                    try {
                        kg[g] = r._gattungKg(g);
                    } catch (e) {
                        kg[g] = String(e.message || e);
                    }
                return {
                    C,
                    Sub,
                    LR,
                    klassen,
                    wolfZellen,
                    kg,
                    S,
                    zn,
                    anker: [p.x, p.z],
                    x0,
                    z0,
                    hydroS,
                    saat: s.worldMeta && s.worldMeta.seed,
                };
            }, W);
        } finally {
            await browser.close();
            server.close();
        }
        const [n, Z] = [W * W, F.zn * F.zn];
        const quelle = { C: Uint8Array.from(F.C), S: new Float64Array(n * Z), LR: new Float64Array(n * Z) };
        for (let j = 0; j < n * Z; j++) [quelle.S[j], quelle.LR[j]] = [F.Sub[j] || 0, F.LR[j] || 0];
        const feld0 = welt(W, W, null, quelle);
        feld0.takt();
        const Ks = Array.from({ length: n }, (_, i) => feld0.futter(i));
        const land = Ks.filter((_, i) => feld0.land(i));
        const med = (v) => (v.length ? rang(v.slice().sort((a, b) => a - b)) : NaN);
        const sumK = Ks.reduce((a, b) => a + b, 0);
        const aes = Array.from(quelle.S).filter((_, j) => quelle.LR[j] > 0);
        const Z0 = [
            `B4 — die Welt-Bindung · Welt-Samen ${JSON.stringify(F.saat)} · Start-Anker (${rund(F.anker[0], 1)}, ${rund(F.anker[1], 1)}) · Gau ${W} × ${W} Regionen ab (${F.x0}, ${F.z0}), Seite ${rund(F.S)} m · Hydro-Wahrheit nach ${rund(F.hydroS, 1)} s`,
            `Soll (vor der Rechnung, nicht bewegt): W1 Wolf lebt am Ende 4 von 4 · W2 2–8 Wölfe je 1 000 Beute · W3 180–390 WÄ je Wolf`,
            `Boden-Klassen der ${n * Z} Zellen: ${Object.entries(F.klassen)
                .sort((a, b) => b[1] - a[1])
                .map(([k, v]) => k + " " + v)
                .join(" · ")}`,
            `Land (Revier mit Rotwild-Lebensraum): ${land.length} von ${n} = ${rund((100 * land.length) / n, 1)} % · Zellen mit Rotwild-Lebensraum ${aes.length} von ${n * Z} = ${rund((100 * aes.length) / (n * Z), 1)} % · Äsung dort Median ${rund(med(aes), 3)} (min ${rund(Math.min(...aes), 3)}, max ${rund(Math.max(...aes), 3)})`,
            `K je Revier (Köpfe Rotwild, Fraß-Schicht leer): Median über Land ${rund(med(land))} · Median über alle ${rund(med(Ks))} · Summe ${rund(sumK, 0)} — der Gesetz-Beweis stand bei ≈ 17 000 Köpfen; V_halt ${K.RAUM.vHalt} WÄ je Wolf trüge am Stand K ${rund(sumK / K.RAUM.vHalt, 1)} Wölfe`,
            `Wald-Zellen (Lebensraum des Wolfs im Tier-Buch): ${F.wolfZellen.reduce((a, b) => a + b, 0)} von ${n * Z} · Masse des Gusses in der Seite: ${JSON.stringify(F.kg)} (der Lauf rechnet mit der Masse von Lauf 4)`,
        ];
        const zeilen = [];
        const P = [];
        for (const saat of SAATEN) {
            const feld = welt(W, W, null, quelle);
            let z = K.anfang({ W, H: W, saat }, feld);
            const [d0, w0] = zaehl(z);
            const spur = { wolf: [], reh: [] };
            let [wS, dS, m, ms] = [0, 0, 0, 0];
            for (let k = 0; k < TAKTE; k++) {
                feld.takt();
                const t0 = performance.now();
                z = K.schritt(z, saat, k, feld);
                ms += performance.now() - t0;
                feld.aesen(z.frass);
                const [d, w] = zaehl(z);
                if (!(k % 105)) (spur.wolf.push(w), spur.reh.push(d));
                if (k >= TAKTE / 2) [wS, dS, m] = [wS + w, dS + d, m + 1];
            }
            const [d, w] = zaehl(z);
            const rudel = z.rudel.filter((R) => R.tiere.length >= 2).length;
            const p = {
                saat,
                lebt: rudel >= 1 && w > 0,
                wolfEnde: w,
                rehEnde: d,
                W2: dS > 0 ? (1000 * wS) / dS : NaN,
                W3: wS > 0 ? dS / wS : NaN,
            };
            P.push(p);
            zeilen.push(
                `Saat ${saat}: Anfang Beute ${d0} · Wolf ${w0} → Ende Beute ${d} · Wolf ${w} in ${z.rudel.length} Rudeln (${rudel} mit ≥ 2) · zweite Hälfte: ${rund(p.W2)} Wölfe je 1 000 Beute, ${rund(p.W3, 1)} WÄ je Wolf · ${rund(ms / JAHRE, 1)} ms je Jahres-Schritt`,
                `        Wolf je 4 Jahre ${spur.wolf.join(" ")} · Beute ${spur.reh.join(" ")}`
            );
        }
        const lebt = P.filter((p) => p.lebt).length;
        const mittel = (f) =>
            P.reduce((a, p) => a + (Number.isFinite(p[f]) ? p[f] : 0), 0) /
            Math.max(1, P.filter((p) => Number.isFinite(p[f])).length);
        const [W2, W3] = [mittel("W2"), mittel("W3")];
        const ok = [lebt === SAATEN.length, W2 >= 2 && W2 <= 8, lebt > 0 && W3 >= 180 && W3 <= 390];
        const urteil = [
            `${ok[0] ? "GRÜN" : "ROT"} W1 Wolf lebt am Ende: ${lebt} von ${SAATEN.length} (Soll 4 von 4; Wolf am Ende ${P.map((p) => p.wolfEnde).join(" ")})`,
            `${ok[1] ? "GRÜN" : "ROT"} W2 Wölfe je 1 000 Beute: ${rund(W2)} (Soll 2–8; je Saat ${P.map((p) => rund(p.W2)).join(" ")})`,
            `${ok[2] ? "GRÜN" : "ROT"} W3 WÄ je Wolf: ${rund(W3, 1)} (Soll 180–390; je Saat ${P.map((p) => rund(p.W3, 1)).join(" ")})`,
        ];
        const text = [...Z0, "", ...zeilen, "", ...urteil].join("\n");
        console.log(text);
        const aus = argOpt("--aus", "");
        if (aus) fs.writeFileSync(aus, text + "\n");
    });
    return;
}
// C2a — DER GAU IM FADEN, GEMESSEN (`--gau [--jahre 10,100,1000] [--aus <datei>]`): die Bühne `gau` (dieselbe wie gate:kreatur-takt)
// in ZWEI Booten der Seite — G1 die B4-Spur aus dem Faden · G2 die längste Arbeit des Haupt-Fadens je Ruf des Wirts · G3 der Stand
// beider Boote Byte für Byte (ihr Hash) · G4 die Rundreise · G5 ms je Jahres-Schritt im Faden und das Aufholen eines Gaus ohne
// Akte über n Jahre (nur im ersten Boot). Das Urteil der Zeilen bleibt beim Tor; hier stehen die Zahlen.
if (process.argv.includes("--gau")) {
    const fs = require("fs");
    const { statikServer, nullWelt, hauptLauf, argOpt } = require("./lib/welt-boot.cjs");
    const { KREATUR_PROBEN_SRC, urteil } = require("./lib/kreatur-proben.cjs");
    const jahre = argOpt("--jahre", "10,100,1000").split(",").map(Number);
    hauptLauf(async () => {
        const boot = async (gau) => {
            const server = statikServer();
            const port = Number(process.env.KREATUR_TAKT_PORT || 4478);
            const { browser, page } = await nullWelt(
                server,
                { port, frist: 3600000 },
                120000,
                "index.html",
                "networkidle0"
            );
            page.setDefaultTimeout(3500000);
            try {
                await page.evaluate(() => window.__weltDa((r) => r.state.voxelWorkerReady));
                await page.evaluate(() => window.__weltStehtNach(() => r._gameLoopTick(performance.now())));
                const aus = await page.evaluate(
                    (src, o) => (0, eval)("(" + src + ")")(r, window.THREE, o),
                    KREATUR_PROBEN_SRC,
                    { proben: ["gau"], gau }
                );
                return aus.gau;
            } finally {
                await browser.close();
                server.close();
            }
        };
        const [A, B] = [await boot({ jahre }), await boot({})];
        const [uA, uB] = [urteil("gau", A), urteil("gau", B)];
        const boote = A.g3.hash === B.g3.hash && A.g3.hashAkt === B.g3.hashAkt;
        const farbe = (ok) => (ok ? "GRÜN" : "ROT");
        const text = [
            `C2a — der Gau im Faden · Gau (0, 0) der Heimat, 48 × 48 Regionen · zwei Boote`,
            `${farbe(uA.ok && uB.ok)} G1 der B4-Lauf aus dem Faden: Wolf je 4 Jahre ${A.wolf.join(" ")} · Beute ${A.reh.join(" ")} · Land ${A.feld.land} · Zellen ${A.feld.zellen} · Σ K ${A.feld.kSumme}${uA.ok ? "" : " — " + uA.grund}`,
            `${farbe(Math.max(A.haupt.maxMs, B.haupt.maxMs) <= 1)} G2 Haupt-Faden je Ruf des Wirts: längste Arbeit ${A.haupt.maxMs} ms (${A.haupt.wo}, ${A.haupt.rufe} Rufe) · zweites Boot ${B.haupt.maxMs} ms (${B.haupt.wo}, ${B.haupt.rufe} Rufe) — Soll ≤ 1 ms; die Geburt des Wirts (Masse des Gusses) ${A.spiel.wirtMs} · ${B.spiel.wirtMs} ms`,
            `${farbe(boote && A.g3.gleich && A.g3.akt && B.g3.gleich && B.g3.akt)} G3 Determinismus: Boot 1 ${A.g3.hash} · Boot 2 ${B.g3.hash} (ohne Akt) · mit EINEM Akt „aus“ am Takt 100 ${A.g3.hashAkt} · ${B.g3.hashAkt} · je Boot zwei Fäden gleich ${A.g3.gleich} · ${B.g3.gleich} · ${A.g3.bytes} Bytes am Takt 160`,
            `${farbe(A.g4.gleich && B.g4.gleich)} G4 Stand-Rundreise: heraus am Takt 100 (${A.g4.bytes} Bytes), herein, ${A.g4.takte} Takte weiter = geradeaus ${A.g4.gleich} · ${B.g4.gleich} · am Stand der Seite (die Akte im Leben des Stands, ${A.stand.zeichen} Zeichen je Akt-Reihe): speichern, laden, ab der Saat weiter = geradeaus ${A.stand.gleich} · ${B.stand.gleich}`,
            `G5 Kosten im Faden: Feld des Gaus ${A.zeit.feldS} s (davon ${A.zeit.kacheln} Hydro-Kacheln ${A.zeit.hydroS} s) · zweites Boot ${B.zeit.feldS} s · ${A.zeit.msJeJahr} · ${B.zeit.msJeJahr} ms je Jahres-Schritt über die ersten 36 Jahre`,
            ...(A.aufholen || []).map(
                (h) =>
                    `   Aufholen ohne Akte ${h.jahre} Jahre (${h.takte} Takte): ${h.s} s = ${h.msJeJahr} ms je Jahres-Schritt · am Ende Beute ${h.beute} · Wolf ${h.jaeger}${h.jahre === 100 && h.s > 2 ? " — FUND: über 2 s" : ""}`
            ),
            `Der Weg des Spiels (Masse des Gusses ${A.spiel.kg.join(" · ")} kg, Saat des Gaus ${A.spiel.saat}): am Takt 1 Beute ${A.spiel.beute} · Wolf ${A.spiel.jaeger}`,
            `Die Lese-Naht am Takt 100, mittlere Zeile: ${A.lesen.reviere} Reviere · Beute ${A.lesen.beute} · Wolf ${A.lesen.jaeger} · abgeäste Zellen ${A.lesen.abgeaest}`,
        ].join("\n");
        console.log(text);
        const aus = argOpt("--aus", "");
        if (aus) fs.writeFileSync(aus, text + "\n");
    });
    return;
}
if (process.argv.includes("--bestand")) {
    const fs = require("fs");
    const arg = (name, sonst) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : sonst);
    const { K, TJ, M_ART, welt, zaehl } = bestandTreiber(core, LK);
    const [W, TAKTE, SAATEN] = [48, 4200, [1, 2, 3, 4, 5, 6, 7, 8]];
    const [n, AB, E] = [W * W, TAKTE / 2, Math.round(40 * TJ)];
    const rund = (x, d = 3) => (Number.isFinite(x) ? +x.toFixed(d) : x);
    const sum = (v) => v.reduce((a, b) => a + b, 0);
    const mittel = (v) => (v.length ? sum(v) / v.length : NaN);
    const vorlage = arg("--vorlage", null);
    if (vorlage) {
        // DER GLEICHSCHRITT: Vorlage und Kern, Takt um Takt abwechselnd unter derselben Last — Köpfe je Takt und ms je Jahres-Schritt
        const VK = require(path.resolve(vorlage));
        const takte = Math.round(Number(arg("--jahre", "40")) * TJ);
        console.log(
            `GLEICHSCHRITT Kern ↔ Vorlage · ${W} × ${W} Reviere · ${takte} Takte (${rund(takte / TJ, 1)} Jahre) · ms je Jahres-Schritt (${TJ} Takte)`
        );
        const zeilen = [];
        for (const saat of SAATEN) {
            const feld = welt(W, W);
            let [zK, zV] = [K.anfang({ W, H: W, saat }, feld), VK.anfang({ W, H: W, saat })];
            let [msK, msW, msV, ungleich] = [0, 0, 0, 0];
            for (let k = 0; k < takte; k++) {
                const t0 = performance.now();
                zV = VK.schritt(zV, saat, k);
                const t1 = performance.now();
                feld.takt();
                const t2 = performance.now();
                zK = K.schritt(zK, saat, k, feld);
                const t3 = performance.now();
                feld.aesen(zK.frass);
                const t4 = performance.now();
                [msV, msK, msW] = [msV + t1 - t0, msK + t3 - t2, msW + t2 - t1 + t4 - t3];
                let [d, w] = [0, 0];
                for (const l of zV.reh) d += l.length;
                for (const R of zV.rudel) w += R.tiere.length;
                const [dK, wK] = zaehl(zK);
                if (d !== dK || w !== wK || zV.ereignis.rissKg !== zK.ereignis.rissKg) ungleich++;
            }
            const j = takte / TJ;
            zeilen.push({ saat, ungleich, kern: msK / j, welt: msW / j, vorlage: msV / j, koepfe: zaehl(zK) });
            console.log(
                `  Saat ${saat} · Takte ungleich ${ungleich} von ${takte} · Kern ${rund(msK / j, 1)} ms + Welt-Leser ${rund(msW / j, 1)} ms · Vorlage ${rund(msV / j, 1)} ms · Ende Beute ${zaehl(zK)[0]} Wolf ${zaehl(zK)[1]}`
            );
        }
        const mw = (f) => rund(mittel(zeilen.map((x) => x[f])), 1);
        console.log(
            `MITTEL je Jahres-Schritt: Kern ${mw("kern")} ms + Welt-Leser ${mw("welt")} ms = ${rund(mw("kern") + mw("welt"), 1)} ms · Vorlage ${mw("vorlage")} ms · Takte ungleich ${sum(zeilen.map((x) => x.ungleich))}`
        );
        process.exit(sum(zeilen.map((x) => x.ungleich)) ? 1 : 0);
    }
    // DER VOLLE LAUF 4 — die Messung des Spike-Läufers, auf S1–S15 gekürzt (jede Zahl gerechnet wie dort)
    const JAHR = (j) => Math.round(E + j * TJ);
    const quantil = (v, q) => {
        if (!v.length) return NaN;
        return rang(
            Array.from(v).sort((a, b) => a - b),
            q
        );
    };
    const jm = (reihe, a, b) => {
        let s = 0;
        for (let k = a; k < b; k++) s += reihe[k];
        return s / (b - a);
    };
    const KLASSEN = ["D ≤ 0,6", "0,6 < D < 0,9", "D 0,9–1,2", "1,2 < D < 1,5", "D ≥ 1,5"];
    const klasseVon = (D) => (D <= 0.6 ? 0 : D < 0.9 ? 1 : D <= 1.2 ? 2 : D < 1.5 ? 3 : 4);
    const neuKlasse = () => ({ rudelTakte: 0, kopfTakte: 0, geb: 0, welpe: 0, deckung: 0, alter: 0, wanderung: 0 });
    // der Eingriff S13: jeder Beute-Kopf fällt mit `anteil`; der Strom gehört dem Läufer (wie in der Vorlage)
    function eingriff(z, saat, anteil) {
        // der EINE Generator (samen-core `mulberry32`) an der Saat des Eingriffs
        const rng = global.__samenCore.mulberry32((Math.imul(saat | 0, 0x9e3779b1) ^ Math.imul(z.takt + 1, 0x85ebca77) ^ 0x7e1f) | 0);
        let gefallen = 0;
        for (const l of z.beute)
            for (let k = l.length - 1; k >= 0; k--) if (rng() < anteil) (l.splice(k, 1), gefallen++);
        return gefallen;
    }
    function lauf(saat, jaeger, zweig, halt) {
        const feld = zweig ? zweig.feld : welt(W, W);
        let z = zweig ? zweig.z : K.anfang({ W, H: W, saat, jaeger }, feld);
        const von = zweig ? E : 0;
        const nutz = z.param.nutz;
        const habitat = [];
        for (let i = 0; i < n; i++) if (feld.land(i)) habitat.push(i);
        const bs0 = [];
        for (const l of z.beute) for (const t of l) bs0.push(Math.cbrt(t.M / M_ART.deer));
        const m = {
            takte: 0,
            rehS: 0,
            rehS2: 0,
            wolfS: 0,
            besetztHab: 0,
            leerIm: 0,
            gebReh: 0,
            reifReh: 0,
            reifWolf: 0,
            riss: 0,
            rissUnreif: 0,
            einwanderung: 0,
            bruchKopf: 0,
            bruchKg: 0,
            msKern: 0,
            msWelt: 0,
            wolfT: new Int32Array(TAKTE),
            rehT: new Int32Array(TAKTE),
            bs: [],
            klassen: KLASSEN.map(neuKlasse),
        };
        let [dVor, wVor] = zaehl(z);
        if (zweig) {
            const gefallen = eingriff(z, saat, 0.5);
            const [d] = zaehl(z);
            if (d !== dVor - gefallen) m.bruchKopf++;
            dVor = d;
        }
        let [besitzer, kopfVor] = [new Map(), new Map()];
        const deckVon = new Map();
        for (const R of z.rudel) {
            kopfVor.set(R.id, R.tiere.length);
            deckVon.set(R.id, R.deck);
            for (const t of R.tiere) besitzer.set(t, R.id);
        }
        const lege = (D) => (D == null ? null : m.klassen[klasseVon(D)]);
        for (let k = von; k < TAKTE; k++) {
            if (halt != null && k === halt) m.amHalt = { z: K.klon(z), feld: feld.klon() };
            const t0 = performance.now();
            feld.takt();
            const t1 = performance.now();
            z = K.schritt(z, saat, k, feld);
            const t2 = performance.now();
            feld.aesen(z.frass);
            m.msKern += t2 - t1;
            m.msWelt += t1 - t0 + performance.now() - t2;
            const ev = z.ereignis;
            const [d, w] = zaehl(z);
            m.wolfT[k] = w;
            m.rehT[k] = d;
            // die Erhaltung (S10): Köpfe = Köpfe davor + Geburten − Tode; jeder Geborene trägt eine Mutter; kg Riss = kg der Gerissenen
            let [gD, gW, tD, tW, kgJ] = [0, 0, 0, 0, 0];
            for (const t of ev.geburt) {
                if (t.g === "beute") gD++;
                else gW++;
                if (t.m == null) m.einwanderung++;
            }
            for (const x of ev.tod) {
                if (x.t.g === "beute") tD++;
                else tW++;
                if (x.ursache === "jagd") kgJ += x.t.kg;
            }
            m.einwanderung += ev.einwanderung;
            if (d !== dVor + gD - tD || w !== wVor + gW - tW) m.bruchKopf++;
            if (
                Math.abs(kgJ - ev.rissKg) > 1e-6 * (1 + kgJ) ||
                Math.abs(ev.gedecktKg - nutz * ev.rissKg) > 1e-6 * (1 + kgJ)
            )
                m.bruchKg++;
            [dVor, wVor] = [d, w];
            // S14: Rudel-Takte, Geburten und Tode in die Klasse des D ihres Rudels
            {
                const [dNow, besitzerNeu, kopfNeu] = [new Map(), new Map(), new Map()];
                for (const R of z.rudel) {
                    dNow.set(R.id, R.deck);
                    kopfNeu.set(R.id, R.tiere.length);
                    for (const t of R.tiere) besitzerNeu.set(t, R.id);
                }
                const dVon = (id) => (dNow.has(id) && dNow.get(id) != null ? dNow.get(id) : deckVon.get(id));
                for (const [id, kopf] of kopfVor) {
                    const kl = lege(dVon(id));
                    if (kl) (kl.rudelTakte++, (kl.kopfTakte += kopf));
                }
                for (const t of ev.geburt) {
                    const kl = t.g === "jaeger" ? lege(dVon(besitzerNeu.get(t))) : null;
                    if (kl) kl.geb++;
                }
                for (const x of ev.tod) {
                    const kl = x.t.g === "jaeger" ? lege(dVon(besitzer.get(x.t))) : null;
                    if (kl) kl[x.ursache]++;
                }
                for (const [id, D] of dNow) if (D != null) deckVon.set(id, D);
                [besitzer, kopfVor] = [besitzerNeu, kopfNeu];
            }
            if (k < AB) continue;
            m.takte++;
            m.rehS += d;
            m.rehS2 += d * d;
            m.wolfS += w;
            const probe = !((k - AB) % 105);
            for (const i of habitat) {
                const l = z.beute[i];
                if (z.besitz[i] >= 0) (m.besetztHab++, !l.length && m.leerIm++);
                if (probe) for (const t of l) if (t.r) m.bs.push(Math.cbrt(t.M / M_ART.deer));
            }
            m.gebReh += gD;
            for (const x of ev.tod) if (x.ursache === "jagd") (m.riss++, !x.t.r && m.rissUnreif++);
            m.reifReh += ev.reifReh;
            m.reifWolf += ev.reifWolf;
        }
        m.ende = { reh: dVor, wolf: wVor, rudelAb2: z.rudel.filter((R) => R.tiere.length >= 2).length };
        [m.bs0p99, m.bsP99] = [quantil(bs0, 0.99), quantil(m.bs, 0.99)];
        delete m.bs;
        return m;
    }
    function proben(m, o) {
        const [jahre, reh, wolf] = [m.takte / TJ, m.rehS / m.takte, m.wolfS / m.takte];
        return {
            S1: m.ende.rudelAb2 >= 1 ? 1 : 0,
            S2: (1000 * wolf) / reh,
            S3: m.riss / jahre / reh,
            S4: reh / (o.rehS / o.takte),
            S5: m.rissUnreif / m.riss,
            S6: m.reifWolf / (m.wolfS / (K.ZEIT.jahreRef * TJ)),
            S7: m.reifReh / m.gebReh,
            S8: m.leerIm / m.besetztHab,
            S9: Math.sqrt(Math.max(0, m.rehS2 / m.takte - reh * reh)) / reh,
            S10: [m.bruchKopf + m.bruchKg, m.einwanderung],
            S11: (m.msKern + m.msWelt) / (m.takte * 2) / (n / 256),
            S12: m.bsP99 / m.bs0p99,
            S15: m.ende.rudelAb2 >= 1 ? reh / wolf : NaN,
            wolfEnde: m.ende.wolf,
            msKernJahr: m.msKern / (TAKTE / TJ),
            msWeltJahr: m.msWelt / (TAKTE / TJ),
        };
    }
    const t0 = Date.now();
    const sek = () => Math.round((Date.now() - t0) / 1000) + " s";
    console.log(
        `LAUF 4 im Kern · ${W} × ${W} Reviere · ${SAATEN.length} Saaten · ${TAKTE} Takte · Start ${new Date().toLocaleString("de-DE")}`
    );
    const O = SAATEN.map((saat) => lauf(saat, false));
    console.log("ohne Wolf gelaufen", sek());
    const Gm = SAATEN.map((saat) => lauf(saat, true, null, E));
    console.log("mit Wolf gelaufen", sek());
    const P = Gm.map((m, i) => proben(m, O[i]));
    const ist = {};
    for (const nr of ["S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S11", "S12", "S15"]) {
        const v = P.map((p) => p[nr]);
        ist[nr] = { wert: rund(mittel(v.filter(Number.isFinite)), 4), jeSaat: v.map((x) => rund(x, 4)) };
    }
    ist.S1 = { wert: sum(P.map((p) => p.S1)) + " von " + P.length, jeSaat: P.map((p) => p.wolfEnde) };
    ist.S10 = {
        wert: sum(P.map((p) => p.S10[0])) + " · " + sum(P.map((p) => p.S10[1])),
        jeSaat: P.map((p) => p.S10.join("·")),
    };
    // S13, die Rückstell-Probe: im Jahr 40 fällt die Hälfte der Beute; der Zweig läuft ab dem Zustand des Haupt-Laufs
    const klassen = KLASSEN.map(neuKlasse);
    const addiere = (b) => klassen.forEach((x, i) => Object.keys(x).forEach((f) => (x[f] += b[i][f])));
    for (const m of Gm) addiere(m.klassen);
    const S13 = Gm.map((m, i) => {
        const [wolfVor, beuteVor] = [jm(m.wolfT, JAHR(-1), E), jm(m.rehT, JAHR(-1), E)];
        const b = lauf(SAATEN[i], true, m.amHalt);
        delete m.amHalt;
        addiere(b.klassen);
        let tief = Infinity;
        for (let j = 1; j <= 4; j++) tief = Math.min(tief, jm(b.wolfT, JAHR(j - 1), JAHR(j)));
        return {
            fall: 1 - tief / wolfVor,
            verhaeltnis: jm(b.rehT, JAHR(14), JAHR(15)) / beuteVor,
            lebt: b.ende.rudelAb2 >= 1,
            brueche: b.bruchKopf + b.bruchKg + b.einwanderung,
        };
    });
    console.log("S13-Zweige gelaufen", sek());
    {
        const [fall, verh, lebt] = [
            mittel(S13.map((r) => r.fall)),
            mittel(S13.map((r) => r.verhaeltnis)),
            S13.filter((r) => r.lebt).length,
        ];
        ist.S13 = {
            wert:
                "Fall " +
                rund(100 * fall, 1) +
                " % (" +
                S13.filter((r) => r.fall >= 0.25).length +
                " von " +
                S13.length +
                " Saaten ≥ 25 %) · Beute " +
                rund(100 * verh, 1) +
                " % (" +
                S13.filter((r) => r.verhaeltnis >= 0.85).length +
                " von " +
                S13.length +
                " ≥ 85 %) · lebt " +
                lebt +
                " von " +
                S13.length,
            jeSaat: S13.map(
                (r) => rund(100 * r.fall, 0) + "%/" + rund(100 * r.verhaeltnis, 0) + "%/" + (r.lebt ? "lebt" : "tot")
            ),
        };
        const wachstum = (x) => (x.geb - x.welpe - x.deckung - x.alter - x.wanderung) / (x.kopfTakte / TJ);
        const baender = [
            [2, (r) => r >= -0.1 && r <= 0.1],
            [4, (r) => r >= 0.15 && r <= 0.45],
            [0, (r) => r <= -0.15],
        ];
        ist.S14 = {
            wert: baender
                .map(([i, ok]) => {
                    const [rj, r] = [rund(klassen[i].rudelTakte / TJ, 1), rund(wachstum(klassen[i]), 4)];
                    return (
                        KLASSEN[i] +
                        ": " +
                        (rj < 10
                            ? "nicht gemessen (" + rj + " Rudel-Jahre)"
                            : r + " " + (ok(r) ? "GRÜN" : "ROT") + " (" + rj + " Rudel-Jahre)")
                    );
                })
                .join(" · "),
            jeSaat: [],
        };
    }
    let ungleich = 0;
    console.log(
        "── S1–S15: Vorlage (ergebnis-zeit-4.json) ↔ Kern · gleich heißt Wert UND jede Saat zahlengleich (S11 ist Zeit)"
    );
    for (const nr of Object.keys(LAUF4.soll)) {
        const [a, b] = [LAUF4.soll[nr], ist[nr]];
        const gleich = JSON.stringify([a.wert, a.jeSaat]) === JSON.stringify([b.wert, b.jeSaat]);
        if (!gleich && nr !== "S11") ungleich++;
        // die Urteils-Wörter der Vorlage (S14 steht dort wie gesetzt auf rot) klein: diese Tafel urteilt nur GLEICH ↔ UNGLEICH
        const zeig = (s) => String(s).replace(/ROT/g, "rot").replace(/GRÜN/g, "grün");
        console.log(
            `${nr} · Vorlage ${zeig(a.wert)} · Kern ${zeig(b.wert)} · ${nr === "S11" ? "Zeit" : gleich ? "GLEICH" : "UNGLEICH"}${a.jeSaat.length ? " · je Saat Kern " + b.jeSaat.join(" ") : ""}`
        );
    }
    console.log(
        `── KOSTEN je Jahres-Schritt (${TJ} Takte, ${n} Reviere, mit Wolf) je Saat: Kern ${P.map((p) => rund(p.msKernJahr, 1)).join(" ")} ms · Welt-Leser ${P.map((p) => rund(p.msWeltJahr, 1)).join(" ")} ms`
    );
    console.log(
        `${ungleich ? "❌ " + ungleich + " Zeile(n) UNGLEICH" : "✅ Lauf 4 zahlengleich (S1–S10, S12–S15)"} · S13-Brüche ${sum(S13.map((r) => r.brueche))} · Ende ${new Date().toLocaleString("de-DE")} · ${sek()}`
    );
    if (arg("--json", null))
        fs.writeFileSync(
            arg("--json"),
            JSON.stringify({ ist, vorlage: LAUF4.soll, kosten: P.map((p) => [p.msKernJahr, p.msWeltJahr]) })
        );
    process.exit(ungleich ? 1 : 0);
}
{
    const grund = bestandUrteil(LK);
    check(
        "Bestand = Gesetz: Lauf 4 zahlengleich (Saat 1 · 2, Jahre 0–40, Spur von Wolf und Beute gegen die Vorlage)",
        grund === "",
        grund
    );
    if (grund === "") {
        // der Mutant: EIN Wert des Satzes 3 verstellt (V½ 246 → 300) — die Spur muss die Vorlage verlassen
        const verstellt = jsonKlon(LK.zeitJagd());
        verstellt.antwort.vHalb = 300;
        const mutant = bestandUrteil(LK, verstellt);
        check(
            "Bestand = Gesetz, Selbsttest: der Mutant V½ 246 → 300 fällt ROT",
            mutant !== "",
            mutant !== "" ? "" : "die Spur blieb gleich"
        );
    }
}
// ── DER GAU (C2a, leben-core `gau*` · `akt`): der Bestand über EINEM Feld mit Fraß-Schicht und Akten ist STAND — eine Funktion von
// (Samen, Feld, Takt, Akte). Drei Zeilen am kleinen Raster (32 × 32, Spike-Feld, 160 Takte), je mit ihrem Mutanten:
//   E2  der Akt: „aus“ nimmt den Kopf, „ein“ setzt ihn, ein fremder Takt-Stempel wirft — Mutant: der Akt wirkt an einer Kopie
//   G3  Determinismus: zwei Läufe byte-gleich, EIN „aus“ am Takt 100 weicht ab, derselbe Akt wieder byte-gleich — Mutant: der Wirt
//       verliert den Akt
//   G4  Stand-Rundreise: packen → entpacken → weiterrechnen = durchrechnen, byte-gleich — Mutant: der Stand vergisst die Fraß-Schicht
// (G1, der B4-Lauf im Faden des gebooteten Stamms, und G2 · G5 urteilen in `--gau`.)
function gauUrteil(L, mutant) {
    const { K, welt } = bestandTreiber(core, L);
    const [W, T1, T2, SAAT] = [32, 100, 160, 1];
    const F = welt(W, W).F;
    const gleich = (a, b) => Buffer.compare(Buffer.from(K.gauPack(a)), Buffer.from(K.gauPack(b))) === 0;
    const bis = (t, akte, g = K.gauAnfang(F, SAAT)) => K.gauBis(g, t, akte);
    // der Kopf, der fällt: der erste Beute-Kopf des ersten besetzten Reviers am Takt T1
    const g1 = bis(T1, []);
    let i0 = 0;
    while (i0 < W * W && !K.koepfe(g1.z, i0).beute) i0++;
    const kopf = K.tiereIn(g1.z, i0)[0];
    const aus = { takt: T1, art: "aus", id: kopf.id };
    const fehl = { akt: [], g3: [], g4: [] };
    {
        const g = bis(T1, []);
        const ziel = mutant === "akt" ? K.gauEntpack(K.gauPack(g), F) : g;
        const vor = K.koepfe(g.z, i0).beute;
        if (K.akt(ziel, aus) !== true) fehl.akt.push("„aus“ meldet den Kopf nicht");
        if (K.koepfe(g.z, i0).beute !== vor - 1 || K.tiereIn(g.z, i0).some((t) => t.id === kopf.id))
            fehl.akt.push(
                "nach „aus“ steht der Kopf noch im Revier (" + K.koepfe(g.z, i0).beute + " Köpfe, davor " + vor + ")"
            );
        if (K.akt(ziel, aus) !== false) fehl.akt.push("ein zweites „aus“ desselben Kopfs wirkt");
        K.akt(ziel, {
            takt: T1,
            art: "ein",
            g: "beute",
            revier: i0,
            id: "seite.1",
            a: kopf.a,
            e: kopf.e,
            alterS: kopf.alterS,
            m: null,
        });
        const neu = K.tiereIn(g.z, i0).find((t) => t.id === "seite.1");
        if (!neu || Math.abs(neu.kg - kopf.kg) > 1e-9 || K.koepfe(g.z, i0).beute !== vor)
            fehl.akt.push("nach „ein“ steht der Kopf nicht mit seinem Leib im Revier");
        let wurf = false;
        try {
            K.akt(g, { takt: T1 + 1, art: "aus", id: "seite.1" });
        } catch (e) {
            wurf = true;
        }
        if (!wurf) fehl.akt.push("ein Akt mit fremdem Takt-Stempel wirft nicht");
    }
    {
        const akte = mutant === "g3" ? [] : [aus];
        const [A, A2, B, B2] = [bis(T2, []), bis(T2, []), bis(T2, akte), bis(T2, akte)];
        if (!gleich(A, A2)) fehl.g3.push("zwei Läufe ohne Akt weichen ab");
        if (gleich(A, B)) fehl.g3.push("der Akt „aus“ am Takt " + T1 + " ändert den Zustand am Takt " + T2 + " nicht");
        if (!gleich(B, B2)) fehl.g3.push("derselbe Akt gibt zwei Zustände");
    }
    let bytes = 0;
    {
        const durch = bis(T2, [aus]);
        const halb = bis(T1 + 20, [aus]);
        if (mutant === "g4") halb.O.fill(0);
        const stand = K.gauPack(halb);
        bytes = stand.length;
        if (!gleich(durch, bis(T2, [aus], K.gauEntpack(stand, F))))
            fehl.g4.push("speichern → laden → weiterrechnen ≠ durchrechnen");
        if (mutant !== "g4" && !gleich(halb, K.gauEntpack(stand, F)))
            fehl.g4.push("entpacken ∘ packen ist nicht die Identität");
    }
    return { akt: fehl.akt.join(" · "), g3: fehl.g3.join(" · "), g4: fehl.g4.join(" · "), bytes };
}
{
    const GLIEDER = ["gauFeld", "gauAnfang", "gauBis", "gauPack", "gauEntpack", "akt", "koepfe", "tiereIn", "frassAm"];
    const bauer = LK && typeof LK.bestand === "function" ? LK.bestand : null;
    let fehlt = GLIEDER;
    let u = null;
    try {
        fehlt = GLIEDER.filter((f) => typeof bestandTreiber(core, LK).K[f] !== "function");
        if (bauer && !fehlt.length) u = gauUrteil(LK);
    } catch (e) {
        u = { akt: String(e.message || e), g3: String(e.message || e), g4: String(e.message || e), bytes: 0 };
    }
    const grund = (f) => (u ? u[f] : "leben-core bestand trägt kein " + fehlt.join(" · "));
    check(
        "Gau, der Akt (E2): „aus“ nimmt den Kopf, „ein“ setzt ihn mit seinem Leib, ein fremder Takt-Stempel wirft",
        grund("akt") === "",
        grund("akt")
    );
    check(
        "Gau, Determinismus (G3): zwei Läufe byte-gleich · EIN „aus“ am Takt 100 weicht ab · derselbe Akt wieder byte-gleich",
        grund("g3") === "",
        grund("g3")
    );
    check(
        "Gau, Stand-Rundreise (G4): packen → entpacken → weiterrechnen = durchrechnen, byte-gleich" +
            (u && u.bytes ? " (" + u.bytes + " Bytes am 32er-Raster)" : ""),
        grund("g4") === "",
        grund("g4")
    );
    if (u && !u.akt && !u.g3 && !u.g4)
        for (const [m, name] of [
            ["akt", "der Akt wirkt an einer Kopie"],
            ["g3", "der Wirt verliert den Akt"],
            ["g4", "der Stand vergisst die Fraß-Schicht"],
        ]) {
            const r = gauUrteil(LK, m)[m];
            check(
                "Gau, Selbsttest: der Mutant „" + name + "“ fällt ROT",
                r !== "",
                r !== "" ? "" : "die Zeile blieb grün"
            );
        }
}
urteilEnde(
    errs.length,
    `\n❌ ROT — ${errs.length} Verletzung(en).`,
    "\n✅ GRÜN — DIE KREATUR-SEELE IST GESCHLOSSEN: jedes Aktions-Profil zeigt auf ein Feld der Haltung."
);
