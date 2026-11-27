// DAS NEUE KLEID K0/K1-BEWEIS (`docs/neues-kleid-verfassung.md`) — die Phyto-Wuchs-Linse.
// Der Kern `growSkeleton` (phyto-core.js, DIE EINE geteilte Quelle seit Welle 0) ist REIN +
// THREE-frei → headless in node beweisbar, OHNE Browser: (1) Determinismus (gleicher Seed ⇒
// byte-identisch), (2) McMahon (Stammradius aus H/slim nachgerechnet), (3) da Vinci
// (Flächenerhaltung an den Gabeln, r^Δ), (4) Varianz (N Seeds ⇒ vaste Streuung, nie
// identisch), (5) Apikaldominanz (exkurrent hoch → schlanker Kegel · dekurrent niedrig →
// breite Krone). Wir laden phyto-core.js direkt (es exportiert auf globalThis.__phytoCore).
// DIE PARITÄT (Welle 0, bis zur Decke w3s-sukzession die eigene Linse diag-phyto-core-parity): dieselbe Datei über BEIDE
// Lade-Pfade byte-identisch — (a) der Main-Thread (`<script src="phyto-core.js">` → globalThis.__phytoCore) UND (b) der
// Worker (`importScripts` → self.__phytoCore, hier ein frischer VM-Context mit `self` als globalem Objekt); divergiert eine
// Konstante zwischen den Scopes (ein window/self-Leck), fällt die Linse. Dazu der P-Zwilling und das Skelett im Haupt-Thread
// (unten). Das ist die Gesetz-#0-Wand: EINE Quelle, viele Leser, KEIN Mirror, der driften kann.
"use strict";
const { vm, fadenScope, ROOT, stammLib, pruefer } = require("./lib/welt-boot.cjs");

// Der geteilte Kern läuft im IIFE-Muster und exportiert auf `root` (self||globalThis) — in
// node ist das globalThis. Ein simpler require() reicht (die Datei ist kein CommonJS-Modul,
// aber der IIFE-Seiteneffekt setzt globalThis.__phytoCore).
require("../samen-core.js"); // der Samen-Baum vor jedem Kern (Welle SAMEN)
require("../phyto-core.js");
const mainCore = globalThis.__phytoCore;
if (typeof mainCore?.growSkeleton !== "function") throw new Error("phyto-core.js hat __phytoCore.growSkeleton nicht exportiert");
const { mulberry32 } = mainCore; // der Test-Strom ist der Strom des Kerns
const grow = (P, seedInt) => mainCore.growSkeleton(P, mulberry32(seedInt));

const eiche = () => ({
    height: 9,
    slim: 0.42,
    apical: 0.32,
    trop: -0.1,
    delta: 2.3,
    leafD: 0.6,
    leafSize: 0.5,
    conifer: false,
    barkType: "smooth",
    maxDepth: 5,
    crownBase: 0.24,
    whorlSpacing: 0.12,
    coniferDroop: 0.05,
    basalStems: 0,
    windGain: 1,
});
const tanne = () => ({
    ...eiche(),
    height: 12,
    slim: 0.74,
    apical: 0.9,
    trop: 0.05,
    conifer: true,
    barkType: "conifer",
    maxDepth: 4,
    crownBase: 0.12,
    coniferDroop: 0.22,
    kroneAnteil: mainCore.FOREST_PACK.crown.tanne / 26.9, // die Zeile der Tanne in der Kronen-Tafel (foundry PRESETS hoeheM 26,9)
    kronenForm: mainCore.FOREST_PACK.form.tanne, // ihre Form (arten-gattung): der Kegel
});

const { errs, check: ok, wandEnde } = pruefer();
// Feine Signatur: Segment-/Blatt-Zahl + trunkR + Prüfsummen über alle Segment-Endpunkte und Blätter (zwei Bäume mit
// gleicher Zahl aber verschiedener Form ⇒ verschiedene Summe).
const sig = (res) =>
    [
        res.segs.length,
        res.leaves.length,
        res.trunkR.toFixed(9),
        res.segs.reduce((a, s) => (a + s.p1[0] * 13.1 + s.p1[1] * 7.7 + s.p1[2] * 3.3 + s.r1 * 101) % 1e6, 0).toFixed(6),
        res.leaves.reduce((a, l) => (a + l.pos[0] * 5.5 + l.pos[1] * 9.1 + l.scale * 71) % 1e6, 0).toFixed(6),
    ].join("|");


console.log("=== DAS NEUE KLEID K0 — Phyto-Wuchs-Kern (rein, headless) ===");

// (1) DETERMINISMUS: gleicher Seed ⇒ byte-identisch (drei Läufe).
const [a1, a2, a3] = [1, 2, 3].map(() => grow(eiche(), 12345));
ok("Determinismus: gleicher Seed ⇒ 3× byte-identisch", sig(a1) === sig(a2) && sig(a2) === sig(a3), sig(a1));

// (2) McMahon: trunkR = clamp((H/k·2)^1.5 · 0.5), k=lerp(13,22,slim). Nachgerechnet.
const P = eiche();
const expectedR = Math.max(0.07, Math.min(1.25, ((P.height / (13 + 9 * P.slim)) * 2) ** 1.5 * 0.5));
ok("McMahon: trunkR aus H/slim abgeleitet (nachgerechnet)", Math.abs(a1.trunkR - expectedR) < 1e-9, "got=" + a1.trunkR.toFixed(5) + " exp=" + expectedR.toFixed(5));
// Monotonie bei sonst gleichem Baum: ein höherer ⇒ dickerer Stamm, ein schlankerer (höheres slim) ⇒ dünnerer.
for (const [name, ov, vz] of [["höherer Baum ⇒ dickerer Stamm", { height: 18 }, 1], ["schlanker (slim↑) ⇒ dünnerer Stamm", { slim: 0.85 }, -1]]) {
    const r = grow({ ...eiche(), ...ov }, 12345).trunkR;
    ok("McMahon: " + name, vz * (r - a1.trunkR) > 0, a1.trunkR.toFixed(4) + " → " + r.toFixed(4));
}

