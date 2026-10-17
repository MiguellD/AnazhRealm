// diag-fahrzeug-fern.cjs — DIE FAHRZEUG-FERNSTUFEN-LINSE (Matrix-Zelle fahrzeug.lods,
// das Tor-Präzedenz V18.465 1:1 gespiegelt): ein GEPARKTES Fahrzeug fern serviert das
// 8-Winkel-Billboard aus der EINEN Bäckerei (bake-impostor) statt seiner vollen
// L0-Geometrie (gt: hunderte Meshes auf JEDE Distanz — der alte Fehler); ein
// GERITTENES Fahrzeug bleibt Voll-Geometrie (die statische Wand).
//
// ZWEI PRÜF-FAMILIEN (die Politik, die Serve-Route und die Kette Wagen [0, 1] + Karte beweist gate:foundry-crossfade (7)
// am echten Spawn, die Geritten-Wand — der gerittene Wagen bleibt Stufe 0 — gate:fahr-leben T1/T3 im echten Ritt; keine
// Probe liest Quelltext, D3c):
//   (S) SELBST-TEST (nicht vakuös): eine leere Karte, ein null-Payload und eine Diät ohne Gewicht MÜSSEN rot urteilen.
//   (N) DIE ECHTE BÄCKEREI (puppeteer + Foundry-WEB-WORKER, das diag-baecker-kanal-
//       Muster): das ERSTE vehicle-Rezept aus dem LIVE-Buch (get-book) bäckt eine
//       NICHT-LEERE Impostor-Karte (Alpha-Deckung > 64 Px — die NICHT-LEERE-WAND),
//       und die Mess-Zahl reist in den Bericht: L0-Meshes/-Tris (build-asset lod 0)
//       gegen die Fernstufe (1 Quad = 2 Tris, das Einheits-Quad des Karten-Atlas `_impostorQuad`).
//
//   node scripts/diag-fahrzeug-fern.cjs        (exit 0 = GRÜN, 1 = ROT, 2 = Harness-Fehler)
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const { WORKER_BOOT } = require("./lib/asset-worker-harness.cjs");

const PORT = Number(process.env.FAHRZEUG_FERN_PORT || 4553);

// ── Die Bäcker-Soll-Zahlen (die fixe Naht __replyBakeImpostor, wie diag-baecker-kanal) ──
const SOLL = { cw: 128, ch: 256, V: 8 };
const SOLL_LEN = SOLL.cw * SOLL.ch * SOLL.V * 4;
const SOLL_ALPHA_PX = 64; // NICHT-LEERE-WAND: echte Pixel, keine Clear-Karte als „Erfolg"
// Die Fernstufe des Wirts: EIN camera-facing Quad (`_impostorQuad`, VC=6).
const FERN_MESHES = 1;
const FERN_TRIS = 2;

