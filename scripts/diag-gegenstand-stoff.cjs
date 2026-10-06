// diag-gegenstand-stoff.cjs — DIE STOFF-LINSE DER GEGENSTÄNDE (W5, 05.10.): was ein Fahrzeug und eine Klinge der WELT
// an Albedo liefern, je Stoff gegen das Band der Natur geurteilt (das FARB-GESETZ: ein Paletten-Hex ist eine sRGB-
// Absicht, die Albedo sein linearer Wert — Kreatur-Bäcker, Vegetation und Gegenstände lesen dieselbe Kurve).
//
// Node-DIREKT (r128-UMD + require, wie gate:vehicle-contract): je Fahrzeug-Rezept × Lack-Gestalt (Same 1..8) und je
// Schmiede-Rezept baut das Gesetzbuch seine Welt-Gestalt (`buildInstance`); je Mesh liest die Linse, was in die Welt
// reist — die Material-Farbe (ein Stoff ohne Vertex-Farben) bzw. das flächen-gewichtete Mittel der Vertex-Farben (der
// Wirt liest NUR das color-Attribut: eine Material-Tönung dazu zeigt das Labor, die Welt nie — Lab ≠ Welt).
// Benannte Täter (je einer eine Probe):
//   ohne-stoff   ein Material ohne userData.__stoff (das Gesetzbuch sagt nicht, was es ist)
//   labor-stoff  Ton (Clay) oder eine Lehre-Überlage in der Welt-Gestalt (der Wagen fuhr als Ton-Modell)
//   band         Albedo (bzw. F0 der Metalle) außerhalb des Bands ihres Stoffs (der Reifen lag roh bei 0,08)
//   klarlack     ein Lack ohne Lackschicht (in der Welt wurde er ein Metall: Tiefschwarz spiegelte nichts)
//   lack-art     ein Uni-Lack als Metall (der gefärbte Spiegel, metalness 0,85) oder ein Metallic-Lack ohne Flocken
//   durchsicht   eine Scheibe ohne Durchsicht
//   toenung      Vertex-Farben UND eine nicht-weiße Material-Farbe (das Labor tönt, die Welt nicht)
//   lack-gestalt die Gestalten tragen nicht die acht Lacke des LACK_GESETZ (linear)
//   transport    der Extraktor (phytogenesis) reicht Klarlack/Durchsicht nicht, der Wirt baut sie nicht
//   node scripts/diag-gegenstand-stoff.cjs [--selftest]
"use strict";
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
global.THREE = require(path.join(root, "worlds/terrain/lib/three-r128.min.js"));
require(path.join(root, "vehicle-core.js"));
require(path.join(root, "schmiede-core.js"));
const VC = globalThis.__vehicleCore;
const SC = globalThis.__schmiedeCore;

// DAS BAND DER NATUR je Stoff (lineare Albedo-Luminanz; bei Metallen F0) — die AAA-Referenz (PBR-Tafeln: Ruß/Gummi
// 0,02–0,04 · schwarzer Kunststoff 0,02–0,05 · Leder 0,03–0,2 · Holz 0,05–0,45 · Eisen F0 0,56 · Aluminium 0,91 · Messing
// F0 ~0,8; beschichtete/geschwärzte Metalle tiefer). Darunter liegt nur noch Ruß; ein Stoff dort ist ein Palettenfehler.
const BAND = {
    gummi: [0.015, 0.05],
    kunststoff: [0.015, 0.08],
    polster: [0.02, 0.35],
    lack: [0.003, 0.9],
    blank: [0.3, 0.95], // blankes Metall: Felge, Klinge, Roh-Stahl
    buntmetall: [0.25, 0.95], // Messing, Bronze
    metall: [0.1, 0.95], // beschichtet, geschwärzt, geschmiedet
    glas: [0, 0.06],
    leder: [0.02, 0.2],
    holz: [0.05, 0.45],
    schnur: [0.02, 0.4],
};
const LABOR = new Set(["ton", "lehre"]);
const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
const lin = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
const linHex = (h) => [lin(((h >> 16) & 255) / 255), lin(((h >> 8) & 255) / 255), lin((h & 255) / 255)];

// Was ein Mesh der Welt an Albedo liefert: Vertex-Farben (Mittel) oder die Material-Farbe.
function weltAlbedo(o) {
    const ca = o.geometry && o.geometry.attributes && o.geometry.attributes.color;
    if (ca && o.material.vertexColors) {
        const s = [0, 0, 0];
        for (let i = 0; i < ca.count; i++) {
            s[0] += ca.getX(i);
            s[1] += ca.getY(i);
            s[2] += ca.getZ(i);
        }
        return { c: s.map((v) => v / Math.max(1, ca.count)), vc: true };
    }
    return { c: [o.material.color.r, o.material.color.g, o.material.color.b], vc: false };
}

