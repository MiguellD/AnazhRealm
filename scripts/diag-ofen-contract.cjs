#!/usr/bin/env node
// diag-ofen-contract.cjs — DER OFEN-VERTRAG (S1 Wände): das Byte-Golden des Tier- und Mensch-Bakes je
// Stoff-Klasse × Gelenk (npm run gate:ofen-contract).
//
// Sein Ausgang war ohne Golden: 3a0248e8 (das Fell folgt der Haut) und 8e6f628c (die Hand-Mitte) bewiesen ihren
// Byte-Stand von Hand („sha256 je Stoff-Klasse × Gelenk, 189 Klassen: 185 byte-gleich, anders nur die vier
// fellSchale@wolf"; „Mensch-Bake byte-gleich, 53 Klassen"). Diese Linse macht den Handbeweis zur Datei.
//
// Fälle: jede Art des Tier-Gesetzbuchs (wolf · fox · bear · deer) und der Mensch, je deklarierte Stufe (kindStages
// kreatur/koerper [0, 1]), Samen 1 (der Ofen liest den Samen nie — die Linse friert die Invarianz ein: Samen 7 ==
// Samen 1). Je Fall drei Arten von Klassen, jede mit eigenem sha256:
//   <fall>|<klasse>|<gelenk>  — die Meshes einer Stoff-Klasse (material.userData.__klasse) an einem Gelenk
//                               (userData.__assetJoint), in traverse-Reihenfolge: Typ · matrixWorld (Float64) ·
//                               Stoff-Signatur (Farbe · Emissiv · Rauheit · Metall · Deckkraft · Stoff-userData) ·
//                               alle Attribute (Name sortiert, itemSize + rohe Bytes) · Index
//   <fall>|gelenk|<name>      — das Gelenk des Skelett-Beipacks (parent · pos · quat · scale)
//   <fall>|beipack            — der übrige Beipack (root · art · base · skinJoints · tailSegs · masse · handMitte)
// Rot nennt den Täter beim Namen: `wolf-L0|fell|earL: sha256 weicht ab`, `…: fehlt im Ist`, `…: neu (nicht im Golden)`.
//
// PLATTFORM: die Bäcker rechnen in three r128 und den Kernen mit sin/cos/pow — Math.pow kippt seit dem Raster in
// tetrapoda-core (skullR) keine Klasse, sin/cos stehen benannt in spec/asset-contract/plattform-ratsche.json (Satz
// `ofen`). Node 22 (CI) und Node 24 (lokal) prägen dieselben Bytes.
//
// Goldens: spec/asset-contract/ofen/golden/bake.json — EINGEFROREN, gemintet NUR wenn die Datei fehlt (oder
// MINT_FORCE=1, ein benannter Vertrags-Akt im Commit).
//   --selftest: (S1) ein verschobenes Gelenk (wolf L0 earL +1 cm, Skelett und Ohr-Haut) → rot genau an
//   gelenk|earL und den Klassen am Gelenk earL · (S2) eine falsche Stoff-Zuordnung (wolf L0: der Zahn am Kopf trägt
//   die Klasse zahnfleisch) → rot an zahn|headGroup (fehlt) und zahnfleisch|headGroup · (S3) korruptes Golden → rot.
//   node scripts/diag-ofen-contract.cjs [--selftest]
"use strict";
const { selbsttestEnde, wandEnde, fadenScope, pruefer, ausDatei, SELBSTTEST } = require("./lib/welt-boot.cjs");
const crypto = require("crypto");
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const { probeWand } = require("./lib/plattform-probe.cjs");

const ROOT = path.resolve(__dirname, "..");
const GOLDEN_DIR = path.join(ROOT, "spec/asset-contract/ofen/golden");
const GOLDEN = path.join(GOLDEN_DIR, "bake.json");
const QUELLEN = [
    "worlds/terrain/lib/three-r128.min.js",
    "phyto-core.js",
    "koerper-core.js",
    "tetrapoda-core.js",
    "foundry-core.js",
];
const SAME = 1;

const { errs, check } = pruefer();

// Die Welt des Ofens: three r128 und die Kerne im node-vm wie im Foundry-Worker; das Math des Gates (die
// Plattform-Probe erreicht so den Guss).
const ladeOfen = () => fadenScope(QUELLEN);

