#!/usr/bin/env node
// ============================================================================
// DIE RÜCKKEHR-WAND — gate:altlasten (ALTLASTEN-NULL W4, 11.07.2026)
//
// Gesetz #0: Struktur statt Wachsamkeit. Jeder vollzogene Abschied hinterlässt
// hier seine Zeile — ein gefallener Name kann strukturell nicht in den Stamm
// zurückkehren (grep = 0 auf dem KOMMENTAR-BEREINIGTEN Code; Kommentare dürfen
// die Geschichte erzählen, der CODE darf das Wort nicht mehr tragen — die
// V18.267-Disziplin). Wächst mit jedem künftigen Abschied: eine Zeile je Name.
//
// Selbst-Test: --selftest injiziert einen verbotenen Namen in eine Kopie und
// beweist, dass die Linse feuert (kein vakuöses Grün).
// ============================================================================
"use strict";
const fs = require("fs");
const path = require("path");

// Die gefallenen Namen (ALTLASTEN-NULL, V18.449). Jede Zeile: Token + wo er
// fiel. PRÄZISE Tokens (keine generischen Wörter — "sprite" allein wäre
// THREE.Sprite-falsch-positiv; die Seelen-Schlüssel sterben über die
// CREATURE_SOULS-Schlüssel-Prüfung unten).
const FORBIDDEN = [
    { token: "tickPhoenixDeath", fiel: "W1a — der Tod ist feld-nativ (_playerDeathRespawn)" },
    { token: "triggerPhoenixDeath", fiel: "W1a" },
    { token: "preDeathSoul", fiel: "W1a — kein Gestalt-Tausch beim Tod" },
    { token: "phoenixUntil", fiel: "W1a — respawnGraceUntil trägt" },
    { token: "phoenixDurationSeconds", fiel: "W1a" },
    { token: '"phoenix"', fiel: "W1a — die Fantasie-Seele" },
    { token: '"dragon"', fiel: "W1a — die Fantasie-Seele" },
    { token: "glutwesen", fiel: "W1b — der Wolf trägt das Raubtier (Gattung)" },
    { token: "_waechterSoulParts", fiel: "W1b — der koerperstudio-Mensch ist DER Menschkörper" },
    { token: "avatar_waechter", fiel: "W1b" },
    { token: "WAECHTER_DIALS", fiel: "W1b" },
    { token: "_p2pMsgAura", fiel: "W1c — aura ist dem Dispatcher unbekannt" },
    { token: "_p2pEnsurePeerAura", fiel: "V18.448 — die Avatar-Aura" },
    { token: "_p2pBroadcastAura", fiel: "V18.448" },
    { token: "tickPlayerAura", fiel: "V18.448" },
    { token: "_ensureAuraSkinShells", fiel: "V18.448" },
    { token: "AURA_TAG_HUE", fiel: "V18.448 (CREATURE_TASK_AURA_HUE lebt — anderes System)" },
    // KONVERGENZ III (V18.456) — die Metaball-KREATUR-Klasse ist gefallen: die vier
    // Gattungen tragen den Studio-Baum (tetrapoda-core.bauTier), die Skin-Isosurface
    // (bake-core/bake-worker) + Gesichts-LOD + Bäcker-Protokoll sind physisch raus.
    { token: "_buildCreatureSkinGeometry", fiel: "KONVERGENZ III — der Baum trägt die Gestalt" },
    { token: "__bakeSkinGeometry", fiel: "KONVERGENZ III — bake-core/bake-worker sind gefallen" },
    { token: "_bakeSkinRequest", fiel: "KONVERGENZ III — das Bäcker-Protokoll" },
    { token: "_ensureBakeWorker", fiel: "KONVERGENZ III — der Bäcker-Worker" },
    { token: "_attachCreatureSkin", fiel: "KONVERGENZ III — die Haut-Anhäng-Naht" },
    { token: "_addCreatureFace", fiel: "KONVERGENZ III — der Baum trägt das ECHTE Gesicht" },
    { token: "_creatureFaceLOD", fiel: "KONVERGENZ III — die Gesichts-LOD-Gruppe" },
    { token: "CREATURE_FACE_LOD_DIST_SQ", fiel: "KONVERGENZ III" },
    { token: "__anazhHeadlessSkinResCap", fiel: "KONVERGENZ III — der Headless-Skin-Res-Knopf" },
    // DIE EINE PIPE (V18.458) — die Stamm-Tunnel neben der Foundry sind gefallen:
    // die Kreatur ist ein Pipe-Asset (Gattungs-Bäcker BAKERS_BY_KIND in foundry-core,
    // Ofen-Assemblierung + Memo/Clone im Stamm). Kein Inline-Baum-Bau, kein eigenes
    // Fern-System, keine Look-Interpretation mehr.
    { token: "_buildTierBaum", fiel: "DIE EINE PIPE — der Stamm-Inline-Baum-Tunnel" },
    { token: "_tierFernTeile", fiel: "DIE EINE PIPE — das Stamm-eigene Fern-System (lod1 kommt aus der Pipe)" },
    { token: "_buildCreatureHideMaterial", fiel: "DIE EINE PIPE — die Look-Interpretation (mp/Studio-Zahlen führen)" },
    // P0-INVENTUR 18.07. — der Phantom-Leser der Augen-Glut: das Vertrags-Feld
    // heisst `ei` (tetrapoda TIER_MATERIAL_KLASSEN); der erfundene Name las nie
    // einen Schreiber und der 0.85-Default gab jedem Kreatur-Auge 2.8x Glut.
    { token: "emissivIntensitaet", fiel: "AUGEN-GLUT-SCHNITT — der Bäcker liest kl.ei (die Gesetzbuch-Wahrheit)" },
    // BOOT-LITERAL-ABSCHIED 18.07. — die palettenfremden Haut-/Haar-Töne des
    // Boot-Menschen: Haut/Haar kommen aus koerper-core SKIN_TONES/HAIR_COLORS
    // (Anker-Farben Γ5 aus dem Welt-Seed bzw. benannte Kern-Anker im Bäcker).
    { token: "0xc89372", fiel: "BOOT-LITERAL-ABSCHIED — die Haut zieht aus der SKIN_TONES-Palette" },
    { token: "0x241712", fiel: "BOOT-LITERAL-ABSCHIED — das Haar zieht aus der HAIR_COLORS-Palette" },
    // DIAL-ZWILLINGS-ABSCHIED 18.07. — die Literal-Kopien der Pflanzen-Tafel:
    // die EINE Quelle ist foundry-core PRESETS (__terrainCore.PHYTO_PRESETS,
    // Leser _phytoStudioDials); nur SPECIES_PALETTE_DEFAULT (neutral) lebt.
    { token: "SPECIES_PHYTO_DIALS", fiel: "DIAL-ZWILLINGS-ABSCHIED — die Studio-Tafel führt (gefühlt == gesehen)" },
    { token: "SPECIES_PALETTE_GIGANT", fiel: "DIAL-ZWILLINGS-ABSCHIED — der Gigant trägt den mammut-Ton der Tafel" },
    { token: "SPECIES_PALETTE[", fiel: "DIAL-ZWILLINGS-ABSCHIED — die Art-Palette wohnt in der Studio-Tafel" },
];

