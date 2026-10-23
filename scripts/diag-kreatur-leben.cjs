#!/usr/bin/env node
// gate:kreatur-leben — DIE LEBENS-LINSE: als Skript die Seele im Kern; als Stück der Seiten-Funktion der Kreatur-Proben
// (`BUEHNEN` an ihrer Marke) Furcht, Durst und Lebensraum am ECHTEN Takt (gate:kreatur-takt).
"use strict";

// ── furcht (Ökologie K3, tetrapoda FURCHT_GESETZ): (A) je Ort und Rolle ein Tier allein — geschlagen, gefüttert, gebunden,
// zur Kontrolle, der Bär vor ruhiger, zorniger, friedlicher Aura — über den Speicherstand, dann geht der Spieler bis 8 m
// heran und steht 15 s: der Median des Abstands. (B) ein Rudel um einen Riss: sein Aufenthalt in dessen Zelle über 90 s,
// gegen den Gegenlauf ohne Feld-Furcht ──
async function lebenBuehnen(
    buehne,
    taeter,
    decke,
    r,
    s,
    A,
    pm,
    frei,
    land,
    tier,
    ruhig,
    ruhigSpieler,
    takt,
    quantil,
    kamera,
    imBlick
) {
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
                    throw new Error("keine Gabe");
                pm.set(ort.x + 150, boden(ort.x + 150, ort.z), ort.z);
                lauf(600);
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
                for (let k = 0; k < 900; k++) {
                    lauf(1, e);
                    R.abstand.push(Math.hypot(c.position.x - pm.x, c.position.z - pm.z));
                }
                R.naeher.push(d0 - Math.min(...R.abstand.slice(-900)));
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
        return { erinnert, ort: { aufenthalt: mittel(ort.riss), gegenlauf: mittel(ort.gegenlauf) } };
    });
    // ── durst (Tiere K4, DURST_GESETZ): drei Hirsche 15–30 m vom Fluss, 1,5 × durstS: ihre Trünke am Wasser ──
    await buehne("durst", async (restore) => {
        if (taeter === "durst") decke(restore, "_kreaturDurstig", () => () => false);
        const D = A._lebensraumGesetz().D;
        let ort = null;
        for (let k = 0; k < 441 && !ort; k++) {
            const x = pm.x + ((k % 21) - 10) * 25,
                z = pm.z + (Math.floor(k / 21) - 10) * 25;
            const h = r._hydroDistAt(x, z),
                rand = h.dist - Math.max(1, h.halfW);
            if (rand > 15 && rand < 30 && r._landAt(x, z)) ort = { x, y: r.getTerrainHeightAt(x, z) + 0.5, z };
        }
        if (!ort) throw new Error("kein Fluss im Umkreis von 250 m");
        pm.set(ort.x + 150, pm.y, ort.z);
        const tiere = [0, 1, 2].map((i) => tier({ x: ort.x + i * 3, y: ort.y, z: ort.z }, "wesen", 1));
        tiere.forEach(ruhig);
        const z = { truenke: [0, 0, 0], amWasser: 0, durstS: D.durstS };
        const zuletzt = [];
        for (let k = 0; k < 1.5 * D.durstS * 60; k++) {
            ruhigSpieler();
            takt(1 / 60);
            tiere.forEach((c, i) => {
                const g = c.userData._getrunken;
                if (zuletzt[i] !== undefined && g !== zuletzt[i]) {
                    z.truenke[i]++;
                    if (r._findNearestWaterPoint(c.position.x, c.position.z, 4)) z.amWasser++;
                }
                zuletzt[i] = g;
            });
        }
        return z;
    });
    // ── lebensraum (Tiere K4; die Geburt fern, außer Blick, in Gruppen): an neun Orten (Raster 300 m) je 25 Geburten — je Tier
    // Gattung, Boden-Klasse, Abstand, Blick, der Nächste der Gruppe; die Gegenprobe in anderer Saat ──
    await buehne("lebensraum", async (restore) => {
        if (taeter === "lebensraum")
            decke(restore, "_pickFaunaSoulAtPlayer", () => (x, z, rng) => A.CREATURE_SOUL_NAMES[Math.floor(rng() * 4)]);
        const alt = {
            geburt: () => ({ x: pm.x + 15, z: pm.z }),
            "geburt-einzeln": () => r._kreaturGeburtsOrt(r._faunaRng()),
        };
        if (alt[taeter])
            decke(restore, "_creatureNaturalBirth", () => () => {
                const o = alt[taeter]();
                return !!o && !!r.spawnCreatureAt(o.x, pm.y, o.z, "happy", "wesen");
            });
        const LG = A._lebensraumGesetz();
        const z = { n: 0, drin: 0, gattung: {}, klasse: {}, geburten: 0, gruppen: 0, journal: 0, minM: Infinity };
        Object.assign(z, { imBlick: 0, fensterMax: 0, fernMin: A.CREATURE_SPAWN_FAR_MIN });
        const p0 = pm.clone();
        for (let i = 0; i < (taeter ? 3 : 9); i++) {
            pm.set(p0.x + ((i % 3) - 1) * 300, p0.y, p0.z + (Math.floor(i / 3) - 1) * 300);
            kamera(1, 0);
            for (let k = 0; k < 25; k++) {
                const vor = s.creatures.length;
                r._creatureNaturalBirth();
                const neu = s.creatures.slice(vor);
                if (!neu.length) continue;
                z.geburten++;
                if (neu.length > 1) z.gruppen++;
                const j = s.worldJournal.entries[s.worldJournal.entries.length - 1];
                if (j && j.type === "growth" && j.ctx && j.ctx.gruppe === neu.length) z.journal++;
                const paar = (2 * r._kreaturRaum(neu[0])) / neu[0].userData.bodySize;
                for (const c of neu) {
                    const g = A.TETRAPODA_SOUL_MAP[c.userData.soul],
                        kl = r._bodenKlasseAt(c.position.x, c.position.z);
                    z.n++;
                    if (LG.lebensraum(g, kl, LG.L) > 0) z.drin++;
                    z.gattung[g] = (z.gattung[g] || 0) + 1;
                    z.klasse[kl] = (z.klasse[kl] || 0) + 1;
                    z.minM = Math.min(z.minM, +Math.hypot(c.position.x - pm.x, c.position.z - pm.z).toFixed(1));
                    if (imBlick(c.position.x, c.position.y + 0.5, c.position.z)) z.imBlick++;
                    const nn = Math.min(
                        ...neu
                            .filter((o) => o !== c)
                            .map((o) => Math.hypot(c.position.x - o.position.x, c.position.z - o.position.z) / paar)
                    );
                    if (nn < Infinity) z.fensterMax = +Math.max(z.fensterMax, nn).toFixed(2);
                }
                for (const c of neu) r.removeCreature(c);
            }
        }
        return Object.assign(z, {
            anteil: z.n ? +(z.drin / z.n).toFixed(3) : null,
            saat: s.worldMeta.seed,
            fensterRaum: A._verhaltenGesetz().herde.fensterRaum,
        });
    });
}
// das Soll der Lebens-Proben (`soll(bedingung, grund)` aus dem Urteil der Kreatur-Proben)
function lebenUrteil(name, z, soll) {
    if (name === "durst")
        soll(
            z.truenke.every((n) => n >= 1) && z.amWasser === z.truenke.reduce((a, b) => a + b, 0),
            `kein Tier trinkt aus Durst: Trünke ${z.truenke} in ${1.5 * z.durstS} s, ${z.amWasser} am Wasser`
        );
    if (name === "lebensraum") {
        soll(z.minM >= 0.99 * z.fernMin, `Geburt ${z.minM} m vor dem Spieler (Soll ≥ ${z.fernMin} m)`);
        soll(z.imBlick === 0, `${z.imBlick} Geburten im Blick`);
        soll(
            z.gruppen >= 10 && z.gattung.wolf && z.gattung.deer,
            `keine Gruppe: ${z.gruppen} von ${z.geburten} Würfen`
        );
        soll(z.fensterMax <= z.fensterRaum, `ein Tier ${z.fensterMax} Paar-Räume vom Nächsten seiner Gruppe`);
        soll(z.journal === z.geburten, `${z.geburten - z.journal} Würfe ohne growth-Eintrag ihrer Gruppe`);
    }
    if (name === "lebensraum")
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
    if (name !== "furcht") return;
    const { kontrolle: K, geschlagen: G, gefuettert: F, gebunden: B, baerRuhig, baerZornig, baerFrieden } = z.erinnert;
    soll(
        [...G.erinnerungen, ...F.erinnerungen].every((n) => n >= 1),
        `das Gedächtnis reist nicht über den Speicherstand: geschlagen ${G.erinnerungen}, gefüttert ${F.erinnerungen}`
    );
    soll(K.medianM >= 5, `der Kontroll-Hirsch hält keinen Abstand (Median ${K.medianM} m, vakuös)`);
    soll(
        G.medianM >= 2 * K.medianM,
        `das Wesen vergisst, wer es schlug: ${G.medianM} m gegen ${K.medianM} m der Kontrolle (Soll ≥ 2×)`
    );
    soll(
        F.medianM <= 0.5 * K.medianM && F.naeherM >= 2,
        `das gefütterte Wesen nähert sich nicht: ${F.medianM} m (Soll ≤ ½×), selbst ${F.naeherM} m näher (Soll ≥ 2 m)`
    );
    soll(B.medianM <= 0.8 * K.medianM, `die Bindung macht nicht mutig: ${B.medianM} m`);
    soll(
        baerZornig.medianM >= 2 * baerRuhig.medianM && baerFrieden.medianM <= 0.5 * baerZornig.medianM,
        `die Aura treibt die Furcht nicht: der Bär ruhig ${baerRuhig.medianM} m, zornig ${baerZornig.medianM} m, im frieden ${baerFrieden.medianM} m`
    );
    const O = z.ort;
    soll(O.gegenlauf >= 0.2, `das Rudel steht im Gegenlauf nicht am Riss-Ort (${O.gegenlauf}, vakuös)`);
    soll(
        O.aufenthalt <= 0.5 * O.gegenlauf,
        `die Herde meidet den Riss nicht: Aufenthalt ${O.aufenthalt} gegen ${O.gegenlauf} ohne Feld-Furcht (Soll −50 %)`
    );
}
const lebenQuelle = lebenBuehnen.toString();
module.exports = {
    BUEHNEN: `await (${lebenQuelle})(buehne, taeter, decke, r, s, A, pm, frei, land, tier, ruhig, ruhigSpieler, takt, quantil, kamera, imBlick);`,
    PROBEN: ["furcht", "lebensraum", "durst"],
    TAETER: {
        durst: [["durst", /kein Tier trinkt aus Durst/]],
        lebensraum: [
            ["lebensraum", /Geburten außerhalb des Lebensraums[\s\S]*Gegenprobe Geburten außerhalb/],
            ["geburt", /vor dem Spieler/],
            ["geburt-einzeln", /keine Gruppe/],
        ],
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

const V = (core && core.VERHALTEN) || null;

// ── die Seele in sich: die Aktionen jeder Stimmung prüft gate:studio-vertrag (§B6+), hier der Takt alle=[min,max] ──
if (V) {
    check(
        "je Stimmung alle=[min,max] (min ≤ max)",
        Object.entries(V.stimmung).every(([k, z]) => k === "schwellen" || (z.alle && z.alle[0] <= z.alle[1]))
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
console.log("\n✅ GRÜN — DIE KREATUR-SEELE IST GESCHLOSSEN: jedes Aktions-Profil zeigt auf ein Feld der Haltung.");
