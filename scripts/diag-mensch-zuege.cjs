// ============================================================================
// gate:mensch-zuege — DER CHARAKTERZUG ÄNDERT DEN TAG (Meisterkarte 2, mensch.geist.absicht S1: „20 Personen nach 1 Spieltag
// ihrem Zug zugeordnet ≥ 0,6"). Das Gesetz: koerper-core TAGES_GESETZ.zuege — jeder Mensch trägt aus seinem Samen EINEN Zug
// (`tagesZug`: gesellig · fleissig · haeuslich · ausgeglichen), und der Zug ändert die Wenden seines Tags (`tagesPlan`) und die
// Wahl seiner Orte (`tagesBindung`). Leser im Spiel: der Wirt `_bewohnerListe` → `binden` (stamm/siedlung-bewohner.js,
// `KC.tagesBindung`) und `_bewohnerSoll` (`KC.tagesPlan`, je planH).
//
// DIE PROBE: ein Dorf aus `tagesOrte` (20 Häuser — 18 Wohnhäuser, das Gasthaus, die Kirche — mit dem Platz und zwei Äckern),
// 100 Bewohner (5 je Haus) über das echte `tagesBindung` gebunden, die Orte gestellt wie der Wirt sie stellt (daheim heißt:
// kein eigener Ort, der Plan nennt die Tür). Je Bewohner `tagesPlan` alle 15 min über 24 h. EIN BLINDER ZUORDNER (er liest
// den Zug nie, nur seinen Tag und die Rolle seines Hauses) ordnet jeden nach drei Kennzahlen: Stunden am Werk über dem Maß
// seiner Rolle, Stunden am Treff außer Haus, Stunden daheim in der Freizeit. Soll: Treffer ≥ 0,6 an den ersten 20 und über
// alle 100; bit-gleich (zwei Läufe, dasselbe Wort je Same und Stunde). Dazu ALTER (generationen S1, unten). JE ZUG (mensch-zahlen): jeder der vier Züge wird zu
// ≥ 0,6 erkannt — der Anteil über alle trug einen Zug ohne Gesetz mit (ausgeglichen 2 von 16 bei 0,71 über alle) —, und kein
// Häuslicher trägt seinen Abend außer Haus. Täter (Selbsttest): der Kern mit `tagesZug` → immer „ausgeglichen" (der Stand
// vor dem Zug: der Same verschob jede Wende nur um ±streuH), der Ausgeglichene ohne sein Gesetz (`{}`: das Los band ihn den
// ganzen Abend an Treff oder Haus) und der Häusliche mit dem Los am Abend (treffMal 0,1) fallen ROT an ihrer Zeile.
// ============================================================================
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { urteilEnde, SELBSTTEST } = require("./lib/welt-boot.cjs");

require("../tetrapoda-core.js");
require("../koerper-core.js");
const TC = globalThis.__tetrapodaCore;
const KC = globalThis.__koerperCore;
const ZUEGE = ["gesellig", "fleissig", "haeuslich", "ausgeglichen"];

// DAS DORF (plan-lokal, Meter): der Platz in der Mitte, die Häuser auf zwei Ringen, das Gasthaus und die Kirche am Platz
function dorf() {
    const slots = [];
    for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2,
            r = i % 2 ? 34 : 22;
        slots.push({ x: Math.cos(a) * r, z: Math.sin(a) * r, rolle: "wohnhaus" });
    }
    slots.push({ x: 12, z: 6, rolle: "gasthaus" }, { x: -14, z: 9, rolle: "kirche" });
    const plan = {
        slots,
        platz: { cx: 0, cz: 0 },
        staende: [{}, {}],
        felder: [
            { cx: 70, cz: 0, ex: 15 },
            { cx: 0, cz: -75, ex: 15 },
        ],
    };
    return KC.tagesOrte(plan);
}

// DER TAG EINES DORFS: je Bewohner seine Bindung, seine Orte (wie der Wirt sie stellt) und sein Wort je 15 min
function tagDesDorfs(K) {
    const orte = dorf();
    const leute = [];
    for (let s = 0; s < 20; s++)
        for (let k = 0; k < 5; k++) {
            const same = (Math.imul(s * 5 + k + 1, 0x9e3779b1) ^ 0x5bd1e995) >>> 0;
            const rolle = orte[s].art;
            const B = K.tagesBindung(TC, same, rolle, s, orte, null);
            const heim = { name: "heim" };
            const stelle = (wo) => (B[wo] < 0 || (B[wo] === s && wo !== "werk") ? null : { name: wo, i: B[wo] });
            const werk = stelle("werk") && (B.werk !== s || rolle !== "wohnhaus") ? stelle("werk") : null;
            const O = {
                heim,
                werk,
                platz: stelle("platz"),
                mahl: stelle("mahl"),
                abend: stelle("abend"),
                besuch: stelle("besuch"),
            };
            const worte = [];
            for (let q = 0; q < 96; q++) {
                const p = K.tagesPlan(same, rolle, q / 4, O, 0);
                worte.push(`${p.wo}:${p.akt}:${+p.drinnen}`);
            }
            leute.push({ same, rolle, worte, abendAus: B.abend >= 0 && B.abend !== s });
        }
    return leute;
}

// DER BLINDE ZUORDNER: liest nur den Tag (die Worte) und die Rolle des Hauses — nie den Zug
function zuordnen(P) {
    const G = KC.TAGES_GESETZ;
    const R = G.rollen[P.rolle] || {};
    const W = R.werk || G.werk;
    const mass = W[1] - W[0] - (R.mittagAmWerk ? 0 : G.mittag[1] - G.mittag[0]);
    let werk = 0,
        treff = 0,
        heimFrei = 0;
    for (const w of P.worte) {
        const [wo, akt] = w.split(":");
        if (akt === "arbeit") werk += 0.25;
        else if (akt !== "schlaf" && wo === "abend") treff += 0.25;
        else if (akt !== "schlaf" && wo === "heim") heimFrei += 0.25;
    }
    const kz = { werkUeber: werk - mass, treff, heimFrei };
    if (kz.werkUeber >= 1.5) return ["fleissig", kz];
    if (treff >= 2) return ["gesellig", kz];
    if (heimFrei >= 5.4) return ["haeuslich", kz];
    return ["ausgeglichen", kz];
}

function urteil(K, zugVon) {
    const leute = tagDesDorfs(K);
    let t20 = 0,
        t100 = 0;
    const tafel = {};
    leute.forEach((P, n) => {
        const ist = zugVon(P.same);
        const [rat, kz] = zuordnen(P);
        P.ist = ist;
        P.rat = rat;
        P.kz = kz;
        const ok = ist === rat;
        t100 += ok;
        if (n < 20) t20 += ok;
        tafel[ist] = tafel[ist] || { n: 0, ok: 0, werkUeber: 0, treff: 0, heimFrei: 0 };
        const T = tafel[ist];
        T.n++;
        T.ok += ok;
        for (const k in kz) T[k] += kz[k];
    });
    return { t20: t20 / 20, t100: t100 / 100, tafel, leute };
}

