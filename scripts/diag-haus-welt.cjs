// diag-haus-welt.cjs — DAS HAUS DER WELT IST BEGEHBAR, WIE ES GEZEICHNET IST (gate:haus-welt, Welle L 06.10., Klasse Q5).
// Befund der Leben-Prüfung (N-D2 bis N-D5, S-W3, S-W4; gespielt im sichtbaren Fenster): die Haus-Kollision der Welt las
// an keiner Stelle das Gesetzbuch — vier EG-Riegel (3,1 m) als achsparallele Welt-AABB: gedrehte Häuser 18–35 %
// begehbar, der Spieler hing 4,76 m vor der Tür, die Riegel waren eine Kletterwand, die Treppe Luft; der Fuß stand
// 0,50 m unter der Studio-Diele; das Solo-Haus stieß an den `haus_basis`-Block (3,09 m in der sichtbaren Wand); Bäume
// wuchsen in 5 von 8 Häusern. Die Linse ruft die ECHTEN Pfade (headless, Null-Renderer): `spawnSettlement` (das
// Drehbuch-Dorf 7/18), die Foundry liefert die Stufen, der Spieler geht über den Sim-Schritt (`_stepFixedSim`, W-Taste):
//   W1  TÜR: vom Podest vor der Haustür geht der Körper 1 m hinter die Schwelle — je Haus, gedrehte eingeschlossen
//   W2  DIELE: drinnen steht der Fuß auf der Diele des Gesetzbuchs (± 3 cm; das Gesetzbuch rechnet die Probe selbst)
//   W3  TREPPE: der Lauf EG→OG (die Flights des Gesetzbuchs) trägt den Körper ins Obergeschoss
//   W4  GRUNDRISS: keine Natur (Baum, Strauch, Fels, Totholz — die Arten des Terrain-Studios) steht im Grundriss eines
//       Hauses des Drehbuch-Dorfs
//   W4b DAS FERNE DORF: ein Dorf entsteht 300 m vom Spieler (das Auto-Dorf ab 260 m) — keine lebende Streu-Zelle (Fern-
//       Baum, Unterholz, Fels) steht in seinen Häusern, auch nicht, wenn die Region unter ihm neu baut; der Spieler läuft
//       hin (Promotions-Ring 64 m, der Wald des neuen Rings, die Nah-Streu um die Kamera) — kein Natur-Eintrag, keine
//       Streu-Zelle, keine Kachel-Pflanze im Grundriss. Alle Quellen setzen durch EINE Wand (`_naturSetzen`). Gewartet wird
//       auf den Konsum (Nah-Streu ohne offene Kachel, jede Baum-Zelle des Rings promotet — die Promotion im Zustand ohne
//       warme Foundry, dem einzigen, in dem sie lebt), nie auf eine feste Takt-Zahl.
//   W5  KOLLISION == OPTIK: an jedem Punkt eines 0,5-m-Rasters im Kern-Grundriss urteilt die Welt-Kapsel (der echte
//       Löser `_resolveCapsuleVsAABB` gegen die Boxen des Hauses) wie das Gesetzbuch (dieselbe Wand-Regel gegen die Solids des Hauses): frei
//       oder Wand — Übereinstimmung ≥ 97 % (vorher füllten gedrehte Riegel den Raum, Innenwände fehlten)
//   W6  DER FRONTALE ANLAUF: je Kultur (Hof-Haus marokkanisch, viktorianisch, alemannisch) läuft der Körper von 6 m vor
//       der Front durch die Tür — vor der ersten Studio-Stufe (Kern-Hülle) und während die Fernstufe 2 bzw. 1 steht (die
//       Solids des Gesetzbuchs, nie eine Stufen-Box); der Weg wird verfolgt (vor der Schwelle höchstens 1,3 m über dem
//       Boden, nie 1 m darunter — kein Lauf über eine Mauer, kein Sturz), der Korridor ist begehbar (stetig, solide)
//   W7  BAU IM BAU: kein Haus des Drehbuch-Dorfs steht in einem Bau, der vor ihm stand (Start-Plattform, Fels-Tor), und
//       vor keiner Haustür steht dessen Wand — Grundriss und Tür-Vorplatz, abgetastet gegen die Hülle jedes Nicht-Natur-
//       Baus über dem Boden des Hauses; dann derselbe Akt ein zweites Mal am selben Anker: kein Haus, kein Brunnen, kein
//       Stand des zweiten Dorfs steht im ersten (seit „vor dir" vorn liegt, gründet das Dorf vor dem Spieler: an der
//       Start-Plattform stand ein Haus 3,6 m tief in ihr). Dazu der Selbsttest „raster": die Höhe des Footprints aus vier
//       Ecken und der Mitte (der alte Stand) legt eine Haustür in den Hang — W1 wird rot.
//   W8  DIE LICHTUNG (Entscheid D3): die Genesis-Plattform ist ein Grundriss derselben Wand — über ihrer Scheibe keine Krone
//       (Wald-Gesetz × Welt-Skala) eines Natur-Eintrags oder einer Streu-Zelle, keine Kachel-Pflanze auf ihr; der Hain der
//       KI wächst weder dort noch im Grundriss eines Dorf-Hauses (Gegenprobe 150 m weiter: er wächst), jede Absage steht im
//       Programm-Log (natur_weicht) und der Satz „pflanz mir eine eiche" auf der Plattform nennt die Lichtung, nie
//       „gewachsen". Selbsttests: die Wand ohne die Lichtung, der Wald und der Hain der KI an der Wand vorbei, die Wand still.
//   --selftest: je Defekt serviert der Server die Basis-Zeile von anazhRealm.js — GENAU die Probe dieses Defekts wird rot;
//   die Welt eines Selbsttests fährt nur die Phase seines Täters (haus · w4 · w4b · w6), der Hauptlauf alle.
//   node scripts/diag-haus-welt.cjs [--selftest [--nur=promotion,nahstreu]] [--phasen=lichtung]
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.HAUS_WELT_PORT || 4486);
const ROOT = path.resolve(__dirname, "..");
const SELBST = process.argv.includes("--selftest");
// --nur=promotion,nahstreu: nur diese Selbsttests (der Hauptlauf fährt immer)
const NUR = (process.argv.find((a) => a.startsWith("--nur=")) || "--nur=").slice(6).split(",").filter(Boolean);
// --phasen=lichtung,w4: der Hauptlauf fährt nur diese Phasen (eine gezielte Messung; ohne die Option alle)
const PHASEN = (process.argv.find((a) => a.startsWith("--phasen=")) || "--phasen=").slice(9).split(",").filter(Boolean);
const MIME = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};

// DIE BASIS-ZEILEN je Defekt: [geheilte Form in anazhRealm.js, Basis-Form].
const BASIS = {
    // ohne die Hülle des Gesetzbuchs: nur die Wände der Tür-Zeile (vier EG-Wände mit Tür-Lücke — die Basis-Blocker der
    // Siedlungs-Häuser vor der Welle, hier schon gedreht), keine Böden, Tritte, Innenwände
    huelle: [["if (fest && fest.length) {", "if (false) {"]],
    // die gedrehte Box als achsparallele Welt-AABB gelesen
    obb: [["        const ob = box.obb;\n        if (ob) {", "        const ob = null;\n        if (ob) {"]],
    // die Natur wirft in den Grundriss, und das Dorf räumt nicht
    grundriss: [
        // das Urteil der Wand lebt seit Welle L Folge in `_naturWand` (Bau-Modus und Phantom fragen es mit)
        ["return position ? this._imGrundriss(position.x, position.z, 0.8, this._naturKrone(name, opts)) : false;", "return false;"],
        ["if (entry) this._grundrissRaeumen(entry);", ""],
    ],
    // die Streu der Region räumt nicht, wenn das Dorf kommt
    streu: [["this._streuZelleRaeumen(cell);", "void 0;"]],
    // die Streu-Zelle läuft an der Wand vorbei (der Neubau der Region)
    streuwand: [["const rec = this._naturSetzen(species, tf, tf, () =>", "const rec = ((_a, _b, _c, f) => f())(species, tf, tf, () =>"]],
    // die Promotion läuft an der Wand vorbei (und Region wie Neubau lassen die Zellen stehen — sonst erreicht keine den Ring)
    promotion: [
        ["this._streuZelleRaeumen(cell);", "void 0;"],
        ["const rec = this._naturSetzen(species, tf, tf, () =>", "const rec = ((_a, _b, _c, f) => f())(species, tf, tf, () =>"],
        [
            "im Grundriss eines Hauses fällt er mit seiner Streu-Instanz.\n        const entry = this._naturSetzen(",
            "im Grundriss eines Hauses fällt er mit seiner Streu-Instanz.\n        const entry = this.spawnArchitecture(",
        ],
    ],
    // die Nah-Streu läuft an der Wand vorbei
    nahstreu: [["this._naturSetzen(null, it, null, () => items.push(it));", "items.push(it);"]],
    // DIE LICHTUNG (W8): die Wand kennt die Genesis-Plattform nicht (ihr Bauplan trägt keine Lichtung) — jede Quelle außer
    // dem Wald stand so über der Scheibe; der Wald hatte seinen eigenen Filter im Pflanz-Gang (der fiel mit D3)
    lichtung: [["                lichtung: true,\n", ""]],
    // eine Quelle geht an der Wand vorbei: die Wald-Schlange setzt ihre Würfe direkt
    lichtungwald: [["            this._naturSetzen(task.name, task.position, task.opts);", "            this.spawnArchitecture(task.name, task.position, task.opts);"]],
    // eine Quelle geht an der Wand vorbei: der Hain der KI (`spawn_studio`) setzt seine Natur direkt — an der Plattform UND im Haus
    kihain: [["if (natur ? this._naturSetzen(name, ort, opts, null, absage) : this.spawnArchitecture(name, ort, opts))", "if (this.spawnArchitecture(name, ort, opts))"]],
    // die Wand nimmt still: der Hain fällt ohne Absage — der Chat sagte „gewachsen" bei 0 Bäumen
    stumm: [["            if (absage) absage(wo);\n", ""]],
    // die Fernstufe trägt ihre Bounding-Box statt der Solids des Gesetzbuchs (das Gesetzbuch reist über den Worker)
    fernstufe: [
        [
            "/fachwerk-core.js",
            "var huelle = gm.__solids && gm.__solids.length ? { stufe: stufe, boxen: gm.__solids } : null;",
            "var hb = new THREE.Box3().setFromObject(g); var huelle = stufe === 0 ? { stufe: 0, boxen: gm.__solids } : { stufe: stufe, boxen: [hb.min.x, hb.min.y, hb.min.z, hb.max.x, hb.max.y, hb.max.z] };",
        ],
    ],
    // die Siedlung baut ohne Bau-Wand (ein Haus darf in einem bestehenden Bau stehen)
    bauwand: [
        ["if (!this._bauFrei(wx, wz, ry,", "if (false && !this._bauFrei(wx, wz, ry,"],
        ["const R = Math.max(0.5, (this._blueprintFootprintRadius(type, 1) || 0) * Math.SQRT1_2);", "return true;"],
    ],
    // die Höhe des Footprints aus vier Ecken + Mitte, ohne den Tür-Vorplatz (der Stand vor dem Raster)
    raster: [
        ["const nx = Math.min(12, Math.max(1, Math.ceil(obb.ex)));", "const nx = 1;"],
        ["const nz = Math.min(12, Math.max(1, Math.ceil(obb.ez)));", "const nz = 1;"],
        ["if (tu && Number.isFinite(tu.x) && Number.isFinite(tu.z) && Number.isFinite(tu.w))", "if (false)"],
    ],
    // vor der ersten Studio-Stufe die geschlossene Kern-Box ohne Tür-Lücke
    kern: [["boxen = this._hausKernHuelle(t);", "boxen = [-t.W / 2, 0, -t.D / 2, t.W / 2, 3.1, t.D / 2];"]],
};
let patch = null;
let patchFehler = [];
let patchAngewandt = new Set();

