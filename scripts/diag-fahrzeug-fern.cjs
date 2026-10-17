// diag-fahrzeug-fern.cjs — DIE FAHRZEUG-FERNSTUFEN-LINSE (Matrix-Zelle fahrzeug.lods,
// das Tor-Präzedenz V18.465 1:1 gespiegelt): ein GEPARKTES Fahrzeug fern serviert das
// 8-Winkel-Billboard (die Welt bäckt es aus seiner L1-Gestalt, `_karteWeltBacken`) statt seiner vollen
// L0-Geometrie (gt: hunderte Meshes auf JEDE Distanz — der alte Fehler); ein
// GERITTENES Fahrzeug bleibt Voll-Geometrie (die statische Wand).
//
// VIER PRÜF-FAMILIEN:
//   (S) SELBST-TEST (nicht vakuös): dieselben Prüfungen auf MUTIERTER Quelle —
//       ohne die Policy-Zeile (`impostor: true` in KIND_POLICY.vehicle) MUSS die
//       Linse rot urteilen.
//   (P) POLICY + CHOKEPOINTS (Quelle, verhaltensecht evaluiert, kein blosser Grep):
//       KIND_POLICY wird aus dem Stamm extrahiert und AUSGEFÜHRT (vehicle.impostor
//       === true) · `_foundryPresetIsTree` wird als ECHTE Funktion instanziert und
//       urteilt kind "vehicle" → true · die Serve-Chokepoints (`_foundryFlattenFor` +
//       `_foundryEntryReady`) routen lod>=2 über GENAU diese Politik.
//   (M) GERITTEN-WAND (verhaltensecht): `_foundryLodForEntry` wird als ECHTE
//       Funktion instanziert — ein Entry AUF der Spieler-Position (das ist die
//       Fahr-Invariante: `_tickMountedMovement` pinnt entry.position auf pm, per
//       Quell-Probe belegt) urteilt Stufe 0 (< 2 → nie Impostor, Voll-Geometrie);
//       dasselbe Entry 500 m fern urteilt Stufe 2 (Impostor).
//   (N) DIE KARTEN-QUELLE (puppeteer + Foundry-WEB-WORKER): das ERSTE vehicle-Rezept aus dem LIVE-Buch (get-book)
//       liefert eine NICHT-LEERE L1-Gestalt (aus ihr bäckt die Welt die Karte), und die Mess-Zahl reist in den Bericht:
//       L0-Meshes/-Tris (build-asset lod 0) gegen die Fernstufe (1 Quad = 2 Tris, das Einheits-Quad des Karten-Atlas `_impostorQuad`).
//
//   node scripts/diag-fahrzeug-fern.cjs        (exit 0 = GRÜN, 1 = ROT, 2 = Harness-Fehler)
const { statikServer, starteBrowser } = require("./lib/welt-boot.cjs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const { WORKER_BOOT } = require("./lib/asset-worker-harness.cjs");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.env.FAHRZEUG_FERN_PORT || 4553);
const STAMM = stammLib.text(ROOT);

// Die Fernstufe des Wirts: EIN camera-facing Quad (`_impostorQuad`, VC=6).
const FERN_MESHES = 1;
const FERN_TRIS = 2;

// ── Quell-Chirurgie: der EINE Rumpf-Schneider (scripts/lib/stamm.cjs) — der Block an seinem Kopf ─────────────

// Die Render-Karte des Kerns (foundry-core PORTAL_RENDER_CONFIG, reine Daten) — die EINE Quelle der Stufen-Distanzen (K2).
const KERN_RENDER = new Function(
    "const PORTAL_RENDER_CONFIG = " +
        stammLib.rumpf(require("fs").readFileSync(path.join(ROOT, "foundry-core.js"), "utf8"), /const PORTAL_RENDER_CONFIG = \{/) +
        "; return PORTAL_RENDER_CONFIG;"
)();

// Eine Stamm-Konstante aus der Quelle AUSGEFÜHRT (verhaltensecht, kein Grep): KIND_POLICY (die Tafel, die der Stamm liest)
// und LOD_DISTANCES (die EINE Distanz-Tabelle von `_foundryLodForEntry`; K2: sie liest das Kern-Gesetz
// `terrain:PORTAL_RENDER_CONFIG.lod` — der Stub löst den Pfad über `render` auf, fail-closed wirft). Der Kopf der Zuweisung
// steht genau einmal im Stamm (stammLib.treffer), der Block an ihm kommt vom EINEN Schneider (stammLib.rumpf); `schluss`
// schließt, was der Block offen lässt (die Freeze-Klammer bzw. der Ruf der Funktion).
function ladeKonstante(quelle, name, marker, schluss, render) {
    const kopf = new RegExp(("AnazhRealm." + name + " = " + marker).replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[^{;]*\\{");
    const m = stammLib.treffer(quelle, null, kopf);
    const rumpf = m && stammLib.rumpf(quelle, kopf);
    const block = rumpf && m[0].slice(0, -1) + rumpf;
    if (!block) return null;
    const kern = (p) => (p.startsWith("terrain:") ? { PORTAL_RENDER_CONFIG: render } : null);
    const AnazhRealm = {
        Gesetz: (p) => p.split(":")[1].split(".").reduce((o, k) => (o == null ? o : o[k]), kern(p)),
        _kernPflichtBruch: (p) => {
            throw new Error("KERN-PFLICHT " + p);
        },
    };
    try {
        new Function("AnazhRealm", block + schluss)(AnazhRealm);
        return AnazhRealm[name] || null;
    } catch (_e) {
        return null;
    }
}

// Eine Klassen-Methode als ECHTE Funktion instanzieren (Body unverändert — die
// Linse führt EXAKT den Stamm-Code aus, mit gestubbtem this/AnazhRealm).
function ladeMethode(quelle, name, argNamen) {
    const body = stammLib.rumpf(quelle, name);
    if (!body) return null;
    try {
        return new Function("AnazhRealm", "return function(" + argNamen + ") " + body + ";");
    } catch (_e) {
        return null;
    }
}

// ── (P) + (M): die reine Prüf-Funktion über einer QUELLE → Liste roter Befunde ──────────
// (auch der Selbst-Test ruft sie — mit mutierter Quelle MUSS sie feuern.)
function pruefeQuelle(quelle, render = KERN_RENDER) {
    const rot = [];
    // (P1) Die Policy-Zeile — verhaltensecht ausgeführt.
    const KP = ladeKonstante(quelle, "KIND_POLICY", "Object.freeze(", ");");
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
        !/if \(lod >= 2 && this\._foundryPresetIsTree\(preset\)\) \{\s*\n\s*const key = "fimp:" \+ this\._foundryKartenKey\(preset, variant, this\._artifactStudioOv\(entry\)\);/.test(
            quelle
        )
    )
        rot.push(
            "_foundryEntryReady: der Dock-Peek kennt die lod>=2-Impostor-Route (mit ov-Spiegel) nicht (Rewarm urteilt übers falsche Asset)"
        );
    // Karten-ov: der fimp-Key trägt den ov-Hash, die Welt bäckt aus dem geprägten Körper (V18.527: die EINEN
    // Schlüssel-Münzer `_foundryKartenKey`/`_foundryKoerperKey` hängen ihn an).
    if (
        !/const key = "fimp:" \+ this\._foundryKartenKey\(preset, variant, ovK\);/.test(quelle) ||
        !/_foundryKartenKey\([^)]*\) \{\s*\n\s*return preset \+ "\|" \+ gestalt \+ \(ov \? "\|ov:" \+ this\._studioOvHash\(ov\) : ""\);/.test(
            quelle
        )
    )
        rot.push(
            "_foundryEnsureImpostorRecord: der ov-Hash fehlt im fimp-Key (geprägte Karte kollabiert mit der ungeprägten)"
        );
    // (M) DIE GERITTEN-WAND — verhaltensecht: Distanz-Autorität + Fahr-Pin.
    const lodFuer = ladeMethode(quelle, "_foundryLodForEntry", "entry");
    const D = ladeKonstante(quelle, "LOD_DISTANCES", "", ")();", render);
    const wahl = ladeMethode(quelle, "_chooseLODForDistance", "distance, currentLOD, visHeight");
    if (!lodFuer || !D || !wahl) rot.push("_foundryLodForEntry/_chooseLODForDistance/LOD_DISTANCES nicht instanzierbar");
    else {
        const fn = lodFuer({ LOD_DISTANCES: D });
        const pm = { x: 100, y: 5, z: -30 };
        // Der Schätzer fragt die EINE Stufen-Wahl (`_chooseLODForDistance`) mit der Sichthöhe (`_lodTreeVisHeight`,
        // ein Fahrzeug ist kein Baum: 0 = rohe Distanz) — beide aus der Quelle, nie nachgebaut.
        // Die Stufen-Wahl misst vom Auge der Stufen (`_lodAuge`, K36): der Reiter sitzt im Gefährt, das Ego-Auge mit ihm.
        const stub = {
            state: { playerMesh: { position: pm } },
            _lodAuge: () => pm,
            _chooseLODForDistance: wahl({ LOD_DISTANCES: D }),
            _lodTreeVisHeight: () => 0,
            _ankunftsFerne: () => 1, _archStufenGrenzen: () => null, // die Ankunft ist vorbei (B2), keine Grenzen (K43)
        };
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
    // 1. Die ECHTE Quelle muss (heute) grün sein — sonst ist die Welle nicht gebaut.
    faelle.push(["echte Quelle -> KEIN Befund", pruefeQuelle(STAMM).length === 0]);
    // 2. DER ALTE FEHLER: die Policy-Zeile fehlt (impostor:true gestrippt) -> MUSS feuern.
    const ohnePolicy = stammLib.ersetze(STAMM, null, /(vehicle: Object\.freeze\(\{[^}]*?)\n\s*impostor: true,/, "$1");
    faelle.push([
        "ohne KIND_POLICY.vehicle impostor:true -> feuert (der alte gt-328-Meshes-Fehler)",
        ohnePolicy !== STAMM && pruefeQuelle(ohnePolicy).length > 0,
    ]);
    // 4. Die Serve-Route gerissen (Impostor-Zweig entfernt) -> MUSS feuern.
    // V18.478 (Bäcker-ov): die Stempel-Wand ist gefallen — die Mutation wandert mit
    // (regex-basiert; der !== STAMM-Guard macht ein No-op-Replace LAUT rot).
    const ohneRoute = stammLib.ersetze(STAMM, "_foundryFlattenFor",
        /if \(lod >= 2 && this\._foundryPresetIsTree\(preset\)\) return this\._foundryBuildImpostorFlat\(entry, preset\);/,
        "if (false) return null;"
    );
    faelle.push([
        "ohne lod>=2-Impostor-Route in _foundryFlattenFor -> feuert",
        ohneRoute !== STAMM && pruefeQuelle(ohneRoute).length > 0,
    ]);
    // 4b. Der ov-Hash aus dem fimp-Key gestrippt -> MUSS feuern (geprägte Karte kollabiert).
    const ohneOvHash = stammLib.ersetze(STAMM, "_foundryKartenKey",
        'return preset + "|" + gestalt + (ov ? "|ov:" + this._studioOvHash(ov) : "");',
        'return preset + "|" + gestalt;'
    );
    faelle.push([
        "ohne den ov-Hash im fimp-Key -> feuert (geprägte Karte kollabiert mit der ungeprägten)",
        ohneOvHash !== STAMM && pruefeQuelle(ohneOvHash).length > 0,
    ]);
    // 5. Die Geritten-Wand: LOD_DISTANCES pervertiert (alles ab 0 m = Stufe 2) -> MUSS feuern.
    // Die Autorität ist das Kern-Gesetz (K2: der Stamm liest PORTAL_RENDER_CONFIG.lod, keine Zahl im Stamm) — pervertiert dort.
    const pervers = { ...KERN_RENDER, lod: { ...KERN_RENDER.lod, d0: -1, d1: -1 } };
    faelle.push(["Distanz-Autorität pervertiert (geritten = Stufe 2) -> feuert", pruefeQuelle(STAMM, pervers).length > 0]);
    // Ein unlesbares Gesetz (Blatt fehlt) bricht fail-closed laut — die Linse nennt die Tabelle nicht instanzierbar.
    const ohneBlatt = { ...KERN_RENDER, lod: { ...KERN_RENDER.lod, hyst: undefined } };
    faelle.push(["Kern-Gesetz ohne hyst -> feuert (fail-closed)", pruefeQuelle(STAMM, ohneBlatt).length > 0]);
    // 6. Karten-Quelle leer -> MUSS feuern.
    faelle.push(["Karten-Quelle: leere L1-Gestalt -> feuert", pruefeGestalt({ meshes: 0, tris: 0 }).length > 0]);
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
    const rot = pruefeQuelle(STAMM);
    console.log("\n===== (P/M) POLICY · CHOKEPOINTS · GERITTEN-WAND (verhaltensecht aus der Quelle) =====");
    console.log(
        rot.length === 0
            ? "  ✅ Policy vehicle.impostor:true · Klassifikator urteilt vehicle→Impostor · Serve-Routen stehen · geritten=L0 / 500 m=L2"
            : "  (Befunde unten)"
    );

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
        "\n✅ GRÜN — die Fahrzeug-Fernstufe steht auf der Tor-Spur: geparkt fern = nicht-leere 8-Winkel-Karte (1 Quad) statt der vollen L0-Geometrie, geritten bleibt Voll-Geometrie (Distanz-0-Wand), der Bäcker-Kanal trägt vehicle."
    );
    process.exit(0);
})().catch((e) => {
    console.error("Harness-Fehler:", (e && e.stack) || e);
    process.exit(2);
});
