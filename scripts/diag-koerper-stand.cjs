// diag-koerper-stand.cjs — DER KÖRPER STEHT, WO DAS AUGE IHN SIEHT (gate:koerper-stand, Klasse Q4): die Sim steht auf dem
// Gesetz, die Sicht auf dem, was das Auge sieht.
// Die Linse ruft die ECHTEN Pfade der Welt (headless, Null-Renderer — die Boden-Karte ist das Mesh des Workers):
//   K1  MENSCH AUF DEM TRÄGER: der Spieler auf der Start-Plattform (der Kapsel-Schritt trägt ihn auf dem Bauwerk), Fuß-IK
//       im Stand → das Becken sinkt nicht (≤ 1 cm); im Sprung (Kapsel in der Luft) senkt kein Boden das Becken
//   K2  MENSCH IN DER HÖHLE: der Spieler auf einem Höhlen-Boden (die Kapsel steht dort) → die Fuß-Probe liest diesen
//       Boden (± 10 cm), nie die Oberkante der Säule darüber
//   K3  TIER IN DER HÖHLE: ein Wolf, gerufen auf den Höhlen-Boden → er bleibt dort (± 15 cm)
//   K4  TIER AM HANG: an der Stelle mit dem größten Abstand Gesetz ↔ Karte im Hang (≥ 12°) steht der Leib (seine Lage, der
//       Zeuge der Sicht) auf der Boden-Karte (Median ≤ 6 cm; die Sohlen gegen das Mesh misst K8); entlang
//       eines Wegs über den Hang springt die Lage je Takt nie mehr als 8 cm über die Neigung hinaus (die Cache-Treppe; der
//       Täter heißt mit seiner Box, wenn ein Werk den Sprung trägt) — und (K4c, K24-N1) keine FUGE trägt einen Leib: die
//       Oberkante einer Box, auf der eine Box desselben Werks sitzt (zwei Stamm-Abschnitte), hebt weder die Kapsel noch das
//       Tier.
//   K5  TOD-LAGE: die PRÄZISE tiefste Stelle (jeder Vertex der Haut gegen die Karte unter ihm) liegt nach dem Kippen, wo
//       sie im Stand lag (± 3 cm), und sinkt auf dem Weg nie mehr als 5 cm darunter — auf TROCKENEM ebenem Grund (das Tier
//       steht dort, kein Seegrund)
//   K6  TIER AM CHUNK-RAND: am unteren Rand jedes Chunks (0,9 m je Achse) zeichnet das Mesh des Nachbarn, die Karte
//       des Eigners ist leer oder trägt nur, was darunter liegt — (a) der Stand-Leser quer durch die Rand-Streifen um den
//       Start (Träger 0,5 m über dem Boden) trifft die gezeichneten Dreiecke (Strahl auf das Mesh) auf 25 cm; die Pfote am
//       Mesh misst K8
//   K7  WIESE UND STREU AM CHUNK-RAND: der Boden hat EINEN Leser (`_bodenSichtAt`) — an der Mess-Wiese (die Chunks einer
//       Stufe im Umkreis 120 m) stehen Büschel und Pflanzen im Rand-Streifen so dicht wie in der Chunk-Mitte daneben (L0 0,9–2,7 m):
//       Wiese ±10 %, Streu ±10 % oder drei Unschärfen (Konsum-Leser: `_nahWieseKachelBueschel`, `_nahStreuKachel`)
//   K8  EINE BODEN-HÖHE JE ROLLE (Gelände H5, Lehre 22, Welt mit Foundry): an der Mess-Wiese und am 25°-Hang (der nächste
//       trockene Hang 24–26° um sie) steht jeder Kontakt auf den gezeichneten Dreiecken (`__gezeichnet`), je Rolle 200, p95 ≤ 3 cm:
//       der Fuß (der Vertex, den der Knöchel trägt, mit dem kleinsten Abstand zum Boden, im Fuß-Lock des Gangs — längs der
//       Höhenlinie, die Falllinie hinauf und hinab, zehn Stufen à 0,17 m hinauf und hinab; 0 Steckenbleiber), der Huf (je
//       Größen-Band das Reh im Stand je
//       Bein, das schlechteste; seine Sohle liegt dem Boden an, `_gaitSohlenKipp`), das Rad
//       (der tiefste Vertex je Reifen des GT in Fahrt), der Fuß der Streu (jede Instanz im Stand, nach Gang und Fahrt); die
//       Feinform (Mesh gegen `_voxelSurfaceY`) ≤ 5 cm.
//       Gemessen wird erst, wenn die Welt steht — und dort steht der Ring an seinem Ziel (`_ringWaechst`, nie an der Bildrate)
//   K9  DER SPRUNG AUS DEM LEIB-GESETZ (leib.K2 Staffel 2, im Lauf von K8 an der Mess-Wiese): je Sicht (Ego, Third) der Sprung
//       aus dem Sprint, je Leib der heutige, die Masse ×1,25 (`_leibMasse`) und die Kraft ×1,25 (`_sprungKraft`) — die Hüfte
//       (Third) und das Auge (Ego) heben sich mit der Kapsel (≥ 80 %), die Masse senkt Höhe und Weite, die Kraft hebt beide
//       (je ≥ 10 %); der Täter „sprung" ist der feste Abdruck der Seele (vor leib-k2-sprung)
//   --selftest: je Defekt trägt die Welt den Leser vor seiner Heilung als Laufzeit-Stub (`taeter`) — GENAU
//   die Probe dieses Defekts muss rot werden; keine Probe liest Quelltext.
//   node scripts/diag-koerper-stand.cjs [--selftest]
"use strict";
const { statikServer, starteBrowser, warteAufWelt, nullRenderer, ROOT, hauptLauf, jsonSchreiben } = require("./lib/welt-boot.cjs");
const { WELT_ORTE_INSTALL, messort } = require("./lib/welt-orte.cjs");

const PORT = Number(process.env.KOERPER_STAND_PORT || 4479);
const SELBST = process.argv.includes("--selftest");
const NUR_K8 = process.argv.includes("--k8"); // nur K8 (die Welt mit Foundry)
// `--bild`: die Welt zeichnet über die Weiche (Rezept `linse`), ohne den Null-Renderer — die Station eines Geräts (gelaende.K5)
const BILD = process.argv.includes("--bild");
const DORF_ZUG = messort("wiese").dorfZug;
const K8_UMFANG = 200; // Kontakte je Ort × Rolle

// DIE KARTE DES EIGNERS (die Karte des Chunks unter dem Punkt, bilinear, null an einer leeren Ecke): seit K21 liest das Spiel nur
// `_bodenSichtAt` über alle Nachbarn — die Linse fragt den EINEN Karten-Leser des Spiels für den Eigner allein, ohne das Gewicht
// der Stufe (`_bodenKarteBilinear`, Stufe 0; Seite: `window.__eignerKarte`, Proben und Täter „rand").
function eignerKarte(r, x, z) {
    const span = r._voxelChunkConfig(0).span;
    const [cx, cz] = [Math.floor(x / span), Math.floor(z / span)];
    const e = r.state.voxelChunks && r.state.voxelChunks.get(`${cx},${cz}`);
    const k = e && e.surfMap && r._bodenKarteBilinear(e, cx, cz, x, z, null, 0);
    return k ? k.y : null;
}

