// M19 Nachtrag: der Weg des Folge-Laufs am Gesetz — Höhe (getTerrainHeightAt), Hang je Sekunde, Kronen-Deckung (_kronenStreuAt),
// Wasser (_atlasWaterLevelAt) längs der Spieler-Proben; dazu der Abstand des Tiers in diesen Abschnitten.
const fs = require("fs");
const path = require("path");
const { oeffne, warte } = require("./spiel.cjs");
(async () => {
  const j = JSON.parse(fs.readFileSync(path.join(__dirname, "roh", "m19-folgen-wiese.json"), "utf8"));
  const o = await oeffne({ profil: path.join(__dirname, "profil-weg"), headless: true });
  const r = await o.page.evaluate((T) => {
    const r = window.anazhRealm, st = r.state;
    const out = T.map((t) => { const [x, z] = t.p; const h = r.getTerrainHeightAt(x, z); let w = -Infinity; try { w = r._atlasWaterLevelAt(x, z, h); } catch (_e) {} let k = null; try { k = r._kronenStreuAt(x, z); } catch (_e) {} return { h, nass: w > h, k, d: t.d, dy: t.dy }; });
    return { seed: st.worldMeta && st.worldMeta.seed, out };
  }, j.tier);
  const o2 = r.out;
  let steig = 0, hangMax = 0, steilS = 0, waldS = 0, nassS = 0, dSteil = [], dWald = [];
  for (let i = 1; i < o2.length; i++) {
    const dx = Math.hypot(j.tier[i].p[0] - j.tier[i - 1].p[0], j.tier[i].p[1] - j.tier[i - 1].p[1]);
    const dh = o2[i].h - o2[i - 1].h;
    if (dh > 0) steig += dh;
    const hang = dx > 0.3 ? Math.atan2(Math.abs(dh), dx) * 57.3 : 0;
    hangMax = Math.max(hangMax, hang);
    if (hang > 15) (steilS++, dSteil.push(o2[i].d));
    if ((o2[i].k || 0) > 0.12) (waldS++, dWald.push(o2[i].d));
    if (o2[i].nass) nassS++;
  }
  const mx = (a) => (a.length ? Math.max(...a) : null);
  const res = { seed: r.seed, seedLauf: j.start, proben: o2.length, hoeheMin: Math.min(...o2.map((x) => x.h)).toFixed(1), hoeheMax: Math.max(...o2.map((x) => x.h)).toFixed(1), anstiegM: +steig.toFixed(1), hangMaxGrad: +hangMax.toFixed(1), sekundenHangUeber15: steilS, dMaxAmHang: mx(dSteil), sekundenImWald: waldS, dMaxImWald: mx(dWald), sekundenNass: nassS };
  fs.writeFileSync(path.join(__dirname, "roh", "m19-weg.json"), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));
  await o.browser.close();
})().catch((e) => { console.error("FEHLER", e && e.stack); process.exit(1); });