// DER KERN MIT EINEM TÄTER: dieselbe Quelle, EINE Stelle getauscht (frischer Kontext) — null, wenn die Stelle fehlt
function kernMitTaeter(stelle, ersatz) {
    const src = fs.readFileSync(path.join(__dirname, "..", "koerper-core.js"), "utf8");
    const mut = src.replace(stelle, ersatz);
    if (mut === src) return null;
    const ctx = vm.createContext({ console });
    vm.runInContext(mut, ctx);
    return ctx.__koerperCore;
}
// DIE TÄTER: der Name, die Stelle im Kern, ihr Ersatz, die Zeile des Urteils, an der er fällt
const TAETER = [
    {
        name: "tagesZug → ausgeglichen (kein Zug ändert den Tag)",
        stelle: /function tagesZug\(same\) \{/,
        ersatz: 'function tagesZug(same) {\n        return "ausgeglichen";',
        faellt: /alle 100 /,
    },
    {
        name: "der Ausgeglichene ohne Gesetz (kein geteilter Abend)",
        stelle: /ausgeglichen: Object\.freeze\(\{[^}]*abendTreffH[^}]*\}\)/,
        ersatz: "ausgeglichen: Object.freeze({})",
        faellt: /ausgeglichen \d+\/\d+ < 0,6/,
    },
    {
        name: "der Häusliche mit dem Los am Abend (treffMal 0,1)",
        stelle: /treffMal: 0,/,
        ersatz: "treffMal: 0.1,",
        faellt: /Häusliche mit dem Abend außer Haus/,
    },
];
// DAS URTEIL: die Zeilen, an denen der Tag ROT fällt
function rotVon(a) {
    const rot = [];
    if (a.t20 < 0.6) rot.push(`erste 20 ${a.t20.toFixed(2)} < 0,6`);
    if (a.t100 < 0.6) rot.push(`alle 100 ${a.t100.toFixed(2)} < 0,6`);
    for (const z of ZUEGE) {
        const T = a.tafel[z];
        if (!T || T.ok / T.n < 0.6) rot.push(`${z} ${T ? T.ok : 0}/${T ? T.n : 0} < 0,6`);
    }
    const aus = a.leute.filter((P) => P.ist === "haeuslich" && P.abendAus).length;
    if (aus) rot.push(`${aus} Häusliche mit dem Abend außer Haus`);
    return rot;
}

const zugVon = (s) => {
    if (typeof KC.tagesZug !== "function") throw new Error("koerper-core: tagesZug fehlt (Pflicht-Bruch)");
    return KC.tagesZug(s);
};

const zeile = (u) =>
    ZUEGE.map((z) => {
        const T = u.tafel[z];
        if (!T) return `${z} 0`;
        const f = (x) => (x / T.n).toFixed(2);
        return `${z} ${T.ok}/${T.n} (Werk+ ${f(T.werkUeber)} h · Treff ${f(T.treff)} h · daheim ${f(T.heimFrei)} h)`;
    }).join(" | ");

