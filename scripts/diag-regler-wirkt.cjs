#!/usr/bin/env node
// diag-regler-wirkt.cjs — DIE REGLER-WIRKT-PROBE (W1 d, gate:regler-wirkt). Jede Zeile von PARAMS_BY_KIND ist ein
// Regler, den die Werkstatt aus den Buch-Daten rendert (`_workshopRenderStudioParams`: Rezepte aus dem Buch, Regler aus
// `paramsByKind[rezept.kind]`, der Wert reist als ov über den Kanal build-asset). Ein Regler WIRKT, wenn das Bewegen
// den Bau ändert: die Linse baut je Art über die ECHTE Foundry-Brücke (asset-worker-harness, dieselben Kerne wie der
// Worker) das Rezept ohne ov und mit ov {id: min} bzw. {id: max} und vergleicht den Bau-Hash (jedes gelieferte Byte:
// Teil-Art, Stoff, Attribute, Index). Ein Regler ist TOT, wenn er an KEINEM Rezept seiner Art den Hash bewegt — dann
// nennt ihn die Linse beim Namen (Kern · Art · id · Grund). Ein Bau mit dem Regler-Wert, der BRICHT (0 Teile: der
// Bäcker wirft, die Brücke fängt und liefert []; oder NaN/Inf in einem Fließkomma-Puffer), wirkt nie: er ist ein
// benannter Fehler und immer rot, ohne Ratsche.
//
// Die RATSCHE (spec/vertraege/ratsche.json, Block `reglerTot`): die Liste der toten Regler darf nur schrumpfen.
// Ein neuer toter Regler ist rot (beim Namen); ein geheilter ist ebenfalls rot, bis seine Zeile im selben Commit
// fällt (die Zahl sinkt, sie wächst nie still zurück). Das Soll steht daneben (Synthese W4: „Regler-wirkt-Probe grün"
// = 0 tote Regler).
//
//   node scripts/diag-regler-wirkt.cjs --selftest   die Linse feuert: der alte Brücken-Defekt (W-A1: ov kam nicht
//                                                   an, die Brücke reichte null) macht jeden Regler tot → rot; ein
//                                                   Regler, dessen Bau wirft bzw. NaN rechnet → BRICHT beim Namen
//   node scripts/diag-regler-wirkt.cjs              Messung gegen die Ratsche
//   node scripts/diag-regler-wirkt.cjs --messen     nur messen und ausgeben (kein Urteil)
// Port über REGLER_WIRKT_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4561.
"use strict";
const fs = require("fs");
const path = require("path");
const { runWithWorker } = require("./lib/asset-worker-harness.cjs");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.REGLER_WIRKT_PORT || 4561);
const RATSCHE_PFAD = path.join(ROOT, "spec", "vertraege", "ratsche.json");
const SEED = 1;

// Der Kern je Art, wie die Brücke die Tabellen sammelt (`__mergeParamsMap`: die Zweit-Kerne in Manifest-Reihenfolge,
// first-wins, danach der Primär-Kern): jeder Zweit-Kern mit Namensraum wird THREE-frei im vm gelesen (nur seine
// PARAMS_BY_KIND), was keiner trägt, gehört dem Primär-Kern (phyto).
function kernVonArt() {
    const vm = require("vm");
    const aus = {};
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "cores.manifest.json"), "utf8"));
    for (const c of manifest) {
        if (!c || typeof c.ns !== "string" || !c.ns) continue;
        const ctx = { console, Math, JSON, Date };
        ctx.self = ctx;
        ctx.globalThis = ctx;
        vm.createContext(ctx);
        for (const s of c.scripts) vm.runInContext(fs.readFileSync(path.join(ROOT, s), "utf8"), ctx, { filename: s });
        const pbk = (ctx[c.ns] && ctx[c.ns].PARAMS_BY_KIND) || {};
        for (const art of Object.keys(pbk)) if (!(art in aus)) aus[art] = c.id;
    }
    return aus;
}

// Die niedrigste Stufe, die die Art trägt (die Werkstatt-Vorschau startet auf L0; eine Art ohne L0 baut ihre erste).
function ersteStufe(rc, art) {
    const ks = rc && rc.lod && rc.lod.kindStages;
    const zks = (rc && rc.lod && rc.lod.zusatzKindStages) || {};
    let st = ks && Array.isArray(ks[art]) ? ks[art] : null;
    for (const kern in zks) if (!st && Array.isArray(zks[kern][art])) st = zks[kern][art];
    return st && st.length ? Math.min(...st) : 0;
}

