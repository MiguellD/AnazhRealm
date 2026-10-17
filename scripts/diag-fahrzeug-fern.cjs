// diag-fahrzeug-fern.cjs — DIE FAHRZEUG-FERNSTUFEN-LINSE (Matrix-Zelle fahrzeug.lods,
// das Tor-Präzedenz V18.465 1:1 gespiegelt): ein GEPARKTES Fahrzeug fern serviert das
// 8-Winkel-Billboard (die Welt bäckt es aus seiner L1-Gestalt, `_karteWeltBacken`) statt seiner vollen
// L0-Geometrie (gt: hunderte Meshes auf JEDE Distanz — der alte Fehler); ein
// GERITTENES Fahrzeug bleibt Voll-Geometrie (die statische Wand).
//
// ZWEI PRÜF-FAMILIEN (die Politik, die Serve-Route und die Kette Wagen [0, 1] + Karte beweist gate:foundry-crossfade (7)
// am echten Spawn, die Geritten-Wand — der gerittene Wagen bleibt Stufe 0 — gate:fahr-leben T1/T3 im echten Ritt; keine
// Probe liest Quelltext, D3c):
//   (S) SELBST-TEST (nicht vakuös): eine leere L1-Gestalt und eine Diät ohne Gewicht MÜSSEN rot urteilen.
//   (N) DIE KARTEN-QUELLE (puppeteer + Foundry-WEB-WORKER): das ERSTE vehicle-Rezept aus dem LIVE-Buch (get-book)
//       liefert eine NICHT-LEERE L1-Gestalt (aus ihr bäckt die Welt die Karte), und die Mess-Zahl reist in den Bericht:
//       L0-Meshes/-Tris (build-asset lod 0) gegen die Fernstufe (1 Quad = 2 Tris, das Einheits-Quad des Karten-Atlas `_impostorQuad`).
//
//   node scripts/diag-fahrzeug-fern.cjs        (exit 0 = GRÜN, 1 = ROT, 2 = Harness-Fehler)
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const { WORKER_BOOT } = require("./lib/asset-worker-harness.cjs");

const PORT = Number(process.env.FAHRZEUG_FERN_PORT || 4553);

// Die Fernstufe des Wirts: EIN camera-facing Quad (`_impostorQuad`, VC=6).
const FERN_MESHES = 1;
const FERN_TRIS = 2;

// ── (N): die Karten-Quelle — die L1-Gestalt, aus der die Welt die Karte bäckt, ist nicht leer ──
function pruefeGestalt(l1) {
    if (!l1 || !(l1.meshes > 0 && l1.tris > 0))
        return [`die L1-Gestalt ist leer (${l1 ? l1.meshes + " Meshes" : "keine Antwort"}) — die Welt bäckt keine Fahrzeug-Karte`];
    return [];
}

// Die Mess-Zahl: nah gegen fern — die Fernstufe MUSS massiv billiger sein.
function pruefeDiaet(nah) {
    const rot = [];
    if (!nah || !(nah.meshes > 0)) {
        rot.push("build-asset lod 0 lieferte keine Meshes — die Nah-Messung trägt nicht");
        return rot;
    }
    if (!(nah.meshes > FERN_MESHES && nah.tris > FERN_TRIS))
        rot.push(
            `Nah-Stufe (${nah.meshes} Meshes / ${nah.tris} Tris) ist nicht schwerer als die Fernstufe (${FERN_MESHES}/${FERN_TRIS}) — die Diät misst nichts`
        );
    return rot;
}

// ── (S) SELBST-TEST: die Linse muss den ALTEN Fehler rot sehen (nicht vakuös) ───────────
function selbstTest() {
    const faelle = [];
    // Karten-Quelle leer -> MUSS feuern.
    faelle.push(["Karten-Quelle: leere L1-Gestalt -> feuert", pruefeGestalt({ meshes: 0, tris: 0 }).length > 0]);
    // Diät-Messung: Nah == Fern -> MUSS feuern (vakuöse Messung).
    faelle.push(["Diät: nah == fern -> feuert", pruefeDiaet({ meshes: 1, tris: 2 }).length > 0]);
    let ok = true;
    console.log("===== (S) SELBST-TEST DER LINSE (GPU-frei) =====");
    for (const [name, gut] of faelle) {
        console.log(`  ${gut ? "✅" : "❌"} Selbst-Test: ${name}`);
        if (!gut) ok = false;
    }
    return ok;
}

