#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-boot-stage.cjs — „VOLLE BÜHNE" ALS PRÄDIKAT (W2) und DIE KALT-ZEILE (K30, Pflicht-OFFEN B; ankunft K1–K3)
//
// Die volle Bühne ist ein PRÄDIKAT aus kanonischen Quellen (nichts hartkodiert, die Impostor-Erwartung aus der Bibliothek):
//   RING ≥ Ziel · GRAS/WASSER ohne Wartende · STREU `_streuWartet` 0 (keine Region fehlt, wartet auf ihr Asset oder trägt
//   eine offene Scheibe; eine fehlende Regionen-Karte heißt „der Streamer lief noch nie") · BIBLIO Foundry ready + Prefetch
//   fertig · IMPOST Bake-Queue leer (nur mit Renderer) · LUFT die EINE Luftperspektive (scene.fogNode, Sichtweite ≥ 5 km).
// Der Null-Renderer nennt den Takt, in dem das Prädikat schließt — eine Zeit trägt er nicht (die Wanduhr des Containers war ein
// Anhalt, und `_weltbildDa` ist die Eigenmeldung: die Zeit misst die Kalt-Zeile von außen). --selftest: die Bühnen-Wahrheit
// liest dieselbe Streu (die wartende Region trägt gate:ankunft L2a).   node scripts/diag-boot-stage.cjs [--selftest]
//
// DIE KALT-ZEILE: `--kalt` bootet mit echtem Renderer und LEEREM Profil (IDB leer, wie nach jedem Versions-Update) und nennt
// je Sekunde, worauf das erste Weltbild wartet (`_weltbildFehlt`), die blockierten ms des Haupt-Threads (benannt: Boden,
// Streu, Bauten, Gruppen-Bau, Buch, Ort-Wahl, Dorf und der Erst-Bau der Zeichnung aus `_erstZeichnung`), offene Pipelines,
// die Phase des Vorrats (`f._vorrat` wörtlich) und die Foundry-Schlange; der Adapter vom Gerät (`device.adapterInfo`).
// DIE KONTROLLE VON AUSSEN (ankunft K1): t = die Prozess-Uhr ab Navigation, als die gehaltene Taste W den Leib um ≥ 0,1 m trug
// — nie `_weltbildDa` (die Eigenmeldung steht daneben). Urteil: t ≤ 5 s ohne halbes Weltbild (kalt: Pflicht-OFFEN B; mit
// `--profil` am Zweit-Boot: die Wiederkehr, ankunft K3). `--bild`: das Bild der Kontrolle gegen dieselbe Pose nach 60 s Ruhe
// (ankunft K2: ≤ 2 % Lücke, nichts offen im Bild). `--mutante eigenmeldung|bild`: die Schlupflöcher, ROT beim Namen.
// Ohne `--echt` swiftshader, mit `--echt` die Hardware-GPU (1920×1080).
//   node scripts/diag-boot-stage.cjs --kalt [--echt] [--profil ordner] [--json datei] [--bild kontrolle.png] [--mutante m]
//
// DIE LIEFER-ZEILE (pipeline.K4 Stufe 1): die Kalt-Zeile liest die Liefer-Marke des Spiels (`_foundryLiefer`: Körper-Aufträge,
// Antworten von der Platte · im Werk gebaut · leer, Güsse des Haupt-Fadens). Mit `--profil` wartet sie auf die Ruhe der Foundry
// (der Erst-Boot füllt die Platte ganz); am Zweit-Boot urteilt sie: ≥ 95 % von der Platte, kein Auftrag verschluckt.
// --selftest verschluckt eine Lieferung (Null-Renderer) — die Zeile ist ROT beim Namen.
// DIE ART-ZEILE (pipeline.K4 Stufe 2): am Zweit-Boot Blatt-Atlas, Dorf-Export und Karten je ganz von der Platte, dazu die
// Haupt-Faden-ms ihrer Erzeuger (die Liefer-Marke zählt sie). Jeder Lauf mit `--profil` legt die Liste seiner Lieferungen
// (Art · Rest · Weg · Kerne) ins Profil; `--kern-wechsel <kern>` serviert die Skripte des Kerns mit einem Kommentar mehr
// (sein Gesetz-SHA springt) und urteilt gegen die Liste davor: nur seine Leser bauen neu — ein fremder Neubau dessen, was
// die Platte trug, ist ROT beim Namen, ebenso ein Leser, der noch von der Platte kommt (`wechselUrteil`; --selftest füttert
// es mit Bruch-Daten).
// ─────────────────────────────────────────────────────────────────────────
const { statikServer, starteBrowser, sleep, hauptLauf, nullSeite, urteilEnde, pngDatei } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");
const os = require("os");

