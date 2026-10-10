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
//       eines Wegs über den Hang springt die Lage je Takt nie mehr als 8 cm über die Neigung hinaus (die Cache-Treppe)
//   K5  TOD-LAGE: die PRÄZISE tiefste Stelle (jeder Vertex der Haut gegen die Karte unter ihm) liegt nach dem Kippen, wo
//       sie im Stand lag (± 3 cm), und sinkt auf dem Weg nie mehr als 5 cm darunter
//   --selftest: je Defekt serviert der Server die Basis-Zeile von anazhRealm.js (cf9a07ba) — GENAU die Probe dieses
//   Defekts muss rot werden; fehlt die geheilte Zeile, ist der Selbsttest rot.
//   node scripts/diag-koerper-stand.cjs [--selftest]
"use strict";
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

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
    traeger: [["return this._standSicht(x, z, s._kapselTraegerY, s._kapselStruktur);", "return this.getTerrainHeightAt(x, z);"]],
    luft: [
        ["return this._standSicht(x, z, s._kapselTraegerY, s._kapselStruktur);", "return this.getTerrainHeightAt(x, z);"],
        ["ik: this.state.isInAir !== true,", "ik: true,"],
    ],
    hoehle: [["const g = this._fieldSurfaceBelow(x, y0, z, this._fieldSolid(x, y0, z) ? 2 : 40);", "const g = null;"]],
    sicht: [
        [
            "const v = this._standSicht(px, pz, Number.isFinite(P[k].g) ? P[k].g : centerG, false);",
            "const v = Number.isFinite(P[k].g) ? P[k].g : centerG;",
        ],
        ["baseY = this._standSicht(creature.position.x, creature.position.z, terrainHeight, false);", "baseY = terrainHeight;"],
    ],
    tod: [["creature.position.y = dying.baseY + hebe[k0] + (hebe[k0 + 1] - hebe[k0]) * (f - k0);", "void 0;"]],
};
let patch = null;
let patchFehler = [];

