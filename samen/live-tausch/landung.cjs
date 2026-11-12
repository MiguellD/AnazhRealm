// landung.cjs — WEGWERF: wie viel trifft eine Landung, wenn man je DATEI urteilt, und wie viel, wenn man je GLIED (Methode der
// EINEN Klasse) den Hash seines Texts trüge? Die letzten Merges (erste Eltern-Linie), je Merge der Stamm vorher ↔ nachher.
//   node samen/live-tausch/landung.cjs [n=10]
const { execFileSync } = require("child_process");
const crypto = require("crypto");
const path = require("path");
const ROOT = path.resolve(__dirname, "../..");
const acorn = require(path.join(ROOT, "node_modules/acorn"));
const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 28 });
const sha = (t) => crypto.createHash("sha256").update(t).digest("hex").slice(0, 16);
// jedes äußerste Glied jeder Klasse einer Stamm-Datei und jede Außen-Konstante (Zuweisung `AnazhRealm.X = …`): Name → Hash
function glieder(text) {
    const out = new Map();
    let baum;
    try {
        baum = acorn.parse(text, { ecmaVersion: "latest", sourceType: "script" });
    } catch {
        return null;
    }
    for (const n of baum.body) {
        if (n.type === "ClassDeclaration")
            for (const m of n.body.body) {
                const k = m.key && (m.key.name || m.key.value);
                out.set((m.static ? "static " : "") + (m.kind === "get" || m.kind === "set" ? m.kind + " " : "") + k, sha(text.slice(m.start, m.end)));
            }
        else out.set("@" + sha(text.slice(n.start, Math.min(n.end, n.start + 60))), sha(text.slice(n.start, n.end)));
    }
    return out;
}
const t0 = Date.now();
const n = +process.argv[2] || 10;
const merges = git("log", "--first-parent", "--merges", "-" + n, "--format=%H %s").trim().split("\n");
const dateien = git("ls-tree", "--name-only", "HEAD", "stamm/").trim().split("\n").filter((f) => f.endsWith(".js"));
let alleGlieder = 0, hashMs = 0;
for (const f of dateien) {
    const t = git("show", "HEAD:" + f);
    const h0 = process.hrtime.bigint();
    alleGlieder += glieder(t).size;
    hashMs += Number(process.hrtime.bigint() - h0) / 1e6;
}
console.log(`Stamm am Kopf: ${dateien.length} Dateien, ${alleGlieder} Glieder (Methoden + Außen-Anweisungen); AST + Hash aller Glieder ${hashMs.toFixed(0)} ms`);
const zeilen = [];
for (const z of merges) {
    const [m, ...rest] = z.split(" ");
    const name = rest.join(" ").replace(/^Merge /, "").replace(/ in integ-probe$/, "");
    const geaendert = git("diff", "--name-only", m + "^1", m).trim().split("\n").filter(Boolean);
    const stamm = geaendert.filter((f) => /^stamm\/.*\.js$/.test(f));
    const kerne = geaendert.filter((f) => /^[a-z-]+-core\.js$|^foundry-bruecke\.js$|^welt-licht\.js$|^voxel-worker\.js$/.test(f));
    let gl = 0, zeilenDatei = 0, zeilenGlied = 0;
    for (const f of stamm) {
        let a = "", b = "";
        try { a = git("show", m + "^1:" + f); } catch {}
        try { b = git("show", m + ":" + f); } catch {}
        const [A, B] = [glieder(a) || new Map(), glieder(b) || new Map()];
        zeilenDatei += b.split("\n").length;
        for (const [k, h] of B) if (A.get(k) !== h) gl++;
        for (const k of A.keys()) if (!B.has(k)) gl++;
    }
    zeilen.push({ name, stamm: stamm.length, glieder: gl, kerne: kerne.length, kernNamen: kerne.join(",") });
    console.log(`${name.padEnd(28)} Stamm-Dateien ${String(stamm.length).padStart(2)} von ${dateien.length} (${((100 * stamm.length) / dateien.length).toFixed(0)} %) · Glieder ${String(gl).padStart(3)} von ${alleGlieder} (${((100 * gl) / alleGlieder).toFixed(1)} %) · Kern-Dateien ${kerne.length}${kerne.length ? " (" + kerne.join(", ") + ")" : ""}`);
}
const S = (k) => zeilen.reduce((a, z) => a + z[k], 0);
console.log(`Summe über ${zeilen.length} Landungen: im Mittel ${(S("stamm") / zeilen.length).toFixed(1)} Stamm-Dateien (${((100 * S("stamm")) / zeilen.length / dateien.length).toFixed(0)} %) gegen ${(S("glieder") / zeilen.length).toFixed(1)} Glieder (${((100 * S("glieder")) / zeilen.length / alleGlieder).toFixed(2)} %); ${zeilen.filter((z) => z.kerne).length} von ${zeilen.length} berühren einen Kern · ${Date.now() - t0} ms`);
