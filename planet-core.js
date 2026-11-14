/*
 * planet-core.js — der Planet als FUNKTION f(samen, breite, laenge, zeit).
 *
 * Kern im Aufbau (Entscheid vision/planet/ENTSCHEID.md, Schritte bau1–bau3): Kugel, Schollen, Schlüsselbilder, Platten, Ränder,
 * Relief, Vulkanismus, Meeresspiegel, Karte. NICHT in cores.manifest.json, kein Leser im Spiel (Konsum-Tiefe 0 %).
 *
 * Stufen (nur die unterste läuft je Punkt):
 *   planetPlan(samen)          eifrig, ms, KB   Körper, Schollen, Schlüsselbilder (verstreut · versammelt · gelöst), Gruppen,
 *                                               Ozean-Platten, Nähte, Hotspots, Trapp-Ereignisse — die ganze Zeitachse.
 *   abschnitt(plan, b)         faul, Memo       Euler-Pol je Platte, Paar-Tafel (Öffnungs-Zeit), Rand-Gedächtnis bis hierher.
 *   planetScheibe(plan, t)     je Zeit          Lagen, Stätten, ω, Nachbarn, Hotspot-Ketten, Meer(t).
 *   planetPunktR(scheibe, …)   µs               Kruste → Platte → Rand → Relief → Vulkan.
 *
 * Regeln K1–K10 des Entscheids, so umgesetzt:
 *   K1 Kruste zuerst: liegt ein Punkt auf Kruste (Feld über Q − 0,06), ist seine Platte die seiner Gruppe; die Wertung der
 *      übrigen Kugel liest die Kruste (Abstand zur Kruste der Gruppe), nie umgekehrt.
 *   K2 Eine Gruppe = eine Platte je Abschnitt; Neuschnitt nur am Schlüsselbild „gelöst“.
 *   K3 Der aktive Rand liegt vorn: die Reichweite einer Kontinent-Platte ist in Fahrtrichtung die Schürze (150–450 km),
 *      nach hinten weit (gerichtete Potenz-Wertung über dem Krusten-Abstand statt einer versetzten Punkt-Stätte).
 *   K4 Nähte und erloschene aktive Ränder stehen im Rahmen ihrer Scholle, Höhe H0·(1 − e^(−a/20))·e^(−a/120).
 *   K5 Tempo-Kurve e(u) = 0,4·u + 0,6·glatt(u): am Schlüsselbild ≥ 40 % des Abschnitt-Mittels.
 *   K6 Ozean-Alter aus der Öffnung (T_offen) bzw. Rücken-Abstand / halbe Rate, weich gedeckelt; Tiefe nach GDH1.
 *   K7 Meer löst das Wasser-Volumen; Kontinent-Niveau = Bezugs-Spiegel des Zyklus + Freibord.
 *   K8 Nur Wellenlängen ≥ 32 km; fussKm schneidet Oktaven unter 2·fuss weich ab.
 *   K9 Nur + − × ÷, Math.sqrt/floor/abs/min/max/imul; Winkel-Funktionen und Exponent aus planetMathe; Zufall zählerbasiert.
 *   K10 Kein Rückfall: Regime ≠ "platten", t außerhalb der Schlüsselbilder, fehlende Felder brechen beim Namen.
 *
 * Koordinaten: Einheitsvektor (x, y, z), y = Drehachse (Nord); x = cos φ·cos λ, y = sin φ, z = cos φ·sin λ.
 * Längen km, Höhen km (wahr), Zeit Ma (0 = Gegenwart der Saat, negativ = Vergangenheit), ω in rad/Ma.
 *
 * bau3 — DIE ZEIT t: jede Abfrage nimmt die Scheibe einer Zeit in [−4 000; +1 000] Ma. Stetig über Schlüsselbilder (K5) durch den
 * Nachklang (NACHKLANG_MA, im Rahmen der Platte), Hotspot-Kegel auf dem absoluten 3,5-Ma-Takt, Kegel-Tore und Trapp-Aufbau glatt,
 * Versatz-Treppe geglättet, Nachbar-Liste über die Schablonen-Reichweite hinaus (NACHBAR_KM). Meer(t) = Volumen über der Hülle der
 * Zeit minus das Gleichgewichts-Eis (Land polwärts der Eis-Linie, EIS_DICKE_KM); Klima(t) mit Sternfluss nach Gough und dem
 * Walker-Thermostat (KLIMA.walker).
 *
 * §6 DIE BRÜCKE — beschrieben und als Funktion geliefert, NICHT verdrahtet (gelaende-core, phyto-core, stamm/ bleiben unberührt):
 *   planetAnker(plan, t, ortGesetz)   der Ort, an dem die heutigen Konstanten des Ort-Gesetzes wahr sind (TEMPERATUR 18 / −4 °C am
 *                                     Meer), auf Land, Küste ≤ 300 km, kein konvergenter Rand < 500 km.
 *   planetFlaeche / planetKarteVon    Spiel-(x, z) = Karten-Meter (ξ, η) der Würfel-Fläche, in deren Mitte der Anker liegt
 *                                     (x Ost, z Süd); winkeltreue Würfel-Abbildung, Krümmung nur im Vertex-Schritt des Zeichners.
 *   planetOrt(scheibe, φ, λ, ortGesetz) → { anker, wildnis (LANDFORM_REGLER, geklemmt), meer.waterLevelM, klima (TEMPERATUR-Felder
 *                                     + spendeMm), wetter (Rahmen für wetterAt), biom, leit (9×9 Stützen über 64 km), vulkan, rand,
 *                                     stauchung s_v }.
 *   ortGesetz baut der AUFRUFER aus den Exporten von gelaende-core: kuehlungKJeM = TEMPERATUR.sommer / Mitte(SCHNEE.start,
 *   SCHNEE.voll) (heute 18 / 162,5 = 0,1108 K/m), meerUnterBasisM = LAGE_GRUND.meerUnterBasis (3), regler = LANDFORM_REGLER,
 *   klimaHeute = TEMPERATUR + spendeMm (PEGEL.spende · 1000 · 365,25). s_v = 0,0065 / kuehlungKJeM wird daraus GELESEN, nie kopiert.
 * Die Verdrahtung danach (kein Teil dieses Laufs), in dieser Reihenfolge:
 *   1. Pflichtfelder ohne Rückfall: L.klima und L.waterLevel werden Pflicht der Lage; die sechs Stellen in gelaende-core mit
 *      `Number.isFinite(L.waterLevel) ? … : (L.baseHeight || 0) − GRUND.meerUnterBasis` (schnee, temperaturFeld und vier weitere,
 *      heute Zeilen 1279 · 1309 · 1377 · 1474 · 1519 · 1745) brechen beim Namen statt zurückzufallen; Beweis byte-Diff 0.
 *   2. Der Kragen: in grossform, temperaturFeld, SCHNEE, wetterAt steht der Planet hinter `if (k !== 0)`,
 *      k(d) = d ≤ R₀ ? 0 : glatt(R₀, R₁, d); R₀ = ∞ heißt heute (byte-gleich ohne Flag), R₀ = 16 km lässt Genesis und ihre Sicht.
 *      Leitgrößen als Differenz zum Anker: off += s_v·ΔHöhe − ō(land), c += ΔLand, rel *= ρ (leit.huelleM, leit.landC).
 *   3. Die Karte: Bandteilung Planet ≥ 32 km (fuss 16), gelaende-core < 24 km; drei Abtast-Bereiche: ≥ 8 km nur der Planet,
 *      400 m – 8 km mit grossform, darunter das volle hoehe; der Netz-Speicher braucht Verdrängung je Kachel.
 */
