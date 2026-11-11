// Meldet Workflow-Agenten, deren Protokoll (agent-<id>.jsonl) seit über <min> Minuten still steht, während der Agent noch kein
// Ergebnis hat. Anlass 10.10.: der S3-haus-Arbeiter hing 2 h 20 min an einem nie gestarteten Gate-Lauf, unbemerkt.
// Aufruf: node stillstand-wache.cjs <minuten> <workflow-dir> [<workflow-dir> …] [--merke <datei>] [--einmal]
// (je Agent eine Meldung, erneut nach weiteren <min>; --merke hält das über Neustarts, --einmal endet nach der ersten Meldung)
// Bekannter Fehlalarm: nach TaskStop + Resume bleibt der gestoppte Agent im Journal „gestartet ohne Ergebnis“ (ein Resume schreibt keine
// neue launched-Zeile) — seine Meldung ist ein Rest, kein Hänger; prüfen, ob ein jüngerer Agent desselben Laufs schreibt.
// Das Kriterium ist EINE Funktion: stillstehende(dirs, grenze) — auch messplatz-blick.cjs (Seite FRESSER) liest es.
const fs = require('fs')
const path = require('path')
// je laufendem Workflow (Journal ohne completed/failed/error) die Agenten ohne Ergebnis, deren Protokoll ≥ grenze min still steht
function stillstehende (dirs, grenze, jetzt = Date.now()) {
  const out = []
  for (const d of dirs) {
    let ls
    try { ls = fs.readFileSync(path.join(d, 'journal.jsonl'), 'utf8').split('\n').filter(Boolean) } catch (_e) { continue }
    const lab = {}
    const fertig = new Set()
    let ende = false
    for (const l of ls) {
      let j
      try { j = JSON.parse(l) } catch (_e) { continue }
      if (j.label) lab[j.agentId] = j.label
      if (j.type === 'result') fertig.add(j.agentId)
      if (j.type === 'completed' || j.type === 'failed' || j.type === 'error') ende = true
    }
    if (ende) continue
    for (const [id, label] of Object.entries(lab)) {
      if (fertig.has(id)) continue
      let m
      try { m = fs.statSync(path.join(d, 'agent-' + id + '.jsonl')).mtimeMs } catch (_e) { continue }
      const still = (jetzt - m) / 60000
      if (still >= grenze) out.push({ dir: d, id, label, still })
    }
  }
  return out
}
module.exports = { stillstehende }
if (require.main === module) {
  const grenze = Number(process.argv[2]) || 60
  const mi = process.argv.indexOf('--merke')
  const merkDatei = mi > 0 ? process.argv[mi + 1] : null
  const einmal = process.argv.includes('--einmal')
  const dirs = process.argv.slice(3).filter((a, i, all) => !a.startsWith('--') && all[i - 1] !== '--merke')
  const gemeldet = {}
  if (merkDatei) { try { for (const z of fs.readFileSync(merkDatei, 'utf8').split('\n')) { const [id, st] = z.split(' '); if (id) gemeldet[id] = Number(st) } } catch (_e) { /* leer */ } }
  const pruefe = () => {
    for (const s of stillstehende(dirs, grenze)) {
      const stufe = Math.floor(s.still / grenze)
      if (gemeldet[s.id] === stufe) continue
      gemeldet[s.id] = stufe
      if (merkDatei) fs.appendFileSync(merkDatei, s.id + ' ' + stufe + '\n')
      console.log('STILLSTAND ' + path.basename(s.dir) + ' ' + s.label + ' seit ' + Math.round(s.still) + ' min ohne Protokoll-Zeile')
      if (einmal) process.exit(0)
    }
  }
  pruefe()
  setInterval(pruefe, 5 * 60 * 1000)
}