// ── ALTER (Meisterkarte 2 mensch.geist.generationen S1: „Altersanteile im Band der Epoche, Mittelalter ≥ 35 % Kinder"): das Gesetz
// koerper ALTER_GESETZ (`epochenAlter`, `wuchs`, `alterLeib`, `alterAbstand`), seine Leser im Spiel der Roller des Stamms
// (`_rollHumanoidGenome` → `_bewohnerJahre`), die Wahl der Gestalt (`_bewohnerAbstand`) und die Dials des Leibs (`_dialsAusGenom`) —
// gelesen aus dem virtuellen Stamm (scripts/lib/stamm.cjs, Lehre 12) und ausgeführt wie im Spiel. DIE PROBE: eine Siedlung der
// Epoche 1238 (die Stadt der Station, stadt-voll), 8 Gestalten geschichtet über die Pyramide, 420 Häuser mit 1–7 Leuten; je
// Bewohner die Gestalt seines kleinsten Abstands. Soll: der Anteil unter 15 J an den Jahren der GESTALT (wie die Station sie liest:
// 18 + 62 · ov.age) ≥ 0,35; kein Kind in der Gestalt eines Erwachsenen; die Höhe des Kinds am Dial (height) gegen sein Alter im
// Band der Wachstumskurve (±6 %), der Kopf (height · kopf) im Band ±5 %; keine Kind-Gestalt am Rand des Kopf-Knotens der Menge
// (LEIB_RAUM kopf trägt den Kopf des Zweijährigen, Vertrags-Akt ofen mensch-L2/L3); das Kind im Haus der Schmiede spielt um 10 Uhr (Akt „spiel", am Platz: der Ort seines Angebots), nie „arbeit".
// Täter (Selbsttest): das Alter wie vor generationen-band (0,05–0,5 auf dem Regler) → ROT am Anteil; die Wahl ohne die Lebensphase
// (der Abstand im Regler allein) → ROT an der Gestalt; der Wuchs ohne Höhe → ROT an der Körperhöhe; das Kind ohne Reife (die
// Kind-Gestalt unter 10 J trägt sex fern der Mitte: die kleine Frau, das Bild K1 am 23.11.) → ROT an der Form des Geschlechts; das Spiel
// vor der eigenen Tür (die erste Fassung) → ROT am Kind der Schmiede.
const stammLib = require("./lib/stamm.cjs");
const ALTER_JAHR = 1238;
// die Wachstumskurve (Mittel beider Geschlechter, Höhe ÷ 172 cm; Kopf ÷ erwachsen) — die Referenz der Linse, nicht die des Gesetzes
const ALTER_REF = { 2: [0.506, 0.82], 4: [0.593, 0.86], 6: [0.674, 0.89], 8: [0.744, 0.92], 10: [0.802, 0.94], 12: [0.866, 0.96], 14: [0.94, 0.98] }; // prettier-ignore
function alterWirt(T, K) {
    const W = { __koerperCore: K };
    const A = {
        _kernPflichtBruch: (w) => {
            throw new Error("KERN-PFLICHT " + w);
        },
        KOERPER_DIAL_MAP: K.DIAL_MAP,
        PLAYER_KH: K.LEIB.kopfM,
    };
    const r = {};
    for (const n of ["_rollGenome", "_rollHumanoidGenome", "_bewohnerJahre", "_bewohnerAbstand", "_dialsAusGenom"]) {
        const m = stammLib.methodeAm(T, n);
        r[n] = new Function("window", "AnazhRealm", `return function (${m.args}) {${m.rumpf}};`)(W, A);
    }
    return r;
}
function alterUrteil(T, K) {
    const r = alterWirt(T, K);
    const seed = 7300;
    const gestalten = [];
    for (let gi = 0; gi < 8; gi++) {
        const gen = r._rollHumanoidGenome(`${seed}:${gi}`, { jahr: ALTER_JAHR, gestalt: gi, von: 8 });
        gen.sex = K.alterGeschlecht(gi % 2 ? 0.75 + gen.sex * 0.25 : gen.sex * 0.25, gen.jahre);
        gestalten.push(gen);
    }
    const jahreG = (G) => 18 + 62 * G.alter;
    const leute = [];
    for (let h = 0; h < 420; h++) {
        const n = 1 + (h % 7);
        for (let k = 0; k < n; k++) {
            const gen = r._rollHumanoidGenome(`${seed}:${h}:${k}`, { jahr: ALTER_JAHR, rang: k, n });
            let best = 0;
            gestalten.forEach((G, gi) => {
                if (r._bewohnerAbstand(gen, G) < r._bewohnerAbstand(gen, gestalten[best])) best = gi;
            });
            leute.push({ gen, G: gestalten[best], seed: `${seed}:${h}:${k}` });
        }
    }
    const J = leute.map((b) => jahreG(b.G));
    const kinder = J.filter((x) => x < 15).length;
    const eigenKinder = leute.filter((b) => jahreG(b.gen) < 15).length;
    const kindInErwachsen = leute.filter((b) => jahreG(b.gen) < 15 && jahreG(b.G) >= 15).length;
    // der Wuchs am Dial: das Kind gegen den Erwachsenen desselben Samens (rang 0), je Alter der Referenz das nächste Kind
    const wuchs = [];
    for (const Jr of Object.keys(ALTER_REF).map(Number)) {
        const b = leute
            .filter((x) => jahreG(x.gen) < 15)
            .sort((x, y) => Math.abs(jahreG(x.gen) - Jr) - Math.abs(jahreG(y.gen) - Jr))[0];
        if (!b) continue;
        const Jb = jahreG(b.gen);
        const er = r._rollHumanoidGenome(b.seed, { jahr: ALTER_JAHR, rang: 0, n: 1 });
        const [dK, dE] = [r._dialsAusGenom(b.gen), r._dialsAusGenom(er)];
        const lo = Object.keys(ALTER_REF).map(Number).filter((x) => x <= Jb).pop() || 2;
        const hi = Object.keys(ALTER_REF).map(Number).find((x) => x >= Jb) || 14;
        const t = hi > lo ? (Jb - lo) / (hi - lo) : 0;
        const ref = [0, 1].map((i) => ALTER_REF[lo][i] + (ALTER_REF[hi][i] - ALTER_REF[lo][i]) * t);
        const hoehe = dK.height / dE.height;
        const kopf = (dK.height * dK.kopf) / (dE.height * dE.kopf);
        wuchs.push({ J: +Jb.toFixed(1), hoehe: +hoehe.toFixed(3), soll: +ref[0].toFixed(3), kopf: +kopf.toFixed(3), kopfSoll: +ref[1].toFixed(3) }); // prettier-ignore
    }
    const wuchsRot = wuchs.filter((w) => Math.abs(w.hoehe / w.soll - 1) > 0.06 || Math.abs(w.kopf / w.kopfSoll - 1) > 0.05);
    // der Leib-Raum der Menge: der Kopf jeder Kind-Gestalt liegt innen (kein Rand-Knoten)
    const ki = K.LEIB_RAUM.achsen.findIndex((a) => a.achse === "kopf");
    const rand = gestalten.filter((G) => {
        if (jahreG(G) >= 15) return false;
        const p = K.leibRaumPunkt(Object.assign({}, K.START_PARAMS, r._dialsAusGenom(G), { age: G.alter, haaransatz: G.haaransatz, hairVol: G.haarFuelle, hairStyle: G.schnitt }));
        return !(p[ki] < K.LEIB_RAUM.achsen[ki].knoten.length - 1);
    }).length;
    // die Reife: Kind-Gestalten unter 10 J tragen die Form keines Geschlechts (sex an der Mitte, koerper alterGeschlecht)
    const reifeRot = gestalten.filter((G) => jahreG(G) < 10 && Math.abs(G.sex - 0.5) > 0.06).map((G) => [+jahreG(G).toFixed(1), +G.sex.toFixed(3)]); // prettier-ignore
    // das Kind im Haus der Schmiede: um 10 Uhr spielt es am Ort seines Spiels (der Platz), nie an der Esse seines Hauses
    const orte = K.tagesOrte({ slots: [{ x: 0, z: 0, rolle: "schmiede" }, { x: 30, z: 0, rolle: "wohnhaus" }], platz: { cx: 15, cz: 20 } }); // prettier-ignore
    const B = K.tagesBindung(TC, 4242, "kind", 0, orte, null);
    const spielOrt = orte[B.werk] && orte[B.werk].art;
    const spiel = K.tagesPlan(4242, "kind", 10, { heim: { name: "heim" }, werk: { name: "werk" }, platz: { name: "platz" } }, 0);
    return {
        bewohner: leute.length,
        anteil: kinder / leute.length,
        eigen: eigenKinder / leute.length,
        kindInErwachsen,
        jung: Math.min(...J),
        alt: Math.max(...J),
        gestalten: gestalten.map((G) => +jahreG(G).toFixed(1)),
        wuchs,
        wuchsRot,
        rand,
        reifeRot,
        kindWerk: spielOrt === "platz" && spiel.akt === "spiel",
        spielAkt: `${spiel.akt} an ${spielOrt}`,
    };
}
function alterRot(u) {
    const rot = [];
    if (!(u.anteil >= 0.35))
        rot.push(`Anteil unter 15 J ${u.anteil.toFixed(3)} < 0,35 — Täter: stamm/koerper-leib.js _rollHumanoidGenome, das Alter nicht aus koerper epochenAlter (ALTER_GESETZ.pyramide)`); // prettier-ignore
    if (u.kindInErwachsen)
        rot.push(`${u.kindInErwachsen} Kinder in der Gestalt eines Erwachsenen — Täter: stamm/siedlung-bewohner.js _bewohnerAbstand ohne koerper alterAbstand (die Lebensphase)`); // prettier-ignore
    if (u.wuchsRot.length)
        rot.push(`Wuchs außer Band ${JSON.stringify(u.wuchsRot)} — Täter: koerper wuchs / alterLeib → _dialsAusGenom`);
    if (u.reifeRot.length)
        rot.push(`Kind-Gestalten unter 10 J mit der Form eines Geschlechts ${JSON.stringify(u.reifeRot)} (J, sex) — Täter: koerper alterGeschlecht / alterLeib (reife)`); // prettier-ignore
    if (u.rand) rot.push(`${u.rand} Kind-Gestalten am Rand des Kopf-Knotens der Menge — Täter: koerper LEIB_RAUM kopf`);
    if (!u.kindWerk) rot.push(`das Kind der Schmiede um 10 Uhr: ${u.spielAkt} — Täter: koerper tagesBindung / tagesPlan rollen.kind`);
    return rot;
}
const ALTER_STAMM = stammLib.text(path.join(__dirname, ".."));
const alterZeile = (u) =>
    `${u.bewohner} Bewohner der Epoche ${ALTER_JAHR}: unter 15 J ${(u.anteil * 100).toFixed(1)} % an der Gestalt (eigen ${(u.eigen * 100).toFixed(1)} %), Alter ${u.jung.toFixed(1)}–${u.alt.toFixed(1)} J, die Gestalten ${JSON.stringify(u.gestalten)}, Kinder in Erwachsenen-Gestalt ${u.kindInErwachsen}, Kind-Gestalten am Kopf-Rand der Menge ${u.rand}, Kind-Gestalten ohne Reife ${u.reifeRot.length}, Wuchs ${u.wuchs.map((w) => `${w.J} J ${w.hoehe}/${w.soll} Kopf ${w.kopf}/${w.kopfSoll}`).join(" · ")}`; // prettier-ignore