// (3) da VINCI: an jeder Gabel r_parent^Δ ≈ Σ r_child^Δ. Wir prüfen die Fläche an den
// Verzweigungen über runMeta: für einen Eltern-Run mit Kindern muss Σ(kind-Startradius^Δ)
// ≤ Eltern-Endradius^Δ · (1+ε) sein (die Vorlage verteilt exakt die Fläche, minus Blatt-Terminals; ε = 0,35 für die
// gnarl-Modulation). Start-/End-Radius je Run, die Kinder je Eltern-Run, je Gabel das Flächen-Verhältnis.
const dv = grow(eiche(), 777);
const [r0, r1, kinder] = [{}, {}, {}];
for (const q of dv.segs) (r0[q.runId] ??= q.r0), (r1[q.runId] = q.r1);
for (const id in dv.runMeta) (kinder[dv.runMeta[id].parentRun] ||= []).push(id);
const gabeln = Object.keys(kinder)
    .filter((pr) => pr >= 0 && pr in r1)
    .map((pr) => kinder[pr].reduce((a, k) => a + (r0[k] ?? 0) ** P.delta, 0) / r1[pr] ** P.delta)
    .filter((q) => q > 0);
const verletzt = gabeln.filter((q) => q > 1.35).length;
ok("da Vinci: Flächenerhaltung an Gabeln (Σ Kind-Fläche ≤ Eltern-Fläche)", gabeln.length > 5 && !verletzt, gabeln.length + " Gabeln geprüft, " + verletzt + " verletzt");

// (4) VARIANZ: N Seeds ⇒ vaste Streuung (keine zwei identisch, Segment-Zahl streut).
const V40 = Array.from({ length: 40 }, (_, s) => grow(eiche(), 1000 + s * 7));
const sigs = new Set(V40.map(sig));
const [minSeg, maxSeg] = [Math.min, Math.max].map((f) => f(...V40.map((r) => r.segs.length)));
ok("Varianz: 40 Seeds ⇒ 40 verschiedene Bäume", sigs.size === 40, sigs.size + "/40 unique");
ok("Varianz: Segment-Zahl streut spürbar", maxSeg - minSeg > 10, "Segmente " + minSeg + "…" + maxSeg);

// (5) APIKALDOMINANZ: Nadelbaum (api hoch, conifer) ⇒ schlanker + höher als breit; Eiche
// (api niedrig, dekurrent) ⇒ breiter. Wir messen das Bounding der Segment-Endpunkte.
const [eE, tE] = [eiche, tanne].map((f) => ((q) => Math.max(...q.map((s) => Math.hypot(s.p1[0], s.p1[2]))) / Math.max(0.1, ...q.map((s) => s.p1[1])))(grow(f(), 4242).segs));
ok("Apikaldominanz: Nadelbaum (exkurrent) schlanker als Eiche (dekurrent)", tE < eE, "Tanne w/h=" + tE.toFixed(2) + " · Eiche w/h=" + eE.toFixed(2));

// (6) LEAF-BUDGET: der Cap greift.
const nBlatt = grow({ ...eiche(), leafBudget: 50 }, 999).leaves.length;
ok("Blatt-Budget: Cap deckelt die Blatt-Zahl", nBlatt <= 50, nBlatt + " ≤ 50");

// ── DIE PARITÄT ── der WORKER-Pfad: ein frischer Context, in dem `self` das globale Objekt IST (Worker-Scope).
// Der IIFE-Root-Ausdruck `typeof self !== "undefined" ? self : ...` greift dann `self`.
const workerCore = fadenScope(["phyto-core.js"]).__phytoCore; // im Faden ist self === globalThis

console.log("=== DAS NEUE KLEID Welle 0 — Phyto-Core Main↔Worker-Parität ===");
ok("Worker-Pfad exportiert __phytoCore.growSkeleton", typeof workerCore?.growSkeleton === "function");
ok("Beide Pfade sind SEPARATE Funktions-Instanzen (echt zwei Scopes)", mainCore.growSkeleton !== workerCore.growSkeleton);

// Über eine Palette von Arten × Seeds (Eiche, Tanne, Weide, Strauch × 12): Main-Ergebnis MUSS byte-identisch zum
// Worker-Ergebnis sein.
const arten = { eiche, tanne, weide: () => ({ ...eiche(), trop: 0.8, apical: 0.28, leafSize: 0.35 }), strauch: () => ({ ...eiche(), basalStems: 5, height: 4 }) };
const divergent = Object.entries(arten).flatMap(([nm, mk]) =>
    Array.from({ length: 12 }, (_, s) => 4242 + s * 131).flatMap((seed) =>
        ((m, w) => (m === w ? [] : [nm + "/seed" + seed + ": M=" + m + " W=" + w]))(sig(grow(mk(), seed)), sig(workerCore.growSkeleton(mk(), mulberry32(seed))))
    )
);
for (const d of divergent.slice(0, 3)) console.log("      DIVERGENZ " + d);
ok("Main==Worker byte-identisch über 4 Arten × 12 Seeds", !divergent.length, "48 Läufe, " + divergent.length + " divergent");

