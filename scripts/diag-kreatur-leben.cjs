#!/usr/bin/env node
// gate:kreatur-leben — DIE LEBENS-LINSE (Klasse: „tote reisende Daten").
//
// V18.476 reiste das tetrapoda-hunt-Preset ins Buch — und KEIN Pfad wählte es
// je. Diese
// Linse hält die Klasse tot:
//   A) DECKUNG — jede Verhaltens-Aktion/Stimmung des Kerns zeigt auf EXISTIERENDE
//      Aktionen, die Seelen-Blöcke reisen im Buch (kein toter Verweis).
//   B) SELBST-TEST — eine injizierte tote Stimmungs-Aktion wird erkannt.
// Den Konsum im Stamm (Zustand-Stempel, Baum-Gang, Biss, Sprung, Herde) beweisen die Bänder mit Welt am
// Verhalten (gate:kreatur-takt, gate:kampf-gefuehl); hier liest keine Probe Quelltext (D3c).
// DAS LEBEN AM ECHTEN TAKT: die Lebens-Proben (furcht) sind ein Stück der Seiten-Funktion der Kreatur-Proben
// (scripts/lib/kreatur-proben.cjs setzt `BUEHNEN` an ihre Marke, gate:kreatur-takt fährt sie headless und im Fenster).
"use strict";

