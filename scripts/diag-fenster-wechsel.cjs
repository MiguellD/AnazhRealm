// diag-fenster-wechsel.cjs — DIE FENSTER-WAND (npm run gate:fenster-wechsel).
//
// Befund 03.10. (echte GPU, Radeon 890M): ein Fenster-Wechsel machte die Welt für immer SCHWARZ — die Textur-Bindung des
// Wassers (des Lesers der Szenen-Tiefe) zog nach `renderer.setSize` nicht nach („Destroyed texture … used in a submit").
// Befund 09.10. (Leben-Schau 2, laufender Loop): 264× „Destroyed texture [Texture "szene:tiefenabbild"]" beim Vergrößern und
// Maximieren (DPR 2) — die Pixel-Ratio stellt die DPR-Kappe (`_applyRenderScale` → `setPixelRatio`) Frames NACH dem resize-
// Ereignis. Die Wurzel beider: die Observer-Diät sah das neu angelegte Tiefen-Abbild nie. Der EINE Schnitt ist der Vorher-
// Textur-Wächter der Diät (`_diaetVorTextur`); der Wasser-Neubau im resize-Handler war sein Zwilling und ist gefallen
// (0910-3 A, Gegenprüfung; der Name steht in gate:altlasten).
//
// Die Wand fährt den ECHTEN Frame: WebGPU auf swiftshader, das Software-Holz (`?holz=kienspan`) mit der Pixel-Kappe des
// Holzes nah (1,25 — die Kappe, die ein DPR-Wechsel trifft), am Ufer des Bachs der Mess-Wiese (das Wasser liest das Tiefen-
// Abbild, dazu das Fern-Wasser), der Spiel-Loop LÄUFT. Je Schritt zählt die Wand gerendete Frames (die GPU-Leine), nie die Uhr:
//   E1  vergrößern (640×360 → 704×396) — das resize-Ereignis, die Szenen-Tiefe wird neu angelegt
//   E2  DPR 2 — die Kappe stellt die Pixel-Ratio auf 1,25, Frames nach dem Ereignis
//   E3  zurück (640×360, DPR 1)
//   E4  die Pixel-Ratio ALLEIN (1,25, dann 1), wie die Kappe sie stellt, ohne resize-Ereignis
//   je Schritt ROT bei JEDER WebGPU-Validierung beim Namen (Device-Meldung und GPU-Wache des Stamms)
//   E5  nicht vakuös: das Wasser zeichnet, das Abbild wurde je Größe neu angelegt, die Pixel-Ratio folgte DPR und Kappe
//   K   kein Zwilling: der resize-Handler baut keinen Leser der Szenen-Tiefe neu (Quelle, kommentarfrei)
//   ES  Selbsttest am echten Frame, der letzte Schritt: ohne den Wächter (`_diaetVorTextur` → false) MUSS ein Pixel-Ratio-
//       Schritt „Destroyed texture …" an einem Größen-Ziel beim Namen zeigen (`GROESSEN_ZIELE`: Szenen-Tiefe oder seit D10 der
//       Spiegel-Strahl). Er urteilt in Bau-Ereignissen: jeder Submit unter einem eigenen Fehler-Bereich, nach 2 Frames das Urteil,
//       sobald der GPU-Prozess sie geprüft hat. Bis hier fing ein Bereich von r184 die Meldung (er hält einen je async Pipeline-Bau
//       offen, auf swiftshader-Linux 42–292 s) und die Kappe 90 s riss mit 2 Frames ohne Meldung (CI 38825754441). K hält den Rest.
//
//   node scripts/diag-fenster-wechsel.cjs
const { statikServer, starteBrowser, uferStellen } = require("./lib/welt-boot.cjs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const { ladeSpec } = require("./lib/band-urteil.cjs");

const PORT = Number(process.env.FENSTER_PORT || 4574);
const GROESSEN_ZIELE = /Destroyed texture \[Texture "(szene:tiefenabbild|spiegel:strahl)"\]/;
const LESER_NEUBAU = /_tiefenKnotenTausch|_tiefenLeserNeuBinden|_ensureHydroSurfaceMaterial|_feldPassDispose|hydroSurfaceMaterial\s*=/;
const root = path.resolve(__dirname, "..");
const server = statikServer();

let ok = true;
const check = (name, cond, detail) => {
    console.log(`  ${cond ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!cond) ok = false;
};

// K: der Körper des resize-Handlers (kommentarfrei) — kein Leser der Szenen-Tiefe wird dort neu gebaut
function resizeKoerper(src) {
    const i = src.indexOf('window.addEventListener("resize"');
    if (i < 0) return null;
    const ende = src.indexOf("});", i);
    return stammLib.ohneKommentare(src.slice(i, ende));
}

// vor jedem Seiten-Skript — die Device-Meldungen je Schritt (`__fensterEcht.schritt` setzt die Wand)
function fensterSammler() {
    const S = (window.__fensterEcht = { schritt: "boot", gpu: {}, offen: new Set(), n: 0 });
    if (typeof GPUAdapter === "undefined") return;
    const melde = (m) => {
        const k = String(m).split("\n")[0].slice(0, 160);
        const p = S.gpu[S.schritt] || (S.gpu[S.schritt] = {});
        p[k] = (p[k] || 0) + 1;
    };
    // ES prüft jeden Submit unter einem EIGENEN Fehler-Bereich zuoberst: sein Pop antwortet, sobald der GPU-Prozess den
    // Submit geprüft hat — kein offener Bereich des async Pipeline-Baus von r184 hält die Meldung zurück (s. Kopf)
    const submit = GPUQueue.prototype.submit;
    GPUQueue.prototype.submit = function (b) {
        if (S.schritt !== "ES") return submit.call(this, b);
        const id = ++S.n;
        S.offen.add(id);
        this.__geraet.pushErrorScope("validation");
        submit.call(this, b);
        const pop = this.__geraet.popErrorScope();
        pop.then((e) => e && melde(e.message)).finally(() => S.offen.delete(id));
    };
    const rd = GPUAdapter.prototype.requestDevice;
    GPUAdapter.prototype.requestDevice = async function (d) {
        const dev = await rd.call(this, d);
        dev.queue.__geraet = dev;
        dev.addEventListener("uncapturederror", (ev) => melde((ev.error && ev.error.message) || ev.error));
        return dev;
    };
}

// ein Schritt nach der Änderung: `n` gerenderte Frames im laufenden Loop (die GPU-Leine zählt sie) — mit `pr` erst, bis die
// Pixel-Ratio dort steht (höchstens 60 Frames); dann der Stand des Schritts
async function fensterSchritt(o) {
    const r = window.anazhRealm;
    const st = r.state;
    const L = () => (r._gpuLeine ? r._gpuLeine.gerendert : 0);
    const warte = () => new Promise((q) => setTimeout(q, 20));
    const t0 = performance.now();
    if (o.pr != null) {
        const f0 = L();
        while (Math.abs(st.renderer.getPixelRatio() - o.pr) > 1e-6 && L() - f0 < 60 && performance.now() - t0 < 120000)
            await warte();
    }
    const f0 = L();
    const S = window.__fensterEcht;
    const W0 = (r._gpuWache || { n: 0 }).n;
    const gemeldet = () => Object.keys(S.gpu[S.schritt] || {}).length > 0 || (r._gpuWache || { n: 0 }).n > W0;
    if (o.bisMeldung) {
        // 2 Frames (die Leine trägt 2 im Flug), dann bis zur ersten Meldung oder bis der GPU-Prozess ihre Submits geprüft hat
        while (L() - f0 < o.n && !gemeldet()) await warte();
        const offen = [...S.offen];
        while (!gemeldet() && offen.some((e) => S.offen.has(e))) await warte();
    } else while (L() - f0 < o.n && performance.now() - t0 < 120000) await warte();
    const t = r._szeneTiefeKnoten && r._szeneTiefeKnoten.value;
    const W = r._gpuWache || { n: 0, meldungen: [] };
    return {
        frames: L() - f0,
        pr: st.renderer.getPixelRatio(),
        abbild: t && t.image ? { id: t.id, version: t.version, b: t.image.width, h: t.image.height } : null,
        gpu: S.gpu[S.schritt] || {},
        wache: W.n,
        wacheKoepfe: W.meldungen.map((m) => `${m.quelle}: ${m.kopf}`),
    };
}

(async () => {
    const T0 = Date.now();
    const log = (z) => console.log(`  [${Math.round((Date.now() - T0) / 1000)} s] ${z}`);
    console.log("=== K — kein Zwilling im resize-Handler (Quelle) ===");
    const koerper = resizeKoerper(stammLib.text(root));
    check(
        "K der resize-Handler baut keinen Leser der Szenen-Tiefe neu (die Diät trägt jeden Größenwechsel)",
        koerper !== null && !LESER_NEUBAU.test(koerper),
        koerper === null ? "resize-Handler nicht gefunden" : ""
    );
    console.log("=== E — der echte Frame mit laufendem Loop (WebGPU auf swiftshader, kienspan, Kappe 1,25, am Bach) ===");
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    // Erwartet: ES erntet ein Größen-Ziel — die Linse richtet die Meldung selbst (je Phase gezählt), jede andere bleibt ROT.
    const browser = await starteBrowser({ art: "linse", frist: 900000, erwartet: GROESSEN_ZIELE });
    const seitenFehler = [];
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 640, height: 360, deviceScaleFactor: 1 });
        await page.evaluateOnNewDocument(fensterSammler);
        page.on("pageerror", (e) => seitenFehler.push((e.message || String(e)).split("\n")[0]));
        await page.goto(`http://127.0.0.1:${PORT}/index.html?holz=kienspan`, { waitUntil: "domcontentloaded", timeout: 60000 });
        const u = await page.evaluate(uferStellen, { messort: ladeSpec("wiese").ort.spieler, kappe: 1.25 });
        if (u.fehler) throw new Error(u.fehler);
        log(`am Ufer ${JSON.stringify(u)}`);
        const vor = await page.evaluate(fensterSchritt, { n: 3 });
        if (Object.keys(vor.gpu).length) console.log(`  (vor den Schritten: ${JSON.stringify(vor.gpu)})`);
        let wacheVor = vor.wache;
        const schritt = async (name, text, tu, pr, bisMeldung) => {
            await page.evaluate((s) => (window.__fensterEcht.schritt = s), name);
            await tu();
            const kopfVor = await page.evaluate(() => (window.anazhRealm._gpuWache || { meldungen: [] }).meldungen.length);
            const s = await page.evaluate(fensterSchritt, { n: bisMeldung ? 2 : 3, pr, bisMeldung: !!bisMeldung });
            s.fremd = Object.entries(s.gpu).map(([k, n]) => `${n}× ${k}`);
            s.wacheNeu = s.wache - wacheVor;
            s.wacheKoepfe = s.wacheKoepfe.slice(kopfVor);
            wacheVor = s.wache;
            const abb = s.abbild ? `${s.abbild.b}×${s.abbild.h} v${s.abbild.version}` : "-";
            log(
                `${name} ${text}: Pixel-Ratio ${s.pr}, Abbild ${abb}, ${s.frames} Frames, ` +
                    `${s.fremd.length ? s.fremd.join(" | ") : "0 Meldungen"}, GPU-Wache +${s.wacheNeu}`
            );
            return s;
        };
        const befund = (s) =>
            s.fremd.join(" | ") || (s.wacheNeu ? `GPU-Wache +${s.wacheNeu}: ${s.wacheKoepfe.slice(-2).join(" | ")}` : "");
        const fenster = (w, h, dsf) => () => page.setViewport({ width: w, height: h, deviceScaleFactor: dsf });
        const pixelRatio = (v) => () => page.evaluate((x) => window.anazhRealm.state.renderer.setPixelRatio(x), v);
        const erg = {};
        const SCHRITTE = [
            ["E1", "704×396 DPR 1", fenster(704, 396, 1), null],
            ["E2", "704×396 DPR 2", fenster(704, 396, 2), 1.25],
            ["E3", "640×360 DPR 1", fenster(640, 360, 1), 1],
            ["E4a", "setPixelRatio(1.25)", pixelRatio(1.25), 1.25],
            ["E4b", "setPixelRatio(1)", pixelRatio(1), 1],
        ];
        for (const [name, text, tu, pr] of SCHRITTE) {
            const s = await schritt(name, text, tu, pr);
            erg[name] = s;
            check(`${name} keine WebGPU-Validierung (${text}, laufender Loop)`, !befund(s), befund(s));
        }
        const abbilder = new Set(Object.values(erg).map((s) => s.abbild && s.abbild.id + ":" + s.abbild.version));
        check(
            "E5 nicht vakuös: das Wasser zeichnet, das Abbild wurde je Größe neu angelegt, die Pixel-Ratio folgte DPR und Kappe",
            u.wasser > 0 &&
                u.fernWasser > 0 &&
                abbilder.size >= 5 &&
                erg.E2.pr === 1.25 &&
                erg.E3.pr === 1 &&
                erg.E4a.pr === 1.25 &&
                Object.values(erg).every((s) => s.frames >= 3),
            `Wasser ${u.wasser} (Fern-Wasser ${u.fernWasser} Quads), Abbild-Stände ${abbilder.size}, Pixel-Ratio E2 ${erg.E2.pr} · E3 ${erg.E3.pr} · E4 ` +
                `${erg.E4a.pr}/${erg.E4b.pr}, Frames ${Object.values(erg)
                    .map((s) => s.frames)
                    .join("/")}`
        );
        // ES: der Selbsttest am echten Frame — ohne den Wächter fällt der Pixel-Ratio-Schritt beim Namen (der letzte Schritt)
        await page.evaluate(() => (window.anazhRealm.constructor._diaetVorTextur = () => false));
        const es = await schritt("ES", "setPixelRatio(1.25) ohne Wächter", pixelRatio(1.25), 1.25, true);
        const faellt = (s) => [...s.fremd, ...s.wacheKoepfe].some((k) => GROESSEN_ZIELE.test(k));
        check(
            "ES Selbsttest: ohne den Wächter fällt „Destroyed texture …“ an einem Größen-Ziel beim Pixel-Ratio-Schritt",
            faellt(es),
            [...es.fremd, ...es.wacheKoepfe].join(" | ") || "0"
        );
        check("E keine Page-Errors", seitenFehler.length === 0, seitenFehler.slice(0, 2).join(" | "));
    } catch (e) {
        check("E Lauf", false, (e && e.message) || String(e));
    }
    await browser.close();
    server.close();
    log(ok ? "GRÜN" : "ROT");
    console.log(ok ? "GRÜN fenster-wechsel" : "ROT fenster-wechsel");
    process.exit(ok ? 0 : 1);
})();