const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(ROOT, p);
    if (!fp.startsWith(ROOT)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        // eine Patch-Zeile [geheilt, basis] gilt anazhRealm.js, [datei, geheilt, basis] der genannten Datei (das Gesetzbuch
        // reist über den Foundry-Worker: /fachwerk-core.js)
        const meine = patch ? patch.map((z) => (z.length === 3 ? z : ["/anazhRealm.js", z[0], z[1]])).filter((z) => z[0] === p) : [];
        if (meine.length) {
            let txt = data.toString("utf8");
            for (const [, geheilt, basis] of meine) {
                if (!txt.includes(geheilt)) patchFehler.push(`geheilte Zeile fehlt in ${p} („${geheilt.slice(0, 70)}…")`);
                else {
                    txt = txt.replace(geheilt, basis);
                    patchAngewandt.add(p + "|" + geheilt);
                }
            }
            data = Buffer.from(txt, "utf8");
        }
        res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

async function proben(phasen) {
    const r = window.anazhRealm;
    const s = r.state;
    const A = r.constructor;
    const FC = window.__fachwerkCore;
    // DIE PHASEN: haus (W1 W2 W3 W4c W5 je Haus), lichtung (W8), w4, w4b, w6 — der Hauptlauf fährt alle, ein Selbsttest nur
    // die seines Täters
    const P = new Set(phasen || ["haus", "lichtung", "w4", "w4b", "w6"]);
    const o = { haeuser: [], phasen: [...P] };
    if (!FC || typeof FC.HAUS !== "function") return { fehler: "__fachwerkCore fehlt" };
    const pm = s.playerMesh;
    const DT = A.FIXED_DT || 1 / 60;
    let t = 5000;
    const warte = (ms) => new Promise((rs) => setTimeout(rs, ms));
    const pumpe = async (n) => {
        for (let k = 0; k < n; k++) {
            try {
                r._gameLoopTick(performance.now());
            } catch (_e) {}
            if (k % 8 === 0) await warte(10);
        }
    };
    // ── das Drehbuch-Dorf 7/18 am Spieler: der Akt des Chats „dorf 7 18" (ohne `position` gründet `spawnSettlement` beim
    // Spieler; die früheren Felder x/z las niemand — beide Dörfer der Linse standen am Start) ──
    const start = { x: pm.position.x, y: pm.position.y, z: pm.position.z };
    const vorBau = new Set(s.architectures);
    r.spawnSettlement({ seed: 7, nH: 18 });
    const dorfHaeuser = () => s.architectures.filter((e) => e.type && e.type.startsWith("haus_") && e.tuer && e.fundament);
    // der Export reist durch den Foundry-Worker: warten, bis die Slots stehen
    for (let k = 0; k < 120 && dorfHaeuser().length < 10; k++) {
        await pumpe(4);
        await warte(100);
    }
    const H = dorfHaeuser();
    o.gesamt = H.length;
    const dorfMitte = { x: start.x, z: start.z };
    if (H.length) {
        dorfMitte.x = H.reduce((a, e) => a + e.position.x, 0) / H.length;
        dorfMitte.z = H.reduce((a, e) => a + e.position.z, 0) / H.length;
    }
    // die Probe des Gesetzbuchs je Haus (Rezept + Stempel + Same → HAUS): Diele und Flights
    const gesetz = (e) => {
        const kultur = e.type.slice(5);
        const pre = FC.PRESETS && FC.PRESETS[kultur];
        if (!pre) return null;
        const P = FC.hausParams(pre, e.studioOv || null);
        P.seed = e.seed;
        const Hh = FC.HAUS(window.THREE, FC.mat, P);
        Hh.build({ gelaende: false });
        return Hh;
    };
    const welt = (e, lx, lz) => {
        const c = Math.cos(e.rotationY || 0);
        const sn = Math.sin(e.rotationY || 0);
        return { x: e.position.x + lx * c + lz * sn, z: e.position.z - lx * sn + lz * c };
    };
    const lokal = (e, x, z) => {
        const c = Math.cos(e.rotationY || 0);
        const sn = Math.sin(e.rotationY || 0);
        const dx = x - e.position.x;
        const dz = z - e.position.z;
        return { x: dx * c - dz * sn, z: dx * sn + dz * c };
    };
    const geh = (n, zielX, zielZ) => {
        s.keys = s.keys || {};
        for (let k = 0; k < n; k++) {
            s.yaw = Math.atan2(zielX - pm.position.x, zielZ - pm.position.z);
            s.keys.w = true;
            r._stepFixedSim((t += DT), DT);
        }
        s.keys.w = false;
        for (let k = 0; k < 10; k++) r._stepFixedSim((t += DT), DT);
    };
    const stell = (x, y, z) => {
        pm.position.set(x, y, z);
        s._fieldVy = 0;
        if (s.playerVel && s.playerVel.setValue) s.playerVel.setValue(0, 0, 0);
        if (s._fixedSimPos) s._fixedSimPos.copy(pm.position);
        for (let k = 0; k < 20; k++) r._stepFixedSim((t += DT), DT);
    };
    const FUSS = A.PLAYER_FOOT_OFFSET;
    for (const e of P.has("haus") ? H.slice(0, 8) : []) {
        const h = { typ: e.type, gierGrad: Math.round((((e.rotationY || 0) * 180) / Math.PI) % 360) };
        o.haeuser.push(h);
        // die Stufe 0 holen: der Spieler steht am Haus, bis die Foundry die Hülle der Stufe 0 liefert
        stell(e.position.x, e.position.y + 3, e.position.z);
        for (let k = 0; k < 40 && !(e._servedLod === 0); k++) await pumpe(10);
        h.stufe = e._servedLod;
        h.huelle = e._hausHuelle ? e._hausHuelle.stufe : null;
        const Hh = gesetz(e);
        if (!Hh) {
            h.fehler = "kein Gesetzbuch";
            continue;
        }
        const tu = e.tuer;
        const base = e.position.y - 0.5;
        // W1 TÜR: vom Podest-Rand vor der Tür 1,8 m nach innen
        const vor = welt(e, tu.x, tu.z - 0.25);
        const innen = welt(e, tu.x, tu.z + 1.8);
        stell(vor.x, base + 0.75 + FUSS, vor.z);
        geh(150, innen.x, innen.z);
        const l = lokal(e, pm.position.x, pm.position.z);
        h.tuerDrinM = Math.round((l.z - tu.z) * 100) / 100;
        // W2 DIELE: der Fuß steht auf einer Fläche des Gesetzbuchs — die nächste Solid-Oberkante, deren Grundfläche den
        // Kapsel-Kreis trifft (das Gesetzbuch rechnet sie selbst, nie die Blocker der Welt)
        const fussL = pm.position.y - FUSS - base;
        const rK = A.PLAYER_WALL_RADIUS || 0.35;
        let best = Infinity;
        for (const so of Hh.solids || []) {
            const qx = Math.max(so.min[0], Math.min(l.x, so.max[0]));
            const qz = Math.max(so.min[2], Math.min(l.z, so.max[2]));
            if ((qx - l.x) ** 2 + (qz - l.z) ** 2 > rK * rK) continue;
            const d = fussL - so.max[1];
            if (Math.abs(d) < Math.abs(best)) best = d;
        }
        h.dieleCm = Number.isFinite(best) ? Math.round(best * 1000) / 10 : null;
        // W1 DIE TÜR LIEGT NIE IM BODEN: das Gelände am Tür-Vorplatz liegt nie über der Diele hinter der Schwelle (die
        // Oberkante des Gesetzbuchs 0,5 m hinter der Tür) — Toleranz 0,2 m, die Feinform des sichtbaren Meshes (Lehre 22).
        // Integration V18.536: der Spieler steigt heute vom Gelände durch eine halb vergrabene Tür hinab (Selbsttest „raster":
        // das Gelände 0,56 m über der Diele, innerhalb der Stufe 0,6 m) — das Betreten allein war für sie blind. Gesund
        // stehen die Häuser des Drehbuch-Dorfs auf ihrem Podest: der Vorplatz 1,65–7,15 m unter der Diele.
        {
            let schwelle = -Infinity;
            for (const so of Hh.solids || [])
                if (
                    so.min[0] <= tu.x &&
                    tu.x <= so.max[0] &&
                    so.min[2] <= tu.z + 0.5 &&
                    tu.z + 0.5 <= so.max[2] &&
                    so.max[1] < 1.6
                )
                    schwelle = Math.max(schwelle, so.max[1]);
            h.vorplatzUeberM = Number.isFinite(schwelle)
                ? Math.round((r.getTerrainHeightAt(vor.x, vor.z) - base - schwelle) * 100) / 100
                : null;
        }
        // W4c DER GRUNDRISS DECKT DAS HAUS: die Solids des Gesetzbuchs liegen in der Fundament-Box des Eintrags (Mitte
        // {ox,oz} + halbe Maße {ex,ez}, haus-lokal) — Podest, Natur-Wand und Räumen lesen sie
        {
            const f = e.fundament;
            let ueber = 0;
            for (const so of Hh.solids || []) {
                ueber = Math.max(
                    ueber,
                    (f.ox || 0) - f.ex - so.min[0],
                    so.max[0] - ((f.ox || 0) + f.ex),
                    (f.oz || 0) - f.ez - so.min[2],
                    so.max[2] - ((f.oz || 0) + f.ez)
                );
            }
            h.grundrissUeberM = Math.round(ueber * 100) / 100;
        }
        // W5 KOLLISION == OPTIK auf der Diele-Ebene: die Welt-Kapsel gegen die Gesetzbuch-Wand-Regel je Rasterpunkt
        {
            const STEP = A.PLAYER_STEP_UP;
            const rW = A.PLAYER_WALL_RADIUS || 0.35;
            const fussY = 0.66; // haus-lokal knapp über der EG-Diele
            let gleich = 0;
            let n = 0;
            for (let gx = -tu.W / 2 + 0.25; gx < tu.W / 2; gx += 0.5)
                for (let gz = -tu.D / 2 + 0.25; gz < tu.D / 2; gz += 0.5) {
                    // das Gesetzbuch: eine Box, deren Oberkante über der Stufe-hoch-Linie liegt und die den Körper
                    // (Fuß … Fuß + 2·FUSS) schneidet, ist Wand, wenn der Kreis sie berührt — die Regel des Kapsel-Lösers
                    let gesetzWand = false;
                    for (const so of Hh.solids || []) {
                        if (!(so.max[1] > fussY + STEP && so.min[1] < fussY + 2 * FUSS)) continue;
                        const qx = Math.max(so.min[0], Math.min(gx, so.max[0]));
                        const qz = Math.max(so.min[2], Math.min(gz, so.max[2]));
                        if ((qx - gx) ** 2 + (qz - gz) ** 2 < rW * rW) {
                            gesetzWand = true;
                            break;
                        }
                    }
                    const w = welt(e, gx, gz);
                    // der Löser der Kapsel je Box (`_resolveCapsuleVsAABB`) gegen die Boxen DIESES Hauses (das Nachbarhaus in der
                    // Reihe ist nicht sein Gesetzbuch)
                    const pos = { x: w.x, z: w.z };
                    for (const bx of e.blockerAABBs || [])
                        r._resolveCapsuleVsAABB(bx, pos, base + fussY, base + fussY + 2 * FUSS, rW, -Infinity);
                    const weltWand = Math.hypot(pos.x - w.x, pos.z - w.z) > 1e-3;
                    n++;
                    if (weltWand === gesetzWand) gleich++;
                }
            h.optikProzent = n ? Math.round((gleich / n) * 1000) / 10 : null;
        }
        // W3 TREPPE: der Lauf EG→OG
        const fl = ((Hh.dims && Hh.dims.flights) || []).find((f) => f.atLevel === 1 && f.x1 - f.x0 > 0.3);
        if (fl) {
            const xm = (fl.x0 + fl.x1) / 2;
            const a = welt(e, xm, fl.zFoot - fl.dir * 0.5);
            const z2 = welt(e, xm, fl.zFoot + fl.dir * (fl.N * fl.go + 0.8));
            stell(a.x, base + fl.base + 0.1 + FUSS, a.z);
            const y0 = pm.position.y;
            geh(300, z2.x, z2.z);
            h.treppeSteigM = Math.round((pm.position.y - y0) * 100) / 100;
            h.treppeSollM = Math.round(fl.N * fl.rise * 100) / 100;
        }
    }
    // W7 BAU IM BAU: Grundriss (Raster 5 × 5) und Tür-Vorplatz (1,2 m vor der Front, 3 × 2) jedes Dorf-Hauses gegen die
    // Boxen jedes Baus, der vor dem Dorf stand und keine Natur ist — eine Box zählt über dem Boden des Hauses (+ Stufe)
    if (P.has("haus")) {
        const STEP = A.PLAYER_STEP_UP;
        const w7 = { haeuser: H.length, imBau: 0, taeter: [] };
        for (const e of H) {
            const f = e.fundament;
            const tu = e.tuer;
            const boden = e.position.y - 0.5;
            const pkt = [];
            for (let i = 0; i <= 4; i++)
                for (let j = 0; j <= 4; j++)
                    pkt.push(
                        welt(e, (f.ox || 0) + (f.ex - 0.1) * (i / 2 - 1), (f.oz || 0) + (f.ez - 0.1) * (j / 2 - 1))
                    );
            if (tu && Number.isFinite(tu.w))
                for (let i = 0; i <= 2; i++)
                    for (const dz of [0.3, 1.1]) pkt.push(welt(e, tu.x + (tu.w / 2 - 0.05) * (i - 1), tu.z - dz));
            for (const b of vorBau) {
                if (!b.blockerAABBs || !b.position) continue;
                if (Math.hypot(b.position.x - e.position.x, b.position.z - e.position.z) > 40 + (b._blockerReach || 0))
                    continue;
                if (r._istNatur(b)) continue;
                let n = 0;
                for (const q of pkt)
                    if (b.blockerAABBs.some((bx) => bx.topY > boden + STEP && r._boxAbstand2(bx, q.x, q.z) === 0)) n++;
                if (n) {
                    w7.imBau++;
                    if (w7.taeter.length < 4)
                        w7.taeter.push(
                            e.type +
                                "@" +
                                Math.round((((e.rotationY || 0) * 180) / Math.PI) % 360) +
                                "°in " +
                                b.type +
                                " (" +
                                n +
                                " Punkte)"
                        );
                }
            }
        }
        // das zweite Dorf: derselbe Akt am Anker des ersten (worldMeta.settlementCells „d:7@x,z")
        const zelle = Object.entries((s.worldMeta && s.worldMeta.settlementCells) || {}).find(([k]) =>
            k.startsWith("d:7@")
        );
        if (zelle) {
            const vorBau2 = new Set(s.architectures);
            await r.spawnSettlement({ seed: 7, nH: 18, position: { x: zelle[1].x, y: start.y, z: zelle[1].z } });
            await pumpe(8);
            const neu = s.architectures.filter(
                (e) => !vorBau2.has(e) && /^(haus_|brunnen_|marktstand_)/.test(e.type || "")
            );
            w7.zweitesDorf = neu.length;
            w7.zweitesImBau = 0;
            for (const e of neu) {
                // der Grundriss (Raster 5 × 5) des neuen Hauses, nicht nur seine Mitte: ein Haus ist begehbar (Welle L, die
                // Hülle sind Wände und Dielen) — seine Mitte liegt im leeren Raum, auch wenn es mitten im ersten Dorf steht
                // (Integration V18.536: der Selbsttest „bauwand" blieb mit der Mitte blind)
                const f2 = e.fundament;
                const pkt2 = [{ x: e.position.x, z: e.position.z }];
                if (f2)
                    for (let i = 0; i <= 4; i++)
                        for (let j = 0; j <= 4; j++)
                            pkt2.push(
                                welt(e, (f2.ox || 0) + (f2.ex - 0.1) * (i / 2 - 1), (f2.oz || 0) + (f2.ez - 0.1) * (j / 2 - 1))
                            );
                for (const b of vorBau2) {
                    if (!b.blockerAABBs || !b.position || b === e) continue;
                    if (
                        Math.hypot(b.position.x - e.position.x, b.position.z - e.position.z) >
                        30 + (b._blockerReach || 0)
                    )
                        continue;
                    if (r._istNatur(b)) continue;
                    const boden = e.position.y - 0.5;
                    if (
                        b.blockerAABBs.some(
                            (bx) => bx.topY > boden + STEP && pkt2.some((q) => r._boxAbstand2(bx, q.x, q.z) === 0)
                        )
                    ) {
                        w7.zweitesImBau++;
                        if (w7.taeter.length < 4) w7.taeter.push("zweites Dorf: " + e.type + " in " + b.type);
                        break;
                    }
                }
            }
        }
        o.w7 = w7;
    }
    // W4 GRUNDRISS: keine Natur im Grundriss — nach dem Pumpen der Natur-Schlange. Natur = ein Eintrag, dessen Art das
    // Gesetzbuch des Terrain-Studios trägt (`__terrainCore.PHYTO_PRESETS`: Baum, Strauch, Fels, Farn, Totholz …) oder
    // seine Wald-/Bauplan-Zeile (vor dem Buch); nie ein Tor oder Wagen (die tragen auch eine Impostor-Zeile).
    const PHYTO = (window.__terrainCore && window.__terrainCore.PHYTO_PRESETS) || {};
    const istNatur = (e) => {
        if (!e || typeof e.type !== "string") return false;
        if (e._lodSpecies || e.type === "stamm_gefallen" || /^(baum_|busch_|grown_)/.test(e.type)) return true;
        const pr = r._foundryPresetForEntry(e);
        return !!(pr && Object.prototype.hasOwnProperty.call(PHYTO, pr));
    };
    const imGrundrissVon = (liste, x, z) => {
        for (const hs of liste) {
            const lx = lokal(hs, x, z);
            const f = hs.fundament;
            if (Math.abs(lx.x - (f.ox || 0)) <= f.ex && Math.abs(lx.z - (f.oz || 0)) <= f.ez) return hs;
        }
        return null;
    };
    const naturImHaus = (liste) => {
        let imHaus = 0;
        let natur = 0;
        const taeter = [];
        for (const e of s.architectures) {
            if (!istNatur(e)) continue;
            natur++;
            const hs = imGrundrissVon(liste, e.position.x, e.position.z);
            if (hs) {
                imHaus++;
                if (taeter.length < 6) taeter.push(e.type + "@" + hs.type);
            }
        }
        return { natur, imHaus, taeter };
    };
    // die lebende Streu (Instanz-Slots oder Gesetz-Platz) im Grundriss — je Schicht
    const streuImHaus = (liste) => {
        const je = {};
        let n = 0;
        let zellen = 0;
        for (const region of (s.scatterRegions && s.scatterRegions.values()) || []) {
            for (const c of region.cells || []) {
                if (!((c.slots && c.slots.length) || c.feld)) continue;
                zellen++;
                if (!imGrundrissVon(liste, c.x, c.z)) continue;
                n++;
                je[c.layer] = (je[c.layer] || 0) + 1;
            }
        }
        return { zellen, imHaus: n, je };
    };
    // W8 DIE LICHTUNG (Integration Welle L, Entscheid D3): die Genesis-Plattform ist ein Grundriss der EINEN Natur-Wand
    // (`_naturSetzen`) — über ihrer Stein-Scheibe steht keine Krone (das Wald-Gesetz: `(FOREST.crown[art] || 4) × Größe`,
    // × die Welt-Skala der Art, mit der der Baum gezeichnet wird) und auf ihr keine Streu. Der Spieler steht auf der
    // Plattform, bis Chunk, Wald-Schlange und Nah-Streu ruhen (die Kachel-Pflanzen), dann 120 m daneben, bis die Regionen
    // über ihr neu gebaut sind (die Streu-Zellen, die Baum-Schichten mit ihrer Krone — innerhalb 64 m baut keine Streu), dann
    // wieder auf ihr, bis der Promotions-Ring promotet ist (die Natur-Einträge). Dann der Hain der KI
    // (`spawn_tree` 4 Bäume, `spawn_studio` eine Eiche genau am Ort) mitten auf der Plattform UND mitten im Grundriss eines
    // Hauses des Dorfs — nichts wächst in Lichtung oder Grundriss; derselbe Hain 150 m weiter wächst (sonst ist die Probe
    // blind).
    if (P.has("lichtung")) {
        const w8 = {};
        o.w8 = w8;
        const plat = s.architectures.find((a) => a && a.type === "start_plattform");
        const pbp = s.blueprints && s.blueprints.start_plattform;
        const p0 = pbp && Array.isArray(pbp.parts) && pbp.parts[0] && pbp.parts[0].size;
        const platR = p0 && Number.isFinite(p0.x) ? p0.x / 2 : NaN; // die Stein-Scheibe (cylinder: size.x = Durchmesser)
        if (!plat || !(platR > 0)) w8.fehler = "keine Genesis-Plattform";
        else {
            const L = { x: plat.position.x, z: plat.position.z, r: platR };
            w8.plattform = [Math.round(L.x * 10) / 10, Math.round(L.z * 10) / 10, platR];
            const F = A.FOREST;
            const kWelt = (art) => r._foundryWorldScaleMatrix(r._foundryPresetFor(art)).elements[0] || 1;
            // die Reichweite eines Wurfs über die Scheibe: ein Baum mit seiner Krone, alles andere mit seinem Ort
            const krone = (art, groesse) =>
                /^baum_/.test(art || "") ? (F.crown[art] || 4) * (groesse > 0 ? groesse : 1) * kWelt(art) : 0;
            const abstand = (x, z) => Math.hypot(x - L.x, z - L.z);
            stell(L.x, plat.position.y + 2.2, L.z);
            const span = r._voxelChunkConfig(0).span;
            let ruhig = 0;
            for (let k = 0; k < 1500 && ruhig < 20; k++) {
                await pumpe(4);
                const e = s.voxelChunks && s.voxelChunks.get(`${Math.floor(L.x / span)},${Math.floor(L.z / span)}`);
                const ns = s.nahStreu;
                const steht =
                    k > 60 && e && e.surfMap && !(s.pendingVegSpawns && s.pendingVegSpawns.length) && ns && ns.kacheln.size > 0 && ns.offen === 0;
                ruhig = steht ? ruhig + 1 : 0;
            }
            w8.ruhe = ruhig >= 20;
            // die Kachel-Pflanzen um die Kamera auf der Plattform (die Nah-Streu reicht 24 m)
            w8.pflanzen = 0;
            w8.aufScheibe = 0;
            for (const kk of (s.nahStreu && s.nahStreu.kacheln.values()) || [])
                for (const it of kk.items || []) {
                    const d = abstand(it.x, it.z);
                    if (d < 30) w8.pflanzen++;
                    if (d < L.r) w8.aufScheibe++;
                }
            // DIE STREU der Lichtung: innerhalb 64 m um den Spieler baut keine Region Streu (`SCATTER.innerM`) — der Spieler
            // steht 120 m daneben, die Regionen über der Plattform bauen neu (durch die Wand). Der Aufbau zählt die lebenden
            // Zellen dieser neu gebauten Regionen (die Menge, über die die Wand urteilt); der 40-m-Kreis steht als Zahl daneben
            // (Integration Welle L wasser: dort standen vorher 20 von Soll 20, mit dem Wald nach dem Merge 16 — vier Baum-
            // Zellen fielen unter die Kronen von vier Wald-Bäumen mehr im 60-m-Kreis, Gelände und Wasser an ihnen gleich).
            let keysW8 = null;
            {
                let fx = null;
                for (let a = 0; a < 16 && fx === null; a++) {
                    const qx = L.x + Math.cos((a / 16) * Math.PI * 2) * 120;
                    const qz = L.z + Math.sin((a / 16) * Math.PI * 2) * 120;
                    if (r._isAboveWaterAt(qx, qz, 0.5) && Number.isFinite(r.getTerrainHeightAt(qx, qz))) fx = [qx, qz];
                }
                if (fx) {
                    stell(fx[0], r.getTerrainHeightAt(fx[0], fx[1]) + 3, fx[1]);
                    await pumpe(20);
                    const RM = A.SCATTER.regionM;
                    const keys = new Set();
                    for (const dx of [-40, 0, 40]) for (const dz of [-40, 0, 40]) keys.add(`${Math.floor((L.x + dx) / RM)},${Math.floor((L.z + dz) / RM)}`);
                    for (const k of keys) r._disposeScatterRegion(k);
                    keysW8 = keys;
                    const steht = () =>
                        [...keys].every((q) => {
                            const rg = s.scatterRegions && s.scatterRegions.get(q);
                            return rg && !rg._cont && !rg._deferredFoundry;
                        });
                    for (let k = 0; k < 1500 && !steht(); k++) await pumpe(2);
                    await pumpe(10);
                    w8.streuSteht = steht();
                }
                w8.zellen = 0;
                w8.zellenNeu = 0;
                w8.zellenUeber = 0;
                w8.je = {};
                for (const [rk, region] of (s.scatterRegions && s.scatterRegions.entries()) || [])
                    for (const c of region.cells || []) {
                        if (!((c.slots && c.slots.length) || c.feld)) continue;
                        const d = abstand(c.x, c.z);
                        if (d < 40) w8.zellen++;
                        if (keysW8 && keysW8.has(rk)) w8.zellenNeu++;
                        if (d < L.r + (c.promotable ? krone(c.species, c.scale) : 0)) {
                            w8.zellenUeber++;
                            w8.je[c.layer] = (w8.je[c.layer] || 0) + 1;
                        }
                    }
                stell(L.x, plat.position.y + 2.2, L.z);
                await pumpe(20);
            }
            // der Promotions-Ring um die Plattform (wie W4b: die Promotion lebt ohne warme Foundry)
            {
                const PR = A.SCATTER.promoteM;
                const rest = () => {
                    let n = 0;
                    for (const region of (s.scatterRegions && s.scatterRegions.values()) || [])
                        for (const c of region.cells || [])
                            if (c.promotable && c.promotedId == null && c.slots && (c.x - L.x) ** 2 + (c.z - L.z) ** 2 <= PR * PR && !r._scatterIsCellPromoted(c.x, c.z, c.layer || "tree"))
                                n++;
                    return n;
                };
                window.__anazhGateNoFoundry = true;
                try {
                    for (let k = 0; k < 1500 && rest() > 0; k++) await pumpe(4);
                } finally {
                    window.__anazhGateNoFoundry = false;
                }
                w8.promoRest = rest();
                await pumpe(10);
            }
            w8.baeume = 0;
            w8.naturUeber = 0;
            w8.taeter = [];
            for (const e of s.architectures) {
                if (!istNatur(e) || !e.position) continue;
                const d = abstand(e.position.x, e.position.z);
                if (d < 60 && /^baum_/.test(e._lodSpecies || e.type)) w8.baeume++;
                const k = krone(e._lodSpecies || e.type, e.scale);
                if (d < L.r + k) {
                    w8.naturUeber++;
                    if (w8.taeter.length < 6) w8.taeter.push(`${e.type} ${d.toFixed(1)} m (Krone ${k.toFixed(1)} m)`);
                }
            }
            // der Hain der KI: je Ort `spawn_tree` (4 Bäume im 2,5-m-Kreis) und `spawn_studio` (eine Eiche genau am Ort)
            const hain = (x, z) => {
                const y = (r.getTerrainHeightAt(x, z) || 0) + 0.5;
                const vor = new Set(s.architectures);
                const fehler = [];
                const weicht = { haus: 0, lichtung: 0 };
                for (const prog of [
                    ["spawn_tree", ["at", x, y, z], 4],
                    ["spawn_studio", "eiche", ["at", x, y, z], 1],
                ]) {
                    try {
                        const res = r.dslRun(prog, { source: "test" });
                        for (const e of res.log || [])
                            if (e.event === "natur_weicht")
                                for (const k of ["haus", "lichtung"]) weicht[k] += (e.grundriss && e.grundriss[k]) || 0;
                    } catch (e) {
                        fehler.push(String(e).slice(0, 80));
                    }
                }
                const neu = s.architectures.filter((e) => !vor.has(e) && istNatur(e));
                for (const e of neu) r.removeArchitecture(e);
                return { neu, fehler, weicht };
            };
            const kiP = hain(L.x, L.z);
            w8.kiPlattform = kiP.neu.filter((e) => abstand(e.position.x, e.position.z) < L.r + krone(e._lodSpecies || e.type, e.scale)).length;
            w8.kiFehler = kiP.fehler;
            w8.kiWeichtPlattform = kiP.weicht.lichtung; // 5 Würfe, jeder benannt
            // DER SATZ: der Spieler auf der Plattform sagt „pflanz mir eine eiche" (vor ihm, in der Lichtung) — der Chat nennt
            // die Lichtung, nie „gewachsen" bei 0 Bäumen
            {
                const el = document.getElementById("chat-output");
                const t0 = el ? el.innerText.length : 0;
                const vorC = new Set(s.architectures);
                stell(L.x, plat.position.y + 2.2, L.z);
                try {
                    await r.processChatCommand("pflanz mir eine eiche");
                } catch (e) {
                    w8.kiFehler.push(String(e).slice(0, 80));
                }
                const neuC = s.architectures.filter((e) => !vorC.has(e) && istNatur(e));
                w8.chatBaeume = neuC.filter((e) => abstand(e.position.x, e.position.z) < L.r + krone(e._lodSpecies || e.type, e.scale)).length;
                w8.chatGewachsen = neuC.length;
                for (const e of neuC) r.removeArchitecture(e);
                w8.chatSatz = el ? el.innerText.slice(t0).replace(/\s+/g, " ").trim().slice(0, 240) : null;
            }
            const h0 = H[0];
            if (h0) {
                const mitte = welt(h0, h0.fundament.ox || 0, h0.fundament.oz || 0);
                const kiH = hain(mitte.x, mitte.z);
                w8.kiHaus = kiH.neu.filter((e) => imGrundrissVon([h0], e.position.x, e.position.z)).length;
                w8.kiWeichtHaus = kiH.weicht.haus;
                w8.kiHausTyp = h0.type;
            }
            // die Gegenprobe: ein trockener Ort 150 m von der Plattform, 60 m von jedem Haus
            w8.gegenprobe = null;
            for (let a = 0; a < 16 && w8.gegenprobe === null; a++) {
                const gx = L.x + Math.cos((a / 16) * Math.PI * 2) * 150;
                const gz = L.z + Math.sin((a / 16) * Math.PI * 2) * 150;
                if (!r._isAboveWaterAt(gx, gz, 0.5)) continue;
                if (s.architectures.some((e) => e.fundament && Math.hypot(e.position.x - gx, e.position.z - gz) < 60)) continue;
                w8.gegenprobe = hain(gx, gz).neu.length;
            }
        }
    }
    if (P.has("w4")) {
        stell(dorfMitte.x, (r.getTerrainHeightAt(dorfMitte.x, dorfMitte.z) || start.y) + 3, dorfMitte.z);
        await pumpe(200);
        o.w4 = naturImHaus(H);
    }
    // das ferne Dorf (W4b) steht 300 m östlich — W6 meidet seinen Ort auch, wenn W4b nicht läuft
    const fx = start.x + 300;
    const fz = start.z;
    if (P.has("w4b")) {
        // W4b DAS FERNE DORF: es entsteht 300 m vom Spieler (das Auto-Dorf entsteht ab 260 m, `AUTO_SETTLEMENT.nearM`) — die
        // Streu der Region stand schon (Fern-Bäume, Unterholz, Fels). Dann läuft der Spieler hin: der Promotions-Ring (64 m)
        // macht aus Streu-Bäumen echte Bäume, der Wald des neuen Rings wirft.
        stell(start.x, start.y + 3, start.z);
        await pumpe(60);
        // die Streu steht, bevor das Dorf kommt (wie im Spiel: das Auto-Dorf ab 260 m, die Streu bis 384 m): gewartet wird, bis
        // jede Region unter dem Dorf-Ort gebaut ist, ohne Foundry-Aufschub (`_deferredFoundry`: die Region baut nach der Lieferung
        // neu, dann durch die Wand — eine frische Welt verlor so ihre Zellen unter den Häusern; die Vorphasen trugen das sonst
        // zufällig mit)
        const RMd = A.SCATTER.regionM;
        const dorfRegionen = new Set();
        for (const dx of [-40, 0, 40]) for (const dz of [-40, 0, 40]) dorfRegionen.add(`${Math.floor((fx + dx) / RMd)},${Math.floor((fz + dz) / RMd)}`);
        const streuSteht = () =>
            [...dorfRegionen].every((q) => {
                const rg = s.scatterRegions && s.scatterRegions.get(q);
                return rg && !rg._cont && !rg._deferredFoundry;
            });
        for (let k = 0; k < 1500 && !streuSteht(); k++) await pumpe(4);
        let vorZellen = 0;
        for (const region of (s.scatterRegions && s.scatterRegions.values()) || [])
            for (const c of region.cells || []) if (((c.slots && c.slots.length) || c.feld) && Math.hypot(c.x - fx, c.z - fz) < 40) vorZellen++;
        const vorDorf = new Set(s.architectures);
        r.spawnSettlement({ seed: 23, nH: 14, position: { x: fx, y: r.getTerrainHeightAt(fx, fz), z: fz } });
        const fernHaeuser = () => s.architectures.filter((e) => !vorDorf.has(e) && e.type && e.type.startsWith("haus_") && e.fundament);
        for (let k = 0; k < 120 && fernHaeuser().length < 8; k++) {
            await pumpe(4);
            await warte(100);
        }
        const FH = fernHaeuser();
        o.w4b = { haeuser: FH.length, streuVorher: { steht: streuSteht(), zellen: vorZellen }, fern: streuImHaus(FH) };
        // unter den Häusern: die Zellen, die das Haus geräumt hat, und die, die noch leben (ohne Zellen dort ist W4b blind)
        o.w4b.unterHaus = { lebend: 0, geraeumt: 0 };
        for (const region of s.scatterRegions.values())
            for (const c of region.cells || [])
                if (imGrundrissVon(FH, c.x, c.z)) {
                    if ((c.slots && c.slots.length) || c.feld) o.w4b.unterHaus.lebend++;
                    else if (c.promotedId == null) o.w4b.unterHaus.geraeumt++;
                }
        // die Region unter dem Dorf baut neu (Rückkehr, Nach-Dünnen, Foundry-Refill): sie setzt durch die Wand
        {
            const RM = A.SCATTER.regionM;
            const keys = new Set();
            for (const hs of FH) keys.add(`${Math.floor(hs.position.x / RM)},${Math.floor(hs.position.z / RM)}`);
            for (const k of keys) r._disposeScatterRegion(k);
            const neuSteht = () =>
                [...keys].every((q) => {
                    const rg = s.scatterRegions.get(q);
                    return rg && !rg._cont && !rg._deferredFoundry;
                });
            for (let k = 0; k < 1500 && !neuSteht(); k++) await pumpe(2);
            await pumpe(10);
            o.w4b.neubau = streuImHaus(FH);
            o.w4b.neubau.steht = neuSteht();
        }
        // hinlaufen: der Spieler steht in der Mitte der Häuser, bis die Chunks um ihn stehen und die Promotion (3 je Takt)
        // durch ist (die Nah-Streu der Kamera reicht 24 m — die Mitte des Dorfs, nicht sein Anker)
        let mx = 0;
        let mz = 0;
        for (const hs of FH) {
            mx += hs.position.x / Math.max(1, FH.length);
            mz += hs.position.z / Math.max(1, FH.length);
        }
        stell(mx, (r.getTerrainHeightAt(mx, mz) || start.y) + 3, mz);
        const span = r._voxelChunkConfig(0).span;
        // (1) mit warmer Foundry: der Chunk unter dem Spieler steht, die Wald-Schlange ist leer und die Nah-Streu hat jede
        // gewollte Kachel gebaut (`nahStreu.offen` 0) — 20 Proben in Folge; gezählt wird der Konsum, nie eine feste Takt-Zahl
        // (über dem Frame-Budget läuft der Deko-Job nur jeden 4. Frame und nie neben einem Chunk-Bau: die CI zählte vorher leer)
        let ruhig = 0;
        for (let k = 0; k < 1500 && ruhig < 20; k++) {
            await pumpe(4);
            const e = s.voxelChunks && s.voxelChunks.get(`${Math.floor(mx / span)},${Math.floor(mz / span)}`);
            const ns = s.nahStreu;
            const steht =
                k > 60 && e && e.surfMap && !(s.pendingVegSpawns && s.pendingVegSpawns.length) && ns && ns.kacheln.size > 0 && ns.offen === 0;
            ruhig = steht ? ruhig + 1 : 0;
        }
        o.w4b.ruhe = ruhig >= 20;
        o.w4b.nahStreu = streuImHaus(FH);
        // die Nah-Streu um die Kamera (Farn, Blume, Kiesel der Kachel): keine Pflanze im Grundriss
        {
            let n = 0;
            let imHaus = 0;
            for (const k of (s.nahStreu && s.nahStreu.kacheln.values()) || [])
                for (const it of k.items || []) {
                    n++;
                    if (imGrundrissVon(FH, it.x, it.z)) imHaus++;
                }
            o.w4b.kachel = { pflanzen: n, imHaus };
        }
        // (2) DIE PROMOTION lebt nur ohne warme Foundry: sie kennt jede Art der Baum-Schicht, `_buildVariantLODs` liefert dann
        // nichts, `_promoteScatterCell` endet vor dem Spawn (im Spiel: der Boot-Spalt vor dem Buch). Die Probe stellt diesen
        // Zustand über den Gate-Schalter her (`__anazhGateNoFoundry`, für die Scatter-Promotion vorgesehen) und wartet, bis
        // jede Baum-Zelle im Promotions-Ring promotet ist; die Wand der Promotion (`_naturSetzen`) misst so ihren echten Takt.
        {
            const PR = A.SCATTER.promoteM;
            const ring = () => {
                let rest = 0;
                let promoviert = 0;
                for (const region of (s.scatterRegions && s.scatterRegions.values()) || [])
                    for (const c of region.cells || []) {
                        if (!c.promotable || (c.x - pm.position.x) ** 2 + (c.z - pm.position.z) ** 2 > PR * PR) continue;
                        if (c.promotedId != null) promoviert++;
                        else if (c.slots && !r._scatterIsCellPromoted(c.x, c.z, c.layer || "tree")) rest++;
                    }
                return { rest, promoviert };
            };
            o.w4b.promoWarm = ring();
            window.__anazhGateNoFoundry = true;
            try {
                for (let k = 0; k < 1500 && ring().rest > 0; k++) await pumpe(4);
            } finally {
                window.__anazhGateNoFoundry = false;
            }
            o.w4b.promo = ring();
            await pumpe(10);
        }
        o.w4b.nah = naturImHaus(FH);
    }
    if (P.has("w6")) {
        // W6 DER FRONTALE ANLAUF AUF DIE TÜR: je Kultur (Hof-Grundriss marokkanisch, viktorianisch mit Veranda, alemannisch)
        // steht ein Haus mit Tür-Zeile und Fundament wie ein Siedlungs-Slot auf dem Hang, die Front bergauf (das Gelände der Welt
        // ist bis 420 m nirgends eben; bergauf liegt das Podest vorn auf Gelände-Höhe — ein höheres Podest ist ohne Sprung nie
        // betretbar, offen: Hang-Zugang). Der Spieler läuft 6 m vor der Front los, frontal durch die Tür bis 1,8 m dahinter
        // (beim Hof-Haus durch das Tor, am Brunnen vorbei, über den Hof): (a) vor der ersten Studio-Stufe (im selben Takt wie
        // der Spawn — die Foundry liefert erst im nächsten): die Kern-Hülle; (b) während die FERNSTUFE steht (der Spieler wartet
        // 60 m bzw. 20 m vor der Mitte, bis die Foundry die Stufe 2 bzw. 1 liefert — der Sim-Schritt ruft keinen LOD-Takt, die
        // Stufe bleibt im Anlauf). Soll: 1 m hinter der Schwelle.
        o.w6 = [];
        const KULT = ["marokkanisch", "viktorianisch", "alemannisch"];
        const r0 = (x, z) => r.getTerrainHeightAt(x, z);
        const orte = [];
        for (const k of KULT) {
            const w = { kultur: k };
            o.w6.push(w);
            const P = FC.hausParams(FC.PRESETS[k], null);
            P.seed = 7;
            const Hh = FC.HAUS(window.THREE, FC.mat, P);
            Hh.build({ gelaende: false });
            const dm = Hh.dims;
            const tu = { x: dm.tuer.x, z: dm.tuer.z, w: dm.tuer.w, h: dm.tuer.h, y: dm.tuer.y, W: dm.W, D: dm.D };
            // der Footprint aus den Solids des Gesetzbuchs (beim Hof-Haus reicht er 14 m vor den Ursprung): Mitte + halbe Maße
            let x0 = Infinity;
            let x1 = -Infinity;
            let z0 = Infinity;
            let z1 = -Infinity;
            for (const so of Hh.solids) {
                x0 = Math.min(x0, so.min[0]);
                x1 = Math.max(x1, so.max[0]);
                z0 = Math.min(z0, so.min[2]);
                z1 = Math.max(z1, so.max[2]);
            }
            const fu = { ex: (x1 - x0) / 2, ez: (z1 - z0) / 2, ox: (x0 + x1) / 2, oz: (z0 + z1) / 2 };
            // der Ort: trocken, der Footprint trägt höchstens 4 m Höhenunterschied; die Gier dreht die Front bergauf
            let ort = null;
            const verworfen = {};
            for (let d = 70; d <= 520 && !ort; d += 10)
                for (let a = 0; a < 48 && !ort; a++) {
                    const cx = start.x + Math.cos((a / 48) * Math.PI * 2) * d;
                    const cz = start.z + Math.sin((a / 48) * Math.PI * 2) * d;
                    if (orte.some((q) => Math.hypot(q.x - cx, q.z - cz) < 70)) continue;
                    if (Math.hypot(cx - fx, cz - fz) < 120 || Math.hypot(cx - dorfMitte.x, cz - dorfMitte.z) < 90) continue;
                    if (!r._isAboveWaterAt(cx, cz, 0.5)) continue;
                    const gx = (r0(cx + 4, cz) - r0(cx - 4, cz)) / 8;
                    const gz = (r0(cx, cz + 4) - r0(cx, cz - 4)) / 8;
                    if (!Number.isFinite(gx) || !Number.isFinite(gz) || Math.hypot(gx, gz) < 0.02) continue;
                    const gier = Math.atan2(-gx, -gz); // haus-lokal −z (die Front) = Welt (−sin, −cos) = bergauf
                    const c = Math.cos(gier);
                    const sn = Math.sin(gier);
                    let lo = Infinity;
                    let hi = -Infinity;
                    for (let lx = x0; lx <= x1 + 0.01; lx += Math.max(1, (x1 - x0) / 6))
                        for (let lz = z0; lz <= z1 + 0.01; lz += Math.max(1, (z1 - z0) / 8)) {
                            const h = r0(cx + lx * c + lz * sn, cz - lx * sn + lz * c);
                            lo = Math.min(lo, h);
                            hi = Math.max(hi, h);
                        }
                    // die Front bergauf: die Vorderkante trägt den höchsten Punkt (das Podest liegt vorn auf Gelände-Höhe); kein
                    // Buckel im Footprint über den Ecken (der Slot setzt das Haus auf die höchste Ecke — ein Buckel stünde im Haus)
                    const vorn = r0(cx + fu.ox * c + (z0 - 0.5) * sn, cz - fu.ox * sn + (z0 - 0.5) * c);
                    let ecken = -Infinity;
                    for (const [lx, lz] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1], [fu.ox, fu.oz]])
                        ecken = Math.max(ecken, r0(cx + lx * c + lz * sn, cz - lx * sn + lz * c));
                    if (!(Number.isFinite(hi) && hi - lo <= 5 && hi <= ecken + 0.1 && Number.isFinite(vorn) && vorn >= hi - 0.6)) continue;
                    // der Anlauf-Korridor ist begehbar (2 m breit um die Tür-Achse, 7 m vor der Front bis zur Front, 0,5-m-Raster):
                    // die oberste Feld-Fläche (`getTerrainHeightAt`) stetig — höchstens 1 m je Schritt; an einer Überhang-Kante
                    // sprang sie 10,7 m in 1 cm, der Anlauf begann am Fuß der Klippe und lief unter sie — und 1 m darunter solide (die
                    // Fläche interpoliert das 1,2-m-Raster des Felds)
                    let grund = null;
                    for (const lx of [tu.x - 1, tu.x, tu.x + 1]) {
                        let hVor = null;
                        for (let lz = z0 - 7; lz <= z0 + 0.01 && !grund; lz += 0.5) {
                            const px = cx + lx * c + lz * sn;
                            const pz = cz - lx * sn + lz * c;
                            const h = r0(px, pz);
                            if (!Number.isFinite(h) || (hVor !== null && Math.abs(h - hVor) > 1.0)) grund = "stetig";
                            else if (!r._fieldSolid(px, h - 1.0, pz)) grund = "fels";
                            hVor = h;
                        }
                        if (grund) break;
                    }
                    if (grund) verworfen[grund] = (verworfen[grund] || 0) + 1;
                    else ort = { x: cx, z: cz, hMax: hi, gier };
                }
            if (!ort) {
                w.fehler = "kein Ort (Korridor verworfen: " + JSON.stringify(verworfen) + ")";
                continue;
            }
            orte.push(ort);
            // die Solids der Hülle (die EINE Hüllen-Form, S3: je Box ein Teil mit rolle "fest")
            const huelleVon = (e) =>
                e._hausHuelle && Array.isArray(e._hausHuelle.teile) ? e._hausHuelle.teile.filter((t) => t.rolle !== "sicht").length : 0;
            // der Weg (haus-lokal): frontal auf die Tür; beim Hof-Haus durch das Tor, rechts am Brunnen vorbei (das Gesetz des
            // Hofs: zC = Front − Hof-Tiefe, Torriegel 2,8 m, Brunnen mittig im Hof)
            const wegpunkte = [];
            if (dm.grundriss === "hof" || Hh.grundriss === "hof") {
                const zF = tu.z;
                const zC = zF - Math.max(5, Math.min(9, tu.W));
                const wz = (zF + zC + 2.8) / 2;
                wegpunkte.push([0, zC - 0.6], [0, zC + 2.8 + 0.4], [1.5, wz], [0, zF - 0.7]);
            }
            wegpunkte.push([tu.x, tu.z + 1.8]);
            const anlauf = (e) => {
                const vor = welt(e, tu.x, z0 - 6);
                stell(vor.x, (r0(vor.x, vor.z) || e.position.y) + 1.0, vor.z);
                // der Weg wird verfolgt: der Körper bleibt über dem Boden unter ihm (dem Gelände-Gesetz, auf Podest und Diele der
                // Haus-Basis) — höchstens eine Stufe darüber vor der Schwelle (nie über eine Mauer), nie darunter (nie in ein Loch)
                const base = e.position.y - 0.5;
                s.keys = s.keys || {};
                for (const [lx, lz] of wegpunkte) {
                    const q = welt(e, lx, lz);
                    for (let k = 0; k < 500; k++) {
                        if (Math.hypot(q.x - pm.position.x, q.z - pm.position.z) < 0.2) break;
                        s.yaw = Math.atan2(q.x - pm.position.x, q.z - pm.position.z);
                        s.keys.w = true;
                        r._stepFixedSim((t += DT), DT);
                        const lq = lokal(e, pm.position.x, pm.position.z);
                        const gel = r0(pm.position.x, pm.position.z);
                        const fuss = pm.position.y - FUSS;
                        const ueber = Math.round((fuss - Math.max(gel, base)) * 100) / 100;
                        const unter = Math.round((fuss - gel) * 100) / 100;
                        if (lq.z < tu.z - 0.3 && !(ueber <= w.hochM)) {
                            w.hochM = ueber;
                            w.hochOrt = [Math.round(lq.x * 100) / 100, Math.round(lq.z * 100) / 100];
                        }
                        if (!(unter >= w.tiefM)) {
                            w.tiefM = unter;
                            // der Sturz-Ort: haus-lokal, das Gelände-Gesetz über der Basis, das Feld 0,3 m unter dem Gesetz
                            w.tiefOrt = [Math.round(lq.x * 100) / 100, Math.round(lq.z * 100) / 100, Math.round((gel - base) * 100) / 100];
                            w.tiefFeld = r._fieldSolid(pm.position.x, gel - 0.3, pm.position.z) ? "solide" : "Luft";
                        }
                    }
                    s.keys.w = false;
                    for (let k = 0; k < 10; k++) r._stepFixedSim((t += DT), DT);
                }
                const l = lokal(e, pm.position.x, pm.position.z);
                w.endeLokal = [Math.round(l.x * 100) / 100, Math.round((pm.position.y - A.PLAYER_FOOT_OFFSET - (e.position.y - 0.5)) * 100) / 100];
                return Math.round((l.z - tu.z) * 100) / 100;
            };
            // (a) die Kern-Hülle: der Slot geht den Weg jedes Siedlungs-Hauses (`_spawnSettlementSlot`: Ecken, Podest, Grundriss
            // räumt) — Spawn und Anlauf im selben Takt
            const c = Math.cos(ort.gier);
            const sn = Math.sin(ort.gier);
            const slot = {
                kultur: k,
                x: ort.x,
                z: ort.z,
                phi: ort.gier,
                seed: 7,
                tuer: tu,
                obb: { cx: ort.x + fu.ox * c + fu.oz * sn, cz: ort.z - fu.ox * sn + fu.oz * c, phi: ort.gier, ex: fu.ex, ez: fu.ez },
            };
            const vorSlot = new Set(s.architectures);
            r._spawnSettlementSlot(slot, { x: 0, z: 0 }, r._foundry);
            const e = s.architectures.find((q) => !vorSlot.has(q) && q.type === "haus_" + k);
            if (!e) {
                w.fehler = "Slot fiel";
                continue;
            }
            // der Anlauf-Korridor (2 m breit, 6 m vor der Front bis zur Front) ist frei: die Natur darin räumt die Linse wie
            // einen Weg (ein Baum im Weg ist kein Haus-Befund)
            for (const q of s.architectures.slice()) {
                if (q === e || !istNatur(q)) continue;
                const lq = lokal(e, q.position.x, q.position.z);
                if (Math.abs(lq.x - tu.x) <= 2 && lq.z >= z0 - 7 && lq.z <= z0) r.removeArchitecture(q);
            }
            w.gierGrad = Math.round((ort.gier * 180) / Math.PI);
            w.kernBoxen = e.blockerAABBs ? e.blockerAABBs.length : 0;
            w.kernHuelle = huelleVon(e);
            w.kernDrinM = anlauf(e);
            // (b) die Fernstufen: der Spieler wartet 60 m (Stufe 2) bzw. 20 m (Stufe 1) vor der Mitte, bis die Foundry liefert
            w.fern = [];
            for (const abstand of [60, 20]) {
                const weg = welt(e, fu.ox, fu.oz - abstand);
                stell(weg.x, (r0(weg.x, weg.z) || e.position.y) + 3, weg.z);
                const soll = abstand > 40 ? 2 : 1;
                for (let q = 0; q < 60 && !(e._hausHuelle && e._servedLod === soll); q++) await pumpe(10);
                w.fern.push({ stufe: e._servedLod, huelle: huelleVon(e), drinM: anlauf(e) });
            }
        }
    }
    pm.position.set(start.x, start.y, start.z);
    return o;
}