// ── P-ZWILLING: EINE Ableitung Dials → P ──
// Der gesehene Baum (foundry-core `deriveParamsPlant`, wie `buildInstance` ihn ruft: __dials = Preset-Regler, SEED,
// __lod = Bau-Stufe) und das Gesetz (`__phytoCore.treeParams(s, Saat, Stufe, Art)`) müssen denselben P-Vektor
// liefern — Schlüssel für Schlüssel, je Art × Gestalt (Saat) × Stufe. Der Foundry-Worker-Scope wird wie im Worker
// gebaut (die Engine three r184 → phyto-core → foundry-core); clamp/lerp/__dials/SEED/__lod stellt dort die Brücke
// (foundry-bruecke.js), hier ihr Ersatz — die Dials liest der Kern nur aus `__dials` (K47: kein DOM-Leser `gv` mehr).
// Konsum-Leser: `buildInstance` (Foundry-Worker, jeder Baum der Welt) und `build()` (Studio).
// Der Scope ist der des Fadens (welt-boot `fadenScope`: die Engine three r184 → phyto-core → foundry-core), danach die
// Globale der Brücke (die Kerne lesen sie erst im Ruf).
const KERNE = ["phyto-core.js", "foundry-core.js"];
const fsb = fadenScope(KERNE);
vm.runInContext(
    "var clamp = (x, a, b) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t;" +
        "var __dials = null, SEED = 0, __lod = 0, CURRENT = '';",
    fsb
);
// Vergleich Schlüssel für Schlüssel (Werte per JSON — leafShape ist ein Objekt; ein fehlender Schlüssel ist undefined).
const pDiff = (A, B) => Object.keys({ ...A, ...B }).filter((k) => JSON.stringify(A[k]) !== JSON.stringify(B[k]));
const PZ = (fsb.__pZwillingArgs = { arten: ["eiche", "fichte", "kiefer", "birke", "weide", "erle", "mammut", "tanne", "buche", "karst", "totholz", "strauch"], samen: [1, 2, 7, 12345], stufen: [0, 1, 2] });
const pPaare = vm.runInContext(
    `(function () {
        const a = self.__pZwillingArgs, out = [];
        for (const id of a.arten) {
            const pre = PRESETS[id];
            for (const seed of a.samen)
                for (const lod of a.stufen) {
                    __dials = pre.s; SEED = seed; __lod = lod; CURRENT = id;
                    const gesehen = deriveParamsPlant(pre);
                    __dials = null;
                    const gesetz = self.__phytoCore.treeParams(pre.s, seed, lod, pre, __weltSkalaArt(id));
                    out.push({ fall: id + "/s" + seed + "/L" + lod, gesehen: JSON.stringify(gesehen), gesetz: JSON.stringify(gesetz) });
                }
        }
        return out;
    })()`,
    fsb
);
// Selbsttest: ein eingeschleuster Zwilling (Quirl-Abstand fehlt, Nadel-Stride anders) MUSS beim Namen fallen.
{
    const g = JSON.parse(pPaare.find((p) => p.fall === "fichte/s1/L1").gesetz);
    const d = pDiff({ ...g, _lf: g._lf + 0.3, whorlSpacing: undefined }, g);
    ok(
        "P-Zwilling Selbsttest: der eingeschleuste Zwilling fällt an whorlSpacing und _lf",
        d.sort().join() === "_lf,whorlSpacing",
        d.join(",")
    );
}
const pRot = pPaare.map((p) => p.fall + ": " + pDiff(JSON.parse(p.gesehen), JSON.parse(p.gesetz)).join(", ")).filter((z) => !z.endsWith(": "));
for (const z of pRot.slice(0, 3)) console.log("      P-ZWILLING " + z);
ok(`P-Zwilling: gesehener Baum (deriveParamsPlant) = Gesetz (treeParams), ${PZ.arten.length} Arten × ${PZ.samen.length} Gestalten × ${PZ.stufen.length} Stufen`, !pRot.length, pPaare.length + " Fälle, " + pRot.length + " abweichend");

