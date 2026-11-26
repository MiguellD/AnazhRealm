// faecher.cjs — DER FÄCHER: die EINE Probe-Bauart der Augen-Sprossen (R11, vision/REGELN.md). Eine Station der Punkte-Maschine schießt
// EIN Bild an EINER Pose (Deckel 60 s je Leiter); ein Blind-Blatt braucht ≥ 40 Paare (Isola et al. 2017: 40 Urteile je Sitzung nach
// 10 Übungen). Der Fächer schießt darum je Sprosse ≥ 40 Posen aus dem GESETZ ihrer Station — dieselbe Seiten-Funktion, dieselbe
// Formel der Pose, aufgefächert über die Adressen (Häuser, Äcker), Richtungen und Tageszeiten, die das Gesetz hergibt; gezählt und
// wiederholbar, nie von Hand gesucht. Gibt das Gesetz an < 40 Posen das Motiv her, ist das Urteil „Umfang nicht erzeugbar: n von
// 40“ mit Datei:Zeile — keine gestellte Pose, kein Ersatz-Motiv. Je Bild ≥ 720 Zeilen (am PNG gelesen) und eine Akte (sha, Gerät,
// Ort, Saat, Pose, Uhr).
//
//   node vision/pruefer/faecher.cjs start   --spiel <Spiel-Baum am Kopf> --aus <Ordner außerhalb> [--ort dorf] [--port 4631] [--seite-port 4611]
//   node vision/pruefer/faecher.cjs schiesse --sprosse <leiter#n>[,<leiter#n>…] --spiel <Baum> --aus <Ordner> [--port 4631] [--lauf-s 270]
//   node vision/pruefer/faecher.cjs stop    --aus <Ordner> [--port 4631]
//   node vision/pruefer/faecher.cjs --selftest
//
// `start` fährt den eigenen save-server (eigener Port) und die Werkbank `--echt --seite` an ihm (eigene PIDs in <aus>/sitzung.json),
// stellt an den Messort und prüft Seite, Version und Schirm; zwischen den Befehlen ruht der Loop der Werkbank. `schiesse` nimmt die
// Posen der Sprosse aus der Seite, schießt, was fehlt (ein vorhandenes Bild bleibt), und endet vor `--lauf-s`. Jeder Befehl läuft
// unter dem GPU-Schloss (meisterkarte-quelle/punkte/werkzeug/gpu-lauf.sh, ≤ 5 min); `stop` beendet nur die eigenen PIDs.
// Danach: paare.cjs --spiel <aus>/<leiter.n>/bild.
"use strict";
const fs = require("fs");
const path = require("path");
const http = require("http");
const crypto = require("crypto");
const { spawn, execFileSync } = require("child_process");

const MIN = 40; // Paare je Blatt (pruefer.cjs MIN_PAARE)
const MAX = 44; // der Fächer schießt, bis 44 Bilder das Motiv tragen: Dubletten und dunkle Bilder kosten kein Blatt
// DAS MOTIV IM BILD: die Abnahme der Werkbank (/bild: Blickziel frei, Sicht frei) ist der Richter des Spiels — ein Bild, dessen Ziel
// hinter Gelände liegt oder dessen Sicht Laub verdeckt, trägt das Motiv nicht und zählt nicht (es liegt unter nicht/, mit Akte)
const GRUEN = (abnahme) => /ABNAHME GRÜN/.test(abnahme);
// AN DER POSE: die Werkbank sucht ohne `wahl: 0` bis zu 42 Kameras um ein verdecktes Ziel (scripts/werkbank.cjs `__blickWahl`) und
// schießt dort — „Blick-Wahl N Posen“ mit N ≥ 2 heißt: das Bild steht NICHT an der Pose des Gesetzes (wiese 26.11.: 16 von 45
// tragenden Pflanzen-Bildern, die Kamera 3–18 m näher, die Krone wieder angeschnitten). Ein Rahmen-Bild zählt nur an seiner Pose.
const AN_DER_POSE = (abnahme) => !/Blick-Wahl ([2-9]|\d\d+) Posen/.test(abnahme);
const ZEILEN = 720;
// die Tageszeiten des Fächers: Tag zwischen 07:55 und 16:05 (die Stationen schießen am Mittag oder zur Uhr der Sitzung)
const UHREN = [0.5, 0.4, 0.6, 0.33, 0.67, 0.45, 0.55, 0.36, 0.64];
const STATIONEN = path.join(__dirname, "..", "..", "meisterkarte-quelle", "punkte", "stationen");

// die Seiten-Funktionen einer Stations-Datei (ihr `seite: { … }` je Leiter) — der Fächer ruft das Gesetz der Station, nie eine Abschrift
function stationsSeite(datei) {
    const defs = {};
    const F = new Proxy({}, { get: (_, k) => (k === "leiter" ? (id, def) => ((defs[id] = def), { id }) : () => ({})) });
    const m = require(path.join(STATIONEN, datei));
    if (typeof m === "function") m(F);
    return defs;
}
const seiteVon = (datei, leiter, name) => {
    const d = stationsSeite(datei)[leiter];
    if (!d || !d.seite || typeof d.seite[name] !== "function") throw new Error("Gesetz fehlt: " + datei + " trägt an " + leiter + " keine Seiten-Funktion " + name);
    return String(d.seite[name]);
};
// die Seiten-Funktion STADT mit ihrer eigenen Zählung je Richtung: drei Zeilen ihres Ortsrands, am Wortlaut gefasst (ändert die Station
// sie, wirft der Fächer beim Namen statt still eine andere Zählung zu fahren)
function stadtAlle() {
    let s = seiteVon("k2-mensch-stadt.js", "mensch.stadt.groesse", "STADT");
    for (const [a, b] of [
        ["for (let i = 0; i < 8; i++) {", "for (let i = 0; i < 16; i++) {"],
        ["const a = (i * Math.PI) / 4;", "const a = (i * Math.PI) / 8;"],
        ["if (!best || L.length > best.L.length) best = { P, L, grad: i * 45 };", "if (!best || L.length > best.L.length) best = { P, L, grad: i * 22.5 }; (aus.alle = aus.alle || []).push({ P, n: L.length, grad: i * 22.5 });"],
    ]) {
        if (!s.includes(a)) throw new Error("Gesetz fehlt: k2-mensch-stadt.js trägt die Zeile des Ortsrands nicht mehr („" + a + "“)");
        s = s.replace(a, () => b);
    }
    return s;
}
// die Namen der Arten als Gattung (die Klasse im Blatt; der Schlüssel ist die Art des Gesetzes, k2-leben.js:162)
const PFLANZEN_NAME = { baum_birke: "Birke", baum_buche: "Buche", baum_eiche: "Eiche", baum_erle: "Erle", baum_kiefer: "Kiefer", baum_palme: "Palme", baum_tanne: "Tanne", baum_zypresse: "Zypresse", baum_mammut: "Mammutbaum", baum_totholz: "Totholz", baum_karst: "Karst-Baum", busch_hazel: "Hasel", farn_busch: "Farn", blume_gross: "Blume" };
const SAAT = "const saat = r.state.worldMeta && r.state.worldMeta.seed != null ? r.state.worldMeta.seed : null;";
// die Reise in der Seite: derselbe Weg wie scripts/werkbank.cjs reiseDesOrts (Satz → `_chatDispatchLegacyCommand` → die Welt des Orts
// erwacht → der Faden bereit), der Loop danach wieder aus
const REISE =
    "const reise = async (satz) => { const t0 = performance.now(), [b, l] = satz.split(/\\s+/).slice(1).map((s) => Math.round(Number(s.replace(',', '.')) * 100) / 100);" +
    " const da = () => { const t = r._gelaende().ort.teil; return !!t && t.breite === b && t.laenge === l; }; if (da()) return { neu: false }; const aus = []; window.__loop(1);" +
    " try { r._chatDispatchLegacyCommand(satz, null, (z) => aus.push(z)); await window.__weltDa(() => aus.length > 0);" +
    "  if (!aus.some((z) => Array.isArray(z) && z[0] === 'chat.befehl.reise.ziel')) return { fehler: JSON.stringify(aus).slice(0, 300) };" +
    "  if ((await r.erwacht) === false) return { fehler: 'die Welt des Orts erwacht nicht' }; await window.__weltDa(() => r.state.voxelWorkerReady); } finally { window.__loop(); }" +
    " if (!da()) return { fehler: 'die Seite steht danach nicht an ' + b + ' ' + l }; return { neu: true, welt: r.state.worldMeta.worldId, ms: Math.round(performance.now() - t0) }; };";
