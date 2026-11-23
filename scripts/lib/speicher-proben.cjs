// speicher-proben.cjs — DIE PROBEN DES SPEICHERS der Werkbank (Domäne Speicher; aus scripts/werkbank.cjs, Decke 4 000 Zeilen).
//
// DER WEG DES SPEICHERS (`werkbank weg`; Preis des Orts, Schnitt 2; Heilung Gegner Gesetz F2, 15.11.): die laufende Sitzung
// (`start --echt --ort wiese`) fährt die Posen der Ratsche (spec/profiband/weg-wiese-radeon.json) und kehrt zur ersten zurück; je
// Pose eingeschwungen, 30 s der Preis-Lauf (`/lauf`), dann zwei GC (`/puffer`) — Heap, VRAM, die Typed-Halter. Die Fahrt geht als
// weg.json nach `datei` und durch H8 (`wegUrteil`: Preis je Pose, Ratsche je Pose, Zuwachs bis zur Rückkehr je Minute, ROT beim
// Pfad des Halters). Bis hier lebte der Erzeuger als ignorierte Datei unter artifacts/, und H8 las nur, was ein Mensch ihm reichte
// (`diag-profiband --weg`). → { text, gruen }
"use strict";
const { fs, path, sleep, jsonLesen, argOpt: opt } = require("./welt-boot.cjs");
const DZ = require("./draw-zaehler.cjs");

// die Schalter des Befehls liest die Probe selbst (`--ratsche` unter spec/profiband/, `--datei` das Ziel): die Werkbank reicht nur
// ihre zwei Rufe — so wächst sie um keinen Befehls-Kopf (Decke 4 000 Zeilen; main + w28-iris-frei + dieser Zweig lagen bei 4 002)
async function wegFahrt({ umstellen, rufe }) {
    const ratsche = jsonLesen(path.join(__dirname, "..", "..", "spec", "profiband", opt("--ratsche") || "weg-wiese-radeon.json"));
    const datei = path.resolve(opt("--datei") || path.join("artifacts", "profiband", "weg.json"));
    const weg = [];
    // der Ort jeder Pose steht in der Ratsche (x, z), nie im Code
    for (const { pose, x, z } of ratsche.posen) {
        if (!Number.isFinite(x) || !Number.isFinite(z))
            return { text: `weg: die Pose ${pose} der Ratsche trägt keinen Ort (x, z)`, gruen: false };
        const t = Date.now();
        await umstellen({ x, z });
        for (let i = 0; i < 90; i++) {
            const e = await rufe("/eval", { code: "return typeof __einschwingOffen === 'function' ? __einschwingOffen(r) : null;" }); // prettier-ignore
            if (!e || !e.ergebnis || !Object.keys(e.ergebnis).length) break;
            await sleep(2000);
        }
        await rufe("/lauf", { sek: 30, ein: 30 });
        const puf = await rufe("/puffer", { top: 12 });
        const h = await rufe("/eval", { code: "return __heapHalter(r, 3).filter(([, b]) => b >= 131072).map(([k, b]) => [k, +(b / 1048576).toFixed(2)]);" }); // prettier-ignore
        weg.push({ pose, x, z, sek: Math.round((Date.now() - t) / 1000), heap_mb: puf.heapMB, vram_mb: puf.vram && puf.vram.mb, halter: h.ergebnis || [] }); // prettier-ignore
        console.log(`${pose}: nach GC Heap ${puf.heapMB} MB · VRAM ${puf.vram && puf.vram.mb} MB`);
    }
    fs.mkdirSync(path.dirname(datei), { recursive: true });
    fs.writeFileSync(datei, JSON.stringify(weg, null, 1));
    const posen = weg.map((p) => ({ pose: p.pose, heapMB: p.heap_mb, halter: p.halter, min: p.sek / 60 }));
    const f = DZ.wegUrteil(posen, ratsche);
    const kopf = `H8 der Weg: ${posen.map((p) => p.pose + " " + p.heapMB + " MB").join(" · ")} — ${datei}`;
    return { text: kopf + f.map((z) => "\n  ❌ H8 " + z).join(""), gruen: !f.length };
}