// Die Seelen-Schlüssel-Wahrheit: CREATURE_SOULS = exakt die vier Tiere.
const SOUL_KEYS_EXPECTED = ["wesen", "wolf", "fuchs", "baer"];

// Kommentare strippen, Strings BEWAHREN (die diag-source-probes-Methode:
// zeichenweise, string-bewusst — ein naiver Regex frisst echten Code).
function stripComments(src) {
    let out = "";
    let i = 0;
    const n = src.length;
    let mode = "code"; // code | line | block | sq | dq | tpl
    while (i < n) {
        const c = src[i];
        const c2 = src[i + 1];
        if (mode === "code") {
            if (c === "/" && c2 === "/") {
                mode = "line";
                i += 2;
                continue;
            }
            if (c === "/" && c2 === "*") {
                mode = "block";
                i += 2;
                continue;
            }
            if (c === "'") mode = "sq";
            else if (c === '"') mode = "dq";
            else if (c === "`") mode = "tpl";
            out += c;
            i++;
            continue;
        }
        if (mode === "line") {
            if (c === "\n") {
                mode = "code";
                out += c;
            }
            i++;
            continue;
        }
        if (mode === "block") {
            if (c === "*" && c2 === "/") {
                mode = "code";
                i += 2;
                continue;
            }
            if (c === "\n") out += c;
            i++;
            continue;
        }
        // Strings: Escapes respektieren, Inhalt BEHALTEN
        if (c === "\\") {
            out += c + (c2 || "");
            i += 2;
            continue;
        }
        if ((mode === "sq" && c === "'") || (mode === "dq" && c === '"') || (mode === "tpl" && c === "`")) {
            mode = "code";
        }
        out += c;
        i++;
        continue;
    }
    return out;
}

