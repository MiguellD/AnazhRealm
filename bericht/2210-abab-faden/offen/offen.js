// was hält die Foundry offen (B, Dorf): je Term die Einträge beim Namen (Schlüssel, Art, Alter)
const f = r._foundry || {};
const zeig = (v) => { try { if (!v || typeof v !== "object") return String(v); const o = {}; for (const k of Object.keys(v).slice(0, 14)) { const x = v[k]; o[k] = x && typeof x === "object" ? (Array.isArray(x) ? "Liste " + x.length : "{" + Object.keys(x).slice(0, 6).join(",") + "}") : typeof x === "function" ? "fn" : x; } return o; } catch (e) { return String(e); } };
return {
  offen: r._weltOffen(),
  pending: f.pending ? [...f.pending.entries()].slice(0, 6).map(([k, v]) => ({ k: String(k).slice(0, 120), v: zeig(v) })) : null,
  warte: (f.warte || []).slice(0, 6).map(zeig),
  nachAtlas: (f.nachAtlas || []).slice(0, 6).map(zeig),
  buch: f.buch ? zeig(f.buch) : null,
  ingest: (r._foundryIngestQueue || []).slice(0, 6).map(zeig),
  dorfPending: r._autoSettlementPendingKey || null,
  queue: r._autoSettlementQueue ? { cell: r._autoSettlementQueue.cellKey, idx: r._autoSettlementQueue.idx } : null,
  siedlungLog: r.state.logBuffer.filter((l) => /Siedlung|Export|FOUNDRY|Foundry/.test(l)).slice(-8).map((l) => l.slice(28, 200)),
};
