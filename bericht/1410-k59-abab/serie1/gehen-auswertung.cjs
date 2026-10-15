// 1410 boden3: Tafel der Gehend-ABAB (p3/k1410k/s1, s2) — je Lauf fps, Frame p50/p95/p99, CPU-Takt p50/p95, Anteil > 33 ms,
// Befehle/Dreiecke (Mittel), GPU p50, VRAM; dazu die Geher-Wege. node auswertung.cjs [dir]
const fs = require('fs');
const path = require('path');
const dir = process.argv[2] || __dirname;
const SITZ = fs.readdirSync(dir).filter((d) => /^s\d+$/.test(d)).sort();
const LAEUFE = ['steht', 'geht-1', 'geht-2'];
const lies = (f) => {
    try {
        const t = fs.readFileSync(f, 'utf8');
        return JSON.parse(t.slice(t.indexOf('{')));
    } catch (e) {
        return null;
    }
};
const zeile = (j) =>
    j
        ? [
              j.fps,
              j.frameMs?.p50,
              j.frameMs?.p95,
              j.frameMs?.p99,
              j.cpuTaktMs?.p50,
              j.cpuTaktMs?.p95,
              j.ueber33,
              j.befehle?.mittel,
              j.dreiecke ? Math.round(j.dreiecke.mittel / 1000) + 'k' : '?',
              j.gpuMs?.p50,
              j.vramMB?.jetzt,
              j.stempel?.gueltig === false ? 'STEMPEL-ROT' : '',
          ].join(' / ')
        : 'FEHLT';
const aus = { dir, sitzungen: {} };
console.log('Lauf | Seite | fps / F p50 / F p95 / F p99 / CPU p50 / CPU p95 / >33 % / Befehle / Dreiecke / GPU p50 / VRAM');
for (const s of SITZ) {
    aus.sitzungen[s] = {};
    for (const seite of ['A', 'B']) {
        const e = lies(path.join(dir, s, `${seite}-geher-ende.txt`));
        const u = lies(path.join(dir, s, `${seite}-umstellen.txt`));
        aus.sitzungen[s][seite] = { geher: e?.ergebnis ?? null, ort: u?.spieler ?? null };
        for (const l of LAEUFE) {
            const j = lies(path.join(dir, s, `${seite}-${l}.txt`));
            aus.sitzungen[s][seite][l] = j
                ? {
                      fps: j.fps,
                      frame: j.frameMs,
                      cpu: j.cpuTaktMs,
                      ueber33: j.ueber33,
                      befehle: j.befehle?.mittel,
                      dreiecke: j.dreiecke?.mittel,
                      gpuP50: j.gpuMs?.p50,
                      vram: j.vramMB?.jetzt,
                      stempel: j.stempel?.gueltig,
                  }
                : null;
            console.log(`${s} ${l} | ${seite} | ${zeile(j)}`);
        }
        console.log(`${s} geher | ${seite} | ${JSON.stringify(e?.ergebnis ?? null)} ort ${JSON.stringify(u?.spieler ?? null)}`);
    }
}
const mittel = (a) => a.reduce((x, y) => x + y, 0) / a.length;
console.log(`\nMittel je Seite (${SITZ.join(', ')}) und Δ B − A:`);
for (const l of LAEUFE) {
    for (const k of [
        ['frame', 'p95'],
        ['cpu', 'p50'],
        ['cpu', 'p95'],
    ]) {
        const w = (seite) =>
            SITZ.map((s) => aus.sitzungen[s][seite][l]?.[k[0]]?.[k[1]]).filter(Number.isFinite);
        const a = w('A');
        const b = w('B');
        if (!a.length || !b.length) continue;
        console.log(
            `${l} ${k.join(' ')}: A ${a.join('|')} (${mittel(a).toFixed(1)}) → B ${b.join('|')} (${mittel(b).toFixed(1)}) Δ ${(mittel(b) - mittel(a)).toFixed(2)}`
        );
    }
}
fs.writeFileSync(path.join(dir, 'auswertung.json'), JSON.stringify(aus, null, 1));
