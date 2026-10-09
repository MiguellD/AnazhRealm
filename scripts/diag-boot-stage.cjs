#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-boot-stage.cjs — „VOLLE BÜHNE" ALS PRÜFBARES PRÄDIKAT + ZEITLEISTE (W2)
//
// DONE-Kriterium 2 der Studio-Paritäts-Mission („Boot ≤3 s bis volle Bühne")
// war bis W2 PROSAISCH — niemand hatte definiert, was „volle Bühne" IST, kein
// Skript maß sie. Hier ist sie ein PRÄDIKAT aus kanonischen Quellen (nichts
// hartkodiert — die Impostor-Erwartung leitet sich aus der Bibliothek ab, die
// V18.419-Auto-Blueprint-Klasse macht jede feste Zahl stale):
//   RING    _activeRingRadius ≥ Ziel (der Weitblick hängt daran)
//   GRAS    pendingGrass leer            WASSER  pendingWaterIso leer
//   STREU   `_streuWartet` 0: keine Region in Reichweite fehlt, wartet auf ihr Asset oder trägt eine offene Scheibe
//           (der stille Saug ist durch; eine fehlende Regionen-Karte heißt „der Streamer lief noch nie", nie „steht")
//   BIBLIO  Foundry ready + Prefetch fertig
//   IMPOST  Bake-Queue leer + kein Bake pending (non-headless; der Null-
//           Renderer no-opt den RTT-Bake gate-treu → Term dort übersprungen)
//   LUFT    die EINE Luftperspektive steht (scene.fogNode, Sichtweite ≥ 5 km) — die Fernform trägt die
//           Ferne, kein Lade-Nebel kappt sie (V18.530)
// Zeitleiste: t(Kontrolle) / t(Bibliothek) / t(Ring) / t(Impostoren) / t(Bühne)
// in TICKS (Mechanik-Reihenfolge, hardware-unabhängig) + Wall-Clock (Container-
// Anhalt; die Schöpfer-GPU-Zahl liefert W8). --selftest beweist die Linse feuert
// (die wartende Spieler-Region und die fehlende Regionen-Karte machen das Prädikat rot).
//   node scripts/diag-boot-stage.cjs [--selftest]
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const PORT = Number(process.env.BOOT_STAGE_PORT || 4406);
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
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
    const SELFTEST = process.argv.includes("--selftest");
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        const navT0 = Date.now();
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        const controlMs = Date.now() - navT0;
        out = await page.evaluate(async (selftest) => {
            const r = window.anazhRealm,
                st = r.state;
            const o = { terms: {}, timeline: {}, selftest: null };
            const headless = !!(st.renderer && st.renderer._isHeadlessNull);
            // ── DAS PRÄDIKAT (jeder Term aus der kanonischen Quelle) ──
            const terms = () => {
                const f = r._foundry;
                const ringTarget = Math.max(1, Math.min(12, st.chunkRingRadius || 4));
                // die EINE Antwort der Welt (`_streuWartet`): fehlend · aufgeschoben · Scheibe offen, je Region in Reichweite.
                // Befund 09.10.: der eigene Zähler las die fehlende Regionen-Karte (der Streamer lief noch nie) als „steht".
                const wartet = r._streuWartet(st.playerMesh ? st.playerMesh.position : null);
                const q = r._impostorBakeQueue;
                return {
                    ring: st._activeRingRadius != null && st._activeRingRadius >= ringTarget,
                    grass: !st.pendingGrass || st.pendingGrass.size === 0,
                    water: !st.pendingWaterIso || st.pendingWaterIso.size === 0,
                    streu: !!st.playerMesh && wartet === 0,
                    biblio: !!(f && f.ready && !f._prefetching),
                    // Headless no-opt der RTT-Bake (gate-treu) → Term übersprungen, ehrlich markiert.
                    impost: headless ? true : (!q || q.length === 0) && !r._impostorBakePending,
                    _streuWartet: wartet,
                };
            };
            const sichtM = () => (st.luft ? r._luftSichtM(st.playerMesh ? st.playerMesh.position.y : 0) : -1);
            // ── PUMPEN + MEILENSTEINE (Ticks + ms) ──
            const t0 = performance.now();
            let ticks = 0;
            const mark = {};
            const MAXT = 6000;
            while (ticks < MAXT) {
                try {
                    r._gameLoopTick();
                } catch (_e) {}
                ticks++;
                const T = terms();
                const luftSteht = !!(st.scene && st.scene.fogNode) && sichtM() >= 5000;
                if (!mark.biblio && T.biblio) mark.biblio = { ticks, ms: performance.now() - t0 };
                if (!mark.ring && T.ring) mark.ring = { ticks, ms: performance.now() - t0 };
                if (!mark.impost && T.impost && T.biblio) mark.impost = { ticks, ms: performance.now() - t0 };
                if (T.ring && T.grass && T.water && T.streu && T.biblio && T.impost && luftSteht) {
                    mark.stage = { ticks, ms: performance.now() - t0 };
                    o.terms = T;
                    break;
                }
                if (ticks % 5 === 0) await new Promise((res) => setTimeout(res, 0));
            }
            if (!mark.stage) o.terms = terms();
            o.headless = headless;
            o.sichtM = Math.round(sichtM());
            o.timeline = {
                biblio: mark.biblio || null,
                ring: mark.ring || null,
                impost: mark.impost || null,
                stage: mark.stage || null,
                totalTicks: ticks,
            };
            o.chunks = st.voxelChunks ? st.voxelChunks.size : 0;
            o.impostorRecords = r._kartenAtlas ? r._kartenAtlas.zellen.size : 0;
            // ── SELBST-TEST: die Spieler-Region wartet auf ihr Asset, und die Regionen-Karte fehlt (der Streamer lief noch
            // nie, Befund 09.10.) — beide machen das Prädikat rot. Beide Fälle stehen in jedem Lauf: schließt die Bühne,
            // steht die Spieler-Region (sie ist stets in Reichweite).
            if (selftest && mark.stage) {
                const SC = r.constructor.SCATTER;
                const p = st.playerMesh.position;
                const map = st.scatterRegions;
                const reg = map ? map.get(`${Math.floor(p.x / SC.regionM)},${Math.floor(p.z / SC.regionM)}`) : null;
                o.selftest = { spielerRegion: !!reg };
                if (reg) {
                    reg._deferredFoundry = true;
                    o.selftest.firesOnInject = terms().streu === false;
                    delete reg._deferredFoundry;
                }
                delete st.scatterRegions;
                o.selftest.firesOhneKarte = terms().streu === false;
                st.scatterRegions = map;
                o.selftest.healsOnClean = terms().streu === true;
                // die Bühnen-Wahrheit der Welt (`_buehneSteht`, das Prädikat live) liest dieselbe Antwort: ohne Regionen-Karte
                // steht sie nicht, mit ihr steht sie — nicht-headless gerechnet; Latch, Uhr und Renderer-Marke kehren zurück
                {
                    const merk = { h: st.renderer._isHeadlessNull, latch: st._buehneStand, t0: r._buehneT0 };
                    const frag = (ohneKarte, gedeckelt) => {
                        st.renderer._isHeadlessNull = false;
                        st._buehneStand = false;
                        // die Uhr beginnt in `_buehneSteht` neu — oder sie steht weit hinter dem Deckel
                        r._buehneT0 = gedeckelt ? -Infinity : null;
                        if (ohneKarte) delete st.scatterRegions;
                        const steht = r._buehneSteht();
                        st.scatterRegions = map;
                        return steht;
                    };
                    o.selftest.buehneOhneKarte = frag(true);
                    o.selftest.buehneMitKarte = frag(false);
                    // der Deckel öffnet LAUT: ohne Regionen-Karte und hinter BUEHNE_SETTLE_CAP_MS steht die Bühne, und das Log
                    // nennt die Lücke (WARN „Die Bühne steht ohne: … Wald-Stücke …")
                    const warnt = () => st.logBuffer.slice(-30).filter((z) => /Bühne steht ohne: .*Wald-Stücke/.test(z)).length;
                    const w0 = warnt();
                    o.selftest.deckelSteht = frag(true, true);
                    o.selftest.deckelWarnt = warnt() > w0;
                    st.renderer._isHeadlessNull = merk.h;
                    st._buehneStand = merk.latch;
                    r._buehneT0 = merk.t0;
                }
                // ── W4.3 — DER BAKE-WATCHDOG (die 0/115-Wurzel): ein hängender async RTT-Bake
                // (Readback resolvt nie) würde den IMPOST-Term dieser Bühne FÜR IMMER deadlocken.
                // Simulation: pending klemmt „seit 20 s" auf einem frischen Record → EIN Tick muss
                // ihn graziös verwerfen (gescheitert + pending frei + Token entwertet die späte finally).
                {
                    const A2 = window.AnazhRealm || r.constructor;
                    const prevPending = r._impostorBakePending;
                    const prevSince = r._impostorBakePendingSince;
                    const prevKey = r._impostorBakePendingKey;
                    const prevTok = r._impostorBakeTok;
                    const zellen = r._kartenAtlas ? r._kartenAtlas.zellen : null;
                    const anyKey = zellen && zellen.size ? Array.from(zellen.keys())[0] : null;
                    const anyRec = anyKey ? zellen.get(anyKey) : null;
                    const prevFailed = anyRec ? anyRec.gescheitert : null;
                    if (anyRec && !r._impostorBakeQueue) r._impostorBakeQueue = [];
                    if (anyRec) {
                        r._impostorBakeQueue.push("__wd_dummy"); // Queue nicht-leer (der Tick läuft an)
                        r._impostorBakePending = true;
                        r._impostorBakePendingSince = performance.now() - (A2.IMPOSTOR_BAKE_TIMEOUT_MS + 5000);
                        r._impostorBakePendingKey = anyKey;
                        const prevTries = anyRec.versuche;
                        const tokBefore = r._impostorBakeTok || 0;
                        r._tickImpostorBake();
                        o.watchdog = {
                            pendingCleared: r._impostorBakePending === false,
                            // V18.464 (baum-D7, Lehre 6 — die Linse wandert mit): der Watchdog
                            // verwirft graziös MIT bounded Retry — der erste Hänger RE-QUEUED den
                            // Schlüssel (versuche<3), erst der dritte wird terminal gescheitert.
                            // BEIDE Dispositionen sind die gesunde Wand (nie still verhungern).
                            recDisposed:
                                anyRec.gescheitert === true || r._impostorBakeQueue.indexOf(anyKey) >= 0,
                            tokenBumped: (r._impostorBakeTok || 0) > tokBefore,
                        };
                        // WIEDERHERSTELLEN (die Gate-Hook-Lehre)
                        const qi = r._impostorBakeQueue.indexOf("__wd_dummy");
                        if (qi >= 0) r._impostorBakeQueue.splice(qi, 1);
                        const qk = r._impostorBakeQueue.indexOf(anyKey);
                        if (qk >= 0) r._impostorBakeQueue.splice(qk, 1);
                        anyRec.gescheitert = prevFailed;
                        anyRec.versuche = prevTries;
                        r._impostorBakePending = prevPending;
                        r._impostorBakePendingSince = prevSince;
                        r._impostorBakePendingKey = prevKey;
                        r._impostorBakeTok = prevTok;
                    }
                }
            }
            return o;
        }, SELFTEST);
        out.controlMs = controlMs;
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    if (!out || out.__err) {
        console.log(`⛔ Bühnen-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }
    const tl = out.timeline;
    const fm = (m) => (m ? `Tick ${m.ticks} · ${(m.ms / 1000).toFixed(1)} s` : "— (nicht erreicht)");
    console.log(
        "\n=== VOLLE BÜHNE — das Prädikat + die Zeitleiste (headless-Mechanik; Wall-Clock = Container-Anhalt) ==="
    );
    console.log(`  t(Kontrolle)   nav→Loop ${(out.controlMs / 1000).toFixed(1)} s`);
    console.log(`  t(Bibliothek)  ${fm(tl.biblio)}`);
    console.log(`  t(Ring)        ${fm(tl.ring)}`);
    console.log(
        `  t(Impostoren)  ${fm(tl.impost)}${out.headless ? "  (headless: RTT-Term übersprungen, gate-treu)" : ""}`
    );
    console.log(
        `  t(BÜHNE)       ${fm(tl.stage)}   (${out.chunks} Chunks · ${out.impostorRecords} Impostor-Records · Sichtweite ${out.sichtM} m)`
    );
    const T = out.terms;
    const checks = [
        { name: `RING erreicht Ziel (${T.ring})`, pass: T.ring === true },
        {
            name: `GRAS aufgeholt (${T.grass}) · WASSER aufgeholt (${T.water})`,
            pass: T.grass === true && T.water === true,
        },
        {
            name: `STREU steht — keine Region in Reichweite fehlt, wartet oder trägt eine offene Scheibe (\`_streuWartet\` ${T._streuWartet})`,
            pass: T.streu === true,
        },
        {
            name: `BIBLIOTHEK warm (${T.biblio}) · IMPOSTOREN idle (${T.impost})`,
            pass: T.biblio === true && T.impost === true,
        },
        { name: "die BÜHNE wurde erreicht (das Prädikat schloss)", pass: !!tl.stage },
    ];
    if (SELFTEST) {
        const s = out.selftest || {};
        checks.push({
            name:
                "SELBST-TEST: die wartende Spieler-Region und die fehlende Regionen-Karte machen das Prädikat rot + es heilt " +
                `(Spieler-Region ${s.spielerRegion ? "steht" : "FEHLT beim Schluss der Bühne"} · wartet → ${s.firesOnInject ? "rot" : "STUMPF"} · ohne Karte → ${s.firesOhneKarte ? "rot" : "STUMPF"} · heilt ${!!s.healsOnClean})`,
            pass: !!(s.spielerRegion && s.firesOnInject && s.firesOhneKarte && s.healsOnClean),
        });
        checks.push({
            name: `SELBST-TEST: die Bühnen-Wahrheit der Welt (\`_buehneSteht\`) liest dieselbe Streu — ohne Regionen-Karte ${s.buehneOhneKarte === false ? "steht sie nicht" : "STEHT sie"}, mit ihr ${s.buehneMitKarte ? "steht sie" : "steht sie NICHT"}`,
            pass: s.buehneOhneKarte === false && s.buehneMitKarte === true,
        });
        checks.push({
            name: `SELBST-TEST: der Deckel der Bühne öffnet laut — ohne Regionen-Karte hinter BUEHNE_SETTLE_CAP_MS ${s.deckelSteht ? "steht sie" : "steht sie NICHT"}, das Log ${s.deckelWarnt ? "nennt die Lücke (WARN)" : "SCHWEIGT"}`,
            pass: s.deckelSteht === true && s.deckelWarnt === true,
        });
        checks.push({
            name: `W4.3 BAKE-WATCHDOG: ein hängender Bake wird graziös verworfen (pending frei · Retry/gescheitert · Token) — die Queue kann nie mehr still verhungern (${JSON.stringify(out.watchdog || null)})`,
            pass: !!(out.watchdog && out.watchdog.pendingCleared && out.watchdog.recDisposed && out.watchdog.tokenBumped),
        });
    }
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Bühnen-Invarianten OK.`);
    if (fails) {
        console.log("⛔ Die volle Bühne steht nicht (oder die Linse ist stumpf) — Kriterium 2 ist nicht abnehmbar.");
        process.exit(1);
    }
    console.log(`✅ „Volle Bühne" ist jetzt ein Prädikat mit Zeitleiste — Kriterium 2 ist messbar.`);
    process.exit(0);
})();
