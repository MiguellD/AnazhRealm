// AnazhRealm — worlds/gelaende/makro-worker.js: DIE MAKRO-ANSICHT DES GELÄNDE-STUDIOS (K16b), off-thread.
//
// Das Studio fragt je Spur eine Lage als Abbild (A: die gebaute Welt `lageAbbild`, B: die Welt des Entwurfs `planAbbild`) —
// dieser Worker rechnet sie mit DEMSELBEN Gesetzbuch wie die Welt (gelaende-core.js `hoehe` an `lageAus`; kein Spiegel,
// keine eigene Höhe) und antwortet in drei Stufen, jede ein Bild:
//   grob    90 × 90 Spalten (90 m) — das Bild unter dem Finger, während der Regler noch gleitet
//   voll    268 × 268 Spalten (30 m, das Raster der Gelände-Linse: 4 × 4 km innen + 2 km Rand) — Bild, Statistik, Urteil,
//           der Makro-Abdruck (64 × 64, ±852 m, mit und ohne Detail — derselbe wie `diag-worker-dichte --abdruck`)
//   schicht das Schicht-Gesetz am Schicht-Ort (`schichtOrt`, 2-m-Raster, 600 m, im Tafelland gezählt)
// Ein neuer Entwurf überholt den alten (die Rechnung gibt je ~16 ms den Takt ab und bricht ab, wenn sie nicht mehr
// die jüngste ist). Die Bilder reisen als Transfer (der Haupt-Thread trägt keine Bytes, Lehre 24).
"use strict";
self.window = self;
const V = (function () {
    try {
        return new URLSearchParams(self.location.search).get("v") || "";
    } catch (_e) {
        return "";
    }
})();
importScripts("../../vendor/simplex-noise.js");
importScripts("../../gelaende-core.js" + (V ? "?v=" + V : ""));
const G = self.__gelaendeCore;
if (!G || typeof G.lageAus !== "function")
    throw new Error("makro-worker: gelaende-core trägt keine Lage-Rechnung (lageAus)");

const RASTER = Object.freeze({
    grob: { n: 90, schritt: 90, x0: -4005 },
    voll: { n: 268, schritt: 30, x0: -4010 },
});
const RAND = Math.round(2000 / 30);
// Je Spur (A = die gebaute Welt, B = der Entwurf) der jüngste Auftrag — ein neuer Entwurf überholt nur seine Spur.
const juengste = { A: 0, B: 0 };
const pause = () => new Promise((r) => setTimeout(r, 0));

// Das Raster einer Lage, Zeile für Zeile; je ~16 ms gibt es den Takt ab — und bricht ab, wenn ein jüngerer Entwurf kam.
async function raster(L, R, id, spur) {
    const H = new Float64Array(R.n * R.n);
    let t = performance.now();
    for (let j = 0; j < R.n; j++) {
        for (let i = 0; i < R.n; i++) H[i + j * R.n] = G.hoehe(L, R.x0 + i * R.schritt, R.x0 + j * R.schritt, true);
        if (performance.now() - t > 16) {
            await pause();
            if (id !== juengste[spur]) return null;
            t = performance.now();
        }
    }
    return H;
}

async function sha(arr) {
    const d = await crypto.subtle.digest("SHA-256", arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength));
    return Array.from(new Uint8Array(d))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

async function makroSha(L) {
    const h = new Float64Array(64 * 64 * 2);
    let q = 0;
    for (let j = 0; j < 64; j++)
        for (let i = 0; i < 64; i++) {
            h[q++] = G.hoehe(L, -852 + i * 27, -852 + j * 27, true);
            h[q++] = G.hoehe(L, -852 + i * 27, -852 + j * 27, false);
        }
    return sha(h);
}