// DER RAHMEN DES MOTIVS (die EINE Pose jedes Ding-Motivs: Pflanze, Haus): das ganze Ding im Bild, freie Sicht. Kanonische Ansicht nach
// Palmer, Rosch & Chase 1981 / Blanz, Tarr & Bülthoff 1999: Verdeckung wird gemieden, 30–45° neben der Front, Blick knapp über Grund
// (12–15° Höhe) — Band hier: die Höhe des Dings füllt 1/1,3 der Bildhöhe (15 % Rand je Seite), Blick auf halbe Höhe, Neigung ≤ 30°,
// das Auge 1,7 m über dem Gelände, unter keinem Dach; frei heißt: kein Strahl Auge → Mitte · Scheitel · Fuß trifft Gelände oder Bau
// vor dem Ding (`_fieldRaycast`, die Bauten ohne das Ziel selbst) und keine Krone der Kronen-Karte (`wegeKarte.kronen`, Radius
// `_kronenRadiusFuer`, Scheitel `_kronenOben`) steht im Kegel vom Auge zum Umriss des Dings über dessen unterem Sehstrahl.
// T = { x, z, y0 (Fuß), h (Höhe), rad (halbe Breite), ohne (der Eintrag des Ziels) }; mehr = weitere Hindernisse { x, z, rad, oben }
const RAHMEN =
    "const RW = r.state, VF = RW.camera.fov * Math.PI / 180, HF = 2 * Math.atan(Math.tan(VF / 2) * 1280 / 720), RAND = 1.3, NEIG = 30 * Math.PI / 180;" +
    "const KR = []; { const wk = RW.wegeKarte; if (wk && wk.kronen) for (const c of wk.kronen.values()) KR.push({ x: c[0], z: c[1], rad: c[2], oben: r._kronenOben(c) }); }" +
    "const rahmen = (T, az, mehr) => {" +
    " const d = T.rad + Math.max(RAND * T.h / (2 * Math.tan(VF / 2)), RAND * T.rad / Math.tan(HF / 2), 2);" +
    " const ex = T.x + Math.cos(az) * d, ez = T.z + Math.sin(az) * d, ey = r.getTerrainHeightAt(ex, ez) + 1.7, ly = T.y0 + T.h / 2;" +
    " const aus = { frei: false, az, d, pose: { px: +ex.toFixed(2), py: +ey.toFixed(2), pz: +ez.toFixed(2), lx: +T.x.toFixed(2), ly: +ly.toFixed(2), lz: +T.z.toFixed(2) } };" +
    " if (Math.abs(Math.atan2(ly - ey, d)) > NEIG) return Object.assign(aus, { grund: 'Neigung' });" +
    " const dach = r._fieldRaycast(ex, ey + 40, ez, ex, ey + 0.2, ez, { gelaende: false, durchPflanzen: true }); if (dach && dach.hit) return Object.assign(aus, { grund: 'Dach' });" +
    " for (const ty of [ly, T.y0 + T.h * 0.95, T.y0 + Math.min(0.6, T.h * 0.3)]) { const q = r._fieldRaycast(ex, ey, ez, T.x, ty, T.z, { durchPflanzen: true, ohne: T.ohne || null });" +
    "  if (q && q.hit && Math.hypot(q.x - T.x, q.z - T.z) > T.rad + 1) return Object.assign(aus, { grund: 'Strahl' }); }" +
    " const L2 = Math.hypot(T.x - ex, T.z - ez), ux = (T.x - ex) / L2, uz = (T.z - ez) / L2; let n = 0;" +
    " for (const c of (mehr || []).concat(KR)) { if (Math.abs(c.x - T.x) > d + 30 || Math.abs(c.z - T.z) > d + 30 || Math.hypot(c.x - T.x, c.z - T.z) < 0.6) continue;" +
    "  const vx = c.x - ex, vz = c.z - ez, t = vx * ux + vz * uz; if (t <= -c.rad || t >= L2 - T.rad * 0.5) continue;" +
    "  const tt = Math.max(0, t), p = Math.abs(vx * uz - vz * ux); if (p >= c.rad + (tt / L2) * T.rad * 1.15) continue;" +
    "  if (Number.isFinite(c.oben) && c.oben < ey + (T.y0 - ey) * tt / L2) continue; n++; }" +
    " return Object.assign(aus, { frei: n === 0, n, grund: n ? 'Krone' : null }); };";
// DAS PROFIL-GESETZ DES FORMSCHATZES (k2-planet.js:2662 PROFIL_AN, im Rumpf der Planet-Probe, kein `seite`-Export): am Wortlaut aus der
// Station gefasst — der Querschnitt je Saat × Stelle, die Klasse V-Tal/Trog aus dem Exponenten b; dazu die Richtung des Laufs (talauf)
// und die Lagen der 20 Saaten (k2-planet.js:2610 lagePunkt, :2613 die Land-Orte). Ändert die Station den Wortlaut, wirft der Fächer
function formschatzGesetz() {
    const t = fs.readFileSync(path.join(STATIONEN, "k2-planet.js"), "utf8");
    const a = t.indexOf("const formschatz = {");
    const fang = (von, bis, ab) => {
        const i = t.indexOf(von, ab), j = i < 0 ? -1 : t.indexOf(bis, i);
        if (i < 0 || j < 0) throw new Error("Gesetz fehlt: k2-planet.js trägt „" + von.slice(0, 50) + "“ nicht mehr");
        return t.slice(i, j);
    };
    const p0 = t.indexOf("const PROFIL_AN = ", a);
    if (a < 0 || p0 < 0) throw new Error("Gesetz fehlt: k2-planet.js trägt PROFIL_AN im Formschatz nicht mehr");
    let profil = fang("async (r, T, a, mit) => {", "\n                const zahl = (aus, f)", p0).trim().replace(/;$/, "");
    const alt = "y: R3(h0) };";
    if (!profil.includes(alt)) throw new Error("Gesetz fehlt: PROFIL_AN gibt „" + alt + "“ nicht mehr zurück");
    profil = profil.replace(alt, () => "y: R3(h0), fx: q.fx, fz: q.fz, ly: R3(K.hoehe(L, q.x - q.fx * 60, q.z - q.fz * 60, true)) };");
    return { profil, punkt: fang("const lagePunkt = (k) =>", "\n", a), orte: fang("for (let k0 = 0; orte.length < 50 && k0 < 2000;", "\n", a) };
}

