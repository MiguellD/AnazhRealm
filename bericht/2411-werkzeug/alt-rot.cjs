// alt-rot.cjs — die Tafel der Nachwache-Schuld (Konto 19, 24.11.): Sprossen, deren jüngstes ROT eines Geräts am VORFAHREN des GRÜN des
// anderen steht. GESCHICHTE = die Buchung lässt das ROT fallen (buche-2.cjs „das ROT fällt mit dem Code, der es heilte“: das grüne Gerät
// stand an oder nach dem ROT-Kopf selbst ROT); HÄLT = nur eine Messung des roten Geräts am main löst die Sprosse (Nachwache-Schuld).
// Aufruf: node alt-rot.cjs <richter-verzeichnis> <meisterkarte-2.json> [<repo>]   (Akten z. B. per git archive origin/punkte-maschine vision/richter | tar -x -C <dir>)
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process')
const REPO = process.argv[4] || 'C:/Users/micha/AnazhRealm-profiband'
const AKT = process.argv[2]
const karte = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'))
if (!AKT || !fs.existsSync(AKT)) { console.error('Aufruf: node alt-rot.cjs <richter-verzeichnis> <meisterkarte-2.json> [<repo>]'); process.exit(2) }
const L = new Map(); for (const g of karte.gruppen) for (const c of g.kriterien) L.set(c.id, c)
const ahnC = new Map()
const voll = (s) => spawnSync('git', ['-C', REPO, 'rev-parse', '--verify', '-q', s + '^{commit}'], { encoding: 'utf8' }).stdout.trim()
const vC = new Map(); const V = (s) => (vC.has(s) || vC.set(s, voll(s)), vC.get(s))
const istAhn = (a, b) => { a = V(a); b = V(b); if (!a || !b) return null; const k = a + b; if (!ahnC.has(k)) ahnC.set(k, spawnSync('git', ['-C', REPO, 'merge-base', '--is-ancestor', a, b]).status === 0); return ahnC.get(k) }
const je = new Map()
for (const f of fs.readdirSync(AKT)) {
  if (!f.endsWith('.json')) continue
  let j; try { j = JSON.parse(fs.readFileSync(path.join(AKT, f), 'utf8')) } catch { continue }
  for (const fa of Array.isArray(j) ? j : [j]) for (const g of fa.geraete || []) {
    const k = fa.leiter + '#' + fa.sprosse
    if (!je.has(k)) je.set(k, new Map())
    const m = je.get(k); if (!m.has(g.geraet)) m.set(g.geraet, [])
    m.get(g.geraet).push({ sha: fa.sha, datum: fa.datum, r: g.richter && g.richter.urteil, p: String((g.preis && g.preis.urteil) || 'FEHLT') })
  }
}
let faelle = 0, geschichte = 0, front = 0, frontGeschichte = 0
const zeilen = []
for (const [k, m] of [...je].sort()) {
  const [id, nr] = k.split('#'); const c = L.get(id); if (!c) continue
  const heute = c.heute || 0
  const gs = [...m.keys()]; if (gs.length < 2) continue
  for (const l of m.values()) l.sort((a, b) => String(a.datum).localeCompare(String(b.datum)))
  for (const B of gs) for (const A of gs) {
    if (A === B) continue
    const lb = m.get(B), la = m.get(A)
    const jb = lb[lb.length - 1], ja = la[la.length - 1]
    if (jb.r !== 'ROT' || ja.r !== 'GRÜN') continue
    if (istAhn(jb.sha, ja.sha) !== true || V(jb.sha) === V(ja.sha)) continue // GRÜN muss am echten Nachfahren stehen
    faelle++
    // A war ROT an W mit X ⊆ W, W echter Vorfahr von G
    const w = la.find((x) => x.r === 'ROT' && istAhn(jb.sha, x.sha) === true && istAhn(x.sha, ja.sha) === true && V(x.sha) !== V(ja.sha))
    const istFront = Number(nr) === heute + 1
    if (istFront) front++
    if (w) { geschichte++; if (istFront) frontGeschichte++ }
    zeilen.push(`${istFront ? 'FRONT' : Number(nr) <= heute ? 'gebucht' : 'hinten'} ${k}: ${B} ROT ${jb.sha.slice(0, 8)} · ${A} GRÜN ${ja.sha.slice(0, 8)} Preis ${ja.p.slice(0, 26)} · ${w ? `GESCHICHTE (${A} selbst ROT am ${w.sha.slice(0, 8)})` : `HÄLT (${A} nie ROT an/nach ${jb.sha.slice(0, 8)}: ${la.map((x) => x.sha.slice(0, 6) + (x.r === 'GRÜN' ? '+' : '-')).slice(-5).join(' ')})`}`)
  }
}
zeilen.sort().forEach((z) => console.log(z))
console.log(`Fälle (jüngstes ROT eines Geräts am Vorfahren des GRÜN des anderen): ${faelle} · davon Geschichte nach der Regel: ${geschichte} · an der Front: ${front}, davon Geschichte: ${frontGeschichte}`)
