// halter-tafel.cjs <akten-dir> <kopf8> [--heap] — DIE ZEIT-TAFEL DES GEHALTENEN HEAPS (Koordinator 23.11.). Je GTX-Akte am Kopf:
// Beginn des Preis-Fensters, Lücke zur Station davor (≤ 5 s = dieselbe warme Welt, ≥ 25 s = neuer Boot), gehaltener Heap
// (preis.posten.heap_mb — das Feld, das der Preis urteilt), typed gesamt, JS-Rest und die Halter der Typed Arrays (posten.heap_typed,
// Tiefe 3) als Spalten. Reihenfolge: die Zeit (so zeigt sich, was eine warme Welt von der Station davor weiterträgt); --heap sortiert
// nach gehaltenem Heap. Fund am ddaf883d und c1236fa8: der JS-Rest fällt nach der Stadt nicht (sternhimmel#1 nach wehrbau#2 JS 278,
// frische Welt ≈ 155), reaktion#1 hebt ihn um ≈ 170 MB. Liest nur, schreibt nichts.
// Aufruf: git archive origin/koordination vision/richter | tar -x -C <ziel> ; node halter-tafel.cjs <ziel> ddaf883d
const fs = require("fs");
const path = require("path");
const dir = path.join(process.argv[2], "vision", "richter");
const kopf = process.argv[3];
const nachHeap = process.argv.includes("--heap");
if (!kopf) {
  console.error("Aufruf: node halter-tafel.cjs <akten-dir> <kopf8> [--heap]");
  process.exit(2);
}
const SP = [
  "r._foundry.cache",
  "r.state.renderer",
  "r.state.weltMarch",
  "r.state.archInstanceGroups",
  "r.state.chunkSaetze",
  "r.state.voxelChunks",
  "r._bewohnerKoepfe[]",
];
const z = [];
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith("." + kopf + "-gtx.json")) continue;
  let j;
  try {
    j = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8").replace(/^﻿/, ""));
  } catch (e) {
    continue;
  }
  const g = j.geraete && j.geraete[0];
  const p = g && g.preis;
  if (!p || !p.posten || typeof p.posten.heap_mb !== "number") continue;
  const po = p.posten;
  const t = Array.isArray(po.heap_typed) ? po.heap_typed : [];
  const m = new Map(t.map((x) => [x[0], x[1]]));
  const typed = typeof po.heap_typed_mb === "number" ? po.heap_typed_mb : t.reduce((s, x) => s + x[1], 0);
  z.push({
    id: f.replace("." + kopf + "-gtx.json", ""),
    von: (p.fenster && p.fenster.von) || "",
    bis: (p.fenster && p.fenster.bis) || "",
    heap: po.heap_mb,
    typed,
    js: po.heap_mb - typed,
    sp: SP.map((k) => m.get(k) || 0),
    r: (g.richter && g.richter.urteil) || "-",
    pu: p.urteil || "-",
  });
}
z.sort((a, b) => (nachHeap ? a.heap - b.heap : a.von < b.von ? -1 : 1));
const r = (x, n) => String(Math.round(x)).padStart(n);
console.log("Beginn    Lücke  heap typed   js | " + SP.map((k) => k.replace(/^r\.(state\.)?/, "").slice(0, 6).padStart(6)).join(" ") + " | R/P  Sprosse");
let vor = "";
const gesehen = new Set();
for (const x of z) {
  if (gesehen.has(x.von + x.heap)) {
    console.log(" ".repeat(69 + SP.length) + `      ${x.r[0]}/${x.pu[0]}  ${x.id} (dieselbe Messung)`);
    continue;
  }
  gesehen.add(x.von + x.heap);
  const luecke = vor && !nachHeap ? Math.round((Date.parse(x.von) - Date.parse(vor)) / 1000) : 0;
  vor = x.bis;
  console.log(
    `${String(x.von).slice(11, 19)} ${("+" + luecke + "s").padStart(6)} ${r(x.heap, 5)} ${r(x.typed, 5)} ${r(x.js, 4)} | ` +
      x.sp.map((v) => (v ? r(v, 6) : "     ·")).join(" ") +
      ` | ${x.r[0]}/${x.pu[0]}  ${x.id}`
  );
}