const PORT = Number(process.env.BOOT_STAGE_PORT || 4406);
const ARGV = process.argv.slice(2);
const OPT = (k) => ARGV.includes(k) && ARGV[ARGV.indexOf(k) + 1];
// Das Soll der Ankunft (docs/PFLICHT-OFFEN.md B, roadmap §0.v1 Schritt 1): kalt bis Kontrolle ≤ 5 s.
// Die Kontrolle von außen (ankunft K1): die Taste trägt den Leib ≥ 0,1 m; nach 1500 Atemzügen ohne Weg hat er sie nie.
// Das ganze Bild (ankunft K2 Staffel 1): ≤ 2 % der Pixel weichen gegen dieselbe Pose nach 60 s Ruhe um mehr als ein Achtel ab.
const [ANKUNFT_SOLL_MS, KONTROLLE_M, KONTROLLE_DRUECKE, RUHE_MS, LUECKE_SOLL] = [5000, 0.1, 1500, 60000, 0.02];
const KERN = require("../cores.manifest.json").find((k) => k.id === OPT("--kern-wechsel"));
const server = statikServer({ wandle: (p, roh) => (KERN?.scripts.includes(p.slice(1)) ? roh + "//" : roh) });
// (Seite) trägt die gehaltene Taste den Leib um `m`? Der Weg in einem Atem von 200 ms, waagrecht — der Fall zählt nicht.
async function LEIB_WEG(m) {
    const p = () => r?.state.playerMesh?.position;
    const a = p() && p().clone();
    await window.sleep(200);
    return !!a && Math.hypot(p().x - a.x, p().z - a.z) >= m;
}
// (Seite) DER SCHUSS DER KONTROLLE: der Loop ruht, dieselbe Pose (der erste Schuss merkt die Kamera, der zweite stellt sie
// zurück), die Bühne hält Mittag · Sonne · Sommer, der Mess-Frame wartet auf keine stehende Welt. Der zweite Schuss zählt die
// Pixel, die gegen den ersten in einem Kanal um mehr als 32 abweichen — die Lücke. `mut`: der Schuss endet nach 20 m.
async function SCHUSS(W, H, mut, r = window.anazhRealm, cam = r.state.camera) {
    const P = window.__pose || (window.__pose = [cam.position.clone(), cam.quaternion.clone()]);
    r.state.renderer.setAnimationLoop(null);
    const far = cam.far;
    cam.position.copy(P[0]);
    cam.quaternion.copy(P[1]);
    cam.far = mut ? 20 : far;
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
    window.__buehne();
    let auf = null;
    try {
        for (let i = 0; i < 2; i++)
            (r._schattenAlleNeu(), (auf = await window.__ausgabeAufnahme(W, H, 1, { satz: "messung" })));
    } finally {
        cam.far = far;
        cam.updateProjectionMatrix();
        r.state.renderer.setAnimationLoop(r._gameLoopTick);
    }
    const u = auf.u8.slice(0, W * H * 4);
    const A = (window.__schussA = window.__schussA || u);
    let n = 0;
    for (let i = 0; i < u.length; i += 4) n += [0, 1, 2].some((k) => Math.abs(u[i + k] - A[i + k]) > 32);
    return { dc: auf.info.drawCalls, dreiecke: auf.info.triangles, luecke: n / (W * H), png: window.__png(u, W, H) };
}
// die Seite wartet Takt um Takt (`__gebautNach`), bis die Foundry nichts mehr offen hat (`_weltOffen`) und der Vorrat durch ist —
// dann gilt ihre Liefer-Marke
const RUHE = (r = window.anazhRealm) =>
    window
        .__gebautNach("die Ruhe der Foundry", { fertig: () => !r._weltOffen().foundry && !r._foundry._vorrat && !(r._impostorBakeQueue || []).length, max: 600 })
        .then(() => r._foundry.lieferung);