// ── DER AUSDRUCK DES LEIBS (Meisterkarte 2, Leiter mensch.leib.ausdruck S1 „Haltung nach Akt und Gemüt: der Prüfer errät Akt/Gemüt aus
// der Silhouette ≥ 60 %" und S2 „Gang nach Alter, Bau, Last, Verletzung: Lichtpunkt-Gang, Alter ± 15 J, verletzt ≥ 80 %"): das Gesetz
// koerper `leibAusdruck` (MOTION.arbeit, TAGES_GESETZ.haltung, AUSDRUCK_GESETZ), seine Leser der Takt (`leibGangTakt`: die Kadenz des
// Alters) und die Pose (`leibRigPose`: Beugung, die Haltung des Gemüts im Gang, Armschwung, die Standzeit je Bein, der Flug des
// Hüpfens), im Spiel der Wirt `_bewohnerAusdruck` → `_gaitTick` → `_animateHuman` (stamm/siedlung-bewohner.js, der nahe Bewohner) und
// das Tempo seines Tags (`_bewohnerGeburt`). DIE PROBE am echten Stamm (`ladeKlasse`): eine Siedlung (exportSettlement 0x51ed) mit
// 2000 Bewohnern (Genom, Gestalt, Stand des Ausdrucks), je Bewohner das Skelett seiner Gestalt aus dem Ofen in seiner Größe. ZWEI
// BLINDE PRÜFER lesen nur, was ein Zuschauer sieht:
//   S1 DIE SILHOUETTE (10 Erwachsene × morgen · arbeit · mittag · besuch · abend · spiel · Furcht nach Bedrohung; eingeschwungen): Rumpf
//      ≥ 20° vor dem Lot → arbeit (OWAS, Karhu 1977) · Kopf ≥ 10° gesenkt → müde · Kopf ≥ 8° gehoben → froh · Ellbogen ≥ 25° → Furcht ·
//      sonst ruhig. Soll: je Stand ≥ 0,6; im GANG (4 s, das Mittel der Silhouette) liest er müde und froh wie im Stand (Gross 2012).
//   S2 DER LICHTPUNKT-GANG (jeder fünfte Bewohner und jeder Lahme, 7 s; das Kind spielt, der Erwachsene geht zur Arbeit): das Alter aus
//      dem Hüpfen (Becken-Hub ≥ 0,08 Beinlängen → 8 J), der Größe (Bein unter 0,85 des Medians → die Wachstumskurve ALTER_REF) und der
//      Rumpf-Beugung im Gang (Zappalá 2021: 50 J + 40 J × Beugung ÷ 11,5°, ungebeugt 32 J) — Soll: der mittlere Fehler je Band (Kind,
//      Erwachsen, Alt) ≤ 15 J; verletzt aus dem Symmetrie-Index der Standdauer je Bein > 10 % (Robinson 1987) — Soll ≥ 0,8 der Lahmen
//      bei ≤ 0,1 Fehlalarm; das Kind (4–12 J) hüpft im Spiel ≥ 0,8. Dazu das TEMPO je Jahrzehnt ÷ Mitte 30–59 J im Band von Bohannon &
//      Andrews 2011 (± 0,10), das HINKEN über 60 J bei 17,4 % (Mahlknecht 2013, ± 8 Punkte) und DAS GLEITEN: Schlupf (das EINE Maß von
//      gate:tier-gang `SCHLUPF`: Weg des Stand-Fußes ÷ Weg des Leibs, Ferse und Ballen, Stand = die untersten 5 % der Beinlänge) ≤ 0,05.
// IST (1feab29, vor leib-ausdruck): arbeit 0/10 (der Rumpf 5,0°, pwalk), müde und froh im Gang 0/10 (Kopf 0,0°), das Alter der Alten
// 37,9 J daneben, das Kind hüpft 14/98, kein Lahmer, das Tempo 15–30 J 1,13 der Mitte (Bohannon 0,97), Schlupf 0,014.
// Täter (Selbsttest): die Arbeit in pwalk · das Gemüt nicht im Gang · das Alter ohne die Kurve (Tempo aus `lauf`) · kein Hinken ·
// kein Hüpfen · der Fußweg je Bein ohne seine Standzeit (der stehende Fuß gleitet) · der Wirt reicht den Ausdruck nicht → ROT an der Zeile.
const AUSDRUCK = { seed: 0x51ed, n: 2000, zehn: 10, dt: 1 / 60, je: 5, jeTaeter: [25, 3] };
const WUCHS = Object.keys(ALTER_REF).map((J) => [Number(J), ALTER_REF[J][0]]);
const BOHANNON = [[20, 30, 1.35], [30, 40, 1.385], [40, 50, 1.41], [50, 60, 1.37], [60, 70, 1.29], [70, 80, 1.195], [80, 120, 0.955]]; // prettier-ignore
const BOHANNON_MITTE = 1.39;
// der Kern mit einem Täter als Quelle (im Kontext des Stamms gerechnet) — null, wenn die Stelle fehlt
function kernQuelle(stelle, ersatz) {
    const src = fs.readFileSync(path.join(__dirname, "..", "koerper-core.js"), "utf8");
    const mut = src.replace(stelle, ersatz);
    return mut === src ? null : mut;
}
// o = {lade (der geladene Stamm, `ladeKlasse`), kern (die Quelle des Kerns mit einem Täter, im Kontext des Stamms gerechnet), je
// ([jeder wievielte geht im Lichtpunkt, jeder wievielte Lahme] — der Täter sieht weniger Geher)}
function ausdruckUrteil(o = {}) {
    const { AnazhRealm: A, ctx } = o.lade || stammLib.ladeKlasse(path.join(__dirname, ".."));
    if (o.kern) {
        new vm.Script(o.kern, { filename: "koerper-core.js" }).runInContext(ctx);
        A._leibTaktMemo = null;
    }
    const [K, T, TCx] = [ctx.__koerperCore, ctx.THREE, ctx.__tetrapodaCore];
    const r = Object.assign(Object.create(A.prototype), { state: { gravity: -9.81, speed: 0 } });
    r._foundry = { recipes: { [A.KOERPER_HOST_RECIPE]: { fx: { motion: { presets: K.MOTION } } } } };
    let furcht = 0;
    r._kreaturFurchtErinnert = () => furcht; // die erinnerte Bedrohung (Leser `_bewohnerGemuet`)
    const plan = ctx.__fachwerkCore.exportSettlement({ seed: AUSDRUCK.seed, nH: 12 });
    const N = AUSDRUCK.n;
    const liste = [...Array(N)].map((_, i) => ({
        seed: `${AUSDRUCK.seed}:${i >> 1}:${i & 1}`,
        epoche: { jahr: plan.jahr, rang: i & 1, n: 2 },
        same: (Math.imul(i + 1, 0x9e3779b1) ^ 0x5bd1e995) >>> 0,
        rolle: "wohnhaus",
        akt: "arbeit",
        lastKg: 0,
    }));
    const S = { plan, liste };
    S.gestalten = r._bewohnerGestalten(S);
    r._bewohnerGenome(S);
    const jahre = (b) => K.alterJahre(b.genom.alter);
    // das Skelett seiner Gestalt aus dem Ofen in seiner Größe (die Skala des Mensch-Baus, `_bewohnerGangPose`)
    const f = (8 * A.PLAYER_KH) / 6;
    const skelette = new Map();
    const rigVon = (b) => {
        const G = S.gestalten[b.gestalt];
        if (!skelette.has(G))
            skelette.set(G, ctx.BAKERS_BY_KIND.koerper(K, "mensch", 1, 0, { dials: G.dK }).userData.__skelett);
        const sk = skelette.get(G);
        const kn = {};
        for (const j of sk.joints) {
            const n = (kn[j.name] = new T.Object3D());
            [n.position.set(...j.pos), n.quaternion.set(...j.quat), n.scale.set(...j.scale)];
        }
        for (const j of sk.joints) if (kn[j.parent]) kn[j.parent].add(kn[j.name]);
        const wrap = new T.Group();
        wrap.scale.setScalar(f * (b.groesse || 1));
        wrap.add(kn[sk.root]);
        wrap.updateMatrixWorld(true);
        const rig = K.leibRig(kn);
        b.leib = { userData: { rig }, rotation: { x: 0 } };
        return Object.assign(rig, { _kn: kn, _wrap: wrap });
    };
    const v = new T.Vector3();
    const q = new T.Quaternion();
    const welt = (o2) => v.setFromMatrixPosition(o2.matrixWorld).toArray();
    const grad = (x) => (x * 180) / Math.PI;
    const silhouette = (rig) => {
        rig._wrap.updateMatrixWorld(true);
        const P = {};
        for (const n of ["arm1", "arm-1", "elbow1", "elbow-1", "hand1", "hand-1", "hip1", "hip-1"])
            P[n] = welt(rig._kn[n]);
        rig._kn.head.getWorldQuaternion(q);
        const auf = new T.Vector3(0, 1, 0).applyQuaternion(q);
        const mitte = (a, c) => a.map((x, i) => (x + c[i]) / 2);
        const [sh, hp] = [mitte(P.arm1, P["arm-1"]), mitte(P.hip1, P["hip-1"])];
        const ell = [1, -1].map((s) => {
            const [a, e, h] = [P["arm" + s], P["elbow" + s], P["hand" + s]];
            const [u, w] = [e.map((x, i) => x - a[i]), h.map((x, i) => x - e[i])];
            return grad(
                Math.acos(
                    Math.max(
                        -1,
                        Math.min(1, (u[0] * w[0] + u[1] * w[1] + u[2] * w[2]) / Math.hypot(...u) / Math.hypot(...w))
                    )
                )
            );
        });
        return {
            rumpf: grad(Math.atan2(sh[2] - hp[2], sh[1] - hp[1])),
            kopf: grad(Math.atan2(auf.z, auf.y)),
            ell: (ell[0] + ell[1]) / 2,
        };
    };
    const sieht = (s) =>
        s.rumpf >= 20 ? "arbeit" : s.kopf >= 10 ? "müde" : s.kopf <= -8 ? "froh" : s.ell >= 25 ? "Furcht" : "ruhig";
    const WAHR = {
        morgen: "ruhig",
        arbeit: "arbeit",
        mittag: "ruhig",
        besuch: "ruhig",
        abend: "müde",
        spiel: "froh",
        Furcht: "Furcht",
    };
    // EIN TAKT DES WIRTS (wie `_tickBewohner` den nahen Bewohner führt): sein Ausdruck, sein Gang-Tick, seine Pose
    const takt = (b, rig, tempo, dt, t) => {
        const gang = r._gaitTick(b.leib, b, tempo, dt, { ausdruck: r._bewohnerAusdruck(b) });
        r._animateHuman(b.leib, t, b.walkPhase || 0, tempo > 0, false, r._bewohnerGemuet(b), gang);
        return gang;
    };
    const tempoBand = (rig) => TCx.tempoEinheit(r._gaitBeinMass(rig).L) * K.TAGES_GESETZ.gang;
    // S1: die Silhouette im Stand und im Gang
    const stand = [];
    const gang = [];
    for (const b of liste.filter((x) => jahre(x) >= 18).slice(0, AUSDRUCK.zehn)) {
        const rig = rigVon(b);
        for (const akt of Object.keys(WAHR)) {
            [b.akt, furcht, b.walkPhase] = [akt === "Furcht" ? "arbeit" : akt, akt === "Furcht" ? 0.8 : 0, 0];
            K.leibRigEingeschwungen(rig);
            for (let k = 0; k < 30; k++) takt(b, rig, 0, 0.1, 3 + k * 0.1);
            stand.push({ akt, wahr: WAHR[akt], ...silhouette(rig) });
        }
        for (const akt of ["abend", "spiel"]) {
            [b.akt, furcht, b.walkPhase] = [akt, 0, 0];
            K.leibRigEingeschwungen(rig);
            const m = { rumpf: 0, kopf: 0, ell: 0 };
            for (let k = 0; k < 240; k++) {
                takt(b, rig, tempoBand(rig) * r._bewohnerAusdruck(b).tempo, AUSDRUCK.dt, k * AUSDRUCK.dt);
                if (k >= 60) for (const [x, y] of Object.entries(silhouette(rig))) m[x] += y / 180;
            }
            gang.push({ akt, wahr: WAHR[akt], ...m });
        }
    }
    const treffer = (X) => {
        const je = {};
        for (const x of X) (je[x.akt] ||= [0, 0])[sieht(x) === x.wahr ? 0 : 1]++;
        return Object.fromEntries(Object.entries(je).map(([k, [a, c]]) => [k, +(a / (a + c)).toFixed(2)]));
    };
    const mittel = (X, k) => +(X.reduce((a, x) => a + x[k], 0) / Math.max(1, X.length)).toFixed(1);
    // das Tempo je Jahrzehnt (das Bein seiner Gestalt × Größe, wie `_bewohnerGeburt`: Einheit × gang × Ausdruck)
    const beinG = new Map();
    const alle = liste.map((b) => {
        if (!beinG.has(b.gestalt)) beinG.set(b.gestalt, r._gaitBeinMass(rigVon({ gestalt: b.gestalt, groesse: 1 })).L);
        [b.leib, furcht] = [undefined, 0];
        const A2 = r._bewohnerAusdruck(b);
        return { b, J: jahre(b), v: TCx.tempoEinheit(beinG.get(b.gestalt) * b.groesse) * K.TAGES_GESETZ.gang * A2.tempo, wunde: A2.wunde }; // prettier-ignore
    });
    const mw = (X) => X.reduce((a, x) => a + x.v, 0) / Math.max(1, X.length);
    const imBand = (lo, hi) => alle.filter((x) => x.J >= lo && x.J < hi);
    const vMitte = mw(imBand(30, 60));
    const tempo = BOHANNON.map(([lo, hi, ms]) => {
        const X = imBand(lo, hi);
        return {
            band: `${lo}–${hi}`,
            n: X.length,
            ist: +(mw(X) / vMitte).toFixed(3),
            soll: +(ms / BOHANNON_MITTE).toFixed(3),
        };
    }).filter((x) => x.n >= 5);
    const alt = alle.filter((x) => x.J >= 60);
    const hinken60 = alt.filter((x) => x.wunde > 0).length / Math.max(1, alt.length);
    // S2: der Lichtpunkt-Gang — je Bein Ferse und Ballen (gate:tier-gang LEIB), der tiefere trägt
    const lichtpunkt = (b) => {
        const rig = rigVon(b);
        const tempoB = tempoBand(rig) * r._bewohnerAusdruck(b).tempo;
        [b.walkPhase, furcht] = [0, 0];
        K.leibRigEingeschwungen(rig);
        const M = r._gaitBeinMass(rig);
        const Z = r._gangZeile(true);
        const ballen = Z && Z.ballen > 0 ? Z.ballen * TCx.gangReich(M.l1 + M.l2) : 0;
        const kn = [rig.legL.ankle, rig.legR.ankle];
        const lokal = kn.map((a) => {
            const w = new T.Vector3().setFromMatrixPosition(a.matrixWorld);
            w.y = 0;
            const p = a.worldToLocal(w.clone());
            return [p, p.clone().add(new T.Vector3(0, 0, ballen))];
        });
        const [spur, leib, huefte, rumpf] = [[[], []], [], [], []];
        for (let k = 0; k < 480; k++) {
            rig._wrap.position.z += tempoB * AUSDRUCK.dt;
            takt(b, rig, tempoB, AUSDRUCK.dt, k * AUSDRUCK.dt);
            rig._wrap.updateMatrixWorld(true);
            for (let i = 0; i < 2; i++) spur[i].push(lokal[i].map((p) => p.clone().applyMatrix4(kn[i].matrixWorld)));
            leib.push(rig._wrap.position.z);
            if (k < 60) continue;
            huefte.push(welt(rig.hips)[1]);
            rumpf.push(silhouette(rig).rumpf);
        }
        let [wegFuss, wegLeib, staende] = [0, 0, 0];
        const dauer = spur.map((sp) => {
            let ymin = Infinity;
            for (let i = 60; i < sp.length; i++) ymin = Math.min(ymin, sp[i][0].y, sp[i][1].y);
            const lo = ymin + 0.05 * M.L;
            const d = [];
            let n = 0;
            for (let i = 61; i < sp.length; i++) {
                const k = sp[i][1].y < sp[i][0].y - 1e-4 ? 1 : 0;
                const [a, c] = [sp[i - 1][k], sp[i][k]];
                if (a.y <= lo && c.y <= lo) [wegFuss, wegLeib] = [wegFuss + Math.hypot(c.x - a.x, c.z - a.z), wegLeib + leib[i] - leib[i - 1]]; // prettier-ignore
                if (Math.min(sp[i][0].y, sp[i][1].y) <= lo) n++;
                else if (n) [n] = [0, d.push(n)];
            }
            staende += d.length;
            if (Math.min(sp[61][0].y, sp[61][1].y) <= lo) d.shift(); // der angeschnittene erste Stand
            return d.length ? d.reduce((a, c) => a + c, 0) / d.length : 0;
        });
        const si = dauer[0] + dauer[1] > 0 ? Math.abs(dauer[0] - dauer[1]) / ((dauer[0] + dauer[1]) / 2) : 0;
        return {
            J: jahre(b),
            L: M.L,
            wunde: b.ausdruck.wunde,
            hub: (Math.max(...huefte) - Math.min(...huefte)) / M.L,
            rumpf: rumpf.reduce((a, c) => a + c, 0) / rumpf.length,
            si,
            wegFuss,
            wegLeib,
            staende,
        };
    };
    const [je, jeLahm] = o.je || [AUSDRUCK.je, 1];
    const wahl = alle.filter((x, i) => i % je === 0 || (x.wunde > 0 && i % jeLahm === 0));
    const LP = wahl.map((x) => {
        [x.b.akt, x.b.rolle] = x.J < 15 ? ["spiel", "kind"] : ["arbeit", "wohnhaus"];
        return lichtpunkt(x.b);
    });
    const Lmed = LP.map((x) => x.L).sort((a, c) => a - c)[LP.length >> 1];
    const wuchsJ = (h) => {
        for (let i = 1; i < WUCHS.length; i++)
            if (h <= WUCHS[i][1]) return WUCHS[i - 1][0] + ((WUCHS[i][0] - WUCHS[i - 1][0]) * (h - WUCHS[i - 1][1])) / (WUCHS[i][1] - WUCHS[i - 1][1]); // prettier-ignore
        return WUCHS[WUCHS.length - 1][0];
    };
    const schaetzt = (x) => (x.hub >= 0.08 ? 8 : x.L / Lmed < 0.85 ? Math.max(2, wuchsJ(x.L / Lmed)) : x.rumpf < 0.5 ? 32 : 50 + 40 * Math.min(1, x.rumpf / 11.5)); // prettier-ignore
    const alter = Object.entries({ Kind: [0, 15], Erwachsen: [15, 60], Alt: [60, 200] }).map(([band, [lo, hi]]) => {
        const e = LP.filter((x) => x.J >= lo && x.J < hi).map((x) => Math.abs(schaetzt(x) - x.J));
        return { band, n: e.length, mae: +(e.reduce((a, c) => a + c, 0) / Math.max(1, e.length)).toFixed(1) };
    });
    const kinder = LP.filter((x) => x.J >= 4 && x.J <= 12);
    const [lahm, heil] = [LP.filter((x) => x.wunde > 0), LP.filter((x) => !(x.wunde > 0))];
    const sum = (k) => LP.reduce((a, x) => a + x[k], 0);
    return {
        stand: treffer(stand),
        standMittel: Object.fromEntries(Object.keys(WAHR).map((k) => [k, [mittel(stand.filter((x) => x.akt === k), "rumpf"), mittel(stand.filter((x) => x.akt === k), "kopf")]])), // prettier-ignore
        gang: treffer(gang),
        kopfGang: [
            mittel(
                gang.filter((x) => x.akt === "abend"),
                "kopf"
            ),
            mittel(
                gang.filter((x) => x.akt === "spiel"),
                "kopf"
            ),
        ],
        tempo,
        hinken60: +hinken60.toFixed(3),
        alt: alt.length,
        geher: LP.length,
        alter,
        huepft: +(kinder.filter((x) => x.hub >= 0.08).length / Math.max(1, kinder.length)).toFixed(2),
        kinder: kinder.length,
        lahm: lahm.length,
        erkannt: +(lahm.filter((x) => x.si > 0.1).length / Math.max(1, lahm.length)).toFixed(2),
        fehlalarm: +(heil.filter((x) => x.si > 0.1).length / Math.max(1, heil.length)).toFixed(3),
        schlupf: +(sum("wegFuss") / Math.max(1e-9, sum("wegLeib"))).toFixed(4),
        gleitCm: +((100 * sum("wegFuss")) / Math.max(1, sum("staende"))).toFixed(2),
    };
}
function ausdruckRot(u) {
    const rot = [];
    for (const [k, t] of Object.entries(u.stand))
        if (!(t >= 0.6)) rot.push(`S1 Silhouette ${k} ${t} < 0,6 (Rumpf ${u.standMittel[k][0]}°, Kopf ${u.standMittel[k][1]}°) — Täter: koerper MOTION.arbeit / TAGES_GESETZ.haltung`); // prettier-ignore
    for (const [k, t] of Object.entries(u.gang))
        if (!(t >= 0.6)) rot.push(`S1 im Gang ${k} ${t} < 0,6 (Kopf müde ${u.kopfGang[0]}° gegen froh ${u.kopfGang[1]}°) — Täter: koerper AUSDRUCK_GESETZ.gang / leibRigPose (das Gemüt im Gang)`); // prettier-ignore
    const tempoRot = u.tempo.filter((x) => Math.abs(x.ist - x.soll) > 0.1);
    if (tempoRot.length) rot.push(`S2 Tempo je Jahrzehnt außer Bohannon ± 0,10: ${tempoRot.map((x) => `${x.band} J ${x.ist}/${x.soll}`).join(" · ")} — Täter: koerper AUSDRUCK_GESETZ.alter / leibAusdruck tempo`); // prettier-ignore
    if (Math.abs(u.hinken60 - 0.174) > 0.08) rot.push(`S2 Hinken über 60 J ${u.hinken60} außer 0,174 ± 0,08 (Mahlknecht 2013) — Täter: koerper AUSDRUCK_GESETZ.wunde`); // prettier-ignore
    const alterRot = u.alter.filter((x) => !(x.mae <= 15));
    if (alterRot.length) rot.push(`S2 Lichtpunkt-Alter daneben: ${alterRot.map((x) => `${x.band} ${x.mae} J`).join(" · ")} (Soll ≤ 15 J) — Täter: koerper AUSDRUCK_GESETZ (kind, alter.beugeJ)`); // prettier-ignore
    if (!(u.huepft >= 0.8)) rot.push(`S2 das Kind hüpft ${u.huepft} von ${u.kinder} < 0,8 — Täter: koerper AUSDRUCK_GESETZ.kind / der Flug in leibRigPose`); // prettier-ignore
    if (!(u.lahm > 0 && u.erkannt >= 0.8 && u.fehlalarm <= 0.1)) rot.push(`S2 verletzt erkannt ${u.erkannt} von ${u.lahm} Lahmen (Soll ≥ 0,8), Fehlalarm ${u.fehlalarm} (≤ 0,1) — Täter: koerper AUSDRUCK_GESETZ.wunde / die Standzeit je Bein`); // prettier-ignore
    if (!(u.schlupf <= 0.05)) rot.push(`S2 der Fuß gleitet: Schlupf ${u.schlupf} > 0,05 (${u.gleitCm} cm je Stand) — Täter: koerper leibRigPose (der Fußweg je Bein) / leibAusdruckSchritt`); // prettier-ignore
    return rot;
}
const ausdruckZeile = (u) =>
    `Silhouette ${JSON.stringify(u.stand)} · im Gang ${JSON.stringify(u.gang)} (Kopf müde ${u.kopfGang[0]}° / froh ${u.kopfGang[1]}°) · Tempo ÷ Mitte ${u.tempo.map((x) => `${x.band} ${x.ist}/${x.soll}`).join(" ")} · Hinken über 60 J ${u.hinken60} (n ${u.alt}) · Lichtpunkt ${u.geher} Geher: Alter-MAE ${u.alter.map((x) => `${x.band} ${x.mae} J (n ${x.n})`).join(" ")}, das Kind hüpft ${u.huepft} (n ${u.kinder}), verletzt ${u.erkannt} (n ${u.lahm}, Fehlalarm ${u.fehlalarm}), Schlupf ${u.schlupf} (${u.gleitCm} cm je Stand)`; // prettier-ignore

