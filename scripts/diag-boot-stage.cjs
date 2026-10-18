#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-boot-stage.cjs — DIE BÜHNE (W2) und DIE KALT-ZEILE (K30, Pflicht-OFFEN B)
//
// DIE BÜHNE (Null-Renderer, `--selftest` = gate:boot-stage): der Takt pumpt, bis die EINE Bühnen-Wahrheit der Welt steht
// (`_buehneSteht`, mit Renderer gefragt: Ring · Gras · Wasser · Streu `_streuWartet` 0) — die Linse rechnet kein eigenes
// Prädikat (S2: der Zwilling fiel); die wartende Spieler-Region und die fehlende Regionen-Karte machen sie rot, der Deckel
// öffnet laut, dazu der Selbsttest der Kontrolle (rein).   node scripts/diag-boot-stage.cjs [--selftest]
//
// DIE KALT-ZEILE: `--kalt` bootet mit echtem Renderer und LEEREM Profil (IDB leer, wie nach jedem Versions-Update) und nennt
// je Sekunde, worauf das erste Weltbild wartet (`_weltbildFehlt`), die blockierten ms des Haupt-Threads (benannt: Boden,
// Streu, Bauten, Gruppen-Bau, Buch, Ort-Wahl, Dorf und der Erst-Bau der Zeichnung aus `_erstZeichnung`), offene Pipelines,
// die Phase des Vorrats (`f._vorrat` wörtlich) und die Foundry-Schlange; der Adapter vom Gerät (`device.adapterInfo`).
// Urteil VON AUSSEN (S2): t(Kontrolle) ≤ 5 s ohne halbes Weltbild (`kontrolleZeit`). Ohne `--echt` swiftshader, mit `--echt`
// die Hardware-GPU (1920×1080); `--bild` schreibt das erste Bild nach der Kontrolle, wie der Spieler es sieht.
//   node scripts/diag-boot-stage.cjs --kalt [--echt] [--sek 120] [--json datei] [--bild ankunft.png]
// ─────────────────────────────────────────────────────────────────────────
const { statikServer, starteBrowser, nullRenderer } = require("./lib/welt-boot.cjs");
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

