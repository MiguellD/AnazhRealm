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
const {
    bildDeckung,
    bildLagen,
    bildAus,
    kroneAus,
    kartenSkaliert,
    kartenVervielfacht,
    schwebe,
    unterBoden,
} = require("./lib/kronen-linse.cjs");
require("../phyto-core.js"); // das Budget-Gesetz (budgetSippen · kerneVereinen) — dieselbe Datei wie Worker und Wirt
const PC = globalThis.__phytoCore;

const PORT = Number(process.env.CONTRACT_PORT || 4542);
const DIR = path.resolve(__dirname, "..", "spec", "asset-contract", "v1", "golden");
// DIE BILD-TAFEL (S3 pflanzen, Wand D; Gegenprüfung R1 09.10.): je Baum-Art × Same (Sommer) das Bild seiner L0 und
// seiner L1 JE BLICK-HEBUNG (Krone UND Rinde, kronen-linse bildAus/bildDeckung — Mittel der acht Azimute je Hebung 0°,
// 30°, 60° von unten; Raster-Kante `px` = L0-Höhe / 300 für beide Stufen) und seine Karte (die Studio-Karte aus der L1:
// Deckung der Mip 0, mittlere lineare Kronenfarbe der opaken Texel) — gebaut aus dem Ist von V18.536 (`node
// scripts/diag-asset-contract.cjs --tafel` auf 76c9624d). Jede spätere Stufe deckt je Hebung 0,92–1,08 davon, jede Karte
// 0,92–1,08 bei ΔE76 ≤ 2. Befund: das Mittel der 24 Ansichten (D0, nur L0) sah die Seitenansicht mit einem Drittel — die
// Koniferen-L1 verlor 22–34 % ihrer Seitenansicht, die Karte 16–27 %, ihre Farbe sprang um ΔE 2,6–5,8, ohne dass eine
// Wand anschlug.
const TAFEL_BILD = path.resolve(__dirname, "..", "spec", "asset-contract", "v1", "bild-v18536.json");
const BILD_BAND = [0.92, 1.08];
const GESTALT_BAND = [0.85, 1.15];
const KARTE_DE = 2;
const KARTE_DE_GESTALT = 4;
// ΔE76 zweier LINEARER sRGB-Farben (D65 → Lab).
function deltaE76(a, b) {
    const lab = ([r, g, bl]) => {
        const X = (0.4124 * r + 0.3576 * g + 0.1805 * bl) / 0.95047,
            Y = 0.2126 * r + 0.7152 * g + 0.0722 * bl,
            Z = (0.0193 * r + 0.1192 * g + 0.9505 * bl) / 1.08883;
        const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
        return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
    };
    const p = lab(a),
        q = lab(b);
    return Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
}
// Die Lagen-Kante: die Lagen je Pixel-Mitte sind ein Punkt-Maß, das Raster (Stufen-Höhe / 120) reicht.
const LAGEN_TEILER = 120;

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
        // Der Schatten-Teil der Baum-L1 (S3): welches Teil wirft, ist Teil des Vertrags.
        if ((a.teil === undefined ? null : a.teil) !== (b.teil === undefined ? null : b.teil))
            return `${tag} Mesh${i}: teil ${a.teil} vs ${b.teil}`;
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
//      und seine Füllungen sind die deklarierten (±0,01): Breitblatt-Zellen und Wedel-Zelle (S3: der Nadel-Ast).
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
// DIE FERN-WAND (S3 haus, docs/studio-vertrag.md N5): jede gebaute NUR-WURF-Stufe (B2c `nurWurf`) trägt den Beipack `__fern` in
// der EINEN Hüllen-Form — Teile box · keil · kapsel mit endlichen Zahlen auf dem Raster 2^-12, die First-Kante ±x/±z, der
// Walm in [0, 1], die Farbe je sichtbarem Teil, höchstens 24 Teile (die Kapsel-Liste des Welt-March). Der Wirt bricht ohne sie
// (KERN-PFLICHT in `_archFoundryZiegel`); hier fällt der Bruch am Studio-Ausgang auf. null = die Form steht.
function huellenFormFehler(h) {
    const r = (x) => Number.isFinite(x) && Number.isInteger(x * 4096);
    const v3 = (a) => Array.isArray(a) && a.length === 3 && a.every(r);
    if (!h || typeof h !== "object") return "fehlt";
    if (!Number.isInteger(h.stufe)) return "ohne stufe";
    if (!Array.isArray(h.teile) || !h.teile.length) return "ohne teile";
    if (h.teile.length > 24) return `${h.teile.length} Teile > 24`;
    for (const t of h.teile) {
        if (!t || !["fest", "sicht", "beide"].includes(t.rolle)) return "rolle";
        if (t.art === "box" || t.art === "keil") {
            if (!v3(t.c) || !v3(t.h)) return `${t.art} c/h nicht auf dem Raster`;
            if (t.art === "keil" && !["+x", "-x", "+z", "-z"].includes(t.first)) return `keil first ${t.first}`;
            if (t.walm != null && !(t.walm >= 0 && t.walm <= 1)) return `walm ${t.walm}`;
        } else if (t.art === "kapsel") {
            if (!v3(t.a) || !v3(t.b) || !(r(t.r) && t.r > 0)) return "kapsel a/b/r";
        } else return `art ${t.art}`;
        if (t.rolle !== "fest" && !v3(t.farbe)) return "farbe";
    }
    return null;
}
function fernUrteil(mess) {
    const out = [];
    for (const m of mess) {
        const f = huellenFormFehler(m.fern);
        if (f) out.push(`${m.fall}: __fern ${f}`);
    }
    return out;
}

