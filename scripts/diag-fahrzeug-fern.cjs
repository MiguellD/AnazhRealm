// diag-fahrzeug-fern.cjs — DIE FAHRZEUG-FERNSTUFEN-LINSE (Matrix-Zelle fahrzeug.lods,
// das Tor-Präzedenz V18.465 1:1 gespiegelt): ein GEPARKTES Fahrzeug fern serviert das
// 8-Winkel-Billboard aus der EINEN Bäckerei (bake-impostor) statt seiner vollen
// L0-Geometrie (gt: hunderte Meshes auf JEDE Distanz — der alte Fehler); ein
// GERITTENES Fahrzeug bleibt Voll-Geometrie (die statische Wand).
//
// VIER PRÜF-FAMILIEN:
//   (S) SELBST-TEST (nicht vakuös): dieselben Prüfungen auf MUTIERTER Quelle —
//       ohne die Policy-Zeile (`impostor: true` in KIND_POLICY.vehicle) MUSS die
//       Linse rot urteilen; ebenso ohne `vehicle` im Bäcker-Kind-Wächter.
//   (P) POLICY + CHOKEPOINTS (Quelle, verhaltensecht evaluiert, kein blosser Grep):
//       KIND_POLICY wird aus dem Stamm extrahiert und AUSGEFÜHRT (vehicle.impostor
//       === true) · `_foundryPresetIsTree` wird als ECHTE Funktion instanziert und
//       urteilt kind "vehicle" → true · der Bäcker-Kind-Wächter (Positivliste)
//       lässt vehicle durch · die Serve-Chokepoints (`_foundryFlattenFor` +
//       `_foundryEntryReady`) routen lod>=2 über GENAU diese Politik.
//   (M) GERITTEN-WAND (verhaltensecht): `_foundryLodForEntry` wird als ECHTE
//       Funktion instanziert — ein Entry AUF der Spieler-Position (das ist die
//       Fahr-Invariante: `_tickMountedMovement` pinnt entry.position auf pm, per
//       Quell-Probe belegt) urteilt Stufe 0 (< 2 → nie Impostor, Voll-Geometrie);
//       dasselbe Entry 500 m fern urteilt Stufe 2 (Impostor).
//   (N) DIE ECHTE BÄCKEREI (puppeteer + Foundry-WEB-WORKER, das diag-baecker-kanal-
//       Muster): das ERSTE vehicle-Rezept aus dem LIVE-Buch (get-book) bäckt eine
//       NICHT-LEERE Impostor-Karte (Alpha-Deckung > 64 Px — die NICHT-LEERE-WAND),
//       und die Mess-Zahl reist in den Bericht: L0-Meshes/-Tris (build-asset lod 0)
//       gegen die Fernstufe (1 Quad = 2 Tris, `_buildImpostorCrossGeometry`).
//
//   node scripts/diag-fahrzeug-fern.cjs        (exit 0 = GRÜN, 1 = ROT, 2 = Harness-Fehler)
const fs = require("fs");
const path = require("path");
const http = require("http");
const puppeteer = require("puppeteer");
const { WORKER_SCRIPTS } = require("./lib/asset-worker-harness.cjs");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.FAHRZEUG_FERN_PORT || 4553);
const STAMM = fs.readFileSync(path.join(ROOT, "anazhRealm.js"), "utf8");
const CORES_MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, "cores.manifest.json"), "utf8"));
const MIME = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
    ".wasm": "application/wasm",
};

// ── Die Bäcker-Soll-Zahlen (die fixe Naht __replyBakeImpostor, wie diag-baecker-kanal) ──
const SOLL = { cw: 128, ch: 256, V: 8 };
const SOLL_LEN = SOLL.cw * SOLL.ch * SOLL.V * 4;
const SOLL_ALPHA_PX = 64; // NICHT-LEERE-WAND: echte Pixel, keine Clear-Karte als „Erfolg"
// Die Fernstufe des Wirts: EIN camera-facing Quad (`_buildImpostorCrossGeometry`, VC=6).
const FERN_MESHES = 1;
const FERN_TRIS = 2;

