// DIE PERSPEKTIVE geist DES KAPITELS mensch (Meisterkarte 2, k2-mensch.js lädt sie): je Leiter EINE Probe in der warmen Welt der
// Sitzung am Messort stadt-voll (spec/profiband/haushalt.json: „dorf 7 300“, 295 Häuser, 1092 Bewohner, der Spieler am Markt) —
// gemessen am Ergebnis der Welt: die Akte, Orte, Wege und Leiber der Bewohner nach dem Takt des Spiels, nie der Code-Text.
//
// DIE STADT (die Seite der Welt, `STADT`, EIN Werkzeug für jede Leiter von geist und menge — k2-mensch-menge.js liest es von hier):
// die größte Liste der Bewohner (`_bewohnerSiedlungen`, die Stadt des Orts), der Tag des Gesetzes für die Dauer des Rufs (die
// Sitzung steht unter der Bühne, Tag-Länge des Halts — „eine Linse, die die Sonne laufen lässt, setzt ihre eigene“, g2 platzAcht),
// die Uhr auf der Stunde h wie die Kreatur-Proben (`uhrAuf`: der Sprung stellt jeden, wo sein Tag ihn sieht, `_bewohnerAnkunft`;
// der Takt der Leute ohne Zeit, bis keiner mehr ankommt — `leuteTakt` in scripts/lib/kreatur-proben.cjs), der Takt des Spiels
// (`_gameLoopTick`, je TAKT_DECKEL_S, wie platzAcht), die Pose eines Augen-Bilds vor der dichtesten Gruppe am Spieler, der Zensus.
"use strict";

const { FAECHER } = require("./faecher.js");
const { HALTUNG_AN } = require("./k2-mensch-leib.js");

const STADT = (r, T) => {
    const s = r.state, A = r.constructor, pm = s.playerMesh.position;
    const listen = [...(r._bewohnerSiedlungen || new Map()).values()].filter((S) => Array.isArray(S.liste) && S.liste.length);
    const S = listen.slice().sort((a, b) => b.liste.length - a.liste.length)[0] || null;
    const L = S ? S.liste : [];
    const tag0 = s.dayLengthMinutes;
    s.dayLengthMinutes = A.DAY_LENGTH_DEFAULT_MINUTES;
    const ab = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
    const leute = (dt) => {
        r._bewohnerWerkTakt(Infinity);
        r._tickBewohner(dt);
    };
    const ankunft = () => {
        let n = 0;
        for (let m = Infinity, still = 0, k; still < 5 && n < 3000 && (k = (leute(0), r._weltOffen().leute)); m = k) {
            still = k < m ? 0 : still + 1;
            n++;
        }
        return n;
    };
    const stunde = () => (((s.timeOfDay % 1) + 1) % 1) * 24;
    // gewiss ein Sprung: steht die Uhr näher als sprungH an h, erst über die Gegen-Stunde (wie `uhrAuf` der Kreatur-Proben)
    const uhrAuf = (h) => {
        const d = Math.abs(stunde() - h);
        if (Math.min(d, 24 - d) < 0.3) {
            r.setTimeOfDay(((h + 12) % 24) / 24, "regler");
            leute(0);
        }
        r.setTimeOfDay((h % 24) / 24, "regler");
        return ankunft();
    };
    let uhr = performance.now();
    const takt = async (n) => {
        for (let k = 0; k < n; k++) {
            uhr += A.TAKT_DECKEL_S * 1000;
            r._gameLoopTick(uhr);
            await window.sleep();
        }
    };
    const draussen = (R) => L.filter((b) => b.leib && !b.drinnen && (!R || ab(b.leib.position, pm) < R));
    // die Pose eines Augen-Bilds: 7 m vor der dichtesten Gruppe (4 m) binnen 20 m am Spieler, Augenhöhe 1,7 m, frei von Grundrissen
    const pose = () => {
        const pts = draussen(20).map((b) => b.leib.position);
        let best = null, bn = 0;
        for (const p of pts) {
            let n = 0;
            for (const q of pts) if (ab(p, q) < 4) n++;
            if (n > bn) (bn = n), (best = p);
        }
        if (!best) return null;
        for (let w = 0; w < 8; w++) {
            const a = Math.atan2(pm.z - best.z, pm.x - best.x) + (w * Math.PI) / 4;
            const cx = best.x + Math.cos(a) * 7, cz = best.z + Math.sin(a) * 7;
            const g = r._imGrundriss(cx, cz, 0.5);
            if (g === "haus" || g === "bau") continue;
            const q2 = (v) => +v.toFixed(2);
            return {
                pose: { px: q2(cx), py: q2(r.getTerrainHeightAt(cx, cz) + 1.7), pz: q2(cz), lx: q2(best.x), ly: q2(r.getTerrainHeightAt(best.x, best.z) + 1.2), lz: q2(best.z) },
                dicht: bn,
                dichteQm: +(bn / (Math.PI * 16)).toFixed(3),
                imKreis: pts.length,
            };
        }
        return null;
    };
    const zensus = () => ({
        stadt: L.length,
        mitLeib: L.filter((b) => b.leib).length,
        alle: listen.reduce((n, x) => n + x.liste.length, 0),
        siedlungen: listen.length,
        haeuser: S && S.plan && Array.isArray(S.plan.slots) ? S.plan.slots.length : 0,
        jahr: S && S.plan && Number.isFinite(S.plan.jahr) ? S.plan.jahr : null,
        saat: s.worldMeta ? s.worldMeta.seed : null,
    });
    return { s, A, pm, S, L, ab, leute, ankunft, stunde, uhrAuf, takt, draussen, pose, zensus, zurueck: () => (s.dayLengthMinutes = tag0) };
};

// die Seiten-Funktionen der geist-Leitern (r = Welt, T = THREE, arg = das Argument der Probe, HILF = die STADT)
const ZENSUS = async (r, T, arg, HILF) => (HILF.L.length ? HILF.zensus() : { fehler: "keine Bewohner am Messort" });
const POSE = async (r, T, arg, HILF) => HILF.pose() || { fehler: "keine Gruppe draußen binnen 20 m am Spieler" };

// DER ZUG AM TAG (absicht S1, wörtlich „20 Personen nach 1 Spieltag ihrem Zug zugeordnet ≥ 0,6“): je Bewohner der Stadt sein Soll der
// Stunde, wie der Takt es liest (`_bewohnerSoll`: der Plan seines Samens, seiner Rolle, seiner gebundenen Orte und des Regens am Ort),
// alle 15 min über 24 h; der Ort des Solls ist der Name des Orts, dessen Stand das Ziel ist (drinnen: daheim). EIN BLINDER ZUORDNER
// (der von gate:mensch-zuege, scripts/diag-mensch-zuege.cjs `zuordnen`: er liest nie den Zug, nur den Tag und die Rolle) ordnet nach
// Stunden am Werk über dem Maß der Rolle (≥ 1,5 fleißig), am Treff außer Haus (≥ 2 gesellig), daheim in der Freizeit (≥ 5,4 häuslich);
// verglichen mit dem Zug seines Samens (koerper `tagesZug`). Der Anteil ist das kleinere von den ersten 20 und den ersten 100 (der Umfang)
const ZUEGE = async (r, T, arg, HILF) => {
    const { L } = HILF;
    const KC = window.__koerperCore;
    if (!L.length) return { fehler: "keine Bewohner am Messort" };
    if (!KC || typeof KC.tagesZug !== "function" || !KC.TAGES_GESETZ || !KC.TAGES_GESETZ.zuege) return { fehler: "der Kern trägt keinen Zug (koerper tagesZug)" };
    const G = KC.TAGES_GESETZ;
    const ORTE = ["abend", "heim", "werk", "platz", "mahl", "besuch"];
    // die ersten arg.n Bewohner der Stadt (der Umfang der Sprosse), solange die Frist der Probe trägt (arg.ms)
    const bis = performance.now() + arg.ms;
    let t20 = 0, tAlle = 0, n = 0, weicht = 0;
    const tafel = {};
    for (const b of L) {
        if (n >= arg.n || performance.now() > bis) break;
        if (!b.orte || !Number.isFinite(b.same)) continue;
        const R = G.rollen[b.rolle] || {};
        const W = R.werk || G.werk;
        const mass = W[1] - W[0] - (R.mittagAmWerk ? 0 : G.mittag[1] - G.mittag[0]);
        let werk = 0, treff = 0, heimFrei = 0;
        for (let q = 0; q < 96; q++) {
            const p = r._bewohnerSoll(b, q / 4);
            const wo = p.drinnen ? "heim" : ORTE.find((k) => b.orte[k] && b.orte[k] === p.ziel) || null;
            if (!wo && p.akt !== "arbeit") weicht++;
            if (p.akt === "arbeit") werk += 0.25;
            else if (p.akt !== "schlaf" && wo === "abend") treff += 0.25;
            else if (p.akt !== "schlaf" && wo === "heim") heimFrei += 0.25;
        }
        const rat = werk - mass >= 1.5 ? "fleissig" : treff >= 2 ? "gesellig" : heimFrei >= 5.4 ? "haeuslich" : "ausgeglichen";
        const ist = KC.tagesZug(b.same);
        const ok = rat === ist ? 1 : 0;
        if (n < 20) t20 += ok;
        tAlle += ok;
        n++;
        const Z = (tafel[ist] = tafel[ist] || { n: 0, ok: 0 });
        Z.n++;
        Z.ok += ok;
    }
    if (!n) return { fehler: "kein Bewohner trägt Orte und Samen" };
    const w = r._weatherFieldFor();
    return { n, t20: +(t20 / Math.min(20, n)).toFixed(4), alle: +(tAlle / n).toFixed(4), tafel, weicht, regen: +Number((w && w.rain) || 0).toFixed(3) };
};

