#!/bin/bash
# K59: der ruhende Leib vorher↔nachher in EINER Sitzung (Genesis Third): A = `_kreaturRuht` gestubbt (kein Leib ruht — der Stand
# vor dem Schnitt), B = das Gesetz; je Durchgang lauf 20 + profil 15, drei Durchgänge A B; danach die Zähl-Läufe mit Hüllen.
H=/c/Users/micha/Desktop/AnazhRealm-OMEN/p3/k59; WT=/c/Users/micha/Desktop/AnazhRealm-OMEN/takt-kreatur; D=$H/${1:-toggle}; mkdir -p $D
export WERKBANK_PORT=7902; W="node $WT/scripts/werkbank.cjs"
bash $H/sitzung.sh stop > /dev/null 2>&1
bash $H/sitzung.sh start ${2:-genesis} ${3:-third} > $D/start.txt 2>&1 < /dev/null
$W lauf 30 --ein 10 --regler voll --tiere frei > $D/warm.txt 2>&1
A() { $W eval "r._kreaturRuht = function () { return false; }; return 1" > /dev/null; }
B() { $W eval "delete r._kreaturRuht; return 1" > /dev/null; }
for R in 1 2 3; do
  A; $W lauf 20 --ein 3 --regler voll --tiere frei > $D/lauf-A$R.txt 2>&1; $W profil 15 --regler voll --tiere frei --top 120 > $D/profil-A$R.txt 2>&1
  B; $W lauf 20 --ein 3 --regler voll --tiere frei > $D/lauf-B$R.txt 2>&1; $W profil 15 --regler voll --tiere frei --top 120 > $D/profil-B$R.txt 2>&1
done
# die Zähl-Läufe (Hüllen verfälschen die Zeit — nur danach): Feld-Schreiber und ruhende Leiber je Frame
$W eval "const P = Object.getPrototypeOf(r); const z = (window.__k59z = { feld: 0, ruht: 0, takte: 0, gang: 0 }); r._weltFeldMatrix = function () { z.feld++; return P._weltFeldMatrix.apply(this, arguments); }; r._tickKreaturRuhe = function () { const e = P._tickKreaturRuhe.apply(this, arguments); z.takte++; for (const c of this.state.creatures) if (c.userData._ruht === true) z.ruht++; return e; }; const sc = r.state.scene; if (!sc.__k59) { sc.__k59 = sc.updateMatrixWorld; sc.updateMatrixWorld = function (f) { const t = performance.now(); const e = sc.__k59.call(this, f); z.gang += performance.now() - t; return e; }; } return 1;" > $D/zaehl-haken.txt 2>&1
for S in A B; do
  $S; $W eval "const z = window.__k59z; z.feld = z.ruht = z.takte = z.gang = 0; return 1" > /dev/null
  $W lauf 10 --ein 2 --regler voll --tiere frei > $D/zaehl-lauf-$S.txt 2>&1
  $W eval "const z = window.__k59z; return { takte: z.takte, feldJeTakt: +(z.feld / z.takte).toFixed(1), ruhendJeTakt: +(z.ruht / z.takte).toFixed(2), tiere: r.state.creatures.length, matrixGangMsJeTakt: +(z.gang / z.takte).toFixed(3) }" > $D/zaehl-$S.txt 2>&1
done
B
$W eval "const W = r.state.creatures, pm = r.state.playerMesh.position; return W.map((c) => ({ d: Math.round(Math.hypot(c.position.x - pm.x, c.position.z - pm.z)), ruht: c.userData._ruht === true, zustand: c.userData._motionZustand || null, v: c.userData._steuer ? +c.userData._steuer.v.toFixed(2) : null }))" > $D/tiere.txt 2>&1

# DIE WECK-PROBE (freie Tiere, Gesetz an): wie weit liegt das Feld eines ruhenden Leibs von ihm, vor und nach `_leiberWecken`
$W eval "const L = r.state.weltMarch.listeDaten; window.__k59ab = () => r.state.creatures.map((c) => { const gl = c.userData._kzGlieder; if (!gl || !gl.length) return null; let mx = 0, mz = 0; for (const g of gl) { const o = g.handle.feld * 32; mx += (L[o] + L[o + 4]) / 2; mz += (L[o + 2] + L[o + 6]) / 2; } return +Math.hypot(mx / gl.length - c.position.x, mz / gl.length - c.position.z).toFixed(2); }); window.__k59p0 = r.state.creatures.map((c) => [c.position.x, c.position.z]); return window.__k59ab();" > $D/weck-start.txt 2>&1
$W lauf 15 --ein 1 --regler voll --tiere frei > $D/weck-lauf.txt 2>&1
$W eval "const vor = window.__k59ab(); const weg = r.state.creatures.map((c, i) => +Math.hypot(c.position.x - window.__k59p0[i][0], c.position.z - window.__k59p0[i][1]).toFixed(2)); const ruhend = r.state.creatures.filter((c) => c.userData._ruht === true).length; const n = r._leiberWecken(); return { ruhend, geweckt: n, weg, feldAbstandVor: vor, feldAbstandNach: window.__k59ab() };" > $D/weck.txt 2>&1
echo "toggle ende"
