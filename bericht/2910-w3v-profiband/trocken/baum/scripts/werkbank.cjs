// STUB der Werkbank für den trockenen Lauf des Mess-Gangs (w3v-profiband): dieselben Verben und dieselbe Ausgabe-Form wie
// scripts/werkbank.cjs, die Zahlen ohne GPU — die Felder aus den echten Linsen abgeleitet: die Belegung aus
// `belegungAuswerten` (zerlege-linse) an einer Spur, das Band aus `bandUrteil` (band-urteil) gegen Haushalt und Ratsche,
// der Gang aus `gangUrteil` (draw-zaehler). STUB_MODUS: gruen (Zahlen im Band) · linse (das Band so, wie die Linse es an
// einem leeren Zensus urteilt) · skala (Szenen-Skala 0,5) · halten (der Halte-Griff griff in Sitzung 2).
"use strict";
const fs = require("fs");
const path = require("path");
const ROOT = process.env.SPIEL; // der Spiel-Baum, dessen Linsen der Stub liest
const ZL = require(ROOT + "/scripts/lib/zerlege-linse.cjs");
const BAND = require(ROOT + "/scripts/lib/band-urteil.cjs");
const DZ = require(ROOT + "/scripts/lib/draw-zaehler.cjs");
const MODUS = process.env.STUB_MODUS || "gruen";
const ZUSTAND = path.join(__dirname, "..", "zustand.json");
const z = fs.existsSync(ZUSTAND) ? JSON.parse(fs.readFileSync(ZUSTAND, "utf8")) : { sicht: "first", ort: "wiese", sprint: false, gehalten: false, boot: 0 };
const ab = () => fs.writeFileSync(ZUSTAND, JSON.stringify(z));
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(n) ? argv[argv.indexOf(n) + 1] : d);
const ende = (o, gruen = true) => (console.log(typeof o === "string" ? o : JSON.stringify(o, null, 1)), process.exit(gruen ? 0 : 1));

// eine Spur wie `lauf` sie nimmt (Takt-Marken in der rAF-Hülle, 60 Bilder/s) — die Belegung je Bild ≈ Takt + Rahmen + Layout
function spur(taktMs, n = 600) {
    const ev = [{ pid: 2, tid: 9, ph: "X", name: "RunTask", ts: 0, dur: 1e9 }];
    const X = (name, ts, dur) => ev.push({ pid: 1, tid: 1, ph: "X", name, ts, dur });
    const M = (name, ts) => ev.push({ pid: 1, tid: 1, ph: "R", cat: "blink.user_timing", name, ts });
    for (let i = 0, a = 1000; i < n; i++, a += 16667) {
        const us = Math.round(taktMs * 1000 * (1 + 0.04 * Math.sin(i)));
        X("RunTask", a, us + 300);
        X("FireAnimationFrame", a + 50, us + 150);
        X("FunctionCall", a + 60, us + 120);
        M("anazh-takt", a + 100);
        M("anazh-bild", a + 100 + us);
        X("Layout", a + us + 400, 300);
    }
    return ZL.belegungAuswerten(ev);
}