// DER GEZEICHNETE BODEN (Seite: `window.__gezeichnet`, K6 und K8): ein Strahl lotrecht auf das Mesh des Eigners und seiner unteren
// Nachbarn, so gemorpht, wie der Stoff es zeichnet (je Vertex zum Ziel der gröberen Stufe um `_morphFaktor`, Naht und Stufe am
// Auge; je Auge und Geometrie einmal gebaut) — die oberste TRAGENDE Fläche (|n_y| ≥ 0,3, wie die Karte: eine Wand trägt nichts), nie durch einen Leser, den ein
// Schnitt heilt; null ohne Mesh. `steil`: die oberste Fläche des Strahls ist steil (ein Überhang: die Karte trägt dort die
// Oberkante ihrer Raster-Punkte, der Strahl die Fläche darunter); `meshe` zählt die getroffenen Chunks.
function gezeichnet(r, x, z) {
    const T = window.THREE;
    const G = window.__gezeichnet;
    const strahl = G.strahl || (G.strahl = new T.Raycaster());
    const span = r._voxelChunkConfig(0).span;
    let best = null;
    let oben = -Infinity;
    G.steil = false;
    for (const [a, b] of [
        [0, 0],
        [-1, 0],
        [0, -1],
        [-1, -1],
    ]) {
        const e = r.state.voxelChunks
            ? r.state.voxelChunks.get(`${Math.floor(x / span) + a},${Math.floor(z / span) + b}`)
            : null;
        if (!e || !e.mesh || !e.mesh.geometry) continue;
        G.meshe = (G.meshe | 0) + 1;
        const geo = e.mesh.geometry;
        const auge = r.state.stufeAuge ? r.state.stufeAuge.x + "," + r.state.stufeAuge.z : "";
        if (!e.__gez || e.__gez.geo !== geo || e.__gez.auge !== auge) {
            const P = geo.attributes.position.array;
            const Z = geo.attributes.aMorphTarget;
            const W = geo.attributes.aMorphWeight;
            const L = Float32Array.from(P);
            for (let i = 0; Z && W && i < W.count; i++) {
                const f = r._morphFaktor(W.array[i], P[3 * i], P[3 * i + 2]);
                for (let k = 0; k < 3; k++) L[3 * i + k] += (Z.array[3 * i + k] - P[3 * i + k]) * f;
            }
            const g = new T.BufferGeometry().setAttribute("position", new T.BufferAttribute(L, 3)).setIndex(geo.index);
            e.__gez = { geo, auge, mesh: new T.Mesh(g, e.mesh.material) };
        }
        strahl.set(new T.Vector3(x, 900, z), new T.Vector3(0, -1, 0));
        const alle = strahl.intersectObject(e.__gez.mesh, false);
        const h = alle.find((t) => t.face && Math.abs(t.face.normal.y) >= 0.3);
        if (h && (best === null || h.point.y > best)) best = h.point.y;
        if (alle.length && alle[0].point.y > oben) {
            oben = alle[0].point.y;
            G.steil = !(alle[0].face && Math.abs(alle[0].face.normal.y) >= 0.3);
        }
    }
    return best;
}

// DIE TÄTER DES SELBSTTESTS: je Defekt der Leser vor seiner Heilung als Laufzeit-Stub an der Welt (je Lauf ein eigener
// Kontext, kein Rückbau) — installiert vor dem Einschwingen, die Wand muss jeden beim Namen rot nennen.
function taeter(inj) {
    const P = Object.getPrototypeOf(r);
    const ueber = (n, vor) =>
        (r[n] = function (...a) {
            vor.call(this);
            try {
                return P[n].apply(this, a);
            } finally {
                delete this._bodenSichtAt;
            }
        });
    // traeger/luft: die Kapsel stand auf der Oberkante der Säule statt auf ihrem Träger; luft: die IK erdete im Sprung
    if (inj === "traeger" || inj === "luft") r._gaitBodenY = (x, z) => r.getTerrainHeightAt(x, z);
    if (inj === "luft") r._gaitTick = (m, h, v, dt, o) => P._gaitTick.call(r, m, h, v, dt, o && { ...o, ik: true });
    if (inj === "hoehle") r._koerperBodenUnter = (x, _y, z) => r._voxelSurfaceY(x, z); // der Boden über der Höhle
    if (inj === "sicht") r._standSicht = (_x, _z, traegerY) => traegerY; // der Leib steht auf dem Gesetz, nie auf der Karte
    if (inj === "tod")
        ueber("_tickLeichname", function () {
            for (const c of this.state.leichname || []) if (c.userData.dying) c.userData.dying.hebe = null;
        });
    if (inj === "fuge") {
        // die Auflage liest die Fuge nicht (vor K24-N1): keine Box ist gedeckt
        r._blockerFugen = (boxes) => (boxes || []).forEach((x) => (x.gedeckt = false));
        for (const e of st.architectures || []) r._blockerFugen(e.blockerAABBs);
    }
    // rand: der Stand-Leser liest nur die Karte des Eigners (vor K07); wiese: Nah-Wiese und Nah-Streu lesen im Rand-Streifen
    // nichts (vor K21)
    if (inj === "rand")
        ueber("_standSicht", function () {
            this._bodenSichtAt = (x, z) => window.__eignerKarte(this, x, z);
        });
    const C = r._voxelChunkConfig(0);
    const rest = (w) => w - Math.floor(w / C.span) * C.span;
    const streifen = (x, z) => rest(x) < C.step / 2 || rest(z) < C.step / 2;
    if (inj === "wiese")
        for (const n of ["_nahWieseKachelBueschel", "_nahStreuKachel"])
            ueber(n, function () {
                this._bodenSichtAt = (x, z, g) => (streifen(x, z) ? null : P._bodenSichtAt.call(this, x, z, g));
            });
    // rolle (K8): der Fuß der Streu las das Gesetz bilinear im 8-m-Raster des Feld-Bakes (vor H5), die Pfote stand auf dem
    // Träger ihres Leibs (vor Welle LF), das Rad federte auf das Gesetz und sein Reifen wölbte 0,12 radR (0,2 Federweg) unter
    // den Aufstand (vor H5)
    if (inj === "rolle") {
        r._streuFuss = (x, z) => {
            const [u, w] = [x / 8 - 0.5, z / 8 - 0.5];
            const [i, j] = [Math.floor(u), Math.floor(w)];
            const h = (a, b) => r._voxelSurfaceY((a + 0.5) * 8, (b + 0.5) * 8) || 0;
            const y =
                (h(i, j) * (i + 1 - u) + h(i + 1, j) * (u - i)) * (j + 1 - w) +
                (h(i, j + 1) * (i + 1 - u) + h(i + 1, j + 1) * (u - i)) * (w - j);
            return { x, z, lage: y, lod: 3, y };
        };
        r._kreaturFussBoden = (g) => g.userData._traegerY;
        const rad = r._archRadMatrix;
        r._archRadMatrix = function (e, lf, ewU, out) {
            this._bodenSichtAt = () => null;
            rad.call(this, e, lf, ewU, out);
            delete this._bodenSichtAt;
            out.elements[13] -= 0.2 * e._fahrSatz.auf.hub;
            return out;
        };
    }
    // fuss (K8): der Fuß steht 12 cm über seinem Boden, und die Treppe steht nie (eine Bahn ohne Kontakte)
    if (inj === "fuss")
        [r._gaitBodenY, r.createBlueprint] = [(x, z) => P._gaitBodenY.call(r, x, z) + 0.12, () => false];
    // sohle (K8): die Sohle der Pfote kippt nicht mit dem Boden unter ihr (vor K8 huf hielt sie die Lage des Rumpfs)
    if (inj === "sohle") r._gaitSohlenKipp = (...a) => (a[4] ? { laengs: 0, quer: 0 } : P._gaitSohlenKipp.apply(r, a));
    // ring (K8): der Ring bleibt am Boden des ersten Weltbilds stehen (vor gelaende-ring-wachstum: Radeon Ring 2 von 4)
    if (inj === "ring")
        r._ringWaechst = function () {
            P._ringWaechst.call(this);
            this.state._activeRingRadius = Math.min(2, this.state._activeRingRadius);
        };
    // nexus (K8): der Takt des Nexus wirft nach der Wanduhr in die Mess-Welt (vor k8-hang fragte er die Gate-Treue nicht)
    // sprung (K9): der Abdruck ist das feste Tempo der Seele (vor leib-k2-sprung) — Masse und Kraft ziehen nichts
    if (inj === "sprung") r._sprungAbdruck = () => st.jumpPower;
    if (inj === "nexus") {
        st.nexusEvolutionInterval = 5;
        r.evolveNexus = function (t) {
            this._dorfTaktLebt = () => true;
            P.evolveNexus.call(this, t);
            delete this._dorfTaktLebt;
        };
    }
}

