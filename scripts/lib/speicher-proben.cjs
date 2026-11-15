// speicher-proben.cjs — DIE PROBEN DES SPEICHERS der Werkbank (Domäne Speicher; aus scripts/werkbank.cjs, Decke 4 000 Zeilen).
//
// DER WEG DES SPEICHERS (`werkbank weg`; Preis des Orts, Schnitt 2; Heilung Gegner Gesetz F2, 15.11.): die laufende Sitzung
// (`start --echt --ort wiese`) fährt die Posen der Ratsche (spec/profiband/weg-wiese-radeon.json) und kehrt zur ersten zurück; je
// Pose eingeschwungen, 30 s der Preis-Lauf (`/lauf`), dann zwei GC (`/puffer`) — Heap, VRAM, die Typed-Halter. Die Fahrt geht als
// weg.json nach `datei` und durch H8 (`wegUrteil`: Preis je Pose, Ratsche je Pose, Zuwachs bis zur Rückkehr je Minute, ROT beim
// Pfad des Halters). Bis hier lebte der Erzeuger als ignorierte Datei unter artifacts/, und H8 las nur, was ein Mensch ihm reichte
// (`diag-profiband --weg`). → { text, gruen }
"use strict";
const { fs, path, sleep } = require("./welt-boot.cjs");
const DZ = require("./draw-zaehler.cjs");

async function wegFahrt({ ratsche, datei, umstellen, rufe }) {
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

module.exports = { wegFahrt };
