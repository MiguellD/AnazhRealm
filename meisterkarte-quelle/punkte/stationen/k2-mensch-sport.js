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

// DAS SPIEL DES ABENDS (regeln S1 · mannschaft S1 · arena S1 · geistspiel S1; der Wirt `_spielTag` · `_spielProgramm`, der Kern
// `spielProgramm`): die Uhr springt auf die Stunde `uhr` des Programms (`uhrAuf` der STADT: jeder kommt an, wo sein Tag ihn sieht),
// dann `takte` Takte des Spiels (der Kopf wendet sich). Gelesen: das Programm, das der Wirt der Stadt für den Tag der Welt stellt
// (`S.spiel`), und die Programme der folgenden Tage aus derselben Funktion des Kerns über dieselben Gäste und dasselbe Feld (gelesen,
// nichts gesetzt), bis 20 Läufe, 200 Gänge des Zweikampfs und 100 Partien am Brett beisammen sind. Der Lauf: ρ (Spearman) der
// Laufzeit gegen die Leistung des Leibs allein (`spielLeib`: das Sprint-Tempo aus Bein und Kraft, ohne Übung und Tagesform) über
// alle Läufer; der Zweikampf: wie oft der Stärkere des Tags siegt; das Brett: jeder Zug der Partie (`spielTischPartie`) nachgespielt
// auf eigenem Brett — im Brett, auf ein freies Feld, keiner nach der ersten Reihe von fünf, der Sieger die Seite dieser Reihe. Die
// Arena: wer jetzt draußen im Akt „zuschauen“ an seinem Stand steht (am Feld des Platzes), und wohin er blickt — der Kopf in der
// Welt (`rig.head`, seine Richtung), sonst der Leib — gegen den Punkt des Geschehens (`S.spielJetzt`), ± 30°.
const SPIEL = async (r, T, arg, HILF) => {
    const { S, L } = HILF;
    if (!S) return { fehler: "keine Bewohner am Messort" };
    const KC = window.__koerperCore;
    HILF.uhrAuf(arg.uhr);
    await HILF.takt(arg.takte || 0);
    const sp = S.spiel;
    const aus = { bewohner: L.length, programm: !!sp, uhr: +HILF.stunde().toFixed(3), tag: S.spielTag };
    if (!sp || !KC || typeof KC.spielProgramm !== "function") return aus;
    const sek = r._bewohnerStundeSek();
    const laeufe = [], kaempfe = [], tische = [];
    let tage = 0;
    for (let d = 0; d < arg.tage && (laeufe.length < 20 || kaempfe.length < 200 || tische.length < 100); d++) {
        const P = d === 0 ? sp.programm : KC.spielProgramm(S.plan.seed >>> 0, S.spielTag + d, sp.gaeste, sp.feld, sek);
        tage++;
        if (!P) continue;
        for (const g of P.gaenge) {
            if (g.art === "lauf" && laeufe.length < 20) laeufe.push(g);
            if (g.art === "ringen" && kaempfe.length < 200) kaempfe.push(g);
            if (g.art === "brett" && tische.length < 100) tische.push(g.tisch);
        }
    }
    const rang = (A) => {
        const R = new Array(A.length);
        A.map((x, i) => [x, i]).sort((a, c) => a[0] - c[0]).forEach((x, k) => (R[x[1]] = k));
        return R;
    };
    const spear = (A, B) => {
        const ra = rang(A), rb = rang(B), m = (A.length - 1) / 2;
        let s = 0, sa = 0, sb = 0;
        for (let i = 0; i < A.length; i++) (s += (ra[i] - m) * (rb[i] - m)), (sa += (ra[i] - m) ** 2), (sb += (rb[i] - m) ** 2);
        return sa && sb ? s / Math.sqrt(sa * sb) : 0;
    };
    const zeit = [], leib = [];
    for (const g of laeufe) g.teil.forEach((gi, i) => (zeit.push(-g.zeiten[i]), leib.push(KC.spielLeib("lauf", sp.gaeste[gi].beinM, sp.gaeste[gi].kraft))));
    const staerker = kaempfe.filter((g) => g.teil[g.staerke[0] >= g.staerke[1] ? 0 : 1] === g.sieger).length;
    // das Brett nachgespielt: N × N, Reihe `reihe` (die Regel des Gesetzes, SPIEL_GESETZ.arten.brett)
    const B = KC.SPIEL_GESETZ.arten.brett, N = B.feld;
    const reihe = (f, i) => {
        let best = 0;
        for (const [dx, dz] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
            let n = 1;
            for (const s of [-1, 1])
                for (let q = 1; q < N; q++) {
                    const x = (i % N) + s * q * dx, z = ((i / N) | 0) + s * q * dz;
                    if (x < 0 || z < 0 || x >= N || z >= N || f[z * N + x] !== f[i]) break;
                    n++;
                }
            best = Math.max(best, n);
        }
        return best;
    };
    let widrig = 0, zuege = 0;
    for (const t of tische) {
        const p = KC.spielTischPartie(t);
        const f = new Array(N * N).fill(0);
        let ende = -1;
        p.zuege.forEach((i, k) => {
            zuege++;
            if (ende >= 0 || !(Number.isInteger(i) && i >= 0 && i < N * N && f[i] === 0)) return widrig++;
            f[i] = 1 + (k % 2);
            if (reihe(f, i) >= B.reihe) ende = k;
        });
        if (p.sieger !== (ende >= 0 ? ende % 2 : -1) || (ende < 0 && p.zuege.length !== N * N)) widrig++;
    }
    // die Arena jetzt: die Zuschauer an ihrem Stand und ihr Blick
    const jetzt = S.spielJetzt;
    const v = new T.Vector3();
    let zuschauer = 0, folgt = 0;
    for (const b of L) {
        const g = b.leib;
        if (!g || b.drinnen || b.akt !== "zuschauen" || !b.da) continue;
        zuschauer++;
        if (!jetzt) continue;
        const k = g.userData && g.userData.rig && g.userData.rig.head;
        const yaw = k ? (k.getWorldDirection(v), Math.atan2(v.x, v.z)) : g.rotation.y;
        const soll = Math.atan2(jetzt.x - g.position.x, jetzt.z - g.position.z);
        let d = soll - yaw;
        d -= 2 * Math.PI * Math.round(d / (2 * Math.PI));
        if (Math.abs(d) < Math.PI / 6) folgt++;
    }
    return Object.assign(aus, {
        gaeste: sp.gaeste.length,
        feld: sp.feld,
        tage,
        laeufe: laeufe.length,
        laeufer: zeit.length,
        rho: zeit.length >= 3 ? +spear(zeit, leib).toFixed(4) : null,
        kaempfe: kaempfe.length,
        sieg: kaempfe.length ? +(staerker / kaempfe.length).toFixed(4) : null,
        partien: tische.length,
        zuege,
        regelwidrig: widrig,
        zuschauer,
        folgt,
        jetzt: !!jetzt,
        blick: zuschauer && jetzt ? +(folgt / zuschauer).toFixed(4) : null,
    });
};

