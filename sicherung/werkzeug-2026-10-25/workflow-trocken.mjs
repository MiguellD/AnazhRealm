// Trockenlauf eines Workflow-Skripts: führt es mit Attrappen für agent/parallel/pipeline/workflow aus und zeigt, welche
// Agenten in welcher Reihenfolge starten. Szenario „reif" (jede Prüfung merge-reif: ja, jeder Kopf ein SHA) oder „rot"
// (jede Prüfung nein, Köpfe vorhanden). workflow() lädt das Kind-Skript mit derselben Attrappe (eine Ebene).
// Aufruf: node workflow-trocken.mjs <skript.js> [reif|rot] [args-JSON]
import fs from 'node:fs'

const [, , pfad, szenario = 'reif', argsJson] = process.argv
const SHA = 'a'.repeat(40)
let n = 0
const zeilen = []

const lade = (datei) => {
  const quelle = fs.readFileSync(datei, 'utf8').replace(/^export const meta\s*=/m, 'const meta =')
  return new Function('agent', 'parallel', 'pipeline', 'phase', 'log', 'workflow', 'args', 'budget',
    `return (async () => {\n${quelle}\n})()`)
}

const lauf = (datei, args, ebene) => {
  const ein = '  '.repeat(ebene)
  const agent = async (prompt, opts = {}) => {
    const nr = ++n
    zeilen.push(`${ein}#${nr} ${opts.label || '(ohne Label)'} [${opts.phase || '-'}]${opts.schema ? ' schema' : ''}${opts.agentType ? ' ' + opts.agentType : ''}`)
    if (/[`]\$\{|\$\{[^}]*$/.test(prompt)) zeilen.push(`${ein}   WARNUNG: unaufgelöster Template-Rest im Prompt`)
    if (/undefined|\[object Object\]/.test(prompt)) zeilen.push(`${ein}   WARNUNG: „undefined“ oder „[object Object]“ im Prompt`)
    await new Promise((r) => setTimeout(r, 1))
    if (opts.schema) {
      const o = {}
      for (const [k, v] of Object.entries(opts.schema.properties || {})) o[k] = v.type === 'array' ? [] : v.type === 'object' ? {} : k === 'kopf' || k === 'basis' ? SHA : 'x'
      return o
    }
    return szenario === 'reif' ? 'Befund … merge-reif: ja' : 'Befund … merge-reif: nein — rot'
  }
  const parallel = async (thunks) => Promise.all(thunks.map((t) => Promise.resolve().then(t).catch((e) => { zeilen.push(`${ein}   WURF in parallel: ${e.message}`); return null })))
  const pipeline = async (items, ...stufen) => Promise.all(items.map(async (it, i) => {
    let v = it
    try { for (const s of stufen) v = await s(v, it, i) } catch (e) { zeilen.push(`${ein}   WURF in pipeline: ${e.message}`); return null }
    return v
  }))
  const phase = (t) => zeilen.push(`${ein}== Phase ${t}`)
  const log = (t) => zeilen.push(`${ein}log: ${t}`)
  const workflow = async (ref, kindArgs) => {
    if (ebene > 0) throw new Error('workflow() in einem Kind — nur eine Ebene erlaubt')
    zeilen.push(`${ein}▸ Kind ${ref.scriptPath || ref} args=${JSON.stringify(kindArgs)}`)
    return lauf(ref.scriptPath.replace(/\\/g, '/').replace(/^C:/, 'C:'), kindArgs, ebene + 1)
  }
  const budget = { total: null, spent: () => 0, remaining: () => Infinity }
  return lade(datei)(agent, parallel, pipeline, phase, log, workflow, args, budget)
}

try {
  const erg = await lauf(pfad, argsJson ? JSON.parse(argsJson) : undefined, 0)
  console.log(zeilen.join('\n'))
  console.log(`\nAGENTEN ${n} · Szenario ${szenario} · Rückgabe-Schlüssel ${erg && typeof erg === 'object' ? Object.keys(erg).join(', ') : typeof erg}`)
} catch (e) {
  console.log(zeilen.join('\n'))
  console.log('\nTROCKENLAUF GEBROCHEN: ' + e.stack)
  process.exit(1)
}
