/*
 * planet-core.js — der Planet als FUNKTION f(samen, breite, laenge, zeit).
 *
 * Kern im Aufbau (Entscheid im Zweig koordination, vision/planet/ENTSCHEID, Schritte bau1–bau3): Kugel, Schollen, Schlüsselbilder, Platten, Ränder,
 * Relief, Vulkanismus, Meeresspiegel, Karte. Den Stand der Verdrahtung nennt allein die Linse ort.leser im Richter
 * (scripts/diag-planet.cjs --richter bau3); dieser Kopf trägt ihn nicht (R6: der Kern geht ohne Byte-Änderung ins Manifest).
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
 * §6 DIE BRÜCKE — was das Ort-Gesetz der Welt vom Planeten liest:
 *   planetAnker(plan, t, ortGesetz)   der Ort, an dem die heutigen Konstanten des Ort-Gesetzes wahr sind (TEMPERATUR 18 / −4 °C am
 *                                     Meer), auf Land, Küste ≤ 300 km, kein konvergenter Rand < 500 km.
 *   planetFlaeche / planetKarteVon    Spiel-(x, z) = Karten-Meter (ξ, η) der Würfel-Fläche, in deren Mitte der Anker liegt
 *                                     (x Ost, z Süd); winkeltreue Würfel-Abbildung, Krümmung nur im Vertex-Schritt des Zeichners.
 *   planetOrt(scheibe, φ, λ, ortGesetz, aus?, heimat?) → { anker, wildnis (LANDFORM_REGLER, geklemmt), meer.waterLevelM, klima (TEMPERATUR-Felder
 *                                     + spendeMm), wetter (Rahmen für wetterAt), biom, wuchs (die Pflanzen-Deckung des Klimas:
 *                                     Krautschicht und Wald, dieselbe Rechnung wie die Farbe des Atlas), eis, vulkan, rand,
 *                                     stauchung s_v, delta }. Der Ort kostet, was er fragt: 1 Relief-Punkt + das Klima (kein Feld ohne Leser).
 *   ortGesetz ist die EINE Tafel des Gelände-Kerns (gelaende-core `ortGesetz()`: kuehlungKJeM, meerUnterBasisM, regler,
 *   klimaHeute samt spendeMm im Jahr der Tafel) — kein Aufrufer baut sie nach. s_v = 0,0065 / kuehlungKJeM wird daraus GELESEN,
 *   nie kopiert.
 *   DER ORT ALS DIFFERENZ (`planetOrt().delta`): Ort − Anker, die Spende und der Wuchs als Verhältnis — am Anker jedes Feld +0,
 *   jedes Verhältnis 1. DER JAHRESZEITEN-VERTRAG: `klima.sommer` ist die WÄRMERE Jahreszeit, `klima.sommerPhase` ihre Phase —
 *   absolut am Ort und als Heimat + Δ im Leser (Sommer ≥ Winter an jedem Ort; das Δ wird zur selben Zeit des Jahres genommen).
 *   Ein Leser bildet „Heimat plus Differenz“ an der Quelle seiner Heimat-Größe, nie aus einer absoluten Zahl des Planeten.
 */
