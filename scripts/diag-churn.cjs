#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-churn.cjs — DIE VERHALTENS-LINSE (Churn · Hotspots · Co-Wandel)
//
// Behavioral Code Analysis (Tornhill, „Your Code as a Crime Scene"): nicht
// der Code allein, sondern seine GESCHICHTE zeigt, wo das Risiko wohnt —
// Hotspot = Änderungs-Frequenz × Komplexität. Diese Linse liest die volle
// git-Historie von anazhRealm.js METHODEN-genau (via diff-xfuncname auf die
// 4-Spaces-Methodendefinition — kein Repo-Eingriff, reine -c-Konfiguration):
//
//   1. HOTSPOTS: die meist-geänderten Methoden (Commits + Zeilen-Churn),
//      gejoint mit der aktuellen Länge/Komplexität aus coupling-report.json
//      (→ vorher `node scripts/diag-coupling.cjs` laufen lassen).
//   2. JUNGE ENERGIE: dieselben Ränge nur für die letzten 90 Tage —
//      wo fließt die Arbeit JETZT.
//   3. ZONEN-CHURN + CO-WANDEL: welche Zonen ändern sich, welche Zonen-
//      Paare ändern sich IMMER ZUSAMMEN (temporale Kopplung = die
//      unsichtbare Abhängigkeit, die kein Call-Graph zeigt).
//   4. †-SEDIMENT: viel-geänderte Methoden, die es nicht mehr gibt
//      (Firefight-Verschleiß oder gesunde Ablösung — Fall für Fall).
//
// Näherung: die Hunk-Kontext-Zeile ist die umschließende Methoden-Def;
// Änderungen an Statics/§26 landen im Eimer „(außerhalb von Methoden)".
// Kommits mit >40 berührten Methoden zählen nicht in die Paar-Statistik
// (Massen-Refactors sind Rausch-Quellen — Standard-Praxis).
//
// NUTZUNG:  node scripts/diag-churn.cjs [--top N] [--days N] [--max-commits N]
// ─────────────────────────────────────────────────────────────────────────
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");
const readline = require("readline");

const ROOT = path.resolve(__dirname, "..");
const args = process.argv.slice(2);
const TOP = args.indexOf("--top") >= 0 ? parseInt(args[args.indexOf("--top") + 1], 10) : 20;
const DAYS = args.indexOf("--days") >= 0 ? parseInt(args[args.indexOf("--days") + 1], 10) : 30;
const MAXC = args.indexOf("--max-commits") >= 0 ? parseInt(args[args.indexOf("--max-commits") + 1], 10) : 0;

// xfuncname über eine temporäre attributesFile — der Repo bleibt unberührt.
const attrs = path.join(os.tmpdir(), `anazh-attrs-${process.pid}`);
fs.writeFileSync(attrs, "anazhRealm.js diff=anazh\n");
const gitArgs = [
    "-c",
    `core.attributesFile=${attrs}`,
    // Zwei Anker-Klassen: die 4-Spaces-Methoden-Def UND jede Spalte-0-Zeile
    // (AnazhRealm.X-Statics, class, Kommentar-Marker) — sonst erbt der letzte
    // Methoden-Body der Klasse allen §26-Statics-Churn (die updateGrowth-Falle).
    // Git zeigt als Hunk-Kontext den MATCH des Musters — der Statics-Anker muss
    // darum den vollen `AnazhRealm.NAME` greifen, nicht nur ein Zeichen.
    "-c",
    "diff.anazh.xfuncname=^    (async )?[a-zA-Z_$][a-zA-Z0-9_$]*\\(|^[A-Za-z_$][A-Za-z0-9_$.]*",
    "log",
    "--no-color",
    "--date=short",
    "--format=@@@C %H %ad %s",
    "-p",
    "-U0",
];
if (MAXC > 0) gitArgs.push("-n", String(MAXC));
gitArgs.push("--", "anazhRealm.js");

// Aktueller Stamm als Join-Ziel (Zone/Länge/Komplexität pro Methode).
let current = new Map();
const couplingPath = path.join(ROOT, "artifacts", "coupling-report.json");
if (fs.existsSync(couplingPath)) {
    const cr = JSON.parse(fs.readFileSync(couplingPath, "utf8"));
    for (const m of cr.methods) current.set(m.name, m);
} else {
    console.error(
        "Hinweis: artifacts/coupling-report.json fehlt — erst diag-coupling.cjs laufen lassen (Join ohne Zone/Komplexität)."
    );
}

const methodStats = new Map(); // name → {commits:Set, adds, dels, recent:Set}
const zoneCommits = new Map(); // zone → Set(sha)
const zonePairs = new Map(); // "a ⇄ b" → count
const methodPairs = new Map(); // "a ⇄ b" → count
let commitCount = 0;
let newestDate = null;

const git = spawn("git", gitArgs, { cwd: ROOT });
const rl = readline.createInterface({ input: git.stdout, crlfDelay: Infinity });