const server = statikServer({ root: ROOT });

// Die Proben laufen IN der Seite (r = die Welt). Kein Stub: jede Probe ruft die Chokepoints des Spiels.
// DER UMFANG DER K7-PROBE (die EINE Quelle für Messung und Urteil): Büschel der Nah-Wiese und Pflanzen der Nah-Streu neben dem
// Rand-Streifen — bei 1 000 Büscheln ist die Unschärfe des Verhältnisses ≈ 3 %. Die Streu trägt 500 Pflanzen (σ ≈ 0,1): bei 100
// (gemessen 209 am Umkreis 120 m, σ 0,155, Band ± 46 %) lag ihr Defekt „wiese" (Verhältnis 0,53) auf der Kante des Bands —
// der Selbsttest feuerte 1 von 2 Mal (K69-2 N2, gates/koerper-stand.log blind, ks-nachher.log 0,533).
const K7_UMFANG = Object.freeze({ bueschel: 1000, pflanzen: 500 });

async function proben(mitWiese, umfang) {
    const s = st;
    const T = window.THREE;
    const A = AnazhRealm;
    const o = {};
    const pm = s.playerMesh;
    const p = s.player;
    const takt = () => {
        try {
            r._gameLoopTick(performance.now());
        } catch {}
    };
    const rig = pm && pm.userData && pm.userData.rig;
    if (!rig || !rig.hips) return { fehler: "Spieler-Rig fehlt" };
    // die Boden-Karte des EIGNERS selbst (eignerKarte) — die Linse misst gegen sie, nie durch den Schnitt; K6 sucht mit ihr
    // das Rand-Loch (dort ist sie leer, der Strahl richtet)
    const span = r._voxelChunkConfig(0).span;
    const karte = (x, z) => window.__eignerKarte(r, x, z);
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
    // ── K2 MENSCH IN DER HÖHLE ── (die Spalte unter ≥ 3 m Fels mit ≥ 3 m Luft, die nächste um den Spieler, in die der Leib
    // passt — die EINE Orts-Suche `__weltOrt`). K16 (das Flussnetz-Gelände): seine Höhlen sind Gänge, oft schmaler als ein Leib — an der ersten Tasche
    // (−7,4/3,1) lag der Grund 1,5 m daneben 3,9 m tiefer, die Kapsel glitt 2,2 m in den Fels, Fuß-Probe und Tier-Boden
    // lasen nichts (null, und `null <= 10` hieß grün). Im Umkreis R (Spieler und Wolf 1,5 m daneben: 2,4 m) liegt der Fels
    // im Abstand r höchstens r/3 über oder unter dem Grund (≤ 18°, der Leib ruht), darüber Luft bis + 2,4 m — wie die
    // Kammer-Probe des Fall-Wächters (`leibPasst`).
    const start = { x: pm.position.x, y: pm.position.y, z: pm.position.z };
    const ort = window.__weltOrt("hoehle", {
        mitte: [start.x, start.z],
        fels: 3,
        luft: 3,
        R: 2.4,
    });
    const hoehle = ort && { x: ort.x, z: ort.z, top: ort.dach, boden: ort.grund };
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
            await window.__weltStehtNach(takt); // die Welt steht (das EINE Einschwingen, welt-boot)
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
            // der Leib, der Zeuge der Sicht (die Sohlen am Mesh misst K8 am 25°-Hang)
            const leib = [];
            for (let k = 0; k < 30; k++) {
                tiere(1);
                const mL = karte(c.position.x, c.position.z);
                if (mL !== null) leib.push(Math.abs(c.position.y - mL));
            }
            leib.sort((a, b) => a - b);
            o.k4 = { leibMedianCm: leib.length ? Math.round(leib[leib.length >> 1] * 1000) / 10 : null };
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
            // ── K4c DIE FUGE: die Oberkante einer Box, auf der eine Box DESSELBEN Werks sitzt (sie beginnt höchstens
            // PLAYER_GROUND_SNAP über ihr, deckt ihre Mitte, und der Rand daneben ist schmaler als der Wand-Radius der
            // Kapsel — die Fuge zweier Stamm-Abschnitte, zweier Fels-Lagen, Pfosten unter dem Bogen), ist keine Fläche:
            // an ihrem Rand, der Fuß 0,3 m unter ihr, trägt sie weder die Kapsel des Spielers
            // (`_stepCharacterStructures`) noch die Auflage des Tiers (`_kreaturAuflage`). Geprüft wird jedes Werk mit
            // achsparallelen Boxen im Umkreis 60 m um den Start.
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
                const nKipp = Math.ceil((dy.dauer + A.TOD_LAGE.vorlaufSec + 0.05) / 0.02);
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
        const G = window.__gezeichnet;
        const gezeichnet = (x, z) => G(r, x, z);
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
                if (y === null || G.steil) return true;
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
                        if (G.steil) {
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
        o.k6leser = { ...leser, maxCm: Math.round(leser.max * 1000) / 10, mitte: [mitte.x, mitte.z], meshe: G.meshe };
    }
    pm.position.set(start.x, start.y, start.z);
    kapsel(30);
    s.playerVel = savedVel;
    // ── K7 WIESE UND STREU AM CHUNK-RAND: Nah-Wiese und Nah-Streu lesen Fuß, Hang und Grün über den EINEN Leser
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
            if (s.playerVel) s.playerVel.setValue(0, 0, 0); // er hängt still über dem Ort: das Auge ruht, die Welt kann stehen
        };
        // Ruhe heißt: die Welt steht (das EINE Einschwingen, welt-boot `__weltStehtNach`), und der Wald der Mesh-Zone steht — die
        // Antwort des Weltbilds (`_weltbildLuecken`, Terme `pflanzung` und `streu`). Seit K69 pflanzt die Schlange des Walds im
        // Takt; die Ruhe der Chunks allein maß die Streu vor ihren Kronen (K69-2 N2: 209 Pflanzen neben dem Streifen, σ 0,155).
        const waldOffen = () => r._weltbildLuecken(true).some((l) => l.term === "pflanzung" || l.term === "streu");
        await window.__weltStehtNach(() => (setz(), takt()));
        o.k7wald = !waldOffen();
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
        // Je Probe ihr eigener Umkreis: die Wiese steht, sobald sie ihren Umfang trägt; die Streu wächst weiter bis zu ihrem.
        for (R = 120; R <= 240; R += 20) {
            if (!(o.k7wiese && o.k7wiese.daneben >= umfang.bueschel)) {
                o.k7wiese = zaehle(NW.kachel, 0.34, (tx, tz) => r._nahWieseKachelBueschel(tx, tz));
                o.k7umkreis = R;
            }
            o.k7streu = zaehle(NS.kachel, 0, (tx, tz) => {
                const satz = r._nahStreuKachel(tx, tz, arten);
                return satz ? satz.items : null;
            });
            o.k7umkreisStreu = R;
            if (o.k7wiese.daneben >= umfang.bueschel && o.k7streu.daneben >= umfang.pflanzen) break;
        }
    }
    return o;
}