// DAS RELIEF-BILD: Höhenstufen über dem Meer (Aue grün → Hochland ocker → Fels), Fels nach dem Hang (Schutt ab 30°,
// Kliff ab 60°), Schnee nach der Schneegrenze des Kerns, Wasser nach der Tiefe; Licht aus vier Richtungen (Nordwest
// führt), Höhenlinien je 20 m, die Küste als heller Saum.
const STUFEN = [
    [0, 98, 132, 76],
    [12, 112, 142, 80],
    [40, 136, 150, 92],
    [80, 160, 150, 104],
    [130, 158, 138, 114],
    [190, 176, 170, 162],
];
const FELS = [124, 114, 104];
const KLIFF = [92, 84, 78];
// DER SCHNEE DER KARTE IST DER SCHNEE DER WELT (EIN Farb-Gesetz, K16b): die Farbe ist die Palette des Bodens
// (`terrain:PORTAL_GROUND`.schnee, das Studio reicht sie beim Start), der Anteil ist `schnee` des Kerns an der Höhe — dieselbe
// Funktion, mit der die Welt jede Boden-Farbe mischt (`_bodenFarbeAt`, Worker `attachFieldColors`), ohne eigene Dämpfung.
// Ohne die Farbe der Welt malt die Karte nichts (fail-closed: der Grund steht im Feld).
let SCHNEE = null;
function hexRgb(v) {
    const n = typeof v === "number" ? v : parseInt(String(v).replace(/^#|^0x/i, ""), 16);
    if (!Number.isFinite(n)) throw new Error(`die Schnee-Farbe der Welt ist kein Hex (${v})`);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const SEICHT = [84, 156, 168];
const TIEF = [20, 48, 82];
const glatt = (a, b, v) => {
    const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
    return t * t * (3 - 2 * t);
};
function stufe(e, out) {
    let k = 0;
    while (k < STUFEN.length - 2 && e > STUFEN[k + 1][0]) k++;
    const a = STUFEN[k];
    const b = STUFEN[k + 1];
    const t = Math.min(1, Math.max(0, (e - a[0]) / (b[0] - a[0])));
    out[0] = a[1] + (b[1] - a[1]) * t;
    out[1] = a[2] + (b[2] - a[2]) * t;
    out[2] = a[3] + (b[3] - a[3]) * t;
}
const LICHT = (() => {
    const hoch = Math.sin((42 * Math.PI) / 180);
    const flach = Math.cos((42 * Math.PI) / 180);
    return [
        [315, 0.55],
        [270, 0.2],
        [0, 0.15],
        [225, 0.1],
    ].map(([az, w]) => {
        const a = (az * Math.PI) / 180;
        // Bild: +x nach Osten (rechts), +z nach Süden (unten); Azimut im Uhrzeigersinn von Norden.
        return { x: Math.sin(a) * flach, z: -Math.cos(a) * flach, y: hoch, w };
    });
})();
// `schneeAus` (optional, n×n): der Schnee, den das Bild je Land-Zelle malt (0…255) — kein zweiter Rechner neben dem Bild.
function faerbe(H, n, schritt, L, schneeAus) {
    if (!SCHNEE) throw new Error("die Karte kennt die Schnee-Farbe der Welt nicht (terrain:PORTAL_GROUND.schnee)");
    const wl = L.waterLevel;
    const px = new Uint8ClampedArray(n * n * 4);
    const c = [0, 0, 0];
    const DEG = 180 / Math.PI;
    const ueber = 1.6; // Überhöhung des Lichts (das Bild liest die Form, nicht den Maßstab)
    for (let j = 0; j < n; j++)
        for (let i = 0; i < n; i++) {
            const k = i + j * n;
            const h = H[k];
            const hx = (H[Math.min(n - 1, i + 1) + j * n] - H[Math.max(0, i - 1) + j * n]) / (2 * schritt);
            const hz = (H[i + Math.min(n - 1, j + 1) * n] - H[i + Math.max(0, j - 1) * n]) / (2 * schritt);
            const nx = -hx * ueber;
            const nz = -hz * ueber;
            const nl = 1 / Math.hypot(nx, 1, nz);
            let licht = 0;
            for (const l of LICHT) licht += l.w * Math.max(0, (nx * l.x + l.y + nz * l.z) * nl);
            if (h <= wl) {
                const d = wl - h;
                const t = glatt(0, 36, d);
                c[0] = SEICHT[0] + (TIEF[0] - SEICHT[0]) * t;
                c[1] = SEICHT[1] + (TIEF[1] - SEICHT[1]) * t;
                c[2] = SEICHT[2] + (TIEF[2] - SEICHT[2]) * t;
                const s = 0.78 + 0.3 * licht;
                c[0] *= s;
                c[1] *= s;
                c[2] *= s;
                // der Saum: Wasser neben Land
                let land = false;
                for (const [di, dj] of [
                    [1, 0],
                    [-1, 0],
                    [0, 1],
                    [0, -1],
                ]) {
                    const a = i + di;
                    const b = j + dj;
                    if (a >= 0 && b >= 0 && a < n && b < n && H[a + b * n] > wl) land = true;
                }
                if (land) {
                    c[0] = c[0] * 0.55 + 196 * 0.45;
                    c[1] = c[1] * 0.55 + 218 * 0.45;
                    c[2] = c[2] * 0.55 + 214 * 0.45;
                }
            } else {
                stufe(h - wl, c);
                const w = Math.atan(Math.hypot(hx, hz)) * DEG;
                const fels = glatt(28, 46, w);
                const kliff = glatt(52, 66, w);
                for (let q = 0; q < 3; q++) {
                    c[q] += (FELS[q] - c[q]) * fels;
                    c[q] += (KLIFF[q] - c[q]) * kliff;
                }
                const sn = G.schnee(L, h);
                for (let q = 0; q < 3; q++) c[q] += (SCHNEE[q] - c[q]) * sn;
                if (schneeAus) schneeAus[k] = Math.round(255 * sn);
                const s = 0.3 + 0.95 * licht;
                c[0] *= s;
                c[1] *= s;
                c[2] *= s;
                // Höhenlinien je 20 m (eine Zelle breit, wo die Stufe zum Nachbarn wechselt)
                const st = Math.floor((h - wl) / 20);
                if (
                    (i + 1 < n && Math.floor((H[k + 1] - wl) / 20) !== st) ||
                    (j + 1 < n && Math.floor((H[k + n] - wl) / 20) !== st)
                ) {
                    c[0] *= 0.86;
                    c[1] *= 0.86;
                    c[2] *= 0.86;
                }
            }
            px[k * 4] = c[0];
            px[k * 4 + 1] = c[1];
            px[k * 4 + 2] = c[2];
            px[k * 4 + 3] = 255;
        }
    return px;
}

async function schichtBaender(L, id, spur) {
    const ort = G.schichtOrt(L, -8000, -8000, 8000, 8000);
    if (!ort) return { ort: null, baender: null };
    const fn = 301;
    const HF = new Float64Array(fn * fn);
    const maske = new Uint8Array(fn * fn);
    let t = performance.now();
    for (let j = 0; j < fn; j++) {
        for (let i = 0; i < fn; i++) {
            const x = ort.x - 300 + i * 2;
            const z = ort.z - 300 + j * 2;
            HF[i + j * fn] = G.hoehe(L, x, z, true);
            maske[i + j * fn] = G.grossform(L, x, z).stil >= 0.8 ? 1 : 0;
        }
        if (performance.now() - t > 16) {
            await pause();
            if (id !== juengste[spur]) return null;
            t = performance.now();
        }
    }
    return { ort, baender: G.hangBaender(HF, fn, 2, maske) };
}

async function rechne(id, spur, abbild, stufen) {
    const L = G.lageAus(abbild, self.SimplexNoise);
    if (stufen.includes("grob")) {
        const R = RASTER.grob;
        const H = await raster(L, R, id, spur);
        if (!H) return;
        const px = faerbe(H, R.n, R.schritt, L);
        self.postMessage({ id, stufe: "grob", n: R.n, px }, [px.buffer]);
    }
    const R = RASTER.voll;
    const H = await raster(L, R, id, spur);
    if (!H) return;
    const schneeKarte = new Uint8Array(R.n * R.n);
    const px = faerbe(H, R.n, R.schritt, L, schneeKarte);
    const benannt = G.benannteSeen(L, R.x0, R.x0, R.schritt, R.n);
    const statistik = G.statistik(H, R.n, R.schritt, L.waterLevel, benannt, RAND);
    const voll = {
        id,
        stufe: "voll",
        n: R.n,
        raster: { n: R.n, schritt: R.schritt, x0: R.x0 },
        px,
        statistik,
        urteil: G.urteil(statistik, null),
        // der Schnee, den die Karte malt, je Zelle (0…255) — die Studio-Probe hält ihn gegen die Boden-Farbe der Welt
        schneeKarte,
        schneeFarbe: SCHNEE.slice(),
        rasterSha: await sha(H),
        makroSha: await makroSha(L),
    };
    if (id !== juengste[spur]) return;
    self.postMessage(voll, [px.buffer]);
    const sb = await schichtBaender(L, id, spur);
    if (!sb || id !== juengste[spur]) return;
    self.postMessage({
        id,
        stufe: "schicht",
        ort: sb.ort,
        baender: sb.baender,
        urteil: G.urteil(statistik, sb.baender),
    });
}

self.onmessage = (ev) => {
    const m = ev.data || {};
    if (m.art === "farbe") {
        SCHNEE = hexRgb(m.schnee);
        return;
    }
    if (m.art === "abdruck") {
        // Der Abdruck einer beliebigen Lage (die Probe: ein Schritt am Regler MUSS ihn ändern).
        try {
            makroSha(G.lageAus(m.lage, self.SimplexNoise)).then((s) =>
                self.postMessage({ id: m.id, stufe: "abdruck", makroSha: s })
            );
        } catch (e) {
            self.postMessage({ id: m.id, stufe: "fehler", grund: String((e && e.message) || e) });
        }
        return;
    }
    const spur = m.spur === "A" ? "A" : "B";
    juengste[spur] = m.id;
    rechne(m.id, spur, m.lage, m.stufen || ["grob"]).catch((e) =>
        self.postMessage({ id: m.id, stufe: "fehler", grund: String((e && e.message) || e) })
    );
};
