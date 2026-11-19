// Der Läufer des LAUFS 4: zeit-kern-4.cjs (Satz 7, der Raum) gegen das Soll S1–S15 (gesetz-zeit-jagd.md) — wie spike-zeit-3.
//   node spike-zeit-4.cjs          der volle Lauf (48 × 48, 8 Saaten, 4 200 Takte, ohne und mit Wolf, dann der Block S13)
//   node spike-zeit-4.cjs mini     nur Mechanik des Läufers: 630 Takte, 2 Saaten, Eingriff im Jahr 4, eigene Dateien — KEIN Ergebnis
// Block 1: S1–S12 wie in Lauf 2, dazu S14 (Wolf-Wachstum gegen D) und S15 (Beute je Wolf).
// Block 2: S13, die Rückstell-Probe — im Jahr 40 fällt jeder Beute-Kopf mit 0,5 (EINGRIFF, in der Erhaltungs-Buchung benannt);
//          der Zweig läuft ab dem Zustand des Haupt-Laufs (derselbe Kern, dieselbe Saat) bis Takt 4 200.
// NEU in Lauf 4: die Spur des RAUMS (Rudel, Köpfe je Rudel, verteidigte Reviere, offenes Land, wartende Wanderer, Todes-Ursachen)
//          und die Raum-Buchung je Takt (Besitz-Karte ↔ Listen ↔ frei), getrennt von S10.
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { performance } = require("perf_hooks");
const KERN = require("./zeit-kern-4.cjs");
const { anfang, schritt, klon, ZEIT, M_ART, WOLF, ANTWORT, ANKER, RAUM, ABWANDERN, bedarfVon } = KERN;

const MINI = process.argv[2] === "mini";
const SEITE = 48;
const TAKTE = MINI ? 630 : 4200;
const AB = TAKTE / 2;
const SAATEN = MINI ? [1, 2] : [1, 2, 3, 4, 5, 6, 7, 8];
const TJ = ZEIT.taktJeJahr;
const EINGRIFF = { jahr: MINI ? 4 : 40, anteil: 0.5, fensterJahre: 4, nachJahre: 15, fallSoll: 0.25, beuteSoll: 0.85 };
const E = Math.round(EINGRIFF.jahr * TJ); // der Eingriff steht VOR dem Schritt dieses Takts (Jahr 40 = Takt 1 050)
const JAHR = (j) => Math.round(E + j * TJ); // Jahr j nach dem Eingriff = Takte [JAHR(j − 1), JAHR(j))
const AUS = path.join(__dirname, MINI ? "mini-zeit-4.json" : "ergebnis-zeit-4.json");
const LOG = path.join(__dirname, MINI ? "mini-zeit-4.txt" : "lauf-zeit-4.txt");
const FEN = ["reh", "reh2", "wolf", "wolf2", "rudel", "geb", "riss", "hunger", "alter", "rissKg", "gedecktKg", "sattKg", "erhKg", "sollKg", "vSumme", "jagdTakte", "erschoepft", "gebWolf", "todWolf", "wurfTag", "wurfWolf", "ohneWurf", "rissUnreif", "todWelpe", "todDeckung", "todAlterW", "todWander", "kern", "sucher", "wartend", "gruendung", "beitritt", "mangelKopf"];
const I = Object.fromEntries(FEN.map((f, i) => [f, i]));
fs.writeFileSync(LOG, "");
const schreib = (...a) => fs.appendFileSync(LOG, a.join(" ") + "\n"); // nur in die Datei
const sag = (...a) => {
    console.log(a.join(" ")); // Zusammenfassung: Konsole UND Datei
    schreib(...a);
};
const uhr = () => new Date().toLocaleString("de-DE");

const hash = (z) =>
    crypto
        .createHash("sha1")
        .update(JSON.stringify(z, (k, v) => (ArrayBuffer.isView(v) ? Array.from(v) : v)))
        .digest("hex")
        .slice(0, 12);
const sum = (v) => v.reduce((a, b) => a + b, 0);
const mittel = (v) => (v.length ? sum(v) / v.length : NaN);
const median = (v) => {
    const s = v.filter(Number.isFinite).sort((a, b) => a - b);
    return s.length ? (s[(s.length - 1) >> 1] + s[s.length >> 1]) / 2 : NaN;
};
const rund = (x, d = 3) => (Number.isFinite(x) ? +x.toFixed(d) : x);
const quantil = (v, q) => {
    if (!v.length) return NaN;
    const s = Array.from(v).sort((a, b) => a - b);
    return s[Math.min(s.length - 1, Math.floor(q * s.length))];
};
const jm = (reihe, a, b) => {
    let s = 0;
    for (let k = a; k < b; k++) s += reihe[k];
    return s / (b - a);
};

// ── S14: die Klassen der Deckung D (Rudel-Takte nach dem gleitenden D des Rudels) ────────────────────────────────────────────
const KLASSEN = ["D ≤ 0,6", "0,6 < D < 0,9", "D 0,9–1,2", "1,2 < D < 1,5", "D ≥ 1,5"];
const klasseVon = (D) => (D <= 0.6 ? 0 : D < 0.9 ? 1 : D <= 1.2 ? 2 : D < 1.5 ? 3 : 4);
const FEIN = 26; // feine Klassen der Breite 0,1 (0 … ≥ 2,5) für die Gerade
const neuKlasse = () => ({ rudelTakte: 0, kopfTakte: 0, geb: 0, welpe: 0, deckung: 0, alter: 0, wanderung: 0, dSumme: 0 });
const neuKlassen = () => ({ grob: KLASSEN.map(neuKlasse), fein: Array.from({ length: FEIN }, neuKlasse), ohneD: 0 });
function addKlassen(a, b) {
    for (const art of ["grob", "fein"]) a[art].forEach((x, i) => Object.keys(x).forEach((f) => (x[f] += b[art][i][f])));
    a.ohneD += b.ohneD;
    return a;
}
const wachstum = (x) => (x.geb - x.welpe - x.deckung - x.alter - x.wanderung) / (x.kopfTakte / TJ);