// Die Fälle aus den Gesetzbüchern selbst: jede Art × jede deklarierte Stufe.
function faelle(sb) {
    const out = [];
    const T = sb.__tetrapodaCore;
    const K = sb.__koerperCore;
    for (const [kind, kern] of [
        ["kreatur", T],
        ["koerper", K],
    ]) {
        const stufen = kern.PORTAL_RENDER_CONFIG.lod.kindStages[kind];
        for (const art of Object.keys(kern.PRESETS)) for (const lod of stufen) out.push({ kind, kern, art, lod });
    }
    return out;
}

// Der Fingerabdruck einer gebackenen Gruppe → { schlüssel: { meshes, verts, tris, sha256 } }.
function fingerabdruck(g, fall) {
    const klassen = {};
    const hashes = {};
    g.updateMatrixWorld(true);
    g.traverse((o) => {
        const geo = o.geometry;
        if (!geo || !geo.attributes || !geo.attributes.position) return;
        const m = o.material || {};
        const mu = Object.assign({}, m.userData || {});
        const klasse = mu.__klasse;
        delete mu.__klasse;
        const key = `${fall}|${klasse}|${o.userData && o.userData.__assetJoint}`;
        const h = hashes[key] || (hashes[key] = crypto.createHash("sha256"));
        const k = klassen[key] || (klassen[key] = { meshes: 0, verts: 0, tris: 0 });
        k.meshes++;
        k.verts += geo.attributes.position.count;
        k.tris += (geo.index ? geo.index.count : geo.attributes.position.count) / 3;
        h.update(String(o.type));
        h.update(Buffer.from(new Float64Array(o.matrixWorld.elements).buffer));
        h.update(
            JSON.stringify({
                c: m.color ? m.color.getHex() : null,
                e: m.emissive ? m.emissive.getHex() : null,
                r: typeof m.roughness === "number" ? m.roughness : null,
                mt: typeof m.metalness === "number" ? m.metalness : null,
                o: typeof m.opacity === "number" ? m.opacity : null,
                t: !!m.transparent,
                ud: Object.keys(mu)
                    .sort()
                    .map((x) => [x, mu[x]]),
            })
        );
        for (const name of Object.keys(geo.attributes).sort()) {
            const a = geo.attributes[name];
            h.update(name);
            h.update(String(a.itemSize));
            h.update(Buffer.from(a.array.buffer, a.array.byteOffset, a.array.byteLength));
        }
        if (geo.index) {
            const ia = geo.index.array;
            h.update("index");
            h.update(Buffer.from(ia.buffer, ia.byteOffset, ia.byteLength));
        }
    });
    for (const key in hashes) klassen[key].sha256 = hashes[key].digest("hex");
    const sk = g.userData && g.userData.__skelett;
    if (sk) {
        for (const j of sk.joints)
            klassen[`${fall}|gelenk|${j.name}`] = {
                sha256: crypto
                    .createHash("sha256")
                    .update(JSON.stringify([j.parent, j.pos, j.quat, j.scale]))
                    .digest("hex"),
            };
        const rest = Object.assign({}, sk);
        delete rest.joints;
        klassen[`${fall}|beipack`] = {
            sha256: crypto
                .createHash("sha256")
                .update(
                    JSON.stringify(
                        Object.keys(rest)
                            .sort()
                            .map((x) => [x, rest[x]])
                    )
                )
                .digest("hex"),
        };
    }
    return klassen;
}

const fallName = (c) => `${c.art}-L${c.lod}`;
const backe = (sb, c, same) => sb.BAKERS_BY_KIND[c.kind](c.kern, c.art, same, c.lod, null);

function allesBacken(sb, same, eingriff) {
    const ist = {};
    for (const c of faelle(sb)) {
        const g = backe(sb, c, same);
        if (eingriff) eingriff(sb, c, g);
        Object.assign(ist, fingerabdruck(g, fallName(c)));
    }
    return ist;
}

// Vergleich → Abweichungen beim Namen (auch der Selbst-Test ruft ihn).
function vergleiche(golden, ist) {
    const bad = [];
    for (const k of Object.keys(golden)) {
        const g = golden[k];
        const a = ist[k];
        if (!a) bad.push(`${k}: fehlt im Ist`);
        else if (g.sha256 !== a.sha256)
            bad.push(
                `${k}: sha256 weicht ab (${g.sha256.slice(0, 12)}… != ${a.sha256.slice(0, 12)}…)` +
                    (g.verts != null && (g.verts !== a.verts || g.tris !== a.tris)
                        ? ` — ${g.verts}/${g.tris} → ${a.verts}/${a.tris} Ecken/Dreiecke`
                        : "")
            );
    }
    for (const k of Object.keys(ist)) if (!golden[k]) bad.push(`${k}: neu (nicht im Golden)`);
    return bad;
}
const namen = (bad) => bad.map((s) => s.split(":")[0]);

