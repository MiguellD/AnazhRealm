// DIE PERSPEKTIVE fahrzeug DES KAPITELS mensch (Meisterkarte 2): fünf Leitern, je Leiter EINE Probe in der warmen Welt der
// Sitzung (k2-mensch.js, die Fabrik). Gemessen wird am ERGEBNIS der Welt: die Werke der Szene je Medium, die Fahr-Rezepte des
// EINEN Kerns (`__vehicleCore`, exportDrive — dieselbe Ableitung, aus der jeder Wagen der Welt fährt, stamm/gelaende-kollision.js
// `_fahrzeugGesetzFor`), ein gesetzter Wagen unter Vollgas in zwei Bauplänen (Lage und Tempo über die Takte), die Reihe der
// Epochen im Bild, der Verkehr der Stadt über die Takte (`S.verkehr.wagen`, `S.verkehr.zahl`, stamm/siedlung-verkehr.js) und die
// Sätze des Spielers durch den EINEN Parser. Wo die Welt den Umfang nicht stellt, misst die Probe ihn und urteilt „nicht“.
"use strict";

const { FAECHER } = require("./faecher.js");

// DER BREMSWEG AN EINER ADRESSE (mensch.fahrzeug.medium#2, das Gesetz des Fächers, stationen/faecher.js): a.ort ist das Rezept, a.saat
// wählt den Ort des Wagens in der warmen Welt — die Vogel-Spirale um den Messort (Winkel saat · 137,508°, Abstand 24 m · √saat, nach
// außen bis Land ohne Wasser, `_landAt`), in die Richtung der Spirale: „die Fahrt ist eine Funktion des Mediums am Ort“
// (fahrzeug-medium). Gerufen wird, was der Wagen der Welt fährt (stamm/koerper-fahrt.js `_wagenSchritt`): der Fahr-Satz aus exportDrive →
// fahrGesetz (stamm/gelaende-kollision.js `_fahrzeugGesetzFor`), der Boden unter ihm durch DEN Leser des Wagens (`_fahrGrund`: der EINE
// Leser des Leibs `_kontaktStoffAt` — Pflaster, Pfad, Laub, Wiese, Stoff des Felds —, die Stoff-Zeile mit μ trocken/nass und dem Satz
// `radBoden`, die Feuchte `_feuchteAt`), die Haftung `_fahrHaft` (mit dem Film `_naesseAm`) und je Schritt der Kern: fahrKraefte mit
// e.haft und e.boden (vehicle-core radImBoden an den Durchfahrten, die die Zelle trägt, `_trittDurchfahrten` — gelesen, nie geschrieben),
// fahrStand auf dem Grund. Aus 100 und 50 km/h die volle Bremse bis bremsV des Kerns (darunter fährt er rückwärts: bis hier zählte der
// Halt bei 0,05 m/s die Rückfahrt mit — supersport 50 → 0 „1 230,92 m“). ZWEI FAHRTEN je Geschwindigkeit, zwei Fragen der Karte:
//   die WELT — auf dem Grund des Orts (`_werkBoden`: Hang, Buckel, Kanten), je Schritt der Stoff unter dem Rad (die Bahn kreuzt Stoffe):
//     die Physik der Saat (`weg100`, `weg50`; das größte Gefälle am Wagen `steil`, die Bilder in der Luft `luft`);
//   der PRÜFSTAND — das Band „30–50 m ∝ v²/μ“ gilt auf der Bahn der Profis (höchstens 1 % Gefälle längs, 2 % quer: 49 CFR 571.135
//     S6.2.2), und das Gelände trägt sie nicht (an Genesis und am Dorf hielt keine von 120 Bahnen die Norm, je 5 m in drei Spuren
//     abgetastet; Genesis Saat 12 nickte 0,22 rad und flog: 117,6 m statt 86) — darum bremst derselbe Wagen auf dem BODEN DER SAAT
//     eben: derselbe Stoff, dieselbe Haftung, derselbe Satz im Boden, dieselbe Feuchte und Rinne wie am Ort, die Ebene seiner Höhe.
//     Gemessen der Weg × (μ + f_r) (`norm100`, `norm50`: der Weg des Labors auf μ 1, die Haftung und der Widerstand des weichen Bodens).
// Dazu die Spitze nach `fahrLeistung` (90 s Vollgas) und die Spurrinne nach 10 Durchfahrten (radImBoden mit 9 davor, in m; fester Grund
// 0). Bis fahrzeug-medium hatte die Saat im Gesetz keinen Eingang: der Wagen bremste auf `() => 0` mit μ 1 — 1 Fahrt je Rezept über 20 Saaten
const BREMS_AN = async (r, T, a) => {
    const VC = window.__vehicleCore;
    if (!VC || typeof VC.fahrKraefte !== "function" || typeof VC.fahrStand !== "function" || typeof VC.radImBoden !== "function")
        return { fehlt: "der Fahrzeug-Kern trägt kein Rad im Boden (vehicle-core radImBoden)" };
    if (typeof r._fahrGrund !== "function" || typeof r._fahrHaft !== "function" || typeof r._werkBoden !== "function")
        return { fehlt: "der Wagen liest keinen Boden (stamm/koerper-fahrt.js _fahrGrund)" };
    const pre = VC.PRESETS[a.ort];
    const G = VC.fahrGesetz(VC.exportDrive(Object.assign({}, pre.s, pre.fx), a.ort));
    if (!G) return { fehlt: "das Rezept " + a.ort + " trägt kein Fahr-Gesetz" };
    if (!G.rad) return { fehlt: "das Rezept " + a.ort + " trägt kein Rad im Boden (vehicle-core fahrAufstand rad)" };
    const p0 = r.state.playerMesh.position;
    const C = window.__bremsOrte || (window.__bremsOrte = {});
    const key = a.saat + "@" + Math.round(p0.x) + "," + Math.round(p0.z);
    if (!(key in C)) {
        const w = (a.saat * 137.508 * Math.PI) / 180;
        C[key] = null;
        for (let d = 24 * Math.sqrt(a.saat), i = 0; i < 12 && !C[key]; i++, d += 6) {
            const x = p0.x + d * Math.cos(w), z = p0.z + d * Math.sin(w);
            if (r._landAt(x, z, 1)) C[key] = { x, z, yaw: w };
        }
    }
    const O = C[key];
    if (!O) return { wasser: true };
    const DT = 1 / 60, bremsV = VC.FAHR.schritt.bremsV, r3 = (v) => Math.round(v * 1000) / 1000, r2 = (v) => Math.round(v * 100) / 100;
    const rad = (M, k) => (M.boden ? VC.radImBoden(G.rad, M.boden, M.feuchte, k) : null);
    const z0 = VC.fahrZustand(O.x, O.z, O.yaw);
    VC.fahrStand(z0, G, r._werkBoden({ _fahr: z0 }), 0);
    const M0 = r._fahrGrund(z0), mu0 = r._fahrHaft(z0), k0 = r._trittDurchfahrten(z0.x, z0.z);
    // die Bremsung aus kmh: `stand` null — die Welt (Grund und Stoff je Schritt), sonst der Prüfstand (die Ebene, der Boden des Orts)
    const fahrt = (kmh, stand) => {
        const z = VC.fahrZustand(O.x, O.z, O.yaw);
        const boden = stand ? () => z0.y : r._werkBoden({ _fahr: z });
        VC.fahrStand(z, G, boden, 0);
        z.vlong = kmh / VC.FAHR.kmh;
        z.speed = z.vlong;
        let steil = 0, luft = 0, halt = 0, spalt = 0;
        const y0 = z.y;
        for (let i = 0; z.vlong > bremsV && i < 3600; i++) {
            const M = stand ? M0 : r._fahrGrund(z), mu = stand ? mu0 : r._fahrHaft(z), rb = rad(M, stand ? k0 : r._trittDurchfahrten(z.x, z.z));
            const [x0, q0, flog] = [z.x, z.z, z.luft === true];
            VC.fahrKraefte(z, { brake: 1, haft: mu, boden: rb }, G, DT);
            VC.fahrStand(z, G, boden, DT);
            if (z.luft === true) {
                luft++;
                const eb = VC.fahrEbene(G, boden, z.x, z.z, z.yaw, z.einsinken);
                if (eb) spalt = Math.max(spalt, z.y - eb.y);
            }
            if (!flog) halt += (mu + (rb ? rb.fr : 0)) * Math.hypot(z.x - x0, z.z - q0);
            steil = Math.max(steil, Math.abs(Math.tan(z.steig || 0)));
        }
        // die WELT im Band des Prüfstands (fahrzeug-medium-2): der Weg am Boden × (μ + f_r) des Schritts, die Höhe gutgeschrieben —
        // ½v² = g·Σ(μ + f_r)·Δs + g·(y_Ende − y_0): bremst der Wagen am Hang, zahlt die Höhe; fliegt er, bremst er nicht (am Kern
        // bei 15 und 30 % Steigung auf und ab 39,0–40,4 m gegen 38,6 m eben). Ein Flug OHNE KUPPE: der Wagen hob ab, und der Boden fiel
        // nie weiter als den Federweg unter ihn (`auf.hub`, um den jedes Rad seinem Boden folgt) — er flatterte über eine Welle
        return { s: r2(Math.hypot(z.x - O.x, z.z - O.z)), steil: r3(steil), luft, welt: r2(halt - (y0 - z.y)), flattert: luft > 0 && !(spalt > G.auf.hub) ? 1 : 0 };
    };
    const frisch = rad(M0, k0), rinne = rad(M0, 9), halt = mu0 + (frisch ? frisch.fr : 0);
    // DIE KURVENGRENZE (Karte: a_quer = μ·g): derselbe Wagen auf dem Prüfstand der Saat im Kreis — die Lenkung steigt in 6 s auf
    // den vollen Einschlag, das Gas hält 20 m/s; die Spitze der Querbeschleunigung gegen μ·g, μ = der Boden der Saat (`_fahrHaft`,
    // derselbe Leser wie `_wagenSchritt`) × der Reifen des Rezepts (maxGrip · grip)
    const kreis = () => {
        const z = VC.fahrZustand(O.x, O.z, O.yaw), boden = () => z0.y;
        VC.fahrStand(z, G, boden, 0);
        z.vlong = 20;
        z.speed = 20;
        let a = 0;
        for (let i = 0; i < 480; i++) {
            const v = Math.hypot(z.vlong, z.vlat);
            VC.fahrKraefte(z, { steer: Math.min(1, i / 360), throttle: Math.max(0, Math.min(1, (20 - v) * 0.5)), haft: mu0, boden: frisch }, G, DT);
            VC.fahrStand(z, G, boden, DT);
            if (i > 30) a = Math.max(a, Math.abs(z.aLat));
        }
        return r3(a / (Math.min(1, mu0) * G.maxGrip * G.grip * G.g));
    };
    const L = VC.fahrLeistung(Object.assign({}, pre.s, pre.fx), a.ort);
    const w100 = fahrt(100), w50 = fahrt(50);
    return {
        weg100: w100.s, weg50: w50.s, steil: w100.steil, luft: w100.luft, welt100: w100.welt, flattert: w100.flattert,
        norm100: r2(fahrt(100, true).s * halt), norm50: r2(fahrt(50, true).s * halt),
        kurve: kreis(), vmaxKmh: L ? L.kmh : null, mu: r3(mu0), fr: frisch ? r3(frisch.fr) : 0, rinne: rinne ? r3(rinne.z) : 0,
        stoff: M0.stoff, weich: M0.boden ? 1 : 0, feuchte: r3(M0.feuchte),
    };
};