// DER TAG ÜBER SIEBEN TAGE (tag S2): je Tag die Stunden des Arguments, die Uhr springt (über Mitternacht vorwärts: der Tag der
// Welt zählt, `_uhrSetzen`), jeder Bewohner kommt an; gelesen je Bewohner sein Akt (`b.akt`, den der Takt setzt), ob er dort ist
// (drinnen an seiner Tür oder ≤ 1,5 m an seinem Ziel) oder unterwegs, und die Hauptkategorie der Zeitverwendungs-Erhebung (das
// ATUS-Lexikon: 17 Hauptkategorien 01–16 und 18) seines Akts. Je leere Hauptkategorie ist die Abweichung |0 − a| / a = 1, gleich
// welches a die Erhebung trägt; sind alle 17 belegt, braucht das Maß die eingefrorene Referenz, die die Probe nicht trägt — null
// (ROT beim Namen), nie geraten. Dazu der Vortag: derselbe Akt je Person und Stunde wie am ersten Tag (Lesewert)
const TAG_TAGE = async (r, T, arg, HILF) => {
    const { s, L, ab } = HILF;
    if (!L.length) return { fehler: "keine Bewohner am Messort" };
    const bis = performance.now() + arg.ms;
    const KAT = { schlaf: "01", arbeit: "05", mittag: "11", morgen: "12", besuch: "12", abend: "12" };
    const ALLE = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "18"];
    const akte = new Set(), kat = new Map(), tage = new Set(), erst = new Map(), raus = new Set();
    let proben = 0, gleich = 0, vergleich = 0;
    for (let d = 0; d < arg.tage && performance.now() < bis; d++) {
        for (const h of arg.stunden) {
            if (performance.now() > bis) break;
            HILF.uhrAuf(h);
            proben++;
            tage.add(s.worldMeta ? s.worldMeta.tag || 0 : 0);
            for (const b of L) {
                if (!b.leib) {
                    raus.add(b);
                    continue;
                }
                const unterwegs = !!b.weg;
                const dort = b.drinnenSoll ? !!b.drinnen : !unterwegs && !!b.ziel && ab(b.leib.position, b.ziel) < 1.5;
                if (!dort && !unterwegs) raus.add(b);
                const a = String(b.akt);
                akte.add(a);
                const k = unterwegs ? "18" : KAT[a] || "?" + a;
                kat.set(k, (kat.get(k) || 0) + 1);
                const key = b.seed + "@" + h;
                if (d === 0) erst.set(key, a);
                else {
                    vergleich++;
                    if (erst.get(key) === a) gleich++;
                }
            }
        }
    }
    const leer = ALLE.filter((k) => !kat.has(k));
    const summe = [...kat.values()].reduce((x, y) => x + y, 0) || 1;
    return {
        bewohner: L.length,
        gefolgt: L.length - raus.size,
        proben,
        tage: tage.size,
        akte: [...akte].sort(),
        abweichung: leer.length ? 1 : null,
        leer: leer.length,
        belegt: ALLE.length - leer.length,
        anteile: Object.fromEntries([...kat].sort().map(([k, v]) => [k, +(v / summe).toFixed(3)])),
        gleichVortag: vergleich ? +(gleich / vergleich).toFixed(4) : null,
    };
};

// DAS GESPRÄCH (gespraech S2, S3): wer von den Bewohnern im Ruf des Gesprächs steht — der Name sucht nur `state.creatures` mit
// `userData.name` (`_findCreatureByName`) —, wer einen Namen trägt, wessen Leib eine Erinnerung trägt (`userData.memory`)
const SPRECHEN = async (r, T, arg, HILF) => {
    const { s, L } = HILF;
    if (!L.length) return { fehler: "keine Bewohner am Messort" };
    const ruf = new Set((Array.isArray(s.creatures) ? s.creatures : []).filter((c) => c && c.userData && typeof c.userData.name === "string" && c.userData.name));
    const ud = (b) => (b.leib && b.leib.userData) || {};
    return {
        bewohner: L.length,
        erreichbar: L.filter((b) => b.leib && ruf.has(b.leib)).length,
        mitName: L.filter((b) => typeof ud(b).name === "string" && ud(b).name).length,
        mitGedaechtnis: L.filter((b) => Array.isArray(ud(b).memory) && ud(b).memory.length).length,
        wesenMitNamen: ruf.size,
    };
};

// DER BESUCH (netz S1): um die Stunde des Besuchs nach dem Werk (koerper TAGES_GESETZ: werk bis 17 ± 0,5, besuchH 0,75) die
// Bewohner im Akt „besuch“, angekommen an ihrem Ziel; der Satz des Bewohners trägt keine Bindung an einen Gastgeber
const BESUCH = async (r, T, arg, HILF) => {
    const { L, ab } = HILF;
    if (!L.length) return { fehler: "keine Bewohner am Messort" };
    HILF.uhrAuf(arg.uhr);
    const da = L.filter((b) => b.leib && b.akt === "besuch" && !b.weg && b.ziel && ab(b.leib.position, b.ziel) < 1.5);
    const bindung = L.filter((b) => ["freunde", "familie", "verwandte", "bindung", "netz", "eltern", "kinder"].some((k) => b[k] != null)).length;
    return { bewohner: L.length, besuche: da.length, mitBesuchsort: L.filter((b) => b.orte && b.orte.besuch).length, bindung, uhr: +HILF.stunde().toFixed(2) };
};

// DAS ALTER (generationen S1, innenleben S3): das Alter, das der Leib jedes Bewohners zeigt — die Gestalt seiner Siedlung, in der er
// steht (`_bewohnerGestalten`: `ov.age` = das Alter des Genoms auf dem Regler „age“ 0–1 = 18–80 J, koerper-core), in Jahren
const ALTER = async (r, T, arg, HILF) => {
    const { S, L } = HILF;
    if (!L.length || !S || !Array.isArray(S.gestalten)) return { fehler: "keine Bewohner mit Gestalt am Messort" };
    const jahreG = (G) => (G && G.ov && Number.isFinite(G.ov.age) ? 18 + 62 * G.ov.age : null);
    const J = L.map((b) => jahreG(S.gestalten[b.gestalt])).filter((x) => x != null);
    if (!J.length) return { fehler: "keine Gestalt trägt ein Alter" };
    const kinder = J.filter((x) => x < 15).length;
    return {
        bewohner: L.length,
        gemessen: J.length,
        kinder,
        anteil: +(kinder / J.length).toFixed(4),
        jung: +Math.min(...J).toFixed(1),
        alt: +Math.max(...J).toFixed(1),
        gestalten: S.gestalten.map((G) => (jahreG(G) == null ? null : +jahreG(G).toFixed(1))),
        jahr: S.plan && Number.isFinite(S.plan.jahr) ? S.plan.jahr : null,
    };
};