// DER GEPFLANZTE BRUCH (--selftest): die erste Körper-Antwort nach dem Erwachen verschluckt der Haupt-Faden, ihr Leser bekommt null
function SCHLUCK() {
    window.__weltDa((r) => r._foundry).then((r) => {
        r._foundryAntwort = (f, m) => {
            const p = m.type === "asset" && f.pending.get(m.reqId);
            if (!p) return Object.getPrototypeOf(r)._foundryAntwort.call(r, f, m);
            delete r._foundryAntwort;
            f.pending.delete(m.reqId);
            p(null);
        };
    });
}
// die Liefer-Zeile aus der Marke: jede Lieferung zählt (auch der Guss des Haupt-Fadens), ein Auftrag ohne Antwort ist verschluckt
function lieferUrteil(roh, zweit) {
    const L = Object.assign({ auftrag: 0, platte: 0, werk: 0, leer: 0, haupt: 0 }, roh);
    const n = L.platte + L.werk + L.leer + L.haupt;
    const weg = L.auftrag + L.haupt - n;
    const q = n ? L.platte / n : 0;
    const je = ["blatt-atlas", "dorf-export", "karte"].map((k) => [k, Object.assign({ platte: 0, werk: 0, haupt: 0, ms: 0 }, L.je?.[k])]);
    return {
        weg,
        gruen: zweit && !weg && q >= 0.95,
        zeile: `LIEFERUNG ${zweit ? "zweit" : "kalt"}: ${L.platte} von ${n} von der Platte (${(q * 100).toFixed(1)} %) · Werk ${L.werk} · Haupt-Faden ${L.haupt} · leer ${L.leer} · verschluckt ${weg}`,
        artGruen: zweit && je.every(([, J]) => J.platte && !J.werk && !J.haupt),
        artZeile: `LIEFERUNG je Art: ${je.map(([k, J]) => `${k} ${J.platte}/${J.platte + J.werk + J.haupt} ${Math.round(J.ms)} ms`).join(" · ")}`,
    };
}
// DAS URTEIL DES KERN-WECHSELS über die Listen [Art, Rest, Weg, Kerne] zweier Boots: `neu` sind die neu gebauten Leser
function wechselUrteil(vor, nach, kern) {
    const [trug, neu, fremd, alt] = [new Set(vor.filter((z) => z[2] === "platte").map((z) => z[1])), new Set(), [], []];
    for (const [, rest, weg, kerne] of nach) {
        const liest = kerne.split(",").includes(kern);
        if (weg === "platte" && liest && !neu.has(rest)) alt.push(rest);
        if (weg === "werk" || weg === "haupt") liest ? neu.add(rest) : trug.has(rest) && fremd.push(rest);
    }
    return {
        gruen: neu.size > 0 && !fremd.length && !alt.length,
        zeile: `KERN-WECHSEL ${kern}: ${neu.size} Leser neu · fremd ${fremd.length} ${fremd.slice(0, 6)} · alt ${alt.length} ${alt.slice(0, 6)}`,
    };
}