// JE SPROSSE: der Messort, die Zeile des Gesetzes, der Rumpf in der Seite (r = Welt, T = THREE) → { saat, posen: [{ pose, wort }], lage }
const SPROSSEN = {
    // der Ortsrand: die Station nimmt von 8 Richtungen die mit den meisten Häusern im Kegel der Kamera (k2-mensch-stadt.js:224–236,
    // ihr `imBlick`) — der Fächer nimmt 16 Richtungen desselben Kreises (R + 20 m, 8 m über Grund, Blick auf die Mitte) und nennt je
    // Richtung dieselbe Zählung. Sie kennt keine Verdeckung (Radeon 26.11.: „10 Häuser im Bild“ bei 67,5°, das Bild zeigt Wald):
    // das Motiv richtet die Abnahme der Werkbank — die Mitte frei, oder ein Haus des Weilers davor
    "mensch.stadt.groesse#1": {
        ort: "dorf",
        gesetz: "meisterkarte-quelle/punkte/stationen/k2-mensch-stadt.js:224",
        faecher: "16 Richtungen um die Mitte der Häuser × Tageszeit",
        mehr: { wahl: 0 },
        motiv: (a) => GRUEN(a) || /Blickziel verdeckt von (an Punkt \d+ )?bauSatz/.test(a),
        rumpf: () =>
            SAAT +
            "const D = await (" + stadtAlle() + ")(r, T, { rand: true });" +
            "if (!D || D.fehler || !D.rand || !D.alle) return { saat, posen: [], lage: (D && D.fehler) || 'kein Ortsrand' };" +
            "const posen = D.alle.map((x) => ({ pose: x.P, wort: 'Ortsrand ' + x.grad + ' Grad, ' + x.n + ' Häuser im Bild' }));" +
            "return { saat, posen, lage: 'R ' + D.rand.R + ' m, stehend ' + D.steht + ' von ' + D.slots + ', Häuser im Bild je Richtung ' + D.alle.map((x) => x.n).join(' ') };",
    },
    // 10 m vor der Tür: die Station nimmt das erste Wohnhaus mit Tür (k2-mensch-bau.js:73–74), der Fächer jedes stehende Haus mit Tür
    // des nächsten Orts (dieselbe Formel: Tür, Richtung Mitte → Tür, Auge 1,7 m, Blick 2,5 m über dem Fuß)
    "mensch.bau.huelle#1": {
        ort: "dorf",
        gesetz: "meisterkarte-quelle/punkte/stationen/k2-mensch-bau.js:74",
        faecher: "jedes stehende Haus mit Tür des nächsten Orts × Tageszeit",
        mehr: {},
        // das Blickziel ist die Mitte des Hauses: seine eigene Wand davor IST das Motiv; Gelände, Laub oder Fels davor nicht
        motiv: (a) => GRUEN(a) || /Blickziel verdeckt von (an Punkt \d+ )?bauSatz/.test(a),
        rumpf: () =>
            SAAT +
            "const s = r.state, pm = s.playerMesh.position, hh = (x, z) => r.getTerrainHeightAt(x, z), steht = new Map();" +
            "for (const e of s.architectures || []) if (e && Number.isFinite(e.seed) && e.position) steht.set((e.seed >>> 0) + '@' + Math.round(e.position.x) + ',' + Math.round(e.position.z), e);" +
            "const orte = [];" +
            "for (const S of (r._bewohnerSiedlungen || new Map()).values()) { if (!S || !S.plan || !Array.isArray(S.plan.slots)) continue; const H = [];" +
            " for (const sl of S.plan.slots) { const wx = S.ox + sl.x, wz = S.oz + sl.z, e = steht.get((sl.seed >>> 0) + '@' + Math.round(wx) + ',' + Math.round(wz)); if (!e || !e.tuer) continue;" +
            "  const c = Math.cos(sl.phi || 0), sn = Math.sin(sl.phi || 0), tu = sl.tuer || { x: 0, z: 0 }, tx = wx + tu.x * c + tu.z * sn, tz = wz - tu.x * sn + tu.z * c;" +
            "  const mx = sl.obb ? S.ox + sl.obb.cx : wx, mz = sl.obb ? S.oz + sl.obb.cz : wz, ul = Math.hypot(tx - mx, tz - mz) || 1, ux = (tx - mx) / ul, uz = (tz - mz) / ul;" +
            "  H.push({ pose: { px: +(tx + ux * 10).toFixed(2), py: +(hh(tx + ux * 10, tz + uz * 10) + 1.7).toFixed(2), pz: +(tz + uz * 10).toFixed(2), lx: +wx.toFixed(2), ly: +(e.position.y + 2.5).toFixed(2), lz: +wz.toFixed(2) }," +
            "   wort: '10 m vor der Tür von ' + e.type + ' (' + (typeof sl.rolle === 'string' ? sl.rolle : 'wohnhaus') + ')' }); }" +
            " if (H.length) orte.push({ d: Math.hypot(S.ox - pm.x, S.oz - pm.z), H, name: S.plan.name || '?' }); }" +
            "orte.sort((a, b) => a.d - b.d); const nah = orte[0];" +
            "return { saat, posen: nah ? nah.H : [], lage: nah ? nah.name + ': ' + nah.H.length + ' Häuser mit Tür' : 'kein Haus mit Tür am Messort' };",
    },
    // der Rand des Ackers: die Station nimmt den nächsten gemalten Acker und schießt nur, wo er Halme der Frucht trägt
    // (k2-mensch-nahrung.js:724 und :746) — der Fächer jeden gemalten Acker, der Frucht trägt, an der Pose der Seiten-Funktion FRUCHT
    "mensch.nahrung.frucht#1": {
        ort: "dorf",
        gesetz: "meisterkarte-quelle/punkte/stationen/k2-mensch-nahrung.js:746",
        faecher: "jeder gemalte Acker mit Halmen der Frucht × Tageszeit",
        mehr: { wahl: 0 },
        rumpf: () =>
            SAAT +
            "const Z = await (" + seiteVon("k2-mensch-nahrung.js", "mensch.nahrung.frucht", "ZENSUS") + ")(r, T, {});" +
            "const F = (Z.felder || []).filter((f) => f.gemalt >= 0.6 && f.rand <= 0.2); const posen = []; let leer = 0;" +
            "for (const f of F) { let R = null; try { R = await (" + seiteVon("k2-mensch-nahrung.js", "mensch.nahrung.frucht", "FRUCHT") + ")(r, T, { feld: f }); } catch (e) { R = null; }" +
            " if (R && R.halme >= 1 && R.pose) posen.push({ pose: R.pose, wort: 'Acker ' + f.x + ',' + f.z + ': ' + R.halme + ' Strecken mit Halmen' }); else leer++; }" +
            "return { saat, posen, lage: (Z.felder || []).length + ' Äcker, gemalt ' + F.length + ', ohne Halme der Frucht ' + leer };",
    },
    // der Erntetag: die Station schießt nur, wo um 10 Uhr ≥ 50 Bewohner am Acker stehen (k2-mensch-nahrung.js:1015–1018) — der Fächer
    // jeden Acker aus seinen vier Diagonalen (12 m), 10 Uhr; unter 50 trägt das Gesetz das Motiv an keiner Pose
    "mensch.nahrung.hand#3": {
        ort: "dorf",
        gesetz: "meisterkarte-quelle/punkte/stationen/k2-mensch-nahrung.js:1016",
        faecher: "jeder Acker × 4 Diagonalen, 10 Uhr",
        mehr: { uhr: 10 / 24 },
        uhren: [10 / 24],
        rumpf: () =>
            SAAT +
            "const Z = await (" + seiteVon("k2-mensch-nahrung.js", "mensch.nahrung.hand", "ZENSUS") + ")(r, T, {});" +
            "const posen = []; if (Z.feld10 >= 50) for (const f of Z.felder || []) for (const [a, b] of [[12, 12], [-12, 12], [12, -12], [-12, -12]])" +
            " posen.push({ pose: { px: f.x + a, py: '+1.7', pz: f.z + b, lx: f.x, ly: '+1.0', lz: f.z }, wort: 'Acker ' + f.x + ',' + f.z + ' aus ' + a + ',' + b });" +
            "return { saat, posen, lage: 'um 10 Uhr ' + Z.feld10 + ' am Acker (Soll der Station ≥ 50), ' + Z.bewohner + ' Bewohner, ' + (Z.felder || []).length + ' Äcker' };",
    },
    // ═══ ORDNEN × KLASSE (R11: der Prüfer nennt die Klasse eines Bilds, die Wahrheit sagt das Gesetz der Adresse) ═══
    // 50 Bauten nach Funktion: der Zensus der Station (k2-mensch-bau.js:30–49 zensusBau) zählt je Ort die stehenden Häuser seines
    // Plans mit ihrer Rolle (das Los trägt die Funktion, stamm/siedlung-ort.js:483) und setzt das Bild 10 m vor die Tür (:74) — der
    // Fächer nimmt JEDES stehende Haus mit Tür ALLER Orte des Messorts, die Rolle ist die Klasse, und rahmt das GANZE Haus (RAHMEN)
    // von der Tür-Seite 30–45° neben ihrer Achse (erst dann 0°, ±60°). Der erste Bogen „10 m vor der Tür“ (26.11.) zeigte an 13 von 25
    // Bildern kein benennbares Haus: das Auge in der Wand des Nachbarn, unter einem Scheunen-Dach, 20 m über dem Dach am Hang
    "mensch.bau.bedarf#1": {
        ort: "dorf",
        gesetz: "meisterkarte-quelle/punkte/stationen/k2-mensch-bau.js:38",
        faecher: "jedes stehende Haus mit Tür aller Orte, das ganze Haus im Bild (Höhe × 1,3, Blick auf halbe Höhe) von der Tür-Seite, freiester Azimut ±30/45/0/60°, Klassen im Wechsel × Tageszeit",
        ordner: "mensch.bau.bedarf.1-b2",
        frage: "Welche Funktion hat das Gebäude in der Bildmitte?",
        je: 12,
        mehr: {},
        wahl: 0,
        motiv: (a) => AN_DER_POSE(a) && (GRUEN(a) || /Blickziel verdeckt von (an Punkt \d+ )?bauSatz/.test(a)),
        rumpf: () =>
            SAAT +
            "const s = r.state, pm = s.playerMesh.position, hh = (x, z) => r.getTerrainHeightAt(x, z), steht = new Map(), gross = (t) => t.charAt(0).toUpperCase() + t.slice(1);" +
            "for (const e of s.architectures || []) if (e && Number.isFinite(e.seed) && e.position) steht.set((e.seed >>> 0) + '@' + Math.round(e.position.x) + ',' + Math.round(e.position.z), e);" +
            RAHMEN +
            "const H = [], orte = [], gruende = {}; let ohneGestalt = 0, ohneFrei = 0;" +
            "for (const S of (r._bewohnerSiedlungen || new Map()).values()) { if (!S || !S.plan || !Array.isArray(S.plan.slots)) continue; let n = 0;" +
            " for (const sl of S.plan.slots) { const wx = S.ox + sl.x, wz = S.oz + sl.z, e = steht.get((sl.seed >>> 0) + '@' + Math.round(wx) + ',' + Math.round(wz)); if (!e || !e.tuer) continue;" +
            "  const rolle = typeof sl.rolle === 'string' ? sl.rolle : 'wohnhaus';" +
            "  const c = Math.cos(sl.phi || 0), sn = Math.sin(sl.phi || 0), tu = sl.tuer || { x: 0, z: 0 }, tx = wx + tu.x * c + tu.z * sn, tz = wz - tu.x * sn + tu.z * c;" +
            "  const mx = sl.obb ? S.ox + sl.obb.cx : wx, mz = sl.obb ? S.oz + sl.obb.cz : wz, ul = Math.hypot(tx - mx, tz - mz) || 1, ux = (tx - mx) / ul, uz = (tz - mz) / ul;" +
            "  const B = e.mesh ? new T.Box3().setFromObject(e.mesh) : null; if (!B || B.isEmpty()) { ohneGestalt++; continue; }" +
            "  const Z = { x: (B.min.x + B.max.x) / 2, z: (B.min.z + B.max.z) / 2, y0: e.position.y, h: B.max.y - e.position.y, rad: Math.hypot(B.max.x - B.min.x, B.max.z - B.min.z) / 2, ohne: e }, a0 = Math.atan2(uz, ux);" +
            "  let f = null; for (const w of [-30, 30, -45, 45, 0, -60, 60]) { const g = rahmen(Z, a0 + w * Math.PI / 180); if (g.frei) { f = g; break; } gruende[g.grund] = (gruende[g.grund] || 0) + 1; }" +
            "  if (!f) { ohneFrei++; continue; }" +
            "  n++; H.push({ d: Math.hypot(wx - pm.x, wz - pm.z), klasse: gross(rolle), pose: f.pose," +
            "   wort: e.type + ' (' + rolle + ') in ' + (S.plan.name || '?') + ', H ' + Z.h.toFixed(1) + ' m, Auge ' + f.d.toFixed(1) + ' m, ' + Math.round((f.az - a0) * 180 / Math.PI) + '° neben der Tür-Achse' }); }" +
            " if (n) orte.push((S.plan.name || '?') + ' ' + n); }" +
            "H.sort((a, b) => a.d - b.d); const je = {}; for (const h of H) je[h.klasse] = (je[h.klasse] || 0) + 1;" +
            "return { saat, posen: H, lage: H.length + ' Häuser mit Tür gerahmt in ' + orte.length + ' Orten (' + orte.join(', ') + ') · Rollen ' + JSON.stringify(je) + ' · ohne Gestalt ' + ohneGestalt + ' · ohne freien Azimut ' + ohneFrei + ' · Gründe ' + JSON.stringify(gruende) };",
    },
    // der Raum hinter der Tür: die Station zählt die Werk-Bauten der vollen Stadt (jedes Haus mit Tür, dessen Rolle weder Wohnhaus
    // noch Scheune ist, k2-mensch-bau.js:79) und stellt das Auge 1,6 m hinter die Tür, 1,4 m über dem Grund, Blick 7 m ins Haus (:77) —
    // der Fächer nimmt JEDEN Werk-Bau mit Tür an derselben Pose, die Rolle ist die Klasse
    "mensch.bau.innen#3": {
        ort: "stadt-voll",
        gesetz: "meisterkarte-quelle/punkte/stationen/k2-mensch-bau.js:77",
        faecher: "jeder Werk-Bau mit Tür aller Orte, in der Tür (k2-mensch-bau.js:77), Klassen im Wechsel × Tageszeit",
        frage: "Welcher Raum ist das — wozu dient das Haus, in dessen Tür die Kamera steht?",
        je: 12,
        mehr: {},
        // die Kamera steht IN der Tür: die eigene Wand des Hauses (bauSatz) vor dem Blickziel ist das Motiv
        motiv: (a) => GRUEN(a) || /Blickziel verdeckt von (an Punkt \d+ )?bauSatz/.test(a),
        rumpf: () =>
            SAAT +
            "const s = r.state, pm = s.playerMesh.position, steht = new Map(), gross = (t) => t.charAt(0).toUpperCase() + t.slice(1);" +
            "for (const e of s.architectures || []) if (e && Number.isFinite(e.seed) && e.position) steht.set((e.seed >>> 0) + '@' + Math.round(e.position.x) + ',' + Math.round(e.position.z), e);" +
            "const H = []; let werk = 0;" +
            "for (const S of (r._bewohnerSiedlungen || new Map()).values()) { if (!S || !S.plan || !Array.isArray(S.plan.slots)) continue;" +
            " for (const sl of S.plan.slots) { const wx = S.ox + sl.x, wz = S.oz + sl.z, e = steht.get((sl.seed >>> 0) + '@' + Math.round(wx) + ',' + Math.round(wz)); if (!e || !e.tuer) continue;" +
            "  const rolle = typeof sl.rolle === 'string' ? sl.rolle : 'wohnhaus'; if (rolle === 'wohnhaus' || rolle === 'scheune') continue; werk++;" +
            "  const c = Math.cos(sl.phi || 0), sn = Math.sin(sl.phi || 0), tu = sl.tuer || { x: 0, z: 0 }, tx = wx + tu.x * c + tu.z * sn, tz = wz - tu.x * sn + tu.z * c;" +
            "  const mx = sl.obb ? S.ox + sl.obb.cx : wx, mz = sl.obb ? S.oz + sl.obb.cz : wz, ul = Math.hypot(tx - mx, tz - mz) || 1, ux = (tx - mx) / ul, uz = (tz - mz) / ul, y = e.position.y;" +
            "  H.push({ d: Math.hypot(wx - pm.x, wz - pm.z), klasse: gross(rolle), pose: { px: +(tx - ux * 1.6).toFixed(2), py: +(y + 1.4).toFixed(2), pz: +(tz - uz * 1.6).toFixed(2), lx: +(tx - ux * 7).toFixed(2), ly: +(y + 1.2).toFixed(2), lz: +(tz - uz * 7).toFixed(2) }, wort: 'in der Tür von ' + e.type + ' (' + rolle + ') in ' + (S.plan.name || '?') }); } }" +
            "H.sort((a, b) => a.d - b.d); const je = {}; for (const h of H) je[h.klasse] = (je[h.klasse] || 0) + 1;" +
            "return { saat, posen: H, lage: werk + ' Werk-Bauten mit Tür · Rollen ' + JSON.stringify(je) };",
    },
    // die Gattung: die Station zählt den Bestand am Spieler — Bauten der Art baum_/busch_/farn_/blume_ und die Zellen des Streuguts
    // (k2-leben.js:161–170), „10 Bilder je Gestalt“ — der Fächer rahmt jede Pflanze GANZ (RAHMEN: die Höhe aus der Sichthöhe, die das
    // Spiel stempelt, `_lodTreeVisHeight` am Eintrag, `_scatterSichtHoehe` an der Streu-Zelle; die Breite aus der Krone
    // `_kronenRadiusFuer`, ohne Krone die halbe Höhe) aus dem freiesten von 8 Azimuten; ohne freien Azimut fällt die Pflanze aus. Je Art
    // höchstens 10 Bilder; trägt eine Art binnen 250 m weniger als 10 Pflanzen, nimmt der Fächer mehrere freie Azimute derselben.
    // Blatt 1 (Ego 12 m / 4 m zum Spieler) urteilte der Prüfer 7 von 40: die Krone abgeschnitten, fremde Stämme davor — die Pose war der Täter.
    "leben.pflanzen.arten#1": {
        ort: "wiese",
        gesetz: "meisterkarte-quelle/punkte/stationen/k2-leben.js:161",
        faecher: "je Art bis 10 Pflanzen des Bestands binnen 250 m, die ganze Pflanze im Bild (Höhe × 1,3, Blick auf halbe Höhe) aus dem freiesten von 8 Azimuten, seltene Arten mit mehreren Azimuten, Mittag",
        frage: "Welche Pflanzen-Gattung steht in der Bildmitte?",
        ordner: "leben.pflanzen.arten.1-b2",
        je: 10,
        max: 124,
        wahl: 0,
        uhren: [0.5],
        mehr: {},
        // das Ziel ist die Pflanze selbst: ihr eigenes Laub nahe am Ziel IST das Motiv, fremdes Laub oder Gelände davor nicht
        motiv: (a, P) => {
            if (!AN_DER_POSE(a)) return false;
            if (GRUEN(a)) return true;
            const m = /Blickziel verdeckt von (?:an Punkt \d+ )?Laub (\S+) in ([\d.]+) m/.exec(a);
            return !!(m && P && P.ziel && m[1].includes(P.ziel.art) && +m[2] >= P.ziel.d - 5 && !/Sicht verdeckt|Vordergrund/.test(a));
        },
        rumpf: () =>
            SAAT +
            RAHMEN +
            "const p = RW.playerMesh.position, art = (t) => String(t || '').replace(/^grown_/, '').replace(/_v[0-9]+$/, ''), pflanze = /^(baum_|busch_|farn_|blume_)/;" +
            "const NAME = " + JSON.stringify(PFLANZEN_NAME) + ";" +
            "const name = (sp) => NAME[sp] || (sp.split('_').slice(1).join(' ').replace(/^./, (c) => c.toUpperCase()) || sp);" +
            "const kr = (sp, roh, s) => r._kronenRadiusFuer(roh, s) || r._kronenRadiusFuer(sp, s) || null;" +
            "const L = [], gesehen = new Set(), ohneH = {};" +
            "const nimm = (sp, x, y, z, h, rad, ohne) => { const k = Math.round(x) + ',' + Math.round(z); if (gesehen.has(k)) return; gesehen.add(k); const d = Math.hypot(x - p.x, z - p.z); if (d > 250) return;" +
            " if (!(h > 0.1)) { ohneH[sp] = (ohneH[sp] || 0) + 1; return; } L.push({ sp, x, y, z, d, h, rad: rad > 0 ? rad : /^baum_/.test(sp) ? Math.max(0.5, 0.1 * h) : 0.5 * h, ohne }); };" +
            "for (const e of RW.architectures || []) { const sp = art(e._lodSpecies || e.type); if (!pflanze.test(sp) || !e.position) continue; nimm(sp, e.position.x, e.position.y, e.position.z, r._lodTreeVisHeight(e), kr(sp, e._lodSpecies || e.type, e.scale), e); }" +
            "for (const reg of (RW.scatterRegions || new Map()).values()) for (const c of reg.cells || []) { const sp = art(c.species); if (!((c.layer === 'tree' || c.layer === 'under') && pflanze.test(sp))) continue;" +
            " const sl = r._scatterLayerByName && r._scatterLayerByName.get(c.layer); let h = null;" +
            " if (sl) { const tf = r._scatterCellTransform(c.cellX, c.cellZ, c.cellM, sl.scaleBase, sl.scaleVar); h = r._scatterSichtHoehe(sl, c.species, c.cellX, c.cellZ, c.variantIndex, tf); }" +
            " nimm(sp, c.x, c.fuss && Number.isFinite(c.fuss.y) ? c.fuss.y : r.getTerrainHeightAt(c.x, c.z), c.z, h, kr(sp, c.species, c.scale), null); }" +
            // die Pflanzen ohne Krone der Karte (Busch, Farn, Blume) verdecken auch: sie stehen als Hindernis neben den Kronen
            "const NIEDER = L.map((q) => ({ x: q.x, z: q.z, rad: q.rad, oben: q.y + q.h }));" +
            "const sorte = {}; for (const q of L) (sorte[q.sp] = sorte[q.sp] || []).push(q);" +
            "const posen = [], je = {}, ohneFrei = {}, gruende = {};" +
            "const mach = (q, f) => ({ klasse: name(q.sp), ziel: { art: q.sp.split('_').slice(1).join('_'), d: +(f.d - q.rad).toFixed(1) }, pose: f.pose," +
            " wort: q.sp + ' H ' + q.h.toFixed(1) + ' m, Krone ' + q.rad.toFixed(1) + ' m, ' + Math.round(q.d) + ' m vom Spieler, Auge ' + f.d.toFixed(1) + ' m, Azimut ' + Math.round(f.az * 180 / Math.PI) + '°' });" +
            "for (const sp of Object.keys(sorte).sort()) { const Q = sorte[sp].sort((a, b) => a.d - b.d), selten = Q.length < 10, F = []; let n = 0, geprueft = 0;" +
            " for (const q of Q) { if (n >= 10 || geprueft >= 120) break; geprueft++; const T = { x: q.x, z: q.z, y0: q.y, h: q.h, rad: q.rad, ohne: q.ohne }, a0 = Math.atan2(p.z - q.z, p.x - q.x), R = [];" +
            "  for (let k = 0; k < 8; k++) { const f = rahmen(T, a0 + k * Math.PI / 4, NIEDER); if (f.frei) R.push(f); else gruende[f.grund] = (gruende[f.grund] || 0) + 1; }" +
            "  if (!R.length) { ohneFrei[sp] = (ohneFrei[sp] || 0) + 1; continue; }" +
            "  if (selten) F.push({ q, R }); else { n++; posen.push(mach(q, R[0])); } }" +
            " for (let i = 0; selten && n < 10 && i < 8; i++) for (const x of F) if (n < 10 && x.R[i]) { n++; posen.push(mach(x.q, x.R[i])); }" +
            " je[sp] = n + ' von ' + Q.length + (selten ? ' (selten)' : ''); }" +
            "return { saat, posen, lage: L.length + ' Pflanzen binnen 250 m mit Sichthöhe · Bilder je Art ' + JSON.stringify(je) + ' · ohne Sichthöhe ' + JSON.stringify(ohneH) + ' · ohne freien Azimut ' + JSON.stringify(ohneFrei) + ' · Gründe ' + JSON.stringify(gruende) + ' · fov ' + RW.camera.fov };",
    },
    // arm/reich: die Station misst die Wohnfläche der Wohnbauten der vollen Stadt (W × D × Geschosse aus dem Plan, k2-mensch-macht.js:
    // 511–519) und nennt arm das ärmste, reich das reichste Zehntel (:532–533) — der Fächer nimmt JEDES stehende Wohnhaus beider
    // Zehntel, das ganze Haus von der Tür-Seite gerahmt (RAHMEN, wie bau.bedarf#1 — die Fläche liest nur, wer das ganze Haus sieht),
    // das Zehntel ist die Klasse
    "mensch.macht.stand#1": {
        ort: "stadt-voll",
        gesetz: "meisterkarte-quelle/punkte/stationen/k2-mensch-macht.js:533",
        faecher: "jedes stehende Wohnhaus des ärmsten und des reichsten Zehntels, das ganze Haus im Bild (Höhe × 1,3, Blick auf halbe Höhe) von der Tür-Seite, freiester Azimut ±30/45/0/60°, Klassen im Wechsel × Tageszeit",
        ordner: "mensch.macht.stand.1-b2",
        frage: "Wohnt in dem Haus in der Bildmitte ein armer oder ein reicher Haushalt?",
        je: 30,
        mehr: {},
        wahl: 0,
        motiv: (a) => AN_DER_POSE(a) && (GRUEN(a) || /Blickziel verdeckt von (an Punkt \d+ )?bauSatz/.test(a)),
        rumpf: () =>
            SAAT +
            "const s = r.state, pm = s.playerMesh.position, hh = (x, z) => r.getTerrainHeightAt(x, z), steht = new Map();" +
            "for (const e of s.architectures || []) if (e && Number.isFinite(e.seed) && e.position) steht.set((e.seed >>> 0) + '@' + Math.round(e.position.x) + ',' + Math.round(e.position.z), e);" +
            RAHMEN +
            "const gruende = {}; let ohneGestalt = 0, ohneFrei = 0;" +
            "const plaene = [...(r._ortPlaene || new Map()).values()].filter((q) => q && q.ort && Array.isArray(q.slots) && Math.hypot(q.ort.x - pm.x, q.ort.z - pm.z) < 1500);" +
            "const WOHN = { wohnhaus: 1, patrizierhaus: 1, wohnturm: 1, pfarrhaus: 1, kontor: 1 }, haus = [];" +
            "for (const q of plaene) for (const sl of q.slots) { if (!WOHN[sl.rolle]) continue; const ov = sl.ov || {}; const fl = (ov.W || 2 * ((sl.obb && sl.obb.ex) || 3)) * (ov.D || 2 * ((sl.obb && sl.obb.ez) || 3)) * (ov.storeys || 1); haus.push({ q, sl, fl }); }" +
            "if (haus.length < 20) return { saat, posen: [], lage: haus.length + ' Wohnbauten in ' + plaene.length + ' Plänen' };" +
            "const f = haus.map((h) => h.fl).sort((a, b) => a - b), n = f.length, lo = f[Math.floor(n * 0.1)], hi = f[Math.ceil(n * 0.9) - 1], H = []; let ohne = 0;" +
            "for (const h of haus) { const k = h.fl <= lo ? 'arm' : h.fl >= hi ? 'reich' : null; if (!k) continue; const sl = h.sl, ox = h.q.ort.x, oz = h.q.ort.z, wx = ox + sl.x, wz = oz + sl.z, e = steht.get((sl.seed >>> 0) + '@' + Math.round(wx) + ',' + Math.round(wz)); if (!e || !e.tuer) { ohne++; continue; }" +
            " const c = Math.cos(sl.phi || 0), sn = Math.sin(sl.phi || 0), tu = sl.tuer || { x: 0, z: 0 }, tx = wx + tu.x * c + tu.z * sn, tz = wz - tu.x * sn + tu.z * c;" +
            " const mx = sl.obb ? ox + sl.obb.cx : wx, mz = sl.obb ? oz + sl.obb.cz : wz, ul = Math.hypot(tx - mx, tz - mz) || 1, ux = (tx - mx) / ul, uz = (tz - mz) / ul;" +
            " const B = e.mesh ? new T.Box3().setFromObject(e.mesh) : null; if (!B || B.isEmpty()) { ohneGestalt++; continue; }" +
            " const Z = { x: (B.min.x + B.max.x) / 2, z: (B.min.z + B.max.z) / 2, y0: e.position.y, h: B.max.y - e.position.y, rad: Math.hypot(B.max.x - B.min.x, B.max.z - B.min.z) / 2, ohne: e }, a0 = Math.atan2(uz, ux);" +
            " let fr = null; for (const w of [-30, 30, -45, 45, 0, -60, 60]) { const g = rahmen(Z, a0 + w * Math.PI / 180); if (g.frei) { fr = g; break; } gruende[g.grund] = (gruende[g.grund] || 0) + 1; } if (!fr) { ohneFrei++; continue; }" +
            " H.push({ d: Math.hypot(wx - pm.x, wz - pm.z), klasse: k, pose: fr.pose, wort: k + ': ' + sl.rolle + ' ' + Math.round(h.fl) + ' m² (Zehntel ≤ ' + Math.round(lo) + ' / ≥ ' + Math.round(hi) + ' m²), 10 m vor der Tür' }); }" +
            "H.sort((a, b) => a.d - b.d);" +
            "return { saat, posen: H, lage: n + ' Wohnbauten in ' + plaene.length + ' Plänen, Zehntel ≤ ' + Math.round(lo) + ' m² / ≥ ' + Math.round(hi) + ' m², stehend mit Tür arm ' + H.filter((x) => x.klasse === 'arm').length + ' · reich ' + H.filter((x) => x.klasse === 'reich').length + ', ohne stehendes Haus mit Tür ' + ohne + ', ohne Gestalt ' + ohneGestalt + ', ohne freien Azimut ' + ohneFrei + ' · Gründe ' + JSON.stringify(gruende) };",
    },
    // die Talform an 20 Saaten: die Station rechnet je Saat (Land-Lage der Fibonacci-Kugel) × Stelle 1/4 · 1/2 · 3/4 des größten Laufs
    // den Querschnitt (k2-planet.js:2662 PROFIL_AN, V-Tal b < 1,5 ≤ Trog) und nennt die Pose „Ego 8 m über der Sohle, Blick talauf“
    // (:2706) — der Fächer REIST je Saat an ihre Lage (der Satz des Spielers „reise <Breite> <Länge>“, wie die Werkbank ihre Reise-Orte
    // stellt) und schießt dort jede Stelle; die Klasse sagt das Profil-Gesetz der Adresse
    "planet.relief.formschatz#1": {
        ort: "wiese",
        gesetz: "meisterkarte-quelle/punkte/stationen/k2-planet.js:2686",
        faecher: "20 Land-Saaten × 3 Stellen des größten Laufs (k2-planet.js:2691), Ego 8 m über der Sohle, Blick 60 m talauf, je Saat eine Reise",
        frage: "Welche Talform zeigt das Bild?",
        mehr: {},
        motiv: GRUEN,
        rumpf: () => {
            const G = formschatzGesetz();
            return (
                SAAT +
                "const samen = r._planetSamen(); await r._fadenQuelle();" + G.punkt + "const orte = [];" + G.orte +
                "const punkte = orte.slice(0, 20).map((o) => [o.breite, o.laenge]), PROFIL_AN = " + G.profil + ", mit = { punkte, abstaende: [20, 40, 80, 160, 320, 640, 1280] }, posen = [], je = {}; let ohne = 0;" +
                "for (let s = 0; s < punkte.length; s++) for (const ort of [0.25, 0.5, 0.75]) { let w = null; try { w = await PROFIL_AN(r, T, { saat: s, ort }, mit); } catch (e) { w = null; } if (!w || !w.klasse) { ohne++; continue; }" +
                " const fl = Math.hypot(w.fx, w.fz) || 1, ux = -w.fx / fl, uz = -w.fz / fl, k = w.klasse === 'vtal' ? 'V-Tal' : 'Trogtal'; je[k] = (je[k] || 0) + 1;" +
                " posen.push({ klasse: k, reise: 'reise ' + punkte[s][0] + ' ' + punkte[s][1], pose: { px: w.x, py: +(w.y + 8).toFixed(2), pz: w.z, lx: +(w.x + ux * 60).toFixed(2), ly: +((Number.isFinite(w.ly) ? w.ly : w.y) + 2).toFixed(2), lz: +(w.z + uz * 60).toFixed(2) }, wort: 'Saat ' + s + ' (' + punkte[s].join(' ') + ') Stelle ' + ort + ': b ' + w.b + ', Aue ' + w.aue + ' m, Ego 8 m über der Sohle, Blick talauf' }); }" +
                "return { saat, posen, lage: punkte.length + ' Land-Saaten, ' + posen.length + ' Querschnitte (' + JSON.stringify(je) + '), ohne Lauf oder Profil ' + ohne };"
            );
        },
    },
    // die Glut: die Station setzt ihre Lava-Tat selbst und schießt am Spawn (k2-planet.js:1228); das Gesetz der Welt stellt keinen
    // Vulkan (kein Schlüssel am Planet-Faden, kein Leser eines Ausbruchs) — Adressen der Glut sind nur die Lava-Zellen, die die Welt trägt
    "planet.geologie.vulkan#1": {
        ort: "dorf",
        gesetz: "meisterkarte-quelle/punkte/stationen/k2-planet.js:1228",
        faecher: "jede Adresse, an der das Gesetz der Welt Glut stellt",
        mehr: {},
        rumpf: () =>
            SAAT +
            "await r._fadenQuelle(); const o = await r._planetAuftrag({ type: 'planet-ort', samen: r._planetSamen(), breite: 10, laenge: 20, zeitMa: 0 });" +
            "const namen = new Set(); for (let p = r; p && p !== Object.prototype; p = Object.getPrototypeOf(p)) for (const n of Object.getOwnPropertyNames(p)) namen.add(n);" +
            "const N = [...namen], leser = N.filter((n) => /vulkan|volcan|magma|ausbruch|eruption|roehre/i.test(n)), schl = Object.keys(o).sort().join(',') + ' · delta ' + Object.keys(o.delta || {}).sort().join(',');" +
            "return { saat, posen: [], lage: 'der Planet-Faden trägt ' + (/vulkan/.test(schl) ? 'einen' : 'keinen') + ' Vulkan (' + schl + '), die Welt ' + leser.length + ' Leser eines Ausbruchs; Glut steht nur an einer gesetzten Lava-Tat' };",
    },
};

