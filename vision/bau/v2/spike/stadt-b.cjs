// stadt-proto.cjs — ENTWURF B v2 „Reichtum aus Ursachen“ als laufender Prototyp (BAU-ZENSUS Runde 2, nur Scratch, kein Spiel-Code).
//
// Baut an DENSELBEN Adressen wie Runde 1 (pool.cjs: 30 Pläne DORF({seed 1–30, nH 90}), dieselben Haushalts-Lose, dieselbe Klasse,
// dasselbe Gewerbe) drei Städte und misst sie am selben Maß (pruef/analyse.cjs `vielfalt`):
//   HEUTE  — der Export von DORF (kern/ = Kopie fachwerk-core.js, SHA 028cc2d0, byte-gleich mit n1011-hg)
//   R1     — das Gesetz der Runde 1 (vision/bau/spike/gesetz-proto.cjs `hausVonAdresse`, Los = 15 m ÷ [3, 2, 1])
//   V2     — die Ursachen-Kette dieses Entwurfs: Los stetig über die Zeit · Haushalt · Zeit (Brand, Teilung, Kauf, Aufstockung,
//            Anbau) · Stoff des Orts · Schule der Zimmerleute (erbliches Genom mit Mutation)
// Druckt: Formen W×D×st, Breiten-Stufen, Traufe-Spanne Q90−Q10, Anteil der häufigsten Form je Stadt (Q50) — je Stadt-Satz;
// die Los-Breiten gegen die belegte Viertel-Raster-Ordnung (Stell & Tait 2016); die Kopf-/Gesinde-Zahlen gegen Laslett;
// und die PAARE: je Paar verschiedener Häuser die Ursache der Differenz (V2) bzw. ob sie reiner Würfel ist (HEUTE).
// Kein Fallback: fehlt ein Wert, wirft der Lauf.
"use strict";
const fs = require("fs");
const path = require("path");
const { laden } = require("./lade.cjs");
const GZ = require(path.join(__dirname, "..", "..", "..", "..", "koordination", "vision", "bau", "spike", "gesetz-proto.cjs"));

