// diag-band-belegung.cjs — Ψ0 (meister-plan §8.8a): das ORTHOGONALITÄTS-MESSGERÄT.
// Misst die paarweisen KOSINUS-WINKEL aller Signaturen über alle sechs Tabellen —
// zu enge Winkel = vorhersagbares Übersprechen (Eiche=Trank und Holzross=Seele
// WAREN genau das, VOR ihrem Browser-Schock messbar). Die Archetypen-Bank fängt
// FÄLLE (empirisch), Ψ0 fängt WINKEL (geometrisch, präventiv).
//   node scripts/diag-band-belegung.cjs        → Matrix + engste Paare je Tabelle
//
// Die kalibrierten Maxima wandern als FROZEN Baseline in checkBandPsi0Winkel
// (playtest): kein Paar darf je enger werden als die heute akzeptierte Nähe
// (die bewussten Geschwister — held/weapon/tool — DEFINIEREN die Baseline).

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
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
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
        const res = await page.evaluate(() => {
            const A = window.anazhRealm.constructor;
            const TABLES = {
                ROLE_SIGNATURES: A.ROLE_SIGNATURES,
                FORM_ROLE_SIGNATURES: A.FORM_ROLE_SIGNATURES,
                MOTION_ROLE_SIGNATURES: A.MOTION_ROLE_SIGNATURES,
                WORKSHOP_DOMAIN_SIGNATURES: A.WORKSHOP_DOMAIN_SIGNATURES,
                OP_CLASS_SIGNATURES: A.OP_CLASS_SIGNATURES,
                TEMPERAMENT_SIGNATURES: A.TEMPERAMENT_SIGNATURES,
            };
            const cos = (a, b) => {
                const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
                let dot = 0;
                let na = 0;
                let nb = 0;
                for (const k of keys) {
                    const va = Number(a[k]) || 0;
                    const vb = Number(b[k]) || 0;
                    dot += va * vb;
                    na += va * va;
                    nb += vb * vb;
                }
                if (na === 0 || nb === 0) return 0;
                return dot / Math.sqrt(na * nb);
            };
            const out = {};
            for (const tname of Object.keys(TABLES)) {
                const t = TABLES[tname];
                if (!t) {
                    out[tname] = { fehlt: true };
                    continue;
                }
                const names = Object.keys(t).filter((k) => t[k] && typeof t[k] === "object");
                const pairs = [];
                for (let i = 0; i < names.length; i++) {
                    for (let j = i + 1; j < names.length; j++) {
                        // Signaturen können Meta-Felder tragen — nur numerische Achsen zählen.
                        const num = (sig) => {
                            const o = {};
                            for (const k of Object.keys(sig))
                                if (Number.isFinite(Number(sig[k]))) o[k] = Number(sig[k]);
                            return o;
                        };
                        pairs.push({
                            a: names[i],
                            b: names[j],
                            cos: Math.round(cos(num(t[names[i]]), num(t[names[j]])) * 1000) / 1000,
                        });
                    }
                }
                pairs.sort((p, q) => q.cos - p.cos);
                out[tname] = {
                    n: names.length,
                    max: pairs.length ? pairs[0].cos : 0,
                    top: pairs.slice(0, 5),
                    warn: pairs.filter((p) => p.cos > 0.85).length,
                };
            }
            return out;
        });
        let worst = 0;
        for (const [tname, t] of Object.entries(res)) {
            if (t.fehlt) {
                console.log(`${tname}: FEHLT`);
                continue;
            }
            console.log(`\n${tname} (${t.n} Signaturen) — max cos = ${t.max} · >0.85: ${t.warn}`);
            for (const p of t.top) console.log(`   ${p.cos.toFixed(3)}  ${p.a} ↔ ${p.b}`);
            if (t.max > worst) worst = t.max;
        }
        console.log(`\nWELT-MAX über alle Tabellen: ${worst}`);
        console.log("(Die Maxima je Tabelle sind die FROZEN-Baseline für checkBandPsi0Winkel.)");
        process.exit(0);
    } catch (e) {
        console.error("Harness:", e.message);
        process.exit(1);
    } finally {
        await browser.close();
        server.kill();
    }
})();
