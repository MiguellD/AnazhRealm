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
// Zeitleiste: t(Weltbild) / t(Bibliothek) / t(Ring) / t(Impostoren) / t(Bühne)
// in TICKS (Mechanik-Reihenfolge, hardware-unabhängig) + Wall-Clock (Container-
// Anhalt; die Schöpfer-GPU-Zahl liefert W8). t(Weltbild) liest `state._weltbildDa` (ab Navigation: der Ladeschirm hält
// jede Taste, also ist das die Kontrolle — bis K30 maß die Linse die Existenz von `_gameLoopTick`). --selftest beweist
// die Linse feuert (die wartende Spieler-Region und die fehlende Regionen-Karte machen das Prädikat rot).
//   node scripts/diag-boot-stage.cjs [--selftest]
//
// DIE KALT-ZEILE (K30, Pflicht-OFFEN B): `--kalt` bootet mit echtem Renderer und LEEREM Profil (IDB leer, wie nach jedem
// Versions-Update) und nennt je Sekunde der Ankunft, worauf das erste Weltbild wartet (`_weltbildFehlt`), wie lange der
// Haupt-Thread blockiert war (Langaufgaben; benannt: Boden, Streu, Bauten, Gruppen-Bau, Buch und der Erst-Bau der Zeichnung
// aus `_erstZeichnung` — Knoten- und Pipeline-Bau des ersten Draws), wie viele Pipelines offen sind, in welcher Phase der
// Vorrat steht (sein Merker `f._vorrat` wörtlich: „wartet auf das erste Bild" · „bestellt" — nie „läuft" aus einem
// Merker, der nur „an" sagt) und was die Foundry-Schlange trägt; der Adapter kommt vom Gerät (`device.adapterInfo`). Urteil: t(Weltbild)
// ≤ 5 s und kein halbes Weltbild (kein „steht ohne" im Log). Ohne `--echt` swiftshader (das Spiel wählt kienspan), mit
// `--echt` die Hardware-GPU im Fenster (1920×1080) — die Zeit richtet der OMEN an beiden Messplätzen.
//   node scripts/diag-boot-stage.cjs --kalt [--echt] [--sek 120] [--json datei] [--bild ankunft.png]
// ─────────────────────────────────────────────────────────────────────────
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = Number(process.env.BOOT_STAGE_PORT || 4406);
const ARGV = process.argv.slice(2);
const OPT = (k, d) => {
    const i = ARGV.indexOf(k);
    return i >= 0 ? ARGV[i + 1] : d;
};
// Das Soll der Ankunft (docs/PFLICHT-OFFEN.md B, roadmap §0.v1 Schritt 1): kalt bis Kontrolle ≤ 5 s.
const ANKUNFT_SOLL_MS = 5000;
const server = statikServer();