function urteil(o) {
    const f = [];
    if (o.fehler) return [o.fehler];
    const P = new Set(o.phasen || ["haus", "lichtung", "w4", "w4b", "w6"]);
    if (P.has("haus")) {
        const hs = o.haeuser.filter((h) => !h.fehler);
        if (!(hs.length >= 6)) f.push(`Aufbau: ${hs.length} Häuser geprüft (Soll ≥ 6)`);
        const gedreht = hs.filter((h) => Math.abs(((h.gierGrad % 90) + 90) % 90) > 5 && Math.abs(((h.gierGrad % 90) + 90) % 90) < 85);
        if (!(gedreht.length >= 2)) f.push(`Aufbau: ${gedreht.length} gedrehte Häuser (Soll ≥ 2)`);
        const nichtL0 = hs.filter((h) => h.stufe !== 0 || h.huelle !== 0);
        if (nichtL0.length) f.push(`Aufbau: ${nichtL0.length} Häuser ohne Stufe 0 / Hülle 0 (${nichtL0.map((h) => h.typ).join(" ")})`);
        const zu = hs.filter((h) => !(h.tuerDrinM >= 1.0));
        if (zu.length) f.push(`W1 Tür: ${hs.length - zu.length} von ${hs.length} Häusern betreten (${zu.map((h) => h.typ + "@" + h.gierGrad + "°:" + h.tuerDrinM).join(" ")})`);
        const ohneSchwelle = hs.filter((h) => h.vorplatzUeberM === null || h.vorplatzUeberM === undefined);
        if (ohneSchwelle.length) f.push(`W1 Tür: ${ohneSchwelle.length} Häuser ohne Diele hinter der Schwelle im Gesetzbuch (Vorbedingung)`);
        const begraben = hs.filter((h) => h.vorplatzUeberM > 0.2);
        if (begraben.length) f.push(`W1 Tür: ${begraben.length} von ${hs.length} Türen liegen im Boden — der Vorplatz steht über der Diele (${begraben.map((h) => h.typ + "@" + h.gierGrad + "°:+" + h.vorplatzUeberM + " m").join(" ")}; Soll ≤ 0,2 m)`);
        const diele = hs.filter((h) => h.tuerDrinM >= 1.0 && !(Math.abs(h.dieleCm) <= 3));
        if (diele.length) f.push(`W2 Diele: ${diele.length} Häuser mit dem Fuß neben der Diele (${diele.map((h) => h.typ + ":" + h.dieleCm + " cm").join(" ")})`);
        const mitTreppe = hs.filter((h) => Number.isFinite(h.treppeSollM));
        if (!(mitTreppe.length >= 3)) f.push(`Aufbau: ${mitTreppe.length} Häuser mit EG→OG-Lauf (Soll ≥ 3)`);
        const unten = mitTreppe.filter((h) => !(h.treppeSteigM >= 0.9 * h.treppeSollM));
        if (unten.length) f.push(`W3 Treppe: ${mitTreppe.length - unten.length} von ${mitTreppe.length} Läufen tragen ins OG (${unten.map((h) => h.typ + ":" + h.treppeSteigM + "/" + h.treppeSollM).join(" ")})`);
        const optik = hs.filter((h) => !(h.optikProzent >= 97));
        if (optik.length) f.push(`W5 Kollision == Optik: ${optik.length} Häuser unter 97 % (${optik.map((h) => h.typ + "@" + h.gierGrad + "°:" + h.optikProzent + " %").join(" ")})`);
        if (!o.w7 || !(o.w7.haeuser >= 6)) f.push(`W7 Aufbau: ${o.w7 ? o.w7.haeuser : "?"} Dorf-Häuser abgetastet (Soll ≥ 6)`);
        else if (o.w7.imBau || o.w7.zweitesImBau || !Number.isFinite(o.w7.zweitesDorf))
            f.push(`W7 Bau im Bau: ${o.w7.imBau} Häuser in einem früheren Bau oder mit der Tür an seiner Wand, zweites Dorf am selben Anker ${o.w7.zweitesImBau}/${o.w7.zweitesDorf} im ersten (${o.w7.taeter.join(" · ") || "Akt fehlt"})`);
        const ueber = hs.filter((h) => !(h.grundrissUeberM <= 0.05));
        if (ueber.length) f.push(`W4c Grundriss deckt das Haus nicht: ${ueber.map((h) => h.typ + " " + h.grundrissUeberM + " m").join(" ")} (die Solids ragen aus der Fundament-Box)`);
    }
    if (P.has("w6")) {
        const w6 = (o.w6 || []).filter((w) => !w.fehler);
        if (w6.length < 3) f.push(`W6 Aufbau: ${w6.length} von 3 Häusern (${(o.w6 || []).map((w) => w.kultur + ":" + (w.fehler || "ok")).join(" ")})`);
        if (!w6.some((w) => w.kernHuelle === 0)) f.push("W6 Aufbau: kein Haus vor der ersten Studio-Stufe angelaufen");
        const ueberMauer = w6.filter((w) => !(w.hochM <= 1.3));
        if (ueberMauer.length) f.push(`W6 Aufbau: der Anlauf lief vor der Schwelle über dem Boden (${ueberMauer.map((w) => w.kultur + " " + w.hochM + " m @" + w.hochOrt).join(" ")} — über eine Mauer, nicht durch die Tür)`);
        const imLoch = w6.filter((w) => !(w.tiefM >= -1));
        if (imLoch.length) f.push(`W6 Aufbau: der Körper fiel unter das Gelände (${imLoch.map((w) => w.kultur + " " + w.tiefM + " m @" + w.tiefOrt + " Feld " + w.tiefFeld).join(" ")} — der Ort trägt nicht, kein Tür-Befund)`);
        const kernZu = w6.filter((w) => w.kernHuelle === 0 && !(w.kernDrinM >= 1));
        if (kernZu.length) f.push(`W6 Kern-Hülle: vor der ersten Stufe ${kernZu.map((w) => w.kultur + " " + w.kernDrinM + " m").join(", ")} vor bzw. hinter der Schwelle (Soll ≥ 1)`);
        const fernAlle = [];
        for (const w of w6) for (const fz of w.fern || []) fernAlle.push(Object.assign({ kultur: w.kultur }, fz));
        const stufen = new Set(fernAlle.filter((fz) => fz.stufe >= 1 && fz.huelle > 0).map((fz) => fz.stufe));
        if (!stufen.has(1) || !stufen.has(2)) f.push(`W6 Aufbau: Fernstufen mit Hülle angelaufen: ${[...stufen].join("/") || "keine"} (Soll 1 und 2)`);
        const fernZu = fernAlle.filter((fz) => fz.stufe >= 1 && fz.huelle > 0 && !(fz.drinM >= 1));
        if (fernZu.length) f.push(`W6 Fernstufe: frontal ${fernZu.map((fz) => fz.kultur + "@L" + fz.stufe + " " + fz.drinM + " m").join(", ")} hinter der Schwelle (Soll ≥ 1)`);
    }
    if (P.has("lichtung")) {
        const w = o.w8;
        if (!w || w.fehler) f.push(`W8 Aufbau: ${w ? w.fehler : "Probe fehlt"}`);
        else {
            if (!w.ruhe) f.push("W8 Aufbau: Chunk, Wald-Schlange und Nah-Streu kamen an der Plattform nicht zur Ruhe");
            if (w.promoRest > 0) f.push(`W8 Aufbau: ${w.promoRest} Baum-Zellen im Promotions-Ring der Plattform blieben offen`);
            if (!(w.baeume >= 3)) f.push(`W8 Aufbau: ${w.baeume} Bäume im 60-m-Kreis der Plattform (Soll ≥ 3 — sonst sieht die Probe keinen Wald)`);
            if (!w.streuSteht || !(w.zellenNeu >= 20)) f.push(`W8 Aufbau: ${w.zellenNeu} lebende Streu-Zellen in den neu gebauten Regionen um die Plattform (im 40-m-Kreis ${w.zellen})${w.streuSteht ? "" : " (die Regionen kamen nicht zur Ruhe)"} (Soll ≥ 20)`);
            if (!(w.pflanzen >= 20)) f.push(`W8 Aufbau: ${w.pflanzen} Kachel-Pflanzen im 30-m-Kreis (Soll ≥ 20)`);
            if (!(w.gegenprobe >= 1)) f.push(`W8 Aufbau: der Hain der KI wuchs 150 m weiter nicht (${w.gegenprobe}; ${(w.kiFehler || []).join(" ")}) — die Probe ist blind`);
            const ueber = [];
            if (w.naturUeber) ueber.push(`${w.naturUeber} Natur-Einträge (${w.taeter.join(" · ")})`);
            if (w.zellenUeber) ueber.push(`${w.zellenUeber} Streu-Zellen ${JSON.stringify(w.je)}`);
            if (w.aufScheibe) ueber.push(`${w.aufScheibe} Kachel-Pflanzen auf der Scheibe`);
            if (w.kiPlattform) ueber.push(`${w.kiPlattform} Bäume der KI`);
            if (ueber.length) f.push(`W8 Lichtung: über der Genesis-Scheibe (r ${w.plattform[2]} m) ${ueber.join(", ")}`);
            if (w.kiHaus) f.push(`W8 Hain im Haus: ${w.kiHaus} Bäume der KI im Grundriss von ${w.kiHausTyp}`);
            const stumm = [];
            if (!w.kiHaus && !(w.kiWeichtHaus >= 1)) stumm.push(`der Hain im Haus fiel ohne Eintrag (natur_weicht haus ${w.kiWeichtHaus})`);
            if (!w.kiPlattform && !(w.kiWeichtPlattform >= 1))
                stumm.push(`der Hain auf der Plattform fiel ohne Eintrag (natur_weicht lichtung ${w.kiWeichtPlattform})`);
            if (w.chatGewachsen === 0 && !(/Lichtung/.test(w.chatSatz || "") && !/gewachsen|gepflanzt/.test(w.chatSatz || "")))
                stumm.push(`der Chat sagt „${w.chatSatz}" bei 0 Bäumen (Soll: die Lichtung benannt, nie „gewachsen")`);
            if (w.chatBaeume) stumm.push(`der Satz pflanzte ${w.chatBaeume} Bäume über die Scheibe`);
            if (stumm.length) f.push(`W8 Absage: ${stumm.join(" · ")}`);
        }
    }
    if (P.has("w4") && o.w4 && o.w4.imHaus) f.push(`W4 Grundriss: ${o.w4.imHaus} Natur-Einträge im Grundriss eines Hauses (${o.w4.taeter.join(" ")})`);
    if (P.has("w4b")) {
        if (!o.w4b || !(o.w4b.haeuser >= 8)) f.push(`W4b Aufbau: ${o.w4b ? o.w4b.haeuser : "?"} Häuser im fernen Dorf (Soll ≥ 8)`);
        else {
            if (!(o.w4b.fern.zellen >= 50)) f.push(`W4b Aufbau: ${o.w4b.fern.zellen} lebende Streu-Zellen im Ring (Soll ≥ 50)`);
            if (!o.w4b.streuVorher || !o.w4b.streuVorher.steht || !(o.w4b.streuVorher.zellen >= 20))
                f.push(`W4b Aufbau: die Streu stand nicht, bevor das Dorf kam (${o.w4b.streuVorher ? (o.w4b.streuVorher.steht ? "Regionen gebaut" : "Regionen offen") + ", " + o.w4b.streuVorher.zellen + " Zellen im Dorf-Kreis" : "?"}; Soll gebaut, ≥ 20)`);
            const unterN = o.w4b.unterHaus ? o.w4b.unterHaus.lebend + o.w4b.unterHaus.geraeumt : 0;
            if (!(unterN >= 5)) f.push(`W4b Aufbau: unter den Häusern des fernen Dorfs standen ${unterN} Streu-Zellen (Soll ≥ 5 — sonst sieht die Probe keinen Täter)`);
            if (o.w4b.fern.imHaus) f.push(`W4b Fern-Streu: ${o.w4b.fern.imHaus} Streu-Zellen in den Häusern des fernen Dorfs (${JSON.stringify(o.w4b.fern.je)})`);
            if (!o.w4b.neubau || !o.w4b.neubau.steht || !(o.w4b.neubau.zellen >= 50))
                f.push(`W4b Aufbau: die Region baute ${o.w4b.neubau ? o.w4b.neubau.zellen : "?"} Zellen neu${o.w4b.neubau && !o.w4b.neubau.steht ? " (ohne zur Ruhe zu kommen)" : ""} (Soll ≥ 50, gebaut)`);
            else if (o.w4b.neubau.imHaus) f.push(`W4b Neubau: ${o.w4b.neubau.imHaus} Streu-Zellen der neu gebauten Region in den Häusern (${JSON.stringify(o.w4b.neubau.je)})`);
            if (!o.w4b.ruhe) f.push(`W4b Aufbau: Chunk, Wald-Schlange und Nah-Streu kamen am Dorf nicht zur Ruhe (${o.w4b.kachel ? o.w4b.kachel.pflanzen : "?"} Kachel-Pflanzen)`);
            if (!o.w4b.promo || !(o.w4b.promo.promoviert >= 1) || o.w4b.promo.rest > 0)
                f.push(`W4b Aufbau: die Promotion lief nicht durch (${o.w4b.promo ? o.w4b.promo.promoviert + " promotet, " + o.w4b.promo.rest + " offen" : "?"} im Ring; Soll ≥ 1, 0 offen)`);
            if (o.w4b.kachel && o.w4b.kachel.imHaus) f.push(`W4b Nah-Streu: ${o.w4b.kachel.imHaus} von ${o.w4b.kachel.pflanzen} Kachel-Pflanzen im Grundriss`);
            if (o.w4b.nah.imHaus) f.push(`W4b Promotion: nach dem Hinlaufen ${o.w4b.nah.imHaus} Natur-Einträge im Grundriss (${o.w4b.nah.taeter.join(" ")})`);
            if (o.w4b.nahStreu.imHaus) f.push(`W4b Rest-Streu: nach dem Hinlaufen ${o.w4b.nahStreu.imHaus} Streu-Zellen im Grundriss (${JSON.stringify(o.w4b.nahStreu.je)})`);
        }
    }
    return f;
}

