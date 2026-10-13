// 1310-1: die Bänder einer Schalter-Sitzung (sitzung.sh) zu Blöcken mit Takt je Band, dann das Schalter-Urteil.
// node auswertung.cjs <ordner> [--schalter-urteil <pfad zu schalter-urteil.cjs oder omen-messfolge.cjs>]
"use strict";
const fs = require("fs");
const path = require("path");
const ordner = process.argv[2];
const ui = process.argv.indexOf("--schalter-urteil");
const quelle = ui > 0 ? path.resolve(process.argv[ui + 1]) : path.join(__dirname, "schalter-urteil.cjs");
const { schalterUrteil } = require(quelle);
const zeilen = fs
    .readFileSync(path.join(ordner, "baender.csv"), "utf8")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map((l) => {
        const [block, zustand, idx, t0, t1, gpu, befehle, art] = l.split(",");
        return { block: +block, zustand, idx, t0: +t0, t1: +t1, gpu: Number(gpu), befehle: Number(befehle), art };
    });
// nvidia-smi: "2026/10/13 10:20:01.123, 1708, 71, 70.12, 0x0000000000000004" — Ortszeit
const takt = fs
    .readFileSync(path.join(ordner, "takt.csv"), "utf8")
    .split(/\r?\n/)
    .map((l) => l.split(",").map((x) => x.trim()))
    .filter((f) => f.length >= 5 && /^\d{4}\/\d\d\/\d\d /.test(f[0]))
    .map((f) => ({ t: new Date(f[0]).getTime(), mhz: Number(f[1]), temp: Number(f[2]), w: Number(f[3]), drossel: f[4] }));
const taktIn = (t0, t1) => {
    // die GPU-Bank des Bands ist das letzte Stück (~1–2 s): der Takt der zweiten Hälfte des Fensters, gemittelt
    const mitte = t0 + (t1 - t0) / 2;
    const w = takt.filter((x) => x.t >= mitte && x.t <= t1 && Number.isFinite(x.mhz) && x.mhz > 300).map((x) => x.mhz);
    if (!w.length) return null;
    // das MITTEL der Proben (wie `taktAus` der Messfolge): ein Median rastet auf die 13-MHz-Stufen des Boost-Takts (1784/1797 =
    // 0,7 %) und fiele bei einer einzigen Stufe aus der Toleranz
    return +(w.reduce((x, y) => x + y, 0) / w.length).toFixed(1);
};
const bloecke = [];
const banken = [];
const laeufe = [];
for (const z of zeilen) {
    if (z.art === "lauf") {
        laeufe.push({ block: z.block, zustand: z.zustand, fps: z.gpu, p50: z.befehle, takt: taktIn(z.t0, z.t1) });
        continue;
    }
    if (z.art === "bank") {
        banken.push({ block: z.block, zustand: z.zustand, gpu: z.gpu, takt: taktIn(z.t0, z.t1) });
        continue;
    }
    let b = bloecke[z.block - 1];
    if (!b) b = bloecke[z.block - 1] = { zustand: z.zustand, baender: [], takt: [], befehle: [] };
    b.baender.push(z.gpu);
    b.takt.push(taktIn(z.t0, z.t1));
    b.befehle.push(z.befehle);
}
fs.writeFileSync(path.join(ordner, "bloecke.json"), JSON.stringify({ bloecke, banken, laeufe }, null, 1));
const u = schalterUrteil(bloecke.filter(Boolean));
const f2 = (x) => (Number.isFinite(x) ? x.toFixed(2) : "?");
console.log(`=== SCHALTER-URTEIL ${ordner} (${bloecke.length} Blöcke, Quelle ${path.basename(quelle)}) ===`);
bloecke.forEach((b, i) => {
    const bk = banken.find((x) => x.block === i + 1);
    const lf = laeufe.find((x) => x.block === i + 1);
    console.log(
        lf ? `     Lauf voll: fps ${f2(lf.fps)} · Frame p50 ${f2(lf.p50)} · Takt ${lf.takt ? lf.takt.toFixed(0) : "?"}` : ""
    );
    console.log(
        `  ${String(i + 1).padStart(2)} ${b.zustand.padEnd(15)} Aufwärm ${f2(b.baender[0])} | Dauer ${b.baender.slice(1).map(f2).join(" · ")} | Bank ${bk ? f2(bk.gpu) : "?"} | Befehle ${[...new Set(b.befehle)].join("/")} | Takt ${b.takt.map((t) => (t ? t.toFixed(0) : "?")).join("/")}`
    );
});
console.log(`  Grund-Mittel ${u.grund.map(f2).join(" · ")} → σ ${u.sigma} ms · Erst-Zeichnung der Grund-Blöcke ${u.erstGrund} ms`);
for (const z of u.zeilen)
    console.log(
        `  ${z.schalter.padEnd(15)} Δ ${z.delta >= 0 ? "+" : ""}${z.delta.toFixed(3)} ms (je Block ${z.je.join(" · ")}) · Rauschband ±${z.rauschband} · Erst-Zeichnung ${z.erst} ms → ${z.urteil}`
    );