// ── DAS SKELETT IM HAUPT-THREAD (Integration K20 × K16) ──
// Der gefühlte Baum (`_baumGestaltTeile` ← `_populateBlockerAABBs` ← `spawnArchitecture`) wächst `skelettDerGestalt` im
// Haupt-Thread — dort lädt die Seite phyto-core und foundry-core OHNE die Shell (index.html trägt kein phytogenesis.js):
// jeder Schritt des Wuchses, der einen Vektor-Helfer der Shell liest, bricht dort (baum_totholz warf „vlen is not
// defined", gate:brennglas-takt fand ihn im Brennpunkt der Kern-Landform). Der Scope wird wie im Haupt-Thread gebaut
// (three → phyto-core → foundry-core, KEINE Shell-Globale), jede Baum- und Strauch-Art je Gestalt und Stufe gewachsen.
// Konsum-Leser: `_growTreeBlueprintRich` (Stamm) — der Stamm liest das Skelett für die Kollision.
const hsb = fadenScope(KERNE);
// Selbsttest: der Scope ist der des Haupt-Threads — ein Leser eines Shell-Globals fällt dort beim Namen
ok(
    "Skelett im Haupt-Thread Selbsttest: der Scope trägt keine Shell-Globale (ein Leser von vlen bricht beim Namen)",
    /vlen/.test((() => { try { vm.runInContext("vlen()", hsb); } catch (e) { return e.message; } })()) // prettier-ignore
);
// DIE JUGEND (stoffe.K5#2, w12-riesenhalm): je Baum-Art und Gestalt der Stufe 1 in jedem Alter des Jungwuchses (`SUKZESSION.jugend`
// des Stamms) der Kronen-Fuß des jungen Skeletts (sein tiefster Blatt-Anker / seine Höhe) minus den des gewachsenen — `jugendRot`
// nennt, wo die Krone des Jungwuchses um mehr als ein Zehntel der Höhe höher sitzt (bis w12-riesenhalm hob der Schaft-Hub die
// Krone der jungen Tanne auf 0,54 H, gewachsen 0,36 H: die Riesenhalme der Narbe); die Mutante ist dieser Fall. Die Höhe des
// Jungwuchses stand schon im Maß der Art (jung/gewachsen ≤ 1,008 vor und nach dem Schnitt).
// DIE JUGEND AUS EINER HAND (w13-jung-gestalt): `ov.alter` reist nur in die Ableitung (phyto-core `treeParams(…, alter)`), die
// Prägung (foundry-core `__praegeP`) schreibt es nie als Feld — wächst die Ableitung ohne das Alter (`ohne`: die Mutante der
// Sukzession in gate:stand-takt --brand), steht jeder Jungwuchs im Kronen-Fuß des gewachsenen; die Mutante (`alt`) setzt die
// Prägung bis w13 ein (Object.assign: `P.alter` trug den Schaft der Jugend ohne ihre Gestalt, Glieder [9, 2 928] statt
// [9, 2 933]) und fällt beim Namen.
hsb.__skelettArgs = { samen: [1, 7, 12345], stufen: [0, 1, 2], jugend: stammLib.ladeKlasse(ROOT).AnazhRealm.SUKZESSION.jugend };
const skelette = () => vm.runInContext(
    `(function () {
        const a = self.__skelettArgs, out = [];
        const fuss = (k) => Math.min(...k.nodes.leaves.map((l) => l.pos[1])) / Math.max(...k.nodes.segs.map((q) => q.p1[1]));
        for (const [id, pre] of Object.entries(PRESETS)) {
            if (pre.kind !== "tree" && pre.kind !== "shrub") continue;
            for (const seed of a.samen)
                for (const lod of a.stufen) {
                    const fall = id + "/s" + seed + "/L" + lod;
                    try {
                        const s = skelettDerGestalt(id, seed, lod);
                        const jung = pre.kind === "tree" && lod === 1 ? a.jugend.map((alter) => [alter, fuss(skelettDerGestalt(id, seed, lod, { alter })) - fuss(s)]) : [];
                        out.push({ fall, segs: s.nodes.segs.length, jung });
                    } catch (e) {
                        out.push({ fall, fehler: String(e?.message || e) });
                    }
                }
        }
        return out;
    })()`,
    hsb
);
const [hFaelle, C] = [skelette(), hsb.__phytoCore];
const tp = C.treeParams;
C.treeParams = (d, s, l, art, w, al, g) => tp(d, s, l, art, w, undefined, g);
const ohne = skelette();
hsb.__praegeP = (P, ov) => Object.assign(P, ov);
const ohneM = skelette();
const jugendRot = (F, t = 0.1) => F.flatMap((f) => (f.jung || []).filter(([, d]) => (t ? d : Math.abs(d)) > t).map(([al, d]) => `${f.fall}@${al} +${d.toFixed(2)}H`));
ok("Jugend: die Krone nie über der gewachsenen", jugendRot([{ jung: [[0.06, 0.18]] }]).length === 1 && hFaelle.some((f) => f.jung?.length) && !jugendRot(hFaelle).length, jugendRot(hFaelle).slice(0, 3).join(" | "));
ok("Jugend aus EINER Hand: ohne das Alter der Ableitung der gewachsene", jugendRot(ohneM, 0).length > 0 && !jugendRot(ohne, 0).length, jugendRot(ohne, 0)[0] || "Mutante " + jugendRot(ohneM, 0)[0]);
const hRot = hFaelle.filter((f) => f.fehler || !(f.segs > 0)).map((f) => f.fall + ": " + (f.fehler || "0 Segmente"));
for (const z of hRot.slice(0, 6)) console.log("      SKELETT " + z);
ok(`Skelett im Haupt-Thread: skelettDerGestalt wächst jede Baum- und Strauch-Art ohne die Shell (${new Set(hFaelle.map((f) => f.fall.split("/")[0])).size} Arten × 3 Gestalten × 3 Stufen)`, hFaelle.length > 0 && !hRot.length, hFaelle.length + " Fälle, " + hRot.length + " gebrochen" + (hRot.length ? " — " + hRot[0] : ""));

