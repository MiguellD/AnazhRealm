// node gegen.js <x> <z> → Code: die Zeugen der Tat am Ort (x,z) in der Reihe von `_bewohnerZeuge`, je Zeuge `_bewohnerWeichOrt`
// der Basis (main) gegen M1 (derselbe Ort p statt {...p}: das Gemerkte des Anschlusses greift) und M2 (M1 + Vorprüfung der Knoten-Kette
// mit Rand) — dieselbe `belegt`-Folge, je Zeuge sein Weichen wie vorher (rein, die Welt bleibt)
const fs = require("fs");
const [x, z] = process.argv.slice(2);
const roh = fs.readFileSync(__dirname + "/weichort-main.txt", "utf8");
const body = roh.slice(roh.indexOf("{") + 1, roh.lastIndexOf("}"));
if (!body.includes("this._bewohnerStrecke(S, { ...p }, q, 0)")) throw new Error("Basis-Zeile nicht gefunden");
const m1 = body.replace("this._bewohnerStrecke(S, { ...p }, q, 0)", "this._bewohnerStrecke(S, p, q, 0)");
const m2 = m1.replace("fern(this._bewohnerStrecke(S, p, q, 0))", "vor(q) && fern(this._bewohnerStrecke(S, p, q, 0))").replace(
  "const [fort, gesehen] = [[], new Set()];",
  `const [fort, gesehen] = [[], new Set()];
        const BW = AnazhRealm.BEWOHNER, N = this._bewohnerNetz(S), a = this._bewohnerAnschluss(N, p);
        const lim = Math.max(0, Math.sqrt(d2) - MARGE) ** 2;
        const vor = (q) => {
            if (!lim || a < 0 || Math.hypot(q.x - p.x, q.z - p.z) < BW.direktM) return true;
            const e = this._bewohnerAnschluss(N, q);
            if (e < 0) return true;
            const k = globalThis.__tetrapodaCore.wegKette(this._bewohnerBaum(N, a), a, e);
            if (!k) return true;
            const v = [p, ...k.map((i) => N.knoten[i]), q];
            return v.every((w, i) => !i || this._streckeBoxAbstand2(T, v[i - 1].x, v[i - 1].z, w.x, w.z) >= lim);
        };`);
process.stdout.write(`
const AnazhRealm = r.constructor, st = r.state, MARGE = 14;
const fM1 = function (S, b, o, stunde, belegt) {${m1}};
const fM2 = function (S, b, o, stunde, belegt) {${m2}};
const o = { x: ${x} + 1.2, z: ${z} + 0.9 };
const stunde = ((((Number.isFinite(st.timeOfDay) ? st.timeOfDay : 0.5) % 1) + 1) % 1) * 24;
const R2 = AnazhRealm.BEWOHNER.zeugeM ** 2;
const P = Object.getPrototypeOf(r), strecke = P._bewohnerStrecke;
let nStr = 0; r._bewohnerStrecke = function (...a) { nStr++; return strecke.apply(this, a); };
const zahl = { zeugen: 0, weichen: 0, basis: { ms: 0, wege: 0, ort: 0 }, m1: { ms: 0, wege: 0, ort: 0, gleich: 0 }, m2: { ms: 0, wege: 0, ort: 0, gleich: 0 }, maxBasisMs: 0, maxM2Ms: 0 };
const gleich = (u, v) => (!u && !v) || (!!u && !!v && u.ort.x === v.ort.x && u.ort.z === v.ort.z);
try {
  for (const S of (r._bewohnerSiedlungen || new Map()).values()) {
    let belegt = null;
    for (const b of S.liste || []) {
      if (!(b.leib && !b.drinnen && (b.leib.position.x - o.x) ** 2 + (b.leib.position.z - o.z) ** 2 < R2)) continue;
      zahl.zeugen++;
      if (b.waffe) continue;
      belegt = belegt || new Set(S.liste.map((y) => y.ziel));
      if (b.amSteuer || b.ankunft || !b.ziel || !(r._kreaturFurchtErinnert(b.leib) > 0)) continue;
      zahl.weichen++;
      const w0 = b.weichen;
      const lauf = (f, k) => { b.weichen = null; nStr = 0; const t = performance.now(); const e = f.call(r, S, b, o, stunde, belegt); const d = performance.now() - t; zahl[k].ms += d; zahl[k].wege += nStr; if (e) zahl[k].ort++; return [e, d]; };
      const [B, dB] = lauf(r._bewohnerWeichOrt, "basis");
      const [E1] = lauf(fM1, "m1");
      const [E2, d2] = lauf(fM2, "m2");
      b.weichen = w0;
      zahl.maxBasisMs = Math.max(zahl.maxBasisMs, dB); zahl.maxM2Ms = Math.max(zahl.maxM2Ms, d2);
      if (gleich(B, E1)) zahl.m1.gleich++;
      if (gleich(B, E2)) zahl.m2.gleich++;
      if (B) belegt.add(B.ort);
    }
  }
} finally { delete r._bewohnerStrecke; }
for (const k of ["basis", "m1", "m2"]) zahl[k].ms = +zahl[k].ms.toFixed(1);
zahl.maxBasisMs = +zahl.maxBasisMs.toFixed(1); zahl.maxM2Ms = +zahl.maxM2Ms.toFixed(1);
return zahl;
`);