// DIE SPUR SICHTBAR (Karte: „Spurrinne nach 10 Durchfahrten sichtbar“; fahrzeug-medium-2): der gt des Kerns fährt zehnmal dieselben
// 12 m weichen Bodens (der erste Ort um den Spieler, an dem jeder Punkt 3 m vor bis 15 m hinter dem Anfang in beiden Spuren und der
// Mitte einen Satz im Boden trägt und kein Wasser) durch den Schreib-Akt der Welt (stamm/koerper-fahrt.js `_fahrRad` → `_tritt`: je
// Rad die Rinne der Durchfahrten vor ihm, dann sein Tritt, `TRITT.rad`); gelesen an den Zellen beider Spuren der Anteil, den die
// Wege-Karte als Pfad malt (`_pfadFeldAt` ≥ ½ — dieselben Bytes, die der Boden-Shader liest), nach einer Durchfahrt und nach zehn,
// und der Stoff unter dem Fuß (`_kontaktStoffAt`). Danach kehren das Feld der Tritte und die Karte zurück: der Kasten der Spur malt
// neu wie eine Fläche, die aus der Karte fällt (`_wegeStufeMalen` mit dem Kasten); `rest` nennt die Zellen, deren Bytes nicht
// zurückkehrten. Gerufen NACH dem Fächer: keine Bremsung der Saaten fährt über die Spur.
const SPUR_SICHT = async (r) => {
    const VC = window.__vehicleCore;
    if (typeof r._fahrRad !== "function" || typeof r._trittDurchfahrten !== "function") return { fehlt: "das Rad schreibt keine Spur (stamm/koerper-fahrt.js _fahrRad)" };
    const pre = VC.PRESETS.gt;
    const G = pre && VC.fahrGesetz(VC.exportDrive(Object.assign({}, pre.s, pre.fx), "gt"));
    if (!G || !G.rad) return { fehlt: "der gt trägt kein Rad im Boden (vehicle-core fahrAufstand rad)" };
    const TT = r.constructor.TRITT, wm = r.state.worldMeta, wk = r.state.wegeKarte;
    if (!wm || !wk) return { fehlt: "die Welt trägt kein Feld der Tritte oder keine Wege-Karte" };
    const hk = (x, z) => r._voxelSurfaceY(x, z);
    const weich = (x, z) => {
        const y = hk(x, z);
        const Z = Number.isFinite(y) && r._stoff(r._kontaktStoffAt(x, z, y));
        return !!(Z && Z.radBoden) && !(r._atlasWaterLevelAt(x, z, y) > y - 0.3);
    };
    const q = G.auf.quer, p0 = r.state.playerMesh.position;
    let ort = null;
    for (let k = 0; k < 1200 && !ort; k++) {
        const [x0, z0] = [p0.x + Math.cos(k * 2.4) * (8 + k * 0.2), p0.z + Math.sin(k * 2.4) * (8 + k * 0.2)];
        let ja = true;
        for (let sx = -3; sx <= 15 && ja; sx += 1) for (const dz of [-q, 0, q]) ja = ja && weich(x0 + sx, z0 + dz);
        if (ja) ort = { x0, z0 };
    }
    if (!ort) return { zellen: 0, grund: "kein weicher Ort in 1 200 Proben bis 248 m um den Spieler" };
    const zellen = [];
    for (let x = ort.x0 + 3.25; x < ort.x0 + 9; x += TT.zelleM)
        for (const zz of [ort.z0 - q, ort.z0 + q]) zellen.push([(Math.floor(x / TT.zelleM) + 0.5) * TT.zelleM, (Math.floor(zz / TT.zelleM) + 0.5) * TT.zelleM]);
    const pfad = () => zellen.map(([x, z]) => Math.round(r._pfadFeldAt(x, z, hk(x, z)) * 1000));
    const vor = [Object.assign({}, wm.tritt || {}), new Map(r._trittSchwach || []), new Map(wk.trittGemalt), new Set(wk.trittOffen), pfad()];
    const fahre = () => {
        const z = VC.fahrZustand(ort.x0, ort.z0, 0);
        for (let sx = 0; sx <= 12; sx += 0.2) {
            [z.x, z.y, z.luft] = [ort.x0 + sx, hk(ort.x0 + sx, ort.z0), false];
            r._fahrRad(z, G, false);
        }
    };
    const gemalt = () => pfad().filter((v) => v >= 500).length;
    fahre();
    const nach1 = gemalt();
    for (let n = 2; n <= 10; n++) fahre();
    const nach10 = gemalt();
    const erde = zellen.filter(([x, z]) => r._kontaktStoffAt(x, z, hk(x, z)) === "erde").length;
    const tritte = r._trittZahl(zellen[0][0], zellen[0][1]);
    // zurück: das Feld, das flüchtige Gedächtnis, das Gemalte, die Wiese von morgen — und der Kasten der Spur malt neu
    wm.tritt = vor[0];
    r._trittSchwach = vor[1];
    r._trittSchrieb = (r._trittSchrieb || 0) + 1;
    wk.trittGemalt.clear();
    for (const [k, v] of vor[2]) wk.trittGemalt.set(k, v);
    wk.trittOffen.clear();
    for (const k of vor[3]) wk.trittOffen.add(k);
    const R = TT.halbM + TT.randM + 4;
    const box = { x0: ort.x0 - R, x1: ort.x0 + 12 + R, z0: ort.z0 - q - R, z1: ort.z0 + q + R };
    for (const st of wk.stufen) if (st.zentriert) r._wegeStufeMalen(st, null, null, box);
    const nachher = pfad();
    return {
        ort: [Math.round(ort.x0 * 10) / 10, Math.round(ort.z0 * 10) / 10],
        zellen: zellen.length,
        anteil1: nach1 / zellen.length,
        anteil: nach10 / zellen.length,
        erde: erde / zellen.length,
        tritte: Math.round(tritte * 10) / 10,
        rest: nachher.filter((v, i) => v !== vor[4][i]).length,
    };
};

// DER ZENSUS DER FAHRZEUGE UND MASCHINEN (Seite der Welt)
const zensusFahr = async (r, T, arg) => {
    const s = r.state;
    const VC = window.__vehicleCore;
    const pm = s.playerMesh.position;
    const A = s.architectures || [];
    const typen = {};
    for (const e of A) if (e && typeof e.type === "string") typen[e.type] = (typen[e.type] || 0) + 1;
    const zaehle = (re) => Object.keys(typen).filter((t) => re.test(t)).reduce((a, t) => a + typen[t], 0);
    const medien = {
        land: zaehle(/^fahrzeug_/),
        wasser: zaehle(/boot|schiff|floss|floß|segler|kahn|kogge|dschunke|dhau/i),
        schiene: zaehle(/lok_|lokomotive|waggon|schiene|eisenbahn/i),
        luft: zaehle(/flugzeug|gleiter|ballon|luftschiff|flieger/i),
        tief: zaehle(/tauchboot|u_boot|uboot/i),
        raum: zaehle(/rakete|raumschiff|orbiter|raumkapsel/i),
    };
    const rezepte = [];
    if (VC && VC.PRESETS)
        for (const k of Object.keys(VC.PRESETS)) {
            const pre = VC.PRESETS[k];
            if (!pre || pre.kind !== "vehicle") continue;
            let d = null;
            try {
                d = VC.exportDrive(Object.assign({}, pre.s, pre.fx));
            } catch (_e) {}
            // rad: das Rezept steht auf Rädern oder Kufen im Boden (exportDrive huelle.radB, fahrzeug-medium) — das Boot trägt keins
            rezepte.push({ k, m: d ? +(+d.mass).toFixed(3) : null, v: d ? +(+d.vmax).toFixed(2) : null, rad: d && d.huelle && d.huelle.radB > 0 ? 1 : 0 });
        }
    const wagen = [];
    let nah = null;
    for (const S of (r._bewohnerSiedlungen || new Map()).values())
        for (const W of (S && S.verkehr && S.verkehr.wagen) || []) {
            wagen.push({ typ: W.typ, steuer: !!(W.b && W.b.amSteuer), faehrt: W.zustand === "faehrt" });
            const e = W.entry;
            if (e && e.position) {
                const d = Math.hypot(e.position.x - pm.x, e.position.z - pm.z);
                if (!nah || d < nah.d) nah = { d, x: e.position.x, y: e.position.y, z: e.position.z };
            }
        }
    const posen = {};
    if (nah) {
        const dx = pm.x - nah.x;
        const dz = pm.z - nah.z;
        const dl = Math.hypot(dx, dz) || 1;
        const cx = nah.x + (dx / dl) * 12;
        const cz = nah.z + (dz / dl) * 12;
        posen.strasse = { px: cx, py: r.getTerrainHeightAt(cx, cz) + 2, pz: cz, lx: nah.x, ly: nah.y + 0.8, lz: nah.z };
    }
    return {
        medien,
        fahrzeugTypen: Object.keys(typen).filter((t) => /^fahrzeug_/.test(t)),
        rezepte,
        physik: new Set(rezepte.map((x) => x.m + "/" + x.v)).size,
        wagen: wagen.length,
        amSteuer: wagen.filter((w) => w.steuer).length,
        faehrt: wagen.filter((w) => w.faehrt).length,
        wagenTypen: [...new Set(wagen.map((w) => w.typ))],
        epochen: VC && Array.isArray(VC.EPOCHE_GESETZ) ? VC.EPOCHE_GESETZ.map((x) => x.id) : [],
        kulturen: VC && VC.CULTURES ? Object.keys(VC.CULTURES).length : 0,
        g: VC && VC.FAHR ? VC.FAHR.G : null,
        strecken: zaehle(/rennstrecke|strecke_/i),
        wettkampf: zaehle(/rennbahn|regatta|wettkampf/i),
        fremd: zaehle(/fremd|alien|xeno/i),
        werke: {
            brunnen: zaehle(/brunnen/i),
            quelle: zaehle(/muehle|mühle|wasserrad|windrad|schoepfrad/i),
            fabrik: zaehle(/fabrik|kraftwerk/i),
            werft: zaehle(/werft|raumhafen/i),
            ketten: A.filter((e) => e && (e.produktion || e.kette)).length,
        },
        posen,
    };
};

