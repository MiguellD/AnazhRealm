// diag-feld-cull.cjs — DER FELD-CULL (STUFE 1 VOLLAUSBAU, das-feld-zeichnet §2:
// „Sichtbarkeit ist eine Feld-Frage … GPU-Cull per Compute + indirekte Draws").
// Browser-Linse (Null-Renderer + Hook + ECHTES WebGPU via swiftshader-Vulkan —
// das diag-fern-ring-Band-7/8-Muster): die schwersten @s:-Super-Region-Familien
// des Nicht-Baum-Scatters tragen das GPU-Gewand — ein Compute-Pass testet je
// Instanz die Hüllkugel gegen die 6 Frustum-Ebenen und kompaktiert die
// sichtbaren Matrizen via atomicAdd in den Indirect-Draw-Puffer.
// Gesetze:
//   (0) HEADLESS-DEFAULT — ohne Hook ruht der Feld-Cull (Null-Renderer, die
//       __anazhFernRing-Disziplin), keine Adoption.
//   (a) STRUKTUR — das Gewand einer ECHTEN Spiel-Familie trägt
//       geometry.setIndirect (IndirectStorageBufferAttribute) + Storage-
//       Instanz-Matrix (isStorageInstancedBufferAttribute); die CPU-Quelle
//       bleibt (unsichtbar, gleiche Region-Eltern), der Konsument teilt
//       Material + Geometrie-Attribute (kein Zwilling).
//   (b) DER COMPUTE LÄUFT — die Pässe laufen im Spiel-Tick (laeufe > 0) und
//       auf echtem WebGPU: der Init-Pass schreibt indexCount in den Draw-
//       Puffer (Readback beweist das Kompilat + den Lauf).
//   (c) DAS URTEIL MISST — Kamera AUF die Familie → instanceCount ≈ lebende
//       Instanzen; Kamera 180° WEG → instanceCount deutlich kleiner (≤ 30 %).
//       Der kompaktierte Ziel-Puffer trägt echte Matrizen (Skala > 0).
//   (d) SELBSTTEST — injizierte Immer-wahr-Sichtbarkeit (uImmer=1) MUSS das
//       (c)-Kriterium rot fallen lassen (die Linse ist nicht vakuös).
//   (e) kein pageerror.
//   (f) CHURN — N× adoptieren+ablegen (der Wander-Churn): das Verlassen
//       zerstört die EIGENEN Storage-/Indirect-Puffer EXPLIZIT am Backend
//       (renderer._attributes.delete → GPUBuffer.destroy) — renderer.info
//       .memory.storageAttributes/indirectStorageAttributes kehren nach
//       JEDER Runde exakt auf die Grundlinie zurück (kein Puffer-Leck),
//       die Zähler pufferAbgelegt/pufferGeloest belegen die Arbeit.
//   (g) CHURN-SELBSTTEST — ein Verlassen OHNE Backend-Destroy (Null-
//       Renderer-Pfad) LÄSST die Puffer stehen (info.memory bleibt erhöht)
//       — das Leck wäre sichtbar, die Linse ist nicht vakuös; danach räumt
//       _feldCullPufferFrei mit Renderer-Override nachweislich auf.
//   node scripts/diag-feld-cull.cjs
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.FELD_CULL_PORT || 4471);

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
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

