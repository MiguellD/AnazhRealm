#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-coupling.cjs — DIE STRUKTUR-LINSE (Kohäsion · Kopplung · State-Bus)
//
// Gesetz #0 auf die STRUKTUR selbst: statt aus dem Bauch zu urteilen, ob die
// Zonen-Ordnung des Stamms „an den Gelenken carvt", MISST diese Linse sie —
// AST-präzise (acorn, dieselbe Basis wie cut-method.cjs):
//
//   1. ZONEN-KOHÄSION: pro Zone der Anteil interner vs. zonen-fremder
//      this.*-Aufrufe (Kohäsion = intra / (intra+cross)) + die Zone-zu-Zone-
//      Kopplungsmatrix (die stärksten Kanten = Kandidaten für Neu-Vermessung).
//   2. HUBS: Fan-In (die kanonischen Größen — viele Leser = gewollt, Raptor)
//      und Fan-Out (die Orchestratoren) pro Methode.
//   3. EIGENE REGEL: Methoden über der Stamm-Größengrenze (~200 Zeilen,
//      V9.44) + Entscheidungs-Dichte (zyklomatische Näherung).
//   4. STATE-BUS: welche state.*-Felder von MEHREREN Zonen GESCHRIEBEN
//      werden (Kopplung ohne Chokepoint) vs. dem gesunden Muster
//      „ein Schreiber, viele Leser".
//
// Reine Näherung wo nötig (st-Alias, Sub-Objekt-Mutation zählt als Read) —
// als TREND-Linse gedacht, nicht als Orakel. Ausgabe: lesbarer Bericht +
// artifacts/coupling-report.json (für diag-churn.cjs als Join-Quelle).
//
// NUTZUNG:  node scripts/diag-coupling.cjs [--json] [--top N]
// ─────────────────────────────────────────────────────────────────────────
const fs = require("fs");
const path = require("path");
const acorn = require("acorn");

const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "anazhRealm.js");
const args = process.argv.slice(2);
const TOP = args.indexOf("--top") >= 0 ? parseInt(args[args.indexOf("--top") + 1], 10) : 15;

const src = fs.readFileSync(FILE, "utf8");
const lines = src.split("\n");

// ── Zonen-Tabelle aus den ATLAS-§-Markern (dieselbe Wahrheit wie diag-atlas) ──
const zones = [];
for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\s*\/\/ ===== ATLAS §(\d+) · ([^—]+) — .+? =====\s*$/);
    if (m) zones.push({ id: m[1], name: m[2].trim(), startLine: i + 1 });
}
for (let i = 0; i < zones.length; i++)
    zones[i].endLine = i + 1 < zones.length ? zones[i + 1].startLine - 1 : lines.length;
const zoneOfLine = (ln) => {
    for (let i = zones.length - 1; i >= 0; i--) if (ln >= zones[i].startLine) return zones[i];
    return null;
};

// ── AST: alle Methoden der AnazhRealm-Klasse mit exakten Spannen ──────────
const ast = acorn.parse(src, { ecmaVersion: "latest", sourceType: "script", locations: true });
let classNode = null;
for (const node of ast.body) {
    if (node.type === "ClassDeclaration" && node.id && node.id.name === "AnazhRealm") classNode = node;
}
if (!classNode) {
    console.error("Klasse AnazhRealm nicht gefunden — Parse-Basis geändert?");
    process.exit(2);
}
const methods = [];
for (const m of classNode.body.body) {
    if (m.type !== "MethodDefinition" || !m.key || (m.key.type !== "Identifier" && m.key.type !== "Literal")) continue;
    const name = m.key.type === "Identifier" ? m.key.name : String(m.key.value);
    methods.push({
        name,
        startLine: m.loc.start.line,
        endLine: m.loc.end.line,
        len: m.loc.end.line - m.loc.start.line + 1,
        body: src.slice(m.start, m.end),
        zone: (zoneOfLine(m.loc.start.line) || { id: "?", name: "?" }).name,
        zoneId: (zoneOfLine(m.loc.start.line) || { id: "?" }).id,
    });
}
const methodSet = new Set(methods.map((m) => m.name));

