// diag-koerper-stand.cjs — DER KÖRPER STEHT, WO DAS AUGE IHN SIEHT (gate:koerper-stand, Welle L 06.10., Klasse Q4).
// Befund der Leben-Prüfung (Synthese Q4, Kritik §2.1): die Sim steht auf dem Gesetz, die Sicht muss auf dem stehen, was das
// Auge sieht. Gemessen war: die Fuß-IK zog Becken und Sohlen 0,25 m ins Haus-Podest (die Probe las das Gelände unter
// dem Träger), im Sprung sank das Becken 0,25 m, während die Kapsel stieg (N-D1); in jeder Höhle las die Probe die Wiese
// darüber und die IK schwieg; ein Tier auf dem Höhlen-Boden stand im ersten Frame auf dem Dach (+32,6 m); die Sohlen der
// Tiere lagen am Hang-Fuß bis 0,63 m im sichtbaren Boden (R-D15), der 0,5-m-Cache war ihre Y-Quelle (Treppen bis 0,64 m je
// Frame, R-D10), Pitch längs der festen Welt-z, Roll 0 (R-D11); das sterbende Tier kippte halb unter das Gelände (K-D19).
// Die Rad-Ebene des Wagens misst diese Linse nicht: Fahrzeug, Reiter und Parkposition stehen auf dem Gesetz (Entscheid D1
// der Welle L — `_rittEbene` gehört der Familie fahren, der Rad-Spalt gegen das Mesh ist dort eine Sicht-Frage).
// Die Linse ruft die ECHTEN Pfade der Welt (headless, Null-Renderer — die Boden-Karte ist das Mesh des Workers):
//   K1  MENSCH AUF DEM TRÄGER: der Spieler auf der Start-Plattform (der Kapsel-Schritt trägt ihn auf dem Bauwerk), Fuß-IK
//       im Stand → das Becken sinkt nicht (≤ 1 cm); im Sprung (Kapsel in der Luft) senkt kein Boden das Becken
//   K2  MENSCH IN DER HÖHLE: der Spieler auf einem Höhlen-Boden (die Kapsel steht dort) → die Fuß-Probe liest diesen
//       Boden (± 10 cm), nie die Oberkante der Säule darüber
//   K3  TIER IN DER HÖHLE: ein Wolf, gerufen auf den Höhlen-Boden → er bleibt dort (± 15 cm)
//   K4  TIER AM HANG: an der Stelle mit dem größten Abstand Gesetz ↔ Karte im Hang (≥ 12°) stehen der Leib (seine Lage) und
//       die vier Sohlen auf der Boden-Karte (Median |Lage − Karte| und |Sohle − Karte| ≤ 6 cm — seit der Pfoten-IK der
//       Welle LF finden die Sohlen die Karte selbst, gleich wo der Leib steht: der Leib ist der Zeuge der Sicht); entlang
//       eines Wegs über den Hang springt die Lage je Takt nie mehr als 8 cm über die Neigung hinaus (die Cache-Treppe; der
//       Täter heißt mit seiner Box, wenn ein Werk den Sprung trägt) — und (K4c, K24-N1) keine FUGE trägt einen Leib: die
//       Oberkante einer Box, auf der eine Box desselben Werks sitzt (zwei Stamm-Abschnitte), hebt weder die Kapsel noch das
//       Tier. Vorher stieg das Tier an einer Tanne 0,6 m auf die erste Stamm-Fuge (Treppe 55,1 cm, jede der 2803 Fugen trug)
//   K5  TOD-LAGE: die PRÄZISE tiefste Stelle (jeder Vertex der Haut gegen die Karte unter ihm) liegt nach dem Kippen, wo
//       sie im Stand lag (± 3 cm), und sinkt auf dem Weg nie mehr als 5 cm darunter — auf TROCKENEM ebenem Grund (das Tier
//       steht dort; die flachste Stelle war ein Seegrund, der Wolf schwamm 16 cm über ihm, und der Selbsttest las nur die
//       Beine, die ein Ruf 20 m weit am alten Ort verankert ließ: blind, sobald der Gang sie am neuen Ort setzte, K07)
//   K6  TIER AM CHUNK-RAND (K07): am unteren Rand jedes Chunks (0,9 m je Achse) zeichnet das Mesh des Nachbarn, die Karte
//       des Eigners ist leer oder trägt nur, was darunter liegt — (a) der Stand-Leser quer durch die Rand-Streifen um den
//       Start (Träger 0,5 m über dem Boden) trifft die gezeichneten Dreiecke (Strahl auf das Mesh) auf 25 cm, (b) ein
//       stehender Wolf hangauf an der Streifen-Stelle mit dem größten Träger-Fehler (12–30°): jede Sohle (Median je Pfote)
//       und der Leib ≤ 6 cm. Vorher las der Stand-Leser dort den Träger: 527 von 582 Punkten daneben, die Hinterpfoten
//       62–71 cm über dem Boden (Konsum-Leser: Pfoten-IK `_kreaturFussBoden`, Tier-Lage, Fuß-IK des Menschen `_gaitBodenY`)
//   K7  WIESE UND STREU AM CHUNK-RAND (K21): der Boden hat EINEN Leser (`_bodenSichtAt`) — an der Mess-Wiese (die Chunks einer
//       Stufe im Umkreis 120 m) stehen Büschel und Pflanzen im Rand-Streifen so dicht wie in der Chunk-Mitte daneben (L0 0,9–2,7 m):
//       Wiese ±10 %, Streu ±10 % oder drei Unschärfen. Vorher lasen beide nur die Karte des Eigners: Dichte 0,11 gegen
//       1,31 Büschel je m², ein Gitter kahler Linien in der Wiese (Konsum-Leser: `_nahWieseKachelBueschel`, `_nahStreuKachel`)
//   --selftest: je Defekt serviert der Server die Basis-Zeile von anazhRealm.js (cf9a07ba) — GENAU die Probe dieses
//   Defekts muss rot werden; fehlt die geheilte Zeile, ist der Selbsttest rot.
//   node scripts/diag-koerper-stand.cjs [--selftest]
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const { WELT_ORTE_INSTALL } = require("./lib/welt-orte.cjs");

const PORT = Number(process.env.KOERPER_STAND_PORT || 4479);
const ROOT = path.resolve(__dirname, "..");
const SELBST = process.argv.includes("--selftest");
const MIME = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};