// DIE HASPEL AM GEHALTENEN KLICK (Seite der Welt): der nächste Ziehbrunnen mit Haspel (`_haspelVon`, die Teile seiner Stufe),
// die Kamera aus Arm-Länge auf die Trommel, der EINE Klick (`tryMouseBreak`, das Verb `kurbeln`) gedrückt und je Griff 12 Takte
// des echten Loops gehalten, bis der Eimer unten geschöpft hat und oben steht. Gemessen an den GEZEICHNETEN Matrizen der Teile
// gegen ihre Ruhe: der Kurbelweg aus der Drehung der Kurbel um die Welle, der Hub aus der Lage des Eimers — und davor und danach
// der Gegenlauf (Takte ohne Klick: kein Hub).
const haspelKurbel = async (r, T, arg) => {
    const s = r.state;
    const FC = window.__fachwerkCore;
    if (typeof r._haspelVon !== "function" || typeof r._kurbeln !== "function" || !FC || typeof FC.haspelSchritt !== "function")
        return { leser: "die Haspel des Ziehbrunnens ist Gestalt: kein Verb dreht die Kurbel (fachwerk haspelSchritt, Wirt _haspelVon · _kurbeln)" };
    const pm = s.playerMesh.position;
    const p = s.player;
    const A = s.architectures || [];
    // die Ziehbrunnen: die Bauten aus dem Rezept `brunnen` des Fachwerks (der Glutbrunnen ist eine Feuerstelle)
    const brunnen = A.filter((e) => e && e.position && r._foundryPresetForEntry(e) === "brunnen");
    const weit = (e) => Math.hypot(e.position.x - pm.x, e.position.z - pm.z);
    let uhr = performance.now();
    const takte = (k) => {
        for (let i = 0; i < k; i++) {
            uhr += 1000 / 60;
            r._gameLoopTick(uhr);
        }
    };
    const mitHaspel = () => brunnen.filter((e) => r._haspelVon(e)).sort((a, b) => weit(a) - weit(b));
    if (!brunnen.length) return { n: 0, brunnen: 0, taeter: "kein Brunnen am Ort" };
    // der Spieler tritt an den nächsten Brunnen (die nahe Stufe baut seine Teile), höchstens 20 s
    const b0 = brunnen.slice().sort((a, b) => weit(a) - weit(b))[0];
    if (weit(b0) > 6) pm.set(b0.position.x + 3, r.getTerrainHeightAt(b0.position.x + 3, b0.position.z + 3) + 1.2, b0.position.z + 3);
    for (let i = 0; i < 100 && !(mitHaspel()[0] && weit(mitHaspel()[0]) < 8); i++) {
        takte(6);
        await new Promise((f) => setTimeout(f, 200));
    }
    const e = mitHaspel()[0];
    if (!e || weit(e) > 8) return { n: 0, brunnen: brunnen.length, taeter: "die nahe Stufe des Brunnens " + b0.id + " trägt keine Haspel-Teile" };
    const M = r._haspelMass(e);
    const th = e.rotationY || 0;
    const P = e.position;
    const welt = (x, y, z) => new T.Vector3(P.x + x * Math.cos(th) + z * Math.sin(th), P.y + y, P.z - x * Math.sin(th) + z * Math.cos(th));
    const m = new T.Matrix4();
    const inv = new T.Matrix4();
    // eine Lesung: Kurbelwinkel (Drehung um die Welle gegen die Ruhe) und Hub des Eimers (Verschiebung längs der Hochachse der Ruhe)
    const lies = () => {
        const t = r._haspelVon(e) || [];
        const k = t.find((x) => x.teil === "kurbel" && x.quelle === e.instSlots);
        const ei = t.find((x) => x.teil === "eimer" && x.quelle === e.instSlots);
        if (!k || !ei) return null;
        k.g.mesh.getMatrixAt(k.ref.slot, m);
        const rel = inv.copy(k.ruhe).invert().multiply(m).elements;
        const winkel = -Math.atan2(rel[6], rel[5]);
        ei.g.mesh.getMatrixAt(ei.ref.slot, m);
        const a = m.elements;
        const q = ei.ruhe.elements;
        const s2 = q[4] * q[4] + q[5] * q[5] + q[6] * q[6];
        const hub = ((a[12] - q[12]) * q[4] + (a[13] - q[13]) * q[5] + (a[14] - q[14]) * q[6]) / s2;
        return { winkel, hub };
    };
    p._mausVerb = null;
    const l0 = lies();
    if (!l0) return { n: 0, brunnen: brunnen.length, taeter: "der Brunnen " + e.id + " zeichnet Kurbel oder Eimer nicht als eigene Instanz" };
    takte(120);
    const l1 = lies();
    let ohneKlick = Math.abs(l1.hub - l0.hub) + M.r * Math.abs(l1.winkel - l0.winkel);
    // der gehaltene Klick: auf die Trommel zielen, drücken, halten
    const auge = welt(0.4, 1.4, 2.0);
    const ziel = welt(0, 1.0, 0);
    const cam = s.camera;
    const spur = [];
    let w = l1.winkel;
    let vor = l1.winkel;
    let verb = null;
    let unten = false;
    let oben = false;
    let wasser = 0;
    let n = 0;
    for (; n < 160; n++) {
        cam.position.copy(auge);
        cam.lookAt(ziel);
        cam.updateMatrixWorld(true);
        r.tryMouseBreak(n ? p._mausVerb : undefined);
        verb = p._mausVerb;
        if (verb !== "kurbeln") break;
        takte(12);
        const l = lies();
        if (!l) break;
        let d = l.winkel - vor;
        d -= 2 * Math.PI * Math.round(d / (2 * Math.PI));
        vor = l.winkel;
        w += d;
        spur.push([w, l.hub]);
        const z = e._haspel;
        if (z && z.richtung > 0) unten = true;
        if (z) wasser = Math.max(wasser, z.wasser);
        if (unten && z && z.richtung < 0) {
            oben = true;
            break;
        }
    }
    p._mausVerb = null;
    // losgelassen: die gezeigte Kurbel holt den Zustand ein, danach hält sie (Gegenlauf zum zweiten)
    takte(120);
    const l2 = lies();
    let d2 = l2.winkel - vor;
    d2 -= 2 * Math.PI * Math.round(d2 / (2 * Math.PI));
    w += d2;
    vor = l2.winkel;
    spur.push([w, l2.hub]);
    takte(120);
    const l3 = lies();
    ohneKlick = Math.max(ohneKlick, Math.abs(l3.hub - l2.hub) + M.r * Math.abs(l3.winkel - l2.winkel));
    // die Maße: größte Abweichung |Hub − r·φ| über den Weg, Hub je Umdrehung (Steigung · 2π), Rang-r Kurbelweg ↔ Hub
    let fehl = 0;
    for (const [x, y] of spur) fehl = Math.max(fehl, Math.abs(y - M.r * x));
    const N = spur.length;
    const mx = spur.reduce((a, q) => a + q[0], 0) / N;
    const my = spur.reduce((a, q) => a + q[1], 0) / N;
    let sxy = 0;
    let sxx = 0;
    for (const [x, y] of spur) {
        sxy += (x - mx) * (y - my);
        sxx += (x - mx) * (x - mx);
    }
    const rang = (v) => {
        const o = v.map((x, i) => [x, i]).sort((a, b) => a[0] - b[0]);
        const rg = new Array(v.length);
        for (let i = 0; i < o.length; ) {
            let j = i;
            while (j + 1 < o.length && o[j + 1][0] === o[i][0]) j++;
            for (let k = i; k <= j; k++) rg[o[k][1]] = (i + j) / 2;
            i = j + 1;
        }
        return rg;
    };
    const rx = rang(spur.map((q) => q[0]));
    const ry = rang(spur.map((q) => q[1]));
    const mr = (N - 1) / 2;
    let a1 = 0;
    let a2 = 0;
    let a3 = 0;
    for (let i = 0; i < N; i++) {
        a1 += (rx[i] - mr) * (ry[i] - mr);
        a2 += (rx[i] - mr) ** 2;
        a3 += (ry[i] - mr) ** 2;
    }
    let weg = 0;
    for (let i = 1; i < N; i++) weg += Math.abs(spur[i][0] - spur[i - 1][0]);
    const hubs = spur.map((q) => q[1]);
    return {
        n: oben ? 1 : 0,
        brunnen: brunnen.length,
        id: e.id,
        verb,
        griffe: n,
        unten,
        oben,
        wasserL: Math.round(wasser * M.volM3 * 1000),
        hub: sxx > 0 ? (sxy / sxx) * 2 * Math.PI : 0,
        folgt: a2 > 0 && a3 > 0 ? a1 / Math.sqrt(a2 * a3) : 0,
        fehlCm: fehl * 100,
        ohneKlick,
        wegUmdr: weg / (2 * Math.PI),
        hubSpanne: Math.max(...hubs) - Math.min(...hubs),
        pose: (() => {
            const c = welt(1.0, 2.3, 2.6);
            const l = welt(0, 0.4, 0);
            return { px: c.x, py: c.y, pz: c.z, lx: l.x, ly: l.y, lz: l.z };
        })(),
    };
};

// DER WERKSTATT-WAGEN UNTER VOLLGAS (Seite der Welt): der GT des Kerns zweimal gesetzt — sein Bauplan und derselbe mit größtem
// Radstand, Spur und Dach (die Masse des Kerns: Länge × Spur × Dach, vehicle-core carPhys) —, aufgesessen, eingeschwungen, dann
// `arg.takte` Takte zu 1/60 s mit gehaltenem Gas (die Verb-Tafel); gemessen die Masse des Fahr-Gesetzes am Werk
// (`_fahrzeugGesetzFor`), das Tempo des Spielers im Sattel und der Weg.
const formTempo = async (r, T, arg) => {
    const s = r.state;
    const VC = window.__vehicleCore;
    const pm = s.playerMesh.position;
    const hh = (x, z) => r.getTerrainHeightAt(x, z);
    if (!VC || !VC.PRESETS || !VC.PRESETS.gt) return { n: 0, fehler: "kein Rezept gt im Fahrzeug-Kern" };
    const x0 = pm.x;
    const z0 = pm.z;
    let t = performance.now();
    const tick = (n) => {
        for (let i = 0; i < n; i++) {
            t += 1000 / 60;
            try {
                r._gameLoopTick(t);
            } catch (_e) {}
        }
    };
    const halte = (vor) => {
        const g = s.verbTafel && s.verbTafel.gehalten;
        if (!g) return;
        for (const k of ["vor", "links", "zurueck", "rechts", "sprint", "jump"]) g[k] = false;
        g.vor = !!vor;
    };
    const stelle = () => {
        pm.set(x0, hh(x0, z0) + 1.2, z0);
        if (s.playerVel && s.playerVel.setValue) s.playerVel.setValue(0, 0, 0);
        if (s._fixedSimPos) s._fixedSimPos.copy(pm);
    };
    const VAR = [
        { name: "leicht", ov: null },
        { name: "schwer", ov: { radstand: 3.4, spur: 1.9, dach: 1.75 } },
    ];
    const laeufe = [];
    for (const v of VAR) {
        stelle();
        tick(4);
        const e = r.spawnArchitecture("fahrzeug_gt", { x: x0, y: hh(x0, z0) + 0.5, z: z0 }, Object.assign({ silent: true, precise: true, rotationY: 0 }, v.ov ? { studioOv: v.ov } : {}));
        if (!e) {
            laeufe.push({ name: v.name, fehler: "das Werk stand nicht" });
            continue;
        }
        try {
            await window.__gebautNach(e);
        } catch (_e) {}
        const g = r._fahrzeugGesetzFor(e);
        const masse = g && g.drive ? g.drive.mass : null;
        const mr = r.mountArchitecture(e);
        if (!mr || !mr.ok) {
            laeufe.push({ name: v.name, masse, fehler: "aufsitzen" });
            try {
                r.removeArchitecture(e);
            } catch (_e) {}
            continue;
        }
        halte(false);
        tick(12);
        const p0 = { x: pm.x, z: pm.z };
        halte(true);
        tick(arg.takte || 360);
        const v1 = Math.hypot(s.playerVel.x(), s.playerVel.z());
        const weg = Math.hypot(pm.x - p0.x, pm.z - p0.z);
        halte(false);
        try {
            r.dismountArchitecture();
        } catch (_e) {}
        try {
            r.removeArchitecture(e);
        } catch (_e) {}
        laeufe.push({ name: v.name, masse, v: +v1.toFixed(3), weg: +weg.toFixed(2) });
    }
    stelle();
    tick(4);
    const [L, S] = laeufe;
    const ok = L && S && Number.isFinite(L.v) && Number.isFinite(S.v) && L.v > 0;
    return { n: ok ? 1 : 0, laeufe, masseQ: ok && L.masse ? S.masse / L.masse : null, tempoQ: ok ? S.v / L.v : null };
};