function scan(files) {
    const errs = [];
    for (const f of files) {
        const raw = fs.readFileSync(f, "utf8");
        const code = stripComments(raw);
        for (const { token, fiel } of FORBIDDEN) {
            let idx = code.indexOf(token);
            if (idx >= 0) {
                const line = code.slice(0, idx).split("\n").length;
                errs.push(`${path.basename(f)}:${line} trägt "${token}" (fiel: ${fiel})`);
            }
        }
    }
    return errs;
}

function checkSoulKeys() {
    // Die Schlüssel-Menge aus dem lebenden Literal ziehen (klammer-bewusst).
    const src = fs.readFileSync(path.join(__dirname, "..", "anazhRealm.js"), "utf8");
    const start = src.indexOf("AnazhRealm.CREATURE_SOULS = Object.freeze({");
    if (start < 0) return ["CREATURE_SOULS-Literal nicht gefunden"];
    let depth = 0;
    let i = src.indexOf("{", start);
    const from = i;
    for (; i < src.length; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") {
            depth--;
            if (depth === 0) break;
        }
    }
    const block = src.slice(from, i + 1);
    const keys = [];
    // Top-Level-Schlüssel: "    <name>: Object.freeze({" auf Tiefe 1
    const re = /\n    (\w+): Object\.freeze\(\{/g;
    let m;
    while ((m = re.exec(block))) keys.push(m[1]);
    const errs = [];
    if (keys.length !== SOUL_KEYS_EXPECTED.length || !SOUL_KEYS_EXPECTED.every((k) => keys.includes(k))) {
        errs.push(
            `CREATURE_SOULS-Schlüssel = [${keys.join(", ")}] — erwartet exakt [${SOUL_KEYS_EXPECTED.join(", ")}]`
        );
    }
    return errs;
}

// ULTRAGUSS U2 — DIE ZWILLINGS-WAND: getötete Formel-Zwillinge dürfen nicht
// nachwachsen. Je Zeile: der Formel-Fingerabdruck darf NUR im Gesetzbuch leben.
const ZWILLINGE = [
    {
        fingerprint: "conif = clamp((api - 0.62)",
        gesetzbuch: "phyto-core.js",
        verboten: ["foundry-core.js"],
        fiel: "U2 — der Phänotyp-Zwilling (foundry-core delegiert an treePhenotype)",
    },
    {
        fingerprint: "ridges: 14, depth: 0.52",
        gesetzbuch: "phyto-core.js",
        verboten: ["foundry-core.js", "anazhRealm.js"],
        fiel: "U2b (V18.467) — das Rinden-Gesetz (barkProfile/buildTubeGesetz) wohnt im Pflanzen-Gesetzbuch, foundry-core delegiert",
    },
    {
        fingerprint: "Math.pow(size / 2.4, 0.67)",
        gesetzbuch: "tetrapoda-core.js",
        verboten: ["worlds/tetrapoda/tetrapoda.js", "anazhRealm.js"],
        fiel: "U4 — die Tier-Allometrie wohnt im Gesetzbuch (deriveTierParams)",
    },
    {
        fingerprint: "Math.sin(phases[j] - phases[i])",
        gesetzbuch: "tetrapoda-core.js",
        verboten: ["worlds/tetrapoda/tetrapoda.js", "anazhRealm.js"],
        fiel: "U4 — der CPG-Phasen-Schritt wohnt im Gesetzbuch (cpgStep)",
    },
    {
        fingerprint: "0.818 * H",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js"],
        fiel: "U3 — die 6-KH-Loomis-Proportionen wohnen im Gesetzbuch (labProportionen)",
    },
    {
        fingerprint: "(0.62 + p.tone * 0.53) * (1 - p.age * 0.35)",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js"],
        fiel: "U3 — die morph()-Dial-Mathe wohnt im Gesetzbuch (labMorph)",
    },
    {
        fingerprint: "reg('glute'+(sd===1?'1':'-1')",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js"],
        fiel: "KONVERGENZ — der Da-Vinci-Teile-Baum (bauMensch) wohnt NUR im Gesetzbuch; Shell + Stamm bauen per Fabrik-Haken (kein Nachbau, nie wieder)",
    },
    {
        fingerprint: "iris: Object.freeze({ c: 0x2a4a6a",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js"],
        fiel: "KONVERGENZ II — die Material-Klassen-Farben wohnen im Gesetzbuch (MATERIAL_KLASSEN); Shell + Stamm LESEN",
    },
    {
        fingerprint: "mahagoni:{hex:0x5f3826",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js"],
        fiel: "KONVERGENZ II — die Haut-/Haar-Paletten wohnen im Gesetzbuch (SKIN_TONES/HAIR_COLORS); der Genom-Roller pickt aus der Lab-Wahrheit",
    },
    {
        fingerprint: "wristFrac: 1.36",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js"],
        fiel: "U3 — das Landmarken-Urteil wohnt im Gesetzbuch (labLandmarks)",
    },
    {
        fingerprint: "Math.abs(lz)>Math.min(Di,Dj)*0.45",
        gesetzbuch: "fachwerk-core.js",
        verboten: ["worlds/fachwerk/fachwerk.js", "anazhRealm.js"],
        fiel: "U6c — das REIHEN-SNAP-Gesetz wohnt im Gesetzbuch (reihenSnap)",
    },
    {
        fingerprint: "A.p.brandwand[lx>0?'x1':'x0']=1",
        gesetzbuch: "fachwerk-core.js",
        verboten: ["worlds/fachwerk/fachwerk.js", "anazhRealm.js"],
        fiel: "U6c — das BRANDWAND-Gesetz wohnt im Gesetzbuch (brandwand)",
    },
    {
        fingerprint: "jahr<1150?'romanik'",
        gesetzbuch: "fachwerk-core.js",
        verboten: ["worlds/fachwerk/fachwerk.js", "anazhRealm.js"],
        fiel: "U6c — das META-Gesetz (Jahr×Klima×Personen×Wohlstand → Form) wohnt im Gesetzbuch (metaParams)",
    },
    {
        fingerprint: "_SNED=[[0,1],[2,3],[4,5],[6,7]",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js", "foundry-core.js"],
        fiel: "V18.463 — die Hüllen-Maschine (Voxel-Ops + Surface-Nets) wohnt im Gesetzbuch; Shell UND Bäcker LESEN",
    },
    {
        fingerprint: "burgundy:{hex:0x5a2530",
        gesetzbuch: "koerper-core.js",
        verboten: ["worlds/koerperstudio/koerperstudio.js", "anazhRealm.js"],
        fiel: "V18.461 — die Stoff-Palette wohnt im Gesetzbuch (CLOTH_COLORS); die Kleid-Zonen (kleidZonen) und die Haar-Streu (haarStreu) sind Kern-Gesetz, beide Leser LESEN",
    },
    {
        fingerprint: "(1 - tipFrac) * Math.pow(t, 1.3)",
        gesetzbuch: "schmiede-core.js",
        verboten: ["anazhRealm.js"],
        fiel: "U6d — die distale Klingen-Verjüngung (bladeProfile) wohnt im Gesetzbuch (klingenProfil)",
    },
    {
        fingerprint: "Math.pow(w / 0.4, 2)",
        gesetzbuch: "schmiede-core.js",
        verboten: ["anazhRealm.js"],
        fiel: "U6d — die Hohlkehle des Wirts-Schnitts (bladeProfile) wohnt im Gesetzbuch (klingenProfil)",
    },
    {
        fingerprint: "bladeLen: 1.45",
        gesetzbuch: "schmiede-core.js",
        verboten: ["anazhRealm.js"],
        fiel: "U6d — die Oakeshott-Proportions-Tabelle wohnt im Gesetzbuch (OAKESHOTT_TYPES, Stamm = Getter-Delegat)",
    },
];

function scanZwillinge() {
    const root = path.join(__dirname, "..");
    const errs = [];
    for (const z of ZWILLINGE) {
        const home = fs.readFileSync(path.join(root, z.gesetzbuch), "utf8");
        if (home.indexOf(z.fingerprint) < 0)
            errs.push(`Zwillings-Wand: Fingerabdruck "${z.fingerprint}" fehlt im Gesetzbuch ${z.gesetzbuch}`);
        for (const f of z.verboten) {
            const src = stripComments(fs.readFileSync(path.join(root, f), "utf8"));
            if (src.indexOf(z.fingerprint) >= 0)
                errs.push(`Zwillings-Wand: ${f} trägt wieder "${z.fingerprint}" (fiel: ${z.fiel})`);
        }
    }
    return errs;
}

// ULTRAGUSS U3 — DIE BUSTER-LINSE (Lehre 10 als Klasse): JEDER Lab-Kern-Script-
// Tag trägt die AKTUELLE Version — ein stale ?v= serviert den Studios altes
// Gesetz aus dem HTTP-Cache (gemessen 11.07.: alle acht Labs stale).
function scanLabBuster() {
    // V18.461: die Wand deckt JEDEN Buster (Kern UND Shell UND Wurzel-Seite) —
    // die Shell-Buster standen bei 18.446 während tetrapoda.js/koerperstudio.js
    // sich bewegten (Cache-Lüge-Klasse). EIN Gesetz: alle ?v= == package.json.
    const root = path.join(__dirname, "..");
    const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
    const errs = [];
    const seiten = [path.join(root, "index.html")];
    for (const w of fs.readdirSync(path.join(root, "worlds"))) {
        const idx = path.join(root, "worlds", w, "index.html");
        if (fs.existsSync(idx)) seiten.push(idx);
    }
    for (const idx of seiten) {
        const src = fs.readFileSync(idx, "utf8");
        const re = /\?v=([0-9.]+)/g;
        let m;
        while ((m = re.exec(src))) {
            if (m[1] !== version) errs.push(`${path.relative(root, idx)} trägt stale ?v=${m[1]} (aktuell ${version})`);
        }
    }
    // V18.472 (Perf-Panel-Linse fing es): AnazhRealm.VERSION driftete vier Wellen lang
    // (18.467 während package.json 18.471 trug) — jeder Flugschreiber-Trace + Panel-Kopf
    // log über die Version. DIESELBE Wand deckt jetzt die Runtime-Konstante: EIN Gesetz,
    // alle Versions-Träger == package.json.
    const stammSrc = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const vm = stammSrc.match(/AnazhRealm\.VERSION = "([0-9.]+)"/);
    if (!vm) errs.push("AnazhRealm.VERSION nicht gefunden (die Versions-Wand braucht den Anker)");
    else if (vm[1] !== version)
        errs.push(`AnazhRealm.VERSION trägt stale "${vm[1]}" (package.json ${version}) — Trace/Panel lügen über die Version`);
    return errs;
}

function main() {
    const root = path.join(__dirname, "..");
    // AUGEN-GLUT-SCHNITT (18.07.): foundry-core (der Ofen/Bäcker) steht mit in
    // der Wand — Phantom-Leser-Namen dürfen auch dort nicht nachwachsen.
    const files = ["anazhRealm.js", "voxel-worker.js", "index.html", "signaling-server.js", "foundry-core.js"].map(
        (f) => path.join(root, f)
    );

    if (process.argv.includes("--selftest")) {
        // Die Linse muss feuern: verbotenen Token in eine Kopie injizieren.
        const tmp = path.join(require("os").tmpdir(), "altlasten-selftest.js");
        fs.writeFileSync(tmp, 'const x = 1;\nfunction tickPhoenixDeath() {}\n// Kommentar darf "glutwesen" sagen\n');
        const hits = scan([tmp]);
        fs.unlinkSync(tmp);
        const fired = hits.length === 1 && /tickPhoenixDeath/.test(hits[0]);
        console.log(
            fired
                ? "✅ SELBST-TEST: die Wand feuert (1 Injektion erkannt, Kommentar ignoriert)"
                : `❌ SELBST-TEST: ${JSON.stringify(hits)}`
        );
        process.exit(fired ? 0 : 1);
    }

    const errs = scan(files).concat(checkSoulKeys()).concat(scanZwillinge()).concat(scanLabBuster());
    if (errs.length) {
        console.log("⛔ DIE RÜCKKEHR-WAND — gefallene Namen im Stamm:");
        for (const e of errs) console.log("   ❌ " + e);
        process.exit(1);
    }
    console.log(
        `✅ DIE RÜCKKEHR-WAND steht — ${FORBIDDEN.length} gefallene Namen grep=0, CREATURE_SOULS = exakt [${SOUL_KEYS_EXPECTED.join(" · ")}], ${ZWILLINGE.length} Zwillings-Fingerabdrücke wohnen nur im Gesetzbuch.`
    );
}

main();