if (SELBSTTEST) {
    let fails = 0;
    // DIE TÄTER DES ALTERS: der Stamm mit dem Alter von vorher, der Kern ohne Lebensphase, der Kern ohne Wuchs der Höhe
    const kernMit = kernMitTaeter;
    const taeter = [
        ["das Alter 0,05–0,5 wie vorher", stammLib.ersetze(ALTER_STAMM, "_rollHumanoidGenome", "const J = this._bewohnerJahre(g, epoche);", 'const J = 18 + 62 * g.range("alter", 0.05, 0.5);'), KC, /Anteil unter 15 J/], // prettier-ignore
        ["die Wahl ohne Lebensphase", ALTER_STAMM, kernMit(/if \(Ja < A\.kindJ !== Jt < A\.kindJ\) return d \+ A\.phase;\n[^\n]*\n/, ""), /Erwachsenen/], // prettier-ignore
        ["der Wuchs ohne Höhe", ALTER_STAMM, kernMit(/g\.kh \*= w\.hoehe;/, ""), /Wuchs außer Band/],
        ["das Kind ohne Reife", ALTER_STAMM, kernMit(/return J < ALTER_GESETZ\.erwachsenJ \? 0\.5 \+ \(s - 0\.5\) \* wuchs\(J\)\.reife : s;/, "return s;"), /Form eines Geschlechts/], // prettier-ignore
        ["das Spiel vor der eigenen Tür", ALTER_STAMM, kernMit(/R\.spiel \? wahl\("spiel", H, "werk", null\)/, "R.spiel ? heimI"), /das Kind der Schmiede/], // prettier-ignore
    ];
    for (const [name, T, K, soll] of taeter) {
        if (!K || (T === ALTER_STAMM && K === KC)) {
            console.log(`⛔ Selbsttest: der Täter „${name}“ ließ sich nicht setzen`);
            fails++;
            continue;
        }
        const rot = alterRot(alterUrteil(T, K));
        console.log(`[Selbsttest] Täter ${name}: ${rot.length ? "ROT — " + rot.join(" · ").slice(0, 160) : "GRÜN"}`);
        if (!rot.some((x) => soll.test(x))) {
            console.log(`⛔ Selbsttest: der Täter „${name}“ blieb an seiner Stelle GRÜN`);
            fails++;
        }
    }
    for (const t of TAETER) {
        const M = kernMitTaeter(t.stelle, t.ersatz);
        if (!M) {
            console.log(`⛔ Selbsttest: der Täter „${t.name}“ ließ sich nicht setzen (die Stelle fehlt im Kern)`);
            fails++;
            continue;
        }
        const rot = rotVon(urteil(M, zugVon));
        console.log(`[Selbsttest] Täter ${t.name}: ${rot.join(" · ") || "GRÜN"}`);
        if (!rot.some((r) => t.faellt.test(r))) {
            console.log(`⛔ Selbsttest: der Täter „${t.name}“ fiel nicht an seiner Zeile (${t.faellt})`);
            fails++;
        }
    }
    // DIE TÄTER DES AUSDRUCKS: der Kern mit einer getauschten Stelle im Kontext EINES geladenen Stamms, der Wirt mit seinem Glied
    const lade = stammLib.ladeKlasse(path.join(__dirname, ".."));
    const wirt = (datei, alt, neu) => {
        const teile = stammLib.teileVon(path.join(__dirname, ".."));
        const t = teile.find((x) => x.pfad === datei);
        if (!t || !t.text.includes(alt)) return null;
        t.text = t.text.replace(alt, neu);
        return stammLib.ladeKlasse(path.join(__dirname, ".."), { teile });
    };
    const ausdruckTaeter = [
        ["die Arbeit in pwalk (der Stand vor S1)", { kern: kernQuelle('haltung: Object.freeze({ arbeit: "arbeit",', 'haltung: Object.freeze({ arbeit: "pwalk",') }, /S1 Silhouette arbeit/], // prettier-ignore
        ["das Gemüt nicht im Gang", { kern: kernQuelle("gang: gm ? gm.haltung : 0,", "gang: 0,") }, /S1 im Gang/],
        ["das Tempo aus `lauf` (das Alter ohne die Kurve)", { kern: kernQuelle("tempo: tJ * bau * (wunde ? G.wunde.tempo : 1),", "tempo: (s.dials ? leibKoennen(s.dials).lauf : 1) * (wunde ? G.wunde.tempo : 1),") }, /S2 Tempo je Jahrzehnt/], // prettier-ignore
        ["kein Hinken", { kern: kernQuelle('if (_tagZahl(same, "hinken") < _ausdruckTafel(G.wunde.J, G.wunde.p, J))', "if (false)") }, /S2 verletzt erkannt/], // prettier-ignore
        ["kein Hüpfen", { kern: kernQuelle("hf = J >= G.kind.J[0] && J <= G.kind.J[1] && s.profil === G.kind.profil ? G.kind.tast : 0,", "hf = 0,") }, /das Kind hüpft/], // prettier-ignore
        ["der Fußweg ohne die Standzeit des Beins", { kern: kernQuelle("var FL = TC.gangFuss(walkPhase, (Sl * tL) / tast, tL, Z, R);", "var FL = TC.gangFuss(walkPhase, Sl, tL, Z, R);") }, /der Fuß gleitet/], // prettier-ignore
        ["der Wirt reicht den Ausdruck nicht (`_gaitTick`)", { lade: wirt("stamm/koerper-leib.js", "(opts && opts.ausdruck) || null", "null") }, /S1 im Gang/], // prettier-ignore
    ];
    for (const [name, o, soll] of ausdruckTaeter) {
        if (!(o.kern || o.lade)) {
            console.log(`⛔ Selbsttest: der Täter „${name}“ ließ sich nicht setzen (die Stelle fehlt)`);
            fails++;
            continue;
        }
        const rot = ausdruckRot(ausdruckUrteil({ lade: o.lade || lade, kern: o.kern, je: AUSDRUCK.jeTaeter }));
        console.log(`[Selbsttest] Täter ${name}: ${rot.length ? "ROT — " + rot.join(" · ").slice(0, 200) : "GRÜN"}`);
        if (!rot.some((x) => soll.test(x))) {
            console.log(`⛔ Selbsttest: der Täter „${name}“ blieb an seiner Zeile GRÜN (${soll})`);
            fails++;
        }
    }
    urteilEnde(fails, "❌ ROT — die Linse ist blind.", `✅ Selbsttest: alle ${TAETER.length} Täter des Zugs, die ${taeter.length} des Alters (Alter wie vorher, Wahl ohne Lebensphase, Wuchs ohne Höhe, Kind ohne Reife, Spiel vor der Tür) und die ${ausdruckTaeter.length} des Ausdrucks (Arbeit in pwalk, Gemüt nicht im Gang, Tempo aus lauf, kein Hinken, kein Hüpfen, Fußweg ohne Standzeit, Wirt ohne Ausdruck) fallen ROT an ihrer Zeile.`);
}