// ── DIE KALT-ZEILE (`--kalt`): die Probe je 200 ms in der Seite, ab dem ersten Skript ──
function KALT_PROBE() {
    const A = (window.__kalt = { proben: [], lang: [] });
    new PerformanceObserver((l) => {
        for (const e of l.getEntries()) A.lang.push([Math.round(e.startTime), Math.round(e.duration)]);
    }).observe({ type: "longtask", buffered: true });
    let gewickelt = false;
    // die Haupt-Thread-Zeit je Sekunde der schweren Ankunfts-Arbeiter (synchron gemessen; verschachtelt zählt doppelt, nur in der Klasse Pflanzen der Äußere)
    A.kosten = {};
    const KOSTEN = {
        _buildVoxelChunkDataFromWorkerMesh: "Boden",
        _buildVoxelChunkData: "Boden",
        _scatterRegion: "Streu",
        _rebuildArchitectureMesh: "Bauten",
        _foundryBuildGroup: "Gruppen-Bau",
        _foundryIngestBook: "Buch",
        _spawnSettlementSlot: "Dorf",
        // DIE KLASSE PFLANZEN (B): die Saat der Chunks, der Plan des Walds, die Gestalt des Orts — in der Familie zählt der
        // Äußere (die Gestalt in der Streu ist Streu), ihre Summe bis zum Bild steht in der Klassen-Zeile
        _populateVoxelChunkVegetation: "Saat",
        _forestPlantChunk: "Saat",
        _tickWaldPlan: "Wald-Plan",
        _ortGestaltSame: "Gestalt",
    };
    const PFLANZEN = new Set(["Streu", "Saat", "Wald-Plan", "Gestalt"]);
    A.vorBild = {};
    let pTief = 0;
    // WANN der Vorrat wartet und bestellt, sagt sein Merker (`f._vorrat`, je Sekunde unten); dass er erst nach dem ersten Bild
    // bestellt, urteilt gate:ankunft L2a — die Kalt-Zeile zählt nur noch die Arbeit vor dem Bild
    const wickle = (P) => {
        for (const [name, k] of Object.entries(KOSTEN)) {
            const alt = P[name];
            if (typeof alt === "function")
                P[name] = function (...a) {
                    const [t0, pf] = [performance.now(), PFLANZEN.has(k)];
                    const aussen = !pf || !pTief;
                    pTief += pf;
                    try {
                        return alt.apply(this, a);
                    } finally {
                        const [t1, z, sek] = [performance.now(), (A.kosten[k] = A.kosten[k] || {}), Math.floor(t0 / 1000)];
                        pTief -= pf;
                        if (aussen) z[sek] = (z[sek] || 0) + t1 - t0;
                        if (pf && aussen && !r.state._weltbildDa) A.vorBild[k] = (A.vorBild[k] || 0) + t1 - t0;
                        if (name === "_foundryIngestBook" && !A.buchDa) A.buchDa = Math.round(t1);
                    }
                };
        }
    };
    setInterval(() => {
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
                o.schlange = `${(f.warte || []).length} wartend · ${f.pending.size} im Werk`; // der Bäcker fiel mit S2
            }
            // der Erst-Bau der Zeichnung (der Stamm zählt ihn selbst, `_erstZeichnung`): Bauten · ms Haupt-Thread · offene Pipelines
            const E = r._erstZeichnung;
            if (E) o.erst = [E.bauN, Math.round(E.bauMs), E.offen ? E.offen.size : 0];
        }
        A.proben.push(o);
    }, 200);
}