// ── DIE KALT-ZEILE (`--kalt`): die Probe je 200 ms in der Seite, ab dem ersten Skript ──
function KALT_PROBE() {
    const A = (window.__kalt = { proben: [], lang: [], ev: [] });
    try {
        new PerformanceObserver((l) => {
            for (const e of l.getEntries()) A.lang.push([Math.round(e.startTime), Math.round(e.duration)]);
        }).observe({ type: "longtask", buffered: true });
    } catch (_e) {
        A.ohneLang = true;
    }
    let gewickelt = false;
    // die Haupt-Thread-Zeit je Sekunde der schweren Ankunfts-Arbeiter (synchron gemessen; verschachtelt zählt doppelt)
    A.kosten = {};
    const KOSTEN = {
        _buildVoxelChunkDataFromWorkerMesh: "Boden",
        _buildVoxelChunkData: "Boden",
        _scatterRegion: "Streu",
        _rebuildArchitectureMesh: "Bauten",
        _foundryBuildGroup: "Gruppen-Bau",
        _foundryIngestBook: "Buch",
    };
    const wickleKosten = (P) => {
        for (const name of Object.keys(KOSTEN)) {
            const alt = P[name];
            if (typeof alt !== "function") continue;
            P[name] = function (...a) {
                const t0 = performance.now();
                try {
                    return alt.apply(this, a);
                } finally {
                    const t1 = performance.now();
                    const k = KOSTEN[name];
                    const s = Math.floor(t0 / 1000);
                    const z = A.kosten[k] || (A.kosten[k] = {});
                    z[s] = (z[s] || 0) + (t1 - t0);
                    if (name === "_foundryIngestBook" && !A.buchDa) A.buchDa = Math.round(t1);
                }
            };
        }
    };
    const wickle = (r) => {
        const P = Object.getPrototypeOf(r);
        wickleKosten(P);
        // die Bestellungen des Vorrats beim Namen (Wagen, Siedlungs-Probe); WANN er wartet und bestellt, sagt sein Merker
        // (`f._vorrat`) — der Aufruf von `_foundryPrefetchLibrary` beim Worker-Start ist nie sein Bestell-Beginn (K30-N1)
        for (const name of ["_foundryVorrat", "_foundryRequestSettlement"]) {
            const alt = P[name];
            if (typeof alt !== "function") continue;
            P[name] = function (...a) {
                const id = name === "_foundryVorrat" ? `${a[0]}|${a[1]}` : "";
                A.ev.push([Math.round(performance.now()), name + " ab", id]);
                const x = alt.apply(this, a);
                if (x && typeof x.then === "function")
                    x.then(() => A.ev.push([Math.round(performance.now()), name + " an", id]));
                return x;
            };
        }
    };
    setInterval(() => {
        const r = window.anazhRealm;
        const o = { t: Math.round(performance.now()) };
        if (r && r.state) {
            if (!gewickelt) {
                gewickelt = true;
                wickle(r);
            }
            try {
                o.fehlt = r._weltbildFehlt();
            } catch (e) {
                o.fehlt = ["Probe warf: " + e.message];
            }
            const f = r._foundry;
            if (f) {
                o.vorrat = f._vorrat || null; // die Phase wörtlich (VORRAT_PHASE), null = steht nicht an oder ist durch
                let werk = 0;
                for (const k of (f.pending && f.pending.keys()) || []) if (!String(k).startsWith("imp")) werk++;
                o.schlange = `${(f.warte || []).length} wartend · ${werk} im Werk · ${(f.pending ? f.pending.size : 0) - werk} im Bäcker`;
            }
            // der Erst-Bau der Zeichnung (der Stamm zählt ihn selbst, `_erstZeichnung`): Bauten · ms Haupt-Thread · offene Pipelines
            const E = r._erstZeichnung;
            if (E) o.erst = [E.bauN, Math.round(E.bauMs), E.offen ? E.offen.size : 0];
            o.da = r.state._weltbildDa ? Math.round(r.state._weltbildDa) : 0;
        }
        A.proben.push(o);
    }, 200);
}

