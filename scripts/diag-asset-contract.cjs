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

// DIE BUDGET-WAND (04.10., echte GPU an der Mess-Wiese): die L1-Laubkarten von Eiche/Birke rasterten 10,5x
// die Fläche der L0-Klingen desselben Baums (162 Bildschichten, 8-12 ms GPU), weil die Karte die leere
// Atlas-Zelle mitschleppte und ihre Kante (2,35 Blatt-Größen) die Krone 1,7x bedeckte. Zwei Urteile, rein:
//  (A) STECKBRIEF — der gemalte broadleaf-Atlas passt in den deklarierten Kern (Alpha>0 nie jenseits `kern`,
//      sonst schnitte der Zuschnitt Blätter ab) und seine Füllung ist die deklarierte (±0,01).
//  (D) DECKUNG — gebaute L1-Kartenfläche × Kern-Füllung / gebaute L0-Klingenfläche liegt im Budget-Band
//      (die Karte ist auf den Kern zugeschnitten: Kern-Füllung = fuellung / kern², die Zell-Füllung im Quadrat)
//      (render-config lod.budget.tree[1].deckung), je Art × Samen × Saison.
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
function steckbriefUrteil(atlas, sb) {
    const v = [];
    if (!sb || !(sb.kern > 0) || !(sb.fuellung > 0)) return ["Steckbrief BLATT_ATLAS_BREIT fehlt"];
    atlas.ext.forEach((e, c) => {
        if (e > sb.kern) v.push(`Zelle ${c}: Alpha reicht bis ${e.toFixed(4)} > kern ${sb.kern}`);
    });
    const f = atlas.fill.reduce((s, x) => s + x, 0) / atlas.fill.length;
    if (Math.abs(f - sb.fuellung) > 0.01) v.push(`Füllung ${f.toFixed(4)} ≠ Steckbrief ${sb.fuellung}`);
    return v;
}
const kernFuellung = (sb) => sb.fuellung / (sb.kern * sb.kern);
function deckungsUrteil(paare, band, fuellung) {
    const v = [];
    for (const [k, p] of Object.entries(paare)) {
        if (!(p.l0 > 0) || !(p.l1 > 0)) continue;
        const d = (p.l1 * fuellung) / p.l0;
        p.deckung = d;
        if (d < band[0] || d > band[1]) v.push(`${k}: L1 deckt ${d.toFixed(2)}x L0, Band [${band.join(", ")}]`);
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
            if (de) fails.push(de);
            else ok++;
            if (c.lod <= 1) {
                const pk = `${c.presetId}-s${c.seed}-${c.season}`;
                const pp = paare[pk] || (paare[pk] = { l0: 0, l1: 0 });
                if (c.lod === 0) pp.l0 = flaeche(a.meshes, "foliage");
                else pp.l1 = flaeche(a.meshes, "foliageTex");
            }
            if (fails.length >= 8) break;
        }
        // DIE BUDGET-WAND — gegen den Maler und die gebauten Paare.
        const at = await atlas();
        const lodB = bookReply.renderConfig && bookReply.renderConfig.lod && bookReply.renderConfig.lod.budget;
        const band = lodB && lodB.tree && lodB.tree[1] && lodB.tree[1].deckung;
        wand = { at, band, karte: lodB && lodB.tree && lodB.tree[1] && lodB.tree[1].blattKarte };
        if (!Array.isArray(band)) fails.push("Budget: render-config trägt kein lod.budget.tree[1].deckung");
        else {
            fails.push(...steckbriefUrteil(at, at.steckbrief).map((x) => "Steckbrief: " + x));
            fails.push(...deckungsUrteil(paare, band, kernFuellung(at.steckbrief)).map((x) => "Deckung: " + x));
        }
    });
    const gemessen = Object.entries(paare).filter(([, p]) => p.deckung != null);
    if (wand && Array.isArray(wand.band)) {
        console.log(
            `Atlas-Kern: Alpha bis ${Math.max(...wand.at.ext).toFixed(4)} (Steckbrief ${wand.at.steckbrief.kern}) · ` +
                `Füllung ${(wand.at.fill.reduce((s, x) => s + x, 0) / 4).toFixed(4)} (Steckbrief ${wand.at.steckbrief.fuellung})`
        );
        console.log(
            `L1-Deckung (Band ${wand.band.join("–")}): ` +
                gemessen.map(([k, p]) => `${k} ${p.deckung.toFixed(2)}`).join(" · ")
        );
        // SELBST-TEST — die Wand ist nicht vakuös: (1) die Karte von gestern (Kante 2,35 statt blattKarte)
        // MUSS das Band sprengen; (2) ein Kern unter der gemalten Ausdehnung MUSS den Steckbrief brechen;
        // (3) ohne gemessene Paare wäre die Deckung vakuös.
        const gestern = {};
        for (const [k, p] of gemessen) gestern[k] = { l0: p.l0, l1: p.l1 * Math.pow(2.35 / wand.karte, 2) };
        const s1 = deckungsUrteil(gestern, wand.band, kernFuellung(wand.at.steckbrief)).length === gemessen.length;
        const s2 = steckbriefUrteil(wand.at, { kern: 0.6, fuellung: wand.at.steckbrief.fuellung }).length > 0;
        const s3 = gemessen.length >= 4;
        console.log(
            `Selbsttest Budget-Wand: Karte 2,35 sprengt das Band ${s1 ? "✅" : "❌"} · Kern 0,6 bricht den Steckbrief ${s2 ? "✅" : "❌"} · ${gemessen.length} Paare ${s3 ? "✅" : "❌"}`
        );
        if (!s1 || !s2 || !s3) fails.push("Selbsttest der Budget-Wand feuert nicht");
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