(function (root) {
  'use strict';

  const VERSION = 'planet-bau3-1';

  // ── planetMathe (K9) ───────────────────────────────────────────────────────────────────────────────────
  const PI = 3.141592653589793, HALBPI = 1.5707963267948966, TAU = 6.283185307179586;
  const PIO2_1 = 1.57079632673412561417e+00, PIO2_1T = 6.07710050650619224932e-11, INV_PIO2 = 6.36619772367581382433e-01;
  const LN2_HI = 6.93147180369123816490e-01, LN2_LO = 1.90821492927058770002e-10, INV_LN2 = 1.44269504088896338700e+00;

  function sinKern(r) {
    const r2 = r * r;
    return r * (1 + r2 * (-1 / 6 + r2 * (1 / 120 + r2 * (-1 / 5040 + r2 * (1 / 362880 + r2 * (-1 / 39916800
      + r2 * (1 / 6227020800 + r2 * (-1 / 1307674368000 + r2 * (1 / 355687428096000)))))))));
  }
  function cosKern(r) {
    const r2 = r * r;
    return 1 + r2 * (-0.5 + r2 * (1 / 24 + r2 * (-1 / 720 + r2 * (1 / 40320 + r2 * (-1 / 3628800 + r2 * (1 / 479001600
      + r2 * (-1 / 87178291200 + r2 * (1 / 20922789888000 + r2 * (-1 / 6402373705728000)))))))));
  }
  function ksin(x) {
    const n = Math.floor(x * INV_PIO2 + 0.5);
    const r = (x - n * PIO2_1) - n * PIO2_1T;
    switch (n & 3) { case 0: return sinKern(r); case 1: return cosKern(r); case 2: return -sinKern(r); default: return -cosKern(r); }
  }
  function kcos(x) {
    const n = Math.floor(x * INV_PIO2 + 0.5);
    const r = (x - n * PIO2_1) - n * PIO2_1T;
    switch (n & 3) { case 0: return cosKern(r); case 1: return -sinKern(r); case 2: return -cosKern(r); default: return sinKern(r); }
  }
  const KEHR = new Float64Array(32); for (let i = 1; i < 32; i++) KEHR[i] = 1 / i;
  function pow2(k) { let p = 1, b = k < 0 ? 0.5 : 2, n = k < 0 ? -k : k; while (n) { if (n & 1) p *= b; b *= b; n >>= 1; } return p; }
  function kexp(x) {
    if (x !== x) return x;
    if (x > 709.78) return Infinity;
    if (x < -745.13) return 0;
    const k = Math.floor(x * INV_LN2 + 0.5);
    const r = (x - k * LN2_HI) - k * LN2_LO;
    let s = 1;
    for (let i = 15; i >= 1; i--) s = 1 + s * r * KEHR[i];
    if (k < -1020) return s * pow2(k + 60) * pow2(-60);
    return s * pow2(k);
  }
  function katanKern(a) { const a2 = a * a; let s = 0; for (let k = 13; k >= 0; k--) s = ((k & 1) ? -1 : 1) / (2 * k + 1) + a2 * s; return a * s; }
  function katan(x) {
    if (x !== x) return x;
    const neg = x < 0; let a = neg ? -x : x;
    const inv = a > 1; if (inv) a = 1 / a;
    a = a / (1 + Math.sqrt(1 + a * a));
    a = a / (1 + Math.sqrt(1 + a * a));
    let r = 4 * katanKern(a);
    if (inv) r = HALBPI - r;
    return neg ? -r : r;
  }
  function katan2(y, x) {
    if (x > 0) return katan(y / x);
    if (x < 0) return y >= 0 ? katan(y / x) + PI : katan(y / x) - PI;
    return y > 0 ? HALBPI : (y < 0 ? -HALBPI : 0);
  }
  function kacos(x) { if (x >= 1) return 0; if (x <= -1) return PI; return katan2(Math.sqrt((1 - x) * (1 + x)), x); }

  const planetMathe = Object.freeze({ ksin, kcos, katan, katan2, kacos, kexp });

  // schnelle, deterministische Geometrie für den Punkt-Pfad (Polynom + sqrt; Fehler ≤ 2·10⁻⁸ rad bzw. 1·10⁻⁵ rad)
  function acosF(x) {
    const neg = x < 0; if (neg) x = -x; if (x > 1) x = 1;
    const r = Math.sqrt(1 - x) * (1.5707963050 + x * (-0.2145988016 + x * (0.0889789874 + x * (-0.0501743046
      + x * (0.0308918810 + x * (-0.0170881256 + x * (0.0066700901 + x * -0.0012624911)))))));
    return neg ? PI - r : r;
  }
  function atanF(z) { const z2 = z * z; return z * (0.99997726 + z2 * (-0.33262347 + z2 * (0.19354346 + z2 * (-0.11643287 + z2 * (0.05265332 + z2 * -0.01172120))))); }
  function atan2F(y, x) {
    const ax = Math.abs(x), ay = Math.abs(y);
    if (ax === 0 && ay === 0) return 0;
    let r = ax >= ay ? atanF(ay / ax) : HALBPI - atanF(ax / ay);
    if (x < 0) r = PI - r;
    return y < 0 ? -r : r;
  }
  function glatt(a, b, x) { let t = (x - a) / (b - a); t = t < 0 ? 0 : (t > 1 ? 1 : t); return t * t * (3 - 2 * t); }
  function gauss(d, s) { const u = d / s; return u * u > 40 ? 0 : kexpS(-0.5 * u * u); }
  // kurzer Exponent für Höhen (x ≤ 0): 9 Glieder nach Bereichs-Reduktion, 2^k aus Tafel; Fehler ≤ 1·10⁻⁹ relativ
  const P2N = new Float64Array(80); P2N[0] = 1; for (let i = 1; i < 80; i++) P2N[i] = P2N[i - 1] * 0.5;
  function kexpS(x) {
    if (x < -50) return 0;
    if (x > 0) return kexp(x);
    const k = Math.floor(x * INV_LN2 + 0.5), r = (x - k * LN2_HI) - k * LN2_LO;
    const s = 1 + r * (1 + r * (KEHR[2] + r * (KEHR[6] + r * (KEHR[24] * 1 + r * (1 / 120 + r * (1 / 720 + r * (1 / 5040 + r * (1 / 40320 + r / 362880))))))));
    return k > 0 ? s * 2 : s * P2N[-k];
  }

  // ── Zufall (zählerbasiert) ──────────────────────────────────────────────────────────────────────────────
  function mix32(h) {
    h ^= h >>> 16; h = Math.imul(h, 0x7feb352d); h ^= h >>> 15; h = Math.imul(h, 0x846ca68b); h ^= h >>> 16;
    return h >>> 0;
  }
  function planetHash(samen) {
    if (typeof samen !== 'string') throw new Error('planetHash: samen muss ein String sein');
    let h = 0x811c9dc5;
    for (let i = 0; i < samen.length; i++) { h ^= samen.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return mix32(h);
  }
  function planetZufall(k, a, b, c) {
    let h = mix32((k ^ Math.imul((a | 0) + 0x27d4eb2f, 0x9e3779b1)) >>> 0);
    h = mix32((h ^ Math.imul((b | 0) + 0x632be5ab, 0x85ebca77)) >>> 0);
    h = mix32((h ^ Math.imul((c | 0) + 0x2545f491, 0xc2b2ae3d)) >>> 0);
    return h / 4294967296;
  }

  // ── Gradienten-Rauschen 3D (quintisch, 16 Gradienten), mittelwertfrei ───────────────────────────────────
  function gr(h, x, y, z) {
    switch (h & 15) {
      case 0: return x + y; case 1: return -x + y; case 2: return x - y; case 3: return -x - y;
      case 4: return x + z; case 5: return -x + z; case 6: return x - z; case 7: return -x - z;
      case 8: return y + z; case 9: return -y + z; case 10: return y - z; case 11: return -y - z;
      case 12: return x + y; case 13: return -y + z; case 14: return -x + y; default: return -y - z;
    }
  }
  function hz(seed, ix, iy, iz) {
    let h = (Math.imul(ix, 0x8da6b343) ^ Math.imul(iy, 0xd8163841) ^ Math.imul(iz, 0xcb1ab31f) ^ seed) | 0;
    h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
    return h;
  }
  function rausch(seed, x, y, z) {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    const fx = x - ix, fy = y - iy, fz = z - iz;
    const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10), v = fy * fy * fy * (fy * (fy * 6 - 15) + 10), w = fz * fz * fz * (fz * (fz * 6 - 15) + 10);
    const a0 = gr(hz(seed, ix, iy, iz), fx, fy, fz), a1 = gr(hz(seed, ix + 1, iy, iz), fx - 1, fy, fz);
    const b0 = gr(hz(seed, ix, iy + 1, iz), fx, fy - 1, fz), b1 = gr(hz(seed, ix + 1, iy + 1, iz), fx - 1, fy - 1, fz);
    const c0 = gr(hz(seed, ix, iy, iz + 1), fx, fy, fz - 1), c1 = gr(hz(seed, ix + 1, iy, iz + 1), fx - 1, fy, fz - 1);
    const d0 = gr(hz(seed, ix, iy + 1, iz + 1), fx, fy - 1, fz - 1), d1 = gr(hz(seed, ix + 1, iy + 1, iz + 1), fx - 1, fy - 1, fz - 1);
    const ab = (a0 + u * (a1 - a0)) + v * ((b0 + u * (b1 - b0)) - (a0 + u * (a1 - a0)));
    const cd = (c0 + u * (c1 - c0)) + v * ((d0 + u * (d1 - d0)) - (c0 + u * (c1 - c0)));
    return (ab + w * (cd - ab)) * 0.7;
  }
  // fBm in Kilometern auf der Kugel: Oktaven von lamMax bis zur Schnitt-Wellenlänge lamCut (weich), Faktor 2,03 je Oktave.
  function fbmKm(seed, x, y, z, R, lamMax, lamCut, gain) {
    let lam = lamMax, amp = 1, s = 0, norm = 0, o = 0;
    while (lam >= 0.5 * lamCut && o < 12) {
      const w = lam >= lamCut ? 1 : (lam - 0.5 * lamCut) / (0.5 * lamCut);
      const f = R / lam;
      s += amp * w * rausch((seed + Math.imul(o, 1013)) | 0, x * f + o * 17.31, y * f - o * 7.17, z * f + o * 3.71);
      norm += amp;
      amp *= gain; lam /= 2.03; o++;
    }
    return norm > 0 ? s / norm * 1.6 : 0;
  }
  function gratKm(seed, x, y, z, R, lam) { // Grat-Rauschen (1 − |n|)², zwei Oktaven
    let f = R / lam, n = rausch(seed, x * f, y * f, z * f), g = 1 - Math.abs(n * 1.4); g = g < 0 ? 0 : g;
    f *= 2.03; let n2 = rausch(seed + 77, x * f, y * f, z * f), g2 = 1 - Math.abs(n2 * 1.4); g2 = g2 < 0 ? 0 : g2;
    return (g * g * 0.67 + g2 * g2 * 0.33);
  }

  // ── Quaternionen (x, y, z, w) ──────────────────────────────────────────────────────────────────────────
  function qAchse(ax, ay, az, winkel, out, o) {
    const s = ksin(winkel * 0.5);
    out[o] = ax * s; out[o + 1] = ay * s; out[o + 2] = az * s; out[o + 3] = kcos(winkel * 0.5);
  }
  function qMul(a, ao, b, bo, out, oo) {
    const ax = a[ao], ay = a[ao + 1], az = a[ao + 2], aw = a[ao + 3], bx = b[bo], by = b[bo + 1], bz = b[bo + 2], bw = b[bo + 3];
    out[oo] = aw * bx + ax * bw + ay * bz - az * by;
    out[oo + 1] = aw * by - ax * bz + ay * bw + az * bx;
    out[oo + 2] = aw * bz + ax * by - ay * bx + az * bw;
    out[oo + 3] = aw * bw - ax * bx - ay * by - az * bz;
  }
  function qNorm(q, o) { const l = Math.sqrt(q[o] * q[o] + q[o + 1] * q[o + 1] + q[o + 2] * q[o + 2] + q[o + 3] * q[o + 3]); q[o] /= l; q[o + 1] /= l; q[o + 2] /= l; q[o + 3] /= l; }
  function qMatrix(q, o, m, mo) {
    const x = q[o], y = q[o + 1], z = q[o + 2], w = q[o + 3];
    m[mo] = 1 - 2 * (y * y + z * z); m[mo + 1] = 2 * (x * y - z * w); m[mo + 2] = 2 * (x * z + y * w);
    m[mo + 3] = 2 * (x * y + z * w); m[mo + 4] = 1 - 2 * (x * x + z * z); m[mo + 5] = 2 * (y * z - x * w);
    m[mo + 6] = 2 * (x * z - y * w); m[mo + 7] = 2 * (y * z + x * w); m[mo + 8] = 1 - 2 * (x * x + y * y);
  }
  const _m = new Float64Array(9);
  function qDreh(q, o, vx, vy, vz, out, oo) {
    qMatrix(q, o, _m, 0);
    out[oo] = _m[0] * vx + _m[1] * vy + _m[2] * vz; out[oo + 1] = _m[3] * vx + _m[4] * vy + _m[5] * vz; out[oo + 2] = _m[6] * vx + _m[7] * vy + _m[8] * vz;
  }
  // kleinste Drehung a → b (EIN Euler-Pol a × b)
  function minimalDreh(ax, ay, az, bx, by, bz, out, o) {
    let cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx;
    const s = Math.sqrt(cx * cx + cy * cy + cz * cz), d = ax * bx + ay * by + az * bz;
    if (s < 1e-12) {
      if (d > 0) { out[o] = 0; out[o + 1] = 0; out[o + 2] = 0; out[o + 3] = 1; return 0; }
      cx = Math.abs(ax) < 0.9 ? 0 : -az; cy = Math.abs(ax) < 0.9 ? -az : 0; cz = Math.abs(ax) < 0.9 ? ay : ax;
      const l = Math.sqrt(cx * cx + cy * cy + cz * cz); qAchse(cx / l, cy / l, cz / l, PI, out, o); return PI;
    }
    const w = katan2(s, d); qAchse(cx / s, cy / s, cz / s, w, out, o); return w;
  }
  function tangente(px, py, pz, out) { // fester Tangenten-Rahmen e1, e2 bei p
    let ax = 0, ay = 1, az = 0; if (Math.abs(py) > 0.9) { ax = 1; ay = 0; }
    let e1x = ay * pz - az * py, e1y = az * px - ax * pz, e1z = ax * py - ay * px; const l = Math.sqrt(e1x * e1x + e1y * e1y + e1z * e1z);
    e1x /= l; e1y /= l; e1z /= l;
    out[0] = e1x; out[1] = e1y; out[2] = e1z;
    out[3] = py * e1z - pz * e1y; out[4] = pz * e1x - px * e1z; out[5] = px * e1y - py * e1x;
  }
  function zufallEinheit(k, a, b, out, o) {
    const y = 2 * planetZufall(k, a, b, 1) - 1, ph = TAU * planetZufall(k, a, b, 2), r = Math.sqrt(1 - y * y);
    out[o] = r * kcos(ph); out[o + 1] = y; out[o + 2] = r * ksin(ph);
  }
  function fib(N) { // flächentreue Fibonacci-Proben, Memo je N (ändert nie ein Ergebnis)
    if (FIB[N]) return FIB[N];
    const a = new Float64Array(N * 3), ga = PI * (3 - Math.sqrt(5));
    for (let i = 0; i < N; i++) { const y = 1 - (2 * i + 1) / N, r = Math.sqrt(1 - y * y), ph = i * ga; a[3 * i] = r * kcos(ph); a[3 * i + 1] = y; a[3 * i + 2] = r * ksin(ph); }
    FIB[N] = a; return a;
  }
  const FIB = Object.create(null);

  // ── Tafeln ───────────────────────────────────────────────────────────────────────────────────────────────
  const PLANET_ERDE = Object.freeze({ radiusKm: 6371, g: 9.81, wasserKm: 2.62, krustenAnteil: 0.41, neigungRad: 0.4091,
    tagStunden: 24, jahrTage: 365.25, drehsinn: 1, sternFluss: 1, alterMa: 4570 });
  const RAND_ART = Object.freeze({ innen: 0, divergent: 1, transform: 2, konvergent: 3 });
  const KRUSTE = Object.freeze({ ozean: 0, hang: 1, schelf: 2, kontinent: 3 });
  const VULKAN_ART = Object.freeze({ keiner: 0, bogen: 1, hotspot: 2, ruecken: 3, trapp: 4 });
  const SCHICHT = Object.freeze({ relief: 0, platten: 1, alter: 2, biom: 3, temperatur: 4, niederschlag: 5, koeppen: 6 });
  const BILD_ART = Object.freeze({ verstreut: 0, versammelt: 1, geloest: 2 });

  const T_START = -4000, T_ENDE = 1000, TAU_W = 20, TAU_A = 120;
  const RAMPE0 = 0.04, RAMPE1 = 0.25;   // innen-Rampe im Krustenfeld (Schelf → Inneres)
  const BEZUG_MA = 100;                   // Erosionsbasis: Bezugs-Spiegel = Mittel des Selbst-Spiegels über 100 Ma (K7)
  const EIS_DICKE_KM = 2.0, EIS_RHO = 0.917;   // Eisschild: mittlere Dicke gesetzt (Antarktis ~2,1 km, Literatur, ungeprüft); Dichte Eis/Wasser
  const MAX_P = 64;
  const NACHBAR_KM = 2000;                // Nachbar-Liste: 1 300 km Schablonen-Reichweite + 2 × ~350 km Abstand der 4 096 Proben (K5)

  // ── Plan ────────────────────────────────────────────────────────────────────────────────────────────────
  function zahl(v, d) { return (typeof v === 'number' && Number.isFinite(v)) ? v : d; }

  function planetPlan(samen, koerperIn) {
    const k = planetHash(samen);
    const Z = (a, b, c) => planetZufall(k, a, b, c);
    const ki = koerperIn || {};
    const radiusKm = zahl(ki.radiusKm, 2500 + Z(1, 1) * 9500);
    const koerper = Object.freeze({
      radiusKm,
      g: zahl(ki.g, 9.81 * radiusKm / 6371 * (0.8 + 0.4 * Z(1, 2))),
      wasserKm: zahl(ki.wasserKm, 1.9 + 1.2 * Z(1, 3)),
      krustenAnteil: zahl(ki.krustenAnteil, 0.33 + 0.15 * Z(1, 4)),
      freibordKm: zahl(ki.freibordKm, 0.25 + 0.5 * Z(1, 5)),
      neigungRad: zahl(ki.neigungRad, 0.7 * Z(1, 6)),
      tagStunden: zahl(ki.tagStunden, 10 + 40 * Z(1, 7)),
      jahrTage: zahl(ki.jahrTage, 100 + 700 * Z(1, 8)),
      drehsinn: zahl(ki.drehsinn, Z(1, 9) < 0.5 ? -1 : 1),
      sternFluss: zahl(ki.sternFluss, 0.8 + 0.4 * Z(1, 10)),
      alterMa: zahl(ki.alterMa, 3000 + 3000 * Z(1, 11)),
      bodenAlterMaxMa: zahl(ki.bodenAlterMaxMa, 180 + 20 * Z(1, 12)),
      shelfKm: zahl(ki.shelfKm, 0.12 + 0.18 * Z(1, 13)),
      regime: ki.regime === undefined ? 'platten' : ki.regime,
    });
    if (koerper.regime !== 'platten') throw new Error('planetPlan: Regime "' + koerper.regime + '" ist nicht gebaut (nur "platten", K10)');
    const R = radiusKm;
    const gS = 9.81 / koerper.g;
    const nS = ki.schollenZahl !== undefined ? ki.schollenZahl : 20 + Math.floor(Z(2, 0) * 21);
    const nO = ki.ozeanPlatten !== undefined ? ki.ozeanPlatten : 3 + Math.floor(Z(3, 0) * 4);
    if (!(nS >= 4 && nS <= 48 && nO >= 2 && nO <= 16)) throw new Error('planetPlan: Schollen- oder Ozeanplatten-Zahl außerhalb des Gesetzes');

    // Schollen: mitte0[3], radius, alter, saat, lappen, frei
    const schollen = new Float64Array(nS * 8);
    let sumRaw = 0; const raw = new Float64Array(nS);
    for (let s = 0; s < nS; s++) { const u = Z(20, s, 0); raw[s] = 0.35 + u * u * 1.6; sumRaw += raw[s]; }
    for (let s = 0; s < nS; s++) {
      zufallEinheit(k, 21, s, schollen, s * 8);
      const a = raw[s] / sumRaw * koerper.krustenAnteil * 1.22;
      schollen[s * 8 + 3] = kacos(1 - 2 * a);
      schollen[s * 8 + 4] = 1500 + 2500 * Z(22, s, 0);
      schollen[s * 8 + 5] = Math.floor(Z(23, s, 0) * 2147483647);
      schollen[s * 8 + 6] = 0.8 + 0.4 * Z(24, s, 0);
    }
    const tb = new Float64Array(6);
    // Zustand: Quaternion je Scholle, Weltmitte je Scholle
    const q = new Float64Array(nS * 4), w = new Float64Array(nS * 3), tmpQ = new Float64Array(8);
    function weltMitten() { for (let s = 0; s < nS; s++) qDreh(q, 4 * s, schollen[8 * s], schollen[8 * s + 1], schollen[8 * s + 2], w, 3 * s); }

    // Anfangs-Gruppen 2–6
    let gruppeAkt = new Int32Array(nS);
    { let s = 0, g = 0; while (s < nS) { let n = 2 + Math.floor(Z(25, g, 0) * 5); if (nS - s - n === 1) n++; if (s + n > nS) n = nS - s; for (let i = 0; i < n; i++) gruppeAkt[s + i] = g; s += n; g++; } }
    // Anfangs-Lage: je Gruppe ein Baum um den Nordpol, dann gedreht in die Streuung
    for (let s = 0; s < nS; s++) {
      const g = gruppeAkt[s];
      let erst = s; while (erst > 0 && gruppeAkt[erst - 1] === g) erst--;
      let px = 0, py = 1, pz = 0;
      if (s !== erst) {
        const par = erst + Math.floor(Z(26, s, 0) * (s - erst));
        const cx = w[3 * par], cy = w[3 * par + 1], cz = w[3 * par + 2];
        tangente(cx, cy, cz, tb);
        const th = TAU * Z(26, s, 1), d = (schollen[8 * par + 3] + schollen[8 * s + 3]) * (0.72 + 0.25 * Z(26, s, 2));
        const dx = kcos(th) * tb[0] + ksin(th) * tb[3], dy = kcos(th) * tb[1] + ksin(th) * tb[4], dz = kcos(th) * tb[2] + ksin(th) * tb[5];
        const cd = kcos(d), sd = ksin(d);
        px = cd * cx + sd * dx; py = cd * cy + sd * dy; pz = cd * cz + sd * dz;
      }
      minimalDreh(schollen[8 * s], schollen[8 * s + 1], schollen[8 * s + 2], px, py, pz, tmpQ, 0);
      qAchse(px, py, pz, TAU * Z(27, s, 0), tmpQ, 4);
      qMul(tmpQ, 4, tmpQ, 0, q, 4 * s); qNorm(q, 4 * s);
      qDreh(q, 4 * s, schollen[8 * s], schollen[8 * s + 1], schollen[8 * s + 2], w, 3 * s);
    }

    // Ozean-Platten: Start-Stätte, Gewicht ρ (rad), Quaternion je Schlüsselbild
    const ozeanStart = new Float64Array(nO * 4);
    for (let j = 0; j < nO; j++) { zufallEinheit(k, 30, j, ozeanStart, 4 * j); ozeanStart[4 * j + 3] = 0.42 + 0.3 * Z(31, j, 0); }
    const oq = new Float64Array(nO * 4); for (let j = 0; j < nO; j++) oq[4 * j + 3] = 1;

    const bilderL = [], artL = [], lageL = [], gruppeL = [], ozeanL = [], naehteL = [];
    function bildSchreiben(t, art) {
      bilderL.push(t); artL.push(art);
      lageL.push(Float64Array.from(q)); gruppeL.push(Uint8Array.from(gruppeAkt)); ozeanL.push(Float64Array.from(oq));
    }
    function gruppenListe() {
      let nG = 0; for (let s = 0; s < nS; s++) nG = Math.max(nG, gruppeAkt[s] + 1);
      const L = []; for (let g = 0; g < nG; g++) L.push({ g, m: [], flaeche: 0, c: [0, 0, 0] });
      for (let s = 0; s < nS; s++) { const G = L[gruppeAkt[s]]; G.m.push(s); const r = schollen[8 * s + 3], a = 1 - kcos(r); G.flaeche += a; G.c[0] += a * w[3 * s]; G.c[1] += a * w[3 * s + 1]; G.c[2] += a * w[3 * s + 2]; }
      for (const G of L) { const l = Math.sqrt(G.c[0] * G.c[0] + G.c[1] * G.c[1] + G.c[2] * G.c[2]); G.c[0] /= l; G.c[1] /= l; G.c[2] /= l; }
      return L.filter(G => G.m.length > 0);
    }
    // Abstand der Gruppe G (gedreht mit Matrix M) zu den gesetzten Schollen
    const gesetzt = [];
    const MM = new Float64Array(9), dq = new Float64Array(4);
    function lichte(G, faktor) {
      let min = 9;
      for (const s of G.m) {
        const x = schollen[8 * s], y = schollen[8 * s + 1], z = schollen[8 * s + 2];
        const ox = w[3 * s], oy = w[3 * s + 1], oz = w[3 * s + 2];
        const px = MM[0] * ox + MM[1] * oy + MM[2] * oz, py = MM[3] * ox + MM[4] * oy + MM[5] * oz, pz = MM[6] * ox + MM[7] * oy + MM[8] * oz;
        for (const o of gesetzt) {
          const d = acosF(px * w[3 * o] + py * w[3 * o + 1] + pz * w[3 * o + 2]) - faktor * (schollen[8 * s + 3] + schollen[8 * o + 3]);
          if (d < min) min = d;
        }
        void x; void y; void z;
      }
      return min;
    }
    function zielPunkt(Px, Py, Pz, th, d, out) {
      tangente(Px, Py, Pz, tb);
      const dx = kcos(th) * tb[0] + ksin(th) * tb[3], dy = kcos(th) * tb[1] + ksin(th) * tb[4], dz = kcos(th) * tb[2] + ksin(th) * tb[5];
      const cd = kcos(d), sd = ksin(d); out[0] = cd * Px + sd * dx; out[1] = cd * Py + sd * dy; out[2] = cd * Pz + sd * dz;
    }
    // Drehungen je Gruppe anwenden: dreh[g] = Quaternion
    function anwenden(L, dreh) {
      for (const G of L) for (const s of G.m) { qMul(dreh[G.g], 0, q, 4 * s, tmpQ, 0); q[4 * s] = tmpQ[0]; q[4 * s + 1] = tmpQ[1]; q[4 * s + 2] = tmpQ[2]; q[4 * s + 3] = tmpQ[3]; qNorm(q, 4 * s); }
      weltMitten();
    }
    const ziel = new Float64Array(3);
    function verstreuen(b) {
      const L = gruppenListe().sort((A, B) => B.flaeche - A.flaeche || A.g - B.g);
      gesetzt.length = 0; const dreh = {}; let maxW = 0;
      for (const G of L) {
        let best = -1e9, bestQ = null, bestW = 0;
        for (let c = 0; c < 28; c++) {
          zufallEinheit(k, 40 + b, G.g * 64 + c, ziel, 0);
          const wi = minimalDreh(G.c[0], G.c[1], G.c[2], ziel[0], ziel[1], ziel[2], dq, 0); qMatrix(dq, 0, MM, 0);
          const l = gesetzt.length ? lichte(G, 1.0) : 1;
          const wert = Math.min(l, 0.35) - 0.12 * wi;
          if (wert > best) { best = wert; bestQ = Float64Array.from(dq); bestW = wi; }
        }
        dreh[G.g] = bestQ; if (bestW > maxW) maxW = bestW;
        qMatrix(bestQ, 0, MM, 0);
        for (const s of G.m) { const ox = w[3 * s], oy = w[3 * s + 1], oz = w[3 * s + 2]; w[3 * s] = MM[0] * ox + MM[1] * oy + MM[2] * oz; w[3 * s + 1] = MM[3] * ox + MM[4] * oy + MM[5] * oz; w[3 * s + 2] = MM[6] * ox + MM[7] * oy + MM[8] * oz; gesetzt.push(s); }
      }
      // w wurde vorgreifend gedreht: Quaternionen nachziehen
      for (const G of L) for (const s of G.m) { qMul(dreh[G.g], 0, q, 4 * s, tmpQ, 0); q[4 * s] = tmpQ[0]; q[4 * s + 1] = tmpQ[1]; q[4 * s + 2] = tmpQ[2]; q[4 * s + 3] = tmpQ[3]; qNorm(q, 4 * s); }
      weltMitten();
      return maxW;
    }
    function versammeln(b) {
      const L = gruppenListe().sort((A, B) => B.flaeche - A.flaeche || A.g - B.g);
      const P = new Float64Array(3); zufallEinheit(k, 50, b, P, 0);
      gesetzt.length = 0; const dreh = {}; let maxW = 0, erst = true;
      for (const G of L) {
        let dBest = 0;
        if (!erst) {
          const th = TAU * Z(51, b, G.g);
          let ok = -1, prev = 0;
          for (let d = 0.03; d < PI; d += 0.05) {
            zielPunkt(P[0], P[1], P[2], th, d, ziel);
            minimalDreh(G.c[0], G.c[1], G.c[2], ziel[0], ziel[1], ziel[2], dq, 0); qMatrix(dq, 0, MM, 0);
            if (lichte(G, 0.86) >= 0) { ok = d; break; }
            prev = d;
          }
          if (ok < 0) ok = PI * 0.97;
          let lo = prev, hi = ok;
          for (let i = 0; i < 6 && prev > 0; i++) {
            const m = 0.5 * (lo + hi); zielPunkt(P[0], P[1], P[2], th, m, ziel);
            minimalDreh(G.c[0], G.c[1], G.c[2], ziel[0], ziel[1], ziel[2], dq, 0); qMatrix(dq, 0, MM, 0);
            if (lichte(G, 0.86) >= 0) hi = m; else lo = m;
          }
          dBest = hi; zielPunkt(P[0], P[1], P[2], th, dBest, ziel);
        } else { ziel[0] = P[0]; ziel[1] = P[1]; ziel[2] = P[2]; }
        erst = false;
        const wi = minimalDreh(G.c[0], G.c[1], G.c[2], ziel[0], ziel[1], ziel[2], dq, 0);
        dreh[G.g] = Float64Array.from(dq); if (wi > maxW) maxW = wi;
        qMatrix(dq, 0, MM, 0);
        for (const s of G.m) { const ox = w[3 * s], oy = w[3 * s + 1], oz = w[3 * s + 2]; w[3 * s] = MM[0] * ox + MM[1] * oy + MM[2] * oz; w[3 * s + 1] = MM[3] * ox + MM[4] * oy + MM[5] * oz; w[3 * s + 2] = MM[6] * ox + MM[7] * oy + MM[8] * oz; gesetzt.push(s); }
      }
      for (const G of L) for (const s of G.m) { qMul(dreh[G.g], 0, q, 4 * s, tmpQ, 0); q[4 * s] = tmpQ[0]; q[4 * s + 1] = tmpQ[1]; q[4 * s + 2] = tmpQ[2]; q[4 * s + 3] = tmpQ[3]; qNorm(q, 4 * s); }
      weltMitten();
      return maxW;
    }
    // Ozean-Platten ziehen GEGEN die Bewegung der nahen Kontinente (Gesetz: vor einem Kontinent schließt sich der Ozean
    // und taucht unter ihm ab, hinter ihm öffnet er sich), plus eine Streuung aus dem Samen.
    function ozeanZiehen(b, dauer, Lvor, qVor) {
      const om = []; const inv = new Float64Array(4), rel = new Float64Array(4);
      for (const G of Lvor) {
        const s = G.m[0]; inv[0] = -qVor[4 * s]; inv[1] = -qVor[4 * s + 1]; inv[2] = -qVor[4 * s + 2]; inv[3] = qVor[4 * s + 3];
        qMul(q, 4 * s, inv, 0, rel, 0); let x = rel[0], y = rel[1], zz = rel[2], ww = rel[3]; if (ww < 0) { x = -x; y = -y; zz = -zz; ww = -ww; }
        const sn = Math.sqrt(x * x + y * y + zz * zz), wi = sn > 1e-14 ? 2 * katan2(sn, ww) / dauer : 0;
        om.push([G.c[0], G.c[1], G.c[2], sn > 1e-14 ? x / sn * wi : 0, sn > 1e-14 ? y / sn * wi : 0, sn > 1e-14 ? zz / sn * wi : 0]);
      }
      for (let j = 0; j < nO; j++) {
        const z = new Float64Array(3); qDreh(oq, 4 * j, ozeanStart[4 * j], ozeanStart[4 * j + 1], ozeanStart[4 * j + 2], z, 0);
        tangente(z[0], z[1], z[2], tb);
        let Ox = 0, Oy = 0, Oz = 0, sw = 0;
        for (const o of om) { const d = acosF(z[0] * o[0] + z[1] * o[1] + z[2] * o[2]); const wg = 1 / ((0.25 + d) * (0.25 + d)); Ox += wg * o[3]; Oy += wg * o[4]; Oz += wg * o[5]; sw += wg; }
        // gewünschte Fahrt: v = (−Ω̄) × z · R (gegen die Kontinente) + 25 km/Ma zum nächsten Kontinent (Zug der Platte zum
        // Rand, an dem sie abtaucht — ein ruhender Superkontinent ist so ringsum von Subduktion gesäumt); gestreut um ±50°
        let vx = -(Oy * z[2] - Oz * z[1]) * R, vy = -(Oz * z[0] - Ox * z[2]) * R, vz = -(Ox * z[1] - Oy * z[0]) * R;
        let nb = -1, nd = 9; for (let gi = 0; gi < om.length; gi++) { const d = acosF(z[0] * om[gi][0] + z[1] * om[gi][1] + z[2] * om[gi][2]); if (d < nd) { nd = d; nb = gi; } }
        if (nb >= 0) {
          const c0 = om[nb], cd = c0[0] * z[0] + c0[1] * z[1] + c0[2] * z[2]; let tx = c0[0] - cd * z[0], ty = c0[1] - cd * z[1], tz = c0[2] - cd * z[2]; const tl = Math.sqrt(tx * tx + ty * ty + tz * tz);
          if (tl > 1e-9) { vx += 25 * tx / tl; vy += 25 * ty / tl; vz += 25 * tz / tl; }
        }
        const vl = Math.sqrt(vx * vx + vy * vy + vz * vz);
        let th = TAU * Z(60, b, j);
        if (vl > 1e-12 && sw > 0) th = katan2(vx * tb[3] + vy * tb[4] + vz * tb[5], vx * tb[0] + vy * tb[1] + vz * tb[2]) + (Z(60, b, j) - 0.5) * 1.75;
        const rate = 35 + 60 * Z(61, b, j);
        const dx = kcos(th) * tb[0] + ksin(th) * tb[3], dy = kcos(th) * tb[1] + ksin(th) * tb[4], dz = kcos(th) * tb[2] + ksin(th) * tb[5];
        // Achse ⟂ z und ⟂ Fahrtrichtung
        let ax = z[1] * dz - z[2] * dy, ay = z[2] * dx - z[0] * dz, az = z[0] * dy - z[1] * dx; const l = Math.sqrt(ax * ax + ay * ay + az * az);
        qAchse(ax / l, ay / l, az / l, Math.min(rate * dauer / R, 0.9 * PI), tmpQ, 0); // ein Schlüsselbild trägt höchstens 0,9·π je Abschnitt
        qMul(tmpQ, 0, oq, 4 * j, tmpQ, 4); oq[4 * j] = tmpQ[4]; oq[4 * j + 1] = tmpQ[5]; oq[4 * j + 2] = tmpQ[6]; oq[4 * j + 3] = tmpQ[7]; qNorm(oq, 4 * j);
      }
    }
    function nahtSchreiben(t) { // Kontakte verschiedener Gruppen im versammelten Bild: eine Naht je Gruppen-Paar, in beiden Rahmen
      const best = new Map();
      for (let a = 0; a < nS; a++) for (let c = a + 1; c < nS; c++) {
        if (gruppeAkt[a] === gruppeAkt[c]) continue;
        const d = acosF(w[3 * a] * w[3 * c] + w[3 * a + 1] * w[3 * c + 1] + w[3 * a + 2] * w[3 * c + 2]);
        const luecke = d - (schollen[8 * a + 3] + schollen[8 * c + 3]);
        if (luecke > 0.02) continue;
        const key = Math.min(gruppeAkt[a], gruppeAkt[c]) * 64 + Math.max(gruppeAkt[a], gruppeAkt[c]);
        const alt = best.get(key); if (!alt || luecke < alt.l) best.set(key, { a, c, l: luecke, d });
      }
      const keys = [...best.keys()].sort((x, y) => x - y);
      for (const key of keys) {
        const { a, c, d } = best.get(key);
        for (const [s, o] of [[a, c], [c, a]]) {
          // Richtung zur Partner-Scholle im eigenen Rahmen von s: Azimut um mitte0
          const inv = new Float64Array(4); inv[0] = -q[4 * s]; inv[1] = -q[4 * s + 1]; inv[2] = -q[4 * s + 2]; inv[3] = q[4 * s + 3];
          const lp = new Float64Array(3); qDreh(inv, 0, w[3 * o], w[3 * o + 1], w[3 * o + 2], lp, 0);
          const mx = schollen[8 * s], my = schollen[8 * s + 1], mz = schollen[8 * s + 2]; tangente(mx, my, mz, tb);
          const az = katan2(lp[0] * tb[3] + lp[1] * tb[4] + lp[2] * tb[5], lp[0] * tb[0] + lp[1] * tb[1] + lp[2] * tb[2]);
          const rs = schollen[8 * s + 3], ro = schollen[8 * o + 3];
          const kontakt = Math.min(rs, d * rs / (rs + ro)) / rs; // Kontakt-Radius relativ
          const halb = Math.min(0.7, 0.5 * Math.min(rs, ro) / rs); // die Kontakt-Sehne, nicht der halbe Umfang
          naehteL.push(s, o, az, halb, t, (3.2 + 2.0 * Z(70, s, Math.floor(t))) , 80 + 50 * Z(71, o, Math.floor(t)), kontakt);
        }
      }
    }
    function neuSchnitt(b) { // Gruppen neu schneiden, bevorzugt an jungen Nähten (Kontakt verschiedener Alt-Gruppen)
      const par = new Int32Array(nS), groesse = new Int32Array(nS); for (let s = 0; s < nS; s++) { par[s] = s; groesse[s] = 1; }
      const find = (x) => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; };
      const kanten = [];
      for (let a = 0; a < nS; a++) for (let c = a + 1; c < nS; c++) {
        const d = acosF(w[3 * a] * w[3 * c] + w[3 * a + 1] * w[3 * c + 1] + w[3 * a + 2] * w[3 * c + 2]);
        if (d < (schollen[8 * a + 3] + schollen[8 * c + 3]) * 1.02) kanten.push([a, c, gruppeAkt[a] === gruppeAkt[c] ? 1 : 0, Z(80, b, a * 64 + c)]);
      }
      kanten.sort((x, y) => (y[2] - x[2]) || (x[3] - y[3]));
      for (const [a, c, alt, u] of kanten) {
        const ra = find(a), rc = find(c); if (ra === rc) continue;
        const behalten = alt ? u > 0.12 : u < 0.22;
        if (!behalten || groesse[ra] + groesse[rc] > 6) continue;
        par[rc] = ra; groesse[ra] += groesse[rc];
      }
      const id = new Map(); let n = 0;
      for (let s = 0; s < nS; s++) { const r = find(s); if (!id.has(r)) id.set(r, n++); gruppeAkt[s] = id.get(r); }
    }

    // Zeitachse
    weltMitten();
    let t = T_START; verstreuen(0);
    bildSchreiben(t, BILD_ART.verstreut);
    let b = 0, art = BILD_ART.verstreut;
    while (t <= T_ENDE && b < 80) {
      let naechste, dauer;
      const qVor = Float64Array.from(q), Lvor = gruppenListe();
      if (art === BILD_ART.verstreut) {
        const wi = versammeln(b + 1); const rate = 45 + 40 * Z(90, b, 0);
        dauer = Math.max(40, wi * R / rate);
        naechste = BILD_ART.versammelt;
      } else if (art === BILD_ART.versammelt) {
        dauer = 50 + 100 * Z(91, b, 0);
        const ax = new Float64Array(3); zufallEinheit(k, 92, b, ax, 0);
        const wi = (15 + 15 * Z(93, b, 0)) * dauer / R; qAchse(ax[0], ax[1], ax[2], wi, tmpQ, 0);
        const L = gruppenListe(); const dreh = {}; for (const G of L) dreh[G.g] = Float64Array.from(tmpQ.subarray(0, 4));
        anwenden(L, dreh); naechste = BILD_ART.geloest;
      } else {
        const wi = verstreuen(b + 1); const rate = 45 + 40 * Z(94, b, 0);
        dauer = Math.max(40, wi * R / rate);
        naechste = BILD_ART.verstreut;
      }
      ozeanZiehen(b, dauer, Lvor, qVor);
      t += dauer; b++; art = naechste;
      if (art === BILD_ART.versammelt) nahtSchreiben(t - 30);
      bildSchreiben(t, art);
      if (art === BILD_ART.geloest) { neuSchnitt(b); gruppeL[b] = Uint8Array.from(gruppeAkt); }
    }
    if (t <= T_ENDE) throw new Error('planetPlan: Zeitachse erreicht +1000 Ma nicht');

    const nB = bilderL.length;
    const bilder = Float64Array.from(bilderL), artA = Uint8Array.from(artL);
    const lage = new Float64Array(nB * nS * 4), gruppe = new Uint8Array(nB * nS), ozean = new Float64Array(nB * nO * 4);
    for (let i = 0; i < nB; i++) { lage.set(lageL[i], i * nS * 4); gruppe.set(gruppeL[i], i * nS); ozean.set(ozeanL[i], i * nO * 4); }

    // Hotspots im Mantel-Rahmen: Ort[3], Beginn, Ende, Stärke
    const nH = 300; const hotspots = new Float64Array(nH * 6);
    for (let h = 0; h < nH; h++) {
      zufallEinheit(k, 100, h, hotspots, 6 * h);
      const beg = T_START + (T_ENDE - T_START + 400) * Z(101, h, 0) - 300, life = 120 + 480 * Z(102, h, 0);
      hotspots[6 * h + 3] = beg; hotspots[6 * h + 4] = beg + life; hotspots[6 * h + 5] = 0.6 + 0.6 * Z(103, h, 0);
    }
    // Trapp-Ereignisse: Scholle, Ort im Schollen-Rahmen [3], Zeit, Radius km, Stärke km — gepackt als 6 Zahlen (Scholle·4 + …)
    const nE = 28; const ereignisse = new Float64Array(nE * 6);
    for (let e = 0; e < nE; e++) {
      const s = Math.floor(Z(110, e, 0) * nS); const m0 = schollen[8 * s], m1 = schollen[8 * s + 1], m2 = schollen[8 * s + 2];
      tangente(m0, m1, m2, tb); const th = TAU * Z(111, e, 0), d = schollen[8 * s + 3] * 0.6 * Z(112, e, 0);
      const dx = kcos(th) * tb[0] + ksin(th) * tb[3], dy = kcos(th) * tb[1] + ksin(th) * tb[4], dz = kcos(th) * tb[2] + ksin(th) * tb[5];
      const cd = kcos(d), sd = ksin(d);
      ereignisse[6 * e] = s; ereignisse[6 * e + 1] = cd * m0 + sd * dx;
      ereignisse[6 * e + 2] = cd * m1 + sd * dy; ereignisse[6 * e + 3] = cd * m2 + sd * dz;
      ereignisse[6 * e + 4] = T_START + (T_ENDE - T_START) * Z(113, e, 0);
      ereignisse[6 * e + 5] = Math.floor(250 + 500 * Z(114, e, 0)) * 1000 + (0.3 + 0.4 * Z(115, e, 0)); // ganze Radius-km · 1000 + Stärke km (gepackt)
    }

    const naehte = Float64Array.from(naehteL);
    const plan = {
      samen, k, version: VERSION, koerper, R, gS, nS, nO, nB, nH, nE,
      schollen, bilder, art: artA, lage, gruppe, ozean, ozeanStart, naehte, hotspots, ereignisse,
      Q: 0, saatW: (k ^ 0x5bd1e995) | 0,
    };
    plan.Q = krustenSchwelle(plan);
    return Object.freeze(plan);
  }

  function planBytes(plan) {
    let n = 0; for (const key of ['schollen', 'bilder', 'art', 'lage', 'gruppe', 'ozean', 'ozeanStart', 'naehte', 'hotspots', 'ereignisse']) n += plan[key].byteLength;
    return n + 256;
  }

  // ── Memo je Plan (ändert nie ein Ergebnis) ──────────────────────────────────────────────────────────────
  const MEMO = new WeakMap();
  function memoVon(plan) {
    let m = MEMO.get(plan);
    if (!m) { m = { abs: [], scheiben: new Map(), meerBin: new Map(), meerRef: new Map(), proben: new Map(), naehteJe: null, tang: null }; MEMO.set(plan, m); }
    return m;
  }
  // Ein-Eintrag-Zwischenspeicher je Tafel (Identität des Plans): spart die WeakMap im Punkt-Pfad, ändert kein Ergebnis
  let TG_P = null, TG_V = null, EL_P = null, EL_V = null, NJ_P = null, NJ_V = null;
  function tangentenJeScholle(plan) {
    if (plan === TG_P) return TG_V;
    const M = memoVon(plan);
    if (!M.tang) {
      const T = new Float64Array(plan.nS * 6), tb = new Float64Array(6);
      for (let s = 0; s < plan.nS; s++) { tangente(plan.schollen[8 * s], plan.schollen[8 * s + 1], plan.schollen[8 * s + 2], tb); T.set(tb, 6 * s); }
      M.tang = T;
    }
    TG_P = plan; TG_V = M.tang; return M.tang;
  }
  function naehteJeScholle(plan) {
    if (plan === NJ_P) return NJ_V;
    const r = naehteJeSchollePlan(plan); NJ_P = plan; NJ_V = r; return r;
  }
  function naehteJeSchollePlan(plan) {
    const M = memoVon(plan); if (M.naehteJe) return M.naehteJe;
    const n = plan.naehte.length / 8, start = new Int32Array(plan.nS + 1), cnt = new Int32Array(plan.nS);
    for (let i = 0; i < n; i++) cnt[plan.naehte[8 * i]]++;
    for (let s = 0; s < plan.nS; s++) start[s + 1] = start[s] + cnt[s];
    const liste = new Int32Array(n), f = Int32Array.from(start);
    for (let i = 0; i < n; i++) { const s = plan.naehte[8 * i]; liste[f[s]++] = i; }
    M.naehteJe = { start, liste }; return M.naehteJe;
  }

  function abschnittIndex(plan, t) {
    if (!(typeof t === 'number' && Number.isFinite(t))) throw new Error('planet: zeitMa fehlt oder ist keine Zahl (K10)');
    const B = plan.bilder;
    if (t < B[0] || t > B[plan.nB - 1]) throw new Error('planet: zeitMa ' + t + ' liegt außerhalb der Schlüsselbilder [' + B[0] + ', ' + B[plan.nB - 1] + '] (K10)');
    let lo = 0, hi = plan.nB - 2;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (B[m] <= t) lo = m; else hi = m - 1; }
    return lo;
  }
  function tempo(u) { return 0.4 * u + 0.6 * u * u * (3 - 2 * u); }
  function tempoAbl(u) { return 0.4 + 3.6 * u * (1 - u); }

  function abschnitt(plan, b) {
    const M = memoVon(plan); if (M.abs[b]) return M.abs[b];
    const nS = plan.nS, nO = plan.nO, R = plan.R, k = plan.k;
    const t0 = plan.bilder[b], t1 = plan.bilder[b + 1], dauer = t1 - t0;
    const grp = plan.gruppe.subarray(b * nS, b * nS + nS);
    let nG = 0; for (let s = 0; s < nS; s++) nG = Math.max(nG, grp[s] + 1);
    const achse = new Float64Array((nG + nO) * 3), winkel = new Float64Array(nG + nO);
    const tmp = new Float64Array(8);
    function achseAus(q0, o0, q1, o1, i) {
      tmp[0] = -q0[o0]; tmp[1] = -q0[o0 + 1]; tmp[2] = -q0[o0 + 2]; tmp[3] = q0[o0 + 3];
      qMul(q1, o1, tmp, 0, tmp, 4);
      let x = tmp[4], y = tmp[5], z = tmp[6], ww = tmp[7]; if (ww < 0) { x = -x; y = -y; z = -z; ww = -ww; }
      const s = Math.sqrt(x * x + y * y + z * z);
      if (s < 1e-14) { achse[3 * i] = 0; achse[3 * i + 1] = 1; achse[3 * i + 2] = 0; winkel[i] = 0; return; }
      achse[3 * i] = x / s; achse[3 * i + 1] = y / s; achse[3 * i + 2] = z / s; winkel[i] = 2 * katan2(s, ww);
    }
    const mStart = new Int32Array(nG + 1), mList = new Int32Array(nS);
    { const cnt = new Int32Array(nG); for (let s = 0; s < nS; s++) cnt[grp[s]]++; for (let g = 0; g < nG; g++) mStart[g + 1] = mStart[g] + cnt[g]; const f = Int32Array.from(mStart); for (let s = 0; s < nS; s++) mList[f[grp[s]]++] = s; }
    for (let g = 0; g < nG; g++) {
      if (mStart[g + 1] === mStart[g]) { winkel[g] = 0; achse[3 * g + 1] = 1; continue; }
      const s = mList[mStart[g]];
      achseAus(plan.lage, (b * nS + s) * 4, plan.lage, ((b + 1) * nS + s) * 4, g);
    }
    for (let j = 0; j < nO; j++) achseAus(plan.ozean, (b * nO + j) * 4, plan.ozean, ((b + 1) * nO + j) * 4, nG + j);
    const schuerze = new Float64Array(nG), hinten = new Float64Array(nG);
    for (let g = 0; g < nG; g++) { schuerze[g] = (150 + 300 * planetZufall(k, 120, b, g)) / R; hinten[g] = (2200 + 1600 * planetZufall(k, 121, b, g)) / R; }
    // Paar-Tafel: Öffnungs-Zeit der Kontinent-Paare, die im letzten versammelten Bild in Kontakt standen
    const tOffen = new Float64Array(nG * nG).fill(-1e9);
    let gl = -1; for (let i = b; i >= 0; i--) { if (plan.art[i] === BILD_ART.geloest) { gl = i; break; } if (plan.art[i] === BILD_ART.versammelt && i !== b) break; }
    if (gl >= 0 && plan.art[b] !== BILD_ART.versammelt) {
      const wv = new Float64Array(3), wu = new Float64Array(3);
      for (let a = 0; a < nS; a++) for (let c = a + 1; c < nS; c++) {
        const ga = grp[a], gc = grp[c]; if (ga === gc) continue;
        qDreh(plan.lage, (gl * nS + a) * 4, plan.schollen[8 * a], plan.schollen[8 * a + 1], plan.schollen[8 * a + 2], wv, 0);
        qDreh(plan.lage, (gl * nS + c) * 4, plan.schollen[8 * c], plan.schollen[8 * c + 1], plan.schollen[8 * c + 2], wu, 0);
        const d = acosF(wv[0] * wu[0] + wv[1] * wu[1] + wv[2] * wu[2]);
        if (d < (plan.schollen[8 * a + 3] + plan.schollen[8 * c + 3]) * 1.05) { tOffen[ga * nG + gc] = plan.bilder[gl]; tOffen[gc * nG + ga] = plan.bilder[gl]; }
      }
    }
    // Rand-Gedächtnis bis zum Beginn dieses Abschnitts: je Scholle 32 Azimut-Fächer (Ende-Zeit, H0)
    let rand;
    if (b === 0) { rand = new Float32Array(nS * 64); for (let i = 0; i < nS * 32; i++) rand[2 * i] = -1e9; }
    else {
      const vor = abschnitt(plan, b - 1); rand = Float32Array.from(vor.rand);
      const tb = new Float64Array(6), qm = new Float64Array(8), Pw = new Float64Array(3), Po = new Float64Array(3), Cw = new Float64Array(3);
      const gS = plan.gS;
      for (let s = 0; s < nS; s++) {
        const g = vor.grp[s], wi = vor.winkel[g]; if (wi < 1e-6) continue;
        const ax = vor.achse[3 * g], ay = vor.achse[3 * g + 1], az = vor.achse[3 * g + 2];
        qAchse(ax, ay, az, wi * 0.5, qm, 0); qMul(qm, 0, plan.lage, ((b - 1) * nS + s) * 4, qm, 4);
        const mx = plan.schollen[8 * s], my = plan.schollen[8 * s + 1], mz = plan.schollen[8 * s + 2], rs = plan.schollen[8 * s + 3];
        qDreh(qm, 4, mx, my, mz, Cw, 0); tangente(mx, my, mz, tb);
        const geschw = wi * R / vor.dauer; // km/Ma am Äquator des Pols
        const reife = 1 - kexp(-vor.dauer / TAU_W);
        for (let f = 0; f < 32; f++) {
          const th = (f + 0.5) / 32 * TAU, ct = kcos(th), st = ksin(th);
          const dx = ct * tb[0] + st * tb[3], dy = ct * tb[1] + st * tb[4], dz = ct * tb[2] + st * tb[5];
          const c1 = kcos(rs), s1 = ksin(rs), c2 = kcos(rs * 1.2), s2 = ksin(rs * 1.2);
          qDreh(qm, 4, c1 * mx + s1 * dx, c1 * my + s1 * dy, c1 * mz + s1 * dz, Pw, 0);
          qDreh(qm, 4, c2 * mx + s2 * dx, c2 * my + s2 * dy, c2 * mz + s2 * dz, Po, 0);
          let innen = false;
          for (let i = vor.mStart[g]; i < vor.mStart[g + 1]; i++) {
            const o = vor.mList[i]; if (o === s) continue;
            const ow = new Float64Array(3); qMul(qm, 0, plan.lage, ((b - 1) * nS + o) * 4, tmp, 0);
            qDreh(tmp, 0, plan.schollen[8 * o], plan.schollen[8 * o + 1], plan.schollen[8 * o + 2], ow, 0);
            if (Po[0] * ow[0] + Po[1] * ow[1] + Po[2] * ow[2] > kcos(plan.schollen[8 * o + 3] * 0.95)) { innen = true; break; }
          }
          tangente(mx, my, mz, tb);
          if (innen) continue;
          const vx = ay * Pw[2] - az * Pw[1], vy = az * Pw[0] - ax * Pw[2], vz = ax * Pw[1] - ay * Pw[0];
          const vl = Math.sqrt(vx * vx + vy * vy + vz * vz); if (vl < 1e-9) continue;
          const cd = Cw[0] * Pw[0] + Cw[1] * Pw[1] + Cw[2] * Pw[2];
          let ox = -(Cw[0] - cd * Pw[0]), oy = -(Cw[1] - cd * Pw[1]), oz = -(Cw[2] - cd * Pw[2]); const ol = Math.sqrt(ox * ox + oy * oy + oz * oz) || 1;
          const front = (vx * ox + vy * oy + vz * oz) / (vl * ol);
          if (front < 0.35) continue;
          const s0 = Math.min(1.6, geschw * vl / 25); // dieselbe Rate-Norm wie der lebende Bogen (K5)
          rand[2 * (s * 32 + f)] = plan.bilder[b]; rand[2 * (s * 32 + f) + 1] = 4.4 * s0 * reife * gS * glatt(0.35, 0.7, front);
        }
      }
    }
    const A = { b, t0, t1, dauer, nG, nP: nG + nO, grp, achse, winkel, mStart, mList, schuerze, hinten, tOffen, rand };
    M.abs[b] = A; return A;
  }

  // Lage einer Scholle zur Zeit t (Quaternion in out)
  function lageScholle(plan, s, t, out, o) {
    const b = abschnittIndex(plan, t), A = abschnitt(plan, b);
    const u = (t - A.t0) / A.dauer, g = A.grp[s], e = tempo(u);
    qAchse(A.achse[3 * g], A.achse[3 * g + 1], A.achse[3 * g + 2], A.winkel[g] * e, _tqL, 0);
    qMul(_tqL, 0, plan.lage, (b * plan.nS + s) * 4, out, o);
  }
  const _tqL = new Float64Array(4);
  function lageOzean(plan, j, t, out, o) {
    const b = abschnittIndex(plan, t), A = abschnitt(plan, b);
    const u = (t - A.t0) / A.dauer, i = A.nG + j, e = tempo(u);
    qAchse(A.achse[3 * i], A.achse[3 * i + 1], A.achse[3 * i + 2], A.winkel[i] * e, _tqL, 0);
    qMul(_tqL, 0, plan.ozean, (b * plan.nO + j) * 4, out, o);
  }

  // ── Krusten-Schwelle Q: Quantil des Krustenfelds im ersten Bild (Fläche = krustenAnteil) ───────────────
  // Jede Scholle für sich (ohne Überdeckung): Σ Fläche(f_s > Q) = krustenAnteil der Kugel. Überdeckung im Lauf ist Kollision.
  function krustenSchwelle(plan) {
    const N = 4096, F = fib(N), werte = [];
    const E = ellipseJeScholle(plan);
    for (let s = 0; s < plan.nS; s++) {
      const mx = plan.schollen[8 * s], my = plan.schollen[8 * s + 1], mz = plan.schollen[8 * s + 2], aus = kcos(Math.min(PI, plan.schollen[8 * s + 3] * 1.75 * E[3 * s + 2]));
      for (let i = 0; i < N; i++) {
        const x = F[3 * i], y = F[3 * i + 1], z = F[3 * i + 2], d = x * mx + y * my + z * mz;
        if (d < aus) continue;
        const f = schollenFeld(plan, s, x, y, z, d, 80, 0); if (f > -0.6) werte.push(f);
      }
    }
    werte.sort((a, b) => b - a);
    const n = Math.floor(plan.koerper.krustenAnteil * N);
    if (n >= werte.length) throw new Error('planet: Krusten-Schwelle nicht lösbar');
    return werte[n];
  }

  // ── Scheibe ─────────────────────────────────────────────────────────────────────────────────────────────
  function scheibeKern(plan, t, ohneQ, bFest) {
    const M = memoVon(plan);
    const key = bFest === undefined ? t : t + '|' + bFest;   // bFest: Ende des Abschnitts bFest (u = 1), Leser nur der Nachklang
    if (!ohneQ && M.scheiben.has(key)) return M.scheiben.get(key);
    if (bFest !== undefined) abschnittIndex(plan, t);
    const b = bFest === undefined ? abschnittIndex(plan, t) : bFest, A = abschnitt(plan, b);
    const nS = plan.nS, nO = plan.nO, nG = A.nG, nP = nG + nO, R = plan.R;
    if (nP > MAX_P) throw new Error('planet: mehr als ' + MAX_P + ' Platten');
    const u = (t - A.t0) / A.dauer, e = tempo(u), ea = tempoAbl(u) / A.dauer;
    const sw = new Float64Array(nS * 3), sm = new Float64Array(nS * 9), sr = new Float64Array(nS), sAus = new Float64Array(nS);
    const qS = new Float64Array(nS * 4), tq = new Float64Array(4);
    for (let s = 0; s < nS; s++) {
      const g = A.grp[s];
      qAchse(A.achse[3 * g], A.achse[3 * g + 1], A.achse[3 * g + 2], A.winkel[g] * e, tq, 0);
      qMul(tq, 0, plan.lage, (b * nS + s) * 4, qS, 4 * s); qNorm(qS, 4 * s);
      qMatrix(qS, 4 * s, sm, 9 * s);
      const mx = plan.schollen[8 * s], my = plan.schollen[8 * s + 1], mz = plan.schollen[8 * s + 2];
      sw[3 * s] = sm[9 * s] * mx + sm[9 * s + 1] * my + sm[9 * s + 2] * mz;
      sw[3 * s + 1] = sm[9 * s + 3] * mx + sm[9 * s + 4] * my + sm[9 * s + 5] * mz;
      sw[3 * s + 2] = sm[9 * s + 6] * mx + sm[9 * s + 7] * my + sm[9 * s + 8] * mz;
      sr[s] = plan.schollen[8 * s + 3];
      sAus[s] = kcos(Math.min(PI, sr[s] * 1.75 * ellipseJeScholle(plan)[3 * s + 2]));
    }
    // Platten: Anker (Schwerpunkt bzw. Stätte), ω
    const pz = new Float64Array(nP * 3), pom = new Float64Array(nP * 3), rho = new Float64Array(nP);
    for (let g = 0; g < nG; g++) {
      let cx = 0, cy = 0, cz = 0;
      for (let i = A.mStart[g]; i < A.mStart[g + 1]; i++) { const s = A.mList[i], a = 1 - kcos(sr[s]); cx += a * sw[3 * s]; cy += a * sw[3 * s + 1]; cz += a * sw[3 * s + 2]; }
      const l = Math.sqrt(cx * cx + cy * cy + cz * cz) || 1; pz[3 * g] = cx / l; pz[3 * g + 1] = cy / l; pz[3 * g + 2] = cz / l;
      const om = A.winkel[g] * ea; pom[3 * g] = A.achse[3 * g] * om; pom[3 * g + 1] = A.achse[3 * g + 1] * om; pom[3 * g + 2] = A.achse[3 * g + 2] * om;
    }
    const oqT = new Float64Array(4), zj = new Float64Array(3);
    for (let j = 0; j < nO; j++) {
      const i = nG + j;
      qAchse(A.achse[3 * i], A.achse[3 * i + 1], A.achse[3 * i + 2], A.winkel[i] * e, tq, 0);
      qMul(tq, 0, plan.ozean, (b * nO + j) * 4, oqT, 0);
      qDreh(oqT, 0, plan.ozeanStart[4 * j], plan.ozeanStart[4 * j + 1], plan.ozeanStart[4 * j + 2], zj, 0);
      pz[3 * i] = zj[0]; pz[3 * i + 1] = zj[1]; pz[3 * i + 2] = zj[2]; rho[i] = plan.ozeanStart[4 * j + 3];
      const om = A.winkel[i] * ea; pom[3 * i] = A.achse[3 * i] * om; pom[3 * i + 1] = A.achse[3 * i + 1] * om; pom[3 * i + 2] = A.achse[3 * i + 2] * om;
    }
    const sgrp = new Int32Array(nS); for (let s = 0; s < nS; s++) sgrp[s] = A.grp[s];
    const S = {
      plan, zeitMa: t, b, abschnitt: A, nS, nG, nO, nP, R, sw, sm, sr, sAus, sgrp, qS, pz, pom, rho,
      bFest, nbStart: null, nbList: null, ketten: null, kettenN: 0, reife: 1 - kexp(-(t - A.t0 + 1) / TAU_W), Q: ohneQ ? 0 : plan.Q, meerKm: 0, refKm: 0, kuesteF: 0,
    };
    if (ohneQ) return S;
    // Nachbar-Liste aus 4 096 Fibonacci-Proben
    // und die Paar-Rate: Mittel der Normal-Geschwindigkeit längs des gemeinsamen Rands (Proben näher als 250 km)
    const N = 4096, F = fib(N), adj = new Uint8Array(nP * nP), cSum = new Float64Array(nP * nP), cN = new Float64Array(nP * nP);
    for (let g = 0; g < nG; g++) KF.gF[g] = -9; // Nachbarschaft aus der Krusten-Ellipse (ohne Rauschen): die Schürze trägt es
    for (let i = 0; i < N; i++) {
      plattenWertung(S, F[3 * i], F[3 * i + 1], F[3 * i + 2], true);
      const a = W_.best, c = W_.zweit;
      const m = c >= 0 ? (W_.sx[a] - W_.sx[c]) * 0.5 * R : 1e9;
      for (let j = 0; j < nP; j++) if (j !== a && (W_.sx[a] - W_.sx[j]) * 0.5 * R < NACHBAR_KM) { adj[a * nP + j] = 1; adj[j * nP + a] = 1; } // alle Platten, deren Schablonen (≤ 1 300 km) den Punkt erreichen können, plus zwei Proben-Abstände (K5: kein Nachbar tritt mitten in eine Schablone)
      if (m < 250) { paarRelativ(S, a, c, W_.qx, W_.qy, W_.qz); cSum[a * nP + c] += PR.c; cN[a * nP + c]++; cSum[c * nP + a] += PR.c; cN[c * nP + a]++; }
    }
    const paarC = new Float64Array(nP * nP);
    for (let i = 0; i < nP * nP; i++) paarC[i] = cN[i] > 0 ? cSum[i] / cN[i] : 0;
    S.paarC = paarC;
    const nbStart = new Int32Array(nP + 1); const L = [];
    for (let i = 0; i < nP; i++) { for (let j = 0; j < nP; j++) if (adj[i * nP + j]) L.push(j); nbStart[i + 1] = L.length; }
    S.nbStart = nbStart; S.nbList = Int32Array.from(L);
    kettenBauen(S);
    if (M.scheiben.size > 24) M.scheiben.delete(M.scheiben.keys().next().value);
    M.scheiben.set(key, S);
    return S;
  }

  // Hotspot-Ketten: Spur R(t)·R(T_k)⁻¹·h der Platte, die jetzt über dem Hotspot liegt. Die Stützen sitzen auf dem ABSOLUTEN
  // Takt T_k = 3,5·k Ma (K5): ein Kegel ist ein Ausbruch zur Zeit T_k und fährt mit der Platte, statt unter ihr durchzugleiten.
  // Der jüngste wächst über 3,5 Ma (glatt), der älteste klingt zwischen 80,5 und 84 Ma aus. Abklingen: Seamount e^(−τ/32),
  // Dom über Kruste e^(−τ/4), je Stütze in kettenAmp.
  function kettenBauen(S) {
    const plan = S.plan, t = S.zeitMa, nH = plan.nH, K = new Float64Array(nH * 24 * 4), KA = new Float64Array(nH * 24 * 2);
    const qa = new Float64Array(4), qb = new Float64Array(4), qi = new Float64Array(4), qr = new Float64Array(4), v = new Float64Array(3);
    const idx = [], g0 = Math.floor(t / 3.5);
    for (let h = 0; h < nH; h++) {
      const beg = plan.hotspots[6 * h + 3], end = plan.hotspots[6 * h + 4];
      if (beg > t || end < t - 84) continue;
      const hx = plan.hotspots[6 * h], hy = plan.hotspots[6 * h + 1], hzz = plan.hotspots[6 * h + 2];
      const fk = krusteFeld(S, hx, hy, hzz, 400, 0); const fg = W_.fGrp;
      plattenWertung(S, hx, hy, hzz);
      let p = W_.best;
      if (fk > S.Q - 0.06 && fg >= 0) p = fg;
      const istKont = p < S.nG; const ref = istKont ? S.abschnitt.mList[S.abschnitt.mStart[p]] : p - S.nG;
      if (istKont) lageScholle(plan, ref, t, qa, 0); else lageOzean(plan, ref, t, qa, 0);
      let cnt = 0;
      for (let kk = 0; kk < 24; kk++) {
        const tt = (g0 - kk) * 3.5, tau = t - tt;
        if (tt < beg || tt > end || tt < plan.bilder[0]) { K[(h * 24 + kk) * 4 + 3] = -1; continue; }
        if (istKont) lageScholle(plan, ref, tt, qb, 0); else lageOzean(plan, ref, tt, qb, 0);
        qi[0] = -qb[0]; qi[1] = -qb[1]; qi[2] = -qb[2]; qi[3] = qb[3];
        qMul(qa, 0, qi, 0, qr, 0); qDreh(qr, 0, hx, hy, hzz, v, 0);
        const ii = (h * 24 + kk) * 4; K[ii] = v[0]; K[ii + 1] = v[1]; K[ii + 2] = v[2]; K[ii + 3] = tau; cnt++;
        const wj = glatt(0, 3.5, tau) * (1 - glatt(80.5, 84, tau));
        KA[(h * 24 + kk) * 2] = wj * kexp(-tau / 32); KA[(h * 24 + kk) * 2 + 1] = wj * kexp(-tau / 4);
      }
      if (cnt > 0) idx.push(h);
    }
    // Hüll-Kappe je Kette
    const kap = new Float64Array(nH * 4);
    for (const h of idx) {
      let cx = 0, cy = 0, cz = 0;
      for (let kk = 0; kk < 24; kk++) { const ii = (h * 24 + kk) * 4; if (K[ii + 3] < 0) continue; cx += K[ii]; cy += K[ii + 1]; cz += K[ii + 2]; }
      const l = Math.sqrt(cx * cx + cy * cy + cz * cz) || 1; cx /= l; cy /= l; cz /= l;
      let mn = 1;
      for (let kk = 0; kk < 24; kk++) { const ii = (h * 24 + kk) * 4; if (K[ii + 3] < 0) continue; const d = cx * K[ii] + cy * K[ii + 1] + cz * K[ii + 2]; if (d < mn) mn = d; }
      const marg = 320 / S.R; kap[4 * h] = cx; kap[4 * h + 1] = cy; kap[4 * h + 2] = cz; kap[4 * h + 3] = kcos(Math.min(PI, acosF(mn) + marg));
    }
    // dicht gepackt: nur die Ketten, die zur Zeit t Stützen tragen
    const n = idx.length, Kc = new Float64Array(n * 96), kc = new Float64Array(n * 4), ka = new Float64Array(n * 48);
    for (let c = 0; c < n; c++) { const h = idx[c]; Kc.set(K.subarray(h * 96, h * 96 + 96), c * 96); kc.set(kap.subarray(4 * h, 4 * h + 4), 4 * c); ka.set(KA.subarray(h * 48, h * 48 + 48), c * 48); }
    S.ketten = Kc; S.kettenKap = kc; S.kettenAmp = ka; S.kettenG0 = g0; S.kettenIdx = Int32Array.from(idx); S.kettenCos = kcos(Math.min(PI, 300 / S.R));
  }

  // elliptischer Winkel-Abstand zur Mitte der Scholle s (dieselbe Ellipse wie ihr Krustenfeld)
  function ellAbst(S, s, x, y, z) {
    const plan = S.plan, sm = S.sm, o = 9 * s, TG = tangentenJeScholle(plan), E = ellipseJeScholle(plan);
    const lx = sm[o] * x + sm[o + 3] * y + sm[o + 6] * z, ly = sm[o + 1] * x + sm[o + 4] * y + sm[o + 7] * z, lz = sm[o + 2] * x + sm[o + 5] * y + sm[o + 8] * z;
    const pu = lx * TG[6 * s] + ly * TG[6 * s + 1] + lz * TG[6 * s + 2], pv = lx * TG[6 * s + 3] + ly * TG[6 * s + 4] + lz * TG[6 * s + 5];
    const ru = E[3 * s] * pu + E[3 * s + 1] * pv, rv = -E[3 * s + 1] * pu + E[3 * s] * pv, a = E[3 * s + 2], q2 = ru * ru + rv * rv;
    const fak = q2 > 1e-18 ? Math.sqrt((ru * ru / (a * a) + rv * rv * a * a) / q2) : 1;
    return acosF(x * S.sw[3 * s] + y * S.sw[3 * s + 1] + z * S.sw[3 * s + 2]) * fak;
  }
  // ── Platten-Wertung (gerichtete Potenz-Wertung, K1/K3) ─────────────────────────────────────────────────
  const W_ = { sc: new Float64Array(MAX_P), sx: new Float64Array(MAX_P), anc: new Int32Array(MAX_P), dC: new Float64Array(MAX_P), best: -1, zweit: -1, qx: 0, qy: 0, qz: 0, fGrp: -1 };
  function plattenWertung(S, x, y, z, grob) {
    const R = S.R, plan = S.plan;
    const wf = R / 1900, sw0 = plan.saatW;
    const wa = 160 / R;
    let qx = x, qy = y, qz = z;
    if (!grob) { qx += wa * rausch(sw0, x * wf, y * wf, z * wf); qy += wa * rausch(sw0 + 1, x * wf + 5.1, y * wf, z * wf); qz += wa * rausch(sw0 + 2, x * wf, y * wf - 3.3, z * wf); }
    const ql = Math.sqrt(qx * qx + qy * qy + qz * qz); qx /= ql; qy /= ql; qz /= ql;
    W_.qx = qx; W_.qy = qy; W_.qz = qz;
    const A = S.abschnitt, sw = S.sw, sr = S.sr, sc = W_.sc, Q = S.Q;
    let best = -1, bv = -1e9, zw = -1, zv = -1e9;
    for (let g = 0; g < S.nG; g++) {
      // Abstand zur Krusten-Kante der Gruppe aus DEMSELBEN Krustenfeld (mit Rauschen), das die Küste zieht (K1);
      // fern der Schollen (Feld ohne Rauschen) dieselbe Formel geometrisch — stetig am Übergang.
      let dmin = 1e9, an = -1;
      if (KF.gF[g] > -0.74) { an = KF.gS[g]; dmin = (Q - KF.gF[g]) * sr[an]; }
      else {
        for (let i = A.mStart[g]; i < A.mStart[g + 1]; i++) {
          const s = A.mList[i];
          // untere Schranke ohne Ellipse (fak ≥ 1/a): genau, nur schneller
          const lb = acosF(x * sw[3 * s] + y * sw[3 * s + 1] + z * sw[3 * s + 2]) / ellipseJeScholle(plan)[3 * s + 2] - sr[s] * (1 - Q);
          if (lb >= dmin) continue;
          if (grob) { dmin = lb; an = s; continue; } // grobe Lesart (untere Schranke): Obermenge der Nachbarn
          const d = ellAbst(S, s, x, y, z) - sr[s] * (1 - Q);
          if (d < dmin) { dmin = d; an = s; }
        }
      }
      W_.dC[g] = dmin; W_.anc[g] = an;
      const ox0 = S.pom[3 * g], oy0 = S.pom[3 * g + 1], oz0 = S.pom[3 * g + 2];
      const vx = oy0 * qz - oz0 * qy, vy = oz0 * qx - ox0 * qz, vz = ox0 * qy - oy0 * qx; const vl = Math.sqrt(vx * vx + vy * vy + vz * vz);
      let reach = 0.5 * (A.schuerze[g] + A.hinten[g]);
      if (vl > 1e-12 && an >= 0) { // vorn/hinten vom Schwerpunkt der Platte aus (stetig über den Wechsel der nächsten Scholle)
        const ax = S.pz[3 * g], ay = S.pz[3 * g + 1], az = S.pz[3 * g + 2], cd = ax * qx + ay * qy + az * qz;
        const ox = -(ax - cd * qx), oy = -(ay - cd * qy), oz = -(az - cd * qz), ol = Math.sqrt(ox * ox + oy * oy + oz * oz);
        if (ol > 1e-12) {
          const front = (vx * ox + vy * oy + vz * oz) / (vl * ol);
          let tt = (0.35 - front) / 0.8; tt = tt < 0 ? 0 : (tt > 1 ? 1 : tt);
          reach = A.schuerze[g] + (A.hinten[g] - A.schuerze[g]) * tt * tt * (3 - 2 * tt);
        }
      }
      const v = reach - (dmin < 0 ? dmin * 12 : dmin); sc[g] = v; W_.sx[g] = reach - dmin; // K1: im Krusten-Inneren gewinnt die Kruste immer (×12 nur die Entscheidung; die Schablonen messen wahre Distanz sx)
      if (v > bv) { zw = best; zv = bv; best = g; bv = v; } else if (v > zv) { zw = g; zv = v; }
    }
    for (let i = S.nG; i < S.nP; i++) {
      const v = S.rho[i] - acosF(qx * S.pz[3 * i] + qy * S.pz[3 * i + 1] + qz * S.pz[3 * i + 2]);
      sc[i] = v; W_.sx[i] = v; W_.dC[i] = 9;
      if (v > bv) { zw = best; zv = bv; best = i; bv = v; } else if (v > zv) { zw = i; zv = v; }
    }
    W_.best = best; W_.zweit = zw;
  }

  // ── Feld EINER Scholle im eigenen Rahmen: elliptisches Fenster über den Radius + verzogenes fBm im Rand-Gürtel ──
  function ellipseJeScholle(plan) {
    if (plan === EL_P) return EL_V;
    const M = memoVon(plan);
    if (!M.ell) {
      const E = new Float64Array(plan.nS * 3);
      for (let s = 0; s < plan.nS; s++) { const th = PI * planetZufall(plan.k, 28, s, 0); E[3 * s] = kcos(th); E[3 * s + 1] = ksin(th); E[3 * s + 2] = 1 + 0.6 * planetZufall(plan.k, 29, s, 0); }
      M.ell = E;
    }
    EL_P = plan; EL_V = M.ell; return M.ell;
  }
  function schollenFeld(plan, s, lx, ly, lz, d, lamCut, nurGrob) {
    const R = plan.R, rs = plan.schollen[8 * s + 3], TG = tangentenJeScholle(plan), E = ellipseJeScholle(plan);
    const pu = lx * TG[6 * s] + ly * TG[6 * s + 1] + lz * TG[6 * s + 2], pv = lx * TG[6 * s + 3] + ly * TG[6 * s + 4] + lz * TG[6 * s + 5];
    const ru = E[3 * s] * pu + E[3 * s + 1] * pv, rv = -E[3 * s + 1] * pu + E[3 * s] * pv, a = E[3 * s + 2], q2 = ru * ru + rv * rv;
    const fak = q2 > 1e-18 ? Math.sqrt((ru * ru / (a * a) + rv * rv * a * a) / q2) : 1;
    let f = 1 - acosF(d) * fak / rs;
    if (f > -0.75 && f < 0.6) {
      const seed = plan.schollen[8 * s + 5] | 0, lam0 = Math.min(3000, rs * R * 1.0);
      // Verzug (Domain-Warp) im eigenen Rahmen, dann fBm: die Küste zieht im Rand-Gürtel das Rauschen
      const wf = R / (lam0 * 1.1);
      const w1 = rausch(seed + 11, lx * wf, ly * wf, lz * wf), w2 = rausch(seed + 12, lx * wf + 3.7, ly * wf, lz * wf), w3 = rausch(seed + 13, lx * wf, ly * wf - 2.9, lz * wf);
      const wamp = 0.8 * lam0 / R;
      const ux = lx + wamp * w1, uy = ly + wamp * w2, uz = lz + wamp * w3;
      const n = nurGrob ? fbmKm(seed, ux, uy, uz, R, lam0, Math.max(lamCut, lam0 * 0.45), 0.62) : fbmKm(seed, ux, uy, uz, R, lam0, lamCut, 0.75);
      f += 0.6 * n * glatt(-0.75, -0.25, f) * (1 - glatt(0.3, 0.6, f)) * plan.schollen[8 * s + 6];
    }
    return f;
  }

  // ── Krustenfeld: Vereinigung aller Schollen-Felder, jedes im eigenen Rahmen (K1) ──────────────────────
  const KF = { gF: new Float64Array(MAX_P), gS: new Int32Array(MAX_P), sBest: -1, fBest: -9, sF: new Float64Array(64), sLx: new Float64Array(64 * 3), sIn: new Uint8Array(64) };
  function krusteFeld(S, x, y, z, fussKm, nurGrob) {
    const plan = S.plan, R = S.R, nS = S.nS, sw = S.sw, sm = S.sm, sr = S.sr, Q = S.Q;
    const lamCut = Math.max(32, 2 * fussKm);
    const gF = KF.gF; for (let g = 0; g < S.nG; g++) gF[g] = -9;
    let fBest = -9, sBest = -1;
    for (let s = 0; s < nS; s++) {
      KF.sIn[s] = 0;
      const d = x * sw[3 * s] + y * sw[3 * s + 1] + z * sw[3 * s + 2];
      if (d < S.sAus[s]) { KF.sF[s] = -9; continue; }
      const o = 9 * s;
      const lx = sm[o] * x + sm[o + 3] * y + sm[o + 6] * z, ly = sm[o + 1] * x + sm[o + 4] * y + sm[o + 7] * z, lz = sm[o + 2] * x + sm[o + 5] * y + sm[o + 8] * z;
      KF.sLx[3 * s] = lx; KF.sLx[3 * s + 1] = ly; KF.sLx[3 * s + 2] = lz; KF.sIn[s] = 1;
      const f = schollenFeld(plan, s, lx, ly, lz, d, lamCut, nurGrob);
      KF.sF[s] = f;
      const g = S.sgrp[s], a = gF[g];
      // weiches Maximum in der Gruppe
      if (f > a) KF.gS[g] = s;
      const hh = Math.max(0.1 - Math.abs(a - f), 0) / 0.1; gF[g] = Math.max(a, f) + hh * hh * 0.025;
      if (f > fBest) { fBest = f; sBest = s; }
    }
    let gb = -1, gv = -9; for (let g = 0; g < S.nG; g++) if (gF[g] > gv) { gv = gF[g]; gb = g; }
    KF.sBest = sBest; KF.fBest = fBest; W_.fGrp = gb;
    return gv;
  }

  // ── Paar-Relativbewegung am Punkt ─────────────────────────────────────────────────────────────────────
  const PR = { c: 0, scher: 0, rate: 0 };
  function ankerTangente(S, i, qx, qy, qz, out) {
    let ax, ay, az;
    ax = S.pz[3 * i]; ay = S.pz[3 * i + 1]; az = S.pz[3 * i + 2]; // stetiger Anker: Schwerpunkt bzw. Stätte
    const d = ax * qx + ay * qy + az * qz; let tx = ax - d * qx, ty = ay - d * qy, tz = az - d * qz; const l = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
    out[0] = tx / l; out[1] = ty / l; out[2] = tz / l;
  }
  const _ta = new Float64Array(3), _tb = new Float64Array(3);
  function paarRelativ(S, i, j, qx, qy, qz) {
    ankerTangente(S, i, qx, qy, qz, _ta); ankerTangente(S, j, qx, qy, qz, _tb);
    // Normale von i nach j: grad s_j − grad s_i (beide zeigen zu ihrem Anker)
    let nx = _tb[0] - _ta[0], ny = _tb[1] - _ta[1], nz = _tb[2] - _ta[2]; let nl = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (nl < 1e-9) { nx = -_ta[0]; ny = -_ta[1]; nz = -_ta[2]; nl = 1; }
    nx /= nl; ny /= nl; nz /= nl;
    const wx = S.pom[3 * i] - S.pom[3 * j], wy = S.pom[3 * i + 1] - S.pom[3 * j + 1], wz = S.pom[3 * i + 2] - S.pom[3 * j + 2];
    const vx = (wy * qz - wz * qy) * S.R, vy = (wz * qx - wx * qz) * S.R, vz = (wx * qy - wy * qx) * S.R;
    PR.c = vx * nx + vy * ny + vz * nz;
    const sx = qy * nz - qz * ny, sy = qz * nx - qx * nz, sz = qx * ny - qy * nx;
    PR.scher = Math.abs(vx * sx + vy * sy + vz * sz);
    PR.rate = Math.sqrt(vx * vx + vy * vy + vz * vz);
  }
  // Längs-Koordinate eines Paar-Rands (km): Breite um den relativen Euler-Pol E = ω_lo − ω_hi. Ihre Iso-Linien sind
  // Kleinkreise um E = parallel zur Relativbewegung — dort liegen Bruchzonen und Transform-Versätze.
  const LG = { laengs: 0, ok: false };
  function laengs(S, i, j, x, y, z) {
    const lo = i < j ? i : j, hi = i < j ? j : i;
    let Ex = S.pom[3 * lo] - S.pom[3 * hi], Ey = S.pom[3 * lo + 1] - S.pom[3 * hi + 1], Ez = S.pom[3 * lo + 2] - S.pom[3 * hi + 2];
    const El = Math.sqrt(Ex * Ex + Ey * Ey + Ez * Ez);
    if (El < 1e-12) { LG.ok = false; return; }
    LG.laengs = acosF((x * Ex + y * Ey + z * Ez) / El) * S.R;
    LG.ok = true;
  }

  function gdh1(a) { return a < 20 ? 2.6 + 0.365 * Math.sqrt(a > 0 ? a : 0) : 5.651 - 2.473 * kexp(-0.0278 * a); }

  function nahtTafel(S) {
    const plan = S.plan, nae = plan.naehte, n = nae.length / 8, A = new Float64Array(n), t = S.zeitMa, gS = plan.gS;
    for (let i = 0; i < n; i++) { const a = t - nae[8 * i + 4]; A[i] = a > 0 ? nae[8 * i + 5] * (1 - kexpS(-a / TAU_W)) * kexpS(-a / TAU_A) * gS : 0; }
    S.nahtAmp = A; return A;
  }

  // ── Der Punkt ───────────────────────────────────────────────────────────────────────────────────────────
  const PK = {
    hA: 0, hB: 0, kont: 0, kruste: 0, scholle: -1, platte: -1, nachbar: -1, randArt: 0, randAbstandKm: 1e9, randRateCmA: 0,
    ozeanAlterMa: 0, orogenStaerke: 0, orogenAlterMa: 0, orogenAktiv: 0, vulkanArt: 0, vulkanAbstandKm: 1e9, vulkanAlterMa: 0, vulkanId: -1, vulkanAktiv: 0, fK: 0,
  };
  // ── K5 über das Schlüsselbild: der Nachklang ──────────────────────────────────────────────────────────
  // Am Schlüsselbild t0 wechselt die Richtung jeder Platte; die Rand-Schablonen des neuen Abschnitts beginnen mit der Reife
  // 1 − e^(−1/τw), die alten erlöschen. Höhen-gleich wird der Übergang so: die Differenz Δ(p0) = h_alt(p0, t0) − h_neu(p0, t0)
  // zwischen dem Ende des alten und dem Beginn des neuen Abschnitts steht im RAHMEN DER PLATTE (p0 = der Ort zur Zeit t0, mit
  // der Platte zurückgedreht) und klingt über NACHKLANG_MA mit 1 − glatt(0, W, t − t0) aus. Bei t = t0 gilt h = h_alt exakt;
  // das Rand-Gedächtnis des neuen Abschnitts (Fächer, Nähte) übernimmt, wo der alte Rand weiterlebt. Kosten: im Fenster drei
  // Auswertungen je Punkt (gebunden an die Abfrage), außerhalb eine.
  const NACHKLANG_MA = 10;
  function nachklangVon(S) {
    const A = S.abschnitt, a = S.zeitMa - A.t0;
    if (S.b === 0 || a >= NACHKLANG_MA || S.bFest !== undefined) return null;
    const neu = scheibeKern(S.plan, A.t0, false), alt = scheibeKern(S.plan, A.t0, false, S.b - 1);
    return { neu, alt, w: 1 - glatt(0, NACHKLANG_MA, a), e: tempo(a / A.dauer) };
  }
  const PK_SCHLUESSEL = Object.keys(PK), PK_SICHER = Object.assign({}, PK);
  const _nkq = new Float64Array(4), _nkv = new Float64Array(3);
  function punktKern(S, x, y, z, fussKm, huelle) {
    const h = punktRoh(S, x, y, z, fussKm, huelle);
    let nk = S.nk; if (nk === undefined) nk = S.nk = nachklangVon(S);
    if (nk === null) return h;
    const A = S.abschnitt, i = PK.platte;
    for (let k = 0; k < PK_SCHLUESSEL.length; k++) PK_SICHER[PK_SCHLUESSEL[k]] = PK[PK_SCHLUESSEL[k]];
    qAchse(A.achse[3 * i], A.achse[3 * i + 1], A.achse[3 * i + 2], -A.winkel[i] * nk.e, _nkq, 0);
    qDreh(_nkq, 0, x, y, z, _nkv, 0);
    const vx = _nkv[0], vy = _nkv[1], vz = _nkv[2];
    const hAlt = punktRoh(nk.alt, vx, vy, vz, fussKm, huelle);
    const hNeu = punktRoh(nk.neu, vx, vy, vz, fussKm, huelle);
    for (let k = 0; k < PK_SCHLUESSEL.length; k++) PK[PK_SCHLUESSEL[k]] = PK_SICHER[PK_SCHLUESSEL[k]];
    PK.hA = h + nk.w * (hAlt - hNeu);
    return PK.hA;
  }
  function punktRoh(S, x, y, z, fussKm, huelle) {
    if (!(fussKm > 0)) throw new Error('planet: fussKm fehlt (K10)');
    const plan = S.plan, R = S.R, A = S.abschnitt, Q = S.Q, gS = plan.gS, k = plan.k, t = S.zeitMa;
    // 1 Kruste (unverzogen, im Schollen-Rahmen)
    const fK = krusteFeld(S, x, y, z, huelle ? 400 : fussKm, huelle);
    const gK = W_.fGrp, sB = KF.sBest;
    // 2 Platten-Wertung (verzogen)
    plattenWertung(S, x, y, z);
    const qx = W_.qx, qy = W_.qy, qz = W_.qz, sc = W_.sx; // Schablonen-Abstand: wahre Distanz, ohne den Krusten-Vorrang ×12 der Entscheidung (K5)
    let own = W_.best, sec = W_.zweit;
    const aufKruste = fK > Q - 0.05 && gK >= 0;
    if (aufKruste && own !== gK) { sec = own; own = gK; }
    // Versatz-Treppe des Rückens am Haupt-Paar
    let mHaupt = sec >= 0 ? Math.max(0, (sc[own] - sc[sec]) * 0.5 * R) : 1e9;
    if (sec >= 0 && mHaupt < 400) {
      paarRelativ(S, own, sec, qx, qy, qz);
      const div = PR.c < 0 ? Math.min(1, -PR.c / Math.max(PR.rate, 1e-6) * 1.6) : 0;
      if (div > 0) {
        laengs(S, own, sec, x, y, z);
        if (LG.ok) {
          const lo = own < sec ? own : sec, hi = own < sec ? sec : own;
          const pk = (S.b * 4096 + lo * 64 + hi) | 0;
          const L = 260 + 300 * planetZufall(k, 200, pk, 0);
          const uL = LG.laengs / L, idx = Math.floor(uL);
          // Stufe über die letzten 6 % des Abschnitts geglättet (K5: das Material gleitet längs des Rands durch die Treppe)
          const z0 = planetZufall(k, 201, pk, idx), z1 = planetZufall(k, 201, pk, idx + 1);
          const dlt = (z0 + (z1 - z0) * glatt(0.94, 1, uL - idx) - 0.5) * 2 * Math.min(80, 1.25 * Math.max(-S.paarC[own * S.nP + sec], 0)) * div; // Versatz ≤ 2,5 Ma Alter-Sprung je Seite
          const m2 = mHaupt + (own === lo ? dlt : -dlt);
          if (m2 < 0 && !aufKruste) { const t2 = own; own = sec; sec = t2; mHaupt = -m2; } else mHaupt = Math.max(0, m2);
        }
      }
    }
    PK.platte = own; PK.nachbar = sec;
    // 3 Ränder: Alter, Schablonen
    let invA = 0, hTpl = 0, hOro = 0, oroAlter = 0, randMin = 1e9, randArt = RAND_ART.innen, randRate = 0;
    let vAbst = 1e9, vArt = VULKAN_ART.keiner, vAlter = 0, vId = -1, vAktiv = 0, hKegel = 0;
    const ownKont = own < S.nG;
    const dCo = ownKont ? W_.dC[own] * R : 1e9;
    const wkI = ownKont ? 1 - glatt(500, 900, dCo) : 0;
    const kap = plan.koerper.bodenAlterMaxMa;
    const nb0 = S.nbStart[own], nb1 = S.nbStart[own + 1];
    const reife = S.reife; // 1 − e^(−Dauer/τw), je Scheibe fest
    for (let ii = nb0 - 1; ii < nb1; ii++) {
      const j = ii < nb0 ? sec : S.nbList[ii];
      if (j < 0 || j === own || (ii >= nb0 && j === sec)) continue;
      const xKm = j === sec ? mHaupt : Math.max(0, (sc[own] - sc[j]) * 0.5 * R);
      if (xKm > 5000) continue;
      // Alter mit der Öffnungs-Rate des PAARS (am Rand gemessen, je Scheibe fest): stetig im Raum;
      // bei Öffnung zwischen Kontinenten T_offen·d_R/(d_R + d_Rand) (K6)
      const offenPaar = Math.max(0, -S.paarC[own * S.nP + j]);
      let a = xKm / (offenPaar * 0.5 + 0.05);
      if (ownKont && j < S.nG) {
        const to = A.tOffen[own * A.nG + j];
        if (to > -1e8) {
          // K6 nur ZWISCHEN den getrennten Kontinenten: dort ist Rücken-Abstand + Rand-Abstand die halbe Öffnung (hr·T).
          // Jenseits des eigenen Kontinents (x + d_Rand weit größer) gilt die Regel nicht — dort entscheiden andere Rücken.
          const T = Math.max(1, t - to), dR = Math.max(0, dCo), L = (offenPaar * 0.5 + 0.05) * T + 150;
          const wz = 1 - glatt(1.3 * L, 2.0 * L, xKm + dR);
          a = wz > 1e-3 ? (T * xKm / (xKm + dR + 1)) / wz : 1e6;
        }
      }
      if (a < 0.05) a = 0.05;
      const a2_ = a * a; invA += 1 / (a2_ * a2_);
      if (xKm > 1300 && xKm >= randMin) continue;
      // Relativbewegung am Punkt: nur wo eine Schablone wirkt oder der nächste Rand benannt wird
      paarRelativ(S, own, j, qx, qy, qz);
      const c = PR.c, rate = PR.rate;
      const offen = c < 0 ? -c : 0, konv = c > 0 ? c : 0;
      if (xKm < randMin) {
        randMin = xKm; randRate = rate;
        randArt = konv > 0.35 * rate && konv > 2 ? RAND_ART.konvergent : (offen > 0.35 * rate && offen > 2 ? RAND_ART.divergent : (rate > 2 ? RAND_ART.transform : RAND_ART.innen));
      }
      if (xKm > 1300) continue;
      const jKont = j < S.nG;
      const dCj = jKont ? W_.dC[j] * R - xKm : 1e9;
      const wkJ = jKont ? 1 - glatt(500, 900, dCj) : 0;
      if (konv > 0.5) {
        const s = Math.min(1.6, konv / 25) * reife * gS;
        const wa = wkI * wkJ, wb = wkI * (1 - wkJ), wc = (1 - wkI) * wkJ, wd = (1 - wkI) * (1 - wkJ);
        let sub = 0; // Ozean/Ozean: welche Seite taucht ab (Paar-Hash)
        if (wd > 0) { const lo = own < j ? own : j; sub = planetZufall(k, 210, S.b * 4096 + lo * 64 + (own < j ? j : own), 0) < 0.5 ? lo : (own < j ? j : own); }
        const grat = (wa + wb + wd > 0.05 && xKm < 700) ? 0.62 + 0.38 * gratKm(k ^ 0x3c6ef372, x, y, z, R, 210) : 1;
        let oro = 0;
        // Anden-Bogen: knapp landein der Küste — die Küste liegt eine Schürze (K3) hinter dem Graben
        const xAnden = ownKont ? A.schuerze[own] * R + 300 : 195;
        if (wa > 0) { oro += wa * 5.0 * s * gauss(xKm - 110, 200) * grat; hTpl -= wa * 0.35 * s * gauss(xKm - 440, 120); }
        if (wb > 0) oro += wb * 4.4 * s * gauss(xKm - xAnden, 85) * grat;
        if (wc > 0) hTpl += wc * (-3.0 * s * gauss(xKm - 40, 45) + 0.25 * s * gauss(xKm - 170, 70));
        if (wd > 0) {
          if (sub === own) hTpl += wd * (-3.0 * s * gauss(xKm - 40, 45) + 0.25 * s * gauss(xKm - 170, 70));
          else oro += wd * 3.2 * s * gauss(xKm - 190, 55) * grat;
        }
        if (oro > hOro) { hOro = oro; oroAlter = t - A.t0; }
        // Bogen-Kegel im Takt ~70 km, 150–300 km hinter dem Graben
        const wInsel = sub !== own ? wd : 0, wBogen = wb + wInsel;
        const xBogen = wBogen > 0 ? (wb * xAnden + wInsel * 190) / wBogen : 190;
        if (!huelle && wBogen > 0.3 && Math.abs(xKm - xBogen) < 90 && s > 0.08 && konv > 0.35 * rate) { // Kegel nur, wo der Rand vor allem schließt
          laengs(S, own, j, x, y, z);
          if (LG.ok) {
            const lo = own < j ? own : j, hi = own < j ? j : own, pk = (S.b * 4096 + lo * 64 + hi) | 0;
            const i0 = Math.floor(LG.laengs / 70);
            for (let kk = i0 - 1; kk <= i0 + 1; kk++) {
              const h1 = planetZufall(k, 220, pk, kk), h2 = planetZufall(k, 221, pk, kk), h3 = planetZufall(k, 222, pk, kk);
              if (h3 < 0.1) continue;
              const uc = (kk + 0.2 + 0.6 * h1) * 70, xc = xBogen - 50 + 100 * h2;
              const du = LG.laengs - uc, dx = xKm - xc, d = Math.sqrt(du * du + dx * dx);
              // K5: die Höhe geht an jedem Tor (wBogen, s, konv/rate) stetig gegen 0 — kein Kegel springt in die Welt
              if (d < 26) { hKegel = Math.max(hKegel, (1.2 + 1.8 * h3) * Math.min(1, s) * wBogen * (1 - d / 26) * gS * glatt(0.3, 0.45, wBogen) * glatt(0.08, 0.12, s) * glatt(0.35, 0.45, konv / rate)); }
              if (d < vAbst) { vAbst = d; vArt = VULKAN_ART.bogen; vAlter = 0; vId = pk * 100000 + (kk + 50000); vAktiv = s * wBogen > 0.12 ? 1 : 0; }
            }
          }
        }
      }
      if (offen > 0.5) {
        const dv = Math.min(1, offen / 20);
        if (wkI * wkJ > 0 && xKm < 700) hTpl += wkI * wkJ * (-1.2 * dv * kexpS(-xKm / 130));
        if (!huelle && (1 - wkI) > 0 && xKm < 250) hTpl += (1 - wkI) * dv * (-0.35 * kexpS(-xKm / 14) + 0.35 * kexpS(-xKm / 60) * (gratKm(k ^ 0x1b873593, x, y, z, R, 90) - 0.45));
        // Rift-Vulkane (Spalten): auf zerreißender Kruste, längs der Achse im Takt ~70 km
        const wRift = wkI * wkJ;
        if (!huelle && wRift > 0.3 && xKm < 90 && offen > 0.35 * rate) {
          laengs(S, own, j, x, y, z);
          if (LG.ok) {
            const lo = own < j ? own : j, hi = own < j ? j : own, pk = (S.b * 4096 + lo * 64 + hi) | 0;
            const i0 = Math.floor(LG.laengs / 70);
            for (let kk = i0 - 1; kk <= i0 + 1; kk++) {
              const h1 = planetZufall(k, 230, pk, kk), h2 = planetZufall(k, 231, pk, kk), h3 = planetZufall(k, 232, pk, kk);
              if (h3 < 0.3) continue;
              const du = LG.laengs - (kk + 0.2 + 0.6 * h1) * 70, dx = xKm - (15 + 50 * h2), d = Math.sqrt(du * du + dx * dx);
              if (d < 20) hKegel = Math.max(hKegel, (0.8 + 1.6 * h3) * dv * wRift * (1 - d / 20) * gS * glatt(0.3, 0.45, wRift) * glatt(0.35, 0.45, offen / rate));
              if (d < vAbst) { vAbst = d; vArt = VULKAN_ART.ruecken; vAlter = 0; vId = -(pk * 100000 + (kk + 50000)) - 2; vAktiv = dv * wRift > 0.15 ? 1 : 0; }
            }
          }
        }
      }
      const tr = Math.min(1, PR.scher / 30) * (1 - Math.min(1, Math.abs(c) / Math.max(PR.scher, 1e-3)));
      if (tr > 0.05 && xKm < 200) hTpl += (1 - wkI) * (-0.6 * tr * kexpS(-xKm / 45));
    }
    let alter = invA > 0 ? 1 / Math.sqrt(Math.sqrt(invA)) : 1e6;
    { const r = alter / kap, r2 = r * r; alter = alter / Math.sqrt(Math.sqrt(1 + r2 * r2)); }
    // 4 Ozean-Boden
    let oz = -gdh1(alter);
    if (!huelle) oz += 0.08 * fbmKm(k ^ 0x68e31da4, x, y, z, R, 130, Math.max(32, 2 * fussKm), 0.5) * glatt(0, 12, alter);
    // 5 Krusten-Profil: Hang → Schelf → innen (K7: Kontinent relativ zum Bezugs-Spiegel)
    const S1 = glatt(Q - 0.05, Q, fK), S2 = glatt(Q + RAMPE0, Q + RAMPE1, fK);
    let tafel = 0;
    if (S2 > 0 && sB >= 0 && KF.sIn[sB]) {
      const lx = KF.sLx[3 * sB], ly = KF.sLx[3 * sB + 1], lz = KF.sLx[3 * sB + 2];
      tafel = 0.3 * fbmKm((plan.schollen[8 * sB + 5] | 0) + 91, lx, ly, lz, R, 1400, huelle ? 1400 : 600, 0.5);
    }
    const fb = plan.koerper.freibordKm, sd = plan.koerper.shelfKm;
    let hA = oz * (1 - S1) + S1 * (1 - S2) * (-sd) + S2 * (fb + tafel);
    const hB = S1;
    // 6 Gedächtnis im Schollen-Rahmen: Nähte und erloschene Ränder (K4), Trapps
    let hMem = 0, memAlter = 0;
    if (S1 > 0) {
      const NJ = naehteJeScholle(plan), TG = tangentenJeScholle(plan), nae = plan.naehte;
      for (let s = 0; s < S.nS; s++) {
        if (!KF.sIn[s]) continue;
        const f = KF.sF[s]; if (f < Q - 0.3) continue;
        const lx = KF.sLx[3 * s], ly = KF.sLx[3 * s + 1], lz = KF.sLx[3 * s + 2];
        const mx = plan.schollen[8 * s], my = plan.schollen[8 * s + 1], mz = plan.schollen[8 * s + 2], rs = S.sr[s];
        const az = atan2F(lx * TG[6 * s + 3] + ly * TG[6 * s + 4] + lz * TG[6 * s + 5], lx * TG[6 * s] + ly * TG[6 * s + 1] + lz * TG[6 * s + 2]);
        const ang = acosF(lx * mx + ly * my + lz * mz);
        for (let ii = NJ.start[s]; ii < NJ.start[s + 1]; ii++) {
          const n = NJ.liste[ii] * 8, tn = nae[n + 4]; const a = t - tn; if (a <= 0) continue;
          let dz = az - nae[n + 2]; if (dz > PI) dz -= TAU; if (dz < -PI) dz += TAU;
          const halb = nae[n + 3]; const wz = 1 - glatt(halb * 0.6, halb, Math.abs(dz)); if (wz <= 0) continue;
          // Höhe der Naht ist je Scheibe fest (a = t − t_Naht): Tafel, dieselbe Formel, dieselben Bytes
          const NA = S.nahtAmp || nahtTafel(S), H = NA[NJ.liste[ii]];
          if (H * wz <= hMem) continue;                                   // gauss ≤ 1: kann hMem nicht überbieten
          const breite = nae[n + 6] * (1 + a / 300);
          const quer = (ang - nae[n + 7] * rs) * R;
          const h = H * wz * gauss(quer, breite);
          if (h > hMem) { hMem = h; memAlter = a; }
        }
        // erloschene aktive Ränder: 32 Fächer, linear zwischen Fächern
        const fpos = (az < 0 ? az + TAU : az) / TAU * 32 - 0.5;
        const f0 = Math.floor(fpos), fr = fpos - f0;
        let hR = 0, aR = 0;
        for (let q2 = 0; q2 < 2; q2++) {
          const fi = ((f0 + q2) % 32 + 32) % 32, wgt = q2 ? fr : 1 - fr;
          const tEnd = A.rand[2 * (s * 32 + fi)], H0 = A.rand[2 * (s * 32 + fi) + 1];
          if (H0 <= 0 || tEnd > t + 1e-3) continue;               // tEnd ist Float32: am Schlüsselbild selbst gilt das Gedächtnis schon
          const a = t > tEnd ? t - tEnd : 0; const innenKm = (f - Q) * rs * R; // landein ab der Krusten-Kante (folgt der rauen Küste)
          hR += wgt * H0 * kexpS(-a / TAU_A) * gauss(innenKm - 300, 85 * (1 + a / 200)); aR = a;
        }
        if (hR > hMem) { hMem = hR; memAlter = aR; }
      }
      if (sB >= 0 && KF.sIn[sB]) {
        const E = plan.ereignisse;
        for (let e = 0; e < plan.nE; e++) {
          if (E[6 * e] !== sB) continue; const a = t - E[6 * e + 4]; if (a < 0 || a > 400) continue;
          const pk = E[6 * e + 5], rad = Math.floor(pk / 1000), st = pk - rad * 1000;
          const d = acosF(KF.sLx[3 * sB] * E[6 * e + 1] + KF.sLx[3 * sB + 1] * E[6 * e + 2] + KF.sLx[3 * sB + 2] * E[6 * e + 3]) * R;
          const wv = 1 - glatt(rad * 0.35, rad, d); if (wv <= 0) continue;
          hTpl += S1 * wv * st * kexpS(-a / 150) * gS * glatt(0, 1, a);   // K5: der Trapp baut sich über 1 Ma auf (gesetzt)
          if (a < 2 && d < vAbst) { vAbst = d; vArt = VULKAN_ART.trapp; vAlter = a; vId = 900000000 + e; vAktiv = 1; }
        }
      }
    }
    const hGeb = Math.max(hOro, hMem);
    // 7 Hotspot-Ketten (Kegel, über Kontinent Dom) — die Hülle trägt keine Kegel und liest keinen Vulkan: dort entfällt die Schleife
    if (S.kettenIdx && !huelle) {
      const K = S.ketten, KP = S.kettenKap, cos300 = S.kettenCos;
      const sig = 30 + 90 * S1, ozeanisch = 1 - S1;
      for (let q2 = 0; q2 < S.kettenIdx.length; q2++) {
        const h = S.kettenIdx[q2];
        if (x * KP[4 * q2] + y * KP[4 * q2 + 1] + z * KP[4 * q2 + 2] < KP[4 * q2 + 3]) continue;
        const st = plan.hotspots[6 * h + 5];
        for (let kk = 0; kk < 24; kk++) {
          const ii = (q2 * 24 + kk) * 4; const tau = K[ii + 3]; if (tau < 0) continue;
          const dd = x * K[ii] + y * K[ii + 1] + z * K[ii + 2]; if (dd < cos300) continue; // 300 km, in km gemessen
          const d = acosF(dd) * R;
          if (!huelle && d < 3.5 * sig) {
            const KA = S.kettenAmp, ia = (q2 * 24 + kk) * 2;
            const hh = st * (4.2 * ozeanisch * KA[ia] + 0.6 * S1 * KA[ia + 1]) * gauss(d, sig) * gS;
            if (hh > hKegel) hKegel = hh;
          }
          if (d < vAbst) { vAbst = d; vArt = VULKAN_ART.hotspot; vAlter = tau; vId = 800000000 + h * 10000 + (S.kettenG0 - kk + 5000); vAktiv = tau < 3.5 && plan.hotspots[6 * h + 4] >= t ? 1 : 0; }
        }
      }
    }
    hA += hTpl + hGeb + hKegel;
    PK.hA = hA; PK.hB = hB; PK.fK = fK;
    PK.kruste = S2 > 0.5 ? KRUSTE.kontinent : (S1 > 0.5 ? KRUSTE.schelf : (S1 > 0 ? KRUSTE.hang : KRUSTE.ozean));
    PK.scholle = S1 > 0 ? sB : -1;
    PK.randArt = randArt; PK.randAbstandKm = randMin; PK.randRateCmA = randRate / 10;
    PK.ozeanAlterMa = alter; PK.orogenStaerke = Math.min(1, hGeb / 5); PK.orogenAlterMa = hMem > hOro ? memAlter : oroAlter;
    PK.orogenAktiv = hOro >= hMem && hOro > 0.2 ? 1 : 0;
    PK.vulkanArt = vArt; PK.vulkanAbstandKm = vAbst; PK.vulkanAlterMa = vAlter; PK.vulkanId = vId; PK.vulkanAktiv = vAktiv;
    PK.kont = (fK - S.kuesteF) * (sB >= 0 ? S.sr[sB] : 0.2) * R;
    return hA;
  }

  // ── Meer (K7) ───────────────────────────────────────────────────────────────────────────────────────────
  function meerLoesen(a, bw, n, wasser, sigRef) { // Σ max(0, σ − (a + b·σRef)) / n = wasser; bei sigRef === null: Bezugs-Lösung
    let lo = -15, hi = 15;
    for (let it = 0; it < 64; it++) {
      const m = 0.5 * (lo + hi); let v = 0;
      if (sigRef === null) { for (let i = 0; i < n; i++) { const d = m * (1 - bw[i]) - a[i]; if (d > 0) v += d; } }
      else { for (let i = 0; i < n; i++) { const d = m - (a[i] + bw[i] * sigRef); if (d > 0) v += d; } }
      if (v / n > wasser) hi = m; else lo = m;
    }
    return 0.5 * (lo + hi);
  }
  function hueleProben(plan, t) {
    const M = memoVon(plan);
    if (M.proben.has(t)) return M.proben.get(t);
    const S = scheibeKern(plan, t, false), N = 4096, F = fib(N);
    const a = new Float64Array(N), bw = new Float64Array(N), al = new Float64Array(N);
    for (let i = 0; i < N; i++) { punktKern(S, F[3 * i], F[3 * i + 1], F[3 * i + 2], 400, true); a[i] = PK.hA; bw[i] = PK.hB; al[i] = PK.ozeanAlterMa; }
    const r = { a, bw, al, N };
    if (M.proben.size > 48) M.proben.delete(M.proben.keys().next().value);
    M.proben.set(t, r); return r;
  }
  function klemmZeit(plan, t) { const lo = plan.bilder[0], hi = plan.bilder[plan.nB - 1]; return t < lo ? lo : (t > hi ? hi : t); }
  // Selbst-Spiegel eines Fachs: Kontinent-Niveau = eigener Spiegel + Freibord
  function sigmaSelbst(plan, tf) {
    const M = memoVon(plan);
    if (M.meerRef.has(tf)) return M.meerRef.get(tf);
    const P = hueleProben(plan, tf); const s = meerLoesen(P.a, P.bw, P.N, plan.koerper.wasserKm, null);
    M.meerRef.set(tf, s); return s;
  }
  // Bezugs-Spiegel (Erosionsbasis): Mittel des Selbst-Spiegels über die letzten 100 Ma, 20-Ma-Stützen, linear dazwischen
  function sigmaRef(plan, t) {
    const f0 = Math.floor(t / 20) * 20, u = (t - f0) / 20;
    const r = (f) => { let s = 0; for (let i = 0; i < 5; i++) s += sigmaSelbst(plan, klemmZeit(plan, f - 20 * i)); return s / 5; };
    const r0 = r(f0); return u > 0 ? r0 + u * (r(f0 + 20) - r0) : r0;
  }
  function meerFach(plan, tf, zusatz) {
    const M = memoVon(plan), key = tf + '|' + zusatz;
    if (M.meerBin.has(key)) return M.meerBin.get(key);
    const sr = sigmaRef(plan, tf);
    const P = hueleProben(plan, tf);
    // K7 + Eis: das Gleichgewichts-Eis der Zeit (Land polwärts der Eis-Linie der Energiebilanz, über dem eisfreien Spiegel)
    // bindet EIS_DICKE_KM · ρ_Eis/ρ_Wasser Wasser je Fläche; der Spiegel der Zeit löst das übrige Volumen (eine Stufe, kein Fixpunkt).
    const s0 = meerLoesen(P.a, P.bw, P.N, plan.koerper.wasserKm + zusatz, sr);
    const G = planetKlimaGlobal(plan, tf), F = fib(P.N), sEis = G.eisBreite >= HALBPI ? 2 : ksin(G.eisBreite);
    let eisN = 0;
    for (let i = 0; i < P.N; i++) { const y = F[3 * i + 1]; if ((y < 0 ? -y : y) > sEis && P.a[i] + P.bw[i] * sr - s0 > 0) eisN++; }
    const eisKm = eisN / P.N * EIS_DICKE_KM * EIS_RHO;
    const s = meerLoesen(P.a, P.bw, P.N, plan.koerper.wasserKm + zusatz - eisKm, sr);
    let land = 0, alt = 0, no = 0;
    for (let i = 0; i < P.N; i++) { const h = P.a[i] + P.bw[i] * sr - s; if (h > 0) land++; else if (P.bw[i] < 0.5) { alt += P.al[i]; no++; } }
    const r = { sigma: s, landAnteil: land / P.N, ozeanAlterMa: no ? alt / no : 0, eisKm, eisFlaeche: eisN / P.N };
    M.meerBin.set(key, r); return r;
  }
  function planetMeer(plan, zeitMa, zusatzWasserKm) {
    const z = zusatzWasserKm || 0;
    abschnittIndex(plan, zeitMa);
    const B = plan.bilder, lo = B[0], hi = B[plan.nB - 1];
    let f0 = Math.floor(zeitMa / 10) * 10; if (f0 < lo) f0 = lo; let f1 = f0 + 10; if (f1 > hi) f1 = hi; if (f0 > hi) f0 = hi;
    const A0 = meerFach(plan, f0, z), A1 = f1 !== f0 ? meerFach(plan, f1, z) : A0;
    const u = f1 !== f0 ? (zeitMa - f0) / (f1 - f0) : 0;
    const sig = A0.sigma + u * (A1.sigma - A0.sigma);
    const sr = sigmaRef(plan, zeitMa);
    return { meerKm: sig - sr, sigmaKm: sig, refKm: sr, landAnteil: A0.landAnteil + u * (A1.landAnteil - A0.landAnteil),
      ozeanAlterMa: A0.ozeanAlterMa + u * (A1.ozeanAlterMa - A0.ozeanAlterMa), eisKm: A0.eisKm + u * (A1.eisKm - A0.eisKm),
      eisFlaeche: A0.eisFlaeche + u * (A1.eisFlaeche - A0.eisFlaeche) };
  }

  function planetScheibe(plan, zeitMa) {
    if (!plan || !plan.lage) throw new Error('planetScheibe: plan fehlt (K10)');
    const S = scheibeKern(plan, zeitMa, false);
    if (S.meerFertig) return S;
    const m = planetMeer(plan, zeitMa, 0);
    S.meerKm = m.meerKm; S.sigmaKm = m.sigmaKm; S.refKm = m.refKm; S.eisKm = m.eisKm; S.landAnteil = m.landAnteil; S.ozeanAlterMittel = m.ozeanAlterMa;
    // Krustenfeld-Wert der Küste: wo die innen-Rampe den Spiegel der Zeit kreuzt
    const fb = plan.koerper.freibordKm, sd = plan.koerper.shelfKm, ziel = (sd + S.meerKm) / (sd + fb);
    let lo = 0, hi = 1; for (let i = 0; i < 40; i++) { const mm = 0.5 * (lo + hi); if (mm * mm * (3 - 2 * mm) < ziel) lo = mm; else hi = mm; }
    S.kuesteF = S.Q + RAMPE0 + (RAMPE1 - RAMPE0) * Math.max(0, Math.min(1, 0.5 * (lo + hi)));
    S.meerFertig = true;
    return S;
  }

  function punktSchreiben(S, aus) {
    const o = aus || {};
    const hKm = PK.hA + PK.hB * S.refKm - S.sigmaKm;
    o.hoeheKm = hKm; o.hoeheM = hKm * 1000; o.kont = PK.kont; o.kruste = PK.kruste; o.scholle = PK.scholle; o.platte = PK.platte; o.nachbar = PK.nachbar;
    o.randArt = PK.randArt; o.randAbstandKm = PK.randAbstandKm; o.randRateCmA = PK.randRateCmA; o.ozeanAlterMa = PK.ozeanAlterMa;
    o.orogenStaerke = PK.orogenStaerke; o.orogenAlterMa = PK.orogenAlterMa; o.orogenAktiv = PK.orogenAktiv; o.vulkanArt = PK.vulkanArt; o.vulkanAbstandKm = PK.vulkanAbstandKm;
    o.vulkanAlterMa = PK.vulkanAlterMa; o.vulkanId = PK.vulkanId; o.vulkanAktiv = PK.vulkanAktiv;
    return o;
  }
  function pruefScheibe(S) { if (!S || !S.meerFertig) throw new Error('planet: Scheibe fehlt oder ohne Meer (planetScheibe benutzen, K10)'); }
  function planetPunktR(S, x, y, z, fussKm, aus) {
    pruefScheibe(S);
    punktKern(S, x, y, z, fussKm, false);
    const h = PK.hA + PK.hB * S.refKm - S.sigmaKm;
    if (aus) punktSchreiben(S, aus);
    return h * 1000;
  }
  function planetRichtung(breite, laenge, aus3) {
    const o = aus3 || new Float64Array(3), cb = kcos(breite);
    o[0] = cb * kcos(laenge); o[1] = ksin(breite); o[2] = cb * ksin(laenge); return o;
  }
  function planetBreiteLaenge(x, y, z, aus2) {
    const o = aus2 || new Float64Array(2); o[0] = katan2(y, Math.sqrt(x * x + z * z)); o[1] = katan2(z, x); return o;
  }
  const _r3 = new Float64Array(3);
  function planetPunkt(S, breite, laenge, fussKm, aus) { planetRichtung(breite, laenge, _r3); return planetPunktR(S, _r3[0], _r3[1], _r3[2], fussKm, aus); }
  function planetHuelle(S, x, y, z) { pruefScheibe(S); punktKern(S, x, y, z, 400, true); return PK.hA + PK.hB * S.refKm - S.sigmaKm; }

  // ── Vulkane: Abtastung der Kappe im Takt der Kegel, eindeutig je Kegel-Id ──────────────────────────────
  function planetVulkane(S, breite, laenge, radiusKm, aus) {
    pruefScheibe(S);
    const R = S.R, liste = aus || []; liste.length = 0;
    const c = planetRichtung(breite, laenge, new Float64Array(3));
    const schritt = 22, gesehen = new Map();
    const rad = Math.min(PI, radiusKm / R), cosR = kcos(rad);
    const nB = Math.max(1, Math.ceil(PI * R / schritt));
    const P = {};
    for (let i = 0; i <= nB; i++) {
      const phi = -HALBPI + PI * i / nB, cp = kcos(phi), sp = ksin(phi);
      const nL = Math.max(1, Math.ceil(TAU * R * cp / schritt));
      for (let j = 0; j < nL; j++) {
        const lam = -PI + TAU * j / nL, x = cp * kcos(lam), z = cp * ksin(lam), y = sp;
        if (x * c[0] + y * c[1] + z * c[2] < cosR) continue;
        planetPunktR(S, x, y, z, 40, P);
        if (P.vulkanArt === VULKAN_ART.keiner || P.vulkanAbstandKm > schritt * 0.75) continue;
        const alt = gesehen.get(P.vulkanId);
        if (!alt || P.vulkanAbstandKm < alt.d) gesehen.set(P.vulkanId, { d: P.vulkanAbstandKm, breite: phi, laenge: lam, art: P.vulkanArt, hoeheKm: P.hoeheKm, alterMa: P.vulkanAlterMa, aktiv: P.vulkanAktiv });
      }
    }
    const ids = [...gesehen.keys()].sort((a, b) => a - b);
    for (const id of ids) { const v = gesehen.get(id); liste.push({ id, breite: v.breite, laenge: v.laenge, art: v.art, hoeheKm: v.hoeheKm, alterMa: v.alterMa, aktiv: v.aktiv, foerderKm3Ma: v.aktiv ? (v.art === VULKAN_ART.hotspot ? 8 : 0.6) : 0 }); }
    return liste.length;
  }

  // ── Karte (equirektangulär, Nord oben) ─────────────────────────────────────────────────────────────────
  function farbeRampe(stopps, v, out, o) {
    if (v <= stopps[0]) { out[o] = stopps[1]; out[o + 1] = stopps[2]; out[o + 2] = stopps[3]; return; }
    for (let i = 4; i < stopps.length; i += 4) {
      if (v <= stopps[i]) { const u = (v - stopps[i - 4]) / (stopps[i] - stopps[i - 4]); for (let c = 0; c < 3; c++) out[o + c] = stopps[i - 3 + c] + u * (stopps[i + 1 + c] - stopps[i - 3 + c]); return; }
    }
    const n = stopps.length - 4; out[o] = stopps[n + 1]; out[o + 1] = stopps[n + 2]; out[o + 2] = stopps[n + 3];
  }
  const LAND = [0, 86, 130, 66, 0.25, 112, 150, 78, 0.7, 168, 166, 104, 1.4, 150, 118, 78, 2.4, 128, 104, 88, 3.4, 168, 160, 152, 4.6, 246, 246, 246];
  const MEER = [-9, 4, 8, 34, -7, 8, 18, 60, -5.6, 14, 36, 92, -4.6, 22, 58, 128, -3.4, 40, 96, 168, -2.4, 64, 132, 196, -0.6, 92, 170, 214, 0, 140, 204, 224];
  const ALTER = [0, 220, 40, 40, 15, 240, 140, 40, 40, 230, 220, 70, 70, 90, 190, 90, 110, 50, 170, 200, 150, 50, 90, 200, 200, 110, 50, 160];
  function planetKarte(S, breitePx, schicht, ziel) {
    pruefScheibe(S);
    const W = breitePx | 0, H = W >> 1; if (W < 8) throw new Error('planetKarte: breitePx zu klein');
    if (!(schicht in SCHICHT)) throw new Error('planetKarte: Schicht "' + schicht + '" ist nicht gebaut');
    const R = S.R, fuss = TAU * R / W, klima = SCHICHT[schicht] >= SCHICHT.biom;
    const hoehe = new Float32Array(W * H), platte = new Int16Array(W * H), art = new Uint8Array(W * H), alter = new Float32Array(W * H), vul = new Uint8Array(W * H);
    const kT = klima ? new Float32Array(W * H) : null, kS = klima ? new Float32Array(W * H) : null, kN = klima ? new Float32Array(W * H) : null, kK = klima ? new Int8Array(W * H) : null;
    const cl = new Float64Array(W), sl = new Float64Array(W);
    for (let i = 0; i < W; i++) { const lam = -PI + TAU * (i + 0.5) / W; cl[i] = kcos(lam); sl[i] = ksin(lam); }
    const P = {}, K = {}, Bi = {};
    for (let r = 0; r < H; r++) {
      const phi = HALBPI - PI * (r + 0.5) / H, cp = kcos(phi), sp = ksin(phi);
      for (let i = 0; i < W; i++) {
        const idx = r * W + i, x = cp * cl[i], z = cp * sl[i];
        hoehe[idx] = planetPunktR(S, x, sp, z, fuss, P);
        platte[idx] = P.platte; art[idx] = P.randArt; alter[idx] = P.ozeanAlterMa; vul[idx] = P.vulkanAktiv && P.vulkanAbstandKm < fuss * 0.8 ? 1 : 0;
        if (klima) {
          planetKlimaR(S, x, sp, z, -1, K, P); planetBiom(K, P.hoeheM, Bi);
          kT[idx] = K.tJahrC; kS[idx] = K.tSommerC; kN[idx] = K.niederschlagMm; kK[idx] = Bi.koeppen;
        }
      }
    }
    const out = ziel || new Uint8Array(W * H * 3);
    const f = new Float64Array(3);
    for (let r = 0; r < H; r++) {
      const phi = HALBPI - PI * (r + 0.5) / H, dxKm = fuss * Math.max(0.05, kcos(phi)), dyKm = fuss;
      for (let i = 0; i < W; i++) {
        const idx = r * W + i, h = hoehe[idx] / 1000;
        const hl = hoehe[r * W + (i + W - 1) % W] / 1000, hr = hoehe[r * W + (i + 1) % W] / 1000;
        const hu = hoehe[Math.max(0, r - 1) * W + i] / 1000, hd = hoehe[Math.min(H - 1, r + 1) * W + i] / 1000;
        const ueb = h > 0 ? 28 : 10;
        const gx = (hr - hl) / (2 * dxKm) * ueb, gy = (hd - hu) / (2 * dyKm) * ueb;
        // Licht aus Nordwest, 45°
        let sh = (gx * 0.5 + gy * -0.5 + 0.7071) / Math.sqrt(1 + gx * gx + gy * gy) / 0.7071; sh = Math.max(0.25, Math.min(1.35, sh));
        if (schicht === 'relief') {
          if (h > 0) farbeRampe(LAND, h, f, 0); else farbeRampe(MEER, h, f, 0);
          const s2 = h > 0 ? sh : 0.75 + 0.25 * sh;
          for (let c = 0; c < 3; c++) f[c] *= s2;
          if (vul[idx] && h > -2) { f[0] = 230; f[1] = 70; f[2] = 20; }
        } else if (schicht === 'platten') {
          const p = platte[idx], hu2 = planetZufall(0x9e3779b9, 300, p + 1, S.b), base = h > 0 ? 200 : 120;
          f[0] = base * (0.45 + 0.55 * hu2); f[1] = base * (0.45 + 0.55 * planetZufall(0x9e3779b9, 301, p + 1, S.b)); f[2] = base * (0.45 + 0.55 * planetZufall(0x9e3779b9, 302, p + 1, S.b));
          for (let c = 0; c < 3; c++) f[c] *= 0.7 + 0.3 * sh;
          const grenze = platte[r * W + (i + 1) % W] !== p || platte[Math.min(H - 1, r + 1) * W + i] !== p;
          if (grenze) { const a = art[idx]; if (a === RAND_ART.konvergent) { f[0] = 230; f[1] = 30; f[2] = 30; } else if (a === RAND_ART.divergent) { f[0] = 250; f[1] = 250; f[2] = 250; } else if (a === RAND_ART.transform) { f[0] = 250; f[1] = 220; f[2] = 0; } else { f[0] = 40; f[1] = 40; f[2] = 40; } }
          const kueste = (h > 0) !== (hoehe[r * W + (i + 1) % W] > 0) || (h > 0) !== (hoehe[Math.min(H - 1, r + 1) * W + i] > 0);
          if (kueste && !grenze) { f[0] = 20; f[1] = 20; f[2] = 20; }
          if (vul[idx]) { f[0] = 255; f[1] = 120; f[2] = 0; }
        } else if (schicht === 'biom') {
          if (h > 0) { biomFarbe(kT[idx], kS[idx], kN[idx], f); for (let c = 0; c < 3; c++) f[c] *= sh; }
          else {
            const tief = glatt(-0.2, -4.5, h); f[0] = 34 + (8 - 34) * tief; f[1] = 78 + (22 - 78) * tief; f[2] = 118 + (58 - 118) * tief;
            const eis = glatt(-4, -9, kT[idx]); f[0] += (232 - f[0]) * eis; f[1] += (238 - f[1]) * eis; f[2] += (244 - f[2]) * eis;
            for (let c = 0; c < 3; c++) f[c] *= 0.85 + 0.15 * sh;
          }
        } else if (schicht === 'temperatur') {
          farbeRampe(TEMP_RAMPE, kT[idx], f, 0); for (let c = 0; c < 3; c++) f[c] *= h > 0 ? 0.55 + 0.45 * sh : 0.82;
        } else if (schicht === 'niederschlag') {
          farbeRampe(NIED_RAMPE, Math.sqrt(kN[idx] > 0 ? kN[idx] : 0), f, 0); for (let c = 0; c < 3; c++) f[c] *= h > 0 ? 0.55 + 0.45 * sh : 0.7;
        } else if (schicht === 'koeppen') {
          const kc = kK[idx];
          if (kc >= 0) { f[0] = KOEPPEN_FARBE[3 * kc]; f[1] = KOEPPEN_FARBE[3 * kc + 1]; f[2] = KOEPPEN_FARBE[3 * kc + 2]; for (let c = 0; c < 3; c++) f[c] *= 0.7 + 0.3 * sh; }
          else { const eis = kT[idx] < -6; f[0] = eis ? 225 : 22; f[1] = eis ? 232 : 34; f[2] = eis ? 240 : 64; }
        } else {
          if (h > 0 || platte[idx] < 0) { const g = 150 * sh; f[0] = g; f[1] = g; f[2] = g; }
          else { farbeRampe(ALTER, alter[idx], f, 0); for (let c = 0; c < 3; c++) f[c] *= 0.8 + 0.2 * sh; }
        }
        const o = idx * 3;
        out[o] = Math.max(0, Math.min(255, Math.floor(f[0] + 0.5))); out[o + 1] = Math.max(0, Math.min(255, Math.floor(f[1] + 0.5))); out[o + 2] = Math.max(0, Math.min(255, Math.floor(f[2] + 0.5)));
      }
    }
    return out;
  }

  // ── bau2: Klima und Biome — Leser derselben Punkt-Abfrage ─────────────────────────────────────────────────
  // Global: Energiebilanz T(x) = T0 + T2·P2(x), x = sin φ (North 1975, zwei Moden), Eis-Albedo über der Eis-Linie (Fixpunkt vom
  // eisfreien Ast), Sternfluss nach Gough 1981, Zell-Breite nach Held & Hou 1980 aus der Drehung. Ort: Höhe (−6,5 K/km über dem Meer
  // der Zeit), Kontinentalität aus dem glatten Krustenfeld (PK.kont, ohne Suche), Feuchte durch sechs Schritte luvwärts auf
  // planetHuelle, Regenschatten e^(−Δh/1,5 km), Luv-Hub, Gürtel wandern mit der Deklination (über Land weiter: Monsun),
  // Meeresströmung als Lesart der Küstenseite je Breite. Alle Koeffizienten unten sind GESETZT (Herkunft je Zeile) — gültig nur
  // zusammen mit dem Gegenlauf (koerper.drehsinn = −1 kehrt Wind und Wirbel).
  const KLIMA = Object.freeze({
    q0: 334.4,                                   // W/m²: Q des North-Coakley-Satzes (S0 = 1 337,6 / 4; als Satz mit A, B, D übernommen)
    olrA: 203.3, olrB: 2.09, diffD: 0.50,        // W/m², W/m²K (North & Coakley 1979, Literatur); D gesetzt: 0,649 trägt mit dieser Ko-Albedo keine Eis-Kappe
    coA0: 0.697, coA2: -0.0779, coEis: 0.38,     // Ko-Albedo eisfrei a0 + a2·P2, über Eis — North 1975 (Literatur)
    tEisC: -10,                                  // Eis-Linie bei −10 °C Jahresmittel (North 1975)
    walker: 0.9,                                 // Anteil, den das Karbonat-Silikat-Thermostat vom Sternfluss-Gang ausgleicht (gesetzt)
    tropoKm: 10,                                 // Held-Hou H: Höhe der Tropopause (gesetzt), skaliert mit 1/g und T
    lapse: 6.5,                                  // K/km (Standard-Atmosphäre)
    schritte: Object.freeze([75, 150, 225, 300, 800, 2000]),    // km luvwärts (gesetzt): vier im 75-km-Takt lösen Kämme (Hülle 100–400 km breit), zwei fern suchen das Meer
    schattenKm: 1.5,                             // Regenschatten e^(−Δh/1,5 km) (Entscheid §4)
    leeKm: 800,                                  // Schranke eines Kamms wirkt mit e^(−d/800 km) hinter ihm (gesetzt)
    meerKm: 300,                                 // Nachladen über Meer e^(−Weg/300 km) (gesetzt)
    recycleKm: 6000,                             // Feuchte über Land e^(−Weg/6 000 km): Rückführung durch Verdunstung (gesetzt)
    feuchteLand0: 0.35, feuchteLand1: 0.5,       // Feuchte ohne Meer im Fenster: kalt 0,35 … warm (Zone ≥ 25 °C) 0,5 — Rückführung (gesetzt)
    itcz: 2600, sturm: 1100, grund: 250,         // mm/a Gürtel-Amplituden (gesetzt, gegen Köppen gerichtet)
  });
  const KOEPPEN = Object.freeze(['Af', 'Am', 'Aw', 'BWh', 'BWk', 'BSh', 'BSk', 'Csa', 'Csb', 'Csc', 'Cwa', 'Cwb', 'Cwc', 'Cfa', 'Cfb', 'Cfc',
    'Dsa', 'Dsb', 'Dsc', 'Dsd', 'Dwa', 'Dwb', 'Dwc', 'Dwd', 'Dfa', 'Dfb', 'Dfc', 'Dfd', 'ET', 'EF']);
  const WHITTAKER = Object.freeze({ eis: 0, tundra: 1, boreal: 2, gemaessigtRegen: 3, gemaessigtSaison: 4, grasland: 5, busch: 6,
    wueste: 7, savanne: 8, tropenRegen: 9, meer: 10 });

  function planetKlimaGlobal(plan, zeitMa) {
    if (!plan || !plan.koerper) throw new Error('planetKlimaGlobal: plan fehlt (K10)');
    abschnittIndex(plan, zeitMa);
    const M = memoVon(plan); if (!M.klimaG) M.klimaG = new Map();
    if (M.klimaG.has(zeitMa)) return M.klimaG.get(zeitMa);
    const kp = plan.koerper;
    const fluss = kp.sternFluss / (1 - 0.4 * zeitMa / kp.alterMa);     // Gough: L(t)/L_jetzt = 1 / (1 + 0,4·(1 − t/t_jetzt))
    const Q = KLIMA.q0 * fluss;
    const cb = kcos(kp.neigungRad), s2 = -0.625 * (3 * cb * cb - 1) * 0.5;   // Jahres-Einstrahlung s(x) = 1 + s2·P2(x)
    // Walker-Thermostat (Karbonat-Silikat-Kreislauf, Walker et al. 1981): über Ma gleicht das CO₂ den Sternfluss zum Anteil γ aus —
    // die Ausstrahlung sinkt um γ·(Q_heute − Q)·ā. Bei t = 0 ist der Term 0 (bau2-Bytes unverändert). γ gesetzt.
    const N = 256, A = KLIMA.olrA - KLIMA.walker * (KLIMA.q0 * kp.sternFluss - Q) * KLIMA.coA0, B = KLIMA.olrB, D = KLIMA.diffD;
    let xs = 1, T0 = 0, T2 = 0, T2r = 0;
    for (let it = 0; it < 80; it++) {
      let m0 = 0, m2 = 0;
      for (let i = 0; i < N; i++) {
        const x = (i + 0.5) / N, p2 = 1.5 * x * x - 0.5, s = 1 + s2 * p2;
        const a = x > xs ? KLIMA.coEis : KLIMA.coA0 + KLIMA.coA2 * p2;
        m0 += a * s; m2 += a * s * p2;
      }
      m0 /= N; m2 = 5 * m2 / N;
      T0 = (Q * m0 - A) / B; T2 = Q * m2 / (B + 6 * D); T2r = Q * m2 / B;
      const p2s = T2 < 0 ? (KLIMA.tEisC - T0) / T2 : 2;
      const xn = p2s >= 1 ? 1 : (p2s <= -0.5 ? 0 : Math.sqrt((2 * p2s + 1) / 3));
      xs += 0.5 * (xn - xs);
    }
    const T0K = T0 + 273.15, dH = Math.max(0.01, -1.5 * T2r / T0K);      // Held-Hou Δ_H: Gefälle des Strahlungs-Gleichgewichts
    const om = TAU / (kp.tagStunden * 3600), a = plan.R * 1000, H = KLIMA.tropoKm * 1000 * (9.81 / kp.g) * (T0K / 288);
    let phiH = Math.sqrt(5 / 3 * kp.g * H * dH / (om * om * a * a));
    if (phiH > HALBPI) phiH = HALBPI; if (phiH < 0.05) phiH = 0.05;
    const zellen = Math.max(1, Math.floor(HALBPI / phiH + 0.5));
    const G = Object.freeze({
      sternFluss: fluss, tMittelC: T0, tAequatorC: T0 - 0.5 * T2, tPolC: T0 + T2, T0, T2,
      eisBreite: xs >= 1 ? HALBPI : katan2(xs, Math.sqrt(1 - xs * xs)), eisX: xs,
      zellBreite: phiH, zellen, deltaH: dH,
    });
    M.klimaG.set(zeitMa, G); return G;
  }

  // Niederschlag der Gürtel (mm/a, über dem Meer) an der effektiven Breite φ' (rad) — die Gürtel wandern als Ganzes
  function guertelP(phiE, w, zellen) {
    const ap = phiE < 0 ? -phiE : phiE;
    const u = phiE / (0.4 * w);
    let p = KLIMA.grund + (u * u < 40 ? KLIMA.itcz * kexpS(-u * u) : 0);
    for (let k = 2; k <= 2 * zellen; k += 2) {                          // steigende Zell-Ränder (Erde: Polarfront) — Sturmbahn knapp äquatorwärts
      const v = (ap - 0.85 * k * w) / (0.4 * w); if (v * v < 40) p += KLIMA.sturm * kexpS(-v * v);
    }
    return p;
  }

  const KL_P = {};
  const KL_H = new Float64Array(6);
  function planetKlimaR(S, x, y, z, saison, aus, punkt) {
    pruefScheibe(S);
    const plan = S.plan, kp = plan.koerper, R = S.R, G = planetKlimaGlobal(plan, S.zeitMa), ds = kp.drehsinn;
    if (!(saison === -1 || (saison >= 0 && saison <= 1))) throw new Error('planetKlima: saison 0..1 oder −1 (Jahr) (K10)');
    let pt = punkt; if (!pt) { planetPunktR(S, x, y, z, 40, KL_P); pt = KL_P; }
    const hKm = pt.hoeheKm, land = hKm > 0, kont = pt.kont;
    const cphi = Math.sqrt(x * x + z * z), phi = katan2(y, cphi), aphi = phi < 0 ? -phi : phi, sg = phi < 0 ? -1 : 1;
    const w = G.zellBreite, o = aus || {};
    // Wind (woher), Einheit im Ost-Nord-Rahmen: Passat aus Ost und polwärts, Westwind aus West und äquatorwärts, im Takt der Zellen
    const sw = ksin(PI * aphi / w);
    const uO = ds * sw, vN = sg * 0.3 * sw;                                // meridional ~0,3 des zonalen (gesetzt)
    const wl = Math.sqrt(uO * uO + vN * vN);
    // Temperatur der Zone (Meeres-Niveau, Jahr)
    const p2 = 1.5 * y * y - 0.5, tZ = G.T0 + G.T2 * p2;
    const fT = tZ >= 15 ? 1 : Math.max(0.08, kexpS(0.05 * (tZ - 15)));   // Clausius-Clapeyron nur kalt-seitig: das Profil trägt die Erd-Verteilung
    let m = 1, schatten = 1, hub = 1, meerLuv = 1, maritim = 1, c = 0, dTj = 0, dTs = 0, dTw = 0, pF = 1, meerWest = 0;
    if (land) {
      // sechs Schritte luvwärts auf planetHuelle (fern → nah): Meer füllt die Feuchte auf, Land zehrt, Kämme beschatten
      // Alles stetig: Meer-Anteil je Schritt s = glatt(+0,3; −0,6 km; Hülle), keine Schwelle, die Strahlen in die Karte zöge.
      const mLand = KLIMA.feuchteLand0 + (KLIMA.feuchteLand1 - KLIMA.feuchteLand0) * glatt(5, 25, tZ);
      const hO = planetHuelle(S, x, y, z);                                // eigene Hülle: Schatten und Hub auf derselben Lesart wie die Schritte
      const mNeutral = mLand + (1 - mLand) * kexpS(-Math.max(0, kont) / 1000);   // ohne Windrichtung (Zellrand): Feuchte nach Küstenferne
      let mW = mNeutral, schranke = 0, hubW = 0, mar = 0, sMax = 0;
      const om = glatt(0.02, 0.35, wl);                                   // Gewicht des Luv-Gangs; am Zellrand (Wind 0) trägt mNeutral
      if (cphi > 1e-9 && om > 0) {
        const eEx = -z / cphi, eEz = x / cphi, eNx = -y * x / cphi, eNy = cphi, eNz = -y * z / cphi;
        const dx = (uO * eEx + vN * eNx) / wl, dy = (vN * eNy) / wl, dz = (uO * eEz + vN * eNz) / wl;
        const skal = 0.35 + 0.65 * Math.min(1, wl / 1.044);
        for (let j = 5; j >= 0; j--) {
          const a = KLIMA.schritte[j] * skal / R, ca = kcos(a), sa = ksin(a);
          KL_H[j] = planetHuelle(S, ca * x + sa * dx, ca * y + sa * dy, ca * z + sa * dz);
        }
        // Feuchte: über Meer lädt sie nach (meerKm), über Land strebt sie zur Rückführung mLand (recycleKm). Schranke: Kamm über
        // dem Ort, gewichtet mit e^(−d/leeKm) — die Luft mischt sich hinter dem Kamm; über Meer klingt sie mit meerKm ab.
        const s5 = glatt(0.3, -0.6, KL_H[5]);
        mW = s5 + (1 - s5) * mLand; sMax = s5;
        schranke = (1 - s5) * (KL_H[5] - hO) * kexpS(-KLIMA.schritte[5] * skal / KLIMA.leeKm);
        mar = s5 * kexpS(-KLIMA.schritte[5] * skal / 600);
        for (let j = 4; j >= -1; j--) {
          const dj = j >= 0 ? KLIMA.schritte[j] * skal : 0, dd = KLIMA.schritte[j + 1] * skal - dj;
          const h = j >= 0 ? KL_H[j] : hO, sj = glatt(0.3, -0.6, h);
          const eM = kexpS(-dd / KLIMA.meerKm), eL = kexpS(-dd / KLIMA.recycleKm);
          mW = sj * (1 - (1 - mW) * eM) + (1 - sj) * (mLand + (mW - mLand) * eL);
          const b = (h - hO) * kexpS(-dj / KLIMA.leeKm);
          schranke = sj * schranke * eM + (1 - sj) * (b > schranke ? b : schranke);
          const mj = sj * kexpS(-dj / 600); if (mj > mar) mar = mj;
          if (sj > sMax) sMax = sj;
        }
        const anstieg = hO - (KL_H[0] > 0 ? KL_H[0] : 0);
        // Hub hebt nur die vom Meer herangeführte Feuchte (m über mLand), nie die rückgeführte
        hubW = 0.9 * Math.min(1.5, Math.max(0, anstieg)) * Math.max(0, (mW - mLand) / (1 - mLand));
      }
      m = om * mW + (1 - om) * mNeutral;
      schatten = kexpS(-Math.max(0, om * schranke) / KLIMA.schattenKm);
      hub = 1 + om * hubW;
      maritim = om * mar;
      meerLuv = (m - mLand) / (1 - mLand) > 0.02 ? 1 : 0;                // Feuchte mit Meeres-Anteil (Quelle luvwärts bzw. nach Küstenferne)
      c = glatt(0, 1500, kont) * (1 - 0.6 * maritim);
      // Küstenseite aus dem Gefälle des glatten Krustenfelds (± 400 km nach Ost), Abklingen landein
      if (kont < 1200 && cphi > 1e-9) {
        const a = 400 / R, ca = kcos(a), sa = ksin(a), eEx = -z / cphi, eEz = x / cphi;
        const fW = krusteFeld(S, ca * x - sa * eEx, ca * y, ca * z - sa * eEz, 400, true);
        const fE = krusteFeld(S, ca * x + sa * eEx, ca * y, ca * z + sa * eEz, 400, true);
        const kf = S.kuesteF;
        meerWest = glatt(kf + 0.02, kf - 0.08, fW) - glatt(kf + 0.02, kf - 0.08, fE);   // +1: Meer im Westen (Westküste)
        const seite = meerWest * ds;                                                    // Wirbel-Ast kehrt mit dem Drehsinn
        const dec = kexpS(-Math.max(0, kont) / 350);
        const su = (aphi - 0.8 * w) / (0.3 * w), wu = (aphi - 1.6 * w) / (0.35 * w);
        const sub = su * su < 40 ? kexpS(-su * su) : 0, ww = wu * wu < 40 ? kexpS(-wu * wu) : 0;
        const sW = seite > 0 ? seite * dec : 0, sE = seite < 0 ? -seite * dec : 0;
        // Subtropen: Westküste kalt und trocken (Ostrand-Strom), Ostküste warm und feucht; Westwind: Westküste mild, Ostküste winterkalt
        dTj = sub * (-4 * sW + 1.5 * sE);
        dTw = ww * (5 * sW - 4 * sE); dTs = ww * (-1.5 * sW + 1 * sE);
        const decO = kexpS(-Math.max(0, kont) / 700), sEo = seite < 0 ? -seite * decO : 0;   // Ost-Rand: warmer Strom + Sommer-Monsun reichen weiter landein (gesetzt)
        pF = 1 + sub * (-0.75 * sW + 1.0 * sEo) + ww * 0.2 * sW;
      }
    }
    // Gürtel über das Jahr: Deklination ±β, die Verschiebung wächst mit der Kontinentalität (Monsun)
    const beta = kp.neigungRad, schub = (0.3 + 0.4 * c) * (1 - 0.5 * aphi / HALBPI);
    const pN = guertelP(phi, w, G.zellen) * fT, pP = guertelP(phi - beta * schub, w, G.zellen) * fT, pM = guertelP(phi + beta * schub, w, G.zellen) * fT;
    const pSom = sg > 0 ? pP : pM, pWin = sg > 0 ? pM : pP;
    const fak = land ? m * schatten * hub * pF : 1;
    const pJahr = 0.25 * (2 * pN + pP + pM) * fak;
    const sommerAnteil = (pSom + pN) / (2 * pN + pP + pM);
    // Temperatur am Ort
    const sb = ksin(beta), fJ = (kp.jahrTage / (kp.jahrTage + 60)) * (425.25 / 365.25);
    // Land schwingt stärker als Meer, auch an der Küste; jenseits der Eis-Linie der Zone (tZ ≤ tEis) zehrt Schnee den Sommer (gesetzt)
    const cL = land ? (0.3 + 0.7 * c) * (1 - 0.85 * glatt(KLIMA.tEisC + 5, KLIMA.tEisC - 5, tZ)) : 0;
    const amp = (5 + 28 * cL) * (sb / 0.39782) * (y < 0 ? -y : y) * fJ;  // halbe Jahres-Spanne: Meer 5 K, Inneres 33 K bei sin φ = 1 (gesetzt)
    const tJ = tZ - (land ? KLIMA.lapse * hKm : 0) + dTj;
    const tS = tJ + amp + dTs, tW = tJ - amp + dTw;
    // Abfluss: Turc-Pike, L(T) = 300 + 25T + 0,05T³
    const tl = tJ < -10 ? -10 : tJ, L = Math.max(50, 300 + 25 * tl + 0.05 * tl * tl * tl);
    const et = land ? pJahr / Math.sqrt(0.9 + (pJahr / L) * (pJahr / L)) : 0;
    o.tJahrC = tJ; o.tSommerC = tS; o.tWinterC = tW; o.tagAmpC = 4 + 10 * c * (1 - Math.min(1, pJahr / 1500));
    o.niederschlagMm = pJahr; o.sommerAnteil = sommerAnteil; o.kontinental = c;
    o.windOst = wl > 1e-9 ? uO / wl : 0; o.windNord = wl > 1e-9 ? vN / wl : 0;
    o.luv = (hub - 1) / 1.35; o.lee = 1 - schatten; o.stromK = dTj; o.meerWest = meerWest; o.meerLuv = meerLuv; o.feuchte = m;
    o.schneeKm = (land ? hKm : 0) + tS / KLIMA.lapse;
    o.abflussMm = land ? Math.max(0, pJahr - et) : 0;
    o.hoeheKm = hKm;
    if (saison >= 0) {
      const lag = 0.04 + 0.04 * (1 - c), d = ksin(TAU * saison);
      o.tJetztC = 0.5 * (tS + tW) + 0.5 * (tS - tW) * sg * ksin(TAU * (saison - lag));
      o.pJetztMm = guertelP(phi - beta * d * schub, w, G.zellen) * fT * fak;
    } else { o.tJetztC = tJ; o.pJetztMm = pJahr; }
    return o;
  }
  const _r3k = new Float64Array(3);
  function planetKlima(S, breite, laenge, saison, aus, punkt) { planetRichtung(breite, laenge, _r3k); return planetKlimaR(S, _r3k[0], _r3k[1], _r3k[2], saison, aus, punkt); }

  // Köppen (Peel et al. 2007) und Whittaker als reine Tafel über (tSommer, tWinter, tJahr, N, Sommer-Anteil); Monats-Gang als Sinus
  function planetBiom(K, hoeheM, aus) {
    const o = aus || {};
    const tS = K.tSommerC, tW = K.tWinterC, tJ = K.tJahrC, P = K.niederschlagMm, sa = K.sommerAnteil;
    if (!(Number.isFinite(tS) && Number.isFinite(tW) && Number.isFinite(P) && Number.isFinite(hoeheM))) throw new Error('planetBiom: Klima-Feld fehlt (K10)');
    if (!(hoeheM > 0)) {
      // Meereis im Jahresmittel unter −6 °C (gesetzt)
      o.koeppen = -1; o.hauptklasse = -1; o.eis = tJ < -6 ? 2 : 0; o.biom = WHITTAKER.meer; return o;
    }
    let kc;
    const a = Math.max(-1, Math.min(1, PI * (sa - 0.5))), pMon = P / 12, pDry = pMon * (1 - (a < 0 ? -a : a)), pWet = pMon * (1 + (a < 0 ? -a : a));
    if (tS < 10) kc = tS > 0 ? 28 : 29;
    else {
      const pth = 20 * tJ + (sa >= 0.7 ? 280 : (sa <= 0.3 ? 0 : 140));
      if (P < pth) kc = P < 0.5 * pth ? (tJ >= 18 ? 3 : 4) : (tJ >= 18 ? 5 : 6);
      else if (tW >= 18) kc = pDry >= 60 ? 0 : (pDry >= 100 - P / 25 ? 1 : 2);
      else {
        const zw = (sa < 0.5 && pDry < 40 && pDry < pWet / 3) ? 0 : ((sa > 0.5 && pDry < pWet / 10) ? 1 : 2);
        const mt = 0.5 * (tS + tW), am = 0.5 * (tS - tW);
        const monate = am < 1e-9 ? (mt > 10 ? 12 : 0) : 12 * kacos(Math.max(-1, Math.min(1, (10 - mt) / am))) / PI;
        const dritt = tS >= 22 ? 0 : (monate >= 4 ? 1 : 2);
        if (tW > 0) kc = 7 + 3 * zw + dritt;
        else kc = 16 + 4 * zw + (dritt === 2 && tW < -38 ? 3 : dritt);
      }
    }
    o.koeppen = kc; o.hauptklasse = kc <= 2 ? 0 : (kc <= 6 ? 1 : (kc <= 15 ? 2 : (kc <= 27 ? 3 : 4)));
    o.eis = kc === 29 ? 1 : 0;
    let b;
    if (kc === 29) b = WHITTAKER.eis;
    else if (tS < 10) b = WHITTAKER.tundra;
    else if (tJ < 3) b = P < 250 ? WHITTAKER.grasland : WHITTAKER.boreal;
    else if (tJ < 20) b = P < 300 ? (tJ >= 15 ? WHITTAKER.wueste : WHITTAKER.grasland) : (P < 700 ? (tJ >= 10 ? WHITTAKER.busch : WHITTAKER.grasland) : (P < 2200 ? WHITTAKER.gemaessigtSaison : WHITTAKER.gemaessigtRegen));
    else b = P < 500 ? WHITTAKER.wueste : (P < 2400 ? WHITTAKER.savanne : WHITTAKER.tropenRegen);
    o.biom = b;
    return o;
  }

  // Farbe des Landes stetig im (T, N)-Raum (nie eine Klassen-Stufe): Pflanzen-Deckung aus N / PET, Wärme des Sommers, Dauer-Schnee
  function mischF(a, b, t, out) { out[0] = a[0] + (b[0] - a[0]) * t; out[1] = a[1] + (b[1] - a[1]) * t; out[2] = a[2] + (b[2] - a[2]) * t; }
  const F_WUESTE_H = [214, 186, 140], F_WUESTE_K = [168, 156, 136], F_GRAS_W = [158, 150, 84], F_GRAS_K = [122, 128, 82];
  const F_WALD_T = [26, 72, 28], F_WALD_G = [52, 88, 40], F_WALD_B = [38, 62, 44], F_TUNDRA = [128, 118, 96], F_SCHNEE = [244, 246, 250];
  const _fa = new Float64Array(3), _fb = new Float64Array(3), _fc = new Float64Array(3);
  function biomFarbe(tJ, tS, P, out) {
    const pet = 400 + 45 * (tJ > 0 ? tJ : 0);
    const veg = glatt(0.1, 0.85, P / pet);
    const warm = glatt(0, 24, tJ);
    mischF(F_WUESTE_K, F_WUESTE_H, warm, _fa);                          // kahl
    mischF(F_GRAS_K, F_GRAS_W, warm, _fb);                              // Gras
    if (tJ < 12) mischF(F_WALD_B, F_WALD_G, glatt(-6, 12, tJ), _fc); else mischF(F_WALD_G, F_WALD_T, glatt(12, 26, tJ), _fc);   // Wald
    const g1 = glatt(0, 0.55, veg), g2 = glatt(0.45, 1, veg);
    mischF(_fa, _fb, g1, out); const t0 = out[0], t1 = out[1], t2 = out[2];
    out[0] = t0 + (_fc[0] - t0) * g2; out[1] = t1 + (_fc[1] - t1) * g2; out[2] = t2 + (_fc[2] - t2) * g2;
    const tun = 1 - glatt(4, 15, tS);                                   // Tundra: kurzer, kühler Sommer
    out[0] += (F_TUNDRA[0] - out[0]) * tun; out[1] += (F_TUNDRA[1] - out[1]) * tun; out[2] += (F_TUNDRA[2] - out[2]) * tun;
    const sch = glatt(3, -3, tS);                                       // Dauer-Schnee
    out[0] += (F_SCHNEE[0] - out[0]) * sch; out[1] += (F_SCHNEE[1] - out[1]) * sch; out[2] += (F_SCHNEE[2] - out[2]) * sch;
    return out;
  }
  const KOEPPEN_FARBE = [0, 0, 255, 0, 120, 255, 70, 170, 250, 255, 0, 0, 255, 150, 150, 245, 165, 0, 255, 220, 100, 255, 255, 0, 200, 200, 0, 150, 150, 0,
    150, 255, 150, 100, 200, 100, 50, 150, 50, 200, 255, 80, 100, 255, 80, 50, 200, 0, 255, 0, 255, 200, 0, 200, 150, 50, 150, 150, 100, 150,
    170, 175, 255, 90, 120, 220, 75, 80, 180, 50, 0, 135, 0, 255, 255, 55, 200, 255, 0, 125, 125, 0, 70, 95, 178, 178, 178, 102, 102, 102];  // Beck et al. 2018
  const TEMP_RAMPE = [-45, 60, 20, 110, -25, 70, 70, 190, -10, 120, 170, 230, 0, 230, 240, 245, 10, 250, 225, 140, 20, 245, 150, 60, 30, 200, 40, 30, 40, 110, 0, 20];
  // über √N (mm): 0 · 64 · 200 · 400 · 800 · 1 450 · 2 500 · 4 000 mm
  const NIED_RAMPE = [0, 110, 50, 20, 8, 200, 140, 60, 14, 230, 205, 120, 20, 225, 230, 150, 28, 120, 200, 110, 38, 40, 150, 150, 50, 30, 80, 170, 63, 50, 20, 120];

  // ── bau3: die Brücke — geliefert, NICHT verdrahtet (Kopf §6 oben) ─────────────────────────────────────────
  const ORT_KLIMA = ['sommer', 'winter', 'sommerPhase', 'tagAmp', 'tagGipfel', 'jahrTage', 'spendeMm'];
  function pruefOrtGesetz(og) {
    if (!og || typeof og !== 'object') throw new Error('planetOrt: ortGesetz fehlt (K10)');
    if (!(og.kuehlungKJeM > 0)) throw new Error('planetOrt: ortGesetz.kuehlungKJeM fehlt (K10)');
    if (!Number.isFinite(og.meerUnterBasisM)) throw new Error('planetOrt: ortGesetz.meerUnterBasisM fehlt (K10)');
    if (!Array.isArray(og.regler) || !og.regler.length) throw new Error('planetOrt: ortGesetz.regler (LANDFORM_REGLER) fehlt (K10)');
    const kh = og.klimaHeute; if (!kh) throw new Error('planetOrt: ortGesetz.klimaHeute fehlt (K10)');
    for (const f of ORT_KLIMA) if (!Number.isFinite(kh[f])) throw new Error('planetOrt: ortGesetz.klimaHeute.' + f + ' fehlt (K10)');
  }
  function reglerZeile(og, id) {
    for (let i = 0; i < og.regler.length; i++) if (og.regler[i].id === id) return og.regler[i];
    throw new Error('planetOrt: Regler "' + id + '" fehlt in ortGesetz.regler (K10)');
  }
  function klemm(r, v) { return v < r.min ? r.min : (v > r.max ? r.max : v); }
  // Lesart von Kontinentalität (km zur Küste, + landein) als Regler „land" (Entscheid §6: Küste um −0,2, Inneres 0,35–0,9, Meer bis −0,6)
  function landAus(kont) { return kont < 0 ? -0.2 + 0.4 * Math.max(-1, kont / 300) : -0.2 + 0.55 * glatt(0, 300, kont) + 0.55 * glatt(300, 2000, kont); }
  const _ankP = {}, _ankK = {};
  // Der Anker: der Ort, an dem die Konstanten des heutigen Ort-Gesetzes (Sommer/Winter am Meer) wahr sind — auf Land, Küste ≤ 300 km,
  // kein aktiver Rand näher als 500 km. Suche über 512 Fibonacci-Proben (~1 000 km Abstand), Wertung ((ΔS/4)² + (ΔW/6)²), dann drei
  // Runden 3×3-Verfeinerung zu 240 · 120 · 60 km. Bricht beim Namen, wenn kein Ort trägt (K10). Memo je (Plan, Zeit, Konstanten).
  function planetAnker(plan, zeitMa, og) {
    pruefOrtGesetz(og);
    const M = memoVon(plan); if (!M.anker) M.anker = new Map();
    const kh = og.klimaHeute, key = zeitMa + '|' + kh.sommer + '|' + kh.winter;
    if (M.anker.has(key)) return M.anker.get(key);
    const S = planetScheibe(plan, zeitMa), R = S.R, G = planetKlimaGlobal(plan, zeitMa), N = 512, F = fib(N);
    const tMitte = 0.5 * (kh.sommer + kh.winter);
    const wert = (x, y, z) => {
      const tZ = G.T0 + G.T2 * (1.5 * y * y - 0.5); if (tZ - tMitte > 14 || tMitte - tZ > 14) return Infinity;   // Zone zuerst (ohne Punkt)
      const h = planetPunktR(S, x, y, z, 40, _ankP);
      if (!(h > 0) || _ankP.kont < 0 || _ankP.kont > 300 || (_ankP.randArt === RAND_ART.konvergent && _ankP.randAbstandKm < 500) || _ankP.orogenAktiv) return Infinity;
      planetKlimaR(S, x, y, z, -1, _ankK, _ankP);
      const hk = _ankP.hoeheKm > 0 ? _ankP.hoeheKm : 0, dS = (_ankK.tSommerC + KLIMA.lapse * hk - kh.sommer) / 4, dW = (_ankK.tWinterC + KLIMA.lapse * hk - kh.winter) / 6;
      return dS * dS + dW * dW;
    };
    let best = Infinity, bx = 0, by = 0, bz = 0;
    for (let i = 0; i < N; i++) { const v = wert(F[3 * i], F[3 * i + 1], F[3 * i + 2]); if (v < best) { best = v; bx = F[3 * i]; by = F[3 * i + 1]; bz = F[3 * i + 2]; } }
    if (best === Infinity) throw new Error('planetAnker: kein Ort trägt die heutigen Konstanten (Land, Küste ≤ 300 km, kein aktiver Rand < 500 km) (K10)');
    const tb = new Float64Array(6);
    for (let runde = 0; runde < 3; runde++) {
      tangente(bx, by, bz, tb); const sch = (240 >> runde) / R; let nx = bx, ny = by, nz = bz;
      for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) {
        if (!a && !c) continue;
        let x = bx + sch * (a * tb[0] + c * tb[3]), y = by + sch * (a * tb[1] + c * tb[4]), z = bz + sch * (a * tb[2] + c * tb[5]); const l = Math.sqrt(x * x + y * y + z * z); x /= l; y /= l; z /= l;
        const v = wert(x, y, z); if (v < best) { best = v; nx = x; ny = y; nz = z; }
      }
      bx = nx; by = ny; bz = nz;
    }
    const bl = planetBreiteLaenge(bx, by, bz, new Float64Array(2)), breite = bl[0], laenge = bl[1];
    const sb = ksin(breite), cb = kcos(breite), sl = ksin(laenge), cl = kcos(laenge);
    planetPunktR(S, bx, by, bz, 40, _ankP); planetKlimaR(S, bx, by, bz, -1, _ankK, _ankP);
    const hk = _ankP.hoeheKm > 0 ? _ankP.hoeheKm : 0;
    const A = Object.freeze({ breite, laenge, zeitMa, wertung: best, auf: Object.freeze([bx, by, bz]), ost: Object.freeze([-sl, 0, cl]), nord: Object.freeze([-sb * cl, cb, -sb * sl]),
      sommerC: _ankK.tSommerC + KLIMA.lapse * hk, winterC: _ankK.tWinterC + KLIMA.lapse * hk, kuesteKm: _ankP.kont, randKm: _ankP.randAbstandKm, randArt: _ankP.randArt });
    M.anker.set(key, A); return A;
  }
  // Würfel-Karte um den Anker: Fläche 0 hat den Anker in der Mitte; Spiel-x = Ost, Spiel-z = Süd (rechtshändig mit y oben).
  // Winkeltreue Würfel-Abbildung: Richtung = norm(n + tan(ξ/R)·u + tan(η/R)·v) — längs der Achsen durch den Anker ist ξ die wahre
  // Bogenlänge. Flächen: 0 auf · 1 Ost · 2 gegenüber · 3 West · 4 Süd · 5 Nord.
  function flaechenRahmen(anker, f, o) {
    const a = anker.auf, e = anker.ost, n = anker.nord;
    const sued = [-n[0], -n[1], -n[2]];
    const B = [a, e, sued];
    const T = [[[1, 0, 0], [0, 1, 0], [0, 0, 1]], [[0, 1, 0], [-1, 0, 0], [0, 0, 1]], [[-1, 0, 0], [0, -1, 0], [0, 0, 1]],
      [[0, -1, 0], [1, 0, 0], [0, 0, 1]], [[0, 0, 1], [0, 1, 0], [-1, 0, 0]], [[0, 0, -1], [0, 1, 0], [1, 0, 0]]][f];
    if (!T) throw new Error('planetFlaeche: flaeche 0..5 (K10)');
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o[3 * r + c] = T[r][0] * B[0][c] + T[r][1] * B[1][c] + T[r][2] * B[2][c];
    return o;
  }
  const _fr = new Float64Array(9);
  function tanK(x) { return ksin(x) / kcos(x); }
  function planetFlaeche(plan, anker, flaeche, xiM, etaM, aus3) {
    if (!anker || !anker.auf) throw new Error('planetFlaeche: anker fehlt (K10)');
    const R = plan.R * 1000, o = aus3 || new Float64Array(3); flaechenRahmen(anker, flaeche, _fr);
    const tu = tanK(xiM / R), tv = tanK(etaM / R);
    let x = _fr[0] + tu * _fr[3] + tv * _fr[6], y = _fr[1] + tu * _fr[4] + tv * _fr[7], z = _fr[2] + tu * _fr[5] + tv * _fr[8];
    const l = Math.sqrt(x * x + y * y + z * z); o[0] = x / l; o[1] = y / l; o[2] = z / l; return o;
  }
  function planetKarteVon(plan, anker, x, y, z, aus) {
    if (!anker || !anker.auf) throw new Error('planetKarteVon: anker fehlt (K10)');
    const R = plan.R * 1000, o = aus || {};
    let bf = 0, bd = -2;
    for (let f = 0; f < 6; f++) { flaechenRahmen(anker, f, _fr); const d = x * _fr[0] + y * _fr[1] + z * _fr[2]; if (d > bd) { bd = d; bf = f; } }
    flaechenRahmen(anker, bf, _fr);
    o.flaeche = bf; o.xiM = R * katan2(x * _fr[3] + y * _fr[4] + z * _fr[5], bd); o.etaM = R * katan2(x * _fr[6] + y * _fr[7] + z * _fr[8], bd);
    return o;
  }
  // Die Brücke: was gelaende-core für seine Großform liest, am Ort (breite, laenge) zur Zeit der Scheibe.
  const _orP = {}, _orK = {}, _orB = {}, _orL = {}, _orV = new Float64Array(3), _orKV = {};
  function planetOrt(S, breite, laenge, og, aus) {
    pruefScheibe(S); pruefOrtGesetz(og);
    const plan = S.plan, kp = plan.koerper, kh = og.klimaHeute, R = S.R;
    const anker = planetAnker(plan, 0, og), S0 = planetScheibe(plan, 0);
    const sv = 0.0065 / og.kuehlungKJeM;                                   // Stauchung: gelesen aus dem Ort-Gesetz, nie gesetzt
    const o = aus || {};
    planetPunkt(S, breite, laenge, 16, _orP);                    // Band ≥ 32 km (K8): fuss 16 km
    const K = planetKlima(S, breite, laenge, -1, _orK, _orP), B = planetBiom(K, _orP.hoeheM, _orB);
    const hk = _orP.hoeheKm > 0 ? _orP.hoeheKm : 0, sued = breite < 0;
    o.anker = { breite: anker.breite, laenge: anker.laenge, zeitMa: 0, ost: anker.ost, nord: anker.nord };
    // Wildnis-Regler, geklemmt auf ihre Zeile in LANDFORM_REGLER (Abbildung §6)
    const rL = reglerZeile(og, 'land'), rH = reglerZeile(og, 'hoehe'), rKL = reglerZeile(og, 'kontinentLambda'), rRL = reglerZeile(og, 'rauhLambda');
    const rTr = reglerZeile(og, 'trog'), rKs = reglerZeile(og, 'ks'), rTa = reglerZeile(og, 'tafel'), rSD = reglerZeile(og, 'schichtDicke'), rHA = reglerZeile(og, 'hartAnteil');
    const st = _orP.orogenStaerke, tJs = K.tJahrC + KLIMA.lapse * hk;
    const lam = rRL.min + (rRL.max - rRL.min) * glatt(0, 400, _orP.orogenAlterMa);
    const schAlter = _orP.scholle >= 0 ? plan.schollen[8 * _orP.scholle + 4] : 0;
    const konv = _orP.randArt === RAND_ART.konvergent ? glatt(0, 8, _orP.randRateCmA) * kexpS(-_orP.randAbstandKm / 600) : 0;
    o.wildnis = {
      land: klemm(rL, landAus(_orP.kont)),
      hoehe: klemm(rH, 0.6 + 1.0 * st),
      kontinentLambda: rKL.def,
      rauhLambda: klemm(rRL, rRL.def + (lam - rRL.def) * glatt(0.05, 0.3, st)),
      trog: klemm(rTr, glatt(16, -2, tJs)),
      ks: klemm(rKs, 3 + 12 * konv),
      tafel: klemm(rTa, glatt(400, 1500, _orP.randAbstandKm) * glatt(1500, 3500, schAlter)),
      schichtDicke: rSD.def,
      hartAnteil: rHA.def,
    };
    o.meer = { waterLevelM: -og.meerUnterBasisM + sv * (S.meerKm - S0.meerKm) * 1000 };
    o.klima = { sommer: K.tSommerC + KLIMA.lapse * hk, winter: K.tWinterC + KLIMA.lapse * hk,
      sommerPhase: sued ? (kh.sommerPhase + 0.5) % 1 : kh.sommerPhase, tagAmp: 0.5 * K.tagAmpC, tagGipfel: kh.tagGipfel, jahrTage: kp.jahrTage, spendeMm: K.abflussMm };
    const G = planetKlimaGlobal(plan, S.zeitMa), aphi = breite < 0 ? -breite : breite, v = (aphi - 1.7 * G.zellBreite) / (0.4 * G.zellBreite);
    const wl = Math.sqrt(K.windOst * K.windOst + K.windNord * K.windNord);
    o.wetter = { windX: wl > 1e-9 ? -K.windOst / wl : 0, windZ: wl > 1e-9 ? K.windNord / wl : 0,   // wohin der Wind weht, Spiel-(x Ost, z Süd)
      regenQuote: K.niederschlagMm / (K.niederschlagMm + 900), sturmQuote: 0.03 + 0.25 * (v * v < 40 ? kexpS(-v * v) : 0) };   // gesetzt
    o.biom = { koeppen: B.koeppen, hauptklasse: B.hauptklasse, biom: B.biom };
    // Leit-Stützen 9×9 über 64 km in der Würfel-Karte des Ankers: gestauchte Höhen-Differenz zum Anker (t = 0) und Differenz von „land"
    const hAnk = planetPunktR(S0, anker.auf[0], anker.auf[1], anker.auf[2], 16, _orKV), landAnk = landAus(_orKV.kont);
    planetRichtung(breite, laenge, _orV); const kv = planetKarteVon(plan, anker, _orV[0], _orV[1], _orV[2], _orL);
    const huelleM = (o.leit && o.leit.huelleM) || new Float64Array(81), landC = (o.leit && o.leit.landC) || new Float64Array(81);
    for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) {
      planetFlaeche(plan, anker, kv.flaeche, kv.xiM + (i - 4) * 8000, kv.etaM + (j - 4) * 8000, _orV);
      const h = planetPunktR(S, _orV[0], _orV[1], _orV[2], 16, _orKV);
      huelleM[9 * j + i] = sv * (h - hAnk); landC[9 * j + i] = landAus(_orKV.kont) - landAnk;
    }
    o.leit = { kanteM: 8000, huelleM, landC, flaeche: kv.flaeche, xiM: kv.xiM, etaM: kv.etaM };
    o.vulkan = { art: _orP.vulkanArt, abstandKm: _orP.vulkanAbstandKm, alterMa: _orP.vulkanAlterMa,
      foerderKm3Ma: _orP.vulkanAktiv ? (_orP.vulkanArt === VULKAN_ART.hotspot ? 8 : 0.6) : 0 };   // dieselbe Regel wie planetVulkane
    o.rand = { art: _orP.randArt, abstandKm: _orP.randAbstandKm, rateCmA: _orP.randRateCmA };
    o.stauchung = sv;
    return o;
  }

  function scheibeBytes(S) {
    let n = 0; for (const key of ['sw', 'sm', 'sr', 'sAus', 'sgrp', 'qS', 'pz', 'pom', 'rho', 'nbStart', 'nbList', 'ketten', 'kettenKap', 'kettenIdx', 'nahtAmp']) if (S[key]) n += S[key].byteLength;
    return n + 128;
  }

  const api = Object.freeze({
    STUDIO_VERTRAG: 1, FUNKTION: 1, VERSION,
    planetMathe, planetHash, planetZufall, PLANET_ERDE, RAND_ART, KRUSTE, VULKAN_ART, SCHICHT, BILD_ART,
    planetPlan, planetScheibe, planetRichtung, planetBreiteLaenge, planetPunkt, planetPunktR, planetHuelle, planetMeer, planetVulkane, planetKarte,
    KLIMA, KOEPPEN, WHITTAKER, planetKlimaGlobal, planetKlima, planetKlimaR, planetBiom,
    planetAnker, planetFlaeche, planetKarteVon, planetOrt, NACHKLANG_MA,
    _intern: Object.freeze({ planBytes, scheibeBytes, abschnitt, acosF, gdh1, fib, biomFarbe, guertelP, scheibeKern, tempoAbl, abschnittIndex }),
  });
  root.__planetCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : globalThis);