// ── Die Täter des Selbst-Tests (wolf L0) ──
// S1 — ein verschobenes Gelenk: earL wandert 1 cm nach außen, das Skelett UND die Haut am Gelenk.
function taeterGelenk(sb, c, g) {
    if (c.art !== "wolf" || c.lod !== 0) return;
    const j = g.userData.__skelett.joints.find((x) => x.name === "earL");
    j.pos = [j.pos[0] + 0.01, j.pos[1], j.pos[2]];
    g.traverse((o) => {
        if (o.geometry && o.userData && o.userData.__assetJoint === "earL") o.geometry.translate(0.01, 0, 0);
    });
}
// S2 — eine falsche Stoff-Zuordnung: der Zahn am Kopf trägt die Klasse des Zahnfleischs.
function taeterStoff(sb, c, g) {
    if (c.art !== "wolf" || c.lod !== 0) return;
    g.traverse((o) => {
        if (
            o.material &&
            o.material.userData &&
            o.material.userData.__klasse === "zahn" &&
            o.userData.__assetJoint === "headGroup"
        ) {
            o.material = o.material.clone();
            o.material.userData = Object.assign({}, o.material.userData, { __klasse: "zahnfleisch" });
        }
    });
}

// ── DER START DES OFENS: was jeder Studio-Faden rechnet, bevor er antwortet ──
// Die Brücke lädt im Faden als letzte und ruft `foundryModus` (jeder Foundry-Faden beim Start: das Buch, die Bäcker, die
// Helfer); dessen `buildMaterials` prägt die Rinden-Normale (`makeBarkNormal`). Ihre Kerne griffen an gebrochenen Indizes in ein Float32Array: das schreibt nichts (die Spezifikation
// verwirft den Index) und nimmt den langsamen Pfad der Eigenschafts-Namen — Radeon kalt 1,3 s im Buch-Faden vor dem Buch,
// 2,0–3,1 s in jedem der acht Fäden zugleich. Die Linse zählt jeden Zugriff eines Start-Arrays an einem gebrochenen Index
// (Täter beim Namen) und hält die Bytes der Normale (sha256, die Prägung der Saat 99). B3a: jede Start-Leinwand ist eine
// CPU-Leinwand (willReadFrequently) — ihr putImageData auf der GPU-Leinwand wartete im Faden auf den GPU-Prozess (Radeon kalt 2,27 s).
const RINDE_SHA = "039367ab31640d7f";
const BRUECKE = ausDatei(path.join(ROOT, "foundry-bruecke.js"));
function ofenStart(eingriff) {
    const sb = ladeOfen();
    let bild = null;
    const gpu = [];
    sb.OffscreenCanvas = function (w, h) {
        this.width = w;
        this.height = h;
        this.getContext = (_art, o) => (gpu.push(!(o && o.willReadFrequently)), {
            createImageData: (iw, ih) => ({ data: new Uint8ClampedArray(iw * ih * 4) }),
            putImageData: (img) => (bild = img.data),
        });
    };
    if (eingriff) eingriff(sb);
    const zaehl = { gebrochen: 0, zugriffe: 0 };
    const kanonBruch = (k) => {
        if (typeof k !== "string") return false;
        const n = Number(k);
        return String(n) === k && !Number.isInteger(n) && Number.isFinite(n);
    };
    const falle = {
        get(t, k) {
            if (kanonBruch(k)) zaehl.gebrochen++;
            return t[k];
        },
        set(t, k, v) {
            if (kanonBruch(k)) zaehl.gebrochen++;
            t[k] = v;
            return true;
        },
    };
    const echt = {};
    for (const T of ["Float32Array", "Float64Array"]) {
        echt[T] = vm.runInContext(T, sb);
        sb[T] = function (n) {
            zaehl.zugriffe++;
            return new Proxy(new echt[T](n), falle);
        };
    }
    // der Faden-Start selbst: die Brücke lädt als letzte (self.__PHYTO_FOUNDRY_WORKER) und ruft foundryModus
    sb.__PHYTO_FOUNDRY_WORKER = true;
    sb.postMessage = () => {};
    sb.window = undefined; // im Faden gibt es kein Fenster (die Kerne luden mit ihm wie im Labor)
    const t0 = Date.now();
    try {
        vm.runInContext(BRUECKE, sb, { filename: "foundry-bruecke.js" });
    } finally {
        for (const T in echt) sb[T] = echt[T];
    }
    const sha = bild ? crypto.createHash("sha256").update(Buffer.from(bild.buffer)).digest("hex") : null;
    return {
        gebrochen: zaehl.gebrochen,
        gpu: gpu.filter(Boolean).length,
        arrays: zaehl.zugriffe,
        sha,
        ms: Date.now() - t0,
        bytes: bild ? bild.length : 0,
    };
}
// S4 — die alte Rinde: jeder Kern-Zugriff greift, ob er schreibt oder nicht (der Bau vor K60-2).
function taeterRinde(sb) {
    const src = vm.runInContext("makeBarkNormal.toString()", sb);
    const alt = src.replace(/if \(ganz\(k\)\) /g, "").replace(", { willReadFrequently: true }", "");
    if (alt === src)
        throw new Error(
            "S4: die Schreib-Regel `if (ganz(k))` fehlt in makeBarkNormal — der Selbst-Test kennt den Kern nicht mehr"
        );
    vm.runInContext(alt, sb);
}

