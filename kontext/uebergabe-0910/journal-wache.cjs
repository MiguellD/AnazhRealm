// Meldet jedes NEUE Agenten-Ergebnis eines Workflow-Journals als eine Zeile (Label + Urteil), damit der
// Koordinator je Strang handeln kann statt auf die parallel()-Schranke zu warten.
// Aufruf: node journal-wache.cjs <journal.jsonl> [--alle]
const fs = require('fs')
const pfad = process.argv[2]
const alle = process.argv.includes('--alle')
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
  if (gesehen < 0 && !alle) { gesehen = res.length; return }
  if (gesehen < 0) gesehen = 0
  for (const j of res.slice(gesehen)) {
    if (j.ende) { console.log('WORKFLOW ' + j.ende); continue }
    const t = typeof j.result === 'string' ? j.result : JSON.stringify(j.result || '')
    const urteil = (t.match(/merge-reif:\s*(ja|nein[^\n"]{0,160})/i) || t.match(/"gesund":\s*(true|false)/) || [])[0] || ''
    console.log('ERGEBNIS ' + (labels[j.agentId] || j.agentId) + ' | ' + urteil + ' | ' + t.replace(/\s+/g, ' ').slice(0, 220))
  }
  gesehen = res.length
}
lies()
setInterval(lies, 5000)