let cur = null; // {sha, date, methods:Set}
const HUNK_RE = /^@@ -\d+(?:,(\d+))? \+\d+(?:,(\d+))? @@ ?(.*)$/;
const CTX_RE = /^\s*(?:async\s+)?([A-Za-z_$][\w$]*)\(/;

// Ein Hunk wird erst NACH Sichtung seiner ±-Zeilen attribuiert: ändern sich NUR
// Spalte-0-Zeilen (Statics/§26/VERSION-Bump), gehört er NICHT zur Kontext-Methode
// (git zeigt sonst die letzte Methoden-Def DARÜBER — die 356-„updateGrowth"-Falle).
let pending = null; // {name, adds, dels, sawIndented}
const finalizeHunk = () => {
    if (!pending || !cur) {
        pending = null;
        return;
    }
    // Statics zählen immer auf ihren AnazhRealm.X-Anker; eine Methode nur, wenn
    // mindestens eine EINGERÜCKTE Zeile geändert wurde (Spalte-0-Beweis dagegen).
    const name = pending.isStatic || pending.sawIndented ? pending.name : "(außerhalb von Methoden)";
    if (!methodStats.has(name)) methodStats.set(name, { commits: new Set(), adds: 0, dels: 0, recent: new Set() });
    const s = methodStats.get(name);
    s.commits.add(cur.sha);
    s.adds += pending.adds;
    s.dels += pending.dels;
    if (name !== "(außerhalb von Methoden)" && !pending.isStatic) cur.methods.add(name);
    if (newestDate) {
        const ageDays = (new Date(newestDate) - new Date(cur.date)) / 86400000;
        if (ageDays <= DAYS) s.recent.add(cur.sha);
    }
    pending = null;
};
const flush = () => {
    if (!cur) return;
    commitCount++;
    const ms = [...cur.methods];
    const zs = new Set();
    for (const m of ms) {
        const c = current.get(m);
        if (c) zs.add(`§${c.zoneId} ${c.zone}`);
    }
    for (const z of zs) {
        if (!zoneCommits.has(z)) zoneCommits.set(z, new Set());
        zoneCommits.get(z).add(cur.sha);
    }
    const zl = [...zs].sort();
    for (let i = 0; i < zl.length; i++)
        for (let j = i + 1; j < zl.length; j++) {
            const k = `${zl[i]} ⇄ ${zl[j]}`;
            zonePairs.set(k, (zonePairs.get(k) || 0) + 1);
        }
    if (ms.length <= 40) {
        const ml = ms.sort();
        for (let i = 0; i < ml.length; i++)
            for (let j = i + 1; j < ml.length; j++) {
                const k = `${ml[i]} ⇄ ${ml[j]}`;
                methodPairs.set(k, (methodPairs.get(k) || 0) + 1);
            }
    }
};

rl.on("line", (line) => {
    if (line.startsWith("@@@C ")) {
        finalizeHunk();
        flush();
        const sp = line.slice(5).split(" ");
        cur = { sha: sp[0], date: sp[1], methods: new Set() };
        if (!newestDate) newestDate = sp[1];
        return;
    }
    if (!cur) return;
    const h = line.match(HUNK_RE);
    if (h) {
        finalizeHunk();
        const ctxLine = h[3] || "";
        let name = "(außerhalb von Methoden)";
        let isStatic = false;
        const mMeth = ctxLine.match(CTX_RE);
        const mStat = ctxLine.match(/^AnazhRealm\.([A-Za-z_$][\w$]*)/);
        if (mMeth && /^\s/.test(ctxLine)) name = mMeth[1];
        else if (mStat) {
            name = "AnazhRealm." + mStat[1];
            isStatic = true;
        }
        pending = {
            name,
            isStatic,
            dels: h[1] === undefined ? 1 : parseInt(h[1], 10),
            adds: h[2] === undefined ? 1 : parseInt(h[2], 10),
            sawIndented: false,
        };
        return;
    }
    // ±-Zeilen des laufenden Hunks: eine EINGERÜCKTE Änderung beweist Methoden-Inhalt.
    if (pending && (line[0] === "+" || line[0] === "-") && line[1] !== line[0]) {
        if (line.length > 1 && (line[1] === " " || line[1] === "\t")) pending.sawIndented = true;
    }
});

rl.on("close", () => {
    finalizeHunk();
    flush();
    try {
        fs.unlinkSync(attrs);
    } catch (_) {
        /* temp */
    }
    report();
});
git.on("error", (e) => {
    console.error("git-Fehler:", e.message);
    process.exit(2);
});

function report() {
    const statics = [...methodStats.entries()]
        .filter(([n]) => n.startsWith("AnazhRealm."))
        .map(([name, s]) => ({ name, touches: s.commits.size, churn: s.adds + s.dels, recent: s.recent.size }))
        .sort((a, b) => b.touches - a.touches);
    const rows = [...methodStats.entries()]
        .filter(([n]) => n !== "(außerhalb von Methoden)" && !n.startsWith("AnazhRealm."))
        .map(([name, s]) => {
            const c = current.get(name);
            return {
                name,
                touches: s.commits.size,
                churn: s.adds + s.dels,
                recent: s.recent.size,
                alive: !!c,
                zone: c ? `§${c.zoneId}` : "†",
                len: c ? c.len : 0,
                cx: c ? c.complexity : 0,
                hotspot: c ? s.commits.size * c.complexity : 0,
            };
        });
    const outside = methodStats.get("(außerhalb von Methoden)");
    console.log(
        `VERHALTENS-LINSE — anazhRealm.js: ${commitCount} Commits ausgewertet · ${rows.length} Methoden-Namen berührt · Fenster „jung" = ${DAYS} Tage (neuester Commit ${newestDate})\n`
    );

    console.log(`── HOTSPOTS TOP ${TOP} (Commits × aktuelle Komplexität — das Risiko wohnt hier) ──`);
    for (const r of rows
        .filter((r) => r.alive)
        .sort((a, b) => b.hotspot - a.hotspot)
        .slice(0, TOP))
        console.log(
            `  ${String(r.hotspot).padStart(6)}  ${r.name.padEnd(34)} ${String(r.touches).padStart(3)} Commits · ${String(r.churn).padStart(5)} Z. Churn · cx ${String(r.cx).padStart(3)} · ${String(r.len).padStart(4)} Z. · ${r.zone}`
        );

    console.log(`\n── MEIST-GEÄNDERT TOP ${TOP} (alle Zeiten) ──`);
    for (const r of [...rows].sort((a, b) => b.touches - a.touches).slice(0, TOP))
        console.log(
            `  ${String(r.touches).padStart(4)} Commits  ${r.name.padEnd(34)} ${String(r.churn).padStart(6)} Z. Churn  ${r.alive ? r.zone : "†gelöscht/umbenannt"}`
        );

    console.log(`\n── JUNGE ENERGIE TOP ${TOP} (Commits der letzten ${DAYS} Tage) ──`);
    for (const r of rows
        .filter((r) => r.recent > 0)
        .sort((a, b) => b.recent - a.recent)
        .slice(0, TOP))
        console.log(`  ${String(r.recent).padStart(4)} Commits  ${r.name.padEnd(34)} ${r.alive ? r.zone : "†"}`);

    console.log(`\n── ZONEN-CHURN (Commits, die die Zone berührten) ──`);
    for (const [z, s] of [...zoneCommits.entries()].sort((a, b) => b[1].size - a[1].size))
        console.log(`  ${String(s.size).padStart(4)} Commits  ${z}`);

    console.log(`\n── CO-WANDEL TOP ${TOP} (Zonen-Paare, die im selben Commit ändern — temporale Kopplung) ──`);
    for (const [k, v] of [...zonePairs.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP))
        console.log(`  ${String(v).padStart(4)}×  ${k}`);

    console.log(`\n── CO-WANDEL TOP ${TOP} (Methoden-Paare, ≥8 gemeinsame Commits) ──`);
    for (const [k, v] of [...methodPairs.entries()]
        .filter(([, v]) => v >= 8)
        .sort((a, b) => b[1] - a[1])
        .slice(0, TOP))
        console.log(`  ${String(v).padStart(4)}×  ${k}`);

    console.log(`\n── STATICS-CHURN TOP 10 (AnazhRealm.X — die meist-justierten Konstanten/Tabellen) ──`);
    for (const s of statics.slice(0, 10))
        console.log(
            `  ${String(s.touches).padStart(4)} Commits  ${s.name.padEnd(40)} ${String(s.churn).padStart(5)} Z. · ${s.recent} jung`
        );

    const dead = rows.filter((r) => !r.alive).sort((a, b) => b.touches - a.touches);
    console.log(`\n── †-SEDIMENT TOP ${TOP} (viel geändert, existiert nicht mehr — ${dead.length} Namen gesamt) ──`);
    for (const r of dead.slice(0, TOP)) console.log(`  ${String(r.touches).padStart(4)} Commits  ${r.name}`);
    if (outside)
        console.log(
            `\n(außerhalb von Methoden — Statics/§26/Konstruktor-Kopf: ${outside.commits.size} Commits, ${outside.adds + outside.dels} Z. Churn)`
        );

    const outDir = path.join(ROOT, "artifacts");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
        path.join(outDir, "churn-report.json"),
        JSON.stringify(
            {
                generated: new Date().toISOString(),
                commits: commitCount,
                windowDays: DAYS,
                newestDate,
                methods: rows.sort((a, b) => b.touches - a.touches),
                zoneCommits: [...zoneCommits.entries()].map(([z, s]) => [z, s.size]).sort((a, b) => b[1] - a[1]),
                zonePairs: [...zonePairs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 100),
                methodPairs: [...methodPairs.entries()]
                    .filter(([, v]) => v >= 5)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 200),
            },
            null,
            1
        )
    );
    console.log(`\nVoll-Detail → artifacts/churn-report.json`);
}