// DAS UFER UND DIE WÄRME (Karte 2 leben.pflanzen.biome#1, die Station „Uferarten am Wasser ≥ 90 %, Wärme-Arten außerhalb der
// Wärme 0"): die Uferart (Erle des Walds und der Streu, der Farn des Krautstratums) steht nur über der Feuchte des Saums
// (`FOREST_PACK.ufer`), die Palme nur, wo der Winter an ihrem Fuß sie trägt (gelaende-core `waermeTraegt`). Die Linse fragt die
// Wald-Nische (`forestNische`) über die Feuchte 0 … 1 und die Art der Streu (Stamm `_scatterSpeciesForCell` /
// `_scatterSpeciesForLayer`, aus dem Stamm gezogen) über 4 096 Hashes × Feuchte × Lebendigkeit an der Heimat und an einem
// warmen Ort — der Täter steht beim Namen.
require("../gelaende-core.js");
const GC = globalThis.__gelaendeCore;
const uferStamm = (mutiere) => {
    const t = stammLib.text(ROOT);
    const g = (n) => {
        const x = stammLib.glieder(t).find((y) => y.name === n && !y.statisch);
        if (!x) throw new Error("diag-phyto-tree: das Glied " + n + " fehlt im Stamm");
        return t.slice(x.start, x.ende);
    };
    const a = t.indexOf("AnazhRealm.STREU_NADEL = ");
    const AR = {};
    new Function("AnazhRealm", t.slice(a, t.indexOf(";", a) + 1))(AR);
    const quelle = (mutiere || ((s) => s))(g("_scatterSpeciesForCell") + ",\n" + g("_scatterSpeciesForLayer"));
    return new Function("AnazhRealm", `return ({ ${quelle} });`)(AR);
};
function uferWaermeBefunde(nische, artVon) {
    const P = mainCore.FOREST_PACK;
    const out = [];
    const heimat = GC.ortGesetz(null);
    const T0 = heimat.klimaHeute;
    const warmOrt = Object.assign({}, heimat, { klimaHeute: Object.assign({}, T0, { sommer: 27, winter: 13 }) });
    // die Wald-Nische: Erle nur im Saum
    for (let feu = 0; feu <= 1.0001; feu += 0.02) {
        const ctx = { F: { dryScale: 18 }, baseH: 0, fbm: () => 0.5, feuchteAt: () => feu, wuchs: heimat.wuchs };
        const NO = nische(0, 0, 1, 0.5, ctx);
        if (feu < P.ufer && NO.wW > 0) {
            out.push(`forestNicheWeights/forestNische: die Erle wiegt wW ${NO.wW.toFixed(3)} bei Feuchte ${feu.toFixed(2)} unter dem Ufer ${P.ufer}`);
            break;
        }
        if (feu >= P.ufer + 0.02 && !(NO.wW > 0)) {
            out.push(`forestNische: im Saum (Feuchte ${feu.toFixed(2)}) steht keine Erle`);
            break;
        }
    }
    // die Art der Streu
    const z = { palmeKalt: 0, palmeKaltT: null, palmeWarm: 0, uferTrocken: 0, uferNass: 0, beispiel: null };
    for (const [ort, warm] of [[heimat, false], [warmOrt, true]]) {
        const L = { waterLevel: 0, baseHeight: 0, ort };
        const wirt = artVon();
        wirt._gelaende = () => L;
        wirt._terrainMacroSurfaceY = () => 2;
        for (const m of [0.1, 0.3, 0.5, P.ufer - 0.01, P.ufer + 0.05, 0.9])
            for (const lb of [0.3, 0.5, 0.7])
                for (let h = 0; h < 4096; h += 3)
                    for (const kind of ["canopy", "under"]) {
                        const sp = wirt._scatterSpeciesForLayer(kind, lb, m, h * 2654435761 >>> 0, 0, 0);
                        if (sp === "baum_erle" || sp === "farn_busch") {
                            if (m <= P.ufer) {
                                z.uferTrocken++;
                                z.beispiel = z.beispiel || `${sp} bei Feuchte ${m.toFixed(2)}`;
                            } else z.uferNass++;
                        }
                        if (sp === "baum_palme") {
                            if (warm) z.palmeWarm++;
                            else {
                                const f = GC.temperaturFeld(L, 2);
                                z.palmeKalt++;
                                z.palmeKaltT = f.mittel - f.jahr.amp - f.kuehlung;
                            }
                        }
                    }
    }
    if (z.uferTrocken) out.push(`_scatterSpeciesForCell/_scatterSpeciesForLayer: ${z.uferTrocken} Uferarten unter dem Ufer ${P.ufer} (${z.beispiel})`);
    if (!z.uferNass) out.push("_scatterSpeciesForCell/_scatterSpeciesForLayer: im Saum steht keine Uferart");
    if (z.palmeKalt) out.push(`_scatterSpeciesForCell: ${z.palmeKalt} Palmen im Winter ${z.palmeKaltT.toFixed(1)} °C unter ${GC.WAERME_ART.winterC} °C`);
    if (!z.palmeWarm) out.push("_scatterSpeciesForCell: auch am warmen Ort (Winter 13 °C) keine Palme");
    return { out, z };
}
{
    const U = uferWaermeBefunde(mainCore.forestNische ? mainCore.forestNische : null, () => uferStamm());
    for (const b of U.out) console.log("      UFER/WÄRME " + b);
    ok(`Ufer und Wärme: die Erle (Wald und Streu) und der Farn nur über der Feuchte ${mainCore.FOREST_PACK.ufer}, die Palme nur im Winter ≥ ${GC.WAERME_ART.winterC} °C`, U.out.length === 0, `Ufer ${U.z.uferNass} im Saum, ${U.z.uferTrocken} trocken · Palmen kalt ${U.z.palmeKalt}, warm ${U.z.palmeWarm}`);
    // Selbsttest: der Sockel 0,01 der Erle (die Wald-Nische vor dem Schnitt) und die Palme nach `lebendig` allein MÜSSEN beim Namen fallen
    const alteNische = (x, zz, y, sd, ctx) => {
        const NO = mainCore.forestNische(x, zz, y, sd, ctx);
        const feu = ctx.feuchteAt();
        return Object.assign({}, NO, { wW: NO.wW || 0.01 + feu * feu * 6 });
    };
    const alteStreu = () => uferStamm((s) => s.split("&& warm()").join("").split("FOREST_PACK.ufer) return \"farn_busch\"").join("FOREST_PACK.ufer - 0.05) return \"farn_busch\""));
    const M = uferWaermeBefunde(alteNische, alteStreu).out.join(" | ");
    ok(
        "Ufer und Wärme Selbsttest: der Erlen-Sockel fällt an forestNicheWeights, die kalte Palme und der trockene Farn an _scatterSpeciesForCell/_scatterSpeciesForLayer",
        /^forestNicheWeights\/forestNische: die Erle wiegt wW 0\.01\d* bei Feuchte 0\.00/.test(M) && /_scatterSpeciesForLayer: \d+ Uferarten unter dem Ufer/.test(M) && /_scatterSpeciesForCell: \d+ Palmen im Winter -?\d/.test(M),
        M.slice(0, 400)
    );
}