(async function main() {
    const selbsttest = SELBSTTEST;
    const sb = ladeOfen();
    check(
        "Ofen geladen (BAKERS_BY_KIND.kreatur + .koerper, __tetrapodaCore + __koerperCore)",
        !!(
            sb.BAKERS_BY_KIND &&
            sb.BAKERS_BY_KIND.kreatur &&
            sb.BAKERS_BY_KIND.koerper &&
            sb.__tetrapodaCore &&
            sb.__koerperCore
        )
    );
    const t0 = Date.now();
    const ist = allesBacken(sb, SAME);
    const F = faelle(sb);
    const n = (re) => Object.keys(ist).filter((k) => re.test(k)).length;
    const stoffTier = Object.keys(ist).filter((k) => !/\|gelenk\||\|beipack$/.test(k) && !/^mensch-/.test(k)).length;
    const stoffMensch = Object.keys(ist).filter((k) => !/\|gelenk\||\|beipack$/.test(k) && /^mensch-/.test(k)).length;
    console.log(
        `      ↳ ${F.length} Fälle gebacken in ${((Date.now() - t0) / 1000).toFixed(1)} s: ${stoffTier} Stoff-Klassen × Gelenk Tier, ${stoffMensch} Mensch, ${n(/\|gelenk\|/)} Gelenke, ${n(/\|beipack$/)} Beipacks`
    );

    if (selbsttest) {
        console.log("=== SELBST-TEST: die Ofen-Linse nennt den Täter beim Namen ===");
        const s1 = vergleiche(ist, allesBacken(ladeOfen(), SAME, taeterGelenk));
        const erwartet1 = Object.keys(ist).filter((k) => /^wolf-L0\|(.+\|earL|gelenk\|earL)$/.test(k));
        check(
            `S1 verschobenes Gelenk (wolf L0 earL +1 cm): rot genau an ${erwartet1.length} Klassen — ${erwartet1.join(", ")}`,
            erwartet1.length >= 2 && JSON.stringify(namen(s1).sort()) === JSON.stringify(erwartet1.sort()),
            s1.slice(0, 4).join(" · ")
        );
        const s2 = vergleiche(ist, allesBacken(ladeOfen(), SAME, taeterStoff));
        check(
            "S2 falsche Stoff-Zuordnung (wolf L0: Zahn am Kopf als zahnfleisch): rot an zahn|headGroup (fehlt) und zahnfleisch|headGroup",
            s2.some((s) => s.startsWith("wolf-L0|zahn|headGroup: fehlt im Ist")) &&
                s2.some((s) => s.startsWith("wolf-L0|zahnfleisch|headGroup: sha256 weicht ab")) &&
                s2.length === 2,
            s2.join(" · ")
        );
        const korrupt = JSON.parse(JSON.stringify(ist));
        const k0 = Object.keys(korrupt)[0];
        korrupt[k0].sha256 = (korrupt[k0].sha256[0] === "0" ? "1" : "0") + korrupt[k0].sha256.slice(1);
        const s3 = vergleiche(korrupt, ist);
        check("S3 korruptes Golden: rot an genau der Klasse", s3.length === 1 && s3[0].startsWith(k0 + ": sha256"));
        const s4 = ofenStart(taeterRinde);
        check(
            `S4 die alte Rinde (jeder Kern-Zugriff greift, GPU-Leinwand): rot an makeBarkNormal mit ${s4.gebrochen} gebrochenen Zugriffen und ${s4.gpu} GPU-Leinwand, dieselben Bytes`,
            s4.gebrochen > 0 && s4.gpu > 0 && !!s4.sha && s4.sha.startsWith(RINDE_SHA),
            `${s4.ms} ms`
        );
        selbsttestEnde(errs, "ein verschobenes Gelenk und eine falsche Stoff-Zuordnung werden rot beim Namen.");
        process.exit(0);
    }

    console.log("=== OFEN-VERTRAG — Tier- und Mensch-Bake je Stoff-Klasse × Gelenk (foundry-core BAKERS_BY_KIND) ===");
    // 1) Determinismus: ein zweiter Guss in einem frischen Kontext ist byte-gleich.
    const zwei = vergleiche(ist, allesBacken(ladeOfen(), SAME));
    check(
        `Determinismus: ein frischer Ofen gießt alle ${Object.keys(ist).length} Klassen byte-gleich`,
        zwei.length === 0,
        zwei[0]
    );
    // 2) Samen-Invarianz: der Ofen liest den Samen nie (Synthese §2.3 „Gestalten ehrlich") — eingefroren.
    const s7 = vergleiche(ist, allesBacken(sb, 7));
    check("Samen-Invarianz: Samen 7 == Samen 1 je Klasse (der Ofen liest den Samen nie)", s7.length === 0, s7[0]);
    // 3) Die Klassen-Zahl je Gesetzbuch.
    check(
        `Stoff-Klassen × Gelenk: Tier ${stoffTier} + Mensch ${stoffMensch} = ${stoffTier + stoffMensch} (der Handbeweis: 136 + 53 = 189)`,
        stoffTier + stoffMensch > 0
    );
    // 4) Das Golden: einfrieren beim ersten Lauf, danach byte-exakt.
    if (!fs.existsSync(GOLDEN) || process.env.MINT_FORCE === "1") {
        fs.mkdirSync(GOLDEN_DIR, { recursive: true });
        fs.writeFileSync(
            GOLDEN,
            JSON.stringify(
                {
                    vertrag: "ofen",
                    minted: "foundry-core BAKERS_BY_KIND.kreatur/.koerper(kern, art, 1, lod, null) — sha256 je Stoff-Klasse × Gelenk, je Gelenk, je Beipack",
                    klassen: ist,
                },
                null,
                1
            ) + "\n"
        );
        console.log(
            `  🧊 GOLDEN GEMINTET (${Object.keys(ist).length} Klassen) → ${path.relative(ROOT, GOLDEN)} — ab jetzt EINGEFROREN`
        );
    }
    const golden = ausDatei(GOLDEN, true).klassen;
    const diffs = vergleiche(golden, ist);
    check(`Golden byte-exakt (${Object.keys(golden).length} Klassen)`, diffs.length === 0, diffs[0] || "");
    for (let i = 1; i < Math.min(diffs.length, 40); i++) console.log(`      ↳ ${diffs[i]}`);
    if (diffs.length > 40) console.log(`      ↳ … ${diffs.length - 40} weitere`);

    // 5) DER START DES OFENS: die Rinden-Normale jedes Studio-Fadens greift nie an einen gebrochenen Index.
    const start = ofenStart();
    check(
        `Start des Ofens (die Brücke im Faden, foundryModus): makeBarkNormal greift ${start.gebrochen}-mal an einen gebrochenen Index (Soll 0, ${start.arrays} Start-Arrays) und malt auf ${start.gpu} GPU-Leinwand (Soll 0: dort wartet putImageData auf den GPU-Prozess)`,
        start.gebrochen === 0 && start.gpu === 0,
        `${start.ms} ms`
    );
    check(
        `Start des Ofens: die Rinden-Normale prägt ihre Bytes (sha256 ${RINDE_SHA}…, ${start.bytes} Bytes)`,
        !!start.sha && start.sha.startsWith(RINDE_SHA) && start.bytes === 512 * 512 * 4,
        start.sha ? start.sha.slice(0, 16) : "kein Bild"
    );

    // 6) PLATTFORM-PROBE (scripts/lib/plattform-probe.cjs): jeder Guss noch einmal mit ±1 ULP auf jeder Transzendenten.
    await probeWand(
        "ofen",
        {
            laden: ladeOfen,
            bauen: (s) => {
                const r = {};
                const k = allesBacken(s, SAME);
                for (const x in k) r[x] = k[x].sha256;
                return r;
            },
        },
        check
    );

    wandEnde(errs, "der Ofen-Vertrag steht: Tier und Mensch gießen je Stoff-Klasse × Gelenk, je Gelenk und je Beipack byte-gleich zum Golden, deterministisch und samen-invariant; Math.pow erreicht keine Klasse.");
})();
