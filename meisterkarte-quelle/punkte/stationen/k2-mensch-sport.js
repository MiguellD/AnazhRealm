// DIE RICHTER DER PERSPEKTIVE sport (Meisterkarte 2, Kapitel mensch): acht Leitern, 54 Sprossen — je Leiter EINE Probe in der warmen
// Welt der Sitzung. Gemessen wird am ERGEBNIS der Welt: der Leib des Spielers im Takt des Spiels (Tempo, Sprunghöhe, der Fuß im Stand
// auf Fläche und Hang), die Bewohner (Akt jetzt und am Nachmittag nach ihrem Tages-Gesetz, Lauf-Tempo, Alter, Lage und Blick), die
// Bühnen des Genesis-Orts (Arena, Spielplatz) und was in der Welt steht (Geräte, Wagen, Strecken). Wo das Spiel nichts trägt, was den
// Richter erfüllen könnte (kein Wettkampf, kein Ball, keine Übung, kein Brett), zählt die Probe trotzdem die Welt und urteilt
// „fehlender Leser“ an der Stelle, an der der Haken sitzen müsste; wo der Umfang fehlt (Welten, Planeten, 10⁵ Zuschauer), „Umfang
// nicht erzeugbar“ — beides ROT, nie ein Skip.
"use strict";

// ───────────────────────── DIE SEITE DER WELT (als Text an K.welt; nichts aus dem Modul) ─────────────────────────

