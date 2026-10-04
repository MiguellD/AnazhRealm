// diag-asset-contract.cjs — P1 DAUER-GATE: jeder Produzent, der den Asset-Vertrag v1 spricht,
// MUSS die eingefrorenen Goldens byte-genau treffen. Bootet den Studio-Generator als Worker
// (die EINE Harness), baut jeden Golden-Fall neu, fingerabdruckt die Puffer (sha256 je Attribut,
// die geteilte fingerprintMeshes) und vergleicht sha256 + Byte-Länge + prüft das Schema (cv,
// Pflichtfelder). Dazu die drei Daten-Kanäle (recipes/world-params/render-config) gegen ihre
// eingefrorenen JSONs. Der exakte Byte-Offset einer Divergenz kommt aus diag-foundry-parity.
//
// GRÜN ⇒ der Vertrag hält, kein stiller Drift möglich. ROT ⇒ die erste Divergenz mit Ort
// (Datei · Mesh · Attribut) — eine benannte Änderung, keine Meinung.
//
//   npm run gate:asset-contract
const fs = require("fs");
const path = require("path");
const { runWithWorker, fingerprintMeshes } = require("./lib/asset-worker-harness.cjs");

const PORT = Number(process.env.CONTRACT_PORT || 4542);
const DIR = path.resolve(__dirname, "..", "spec", "asset-contract", "v1", "golden");

function parseName(f) {
    // <preset>-s<seed>-L<lod>-<season>.json
    const m = f.match(/^(.+)-s(-?\d+)-L(\d+)-(\w+)\.json$/);
    if (!m) return null;
    return { presetId: m[1], seed: Number(m[2]), lod: Number(m[3]), season: m[4] };
}

const SCHEMA_ATTRS = ["position"]; // Pflicht-Attribut je Mesh
function schemaError(rec) {
    if (rec.cv !== 1) return "cv != 1";
    if (typeof rec.presetId !== "string") return "presetId fehlt";
    if (!Array.isArray(rec.meshes) || !rec.meshes.length) return "meshes leer";
    for (let i = 0; i < rec.meshes.length; i++) {
        const m = rec.meshes[i];
        if (typeof m.kind !== "string") return `Mesh${i}: kind fehlt`;
        if (!m.mat || typeof m.mat !== "object") return `Mesh${i}: mat fehlt`;
        if (!m.attrs) return `Mesh${i}: attrs fehlt`;
        for (const a of SCHEMA_ATTRS) if (!m.attrs[a] || !m.attrs[a].sha256) return `Mesh${i}: Attribut '${a}' fehlt`;
    }
    return null;
}

function meshDiff(tag, gold, live) {
    if (gold.length !== live.length) return `${tag}: Mesh-Zahl ${gold.length} vs ${live.length}`;
    for (let i = 0; i < gold.length; i++) {
        const a = gold[i],
            b = live[i];
        if (a.kind !== b.kind) return `${tag} Mesh${i}: kind ${a.kind} vs ${b.kind}`;
        if (JSON.stringify(a.mat || null) !== JSON.stringify(b.mat || null)) return `${tag} Mesh${i}: mat divergiert`;
        const keys = new Set([...Object.keys(a.attrs || {}), ...Object.keys(b.attrs || {})]);
        for (const k of keys) {
            const av = (a.attrs || {})[k],
                bv = (b.attrs || {})[k];
            if (!av || !bv) return `${tag} Mesh${i}: Attribut '${k}' nur auf einer Seite`;
            if (av.itemSize !== bv.itemSize) return `${tag} Mesh${i}.${k}: itemSize ${av.itemSize} vs ${bv.itemSize}`;
            if (av.bytes !== bv.bytes) return `${tag} Mesh${i}.${k}: Byte-Länge ${av.bytes} vs ${bv.bytes}`;
            if (av.sha256 !== bv.sha256)
                return `${tag} Mesh${i}.${k}: sha256-Divergenz (Byte-Offset via diag-foundry-parity)`;
        }
        if (((a.index || null) !== null) !== ((b.index || null) !== null))
            return `${tag} Mesh${i}: index nur auf einer Seite`;
        if (a.index && a.index.sha256 !== b.index.sha256) return `${tag} Mesh${i}.index: sha256-Divergenz`;
    }
    return null;
}