const cmd = argv[0];
if (cmd === "start") {
    z.boot++, (z.gehalten = false), (z.sprint = false), ab();
    console.log("[linse-gpu] nvidia/pascal (Stub: NVIDIA GeForce GTX 1060)");
    console.log("WERKBANK bereit: Steuer 127.0.0.1:" + opt("--port") + " · Seite stub");
    process.exit(0);
}
if (cmd === "stop") ende({ stop: true });
if (cmd === "fenster") ende({ w: +argv[1], h: +argv[2] });
if (cmd === "umstellen") {
    z.ort = opt("--ort");
    z.sicht = opt("--sicht") === "third" ? "third" : "first";
    ab();
    ende({ ort: z.ort, sicht: opt("--sicht") });
}
if (cmd === "eval") {
    const c = argv[1] || "";
    let e = 1;
    if (/__tiereGehalten/.test(c)) e = { gehalten: z.gehalten, sicht: z.sicht, speed: 4.5, sprint: 7.65, skala: MODUS === "skala" ? 0.5 : 0.75 };
    else if (/keydown/.test(c)) (z.sprint = true), ab();
    else if (/keyup/.test(c)) (z.sprint = false), ab();
    else if (/enterPortal/.test(c)) e = { bau: true, tor: true, heim: true };
    ende({ ergebnis: e });
}
if (cmd === "lauf") {
    const sek = Number(argv[1]) || 20, wandern = opt("--wandern"), tiere = opt("--tiere", "halten"), regler = opt("--regler", "frei");
    if (tiere === "halten" || (MODUS === "halten" && z.boot === 2)) (z.gehalten = true), ab();
    const steht = !wandern && !z.sprint;
    const p95 = wandern === "fahrt" ? 16.8 : 16.7;
    const weg = wandern === "bahn" ? 4 * sek : wandern === "fahrt" ? 20 * sek : z.sprint ? 7.1 * sek : 0;
    const n = /^\d+$/.test(tiere) ? +tiere : 0;
    const zahl = (a, b, c, d) => ({ p50: a, p95: b, p99: c, max: d });
    const o = {
        regler, sekunden: sek, frames: Math.round(sek * 59.6), fps: 59.6, frameMs: zahl(16.6, p95, 17.5, 34.1), cpuTaktMs: zahl(3.4, steht ? 3.9 : 5.2, 6.4, 9.8),
        leine: { ausgesetztPct: 0.4, imFlug: 1 }, gpuMs: Object.assign(zahl(9.1, 10.6, 11.4, 13.2), { n: Math.round(sek * 59), quelle: "stempel" }),
        gpuDurchsatzMs: zahl(16.6, 16.7, 17.1, 33.5), gpuJePassMs: {}, stempel: { imLauf: 0, seitBoot: 0, spitze: 40, pool: { max: 2048 }, gueltig: true },
        befehle: { frames: 1700, mittel: 152, p95: 166, max: 181, jePass: {} }, dreiecke: { frames: 1700, mittel: 498000, p95: 541000, max: 590000, jePass: {} },
        vramMB: { jetzt: 110.4, puffer: 61.2, texturen: 49.2, spitze: 114.9, nPuffer: 5200, nTexturen: 310, wuchsImFenster: 0.1, gross: [] },
        stellgroessen: { loadScale: regler === "voll" ? 1 : 0.71, szeneSkala: MODUS === "skala" ? 0.5 : 0.75, pixelRatio: 1, holz: "voll" },
        phasenEwmaMs: {}, kamera: { pos: [0, 0, 0], blick: [0, 0, 1] }, chunks: 225, ruhe: opt("--ruhe") ? { ruhig: true, sek: 8.2 } : null,
        wetter: opt("--wetter") || "sunny", wetterHalt: { vorher: "sunny", nachher: "sunny", urteil: "GRUEN", taeter: [] }, saison: "summer",
        bahnM: Math.round(weg), kreis: null, buehnenTiere: n, haenger: null, fehler: [],
        belegung: spur(steht ? 4.6 : 6.6),
    };
    const rot = [o.belegung.urteil === "ROT" && "BELEGUNG ROT: " + o.belegung.befund].filter(Boolean);
    console.log(JSON.stringify(o, null, 1));
    if (rot.length) console.log(rot.join("\n"));
    process.exit(rot.length ? 1 : 0);
}
if (cmd === "band") {
    const ort = opt("--ort"), sicht = z.sicht === "third" ? "third" : "ego";
    const spec = BAND.ladeSpec(ort, { geraet: "gtx", sicht });
    const u = BAND.bandUrteil({ zensus: { klassen: [] }, vram: { mb: 111.2, liste: [] }, texturen: null, gpu: { gpuJeFrameMs: 10.9, cpuJeFrameMs: 6.1 },
        haushalt: spec.haushalt, ratsche: BAND.ratscheVon(spec), ort: spec.ort, ratscheDatei: spec.ratscheDatei });
    // GRÜN: das Band in der Form der Linse, die Befunde des leeren Zensus fort (er hat keine Klassen — die Ratsche stünde „zu weit")
    if (MODUS !== "linse") Object.assign(u, { urteil: "GRUEN", rot: [], groessen: u.groessen.map((g) => ({ ...g, ist: g.ist == null ? 0 : g.ist || { Befehle: 151, Dreiecke: 548000 }[g.name] || g.ist })) });
    Object.assign(u, { spieler: spec.ort.spieler, amMessort: true, zustand: {}, ortGestellt: [], geraet: { schluessel: "gtx", text: "NVIDIA GeForce GTX 1060" }, sicht,
        version: "stub", ratscheDatei: spec.ratscheDatei, messung: { proben: 6, eingeschwungen: true, takte: 200, ms: 12000, stand: { loadScale: 1 }, offen: null },
        gpu: { n: 12, runden: 3, gpuJeFrameMs: 10.9, cpuJeFrameMs: 6.1, gpuGebunden: true }, stempel: { urteil: "GRUEN", seitBoot: 0 } });
    fs.writeFileSync(opt("--datei"), JSON.stringify(u, null, 1));
    ende("BAND " + u.urteil + "\n\n" + opt("--datei"), u.urteil === "GRUEN");
}
if (cmd === "puffer" && argv.includes("--gang")) {
    const stand = (mb, heap) => ({ min: 0, heapMB: heap, halter: [], vram: { mb, liste: [{ k: "buf:szene:baum", mb: mb - 4 }, { k: "buf:szene:tier:wolf", mb: 4 }] }, puffer: { halter: { szene: 60, bild: 1 } }, tiere: { "buf:szene:tier:wolf": 2 } });
    const vor = stand(109.8, 312.4), nach = Object.assign(stand(110.6, 318.9), { min: 4.1 });
    const urteil = DZ.gangUrteil({ vor, nach });
    console.log(JSON.stringify({ urteil, heapMB: [vor.heapMB, nach.heapMB], vramMB: [vor.vram.mb, nach.vram.mb], min: 4.1, tiere: [vor.tiere, nach.tiere] }, null, 1));
    ende(urteil.length ? "GANG ROT" : "GANG GRÜN", !urteil.length);
}
if (cmd === "puffer")
    ende({ texturen: { n: 310, mb: 49.2 }, vram: { mb: z.boot ? 110.1 : 109.9, puffer: 61, texturen: 49.1, spitze: 114.9, gc: 0, liste: [] },
        puffer: { mb: 61, halter: { szene: 59.7, bild: 1.3 }, klassen: [] }, halter: null, heapMB: 312.8 });
ende({ fehler: "Stub kennt " + cmd + " nicht" }, false);