// dieselbe Rechnung über die lange Bank (100×3), Blöcke ohne Aufwärm-Verwurf (die Bank wärmt selbst 3 Frames)
const bb = bloecke.map((b, i) => {
    const bk = banken.find((x) => x.block === i + 1);
    return bk ? { zustand: b.zustand, baender: [bk.gpu, bk.gpu, bk.gpu, bk.gpu], takt: [bk.takt, bk.takt, bk.takt, bk.takt] } : null;
});
if (bb.every(Boolean)) {
    const ub = schalterUrteil(bb);
    console.log(`  — lange Bank: Grund σ ${ub.sigma} ms`);
    for (const z of ub.zeilen)
        console.log(`  ${z.schalter.padEnd(15)} Δ ${z.delta >= 0 ? "+" : ""}${z.delta.toFixed(3)} ms (je Block ${z.je.join(" · ")}) · Rauschband ±${z.rauschband} → ${z.urteil}`);
    for (const b of (ub.verworfen || []).concat(ub.befunde.filter((x) => !/Dauer-Bänder/.test(x)))) console.log("  (Bank) " + b);
}
for (const b of u.verworfen || []) console.log("  VERWORFEN " + b);
if (u.takt) console.log(`  Takt über die Sitzung ${u.takt.erst} → ${u.takt.letzt} MHz (Band-Mittel)`);
// der Lauf unter Regler voll je Block (fps) — dieselbe Rechnung, ein Wert je Block
const lb = bloecke.map((b, i) => {
    const lf = laeufe.find((x) => x.block === i + 1);
    return lf ? { zustand: b.zustand, baender: [lf.fps, lf.fps, lf.fps, lf.fps], takt: [lf.takt, lf.takt, lf.takt, lf.takt] } : null;
});
if (lb.length && lb.every(Boolean)) {
    const ul = schalterUrteil(lb);
    console.log(`  — Lauf voll (fps): Grund σ ${ul.sigma}`);
    for (const z of ul.zeilen)
        console.log(`  ${z.schalter.padEnd(15)} Δ fps ${z.delta >= 0 ? "+" : ""}${z.delta.toFixed(2)} (je Block ${z.je.join(" · ")}) · Rauschband ±${z.rauschband} → ${z.urteil}`);
    for (const b of (ul.verworfen || []).concat(ul.befunde.filter((x) => !/Dauer-Bänder/.test(x)))) console.log("  (Lauf) " + b);
}
if (u.befunde.length) {
    for (const b of u.befunde) console.log("  ROT " + b);
    console.log("\n❌ SCHALTER ROT");
    process.exit(1);
}
console.log("\n✅ SCHALTER GRÜN — die Methode trennt Erst- von Dauer-Zeichnung, der Null-Schalter liegt im Rauschen.");