// ── DER EINGRIFF (S13): jeder Beute-Kopf fällt mit `anteil`; eigener Strom (Art 7 — der Kern zieht 0 · 1 · 2 · 4 · 9) ────────
function eingriff(z, saat, anteil) {
    const rng = (() => {
        // derselbe Strom-Bau wie im Kern (mulberry über gemischte Saat), hier eigenständig: der Eingriff gehört dem Läufer
        let s = (Math.imul(saat | 0, 0x9e3779b1) ^ Math.imul(z.takt + 1, 0x85ebca77) ^ 0x7e1f) | 0;
        return () => {
            s = (s + 0x6d2b79f5) | 0;
            let t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    })();
    let [vor, gefallen, kg] = [0, 0, 0];
    for (let i = 0; i < z.reh.length; i++) {
        const l = z.reh[i];
        vor += l.length;
        for (let k = l.length - 1; k >= 0; k--)
            if (rng() < anteil) {
                kg += l[k].kg;
                l[k].tot = "eingriff";
                l.splice(k, 1);
                gefallen++;
            }
    }
    return { vor, gefallen, kg };
}

// EIN LAUF. zweig = { z, ab, eingriff } setzt am Zustand z (vor Takt ab) fort; halt = Takt, vor dem der Zustand geklont wird.
function lauf(opt, takte, zweig, halt) {
    let z = zweig ? zweig.z : anfang(Object.assign({ W: SEITE, H: SEITE }, opt));
    const von = zweig ? zweig.ab : 0;
    const n = z.W * z.H;
    const nutz = z.param.nutz;
    const habitat = [];
    for (let i = 0; i < n; i++) if (z.feldC[i]) habitat.push(i);
    const zaehl = (z) => {
        let [d, w] = [0, 0];
        for (const l of z.reh) d += l.length;
        for (const R of z.rudel) w += R.tiere.length;
        return [d, w];
    };
    const bs0 = [];
    for (const l of z.reh) for (const t of l) bs0.push(Math.cbrt(t.M / M_ART.deer));
    const m = {
        saat: opt.saat,
        anfang: { reh: zaehl(z)[0], wolf: zaehl(z)[1], rudel: z.rudel.length, N: z.rudel.map((R) => R.reviere.length) },
        takte: 0,
        rehS: 0, rehS2: 0, wolfS: 0, rudelS: 0, rudelRev: 0, besetztHab: 0, leerIm: 0, leerAlle: 0,
        kuhTakte: 0, kuhTod: 0, unreifS: 0,
        geb: { deer: 0, wolf: 0 }, reifReh: 0, jaehrling: 0, reifWolf: 0,
        tod: { deer: { alter: 0, hunger: 0, jagd: 0 }, wolf: { alter: 0, welpe: 0, deckung: 0, wanderung: 0 } },
        zug: { reh: 0, beitritt: 0, gruendung: 0 },
        riss: 0, rissUnreif: 0, rissGreis: 0, rissKg: 0, gedecktKg: 0, sattKg: 0, erhKg: 0, sollKg: 0, vSumme: 0,
        jagdTakte: 0, erschoepft: 0, wurfTag: 0, wurfWolf: 0, ohnePaar: 0, ohneWurf: 0, vaterlos: 0,
        einwanderung: 0, bruchKopf: 0, bruchKg: 0, eingriff: null,
        rissKgGanz: 0, sollKgGanz: 0,
        msSumme: 0, ms: new Float32Array(takte),
        wolfT: new Int32Array(takte), rehT: new Int32Array(takte), // der Stand NACH Takt k
        wolfSpur: [], rehSpur: [], wolfMin: Infinity, fen: [],
        leerDauer: [], leerOffen: 0,
        bs: [],
        klassen: neuKlassen(),
        // DER RAUM (zweite Hälfte): Stichprobe je Rudel je Takt (Köpfe, verteidigte Reviere, Rudel-Revier) und Summen je Takt
        raum: { koepfe: [], kern: [], revier: [], kernS: 0, freiS: 0, sucher: 0, wartend: 0, gruendung: 0, beitritt: 0, mangelRudel: 0, mangelKopf: 0, einzel: 0, ohnePaarRudel: 0 },
        bruchRaum: 0,
    };
    const gesehen = new Int32Array(n);
    const leerSeit = new Int32Array(n).fill(-1);
    let [dVor, wVor] = zaehl(z);
    if (zweig && zweig.eingriff) {
        // DER EINGRIFF in der Erhaltungs-Buchung: Köpfe danach = Köpfe davor − Gefallene des Eingriffs (kein Tod des Kerns)
        const e = eingriff(z, opt.saat, zweig.eingriff);
        const [d] = zaehl(z);
        if (d !== dVor - e.gefallen) m.bruchKopf++;
        m.eingriff = { takt: von, vor: e.vor, gefallen: e.gefallen, nach: d, anteil: e.gefallen / e.vor, kg: e.kg };
        dVor = d;
    }
    // S14: wem gehört ein Wolf (Rudel-Nummer am Takt-Anfang), wie viele Köpfe trug das Rudel, welches D trug es zuletzt
    let besitzer = new Map();
    let kopfVor = new Map();
    const deckVon = new Map();
    for (const R of z.rudel) {
        kopfVor.set(R.id, R.tiere.length);
        deckVon.set(R.id, R.deck);
        for (const t of R.tiere) besitzer.set(t, R.id);
    }
    const lege = (D) => (D == null ? null : [m.klassen.grob[klasseVon(D)], m.klassen.fein[Math.min(FEIN - 1, Math.floor(D * 10))]]);
    for (let k = von; k < takte; k++) {
        if (halt != null && k === halt) m.zustandAmHalt = klon(z);
        const t0 = performance.now();
        z = schritt(z, opt.saat, k);
        const dt = performance.now() - t0;
        m.ms[k] = dt;
        m.msSumme += dt;
        const ev = z.ereignis;
        const [d, w] = zaehl(z);
        m.wolfT[k] = w;
        m.rehT[k] = d;
        // DIE ERHALTUNG: Köpfe je Art = Köpfe davor + Geburten − Tode; jeder Geborene trägt eine Mutter; kg Riss = kg der Gerissenen
        let [gD, gW, tD, tW, kgJ] = [0, 0, 0, 0, 0];
        for (const t of ev.geburt) {
            if (t.g === "deer") gD++;
            else gW++;
            if (t.m == null) m.einwanderung++;
        }
        for (const x of ev.tod) {
            if (x.t.g === "deer") tD++;
            else tW++;
            if (x.ursache === "jagd") kgJ += x.t.kg;
        }
        m.einwanderung += ev.einwanderung;
        if (d !== dVor + gD - tD || w !== wVor + gW - tW) m.bruchKopf++;
        if (Math.abs(kgJ - ev.rissKg) > 1e-6 * (1 + kgJ) || Math.abs(ev.gedecktKg - nutz * ev.rissKg) > 1e-6 * (1 + kgJ)) m.bruchKg++;
        [dVor, wVor] = [d, w];
        m.rissKgGanz += ev.rissKg;
        m.sollKgGanz += ev.sollKg;
        // DIE RAUM-BUCHUNG (jeder Takt, außerhalb der Zeit-Messung): jede Liste deckt sich mit der Besitz-Karte, kein Revier
        // doppelt, z.frei stimmt, 1 ≤ Kern ≤ Rudel-Revier ≤ Deckel, kein Rudel ohne Köpfe, kein Wolf mit dem Tod „wanderung“
        let [kernS, mangelK, gr, be] = [0, 0, 0, 0];
        {
            let [belegt, schlecht, frei] = [0, 0, 0];
            const marke = k + 1;
            for (const R of z.rudel) {
                if (!R.tiere.length || !R.reviere.length || R.reviere.length > RAUM.deckel || R.kern > R.reviere.length || R.kern < 1) schlecht++;
                for (const x of R.reviere) {
                    if (z.besitz[x] !== R.id || gesehen[x] === marke) schlecht++;
                    gesehen[x] = marke;
                    belegt++;
                }
                kernS += R.kern;
                if (!R.traegt) mangelK += R.tiere.length;
            }
            for (let x = 0; x < n; x++) if (z.besitz[x] < 0) frei++;
            for (const x of ev.tod) if (x.ursache === "wanderung") schlecht++;
            for (const x of ev.zug) {
                if (x.art === "gruendung") gr++;
                else if (x.art === "beitritt") be++;
                if (x.art !== "reh" && !(x.t.alterS >= x.t.ab)) schlecht++; // wer zieht, hat sein Abwander-Alter erreicht
            }
            if (schlecht || frei !== z.frei || belegt + frei !== n) m.bruchRaum++;
        }
        // S14 — Rudel-Takte, Geburten und Tode in die Klasse des D ihres Rudels
        {
            const dNow = new Map();
            const besitzerNeu = new Map();
            const kopfNeu = new Map();
            for (const R of z.rudel) {
                dNow.set(R.id, R.deck);
                kopfNeu.set(R.id, R.tiere.length);
                for (const t of R.tiere) besitzerNeu.set(t, R.id);
            }
            const dVon = (id) => (dNow.has(id) && dNow.get(id) != null ? dNow.get(id) : deckVon.get(id));
            for (const [id, kopf] of kopfVor) {
                const D = dVon(id);
                const kl = lege(D);
                if (!kl) {
                    m.klassen.ohneD += kopf;
                    continue;
                }
                for (const x of kl) x.rudelTakte++, (x.kopfTakte += kopf), (x.dSumme += D * kopf);
            }
            for (const t of ev.geburt) {
                if (t.g !== "wolf") continue;
                const kl = lege(dVon(besitzerNeu.get(t)));
                if (kl) for (const x of kl) x.geb++;
            }
            for (const x of ev.tod) {
                if (x.t.g !== "wolf") continue;
                const kl = lege(dVon(besitzer.get(x.t)));
                if (kl) for (const y of kl) y[x.ursache]++;
            }
            for (const [id, D] of dNow) if (D != null) deckVon.set(id, D);
            besitzer = besitzerNeu;
            kopfVor = kopfNeu;
        }
        {
            const j = Math.floor(k / 105);
            const f = m.fen[j] || (m.fen[j] = new Array(FEN.length).fill(0));
            let [ri, hu, al, ru, tw, td, ta, tx] = [0, 0, 0, 0, 0, 0, 0, 0];
            for (const x of ev.tod) {
                if (x.t.g !== "deer") {
                    if (x.ursache === "welpe") tw++;
                    else if (x.ursache === "deckung") td++;
                    else if (x.ursache === "alter") ta++;
                    else tx++;
                    continue;
                }
                if (x.ursache === "jagd") ri++, !x.t.r && ru++;
                else if (x.ursache === "hunger") hu++;
                else al++;
            }
            const v = [d, d * d, w, w * w, z.rudel.length, gD, ri, hu, al, ev.rissKg, ev.gedecktKg, ev.sattKg, ev.erhKg, ev.sollKg, ev.vSumme, ev.jagdTakte, ev.erschoepft, gW, tW, ev.wurfTag, ev.wurfWolf, ev.ohneWurf, ru, tw, td, ta, tx, kernS, ev.sucher, ev.wartend, gr, be, mangelK];
            for (let q = 0; q < v.length; q++) f[q] += v[q];
        }
        if (w < m.wolfMin) m.wolfMin = w;
        if (!(k % 105)) m.wolfSpur.push(w), m.rehSpur.push(d);
        // die Dauer leerer Reviere (Lebensraum-Reviere ohne Beute)
        for (const i of habitat) {
            const leer = !z.reh[i].length;
            if (leer && leerSeit[i] < 0) leerSeit[i] = k;
            else if (!leer && leerSeit[i] >= 0) {
                if (k >= AB) m.leerDauer.push(k - leerSeit[i]);
                leerSeit[i] = -1;
            }
        }
        if (k < AB) continue;
        m.takte++;
        m.rehS += d;
        m.rehS2 += d * d;
        m.wolfS += w;
        m.rudelS += z.rudel.length;
        for (const R of z.rudel) m.rudelRev += R.reviere.length;
        {
            const r = m.raum;
            for (const R of z.rudel) {
                r.koepfe.push(R.tiere.length);
                r.kern.push(R.kern);
                r.revier.push(R.reviere.length);
                if (!R.traegt) r.mangelRudel++;
                if (R.tiere.length === 1) r.einzel++;
                let reife = 0;
                for (const t of R.tiere) if (t.r) reife++;
                if (reife < RAUM.paar) r.ohnePaarRudel++;
            }
            r.kernS += kernS;
            r.freiS += z.frei;
            r.mangelKopf += mangelK;
            r.sucher += ev.sucher;
            r.wartend += ev.wartend;
            r.gruendung += gr;
            r.beitritt += be;
        }
        const probe = !((k - AB) % 105);
        for (const i of habitat) {
            const l = z.reh[i];
            if (z.besitz[i] >= 0) m.besetztHab++, !l.length && m.leerIm++;
            if (!l.length) m.leerAlle++;
            for (const t of l) {
                if (!t.r) m.unreifS++;
                else if (probe) m.bs.push(Math.cbrt(t.M / M_ART.deer));
                if (t.jl && t.w) m.kuhTakte++;
            }
        }
        m.geb.deer += gD;
        m.geb.wolf += gW;
        for (const x of ev.tod) {
            m.tod[x.t.g][x.ursache]++;
            if (x.t.g === "deer" && x.t.jl && x.t.w) m.kuhTod++;
            if (x.ursache === "jagd") m.riss++, !x.t.r ? m.rissUnreif++ : x.t.alterS >= KERN.JAGD.greisAb * x.t.tod && m.rissGreis++;
        }
        for (const x of ev.zug) m.zug[x.art]++;
        for (const f of ["reifReh", "jaehrling", "reifWolf", "rissKg", "gedecktKg", "sattKg", "erhKg", "sollKg", "vSumme", "jagdTakte", "erschoepft", "wurfTag", "wurfWolf", "ohnePaar", "ohneWurf", "vaterlos"]) m[f] += ev[f];
    }
    for (const i of habitat) if (leerSeit[i] >= 0) m.leerOffen++, m.leerDauer.push(takte - leerSeit[i]);
    m.ende = { reh: dVor, wolf: wVor, rudel: z.rudel.map((R) => ({ koepfe: R.tiere.length, N: R.reviere.length, kern: R.kern, traegt: R.traegt, D: rund(R.deck, 3), V: rund(R.v, 1), konto: rund(R.rest, 1) })), habitat: habitat.length };
    {
        const r = m.raum;
        const band = (v) => ({ mittel: mittel(v), p10: quantil(v, 0.1), p50: quantil(v, 0.5), p90: quantil(v, 0.9) });
        m.raumStat = {
            rudelTakte: r.koepfe.length,
            koepfe: band(r.koepfe), kern: band(r.kern), revier: band(r.revier),
            offenAnteil: m.takte ? 1 - r.kernS / (m.takte * n) : NaN, // Anteil der Reviere, die KEIN Rudel verteidigt (frei + über Bedarf)
            freiAnteil: m.takte ? r.freiS / (m.takte * n) : NaN, // davon: in keinem Rudel-Revier
            wartendAnteil: r.wartend / m.wolfS, // Köpfe, die im Geburts-Rudel warten ÷ alle Wölfe (Kopf-Takte)
            sucherAnteil: r.sucher / m.wolfS,
            mangelRudelAnteil: r.mangelRudel / r.koepfe.length, // Rudel-Takte, deren Rudel-Revier den Bedarf nicht trägt
            mangelKopfAnteil: r.mangelKopf / m.wolfS,
            einzelRudelAnteil: r.einzel / r.koepfe.length, // Rudel-Takte mit EINEM Kopf
            ohnePaarRudelAnteil: r.ohnePaarRudel / r.koepfe.length, // Rudel-Takte mit weniger als zwei Reifen
            gruendungJeJahr: r.gruendung / (m.takte / TJ), beitrittJeJahr: r.beitritt / (m.takte / TJ),
        };
        delete m.raum;
    }
    m.ende.rudelAb2 = m.ende.rudel.filter((R) => R.koepfe >= 2).length;
    m.bs0p99 = quantil(bs0, 0.99);
    m.bsP99 = quantil(m.bs, 0.99);
    m.bsMax = m.bs.length ? m.bs.reduce((a, b) => (b > a ? b : a), 0) : NaN;
    m.leerMedian = quantil(m.leerDauer, 0.5);
    m.leerP95 = quantil(m.leerDauer, 0.95);
    m.leerEpisoden = m.leerDauer.length;
    m.msP95 = quantil(m.ms.subarray(von), 0.95);
    m.hash = hash(z);
    delete m.bs;
    delete m.leerDauer;
    delete m.ms;
    return m;
}

// die Proben je Saat (zweite Hälfte); o = derselbe Lauf OHNE Wolf
function proben(m, o, n) {
    const jahre = m.takte / TJ;
    const reh = m.rehS / m.takte;
    const wolf = m.wolfS / m.takte;
    const p = {
        S1: m.ende.rudelAb2 >= 1 ? 1 : 0,
        S2: (1000 * wolf) / reh,
        S3: m.riss / jahre / reh,
        S4: o ? reh / (o.rehS / o.takte) : NaN,
        S5: m.rissUnreif / m.riss,
        S6: m.reifWolf / (m.wolfS / (ZEIT.jahreRef * TJ)), // Reif-Ereignisse je Wolfs-Leben der Raffung (8 Jahre = 210 Wolf-Takte)
        S7: m.reifReh / m.geb.deer,
        S8: m.leerIm / m.besetztHab,
        S9: Math.sqrt(Math.max(0, m.rehS2 / m.takte - reh * reh)) / reh,
        S10: [m.bruchKopf + m.bruchKg, m.einwanderung],
        S11: m.msSumme / (m.takte * 2) / (n / 256),
        S12: m.bsP99 / m.bs0p99,
        S15: m.ende.rudelAb2 >= 1 ? reh / wolf : NaN, // Beute je Wolf am LEBENDEN Plateau
        // Befund
        reh, wolf,
        rudel: m.rudelS / m.takte,
        wolfJeRudel: m.wolfS / m.rudelS,
        reviereJeRudel: m.rudelRev / m.rudelS,
        beuteJeWolf: reh / wolf,
        vImRudelRevier: m.vSumme / m.jagdTakte, // das V des Kerns: Beute-Köpfe im Rudel-Revier je Wolf des Rudels (Mittel der Rudel-Takte)
        rissAmPlateau: m.rissKg / m.sattKg, // Riss ÷ Sattheit: der Anteil V ÷ (V + V½), den der Wolf wirklich reißt
        rissJeSoll: m.rissKgGanz / m.sollKgGanz, // Riss-Konto über den GANZEN Lauf: 1,00 = kein Runden-Gewinn
        deckungD: m.rissKg / m.erhKg, // D des Gesetzes: Riss-brutto ÷ Erhaltung
        verzehrErhaltung: m.gedecktKg / m.erhKg, // nur Buchung (nutz × Riss ÷ Erhaltung)
        risseJeWolfJahr: m.riss / (m.wolfS / TJ),
        kgRissJeWolfTag: m.rissKg / (m.wolfS * ZEIT.tageJeTakt),
        kgJeRiss: m.rissKg / m.riss,
        greisAmRiss: m.rissGreis / m.riss,
        bestesAlterAmRiss: (m.riss - m.rissUnreif - m.rissGreis) / m.riss,
        ueberlebenKitz: m.jaehrling / m.geb.deer,
        ueberlebenKuh: Math.exp(-m.kuhTod / (m.kuhTakte / TJ)),
        wuerfeJeRudelJahr: m.wurfWolf / (m.rudelS / TJ),
        welpenJeWurf: m.geb.wolf / m.wurfWolf,
        wolfTodJeWolfJahr: sum(Object.values(m.tod.wolf)) / (m.wolfS / TJ),
        wurfTage: { tage: m.wurfTag, wurf: m.wurfWolf, ohnePaar: m.ohnePaar, ohneWurf: m.ohneWurf },
        erschoepft: m.erschoepft,
        leerMedian: m.leerMedian, leerP95: m.leerP95, leerEpisoden: m.leerEpisoden, leerOffen: m.leerOffen,
        leerAlle: m.leerAlle / (m.takte * m.ende.habitat),
        unreifAnteil: m.unreifS / m.rehS,
        rehJeRevier: reh / n,
        bsP99: m.bsP99, bs0p99: m.bs0p99, bsMax: m.bsMax,
        msP95: m.msP95,
        tod: m.tod, zug: m.zug, geb: m.geb,
        raum: m.raumStat, bruchRaum: m.bruchRaum,
        // Todes-Ursachen ab einem Jahr (zweite Hälfte): Anteil je Ursache
        todAb1: (() => {
            const t = m.tod.wolf;
            const s = t.deckung + t.alter + t.wanderung;
            return { deckung: t.deckung / s, alter: t.alter / s, wanderung: t.wanderung / s, koepfe: s };
        })(),
        wolfMin: m.wolfMin, wolfEnde: m.ende.wolf, rudelEnde: m.ende.rudel.length,
        rehEnde: m.ende.reh, hash: m.hash, fen: m.fen.map((f) => f.map((x) => rund(x, 1))),
    };
    if (o) {
        p.ohne = { reh: o.rehS / o.takte, rehEnde: o.ende.reh, ueberlebenKitz: o.jaehrling / o.geb.deer, ueberlebenKuh: Math.exp(-o.kuhTod / (o.kuhTakte / TJ)), tod: o.tod.deer, geb: o.geb.deer, reifJeGeburt: o.reifReh / o.geb.deer, cv: Math.sqrt(Math.max(0, o.rehS2 / o.takte - (o.rehS / o.takte) ** 2)) / (o.rehS / o.takte), leerAlle: o.leerAlle / (o.takte * o.ende.habitat), rehJeRevier: o.rehS / o.takte / n, ms256: o.msSumme / (o.takte * 2) / (n / 256) };
    }
    return p;
}
const SOLL = [
    ["S1", "Wolf lebt am Ende", "8 von 8", null],
    ["S2", "Wölfe je 1 000 Beute-Köpfe", "2–8", (x) => x >= 2 && x <= 8],
    ["S3", "Anteil des Bestands, den der Wolf je Jahr reißt", "0,05–0,25", (x) => x >= 0.05 && x <= 0.25],
    ["S4", "Beute mit Wolf ÷ ohne Wolf", "0,5–0,9", (x) => x >= 0.5 && x <= 0.9],
    ["S5", "Anteil Unreifer am Riss", "0,35–0,63", (x) => x >= 0.35 && x <= 0.63],
    ["S6", "Junge, die reif werden, je Wolfs-Leben", "1,5–3", (x) => x >= 1.5 && x <= 3],
    ["S7", "Anteil der geborenen Beute, der reif wird", "0,25–0,6", (x) => x >= 0.25 && x <= 0.6],
    ["S8", "leere Reviere im Rudel-Revier", "≤ 0,10", (x) => x <= 0.1],
    ["S9", "Beute-Bestand CV", "≤ 0,30", (x) => x <= 0.3],
    ["S10", "Erhaltungs-Brüche · Zuwanderung", "0 · 0", null],
    ["S11", "ms je Takt je 256 Reviere", "≤ 0,25", (x) => x <= 0.25],
    ["S12", "Größen der Erbe-Linie p99 ÷ Start", "≤ 1,4", (x) => x <= 1.4],
    ["S15", "Beute je Wolf am lebenden Plateau (WÄ je Wolf)", "180–390", (x) => x >= 180 && x <= 390],
];
function tafel(P) {
    const zeilen = [];
    for (const [nr, name, soll, ok] of SOLL) {
        let wert, gruen, jeSaat;
        if (nr === "S1") {
            wert = sum(P.map((p) => p.S1));
            gruen = wert === P.length;
            jeSaat = P.map((p) => p.wolfEnde);
            wert = wert + " von " + P.length;
        } else if (nr === "S10") {
            const [b, e] = [sum(P.map((p) => p.S10[0])), sum(P.map((p) => p.S10[1]))];
            wert = b + " · " + e;
            gruen = b === 0 && e === 0;
            jeSaat = P.map((p) => p.S10.join("·"));
        } else {
            const v = P.map((p) => p[nr]);
            const mw = mittel(v.filter(Number.isFinite));
            wert = rund(mw, 4);
            gruen = ok(mw);
            jeSaat = v.map((x) => rund(x, 4));
        }
        zeilen.push({ nr, name, soll, wert, urteil: gruen ? "GRÜN" : "ROT", jeSaat });
    }
    return zeilen;
}
const BEFUND = ["reh", "wolf", "rudel", "wolfJeRudel", "reviereJeRudel", "beuteJeWolf", "vImRudelRevier", "rissAmPlateau", "rissJeSoll", "deckungD", "verzehrErhaltung", "risseJeWolfJahr", "kgRissJeWolfTag", "kgJeRiss", "greisAmRiss", "bestesAlterAmRiss", "ueberlebenKitz", "ueberlebenKuh", "wuerfeJeRudelJahr", "welpenJeWurf", "wolfTodJeWolfJahr", "erschoepft", "leerMedian", "leerP95", "leerAlle", "unreifAnteil", "rehJeRevier", "bsP99", "msP95"];
const befund = (P) => Object.fromEntries(BEFUND.map((f) => [f, { mittel: rund(mittel(P.map((p) => p[f]).filter(Number.isFinite)), 4), jeSaat: P.map((p) => rund(p[f], 4)) }]));

// die Fenster-Reihe einer Saat (je 4 Jahre): wo bricht die Kette — Riss gegen V, D gegen Wachstum, kleine Zahl
function druckFenster(name, fen, ab = 0) {
    schreib("FENSTER", name, "· Jahr | Beute | Wolf | Rudel | V je Wolf | Riss ÷ Plateau | D | Risse/a | Zuwachs/a (Geb − Hunger − Alter) | Riss ÷ Zuwachs | Wolf: Geb/a | Tod/a Welpe · Deckung · Alter · Wanderung | Würfe ÷ Wurf-Tage | RAUM: verteidigt (Anteil der Reviere) | wartend ÷ Wolf | Köpfe im Mangel ÷ Wolf | Gründungen · Beitritte");
    fen.forEach((f, j) => {
        const zuw = (f[I.geb] - f[I.hunger] - f[I.alter]) / 4;
        schreib("  " + [(j + ab) * 4 + "–" + ((j + ab) * 4 + 4), rund(f[I.reh] / 105, 0), rund(f[I.wolf] / 105, 1), rund(f[I.rudel] / 105, 1), rund(f[I.vSumme] / f[I.jagdTakte], 0), rund(f[I.rissKg] / f[I.sattKg], 3), rund(f[I.rissKg] / f[I.erhKg], 2), rund(f[I.riss] / 4, 0), rund(zuw, 0), rund(f[I.riss] / 4 / zuw, 2), rund(f[I.gebWolf] / 4, 1), [f[I.todWelpe], f[I.todDeckung], f[I.todAlterW], f[I.todWander]].map((x) => rund(x / 4, 1)).join(" · "), f[I.wurfWolf] + " ÷ " + f[I.wurfTag], rund(f[I.kern] / 105 / n, 3), rund(f[I.wartend] / f[I.wolf], 3), rund(f[I.mangelKopf] / f[I.wolf], 3), f[I.gruendung] + " · " + f[I.beitritt]].join(" | "));
    });
}

const n = SEITE * SEITE;
const t0 = Date.now();
const sek = () => ((Date.now() - t0) / 1000).toFixed(0) + " s";
const SETZUNGEN = [
    ["V in Köpfen", "V = ALLE Beute-Köpfe im Rudel-Revier (1 WÄ je Kopf, auch Kitze, auch Köpfe über der Beute-Masse-Grenze) ÷ ALLE Köpfe des Rudels (auch Welpen). Grund: V½ = 246 kommt aus Kopf-Zählungen (Elche je Wolf × 6, Winter-Zählung mit Welpen), nicht aus kg"],
    ["Riss-Konto", "Konto je Rudel in kg, Start 0; je Takt += Sattheit × V ÷ (V + 246); ein Kopf fällt, solange das Konto > 0, und zieht sein Gewicht ab (Vorschuss höchstens EIN Kopf, wird abgetragen); ohne greifbaren Kopf bleibt das Konto stehen; ein Rudel ohne jagenden Kopf baut kein Konto auf"],
    ["Zieh-Gewicht 16 : 1 bleibt", "LESART: die Quote 16 fällt als Zahl je Takt (Deckel Σ Verwundbarkeit ÷ 16); WELCHER Kopf fällt, zieht weiter das Gewicht unreif · Greis 16 gegen bestes Alter 1 wie in Lauf 2. Die andere Lesart (strenge Reihenfolge ohne Zahl) verschöbe höchstens den Anteil „bestesAlterAmRiss“ des Befunds"],
    ["D gleitend", "D = Σ Riss ÷ Σ Erhaltung über die letzten " + KERN.FENSTER + " Takte des Rudels (26,25 gerundet), je Takt neu; ein jüngeres Rudel über seine Takte seit der Gründung"],
    ["D ist Riss-BRUTTO ÷ Erhaltung", "wörtlich das Gesetz (Sattheit ÷ Erhaltung = 2,057); der Nutz-Anteil " + WOLF.nutz + " wirkt auf KEINE Rate mehr, er steht nur als Buchung (gedeckt = nutz × Riss)"],
    ["Welpe", "Alter < 1 Jahr = 262,5 s fest (wie das Jährlings-Jahr der Beute, nicht mit M^0,25 skaliert); Tod je Takt = 1 − Anteil^(1 ÷ 26,25), für Welpe und ab Jährling je Kopf gewürfelt"],
    ["Welpen je Wurf", "ganzer Teil + Bernoulli des Bruch-Teils (Erwartung = Tafel-Wert)"],
    ["Fähen mit Wurf", "Wahrscheinlichkeit je Wurf-Tag eines Rudels mit ≥ 2 Reifen (Paar-Regel wie kern-2)"],
    ["Alters-Tod bleibt", "der Kern trägt ihn: Tod bei Alter > lebensdauerS (8 Jahre am 64-kg-Wolf), ZUSÄTZLICH zum Überleben der Anker-Tafel"],
    ["S13 Messung", "Eingriff vor dem Schritt des Takts " + E + " mit eigenem Strom; Stände sind JAHRES-Mittel (Vor-Stand = das Jahr davor, Tief = kleinstes Jahres-Mittel der Jahre 1–" + EINGRIFF.fensterJahre + " danach, Beute nach 15 Jahren = Mittel des 15. Jahres); Urteil Fall und Beute am MITTEL der Saaten, „lebt“ an 8 von 8; Verzug = Ordnungszahl des Jahres mit dem Tief, Vorhersage am Median"],
    ["S14 Messung", "Wachstum = (Geburten − alle Tode: Welpe, Deckung, Alter, Wanderung) je Wolf-Jahr; jeder Rudel-Takt zählt in die Klasse des gleitenden D seines Rudels; Haupt-Lauf (ganz) und S13-Zweige zusammen; eine Klasse unter 10 Rudel-Jahren gilt als nicht gemessen"],
    ["S15 Messung", "Beute-Köpfe gesamt ÷ Wölfe gesamt (Mittel der zweiten Hälfte), Mittel der Saaten mit lebendem Wolf"],
    // ── NEU in Lauf 4 (Satz 7): was das Gesetz nicht nennt ──
    ["R1 · Kern = Anfang der Liste", "verteidigt ist der kürzeste ANFANG der Liste `reviere` (Reihenfolge: vom Gründungs-Ort her in der Breite, wie das Rudel-Revier gewachsen ist), dessen Beute-Köpfe den Bedarf tragen; der Rest der Liste ist offenes Land wie das freie. Trägt das ganze Rudel-Revier den Bedarf nicht, ist alles Kern („Mangel“)"],
    ["R2 · Bedarf mindestens ein Paar", "Bedarf = " + RAUM.vHalt + " WÄ × Köpfe (ALLE Köpfe wie in V, auch Welpen, auch wartende Wanderer), mindestens " + RAUM.paar + " × " + RAUM.vHalt + " (ein Gründer allein hält das Land, auf dem er gegründet hat); ein Rudel ohne Köpfe verteidigt nichts"],
    ["R3 · Jagd und V lesen weiter das GANZE Rudel-Revier", "Satz 3 unverändert: das Rudel begeht und bejagt auch sein offenes Land, bis ein anderer es nimmt; die Besitz-Karte bleibt (ein Revier, höchstens ein Rudel-Revier); `dehne` (kern-3) gibt FREIES Land weiter an Rudel unter dem Deckel " + RAUM.deckel + ", ältestes zuerst"],
    ["R4 · Ein Rudel im Mangel nimmt offenes Land", "trägt das Rudel-Revier den Bedarf nicht, nimmt das Rudel am Takt-Ende das offene Land an seiner Grenze (frei ODER Land eines Halters über dessen Bedarf, der Halter gibt ab), in der Breite, bis der Bedarf getragen ist oder der Deckel " + RAUM.deckel + " erreicht ist; Reihenfolge wie `dehne` (ältestes Rudel zuerst). Das Gesetz nennt die Abgabe nur für den Gründer; ohne diese Regel bliebe ein gegründetes Rudel für immer auf dem Land eines Paars"],
    ["R5 · Abgabe hält zusammen", "nach jeder Abgabe wird der Rest des Halters neu in der Breite ab seinem Gründungs-Ort gelesen; was nicht mehr über Kanten zusammenhängt, wird frei (und geht über `dehne` an ein Rudel unter dem Deckel). Der Gründungs-Ort liegt immer im Kern und wird nie abgegeben"],
    ["R6 · Abwander-Alter", "je Kopf EINMAL gezogen (eigener Strom 5 je Rudel und Wurf-Takt): " + 100 * ABWANDERN.anteil + " % gleichverteilt in " + ABWANDERN.fenster.join("–") + " Jahren; AUFTRAG: die übrigen 23 % symmetrisch, je 11,5 % gleichverteilt in " + ABWANDERN.frueh.join("–") + " und " + ABWANDERN.spaet.join("–") + " Jahren. Das Mittel der Ziehung ist 3,0 Jahre (gelesen 2,9). Jahre fest zu 262,5 s (wie „Welpe“), nicht mit M^0,25 skaliert. Auch die Köpfe des Anfangs-Bestands tragen eines und suchen ab Takt 0, wenn sie älter sind"],
    ["R7 · Das Paar = die zwei ältesten Köpfe", "VORGEFUNDEN: kern-3 führt KEINE Zucht-Tiere (Wurf, sobald ein Rudel ≥ 2 Reife trägt; Mutter und Vater aus allen Reifen gezogen, das Geschlecht der Wölfe liest niemand). „Das Zucht-Paar wandert nie“ heißt hier: die zwei ältesten Köpfe des Rudels suchen nie (bei gleichem Alter der frühere der Liste). Stirbt einer, rückt der älteste Nachkomme nach und bleibt"],
    ["R8 · Leere Stelle = Rudel ohne Paar", "an die Stelle von „unvollständig nach Verbands-Größe“ (< " + KERN.WURF.wolf[0] + " Köpfe) tritt die Paar-Regel des Wurfs: ein anderes Rudel mit Köpfen, aber weniger als " + RAUM.paar + " Reifen; das nächste (Tschebyschow-Abstand der Riss-Orte, wie kern-3). Kein Geschlecht (R7)"],
    ["R9 · Reihenfolge der Wege: leere Stelle, dann Gründung, dann Bleiben", "wie kern-3 (Beitritt vor Gründung): EIN Kopf gründet, der nächste Sucher füllt die leere Stelle und macht das Paar. VOR dem Voll-Lauf an der Mechanik-Probe (probe-raum-4.cjs, keine S-Zahl gelesen) von „Gründung zuerst“ umgestellt: dort war der Beitritt bei offenem Land unerreichbar (48 × 48, 400 Takte: 49 Gründungen, 0 Beitritte — lauter Einzelgänger statt des Paars, für das Satz 7c das Land bemisst; 24 × 24: der Wolf starb ohne einen Wurf aus). Die Fassung „Gründung zuerst“ ist NICHT als Voll-Lauf gerechnet"],
    ["R10 · Das Land einer Gründung", "die offenen Reviere bilden Stücke (über Kanten zusammenhängend); der Sucher nimmt das offene Revier, das dem Riss-Ort seines Rudels am nächsten liegt UND in einem Stück liegt, das " + RAUM.paar * RAUM.vHalt + " WÄ trägt, und von dort in der Breite über offenes Land genau so viele Reviere, bis ihre Beute " + RAUM.paar * RAUM.vHalt + " WÄ trägt (höchstens " + RAUM.deckel + " Reviere, sonst keine Gründung in diesem Takt). Der erste Wurf-Tag liegt ein Jahr nach der Gründung (kern-3)"],
    ["R11 · Takt des Raums", "die Karte des offenen Lands wird je Takt EINMAL vor der Suche gelesen (Köpfe und Beute nach Jagd, Tod und Geburt dieses Takts) und nach jeder Gründung für die Betroffenen nachgeführt; ein Beitritt ändert sie erst im nächsten Takt. Der Bedarf des Geburts-Rudels zählt den Sucher mit, solange er dort ist. Jeder Kopf sucht höchstens einmal je Takt; die Sucher in der Reihenfolge der Rudel-Liste"],
    ["R12 · Messung des Raums", "zweite Hälfte, je Takt je Rudel: Köpfe, verteidigte Reviere (Kern), Rudel-Revier; „offen“ = 1 − Σ Kern ÷ " + SEITE * SEITE + " Reviere; „wartend“ = Sucher ohne Erfolg je Takt ÷ Wolf-Kopf-Takte; Todes-Ursachen ab einem Jahr = Deckung · Alter (· Wanderung, das es nicht mehr gibt). Die Raum-Buchung (Liste ↔ Besitz-Karte ↔ frei, 1 ≤ Kern ≤ Revier ≤ Deckel, kein Zug vor dem Abwander-Alter, kein Tod „wanderung“) läuft je Takt und steht NEBEN S10"],
];
const aus = { lauf: 4, uhrStart: uhr(), raster: [SEITE, SEITE], takte: TAKTE, fenster: [AB, TAKTE], saaten: SAATEN, eingriff: Object.assign({ takt: E }, EINGRIFF), setzungen: SETZUNGEN, gesetz: { ZEIT, BEUTE: KERN.BEUTE, WOLF, ANTWORT, ANKER, FENSTER: KERN.FENSTER, JAGD: KERN.JAGD, RAUM: KERN.RAUM, ABWANDERN, M_ART, BEUTE_MASSE: KERN.BEUTE_MASSE, WURF: KERN.WURF } };
aus.kernSha256 = crypto.createHash("sha256").update(fs.readFileSync(path.join(__dirname, "zeit-kern-4.cjs"))).digest("hex");
sag("LAUF 4", MINI ? "(MINI — nur Mechanik, KEIN Ergebnis)" : "", "· Start", aus.uhrStart, "· ZEIT", JSON.stringify(ZEIT), "· V½", ANTWORT.vHalb, "· V_halt", RAUM.vHalt, "· Fenster D", KERN.FENSTER, "Takte · Kern sha256", aus.kernSha256.slice(0, 16));
schreib("ANKER", JSON.stringify(ANKER), "· WOLF", JSON.stringify(WOLF), "· RAUM", JSON.stringify(KERN.RAUM), "· ABWANDERN", JSON.stringify(ABWANDERN), "· beuteMasse", KERN.BEUTE_MASSE, "· Verband (nur Anfangs-Bestand)", JSON.stringify(KERN.WURF));

// DIE REINHEIT: derselbe (Zustand, Saat, Takt) gibt denselben Zustand; die Kopie lässt die Quelle stehen
{
    const mk = () => {
        let z = anfang({ W: 16, H: 16, saat: 1 });
        for (let k = 0; k < 120; k++) z = schritt(z, 1, k);
        return z;
    };
    const z = mk();
    const quelle = hash(z);
    const [a, b] = [hash(schritt(klon(z), 1, 120)), hash(schritt(klon(z), 1, 120))];
    aus.reinheit = { gleich: a === b, quelleSteht: hash(z) === quelle, wiederholbar: hash(mk()) === quelle, andereSaat: hash(schritt(klon(z), 2, 120)) !== a };
    sag("Reinheit", JSON.stringify(aus.reinheit));
}

// ── BLOCK 1: ohne Wolf · mit Wolf ────────────────────────────────────────────────────────────────────────────────────────────
const O = SAATEN.map((saat) => lauf({ saat, wolf: false }, TAKTE));
sag("ohne Wolf gelaufen", sek());
// der Beweis im Lauf: ohne Wolf zahlengleich zu Lauf 3 (Beute am Ende, Mittel der zweiten Hälfte je Saat, die Spur je 105 Takte)
if (!MINI) {
    const A3 = JSON.parse(fs.readFileSync(path.join(__dirname, "ergebnis-zeit-3.json"), "utf8"));
    const ENDE3 = [21160, 20938, 20934, 20897, 20796, 20946, 20902, 20924]; // Lauf 3, Beute am Ende je Saat (Auftrag)
    const m4 = O.map((o) => rund(o.rehS / o.takte, 4));
    const ende4 = O.map((o) => o.ende.reh);
    const gleichEnde = ende4.map((x, i) => x === ENDE3[i]);
    const gleichMittel = m4.map((x, i) => x === A3.ohneWolf.reh.jeSaat[i]);
    const gleichSpur = O.map((o, i) => o.rehSpur.join(" ") === A3.spur.rehOhneWolf[i]);
    const jeSaat = gleichEnde.map((x, i) => x && gleichMittel[i] && gleichSpur[i]);
    aus.ohneWolfGleichLauf3 = { gleich: jeSaat.every(Boolean), saatenGleich: jeSaat.filter(Boolean).length, endeLauf4: ende4, endeLauf3: ENDE3, mittelLauf4: m4, mittelLauf3: A3.ohneWolf.reh.jeSaat };
    sag("OHNE WOLF zahlengleich zu Lauf 3:", aus.ohneWolfGleichLauf3.gleich ? "JA" : "NEIN", "·", aus.ohneWolfGleichLauf3.saatenGleich, "von", SAATEN.length, "Saaten (Beute am Ende + Mittel der zweiten Hälfte auf 4 Stellen + 40 Spur-Punkte) · Beute am Ende je Saat", ende4.join(" "), "· Mittel Lauf 4", m4.join(" "));
}
const Gm = SAATEN.map((saat) => lauf({ saat }, TAKTE, null, E));
sag("mit Wolf gelaufen", sek());
const P = Gm.map((m, i) => proben(m, O[i], n));
aus.soll = tafel(P);
aus.befund = befund(P);
aus.ohneWolf = Object.fromEntries(["reh", "rehEnde", "ueberlebenKitz", "ueberlebenKuh", "reifJeGeburt", "cv", "leerAlle", "rehJeRevier", "ms256"].map((f) => [f, { mittel: rund(mittel(P.map((p) => p.ohne[f])), 4), jeSaat: P.map((p) => rund(p.ohne[f], 4)) }]));
aus.sterbe = {
    mitWolf: { geburt: sum(P.map((p) => p.geb.deer)), geburtWolf: sum(P.map((p) => p.geb.wolf)), todReh: ["alter", "hunger", "jagd"].map((u) => u + " " + sum(P.map((p) => p.tod.deer[u]))).join(" · "), todWolf: ["alter", "welpe", "deckung", "wanderung"].map((u) => u + " " + sum(P.map((p) => p.tod.wolf[u]))).join(" · "), zug: ["reh", "beitritt", "gruendung"].map((u) => u + " " + sum(P.map((p) => p.zug[u]))).join(" · "), wurfTage: P.map((p) => p.wurfTage) },
    ohneWolf: { geburt: sum(P.map((p) => p.ohne.geb)), todReh: ["alter", "hunger", "jagd"].map((u) => u + " " + sum(P.map((p) => p.ohne.tod[u]))).join(" · ") },
};
aus.spur = { wolf: Gm.map((m) => m.wolfSpur.join(" ")), reh: Gm.map((m) => m.rehSpur.join(" ")), rehOhneWolf: O.map((m) => m.rehSpur.join(" ")), wolfMin: Gm.map((m) => m.wolfMin), rudelAnfang: Gm.map((m) => m.anfang.N), rudelEnde: Gm.map((m) => m.ende.rudel), hashes: Gm.map((m) => m.hash) };
aus.proben = P;
fs.writeFileSync(AUS, JSON.stringify(aus));

// ── BLOCK 2: S13, die Rückstell-Probe ────────────────────────────────────────────────────────────────────────────────────────
const klassen = neuKlassen();
for (const m of Gm) addKlassen(klassen, m.klassen);
const NJ = Math.floor((TAKTE - E) / TJ); // volle Jahre nach dem Eingriff
const S13 = Gm.map((m, i) => {
    const saat = SAATEN[i];
    const wolfVor = jm(m.wolfT, JAHR(-1), E);
    const beuteVor = jm(m.rehT, JAHR(-1), E);
    const r = { saat, wolfVor, wolfVorTakt: m.wolfT[E - 1], beuteVor, beuteVorTakt: m.rehT[E - 1] };
    const z = m.zustandAmHalt;
    delete m.zustandAmHalt;
    if (!(m.wolfT[E - 1] > 0)) return Object.assign(r, { ohneWolfVorher: true, lebt: false, wolfEnde: 0, fall: NaN, verhaeltnis: NaN, jahrTief: NaN });
    const b = lauf({ saat }, TAKTE, { z, ab: E, eingriff: EINGRIFF.anteil });
    addKlassen(klassen, b.klassen);
    const jahrW = [];
    const jahrB = [];
    const jahrWK = [];
    const jahrBK = [];
    for (let j = 1; j <= NJ; j++) {
        jahrW.push(jm(b.wolfT, JAHR(j - 1), JAHR(j)));
        jahrB.push(jm(b.rehT, JAHR(j - 1), JAHR(j)));
        jahrWK.push(jm(m.wolfT, JAHR(j - 1), JAHR(j)));
        jahrBK.push(jm(m.rehT, JAHR(j - 1), JAHR(j)));
    }
    const tiefIn = (v, bis) => {
        let q = 0;
        for (let j = 1; j < Math.min(bis, v.length); j++) if (v[j] < v[q]) q = j;
        return [v[q], q + 1];
    };
    const [tief, jahrTief] = tiefIn(jahrW, EINGRIFF.fensterJahre);
    const [tief15, jahrTief15] = tiefIn(jahrW, EINGRIFF.nachJahre);
    const [tiefK] = tiefIn(jahrWK, EINGRIFF.fensterJahre);
    let [tiefTakt, taktTief] = [Infinity, -1];
    for (let k = E; k < Math.min(TAKTE, JAHR(EINGRIFF.fensterJahre)); k++) if (b.wolfT[k] < tiefTakt) [tiefTakt, taktTief] = [b.wolfT[k], k];
    const j15 = Math.min(EINGRIFF.nachJahre, NJ);
    const beute15 = jahrB[j15 - 1];
    const erholt = jahrB.findIndex((x) => x >= EINGRIFF.beuteSoll * beuteVor);
    return Object.assign(r, {
        eingriff: b.eingriff,
        tief, jahrTief, fall: 1 - tief / wolfVor,
        tief15, jahrTief15, fall15: 1 - tief15 / wolfVor,
        kontrolleFall: 1 - tiefK / wolfVor, // derselbe Lauf OHNE Eingriff: so tief fällt das kleinste Jahres-Mittel von selbst
        tiefTakt, jahreBisTiefTakt: (taktTief - E + 1) / TJ, fallTakt: 1 - tiefTakt / m.wolfT[E - 1],
        beute15, verhaeltnis: beute15 / beuteVor, beute15Takt: b.rehT[JAHR(j15) - 1], kontrolleVerhaeltnis: jahrBK[j15 - 1] / beuteVor,
        beuteErholtImJahr: erholt < 0 ? null : erholt + 1,
        wolfEnde: b.ende.wolf, beuteEnde: b.ende.reh, lebt: b.ende.rudelAb2 >= 1, rudelEnde: b.ende.rudel,
        brueche: b.bruchKopf + b.bruchKg, einwanderung: b.einwanderung, bruecheRaum: b.bruchRaum, raum: b.raumStat,
        jahrWolf: jahrW.slice(0, 24).map((x) => rund(x, 1)), jahrBeute: jahrB.slice(0, 24).map((x) => rund(x, 0)),
        jahrWolfKontrolle: jahrWK.slice(0, 24).map((x) => rund(x, 1)),
        fen: Array.from(b.fen, (f) => (f ? f.map((x) => rund(x, 1)) : null)),
    });
});
sag("S13-Zweige gelaufen", sek());
{
    const mit = S13.filter((r) => !r.ohneWolfVorher);
    const fall = mittel(mit.map((r) => r.fall));
    const verh = mittel(mit.map((r) => r.verhaeltnis));
    const lebt = S13.filter((r) => r.lebt).length;
    const [a, b, c] = [fall >= EINGRIFF.fallSoll, verh >= EINGRIFF.beuteSoll, lebt === S13.length];
    aus.s13 = { fallMittel: rund(fall, 4), fallSaaten: mit.filter((r) => r.fall >= EINGRIFF.fallSoll).length, verhaeltnisMittel: rund(verh, 4), verhaeltnisSaaten: mit.filter((r) => r.verhaeltnis >= EINGRIFF.beuteSoll).length, lebt, verzugMedian: median(mit.map((r) => r.jahrTief)), verzug15Median: median(mit.map((r) => r.jahrTief15)), kontrolleFallMittel: rund(mittel(mit.map((r) => r.kontrolleFall)), 4), brueche: sum(mit.map((r) => r.brueche)), einwanderung: sum(mit.map((r) => r.einwanderung)), bruecheRaum: sum(mit.map((r) => r.bruecheRaum)), teile: { fall: a, beute: b, lebt: c }, jeSaat: S13 };
    aus.soll.push({ nr: "S13", name: "Rückstell-Probe (Eingriff Jahr " + EINGRIFF.jahr + ": Beute × 0,5)", soll: "Wolf fällt binnen 4 a um ≥ 25 % · Beute nach 15 a ≥ 85 % · Wolf lebt 8 von 8", wert: "Fall " + rund(100 * fall, 1) + " % (" + aus.s13.fallSaaten + " von " + mit.length + " Saaten ≥ 25 %) · Beute " + rund(100 * verh, 1) + " % (" + aus.s13.verhaeltnisSaaten + " von " + mit.length + " ≥ 85 %) · lebt " + lebt + " von " + S13.length, urteil: a && b && c ? "GRÜN" : "ROT", teile: [a, b, c].map((x) => (x ? "GRÜN" : "ROT")).join(" · "), jeSaat: S13.map((r) => (r.ohneWolfVorher ? "kein Wolf" : rund(100 * r.fall, 0) + "%/" + rund(100 * r.verhaeltnis, 0) + "%/" + (r.lebt ? "lebt" : "tot"))) });
}
// ── S14: Wolf-Wachstum je Jahr gegen D ───────────────────────────────────────────────────────────────────────────────────────
{
    const zeile = (x, name) => ({ klasse: name, rudelJahre: rund(x.rudelTakte / TJ, 1), wolfJahre: rund(x.kopfTakte / TJ, 1), dMittel: rund(x.dSumme / x.kopfTakte, 3), geburten: x.geb, tode: { welpe: x.welpe, deckung: x.deckung, alter: x.alter, wanderung: x.wanderung }, wachstum: rund(wachstum(x), 4), wachstumOhneWanderung: rund((x.geb - x.welpe - x.deckung - x.alter) / (x.kopfTakte / TJ), 4) });
    const Z = klassen.grob.map((x, i) => zeile(x, KLASSEN[i]));
    const baender = [[2, "D 0,9–1,2", "−0,10…+0,10", (r) => r >= -0.1 && r <= 0.1], [4, "D ≥ 1,5", "+0,15…+0,45", (r) => r >= 0.15 && r <= 0.45], [0, "D ≤ 0,6", "≤ −0,15", (r) => r <= -0.15]];
    const urteile = baender.map(([i, name, soll, ok]) => ({ klasse: name, soll, rudelJahre: Z[i].rudelJahre, wachstum: Z[i].wachstum, urteil: Z[i].rudelJahre < 10 ? "nicht gemessen" : ok(Z[i].wachstum) ? "GRÜN" : "ROT" }));
    // die Gerade: Wachstum gegen D über die feinen Klassen (Breite 0,1), gewichtet mit den Wolf-Jahren; Feld: 0,418 · D − 0,44
    const pkt = klassen.fein.map((x) => ({ D: x.dSumme / x.kopfTakte, r: wachstum(x), w: x.kopfTakte / TJ, rj: x.rudelTakte / TJ })).filter((p) => p.w >= 5);
    const W = sum(pkt.map((p) => p.w));
    const [mx, my] = [sum(pkt.map((p) => p.w * p.D)) / W, sum(pkt.map((p) => p.w * p.r)) / W];
    const steig = sum(pkt.map((p) => p.w * (p.D - mx) * (p.r - my))) / sum(pkt.map((p) => p.w * (p.D - mx) ** 2));
    const gemessen = urteile.filter((u) => u.urteil !== "nicht gemessen");
    const gruen = gemessen.length > 0 && gemessen.every((u) => u.urteil === "GRÜN");
    aus.s14 = { klassen: Z, urteile, gerade: { steigung: rund(steig, 3), achse: rund(my - steig * mx, 3), nullBeiD: rund(mx - my / steig, 3), feld: "0,418 · D − 0,44 (Null bei D 1,05)" }, fein: pkt.map((p) => [rund(p.D, 2), rund(p.r, 3), rund(p.w, 0), rund(p.rj, 0)]), ohneD: klassen.ohneD };
    aus.soll.push({ nr: "S14", name: "Wolf-Wachstum je Jahr gegen D (Rudel-Jahre in Klassen)", soll: "D 0,9–1,2: −0,10…+0,10 · D ≥ 1,5: +0,15…+0,45 · D ≤ 0,6: ≤ −0,15", wert: urteile.map((u) => u.klasse + ": " + (u.urteil === "nicht gemessen" ? "nicht gemessen (" + u.rudelJahre + " Rudel-Jahre)" : u.wachstum + " " + u.urteil + " (" + u.rudelJahre + " Rudel-Jahre)")).join(" · "), urteil: (gruen ? "GRÜN" : "ROT") + (gemessen.length < urteile.length ? " (" + (urteile.length - gemessen.length) + " von 3 Klassen nicht gemessen)" : ""), jeSaat: [] });
}
aus.soll.sort((a, b) => +a.nr.slice(1) - +b.nr.slice(1));

// ── DIE VORHERSAGEN (vor der Rechnung gesetzt; Treffer oder Fehlschuss) ──────────────────────────────────────────────────────
{
    const S = Object.fromEntries(aus.soll.map((z) => [z.nr, z]));
    const lebend = sum(P.map((p) => p.S1));
    // die Vorhersagen des Gesetz-Blatts für Lauf 4 (Abschnitt „Satz 7 — der Raum“), wörtlich
    const reich = aus.s14.urteile.find((u) => u.klasse === "D ≥ 1,5");
    const fallP = 100 * aus.s13.fallMittel;
    aus.vorhersagen = [
        ["S1 8 von 8", lebend + " von " + P.length, lebend === P.length],
        ["S15 250–310 WÄ je Wolf", S.S15.wert, S.S15.wert >= 250 && S.S15.wert <= 310],
        ["S2 3,2–4,0 Wölfe je 1 000 Köpfe", S.S2.wert, S.S2.wert >= 3.2 && S.S2.wert <= 4.0],
        ["S3 0,085–0,11 je Jahr", S.S3.wert, S.S3.wert >= 0.085 && S.S3.wert <= 0.11],
        ["S4 0,80–0,88", S.S4.wert, S.S4.wert >= 0.8 && S.S4.wert <= 0.88],
        ["S13 GRÜN", S.S13.urteil + " (" + S.S13.teile + ")", S.S13.urteil === "GRÜN"],
        ["S13 Fall 30–50 %", rund(fallP, 1) + " %", fallP >= 30 && fallP <= 50],
        ["S13 Tief im Jahr 2–3", "Median Jahr " + aus.s13.verzugMedian + " (Tief binnen 4 a) · binnen 15 a Median Jahr " + aus.s13.verzug15Median, aus.s13.verzugMedian >= 2 && aus.s13.verzugMedian <= 3],
        ["S14 bleibt ROT am reichen Ende (≈ +0,5 gegen Soll ≤ +0,45)", reich.urteil === "nicht gemessen" ? "nicht gemessen (" + reich.rudelJahre + " Rudel-Jahre)" : reich.wachstum + " " + reich.urteil, reich.urteil === "ROT" && reich.wachstum > 0.45],
        ["S11 bleibt ROT", S.S11.wert + " ms " + S.S11.urteil, S.S11.urteil === "ROT"],
    ].map(([name, ist, ok]) => ({ name, ist, urteil: ok ? "TREFFER" : "FEHLSCHUSS" }));
    // das benannte Risiko (kein Treffer-Urteil): ≈ 75 Wölfe in 10–12 Rudeln schwingen nach dem Eingriff über, kleine Zahl
    aus.risiko = { erwartet: "≈ 75 Wölfe in 10–12 Rudeln", wolf: aus.befund.wolf.mittel, rudel: aus.befund.rudel.mittel, wolfMinHaupt: P.map((p) => p.wolfMin), s13TaktTief: S13.map((r) => (r.ohneWolfVorher ? null : r.tiefTakt)), s13Lebt: S13.map((r) => r.lebt) };
}
// ── DER RAUM (zweite Hälfte, Haupt-Lauf): Mittel der Saaten ─────────────────────────────────────────────────────────────────
{
    const R = P.map((p) => p.raum);
    const mw = (f) => rund(mittel(R.map(f).filter(Number.isFinite)), 4);
    const je = (f, d = 3) => R.map((r) => rund(f(r), d));
    const tod = P.map((p) => p.todAb1);
    const todS = (u) => sum(P.map((p) => p.tod.wolf[u]));
    const ab1 = todS("deckung") + todS("alter") + todS("wanderung");
    aus.raum = {
        rudel: { mittel: aus.befund.rudel.mittel, jeSaat: aus.befund.rudel.jeSaat },
        koepfeJeRudel: { mittel: mw((r) => r.koepfe.mittel), p10: mw((r) => r.koepfe.p10), p50: mw((r) => r.koepfe.p50), p90: mw((r) => r.koepfe.p90), jeSaat: je((r) => r.koepfe.mittel, 2) },
        verteidigteReviereJeRudel: { mittel: mw((r) => r.kern.mittel), p10: mw((r) => r.kern.p10), p50: mw((r) => r.kern.p50), p90: mw((r) => r.kern.p90), jeSaat: je((r) => r.kern.mittel, 1) },
        rudelRevierJeRudel: { mittel: mw((r) => r.revier.mittel), p10: mw((r) => r.revier.p10), p90: mw((r) => r.revier.p90), jeSaat: je((r) => r.revier.mittel, 1) },
        offenesLandAnteil: { mittel: mw((r) => r.offenAnteil), jeSaat: je((r) => r.offenAnteil) },
        freiesLandAnteil: { mittel: mw((r) => r.freiAnteil), jeSaat: je((r) => r.freiAnteil, 4) },
        wartendAnteil: { mittel: mw((r) => r.wartendAnteil), jeSaat: je((r) => r.wartendAnteil) },
        sucherAnteil: { mittel: mw((r) => r.sucherAnteil), jeSaat: je((r) => r.sucherAnteil) },
        mangelRudelAnteil: { mittel: mw((r) => r.mangelRudelAnteil), jeSaat: je((r) => r.mangelRudelAnteil) },
        mangelKopfAnteil: { mittel: mw((r) => r.mangelKopfAnteil), jeSaat: je((r) => r.mangelKopfAnteil) },
        einzelRudelAnteil: { mittel: mw((r) => r.einzelRudelAnteil), jeSaat: je((r) => r.einzelRudelAnteil) },
        ohnePaarRudelAnteil: { mittel: mw((r) => r.ohnePaarRudelAnteil), jeSaat: je((r) => r.ohnePaarRudelAnteil) },
        gruendungJeJahr: { mittel: mw((r) => r.gruendungJeJahr), jeSaat: je((r) => r.gruendungJeJahr, 2) },
        beitrittJeJahr: { mittel: mw((r) => r.beitrittJeJahr), jeSaat: je((r) => r.beitrittJeJahr, 2) },
        todAbEinemJahr: { koepfe: ab1, deckung: rund(todS("deckung") / ab1, 4), alter: rund(todS("alter") / ab1, 4), wanderung: rund(todS("wanderung") / ab1, 4), jeSaatDeckung: tod.map((t) => rund(t.deckung, 3)) },
        todWelpe: todS("welpe"),
        raumBrueche: { hauptLauf: sum(P.map((p) => p.bruchRaum)), s13: aus.s13.bruecheRaum },
    };
}
aus.kosten = { mitWolfMs256: aus.soll.find((z) => z.nr === "S11").wert, mitWolfJeSaat: P.map((p) => rund(p.S11, 4)), ohneWolfMs256: aus.ohneWolf.ms256.mittel, soll: 0.25 };
aus.uhrEnde = uhr();
aus.sekunden = (Date.now() - t0) / 1000;
fs.writeFileSync(AUS, JSON.stringify(aus));

// ── DIE AUSGABE: die Tafeln in die Datei, die Zusammenfassung auch in die Konsole ────────────────────────────────────────────
sag("── SOLL-TAFEL S1–S15 (S2–S12, S15: Mittel der Saaten, zweite Hälfte) · Soll · IST · Urteil");
for (const z of aus.soll) sag(z.nr, "·", z.name, "· Soll", z.soll, "· IST", z.wert, z.urteil, z.teile ? "(" + z.teile + ")" : "", z.jeSaat.length ? "· je Saat " + z.jeSaat.join(" ") : "");
sag("── WOLF-ENDE je Saat (Köpfe am Takt " + TAKTE + ")", P.map((p) => p.wolfEnde).join(" "), "· Rudel", P.map((p) => p.rudelEnde).join(" "), "· Beute-Ende", P.map((p) => p.rehEnde).join(" "), "· Wolf-Minimum", P.map((p) => p.wolfMin).join(" "));
sag("── S13 je Saat: Wolf vor → Tief (Jahr) = Fall | Kontrolle ohne Eingriff | Beute vor → nach 15 a = Verhältnis | Wolf am Ende");
for (const r of S13) sag("  Saat", r.saat, r.ohneWolfVorher ? "· KEIN WOLF vor dem Eingriff" : ["· Wolf", rund(r.wolfVor, 1), "→", rund(r.tief, 1), "(Jahr " + r.jahrTief + ") =", rund(100 * r.fall, 1) + " %", "| Kontrolle", rund(100 * r.kontrolleFall, 1) + " %", "| binnen 15 a Tief", rund(r.tief15, 1), "(Jahr " + r.jahrTief15 + ")", "| Beute", rund(r.beuteVor, 0), "→ Eingriff", r.eingriff.nach, "→", rund(r.beute15, 0), "=", rund(100 * r.verhaeltnis, 1) + " %", "(Kontrolle " + rund(100 * r.kontrolleVerhaeltnis, 1) + " %, ≥ 85 % im Jahr " + r.beuteErholtImJahr + ")", "| Wolf Ende", r.wolfEnde, r.lebt ? "lebt" : "TOT", "| Brüche", r.brueche].join(" "));
sag("── S14 Klassen (Haupt-Lauf + S13-Zweige): Klasse | Rudel-Jahre | Wolf-Jahre | D-Mittel | Geburten | Tode Welpe·Deckung·Alter·Wanderung | Wachstum je Jahr | ohne Wanderung");
for (const z of aus.s14.klassen) sag("  " + [z.klasse, z.rudelJahre, z.wolfJahre, z.dMittel, z.geburten, [z.tode.welpe, z.tode.deckung, z.tode.alter, z.tode.wanderung].join("·"), z.wachstum, z.wachstumOhneWanderung].join(" | "));
sag("   Gerade über die feinen Klassen: Wachstum =", aus.s14.gerade.steigung, "· D +", aus.s14.gerade.achse, "(Null bei D " + aus.s14.gerade.nullBeiD + ") · Feld", aus.s14.gerade.feld);
sag("── VORHERSAGEN");
for (const v of aus.vorhersagen) sag("  ", v.name, "→ IST", v.ist, "·", v.urteil);
sag("   benanntes Risiko:", aus.risiko.erwartet, "→ IST", aus.risiko.wolf, "Wölfe in", aus.risiko.rudel, "Rudeln (zweite Hälfte) · Wolf-Minimum Haupt-Lauf je Saat", aus.risiko.wolfMinHaupt.join(" "), "· S13 Takt-Tief je Saat", aus.risiko.s13TaktTief.join(" "));
{
    const r = aus.raum;
    const band = (x) => x.mittel + " (p10–p90 " + x.p10 + "–" + x.p90 + ")";
    sag("── RAUM (zweite Hälfte, Mittel der Saaten)");
    sag("   Rudel", r.rudel.mittel, "· je Saat", r.rudel.jeSaat.join(" "));
    sag("   Köpfe je Rudel", band(r.koepfeJeRudel), "· je Saat", r.koepfeJeRudel.jeSaat.join(" "));
    sag("   verteidigte Reviere je Rudel", band(r.verteidigteReviereJeRudel), "· Rudel-Revier je Rudel", band(r.rudelRevierJeRudel));
    sag("   offenes Land (kein Rudel verteidigt es)", r.offenesLandAnteil.mittel, "der Reviere · je Saat", r.offenesLandAnteil.jeSaat.join(" "), "· davon frei (in keinem Rudel-Revier)", r.freiesLandAnteil.mittel);
    sag("   Wanderer ohne Land (warten im Geburts-Rudel) ÷ Wölfe", r.wartendAnteil.mittel, "· je Saat", r.wartendAnteil.jeSaat.join(" "), "· Sucher ÷ Wölfe", r.sucherAnteil.mittel);
    sag("   Rudel im Mangel (Revier trägt den Bedarf nicht): Rudel-Takte", r.mangelRudelAnteil.mittel, "· Köpfe", r.mangelKopfAnteil.mittel, "· Rudel mit EINEM Kopf", r.einzelRudelAnteil.mittel, "· Rudel ohne Paar", r.ohnePaarRudelAnteil.mittel);
    sag("   Gründungen je Jahr", r.gruendungJeJahr.mittel, "· Beitritte je Jahr", r.beitrittJeJahr.mittel);
    sag("   Todes-Ursachen ab einem Jahr (" + r.todAbEinemJahr.koepfe + " Köpfe): Deckung", r.todAbEinemJahr.deckung, "· Alter", r.todAbEinemJahr.alter, "· Wanderung", r.todAbEinemJahr.wanderung, "· dazu Welpen-Tode", r.todWelpe);
    sag("   Raum-Buchung: Brüche Haupt-Lauf", r.raumBrueche.hauptLauf, "· S13-Zweige", r.raumBrueche.s13);
}
sag("── KOSTEN je Takt je 256 Reviere: mit Wolf", aus.kosten.mitWolfMs256, "ms (Soll ≤ 0,25) · je Saat", aus.kosten.mitWolfJeSaat.join(" "), "· ohne Wolf auf demselben Gerät im selben Lauf", aus.kosten.ohneWolfMs256, "ms · je Saat", aus.ohneWolf.ms256.jeSaat.join(" "));
sag("── ERHALTUNG: Brüche · Zuwanderung Haupt-Lauf", aus.soll.find((z) => z.nr === "S10").wert, "· S13-Zweige", aus.s13.brueche, "·", aus.s13.einwanderung, "· Eingriff je Saat (gefallen von)", S13.map((r) => (r.eingriff ? r.eingriff.gefallen + "/" + r.eingriff.vor : "—")).join(" "));
// ── DIE SPUR von S13 (wie auswertung-3.cjs): je 4-Jahres-Fenster das Mittel der Saaten, Zweig neben Kontrolle ───────────────
{
    const zeile = (F) => {
        const s = (f) => sum(F.map((x) => (x ? x[I[f]] : 0)));
        const wolfJahre = s("wolf") / TJ;
        return [rund(s("reh") / 105 / F.length, 0), rund(s("wolf") / 105 / F.length, 1), rund(s("rudel") / 105 / F.length, 1), rund(s("vSumme") / s("jagdTakte"), 0), rund(s("rissKg") / s("sattKg"), 3), rund(s("rissKg") / s("erhKg"), 2), rund(s("gebWolf") / wolfJahre, 3), rund((s("todWelpe") + s("todDeckung") + s("todAlterW")) / wolfJahre, 3), rund((s("gebWolf") - s("todWolf")) / wolfJahre, 3), rund(s("riss") / (s("geb") - s("hunger") - s("alter")), 2), rund(s("kern") / 105 / F.length / n, 3), rund(s("wartend") / s("wolf"), 3), rund(s("mangelKopf") / s("wolf"), 3)].join(" | ");
    };
    schreib("── SPUR S13, Mittel der " + SAATEN.length + " Saaten: Fenster | Beute | Wolf | Rudel | V je Wolf im Rudel-Revier | Riss ÷ Plateau | D | je Wolf-Jahr: Geburten | Tode | Wachstum | Riss ÷ Zuwachs der Beute | verteidigt (Anteil der Reviere) | wartend ÷ Wolf | Köpfe im Mangel ÷ Wolf");
    const ab = Math.floor(E / 105);
    const bis = Math.min(ab + 6, Math.ceil(TAKTE / 105));
    aus.s13Spur = [];
    for (let j = Math.max(0, ab - 2); j < bis; j++) {
        const o = zeile(P.map((p) => p.fen[j]));
        schreib("  Jahr " + j * 4 + "–" + (j * 4 + 4) + " OHNE Eingriff | " + o);
        aus.s13Spur.push(["ohne", j * 4, o]);
        if (j >= ab) {
            const mE = zeile(S13.filter((r) => !r.ohneWolfVorher).map((r) => r.fen[j]));
            schreib("  Jahr " + j * 4 + "–" + (j * 4 + 4) + " MIT Eingriff  | " + mE);
            aus.s13Spur.push(["mit", j * 4, mE]);
        }
    }
}
fs.writeFileSync(AUS, JSON.stringify(aus));
schreib("── BEFUND (zweite Hälfte)");
for (const [f, v] of Object.entries(aus.befund)) schreib(f, v.mittel, "· je Saat", v.jeSaat.join(" "));
schreib("── OHNE WOLF");
for (const [f, v] of Object.entries(aus.ohneWolf)) schreib(f, v.mittel, "· je Saat", v.jeSaat.join(" "));
schreib("── STERBE-TAFEL", JSON.stringify(aus.sterbe));
schreib("── SPUR Wolf (alle 105 Takte = 4 Jahre)");
for (const s of aus.spur.wolf) schreib("  ", s);
schreib("── SPUR Beute mit Wolf");
for (const s of aus.spur.reh) schreib("  ", s);
schreib("── Rudel Anfang (Reviere)", JSON.stringify(aus.spur.rudelAnfang));
schreib("── Rudel Ende (Köpfe, Reviere, D, V, Konto)", JSON.stringify(aus.spur.rudelEnde));
schreib("── S14 feine Klassen [D, Wachstum, Wolf-Jahre, Rudel-Jahre]", JSON.stringify(aus.s14.fein));
schreib("── S13 Jahres-Mittel je Saat (Jahre 1–24 nach dem Eingriff): Wolf | Wolf Kontrolle | Beute");
for (const r of S13) if (!r.ohneWolfVorher) schreib("  Saat", r.saat, "· Wolf", r.jahrWolf.join(" "), "| Kontrolle", r.jahrWolfKontrolle.join(" "), "| Beute", r.jahrBeute.join(" "), "| Takt-Tief", r.tiefTakt, "nach", rund(r.jahreBisTiefTakt, 2), "a (Fall " + rund(100 * r.fallTakt, 0) + " % vom Takt-Stand " + r.wolfVorTakt + ")");
P.forEach((p, s) => druckFenster("Saat " + SAATEN[s] + " (Haupt-Lauf)", p.fen));
S13.forEach((r) => !r.ohneWolfVorher && druckFenster("Saat " + r.saat + " (S13-Zweig ab Jahr " + EINGRIFF.jahr + ")", r.fen.filter(Boolean), r.fen.findIndex(Boolean)));
schreib("── EIGENE SETZUNGEN (vom Gesetz nicht genannt)");
SETZUNGEN.forEach(([name, text], i) => schreib("  " + (i + 1) + ". " + name + ": " + text));
sag("Datei", AUS, "· Ende", aus.uhrEnde, "·", sek());