/// DIE BUDGET-WAND (04.10., echte GPU an der Mess-Wiese) — der KONSUM des Budgets (render-config lod.budget,
// Studio-Vertrag B2c), gelesen NACH dem Transport aus dem get-book-Umschlag:
//  (K) KOSTEN — jede gelieferte Gitter-Stufe jeder Art wird über die echte Brücke gebaut (alle Golden-Fälle
//      plus jedes Rezept der Art bei Samen 7, wo kein Golden die Stufe trägt) und gegen ihre Zeile gehalten:
//      Dreiecke ≤ tris, Sippen (Host-Verschmelz-Regel: Stoff × Attribut-Form × Index) ≤ draws. Rot nennt den
//      Täter: `tree[1] weide-s12345-L1-summer: 10204 Dreiecke > 10000`. Die Karten-Stufe (karte) ist kein
//      Gitter — ihre L2-Geometrie wird nicht geliefert (die Karten-Linse in gate:studio-vertrag hält das).
//  (A) STECKBRIEF — der gemalte EINE Blatt-Atlas passt in die deklarierten Kerne (Alpha>0 nie jenseits `kern`)
//      und seine Füllungen sind die deklarierten (±0,01): Breitblatt-Zellen und Nadel-Zelle.
//  (D) DECKUNG — die gebaute L1-Krone bedeckt die L0-Krone desselben Baums im Band budget.tree[1].deckung:
//      Laub-Karte (Fläche × Kern-Füllung / Klingen-Fläche; Kern-Füllung = fuellung / kern²), Nadel-Karte
//      (Cauchy: die mittlere Projektion eines Nadel-Rohrs ist Oberfläche/4, die einer Karte Fläche × Füllung/2
//      → 2 · Fläche × Füllung / Rohr-Fläche) und Trauer-Klinge (Klingen-Fläche L1 / L0), je Art × Samen × Saison.
const dekodiere = (b64, Typ) => {
    const b = Buffer.from(b64, "base64");
    return new Typ(b.buffer, b.byteOffset, b.byteLength / Typ.BYTES_PER_ELEMENT);
};
function flaeche(meshes, kind) {
    let a = 0;
    for (const m of meshes || []) {
        if (m.kind !== kind || !m.attrs.position || !m.index) continue;
        const p = dekodiere(m.attrs.position.b64, Float32Array);
        const ix = dekodiere(m.index, Uint32Array);
        for (let t = 0; t < ix.length; t += 3) {
            const i0 = ix[t] * 3,
                i1 = ix[t + 1] * 3,
                i2 = ix[t + 2] * 3;
            const ax = p[i1] - p[i0],
                ay = p[i1 + 1] - p[i0 + 1],
                az = p[i1 + 2] - p[i0 + 2];
            const bx = p[i2] - p[i0],
                by = p[i2 + 1] - p[i0 + 1],
                bz = p[i2 + 2] - p[i0 + 2];
            a += 0.5 * Math.hypot(ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx);
        }
    }
    return a;
}
// Dreiecke und Sippen einer gebauten Antwort (Beipack ohne position zählt nicht).
function kosten(meshes) {
    const ms = (meshes || []).filter((m) => m.attrs && m.attrs.position);
    let tris = 0;
    const sippen = new Set();
    for (const m of ms) {
        tris += m.index
            ? Buffer.from(m.index, "base64").length / 12
            : Buffer.from(m.attrs.position.b64, "base64").length / 36;
        const form = Object.keys(m.attrs)
            .sort()
            .map((k) => k + ":" + m.attrs[k].itemSize)
            .join(",");
        sippen.add(m.kind + "|" + JSON.stringify(m.mat || null) + "|" + (m.index ? "i" : "x") + "|" + form);
    }
    return { tris, sippen: sippen.size };
}
function kostenUrteil(messungen, budget) {
    const v = [];
    for (const mm of messungen) {
        const z = budget[mm.kind] && budget[mm.kind][mm.lod];
        if (!z) {
            v.push(`${mm.kind}[${mm.lod}] ${mm.fall}: keine Budget-Zeile`);
            continue;
        }
        if (z.karte) continue;
        if (mm.tris > z.tris) v.push(`${mm.kind}[${mm.lod}] ${mm.fall}: ${mm.tris} Dreiecke > ${z.tris}`);
        if (mm.sippen > z.draws) v.push(`${mm.kind}[${mm.lod}] ${mm.fall}: ${mm.sippen} Sippen > ${z.draws} draws`);
    }
    return v;
}
function steckbriefUrteil(atlas, breit, nadel) {
    const v = [];
    if (!breit || !(breit.kern > 0) || !(breit.fuellung > 0) || !(breit.zellen >= 1))
        return ["Steckbrief BLATT_ATLAS_BREIT fehlt"];
    if (!nadel || !(nadel.kern > 0) || !(nadel.fuellung > 0) || !Number.isInteger(nadel.zelle))
        return ["Steckbrief BLATT_ATLAS_NADEL fehlt"];
    for (let c = 0; c < breit.zellen; c++)
        if (atlas.ext[c] > breit.kern)
            v.push(`Zelle ${c}: Alpha reicht bis ${atlas.ext[c].toFixed(4)} > kern ${breit.kern}`);
    const f = atlas.fill.slice(0, breit.zellen).reduce((s, x) => s + x, 0) / breit.zellen;
    if (Math.abs(f - breit.fuellung) > 0.01)
        v.push(`Breitblatt-Füllung ${f.toFixed(4)} ≠ Steckbrief ${breit.fuellung}`);
    if (atlas.ext[nadel.zelle] > nadel.kern)
        v.push(
            `Nadel-Zelle ${nadel.zelle}: Alpha reicht bis ${atlas.ext[nadel.zelle].toFixed(4)} > kern ${nadel.kern}`
        );
    if (Math.abs(atlas.fill[nadel.zelle] - nadel.fuellung) > 0.01)
        v.push(`Nadel-Füllung ${atlas.fill[nadel.zelle].toFixed(4)} ≠ Steckbrief ${nadel.fuellung}`);
    return v;
}
// Deckung je Paar: p.art ∈ laub | nadel | klinge, p.l0 = L0-Laubfläche, p.l1 = L1-Fläche (Karte bzw. Klinge).
function deckungsWert(p, at) {
    if (p.art === "laub") return (p.l1 * (at.steckbrief.fuellung / (at.steckbrief.kern * at.steckbrief.kern))) / p.l0;
    if (p.art === "nadel") return (2 * p.l1 * at.nadel.fuellung) / p.l0;
    return p.l1 / p.l0;
}
function deckungsUrteil(paare, band, at) {
    const v = [];
    for (const [k, p] of Object.entries(paare)) {
        if (!(p.l0 > 0) || !(p.l1 > 0)) continue;
        const d = deckungsWert(p, at);
        p.deckung = d;
        if (d < band[0] || d > band[1])
            v.push(`${k} (${p.art}): L1 deckt ${d.toFixed(2)}x L0, Band [${band.join(", ")}]`);
    }
    return v;
}