const a = urteil(KC, zugVon);
const b = urteil(KC, zugVon);
const gleich = JSON.stringify(a.leute.map((P) => P.worte)) === JSON.stringify(b.leute.map((P) => P.worte));
console.log(`  ZÜGE ${zeile(a)}`);
console.log(`  Treffer erste 20: ${a.t20.toFixed(2)} · alle 100: ${a.t100.toFixed(2)} · bit-gleich: ${gleich}`);
const rot = rotVon(a);
if (!gleich) rot.push("zwei Läufe, verschiedene Worte (der Tag ist nicht rein)");
if (rot.length) rot.push("Täter: koerper TAGES_GESETZ.zuege / tagesPlan / tagesBindung");
const al = alterUrteil(ALTER_STAMM, KC);
console.log(`  ALTER ${alterZeile(al)}`);
rot.push(...alterRot(al));
const au = ausdruckUrteil();
console.log(`  AUSDRUCK ${ausdruckZeile(au)}`);
rot.push(...ausdruckRot(au));
urteilEnde(
    rot.length,
    `❌ ROT — ${rot.join(" · ")}`,
    `✅ DER ZUG ÄNDERT DEN TAG — ${a.t20.toFixed(2)} der ersten 20 und ${a.t100.toFixed(2)} aller 100 blind ihrem Zug zugeordnet, jeder Zug ≥ 0,6, bit-gleich · DAS ALTER DER EPOCHE — ${(al.anteil * 100).toFixed(1)} % unter 15 J (≥ 35 %), kein Kind in Erwachsenen-Gestalt, der Wuchs im Band · DER AUSDRUCK — Silhouette je Stand ≥ 0,6 (arbeit ${au.stand.arbeit}, Furcht ${au.stand.Furcht}), müde/froh im Gang (Kopf ${au.kopfGang[0]}° / ${au.kopfGang[1]}°), Lichtpunkt-Alter ${au.alter.map((x) => x.mae).join("/")} J, das Kind hüpft ${au.huepft}, verletzt ${au.erkannt}, Schlupf ${au.schlupf}`
);
