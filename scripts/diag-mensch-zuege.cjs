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
// alle 100; bit-gleich (zwei Läufe, dasselbe Wort je Same und Stunde). JE ZUG (mensch-zahlen): jeder der vier Züge wird zu
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

if (SELBSTTEST) {
    let fails = 0;
    for (const t of TAETER) {
        const M = kernMitTaeter(t.stelle, t.ersatz);
        if (!M) {
            console.log(`⛔ Selbsttest: der Täter „${t.name}“ ließ sich nicht setzen (die Stelle fehlt im Kern)`);
            fails++;
            continue;
        }
        const rot = rotVon(urteil(M, zugVon));
        console.log(`  Täter ${t.name}: ${rot.join(" · ") || "GRÜN"}`);
        if (!rot.some((r) => t.faellt.test(r))) {
            console.log(`⛔ Selbsttest: der Täter „${t.name}“ fiel nicht an seiner Zeile (${t.faellt})`);
            fails++;
        }
    }
    urteilEnde(fails, "❌ ROT — die Linse ist blind.", `✅ Selbsttest: alle ${TAETER.length} Täter fallen ROT an ihrer Zeile.`);
}

const a = urteil(KC, zugVon);
const b = urteil(KC, zugVon);
const gleich = JSON.stringify(a.leute.map((P) => P.worte)) === JSON.stringify(b.leute.map((P) => P.worte));
console.log(`  ZÜGE ${zeile(a)}`);
console.log(`  Treffer erste 20: ${a.t20.toFixed(2)} · alle 100: ${a.t100.toFixed(2)} · bit-gleich: ${gleich}`);
const rot = rotVon(a);
if (!gleich) rot.push("zwei Läufe, verschiedene Worte (der Tag ist nicht rein)");
urteilEnde(
    rot.length,
    `❌ ROT — der Zug ist am Tag nicht erkennbar: ${rot.join(" · ")} — Täter: koerper TAGES_GESETZ.zuege / tagesPlan / tagesBindung`,
    `✅ DER ZUG ÄNDERT DEN TAG — ${a.t20.toFixed(2)} der ersten 20 und ${a.t100.toFixed(2)} aller 100 blind ihrem Zug zugeordnet, jeder Zug ≥ 0,6, bit-gleich`
);
