// diag-archetypbank.cjs — §7.3(a) (meister-plan): die ARCHETYPEN-BANK kalibrieren.
// ~50 synthetische Positiv- + GEGEN-Beispiele je Rolle gegen die ECHTE
// computeBlueprintRole-Pipeline — die Mess-Karte VOR dem Einfrieren als stehende
// Invariante (jeder Signatur-Edit läuft künftig gegen die Bank).
//   node scripts/diag-archetypbank.cjs        → Tabelle + Mismatches (exit 1)
//
// Ein Mismatch ist ENTWEDER eine echte Signatur-Fragilität (→ heilen/dokumentieren)
// ODER eine unehrliche Erwartung (→ Fall korrigieren). Die Bank dokumentiert die
// GEMESSENE Wahrheit mit ehrlichen Margen, kein Wunschdenken.

const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve("save-server.js");

function startSaveServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn("node", [SERVER_JS], { stdio: ["ignore", "pipe", "pipe"] });
        let ready = false;
        const to = setTimeout(() => !ready && reject(new Error("server timeout")), 5000);
        proc.stdout.on("data", (c) => {
            if (!ready && /läuft/.test(c.toString())) {
                ready = true;
                clearTimeout(to);
                resolve(proc);
            }
        });
        proc.on("error", reject);
    });
}