// ── Quell-Chirurgie: einen Block ab Marker mit Klammer-Balance ausschneiden ─────────────
function schneide(quelle, marker) {
    const i = quelle.indexOf(marker);
    if (i < 0) return null;
    const start = quelle.indexOf("{", i);
    if (start < 0) return null;
    let tiefe = 0;
    for (let j = start; j < quelle.length; j++) {
        const c = quelle[j];
        if (c === "{") tiefe++;
        else if (c === "}") {
            tiefe--;
            if (tiefe === 0) return quelle.slice(i, j + 1);
        }
    }
    return null;
}

// KIND_POLICY aus der Quelle EXTRAHIEREN + AUSFÜHREN (verhaltensecht, kein Grep):
// dieselbe Tabelle, die der Stamm liest — ein Schöpfer-Edit fließt automatisch hierher.
function ladeKindPolicy(quelle) {
    const block = schneide(quelle, "AnazhRealm.KIND_POLICY = Object.freeze(");
    if (!block) return null;
    try {
        const AnazhRealm = {};
        // schneide endet am äußeren `}` — die Freeze-Klammer schließt hier.
        new Function("AnazhRealm", block + ");")(AnazhRealm);
        return AnazhRealm.KIND_POLICY || null;
    } catch (_e) {
        return null;
    }
}

// Eine Klassen-Methode als ECHTE Funktion instanzieren (Body unverändert — die
// Linse führt EXAKT den Stamm-Code aus, mit gestubbtem this/AnazhRealm).
function ladeMethode(quelle, name, argNamen) {
    const block = schneide(quelle, name + "(" + argNamen + ") {");
    if (!block) return null;
    const body = block.slice(block.indexOf("{"));
    try {
        return new Function("AnazhRealm", "return function(" + argNamen + ") " + body + ";");
    } catch (_e) {
        return null;
    }
}

// LOD_DISTANCES aus der Quelle (die EINE Distanz-Tabelle, `_foundryLodForEntry` liest sie).
function ladeLodDistances(quelle) {
    const block = schneide(quelle, "AnazhRealm.LOD_DISTANCES = ");
    if (!block) return null;
    try {
        const AnazhRealm = {};
        new Function("AnazhRealm", block + ";")(AnazhRealm);
        return AnazhRealm.LOD_DISTANCES || null;
    } catch (_e) {
        return null;
    }
}

// Der Bäcker-Kind-Wächter: die Positivliste der geurteilten Bake-Kinds als ECHTES Regex
// aus der Quelle (der EINE Chokepoint in `_tickImpostorBake`).
function ladeKindWaechter(quelle) {
    const m = quelle.match(/if \(bKind && !\/(\^\([^)]*\)\$)\/\.test\(bKind\)\)/);
    if (!m) return null;
    try {
        return new RegExp(m[1]);
    } catch (_e) {
        return null;
    }
}

