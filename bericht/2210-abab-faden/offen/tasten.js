// während ein Lauf läuft: 6 s lang alle 30 ms die Foundry-Terme abtasten — welche Schlüssel kommen, wie oft, wie lange offen
const f = r._foundry || {};
const seen = new Map();
const kurz = (v) => { try { if (!v || typeof v !== "object") return String(v).slice(0, 80); const o = {}; for (const k of Object.keys(v).slice(0, 12)) { const x = v[k]; o[k] = x && typeof x === "object" ? (Array.isArray(x) ? "L" + x.length : "{" + Object.keys(x).slice(0, 5).join(",") + "}") : typeof x === "function" ? "fn" : String(x).slice(0, 60); } return o; } catch (e) { return "?"; } };
const t0 = performance.now();
let proben = 0, mitOffen = 0;
while (performance.now() - t0 < 6000) {
  proben++;
  const o = r._weltOffen();
  if (o.foundry) mitOffen++;
  const merk = (art, k, v) => { const key = art + ":" + k; const s = seen.get(key) || { art, k, n: 0, v: kurz(v) }; s.n++; seen.set(key, s); };
  if (f.pending) for (const [k, v] of f.pending.entries()) merk("pending", String(k).slice(0, 100), v);
  for (const v of f.warte || []) merk("warte", (v && (v.id || v.key || v.typ)) || "?", v);
  for (const v of f.nachAtlas || []) merk("nachAtlas", (v && (v.id || v.key)) || "?", v);
  if (f.buch) merk("buch", "buch", f.buch);
  for (const v of r._foundryIngestQueue || []) merk("ingest", (v && (v.id || v.key || v.typ || v.art)) || "?", v);
  await new Promise((res) => setTimeout(res, 30));
}
return { proben, mitOffen, offenJetzt: r._weltOffen(), schluessel: [...seen.values()].sort((a, b) => b.n - a.n).slice(0, 12) };
