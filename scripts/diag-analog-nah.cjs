// diag-analog-nah.cjs — DIE NAH-LINSE (gate:analog-nah, 04.10.): nah und mittel ist das Studio-Mesh die Gestalt
// (Schöpfer-Wort 30.09.: „am Ende AAA-Niveau, nicht Kapseln"), das Analog-Feld trägt erst jenseits der EINEN Nah-
// Grenze `ANALOG_NAH_M` (64 m). Befund (Blick-Tour 1, echte GPU, Mess-Wiese, unter Last): eine Baumkrone in 40 m als
// glatter Ellipsoid-Klumpen mit Kegel-Stamm, nach der Rückkehr an die Mess-Wiese 165 Analog-Sätze < 64 m, die 20 s
// lang schmolzen (die gedockte Studio-Stufe wurde über das Bau-Budget platziert, ein Eintrag je 250 ms); beim Boot 141
// Sätze bis zum 90-s-Deckel der Bühne (die Karten warteten auf die Bühne, die Bühne auf die Karten).
// Die Linse fährt den ECHTEN Renderer (WebGPU/swiftshader — der Null-Renderer ist für den Analog-Pfad blind) auf der
// Mess-Wiese −900/−850 (der Takt selbst zeichnet nicht — die Linse liest die CPU-Wahrheit, welcher Satz zeichnet)
// und liest `_analogZensus` (jeder zeichnende Analog-Satz diesseits der Nah-Grenze beim NAMEN:
// Klasse · Träger · Abstand · seit wann · warum dort kein Mesh steht). Ein Satz, dessen Mesh schon übernimmt und der
// ausdithert (der Schwund, 500 ms), ist kein Befund — ein Schwund über zwei Schwund-Zeiten hängt und IST einer.
// Dazu die BRÜCKEN: ein kalter Baum < 64 m, der seine Karte voll trägt, weil seine Wunsch-Stufe lädt — eingeschwungen
// steht keine (sonst wäre ein Nah-Wald aus Karten grün).
//   S  statisch: die drei Wurzeln der Klumpen-Rampe stehen als Struktur (Bäcker frei · Karten-Rang · Nah-Gang ganz)
//   E  Einschwingen: binnen GRENZE_E Takten steht die Welt (Bauten in der Mesh-Zone, Chunks gleich, Foundry-Schlange und
//      Karten-Bäcker leer) und 30 Takte am Stück ohne Satz — Spitze, Dauer und die Längsten beim Namen
//   R  Ruhe: RUHE Takte eingeschwungen, in keinem ein Satz < 64 m und am Ende keine Brücke < 64 m
//   T  Rampe: 400 m fort (bis der Ring dort steht), zurück — binnen GRENZE_T Takten 0 Sätze < 64 m
//   --selftest: ein erzwungener Kapsel-Satz in 20 m (ohne Träger) — die Linse wird rot und nennt ihn
//   ANALOG_NAH_PORT=… node scripts/diag-analog-nah.cjs [--selftest]
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.ANALOG_NAH_PORT || 4477);
const SELBST = process.argv.includes("--selftest");
const GRENZE_E = 1500; // Takte bis zum ersten satzfreien Zustand nach dem Boot
const RUHE = 100; // Takte, in denen eingeschwungen kein Satz auftauchen darf
const GRENZE_T = 120; // Takte nach der Rückkehr bis 0
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