// DAS GEFÜHL MIT ANLASS (innenleben S1): der nächste stehende Bewohner am Spieler, sein Gemüt (`_bewohnerGemuet`: die Haltung seines
// Akts, Kummer = die erinnerte Furcht) vor und nach der Tat 2 m neben ihm (das Kitz, `damageCreature` vom Spieler — der EINE
// Schadens-Weg ruft `_bewohnerZeuge`), der Gegenlauf ein Bewohner jenseits des Zeugen-Kreises; die Pose 3 m vor seinem Gesicht
const GEMUET = async (r, T, arg, HILF) => {
    const { s, A, L, pm, ab } = HILF;
    if (!L.length) return { fehler: "keine Bewohner am Messort" };
    s.renderer.setAnimationLoop(null);
    HILF.uhrAuf(arg.uhr);
    await HILF.takt(10);
    const b = L.filter((x) => x.leib && !x.drinnen && !x.weg && !x.amSteuer).sort((x, y) => ab(x.leib.position, pm) - ab(y.leib.position, pm))[0];
    if (!b) return { fehler: "kein stehender Bewohner draußen" };
    const gm = (x) => {
        const g = r._bewohnerGemuet(x);
        return { haltung: g.haltung, kummer: +Number(g.sorrow || 0).toFixed(3) };
    };
    const p = b.leib.position;
    const kontrolleB = L.find((x) => x.leib && !x.drinnen && ab(x.leib.position, p) > A.BEWOHNER.zeugeM + 10);
    const vor = gm(b), k0 = kontrolleB ? gm(kontrolleB) : null;
    const fx = p.x + 2, fz = p.z;
    const opfer = r.spawnCreatureAt(fx, r._voxelSurfaceY(fx, fz), fz, "happy", "wesen", { precise: true, bodySize: 0.6 });
    if (!opfer) return { fehler: "Spawn des Opfers" };
    const tat = r.damageCreature(opfer, 9999, { source: "player", fromPos: { x: pm.x, y: pm.y, z: pm.z } });
    await HILF.takt(10);
    const nach = gm(b), k1 = kontrolleB ? gm(kontrolleB) : null;
    for (const c of [...(s.creatures || []), ...(s.leichname || [])]) if (c === opfer) r.removeCreature(c);
    const q = b.leib.position, y = b.leib.rotation.y;
    const q2 = (v) => +v.toFixed(2);
    const gy = r.getTerrainHeightAt(q.x, q.z);
    return {
        pose: { px: q2(q.x + Math.sin(y) * 3), py: q2(gy + 1.6), pz: q2(q.z + Math.cos(y) * 3), lx: q2(q.x), ly: q2(gy + 1.5), lz: q2(q.z) },
        rolle: b.rolle || b.beruf || null,
        akt: b.akt == null ? null : String(b.akt),
        vor,
        nach,
        kontrolle: [k0, k1],
        tat: !!(tat && tat.ok),
    };
};

// KINDER UND ALTE IM GANG (innenleben S3): 8 Uhr (der Weg zum Werk), 4 Spiel-Sekunden im Takt des Spiels; je Bewohner draußen, der
// ≥ 0,5 m ging, sein Tempo (Weg ÷ Zeit) in der Altersgruppe seiner Gestalt (Dekade), dazu die Pose vor der dichtesten Gruppe
const KINDER = async (r, T, arg, HILF) => {
    const { s, A, S, L, ab } = HILF;
    if (!L.length || !S || !Array.isArray(S.gestalten)) return { fehler: "keine Bewohner mit Gestalt am Messort" };
    s.renderer.setAnimationLoop(null);
    HILF.uhrAuf(arg.uhr);
    const sek = 4;
    const p0 = new Map(HILF.draussen(40).map((b) => [b, { x: b.leib.position.x, z: b.leib.position.z }]));
    await HILF.takt(Math.round(sek / A.TAKT_DECKEL_S));
    const jahre = (b) => {
        const G = S.gestalten[b.gestalt];
        return G && G.ov && Number.isFinite(G.ov.age) ? 18 + 62 * G.ov.age : null;
    };
    const je = {};
    for (const [b, p] of p0) {
        if (!b.leib || b.drinnen) continue;
        const d = ab(b.leib.position, p), j = jahre(b);
        if (d < 0.5 || j == null) continue;
        const k = Math.floor(j / 10) * 10 + "–" + (Math.floor(j / 10) * 10 + 9);
        (je[k] = je[k] || []).push(d / sek);
    }
    const tempo = Object.fromEntries(Object.entries(je).sort().map(([k, v]) => [k, { n: v.length, ms: +(v.reduce((x, y) => x + y, 0) / v.length).toFixed(2) }]));
    const kinder = L.filter((b) => (jahre(b) != null ? jahre(b) < 15 : false)).length;
    return Object.assign({ bewohner: L.length, kinder, tempo }, HILF.pose() || { fehler: "keine Gruppe draußen binnen 20 m am Spieler" });
};

const PFAD = [
    "stamm/siedlung-*.js",
    "stamm/kreatur-*.js",
    "stamm/koerper-*.js",
    "stamm/bild-himmel.js",
    "stamm/dirigent-takt.js",
    "stamm/feld-nexus.js",
    "stamm/feld-leben.js",
    "stamm/daten.js",
    "koerper-core.js",
    "fachwerk-core.js",
    "scripts/lib/kreatur-proben.cjs",
    "scripts/lib/ausgabe-aufnahme.cjs",
    "spec/profiband/haushalt.json",
];
const ADAPTER = "[linse-gpu] amd/rdna-3 (Probe)";
const mut = (leiter, n, nIst, werte) => ({ leiter, adapter: ADAPTER, sprossen: { [n]: { art: "zahl", n: nIst, werte } } });
const um = (soll, wort) => ({ soll, wort });
const ge = (key, wort, soll) => ({ key, wort, soll, richtung: "≥" });
const le = (key, wort, soll) => ({ key, wort, soll, richtung: "≤" });
// strikt („über Tage“, „messbar“, „folgt“): kein erfundener Abstand; `herkunft` nennt den Satz, aus dem ein Soll ohne Zahl folgt
const gt = (key, wort, soll, herkunft) => Object.assign({ key, wort, soll, richtung: ">" }, herkunft ? { herkunft } : {});
const her = (m, herkunft) => Object.assign({}, m, { herkunft });
const nicht = (umfang, masse, fehlt) => ({ umfang, masse, erwartet: "nicht", fehlt });
const leser = (umfang, masse, fehlt, wo) => ({ umfang, masse, erwartet: "leser", fehlt, wo });
const FREMD = "eine Welt in der Sitzung — keine fremde Welt, keine 100 Saaten (die Fremdwelt-Probe R10)";

