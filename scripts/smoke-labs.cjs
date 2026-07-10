// smoke-labs.cjs — Browser-Beweis der Schöpfer-Labor-Portale:
// worlds/garage/ (ANATOMIE · FAHRZEUG, 08.07.2026) + worlds/portale/
// (PORTA · ORDNUNGEN + FRAKTAL, 08.07.2026) + worlds/schmiede/
// (ANATOMIE · KLINGE, 10.07.2026 — W-A4c). Je Welt vier Prüfungen:
//   1. lädt fehlerfrei (0 pageerrors — die gate:page-error-Klasse)
//   2. rendert (canvas existiert)
//   3. die W12-Brücke meldet ready (world/label/dsl-Manifest)
//   4. ein DSL-Wort wirkt über den ECHTEN UI-Pfad (Preset-Button klickt,
//      active/on-Zustand wechselt — eine Quelle, kein Parallelpfad)
//   node scripts/smoke-labs.cjs
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.LABS_PORT || 4409);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
};

// Harness-Seite: lädt die Welt im iframe (wie das echte Portal), lauscht auf
// die ready-Meldung + reicht DSL-Programme hinein.
function harness(worldPath) {
    return `<!doctype html><html><body>
<iframe id="w" src="${worldPath}" style="width:900px;height:600px;border:0"
  sandbox="allow-scripts allow-same-origin allow-pointer-lock"></iframe>
<script>
window.__ready = null;
window.addEventListener("message", (ev) => {
  const m = ev.data;
  if (m && m.type === "ready") window.__ready = m;
});
window.__sendDsl = (program) => {
  document.getElementById("w").contentWindow.postMessage({ type: "dsl", program }, "*");
};
window.__sendEnter = () => {
  document.getElementById("w").contentWindow.postMessage({ type: "enter" }, "*");
};
</script></body></html>`;
}

const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/__harness_garage.html") {
        res.setHeader("Content-Type", "text/html");
        return res.end(harness("/worlds/garage/index.html"));
    }
    if (p === "/__harness_portale.html") {
        res.setHeader("Content-Type", "text/html");
        return res.end(harness("/worlds/portale/index.html"));
    }
    if (p === "/__harness_schmiede.html") {
        res.setHeader("Content-Type", "text/html");
        return res.end(harness("/worlds/schmiede/index.html"));
    }
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