(async () => {
    const server = await startSaveServer();
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    page.on("pageerror", (e) => console.error("PAGE-ERROR:", e.message.split("\n")[0]));
    try {
        await page.goto("http://127.0.0.1:4312/index.html", { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const dl = performance.now() + 15000;
            while ((!window.anazhRealm || !window.anazhRealm.state) && performance.now() < dl)
                await new Promise((r) => setTimeout(r, 50));
        });
        const rows = await page.evaluate(() => {
            const r = window.anazhRealm;
            // Die BANK lebt in playtest.cjs als stehende Invariante — hier wird
            // sie GEBAUT + gemessen (dieselbe Tabelle, transplantiert).
            const P = (shape, material, x, y, z, sx, sy, sz, rot) => ({
                shape,
                material,
                position: { x, y, z },
                size: { x: sx, y: sy, z: sz },
                ...(rot ? { rotation: rot } : {}),
            });
            const RZ = { x: 0, y: 0, z: 1.5707963 };
            const wheelQuad = (mat) => [
                P("cylinder", mat, -0.72, 0.34, 0.8, 0.62, 0.14, 0.62, RZ),
                P("cylinder", mat, 0.72, 0.34, 0.8, 0.62, 0.14, 0.62, RZ),
                P("cylinder", mat, -0.72, 0.34, -0.8, 0.62, 0.14, 0.62, RZ),
                P("cylinder", mat, 0.72, 0.34, -0.8, 0.62, 0.14, 0.62, RZ),
            ];
            const wheelConns = [1, 2, 3, 4].map((i) => ({ type: "lashing", partA: 0, partB: i, auto: 1 }));
            const sitz = { type: "sitz", partA: 0, partB: -1 };
            const humanoid = (mat) => [
                P("box", mat, 0, 1.1, 0, 0.5, 0.7, 0.3),
                P("sphere", mat, 0, 1.7, 0, 0.3, 0.3, 0.3),
                P("box", mat, -0.15, 0.35, 0, 0.18, 0.7, 0.18),
                P("box", mat, 0.15, 0.35, 0, 0.18, 0.7, 0.18),
                P("box", mat, -0.4, 1.2, 0, 0.15, 0.6, 0.15),
                P("box", mat, 0.4, 1.2, 0, 0.15, 0.6, 0.15),
            ];
            // === DIE BANK: { n: Name, p: parts, c: connections, e: erwartet } ===
            // e = exakte Rolle; ne = verbotene Rolle (GEGEN-Beispiel, Rest frei).
            const BANK = [
                // --- FAHRZEUG (Sitz + Antrieb/Räder + Trag-Basis) ---
                {
                    n: "wagen holz+sitz",
                    p: [P("box", "holz", 0, 0.85, 0, 1.3, 0.35, 2.1), ...wheelQuad("holz")],
                    c: [...wheelConns, sitz],
                    e: "vehicle",
                },
                {
                    n: "karren eisen+sitz",
                    p: [P("box", "eisen", 0, 0.85, 0, 1.4, 0.3, 2.4), ...wheelQuad("eisen")],
                    c: [...wheelConns, sitz],
                    e: "vehicle",
                },
                {
                    n: "wagen breit holz",
                    p: [P("box", "holz", 0, 0.85, 0, 1.8, 0.4, 2.6), ...wheelQuad("holz")],
                    c: [...wheelConns, sitz],
                    e: "vehicle",
                },
                {
                    n: "GEGEN stein-stuhl (sitz ohne antrieb)",
                    p: [P("box", "stein", 0, 0.6, 0, 1, 0.2, 1), P("box", "stein", 0, 0.2, 0, 0.9, 0.6, 0.9)],
                    c: [sitz],
                    ne: "vehicle",
                },
                {
                    n: "GEGEN wagen ohne sitz ≠ trank",
                    p: [P("box", "holz", 0, 0.85, 0, 1.3, 0.35, 2.1), ...wheelQuad("holz")],
                    c: wheelConns,
                    ne: "consumable",
                },
                {
                    n: "GEGEN wagen ohne sitz ≠ seele",
                    p: [P("box", "holz", 0, 0.85, 0, 1.3, 0.35, 2.1), ...wheelQuad("holz")],
                    c: wheelConns,
                    ne: "soul",
                },
                // --- SEELE (lebendiger Körper: symmetrisch · vertikal · Glieder) ---
                { n: "fleisch-humanoid", p: humanoid("fleisch"), e: "soul" },
                { n: "GEGEN leder-humanoid (Puppe, lebendig≤0.3)", p: humanoid("leder"), ne: "soul" },
                {
                    n: "fleisch-humanoid groß",
                    p: humanoid("fleisch").map((q) => ({
                        ...q,
                        size: { x: q.size.x * 1.5, y: q.size.y * 1.5, z: q.size.z * 1.5 },
                    })),
                    e: "soul",
                },
                { n: "GEGEN eisen-humanoid (tot)", p: humanoid("eisen"), ne: "soul" },
                { n: "GEGEN stein-humanoid (tot)", p: humanoid("stein"), ne: "soul" },
                // --- TRANK/NAHRUNG (klein + lebendig, keine Trag-Basis) ---
                { n: "trank laub-kügelchen", p: [P("sphere", "laub", 0, 0.4, 0, 0.5, 0.6, 0.5)], e: "consumable" },
                { n: "frucht fleisch-kugel", p: [P("sphere", "fleisch", 0, 0.5, 0, 1, 1, 1)], e: "consumable" },
                { n: "kraut-bündel", p: [P("sphere", "kraut", 0, 0.3, 0, 0.4, 0.5, 0.4)], e: "consumable" },
                {
                    n: "trank zwei-teilig (laub+essenz)",
                    p: [
                        P("sphere", "laub", 0, 0.35, 0, 0.45, 0.55, 0.45),
                        P("sphere", "essenz", 0, 0.7, 0, 0.2, 0.2, 0.2),
                    ],
                    e: "consumable",
                },
                {
                    n: "GEGEN baum ≠ trank (bulk)",
                    p: [
                        P("cylinder", "holz", 0, 1.5, 0, 0.85, 3.2, 0.85),
                        P("sphere", "laub", 0, 4.7, 0, 2.9, 2.6, 2.9),
                    ],
                    ne: "consumable",
                },
                {
                    n: "GEGEN holz-kasten ≠ trank (spread)",
                    p: [P("box", "holz", 0, 0.5, 0, 2.2, 1, 2.2)],
                    ne: "consumable",
                },
                {
                    n: "GEGEN laub-teppich ≠ trank (spread)",
                    p: [P("box", "laub", 0, 0.1, 0, 3, 0.2, 3)],
                    ne: "consumable",
                },
                // --- BAUWERK (massiv · hart · standfest) ---
                {
                    n: "stein-turm",
                    p: [P("box", "stein", 0, 1, 0, 2, 2, 2), P("box", "stein", 0, 3, 0, 1.6, 2, 1.6)],
                    e: "architecture",
                },
                {
                    n: "holz-hütte",
                    p: [
                        P("box", "holz", 0, 0.15, 0, 4, 0.3, 4),
                        P("box", "holz", 0, 1.5, 1.9, 4, 3, 0.2),
                        P("box", "holz", 0, 1.5, -1.9, 4, 3, 0.2),
                    ],
                    e: "architecture",
                },
                { n: "eisen-säule", p: [P("cylinder", "eisen", 0, 2, 0, 0.8, 4, 0.8)], e: "architecture" },
                { n: "quarz-monument", p: [P("box", "quarz", 0, 1.2, 0, 1.8, 2.4, 1.8)], e: "architecture" },
                {
                    n: "baum-gestalt (stamm+krone)",
                    p: [
                        P("cylinder", "holz", 0, 1.5, 0, 0.85, 3.2, 0.85),
                        P("sphere", "laub", 0, 4.7, 0, 2.9, 2.6, 2.9),
                    ],
                    e: "architecture",
                },
                // --- TOR (magie-Ring in Reisenden-Größe) ---
                { n: "quarz-torus tor", p: [P("torus", "quarz", 0, 1.6, 0, 2.6, 2.6, 0.5)], e: "portal" },
                { n: "essenz-ring tor", p: [P("torus", "essenz", 0, 1.5, 0, 2.4, 2.4, 0.4)], e: "portal" },
                { n: "GEGEN mini-ring ≠ tor", p: [P("torus", "quarz", 0, 0.3, 0, 0.5, 0.5, 0.15)], ne: "portal" },
                {
                    n: "GEGEN stein-ring ≠ tor (keine magie)",
                    p: [P("torus", "stein", 0, 1.6, 0, 2.6, 2.6, 0.5)],
                    ne: "portal",
                },
                // --- GERÄT/KLINGE (greifbar spitz+gestreckt → implement-Familie) ---
                {
                    n: "eisen-klinge (weapon-familie)",
                    p: [
                        P("cone", "eisen", 0, 1.0, 0, 0.12, 1.2, 0.12),
                        P("cylinder", "eisen", 0, 0.2, 0, 0.08, 0.5, 0.08),
                    ],
                    eIn: ["weapon", "held", "tool", "brecher"],
                },
                {
                    n: "pickel holz-stiel (tool-familie)",
                    p: [
                        P("cone", "stein", 0, 0.95, 0, 0.18, 0.5, 0.18),
                        P("cylinder", "holz", 0, 0.35, 0, 0.07, 0.8, 0.07),
                    ],
                    eIn: ["tool", "held", "weapon", "brecher"],
                },
                { n: "GEGEN eisen-klotz ≠ waffe", p: [P("box", "eisen", 0, 0.4, 0, 0.8, 0.8, 0.8)], ne: "weapon" },
                {
                    n: "GEGEN stein-spitzen-cluster ≠ waffe (kompakt)",
                    p: [
                        P("cone", "stein", 0, 0.5, 0, 0.6, 0.7, 0.6),
                        P("cone", "stein", 0.3, 0.45, 0.2, 0.5, 0.6, 0.5),
                    ],
                    ne: "weapon",
                },
                // --- STABILITÄT der Built-ins (die lebende Welt-Saat) ---
                { n: "builtin fahrzeug_wagen", b: "fahrzeug_wagen", e: "vehicle" },
                { n: "builtin reittier_holzross", b: "reittier_holzross", e: "vehicle" },
                { n: "builtin baum_eiche", b: "baum_eiche", e: "architecture" },
                { n: "builtin baum_kiefer", b: "baum_kiefer", e: "architecture" },
                { n: "builtin trank_lebenssaft", b: "trank_lebenssaft", e: "consumable" },
                { n: "builtin avatar_waechter", b: "avatar_waechter", e: "soul" },
                { n: "builtin ruestung_brustpanzer", b: "ruestung_brustpanzer", eIn: ["armor", "architecture"] },
                { n: "builtin stein_block", b: "stein_block", e: "architecture" },
                { n: "builtin kristall_geode", b: "kristall_geode", eIn: ["architecture", "portal"] },
                // --- GRÖSSEN-/MATERIAL-VARIANZ (Margen-Proben) ---
                { n: "trank variant 0.7×", p: [P("sphere", "laub", 0, 0.3, 0, 0.35, 0.42, 0.35)], e: "consumable" },
                { n: "turm variant schmal", p: [P("box", "stein", 0, 2, 0, 1, 4, 1)], e: "architecture" },
                { n: "humanoid variant knochen", p: humanoid("knochen"), ne: "consumable" },
                {
                    n: "wagen variant 3 räder",
                    p: [P("box", "holz", 0, 0.85, 0, 1.3, 0.35, 2.1), ...wheelQuad("holz").slice(0, 3)],
                    c: [...wheelConns.slice(0, 3), sitz],
                    e: "vehicle",
                },
                { n: "GEGEN leerer ein-block", p: [P("box", "stein", 0, 0.5, 0, 1, 1, 1)], ne: "vehicle" },
                { n: "GEGEN glut-brocken ≠ seele", p: [P("sphere", "glut", 0, 0.5, 0, 1.2, 1.2, 1.2)], ne: "soul" },
                // === Λ.1 (V18.173 — DIE REGEL HEILEN, livingCenterY) ===
                // Reiche, symmetrische Bäume sollen architecture bleiben, weil
                // ihre laub-Krone OBEN sitzt (yNorm > 0.7). Nur lebende Körper
                // mit mittig verteiltem fleisch sollen soul werden (yNorm ∈ 0.3..0.7).
                {
                    n: "Λ.1: eiche reich symmetrisch (laub oben → architecture)",
                    p: [
                        P("cylinder", "holz", 0, 1.5, 0, 0.85, 3.2, 0.85),
                        P("cylinder", "holz", -1.2, 4.0, 0, 0.3, 1.5, 0.3),
                        P("cylinder", "holz", 1.2, 4.0, 0, 0.3, 1.5, 0.3),
                        P("sphere", "laub", 0, 4.7, 0, 2.9, 2.6, 2.9),
                        P("sphere", "laub", -1.5, 4.7, 0, 1.5, 1.4, 1.5),
                        P("sphere", "laub", 1.5, 4.7, 0, 1.5, 1.4, 1.5),
                    ],
                    e: "architecture",
                },
                {
                    n: "Λ.1: eiche 4-Äste symmetrisch (laub oben → architecture)",
                    p: [
                        P("cylinder", "holz", 0, 1.5, 0, 0.85, 3.2, 0.85),
                        P("cylinder", "holz", -1.0, 4.0, 0, 0.25, 1.5, 0.25),
                        P("cylinder", "holz", 1.0, 4.0, 0, 0.25, 1.5, 0.25),
                        P("cylinder", "holz", 0, 4.0, -1.0, 0.25, 1.5, 0.25),
                        P("cylinder", "holz", 0, 4.0, 1.0, 0.25, 1.5, 0.25),
                        P("sphere", "laub", 0, 5.5, 0, 3.0, 2.6, 3.0),
                    ],
                    e: "architecture",
                },
                {
                    n: "Λ.1: pilz-form 2-Parts (zu wenige Parts → kein body, klein+lebendig → consumable)",
                    p: [
                        P("cylinder", "holz", 0, 0.4, 0, 0.3, 0.8, 0.3),
                        P("sphere", "laub", 0, 1.2, 0, 1.4, 0.6, 1.4),
                    ],
                    ne: "soul", // 2 Parts < minParts → kein body; consumable per Resonanz ist ok (klein+lebendig)
                },
                {
                    n: "Λ.1: holzross 4-bein (holz lebendig=0.7 → soul-form möglich; nur Sitz fehlt für vehicle)",
                    p: [
                        P("box", "holz", 0, 1.0, 0, 0.6, 0.4, 1.4),
                        P("box", "holz", 0, 1.4, -0.6, 0.4, 0.4, 0.4),
                        P("cylinder", "holz", -0.4, 0.5, -0.5, 0.12, 0.8, 0.12),
                        P("cylinder", "holz", 0.4, 0.5, -0.5, 0.12, 0.8, 0.12),
                        P("cylinder", "holz", -0.4, 0.5, 0.5, 0.12, 0.8, 0.12),
                        P("cylinder", "holz", 0.4, 0.5, 0.5, 0.12, 0.8, 0.12),
                    ],
                    e: "soul", // Λ.1: holz hat lebendig 0.7, livingMass > 0.02, yNorm mittig → body ✓
                },
                {
                    n: "Λ.1: tanne (laub-Kegel oben → architecture, nicht soul)",
                    p: [
                        P("cylinder", "holz", 0, 1.8, 0, 0.55, 3.6, 0.55),
                        P("cone", "laub", 0, 4.2, 0, 2.8, 2.8, 2.8),
                        P("cone", "laub", 0, 5.7, 0, 2.2, 2.6, 2.2),
                        P("cone", "laub", 0, 7.2, 0, 1.6, 2.4, 1.6),
                    ],
                    e: "architecture",
                },
                {
                    n: "Λ.1: humanoid mit fleisch verteilt → soul",
                    p: humanoid("fleisch"),
                    e: "soul",
                },
                {
                    n: "Λ.1: drache aufrecht fleisch → soul (verticalMin ≥ 0.45)",
                    p: [
                        P("box", "fleisch", 0, 1.2, 0, 1.0, 1.4, 0.8),
                        P("box", "fleisch", 0, 2.0, 0.6, 0.4, 0.4, 0.6),
                        P("cylinder", "fleisch", -0.5, 0.4, 0, 0.18, 0.8, 0.18),
                        P("cylinder", "fleisch", 0.5, 0.4, 0, 0.18, 0.8, 0.18),
                        P("cylinder", "fleisch", -0.6, 1.2, 0, 0.16, 0.8, 0.16),
                        P("cylinder", "fleisch", 0.6, 1.2, 0, 0.16, 0.8, 0.16),
                    ],
                    e: "soul",
                },
                // === Λ.5 (V18.173 — Mischwald-Saat: die 4 neuen Built-ins) ===
                { n: "builtin baum_birke", b: "baum_birke", e: "architecture" },
                { n: "builtin baum_erle", b: "baum_erle", e: "architecture" },
                { n: "builtin baum_buche", b: "baum_buche", e: "architecture" },
                { n: "builtin baum_tanne", b: "baum_tanne", e: "architecture" },
            ];
            const out = [];
            for (const tc of BANK) {
                const bp = tc.b
                    ? r.state.blueprints[tc.b]
                    : { name: "_bank", parts: tc.p, ...(tc.c ? { connections: tc.c } : {}) };
                if (!bp) {
                    out.push({ n: tc.n, got: "(builtin fehlt)", ok: false });
                    continue;
                }
                const got = r.computeBlueprintRole(bp);
                let ok;
                if (tc.e) ok = got === tc.e;
                else if (tc.eIn) ok = tc.eIn.includes(got);
                else ok = got !== tc.ne;
                out.push({ n: tc.n, want: tc.e || (tc.eIn && tc.eIn.join("|")) || `≠${tc.ne}`, got, ok });
            }
            return out;
        });
        let fails = 0;
        for (const row of rows) {
            if (!row.ok) fails++;
            console.log(`${row.ok ? " ok " : "FAIL"}  ${row.n}  → ${row.got}  (soll ${row.want})`);
        }
        console.log(`\n${rows.length} Fälle, ${fails} Mismatches`);
        process.exit(fails === 0 ? 0 : 1);
    } catch (e) {
        console.error("Harness:", e.message);
        process.exit(1);
    } finally {
        await browser.close();
        server.kill();
    }
})();
