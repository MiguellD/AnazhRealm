// diag-analog-nah.cjs — DIE NAH-LINSE (gate:analog-nah): nah und mittel ist das Studio-Mesh die Gestalt
// (AAA, nicht Kapseln), das Analog-Feld trägt erst jenseits der EINEN Nah-
// Grenze `ANALOG_NAH_M` (64 m). Die Linse fährt den ECHTEN Renderer (WebGPU/swiftshader — der Null-Renderer ist für den Analog-Pfad blind) auf der
// Mess-Wiese −900/−850 (der Takt selbst zeichnet nicht — die Linse liest die CPU-Wahrheit, welcher Satz zeichnet)
// und liest `_analogZensus` (jeder zeichnende Analog-Satz diesseits der Nah-Grenze beim NAMEN:
// Klasse · Träger · Abstand · seit wann · warum dort kein Mesh steht). Ein Satz, dessen Mesh schon übernimmt und der
// ausdithert (der Schwund, 500 ms), ist kein Befund — ein Schwund über zwei Schwund-Zeiten hängt und IST einer. Dazu
// die BRÜCKEN: ein kalter Baum < 64 m, der seine Karte voll trägt, weil seine Wunsch-Stufe lädt — eingeschwungen steht
// keine (sonst wäre ein Nah-Wald aus Karten grün).
//   S  am Ruf: zwei Wurzeln der Klumpen-Rampe — der feste Takt ruft den Karten-Bäcker, die Karte reist im Rang ihres
//      nächsten Wartenden durch die Worker-Schlange (nie Vorrats-Rang); den Nah-Gang fährt T9
//   E  Einschwingen: binnen GRENZE_E Takten steht die Welt (Bauten in der Mesh-Zone, Chunks gleich, Foundry-Schlange und
//      Karten-Bäcker leer) und 30 Takte am Stück ohne Satz — Spitze, Dauer und die Längsten beim Namen
//   R  Ruhe: RUHE Takte eingeschwungen, in keinem ein Satz < 64 m und am Ende keine Brücke < 64 m
//   T  Rampe: 400 m fort (bis der Ring dort steht), zurück — binnen GRENZE_T Takten 0 Sätze < 64 m
//   --selftest: ein erzwungener Kapsel-Satz in 20 m (ohne Träger) — die Linse wird rot und nennt ihn
//   ANALOG_NAH_PORT=… node scripts/diag-analog-nah.cjs [--selftest]
"use strict";
const { statikServer, starteBrowser, hauptLauf } = require("./lib/welt-boot.cjs");
// DER MESSORT (spec/profiband/haushalt.json `messorte`, S1 W1f): die Linse steht an der Mess-Wiese in IHREM Zustand —
// Spieler und Dorf-Zug (`dorfZug: false` = `window.__anazhAutoSettlement = false`). Mit laufendem Zug baute das Auto-Dorf
// je nach Bildrate in der Ruhe ein Haus (haus_griechisch 23,6 m, „Studio-Stufe L2 lädt") — zwei Läufe maßen zwei Welten.
const ORT = require("./lib/band-urteil.cjs").ladeSpec("wiese").ort;
const PORT = Number(process.env.ANALOG_NAH_PORT || 4477);
const SELBST = process.argv.includes("--selftest");
const GRENZE_E = 1500; // Takte bis zum ersten satzfreien Zustand nach dem Boot
const RUHE = 100; // Takte, in denen eingeschwungen kein Satz auftauchen darf
const GRENZE_T = 120; // Takte nach der Rückkehr bis 0
const server = statikServer();

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