// ── K8 (Kopf der Datei) ──
async function rollen(n) {
    const s = st;
    const T = window.THREE;
    const pm = s.playerMesh;
    const gez = (x, z) => window.__gezeichnet(r, x, z);
    // die Uhr des Takts: je Takt ein Bild (16,7 ms) — der Gang schreitet gleich, wie schnell die Seite auch rechnet
    let uhr = performance.now();
    const takt = () => {
        try {
            r._gameLoopTick((uhr += 1000 / 60));
        } catch {}
    };
    const cm = (a, f) => {
        const b = a.slice().sort((x, y) => x - y);
        return b.length ? Math.round(b[Math.min(b.length - 1, Math.floor(f * b.length))] * 1000) / 10 : null;
    };
    const mass = (a) => ({ n: a.length, p95: cm(a.map(Math.abs), 0.95), median: cm(a, 0.5) });
    const v = new T.Vector3();
    const M = new T.Matrix4();
    let treppe = null; // die gezeichneten Stufen unter (x, z) (die oberste Fläche, wie das Bild sie zeichnet)
    // je Knochen die Vertices des gezeichneten Leibs (Ebene 0, vor der Ego-Maske), die er überwiegend trägt; die Sohle = der
    // tiefste von ihnen nach den Knochen, gegen das Mesh unter ihm
    const sohle = (leib, knochen) => {
        const je = knochen.map(() => []);
        leib.traverse((o) => {
            const ebene = o.userData._maskeVorEgo !== undefined ? o.userData._maskeVorEgo : o.layers.mask;
            if (!o.isSkinnedMesh || !(ebene & 1)) return;
            const si = o.geometry.attributes.skinIndex;
            const sw = o.geometry.attributes.skinWeight;
            const bi = knochen.map((b) => o.skeleton.bones.indexOf(b));
            for (let i = 0; i < si.count; i++)
                for (let k = 0; k < 4; k++) {
                    const j = bi.indexOf(si.getComponent(i, k));
                    if (j >= 0 && sw.getComponent(i, k) > 0.5) je[j].push([o, i]);
                }
        });
        // der Kontakt: der Vertex mit dem kleinsten Abstand zum Boden unter ihm (die Ebene des Meshs unter dem tiefsten Vertex,
        // die Treppe je Vertex), gegen den gezeichneten Boden — am Hang ist der tiefste Vertex die Ferse, die im Abrollen zu
        // Recht abhebt (die Falllinie hinauf „schwebte“ sie +4 … +9 cm)
        return (j) => {
            const p = je[j].map(([o, i]) => o.getVertexPosition(i, new T.Vector3()).applyMatrix4(o.matrixWorld));
            const u = p.reduce((a, b) => (b.y < a.y ? b : a), p[0]);
            const [g, gx, gz] = [0, 0.1, 0].map((a, k) => u && gez(u.x + a, u.z + 0.1 * (k > 1)));
            if (!u || g === null || gx === null || gz === null) return null;
            const d = (q) =>
                q.y -
                Math.max(
                    g + ((gx - g) * (q.x - u.x) + (gz - g) * (q.z - u.z)) / 0.1,
                    treppe ? treppe(q.x, q.z) : -Infinity
                );
            const t = p.reduce((a, b) => (d(b) < d(a) ? b : a));
            const b = Math.max(gez(t.x, t.z) ?? -Infinity, treppe ? treppe(t.x, t.z) : -Infinity);
            return b > -Infinity ? t.y - b : null;
        };
    };
    const gehen = (je) => {
        const a = [];
        for (let k = 0; k < 1500 && a.length < n; k++) {
            takt();
            je(a);
        }
        return a;
    };
    const o = {};
    const W = window.__messWiese;
    // der 25°-Hang: der nächste trockene Hang 24–26° um die Wiese (das Gesetz über ± 4 m, die EINE Orts-Suche `__weltOrt`)
    const hang = window.__weltOrt("hang", { mitte: W, min: 24, max: 26, basis: 4 });
    const h = (x, z) => r._terrainMacroSurfaceY(x, z, true);
    for (const [ort, X, Z] of [
        ["wiese", W[0], W[1]],
        ["hang", hang && Math.round(hang.x), hang && Math.round(hang.z)],
    ]) {
        if (!Number.isFinite(X)) continue;
        const setz = (x = X, z = Z) => {
            pm.position.set(x, r._voxelSurfaceY(x, z) + 0.6, z);
            s._fixedSimPos = null;
            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
        };
        await window.__weltStehtNach(() => (setz(), takt()));
        const R = (o[ort] = {
            x: X,
            z: Z,
            neig: ort === "hang" ? hang.neigung : 0,
            ring: [s._activeRingRadius, s.chunkRingRadius],
        });
        // die Feinform: das Mesh gegen das Gesetz an n Zufalls-Punkten 3–30 m um den Ort
        const fein = [];
        let saat = 7;
        const zufall = () => (saat = (saat * 1664525 + 1013904223) >>> 0) / 4294967296;
        for (let k = 0; k < 20 * n && fein.length < n; k++) {
            const w = zufall() * 2 * Math.PI;
            const d = 3 + 27 * zufall();
            const x = X + d * Math.cos(w);
            const z = Z + d * Math.sin(w);
            const g = gez(x, z);
            const l = r._voxelSurfaceY(x, z);
            if (g !== null && Number.isFinite(l) && !window.__gezeichnet.steil) fein.push(g - l);
        }
        R.fein = mass(fein);
        // der Fuß der Streu: der Ursprung jeder Instanz (die erste Scheibe, ihre Blatt-Matrix trägt keinen Versatz, ihr Ursprung
        // liegt über der Zelle) gegen das Mesh, wie es JETZT gezeichnet ist — im Stand, nach dem Gang und nach der Fahrt, ohne
        // Einschwingen (der Geomorph folgt dem Auge)
        const streu = [];
        const streuJetzt = () => {
            for (const reg of s.scatterRegions ? s.scatterRegions.values() : [])
                for (const c of (reg && reg.cells) || []) {
                    const ref = c.slots && c.slots[0];
                    const g = ref && s.archInstanceGroups.get(ref.key);
                    if (!g || !g.mesh) continue;
                    v.setFromMatrixPosition(g.mesh.getMatrixAt(ref.slot, M), M);
                    const b = Math.hypot(v.x - c.x, v.z - c.z) < 0.05 ? gez(c.x, c.z) : null;
                    if (b !== null) streu.push(v.y - b);
                }
        };
        streuJetzt();
        // DER FUSS DES SPIELERS auf drei Bahnen (leib.K2), vorwärts ist (sin, cos): längs der Höhenlinie (fuss), die Falllinie
        // hinauf und hinab (falllinie), zehn Stufen à 0,17 m hinauf und hinab (stufe, gebaut als Werkstatt-Bauplan) — die Füße
        // im Stand (der Fuß-Lock der IK) gegen die oberste gezeichnete Fläche. Der Leib steht, wie das nächste Bild ihn
        // zeichnet (`updateMatrixWorld`): unter der GPU-Leine zeichnet ein Takt der Probe kein Bild, die Knochen standen vor
        // der Fuß-IK (Radeon/GTX hang 17,2–18,2 cm, der Null-Renderer frischt sie in jedem `render`). Steckenbleiber: je halbe
        // Sekunde mit gehaltener Taste < 15 cm voran, oder das Ende eines Abschnitts nie erreicht (dann endet die Bahn).
        const P = pm.position;
        const auf = Math.atan2(h(X + 1, Z) - h(X - 1, Z), h(X, Z + 1) - h(X, Z - 1));
        const rig = pm.userData.rig;
        const fuss = sohle(pm, [rig.legL.ankle, rig.legR.ankle]);
        const bahn = (wege, zaehlt = () => true, x = X, z = Z) => {
            setz(x, z);
            for (let k = 0; k < 30; k++) takt(); // der Leib steht am neuen Ort, bevor er geht (kein Lock der Bahn davor)
            let [i, k, x0, z0, h0, stecken] = [0, 0, x, z, 0, 0];
            const vor = () => (P.x - x0) * Math.sin(s.yaw) + (P.z - z0) * Math.cos(s.yaw);
            [s.yaw, s.keys.w] = [wege[0][0], true];
            const a = gehen((a) => {
                if (++k % 30 === 0) [stecken, h0] = [stecken + (vor() - h0 < 0.15), vor()];
                if (vor() >= wege[i % wege.length][1])
                    [i, k, x0, z0, h0, s.yaw] = [i + 1, 0, P.x, P.z, 0, wege[(i + 1) % wege.length][0]];
                pm.updateMatrixWorld(true);
                const ik = pm.userData._gaitIK;
                for (const [j, l] of ik ? [ik.lockL, ik.lockR].entries() : [])
                    if (l.on && zaehlt(l) && (v.y = fuss(j)) !== null) a.push(v.y);
            });
            s.keys.w = false;
            return { ...mass(a), stecken: stecken + (a.length < n) };
        };
        R.fuss = bahn([auf - Math.PI / 2, auf + Math.PI / 2].map((y) => [y, 25]));
        // der Huf: je Größen-Band ein Reh an seiner Obergrenze 4 m neben dem Spieler, frei im Gang (die Beine im Stand:
        // Hub 0 ihres Ziels); netId und Kreatur-Uhr fest — Größe und Weg hängen nie an der Fauna vor ihm
        const [max, seq] = [s.maxCreatures, s._creatureNetSeq];
        for (const [k, band] of AnazhRealm._verhaltenGesetz().groessen.entries()) {
            [s.maxCreatures, s._creatureNetSeq, s.creatureAnimationTime] = [s.creatures.length + 3, 9e5 + k, 1000];
            const reh = r.spawnCreatureAt(
                P.x + 4,
                r._voxelSurfaceY(P.x + 4, P.z + 3) + 0.5,
                P.z + 3,
                "happy",
                "wesen",
                {
                    bodySize: band.max,
                }
            );
            [s.maxCreatures, s._creatureNetSeq] = [max, seq];
            const tb = reh && reh.userData._tierBaum;
            if (!tb) continue;
            const huf = sohle(reh, [tb.teile.flP, tb.teile.frP, tb.teile.hlP, tb.teile.hrP]);
            const m = mass(
                gehen((a) => {
                    const Zg = tb._gang && tb._gang.ziele;
                    reh.updateMatrixWorld(true);
                    for (let j = 0; Zg && j < 4; j++) if (Zg[j][3] === 0 && (v.y = huf(j)) !== null) a.push(v.y);
                })
            );
            if (!R.huf || m.p95 > R.huf.p95) R.huf = { ...m, median: band.name + " " + m.median };
            r.removeCreature(reh);
        }
        // das Rad: der GT 6 m neben dem Spieler, aufgesessen, in Fahrt längs der Höhenlinie (ein Studio-Fahrzeug liegt längs x)
        const e = r.spawnArchitecture(
            "fahrzeug_gt",
            { x: P.x + 6, y: r._voxelSurfaceY(P.x + 6, P.z) + 0.5, z: P.z },
            { silent: true, precise: true, rotationY: auf - Math.PI }
        );
        if (e) await window.__gebautNach(e, { takt: () => sleep(100), max: 200 });
        if (e && e.instSlots && (r.mountArchitecture(e) || {}).ok) {
            for (let k = 0; k < 15; k++) takt();
            // je Takt die Blätter des Rads (`lf.rad` des Flats seiner Stufe, Slot i ↔ Blatt i): je Nabe der tiefste Vertex;
            // in der Luft (`_fahr.luft`) und im Stand (ein Rad auf einem Stein) zählt kein Boden-Kontakt
            const tief = (ref) => {
                const g = s.archInstanceGroups.get(ref.key);
                const pa = g.geom.attributes.position;
                g.mesh.getMatrixAt(ref.slot, M);
                let t = null;
                for (let i = 0; i < pa.count; i++) {
                    v.fromBufferAttribute(pa, i).applyMatrix4(M);
                    if (!t || v.y < t.y) t = v.clone();
                }
                return t;
            };
            s.keys.w = true;
            R.rad = mass(
                gehen((a) => {
                    const lod = Number.isFinite(e._servedLod) ? e._servedLod : e._lodLevel;
                    const flat = r._foundryFlattenFor(e, r._foundryPresetForEntry(e), lod);
                    const naben = new Map();
                    for (let i = 0; flat && !e._fahr.luft && e._fahr.speed > 1 && i < e.instSlots.length; i++) {
                        const rd = flat.leaves[i] && flat.leaves[i].rad;
                        const t = rd && tief(e.instSlots[i]);
                        const k = rd && rd.hx + "," + rd.hz;
                        if (t && !(naben.get(k) && naben.get(k).y <= t.y)) naben.set(k, t);
                    }
                    for (const t of naben.values()) {
                        const g = gez(t.x, t.z);
                        if (g !== null) a.push(t.y - g);
                    }
                })
            );
            s.keys.w = false;
            streuJetzt();
            r.dismountArchitecture();
            r.removeArchitecture(e);
        }
        R.falllinie = bahn([auf, auf + Math.PI].map((y) => [y, 6]));
        // die Treppe: zehn Stufen (Auftritt 0,3 m, Breite 1,4 m) und ein Podest 1,6 m, bergauf längs der Falllinie ab dem Ort;
        // gezählt wird ein Fuß über ihrem Grundriss (quer ± 0,7 m, längs 0 … 4,6 m)
        if (!s.blueprints.messtreppe && r.createBlueprint("messtreppe"))
            for (let i = 0; i <= 10; i++) {
                const [top, tief] = [0.17 * Math.min(i + 1, 10), i < 10 ? 0.3 : 1.6];
                r.addPartToBlueprint("messtreppe", {
                    position: { x: 0, y: (top - 1.5) / 2, z: 0.3 * i + tief / 2 },
                    size: { x: 1.4, y: top + 1.5, z: tief },
                });
            }
        const t = r.spawnArchitecture(
            "messtreppe",
            { x: X, y: r._voxelSurfaceY(X, Z) + 0.5, z: Z },
            { precise: true, rotationY: auf }
        );
        const lot = new T.Raycaster();
        treppe = (x, z) => {
            t.mesh.updateMatrixWorld(true);
            lot.set(new T.Vector3(x, 1e4, z), new T.Vector3(0, -1, 0));
            const h = lot.intersectObject(t.mesh, true)[0];
            return h ? h.point.y : -Infinity;
        };
        const [sx, sz] = [Math.sin(auf), Math.cos(auf)];
        const ueber = (l) =>
            Math.abs((l.x - X) * sz - (l.z - Z) * sx) < 0.7 && Math.abs((l.x - X) * sx + (l.z - Z) * sz - 2.3) < 2.3;
        R.stufe =
            t &&
            bahn(
                [auf, auf + Math.PI].map((y) => [y, 5.4]),
                ueber,
                X - 1.5 * sx,
                Z - 1.5 * sz
            );
        treppe = null;
        if (t) r.removeArchitecture(t);
        streuJetzt();
        R.streu = mass(streu);
        // DER SPRUNG AUS DEM LEIB-GESETZ (K9, leib.K2 Staffel 2) an der Wiese je Sicht: aus dem Sprint, die Taste einen Takt
        // gehalten, bis der Leib landet — der Hub der Kapsel, der gezeichneten Hüfte und des Auges und die Weite vom Abdruck bis
        // zur Landung, je Leib: der heutige, die Masse ×1,25 (`_leibMasse`), die Kraft ×1,25 (`_sprungKraft`)
        if (ort !== "wiese") continue;
        const y = () => (pm.updateMatrixWorld(true), [P.y, rig.legL.hip.getWorldPosition(v).y, s.camera.position.y]);
        const sprung = (fm, fk, j = { hub: [0, 0, 0] }) => {
            const L = Object.getPrototypeOf(r);
            [r._leibMasse, r._sprungKraft] = [(k) => fm * L._leibMasse.call(r, k), () => fk * L._sprungKraft.call(r)];
            setz();
            [s.keys.w, s.keys.shift, s.yaw] = [true, true, 0];
            for (let k = 0; k < 120; k++) takt();
            const [y0, x0, z0] = [y(), P.x, P.z];
            s.keys[" "] = true;
            for (let k = 0; k < 300 && (!k || s.isJumping); k++, s.keys[" "] = false) {
                takt();
                y().forEach((h, i) => (j.hub[i] = Math.max(j.hub[i], h - y0[i])));
            }
            [s.keys.w, s.keys.shift, j.weite] = [false, false, Math.hypot(P.x - x0, P.z - z0)];
            delete r._leibMasse;
            delete r._sprungKraft;
            return j;
        };
        o.sprung = {};
        for (const b of ["first", "third"]) {
            r.setCameraMode(b);
            o.sprung[b] = [sprung(1, 1), sprung(1.25, 1), sprung(1, 1.25)];
        }
    }
    o.nexus = r.nexus && r.nexus.knightOfTime.autonomyLevel;
    return o;
}