// ── Werkzeug ──────────────────────────────────────────────────────────────────────────────────────
const q = (a, p) => { const s = a.slice().sort((x, y) => x - y); const i = (s.length - 1) * p, lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const r2 = (v) => Math.round(v * 100) / 100, r3 = (v) => Math.round(v * 1000) / 1000;
const halb = (x) => Math.round(x * 2) / 2;
const muss = (v, was) => { if (v === undefined || v === null || (typeof v === "number" && !isFinite(v))) throw new Error("stadt-proto: es fehlt " + was); return v; };
// der Strom: FNV-1a über den Namen, wie der Genom-Roller des Spiels (stamm/bau-teile.js:1479–1489 `axis`) — eine Achse je Name
// + der Mischer fmix32 des Kerns (`rangSchluessel`, FC:3693–3697): OHNE ihn tragen Namen, die sich nur im LETZTEN Zeichen unterscheiden,
// korrelierte obere Bits (gemessen: "lokator|1…30" → nur 2 der 4 Klassen von floor(4u); Befund im Blatt)
function fnv(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function fmix(h) { let x = h >>> 0; x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0; x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0; return (x ^ (x >>> 16)) >>> 0; }
const ax = (...teile) => fmix(fnv(teile.join("|"))) / 4294967296;
const normal = (...teile) => { const u1 = Math.max(1e-12, ax(...teile, "a")), u2 = ax(...teile, "b"); return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2); };

// ── V2: DIE GRÖSSEN (jede mit Quelle: belegt · gewählt · unsicher) ─────────────────────────────────
const V2 = Object.freeze(Object.assign({
    // (a) DAS LOS
    rute: 5.03,                 // m — englische Statute-Perch 16½ ft (belegt: Statute of Ells and Perches, zit. Alnwick Civic Society 2020); für ALLE Regionen gewählt
    // Einheit der Gründung in Ruten — die MENGE der belegten Einheiten, je eine Stadt: Edinburgh 7,32 m = 24 ft (1,46), Elgin 8,1 m (1,61)
    //   (Stell & Tait 2016; Tait 2010), Alnwick 28 ft (1,70; Conzen, zit. Alnwick Civic Society 2020), Burford 1½ dann 3 Perches,
    //   Thame ~4 Perches (Oxoniensia 2002, Spavold & Gilman); Stratford 3½ (Blog nach Slater: unsicher). Gleiche Gewichte: gewählt
    einheitRuten: [1.46, 1.61, 1.7, 1.5, 3, 4, 3.5],
    anteil0: [0.75, 1.25],      // Anteil der Gründungs-Hofstätte am Einheitsmaß: 0,75 + 1,25·q, auf Viertel gerundet (Bereich 0,75–2,5 belegt
                                //   Stell & Tait 2016: „three-quarters … up to two and a half units“; die Kopplung an q gewählt)
    anteilMax: 2.5,             // belegt (ebd.)
    bMin: 3.5,                  // m — schmalstes Los, das noch geteilt wird (×2): gewählt
    generation: 30,             // Jahre je Erbgang: unsicher (übliche Generationen-Länge, nicht nachgeschlagen)
    pTeil: 0.10, pKauf: 0.05, pBrand: 0.035, pAuf: 0.10, pAnbau: 0.05,   // je Erbgang: GEWÄHLT (keine Quelle gefunden; Teilung als Vorgang belegt Thame/Burford)
    aufMax: 2,                  // Aufstockungen je Bau: gewählt
    dZiel: 11,                  // m — Tiefe des Vorderhauses, R1 Schließung S4 (Blatt b, geliehenes dMax): gewählt
    dMinHaus: 6,                // m — zwei Räume tief: gewählt (R1 dMin 4 gab 4-m-Häuser auf 15-m-Losen)
    reiheBis: 12,               // m — bis zu dieser Los-Breite füllt das Haus das Los (Brandwand an Brandwand); breiter: Torfahrt neben dem Haus
    torfahrt: 3.5,              // m — gewählt
    tiefFrei: 8,                // m — Tiefe des frei stehenden Hauses auf breitem Los (es nimmt die Breite, die sein EG bei 8 m Tiefe braucht): gewählt
    inwohner: 1.2,              // Miet-Haushalte (Inwohner, Hausgenossen) je Haus bei vollem Druck und alter Stadt: GEWÄHLT; England kennt nur
                                //   5–6 % „lodgers“ der Leute (Laslett-Zusammenfassung, belegt) — für die Stadt des Kontinents unsicher
    inwohnerM2: 27.3,           // m² netto je Miet-Haushalt (3 Leute: Herdraum 9 + 2·3, Kammern 2,5·1,44·3 + 1,5 — R1 raumProgramm arm)
    alterVoll: 300,             // Jahre, bis eine Stadt den vollen Miet-Druck trägt: gewählt
    steinAb: 1550,              // ab hier baut ein Brand-Neubau in Mitteleuropa das EG in Stein: unsicher (Bauordnungen nach Stadtbränden, nicht nachgeschlagen)
    // (b) DER HAUSHALT
    wohlSpanne: [0.44, 1.8],    // log-linear über den Rang q im Plan statt drei Stufen (Enden = BAU_GESETZ.wohl, entscheid §1.1)
    kinder: [3.0, 3.6, 4.4],    // Kinder im Haus auf der Höhe des Familien-Zyklus je Klasse: gewählt, geeicht auf hhMittel 4,75 (Laslett 1972, belegt:
                                //   England 1574–1821 „4·75 or a little below“)
    eheJahre: 40,               // die LEBENSPHASE: Jahre seit der Gründung des Haushalts, gleich verteilt 0–40: gewählt
    zyklus: [[0, 0], [15, 1], [25, 1], [40, 0.3]],   // Anteil der Kinder im Haus über die Ehejahre (wachsen, bleiben, gehen): gewählt
    witwe: 0.3,                 // ab 30 Ehejahren ist ein Gatte tot mit dieser Wahrscheinlichkeit: gewählt
    gesindeFaktor: [0, 0.45, 1.0], // × Gesinde-Basis des Gewerbes (R1 GEWERBE) je Klasse: gewählt, geeicht auf Gesinde-Anteil 11–14 % der Leute
                                //   (belegt als Spanne 1650–1821, Laslett-Zusammenfassung; Einzelzahl 13,4 % nicht bestätigt → unsicher)
    // (e) DIE SCHULE — Wurzel je Region (die erste Kultur des Regions-Pools, FC:3609–3615 → KULTUR FC:2121–2153) und Mutation je Erbgang
    sigma: { neigung: 2.5, raster: 0.06, vork: 0.06, fenster: 0.08 },   // je Schul-Generation zwischen Siedlungen: gewählt
    drift: 0.5,                 // Drift innerhalb einer Stadt je Erbgang = drift · sigma: gewählt
    pStrebe: 0.2,               // Wechsel der Strebenform je Schul-Generation: gewählt
    streben: ["mann", "k", "andreas", "wild", "none"],
    raster0: 1.25,              // m Ständerabstand der Wurzel: gewählt (heute bayMax 1,7 FC:420 ist die Obergrenze, kein Maß)
    vork0: 0.52,                // m Vorkragung je Geschoss: belegt (Stell & Tait 2016: englische Fachwerk-Stadthäuser 15. Jh. 52–60 cm je Geschoss)
    fenster0: 1.4,              // Fenster h/w: gewählt
    stab: 2,                    // Traufe ≤ stab·Tiefe (STADT_FORM.stab, FC:3892, gelesen FC:4494) — die Regel des Kerns
}, JSON.parse(process.env.STADT_V2 || "{}")));   // STADT_V2='{"pTeil":0.05}' — Empfindlichkeits-Läufe (empfindlich.sh); jeder Schlüssel muss in V2 stehen
for (const k of Object.keys(JSON.parse(process.env.STADT_V2 || "{}"))) if (!(k in V2)) throw new Error("stadt-proto: STADT_V2 kennt " + k + " nicht");
const TAG = process.env.STADT_TAG ? "-" + process.env.STADT_TAG : "";
// (d) DER STOFF DES ORTS — je Region (Proxy, weil die Pläne G keine Weltlage tragen; im Spiel: holzDesOrts(forestNische), entscheid §1.2): gewählt
const ORT = Object.freeze({
    mitteleuropa: { stoff: "fachwerk", stil: "alt", holz: "eiche" },
    alpin: { stoff: "block", stil: "huette", holz: "nadel" },
    nordisch: { stoff: "block", stil: "huette", holz: "nadel" },
    fernost: { stoff: "staender", stil: "huette", holz: "nadel" },
    mediterran: { stoff: "stein", stil: "stein", holz: null },
    antik: { stoff: "stein", stil: "stein", holz: null },
});

// der erste Wurf von _bauweiseWurf (FC:2204–2210), byte-treu: die Zufalls-Ziehungen r1…r4 eines Haus-Samens
function wurfZuege(seed) {
    let s = (Math.round(seed * 977 + 13) * 2654435761) >>> 0;
    const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    return [rnd(), rnd(), rnd(), rnd()];
}
function pitchKultur(KULTUR, kn, seed) { const z = wurfZuege(seed); return Math.max(8, Math.min(62, Math.round(KULTUR[kn].pitch + (z[0] - 0.5) * 5))); }   // = pool.cjs:20–23
const poolBei = (RH, region, y) => { const H = muss(RH[region], "REGION_HIST." + region); let P = H[0][1]; for (const z of H) if (y >= z[0]) P = z[1]; return P; };   // FC:4424 ohne Legende
// HEUTE nachgerechnet für ein Wohnhaus-Los (G: keine Ringe, kein Stadtkörper, kein Erbe — FC:4417, 4440, 4445 greifen nicht, jahr ≤ 1559):
//   W = klemm5..15(½(kW + jW)) → × (0,84 + 0,30 w) (FC:4439) · D = klemm4..11(½(kD + jD)) · st = kSt (+1 wenn städtisch ∧ w > 0,9, FC:4444)
function heuteForm(K, kn, z, w, staedtisch) {
    const k = muss(K[kn], "KULTUR." + kn);
    let W = Math.max(5, Math.min(15, Math.round((k.W + (z[1] - 0.5) * 2.2) * 2) / 2));
    W = Math.max(5, Math.min(15, Math.round(W * (0.84 + 0.3 * w) * 2) / 2));
    const D = Math.max(4, Math.min(11, Math.round((k.D + (z[2] - 0.5) * 1.8) * 2) / 2));
    let st = Math.max(1, Math.min(12, Math.round(k.st + (k.st >= 4 ? (z[3] - 0.5) * 3 : 0))));
    if (staedtisch && w > 0.9 && st < 4) st++;
    return { W, D, st };
}
const traufeHeute = (p) => 0.55 + (p.pilotis ? 2.6 : 0) + 2.55 + 2.35 * (Math.max(1, Math.min(12, Math.round(p.storeys || 1))) - 1);   // = pool.cjs:103

// das sichtbare Maß (pruef/analyse.cjs:49–56): Formen W×D×st, Breiten, Traufe-Spanne, Anteil der häufigsten Form je Plan (Q50)
function vielfalt(H, f) {
    const form = (h) => { const x = f(h); return `${x.W}x${x.D}x${x.st}`; };
    const proPlan = {}; for (const h of H) (proPlan[h.plan] ||= []).push(h);
    const modal = (arr) => { const c = {}; for (const x of arr) c[x] = (c[x] || 0) + 1; return Math.max(...Object.values(c)) / arr.length; };
    const T = H.map((h) => f(h).traufe);
    return { formen: new Set(H.map(form)).size, breiten: new Set(H.map((h) => f(h).W)).size, traufeQ10: r2(q(T, 0.1)), traufeQ90: r2(q(T, 0.9)), traufeSpanne: r2(q(T, 0.9) - q(T, 0.1)),
        modalQ50: r3(q(Object.values(proPlan).map((hs) => modal(hs.map(form))), 0.5)), geschosse: [1, 2, 3, 4, 5, 6].map((s) => H.filter((h) => f(h).st === s).length),
        W: [0.1, 0.5, 0.9].map((p) => r2(q(H.map((h) => f(h).W), p))) };
}

(async () => {
    const { FC } = await laden();
    const K = muss(FC.KULTUR, "FC.KULTUR"), RH = muss(FC.REGION_HIST, "FC.REGION_HIST");
    const aus = { zeit: new Date().toISOString() };

    // ── die Adressen der Runde 1 (pool.cjs:47, 57–99 wörtlich nachgebaut, nur Plan-Satz G) ──
    const HHg = [], planInfo = [];
    for (let s = 1; s <= 30; s++) {
        const pl = FC.DORF({ seed: s, nH: 90 });
        const band = pl.groesse === "weiler" || pl.groesse === "dorf" ? "dorf" : "stadt";
        const N = pl.houses.filter((h) => h.rolle !== "scheune" && h.rolle !== "burg").length;
        let i = 0;
        const hs = pl.houses.map((hp, a) => {
            const losI = hp.rolle === "scheune" ? null : i++;
            const t = losI == null ? null : Math.min(1, losI / Math.max(1, N - 1));
            const u = t == null || !isFinite(hp.wohl) ? 0.5 : Math.max(0, Math.min(1, (hp.wohl / (1.22 - 0.5 * t) - 0.78) / 0.44));
            return { plan: `G${s}`, s, region: pl.region, jahr: pl.jahr, spanne: pl.spanne, staedtisch: pl.staedtisch, band, a, losI, t, u, hp };
        });
        const HH = hs.filter((h) => h.losI != null && !GZ.SONDERBAU.has(h.hp.rolle));
        for (const h of HH) h.qW = (1 - h.t + h.u) / 2;
        const qs = HH.map((h) => h.qW).slice().sort((x, y) => x - y);
        for (const h of HH) { h.rang = qs.indexOf(h.qW) / Math.max(1, qs.length - 1); h.klasse = h.rang < GZ.BAU_GESETZ.klasse[0] ? 0 : h.rang < GZ.BAU_GESETZ.klasse[1] ? 1 : 2; }
        const quote = GZ.GEWERBE_ANTEIL[band];
        for (const h of HH) if (h.hp.rolle === "pfarrhaus") h.gewerbe = "geistlich";
        for (const h of HH) if (h.hp.rolle === "gasthaus") h.gewerbe = "wirt";
        for (const h of HH) if (h.hp.rolle === "schmiede") h.gewerbe = "schmied";
        const lageVon = { handel: (h) => h.hp.viertel === "markt" || ["kaufhaus", "kontor", "patrizierhaus", "wohnturm"].includes(h.hp.rolle), lebensmittel: (h) => h.hp.viertel === "markt" || h.hp.rolle === "backhaus", handwerk: (h) => h.hp.viertel === "handwerk" || ["werkstatt", "gerberei"].includes(h.hp.rolle), acker: () => false };
        for (const gr of ["handel", "lebensmittel", "handwerk", "acker"]) {
            const schon = HH.filter((h) => h.gewerbe && GZ.GEWERBE[h.gewerbe].gruppe === gr).length;
            const soll = Math.max(0, Math.round(quote[gr] * HH.length) - schon);
            const kand = HH.filter((h) => !h.gewerbe).sort((x, y) => (lageVon[gr](y) ? 1 : 0) - (lageVon[gr](x) ? 1 : 0) || (gr === "acker" ? y.t - x.t : y.qW - x.qW));
            const L = GZ.GRUPPE_GEWERBE[gr];
            for (let j = 0; j < soll && j < kand.length; j++) kand[j].gewerbe = gr === "handwerk" && kand[j].hp.rolle === "gerberei" ? "gerber" : gr === "lebensmittel" && kand[j].hp.rolle === "backhaus" ? "baecker" : L[(kand[j].hp.seed >>> 0) % L.length];
        }
        for (const h of HH) if (!h.gewerbe) h.gewerbe = "tageloehner";
        for (const h of HH) {   // R1 (pool.cjs:95–99)
            const kn = h.hp.kultur, pk = K[kn] ? pitchKultur(K, kn, h.hp.seed) : h.hp.pitchDeg;
            h.A = { gewerbe: h.gewerbe, klasse: h.klasse, baujahr: h.hp.baujahr, stil: h.hp.stil, region: pl.region, pitchKultur: pk, kultSt: K[kn] ? K[kn].st : h.hp.storeys };
            h.L = GZ.hausVonAdresse(h.A, GZ.SCHLIESSUNG.ort);
        }
        planInfo.push({ plan: `G${s}`, s, region: pl.region, jahr: pl.jahr, spanne: pl.spanne, staedtisch: pl.staedtisch, n: HH.length });
        HHg.push(...HH);
    }
    if (HHg.length !== 2595) throw new Error("stadt-proto: die Adressen der Runde 1 sind 2 595 Haushalts-Lose, gefunden " + HHg.length);

    // ════════════════════ V2 — DIE URSACHEN-KETTE ════════════════════
    // (e) die SCHULE: je Region eine Wurzel; die Siedlungen einer Region nach ihrem Jahr gereiht, jede erbt von der vorigen und mutiert
    //     (das Erbe des Lebens: kind = Mitte der Eltern + Segregation + Mutation, vision/leben/entscheid.md:56; hier EIN Elter, die
    //     Mutation aus dem FNV-Strom wie stamm/bau-teile.js:1479). Innerhalb der Stadt driftet sie je Erbgang (die Gesellen der nächsten Generation).
    const wurzel = (region) => { const kn = poolBei(RH, region, -1e9)[0], k = muss(K[kn], "KULTUR." + kn), holz = ORT[region].stoff !== "stein";
        return { neigung: k.pitch, raster: V2.raster0, vork: ORT[region].stoff === "fachwerk" ? V2.vork0 : 0, fenster: V2.fenster0, strebe: holz ? (k.brace === "none" ? "k" : k.brace) : "none", wurzelKultur: kn }; };
    const schule = {}, eltern = {};
    for (const region of new Set(planInfo.map((p) => p.region))) {
        const reihe = planInfo.filter((p) => p.region === region).sort((a, b) => a.jahr - b.jahr || a.s - b.s);
        let vor = wurzel(region), vorName = "Wurzel " + region;
        for (const p of reihe) {
            const m = (g) => normal("schule", p.s, g);
            const S = { neigung: vor.neigung + V2.sigma.neigung * m("neigung"), raster: Math.max(0.8, vor.raster + V2.sigma.raster * m("raster")),
                vork: Math.max(0, vor.vork + (vor.vork > 0 ? V2.sigma.vork * m("vork") : 0)), fenster: Math.max(0.9, vor.fenster + V2.sigma.fenster * m("fenster")),
                strebe: vor.strebe === "none" ? "none" : ax("schule", p.s, "strebe") < V2.pStrebe ? V2.streben[Math.floor(ax("schule", p.s, "strebeWahl") * 4)] : vor.strebe };
            schule[p.plan] = S; eltern[p.plan] = vorName; vor = S; vorName = p.plan;
        }
    }
    // die Schule einer Stadt im Jahr y: ihre Gene + Drift je Erbgang seit der Gründung der Stadt
    const schuleBei = (P, y) => {
        const S0 = muss(schule[P.plan], "Schule " + P.plan), G = Math.max(0, Math.floor((y - P.jahr) / V2.generation));
        const S = Object.assign({}, S0, { gen: G });
        for (let g = 1; g <= G; g++) {
            S.neigung += V2.drift * V2.sigma.neigung * normal("drift", P.s, g, "neigung"); S.raster += V2.drift * V2.sigma.raster * normal("drift", P.s, g, "raster");
            if (S.vork > 0) S.vork = Math.max(0, S.vork + V2.drift * V2.sigma.vork * normal("drift", P.s, g, "vork"));
            S.fenster += V2.drift * V2.sigma.fenster * normal("drift", P.s, g, "fenster");
            if (S.strebe !== "none" && ax("drift", P.s, g, "strebe") < V2.pStrebe * V2.drift) S.strebe = V2.streben[Math.floor(ax("drift", P.s, g, "strebeWahl") * 4)];
        }
        return S;
    };
    const planVon = Object.fromEntries(planInfo.map((p) => [p.plan, p]));
    // (a) das LOS: Gründungs-Einheit der Stadt (der Lokator) — U = Ruten × rute
    const einheit = (P) => V2.einheitRuten[Math.floor(ax("lokator", P.s) * V2.einheitRuten.length)] * V2.rute;
    const viertel = (x) => Math.round(x * 4) / 4;

    function v2Haus(h) {
        const P = planVon[h.plan], U = einheit(P), Y0 = muss(h.hp.baujahr, "baujahr " + h.plan), jetzt = P.jahr + P.spanne, ort = muss(ORT[P.region], "ORT." + P.region);
        const druck = 0.5 + 0.5 * (1 - h.t);    // gewählt: der Kern trägt den Druck des Markts
        const id = h.plan + "#" + h.a;
        // (b) der Haushalt der Gegenwart
        const wohl = V2.wohlSpanne[0] * Math.pow(V2.wohlSpanne[1] / V2.wohlSpanne[0], h.rang);
        const phase = ax("phase", id) * V2.eheJahre, zy = V2.zyklus, j = zy.findIndex((z) => z[0] > phase), anteilK = j <= 0 ? zy[zy.length - 1][1] : zy[j - 1][1] + ((zy[j][1] - zy[j - 1][1]) * (phase - zy[j - 1][0])) / (zy[j][0] - zy[j - 1][0]);
        const kinder = Math.floor(V2.kinder[h.klasse] * anteilK + ax("kinder", id)), eltern = phase >= 30 && ax("witwe", id) < V2.witwe ? 1 : 2;
        const gesinde = Math.floor(GZ.GEWERBE[h.gewerbe].gesinde * V2.gesindeFaktor[h.klasse] + ax("gesinde", id));
        const H = { gewerbe: h.gewerbe, klasse: h.klasse, wohl, phase: Math.floor(phase), kern: eltern + kinder, gesinde, koepfe: eltern + kinder + gesinde };
        // (c) die ZEIT: die Geschichte des Loses Erbgang für Erbgang
        let f = viertel(V2.anteil0[0] + V2.anteil0[1] * h.qW), bau = Y0, brand = 0, aufst = [], anbau = 0, ereignis = [], steinEG = false;
        const G = Math.max(0, Math.floor((jetzt - Y0) / V2.generation));
        for (let g = 1; g <= G; g++) {
            const y = Y0 + g * V2.generation;
            if (ax("brand", id, g) < V2.pBrand) { bau = y; brand++; aufst = []; ereignis.push("Brand " + y); steinEG = P.region === "mitteleuropa" && y >= V2.steinAb; continue; }
            if (f * U >= 2 * V2.bMin && ax("teil", id, g) < V2.pTeil * druck) { f = Math.max(0.25, Math.floor((f / 2) * 4) / 4); bau = y; aufst = []; ereignis.push("Teilung " + y); continue; }
            if (h.klasse >= 1 && f < V2.anteilMax && ax("kauf", id, g) < V2.pKauf * h.klasse) { f = Math.min(V2.anteilMax, f + (ax("kaufWas", id, g) < 0.5 ? 0.5 : 1)); bau = y; aufst = []; ereignis.push("Kauf " + y); continue; }
            if (aufst.length < V2.aufMax && ax("auf", id, g) < V2.pAuf * druck) { aufst.push(y); ereignis.push("Aufstockung " + y); }
            if (!anbau && ax("anbau", id, g) < V2.pAnbau) { anbau = y; ereignis.push("Anbau " + y); }
        }
        const b = f * U;
        // das Programm des Haushalts im Jahr seines Baus → Fläche → Tiefe und Geschosse auf der Breite des Loses (R1 `form` mit dem Los v2)
        const R = GZ.raumProgramm(H, bau);
        // die Miet-Haushalte (Inwohner): je älter die Stadt im Jahr des Baus und je höher der Druck, desto mehr Parteien über dem Eigner
        const inwohner = Math.floor(V2.inwohner * druck * Math.min(1, Math.max(0, bau - P.jahr) / V2.alterVoll) + ax("inwohner", id, bau));
        let eg = 0, og = inwohner * V2.inwohnerM2; for (const [, m2, g] of R) { if (g === "eg") eg += m2; else if (g === "og" || g === "dach") og += m2; }   // dach: der Speicherboden ist ein Geschoss (R1 verlor ihn, pruefung-spike (3) 2)
        const fuss = (s) => (s === 1 ? (eg + og) / 0.7 : Math.max(eg, og / (s - 1)) / 0.7);   // LEUTE_GESETZ.nutz 0,7 (FC:9526)
        const W = b <= V2.reiheBis ? halb(b) : Math.min(halb(b - V2.torfahrt), Math.max(V2.dMinHaus, halb(fuss(1) / V2.tiefFrei)));
        let s0 = 0; for (let k = 1; k <= 12; k++) if (fuss(k) / W <= V2.dZiel + 1e-9) { s0 = k; break; }
        if (!s0) { s0 = 1; while (s0 < 12 && fuss(s0 + 1) < fuss(s0) - 1e-9) s0++; }
        const D = Math.max(V2.dMinHaus, halb(fuss(s0) / W));
        H.inwohner = inwohner;
        // die Höhe: Geschosse des Baus + Aufstockungen, jede in der lichten Höhe IHRES Jahrs (BAU_GESETZ.licht); nie über stab·D (FC:4494)
        const S = schuleBei(P, bau), hBalken = GZ.kreuzholz(0.258).h;
        const geschossJahre = []; for (let k = 0; k < s0; k++) geschossJahre.push(bau);
        for (const y of aufst) geschossJahre.push(y);
        let traufe = GZ.BAU_GESETZ.sockel; const tr = [];
        for (const y of geschossJahre) { traufe += GZ.geschossH(y, hBalken); tr.push(traufe); }
        let st = geschossJahre.length;
        while (st > s0 && tr[st - 1] > V2.stab * D) st--;
        traufe = tr[st - 1];
        const deckung = GZ.deckungVon(ort.stil, P.region, S.neigung), neigung = Math.round(GZ.neigung(deckung, S.neigung));
        const stoff = steinEG ? "stein-eg+" + ort.stoff : ort.stoff;
        const vork = ort.stoff === "fachwerk" && st >= 2 && !steinEG ? r2(S.vork) : 0;
        return {
            W, D, st, traufe: r2(traufe), neigung, vork, fenster: r2(S.fenster), raster: r2(S.raster), strebe: ort.stoff === "stein" ? "none" : S.strebe, stoff, grundriss: anbau ? "L" : "I",
            fuge: st > s0 ? geschossJahre[s0] - bau : 0,
            los: { U: r2(U), f, b: r2(b), Y0, gen: G }, H, bau, brand, aufst: aufst.slice(0, st - s0), anbau, ereignis, schuleGen: S.gen, programm: r2(eg + og), deckung,
            // die URSACHEN dieses Hauses — jedes sichtbare Maß ist eine Funktion NUR seiner Zeile hier (siehe ABH unten)
            c: { lokator: r2(U), los: f, haushalt: `${h.gewerbe}/${h.klasse}/${H.koepfe}/${r2(wohl)}`, baujahr: bau, aufst: aufst.slice(0, st - s0).join(","), schule: h.plan + "@" + S.gen, ort: P.region, miete: inwohner, brand: steinEG ? 1 : 0, anbau: anbau ? 1 : 0, epoche: GZ.nachJahr(GZ.BAU_GESETZ.licht, bau) + "/" + (bau < 1300 ? 0 : bau < 1700 ? 1 : 2) },
        };
    }
    for (const h of HHg) h.V = v2Haus(h);

    // ── (1) DIE VIER SICHTBAREN MASSE gegen HEUTE und R1 ──
    const M = {
        heute: vielfalt(HHg, (h) => ({ W: h.hp.W, D: h.hp.D, st: h.hp.storeys, traufe: traufeHeute(h.hp) })),
        r1: vielfalt(HHg, (h) => ({ W: h.L.F.W, D: h.L.F.D, st: h.L.F.st, traufe: h.L.traufe })),
        v2: vielfalt(HHg, (h) => ({ W: h.V.W, D: h.V.D, st: h.V.st, traufe: h.V.traufe })),
    };
    aus.vielfalt = M;
    console.log("\n(1) SICHTBARE VIELFALT an den 2 595 Haushalts-Losen der 30 Pläne G (Maß = pruef/analyse.cjs:49–56)");
    console.log("    Satz    Formen W×D×st  Breiten  Traufe Q10/Q90 (Spanne)   häufigste Form je Stadt Q50   Breite Q10/50/90   Geschosse 1..6");
    for (const [k, m] of Object.entries(M)) console.log(`    ${k.padEnd(6)}  ${String(m.formen).padStart(6)}        ${String(m.breiten).padStart(4)}     ${m.traufeQ10}/${m.traufeQ90} (${m.traufeSpanne})        ${(m.modalQ50 * 100).toFixed(1)} %                        ${m.W.join("/")}       ${m.geschosse.join(" ")}`);
    const hält = { formen: M.v2.formen >= M.heute.formen, breiten: M.v2.breiten >= M.heute.breiten, spanne: M.v2.traufeSpanne >= M.heute.traufeSpanne, modal: M.v2.modalQ50 <= M.heute.modalQ50 };
    console.log("    Stopp „≥ heute“: " + Object.entries(hält).map(([k, v]) => `${k} ${v ? "HÄLT" : "FÄLLT"}`).join(" · "));
    aus.stopp = hält;
    { const eps = (h) => { const u = ax("absteckung", h.plan, h.a); return u < 2 / 3 ? (ax("abst2", h.plan, h.a) - 0.5) * 1.0 : (ax("abst2", h.plan, h.a) < 0.5 ? -1 : 1) * (0.5 + ax("abst3", h.plan, h.a) * 1.0); };
      const Mg = vielfalt(HHg, (h) => ({ W: Math.max(3.5, halb(h.V.W + eps(h))), D: h.V.D, st: h.V.st, traufe: h.V.traufe }));
      aus.gegenprobeAbsteckung = Mg; console.log(`    GEGENPROBE (kein Teil von V2): mit der belegten Absteckungs-Streuung (⅔ der Lose ±0,5 m, ⅓ 0,5–1,5 m daneben) → Formen ${Mg.formen} · Breiten ${Mg.breiten} · häufigste Form Q50 ${(Mg.modalQ50 * 100).toFixed(1)} %`); }

    // ── (2) DAS LOS gegen die belegte Ordnung ──
    const LB = HHg.map((h) => h.V.los.b), LF = HHg.map((h) => h.V.los.f);
    const fAnteil = {}; for (const f of LF) fAnteil[f] = (fAnteil[f] || 0) + 1;
    const U = planInfo.map((p) => r2(einheit(p)));
    aus.los = { bQ: [0.05, 0.1, 0.25, 0.5, 0.75, 0.9, 0.95].map((p) => r2(q(LB, p))), anteile: Object.fromEntries(Object.entries(fAnteil).sort((a, b) => +a[0] - +b[0]).map(([k, v]) => [k, r2(v / LF.length)])), einheiten: U,
        imBelegtenBand: r2(LF.filter((f) => f >= 0.75 && f <= 2.5).length / LF.length), unter075: r2(LF.filter((f) => f < 0.75).length / LF.length),
        heuteQ: [0.05, 0.1, 0.5, 0.9, 0.95].map((p) => r2(q(HHg.map((h) => h.hp.W), p))), r1Q: [0.1, 0.5, 0.9].map((p) => r2(q(HHg.map((h) => h.L.los.b), p))) };
    console.log("\n(2) LOS-BREITEN V2 (m) Q05/10/25/50/75/90/95: " + aus.los.bQ.join(" / ") + `   · heute Hausbreite Q05/10/50/90/95 ${aus.los.heuteQ.join("/")} · R1 Los ${aus.los.r1Q.join("/")}`);
    console.log("    Einheit U je Stadt (m): " + [...new Set(U)].sort((a, b) => a - b).join(", ") + " — Zahl der Städte je U: " + JSON.stringify(U.reduce((o, u) => ((o[u] = (o[u] || 0) + 1), o), {})));
    console.log("    Anteil f = b/U (Viertel-Raster): " + JSON.stringify(aus.los.anteile) + ` · im belegten Band 0,75–2,5: ${aus.los.imBelegtenBand} · darunter (geteilt): ${aus.los.unter075}`);
    console.log("    belegt (Stell & Tait 2016, 8 Burghs; Tait 2010 Elgin): Breiten = ¾ · 1 · 1¼ … 2½ Einheiten, Einheit je Ort (Edinburgh 7,32 m · Elgin 8,1 m);");
    console.log("    Edinburgh 49 Lose: ~⅔ innerhalb ± 0,5 m des Viertel-Rasters; Thame (Bond 1984-5): ~40 % der Fronten auf Perch-Vielfachen, Einheit ~4 Perches.");
    const amRaster = LB.filter((b, j) => { const Uj = HHg[j].V.los.U; return Math.abs(b / Uj * 4 - Math.round(b / Uj * 4)) * Uj / 4 <= 0.5; }).length / LB.length;
    console.log(`    V2 am Viertel-Raster ± 0,5 m: ${r2(amRaster)} (belegt ~0,67 — V2 kennt keine Absteckungs-Streuung: ZU REGELMÄSSIG, Befund)`);
    aus.los.amRaster = r2(amRaster);

    // ── (3) HAUSHALT gegen Laslett ──
    const KO = HHg.map((h) => h.V.H.koepfe), GE = HHg.map((h) => h.V.H.gesinde);
    aus.haushalt = { koepfe: r2(mean(KO)), gesindeAnteil: r2(GE.reduce((a, b) => a + b, 0) / KO.reduce((a, b) => a + b, 0)), mitGesinde: r2(GE.filter((g) => g > 0).length / GE.length), inwohnerJeHaus: r2(mean(HHg.map((h) => h.V.H.inwohner))), inwohnerLeuteAnteil: r2((3 * HHg.reduce((a, h) => a + h.V.H.inwohner, 0)) / (3 * HHg.reduce((a, h) => a + h.V.H.inwohner, 0) + KO.reduce((a, b) => a + b, 0))), r1Koepfe: r2(mean(HHg.map((h) => h.L.H.koepfe))), heuteLeute: r2(mean(HHg.map((h) => FC.leuteVon(h.hp)))) };
    console.log(`\n(3) HAUSHALT: Köpfe je Haushalt V2 ${aus.haushalt.koepfe} (Größen 1..10+: ${JSON.stringify([1,2,3,4,5,6,7,8,9,10].map((n) => r2(KO.filter((k) => (n < 10 ? k === n : k >= 10)).length / KO.length)))}) (Laslett belegt 4,75 · R1 ${aus.haushalt.r1Koepfe} · heute leuteVon ${aus.haushalt.heuteLeute}); Gesinde-Anteil der Leute ${aus.haushalt.gesindeAnteil} (belegt 0,11–0,14); Haushalte mit Gesinde ${aus.haushalt.mitGesinde} (Laslett ~0,29: unsicher); Miet-Haushalte je Haus ${aus.haushalt.inwohnerJeHaus}, ihr Anteil an den Leuten ${aus.haushalt.inwohnerLeuteAnteil} (England lodgers 0,05–0,06 belegt)`);

    // ── (4) DIE ZEIT und die SCHULE: was geschah ──
    const ev = { Brand: 0, Teilung: 0, Kauf: 0, Aufstockung: 0, Anbau: 0 }; for (const h of HHg) for (const e of h.V.ereignis) ev[e.split(" ")[0]]++;
    aus.zeit = { ereignisse: ev, haeuserMitFuge: HHg.filter((h) => h.V.fuge > 0).length, steinEG: HHg.filter((h) => h.V.stoff.startsWith("stein-eg")).length, L: HHg.filter((h) => h.V.grundriss === "L").length, bauGleichGruendung: HHg.filter((h) => h.V.bau === h.V.los.Y0).length, gen: [0.1, 0.5, 0.9].map((p) => q(HHg.map((h) => h.V.los.gen), p)) };
    console.log(`\n(4) ZEIT: Erbgänge je Los Q10/50/90 ${aus.zeit.gen.join("/")} · Ereignisse ${JSON.stringify(ev)} · Häuser mit Aufstockungs-Fuge ${aus.zeit.haeuserMitFuge} · EG in Stein nach Brand ${aus.zeit.steinEG} · L-Grundriss ${aus.zeit.L} · noch der Gründungsbau ${aus.zeit.bauGleichGruendung}`);
    console.log("    SCHULE je Stadt (Elter → Gene: Neigung° · Raster m · Vorkragung m · Fenster h/w · Strebe):");
    for (const p of planInfo.slice().sort((a, b) => a.region.localeCompare(b.region) || a.jahr - b.jahr)) { const S = schule[p.plan]; console.log(`      ${p.plan.padEnd(4)} ${p.region.padEnd(12)} ${String(p.jahr).padStart(5)}  ← ${eltern[p.plan].padEnd(18)} ${S.neigung.toFixed(1)} · ${S.raster.toFixed(2)} · ${S.vork.toFixed(2)} · ${S.fenster.toFixed(2)} · ${S.strebe}`); }
    aus.schule = Object.fromEntries(planInfo.map((p) => [p.plan, Object.assign({ eltern: eltern[p.plan] }, schule[p.plan])]));

    // ── (5) PAARE V2: die Ursache jeder Differenz ──
    // ABH: welches sichtbare Maß hängt an welchen Ursachen (so rechnet v2Haus — die Tafel ist die Prüfung, ob der Code ihr folgt)
    const ABH = { W: ["lokator", "los", "haushalt", "baujahr", "epoche", "miete"], D: ["lokator", "los", "haushalt", "baujahr", "epoche", "miete"], st: ["lokator", "los", "haushalt", "baujahr", "epoche", "aufst", "miete"],
        traufe: ["lokator", "los", "haushalt", "baujahr", "epoche", "aufst", "miete"], neigung: ["schule", "ort"], vork: ["schule", "ort", "brand", "lokator", "los", "haushalt", "baujahr", "aufst", "miete"],
        fenster: ["schule"], raster: ["schule"], strebe: ["schule", "ort"], stoff: ["ort", "brand"], grundriss: ["anbau"] };
    const SICHT = Object.keys(ABH);
    // Prüfung 1 (Gruppen): je Maß alle Häuser mit GLEICHEN Ursachen — trägt eine Gruppe zwei Werte, hat die Varianz keine Ursache
    const ohneUrsache = {};
    for (const m of SICHT) { const gr = new Map(); for (const h of HHg) { const k = ABH[m].map((c) => h.V.c[c]).join("¦"); if (!gr.has(k)) gr.set(k, new Set()); gr.get(k).add(String(h.V[m])); }
        ohneUrsache[m] = [...gr.values()].filter((s) => s.size > 1).length; }
    // Prüfung 2 (Paare): 1 200 Paare in derselben Stadt (Nachbarn im Bild) + 1 200 über die Städte; je Paar die verschiedenen Maße und ihre Ursachen
    const paare = (n, gleich) => { const out = []; let j = 0; while (out.length < n) { const a = Math.floor(ax("paar", gleich, j, "a") * HHg.length); let b = Math.floor(ax("paar", gleich, j, "b") * HHg.length); j++;
        if (gleich) { const A = HHg[a], same = HHg.filter((h) => h.plan === A.plan); b = HHg.indexOf(same[Math.floor(ax("paar", gleich, j, "c") * same.length)]); }
        if (a !== b && (gleich ? HHg[a].plan === HHg[b].plan : HHg[a].plan !== HHg[b].plan)) out.push([HHg[a], HHg[b]]); } return out; };
    const ursacheZaehl = (P) => { let verschieden = 0, rueck = 0; const haeuf = {}, beispiel = [];
        for (const [A, B] of P) { const diff = SICHT.filter((m) => String(A.V[m]) !== String(B.V[m])); if (!diff.length) continue; verschieden++;
            let ok = true; const ur = new Set();
            for (const m of diff) { const c = ABH[m].filter((x) => String(A.V.c[x]) !== String(B.V.c[x])); if (!c.length) ok = false; c.forEach((x) => ur.add(x)); }
            if (ok) rueck++; for (const x of ur) haeuf[x] = (haeuf[x] || 0) + 1;
            if (beispiel.length < 4) beispiel.push(`${A.plan}#${A.a} ↔ ${B.plan}#${B.a}: ${diff.map((m) => `${m} ${A.V[m]}|${B.V[m]}`).join(", ")} ⇐ ${[...ur].join(", ")}`); }
        return { paare: P.length, verschieden, rueckfuehrbar: rueck, anteil: r2(rueck / Math.max(1, verschieden)), ursachen: Object.fromEntries(Object.entries(haeuf).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, r2(v / verschieden)])), beispiel }; };
    // die Ursache der FORM allein (W×D×st), wie Behauptung 3c sie misst
    const formUrsache = (P) => { const h = {}; let n = 0; for (const [A, B] of P) { const dm = ["W", "D", "st"].filter((m) => A.V[m] !== B.V[m]); if (!dm.length) continue; n++;
        const ur = new Set(); for (const m of dm) ABH[m].filter((x) => String(A.V.c[x]) !== String(B.V.c[x])).forEach((x) => ur.add(x));
        const key = [...ur].sort().join("+"); h[key] = (h[key] || 0) + 1; }
        return { formVerschieden: n, buendel: Object.entries(h).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => `${k} ${r2(v / n)}`) }; };
    const Pin = paare(1200, 1), Paus = paare(1200, 0);
    aus.paareV2 = { ohneUrsacheGruppen: ohneUrsache, inStadt: ursacheZaehl(Pin), ueberStaedte: ursacheZaehl(Paus), formInStadt: formUrsache(Pin) };
    console.log("\n(5) PAARE V2 — je Paar verschiedener Häuser die Ursache der Differenz");
    console.log("    Gruppen gleicher Ursachen mit zwei Werten (Varianz OHNE Ursache) je Maß: " + JSON.stringify(ohneUrsache));
    for (const [k, Z] of [["in derselben Stadt", aus.paareV2.inStadt], ["über die Städte", aus.paareV2.ueberStaedte]]) {
        console.log(`    ${k}: ${Z.paare} Paare, verschieden ${Z.verschieden}, rückführbar ${Z.rueckfuehrbar} (${(Z.anteil * 100).toFixed(0)} %) · Ursachen (Anteil der Paare): ${JSON.stringify(Z.ursachen)}`);
        for (const b of Z.beispiel) console.log("      " + b);
    }
    console.log("    die FORM W×D×st in derselben Stadt — Ursachen-Bündel: " + aus.paareV2.formInStadt.buendel.join(" · ") + ` (von ${aus.paareV2.formInStadt.formVerschieden})`);

    // ── (6) HEUTE: welche Varianz hat KEINE Ursache? ──
    // nachgerechnet je Wohnhaus-Los (heuteForm); nur Lose, deren nachgerechnete Form der Export genau trägt, gehen in die Paare
    const nach = HHg.filter((h) => h.hp.rolle === "wohnhaus" && K[h.hp.kultur]).map((h) => { const z = wurfZuege(h.hp.seed), w = h.hp.wohl; const F = heuteForm(K, h.hp.kultur, z, w, h.staedtisch);
        return { h, z, w, F, treffer: F.W === h.hp.W && F.D === h.hp.D && F.st === h.hp.storeys, pool: poolBei(RH, h.region, h.hp.baujahr) }; });
    const T = nach.filter((x) => x.treffer);
    console.log(`\n(6) HEUTE — Wohnhaus-Lose ${nach.length} von ${HHg.length} Haushalts-Losen, Form nachgerechnet und gleich dem Export: ${T.length} (${r2(T.length / nach.length)})`);
    // Gegenprobe ohne Würfel: (i) ohne Maß-Würfel (jW = jD = 0), (ii) zusätzlich EINE Kultur je Stadt (die erste ihres Pools im Jahr des Loses)
    const ohneMass = (x, kn) => heuteForm(K, kn, [x.z[0], 0.5, 0.5, 0.5], x.w, x.h.staedtisch);
    const vT = (f) => vielfalt(T.map((x) => ({ plan: x.h.plan, x })), (o) => { const F = f(o.x); return { W: F.W, D: F.D, st: F.st, traufe: 0.55 + 2.55 + 2.35 * (F.st - 1) }; });
    aus.heuteOhne = { mitWuerfel: vT((x) => x.F), ohneMassWuerfel: vT((x) => ohneMass(x, x.h.hp.kultur)), ohneJedenWuerfel: vT((x) => ohneMass(x, x.pool[0])) };
    console.log("    dieselben Lose: Formen / Breiten / Traufe-Spanne / häufigste Form Q50:");
    for (const [k, m] of Object.entries(aus.heuteOhne)) console.log(`      ${k.padEnd(18)} ${m.formen} / ${m.breiten} / ${m.traufeSpanne} / ${(m.modalQ50 * 100).toFixed(1)} %`);
    // Paare HEUTE: B mit den Würfeln von A (A's Kultur, wenn sie in B's Pool liegt — sonst trennt das Baujahr die Kultur: Ursache —, A's Maß-Züge)
    const PH = []; { let j = 0; while (PH.length < 1200) { const a = T[Math.floor(ax("ph", j, "a") * T.length)], same = T.filter((x) => x.h.plan === a.h.plan), b = same[Math.floor(ax("ph", j, "b") * same.length)]; j++; if (a !== b) PH.push([a, b]); } }
    let verschieden = 0, wuerfel = 0, ursache = 0, gemischt = 0, kulturWuerfel = 0, massWuerfel = 0; const beispiele = [];
    for (const [A, B] of PH) {
        const fa = A.F, fb = B.F; if (fa.W === fb.W && fa.D === fb.D && fa.st === fb.st) continue; verschieden++;
        const kn = A.pool.includes(A.h.hp.kultur) && B.pool.includes(A.h.hp.kultur) ? A.h.hp.kultur : B.h.hp.kultur;
        const Bmit = heuteForm(K, kn, A.z, B.w, B.h.staedtisch), gleichA = Bmit.W === fa.W && Bmit.D === fa.D && Bmit.st === fa.st;
        const BohneMass = heuteForm(K, kn, [0, 0.5, 0.5, 0.5], B.w, B.h.staedtisch), AohneMass = heuteForm(K, kn, [0, 0.5, 0.5, 0.5], A.w, A.h.staedtisch);
        if (gleichA) { wuerfel++; if (A.h.hp.kultur !== B.h.hp.kultur) kulturWuerfel++; else massWuerfel++; if (beispiele.length < 3) beispiele.push(`${A.h.plan}#${A.h.a} ${A.h.hp.kultur} ${fa.W}×${fa.D}×${fa.st} ↔ #${B.h.a} ${B.h.hp.kultur} ${fb.W}×${fb.D}×${fb.st}: mit A's Würfeln wird B ${Bmit.W}×${Bmit.D}×${Bmit.st} = A`); }
        else if (BohneMass.W !== AohneMass.W || BohneMass.st !== AohneMass.st) ursache++; else gemischt++;
    }
    aus.paareHeute = { paare: PH.length, verschieden, reinerWuerfel: wuerfel, anteilWuerfel: r2(wuerfel / verschieden), davonKulturWahl: kulturWuerfel, davonMassJitter: massWuerfel, mitUrsache: ursache, rest: gemischt, beispiele };
    console.log(`    PAARE HEUTE in derselben Stadt: ${PH.length}, Form verschieden ${verschieden}; REINER WÜRFEL (B mit A's Würfeln = A) ${wuerfel} (${(r2(wuerfel / verschieden) * 100).toFixed(0)} %) — davon Kultur-Wahl im selben Pool ${kulturWuerfel}, Maß-Jitter allein ${massWuerfel}; Ursache (Wohlstand trennt auch ohne Würfel) ${ursache}; Rest ${gemischt}`);
    for (const b of beispiele) console.log("      " + b);
    // die Varianz der Breite heute zerlegt (an den nachgerechneten Losen): Var(W) gesamt · ohne Maß-Würfel · ohne jeden Würfel
    const vr = (a) => { const m = mean(a); return mean(a.map((x) => (x - m) ** 2)); };
    const VW = { gesamt: r2(vr(T.map((x) => x.F.W))), ohneMass: r2(vr(T.map((x) => ohneMass(x, x.h.hp.kultur).W))), ohneJeden: r2(vr(T.map((x) => ohneMass(x, x.pool[0]).W))) };
    // in DERSELBEN Stadt (das Bild einer Gasse): Mittel der Varianz je Plan
    const jePlan = (f) => { const g = {}; for (const x of T) (g[x.h.plan] ||= []).push(f(x)); return r2(mean(Object.values(g).filter((a) => a.length > 1).map(vr))); };
    VW.inStadt = { gesamt: jePlan((x) => x.F.W), ohneMass: jePlan((x) => ohneMass(x, x.h.hp.kultur).W), ohneJeden: jePlan((x) => ohneMass(x, x.pool[0]).W) };
    VW.inStadtSt = { gesamt: jePlan((x) => x.F.st), ohneJeden: jePlan((x) => ohneMass(x, x.pool[0]).st) };
    VW.inStadtD = { gesamt: jePlan((x) => x.F.D), ohneMass: jePlan((x) => ohneMass(x, x.h.hp.kultur).D), ohneJeden: jePlan((x) => ohneMass(x, x.pool[0]).D) };
    aus.varianzBreiteHeute = VW;
    console.log(`    in derselben Stadt (Mittel je Plan): Var(W) ${VW.inStadt.gesamt} → ohne Maß-Würfel ${VW.inStadt.ohneMass} → ohne jeden ${VW.inStadt.ohneJeden} · Var(D) ${VW.inStadtD.gesamt} → ${VW.inStadtD.ohneMass} → ${VW.inStadtD.ohneJeden} · Var(st) ${VW.inStadtSt.gesamt} → ohne jeden ${VW.inStadtSt.ohneJeden}`);
    console.log(`    Var(Breite) heute m²: gesamt ${VW.gesamt} · ohne Maß-Würfel ${VW.ohneMass} · ohne jeden Würfel (eine Kultur je Pool) ${VW.ohneJeden} → ohne Ursache ${r2(1 - VW.ohneJeden / VW.gesamt)} der Varianz`);

    fs.writeFileSync(path.join(__dirname, "stadt-proto" + TAG + ".json"), JSON.stringify(aus, null, 1));
    // die 2 595 V2-Häuser als Tafel (für das Blatt, gekürzt)
    fs.writeFileSync(path.join(__dirname, "stadt-v2-haeuser" + TAG + ".json"), JSON.stringify(HHg.map((h) => ({ adr: h.plan + "#" + h.a, region: h.region, t: r2(h.t), heute: [h.hp.W, h.hp.D, h.hp.storeys, h.hp.kultur], r1: [h.L.F.W, h.L.F.D, h.L.F.st], v2: [h.V.W, h.V.D, h.V.st, h.V.traufe, h.V.neigung, h.V.stoff, h.V.grundriss], los: h.V.los, H: h.V.H, bau: h.V.bau, ereignis: h.V.ereignis }))));
    console.log("\ngeschrieben stadt-proto.json, stadt-v2-haeuser.json");
})().catch((e) => { console.error(e); process.exit(1); });
