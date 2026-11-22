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
// alle 100; bit-gleich (zwei Läufe, dasselbe Wort je Same und Stunde). Dazu ALTER (generationen S1, unten). Täter: `tagesZug` →
// immer „ausgeglichen" (der Stand vor dem Zug: der Same verschob jede Wende nur um ±streuH) fällt ROT.
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
            leute.push({ same, rolle, worte });
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

// DER KERN MIT DEM TÄTER: dieselbe Quelle, `tagesZug` liefert immer „ausgeglichen" (frischer Kontext)
function kernMitTaeter() {
    const src = fs.readFileSync(path.join(__dirname, "..", "koerper-core.js"), "utf8");
    const mut = src.replace(
        /function tagesZug\(same\) \{/,
        'function tagesZug(same) {\n        return "ausgeglichen";'
    );
    if (mut === src) return null;
    const ctx = vm.createContext({ console });
    vm.runInContext(mut, ctx);
    return ctx.__koerperCore;
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
// Band der Wachstumskurve (±6 %), der Kopf (height · kopf) im Band ±5 %; der Punkt des Kinds im Leib-Raum der Menge trägt seinen
// Kopf (kein Knoten-Rand); das Kind im Haus der Schmiede spielt um 10 Uhr (Akt „spiel", Werk daheim), nie „arbeit".
// Täter (Selbsttest): das Alter wie vor generationen-band (0,05–0,5 auf dem Regler) → ROT am Anteil; die Wahl ohne die Lebensphase
// (der Abstand im Regler allein) → ROT an der Gestalt; der Wuchs ohne Höhe → ROT an der Körperhöhe.
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
        gen.sex = gi % 2 ? 0.75 + gen.sex * 0.25 : gen.sex * 0.25;
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
    // das Kind im Haus der Schmiede: um 10 Uhr spielt es daheim
    const orte = K.tagesOrte({ slots: [{ x: 0, z: 0, rolle: "schmiede" }, { x: 30, z: 0, rolle: "wohnhaus" }], platz: { cx: 15, cz: 20 } }); // prettier-ignore
    const B = K.tagesBindung(TC, 4242, "kind", 0, orte, null);
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
        kindWerk: B.werk === 0 && spiel.akt === "spiel",
        spielAkt: spiel.akt,
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
    if (u.rand) rot.push(`${u.rand} Kind-Gestalten am Rand des Kopf-Knotens der Menge — Täter: koerper LEIB_RAUM kopf`);
    if (!u.kindWerk) rot.push(`das Kind der Schmiede um 10 Uhr: ${u.spielAkt} — Täter: koerper tagesBindung / tagesPlan rollen.kind`);
    return rot;
}
const ALTER_STAMM = stammLib.text(path.join(__dirname, ".."));
const alterZeile = (u) =>
    `${u.bewohner} Bewohner der Epoche ${ALTER_JAHR}: unter 15 J ${(u.anteil * 100).toFixed(1)} % an der Gestalt (eigen ${(u.eigen * 100).toFixed(1)} %), Alter ${u.jung.toFixed(1)}–${u.alt.toFixed(1)} J, die Gestalten ${JSON.stringify(u.gestalten)}, Kinder in Erwachsenen-Gestalt ${u.kindInErwachsen}, Wuchs ${u.wuchs.map((w) => `${w.J} J ${w.hoehe}/${w.soll} Kopf ${w.kopf}/${w.kopfSoll}`).join(" · ")}`; // prettier-ignore

if (SELBSTTEST) {
    const M = kernMitTaeter();
    let fails = 0;
    // DIE TÄTER DES ALTERS: der Stamm mit dem Alter von vorher, der Kern ohne Lebensphase, der Kern ohne Wuchs der Höhe
    const kernMit = (re, neu) => {
        const src = fs.readFileSync(path.join(__dirname, "..", "koerper-core.js"), "utf8");
        const mut = src.replace(re, neu);
        if (mut === src) return null;
        const ctx = vm.createContext({ console });
        vm.runInContext(mut, ctx);
        return ctx.__koerperCore;
    };
    const taeter = [
        ["das Alter 0,05–0,5 wie vorher", ALTER_STAMM.replace("const J = this._bewohnerJahre(g, epoche);", 'const J = 18 + 62 * g.range("alter", 0.05, 0.5);'), KC, /Anteil unter 15 J/], // prettier-ignore
        ["die Wahl ohne Lebensphase", ALTER_STAMM, kernMit(/if \(Ja < A\.kindJ !== Jt < A\.kindJ\) return d \+ A\.phase;\n[^\n]*\n/, ""), /Erwachsenen/], // prettier-ignore
        ["der Wuchs ohne Höhe", ALTER_STAMM, kernMit(/g\.kh \*= w\.hoehe;/, ""), /Wuchs außer Band/],
    ];
    for (const [name, T, K, soll] of taeter) {
        if (T === ALTER_STAMM && K === KC) {
            console.log(`⛔ Selbsttest: der Täter „${name}“ ließ sich nicht setzen`);
            fails++;
            continue;
        }
        if (!K || (name.startsWith("das Alter") && T === ALTER_STAMM)) {
            console.log(`⛔ Selbsttest: der Täter „${name}“ ließ sich nicht setzen`);
            fails++;
            continue;
        }
        const rot = alterRot(alterUrteil(T, K));
        console.log(`  Täter ${name}: ${rot.length ? "ROT — " + rot.join(" · ").slice(0, 160) : "GRÜN"}`);
        if (!rot.some((x) => soll.test(x))) {
            console.log(`⛔ Selbsttest: der Täter „${name}“ blieb an seiner Stelle GRÜN`);
            fails++;
        }
    }
    if (!M) {
        console.log("⛔ Selbsttest: der Täter ließ sich nicht setzen (tagesZug fehlt im Kern)");
        fails++;
    } else {
        const u = urteil(M, zugVon);
        console.log(`  Täter tagesZug → ausgeglichen: Treffer ${u.t20.toFixed(2)} / ${u.t100.toFixed(2)}`);
        if (u.t20 >= 0.6 || u.t100 >= 0.6) {
            console.log("⛔ Selbsttest: der Täter (kein Zug ändert den Tag) blieb GRÜN");
            fails++;
        }
    }
    urteilEnde(fails, "❌ ROT — die Linse ist blind.", "✅ Selbsttest: der Täter „tagesZug → ausgeglichen“ fällt ROT, die drei Täter des Alters (Alter wie vorher, Wahl ohne Lebensphase, Wuchs ohne Höhe) fallen ROT an ihrer Stelle.");
}

const a = urteil(KC, zugVon);
const b = urteil(KC, zugVon);
const gleich = JSON.stringify(a.leute.map((P) => P.worte)) === JSON.stringify(b.leute.map((P) => P.worte));
console.log(`  ZÜGE ${zeile(a)}`);
console.log(`  Treffer erste 20: ${a.t20.toFixed(2)} · alle 100: ${a.t100.toFixed(2)} · bit-gleich: ${gleich}`);
const rot = [];
if (a.t20 < 0.6) rot.push(`erste 20 ${a.t20.toFixed(2)} < 0,6`);
if (a.t100 < 0.6) rot.push(`alle 100 ${a.t100.toFixed(2)} < 0,6`);
if (!gleich) rot.push("zwei Läufe, verschiedene Worte (der Tag ist nicht rein)");
if (rot.length) rot.push("Täter: koerper TAGES_GESETZ.zuege / tagesPlan / tagesBindung");
const al = alterUrteil(ALTER_STAMM, KC);
console.log(`  ALTER ${alterZeile(al)}`);
rot.push(...alterRot(al));
urteilEnde(
    rot.length,
    `❌ ROT — ${rot.join(" · ")}`,
    `✅ DER ZUG ÄNDERT DEN TAG — ${a.t20.toFixed(2)} der ersten 20 und ${a.t100.toFixed(2)} aller 100 blind ihrem Zug zugeordnet, bit-gleich · DAS ALTER DER EPOCHE — ${(al.anteil * 100).toFixed(1)} % unter 15 J (≥ 35 %), kein Kind in Erwachsenen-Gestalt, der Wuchs im Band`
);
