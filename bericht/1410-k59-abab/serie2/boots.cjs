// 1410-k59-abab: je Boot CPU-Takt p50/p95 (Lauf voll), Tiere im Bild, und je Bank-Blick GPU ms + Takt/Drossel — node boots.cjs <dir>
"use strict";
const fs = require("fs");
const path = require("path");
const dir = process.argv[2];
for (const n of fs.readdirSync(dir).filter((x) => /^[wg]-(ego|third)-[AB]\d\.json$/.test(x)).sort()) {
    const j = JSON.parse(fs.readFileSync(path.join(dir, n), "utf8"));
    const lv = (j.schritte || []).find((s) => s.name === "lauf-voll");
    const e = (lv && lv.ergebnis) || {};
    const k = j.kurz || {};
    const bank = k.gpuBank || k["gpu-bank"] || null;
    const bt = bank
        ? Object.entries(bank)
              .filter(([g]) => g !== "tiere")
              .map(([g, b]) => {
                  const t = b && b.takt;
                  const mhz = t ? t.mhz || t.gr || t.graphics || (t.vor && t.vor.mhz) || JSON.stringify(t).slice(0, 60) : "?";
                  const dr = t ? t.drossel || t.throttle || (t.vor && t.vor.drossel) || "" : "";
                  return `G${g}: ${b.gpuJeFrameMs} ms, Takt ${typeof mhz === "object" ? JSON.stringify(mhz) : mhz} ${dr}, Tiere im Bild ${b.tiere ? b.tiere.sicht : "?"}`;
              })
              .join(" · ")
        : "–";
    console.log(
        `${n.replace(".json", "")}: CPU p50/p95 ${e.cpuTaktMs ? e.cpuTaktMs.p50 + "/" + e.cpuTaktMs.p95 : "?"} · Frame p95 ${e.frameMs ? e.frameMs.p95 : "?"} · ${bt}`
    );
}