// ── Die Worker-Seite (das diag-baecker-kanal-Muster: EINE Skript-Liste, kein Zweit-Boot) ─
function pageHtml() {
    return `<!doctype html><meta charset="utf-8"><title>fahrzeug-fern</title><body><script>
(() => {
  const S = (window.__AW = { ready: false, error: null });
  const boot = ${WORKER_BOOT};
  const worker = new Worker(URL.createObjectURL(new Blob([boot], { type: "text/javascript" })));
  const pending = new Map();
  let seq = 1;
  worker.onerror = (e) => { S.error = (e && e.message) || "Worker-Fehler"; };
  worker.onmessage = (ev) => {
    const m = ev.data;
    if (!m || typeof m !== "object") return;
    if (m.type === "ready" && m.world === "terrain") S.ready = true;
    const p = pending.get(m.reqId);
    if (p) { pending.delete(m.reqId); p(m); }
  };
  const ask = (msg) => new Promise((res) => {
    const reqId = "ff" + seq++;
    pending.set(reqId, res);
    worker.postMessage(Object.assign({ reqId }, msg));
    setTimeout(() => { if (pending.has(reqId)) { pending.delete(reqId); res(null); } }, 90000);
  });
  // Das ERSTE vehicle-Rezept aus dem ECHTEN Buch (kein hartkodierter Spiegel).
  window.__erstesVehicleRezept = () => ask({ type: "get-book" }).then((r) => {
    const b = (r && r.book) || {};
    for (const id in b) if (b[id] && b[id].kind === "vehicle") return id;
    return null;
  });
  // Die Stufen-Messung: build-asset lod 0 (nah) bzw. 1 (die Karten-Quelle) -> Mesh-Zahl + Dreiecks-Zensus (index/3 bzw. pos/9;
  // position reist als {array,itemSize} — __extractAssetMesh-Vertrag; __skelett-Pseudo-
  // Einträge tragen kein position und zählen nicht).
  window.__stufeStats = (presetId, seed, lod) => ask({ type: "build-asset", presetId: presetId, seed: seed, lod: lod }).then((r) => {
    const meshes = (r && r.meshes) || [];
    let tris = 0, n = 0;
    for (const m of meshes) {
      if (!m || !m.position || !m.position.array) continue;
      n++;
      tris += m.index ? m.index.length / 3 : m.position.array.length / 9;
    }
    return { meshes: n, tris: Math.round(tris) };
  });
})();
</script></body>`;
}

(async () => {
    if (!selbstTest()) {
        console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös/die Welle nicht gebaut, Abbruch.");
        process.exit(1);
    }
    const rot = [];

    // ── (N/K) Die Karten-Quelle im Foundry-Worker ──
    const server = statikServer({ seiten: { "/": pageHtml, "/__ff.html": pageHtml } });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "webgl", frist: 240000 });
    let vId = null;
    let l1 = null;
    let nah = null;
    try {
        const page = await browser.newPage();
        const meldungen = [];
        page.on("console", (m) => meldungen.push(m.text()));
        page.on("pageerror", (e) => meldungen.push("PAGEERROR: " + String((e && e.message) || e)));
        await page.goto("http://127.0.0.1:" + PORT + "/__ff.html", { waitUntil: "domcontentloaded" });
        await page.waitForFunction("window.__AW && (window.__AW.ready || window.__AW.error)", {
            timeout: 120000,
            polling: 200,
        });
        const st = await page.evaluate(() => window.__AW);
        if (st.error) throw new Error("WORKER-BOOT: " + st.error);
        vId = await page.evaluate(() => window.__erstesVehicleRezept());
        if (vId) {
            nah = await page.evaluate((id) => window.__stufeStats(id, 7, 0), vId);
            l1 = await page.evaluate((id) => window.__stufeStats(id, 7, 1), vId);
        }
        if (!l1 || !(l1.meshes > 0)) for (const m of meldungen.slice(-8)) console.error("  [seite] " + m);
    } finally {
        await browser.close();
        server.close();
    }

    console.log(
        `\n===== (N) DIE KARTEN-QUELLE — erstes vehicle-Rezept aus dem Buch: ${vId || "KEINES GEFUNDEN"} (seed 7) =====`
    );
    if (!vId) rot.push("kein vehicle-Rezept im Buch (get-book) — der Zweit-Kern reist nicht");
    else {
        if (l1) console.log(`  Karten-Quelle L1: ${l1.meshes} Meshes / ${l1.tris} Tris (die Welt bäckt daraus die 8 Ansichten)`);
        for (const x of pruefeGestalt(l1)) rot.push(`[${vId}] ${x}`);
        if (nah)
            console.log(
                `  DIE MESS-ZAHL (fahrzeug.lods): nah L0 = ${nah.meshes} Meshes / ${nah.tris} Tris → fern L2 = ${FERN_MESHES} Quad-Mesh / ${FERN_TRIS} Tris (Faktor ~${Math.round(nah.tris / FERN_TRIS)}× Tris)`
            );
        for (const x of pruefeDiaet(nah)) rot.push(`[${vId}] ${x}`);
    }

    if (rot.length) {
        console.error("\n❌ ROT — Befunde:");
        for (const x of rot) console.error("  • " + x);
        process.exit(1);
    }
    console.log(
        "\n✅ GRÜN — die Fahrzeug-Fernstufe steht auf der Tor-Spur: geparkt fern = nicht-leere 8-Winkel-Karte (1 Quad) statt der vollen L0-Geometrie, der Bäcker-Kanal trägt vehicle."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Harness-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