// ── furcht: EIN Furcht-Gesetz (Ökologie K3, tetrapoda FURCHT_GESETZ) am ECHTEN Takt. (A) DAS WESEN ERINNERT: je Ort und Rolle
// ein Tier allein — geschlagen (`damageCreature`, Quelle player), gefüttert (`activateCreatureConsumable`), gebunden, zur
// Kontrolle; der Bär vor der Aura des Spielers: ruhig, zornig, zornig im frieden. Die Kampf-Furcht verblasst fern vom
// Spieler, das Tier reist über den Speicherstand (`_serializeCreature` → `_restoreCreatureFromSnapshot`), dann kommt der
// Spieler im Gehen bis 8 m heran und steht 25 s: der Median des Abstands je Rolle. (B) DER ORT ERINNERT: ein Kahlwild-Rudel
// um seinen Wurf-Ort, in dessen Mitte ein Hirsch fällt (der Riss, Quelle jagd) — sein Aufenthalt in der Zelle über 90 s
// gegen den Gegenlauf ohne Feld-Furcht ──
async function lebenBuehnen(buehne, taeter, decke, r, s, A, pm, frei, land, tier, ruhig, ruhigSpieler, takt, quantil) {
    await buehne("furcht", async (restore) => {
        if (taeter === "furcht-gedaechtnis") decke(restore, "_kreaturFurchtErinnert", () => () => 0);
        if (taeter === "furcht-ort") decke(restore, "_kreaturFurchtOrt", () => (c, NAT, von, w) => w);
        if (taeter === "furcht-speicher")
            decke(restore, "_serializeCreature", (alt) => (c) => Object.assign(alt.call(r, c), { memory: [] }));
        if (taeter === "furcht-aura") {
            const F = A._furchtGesetz();
            A._furchtGesetzMemo = Object.freeze(Object.assign({}, F, { bedrohung: () => 0 }));
            restore.push(() => (A._furchtGesetzMemo = F));
        }
        const dt = 1 / 60;
        const boden = (x, z) => r.getTerrainHeightAt(x, z) + 0.5;
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
        };
        const erinnert = {};
        for (const [rolle, [seele, e, modus]] of Object.entries(rollen)) {
            const R = { abstand: [], naeher: [], erinnerungen: [] };
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
                    throw new Error("die Gabe trägt nicht");
                pm.set(ort.x + 150, boden(ort.x + 150, ort.z), ort.z);
                lauf(1200);
                const snap = JSON.parse(JSON.stringify(r._serializeCreature(c0)));
                r.removeCreature(c0);
                const c = r._restoreCreatureFromSnapshot(snap);
                ruhig(c);
                if (rolle === "gebunden") c.userData.bond = 1;
                R.erinnerungen.push((c.userData.memory || []).length);
                pm.set(c.position.x + 30, boden(c.position.x + 30, c.position.z), c.position.z);
                for (let k = 0, d = 30; k < 2400 && d > 8; k++) {
                    d = Math.hypot(c.position.x - pm.x, c.position.z - pm.z);
                    pm.x += ((c.position.x - pm.x) / d) * s.speed * dt;
                    pm.z += ((c.position.z - pm.z) / d) * s.speed * dt;
                    pm.y = boden(pm.x, pm.z);
                    lauf(1, e);
                }
                const d0 = Math.hypot(c.position.x - pm.x, c.position.z - pm.z);
                for (let k = 0; k < 1500; k++) {
                    lauf(1, e);
                    R.abstand.push(Math.hypot(c.position.x - pm.x, c.position.z - pm.z));
                }
                R.naeher.push(d0 - Math.min(...R.abstand.slice(-1500)));
                for (const k of [...s.creatures, ...s.leichname]) r.removeCreature(k);
            }
            erinnert[rolle] = {
                medianM: +quantil(R.abstand, 0.5).toFixed(2),
                naeherM: +quantil(R.naeher, 0.5).toFixed(2),
                erinnerungen: R.erinnerungen,
            };
        }
        r.setGameMode("pfad");
        const Z = A.LIFE_FIELD.cell;
        const zelle = (x, z, mx, mz) =>
            Math.floor(x / Z) === Math.floor(mx / Z) && Math.floor(z / Z) === Math.floor(mz / Z);
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
                ort[gegen ? "gegenlauf" : "riss"].push(+(drin / 5400 / herde.length).toFixed(3));
                for (const k of [...s.creatures, ...s.leichname]) r.removeCreature(k);
            }
        const mittel = (a) => +(a.reduce((p, q) => p + q, 0) / a.length).toFixed(3);
        return { erinnert, ort: { aufenthalt: mittel(ort.riss), gegenlauf: mittel(ort.gegenlauf), orte: ort } };
    });
}
// das Soll der Lebens-Proben (gerufen aus dem Urteil der Kreatur-Proben, `soll(bedingung, grund)`)
function lebenUrteil(name, z, soll) {
    if (name !== "furcht") return;
    const { kontrolle: K, geschlagen: G, gefuettert: F, gebunden: B, baerRuhig, baerZornig, baerFrieden } = z.erinnert;
    soll(
        [...G.erinnerungen, ...F.erinnerungen].every((n) => n >= 1),
        `das Gedächtnis reist nicht über den Speicherstand: Erinnerungen nach dem Laden geschlagen ${G.erinnerungen}, gefüttert ${F.erinnerungen}`
    );
    soll(K.medianM >= 5, `der Kontroll-Hirsch hält keinen Abstand (Median ${K.medianM} m, vakuös)`);
    soll(
        G.medianM >= 2 * K.medianM,
        `das Wesen vergisst, wer es schlug: Abstand bei der nächsten Begegnung Median ${G.medianM} m gegen ${K.medianM} m der Kontrolle (Soll ≥ 2×)`
    );
    soll(
        F.medianM <= 0.5 * K.medianM && F.naeherM >= 2,
        `das gefütterte Wesen nähert sich nicht: Median ${F.medianM} m gegen ${K.medianM} m (Soll ≤ ½×), selbst ${F.naeherM} m näher (Soll ≥ 2 m)`
    );
    soll(B.medianM <= 0.8 * K.medianM, `die Bindung macht nicht mutig: Median ${B.medianM} m gegen ${K.medianM} m`);
    soll(
        baerZornig.medianM >= 2 * baerRuhig.medianM && baerFrieden.medianM <= 0.5 * baerZornig.medianM,
        `die Aura treibt die Furcht nicht: der Bär vor dem ruhigen Spieler ${baerRuhig.medianM} m, vor dem zornigen ${baerZornig.medianM} m (Soll ≥ 2×), im frieden ${baerFrieden.medianM} m (Soll ≤ ½×)`
    );
    const O = z.ort;
    soll(O.gegenlauf >= 0.2, `das Rudel steht im Gegenlauf nicht am Riss-Ort (Aufenthalt ${O.gegenlauf}, vakuös)`);
    soll(
        O.aufenthalt <= 0.5 * O.gegenlauf,
        `die Herde meidet den Riss nicht: Aufenthalt in der Zelle ${O.aufenthalt} gegen ${O.gegenlauf} im Gegenlauf ohne Feld-Furcht (Soll −50 %)`
    );
}
const lebenQuelle = lebenBuehnen.toString();
module.exports = {
    // der Rumpf mit seinen Bühnen, gerufen mit den Helfern der Seiten-Funktion
    BUEHNEN: `await (${lebenQuelle})(buehne, taeter, decke, r, s, A, pm, frei, land, tier, ruhig, ruhigSpieler, takt, quantil);`,
    PROBEN: ["furcht"],
    TAETER: {
        furcht: [
            ["furcht-gedaechtnis", /vergisst, wer es schlug[\s\S]*nähert sich nicht/],
            ["furcht-ort", /meidet den Riss nicht/],
            ["furcht-speicher", /reist nicht über den Speicherstand/],
            ["furcht-aura", /die Aura treibt die Furcht nicht/],
        ],
    },
    urteil: lebenUrteil,
};
if (require.main !== module) return;
const path = require("path");
const root = path.resolve(__dirname, "..");