// S — DIE KLASSE KEHRT NICHT ZURÜCK (statisch, vor dem Boot): die drei Wurzeln der Klumpen-Rampe stehen als Struktur.
//   S1 der Karten-Bäcker wartet nicht auf die Bühne (der Kreis Bühne → Streu → Karte → Bühne) und läuft im festen Takt
//      (`_runFrameScheduler`), nie im Deko-Job (`_tickScatterStreaming`, unter Last jeder 4. Frame)
//   S2 die Karte reist im Rang ihres nächsten Wartenden durch die Worker-Schlange, nie mit Vorrats-Rang (null)
//   S3 der Nah-Gang der Mesh-Zone bricht nie ab (kein `break`): ein erschöpftes Bau-Budget beendet nur das Bauen,
//      gedockte Studio-Stufen dahinter werden platziert
function methode(src, kopf) {
    const a = src.indexOf("\n    " + kopf);
    if (a < 0) return null;
    const b = src.indexOf("\n    }\n", a);
    return src.slice(a, b).replace(/\/\/.*$/gm, "");
}
function klassenWand(src) {
    const bake = methode(src, "_tickImpostorBake() {") || "";
    const sched = methode(src, "_runFrameScheduler(playerPos) {") || "";
    const streu = methode(src, "_tickScatterStreaming(playerPos, deadlineMs) {") || "";
    const req = methode(src, "_foundryBakeImpostorRequest(") || "";
    const cull = methode(src, "tickArchitectureCulling() {") || "";
    const nahA = cull.indexOf("for (const entry of nahOffen) {");
    const nahB = cull.indexOf("nahOffen.length = 0;", nahA);
    const nah = nahA >= 0 && nahB > nahA ? cull.slice(nahA, nahB) : "";
    const S1 =
        bake.length > 0 &&
        !/_buehneSteht\(/.test(bake) &&
        /this\._tickImpostorBake\(\);/.test(sched) &&
        !/_tickImpostorBake\(/.test(streu);
    const S2 = /this\._foundryAuftrag\(\s*f,\s*"imp",\s*msg,\s*Number\.isFinite\(bedarfD2\)/.test(req);
    const S3 = nah.length > 0 && !/\bbreak;/.test(nah);
    return { ok: S1 && S2 && S3, S1, S2, S3 };
}
{
    const stamm = fs.readFileSync(path.join(root, "anazhRealm.js"), "utf8");
    const heil = klassenWand(stamm);
    if (SELBST) {
        const brueche = [
            [
                "S1 Bühnen-Wache im Bäcker",
                stamm.replace(
                    "        if (!this._impostorBakeQueue || this._impostorBakeQueue.length === 0) return 0;\n",
                    "        if (!this._impostorBakeQueue || this._impostorBakeQueue.length === 0) return 0;\n        if (!this._buehneSteht()) return 0;\n"
                ),
            ],
            [
                "S2 Vorrats-Rang der Karte",
                stamm.replace(/msg,\n(\s*)Number\.isFinite\(bedarfD2\) \? bedarfD2 : null,/, "msg,\n$1null,"),
            ],
            [
                "S3 Abbruch des Nah-Gangs",
                stamm.replace(
                    "                if (versuche++ >= AnazhRealm.ARCH_NAH_VERSUCHE) {\n                    bauZu = true;\n                    continue;\n                }",
                    "                if (versuche++ >= AnazhRealm.ARCH_NAH_VERSUCHE) break;"
                ),
            ],
        ];
        const roh = brueche.map(([n, s]) => [n, s !== stamm && !klassenWand(s).ok]);
        const ok = heil.ok && roh.every(([, rot]) => rot);
        console.log(
            `${ok ? "✅" : "❌"} SELBST-TEST S: heil ${JSON.stringify(heil)} · ` +
                roh.map(([n, rot]) => `${n} → ${rot ? "rot" : "NICHT rot"}`).join(" · ")
        );
        if (!ok) process.exit(1);
    } else {
        console.log(
            `${heil.ok ? "✅" : "❌"} S  die Klumpen-Klasse steht als Struktur (S1 Bäcker frei im festen Takt ${heil.S1} · ` +
                `S2 Karte im Rang des Wartenden ${heil.S2} · S3 Nah-Gang ohne Abbruch ${heil.S3})`
        );
        if (!heil.ok) process.exit(1);
    }
}

// Das Urteil über EINEN Zensus: hart = zeichnet und schwindet nicht (oder sein Schwund hängt). Die Täter beim Namen.
function urteil(z) {
    if (!z) return { hart: [], text: "kein Zensus (Welt-March fehlt)" };
    const hart = z.nah.filter((a) => !a.schwindet || a.haengt);
    const text = hart
        .slice(0, 8)
        .map((a) => `${a.klasse}:${a.name} ${a.d} m seit ${a.seitMs} ms (${a.grund})`)
        .join(" | ");
    return { hart, text };
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 1800000,
        // WebGPU über Dawns swiftshader-Adapter: nur dort zeichnet der Feld-Pass (rohes WGSL). Gemessen 05.10. (Windows):
        // mit den Vulkan-/ANGLE-Schaltern gibt es keinen Adapter (auch nicht zusammen mit --use-webgpu-adapter), der
        // Renderer fiel nach init() still auf WebGL2 — die Linse las die CPU-Wahrheit eines Passes, der nie lief. Nur
        // dieselben Schalter wie gate:kamera-treue liefern ihn. Das Backend steht im Bericht.
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--enable-unsafe-webgpu",
            "--use-webgpu-adapter=swiftshader",
            "--enable-unsafe-swiftshader",
        ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 640, height: 360 });
    const pageErrors = [];
    // Die Linse nennt den Täter eines Seiten-Fehlers: die Phase (die letzte [N]-Zeile) und die Zeit seit dem Start;
    // WebGPU-Meldungen der Konsole (Geräteverlust, Validierung) reisen mit ins Log (die CI-Runner fahren Dawns
    // swiftshader auf Linux — 05.10. brach dort die Instanz mitten im Lauf weg, lokal nie).
    const t0 = Date.now();
    let phase = "boot";
    let gpuMeldungen = 0;
    page.on("pageerror", (e) => {
        const m = (e.stack || e.message || String(e)).split("\n")[0];
        pageErrors.push(m);
        console.log(`  [Seiten-Fehler] Phase „${phase}" +${Date.now() - t0} ms: ${m}`);
    });
    page.on("console", (m) => {
        const t = m.text();
        if (t.startsWith("[N]")) {
            phase = t.slice(4, 60);
            console.log("  " + t);
        } else if ((m.type() === "error" || m.type() === "warning") && /webgpu|gpu|dawn|device|lost/i.test(t) && gpuMeldungen < 12) {
            gpuMeldungen++;
            console.log(`  [GPU-Konsole] Phase „${phase}" +${Date.now() - t0} ms: ${t.slice(0, 300)}`);
        }
    });
    // Wer zerstört ein Gerät? (CI 05.10.: „destroyed · Device was destroyed" 3,8 s nach dem Start, nur auf Linux) — der
    // Aufrufer-Stapel jedes GPUDevice.destroy reist ins Log.
    await page.evaluateOnNewDocument(() => {
        if (typeof GPUDevice === "undefined" || !GPUDevice.prototype || !GPUDevice.prototype.destroy) return;
        const org = GPUDevice.prototype.destroy;
        GPUDevice.prototype.destroy = function () {
            const st = String(new Error().stack || "")
                .split("\n")
                .slice(2, 9)
                .map((z) => z.trim().replace(/\(?https?:\/\/[^/]+\//, "("))
                .join(" < ");
            console.log("[N] GPUDevice.destroy gerufen: " + st);
            return org.apply(this, arguments);
        };
    });
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
    const res = await page.evaluate(
        async (k) => {
            const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
            const dl0 = performance.now() + 300000;
            while (
                (!window.anazhRealm ||
                    !window.anazhRealm.state ||
                    typeof window.anazhRealm._gameLoopTick !== "function") &&
                performance.now() < dl0
            )
                await sleep(200);
            const r = window.anazhRealm;
            if (!r || !r.state.renderer || r.state.renderer._isHeadlessNull) return { fatal: "kein echter Renderer" };
            if (typeof r._analogZensus !== "function") return { fatal: "_analogZensus fehlt" };
            r.state.renderer.setAnimationLoop(null);
            // Der Takt rendert NICHT (unter swiftshader kostet ein Voll-Render mit Studio-Meshes Sekunden — wie in
            // diag-beweis-e): der Zensus liest die CPU-Wahrheit, welcher Satz zeichnet; der Analog-Pfad bleibt offen,
            // denn der Renderer ist echt (kein Null-Renderer), nur sein Zeichnen ruht.
            const rend = r.state.renderer;
            // Geräteverlust laut ins Log (Grund + Meldung), nie still.
            const dev = rend.backend && rend.backend.device;
            if (dev && dev.lost)
                dev.lost.then((i) => console.log("[N] WebGPU-Geraet verloren: " + i.reason + " · " + i.message));
            rend.render = function () {};
            if (typeof rend.renderAsync === "function") rend.renderAsync = () => Promise.resolve();
            r.state.postProcessingFailed = true;
            const dlB = performance.now() + 120000;
            while (r._foundry && !(r._foundry.ready && r._foundry.recipes) && performance.now() < dlB) await sleep(500);
            // nach init(): fiel der r184-Renderer ohne Adapter auf WebGL2, steht das hier (kein stilles Grün)
            const backend = r._gpuComputeFaehig() ? "WebGPU" : "WebGL2-Rückfall (der Feld-Pass zeichnet nicht)";
            let taktFehlerN = 0,
                taktFehler1 = null;
            const tick = async () => {
                try {
                    if (r.state.world) r.state.world.timeOfDay = 0.5;
                    r._gameLoopTick(performance.now());
                } catch (e) {
                    taktFehlerN++;
                    if (!taktFehler1)
                        taktFehler1 = String((e && e.stack) || e)
                            .split("\n")
                            .slice(0, 3)
                            .join(" | ");
                }
                await sleep(20);
            };
            const setze = (x, z) => r.state.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
            const hart = () => {
                const z = r._analogZensus();
                return z ? z.nah.filter((a) => !a.schwindet || a.haengt) : null;
            };
            const X = -900,
                Z = -850;
            setze(X, Z);
            await tick();
            if (k.selbst) {
                // DER ERZWUNGENE SATZ: ein Kapsel-Satz ohne Träger, 20 m vor dem Spieler — die Linse muss ihn nennen.
                const T = window.THREE;
                const pm = r.state.playerMesh.position;
                const M = new T.Matrix4().makeTranslation(pm.x + 20, pm.y - 1.8, pm.z);
                const h = r._weltKapselSpawn("selbsttest:nah20", M, () => ({
                    a: new T.Vector3(0, 0, 0),
                    b: new T.Vector3(0, 2, 0),
                    r: 0.6,
                    farbe: { r: 0.5, g: 0.5, b: 0.5 },
                }));
                const z = r._analogZensus();
                if (h) r._weltFeldFrei(h);
                const ohne = r._analogZensus();
                return {
                    selbst: true,
                    backend,
                    gesetzt: !!h,
                    z,
                    ohne,
                    taktFehler: { n: taktFehlerN, erster: taktFehler1 },
                };
            }
            // E — Einschwingen: Spitze, erster satzfreier Takt, Dauer je Täter. Eingeschwungen heißt die WELT steht, nicht nur
            // „gerade kein Satz" (in den ersten Takten ist noch kein Bau gestreamt — ein satzfreier Anfang ist vakuös):
            // Bauten in der Mesh-Zone, Chunks 20 Takte gleich, Foundry-Schlange und Karten-Bäcker leer, dann 30 Takte satzfrei.
            const ruhig = (() => {
                let vor = -1,
                    gleich = 0;
                return () => {
                    const st = r.state;
                    const n = st.voxelChunks ? st.voxelChunks.size : 0;
                    gleich = n === vor ? gleich + 1 : 0;
                    vor = n;
                    const f = r._foundry;
                    const pm = st.playerMesh.position;
                    const R2 = (st.architectureCullingRadius || 0) ** 2;
                    let bauten = 0;
                    for (const e of st.architectures || [])
                        if ((e.position.x - pm.x) ** 2 + (e.position.z - pm.z) ** 2 <= R2) bauten++;
                    return (
                        gleich >= 20 &&
                        bauten > 0 &&
                        !!(f && f.ready && f.pending.size === 0 && !(f.warte && f.warte.length)) &&
                        !(r._impostorBakeQueue && r._impostorBakeQueue.length) &&
                        !r._impostorBakePending
                    );
                };
            })();
            let spitze = 0,
                frei = null,
                freiSeit = 0;
            const dauer = new Map();
            for (let t = 1; t <= k.grenzeE; t++) {
                await tick();
                const welt = ruhig();
                const h = hart();
                if (!h) continue;
                spitze = Math.max(spitze, h.length);
                for (const a of h) {
                    const key = a.klasse + ":" + a.name;
                    const d = dauer.get(key) || { von: t, bis: t, d: a.d, gruende: {} };
                    d.bis = t;
                    d.gruende[a.grund] = (d.gruende[a.grund] || 0) + 1; // der Grund, der am längsten hielt
                    dauer.set(key, d);
                }
                if (t % 100 === 0) console.log("[N] Einschwingen Takt " + t + ": " + h.length + " Sätze < 64 m");
                if (h.length === 0 && welt) {
                    if (frei === null) frei = t;
                    if (++freiSeit >= 30) break; // die Welt steht und 30 Takte am Stück satzfrei = eingeschwungen
                } else {
                    frei = null;
                    freiSeit = 0;
                }
            }
            const laengste = [...dauer.entries()]
                .map(([n, v]) => ({
                    n,
                    takte: v.bis - v.von + 1,
                    d: v.d,
                    grund: Object.entries(v.gruende).sort((x, y) => y[1] - x[1])[0][0],
                }))
                .sort((a, b) => b.takte - a.takte)
                .slice(0, 6);
            // R — Ruhe (und am Ende keine Brücke: eingeschwungen trägt jeder nahe Baum seine Wunsch-Stufe)
            let ruheMax = 0,
                ruheZ = null,
                brueckenMax = 0;
            for (let t = 0; t < k.ruhe; t++) {
                await tick();
                const h = hart();
                if (h && h.length > ruheMax) {
                    ruheMax = h.length;
                    ruheZ = r._analogZensus();
                }
                const zb = r._analogZensus();
                if (zb && zb.bruecken) brueckenMax = Math.max(brueckenMax, zb.bruecken.length);
            }
            const ruheEnde = r._analogZensus();
            const brueckenEnde = ruheEnde && ruheEnde.bruecken ? ruheEnde.bruecken : [];
            // T — die Rampe: fort, bis der Ring dort steht, und zurück
            setze(X + 400, Z);
            let stabil = 0,
                vor = -1;
            for (let t = 0; t < 400 && stabil < 20; t++) {
                await tick();
                const n = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                stabil = n === vor ? stabil + 1 : 0;
                vor = n;
            }
            setze(X, Z);
            let rampeSpitze = 0,
                rampeNull = null,
                rampeZ = null;
            for (let t = 1; t <= k.grenzeT; t++) {
                await tick();
                const h = hart();
                if (!h) continue;
                if (h.length > rampeSpitze) {
                    rampeSpitze = h.length;
                    rampeZ = r._analogZensus();
                }
                if (h.length === 0 && rampeNull === null) rampeNull = t;
                if (h.length > 0) rampeNull = null;
            }
            return {
                spitze,
                frei,
                laengste,
                ruheMax,
                ruheZ,
                brueckenMax,
                brueckenEnde,
                rampeSpitze,
                rampeNull,
                rampeZ,
                ende: r._analogZensus(),
                backend,
                taktFehler: { n: taktFehlerN, erster: taktFehler1 },
            };
        },
        { selbst: SELBST, grenzeE: GRENZE_E, ruhe: RUHE, grenzeT: GRENZE_T }
    );
    await browser.close();
    server.close();
    if (!res || res.fatal) {
        console.log("❌ FEHLER:", res ? res.fatal : "?", "· Page-Errors:", pageErrors.slice(0, 3).join(" | ") || "-");
        process.exit(1);
    }
    console.log(`   Backend: ${res.backend}`);
    if (res.selbst) {
        const mit = urteil(res.z);
        const ohne = urteil(res.ohne);
        const genannt = mit.hart.some((a) => a.satz === "selbsttest:nah20" && a.d <= 20 && a.klasse === "unbekannt");
        const ok = res.gesetzt && genannt && !ohne.hart.some((a) => a.satz === "selbsttest:nah20");
        console.log(
            `${ok ? "✅" : "❌"} SELBST-TEST: erzwungener Kapsel-Satz in 20 m ${res.gesetzt ? "gesetzt" : "NICHT gesetzt"} → ` +
                `${genannt ? "rot und genannt" : "NICHT genannt"} (${mit.text || "-"}); nach dem Abbau ${ohne.hart.some((a) => a.satz === "selbsttest:nah20") ? "noch da" : "fort"}`
        );
        process.exit(ok ? 0 : 1);
    }
    const E = res.frei !== null;
    const R = res.ruheMax === 0 && res.brueckenEnde.length === 0;
    const T = res.rampeNull !== null;
    const TF = !(res.taktFehler && res.taktFehler.n > 0);
    console.log(
        `${E ? "✅" : "❌"} E  eingeschwungen ohne Analog-Satz < 64 m ab Takt ${res.frei} (Grenze ${GRENZE_E}) · Spitze ${res.spitze} · ` +
            `längste: ${res.laengste.map((a) => `${a.n} ${a.takte} Takte ${a.d} m (${a.grund})`).join(" | ") || "-"}`
    );
    console.log(
        `${R ? "✅" : "❌"} R  Ruhe ${RUHE} Takte: höchstens ${res.ruheMax} Sätze < 64 m${res.ruheMax ? " — " + urteil(res.ruheZ).text : ""} · ` +
            `Brücken < 64 m höchstens ${res.brueckenMax}, am Ende ${res.brueckenEnde.length}` +
            (res.brueckenEnde.length
                ? " — " +
                  res.brueckenEnde
                      .slice(0, 6)
                      .map((b) => `${b.name} ${b.d} m seit ${b.seitMs} ms`)
                      .join(" | ")
                : "")
    );
    console.log(
        `${T ? "✅" : "❌"} T  Rampe (400 m fort und zurück): satzfrei ab Takt ${res.rampeNull} (Grenze ${GRENZE_T}) · Spitze ${res.rampeSpitze}` +
            (res.rampeSpitze ? " — " + urteil(res.rampeZ).text : "")
    );
    console.log(
        TF
            ? "✅ X  keine Ausnahme im Spiel-Takt"
            : `❌ X  ${res.taktFehler.n} Ausnahmen im Spiel-Takt — erste: ${res.taktFehler.erster}`
    );
    const gruen = E && R && T && TF && pageErrors.length === 0;
    console.log(
        gruen
            ? "✅ GRÜN — nah und mittel trägt das Studio-Mesh: kein Analog-Satz < 64 m nach dem Einschwingen, die Rampe kurz und benannt."
            : `❌ ROT${pageErrors.length ? " · Page-Errors: " + pageErrors.slice(0, 2).join(" | ") : ""}`
    );
    process.exit(gruen ? 0 : 1);
})().catch((e) => {
    console.error("DIAG-FEHLER:", e);
    try {
        server.close();
    } catch (_e) {}
    process.exit(1);
});
