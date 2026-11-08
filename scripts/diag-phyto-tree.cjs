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
require("../phyto-core.js");
const mainCore = globalThis.__phytoCore;
if (typeof mainCore?.growSkeleton !== "function") {
    throw new Error("phyto-core.js hat __phytoCore.growSkeleton nicht exportiert");
}
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
const PZ = (fsb.__pZwillingArgs = { arten: ["eiche", "fichte", "birke", "weide", "mammut", "tanne", "buche", "karst", "totholz", "strauch"], samen: [1, 2, 7, 12345], stufen: [0, 1, 2] });
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

wandEnde(errs, "PHYTO-KERN: der Wuchs trägt die Gesetze, Main + Worker aus EINER Quelle (Gesetz #0).");