// DER FINDLING DES EISES (Karte 2 planet.kopplung.gegenwart#1/#6, die Station „Merkmale ohne Ursache = 0"): der Erratiker liegt am
// flachen Grund nur, wo die Eis-Zeit des Orts (`ort.eis`) 1 ist — die Linse zieht `_rockGeologyClass` aus dem Stamm und fragt sie
// über die Hänge an der Heimat (eis 0) und an einem Ort unter dem Eis (eis 1); die Eis-Zeit der Heimat fragt sie den Planeten
// (planet-core `planetOrt` am Anker des Welt-Samens: `ortEisZeit` liest dort das Jahresmittel des Orts).
const findlingStamm = (mutiere) => {
    const t = stammLib.text(ROOT);
    const x = stammLib.glieder(t).find((y) => y.name === "_rockGeologyClass" && !y.statisch);
    if (!x) throw new Error("diag-phyto-tree: das Glied _rockGeologyClass fehlt im Stamm");
    const a = t.indexOf("AnazhRealm.ROCK_GEOLOGY = Object.freeze(");
    const AR = {};
    new Function("AnazhRealm", t.slice(a, t.indexOf("\n});", a) + 4))(AR);
    return new Function("AnazhRealm", `return ({ ${(mutiere || ((s) => s))(t.slice(x.start, x.ende))} });`)(AR);
};
function findlingBefunde(wirtVon) {
    const out = [];
    const heimat = GC.ortGesetz(null);
    const z = { heimat: 0, eis: 0, punkte: 0 };
    for (const [ort, n] of [[heimat, "heimat"], [Object.assign({}, heimat, { eis: 1 }), "eis"]]) {
        const w = wirtVon();
        w._gelaende = () => ({ ort });
        for (let s = 0; s <= 1.2; s += 0.01) {
            if (n === "heimat") z.punkte++;
            if (w._rockGeologyClass(s, 0) === "findling") z[n]++;
        }
    }
    if (z.heimat) out.push(`_rockGeologyClass: ${z.heimat} Findlinge von ${z.punkte} Hängen an der Heimat ohne Eis (ort.eis 0)`);
    if (!z.eis) out.push("_rockGeologyClass: auch unter dem Eis (ort.eis 1) kein Findling");
    return { out, z };
}
{
    globalThis.self = globalThis;
    require("../planet-core.js");
    const PC = globalThis.__planetCore;
    const plan = PC.planetPlan("anazh-realm-seed", PC.PLANET_ERDE);
    const A = PC.planetAnker(plan, 0, GC.ortGesetz(null));
    const eisAnker = PC.planetOrt(PC.planetScheibe(plan, 0), A.breite, A.laenge, GC.ortGesetz(null)).eis.zeit;
    ok(
        "Findling: die Eis-Zeit der Heimat ist die ihres Ankers auf dem Planeten",
        eisAnker === GC.ortGesetz(null).eis,
        `Anker ${((A.breite * 180) / Math.PI).toFixed(1)}° · Jahresmittel ${(0.5 * (A.sommerC + A.winterC)).toFixed(1)} °C (Eis-Linie −10 °C) · Planet ${eisAnker}, Heimat ${GC.ortGesetz(null).eis}`
    );
    const F = findlingBefunde(() => findlingStamm());
    for (const b of F.out) console.log("      FINDLING " + b);
    ok("Findling: der Erratiker nur, wo das Eis lag (`ort.eis`)", F.out.length === 0, `Heimat ${F.z.heimat}, unter dem Eis ${F.z.eis} von ${F.z.punkte} Hängen`);
    const M = findlingBefunde(() => findlingStamm((s) => s.replace('this._gelaende().ort.eis ? "findling" : null', '"findling"'))).out.join(" | ");
    ok("Findling Selbsttest: der Findling am flachen Grund ohne Eis fällt an _rockGeologyClass", /^_rockGeologyClass: \d+ Findlinge von \d+ Hängen an der Heimat ohne Eis/.test(M), M);
}