// ── (N): die reine Bäcker-Prüfung (Zahlen aus dem echten Worker) ────────────────────────
function pruefeBaecker(st) {
    const rot = [];
    if (!st || !st.got) {
        rot.push("keine impostor-Antwort vom Worker (Kanal stumm)");
        return rot;
    }
    if (st.payloadNull) {
        rot.push("payload ist null — der Bäcker kennt das vehicle-Preset nicht (Zweit-Kern-Dispatch gerissen)");
        return rot;
    }
    if (st.cw !== SOLL.cw || st.ch !== SOLL.ch || st.V !== SOLL.V)
        rot.push(`Zell-Masse divergieren: cw=${st.cw} ch=${st.ch} V=${st.V} (soll ${SOLL.cw}/${SOLL.ch}/${SOLL.V})`);
    if (st.albedoLen !== SOLL_LEN) rot.push(`albedo-Länge ${st.albedoLen} != ${SOLL_LEN}`);
    if (!(st.alphaPx > SOLL_ALPHA_PX))
        rot.push(
            `Alpha-Deckung ${st.alphaPx} <= ${SOLL_ALPHA_PX} Px — LEERE Karte als „Erfolg" (die NICHT-LEERE-WAND muss greifen)`
        );
    // W6: der Rahmen reist aus DEMSELBEN Bake (Quad = Bake-Kamera); die Normale reist voll (der Karten-Codec halbiert
    // sie, der Labor-Wald bleibt byte-gleich).
    const fr = st.frame || {};
    if (!(fr.halfH > 0 && isFinite(fr.halfH) && fr.halfW > 0 && isFinite(fr.halfW)))
        rot.push(`Rahmen unbrauchbar: ${JSON.stringify(st.frame)}`);
    if (st.normalLen !== SOLL_LEN) rot.push(`normal-Länge ${st.normalLen} != ${SOLL_LEN} (voll)`);
    return rot;
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
    // Bäcker-Prüfung: leere Karte / null payload -> MUSS feuern.
    faelle.push(["Bäcker: payload null -> feuert", pruefeBaecker({ got: true, payloadNull: true }).length > 0]);
    faelle.push([
        "Bäcker: LEERE Karte (Alpha 0) -> feuert",
        pruefeBaecker({
            got: true,
            payloadNull: false,
            cw: 128,
            ch: 256,
            V: 8,
            albedoLen: SOLL_LEN,
            alphaPx: 0,
            frame: { halfH: 1, halfW: 0.5 },
            normalLen: SOLL_LEN,
        }).length > 0,
    ]);
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
  const alphaPx = (u) => { let n = 0; for (let i = 3; i < u.length; i += 4) if (u[i] > 32) n++; return n; };
  // Das ERSTE vehicle-Rezept aus dem ECHTEN Buch (kein hartkodierter Spiegel).
  window.__erstesVehicleRezept = () => ask({ type: "get-book" }).then((r) => {
    const b = (r && r.book) || {};
    for (const id in b) if (b[id] && b[id].kind === "vehicle") return id;
    return null;
  });
  window.__bakeStats = (presetId, seed) => ask({ type: "bake-impostor", presetId: presetId, seed: seed }).then((r) => {
    if (!r) return { got: false, workerError: S.error };
    const p = r.payload;
    if (!p) return { got: true, payloadNull: true, workerError: S.error };
    const a = p.albedo || new Uint8Array(0);
    return {
      got: true, payloadNull: false, cw: p.cw, ch: p.ch, V: p.V, frame: p.frame,
      albedoLen: a.length, alphaPx: alphaPx(a), normalLen: p.normal ? p.normal.length : 0,
    };
  });
  // Die NAH-Messung: build-asset lod 0 -> Mesh-Zahl + Dreiecks-Zensus (index/3 bzw. pos/9;
  // position reist als {array,itemSize} — __extractAssetMesh-Vertrag; __skelett-Pseudo-
  // Einträge tragen kein position und zählen nicht).
  window.__nahStats = (presetId, seed) => ask({ type: "build-asset", presetId: presetId, seed: seed, lod: 0 }).then((r) => {
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

    // ── (N/K) Die echte Bäckerei im Foundry-Worker ──
    const server = statikServer({ seiten: { "/": pageHtml, "/__ff.html": pageHtml } });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await starteBrowser({ art: "webgl", frist: 240000 });
    let vId = null;
    let bake = null;
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
            nah = await page.evaluate((id) => window.__nahStats(id, 7), vId);
            bake = await page.evaluate((id) => window.__bakeStats(id, 7), vId);
        }
        if (!bake || bake.payloadNull) for (const m of meldungen.slice(-8)) console.error("  [seite] " + m);
    } finally {
        await browser.close();
        server.close();
    }

    console.log(
        `\n===== (N) DIE ECHTE BÄCKEREI — erstes vehicle-Rezept aus dem Buch: ${vId || "KEINES GEFUNDEN"} (seed 7) =====`
    );
    if (!vId) rot.push("kein vehicle-Rezept im Buch (get-book) — der Zweit-Kern reist nicht");
    else {
        if (bake && bake.got && !bake.payloadNull)
            console.log(
                `  Impostor-Karte: cw=${bake.cw} ch=${bake.ch} V=${bake.V} · Alpha-Px=${bake.alphaPx} · Rahmen ${JSON.stringify(bake.frame)} · Normale ${bake.normalLen} B`
            );
        for (const x of pruefeBaecker(bake)) rot.push(`[${vId}] ${x}`);
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