hauptLauf(async () => {
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "linse", frist: 1800000, dumpio: false });
    // Was der Browser-Prozess über seinen GPU-Prozess sagt (Absturz, Watchdog, Verlust), reist ins Log.
    {
        const proc = browser.process();
        let gpuZeilen = 0;
        if (proc && proc.stderr)
            proc.stderr.on("data", (d) => {
                for (const z of String(d).split("\n"))
                    if (/gpu process|watchdog|crash|lost|dawn|swiftshader|vulkan/i.test(z) && gpuZeilen < 15) {
                        gpuZeilen++;
                        console.log("  [Browser] " + z.slice(0, 300));
                    }
            });
    }
    const page = await browser.newPage();
    await page.setViewport({ width: 640, height: 360 });
    // Die Linse nennt je WebGPU-Meldung der Konsole (Geräteverlust, Validierung) die Phase (die letzte [N]-Zeile) und die Zeit
    // seit dem Start (die CI fährt Dawns swiftshader); den Seiten-Fehler nennt der EINE Sammler (welt-boot).
    const t0 = Date.now();
    let phase = "boot";
    let gpuMeldungen = 0;
    page.on("console", (m) => {
        const t = m.text();
        if (t.startsWith("[N]")) {
            phase = t.slice(4, 60);
            console.log("  " + t);
        } else if (
            (m.type() === "error" || m.type() === "warning") &&
            /webgpu|gpu|dawn|device|lost/i.test(t) &&
            gpuMeldungen < 12
        ) {
            gpuMeldungen++;
            console.log(`  [GPU-Konsole] Phase „${phase}" +${Date.now() - t0} ms: ${t.slice(0, 300)}`);
        }
    });
    // Wer zerstört ein Gerät? Der Aufrufer-Stapel jedes GPUDevice.destroy reist ins Log.
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
    await page.evaluateOnNewDocument((dorfZug) => {
        if (dorfZug === false) window.__anazhAutoSettlement = false;
    }, ORT.dorfZug);
    await server.zeige(page, 60000);
    const res = await page.evaluate(
        async (k) => {
            await window.__weltDa((r) => r.state);
            if (!r || !r.state.renderer || r.state.renderer._isHeadlessNull) return { fatal: "kein echter Renderer" };
            // der Loop ruht die ganze Probe
            r.state.renderer.setAnimationLoop(null);
            r.state.renderer.setAnimationLoop = () => {};
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
            await window.__weltDa(() => !(r._foundry && !(r._foundry.ready && r._foundry.recipes)));
            // der Karten-Takt bäckt erst mit dem Renderer (`_tickKarteWelt`: rendererReady) — kam das Buch vor `renderer.init()`, war S vakuös
            await window.__weltDa(() => !(!r.state.rendererReady));
            // nach init(): fiel der r184-Renderer ohne Adapter auf WebGL2, steht das hier (kein stilles Grün)
            const backend = r._gpuComputeFaehig() ? "WebGPU" : "WebGL2-Rückfall (der Feld-Pass zeichnet nicht)";
            // S am Ruf; der Selbsttest fährt einen Takt ohne Bäcker und eine Schlange in Ankunfts-Folge
            const sProbe = (sched, tick) => {
                const wo = [], q = r._impostorBakeQueue, stubs = ["_foundryEnabled", "_ensureAssetFoundry", "_impostorAtlasTexturen", "_karteWeltBacken", "_gpuLeineStraff"];
                let bake = 0;
                r._tickImpostorBake = () => (bake++, 0);
                try { sched.call(r, r.state.playerMesh.position); } finally { delete r._tickImpostorBake; }
                // S2: die Welt-Karte bäckt im Rang ihres nächsten Wartenden (`_bedarfD2`), nie in Ankunfts-Folge; die Leine ist
                // nicht Gegenstand von S (der Takt der Linse zeichnet nicht, die Queue löst die Bilder vor dem Stopp erst mit der
                // nächsten Abgabe: imFlug 2 = gerendert 2)
                const at = { zellen: new Map([["fern", { key: "fern", _bedarfD2: 400 }], ["nah", { key: "nah", _bedarfD2: 4 }]]) };
                Object.assign(r, { _impostorBakeQueue: ["fern", "nah"], _foundryEnabled: () => true, _ensureAssetFoundry: () => ({ ready: true }), _impostorAtlasTexturen: () => true, _karteWeltBacken: (a, z) => (wo.push(z.key), null), _gpuLeineStraff: () => false });
                try { tick.call(r, at); } finally { for (const k of stubs) delete r[k]; r._impostorBakeQueue = q; }
                return { S1: bake > 0, S2: wo[0] === "nah" && wo[1] === "fern", bereit: !!r.state.rendererReady, leine: r._gpuLeineStraff(), imFlug: (r._gpuLeine || {}).imFlug, wo: wo.join(",") }; // prettier-ignore
            };
            const S = sProbe(r._runFrameScheduler, r._tickKarteWelt);
            const sBruch = k.selbst && sProbe(() => 0, function (at) { for (const n of r._impostorBakeQueue) r._karteWeltBacken(at, at.zellen.get(n)); });
            let taktFehlerN = 0,
                taktFehler1 = null;
            const tick = async () => {
                try {
                    if (r.state.world) r.state.world.timeOfDay = 0.5;
                    r._gameLoopTick(performance.now());
                } catch (e) {
                    taktFehlerN++;
                    if (!taktFehler1) taktFehler1 = String((e && e.stack) || e).split("\n").slice(0, 3).join(" | ");
                }
                await sleep(20);
            };
            const setze = (x, z) => r.state.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
            const hart = () => {
                const z = r._analogZensus();
                return z ? z.nah.filter((a) => !a.schwindet || a.haengt) : null;
            };
            const [X, Z] = k.ort;
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
                    S,
                    sBruch,
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
                        !(r._impostorBakeQueue && r._impostorBakeQueue.length)
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
                S,
                backend,
                taktFehler: { n: taktFehlerN, erster: taktFehler1 },
            };
        },
        { selbst: SELBST, grenzeE: GRENZE_E, ruhe: RUHE, grenzeT: GRENZE_T, ort: ORT.spieler }
    );
    await browser.close();
    server.close();
    if (!res || res.fatal) {
        console.log("❌ FEHLER:", res ? res.fatal : "?");
        process.exit(1);
    }
    console.log(`   Backend: ${res.backend}`);
    if (res.selbst) {
        const mit = urteil(res.z);
        const ohne = urteil(res.ohne);
        const genannt = mit.hart.some((a) => a.satz === "selbsttest:nah20" && a.d <= 20 && a.klasse === "unbekannt");
        const sOk = res.S.S1 && res.S.S2 && !res.sBruch.S1 && !res.sBruch.S2;
        console.log(`${sOk ? "✅" : "❌"} SELBST-TEST S: heil ${JSON.stringify(res.S)} · Takt ohne Bäcker und Karte ohne Rang ${JSON.stringify(res.sBruch)}`);
        const ok = sOk && res.gesetzt && genannt && !ohne.hart.some((a) => a.satz === "selbsttest:nah20");
        console.log(
            `${ok ? "✅" : "❌"} SELBST-TEST: erzwungener Kapsel-Satz in 20 m ${res.gesetzt ? "gesetzt" : "NICHT gesetzt"} → ` +
                `${genannt ? "rot und genannt" : "NICHT genannt"} (${mit.text || "-"}); nach dem Abbau ${ohne.hart.some((a) => a.satz === "selbsttest:nah20") ? "noch da" : "fort"}`
        );
        process.exit(ok ? 0 : 1);
    }
    const S = res.S.S1 && res.S.S2;
    console.log(`${S ? "✅" : "❌"} S  am Ruf: der feste Takt ruft den Karten-Bäcker ${res.S.S1} · die Karte reist im Rang des Wartenden ${res.S.S2} (Reihe ${res.S.wo || "leer"}${res.S.bereit ? "" : " — der Renderer stand nicht (rendererReady)"})`);
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
    const gruen = S && E && R && T && TF;
    console.log(
        gruen
            ? "✅ GRÜN — nah und mittel trägt das Studio-Mesh: kein Analog-Satz < 64 m nach dem Einschwingen, die Rampe kurz und benannt."
            : "❌ ROT"
    );
    process.exit(gruen ? 0 : 1);
});