// DIE LANDMARKE FOLGT DER GEOLOGIE (landmarken-geologie; der Schöpfer: „viele Glutbrunnen, Lagerfeuer bedecken die Karte —
// unnatürlich"), am Wirt im vm (stamm.cjs `grundWirt`): (a) das Feld wirft keinen Bau — jede Art der EINEN Liste (`FELD_WURF`)
// ist Natur (`_istNatur`); die Feuerstelle setzt der Mensch (bis hier warf das Glut-Feld sie an der Mess-Wiese 66-mal je 0,2 km²).
// (b) der Wurf der Felsbögen und -türme (`_landmarkeChunk`) folgt dem Gesetz des Orts (gelaende-core `landmarke`, die Bänder
// der Profis): über je 8 000 Chunks (15 km²) im Tafelland der Heimat, außerhalb und auf einer trockenen Tafel liegt die Zahl
// je Art binnen 4 σ ihrer Erwartung (Poisson, Σ λ · Fläche des Chunks). Selbsttest: die alte Regel (jede Probe der Saat 1,4 %,
// an der Ankunft ≈ 680 je km²) fällt an `_landmarkeChunk`, eine Feuerstelle in der Liste an `FELD_WURF`.
function feldWurfBau(r, liste) {
    const bau = liste.filter((t) => !r._istNatur({ type: t }));
    return bau.length ? [`FELD_WURF: das Feld wirft ${bau.join(", ")} — ein Bau ohne Menschen`] : [];
}
function landmarkeBefunde(taeter, chunkZiel, saetze) {
    const { r, A, ctx } = stammLib.grundWirt(ROOT, taeter);
    const K = vm.runInContext("globalThis.__gelaendeCore", ctx);
    const out = feldWurfBau(r, A.FELD_WURF);
    const span = r._voxelChunkConfig().span;
    const n = {};
    r._enqueueVegetationSpawn = (art) => void (n[art] = (n[art] || 0) + 1);
    const L = r._gelaende();
    const wuchs = Object.assign({}, L.ort.wuchs, { decke: 0 }); // der trockene Ort: keine Decke des Wuchses (Arches)
    const trocken = Object.create(L, { ort: { value: Object.assign({}, L.ort, { wuchs }) } });
    const zeilen = [];
    const S = [["Tafel der Heimat", L, 0.9, 1], ["Heimat außerhalb der Tafel", L, 0, 0], ["trockene Tafel", trocken, 0.9, 1]];
    for (const [name, Lx, lo, hi] of S.slice(0, saetze || S.length)) {
        r._gelaende = () => Lx;
        for (const k of Object.keys(n)) delete n[k];
        const mu = { felsbogen: 0, felsturm: 0 };
        let chunks = 0;
        for (let cx = -3000; cx < 3000 && chunks < chunkZiel; cx++)
            for (let cz = -40; cz < 40 && chunks < chunkZiel; cz++) {
                const x = (cx + 0.5) * span;
                const z = (cz + 0.5) * span;
                const s = K.grossform(Lx, x, z).stil;
                if (s < lo || s > hi) continue;
                chunks++;
                const d = K.landmarke(Lx, x, z);
                for (const art in mu) mu[art] += d[art] * span * span * 1e-6;
                r._landmarkeChunk(cx, cz);
            }
        const km2 = (chunks * span * span) / 1e6;
        const teil = [];
        for (const art in mu) {
            const z = n[art] || 0;
            teil.push(`${art} ${(z / km2).toFixed(2)}/km² (Gesetz ${(mu[art] / km2).toFixed(2)})`);
            if (Math.abs(z - mu[art]) > 4 * Math.sqrt(mu[art]) + 2)
                out.push(`_landmarkeChunk: ${name} ${art} ${z} auf ${km2.toFixed(1)} km², das Gesetz erwartet ${mu[art].toFixed(1)} ± ${(4 * Math.sqrt(mu[art]) + 2).toFixed(1)}`);
        }
        zeilen.push(`${name}: ${teil.join(" · ")}`);
    }
    return { out, zeilen, r, A };
}
{
    const B = landmarkeBefunde(null, 8000);
    for (const z of B.zeilen) console.log("      LANDMARKE " + z);
    ok("Landmarke: das Feld wirft keinen Bau, der Bogen und der Turm folgen dem Gesetz des Orts (`landmarke`)", B.out.length === 0, B.out[0] || B.zeilen.join(" | "));
    const alt = [["_landmarkeChunk", "const lam = d.felsbogen + d.felsturm;", "const lam = (0.014 * N * N) / (span * span * 1e-6);"]];
    const M = landmarkeBefunde(alt, 1000, 1).out.join(" | ");
    ok("Landmarke Selbsttest: die alte Regel (jede Probe 1,4 %) fällt an _landmarkeChunk", /^_landmarkeChunk: Tafel der Heimat fels(bogen|turm) \d+/.test(M), M || "die Mutante blieb grün");
    const F = feldWurfBau(B.r, B.A.FELD_WURF.concat(["glutbrunnen"])).join(" | ");
    ok("Landmarke Selbsttest: die Feuerstelle in der Liste des Felds fällt an FELD_WURF", /^FELD_WURF: das Feld wirft glutbrunnen/.test(F), F || "die Mutante blieb grün");
}