// t(KONTROLLE) UND DAS HALBE WELTBILD — DER RICHTER STEHT AUSSEN (S2, W9; rein, aus der Rohdatei der Kalt-Zeile): t ist das
// erste präsentierte Bild (`frames`, je `getCurrentTexture` der Leinwand) ab der ersten Eingabe, die die Welt annimmt (`eingabe`:
// eine echte Taste des Browsers kommt am Fänger des Ladeschirms vorbei, ms ab Navigation); „halb" ist der Bild-Unterschied
// (`blockAnteil`) des ersten Bilds nach der Kontrolle gegen das Rundum-Bild derselben Kamera (`halbDiff` über HALB_ANTEIL),
// ungemessen ist halb. Die Zeit, die der Stamm über sich schreibt (`_weltbildDa`), und seine WARN-Zeile urteilen nie.
const HALB_ANTEIL = 0.1;
const RUHE_ANTEIL = 0.02; // zwei Schirme in Folge, die sich in höchstens so vielen Blöcken unterscheiden, sind das Rundum-Bild
const AU = require("./lib/abnahme-urteil.cjs");
function kontrolleZeit(out) {
    const t = out.eingabe != null ? (out.frames || []).find((f) => f >= out.eingabe) : undefined;
    if (t == null) return { t: null, halb: null };
    const d = out.halbDiff;
    if (d == null) return { t, halb: `ungemessen — ${out.halbOhne || "kein Rundum-Bild"}` };
    return { t, halb: d > HALB_ANTEIL ? `${Math.round(d * 100)} % der Blöcke ändern sich bis zum Rundum-Bild` : null };
}
// DER SELBSTTEST DER KONTROLLE (rein): ein gefälschtes `_weltbildDa` und eine WARN-Zeile ohne Bild-Befund ändern das Urteil
// nicht; ein halbes Bild ohne WARN-Zeile ist halb, ein fehlendes Rundum-Bild auch.
function kontrolleSelbsttest() {
    const v = [];
    const roh = { weltbildDa: 9000, ohne: [], eingabe: 9000, frames: [8100, 8990, 9016, 9033], halbDiff: 0.01 };
    const fall = (was, aend, soll) => {
        const k = kontrolleZeit(Object.assign({}, roh, aend));
        const s = (x) => (x == null ? "—" : (x / 1000).toFixed(2) + " s");
        if (k.t !== soll.t) v.push(`${was}: t(Kontrolle) ${s(k.t)} statt ${s(soll.t)}`);
        if (!!k.halb !== soll.halb) v.push(`${was}: halb ${k.halb ? `„${k.halb}"` : "nein"} statt ${soll.halb ? "ja" : "nein"}`);
    };
    fall("die echte Ankunft", {}, { t: 9016, halb: false });
    fall("ein gefälschtes _weltbildDa (1 ms)", { weltbildDa: 1 }, { t: 9016, halb: false });
    fall("die WARN-Zeile ohne Bild-Befund", { ohne: ["Das erste Weltbild steht ohne: Baum — die Arbeit ruhte"] }, { t: 9016, halb: false });
    fall("das halbe Bild ohne WARN-Zeile", { halbDiff: 0.4 }, { t: 9016, halb: true });
    fall("kein Rundum-Bild", { halbDiff: null }, { t: 9016, halb: true });
    fall("keine Eingabe angenommen", { eingabe: null }, { t: null, halb: false });
    // das Erscheinen gegen den Zug (`blockAnteil` schritt, zwei Blöcke 16×16): ein Block, der in EINEM Schritt kommt, zählt; einer,
    // der in zehn Schritten zu je 8 driftet (Wolke, Belichtung), nicht — derselbe Unterschied 80
    const bild = (a, b) => ({ w: 32, h: 16, d: Uint8Array.from({ length: 32 * 16 * 4 }, (_, i) => (i % 128 < 64 ? a : b)) });
    const anteil = AU.blockAnteil(bild(0, 0), bild(80, 80), Float32Array.of(240, 24));
    if (anteil !== 0.5) v.push(`das Erscheinen gegen den Zug: ${anteil} der Blöcke statt 0,5`);
    return v;
}
const server = statikServer();

// ── DIE KALT-ZEILE (`--kalt`): die Probe je 200 ms in der Seite, ab dem ersten Skript ──
function KALT_PROBE() {
    const A = (window.__kalt = { proben: [], lang: [], ev: [], frames: [], eingabe: null });
    // DIE KONTROLLE VON AUSSEN (S2): die erste echte Taste, die der Fänger des Ladeschirms (Capture am Fenster) durchlässt, bei
    // einem Spieler (vor ihm steht kein Fänger und nichts zu steuern); dazu die präsentierten Bilder (die letzten 32 davor, 8 danach)
    document.addEventListener(
        "keydown",
        (e) => {
            const r = window.anazhRealm;
            if (A.eingabe == null && e.isTrusted && r && r.state && r.state.playerMesh) A.eingabe = Math.round(performance.now());
        },
        true
    );
    const gct = typeof GPUCanvasContext !== "undefined" && GPUCanvasContext.prototype.getCurrentTexture;
    let nach = 0;
    if (gct)
        GPUCanvasContext.prototype.getCurrentTexture = function () {
            if (A.eingabe == null || nach++ < 8) A.frames.push(Math.round(performance.now()));
            if (A.frames.length > 40) A.frames.shift();
            return gct.call(this);
        };
    // der erste Asset-Auftrag an einen Studio-Faden (B3a: bis dahin ruht die Werkstatt)
    const post = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (m, t) {
        if (!A.auftrag && m && m.type === "build-asset") A.auftrag = Math.round(performance.now());
        return post.call(this, m, t);
    };
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
        _ortWahlScheibe: "Ort-Wahl",
        _spawnSettlementSlot: "Dorf",
    };
    // dazu die Bestellungen des Vorrats beim Namen (Wagen, Siedlungs-Probe); WANN er wartet und bestellt, sagt sein Merker
    // (`f._vorrat`) — der Aufruf von `_foundryPrefetchLibrary` beim Worker-Start ist nie sein Bestell-Beginn (K30-N1)
    const wickle = (P) => {
        for (const name of [...Object.keys(KOSTEN), "_foundryVorrat", "_foundryRequestSettlement"]) {
            const alt = P[name];
            if (typeof alt !== "function") continue;
            const k = KOSTEN[name];
            P[name] = function (...a) {
                const t0 = performance.now();
                const id = name === "_foundryVorrat" ? `${a[0]}|${a[1]}` : "";
                if (!k) A.ev.push([Math.round(t0), name + " ab", id]);
                try {
                    const x = alt.apply(this, a);
                    if (!k && x && typeof x.then === "function") x.then(() => A.ev.push([Math.round(performance.now()), name + " an", id]));
                    return x;
                } finally {
                    const t1 = performance.now();
                    const z = k ? A.kosten[k] || (A.kosten[k] = {}) : null;
                    if (z) z[Math.floor(t0 / 1000)] = (z[Math.floor(t0 / 1000)] || 0) + (t1 - t0);
                    if (name === "_foundryIngestBook" && !A.buchDa) A.buchDa = Math.round(t1);
                }
            };
        }
    };
    setInterval(() => {
        const r = window.anazhRealm;
        const o = { t: Math.round(performance.now()) };
        if (r && r.state) {
            if (!gewickelt) {
                gewickelt = true;
                wickle(Object.getPrototypeOf(r));
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
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    // DIE ZWEIT-ZEILE (1310-16): `--profil <ordner>` hält das Profil (die Foundry-Platte, der HTTP-Cache) über den Lauf hinaus —
    // der erste Lauf in einem neuen Ordner ist kalt, jeder weitere ein Zweit-Boot; ohne die Option ein leeres Wegwerf-Profil.
    const profilBenannt = OPT("--profil", null);
    const zweit = !!(profilBenannt && fs.existsSync(profilBenannt));
    const profil = profilBenannt ? path.resolve(profilBenannt) : fs.mkdtempSync(path.join(os.tmpdir(), "kalt-zeile-"));
    fs.mkdirSync(profil, { recursive: true });
    const browser = await starteBrowser({
        art: ECHT ? "echt" : "linse",
        headless: !ECHT,
        profil,
        frist: 600000,
        viewport: ECHT ? { width: 1920, height: 1080, deviceScaleFactor: 1 } : { width: 1280, height: 720 },
        zusatz: ECHT ? ["--window-size=1940,1200"] : [],
    });
    let out = null;
    try {
        const page = await browser.newPage();
        await page.evaluateOnNewDocument(KALT_PROBE);
        const t0 = Date.now();
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 120000 });
        // DIE KONTROLLE VON AUSSEN: je 100 ms eine echte Taste (F24, kein Wort des Spiels) über die Eingabe des Browsers, bis
        // die Welt eine annimmt; dann das erste Bild und die Bilder, bis zwei in Folge ruhen (das Rundum-Bild derselben Kamera).
        // Der Schirm-Schuss trägt nur auf der echten GPU die Leinwand (gate:weltbild-frost B: der swiftshader-Lauf nicht).
        let tasten = true;
        const tastenLauf = (async () => {
            while (tasten) {
                await page.keyboard.press("F24").catch(() => {});
                await new Promise((r) => setTimeout(r, 100));
            }
        })();
        await page
            .waitForFunction(() => window.__kalt.eingabe != null, { polling: 50, timeout: Math.max(1000, SEK * 1000 - (Date.now() - t0)) })
            .catch(() => {});
        tasten = false;
        const roh = { halbDiff: null, halbOhne: ECHT ? "die Welt nahm keine Eingabe an" : "swiftshader: der Schirm-Schuss trägt die Leinwand nicht" };
        if (ECHT && (await page.evaluate(() => window.__kalt.eingabe != null))) {
            // er weicht schon (`.weg`, 0,7 s Blende) — sein Ausblenden ist kein Weltbild
            await page.evaluate(() => (document.getElementById("ladeschirm") || {}).style = "display:none");
            const clip = { x: 0, y: 0, width: 1920, height: 1080, scale: 0.5 };
            const schuss = async () => {
                const png = Buffer.from(await page.screenshot({ clip }));
                const p = AU.pngLesen(png);
                return { png, w: p.W, h: p.H, d: p.u8, t: Date.now() - t0 };
            };
            const erstes = await schuss();
            // DAS RUNDUM-BILD: zwei Schirme in Folge unter RUHE_ANTEIL — oder der Unterschied in Folge steht (drei Schritte in
            // ±0,01: es lebt nur noch, was atmet oder zieht); je Block der größte Schritt (`blockAnteil` schritt: was erscheint)
            let vor = erstes,
                schritt = null;
            roh.ruheReihe = [];
            for (let i = 0; i < 100 && vor.t - erstes.t < 30000; i++) {
                await new Promise((r) => setTimeout(r, 300));
                const jetzt = await schuss();
                const s = AU.blockUnterschiede(vor, jetzt);
                schritt = schritt ? schritt.map((x, k) => Math.max(x, s[k])) : s;
                const R = roh.ruheReihe;
                R.push(+AU.blockAnteil(vor, jetzt).toFixed(4));
                vor = jetzt;
                if (R[R.length - 1] <= RUHE_ANTEIL || (R.length >= 4 && Math.max(...R.slice(-3)) - Math.min(...R.slice(-3)) <= 0.01)) {
                    roh.halbDiff = +AU.blockAnteil(erstes, jetzt, schritt).toFixed(4);
                    roh.rundumMs = jetzt.t - erstes.t;
                    break;
                }
            }
            if (roh.halbDiff == null) roh.halbOhne = `das Bild ruht 30 s nicht (in Folge ${roh.ruheReihe.slice(-3).join(" · ")} der Blöcke)`;
            roh.erstesMs = erstes.t;
            const bildDatei = OPT("--bild", null);
            if (bildDatei) {
                fs.writeFileSync(path.resolve(bildDatei), erstes.png);
                fs.writeFileSync(path.resolve(bildDatei).replace(/\.png$/i, "") + "-rundum.png", vor.png);
                roh.bild = { datei: path.resolve(bildDatei) };
            }
        }
        await tastenLauf;
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
        Object.assign(out, roh);
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
    if (out.auftrag) console.log(`  ${(out.auftrag / 1000).toFixed(1)} s  der erste Asset-Auftrag ist gesendet`);
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
    if (out.bild) console.log(`  das erste Bild nach der Kontrolle: ${out.bild.datei} (dazu -rundum.png)`);
    const { t, halb } = kontrolleZeit(out);
    const s2 = (x) => (x != null ? (x / 1000).toFixed(2) + " s" : "—");
    console.log(
        `\n  t(Kontrolle) ${t != null ? s2(t) : "— (nicht erreicht)"} ab Navigation — die erste angenommene Taste ${s2(out.eingabe)}, ` +
            `das Bild danach; der Stamm über sich (\`_weltbildDa\`, urteilt nicht) ${s2(out.weltbildDa)}` +
            (out.halbDiff != null ? ` · Bild-Unterschied zum Rundum-Bild ${(out.halbDiff * 100).toFixed(1)} % (ruht nach ${s2(out.rundumMs)})` : "")
    );
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
    const kontrolle = kontrolleSelbsttest();
    if (ARGV.includes("--selbsttest-kontrolle")) {
        for (const b of kontrolle) console.log(`  ❌ ${b}`);
        console.log(
            kontrolle.length
                ? `⛔ SELBSTTEST KONTROLLE ROT (${kontrolle.length} Brüche in 7 Fällen) — t(Kontrolle) liest das Gerichtete`
                : "✅ SELBSTTEST KONTROLLE GRÜN — t(Kontrolle) aus Eingabe + Ausgabe-Bild, halb aus dem Bild"
        );
        process.exit(kontrolle.length ? 1 : 0);
    }
    const SELFTEST = ARGV.includes("--selftest");
    await new Promise((r) => server.listen(PORT, r));
    const browser = await starteBrowser({ art: "null", frist: 300000 });
    const page = await browser.newPage();
    await nullRenderer(page);
    let out = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && window.anazhRealm.state && window.anazhRealm.state.playerMesh, {
            timeout: 120000,
        });
        out = await page.evaluate(async () => {
            const r = window.anazhRealm,
                st = r.state;
            // DIE EINE BÜHNEN-WAHRHEIT mit Renderer gefragt (der Null-Renderer setzt sie sofort): Latch, Uhr, Marke und
            // Regionen-Karte kehren nach jeder Frage zurück; `gedeckelt` stellt die Uhr weit hinter BUEHNE_SETTLE_CAP_MS
            const frag = (ohneKarte, gedeckelt) => {
                const merk = { h: st.renderer._isHeadlessNull, latch: st._buehneStand, t0: r._buehneT0, map: st.scatterRegions };
                st.renderer._isHeadlessNull = false;
                st._buehneStand = false;
                r._buehneT0 = gedeckelt ? -Infinity : null;
                if (ohneKarte) delete st.scatterRegions;
                const steht = r._buehneSteht();
                Object.assign(st, { _buehneStand: merk.latch, scatterRegions: merk.map });
                st.renderer._isHeadlessNull = merk.h;
                r._buehneT0 = merk.t0;
                return steht;
            };
            const t0 = performance.now();
            let ticks = 0;
            while (ticks < 6000 && !frag(false)) {
                try {
                    r._gameLoopTick();
                } catch (_e) {}
                if (++ticks % 5 === 0) await new Promise((res) => setTimeout(res, 0));
            }
            const o = { steht: frag(false), ticks, ms: performance.now() - t0, chunks: st.voxelChunks ? st.voxelChunks.size : 0 };
            // die wartende Spieler-Region und die fehlende Regionen-Karte (der Streamer lief noch nie, Befund 09.10.) machen sie
            // rot, sie heilt; der Deckel öffnet laut (WARN „Die Bühne steht ohne: … Wald-Stücke …")
            const SC = r.constructor.SCATTER;
            const p = st.playerMesh.position;
            const reg = st.scatterRegions && st.scatterRegions.get(`${Math.floor(p.x / SC.regionM)},${Math.floor(p.z / SC.regionM)}`);
            o.spielerRegion = !!reg;
            if (reg) {
                reg._deferredFoundry = true;
                o.wartetRot = r._streuWartet(p) > 0 && frag(false) === false;
                delete reg._deferredFoundry;
            }
            o.ohneKarteRot = frag(true) === false;
            o.heilt = frag(false) === true;
            const warnt = () => st.logBuffer.slice(-30).filter((z) => /Bühne steht ohne: .*Wald-Stücke/.test(z)).length;
            const w0 = warnt();
            o.deckelSteht = frag(true, true);
            o.deckelWarnt = warnt() > w0;
            return o;
        });
    } catch (e) {
        out = { __err: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();
    if (!out || out.__err) {
        console.log(`⛔ Bühnen-Linse fehlgeschlagen: ${out ? out.__err : "?"}`);
        process.exit(2);
    }
    console.log("\n=== DIE BÜHNE — die EINE Bühnen-Wahrheit der Welt (`_buehneSteht`), Null-Renderer-Mechanik ===");
    const checks = [
        {
            name: `die Bühne steht nach ${out.ticks} Takten (${(out.ms / 1000).toFixed(1)} s, ${out.chunks} Chunks) — Ring · Gras · Wasser · Streu`,
            pass: out.steht === true,
        },
    ];
    if (SELFTEST)
        checks.push(
            {
                name: `SELBST-TEST K: der Richter steht außerhalb — ein gefälschtes _weltbildDa und die WARN-Zeile ändern t(Kontrolle) und „halb" nicht${kontrolle.length ? ` (${kontrolle.join(" · ")})` : ""}`,
                pass: kontrolle.length === 0,
            },
            {
                name:
                    "SELBST-TEST: die wartende Spieler-Region und die fehlende Regionen-Karte machen die Bühne rot + sie heilt " +
                    `(Spieler-Region ${out.spielerRegion ? "steht" : "FEHLT"} · wartet → ${out.wartetRot ? "rot" : "STUMPF"} · ohne Karte → ${out.ohneKarteRot ? "rot" : "STUMPF"} · heilt ${!!out.heilt})`,
                pass: !!(out.spielerRegion && out.wartetRot && out.ohneKarteRot && out.heilt),
            },
            {
                name: `SELBST-TEST: der Deckel der Bühne öffnet laut — ohne Regionen-Karte hinter BUEHNE_SETTLE_CAP_MS ${out.deckelSteht ? "steht sie" : "steht sie NICHT"}, das Log ${out.deckelWarnt ? "nennt die Lücke (WARN)" : "SCHWEIGT"}`,
                pass: out.deckelSteht === true && out.deckelWarnt === true,
            }
        );
    let fails = 0;
    for (const c of checks) {
        console.log(`  ${c.pass ? "✅" : "❌"} ${c.name}`);
        if (!c.pass) fails++;
    }
    console.log(`\n${checks.length - fails}/${checks.length} Bühnen-Invarianten OK.`);
    process.exit(fails ? 1 : 0);
})();
