// HAND-LAUF DER WACHE am Fenster k4-fahrt (profiband.K4 = die Probe der Glätte, der Anfang der Dauer; Leser 2, 26.11.): an der ECHTEN
// Seite der Werkbank (WERKBANK_PORT), die Wache der Werkbank (`/wirt` nimm · gib, die Marken jedes /eval, werkbank.cjs:2624/2654), die
// Bytes der Station aus dem Programm der Probe (`const SEITE = …` im Befehl der Glätte, Basis und Kandidat), die Folge des Fensters H wie
// pbProbe sie fährt: SEITE.k4fahrt · Zapfen (zelle) · 2,8 s Hänger · Zapfen (zelle null) · die Tasten lesen. Danach `gib` OHNE den
// Collector (der Läufer der Basis, punkte.cjs:4402 `wirtRuf(W, true, mitPreis)`, die Glätte ohne Preis) und MIT ihm (der Kandidat).
//   node k4-wache-hand.cjs <basis-stationen-dir> <kandidat-stationen-dir>
const http = require("http"), path = require("path");
const PORT = Number(process.env.WERKBANK_PORT || 24600);
const ruf = (weg, b) => new Promise((ok, no) => {
    const d = JSON.stringify(b || {});
    const q = http.request({ host: "127.0.0.1", port: PORT, path: weg, method: "POST", headers: { "content-type": "application/json", "content-length": Buffer.byteLength(d) }, timeout: 180000 }, (r) => {
        let s = "";
        r.on("data", (c) => (s += c));
        r.on("end", () => { try { ok(JSON.parse(s)); } catch (_e) { ok({ roh: s }); } });
    });
    q.on("error", no);
    q.on("timeout", () => q.destroy(new Error("frist " + weg)));
    q.end(d);
});
const schlaf = (ms) => new Promise((f) => setTimeout(f, ms));
const seite = (dir) => {
    const st = require(path.resolve(dir, "g6.js")).find((s) => s.probe && Array.isArray(s.probe.befehl) && s.probe.befehl[3] === "glaette");
    return JSON.parse(/const SEITE = (\{.*?\}); const PB_ZELLEN/.exec(st.probe.befehl[2])[1]);
};
const S = { basis: seite(process.argv[2]), kandidat: seite(process.argv[3]) };
const ZAPFEN = (z) => "return { zelle: " + JSON.stringify(z) + " };"; // der Zapfen des Stroms hält nichts (punkte.cjs:3622): hier ein Rumpf ohne Abschluss
(async () => {
    const zeilen = [];
    for (const [k4, mitGC] of [["kandidat", true], ["kandidat", false], ["basis", true], ["basis", false]]) {
        const s = S[k4];
        const nimm = await ruf("/wirt", { gib: false, heap: false });
        if (!nimm.genommen) throw new Error("nimm: " + JSON.stringify(nimm).slice(0, 200));
        await ruf("/eval", { code: s.k4fahrt });
        await ruf("/eval", { code: ZAPFEN("k4-fahrt") });
        await schlaf(2800);
        await ruf("/eval", { code: ZAPFEN(null) });
        const tasten = (await ruf("/eval", { code: s.k4ende || "return window.__k4 || null" })).ergebnis;
        const t0 = Date.now();
        const gib = await ruf("/wirt", { gib: true, heap: mitGC });
        const ms = Date.now() - t0;
        const kopf = (gib.haelt || []).map((h) => h.slice(0, 44));
        zeilen.push(["K4 " + k4.padEnd(8), "gib " + (mitGC ? "MIT Collector " : "OHNE Collector"), "lebend " + (gib.haelt || []).length, (gib.ungemessen ? "UNGEMESSEN" : "misst").padEnd(10), "gib " + ms + " ms", "Heap nach " + gib.heapNach + " MB", "Tasten " + JSON.stringify(tasten), kopf.join(" | ")].join(" · "));
        console.log(zeilen[zeilen.length - 1]);
        // die Uhren der Basis laufen bis 20 s + 2,3 s: erst danach misst der nächste Fall an einer stillen Seite
        await schlaf(k4 === "basis" ? 24000 : 1000);
    }
})().catch((e) => { console.log("FEHLER " + e.message); process.exit(1); });