// DER GEBROCHENE BAU: 0 Teile (der Bäcker wirft — die Brücke fängt und liefert [] — oder liefert nichts) oder
// nicht-endliche Zahlen in einem Fließkomma-Puffer (der Bäcker rechnet mit einem Wert, den er nicht rechnen kann).
// Ein gebrochener Bau hat einen anderen Hash als die Basis, aber er WIRKT nicht: er ist ein benannter Fehler (rot).
function bauBruch(r) {
    if (!r || !r.teile) return "0 Teile (der Bau wirft oder liefert nichts)";
    if (r.nichtEndlich) return r.nichtEndlich + " nicht-endliche Werte (NaN/Inf) in den Puffern";
    return null;
}

// Die Messung: je Art × Regler über die Rezepte der Art, bis einer den Hash bewegt. Die Täter des Selbsttests:
// `ohneOv` (der alte Brücken-Defekt W-A1: die Bau-Nachricht trägt den Regler-Wert nicht) und `bruch` = id eines
// Reglers, dessen Bau bricht (min: die Nachricht nennt ein Rezept, das das Buch nicht kennt — der Worker wirft, die
// Brücke liefert 0 Teile; max: der Wert ist Text — der Bäcker rechnet NaN).
async function messen(h, opts) {
    const o = opts || {};
    const env = await h.getData("get-book");
    const buch = env.book || {};
    const pbk = env.paramsByKind || {};
    const rc = env.renderConfig || {};
    const kerne = kernVonArt();
    const arten = Object.keys(pbk)
        .filter((a) => !o.nurArt || a === o.nurArt)
        .sort();
    const zeilen = [];
    for (const art of arten) {
        const rezepte = Object.keys(buch)
            .filter((id) => buch[id] && buch[id].kind === art)
            .sort();
        const lod = ersteStufe(rc, art);
        for (const d of pbk[art])
            zeilen.push({ kern: kerne[art] || "phyto", art, id: d.id, d, rezepte, lod, wirkt: false, grund: "", an: null, bricht: [] });
    }
    const msg = (preset, lod, ov) => {
        const m = { presetId: preset, seed: SEED, lod };
        if (ov && !o.ohneOv) m.ov = ov;
        const k = ov && Object.keys(ov)[0];
        if (k && o.bruch === k) {
            const z = zeilen.find((x) => x.id === k);
            if (ov[k] === z.d.min) m.presetId = "__taeter_unbekannt__";
            else m.ov = { [k]: "kein-wert" };
        }
        return m;
    };
    // Runde je Rezept-Index: alle noch toten Zeilen am i-ten Rezept ihrer Art (die Basis je Rezept einmal).
    const basis = new Map();
    let builds = 0;
    for (let ri = 0; ; ri++) {
        const offen = zeilen.filter((z) => !z.wirkt && ri < z.rezepte.length);
        if (!offen.length) break;
        const liste = [];
        const plan = [];
        for (const z of offen) {
            const p = z.rezepte[ri];
            const bk = p + "|" + z.lod;
            if (!basis.has(bk)) {
                basis.set(bk, null);
                plan.push({ basis: bk });
                liste.push(msg(p, z.lod, null));
            }
            for (const wert of [z.d.min, z.d.max]) {
                plan.push({ z, p, wert });
                liste.push(msg(p, z.lod, { [z.id]: wert }));
            }
        }
        const res = await h.bauHashListe(liste);
        builds += liste.length;
        plan.forEach((pl, i) => {
            if (pl.basis) basis.set(pl.basis, res[i]);
        });
        plan.forEach((pl, i) => {
            if (pl.basis) return;
            const b = basis.get(pl.p + "|" + pl.z.lod);
            if (!b || !b.teile) return;
            const bruch = bauBruch(res[i]);
            if (bruch) {
                pl.z.bricht.push(`${pl.z.id}=${pl.wert} an ${pl.p}: ${bruch}`);
                return;
            }
            if (res[i].hash !== b.hash && !pl.z.wirkt) {
                pl.z.wirkt = true;
                pl.z.an = pl.p;
            }
        });
    }
    for (const z of zeilen) {
        if (z.wirkt) {
            z.grund = "wirkt an " + z.an;
            continue;
        }
        const leer = z.rezepte.every((p) => {
            const b = basis.get(p + "|" + z.lod);
            return !b || !b.teile;
        });
        z.grund = !z.rezepte.length
            ? "kein Rezept der Art im Buch"
            : leer
              ? "kein Bau: die Brücke liefert für die Art 0 Teile (ov ohne Leser)"
              : "bewegt den Bau an keinem der " + z.rezepte.length + " Rezepte (min " + z.d.min + " · max " + z.d.max + ")";
    }
    for (const z of zeilen) if (z.bricht.length) z.grund = "BRICHT — " + z.bricht.slice(0, 2).join(" · ") + (z.bricht.length > 2 ? " …" : "");
    return { zeilen, builds };
}

