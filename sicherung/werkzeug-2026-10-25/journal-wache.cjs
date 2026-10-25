// Meldet jedes NEUE Agenten-Ergebnis eines Workflow-Journals als eine Zeile (Label + Urteil), damit der
// Koordinator je Strang handeln kann statt auf die parallel()-Schranke zu warten.
// Aufruf: node journal-wache.cjs <journal.jsonl> [--alle] [--merke <datei>] [--einmal] [--nur <regex>]
// --nur: nur passende Zeilen melden (die übrigen gelten als gesehen) — etwa nur Prüf-Urteile und Workflow-Enden.
// --einmal: endet nach der ersten gemeldeten Zeile (für eine Hintergrund-Wache ohne 30-min-Ablauf: ereignis-warte.sh).
// --merke: die Wache merkt sich je gemeldetem Ergebnis die Agenten-Zeile in <datei>; eine neu gestellte Wache (der Monitor läuft
// nach 30 min ab) meldet dann genau das, was zwischen Ablauf und Neustart eintraf — statt es als „schon gesehen“ zu verschlucken.
const fs = require('fs')
const pfad = process.argv[2]
const alle = process.argv.includes('--alle')
const mi = process.argv.indexOf('--merke')
const merkDatei = mi > 0 ? process.argv[mi + 1] : null
const einmal = process.argv.includes('--einmal')
const ni = process.argv.indexOf('--nur')
const nur = ni > 0 ? new RegExp(process.argv[ni + 1]) : null
let gemeldetJetzt = false
const gemeldet = new Set()
if (merkDatei) { try { for (const z of fs.readFileSync(merkDatei, 'utf8').split('\n')) if (z) gemeldet.add(z) } catch (_e) { /* erste Wache: leer */ } }
const melde = (z) => { if (nur && !nur.test(z)) return; console.log(z); gemeldetJetzt = true }
const labels = {}
let gesehen = -1
const lies = () => {
  let ls
  try { ls = fs.readFileSync(pfad, 'utf8').split('\n').filter(Boolean) } catch (_e) { return }
  const res = []
  for (const l of ls) {
    let j
    try { j = JSON.parse(l) } catch (_e) { continue }
    if (j.label) labels[j.agentId] = j.label
    if (j.type === 'result') res.push(j)
    if (j.type === 'completed' || j.type === 'failed' || j.type === 'error') res.push({ ende: j.type })
  }
  if (merkDatei) {
    for (const j of res) {
      const k = j.ende ? 'ENDE ' + j.ende : 'ERG ' + j.agentId
      if (gemeldet.has(k)) continue
      gemeldet.add(k)
      fs.appendFileSync(merkDatei, k + '\n')
      if (j.ende) { melde('WORKFLOW ' + j.ende); continue }
      const t = typeof j.result === 'string' ? j.result : JSON.stringify(j.result || '')
      const urteil = (t.match(/merge-reif:\s*(ja|nein[^\n"]{0,160})/i) || t.match(/"gesund":\s*(true|false)/) || [])[0] || ''
      melde('ERGEBNIS ' + (labels[j.agentId] || j.agentId) + ' | ' + urteil + ' | ' + t.replace(/\s+/g, ' ').slice(0, 220))
    }
    return
  }
  if (gesehen < 0 && !alle) { gesehen = res.length; return }
  if (gesehen < 0) gesehen = 0
  for (const j of res.slice(gesehen)) {
    if (j.ende) { melde('WORKFLOW ' + j.ende); continue }
    const t = typeof j.result === 'string' ? j.result : JSON.stringify(j.result || '')
    const urteil = (t.match(/merge-reif:\s*(ja|nein[^\n"]{0,160})/i) || t.match(/"gesund":\s*(true|false)/) || [])[0] || ''
    melde('ERGEBNIS ' + (labels[j.agentId] || j.agentId) + ' | ' + urteil + ' | ' + t.replace(/\s+/g, ' ').slice(0, 220))
  }
  gesehen = res.length
}
const takt = () => { lies(); if (einmal && gemeldetJetzt) process.exit(0) }
takt()
setInterval(takt, 5000)
