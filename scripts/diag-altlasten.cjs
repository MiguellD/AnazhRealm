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
        errs.push(`CREATURE_SOULS-Schlüssel = [${keys.join(", ")}] — erwartet exakt [${SOUL_KEYS_EXPECTED.join(", ")}]`);
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
    const root = path.join(__dirname, "..");
    const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")).version;
    const errs = [];
    const worlds = fs.readdirSync(path.join(root, "worlds"));
    for (const w of worlds) {
        const idx = path.join(root, "worlds", w, "index.html");
        if (!fs.existsSync(idx)) continue;
        const src = fs.readFileSync(idx, "utf8");
        const re = /src="[^"]*-core\.js\?v=([0-9.]+)"/g;
        let m;
        while ((m = re.exec(src))) {
            if (m[1] !== version) errs.push(`worlds/${w}/index.html lädt Kern mit stale ?v=${m[1]} (aktuell ${version})`);
        }
    }
    return errs;
}

function main() {
    const root = path.join(__dirname, "..");
    const files = ["anazhRealm.js", "voxel-worker.js", "bake-core.js", "index.html", "signaling-server.js"].map((f) =>
        path.join(root, f)
    );

    if (process.argv.includes("--selftest")) {
        // Die Linse muss feuern: verbotenen Token in eine Kopie injizieren.
        const tmp = path.join(require("os").tmpdir(), "altlasten-selftest.js");
        fs.writeFileSync(tmp, 'const x = 1;\nfunction tickPhoenixDeath() {}\n// Kommentar darf "glutwesen" sagen\n');
        const hits = scan([tmp]);
        fs.unlinkSync(tmp);
        const fired = hits.length === 1 && /tickPhoenixDeath/.test(hits[0]);
        console.log(fired ? "✅ SELBST-TEST: die Wand feuert (1 Injektion erkannt, Kommentar ignoriert)" : `❌ SELBST-TEST: ${JSON.stringify(hits)}`);
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