const name = (z) => z.kern + ":" + z.art + ":" + z.id;
// Drei Urteile je Zeile: wirkt · bricht (ein Bau mit diesem Regler ist gebrochen — immer rot, nie Ratsche) · tot.
const bricht = (z) => z.bricht.length > 0;
const tot = (z) => !z.wirkt && !bricht(z);

// Das Urteil gegen die Ratsche (rein, ohne Browser): neu tot = rot, geheilt = rot bis die Zeile fällt.
function vergleich(tot, ratsche) {
    const bekannt = new Set(Object.keys((ratsche && ratsche.tot) || {}));
    const jetzt = new Set(tot);
    const neu = [...jetzt].filter((n) => !bekannt.has(n)).sort();
    const geheilt = [...bekannt].filter((n) => !jetzt.has(n)).sort();
    return { neu, geheilt, ok: !neu.length && !geheilt.length };
}

function ratscheLesen() {
    const r = JSON.parse(fs.readFileSync(RATSCHE_PFAD, "utf8"));
    if (!r.reglerTot || typeof r.reglerTot.tot !== "object") throw new Error("ratsche.json ohne Block reglerTot.tot");
    return r.reglerTot;
}

function bericht(zeilen) {
    const jeKern = {};
    for (const z of zeilen) {
        const k = (jeKern[z.kern] = jeKern[z.kern] || { zeilen: 0, wirkt: 0, tot: 0, bricht: 0 });
        k.zeilen++;
        if (z.wirkt && !bricht(z)) k.wirkt++;
        if (tot(z)) k.tot++;
        if (bricht(z)) k.bricht++;
    }
    for (const k of Object.keys(jeKern).sort()) {
        const j = jeKern[k];
        console.log(
            `  ${k.padEnd(10)} ${String(j.wirkt).padStart(3)} wirken · ${String(j.tot).padStart(3)} tot${j.bricht ? ` · ${j.bricht} BRICHT` : ""} (von ${j.zeilen})`
        );
    }
    return jeKern;
}