// Das Urteil über EINE Welt-Gestalt: Liste der Täter (je Stoff höchstens einer je Art).
function urteil(name, group) {
    const out = [];
    const gesehen = new Set();
    group.traverse((o) => {
        if (!o.isMesh || !o.material) return;
        const m = o.material;
        const st = m.userData && m.userData.__stoff;
        const w = weltAlbedo(o);
        const key = (st || "?") + "|" + m.uuid;
        if (gesehen.has(key)) return;
        gesehen.add(key);
        if (!st) return out.push(`${name}: ohne-stoff (${m.type} ${m.color ? m.color.getHexString() : ""})`);
        if (LABOR.has(st)) return out.push(`${name}: labor-stoff ${st} in der Welt-Gestalt`);
        if (st === "licht") {
            const em = m.emissive ? [m.emissive.r, m.emissive.g, m.emissive.b] : [0, 0, 0];
            if (!(lum(em) * (m.emissiveIntensity || 0) >= 0.05)) out.push(`${name}: band licht glüht nicht`);
            return;
        }
        const b = BAND[st];
        if (!b) return out.push(`${name}: ohne-stoff (unbekannter Stoff ${st})`);
        const L = lum(w.c);
        if (!(L >= b[0] && L <= b[1]))
            out.push(`${name}: band ${st} ${L.toFixed(4)} ∉ [${b[0]}, ${b[1]}]${w.vc ? " (Vertex-Farben)" : ""}`);
        if (st === "lack" && m.userData.__lack && !(m.clearcoat > 0)) out.push(`${name}: klarlack fehlt`);
        // Die Lack-Art: ein Uni-Lack ist pigmentiert (Dielektrikum), ein Metallic-Lack spiegelt seine Farbe über Flocken.
        if (st === "lack" && m.userData.__lack) {
            const z = VC.LACK_GESETZ.find((r) => r[0] === m.userData.__lack);
            const metal = z && z[3] === "metallic";
            if (!z || (metal ? !(m.metalness >= 0.5) : !(m.metalness <= 0.05)))
                out.push(`${name}: lack-art ${m.userData.__lack} metalness ${m.metalness} (${z ? z[3] : "ohne Zeile"})`);
        }
        if (st === "glas" && !(m.transparent && m.opacity < 1)) out.push(`${name}: durchsicht fehlt`);
        if (w.vc && (m.color.r < 0.999 || m.color.g < 0.999 || m.color.b < 0.999))
            out.push(`${name}: toenung ${st} (Material-Farbe ${m.color.getHexString()} auf Vertex-Farben)`);
    });
    return out;
}

// Der Lack der Gestalten: Same 1..8 trägt die acht Lacke des Gesetzes (linear), der Körper (größte Lack-Fläche) zählt.
function lackGestalten() {
    const out = [];
    const soll = VC.LACK_GESETZ.slice(1).map((z) => linHex(z[1]));
    const ist = [];
    for (let s = 1; s <= soll.length; s++) {
        const g = VC.buildInstance("gt", s, 0);
        let best = null;
        let n = 0;
        g.traverse((o) => {
            // der Karosserie-Lack (lackStoff stempelt __lack; der Bremssattel ist Lack, aber nicht die Karosserie)
            if (!o.isMesh || !o.material || !o.material.userData || !o.material.userData.__lack) return;
            const c = [o.material.color.r, o.material.color.g, o.material.color.b];
            const k = c.join(",");
            n++;
            if (!best || best.k !== k) best = best || { k, c };
        });
        ist.push(best ? best.c : null);
        if (!n) out.push(`lack-gestalt: Same ${s} trägt keinen Karosserie-Lack`);
    }
    const treffer = soll.filter((c) => ist.some((x) => x && x.every((v, i) => Math.abs(v - c[i]) < 1e-6))).length;
    if (treffer !== soll.length) out.push(`lack-gestalt: ${treffer}/${soll.length} Lacke des LACK_GESETZ in den Gestalten`);
    return out;
}

// Der Transport: der Extraktor reicht Klarlack und Durchsicht, das Gesetz der Regler liest sie, der Wirt baut sie.
function transport(phytoSrc, pcSrc, anazhSrc) {
    const out = [];
    if (!/out\.mat\.clearcoat\s*=/.test(phytoSrc) || !/out\.mat\.opacity\s*=/.test(phytoSrc))
        out.push("transport: __extractAssetMesh reicht Klarlack/Durchsicht nicht");
    if (!/\bcc:\s*mp\b/.test(pcSrc) || !/\bop:\s*mp\b/.test(pcSrc))
        out.push("transport: budgetRegler liest Klarlack/Durchsicht nicht");
    const i = anazhSrc.indexOf("_foundryTreeMaterial(kind, mp, wiegen) {");
    const body = i >= 0 ? anazhSrc.slice(i, i + 6000) : "";
    if (!/R\.cc\s*>\s*0/.test(body) || !/R\.op\s*<\s*1/.test(body))
        out.push("transport: _foundryTreeMaterial baut Klarlack/Durchsicht nicht");
    return out;
}