// Dreiecke und Draws einer gebauten Antwort — DIESELBE Regel wie Budget-Gesetz und Wirt (phyto-core budgetSippen:
// je Stoff × Attribut-Form ein Draw, jedes Flügel-Teil und jede Haut eines; Beipack ohne position zählt nicht).
function teileAus(meshes) {
    return (meshes || [])
        .filter((m) => m.attrs && m.attrs.position)
        .map((m) => {
            const t = { kind: m.kind, mat: m.mat };
            if (m.tuer) t.tuer = m.tuer;
            if (m.joint) t.joint = m.joint;
            if (m.teil) t.teil = m.teil;
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
function steckbriefUrteil(atlas, breit, wedel, gross, weide) {
    const v = [];
    if (!breit || !(breit.kern > 0) || !(breit.fuellung > 0) || !(breit.zellen >= 1))
        return ["Steckbrief BLATT_ATLAS_BREIT fehlt"];
    if (!wedel || !(wedel.kern > 0) || !(wedel.fuellung > 0) || !Number.isInteger(wedel.zelle))
        return ["Steckbrief BLATT_ATLAS_WEDEL fehlt"];
    for (let c = 0; c < breit.zellen; c++)
        if (atlas.ext[c] > breit.kern)
            v.push(`Zelle ${c}: Alpha reicht bis ${atlas.ext[c].toFixed(4)} > kern ${breit.kern}`);
    const f = atlas.fill.slice(0, breit.zellen).reduce((s, x) => s + x, 0) / breit.zellen;
    if (Math.abs(f - breit.fuellung) > 0.01)
        v.push(`Breitblatt-Füllung ${f.toFixed(4)} ≠ Steckbrief ${breit.fuellung}`);
    if (atlas.ext[wedel.zelle] > wedel.kern)
        v.push(
            `Wedel-Zelle ${wedel.zelle}: Alpha reicht bis ${atlas.ext[wedel.zelle].toFixed(4)} > kern ${wedel.kern}`
        );
    if (Math.abs(atlas.fill[wedel.zelle] - wedel.fuellung) > 0.01)
        v.push(`Wedel-Füllung ${atlas.fill[wedel.zelle].toFixed(4)} ≠ Steckbrief ${wedel.fuellung}`);
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

// DIE KRONEN-KOSTEN (S3 pflanzen, 09.10.) — die Zeile war nur gegen die sättigende BINÄRE Deckung geeicht; jede Stufe
// trug Geometrie ohne Bild. Drei Wände je Baum-Art × Gestalt (Goldens und jede Gestalt der Welt, Sommer):
//  (L) LAGEN — Quad-Lagen je Kronen-Pixel (kronen-linse bildLagen, 24 Ansichten) ≤ lod.budget.tree[Stufe].lagen;
//  (Q) QUOTE — Dreiecke L1 / L0 desselben Baums ≤ lod.budget.tree[1].quote (die L1 ist das Gerüst + Karten, nie die
//      ausgedünnte L0);
//  (D0) die L0 DECKT ihr Bild von V18.536: Bild-Deckung (Krone und Rinde) nachher/vorher ∈ [0,92; 1,08] gegen die Tafel.
// (L) und (Q) gelten Zeilen, die ihr Feld tragen (Pflicht ab dem Vertrags-Akt); (D0) gilt immer.
function lagenUrteil(mess, budget) {
    const v = [];
    for (const m of mess) {
        const z = budget && budget.tree && budget.tree[m.lod];
        if (!z || z.lagen == null) continue;
        if (m.quad > z.lagen) v.push(`tree[${m.lod}] ${m.fall}: ${m.quad.toFixed(1)} Lagen > ${z.lagen}`);
    }
    return v;
}
function quoteUrteil(paare, budget) {
    const v = [];
    const z = budget && budget.tree && budget.tree[1];
    if (!z || z.quote == null) return v;
    for (const [k, p] of Object.entries(paare)) {
        // die Quote gilt der Krone (die L1 ist Gerüst + Karten); ein Baum ohne Krone (Totholz) trägt in der L1 jeden Strang
        // über dem Pixel der Nahkante — er ist nie Gerüst + Karte
        if (!(p.l0 > 0) || !(p.l1 > 0) || p.krone === false) continue;
        const q = p.l1 / p.l0;
        if (q > z.quote) v.push(`${k}: L1/L0 ${p.l1}/${p.l0} = ${q.toFixed(2)} > ${z.quote}`);
    }
    return v;
}
// (W) DER SCHATTEN-TEIL (S3, das EINE Wurf-Gesetz): je Baum-L1 genau ein Teil `teil: "schatten"` mit aDeckt, höchstens
// tree[1].wurf.tris Dreiecke, seine Karten auf höchstens tree[1].wurf.lagen Lagen.
function wurfUrteil(mess, budget) {
    const v = [];
    const w = budget && budget.tree && budget.tree[1] && budget.tree[1].wurf;
    for (const m of mess) {
        if (m.fehlt) {
            v.push(`${m.fall}: Schatten-Teil ohne ${m.fehlt}`);
            continue;
        }
        if (m.teile !== 1) v.push(`${m.fall}: ${m.teile} Schatten-Teile statt 1`);
        if (w && w.tris != null && m.tris > w.tris) v.push(`${m.fall}: Schatten-Teil ${m.tris} Dreiecke > ${w.tris}`);
        if (w && w.lagen != null && m.lagen > w.lagen) v.push(`${m.fall}: Schatten-Karten ${m.lagen.toFixed(1)} Lagen > ${w.lagen}`);
    }
    return v;
}
// (D) DAS BILD JE BLICK-HEBUNG gegen die Bild-Tafel von V18.536, zweistufig: das Mittel einer ART über ihre Gestalten je
// Stufe und Hebung (und die Deckung ihrer Karten) hält BILD_BAND — die systematische Abweichung (die Koniferen-L1 verlor
// 22–34 % ihrer Seitenansicht in jeder Gestalt); jede einzelne GESTALT hält GESTALT_BAND — eine Gestalt wächst anders als
// die Vorlage, aus der V18.536 sie las (die Wedel tragen die Nadel-Wolke, V18.536 je Nadelstelle eine Spray), sie streut
// um das Mittel. Die Kronenfarbe der Karten hält je Art im Mittel ΔE76 ≤ KARTE_DE, jede Gestalt ≤ KARTE_DE_GESTALT — wie die
// Deckung das Doppelte des Mittels (V18.536 zeigte zwischen dünnen Sprays je Gestalt verschieden viel Holz: 25–31 % Rinden-
// Texel bei Tanne und Fichte).
function bildUrteil(mess, tafel) {
    const v = [];
    const H = ["0°", "30°", "60°"];
    const band = (x, b) => x >= b[0] && x <= b[1];
    const art = {};
    for (const [k, m] of Object.entries(mess)) {
        const t = tafel && tafel.faelle && tafel.faelle[k];
        if (!t) {
            v.push(`${k}: keine Zeile in der Bild-Tafel`);
            continue;
        }
        m.verhaeltnis = {};
        const a = art[m.art] || (art[m.art] = { L0: [], L1: [], karte: [], farbe: [], tFarbe: [] });
        for (const st of ["L0", "L1", "karte"]) {
            if (!m[st] || !t[st]) {
                v.push(`${k}: ${st} ${m[st] ? "ohne Tafel-Zeile" : "nicht gemessen"}`);
                continue;
            }
            if (st === "karte") {
                const r = m.karte.deckung / t.karte.deckung,
                    de = deltaE76(m.karte.farbe, t.karte.farbe);
                m.verhaeltnis.karte = [r, de];
                a.karte.push([r]);
                a.farbe.push(m.karte.farbe);
                a.tFarbe.push(t.karte.farbe);
                if (!band(r, GESTALT_BAND))
                    v.push(`${k}: die Karte deckt ${r.toFixed(3)} ihres Bilds von V18.536, Gestalt-Band [${GESTALT_BAND.join(", ")}]`);
                if (!(de <= KARTE_DE_GESTALT))
                    v.push(`${k}: die Kronenfarbe der Karte weicht um ΔE ${de.toFixed(2)} > ${KARTE_DE_GESTALT} ab (Gestalt)`);
                continue;
            }
            const r = m[st].map((x, i) => x / t[st][i]);
            m.verhaeltnis[st] = r;
            a[st].push(r);
            r.forEach((x, i) => {
                if (!band(x, GESTALT_BAND))
                    v.push(`${k}: ${st} deckt unter ${H[i]} ${x.toFixed(3)} ihres Bilds von V18.536, Gestalt-Band [${GESTALT_BAND.join(", ")}]`);
            });
        }
    }
    for (const [name, a] of Object.entries(art))
        for (const st of ["L0", "L1", "karte"]) {
            if (!a[st].length) continue;
            const n = a[st][0].length;
            for (let i = 0; i < n; i++) {
                const x = a[st].reduce((s2, r) => s2 + r[i], 0) / a[st].length;
                if (!band(x, BILD_BAND))
                    v.push(
                        `${name}: ${st === "karte" ? "die Karten decken" : st + " deckt unter " + H[i]} im Mittel ${x.toFixed(3)} des Bilds von V18.536 (${a[st].length} Gestalten), Band [${BILD_BAND.join(", ")}]`
                    );
            }
        }
    // die Kronenfarbe je Art: das Mittel der Karten-Farben ihrer Gestalten gegen das von V18.536
    for (const [name, a] of Object.entries(art)) {
        if (!a.farbe.length) continue;
        const mi = (xs) => [0, 1, 2].map((i) => xs.reduce((s2, c) => s2 + c[i], 0) / xs.length);
        const de = deltaE76(mi(a.farbe), mi(a.tFarbe));
        if (!(de <= KARTE_DE))
            v.push(`${name}: die Kronenfarbe der Karten weicht im Mittel um ΔE ${de.toFixed(2)} > ${KARTE_DE} ab (${a.farbe.length} Gestalten)`);
    }
    for (const k of Object.keys((tafel && tafel.faelle) || {})) if (!mess[k]) v.push(`${k}: Tafel-Zeile ohne gebauten Baum`);
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
    const tafelSchreiben = process.argv.includes("--tafel");
    const tafel = fs.existsSync(TAFEL_BILD) ? JSON.parse(fs.readFileSync(TAFEL_BILD, "utf8")) : null;
    const lagenMess = [];
    const quotePaare = {};
    const bildMess = {};
    const wurfMess = [];
    let kronenProbe = null;
    await runWithWorker(PORT, async ({ build, kostenListe, getData, atlas, atlasAlpha, karte, probeLauf }) => {
        // Die Atlas-Alpha zuerst: die Kronen-Kosten (L/Q/D0) lesen sie an jedem gebauten Baum.
        const aa0 = await atlasAlpha();
        const alpha0 = { w: aa0.w, h: aa0.h, alpha: new Uint8Array(Buffer.from(aa0.b64, "base64")), schwelle: 0.5 };
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
        const fernMess = [];
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
        // DER SCHATTEN-TEIL je Baum-L1 (Goldens und Gestalten der Welt): Teile, Dreiecke, Lagen seiner Karten.
        const wurfMass = (c, a, fall) => {
            const teile = (a.meshes || []).filter((m) => m.teil === "schatten" && m.attrs && m.attrs.position);
            const k = PC.budgetWurf(teileAus(a.meshes));
            let lag = 0;
            if (teile.length === 1) {
                const m = teile[0];
                const pos = dekodiere(m.attrs.position.b64, Float32Array),
                    uv = m.attrs.uv ? dekodiere(m.attrs.uv.b64, Float32Array) : null,
                    deckt = m.attrs.aDeckt ? dekodiere(m.attrs.aDeckt.b64, Float32Array) : null,
                    ix = dekodiere(m.index, Uint32Array);
                const karten = [];
                if (deckt) for (let t = 0; t < ix.length; t += 3) if (!deckt[ix[t]] && !deckt[ix[t + 1]] && !deckt[ix[t + 2]]) karten.push(ix[t], ix[t + 1], ix[t + 2]);
                let lo = Infinity,
                    hi = -Infinity;
                for (let i = 1; i < pos.length; i += 3) {
                    if (pos[i] < lo) lo = pos[i];
                    if (pos[i] > hi) hi = pos[i];
                }
                if (karten.length && uv)
                    lag = bildLagen([{ kind: "foliageTex", pos, idx: Uint32Array.from(karten), uv }], alpha0, (hi - Math.max(0, lo)) / LAGEN_TEILER).quad;
                if (!deckt) wurfMess.push({ fall, fehlt: "aDeckt" });
            }
            wurfMess.push({ fall, teile: teile.length, tris: k.tris, lagen: lag });
        };
        // DIE KRONEN-KOSTEN je Baum-Art × Gestalt × Stufe (Sommer, L0/L1): Lagen (L), Dreiecke der Quote (Q), das Bild je
        // Blick-Hebung (D; der Schatten-Teil zeichnet nur in den Kaskaden — er gehört nicht zum Bild).
        const kronenMass = (c, a) => {
            if (c.lod > 1 || c.season !== "summer" || artVon(c.presetId) !== "tree" || !a.meshes) return;
            const key = `${c.presetId}-s${c.seed}`;
            let lo = Infinity,
                hi = -Infinity;
            const bild = bildAus(a.meshes.filter((m) => m.teil !== "schatten"));
            for (const m of bild)
                for (let i = 1; i < m.pos.length; i += 3) {
                    if (m.pos[i] < lo) lo = m.pos[i];
                    if (m.pos[i] > hi) hi = m.pos[i];
                }
            const H = hi - Math.max(0, lo);
            const krone = kroneAus(a.meshes);
            const lg = bildLagen(krone, alpha0, H / LAGEN_TEILER);
            lagenMess.push({ fall: `${key}-L${c.lod}`, art: c.presetId, lod: c.lod, quad: lg.quad, alpha: lg.alpha });
            const qp = quotePaare[key] || (quotePaare[key] = { l0: 0, l1: 0 });
            qp["l" + c.lod] = kosten(a.meshes).tris;
            if (c.lod === 1) qp.krone = krone.length > 0;
            // die Raster-Kante beider Stufen: die der Tafel (L0-Höhe / 300 von V18.536), beim Schreiben die der L0
            const t = tafel && tafel.faelle && tafel.faelle[key];
            const bm = bildMess[key] || (bildMess[key] = { art: c.presetId, seed: c.seed, px: t ? t.px : null });
            if (bm.px == null) bm.px = H / 300;
            bm["L" + c.lod] = bildDeckung(bild, alpha0, bm.px).hebung;
            if (c.lod === 0 && key === "eiche-s7") kronenProbe = { bild, krone, H, px: bm.px };
        };
        const miss = (c, a, fall) => {
            const kind = artVon(c.presetId);
            if (!budget || !budget[kind]) return;
            // Nur GELIEFERTE Stufen: eine nicht deklarierte (die Strauch-L0, der Host klemmt sie auf L1) bleibt
            // ein Byte-Golden ohne Budget.
            if (!Array.isArray(stufen[kind]) || stufen[kind].indexOf(c.lod) < 0) return;
            const k = a.meshes ? kosten(a.meshes) : a;
            messungen.push({ kind, lod: c.lod, fall, tris: k.tris, draws: k.draws, budget: a.budget || null });
            // die NUR-WURF-Stufe trägt ihre Fernform (die Fern-Wand unten)
            if (budget[kind][c.lod] && budget[kind][c.lod].nurWurf === true) {
                const fb = a.meshes ? (a.meshes.find((m) => m && m.kind === "__fern") || {}).huelle : a.fern;
                fernMess.push({ fall, fern: fb || null });
            }
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
            kronenMass(c, a);
            // (W) DER SCHATTEN-TEIL (S3, das EINE Wurf-Gesetz, Konsum von tree[1].wurf): die Baum-L1 liefert GENAU EIN Teil
            // `teil: "schatten"` — das Gerüst als Dreikant (aDeckt 1) und die Schatten-Karten (aDeckt 0) —, höchstens
            // wurf.tris Dreiecke, seine Karten auf höchstens wurf.lagen Lagen (kronen-linse). Der Wirt bricht ohne das Teil
            // (KERN-PFLICHT); hier fällt der Bruch am Studio-Ausgang auf.
            if (!tafelSchreiben && c.lod === 1 && artVon(c.presetId) === "tree") wurfMass(c, a, f.replace(/\.json$/, ""));
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
                        kronenMass(c, a);
                        if (!tafelSchreiben && lod === 1 && kind === "tree")
                            wurfMass(c, a, `${preset}-s${v}-L${lod}-summer (Gestalt)`);
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
        // DIE KARTE JE BAUM (Wand D): die Studio-Karte jedes gemessenen Baums — Deckung der Mip 0, mittlere Kronenfarbe.
        for (const bm of Object.values(bildMess)) {
            const k = await karte(bm.art, bm.seed);
            if (k && !k.fehler) bm.karte = { deckung: k.deckung[0], farbe: k.farbe.ein };
        }
        // Die Tafel schreiben (`--tafel`, auf dem Stand von V18.536): nur die Bild-Messung, kein Urteil.
        if (tafelSchreiben) return;
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
            fails.push(...steckbriefUrteil(at, at.steckbrief, at.wedel, at.gross, at.weide).map((x) => "Steckbrief: " + x));
            fails.push(...deckungsUrteil(paare, band, alpha).map((x) => "Deckung: " + x));
            fails.push(...sehUrteil(sehProben).map((x) => "Seh: " + x));
            fails.push(...lagenUrteil(lagenMess, budget).map((x) => "Lagen: " + x));
            fails.push(...quoteUrteil(quotePaare, budget).map((x) => "Quote: " + x));
            fails.push(...wurfUrteil(wurfMess, budget).map((x) => "Wurf: " + x));
            // DIE FERN-WAND (S3 haus, N5): jede Art mit NUR-WURF-Stufe gebaut, jede mit __fern in der Form; Selbsttest: ohne
            // __fern und mit einem Keil ohne gültige First-Kante MUSS sie rot werden
            const nwArten = Object.keys(stufen).filter((k) => stufen[k].some((s) => budget[k] && budget[k][s] && budget[k][s].nurWurf === true));
            const nwGebaut = new Set(fernMess.map((m) => m.fall.split("-s")[0]));
            if (nwArten.length && !fernMess.length) fails.push("Fern: keine NUR-WURF-Stufe gebaut (" + nwArten.join(",") + ")");
            fails.push(...fernUrteil(fernMess).map((x) => "Fern: " + x));
            const fernSelbst =
                fernUrteil([{ fall: "S", fern: null }]).length === 1 &&
                fernUrteil([{ fall: "S", fern: { stufe: 3, teile: [{ art: "keil", c: [0, 0, 0], h: [1, 1, 1], first: "y", rolle: "sicht", farbe: [0.5, 0.5, 0.5] }] } }]).length === 1;
            if (!fernSelbst) fails.push("Selbsttest der Fern-Wand feuert nicht");
            console.log(
                `Fern-Wand (N5): ${fernMess.length} NUR-WURF-Stufen gebaut (${nwArten.join(" · ") || "keine Art"}; ${nwGebaut.size} Rezepte), ` +
                    `höchstens ${Math.max(0, ...fernMess.map((m) => (m.fern && m.fern.teile ? m.fern.teile.length : 0)))} Teile · ` +
                    `Selbsttest (ohne __fern · Keil ohne First) ${fernSelbst ? "✅" : "❌"}`
            );
            fails.push(...bildUrteil(bildMess, tafel).map((x) => "Bild: " + x));
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
    if (tafelSchreiben) {
        const faelle = {};
        const r8 = (x) => +x.toPrecision(8);
        for (const k of Object.keys(bildMess).sort()) {
            const m = bildMess[k];
            faelle[k] = {
                px: r8(m.px),
                L0: m.L0.map(r8),
                L1: m.L1.map(r8),
                karte: { deckung: r8(m.karte.deckung), farbe: m.karte.farbe.map(r8) },
            };
        }
        fs.writeFileSync(
            TAFEL_BILD,
            JSON.stringify(
                {
                    zweck: "DIE BILD-TAFEL (S3 pflanzen, Wand D in gate:asset-contract; Gegenprüfung R1): je Baum-Art × Same (Sommer) das Bild seiner L0 und L1 je Blick-Hebung 0°/30°/60° von unten (Mittel der acht Azimute der kronen-linse; Krone mit der Atlas-Alpha und Rinde über dem Boden der Vorlage, ohne Schatten-Teil; Raster-Kante px = L0-Höhe / 300 in Vorlagen-Einheiten, Fläche in Vorlagen-Einheiten²) und seine Studio-Karte (Deckung der Mip 0, mittlere lineare Kronenfarbe der opaken Texel) — aus dem Ist von V18.536. Je Art hält das Mittel über die Gestalten je Stufe und Hebung (und die Deckung der Karten) 0,92–1,08 davon, jede Gestalt 0,85–1,15; die Kronenfarbe der Karten je Art im Mittel ΔE76 ≤ 2, je Gestalt ≤ 4.",
                    quelle: "node scripts/diag-asset-contract.cjs --tafel (V18.536, 76c9624d)",
                    band: BILD_BAND,
                    gestaltBand: GESTALT_BAND,
                    karteDE: KARTE_DE,
                    karteDEGestalt: KARTE_DE_GESTALT,
                    faelle,
                },
                null,
                4
            ) + "\n"
        );
        console.log(`Bild-Tafel geschrieben: ${Object.keys(faelle).length} Fälle → ${path.relative(process.cwd(), TAFEL_BILD)}`);
        process.exit(0);
    }
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
                `Wedel-Zelle bis ${at.ext[at.wedel.zelle].toFixed(4)} · Füllung ${at.fill[at.wedel.zelle].toFixed(4)} (${at.wedel.fuellung}) · ` +
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
        //  (3) die Laub-Karte mit 1,5-facher Kante MUSS das Band sprengen (bis S3 die Kante 2,35 von gestern — die Zeile
        //      trägt seit der Gegenprüfung R1 selbst 2,2);
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
            gestern[k] = Object.assign({}, p, { l1: kartenSkaliert(p.l1, 1.5) });
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
        const s5 = steckbriefUrteil(at, Object.assign({}, at.steckbrief, { kern: 0.6 }), at.wedel, at.gross, at.weide).length > 0;
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
                `jede Gitter-Zeile gemessen ${s2 ? "✅" : "❌ " + leer.join(",")} · Laub-Karte 1,5× sprengt das Band ${s3 ? "✅" : "❌"} · ` +
                `Nadel-Karte 1,5× sprengt das Band ${s4 ? "✅" : "❌"} · Kern 0,6 bricht den Steckbrief ${s5 ? "✅" : "❌"} · ` +
                `${gemesseneP.length} Paare (Laub/Nadel, keine Klinge) ${s6 ? "✅" : "❌"} · L0-Karte 1,5× sprengt das Band ${s7 ? "✅" : "❌"} · ` +
                `L0 ohne Rinde schwebt ${s8 ? "✅" : "❌"} · abgesenkte Krone liegt unter dem Boden ${s9 ? "✅" : "❌"} · ` +
                `ohne zusatzBudget fehlt das Budget für ${fehlt.size}/6 Zweit-Kerne ${s10 ? "✅" : "❌ " + [...zweitKerne].filter((c) => !fehlt.has(c)).join(",")} · ` +
                `ungefaltet über draws je Zweit-Art ${s11 ? "✅" : "❌ " + ohneFaltung.join(",")} · ` +
                `Stoff ohne Seh-Klasse bricht ${s12 ? "✅" : "❌"} · Auge→Haut und Glimmen→matt fängt die Kreuz-Linse ${s13 ? "✅" : "❌"}`
        );
        if (!s1 || !s2 || !s3 || !s4 || !s5 || !s6 || !s7 || !s8 || !s9 || !s10 || !s11 || !s12 || !s13)
            fails.push("Selbsttest der Budget-Wand feuert nicht");

        // DIE KRONEN-KOSTEN (L/Q/D): die Tabelle je Art × Stufe (Maximum über die Gestalten), dann die Selbsttests —
        //  (L) eine Krone mit verdreifachten Karten (die Eiche-L0 des Samens 7) liegt über 16 Lagen, und die Wand liest
        //      die gebauten Kronen (eine Zeile knapp unter dem kleinsten gemessenen L0-Wert wird rot);
        //  (Q) eine Birke-L1 mit 0,63 der L0 liegt über 0,35, und die Wand liest die gebauten Paare;
        //  (D) eine halbierte Krone (jede Karte mit halber Kante) fällt je Hebung aus dem Band; eine Karte mit 0,8 ihrer
        //      Deckung und eine um ΔE 3 verschobene Kronenfarbe feuern je; die Wand liest jeden Baum der Tafel.
        const proArt = {};
        for (const m of lagenMess) {
            const k = `${m.art}-L${m.lod}`;
            const e = proArt[k] || (proArt[k] = { quad: 0, alpha: 0, n: 0, fall: "" });
            e.n++;
            if (m.quad > e.quad) Object.assign(e, { quad: m.quad, alpha: m.alpha, fall: m.fall });
        }
        const qMax = {};
        for (const [k, p] of Object.entries(quotePaare))
            if (p.l0 > 0 && p.l1 > 0) {
                const art = k.replace(/-s-?\d+$/, "");
                if (!qMax[art] || p.l1 / p.l0 > qMax[art].q) qMax[art] = { q: p.l1 / p.l0, fall: k };
            }
        console.log(
            "Kronen-Kosten (Maximum je Art × Stufe über die Gestalten): " +
                Object.entries(proArt)
                    .sort()
                    .map(([k, e]) => `${k} Lagen ${e.quad.toFixed(1)} (Alpha ${e.alpha.toFixed(1)}, ${e.n} Gestalten)`)
                    .join(" · ") +
                " | Quote L1/L0: " +
                Object.entries(qMax)
                    .sort()
                    .map(([a, e]) => `${a} ${e.q.toFixed(2)}`)
                    .join(" · ")
        );
        // das Bild gegen V18.536: je Stufe und Hebung die Spanne über die Bäume, die Karte (Deckung, ΔE)
        const spanne = (xs) => (xs.length ? `${Math.min(...xs).toFixed(3)}–${Math.max(...xs).toFixed(3)}` : "—");
        const vh = Object.values(bildMess)
            .map((m) => m.verhaeltnis)
            .filter(Boolean);
        if (vh.length)
            console.log(
                `Bild gegen V18.536 (${vh.length} Bäume): ` +
                    ["L0", "L1"]
                        .map(
                            (st) =>
                                st +
                                " " +
                                ["0°", "30°", "60°"]
                                    .map((h, i) => h + " " + spanne(vh.filter((v) => v[st]).map((v) => v[st][i])))
                                    .join(" · ")
                        )
                        .join(" | ") +
                    ` | Karte ${spanne(vh.filter((v) => v.karte).map((v) => v.karte[0]))}, ΔE bis ${Math.max(0, ...vh.filter((v) => v.karte).map((v) => v.karte[1])).toFixed(2)}`
            );
        // je Art das Mittel über die Gestalten (das Urteil der Wand)
        const jeArt = {};
        for (const m of Object.values(bildMess)) {
            if (!m.verhaeltnis) continue;
            const e = jeArt[m.art] || (jeArt[m.art] = { L0: [], L1: [], karte: [] });
            for (const st of ["L0", "L1"]) if (m.verhaeltnis[st]) e[st].push(m.verhaeltnis[st]);
            if (m.verhaeltnis.karte) e.karte.push(m.verhaeltnis.karte);
        }
        const mi = (rs, i) => rs.reduce((s2, r) => s2 + r[i], 0) / Math.max(1, rs.length);
        console.log(
            "Bild je Art (Mittel der Gestalten, 0°/30°/60°; Karte Deckung, ΔE max): " +
                Object.entries(jeArt)
                    .sort()
                    .map(
                        ([a, e]) =>
                            `${a} L0 ${[0, 1, 2].map((i) => mi(e.L0, i).toFixed(2)).join("/")} L1 ${[0, 1, 2].map((i) => mi(e.L1, i).toFixed(2)).join("/")} Karte ${mi(e.karte, 0).toFixed(2)} ΔE ${Math.max(0, ...e.karte.map((k) => k[1])).toFixed(1)}`
                    )
                    .join(" · ")
        );
        const inBand = (x) => x >= GESTALT_BAND[0] && x <= GESTALT_BAND[1];
        const ausBand = Object.entries(bildMess)
            .filter(([, m]) => {
                const v = m.verhaeltnis;
                if (!v) return true;
                return (
                    ["L0", "L1"].some((st) => !v[st] || !v[st].every(inBand)) ||
                    !v.karte ||
                    !inBand(v.karte[0]) ||
                    !(v.karte[1] <= KARTE_DE_GESTALT)
                );
            })
            .map(([k]) => k);
        if (ausBand.length)
            console.log(`Gestalten außer ihrem Band: ${ausBand.length} von ${Object.keys(bildMess).length} (${ausBand.join(", ")})`);
        let sL = false,
            sL2 = false,
            sQ = false,
            sQ2 = false,
            sD = false;
        if (kronenProbe) {
            const q3 = bildLagen(kartenVervielfacht(kronenProbe.krone, 3), wand.alpha, kronenProbe.H / LAGEN_TEILER).quad;
            sL = lagenUrteil([{ fall: "eiche-s7-L0 ×3", lod: 0, quad: q3 }], { tree: { 0: { lagen: 16 } } }).length === 1;
            const minL0 = Math.min(...lagenMess.filter((m) => m.lod === 0).map((m) => m.quad));
            sL2 = lagenUrteil(lagenMess, { tree: { 0: { lagen: minL0 - 0.05 } } }).length >= 1;
            const t = tafel && tafel.faelle && tafel.faelle["eiche-s7"];
            if (t) {
                const halb = bildDeckung(kartenSkaliert(kronenProbe.bild, 0.5), wand.alpha, kronenProbe.px).hebung;
                const nur = (m) => bildUrteil({ "eiche-s7": m }, { faelle: { "eiche-s7": t } });
                const echt = { L0: t.L0, L1: t.L1, karte: t.karte };
                const gruen = nur(echt).length === 0;
                const kHalb = nur(Object.assign({}, echt, { L0: halb })).length >= 1;
                const kDeck = nur(Object.assign({}, echt, { karte: { deckung: t.karte.deckung * 0.8, farbe: t.karte.farbe } })).length >= 1;
                const g = t.karte.farbe;
                const kFarbe = nur(Object.assign({}, echt, { karte: { deckung: t.karte.deckung, farbe: [g[0], g[1] * 1.12, g[2]] } })).length >= 1;
                sD = gruen && kHalb && kDeck && kFarbe && Object.keys(bildMess).length >= Object.keys(tafel.faelle).length;
            }
        }
        sQ = quoteUrteil({ "birke-L1": { l0: 1000, l1: 630 } }, { tree: { 1: { quote: 0.35 } } }).length === 1;
        // (W) ein fehlender Schatten-Teil, einer über der Zeile und einer mit 7 Lagen feuern je; die Wand liest die gebauten
        const wB = { tree: { 1: { wurf: { tris: 1200, lagen: 6 } } } };
        const sW =
            wurfUrteil([{ fall: "ohne", teile: 0, tris: 0, lagen: 0 }], wB).length === 1 &&
            wurfUrteil([{ fall: "schwer", teile: 1, tris: 1201, lagen: 3 }], wB).length === 1 &&
            wurfUrteil([{ fall: "dicht", teile: 1, tris: 600, lagen: 7 }], wB).length === 1 &&
            wurfMess.filter((m) => !m.fehlt).length >= 16;
        const qs = Object.values(quotePaare)
            .filter((p) => p.l0 > 0 && p.l1 > 0)
            .map((p) => p.l1 / p.l0);
        sQ2 = qs.length > 0 && quoteUrteil(quotePaare, { tree: { 1: { quote: Math.min(...qs) - 0.01 } } }).length >= 1;
        console.log(
            `Selbsttest Kronen-Kosten: verdreifachte Karten > 16 Lagen ${sL ? "✅" : "❌"} · die Wand liest ${lagenMess.length} Kronen ${sL2 ? "✅" : "❌"} · ` +
                `Birke-L1 0,63 > 0,35 ${sQ ? "✅" : "❌"} · die Wand liest ${qs.length} Paare ${sQ2 ? "✅" : "❌"} · Schatten-Teil fehlt/schwer/dicht wird rot (${wurfMess.length} gelesen) ${sW ? "✅" : "❌"} · halbierte Krone, Karte 0,8 und Kronenfarbe +12 % Grün fallen aus der Bild-Tafel (${Object.keys(bildMess).length} Bäume) ${sD ? "✅" : "❌"}`
        );
        if (!sL || !sL2 || !sQ || !sQ2 || !sW || !sD) fails.push("Selbsttest der Kronen-Kosten feuert nicht");
        const wMax = wurfMess.reduce((m, x) => (x.tris > m.tris ? x : m), { tris: 0, fall: "—" });
        const wMittel = wurfMess.length ? wurfMess.reduce((s, x) => s + (x.tris || 0), 0) / wurfMess.length : 0;
        console.log(
            `Schatten-Teil (${wurfMess.length} Baum-L1): höchstens ${wMax.tris} Dreiecke (${wMax.fall}), im Mittel ${Math.round(wMittel)}, ` +
                `Karten bis ${wurfMess.reduce((m, x) => Math.max(m, x.lagen || 0), 0).toFixed(1)} Lagen`
        );
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