// DER LEBENSLAUF DES BESTANDS (Bahn mischwald, karte2.leben.pflanzen.lebenslauf#1; phyto-core FOREST_ERTRAG): der Plan
// (`planForestCell`) und das EINE Urteil (`forestStehende`) — dieselben Rufe wie Haupt-Faden (`_forestCellDarts`), Wald-Faden
// (`waldDarts`), Kamm und Labor — auf je einem geschlossenen Bestand (52 ha, Stand 0,15: ohne Lichtung, voller Schluss):
//   die Tafel: je Art die Höhe der Größe 1 = foundry PRESETS hoeheM, r streng steigend, Größe groesse[0] bei u = 0, nie über groesse[1];
//   die Höhe: jeder Baum des Dachs trägt die Größe seiner Tafel in der Phase seines Flecks (byte-genau);
//   die Selbst-Ausdünnung: log N gegen log Dq über die Phasen der Flecken (10 Klassen, N je ha Fleck-Fläche, das Dach — der
//     Unterstand ist eine jüngere Kohorte) liegt im Band Reineke −1,605 ± 10 % (Reineke 1933, J. Agric. Res. 46: 627–638); D ∝ s
//     (die Gestalt skaliert isometrisch, der BHD₁ je Art gleich gesetzt — die Steigung trägt der Fleck, nicht die Art);
//   der Tod steht: wer in der Konkurrenz starb und vor tau Jahren stand, steht als `baum_totholz`.
// Selbsttest: ohne den Tod (jeder Geborene steht) fällt die Steigung beim Namen.
{
    const PK = mainCore;
    const FE = PK.FOREST_ERTRAG;
    const G = PK.FOREST_PACK.groesse;
    const FOREST = stammLib.ladeKlasse(ROOT).AnazhRealm.FOREST;
    const SAMEN = 1129275025;
    const NZ = 60;
    const BAND = [-1.605 * 1.1, -1.605 * 0.9];
    const presets = vm.runInContext("(() => { const o = {}; for (const k in PRESETS) o[k] = PRESETS[k].ph && PRESETS[k].ph.hoeheM; return o; })()", fsb);
    const tafel = [];
    for (const [art, k] of Object.entries(FE.kurven)) {
        if (presets[art] !== k.hoeheM) tafel.push(`${art}: hoeheM ${k.hoeheM} ≠ foundry PRESETS ${presets[art]}`);
        for (let i = 1; i < k.r.length; i++) if (!(k.r[i] > k.r[i - 1])) tafel.push(`${art}: r[${i}] ${k.r[i]} steigt nicht`);
        const lo = PK.forestErtragGroesse("baum_" + art, 0);
        const hi = PK.forestErtragGroesse("baum_" + art, 1);
        if (Math.abs(lo - G[0]) > 1e-9 || !(hi <= G[1])) tafel.push(`${art}: Größe ${lo.toFixed(3)}…${hi.toFixed(3)} außerhalb ${G.join("…")}`);
    }
    ok("Ertragstafel: je Art die Höhe der Größe 1 aus foundry PRESETS, r steigt, die Größe in groesse", tafel.length === 0, tafel[0] || `${Object.keys(FE.kurven).length} Tafeln`);
    const bestand = (fc, stehende) => {
        const ctx = { F: FOREST, baseH: 0, extras: [], fbm: () => fc, stand: () => 0.15, schnee: () => 0, ort: () => Infinity, wuchs: GC.ortGesetz(null).wuchs,
            surfaceYAt: () => 30, waterYAt: () => 0, slopeAt: () => 0, feuchteAt: () => 0.3, ortFrei: () => true }; // prettier-ignore
        const K = new Map();
        const geboren = (cx, cz) => K.get(cx + "," + cz) || K.set(cx + "," + cz, PK.planForestCell(cx, cz, SAMEN, ctx)).get(cx + "," + cz);
        const NB = 10;
        const fl = new Float64Array(NB);
        const n = new Float64Array(NB);
        const d2 = new Float64Array(NB);
        const klasse = (x, z) => Math.min(NB - 1, Math.floor(PK.forestFleckPhase(x, z, SAMEN) * NB));
        for (let x = 1; x < NZ * FOREST.cell; x += 2) for (let z = 1; z < NZ * FOREST.cell; z += 2) fl[klasse(x, z)] += 4;
        let tot = 0;
        let alle = 0;
        let falsch = null;
        for (let a = 0; a < NZ; a++)
            for (let b = 0; b < NZ; b++)
                for (const d of stehende(a, b, geboren)) {
                    alle++;
                    if (d.sp === "baum_totholz") tot++;
                    if (d.sp === "baum_totholz" || d.alter < 1) continue;
                    const soll = PK.forestErtragKurve(d.sp) ? PK.forestErtragGroesse(d.sp, PK.forestFleckPhase(d.x, d.z, SAMEN)) : d.s;
                    if (d.s !== soll && !falsch) falsch = `${d.sp} (${d.x.toFixed(1)}, ${d.z.toFixed(1)}): s ${d.s} ≠ Tafel ${soll}`;
                    const k = klasse(d.x, d.z);
                    n[k]++;
                    d2[k] += d.s * d.s;
                }
        const P = [];
        for (let k = 0; k < NB; k++) if (n[k] > 10) P.push([Math.log10(Math.sqrt(d2[k] / n[k])), Math.log10(n[k] / (fl[k] / 1e4))]);
        const mx = P.reduce((s, p) => s + p[0], 0) / P.length;
        const my = P.reduce((s, p) => s + p[1], 0) / P.length;
        let sxy = 0;
        let sxx = 0;
        for (const p of P) (sxy += (p[0] - mx) * (p[1] - my)), (sxx += (p[0] - mx) ** 2);
        return { steigung: sxy / sxx, tot: alle ? tot / alle : 0, falsch, haDach: n.reduce((s, v) => s + v, 0) / ((NZ * FOREST.cell) ** 2 / 1e4) };
    };
    const urteil = (fc, stehende) => {
        const B = bestand(fc, stehende);
        const out = [];
        if (!(B.steigung >= BAND[0] && B.steigung <= BAND[1])) out.push(`forestStehende: Reineke-Steigung ${B.steigung.toFixed(3)} außerhalb ${BAND.map((v) => v.toFixed(3)).join("…")} (Bestand ${fc})`);
        if (B.falsch) out.push("planForestCell: die Höhe folgt nicht der Tafel — " + B.falsch);
        if (!(B.tot > 0)) out.push(`forestStehende: kein Totholz steht (Bestand ${fc})`);
        return { B, out };
    };
    const echt = (gx, gz, geboren) => PK.forestStehende(gx, gz, geboren, FOREST.pack);
    for (const [name, fc] of [["Laub", 0.6], ["Nadel", 0.9]]) {
        const U = urteil(fc, echt);
        ok(`Bestand ${name}: die Höhe folgt der Tafel, die Stammzahl der Reineke-Geraden, der Tod steht`, U.out.length === 0, U.out[0] || `Steigung ${U.B.steigung.toFixed(3)} · Totholz ${(100 * U.B.tot).toFixed(1)} % · Dach ${U.B.haDach.toFixed(0)}/ha`);
    }
    const ohneTod = (gx, gz, geboren) => geboren(gx, gz).filter((d) => !d.gelichtet);
    const M = urteil(0.6, ohneTod).out.join(" | ");
    ok("Bestand Selbsttest: ohne den Tod (jeder Geborene steht) fällt die Steigung an forestStehende", /^forestStehende: Reineke-Steigung -?\d/.test(M), M || "die Mutante blieb grün");
}

wandEnde(errs, "PHYTO-KERN: der Wuchs trägt die Gesetze, Main + Worker aus EINER Quelle (Gesetz #0).");