async function kaltLauf() {
    const ECHT = ARGV.includes("--echt");
    // ohne `--echt` die EINE Weiche (K40: lokal der Hardware-Adapter, die CI swiftshader, `LINSE_GPU=software` der Rückweg),
    // und der Lauf nennt seinen Adapter, damit keine Kalt-Zeile ein swiftshader-Ergebnis als Radeon ausgibt
    await server.lausche(PORT);
    // DIE ZWEIT-ZEILE (1310-16): `--profil <ordner>` hält das Profil (die Foundry-Platte, der HTTP-Cache) über den Lauf hinaus —
    // der erste Lauf in einem neuen Ordner ist kalt, jeder weitere ein Zweit-Boot; ohne die Option ein leeres Wegwerf-Profil.
    // Mit ihr wartet die Zeile auf die Ruhe der Foundry: der Erst-Boot füllt die Platte ganz, der Zweit-Boot zählt jede Lieferung.
    const profilBenannt = OPT("--profil");
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
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(KALT_PROBE);
    // DIE MUTANTE (`--mutante eigenmeldung`, das Schlupfloch von ankunft K1): die Eigenmeldung steht ab dem Erwachen — die
    // Kontrolle von außen folgt ihr nie; `--mutante bild`: der erste Schuss endet nach 20 m, die Welt dahinter fehlt (ROT)
    const MUT = OPT("--mutante");
    if (MUT === "eigenmeldung")
        await page.evaluateOnNewDocument(() =>
            window.__weltDa().then((r) => (r.state._weltbildDa = performance.now()))
        );
    const t0 = Date.now();
    await server.zeige(page, 120000);
    // DIE KONTROLLE VON AUSSEN (ankunft K1–K3, nie die Eigenmeldung `_weltbildDa`): der Spieler hält W über das Protokoll des
    // Browsers; je Atem schickt er den Druck neu (Autorepeat — der Ladeschirm hält jede Taste, die erste nach ihm gilt), bis
    // die Taste den Leib um ≥ KONTROLLE_M trägt: t ist die Prozess-Uhr ab Navigation, als der Weg gesehen wurde.
    let [tK, druecke] = [0, 0];
    for (; !tK && druecke++ < KONTROLLE_DRUECKE; await page.keyboard.down("KeyW"))
        if (await page.evaluate(LEIB_WEG, KONTROLLE_M)) tK = Date.now() - t0;
    await page.keyboard.up("KeyW");
    // DAS BILD DER KONTROLLE (`--bild datei.png`, ankunft K2): der Schuss bei t(Kontrolle) aus dem Ausgabe-Pfad
    // (scripts/lib/ausgabe-aufnahme.cjs) und derselbe nach RUHE_MS Ruhe (der Loop läuft), daneben `<datei>-ruhe.png`; dazu der
    // offene Bedarf im Bild in dem Moment (`_weltbildLuecken`, im Blick)
    const offen = tK ? await page.evaluate(() => r._weltbildFehlt()) : [];
    const bildDatei = OPT("--bild");
    let bild = null;
    if (tK && bildDatei) {
        const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
        await page.evaluate(AUSGABE_INSTALL);
        const schuss = async (mut, datei) => {
            const s = await page.evaluate(SCHUSS, ECHT ? 960 : 640, ECHT ? 540 : 360, mut);
            pngDatei(datei, s.png);
            return Object.assign(s, { png: datei });
        };
        const a = await schuss(MUT === "bild", path.resolve(bildDatei));
        await sleep(RUHE_MS);
        bild = Object.assign(await schuss(false, path.resolve(bildDatei).replace(/(\.png)?$/, "-ruhe.png")), { a });
    }
    if (tK && profilBenannt) await page.evaluate(RUHE);
    const out = await page.evaluate((r = window.anazhRealm, st = r.state) => {
        // der Adapter vom Gerät, das zeichnet: r184 hält den Adapter nicht (WebGPUBackend.init, lokal)
        let adapter = null;
        try {
            const i = st.renderer.backend.device.adapterInfo;
            adapter = [i.vendor, i.architecture, i.device, i.description].filter(Boolean).join(" ") || null;
        } catch {}
        return Object.assign({}, window.__kalt, {
            weltbildDa: Math.round(st._weltbildDa),
            holz: st._holzProfil || null,
            version: r.constructor.VERSION,
            adapter,
            ohne: (st.logBuffer || []).filter((z) => /Das erste Weltbild steht ohne/.test(z)),
            lieferung: r._foundry.lieferung,
        });
    });
    const liste = path.join(profil, "lieferung.json");
    const wechsel = KERN && wechselUrteil(JSON.parse(fs.readFileSync(liste)), out.lieferung.liste, KERN.id);
    if (profilBenannt && !KERN) fs.writeFileSync(liste, JSON.stringify(out.lieferung.liste));
    Object.assign(out, { tK, druecke, offen, bild, zweit });
    await browser.close();
    server.close();
    if (!profilBenannt) fs.rmSync(profil, { recursive: true, force: true });
    const json = OPT("--json");
    if (json) fs.writeFileSync(json, JSON.stringify(out, null, 1));
    // je Sekunde: der Stand am Ende der Sekunde (die letzte Probe) und die blockierten ms des Haupt-Threads
    const S = Math.ceil((tK || out.weltbildDa) / 1000);
    const blockiert = new Array(S + 1).fill(0);
    for (const [s, d] of out.lang)
        for (let a = s, b, k; a < s + d; a = b) {
            k = Math.floor(a / 1000);
            b = Math.min(s + d, (k + 1) * 1000);
            if (k <= S) blockiert[k] += b - a;
        }
    console.log(
        `\n=== DIE ${zweit ? "ZWEIT-ZEILE (Profil mit Platte)" : "KALT-ZEILE (leeres Profil)"} — ${ECHT ? "echte GPU" : "swiftshader"} · ${out.adapter || "Adapter ?"} · ` +
            `Holz ${out.holz} · V${out.version} ===`
    );
    // der Erst-Bau je Sekunde = Zuwachs des Stamm-Zählers seit der letzten Probe (er wächst nur); eine Sekunde ganz ohne Probe
    // (der Haupt-Thread hielt sie) zählt in die nächste Sekunde mit Probe
    let erstVor = 0;
    for (let s = 0; s < S; s++) {
        const q = out.proben.filter((p) => p.t < (s + 1) * 1000).pop() || {};
        const erstMs = q.erst ? q.erst[1] - erstVor : 0;
        erstVor += erstMs;
        const gruende = tK && tK < (s + 1) * 1000 ? "— die Kontrolle" : (q.fehlt || ["die Seite lädt"]).join(" · ");
        const kosten = Object.entries(out.kosten)
            .map(([k, z]) => [k, Math.round(z[s] || 0)])
            .concat([["Erst-Bau", Math.round(erstMs)]])
            .filter(([, ms]) => ms >= 5)
            .map((z) => z.join(" "))
            .join(" · ");
        console.log(
            `  ${String(s).padStart(3)} s  blockiert ${String(Math.round(blockiert[s])).padStart(4)} ms` +
                (kosten ? ` (${kosten})` : "") +
                `${q.erst && q.erst[2] ? ` · ${q.erst[2]} Pipelines offen` : ""}${q.vorrat ? ` · Vorrat ${q.vorrat}` : ""}` +
                `${q.schlange ? ` · Foundry ${q.schlange}` : ""} | ${gruende}`
        );
    }
    if (out.buchDa) console.log(`  ${(out.buchDa / 1000).toFixed(1)} s  das Buch der Studios ist da`);
    const kl = Object.entries(out.vorBild);
    if (kl.length)
        console.log(
            `  die Klasse Pflanzen bis zum Weltbild: ${Math.round(kl.reduce((a, [, ms]) => a + ms, 0))} ms Haupt-Faden (` +
                kl.map(([k, ms]) => `${k} ${Math.round(ms)}`).join(" · ") +
                ")"
        );
    const halb = out.ohne[0];
    const gut = tK > 0 && tK <= ANKUNFT_SOLL_MS && !halb;
    if (halb) console.log(`  ❌ das halbe Weltbild: ${halb}`);
    console.log(
        `\n  ${gut ? "✅" : "❌"} t(Kontrolle) ${zweit ? "warm" : "kalt"} ${tK ? (tK / 1000).toFixed(2) + " s" : "—"} von außen ` +
            `(Soll ≤ ${ANKUNFT_SOLL_MS / 1000} s; W trug den Leib im Atem ${tK ? druecke : "nie"}) · Eigenmeldung ${(out.weltbildDa / 1000).toFixed(2)} s`
    );
    const ganz = !bild || (bild.luecke <= LUECKE_SOLL && !offen.length);
    if (bild)
        console.log(
            `  ${ganz ? "✅" : "❌"} das Bild der Kontrolle: ${(100 * bild.luecke).toFixed(2)} % Lücke nach ${RUHE_MS / 1000} s ` +
                `(Soll ≤ ${100 * LUECKE_SOLL} %, ${bild.a.png}) · offen im Bild: ${offen.join(" · ") || "nichts"}`
        );
    // DIE LIEFER-ZEILE (pipeline.K4 Stufe 1): am Zweit-Boot urteilt sie (Exit bleibt die Ankunft)
    const k4 = lieferUrteil(out.lieferung, zweit);
    console.log(`  ${zweit ? (k4.gruen ? "✅ " : "❌ ") : ""}${k4.zeile}`);
    console.log(`  ${zweit ? (k4.artGruen ? "✅ " : "❌ ") : ""}${k4.artZeile}`);
    if (wechsel) console.log(`  ${wechsel.gruen ? "✅" : "❌"} ${wechsel.zeile}`);
    process.exit(gut && ganz ? 0 : 1);
}