async function kaltLauf() {
    const ECHT = ARGV.includes("--echt");
    const SEK = Number(OPT("--sek", 120));
    // ohne `--echt` die EINE Weiche (K40: lokal der Hardware-Adapter, die CI swiftshader, `LINSE_GPU=software` der Rückweg),
    // und der Lauf nennt seinen Adapter, damit keine Kalt-Zeile ein swiftshader-Ergebnis als Radeon ausgibt
    const { linsenWebGpuArgs, echteWebGpuArgs, adapterZeile } = require("./lib/software-gpu.cjs");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    // DIE ZWEIT-ZEILE (1310-16): `--profil <ordner>` hält das Profil (die Foundry-Platte, der HTTP-Cache) über den Lauf hinaus —
    // der erste Lauf in einem neuen Ordner ist kalt, jeder weitere ein Zweit-Boot; ohne die Option ein leeres Wegwerf-Profil.
    const profilBenannt = OPT("--profil", null);
    const zweit = !!(profilBenannt && fs.existsSync(profilBenannt));
    const profil = profilBenannt ? path.resolve(profilBenannt) : fs.mkdtempSync(path.join(os.tmpdir(), "kalt-zeile-"));
    fs.mkdirSync(profil, { recursive: true });
    const browser = await puppeteer.launch({
        headless: !ECHT,
        userDataDir: profil,
        protocolTimeout: 600000,
        defaultViewport: ECHT ? { width: 1920, height: 1080, deviceScaleFactor: 1 } : { width: 1280, height: 720 },
        args: ECHT ? [...echteWebGpuArgs(), "--window-size=1940,1200"] : linsenWebGpuArgs(),
    });
    await adapterZeile(browser);
    let out = null;
    try {
        const page = await browser.newPage();
        await page.evaluateOnNewDocument(KALT_PROBE);
        const t0 = Date.now();
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 120000 });
        while (Date.now() - t0 < SEK * 1000) {
            await new Promise((r) => setTimeout(r, 500));
            const da = await page
                .evaluate(() => (window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state._weltbildDa) || 0)
                .catch(() => 0);
            if (da) break;
        }
        // DAS BILD DER ANKUNFT (`--bild datei.png`): der erste Blick des Spielers aus dem Ausgabe-Pfad
        // (scripts/lib/ausgabe-aufnahme.cjs), der Loop ruht, die Bühne hält Mittag · Sonne · Sommer.
        const bildDatei = OPT("--bild", null);
        let bildInfo = null;
        if (bildDatei) {
            const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
            await page.evaluate(AUSGABE_INSTALL);
            bildInfo = await page.evaluate(
                async (W, H) => {
                    const r = window.anazhRealm;
                    if (!r || !r.state._weltbildDa) return { fehlt: "kein Weltbild" };
                    r.state.renderer.setAnimationLoop(null);
                    window.__buehne();
                    let auf = null;
                    for (let i = 0; i < 2; i++) {
                        r._schattenAlleNeu();
                        auf = await window.__ausgabeAufnahme(W, H, 1);
                    }
                    const cv = document.createElement("canvas");
                    cv.width = W;
                    cv.height = H;
                    const ctx = cv.getContext("2d");
                    const img = ctx.createImageData(W, H);
                    img.data.set(auf.u8.subarray(0, W * H * 4));
                    ctx.putImageData(img, 0, 0);
                    return { dc: auf.info.drawCalls, dreiecke: auf.info.triangles, png: cv.toDataURL("image/png") };
                },
                ECHT ? 960 : 640,
                ECHT ? 540 : 360
            );
            if (bildInfo && bildInfo.png) {
                fs.writeFileSync(path.resolve(bildDatei), Buffer.from(bildInfo.png.split(",")[1], "base64"));
                delete bildInfo.png;
            }
        }
        out = await page.evaluate(() => {
            const r = window.anazhRealm;
            const st = (r && r.state) || {};
            // der Adapter vom Gerät, das zeichnet: r184 hält den Adapter nicht (WebGPUBackend.init, lokal) — bis K30-N1 las die
            // Zeile `backend.adapter.info` und schrieb in jeder echten Rohdatei null
            let adapter = null;
            try {
                const i = st.renderer.backend.device.adapterInfo;
                adapter = [i.vendor, i.architecture, i.device, i.description].filter(Boolean).join(" ") || null;
            } catch (_e) {}
            return Object.assign({}, window.__kalt, {
                weltbildDa: st._weltbildDa ? Math.round(st._weltbildDa) : null,
                holz: st._holzProfil || null,
                version: r && r.constructor && r.constructor.VERSION,
                adapter,
                ohne: (st.logBuffer || []).filter((z) => /Das erste Weltbild steht ohne/.test(z)),
            });
        });
        if (bildInfo) out.bild = Object.assign({ datei: path.resolve(bildDatei) }, bildInfo);
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();
    if (!profilBenannt)
        try {
            fs.rmSync(profil, { recursive: true, force: true });
        } catch (_e) {}
    if (out && !out.__err) out.zweit = zweit;
    if (!out || out.__err) {
        console.log(`⛔ Kalt-Zeile fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }
    const json = OPT("--json", null);
    if (json) fs.writeFileSync(json, JSON.stringify(out, null, 1));
    // je Sekunde: der Stand am Ende der Sekunde (die letzte Probe) und die blockierten ms des Haupt-Threads
    const proben = out.proben || [];
    const ende = Math.max(out.weltbildDa || 0, proben.length ? proben[proben.length - 1].t : 0);
    const S = Math.ceil(ende / 1000);
    const blockiert = new Array(S + 1).fill(0);
    for (const [s, d] of out.lang || []) {
        for (let a = s; a < s + d; ) {
            const k = Math.floor(a / 1000);
            const b = Math.min(s + d, (k + 1) * 1000);
            if (k <= S) blockiert[k] += b - a;
            a = b;
        }
    }
    console.log(
        `\n=== DIE ${out.zweit ? "ZWEIT-ZEILE (Profil mit Platte)" : "KALT-ZEILE (leeres Profil)"} — ${ECHT ? "echte GPU" : "swiftshader"} · ${out.adapter || "Adapter ?"} · ` +
            `Holz ${out.holz} · V${out.version} ===`
    );
    let letzte = null;
    // der Erst-Bau je Sekunde = Zuwachs des Stamm-Zählers seit der letzten Probe (er wächst nur); eine Sekunde ganz ohne Probe
    // (der Haupt-Thread hielt sie) zählt in die nächste Sekunde mit Probe
    let erstVor = 0;
    for (let s = 0; s < S; s++) {
        const inS = proben.filter((p) => Math.floor(p.t / 1000) === s);
        if (inS.length) letzte = inS[inS.length - 1];
        const q = letzte || {};
        const erstMs = q.erst ? q.erst[1] - erstVor : 0;
        if (q.erst) erstVor = q.erst[1];
        const gruende = q.da && q.da < (s + 1) * 1000 ? "— das Weltbild steht" : (q.fehlt || ["die Seite lädt"]).join(" · ");
        const kosten = Object.entries(out.kosten || {})
            .map(([k, z]) => [k, Math.round(z[s] || 0)])
            .concat([["Erst-Bau", Math.round(erstMs)]])
            .filter(([, ms]) => ms >= 5)
            .map(([k, ms]) => `${k} ${ms}`)
            .join(" · ");
        console.log(
            `  ${String(s).padStart(3)} s  blockiert ${String(Math.round(blockiert[s])).padStart(4)} ms` +
                (kosten ? ` (${kosten})` : "") +
                `${q.erst && q.erst[2] ? ` · ${q.erst[2]} Pipelines offen` : ""}${q.vorrat ? ` · Vorrat ${q.vorrat}` : ""}` +
                `${q.schlange ? ` · Foundry ${q.schlange}` : ""} | ${gruende}`
        );
    }
    if (out.buchDa) console.log(`  ${(out.buchDa / 1000).toFixed(1)} s  das Buch der Studios ist da`);
    // die Phasen des Vorrats, wie sein Merker sie nennt (je Wechsel die erste Probe)
    let phase = null;
    for (const p of proben) {
        if (!("vorrat" in p) || p.vorrat === phase) continue;
        if (p.vorrat || phase) console.log(`  ${(p.t / 1000).toFixed(1)} s  der Vorrat ${p.vorrat || "ist durch"}`);
        phase = p.vorrat;
    }
    for (const [t, was, id] of out.ev || []) if (!/_foundryVorrat/.test(was)) console.log(`  ${(t / 1000).toFixed(1)} s  ${was} ${id}`);
    const wagen = (out.ev || []).filter((e) => e[1] === "_foundryVorrat an").map((e) => e[0]);
    if (wagen.length) console.log(`  ${(Math.max(...wagen) / 1000).toFixed(1)} s  der Vorrat der Wagen steht (${wagen.length})`);
    if (out.bild) console.log(`  das Bild der Ankunft: ${out.bild.datei || out.bild.fehlt} (${out.bild.dc} Befehle · ${out.bild.dreiecke} Dreiecke)`);
    const t = out.weltbildDa;
    const halb = out.ohne && out.ohne.length ? out.ohne[0] : null;
    console.log(`\n  t(Weltbild) = t(Kontrolle) ${t != null ? (t / 1000).toFixed(2) + " s" : "— (nicht erreicht)"} ab Navigation`);
    const gut = t != null && t <= ANKUNFT_SOLL_MS && !halb;
    if (halb) console.log(`  ❌ das halbe Weltbild: ${halb}`);
    console.log(
        `  ${gut ? "✅" : "❌"} die Ankunft kalt ≤ ${ANKUNFT_SOLL_MS / 1000} s ohne halbes Weltbild (Pflicht-OFFEN B) — ` +
            `${t != null ? (t / 1000).toFixed(2) + " s" : "nicht erreicht"}`
    );
    process.exit(gut ? 0 : 1);
}

(async () => {
    if (ARGV.includes("--kalt")) return kaltLauf();
    const SELFTEST = process.argv.includes("--selftest");
    await new Promise((r) => server.listen(PORT, r));
    const browser = await starteBrowser({ art: "null", frist: 300000 });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
    });
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        // t(Weltbild) aus der Welt selbst: der Moment, in dem der Ladeschirm weicht (`state._weltbildDa`, ab Navigation).
        await page.waitForFunction(() => window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state._weltbildDa, {
            timeout: 120000,
        });
        const controlMs = await page.evaluate(() => window.anazhRealm.state._weltbildDa);
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
                    biblio: !!(f && f.ready && !f._vorrat),
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
    console.log(
        `  t(Weltbild)    ${(out.controlMs / 1000).toFixed(1)} s ab Navigation (state._weltbildDa = t(Kontrolle); der ` +
            "Null-Renderer zeigt kein Bild und setzt es beim Renderer-Bau — die Kalt-Zeile mit echtem Renderer: --kalt)"
    );
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