// DIE REIHE DER EPOCHEN (Seite der Welt): je Stufe der Zeit-Achse des Kerns (EPOCHE_GESETZ) eine Limousine mit dem Stempel
// `epoche`, quer 12 m vor dem Spieler in einer Reihe zu 5,5 m; `weg` räumt die Reihe wieder ab.
const epochenReihe = async (r, T, arg) => {
    const s = r.state;
    const VC = window.__vehicleCore;
    const pm = s.playerMesh.position;
    const R = (window.__k2Reihe = window.__k2Reihe || []);
    if (arg.weg) {
        for (const e of R.splice(0)) {
            try {
                r.removeArchitecture(e);
            } catch (_e) {}
        }
        return { weg: true };
    }
    const E = VC && Array.isArray(VC.EPOCHE_GESETZ) ? VC.EPOCHE_GESETZ : [];
    const yaw = s.yaw || 0;
    const v = { x: Math.sin(yaw), z: Math.cos(yaw) }; // die EINE Vorwärts-Richtung (stamm/koerper-bewegung.js:1645 _blickVorn)
    const q = { x: -v.z, z: v.x };
    const ids = [];
    for (let i = 0; i < E.length; i++) {
        const o = (i - (E.length - 1) / 2) * 5.5;
        const x = pm.x + v.x * 12 + q.x * o;
        const z = pm.z + v.z * 12 + q.z * o;
        const e = r.spawnArchitecture("fahrzeug_limousine", { x, y: r.getTerrainHeightAt(x, z) + 0.5, z }, { silent: true, precise: true, rotationY: Math.atan2(q.x, q.z) - Math.PI / 2, studioOv: { epoche: i } });
        if (!e) continue;
        R.push(e);
        ids.push(E[i].id);
    }
    for (const e of R)
        try {
            await window.__gebautNach(e);
        } catch (_e) {}
    const cx = pm.x + v.x * 12;
    const cz = pm.z + v.z * 12;
    return { n: ids.length, soll: E.length, ids, pose: { px: pm.x - v.x * 2, py: pm.y + 2.2, pz: pm.z - v.z * 2, lx: cx, ly: r.getTerrainHeightAt(cx, cz) + 0.9, lz: cz } };
};

// DER VERKEHR EINER SPIELSTUNDE (Seite der Welt): die Welt rafft die Zeit — ihr Tag dauert 60 min Spielzeit
// (`DAY_LENGTH_DEFAULT_MINUTES`, stamm/daten.js:159), eine Stunde ihrer Uhr `_bewohnerStundeSek()` = 150 s
// (stamm/siedlung-bewohner.js:2422), und jeder Takt trägt höchstens `TAKT_DECKEL_S` (stamm/dirigent-takt.js:2699). Die Probe
// taktet Bündel ohne Pause zu `TAKT_DECKEL_S`, bis der VERKEHR eine Spielstunde rechnete: gezählt wird nur die Spielzeit der
// Takte, in denen der Kilometer-Zähler der Wagen (`zahl.km`) wuchs (ein Zwischen-Takt ohne Bild rechnet keinen Verkehr,
// stamm/dirigent-takt.js:86). Je Takt je Wagen, ob er fährt, sein Tempo, die Zeitlücke zum Vorderen (`W.vorder`); vorher ↔
// nachher die Stöße (`zahl.stoss`: Wagen, Leib, Bau), die Steckenbleiber ohne Anlass (`zahl.fest`) und der Weg je Wagen.
const verkehrLauf = async (r, T, arg) => {
    const s = r.state;
    const A = r.constructor;
    const V = A.VERKEHR;
    const SS = [...(r._bewohnerSiedlungen || new Map()).values()].filter((S) => S && S.verkehr && Array.isArray(S.verkehr.wagen) && S.verkehr.wagen.length);
    const WW = SS.flatMap((S) => S.verkehr.wagen);
    if (!WW.length) return { n: 0, wagen: 0, fehler: "kein Verkehr am Messort" };
    const stoss = () =>
        SS.reduce((a, S) => {
            const st = (S.verkehr.zahl && S.verkehr.zahl.stoss) || {};
            return a + (st.wagen || 0) + (st.leib || 0) + (st.bau || 0);
        }, 0);
    const fest = () => SS.reduce((a, S) => a + ((S.verkehr.zahl && S.verkehr.zahl.fest) || 0), 0);
    const km = () => SS.reduce((a, S) => a + ((S.verkehr.zahl && S.verkehr.zahl.km) || 0), 0);
    const stundeS = r._bewohnerStundeSek();
    const schrittMs = A.TAKT_DECKEL_S * 1000;
    const s0 = stoss();
    const f0 = fest();
    const z0 = s.spielZeit;
    const weg0 = WW.map((W) => W.weg || 0);
    const fahrS = WW.map(() => 0);
    const luecken = [];
    let steuerMax = 0;
    let takte = 0;
    let fehler = 0;
    let verkehrS = 0;
    let uhr = performance.now();
    const wand0 = performance.now();
    const ende = wand0 + (arg.ms || 20000);
    while (verkehrS < stundeS && performance.now() < ende) {
        for (let k = 0; k < 5 && verkehrS < stundeS; k++) {
            const sz = s.spielZeit;
            const k0 = km();
            uhr += schrittMs;
            try {
                r._gameLoopTick(uhr);
            } catch (_e) {
                fehler++;
            }
            takte++;
            const dt = s.spielZeit - sz;
            const lief = km() > k0;
            if (lief) verkehrS += dt;
            let steuer = 0;
            for (let i = 0; i < WW.length; i++) {
                const W = WW[i];
                if (W.b && W.b.amSteuer) steuer++;
                const fz = W.entry && W.entry._fahr;
                if (!lief || W.zustand !== "faehrt" || !fz) continue;
                fahrS[i] += dt;
                const v = fz.speed;
                const o = W.vorder;
                if (o && v > 2 && o.gap > 0 && o.gap < V.folgeM && o.v > 1) luecken.push(o.gap / v);
            }
            if (steuer > steuerMax) steuerMax = steuer;
        }
        await window.sleep();
    }
    const wandS = (performance.now() - wand0) / 1000;
    const weg = WW.reduce((a, W, i) => a + Math.max(0, (W.weg || 0) - weg0[i]), 0);
    const zeit = fahrS.reduce((a, x) => a + x, 0);
    luecken.sort((a, b) => a - b);
    const mitte = luecken.length ? luecken[Math.floor(luecken.length / 2)] : null;
    return {
        n: steuerMax,
        wagen: WW.length,
        fahrer: WW.reduce((a, W) => a + ((W.fahrer && W.fahrer.length) || 1), 0),
        kollisionen: stoss() - s0,
        stillstand: fest() - f0,
        reisetempo: zeit > 0 ? weg / zeit / V.tempoMs : 0,
        zeitluecke: mitte,
        luecken: luecken.length,
        stunden: +(verkehrS / stundeS).toFixed(3),
        stundeS,
        verkehrS: +verkehrS.toFixed(1),
        spielS: +(s.spielZeit - z0).toFixed(1),
        wandS: +wandS.toFixed(1),
        msJeTakt: takte ? +((wandS * 1000) / takte).toFixed(1) : null,
        takte,
        fehler,
        wegM: Math.round(weg),
    };
};

// DIE SÄTZE DES SPIELERS → FAHRZEUG (Seite der Welt): jeder Satz durch `parseChatToDsl`; gezählt, wessen Programm einen Bau-Op
// trägt, der ein Fahrzeug nennt.
const saetzeFahr = async (r, T, arg) => {
    const baut = (p) => Array.isArray(p) && ((typeof p[0] === "string" && /^spawn_/.test(p[0])) || p.some(baut));
    const ja = [];
    for (const t of arg.saetze || []) {
        let p = null;
        try {
            p = r.parseChatToDsl(t);
        } catch (_e) {}
        if (p && baut(p.program) && /fahrzeug|wagen|vehicle|boot|karren/i.test(JSON.stringify(p.program))) ja.push(t);
    }
    return { n: ja.length, von: (arg.saetze || []).length, ja: ja.slice(0, 8) };
};

const PFAD = ["vehicle-core.js", "stamm/koerper-*.js", "stamm/siedlung-*.js", "stamm/gelaende-kollision.js"];
const PROBE = "[linse-gpu] amd/rdna-3 (Probe)";