hauptLauf(async () => {
    if (ARGV.includes("--kalt")) return kaltLauf();
    const SELFTEST = ARGV.includes("--selftest");
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 300000 });
    if (SELFTEST) await page.evaluateOnNewDocument(SCHLUCK);
    await server.zeige(page, 120000, "index.html", "networkidle0");
    // das erste Weltbild (der Null-Renderer setzt es beim Renderer-Bau; eine Zeit trägt nur die Kalt-Zeile, von außen)
    await page.evaluate(() => window.__weltDa((r) => r.state._weltbildDa));
    const out = await page.evaluate(async (selftest, r = window.anazhRealm, st = r.state) => {
        const o = { stage: 0 };
        const headless = !!(st.renderer && st.renderer._isHeadlessNull);
        // ── DAS PRÄDIKAT (jeder Term aus der kanonischen Quelle) ──
        const terms = () => {
            const f = r._foundry;
            const ringTarget = Math.max(1, Math.min(12, st.chunkRingRadius || 4));
            const q = r._impostorBakeQueue;
            return {
                ring: st._activeRingRadius != null && st._activeRingRadius >= ringTarget,
                grass: !st.pendingGrass || st.pendingGrass.size === 0,
                water: !st.pendingWaterIso || st.pendingWaterIso.size === 0,
                // die EINE Antwort der Welt (`_streuWartet`): fehlend · aufgeschoben · Scheibe offen, je Region in Reichweite
                streu: !!st.playerMesh && r._streuWartet(st.playerMesh.position) === 0,
                biblio: !!(f && f.ready && !f._vorrat),
                // Headless no-opt der RTT-Bake (gate-treu) → Term übersprungen, ehrlich markiert.
                impost: headless ? true : !q || q.length === 0,
                luft: !!(st.scene && st.scene.fogNode) && sichtM() >= 5000,
            };
        };
        const sichtM = () => (st.luft ? r._luftSichtM(st.playerMesh ? st.playerMesh.position.y : 0) : -1);
        // ── PUMPEN, bis das Prädikat schließt (jeder Term steht; in Takten) ──
        for (let t = 1; t <= 6000 && !o.stage; t++) {
            try {
                r._gameLoopTick();
            } catch {}
            o.terms = terms();
            if (Object.values(o.terms).every(Boolean)) o.stage = t;
            else if (t % 5 === 0) await sleep(0);
        }
        o.terms._streuWartet = r._streuWartet(st.playerMesh ? st.playerMesh.position : null);
        Object.assign(o, {
            headless,
            sichtM: Math.round(sichtM()),
            chunks: st.voxelChunks ? st.voxelChunks.size : 0,
            impostorRecords: r._kartenAtlas ? r._kartenAtlas.zellen.size : 0,
        });
        if (selftest && o.stage) {
            const map = st.scatterRegions;
            // die Bühnen-Wahrheit der Welt (`_buehneSteht`, das Prädikat live) liest dieselbe Antwort: ohne Regionen-Karte
            // steht sie nicht, mit ihr steht sie — nicht-headless gerechnet; Latch, Uhr und Renderer-Marke kehren zurück
            const merk = [st.renderer._isHeadlessNull, st._buehneStand, r._buehneT0];
                const frag = (ohneKarte, gedeckelt) => {
                    // die Uhr beginnt in `_buehneSteht` neu — oder sie steht weit hinter dem Deckel
                    [st.renderer._isHeadlessNull, st._buehneStand, r._buehneT0] = [false, false, gedeckelt ? -Infinity : null];
                    if (ohneKarte) delete st.scatterRegions;
                    const steht = r._buehneSteht();
                    st.scatterRegions = map;
                    return steht;
                };
                const t = (o.selftest = { buehneOhneKarte: frag(true), buehneMitKarte: frag(false) });
                // der Deckel öffnet LAUT: ohne Regionen-Karte und hinter BUEHNE_SETTLE_CAP_MS steht die Bühne, und das Log
                // nennt die Lücke (WARN „Die Bühne steht ohne: … Wald-Stücke …")
                const warnt = () => st.logBuffer.slice(-30).filter((z) => /Bühne steht ohne: .*Wald-Stücke/.test(z)).length;
                const w0 = warnt();
                t.deckelSteht = frag(true, true);
                t.deckelWarnt = warnt() > w0;
                [st.renderer._isHeadlessNull, st._buehneStand, r._buehneT0] = merk;
            // (W4.3, der Wachhund eines hängenden Bakes, fiel mit S2: die Karte backt synchron im Takt)
        }
        return o;
    }, SELFTEST);
    if (SELFTEST) out.liefer = lieferUrteil(await page.evaluate(RUHE));
    await browser.close();
    server.close();
    console.log(
        `\n=== VOLLE BÜHNE — das Prädikat (headless-Mechanik) === Takt ${out.stage || "— (nicht erreicht)"} · ` +
            `${out.chunks} Chunks · ${out.impostorRecords} Impostor-Records · Sichtweite ${out.sichtM} m` +
            (out.headless ? " (headless: RTT-Term übersprungen, gate-treu)" : "")
    );
    const [T, s] = [out.terms, out.selftest || {}];
    // je Invariante [hält, Name]
    const checks = [
        [T.ring, `RING erreicht Ziel (${T.ring})`],
        [T.grass && T.water, `GRAS aufgeholt (${T.grass}) · WASSER aufgeholt (${T.water})`],
        [
            T.streu,
            `STREU steht — keine Region in Reichweite fehlt, wartet oder trägt eine offene Scheibe (\`_streuWartet\` ${T._streuWartet})`,
        ],
        [T.biblio && T.impost, `BIBLIOTHEK warm (${T.biblio}) · IMPOSTOREN idle (${T.impost})`],
        [!!out.stage, "die BÜHNE wurde erreicht (das Prädikat schloss)"],
    ];
    if (SELFTEST)
        checks.push(
            [
                s.buehneOhneKarte === false && s.buehneMitKarte,
                `SELBST-TEST: die Bühnen-Wahrheit der Welt (\`_buehneSteht\`) liest dieselbe Streu — ohne Regionen-Karte ${s.buehneOhneKarte === false ? "steht sie nicht" : "STEHT sie"}, mit ihr ${s.buehneMitKarte ? "steht sie" : "steht sie NICHT"}`,
            ],
            [
                s.deckelSteht && s.deckelWarnt,
                `SELBST-TEST: der Deckel der Bühne öffnet laut — ohne Regionen-Karte hinter BUEHNE_SETTLE_CAP_MS ${s.deckelSteht ? "steht sie" : "steht sie NICHT"}, das Log ${s.deckelWarnt ? "nennt die Lücke (WARN)" : "SCHWEIGT"}`,
            ],
            [out.liefer.weg === 1, `SELBST-TEST: die verschluckte Lieferung ist ROT — ${out.liefer.zeile}`]
        );
    // das Urteil des Kern-Wechsels an Bruch-Daten: gesund GRÜN, ein fremder Neubau (e) und ein alter Leser (d) ROT
    const W = (e, d) => wechselUrteil([[0, "e", "platte", "phyto"], [0, "d", "platte", "fachwerk"]], [[0, "e", e, "phyto"], [0, "d", d, "fachwerk"]], "fachwerk").gruen; // prettier-ignore
    if (SELFTEST) checks.push([W("platte", "werk") && !W("werk", "werk") && !W("platte", "platte"), "SELBST-TEST: der Kern-Wechsel urteilt (fremder Neubau, alter Leser ROT)"]); // prettier-ignore
    const fails = checks.filter(([pass, name]) => (console.log(`  ${pass ? "✅" : "❌"} ${name}`), !pass)).length;
    console.log(`\n${checks.length - fails}/${checks.length} Bühnen-Invarianten OK.`);
    urteilEnde(fails, "⛔ Die volle Bühne steht nicht (oder die Linse ist stumpf) — Kriterium 2 ist nicht abnehmbar.", `✅ „Volle Bühne" ist ein Prädikat — Kriterium 2 ist messbar.`);
});