// DER SPORT-ZENSUS: je Bewohner mit Leib Lage, Blick, Akt (jetzt und zur Stunde `stunde` aus seinem Tages-Gesetz, `_bewohnerSoll` —
// gelesen, nichts gesetzt), Lauf-Tempo (`b.tempo`, das Tempo seines Gangs), Alter, ob er ein Können-Profil, einen Wagen trägt. Der
// Sport-Akt ist jeder Akt, der nach Spiel, Wettkampf, Tanz, Kampf, Ball oder Brett heißt. Dazu die Bühnen des Genesis-Orts
// (`_genesisWerkListe.buehnen`), die Zuschauer am Feld der Arena (draußen binnen r + 15 m, Blick zur Mitte ± 30°), die Geräte des
// Spielplatzes, Wagen und Strecken der Welt, die 100-m-Zeit der 100 nächsten Bewohner (100 m ÷ Tempo) und die Stadt-Stichproben.
const SPORT = async (r, T, arg) => {
    const o = arg || {};
    const st = r.state;
    const cp = st.camera.position;
    const Sm = r._bewohnerSiedlungen;
    const siedl = Sm && typeof Sm.values === "function" ? Array.from(Sm.values()) : [];
    const SP = /sport|spiel|wett|lauf|tanz|kampf|ball|brett|turnier|partie|ringen|fecht/i;
    const alle = [];
    for (const S of siedl)
        for (const b of S.liste || []) {
            const g = b.leib;
            if (!g || !g.position || !b.genom) continue;
            let aktN = null;
            if (Number.isFinite(o.stunde)) {
                try {
                    aktN = r._bewohnerSoll(b, o.stunde).akt;
                } catch (e) {
                    aktN = "?";
                }
            }
            const p = g.position;
            alle.push({
                x: p.x,
                z: p.z,
                d: Math.hypot(p.x - cp.x, p.z - cp.z),
                drin: !!(b.drinnen || (g.userData && g.userData._drinnen)),
                akt: b.akt || null,
                aktN,
                tempo: b.tempo,
                alterJ: 18 + 62 * (b.genom.alter || 0),
                blick: g.rotation ? g.rotation.y : 0,
                koennen: !!(b.koennen || b.uebung || b.talent || b.rekord || b.elo),
                wagen: !!(b.wagen || b.amSteuer),
            });
        }
    const zaehle = (L, key) => {
        const m = {};
        for (const a of L) m[a[key] || "—"] = (m[a[key] || "—"] || 0) + 1;
        return m;
    };
    const draussen = alle.filter((a) => !a.drin).sort((a, c) => a.d - c.d);
    // die 100-m-Zeit der 100 nächsten Bewohner draußen, ihr Variationskoeffizient und der Gang des Alters (Spearman ρ)
    const hundert = draussen.filter((a) => a.tempo > 0).slice(0, 100);
    const t100 = hundert.map((a) => 100 / a.tempo);
    const mittel = t100.reduce((s, x) => s + x, 0) / (t100.length || 1);
    const sd = Math.sqrt(t100.reduce((s, x) => s + (x - mittel) * (x - mittel), 0) / Math.max(1, t100.length - 1));
    const rang = (L) => {
        const R = new Array(L.length);
        L.map((x, i) => [x, i])
            .sort((a, c) => a[0] - c[0])
            .forEach((x, k) => (R[x[1]] = k));
        return R;
    };
    const spear = (A, B) => {
        if (A.length < 3) return null;
        const ra = rang(A), rb = rang(B), m = (A.length - 1) / 2;
        let s = 0, sa = 0, sb = 0;
        for (let i = 0; i < A.length; i++) {
            s += (ra[i] - m) * (rb[i] - m);
            sa += (ra[i] - m) * (ra[i] - m);
            sb += (rb[i] - m) * (rb[i] - m);
        }
        return sa && sb ? s / Math.sqrt(sa * sb) : 0;
    };
    // die Bühnen des Genesis-Orts und die Zuschauer an der Arena
    const GW = r._genesisWerkListe;
    const ar = GW && GW.buehnen && GW.buehnen.arena;
    let zuschauer = 0;
    let blickt = 0;
    if (ar)
        for (const a of draussen) {
            const dx = ar.x - a.x, dz = ar.z - a.z;
            if (Math.hypot(dx, dz) > ar.r + 15) continue;
            zuschauer++;
            const dw = Math.abs(((((Math.atan2(dx, dz) - a.blick) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
            if (dw < Math.PI / 6) blickt++;
        }
    // was in der Welt steht: Geräte des Spielplatzes (fachwerk WERKE `siteTag` spielplatz), Wagen, Strecken
    const FC = globalThis.__fachwerkCore;
    const arten = new Set(FC && FC.WERKE ? Object.values(FC.WERKE).filter((w) => w && w.siteTag === "spielplatz").map((w) => w.kind) : []);
    const arch = st.architectures || [];
    const typ = (e) => String((e && e.type) || "");
    const geraete = arch.filter((e) => arten.has(typ(e).split("_")[0])).length;
    const fahrzeuge = arch.filter((e) => /^fahrzeug/.test(typ(e))).length;
    const strecken = arch.filter((e) => /strecke|rennbahn|stadion|spielfeld/.test(typ(e))).length;
    // die Stadt-Stichproben am Nachmittag: 20 Orte von Bewohnern draußen, gleich über die Liste verteilt; eine Partie in Sichtweite
    // sind ≥ 2 Bewohner im Sport-Akt der Stunde binnen 50 m
    const sportN = alle.filter((a) => a.aktN && SP.test(a.aktN));
    // die Partien der Stunde: Gruppen von ≥ 2 Bewohnern im Sport-Akt binnen 50 m um ihren ersten
    const offen = sportN.slice();
    let partien = 0;
    while (offen.length) {
        const k = offen.shift();
        const mit = offen.filter((a) => Math.hypot(a.x - k.x, a.z - k.z) < 50);
        for (const a of mit) offen.splice(offen.indexOf(a), 1);
        if (mit.length >= 1) partien++;
    }
    const nP = Math.min(20, draussen.length);
    let mitPartie = 0;
    for (let k = 0; k < nP; k++) {
        const p = draussen[Math.floor((k * draussen.length) / nP)];
        if (sportN.filter((a) => Math.hypot(a.x - p.x, a.z - p.z) < 50).length >= 2) mitPartie++;
    }
    const KC = window.__koerperCore;
    return {
        n: alle.length,
        draussen: draussen.length,
        siedlungen: siedl.length,
        akte: zaehle(alle, "akt"),
        akteN: Number.isFinite(o.stunde) ? zaehle(alle, "aktN") : null,
        sport: alle.filter((a) => a.akt && SP.test(a.akt)).length,
        sportN: sportN.length,
        treff: alle.filter((a) => a.akt === "treff").length,
        koennen: alle.filter((a) => a.koennen).length,
        wagen: alle.filter((a) => a.wagen).length,
        lauf: { n: t100.length, mittelS: +mittel.toFixed(2), cv: t100.length ? +((100 * sd) / mittel).toFixed(2) : null, alterRho: spear(hundert.map((a) => a.alterJ), t100) },
        arena: ar ? { x: ar.x, z: ar.z, r: ar.r } : null,
        spielplatz: GW && GW.buehnen && GW.buehnen.spielplatz ? true : false,
        zuschauer,
        blickt,
        geraete,
        fahrzeuge,
        strecken,
        stichproben: nP,
        mitPartie,
        partien,
        schwere: st.gravity,
        verben: 5 + (KC && KC.VERB_GESETZ ? Object.keys(KC.VERB_GESETZ).length : 0),
        geraetVerben: KC && KC.VERB_GESETZ ? Object.keys(KC.VERB_GESETZ) : [],
    };
};

// DER LEIB IM TAKT (sport.koerper S1 + S2): der Spieler an der Mess-Wiese im Takt des Spiels (60 Hz, die Verb-Tafel `gehalten`):
// gehen und laufen je 150 Takte (das Tempo über die letzte Sekunde), springen aus dem Stand (der Hub der Lage über 84 Takte), dann
// den steilsten Hang im Umkreis von 12 m hinauf (die Richtung probiert die Gier aus: der Weg der Probe nennt seine Neigung). DER FUSS
// IM STAND: je Knöchel (`rig.legL/legR.ankle`) die Takte, in denen er höchstens 1 cm über seinem tiefsten Stand über dem Gelände
// steht (der flache Fuß); je solcher Phase (≥ 3 Takte) der größte waagrechte Weg ab ihrem Beginn — das Gleiten.
const LEIB = async (r, T, arg) => {
    const st = r.state;
    const pm = st.playerMesh;
    if (!pm || typeof r._gameLoopTick !== "function") return { fehlt: "kein Spieler-Leib" };
    const halt = st.verbTafel.gehalten;
    const rig = pm.userData && pm.userData.rig;
    const fuesse = rig ? [rig.legL && rig.legL.ankle, rig.legR && rig.legR.ankle].filter(Boolean) : [];
    let uhr = performance.now();
    const takt = () => r._gameLoopTick((uhr += 1000 / 60));
    const v = new T.Vector3();
    const boden = (x, z) => r.getTerrainHeightAt(x, z);
    const ruhe = (n) => {
        halt.vor = false;
        halt.sprint = false;
        halt.jump = false;
        for (let i = 0; i < n; i++) takt();
    };
    const lauf = (sprint, n) => {
        const spur = [];
        const F = fuesse.map(() => []);
        halt.vor = true;
        halt.sprint = !!sprint;
        try {
            for (let i = 0; i < n; i++) {
                takt();
                spur.push([pm.position.x, pm.position.y, pm.position.z]);
                fuesse.forEach((b, k) => {
                    b.getWorldPosition(v);
                    F[k].push([v.x, v.y - boden(v.x, v.z), v.z]);
                });
            }
        } finally {
            halt.vor = false;
            halt.sprint = false;
        }
        const i0 = Math.max(0, spur.length - 61);
        const a = spur[i0];
        const e = spur[spur.length - 1];
        const weg = Math.hypot(e[0] - a[0], e[2] - a[2]);
        const gleiten = [];
        for (const S of F) {
            const s2 = S.slice(30);
            if (s2.length < 10) continue;
            const min = Math.min(...s2.map((x) => x[1]));
            let start = -1;
            for (let t = 0; t <= s2.length; t++) {
                const an = t < s2.length && s2[t][1] <= min + 0.01;
                if (an && start < 0) start = t;
                else if (!an && start >= 0) {
                    if (t - start >= 3) {
                        let m = 0;
                        for (let u = start; u < t; u++) m = Math.max(m, Math.hypot(s2[u][0] - s2[start][0], s2[u][2] - s2[start][2]));
                        gleiten.push(m);
                    }
                    start = -1;
                }
            }
        }
        return { tempo: weg / ((spur.length - 1 - i0) / 60), neig: (Math.atan2(e[1] - a[1], weg) * 180) / Math.PI, gleiten, richt: Math.atan2(e[0] - a[0], e[2] - a[2]) };
    };
    const kurz = (L) => ({ tempo: +L.tempo.toFixed(3), neig: +L.neig.toFixed(1), phasen: L.gleiten.length, gleitenCm: L.gleiten.length ? +(100 * Math.max(...L.gleiten)).toFixed(2) : null });
    let gehen, sprint, hub, hang, steil;
    try {
        ruhe(10);
        gehen = lauf(false, 150);
        sprint = lauf(true, 150);
        ruhe(40);
        const y0 = pm.position.y;
        let max = y0;
        halt.jump = true;
        try {
            for (let i = 0; i < 4; i++) {
                takt();
                max = Math.max(max, pm.position.y);
            }
        } finally {
            halt.jump = false;
        }
        for (let i = 0; i < 80; i++) {
            takt();
            max = Math.max(max, pm.position.y);
        }
        hub = max - y0;
        // der steilste Hang um den Leib: die Richtung, in der das Gelände auf 6 und 12 m am meisten steigt
        const p = pm.position;
        const h0 = boden(p.x, p.z);
        for (let k = 0; k < 16; k++)
            for (const R of [6, 12]) {
                const w = (k * Math.PI) / 8;
                const s = (boden(p.x + R * Math.sin(w), p.z + R * Math.cos(w)) - h0) / R;
                if (!steil || s > steil.s) steil = { w, s, R };
            }
        const gier0 = st.yaw;
        const dw = steil.w - gehen.richt;
        const ab = (a, b) => Math.abs(((((a - b) % (2 * Math.PI)) + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
        st.yaw = gier0 + dw;
        let probe = lauf(false, 20);
        if (ab(probe.richt, steil.w) > 0.5) {
            st.yaw = gier0 - dw;
            probe = lauf(false, 20);
        }
        hang = lauf(false, 150);
    } finally {
        ruhe(1);
    }
    return {
        fuesse: fuesse.length,
        gehen: kurz(gehen),
        sprint: kurz(sprint),
        sprungM: +hub.toFixed(3),
        hang: kurz(hang),
        steilGrad: +((Math.atan(steil.s) * 180) / Math.PI).toFixed(1),
        gleitenCm: +(100 * Math.max(0, ...gehen.gleiten, ...sprint.gleiten, ...hang.gleiten)).toFixed(2),
    };
};

const PFAD = ["stamm/siedlung-bewohner.js", "koerper-core.js", "fachwerk-core.js", "stamm/siedlung-ort.js"];
const KARTE = "[linse-gpu] amd/rdna-3 (Probe)";
const mutante = (id, n, name, werte, zahl, umfang) => [{ name, j: { leiter: id, adapter: KARTE, sprossen: { [n]: { art: "zahl", n: umfang, werte } } }, gruen: false, zahl }];

module.exports = (F) => [
    // ═══ REGEL-GRAMMATIK: was die Welt an Wettkampf, Spiel und Regel trägt — am Genesis-Ort mit Arena und Spielplatz, Akte um 15 Uhr ═══
    F.leiter("mensch.sport.regeln", {
        sek: 30,
        pfad: PFAD,
        seite: { SPORT },
        messe: async (H, K) => {
            await K.messort("genesis");
            const z = await K.welt("return await (" + H.seite.SPORT + ")(r, T, " + JSON.stringify({ stunde: 15 }) + ");", 30000);
            H.zeile("Sport am Genesis-Ort: " + z.n + " Bewohner · Akte jetzt " + JSON.stringify(z.akte) + " · um 15 Uhr " + JSON.stringify(z.akteN) + " · Sport-Akte " + z.sport + "/" + z.sportN + " · Arena " + JSON.stringify(z.arena) + " · Geräte " + z.geraete);
            await K.schritt(1, async () => K.leser(1, { n: z.sportN, fehlt: "kein Wettkampf-Akt im Tages-Gesetz (Akte " + Object.keys(z.akteN || z.akte).join(", ") + "): kein Lauf, kein Wurf, kein Sieger", wo: "koerper-core.js:5126" }));
            await K.schritt(2, async () => K.leser(2, { n: z.sportN, fehlt: "kein Ballspiel, kein Gegner, keine Rolle Schiedsrichter (TAGES_GESETZ rollen)", wo: "koerper-core.js:5135" }));
            await K.schritt(3, async () => K.nicht(3, { n: z.sport + z.sportN, fehlt: "10 Sportarten aus einer Grammatik: 0 Sportarten in der Welt (" + z.n + " Bewohner, kein Sport-Akt)" }));
            await K.schritt(4, async () => K.nicht(4, { n: 1, fehlt: "10² Saaten wählen ihre Art: eine Welt, 0 Arten" }));
            await K.schritt(5, async () => K.leser(5, { n: 0, fehlt: "keine Regel-Grammatik: die Arena bleibt Fläche, bis ein Gesetzbuch ihren Hof trägt (" + (z.arena ? "r " + z.arena.r.toFixed(1) + " m" : "keine Arena geladen") + ")", wo: "fachwerk-core.js:11423" }));
            await K.schritt(6, async () => K.nicht(6, { n: 0, fehlt: "10³–10⁴ Einträge des Inventars der Erde: 0 Spiele im Raum einer Grammatik" }));
            await K.schritt(7, async () => K.nicht(7, { n: 1, fehlt: "fremde Physik auf 10 Welten: eine Welt, Schwere " + z.schwere }));
            await K.schritt(8, async () => K.nicht(8, { n: z.siedlungen, fehlt: "jede Bevölkerung mit eigener Sportkultur: " + z.siedlungen + " Siedlung(en), 0 Sportkulturen, ein Planet" }));
        },
        sprossen: {
            1: { umfang: { soll: 20, wort: "Läufe mit Sieger" }, masse: [{ key: "rho", wort: "ρ Rangfolge ↔ Leib-Leistung", von: 0.6, bis: 0.9 }], erwartet: "leser", fehlt: "kein Wettkampf-Akt im Tages-Gesetz: kein Lauf, kein Wurf, kein Sieger", wo: "koerper-core.js:5126" },
            2: { umfang: { soll: 20, wort: "Partien mit Gegner und Pfiff" }, masse: [{ key: "pfiffe", wort: "richtige Pfiffe", soll: 0.9, richtung: "≥" }], erwartet: "leser", fehlt: "kein Ballspiel, keine Rolle Schiedsrichter", wo: "koerper-core.js:5135" },
            3: { auge: { pose: "keine: keine Sportart in der Welt", vorbild: "30-s-Clips von 10 realen Sportarten (≥ 8 von 10 von Fremden benannt)" }, erwartet: "nicht", fehlt: "0 Sportarten in der Welt" },
            4: { auge: { pose: "keine: 10² Saaten mit eigener Art fehlen", vorbild: "reale Regelwerke im Blindpaar (2AFC ≤ 75 %)" }, erwartet: "nicht", fehlt: "10² Saaten, die ihre Art wählen" },
            5: {
                umfang: { soll: 100, wort: "neue Arten aus Saat oder Satz" },
                masse: [
                    { key: "siegMax", wort: "Sieg der besten Strategie", soll: 0.7, richtung: "≤" },
                    { key: "start", wort: "Sieg der Start-Seite", von: 0.4, bis: 0.6 },
                    { key: "laenge", wort: "Faktor der Partielänge", soll: 3, richtung: "<" },
                ],
                erwartet: "leser",
                fehlt: "keine Regel-Grammatik: die Arena bleibt Fläche",
                wo: "fachwerk-core.js:11423",
            },
            6: { auge: { pose: "keine: das Inventar fehlt", vorbild: "100 Zufallseinträge eines ethnographischen Spiel-Inventars (≥ 90 % erkannt)" }, erwartet: "nicht", fehlt: "10³–10⁴ Spiele im Raum der Grammatik" },
            7: { umfang: { soll: 1000, wort: "Saaten auf 10 Welten fremder Physik" }, masse: [{ key: "spielbar", wort: "spielbar bis zum Sieger", soll: 0.8, richtung: "≥" }], erwartet: "nicht", fehlt: "eine Welt, eine Schwere" },
            8: {
                umfang: { soll: 1000, wort: "Bevölkerungen mit Sportkultur" },
                masse: [
                    { key: "abstand", wort: "Regel-Abstand zwischen minus innerhalb der Kulturen", soll: 0, richtung: ">" },
                    { key: "rang", wort: "Rang Sportart ↔ Körper und Schwere", soll: 0.7, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "keine Bevölkerung mit Sportkultur, ein Planet",
            },
        },
        proben: { 1: mutante("mensch.sport.regeln", 1, "20 Läufe, ρ 0,95 (der Sieger ist nur der Leib) — ROT", { rho: 0.95 }, /ROT an ρ Rangfolge ↔ Leib-Leistung 0\.95 verfehlt 0\.6–0\.9/, 20) },
    }),

    // ═══ KÖRPERKÖNNEN: der Leib des Spielers im Takt an der Mess-Wiese — Tempo, Sprung, der Fuß im Stand ═══
    F.leiter("mensch.sport.koerper", {
        sek: 45,
        mutiert: true,
        pfad: ["koerper-core.js", "stamm/koerper-bewegung.js", "stamm/dirigent-kern.js", "stamm/gelaende-boden.js"],
        seite: { LEIB, SPORT },
        messe: async (H, K) => {
            K.sicht = "third";
            await K.messort("wiese");
            const z = await K.welt("return await (" + H.seite.SPORT + ")(r, T, {});", 20000);
            await K.schritt(3, async () => K.leser(3, { fehlt: "Tempo = Basis × Größe (leibWerte), keine Kraft-Geschwindigkeit, keine Ermüdung des Laufs über 400 m, kein Wurf", wo: "koerper-core.js:5455" }));
            await K.schritt(4, async () => K.nicht(4, { n: z.verben, fehlt: "10² Bewegungsaufgaben: die Welt trägt " + z.verben + " Verben (5 des Leibs + " + z.geraetVerben.join(", ") + "), kein Werfen, Treten, Schwimmstil, Stoß gegen Referenz" }));
            await K.schritt(5, async () => K.nicht(5, { n: 0, fehlt: "10³ Kontakte zweier Leiber bei Spieltempo: kein Spiel, das Leib an Leib bringt" }));
            await K.schritt(6, async () => K.nicht(6, { n: 0, fehlt: "10² Baupläne treiben Sport: 0 Baupläne im Sport" }));
            await K.schritt(7, async () => K.nicht(7, { n: 0, fehlt: "Weltklasse jeder Disziplin und Schwere: 0 Disziplinen" }));
            const L = await K.welt("return await (" + H.seite.LEIB + ")(r, T, {});", 40000);
            H.zeile("Leib: " + JSON.stringify(L));
            await K.schritt(1, async () => {
                if (L.fehlt) throw new Error(L.fehlt);
                const w = { gehen: L.gehen.tempo, sprint: L.sprint.tempo, sprung: L.sprungM };
                K.zahl(1, {
                    n: Object.values(w).filter((x) => Number.isFinite(x) && x > 0).length,
                    werte: w,
                    beleg: "Eichwert koerper-core.js:502 (Gehen ~1,5 · Sprint ~6,8 m/s · Sprung ~0,53 m; Klettern 0,6 · Schwimmen 1,3 m/s und die Geräte-Verben " + z.geraetVerben.join(", ") + " an der Wiese ungemessen: keine Wand, kein Wasser, kein Gerät)",
                    taeter: "die Leib-Werte des Menschen (koerper-core.js fx.bewegung) — am Umfang: die Probe der Wiese stellt Klettern, Schwimmen und die Geräte-Verben nicht",
                });
            });
            await K.schritt(2, async () => {
                if (L.fehlt) throw new Error(L.fehlt);
                const hangDa = L.hang.neig >= 8 && L.hang.phasen >= 3 ? 1 : 0;
                K.zahl(2, {
                    n: hangDa,
                    werte: { gleiten: L.gleitenCm },
                    beleg: "Fläche gehen " + JSON.stringify(L.gehen) + " · laufen " + JSON.stringify(L.sprint) + " · Hang " + JSON.stringify(L.hang) + " (steilster im Umkreis " + L.steilGrad + "°) · Stufe und Gerät stellt die Probe nicht",
                    taeter: L.gleitenCm > 2 ? "der Fuß im Stand (koerper-core.js leibPlan, Gang-Gesetz)" : "Stufe und Gerät ungemessen (Spielplatz am Genesis-Ort)",
                });
            });
        },
        sprossen: {
            1: {
                umfang: { soll: 11, wort: "Verben im Spiel gegen Eichwert (5 des Leibs + 6 Geräte-Verben)", herkunft: "der Umfang „5 Verben + 6 Geräte-Verben“ eines Leibs: 5 + 6 = 11 Verben" },
                masse: [
                    { key: "gehen", wort: "Tempo Gehen (m/s)", soll: 1.5, tol: 0.15, herkunft: "der Eichwert des Gehens ~1,5 m/s (koerper-core.js:502), ± 10 % des Richters = ± 0,15" },
                    { key: "sprint", wort: "Tempo Sprint (m/s)", soll: 6.8, tol: 0.68, herkunft: "der Eichwert des Sprints ~6,8 m/s (koerper-core.js:502), ± 10 % des Richters = ± 0,68" },
                    { key: "sprung", wort: "Sprunghöhe (m)", soll: 0.53, tol: 0.053, herkunft: "der Eichwert des Sprungs ~0,53 m bei g = 9,81 (koerper-core.js:502), ± 10 % des Richters = ± 0,053" },
                ],
            },
            2: {
                umfang: { soll: 3, wort: "Untergründe gemessen (Stufe · Hang · Gerät)", herkunft: "die Aufzählung des Umfangs „Stufe, Hang, Gerät“: 3 Untergründe" },
                masse: [{ key: "gleiten", wort: "Fuß-Gleiten im Stand (cm, größtes)", soll: 2, richtung: "≤" }],
            },
            3: { umfang: { soll: 10, wort: "Leiber mit Kraft statt Konstante" }, masse: [{ key: "verlust", wort: "Verlust auf der zweiten 400-m-Hälfte (%)", von: 5, bis: 12 }], erwartet: "leser", fehlt: "keine Kraft-Geschwindigkeit, keine Ermüdung, kein Wurf", wo: "koerper-core.js:5455" },
            4: { umfang: { soll: 100, wort: "Bewegungsaufgaben" }, masse: [{ key: "mpjpe", wort: "MPJPE gegen Referenzbewegung (mm)", soll: 60, richtung: "≤" }], erwartet: "nicht", fehlt: "die Welt trägt 5 + 6 Verben, keine 10² Bewegungsaufgaben" },
            5: { auge: { pose: "keine: kein Spiel bringt Leib an Leib", vorbild: "Referenzvideo von Zweikämpfen (0 Durchdringungen in 1 000 Kontakten)" }, erwartet: "nicht", fehlt: "10³ Kontakte zweier Leiber bei Spieltempo" },
            6: { auge: { pose: "keine: keine Baupläne im Sport", vorbild: "Gangarten der Tierreferenz je Froude (N = 100, ≥ 80 %)" }, erwartet: "nicht", fehlt: "10² Baupläne, die Sport treiben" },
            7: { auge: { pose: "keine: keine Disziplin", vorbild: "Video von Weltklasse-Athleten (Zweiwahl-Blindtest ≤ 60 %)" }, erwartet: "nicht", fehlt: "Weltklasse jeder Disziplin und Schwere" },
        },
        proben: {
            1: mutante("mensch.sport.koerper", 1, "11 Verben, der Sprung 0,323 m — ROT am Eichwert", { gehen: 1.5, sprint: 6.8, sprung: 0.323 }, /ROT an Sprunghöhe \(m\) 0\.323 verfehlt 0\.53 ±0\.053/, 11),
            2: mutante("mensch.sport.koerper", 2, "der gleitende Fuß: 4,5 cm — ROT", { gleiten: 4.5 }, /ROT an Fuß-Gleiten im Stand \(cm, größtes\) 4\.5 /, 3),
        },
    }),

    // ═══ TALENT, ÜBUNG UND REKORD: die Lauf-Zeiten der Stadt, was die Welt an Übung und Wettkampf trägt ═══
    // DER MESSORT IM UMFANG (k2-mensch.js K.messort, 23.11.): S1 „10² Bewohner mit Können-Profil“ (Klasse Ort) — die Stadt (91 Häuser im
    // Plan); das Dorf (50 Bewohner) trägt 10² nicht, die volle Stadt (1 365 Bewohner) maß den Preis am 13-fachen (538,0 MB gehalten)
    F.leiter("mensch.sport.koennen", {
        sek: 30,
        pfad: PFAD,
        seite: { SPORT },
        messe: async (H, K) => {
            await K.messort("stadt");
            const z = await K.welt("return await (" + H.seite.SPORT + ")(r, T, {});", 30000);
            H.zeile("Können: " + z.n + " Bewohner · Lauf " + JSON.stringify(z.lauf) + " · mit Können-Profil " + z.koennen);
            await K.schritt(1, async () =>
                K.zahl(1, {
                    n: z.lauf.n,
                    werte: { cv: z.lauf.cv },
                    beleg: "100-m-Zeit = 100 m ÷ Tempo des Gangs (b.tempo, stamm/siedlung-bewohner.js:1051), Mittel " + z.lauf.mittelS + " s · Altersgang ρ(Alter, Zeit) " + z.lauf.alterRho + " · " + z.koennen + " mit Können-Profil",
                    taeter: "das Tempo der Bewohner folgt nur der Beinlänge (stamm/siedlung-bewohner.js:1051), kein Können-Profil",
                })
            );
            await K.schritt(2, async () => K.leser(2, { n: z.koennen, fehlt: "keine Übung: kein Bewohner trägt Stunden der Übung, die Leib-Werte lesen nur die Größe", wo: "koerper-core.js:5455" }));
            await K.schritt(3, async () => K.leser(3, { n: z.sport, fehlt: "kein Wettkampf, kein Bestwert (" + z.n + " Bewohner, " + z.sport + " im Sport-Akt)", wo: "koerper-core.js:5126" }));
            await K.schritt(4, async () => K.leser(4, { n: 0, fehlt: "keine Altersklassen, Vereine, Meister: die Rollen des Tages-Gesetzes tragen keine", wo: "koerper-core.js:5135" }));
            await K.schritt(5, async () => K.leser(5, { n: 0, fehlt: "keine Weltmeisterschaft, kein Rekord: die Leib-Werte kennen weder Übung noch Talent", wo: "koerper-core.js:5455" }));
            await K.schritt(6, async () => K.leser(6, { n: 0, fehlt: "keine Rekorde über Jahrhunderte (Teilnehmer, Ernährung, Technik)", wo: "koerper-core.js:5455" }));
        },
        sprossen: {
            1: { umfang: { soll: 100, wort: "Bewohner mit 100-m-Zeit" }, masse: [{ key: "cv", wort: "Variationskoeffizient der 100-m-Zeit (%)", von: 10, bis: 20 }] },
            2: { umfang: { soll: 100, wort: "Übungsstunden eines Bewohners" }, masse: [{ key: "r2", wort: "R² Güte ↔ Potenzgesetz der Übung", soll: 0.8, richtung: "≥" }], erwartet: "leser", fehlt: "keine Übung", wo: "koerper-core.js:5455" },
            3: { umfang: { soll: 10000, wort: "Bevölkerung im Wettkampf" }, masse: [{ key: "gegenlauf", wort: "Abweichung des Bestwerts im Gegenlauf von der Extremwert-Erwartung (%)", soll: 5, richtung: "≤" }], erwartet: "leser", fehlt: "kein Wettkampf, kein Bestwert", wo: "koerper-core.js:5126" },
            4: { umfang: { soll: 1000000, wort: "Bevölkerung mit Altersklassen" }, masse: [{ key: "ksP", wort: "KS-p Siegerzeiten ↔ Masters- und Landes-Rekordtafeln", soll: 0.05, richtung: "≥" }], erwartet: "leser", fehlt: "keine Altersklassen, Vereine, Meister", wo: "koerper-core.js:5135" },
            5: {
                umfang: { soll: 1000000000, wort: "Bevölkerung der Weltmeisterschaft" },
                masse: [
                    { key: "m100", wort: "Sieger 100 m (s)", von: 9.4, bis: 9.9, herkunft: "das Band der Sprosse in der Karte (vision/meisterkarte-2.json, tiefe: „100 m 9,4–9,9 s“); WM-Sieger 1983–2023 (World Athletics) 9,58–10,07 s" },
                    { key: "hoch", wort: "Sieger Hochsprung (m)", von: 2.3, bis: 2.5, herkunft: "das Band der Sprosse in der Karte (tiefe: „Hochsprung 2,30–2,50 m“); WM-Sieger 1983–2023 (World Athletics) 2,32–2,41 m" },
                    { key: "marathon", wort: "Sieger Marathon (s)", von: 7200, bis: 7560, herkunft: "das Band der Sprosse in der Karte (tiefe: „Marathon 2:00–2:06 h“ = 7200–7560 s); schärfer als die WM-Sieger 1983–2023 (2:05–2:16 h)" },
                ],
                erwartet: "leser",
                fehlt: "keine Weltmeisterschaft, kein Rekord",
                wo: "koerper-core.js:5455",
            },
            6: {
                umfang: { soll: 11, wort: "Jahrzehnte der Rekordkurve (1900–2009)", herkunft: "der Richter misst „gegen 1900–2009 … je Jahrzehnt“: die Kurve über alle 11 Jahrzehnte 1900–2009" },
                masse: [{ key: "abw", wort: "Abweichung der 100-m-Rekordkurve gegen 1900–2009 je Jahrzehnt (%)", soll: 3, richtung: "≤" }],
                erwartet: "leser",
                fehlt: "keine Rekorde über Jahrhunderte",
                wo: "koerper-core.js:5455",
            },
        },
        proben: { 1: mutante("mensch.sport.koennen", 1, "100 Bewohner, CV 4 % (das Tempo nur aus der Beinlänge) — ROT", { cv: 4 }, /ROT an Variationskoeffizient der 100-m-Zeit \(%\) 4 verfehlt 10–20/, 100) },
    }),

    // ═══ MANNSCHAFT UND TAKTIK: Kampf und Spiel zweier Seiten — am Genesis-Ort mit seiner Arena ═══
    F.leiter("mensch.sport.mannschaft", {
        sek: 30,
        pfad: [...PFAD, "stamm/kampf.js"],
        seite: { SPORT },
        messe: async (H, K) => {
            await K.messort("genesis");
            const z = await K.welt("return await (" + H.seite.SPORT + ")(r, T, " + JSON.stringify({ stunde: 15 }) + ");", 30000);
            H.zeile("Mannschaft: " + z.n + " Bewohner · Sport-Akte " + z.sport + "/" + z.sportN + " · Arena " + JSON.stringify(z.arena));
            await K.schritt(1, async () => K.leser(1, { n: z.sportN, fehlt: "kein Kampf 1 gegen 1 zweier Leiber: nur der Spieler schwingt (Hieb gegen Tier und Streitpuppe), kein Gegner mit Finte und Abwehr", wo: "stamm/kampf.js:92" }));
            await K.schritt(2, async () => K.leser(2, { n: z.sportN, fehlt: "kein 5 gegen 5: keine Mannschaft, kein Ball, kein Pass", wo: "koerper-core.js:5135" }));
            await K.schritt(3, async () => K.leser(3, { n: z.sportN, fehlt: "kein 11 gegen 11 mit Schiedsrichter: die Arena bleibt Fläche", wo: "fachwerk-core.js:11423" }));
            await K.schritt(4, async () => K.leser(4, { n: 0, fehlt: "keine Vereine, keine Trainer, keine Stile", wo: "koerper-core.js:5135" }));
            await K.schritt(5, async () => K.nicht(5, { n: z.sportN, fehlt: "10³–10⁴ Leiber im Volkslauf: " + z.n + " Bewohner am Ort, " + z.sportN + " im Lauf" }));
            await K.schritt(6, async () => K.nicht(6, { n: 0, fehlt: "Taktik der Epochen: 0 Formationen" }));
            await K.schritt(7, async () => K.nicht(7, { n: 0, fehlt: "Weltklasse-Taktik: 0 Arten der Grammatik" }));
        },
        sprossen: {
            1: { umfang: { soll: 1, wort: "Paar im Kampf 1 gegen 1" }, masse: [{ key: "sieg", wort: "Siegquote des Stärkeren", von: 0.6, bis: 0.8 }], erwartet: "leser", fehlt: "kein Kampf 1 gegen 1 zweier Leiber", wo: "stamm/kampf.js:92" },
            2: { umfang: { soll: 10, wort: "Leiber in 5 gegen 5", herkunft: "„5 gegen 5“: zwei Seiten zu je 5 = 10 Leiber" }, masse: [{ key: "passAbw", wort: "Abweichung der Passquote gegen Amateur-Statistik (%)", soll: 20, richtung: "≤" }], erwartet: "leser", fehlt: "kein 5 gegen 5", wo: "koerper-core.js:5135" },
            3: {
                umfang: { soll: 23, wort: "Leiber in 11 gegen 11 mit Schiedsrichter", herkunft: "„11 gegen 11 mit Schiedsrichter“: 2 × 11 Spieler + 1 Schiedsrichter = 23 Leiber" },
                masse: [
                    { key: "tore", wort: "Tore je Spiel", von: 2, bis: 3.5 },
                    { key: "paesse", wort: "Pässe je Spiel", von: 700, bis: 1100 },
                ],
                erwartet: "leser",
                fehlt: "kein 11 gegen 11",
                wo: "fachwerk-core.js:11423",
            },
            4: { umfang: { soll: 100, wort: "Vereine" }, masse: [{ key: "stile", wort: "getrennte Stile der Passnetze", soll: 4, richtung: "≥" }], erwartet: "leser", fehlt: "keine Vereine, keine Stile", wo: "koerper-core.js:5135" },
            5: { umfang: { soll: 1000, wort: "Leiber im Volkslauf" }, masse: [{ key: "kurve", wort: "Abweichung der Dichte-Tempo-Kurve (%)", soll: 15, richtung: "≤" }], erwartet: "nicht", fehlt: "kein Marathon, kein Volksfußball" },
            6: { auge: { pose: "keine: keine Formation", vorbild: "Formationen je Jahrzehnt (2-3-5 → 4-4-2 → 4-3-3), Fachurteil ≥ 80 %" }, erwartet: "nicht", fehlt: "Taktik der Epochen" },
            7: { auge: { pose: "keine: keine Art der Grammatik", vorbild: "Tracking-Daten einer Liga (Blindtest ≤ 60 %)" }, erwartet: "nicht", fehlt: "Weltklasse-Taktik" },
        },
        proben: { 3: mutante("mensch.sport.mannschaft", 3, "11 gegen 11 mit 6 Toren je Spiel — ROT", { tore: 6, paesse: 900 }, /ROT an Tore je Spiel 6 verfehlt 2–3\.5/, 23) },
    }),

    // ═══ ARENA, PUBLIKUM UND LIGA: die Stichproben der vollen Stadt am Nachmittag, dann das Feld der Arena am Genesis-Ort ═══
    F.leiter("mensch.sport.arena", {
        sek: 45,
        pfad: PFAD,
        seite: { SPORT },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const s = await K.welt("return await (" + H.seite.SPORT + ")(r, T, " + JSON.stringify({ stunde: 15 }) + ");", 30000);
            H.zeile("Stadt um 15 Uhr: " + s.n + " Bewohner · Akte " + JSON.stringify(s.akteN) + " · Partien " + s.partien + " · Stichproben " + s.stichproben + " · mit Partie " + s.mitPartie);
            await K.schritt(7, async () => {
                const anteil = s.stichproben ? s.mitPartie / s.stichproben : 0;
                if (s.partien >= 100000) return K.zahl(7, { n: s.partien, werte: { anteil }, beleg: s.stichproben + " Stadt-Stichproben, " + s.mitPartie + " mit Partie in Sichtweite" });
                K.nicht(7, { n: s.partien, fehlt: "10⁵–10⁷ Partien an einem Nachmittag: die volle Stadt trägt um 15 Uhr " + s.partien + " (kein Spiel-Akt im Tages-Gesetz, koerper-core.js:5126); Partie in Sichtweite an " + s.mitPartie + " von " + s.stichproben + " Stadt-Stichproben (Anteil " + anteil + ")" });
            });
            await K.messort("genesis");
            const z = await K.welt("return await (" + H.seite.SPORT + ")(r, T, {});", 30000);
            H.zeile("Arena: " + JSON.stringify(z.arena) + " · Zuschauer " + z.zuschauer + " (Blick zur Mitte " + z.blickt + ") · Sport-Akte " + z.sport);
            await K.schritt(2, async () => K.leser(2, { n: z.zuschauer, fehlt: "kein Jubel: das Gemüt der Bewohner liest Akt und Furcht, keinen Spielstand, keine Stimme", wo: "stamm/siedlung-bewohner.js:2283" }));
            await K.schritt(3, async () => K.nicht(3, { n: z.zuschauer, fehlt: "kein Stadion mit 10⁴ Zuschauern: an der Arena " + z.zuschauer + " Bewohner" }));
            await K.schritt(4, async () => K.leser(4, { n: 0, fehlt: "keine Liga, keine Vereine, keine Tabelle", wo: "koerper-core.js:5135" }));
            await K.schritt(5, async () => K.nicht(5, { n: z.zuschauer, fehlt: "10⁵ Zuschauer mit Welle und Fanmarsch: an der Arena " + z.zuschauer }));
            await K.schritt(6, async () => K.leser(6, { n: 0, fehlt: "keine Ligen über Epochen: keine Sieger, keine Arten, die 100 Jahre zurück anders wären", wo: "fachwerk-core.js:11423" }));
            await K.schritt(1, async () => {
                if (!z.arena) throw new Error("keine Arena am Genesis-Ort geladen (_genesisWerkListe.buehnen)");
                if (z.sport === 0) return K.leser(1, { n: z.zuschauer, fehlt: "kein Geschehen auf dem Feld: die Arena bleibt Fläche, kein Spiel, kein Ball (" + z.zuschauer + " Bewohner am Feld, " + z.blickt + " mit Blick zur Mitte)", wo: "fachwerk-core.js:11423" });
                K.zahl(1, { n: z.zuschauer, werte: { blick: z.zuschauer ? z.blickt / z.zuschauer : 0 } });
            });
        },
        sprossen: {
            1: { umfang: { soll: 10, wort: "Zuschauer am Spielfeld des Ort-Gesetzes" }, masse: [{ key: "blick", wort: "Blicke, die dem Geschehen folgen", soll: 0.8, richtung: "≥" }], erwartet: "leser", fehlt: "kein Geschehen auf dem Feld: die Arena bleibt Fläche", wo: "fachwerk-core.js:11423" },
            2: { umfang: { soll: 100, wort: "Zuschauer mit Jubel" }, masse: [{ key: "spitze", wort: "Lautstärke-Spitze nach dem Tor (s)", soll: 0.5, richtung: "≤" }], erwartet: "leser", fehlt: "kein Jubel, kein Spielstand", wo: "stamm/siedlung-bewohner.js:2283" },
            3: { auge: { pose: "keine: kein Stadion", vorbild: "Fotos realer Stadien des Typs (≥ 1 000 Zuschauer nah sichtbar bewegt)" }, erwartet: "nicht", fehlt: "kein Stadion mit 10⁴ Zuschauern" },
            4: { umfang: { soll: 20, wort: "Vereine aus 20 Städten" }, masse: [{ key: "ksP", wort: "KS-p Punkteverteilung ↔ reale Ligen", soll: 0.05, richtung: "≥" }], erwartet: "leser", fehlt: "keine Liga", wo: "koerper-core.js:5135" },
            5: { umfang: { soll: 100000, wort: "Zuschauer" }, masse: [{ key: "welle", wort: "Tempo der Welle (m/s)", von: 10, bis: 15 }], erwartet: "nicht", fehlt: "keine 10⁵ Zuschauer" },
            6: { umfang: { soll: 100, wort: "Jahre zurück" }, masse: [{ key: "anders", wort: "Glieder anders 100 J. zurück (Sieger · Arten · Bauten)", soll: 3, richtung: "≥", herkunft: "die Aufzählung „andere Sieger, Arten, Bauten“: alle 3 Glieder anders" }], erwartet: "leser", fehlt: "keine Ligen über Epochen", wo: "fachwerk-core.js:11423" },
            7: {
                umfang: { soll: 100000, wort: "Partien an einem Nachmittag (15 Uhr)" },
                masse: [{ key: "anteil", wort: "Stadt-Stichproben mit Partie in Sichtweite", soll: 0.3, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "10⁵–10⁷ Partien an einem Nachmittag: die Welt trägt keinen Spiel-Akt",
            },
        },
        proben: { 7: mutante("mensch.sport.arena", 7, "10⁵ Partien, keine in Sichtweite einer Stichprobe — ROT", { anteil: 0 }, /ROT an Stadt-Stichproben mit Partie in Sichtweite 0 verfehlt ≥ 0\.3/, 100000) },
    }),

    // ═══ HANDWERK, TANZ UND KAMPF ALS KUNST: Können, Werk und Lehre an der vollen Stadt ═══
    F.leiter("mensch.sport.kunst", {
        sek: 30,
        pfad: [...PFAD, "schmiede-core.js"],
        seite: { SPORT },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const z = await K.welt("return await (" + H.seite.SPORT + ")(r, T, {});", 30000);
            H.zeile("Kunst: " + z.n + " Bewohner · mit Können-Profil " + z.koennen + " · Akte " + JSON.stringify(z.akte));
            await K.schritt(1, async () => K.nicht(1, { n: z.koennen, fehlt: "Meister und Anfänger in 3 Künsten: " + z.koennen + " Bewohner mit Können-Profil, jeder Leib gleich geschickt" }));
            await K.schritt(2, async () => K.leser(2, { n: z.koennen, fehlt: "die Güte des Werks liest Rezept und Prägung (gueteFaktor), nie die Hand, die es schmiedet", wo: "schmiede-core.js:4064" }));
            await K.schritt(3, async () => K.leser(3, { n: z.sport, fehlt: "kein Tanz-Akt, keine Musik, der ein Schritt folgt", wo: "koerper-core.js:5126" }));
            await K.schritt(4, async () => K.nicht(4, { n: 0, fehlt: "10² Stile je Kultur: 0 Kampf- und Tanzstile" }));
            await K.schritt(5, async () => K.leser(5, { n: 0, fehlt: "keine Lehrer-Kette: kein Meister, kein Schüler, kein Stil, der wandert", wo: "koerper-core.js:5135" }));
            await K.schritt(6, async () => K.nicht(6, { n: 0, fehlt: "neue Künste fremder Kulturen und Körper: 0" }));
        },
        sprossen: {
            1: { auge: { pose: "keine: kein Meister, kein Anfänger", vorbild: "Videos von Meister und Anfänger in 3 Künsten (Blindtest ≥ 80 %)" }, erwartet: "nicht", fehlt: "kein Können-Profil: Meister und Anfänger gleich" },
            2: { umfang: { soll: 10, wort: "Werkstücke" }, masse: [{ key: "r2", wort: "R² Werk-Güte ↔ Können-Profil", soll: 0.7, richtung: "≥" }], erwartet: "leser", fehlt: "die Güte liest nie die Hand", wo: "schmiede-core.js:4064" },
            3: { umfang: { soll: 20, wort: "Tänzer zur Musik" }, masse: [{ key: "takt", wort: "Schritt-Takt-Abstand (ms)", soll: 50, richtung: "≤" }], erwartet: "leser", fehlt: "kein Tanz", wo: "koerper-core.js:5126" },
            4: { auge: { pose: "keine: keine Stile", vorbild: "10 Kampf- und Tanzstile einer Kultur (Fremde ordnen ≥ 70 %)" }, erwartet: "nicht", fehlt: "10² Stile je Kultur" },
            5: { umfang: { soll: 3, wort: "Generationen der Lehrerkette" }, masse: [{ key: "stil", wort: "Stil-Abstand Schüler↔Meister minus Schüler↔Fremder", soll: 0, richtung: "<" }], erwartet: "leser", fehlt: "keine Lehrer-Kette", wo: "koerper-core.js:5135" },
            6: { auge: { pose: "keine: keine fremden Künste", vorbild: "kohärente, unterscheidbare Künste (N = 100, ≥ 70 %)" }, erwartet: "nicht", fehlt: "neue Künste fremder Kulturen und Körper" },
        },
        proben: { 2: mutante("mensch.sport.kunst", 2, "10 Werkstücke, R² 0,1 (die Güte ohne die Hand) — ROT", { r2: 0.1 }, /ROT an R² Werk-Güte ↔ Können-Profil 0\.1 verfehlt ≥ 0\.7/, 10) },
    }),

    // ═══ GEIST-SPIELE: der Tisch des Gasthauses an der vollen Stadt ═══
    F.leiter("mensch.sport.geistspiel", {
        sek: 30,
        pfad: PFAD,
        seite: { SPORT },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const z = await K.welt("return await (" + H.seite.SPORT + ")(r, T, {});", 30000);
            H.zeile("Geist-Spiele: " + z.n + " Bewohner · im Akt treff " + z.treff + " · Sport-Akte " + z.sport);
            const tisch = "kein Brettspiel: Gasthaus und Platz bieten mahl und treff, keinen Tisch mit Brett (" + z.treff + " Bewohner im Akt treff)";
            await K.schritt(1, async () => K.leser(1, { n: z.treff, fehlt: tisch, wo: "koerper-core.js:5182" }));
            await K.schritt(2, async () => K.leser(2, { n: z.treff, fehlt: "keine Spielstärke, keine Übung, kein Elo: " + tisch, wo: "koerper-core.js:5182" }));
            await K.schritt(3, async () => K.leser(3, { n: 0, fehlt: "keine Grammatik der Spiele: 0 historische Spiele", wo: "koerper-core.js:5126" }));
            await K.schritt(4, async () => K.leser(4, { n: 0, fehlt: "keine neuen Spiele aus der Saat", wo: "koerper-core.js:5126" }));
            await K.schritt(5, async () => K.leser(5, { n: z.siedlungen, fehlt: "keine Spiele, die über Handelswege wandern (" + z.siedlungen + " Siedlungen am Ort)", wo: "koerper-core.js:5126" }));
            await K.schritt(6, async () => K.leser(6, { n: 0, fehlt: "keine Spiele je Kultur und Wahrnehmung der Art", wo: "koerper-core.js:5126" }));
        },
        sprossen: {
            1: { umfang: { soll: 100, wort: "Partien zwischen 2 Bewohnern" }, masse: [{ key: "regelwidrig", wort: "regelwidrige Züge", soll: 0, richtung: "≤" }], erwartet: "leser", fehlt: "kein Brettspiel am Tisch", wo: "koerper-core.js:5182" },
            2: {
                umfang: { soll: 10, wort: "Tische" },
                masse: [
                    { key: "eloMin", wort: "Elo des Schwächsten", von: 800, bis: 2000 },
                    { key: "eloMax", wort: "Elo des Stärksten", von: 800, bis: 2000 },
                    { key: "rho", wort: "ρ Rang ↔ Übung", soll: 0.6, richtung: "≥" },
                ],
                erwartet: "leser",
                fehlt: "keine Spielstärke, kein Elo",
                wo: "koerper-core.js:5182",
            },
            3: { umfang: { soll: 100, wort: "historische Spiele eines Archivs" }, masse: [{ key: "repro", wort: "reproduziert", soll: 0.9, richtung: "≥" }], erwartet: "leser", fehlt: "keine Grammatik der Spiele", wo: "koerper-core.js:5126" },
            4: {
                umfang: { soll: 100, wort: "neue Spiele aus der Saat" },
                masse: [
                    { key: "guete", wort: "bestehen die Qualitätsmaße", soll: 0.7, richtung: "≥" },
                    { key: "sieg", wort: "Siegquote", von: 0.4, bis: 0.6 },
                ],
                erwartet: "leser",
                fehlt: "keine neuen Spiele",
                wo: "koerper-core.js:5126",
            },
            5: { umfang: { soll: 1000, wort: "Städte an Handelswegen" }, masse: [{ key: "rho", wort: "ρ Verwandtschaft ↔ Handelskontakt", soll: 0.5, richtung: "≥" }], erwartet: "leser", fehlt: "keine wandernden Spiele", wo: "koerper-core.js:5126" },
            6: {
                umfang: { soll: 100, wort: "Saaten" },
                masse: [
                    { key: "guete", wort: "bestehen die Qualitätsmaße", soll: 0.7, richtung: "≥" },
                    { key: "unterscheidbar", wort: "paarweise unterscheidbar", soll: 0.9, richtung: "≥" },
                ],
                erwartet: "leser",
                fehlt: "keine Spiele je Kultur",
                wo: "koerper-core.js:5126",
            },
        },
        proben: { 1: mutante("mensch.sport.geistspiel", 1, "100 Partien mit 2 regelwidrigen Zügen — ROT", { regelwidrig: 2 }, /ROT an regelwidrige Züge 2 verfehlt ≤ 0/, 100) },
    }),

    // ═══ SPORT IN JEDEM MEDIUM: was der Leib und die Wagen der Großstadt an Schnee, Eis, Luft, Motor und Tier tragen ═══
    F.leiter("mensch.sport.medium", {
        sek: 30,
        pfad: [...PFAD, "stamm/koerper-bewegung.js"],
        seite: { SPORT },
        messe: async (H, K) => {
            await K.messort("stadt");
            const z = await K.welt("return await (" + H.seite.SPORT + ")(r, T, {});", 30000);
            H.zeile("Medium: Wagen der Bewohner " + z.wagen + " · Fahrzeuge " + z.fahrzeuge + " · Strecken " + z.strecken + " · Verben " + z.verben + " · Schwere " + z.schwere);
            const leib = "der Leib kennt " + z.verben + " Verben (Gehen, Sprint, Sprung, Rutsch, Klettern + " + z.geraetVerben.join(", ") + ")";
            await K.schritt(1, async () => K.leser(1, { n: 0, fehlt: "kein Ski, keine Kante, kein Schwung auf Schnee: " + leib, wo: "koerper-core.js:5789" }));
            await K.schritt(2, async () => K.leser(2, { n: 0, fehlt: "keine Kufe auf Eis, kein Brett auf der Welle: " + leib, wo: "koerper-core.js:5789" }));
            await K.schritt(3, async () => K.leser(3, { n: 0, fehlt: "kein Gleitschirm, kein Fallschirm, kein Segelflug: kein Aufwind trägt den Leib", wo: "koerper-core.js:5789" }));
            await K.schritt(4, async () => K.nicht(4, { n: z.strecken, fehlt: "Rennen auf 20 Strecken: " + z.strecken + " Strecken, die " + z.fahrzeuge + " Fahrzeuge (" + z.wagen + " mit Bewohnern am Steuer) fahren den Verkehr der Stadt" }));
            await K.schritt(5, async () => K.leser(5, { n: 0, fehlt: "kein Tier im Sport: am Steuer fährt nur der Wagen, kein Tier trägt einen Reiter", wo: "stamm/koerper-bewegung.js:2379" }));
            await K.schritt(6, async () => K.leser(6, { n: 0, fehlt: "kein Rollstuhl, keine Prothese im Bau-Gesetz, kein Bildschirm-Spiel im Spiel", wo: "koerper-core.js:1599" }));
            await K.schritt(7, async () => K.nicht(7, { n: 1, fehlt: "100 Saaten mit eigener Schwere und Dichte: eine Welt, Schwere " + z.schwere }));
        },
        sprossen: {
            1: { umfang: { soll: 1, wort: "Abfahrt auf Schnee" }, masse: [{ key: "radius", wort: "Abweichung des Schwung-Radius gegen Tempo und Kantwinkel (%)", soll: 15, richtung: "≤" }], erwartet: "leser", fehlt: "kein Ski, keine Kante", wo: "koerper-core.js:5789" },
            2: { umfang: { soll: 2, wort: "Medien (Eis, Brandung)", herkunft: "die Aufzählung „Eis und Brandung“: 2 Medien" }, masse: [{ key: "gleitweg", wort: "Abweichung des Gleitwegs auf Eis gegen den Reibwert (%)", soll: 15, richtung: "≤" }], erwartet: "leser", fehlt: "keine Kufe, kein Brett", wo: "koerper-core.js:5789" },
            3: { umfang: { soll: 3, wort: "Fluggeräte (Gleitschirm, Fallschirm, Segelflug)", herkunft: "die Aufzählung „Gleitschirm, Fallschirm, Segelflug“: 3 Fluggeräte" }, masse: [{ key: "gleitzahl", wort: "Abweichung der Gleitzahl (%)", soll: 10, richtung: "≤" }], erwartet: "leser", fehlt: "kein Flug des Leibs", wo: "koerper-core.js:5789" },
            4: { umfang: { soll: 20, wort: "Rennstrecken" }, masse: [{ key: "bestzeit", wort: "Abweichung der Bestzeit gegen die Rekordklasse (%)", soll: 5, richtung: "≤" }], erwartet: "nicht", fehlt: "keine Rennstrecke" },
            5: { umfang: { soll: 3, wort: "Tier-Sportarten (Rennen, Springen, Schlitten)", herkunft: "die Aufzählung „Rennen, Springen, Schlitten“: 3 Tier-Sportarten" }, masse: [{ key: "band", wort: "Siegerzeiten über 2 400 m im Band (Anteil)", soll: 1, richtung: "≥" }], erwartet: "leser", fehlt: "kein Reiter", wo: "stamm/koerper-bewegung.js:2379" },
            6: { umfang: { soll: 2, wort: "anderer Leib und Bildschirm-Spiel", herkunft: "„mit anderem Leib und am Bildschirm“: 2 Formen des Sports" }, masse: [{ key: "band", wort: "Zeiten im Band der Klassen-Rekorde (Anteil)", soll: 1, richtung: "≥" }], erwartet: "leser", fehlt: "kein Rollstuhl, keine Prothese", wo: "koerper-core.js:1599" },
            7: { umfang: { soll: 100, wort: "Saaten mit eigener Schwere und Dichte" }, masse: [{ key: "rang", wort: "Rang Leistung ↔ Schwere und Dichte", soll: 0.7, richtung: "≥" }], erwartet: "nicht", fehlt: "eine Welt, eine Schwere" },
        },
        proben: { 4: mutante("mensch.sport.medium", 4, "20 Strecken, Bestzeit 9 % daneben — ROT", { bestzeit: 9 }, /ROT an Abweichung der Bestzeit gegen die Rekordklasse \(%\) 9 /, 20) },
    }),
];