const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(ROOT, p);
    if (!fp.startsWith(ROOT)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        if (patch && p === "/anazhRealm.js") {
            let txt = data.toString("utf8");
            for (const [geheilt, basis] of patch) {
                if (!txt.includes(geheilt)) patchFehler.push(`geheilte Zeile fehlt („${geheilt.slice(0, 70)}…")`);
                else txt = txt.replace(geheilt, basis);
            }
            data = Buffer.from(txt, "utf8");
        }
        res.setHeader("Content-Type", MIME[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

// Die Proben laufen IN der Seite (r = die Welt). Kein Stub: jede Probe ruft die Chokepoints des Spiels.
async function proben() {
    const r = window.anazhRealm;
    const s = r.state;
    const T = window.THREE;
    const A = r.constructor;
    const o = {};
    const pm = s.playerMesh;
    const p = s.player;
    const rig = pm && pm.userData && pm.userData.rig;
    if (!rig || !rig.hips) return { fehler: "Spieler-Rig fehlt" };
    // die Boden-Karte selbst (das gezeichnete Mesh des Chunks, bilinear) — die Linse misst gegen sie, nie durch den Schnitt
    const span = r._voxelChunkConfig(0).span;
    const karte = (x, z) => {
        const cx = Math.floor(x / span);
        const cz = Math.floor(z / span);
        const e = s.voxelChunks ? s.voxelChunks.get(`${cx},${cz}`) : null;
        const v = e && e.surfMap ? r._chunkSurfaceAt(e, cx, cz, x, z) : null;
        return Number.isFinite(v) ? v : null;
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
    // ── K2 MENSCH IN DER HÖHLE ── (die erste Luft-Tasche ≥ 2,4 m unter der Oberfläche, Raster 8 m um den Spieler)
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
                        if (Number.isFinite(boden) && top - boden > 6) hoehle = { x, z, top, boden };
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
        o.k2.abstandCm = Number.isFinite(o.k2.probe) ? Math.round(Math.abs(o.k2.probe - o.k2.kapselFussY) * 1000) / 10 : null;
        // ── K3 TIER IN DER HÖHLE ──
        const saveMax = s.maxCreatures;
        s.maxCreatures = Math.max(saveMax || 0, s.creatures.length + 3);
        const w = r.spawnCreatureAt(hoehle.x + 1.5, hoehle.boden + 0.3, hoehle.z, "happy", "wolf", { precise: true, bodySize: 1 });
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
    // Karte im Band der Leben-Prüfung (15–60 cm); dazu eine ebene Stelle (≤ 3°) für die Tod-Lage ──
    let hang = null;
    let eben = null;
    for (let dx = -60; dx <= 60; dx += 2)
        for (let dz = -60; dz <= 60; dz += 2) {
            const x = start.x + dx;
            const z = start.z + dz;
            const k = karte(x, z);
            if (k === null) continue;
            const g = r._voxelSurfaceY(x, z);
            if (!Number.isFinite(g)) continue;
            const kx = karte(x + 1, z);
            const kz = karte(x, z + 1);
            if (kx === null || kz === null) continue;
            if ([karte(x + 2, z + 2), karte(x - 2, z + 2), karte(x + 2, z - 2), karte(x - 2, z - 2)].includes(null)) continue;
            const neig = Math.atan(Math.hypot(kx - k, kz - k)) * (180 / Math.PI);
            const ab = Math.abs(g - k);
            if (neig <= 3 && ab < 0.1 && (!eben || neig < eben.neig)) eben = { x, z, karte: k, gesetz: g, neig };
            if (neig < 12 || neig > 30 || ab < 0.15 || ab > 0.6) continue;
            if (!hang || ab > hang.abstand) hang = { x, z, abstand: ab, gesetz: g, karte: k, neig };
        }
    o.hang = hang;
    o.eben = eben;
    if (hang) {
        const saveMax = s.maxCreatures;
        s.maxCreatures = Math.max(saveMax || 0, s.creatures.length + 3);
        pm.position.set(hang.x + 6, start.y, hang.z + 6); // nah genug für die Voll-Gestalt und die Hang-Proben
        const c = r.spawnCreatureAt(hang.x, hang.gesetz + 0.3, hang.z, "happy", "wesen", { precise: true, bodySize: 1 });
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
            let maxUeber = 0;
            tiere(140, (k) => {
                const sx = hang.x + ux * (-8 + k * 0.12);
                const sz = hang.z + uz * (-8 + k * 0.12);
                const yJetzt = c.position.y;
                if (yAlt !== null && k > 4) {
                    const erwartet = Math.abs(Math.tan((hang.neig * Math.PI) / 180) * 0.12);
                    maxUeber = Math.max(maxUeber, Math.abs(yJetzt - yAlt) - erwartet);
                }
                yAlt = yJetzt;
                c.position.x = sx;
                c.position.z = sz;
            });
            o.k4b = { treppeCm: Math.round(maxUeber * 1000) / 10 };
            // ── K5 TOD-LAGE ── (auf der ebenen Stelle: das Tier stirbt, kippt, liegt — die tiefste Stelle gegen den Boden)
            const ort = eben || hang;
            pm.position.set(ort.x + 6, start.y, ort.z + 6);
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
    pm.position.set(start.x, start.y, start.z);
    kapsel(30);
    s.playerVel = savedVel;
    return o;
}

function urteil(o) {
    const f = [];
    if (o.fehler) return [o.fehler];
    if (!o.k1.struktur) f.push(`K1 Aufbau: der Spieler steht nicht auf einem Bauwerk (Träger ${o.k1.traeger})`);
    if (!(Math.abs(o.k1.beckenCm) <= 1)) f.push(`K1 Becken auf dem Träger: ${o.k1.beckenCm} cm (die Fuß-IK zieht den Körper ins Bauwerk)`);
    if (!o.k1.sprungLuft) f.push("K1 Aufbau: der Sprung hebt die Kapsel nicht in die Luft");
    else if (!(Math.abs(o.k1.sprungBeckenCm) <= 1)) f.push(`K1 Becken im Sprung: ${o.k1.sprungBeckenCm} cm (die IK erdet in der Luft)`);
    if (!o.hoehle) f.push("K2 Aufbau: keine Höhle im Raster");
    else {
        if (!o.k2 || !(o.k2.abstandCm <= 10)) f.push(`K2 Fuß-Probe in der Höhle: ${o.k2 ? o.k2.abstandCm : "?"} cm vom Höhlen-Boden (die Probe liest die Oberkante)`);
        if (!o.k3 || !(o.k3.abstandM <= 0.15)) f.push(`K3 Tier in der Höhle: ${o.k3 ? o.k3.abstandM : "?"} m über dem Höhlen-Boden`);
    }
    if (!o.hang) f.push("K4 Aufbau: keine Hang-Stelle im Raster");
    else {
        if (!o.k4 || !(o.k4.sohlen >= 40) || !(o.k4.medianCm <= 6))
            f.push(`K4 Sohlen gegen die Karte: Median ${o.k4 ? o.k4.medianCm : "?"} cm, p90 ${o.k4 ? o.k4.p90Cm : "?"} cm (die Sicht steht auf dem Gesetz)`);
        if (!o.k4 || !(o.k4.leibMedianCm <= 6))
            f.push(`K4 Leib gegen die Karte: Median ${o.k4 ? o.k4.leibMedianCm : "?"} cm (der Leib steht auf dem Gesetz)`);
        if (!o.k4b || !(o.k4b.treppeCm <= 8)) f.push(`K4 Treppe: ${o.k4b ? o.k4b.treppeCm : "?"} cm Sprung je Takt über die Neigung hinaus`);
        if (!o.eben) f.push("K5 Aufbau: keine ebene Stelle im Raster");
        else if (!o.k5 || !(Math.abs(o.k5.gegenStandCm) <= 3) || !(o.k5.wegMinCm >= -5))
            f.push(
                `K5 Tod-Lage: die tiefste Stelle liegt ${o.k5 ? o.k5.gegenStandCm : "?"} cm über ihrem Stand-Kontakt, auf dem Weg ${o.k5 ? o.k5.wegMinCm + " … " + o.k5.wegMaxCm : "?"} cm (Soll ± 3, Weg ≥ −5)`
            );
    }
    return f;
}

function zeile(o) {
    if (o.fehler) return o.fehler;
    const v = (x) => (x === null || x === undefined ? "?" : x);
    return (
        `K1 Becken ${v(o.k1.beckenCm)} cm · Sprung ${v(o.k1.sprungBeckenCm)} cm` +
        ` · K2 Höhlen-Probe ${o.k2 ? v(o.k2.abstandCm) : "?"} cm · K3 Tier ${o.k3 ? v(o.k3.abstandM) : "?"} m` +
        ` · K4 Leib−Karte Median ${o.k4 ? v(o.k4.leibMedianCm) : "?"} cm · Sohle−Karte Median ${o.k4 ? v(o.k4.medianCm) : "?"} cm (p90 ${o.k4 ? v(o.k4.p90Cm) : "?"}) · Treppe ${o.k4b ? v(o.k4b.treppeCm) : "?"} cm` +
        ` · K5 Tod ${o.k5 ? v(o.k5.gegenStandCm) : "?"} cm gegen den Stand (Weg ${o.k5 ? v(o.k5.wegMinCm) + "…" + v(o.k5.wegMaxCm) : "?"})` +
        (o.hang ? ` · Hang ${o.hang.neig.toFixed(0)}° Gesetz↔Karte ${(o.hang.abstand * 100).toFixed(0)} cm` : "") +
        (o.hoehle ? ` · Höhle ${(o.hoehle.top - o.hoehle.boden).toFixed(1)} m tief` : "")
    );
}

(async () => {
    await new Promise((r) => server.listen(PORT, "127.0.0.1", r));
    const browser = await puppeteer.launch({ headless: "new", protocolTimeout: 900000, args: ["--no-sandbox", "--disable-gpu"] });
    let rot = 0;
    try {
        const lauf = async (inj) => {
            patch = inj && BASIS[inj] ? BASIS[inj] : null;
            patchFehler = [];
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
            const o = await page.evaluate(proben);
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
            };
            for (const inj of Object.keys(soll)) {
                const { o, pf } = await lauf(inj);
                const f = urteil(o);
                const fehlt = soll[inj].filter((x) => !f.some((y) => y.startsWith(x)));
                const ok = pf.length === 0 && fehlt.length === 0;
                const beleg = soll[inj].map((x) => f.find((y) => y.startsWith(x)) || `${x}: grün (blind!)`).join(" | ");
                console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${inj}" macht ${soll[inj].join(" + ")} rot — ${pf.length ? pf.join("; ") : beleg}`);
                if (!ok) rot++;
            }
        }
        const { o, errs } = await lauf(null);
        console.log("  " + zeile(o));
        const f = urteil(o);
        for (const x of f) console.log("  ❌ " + x);
        if (errs.length) console.log("  ❌ Seiten-Fehler: " + errs[0]);
        rot += f.length + (errs.length ? 1 : 0);
        if (process.env.KOERPER_STAND_JSON) fs.writeFileSync(process.env.KOERPER_STAND_JSON, JSON.stringify(o, null, 1));
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