// DIE RUNDE DES SPEICHERS (`werkbank runde`; Schnitt 2, Auftrag 16.11.): dieselbe Runde zweimal, nach jeder an der START-Pose
// zwei GC (`/puffer`): Heap, `renderer.info.memory.geometries`, der Behälter-Zensus (`__behaelterZensus`) und die Geburt der
// Geometrien (`__geburtLinse`, eingesetzt vor der Start-Lesung). (a) Wiese · Wiese-Ost · Dorf · West · Wiese (die Posen der
// Ratsche des Wegs); (b) Platz → jedes Haus des Start-Dorfs bis zu seiner Stufe 0 → Platz (Genesis, Ego); (reise) Wiese → zwei
// ferne Orte → Wiese, (stadt) dasselbe ab stadt-voll (nur mit `--nur stadt`), die Würfe der Fluss-Probe gelaende.K4#2 (±6 km, je ≥ 1,5 km auseinander, ihre Saat): Runde 1 die ersten
// zwei, Runde 2 die nächsten zwei — was mit dem WEG wächst (die Hydro-Kachel je Ort), wächst von Runde zu Runde. Der Bild-Strom
// zählt je rAF bei laufendem Loop, nie im Umstellen und nie im GC, daneben die längste Aufgabe der Seite (longtask; `langeAufgabeUmstellen` samt dem Umstellen, dem Wieder-Bestellen der Kacheln). Ein Bildpaar
// Start ↔ Rückkehr an derselben Kamera. → { text, gruen }
const BILD_STROM = `window.__rb = { max: 0, n: 0, ueber: 0, lang: 0, langAlle: 0 }; window.__rbZaehlt = false;
try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { const B = window.__rb; if (e.duration > B.langAlle) B.langAlle = e.duration; if (window.__rbZaehlt && e.duration > B.lang) B.lang = e.duration; } }).observe({ type: "longtask" }); } catch (_e) {}
if (!window.__rbAn) { window.__rbAn = 1; let last = 0; const f = (t) => { if (window.__rbZaehlt && last) { const d = t - last, B = window.__rb; B.n++; if (d > B.max) B.max = d; if (d > 100) B.ueber++; } last = window.__rbZaehlt ? t : 0; requestAnimationFrame(f); }; requestAnimationFrame(f); }`;
const EINSCHWINGEN = `__loop(true); window.__rbZaehlt = true; const t0 = performance.now(); const raf = () => new Promise((f) => requestAnimationFrame(f));
for (let k = 0; k < 120 && performance.now() - t0 < 90000; ) { await raf(); const o = typeof __einschwingOffen === "function" ? __einschwingOffen(r) : null; k = o && Object.keys(o).length ? 0 : k + 1; }
for (const t1 = performance.now(); performance.now() - t1 < 5000; ) await raf();
return +((performance.now() - t0) / 1000).toFixed(1);`;
// die Würfe der Fluss-Probe (gelaende.K4#2, `treibtSitzungProbe`): dieselbe Saat, dieselbe Spanne, derselbe Abstand
const REISE = `const z = window.__phytoCore.mulberry32(0x51ed270b), o = [];
for (let v = 0; v < 400 && o.length < 4; v++) { const [x, y] = [z() * 12000 - 6000, z() * 12000 - 6000]; if (!o.some(([a, b]) => Math.hypot(a - x, b - y) < 1500)) o.push([+x.toFixed(1), +y.toFixed(1)]); }
return o;`;
const HALT = `window.__rbZaehlt = false; __loop(false); return window.__rb;`;
const HAEUSER = `const st = r.state, pm = st.playerMesh, raf = () => new Promise((f) => requestAnimationFrame(f));
const stell = (x, y, z) => { pm.position.set(x, y, z); st._fieldVy = 0; if (st.playerVel && st.playerVel.setValue) st.playerVel.setValue(0, 0, 0); if (st._fixedSimPos) st._fixedSimPos.copy(pm.position); };
const zelle = () => ((st.worldMeta && st.worldMeta.settlementCells) || {}).start, takt = window.__anazhAutoSettlement;
__loop(true); window.__rbZaehlt = true; window.__anazhAutoSettlement = true;
for (const t1 = performance.now(); !(zelle() && !r._autoSettlementQueue && !r._stlWegePending) && performance.now() - t1 < 120000; ) await raf();
window.__anazhAutoSettlement = takt;
const c = zelle(), plan = c && r._ortPlaene && r._ortPlaene.get(c.ort);
const slots = ((plan && plan.slots) || []).filter((sl) => /^haus_/.test(r._slotBauplan(sl, r._foundry) || ""));
const H = slots.map((sl) => st.architectures.find((a) => a.tuer && Math.hypot(a.position.x - c.x - sl.x, a.position.z - c.z - sl.z) < 0.05)).filter(Boolean);
const start = pm.position.toArray(); __loop(true); window.__rbZaehlt = true; let stufe0 = 0;
for (const e of H) { stell(e.position.x, e.position.y + 3, e.position.z);
  const l0 = () => e._servedLod === 0 && !!e._hausHuelle && e._hausHuelle.stufe === 0;
  await window.__gebautNach(e, { fertig: l0, bau: () => {}, takt: raf, max: 600 }).catch(() => null); if (l0()) stufe0++; for (let i = 0; i < 30; i++) await raf(); }
stell(start[0], start[1], start[2]); return { slots: slots.length, haeuser: H.length, stufe0 };`;