function zeile(o) {
    if (o.fehler) return o.fehler;
    const hs = o.haeuser.filter((h) => !h.fehler);
    return (
        `${hs.length} Häuser (${hs.map((h) => h.gierGrad + "°").join(" ")}) · W1 Tür ${hs.filter((h) => h.tuerDrinM >= 1).length}/${hs.length} (Vorplatz über der Diele ${hs.map((h) => h.vorplatzUeberM).join("/")} m)` +
        ` · W2 Diele ${hs.map((h) => h.dieleCm).join("/")} cm · W3 Treppe ${hs.filter((h) => Number.isFinite(h.treppeSollM)).map((h) => h.treppeSteigM + "/" + h.treppeSollM).join(" ")} m` +
        ` · W4 Natur im Grundriss ${o.w4 ? o.w4.imHaus + "/" + o.w4.natur : "?"} · W4c Überstand ${hs.map((h) => h.grundrissUeberM).join("/")} m` +
        ` · W4b Streu vorher ${o.w4b && o.w4b.streuVorher ? o.w4b.streuVorher.zellen : "?"} Zellen im Dorf-Kreis, unter den Häusern ${o.w4b && o.w4b.unterHaus ? o.w4b.unterHaus.geraeumt + " geräumt + " + o.w4b.unterHaus.lebend + " lebend" : "?"}, fern ${o.w4b && o.w4b.fern ? o.w4b.fern.imHaus + "/" + o.w4b.fern.zellen : "?"} Streu, nah ${o.w4b && o.w4b.nah ? o.w4b.nah.imHaus + "/" + o.w4b.nah.natur : "?"} Natur + ${o.w4b && o.w4b.nahStreu ? o.w4b.nahStreu.imHaus : "?"} Streu, Neubau ${o.w4b && o.w4b.neubau ? o.w4b.neubau.imHaus + "/" + o.w4b.neubau.zellen : "?"}, Nah-Streu ${o.w4b && o.w4b.kachel ? o.w4b.kachel.imHaus + "/" + o.w4b.kachel.pflanzen : "?"}, Promotion ${o.w4b && o.w4b.promo ? o.w4b.promo.promoviert + " (warm " + o.w4b.promoWarm.promoviert + "), offen " + o.w4b.promo.rest : "?"} (${o.w4b ? o.w4b.haeuser : "?"} Häuser)` +
        ` · W5 Optik ${hs.map((h) => h.optikProzent).join("/")} %` +
        ` · W8 Lichtung ${o.w8 ? (o.w8.fehler || `Natur ${o.w8.naturUeber} · Streu ${o.w8.zellenUeber}/${o.w8.zellen} (Regionen ${o.w8.zellenNeu}) · Kachel ${o.w8.aufScheibe}/${o.w8.pflanzen} · KI Plattform ${o.w8.kiPlattform} (benannt ${o.w8.kiWeichtPlattform}) · KI Haus ${o.w8.kiHaus} (benannt ${o.w8.kiWeichtHaus}) · Satz „${o.w8.chatSatz}" · Gegenprobe ${o.w8.gegenprobe} · ${o.w8.baeume} Bäume im 60-m-Kreis`) : "?"}` +
        ` · W7 Bau im Bau ${o.w7 ? o.w7.imBau + "/" + o.w7.haeuser + ", zweites Dorf " + o.w7.zweitesImBau + "/" + o.w7.zweitesDorf : "?"}` +
        ` · W6 Tür frontal ${(o.w6 || []).map((w) => w.kultur + (w.fehler ? ":" + w.fehler : " Kern " + w.kernDrinM + " m (" + w.kernBoxen + " Boxen) / " + (w.fern || []).map((fz) => "L" + fz.stufe + " " + fz.drinM + " m").join(" / "))).join(" · ")}`
    );
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: "new", protocolTimeout: 900000, args: ["--no-sandbox", "--disable-gpu"] });
    let rot = 0;
    try {
        const lauf = async (inj, phasen) => {
            patch = inj && BASIS[inj] ? BASIS[inj] : null;
            patchFehler = [];
            patchAngewandt = new Set();
            // je Lauf ein eigener Browser-Kontext: kein Speicherstand (Save, IndexedDB) des Vorlaufs reist in die nächste
            // Welt (ein gespeichertes Dorf stünde sonst unter dem neu gegründeten)
            const kontext = await browser.createBrowserContext();
            const page = await kontext.newPage();
            page.setDefaultTimeout(880000);
            const errs = [];
            page.on("pageerror", (e) => errs.push((e.message || String(e)).split("\n")[0]));
            await page.evaluateOnNewDocument(() => {
                window.__anazhHeadlessNullRenderer = true;
            });
            await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 180000 });
            await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
                timeout: 180000,
            });
            await page.evaluate(async () => {
                const r = window.anazhRealm;
                let last = -1;
                let stable = 0;
                for (let t = 0; t < 3000; t++) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch (_e) {}
                    const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                    if (sz === last) stable++;
                    else {
                        stable = 0;
                        last = sz;
                    }
                    if (sz > 20 && stable > 40) break;
                    if (t % 10 === 0) await new Promise((res) => setTimeout(res, 0));
                }
            });
            const o = await page.evaluate(proben, phasen || null);
            await kontext.close();
            for (const z of patch || []) {
                const [d, g] = z.length === 3 ? z : ["/anazhRealm.js", z[0]];
                if (!patchAngewandt.has(d + "|" + g)) patchFehler.push(`nie angewandt: ${d} („${g.slice(0, 60)}…")`);
            }
            patch = null;
            return { o, errs, pf: patchFehler.slice() };
        };
        if (SELBST) {
            const soll = {
                huelle: ["W3 Treppe", "W5 Kollision"],
                obb: ["W5 Kollision"],
                grundriss: ["W4 Grundriss"],
                streu: ["W4b Fern-Streu"],
                streuwand: ["W4b Neubau"],
                promotion: ["W4b Promotion"],
                nahstreu: ["W4b Nah-Streu"],
                lichtung: ["W8 Lichtung"],
                lichtungwald: ["W8 Lichtung"],
                kihain: ["W8 Lichtung", "W8 Hain im Haus"],
                stumm: ["W8 Absage"],
                fernstufe: ["W6 Fernstufe"],
                kern: ["W6 Kern-Hülle"],
                bauwand: ["W7 Bau im Bau"],
                raster: ["W1 Tür"],
            };
            // die Phase je Täter (eine Welt fährt nur, was ihr Selbsttest rot machen soll — der Hauptlauf fährt alle)
            const phasenVon = {
                huelle: ["haus"],
                obb: ["haus"],
                grundriss: ["w4"],
                streu: ["w4b"],
                streuwand: ["w4b"],
                promotion: ["w4b"],
                nahstreu: ["w4b"],
                lichtung: ["lichtung"],
                lichtungwald: ["lichtung"],
                kihain: ["lichtung"],
                stumm: ["lichtung"],
                fernstufe: ["w6"],
                kern: ["w6"],
                bauwand: ["haus"],
                raster: ["haus"],
            };
            for (const inj of Object.keys(soll).filter((k) => !NUR.length || NUR.includes(k))) {
                const { o, pf } = await lauf(inj, phasenVon[inj]);
                const f = urteil(o);
                const fehlt = soll[inj].filter((x) => !f.some((y) => y.startsWith(x)));
                const ok = pf.length === 0 && fehlt.length === 0;
                const beleg = soll[inj].map((x) => f.find((y) => y.startsWith(x)) || `${x}: grün (blind!)`).join(" | ");
                console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${inj}" macht ${soll[inj].join(" + ")} rot — ${pf.length ? pf.join("; ") : beleg}`);
                if (!ok) rot++;
            }
        }
        const { o, errs } = await lauf(null, PHASEN.length ? PHASEN : null);
        console.log("  " + zeile(o));
        const f = urteil(o);
        for (const x of f) console.log("  ❌ " + x);
        if (errs.length) console.log("  ❌ Seiten-Fehler: " + errs[0]);
        rot += f.length + (errs.length ? 1 : 0);
        if (process.env.HAUS_WELT_JSON) fs.writeFileSync(process.env.HAUS_WELT_JSON, JSON.stringify(o, null, 1));
    } finally {
        await browser.close();
        server.close();
    }
    console.log(rot ? `❌ gate:haus-welt ROT (${rot})` : "✅ gate:haus-welt grün");
    process.exit(rot ? 1 : 0);
})().catch((e) => {
    console.error(e);
    process.exit(2);
});