(async () => {
    console.log("=== FELD-CULL (STUFE 1 VOLLAUSBAU) — Browser, Null-Renderer + echtes WebGPU ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        args: [
            "--use-angle=swiftshader",
            "--enable-unsafe-swiftshader",
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--enable-unsafe-webgpu",
            "--enable-features=Vulkan",
            "--use-vulkan=swiftshader",
        ],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    const pageErrors = [];
    page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 30000 });

    const out = await page.evaluate(async () => {
        const res = {};
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const dl0 = performance.now() + 60000;
        while (
            (!window.anazhRealm ||
                !window.anazhRealm.state ||
                !window.anazhRealm.state.scene ||
                !window.anazhRealm.state.playerMesh ||
                !window.anazhRealm.state.worldMeta) &&
            performance.now() < dl0
        )
            await sleep(100);
        const r = window.anazhRealm;
        if (!r || !r.state || !r.state.scene) return { fatal: "anazhRealm/scene kam nie" };
        const dlLoop = performance.now() + 30000;
        while (typeof r._gameLoopTick !== "function" && performance.now() < dlLoop) await sleep(200);
        if (typeof r._gameLoopTick !== "function") return { fatal: "_gameLoopTick kam nie (Renderer-Ready)" };

        // ===== (0) HEADLESS-DEFAULT: ohne Hook ruht der Feld-Cull =====
        const prevHook = window.__anazhFeldCull;
        delete window.__anazhFeldCull;
        for (let t = 0; t < 5; t++) r._gameLoopTick(performance.now());
        res.headlessRuhe = !r._feldCull || r._feldCull.gewaender.size === 0;

        // ===== Die ECHTE Fern-Population bauen lassen (diag-scatter-lod-Idiom):
        // Foundry-ready abwarten (die lod2-Bibliothek prefetcht geroell/findling/…),
        // dann den Scatter-Streaming-Tick DIREKT pumpen, bis @s:-InstancedMesh-
        // Familien leben (der Loop allein budgetiert zu langsam für die Linse). =====
        const zaehleSuper = () => {
            // dieselbe Klasse wie die Kandidaten-Wand: regionale fscatter-InstancedMesh-Familien
            let n = 0;
            let max = 0;
            if (r.state.archInstanceGroups) {
                for (const g of r.state.archInstanceGroups.values()) {
                    if (!g || !g.mesh || g.kind === "batch" || !g.mesh.isInstancedMesh) continue;
                    if (!g.key.startsWith("fscatter:") || g.key.indexOf("@") < 0) continue;
                    n++;
                    if ((g.mesh.count | 0) > max) max = g.mesh.count | 0;
                }
            }
            return { n, max };
        };
        const f = r._ensureAssetFoundry();
        const dlF = performance.now() + 60000;
        while ((!f || !f.ready) && performance.now() < dlF) await sleep(100);
        res.foundryReady = !!(f && f.ready);
        const pm = r.state.playerMesh.position;
        const dlS = performance.now() + 90000;
        while (performance.now() < dlS) {
            for (let i = 0; i < 6; i++) r._tickScatterStreaming(pm);
            const z = zaehleSuper();
            if (z.n >= 1 && z.max >= 4) break;
            await sleep(120);
        }

        // ===== Hook AN + Linsen-Tuning: die Adoption soll im Boot-Bestand greifen =====
        window.__anazhFeldCull = true;
        const F = r.constructor.FELD_CULL;
        const altMin = F.minInstanzen;
        const altTakt = F.scanTakt;
        F.minInstanzen = 4; // die Linse senkt die Schwelle — die Familie bleibt ECHT (Spiel-Pipeline)
        F.scanTakt = 2;
        const dlAdopt = performance.now() + 60000;
        let fc = null;
        while (performance.now() < dlAdopt) {
            r._gameLoopTick(performance.now());
            r._tickScatterStreaming(pm);
            fc = r._feldCull;
            if (fc && fc.lib && fc.gewaender.size >= 1) break;
            await sleep(120);
        }
        res.libDa = !!(fc && fc.lib);
        res.gewaender = fc ? fc.gewaender.size : 0;
        res.letzterFehler = fc ? fc.letzterFehler || null : null;
        // Diagnose bei Leer-Lauf: wie viele Kandidaten-Familien lebten überhaupt?
        const zDiag = zaehleSuper();
        res.superGruppen = zDiag.n;
        res.superMaxCount = zDiag.max;
        if (!fc || !fc.gewaender.size) {
            F.minInstanzen = altMin;
            F.scanTakt = altTakt;
            return Object.assign(res, { fatal: "keine Familie adoptiert (s. superGruppen/letzterFehler)" });
        }

        // ===== (b1) DER COMPUTE LÄUFT IM SPIEL-TICK (laeufe zählt im Loop) =====
        for (let t = 0; t < 4; t++) r._gameLoopTick(performance.now());
        res.laeufeInGame = fc.laeufe;
        const gew = fc.gewaender.values().next().value;
        res.gewKey = gew.key;
        res.gewCap = gew.cap;

        // ===== (a) STRUKTUR: setIndirect + Storage-Puffer + CPU-Quelle bleibt =====
        const kons = gew.kons;
        const quelle = gew.quelleMesh;
        res.aIndirect =
            kons.geometry.indirect === gew.drawAttr && gew.drawAttr.isIndirectStorageBufferAttribute === true;
        res.aStorageMatrix = kons.instanceMatrix.isStorageInstancedBufferAttribute === true;
        res.aSeed = gew.drawAttr.array[0] === gew.idxZahl && gew.idxZahl > 0;
        // Die Quelle bleibt LEBENDIG (Slots/Matrizen/Schatten-Wurf), verlässt aber
        // die Kamera: SHADOW_TWIN_LAYER (V18.389 — nur der Schatten-Pass zählt Layer 2).
        const TWIN = r.constructor.SHADOW_TWIN_LAYER;
        res.aQuelleBleibt =
            quelle.visible === true && quelle.layers.mask === (1 << TWIN) && kons.parent === quelle.parent;
        res.aGeteilt =
            kons.material === gew.gruppe.mat &&
            kons.geometry.attributes.position === quelle.geometry.attributes.position;

        // ===== (b2/c/d): echtes WebGPU — eigener Renderer fährt die Pässe =====
        // Extern-Seam: der Spiel-Tick hält Uniform-Sync + Compute still, damit
        // die Linsen-Kamera die Frustum-Ebenen exklusiv besitzt.
        window.__anazhFeldCullExtern = true;
        // Quell-Spiegel deterministisch füllen (die EINE CPU-Wahrheit):
        gew.srcM.value.array.set(quelle.instanceMatrix.array);
        gew.srcM.value.needsUpdate = true;
        if (gew.srcC && quelle.instanceColor) {
            gew.srcC.value.array.set(quelle.instanceColor.array);
            gew.srcC.value.needsUpdate = true;
        }
        gew.uAktiv.value = quelle.count | 0;
        // Lebende Instanzen (Skala > 0) + Schwerpunkt aus der CPU-Wahrheit:
        const arr = quelle.instanceMatrix.array;
        let lebend = 0;
        let cx = 0;
        let cy = 0;
        let cz = 0;
        for (let i = 0; i < (quelle.count | 0); i++) {
            const o = i * 16;
            const sk = Math.hypot(arr[o], arr[o + 1], arr[o + 2]);
            if (sk > 1e-6) {
                lebend++;
                cx += arr[o + 12];
                cy += arr[o + 13];
                cz += arr[o + 14];
            }
        }
        res.lebend = lebend;
        if (lebend > 0) {
            cx /= lebend;
            cy /= lebend;
            cz /= lebend;
        }
        let ausdehnung = 10;
        for (let i = 0; i < (quelle.count | 0); i++) {
            const o = i * 16;
            const sk = Math.hypot(arr[o], arr[o + 1], arr[o + 2]);
            if (sk > 1e-6) {
                const d = Math.hypot(arr[o + 12] - cx, arr[o + 13] - cy, arr[o + 14] - cz);
                if (d > ausdehnung) ausdehnung = d;
            }
        }
        res.ausdehnung = +ausdehnung.toFixed(1);
        try {
            const ren = new THREE.WebGPURenderer({ antialias: false });
            await ren.init();
            const planeVon = (cam) => {
                cam.updateMatrixWorld(true);
                const m = new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
                const fr = new THREE.Frustum().setFromProjectionMatrix(m);
                r._feldCullPlanesAus(fr);
            };
            const fahre = async () => {
                await ren.computeAsync(gew.passInit);
                await ren.computeAsync(gew.passCull);
                const buf = new Uint32Array(await ren.getArrayBufferAsync(gew.drawAttr));
                return { indexCount: buf[0], instanzen: buf[1] };
            };
            const dist = ausdehnung * 2 + 60;
            const cam = new THREE.PerspectiveCamera(70, 1.5, 0.5, dist * 4 + 1000);
            // Kamera AUF die Familie:
            cam.position.set(cx + dist, cy + dist * 0.35, cz);
            cam.lookAt(cx, cy, cz);
            planeVon(cam);
            const hin = await fahre();
            res.hin = hin.instanzen;
            res.bIndexCount = hin.indexCount === gew.idxZahl;
            // Der kompaktierte Ziel-Puffer trägt echte Matrizen (Skala > 0):
            const dstArr = new Float32Array(await ren.getArrayBufferAsync(gew.dstM.value));
            res.cDstSkala = res.hin > 0 ? Math.hypot(dstArr[0], dstArr[1], dstArr[2]) : -1;
            // Kamera 180° WEG (gleicher Standort, Blick vom Schwerpunkt fort):
            cam.lookAt(cx + dist * 2, cy + dist * 0.7, cz);
            planeVon(cam);
            const weg = await fahre();
            res.weg = weg.instanzen;
            // ===== (d) SELBSTTEST: Immer-wahr-Injektion → (c) MUSS rot fallen =====
            gew.uImmer.value = 1;
            const immer = await fahre();
            gew.uImmer.value = 0;
            res.immer = immer.instanzen;

            // ===== (f) CHURN — N× adoptieren+ablegen: kein Puffer-Leck =====
            // Die Pässe liefen auf REN (echtes WebGPU) — die GPU-Puffer des
            // Gewands leben in SEINEM Backend. Das Verlassen bekommt REN als
            // Override und muss info.memory exakt auf die Grundlinie ziehen.
            const memS = () => ({
                s: ren.info.memory.storageAttributes | 0,
                i: ren.info.memory.indirectStorageAttributes | 0,
                bytes: (ren.info.memory.storageAttributesSize | 0) + (ren.info.memory.indirectStorageAttributesSize | 0),
            });
            const churn = { runden: 0, fehler: [], erhoeht: 0 };
            const geloest0 = fc.pufferGeloest | 0;
            r._feldCullVerlasse(gew.key, ren); // das Band-b/c/d-Gewand ablegen → Grundlinie OHNE Feld-Cull-Puffer
            const basis = memS();
            res.churnBasis = basis;
            for (let k = 0; k < 4; k++) {
                // Re-Adoption DIREKT über den echten Adoptions-Pfad (deterministisch —
                // kein Spiel-Tick dazwischen, der die Quelle wachsen lassen könnte):
                const g0 = r.state.archInstanceGroups.get(gew.key);
                const g2 = g0 && r._feldCullKandidat(g0) ? r._feldCullAdoptiere(g0) : null;
                if (!g2) {
                    churn.fehler.push("k" + k + ": keine Re-Adoption (" + (fc.letzterFehler || "-") + ")");
                    break;
                }
                // Pässe auf echtem WebGPU fahren → die Puffer entstehen WIRKLICH:
                g2.srcM.value.array.set(g2.quelleMesh.instanceMatrix.array);
                g2.srcM.value.needsUpdate = true;
                g2.uAktiv.value = g2.quelleMesh.count | 0;
                await ren.computeAsync(g2.passInit);
                await ren.computeAsync(g2.passCull);
                const mitten = memS();
                if (!(mitten.s > basis.s && mitten.i > basis.i))
                    churn.fehler.push("k" + k + ": Puffer entstanden nicht (s=" + mitten.s + " i=" + mitten.i + ")");
                else churn.erhoeht++;
                r._feldCullVerlasse(g2.key, ren);
                const nach = memS();
                if (nach.s !== basis.s || nach.i !== basis.i || nach.bytes !== basis.bytes)
                    churn.fehler.push(
                        "k" + k + ": LECK s=" + nach.s + "/" + basis.s + " i=" + nach.i + "/" + basis.i + " bytes=" + nach.bytes + "/" + basis.bytes
                    );
                churn.runden++;
            }
            res.churn = churn;
            res.churnGeloest = (fc.pufferGeloest | 0) - geloest0;
            res.churnAbgelegt = fc.pufferAbgelegt | 0;

            // ===== (g) CHURN-SELBSTTEST: OHNE Backend-Destroy bliebe das Leck =====
            const g0s = r.state.archInstanceGroups.get(gew.key);
            const g3 = g0s && r._feldCullKandidat(g0s) ? r._feldCullAdoptiere(g0s) : null;
            if (g3) {
                g3.srcM.value.array.set(g3.quelleMesh.instanceMatrix.array);
                g3.srcM.value.needsUpdate = true;
                g3.uAktiv.value = g3.quelleMesh.count | 0;
                await ren.computeAsync(g3.passInit);
                await ren.computeAsync(g3.passCull);
                const vorher = memS();
                r._feldCullVerlasse(g3.key); // OHNE Override: der Spiel-Renderer (Null) trägt keine Backend-Puffer
                const dazwischen = memS();
                res.selbsttestLeckSichtbar = dazwischen.s === vorher.s && dazwischen.s > basis.s;
                r._feldCullPufferFrei(g3, ren); // Aufräumen mit Override — die Bilanz muss wieder stimmen
                const danach = memS();
                res.selbsttestAufgeraeumt = danach.s === basis.s && danach.i === basis.i;
            } else {
                res.selbsttestLeckSichtbar = false;
                res.selbsttestAufgeraeumt = false;
            }
            ren.dispose();
        } catch (e) {
            res.computeFehler = (e && e.message) || String(e);
        }

        // Hook + Tuning wiederherstellen (sichern + wiederherstellen, nie löschen):
        delete window.__anazhFeldCullExtern;
        F.minInstanzen = altMin;
        F.scanTakt = altTakt;
        if (prevHook === undefined) delete window.__anazhFeldCull;
        else window.__anazhFeldCull = prevHook;
        return res;
    });

    await browser.close();
    server.close();

    if (out.fatal) {
        console.error(
            `❌ FATAL: ${out.fatal} (superGruppen=${out.superGruppen} maxCount=${out.superMaxCount} lib=${out.libDa} foundry=${out.foundryReady} fehler=${out.letzterFehler || "-"})`
        );
        process.exit(2);
    }
    check("0: HEADLESS-DEFAULT — ohne Hook ruht der Feld-Cull (keine Adoption)", out.headlessRuhe === true);
    check(
        "Adoption — ECHTE regionale fscatter-Spiel-Familien tragen das GPU-Gewand",
        out.gewaender >= 1,
        `gewaender=${out.gewaender} key=${out.gewKey} cap=${out.gewCap} kandidaten=${out.superGruppen}`
    );
    check(
        "a: STRUKTUR — geometry.setIndirect + IndirectStorageBufferAttribute (indexCount gesät)",
        out.aIndirect === true && out.aSeed === true
    );
    check("a: STRUKTUR — der Konsument liest die Storage-Instanz-Matrix (r184-nativ)", out.aStorageMatrix === true);
    check(
        "a: STRUKTUR — die CPU-Quelle bleibt (Twin-Layer statt Kamera, gleiche Region-Eltern; Material+Attribute geteilt)",
        out.aQuelleBleibt === true && out.aGeteilt === true
    );
    check(
        "b: DER COMPUTE LÄUFT — im Spiel-Tick (laeufe > 0) UND auf echtem WebGPU (Init schrieb indexCount)",
        out.laeufeInGame > 0 && out.bIndexCount === true && !out.computeFehler,
        `laeufe=${out.laeufeInGame}${out.computeFehler ? " err=" + out.computeFehler : ""}`
    );
    check(
        "c: DAS URTEIL MISST — Kamera AUF die Familie: instanceCount ≈ lebende Instanzen",
        Number.isFinite(out.hin) && out.hin > 0 && out.hin >= Math.max(1, Math.floor(out.lebend * 0.6)),
        `hin=${out.hin} lebend=${out.lebend} ausdehnung=${out.ausdehnung}m`
    );
    check(
        "c: Kamera 180° WEG — instanceCount deutlich kleiner (≤ 30 % von hin)",
        Number.isFinite(out.weg) && out.weg <= Math.max(0, Math.floor(out.hin * 0.3)),
        `weg=${out.weg} hin=${out.hin}`
    );
    check(
        "c: der kompaktierte Ziel-Puffer trägt echte Matrizen (Skala > 0)",
        Number.isFinite(out.cDstSkala) && out.cDstSkala > 1e-6,
        `skala=${out.cDstSkala && out.cDstSkala.toFixed ? out.cDstSkala.toFixed(3) : out.cDstSkala}`
    );
    check(
        "d: SELBSTTEST — Immer-wahr-Injektion lässt das Weg-Kriterium rot fallen",
        Number.isFinite(out.immer) && !(out.immer <= Math.max(0, Math.floor(out.hin * 0.3))) && out.immer >= out.lebend,
        `immer=${out.immer} lebend=${out.lebend}`
    );
    check("e: kein pageerror", pageErrors.length === 0, pageErrors[0] || "");
    const ch = out.churn || { runden: 0, fehler: ["kein churn-Band gelaufen"], erhoeht: 0 };
    check(
        "f: CHURN — 4× adoptieren+ablegen: Puffer entstehen je Runde und sterben EXAKT auf die Grundlinie (kein Leck)",
        ch.runden === 4 && ch.erhoeht === 4 && ch.fehler.length === 0,
        `runden=${ch.runden} erhoeht=${ch.erhoeht} basis=${JSON.stringify(out.churnBasis)}${ch.fehler.length ? " FEHLER: " + ch.fehler.join(" · ") : ""}`
    );
    check(
        "f: die Puffer-Bilanz zählt (pufferGeloest wuchs um ≥ 3 je Runde — Matrix+Draw mindestens)",
        Number.isFinite(out.churnGeloest) && out.churnGeloest >= ch.runden * 3 && out.churnAbgelegt >= out.churnGeloest,
        `geloest=${out.churnGeloest} abgelegt=${out.churnAbgelegt}`
    );
    check(
        "g: CHURN-SELBSTTEST — ohne Backend-Destroy BLIEBE das Leck sichtbar; der Override räumt nachweislich auf",
        out.selbsttestLeckSichtbar === true && out.selbsttestAufgeraeumt === true,
        `leckSichtbar=${out.selbsttestLeckSichtbar} aufgeraeumt=${out.selbsttestAufgeraeumt}`
    );

    if (errs.length) {
        console.error(`\n❌ ROT — ${errs.length} Verletzung(en).`);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — DER FELD-CULL URTEILT: die schwersten regionalen fscatter-Familien (geroell-" +
            "Teppich + @s:-Fernstufen) tragen das GPU-Gewand (Compute-Hüllkugel gegen die 6 Ebenen " +
            "des EINEN Frustums, atomicAdd-Kompaktierung, drawIndexedIndirect liest die " +
            "instanceCount GPU-seitig) — gemessen hin=" +
            out.hin +
            " / weg=" +
            out.weg +
            " von " +
            out.lebend +
            " lebenden Instanzen."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Feld-Cull-Diag-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