async function selbsttest() {
    // (a) das Urteil rein: ein neuer Toter und ein Geheilter sind beide rot, die gleiche Liste ist grün.
    const r = { tot: { "a:x:1": "", "a:x:2": "" } };
    const v1 = vergleich(["a:x:1", "a:x:2"], r);
    const v2 = vergleich(["a:x:1", "a:x:2", "a:x:3"], r);
    const v3 = vergleich(["a:x:1"], r);
    const rein = v1.ok && !v2.ok && v2.neu[0] === "a:x:3" && !v3.ok && v3.geheilt[0] === "a:x:2";
    console.log(`${rein ? "✅" : "❌"} SELBST-TEST Urteil: gleich grün · neu tot rot (${v2.neu}) · geheilt rot bis die Zeile fällt (${v3.geheilt})`);
    // (b) der Täter am echten Kanal: die Brücke bekommt den Regler-Wert nicht (der W-A1-Defekt) — jede Zeile der Art
    // vehicle wird tot und beim Namen genannt; ohne Täter wirkt dieselbe Art.
    let taeter = null,
        heil = null,
        brecher = null;
    await runWithWorker(PORT, async (h) => {
        taeter = await messen(h, { nurArt: "vehicle", ohneOv: true });
        heil = await messen(h, { nurArt: "vehicle" });
        // (c) der Täter „ein Regler bricht den Bau" am echten Kanal: radstand min → der Worker wirft (0 Teile),
        // max → Text statt Zahl (NaN-Bau). Beide Bauten haben einen anderen Hash als die Basis — die Linse von vorher
        // zählte sie als „wirkt"; jetzt ist radstand BRICHT beim Namen und nie „wirkt".
        brecher = await messen(h, { nurArt: "vehicle", bruch: "radstand" });
    });
    const tTot = taeter.zeilen.filter(tot).map(name);
    const hTot = heil.zeilen.filter(tot).map(name);
    const ratsche = ratscheLesen();
    const vT = vergleich(tTot, { tot: Object.fromEntries(Object.keys(ratsche.tot).filter((n) => n.includes(":vehicle:")).map((n) => [n, ""])) });
    const kanal = taeter.zeilen.length > 0 && tTot.length === taeter.zeilen.length && !vT.ok && hTot.length < tTot.length;
    console.log(
        `${kanal ? "✅" : "❌"} SELBST-TEST Täter (ov erreicht die Brücke nicht): ${tTot.length}/${taeter.zeilen.length} Regler der Art vehicle tot → rot (neu tot: ${vT.neu.slice(0, 3).join(", ")}${vT.neu.length > 3 ? " …" : ""}) · ohne Täter ${hTot.length} tot`
    );
    const zB = brecher.zeilen.find((z) => z.id === "radstand");
    const andereB = brecher.zeilen.filter((z) => z !== zB && bricht(z)).map(name);
    const bruchArten = zB ? new Set(zB.bricht.map((b) => (/0 Teile/.test(b) ? "leer" : /nicht-endliche/.test(b) ? "nan" : "?"))) : new Set();
    const bruchOk =
        !!zB && bricht(zB) && !zB.wirkt && bruchArten.has("leer") && bruchArten.has("nan") && !andereB.length && !heil.zeilen.some(bricht);
    console.log(
        `${bruchOk ? "✅" : "❌"} SELBST-TEST Täter (ein Regler bricht den Bau): ${zB ? name(zB) + " " + (bricht(zB) ? "BRICHT" : zB.wirkt ? "„wirkt“" : "tot") : "fehlt"} — ${zB ? zB.bricht.slice(0, 2).join(" · ") : ""} · andere BRICHT ${andereB.length} · ohne Täter BRICHT ${heil.zeilen.filter(bricht).length}`
    );
    return rein && kanal && bruchOk;
}

(async () => {
    if (process.argv.includes("--selftest")) {
        const ok = await selbsttest();
        process.exit(ok ? 0 : 1);
    }
    let m = null;
    await runWithWorker(PORT, async (h) => {
        m = await messen(h, {});
    });
    const toteZ = m.zeilen.filter(tot);
    const brechend = m.zeilen.filter(bricht);
    console.log(`Regler-wirkt: ${m.zeilen.length} PARAMS-Zeilen, ${m.builds} Bauten über die echte Brücke (Seed ${SEED}, erste Stufe je Art)`);
    bericht(m.zeilen);
    for (const z of toteZ) console.log(`  TOT ${name(z)} — ${z.grund}`);
    for (const z of brechend) console.log(`❌ BRICHT ${name(z)} — ${z.grund}`);
    if (process.argv.includes("--messen")) {
        for (const z of m.zeilen.filter((x) => x.wirkt && !bricht(x))) console.log(`  wirkt ${name(z)} — ${z.grund}`);
        process.exit(0);
    }
    const ratsche = ratscheLesen();
    const v = vergleich(toteZ.map(name), ratsche);
    for (const n of v.neu) console.log(`❌ NEU TOT: ${n} — ${toteZ.find((z) => name(z) === n).grund}`);
    for (const n of v.geheilt) console.log(`❌ GEHEILT: ${n} wirkt jetzt — die Zeile fällt im selben Commit aus spec/vertraege/ratsche.json (reglerTot.tot), die Ratsche sinkt`);
    const soll = ratsche.soll;
    if (!v.ok || brechend.length) process.exit(1);
    const wirkend = m.zeilen.filter((z) => z.wirkt && !bricht(z)).length;
    console.log(`✅ gate:regler-wirkt: ${wirkend}/${m.zeilen.length} Regler wirken · 0 brechen · ${toteZ.length} tot = Ratsche ${Object.keys(ratsche.tot).length} (Soll ${soll}, ${ratsche.sollQuelle})`);
    process.exit(0);
})().catch((e) => {
    console.error("regler-wirkt-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
