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
const { probeWand } = require("./lib/plattform-probe.cjs");
const { bildDeckung, kroneAus, kartenSkaliert, schwebe, unterBoden } = require("./lib/kronen-linse.cjs");
require("../phyto-core.js"); // das Budget-Gesetz (budgetSippen · kerneVereinen) — dieselbe Datei wie Worker und Wirt
const PC = globalThis.__phytoCore;

const PORT = Number(process.env.CONTRACT_PORT || 4542);
const DIR = path.resolve(__dirname, "..", "spec", "asset-contract", "v1", "golden");

function parseName(f) {
    // <preset>-s<seed>-L<lod>-<season>.json
    const m = f.match(/^(.+)-s(-?\d+)-L(\d+)-(\w+)\.json$/);
    if (!m) return null;
    return { presetId: m[1], seed: Number(m[2]), lod: Number(m[3]), season: m[4] };
}

// DER KARTEN-RUNDLAUF (W6, Karten-Gesetz in phyto-core): je Fall (Art, Same) bäckt das Studio die Karte, der Codec
// kodiert sie zur Atlas-Schicht (BC1-sRGB-Albedo mit deckungstreuen Mips, BC5-Normale auf 1/normalTeiler) und
// dekodiert sie zurück. Die Wand: Alpha an der Schwelle bitgleich · Albedo-PSNR ≥ 32 dB (opake Texel) · Normalwinkel
// im Mittel ≤ 4° · Mip-Deckung jeder Stufe = Stufe 0 ± 3 % · Schicht ≤ 0,25 MiB · die lineare Kronenfarbe der als sRGB dekodierten Schicht
// = Studio-Eingang ± 3 % (die Blick-Tour sah die linearen Bytes als sRGB gelesen: Laub 0,12 → 0,013, die Krone schwarz).
const KARTEN_FAELLE = [
    ["eiche", 1],
    ["fichte", 1],
    ["birke", 2],
    ["strauch", 1],
];
function kartenUrteil(m) {
    const aus = [];
    if (!m || m.fehler) return [`kein Rundlauf (${m ? m.fehler : "—"})`];
    if (m.alphaFehl !== 0) aus.push(`Alpha an der Schwelle nicht bitgleich (${m.alphaFehl} Texel)`);
    if (!(m.psnr >= 32)) aus.push(`Albedo-PSNR ${(m.psnr || 0).toFixed(2)} dB < 32`);
    if (!(m.winkelMittel <= 4)) aus.push(`Normalwinkel Ø ${(m.winkelMittel || 0).toFixed(2)}° > 4°`);
    // das Karten-Budget: eine Schicht (Albedo + Normale, alle Stufen) kostet höchstens 0,25 MiB — Karten-MB ≤ Zellen × 0,25
    if (!(m.bytes <= 0.25 * 1048576)) aus.push(`Schicht ${((m.bytes || 0) / 1048576).toFixed(3)} MiB > 0,25 MiB`);
    const d = m.deckung || [];
    if (!d.length || d.some((x) => !(Math.abs(x - d[0]) <= 0.03 * d[0])))
        aus.push(`Mip-Deckung ${d.map((x) => x.toFixed(4)).join("/")} weicht > 3 % von Stufe 0 ab`);
    const f = m.farbe;
    const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    if (!f || !(Math.abs(lum(f.aus) / Math.max(1e-6, lum(f.ein)) - 1) <= 0.03))
        aus.push(
            `Kronen-Farbe: die dekodierte Schicht trägt ${f ? lum(f.aus).toFixed(4) : "—"} statt ${f ? lum(f.ein).toFixed(4) : "—"} (linear)`
        );
    return aus;
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
        // Der Wurf-Teil der Baum-L1 (W6): die Zahl der werfenden Dreiecke ist Teil des Vertrags.
        if ((a.wurf === undefined ? null : a.wurf) !== (b.wurf === undefined ? null : b.wurf))
            return `${tag} Mesh${i}: wurf ${a.wurf} vs ${b.wurf}`;
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
//  (K) KOSTEN — jede gelieferte Gitter-Stufe jeder Art wird über die echte Brücke gebaut (alle Golden-Fälle,
//      jedes Rezept der Art bei Samen 7, wo kein Golden die Stufe trägt, und JEDE GESTALT DER WELT: die Samen
//      1..V aus budget.gestalten, mit denen der Host baut — W5) und gegen ihre Zeile gehalten:
//      Dreiecke ≤ tris, Draws (phyto-core budgetSippen = die Regel des Wirts, Stoff mit Seh-Klasse) ≤ draws. Rot nennt den
//      Täter: `tree[1] weide-s12345-L1-summer: 10204 Dreiecke > 10000`. Die Karten-Stufe (karte) ist kein
//      Gitter — ihre L2-Geometrie wird nicht geliefert (die Karten-Linse in gate:studio-vertrag hält das).
//  (A) STECKBRIEF — der gemalte EINE Blatt-Atlas passt in die deklarierten Kerne (Alpha>0 nie jenseits `kern`)
//      und seine Füllungen sind die deklarierten (±0,01): Breitblatt-Zellen und Nadel-Zelle.
//  (D) DECKUNG — die gebaute L1-Krone bedeckt die L0-Krone desselben Baums im Band budget.tree[1].deckung, als
//      Verhältnis der BILD-DECKUNG (scripts/lib/kronen-linse.cjs, S7): die Silhouette gerastert in 24 Ansichten (acht
//      Azimute × Blick-Hebung 0°/30°/60° von unten), Karten mit der Alpha des EINEN Atlas — ein Pixel zählt einmal.
//      Die Flächen-Summe von gestern (mittlere Projektion nach Cauchy) sah keine Überlappung: sie meldete 0,99, das
//      Labor-Bild zeigte 0,76 (Prüfer W5, R3). Je Art × Same (Sommer; die Winter-Krone ist dieselbe Gestalt).
//  (S) SCHWEBE + BODEN — jede Karte einer Baum-L0 hängt an ihrer Rinde (oder an einer hängenden Karte: die Strähne ist
//      eine Kette), kein Laub liegt unter dem Boden der Vorlage (Prüfer W5, R1/R2: schwebende Nadel-Karten, Strähnen
//      ohne Peitsche und unter dem Boden-Rand). Rot nennt den Fall, die Zahl und eine Stelle.
const dekodiere = (b64, Typ) => {
    const b = Buffer.from(b64, "base64");
    return new Typ(b.buffer, b.byteOffset, b.byteLength / Typ.BYTES_PER_ELEMENT);
};
// Dreiecke und Draws einer gebauten Antwort — DIESELBE Regel wie Budget-Gesetz und Wirt (phyto-core budgetSippen:
// je Stoff × Attribut-Form ein Draw, jedes Flügel-Teil und jede Haut eines; Beipack ohne position zählt nicht).
function teileAus(meshes) {
    return (meshes || [])
        .filter((m) => m.attrs && m.attrs.position)
        .map((m) => {
            const t = { kind: m.kind, mat: m.mat };
            if (m.tuer) t.tuer = m.tuer;
            if (m.joint) t.joint = m.joint;
            for (const k of Object.keys(m.attrs))
                t[k] = { array: dekodiere(m.attrs[k].b64, Float32Array), itemSize: m.attrs[k].itemSize };
            if (m.index) t.index = dekodiere(m.index, Uint32Array);
            return t;
        });
}
function kosten(meshes) {
    const k = PC.budgetSippen(teileAus(meshes));
    return { tris: k.tris, draws: k.draws };
}
// DAS SEH-GESETZ an gelieferten Stufen (Integration W8): jeder Stoff trägt seine Seh-Klasse aus dem Gesetzbuch, und
// auch auf EINEN Draw gezwungen faltet nichts über die Grenze von Bindung × Seh-Klasse × Glimmen — der Ausgang bleibt
// über der Zeile und meldet den Bruch, statt das Auge in die Haut zu falten. Rot nennt Fall und Stoff.
const SEH_FAELLE = [
    ["mensch", 0], // Auge · Haut · Haar · Stoff
    ["wolf", 0], // das glimmende Auge · Hornhaut · Nase · Fell
    ["suv", 0], // Glas · Chrom · Lack · Gummi · Lichter
    ["alemannisch", 1], // Glas · Putz · Holz
    ["verkalkt", 0], // Metall · Stein · Leucht-Linien, je Flügel
];
const sehVon = (stoff) => {
    const m = /\|v:([a-z]+)/.exec(stoff || "");
    return m ? m[1] : null;
};
const glimmt = (stoff) => /\|e:/.test(stoff || "");
function sehKreuz(faltungen) {
    return faltungen
        .filter((f) => sehVon(f.von) !== sehVon(f.nach) || glimmt(f.von) !== glimmt(f.nach))
        .map((f) => `faltet über die Seh-Grenze ${f.von} → ${f.nach}`);
}
function sehUrteil(proben) {
    const v = [];
    for (const p of proben) {
        const ohne = p.teile.filter((t) => !PC.budgetSeh(t.mat));
        if (ohne.length) v.push(`${p.fall}: ${ohne.length} Stoffe ohne Seh-Klasse (${PC.budgetStoff(ohne[0].kind, ohne[0].mat)})`);
        const res = PC.budgetErzwingen(p.teile, { tris: 1e12, draws: 1 });
        v.push(...sehKreuz(res.bericht.faltungen).map((x) => `${p.fall}: ${x}`));
        const klassen = new Set(p.teile.map((t) => PC.budgetSeh(t.mat)));
        if (res.bericht.nachher.draws < klassen.size)
            v.push(`${p.fall}: auf ${res.bericht.nachher.draws} Draws gefaltet, trägt aber ${klassen.size} Seh-Klassen`);
    }
    return v;
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
        if (mm.draws > z.draws) v.push(`${mm.kind}[${mm.lod}] ${mm.fall}: ${mm.draws} Draws > ${z.draws}`);
    }
    return v;
}
function steckbriefUrteil(atlas, breit, nadel, gross, weide) {
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
    // Die Großblatt-Zelle (05.10.: Strauch) und die Weiden-Zelle (Integration 05.10.: die Trauer-Strähnen) — Kern wie
    // die Baum-Zweige, je eine eigene Füllung.
    for (const [name, z] of [
        ["GROSS", gross],
        ["WEIDE", weide],
    ]) {
        if (!z || !Number.isInteger(z.zelle) || !(z.fuellung > 0)) {
            v.push(`Steckbrief BLATT_ATLAS_${name} fehlt`);
            continue;
        }
        if (atlas.ext[z.zelle] > breit.kern)
            v.push(`${name}-Zelle ${z.zelle}: Alpha reicht bis ${atlas.ext[z.zelle].toFixed(4)} > kern ${breit.kern}`);
        if (Math.abs(atlas.fill[z.zelle] - z.fuellung) > 0.01)
            v.push(`${name}-Füllung ${atlas.fill[z.zelle].toFixed(4)} ≠ Steckbrief ${z.fuellung}`);
    }
    return v;
}
// Die Bild-Deckung eines Paars: L1 gegen L0 auf demselben Raster (Pixel-Kante = L0-Höhe / 300).
function deckungsWert(p, atlas) {
    const px = p.H / 300;
    return bildDeckung(p.l1, atlas, px).mittel / bildDeckung(p.l0, atlas, px).mittel;
}
function deckungsUrteil(paare, band, atlas) {
    const v = [];
    for (const [k, p] of Object.entries(paare)) {
        if (!p.l0 || !p.l1 || !p.l0.length || !p.l1.length) continue;
        const d = deckungsWert(p, atlas);
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
    let karten = null;
    const schwebeMess = [];
    let schwebeProbe = null;
    const sehProben = [];
    await runWithWorker(PORT, async ({ build, kostenListe, getData, atlas, atlasAlpha, karte, probeLauf }) => {
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
        // DER UMSCHLAG WIE DER WIRT IHN LIEST (W8): die Zweit-Kern-Blöcke (Stufen · Budget · Gestalten) fallen über
        // DIESELBE Funktion in die EINEN Karten wie in `_foundryIngestRenderConfig` (phyto-core kerneVereinen).
        const vereint = (rc) => PC.kerneVereinen(JSON.parse(JSON.stringify(rc || {})));
        const rcV = vereint(bookReply.renderConfig);
        const lodB = rcV.lod;
        const budget = lodB && lodB.budget;
        const stufen = (lodB && lodB.kindStages) || {};
        const gestalten = (budget && budget.gestalten) || {};
        // Die Arten der Zweit-Kerne (aus dem Umschlag, VOR dem Merge): je Art ihr Kern.
        const kernVonArt = {};
        const zks = (bookReply.renderConfig && bookReply.renderConfig.lod && bookReply.renderConfig.lod.zusatzKindStages) || {};
        for (const core in zks) for (const k in zks[core]) if (!(k in kernVonArt)) kernVonArt[k] = core;
        const artVon = (preset) => buch[preset] && buch[preset].kind;
        const gemessen = new Set(),
            gemessenFall = new Set();
        // SCHWEBE + BODEN je gebauter Baum-L0 (Goldens und Gestalten der Welt).
        const kroneWand = (c, a, fall) => {
            if (c.lod !== 0 || artVon(c.presetId) !== "tree") return;
            const sw = schwebe(a.meshes);
            schwebeMess.push({ fall, karten: sw.karten, schwebend: sw.schwebend });
            if (sw.schwebend > 0)
                fails.push(`Schwebe: ${fall}: ${sw.schwebend} von ${sw.karten} Karten ohne Träger (z. B. bei ${sw.beispiel})`);
            const yb = unterBoden(kroneAus(a.meshes));
            if (yb < 0) fails.push(`Boden: ${fall}: Laub reicht bis y = ${yb.toFixed(3)} unter den Boden der Vorlage`);
        };
        const miss = (c, a, fall) => {
            const kind = artVon(c.presetId);
            if (!budget || !budget[kind]) return;
            // Nur GELIEFERTE Stufen: eine nicht deklarierte (die Strauch-L0, der Host klemmt sie auf L1) bleibt
            // ein Byte-Golden ohne Budget.
            if (!Array.isArray(stufen[kind]) || stufen[kind].indexOf(c.lod) < 0) return;
            const k = a.meshes ? kosten(a.meshes) : a;
            messungen.push({ kind, lod: c.lod, fall, tris: k.tris, draws: k.draws, budget: a.budget || null });
            if (a.budgetBruch) fails.push(`Budget-Bruch ${fall}: ${JSON.stringify(a.budgetBruch)}`);
            gemessen.add(c.presetId + "|" + c.lod);
            if (c.season === "summer") gemessenFall.add(c.presetId + "|" + c.seed + "|" + c.lod);
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
            kroneWand(c, a, f.replace(/\.json$/, ""));
            // (W) DER WURF-TEIL (W6, Konsum von tree[1].wurf): jedes Teil der Baum-L1 nennt die Zahl seiner werfenden
            // Dreiecke (der Index-Vorsatz) — ganzzahlig in [0, Dreiecke des Teils], und der Baum wirft überhaupt. Der Wirt
            // bricht ohne die Zahl (KERN-PFLICHT); hier fällt der Bruch am Studio-Ausgang auf, Teil für Teil benannt.
            if (c.lod === 1 && artVon(c.presetId) === "tree") {
                let wirft = 0;
                a.meshes.forEach((m, i) => {
                    if (!m.attrs || !m.attrs.position) return;
                    const nv = Buffer.from(m.attrs.position.b64, "base64").length / 12;
                    const ni = m.index ? Buffer.from(m.index, "base64").length / 4 : nv; // der Studio-Index reist als Uint32
                    const tris = m.index ? ni / 3 : nv / 3;
                    if (!Number.isInteger(m.wurf) || m.wurf < 0 || m.wurf > tris)
                        fails.push(`Wurf-Teil ${f} Mesh${i} (${m.kind}): wurf ${m.wurf} nicht in [0, ${tris}]`);
                    else wirft += m.wurf;
                });
                if (!(wirft > 0)) fails.push(`Wurf-Teil ${f}: kein Teil wirft`);
            }
            if (c.lod <= 1 && artVon(c.presetId) === "tree" && c.season === "summer") {
                const pk = `${c.presetId}-s${c.seed}-${c.season}`;
                const fx = (buch[c.presetId] && buch[c.presetId].fx) || {};
                const pp = paare[pk] || (paare[pk] = { l0: null, l1: null, art: null, conifer: !!fx.conifer, H: 0 });
                const krone = kroneAus(a.meshes);
                if (c.lod === 0) {
                    pp.l0 = krone;
                    let lo = Infinity,
                        hi = -Infinity;
                    for (const m of a.meshes) {
                        if (!m.attrs || !m.attrs.position) continue;
                        const b = Buffer.from(m.attrs.position.b64, "base64");
                        const p = new Float32Array(b.buffer, b.byteOffset, b.byteLength / 4);
                        for (let i = 1; i < p.length; i += 3) {
                            if (p[i] < lo) lo = p[i];
                            if (p[i] > hi) hi = p[i];
                        }
                    }
                    pp.H = hi - Math.max(0, lo);
                } else {
                    pp.art = krone.some((m) => m.kind === "foliageTex") ? (fx.conifer ? "nadel" : "laub") : "klinge";
                    pp.l1 = krone;
                }
            }
            if (fails.length >= 8) break;
        }
        // Jede gelieferte Gitter-Stufe jedes Rezepts einer Art mit Budget, die kein Golden trägt: Samen 7, Sommer.
        // W8 — die Rezepte der ZWEIT-Kerne baut die Wand über JEDEN Samen, den die Welt von ihnen zieht (Gestalt 1..V,
        // V = lod.budget.gestalten[rezept] aus IHREM Gesetzbuch, `_foundryVariantFor`), und jede deklarierte Stufe —
        // gezählt in der Seite (ohne Puffer-Transport). Fehlt die Gestalten-Zahl, ist das ein Bruch (nie still).
        const alle = Object.keys(buch).filter((p) => budget && budget[artVon(p)] && Array.isArray(stufen[artVon(p)]));
        const welt = [];
        for (const preset of alle) {
            const kind = artVon(preset);
            if (kernVonArt[kind] && !(Number.isInteger(gestalten[preset]) && gestalten[preset] >= 1)) {
                fails.push(`Gestalten: ${kernVonArt[kind]}-Rezept ${preset} trägt keine Gestalten-Zahl (lod.budget.gestalten)`);
                continue;
            }
            for (const lod of stufen[kind]) {
                const z = budget[kind][lod];
                if (z && z.karte) continue;
                if (kernVonArt[kind]) {
                    for (let s = 1; s <= gestalten[preset]; s++)
                        welt.push({ presetId: preset, seed: s, lod, season: "summer" });
                    continue;
                }
                if (gemessen.has(preset + "|" + lod)) continue;
                const c = { presetId: preset, seed: 7, lod, season: "summer" };
                miss(c, await build(c), `${preset}-s7-L${lod}-summer`);
            }
        }
        const weltK = welt.length ? await kostenListe(welt) : [];
        welt.forEach((c, i) => miss(c, weltK[i], `${c.presetId}-s${c.seed}-L${c.lod}`));
        // JEDE GESTALT DER WELT (W5): der Host baut je Art die Samen 1..V (budget.gestalten, '*' ohne eigene Zeile,
        // _foundryVariantFor) — die Wand misst, was die Welt liefert, nicht nur die eingefrorenen Samen. Die Zweit-Kerne
        // zählt der Zug oben (ihre Gestalten aus IHREM Gesetzbuch, in der Seite gezählt).
        const G = gestalten;
        if (budget && G)
            for (const preset of alle) {
                const kind = artVon(preset);
                if (kernVonArt[kind]) continue;
                const V = Number.isInteger(G[preset]) ? G[preset] : G["*"];
                for (const lod of stufen[kind]) {
                    const z = budget[kind][lod];
                    if (z && z.karte) continue;
                    for (let v = 1; v <= V; v++) {
                        if (gemessenFall.has(preset + "|" + v + "|" + lod)) continue;
                        const c = { presetId: preset, seed: v, lod, season: "summer" };
                        const a = await build(c);
                        miss(c, a, `${preset}-s${v}-L${lod}-summer (Gestalt)`);
                        kroneWand(c, a, `${preset}-s${v}-L${lod}-summer (Gestalt)`);
                    }
                }
            }
        // DER KARTEN-RUNDLAUF (W6): echte Studio-Bakes durch den Karten-Codec (BC) und zurück, plus der Selbsttest
        // (eine gestörte BC1-Albedo).
        {
            const pr = await build({ presetId: "fichte", seed: 7, lod: 0, season: "summer" });
            schwebeProbe = pr.meshes;
        }
        // DIE SEH-PROBEN (Integration W8): gelieferte Zweit-Kern-Stufen mit Auge, Glas, Metall, Haar und Glimmen — die
        // Wand prüft an ihnen das Seh-Gesetz in Node (dieselbe phyto-core-Funktion wie Brücke und Ofen).
        for (const [p, l] of SEH_FAELLE) {
            const a = await build({ presetId: p, seed: 1, lod: l, season: "summer" });
            sehProben.push({ fall: `${p}-s1-L${l}`, teile: teileAus(a.meshes) });
        }
        karten = { faelle: {}, gestoert: null };
        for (const [p, sd] of KARTEN_FAELLE) karten.faelle[p + "|" + sd] = await karte(p, sd);
        karten.gestoert = await karte(KARTEN_FAELLE[0][0], KARTEN_FAELLE[0][1], "bc1");
        // SELBST-TEST S3 (W8) vorbereitet: der Umschlag OHNE zusatzBudget — welche Kerne verlieren ihre Zeilen?
        const ohneZB = JSON.parse(JSON.stringify(bookReply.renderConfig || {}));
        if (ohneZB.lod) delete ohneZB.lod.zusatzBudget;
        const budgetOhneZB = (vereint(ohneZB).lod || {}).budget || {};
        wand = { budgetOhneZB, kernVonArt };
        const at = await atlas();
        const aa = await atlasAlpha();
        const alpha = { w: aa.w, h: aa.h, alpha: new Uint8Array(Buffer.from(aa.b64, "base64")), schwelle: 0.5 };
        const band = budget && budget.tree && budget.tree[1] && budget.tree[1].deckung;
        wand = Object.assign(wand, { at, alpha, band, budget, stufen, b1: budget && budget.tree && budget.tree[1] });
        if (!budget) fails.push("Budget: render-config trägt kein lod.budget");
        else if (!Array.isArray(band)) fails.push("Budget: render-config trägt kein lod.budget.tree[1].deckung");
        else {
            fails.push(...kostenUrteil(messungen, budget).map((x) => "Kosten: " + x));
            fails.push(...steckbriefUrteil(at, at.steckbrief, at.nadel, at.gross, at.weide).map((x) => "Steckbrief: " + x));
            fails.push(...deckungsUrteil(paare, band, alpha).map((x) => "Deckung: " + x));
            fails.push(...sehUrteil(sehProben).map((x) => "Seh: " + x));
        }
        // DIE PLATTFORM-PROBE (S1 Wände, scripts/lib/plattform-probe.cjs): jeder Golden-Fall mit Samen 7 im Sommer baut
        // in einem zweiten Worker noch einmal, während dessen Transzendenten ±1 ULP verschoben rechnen. Die Pflanzen
        // sind ungerastert: ihre Zeile in spec/asset-contract/plattform-ratsche.json nennt je Funktion die kippenden
        // Fälle und die Täter-Stelle — auch Math.pow, denn der Wirt ist das gepinnte Chrome (CI und lokal dieselbe V8;
        // ein Chrome-Wechsel ist der Auslöser, den die Zeile beim Namen nennt).
        const probeFaelle = files
            .map(parseName)
            .filter((c) => c.seed === 7 && c.season === "summer")
            .map((c) => ({ key: `${c.presetId}-s${c.seed}-L${c.lod}-${c.season}`, msg: c }));
        const pruefe = (name, okP, detail) => {
            console.log(`  ${okP ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
            if (!okP) fails.push(`Plattform: ${name}${detail ? " — " + detail : ""}`);
        };
        console.log("Plattform-Probe (Chrome-Worker, alle Transzendenten ±1 ULP):");
        await probeWand("v1", { lauf: probeLauf(probeFaelle) }, pruefe);
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
                const dMax = mm.reduce((s, x) => Math.max(s, x.draws), 0);
                const vor = mm.reduce((s, x) => Math.max(s, x.budget && x.budget.vorher ? x.budget.vorher.draws : 0), 0);
                zeilen.push(
                    `${k}[${st}] ${top ? top.tris : "—"}/${z.tris} · Draws ${dMax}/${z.draws}` +
                        (vor ? ` (ungefaltet bis ${vor})` : "") +
                        (z.band ? ` · Band ${z.band} (${top ? (top.tris / z.band).toFixed(1) : "—"}×)` : "") +
                        ` (${mm.length} Fälle, max ${top ? top.fall : "—"})`
                );
            }
        console.log("Budget-Wand (Dreiecke max/Zeile · Draws max/Zeile):\n  " + zeilen.join("\n  "));
        const at = wand.at;
        console.log(
            `Atlas: Breitblatt-Kern bis ${Math.max(...at.ext.slice(0, at.steckbrief.zellen)).toFixed(4)} (Steckbrief ${at.steckbrief.kern}) · ` +
                `Füllung ${(at.fill.slice(0, at.steckbrief.zellen).reduce((s, x) => s + x, 0) / at.steckbrief.zellen).toFixed(4)} (${at.steckbrief.fuellung}) · ` +
                `Nadel-Zelle bis ${at.ext[at.nadel.zelle].toFixed(4)} · Füllung ${at.fill[at.nadel.zelle].toFixed(4)} (${at.nadel.fuellung}) · ` +
                `Großblatt-Zelle bis ${at.ext[at.gross.zelle].toFixed(4)} · Füllung ${at.fill[at.gross.zelle].toFixed(4)} (${at.gross.fuellung}) · ` +
                `Weiden-Zelle bis ${at.ext[at.weide.zelle].toFixed(4)} · Füllung ${at.fill[at.weide.zelle].toFixed(4)} (${at.weide.fuellung})`
        );
        const gemesseneP = Object.entries(paare).filter(([, p]) => p.deckung != null);
        console.log(
            `L1-Deckung (Band ${wand.band.join("–")}): ` +
                gemesseneP.map(([k, p]) => `${k} ${p.art} ${p.deckung.toFixed(2)}`).join(" · ")
        );
        // SELBST-TESTS — die Wand ist nicht vakuös:
        //  (1) JEDE Gitter-Zeile MUSS rot werden: tris halbiert, draws um EINS gesenkt (die Zeile ist dicht: ihr
        //      Maximum ist gemessen — ein Puffer über dem Gemessenen fiele hier auf);
        //  (2) jede Gitter-Zeile hat ≥ 1 gebauten Fall;
        //  (3) die Laub-Karte von gestern (Kante 2,35 statt blattKarte) MUSS das Band sprengen;
        //  (4) eine Nadel-Karte 1,5× so lang MUSS das Band sprengen;
        //  (5) ein Kern unter der gemalten Ausdehnung MUSS den Steckbrief brechen;
        //  (6) Deckung an Laub-, Nadel- und Klingen-Paaren gemessen;
        //  (7) eine L0-Karte 1,5× so groß (Laub und Nadel) MUSS das Band sprengen (W5: die Nah-Krone hält es auch);
        //  (8) eine Baum-L0 ohne ihre Rinde MUSS schweben (jede Karte ohne Träger);
        //  (9) eine um ihre Höhe abgesenkte Krone MUSS unter dem Boden liegen.
        //  (10, W8) der Umschlag OHNE zusatzBudget: „Budget fehlt" für JEDEN der sechs Zweit-Kerne mit Gestalt;
        //  (11, W8) die Faltung ist der Konsument: je Zweit-Kern-Art liegt ≥ 1 Fall UNGEFALTET über draws (die
        //      Brücke meldet vorher > Zeile) und GEFALTET darin (die Kosten oben);
        //  (12, Seh) ein Stoff ohne Seh-Klasse MUSS brechen (die erste Seh-Probe, ein Stoff entkleidet);
        //  (13, Seh) eine Faltung Auge → Haut und eine Glimmen → ohne Glimmen MUSS die Kreuz-Linse fangen.
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
        // Die Selbsttests der Deckung rastern je Kronen-Art EIN Paar neu (die Wand ist dieselbe Funktion).
        const eins = (P) => P.slice(0, 1);
        const gestern = {};
        for (const [k, p] of eins(laubP))
            gestern[k] = Object.assign({}, p, { l1: kartenSkaliert(p.l1, 2.35 / wand.b1.blattKarte) });
        const s3 = laubP.length > 0 && deckungsUrteil(gestern, wand.band, wand.alpha).length === 1;
        const lang = {};
        for (const [k, p] of eins(nadelP)) lang[k] = Object.assign({}, p, { l1: kartenSkaliert(p.l1, 1.5) });
        const s4 = nadelP.length > 0 && deckungsUrteil(lang, wand.band, wand.alpha).length === 1;
        const grossL0 = {};
        for (const [k, p] of eins(laubP).concat(eins(nadelP)))
            grossL0[k] = Object.assign({}, p, { l0: kartenSkaliert(p.l0, 1.5) });
        const s7 =
            laubP.length > 0 && nadelP.length > 0 && deckungsUrteil(grossL0, wand.band, wand.alpha).length === 2;
        const ohneRinde = (schwebeProbe || []).filter((m) => m.kind === "foliage" || m.kind === "foliageTex");
        const sw8 = schwebe(ohneRinde);
        const s8 = sw8.karten > 0 && sw8.schwebend === sw8.karten;
        const tief = kroneAus(schwebeProbe || []).map((m) => {
            const p = Float32Array.from(m.pos);
            for (let i = 1; i < p.length; i += 3) p[i] -= 100;
            return Object.assign({}, m, { pos: p });
        });
        const s9 = tief.length > 0 && unterBoden(tief) < 0;
        const sMax = schwebeMess.reduce((m, x) => Math.max(m, x.schwebend), 0);
        console.log(
            `Schwebe-Wand: ${schwebeMess.length} Baum-L0 gemessen, ${schwebeMess.reduce((m, x) => m + x.karten, 0)} Karten, schwebend höchstens ${sMax}`
        );
        const s5 = steckbriefUrteil(at, Object.assign({}, at.steckbrief, { kern: 0.6 }), at.nadel, at.gross, at.weide).length > 0;
        const arten = new Set(gemesseneP.map(([, p]) => p.art));
        // 05.10.: keine L1-Krone mehr aus Klingen (die Trauer-Klinge las als Papier-Streifen) — jede Krone ist Karte.
        const s6 = arten.has("laub") && arten.has("nadel") && !arten.has("klinge") && gemesseneP.length >= 16;
        const fehlt = new Set();
        for (const x of kostenUrteil(messungen, wand.budgetOhneZB))
            if (x.endsWith("keine Budget-Zeile")) fehlt.add(wand.kernVonArt[x.slice(0, x.indexOf("["))]);
        const zweitKerne = new Set(
            messungen.filter((x) => wand.kernVonArt[x.kind]).map((x) => wand.kernVonArt[x.kind])
        );
        const s10 = zweitKerne.size === 6 && [...zweitKerne].every((c) => fehlt.has(c));
        const zweitArten = [...new Set(messungen.filter((x) => x.budget).map((x) => x.kind))];
        const ohneFaltung = zweitArten.filter(
            (k) => !messungen.some((x) => x.kind === k && x.budget.vorher.draws > B[k][x.lod].draws)
        );
        // jede Art der Zweit-Kerne (aus dem Umschlag — die Ausstattung kam 05.10. als siebte dazu) ist gemessen und gefaltet
        const s11 = zweitArten.length === Object.keys(wand.kernVonArt).length && ohneFaltung.length === 0;
        const p0 = sehProben[0];
        const entkleidet = p0
            ? [{ fall: p0.fall, teile: p0.teile.map((t, i) => (i ? t : Object.assign({}, t, { mat: Object.assign({}, t.mat, { seh: undefined }) }))) }]
            : [];
        const s12 = !!p0 && sehUrteil(entkleidet).some((x) => x.includes("ohne Seh-Klasse"));
        const s13 =
            sehKreuz([{ von: "unknown|0.08|0.00|0|1.00|v:auge", nach: "skin|0.62|0.00|0|1.00|v:haut" }]).length === 1 &&
            sehKreuz([{ von: "unknown|0.06|e:0.06,0.02,0.00@0.30|v:auge", nach: "unknown|0.00|v:auge" }]).length === 1 &&
            sehKreuz([{ von: "unknown|0.20|v:auge", nach: "unknown|0.15|v:auge" }]).length === 0;
        console.log(
            `Seh-Wand: ${sehProben.length} Proben (${sehProben.map((p) => p.fall).join(", ")}) · Seh-Klassen ${sehProben.map((p) => new Set(p.teile.map((t) => t.mat && t.mat.seh)).size).join("/")}`
        );
        console.log(
            `Selbsttest Budget-Wand: jede Zeile halbiert/−1 Draw wird rot ${s1 ? "✅" : "❌ " + halb.join(",")} · ` +
                `jede Gitter-Zeile gemessen ${s2 ? "✅" : "❌ " + leer.join(",")} · Laub-Karte 2,35 sprengt das Band ${s3 ? "✅" : "❌"} · ` +
                `Nadel-Karte 1,5× sprengt das Band ${s4 ? "✅" : "❌"} · Kern 0,6 bricht den Steckbrief ${s5 ? "✅" : "❌"} · ` +
                `${gemesseneP.length} Paare (Laub/Nadel, keine Klinge) ${s6 ? "✅" : "❌"} · L0-Karte 1,5× sprengt das Band ${s7 ? "✅" : "❌"} · ` +
                `L0 ohne Rinde schwebt ${s8 ? "✅" : "❌"} · abgesenkte Krone liegt unter dem Boden ${s9 ? "✅" : "❌"} · ` +
                `ohne zusatzBudget fehlt das Budget für ${fehlt.size}/6 Zweit-Kerne ${s10 ? "✅" : "❌ " + [...zweitKerne].filter((c) => !fehlt.has(c)).join(",")} · ` +
                `ungefaltet über draws je Zweit-Art ${s11 ? "✅" : "❌ " + ohneFaltung.join(",")} · ` +
                `Stoff ohne Seh-Klasse bricht ${s12 ? "✅" : "❌"} · Auge→Haut und Glimmen→matt fängt die Kreuz-Linse ${s13 ? "✅" : "❌"}`
        );
        if (!s1 || !s2 || !s3 || !s4 || !s5 || !s6 || !s7 || !s8 || !s9 || !s10 || !s11 || !s12 || !s13)
            fails.push("Selbsttest der Budget-Wand feuert nicht");
    }

    // DER KARTEN-RUNDLAUF (W6) — das Urteil je Fall, dann der Selbsttest (die gestörte Schicht MUSS rot werden, die
    // Box-Mip der GPU MUSS die Deckungs-Wand sprengen — sonst misst die Linse nichts).
    if (karten) {
        console.log("Karten-Rundlauf (BC1-sRGB + BC5, Studio-Bake → Codec → zurück):");
        for (const [fall, m] of Object.entries(karten.faelle)) {
            const urteil = kartenUrteil(m);
            const d = m.deckung || [];
            console.log(
                `  ${fall}: Alpha-Fehler ${m.alphaFehl} · PSNR ${(m.psnr || 0).toFixed(2)} dB · Normale Ø ${(m.winkelMittel || 0).toFixed(2)}° ` +
                    `(p95 ${(m.winkelP95 || 0).toFixed(1)}°) · Deckung ${d.map((x) => x.toFixed(4)).join("/")} ` +
                    `(Box ${(m.box || []).map((x) => x.toFixed(4)).join("/")}) · Krone linear ` +
                    `${(m.farbe ? m.farbe.ein : []).map((x) => x.toFixed(3)).join(",")} → ${(m.farbe ? m.farbe.aus : []).map((x) => x.toFixed(3)).join(",")} · ` +
                    `${((m.bytes || 0) / 1048576).toFixed(3)} MiB`
            );
            fails.push(...urteil.map((x) => `Karte ${fall}: ${x}`));
        }
        const erst = Object.values(karten.faelle)[0] || {};
        const s1 = kartenUrteil(karten.gestoert || {}).length > 0;
        const s2 = kartenUrteil(Object.assign({}, erst, { deckung: erst.box || [] })).some((x) => x.startsWith("Mip-Deckung"));
        const s3 =
            kartenUrteil(
                Object.assign({}, erst, {
                    farbe: erst.farbe && { ein: erst.farbe.ein, aus: erst.farbe.ein.map((v) => v * 0.11) },
                })
            ).some((x) => x.startsWith("Kronen-Farbe"));
        // die rgba8-Schicht (1,125 MiB: Albedo 1 MiB + rg8-Normale 0,125 MiB, ohne Mips) sprengt das BC-Budget
        const s4 = kartenUrteil(Object.assign({}, erst, { bytes: 1.25 * 1048576 })).some((x) => x.startsWith("Schicht"));
        console.log(
            `Selbsttest Karten-Linse: gestörte BC1-Albedo wird rot ${s1 ? "✅" : "❌"} · Box-Mip sprengt die Deckungs-Wand ${s2 ? "✅" : "❌"} · ` +
                `linear-als-sRGB (Blick-Tour: 0,12 → 0,013) wird rot ${s3 ? "✅" : "❌"} · 1,25-MiB-Schicht sprengt das Budget ${s4 ? "✅" : "❌"}`
        );
        if (!s1 || !s2 || !s3 || !s4) fails.push("Selbsttest der Karten-Linse feuert nicht");
    } else fails.push("Karten-Rundlauf lief nicht");

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