// DIE BASIS-ZEILEN je Defekt: [geheilte Form in anazhRealm.js, Basis-Form]. Der Selbsttest serviert die Basis-Form.
const BASIS = {
    traeger: [
        [
            "return this._standSicht(x, z, s._kapselTraegerY, s._kapselStruktur);",
            "return this.getTerrainHeightAt(x, z);",
        ],
    ],
    luft: [
        [
            "return this._standSicht(x, z, s._kapselTraegerY, s._kapselStruktur);",
            "return this.getTerrainHeightAt(x, z);",
        ],
        ["ik: this.state.isInAir !== true,", "ik: true,"],
    ],
    hoehle: [["const g = this._fieldSurfaceBelow(x, y0, z, this._fieldSolid(x, y0, z) ? 2 : 40);", "const g = null;"]],
    sicht: [
        [
            "const v = this._standSicht(px, pz, Number.isFinite(P[k].g) ? P[k].g : centerG, false);",
            "const v = Number.isFinite(P[k].g) ? P[k].g : centerG;",
        ],
        [
            "baseY = this._standSicht(creature.position.x, creature.position.z, terrainHeight, false);",
            "baseY = terrainHeight;",
        ],
    ],
    tod: [["creature.position.y = dying.baseY + hebe[k0] + (hebe[k0 + 1] - hebe[k0]) * (f - k0);", "void 0;"]],
    // K24-N1: die Auflage von Kapsel und Tier liest die Fuge nicht — die Stamm-Fuge trägt (die Leser vor K24-N1)
    fuge: [
        ["box.gedeckt !== true &&", "true &&"],
        ["if (box.gedeckt === true || !(box.topY >= lo", "if (false || !(box.topY >= lo"],
    ],
    // K07: der Stand-Leser liest nur die Karte des Eigners — im Rand-Streifen trägt der Träger
    rand: [
        [
            "const k = this._bodenSichtAt(x, z);",
            // die Karte des Eigners allein (der Leser vor K07, bilinear, null an einer leeren Ecke)
            "const k = (() => { const S = this._voxelChunkConfig(0).span, ax = Math.floor(x / S), az = Math.floor(z / S), e = this.state.voxelChunks ? this.state.voxelChunks.get(`${ax},${az}`) : null, m = e && e.surfMap; if (!m) return null; const C = this._voxelChunkConfig(e.lod || 0), T = AnazhRealm.BODEN_KARTE_TEILUNG, h = C.step / T, M = T * (C.dim + 3) + 1, u = (x - (ax * C.span - C.step)) / h, v = (z - (az * C.span - C.step)) / h, i = Math.floor(u), j = Math.floor(v); if (i < 0 || j < 0 || i >= M - 1 || j >= M - 1) return null; const a = m[i + j * M], b = m[i + 1 + j * M], c = m[i + (j + 1) * M], d = m[i + 1 + (j + 1) * M]; if (!(Number.isFinite(a) && Number.isFinite(b) && Number.isFinite(c) && Number.isFinite(d))) return null; const fu = u - i, fv = v - j; return (a * (1 - fu) + b * fu) * (1 - fv) + (c * (1 - fu) + d * fu) * fv; })();",
        ],
    ],
    // K21: Nah-Wiese und Nah-Streu lesen nur die Karte des Eigners — im Rand-Streifen ist sie leer (der Leser vor K21)
    wiese: [
        [
            "const y = this._bodenSichtAt(x, z, grund);",
            "const y = (() => { const C = this._voxelChunkConfig(0), lx = x - Math.floor(x / C.span) * C.span, lz = z - Math.floor(z / C.span) * C.span; return lx < C.step / 2 || lz < C.step / 2 ? null : this._bodenSichtAt(x, z, grund); })();",
        ],
        [
            "const py = this._bodenSichtAt(px, pz);",
            "const py = (() => { const C = this._voxelChunkConfig(0), lx = px - Math.floor(px / C.span) * C.span, lz = pz - Math.floor(pz / C.span) * C.span; return lx < C.step / 2 || lz < C.step / 2 ? null : this._bodenSichtAt(px, pz); })();",
        ],
    ],
};
let patch = null;
let patchFehler = [];
// Der Patch wirkt auf den virtuellen Stamm (scripts/lib/stamm.cjs) — EINMAL je Patch-Satz; ausgeliefert wird je Stamm-
// Datei ihr Teil (`liefere`), so trifft jede Zeile die Datei, die sie trägt.
let gepatcht = { patch: null, text: null };
function stammGepatcht() {
    if (gepatcht.patch !== patch) {
        let txt = stammLib.text(ROOT);
        for (const [geheilt, basis] of patch) {
            if (!txt.includes(geheilt)) patchFehler.push(`geheilte Zeile fehlt („${geheilt.slice(0, 70)}…")`);
            else txt = txt.replace(geheilt, basis);
        }
        gepatcht = { patch, text: txt };
    }
    return gepatcht.text;
}