function anlageVon(root) {
    const S = require("./stamm.cjs");
    const zeilen = S.text(root).split("\n");
    const cache = new Map();
    // ein Behälter in Tiefe 2 (`r._fischKarte.zellen`) entsteht mit seinem Träger: die Anlage des Trägers
    return (pfad) => {
        const teile = pfad.replace(/^r\.(state\.)?/, "").split(".");
        if (teile.length > 1) return lies(teile[0]) + " (." + teile.slice(1).join(".") + ")";
        return lies(teile[0]);
    };
    function lies(name) {
        if (cache.has(name)) return cache.get(name);
        const e = name.replace(/[$]/g, "\\$");
        const zuweisung = new RegExp(`(?:\\.|\\b)${e}\\s*(?:=(?![=>])|\\|\\|=|\\?\\?=)|\\b${e}\\s*:\\s*new\\b`);
        const neu = new RegExp(`(?:\\.|\\b)${e}\\s*(?:=|\\|\\|=|\\?\\?=|:)\\s*(?:new\\s+(?:Map|Set|Array)\\b|\\[)`);
        let i = zeilen.findIndex((z) => neu.test(z));
        if (i < 0) i = zeilen.findIndex((z) => zuweisung.test(z) && !/^\s*\/\//.test(z));
        const ort = i < 0 ? "Anlage nicht im Stamm" : S.ort(root, i + 1);
        cache.set(name, ort);
        return ort;
    }
}

function bildPaar(a, b) {
    const { pngLesen } = require("./abnahme-urteil.cjs");
    const datei = (p) => [p, p.replace(/\.png$/i, "-rot.png")].find((x) => fs.existsSync(x));
    const [da, db] = [datei(a), datei(b)];
    if (!da || !db) return { urteil: "kein Bildpaar", a: da || a, b: db || b };
    const [A, B] = [pngLesen(fs.readFileSync(da)), pngLesen(fs.readFileSync(db))];
    if (A.W !== B.W || A.H !== B.H) return { urteil: "Größen verschieden", a: da, b: db };
    const k = A.u8.length / (A.W * A.H);
    let summe = 0,
        stark = 0;
    for (let i = 0; i < A.u8.length; i += k) {
        const d = (Math.abs(A.u8[i] - B.u8[i]) + Math.abs(A.u8[i + 1] - B.u8[i + 1]) + Math.abs(A.u8[i + 2] - B.u8[i + 2])) / 3;
        summe += d;
        if (d > 40) stark++;
    }
    const mittel = summe / (A.W * A.H),
        anteil = stark / (A.W * A.H);
    return { urteil: mittel <= 3 && anteil <= 0.02 ? "dasselbe Bild" : "verschieden", mittel: +mittel.toFixed(2), anteilStark: +anteil.toFixed(4), a: da, b: db }; // prettier-ignore
}

async function rundeFahrt({ umstellen, rufe }) {
    const root = path.join(__dirname, "..", "..");
    const ratsche = jsonLesen(path.join(root, "spec", "profiband", opt("--ratsche") || "weg-wiese-radeon.json"));
    const datei = path.resolve(opt("--datei") || path.join("artifacts", "profiband", "runde.json"));
    const ordner = path.dirname(datei);
    fs.mkdirSync(ordner, { recursive: true });
    const nur = opt("--nur"); // a | b | reise | stadt | blick
    const ev = async (code) => {
        const o = await rufe("/eval", { code });
        if (o && o.fehler) throw new Error("runde: " + o.fehler);
        return o && o.ergebnis;
    };
    await ev("__geburtLinse(T, r.state.renderer); " + BILD_STROM + " return true;");
    // die Start-Lesung (ohne Bild-Strom) setzt die Stichprobe des JS-Heaps auf, jede Lesung nach einer Runde nennt deren Besteller
    const stand = async (bildMax) => {
        const puf = await rufe("/puffer", { top: 12, stichprobe: bildMax ? "lies" : "an" });
        const halter = await ev(`return __heapHalter(r, ${+opt("--tiefe") || 3}).filter(([, b]) => b >= 131072).map(([k, b]) => [k, +(b / 1048576).toFixed(2)]);`); // prettier-ignore
        const z = await ev("return { geometries: r.state.renderer.info.memory.geometries, textures: r.state.renderer.info.memory.textures, zensus: __behaelterZensus(r), zell: __zellZensus(r), ro: __renderObjektZensus(r), geburt: __geburtZensus(), ort: r.state.playerMesh.position.toArray().map((x) => +x.toFixed(1)) };"); // prettier-ignore
        return Object.assign({ heapMB: puf.heapMB, vramMB: puf.vram && puf.vram.mb, bildMax: bildMax ? bildMax.max : 0, bilder: bildMax ? bildMax.n : 0, ueber100: bildMax ? bildMax.ueber : 0, langeAufgabe: bildMax ? Math.round(bildMax.lang) : 0, langeAufgabeUmstellen: bildMax ? Math.round(bildMax.langAlle) : 0, halter, besteller: puf.js.besteller, stelle: puf.js.stelle }, z); // prettier-ignore
    };
    const kamera = () =>
        ev("const p = r.state.playerMesh.position, y = (x, z) => r._voxelSurfaceY(x, z); return [p.x, y(p.x, p.z) + 1.7, p.z, p.x + 24, y(p.x + 24, p.z + 6) + 1.2, p.z + 6];"); // prettier-ignore
    const bild = async (k, name) => {
        const d = path.join(ordner, "runde-" + name + ".png");
        await rufe("/bild", { px: k[0], py: k[1], pz: k[2], lx: k[3], ly: k[4], lz: k[5], uhr: 0.5, w: 800, h: 600, datei: d });
        return d;
    };
    const geh = async (ziel) => {
        await ev("window.__rbZaehlt = false; __loop(false); return 1;");
        await umstellen(ziel);
        return ev(EINSCHWINGEN);
    };
    const posen = ratsche.posen.filter((p) => p.pose !== "wiese-zurueck");
    const RUNDEN = [
        {
            name: "a",
            start: () => geh({ x: posen[0].x, z: posen[0].z }),
            runde: async () => {
                for (const p of posen.slice(1)) await geh({ x: p.x, z: p.z });
                await geh({ x: posen[0].x, z: posen[0].z });
                return { posen: posen.map((p) => p.pose) };
            },
        },
        {
            name: "b",
            start: () => geh({ ort: "genesis", sicht: "ego" }),
            runde: async () => {
                await ev("window.__rb = { max: 0, n: 0, ueber: 0, lang: 0, langAlle: 0 }; return 1;");
                const h = await ev(HAEUSER);
                await ev(EINSCHWINGEN);
                return h;
            },
        },
        {
            name: "reise",
            start: () => geh({ x: posen[0].x, z: posen[0].z }),
            runde: async (i) => {
                const orte = (await ev(REISE)).slice(2 * i, 2 * i + 2);
                for (const [x, z] of orte) await geh({ x, z });
                await geh({ x: posen[0].x, z: posen[0].z });
                return { orte };
            },
        },
        {
            // (stadt) der Messort der Karte-2-Preise: stadt-voll → zwei ferne Orte der Reise → stadt-voll (heap-register 22.11.)
            name: "stadt",
            start: () => geh({ ort: "stadt-voll" }),
            runde: async (i) => {
                const orte = (await ev(REISE)).slice(2 * i, 2 * i + 2);
                for (const [x, z] of orte) await geh({ x, z });
                await geh({ ort: "stadt-voll" });
                return { orte };
            },
        },
        {
            // (blick) der Speicher folgt dem Blick (heap-blick-folgt, nur mit `--nur blick`): Wiese frisch → stadt-voll → Wiese; kein
            // Halter trägt nach der Rückkehr mehr als frisch (`blickUrteil`, je Halter mit MB)
            name: "blick",
            blick: true,
            start: () => geh({ ort: "wiese", sicht: "ego" }),
            runde: async () => {
                await geh({ ort: "stadt-voll", sicht: "ego" });
                await geh({ ort: "wiese", sicht: "ego" });
                return { orte: ["stadt-voll", "wiese"] };
            },
        },
    ].filter((x) => (nur ? x.name === nur : x.name !== "stadt" && x.name !== "blick"));
    const DZ = require("./draw-zaehler.cjs");
    const anlage = anlageVon(root);
    const aus = { datum: new Date().toISOString(), runden: [] };
    const zeilen = [],
        rot = [];
    for (const R of RUNDEN) {
        const t0 = Date.now();
        await R.start();
        await ev(HALT);
        const s = [await stand(null)];
        const k = await kamera();
        const b0 = await bild(k, R.name + "-start");
        const was = [];
        for (let i = 0; i < 2; i++) {
            await ev("window.__rb = { max: 0, n: 0, ueber: 0, lang: 0, langAlle: 0 }; return 1;");
            was.push(await R.runde(i));
            s.push(await stand(await ev(HALT)));
            console.log(`runde ${R.name}${i + 1}: Heap ${s[i + 1].heapMB} MB · geometries ${s[i + 1].geometries} · größtes Bild ${s[i + 1].bildMax.toFixed(1)} ms · längste Aufgabe ${s[i + 1].langeAufgabe} ms (samt Umstellen ${s[i + 1].langeAufgabeUmstellen})`); // prettier-ignore
        }
        const b2 = await bild(k, R.name + "-rueckkehr");
        const paar = bildPaar(b0, b2);
        const u = DZ.rundenUrteil({ name: R.name, stand: s, blick: R.blick }, anlage);
        if (paar.urteil !== "dasselbe Bild") u.f.push(`${R.name}: die Rückkehr zeigt ein anderes Bild (${paar.urteil}, Mittel ${paar.mittel}, stark ${paar.anteilStark})`); // prettier-ignore
        aus.runden.push({ name: R.name, min: +((Date.now() - t0) / 60000).toFixed(1), was, stand: s, tafel: u.tafel, paar, urteil: u.f }); // prettier-ignore
        zeilen.push(`Runde ${R.name}: Heap ${s.map((x) => x.heapMB).join(" → ")} MB · geometries ${s.map((x) => x.geometries).join(" → ")} · größtes Bild ${s.slice(1).map((x) => x.bildMax.toFixed(1)).join(" / ")} ms · Bildpaar ${paar.urteil}`); // prettier-ignore
        rot.push(...u.f);
        fs.writeFileSync(datei, JSON.stringify(aus, null, 1));
    }
    return { text: zeilen.join("\n") + rot.map((z) => "\n  ❌ RUNDE " + z).join("") + "\n" + datei, gruen: !rot.length };
}

const FADEN_NAME = new WeakMap();
async function fadenHeap(page, gc = false) {
    const frist = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(() => r(null), ms))]);
    const mb = (u) => (u ? +((u.usedSize + u.backingStorageSize) / 1048576).toFixed(1) : null);
    return Promise.all(
        page.workers().map(async (w) => {
            if (!FADEN_NAME.has(w)) FADEN_NAME.set(w, await frist(w.evaluate(() => self.name).catch(() => null), 1500));
            const u = await frist(w.client.send("Runtime.getHeapUsage").catch(() => null), 1500);
            const o = { name: FADEN_NAME.get(w) || "?", mb: mb(u) };
            if (gc && (await frist(w.client.send("HeapProfiler.collectGarbage").then(() => 1, () => null), 5000)))
                o.gehalten = mb(await frist(w.client.send("Runtime.getHeapUsage").catch(() => null), 1500));
            return o;
        })
    );
}

module.exports = { wegFahrt, rundeFahrt, fadenHeap };