// ───────────────────────── reine Teile (der Selbsttest fährt sie) ─────────────────────────
// der Fächer: die Posen des Gesetzes × Tageszeiten, Uhr um Uhr (geschossen wird, bis MAX Bilder das Motiv tragen); unter MIN ist
// der Umfang nicht erzeugbar
function faechern(basis, uhren, mehr) {
    const aus = [];
    // die KLASSE (ordnen × klasse): die Wahrheit des Gesetzes an der Adresse reist mit der Pose in die Akte — nie von Hand gesetzt
    for (const u of uhren) basis.forEach((b, i) => aus.push(Object.assign({ basis: i, pose: b.pose, wort: b.wort, mehr: Object.assign({}, mehr, { uhr: u }) }, b.klasse != null ? { klasse: b.klasse } : {}, b.ziel ? { ziel: b.ziel } : {}, b.reise ? { reise: b.reise } : {})));
    return aus;
}
// DIE KLASSEN IM WECHSEL: je Klasse die Adressen nach Abstand, dann Runde um Runde eine je Klasse (höchstens `je` je Klasse) — der
// Fächer schießt bis MAX Bilder das Motiv tragen; ohne Wechsel füllte die häufigste Klasse (das Wohnhaus) das Blatt allein
function imWechsel(basis, je) {
    const nach = new Map();
    for (const b of basis) (nach.get(b.klasse) || nach.set(b.klasse, []).get(b.klasse)).push(b);
    const aus = [];
    for (let k = 0; k < (je || Infinity); k++) {
        let mehr = false;
        for (const l of nach.values()) if (l[k]) (aus.push(l[k]), (mehr = true));
        if (!mehr) break;
    }
    return aus;
}
// eine Pose, deren Ziel hinter Gelände liegt, deren Sicht verdeckt ist oder deren Vordergrund das Bild füllt, bleibt es zu jeder Uhr
// (nie bei „kamm-krone“: die schwarzen Punkte, die das Spiel ab ≈ 2 min Sitzung über den Himmel zeichnet, sind kein Ort)
const ORT_FEST = (abnahme) => /verdeckt von (Gelände|Formation)|Sicht verdeckt|Vordergrund/.test(abnahme);
const umfang = (n, gesetz, lage) => (n >= MIN ? null : "Umfang nicht erzeugbar: " + n + " von " + MIN + " (" + gesetz + (lage ? " — " + lage : "") + ")");
// Breite und Zeilen eines PNG aus seinem Kopf (IHDR)
function pngMass(b) {
    if (!b || b.length < 24 || b.readUInt32BE(0) !== 0x89504e47) return null;
    return { breite: b.readUInt32BE(16), zeilen: b.readUInt32BE(20) };
}
const ordner = (s) => String(s).replace("#", ".");
const nr = (i) => String(i + 1).padStart(2, "0");
const sha256 = (b) => crypto.createHash("sha256").update(b).digest("hex");