module.exports = (F) => [
    // ── mensch.geist.tag ── S2 der Tag der Stadt über 7 Tage am Ergebnis (Akt, Ort, Weg je Bewohner); S3–S8 jenseits der Stadt
    F.leiter("mensch.geist.tag", {
        sek: 60,
        mutiert: true,
        pfad: PFAD,
        bestehend: { 1: "mensch.K2#2" },
        sprossen: {
            2: { umfang: um(1000, "Bewohner der Stadt durch den Tag gefolgt"), masse: [le("abweichung", "größte Abweichung je ATUS-Hauptkategorie", 0.2), ge("tage", "Tage gefolgt", 7)] },
            3: nicht(um(10000, "Bewohner"), [le("abweichung", "größte Abweichung je Hauptkategorie", 0.2), ge("imBand", "Anteil gefolgter Personen im Band", 0.9), ge("vortag", "Anteil Tage anders als der Vortag mit Anlass", 0.3)], "10⁴ Bewohner: die Welt trägt höchstens die Stadt des Messorts"),
            4: { auge: { pose: "stadt-voll, Hauptgasse 7:45, Augenhöhe", vorbild: "Foto des Berufsverkehrs einer Großstadt (Prüfer trennt ≤ 0,65; Pflichten-Verteilung ≤ 15 %)" }, erwartet: "nicht", fehlt: "10⁵ Bewohner: die Welt trägt höchstens die Stadt des Messorts" },
            5: nicht(um(1000000, "Bewohner"), [le("zeitbudget", "Abweichung Zeitbudget gegen die Epoche", 0.1), ge("anteil", "Anteil plausibler Personen-Tage", 0.95)], "10⁶ Bewohner in 1 000 Saaten"),
            6: nicht(um(10000000, "Bewohner"), [ge("wiederkehr", "Anteil Wiederkehr nach 1 h ± 2 m", 0.99), le("fenster", "Abweichung Fenster-Belegung je Uhrzeit", 0.15)], "10⁷ Bewohner einer Megastadt"),
            7: nicht(um(1000000000, "Menschen über 5 Epochen und 5 Kulturen"), [le("zeitbudget", "Abweichung Zeitbudget gegen historische Quellen", 0.1), ge("anteil", "Anteil im Band", 0.95)], "10⁹ Menschen über Epochen und Kulturen"),
            8: nicht(um(100, "Welten"), [ge("r", "Korrelation Rhythmus und Tageslänge", 0.9)], FREMD),
        },
        seite: { STADT, ZENSUS, TAG_TAGE },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const welt = (name, arg) =>
                K.welt(
                    "const HILF = (" + H.seite.STADT + ")(r, T);\ntry {\n    return await (" + H.seite[name] + ")(r, T, " +
                        JSON.stringify(Object.assign({ ms: Math.max(1500, Math.floor((H.rest() - 4) * 1000)) }, arg || {})) + ", HILF);\n} finally {\n    HILF.zurueck();\n}",
                    Math.max(3000, Math.floor((H.rest() - 1) * 1000))
                );
            const pruef = (x, was) => {
                if (!x || x.fehler) throw new Error(was + ": " + ((x && x.fehler) || "ohne Antwort"));
                return x;
            };
            let zen = null;
            const zensus = async () => zen || (zen = pruef(await welt("ZENSUS"), "der Zensus der Stadt"));
            const wie = (z) => " (" + z.alle + " Bewohner in " + z.siedlungen + " Siedlungen, die Stadt " + z.stadt + " in " + z.haeuser + " Häusern, Saat " + z.saat + ")";
            for (const [n, fehlt, welten] of [
                [3, "10⁴ Bewohner, 100 gefolgte Personen über Tage", false],
                [4, "10⁵ Bewohner für das Bild des Berufsverkehrs", false],
                [5, "10⁶ Bewohner in 1 000 Saaten", false],
                [6, "10⁷–10⁸ Bewohner einer Megastadt", false],
                [7, "10⁹ Menschen über 5 Epochen und 5 Kulturen", false],
                [8, "100 fremde Welten mit eigener Tageslänge", true],
            ])
                await K.schritt(n, async () => {
                    const z = await zensus();
                    K.nicht(n, { n: welten ? 1 : z.alle, fehlt: fehlt + ": " + (welten ? "eine Welt in der Sitzung (Saat " + z.saat + "), der Tag hat 24 Stunden" : "die Welt trägt " + z.alle) + wie(z) });
                });
            // S2 zuletzt: die Probe endet an seiner Pose (die Stadt am Markt), die Sitzung schneidet den Preis dort
            await K.schritt(2, async () => {
                const t = pruef(await welt("TAG_TAGE", { stunden: [3, 7, 10, 12.5, 17.5, 21], tage: 7 }), "der Tag der Stadt");
                H.zeile("S2 " + t.proben + " Proben über " + t.tage + " Tage, Akte " + t.akte.join(" · ") + ", belegt " + t.belegt + " von 17");
                K.zahl(2, {
                    n: t.gefolgt,
                    werte: { abweichung: t.abweichung, tage: t.tage },
                    beleg: t.proben + " Proben (je Tag 3 · 7 · 10 · 12,5 · 17,5 · 21 Uhr) an " + t.bewohner + " Bewohnern, Akte " + t.akte.join(" · ") + ", Hauptkategorien belegt " + t.belegt + " von 17 " + JSON.stringify(t.anteile) + ", derselbe Akt wie am ersten Tag " + t.gleichVortag,
                    taeter: "koerper-core.js tagesPlan: " + t.akte.length + " Akte aus der Stunde allein (kein Wochentag: " + t.gleichVortag + " der Personen-Stunden wie am ersten Tag, kein Alter), " + t.leer + " von 17 Hauptkategorien leer",
                });
            });
        },
        proben: {
            2: [
                { name: "die Welt von heute: 6 Akte über 7 Tage, 12 Kategorien leer (Abweichung 1) — ROT an der Abweichung", j: mut("mensch.geist.tag", 2, 1092, { abweichung: 1, tage: 7 }), gruen: false, zahl: /ROT an größte Abweichung je ATUS-Hauptkategorie 1 verfehlt ≤ 0\.2/ },
                { name: "Attrappe: das Profil an EINEM Tag — ROT an den Tagen", j: mut("mensch.geist.tag", 2, 1092, { abweichung: 0.1, tage: 1 }), gruen: false, zahl: /ROT an Tage gefolgt 1 verfehlt ≥ 7/ },
                { name: "die Referenz fehlt (alle 17 belegt, Abweichung null) — ROT an der Abweichung", j: mut("mensch.geist.tag", 2, 1092, { abweichung: null, tage: 7 }), gruen: false, zahl: /ROT an größte Abweichung je ATUS-Hauptkategorie — verfehlt ≤ 0\.2/ },
            ],
        },
    }),

    // ── mensch.geist.gespraech ── kein Bewohner spricht: S2, S3 der fehlende Leser am Ergebnis gezählt; S4–S7 jenseits der Stadt
    F.leiter("mensch.geist.gespraech", {
        sek: 45,
        pfad: PFAD,
        bestehend: { 1: "mensch.K5#1" },
        sprossen: {
            2: leser(um(10, "sprechende Bewohner"), [ge("faktentreue", "Faktentreue der Antworten", 0.95), ge("bezug", "Anteil Gespräche mit Bezug auf die vorige Begegnung", 1)], "kein Bewohner ist ansprechbar: der Name des Gesprächs sucht nur state.creatures", "stamm/feld-nexus.js:1281"),
            3: leser(um(100, "Personen im Blick"), [ge("erinnert", "Anteil letzte Begegnung korrekt genannt", 0.95)], "kein Gedächtnis über Sitzungen: der Satz des Bewohners trägt keinen Namen und keine Erinnerung", "stamm/siedlung-bewohner.js:887"),
            4: nicht(um(10000, "Bewohner"), [ge("widerspruchsfrei", "Anteil widerspruchsfrei zur Welt", 0.95), le("erfindungen", "Anteil Erfindungen", 0.02)], "10⁴ Bewohner, 100 Befragte"),
            5: nicht(um(100000, "Bewohner"), [ge("imBand", "Kenntnis in 1 km nach 1 Tag im Diffusions-Band (1 = ja)", 1)], "10⁵ Bewohner, die Kunde einer Tat über 1 km"),
            6: { auge: { pose: "stadt-voll, 2 m vor zwei Bewohnern gleicher Rolle im Gespräch", vorbild: "menschliche Rollenspieler (2AFC ≤ 70 %, Prüfer trennt 2 Personen ≥ 0,9)" }, erwartet: "nicht", fehlt: "10⁶ Bewohner, und kein Bewohner spricht" },
            7: nicht(um(1000000000, "Menschen über Epochen"), [le("anachronismen", "Anteil Anachronismen", 0.01), ge("faktentreue", "Faktentreue über 1 000", 0.95)], "10⁹ Menschen über Epochen, die Zeitreise 1300 ↔ 2020"),
        },
        seite: { STADT, ZENSUS, SPRECHEN },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const welt = (name, arg) =>
                K.welt(
                    "const HILF = (" + H.seite.STADT + ")(r, T);\ntry {\n    return await (" + H.seite[name] + ")(r, T, " +
                        JSON.stringify(Object.assign({ ms: Math.max(1500, Math.floor((H.rest() - 4) * 1000)) }, arg || {})) + ", HILF);\n} finally {\n    HILF.zurueck();\n}",
                    Math.max(3000, Math.floor((H.rest() - 1) * 1000))
                );
            const pruef = (x, was) => {
                if (!x || x.fehler) throw new Error(was + ": " + ((x && x.fehler) || "ohne Antwort"));
                return x;
            };
            let zen = null, spr = null;
            const zensus = async () => zen || (zen = pruef(await welt("ZENSUS"), "der Zensus der Stadt"));
            const sprechen = async () => spr || (spr = pruef(await welt("SPRECHEN"), "der Ruf der Bewohner"));
            await K.schritt(2, async () => {
                const g = await sprechen();
                K.leser(2, { fehlt: "kein Bewohner ist ansprechbar: der Name des Gesprächs sucht nur state.creatures (" + g.erreichbar + " von " + g.bewohner + " Bewohnern im Ruf, " + g.mitName + " mit Namen, " + g.wesenMitNamen + " Wesen mit Namen)", wo: "stamm/feld-nexus.js:1281", n: g.erreichbar });
            });
            await K.schritt(3, async () => {
                const g = await sprechen();
                K.leser(3, { fehlt: "kein Gedächtnis über Sitzungen: der Satz des Bewohners entsteht je Sitzung aus dem Plan, ohne Namen und Erinnerung (" + g.mitGedaechtnis + " von " + g.bewohner + " Leibern mit Erinnerung dieser Sitzung, " + g.mitName + " mit Namen)", wo: "stamm/siedlung-bewohner.js:887", n: g.mitGedaechtnis });
            });
            for (const [n, fehlt] of [[4, "10⁴ Bewohner, 100 Befragte"], [5, "10⁵ Bewohner, die Kunde einer Tat über 1 km nach 1 Tag"], [6, "10⁶ Bewohner für das Gespräch gegen Rollenspieler"], [7, "10⁹ Menschen über Epochen (1300 ↔ 2020)"]])
                await K.schritt(n, async () => {
                    const z = await zensus();
                    K.nicht(n, { n: z.alle, fehlt: fehlt + ": die Welt trägt " + z.alle + " Bewohner in " + z.siedlungen + " Siedlungen (die Stadt " + z.stadt + "), keiner spricht" });
                });
        },
        proben: {
            2: [{ name: "Attrappe: 10 Sprechende mit erfundenen Antworten — ROT an der Faktentreue", j: mut("mensch.geist.gespraech", 2, 10, { faktentreue: 0.5, bezug: 1 }), gruen: false, zahl: /ROT an Faktentreue der Antworten 0\.5 verfehlt ≥ 0\.95/ }],
            4: [{ name: "die Stadt von heute (1092 < 10⁴) — ROT am Umfang", j: mut("mensch.geist.gespraech", 4, 1092, { widerspruchsfrei: 1, erfindungen: 0 }), gruen: false, zahl: /ROT an Umfang 1092 < 10000 Bewohner/ }],
        },
    }),

    // ── mensch.geist.netz ── S1 der Besuch am Ergebnis (der Leser der Bindung fehlt), S2 das Bild am Markt; S3–S6 jenseits
    F.leiter("mensch.geist.netz", {
        sek: 45,
        mutiert: true,
        pfad: PFAD,
        sprossen: {
            1: leser(um(100, "Bewohner"), [ge("besuche", "Anteil Besuche bei Verwandten oder Freunden", 0.6)], "keine Verwandtschaft und keine Freundschaft: der Besuch wählt ein Haus fern von Heim und Platz nach Same und Angebot", "koerper-core.js:5316"),
            2: { auge: { pose: "stadt-voll Markt, 7 m vor der dichtesten Gruppe, Augenhöhe 1,7 m, 17:36", vorbild: "Gesten zwischen Freund, Feind und Fremdem (Prüfer sagt die Beziehung ≥ 0,7)" } },
            3: nicht(um(10000, "Bewohner"), [ge("meiden", "Mehr-Meiden der Bekannten des Opfers", 0.3)], "10⁴ Bewohner mit Bekannten"),
            4: nicht(um(1000000, "Bewohner"), [{ key: "pfad", wort: "mittlere Pfadlänge", von: 4, bis: 7 }, ge("gleich", "Anteil gleicher Antworten bei Wiederholung", 1)], "10⁶ Bewohner, 1 000 befragte Paare"),
            5: nicht(um(1000000000, "Menschen über 5 Kulturen"), [ge("heirat", "Anteil konsistenter Heiratsregeln", 0.9)], "10⁹ Menschen über Kulturen"),
            6: nicht(um(100, "Welten fremder Arten"), [ge("rang", "Rang der vorhergesagten Netzform", 0.7)], FREMD),
        },
        seite: { STADT, ZENSUS, BESUCH, POSE },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const welt = (name, arg) =>
                K.welt(
                    "const HILF = (" + H.seite.STADT + ")(r, T);\ntry {\n    return await (" + H.seite[name] + ")(r, T, " +
                        JSON.stringify(Object.assign({ ms: Math.max(1500, Math.floor((H.rest() - 4) * 1000)) }, arg || {})) + ", HILF);\n} finally {\n    HILF.zurueck();\n}",
                    Math.max(3000, Math.floor((H.rest() - 1) * 1000))
                );
            const pruef = (x, was) => {
                if (!x || x.fehler) throw new Error(was + ": " + ((x && x.fehler) || "ohne Antwort"));
                return x;
            };
            let zen = null;
            const zensus = async () => zen || (zen = pruef(await welt("ZENSUS"), "der Zensus der Stadt"));
            for (const [n, fehlt, welten] of [[3, "10⁴ Bewohner mit Bekannten, die eine Tat meiden", false], [4, "10⁶ Bewohner, 1 000 befragte Paare", false], [5, "10⁹ Menschen über 5 Kulturen", false], [6, "100 Welten fremder Arten", true]])
                await K.schritt(n, async () => {
                    const z = await zensus();
                    K.nicht(n, { n: welten ? 1 : z.alle, fehlt: fehlt + ": " + (welten ? "eine Welt in der Sitzung (Saat " + z.saat + "), eine Art" : "die Welt trägt " + z.alle + " Bewohner in " + z.siedlungen + " Siedlungen (die Stadt " + z.stadt + ")") });
                });
            await K.schritt(1, async () => {
                const b = pruef(await welt("BESUCH", { uhr: 17.6 }), "der Besuch in der Stadt");
                H.zeile("S1 um " + b.uhr + " Uhr " + b.besuche + " beim Besuch, Bindungen im Satz " + b.bindung);
                K.leser(1, { fehlt: "keine Verwandtschaft und keine Freundschaft: der Besuch wählt ein Haus fern von Heim und Platz nach Same und Angebot (" + b.besuche + " beim Besuch um " + b.uhr + " Uhr, " + b.mitBesuchsort + " von " + b.bewohner + " mit Besuchsort, " + b.bindung + " mit einer Bindung im Satz)", wo: "koerper-core.js:5316", n: b.besuche });
            });
            await K.schritt(2, async () => {
                const p = pruef(await welt("POSE"), "die Pose am Markt");
                const bild = await K.bild(2, p.pose);
                K.auge(2, { bild: bild.datei, pose: "stadt-voll Markt (" + [p.pose.px, p.pose.py, p.pose.pz].join(", ") + ") → (" + [p.pose.lx, p.pose.ly, p.pose.lz].join(", ") + ")", mass: "Gruppe " + p.dicht + " Menschen in 4 m (" + p.dichteQm + " P je m²), " + p.imKreis + " draußen binnen 20 m; der Satz des Bewohners trägt keine Bindung — Gruß und Meiden ohne Leser" + (bild.abnahme ? " · Abnahme " + bild.abnahme : "") });
            });
        },
        proben: {
            1: [{ name: "Attrappe: Besuche ohne Bindung (Anteil 0) — ROT am Anteil", j: mut("mensch.geist.netz", 1, 300, { besuche: 0 }), gruen: false, zahl: /ROT an Anteil Besuche bei Verwandten oder Freunden 0 verfehlt ≥ 0\.6/ }],
        },
    }),

    // ── mensch.geist.generationen ── S1 die Alter am Leib der Stadt, S2 das Bild, S3 der fehlende Leser von Geburt und Tod
    F.leiter("mensch.geist.generationen", {
        sek: 45,
        pfad: PFAD,
        sprossen: {
            1: { umfang: null, masse: [ge("kinder", "Anteil Kinder unter 15 J", 0.35)] },
            2: { auge: { pose: "stadt-voll Markt, 7 m vor der dichtesten Gruppe, Augenhöhe 1,7 m", vorbild: "Familien über Lebensphasen (Prüfer ordnet Kinder den Eltern ≥ 0,7; Gang je Altersgruppe ≤ 15 %)" } },
            3: leser(um(1000, "Bewohner"), [le("abweichungJ", "Abweichung der Lebenserwartung gegen die Epoche in J", 3)], "keine Geburt und kein Tod: jede Person ist f(Plan-Same, Haus, Index), ohne Lebensjahr", "stamm/siedlung-bewohner.js:848"),
            4: nicht(um(10000, "Bewohner"), [ge("erkannt", "Anteil dieselbe Person nach 10 J erkannt", 0.9), le("fremde", "Anteil Fremde für erkannt gehalten", 0.1)], "10⁴ Bewohner über einen Sprung von 10 J"),
            5: nicht(um(100000, "Bewohner"), [ge("nachfahren", "Häuser mit Nachfahren nach 50 J im Band (1 = ja)", 1), her(ge("beruf", "Beruf Vater → Kind ÷ Erwartung", 1), "„Beruf Vater → Kind ≥ Erwartung“: die Quote der Vererbung geteilt durch die erwartete, mindestens 1")], "10⁵ Bewohner über 50 J Erbe"),
            6: nicht(um(1000000, "Bewohner"), [her(ge("pyramiden", "Pyramiden im Band der Referenz (1300, 1800, 2000)", 3), "die drei im Wortlaut genannten Stichjahre 1300/1800/2000: jede ihrer Pyramiden gegen die Referenz, 3 von 3"), ge("ahnen", "Anteil gleicher Ahnenreihen bei Wiederholung", 1)], "10⁶–10⁷ Bewohner über 1 000 J"),
            7: nicht(um(1000000000, "Menschen über die Menschenzeit"), [le("logFehler", "log-Fehler der Weltbevölkerung je Jahrtausend", 0.3), ge("enkelin", "Ähnlichkeit der Enkelin", 0.7)], "10⁹ Menschen über die Menschenzeit"),
            8: nicht(um(20, "Saaten fremder Evolutionen"), [ge("stabil", "Anteil stabiler Populationen", 0.8), ge("pyramide", "Anteil Saaten, deren Pyramide der Lebensspanne folgt", 1)], FREMD),
        },
        seite: { STADT, ZENSUS, ALTER, POSE },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const welt = (name, arg) =>
                K.welt(
                    "const HILF = (" + H.seite.STADT + ")(r, T);\ntry {\n    return await (" + H.seite[name] + ")(r, T, " +
                        JSON.stringify(Object.assign({ ms: Math.max(1500, Math.floor((H.rest() - 4) * 1000)) }, arg || {})) + ", HILF);\n} finally {\n    HILF.zurueck();\n}",
                    Math.max(3000, Math.floor((H.rest() - 1) * 1000))
                );
            const pruef = (x, was) => {
                if (!x || x.fehler) throw new Error(was + ": " + ((x && x.fehler) || "ohne Antwort"));
                return x;
            };
            let zen = null, alt = null;
            const zensus = async () => zen || (zen = pruef(await welt("ZENSUS"), "der Zensus der Stadt"));
            const alter = async () => alt || (alt = pruef(await welt("ALTER"), "das Alter der Stadt"));
            for (const [n, fehlt, welten] of [[4, "10⁴ Bewohner über einen Sprung von 10 J", false], [5, "10⁵ Bewohner über 50 J Erbe", false], [6, "10⁶–10⁷ Bewohner über 1 000 J", false], [7, "10⁹ Menschen über die Menschenzeit", false], [8, "20 Saaten fremder Evolutionen", true]])
                await K.schritt(n, async () => {
                    const z = await zensus();
                    K.nicht(n, { n: welten ? 1 : z.alle, fehlt: fehlt + ": " + (welten ? "eine Welt in der Sitzung (Saat " + z.saat + "), eine Evolution" : "die Welt trägt " + z.alle + " Bewohner in " + z.siedlungen + " Siedlungen (die Stadt " + z.stadt + "), kein Lebenslauf") });
                });
            await K.schritt(3, async () => {
                const a = await alter();
                K.leser(3, { fehlt: "keine Geburt und kein Tod: jede Person ist f(Plan-Same, Haus, Index), ohne Lebensjahr (" + a.gemessen + " Bewohner, Alter " + a.jung + "–" + a.alt + " J, Epoche " + a.jahr + ")", wo: "stamm/siedlung-bewohner.js:848", n: a.gemessen });
            });
            await K.schritt(2, async () => {
                const a = await alter();
                const p = pruef(await welt("POSE"), "die Pose am Markt");
                const bild = await K.bild(2, p.pose);
                K.auge(2, { bild: bild.datei, pose: "stadt-voll Markt (" + [p.pose.px, p.pose.py, p.pose.pz].join(", ") + ") → (" + [p.pose.lx, p.pose.ly, p.pose.lz].join(", ") + ")", mass: "Kinder " + a.kinder + " von " + a.gemessen + ", die Gestalten der Stadt " + JSON.stringify(a.gestalten) + " J; Gruppe " + p.dicht + " in 4 m" + (bild.abnahme ? " · Abnahme " + bild.abnahme : "") });
            });
            // S1 zuletzt: die Probe endet an der Pose der Stadt (der Spieler bleibt am Markt)
            await K.schritt(1, async () => {
                const a = await alter();
                H.zeile("S1 Kinder " + a.kinder + " von " + a.gemessen + ", Alter " + a.jung + "–" + a.alt + " J");
                K.zahl(1, {
                    n: a.gemessen,
                    werte: { kinder: a.anteil },
                    beleg: "Alter am Leib (die Gestalt jedes Bewohners, Regler 18–80 J) " + a.jung + "–" + a.alt + " J, die Gestalten " + JSON.stringify(a.gestalten) + ", Epoche " + a.jahr + ", " + a.bewohner + " Bewohner",
                    taeter: "stamm/koerper-leib.js:55 das Alter des Genoms 0,05–0,5 auf dem Regler (18–80 J) — kein Kind, kein Greis",
                });
            });
        },
        proben: {
            1: [
                { name: "die Stadt von heute: kein Kind — ROT am Anteil der Kinder", j: mut("mensch.geist.generationen", 1, 1092, { kinder: 0 }), gruen: false, zahl: /ROT an Anteil Kinder unter 15 J 0 verfehlt ≥ 0\.35/ },
                { name: "ein Ort ohne Bewohner — ROT am Umfang", j: mut("mensch.geist.generationen", 1, 0, { kinder: 0.4 }), gruen: false, zahl: /ROT an Umfang 0 < 1/ },
            ],
        },
    }),

    // ── mensch.geist.absicht ── S1 der Zug am Tag der Stadt (blind zugeordnet), S2 der fehlende Leser am Ergebnis gezählt; S3–S6 jenseits der Stadt
    F.leiter("mensch.geist.absicht", {
        sek: 45,
        pfad: PFAD,
        sprossen: {
            1: { umfang: um(100, "Bewohner"), masse: [ge("zug", "Anteil ihrem Zug zugeordnet", 0.6)] },
            2: leser(um(1000, "Bewohner"), [ge("fortschritt", "Anteil sichtbarer Fortschritt nach 1 Spieljahr", 0.5)], "kein Ziel über Monate: der Satz des Bewohners trägt kein Ziel, keinen Vorrat, keinen Fortschritt", "stamm/siedlung-bewohner.js:887"),
            3: nicht(um(10000, "Bewohner"), [ge("ziele", "Anteil erklärter Ziele in der Welt", 0.3), ge("rueckfuehrbar", "Anteil Ziele auf eine Person rückführbar", 1)], "10⁴ Bewohner über einen Sprung von 10 J"),
            4: { auge: { pose: "stadt-voll, je Saat die Geschichte eines Bewohners", vorbild: "Geschichten „erzählenswert und folgerichtig“ (Panel ≥ 0,5)" }, erwartet: "nicht", fehlt: "10⁶ Bewohner in 100 Saaten" },
            5: nicht(um(1000000000, "Menschen über Epochen"), [le("anachron", "Anteil anachronistischer Ziele", 0.01), ge("verteilung", "Verteilung der Ziele im historischen Band (1 = ja)", 1)], "10⁹ Menschen über Epochen"),
            6: nicht(um(100, "Welten fremder Gesellschaften"), [ge("rang", "Rang des vorhergesagten Lebensentwurfs", 0.7)], FREMD),
        },
        seite: { STADT, ZENSUS, ZUEGE },
        // DER MESSORT IM UMFANG (k2-mensch.js K.messort, 23.11.): S1 „10²“ Bewohner, 20 Personen nach einem Spieltag (Klasse Ort, „P · Dorf“)
        // — die Stadt (91 Häuser im Plan); das Dorf (50 Bewohner) trägt 10² nicht, die volle Stadt maß den Preis am 13-fachen (564,7 MB)
        messe: async (H, K) => {
            await K.messort("stadt");
            const welt = (name, arg) =>
                K.welt(
                    "const HILF = (" + H.seite.STADT + ")(r, T);\ntry {\n    return await (" + H.seite[name] + ")(r, T, " +
                        JSON.stringify(Object.assign({ ms: Math.max(1500, Math.floor((H.rest() - 4) * 1000)) }, arg || {})) + ", HILF);\n} finally {\n    HILF.zurueck();\n}",
                    Math.max(3000, Math.floor((H.rest() - 1) * 1000))
                );
            const pruef = (x, was) => {
                if (!x || x.fehler) throw new Error(was + ": " + ((x && x.fehler) || "ohne Antwort"));
                return x;
            };
            let zen = null;
            const zensus = async () => zen || (zen = pruef(await welt("ZENSUS"), "der Zensus der Stadt"));
            await K.schritt(1, async () => {
                const z = await zensus();
                const zg = pruef(await welt("ZUEGE", { n: 100 }), "der Zug am Tag der Stadt");
                H.zeile("S1 Zug zugeordnet erste 20 " + zg.t20 + ", erste " + zg.n + " " + zg.alle + " (" + zg.n + " Bewohner)");
                K.zahl(1, {
                    n: zg.n,
                    werte: { zug: Math.min(zg.t20, zg.alle) },
                    beleg: "das Soll der Stunde (`_bewohnerSoll`) je 15 min über 24 h, der blinde Zuordner von gate:mensch-zuege gegen koerper `tagesZug`: erste 20 " + zg.t20 + ", erste " + zg.n + " " + zg.alle + " (" + z.stadt + " in der Stadt), je Zug " + JSON.stringify(zg.tafel) + ", Regen " + zg.regen + ", Viertelstunden ohne Ort " + zg.weicht,
                    taeter: "koerper-core.js tagesPlan · TAGES_GESETZ.zuege — der Zug verschiebt die Wenden des Tags nicht weit genug, dass der Tag ihn trägt",
                });
            });
            await K.schritt(2, async () => {
                const z = await zensus();
                K.leser(2, { fehlt: "kein Ziel über Monate: der Satz des Bewohners trägt kein Ziel, keinen Vorrat, keinen Fortschritt (" + z.stadt + " Bewohner der Stadt)", wo: "stamm/siedlung-bewohner.js:887", n: z.stadt });
            });
            for (const [n, fehlt, welten] of [[3, "10⁴ Bewohner über einen Sprung von 10 J", false], [4, "10⁶ Bewohner in 100 Saaten", false], [5, "10⁹ Menschen über Epochen", false], [6, "100 Welten fremder Gesellschaften", true]])
                await K.schritt(n, async () => {
                    const z = await zensus();
                    K.nicht(n, { n: welten ? 1 : z.alle, fehlt: fehlt + ": " + (welten ? "eine Welt in der Sitzung (Saat " + z.saat + "), eine Gesellschaft" : "die Welt trägt " + z.alle + " Bewohner in " + z.siedlungen + " Siedlungen (die Stadt " + z.stadt + "), keiner trägt ein Ziel") });
                });
        },
        proben: {
            1: [{ name: "Attrappe: 20 Personen, Zuordnung beim Raten (1 von 8) — ROT am Anteil", j: mut("mensch.geist.absicht", 1, 100, { zug: 0.125 }), gruen: false, zahl: /ROT an Anteil ihrem Zug zugeordnet 0\.125 verfehlt ≥ 0\.6/ },
                { name: "die Stadt trägt ihren Zug (0,72 über 1 092)", j: mut("mensch.geist.absicht", 1, 1092, { zug: 0.72 }), gruen: true },
                { name: "zu wenige Bewohner — ROT am Umfang", j: mut("mensch.geist.absicht", 1, 40, { zug: 0.9 }), gruen: false, zahl: /ROT an Umfang 40 < 100/ },
            ],
        },
    }),

    // ── mensch.geist.innenleben ── S1 das Gefühl mit Anlass am Leib (Bild), S3 Kinder und Alte im Gang (Bild), S2 der fehlende Leser
    F.leiter("mensch.geist.innenleben", {
        sek: 50,
        mutiert: true,
        pfad: PFAD,
        sprossen: {
            1: {
                auge: { pose: "stadt-voll Markt, 3 m vor dem Gesicht des nächsten stehenden Bewohners, nach der Tat 2 m neben ihm, 10 Uhr", vorbild: "Film von Menschen in 4 Gefühlen mit Anlass (Panel nennt das Gefühl ≥ 70 %; Gegenlauf ohne Anlass neutral)" },
                erwartet: "nicht",
                fehlt: "4 Gefühle mit Anlass: das Gemüt trägt 1 (Furcht), ohne Anlass nicht neutral (Abend traurig, Spiel froh), das Gesicht ohne Miene",
            },
            2: leser(um(100, "Bewohner"), [ge("angehoerige", "Anteil Angehörige mit geändertem Tag", 1), gt("tage", "Tage der Änderung", 1, "der Plural „über Tage“: länger als ein Tag, strikt über 1"), ge("zurueck", "Anteil Angehörige, deren Tag zurückkehrt", 1), le("kontrolle", "Anteil Kontrollgruppe mit geändertem Tag", 0)], "kein Tod eines Bewohners und keine Trauer: das Soll der Stunde liest Plan und Weichen, nie einen Verlust", "stamm/siedlung-bewohner.js:2219"),
            3: { auge: { pose: "stadt-voll Markt, 7 m vor der dichtesten Gruppe, Augenhöhe 1,7 m, 8 Uhr", vorbild: "spielende Kinder (Fangen, Ball, Verstecken: Panel ≥ 70 %) und Gangtempo-Normtafeln je Alter (±15 %)" } },
            4: nicht(um(10000, "Bewohner"), [ge("r", "Korrelation Abstand und Blick zur Bindung", 0.6), ge("anlass", "Anteil Wenden mit Anlass", 1)], "10⁴ Bewohner, 100 Paare über 1 Spieljahr"),
            5: nicht(um(100000, "Bewohner"), [gt("meiden", "Mehr-Meiden des Unglücksorts gegen den Gegenlauf ohne Unglück", 0), gt("wochen", "Wochen, über die Zeugen den Ort meiden", 1, "der Plural „über Wochen“: länger als eine Woche, strikt über 1"), gt("lachen", "Mehr-Lachen nach dem Scherz gegen ohne Scherz", 0)], "10⁵ Bewohner mit Humor, Traum und Not"),
            6: { auge: { pose: "Ego in der Rolle eines Bewohners, 5 min", vorbild: "das Gefühl der Rolle, von blinden Spielern genannt (≥ 70 %)" }, erwartet: "nicht", fehlt: "keine Rolle für den Spieler: kein Bewohner ist als Spieler-Leib zu tragen" },
            7: nicht(null, [ge("arten", "Anteil gelesener Arten aller Welten", 1), ge("rang", "Rang des gelesenen Anlasses", 0.7)], "jede Art jeder Welt: eine Welt in der Sitzung, keine fremde Art (die Fremdwelt-Probe R10)"),
        },
        seite: { STADT, ZENSUS, GEMUET, KINDER, FAECHER, HALTUNG_AN },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const welt = (name, arg) =>
                K.welt(
                    "const HILF = (" + H.seite.STADT + ")(r, T);\ntry {\n    return await (" + H.seite[name] + ")(r, T, " +
                        JSON.stringify(Object.assign({ ms: Math.max(1500, Math.floor((H.rest() - 4) * 1000)) }, arg || {})) + ", HILF);\n} finally {\n    HILF.zurueck();\n}",
                    Math.max(3000, Math.floor((H.rest() - 1) * 1000))
                );
            const pruef = (x, was) => {
                if (!x || x.fehler) throw new Error(was + ": " + ((x && x.fehler) || "ohne Antwort"));
                return x;
            };
            let zen = null;
            const zensus = async () => zen || (zen = pruef(await welt("ZENSUS"), "der Zensus der Stadt"));
            await K.schritt(2, async () => {
                const z = await zensus();
                K.leser(2, { fehlt: "kein Tod eines Bewohners und keine Trauer: das Soll der Stunde liest Plan und Weichen, nie einen Verlust (" + z.stadt + " Bewohner der Stadt, keiner stirbt)", wo: "stamm/siedlung-bewohner.js:2219", n: z.stadt });
            });
            for (const [n, fehlt, welten] of [[4, "10⁴ Bewohner, 100 Paare über 1 Spieljahr", false], [5, "10⁵ Bewohner mit Humor, Traum und Not", false], [6, "keine Rolle für den Spieler: kein Bewohner ist als Spieler-Leib zu tragen", false], [7, "jede Art jeder Welt", true]])
                await K.schritt(n, async () => {
                    const z = await zensus();
                    K.nicht(n, n === 6 ? { n: 0, fehlt: fehlt + " (0 von " + z.stadt + " Bewohnern als Rolle, 5 min je blindem Spieler)" } : { n: welten ? 1 : z.alle, fehlt: fehlt + ": " + (welten ? "eine Welt in der Sitzung (Saat " + z.saat + "), eine Art" : "die Welt trägt " + z.alle + " Bewohner in " + z.siedlungen + " Siedlungen (die Stadt " + z.stadt + ")") });
                });
            await K.schritt(3, async () => {
                const k = pruef(await welt("KINDER", { uhr: 8 }), "Kinder und Alte im Gang");
                if (!k.pose) throw new Error("die Pose am Markt: " + (k.fehler || "ohne Gruppe"));
                const bild = await K.bild(3, k.pose);
                K.auge(3, { bild: bild.datei, pose: "stadt-voll Markt 8 Uhr (" + [k.pose.px, k.pose.py, k.pose.pz].join(", ") + ") → (" + [k.pose.lx, k.pose.ly, k.pose.lz].join(", ") + ")", mass: "Kinder " + k.kinder + " von " + k.bewohner + "; Gangtempo m/s je Alter " + JSON.stringify(k.tempo) + (bild.abnahme ? " · Abnahme " + bild.abnahme : "") });
            });
            // S1 zuletzt (die niedrigste Sprosse, die Probe endet an ihrer Pose) AM GESETZ (der Fächer, stationen/faecher.js): 7 Akte des
            // Tags × 5 Anlässe im Gedächtnis des Leibs (HALTUNG_AN, k2-mensch-leib.js) — welche der 4 Gefühle (Freude, Trauer, Zorn,
            // Furcht) trägt das Gemüt MIT Anlass in Stand und Gang, welche OHNE Anlass (der Gegenlauf: neutral), und welche Achse der
            // Profile bewegt eine Miene. DAS BAND (Coulson 2004, J. Nonverbal Behav. 28: 176 statische Haltungen, Treffer bis > 90 % für
            // Zorn und Trauer, Furcht und Überraschung verwechselt; Ekman: die Miene trägt das Gefühl im Gesicht). Fehlt dem Gesetz der
            // Umfang, „Umfang nicht erzeugbar“ beim Namen; die Tat der warmen Welt (GEMUET) bleibt der Beleg daneben
            await K.schritt(1, async () => {
                const EMO = ["joy", "sad", "angry", "fear"];
                const basis = (aus, akt, wo) => {
                    const x = aus.find((y) => y.a.zeit === "ohne" && y.a.ort === akt);
                    return x ? x.w.je.wohnhaus[wo] : null;
                };
                const mitAnlass = (wo) => (v, aus) =>
                    Array.from(new Set(aus.filter((x) => x.a.zeit !== "ohne" && EMO.includes(x.w.je.wohnhaus[wo]) && x.w.je.wohnhaus[wo] !== basis(aus, x.a.ort, wo)).map((x) => x.w.je.wohnhaus[wo])));
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: { fn: H.seite.HALTUNG_AN, export: "stamm/siedlung-bewohner.js:2725 _bewohnerGemuet (:2730 sorrow = chaos = die erinnerte Furcht) → stamm/koerper-leib.js:3096 _koerperMotionName", leser: "stamm/koerper-leib.js:3091" },
                    // die Akte des Tags (koerper-core.js:5677 tagesPlan) × die Anlässe im Gedächtnis des Leibs („ohne“ = der Gegenlauf)
                    adressen: { orte: ["schlaf", "morgen", "arbeit", "mittag", "besuch", "spiel", "abend"], zeiten: ["ohne", "gewalt", "geschlagen", "gefuettert", "spoken"] },
                    masse: {
                        stand: { wie: mitAnlass("stand") },
                        gang: { wie: mitAnlass("geht") },
                        gegenlauf: { wie: (v, aus) => aus.filter((x) => x.a.zeit === "ohne" && EMO.includes(x.w.je.wohnhaus.stand)).map((x) => x.a.ort + "→" + x.w.je.wohnhaus.stand) },
                        stumm: { wie: (v, aus) => Array.from(new Set(aus.filter((x) => x.a.zeit !== "ohne").map((x) => x.a.zeit))).filter((t) => aus.filter((x) => x.a.zeit === t).every((x) => x.w.je.wohnhaus.stand === basis(aus, x.a.ort, "stand"))) },
                        miene: { wie: "max", feld: "miene" },
                        gesicht: { wie: (v, aus) => (aus[0] ? aus[0].w.gesicht : []) },
                    },
                    schlecht: { feld: "ohneAnlassGefuehl", richtung: "max" },
                    pose: (a, w) => "Akt " + a.ort + ", Anlass " + a.zeit + ": steht " + w.je.wohnhaus.stand + ", geht " + w.je.wohnhaus.geht + " (sorrow " + w.je.wohnhaus.sorrow + ", chaos " + w.je.wohnhaus.chaos + ")",
                    ungemessen: ["der Film von 5 s je Gefühl (Panel nennt das Gefühl ≥ 70 %): ungemessen bis zum Gerät (die Bildpflicht braucht die Karte und das Panel)"],
                    ms: Math.max(3000, Math.floor((H.rest() - 8) * 1000)),
                });
                const W = R.werte;
                H.zeile("Innenleben S1: " + R.akte.slice(0, 700) + " · " + JSON.stringify(W));
                if (R.fehlt && !R.gemessen) return K.nicht(1, { n: 0, fehlt: "4 Gefühle mit Anlass: " + R.fehlt });
                try {
                    const g = pruef(await welt("GEMUET", { uhr: 10 }), "das Gefühl mit Anlass");
                    H.zeile("S1 warme Welt: Gemüt vor der Tat " + JSON.stringify(g.vor) + " → nach " + JSON.stringify(g.nach) + " (Tat " + g.tat + "), Gegenlauf " + JSON.stringify(g.kontrolle));
                } catch (e) {
                    H.zeile("S1 warme Welt: die Tat warf: " + String((e && e.message) || e).slice(0, 200));
                }
                const voll = W.stand.length >= 4 && W.gang.length >= 4 && !W.gegenlauf.length && W.miene > 0;
                if (!voll)
                    return K.nicht(1, {
                        n: W.stand.length,
                        fehlt: "4 Gefühle mit Anlass: im Stand " + W.stand.length + " (" + W.stand.join(", ") + "), im Gang " + W.gang.length + "; " + W.stumm.join(", ") + " ohne Gefühl, Zorn nie (sorrow = chaos, stamm/siedlung-bewohner.js:2730); ohne Anlass " + W.gegenlauf.join(", ") + " (koerper-core.js:5432); Miene " + W.miene + " Achsen (MOTION: " + W.gesicht.join(", ") + ")",
                    });
                const g = pruef(await welt("GEMUET", { uhr: 10 }), "das Gefühl mit Anlass");
                const bild = await K.bild(1, g.pose);
                K.auge(1, { bild: bild.datei, pose: "stadt-voll Markt 10 Uhr, 3 m vor " + (g.rolle || "einem Bewohner") + " (" + [g.pose.px, g.pose.py, g.pose.pz].join(", ") + ") → (" + [g.pose.lx, g.pose.ly, g.pose.lz].join(", ") + ")", mass: R.akte.slice(0, 300) });
            });
        },
        proben: {
            2: [
                { name: "Attrappe: kein Angehöriger ändert seinen Tag — ROT an den Angehörigen", j: mut("mensch.geist.innenleben", 2, 100, { angehoerige: 0, tage: 3, zurueck: 1, kontrolle: 0 }), gruen: false, zahl: /ROT an Anteil Angehörige mit geändertem Tag 0 verfehlt ≥ 1/ },
                { name: "Gegenlauf: die Kontrollgruppe ändert sich mit — ROT an der Kontrolle", j: mut("mensch.geist.innenleben", 2, 100, { angehoerige: 1, tage: 3, zurueck: 1, kontrolle: 0.3 }), gruen: false, zahl: /ROT an Anteil Kontrollgruppe mit geändertem Tag 0\.3 verfehlt ≤ 0/ },
                { name: "die Trauer eines einzigen Tags (1 Tag, nicht „über Tage“) — ROT an den Tagen", j: mut("mensch.geist.innenleben", 2, 100, { angehoerige: 1, tage: 1, zurueck: 1, kontrolle: 0 }), gruen: false, zahl: /ROT an Tage der Änderung 1 verfehlt > 1/ },
            ],
        },
    }),
];
// die EINE Stadt der Seite für die Perspektive menge (k2-mensch-menge.js), nie ein Zwilling
module.exports.STADT = STADT;
module.exports.ZENSUS = ZENSUS;
module.exports.POSE = POSE;