const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(ROOT, p);
    if (!fp.startsWith(ROOT)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        if (patch && stammLib.istStammUrl(ROOT, p)) data = stammLib.liefere(ROOT, p, stammGepatcht());
        res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

// Die Proben laufen IN der Seite (r = die Welt). Kein Stub: jede Probe ruft die Chokepoints des Spiels.
// DER UMFANG DER K7-PROBE (die EINE Quelle für Messung und Urteil): Büschel der Nah-Wiese und Pflanzen der Nah-Streu neben dem
// Rand-Streifen — bei 1 000 Büscheln ist die Unschärfe des Verhältnisses ≈ 3 %
const K7_UMFANG = Object.freeze({ bueschel: 1000, pflanzen: 100 });

async function proben(mitWiese, umfang) {
    const r = window.anazhRealm;
    const s = r.state;
    const T = window.THREE;
    const A = r.constructor;
    const o = {};
    const pm = s.playerMesh;
    const p = s.player;
    const rig = pm && pm.userData && pm.userData.rig;
    if (!rig || !rig.hips) return { fehler: "Spieler-Rig fehlt" };
    // die Boden-Karte des EIGNERS selbst (das gezeichnete Mesh des Chunks, bilinear, null an einer leeren Ecke) — die Linse
    // misst gegen sie, nie durch den Schnitt; K6 sucht mit ihr das Rand-Loch (dort ist sie leer, der Strahl richtet). Seit
    // K21 liest das Spiel nur `_bodenSichtAt` — die Linse rechnet die Karte des Eigners selbst.
    const span = r._voxelChunkConfig(0).span;
    const karte = (x, z) => {
        const cx = Math.floor(x / span);
        const cz = Math.floor(z / span);
        const e = s.voxelChunks ? s.voxelChunks.get(`${cx},${cz}`) : null;
        const m = e && e.surfMap;
        if (!m) return null;
        const C = r._voxelChunkConfig(e.lod || 0);
        const T = A.BODEN_KARTE_TEILUNG;
        const h = C.step / T;
        const M = T * (C.dim + 3) + 1;
        const u = (x - (cx * C.span - C.step)) / h;
        const v = (z - (cz * C.span - C.step)) / h;
        const i = Math.floor(u);
        const j = Math.floor(v);
        if (i < 0 || j < 0 || i >= M - 1 || j >= M - 1) return null;
        const ka = m[i + j * M];
        const kb = m[i + 1 + j * M];
        const kc = m[i + (j + 1) * M];
        const kd = m[i + 1 + (j + 1) * M];
        if (!(Number.isFinite(ka) && Number.isFinite(kb) && Number.isFinite(kc) && Number.isFinite(kd))) return null;
        const fu = u - i;
        const fv = v - j;
        return (ka * (1 - fu) + kb * fu) * (1 - fv) + (kc * (1 - fu) + kd * fu) * fv;
    };
    // die Kapsel ruhen lassen (Fuß-Tempo 0) und n feste Sim-Schritte gehen
    const savedVel = s.playerVel;
    let vy = 0;
    s.playerVel = {
        x: () => 0,
        y: () => vy,
        z: () => 0,
        setValue: (_x, y) => {
            vy = y;
        },
    };
    const kapsel = (n) => {
        for (let k = 0; k < n; k++) r._stepCharacter(1 / 60, 1000 + k / 60);
    };
    let uhr = 2000;
    const animiere = (n) => {
        p._gaitW = 0;
        p.animationLastTick = -Infinity;
        for (let k = 0; k < n; k++) r.animatePlayerSoul((uhr += 1 / 60));
    };
    const ikRuhe = () => {
        const ik = pm.userData._gaitIK;
        if (ik) {
            ik.probeL.g = NaN;
            ik.probeR.g = NaN;
        }
    };
    const wpl = () => (pm.userData._gaitIK && pm.userData._gaitIK.wpl) || 1;
    // ── K1 MENSCH AUF DEM TRÄGER (Start-Plattform) ──
    {
        kapsel(30);
        o.k1 = { struktur: s._kapselStruktur === true, traeger: s._kapselTraegerY };
        // Bezug: die Becken-Höhe der Pose selbst (im Stand ohne Gang-Wippen `_baseHipY` — der Rig-Bezug, den
        // `_animateHumanoidRig` vor jeder IK setzt); was darunter liegt, hat die Fuß-IK gesenkt
        const air = s.isInAir;
        s.isInAir = false;
        ikRuhe();
        animiere(2);
        const hRef = rig._baseHipY;
        ikRuhe();
        animiere(10);
        o.k1.beckenCm = Math.round((rig.hips.position.y - hRef) * wpl() * 1000) / 10;
        // im Sprung: die Kapsel steigt, das Becken bleibt
        vy = 4.5;
        s._fieldVy = 4.5;
        kapsel(6);
        o.k1.sprungLuft = s.isInAir === true;
        ikRuhe();
        animiere(4);
        o.k1.sprungBeckenCm = Math.round((rig.hips.position.y - hRef) * wpl() * 1000) / 10;
        vy = 0;
        s._fieldVy = 0;
        kapsel(90);
        s.isInAir = air;
    }
    // ── K2 MENSCH IN DER HÖHLE ── (die erste Luft-Tasche ≥ 3 m unter der Oberfläche, Raster 8 m um den Spieler, in die der
    // Leib passt). K16 (das Flussnetz-Gelände): seine Höhlen sind Gänge, oft schmaler als ein Leib — an der ersten Tasche
    // (−7,4/3,1) lag der Grund 1,5 m daneben 3,9 m tiefer, die Kapsel glitt 2,2 m in den Fels, Fuß-Probe und Tier-Boden
    // lasen nichts (null, und `null <= 10` hieß grün). Im Umkreis R (Spieler und Wolf 1,5 m daneben: 2,4 m) liegt der Fels
    // im Abstand r höchstens r/3 über oder unter dem Grund (≤ 18°, der Leib ruht), darüber Luft bis + 2,4 m — wie die
    // Kammer-Probe des Fall-Wächters (`leibPasst`).
    const passt = (x, z, g, R) => {
        for (let k = 0; k < 12; k++) {
            const w = (k / 12) * Math.PI * 2;
            for (const rr of [R / 2, R]) {
                const px = x + Math.cos(w) * rr;
                const pz = z + Math.sin(w) * rr;
                const d = rr / 3;
                for (let yy = g + d + 0.05; yy <= g + 2.4; yy += 0.3) if (r._fieldSolid(px, yy, pz)) return false;
                let fy = g + d + 0.05;
                while (fy > g - d && !r._fieldSolid(px, fy, pz)) fy -= 0.05;
                if (fy <= g - d) return false;
            }
        }
        return true;
    };
    const start = { x: pm.position.x, y: pm.position.y, z: pm.position.z };
    let hoehle = null;
    for (let d = 8; d <= 160 && !hoehle; d += 8)
        for (let a = 0; a < 16 && !hoehle; a++) {
            const x = start.x + Math.cos((a / 16) * Math.PI * 2) * d;
            const z = start.z + Math.sin((a / 16) * Math.PI * 2) * d;
            const top = r._voxelSurfaceY(x, z);
            if (!Number.isFinite(top)) continue;
            let inLuft = false;
            let luftOben = null;
            for (let y = top - 1.0; y > top - 45; y -= 0.3) {
                const sol = r._fieldSolid(x, y, z);
                if (!sol && !inLuft) {
                    inLuft = true;
                    luftOben = y;
                }
                if (sol && inLuft) {
                    if (luftOben - y >= 3.0) {
                        const boden = r._fieldSurfaceBelow(x, y + 0.5, z, 2);
                        if (Number.isFinite(boden) && top - boden > 6 && passt(x, z, boden, 2.4))
                            hoehle = { x, z, top, boden };
                    }
                    break;
                }
            }
        }
    o.hoehle = hoehle;
    if (hoehle) {
        pm.position.set(hoehle.x, hoehle.boden + A.PLAYER_FOOT_OFFSET + 0.05, hoehle.z);
        vy = 0;
        s._fieldVy = 0;
        kapsel(40);
        ikRuhe();
        animiere(6);
        const ik = pm.userData._gaitIK;
        o.k2 = {
            kapselFussY: pm.position.y - A.PLAYER_FOOT_OFFSET,
            probe: ik ? Math.min(ik.probeL.g, ik.probeR.g) : null,
        };
        o.k2.abstandCm = Number.isFinite(o.k2.probe)
            ? Math.round(Math.abs(o.k2.probe - o.k2.kapselFussY) * 1000) / 10
            : null;
        // ── K3 TIER IN DER HÖHLE ──
        const saveMax = s.maxCreatures;
        s.maxCreatures = Math.max(saveMax || 0, s.creatures.length + 3);
        const w = r.spawnCreatureAt(hoehle.x + 1.5, hoehle.boden + 0.3, hoehle.z, "happy", "wolf", {
            precise: true,
            bodySize: 1,
        });
        if (w) {
            const hs = [];
            for (let k = 0; k < 40; k++) {
                r.updateCreatures(0.02);
                w.position.x = hoehle.x + 1.5;
                w.position.z = hoehle.z;
                hs.push(w.position.y - (w.userData._hopH || 0));
            }
            const bodenW = r._fieldSurfaceBelow(hoehle.x + 1.5, hoehle.boden + 1.0, hoehle.z, 3);
            hs.sort((a, b) => a - b);
            o.k3 = { tierY: hs[hs.length >> 1], boden: bodenW };
            o.k3.abstandM = Number.isFinite(bodenW) ? Math.round(Math.abs(o.k3.tierY - bodenW) * 100) / 100 : null;
            r.removeCreature(w);
        }
        s.maxCreatures = saveMax;
    }
    pm.position.set(start.x, start.y, start.z);
    vy = 0;
    s._fieldVy = 0;
    kapsel(30);
    // ── K4 TIER AM HANG: die Hang-Stelle (12–30°, die Karte geschlossen im 2-m-Umkreis) mit dem größten Abstand Gesetz ↔
    // Karte im Band der Leben-Prüfung (15–60 cm); dazu eine ebene trockene Stelle (≤ 3°, über dem Wasser) für die Tod-Lage ──
    // K16 (das Flussnetz-Gelände): um die Plattform trägt der Hang das Gesetz glatt (Gesetz ↔ Karte höchstens 10 cm im
    // 120-m-Quadrat) — der Ort kommt aus der Welt: das Quadrat um den Start, dann um die Orte 150 m und 300 m weit
    // (die Welt schwingt dort ein), der erste mit einer Hang-Stelle im Band.
    let hang = null;
    let eben = null;
    // DIE MITTE DER EINGESCHWUNGENEN WELT: um sie stehen die Chunks der Nah-Zone (K6 misst den Rand-Streifen dort, nie am
    // verlassenen Start — 300 m weiter trägt der Start die gröbersten Stufen; seit K51 liegen die Nähte 0 ↔ 1 ↔ 2 im Streifen
    // der Probe, der Leser liest über jede Stufen-Grenze)
    let mitte = { x: start.x, z: start.z };
    const orte = [[0, 0]];
    for (const d of [150, 300])
        for (let a = 0; a < 8; a++)
            orte.push([
                Math.round(Math.cos((a / 8) * Math.PI * 2) * d),
                Math.round(Math.sin((a / 8) * Math.PI * 2) * d),
            ]);
    for (const [ox, oz] of orte) {
        if (hang) break;
        eben = null;
        if (ox || oz) {
            // einschwingen am Ort (der echte Spiel-Takt mit der echten Bewegung)
            const vel = s.playerVel;
            s.playerVel = savedVel;
            pm.position.set(start.x + ox, r._voxelSurfaceY(start.x + ox, start.z + oz) + 2, start.z + oz);
            mitte = { x: start.x + ox, z: start.z + oz };
            savedVel.setValue(0, 0, 0);
            let last = -1;
            let stabil = 0;
            for (let t = 0; t < 3000; t++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                const sz = s.voxelChunks ? s.voxelChunks.size : 0;
                if (sz === last) stabil++;
                else {
                    stabil = 0;
                    last = sz;
                }
                if (t > 50 && stabil > 40 && !(s.voxelMeshPending && s.voxelMeshPending.size)) break;
                if (t % 10 === 0) await new Promise((res) => setTimeout(res, 0));
            }
            s.playerVel = vel;
        }
        for (let dx = -60; dx <= 60; dx += 2)
            for (let dz = -60; dz <= 60; dz += 2) {
                const x = start.x + ox + dx;
                const z = start.z + oz + dz;
                const k = karte(x, z);
                if (k === null) continue;
                const g = r._voxelSurfaceY(x, z);
                if (!Number.isFinite(g)) continue;
                const kx = karte(x + 1, z);
                const kz = karte(x, z + 1);
                if (kx === null || kz === null) continue;
                if ([karte(x + 2, z + 2), karte(x - 2, z + 2), karte(x + 2, z - 2), karte(x - 2, z - 2)].includes(null))
                    continue;
                const neig = Math.atan(Math.hypot(kx - k, kz - k)) * (180 / Math.PI);
                const ab = Math.abs(g - k);
                const trocken = !(r._koerperWasser(x, z, k) > k);
                if (neig <= 3 && ab < 0.1 && trocken && (!eben || neig < eben.neig))
                    eben = { x, z, karte: k, gesetz: g, neig };
                if (neig < 12 || neig > 30 || ab < 0.15 || ab > 0.6) continue;
                if (!hang || ab > hang.abstand) hang = { x, z, abstand: ab, gesetz: g, karte: k, neig };
            }
    }
    o.hang = hang;
    o.eben = eben;
    if (hang) {
        const saveMax = s.maxCreatures;
        s.maxCreatures = Math.max(saveMax || 0, s.creatures.length + 3);
        pm.position.set(hang.x + 6, r._voxelSurfaceY(hang.x + 6, hang.z + 6) + 1.7, hang.z + 6); // nah genug für die Voll-Gestalt und die Hang-Proben
        const c = r.spawnCreatureAt(hang.x, hang.gesetz + 0.3, hang.z, "happy", "wesen", {
            precise: true,
            bodySize: 1,
        });
        if (c) {
            const tiere = (n, fn) => {
                for (let k = 0; k < n; k++) {
                    r.updateCreatures(0.02);
                    c.userData._hopV = 0;
                    c.userData._hopH = 0;
                    if (fn) fn(k);
                    else {
                        c.position.x = hang.x;
                        c.position.z = hang.z;
                    }
                }
            };
            tiere(80);
            // die Sohlen: Pfoten-Punkte im Pfoten-Raum, kalibriert in der Ruhe-Pose (die Methode der Leben-Prüfung)
            const tb = c.userData._tierBaum;
            const Tt = tb && tb.teile;
            const pf = Tt ? [Tt.flP, Tt.frP, Tt.hlP, Tt.hrP] : [];
            if (pf.length === 4 && pf.every(Boolean)) {
                const rx = c.rotation.x;
                const rz = c.rotation.z;
                c.rotation.x = 0;
                c.rotation.z = 0;
                r._tierBaumNeutralStance(c);
                c.updateMatrixWorld(true);
                const y0 = c.position.y;
                const lokal = pf.map((q) => {
                    const w = new T.Vector3().setFromMatrixPosition(q.matrixWorld);
                    w.y = y0;
                    return q.worldToLocal(w.clone());
                });
                c.rotation.x = rx;
                c.rotation.z = rz;
                const abst = [];
                const leib = [];
                for (let k = 0; k < 30; k++) {
                    tiere(1);
                    c.updateMatrixWorld(true);
                    const mL = karte(c.position.x, c.position.z);
                    if (mL !== null) leib.push(Math.abs(c.position.y - mL));
                    for (let i = 0; i < 4; i++) {
                        const w = pf[i].localToWorld(lokal[i].clone());
                        const m = karte(w.x, w.z);
                        if (m !== null) abst.push(Math.abs(w.y - m));
                    }
                }
                abst.sort((a, b) => a - b);
                leib.sort((a, b) => a - b);
                o.k4 = {
                    leibMedianCm: leib.length ? Math.round(leib[leib.length >> 1] * 1000) / 10 : null,
                    sohlen: abst.length,
                    medianCm: abst.length ? Math.round(abst[abst.length >> 1] * 1000) / 10 : null,
                    p90Cm: abst.length ? Math.round(abst[Math.floor(abst.length * 0.9)] * 1000) / 10 : null,
                };
            } else o.k4 = { fehler: "keine Pfoten-Gestalt" };
            // der Weg über den Hang: je Takt 0,12 m, der Sprung über die Neigung hinaus
            const kx = karte(hang.x + 1, hang.z) - hang.karte;
            const kz = karte(hang.x, hang.z + 1) - hang.karte;
            const lg = Math.hypot(kx, kz) || 1;
            const ux = kx / lg;
            const uz = kz / lg;
            let yAlt = null;
            let xAlt = null;
            let zAlt = null;
            let maxUeber = 0;
            let traeger = null;
            // der Täter beim Namen: die Box-Oberkante eines Werks, auf der die Lage nach dem größten Sprung steht (sonst Boden)
            const traegerBox = (x, z, y) => {
                for (const e of s.architectures || []) {
                    const bx = e && e.blockerAABBs;
                    if (!bx || !e.position || Math.abs(e.position.x - x) > 12 || Math.abs(e.position.z - z) > 12)
                        continue;
                    for (let i = 0; i < bx.length; i++) {
                        const b = bx[i];
                        if (!(Math.abs(b.topY - y) < 0.005)) continue;
                        if (x > b.minX - 1.5 && x < b.maxX + 1.5 && z > b.minZ - 1.5 && z < b.maxZ + 1.5)
                            return `${e.type}#${e.id} Box ${i} Oberkante ${b.topY.toFixed(2)}`;
                    }
                }
                return "Boden";
            };
            tiere(140, (k) => {
                const sx = hang.x + ux * (-8 + k * 0.12);
                const sz = hang.z + uz * (-8 + k * 0.12);
                const yJetzt = c.position.y;
                if (yAlt !== null && k > 4) {
                    // die Neigung über den GEGANGENEN Weg (die Lage des Vortakts zur Lage jetzt): ein Werk am Weg schiebt
                    // den Leib (K20: die Hülle der Tanne ist ihr gezeichneter Stamm — der Stoß am Stamm ist kein Sprung)
                    const weg = Math.hypot(c.position.x - xAlt, c.position.z - zAlt);
                    const erwartet = Math.abs(Math.tan((hang.neig * Math.PI) / 180) * weg);
                    const ueber = Math.abs(yJetzt - yAlt) - erwartet;
                    if (ueber > maxUeber) {
                        maxUeber = ueber;
                        traeger = traegerBox(c.position.x, c.position.z, yJetzt);
                    }
                }
                yAlt = yJetzt;
                xAlt = c.position.x;
                zAlt = c.position.z;
                c.position.x = sx;
                c.position.z = sz;
            });
            o.k4b = { treppeCm: Math.round(maxUeber * 1000) / 10, traeger };
            // ── K4c DIE FUGE (K24-N1): die Oberkante einer Box, auf der eine Box DESSELBEN Werks sitzt (sie beginnt höchstens
            // PLAYER_GROUND_SNAP über ihr, deckt ihre Mitte, und der Rand daneben ist schmaler als der Wand-Radius der Kapsel —
            // die Fuge zweier Stamm-Abschnitte, zweier Fels-Lagen, Pfosten unter dem Bogen), ist keine Fläche: an ihrem Rand, der
            // Fuß 0,3 m unter ihr, trägt sie weder die Kapsel des Spielers (`_stepCharacterStructures`) noch die Auflage des
            // Tiers (`_kreaturAuflage`). Geprüft wird jedes Werk mit achsparallelen Boxen im Umkreis 60 m um den Start. Befund
            // (K24-N1): an der Hang-Stelle stieg das Tier auf die erste Stamm-Fuge einer Tanne, 0,6 m je Takt (K4 Treppe 55,1 cm).
            {
                const R = A.PLAYER_WALL_RADIUS;
                const SNAP = A.PLAYER_GROUND_SNAP;
                let fugen = 0;
                let traegt = 0;
                const taeter = [];
                const saveNah = c.userData._huellenNah;
                const cp = c.position.clone();
                for (const e of s.architectures || []) {
                    const bx = e && e.blockerAABBs;
                    if (!bx || !e.position || bx.some((b) => b.obb)) continue;
                    if (Math.hypot(e.position.x - start.x, e.position.z - start.z) > 60) continue;
                    for (let i = 0; i < bx.length; i++) {
                        const a = bx[i];
                        const mx = (a.minX + a.maxX) / 2;
                        const mz = (a.minZ + a.maxZ) / 2;
                        const deckel = bx.findIndex(
                            (b) =>
                                b !== a &&
                                b.botY <= a.topY + SNAP &&
                                b.topY > a.topY &&
                                mx >= b.minX &&
                                mx <= b.maxX &&
                                mz >= b.minZ &&
                                mz <= b.maxZ &&
                                b.minX <= a.minX + R &&
                                b.maxX >= a.maxX - R &&
                                b.minZ <= a.minZ + R &&
                                b.maxZ >= a.maxZ - R
                        );
                        if (deckel < 0) continue;
                        fugen++;
                        // je Leser die Fuge ALLEIN (die Auflage einer Nachbar-Box gleicher Höhe zählt nicht): die Kapsel
                        // über ihren Chokepoint `_resolveCapsuleVsAABB`, das Tier über `_kreaturAuflage` mit dem Werk aus ihr
                        const fuss = a.topY - 0.3;
                        const kapsel = r._resolveCapsuleVsAABB(
                            a,
                            { x: a.maxX + 0.1, z: mz },
                            fuss,
                            fuss + 1.7,
                            R,
                            -Infinity
                        );
                        c.position.set(a.maxX - 0.02, fuss, mz);
                        const nurA = { position: e.position, blockerAABBs: [a], _blockerReach: e._blockerReach };
                        c.userData._huellenNah = {
                            x: c.position.x,
                            z: c.position.z,
                            t: s.creatureAnimationTime,
                            liste: [nurA],
                        };
                        const tier = r._kreaturAuflage(c, 0);
                        const wer = [];
                        if (Math.abs(kapsel - a.topY) < 0.005) wer.push("Kapsel");
                        if (Math.abs(tier - a.topY) < 0.005) wer.push("Tier");
                        if (!wer.length) continue;
                        traegt++;
                        if (taeter.length < 3)
                            taeter.push(
                                `${e.type}#${e.id} Box ${i} unter Box ${deckel} (Oberkante ${a.topY.toFixed(2)}, trägt ${wer.join("+")})`
                            );
                    }
                }
                c.userData._huellenNah = saveNah;
                c.position.copy(cp);
                o.k4c = { fugen, traegt, taeter };
            }
            // ── K5 TOD-LAGE ── (auf der ebenen Stelle: das Tier stirbt, kippt, liegt — die tiefste Stelle gegen den Boden)
            const ort = eben || hang;
            pm.position.set(ort.x + 6, r._voxelSurfaceY(ort.x + 6, ort.z + 6) + 1.7, ort.z + 6);
            tiere(20, () => {
                c.position.x = ort.x;
                c.position.z = ort.z;
            });
            // die PRÄZISE tiefste Stelle: jeder Vertex der sichtbaren Haut (Skin angewandt, `getVertexPosition`) gegen die
            // Boden-Karte unter IHM — nie die Welt-AABB (eine Obermenge: sie verbarg 11,9 cm Spalt als „liegt auf")
            const tiefste = () => {
                c.updateMatrixWorld(true);
                const v = new T.Vector3();
                let min = Infinity;
                c.traverseVisible((q) => {
                    const pa = q.isMesh && !q.isInstancedMesh && q.geometry && q.geometry.attributes.position;
                    if (!pa) return;
                    for (let i = 0; i < pa.count; i++) {
                        q.getVertexPosition(i, v);
                        v.applyMatrix4(q.matrixWorld);
                        const m = karte(v.x, v.z);
                        if (m !== null && v.y - m < min) min = v.y - m;
                    }
                });
                return Number.isFinite(min) ? Math.round(min * 1000) / 10 : null;
            };
            const stehtCm = tiefste();
            r.damageCreature(c, 1e6, {});
            const dy = c.userData.dying;
            if (dy) {
                const nKipp = Math.ceil((dy.dauer + 0.05) / 0.02);
                let wegMin = Infinity;
                let wegMax = -Infinity;
                for (let k = 0; k < nKipp; k++) {
                    r.updateCreatures(0.02);
                    if (k % 5 === 4) {
                        const t = tiefste();
                        if (t !== null) {
                            wegMin = Math.min(wegMin, t - stehtCm);
                            wegMax = Math.max(wegMax, t - stehtCm);
                        }
                    }
                }
                const liegt = tiefste();
                o.k5 = {
                    stehtCm,
                    untenCm: liegt,
                    // gegen den Stand: der Kontakt des stehenden Tiers ist die Null (die Pose steht, wie sie steht)
                    gegenStandCm: liegt !== null && stehtCm !== null ? Math.round((liegt - stehtCm) * 10) / 10 : null,
                    wegMinCm: Number.isFinite(wegMin) ? Math.round(wegMin * 10) / 10 : null,
                    wegMaxCm: Number.isFinite(wegMax) ? Math.round(wegMax * 10) / 10 : null,
                };
            } else o.k5 = { fehler: "kein Sterben" };
            if (c.parent) r.removeCreature(c); // ein Wesen oder ein Gefallener (state.leichname)
        }
        s.maxCreatures = saveMax;
    }
    // ── K6 TIER AM CHUNK-RAND (K07, der Fuß steht in der Standphase): am unteren Rand jedes Chunks (je Achse ein halber
    // Zellen-Schritt) zeichnet das Mesh des NACHBARN, die Karte des Eigners ist dort leer. Die Streifen-Stelle (0,45 m im
    // Chunk, x-Rand) mit dem größten Fehler eines Lesers, der dort den Träger nimmt (Gesetz der Mitte gegen den gezeichneten
    // Boden 0,7 m hangab, 10–60 cm): ein stehender Wolf, Blick hangauf, Sohlen und Leib gegen die GEZEICHNETEN Dreiecke (ein
    // Strahl lotrecht auf das Mesh des Eigners und seiner unteren Nachbarn — nie durch den Leser, den der Schnitt heilt) ──
    {
        const strahl = new T.Raycaster();
        const ab = new T.Vector3(0, -1, 0);
        const von = new T.Vector3();
        let meshe = 0;
        // die oberste Fläche des letzten Strahls jeder Art: ist sie steil, steht der Punkt unter einem Überhang (die Karte
        // trägt dort die Oberkante ihrer Raster-Punkte, der Strahl die Fläche darunter — keine Frage des Rand-Streifens)
        let obenY = -Infinity;
        let obenSteil = false;
        const gezeichnet = (x, z) => {
            obenY = -Infinity;
            obenSteil = false;
            const cx = Math.floor(x / span);
            const cz = Math.floor(z / span);
            let best = null;
            for (const [a, b] of [
                [0, 0],
                [-1, 0],
                [0, -1],
                [-1, -1],
            ]) {
                const e = s.voxelChunks ? s.voxelChunks.get(`${cx + a},${cz + b}`) : null;
                if (!e || !e.mesh || !e.mesh.geometry) continue;
                meshe++;
                e.mesh.updateMatrixWorld(true);
                strahl.set(von.set(x, 400, z), ab);
                // die oberste TRAGENDE Fläche (|n_y| ≥ 0,3, wie die Karte: eine Wand trägt nichts)
                const alle = strahl.intersectObject(e.mesh, false);
                const h = alle.find((t) => t.face && Math.abs(t.face.normal.y) >= 0.3);
                if (h && (best === null || h.point.y > best)) best = h.point.y;
                if (alle.length && alle[0].point.y > obenY) {
                    obenY = alle[0].point.y;
                    obenSteil = !(alle[0].face && Math.abs(alle[0].face.normal.y) >= 0.3);
                }
            }
            return best;
        };
        const cx0 = Math.floor(mitte.x / span);
        const cz0 = Math.floor(mitte.z / span);
        // DER LESER QUER DURCH DEN STREIFEN: je Rand-Streifen der Chunks um den Start (x- und z-Rand, alle 8 m) Punkte im Abstand
        // 0,1 m über die ganze Breite (0,05–0,85 m) — der Stand-Leser mit einem Träger 0,5 m über dem gezeichneten Boden (eine
        // Pfote hangab ihres Leibs) trifft den gezeichneten Boden; wer auf den Träger fällt, verfehlt ihn um 0,5 m (die Wache
        // 0,25 m trennt das von der Auflösung der Karte). Nicht gezählt: Punkte unter einem Überhang und Raster-Zellen über
        // einer Kante (eine Ecke unter steiler Fläche oder > 0,6 m Höhen-Spanne der fünf Säulen auf 0,45 m, steiler als 53°: dort
        // mittelt jede Karte Schichten und Knicke — eine Frage ihrer Auflösung, nicht des Rand-Streifens)
        const hR = r._voxelChunkConfig(0).step / A.BODEN_KARTE_TEILUNG;
        const verwickelt = (x, z, g) => {
            const x0 = Math.floor(x / hR) * hR;
            const z0 = Math.floor(z / hR) * hR;
            let lo = g;
            let hi = g;
            for (const [px, pz] of [
                [x0, z0],
                [x0 + hR, z0],
                [x0, z0 + hR],
                [x0 + hR, z0 + hR],
            ]) {
                const y = gezeichnet(px, pz);
                if (y === null || obenSteil) return true;
                lo = Math.min(lo, y);
                hi = Math.max(hi, y);
            }
            return hi - lo > 0.6;
        };
        const leser = { n: 0, fehl: 0, ueberhang: 0, kante: 0, max: 0, wo: null };
        for (let q = -1; q <= 2; q++)
            for (let dl = -40; dl <= 40; dl += 8)
                for (let f = 0.05; f < 0.9; f += 0.1)
                    for (const [x, z] of [
                        [(cx0 + q) * span + f, mitte.z + dl],
                        [mitte.x + dl, (cz0 + q) * span + f],
                    ]) {
                        const g = gezeichnet(x, z);
                        if (g === null || r._koerperWasser(x, z, g) > g) continue;
                        if (obenSteil) {
                            leser.ueberhang++;
                            continue;
                        }
                        const d = Math.abs(r._standSicht(x, z, g + 0.5, false) - g);
                        if (!(d <= 0.25) && verwickelt(x, z, g)) {
                            leser.kante++;
                            continue;
                        }
                        leser.n++;
                        if (!(d <= 0.25)) leser.fehl++;
                        if (d > leser.max) {
                            leser.max = d;
                            leser.wo = [Math.round(x * 100) / 100, Math.round(z * 100) / 100];
                            // die Stufen der vier Chunks, deren Karten der Leser dort fragt (Eigner und untere Nachbarn)
                            leser.stufen = [
                                [0, 0],
                                [-1, 0],
                                [0, -1],
                                [-1, -1],
                            ].map(([a, b]) => {
                                const e = s.voxelChunks.get(`${Math.floor(x / span) + a},${Math.floor(z / span) + b}`);
                                return e ? `L${e.lod || 0}${e.surfMap ? "" : " ohne Karte"}` : "fehlt";
                            });
                        }
                    }
        o.k6leser = {
            n: leser.n,
            fehl: leser.fehl,
            ueberhang: leser.ueberhang,
            kante: leser.kante,
            maxCm: Math.round(leser.max * 1000) / 10,
            wo: leser.wo,
            stufen: leser.stufen || null,
            mitte: [Math.round(mitte.x), Math.round(mitte.z)],
        };
        let rand = null;
        for (let ax = cx0 - 1; ax <= cx0 + 2; ax++) {
            const x = ax * span + 0.45;
            for (let dz = -60; dz <= 60; dz += 1) {
                const z = mitte.z + dz;
                if (karte(x, z) !== null) continue; // die Karte des Eigners trägt hier: kein Rand-Loch
                const g = gezeichnet(x, z);
                const gv = gezeichnet(x, z + 0.7);
                const gh = gezeichnet(x, z - 0.7);
                if (g === null || gv === null || gh === null) continue;
                if (r._koerperWasser(x, z, g) > g) continue;
                // das Hang-Band von K4 (12–30°): steiler misst die Auflösung der Karte und die Reichweite der Beine
                const neig = Math.atan(Math.abs(gv - gh) / 1.4) * (180 / Math.PI);
                if (neig < 12 || neig > 30) continue;
                const hangauf = gv >= gh ? 1 : -1;
                const fehler = Math.abs(r.getTerrainHeightAt(x, z) - (hangauf > 0 ? gh : gv));
                if (fehler < 0.1 || fehler > 0.6) continue;
                if (!rand || fehler > rand.fehler) rand = { x, z, fehler, hangauf, boden: g, neig };
            }
        }
        o.rand = rand
            ? {
                  x: rand.x,
                  z: rand.z,
                  fehlerCm: Math.round(rand.fehler * 1000) / 10,
                  neigGrad: Math.round(rand.neig * 10) / 10,
                  meshe,
              }
            : { meshe };
        if (rand) {
            const saveMax = s.maxCreatures;
            s.maxCreatures = Math.max(saveMax || 0, s.creatures.length + 3);
            pm.position.set(rand.x + 6, r._voxelSurfaceY(rand.x + 6, rand.z + 6) + 1.7, rand.z + 6);
            const c = r.spawnCreatureAt(rand.x, rand.boden + 0.3, rand.z, "happy", "wolf", {
                precise: true,
                bodySize: 1,
            });
            s.maxCreatures = saveMax;
            const tb = c && c.userData._tierBaum;
            const Tt = tb && tb.teile;
            const pf = Tt ? [Tt.flP, Tt.frP, Tt.hlP, Tt.hrP] : [];
            if (c && pf.length === 4 && pf.every(Boolean)) {
                c.userData.task = { name: "wait", args: {}, since: 0 };
                const gier = rand.hangauf > 0 ? 0 : Math.PI;
                c.rotation.y = gier; // die Gier VOR dem ersten Takt: die Pfoten setzen unter dem Leib in seiner Richtung
                const halte = (n) => {
                    for (let k = 0; k < n; k++) {
                        r.updateCreatures(0.02);
                        c.userData._hopV = 0;
                        c.userData._hopH = 0;
                        c.position.x = rand.x;
                        c.position.z = rand.z;
                        c.rotation.y = gier;
                    }
                };
                halte(80);
                // die Sohlen: der Boden-Punkt unter der Handwurzel in der Ruhe-Pose, im Pfoten-Raum (die Methode von K4)
                const rx = c.rotation.x;
                const rz = c.rotation.z;
                c.rotation.x = 0;
                c.rotation.z = 0;
                r._tierBaumNeutralStance(c);
                c.updateMatrixWorld(true);
                const y0 = c.position.y;
                const lokal = pf.map((q) => {
                    const w = new T.Vector3().setFromMatrixPosition(q.matrixWorld);
                    w.y = y0;
                    return q.worldToLocal(w.clone());
                });
                c.rotation.x = rx;
                c.rotation.z = rz;
                const jePfote = pf.map(() => []);
                const leib = [];
                // die Zerlegung je Pfote (der Täter beim Namen): Ziel des Gangs gegen den Boden (der Leser) und die Sohle
                // gegen ihr Ziel (die Reichweite)
                const zielFehler = pf.map(() => []);
                const karteFehler = pf.map(() => []);
                const zielOrt = [];
                for (let k = 0; k < 30; k++) {
                    halte(1);
                    c.updateMatrixWorld(true);
                    const gL = gezeichnet(c.position.x, c.position.z);
                    if (gL !== null) leib.push(Math.abs(c.position.y - gL));
                    const Zg = tb._gang && tb._gang.ziele;
                    for (let i = 0; i < 4; i++) {
                        const w = pf[i].localToWorld(lokal[i].clone());
                        const g = gezeichnet(w.x, w.z);
                        if (g !== null) jePfote[i].push(Math.abs(w.y - g));
                        const gZ = Zg ? gezeichnet(Zg[i][0], Zg[i][2]) : null;
                        if (gZ !== null) zielFehler[i].push(Zg[i][1] - gZ);
                        const kZ = typeof r._bodenSichtAt === "function" ? r._bodenSichtAt(Zg[i][0], Zg[i][2]) : null;
                        if (gZ !== null && Number.isFinite(kZ)) karteFehler[i].push(kZ - gZ);
                        if (k === 29)
                            zielOrt[i] = [
                                Math.round(Zg[i][0] * 100) / 100,
                                Math.round(Zg[i][2] * 100) / 100,
                                Math.round(Zg[i][1] * 100) / 100,
                            ];
                    }
                }
                const med = (a) => (a.length ? a.slice().sort((p, q) => p - q)[a.length >> 1] : null);
                const meds = jePfote.map(med);
                const schlecht = meds.every((m) => m !== null) ? Math.max(...meds) : null;
                leib.sort((p, q) => p - q);
                o.k6 = {
                    sohlen: jePfote.reduce((n, a) => n + a.length, 0),
                    jePfoteCm: meds.map((m) => (m === null ? null : Math.round(m * 1000) / 10)),
                    schlechtCm: schlecht === null ? null : Math.round(schlecht * 1000) / 10,
                    leibMedianCm: leib.length ? Math.round(leib[leib.length >> 1] * 1000) / 10 : null,
                    karteCm: karteFehler.map((a) => (a.length ? Math.round(med(a) * 1000) / 10 : null)),
                    zielOrt,
                    leibY: Math.round(c.position.y * 100) / 100,
                    traegerY: Math.round((c.userData._traegerY || 0) * 100) / 100,
                    zielCm: zielFehler.map((a) => (a.length ? Math.round(med(a) * 1000) / 10 : null)),
                    neigGrad:
                        Math.round(
                            (Math.atan(
                                Math.abs(gezeichnet(rand.x, rand.z + 0.7) - gezeichnet(rand.x, rand.z - 0.7)) / 1.4
                            ) *
                                1800) /
                                Math.PI
                        ) / 10,
                    gierZiel: gier,
                    gier: Math.round(c.rotation.y * 100) / 100,
                };
            } else o.k6 = { fehler: "kein Wolf mit Pfoten-Gestalt" };
            if (c && c.parent) r.removeCreature(c);
        }
    }
    pm.position.set(start.x, start.y, start.z);
    kapsel(30);
    s.playerVel = savedVel;
    // ── K7 WIESE UND STREU AM CHUNK-RAND (K21): Nah-Wiese und Nah-Streu lesen Fuß, Hang und Grün über den EINEN Leser
    // (`_bodenSichtAt`) — vorher nur die Karte des Eigners, im Rand-Streifen fiel kaum ein Büschel (ein Gitter kahler Linien in
    // der Wiese, Dichte 0,11 gegen 1,31 je m²). An der Mess-Wiese (der Messort des Haushalts, dicht) die Kacheln im Umkreis 120 m, deren Chunks
    // einer Stufe sind (der Nah-Ring liegt ganz in LOD 0, die Stufen-Kette K51 trägt L1 und L2 in den Umkreis; der Streifen ist
    // ein halber Schritt der Stufe): Büschel bzw. Pflanzen je m² im Streifen gegen die Chunk-Mitte daneben (0,9–2,7 m in L0:
    // dieselben Nähte, dieselben Felder — die ganze Mitte läge auf anderen Wiesen). Läuft im Lauf ohne Defekt und im Defekt
    // „wiese"; zuletzt, denn der Spieler zieht dafür um. ──
    if (mitWiese) {
        const [X, Z] = window.__messWiese;
        const setz = () => {
            pm.position.set(X, r.getTerrainHeightAt(X, Z) + 2, Z);
            s._fixedSimPos = null;
        };
        let last = -1;
        let stabil = 0;
        for (let t = 0; t < 200 && stabil < 8; t++) {
            setz();
            for (let i = 0; i < 30; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (i % 10 === 0) await new Promise((res) => setTimeout(res, 0));
            }
            const n = [...s.voxelChunks.values()].filter((e) => e && e.surfMap).length;
            if (n === last) stabil++;
            else {
                stabil = 0;
                last = n;
            }
        }
        const C = r._voxelChunkConfig(0);
        // der Rand-Streifen in der Breite der Stufe (ein halber Schritt, K51: die Nah-Zone ist 3 × 3 — die Kacheln jeder Stufe
        // zählen, der Leser liest jede Naht)
        const fach = (x, z, stufe) => {
            const halb = r._voxelChunkConfig(stufe).step / 2;
            const lx = x - Math.floor(x / C.span) * C.span;
            const lz = z - Math.floor(z / C.span) * C.span;
            if (lx < halb || lz < halb) return 0; // der Rand-Streifen
            if (lx < 3 * halb || lz < 3 * halb) return 1; // die Mitte daneben
            return 2;
        };
        // jeder Chunk der Kachel und seine unteren Nachbarn gebaut und in EINER Stufe (die Linse rechnet das selbst, nie über den
        // Leser): die Stufe, sonst -1
        const eineStufe = (x0, z0, x1, z1) => {
            let stufe = -1;
            for (let cz = Math.floor(z0 / C.span) - 1; cz <= Math.floor(z1 / C.span); cz++)
                for (let cx = Math.floor(x0 / C.span) - 1; cx <= Math.floor(x1 / C.span); cx++) {
                    const e = s.voxelChunks.get(`${cx},${cz}`);
                    if (!e) return -1;
                    if (stufe < 0) stufe = e.lod || 0;
                    else if ((e.lod || 0) !== stufe) return -1;
                }
            return stufe;
        };
        let R = 120;
        const zaehle = (K, rand, bau) => {
            const zahl = [0, 0, 0];
            const flaeche = [0, 0, 0];
            let kacheln = 0;
            for (let tz = Math.floor((Z - R) / K); tz <= Math.floor((Z + R) / K); tz++)
                for (let tx = Math.floor((X - R) / K); tx <= Math.floor((X + R) / K); tx++) {
                    const stufe = eineStufe(tx * K - rand, tz * K - rand, (tx + 1) * K + rand, (tz + 1) * K + rand);
                    if (stufe < 0) continue;
                    const liste = bau(tx, tz);
                    if (!liste) continue;
                    kacheln++;
                    for (let a = 0.05; a < K; a += 0.1)
                        for (let b = 0.05; b < K; b += 0.1) flaeche[fach(tx * K + a, tz * K + b, stufe)] += 0.01;
                    for (const q of liste) zahl[fach(q.x, q.z, stufe)]++;
                }
            const d = zahl.map((n, i) => (flaeche[i] > 0 ? n / flaeche[i] : 0));
            const verh = d[1] > 0 ? d[0] / d[1] : 0;
            // die Unschärfe des Verhältnisses unter gleicher Dichte (Poisson: die im Streifen erwartete Zahl und die daneben)
            const erwartet = d[1] * flaeche[0];
            const sigma = erwartet > 0 && zahl[1] > 0 ? Math.sqrt(1 / erwartet + 1 / zahl[1]) : 1;
            return {
                kacheln,
                streifen: zahl[0],
                daneben: zahl[1],
                mitte: zahl[2],
                dichte: d.map((v) => Math.round(v * 1000) / 1000),
                verh: Math.round(verh * 1000) / 1000,
                sigma: Math.round(sigma * 1000) / 1000,
            };
        };
        const NW = A.NAH_WIESE;
        const NS = A.NAH_STREU;
        const arten = r._nahStreuArten();
        // der Umkreis wächst in 20-m-Schritten (höchstens 240 m), bis die Probe ihren Umfang trägt (K55-2: an der Mess-Wiese
        // −278/−1038 trug der Umkreis 120 m 866 Büschel und 70 Pflanzen neben dem Streifen, die Aue ist offener als der alte Hang)
        for (R = 120; R <= 240; R += 20) {
            o.k7wiese = zaehle(NW.kachel, 0.34, (tx, tz) => r._nahWieseKachelBueschel(tx, tz));
            o.k7streu = zaehle(NS.kachel, 0, (tx, tz) => {
                const satz = r._nahStreuKachel(tx, tz, arten);
                return satz ? satz.items : null;
            });
            if (o.k7wiese.daneben >= umfang.bueschel && o.k7streu.daneben >= umfang.pflanzen) break;
        }
        o.k7umkreis = Math.min(R, 240);
    }
    return o;
}

function urteil(o) {
    const f = [];
    if (o.fehler) return [o.fehler];
    if (!o.k1.struktur) f.push(`K1 Aufbau: der Spieler steht nicht auf einem Bauwerk (Träger ${o.k1.traeger})`);
    if (!(Math.abs(o.k1.beckenCm) <= 1))
        f.push(`K1 Becken auf dem Träger: ${o.k1.beckenCm} cm (die Fuß-IK zieht den Körper ins Bauwerk)`);
    if (!o.k1.sprungLuft) f.push("K1 Aufbau: der Sprung hebt die Kapsel nicht in die Luft");
    else if (!(Math.abs(o.k1.sprungBeckenCm) <= 1))
        f.push(`K1 Becken im Sprung: ${o.k1.sprungBeckenCm} cm (die IK erdet in der Luft)`);
    if (!o.hoehle) f.push("K2 Aufbau: keine Höhle im Raster");
    else {
        // ein fehlender Wert ist nie 0 (`null <= 10` ist wahr): keine Probe heißt rot
        if (!o.k2 || o.k2.abstandCm == null || !(o.k2.abstandCm <= 10))
            f.push(
                `K2 Fuß-Probe in der Höhle: ${o.k2 ? o.k2.abstandCm : "?"} cm vom Höhlen-Boden (die Probe liest die Oberkante)`
            );
        if (!o.k3 || o.k3.abstandM == null || !(o.k3.abstandM <= 0.15))
            f.push(`K3 Tier in der Höhle: ${o.k3 ? o.k3.abstandM : "?"} m über dem Höhlen-Boden`);
    }
    if (!o.hang) f.push("K4 Aufbau: keine Hang-Stelle im Raster");
    else {
        if (!o.k4 || !(o.k4.sohlen >= 40) || !(o.k4.medianCm <= 6))
            f.push(
                `K4 Sohlen gegen die Karte: Median ${o.k4 ? o.k4.medianCm : "?"} cm, p90 ${o.k4 ? o.k4.p90Cm : "?"} cm (die Sicht steht auf dem Gesetz)`
            );
        if (!o.k4 || !(o.k4.leibMedianCm <= 6))
            f.push(
                `K4 Leib gegen die Karte: Median ${o.k4 ? o.k4.leibMedianCm : "?"} cm (der Leib steht auf dem Gesetz)`
            );
        if (!o.k4b || !(o.k4b.treppeCm <= 8))
            f.push(
                `K4 Treppe: ${o.k4b ? o.k4b.treppeCm : "?"} cm Sprung je Takt über die Neigung hinaus (Träger: ${o.k4b ? o.k4b.traeger : "?"})`
            );
        if (!o.k4c || !(o.k4c.fugen >= 20))
            f.push(`K4 Aufbau: ${o.k4c ? o.k4c.fugen : "?"} Fugen im Umkreis (Soll ≥ 20)`);
        else if (o.k4c.traegt > 0)
            f.push(
                `K4 Fuge: ${o.k4c.traegt} von ${o.k4c.fugen} Fugen tragen einen Leib — Täter ${o.k4c.taeter.join("; ")} (die Auflage _resolveCapsuleVsAABB/_kreaturAuflage liest box.gedeckt nicht)`
            );
        if (!o.eben) f.push("K5 Aufbau: keine ebene Stelle im Raster");
        else if (!o.k5 || !(Math.abs(o.k5.gegenStandCm) <= 3) || !(o.k5.wegMinCm >= -5))
            f.push(
                `K5 Tod-Lage: die tiefste Stelle liegt ${o.k5 ? o.k5.gegenStandCm : "?"} cm über ihrem Stand-Kontakt, auf dem Weg ${o.k5 ? o.k5.wegMinCm + " … " + o.k5.wegMaxCm : "?"} cm (Soll ± 3, Weg ≥ −5)`
            );
    }
    if (!o.k6leser || !(o.k6leser.n >= 300) || o.k6leser.fehl > 0)
        f.push(
            `K6 Leser im Rand-Streifen: ${o.k6leser ? o.k6leser.fehl : "?"} von ${o.k6leser ? o.k6leser.n : "?"} Punkten verfehlen den gezeichneten Boden um mehr als 25 cm (max ${o.k6leser ? o.k6leser.maxCm : "?"} cm bei ${o.k6leser && o.k6leser.wo ? o.k6leser.wo.join("/") : "?"}, Karten dort ${o.k6leser && o.k6leser.stufen ? o.k6leser.stufen.join(" · ") : "?"}, Mitte ${o.k6leser && o.k6leser.mitte ? o.k6leser.mitte.join("/") : "?"}) — Täter _standSicht/_bodenSichtAt: dort trägt der Träger`
        );
    if (!o.rand || !(o.rand.meshe > 0)) f.push("K6 Aufbau: kein gezeichnetes Chunk-Mesh für den Strahl");
    else if (!Number.isFinite(o.rand.fehlerCm)) f.push("K6 Aufbau: keine Hang-Stelle im Rand-Streifen");
    else {
        if (!o.k6 || !(o.k6.sohlen >= 100) || !(o.k6.schlechtCm <= 6))
            f.push(
                `K6 Sohlen am Chunk-Rand: schlechteste Pfote ${o.k6 ? o.k6.schlechtCm : "?"} cm über/unter dem gezeichneten Boden (Soll ≤ 6; je Pfote ${o.k6 && o.k6.jePfoteCm ? o.k6.jePfoteCm.join("/") : "?"}) — Täter _standSicht: im Rand-Streifen liest er den Träger, nie die Karte des Nachbarn`
            );
        if (!o.k6 || !(o.k6.leibMedianCm <= 6))
            f.push(
                `K6 Leib am Chunk-Rand: Median ${o.k6 ? o.k6.leibMedianCm : "?"} cm gegen den gezeichneten Boden (Soll ≤ 6)`
            );
    }
    // K7 dort, wo gemessen (der Lauf ohne Defekt und der Defekt „wiese“): die Wiese auf ±10 % (≥ 1 000 Büschel daneben: die
    // Unschärfe ≈ 3 %), die dünne Streu (≈ 0,1 je m²) im Band ±10 % oder drei Unschärfen, was weiter ist
    const k7 = (w, name, n, toleranz) => {
        if (!w) return;
        if (!(w.daneben >= n)) f.push(`K7 Aufbau: ${w.daneben} ${name} neben dem Rand-Streifen (Soll ≥ ${n})`);
        else if (!(Math.abs(w.verh - 1) <= toleranz(w)))
            f.push(
                `K7 ${name === "Büschel" ? "Wiese" : "Streu"} im Rand-Streifen: Dichte ${w.dichte[0]} gegen ${w.dichte[1]} je m² daneben (Verhältnis ${w.verh} ± ${w.sigma}, Soll 1 ± ${Math.round(toleranz(w) * 100)} %; ${w.streifen}/${w.daneben} in ${w.kacheln} Kacheln) — Täter: der Leser der Kachel (_nahWieseKachelBueschel/_nahStreuKachel) liest nicht _bodenSichtAt`
            );
    };
    k7(o.k7wiese, "Büschel", K7_UMFANG.bueschel, () => 0.1);
    k7(o.k7streu, "Pflanzen", K7_UMFANG.pflanzen, (w) => Math.max(0.1, 3 * w.sigma));
    return f;
}

function zeile(o) {
    if (o.fehler) return o.fehler;
    const v = (x) => (x === null || x === undefined ? "?" : x);
    return (
        `K1 Becken ${v(o.k1.beckenCm)} cm · Sprung ${v(o.k1.sprungBeckenCm)} cm` +
        ` · K2 Höhlen-Probe ${o.k2 ? v(o.k2.abstandCm) : "?"} cm · K3 Tier ${o.k3 ? v(o.k3.abstandM) : "?"} m` +
        ` · K4 Leib−Karte Median ${o.k4 ? v(o.k4.leibMedianCm) : "?"} cm · Sohle−Karte Median ${o.k4 ? v(o.k4.medianCm) : "?"} cm (p90 ${o.k4 ? v(o.k4.p90Cm) : "?"}) · Treppe ${o.k4b ? v(o.k4b.treppeCm) : "?"} cm` +
        ` · K4 Fuge ${o.k4c ? v(o.k4c.traegt) + "/" + v(o.k4c.fugen) + " tragen" : "?"}` +
        ` · K5 Tod ${o.k5 ? v(o.k5.gegenStandCm) : "?"} cm gegen den Stand (Weg ${o.k5 ? v(o.k5.wegMinCm) + "…" + v(o.k5.wegMaxCm) : "?"})` +
        ` · K6 Leser ${o.k6leser ? v(o.k6leser.fehl) + "/" + v(o.k6leser.n) + " (max " + v(o.k6leser.maxCm) + " cm)" : "?"}` +
        ` · K6 Rand schlechteste Pfote ${o.k6 ? v(o.k6.schlechtCm) : "?"} cm (je Pfote ${o.k6 && o.k6.jePfoteCm ? o.k6.jePfoteCm.join("/") : "?"}) · Leib ${o.k6 ? v(o.k6.leibMedianCm) : "?"} cm` +
        (o.rand && Number.isFinite(o.rand.fehlerCm)
            ? ` · Rand-Stelle ${o.rand.x.toFixed(2)}/${o.rand.z} Träger-Fehler ${o.rand.fehlerCm} cm`
            : "") +
        (o.k7wiese
            ? ` · K7 Umkreis ${v(o.k7umkreis)} m · Wiese Streifen/daneben ${v(o.k7wiese.verh)} ± ${v(o.k7wiese.sigma)} (${v(o.k7wiese.streifen)}/${v(o.k7wiese.daneben)} Büschel, ${v(o.k7wiese.dichte[0])}/${v(o.k7wiese.dichte[1])}/${v(o.k7wiese.dichte[2])} je m² Streifen/daneben/Mitte)`
            : "") +
        (o.k7streu
            ? ` · K7 Streu ${v(o.k7streu.verh)} ± ${v(o.k7streu.sigma)} (${v(o.k7streu.streifen)}/${v(o.k7streu.daneben)} Pflanzen)`
            : "") +
        (o.hang ? ` · Hang ${o.hang.neig.toFixed(0)}° Gesetz↔Karte ${(o.hang.abstand * 100).toFixed(0)} cm` : "") +
        (o.hoehle ? ` · Höhle ${(o.hoehle.top - o.hoehle.boden).toFixed(1)} m tief` : "")
    );
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 900000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    let rot = 0;
    try {
        const lauf = async (inj) => {
            patch = inj && BASIS[inj] ? BASIS[inj] : null;
            patchFehler = [];
            gepatcht = { patch: null, text: null }; // je Lauf neu gepatcht (die Fehl-Zeilen zählen je Lauf)
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
            await page.evaluateOnNewDocument(WELT_ORTE_INSTALL); // der Messort aus spec/profiband/haushalt.json (`__messWiese`)
            await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 180000 });
            await page.waitForFunction(
                () => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function",
                {
                    timeout: 180000,
                }
            );
            // die Welt einschwingen (plateau-basiert, das Muster von gate:koerper-bewegung)
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
            const o = await page.evaluate(proben, inj == null || inj === "wiese", K7_UMFANG);
            await kontext.close();
            patch = null;
            return { o, errs, pf: patchFehler.slice() };
        };
        if (SELBST) {
            const soll = {
                traeger: ["K1 Becken auf dem Träger", "K2 Fuß-Probe"],
                luft: ["K1 Becken im Sprung"],
                hoehle: ["K3 Tier in der Höhle"],
                sicht: ["K4 Leib gegen die Karte", "K4 Treppe"],
                tod: ["K5 Tod-Lage"],
                fuge: ["K4 Fuge"],
                rand: ["K6 Leser im Rand-Streifen", "K6 Sohlen am Chunk-Rand"],
                wiese: ["K7 Wiese im Rand-Streifen", "K7 Streu im Rand-Streifen"],
            };
            for (const inj of Object.keys(soll)) {
                const { o, pf } = await lauf(inj);
                const f = urteil(o);
                const fehlt = soll[inj].filter((x) => !f.some((y) => y.startsWith(x)));
                const ok = pf.length === 0 && fehlt.length === 0;
                const beleg = soll[inj].map((x) => f.find((y) => y.startsWith(x)) || `${x}: grün (blind!)`).join(" | ");
                console.log(
                    `  ${ok ? "✅" : "❌"} Selbsttest „${inj}" macht ${soll[inj].join(" + ")} rot — ${pf.length ? pf.join("; ") : beleg}`
                );
                if (!ok) rot++;
            }
        }
        const { o, errs } = await lauf(null);
        console.log("  " + zeile(o));
        const f = urteil(o);
        for (const x of f) console.log("  ❌ " + x);
        if (errs.length) console.log("  ❌ Seiten-Fehler: " + errs[0]);
        rot += f.length + (errs.length ? 1 : 0);
        if (process.env.KOERPER_STAND_JSON)
            fs.writeFileSync(process.env.KOERPER_STAND_JSON, JSON.stringify(o, null, 1));
    } finally {
        await browser.close();
        server.close();
    }
    console.log(rot ? `❌ gate:koerper-stand ROT (${rot})` : "✅ gate:koerper-stand grün");
    process.exit(rot ? 1 : 0);
})().catch((e) => {
    console.error(e);
    process.exit(2);
});