function urteil(o) {
    const f = [];
    if (o.fehler) return [o.fehler];
    // ein fehlender Teil liest {}, ein fehlender Wert NaN — nie 0 (`null <= 10` ist wahr): keine Probe heißt rot
    const { k1, k2 = {}, k3 = {}, k4 = {}, k4b = {}, k4c = {}, k5 = {}, k6leser: L = {} } = o;
    const zahl = (x) => x ?? NaN;
    if (!k1.struktur) f.push(`K1 Aufbau: der Spieler steht nicht auf einem Bauwerk (Träger ${k1.traeger})`);
    if (!(Math.abs(k1.beckenCm) <= 1))
        f.push(`K1 Becken auf dem Träger: ${k1.beckenCm} cm (die Fuß-IK zieht den Körper ins Bauwerk)`);
    if (!k1.sprungLuft) f.push("K1 Aufbau: der Sprung hebt die Kapsel nicht in die Luft");
    else if (!(Math.abs(k1.sprungBeckenCm) <= 1))
        f.push(`K1 Becken im Sprung: ${k1.sprungBeckenCm} cm (die IK erdet in der Luft)`);
    if (!o.hoehle) f.push("K2 Aufbau: keine Höhle im Raster");
    else {
        if (!(zahl(k2.abstandCm) <= 10))
            f.push(`K2 Fuß-Probe in der Höhle: ${k2.abstandCm} cm vom Höhlen-Boden (die Probe liest die Oberkante)`);
        if (!(zahl(k3.abstandM) <= 0.15)) f.push(`K3 Tier in der Höhle: ${k3.abstandM} m über dem Höhlen-Boden`);
    }
    if (!o.hang) f.push("K4 Aufbau: keine Hang-Stelle im Raster");
    else {
        if (!(zahl(k4.leibMedianCm) <= 6))
            f.push(`K4 Leib gegen die Karte: Median ${k4.leibMedianCm} cm (der Leib steht auf dem Gesetz)`);
        if (!(k4b.treppeCm <= 8))
            f.push(`K4 Treppe: ${k4b.treppeCm} cm Sprung je Takt über die Neigung hinaus (Träger: ${k4b.traeger})`);
        if (!(k4c.fugen >= 20)) f.push(`K4 Aufbau: ${k4c.fugen} Fugen im Umkreis (Soll ≥ 20)`);
        else if (k4c.traegt > 0)
            f.push(
                `K4 Fuge: ${k4c.traegt} von ${k4c.fugen} Fugen tragen einen Leib — Täter ${k4c.taeter.join("; ")} (die Auflage _resolveCapsuleVsAABB/_kreaturAuflage liest box.gedeckt nicht)`
            );
        if (!o.eben) f.push("K5 Aufbau: keine ebene Stelle im Raster");
        else if (!(Math.abs(k5.gegenStandCm) <= 3) || !(k5.wegMinCm >= -5))
            f.push(
                `K5 Tod-Lage: die tiefste Stelle liegt ${k5.gegenStandCm} cm über ihrem Stand-Kontakt, auf dem Weg ${k5.wegMinCm} … ${k5.wegMaxCm} cm (Soll ± 3, Weg ≥ −5)`
            );
    }
    if (!(L.n >= 300) || L.fehl > 0)
        f.push(
            `K6 Leser im Rand-Streifen: ${L.fehl} von ${L.n} Punkten verfehlen den gezeichneten Boden um mehr als 25 cm (max ${L.maxCm} cm bei ${L.wo}, Karten dort ${L.stufen}, Mitte ${L.mitte}) — Täter _standSicht/_bodenSichtAt: dort trägt der Träger`
        );
    if (!(L.meshe > 0)) f.push("K6 Aufbau: kein gezeichnetes Chunk-Mesh für den Strahl");
    // K7 dort, wo gemessen (der Lauf ohne Defekt und der Defekt „wiese“): Wiese und Streu im Band ±10 % oder drei Unschärfen,
    // was weiter ist — EINE Regel. Die Wiese hielt ±10 % fest, gerechnet auf ≈ 3 % Unschärfe bei 1 000 Büscheln; in der Aue
    // −278/−1038 trägt der Streifen 748 Büschel (σ 4,4 %), und die Kronen-Streu und das Grün des Bodens liegen in Flecken,
    // nicht unabhängig je Büschel: dort lag das Verhältnis 1,12 ± 0,044, und die Erwartung aus den Faktoren des Lesers selbst
    // (Σp je Kandidat, Stufe 0/1/2 einzeln) 1,07 — Streifen über und unter 1 je Stufe, keine Naht. Der Täter der Klasse (K21:
    // der Leser liest nur die Karte des Eigners) fiel auf 0,08.
    const toleranz = (w) => Math.max(0.1, 3 * w.sigma);
    const k7 = (w, name, n) => {
        if (!w) return;
        if (!(w.daneben >= n)) f.push(`K7 Aufbau: ${w.daneben} ${name} neben dem Rand-Streifen (Soll ≥ ${n})`);
        else if (!(Math.abs(w.verh - 1) <= toleranz(w)))
            f.push(
                `K7 ${name === "Büschel" ? "Wiese" : "Streu"} im Rand-Streifen: Dichte ${w.dichte[0]} gegen ${w.dichte[1]} je m² daneben (Verhältnis ${w.verh} ± ${w.sigma}, Soll 1 ± ${Math.round(toleranz(w) * 100)} %; ${w.streifen}/${w.daneben} in ${w.kacheln} Kacheln) — Täter: der Leser der Kachel (_nahWieseKachelBueschel/_nahStreuKachel) liest nicht _bodenSichtAt`
            );
    };
    if (o.k7wald === false)
        f.push("K7 Aufbau: der Wald der Mesh-Zone steht nicht (Terme pflanzung/streu offen nach 200 Runden)");
    k7(o.k7wiese, "Büschel", K7_UMFANG.bueschel);
    k7(o.k7streu, "Pflanzen", K7_UMFANG.pflanzen);
    return f;
}