// ───────────────────────── die Werkbank ─────────────────────────
const opt = (n, v) => {
    const i = process.argv.indexOf(n);
    return i > 0 && process.argv[i + 1] ? process.argv[i + 1] : v;
};
const ruf = (port, weg, nutzlast, ms) =>
    new Promise((res, rej) => {
        const req = http.request({ host: "127.0.0.1", port, path: weg, method: "POST", agent: false, headers: { "Content-Type": "application/json", "x-rufer": "traegt" } }, (r) => {
            let d = "";
            r.on("data", (c) => (d += c));
            r.on("end", () => {
                try {
                    res(JSON.parse(d));
                } catch {
                    res({ roh: d });
                }
            });
        });
        req.setTimeout(ms || 120000, () => req.destroy(new Error("Werkbank " + weg + ": keine Antwort in " + (ms || 120000) + " ms")));
        req.on("error", rej);
        req.end(JSON.stringify(nutzlast || {}));
    });
const schlaf = (ms) => new Promise((r) => setTimeout(r, ms));
const evalSeite = async (port, code, ms) => {
    const a = await ruf(port, "/eval", { code, name: "faecher" }, ms);
    if (!a || a.fehler) throw new Error("Seite: " + ((a && a.fehler) || "ohne Antwort"));
    return a.ergebnis;
};