function alles() {
    const out = [];
    for (const id of Object.keys(VC.PRESETS))
        for (let s = 1; s <= 8; s++) out.push(...urteil(`fahrzeug ${id} Same ${s}`, VC.buildInstance(id, s, 0)));
    for (const id of Object.keys(SC.PRESETS)) out.push(...urteil(`klinge ${id}`, SC.buildInstance(id, 1, 0)));
    out.push(...lackGestalten());
    out.push(
        ...transport(
            fs.readFileSync(path.join(root, "worlds/terrain/phytogenesis.js"), "utf8"),
            fs.readFileSync(path.join(root, "phyto-core.js"), "utf8"),
            fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8")
        )
    );
    return [...new Set(out)];
}

function selbstTest() {
    const fehl = [];
    const mk = (st, hex, extra) => {
        const m = new THREE.MeshStandardMaterial(Object.assign({ color: hex }, extra || {}));
        m.userData.__stoff = st;
        const g = new THREE.Group();
        g.add(new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), m));
        return g;
    };
    const roh = (h) => {
        const g = mk("gummi", h);
        g.children[0].material.color.setRGB(...linHex(h));
        return g;
    };
    if (urteil("t", roh(0x2a2c2f)).length !== 0) fehl.push("gesunder Reifen meldet");
    // der Reifen roh (r128 las 0x131519 als 0,08 linear)
    if (!urteil("t", mk("gummi", 0x131519)).some((s) => s.includes("band gummi")))
        fehl.push("roher Reifen bleibt still");
    if (!urteil("t", mk("ton", 0x8d9499)).some((s) => s.includes("labor-stoff"))) fehl.push("Ton-Karosserie bleibt still");
    const lack = (name, metalness, cc) => {
        const g = mk("lack", 0x111319, { metalness });
        g.children[0].material.userData.__lack = name;
        g.children[0].material.clearcoat = cc;
        return g;
    };
    if (!urteil("t", lack("Tiefschwarz", 0, 0)).some((s) => s.includes("klarlack")))
        fehl.push("Lack ohne Klarlack bleibt still");
    // der Uni-Lack als gefärbter Spiegel (bis W5: jeder Lack metalness 0,85)
    if (!urteil("t", lack("Signalrot", 0.85, 1)).some((s) => s.includes("lack-art")))
        fehl.push("Uni-Lack als Metall bleibt still");
    if (!urteil("t", mk("glas", 0x0a0f18)).some((s) => s.includes("durchsicht"))) fehl.push("blinde Scheibe bleibt still");
    const vc = mk("holz", 0x6b4a2a, { vertexColors: true });
    const geo = vc.children[0].geometry;
    geo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(0.2), 3));
    if (!urteil("t", vc).some((s) => s.includes("toenung"))) fehl.push("getönte Vertex-Farben bleiben still");
    if (!urteil("t", (() => { const g = mk("gummi", 0x2a2c2f); delete g.children[0].material.userData.__stoff; return g; })()).some((s) => s.includes("ohne-stoff")))
        fehl.push("Stoff ohne Namen bleibt still");
    if (!transport("", "", "").length) fehl.push("Transport ohne Quelle bleibt still");
    return fehl;
}

const fehlSelbst = selbstTest();
if (process.argv.includes("--selftest")) {
    if (fehlSelbst.length) {
        console.error("❌ SELBST-TEST ROT — " + fehlSelbst.join(" · "));
        process.exit(1);
    }
    console.log("✅ SELBST-TEST GRÜN — die Stoff-Linse feuert auf Ton, rohen Reifen, Lack ohne Lackschicht, blinde Scheibe, Tönung, Namenlose und fehlenden Transport.");
    process.exit(0);
}
const befunde = alles();
console.log("=== DIE STOFF-LINSE DER GEGENSTÄNDE (Fahrzeuge × 8 Lacke · Klingen/Werkzeuge) ===");
const klassen = {};
for (const b of befunde) {
    const k = (b.split(": ")[1] || b).split(" ")[0];
    klassen[k] = (klassen[k] || 0) + 1;
}
for (const b of befunde.slice(0, 40)) console.log("  ❌ " + b);
if (befunde.length > 40) console.log(`  … ${befunde.length - 40} weitere`);
if (fehlSelbst.length) console.log("  ❌ Selbst-Test: " + fehlSelbst.join(" · "));
if (befunde.length || fehlSelbst.length) {
    console.error(`\n❌ ROT — ${befunde.length} Befund(e): ${JSON.stringify(klassen)}`);
    process.exit(1);
}
console.log("\n✅ GRÜN — jeder Stoff der Fahrzeuge und Klingen liegt im Band seiner Natur, der Lack trägt seine Lackschicht und die acht Lacke, jede Scheibe ihre Durchsicht, das Labor tönt nichts, was die Welt nicht sieht.");
process.exit(0);