module.exports = (F) => [
    // ── mensch.fahrzeug.medium — die Medien der Fahrt. S1 urteilt die bestehende Brems-Kette; S2–S8 der Umfang an der Welt gezählt:
    // die Fahr-Rezepte mit eigener Physik, die Werke je Medium, das EINE g des Kerns.
    F.leiter("mensch.fahrzeug.medium", {
        sek: 45,
        pfad: PFAD,
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let z = null;
            try {
                z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
            } catch (e) {
                H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
            }
            if (z) H.zeile("Zensus: Medien " + JSON.stringify(z.medien) + " · Rezepte " + JSON.stringify(z.rezepte).slice(0, 240) + " · g " + z.g);
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z;
            };
            // S2 ÜBER DEN FÄCHER (stationen/faecher.js): 20 Saaten × die Land-Rezepte des Kerns bis 130 km/h (Rad im Boden, Spitze ≥ 130 —
            // das Boot trägt kein Rad, der Leiterwagen zieht 5,8 km/h: beide beim Namen im Beleg), je Adresse die Bremsung des Wagens der
            // Welt am Ort der Saat (BREMS_AN): die Physik je Saat aus der Fahrt der Welt (verschiedene Fahrten — Wege und Rinne — am ärmsten
            // Rezept), das Band „30–50 m ∝ v²/μ“ auf dem Prüfstand mit dem Boden der Saat (der Weg × (μ + f_r): 30–50 m aus 100 km/h,
            // 7,5–12,5 m aus 50 km/h; `steil` nennt das größte Gefälle am Wagen der Welt, `flug` die Fahrten, auf denen er abhob), die
            // Spurrinne nach 10 Durchfahrten in m am weichsten Boden der Saaten (fester Grund 0, `rinneFest` nennt ihn)
            await K.schritt(2, async () => {
                const R0 = da().rezepte.filter((x) => x.m != null);
                const orte = R0.filter((x) => x.rad && x.v * 3.6 >= 130).map((x) => x.k);
                const ohne = R0.filter((x) => !orte.includes(x.k)).map((x) => x.k + (x.rad ? " " + Math.round(x.v * 36) / 10 + " km/h" : " ohne Rad"));
                if (!orte.length) return K.leser(2, { fehlt: "kein Rezept des Kerns steht mit Rad im Boden bis 130 km/h (" + ohne.join(", ") + ")", wo: "vehicle-core.js:4030 exportDrive huelle.radB" });
                const land = (a, w) => !w.wasser;
                const anteil = (von, bis) => (v) => (v.length ? v.filter((x) => x >= von && x <= bis).length / v.length : null);
                const R = await H.seite.FAECHER(K.welt, {
                    gesetz: {
                        fn: H.seite.BREMS_AN,
                        export: "vehicle-core.js:4030 exportDrive → :4226 fahrGesetz → :4516 fahrKraefte (e.haft, e.boden = :4306 radImBoden) → :4431 fahrStand",
                        leser: "stamm/koerper-fahrt.js:1581 _wagenSchritt (:1837 _fahrGrund → stamm/gelaende-kollision.js:1113 _kontaktStoffAt)",
                    },
                    adressen: { saaten: 20, orte },
                    ms: Math.max(4000, Math.floor((H.rest() - 4) * 1000)),
                    masse: {
                        imBand: { wie: anteil(30, 50), feld: "norm100", nur: land },
                        imBand50: { wie: anteil(7.5, 12.5), feld: "norm50", nur: land },
                        norm100: { wie: (v) => (v.length ? Math.min(...v) + "–" + Math.max(...v) : "—"), feld: "norm100", nur: land },
                        steil: { wie: "max", feld: "steil", nur: land },
                        flug: { wie: (v) => v.filter((x) => x > 0).length, feld: "luft", nur: land },
                        weg100: { wie: (v) => (v.length ? Math.min(...v) + "–" + Math.max(...v) : "—"), feld: "weg100", nur: land },
                        bis130: { wie: (v) => v.filter((x) => x >= 130).length, feld: "vmaxKmh", nur: land },
                        imWelt: { wie: anteil(30, 50), feld: "welt100", nur: land },
                        flattert: { wie: "summe", feld: "flattert", nur: land },
                        welt100: { wie: (v) => (v.length ? Math.min(...v) + "–" + Math.max(...v) : "—"), feld: "welt100", nur: land },
                        imKreis: { wie: anteil(0.95, 1.01), feld: "kurve", nur: land },
                        kurve: { wie: (v) => (v.length ? Math.min(...v) + "–" + Math.max(...v) : "—"), feld: "kurve", nur: land },
                        muSpanne: { wie: (v) => (v.length ? Math.min(...v) + "–" + Math.max(...v) : "—"), feld: "mu", nur: land },
                        rinne: { wie: "max", feld: "rinne", nur: land },
                        rinneFest: { wie: (v) => (v.length ? Math.max(...v) : 0), feld: "rinne", nur: (a, w) => land(a, w) && !w.weich },
                        weich: { wie: "summe", feld: "weich", nur: land },
                        stoffe: { wie: "verschieden", feld: "stoff", nur: land },
                        wasser: { wie: "anzahl", nur: (a, w) => !!w.wasser },
                        physik: { wie: (v, aus) => Math.min(...orte.map((o) => new Set(aus.filter((x) => x.a.ort === o).map((x) => JSON.stringify([x.w.weg100, x.w.weg50, x.w.rinne]))).size)), nur: land },
                    },
                    schlecht: { feld: "weg100", richtung: "max" },
                });
                H.zeile("Medium S2: " + R.akte.slice(0, 400));
                if (R.fehlt) return K.leser(2, { fehlt: R.fehlt, wo: "stamm/koerper-fahrt.js:1837 _fahrGrund · vehicle-core.js:4306 radImBoden" });
                // die Spur nach 10 Durchfahrten im Bild der Karte (SPUR_SICHT) — nach dem Fächer, an einem weichen Ort um den Spieler
                let sp = null;
                try {
                    sp = await K.welt("return await (" + H.seite.SPUR_SICHT + ")(r, T, {});");
                } catch (e) {
                    H.zeile("Spur warf: " + String(e && e.message).slice(0, 200));
                }
                if (sp && sp.fehlt) return K.leser(2, { fehlt: sp.fehlt, wo: "stamm/koerper-fahrt.js _fahrRad → stamm/siedlung-wege.js _tritt" });
                H.zeile("Medium S2 Spur: " + JSON.stringify(sp));
                const w = Object.assign({}, R.werte, { sicht: sp && sp.zellen ? sp.anteil : 0 }), pz = (q) => (q == null ? "—" : Math.round(q * 100) + " %");
                return K.zahl(2, {
                    n: w.physik,
                    werte: { imBand: w.imBand, imBand50: w.imBand50, imKreis: w.imKreis, imWelt: w.imWelt, flattert: w.flattert, rinne: w.rinne, sicht: w.sicht },
                    beleg: w.physik + " Fahrten je Rezept über 20 Saaten · Prüfstand auf dem Boden der Saat (eben, 49 CFR 571.135 S6.2.2): Weg × (μ + f_r) im Band 100→0 " + pz(w.imBand) + " (" + w.norm100 + " m), 50→0 " + pz(w.imBand50) + " · die Kurvengrenze im Kreis " + w.kurve + " μ·g (μ " + w.muSpanne + "), im Band 0,95–1,01 " + pz(w.imKreis) + " · die Welt: Bremsweg 100→0 " + w.weg100 + " m am Ort (Gefälle am Wagen bis " + pz(w.steil) + ", " + w.flug + " Fahrten mit Flug, " + w.flattert + " ohne Kuppe), der Weg am Boden × (μ + f_r) mit der Höhe im Band 30–50 m " + pz(w.imWelt) + " (" + w.welt100 + " m) · Rinne " + w.rinne + " m (fest " + w.rinneFest + " m) · die Spur nach 10 Durchfahrten gemalt " + pz(w.sicht) + (sp && sp.zellen ? " von " + sp.zellen + " Zellen (nach einer " + pz(sp.anteil1) + ", Erde " + pz(sp.erde) + ", " + sp.tritte + " Tritte je Zelle, zurück bis auf " + sp.rest + ", Ort " + sp.ort + ")" : " (" + ((sp && sp.grund) || "keine Spur") + ")") + " · " +
                        w.stoffe + " Böden, " + w.weich + " Adressen weich, " + w.wasser + " im Wasser · ≥ 130 km/h " + w.bis130 + "/" + R.gemessen + " · ohne: " + ohne.join(", ") + " · " + R.akte,
                    taeter: w.physik < 20 ? w.physik + " Fahrten je Rezept über 20 Saaten (gleicher Boden, gleicher Hang)" : w.flattert > 0 ? w.flattert + " Welt-Fahrten heben ohne Kuppe ab (vehicle-core.js fahrStand: das Rad verliert den Griff vor dem Federweg)" : !(w.rinne > 0) ? "kein weicher Boden auf der Spirale der Saaten (" + w.stoffe + " Böden)" : !(w.sicht >= 1) ? (sp && sp.zellen ? "die Spur von 10 Durchfahrten bleibt unsichtbar (gemalt " + pz(w.sicht) + ", " + sp.tritte + " Tritte je Zelle, der Pfad ab 27,7 — stamm/koerper-fahrt.js _fahrRad → stamm/siedlung-wege.js _tritt, TRITT.rad)" : "kein weicher Ort für die Spur (" + ((sp && sp.grund) || "SPUR_SICHT warf") + ")") : null,
                });
            });
            await K.schritt(3, async () => K.nicht(3, { n: da().medien.wasser, fehlt: "Wasser: kein Floß, Boot oder Segler steht in der Welt" }));
            await K.schritt(4, async () => K.nicht(4, { n: (da().medien.schiene > 0 ? 1 : 0) + (da().medien.luft > 0 ? 1 : 0), fehlt: "Schiene und Luft: Schienen-Werke " + da().medien.schiene + " · Luft-Werke " + da().medien.luft }));
            await K.schritt(5, async () => K.nicht(5, { n: da().medien.tief, fehlt: "Tiefsee, Verformung, Untergang: kein Tauch-Werk, kein Wagen verformt sich" }));
            await K.schritt(6, async () => K.nicht(6, { n: da().medien.raum, fehlt: "Raum, Orbit, Mond: kein Raum-Werk steht in der Welt" }));
            await K.schritt(7, async () => K.leser(7, { n: da().g === 9.8 ? 1 : 0, fehlt: "kein Planet trägt sein g und ρ: der Fahr-Kern liest die Konstante FAHR.G = " + da().g, wo: "vehicle-core.js:3080" }));
            await K.schritt(8, async () => K.nicht(8, { n: da().medien.raum, fehlt: "zwischen Sonnensystemen: kein Raum-Werk, keine Uhr an Bord neben der Uhr daheim" }));
        },
        seite: { ZENSUS: zensusFahr, FAECHER, BREMS_AN, SPUR_SICHT },
        sprossen: {
            2: {
                umfang: { soll: 20, wort: "Saaten bis 130 km/h mit eigener Physik" },
                masse: [
                    {
                        key: "imBand",
                        wort: "Anteil der Saaten mit Bremsweg 100 → 0 × (μ + f_r) auf dem Boden der Saat in 30–50 m",
                        soll: 1,
                        richtung: "≥",
                        herkunft: "„30–50 m ∝ v²/μ“ (der Richter der Karte) auf der Bahn der Profis — höchstens 1 % Gefälle längs, 2 % quer (49 CFR 571.135 S6.2.2): derselbe Wagen bremst eben auf dem Boden der Saat (ihr Stoff, μ, Satz im Boden, Feuchte, Rinne — die Leser des Wagens am Ort), gemessen der Weg × (μ + f_r): die Haftung und der Widerstand des weichen Bodens (Bekker Rc/W, Wong 2001 §2.4), auf dem Asphalt des Labors der Weg selbst",
                    },
                    {
                        key: "imBand50",
                        wort: "Anteil der Saaten mit Bremsweg 50 → 0 × (μ + f_r) auf dem Boden der Saat in 7,5–12,5 m",
                        soll: 1,
                        richtung: "≥",
                        herkunft: "„∝ v²/μ“: das Band 30–50 m bei 100 km/h mal (50/100)² = 0,25 ergibt 7,5–12,5 m bei 50 km/h, auf dem Prüfstand wie oben",
                    },
                    {
                        key: "imKreis",
                        wort: "Anteil der Saaten mit Kurvengrenze a_quer ÷ μ·g im Kreis in 0,95–1,01",
                        soll: 1,
                        richtung: "≥",
                        herkunft: "die Karte: a_quer = μ·g — derselbe Wagen im Kreis auf dem Prüfstand der Saat, μ = der Boden der Saat (`_fahrHaft`) × der Reifen des Rezepts (maxGrip · grip); das Band: der Reifen gibt im Grenzbereich höchstens μ·g (1,01: das Raster der Zahl), und ein Wagen, der vor 95 % der Haftung ausbricht, verschenkt die Kurve",
                    },
                    {
                        key: "flattert",
                        wort: "Welt-Fahrten 100 → 0, die ohne Kuppe abheben (der Boden fiel nie weiter als den Federweg unter den Wagen)",
                        soll: 0,
                        richtung: "≤",
                        herkunft: "die Fallkurve: ein Rad verliert den Griff erst, wenn der Boden schneller fällt, als der Wagen fällt, und weiter, als sein Federweg reicht — über einer Welle federt das Rad aus, es fliegt nicht; bis fahrzeug-medium-2 hob der Wagen 2 cm unter der Fallkurve ab (Genesis 60 von 120 Welt-Fahrten)",
                    },
                    { key: "rinne", wort: "Spurrinne nach 10 Durchfahrten in m", soll: 0, richtung: ">" },
                    {
                        key: "sicht",
                        wort: "Anteil der Zellen der Spur, die die Wege-Karte nach 10 Durchfahrten als Pfad malt",
                        soll: 1,
                        richtung: "≥",
                        herkunft: "die Karte: „Spurrinne nach 10 Durchfahrten sichtbar“ — sichtbar ist, was der Boden-Shader liest: die Wege-Karte malt eine Zelle ab der Stufe des Pfads (27,7 Tritte des Fußes, `_trittStufe`); das Gewicht des Rads nach Weaver & Dale 1978 (J. Appl. Ecol. 15; USDA SDTDC 0423-1201, Kap. 3): 200 Durchfahrten eines Motorrads nahmen 9× so viel Bewuchs wie 200 Wanderer, zwei Räder in einer Spur — 4,5 Tritte je Rad",
                    },
                ],
                erwartet: "zahl",
            },
            3: {
                umfang: { soll: 1, wort: "Wasserfahrzeug (Floß bis Segler)" },
                masse: [
                    { key: "wende", wort: "Wende in Grad", von: 80, bis: 100 },
                    { key: "hoehe", wort: "Höhe gegen den Wind in m", soll: 0, richtung: ">" },
                    { key: "rollQ", wort: "Rollperiode ÷ Formel", soll: 1, tol: 0.15 },
                ],
                erwartet: "nicht",
                fehlt: "kein Wasserfahrzeug in der Welt",
            },
            4: {
                umfang: { soll: 2, wort: "Medien Schiene und Luft" },
                masse: [
                    { key: "zug2", wort: "Zug fährt an 2 % an (1 ja)", soll: 1, richtung: "≥" },
                    { key: "zug4", wort: "Zug fährt an 4 % an (0 nein)", soll: 0, richtung: "≤" },
                    { key: "ueberziehQ", wort: "Überziehtempo ÷ Formel", soll: 1, tol: 0.1 },
                ],
                erwartet: "nicht",
                fehlt: "kein Schienen- und kein Luft-Werk in der Welt",
            },
            5: {
                umfang: { soll: 1, wort: "Tiefsee-Werk mit Verformung und Untergang" },
                masse: [
                    { key: "crashImBand", wort: "Anteil der Crashs mit Tiefe im Band realer Tests", soll: 1, richtung: "≥" },
                    {
                        key: "sinkImFall",
                        wort: "Anteil der Untergänge mit Sinkdauer in der Spanne der Quellen des dokumentierten Falls",
                        soll: 1,
                        richtung: "≥",
                        herkunft: "„gegen dokumentierten Fall“: die Spanne seiner Quellen ist das Band, wie dem Crash „im Band realer Tests“",
                    },
                ],
                erwartet: "nicht",
                fehlt: "kein Tauch-Werk, keine Verformung aus der Stoff-Zeile",
            },
            6: {
                umfang: { soll: 1, wort: "Raum-Werk (Boden → Orbit → Mond)" },
                masse: [{ key: "keplerQ", wort: "Orbit-Periode ÷ Kepler", soll: 1, tol: 0.01 }],
                erwartet: "nicht",
                fehlt: "kein Raum-Werk in der Welt",
            },
            7: {
                umfang: { soll: 100, wort: "Saaten fremder Welten (g, ρ, Meer)" },
                masse: [{ key: "skalierung", wort: "Anteil der Saaten mit korrekter Skalierung in g und ρ", soll: 0.95, richtung: "≥" }],
                erwartet: "leser",
                fehlt: "kein Planet trägt sein g: der Fahr-Kern liest die Konstante FAHR.G 9,8",
                wo: "vehicle-core.js:3080",
            },
            8: {
                umfang: { soll: 1, wort: "Fahrzeug zwischen Sonnensystemen" },
                masse: [{ key: "lorentzQ", wort: "Uhren-Abweichung ÷ Lorentz-Faktor bei 0,9 c", soll: 1, tol: 0.01 }],
                erwartet: "nicht",
                fehlt: "kein Raum-Werk, keine Bord-Uhr",
            },
        },
        bestehend: { 1: "karte2.mensch.fahrzeug.medium#1" },
        proben: {
            2: [
                {
                    name: "ATTRAPPE: 20 Saaten bremsen im Band, der Boden bleibt glatt (Spurrinne 0)",
                    j: { leiter: "mensch.fahrzeug.medium", adapter: PROBE, sprossen: { 2: { art: "zahl", n: 20, werte: { imBand: 1, imBand50: 1, imKreis: 1, flattert: 0, rinne: 0, sicht: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Spurrinne nach 10 Durchfahrten in m 0 verfehlt/,
                },
                {
                    name: "der Bremsweg wächst linear mit v (50 → 0 in 15–25 m, die Hälfte von 100 → 0)",
                    j: { leiter: "mensch.fahrzeug.medium", adapter: PROBE, sprossen: { 2: { art: "zahl", n: 20, werte: { imBand: 1, imBand50: 0, rinne: 0.05 } } } },
                    gruen: false,
                    zahl: /ROT an Anteil der Saaten mit Bremsweg 50 → 0 × \(μ \+ f_r\) auf dem Boden der Saat in 7,5–12,5 m 0 verfehlt/,
                },
                {
                    name: "das Rad tritt wie ein Fuß: die Rinne gräbt, die Spur von 10 Durchfahrten bleibt unsichtbar (20 Tritte, der Pfad ab 27,7)",
                    j: { leiter: "mensch.fahrzeug.medium", adapter: PROBE, sprossen: { 2: { art: "zahl", n: 20, werte: { imBand: 1, imBand50: 1, imKreis: 1, flattert: 0, rinne: 0.05, sicht: 0 } } } },
                    gruen: false,
                    zahl: /ROT an Anteil der Zellen der Spur, die die Wege-Karte nach 10 Durchfahrten als Pfad malt 0 verfehlt/,
                },
            ],
            4: [
                {
                    name: "der Zug fährt jede Steigung an (4 % ja)",
                    j: { leiter: "mensch.fahrzeug.medium", adapter: PROBE, sprossen: { 4: { art: "zahl", n: 2, werte: { zug2: 1, zug4: 1, ueberziehQ: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Zug fährt an 4 % an/,
                },
            ],
        },
    }),

    // ── mensch.fahrzeug.form — die Form bestimmt die Fahrt. S1 der Werkstatt-Wagen in zwei Bauplänen unter Vollgas auf der Wiese
    // (Masse am Werk, Tempo im Sattel); S2–S6 der Umfang gezählt (Rezepte, Hüllen, Sätze, Kulturen, Epochen).
    F.leiter("mensch.fahrzeug.form", {
        sek: 60,
        mutiert: true,
        pfad: [...PFAD, "stamm/feld-sprache.js"],
        messe: async (H, K) => {
            await K.messort("wiese");
            let z = null;
            try {
                z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
            } catch (e) {
                H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
            }
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z;
            };
            await K.schritt(2, async () => K.nicht(2, { n: da().rezepte.length, fehlt: "50 Baupläne an Land: der Fahrzeug-Kern trägt " + da().rezepte.length + " Rezepte (" + da().rezepte.map((x) => x.k).join(", ") + ")" }));
            await K.schritt(3, async () => K.nicht(3, { n: da().medien.wasser + da().medien.luft, fehlt: "Rumpf, Segel, Flügel aus Teilen: kein Floß und kein Gleiter steht in der Welt" }));
            await K.schritt(5, async () => K.nicht(5, { n: da().kulturen, fehlt: "10³ Kultur-Saaten: der Kern trägt " + da().kulturen + " Kulturen (eingefrorene Marken-Vektoren)" }));
            await K.schritt(6, async () => K.nicht(6, { n: 0, fehlt: "Technik-Evolution über 500 Jahre: die Epochen sind eine feste Tafel (" + da().epochen.join(" · ") + "), keine Auslese durch Gebrauch" }));
            await K.schritt(4, async () => {
                const verb = ["baue", "bau mir", "mach mir", "erschaffe", "stell mir"];
                const ding = ["einen wagen", "ein auto", "einen karren", "ein boot", "ein floß", "einen schlitten", "eine kutsche", "ein fahrrad", "einen zug", "einen gleiter",
                    "ein flugzeug", "einen lastwagen", "einen rennwagen", "einen traktor", "ein segelboot", "eine rakete", "einen bus", "ein motorrad", "einen ochsenkarren", "eine sänfte"];
                const saetze = verb.flatMap((v) => ding.map((d) => v + " " + d));
                const o = await K.welt("return await (" + H.seite.SAETZE + ")(r, T, " + JSON.stringify({ saetze }) + ");");
                H.zeile("Sätze → Fahrzeug: " + o.n + "/" + o.von);
                K.nicht(4, { n: o.n, fehlt: "10² Sätze → Fahrzeug: der Parser trägt " + o.n + " von " + o.von + " Fahrzeug-Sätzen" });
            });
            await K.schritt(1, async () => {
                const o = await K.welt("return await (" + H.seite.FORM + ")(r, T, " + JSON.stringify({ takte: 360 }) + ");", 50000);
                H.zeile("Werkstatt-Wagen: " + JSON.stringify(o).slice(0, 300));
                const [L, S] = o.laeufe || [];
                K.zahl(1, {
                    n: o.n,
                    werte: { masseQ: o.masseQ, tempoQ: o.tempoQ },
                    beleg: L && S ? "leicht Masse " + L.masse + " · " + L.v + " m/s · " + L.weg + " m; schwer Masse " + S.masse + " · " + S.v + " m/s · " + S.weg + " m nach 6 s Vollgas" : o.fehler || JSON.stringify(o.laeufe),
                    taeter: o.tempoQ != null && o.tempoQ >= 1 ? "carPhys: die Leistung je Masse ist fest (P.leistung kW/t, vehicle-core.js:3412) — die schwere Form zieht gleich" : null,
                });
            });
        },
        seite: { ZENSUS: zensusFahr, FORM: formTempo, SAETZE: saetzeFahr },
        sprossen: {
            1: {
                umfang: { soll: 1, wort: "Werkstatt-Wagen, in zwei Bauplänen gefahren" },
                masse: [
                    { key: "masseQ", wort: "Masse schwer ÷ leicht", soll: 1, richtung: ">" },
                    { key: "tempoQ", wort: "Tempo nach 6 s Vollgas schwer ÷ leicht", soll: 1, richtung: "<" },
                ],
            },
            2: {
                umfang: { soll: 50, wort: "Baupläne an Land" },
                masse: [{ key: "kippQ", wort: "Kippgrenze ÷ statische Formel", soll: 1, tol: 0.15 }],
                erwartet: "nicht",
                fehlt: "50 Baupläne an Land: der Kern trägt sechs Rezepte",
            },
            3: {
                umfang: { soll: 2, wort: "Werke mit gebauter Hülle (Floß, Gleiter)", herkunft: "der Richter nennt zwei Werke aus Teilen: das Floß (sinkt/schwimmt) und den Gleiter (fällt/fliegt)" },
                masse: [
                    { key: "flossQ", wort: "Floß: Grenze sinkt ↔ schwimmt ÷ Formel", soll: 1, tol: 0.15 },
                    { key: "gleiterQ", wort: "Gleiter: Grenze fällt ↔ fliegt ÷ Formel", soll: 1, tol: 0.15 },
                ],
                erwartet: "nicht",
                fehlt: "kein Floß und kein Gleiter aus Teilen",
            },
            4: {
                umfang: { soll: 100, wort: "Sätze → Fahrzeug" },
                masse: [{ key: "aufgabe", wort: "Anteil der Fahrzeuge, die ihre Aufgabe im Spiel erfüllen", soll: 0.9, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "der Parser baut aus keinem Satz ein Fahrzeug",
            },
            5: {
                umfang: { soll: 1000, wort: "Kultur-Saaten" },
                masse: [
                    { key: "physik", wort: "Anteil, der den Physik-Test besteht", soll: 0.95, richtung: "≥" },
                    { key: "ohneMetall", wort: "Anteil ohne Metall, wo die Kultur kein Metall kennt", soll: 1, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "10³ Kultur-Saaten: der Kern trägt eine Handvoll Marken",
            },
            6: {
                auge: { pose: "Messort wiese: die Ahnen-Reihe nach 500 Jahren Zeitraffer, 12 m vor dem Spieler", vorbild: "Ahnenreihen realer Fahrzeuge (Museum: Kutsche → Benz Patent-Motorwagen → Limousine)" },
                erwartet: "nicht",
                fehlt: "Technik-Evolution über 500 Jahre: die Epochen sind eine feste Tafel",
            },
        },
        proben: {
            1: [
                {
                    name: "die schwere Form zieht gleich (Tempo 1,00 bei Masse 1,9×)",
                    j: { leiter: "mensch.fahrzeug.form", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { masseQ: 1.9, tempoQ: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Tempo nach 6 s Vollgas schwer ÷ leicht 1 verfehlt/,
                },
                {
                    name: "ATTRAPPE: der Stempel trug keine Masse (zwei gleiche Wagen, Tempo durch das Gelände verschieden)",
                    j: { leiter: "mensch.fahrzeug.form", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { masseQ: 1, tempoQ: 0.9 } } } },
                    gruen: false,
                    zahl: /ROT an Masse schwer ÷ leicht 1 verfehlt/,
                },
            ],
        },
    }),

    // ── mensch.fahrzeug.gestalt — die Gestalt im Bild. S1 die Straße mit den Wagen der Stadt (≥ 5 Gattungen gezählt), S2 die Reihe
    // der Epochen des Kerns 12 m vor dem Spieler; S3–S6 der Umfang gezählt.
    F.leiter("mensch.fahrzeug.gestalt", {
        sek: 60,
        mutiert: true,
        pfad: PFAD,
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let z = null;
            try {
                z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
            } catch (e) {
                H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
            }
            if (z) H.zeile("Zensus: Fahrzeug-Typen " + JSON.stringify(z.fahrzeugTypen) + " · Wagen " + z.wagen + " · Epochen " + z.epochen.join(","));
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z;
            };
            const medien = () => Object.keys(da().medien).filter((k) => ["land", "wasser", "schiene"].includes(k) && da().medien[k] > 0).length;
            await K.schritt(3, async () => K.nicht(3, { n: medien(), fehlt: "10³ Saaten in Land, Wasser, Schiene: die Welt trägt " + medien() + " Medium (Land), " + da().fahrzeugTypen.length + " Fahrzeug-Typen" }));
            await K.schritt(4, async () => K.nicht(4, { n: da().wagen, fehlt: "10² Wagen einer Straße: die Stadt trägt " + da().wagen + " Wagen" }));
            await K.schritt(5, async () => K.nicht(5, { n: da().fremd, fehlt: "fremde Evolutionen: kein Fahrzeug eines fremden Leibs" }));
            await K.schritt(6, async () => K.nicht(6, { n: da().fremd, fehlt: "10⁴ Planeten-Saaten: die Welt trägt einen Planeten ohne fremde Zivilisation" }));
            await K.schritt(2, async () => {
                const o = await K.welt("return await (" + H.seite.REIHE + ")(r, T, {});", 45000);
                H.zeile("Reihe der Epochen: " + o.n + "/" + o.soll + " " + (o.ids || []).join(", "));
                try {
                    if (o.n < o.soll || o.n < 6) return K.nicht(2, { n: o.n, fehlt: "Land −5000 bis 2150: die Reihe trägt " + o.n + " von " + o.soll + " Stufen" });
                    const b = await K.bild(2, o.pose);
                    K.auge(2, { bild: b.datei, pose: "stadt-voll: 2 m hinter dem Spieler, 2,2 m hoch, Blick auf die Reihe der Epochen 12 m vor ihm", mass: o.n + " Stufen: " + o.ids.join(" · ") });
                } finally {
                    await K.welt("return await (" + H.seite.REIHE + ")(r, T, " + JSON.stringify({ weg: true }) + ");");
                }
            });
            await K.schritt(1, async () => {
                const w = da();
                const n = w.fahrzeugTypen.length;
                if (n < 5) return K.nicht(1, { n, fehlt: "5 Gattungen: die Welt trägt " + n + " Fahrzeug-Typen (" + w.fahrzeugTypen.join(", ") + ")" });
                if (!w.posen.strasse) throw new Error("kein Wagen am Messort");
                const b = await K.bild(1, w.posen.strasse);
                K.auge(1, { bild: b.datei, pose: "stadt-voll: 12 m vor dem nächsten Wagen der Stadt, 2 m über Grund", mass: n + " Fahrzeug-Typen, " + w.wagen + " Wagen" });
            });
        },
        seite: { ZENSUS: zensusFahr, REIHE: epochenReihe },
        sprossen: {
            1: {
                auge: { pose: "Messort stadt-voll: 12 m vor dem nächsten Wagen der Stadt in Richtung des Spielers, 2 m über Grund, Blick auf den Wagen", vorbild: "Fotos realer Straßen mit Wagen fünf Gattungen (Kleinwagen, Limousine, SUV, Lieferwagen, Sportwagen): ≥ 90 % als Gattung erkannt" },
                erwartet: "nicht",
                fehlt: "5 Gattungen: die Welt trägt weniger Fahrzeug-Typen",
            },
            2: {
                auge: { pose: "Messort stadt-voll: 2 m hinter dem Spieler, 2,2 m hoch, Blick auf die Reihe der sechs Epochen 12 m vor ihm (5,5 m Abstand)", vorbild: "Museumsfotos je Epoche: Schleife, Ochsenkarren, Kutsche, Motorwagen, Limousine, Zukunftsstudie (Silhouette IoU ≥ 0,7, Epoche ± 1 Jh.)" },
            },
            3: { auge: { pose: "Messort stadt-voll: 10³ Saaten in Reihe", vorbild: "Fotos von Dschunke, Kogge, Dhau und Wagen aller Kulturen" }, erwartet: "nicht", fehlt: "10³ Saaten in Land, Wasser, Schiene: die Welt trägt ein Medium" },
            4: { auge: { pose: "Messort stadt-voll: die Straße mit 10² Wagen", vorbild: "Fotos einer realen Straße mit gealterten, beladenen, verbeulten Wagen (Alter ± 10 J)" }, erwartet: "nicht", fehlt: "10² Wagen einer Straße: die Stadt trägt 20" },
            5: { auge: { pose: "Fahrzeuge fremder Leiber an fester Pose", vorbild: "„nicht von der Erde“ und „passt zum Leib“ im Panel (Fremdwelt-Probe R10)" }, erwartet: "nicht", fehlt: "fremde Evolutionen: kein fremder Leib baut Fahrzeuge" },
            6: { auge: { pose: "je Zivilisation eine Reihe ihrer Fahrzeuge", vorbild: "Formensprachen: zwischen ≥ 95 % unterscheidbar, innerhalb Familie ≥ 80 % (Fremdwelt-Probe R10)" }, erwartet: "nicht", fehlt: "10⁴ Planeten-Saaten: ein Planet" },
        },
        proben: {
            2: [
                {
                    name: "die Reihe stand nicht im Bild (kein Schuss) — UNGEMESSEN, nie ein Augen-Urteil",
                    j: { leiter: "mensch.fahrzeug.gestalt", adapter: PROBE, sprossen: { 2: { art: "auge", bild: "", pose: "Reihe der Epochen" } } },
                    gruen: false,
                    zahl: /keine Messung der Sprosse$/,
                },
            ],
        },
    }),

    // ── mensch.fahrzeug.lenker — wer fährt. S1 der Verkehr der Stadt über die Takte (am Steuer, Stöße, Zeitlücke, Reisetempo,
    // Steckenbleiber, Spielzeit); S2–S6 der Umfang gezählt.
    F.leiter("mensch.fahrzeug.lenker", {
        sek: 60,
        mutiert: true,
        pfad: [...PFAD, "fachwerk-core.js"],
        messe: async (H, K) => {
            await K.messort("stadt-voll");
            let z = null;
            try {
                z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
            } catch (e) {
                H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
            }
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z;
            };
            await K.schritt(3, async () => K.nicht(3, { n: da().strecken, fehlt: "Rennfahrer auf 20 Strecken: die Welt trägt keine Rennstrecke" }));
            await K.schritt(4, async () => K.nicht(4, { n: (da().medien.wasser > 0 ? 1 : 0) + (da().medien.luft > 0 ? 1 : 0), fehlt: "Kapitän und Pilot: kein Wasser- und kein Luftfahrzeug mit Lenker" }));
            await K.schritt(5, async () => K.nicht(5, { n: da().wettkampf, fehlt: "Sport mit Gefährt: kein Wettkampf, kein Feld, kein Windschatten" }));
            await K.schritt(6, async () => K.nicht(6, { n: da().fremd, fehlt: "fremde Lenker in fremden Medien: kein fremder Leib am Steuer" }));
            await K.schritt(2, async () => K.nicht(2, { n: da().wagen, fehlt: "10² Fahrer mit Charakter: die Stadt trägt " + da().wagen + " Wagen, ihr Stil ist EINER (VERKEHR.stil)" }));
            await K.schritt(1, async () => {
                const ms = Math.max(5000, (H.rest() - 6) * 1000);
                const o = await K.welt("return await (" + H.seite.VERKEHR + ")(r, T, " + JSON.stringify({ ms }) + ");", ms + 20000);
                H.zeile("Verkehr: " + JSON.stringify(o).slice(0, 360));
                // die Spielstunde nicht erreicht: der Deckel der Probe schnitt den Lauf — kein Urteil über die Welt, UNGEMESSEN beim Namen
                if (!(o.stunden >= 1)) throw new Error("eine Spielstunde Verkehr nicht erreicht: " + o.verkehrS + " von " + o.stundeS + " s in " + o.takte + " Takten, " + o.wandS + " s Wand (" + o.msJeTakt + " ms je Takt)" + (o.fehler ? " · " + o.fehler : ""));
                K.zahl(1, {
                    n: o.n,
                    werte: { kollisionen: o.kollisionen, zeitluecke: o.zeitluecke, reisetempo: o.reisetempo, stillstand: o.stillstand, stunden: o.stunden },
                    beleg: o.wagen + " Wagen, " + o.takte + " Takte, " + o.verkehrS + " s Verkehr (Spielstunde " + o.stundeS + " s), " + o.wegM + " m gefahren, " + o.luecken + " Folge-Proben, " + o.msJeTakt + " ms je Takt",
                    taeter: o.kollisionen > 0 || o.stillstand > 0 || !(o.reisetempo >= 0.8) || !(o.zeitluecke >= 1 && o.zeitluecke <= 3) ? "die Fahrer des Verkehrs (stamm/siedlung-verkehr.js: Folgen, Bremsen, Spur)" : null,
                });
            });
        },
        seite: { ZENSUS: zensusFahr, VERKEHR: verkehrLauf },
        sprossen: {
            1: {
                umfang: { soll: 10, wort: "Fahrer am Steuer auf den Wegen" },
                masse: [
                    { key: "kollisionen", wort: "Kollisionen (Wagen, Leib, Bau)", soll: 0, richtung: "≤" },
                    { key: "zeitluecke", wort: "Zeitlücke zum Vorderen im Median in s", von: 1, bis: 3 },
                    { key: "reisetempo", wort: "Reisetempo ÷ erlaubtes", soll: 0.8, richtung: "≥" },
                    { key: "stillstand", wort: "Stillstände ohne Anlass", soll: 0, richtung: "≤" },
                    {
                        key: "stunden",
                        wort: "Spielstunden Verkehr der Messung",
                        soll: 1,
                        richtung: "≥",
                        herkunft: "„1 h“: eine Stunde der Welt-Uhr, `_bewohnerStundeSek()` = 60 min Tag ÷ 24 = 150 s Spielzeit (stamm/siedlung-bewohner.js:2422)",
                    },
                ],
            },
            2: {
                umfang: { soll: 100, wort: "Fahrer mit Charakter" },
                masse: [
                    {
                        key: "tempoAuc",
                        wort: "Tempo vorsichtig ↔ eilig trennbar (AUC)",
                        soll: 0.5,
                        richtung: ">",
                        herkunft: "„trennbar“: besser als der Zufall — AUC 0,5 heißt ununterscheidbar (wie 50 % im Zwei-Wege-Zwang, R11)",
                    },
                    { key: "zeitluecke", wort: "Zeitlücke zum Vorderen im Median in s", von: 1, bis: 3 },
                ],
                erwartet: "nicht",
                fehlt: "10² Fahrer mit Charakter: die Stadt trägt 20 Wagen mit EINEM Stil",
            },
            3: {
                umfang: { soll: 20, wort: "Rennstrecken mit Rennfahrer" },
                masse: [{ key: "umlaufQ", wort: "bester Umlauf ÷ Optimum", soll: 1.05, richtung: "≤" }],
                erwartet: "nicht",
                fehlt: "keine Rennstrecke in der Welt",
            },
            4: {
                umfang: { soll: 2, wort: "Kapitän und Pilot (Wasser- und Luftfahrzeug mit Lenker)", herkunft: "die Aufzählung „Kapitän und Pilot“ zählt zwei Lenker: einen zu Wasser, einen in der Luft" },
                masse: [
                    { key: "regattaRang", wort: "Regatta: Rang folgt Können (Spearman r)", soll: 0, richtung: ">" },
                    { key: "landung", wort: "Landungen bei 15 kn Seitenwind gelungen", soll: 0.95, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "kein Wasser- und kein Luftfahrzeug",
            },
            5: {
                umfang: { soll: 1, wort: "Wettkampf mit Gefährt" },
                masse: [
                    { key: "windschatten", wort: "Windschatten und Überholen treten auf (1 ja)", soll: 1, richtung: "≥" },
                    { key: "siegerQ", wort: "Siegerzeit je km ÷ Rekordklasse", soll: 1, tol: 0.15 },
                    { key: "gegenlauf", wort: "Gegenlauf ohne Windschatten: das Feld zieht sich auseinander (1 ja)", soll: 1, richtung: "≥" },
                ],
                erwartet: "nicht",
                fehlt: "kein Wettkampf mit Gefährt",
            },
            6: {
                umfang: { soll: 100, wort: "fremde Lenker in fremden Medien" },
                masse: [{ key: "optimumQ", wort: "Lauf ÷ Optimum", soll: 1.1, richtung: "≤" }],
                erwartet: "nicht",
                fehlt: "kein fremder Lenker",
            },
        },
        proben: {
            1: [
                {
                    name: "ATTRAPPE: 0 Kollisionen, weil keiner fuhr (Reisetempo 0)",
                    j: { leiter: "mensch.fahrzeug.lenker", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 20, werte: { kollisionen: 0, zeitluecke: 2, reisetempo: 0, stillstand: 0, stunden: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Reisetempo ÷ erlaubtes 0 verfehlt/,
                },
                {
                    name: "Kolonne Stoßstange an Stoßstange (Zeitlücke 0,4 s)",
                    j: { leiter: "mensch.fahrzeug.lenker", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 20, werte: { kollisionen: 0, zeitluecke: 0.4, reisetempo: 0.9, stillstand: 0, stunden: 1 } } } },
                    gruen: false,
                    zahl: /ROT an Zeitlücke zum Vorderen im Median in s 0\.4 verfehlt/,
                },
                {
                    name: "der Lauf einer Minute statt einer Spielstunde (0,4 h)",
                    j: { leiter: "mensch.fahrzeug.lenker", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 20, werte: { kollisionen: 0, zeitluecke: 1.8, reisetempo: 0.9, stillstand: 0, stunden: 0.4 } } } },
                    gruen: false,
                    zahl: /ROT an Spielstunden Verkehr der Messung 0\.4 verfehlt/,
                },
            ],
        },
    }),

    // ── mensch.fahrzeug.maschine — Kraft, die arbeitet. S1 die Haspel des Ziehbrunnens am gehaltenen Klick (das Verb kurbeln,
    // gemessen an den gezeichneten Teilen), S2–S6 die Maschinen der Welt gezählt.
    F.leiter("mensch.fahrzeug.maschine", {
        sek: 60,
        mutiert: true,
        pfad: [...PFAD, "fachwerk-core.js", "stamm/siedlung-tor.js", "stamm/kampf.js"],
        messe: async (H, K) => {
            await K.messort("dorf");
            let z = null;
            try {
                z = await K.welt("return await (" + H.seite.ZENSUS + ")(r, T, {});");
            } catch (e) {
                H.zeile("Zensus warf: " + String(e && e.message).slice(0, 200));
            }
            if (z) H.zeile("Zensus: Werke " + JSON.stringify(z.werke));
            const da = () => {
                if (!z) throw new Error("kein Zensus der Welt");
                return z.werke;
            };
            await K.schritt(2, async () => K.nicht(2, { n: da().quelle, fehlt: "50 Maschinen-Saaten mit Quelle: keine Mühle und kein Wasserrad steht in der Welt (das Rad eines Werks dreht im Leerlauf ohne Quelle, stamm/koerper-leib.js:3106)" }));
            await K.schritt(3, async () => K.nicht(3, { n: da().ketten, fehlt: "Werkstatt-Kette Rohstoff → Fahrzeug: kein Werk trägt eine Fertigung" }));
            await K.schritt(4, async () => K.nicht(4, { n: da().fabrik, fehlt: "Fabrik, Industriestadt: kein Fabrik- und kein Kraftwerks-Bau" }));
            await K.schritt(5, async () => K.nicht(5, { n: da().werft, fehlt: "Industrie eines Planeten: keine Werft, kein Raumhafen" }));
            await K.schritt(6, async () => K.nicht(6, { n: da().fabrik > 0 ? 1 : 0, fehlt: "Industrie über Sonnensysteme: die Welt trägt EIN Sonnensystem, " + da().fabrik + " Fabrik-Bauten in ihm" }));
            // S1 zuletzt (die Probe mutiert): der gehaltene Klick an der Haspel des nächsten Ziehbrunnens
            await K.schritt(1, async () => {
                const h = await K.welt("return await (" + H.seite.HASPEL + ")(r, T, {});", Math.max(5000, Math.floor((H.rest() - 3) * 1000)));
                if (h.leser) return K.leser(1, { n: da().brunnen, fehlt: h.leser + " — " + da().brunnen + " Brunnen am Ort", wo: "fachwerk-core.js:7462" });
                H.zeile("Haspel: Brunnen " + h.id + ", " + h.griffe + " Griffe, Verb " + h.verb + ", unten " + h.unten + ", oben " + h.oben + ", " + h.wasserL + " l, Weg " +
                    (+h.wegUmdr || 0).toFixed(2) + " Umdr., Hub-Spanne " + (+h.hubSpanne || 0).toFixed(3) + " m");
                let bild = "";
                if (h.n) bild = " · Bild " + (await K.bild(1, h.pose)).datei;
                K.zahl(1, {
                    n: h.n,
                    werte: { hub: h.hub, folgt: h.folgt, fehlCm: h.fehlCm, ohneKlick: h.ohneKlick },
                    beleg: "Brunnen " + h.id + " von " + h.brunnen + ", " + h.griffe + " Griffe, Weg " + (+h.wegUmdr || 0).toFixed(2) + " Umdr., Hub-Spanne " + (+h.hubSpanne || 0).toFixed(2) + " m, " + h.wasserL + " l oben" + bild,
                    taeter: h.n ? null : h.taeter || (h.verb !== "kurbeln" ? "der Klick an der Trommel wählte das Verb " + h.verb : "der Eimer kam nicht unten an und oben zurück"),
                });
            });
        },
        seite: { ZENSUS: zensusFahr, HASPEL: haspelKurbel },
        sprossen: {
            1: {
                umfang: { soll: 1, wort: "Werkzeug mit Wirkung (Haspel am Ziehbrunnen)" },
                masse: [
                    { key: "hub", wort: "Hub des Eimers je Kurbel-Umdrehung in m", soll: 0, richtung: ">" },
                    { key: "folgt", wort: "Rang-r Kurbelweg ↔ Hub über die Umdrehungen", soll: 0, richtung: ">" },
                    {
                        key: "fehlCm",
                        wort: "größte Abweichung |Hub − r·φ| über den Kurbelweg in cm",
                        soll: 1,
                        richtung: "≤",
                        herkunft: "„Hub folgt Kurbelweg“: an jedem Punkt des Wegs steht der Eimer, wohin die Trommel das Seil gewickelt hat — innerhalb eines Zentimeters, unter der Dicke des Seils",
                    },
                    { key: "ohneKlick", wort: "Gegenlauf: Hub in m je 2 s ohne Klick vor und nach dem Kurbeln", soll: 0.001, richtung: "≤", herkunft: "„Haspel hebt Eimer“: ohne die Hand an der Kurbel hebt nichts — 1 mm, die Rechen-Genauigkeit der Matrix" },
                ],
                erwartet: "zahl",
            },
            2: {
                umfang: { soll: 50, wort: "Maschinen-Saaten mit Quelle (Mühle, Wasserrad)" },
                masse: [{ key: "nurBeiQuelle", wort: "Anteil der Maschinen, die nur bei Quelle arbeiten", soll: 0.9, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Mühle und kein Wasserrad in der Welt",
            },
            3: {
                umfang: { soll: 1, wort: "Werkstatt-Kette Rohstoff → Fahrzeug" },
                masse: [{ key: "dauerMin", wort: "Wagen aus Holz, Eisen, Leder in min", soll: 10, richtung: "≤" }],
                erwartet: "nicht",
                fehlt: "kein Werk trägt eine Fertigung",
            },
            4: {
                auge: { pose: "Messort stadt: die Fabrik von der Straße, 30 m", vorbild: "Fabrikfoto einer realen Industriestadt um 1900 (Riemen, Welle, Band), dazu der Gegenlauf Kraftwerk aus" },
                erwartet: "nicht",
                fehlt: "Fabrik, Industriestadt: kein Fabrik-Bau",
            },
            5: {
                umfang: { soll: 1, wort: "Werft oder Raumhafen" },
                masse: [{ key: "erzKette", wort: "Raumschiff aus gesehen abgebautem Erz (1 ja)", soll: 1, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "keine Werft, kein Raumhafen",
            },
            6: {
                umfang: { soll: 2, wort: "Sonnensysteme mit Industrie", herkunft: "„über Sonnensysteme“: die Industrie reicht über mehr als ein System, der Plural verlangt mindestens zwei" },
                masse: [{ key: "rang", wort: "Nachtseite ↔ Energie- und Rohstoffkarte (Rang r)", soll: 0.7, richtung: "≥" }],
                erwartet: "nicht",
                fehlt: "ein Sonnensystem ohne Industrie",
            },
        },
        proben: {
            2: [
                {
                    name: "ATTRAPPE: 50 Mühlen drehen auch bei Flaute (das Rad im Leerlauf)",
                    j: { leiter: "mensch.fahrzeug.maschine", adapter: PROBE, sprossen: { 2: { art: "zahl", n: 50, werte: { nurBeiQuelle: 0 } } } },
                    gruen: false,
                    zahl: /ROT an Anteil der Maschinen, die nur bei Quelle arbeiten 0 verfehlt/,
                },
            ],
            1: [
                {
                    name: "ATTRAPPE: die Kurbel dreht, der Eimer hängt an der Fülle (Hub 0)",
                    j: { leiter: "mensch.fahrzeug.maschine", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { hub: 0, folgt: 0, fehlCm: 0, ohneKlick: 0 } } } },
                    gruen: false,
                    zahl: /ROT an Hub des Eimers je Kurbel-Umdrehung in m 0 verfehlt/,
                },
                {
                    name: "der Eimer steigt mit der Uhr, nicht mit der Kurbel (r −0,2)",
                    j: { leiter: "mensch.fahrzeug.maschine", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { hub: 0.3, folgt: -0.2, fehlCm: 0, ohneKlick: 0 } } } },
                    gruen: false,
                    zahl: /ROT an Rang-r Kurbelweg ↔ Hub über die Umdrehungen -0\.2 verfehlt/,
                },
                {
                    name: "der Zweig brunnen-haspel: der Eimer steigt um r·2π je Umdrehung, ohne Klick steht er",
                    j: { leiter: "mensch.fahrzeug.maschine", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { hub: 0.804, folgt: 1, fehlCm: 0, ohneKlick: 0 } } } },
                    gruen: true,
                },
                {
                    name: "TÄTER: der Eimer hängt am Zustand, die gezeigte Kurbel läuft nach (40 cm daneben)",
                    j: { leiter: "mensch.fahrzeug.maschine", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { hub: 0.8, folgt: 0.99, fehlCm: 40, ohneKlick: 0 } } } },
                    gruen: false,
                    zahl: /ROT an größte Abweichung \|Hub − r·φ\| über den Kurbelweg in cm 40 verfehlt/,
                },
                {
                    name: "ATTRAPPE: der Eimer steigt auch ohne Klick (Gegenlauf 0,3 m)",
                    j: { leiter: "mensch.fahrzeug.maschine", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 1, werte: { hub: 0.8, folgt: 1, fehlCm: 0, ohneKlick: 0.3 } } } },
                    gruen: false,
                    zahl: /ROT an Gegenlauf: Hub in m je 2 s ohne Klick vor und nach dem Kurbeln 0\.3 verfehlt/,
                },
                {
                    name: "TÄTER: der Klick an der Trommel wählt abbau (Umfang 0)",
                    j: { leiter: "mensch.fahrzeug.maschine", adapter: PROBE, sprossen: { 1: { art: "zahl", n: 0, werte: { hub: 0, folgt: 0, fehlCm: 0, ohneKlick: 0 }, taeter: "der Klick an der Trommel wählte das Verb abbau" } } },
                    gruen: false,
                    zahl: /ROT an Umfang 0 .*Täter: der Klick an der Trommel wählte das Verb abbau/,
                },
            ],
        },
    }),
];
