// diag-blass.cjs — MISST, was der Spieler im Werkstatt-Readout WIRKLICH sieht: die Rolle (displayRole),
// die "Werte"-Zeile (_blueprintAbilityStats), die Eignung (roleFit), das Rollen-Spektrum. Beweist/widerlegt
// die "blass"-Hypothese: sind die Werte über verschiedene Werke DISTINKT, oder komprimiert/saturiert?
//
//   node scripts/diag-blass.cjs <pfad/zu/save-server.js>

const { spawn } = require("child_process");
const path = require("path");
const puppeteer = require("puppeteer");

const SERVER_JS = path.resolve(process.argv[2] || "save-server.js");
const SERVER_URL = "http://127.0.0.1:4312/index.html";

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
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--enable-webgl",
            "--ignore-gpu-blocklist",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--autoplay-policy=no-user-gesture-required",
        ],
    });
    const page = await browser.newPage();
    try {
        await page.goto(SERVER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
        await page.evaluate(async () => {
            const deadline = performance.now() + 8000;
            while (
                (!window.anazhRealm || !window.anazhRealm.state || !window.anazhRealm.state.blueprints) &&
                performance.now() < deadline
            )
                await new Promise((r) => setTimeout(r, 50));
        });
        const dump = await page.evaluate(() => {
            const r = window.anazhRealm;
            const round = (x) => Math.round((x || 0) * 1000) / 1000;

            const measure = (bp, label) => {
                if (!bp) return { label, MISSING: true };
                const ab = r._blueprintAbilityStats(bp);
                const spec = r._blueprintRoleSpectrum(bp).slice(0, 5).map((s) => `${s.role} ${round(s.score)}`);
                const tags = r.computeCompoundTags(bp) || {};
                return {
                    label,
                    rawRole: bp.role || "(leer)",
                    displayRole: r._displayRole(bp),
                    emergentRole: r.computeBlueprintRole(bp),
                    quality: round(r.computeBlueprintQuality(bp)),
                    werte: ab && ab.stats ? ab.stats.map(([n, v]) => `${n} ${round(v)}`) : "(keine)",
                    eignung_mul: ab ? round(ab.mul) : null,
                    eignung_fit: ab ? round(ab.fit) : null,
                    spektrum_top5: spec,
                    tags: {
                        härte: round(tags.härte),
                        dichte: round(tags.dichte),
                        lebendig: round(tags.lebendig),
                        zähigkeit: round(tags.zähigkeit),
                    },
                };
            };

            const mk = (parts, role) => ({ name: "_syn", parts, role });
            const box = (mat, s, pos) => ({ shape: "box", material: mat, size: s, position: pos || { x: 0, y: 0, z: 0 } });
            const cone = (mat, s, pos) => ({ shape: "cone", material: mat, size: s, position: pos || { x: 0, y: 0, z: 0 } });

            const out = [];
            // (1) Die Bibliothek (was der Spieler craftet)
            for (const n of ["geraet_spitzhacke", "geraet_schwert", "ruestung_brustpanzer", "trank_lebenssaft", "avatar_waechter"]) {
                out.push(measure(r.state.blueprints[n], n));
            }

            // (2) DIE SCHLÜSSEL-FRAGE: macht das MATERIAL einen sichtbaren Unterschied?
            //     Gleiche Klingen-FORM, verschiedene Materie.
            const bladeShape = (mat) => [
                box(mat, { x: 0.2, y: 0.1, z: 1.4 }),
                cone(mat, { x: 0.2, y: 0.1, z: 0.6 }, { x: 0, y: 0, z: 1.0 }),
            ];
            out.push(measure(mk(bladeShape("holz")), "KLINGE holz (weich)"));
            out.push(measure(mk(bladeShape("stein")), "KLINGE stein"));
            out.push(measure(mk(bladeShape("eisen")), "KLINGE eisen (hart)"));

            // (3) Macht die FORM einen sichtbaren Unterschied? Gleiche Materie (eisen), verschiedene Form.
            out.push(measure(mk([box("eisen", { x: 1.2, y: 1.2, z: 1.2 })]), "KLOTZ eisen (stumpf)"));

            // (4) Macht die GRÖSSE einen Unterschied? (Schöpfer-Befund: "größer = stärker"?)
            out.push(measure(mk(bladeShape("eisen").map((p) => ({ ...p, size: { x: p.size.x * 3, y: p.size.y * 3, z: p.size.z * 3 } }))), "KLINGE eisen 3× GRÖSSER"));

            return out;
        });
        console.log("=== Was der Spieler im Readout SIEHT (Rolle · Werte · Eignung · Spektrum) ===\n");
        for (const m of dump) {
            if (m.MISSING) {
                console.log(`✗ ${m.label}: FEHLT`);
                continue;
            }
            console.log(`● ${m.label}`);
            console.log(`    Rolle:    roh="${m.rawRole}"  display="${m.displayRole}"  emergent="${m.emergentRole}"`);
            console.log(`    Werte:    ${Array.isArray(m.werte) ? m.werte.join("  ·  ") : m.werte}`);
            console.log(`    Eignung:  ${m.eignung_fit}×   (mul ${m.eignung_mul}, quality ${m.quality})`);
            console.log(`    Spektrum: ${m.spektrum_top5.join("  ·  ")}`);
            console.log(`    Tags:     härte ${m.tags.härte}  dichte ${m.tags.dichte}  lebendig ${m.tags.lebendig}  zäh ${m.tags.zähigkeit}`);
            console.log("");
        }
    } finally {
        await browser.close();
        server.kill();
    }
})().catch((e) => {
    console.error("FEHLER:", e);
    process.exit(1);
});