// ── Pro Methode: Aufrufe, Komplexität, State-Zugriffe ─────────────────────
const CALL_RE = /this\.(_?[A-Za-z0-9_$]+)\b/g;
const DECISION_RE = /\bif\s*\(|\bfor\s*\(|\bwhile\s*\(|\bcase\s |&&|\|\||\bcatch\s*\(|\?[^.?]/g;
const stateFields = new Map(); // field → {readZones:Set, writeZones:Set, readers:Set, writers:Set}
const fanIn = new Map(); // methodName → Set(callerName)
const zoneEdges = new Map(); // "zoneA→zoneB" → count
const zoneStats = new Map(); // zoneName → {intra, cross, methods, lines}

for (const z of zones)
    zoneStats.set(z.name, { id: z.id, intra: 0, cross: 0, methods: 0, lines: z.endLine - z.startLine + 1 });

for (const m of methods) {
    const zs = zoneStats.get(m.zone);
    if (zs) zs.methods++;
    // Komplexität (zyklomatische Näherung: Entscheidungs-Punkte + 1)
    m.complexity = 1 + (m.body.match(DECISION_RE) || []).length;
    // Aufrufe/Referenzen auf bekannte Methoden
    m.fanOut = new Set();
    let c;
    CALL_RE.lastIndex = 0;
    while ((c = CALL_RE.exec(m.body))) {
        const callee = c[1];
        if (!methodSet.has(callee) || callee === m.name) continue;
        m.fanOut.add(callee);
        if (!fanIn.has(callee)) fanIn.set(callee, new Set());
        fanIn.get(callee).add(m.name);
    }
    // State-Zugriffe (this.state.X + st.X wenn st-Alias im Body)
    const hasStAlias = /\bst\s*=\s*this\.state\b/.test(m.body);
    const accessRe = hasStAlias
        ? /(?:this\.state|\bst)\.([A-Za-z_$][\w$]*)\s*(=(?!=)|\+=|-=|\*=|\/=|\|\|=|&&=|\?\?=)?/g
        : /this\.state\.([A-Za-z_$][\w$]*)\s*(=(?!=)|\+=|-=|\*=|\/=|\|\|=|&&=|\?\?=)?/g;
    let a;
    while ((a = accessRe.exec(m.body))) {
        const field = a[1];
        if (!stateFields.has(field))
            stateFields.set(field, {
                readZones: new Set(),
                writeZones: new Set(),
                readers: new Set(),
                writers: new Set(),
            });
        const rec = stateFields.get(field);
        if (a[2]) {
            rec.writeZones.add(m.zone);
            rec.writers.add(m.name);
        } else {
            rec.readZones.add(m.zone);
            rec.readers.add(m.name);
        }
    }
}

// Zonen-Kanten aus dem Call-Graph
const byName = new Map(methods.map((m) => [m.name, m]));
for (const m of methods) {
    const zs = zoneStats.get(m.zone);
    for (const callee of m.fanOut) {
        const t = byName.get(callee);
        if (!t) continue;
        if (t.zone === m.zone) {
            if (zs) zs.intra++;
        } else {
            if (zs) zs.cross++;
            const key = `§${m.zoneId} ${m.zone} → §${t.zoneId} ${t.zone}`;
            zoneEdges.set(key, (zoneEdges.get(key) || 0) + 1);
        }
    }
}

// ── Bericht ───────────────────────────────────────────────────────────────
const pct = (x) => (x * 100).toFixed(0) + "%";
console.log(
    `STRUKTUR-LINSE — anazhRealm.js (${lines.length} Zeilen, ${methods.length} Methoden, ${zones.length} Zonen)\n`
);

console.log("── ZONEN-KOHÄSION (intra / (intra+cross) der this.*-Referenzen) ──");
const zoneRows = [...zoneStats.entries()]
    .filter(([, s]) => s.methods > 0)
    .map(([name, s]) => ({ name, ...s, coh: s.intra + s.cross > 0 ? s.intra / (s.intra + s.cross) : 1 }))
    .sort((a, b) => a.coh - b.coh);
for (const z of zoneRows)
    console.log(
        `  §${z.id.padStart(2)} ${z.name.padEnd(28)} Kohäsion ${pct(z.coh).padStart(4)}  (intra ${String(z.intra).padStart(4)} · cross ${String(z.cross).padStart(4)} · ${String(z.methods).padStart(3)} M. · ${z.lines} Z.)`
    );

console.log(`\n── DIE ${TOP} STÄRKSTEN ZONEN-KANTEN (Kopplungs-Fluss) ──`);
for (const [k, v] of [...zoneEdges.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP))
    console.log(`  ${String(v).padStart(4)}×  ${k}`);

console.log(`\n── FAN-IN TOP ${TOP} (kanonische Größen — viele Leser = Raptor-Muster) ──`);
for (const [name, callers] of [...fanIn.entries()].sort((a, b) => b[1].size - a[1].size).slice(0, TOP)) {
    const m = byName.get(name);
    console.log(
        `  ${String(callers.size).padStart(4)} Leser  ${name}  (§${m ? m.zoneId : "?"}, ${m ? m.len : "?"} Z.)`
    );
}

console.log(`\n── FAN-OUT TOP ${TOP} (Orchestratoren) ──`);
for (const m of [...methods].sort((a, b) => b.fanOut.size - a.fanOut.size).slice(0, TOP))
    console.log(`  ${String(m.fanOut.size).padStart(4)} Callees  ${m.name}  (§${m.zoneId}, ${m.len} Z.)`);

const over200 = methods.filter((m) => m.len > 200).sort((a, b) => b.len - a.len);
console.log(`\n── EIGENE REGEL: Methoden über der 200-Zeilen-Grenze (V9.44): ${over200.length} ──`);
for (const m of over200.slice(0, TOP)) console.log(`  ${String(m.len).padStart(5)} Z.  ${m.name}  (§${m.zoneId})`);

console.log(`\n── KOMPLEXITÄT TOP ${TOP} (Entscheidungs-Punkte, zyklomatische Näherung) ──`);
for (const m of [...methods].sort((a, b) => b.complexity - a.complexity).slice(0, TOP))
    console.log(`  ${String(m.complexity).padStart(5)}  ${m.name}  (§${m.zoneId}, ${m.len} Z.)`);

const busFields = [...stateFields.entries()]
    .map(([f, r]) => ({ f, wz: r.writeZones.size, rz: r.readZones.size, w: r.writers.size, r: r.readers.size }))
    .filter((x) => x.wz >= 2)
    .sort((a, b) => b.wz - a.wz || b.w - a.w);
const oneWriter = [...stateFields.values()].filter((r) => r.writeZones.size === 1).length;
console.log(
    `\n── STATE-BUS: ${stateFields.size} Felder beobachtet · ${oneWriter} mit EINER Schreib-Zone (gesund) · ${busFields.length} von ≥2 Zonen geschrieben ──`
);
for (const x of busFields.slice(0, TOP))
    console.log(`  ${x.f.padEnd(32)} ${x.wz} Schreib-Zonen (${x.w} Methoden) · ${x.rz} Lese-Zonen (${x.r} Methoden)`);

// ── JSON-Artefakt (Join-Quelle für diag-churn.cjs) ────────────────────────
const outDir = path.join(ROOT, "artifacts");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
    path.join(outDir, "coupling-report.json"),
    JSON.stringify(
        {
            generated: new Date().toISOString(),
            totalLines: lines.length,
            methods: methods.map((m) => ({
                name: m.name,
                zone: m.zone,
                zoneId: m.zoneId,
                startLine: m.startLine,
                len: m.len,
                complexity: m.complexity,
                fanOut: m.fanOut.size,
                fanIn: (fanIn.get(m.name) || new Set()).size,
            })),
            zones: zoneRows,
            zoneEdges: [...zoneEdges.entries()].sort((a, b) => b[1] - a[1]),
            stateBus: busFields,
        },
        null,
        1
    )
);
console.log(`\nVoll-Detail → artifacts/coupling-report.json`);
