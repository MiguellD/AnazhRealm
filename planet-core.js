/*
 * planet-core.js — der Planet als FUNKTION f(samen, breite, laenge, zeit).
 *
 * Kern im Aufbau (Entscheid vision/planet/ENTSCHEID.md, Schritt bau1): Kugel, Schollen, Schlüsselbilder, Platten, Ränder,
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
 */
(function (root) {
  'use strict';

  const VERSION = 'planet-bau1-1';

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
  function pow2(k) { let p = 1, b = k < 0 ? 0.5 : 2, n = k < 0 ? -k : k; while (n) { if (n & 1) p *= b; b *= b; n >>= 1; } return p; }
  function kexp(x) {
    if (x !== x) return x;
    if (x > 709.78) return Infinity;
    if (x < -745.13) return 0;
    const k = Math.floor(x * INV_LN2 + 0.5);
    const r = (x - k * LN2_HI) - k * LN2_LO;
    let s = 1;
    for (let i = 15; i >= 1; i--) s = 1 + s * r / i;
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
  function gauss(d, s) { const u = d / s; return u * u > 40 ? 0 : kexp(-0.5 * u * u); }

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
  const SCHICHT = Object.freeze({ relief: 0, platten: 1, alter: 2 });
  const BILD_ART = Object.freeze({ verstreut: 0, versammelt: 1, geloest: 2 });

  const T_START = -4000, T_ENDE = 1000, TAU_W = 20, TAU_A = 120;
  const RAMPE0 = 0.04, RAMPE1 = 0.2;   // innen-Rampe im Krustenfeld (Schelf → Inneres)
  const BEZUG_MA = 100;                   // Erosionsbasis: Bezugs-Spiegel = Mittel des Selbst-Spiegels über 100 Ma (K7)
  const MAX_P = 64;

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
    const nO = ki.ozeanPlatten !== undefined ? ki.ozeanPlatten : 4 + Math.floor(Z(3, 0) * 5);
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
    function ozeanZiehen(b, dauer) {
      for (let j = 0; j < nO; j++) {
        const z = new Float64Array(3); qDreh(oq, 4 * j, ozeanStart[4 * j], ozeanStart[4 * j + 1], ozeanStart[4 * j + 2], z, 0);
        tangente(z[0], z[1], z[2], tb);
        const th = TAU * Z(60, b, j), rate = 20 + 55 * Z(61, b, j);
        const dx = kcos(th) * tb[0] + ksin(th) * tb[3], dy = kcos(th) * tb[1] + ksin(th) * tb[4], dz = kcos(th) * tb[2] + ksin(th) * tb[5];
        // Achse ⟂ z und ⟂ Fahrtrichtung
        let ax = z[1] * dz - z[2] * dy, ay = z[2] * dx - z[0] * dz, az = z[0] * dy - z[1] * dx; const l = Math.sqrt(ax * ax + ay * ay + az * az);
        qAchse(ax / l, ay / l, az / l, rate * dauer / R, tmpQ, 0);
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
          const halb = Math.min(0.9, 0.55 * Math.min(rs, ro) / rs * 1.6);
          naehteL.push(s, o, az, halb, t, (3.2 + 2.0 * Z(70, s, Math.floor(t))) , 140 + 80 * Z(71, o, Math.floor(t)), kontakt);
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
      if (art === BILD_ART.verstreut) {
        const qVor = Float64Array.from(q);
        const wi = versammeln(b + 1); const rate = 20 + 60 * Z(90, b, 0);
        dauer = Math.max(40, wi * R / rate);
        void qVor; naechste = BILD_ART.versammelt;
      } else if (art === BILD_ART.versammelt) {
        dauer = 50 + 100 * Z(91, b, 0);
        const ax = new Float64Array(3); zufallEinheit(k, 92, b, ax, 0);
        const wi = (15 + 15 * Z(93, b, 0)) * dauer / R; qAchse(ax[0], ax[1], ax[2], wi, tmpQ, 0);
        const L = gruppenListe(); const dreh = {}; for (const G of L) dreh[G.g] = Float64Array.from(tmpQ.subarray(0, 4));
        anwenden(L, dreh); naechste = BILD_ART.geloest;
      } else {
        const wi = verstreuen(b + 1); const rate = 20 + 60 * Z(94, b, 0);
        dauer = Math.max(40, wi * R / rate);
        naechste = BILD_ART.verstreut;
      }
      ozeanZiehen(b, dauer);
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
    const nH = 150; const hotspots = new Float64Array(nH * 6);
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
  function tangentenJeScholle(plan) {
    const M = memoVon(plan); if (M.tang) return M.tang;
    const T = new Float64Array(plan.nS * 6), tb = new Float64Array(6);
    for (let s = 0; s < plan.nS; s++) { tangente(plan.schollen[8 * s], plan.schollen[8 * s + 1], plan.schollen[8 * s + 2], tb); T.set(tb, 6 * s); }
    M.tang = T; return T;
  }
  function naehteJeScholle(plan) {
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
          const s0 = Math.min(1.6, geschw * vl / 40);
          rand[2 * (s * 32 + f)] = plan.bilder[b]; rand[2 * (s * 32 + f) + 1] = 4.0 * s0 * reife * gS * glatt(0.35, 0.7, front);
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
    const tq = new Float64Array(4); qAchse(A.achse[3 * g], A.achse[3 * g + 1], A.achse[3 * g + 2], A.winkel[g] * e, tq, 0);
    qMul(tq, 0, plan.lage, (b * plan.nS + s) * 4, out, o);
  }
  function lageOzean(plan, j, t, out, o) {
    const b = abschnittIndex(plan, t), A = abschnitt(plan, b);
    const u = (t - A.t0) / A.dauer, i = A.nG + j, e = tempo(u);
    const tq = new Float64Array(4); qAchse(A.achse[3 * i], A.achse[3 * i + 1], A.achse[3 * i + 2], A.winkel[i] * e, tq, 0);
    qMul(tq, 0, plan.ozean, (b * plan.nO + j) * 4, out, o);
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
  function scheibeKern(plan, t, ohneQ) {
    const M = memoVon(plan);
    const key = t;
    if (!ohneQ && M.scheiben.has(key)) return M.scheiben.get(key);
    const b = abschnittIndex(plan, t), A = abschnitt(plan, b);
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
      nbStart: null, nbList: null, ketten: null, kettenN: 0, Q: ohneQ ? 0 : plan.Q, meerKm: 0, refKm: 0, kuesteF: 0,
    };
    if (ohneQ) return S;
    // Nachbar-Liste aus 4 096 Fibonacci-Proben
    const N = 4096, F = fib(N), adj = new Uint8Array(nP * nP);
    for (let i = 0; i < N; i++) {
      plattenWertung(S, F[3 * i], F[3 * i + 1], F[3 * i + 2]);
      const a = W_.best, c = W_.zweit;
      if (c >= 0 && (W_.sc[a] - W_.sc[c]) * 0.5 * R < 450) { adj[a * nP + c] = 1; adj[c * nP + a] = 1; }
    }
    const nbStart = new Int32Array(nP + 1); const L = [];
    for (let i = 0; i < nP; i++) { for (let j = 0; j < nP; j++) if (adj[i * nP + j]) L.push(j); nbStart[i + 1] = L.length; }
    S.nbStart = nbStart; S.nbList = Int32Array.from(L);
    kettenBauen(S);
    if (M.scheiben.size > 24) M.scheiben.delete(M.scheiben.keys().next().value);
    M.scheiben.set(key, S);
    return S;
  }

  // Hotspot-Ketten: Spur R(t)·R(t−τ)⁻¹·h der Platte, die jetzt über dem Hotspot liegt; Takt 3,5 Ma, 24 Stützen
  function kettenBauen(S) {
    const plan = S.plan, t = S.zeitMa, nH = plan.nH, K = new Float64Array(nH * 24 * 4 + nH * 4); let n = 0;
    const qa = new Float64Array(4), qb = new Float64Array(4), qi = new Float64Array(4), qr = new Float64Array(4), v = new Float64Array(3);
    const idx = [];
    for (let h = 0; h < nH; h++) {
      const beg = plan.hotspots[6 * h + 3], end = plan.hotspots[6 * h + 4];
      if (beg > t || end < t - 80) continue;
      const hx = plan.hotspots[6 * h], hy = plan.hotspots[6 * h + 1], hzz = plan.hotspots[6 * h + 2];
      plattenWertung(S, hx, hy, hzz);
      let p = W_.best;
      const fk = krusteFeld(S, hx, hy, hzz, 400, 0); if (fk > S.Q - 0.06 && W_.fGrp >= 0) p = W_.fGrp;
      const istKont = p < S.nG; const ref = istKont ? S.abschnitt.mList[S.abschnitt.mStart[p]] : p - S.nG;
      if (istKont) lageScholle(plan, ref, t, qa, 0); else lageOzean(plan, ref, t, qa, 0);
      const o = n * 4 + nH * 24 * 4; let cnt = 0;
      for (let kk = 0; kk < 24; kk++) {
        const tau = kk * 3.5, tt = t - tau;
        if (tt < beg || tt > end || tt < plan.bilder[0]) { K[(h * 24 + kk) * 4 + 3] = -1; continue; }
        if (istKont) lageScholle(plan, ref, tt, qb, 0); else lageOzean(plan, ref, tt, qb, 0);
        qi[0] = -qb[0]; qi[1] = -qb[1]; qi[2] = -qb[2]; qi[3] = qb[3];
        qMul(qa, 0, qi, 0, qr, 0); qDreh(qr, 0, hx, hy, hzz, v, 0);
        const ii = (h * 24 + kk) * 4; K[ii] = v[0]; K[ii + 1] = v[1]; K[ii + 2] = v[2]; K[ii + 3] = tau; cnt++;
      }
      for (let kk = cnt === 0 ? 24 : 0; kk < 24; kk++) void kk;
      if (cnt > 0) idx.push(h);
      void o;
    }
    // Hüll-Kappe je Kette
    const kap = new Float64Array(nH * 4);
    for (const h of idx) {
      let cx = 0, cy = 0, cz = 0;
      for (let kk = 0; kk < 24; kk++) { const ii = (h * 24 + kk) * 4; if (K[ii + 3] < 0) continue; cx += K[ii]; cy += K[ii + 1]; cz += K[ii + 2]; }
      const l = Math.sqrt(cx * cx + cy * cy + cz * cz) || 1; cx /= l; cy /= l; cz /= l;
      let mn = 1;
      for (let kk = 0; kk < 24; kk++) { const ii = (h * 24 + kk) * 4; if (K[ii + 3] < 0) continue; const d = cx * K[ii] + cy * K[ii + 1] + cz * K[ii + 2]; if (d < mn) mn = d; }
      const marg = 250 / S.R; kap[4 * h] = cx; kap[4 * h + 1] = cy; kap[4 * h + 2] = cz; kap[4 * h + 3] = kcos(Math.min(PI, acosF(mn) + marg));
    }
    S.ketten = K; S.kettenKap = kap; S.kettenIdx = Int32Array.from(idx);
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
  const W_ = { sc: new Float64Array(MAX_P), anc: new Int32Array(MAX_P), dC: new Float64Array(MAX_P), best: -1, zweit: -1, qx: 0, qy: 0, qz: 0, fGrp: -1 };
  function plattenWertung(S, x, y, z) {
    const R = S.R, plan = S.plan;
    const wf = R / 1900, sw0 = plan.saatW;
    const wa = 160 / R;
    let qx = x + wa * rausch(sw0, x * wf, y * wf, z * wf), qy = y + wa * rausch(sw0 + 1, x * wf + 5.1, y * wf, z * wf), qz = z + wa * rausch(sw0 + 2, x * wf, y * wf - 3.3, z * wf);
    const ql = Math.sqrt(qx * qx + qy * qy + qz * qz); qx /= ql; qy /= ql; qz /= ql;
    W_.qx = qx; W_.qy = qy; W_.qz = qz;
    const A = S.abschnitt, sw = S.sw, sr = S.sr, sc = W_.sc;
    let best = -1, bv = -1e9, zw = -1, zv = -1e9;
    for (let g = 0; g < S.nG; g++) {
      let dmin = 1e9, an = -1;
      for (let i = A.mStart[g]; i < A.mStart[g + 1]; i++) {
        const s = A.mList[i]; const d = ellAbst(S, s, qx, qy, qz) - sr[s] * 0.92;
        if (d < dmin) { dmin = d; an = s; }
      }
      W_.dC[g] = dmin; W_.anc[g] = an;
      const ox0 = S.pom[3 * g], oy0 = S.pom[3 * g + 1], oz0 = S.pom[3 * g + 2];
      const vx = oy0 * qz - oz0 * qy, vy = oz0 * qx - ox0 * qz, vz = ox0 * qy - oy0 * qx; const vl = Math.sqrt(vx * vx + vy * vy + vz * vz);
      let reach = 0.5 * (A.schuerze[g] + A.hinten[g]);
      if (vl > 1e-12 && an >= 0) {
        const ax = sw[3 * an], ay = sw[3 * an + 1], az = sw[3 * an + 2], cd = ax * qx + ay * qy + az * qz;
        const ox = -(ax - cd * qx), oy = -(ay - cd * qy), oz = -(az - cd * qz), ol = Math.sqrt(ox * ox + oy * oy + oz * oz);
        if (ol > 1e-12) {
          const front = (vx * ox + vy * oy + vz * oz) / (vl * ol);
          let tt = (0.35 - front) / 0.8; tt = tt < 0 ? 0 : (tt > 1 ? 1 : tt);
          reach = A.schuerze[g] + (A.hinten[g] - A.schuerze[g]) * tt * tt * (3 - 2 * tt);
        }
      }
      const v = reach - (dmin < 0 ? dmin * 12 : dmin); sc[g] = v; // K1: im Krusten-Inneren gewinnt die Kruste immer
      if (v > bv) { zw = best; zv = bv; best = g; bv = v; } else if (v > zv) { zw = g; zv = v; }
    }
    for (let i = S.nG; i < S.nP; i++) {
      const v = S.rho[i] - acosF(qx * S.pz[3 * i] + qy * S.pz[3 * i + 1] + qz * S.pz[3 * i + 2]);
      sc[i] = v; W_.dC[i] = 9;
      if (v > bv) { zw = best; zv = bv; best = i; bv = v; } else if (v > zv) { zw = i; zv = v; }
    }
    W_.best = best; W_.zweit = zw;
  }

  // ── Feld EINER Scholle im eigenen Rahmen: elliptisches Fenster über den Radius + verzogenes fBm im Rand-Gürtel ──
  function ellipseJeScholle(plan) {
    const M = memoVon(plan); if (M.ell) return M.ell;
    const E = new Float64Array(plan.nS * 3);
    for (let s = 0; s < plan.nS; s++) { const th = PI * planetZufall(plan.k, 28, s, 0); E[3 * s] = kcos(th); E[3 * s + 1] = ksin(th); E[3 * s + 2] = 1 + 0.6 * planetZufall(plan.k, 29, s, 0); }
    M.ell = E; return E;
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
      const n = nurGrob ? fbmKm(seed, ux, uy, uz, R, lam0, Math.max(lamCut, lam0 * 0.45), 0.62) : fbmKm(seed, ux, uy, uz, R, lam0, lamCut, 0.62);
      f += 0.6 * n * glatt(-0.75, -0.25, f) * (1 - glatt(0.3, 0.6, f)) * plan.schollen[8 * s + 6];
    }
    return f;
  }

  // ── Krustenfeld: Vereinigung aller Schollen-Felder, jedes im eigenen Rahmen (K1) ──────────────────────
  const KF = { gF: new Float64Array(MAX_P), sBest: -1, fBest: -9, sF: new Float64Array(64), sLx: new Float64Array(64 * 3), sIn: new Uint8Array(64) };
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

  // ── Der Punkt ───────────────────────────────────────────────────────────────────────────────────────────
  const PK = {
    hA: 0, hB: 0, kont: 0, kruste: 0, scholle: -1, platte: -1, nachbar: -1, randArt: 0, randAbstandKm: 1e9, randRateCmA: 0,
    ozeanAlterMa: 0, orogenStaerke: 0, orogenAlterMa: 0, vulkanArt: 0, vulkanAbstandKm: 1e9, vulkanAlterMa: 0, vulkanId: -1, vulkanAktiv: 0, fK: 0,
  };
  function punktKern(S, x, y, z, fussKm, huelle) {
    if (!(fussKm > 0)) throw new Error('planet: fussKm fehlt (K10)');
    const plan = S.plan, R = S.R, A = S.abschnitt, Q = S.Q, gS = plan.gS, k = plan.k, t = S.zeitMa;
    // 1 Kruste (unverzogen, im Schollen-Rahmen)
    const fK = krusteFeld(S, x, y, z, huelle ? 400 : fussKm, huelle);
    const gK = W_.fGrp, sB = KF.sBest;
    // 2 Platten-Wertung (verzogen)
    plattenWertung(S, x, y, z);
    const qx = W_.qx, qy = W_.qy, qz = W_.qz, sc = W_.sc;
    let own = W_.best, sec = W_.zweit;
    const aufKruste = fK > Q - 0.06 && gK >= 0;
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
          const idx = Math.floor(LG.laengs / L);
          const dlt = (planetZufall(k, 201, pk, idx) - 0.5) * 2 * 80 * div;
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
    for (let ii = nb0 - 1; ii < nb1; ii++) {
      const j = ii < nb0 ? sec : S.nbList[ii];
      if (j < 0 || j === own || (ii >= nb0 && j === sec)) continue;
      const xKm = j === sec ? mHaupt : Math.max(0, (sc[own] - sc[j]) * 0.5 * R);
      if (xKm > 5000) continue;
      paarRelativ(S, own, j, qx, qy, qz);
      const c = PR.c, rate = PR.rate;
      const offen = c < 0 ? -c : 0, konv = c > 0 ? c : 0;
      // Alter: Rücken-Abstand / halbe Rate; bei Öffnung zwischen Kontinenten T_offen·d_R/(d_R + d_Rand)
      let a = offen > 0.5 ? xKm / (offen * 0.5) : 1e6;
      if (ownKont && j < S.nG) {
        const to = A.tOffen[own * A.nG + j];
        if (to > -1e8) { const T = Math.max(1, t - to); const dR = Math.max(0, dCo); const a2 = T * xKm / (xKm + dR + 1); if (a2 < a) a = a2; }
      }
      if (a < 0.05) a = 0.05;
      const a2_ = a * a; invA += 1 / (a2_ * a2_);
      if (xKm < randMin) {
        randMin = xKm; randRate = rate;
        randArt = konv > 0.35 * rate && konv > 2 ? RAND_ART.konvergent : (offen > 0.35 * rate && offen > 2 ? RAND_ART.divergent : (rate > 2 ? RAND_ART.transform : RAND_ART.innen));
      }
      if (xKm > 1300) continue;
      const jKont = j < S.nG;
      const dCj = jKont ? W_.dC[j] * R - xKm : 1e9;
      const wkJ = jKont ? 1 - glatt(500, 900, dCj) : 0;
      const reife = 1 - kexp(-(t - A.t0 + 1) / TAU_W);
      if (konv > 0.5) {
        const s = Math.min(1.6, konv / 40) * reife * gS;
        const wa = wkI * wkJ, wb = wkI * (1 - wkJ), wc = (1 - wkI) * wkJ, wd = (1 - wkI) * (1 - wkJ);
        let sub = 0; // Ozean/Ozean: welche Seite taucht ab (Paar-Hash)
        if (wd > 0) { const lo = own < j ? own : j; sub = planetZufall(k, 210, S.b * 4096 + lo * 64 + (own < j ? j : own), 0) < 0.5 ? lo : (own < j ? j : own); }
        const grat = (wa + wb + wd > 0.05 && xKm < 700) ? 0.45 + 0.55 * gratKm(k ^ 0x3c6ef372, x, y, z, R, 210) : 1;
        let oro = 0;
        if (wa > 0) { oro += wa * 4.6 * s * gauss(xKm - 110, 210) * grat; hTpl -= wa * 0.35 * s * gauss(xKm - 440, 120); }
        if (wb > 0) oro += wb * 4.0 * s * gauss(xKm - 240, 105) * grat;
        if (wc > 0) hTpl += wc * (-3.0 * s * gauss(xKm - 40, 45) + 0.25 * s * gauss(xKm - 170, 70));
        if (wd > 0) {
          if (sub === own) hTpl += wd * (-3.0 * s * gauss(xKm - 40, 45) + 0.25 * s * gauss(xKm - 170, 70));
          else oro += wd * 3.0 * s * gauss(xKm - 205, 55) * grat;
        }
        if (oro > hOro) { hOro = oro; oroAlter = t - A.t0; }
        // Bogen-Kegel im Takt ~70 km, 150–300 km hinter dem Graben
        const wBogen = wb + (sub !== own ? wd : 0);
        if (!huelle && wBogen > 0.3 && xKm > 100 && xKm < 360 && s > 0.12) {
          laengs(S, own, j, x, y, z);
          if (LG.ok) {
            const lo = own < j ? own : j, hi = own < j ? j : own, pk = (S.b * 4096 + lo * 64 + hi) | 0;
            const i0 = Math.floor(LG.laengs / 70);
            for (let kk = i0 - 1; kk <= i0 + 1; kk++) {
              const h1 = planetZufall(k, 220, pk, kk), h2 = planetZufall(k, 221, pk, kk), h3 = planetZufall(k, 222, pk, kk);
              if (h3 < 0.18) continue;
              const uc = (kk + 0.2 + 0.6 * h1) * 70, xc = 160 + 120 * h2;
              const du = LG.laengs - uc, dx = xKm - xc, d = Math.sqrt(du * du + dx * dx);
              if (d < 26) { hKegel = Math.max(hKegel, (1.2 + 1.8 * h3) * Math.min(1, s) * wBogen * (1 - d / 26) * gS); }
              if (d < vAbst) { vAbst = d; vArt = VULKAN_ART.bogen; vAlter = 0; vId = pk * 100000 + (kk + 50000); vAktiv = s * wBogen > 0.2 ? 1 : 0; }
            }
          }
        }
      }
      if (offen > 0.5) {
        const dv = Math.min(1, offen / 20);
        hTpl += wkI * wkJ * (-1.2 * dv * kexp(-xKm / 130));
        if (!huelle && (1 - wkI) > 0 && xKm < 250) hTpl += (1 - wkI) * dv * (-0.35 * kexp(-xKm / 14) + 0.35 * kexp(-xKm / 60) * (gratKm(k ^ 0x1b873593, x, y, z, R, 90) - 0.45));
      }
      const tr = Math.min(1, PR.scher / 30) * (1 - Math.min(1, Math.abs(c) / Math.max(PR.scher, 1e-3)));
      if (tr > 0.05 && xKm < 200) hTpl += (1 - wkI) * (-0.6 * tr * kexp(-xKm / 45));
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
          const breite = nae[n + 6] * (1 + a / 200);
          const quer = (ang - nae[n + 7] * rs) * R;
          const H = nae[n + 5] * (1 - kexp(-a / TAU_W)) * kexp(-a / TAU_A) * gS;
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
          if (H0 <= 0 || tEnd > t) continue;
          const a = t - tEnd; const innenKm = (f - Q) * rs * R; // landein ab der Krusten-Kante (folgt der rauen Küste)
          hR += wgt * H0 * kexp(-a / TAU_A) * gauss(innenKm - 230, 150 * (1 + a / 300)); aR = a;
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
          hTpl += S1 * wv * st * kexp(-a / 150) * gS;
          if (a < 2 && d < vAbst) { vAbst = d; vArt = VULKAN_ART.trapp; vAlter = a; vId = 900000000 + e; vAktiv = 1; }
        }
      }
    }
    const hGeb = Math.max(hOro, hMem);
    // 7 Hotspot-Ketten (Kegel, über Kontinent Dom)
    if (S.kettenIdx) {
      const K = S.ketten, KP = S.kettenKap;
      for (let q2 = 0; q2 < S.kettenIdx.length; q2++) {
        const h = S.kettenIdx[q2];
        if (x * KP[4 * h] + y * KP[4 * h + 1] + z * KP[4 * h + 2] < KP[4 * h + 3]) continue;
        const st = plan.hotspots[6 * h + 5];
        for (let kk = 0; kk < 24; kk++) {
          const ii = (h * 24 + kk) * 4; const tau = K[ii + 3]; if (tau < 0) continue;
          const dd = x * K[ii] + y * K[ii + 1] + z * K[ii + 2]; if (dd < 0.97) continue;
          const d = acosF(dd) * R; if (d > 300) continue;
          const ozeanisch = 1 - S1;
          const sig = 30 + 90 * S1;
          const hh = (huelle ? 0 : 1) * st * (4.2 * ozeanisch * kexp(-tau / 32) + 0.6 * S1 * kexp(-tau / 4)) * gauss(d, sig) * gS;
          if (hh > hKegel) hKegel = hh;
          if (d < vAbst && tau < 40) { vAbst = d; vArt = VULKAN_ART.hotspot; vAlter = tau; vId = 800000000 + h * 100 + kk; vAktiv = kk === 0 && plan.hotspots[6 * h + 4] >= t ? 1 : 0; }
        }
      }
    }
    hA += hTpl + hGeb + hKegel;
    PK.hA = hA; PK.hB = hB; PK.fK = fK;
    PK.kruste = S2 > 0.5 ? KRUSTE.kontinent : (S1 > 0.5 ? KRUSTE.schelf : (S1 > 0 ? KRUSTE.hang : KRUSTE.ozean));
    PK.scholle = S1 > 0 ? sB : -1;
    PK.randArt = randArt; PK.randAbstandKm = randMin; PK.randRateCmA = randRate / 10;
    PK.ozeanAlterMa = alter; PK.orogenStaerke = Math.min(1, hGeb / 5); PK.orogenAlterMa = hMem > hOro ? memAlter : oroAlter;
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
    const s = meerLoesen(P.a, P.bw, P.N, plan.koerper.wasserKm + zusatz, sr);
    let land = 0, alt = 0, no = 0;
    for (let i = 0; i < P.N; i++) { const h = P.a[i] + P.bw[i] * sr - s; if (h > 0) land++; else if (P.bw[i] < 0.5) { alt += P.al[i]; no++; } }
    const r = { sigma: s, landAnteil: land / P.N, ozeanAlterMa: no ? alt / no : 0 };
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
      ozeanAlterMa: A0.ozeanAlterMa + u * (A1.ozeanAlterMa - A0.ozeanAlterMa), eisKm: 0 };
  }

  function planetScheibe(plan, zeitMa) {
    if (!plan || !plan.lage) throw new Error('planetScheibe: plan fehlt (K10)');
    const S = scheibeKern(plan, zeitMa, false);
    if (S.meerFertig) return S;
    const m = planetMeer(plan, zeitMa, 0);
    S.meerKm = m.meerKm; S.sigmaKm = m.sigmaKm; S.refKm = m.refKm; S.eisKm = 0; S.landAnteil = m.landAnteil;
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
    o.orogenStaerke = PK.orogenStaerke; o.orogenAlterMa = PK.orogenAlterMa; o.vulkanArt = PK.vulkanArt; o.vulkanAbstandKm = PK.vulkanAbstandKm;
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
    if (schicht !== 'relief' && schicht !== 'platten' && schicht !== 'alter') throw new Error('planetKarte: Schicht "' + schicht + '" ist nicht gebaut');
    const R = S.R, fuss = TAU * R / W;
    const hoehe = new Float32Array(W * H), platte = new Int16Array(W * H), art = new Uint8Array(W * H), alter = new Float32Array(W * H), vul = new Uint8Array(W * H);
    const cl = new Float64Array(W), sl = new Float64Array(W);
    for (let i = 0; i < W; i++) { const lam = -PI + TAU * (i + 0.5) / W; cl[i] = kcos(lam); sl[i] = ksin(lam); }
    const P = {};
    for (let r = 0; r < H; r++) {
      const phi = HALBPI - PI * (r + 0.5) / H, cp = kcos(phi), sp = ksin(phi);
      for (let i = 0; i < W; i++) {
        const idx = r * W + i;
        hoehe[idx] = planetPunktR(S, cp * cl[i], sp, cp * sl[i], fuss, P);
        platte[idx] = P.platte; art[idx] = P.randArt; alter[idx] = P.ozeanAlterMa; vul[idx] = P.vulkanAktiv && P.vulkanAbstandKm < fuss * 0.8 ? 1 : 0;
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

  function scheibeBytes(S) {
    let n = 0; for (const key of ['sw', 'sm', 'sr', 'sAus', 'sgrp', 'qS', 'pz', 'pom', 'rho', 'nbStart', 'nbList', 'ketten', 'kettenKap', 'kettenIdx']) if (S[key]) n += S[key].byteLength;
    return n + 128;
  }

  const api = Object.freeze({
    STUDIO_VERTRAG: 1, FUNKTION: 1, VERSION,
    planetMathe, planetHash, planetZufall, PLANET_ERDE, RAND_ART, KRUSTE, VULKAN_ART, SCHICHT, BILD_ART,
    planetPlan, planetScheibe, planetRichtung, planetBreiteLaenge, planetPunkt, planetPunktR, planetHuelle, planetMeer, planetVulkane, planetKarte,
    _intern: Object.freeze({ planBytes, scheibeBytes, abschnitt, acosF, gdh1, fib }),
  });
  root.__planetCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : globalThis);
