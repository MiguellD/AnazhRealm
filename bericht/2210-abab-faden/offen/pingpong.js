// während ein Lauf läuft: 6 s lang je 30 ms der Schlüssel des EINEN Dorf-Vorrats (`_dorfVorrat`) — wechselt er zwischen Zellen?
const t0 = performance.now(), folge = [];
let vor = null, wechsel = 0;
while (performance.now() - t0 < 6000) {
  const v = r._dorfVorrat;
  const k = v ? v.key + (v.da ? "+" : "…") : "-";
  if (k !== vor) { folge.push(k); wechsel++; vor = k; }
  await new Promise((res) => setTimeout(res, 30));
}
const SG = r.constructor._siedlungGesetz(), A = r.constructor.AUTO_SETTLEMENT, p = r.state.playerMesh.position;
return { wechsel, folge: folge.slice(0, 40), nearM: A.nearM, vorlaufM: A.vorlaufM, cellM: SG && SG.cellM, spieler: [Math.round(p.x), Math.round(p.z)], zellen: Object.keys(r.state.worldMeta.settlementCells || {}) };