// ── (P) + (M): die reine Prüf-Funktion über einer QUELLE → Liste roter Befunde ──────────
// (auch der Selbst-Test ruft sie — mit mutierter Quelle MUSS sie feuern.)
function pruefeQuelle(quelle) {
    const rot = [];
    // (P1) Die Policy-Zeile — verhaltensecht ausgeführt.
    const KP = ladeKindPolicy(quelle);
    if (!KP) rot.push("KIND_POLICY nicht extrahierbar/ausführbar (Tabellen-Chirurgie gerissen)");
    else if (!(KP.vehicle && KP.vehicle.impostor === true))
        rot.push(
            "KIND_POLICY.vehicle trägt KEIN impostor:true — die Fahrzeug-Fernstufe ist tot (gt bleibt Voll-Geometrie fern)"
        );
    // (P2) Der EINE Klassifikator urteilt kind "vehicle" → Impostor (echte Funktion).
    const istBaum = ladeMethode(quelle, "_foundryPresetIsTree", "preset");
    if (!istBaum) rot.push("_foundryPresetIsTree nicht instanzierbar");
    else if (KP) {
        const stub = { _foundry: { recipes: { gt: { kind: "vehicle" } } } };
        const urteil = istBaum({ KIND_POLICY: KP }).call(stub, "gt");
        if (urteil !== true)
            rot.push(
                "_foundryPresetIsTree(gt · kind vehicle) urteilt " +
                    urteil +
                    " statt true — der Serve-Chokepoint kennt die Politik nicht"
            );
    }
    // (P3) Der Bäcker-Kind-Wächter lässt vehicle durch (echtes Regex aus der Quelle).
    const waechter = ladeKindWaechter(quelle);
    if (!waechter) rot.push("Bäcker-Kind-Wächter (Positivliste in _tickImpostorBake) nicht gefunden");
    else {
        if (!waechter.test("vehicle"))
            rot.push("Kind-Wächter blockt vehicle (" + waechter + ") — der Bake fiele terminal rttFailed");
        if (waechter.test("weapon")) rot.push("Kind-Wächter lässt weapon durch — die Positivliste ist keine mehr");
    }
    // (P4) Die Serve-Chokepoints routen lod>=2 über GENAU diese Politik (Quell-Proben
    // am Chokepoint — Lehre 2: die Invariante lebt dort, nicht am Aufrufer).
    // V18.478 (Bäcker-ov): die Stempel-Wand ist GEFALLEN — geprägte Entries ziehen
    // jetzt IHRE ov-Karte (der fimp-Key trägt den ov-Hash), die Route ist ov-blind
    // für den ungeprägten Fall byte-alt. Die Proben wandern mit.
    if (
        !/lod >= 2 && this\._foundryPresetIsTree\(preset\)\) return this\._foundryBuildImpostorFlat\(entry, preset\);/.test(
            quelle
        )
    )
        rot.push("_foundryFlattenFor: die lod>=2-Impostor-Route fehlt (Fernstufe serviert Geometrie)");
    if (
        !/if \(lod >= 2 && this\._foundryPresetIsTree\(preset\)\) \{\s*\n\s*const peekOv = this\._artifactStudioOv\(entry\);/.test(
            quelle
        )
    )
        rot.push(
            "_foundryEntryReady: der Dock-Peek kennt die lod>=2-Impostor-Route (mit ov-Spiegel) nicht (Rewarm urteilt übers falsche Asset)"
        );
    // Bäcker-ov: der fimp-Key + das Bake-Subjekt (gkey) + der Bake tragen den ov-Hash.
    if (!/const ovH = ov && typeof ov === "object" \? "\|ov:" \+ this\._studioOvHash\(ov\) : "";/.test(quelle))
        rot.push(
            "_foundryEnsureImpostorRecord: der ov-Hash fehlt im fimp-Key (geprägte Karte kollabiert mit der ungeprägten)"
        );
    if (!/if \(ov && typeof ov === "object"\) msg\.ov = ov;/.test(quelle))
        rot.push("_foundryBakeImpostorRequest: die ov reist nicht zum Studio-Bäcker (die Karte bäckt ungeprägt)");
    // (M) DIE GERITTEN-WAND — verhaltensecht: Distanz-Autorität + Fahr-Pin.
    const lodFuer = ladeMethode(quelle, "_foundryLodForEntry", "entry");
    const D = ladeLodDistances(quelle);
    if (!lodFuer || !D) rot.push("_foundryLodForEntry/LOD_DISTANCES nicht instanzierbar");
    else {
        const fn = lodFuer({ LOD_DISTANCES: D });
        const pm = { x: 100, y: 5, z: -30 };
        const stub = { state: { playerMesh: { position: pm } } };
        // Fahr-Invariante: das gerittene Entry SITZT auf der Spieler-Position → Stufe 0.
        const geritten = fn.call(stub, { position: { x: pm.x, y: pm.y, z: pm.z } });
        if (geritten !== 0)
            rot.push(
                "gerittenes Entry (Distanz 0) urteilt Stufe " +
                    geritten +
                    " statt 0 — die Voll-Geometrie-Wand ist gerissen"
            );
        // Geparkt fern (500 m >> thresh12) → Stufe 2 = Impostor.
        const geparkt = fn.call(stub, { position: { x: pm.x + 500, y: pm.y, z: pm.z } });
        if (geparkt !== 2)
            rot.push("geparktes Entry (500 m) urteilt Stufe " + geparkt + " statt 2 — die Fernstufe greift nie");
    }
    // Der Fahr-Pin selbst (die Quell-Probe der Invariante, auf der (M) ruht):
    // _tickMountedMovement zieht entry.position frame-genau auf die Spieler-Position.
    if (!/entry\.position\.x = pm\.x;\s*\n\s*entry\.position\.z = pm\.z;/.test(quelle))
        rot.push(
            "_tickMountedMovement pinnt entry.position nicht mehr auf pm — die (M)-Invariante (geritten = Distanz 0) trägt nicht"
        );
    return rot;
}

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
    if (!(st.aspect > 0) || !isFinite(st.aspect)) rot.push(`aspect unbrauchbar: ${st.aspect}`);
    if (!(st.height > 0) || !isFinite(st.height)) rot.push(`height unbrauchbar: ${st.height}`);
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
    // 1. Die ECHTE Quelle muss (heute) grün sein — sonst ist die Welle nicht gebaut.
    faelle.push(["echte Quelle -> KEIN Befund", pruefeQuelle(STAMM).length === 0]);
    // 2. DER ALTE FEHLER: die Policy-Zeile fehlt (impostor:true gestrippt) -> MUSS feuern.
    const ohnePolicy = STAMM.replace(/(vehicle: Object\.freeze\(\{[^}]*?)\n\s*impostor: true,/, "$1");
    faelle.push([
        "ohne KIND_POLICY.vehicle impostor:true -> feuert (der alte gt-328-Meshes-Fehler)",
        ohnePolicy !== STAMM && pruefeQuelle(ohnePolicy).length > 0,
    ]);
    // 3. Der Kind-Wächter ohne vehicle -> MUSS feuern (Bake fiele terminal).
    const ohneWaechter = STAMM.replace("|gate|vehicle)$", "|gate)$");
    faelle.push([
        "ohne vehicle im Bäcker-Kind-Wächter -> feuert",
        ohneWaechter !== STAMM && pruefeQuelle(ohneWaechter).length > 0,
    ]);
    // 4. Die Serve-Route gerissen (Impostor-Zweig entfernt) -> MUSS feuern.
    // V18.478 (Bäcker-ov): die Stempel-Wand ist gefallen — die Mutation wandert mit
    // (regex-basiert; der !== STAMM-Guard macht ein No-op-Replace LAUT rot).
    const ohneRoute = STAMM.replace(
        /if \(lod >= 2 && this\._foundryPresetIsTree\(preset\)\) return this\._foundryBuildImpostorFlat\(entry, preset\);/,
        "if (false) return null;"
    );
    faelle.push([
        "ohne lod>=2-Impostor-Route in _foundryFlattenFor -> feuert",
        ohneRoute !== STAMM && pruefeQuelle(ohneRoute).length > 0,
    ]);
    // 4b. Der ov-Hash aus dem fimp-Key gestrippt -> MUSS feuern (geprägte Karte kollabiert).
    const ohneOvHash = STAMM.replace(
        'const ovH = ov && typeof ov === "object" ? "|ov:" + this._studioOvHash(ov) : "";',
        'const ovH = "";'
    );
    faelle.push([
        "ohne den ov-Hash im fimp-Key -> feuert (geprägte Karte kollabiert mit der ungeprägten)",
        ohneOvHash !== STAMM && pruefeQuelle(ohneOvHash).length > 0,
    ]);
    // 5. Die Geritten-Wand: LOD_DISTANCES pervertiert (alles ab 0 m = Stufe 2) -> MUSS feuern.
    // TRI-BUDGET (T2, 16.07.): die Default-Literale wanderten 20/40 → 12/26 (LOD_TRI_BUDGET_MUL).
    const ohneWand = STAMM.replace("thresh01: 12,", "thresh01: -1,").replace("thresh12: 26,", "thresh12: -1,");
    faelle.push([
        "Distanz-Autorität pervertiert (geritten = Stufe 2) -> feuert",
        ohneWand !== STAMM && pruefeQuelle(ohneWand).length > 0,
    ]);
    // 6. Bäcker-Prüfung: leere Karte / null payload -> MUSS feuern.
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
            aspect: 0.5,
            height: 2,
        }).length > 0,
    ]);
    // 7. Diät-Messung: Nah == Fern -> MUSS feuern (vakuöse Messung).
    faelle.push(["Diät: nah == fern -> feuert", pruefeDiaet({ meshes: 1, tris: 2 }).length > 0]);
    let ok = true;
    console.log("===== (S) SELBST-TEST DER LINSE (Quell-Mutation, GPU-frei) =====");
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
  const boot =
    "self.__PHYTO_FOUNDRY_WORKER=true;" +
    "self.__anazhCores=" + JSON.stringify(${JSON.stringify(CORES_MANIFEST)}) + ";" +
    "importScripts(" + ${JSON.stringify(WORKER_SCRIPTS)}.map((p) => JSON.stringify(location.origin + p)).join(",") + ");" +
    "init();";
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
      got: true, payloadNull: false, cw: p.cw, ch: p.ch, V: p.V, aspect: p.aspect, height: p.height,
      albedoLen: a.length, alphaPx: alphaPx(a),
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
    const rot = pruefeQuelle(STAMM);
    console.log("\n===== (P/M) POLICY · CHOKEPOINTS · GERITTEN-WAND (verhaltensecht aus der Quelle) =====");
    console.log(
        rot.length === 0
            ? "  ✅ Policy vehicle.impostor:true · Klassifikator urteilt vehicle→Impostor · Wächter offen · Serve-Routen stehen · geritten=L0 / 500 m=L2"
            : "  (Befunde unten)"
    );

    // ── (N/K) Die echte Bäckerei im Foundry-Worker ──
    const server = http.createServer((req, res) => {
        let p = req.url.split("?")[0];
        if (p === "/" || p === "/__ff.html") {
            res.setHeader("Content-Type", "text/html");
            return res.end(pageHtml());
        }
        const fp = path.join(ROOT, p);
        if (!fp.startsWith(ROOT)) return ((res.statusCode = 403), res.end());
        fs.readFile(fp, (err, data) => {
            if (err) return ((res.statusCode = 404), res.end());
            res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
            res.end(data);
        });
    });
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 240000,
        args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--no-sandbox", "--disable-setuid-sandbox"],
    });
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
                `  Impostor-Karte: cw=${bake.cw} ch=${bake.ch} V=${bake.V} · Alpha-Px=${bake.alphaPx} · aspect=${Number(bake.aspect).toFixed(3)} · height=${Number(bake.height).toFixed(2)} m`
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
        "\n✅ GRÜN — die Fahrzeug-Fernstufe steht auf der Tor-Spur: geparkt fern = nicht-leere 8-Winkel-Karte (1 Quad) statt der vollen L0-Geometrie, geritten bleibt Voll-Geometrie (Distanz-0-Wand), der Bäcker-Kanal trägt vehicle."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Harness-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