let fails = 0;
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) fails++;
}

// ── Kern laden (Namensraum-Muster: self/globalThis) ──
global.self = global;
require(path.join(root, "tetrapoda-core.js"));
const core = global.__tetrapodaCore;
check("tetrapoda-core lädt (Namensraum __tetrapodaCore)", !!core);

const MOTION = (core && core.MOTION) || {};
const V = (core && core.VERHALTEN) || null;

check("MOTION trägt hunt UND schwimmen (die einst toten/neuen Gänge)", !!(MOTION.hunt && MOTION.schwimmen));

function stimmungLuecken(V) {
    const missing = [];
    for (const mood in V.stimmung) {
        // SCHLUSS-WELLE 17.07.: "schwellen" ist die Schwellen-DATEN-Zeile
        // der Stimmungs-Tabelle (keine Stimmung) — überspringen.
        if (mood === "schwellen") continue;
        const row = V.stimmung[mood];
        if (!row || !Array.isArray(row.aktionen)) {
            missing.push(mood + ":(leer)");
            continue;
        }
        for (const a of row.aktionen) if (!V.aktionen[a]) missing.push(mood + ":" + a);
        if (!Array.isArray(row.alle) || row.alle.length !== 2 || !(row.alle[0] <= row.alle[1]))
            missing.push(mood + ":alle");
    }
    return missing;
}

// ── A2) DECKUNG: Verhaltens-Seele in sich geschlossen ──
check("fx.verhalten reist im Kern (VERHALTEN: aktionen + stimmung)", !!(V && V.aktionen && V.stimmung));
if (V) {
    const missing = stimmungLuecken(V);
    check(
        "jede Stimmungs-Aktion existiert im Katalog + alle=[min,max] gültig",
        missing.length === 0,
        missing.length ? "TOT: " + missing.join(",") : `${Object.keys(V.stimmung).length} Stimmungen`
    );
    // SELBST-TEST: eine injizierte tote Stimmungs-Aktion fällt auf
    const tot = { ...V, stimmung: { ...V.stimmung, tot: { aktionen: ["gibtsnicht"], alle: [1, 2] } } };
    check(
        "SELBST-TEST: eine injizierte tote Stimmungs-Aktion fällt auf",
        stimmungLuecken(tot).join() === "tot:gibtsnicht"
    );

    const bekannt = new Set([
        "freq",
        "bodyX",
        "bodyZ",
        "headX",
        "headY",
        "ear",
        "tailAmp",
        "tailRate",
        "tension",
        "bob",
        "sway",
        "kpMul",
    ]);
    const fremd = [];
    for (const name in V.aktionen) {
        const p = V.aktionen[name].profil;
        if (!p) continue;
        for (const k in p) if (!bekannt.has(k)) fremd.push(name + ":" + k);
    }
    check("Aktions-Profile nutzen nur bekannte MOTION-Felder", fremd.length === 0, fremd.join(","));
    // (die Blöcke des Buchs prüft der EINE Leser _verhaltenGesetz beim Boot, die Rezepte der Umschlag: gate:studio-vertrag)
    // Die Größen-Bänder sind lückenlos aufsteigend (die letzte Zeile fängt den Rest).
    const gr = Array.isArray(V.groessen) ? V.groessen : [];
    let grOk = gr.length >= 2;
    for (let i = 1; i < gr.length; i++) if (!(gr[i].bis > gr[i - 1].bis)) grOk = false;
    check("groessen-Bänder strikt aufsteigend (bis-Schwellen)", grOk);
}

if (fails > 0) {
    console.log(`\n❌ ROT — ${fails} Verletzung(en).`);
    process.exit(1);
}
console.log(
    "\n✅ GRÜN — DIE KREATUR-SEELE IST GESCHLOSSEN: jede Stimmung zeigt auf eine lebende Aktion, jedes Aktions-Profil auf ein Feld der Haltung."
);