// DER LEIB IM TAKT (sport.koerper S1 + S2): der Spieler an der Mess-Wiese im Takt des Spiels (60 Hz, die Verb-Tafel `gehalten`):
// gehen und laufen je 150 Takte (das Tempo über die letzte Sekunde), springen aus dem Stand (der Hub der Lage über 84 Takte), dann
// den steilsten Hang im Umkreis von 12 m hinauf (die Richtung probiert die Gier aus: der Weg der Probe nennt seine Neigung). DER FUSS
// IM STAND: je Fuß seine Drehpunkte, Ferse und Ballen (die Sohle der Fuß-IK, `rig._sohle` aus koerper `leibSohle`, im Rahmen des
// Knöchels), je Punkt die Takte, in denen er höchstens 1 cm über seinem tiefsten Stand über dem Gelände steht (er trägt); je solcher
// Phase (≥ 3 Takte) der größte waagrechte Weg ab ihrem Beginn — das Gleiten. Bis nerv-bewegung maß die Probe den KNÖCHEL: rollt der
// Fuß über die Ferse ab (Perry 1992, der erste Wiegepunkt), schwenkt der Knöchel um die ruhende Ferse nach vorn — die Probe las
// die Drehung als Gleiten (1,89 cm an a69cac3 bei 1,15 m/s, die Ferse selbst steht).
const LEIB = async (r, T, arg) => {
    const st = r.state;
    const pm = st.playerMesh;
    if (!pm || typeof r._gameLoopTick !== "function") return { fehlt: "kein Spieler-Leib" };
    const halt = st.verbTafel.gehalten;
    const rig = pm.userData && pm.userData.rig;
    const fuesse = rig ? [rig.legL && rig.legL.ankle, rig.legR && rig.legR.ankle].filter(Boolean) : [];
    const punkte = []; // je Fuß [Knöchel, Ferse], [Knöchel, Ballen] — gesetzt, sobald die Fuß-IK ihre Sohle vermessen hat
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
        const F = punkte.map(() => []);
        halt.vor = true;
        halt.sprint = !!sprint;
        try {
            for (let i = 0; i < n; i++) {
                takt();
                spur.push([pm.position.x, pm.position.y, pm.position.z]);
                punkte.forEach(([b, q], k) => {
                    b.localToWorld(v.copy(q));
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
        const so = rig && rig._sohle;
        if (!so) return { fehlt: "keine Sohle am Rig (koerper leibSohle über _gaitIKPrep)" };
        for (const b of fuesse) punkte.push([b, new T.Vector3(0, -so[1], -so[2])], [b, new T.Vector3(0, -so[1], so[0])]);
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

// DIE ELF VERBEN IM SPIEL (sport.koerper S1, nerv-bewegung): je Zeile der Verb-Tafel des Kerns (koerper VERB_TAFEL) der Leib des
// Spielers im Takt des Spiels (60 Hz, die Verb-Tafel `gehalten`, wie LEIB) gegen das Gesetz seines Verbs — gemessen, nie gesetzt.
// Gehen, Sprint und Sprung misst LEIB; hier die acht anderen. Die Geräte stehen als Werke des Fachwerks (WERKE mit siteTag
// spielplatz) 20 m auseinander neben dem Leib, ihr Angebot aus dem EINEN Gesetz der Welt (`_geraetAngebotWelt`), der Zustand des
// Geräts am Verb des Leibs (`leibVerb.theta`, `leibVerb.ang.zustand` — nie an einer Kopie); die Wand ist ein Bauplan (3 × 5,5 m),
// das Wasser der See nächst der Mess-Wiese (wasser-linse `__wasserOrte`, die Welt an sein Ostufer gestreamt). Je Verb der Wert und
// sein Band: Schaukel-Periode gegen 2π√(L/g) (VERB_SOLL.periode), Rutsche Spitze und Ausgang, Wippe an den Anschlag, Klettern ·
// Hangeln · Balancieren im Tempo-Band (VERB_SOLL.tempo), die Wand im Tempo parkour.kletterV, Schwimmen gegen Gehen × speedMul
// (koerper fx.bewegung.schwimmen). Spike nerv-bewegung (Cloud, Null-Renderer, an 374e1c6+): 8 von 8 im Band, 14,8 s.
const VERBEN = async (r, T, arg) => {
    const st = r.state;
    const pm = st.playerMesh;
    const KC = window.__koerperCore;
    const FC = globalThis.__fachwerkCore;
    if (!pm || typeof r._gameLoopTick !== "function" || !KC || !KC.VERB_TAFEL || !KC.VERB_SOLL || !FC || !FC.WERKE)
        return { fehlt: "kein Leib, kein Spiel-Takt oder kein Verb-Gesetz (koerper VERB_TAFEL · VERB_SOLL, fachwerk WERKE)" };
    const halt = st.verbTafel.gehalten;
    const F = AnazhRealm.PLAYER_FOOT_OFFSET;
    const S = KC.VERB_SOLL;
    const VG = KC.VERB_GESETZ;
    const g = Math.abs(st.gravity);
    let uhr = performance.now();
    const takt = () => r._gameLoopTick((uhr += 1000 / 60));
    const los = () => {
        for (const k of ["vor", "sprint", "jump", "rutschen"]) halt[k] = false;
    };
    const boden = (x, z) => r.getTerrainHeightAt(x, z);
    // die Lage setzen wie die Leib-Proben (g5 leibK3): Mesh, Sim-Lage und der Zustand des Kontakts
    const setz = (x, y, z, gier) => {
        st.leibVerb = null;
        pm.position.set(x, y + F, z);
        if (st._fixedSimPos) st._fixedSimPos.copy(pm.position);
        [st._fixedPrevPos, st._fieldVy, st.isInAir, st._fieldWasGrounded, st.playerUnderwater, st.playerEyesUnderwater] = [null, 0, false, false, false, false];
        st.playerVel.setValue(0, 0, 0);
        st.yaw = gier;
        if (st.player) st.player.stamina = 100;
    };
    // die Tasten je Strecke (W vor · + Sprint · ^ Sprung · C Sitzen), je Takt der Leser `je(n, tasten)`
    const fahre = (skript, je) => {
        let n = 0;
        try {
            for (const [k, t] of skript) {
                halt.vor = t.includes("W");
                halt.sprint = t.includes("+");
                halt.jump = t.includes("^");
                halt.rutschen = t.includes("C");
                for (let i = 0; i < k; i++) {
                    takt();
                    if (je) je(n++, t);
                }
            }
        } finally {
            los();
        }
    };
    const ruhe = (n) => fahre([[n, ""]]);
    const P0 = pm.position.clone();
    const yaw0 = st.yaw;
    const aus = {};
    const band = (name, wert, lo, hi, gesetz) => (aus[name] = { wert: Number.isFinite(wert) ? +wert.toFixed(3) : null, lo, hi, gesetz, ok: Number.isFinite(wert) && wert >= lo && wert <= hi });
    const fehlt = (name, warum) => (aus[name] = { wert: null, ok: false, fehlt: warum });
    const werke = [];
    try {
        // DIE GERÄTE: je Werk des Spielplatzes eine Stelle 20 m weiter, der Boden der Stelle trägt es
        const arten = Object.entries(FC.WERKE).filter(([, w]) => w && w.siteTag === "spielplatz");
        const ang = {};
        arten.forEach(([id, w], i) => {
            const x = P0.x + 20 * (i + 1);
            const z = P0.z + 20;
            const e = r.spawnArchitecture(w.kind + "_" + id, { x, y: boden(x, z) + 0.5, z }, { rotationY: 0, silent: true, precise: true, seed: 1 });
            if (!e) return;
            werke.push(e);
            ang[id] = r._geraetAngebotWelt(e, id);
        });
        const an = (werk, verb, teil) => (ang[werk] || []).find((a) => a.verb === verb && (!teil || a.teil === teil));
        const verb = () => st.leibVerb && st.leibVerb.verb;
        // SCHAUKELN: aufsitzen, eine Sekunde anschwingen, frei ausschwingen — die Periode aus den Nulldurchgängen hinauf
        const sa = an("doppelschaukel", "schaukeln", "sitz0");
        if (!sa) fehlt("schaukeln", "keine Doppelschaukel gesetzt");
        else {
            setz(sa.sitz[0], boden(sa.sitz[0], sa.sitz[2] + 0.3), sa.sitz[2] + 0.3, 0);
            ruhe(10);
            const nd = [];
            let prev = null;
            let drin = 0;
            fahre([[1, "C"], [2, ""], [60, "W"], [360, ""]], (n) => {
                if (verb() !== "schaukeln") return (prev = null);
                drin++;
                const th = st.leibVerb.theta;
                if (n > 63 && prev !== null && prev < 0 && th >= 0) nd.push(n);
                prev = th;
            });
            const Lp = sa.achse.a[1] - sa.sitz[1] - VG.schaukeln.sitzSchwerpunktM;
            const soll = 2 * Math.PI * Math.sqrt(Lp / g);
            const per = nd.length > 1 ? (nd[nd.length - 1] - nd[0]) / (nd.length - 1) / 60 : NaN;
            band("schaukeln", drin ? per : NaN, soll * (1 - S.periode), soll * (1 + S.periode), "Periode 2π√(L/g) " + soll.toFixed(3) + " s ± " + 100 * S.periode + " % (L " + Lp.toFixed(3) + " m)");
            fahre([[1, "C"]]);
            ruhe(30);
        }
        // RUTSCHEN: am Kopf der Bahn sitzen, gleiten — die Spitze und der Ausgang
        const ra = an("turmrutsche", "rutschen");
        if (!ra) fehlt("rutschen", "keine Turmrutsche gesetzt");
        else {
            setz(ra.bahn[0][0], ra.podest, ra.bahn[0][2] - 0.15, 0);
            ruhe(5);
            let vmax = NaN;
            let ab = NaN;
            fahre([[1, "C"], [300, ""]], () => {
                const V = st.leibVerb;
                if (V && V.verb === "rutschen") vmax = Math.max(Number.isFinite(vmax) ? vmax : 0, V.tempo || 0);
                else if (Number.isFinite(vmax) && !Number.isFinite(ab)) ab = Math.hypot(st.playerVel.x(), st.playerVel.z());
            });
            band("rutschen", vmax, S.tempo.rutscheMax[0], S.tempo.rutscheMax[1], "Spitze im Band der Rutsche (Ausgang " + (Number.isFinite(ab) ? ab.toFixed(2) : "—") + " m/s, Band " + S.tempo.rutscheAusgang.join("–") + ")");
            if (aus.rutschen.ok && !(ab >= S.tempo.rutscheAusgang[0] && ab <= S.tempo.rutscheAusgang[1])) aus.rutschen.ok = false;
            aus.rutschen.ausgang = Number.isFinite(ab) ? +ab.toFixed(3) : null;
            ruhe(30);
        }
        // WIPPEN: aufsitzen, abstoßen — der Hebel kippt an seinen Anschlag
        const wa = an("balkenwippe", "wippen");
        if (!wa) fehlt("wippen", "keine Balkenwippe gesetzt");
        else {
            setz(wa.sitz[0][0], boden(wa.sitz[0][0], wa.sitz[0][2] + 0.3), wa.sitz[0][2] + 0.3, 0);
            ruhe(10);
            let phi = NaN;
            fahre([[1, "C"], [60, ""], [1, "^"], [90, ""]], () => {
                const z = verb() === "wippen" && st.leibVerb.ang.zustand;
                if (z) phi = Math.max(Number.isFinite(phi) ? phi : 0, Math.abs(z.phi || 0));
            });
            band("wippen", phi, wa.phiMax - 1e-6, Math.PI, "der Hebel am Anschlag phiMax " + wa.phiMax.toFixed(3) + " rad");
            fahre([[1, "C"]]);
            ruhe(30);
        }
        // KLETTERN am Sprossengerüst: vor gegen die Fläche, hinauf — das Tempo des Stiegs
        const ka = an("sprossengeruest", "klettern");
        if (!ka) fehlt("klettern", "kein Sprossengerüst gesetzt");
        else {
            const n = ka.normale;
            setz(ka.flaeche[0] + n[0] * 0.4, boden(ka.flaeche[0] + n[0] * 0.4, ka.flaeche[2] + n[1] * 0.4), ka.flaeche[2] + n[1] * 0.4, Math.atan2(-n[0], -n[1]));
            ruhe(10);
            const v = [];
            fahre([[40, "W"], [300, "W"]], () => {
                const V = st.leibVerb;
                if (V && V.verb === "klettern" && Number.isFinite(V.tempo)) v.push(V.tempo);
            });
            band("klettern", v.length ? v.reduce((s, x) => s + x, 0) / v.length : NaN, S.tempo.klettern[0], S.tempo.klettern[1], "Tempo des Stiegs im Band (VERB_SOLL.tempo.klettern)");
            ruhe(60);
        }
        // HANGELN an der Hangelbahn: hinauf springen, greifen, vor — das Tempo längs des Holms
        const ha = an("hangelbahn", "hangeln");
        if (!ha) fehlt("hangeln", "keine Hangelbahn gesetzt");
        else {
            const h = ha.holme[0];
            const x = (h[0][0] + h[1][0]) / 2;
            setz(x, boden(x, h[0][2]), h[0][2], 0);
            ruhe(10);
            let p0 = null;
            let t0 = 0;
            let p1 = null;
            let t1 = 0;
            fahre([[1, "^"], [40, "^"], [200, "W"]], (n) => {
                if (verb() !== "hangeln") return;
                if (!p0) [p0, t0] = [pm.position.clone(), n];
                [p1, t1] = [pm.position.clone(), n];
            });
            band("hangeln", p0 && t1 > t0 ? Math.hypot(p1.x - p0.x, p1.z - p0.z) / ((t1 - t0) / 60) : NaN, S.tempo.hangeln[0], S.tempo.hangeln[1], "Tempo längs des Holms im Band (VERB_SOLL.tempo.hangeln)");
            ruhe(60);
        }
        // BALANCIEREN auf dem Schwebebalken: aufsteigen, vor — das Tempo auf der Linie
        const ba = an("schwebebalken", "balancieren");
        if (!ba) fehlt("balancieren", "kein Schwebebalken gesetzt");
        else {
            const b = ba.bahn[0];
            setz(b[0], b[1] + 0.05, b[2] + 0.3, 0);
            ruhe(20);
            let v = NaN;
            fahre([[2, "W"], [150, "W+"]], () => {
                const V = st.leibVerb;
                if (V && V.verb === "balancieren") v = Math.max(Number.isFinite(v) ? v : 0, V.tempo || 0);
            });
            band("balancieren", v, S.tempo.balancieren[0], S.tempo.balancieren[1], "Tempo auf dem Balken im Band (VERB_SOLL.tempo.balancieren)");
            ruhe(30);
        }
        // DIE WAND (Leib-Verb, parkour): ein Bauplan 3 × 4 m, vor gegen seine Fläche — der Stieg im Tempo kletterV
        const kv = KC.PRESETS.mensch.fx.bewegung.parkour.kletterV;
        if (!st.blueprints.messwand && r.createBlueprint("messwand"))
            r.addPartToBlueprint("messwand", { position: { x: 0, y: 1.25, z: 0 }, size: { x: 3, y: 5.5, z: 0.4 } });
        const wx = P0.x - 20;
        const wz = P0.z + 20;
        const wand = r.spawnArchitecture("messwand", { x: wx, y: boden(wx, wz) + 0.5, z: wz }, { precise: true, rotationY: 0 });
        if (!wand) fehlt("wand", "der Bauplan der Wand steht nicht");
        else {
            werke.push(wand);
            setz(wx, boden(wx, wz - 1.2), wz - 1.2, 0);
            ruhe(10);
            let y0 = null;
            let n0 = 0;
            let y1 = null;
            let n1 = 0;
            fahre([[240, "W"]], (n) => {
                if (!(st._parkourKletter > 0)) return;
                if (y0 === null) [y0, n0] = [pm.position.y, n];
                [y1, n1] = [pm.position.y, n];
            });
            band("wand", y0 !== null && n1 > n0 ? (y1 - y0) / ((n1 - n0) / 60) : NaN, kv * 0.9, kv * 1.1, "Stieg an der Wand parkour.kletterV " + kv + " m/s ± 10 %");
            ruhe(30);
        }
        // SCHWIMMEN im See nächst der Mess-Wiese (wasser-linse `__wasserOrte`, die Welt an sein Ostufer gestreamt wie gate:wasser-leben
        // und g5 leib.K3): vom Ufer nach Westen, W bis der Leib schwimmt und nicht mehr geerdet ist, dann 90 Takte — das Tempo
        // der letzten 60 gegen Gehen × speedMul (koerper fx.bewegung.schwimmen)
        const SW = KC.PRESETS.mensch.fx.bewegung.schwimmen;
        const orte = typeof window.__wasserOrte === "function" ? await window.__wasserOrte({}) : null;
        if (!orte) fehlt("schwimmen", "die Orte des Wassers fehlen (wasser-linse WASSER_INSTALL)");
        else if (!orte.see) fehlt("schwimmen", "kein See nächst der Mess-Wiese (__wasserOrte)");
        else {
            await window.__wasserStrom(orte.see.ufer, 0.6);
            const [ux, uz] = orte.see.ufer;
            setz(ux, r._voxelSurfaceY(ux, uz) + 0.05, uz, -Math.PI / 2);
            ruhe(30);
            let bis = 0;
            halt.vor = true;
            try {
                while (bis < 2400 && !(st.playerUnderwater && !st._fieldWasGrounded)) (takt(), bis++);
            } finally {
                los();
            }
            const spur = [];
            fahre([[90, "W"]], () => spur.push(st.playerUnderwater && !st._fieldWasGrounded ? [pm.position.x, pm.position.z] : null));
            const letzte = spur.slice(-61);
            const v = letzte.length === 61 && letzte.every(Boolean) ? Math.hypot(letzte[60][0] - letzte[0][0], letzte[60][1] - letzte[0][1]) : NaN;
            const soll = st.speed * SW.speedMul;
            band("schwimmen", v, soll * 0.9, soll * 1.1, "Tempo im See = Gehen × speedMul " + soll.toFixed(3) + " m/s ± 10 % (See " + orte.see.x + "/" + orte.see.z + ", nach " + bis + " Takten am Ufer)");
            ruhe(10);
        }
    } finally {
        los();
        st.leibVerb = null;
        for (const e of werke) r.removeArchitecture(e);
        setz(P0.x, P0.y - F, P0.z, yaw0);
        for (let i = 0; i < 30; i++) takt();
    }
    return { verben: aus, tafel: Object.keys(KC.VERB_TAFEL) };
};

// DIE ÜBUNG (koennen S2, kunst S1): der Lebenslauf trägt je Bewohner die Stunden der Übung in drei Künsten und ihr Können
// (`b.uebung` → `_bewohnerLauf` „uebung“: { haupt, handwerk|tanz|kampf: { h, koennen } }, LEBENSLAUF.uebung), und das Werk liest es:
// die Herstellung je Stunde ist die seines Berufs mal dem Können seines Handwerks (`_bestandAnlegen`: `b.bestand.rate`, koerper
// BESTAND_GESETZ.herstellung[beruf].jeStunde). DIE GÜTE, die die Welt zeigt, ist also die Rate seines Werks über der des Berufs — je
// Hersteller ein Punkt (Stunden, Güte); der Fit log(Güte) = a + α·log(Stunden) über alle Hersteller (das Potenzgesetz der Übung,
// Newell & Rosenbloom 1981), sein R² und α. Dazu je Kunst die Meister (Können ≥ 1: das Band der Guten, 7 500 h) und die Anfänger
// (Können < 0,5) — die Paare für den Blindtest
const UEBUNG = async (r, T, arg) => {
    const KC = window.__koerperCore;
    const HS = KC && KC.BESTAND_GESETZ && KC.BESTAND_GESETZ.herstellung;
    if (!HS) return { fehler: "der Kern trägt keine Herstellung (koerper BESTAND_GESETZ)" };
    const U = r.constructor.LEBENSLAUF && r.constructor.LEBENSLAUF.uebung;
    if (!U) return { fehler: "der Wirt trägt keinen Lebenslauf (LEBENSLAUF.uebung)" };
    const pts = [];
    let [werke, ohneRate, bewohner] = [0, 0, 0];
    const berufe = {};
    const meister = {}, anfaenger = {};
    for (const a of U.kuenste) meister[a] = anfaenger[a] = 0;
    for (const S of (r._bewohnerSiedlungen || new Map()).values())
        for (const b of S.liste || []) {
            bewohner++;
            const k = b.uebung;
            for (const a of U.kuenste) {
                if (k[a].koennen >= 1) meister[a]++;
                else if (k[a].koennen < 0.5) anfaenger[a]++;
            }
            if (!(b.bestand && b.bestand.art === "werk")) continue;
            werke++;
            const P = HS[b.beruf];
            if (!P || !(P.jeStunde > 0) || !(b.bestand.rate > 0)) {
                ohneRate++;
                continue;
            }
            berufe[b.beruf] = (berufe[b.beruf] || 0) + 1;
            pts.push({ h: k.handwerk.h, g: b.bestand.rate / P.jeStunde });
        }
    const F = pts.filter((p) => p.h >= 1 && p.g > 0).map((p) => [Math.log(p.h), Math.log(p.g)]);
    let r2 = null, alpha = null;
    if (F.length >= 3) {
        const mx = F.reduce((s, p) => s + p[0], 0) / F.length, my = F.reduce((s, p) => s + p[1], 0) / F.length;
        let [sxx, sxy, syy] = [0, 0, 0];
        for (const [x, y] of F) [sxx, sxy, syy] = [sxx + (x - mx) ** 2, sxy + (x - mx) * (y - my), syy + (y - my) ** 2];
        alpha = sxx > 0 ? sxy / sxx : null;
        r2 = sxx > 0 && syy > 0 ? (sxy * sxy) / (sxx * syy) : null;
    }
    const hs = pts.map((p) => p.h);
    // DER EINE BEWOHNER ÜBER 10² ÜBUNGSSTUNDEN (der Umfang der Sprosse, wörtlich): der erste Hersteller, der Kalender der Welt
    // (`worldMeta.kalender`, wie absicht S2) in elf Schritten so weit vorwärts, dass seine Stunden im Handwerk um 100 wachsen; je
    // Schritt seine Stunden (`b.uebung`) und die Güte, die sein Werk zeigt (`b.bestand.rate` ÷ jeStunde) — danach zurück, byte-gleich
    const wm = r.state.worldMeta;
    let einer = null;
    const b1 = (() => {
        for (const S of (r._bewohnerSiedlungen || new Map()).values())
            for (const b of S.liste || []) if (b.bestand && b.bestand.art === "werk" && HS[b.beruf] && HS[b.beruf].jeStunde > 0 && b.bestand.rate > 0) return b;
        return null;
    })();
    if (b1 && wm) {
        r._kalenderZeit();
        const hatte = Object.prototype.hasOwnProperty.call(wm, "kalender");
        const alt = hatte ? wm.kalender : undefined;
        const [v0, l0] = alt || [0, r._kalender().normS];
        const jahrK = r._kalender().jahrK;
        const reihe = [];
        try {
            const h0 = b1.uebung.handwerk.h;
            wm.kalender = [v0 + jahrK, l0];
            const proJ = b1.uebung.handwerk.h - h0;
            const schrittK = proJ > 0 ? (10 / proJ) * jahrK : 0;
            for (let k = 0; k <= 10 && schrittK > 0; k++) {
                wm.kalender = [v0 + k * schrittK, l0];
                const u = b1.uebung.handwerk;
                reihe.push({ h: u.h, gesetz: u.koennen, g: b1.bestand.rate / HS[b1.beruf].jeStunde });
            }
        } finally {
            if (hatte) wm.kalender = alt;
            else delete wm.kalender;
        }
        let r2e = null;
        const P = reihe.filter((p) => p.h >= 1 && p.g > 0).map((p) => [Math.log(p.h), Math.log(p.g)]);
        if (P.length >= 3) {
            const mx = P.reduce((s, p) => s + p[0], 0) / P.length, my = P.reduce((s, p) => s + p[1], 0) / P.length;
            let [sxx, sxy, syy] = [0, 0, 0];
            for (const [x, y] of P) [sxx, sxy, syy] = [sxx + (x - mx) ** 2, sxy + (x - mx) * (y - my), syy + (y - my) ** 2];
            // steht die Güte über den Stunden still (syy 0), erklärt das Potenzgesetz nichts von ihr: R² 0
            r2e = sxx > 0 ? (syy > 0 ? (sxy * sxy) / (sxx * syy) : 0) : null;
        }
        const q = (x) => +x.toFixed(4);
        einer = reihe.length
            ? { beruf: b1.beruf, spanne: Math.round(reihe[reihe.length - 1].h - reihe[0].h), hVon: Math.round(reihe[0].h), hBis: Math.round(reihe[reihe.length - 1].h), gVon: q(reihe[0].g), gBis: q(reihe[reihe.length - 1].g), gesetzVon: q(reihe[0].gesetz), gesetzBis: q(reihe[reihe.length - 1].gesetz), r2: r2e == null ? null : q(r2e), zurueck: !hatte ? !Object.prototype.hasOwnProperty.call(wm, "kalender") : wm.kalender === alt }
            : null;
    }
    return {
        einer,
        bewohner,
        werke,
        ohneRate,
        hersteller: F.length,
        berufe,
        r2: r2 == null ? null : +r2.toFixed(4),
        alpha: alpha == null ? null : +alpha.toFixed(4),
        alphaGesetz: U.alpha,
        hMin: hs.length ? Math.round(Math.min(...hs)) : null,
        hMax: hs.length ? Math.round(Math.max(...hs)) : null,
        spanne: hs.length ? Math.round(Math.max(...hs) - Math.min(...hs)) : 0,
        meister,
        anfaenger,
    };
};

const PFAD = ["stamm/siedlung-bewohner.js", "koerper-core.js", "fachwerk-core.js", "stamm/siedlung-ort.js"];
const { STADT } = require("./k2-mensch-geist.js");
// DAS SPIEL DES ABENDS an der Stadt des Messorts stadt-voll (die Seite SPIEL mit der STADT): die Uhr 18,55 Uhr — im dritten Lauf
// des Programms vor dem Start, der Punkt des Geschehens an der Linie am Ende des Felds —, 15 Takte, bis zu 40 Tage des Programms
// (die Messe fährt in ihrem EIGENEN Prozess: sie kennt keine Konstante dieser Datei — Lauf und Zeile reisen als Seite SPIELWELT ·
// SPIELZEILE, das Argument steht in ihr; bis hier brach jede der vier Stationen mit „ReferenceError: spielWelt is not defined“)
async function SPIELWELT(H, K) {
    return K.welt("const HILF = (" + H.seite.STADT + ")(r, T);\ntry {\n    return await (" + H.seite.SPIEL + ")(r, T, " + JSON.stringify({ uhr: 18.55, takte: 15, tage: 40 }) + ", HILF);\n} finally {\n    HILF.zurueck();\n}", 30000); // prettier-ignore
}
function SPIELZEILE(sp) {
    return "Spiel an stadt-voll um " + sp.uhr + " Uhr (Tag " + sp.tag + "): " + (sp.programm ? sp.gaeste + " Gäste des Treffs, Feld " + JSON.stringify(sp.feld) + " · " + sp.tage + " Tage: " + sp.laeufe + " Läufe (" + sp.laeufer + " Läufer, ρ " + sp.rho + ") · " + sp.kaempfe + " Gänge (der Stärkere " + sp.sieg + ") · " + sp.partien + " Partien (" + sp.zuege + " Züge, " + sp.regelwidrig + " regelwidrig) · jetzt " + sp.zuschauer + " Zuschauer, " + sp.folgt + " mit Blick am Geschehen" : "kein Programm (" + sp.bewohner + " Bewohner)"); // prettier-ignore
}
const KARTE = "[linse-gpu] amd/rdna-3 (Probe)";
const mutante = (id, n, name, werte, zahl, umfang) => [{ name, j: { leiter: id, adapter: KARTE, sprossen: { [n]: { art: "zahl", n: umfang, werte } } }, gruen: false, zahl }];

module.exports = (F) => [
    // ═══ REGEL-GRAMMATIK: was die Welt an Wettkampf, Spiel und Regel trägt — am Genesis-Ort mit Arena und Spielplatz, Akte um 15 Uhr ═══
    F.leiter("mensch.sport.regeln", {
        sek: 30,
        pfad: PFAD,
        seite: { SPORT, STADT, SPIEL, SPIELWELT, SPIELZEILE },
        messe: async (H, K) => {
            // DER LAUF (koerper SPIEL_GESETZ, der Wirt `_spielTag`): am Platz der vollen Stadt — am Genesis-Ort wohnt niemand
            await K.messort("stadt-voll");
            const sp = await H.seite.SPIELWELT(H, K);
            H.zeile(H.seite.SPIELZEILE(sp));
            await K.schritt(1, async () => (sp.laeufe ? K.zahl(1, { n: sp.laeufe, werte: { rho: sp.rho } }) : K.leser(1, { n: 0, fehlt: "kein Wettkampf-Akt im Tages-Gesetz: kein Lauf, kein Wurf, kein Sieger (" + H.seite.SPIELZEILE(sp) + ")", wo: "stamm/siedlung-bewohner.js _spielTag" })));
            await K.messort("genesis");
            const z = await K.welt("return await (" + H.seite.SPORT + ")(r, T, " + JSON.stringify({ stunde: 15 }) + ");", 30000);
            H.zeile("Sport am Genesis-Ort: " + z.n + " Bewohner · Akte jetzt " + JSON.stringify(z.akte) + " · um 15 Uhr " + JSON.stringify(z.akteN) + " · Sport-Akte " + z.sport + "/" + z.sportN + " · Arena " + JSON.stringify(z.arena) + " · Geräte " + z.geraete);
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
        sek: 60,
        mutiert: true,
        pfad: ["koerper-core.js", "stamm/koerper-bewegung.js", "stamm/dirigent-kern.js", "stamm/gelaende-boden.js", "stamm/gelaende-kollision.js", "fachwerk-core.js"],
        seite: { LEIB, SPORT, VERBEN },
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
            // die acht Verben jenseits von Gehen, Sprint und Sprung (VERBEN, zuletzt: das Schwimmen streamt die Welt an den See)
            await K.welt(require(require("path").resolve("scripts/lib/wasser-linse.cjs")).WASSER_INSTALL + "\nreturn true;", 10000);
            const V = await K.welt("return await (" + H.seite.VERBEN + ")(r, T, {});", 60000);
            H.zeile("Verben: " + JSON.stringify(V));
            await K.schritt(1, async () => {
                if (L.fehlt) throw new Error(L.fehlt);
                if (V.fehlt) throw new Error(V.fehlt);
                const w = { gehen: L.gehen.tempo, sprint: L.sprint.tempo, sprung: L.sprungM };
                // je Zeile der Verb-Tafel (koerper-core.js:6154 VERB_TAFEL): Gehen, Sprint, Sprung gemessen (ihr Band richten die Maße),
                // jedes andere gemessen UND im Band seines Gesetzes
                const tafel = V.tafel || [];
                const da = tafel.filter((k) => (k in w ? Number.isFinite(w[k]) && w[k] > 0 : !!(V.verben[k] && V.verben[k].ok)));
                const fehl = tafel.filter((k) => !da.includes(k));
                const zeig = (k) => {
                    const e = V.verben[k] || {};
                    return k + " " + (e.fehlt ? "fehlt (" + e.fehlt + ")" : e.wert + " in " + +(+e.lo).toFixed(3) + "–" + +(+e.hi).toFixed(3) + " " + (e.ok ? "✓" : "✗"));
                };
                K.zahl(1, {
                    n: da.length,
                    werte: w,
                    beleg: "die Verb-Tafel koerper-core.js:6154 (leibVerben :6180) — Gehen " + w.gehen + " · Sprint " + w.sprint + " m/s · Sprung " + w.sprung + " m (LEIB, Mess-Wiese) · " + tafel.filter((k) => !(k in w)).map(zeig).join(" · "),
                    taeter: fehl.length ? "die Verben außerhalb ihres Gesetzes: " + fehl.map(zeig).join(" · ") : "die Leib-Werte des Menschen (koerper-core.js leibVerben: Bein, Masse, Kraft)",
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
        seite: { SPORT, UEBUNG },
        messe: async (H, K) => {
            await K.messort("stadt");
            const z = await K.welt("return await (" + H.seite.SPORT + ")(r, T, {});", 30000);
            const u = await K.welt("return await (" + H.seite.UEBUNG + ")(r, T, {});", 20000);
            if (!u || u.fehler) throw new Error("die Übung der Stadt: " + ((u && u.fehler) || "ohne Antwort"));
            H.zeile("Übung: " + u.hersteller + " Hersteller von " + u.werke + " Werken · R² " + u.r2 + " · α " + u.alpha + " (Gesetz " + u.alphaGesetz + ") · Stunden " + u.hMin + "–" + u.hMax);
            H.zeile("Können: " + z.n + " Bewohner · Lauf " + JSON.stringify(z.lauf) + " · mit Können-Profil " + z.koennen);
            await K.schritt(1, async () =>
                K.zahl(1, {
                    n: z.lauf.n,
                    werte: { cv: z.lauf.cv },
                    beleg: "100-m-Zeit = 100 m ÷ Tempo des Gangs (b.tempo, stamm/siedlung-bewohner.js:1051), Mittel " + z.lauf.mittelS + " s · Altersgang ρ(Alter, Zeit) " + z.lauf.alterRho + " · " + z.koennen + " mit Können-Profil",
                    taeter: "das Tempo der Bewohner folgt nur der Beinlänge (stamm/siedlung-bewohner.js:1051), kein Können-Profil",
                })
            );
            // S2: die Güte, die das Werk zeigt (Rate des Werks ÷ Rate des Berufs), über den Stunden der Übung — gegen das Potenzgesetz
            // Der Umfang ist EIN Bewohner über 10² Übungsstunden (u.einer: derselbe Mensch, der Kalender rückt); der Querschnitt über
            // alle Hersteller ist Beleg, nie das Urteil — er zeigt die Güte zwischen Menschen, nicht über die Übung eines Menschen
            await K.schritt(2, async () => {
                const e = u.einer;
                if (!e) throw new Error("kein Hersteller mit Rate an der Stadt (oder kein Kalender)");
                if (!e.zurueck) throw new Error("der Kalender stand nach der Übung nicht, wo er stand");
                H.zeile("S2 ein " + e.beruf + ": Stunden " + e.hVon + " → " + e.hBis + ", Güte des Werks " + e.gVon + " → " + e.gBis + " (das Gesetz " + e.gesetzVon + " → " + e.gesetzBis + "), R² " + e.r2);
                K.zahl(2, {
                    n: e.spanne,
                    werte: { r2: e.r2 },
                    beleg: "ein " + e.beruf + " über " + e.hVon + "–" + e.hBis + " Übungsstunden (der Kalender der Welt rückt): die Güte seines Werks (b.bestand.rate ÷ jeStunde) " + e.gVon + " → " + e.gBis + ", das Können seines Lebenslaufs " + e.gesetzVon + " → " + e.gesetzBis + "; Querschnitt " + u.hersteller + " Hersteller " + JSON.stringify(u.berufe) + " über " + u.hMin + "–" + u.hMax + " h: R² " + u.r2 + ", α " + u.alpha + " (Gesetz " + u.alphaGesetz + ")",
                    taeter: "stamm/siedlung-bewohner.js _bestandAnlegen — die Rate des Werks liest das Können EINMAL beim Bau der Liste (`b.bestand.rate *= b.uebung.handwerk.koennen`): über die Stunden der Übung eines Menschen steht seine Güte still",
                });
            });
            await K.schritt(3, async () => K.leser(3, { n: z.sport, fehlt: "kein Wettkampf, kein Bestwert (" + z.n + " Bewohner, " + z.sport + " im Sport-Akt)", wo: "koerper-core.js:5126" }));
            await K.schritt(4, async () => K.leser(4, { n: 0, fehlt: "keine Altersklassen, Vereine, Meister: die Rollen des Tages-Gesetzes tragen keine", wo: "koerper-core.js:5135" }));
            await K.schritt(5, async () => K.leser(5, { n: 0, fehlt: "keine Weltmeisterschaft, kein Rekord: die Leib-Werte kennen weder Übung noch Talent", wo: "koerper-core.js:5455" }));
            await K.schritt(6, async () => K.leser(6, { n: 0, fehlt: "keine Rekorde über Jahrhunderte (Teilnehmer, Ernährung, Technik)", wo: "koerper-core.js:5455" }));
        },
        sprossen: {
            1: { umfang: { soll: 100, wort: "Bewohner mit 100-m-Zeit" }, masse: [{ key: "cv", wort: "Variationskoeffizient der 100-m-Zeit (%)", von: 10, bis: 20 }] },
            2: { umfang: { soll: 100, wort: "Übungsstunden eines Bewohners" }, masse: [{ key: "r2", wort: "R² Güte ↔ Potenzgesetz der Übung", soll: 0.8, richtung: "≥" }] },
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
        proben: {
            1: mutante("mensch.sport.koennen", 1, "100 Bewohner, CV 4 % (das Tempo nur aus der Beinlänge) — ROT", { cv: 4 }, /ROT an Variationskoeffizient der 100-m-Zeit \(%\) 4 verfehlt 10–20/, 100),
            2: [
                ...mutante("mensch.sport.koennen", 2, "das Können genommen (jeder Hersteller gleich, wie vor bewohner-satz): R² 0 — ROT", { r2: 0 }, /ROT an R² Güte ↔ Potenzgesetz der Übung 0 verfehlt ≥ 0\.8/, 5000),
                ...mutante("mensch.sport.koennen", 2, "kein Hersteller mit Rate (der Fit ohne Punkte) — ROT", { r2: null }, /ROT an Umfang 0 < 100/, 0),
            ],
        },
    }),

    // ═══ MANNSCHAFT UND TAKTIK: Kampf und Spiel zweier Seiten — am Genesis-Ort mit seiner Arena ═══
    F.leiter("mensch.sport.mannschaft", {
        sek: 30,
        pfad: [...PFAD, "stamm/kampf.js"],
        seite: { SPORT, STADT, SPIEL, SPIELWELT, SPIELZEILE },
        messe: async (H, K) => {
            // DER ZWEIKAMPF (koerper `spielKampf`: Angriff, Finte, Abwehr; der Wirt `_spielTag`): am Platz der vollen Stadt
            await K.messort("stadt-voll");
            const sp = await H.seite.SPIELWELT(H, K);
            H.zeile(H.seite.SPIELZEILE(sp));
            await K.schritt(1, async () => (sp.kaempfe ? K.zahl(1, { n: sp.kaempfe, werte: { sieg: sp.sieg } }) : K.leser(1, { n: 0, fehlt: "kein Kampf 1 gegen 1 zweier Leiber (" + H.seite.SPIELZEILE(sp) + ")", wo: "stamm/siedlung-bewohner.js _spielTag" })));
            await K.messort("genesis");
            const z = await K.welt("return await (" + H.seite.SPORT + ")(r, T, " + JSON.stringify({ stunde: 15 }) + ");", 30000);
            H.zeile("Mannschaft: " + z.n + " Bewohner · Sport-Akte " + z.sport + "/" + z.sportN + " · Arena " + JSON.stringify(z.arena));
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
        seite: { SPORT, STADT, SPIEL, SPIELWELT, SPIELZEILE },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const s = await K.welt("return await (" + H.seite.SPORT + ")(r, T, " + JSON.stringify({ stunde: 15 }) + ");", 30000);
            H.zeile("Stadt um 15 Uhr: " + s.n + " Bewohner · Akte " + JSON.stringify(s.akteN) + " · Partien " + s.partien + " · Stichproben " + s.stichproben + " · mit Partie " + s.mitPartie);
            await K.schritt(7, async () => {
                const anteil = s.stichproben ? s.mitPartie / s.stichproben : 0;
                if (s.partien >= 100000) return K.zahl(7, { n: s.partien, werte: { anteil }, beleg: s.stichproben + " Stadt-Stichproben, " + s.mitPartie + " mit Partie in Sichtweite" });
                K.nicht(7, { n: s.partien, fehlt: "10⁵–10⁷ Partien an einem Nachmittag: die volle Stadt trägt um 15 Uhr " + s.partien + " (kein Spiel-Akt im Tages-Gesetz, koerper-core.js:5126); Partie in Sichtweite an " + s.mitPartie + " von " + s.stichproben + " Stadt-Stichproben (Anteil " + anteil + ")" });
            });
            // DIE ZUSCHAUER AM FELD DES ORT-GESETZES (der Platz des Plans, der Wirt `_spielTag`, der Kopf `_bewohnerKopf`): an der vollen
            // Stadt — am Genesis-Ort wohnt niemand, seine Arena bleibt Fläche
            const sp = await H.seite.SPIELWELT(H, K);
            H.zeile(H.seite.SPIELZEILE(sp));
            await K.schritt(1, async () => (sp.programm && sp.jetzt ? K.zahl(1, { n: sp.zuschauer, werte: { blick: sp.blick } }) : K.leser(1, { n: sp.zuschauer || 0, fehlt: "kein Geschehen auf dem Feld: die Arena bleibt Fläche, kein Spiel, kein Ball (" + H.seite.SPIELZEILE(sp) + ")", wo: "stamm/siedlung-bewohner.js _spielTag" }))); // prettier-ignore
            await K.messort("genesis");
            const z = await K.welt("return await (" + H.seite.SPORT + ")(r, T, {});", 30000);
            H.zeile("Arena: " + JSON.stringify(z.arena) + " · Zuschauer " + z.zuschauer + " (Blick zur Mitte " + z.blickt + ") · Sport-Akte " + z.sport);
            await K.schritt(2, async () => K.leser(2, { n: z.zuschauer, fehlt: "kein Jubel: das Gemüt der Bewohner liest Akt und Furcht, keinen Spielstand, keine Stimme", wo: "stamm/siedlung-bewohner.js:2283" }));
            await K.schritt(3, async () => K.nicht(3, { n: z.zuschauer, fehlt: "kein Stadion mit 10⁴ Zuschauern: an der Arena " + z.zuschauer + " Bewohner" }));
            await K.schritt(4, async () => K.leser(4, { n: 0, fehlt: "keine Liga, keine Vereine, keine Tabelle", wo: "koerper-core.js:5135" }));
            await K.schritt(5, async () => K.nicht(5, { n: z.zuschauer, fehlt: "10⁵ Zuschauer mit Welle und Fanmarsch: an der Arena " + z.zuschauer }));
            await K.schritt(6, async () => K.leser(6, { n: 0, fehlt: "keine Ligen über Epochen: keine Sieger, keine Arten, die 100 Jahre zurück anders wären", wo: "fachwerk-core.js:11423" }));
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
        seite: { SPORT, UEBUNG },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const z = await K.welt("return await (" + H.seite.SPORT + ")(r, T, {});", 30000);
            H.zeile("Kunst: " + z.n + " Bewohner · mit Können-Profil " + z.koennen + " · Akte " + JSON.stringify(z.akte));
            // S1: Meister und Anfänger stehen im Lebenslauf (`b.uebung`, je Kunst), aber kein Leib liest ihr Können — Haltung, Gang und
            // Geste sind f(Akt, Rolle, Gemüt); der Blindtest hätte nichts zu trennen
            await K.schritt(1, async () => {
                const u = await K.welt("return await (" + H.seite.UEBUNG + ")(r, T, {});", 20000);
                if (!u || u.fehler) throw new Error("die Übung der Stadt: " + ((u && u.fehler) || "ohne Antwort"));
                const paare = Object.keys(u.meister).filter((a) => u.meister[a] > 0 && u.anfaenger[a] > 0).length;
                H.zeile("S1 Meister " + JSON.stringify(u.meister) + " · Anfänger " + JSON.stringify(u.anfaenger) + " · Künste mit Paar " + paare + " von 3");
                K.leser(1, {
                    n: paare,
                    fehlt: "der Anfänger ist nicht sichtbar ungeschickt: Meister " + JSON.stringify(u.meister) + " und Anfänger " + JSON.stringify(u.anfaenger) + " in " + paare + " von 3 Künsten stehen im Lebenslauf (b.uebung), kein Leib liest ihr Können — Haltung (koerper-core tagesHaltung: Akt, Rolle), Gang und Geste gleich",
                    wo: "koerper-core.js tagesHaltung · stamm/siedlung-bewohner.js _bewohnerGemuet",
                });
            });
            await K.schritt(2, async () => K.leser(2, { n: z.koennen, fehlt: "die Güte des Werks liest Rezept und Prägung (gueteFaktor), nie die Hand, die es schmiedet", wo: "schmiede-core.js:4064" }));
            await K.schritt(3, async () => K.leser(3, { n: z.sport, fehlt: "kein Tanz-Akt, keine Musik, der ein Schritt folgt", wo: "koerper-core.js:5126" }));
            await K.schritt(4, async () => K.nicht(4, { n: 0, fehlt: "10² Stile je Kultur: 0 Kampf- und Tanzstile" }));
            await K.schritt(5, async () => K.leser(5, { n: 0, fehlt: "keine Lehrer-Kette: kein Meister, kein Schüler, kein Stil, der wandert", wo: "koerper-core.js:5135" }));
            await K.schritt(6, async () => K.nicht(6, { n: 0, fehlt: "neue Künste fremder Kulturen und Körper: 0" }));
        },
        sprossen: {
            1: { auge: { pose: "stadt-voll: ein Meister und ein Anfänger derselben Kunst, 3 m vor ihnen, Augenhöhe", vorbild: "Videos von Meister und Anfänger in 3 Künsten (Blindtest ≥ 80 %)" }, erwartet: "nicht", fehlt: "kein sichtbar ungeschickter Anfänger: das Können im Lebenslauf liest kein Leib" },
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
        seite: { SPORT, STADT, SPIEL, SPIELWELT, SPIELZEILE },
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            const z = await K.welt("return await (" + H.seite.SPORT + ")(r, T, {});", 30000);
            H.zeile("Geist-Spiele: " + z.n + " Bewohner · im Akt treff " + z.treff + " · Sport-Akte " + z.sport);
            const tisch = "kein Brettspiel: Gasthaus und Platz bieten mahl und treff, keinen Tisch mit Brett (" + z.treff + " Bewohner im Akt treff)";
            // DAS BRETT AM RAND DES FELDS (koerper `spielBrett`, die Tische des Programms, der Wirt `_spielTag`)
            const sp = await H.seite.SPIELWELT(H, K);
            H.zeile(H.seite.SPIELZEILE(sp));
            await K.schritt(1, async () => (sp.partien ? K.zahl(1, { n: sp.partien, werte: { regelwidrig: sp.regelwidrig } }) : K.leser(1, { n: z.treff, fehlt: tisch + " (" + H.seite.SPIELZEILE(sp) + ")", wo: "stamm/siedlung-bewohner.js _spielTag" }))); // prettier-ignore
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