(async () => {
    if (!fs.existsSync(DIR)) {
        console.error(
            `❌ Keine Goldens in ${path.relative(process.cwd(), DIR)} — erst 'node scripts/mint-asset-goldens.cjs'.`
        );
        process.exit(1);
    }
    const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".json") && parseName(f));
    if (!files.length) {
        console.error("❌ Keine Asset-Goldens gefunden.");
        process.exit(1);
    }
    const fails = [];
    let ok = 0;
    const paare = {};
    const messungen = [];
    let wand = null;
    await runWithWorker(PORT, async ({ build, getData, atlas }) => {
        // Daten-Kanäle gegen die eingefrorenen JSONs.
        // SYNERGIE-WELLE — DER EINE UMSCHLAG (get-book): die drei Daten-Payloads reisen
        // in EINEM Reply; die eingefrorenen JSONs (recipes/world-params/render-config)
        // bleiben die BYTE-Wahrheit der Payloads (nur der Umschlag wechselte).
        const bookReply = await getData("get-book");
        for (const [key, field] of [
            ["recipes", "book"],
            ["world-params", "worldParams"],
            ["render-config", "renderConfig"],
        ]) {
            const goldPath = path.join(DIR, key + ".json");
            if (!fs.existsSync(goldPath)) continue;
            const gold = fs.readFileSync(goldPath, "utf8").trim();
            const live = JSON.stringify(bookReply[field]);
            if (live !== gold) fails.push(`${key}: divergiert vom eingefrorenen JSON`);
        }
        const buch = bookReply.book || {};
        const lodB = bookReply.renderConfig && bookReply.renderConfig.lod;
        const budget = lodB && lodB.budget;
        const stufen = (lodB && lodB.kindStages) || {};
        const artVon = (preset) => buch[preset] && buch[preset].kind;
        const gemessen = new Set();
        const miss = (c, a, fall) => {
            const kind = artVon(c.presetId);
            if (!budget || !budget[kind]) return;
            // Nur GELIEFERTE Stufen: eine nicht deklarierte (die Strauch-L0, der Host klemmt sie auf L1) bleibt
            // ein Byte-Golden ohne Budget.
            if (!Array.isArray(stufen[kind]) || stufen[kind].indexOf(c.lod) < 0) return;
            const k = kosten(a.meshes);
            messungen.push({ kind, lod: c.lod, fall, tris: k.tris, sippen: k.sippen });
            gemessen.add(c.presetId + "|" + c.lod);
        };
        for (const f of files) {
            const c = parseName(f);
            const gold = JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
            const a = await build(c);
            const rec = {
                cv: a.cv,
                presetId: a.presetId,
                seed: a.seed,
                lod: a.lod,
                meshes: fingerprintMeshes(a.meshes),
            };
            const se = schemaError(rec);
            if (se) {
                fails.push(`${f}: Schema — ${se}`);
                continue;
            }
            const de = meshDiff(f, gold.meshes, rec.meshes);
            if (de) {
                fails.push(de);
                // Die Linse nennt den Täter: die gebauten Bytes des ersten divergierenden Attributs reisen ins Log
                // (base64, gedeckelt), damit ein Plattform-Unterschied (CI-Runner gegen Präge-Maschine) Wert für Wert
                // gegen den lokalen Bau verglichen werden kann — ein sha256 allein nennt keinen Wert.
                const mm = /Mesh(\d+)\.(\w+): sha256-Divergenz/.exec(de);
                const roh = mm && a.meshes[+mm[1]] && a.meshes[+mm[1]].attrs[mm[2]];
                if (roh && roh.b64 && roh.b64.length <= 65536)
                    console.log(`DIVERGENZ-BYTES ${f} Mesh${mm[1]}.${mm[2]} ${roh.b64}`);
            } else ok++;
            miss(c, a, f.replace(/\.json$/, ""));
            if (c.lod <= 1 && artVon(c.presetId) === "tree") {
                const pk = `${c.presetId}-s${c.seed}-${c.season}`;
                const fx = (buch[c.presetId] && buch[c.presetId].fx) || {};
                const pp = paare[pk] || (paare[pk] = { l0: 0, l1: 0, art: null });
                if (c.lod === 0) pp.l0 = flaeche(a.meshes, "foliage");
                else {
                    const karte = flaeche(a.meshes, "foliageTex");
                    pp.art = karte > 0 ? (fx.conifer ? "nadel" : "laub") : "klinge";
                    pp.l1 = karte > 0 ? karte : flaeche(a.meshes, "foliage");
                }
            }
            if (fails.length >= 8) break;
        }
        // Jede gelieferte Gitter-Stufe jedes Rezepts einer Art mit Budget, die kein Golden trägt: Samen 7, Sommer.
        if (budget)
            for (const preset of Object.keys(buch)) {
                const kind = artVon(preset);
                if (!budget[kind] || !Array.isArray(stufen[kind])) continue;
                for (const lod of stufen[kind]) {
                    const z = budget[kind][lod];
                    if ((z && z.karte) || gemessen.has(preset + "|" + lod)) continue;
                    const c = { presetId: preset, seed: 7, lod, season: "summer" };
                    miss(c, await build(c), `${preset}-s7-L${lod}-summer`);
                }
            }
        const at = await atlas();
        const band = budget && budget.tree && budget.tree[1] && budget.tree[1].deckung;
        wand = { at, band, budget, stufen, b1: budget && budget.tree && budget.tree[1] };
        if (!budget) fails.push("Budget: render-config trägt kein lod.budget");
        else if (!Array.isArray(band)) fails.push("Budget: render-config trägt kein lod.budget.tree[1].deckung");
        else {
            fails.push(...kostenUrteil(messungen, budget).map((x) => "Kosten: " + x));
            fails.push(...steckbriefUrteil(at, at.steckbrief, at.nadel).map((x) => "Steckbrief: " + x));
            fails.push(...deckungsUrteil(paare, band, at).map((x) => "Deckung: " + x));
        }
    });
    if (wand && wand.budget && Array.isArray(wand.band)) {
        const B = wand.budget;
        // Die Kosten je Zeile: Maximum über alle gebauten Fälle, der Täter-Kandidat steht daneben.
        const zeilen = [];
        for (const k of Object.keys(wand.stufen))
            for (const st of wand.stufen[k]) {
                const z = B[k] && B[k][st];
                if (!z) continue;
                const mm = messungen.filter((x) => x.kind === k && x.lod === st);
                if (z.karte) {
                    const mx = mm.reduce((s, x) => Math.max(s, x.tris), 0);
                    zeilen.push(
                        `${k}[${st}] Karte (${z.tris})${mm.length ? ` · L2-Gitter nicht geliefert, max ${mx}` : ""}`
                    );
                    continue;
                }
                const top = mm.reduce((s, x) => (!s || x.tris > s.tris ? x : s), null);
                zeilen.push(
                    `${k}[${st}] ${top ? top.tris : "—"}/${z.tris} (${mm.length} Fälle, max ${top ? top.fall : "—"})`
                );
            }
        console.log("Budget-Wand (Dreiecke max/Zeile):\n  " + zeilen.join("\n  "));
        const at = wand.at;
        console.log(
            `Atlas: Breitblatt-Kern bis ${Math.max(...at.ext.slice(0, at.steckbrief.zellen)).toFixed(4)} (Steckbrief ${at.steckbrief.kern}) · ` +
                `Füllung ${(at.fill.slice(0, at.steckbrief.zellen).reduce((s, x) => s + x, 0) / at.steckbrief.zellen).toFixed(4)} (${at.steckbrief.fuellung}) · ` +
                `Nadel-Zelle bis ${at.ext[at.nadel.zelle].toFixed(4)} · Füllung ${at.fill[at.nadel.zelle].toFixed(4)} (${at.nadel.fuellung})`
        );
        const gemesseneP = Object.entries(paare).filter(([, p]) => p.deckung != null);
        console.log(
            `L1-Deckung (Band ${wand.band.join("–")}): ` +
                gemesseneP.map(([k, p]) => `${k} ${p.art} ${p.deckung.toFixed(2)}`).join(" · ")
        );
        // SELBST-TESTS — die Wand ist nicht vakuös:
        //  (1) JEDE Gitter-Zeile halbiert (tris/2) und um eine Sippe gesenkt MUSS rot werden;
        //  (2) jede Gitter-Zeile hat ≥ 1 gebauten Fall;
        //  (3) die Laub-Karte von gestern (Kante 2,35 statt blattKarte) MUSS das Band sprengen;
        //  (4) eine Nadel-Karte 1,5× so lang MUSS das Band sprengen;
        //  (5) ein Kern unter der gemalten Ausdehnung MUSS den Steckbrief brechen;
        //  (6) Deckung an Laub-, Nadel- und Klingen-Paaren gemessen.
        const halb = [],
            leer = [];
        for (const k of Object.keys(wand.stufen))
            for (const st of wand.stufen[k]) {
                const z = B[k] && B[k][st];
                if (!z || z.karte) continue;
                if (!messungen.some((x) => x.kind === k && x.lod === st)) {
                    leer.push(`${k}[${st}]`);
                    continue;
                }
                for (const [feld, wert] of [
                    ["tris", Math.floor(z.tris / 2)],
                    ["draws", z.draws - 1],
                ]) {
                    const B2 = JSON.parse(JSON.stringify(B));
                    B2[k][st][feld] = wert;
                    if (!kostenUrteil(messungen, B2).some((x) => x.startsWith(`${k}[${st}] `)))
                        halb.push(`${k}[${st}].${feld}`);
                }
            }
        const s1 = halb.length === 0;
        const s2 = leer.length === 0;
        const laubP = gemesseneP.filter(([, p]) => p.art === "laub");
        const nadelP = gemesseneP.filter(([, p]) => p.art === "nadel");
        const gestern = {};
        for (const [k, p] of laubP)
            gestern[k] = Object.assign({}, p, { l1: p.l1 * Math.pow(2.35 / wand.b1.blattKarte, 2) });
        const s3 = laubP.length > 0 && deckungsUrteil(gestern, wand.band, at).length === laubP.length;
        const lang = {};
        for (const [k, p] of nadelP) lang[k] = Object.assign({}, p, { l1: p.l1 * 2.25 });
        const s4 = nadelP.length > 0 && deckungsUrteil(lang, wand.band, at).length === nadelP.length;
        const s5 = steckbriefUrteil(at, Object.assign({}, at.steckbrief, { kern: 0.6 }), at.nadel).length > 0;
        const arten = new Set(gemesseneP.map(([, p]) => p.art));
        const s6 = arten.has("laub") && arten.has("nadel") && arten.has("klinge");
        console.log(
            `Selbsttest Budget-Wand: jede Zeile halbiert/−1 Sippe wird rot ${s1 ? "✅" : "❌ " + halb.join(",")} · ` +
                `jede Gitter-Zeile gemessen ${s2 ? "✅" : "❌ " + leer.join(",")} · Laub-Karte 2,35 sprengt das Band ${s3 ? "✅" : "❌"} · ` +
                `Nadel-Karte 1,5× sprengt das Band ${s4 ? "✅" : "❌"} · Kern 0,6 bricht den Steckbrief ${s5 ? "✅" : "❌"} · ` +
                `${gemesseneP.length} Paare (Laub/Nadel/Klinge) ${s6 ? "✅" : "❌"}`
        );
        if (!s1 || !s2 || !s3 || !s4 || !s5 || !s6) fails.push("Selbsttest der Budget-Wand feuert nicht");
    }

    console.log("=== ASSET-VERTRAG v1 — Konformanz-Gate ===");
    console.log(`Goldens: ${files.length} · byte-gleich: ${ok}`);
    if (fails.length) {
        console.error("\n❌ ROT — erste Befunde:");
        for (const x of fails.slice(0, 8)) console.error("  • " + x);
        process.exit(1);
    }
    console.log("\n✅ GRÜN — der Generator trifft die eingefrorenen Goldens byte-genau (cv:1). Kein stiller Drift.");
    process.exit(0);
})().catch((e) => {
    console.error("Gate-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