// K8 je Ort × Rolle: Soll p95 in cm und der EINE Leser der Rolle (der Täter beim Namen)
const K8_ROLLEN = Object.freeze({
    fein: [5, "die Feinform des Meshs gegen das Gesetz (das Surface-Nets-Mesh des Workers)"],
    streu: [3, "der Fuß der Streu (_streuFuss: der gezeichnete Boden, dem Auge nach)"],
    fuss: [3, "der Fuß des Spielers (die Sohle des Leibs gegen _gaitBodenY)"],
    falllinie: [3, "der Fuß des Spielers die Falllinie hinauf und hinab (die Sohle gegen _gaitBodenY)"],
    stufe: [3, "der Fuß des Spielers auf der Treppe (_standSicht: die Auflage unter JEDEM Fuß)"],
    huf: [3, "der Huf (_kreaturFussBoden, seine Sohle _gaitSohlenKipp)"],
    rad: [3, "das Rad (_archRadMatrix: der Reifen auf _standSicht)"],
});
function urteilK8(o) {
    if (!o || !o.wiese || !o.hang) return ["K8 Aufbau: Mess-Wiese oder 25°-Hang fehlt"];
    const f = [];
    // die Mess-Welt ist eine Funktion des Codes: kein Wurf des Nexus nach der Wanduhr (sein Dorf am Hang: fein 30,8/31,4 cm)
    if (o.nexus)
        f.push(
            `K8 Aufbau: der Nexus entwickelte sich ${o.nexus}-mal in der Mess-Welt — Täter: evolveNexus ohne Gate-Treue`
        );
    for (const ort of ["wiese", "hang"]) {
        const [ring, ziel] = o[ort].ring || [];
        if (!(ring >= ziel))
            f.push(`K8 Ring ${ort}: ${ring} von ${ziel} — Täter: _ringWaechst (der Ring wächst bis zum Ziel)`);
        for (const [rolle, [soll, wer]] of Object.entries(K8_ROLLEN)) {
            // die Deko-Streu über den Chunks (64–194 m) trägt an der Wiese (einer Aue) gut 100 Instanzen: die Hälfte des Umfangs
            const m = o[ort][rolle] || {};
            const min = rolle === "streu" ? K8_UMFANG / 2 : K8_UMFANG;
            if (m.stecken) f.push(`K8 Steckenbleiber ${ort} ${rolle}: ${m.stecken} — Täter: der Kapsel-Schritt`);
            if (!(m.n >= min)) f.push(`K8 Aufbau ${ort} ${rolle}: ${m.n} Kontakte (Soll ≥ ${min})`);
            else if (!(m.p95 <= soll))
                f.push(`K8 ${rolle} ${ort}: p95 ${m.p95} cm (Median ${m.median}, Soll ≤ ${soll}) — Täter: ${wer}`);
        }
    }
    // K9 je Sicht: der Leib (Third) und das Auge (Ego) heben sich mit der Kapsel (≥ 80 %), die Masse ×1,25 senkt Höhe und
    // Weite, die Kraft ×1,25 hebt sie (je ≥ 10 %)
    if (!o.sprung) f.push("K9 Aufbau: kein Sprung");
    for (const [b, [g, masse, kraft]] of Object.entries(o.sprung || {})) {
        if (!(g.hub[b === "first" ? 2 : 1] >= 0.8 * g.hub[0])) f.push(`K9 Bild ${b}: Kapsel/Leib/Auge ${g.hub} m`);
        for (const [n, j, vz] of [
            ["masse", masse, -1],
            ["kraft", kraft, 1],
        ])
            if (!((j.hub[0] / g.hub[0] - 1) * vz >= 0.1 && (j.weite / g.weite - 1) * vz >= 0.1))
                f.push(`K9 Mutante ${n} ${b}: ${j.hub[0]}/${j.weite} gegen ${g.hub[0]}/${g.weite} m`);
    }
    return f;
}
// DIE ZEILE: jede Zahl jeder Probe, auf Millimeter gerundet (die Urteile nennen den Täter beim Namen)
const zeile = (o) =>
    JSON.stringify(o, (_k, v) => (typeof v === "number" ? Math.round(v * 1000) / 1000 : v)).replace(/"/g, "");

hauptLauf(async () => {
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: BILD ? "linse" : "null", frist: 900000 });
    let rot = 0;
    try {
        // `k8`: sie misst nur K8 (Streu, Reh und GT tragen Studio-Gestalten der Foundry)
        const lauf = async (inj, k8) => {
            // je Lauf ein eigener Browser-Kontext: kein Speicherstand (Save, IndexedDB) des Vorlaufs reist in die nächste
            // Welt (ein gespeichertes Dorf stünde sonst unter dem neu gegründeten)
            const kontext = await browser.createBrowserContext();
            const page = await kontext.newPage();
            page.setDefaultTimeout(880000);
            if (!BILD) await nullRenderer(page);
            // die Mess-Wiese in IHREM Zustand (spec/profiband/haushalt.json `dorfZug`): ruht dort der Zug, wächst kein Auto-Dorf an
            // Wiese und Hang — headless ruht er ohnehin (`_dorfTaktLebt`), auf der Karte lief er, und der 25°-Hang stand unter den
            // Terrassen des Dorfs (Radeon: Feinform p95 21,1 statt 4,3 cm); dasselbe Urteil hält den Takt des Nexus an (sein Dorf)
            if (DORF_ZUG === false) await page.evaluateOnNewDocument(() => (window.__anazhAutoSettlement = false));
            await page.evaluateOnNewDocument(WELT_ORTE_INSTALL); // der Messort aus spec/profiband/haushalt.json (`__messWiese`)
            await page.evaluateOnNewDocument(`window.__eignerKarte = ${eignerKarte.toString()};`);
            await page.evaluateOnNewDocument(`window.__gezeichnet = ${gezeichnet.toString()};`);
            await server.zeige(page, 180000, "index.html", "networkidle0");
            await warteAufWelt(page, 180000);
            if (inj) await page.evaluate(taeter, inj);
            // die Welt einschwingen: sie steht (das EINE Einschwingen, welt-boot `__weltStehtNach`)
            await page.evaluate(() =>
                window.__weltStehtNach(() => {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch {}
                })
            );
            const o = k8
                ? await page.evaluate(rollen, K8_UMFANG)
                : await page.evaluate(proben, inj == null || inj === "wiese", K7_UMFANG);
            await kontext.close();
            return { o };
        };
        if (SELBST) {
            const soll = {
                traeger: ["K1 Becken auf dem Träger", "K2 Fuß-Probe"],
                luft: ["K1 Becken im Sprung"],
                hoehle: ["K3 Tier in der Höhle"],
                sicht: ["K4 Leib gegen die Karte", "K4 Treppe"],
                tod: ["K5 Tod-Lage"],
                fuge: ["K4 Fuge"],
                rand: ["K6 Leser im Rand-Streifen"],
                wiese: ["K7 Wiese im Rand-Streifen", "K7 Streu im Rand-Streifen"],
                rolle: ["K8 streu wiese", "K8 streu hang", "K8 huf hang", "K8 rad hang"],
                sohle: ["K8 huf hang"],
                ring: ["K8 Ring wiese", "K8 Ring hang"],
                nexus: ["K8 Aufbau: der Nexus"],
                fuss: ["K8 fuss hang", "K8 Aufbau hang stufe", "K8 Aufbau wiese stufe"],
                sprung: ["K9 Mutante masse first", "K9 Mutante kraft third"],
            };
            for (const inj of Object.keys(soll)) {
                const k8 = /^K[89]/.test(soll[inj][0]);
                const { o } = await lauf(inj, k8);
                const f = k8 ? urteilK8(o) : urteil(o);
                const ok = soll[inj].every((x) => f.some((y) => y.startsWith(x)));
                const beleg = soll[inj].map((x) => f.find((y) => y.startsWith(x)) || `${x}: grün (blind!)`).join(" | ");
                console.log(`  ${ok ? "✅" : "❌"} Selbsttest „${inj}" macht ${soll[inj].join(" + ")} rot — ${beleg}`);
                if (!ok) rot++;
            }
        }
        const { o } = NUR_K8 ? { o: null } : await lauf(null);
        const k8 = await lauf(null, true);
        const f = [...(o ? urteil(o) : []), ...urteilK8(k8.o)];
        console.log("  " + zeile({ ...o, k8: k8.o }));
        for (const x of f) console.log("  ❌ " + x);
        rot += f.length;
        if (process.env.KOERPER_STAND_JSON)
            jsonSchreiben(process.env.KOERPER_STAND_JSON, { ...o, k8: k8.o });
    } finally {
        await browser.close();
        server.close();
    }
    console.log(rot ? `❌ gate:koerper-stand ROT (${rot})` : "✅ gate:koerper-stand grün");
    process.exit(rot ? 1 : 0);
});