async function testWorld(browser, id, opts) {
    console.log(`\n=== ${id.toUpperCase()} — ${opts.label} ===`);
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/__harness_${id}.html`, { waitUntil: "load", timeout: 60000 });
    // Auf die ready-Meldung der Brücke warten (sie feuert unaufgefordert UND auf enter).
    await page.evaluate(() => window.__sendEnter());
    const ready = await page
        .waitForFunction(() => window.__ready, { timeout: 30000 })
        .then(() => page.evaluate(() => window.__ready))
        .catch(() => null);
    check(`${id}: W12-Brücke meldet ready`, !!ready, ready ? "" : "kein ready binnen 30s");
    check(
        `${id}: ready trägt world+label+dsl`,
        !!ready &&
            ready.world === id &&
            typeof ready.label === "string" &&
            Array.isArray(ready.dsl) &&
            ready.dsl.length > 0,
        ready ? `${ready.world} · ${ready.dsl && ready.dsl.length} Wörter` : ""
    );
    // Canvas im iframe (die Welt rendert).
    const frame = page.frames().find((f) => f.url().includes(`worlds/${id}/`));
    const hasCanvas = frame ? await frame.evaluate(() => !!document.querySelector("canvas")).catch(() => false) : false;
    check(`${id}: canvas existiert (Welt rendert)`, hasCanvas);
    // Ein DSL-Wort wirkt über den ECHTEN UI-Pfad.
    await page.evaluate((w) => window.__sendDsl([[w]]), opts.dslWord);
    await new Promise((r) => setTimeout(r, 600));
    const active = frame ? await frame.evaluate(opts.activeProbe).catch(() => null) : null;
    check(
        `${id}: DSL "${opts.dslWord}" klickt den echten Preset-Button`,
        active === opts.expectActive,
        `aktiv: ${JSON.stringify(active)}`
    );
    check(`${id}: 0 Seiten-Fehler`, pageErrors.length === 0, pageErrors[0] || "");
    await page.close();
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 180000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });

    await testWorld(browser, "garage", {
        label: "Anatomie · Fahrzeug",
        dslWord: "supersport",
        // Gattungs-Preset setzt class "on" auf seinem Button in #presets.
        activeProbe: () => {
            const b = document.querySelector("#presets button.on");
            return b ? b.textContent : null;
        },
        expectActive: "Supersport",
    });

    // N6.1 — DIE PROBEFAHRT LEBT: die Fahr-Konstanten (FAHR) leben seit dem
    // Formel-Umzug im KERN (vehicle-core, VC.FAHR) — dieser Check beweist den
    // Umzug am LEBENDEN Fahrmodell: DSL "probefahrt" schaltet in den Fahr-Modus
    // (HUD sichtbar), KeyW beschleunigt (updateVehicle liest carPhys+FAHR), der
    // HUD-Tacho steigt ueber 0.
    {
        console.log("\n=== GARAGE — Probefahrt (Fahrmodell mit Kern-FAHR) ===");
        const page = await browser.newPage();
        const pageErrors = [];
        page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
        await page.goto(`http://127.0.0.1:${PORT}/__harness_garage.html`, { waitUntil: "load", timeout: 60000 });
        await page.evaluate(() => window.__sendEnter());
        await page.waitForFunction(() => window.__ready, { timeout: 30000 }).catch(() => null);
        const frame = page.frames().find((f) => f.url().includes("worlds/garage/"));
        await page.evaluate(() => window.__sendDsl([["probefahrt"]]));
        await new Promise((r) => setTimeout(r, 500));
        const hudOn = frame
            ? await frame
                  .evaluate(() => {
                      const h = document.getElementById("hud");
                      return !!h && h.style.display === "block";
                  })
                  .catch(() => false)
            : false;
        check('garage: DSL "probefahrt" schaltet in den Fahr-Modus (HUD sichtbar)', hudOn);
        if (frame) {
            await frame.evaluate(() => window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyW" })));
            await new Promise((r) => setTimeout(r, 1600));
            const spd = await frame
                .evaluate(() => {
                    window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyW" }));
                    const el = document.querySelector("#hud #spd");
                    return el ? parseInt(el.textContent, 10) : -1;
                })
                .catch(() => -1);
            check(
                "garage: KeyW beschleunigt — der Tacho steigt (carPhys+FAHR aus dem Kern treiben)",
                spd > 0,
                `spd=${spd}`
            );
        } else {
            check("garage: Probefahrt-Frame gefunden", false);
        }
        check("garage: 0 Seiten-Fehler in der Probefahrt", pageErrors.length === 0, pageErrors[0] || "");
        await page.close();
    }

    await testWorld(browser, "portale", {
        label: "Porta",
        dslWord: "maschine",
        // Porta setzt class "active" auf dem gewählten Preset-Button.
        activeProbe: () => {
            const b = document.querySelector("#presets button.active");
            return b ? b.textContent : null;
        },
        expectActive: "Maschine",
    });

    // W-A4c — das Klingen-Labor: eine Gattung über den echten #presets-Pfad
    // klicken (Start-Gattung ist Langschwert; "degen" wechselt die class "on").
    await testWorld(browser, "schmiede", {
        label: "Anatomie · Klinge",
        dslWord: "degen",
        activeProbe: () => {
            const b = document.querySelector("#presets button.on");
            return b ? b.textContent : null;
        },
        expectActive: "Degen",
    });

    await browser.close();
    server.close();

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — alle drei Schöpfer-Labore laufen als Portale: fehlerfrei, rendernd, W12-Brücke spricht, die DSL klickt die echten UI-Pfade."
    );
    process.exit(0);
})().catch((e) => {
    console.error("smoke-labs-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