(function (root) {
  'use strict';

  const VERSION = 'planet-h2-15';

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
  // G3.7 die 16 Gradienten als Tafel statt Verzweigung (vorher 29 % der Punkt-Zeit in der Sprung-Tafel): je Gradient genau zwei
  // Einträge ±1, der dritte 0. Bytes gleich: ±1·x ist exakt, die Null-Spalte addiert ±0 zu einer Summe, die nie −0 ist (Bruchteile
  // fx ≥ +0, fx − 1 < 0; x + (−x) ergibt +0) — dieselbe Summe wie der Zweig (case 0: x + y … default: −y − z).
  const GRX = new Float64Array([1, -1, 1, -1, 1, -1, 1, -1, 0, 0, 0, 0, 1, 0, -1, 0]);
  const GRY = new Float64Array([1, 1, -1, -1, 0, 0, 0, 0, 1, -1, 1, -1, 1, -1, 1, -1]);
  const GRZ = new Float64Array([0, 0, 0, 0, 1, 1, -1, -1, 1, 1, -1, -1, 0, 1, 0, -1]);
  function gr(h, x, y, z) { const i = h & 15; return GRX[i] * x + GRY[i] * y + GRZ[i] * z; }
  function hzFertig(h0) {
    let h = h0 | 0;
    h ^= h >>> 15; h = Math.imul(h, 0x2c1b3c6d); h ^= h >>> 12; h = Math.imul(h, 0x297a2d39); h ^= h >>> 15;
    return h;
  }
  function rausch(seed, x, y, z) {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    const fx = x - ix, fy = y - iy, fz = z - iz;
    const u = fx * fx * fx * (fx * (fx * 6 - 15) + 10), v = fy * fy * fy * (fy * (fy * 6 - 15) + 10), w = fz * fz * fz * (fz * (fz * 6 - 15) + 10);
    // G3.7 die Gitter-Produkte von hz je Achse einmal (dieselben Math.imul, dieselbe Verknüpfung, dieselben Bytes)
    const X0 = Math.imul(ix, 0x8da6b343), X1 = Math.imul(ix + 1, 0x8da6b343), Y0 = Math.imul(iy, 0xd8163841), Y1 = Math.imul(iy + 1, 0xd8163841);
    const Z0 = Math.imul(iz, 0xcb1ab31f) ^ seed, Z1 = Math.imul(iz + 1, 0xcb1ab31f) ^ seed;
    const a0 = gr(hzFertig(X0 ^ Y0 ^ Z0), fx, fy, fz), a1 = gr(hzFertig(X1 ^ Y0 ^ Z0), fx - 1, fy, fz);
    const b0 = gr(hzFertig(X0 ^ Y1 ^ Z0), fx, fy - 1, fz), b1 = gr(hzFertig(X1 ^ Y1 ^ Z0), fx - 1, fy - 1, fz);
    const c0 = gr(hzFertig(X0 ^ Y0 ^ Z1), fx, fy, fz - 1), c1 = gr(hzFertig(X1 ^ Y0 ^ Z1), fx - 1, fy, fz - 1);
    const d0 = gr(hzFertig(X0 ^ Y1 ^ Z1), fx, fy - 1, fz - 1), d1 = gr(hzFertig(X1 ^ Y1 ^ Z1), fx - 1, fy - 1, fz - 1);
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
    tagStunden: 24, jahrTage: 365, drehsinn: 1, sternFluss: 1, alterMa: 4570 });   // das Jahr der Erde ist das Jahr des Ort-Gesetzes (R5)
  const RAND_ART = Object.freeze({ innen: 0, divergent: 1, transform: 2, konvergent: 3 });
  const KRUSTE = Object.freeze({ ozean: 0, hang: 1, schelf: 2, kontinent: 3 });
  const VULKAN_ART = Object.freeze({ keiner: 0, bogen: 1, hotspot: 2, ruecken: 3, trapp: 4 });
  const SCHICHT = Object.freeze({ relief: 0, platten: 1, alter: 2, biom: 3, temperatur: 4, niederschlag: 5, koeppen: 6 });
  const BILD_ART = Object.freeze({ verstreut: 0, versammelt: 1, geloest: 2 });

  const T_START = -4000, T_ENDE = 1000, TAU_W = 20, TAU_A = 120;
  // klima-hebung: DIE HEBUNG EINES GEBIRGES FOLGT DER KONVERGENZ. Die Endhöhe eines Bogens oder Kamms ist h∞ = hoeheKm · min(1,6;
  // konv/25) (konv in mm/a = km/Ma, wie bisher); sein Tempo am Anfang ist u0 = anteil · konv — die Verkürzung verdickt die Kruste, die
  // Isostasie hebt die Oberfläche um ~ein Sechstel der Verdickung (Garzione et al. 2007), Krustendicke 35 km auf ~300 km Breite:
  // u0 ≈ konv · 35/300/6 ≈ konv/50; Anden ~1 mm/a bei ~70 mm/a, Taiwan 5–10 mm/a bei 82 mm/a, Nord-Altiplano 2,5 ± 1 km in ~4 Ma
  // (Garzione et al. 2008) → gesetzt 1/40. Die Reife ist 1 − e^(−Alter·u0/h∞): bei konv 25 mm/a 0,63 mm/a, Zeitkonstante 8 Ma; bei
  // 80 mm/a 2 mm/a, 4 Ma. Vorher war sie 1 − e^(−Alter/20 Ma) für JEDE Rate, je Scheibe fest: an 494 konvergenten Land-Punkten
  // (12 Saaten) hob die Zeit-Achse 30 m je 10⁶ a, Spearman Hebung ↔ Rate 0,03 (Zensus klima-front 24.11.)
  const HEBUNG = Object.freeze({ anteil: 1 / 40, hoeheKm: 5 });
  function hebungReife(konv, alterMa) {
    if (!(konv > 0) || !(alterMa > 0)) return 0;
    return 1 - kexp(-alterMa * HEBUNG.anteil * konv / (HEBUNG.hoeheKm * Math.min(1.6, konv / 25)));
  }
  const RAMPE0 = 0.04, RAMPE1 = 0.25;   // innen-Rampe im Krustenfeld (Schelf → Inneres)
  const BEZUG_MA = 100, BEZUG_TAKT = 20;  // Erosionsbasis: Bezugs-Spiegel = Mittel des Selbst-Spiegels über 100 Ma in Stützen je 20 Ma (K7)
  const EIS_DICKE_KM = 2.0, EIS_RHO = 0.917;   // Eisschild: mittlere Dicke gesetzt (Antarktis ~2,1 km, Literatur, ungeprüft); Dichte Eis/Wasser
  const MAX_P = 64;
  // G1.1 Rangordnung (ENTSCHEID-2): Deckel des Schollen-Gewichts, Wahrscheinlichkeit einer neuen Gruppe, größte Gruppe als Anteil der Schollen
  const SCHOLLE_DECKEL = 6, GRUPPE_NEU = 0.25, GRUPPE_DOM = 0.4;
  // G1.2 Amplituden der zwei Bänder der Kruste (grob: Gestalt; fein: Küste wie zuvor, 0,6 × Anteil der Oktaven unter 0,45·λ0)
  const LAPPEN_GROB = 1.5, LAPPEN_FEIN = 0.45;
  // B1 das Fenster einer Scholle (Winkel r·FENSTER·a um ihre Mitte): an seinem Rand ist das rohe Feld ≤ 1 − FENSTER = −1,3, dort trägt
  // es kein Rauschen (Gewicht glatt(−1,3; −0,5; f)) — ein Leser des Felds sieht eine Scholle stetig eintreten. Vorher 1,75: am Rand
  // −0,75 plus Lappen (±1,5·0,79·fbm), die Schwellen der Leser (gF > −0,74) schalteten am Rand des Fensters.
  const FENSTER = 2.3;
  // G1.4 Becken und Schwellen der Kruste: Amplitude als Vielfaches des Freibords, Gewinn je Oktave, Tiefe des Becken-Asts.
  // Schwellen linear, Becken quadratisch (−BECKEN_TIEF·n²): ein Becken unter dem Meer ist selten und kompakt (Hudson, Ostsee),
  // die Schwelle häufig. Gemessen (12 Saaten, Richter gesicht): symmetrisch c 5 leerte das Innere (land.fern1000 5,0 %),
  // c 3 + quadratisch 2 + Lappen 1,5 trägt land.ellipse 0,841 · land.stuecke4 40 · meer.binnen 1,6 % · land.fern1000 7,2 %.
  const BECKEN_C = 3.0, BECKEN_GEWINN = 0.62, BECKEN_TIEF = 2;
  // G2.2 Der Schild: das Alter der Scholle (1 500–4 000 Ma, Plan) entscheidet den Charakter ihres Inneren — alt ist flacher Schild,
  // jung ist Becken- und Schwellen-Land. Die Amplitude von B fällt linear mit dem Alter von 1,9 auf 0,1 (Mittel 1,0 über das Band
  // der Ziehung: die Gestalt des Landes aus G1 bleibt im Mittel). Gesetzt, nicht geeicht (Erde: Kanadischer Schild flach, Becken
  // und Bögen der jungen Plattformen; Literatur aus dem Gedächtnis, ungeprüft).
  function schildFaktor(plan, s) { return 1.9 - 1.8 * (plan.schollen[8 * s + 4] - 1500) / 2500; }
  // Meereis: Luft über dem Meer im Winter-Mittel unter −12 °C friert die Oberfläche trotz des Wärmestroms aus dem Ozean (gesetzt;
  // Meerwasser friert bei −1,8 °C). Die Kante folgt damit Breite UND Nähe zu winterkaltem Land.
  const MEEREIS_WINTER_C = -12;
  const DYN_KM = 2.0;                    // dynamische Topographie: Amplitude des Mantel-Felds (×fbm, Streuung ≈ 0,4 km)
  const SEDIMENT_FUELLT = 0.3;           // auf Kontinent bleibt von einem Mantel-Becken 30 %: Sediment füllt es zur Erosionsbasis auf (gesetzt)
  const KUESTE_GEWINN = 0.75;            // Gewinn je Oktave des Küsten-fBm; gemessen D 1,18 (kueste.dimension)
  // Platten-Verzug (Gegner 3): Oktaven-Wellenlänge und -Amplitude in km; der Versatz ist weich durch PLATTEN_VERZUG_KM begrenzt
  // (|d|·M/√(|d|² + M²) < M), deshalb ist er eine harte Schranke für die Nachbar-Liste. Rausch-Streuung ≈ 0,25 → typischer Versatz
  // ≈ 0,25·√3·900 ≈ 390 km auf 2 600 km Wellenlänge: sichtbar gebogen, ohne Faltung (Ableitung < 1).
  const VERZUG_LAM = [2600, 800, 260], VERZUG_AMP = [900, 280, 80], PLATTEN_VERZUG_KM = 650;
  // Nachbar-Liste (Gegner 1, K5): 1 300 km Schablonen-Reichweite + Verzug-Schranke + 2 × Proben-Abstand der 4 096 Proben, der mit
  // dem Radius wächst (√(4π/4 096)·R ≈ 0,0554·R). Eine feste Zahl in km riss ab R ≈ 6 400 km.
  function nachbarKm(R) { return 1300 + PLATTEN_VERZUG_KM + 2 * Math.sqrt(4 * PI / 4096) * R; }

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
    // G1.1 Rangordnung: Schollen-Gewicht gestutzt Pareto α 4/3 (Gewicht = v^(−3/4), nur sqrt), Deckel SCHOLLE_DECKEL
    for (let s = 0; s < nS; s++) { const v = 1 - 0.999 * Z(20, s, 0), r4 = Math.sqrt(Math.sqrt(v)); raw[s] = Math.min(SCHOLLE_DECKEL, 1 / (r4 * r4 * r4)); sumRaw += raw[s]; }
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

    // G1.1 EINE Gruppen-Funktion für Anfang UND Neuschnitt: Ziel-Größen aus bevorzugtem Anlagern über die Zahl (eine dominante
    // Gruppe, einige mittlere, Einzel-Schollen als Mikrokontinente); neue Gruppe mit p GRUPPE_NEU, höchstens 19 − nO Gruppen, die
    // größte ≤ GRUPPE_DOM der Schollen. Zyklus 0 = Anfang, b + 1 = Neuschnitt am gelösten Bild b.
    function gruppenGroessen(zy) {
      const gr = [], gmax = 19 - nO, dom = Math.max(2, Math.floor(GRUPPE_DOM * nS));
      for (let s = 0; s < nS; s++) {
        if (gr.length === 0 || (gr.length < gmax && Z(25, zy * 64 + s, 1) < GRUPPE_NEU)) { gr.push(1); continue; }
        let u = Z(25, zy * 64 + s, 2) * s, g = 0; while (g < gr.length - 1 && u >= gr[g]) { u -= gr[g]; g++; }
        if (gr[g] >= dom) { g = 0; for (let i = 1; i < gr.length; i++) if (gr[i] < gr[g]) g = i; }
        gr[g]++;
      }
      return gr.sort((x, y) => y - x);
    }
    let gruppeAkt = new Int32Array(nS);
    { const gr = gruppenGroessen(0); let s = 0; for (let g = 0; g < gr.length; g++) for (let i = 0; i < gr[g]; i++) gruppeAkt[s++] = g; }
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
    function neuSchnitt(b) { // G1.1: die Ziel-Größen aus gruppenGroessen längs der Kontakt-Kanten füllen, alte Gruppen-Kanten zuerst
      const nb = []; for (let s = 0; s < nS; s++) nb.push([]);
      for (let a = 0; a < nS; a++) for (let c = a + 1; c < nS; c++) {
        const d = acosF(w[3 * a] * w[3 * c] + w[3 * a + 1] * w[3 * c + 1] + w[3 * a + 2] * w[3 * c + 2]);
        if (d < (schollen[8 * a + 3] + schollen[8 * c + 3]) * 1.02) { nb[a].push(c); nb[c].push(a); }
      }
      const ziel = gruppenGroessen(b + 1), neu = new Int32Array(nS).fill(-1); let gi = 0;
      for (; gi < ziel.length; gi++) {
        let keim = -1, kb = -1;
        for (let s = 0; s < nS; s++) { if (neu[s] >= 0) continue; let fr = 0; for (const o of nb[s]) if (neu[o] < 0) fr++; const wv = fr + Z(82, b, s); if (wv > kb) { kb = wv; keim = s; } }
        if (keim < 0) break;
        neu[keim] = gi; let n = 1; const rand = [keim];
        while (n < ziel[gi]) {
          let best = -1, bw = -1;
          for (let ri = 0; ri < rand.length; ri++) for (const o of nb[rand[ri]]) { if (neu[o] >= 0) continue; const wv = (gruppeAkt[o] === gruppeAkt[rand[ri]] ? 2 : 0) + Z(83, b, o * 64 + rand[ri]); if (wv > bw) { bw = wv; best = o; } }
          if (best < 0) break;
          neu[best] = gi; rand.push(best); n++;
        }
      }
      for (let s = 0; s < nS; s++) if (neu[s] < 0) { let g = -1; for (const o of nb[s]) if (neu[o] >= 0) { g = neu[o]; break; } neu[s] = g >= 0 ? g : gi++; }
      for (let s = 0; s < nS; s++) gruppeAkt[s] = neu[s];
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
    if (!m) { m = { abs: [], scheiben: new Map(), meerBin: new Map(), meerRef: new Map(), proben: new Map(), naehteJe: null, tang: null, ell: null, randForm: null, kegelPl: null, kegelS: null, klimaG: null, anker: null, ortAnker: null }; MEMO.set(plan, m); }
    return m;
  }
  // Ein-Eintrag-Zwischenspeicher je Tafel (Identität des Plans): spart die WeakMap im Punkt-Pfad, ändert kein Ergebnis
  let TG_P = null, TG_V = null, EL_P = null, EL_V = null, NJ_P = null, NJ_V = null, RF_P = null, RF_V = null;
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
          rand[2 * (s * 32 + f)] = plan.bilder[b]; rand[2 * (s * 32 + f) + 1] = 4.4 * s0 * hebungReife(geschw * vl, vor.dauer) * gS * glatt(0.35, 0.7, front);
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
      const mx = plan.schollen[8 * s], my = plan.schollen[8 * s + 1], mz = plan.schollen[8 * s + 2], aus = kcos(Math.min(PI, plan.schollen[8 * s + 3] * FENSTER * E[3 * s + 2]));
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
      sAus[s] = kcos(Math.min(PI, sr[s] * FENSTER * ellipseJeScholle(plan)[3 * s + 2]));
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
      bFest, nbStart: null, nbList: null, ketten: null, kettenN: 0, alterMa: t - A.t0 + 1, Q: ohneQ ? 0 : plan.Q, meerKm: 0, refKm: 0, kuesteF: 0,
      // B0 EINE Gestalt je Scheibe: jedes Feld, das ein späterer Leser setzt, steht hier — vorher wuchs die Scheibe Feld um Feld in
      // wechselnder Folge (Meer, Ketten, Mantel, Nachklang, Tafeln), und jeder Leser im Punkt-Pfad sah mehrere Gestalten (polymorph):
      // 6,11 → 4,60 µs je Punkt an erde-01, kein Byte bewegt
      paarC: null, sigmaKm: 0, eisKm: 0, landAnteil: 0, ozeanAlterMittel: 0, meerFertig: false,
      kettenAmp: null, kettenBreite: null, kettenG0: 0, kettenIdx: null, kettenCos: 0,
      dynC: undefined, dynS: undefined, nk: undefined, nahtAmp: undefined, randTafel: undefined,
      sEll: null, zKopf: null, zListe: null, zLB: null, zF: null, zN: 0, kKopf: null, kAnz: null, kListe: null, kN: 0, sKopf: null, sListe: null, sN: 0, paarTafel: null, paarZeilen: null,
    };
    if (ohneQ) return S;
    // Nachbar-Liste aus 4 096 Fibonacci-Proben
    // und die Paar-Rate: Mittel der Normal-Geschwindigkeit längs des gemeinsamen Rands (Proben näher als 250 km)
    const N = 4096, F = fib(N), adj = new Uint8Array(nP * nP), cSum = new Float64Array(nP * nP), cN = new Float64Array(nP * nP);
    const NACHBAR_KM = nachbarKm(R);
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
    // G3.6 die Ketten entstehen beim ersten Leser (punktRoh außerhalb der Hülle): die Scheiben der Hülle und des Bezugs liest keiner
    if (M.scheiben.size > 24) M.scheiben.delete(M.scheiben.keys().next().value);
    M.scheiben.set(key, S);
    return S;
  }

  // Hotspot-Ketten: Spur R_p(t)·R_p(T_k)⁻¹·h. Die Stützen sitzen auf dem ABSOLUTEN Takt T_k = 3,5·k Ma (K5): ein Kegel ist ein
  // Ausbruch zur Zeit T_k und fährt mit der Platte p, die ZU DIESER ZEIT über dem Hotspot lag (G3.1; vorher die Platte von jetzt —
  // kippte sie, sprang die ganze Kette). Die Platte je (Hotspot, k) steht in einer Tafel im Plan-Memo: jede Scheibe liest dieselbe.
  // Der jüngste wächst über 3,5 Ma (glatt), der älteste klingt zwischen 80,5 und 84 Ma aus. Abklingen: Seamount e^(−τ/32),
  // Dom über Kruste e^(−τ/4), je Stütze in kettenAmp.
  function kettenBauen(S) {
    const plan = S.plan, t = S.zeitMa, nH = plan.nH, K = new Float64Array(nH * 24 * 4), KA = new Float64Array(nH * 24 * 2), KB = new Float64Array(nH * 24);
    const qa = new Float64Array(4), qb = new Float64Array(4), qi = new Float64Array(4), qr = new Float64Array(4), v = new Float64Array(3);
    const idx = [], g0 = Math.floor(t / 3.5);
    for (let h = 0; h < nH; h++) {
      const beg = plan.hotspots[6 * h + 3], end = plan.hotspots[6 * h + 4];
      if (beg > t || end < t - 84) continue;
      const hx = plan.hotspots[6 * h], hy = plan.hotspots[6 * h + 1], hzz = plan.hotspots[6 * h + 2];
      let cnt = 0;
      for (let kk = 0; kk < 24; kk++) {
        const tt = (g0 - kk) * 3.5, tau = t - tt;
        if (tt < beg || tt > end || tt < plan.bilder[0]) { K[(h * 24 + kk) * 4 + 3] = -1; continue; }
        // Gegner 2 (F2 Perlenschnur): ein Ausbruch fällt nicht auf den Takt — er liegt 0…3 Ma nach T_k (die Stütze fährt ab da mit
        // der Platte: ungleicher Abstand), seine Stärke streut 0,35…1,25 (jeder achte fällt aus), seine Breite 0,7…1,25. Der Takt
        // T_k bleibt die Stütze (K5): das Einblenden liest die Zeit seit dem Ausbruch, das Ausblenden die Zeit seit T_k — stetig in t.
        const kAbs = g0 - kk, jt = 3.0 * planetZufall(plan.k, 240, h, kAbs), tauE = tau - jt;
        const zSt = planetZufall(plan.k, 242, h, kAbs), staerke = zSt < 0.125 ? 0 : 0.35 + 0.9 * (zSt - 0.125) / 0.875;
        if (staerke === 0) { K[(h * 24 + kk) * 4 + 3] = -1; continue; }   // kein Ausbruch in diesem Takt: weder Kegel noch Vulkan
        const ref = kegelPlatte(plan, h, kAbs), istKont = ref >= 0, rr = istKont ? ref : -1 - ref;
        const tR = tt + jt < t ? tt + jt : t;   // vor dem Ausbruch ist das Gewicht 0; die Lage hält bei t
        if (istKont) { lageScholle(plan, rr, t, qa, 0); lageScholle(plan, rr, tR, qb, 0); } else { lageOzean(plan, rr, t, qa, 0); lageOzean(plan, rr, tR, qb, 0); }
        qi[0] = -qb[0]; qi[1] = -qb[1]; qi[2] = -qb[2]; qi[3] = qb[3];
        qMul(qa, 0, qi, 0, qr, 0); qDreh(qr, 0, hx, hy, hzz, v, 0);
        const ii = (h * 24 + kk) * 4; K[ii] = v[0]; K[ii + 1] = v[1]; K[ii + 2] = v[2]; K[ii + 3] = tau; cnt++;
        const wj = glatt(0, 3.5, tauE) * (1 - glatt(80.5, 84, tau)) * staerke;
        KA[(h * 24 + kk) * 2] = wj * kexp(-tauE / 32); KA[(h * 24 + kk) * 2 + 1] = wj * kexp(-tauE / 4);
        KB[h * 24 + kk] = 0.7 + 0.55 * planetZufall(plan.k, 241, h, kAbs);
      }
      if (cnt > 0) idx.push(h);
    }
    // dicht gepackt: nur die Ketten, die zur Zeit t Stützen tragen (die Hüll-Kappe je Kette fiel mit dem Zellen-Index, kettenKandidaten)
    const n = idx.length, Kc = new Float64Array(n * 96), ka = new Float64Array(n * 48), kb = new Float64Array(n * 24);
    for (let c = 0; c < n; c++) { const h = idx[c]; Kc.set(K.subarray(h * 96, h * 96 + 96), c * 96); ka.set(KA.subarray(h * 48, h * 48 + 48), c * 48); kb.set(KB.subarray(h * 24, h * 24 + 24), c * 24); }
    S.ketten = Kc; S.kettenAmp = ka; S.kettenBreite = kb; S.kettenG0 = g0; S.kettenIdx = Int32Array.from(idx); S.kettenCos = kcos(Math.min(PI, 300 / S.R));
  }

  // G3.1 die Platte über dem Hotspot h zur Ausbruchs-Zeit T = 3,5·kAbs Ma: Bezugs-Scholle (≥ 0) einer Kontinent-Platte oder −1 − j für
  // die Ozean-Platte j; dieselbe Regel wie zuvor (Kruste der Gruppe, sonst die Wertung), gerechnet an einer leichten Scheibe der Zeit T.
  function kegelPlatte(plan, h, kAbs) {
    const M = memoVon(plan); if (!M.kegelPl) { M.kegelPl = new Map(); M.kegelS = new Map(); }
    const key = h * 65536 + kAbs + 32768; const v = M.kegelPl.get(key); if (v !== undefined) return v;
    let S = M.kegelS.get(kAbs);   // leicht: Lage und Wertung, ohne Nachbarn (nie im Memo der Scheiben), eine je Takt
    if (!S) { S = scheibeKern(plan, kAbs * 3.5, true); S.Q = plan.Q; if (M.kegelS.size > 64) M.kegelS.delete(M.kegelS.keys().next().value); M.kegelS.set(kAbs, S); }
    const hx = plan.hotspots[6 * h], hy = plan.hotspots[6 * h + 1], hzz = plan.hotspots[6 * h + 2];
    const fk = krusteFeld(S, hx, hy, hzz, 400, 0); const fg = W_.fGrp;
    plattenWertung(S, hx, hy, hzz);
    let p = W_.best; if (fk > S.Q - 0.06 && fg >= 0) p = fg;
    const r = p < S.nG ? S.abschnitt.mList[S.abschnitt.mStart[p]] : -1 - (p - S.nG);
    M.kegelPl.set(key, r); return r;
  }
  // B0 Die Kosten an den Ort, nie an die Zahl der Schollen (Gebot 7): fern der eigenen Kruste ist der Abstand einer Gruppe das Minimum
  // über ihre Schollen — vorher je Punkt über JEDE Scholle der Gruppe (bei nS 40 im Mittel 24 ellAbst und 35 acosF je Punkt). Eine Zelle
  // des Würfel-Gitters (6·ZN² Zellen, Halbmesser ≤ 0,07 rad) trägt je Gruppe nur die Schollen, deren untere Schranke in der Zelle unter
  // der kleinsten oberen Schranke liegt (fak ∈ [1/a, a], acosF ±2·10⁻⁸ rad, Z_RAND deckt beides): dasselbe Minimum. Gebaut am ersten
  // Punkt der Zelle, je Scheibe (die Schollen fahren mit der Zeit).
  const ZN = 16, Z_RAND = 1e-6;
  let ZMITTE = null;   // je Zelle: Mitte (3) und Halbmesser (1), einmal je Lauf
  function zellenMitten() {
    const n = 6 * ZN * ZN, Z = new Float64Array(4 * n), e = new Float64Array(15);
    const richtung = (f, u, v, o) => {
      const sg = (f & 1) ? -1 : 1, a = f >> 1;
      const px = a === 0 ? sg : u, py = a === 0 ? u : (a === 1 ? sg : v), pz = a === 2 ? sg : v, l = Math.sqrt(px * px + py * py + pz * pz);
      e[o] = px / l; e[o + 1] = py / l; e[o + 2] = pz / l;
    };
    for (let f = 0; f < 6; f++) for (let i = 0; i < ZN; i++) for (let j = 0; j < ZN; j++) {
      const u0 = -1 + 2 * i / ZN, u1 = -1 + 2 * (i + 1) / ZN, v0 = -1 + 2 * j / ZN, v1 = -1 + 2 * (j + 1) / ZN, zi = (f * ZN + i) * ZN + j;
      richtung(f, 0.5 * (u0 + u1), 0.5 * (v0 + v1), 0);
      richtung(f, u0, v0, 3); richtung(f, u1, v0, 6); richtung(f, u0, v1, 9); richtung(f, u1, v1, 12);
      let r = 0; for (let c = 3; c < 15; c += 3) { const w = acosF(e[0] * e[c] + e[1] * e[c + 1] + e[2] * e[c + 2]); if (w > r) r = w; }
      Z[4 * zi] = e[0]; Z[4 * zi + 1] = e[1]; Z[4 * zi + 2] = e[2]; Z[4 * zi + 3] = r;
    }
    return Z;
  }
  function zelleVon(x, y, z) {
    const ax = Math.abs(x), ay = Math.abs(y), az = Math.abs(z);
    let f, u, v;
    if (ax >= ay && ax >= az) { f = x > 0 ? 0 : 1; u = y / ax; v = z / ax; }
    else if (ay >= az) { f = y > 0 ? 2 : 3; u = x / ay; v = z / ay; }
    else { f = z > 0 ? 4 : 5; u = x / az; v = y / az; }
    let i = Math.floor((u + 1) * 0.5 * ZN), j = Math.floor((v + 1) * 0.5 * ZN);
    i = i < 0 ? 0 : (i >= ZN ? ZN - 1 : i); j = j < 0 ? 0 : (j >= ZN ? ZN - 1 : j);
    return (f * ZN + i) * ZN + j;
  }
  const _zTh = new Float64Array(3 * 64);
  function zuwachs(buf, n, Art) { if (n <= buf.length) return buf; const b = new Art(Math.max(n, buf.length + (buf.length >> 1))); b.set(buf); return b; }
  // Block der Zelle in S.zListe ab o: nG + 1 relative Anfänge (je Gruppe g ihre Kandidaten von o + zListe[o + g] bis o + zListe[o + g + 1]),
  // dahinter die Schollen (nG + nS ≤ 96 < 256: ein Byte je Eintrag), je Gruppe aufsteigend nach ihrer unteren Schranke in der Zelle;
  // parallel je Eintrag diese Schranke (zLB, Int16 in 1/1 024 rad) und der kleinste Ellipsen-Faktor der Zelle (zF, Uint8 in 1/160),
  // beide nach unten gerundet: Schranken bleiben Schranken
  function zellenKandidaten(S, x, y, z) {
    const zi = zelleVon(x, y, z);
    if (S.zKopf === null) { S.zKopf = new Int32Array(6 * ZN * ZN).fill(-1); S.zListe = new Uint8Array(1024); S.zN = 0; }
    const o0 = S.zKopf[zi]; if (o0 >= 0) return o0;
    const Zm = ZMITTE || (ZMITTE = zellenMitten()), A = S.abschnitt, sw = S.sw, sr = S.sr, Q = S.Q, E = ellipseJeScholle(S.plan);
    const cx = Zm[4 * zi], cy = Zm[4 * zi + 1], cz = Zm[4 * zi + 2], r = Zm[4 * zi + 3] + Z_RAND;
    const o = S.zN; S.zKopf[zi] = o;
    const nMax = o + S.nG + 1 + S.nS, L = S.zListe = zuwachs(S.zListe, nMax, Uint8Array); let n = o + S.nG + 1;
    if (S.zLB === null) { S.zLB = new Int16Array(L.length); S.zF = new Uint8Array(L.length); }
    const ZB = S.zLB = zuwachs(S.zLB, L.length, Int16Array), ZF = S.zF = zuwachs(S.zF, L.length, Uint8Array);
    const sm = S.sm, TG = tangentenJeScholle(S.plan);
    for (let g = 0; g < S.nG; g++) {
      let ubMin = Infinity;
      for (let i = A.mStart[g]; i < A.mStart[g + 1]; i++) {
        const s = A.mList[i], dc = cx * sw[3 * s] + cy * sw[3 * s + 1] + cz * sw[3 * s + 2], th = acosF(dc), a = E[3 * s + 2], k = i - A.mStart[g];
        // fak² = 1/a² + (a² − 1/a²)·sin²ψ, ψ das Azimut um die Scholle gegen ihre Ellipse: in der Zelle weicht ψ höchstens um
        // δ = asin(sin r / sin θ) ≤ (π/2)·r / sin θ ab, und sin²ψ ist 1-Lipschitz in ψ
        let s2lo = 0, s2hi = 1;
        const sinTh = Math.sqrt(Math.max(0, 1 - dc * dc));
        if (sinTh > 2 * r && th > r && th + r < PI) {
          const o = 9 * s, lx = sm[o] * cx + sm[o + 3] * cy + sm[o + 6] * cz, ly = sm[o + 1] * cx + sm[o + 4] * cy + sm[o + 7] * cz, lz = sm[o + 2] * cx + sm[o + 5] * cy + sm[o + 8] * cz;
          const pu = lx * TG[6 * s] + ly * TG[6 * s + 1] + lz * TG[6 * s + 2], pv = lx * TG[6 * s + 3] + ly * TG[6 * s + 4] + lz * TG[6 * s + 5];
          const ru = E[3 * s] * pu + E[3 * s + 1] * pv, rv = -E[3 * s + 1] * pu + E[3 * s] * pv, q2 = ru * ru + rv * rv;
          if (q2 > 1e-18) { const s2 = rv * rv / q2, dl = HALBPI * r / sinTh + Z_RAND; s2lo = Math.max(0, s2 - dl); s2hi = Math.min(1, s2 + dl); }
        }
        const fLo = Math.sqrt(1 / (a * a) + (a * a - 1 / (a * a)) * s2lo) * (1 - 1e-9), fHi = Math.sqrt(1 / (a * a) + (a * a - 1 / (a * a)) * s2hi) * (1 + 1e-9);
        _zTh[3 * k] = (th > r ? th - r : 0) * fLo - sr[s] * (1 - Q); _zTh[3 * k + 2] = fLo;
        // B1 die obere Schranke gilt nur, wo die Scholle in der GANZEN Zelle außerhalb ihres Fensters liegt: darin liest die Wertung
        // das Feld mit Lappen ((Q − f)·r), das die Geometrie nicht schrankt
        const ub = Math.min(PI + Z_RAND, th + r) * fHi - sr[s] * (1 - Q); _zTh[3 * k + 1] = ub;
        if (ub < ubMin && th - r > Math.min(PI, sr[s] * FENSTER * a) + 1e-5) ubMin = ub;
      }
      L[o + g] = n - o;
      const n0 = n;
      for (let i = A.mStart[g]; i < A.mStart[g + 1]; i++) {
        const k = i - A.mStart[g]; if (!(_zTh[3 * k] < ubMin)) continue;
        const lb = Math.max(-32768, Math.min(32767, Math.floor(_zTh[3 * k] * 1024))), fl = Math.min(255, Math.floor(_zTh[3 * k + 2] * 160 * (1 - 1e-9)));
        let p = n++; while (p > n0 && ZB[p - 1] > lb) { L[p] = L[p - 1]; ZB[p] = ZB[p - 1]; ZF[p] = ZF[p - 1]; p--; }
        L[p] = A.mList[i]; ZB[p] = lb; ZF[p] = fl;
      }
    }
    L[o + S.nG] = n - o; S.zN = n;
    return o;
  }
  // B0 dasselbe Gitter für die Hotspot-Ketten: je Zelle die Stützen (q2·24 + kk, in der Folge des Gangs), deren 300-km-Scheibe die
  // Zelle berühren kann. Vorher prüfte jeder Punkt jede Stütze jeder Kette, deren Kappe ihn deckt — auf dem Mond deckt fast jede
  // Kappe jeden Punkt (755 von 1 775 Proben in punktRoh). Dieselben Stützen in derselben Folge: dieselben Bytes.
  function kettenKandidaten(S, x, y, z) {
    const zi = zelleVon(x, y, z);
    if (S.kKopf === null) { S.kKopf = new Int32Array(6 * ZN * ZN).fill(-1); S.kAnz = new Uint16Array(6 * ZN * ZN); S.kListe = new Uint16Array(1024); S.kN = 0; }
    if (S.kKopf[zi] >= 0) return zi;
    const Zm = ZMITTE || (ZMITTE = zellenMitten()), K = S.ketten, nK = S.kettenIdx.length;
    const cx = Zm[4 * zi], cy = Zm[4 * zi + 1], cz = Zm[4 * zi + 2], schwelle = kcos(Math.min(PI, 300 / S.R + Zm[4 * zi + 3] + Z_RAND));
    const o = S.kN; let n = o;
    for (let q = 0; q < nK * 24; q++) {
      const ii = 4 * q; if (K[ii + 3] < 0) continue;
      if (cx * K[ii] + cy * K[ii + 1] + cz * K[ii + 2] < schwelle) continue;
      S.kListe = zuwachs(S.kListe, n + 1, Uint16Array); S.kListe[n++] = q;
    }
    S.kKopf[zi] = o; S.kAnz[zi] = n - o; S.kN = n;
    return zi;
  }
  // B0 dasselbe Gitter für das Krustenfeld: je Zelle die Schollen, deren Fenster (d ≥ sAus, Winkel sr·FENSTER·a) die Zelle erreichen
  // kann, aufsteigend wie der Gang. Vorher prüfte jeder Punkt jede Scholle (nS Skalarprodukte, bei nS 40 der Löwenanteil von
  // krusteFeld). Die Prüfung je Punkt bleibt; die Zelle streicht nur, was dort sicher außerhalb liegt: dieselben Bytes.
  function krustenKandidaten(S, x, y, z) {
    const zi = zelleVon(x, y, z);
    if (S.sKopf === null) { S.sKopf = new Int32Array(6 * ZN * ZN).fill(-1); S.sListe = new Uint8Array(1024); S.sN = 0; }
    const o0 = S.sKopf[zi]; if (o0 >= 0) return o0;
    const Zm = ZMITTE || (ZMITTE = zellenMitten()), sw = S.sw, sr = S.sr, E = ellipseJeScholle(S.plan);
    const cx = Zm[4 * zi], cy = Zm[4 * zi + 1], cz = Zm[4 * zi + 2], r = Zm[4 * zi + 3] + Z_RAND;
    const o = S.sN; S.sKopf[zi] = o;
    const L = S.sListe = zuwachs(S.sListe, o + 1 + S.nS, Uint8Array); let n = o + 1;
    for (let s = 0; s < S.nS; s++) {
      const al = Math.min(PI, sr[s] * FENSTER * E[3 * s + 2]) + 1e-5;   // der Winkel von sAus, kcos ±10⁻¹⁶ in 10⁻⁵ rad gedeckt
      if (al < PI && acosF(cx * sw[3 * s] + cy * sw[3 * s + 1] + cz * sw[3 * s + 2]) - r > al) continue;
      L[n++] = s;
    }
    L[o] = n - o - 1; S.sN = n;
    return o;
  }
  // ── Platten-Wertung (gerichtete Potenz-Wertung, K1/K3) ─────────────────────────────────────────────────
  const W_ = { sc: new Float64Array(MAX_P), sx: new Float64Array(MAX_P), dC: new Float64Array(MAX_P), best: -1, zweit: -1, qx: 0, qy: 0, qz: 0, fGrp: -1 };
  const _dIn = new Float64Array(MAX_P), _anIn = new Int32Array(MAX_P);
  // B1 der elliptische Abstand fern des Fensters liest EINE 2×3-Matrix je Scholle und Scheibe (Drehung · Tangente · Ellipse vorab
  // gefaltet): 6 statt 19 Produkte je Kandidat, ±10⁻¹⁰ km (nur Rundung). Der Gang über die fernen Gruppen trägt die Kosten der
  // Platten-Zahl (kosten.platten nP 7 ↔ 19: +41 → +35 %)
  function ellMatrix(S) {
    const nS = S.plan.nS, sm = S.sm, TG = tangentenJeScholle(S.plan), E = ellipseJeScholle(S.plan), M = new Float64Array(6 * nS);
    for (let s = 0; s < nS; s++) for (let c = 0; c < 3; c++) {
      const o = 9 * s + 3 * c, pu = sm[o] * TG[6 * s] + sm[o + 1] * TG[6 * s + 1] + sm[o + 2] * TG[6 * s + 2], pv = sm[o] * TG[6 * s + 3] + sm[o + 1] * TG[6 * s + 4] + sm[o + 2] * TG[6 * s + 5];
      M[6 * s + c] = E[3 * s] * pu + E[3 * s + 1] * pv; M[6 * s + 3 + c] = -E[3 * s + 1] * pu + E[3 * s] * pv;
    }
    return (S.sEll = M);
  }
  function plattenWertung(S, x, y, z, grob) {
    const R = S.R, plan = S.plan;
    const sw0 = plan.saatW;
    let qx = x, qy = y, qz = z;
    if (!grob) {
      // Gegner 3: Plattengrenzen sind fraktal, keine Kreisbögen und Polylinien — Verzug in drei Oktaven (2 600 · 800 · 260 km),
      // der Versatz weich auf PLATTEN_VERZUG_KM begrenzt (die Nachbar-Liste rechnet mit genau dieser Schranke).
      let dx = 0, dy = 0, dz = 0;
      for (let o = 0; o < 3; o++) {
        const wf = R / VERZUG_LAM[o], a = VERZUG_AMP[o], so = sw0 + 3 * o;
        dx += a * rausch(so, x * wf, y * wf, z * wf); dy += a * rausch(so + 1, x * wf + 5.1, y * wf, z * wf); dz += a * rausch(so + 2, x * wf, y * wf - 3.3, z * wf);
      }
      const dl = Math.sqrt(dx * dx + dy * dy + dz * dz), kap = dl > 1e-9 ? PLATTEN_VERZUG_KM / Math.sqrt(dl * dl + PLATTEN_VERZUG_KM * PLATTEN_VERZUG_KM) : 1;
      qx += dx * kap / R; qy += dy * kap / R; qz += dz * kap / R;
    }
    const ql = Math.sqrt(qx * qx + qy * qy + qz * qz); qx /= ql; qy /= ql; qz /= ql;
    W_.qx = qx; W_.qy = qy; W_.qz = qz;
    const A = S.abschnitt, sw = S.sw, sr = S.sr, sc = W_.sc, Q = S.Q;
    let best = -1, bv = -1e9, zw = -1, zv = -1e9, zo = -1, dIn = null;
    for (let g = 0; g < S.nG; g++) {
      // Abstand zur Krusten-Kante der Gruppe aus DEMSELBEN Krustenfeld (mit Rauschen), das die Küste zieht (K1);
      // fern der Schollen (Feld ohne Rauschen) dieselbe Formel geometrisch — stetig am Übergang.
      let dmin = 1e9, an = -1;
      if (grob) { // grobe Lesart (untere Schranke): Obermenge der Nachbarn
        for (let i = A.mStart[g]; i < A.mStart[g + 1]; i++) {
          const s = A.mList[i];
          const lb = acosF(x * sw[3 * s] + y * sw[3 * s + 1] + z * sw[3 * s + 2]) / ellipseJeScholle(plan)[3 * s + 2] - sr[s] * (1 - Q);
          if (lb < dmin) { dmin = lb; an = s; }
        }
      } else {
        // B1 der Abstand der Gruppe ist das Minimum je Scholle: im Fenster aus ihrem GROBEN Feld (Q − f_s)·r_s — es zieht die Küste —,
        // außerhalb geometrisch; am Rand des Fensters trägt das Feld kein Rauschen (FENSTER), beide sind dort dieselbe Zahl: dmin ist
        // stetig. Vorher schaltete gF > −0,74 zwischen beiden (am Rand des Fensters mit Lappen) und r las die beste Scholle (r_a → r_b).
        if (dIn === null) {
          dIn = _dIn; for (let h = 0; h < S.nG; h++) { _dIn[h] = 1e9; _anIn[h] = -1; }
          for (let q = 0; q < KF.nIn; q++) { const s = KF.inL[q], h = S.sgrp[s], d = (Q - KF.sFg[s]) * sr[s]; if (d < _dIn[h]) { _dIn[h] = d; _anIn[h] = s; } }
        }
        dmin = _dIn[g]; an = _anIn[g];
        // B0 nur die Kandidaten der Zelle (zellenKandidaten): dasselbe Minimum ohne den Gang über jede Scholle der Gruppe
        if (zo < 0) zo = zellenKandidaten(S, x, y, z);
        const ZL = S.zListe, ZB = S.zLB, ZF = S.zF, EM = S.sEll || ellMatrix(S), E = ellipseJeScholle(plan);
        for (let i = zo + ZL[zo + g], i1 = zo + ZL[zo + g + 1]; i < i1; i++) {
          // die Schranke der Zelle steigt im Gang: liegt sie über dem Kleinsten, liegen alle weiteren dort (dmin ist ein Minimum —
          // die Folge ändert es nicht; an liest nur an ≥ 0)
          if (ZB[i] * (1 / 1024) >= dmin) break;
          const s = ZL[i]; if (KF.sIn[s]) continue;   // im Fenster: oben aus dem Feld
          const ac = acosF(x * sw[3 * s] + y * sw[3 * s + 1] + z * sw[3 * s + 2]), sq = sr[s] * (1 - Q);
          // untere Schranke am Punkt mit dem kleinsten Faktor der Zelle (zF ≤ fak): genau, nur schneller
          if (ac * (ZF[i] * 0.00625) - sq >= dmin) continue;
          // elliptischer Winkel-Abstand zur Mitte der Scholle s (dieselbe Ellipse wie ihr Krustenfeld), der Winkel EINMAL je Kandidat
          const o = 6 * s, ru = EM[o] * x + EM[o + 1] * y + EM[o + 2] * z, rv = EM[o + 3] * x + EM[o + 4] * y + EM[o + 5] * z, a = E[3 * s + 2], q2 = ru * ru + rv * rv;
          const fak = q2 > 1e-18 ? Math.sqrt((ru * ru / (a * a) + rv * rv * a * a) / q2) : 1;
          const d = ac * fak - sq;
          if (d < dmin) { dmin = d; an = s; }
        }
      }
      W_.dC[g] = dmin;
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
    // G1.2 Lappen in zwei Bändern: das GROBE Band (λ min(6 000 km, 2·rs) … 0,45·λ0) liegt auf dem ganzen Feld ab f > −1,3 mit
    // Amplitude LAPPEN_GROB — es trägt Halbinseln, Buchten und die Gestalt; die Tektonik liest nur dieses Band (KF.sFg).
    // Das FEINE Band (0,45·λ0 … lamCut) liegt wie zuvor nur im Küsten-Gürtel, sein Fenster liest das GROBE f; das Profil liest voll.
    let f = 1 - acosF(d) * fak / rs;
    SF.grob = f;
    if (f > -1.3) {
      const seed = plan.schollen[8 * s + 5] | 0, lam0 = Math.min(3000, rs * R * 1.0), lamG = Math.min(6000, rs * R * 2.0), lamF = lam0 * 0.45;
      // Verzug (Domain-Warp) im eigenen Rahmen, dann fBm: die Küste zieht im Rand-Gürtel das Rauschen
      const wf = R / (lam0 * 1.1);
      const w1 = rausch(seed + 11, lx * wf, ly * wf, lz * wf), w2 = rausch(seed + 12, lx * wf + 3.7, ly * wf, lz * wf), w3 = rausch(seed + 13, lx * wf, ly * wf - 2.9, lz * wf);
      // Gegner 3 (Fell-Küste, Schmier-Fahne): der Gewinn je Oktave bleibt 0,75 — gemessen trägt er die Küsten-Dimension D 1,18
      // (kueste.dimension, Band 1,15–1,35); 0,59 glättete auf D 1,08, 0,70 auf 1,13 (beide ROT). Die Fahnen kamen vom Verzug:
      // er bleibt jetzt unter einer halben Wellenlänge (0,45 statt 0,8). Die Hülle liest dieselbe Reihe, nur früher abgeschnitten
      // (vorher eigener Gewinn 0,62 — ein Zwilling der Reihe).
      const wamp = 0.45 * lam0 / R;
      const ux = lx + wamp * w1, uy = ly + wamp * w2, uz = lz + wamp * w3;
      const lap = plan.schollen[8 * s + 6];
      f += LAPPEN_GROB * fbmKm(seed + 7, ux, uy, uz, R, lamG, Math.max(lamCut, lamF), KUESTE_GEWINN) * glatt(-1.3, -0.5, f) * lap;
      SF.grob = f;
      if (!nurGrob && lamCut < lamF && f > -0.75 && f < 0.6) {
        f += LAPPEN_FEIN * fbmKm(seed, ux, uy, uz, R, lamF, lamCut, KUESTE_GEWINN) * glatt(-0.75, -0.25, f) * (1 - glatt(0.3, 0.6, f)) * lap;
      }
    }
    return f;
  }

  // ── Krustenfeld: Vereinigung aller Schollen-Felder, jedes im eigenen Rahmen (K1) ──────────────────────
  const SF = { grob: 0 };   // das GROBE Feld der zuletzt gerechneten Scholle (G1.3: die Tektonik liest es)
  const KF = { gV: new Float64Array(MAX_P), sBest: -1, fBest: -9, sF: new Float64Array(64), sFg: new Float64Array(64), sLx: new Float64Array(64 * 3), sIn: new Uint8Array(64), inL: new Uint8Array(64), nIn: 0 };
  function krusteFeld(S, x, y, z, fussKm, nurGrob) {
    const plan = S.plan, R = S.R, sw = S.sw, sm = S.sm, sr = S.sr, Q = S.Q;
    const lamCut = Math.max(32, 2 * fussKm);
    const gV = KF.gV; for (let g = 0; g < S.nG; g++) gV[g] = -9;
    let fBest = -9, sBest = -1, nIn = 0;
    // sIn trägt genau die Schollen im Fenster (Leser: die Kante der besten Scholle); sF, sFg, sLx lesen alle nur über inL
    for (let q = 0; q < KF.nIn; q++) KF.sIn[KF.inL[q]] = 0;
    const ko = krustenKandidaten(S, x, y, z), KL = S.sListe;
    for (let e = ko + 1, e1 = ko + 1 + KL[ko]; e < e1; e++) {
      const s = KL[e];
      const d = x * sw[3 * s] + y * sw[3 * s + 1] + z * sw[3 * s + 2];
      if (d < S.sAus[s]) continue;
      const o = 9 * s;
      const lx = sm[o] * x + sm[o + 3] * y + sm[o + 6] * z, ly = sm[o + 1] * x + sm[o + 4] * y + sm[o + 7] * z, lz = sm[o + 2] * x + sm[o + 5] * y + sm[o + 8] * z;
      KF.sLx[3 * s] = lx; KF.sLx[3 * s + 1] = ly; KF.sLx[3 * s + 2] = lz; KF.sIn[s] = 1; KF.inL[nIn++] = s;
      const f = schollenFeld(plan, s, lx, ly, lz, d, lamCut, nurGrob);
      const fg = SF.grob; KF.sF[s] = f; KF.sFg[s] = fg;
      const g = S.sgrp[s], av = gV[g];
      // weiches Maximum in der Gruppe: gV voll (Profil, K1-Vorrang, Q); die Tektonik liest das grobe Feld je Scholle (sFg, G1.3)
      const hv = Math.max(0.1 - Math.abs(av - f), 0) / 0.1; gV[g] = Math.max(av, f) + hv * hv * 0.025;
      if (f > fBest) { fBest = f; sBest = s; }
    }
    let gb = -1, gv = -9; for (let g = 0; g < S.nG; g++) if (gV[g] > gv) { gv = gV[g]; gb = g; }
    KF.sBest = sBest; KF.fBest = fBest; KF.nIn = nIn; W_.fGrp = gb;
    return gv;
  }

  // ── Paar-Relativbewegung am Punkt ─────────────────────────────────────────────────────────────────────
  const PR = { c: 0, scher: 0, rate: 0, nl: 1 };
  // B0/B1 die Tangente jeder Platte am Punkt einmal je Punkt (Stempel je Scheibe und Punkt): jedes Paar am Ort liest sie
  const TAN = new Float64Array(3 * MAX_P), _tanNr = new Int32Array(MAX_P), TA = { S: null, qx: 0, qy: 0, qz: 0, nr: 1 };
  function ankerTangente(S, i, qx, qy, qz) {
    if (S !== TA.S || qx !== TA.qx || qy !== TA.qy || qz !== TA.qz) { TA.S = S; TA.qx = qx; TA.qy = qy; TA.qz = qz; TA.nr++; }
    if (_tanNr[i] === TA.nr) return;
    const ax = S.pz[3 * i], ay = S.pz[3 * i + 1], az = S.pz[3 * i + 2]; // stetiger Anker: Schwerpunkt bzw. Stätte
    const d = ax * qx + ay * qy + az * qz; let tx = ax - d * qx, ty = ay - d * qy, tz = az - d * qz; const l = Math.sqrt(tx * tx + ty * ty + tz * tz) || 1;
    TAN[3 * i] = tx / l; TAN[3 * i + 1] = ty / l; TAN[3 * i + 2] = tz / l; _tanNr[i] = TA.nr;
  }
  function paarRelativ(S, i, j, qx, qy, qz) {
    ankerTangente(S, i, qx, qy, qz); ankerTangente(S, j, qx, qy, qz);
    // Normale von i nach j: grad s_j − grad s_i (beide zeigen zu ihrem Anker)
    const a = 3 * i, b = 3 * j;
    let nx = TAN[b] - TAN[a], ny = TAN[b + 1] - TAN[a + 1], nz = TAN[b + 2] - TAN[a + 2]; let nl = Math.sqrt(nx * nx + ny * ny + nz * nz);
    PR.nl = nl;
    if (nl < 1e-9) { nx = -TAN[a]; ny = -TAN[a + 1]; nz = -TAN[a + 2]; nl = 1; }
    nx /= nl; ny /= nl; nz /= nl;
    const wx = S.pom[3 * i] - S.pom[3 * j], wy = S.pom[3 * i + 1] - S.pom[3 * j + 1], wz = S.pom[3 * i + 2] - S.pom[3 * j + 2];
    const vx = (wy * qz - wz * qy) * S.R, vy = (wz * qx - wx * qz) * S.R, vz = (wx * qy - wy * qx) * S.R;
    PR.c = vx * nx + vy * ny + vz * nz;
    const sx = qy * nz - qz * ny, sy = qz * nx - qx * nz, sz = qx * ny - qy * nx;
    PR.scher = Math.abs(vx * sx + vy * sy + vz * sz);
    PR.rate = Math.sqrt(vx * vx + vy * vy + vz * vz);
  }
  // G2.4 An der Grenze entscheidet das PAAR: jenseits beider Anker (Kruste über Kruste in der Kollision) wird die Normale t_j − t_i
  // kurz und kippt am Großkreis der Anker — c sprang dort von +49 auf −49 km/Ma auf 9 km Weg (Lineal-Kante, Befund Punkt 4). Wo
  // |n| < 0,8, trägt die Paar-Rate paarC (je Scheibe fest, am gemeinsamen Rand gemessen): c = c·g + paarC·(1 − g), g = glatt(0,3; 0,8; |n|).
  // Jeder Leser von c am Punkt (Versatz-Treppe, Rand-Art, Schablonen) liest diesen Wert; paarC selbst misst das rohe c.
  function paarRelativC(S, i, j, qx, qy, qz) {
    paarRelativ(S, i, j, qx, qy, qz);
    const g = glatt(0.3, 0.8, PR.nl);
    PR.c = PR.c * g + S.paarC[i * S.nP + j] * (1 - g);
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

  // Alter des Ozean-Bodens an einem Rand der Platte i zum Nachbarn j im Abstand xKm: mit der Öffnungs-Rate des PAARS (am Rand
  // gemessen, je Scheibe fest), stetig im Raum; bei Öffnung zwischen Kontinenten T_offen·d_R/(d_R + d_Rand) (K6). EINE Funktion für
  // die eigene Seite und für die Partner-Seite des Sockels (G2.5).
  // B0 Die Teile, die nur am Paar hängen (Nenner der Öffnung, Sockel, K6-Zeit und -Fenster), stehen je Scheibe in der Paar-Tafel —
  // je Punkt und Rand bleibt der Abstand. Dieselben Ausdrücke einmal je Paar: dieselben Bytes. Zeilenweise am ersten Rand der Platte.
  function paarZeile(S, A, i) {
    const nP = S.nP, t = S.zeitMa;
    if (S.paarTafel === null) { S.paarTafel = new Float64Array(5 * nP * nP); S.paarZeilen = new Uint8Array(nP); }
    const PT = S.paarTafel;
    for (let j = 0; j < nP; j++) {
      const o = 5 * (i * nP + j), offenPaar = Math.max(0, -S.paarC[i * nP + j]);
      // ein Rand, der nicht öffnet, erzeugt keinen Boden: + 1 000 Ma, stetig über die Rate (vorher stand am konvergenten Rand auf
      // dem ersten Kilometer Boden von 0,05 Ma — ein Grat junger Tiefe von 1 km Breite an jeder Subduktion)
      PT[o] = offenPaar * 0.5 + 0.05; PT[o + 1] = 1000 * (1 - glatt(0, 1, offenPaar)); PT[o + 2] = -1;
      if (i < S.nG && j < S.nG) {
        const to = A.tOffen[i * A.nG + j];
        if (to > -1e8) {
          // K6 nur ZWISCHEN den getrennten Kontinenten: dort ist Rücken-Abstand + Rand-Abstand die halbe Öffnung (hr·T).
          // Jenseits des eigenen Kontinents (x + d_Rand weit größer) gilt die Regel nicht — dort entscheiden andere Rücken.
          const T = Math.max(1, t - to), L = (offenPaar * 0.5 + 0.05) * T + 150;
          PT[o + 2] = T; PT[o + 3] = 1.3 * L; PT[o + 4] = 2.0 * L - 1.3 * L;   // das Fenster glatt(1,3·L; 2·L; x + d_R)
        }
      }
    }
    S.paarZeilen[i] = 1;
  }
  function randAlter(S, A, i, j, xKm, dCi) {
    if (S.paarTafel === null || S.paarZeilen[i] === 0) paarZeile(S, A, i);
    const PT = S.paarTafel, o = 5 * (i * S.nP + j), T = PT[o + 2];
    let a = xKm / PT[o] + PT[o + 1];
    if (T >= 0) {
      const dR = Math.max(0, dCi);
      let u = (xKm + dR - PT[o + 3]) / PT[o + 4]; u = u < 0 ? 0 : (u > 1 ? 1 : u);
      const wz = 1 - u * u * (3 - 2 * u);
      a = wz > 1e-3 ? (T * xKm / (xKm + dR + 1)) / wz : 1e6;
    }
    return a < 0.05 ? 0.05 : a;
  }
  function alterAusSumme(invA, kap) { // p-Norm (p = 4) über die Ränder, weich gedeckelt bei bodenAlterMaxMa
    const alter = invA > 0 ? 1 / Math.sqrt(Math.sqrt(invA)) : 1e6, r = alter / kap, r2 = r * r;
    return alter / Math.sqrt(Math.sqrt(1 + r2 * r2));
  }
  // G2.5 Graben-Profil in der vorzeichenbehafteten Distanz ξ quer zur Grenze (ξ > 0 auf der abtauchenden Platte): Achse bei 40 km,
  // Außen-Schwelle bei 170 km. Die obere Platte liest dasselbe Profil mit ξ = −x — eine Rinne zwischen zwei Flanken, keine Stufe.
  function graben(xi, s) { return -3.0 * s * gauss(xi - 40, 45) + 0.25 * s * gauss(xi - 170, 70); }
  function gdh1(a) { return a < 20 ? 2.6 + 0.365 * Math.sqrt(a > 0 ? a : 0) : 5.651 - 2.473 * kexp(-0.0278 * a); }

  // G2.1 Die Wurzel (Isostasie): ein Gebirge verliert seine Höhe nicht mit EINER Zeitkonstante — die Krustenwurzel hebt nach.
  // EINE Funktion für beide Leser des Gedächtnisses (Nähte und erloschene Ränder), zwei Zeitkonstanten: e^(−a/120) + 0,15·e^(−a/1 500).
  // Ein 5-km-Gürtel steht nach 300 Ma bei ~1,0 km, nach 1 Ga bei ~0,4 km (gerechnet; Appalachen, Ural, Grenville als Richtwerte,
  // ungeprüft). 0,15 und 1 500 Ma sind gesetzt (ENTSCHEID-2 §G2.1), nicht geeicht.
  const WURZEL_ANTEIL = 0.15, WURZEL_TAU = 1500;
  function gedaechtnisHoehe(H0, a) { return H0 * (kexpS(-a / TAU_A) + WURZEL_ANTEIL * kexpS(-a / WURZEL_TAU)); }
  // G3.7 die erloschenen Ränder je Scheibe als Tafel (wie die Nähte): Höhe gedaechtnisHoehe(H0, a), Breite 85·(1 + a/200), Alter a —
  // vorher je Punkt und Fächer neu gerechnet (vier Exponenten, 32 % der Zeit von planetOrt). Dieselben Formeln, dieselben Bytes.
  function randTafel(S) {
    const A = S.abschnitt, t = S.zeitMa, n = S.nS * 32, T = new Float64Array(3 * n);
    for (let i = 0; i < n; i++) {
      const tEnd = A.rand[2 * i], H0 = A.rand[2 * i + 1];
      if (H0 <= 0 || tEnd > t + 1e-3) { T[3 * i] = -1; continue; }   // tEnd ist Float32: am Schlüsselbild selbst gilt das Gedächtnis schon
      const a = t > tEnd ? t - tEnd : 0;
      T[3 * i] = gedaechtnisHoehe(H0, a); T[3 * i + 1] = 85 * (1 + (a < 400 ? a : 400) / 200); T[3 * i + 2] = a;   // Breite ≤ 2 × Anfang = 255 km (Gegner 2 F1)
    }
    S.randTafel = T; return T;
  }
  // Gegner 2 (F4): die Form jedes Rand-Fachs aus dem Plan — Erhalt (glatt(0,1; 0,3) einer Ziehung, mal 0,75…1: etwa ein Fünftel abgetragen) und Lage des
  // Kamms landein (150–600 km, glatt längs des Streichens). Ein Gürtel ist nicht überall gleich erhalten und liegt nicht im festen Abstand zur Küste. Gesetzt.
  function randForm(plan) {
    if (plan === RF_P) return RF_V;
    const r = randFormPlan(plan); RF_P = plan; RF_V = r; return r;
  }
  function randFormPlan(plan) {
    const M = memoVon(plan); if (M.randForm) return M.randForm;
    const n = plan.nS * 32, F = new Float64Array(2 * n), k = plan.k;
    for (let i = 0; i < n; i++) {
      const s = (i / 32) | 0, f = i - 32 * s;
      F[2 * i] = glatt(0.1, 0.3, planetZufall(k, 230, s, f)) * (0.75 + 0.25 * planetZufall(k, 232, s, f));
      // Lage längs des Streichens GLATT (drei Harmonische im Azimut, Gewicht 1/m): Fach-weise gezogen sprang sie zwischen Nachbarn um
      // bis 450 km auf ~150 km Bogen — der Kamm lief radial (gemessen: V-Strahlen an erde-08, Scholle 9)
      let u = 0, wsum = 0;
      for (let m = 1; m <= 3; m++) { u += ksin(m * (f + 0.5) / 32 * TAU + TAU * planetZufall(k, 231, s, m)) / m; wsum += 1 / m; }
      F[2 * i + 1] = 150 + 450 * (0.5 + 0.5 * u / wsum);
    }
    M.randForm = F; return F;
  }
  function nahtTafel(S) {
    const plan = S.plan, nae = plan.naehte, n = nae.length / 8, A = new Float64Array(n), t = S.zeitMa, gS = plan.gS;
    for (let i = 0; i < n; i++) { const a = t - nae[8 * i + 4]; A[i] = a > 0 ? gedaechtnisHoehe(nae[8 * i + 5], a) * (1 - kexpS(-a / TAU_W)) * gS : 0; }
    S.nahtAmp = A; return A;
  }

  // ── Der Punkt ───────────────────────────────────────────────────────────────────────────────────────────
  const PK = {
    hA: 0, hB: 0, kont: 0, kruste: 0, scholle: -1, platte: -1, nachbar: -1, randArt: 0, randAbstandKm: 1e9, randRateCmA: 0,
    ozeanAlterMa: 0, orogenStaerke: 0, orogenAlterMa: 0, orogenAktiv: 0, vulkanArt: 0, vulkanAbstandKm: 1e9, vulkanAlterMa: 0, vulkanId: -1, vulkanAktiv: 0, fK: 0,
    // G3.2 die Terme der Höhe (Summe = hA): Ozean-Boden · Profil (Hang, Schelf, Freibord, Becken) · Mantel · Schablone · Trapp ·
    // Gebirge (= max(Orogen, Gedächtnis)) · Kegel · Nachklang. Gelesen nur von der Linse zeit.stetig (_intern.terme), sie nennt den Täter.
    tBoden: 0, tProfil: 0, tMantel: 0, tSchablone: 0, tTrapp: 0, tOro: 0, tMem: 0, tGeb: 0, tKegel: 0, tNk: 0,
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
    if (nk === null) { PK.tNk = 0; return h; }
    const A = S.abschnitt, i = PK.platte;
    for (let k = 0; k < PK_SCHLUESSEL.length; k++) PK_SICHER[PK_SCHLUESSEL[k]] = PK[PK_SCHLUESSEL[k]];
    qAchse(A.achse[3 * i], A.achse[3 * i + 1], A.achse[3 * i + 2], -A.winkel[i] * nk.e, _nkq, 0);
    qDreh(_nkq, 0, x, y, z, _nkv, 0);
    const vx = _nkv[0], vy = _nkv[1], vz = _nkv[2];
    // Gegner 2 (Zahl §5): die Höhe ist hA + hB·refKm — der Nachklang mischt BEIDE Teile, sonst springt der Kontinent-Anteil hB am
    // Wechsel ungemischt aus dem neuen Abschnitt (gemessen bis 273 m in 2·10⁻⁵ Ma, Land taucht auf). Dieselbe Gewichtung w.
    const hAlt = punktRoh(nk.alt, vx, vy, vz, fussKm, huelle), bAlt = PK.hB;
    const hNeu = punktRoh(nk.neu, vx, vy, vz, fussKm, huelle), bNeu = PK.hB;
    for (let k = 0; k < PK_SCHLUESSEL.length; k++) PK[PK_SCHLUESSEL[k]] = PK_SICHER[PK_SCHLUESSEL[k]];
    PK.tNk = nk.w * (hAlt - hNeu);
    PK.hA = h + PK.tNk;
    PK.hB += nk.w * (bAlt - bNeu);
    return PK.hA;
  }
  // B1 Die Naht gehört dem PAAR (Gesetz §4): der Abstand einer Platte p zum Rand gegen ihren Nachbarn j ist EINE Funktion des Paars,
  // vorzeichenbehaftet und gegenläufig, ξ(j, p) = −ξ(p, j) — die Wertung (s = (sx_p − sx_j)·R/2) plus die Versatz-Treppe des Paars,
  // geklemmt an die Krusten-Kanten beider Seiten (K1: die eigene Kruste liegt diesseits, ξ ≥ c_p; die fremde jenseits, ξ ≤ −c_j;
  // c = (gV − Q + 0,05)·r·R, im Inneren der Kruste positiv). Vorher vier Zweige: der K1-Schalter aufKruste (Kruste ↔ Wertung), der
  // Partner jenseits der Kruste (RX), die Treppe, die auf der Kruste klemmte und daneben tauschte, und der Entscheid mit Vorrang ×12
  // gegen den Abstand ohne ihn — an jedem sprang die Höhe (b-stetig erde-01: Platte 102, Scholle 223, Kruste 74 von je 400).
  const NAHT_KM = 100;
  const KC = new Float64Array(MAX_P), XI = { nah: -1, iiNah: -1, nK: 0 }, _kand = new Int32Array(MAX_P), _besucht = new Uint8Array(MAX_P);
  function med3(a, b, c) { return a < b ? (b < c ? b : (a < c ? c : a)) : (a < c ? a : (b < c ? c : b)); }
  // die Versatz-Treppe des Rückens (K5: das Material gleitet längs des Rands durch die Treppe): ein Versatz des Paar-Rands um ±dlt,
  // je Abschnitt (260–560 km längs) gezogen, über die letzten 6 % geglättet, ≤ 80 km, mit der Öffnung des Paars; gegenläufig im Paar
  // (lo trägt +dlt) und stetig gegen 0 über |s| 300 … 400 km (vorher brach er bei mHaupt = 400 ab). Liest PR des Paars am Punkt.
  function treppe(S, p, j, s, x, y, z) {
    if (!(PR.c < 0)) return 0;
    laengs(S, p, j, x, y, z); if (!LG.ok) return 0;
    const div = Math.min(1, -PR.c / Math.max(PR.rate, 1e-6) * 1.6), k = S.plan.k;
    const lo = p < j ? p : j, hi = p < j ? j : p, pk = (S.b * 4096 + lo * 64 + hi) | 0;
    const L = 260 + 300 * planetZufall(k, 200, pk, 0), uL = LG.laengs / L, idx = Math.floor(uL);
    const z0 = planetZufall(k, 201, pk, idx), z1 = planetZufall(k, 201, pk, idx + 1);
    const dlt = (z0 + (z1 - z0) * glatt(0.94, 1, uL - idx) - 0.5) * 2 * Math.min(80, 1.25 * Math.max(-S.paarC[p * S.nP + j], 0)) * div * (1 - glatt(300, 400, s < 0 ? -s : s));
    return p === lo ? dlt : -dlt;
  }
  // ξ(p, j) für jeden Nachbarn j der Platte p nach _xKm, und ihr Gewicht ω_p = Π_j glatt(−NAHT, NAHT, ξ(p, j)): die Höhe ist
  // Σ ω_p·H_p / Σ ω_p über die Platten am Ort (Zerlegung der Eins). Am Rand eines Paars gilt von beiden Seiten dasselbe Mittel, an
  // jeder Tripel-Ecke dasselbe Gewicht — die Wahl der Platte ist nur ein Name (Treppe |dlt| ≤ 80 < NAHT: kein Kreis der Gewichte).
  // Die Relativbewegung, die die Treppe rechnet, liest raender derselben Platte aus _pr (je Nachbar einmal je Punkt).
  function paarXi(S, p, x, y, z) {
    const sx = W_.sx, h = 0.5 * S.R, nb0 = S.nbStart[p], nb1 = S.nbStart[p + 1], nP = S.nP;
    let om = 1, nah = -1, nahXi = 1e9, iiNah = -1, xNah = 1e9;
    for (let ii = nb0; ii < nb1; ii++) {
      const j = S.nbList[ii], o = 3 * (ii - nb0);
      let sv = (sx[p] - sx[j]) * h;
      _pr[o] = NaN;
      if (sv < 400 && sv > -400 && S.paarC[p * nP + j] < 0) {   // die Treppe trägt nur ein öffnendes Paar (dlt ∝ max(−paarC, 0))
        paarRelativC(S, p, j, W_.qx, W_.qy, W_.qz); _pr[o] = PR.c; _pr[o + 1] = PR.scher; _pr[o + 2] = PR.rate;
        sv += treppe(S, p, j, sv, x, y, z);
      }
      const xi = med3(sv, KC[p], -KC[j]);
      _xKm[ii - nb0] = xi; om *= glatt(-NAHT_KM, NAHT_KM, xi);
      if (xi < nahXi) { nahXi = xi; nah = j; }
      if (xi < NAHT_KM && _besucht[j] === 0) { _besucht[j] = 1; _kand[XI.nK++] = j; }   // die Suche: nur er kann Gewicht tragen
      const xa = xi < 0 ? -xi : xi; if (xa < 5000 && xa < xNah) { xNah = xa; iiNah = ii; }
    }
    XI.nah = nah; XI.iiNah = iiNah;
    return om;
  }
  // G2.5 Die Ränder einer Platte am Punkt: Alter-Summe, Schablonen, Kegel, nächster Rand — EINE Funktion für jede Platte am Ort, ohne
  // Modus (vorher las die Partner-Seite ohne RX und ohne Kegel: dieselbe Platte gab je Rolle eine andere Höhe). Die Graben-Paare lesen
  // das Vorzeichen von ξ (EIN Profil), alle anderen Schablonen den Abstand |ξ|. Liest _xKm aus paarXi derselben Platte.
  // B4 Anden-Bogen: knapp landein der Küste — die Küste liegt eine Schürze (K3) hinter dem Graben, der Bogen ANDEN_LANDEIN_KM dahinter
  // (Zentral-Anden: Küste → Vulkan-Front 150–250 km). EINE Lage je Platte, beide Seiten des Paars lesen sie (vorher stand die Formel
  // zweimal, +300 km: der Gürtel lag 450–750 km hinter dem Graben, c3 erde-04 ×1,13, erde-07 ×0,92)
  const ANDEN_LANDEIN_KM = 150;
  function andenBogenKm(S, A, p) { return p < S.nG ? A.schuerze[p] * S.R + ANDEN_LANDEIN_KM : 195; }
  const RS = { invA: 0, hTpl: 0, hOro: 0, oroAlter: 0, randMin: 1e9, randArt: 0, randRate: 0, vAbst: 1e9, vArt: 0, vAlter: 0, vId: -1, vAktiv: 0, hKegel: 0 };
  const _xKm = new Float64Array(MAX_P), _pr = new Float64Array(3 * MAX_P);
  const GR = { k: NaN, r: NaN };   // das Kamm- und das Rücken-Rauschen hängen nur am Punkt: einmal je Punkt, jede Platte und jedes Paar liest es
  function raender(S, own, x, y, z, huelle) {
    const plan = S.plan, R = S.R, A = S.abschnitt, gS = plan.gS, k = plan.k, t = S.zeitMa, qx = W_.qx, qy = W_.qy, qz = W_.qz;
    let invA = 0, hTpl = 0, hOro = 0, oroAlter = 0, randMin = 1e9, randArt = RAND_ART.innen, randRate = 0;
    let vAbst = 1e9, vArt = VULKAN_ART.keiner, vAlter = 0, vId = -1, vAktiv = 0, hKegel = 0;
    const ownKont = own < S.nG;
    const dCo = ownKont ? W_.dC[own] * R : 1e9;
    const wkI = ownKont ? 1 - glatt(500, 900, dCo) : 0;
    const nb0 = S.nbStart[own], nb1 = S.nbStart[own + 1];
    const alterMa = S.alterMa; // das Alter des Abschnitts (+1 Ma): die Reife je Rand liest seine Konvergenz (hebungReife)
    // B0 Jenseits der Schablonen (> 1 300 km) liest ein Rand nur das Alter (invA) und — als nächster — den Namen: die Relativbewegung
    // braucht dort nur der EINE nächste Rand (der erste im Gang mit kleinstem Abstand). Vorher rechnete jeder Rand, der im Gang den
    // laufenden Kleinsten unterbot, sie neu (auf dem Mond 7,3 Paar-Rechnungen je Punkt, davon 1,25 jenseits der Schablonen).
    const iiNah = XI.iiNah;   // aus paarXi derselben Platte
    for (let ii = nb0; ii < nb1; ii++) {
      const xKm = _xKm[ii - nb0], xa = xKm < 0 ? -xKm : xKm;   // Abstand; die Schablonen des Graben-Paars lesen das Vorzeichen (ξ)
      if (xa >= 5000) continue;
      const j = S.nbList[ii];
      // B1 das Alter eines fernen Rands klingt über 4 000 … 5 000 km aus (vorher brach es bei 5 000 ab)
      const a = randAlter(S, A, own, j, xa, dCo), a2_ = a * a; invA += (xa > 4000 ? 1 - glatt(4000, 5000, xa) : 1) / (a2_ * a2_);
      if (xa > 1300 && ii !== iiNah) continue;
      // Relativbewegung am Punkt: nur wo eine Schablone wirkt oder der nächste Rand benannt wird
      const o = 3 * (ii - nb0);
      if (_pr[o] === _pr[o]) { PR.c = _pr[o]; PR.scher = _pr[o + 1]; PR.rate = _pr[o + 2]; } else paarRelativC(S, own, j, qx, qy, qz);
      const c = PR.c, rate = PR.rate;
      const offen = c < 0 ? -c : 0, konv = c > 0 ? c : 0;
      if (xa < randMin) {
        randMin = xa; randRate = rate;
        randArt = konv > 0.35 * rate && konv > 2 ? RAND_ART.konvergent : (offen > 0.35 * rate && offen > 2 ? RAND_ART.divergent : (rate > 2 ? RAND_ART.transform : RAND_ART.innen));
      }
      if (xa > 1300) continue;
      const jKont = j < S.nG;
      const dCj = jKont ? W_.dC[j] * R - xKm : 1e9;
      const wkJ = jKont ? 1 - glatt(500, 900, dCj) : 0;
      // B1 die Tore der Schablonen sind stetig: jede Schablone geht mit ihrer Stärke (s ∝ konv, dv ∝ offen, tr) und mit ihrem Abstand
      // gegen 0, bevor ein Tor schließt (vorher sprangen sie bei konv bzw. offen = 0,5 um bis 100 m, bei 700 · 250 · 200 km um Meter)
      if (konv > 0) {
        const s = Math.min(1.6, konv / 25) * hebungReife(konv, alterMa) * gS;
        const wa = wkI * wkJ, wb = wkI * (1 - wkJ), wc = (1 - wkI) * wkJ, wd = (1 - wkI) * (1 - wkJ);
        let sub = 0; // Ozean/Ozean: welche Seite taucht ab (Paar-Hash)
        if (wd > 0) { const lo = own < j ? own : j; sub = planetZufall(k, 210, S.b * 4096 + lo * 64 + (own < j ? j : own), 0) < 0.5 ? lo : (own < j ? j : own); }
        // Grat-Rauschen der Kämme: stetig ein- und ausgeblendet (vorher sprang der Faktor 0,62…1 an x = 700 km und an Gewicht 0,05 auf 1)
        const wG = wa + wb + wd, grat = (wG > 0.03 && xa < 700) ? 1 + 0.38 * ((GR.k === GR.k ? GR.k : (GR.k = gratKm(k ^ 0x3c6ef372, x, y, z, R, 210))) - 1) * glatt(0.03, 0.08, wG) * (1 - glatt(600, 700, xa)) : 1;
        let oro = 0;
        const xAnden = andenBogenKm(S, A, own);
        if (wa > 0) { oro += wa * 5.0 * s * gauss(xa - 110, 200) * grat; hTpl -= wa * 0.35 * s * gauss(xa - 440, 120); }
        // G2.5 jede Schablone ist EIN Profil in ξ und wird von beiden Seiten gelesen: die obere Platte trägt die Flanke des Grabens
        // (ξ = −x), die abtauchende den Ausläufer des Bogens bzw. der Anden (ξ = −x auf deren Seite)
        if (wb > 0) { oro += wb * 4.4 * s * gauss(xKm - xAnden, 85) * grat; hTpl += wb * graben(-xKm, s); }
        if (wc > 0) { hTpl += wc * graben(xKm, s); oro += wc * 4.4 * s * gauss(-xKm - andenBogenKm(S, A, j), 85) * grat; }
        if (wd > 0) {
          if (sub === own) { hTpl += wd * graben(xKm, s); oro += wd * 3.2 * s * gauss(-xKm - 190, 55) * grat; }
          else { oro += wd * 3.2 * s * gauss(xKm - 190, 55) * grat; hTpl += wd * graben(-xKm, s); }
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
      if (offen > 0) {
        const dv = Math.min(1, offen / 20);
        if (wkI * wkJ > 0 && xa < 700) hTpl += wkI * wkJ * (-1.2 * dv * kexpS(-xa / 130)) * (1 - glatt(600, 700, xa));
        if (!huelle && (1 - wkI) > 0 && xa < 250) hTpl += (1 - wkI) * dv * (-0.35 * kexpS(-xa / 14) + 0.35 * kexpS(-xa / 60) * ((GR.r === GR.r ? GR.r : (GR.r = gratKm(k ^ 0x1b873593, x, y, z, R, 90))) - 0.45)) * (1 - glatt(200, 250, xa));
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
      if (tr > 0 && xa < 200) hTpl += (1 - wkI) * (-0.6 * tr * kexpS(-xa / 45)) * (1 - glatt(150, 200, xa));
    }
    RS.invA = invA; RS.hTpl = hTpl; RS.hOro = hOro; RS.oroAlter = oroAlter; RS.randMin = randMin; RS.randArt = randArt; RS.randRate = randRate;
    RS.vAbst = vAbst; RS.vArt = vArt; RS.vAlter = vAlter; RS.vId = vId; RS.vAktiv = vAktiv; RS.hKegel = hKegel;
  }
  // das grobe Becken-Feld (4 000 … 1 000 km) einer Scholle an einem Welt-Punkt — vorher eine Closure je Scholle und Punkt (G3.7: Müll)
  function beckenGrob(seedB, sm, o, R, px, py, pz) { const n = fbmKm(seedB, sm[o] * px + sm[o + 3] * py + sm[o + 6] * pz, sm[o + 1] * px + sm[o + 4] * py + sm[o + 7] * pz, sm[o + 2] * px + sm[o + 5] * py + sm[o + 8] * pz, R, 4000, 1000, BECKEN_GEWINN); return n >= 0 ? n : -BECKEN_TIEF * n * n; }
  // Radius gemischt über die Schollen am Ort (Gewicht wie B): rechnet Feld-Abstände in km, stetig über jede Naht (G1.4, kont). B1: eine
  // Scholle zählt erst über f −1,3 … −1,0 (sie tritt am Rand ihres Fensters bei f ≤ −1,3 ein; vorher sprang r dort von 0,2 auf r_s)
  function radiusAmOrt(S) {
    let srW = 0, srN = 0;
    for (let q = 0; q < KF.nIn; q++) { const s = KF.inL[q], f = KF.sF[s]; const wb = (1 - (KF.fBest - f) / 0.15) * glatt(-1.3, -1.0, f); if (wb <= 0) continue; srW += wb * S.sr[s]; srN += wb; }
    return srN > 0 ? srW / srN : 0.2;
  }
  function punktRoh(S, x, y, z, fussKm, huelle) {
    if (!(fussKm > 0)) throw new Error('planet: fussKm fehlt (K10)');
    if (!huelle && S.ketten === null) kettenBauen(S);   // G3.6 am ersten Leser, vor jedem Feld des Punkts (kettenBauen schreibt KF und W_)
    const plan = S.plan, R = S.R, A = S.abschnitt, Q = S.Q, gS = plan.gS, k = plan.k, t = S.zeitMa;
    // 1 Kruste (unverzogen, im Schollen-Rahmen)
    const fK = krusteFeld(S, x, y, z, huelle ? 400 : fussKm, huelle);
    const gK = W_.fGrp, sB = KF.sBest;
    // 2 Platten-Wertung (verzogen)
    plattenWertung(S, x, y, z);
    const srM = radiusAmOrt(S);
    // 3 Ränder: Alter, Schablonen — B1 über jede Platte p am Ort mit Gewicht ω_p (paarXi): Σ ω_p·H_p / Σ ω_p. Die Kruste c_g (km) jeder
    // Gruppe klemmt ξ (K1); fern ihrer Kruste (f −1,0 … −1,2, dort tritt eine Scholle in das Fenster) geht c stetig nach −∞: keine Klemme.
    const kq = Q - 0.05, kap = plan.koerper.bodenAlterMaxMa;
    for (let g = 0; g < S.nG; g++) { const f = KF.gV[g]; KC[g] = f > -1.2 ? (f - kq) * srM * R / glatt(-1.2, -1.0, f) : -Infinity; }
    for (let i = S.nG; i < S.nP; i++) KC[i] = -Infinity;
    let own = -1, omOwn = 0, nachbar = -1, sumW = 0, hTpl = 0, hOro = 0, alter = 0, hKegel = 0;
    let oroAlter = 0, randMin = 1e9, randArt = RAND_ART.innen, randRate = 0, vAbst = 1e9, vArt = VULKAN_ART.keiner, vAlter = 0, vId = -1, vAktiv = 0;
    // die Suche beginnt bei der Platte der Kruste (K1), sonst der Wertung; sie geht über jeden Nachbarn mit ξ < NAHT (nur er kann
    // Gewicht tragen: ξ(j, p) > −NAHT) — das Ergebnis hängt nicht vom Anfang ab
    _kand[0] = fK > kq && gK >= 0 ? gK : W_.best; _besucht[_kand[0]] = 1; XI.nK = 1; GR.k = NaN; GR.r = NaN;
    for (let q = 0; q < XI.nK; q++) {
      const p = _kand[q], om = paarXi(S, p, x, y, z);
      if (!(om > 0)) continue;
      const nah = XI.nah;
      raender(S, p, x, y, z, huelle);
      sumW += om; hTpl += om * RS.hTpl; hOro += om * RS.hOro; hKegel += om * RS.hKegel; alter += om * alterAusSumme(RS.invA, kap);
      if (om > omOwn) {   // der Name: die Platte mit dem größten Gewicht, ihr nächster Rand
        omOwn = om; own = p; nachbar = nah; oroAlter = RS.oroAlter; randMin = RS.randMin; randArt = RS.randArt; randRate = RS.randRate;
        vAbst = RS.vAbst; vArt = RS.vArt; vAlter = RS.vAlter; vId = RS.vId; vAktiv = RS.vAktiv;
      }
    }
    for (let q = 0; q < XI.nK; q++) _besucht[_kand[q]] = 0;
    if (!(sumW > 0)) throw new Error('planet: keine Platte trägt den Punkt (B1, Gewichte 0)');
    hTpl /= sumW; hOro /= sumW; hKegel /= sumW; alter /= sumW;
    PK.platte = own; PK.nachbar = nachbar;
    // 4 Ozean-Boden
    let oz = -gdh1(alter);
    if (!huelle) oz += 0.08 * fbmKm(k ^ 0x68e31da4, x, y, z, R, 130, Math.max(32, 2 * fussKm), 0.5) * glatt(0, 12, alter);
    // 5 Krusten-Profil: Hang → Schelf → innen (K7: Kontinent relativ zum Bezugs-Spiegel)
    const S1 = glatt(Q - 0.05, Q, fK), S2 = glatt(Q + RAMPE0, Q + RAMPE1, fK);
    // G1.4 Die Küste als Höhenlinie: das Becken-Feld B im Schollen-Rahmen (fährt mit) wirkt auf der GANZEN Kruste (Gewicht S1):
    // Schwellen heben den Schelf über das Meer (Halbinseln, Inselketten), Becken fluten das Innere (Binnenmeere, Buchten).
    // Spektrum 4 000 km … 2·fuss, Gewinn BECKEN_GEWINN, Amplitude BECKEN_C × Freibord. Wo zwei Schollen sich überdecken, mischt B
    // stetig nach ihrem Feld (Gewicht 1 − (f_best − f_s)/0,15): kein Sprung an der Naht. Die Tafel fällt (sie war B im Kleinen).
    const fb = plan.koerper.freibordKm, sd = plan.koerper.shelfKm;
    let becken = 0, beckenW = 0;
    if (S1 > 0) {
      const lamB = huelle ? 800 : Math.max(32, 2 * fussKm);
      for (let q = 0; q < KF.nIn; q++) {
        const s = KF.inL[q]; const wb = 1 - (KF.fBest - KF.sF[s]) / 0.15; if (wb <= 0) continue;
        const seedB = (plan.schollen[8 * s + 5] | 0) + 91, lx = KF.sLx[3 * s], ly = KF.sLx[3 * s + 1], lz = KF.sLx[3 * s + 2];
        const nB = fbmKm(seedB, lx, ly, lz, R, 4000, lamB, BECKEN_GEWINN); becken += wb * schildFaktor(plan, s) * (nB >= 0 ? nB : -BECKEN_TIEF * nB * nB); beckenW += wb;
      }
      becken = beckenW > 0 ? BECKEN_C * fb * becken / beckenW : 0;
    }
    const tBoden = oz * (1 - S1), tProfil = S1 * (1 - S2) * (-sd) + S2 * fb + S1 * becken;
    let hA = oz * (1 - S1) + S1 * (1 - S2) * (-sd) + S2 * fb + S1 * becken;
    const hA0 = hA;
    // Gegner 2 + 3 (Tiefsee als flacher Deckel, Inland ohne Becken): dynamische Topographie des Mantels — Schwellen und Becken
    // (λ 5 000 … 1 200 km), gleich auf Ozean und Kontinent. Das Feld liegt im Mantel-Rahmen und dreht mit 1 cm/a um eine Achse der
    // Saat (stetig in t); die Platten fahren darüber. Amplitude DYN_KM gesetzt (Erde: ±0,5…1 km, Flament et al. 2013, ungeprüft).
    {
      let dc = S.dynC; if (dc === undefined) { const w = t * 10 / R; dc = S.dynC = kcos(w); S.dynS = ksin(w); }
      const ds_ = S.dynS, rx = dc * x + ds_ * z, rz = -ds_ * x + dc * z;
      const dyn = DYN_KM * fbmKm(k ^ 0x2545f491, rx, y, rz, R, 5000, 1200, 0.55) * gS;
      hA += dyn > 0 ? dyn : dyn * (1 - (1 - SEDIMENT_FUELLT) * S2);   // Kontinent-Becken füllt Sediment (S2 = Inneres)
    }
    const tMantel = hA - hA0, hTplRand = hTpl;
    const hB = S1;
    // 6 Gedächtnis im Schollen-Rahmen: Nähte und erloschene Ränder (K4), Trapps
    let hMem = 0, memAlter = 0;
    if (S1 > 0) {
      const NJ = naehteJeScholle(plan), TG = tangentenJeScholle(plan), nae = plan.naehte;
      for (let q = 0; q < KF.nIn; q++) {
        const s = KF.inL[q];
        const f = KF.sFg[s]; if (f < Q - 0.3) continue;   // G1.3: das Gedächtnis liest das GROBE Feld
        const wf = glatt(Q - 0.3, Q - 0.2, f);            // B1 es klingt an der Schwelle aus (vorher setzte es dort mit voller Höhe ein)
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
          if (H * wz * wf <= hMem) continue;                              // gauss ≤ 1: kann hMem nicht überbieten
          const breite = nae[n + 6] * (1 + (a < 300 ? a : 300) / 300);   // Gegner 2 (F1 Rest-Strahlen): Breite ≤ 2 × Anfang, wie die erloschenen Ränder
          const quer = (ang - nae[n + 7] * rs) * R;
          const h = H * wz * wf * gauss(quer, breite);
          if (h > hMem) { hMem = h; memAlter = a; }
        }
        // erloschene aktive Ränder: 32 Fächer, zwischen den Fächern gemischt. Gegner 2 (F1 Stern, F4 Rahmen/Ring/Wurm, F9 Chrom):
        // vorher lag der Kamm JEDES Fachs fest 300 km landein auf einer Höhenlinie des Schollen-Felds (Rahmen parallel zur Küste),
        // ganz erhalten (geschlossener Ring), und seine Breite 85·(1 + a/200) wuchs mit dem Alter bis in die Mitte, wo alle 32
        // Fächer zusammenlaufen (der Stern: 76 % der Knick-Summe aus diesem Term). Jetzt trägt jedes Fach seine Form aus dem Plan
        // (randForm: Lage 150–600 km landein plus 0,6 km je Ma Alter, höchstens 0,5·r; Erhalt — etwa ein Fünftel der Fächer ist abgetragen),
        // die Lage wird glatt (C1) zwischen den Fächern gemischt, die Breite ist bei 2 × Anfang gedeckelt (randTafel), und wo der Bogen
        // eines Fachs schmaler wird als der Gürtel (zur Mitte hin), klingt das Gedächtnis aus — kein Strahl läuft in die Mitte.
        const fpos = (az < 0 ? az + TAU : az) / TAU * 32 - 0.5;
        const f0 = Math.floor(fpos), fr = fpos - f0, frG = fr * fr * (3 - 2 * fr);
        const RT = S.randTafel || randTafel(S), RF = randForm(plan);
        const i0 = s * 32 + ((f0 % 32) + 32) % 32, i1 = s * 32 + (((f0 + 1) % 32) + 32) % 32;
        const H0r = RT[3 * i0] > 0 ? RT[3 * i0] * RF[2 * i0] : 0, H1r = RT[3 * i1] > 0 ? RT[3 * i1] * RF[2 * i1] : 0;
        if (H0r > 0 || H1r > 0) {
          const hF = (1 - fr) * H0r + fr * H1r;
          const j0 = RT[3 * i0] > 0 ? i0 : i1, j1 = RT[3 * i1] > 0 ? i1 : i0;   // Breite und Alter stetig zwischen den Fächern
          const br = (1 - fr) * RT[3 * j0 + 1] + fr * RT[3 * j1 + 1], aR = (1 - fr) * RT[3 * j0 + 2] + fr * RT[3 * j1 + 2];
          const lage0 = (1 - frG) * RF[2 * i0 + 1] + frG * RF[2 * i1 + 1] + 0.6 * (aR < 800 ? aR : 800), lageMax = 0.5 * rs * R;
          const lage = lage0 < lageMax ? lage0 : lageMax;          // die äußere Hälfte: dort ist der Bogen eines Fachs breiter als der Gürtel
          const innenKm = (f - Q) * rs * R;                     // landein ab der Krusten-Kante (folgt der rauen Küste)
          const bogenKm = ang * R * (TAU / 32);                 // Bogen eines Fachs im Abstand ang von der Mitte
          const hR = hF * wf * gauss(innenKm - lage, br) * glatt(0.3, 0.8, bogenKm / br);
          if (hR > hMem) { hMem = hR; memAlter = aR; }
        }
      }
      // B1 die Trapps je Scholle, gemischt über die Schollen am Ort (Gewicht wie B): vorher las nur die beste Scholle sB ihre Trapps —
      // an ihrem Wechsel sprang die Höhe. Den Namen (Vulkan) trägt die beste Scholle.
      if (beckenW > 0) {
        const E = plan.ereignisse; let trapp = 0;
        for (let q = 0; q < KF.nIn; q++) {
          const s = KF.inL[q], wb = 1 - (KF.fBest - KF.sF[s]) / 0.15; if (wb <= 0) continue;
          for (let e = 0; e < plan.nE; e++) {
            if (E[6 * e] !== s) continue; const a = t - E[6 * e + 4]; if (a < 0 || a > 400) continue;
            const pk = E[6 * e + 5], rad = Math.floor(pk / 1000), st = pk - rad * 1000;
            const d = acosF(KF.sLx[3 * s] * E[6 * e + 1] + KF.sLx[3 * s + 1] * E[6 * e + 2] + KF.sLx[3 * s + 2] * E[6 * e + 3]) * R;
            const wv = 1 - glatt(rad * 0.35, rad, d); if (wv <= 0) continue;
            trapp += wb * wv * st * kexpS(-a / 150) * gS * glatt(0, 1, a);   // K5: der Trapp baut sich über 1 Ma auf (gesetzt)
            if (s === sB && a < 2 && d < vAbst) { vAbst = d; vArt = VULKAN_ART.trapp; vAlter = a; vId = 900000000 + e; vAktiv = 1; }
          }
        }
        hTpl += S1 * trapp / beckenW;
      }
    }
    // B1 das Gedächtnis ist Kruste: es klingt mit dem Profil S1 an der Krusten-Kante aus (vorher schaltete S1 > 0 es an — die Höhe
    // sprang an der Kante ozean|hang um bis 3,2 km, 206 von 223 Schollen- und 73 von 74 Krusten-Sprüngen, b-stetig)
    hMem *= S1;
    const hGeb = Math.max(hOro, hMem);
    // 7 Hotspot-Ketten (Kegel, über Kontinent Dom) — die Hülle trägt keine Kegel und liest keinen Vulkan: dort entfällt die Schleife
    if (S.kettenIdx && !huelle) {
      const K = S.ketten, cos300 = S.kettenCos;
      const sig = 30 + 90 * S1, ozeanisch = 1 - S1;
      const kz = kettenKandidaten(S, x, y, z), kL = S.kListe;
      for (let e = S.kKopf[kz], e1 = e + S.kAnz[kz]; e < e1; e++) {
        const q = kL[e], q2 = (q / 24) | 0, kk = q - 24 * q2, h = S.kettenIdx[q2], st = plan.hotspots[6 * h + 5];
        const ii = 4 * q, tau = K[ii + 3];   // tau ≥ 0: die Liste trägt nur Stützen mit Ausbruch
        const dd = x * K[ii] + y * K[ii + 1] + z * K[ii + 2]; if (dd < cos300) continue; // 300 km, in km gemessen
        const d = acosF(dd) * R;
        const sigK = sig * S.kettenBreite[q];
        if (!huelle && d < 3.5 * sigK) {
          const KA = S.kettenAmp, ia = 2 * q;
          const hh = st * (4.2 * ozeanisch * KA[ia] + 0.6 * S1 * KA[ia + 1]) * gauss(d, sigK) * gS;
          if (hh > hKegel) hKegel = hh;
        }
        if (d < vAbst) { vAbst = d; vArt = VULKAN_ART.hotspot; vAlter = tau; vId = 800000000 + h * 10000 + (S.kettenG0 - kk + 5000); vAktiv = tau < 3.5 && plan.hotspots[6 * h + 4] >= t ? 1 : 0; }
      }
    }
    // G1.4 EINE Küste für alle Leser: kont ist stetig über die Schollen (max_s statt der nächsten Scholle) und sieht die Küste der
    // Becken: wo der Boden (Freibord + B + Mantel) dem Meer nahe kommt, gilt der Abstand zur Null-Linie, linear aus seinem Gefälle.
    // kont aus dem Feld der Gruppe (fK, dasselbe wie das Profil) mit dem Radius gemischt wie B: stetig über jede Naht
    const kontF = (fK - S.kuesteF) * srM * R;
    let kont = kontF;
    const hBoden = hA - S.meerKm;
    if (!huelle && S2 > 0 && beckenW > 0 && hBoden < 0.9) {   // die Hülle liest kont nie
      const wK = (1 - glatt(0.5, 0.9, hBoden)) * S2;
      const ex = Math.abs(x) < 0.9 ? 1 : 0, ey = 1 - ex, d0 = 60 / R;   // Tangenten am Punkt
      let t1x = ey * z, t1y = -ex * z, t1z = ex * y - ey * x; const l1 = Math.sqrt(t1x * t1x + t1y * t1y + t1z * t1z); t1x /= l1; t1y /= l1; t1z /= l1;
      const t2x = y * t1z - z * t1y, t2y = z * t1x - x * t1z, t2z = x * t1y - y * t1x;
      let g0 = 0, g1 = 0, g2 = 0;
      for (let q = 0; q < KF.nIn; q++) {
        const s = KF.inL[q]; const wb = 1 - (KF.fBest - KF.sF[s]) / 0.15; if (wb <= 0) continue;
        const seedB = (plan.schollen[8 * s + 5] | 0) + 91, o = 9 * s, sm = S.sm;
        const wA = wb * schildFaktor(plan, s);
        g0 += wA * beckenGrob(seedB, sm, o, R, x, y, z); g1 += wA * beckenGrob(seedB, sm, o, R, x + d0 * t1x, y + d0 * t1y, z + d0 * t1z); g2 += wA * beckenGrob(seedB, sm, o, R, x + d0 * t2x, y + d0 * t2y, z + d0 * t2z);
      }
      const k0 = BECKEN_C * fb / beckenW, gr = Math.sqrt((g1 - g0) * (g1 - g0) + (g2 - g0) * (g2 - g0)) * k0 / 60;   // km je km
      const kontB = hBoden / Math.max(gr, 1e-5);
      kont = kontF + wK * (Math.min(kontF, kontB) - kontF);
    }
    hA += hTpl + hGeb + hKegel;
    PK.hA = hA; PK.hB = hB; PK.fK = fK;
    PK.tBoden = tBoden; PK.tProfil = tProfil; PK.tMantel = tMantel; PK.tSchablone = hTplRand; PK.tTrapp = hTpl - hTplRand; PK.tOro = hOro; PK.tMem = hMem; PK.tGeb = hGeb; PK.tKegel = hKegel;
    PK.kruste = S2 > 0.5 ? KRUSTE.kontinent : (S1 > 0.5 ? KRUSTE.schelf : (S1 > 0 ? KRUSTE.hang : KRUSTE.ozean));
    PK.scholle = S1 > 0 ? sB : -1;
    PK.randArt = randArt; PK.randAbstandKm = randMin; PK.randRateCmA = randRate / 10;
    PK.ozeanAlterMa = alter; PK.orogenStaerke = Math.min(1, hGeb / 5); PK.orogenAlterMa = hMem > hOro ? memAlter : oroAlter;
    PK.orogenAktiv = hOro >= hMem && hOro > 0.2 ? 1 : 0;
    PK.vulkanArt = vArt; PK.vulkanAbstandKm = vAbst; PK.vulkanAlterMa = vAlter; PK.vulkanId = vId; PK.vulkanAktiv = vAktiv;
    PK.kont = kont;
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
  // G3.4 N Hüll-Proben je Zeit, Memo je (Zeit, N): der Spiegel der Zeit liest PROBEN_SPIEGEL, die Stützen des Bezugs (ein Mittel
  // über 100 Ma) PROBEN_BEZUG. Gemessen (Entscheid-2 §0.3, 12 Saaten × 2 Zeiten): 1 024 statt 4 096 Proben verschieben den Bezug um
  // ±14,6 m (max 42,9 m), den Land-Anteil um ±0,12 Prozentpunkte; 512 Proben bis 2,2 Punkte (verworfen).
  const PROBEN_SPIEGEL = 4096, PROBEN_BEZUG = 1024;
  function hueleProben(plan, t, N) {
    const M = memoVon(plan), key = t + '|' + N;
    if (M.proben.has(key)) return M.proben.get(key);
    const S = scheibeKern(plan, t, false), F = fib(N);
    const a = new Float64Array(N), bw = new Float64Array(N), al = new Float64Array(N);
    for (let i = 0; i < N; i++) { punktKern(S, F[3 * i], F[3 * i + 1], F[3 * i + 2], 400, true); a[i] = PK.hA; bw[i] = PK.hB; al[i] = PK.ozeanAlterMa; }
    const r = { a, bw, al, N };
    if (M.proben.size > 48) M.proben.delete(M.proben.keys().next().value);
    M.proben.set(key, r); return r;
  }
  function klemmZeit(plan, t) { const lo = plan.bilder[0], hi = plan.bilder[plan.nB - 1]; return t < lo ? lo : (t > hi ? hi : t); }
  // Selbst-Spiegel eines Fachs: Kontinent-Niveau = eigener Spiegel + Freibord
  function sigmaSelbst(plan, tf) {
    const M = memoVon(plan);
    if (M.meerRef.has(tf)) return M.meerRef.get(tf);
    const P = hueleProben(plan, tf, PROBEN_BEZUG); const s = meerLoesen(P.a, P.bw, P.N, plan.koerper.wasserKm, null);
    M.meerRef.set(tf, s); return s;
  }
  // Bezugs-Spiegel (Erosionsbasis): Mittel des Selbst-Spiegels über die letzten 100 Ma, 20-Ma-Stützen, linear dazwischen; jede Stütze
  // liest PROBEN_BEZUG Hüll-Proben (G3.4: ein Mittel über fünf Stützen braucht nicht die Auflösung des Spiegels der Zeit)
  function sigmaRef(plan, t) {
    const T = BEZUG_TAKT, n = BEZUG_MA / BEZUG_TAKT, f0 = Math.floor(t / T) * T, u = (t - f0) / T;
    const r = (f) => { let s = 0; for (let i = 0; i < n; i++) s += sigmaSelbst(plan, klemmZeit(plan, f - T * i)); return s / n; };
    const r0 = r(f0); return u > 0 ? r0 + u * (r(f0 + T) - r0) : r0;
  }
  function meerFach(plan, tf, zusatz) {
    const M = memoVon(plan), key = tf + '|' + zusatz;
    if (M.meerBin.has(key)) return M.meerBin.get(key);
    const sr = sigmaRef(plan, tf);
    const P = hueleProben(plan, tf, PROBEN_SPIEGEL);
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
    // G3.5 kein Fach mit Gewicht 0: auf dem Fach-Takt (u = 0, etwa die Heimat t = 0) rechnet A1 nicht — byte-gleich, weil u·(A1 − A0) = 0
    const u = f1 !== f0 ? (zeitMa - f0) / (f1 - f0) : 0;
    const A0 = meerFach(plan, f0, z), A1 = u !== 0 ? meerFach(plan, f1, z) : A0;
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
    // Kosten an die Abfrage (Gegner 1): dasselbe globale Gitter (Breiten-Ringe im Takt 22 km, Längen je Ring), aber nur die Ringe
    // und Längen-Indizes, die die Kappe schneiden — O((radius/schritt)²), nie O(R²). Die Proben sind dieselben wie zuvor.
    const nB = Math.max(1, Math.ceil(PI * R / schritt));
    const phiC = katan2(c[1], Math.sqrt(c[0] * c[0] + c[2] * c[2])), lamC = katan2(c[2], c[0]);
    const i0 = Math.max(0, Math.floor((phiC - rad + HALBPI) / PI * nB)), i1 = Math.min(nB, Math.ceil((phiC + rad + HALBPI) / PI * nB));
    const P = {};
    for (let i = i0; i <= i1; i++) {
      const phi = -HALBPI + PI * i / nB, cp = kcos(phi), sp = ksin(phi);
      const nL = Math.max(1, Math.ceil(TAU * R * cp / schritt));
      // Längen-Halbbreite der Kappe auf diesem Ring: cos(dλ) ≥ (cosR − sφ·sφc) / (cφ·cφc)
      const cpc = kcos(phiC), den = cp * cpc, num = cosR - sp * ksin(phiC);
      let j0 = 0, j1 = nL - 1;
      if (den > 1e-12) {
        const cq = num / den;
        if (cq > 1) continue;
        if (cq > -1) { const dl = kacos(cq) + TAU / nL; const a = Math.floor((lamC - dl + PI) / TAU * nL), b = Math.ceil((lamC + dl + PI) / TAU * nL); if (b - a < nL) { j0 = a; j1 = b; } }
      }
      for (let jj = j0; jj <= j1; jj++) {
        const j = ((jj % nL) + nL) % nL;
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
  // R1 EINE Karten-Schleife für drei Leser: die ganze Karte (equirektangulär), dieselbe in Streifen (teil = { zeile0, zeile1, zustand }:
  // jeder Aufruf rechnet die Punkt-Zeilen, die seine Farb-Zeilen brauchen — eine Zeile Rand oben und unten —, und färbt zeile0 … zeile1−1;
  // der Zustand trägt die Punkt-Felder zum nächsten Streifen) und ein Fenster (planetKarteAusschnitt). Die Bytes in Streifen sind die
  // Bytes am Stück: dieselben Punkte, dieselbe Schattierung.
  function karteZustand(S, W, H, schicht, geo) {
    const klima = SCHICHT[schicht] >= SCHICHT.biom, n = W * H;
    return { S, W, H, schicht, geo, klima, fertig: new Uint8Array(H),
      hoehe: new Float32Array(n), platte: new Int16Array(n), art: new Uint8Array(n), alter: new Float32Array(n), vul: new Uint8Array(n),
      kT: klima ? new Float32Array(n) : null, kS: klima ? new Float32Array(n) : null, kN: klima ? new Float32Array(n) : null, kK: klima ? new Int8Array(n) : null, kW: klima ? new Float32Array(n) : null,
      kD: klima ? new Float32Array(5 * n) : null };   // die Deckung je Punkt: decke, wald, mangrove, moor, kuestenwueste
  }
  const _kP = {}, _kK = {}, _kB = {}, _kV = new Float64Array(3);
  function kartePunkte(Z, r0, r1) {
    const S = Z.S, W = Z.W, g = Z.geo, fuss = g.fuss;
    for (let r = r0 < 0 ? 0 : r0; r < r1 && r < Z.H; r++) {
      if (Z.fertig[r]) continue;
      for (let i = 0; i < W; i++) {
        const idx = r * W + i; g.richtung(r, i, _kV); const x = _kV[0], y = _kV[1], z = _kV[2];
        Z.hoehe[idx] = planetPunktR(S, x, y, z, fuss, _kP);
        Z.platte[idx] = _kP.platte; Z.art[idx] = _kP.randArt; Z.alter[idx] = _kP.ozeanAlterMa; Z.vul[idx] = _kP.vulkanAktiv && _kP.vulkanAbstandKm < fuss * 0.8 ? 1 : 0;
        if (Z.klima) {
          planetKlimaR(S, x, y, z, -1, _kK, _kP); planetBiom(_kK, _kP.hoeheM, _kB);
          Z.kT[idx] = _kK.tJahrC; Z.kS[idx] = _kK.tSommerC; Z.kN[idx] = _kK.niederschlagMm; Z.kK[idx] = _kB.koeppen; Z.kW[idx] = _kK.tWinterC;
          pflanzenDeckung(_kK, _kP, _pd); const kd = Z.kD, j = 5 * idx;
          kd[j] = _pd.decke; kd[j + 1] = _pd.wald; kd[j + 2] = _pd.mangrove; kd[j + 3] = _pd.moor; kd[j + 4] = _pd.kuestenwueste;
        }
      }
      Z.fertig[r] = 1;
    }
  }
  function karteFarben(Z, r0, r1, out) {
    const S = Z.S, W = Z.W, H = Z.H, g = Z.geo, fuss = g.fuss, schicht = Z.schicht, hoehe = Z.hoehe, platte = Z.platte, art = Z.art, alter = Z.alter, vul = Z.vul;
    const kT = Z.kT, kS = Z.kS, kN = Z.kN, kK = Z.kK, kW = Z.kW, kD = Z.kD;
    const f = new Float64Array(3), D = { decke: 0, wald: 0, mangrove: 0, moor: 0, kuestenwueste: 0 };
    for (let r = r0; r < r1; r++) {
      const dxKm = g.dxKm(r), dyKm = fuss;
      for (let i = 0; i < W; i++) {
        const idx = r * W + i, h = hoehe[idx] / 1000;
        const il = g.umlauf ? (i + W - 1) % W : (i > 0 ? i - 1 : 0), ir = g.umlauf ? (i + 1) % W : (i < W - 1 ? i + 1 : W - 1);
        const hl = hoehe[r * W + il] / 1000, hr = hoehe[r * W + ir] / 1000;
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
          const grenze = platte[r * W + ir] !== p || platte[Math.min(H - 1, r + 1) * W + i] !== p;
          if (grenze) { const a = art[idx]; if (a === RAND_ART.konvergent) { f[0] = 230; f[1] = 30; f[2] = 30; } else if (a === RAND_ART.divergent) { f[0] = 250; f[1] = 250; f[2] = 250; } else if (a === RAND_ART.transform) { f[0] = 250; f[1] = 220; f[2] = 0; } else { f[0] = 40; f[1] = 40; f[2] = 40; } }
          const kueste = (h > 0) !== (hoehe[r * W + ir] > 0) || (h > 0) !== (hoehe[Math.min(H - 1, r + 1) * W + i] > 0);
          if (kueste && !grenze) { f[0] = 20; f[1] = 20; f[2] = 20; }
          if (vul[idx]) { f[0] = 255; f[1] = 120; f[2] = 0; }
        } else if (schicht === 'biom') {
          if (h > 0) { const j = 5 * idx; D.decke = kD[j]; D.wald = kD[j + 1]; D.mangrove = kD[j + 2]; D.moor = kD[j + 3]; D.kuestenwueste = kD[j + 4];
            biomFarbe(kT[idx], kS[idx], D, f); for (let c = 0; c < 3; c++) f[c] *= sh; }
          else {
            const tief = glatt(-0.2, -4.5, h); f[0] = 34 + (8 - 34) * tief; f[1] = 78 + (22 - 78) * tief; f[2] = 118 + (58 - 118) * tief;
            const eis = glatt(MEEREIS_WINTER_C + 3, MEEREIS_WINTER_C - 3, kW[idx]); f[0] += (232 - f[0]) * eis; f[1] += (238 - f[1]) * eis; f[2] += (244 - f[2]) * eis;
            for (let c = 0; c < 3; c++) f[c] *= 0.85 + 0.15 * sh;
          }
        } else if (schicht === 'temperatur') {
          farbeRampe(TEMP_RAMPE, kT[idx], f, 0); for (let c = 0; c < 3; c++) f[c] *= h > 0 ? 0.55 + 0.45 * sh : 0.82;
        } else if (schicht === 'niederschlag') {
          farbeRampe(NIED_RAMPE, Math.sqrt(kN[idx] > 0 ? kN[idx] : 0), f, 0); for (let c = 0; c < 3; c++) f[c] *= h > 0 ? 0.55 + 0.45 * sh : 0.7;
        } else if (schicht === 'koeppen') {
          const kc = kK[idx];
          if (kc >= 0) { f[0] = KOEPPEN_FARBE[3 * kc]; f[1] = KOEPPEN_FARBE[3 * kc + 1]; f[2] = KOEPPEN_FARBE[3 * kc + 2]; for (let c = 0; c < 3; c++) f[c] *= 0.7 + 0.3 * sh; }
          else { const eis = kW[idx] < MEEREIS_WINTER_C; f[0] = eis ? 225 : 22; f[1] = eis ? 232 : 34; f[2] = eis ? 240 : 64; }
        } else {
          if (h > 0 || platte[idx] < 0) { const gg = 150 * sh; f[0] = gg; f[1] = gg; f[2] = gg; }
          else { farbeRampe(ALTER, alter[idx], f, 0); for (let c = 0; c < 3; c++) f[c] *= 0.8 + 0.2 * sh; }
        }
        const o = idx * 3;
        out[o] = Math.max(0, Math.min(255, Math.floor(f[0] + 0.5))); out[o + 1] = Math.max(0, Math.min(255, Math.floor(f[1] + 0.5))); out[o + 2] = Math.max(0, Math.min(255, Math.floor(f[2] + 0.5)));
      }
    }
  }
  function karteLauf(S, W, H, schicht, geo, ziel, teil) {
    if (!(schicht in SCHICHT)) throw new Error('planetKarte: Schicht "' + schicht + '" ist nicht gebaut');
    let r0 = 0, r1 = H, Z;
    if (teil) {
      r0 = teil.zeile0 | 0; r1 = teil.zeile1 | 0;
      if (!(r0 >= 0 && r1 > r0 && r1 <= H)) throw new Error('planetKarte: Streifen ' + r0 + ' … ' + r1 + ' liegt nicht in 0 … ' + H + ' (K10)');
      Z = teil.zustand;
      if (!Z || Z.S !== S || Z.W !== W || Z.H !== H || Z.schicht !== schicht || Z.geo.art !== geo.art || Z.geo.schluessel !== geo.schluessel) Z = teil.zustand = karteZustand(S, W, H, schicht, geo);
    } else Z = karteZustand(S, W, H, schicht, geo);
    kartePunkte(Z, r0 - 1, r1 + 1);
    const out = ziel || new Uint8Array(W * H * 3);
    karteFarben(Z, r0, r1, out);
    return out;
  }
  function planetKarte(S, breitePx, schicht, ziel, teil) {
    pruefScheibe(S);
    const W = breitePx | 0, H = W >> 1; if (W < 8) throw new Error('planetKarte: breitePx zu klein');
    const fuss = TAU * S.R / W, cl = new Float64Array(W), sl = new Float64Array(W), cp = new Float64Array(H), sp = new Float64Array(H);
    for (let i = 0; i < W; i++) { const lam = -PI + TAU * (i + 0.5) / W; cl[i] = kcos(lam); sl[i] = ksin(lam); }
    for (let r = 0; r < H; r++) { const phi = HALBPI - PI * (r + 0.5) / H; cp[r] = kcos(phi); sp[r] = ksin(phi); }
    const geo = { art: 'global', schluessel: W, fuss, umlauf: true,
      richtung: (r, i, o) => { o[0] = cp[r] * cl[i]; o[1] = sp[r]; o[2] = cp[r] * sl[i]; },
      dxKm: (r) => fuss * Math.max(0.05, cp[r]) };
    return karteLauf(S, W, H, schicht, geo, ziel, teil);
  }
  // R1 Fenster um mitte3 (Einheitsvektor), Kante spanneKm, px × px Pixel, Nord oben: Pixel (r, i) liegt im Abstand d = |(u, v)| in Richtung
  // (u Ost, v Nord) auf dem Großkreis — bei ungerader Pixelzahl ist der Mittel-Pixel genau mitte3 (Bytes von planetPunktR dort).
  function planetKarteAusschnitt(S, mitte3, spanneKm, px, schicht, ziel, teil) {
    pruefScheibe(S);
    const W = px | 0, H = W; if (W < 3) throw new Error('planetKarteAusschnitt: px zu klein');
    if (!(spanneKm > 0)) throw new Error('planetKarteAusschnitt: spanneKm fehlt (K10)');
    const mx = mitte3[0], my = mitte3[1], mz = mitte3[2], R = S.R, fuss = spanneKm / W;
    const cphi = Math.sqrt(mx * mx + mz * mz); if (!(cphi > 1e-9)) throw new Error('planetKarteAusschnitt: Mitte am Pol hat keinen Ost-Rahmen (K10)');
    const ex = -mz / cphi, ez = mx / cphi, nx = -my * mx / cphi, ny = cphi, nz = -my * mz / cphi;
    const geo = { art: 'fenster', schluessel: mx + '|' + my + '|' + mz + '|' + spanneKm, fuss, umlauf: false,
      richtung: (r, i, o) => {
        const u = ((i + 0.5) / W - 0.5) * spanneKm, v = (0.5 - (r + 0.5) / H) * spanneKm, d = Math.sqrt(u * u + v * v);
        if (d === 0) { o[0] = mx; o[1] = my; o[2] = mz; return; }
        const a = d / R, ca = kcos(a), sa = ksin(a) / d;
        o[0] = ca * mx + sa * (u * ex + v * nx); o[1] = ca * my + sa * (v * ny); o[2] = ca * mz + sa * (u * ez + v * nz);
      },
      dxKm: () => fuss };
    return karteLauf(S, W, H, schicht, geo, ziel, teil);
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
    // DIE ERDE EICHT DIE HADLEY-KANTE (bahn-klima#2): die achsensymmetrische Zelle trägt keine Wirbel und keinen Dampf — ihre Kante
    // liegt an der Erde weiter polwärts als die beobachtete (≈ 30°, Hill et al. 2019). Das Gesetz trägt darum das VERHÄLTNIS der
    // Lindzen-Hou-Kante zu der der Erde, die Erde selbst behält ihre Kante: 0,517371… rad = 29,643° (die Kante, an der die Bänder der
    // Küsten, Gürtel und Westwinde geeicht sind; am Körper der Erde x/x = 1 genau, Lehre 11). Band der Quelle: die Winter-Kante wächst
    // mit der Neigung γ wie γ^0,14 (Guendelman & Kaspi 2019, ApJ 881: 67, GCM-Fit), die Linse gate:worker-dichte (klima.hadley) misst es.
    hadleyErdeRad: 0.51737143219558779,
    // Der Aufstieg (die ITCZ) wandert über dem Meer mit 0,3 der Deklination (gesetzt; Erde ±7°): derselbe Schub trägt die Gürtel des
    // Jahrs (planetKlimaR) und den Aufstiegs-Ort φ0 der Zelle der Sonnwende (planetKlimaGlobal).
    schubMeer: 0.3,
    lapse: 6.5,                                  // K/km (Standard-Atmosphäre)
    schritte: Object.freeze([100, 200, 300]),    // km luvwärts (gesetzt): drei im 100-km-Takt lösen die Kämme der Hülle (Gürtel σ 85 km: am
                                                 // schlechtesten Versatz 50 km ≥ 0,84 der Kamm-Höhe); sie sind zugleich die nahen Knoten der Feuchte (G2.3, B2)
    schattenKm: 1.5,                             // Regenschatten e^(−Δh/1,5 km) (Entscheid §4)
    leeKm: 800,                                  // Schranke eines Kamms wirkt mit e^(−d/800 km) hinter ihm (gesetzt)
    meerKm: 300,                                 // Nachladen über Meer e^(−Weg/300 km) (gesetzt)
    // DAS LAND ZEHRT IM FENSTER (klima-kontinent): über unbewaldetem Land fällt der Niederschlag landein exponentiell mit einer e-Länge
    // von einigen 100 km (Makarieva, Gorshkov & Li 2009) — vorher 6 000 km bei einem Fenster von 1 850 km: der Ort 1 850 km hinter
    // der Küste trug 0,76, der 2 150 km dahinter 0,35 (die Klippe am Fensterrand). 600 km: am Rand des Fensters bleiben e^(−3,1).
    landKm: 600,
    // DIE SPERRE: steigt die Luft auf ihrem Weg über die Sperrhöhe (die höchste Querung seit dem letzten Meer), regnet sie den Dampf
    // über dem Anstieg aus — Anteil e^(−Anstieg/2,5 km); über Land heilt die Sperre mit landKm, über Meer mit meerKm. Band: über die
    // Süd-Anden (Kämme ~1,5–2 km) verliert der Strom rund 50 % seines Wassers (Smith & Evans 2007, drying ratio ≈ 0,5).
    sperreKm: 2.5,
    feuchteLand0: 0.35, feuchteLand1: 0.5,       // Feuchte ohne Meer im Fenster: kalt 0,35 … warm (Zone ≥ 25 °C) 0,5 — Rückführung (gesetzt); 0,7
                                                 // hob das Tropen-Land, brach aber klima.widerspruch (Regen ≥ 1 500 mm ohne Meer luvwärts) — bleibt 0,5
    itcz: 2600, sturm: 1100, grund: 250,         // mm/a Gürtel-Amplituden (gesetzt, gegen Köppen gerichtet)
    absinken: 0.85,                              // Anteil, den das Subtropen-Hoch am Hadley-Rand vom Gürtel-Regen nimmt (gesetzt)
    trockenK: 6,                                 // K: trockenes Land heizt ohne Verdunstung und Wolken (Bowen-Verhältnis) — Sahara ~5–7 K über dem
                                                 // Zonen-Mittel (Literatur aus dem Gedächtnis, ungeprüft); warm-seitig, voll bei N/PET ≤ 0,2
    kontiMeerKm: 600,                            // Meer nahe Land: winterkalte Festlandsluft greift e^(−Abstand/600 km) aufs Meer (gesetzt)
    // DIE MEERESLUFT IM WESTWIND (klima-kontinent): die Luft, die längs des EINEN Winds vom Meer kommt, trägt dessen Winter auf das Land
    // (+14 K Winter, −2 K Sommer bei voller Meeresluft in der Mitte der Westwind-Zone); die Ostküste trägt den kalten Rand-Strom und
    // die stehende Welle, die das warme Meer windab wirft (Kaspi & Schneider 2011, Nature 471: der warme Ozean kühlt die Ostküste,
    // nicht nur wärmt er die Westküste) — −12 K Winter, −2 K Sommer. Band, Normalwerte 1991–2020 gleicher Breite (Wikipedia-Tafeln aus
    // AEMET, Roshydromet, NOAA, ECCC): A Coruña 15,1 − Wladiwostok 5,1 = 10,0 K, Newport OR 10,3 − Halifax 6,9 = 3,4 K (Mittel der zwei
    // Kontinente 6,7 K); Januar 22,9 bzw. 12,8 K, August −0,1 bzw. −4,6 K. Die Ostküste gegen die Zone T0 + T2·P2: Januar −21,0 /
    // −13,8 K, Jahr −4,0 / −1,2 K. Median der 171 Paare an ±42° (Leiter land-meer-luft#4): mit −6 K Ostküste −15,6 K Winter, −0,9 K
    // Jahr, West − Ost 4,9 K; mit −12 K −18,2 K, −2,8 K, 6,9 K — der Sommer West − Ost bleibt −1,8 K. Offen: die Südhalbkugel trägt
    // das Band nicht (Puerto Montt 10,3 − Puerto Madryn 13,6 = −3,3 K), der Kern unterscheidet die Halbkugeln nicht; der Schnitt
    // verlegt den Anker an 15 von 62 Saaten (die Suche liest das Klima), die Heimat der Standard-Welt bleibt.
    westWinterK: 14, westSommerK: -2, ostWinterK: -12, ostSommerK: -2,
    // DIE WIRBEL DER STURMBAHN (klima-kontinent): in der Westwind-Zone trägt nicht der mittlere Wind allein den Dampf — die wandernden
    // Zyklonen bringen ihn aus JEDER Richtung vom nahen Meer heran (die Küste, deren Meer im Norden oder Süden liegt, die Ostküste).
    // Band: die Wirbel tragen in den Mittelbreiten rund die Hälfte des Dampf-Flusses (Peixoto & Oort 1992, Physics of Climate, Kap. 12);
    // ihre Reichweite landein glatt bis 800 km (gesetzt). Jenseits 800 km Küstenabstand Bit für Bit ohne sie.
    wirbelAnteil: 0.5, wirbelKm: 800,
    // DER NEBEL (klima-kontinent): Δ des Anteils der regenfreien Zeit mit Nebel. See-Nebel der Küstenluft e^(−Küstenabstand/100 km)
    // (Namib-Küste > 100 Nebeltage im Jahr, landein bis ~100 km: Seely & Henschel 1998); Advektions-Nebel über kaltem Auftrieb, voll,
    // wenn der Rand-Strom die Meeresluft um ihren Taupunkt-Abstand kühlt (3 K: relative Feuchte ~80 % über dem Meer, Dai 2006); dazu der
    // Strahlungs-Nebel feuchter Luft (N/PET). Gesetzt: Küste 0,2 + Auftrieb 0,35, Strahlung 0,3.
    nebelKm: 100, nebelKueste: 0.2, nebelAuftrieb: 0.35, nebelFeucht: 0.3, nebelTaupunktK: 3,
  });
  const KOEPPEN = Object.freeze(['Af', 'Am', 'Aw', 'BWh', 'BWk', 'BSh', 'BSk', 'Csa', 'Csb', 'Csc', 'Cwa', 'Cwb', 'Cwc', 'Cfa', 'Cfb', 'Cfc',
    'Dsa', 'Dsb', 'Dsc', 'Dsd', 'Dwa', 'Dwb', 'Dwc', 'Dwd', 'Dfa', 'Dfb', 'Dfc', 'Dfd', 'ET', 'EF']);
  const WHITTAKER = Object.freeze({ eis: 0, tundra: 1, boreal: 2, gemaessigtRegen: 3, gemaessigtSaison: 4, grasland: 5, busch: 6,
    wueste: 7, savanne: 8, tropenRegen: 9, meer: 10 });

  // DIE HADLEY-ZELLE DER SONNWENDE (Karte 2 planet.kopplung.bahn-klima#2). Die Zelle antwortet auf die Heizung ihrer Jahreszeit, nie
  // auf das Jahresmittel: das Maximum der Heizung steht am Aufstiegs-Ort φ0 neben dem Äquator, die Winter-Zelle reicht über ihn
  // hinweg weit in die Winter-Halbkugel, die Sommer-Zelle bleibt schmal — die Zirkulation des Jahres ist das Mittel der Zirkulationen
  // der Jahreszeiten, nicht die Zirkulation der gemittelten Heizung (Lindzen & Hou 1988, J. Atmos. Sci. 45: 2416; Hill, Bordoni &
  // Mitchell 2019). Kleinwinkel-Form in Einheiten von φH (Held & Hou 1980): Strahlungs-Gleichgewicht E(y) = −(y − y0)², Drehimpuls
  // erhaltend M(y) = c − 5/6·(y² − y1²)²; gesucht c, Aufstieg y1, Kanten y+ (Sommer) und y− (Winter) aus M = E an beiden Kanten und
  // gleicher Fläche in jeder Zelle. Bei y0 = 0 genau Held–Hou (c = −1/6, y1 = 0, y± = ±1). Die Fläche einer Zelle steht als Mittel
  // von M − E über die Zelle (geteilte Differenzen, keine Auslöschung): so fällt die entartete Lösung y+ = y1 heraus, die jedes y0
  // erfüllt und in die der Newton bei großen Schritten sprang (y0 0,83 an einem Zufalls-Körper). DIE GABEL: die Sommer-Zelle vergeht
  // genau bei y0 = 2·√(6/5) — dort wird M an y1 Tangente an E, also y1 = y0 und c = 0, M = E am Winter-Rand gibt y− = −y0 − √(6/5),
  // gleiche Fläche das Polynom z⁵ − 10z³ − 20z² − 15z − 4 = (z + 1)⁴·(z − 4) in z = 2y0/√(6/5). Jenseits trägt EINE Zelle über den
  // Äquator (n = 3: c, y1 = y+, y−; die Kanten bleiben stetig, an der Gabel−10⁻⁹ trifft der Newton die Lösung auf 10⁻⁸). An der Erde
  // (φH 0,573 rad) läge die Gabel bei φ0 = 72°, der Aufstieg erreicht 7°: es trägt sie nur ein Körper mit schmaler Zelle und steiler
  // Achse. Newton mit Differenzen-Jacobi, Abbruch am Rest relativ zur Größe der Kanten, nur Grundrechenarten (bit-gleich auf jedem
  // Gerät); v trägt den Start und das Ergebnis.
  const HADLEY_GABEL = 2 * Math.sqrt(1.2);
  function hadleyLH(y0, v, n) {
    const mittel = (c, q, a, b) => {
      const A = a - y0, B = b - y0, a2 = a * a, b2 = b * b;
      return c - (5 / 6) * ((a2 * a2 + a2 * a * b + a2 * b2 + a * b2 * b + b2 * b2) / 5 - (2 / 3) * q * (a2 + a * b + b2) + q * q) + (A * A + A * B + B * B) / 3;
    };
    const F = (w, o) => {
      const c = w[0], y1 = w[1], yp = n === 4 ? w[2] : w[1], ym = w[n - 1], q = y1 * y1, dp = yp * yp - q, dm = ym * ym - q;
      o[0] = c - (5 / 6) * dp * dp + (yp - y0) * (yp - y0);
      o[1] = c - (5 / 6) * dm * dm + (ym - y0) * (ym - y0);
      o[2] = mittel(c, q, ym, y1);
      if (n === 4) o[3] = mittel(c, q, y1, yp);
    };
    const f = [0, 0, 0, 0], g = [0, 0, 0, 0], w = [0, 0, 0, 0], A = [[], [], [], []];
    for (let it = 0; it < 40; it++) {
      F(v, f);
      let r = 0; for (let i = 0; i < n; i++) r = Math.max(r, Math.abs(f[i]));
      const ym = v[n - 1];
      if (r <= 1e-14 * (1 + ym * ym * ym * ym)) return v;
      for (let j = 0; j < n; j++) {
        for (let k = 0; k < n; k++) w[k] = v[k];
        const h = 1e-7 * (1 + Math.abs(v[j])); w[j] += h; F(w, g);
        for (let i = 0; i < n; i++) A[i][j] = (g[i] - f[i]) / h;
      }
      for (let i = 0; i < n; i++) A[i][n] = -f[i];
      for (let p = 0; p < n; p++) {
        let m = p; for (let s = p + 1; s < n; s++) if (Math.abs(A[s][p]) > Math.abs(A[m][p])) m = s;
        const t = A[p]; A[p] = A[m]; A[m] = t;
        for (let s = 0; s < n; s++) if (s !== p) { const k = A[s][p] / A[p][p]; for (let u = p; u <= n; u++) A[s][u] -= k * A[p][u]; }
      }
      for (let i = 0; i < n; i++) v[i] += A[i][n] / A[i][i];
    }
    throw new Error('hadleyLH: die Zelle der Sonnwende konvergiert nicht (y0 ' + y0 + ', ' + (n === 4 ? 'zwei Zellen' : 'eine Zelle') + ')');
  }
  // Die Kante des Jahrs in Einheiten von φH: der Aufstieg folgt der Deklination, φ0 = schubMeer·β·sin t (derselbe Schub, der die
  // Gürtel über das Jahr trägt, planetKlimaR); das Jahresmittel der Kante einer Halbkugel ist das Mittel ihrer Kanten über das Jahr —
  // die Hälfte des Jahrs die Sommer-Kante y+, die Hälfte die Winter-Kante |y−| (Mittelpunkt-Regel über den Viertel-Bogen; der Newton
  // läuft in Schritten ≤ 0,05 entlang steigender y0, über die Gabel springt er auf ihre genaue Lösung; das Vorzeichen der Neigung
  // trägt die Breite nicht). Die Kanten der Jahreszeit selbst liest kein Gesetz: an der Erde läge die Winter-Kante der
  // achsensymmetrischen Zelle 1,29× weiter polwärts als die des Jahrs — die Wirbel halten sie (Messung im Blatt kosmos-hadley: als
  // Leser verlegte sie 2 von 3 Ankern der Probe und 99 003 von 345 000 Klima-Feldern der Erde).
  function hadleyJahr(y0max) {
    const v = [-1 / 6, 0, 1, -1], t = [0, 0, 0], n = 16, spitze = y0max < 0 ? -y0max : y0max;
    let summe = 0, y = 0, zwei = true;
    for (let i = 0; i < n; i++) {
      const ziel = spitze * ksin((i + 0.5) / n * HALBPI);
      while (y < ziel) {
        if (zwei && (y + 0.05 < ziel ? y + 0.05 : ziel) >= HADLEY_GABEL) {
          zwei = false; v[0] = 0; v[1] = HADLEY_GABEL; v[2] = HADLEY_GABEL; v[3] = -1.5 * HADLEY_GABEL; y = HADLEY_GABEL;
          if (y >= ziel) break;
        }
        const nach = y + 0.05 < ziel ? y + 0.05 : ziel;
        if (zwei) hadleyLH(nach, v, 4);
        else { t[0] = v[0]; t[1] = v[1]; t[2] = v[3]; hadleyLH(nach, t, 3); v[0] = t[0]; v[1] = t[1]; v[2] = t[1]; v[3] = t[2]; }
        y = nach;
      }
      summe += v[2] - v[3];
    }
    return summe / (2 * n);
  }
  // DIE BAHN DER HEIMAT (Karte 2 planet.kopplung.bahn-klima#3 · planet.zeit.klimageschichte#2 · #3): Schiefe ε, Exzentrizität e und die
  // Länge des Perihels ϖ (vom wandernden Frühlingspunkt) zur Zeit t nach Berger 1978 (J. Atmos. Sci. 35, 2362) — die Reihen je Glied
  // (Amplitude ″ bzw. 1 · Rate ″/a · Phase °) wie in shr_orb_mod.F90 (CESM/E3SM), Jahre relativ zu 1950 (Vergangenheit negativ). Gegen
  // Laskar et al. 2004 (INSOLN La2004, 0–1 Ma je ka, spec/bahn/la2004.json): r der Juni-Insolation 65° N 0,975 (Linse klima.milankovic).
  // Ein Körper trägt seine eigene Neigung, die Bahn der Heimat schwingt sie: ε(t) = Neigung + ε_B(t) − ε_B(0) — der Plan kennt keine
  // eigene Bahn (kein Feld e, ϖ im Körper), alle Körper teilen das Spektrum der Heimat. Vorher kannte der Planet nur Neigung und
  // Sternfluss: über 1 Ma trug das Meer der Heimat 0 Extrema (Spanne 0,087 m), −21 ka lag es 0,002 m tiefer, die Welt 0 K kälter.
  const BAHN_BERGER = Object.freeze({
    ob: Object.freeze([
      -2462.2214466, 31.609974, 251.9025, -857.3232075, 32.620504, 280.8325, -629.3231835, 24.172203, 128.3057, -414.2804924, 31.983787, 292.7252,
      -311.7632587, 44.828336, 15.3747, 308.9408604, 30.973257, 263.7951, -162.5533601, 43.668246, 308.4258, -116.1077911, 32.246691, 240.0099,
      101.1189923, 30.599444, 222.9725, -67.6856209, 42.681324, 268.7809, 24.9079067, 43.836462, 316.7998, 22.5811241, 47.439436, 319.6024,
      -21.1648355, 63.219948, 143.805, -15.6549876, 64.230478, 172.7351, 15.3936813, 1.01053, 28.93, 14.6660938, 7.437771, 123.5968,
      -11.7273029, 55.782177, 20.2082, 10.2742696, 0.373813, 40.8226, 6.4914588, 13.218362, 123.4722, 5.8539148, 62.583231, 155.6977,
      -5.4872205, 63.593761, 184.6277, -5.4290191, 76.43831, 267.2772, 5.160957, 45.815258, 55.0196, 5.0786314, 8.448301, 152.5268,
      -4.0735782, 56.792707, 49.1382, 3.7227167, 49.747842, 204.6609, 3.3971932, 12.058272, 56.5233, -2.8347004, 75.27822, 200.3284,
      -2.6550721, 65.241008, 201.6651, -2.5717867, 64.604291, 213.5577, -2.4712188, 1.647247, 17.0374, 2.462541, 7.811584, 164.4194,
      2.2464112, 12.207832, 94.5422, -2.0755511, 63.856665, 131.9124, -1.9713669, 56.15599, 61.0309, -1.8813061, 77.44884, 296.2073,
      -1.8468785, 6.801054, 135.4894, 1.8186742, 62.209418, 114.875, 1.7601888, 20.656133, 247.0691, -1.5428851, 48.344406, 256.6114,
      1.4738838, 55.14546, 32.1008, -1.4593669, 69.000539, 143.6804, 1.4192259, 11.07135, 16.8784, -1.181898, 74.291298, 160.6835,
      1.1756474, 11.047742, 27.5932, -1.1316126, 0.636717, 348.1074, 1.0896928, 12.844549, 82.6496
    ]),
    ec: Object.freeze([
      0.01860798, 4.207205, 28.620089, 0.01627522, 7.346091, 193.788772, -0.0130066, 17.857263, 308.307024, 0.00988829, 17.220546, 320.199637,
      -0.003367, 16.846733, 279.376984, 0.00333077, 5.199079, 87.195, -0.002354, 18.231076, 349.129677, 0.00140015, 26.216758, 128.443387,
      0.001007, 6.359169, 154.14388, 0.000857, 16.210016, 291.269597, 0.0006499, 3.065181, 114.860583, 0.000599, 16.583829, 332.092251,
      0.000378, 18.49398, 296.414411, -0.000337, 6.190953, 145.76991, 0.000276, 18.867793, 337.237063, 0.000182, 17.425567, 152.092288,
      -0.000174, 6.186001, 126.839891, -0.000124, 18.417441, 210.667199, 0.0000125, 0.667863, 72.108838
    ]),
    mv: Object.freeze([
      7391.022589, 31.609974, 251.9025, 2555.1526947, 32.620504, 280.8325, 2022.7629188, 24.172203, 128.3057, -1973.6517951, 0.636717, 348.1074,
      1240.2321818, 31.983787, 292.7252, 953.8679112, 3.138886, 165.1686, -931.7537108, 30.973257, 263.7951, 872.3795383, 44.828336, 15.3747,
      606.3544732, 0.991874, 58.5749, -496.0274038, 0.373813, 40.8226, 456.9608039, 43.668246, 308.4258, 346.946232, 32.246691, 240.0099,
      -305.8412902, 30.599444, 222.9725, 249.6173246, 2.147012, 106.5937, -199.10272, 10.511172, 114.5182, 191.0560889, 42.681324, 268.7809,
      -175.2936572, 13.650058, 279.6869, 165.9068833, 0.986922, 39.6448, 161.1285917, 9.874455, 126.4108, 139.7878093, 13.013341, 291.5795,
      -133.5228399, 0.262904, 307.2848, 117.0673811, 0.004952, 18.93, 104.6907281, 1.142024, 273.7596, 95.3227476, 63.219948, 143.805,
      86.7824524, 0.205021, 191.8927, 86.0857729, 2.151964, 125.5237, 70.5893698, 64.230478, 172.7351, -69.9719343, 43.836462, 316.7998,
      -62.5817473, 47.439436, 319.6024, 61.5450059, 1.384343, 69.7526, -57.9364011, 7.437771, 123.5968, 57.1899832, 18.829299, 217.6432,
      -57.0236109, 9.500642, 85.5882, -54.2119253, 0.431696, 156.2147, 53.2834147, 1.16009, 66.9489, 52.1223575, 55.782177, 20.2082,
      -49.0059908, 12.639528, 250.7568, -48.3118757, 1.155138, 48.0188, -45.4191685, 0.168216, 8.3739, -42.235792, 1.647247, 17.0374,
      -34.7971099, 10.884985, 155.3409, 34.4623613, 5.610937, 94.1709, -33.8356643, 12.658184, 221.112, 33.6689362, 1.01053, 28.93,
      -31.2521586, 1.983748, 117.1498, -30.8798701, 14.023871, 320.5095, 28.4640769, 0.560178, 262.3602, -27.1960802, 1.273434, 336.2148,
      27.0860736, 12.021467, 233.0046, -26.3437456, 62.583231, 155.6977, 24.725374, 63.593761, 184.6277, 24.6732126, 76.43831, 267.2772,
      24.4272733, 4.28091, 78.9281, 24.0127327, 13.218362, 123.4722, 21.7150294, 17.818769, 188.7132, -21.5375347, 8.359495, 180.1364,
      18.1148363, 56.792707, 49.1382, -16.9603104, 8.448301, 152.5268, -16.1765215, 1.978796, 98.2198, 15.5567653, 8.863925, 97.4808,
      15.4846529, 0.186365, 221.5376, 15.2150632, 8.996212, 168.2438, 14.5047426, 6.771027, 161.1199, -14.3873316, 45.815258, 55.0196,
      13.1351419, 12.002811, 262.6495, 12.8776311, 75.27822, 200.3284, 11.9867234, 65.241008, 201.6651, 11.9385578, 18.870667, 294.6547,
      11.7030822, 22.009553, 99.8233, 11.6018181, 64.604291, 213.5577, -11.2617293, 11.498094, 154.1631, -10.4664199, 0.578834, 232.7153,
      10.433397, 9.237738, 138.3034, -10.2377466, 49.747842, 204.6609, 10.1934446, 2.147012, 106.5938, -10.1280191, 1.196895, 250.4676,
      10.0289441, 2.133898, 332.3345, -10.0034259, 0.173168, 27.3039
    ]),
  });
  const BOGEN_SEK = 1 / 3600, GRAD = PI / 180;
  function gradRest(a) { return a - 360 * Math.floor(a / 360); }   // der Winkel in Grad auf [0, 360) vor dem Bogenmaß: genau auch über Ga
  const BAHN_ELEMENTE = new Map();                                    // t (ka) → [ε, e, ϖ] (rad): reine Funktion, gedeckelter Speicher
  function bahnElemente(tKa) {
    let b = BAHN_ELEMENTE.get(tKa); if (b) return b;
    const y = tKa * 1000, O = BAHN_BERGER.ob, E = BAHN_BERGER.ec, V = BAHN_BERGER.mv;
    let ob = 0, c = 0, s = 0, mv = 0;
    for (let i = 0; i < O.length; i += 3) ob += O[i] * kcos(gradRest(O[i + 1] * BOGEN_SEK * y + O[i + 2]) * GRAD);
    for (let i = 0; i < E.length; i += 3) { const a = gradRest(E[i + 1] * BOGEN_SEK * y + E[i + 2]) * GRAD; c += E[i] * kcos(a); s += E[i] * ksin(a); }
    for (let i = 0; i < V.length; i += 3) mv += V[i] * ksin(gradRest(V[i + 1] * BOGEN_SEK * y + V[i + 2]) * GRAD);
    const w = gradRest(katan2(s, c) / GRAD + 50.439273 * BOGEN_SEK * y + 3.392506 + mv * BOGEN_SEK);
    b = Object.freeze([(23.320556 + ob * BOGEN_SEK) * GRAD, Math.sqrt(c * c + s * s), w * GRAD]);
    if (BAHN_ELEMENTE.size >= 250000) BAHN_ELEMENTE.clear();
    BAHN_ELEMENTE.set(tKa, b); return b;
  }
  let BAHN_HEUTE = null;
  function bahnHeute() { return BAHN_HEUTE || (BAHN_HEUTE = bahnElemente(0)); }
  // die Tages-Einstrahlung als Anteil von S0 an der Breite φ zur wahren Länge λ der Sonne (Berger 1978): (a/r)²/π·(h0·sin φ·sin δ +
  // cos φ·cos δ·sin h0), sin δ = sin ε·sin λ, cos h0 = −tan φ·tan δ (Polartag h0 = π, Polarnacht 0), a/r = (1 − e·cos(λ − ϖ))/(1 − e²)
  function tagesEinstrahlung(phi, lam, eps, e, w) {
    const sp = ksin(phi), cp = kcos(phi), sd = ksin(eps) * ksin(lam), cd = Math.sqrt(1 - sd * sd);
    let ch = cp * cd > 0 ? -(sp * sd) / (cp * cd) : (sp * sd > 0 ? -1 : 1);
    if (ch < -1) ch = -1; if (ch > 1) ch = 1;
    const h = kacos(ch), ar = (1 - e * kcos(lam - w)) / (1 - e * e);
    return ar * ar / PI * (h * sp * sd + cp * cd * Math.sqrt(1 - ch * ch));
  }
  // DAS EIS DER BAHN (Imbrie & Imbrie 1980, Science 207, 943): dV/dt = (1 ∓ b)·(x − V)/Tm — das Eis wächst langsam (1 − b), es schmilzt
  // schnell (1 + b), b 0,6, Tm 17 ka (die Werte der Quelle, nie gestimmt); x = −(Q − Q̄)/σ die Juni-Insolation 65° N des Körpers
  // (λ = 90°), normiert über die letzte Ma je ka. Der Zustand zur Zeit t: 400 ka Anlauf aus V = 0 im festen Gitter ganzer ka, der
  // letzte Schritt bis t (das Gedächtnis des Anfangs e^(−400·0,4/17) < 10⁻⁴) — die Antwort hängt nie an der Reihenfolge der Fragen.
  // Das Meer: das Eis über dem von heute ist Meer unter dem von heute, geeicht am Hochglazial — der tiefste Stand der letzten 30 ka
  // liegt bei −130 m (Lambeck et al. 2014: −134 m; Clark et al. 2009: −120 … −130 m); weniger Eis als heute hebt das Meer höchstens um
  // das Eis, das blieb (tanh-Sättigung): Grönland 7,42 m (Morlighem et al. 2017) + West-Antarktis 3,3 m (Bamber et al. 2009). Die Wärme:
  // das Hochglazial trägt die Ausstrahlung des Energie-Bilanz-Modells um κ·g (g = Meer/−130 m: CO₂ und Eis-Albedo der Eisschilde, mit
  // dem Eis gekoppelt), κ geeicht auf −6,1 K im Mittel des Körpers der Erde (Tierney et al. 2020); die Eis-Albedo des Modells verstärkt
  // sie polwärts. Die tiefe Zeit: das Eis schwingt mit der Kappe, die das Modell ohne Glazial trägt — (1 − x_s(t))/(1 − x_s Erde heute):
  // ohne Kappe kein Glazial.
  const EIS_BAHN = Object.freeze({ b: 0.6, tmKa: 17, anlaufKa: 400, breite: 65 * GRAD, normKa: 1000, meerLgmM: -130, fensterKa: 30,
    restEisM: 7.42 + 3.3, mJeEinheit: 239.07, glazialWm2: 6.115, s0: 1361 });   // die zwei Eichungen: das Hochglazial −18 ka des Körpers der Erde
  // trägt y − y0 = 0,5438 (× 239,07 = 130 m), κ 6,115 W/m² kühlt sein Mittel um 6,10 K (die Eis-Linie 74,4° → 57,8°); S0 1 361 W/m² (Kopp & Lean 2011)
  const KOERPER_BAHN = new Map();                                     // Neigung|Sternfluss → { q: Map(ka → Q/S0), mq, sq, sn, y0 }
  function juniQ(kb, tKa) {
    let q = kb.q.get(tKa); if (q !== undefined) return q;
    const b = bahnElemente(tKa);
    q = tagesEinstrahlung(EIS_BAHN.breite, HALBPI, kb.neigung + (b[0] - bahnHeute()[0]), b[1], b[2]);
    if (kb.q.size >= 250000) kb.q.clear();
    kb.q.set(tKa, q); return q;
  }
  function eisZustand(kb, tKa) {
    const ganz = Math.floor(tKa), cWachs = (1 - EIS_BAHN.b) / EIS_BAHN.tmKa, cSchmelz = (1 + EIS_BAHN.b) / EIS_BAHN.tmKa;
    let y = 0;
    for (let tau = Math.ceil(tKa) - EIS_BAHN.anlaufKa; tau <= ganz; tau++) { const x = -(juniQ(kb, tau) - kb.mq) / kb.sn; y += (x > y ? cWachs : cSchmelz) * (x - y); }
    if (tKa > ganz) { const x = -(juniQ(kb, tKa) - kb.mq) / kb.sn; y += (x > y ? cWachs : cSchmelz) * (x - y) * (tKa - ganz); }
    return y;
  }
  // Der Antrieb eines Körpers in W/m² gegen die Streuung der ERDE (sn = σ_Erde / Sternfluss): das Eis antwortet auf die Abweichung der
  // Einstrahlung, wie Imbrie & Imbrie sie an der Erde geeicht haben — eine schwächere Bahn (Neigung 0: σ 10,3 W/m², die Erde 23,9) treibt
  // schwächer. Vorher normierte jeder Körper auf seine eigene Streuung, jede Bahn trieb wie die der Erde: Neigung 0 trug −601 m, −63 K.
  function bahnKoerper(neigung, fluss) {
    const key = neigung + '|' + fluss;
    let kb = KOERPER_BAHN.get(key); if (kb) return kb;
    kb = { neigung, q: new Map(), mq: 0, sq: 1, sn: 1, y0: 0 };
    let s = 0, s2 = 0; const n = EIS_BAHN.normKa + 1;
    for (let i = 0; i < n; i++) s += juniQ(kb, -i);
    kb.mq = s / n; for (let i = 0; i < n; i++) { const d = juniQ(kb, -i) - kb.mq; s2 += d * d; }
    kb.sq = Math.sqrt(s2 / n);
    kb.sn = (neigung === PLANET_ERDE.neigungRad ? kb.sq : bahnKoerper(PLANET_ERDE.neigungRad, 1).sq) / fluss;
    kb.y0 = eisZustand(kb, 0);
    KOERPER_BAHN.set(key, kb); return kb;
  }
  // das Meer des Eises (m, Erde; + höher): mehr Eis senkt es linear, weniger hebt es bis zum Rest-Eis (tanh, stetig in 0)
  function eisMeerM(a) {
    if (a >= 0) return -a;
    const u = -2 * a / EIS_BAHN.restEisM, v = kexp(-u);
    return EIS_BAHN.restEisM * (1 - v) / (1 + v);
  }
  // DAS STRAHLUNGS-KLIMA (EBM, zwei Moden P0 + P2 mit Eis-Albedo, North 1975): T0, T2 und die Eis-Linie aus der Jahres-Einstrahlung
  // s(x) = 1 + s2·P2(x) — dazu die Krümmung ΔH der HADLEY-Heizung aus der Einstrahlung der Tagundnacht (s2 = −0,625: die Sonne über
  // dem Äquator, bei jeder Neigung dieselbe; Lindzen & Hou verschieben nur ihr Maximum φ0) auf derselben Albedo. Vorher las die Zelle
  // die Krümmung des Jahresmittels: bei 54° Neigung verschwindet sie (P2(cos β) = 0), die Breite fiel auf 0, die Zellen-Zahl lief
  // über 12 (60°) bis 18 (70°) — die Quelle sagt das Gegenteil (Guendelman & Kaspi 2019).
  // Die Bahn der Zeit (oben): die Neigung schwingt um dEps, das Jahresmittel der Einstrahlung folgt der Exzentrizität ((1 − e²)^−½,
  // flussE gegen heute), das Hochglazial hebt die Ausstrahlung um dA — heute dEps 0, flussE 1, dA 0: dieselben Bytes wie zuvor.
  function klimaStrahlung(kp, zeitMa, dEps, flussE, dA) {
    const fluss = kp.sternFluss / (1 - 0.4 * zeitMa / kp.alterMa);     // Gough: L(t)/L_jetzt = 1 / (1 + 0,4·(1 − t/t_jetzt))
    const Qs = KLIMA.q0 * fluss, Q = Qs * flussE;                        // der Thermostat gleicht den Stern, nie die Bahn (100 ka)
    const cb = kcos(kp.neigungRad + dEps), s2 = -0.625 * (3 * cb * cb - 1) * 0.5;   // Jahres-Einstrahlung s(x) = 1 + s2·P2(x)
    // Walker-Thermostat (Karbonat-Silikat-Kreislauf, Walker et al. 1981): über Ma gleicht das CO₂ den Sternfluss zum Anteil γ aus —
    // die Ausstrahlung sinkt um γ·(Q_heute − Q)·ā. Bei t = 0 ist der Term 0 (bau2-Bytes unverändert). γ gesetzt.
    const N = 256, A = KLIMA.olrA - KLIMA.walker * (KLIMA.q0 * kp.sternFluss - Qs) * KLIMA.coA0 + dA, B = KLIMA.olrB, D = KLIMA.diffD;
    let xs = 1, T0 = 0, T2 = 0;
    for (let it = 0; it < 80; it++) {
      let m0 = 0, m2 = 0;
      for (let i = 0; i < N; i++) {
        const x = (i + 0.5) / N, p2 = 1.5 * x * x - 0.5, s = 1 + s2 * p2;
        const a = x > xs ? KLIMA.coEis : KLIMA.coA0 + KLIMA.coA2 * p2;
        m0 += a * s; m2 += a * s * p2;
      }
      m0 /= N; m2 = 5 * m2 / N;
      T0 = (Q * m0 - A) / B; T2 = Q * m2 / (B + 6 * D);
      const p2s = T2 < 0 ? (KLIMA.tEisC - T0) / T2 : 2;
      const xn = p2s >= 1 ? 1 : (p2s <= -0.5 ? 0 : Math.sqrt((2 * p2s + 1) / 3));
      xs += 0.5 * (xn - xs);
    }
    const s2h = -0.625;   // die Heizung der Zelle: die Einstrahlung der Tagundnacht auf der Albedo des Jahrs (nie die Krümmung des Jahresmittels)
    let m2h = 0;
    for (let i = 0; i < N; i++) { const x = (i + 0.5) / N, p2 = 1.5 * x * x - 0.5; m2h += (x > xs ? KLIMA.coEis : KLIMA.coA0 + KLIMA.coA2 * p2) * (1 + s2h * p2) * p2; }
    const T0K = T0 + 273.15, dH = Math.max(0.01, -1.5 * (Q * (5 * m2h / N) / B) / T0K);   // Held-Hou Δ_H: Gefälle des Strahlungs-Gleichgewichts
    return { fluss, T0, T2, xs, T0K, dH };
  }
  // DIE KANTE DER ZELLE (rad): φH nach Held & Hou an der Krümmung ΔH, das Jahresmittel der Kanten der Sonnwende nach Lindzen & Hou (oben)
  function hadleyMass(kp, R, K, neigung) {
    const om = TAU / (kp.tagStunden * 3600), a = R * 1000, H = KLIMA.tropoKm * 1000 * (9.81 / kp.g) * (K.T0K / 288);
    let phiH = Math.sqrt(5 / 3 * kp.g * H * K.dH / (om * om * a * a));
    if (phiH > HALBPI) phiH = HALBPI; if (phiH < 0.05) phiH = 0.05;
    return phiH * hadleyJahr(KLIMA.schubMeer * neigung / phiH);
  }
  let HADLEY_ERDE = null;   // die Kante des Körpers der Erde heute (einmal je Kern): der Nenner der Eichung (KLIMA.hadleyErdeRad)
  let KAPPE_ERDE = null;    // die Eis-Kappe des Körpers der Erde heute ohne Glazial (1 − x_s): der Nenner der tiefen Zeit (EIS_BAHN)
  function planetKlimaGlobal(plan, zeitMa) {
    if (!plan || !plan.koerper) throw new Error('planetKlimaGlobal: plan fehlt (K10)');
    abschnittIndex(plan, zeitMa);
    const M = memoVon(plan); if (!M.klimaG) M.klimaG = new Map();
    if (M.klimaG.has(zeitMa)) return M.klimaG.get(zeitMa);
    // DIE BAHN UND IHR EIS zur Zeit (oben): t auf das Jahr gerundet (zeitMa·10⁶ a ist selten eine ganze Zahl von ka im Binärformat)
    const kp = plan.koerper, tKa = Math.round(zeitMa * 1e9) / 1e6, b = bahnElemente(tKa), b0 = bahnHeute(), kb = bahnKoerper(kp.neigungRad, kp.sternFluss);
    const dEps = b[0] - b0[0], flussE = Math.sqrt((1 - b0[1] * b0[1]) / (1 - b[1] * b[1])), dPraez = b[1] * ksin(b[2]) - b0[1] * ksin(b0[2]);
    // die Kappe der Zeit ohne Bahn und ohne Glazial (Stern, Thermostat, Neigung des Körpers): die Kapazität des Eises, nie sein Takt —
    // höchstens die der Erde heute: die Eichung (−130 m, −6,1 K) reicht bis zu ihr, darüber trägt keine Quelle das Maß (Neigung 0 mit
    // der Kappe bis 59,7°: × 4,6 vorher, das Glazial lief mit der Eis-Albedo davon)
    const kappe = KAPPE_ERDE || (KAPPE_ERDE = 1 - klimaStrahlung(PLANET_ERDE, 0, 0, 1, 0).xs), K0 = klimaStrahlung(kp, zeitMa, 0, 1, 0), fk = (1 - K0.xs) / kappe;
    const meerGlazialM = (fk < 1 ? fk : 1) * eisMeerM(EIS_BAHN.mJeEinheit * (eisZustand(kb, tKa) - kb.y0));
    const glazial = meerGlazialM / EIS_BAHN.meerLgmM, dA = EIS_BAHN.glazialWm2 * glazial;
    const K = dEps !== 0 || flussE !== 1 || dA !== 0 ? klimaStrahlung(kp, zeitMa, dEps, flussE, dA) : K0, neigung = kp.neigungRad + dEps, h = hadleyMass(kp, plan.R, K, neigung);
    const E = HADLEY_ERDE || (HADLEY_ERDE = hadleyMass(PLANET_ERDE, PLANET_ERDE.radiusKm, klimaStrahlung(PLANET_ERDE, 0, 0, 1, 0), PLANET_ERDE.neigungRad));
    // das Verhältnis zur Kante der Erde (am Körper der Erde x/x = 1 genau: die Heimat steht Bit für Bit)
    let zellBreite = KLIMA.hadleyErdeRad * (h / E);
    if (zellBreite > HALBPI) zellBreite = HALBPI; if (zellBreite < 0.05) zellBreite = 0.05;
    const zellen = Math.max(1, Math.floor(HALBPI / zellBreite + 0.5));
    const G = Object.freeze({
      sternFluss: K.fluss, tMittelC: K.T0, tAequatorC: K.T0 - 0.5 * K.T2, tPolC: K.T0 + K.T2, T0: K.T0, T2: K.T2,
      eisBreite: K.xs >= 1 ? HALBPI : katan2(K.xs, Math.sqrt(1 - K.xs * K.xs)), eisX: K.xs,
      zellBreite, zellen, deltaH: K.dH,
      neigung, exzentrizitaet: b[1], perihel: b[2], dPraez, insolation65N: EIS_BAHN.s0 * kp.sternFluss * juniQ(kb, tKa), meerGlazialM, glazial,
    });
    M.klimaG.set(zeitMa, G); return G;
  }

  // Niederschlag der Gürtel (mm/a, über dem Meer) an der effektiven Breite φ' (rad) — die Gürtel wandern als Ganzes
  function guertelP(phiE, w, zellen) {
    const ap = phiE < 0 ? -phiE : phiE;
    const u = phiE / (0.4 * w);
    let p = KLIMA.grund + (u * u < 40 ? KLIMA.itcz * kexpS(-u * u) : 0);
    // Gegner 2 + 3 (Westwind-Regen fehlte bei 27–45°): die Sturmbahn ist die baroklinische Zone der Ferrel-Zelle — sie liegt
    // in ihrer Mitte (1,5·w bei k = 2; Erde 44°), nicht am polaren Rand (vorher 0,85·k·w = 50°), und ist so breit wie die halbe Zelle
    // (vorher 0,4·w: ein Band von 8° σ, das die Mittelbreiten trocken ließ).
    for (let k = 2; k <= 2 * zellen; k += 2) {
      const v = (ap - 0.75 * k * w) / (0.55 * w); if (v * v < 40) p += KLIMA.sturm * kexpS(-v * v);
    }
    // Absinken im Hadley-Rand (Subtropen-Hoch): die absteigende Luft trocknet den Gürtel um φ ≈ 0,85·w — der Wüstengürtel ist
    // ein Gesetz der Zirkulation, nicht nur die Lücke zwischen zwei Regenbändern.
    const sd = (ap - 0.85 * w) / (0.3 * w);
    if (sd * sd < 40) p *= 1 - KLIMA.absinken * kexpS(-sd * sd);
    return p;
  }

  const KL_P = {};
  // B2 die Feuchte-Knoten luvwärts (fest, nie mit dem Wind skaliert; fern → nah gelesen): die nahen sind die Hüllen-Schritte (100-km-Takt,
  // ihr kont fällt aus derselben Auswertung der Hülle: das Krusten-Feld der Gruppe in der groben Lesart, Radius gemischt), die fernen
  // stehen im 600-km-Takt bis 2 150 km — 2 e-Faltungen des Nachladens je Knoten (meerKm), eine des Zehrens (landKm). Vorher 14 Knoten im 150-km-Takt
  // NEBEN vier eigenen Hüllen-Schritten: 19 Krusten-Felder je Ort, 47 % der Klima-Zeit (Profil 19.11.); jetzt 3 + 4 Hüllen
  const KL_H = new Float64Array(3), KL_K = new Float64Array(3), FEUCHTE_NAH_KM = 100, FEUCHTE_FERN_KM = 600;
  const FEUCHTE_FERN = Object.freeze([650, 1250, 1850]);
  // B2 EIN Land-Gewicht des Klimas, stetig über den Saum des Flachwassers — vorher schaltete land = h > 0 die Feuchte-Kette, den
  // Trocken-Zuschlag, die Spanne des Jahrs und den Abfluss (b-stetig erde-01 Küste: 400 von 400 Querungen sprangen, |ΔT| bis 6,2 K,
  // |ΔP| bis 1 919 mm/a auf 1 cm). Die Küstenluft ist Landluft: das Klima des Landes reicht über das Flachwasser und klingt bis
  // −KUESTE_SAUM_KM zum offenen Meer aus (Schelf-Meere tragen Land-Regen und Land-Spanne; gesetzt). Auf Land ist das Gewicht 1 — das
  // Land-Klima steht Bit für Bit —, an der Null-Linie ist sein Gefälle 0; am steilsten Küsten-Hang der Probe (Δh 5,5 mm je cm) wechselt
  // es je cm um ≤ 4·10⁻⁵.
  const KUESTE_SAUM_KM = 0.2;
  function landGewicht(hKm) { return glatt(-KUESTE_SAUM_KM, 0, hKm); }
  // B2 DIE Verdunstung (PET, mm/a): EINE Formel für den Trocken-Zuschlag des Klimas, den Abfluss, die Pflanzen-Deckung (Atlas und Wuchs
  // des Orts) und das Wasser (planetPet). Holdridge 1967 (Life Zone Ecology): PET = 58,93 mm/K · die Biotemperatur, das Mittel der zwölf
  // Monate mit jedem Monat unter 0 °C als 0 und über 30 °C als 30 (der Monat folgt dem Jahres-Gang: Mittel `tC`, halbe Spanne `amp`).
  // Vorher 400 + 45·T⁺ (Turc-Form, gesetzt): 400 mm auch bei −20 °C — das kalte Innere las Trockenheit, wo die Taiga steht (N 238 mm bei
  // −8,8 °C: N/PET 0,59), und der Abfluss rechnete mit einem eigenen L(T) dagegen (biome-planet, main 38194f83: Station 76,9 %).
  // Gemessen gegen Thornthwaite 1948 (unkorrigiert): die Spende der Heimat fiel auf 229 mm (das Spiel trägt 328,5), Station 84,9 %;
  // Holdridge trägt 335 mm. Eis ohne warmen Monat hat PET 0: kein Anspruch, P/PET ist dort nicht definiert (ihr Leser fragt `pet > 0`).
  const PET_HOLDRIDGE = 58.93, PET_MONAT = Object.freeze(Array.from({ length: 12 }, (_, m) => Math.cos(2 * PI * (m + 0.5) / 12)));
  function petMm(tC, amp) {
    let s = 0;
    for (let m = 0; m < 12; m++) { const t = tC + amp * PET_MONAT[m]; s += t <= 0 ? 0 : t >= 30 ? 30 : t; }
    return PET_HOLDRIDGE * s / 12;
  }
  // die tatsächliche Verdunstung (mm/a) aus Niederschlag und Anspruch, Pike 1964: E = P / √(1 + (P/PET)²) — ohne Anspruch (PET 0, Eis
  // ohne warmen Monat) oder ohne Regen verdunstet nichts
  function aetPike(p, pet) { return p > 0 && pet > 0 ? p / Math.sqrt(1 + (p / pet) * (p / pet)) : 0; }
  // klima-kontinent: EIN Schritt des Feuchte-Integrals längs des Winds über einen Knoten mit Meer-Anteil sj und Hülle hk (km), Schritt-
  // Faktoren eM (Meer) und eL (Land). Zustand KL_W: [0] mW Nachladen/Zehren, [1] sp die Sperre, [2] hS die Sperrhöhe (−1 am Rand des
  // Fensters: der erste Knoten setzt sie, ohne zu sperren — jenseits des Fensters ist nichts bekannt), [3] mLand die Rückführung.
  const KL_W = new Float64Array(4);
  function feuchteKnoten(eM, eL, sj, hk) {
    const mW = KL_W[0], sp = KL_W[1], hS = KL_W[2], mLand = KL_W[3], hl = hk > 0 ? hk : 0;
    let spL = 1 - (1 - sp) * eL, hL = hl;
    if (hS >= 0) { if (hl > hS) spL *= kexpS(-(hl - hS) / KLIMA.sperreKm); else hL = hl + (hS - hl) * eL; }
    KL_W[0] = sj * (1 - (1 - mW) * eM) + (1 - sj) * (mLand + (mW - mLand) * eL);
    KL_W[1] = sj * (1 - (1 - sp) * eM) + (1 - sj) * spL;
    KL_W[2] = (1 - sj) * hL;
  }
  function planetKlimaR(S, x, y, z, saison, aus, punkt) {
    pruefScheibe(S);
    const plan = S.plan, kp = plan.koerper, R = S.R, G = planetKlimaGlobal(plan, S.zeitMa), ds = kp.drehsinn;
    if (!(saison === -1 || (saison >= 0 && saison <= 1))) throw new Error('planetKlima: saison 0..1 oder −1 (Jahr) (K10)');
    let pt = punkt; if (!pt) { planetPunktR(S, x, y, z, 40, KL_P); pt = KL_P; }
    const hKm = pt.hoeheKm, lam = landGewicht(hKm), kont = pt.kont, hPos = hKm > 0 ? hKm : 0;
    const cphi = Math.sqrt(x * x + z * z), phi = katan2(y, cphi), aphi = phi < 0 ? -phi : phi, sg = phi < 0 ? -1 : 1;
    const w = G.zellBreite, o = aus || {};
    // die Westwind-Zone (klima-kontinent): flach von 1,4·w bis 1,9·w, Rampen bis w und 2,3·w (Erde 41–56°, 30–68°) — vorher eine Glocke
    // um 1,6·w (σ 0,35·w): bei 60° nur 0,29, wo die Drift Norwegen trägt (Bergen 7,6 °C − Magadan −2,6 °C; WMO-Normalwerte)
    const wwZ = glatt(w, 1.4 * w, aphi) * glatt(2.3 * w, 1.9 * w, aphi);
    // Wind (woher), Einheit im Ost-Nord-Rahmen: Passat aus Ost und polwärts, Westwind aus West und äquatorwärts, im Takt der Zellen
    const sw = ksin(PI * aphi / w);
    const uO0 = ds * sw, vN0 = sg * 0.3 * sw;                              // meridional ~0,3 des zonalen (gesetzt)
    // Gegner 2 (F6 Wind-Strahlen): der Wind war eine reine Funktion der Breite — jede Küsten-Ecke luvwärts warf einen schnurgeraden
    // Schatten-Strahl unter demselben Winkel quer durch den Kontinent. Stehende Wellen der Zirkulation (Hochs und Tiefs über den
    // Becken, λ 6 000–2 500 km) drehen die Richtung (typisch ±20°, Spitze ±50°); die Integration bleibt EIN Großkreis je Punkt, aber benachbarte Punkte
    // sehen verschiedene Richtungen: die Kanten krümmen sich. Das Feld steht fest im Körper (Luft, keine Platte; gesetzt).
    const thW = 0.9 * fbmKm(plan.k ^ 0x5bd1e995, x, y, z, R, 6000, 2500, 0.5), cW = kcos(thW), sWd = ksin(thW);
    const uO = uO0 * cW - vN0 * sWd, vN = uO0 * sWd + vN0 * cW;
    const wl = Math.sqrt(uO * uO + vN * vN);
    // Temperatur der Zone (Meeres-Niveau, Jahr)
    const p2 = 1.5 * y * y - 0.5, tZ = G.T0 + G.T2 * p2;
    const fT = tZ >= 15 ? 1 : Math.max(0.08, kexpS(0.05 * (tZ - 15)));   // Clausius-Clapeyron nur kalt-seitig: das Profil trägt die Erd-Verteilung
    let m = 1, schatten = 1, hub = 1, meerLuv = 1, c = 0, dTj = 0, dTs = 0, dTw = 0, pF = 1, meerWest = 0, relief = 1, meerLuft = 1;
    if (lam > 0) {
      // Schritte luvwärts (fern → nah): Meer füllt die Feuchte auf, Land zehrt, Kämme beschatten. Alles stetig: Meer-Anteil je
      // Hüllen-Schritt s = glatt(+0,3; −0,6 km; Hülle), je Feuchte-Knoten glatt über den halben Takt; keine Schwelle.
      const mLand = KLIMA.feuchteLand0 + (KLIMA.feuchteLand1 - KLIMA.feuchteLand0) * glatt(5, 25, tZ);
      const hO = planetHuelle(S, x, y, z);                                // eigene Hülle: Schatten und Hub auf derselben Lesart wie die Schritte
      const mNeutral = mLand + (1 - mLand) * kexpS(-Math.max(0, kont) / 1000);   // ohne Windrichtung (Zellrand): Feuchte nach Küstenferne
      let mW = mNeutral, schranke = 0, hubW = 0, mar = 0, sp = 1;
      const om = wl / 1.044;                                              // G2.3 Gewicht des Luv-Gangs wächst stetig mit dem Wind; am Zellrand (Wind 0) trägt mNeutral
      if (cphi > 1e-9 && om > 0) {
        const eEx = -z / cphi, eEz = x / cphi, eNx = -y * x / cphi, eNy = cphi, eNz = -y * z / cphi;
        const dx = (uO * eEx + vN * eNx) / wl, dy = (vN * eNy) / wl, dz = (uO * eEz + vN * eNz) / wl;
        // die nahen Hüllen-Schritte (100 … 300 km, fest): Kamm-Schranke und Hub — und ihr kont (B2: der nahe Feuchte-Knoten)
        for (let j = 2; j >= 0; j--) {
          const a = KLIMA.schritte[j] / R, ca = kcos(a), sa = ksin(a);
          KL_H[j] = planetHuelle(S, ca * x + sa * dx, ca * y + sa * dy, ca * z + sa * dz); KL_K[j] = PK.kont;
        }
        // G2.3 Feuchte als Integral längs des Winds über feste Knoten (vorher: sechs Punkt-Proben bei [75 … 2 000]·skal km — jede
        // scharfe Kante luvwärts erschien als Geister-Küste, und weil skal mit der Breite schrumpfte, liefen die Geister zu Keilen
        // aus einem Punkt zusammen: die Fächer, Befund Punkt 3). Die Meeres-Anzeige je Knoten liest den Krusten-Abstand derselben
        // EINEN Küste wie kont (Feld der Gruppe, Radius gemischt), über den halben Takt geglättet; über Meer lädt die Feuchte nach
        // (meerKm), über Land strebt sie zur Rückführung mLand (landKm).
        // klima-kontinent: die fernen Knoten lesen die Hülle (Höhe UND kont — vorher kontGrob, ein eigenes Krusten-Feld, B2): die Sperre
        // sieht jeden Anstieg im Fenster. Die Sperre sp (Anteil des Dampfs, den die Anstiege übrig ließen) ist der zweite Faktor
        // DERSELBEN Feuchte (m = mW·sp): mW trägt Nachladen und Zehren, sp das Ausregnen über dem Relief; die Sperrhöhe hS ist die
        // höchste Querung seit dem letzten Meer (über Meer 0, über Land heilt sie mit landKm zur Höhe des Knotens). Ohne Anstieg im
        // Fenster ist sp genau 1, ohne Meer im Fenster mW genau mLand — der Ort ohne Meer und Relief trägt sein Klima Bit für Bit.
        KL_W[0] = mLand; KL_W[1] = 1; KL_W[2] = -1; KL_W[3] = mLand; mar = 0;
        const eMf = kexpS(-FEUCHTE_FERN_KM / KLIMA.meerKm), eLf = kexpS(-FEUCHTE_FERN_KM / KLIMA.landKm);
        for (let kq = FEUCHTE_FERN.length - 1; kq >= 0; kq--) {
          const sk = FEUCHTE_FERN[kq], a = sk / R, ca = kcos(a), sa = ksin(a);
          const hk = planetHuelle(S, ca * x + sa * dx, ca * y + sa * dy, ca * z + sa * dz), kk = PK.kont;
          const sj = glatt(0.5 * FEUCHTE_FERN_KM, -0.5 * FEUCHTE_FERN_KM, kk);
          feuchteKnoten(eMf, eLf, sj, hk);
          const mj = sj * kexpS(-sk / 600); if (mj > mar) mar = mj;
        }
        const eMn = kexpS(-FEUCHTE_NAH_KM / KLIMA.meerKm), eLn = kexpS(-FEUCHTE_NAH_KM / KLIMA.landKm);
        for (let j = 2; j >= 0; j--) {
          const sj = glatt(0.5 * FEUCHTE_NAH_KM, -0.5 * FEUCHTE_NAH_KM, KL_K[j]);
          feuchteKnoten(eMn, eLn, sj, KL_H[j]);
          const mj = sj * kexpS(-KLIMA.schritte[j] / 600); if (mj > mar) mar = mj;
        }
        mW = KL_W[0]; sp = KL_W[1];
        // der eigene halbe Schritt (0 … 50 km) liest das Land-Gewicht des Orts; sein eigener Anstieg regnet HIER (der Hub), er sperrt nur windab
        mW = (1 - lam) * (1 - (1 - mW) * kexpS(-0.5 * FEUCHTE_NAH_KM / KLIMA.meerKm)) + lam * (mLand + (mW - mLand) * kexpS(-0.5 * FEUCHTE_NAH_KM / KLIMA.landKm));
        // die Wirbel der Sturmbahn laden vom nahen Meer in jeder Richtung nach (vor der Sperre: auch ihr Dampf regnet am Anstieg aus)
        mW += (1 - mW) * KLIMA.wirbelAnteil * wwZ * glatt(KLIMA.wirbelKm, 0, kont);
        // Kamm-Schranke: die nahen Hüllen-Schritte (fern → nah), gewichtet mit e^(−d/leeKm) — die Luft mischt sich hinter dem Kamm;
        // über Meer klingt sie mit meerKm ab
        for (let j = 2; j >= 0; j--) {
          const dj = KLIMA.schritte[j], h = KL_H[j], sj = glatt(0.3, -0.6, h);
          const b = (h - hO) * kexpS(-dj / KLIMA.leeKm);
          schranke = sj * schranke * eMn + (1 - sj) * (b > schranke ? b : schranke);
        }
        const anstieg = hO - (KL_H[0] > 0 ? KL_H[0] : 0);
        // Hub hebt nur die vom Meer herangeführte Feuchte (m über mLand), nie die rückgeführte — nach der Sperre
        hubW = 0.9 * Math.min(1.5, Math.max(0, anstieg)) * Math.max(0, (mW * sp - mLand) / (1 - mLand));
      }
      // B2 jede Land-Wirkung klingt mit dem Land-Gewicht zum Meer aus (bei λ = 1 Bit für Bit der Land-Wert, bei λ = 0 der des Meers)
      m = (1 - lam) + lam * (om * mW * sp + (1 - om) * mNeutral);
      schatten = (1 - lam) + lam * kexpS(-Math.max(0, om * schranke) / KLIMA.schattenKm);
      hub = (1 - lam) + lam * (1 + om * hubW);
      // das Relief am Regen der Front: Sperre · Föhn · Hub — genau 1 ohne Anstieg luvwärts (der Sturm liest es, ortRoh)
      relief = ((1 - lam) + lam * (1 - om * (1 - sp))) * schatten * hub;
      meerLuv = (m - mLand) / (1 - mLand) > 0.02 ? 1 : 0;                // Feuchte mit Meeres-Anteil (Quelle luvwärts bzw. nach Küstenferne)
      // klima-kontinent: die Meeresluft am Ort ist der Anteil der Luft, die längs des EINEN Winds vom Meer kommt (om·mar) — die
      // Kontinentalität ist ihr Rest, gedämpft von der Küstennähe in jeder Richtung (Seewind, Tage mit auflandigem Strom:
      // glatt(−1 000, 1 500, kont), an der Küste 0,35). Vorher c = glatt(0, 1 500, kont)·(1 − 0,6·om·mar): an jeder Küste ≈ 0, auch wo
      // der Wind vom Land kommt. Band: die Ostküste im Westwind trägt c ≈ 0,2–0,6 (aus der Jahres-Spanne: Boston, Halifax, Sapporo
      // 0,23–0,27, Wladiwostok 0,57; WMO-Normalwerte), die Westküste ≈ 0. Ohne Meer im Fenster und kont ≥ 1 500 km Bit für Bit gleich.
      meerLuft = om * mar;
      c = lam * (1 - meerLuft) * glatt(-1000, 1500, kont);
    }
    // Küstenseite aus dem Gefälle des glatten Krustenfelds (± 400 km nach Ost), Abklingen landein — und seit dem Angriff auch
    // seewärts (Gegner 3, Meereis tot symmetrisch): die Randströme wärmen und kühlen das MEER an den Becken-Rändern; ohne sie war
    // die Meeres-Temperatur eine reine Breitenfunktion. Für einen Meeres-Punkt heißt „Meer im Westen, Land im Osten“ Ost-Rand des Beckens.
    // Gegner 2 (F5): über offenem Meer jenseits 1 500 km hing die Winter-Luft nur von der Breite ab — die Meereis-Kante lag als
    // Breitenkreis über den ganzen Umfang (p05–p95 0,45–1,8°). Der Becken-Rand wird jetzt im Abstand des Punkts von der Kruste
    // gesucht (400 km + Abstand, bis 3 000 km), und die Westwind-Drift (Nordatlantik-Strom) wärmt bzw. kühlt ihr Becken auf
    // 1 500 km seewärts statt 500 km; der Subtropen-Strom bleibt 500 km breit.
    if (kont < 1200 && cphi > 1e-9) {
      {
        const weit = kont < 0 ? (-kont < 2600 ? -kont : 2600) : 0;
        const a = (400 + weit) / R, ca = kcos(a), sa = ksin(a), eEx = -z / cphi, eEz = x / cphi;
        const fW = krusteFeld(S, ca * x - sa * eEx, ca * y, ca * z - sa * eEz, 400, true);
        const fE = krusteFeld(S, ca * x + sa * eEx, ca * y, ca * z + sa * eEz, 400, true);
        const kf = S.kuesteF;
        meerWest = glatt(kf + 0.02, kf - 0.08, fW) - glatt(kf + 0.02, kf - 0.08, fE);   // +1: Meer im Westen (Westküste)
        const seite = meerWest * ds;                                                    // Wirbel-Ast kehrt mit dem Drehsinn
        const decL = kexpS(-Math.max(0, kont) / 350), dec = (1 - lam) * kexpS(Math.min(0, kont) / 500) + lam * decL;   // seewärts: Randstrom ~500 km breit (gesetzt)
        const su = (aphi - 0.8 * w) / (0.3 * w);
        const sub = su * su < 40 ? kexpS(-su * su) : 0, ww = wwZ;
        const sW = seite > 0 ? seite * dec : 0, sE = seite < 0 ? -seite * dec : 0;
        const decW = (1 - lam) * kexpS(Math.min(0, kont) / 1500) + lam * decL, sEw = seite < 0 ? -seite * decW : 0;
        // Subtropen: Westküste kalt und trocken (Ostrand-Strom), Ostküste warm und feucht; Westwind: Westküste mild, Ostküste winterkalt
        dTj = sub * (-4 * sW + 1.5 * sE);
        // klima-kontinent: über Land trägt die Meeresluft längs des Winds den milden Winter (vorher die Küstenseite des Krustenfelds,
        // 5·sWw: der Westwind las seine Luft nicht); über dem Meer wärmt die Westwind-Drift ihr Becken wie zuvor. Die Ostküste trägt
        // den kalten Rand-Strom (Labrador, Oyashio) auf Land und Meer.
        const sWm = seite > 0 ? seite * kexpS(Math.min(0, kont) / 1500) : 0;
        dTw = ww * ((1 - lam) * 5 * sWm + lam * KLIMA.westWinterK * meerLuft + KLIMA.ostWinterK * sEw);
        dTs = ww * ((1 - lam) * -1.5 * sWm + lam * KLIMA.westSommerK * meerLuft + KLIMA.ostSommerK * sEw);
        const decO = kexpS(-Math.max(0, kont) / 700), sEo = seite < 0 ? -seite * decO : 0;   // Ost-Rand: warmer Strom + Sommer-Monsun reichen weiter landein (gesetzt)
        // klima-kontinent: der kalte Rand-Strom nimmt der Küste fast den ganzen Gürtel-Regen (vorher −0,75: die Westküsten-Wüste trug
        // ~100 mm). Band: Antofagasta ~2 mm, Walvis Bay ~13 mm, Lima ~10 mm gegen ~500 mm des Land-Mittels bei 20–25° (≤ 5 %; WMO-Normalwerte)
        pF = 1 + sub * (-0.95 * sW + 1.0 * sEo) + ww * 0.2 * sW;
      }
    }
    // Gürtel über das Jahr: Deklination ±β, die Verschiebung wächst mit der Erwärmung des Landes (Monsun: das Hitzetief liegt über
    // der Landmasse, gleich woher der Wind weht — klima-kontinent: nie die Luft längs des Winds, die Passat-Westküste ist kein Monsun)
    const beta = G.neigung, schub = (KLIMA.schubMeer + 0.4 * lam * glatt(0, 1500, kont)) * (1 - 0.5 * aphi / HALBPI);
    // Gegner 2 (F5 Wüsten-Kante als Breitenkreis): die Hochs der Subtropen sind Zellen über den Becken, keine Bänder — die Gürtel
    // lesen die Breite verschoben um dasselbe Feld stehender Wellen (±~3°, λ 6 000–2 500 km, eigener Samen; gesetzt).
    const phiG = phi + 0.035 * fbmKm(plan.k ^ 0x27d4eb2f, x, y, z, R, 6000, 2500, 0.5);
    const pN = guertelP(phiG, w, G.zellen) * fT, pP = guertelP(phiG - beta * schub, w, G.zellen) * fT, pM = guertelP(phiG + beta * schub, w, G.zellen) * fT;
    const pSom = sg > 0 ? pP : pM, pWin = sg > 0 ? pM : pP;
    const fak = m * schatten * hub * ((1 - lam) + lam * pF);
    const pJahr = 0.25 * (2 * pN + pP + pM) * fak;
    const sommerAnteil = (pSom + pN) / (2 * pN + pP + pM);
    // Temperatur am Ort
    // die Länge des Jahrs gegen die der Erde (Gegner Reise F4: EIN Jahr — die Normierung liest PLANET_ERDE, am Jahr der Erde genau 1)
    const sb = ksin(beta), fJ = (kp.jahrTage * (PLANET_ERDE.jahrTage + 60)) / ((kp.jahrTage + 60) * PLANET_ERDE.jahrTage);
    // Land schwingt stärker als Meer, auch an der Küste; jenseits der Eis-Linie der Zone (tZ ≤ tEis) zehrt Schnee den Sommer (gesetzt)
    // Meer nahe Land (Gegner 3): winterkalte Festlandsluft — Randmeere schwingen stärker als der offene Ozean (Ochotsk, Hudson)
    const cL = (1 - lam) * 0.3 * kexpS(Math.min(0, kont) / KLIMA.kontiMeerKm) + lam * (0.3 + 0.7 * c) * (1 - 0.85 * glatt(KLIMA.tEisC + 5, KLIMA.tEisC - 5, tZ));
    // DIE PRÄZESSION (Karte 2 planet.kopplung.bahn-klima#3): die Solstitien-Differenz der Tages-Einstrahlung einer Halbkugel ist in
    // erster Ordnung von e (S0/π)·[(f₊ − f₋) − 2·sg·e·sin ϖ·(f₊ + f₋)], f± = h0·sin φ·sin(±ε) + cos φ·cos ε·sin h0 (Berger 1978); die
    // Spanne der Heimat trägt das e·sin ϖ von heute schon, die Zeit trägt die Änderung (dPraez, heute 0: dieselben Bytes). Am Äquator
    // trägt sie allein den Gang (f₊ − f₋ = 0): das Perihel macht die Jahreszeit der Tropen.
    let ampP = 0;
    if (G.dPraez !== 0) {
      const ay = y < 0 ? -y : y, cb2 = kcos(beta);
      let ch = cphi * cb2 > 0 ? -(ay * sb) / (cphi * cb2) : -1; if (ch < -1) ch = -1; if (ch > 1) ch = 1;
      const h0 = kacos(ch), summe = ay * sb * (2 * h0 - PI) + 2 * cphi * cb2 * Math.sqrt(1 - ch * ch);
      ampP = (5 + 28 * cL) / (PI * 0.39782) * (-2 * sg * G.dPraez * summe) * fJ;
    }
    const amp = (5 + 28 * cL) * (sb / 0.39782) * (y < 0 ? -y : y) * fJ + ampP;  // halbe Jahres-Spanne: Meer 5 K, Inneres 33 K bei sin φ = 1 (gesetzt)
    // Trockenes Land heizt (Gegner 2, heiße Wüste 4 % statt ~14 %): ohne Verdunstung und Wolken liegt die Wüste über dem Zonen-Mittel —
    // klima-kontinent: nur die warme Zone (voll ab 20 °C, aus unter 10 °C; vorher ab 0 °C halb bei 10 °C: die trockene Ostküste der
    // Mittelbreiten lag 2–3 K über ihrer Westküste). Band: Gobi und Kasachstan liegen im Jahr UNTER der Breite, nicht über ihr.
    const trocken = lam * KLIMA.trockenK * glatt(0.6, 0.2, pJahr / petMm(tZ, amp)) * glatt(10, 20, tZ);
    const tJ = tZ - KLIMA.lapse * hPos + dTj + trocken;
    // Gegner 2 (F5 Meereis als Breitenkreis): die stehenden Wellen führen im Winter Luft aus der Breite, aus der sie kommen — dreht der
    // Wind (woher) polwärts, kommt Polarluft (kälter), dreht er äquatorwärts, Warmluft. 12 K je Einheit der meridionalen Abweichung
    // (gesetzt; Erde: die Eiskante streut über den Umfang ~10–20° Breite, Labrador ↔ Nordkap).
    const advW = -12 * sg * (vN - vN0);
    // DER JAHRES-GANG FOLGT DER NEIGUNG (Karte 2 planet.kopplung.bahn-klima#2): die Solstitien-Differenz der Tages-Einstrahlung ist
    // π·sin φ·sin β an JEDEM Ort, auch jenseits des Polarkreises (Polartag gegen Polarnacht) — `amp` trägt sie. Die Zuschläge der
    // Küsten (dTs, dTw) und die Winter-Advektion (advW) sind Teil DESSELBEN Gangs und folgen ihm im selben Verhältnis: ohne Neigung
    // kein Winter, keine winterkalte Festlandsluft. Am Körper der Erde ist das Verhältnis x/x = 1 genau (Lehre 11: die Heimat byte-gleich).
    const jG = sb / ksin(PLANET_ERDE.neigungRad);
    const tS = tJ + amp + dTs * jG, tW = tJ - amp + dTw * jG + advW * jG;
    // Abfluss: Pike 1964, E = P / √(1 + (P/PET)²) mit PET = DER Verdunstungs-Anspruch des Kerns (`petMm`, B2 — derselbe, den Pflanzen-
    // Deckung, Trocken-Zuschlag und Überlauf lesen). Hier stand Turcs eigenes L(T) = 300 + 25T + 0,05T³ (Turc 1954, mit 0,9): der Abfluss
    // sah im kalten Inneren Wasser-Überschuss (N 238 mm bei −8,8 °C: 186 mm), wo die Deckung desselben Orts Trockenheit las (N/PET 0,59
    // → Wald 0,48) — biome#4 am Rumpf der Station: 80 von 81 Fehl-Orten, passtProzent 76,9 % (biome-planet, main 38194f83).
    const L = petMm(tJ, (tS - tW) / 2), et = aetPike(pJahr, L);
    o.tJahrC = tJ; o.tSommerC = tS; o.tWinterC = tW; o.tagAmpC = 4 + 10 * c * (1 - Math.min(1, pJahr / 1500));
    o.niederschlagMm = pJahr; o.sommerAnteil = sommerAnteil; o.kontinental = c;
    o.windOst = wl > 1e-9 ? uO / wl : 0; o.windNord = wl > 1e-9 ? vN / wl : 0;
    o.luv = (hub - 1) / 1.35; o.lee = 1 - schatten; o.stromK = dTj; o.meerWest = meerWest; o.meerLuv = meerLuv; o.feuchte = m;
    o.relief = relief; o.meerLuft = meerLuft;
    // klima-kontinent DER NEBEL aus demselben Gesetz: die Küstenluft (e^(−kont/nebelKm) an Land, über Meer 1) trägt den See-Nebel; die
    // vom kalten Auftrieb gekühlte Luft (der Rand-Strom dTj < 0 der Westküste, voll beim Taupunkt-Abstand — er klingt landein mit seinem
    // eigenen Gesetz ab, 350 km) den Advektions-Nebel; feuchte Luft (N/PET) den Strahlungs-Nebel.
    const kuesteNah = (1 - lam) + lam * kexpS(-Math.max(0, kont) / KLIMA.nebelKm), auftrieb = glatt(0, KLIMA.nebelTaupunktK, -dTj);
    o.nebel = KLIMA.nebelKueste * kuesteNah + KLIMA.nebelAuftrieb * auftrieb + KLIMA.nebelFeucht * glatt(0.2, 1.5, pJahr / L);
    o.schneeKm = hPos + tS / KLIMA.lapse;
    o.abflussMm = lam * Math.max(0, pJahr - et);                        // B2 mit dem Land-Gewicht (offenes Meer: 0; das Wasser liest ihn nur an Land)
    o.hoeheKm = hKm;
    if (saison >= 0) {
      const lag = 0.04 + 0.04 * (1 - c), d = ksin(TAU * saison);
      o.tJetztC = 0.5 * (tS + tW) + 0.5 * (tS - tW) * sg * ksin(TAU * (saison - lag));
      o.pJetztMm = guertelP(phiG - beta * d * schub, w, G.zellen) * fT * fak;
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
      // Meereis, wo der WINTER das Meer gefrieren lässt (Gegner 3: das Jahresmittel machte die Eiskante zur reinen Breitenfunktion)
      o.koeppen = -1; o.hauptklasse = -1; o.eis = tW < MEEREIS_WINTER_C ? 2 : 0; o.biom = WHITTAKER.meer; return o;
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
  // DIE PFLANZEN-DECKUNG (Reise, Welle 3) — EINE Rechnung für die Farbe des Atlas (`biomFarbe`) und den Wuchs des Orts
  // (`planetOrt().wuchs`): was der Niederschlag gegen die Verdunstung trägt (veg aus N / PET), daraus der Anteil der Krautschicht
  // (`decke`: kahl → Gras) und der des Walds (`wald`: Gras → Wald). Dieselben Zahlen wie in der Farbe davor, Bit für Bit.
  // DER LEBENSRAUM DES ORTS (Karte 2 leben.pflanzen.biome#4) — dieselbe Rechnung, ihre Zeilen aus Temperatur × Niederschlag × Küste ×
  // Staunässe des Orts (planetKlimaR und planetPunktR, die Größen, die der Ort ohnehin trägt); je Quelle EINE Zeile:
  //   baumC         die Baumgrenze am 10-°C-Sommer (Köppen 1936, die Grenze der E-Klimate; Körner & Paulsen 2004: 6,4 °C Wachstumszeit)
  //                 im Rahmen, in dem der Ort reist: dem Sommer auf MEERESHÖHE (tSommer + Lapse · Höhe, wie `delta.klima`) — die Höhe des
  //                 Orts trägt das Spiel an SEINEM Gelände (phyto-core `forestWaldgrenze`). Am Gipfel des Planeten zählte sie die Höhe
  //                 doppelt (Station 93,7 → 85,5 % gemessen); ohne sie trug die Tundra der Pol-Küste Wald 1 (23 kalte Fehl-Orte).
  //   waldAbflussMm der Wald am Wasser-Überschuss des Orts (`abflussMm`, P − AET derselben PET): Biome folgen der Wasser-Bilanz aus AET
  //                 und Defizit (Stephenson 1990, Am. Nat. 135: 649) — Wald, wo der Überschuss 50 mm/a trägt (halb bei 50). Vorher las
  //                 der Wald ein zweites Feuchte-Maß (N/PET, glatt 0,45…1 über veg) neben dem Abfluss: Station 76,9 %.
  //   mangrove     der Gezeiten-Wald der warmen Küste: das kälteste Monatsmittel der Luft über 20 °C (Walsh 1974; die Pol-Grenzen
  //                 folgen dem 20-°C-Winter-Isotherm des Meers, Duke 1998) auf dem Küsten-Saum — 137 760 km² auf ~150 000 km tropischer
  //                 Küste (Giri et al. 2011), in den Deltas bis 80 km landein (Sundarbans); voll am Ufer, fort bei `mangroveKm` von der
  //                 Küste (je Seite: auch die Insel jenseits des Schelfs, kont < 0) und über der Gezeiten-Zone (zwischen Mittelwasser und
  //                 Springflut, Alongi 2002): das 16-km-Relief trägt die Küsten-Ebene auf 25 m (152 warme Küsten-Proben, q10…q90 = 25 m),
  //                 die Gezeiten-Zone liegt in ihr — voll bis 30 m, fort bei 80 m (`mangroveM`). Vorher stand er auf 468–984 m.
  //   moor          Wasser-Überschuss × Kühle × Wuchs-Wärme × Staunässe: Moore wachsen, wo P/PET über 1 liegt (die Klima-Hülle der
  //                 Deckenmoore, Gallego-Sala & Prentice 2013, Nature Clim. Change 3: 152), ~80 % ihres Torfs in den kühlen Breiten (Yu et
  //                 al. 2010), nur wo die Wachstumszeit Torf bildet (Charman et al. 2013, Biogeosciences 10: 929 — die Biotemperatur
  //                 `moorBioC`, PET / 58,93), auf dem flachen Grund, der das Wasser staut (`orogenStaerke`). Die Kanten geeicht an
  //                 PEATMAP (Xu et al. 2018: 4,23 Mio km², 2,84 % des Landes): ≥ 0,5 auf 1,66 % des Landes (4 164 Land-Orte, anazh-realm-seed;
  //                 P/PET ab 1 ohne Wuchs-Wärme 14,1 %: die Tundra). Wärme und Verdunstung des Moors im Rahmen der Reise (Meereshöhe,
  //                 `petS`): am Ort der Höhe las es die Heimat (816 m, −1,5 °C, PET 166 mm) als Moor, Wald 0,3 am Anker. Das Hochmoor
  //                 ist baumarm (Succow & Joosten 2001): `moorWald`.
  //   kuestenwueste der Nebel-Wüsten-Saum am kalten Rand-Strom: arid (UNEP 1992: Ariditäts-Index P/PET < 0,2) über kaltem Auftrieb (der
  //                 Rand-Strom `stromK` < 0, voll beim Taupunkt-Abstand `KLIMA.nebelTaupunktK`, derselbe wie der Nebel) und landein mit
  //                 seiner Luft abklingend (Namib, Atacama: der Nebel reicht ~100 km, Seely & Henschel 1998 — `KLIMA.nebelKm`); er trägt
  //                 keine Krautschicht außer der Flechte des Nebels: die Decke fällt mit ihm.
  const LEBENSRAUM = Object.freeze({
    baumC: Object.freeze([8, 12]), waldAbflussMm: Object.freeze([25, 75]),
    mangroveWinterC: Object.freeze([18, 22]), mangroveKm: Object.freeze([30, 0]), mangroveM: Object.freeze([80, 30]),
    moorFeucht: Object.freeze([1.5, 2.5]), moorJahrC: Object.freeze([12, 4]), moorBioC: Object.freeze([1, 3]), moorFlach: Object.freeze([0.3, 0.05]), moorWald: 0.7,
    wuesteFeucht: Object.freeze([0.2, 0.05]),
  });
  // `K` das Klima des Orts (planetKlimaR), `p` sein Punkt (planetPunktR: kont, orogenStaerke); o = { veg, decke, wald, mangrove, moor, kuestenwueste }
  const _pd = { veg: 0, decke: 0, wald: 0, mangrove: 0, moor: 0, kuestenwueste: 0 };
  function pflanzenDeckung(K, p, o) {
    const tJ = K.tJahrC, P = K.niederschlagMm, L = LEBENSRAUM;
    if (!(Number.isFinite(tJ) && Number.isFinite(P) && Number.isFinite(K.tSommerC) && Number.isFinite(K.tWinterC) && Number.isFinite(K.stromK)))
      throw new Error('pflanzenDeckung: das Klima des Orts fehlt (K10)');
    if (!(Number.isFinite(p.kont) && Number.isFinite(p.orogenStaerke) && Number.isFinite(p.hoeheKm))) throw new Error('pflanzenDeckung: Küste, Gebirge oder Höhe des Orts fehlt (K10)');
    const amp = (K.tSommerC - K.tWinterC) / 2, dT = KLIMA.lapse * (p.hoeheKm > 0 ? p.hoeheKm : 0), tSee = K.tSommerC + dT, tJs = tJ + dT;
    // ohne warmen Monat (PET 0, Holdridge: Biotemperatur 0) wächst nichts: P/PET ist dort 0, nie 0/0
    const pet = petMm(tJ, amp), mi = pet > 0 ? P / pet : 0, veg = glatt(0.1, 0.85, mi), kont = p.kont > 0 ? p.kont : 0;
    o.veg = veg;
    o.mangrove = glatt(L.mangroveWinterC[0], L.mangroveWinterC[1], K.tWinterC) * glatt(L.mangroveKm[0], L.mangroveKm[1], p.kont < 0 ? -p.kont : p.kont)
      * glatt(L.mangroveM[0], L.mangroveM[1], p.hoeheKm * 1000);
    const petS = petMm(tJs, amp);   // der Verdunstungs-Anspruch im Rahmen der Reise (Meereshöhe): der Lebensraum des Orts, den das Spiel trägt
    o.moor = glatt(L.moorFeucht[0], L.moorFeucht[1], petS > 0 ? P / petS : 0) * glatt(L.moorJahrC[0], L.moorJahrC[1], tJs) * glatt(L.moorBioC[0], L.moorBioC[1], petS / PET_HOLDRIDGE) * glatt(L.moorFlach[0], L.moorFlach[1], p.orogenStaerke);
    o.kuestenwueste = glatt(L.wuesteFeucht[0], L.wuesteFeucht[1], mi) * glatt(0, KLIMA.nebelTaupunktK, -K.stromK) * kexpS(-kont / KLIMA.nebelKm);
    o.decke = glatt(0, 0.55, veg) * (1 - o.kuestenwueste);
    o.wald = glatt(L.waldAbflussMm[0], L.waldAbflussMm[1], K.abflussMm) * glatt(L.baumC[0], L.baumC[1], tSee) * (1 - L.moorWald * o.moor);
    return o;
  }
  const F_MANGROVE = [22, 64, 40], F_MOOR = [96, 88, 58], F_NEBELWUESTE = [184, 178, 164];
  // die Farbe aus der Deckung `D` des Orts (pflanzenDeckung — die Karte rechnet sie je Punkt in `kartePunkte`)
  function biomFarbe(tJ, tS, D, out) {
    const warm = glatt(0, 24, tJ);
    mischF(F_WUESTE_K, F_WUESTE_H, warm, _fa);                          // kahl
    mischF(F_GRAS_K, F_GRAS_W, warm, _fb);                              // Gras
    if (tJ < 12) mischF(F_WALD_B, F_WALD_G, glatt(-6, 12, tJ), _fc); else mischF(F_WALD_G, F_WALD_T, glatt(12, 26, tJ), _fc);   // Wald
    const g1 = D.decke, g2 = D.wald;
    mischF(_fa, _fb, g1, out); const t0 = out[0], t1 = out[1], t2 = out[2];
    out[0] = t0 + (_fc[0] - t0) * g2; out[1] = t1 + (_fc[1] - t1) * g2; out[2] = t2 + (_fc[2] - t2) * g2;
    // die Zeilen des Lebensraums: der Nebel-Saum fahl, das Moor torfbraun, der Gezeiten-Wald dunkel am Ufer
    mischF(out, F_NEBELWUESTE, D.kuestenwueste, out); mischF(out, F_MOOR, D.moor, out); mischF(out, F_MANGROVE, D.mangrove, out);
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

  // ── S5 Wasser: Einzugsgebiet, Senke und Überlauf (B3; der Prototyp stand im Spike, vision/planet/spike/lib.cjs) ────────────────
  // Das Nicht-Lokale wird auf EINEM festen Gitter je Scheibe gelöst — WASSER_N Fibonacci-Zellen, unabhängig vom Radius (die Kosten
  // stehen fest, nie mit der Weltgröße); an der Adresse wird nur gelesen (Wendland-Gewichte über die Zellen im Umkreis 2·d, stetig).
  // Höhe der Zelle: planetPunktR mit fussKm = d·R/2 (Oktaven unter d fallen weich ab); Abfluss: planetKlimaR.abflussMm (Turc-Pike).
  // Lauf: Priority-Flood (Barnes et al. 2014) vom Meer aus → Empfänger je Zelle, Senken gefüllt. See: Zelle mit gefüllter Höhe über
  // ihrer Höhe. Überlauf: ein See läuft über, wenn sein Zufluss Q_in ≥ (PET − P)·A_See (DIE PET, petMm); sonst ist er ein Endsee und
  // sein Zufluss erreicht das Meer nie.
  const WASSER_N = 40000, JAHR_S = 31557600, WASSER_NACHBAR = 1.45;   // Zellen (gesetzt) · s je Jahr · Nachbar-Umkreis in d
  // Raum-Index über Einheitsvektoren: Würfel der Kante ze, CSR (kopf je Würfel, die Zellen aufsteigend) — ein Umkreis bis ze liegt in
  // den 3 × 3 × 3 Würfeln um den Punkt, je Zeile (dy, dz) EIN zusammenhängender Abschnitt der Liste
  function wasserIndex(F, N, ze) {
    const K = Math.ceil(2 / ze) + 3, KKK = K * K * K, kopf = new Int32Array(KKK + 1), liste = new Int32Array(N), schl = new Int32Array(N);
    for (let i = 0; i < N; i++) {
      const k = (Math.floor((F[3 * i] + 1) / ze) + 1) + K * ((Math.floor((F[3 * i + 1] + 1) / ze) + 1) + K * (Math.floor((F[3 * i + 2] + 1) / ze) + 1));
      schl[i] = k; kopf[k + 1]++;
    }
    for (let k = 0; k < KKK; k++) kopf[k + 1] += kopf[k];
    for (let i = 0; i < N; i++) liste[kopf[schl[i]]++] = i;
    for (let k = KKK; k > 0; k--) kopf[k] = kopf[k - 1];
    kopf[0] = 0;
    return { K, ze, kopf, liste };
  }
  const W_P = {}, W_K = {};
  function wasserZellen(S) {
    pruefScheibe(S);
    const N = WASSER_N, R = S.R, F = fib(N), d = Math.sqrt(8 * PI / (Math.sqrt(3) * N)), fuss = 0.5 * d * R;   // Gitterweite (rad), hexagonal
    const h = new Float64Array(N), q = new Float64Array(N), pM = new Float64Array(N), tJ = new Float64Array(N), tA = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      const x = F[3 * i], y = F[3 * i + 1], z = F[3 * i + 2];
      h[i] = planetPunktR(S, x, y, z, fuss, W_P);
      planetKlimaR(S, x, y, z, -1, W_K, W_P);
      q[i] = h[i] > 0 ? W_K.abflussMm : 0; pM[i] = W_K.niederschlagMm; tJ[i] = W_K.tJahrC; tA[i] = (W_K.tSommerC - W_K.tWinterC) / 2;
    }
    return { S, N, R, F, d, A: 4 * PI * R * R / N, h, q, pM, tJ, tA };
  }
  function wasserLauf(Z) {
    const { N, F, d, A, h, q, pM, tJ, tA } = Z, I = wasserIndex(F, N, 2 * d), K = I.K, ze = I.ze, kopf = I.kopf, li = I.liste;
    // Nachbarn im Umkreis WASSER_NACHBAR·d (CSR, zwei Gänge: zählen, füllen)
    const cN = kcos(WASSER_NACHBAR * d), nbKopf = new Int32Array(N + 1);
    let nbListe = null;
    for (let gang = 0; gang < 2; gang++) {
      if (gang === 1) { for (let i = 0; i < N; i++) nbKopf[i + 1] += nbKopf[i]; nbListe = new Int32Array(nbKopf[N]); }
      for (let i = 0; i < N; i++) {
        const x = F[3 * i], y = F[3 * i + 1], z = F[3 * i + 2];
        const a = Math.floor((x + 1) / ze) + 1, b = Math.floor((y + 1) / ze) + 1, c = Math.floor((z + 1) / ze) + 1;
        let m = gang === 1 ? nbKopf[i] : 0;
        for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) {
          const k0 = a + K * ((b + dy) + K * (c + dz));
          for (let e = kopf[k0 - 1], e1 = kopf[k0 + 2]; e < e1; e++) {
            const j = li[e];
            if (j !== i && x * F[3 * j] + y * F[3 * j + 1] + z * F[3 * j + 2] >= cN) { if (gang === 1) nbListe[m] = j; m++; }
          }
        }
        if (gang === 0) nbKopf[i + 1] = m;
      }
    }
    // Priority-Flood vom Meer aus (binäre Halde über Schlüssel und Index: dieselbe Folge bei gleicher Höhe)
    const voll = new Float64Array(N), emp = new Int32Array(N).fill(-1), ord = new Int32Array(N), gesehen = new Uint8Array(N);
    const hk = new Float64Array(N), hi = new Int32Array(N); let hn = 0, n = 0;
    const push = (k, i) => {
      let j = hn++;
      while (j > 0) { const p = (j - 1) >> 1; if (hk[p] < k || (hk[p] === k && hi[p] < i)) break; hk[j] = hk[p]; hi[j] = hi[p]; j = p; }
      hk[j] = k; hi[j] = i;
    };
    const pop = () => {
      const r = hi[0], k = hk[--hn], i = hi[hn]; let j = 0;
      for (;;) {
        let c = 2 * j + 1; if (c >= hn) break;
        if (c + 1 < hn && (hk[c + 1] < hk[c] || (hk[c + 1] === hk[c] && hi[c + 1] < hi[c]))) c++;
        if (hk[c] > k || (hk[c] === k && hi[c] > i)) break;
        hk[j] = hk[c]; hi[j] = hi[c]; j = c;
      }
      hk[j] = k; hi[j] = i; return r;
    };
    for (let i = 0; i < N; i++) if (h[i] <= 0) { voll[i] = h[i]; emp[i] = i; gesehen[i] = 1; push(h[i], i); }
    while (hn) {
      const c = pop(); ord[n++] = c;
      for (let e = nbKopf[c], e1 = nbKopf[c + 1]; e < e1; e++) {
        const j = nbListe[e]; if (gesehen[j]) continue;
        gesehen[j] = 1; voll[j] = h[j] > voll[c] ? h[j] : voll[c]; emp[j] = c; push(voll[j], j);
      }
    }
    // Abfluss-Summe (m³/a) in umgekehrter Flut-Folge
    const acc = new Float64Array(N), rang = new Int32Array(N);
    for (let k = 0; k < n; k++) rang[ord[k]] = k;
    for (let k = n - 1; k >= 0; k--) { const i = ord[k]; if (h[i] > 0) acc[i] += q[i] / 1000 * A * 1e6; const e = emp[i]; if (e !== i && e >= 0) acc[e] += acc[i]; }
    // Seen: Zusammenhangs-Komponenten der Zellen mit voll > h über dem Meer; je See sein Abfluss-Ort (der früheste Rang, dessen
    // Empfänger außerhalb liegt), seine Fläche, sein mittlerer Niederschlag und DIE PET
    const see = new Int32Array(N).fill(-1), stapel = new Int32Array(N), seeAus = [], seeFl = [], seeP = [], seePet = [];
    for (let i = 0; i < N; i++) {
      if (see[i] >= 0 || !(voll[i] > h[i] + 1e-6) || voll[i] <= 0) continue;
      const id = seeAus.length; let sp = 0, pSum = 0, eSum = 0, nz = 0;
      stapel[sp++] = i; see[i] = id;
      while (sp) {
        const c = stapel[--sp]; nz++; pSum += pM[c]; eSum += petMm(tJ[c], tA[c]);
        for (let e = nbKopf[c], e1 = nbKopf[c + 1]; e < e1; e++) { const j = nbListe[e]; if (see[j] < 0 && voll[j] > h[j] + 1e-6 && voll[j] > 0) { see[j] = id; stapel[sp++] = j; } }
      }
      seeAus.push(-1); seeFl.push(nz * A); seeP.push(pSum / nz); seePet.push(eSum / nz);
    }
    const seeN = seeAus.length, ausRang = new Float64Array(seeN).fill(1e9);
    for (let c = 0; c < N; c++) {
      const id = see[c]; if (id < 0) continue;
      if (!(emp[c] >= 0 && see[emp[c]] === id) && rang[c] < ausRang[id]) { ausRang[id] = rang[c]; seeAus[id] = c; }
    }
    const folge = Array.from({ length: seeN }, (_, s) => s).sort((a, b) => rang[seeAus[b]] - rang[seeAus[a]]);   // stromauf zuerst
    const seeEnd = new Uint8Array(seeN); let endN = 0;
    for (const s of folge) {
      const au = seeAus[s], verlust = Math.max(0, seePet[s] - seeP[s]) / 1000 * seeFl[s] * 1e6;
      if (acc[au] < verlust) {   // Endsee: sein Zufluss erreicht das Meer nicht
        seeEnd[s] = 1; endN++;
        const a0 = acc[au]; let c = emp[au];
        while (c >= 0 && h[c] > 0) { acc[c] -= a0; if (emp[c] === c) break; c = emp[c]; }
      }
    }
    // Ziel jeder Zelle: die Meeres-Zelle, in die ihr Lauf mündet (zielMeer, −1: er endet im Endsee zielSee)
    const zielMeer = new Int32Array(N).fill(-1), zielSee = new Int32Array(N).fill(-1), endseeVon = new Int32Array(N).fill(-1);
    for (let c = 0; c < N; c++) if (see[c] >= 0 && seeEnd[see[c]]) endseeVon[c] = see[c];
    for (let k = 0; k < n; k++) {
      const i = ord[k];
      if (h[i] <= 0) { zielMeer[i] = i; continue; }
      if (endseeVon[i] >= 0) { zielSee[i] = endseeVon[i]; continue; }
      zielMeer[i] = zielMeer[emp[i]]; zielSee[i] = zielSee[emp[i]];
    }
    return Object.freeze({ S: Z.S, N, R: Z.R, F, d, A, cR: kcos(2 * d), idx: I, h, q, pM, tJ, tA, voll, emp, acc, seeN, endN, zielMeer, zielSee, endseeVon });
  }
  // DAS Wasser-Gitter der Scheibe (je Aufruf neu gerechnet, ~0,8 s; der Leser hält es)
  function planetWasserGitter(S) { return wasserLauf(wasserZellen(S)); }
  // Adresse → Wasser: Wendland-gewichtete Abfluss-Menge (m³/s) und See-Tiefe (m) über die Zellen im Umkreis 2·d (stetig in der Adresse)
  function planetWasserR(W, x, y, z, aus) {
    const I = W.idx, K = I.K, ze = I.ze, kopf = I.kopf, li = I.liste, F = W.F, acc = W.acc, voll = W.voll, h = W.h, cR = W.cR, ir = 0.5 / W.d;
    const a = Math.floor((x + 1) / ze) + 1, b = Math.floor((y + 1) / ze) + 1, c = Math.floor((z + 1) / ze) + 1;
    let sw = 0, sq = 0, ss = 0;
    for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) {
      const k0 = a + K * ((b + dy) + K * (c + dz));
      for (let e = kopf[k0 - 1], e1 = kopf[k0 + 2]; e < e1; e++) {
        const i = li[e], cc = x * F[3 * i] + y * F[3 * i + 1] + z * F[3 * i + 2]; if (cc < cR) continue;
        const t = acosF(cc) * ir; if (t >= 1) continue;
        const u = 1 - t, u2 = u * u, w = u2 * u2 * (4 * t + 1);
        sw += w; sq += w * acc[i]; ss += w * (voll[i] - h[i]);
      }
    }
    const o = aus || {}; o.qM3s = sw > 0 ? sq / sw / JAHR_S : 0; o.seeTiefeM = sw > 0 ? ss / sw : 0; o.gewicht = sw; return o;
  }

  // ── bau3: die Brücke (Kopf §6 oben) ──────────────────────────────────────────────────────────────────────
  const ORT_KLIMA = ['sommer', 'winter', 'sommerPhase', 'tagAmp', 'tagGipfel', 'jahrTage', 'spendeMm'];
  function pruefOrtGesetz(og) {
    if (!og || typeof og !== 'object') throw new Error('planetOrt: ortGesetz fehlt (K10)');
    if (!(og.kuehlungKJeM > 0)) throw new Error('planetOrt: ortGesetz.kuehlungKJeM fehlt (K10)');
    if (!Number.isFinite(og.meerUnterBasisM)) throw new Error('planetOrt: ortGesetz.meerUnterBasisM fehlt (K10)');
    if (!Array.isArray(og.regler) || !og.regler.length) throw new Error('planetOrt: ortGesetz.regler (LANDFORM_REGLER) fehlt (K10)');
    const kh = og.klimaHeute; if (!kh) throw new Error('planetOrt: ortGesetz.klimaHeute fehlt (K10)');
    for (const f of ORT_KLIMA) if (!Number.isFinite(kh[f])) throw new Error('planetOrt: ortGesetz.klimaHeute.' + f + ' fehlt (K10)');
  }
  // R5 EIN Jahr: das Jahr des Körpers ist das Jahr des Ort-Gesetzes (TEMPERATUR.jahrTage), sonst bricht der Ort beim Namen
  function pruefJahr(kp, og) {
    if (kp.jahrTage !== og.klimaHeute.jahrTage) throw new Error('planetOrt: koerper.jahrTage ' + kp.jahrTage + ' ist nicht das Jahr des Ort-Gesetzes ' + og.klimaHeute.jahrTage + ' (R5, K10)');
  }
  function reglerZeile(og, id) {
    for (let i = 0; i < og.regler.length; i++) if (og.regler[i].id === id) return og.regler[i];
    throw new Error('planetOrt: Regler "' + id + '" fehlt in ortGesetz.regler (K10)');
  }
  // Gegner 2 (Zahl §6): der Schlüssel eines Memos über das Ort-Gesetz trägt JEDES Feld, das ortRoh und planetAnker lesen — alle
  // Klima-Konstanten, Kühlung, Meer-Basis und die ganze Regler-Tafel (vorher fehlten die Regler: ein getauschtes Gesetz lieferte still
  // den Anker des alten). EINE Funktion für beide Memos.
  function ortGesetzSchluessel(og) {
    const kh = og.klimaHeute; let s = og.kuehlungKJeM + '|' + og.meerUnterBasisM;
    for (const f of ORT_KLIMA) s += '|' + kh[f];
    for (const r of og.regler) s += '|' + JSON.stringify(r);
    return s;
  }
  function klemm(r, v) { return v < r.min ? r.min : (v > r.max ? r.max : v); }
  // Lesart von Kontinentalität (km zur Küste, + landein) als Regler „land" (Entscheid §6: Küste um −0,2, Inneres 0,35–0,9, Meer bis −0,6)
  function landAus(kont) { return kont < 0 ? -0.2 + 0.4 * Math.max(-1, kont / 300) : -0.2 + 0.55 * glatt(0, 300, kont) + 0.55 * glatt(300, 2000, kont); }
  const _ankP = {}, _ankK = {}, _ankB = {}, _ankD = {};
  // B5 der Anker wird dort gesucht, wo er gelesen wird: im Band des Orts (ortRoh und der Faden lesen fuss 16), vorher fuss 40 — 1 von 30
  // Ankern lag bei fuss 16 im Meer. Und er trägt jede Größe, die als Verhältnis zu ihm reist (Spende, Krautschicht, Wald; ein Verhältnis
  // zu 0 ist tot: 5 von 30 Ankern ohne Wald, 2 ohne Spende) und das Klima der Heimat auf seiner wahren Höhe, wo sein Biom gelesen wird
  // (kein E: 4 von 30 Ankern lagen als Tundra auf Hochflächen, gesucht auf Meeres-Niveau) — und die Eis-Zeit der Heimat, 0: seit die
  // Bahn das Hochglazial trägt (Milanković, −6,1 K), lagen 9 von 100 Ankern unter dem Eis des Quartärs, und ihr Δ löschte jeden Findling
  const ANKER_FUSS_KM = 16;
  // Der Anker: der Ort, an dem die Konstanten des heutigen Ort-Gesetzes (Sommer/Winter am Meer) wahr sind — auf Land, Küste ≤ 300 km,
  // kein aktiver Rand näher als 500 km. Suche über 512 Fibonacci-Proben (~1 000 km Abstand), Wertung ((ΔS/4)² + (ΔW/6)²), dann drei
  // Runden 3×3-Verfeinerung zu 240 · 120 · 60 km. Bricht beim Namen, wenn kein Ort trägt (K10). Memo je (Plan, Zeit, Konstanten).
  // DIE TREPPE DER SUCHE (h2-12): 512 Proben trugen 2 986 von 3 000 Saaten des Spiels (Form `w-<12 hex>-<6 base36>`); die 14 ohne Ort
  // (0,47 %) verloren die ganze Reise — `reise` brach an ihrer Welt mit K10. Dieselbe Wertung sucht dichter (2 048 · 8 192 · 32 768
  // Proben), je NUR wenn die Stufe davor keinen Ort fand: eine Saat mit Ort bei 512 geht denselben Weg wie zuvor (bitgleich, ihre
  // Heimat liegt, wo sie lag), gemessen trug Stufe 2 alle 14 in je ≤ 427 ms. Trägt auch die dichteste keinen, bricht der Anker weiter.
  const ANKER_PROBEN = [512, 2048, 8192, 32768];
  function planetAnker(plan, zeitMa, og) {
    pruefOrtGesetz(og); pruefJahr(plan.koerper, og);
    return ankerAmSchluessel(plan, zeitMa, og, ortGesetzSchluessel(og));
  }
  // der Anker zum Schlüssel des Ort-Gesetzes, den der Aufrufer EINMAL baute (planetOrt: ein Schlüssel je Ort, nicht zwei — 2 378 Zeichen,
  // 14 µs je Bau; gemessen 29 von 76 µs je Ort der Gipfel-Suche, Karte 2 planet.kopplung.gegenwart#2)
  function ankerAmSchluessel(plan, zeitMa, og, schluessel) {
    const M = memoVon(plan); if (!M.anker) M.anker = new Map();
    const kh = og.klimaHeute, key = zeitMa + '|' + schluessel;
    if (M.anker.has(key)) return M.anker.get(key);
    const S = planetScheibe(plan, zeitMa), R = S.R, G = planetKlimaGlobal(plan, zeitMa);
    const tMitte = 0.5 * (kh.sommer + kh.winter);
    let mitEis = false;   // die Stufe der Eis-Zeit (unten): erst der Weg wie zuvor, nur ein Anker unter dem Eis sucht neu
    const wert = (x, y, z) => {
      const tZ = G.T0 + G.T2 * (1.5 * y * y - 0.5); if (tZ - tMitte > 14 || tMitte - tZ > 14) return Infinity;   // Zone zuerst (ohne Punkt)
      const h = planetPunktR(S, x, y, z, ANKER_FUSS_KM, _ankP);
      if (!(h > 0) || _ankP.kont < 0 || _ankP.kont > 300 || (_ankP.randArt === RAND_ART.konvergent && _ankP.randAbstandKm < 500) || _ankP.orogenAktiv) return Infinity;
      planetKlimaR(S, x, y, z, -1, _ankK, _ankP);
      if (!(_ankK.abflussMm > 0)) return Infinity;
      pflanzenDeckung(_ankK, _ankP, _ankD); if (!(_ankD.decke > 0) || !(_ankD.wald > 0)) return Infinity;
      planetBiom(_ankK, h, _ankB); if (_ankB.hauptklasse === 4) return Infinity;
      if (mitEis && eisZeitY(plan, y, _ankK.tJahrC, G) === 1) return Infinity;   // die Heimat trägt kein Eis des Quartärs (ORT_HEIMAT eis 0)
      const hk = _ankP.hoeheKm > 0 ? _ankP.hoeheKm : 0, dS = (_ankK.tSommerC + KLIMA.lapse * hk - kh.sommer) / 4, dW = (_ankK.tWinterC + KLIMA.lapse * hk - kh.winter) / 6;
      return dS * dS + dW * dW;
    };
    let best = Infinity, bx = 0, by = 0, bz = 0;
    const tb = new Float64Array(6);
    const suche = () => {
      best = Infinity; bx = 0; by = 0; bz = 0;
      for (let s = 0; s < ANKER_PROBEN.length && best === Infinity; s++) { const N = ANKER_PROBEN[s], F = fib(N);
        for (let i = 0; i < N; i++) { const v = wert(F[3 * i], F[3 * i + 1], F[3 * i + 2]); if (v < best) { best = v; bx = F[3 * i]; by = F[3 * i + 1]; bz = F[3 * i + 2]; } } }
      if (best === Infinity) throw new Error('planetAnker: kein Ort trägt die heutigen Konstanten (Land, Küste ≤ 300 km, kein aktiver Rand < 500 km, Spende, Wuchs, kein E' + (mitEis ? ', kein Eis des Quartärs' : '') + ') (K10)');
      for (let runde = 0; runde < 3; runde++) {
        tangente(bx, by, bz, tb); const sch = (240 >> runde) / R; let nx = bx, ny = by, nz = bz;
        for (let a = -1; a <= 1; a++) for (let c = -1; c <= 1; c++) {
          if (!a && !c) continue;
          let x = bx + sch * (a * tb[0] + c * tb[3]), y = by + sch * (a * tb[1] + c * tb[4]), z = bz + sch * (a * tb[2] + c * tb[5]); const l = Math.sqrt(x * x + y * y + z * z); x /= l; y /= l; z /= l;
          const v = wert(x, y, z); if (v < best) { best = v; nx = x; ny = y; nz = z; }
        }
        bx = nx; by = ny; bz = nz;
      }
    };
    // DIE STUFE DER EIS-ZEIT (wie die Treppe der Proben): der Anker geht den Weg wie zuvor — eine Heimat ohne Eis liegt Bit für Bit,
    // wo sie lag (das Wahl-Kriterium in jeder Probe verlegte den Anker des Spiels, −50,51° → −43,38°: seine grobe Probe lag unter dem
    // Eis, nicht er). Trägt der gefundene Anker die Eis-Zeit, sucht dieselbe Wertung neu, jede Probe unter dem Eis fällt.
    suche();
    planetPunktR(S, bx, by, bz, ANKER_FUSS_KM, _ankP); planetKlimaR(S, bx, by, bz, -1, _ankK, _ankP);
    if (eisZeitY(plan, by, _ankK.tJahrC, G) === 1) { mitEis = true; suche(); }
    const bl = planetBreiteLaenge(bx, by, bz, new Float64Array(2)), breite = bl[0], laenge = bl[1];
    const sb = ksin(breite), cb = kcos(breite), sl = ksin(laenge), cl = kcos(laenge);
    planetPunktR(S, bx, by, bz, ANKER_FUSS_KM, _ankP); planetKlimaR(S, bx, by, bz, -1, _ankK, _ankP);
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
  const _orP = {}, _orK = {}, _orB = {};
  // R2 der Ort als Differenz zur Heimat: delta = Ort − Anker (t = 0, dieselbe Funktion am Anker gerechnet), die Spende als Verhältnis;
  // am Anker ist jedes Feld +0 (x − x) und das Verhältnis 1 — die Heimat bleibt byte-gleich ohne Bedingung. Kein Aufrufer rechnet Δ nach.
  // Die Jahres-Phase reist als Δ wie jede Größe (Reise K): 0, wo der Sommer des Orts in der Phase der Heimat liegt, sonst 0,5 — ein
  // Leser, der die absolute Phase läse, gäbe einer Heimat mit Süd-Anker den Sommer im Winter.
  const ORT_DELTA_WETTER = ['windX', 'windZ', 'regenQuote', 'sturmQuote', 'nebelQuote'];
  // Reise, Welle 3: der Wuchs des Orts reist als Verhältnis zum Anker wie die Spende — am Anker genau 1 (x / x). Trägt der Anker
  // selbst nichts (0), fehlt das Maß: das Verhältnis ist 1, der Wuchs der Heimat gilt (immer endlich — der Ort reist als JSON).
  const ORT_WUCHS = ['decke', 'wald'];
  // DIE EIS-ZEIT DES ORTS (Karte 2 planet.kopplung.gegenwart): fiel das Jahresmittel des Orts in einer Zeit des Quartärs (`EIS_ZEITEN`,
  // Ma: heute, das letzte Hochglazial, 0,1 … 2,6 Ma) unter die Eis-Linie (KLIMA.tEisC −10 °C, North 1975), trug ihn das Eis — 1, sonst 0.
  // Das Jahresmittel ist das des Orts (planetKlimaR tJahrC: Land, Meer, Luft und Höhe), je Zeit um den Gang der Zone verschoben
  // (T0 + T2·P2 der Energie-Bilanz zur Zeit t gegen die Zeit des Orts). Vorher las sie nur die Breite gegen die Eisgrenze der Zone (74,4°):
  // Hochland und Kontinent-Inneres unter −10 °C trugen kein Eis, 377 von 2 000 Land-Orten. Fehlt das Jahresmittel, wirft sie beim Namen.
  // Sie reist als Δ zum Anker wie jede Größe (am Anker +0); der Leser ist der Findling (Stamm `_rockGeologyClass`: der Erratiker liegt,
  // wo das Eis ihn ablud). Die Heimat trägt kein Eis (gelaende-core ORT_HEIMAT eis 0): der Anker wird nur dort gesucht, wo die Zeiten
  // ihn nie unter die Eis-Linie trugen (`eisZeitY` in `ankerAmSchluessel`, dasselbe Gesetz) — sonst stünde Δ ≤ 0 an jedem Ort der Welt.
  const EIS_ZEITEN = Object.freeze([0, -0.02, -0.1, -0.5, -1, -2, -2.6]);
  function eisZeitY(plan, y, tJahrC, G0) {   // y = sin Breite, G0 = die Energie-Bilanz zur Zeit des Orts
    const p2 = 1.5 * y * y - 0.5, ab = tJahrC - (G0.T0 + G0.T2 * p2);
    for (const t of EIS_ZEITEN) { const G = planetKlimaGlobal(plan, t); if (G.T0 + G.T2 * p2 + ab < KLIMA.tEisC) return 1; }
    return 0;
  }
  function ortEisZeit(plan, breite, tJahrC, zeitMa) {
    if (!Number.isFinite(tJahrC) || !Number.isFinite(zeitMa)) throw new Error('ortEisZeit: das Jahresmittel des Orts oder seine Zeit fehlt (K10)');
    return eisZeitY(plan, ksin(breite), tJahrC, planetKlimaGlobal(plan, zeitMa));
  }
  function ortKopie(o) { return { wildnis: Object.assign({}, o.wildnis), meer: Object.assign({}, o.meer), klima: Object.assign({}, o.klima), wetter: Object.assign({}, o.wetter),
    wuchs: Object.assign({}, o.wuchs), eis: Object.assign({}, o.eis) }; }
  // der Anker der Heimat und sein roher Ort, EIN Memo je Schlüssel: { anker, roh }
  function ortAnkerRoh(plan, og, schluessel) {
    const M = memoVon(plan); if (!M.ortAnker) M.ortAnker = new Map();
    let a = M.ortAnker.get(schluessel); if (a) return a;
    const A = ankerAmSchluessel(plan, 0, og, schluessel);
    a = { anker: A, roh: ortKopie(ortRoh(planetScheibe(plan, 0), A.breite, A.laenge, og, {}, plan, A)) }; M.ortAnker.set(schluessel, a); return a;
  }
  // DIE HEIMAT EINES ANDEREN KÖRPERS (Karte 2 planet.kopplung.bahn-klima#2): `heimat` (optional) ist der Plan, dessen Anker die Welt
  // trägt — derselbe Samen (dieselbe Geografie), ein anderer Körper (Neigung, Tag). Das Δ misst den Ort des Körpers gegen den Anker
  // der HEIMAT: vorher maß es gegen den eigenen Anker, und der lag dort, wo der fremde Körper das Klima der Heimat trägt — jede
  // Neigung antwortete an der Heimat mit der Erd-Spanne. Ohne `heimat` ist sie der eigene Plan, Bit für Bit wie zuvor.
  function heimatPlan(plan, heimat, og) {
    if (heimat === undefined || heimat === plan) return plan;
    if (!heimat || heimat.k !== plan.k) throw new Error('planetOrt: heimat ist kein Plan desselben Samens (K10)');
    pruefJahr(heimat.koerper, og); return heimat;
  }
  function planetOrt(S, breite, laenge, og, aus, heimat) {
    pruefScheibe(S); pruefOrtGesetz(og); pruefJahr(S.plan.koerper, og);
    const hp = heimatPlan(S.plan, heimat, og);
    const H = ortAnkerRoh(hp, og, ortGesetzSchluessel(og)), a = H.roh, o = ortRoh(S, breite, laenge, og, aus || {}, hp, H.anker);
    const d = (o.delta && o.delta.wildnis) ? o.delta : { wildnis: {}, meer: {}, klima: {}, wetter: {}, wuchs: {} };
    if (!d.wuchs) d.wuchs = {};
    for (const id in o.wildnis) d.wildnis[id] = o.wildnis[id] - a.wildnis[id];
    d.meer.waterLevelM = o.meer.waterLevelM - a.meer.waterLevelM;
    // DER JAHRESZEITEN-VERTRAG: das Δ des Jahres-Gangs wird zur selben ZEIT des Jahres genommen, nie am selben Namen — der Ort zur
    // warmen Zeit des Ankers gegen dessen Sommer, zur kalten gegen dessen Winter (bei Gegen-Phase ist das der Winter des Orts). Der
    // Leser bildet Heimat + Δ; „Sommer“ heißt, was daraus wärmer ist, und die Phase folgt ihm (Δ 0 oder 0,5): Spanne ≥ 0 an jedem
    // Ort. Vorher reiste Sommer − Sommer und Winter − Winter: die Rest-Spanne des Ankers (roh − Heimat, bis +1,1 K) zog in den Tropen
    // den Sommer unter den Winter (46 von 1 814 Land-Zielen, gelaende-core `schneePegel` las „friert immer“) und sprang am Äquator.
    // DIE SPANNE REIST ALS VERHÄLTNIS (Karte 2 planet.kopplung.bahn-klima#2): das Mittel des Gangs reist als Differenz, seine halbe
    // Spanne als Verhältnis zu der des Ankers (wie die Spende, `spendeVerh`) — der Ort trägt die Spanne der Heimat × r, r = Spanne
    // des Orts ÷ Spanne des Ankers. Die Einstrahlung, die den Gang treibt, trägt an jeder Breite (auch jenseits der Polarkreise)
    // S0·sin φ·sin ε (die Differenz der Tagesmittel zur Sonnwende, Berger 1978) — ohne Neigung 0, bei 45° das 1,78-Fache der Erde;
    // am Äquator (sin φ = 0) kein Gang: dort trug die Differenz den Rest des Ankers (0,27 K, Phase 0,5), das Verhältnis trägt 0.
    // Vorher reiste die Spanne als Differenz: der Rest des Ankers (Spanne der Heimat − Spanne des Ankers, an manchen Saaten 13 K)
    // blieb jedem Körper — Neigung 0 trug an den 20 Saaten der Station bis 63 % der Spanne mit dem Körper der Erde.
    const kh = og.klimaHeute, gleich = o.klima.sommerPhase === a.klima.sommerPhase;
    const oW = gleich ? o.klima.sommer : o.klima.winter, oK = gleich ? o.klima.winter : o.klima.sommer;
    // DIE HEIMAT OHNE JAHRES-GANG (kosmos-bahn-3): trägt der Anker keine Spanne (ein Körper ohne Neigung auf runder Bahn ist seine
    // eigene Heimat — eine gültige Welt), hat das Verhältnis keinen Nenner; dann reist die halbe Spanne des Orts ABSOLUT gegen die 0
    // des Ankers (Δ = halbe Spanne des Orts): die Heimat trägt die Spanne des Ort-Gesetzes, jeder Ort dazu seine eigene. Eine
    // negative halbe Spanne des Ankers widerspricht dem Vertrag (Sommer heißt der wärmere) und bleibt ein Wurf.
    const aHalb = 0.5 * (a.klima.sommer - a.klima.winter), oHalb = 0.5 * (oW - oK);
    if (!(aHalb >= 0)) throw new Error('planetOrt: der Anker der Heimat trägt eine negative halbe Spanne (' + aHalb + ' K) — Sommer heißt der wärmere');
    const dMitte = 0.5 * (oW + oK) - 0.5 * (a.klima.sommer + a.klima.winter), dSpanne = aHalb > 0 ? 0.5 * (kh.sommer - kh.winter) * (oHalb / aHalb - 1) : oHalb;
    const dWarm = dMitte + dSpanne, dKalt = dMitte - dSpanne;
    if (kh.sommer + dWarm >= kh.winter + dKalt) { d.klima.sommer = dWarm; d.klima.winter = dKalt; d.klima.sommerPhase = 0; }
    else {
      d.klima.sommer = (kh.winter + dKalt) - kh.sommer; d.klima.winter = (kh.sommer + dWarm) - kh.winter; d.klima.sommerPhase = 0.5;
      while (kh.sommer + d.klima.sommer < kh.winter + d.klima.winter) d.klima.winter -= 1e-12;   // die Rundung von Heimat + Δ trägt die Spanne nie unter 0
    }
    d.klima.tagAmp = o.klima.tagAmp - a.klima.tagAmp;
    d.klima.spendeVerh = a.klima.spendeMm !== 0 ? o.klima.spendeMm / a.klima.spendeMm : (o.klima.spendeMm === 0 ? 1 : Infinity);
    for (const f of ORT_DELTA_WETTER) d.wetter[f] = o.wetter[f] - a.wetter[f];
    for (const f of ORT_WUCHS) d.wuchs[f] = a.wuchs[f] > 0 ? o.wuchs[f] / a.wuchs[f] : 1;
    d.eis = { zeit: o.eis.zeit - a.eis.zeit };
    o.delta = d; return o;
  }
  // ortRoh liest den Anker der Heimat `hp`, den sein Aufrufer am Schlüssel des Ort-Gesetzes fand (planetOrt, ortAnkerRoh)
  function ortRoh(S, breite, laenge, og, aus, hp, anker) {
    const plan = S.plan, kp = plan.koerper, kh = og.klimaHeute, R = S.R;
    const S0 = planetScheibe(hp, 0);
    const sv = 0.0065 / og.kuehlungKJeM;                                   // Stauchung: gelesen aus dem Ort-Gesetz, nie gesetzt
    const o = aus || {};
    planetPunkt(S, breite, laenge, 16, _orP);                    // Band ≥ 32 km (K8): fuss 16 km
    const K = planetKlima(S, breite, laenge, -1, _orK, _orP), B = planetBiom(K, _orP.hoeheM, _orB);
    const hk = _orP.hoeheKm > 0 ? _orP.hoeheKm : 0, sued = breite < 0;
    o.anker = { breite: anker.breite, laenge: anker.laenge, zeitMa: 0, ost: anker.ost, nord: anker.nord };
    // Wildnis-Regler, geklemmt auf ihre Zeile in LANDFORM_REGLER (Abbildung §6). Nur was der Ort trägt, reist: kontinentLambda,
    // schichtDicke und hartAnteil standen hier als def der Heimat — Δ ≡ 0 per Bau an jedem Ort (Zensus e217, e222, e223: FÄLLT); ein
    // fehlendes Δ liest ortErbgut des Gelände-Kerns als den Wert der Heimat, dieselbe Zahl
    const rL = reglerZeile(og, 'land'), rH = reglerZeile(og, 'hoehe'), rRL = reglerZeile(og, 'rauhLambda');
    const rTr = reglerZeile(og, 'trog'), rKs = reglerZeile(og, 'ks'), rTa = reglerZeile(og, 'tafel');
    const st = _orP.orogenStaerke, tJs = K.tJahrC + KLIMA.lapse * hk;
    const lam = rRL.min + (rRL.max - rRL.min) * glatt(0, 400, _orP.orogenAlterMa);
    const schAlter = _orP.scholle >= 0 ? plan.schollen[8 * _orP.scholle + 4] : 0;
    // ks liest die Konvergenz JEMALS: die aktive Grenze (konv) oder das Gebirge, das sie hinterließ — orogenStaerke ist Orogen der
    // aktiven Grenze ODER Gedächtnis der Nähte und erloschenen aktiven Ränder (punktRoh §6); vorher las ks nur die Grenze von heute,
    // 172 von 356 Gipfeln > 2 km auf Nähten trugen ks der Ebene. Ein Gebirge ohne Konvergenz kennt das Gesetz nicht: st = 0 ⇒ ks wie vorher
    const konv = Math.max(st, _orP.randArt === RAND_ART.konvergent ? glatt(0, 8, _orP.randRateCmA) * kexpS(-_orP.randAbstandKm / 600) : 0);
    o.wildnis = {
      land: klemm(rL, landAus(_orP.kont)),
      hoehe: klemm(rH, 0.6 + 1.0 * st),
      rauhLambda: klemm(rRL, rRL.def + (lam - rRL.def) * glatt(0.05, 0.3, st)),
      trog: klemm(rTr, glatt(16, -2, tJs)),
      ks: klemm(rKs, 3 + 12 * konv),
      tafel: klemm(rTa, glatt(400, 1500, _orP.randAbstandKm) * glatt(1500, 3500, schAlter)),
    };
    // das Meer der Zeit: das Becken (meerKm, 10-Ma-Fächer) und das Eis der Bahn (planetKlimaGlobal meerGlazialM, Erd-Meter) — beide in der
    // Stauchung des Ort-Gesetzes; heute ist das Eis 0 (dieselben Bytes)
    const G = planetKlimaGlobal(plan, S.zeitMa);
    o.meer = { waterLevelM: -og.meerUnterBasisM + sv * (S.meerKm - S0.meerKm) * 1000 + sv * G.meerGlazialM };
    // der Jahres-Gang am Meer: die Luft zum Sonnen-Hoch und zum Sonnen-Tief der Halbkugel. „Sommer“ ist die WÄRMERE der beiden und
    // trägt ihre Phase — wo die Winter-Advektion die Spanne dreht (Tropen, roh bis −0,39 K), liegt der Sommer des Orts im Sonnen-Tief
    const tHoch = K.tSommerC + KLIMA.lapse * hk, tTief = K.tWinterC + KLIMA.lapse * hk, warmHoch = tHoch >= tTief;
    o.klima = { sommer: warmHoch ? tHoch : tTief, winter: warmHoch ? tTief : tHoch,
      sommerPhase: sued === warmHoch ? (kh.sommerPhase + 0.5) % 1 : kh.sommerPhase, tagAmp: 0.5 * K.tagAmpC, tagGipfel: kh.tagGipfel, jahrTage: kp.jahrTage, spendeMm: K.abflussMm };
    const aphi = breite < 0 ? -breite : breite, v = (aphi - 1.7 * G.zellBreite) / (0.4 * G.zellBreite);
    const wl = Math.sqrt(K.windOst * K.windOst + K.windNord * K.windNord);
    o.wetter = { windX: wl > 1e-9 ? -K.windOst / wl : 0, windZ: wl > 1e-9 ? K.windNord / wl : 0,   // wohin der Wind weht, Spiel-(x Ost, z Süd)
      regenQuote: K.niederschlagMm / (K.niederschlagMm + 900),   // gesetzt
      // klima-kontinent: der Sturm ist Wind UND Regen (WX_GESETZ sturm.rain 1) — sein Regen fällt nach demselben Relief wie der
      // Niederschlag (Sperre · Föhn · Hub, K.relief; ohne Anstieg luvwärts genau 1). Der Nebel ist der Anteil der regenfreien Zeit
      // (K.nebel: Küstenluft, Auftrieb, Feuchte) — wetterAt verschiebt mit seinem Δ die Stufe des Nebels.
      sturmQuote: (0.03 + 0.25 * (v * v < 40 ? kexpS(-v * v) : 0)) * K.relief, nebelQuote: K.nebel };
    o.biom = { koeppen: B.koeppen, hauptklasse: B.hauptklasse, biom: B.biom };
    o.eis = { zeit: ortEisZeit(plan, breite, K.tJahrC, S.zeitMa) };   // das Eis des Quartärs liest das Jahresmittel des Orts
    // der Wuchs, den das Klima des Orts trägt — die stetige Form des Bioms, dieselbe Rechnung wie die Farbe des Atlas (`pflanzenDeckung`)
    pflanzenDeckung(K, _orP, _pd); o.wuchs = { decke: _pd.decke, wald: _pd.wald };
    o.lebensraum = { mangrove: _pd.mangrove, moor: _pd.moor, kuestenwueste: _pd.kuestenwueste };
    // DIE FRAGE BINDET DIE KOSTEN (Karte 2 planet.kopplung.gegenwart#2): hier standen Leit-Stützen 9×9 über 64 km — 81 von 83
    // planetPunktR je Ort (96 % der Punkt-Zeit), gelesen von keinem Leser (der Faden gibt delta.leit nie zurück, gelaende-core liest
    // sie nie). Sie fallen ganz; wer die Höhe neben dem Ort braucht, fragt planetPunktR an planetFlaeche selbst.
    o.vulkan = { art: _orP.vulkanArt, abstandKm: _orP.vulkanAbstandKm, alterMa: _orP.vulkanAlterMa,
      foerderKm3Ma: _orP.vulkanAktiv ? (_orP.vulkanArt === VULKAN_ART.hotspot ? 8 : 0.6) : 0 };   // dieselbe Regel wie planetVulkane
    o.rand = { art: _orP.randArt, abstandKm: _orP.randAbstandKm, rateCmA: _orP.randRateCmA };
    o.stauchung = sv;
    return o;
  }

  // G3.2 die Terme des zuletzt gerechneten Punkts (planetPunktR davor), für die Linse, die den Täter eines Sprungs nennt
  function terme(o) { o.boden = PK.tBoden; o.profil = PK.tProfil; o.mantel = PK.tMantel; o.schablone = PK.tSchablone; o.trapp = PK.tTrapp; o.orogen = PK.tOro; o.gedaechtnis = PK.tMem; o.gebirge = PK.tGeb; o.kegel = PK.tKegel; o.nachklang = PK.tNk; return o; }
  // R3 der Ort desselben Krusten-Materials zur Zeit t1: Kruste (Profil-Gewicht > 0) fährt mit ihrer Scholle, Boden einer Kontinent-Platte mit
  // deren Bezugs-Scholle, Ozean-Boden mit seiner Ozean-Platte — p(t1) = q(t1)·q(t0)⁻¹·p(t0), dieselbe Spur wie die Kegel. Ozean-Boden, der
  // bei t1 noch nicht entstanden war (t1 < t0 − Alter), existiert nicht.
  const _oz3 = new Float64Array(3), _ozA = new Float64Array(4), _ozB = new Float64Array(4), _ozI = new Float64Array(4), _ozR = new Float64Array(4), _ozP = {};
  function planetOrtDerZeit(plan, breite, laenge, t0, t1, aus) {
    if (!plan || !plan.lage) throw new Error('planetOrtDerZeit: plan fehlt (K10)');
    abschnittIndex(plan, t1);
    const S0 = planetScheibe(plan, t0), o = aus || {};
    planetRichtung(breite, laenge, _oz3); planetPunktR(S0, _oz3[0], _oz3[1], _oz3[2], 40, _ozP);
    let kont, ref;
    if (_ozP.scholle >= 0) { kont = true; ref = _ozP.scholle; }
    else if (_ozP.platte < S0.nG) { kont = true; ref = S0.abschnitt.mList[S0.abschnitt.mStart[_ozP.platte]]; }
    else { kont = false; ref = _ozP.platte - S0.nG; }
    o.scholle = _ozP.scholle; o.platte = _ozP.platte; o.kruste = _ozP.kruste;
    if (_ozP.scholle < 0 && t1 < t0 - _ozP.ozeanAlterMa) { o.existiert = false; o.breite = NaN; o.laenge = NaN; return o; }
    if (kont) { lageScholle(plan, ref, t0, _ozA, 0); lageScholle(plan, ref, t1, _ozB, 0); } else { lageOzean(plan, ref, t0, _ozA, 0); lageOzean(plan, ref, t1, _ozB, 0); }
    _ozI[0] = -_ozA[0]; _ozI[1] = -_ozA[1]; _ozI[2] = -_ozA[2]; _ozI[3] = _ozA[3];
    qMul(_ozB, 0, _ozI, 0, _ozR, 0); qDreh(_ozR, 0, _oz3[0], _oz3[1], _oz3[2], _oz3, 0);
    const l = Math.sqrt(_oz3[0] * _oz3[0] + _oz3[1] * _oz3[1] + _oz3[2] * _oz3[2]);
    o.existiert = true; o.breite = katan2(_oz3[1] / l, Math.sqrt(_oz3[0] * _oz3[0] + _oz3[2] * _oz3[2]) / l); o.laenge = katan2(_oz3[2], _oz3[0]);
    return o;
  }
  function scheibeBytes(S) {
    let n = 0; for (const key of ['sw', 'sm', 'sr', 'sAus', 'sgrp', 'qS', 'pz', 'pom', 'rho', 'nbStart', 'nbList', 'ketten', 'kettenIdx', 'nahtAmp', 'randTafel', 'zKopf', 'zListe', 'zLB', 'zF', 'kKopf', 'kAnz', 'kListe', 'sKopf', 'sListe', 'paarTafel', 'paarZeilen']) if (S[key]) n += S[key].byteLength;
    return n + 128;
  }

  const api = Object.freeze({
    STUDIO_VERTRAG: 1, FUNKTION: 1, VERSION,
    planetMathe, planetHash, planetZufall, PLANET_ERDE, RAND_ART, KRUSTE, VULKAN_ART, SCHICHT, BILD_ART,
    planetPlan, planetScheibe, planetRichtung, planetBreiteLaenge, planetPunkt, planetPunktR, planetHuelle, planetMeer, planetVulkane, planetKarte, planetKarteAusschnitt,
    KLIMA, KOEPPEN, WHITTAKER, planetKlimaGlobal, planetKlima, planetKlimaR, planetBiom, planetPet: petMm,
    PLANET_WASSER_N: WASSER_N, planetWasserGitter, planetWasserR,
    planetAnker, planetFlaeche, planetKarteVon, planetOrt, ortEisZeit, EIS_ZEITEN, planetOrtDerZeit, NACHKLANG_MA,
    _intern: Object.freeze({ terme, planBytes, scheibeBytes, abschnitt, acosF, gdh1, fib, biomFarbe, pflanzenDeckung, aetPike, wasserZellen, wasserLauf, guertelP, scheibeKern, tempoAbl, abschnittIndex,
      bahnElemente, tagesEinstrahlung, bahnKoerper, eisZustand, eisMeerM, klimaStrahlung, EIS_BAHN }),
  });
  root.__planetCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : globalThis);