async function start() {
    const spiel = path.resolve(opt("--spiel"));
    const aus = path.resolve(opt("--aus"));
    const port = +opt("--port", 4631);
    const sp = +opt("--seite-port", 4611);
    const ort = opt("--ort", "dorf");
    fs.mkdirSync(aus, { recursive: true });
    const log = (n) => fs.openSync(path.join(aus, n), "w");
    const kind = (args, env, n) => {
        const k = spawn(process.execPath, args, { cwd: spiel, env: Object.assign({}, process.env, env), detached: true, windowsHide: true, stdio: ["ignore", log(n), log(n + ".err")] });
        k.unref();
        return k.pid;
    };
    const server = kind(["save-server.js"], { PORT: String(sp) }, "save-server.log");
    await schlaf(1500);
    const seite = "http://localhost:" + sp;
    const bank = kind(["scripts/werkbank.cjs", "start", "--port", String(port), "--ort", ort, "--echt", "--seite", seite], {}, "werkbank.log");
    const sha = execFileSync("git", ["-C", spiel, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    fs.writeFileSync(path.join(aus, "sitzung.json"), JSON.stringify({ server, bank, port, seite, spiel, sha, ort, start: new Date().toISOString() }, null, 1));
    const t0 = Date.now();
    for (;;) {
        const t = fs.readFileSync(path.join(aus, "werkbank.log"), "utf8");
        if (/WERKBANK bereit/.test(t)) break;
        // ein Absturz der Werkbank endet sofort beim Namen — nie 200 s am GPU-Schloss auf ein „bereit“, das nicht kommt
        if (/ABSTURZ/.test(t)) throw new Error("die Werkbank stürzte ab: " + t.split("\n").find((z) => /ABSTURZ/.test(z)).slice(0, 200));
        if (Date.now() - t0 > 200000) throw new Error("die Werkbank meldet in 200 s kein „bereit“ (" + path.join(aus, "werkbank.log") + ")");
        await schlaf(1000);
    }
    console.log("Werkbank bereit nach " + ((Date.now() - t0) / 1000).toFixed(0) + " s");
    const u = await ruf(port, "/umstellen", { ort, sicht: "ego" }, 150000);
    if (!u || u.fehler) throw new Error("/umstellen " + ort + ": " + ((u && u.fehler) || "ohne Antwort"));
    const lage = await evalSeite(
        port,
        "let adapter = null; try { adapter = __abnahmeMessen({}).geraet.adapter; } catch (e) { adapter = null; }" +
            "const c = r.state.renderer.domElement; return { href: location.href, version: r.constructor.VERSION, schirm: typeof r._schirm === 'function' ? r._schirm() : null, leinwand: [c.width, c.height], adapter };",
        30000
    );
    if (!String(lage.href).startsWith(seite)) throw new Error("die Werkbank lädt " + lage.href + ", nicht den eigenen save-server " + seite);
    const S = JSON.parse(fs.readFileSync(path.join(aus, "sitzung.json"), "utf8"));
    Object.assign(S, { lage, bereitS: +((Date.now() - t0) / 1000).toFixed(0) });
    fs.writeFileSync(path.join(aus, "sitzung.json"), JSON.stringify(S, null, 1));
    console.log("am Messort " + ort + " · " + JSON.stringify(lage));
}

async function schiesse() {
    const aus = path.resolve(opt("--aus"));
    const S = JSON.parse(fs.readFileSync(path.join(aus, "sitzung.json"), "utf8"));
    const port = +opt("--port", S.port);
    const frist = Date.now() + +opt("--lauf-s", 270) * 1000;
    if (!S.lage || !S.lage.adapter) throw new Error("die Sitzung nennt kein Gerät (sitzung.json ohne Adapter) — kein Bild ohne Akte");
    for (const id of String(opt("--sprosse", "")).split(",").filter(Boolean)) {
        const D = SPROSSEN[id];
        if (!D) throw new Error("kein Fächer für " + id + " (gebaut: " + Object.keys(SPROSSEN).join(", ") + ")");
        if (D.ort !== S.ort) throw new Error(id + " misst am Messort " + D.ort + ", die Sitzung steht an " + S.ort);
        const hier = path.join(aus, D.ordner || ordner(id));
        const max = D.max || MAX;
        fs.mkdirSync(path.join(hier, "bild"), { recursive: true });
        fs.mkdirSync(path.join(hier, "akte"), { recursive: true });
        const blatt = path.join(hier, "faecher.json");
        let G = fs.existsSync(blatt) ? JSON.parse(fs.readFileSync(blatt, "utf8")) : null;
        // ein Ordner trägt EINEN Fächer: schoss er unter einem anderen Wortlaut, beginnt der neue in einem neuen Ordner (D.ordner), nie gemischt
        if (G && G.faecher !== D.faecher && fs.readdirSync(path.join(hier, "akte")).length) throw new Error(id + ": " + hier + " trägt Akten des Fächers „" + G.faecher + "“ — der neue Fächer braucht einen neuen Ordner");
        if (!G || G.sha !== S.sha || G.faecher !== D.faecher) {
            // die Posen EINMAL je Kopf aus dem Gesetz: jeder weitere Lauf schießt dieselbe Liste weiter
            const g = await evalSeite(port, D.rumpf(), 120000);
            const posen = faechern(D.je ? imWechsel(g.posen || [], D.je) : g.posen || [], D.uhren || UHREN, D.mehr);
            G = { sprosse: id, sha: S.sha, geraet: S.lage.adapter, version: S.lage.version, ort: D.ort, saat: g.saat, gesetz: D.gesetz, faecher: D.faecher, lage: g.lage, posenDesGesetzes: (g.posen || []).length, posen, urteil: umfang(posen.length, D.gesetz, g.lage) };
            fs.writeFileSync(blatt, JSON.stringify(G, null, 1));
        }
        console.log(id + ": " + G.posenDesGesetzes + " Posen des Gesetzes → Fächer " + G.posen.length + (G.urteil ? " · " + G.urteil : "") + " · " + G.lage);
        if (G.urteil) continue;
        fs.mkdirSync(path.join(hier, "nicht"), { recursive: true });
        const motiv = D.motiv || GRUEN;
        const akteVon = (i) => path.join(hier, "akte", nr(i) + ".json");
        const lies = (i) => (fs.existsSync(akteVon(i)) ? JSON.parse(fs.readFileSync(akteVon(i), "utf8")) : null);
        const stand = () => {
            const A = G.posen.map((_, i) => lies(i));
            return { A, traegt: A.filter((a) => a && a.traegt).length, fest: new Set(A.filter((a) => a && !a.traegt && ORT_FEST(a.abnahme)).map((a) => a.basis)) };
        };
        const ende = (wort) => {
            const s = stand();
            const offen = s.traegt >= max ? 0 : G.posen.filter((p, i) => !s.A[i] && !s.fest.has(p.basis)).length;
            G.bilder = s.traegt;
            G.ohneMotiv = s.A.filter((a) => a && !a.traegt).length;
            G.urteil = s.traegt >= MIN || offen ? null : umfang(s.traegt, D.gesetz, "das Motiv im Bild an " + s.traegt + " von " + s.A.filter(Boolean).length + " geschossenen Posen, " + s.fest.size + " von " + G.posenDesGesetzes + " Posen des Gesetzes verdeckt");
            fs.writeFileSync(blatt, JSON.stringify(G, null, 1));
            console.log(id + ": " + wort + " — " + s.traegt + " Bilder tragen das Motiv, " + G.ohneMotiv + " ohne, " + offen + " Posen offen" + (G.urteil ? " · " + G.urteil : ""));
            return s;
        };
        let frei = true;
        for (let i = 0; i < G.posen.length && frei; i++) {
            const P = G.posen[i];
            const s = stand();
            if (s.traegt >= max) break;
            if (s.A[i] || s.fest.has(P.basis)) continue;
            if (Date.now() + 35000 > frist) {
                frei = false;
                break;
            }
            const datei = path.join(hier, "bild", nr(i) + ".png");
            const rot = datei.replace(/\.png$/, "-rot.png");
            const t = Date.now();
            // DIE REISE DER ADRESSE: liegt die Pose an einer anderen Lage des Planeten, spricht der Fächer den Satz des Spielers durch die
            // EINE Tür der Konsole (wie die Werkbank ihre Reise-Orte stellt, scripts/werkbank.cjs reiseDesOrts) und prüft, dass die Seite
            // danach an der Lage steht — sonst endet der Lauf beim Namen (keine Akte, die Pose bleibt offen)
            if (P.reise) {
                const R = await evalSeite(port, REISE + "return await reise(" + JSON.stringify(P.reise) + ");", 240000);
                if (!R || R.fehler) throw new Error(id + " Bild " + nr(i) + ": „" + P.reise + "“ kam nicht an — " + ((R && R.fehler) || "ohne Antwort"));
                if (R.neu) console.log(id + ": " + P.reise + " → Welt " + R.welt + " (" + R.ms + " ms)");
            }
            let a = null, da = null;
            // ein Wurf der Werkbank an einer Pose: EIN zweiter Versuch, dann steht die Pose mit ihrem Fehler in der Akte
            for (let v = 0; v < 2 && !da; v++) {
                a = await ruf(port, "/bild", Object.assign({ datei, w: 1280, h: 720 }, P.pose, P.mehr, D.wahl != null ? { wahl: D.wahl } : {}), 90000).catch((e) => ({ verbindung: e.message }));
                // eine Werkbank, die nicht antwortet, ist kein Urteil über die Pose: der Lauf endet beim Namen, keine Akte
                if (a && a.verbindung) throw new Error(id + " Bild " + nr(i) + ": die Werkbank antwortet nicht (" + a.verbindung + ") — Sitzung neu starten, die Posen bleiben offen");
                da = [a && a.datei, datei, rot].find((f) => f && fs.existsSync(f));
            }
            const abnahme = String((a && (a.abnahme || a.fehler)) || "").slice(0, 300);
            const akte = Object.assign({ sprosse: id, nr: i + 1, basis: P.basis, sha: S.sha, geraet: S.lage.adapter, version: S.lage.version, ort: D.ort, saat: G.saat, gesetz: D.gesetz, pose: P.pose, uhr: P.mehr.uhr, wort: P.wort, abnahme, sek: 0, datum: new Date().toISOString() }, P.klasse != null ? { klasse: P.klasse } : {});
            if (!da) Object.assign(akte, { traegt: false, fehler: "kein Bild nach zwei Versuchen" });
            else {
                if (da !== datei) fs.renameSync(da, datei);
                const b = fs.readFileSync(datei);
                const m = pngMass(b);
                if (!m || m.zeilen < ZEILEN) {
                    fs.unlinkSync(datei);
                    throw new Error(id + " Bild " + nr(i) + ": " + (m ? m.zeilen : 0) + " Zeilen < " + ZEILEN);
                }
                Object.assign(akte, { breite: m.breite, zeilen: m.zeilen, sha256: sha256(b), traegt: motiv(abnahme, P) });
                if (!akte.traegt) fs.renameSync(datei, path.join(hier, "nicht", nr(i) + ".png"));
            }
            akte.sek = +((Date.now() - t) / 1000).toFixed(1);
            fs.writeFileSync(akteVon(i), JSON.stringify(akte, null, 1));
        }
        ende(frei ? "Fächer durch" : "Frist des Laufs");
        if (!frei) return;
    }
    console.log("ALLE DURCH");
}

// NACHURTEIL: das Motiv der Sprosse (D.motiv, eine Funktion der Abnahme und der Pose) neu über jede Akte eines Ordners — schärft sich
// das Motiv (AN_DER_POSE), fallen die Bilder, die es nicht mehr tragen, nach nicht/ und ihre Akte nennt den Grund; nie umgekehrt
// (ein verworfenes Bild kehrt nie zurück). Aufruf: faecher.cjs nachurteil --aus <Fächer-Wurzel> --sprosse <leiter#n>
async function nachurteil() {
    const id = opt("--sprosse"), D = SPROSSEN[id];
    if (!D) throw new Error("kein Fächer für " + id);
    const hier = path.join(path.resolve(opt("--aus")), D.ordner || ordner(id)), G = JSON.parse(fs.readFileSync(path.join(hier, "faecher.json"), "utf8"));
    const motiv = D.motiv || GRUEN;
    let fiel = 0, traegt = 0;
    fs.mkdirSync(path.join(hier, "nicht"), { recursive: true });
    for (const n of fs.readdirSync(path.join(hier, "akte")).filter((x) => x.endsWith(".json")).sort()) {
        const af = path.join(hier, "akte", n), a = JSON.parse(fs.readFileSync(af, "utf8"));
        if (!a.traegt) continue;
        if (motiv(a.abnahme, G.posen[a.nr - 1])) { traegt++; continue; }
        const b = path.join(hier, "bild", n.replace(/\.json$/, ".png"));
        if (fs.existsSync(b)) fs.renameSync(b, path.join(hier, "nicht", path.basename(b)));
        Object.assign(a, { traegt: false, nachurteil: "das Motiv der Sprosse trägt das Bild nicht mehr" + (AN_DER_POSE(a.abnahme) ? "" : " — nicht an der Pose (" + /Blick-Wahl \d+ Posen/.exec(a.abnahme)[0] + ")") });
        fs.writeFileSync(af, JSON.stringify(a, null, 1));
        fiel++;
    }
    G.bilder = traegt;
    fs.writeFileSync(path.join(hier, "faecher.json"), JSON.stringify(G, null, 1));
    console.log(id + ": nachgeurteilt — " + traegt + " Bilder tragen das Motiv, " + fiel + " fielen nach nicht/");
}

async function stop() {
    const aus = path.resolve(opt("--aus"));
    const S = JSON.parse(fs.readFileSync(path.join(aus, "sitzung.json"), "utf8"));
    await ruf(+opt("--port", S.port), "/stop", {}, 20000).catch((e) => console.log("stop: " + e.message));
    await schlaf(3000);
    // nur die EIGENEN PIDs der Sitzung
    for (const pid of [S.bank, S.server])
        try {
            process.kill(pid);
        } catch {
            /* schon fort */
        }
    console.log("Sitzung beendet (PIDs " + S.bank + ", " + S.server + ")");
}

function selbsttest() {
    const F = [];
    const t = (name, ok) => F.push([name, !!ok]);
    const basis = (n) => Array.from({ length: n }, (_, i) => ({ pose: { px: i }, wort: "p" + i }));
    t("16 Posen × 9 Uhren = 144, Uhr um Uhr, jede mit ihrer Pose des Gesetzes", faechern(basis(16), UHREN, { wahl: 0 }).length === 144 && faechern(basis(16), UHREN, { wahl: 0 })[47].mehr.uhr === 0.6 && faechern(basis(16), UHREN, {})[17].basis === 1);
    t("das Motiv: GRÜN trägt, ein Ziel hinter Gelände, Laub im Vordergrund oder verdeckte Sicht nicht; am Haus und am Weiler trägt ein Haus vor der Mitte", GRUEN("ABNAHME GRÜN · beweis") && !GRUEN("ABNAHME ROT [Ziel Blickziel verdeckt von Gelände in 27.49 m]") && SPROSSEN["mensch.bau.huelle#1"].motiv("ABNAHME ROT [Ziel Blickziel verdeckt von an Punkt 1 bauSatz in 108.8 m]") && !SPROSSEN["mensch.bau.huelle#1"].motiv("ABNAHME ROT [Ziel Blickziel verdeckt von Laub fscatter:tanne:L1 in 3.47 m]") && !SPROSSEN["mensch.stadt.groesse#1"].motiv("ABNAHME ROT [Vordergrund 50.0 % näher als 8 m (der halbe Ziel-Abstand): Laub]") && SPROSSEN["mensch.stadt.groesse#1"].motiv("ABNAHME ROT [Ziel Blickziel verdeckt von bauSatz in 57.78 m]") && !SPROSSEN["mensch.stadt.groesse#1"].motiv("ABNAHME ROT [Sicht verdeckt 28.5 % (Laub)]") && ORT_FEST("ABNAHME ROT [Vordergrund 50.0 % näher als 8 m]") && ORT_FEST("ABNAHME ROT [Ziel Blickziel verdeckt von Formation in 18.17 m]") && !ORT_FEST("ABNAHME ROT [Leinwand]") && !ORT_FEST("ABNAHME ROT [Ziel Blickziel verdeckt von kamm-krone in 3.47 m]"));
    t("3 Posen × 9 Uhren = 27: Umfang nicht erzeugbar beim Namen", /^Umfang nicht erzeugbar: 27 von 40 \(x:1/.test(umfang(faechern(basis(3), UHREN, {}).length, "x:1", "")));
    t("0 Posen: 0 von 40, kein Bild", umfang(faechern([], UHREN, {}).length, "x:1", "leer").includes("0 von 40") && faechern([], UHREN, {}).length === 0);
    t("40 Posen tragen", umfang(40, "x:1") === null);
    const kl = Array.from({ length: 30 }, (_, i) => ({ pose: { px: i }, wort: "h" + i, klasse: i < 24 ? "Wohnhaus" : i < 28 ? "Scheune" : "Schmiede", ziel: { art: "eiche", d: 12 } }));
    const w = imWechsel(kl, 3);
    t("die Klassen im Wechsel: höchstens 3 je Klasse, die seltene Klasse vor dem vierten Wohnhaus, die Klasse reist in die Pose", w.length === 8 && w.slice(0, 3).map((x) => x.klasse).join() === "Wohnhaus,Scheune,Schmiede" && w.filter((x) => x.klasse === "Wohnhaus").length === 3 && faechern(w, [0.5], {})[1].klasse === "Scheune" && faechern(w, [0.5], {})[0].ziel.art === "eiche" && !("klasse" in faechern(basis(2), [0.5], {})[0]));
    const PF = SPROSSEN["leben.pflanzen.arten#1"].motiv;
    t("an der Pose: ein Bild, für das die Werkbank eine andere Kamera wählte (Blick-Wahl ≥ 2 Posen), trägt kein Rahmen-Motiv", AN_DER_POSE("ABNAHME GRÜN · Blick-Wahl 1 Pose") && !AN_DER_POSE("ABNAHME GRÜN · Blick-Wahl 2 Posen") && !AN_DER_POSE("Blick-Wahl 42 Posen") && !PF("ABNAHME GRÜN · Blick-Wahl 37 Posen", { ziel: { art: "eiche", d: 9 } }) && !SPROSSEN["mensch.bau.bedarf#1"].motiv("ABNAHME GRÜN · Blick-Wahl 3 Posen") && SPROSSEN["mensch.bau.bedarf#1"].wahl === 0 && SPROSSEN["leben.pflanzen.arten#1"].wahl === 0);
    t("das Motiv der Pflanze: ihr eigenes Laub am Ziel trägt, fremdes oder nahes Laub nicht", PF("ABNAHME ROT [Ziel Blickziel verdeckt von Laub fscatter:eiche:L1 in 9.2 m]", { ziel: { art: "eiche", d: 12 } }) && !PF("ABNAHME ROT [Ziel Blickziel verdeckt von Laub fscatter:tanne:L1 in 9.2 m]", { ziel: { art: "eiche", d: 12 } }) && !PF("ABNAHME ROT [Ziel Blickziel verdeckt von Laub fscatter:eiche:L1 in 2.1 m]", { ziel: { art: "eiche", d: 12 } }) && PF("ABNAHME GRÜN", {}));
    t("jede Klassen-Sprosse trägt ihre Frage", Object.values(SPROSSEN).filter((d) => d.je).every((d) => /\?$/.test(d.frage || "")));
    t("eine feste Uhr (Erntetag) fächert nur über Adressen", faechern(basis(12), [10 / 24], { uhr: 1 }).length === 12 && faechern(basis(12), [10 / 24], {})[0].mehr.uhr === 10 / 24);
    const png = Buffer.alloc(24);
    png.writeUInt32BE(0x89504e47, 0);
    png.writeUInt32BE(1280, 16);
    png.writeUInt32BE(360, 20);
    t("ein Bild in 360 Zeilen fällt am Kopf des PNG", pngMass(png).zeilen === 360 && pngMass(png).zeilen < ZEILEN && pngMass(Buffer.from("kein png, nur Text ......")) === null);
    t("jede Sprosse nennt Messort, Gesetz mit Zeile und Rumpf", Object.values(SPROSSEN).every((d) => d.ort && /:\d+$/.test(d.gesetz) && typeof d.rumpf === "function"));
    let rumpf = "";
    try {
        rumpf = Object.values(SPROSSEN).map((d) => d.rumpf()).join("\n");
        for (const d of Object.values(SPROSSEN)) new (Object.getPrototypeOf(async function () {}).constructor)("r", "T", d.rumpf());
    } catch (e) {
        rumpf = "FEHLER " + e.message;
    }
    t("die Rümpfe tragen die Seiten-Funktionen der Stationen und sind gültiger Text" + (rumpf.startsWith("FEHLER") ? " — " + rumpf : ""), !rumpf.startsWith("FEHLER") && /_bewohnerSiedlungen/.test(rumpf) && /aus\.alle/.test(rumpf) && /i < 16/.test(rumpf));
    let wurf = "";
    try {
        seiteVon("k2-mensch-stadt.js", "mensch.stadt.groesse", "GIBTESNICHT");
    } catch (e) {
        wurf = e.message;
    }
    t("ein fehlendes Gesetz wirft beim Namen", /Gesetz fehlt: k2-mensch-stadt.js/.test(wurf));
    const rot = F.filter((f) => !f[1]);
    for (const f of F) console.log((f[1] ? "GRÜN " : "ROT  ") + f[0]);
    console.log(F.length - rot.length + " GRÜN · " + rot.length + " ROT");
    process.exit(rot.length ? 1 : 0);
}

module.exports = { PFLANZEN_NAME, SPROSSEN, faechern, imWechsel, umfang, pngMass, MIN, MAX, ZEILEN, UHREN };
if (require.main === module) {
    const cmd = process.argv[2];
    const lauf = cmd === "--selftest" ? selbsttest : cmd === "start" ? start : cmd === "schiesse" ? schiesse : cmd === "stop" ? stop : cmd === "nachurteil" ? nachurteil : null;
    if (!lauf) {
        console.error("Aufruf: faecher.cjs start|schiesse|nachurteil|stop|--selftest (Kopf der Datei)");
        process.exit(2);
    }
    Promise.resolve()
        .then(lauf)
        .catch((e) => {
            console.error("ROT " + String((e && e.message) || e));
            process.exit(1);
        });
}
