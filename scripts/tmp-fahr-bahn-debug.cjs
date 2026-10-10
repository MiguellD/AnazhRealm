// diag-fahr-bahn.cjs — DIE FAHR-BAHN-LINSE (Schau 2, Familie fahr-bahn; Befund artifacts/profiband/leben-schau-2/befund.md
// §2 Spur B und §6 #6, V1-LÜCKE „benutzen"): FAHREN HAT EINE BAHN UND EINE STIMME. Die sichtbare Schau (09.10., drei Fenster
// auf der Radeon) fand, was kein Gate sah: der erste GT des v1-Pfads klebt 40° gekippt am Fels hinter dem Garage-Tor, jede
// Befreiung bringt rückwärts höchstens −0,7 km/h (13 Versuche auf 67 m), und die Fahrt ist stumm, ohne Tacho, ihre Tasten
// fehlen in der Hilfe. Je Täter beim NAMEN, im echten Boot (headless, foundry-ON, Null-Renderer der Welt — EIN Boot für alle
// Phasen, Takt-Zähler statt Wanduhr):
//
//   K (Node, der Kern selbst) — DIE BEFREIUNG: jedes Rezept (vehicle-core PRESETS) steht still und fährt die Befreiung der
//     Schau (S + volle Gegenlenkung, 1,3 s), dazu S allein — eben, 10° und 15° rückwärts bergauf.            Soll je ≥ 1 m
//     Befund: GT S + Lenkung eben 0,40 m (−1,5 km/h), 10° 0,05 m, S allein 15° 0,10 m.
//   P — DER PLATZ: (P1) der Genesis-Ring und die Vorschau des Garage-Tors über die Stamm-Methoden des Ort-Takts
//     (`_genesisPortalRing`, `_portalApproachPrefetch`), (P2) „bau mir einen gt" (der Satz → spawn_studio) vor dem Fels am
//     Garage-Tor. Je Wagen: Neigung der Rad-Ebene (vehicle-core fahrEbene), Wände im Umriss (das Feld über Ebene + Rad-Stufe
//     an 5 × 3 Punkten der Hülle), Blocker im Band der Hülle, dann die Probe-Fahrt (E steigt ein, W 2 s, S 2 s, E steigt
//     aus).                                        Soll: Wände 0 · Blocker 0 · vor ≥ 2 m · zurück ≥ 1,5 m · Neigung ≤ 30°
//     Befund: 38° steil, 40° gewankt auf dem Felsblock; S 2,5 s 0,2 m, W 3 s 0,08 m.
//   B — DER STOSS UND DIE BEFREIUNG IN DER WELT: der GT steht an der Stelle der Schau (−875/−732, Kurs auf −765/−752) vor
//     dem Glutbrunnen, fährt mit Gas dagegen (der Stoß), dann die Befreiung der Schau: S + Gegenlenkung 1,3 s, je Seite.
//     Befund: 0,25 m, −0,9 km/h.                                                                 Soll je ≥ 1 m zurück
//   T — DER TACHO: im Sattel zeigt #fahr-tacho die km/h des Fahr-Zustands (|vlong| × vehicle:FAHR.kmh — dieselbe Zahl wie
//     der Tacho der Probefahrt), nach dem Absteigen ist er fort. Befund: kein Tacho im Spiel.
//   S — DIE STIMME: im Sattel klingt die Fahrt — ihre Quellen gebaut im Gesetzbuch (klang-core, `fahrtStimme`), der
//     Motor-Ton (das Frequenz-Ziel der Quelle, abgegriffen) folgt dem Tempo nach klang:FAHRT (±1 %, Spanne ≥ 100 Hz),
//     nach dem Absteigen schweigen alle Quellen. Befund: Fahren stumm.
//   H — DIE TASTEN: „hilfe" nennt die Fahr-Tasten, die die Eingabe liest (E steigt ein — die P-Fahrt drückt sie wirklich;
//     Shift ist die Handbremse — die Linse zieht sie in Fahrt: sie kommt im Fahr-Schritt des Kerns als e.hand an, und der
//     Wagen verliert mehr Tempo als ohne). Befund: E und die Handbremse fehlen.
//   SCHMUGGEL (im selben Boot, an der echten Stelle): die Vorschau ohne das Platz-Gesetz des Stamms — sie muss ROT sein,
//     beim Namen.
//   --selftest (Node, ohne Welt): jedes Urteil nennt seinen eingeschmuggelten Täter; der Kern mit dem alten Rückwärts-
//     Antrieb fällt in K.
//
//   node scripts/diag-fahr-bahn.cjs [--selftest]          Port: FAHR_BAHN_PORT (Standard 4633)
// Exit: 0 grün · 1 rot · 2 Skript-Fehler.
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.FAHR_BAHN_PORT || 4633);
const root = path.resolve(__dirname, "..");
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
};

const errs = [];
function check(name, ok, detail) {
    console.log(`  ${ok ? "✅" : "❌"} ${name}${detail ? " — " + detail : ""}`);
    if (!ok) errs.push(name);
}

// ── DIE SOLL-ZAHLEN (eine Tafel; die Urteile lesen nur sie) ──
const SOLL = {
    befreiungM: 1, // K und B: so weit kommt der Wagen in 1,3 s rückwärts frei
    befreiungFrames: 78, // 1,3 s bei 60 Hz (die Befreiung der Schau)
    hangGrad: [0, 10, 15], // K: rückwärts bergauf
    vorM: 2, // P: W 2 s
    zurueckM: 1.5, // P: S 2 s
    neigungGrad: 30, // P: die Rad-Ebene
    tachoKmh: 1, // T: Anzeige gegen |vlong| × FAHR.kmh (Rundung)
};

// ── DIE URTEILE (rein; Browser-Probe UND Selbst-Test). Rückgabe: die Täter beim Namen. ──
function kVerdict(rows) {
    const out = [];
    if (!Array.isArray(rows) || rows.length === 0) return ["kein Kern-Lauf"];
    for (const z of rows)
        if (!(z.weg >= SOLL.befreiungM))
            out.push(`${z.rezept} ${z.art} ${z.grad}°: ${z.weg.toFixed(2)} m (${z.vMinKmh.toFixed(1)} km/h)`);
    return out;
}
function pVerdict(m) {
    if (!m || !m.da) return [m && m.grund ? m.grund : "kein Wagen"];
    const out = [];
    if (!(m.neigung <= SOLL.neigungGrad))
        out.push(`Neigung ${m.neigung.toFixed(0)}° (steig ${m.steig.toFixed(0)}°, wank ${m.wank.toFixed(0)}°)`);
    if (m.waende > 0) out.push(`${m.waende} Wände im Umriss`);
    if (m.blocker > 0) out.push(`${m.blocker} Blocker im Band (${m.blockerNamen.join(", ")})`);
    if (!m.eingestiegen) out.push("E steigt nicht ein");
    else {
        if (!(m.vor >= SOLL.vorM)) out.push(`W 2 s ${m.vor.toFixed(2)} m`);
        if (!(m.zurueck >= SOLL.zurueckM)) out.push(`S 2 s ${m.zurueck.toFixed(2)} m`);
        if (!m.ausgestiegen) out.push("E steigt nicht aus");
    }
    return out;
}
function bVerdict(m) {
    if (!m || !m.da) return [m && m.grund ? m.grund : "keine Station"];
    const out = [];
    if (!m.stoss) out.push("kein Stoß am Glutbrunnen");
    for (const v of m.versuche || [])
        if (!(v.zurueck >= SOLL.befreiungM))
            out.push(`Befreiung ${v.seite}: ${v.zurueck.toFixed(2)} m (${v.vMinKmh.toFixed(1)} km/h)`);
    if (!m.versuche || m.versuche.length === 0) out.push("keine Befreiung");
    return out;
}
function tVerdict(m) {
    if (!m) return ["keine Probe"];
    const out = [];
    if (!m.element) return ["kein Tacho im Spiel (#fahr-tacho fehlt)"];
    if (!(m.proben > 0)) out.push("keine Probe im Sattel");
    if (m.unsichtbar > 0) out.push(`im Sattel unsichtbar in ${m.unsichtbar}/${m.proben} Proben`);
    if (m.falsch > 0) out.push(`${m.falsch}/${m.proben} Proben ≠ |vlong| × FAHR.kmh (${m.beispiel})`);
    if (!(m.maxKmh >= 20)) out.push(`Fahrt zu langsam für die Probe (${m.maxKmh} km/h)`);
    if (m.nachAbsteigenSichtbar) out.push("nach dem Absteigen noch sichtbar");
    return out;
}
function sVerdict(m) {
    if (!m) return ["keine Probe"];
    if (!m.symphonie) return ["keine Symphonie (AudioContext)"];
    const out = [];
    if (!(m.quellen > 0)) return ["Fahren stumm (keine Quelle aus klang-core fahrtStimme)"];
    if (m.fremd > 0) out.push(`${m.fremd} Quellen der Fahrt außerhalb des Gesetzbuchs`);
    if (!(m.hzSpanne >= 100)) out.push(`Motor-Ton folgt dem Tempo nicht (Spanne ${m.hzSpanne} Hz über ${m.proben} Proben)`);
    if (m.abweichend > 0) out.push(`${m.abweichend}/${m.proben} Proben ≠ klang:FAHRT (${m.beispiel})`);
    if (m.laufendNachAb > 0) out.push(`${m.laufendNachAb} Quellen klingen nach dem Absteigen`);
    return out;
}
function hVerdict(m) {
    if (!m || !Array.isArray(m.zeilen)) return ["keine Hilfe"];
    const t = m.zeilen.join("\n");
    const out = [];
    if (!/\bE\b[^·\n]*(einsteig|aussteig)/i.test(t)) out.push("E (einsteigen) fehlt in der Hilfe");
    if (!/\bShift\b[^·\n]*Handbremse/i.test(t)) out.push("Shift (Handbremse) fehlt in der Hilfe");
    if (!m.handbremseWirkt) out.push(`Shift kommt im Fahr-Schritt nicht als Handbremse an (${m.handbremseDetail || "?"})`);
    return out;
}

// ── DER KERN SELBST (Node): die Befreiung je Rezept, eben und rückwärts bergauf. ──
function kernBefreiung(VC) {
    const DT = 1 / 60;
    const rows = [];
    for (const rezept of Object.keys(VC.PRESETS)) {
        const P = Object.assign({}, VC.DEFAULT_P, VC.presetPatch(rezept));
        const G = VC.fahrGesetz(VC.exportDrive(P));
        if (!G) {
            rows.push({ rezept, art: "kein Fahr-Satz", grad: 0, weg: 0, vMinKmh: 0 });
            continue;
        }
        for (const grad of SOLL.hangGrad) {
            const t = Math.tan((grad * Math.PI) / 180);
            const boden = (x) => -x * t; // rückwärts (−x) bergauf
            for (const [art, e] of [
                ["S + Gegenlenkung", { brake: 1, steer: 1 }],
                ["S + Gegenlenkung rechts", { brake: 1, steer: -1 }],
                ["S", { brake: 1 }],
            ]) {
                const z = VC.fahrZustand(0, 0, 0);
                VC.fahrStand(z, G, boden, 0);
                let vMin = 0;
                for (let i = 0; i < SOLL.befreiungFrames; i++) {
                    VC.fahrSchritt(z, e, G, boden, DT);
                    vMin = Math.min(vMin, z.vlong);
                }
                rows.push({ rezept, art, grad, weg: Math.hypot(z.x, z.z), vMinKmh: vMin * 3.6 });
            }
        }
    }
    return rows;
}

// ── DIE PROBE IN DER SEITE (Funktionsrumpf; ein Boot, alle Phasen). ──
async function probe(SOLL) {
    const out = { log: [] };
    const sleep = (ms) => new Promise((res) => setTimeout(res, ms));
    const dl0 = performance.now() + 120000;
    while ((!window.anazhRealm || typeof window.anazhRealm._gameLoopTick !== "function") && performance.now() < dl0)
        await sleep(100);
    const r = window.anazhRealm;
    const st = r.state;
    const VC = window.__vehicleCore;
    const f = r._ensureAssetFoundry();
    const dl = performance.now() + 90000;
    while (performance.now() < dl) {
        if (f && f.ready && f.recipes && st.blueprints && st.blueprints.fahrzeug_gt) break;
        await sleep(100);
    }
    if (!(st.blueprints && st.blueprints.fahrzeug_gt)) return { err: "Buch ohne fahrzeug_gt" };
    // DER TAKT: echte Frames (`_gameLoopTick`), feste Schritte — die Zahl der Frames ist die Uhr.
    let tMs = performance.now();
    const frame = () => {
        tMs += 1000 / 60;
        r._gameLoopTick(tMs);
    };
    // DIE TASTEN: echte Tastatur-Ereignisse über den Hörer des Spiels (der Ladeschirm des Null-Renderers ist fort).
    const TASTE = {
        w: { key: "w", code: "KeyW" },
        s: { key: "s", code: "KeyS" },
        a: { key: "a", code: "KeyA" },
        d: { key: "d", code: "KeyD" },
        shift: { key: "Shift", code: "ShiftLeft" },
        e: { key: "e", code: "KeyE" },
    };
    const gehalten = new Set();
    const halte = (liste) => {
        const soll = new Set(liste);
        for (const k of Array.from(gehalten))
            if (!soll.has(k)) {
                window.dispatchEvent(new KeyboardEvent("keyup", Object.assign({ bubbles: true }, TASTE[k])));
                gehalten.delete(k);
            }
        for (const k of soll)
            if (!gehalten.has(k)) {
                window.dispatchEvent(new KeyboardEvent("keydown", Object.assign({ bubbles: true }, TASTE[k])));
                gehalten.add(k);
            }
    };
    const tippe = (k) => {
        window.dispatchEvent(new KeyboardEvent("keydown", Object.assign({ bubbles: true }, TASTE[k])));
        window.dispatchEvent(new KeyboardEvent("keyup", Object.assign({ bubbles: true }, TASTE[k])));
    };
    const boden = (a, b) => r.getTerrainHeightAt(a, b);
    const stelle = (x, z) => {
        st.playerMesh.position.set(x, boden(x, z) + 1.8, z);
        if (st.playerVel) st.playerVel.setValue(0, 0, 0);
        st._fieldVy = 0;
        for (let i = 0; i < 20; i++) frame();
    };
    const gebaut = async (e) => {
        for (let i = 0; i < 60 && e && !e.instanced && !e.mesh; i++) {
            r._rebuildArchitectureMesh(e);
            await sleep(50);
        }
    };
    const fahrtGier = (e) => (Number.isFinite(e.rotationY) ? e.rotationY : 0) + Math.PI / 2; // Studio-Wagen: Bug +x

    // ── DIE MESSUNG DES PLATZES (unabhängig vom Platz-Gesetz des Stamms): Ebene, Wände, Blocker. ──
    const platzMessung = (e) => {
        const prof = r._vehicleProfile(e);
        const G = r._fahrSatz(e, prof);
        const fzg = r._fahrzeugGesetzFor(e);
        const h = fzg && fzg.drive && fzg.drive.huelle;
        if (!G || !h) return { da: false, grund: "kein Fahr-Gesetz am Wagen" };
        const sc = Number.isFinite(e.scale) ? e.scale : 1;
        const bug = h.noseX * sc;
        const heck = h.tailX * sc;
        const hw = h.bw * sc;
        const dach = (Number.isFinite(h.yRoof) ? h.yRoof : 1.3) * sc;
        const stufe = VC.FAHR.schritt.stufeRad * G.radR;
        const ry = fahrtGier(e);
        const x = e.position.x;
        const z = e.position.z;
        const eb = VC.fahrEbene(G, boden, x, z, ry - Math.PI / 2);
        if (!eb) return { da: false, grund: "keine Ebene unter dem Wagen" };
        const fX = Math.sin(ry);
        const fZ = Math.cos(ry);
        const qX = Math.cos(ry);
        const qZ = -Math.sin(ry);
        const tS = Math.tan(eb.steig);
        const tW = Math.tan(eb.wank);
        // die Ebene im Wagen-Rahmen: steig > 0 Bug höher (längs l), wank > 0 die linke Flanke (cos, −sin) höher (quer q)
        const ebeneY = (l, q) => eb.y + tS * l + tW * q;
        // Wände: was der Kontakt der Hülle als Wand nimmt — Feld über Ebene + Rad-Stufe mit einer Fläche steiler als die
        // Ebenen-Klammer des Kerns (FAHR.schritt.ebeneMax), oder Feld auf Brust-Höhe (min(Dach, 1,2 m)).
        let waende = 0;
        const nrm = {};
        const steilY = Math.cos(VC.FAHR.schritt.ebeneMax);
        const brust = Math.min(dach, 1.2);
        for (let i = 0; i <= 4; i++) {
            const l = heck + ((bug - heck) * i) / 4;
            for (const q of [-hw, 0, hw]) {
                const px = x + l * fX + q * qX;
                const pz = z + l * fZ + q * qZ;
                const ctx = r._terrainColumnContext(px, pz);
                const yS = ebeneY(l, q) + stufe + 0.02;
                let wand = false;
                if (r._fieldSolid(px, yS, pz, ctx)) {
                    r._fieldGradient(px, yS, pz, nrm);
                    wand = !(nrm.mag > 1e-6) || nrm.y < steilY;
                }
                if (wand || r._fieldSolid(px, ebeneY(l, q) + brust, pz, ctx)) waende++;
            }
        }
        // Blocker: das Rechteck der Hülle gegen jede Box (gedreht: ihre obb) im Band Ebene + Stufe … Dach.
        const mitte = (bug + heck) / 2;
        const hl = (bug - heck) / 2;
        const cx = x + fX * mitte;
        const cz = z + fZ * mitte;
        const unten = eb.y + stufe;
        const oben = eb.y + dach;
        let blocker = 0;
        const namen = new Set();
        for (const a of st.architectures) {
            if (!a || a === e || !a.blockerAABBs || !a.position) continue;
            if (Math.abs(a.position.x - x) > 30 || Math.abs(a.position.z - z) > 30) continue;
            for (const b of a.blockerAABBs) {
                if (!(b.topY > unten && b.botY < oben)) continue;
                if (b.dick < stufe) continue; // ein Trieb dünner als die Rad-Stufe wird überrollt (`_stepCharacterStructures`)
                const ob = b.obb;
                const b1 = ob ? [ob.c, -ob.s] : [1, 0];
                const b2 = ob ? [ob.s, ob.c] : [0, 1];
                const ex = ob ? ob.hx : (b.maxX - b.minX) / 2;
                const ez = ob ? ob.hz : (b.maxZ - b.minZ) / 2;
                const dx = cx - (ob ? ob.cx : (b.minX + b.maxX) / 2);
                const dz = cz - (ob ? ob.cz : (b.minZ + b.maxZ) / 2);
                let getrennt = false;
                for (const u of [b1, b2, [fX, fZ], [qX, qZ]]) {
                    const rO = hl * Math.abs(fX * u[0] + fZ * u[1]) + hw * Math.abs(qX * u[0] + qZ * u[1]);
                    const rA = ex * Math.abs(b1[0] * u[0] + b1[1] * u[1]) + ez * Math.abs(b2[0] * u[0] + b2[1] * u[1]);
                    if (Math.abs(dx * u[0] + dz * u[1]) >= rO + rA) {
                        getrennt = true;
                        break;
                    }
                }
                if (!getrennt) {
                    blocker++;
                    namen.add(a.type);
                }
            }
        }
        const neigung = (Math.atan(Math.hypot(tS, tW)) * 180) / Math.PI;
        return {
            da: true,
            x: +x.toFixed(2),
            z: +z.toFixed(2),
            neigung,
            steig: (eb.steig * 180) / Math.PI,
            wank: (eb.wank * 180) / Math.PI,
            waende,
            blocker,
            blockerNamen: Array.from(namen),
        };
    };
    // ── DIE PROBE-FAHRT: E (echte Taste, Reichweite des Spiels), W 2 s, S 2 s, E. ──
    const probeFahrt = (e, m) => {
        const pos = () => ({ x: e.position.x, z: e.position.z });
        const ry = fahrtGier(e);
        // der Spieler steht 1,5 m neben der Flanke (in Reichweite, nie im Wagen)
        stelle(e.position.x + Math.cos(ry) * 1.5, e.position.z - Math.sin(ry) * 1.5);
        tippe("e");
        frame();
        m.eingestiegen = st.player.mountedArch === e.id;
        if (!m.eingestiegen) return m;
        for (let i = 0; i < 12; i++) frame();
        const p0 = pos();
        const P_ = Object.getPrototypeOf(r);
        m.dbg = [];
        let stops = 0;
        r._wandGleiten = function (x0, z0, vx, vz, dt, w, aus) {
            const res = P_._wandGleiten.call(this, x0, z0, vx, vz, dt, w, aus);
            if ((vx || vz) && res.vx === 0 && res.vz === 0) stops++;
            return res;
        };
        r._fahrHuelleKontakt = function (entry, k, x0, z0, vx, vz, dt, meldet) {
            const res = P_._fahrHuelleKontakt.call(this, entry, k, x0, z0, vx, vz, dt, meldet);
            if (entry === e && m.dbg.length < 10) m.dbg.push([+Math.hypot(vx, vz).toFixed(2), +Math.hypot(res.vx, res.vz).toFixed(2), k.schubQuelle.map((q) => (q ? q.type || q.name || "leib" : "starr")).join(","), stops, +e._fahr.y.toFixed(2), +(e._fahr.steig * 57.3).toFixed(1), e._fahr.luft].join(" "));
            return res;
        };
        halte(["w"]);
        for (let i = 0; i < 120; i++) frame();
        delete r._wandGleiten;
        delete r._fahrHuelleKontakt;
        m.dbgStops = stops;
        halte([]);
        const p1 = pos();
        m.vor = Math.hypot(p1.x - p0.x, p1.z - p0.z);
        for (let i = 0; i < 60; i++) frame(); // ausrollen
        const p2 = pos();
        halte(["s"]);
        for (let i = 0; i < 120; i++) frame();
        halte([]);
        const p3 = pos();
        m.zurueck = Math.hypot(p3.x - p2.x, p3.z - p2.z);
        for (let i = 0; i < 30; i++) frame();
        tippe("e");
        frame();
        m.ausgestiegen = st.player.mountedArch == null;
        return m;
    };
    const wagenWeg = (e) => {
        if (!e) return;
        if (st.player.mountedArch === e.id) r.dismountArchitecture();
        r.removeArchitecture(e);
    };

    // ════ P1 — DIE VORSCHAU AM GARAGE-TOR (der Ort-Takt des Genesis-Rings: Stamm-Methoden) ════
    const M = r._genesisMitte();
    stelle(M.x, M.z);
    const vorschau = async () => {
        const dlV = performance.now() + 30000;
        let e = null;
        while (performance.now() < dlV) {
            r._genesisPortalRing(st.playerMesh.position);
            r._portalApproachPrefetch(st.playerMesh.position);
            e = st.architectures.find((a) => a && a.id === "portal-preview-garage");
            if (e) break;
            await sleep(100);
        }
        return e;
    };
    let ev = await vorschau();
    if (ev) {
        const q = st.pendingVegSpawns || [];
        out.dbgPending = q.filter((t) => t && t.position && Math.hypot(t.position.x - ev.position.x, t.position.z - ev.position.z) < 12).map((t) => t.name + "@" + t.position.x.toFixed(1) + "," + t.position.z.toFixed(1));
        out.dbgPendingN = q.length;
        out.dbgBaeume = st.architectures.filter((a) => a && /^baum_|^busch_/.test(a.type) && Math.hypot(a.position.x - ev.position.x, a.position.z - ev.position.z) < 12).map((a) => a.type + "@" + a.position.x.toFixed(1) + "," + a.position.z.toFixed(1));
        out.dbgChunks = st.voxelChunks ? st.voxelChunks.size : -1;
    }
    out.p1 = ev ? platzMessung(ev) : { da: false, grund: "keine Vorschau am Garage-Tor" };
    if (ev) {
        await gebaut(ev);
        probeFahrt(ev, out.p1);
    }
    if (ev) out.dbgBaeumeNach = st.architectures.filter((a) => a && /^baum_|^busch_/.test(a.type) && Math.hypot(a.position.x - ev.position.x, a.position.z - ev.position.z) < 12).map((a) => a.type + "@" + a.position.x.toFixed(1) + "," + a.position.z.toFixed(1));
    const garage = st.architectures.find((a) => a && a.type === "welt_garage");

    // ════ P2 — „bau mir einen gt" am Garage-Tor, der Blick hinaus auf den Fels ════
    if (garage) {
        const gx = garage.position.x;
        const gz = garage.position.z;
        const len = Math.hypot(gx - M.x, gz - M.z) || 1;
        const ux = (gx - M.x) / len;
        const uz = (gz - M.z) / len;
        stelle(gx - ux * 2, gz - uz * 2);
        st.yaw = Math.atan2(-ux, -uz); // Blick hinaus (die Vorwärts-Richtung des Spiels: (−sin yaw, −cos yaw))
        st.pitch = 0;
        const vorher = new Set(st.architectures.filter((a) => a && a.type === "fahrzeug_gt").map((a) => a.id));
        r.processChatCommand("bau mir einen gt");
        for (let i = 0; i < 5; i++) frame();
        const e2 = st.architectures.find((a) => a && a.type === "fahrzeug_gt" && !vorher.has(a.id));
        out.p2 = e2 ? platzMessung(e2) : { da: false, grund: "der Satz baute keinen GT" };
        if (e2) {
            await gebaut(e2);
            probeFahrt(e2, out.p2);
            wagenWeg(e2);
        }
    } else out.p2 = { da: false, grund: "kein Garage-Tor im Ring" };

    // ════ SCHMUGGEL P — die Vorschau OHNE das Platz-Gesetz des Stamms (an derselben Stelle): muss ROT sein ════
    {
        const altVorschau = st.architectures.find((a) => a && a.id === "portal-preview-garage");
        wagenWeg(altVorschau);
        const neuVorschau = () => {
            if (st.worldMeta) st.worldMeta.portalPreviewGarage = false;
            if (r._portalPreviewFertig) r._portalPreviewFertig.garage = false;
        };
        neuVorschau();
        const P = Object.getPrototypeOf(r);
        const hatGesetz = typeof P._fahrPlatzSuche === "function";
        if (hatGesetz) r._fahrPlatzSuche = function () {};
        stelle(M.x, M.z);
        const e3 = await vorschau();
        out.schmuggelP = e3 ? platzMessung(e3) : { da: false, grund: "keine Vorschau" };
        if (e3) {
            await gebaut(e3);
            probeFahrt(e3, out.schmuggelP);
        }
        out.schmuggelP.gesetzStub = hatGesetz;
        delete r._fahrPlatzSuche;
        wagenWeg(e3);
        neuVorschau();
        // die Vorschau des Spiels zurück (mit Gesetz)
        stelle(M.x, M.z);
        await vorschau();
    }

    // ════ B + T + S + H — DER STOSS, DIE BEFREIUNG, TACHO, STIMME, HANDBREMSE (die Stelle der Schau) ════
    // Die Symphonie (der echte Weg: initSymphony, Kopf ohne Geste dank --autoplay-policy).
    let symphonie = false;
    try {
        symphonie = !!r.initSymphony();
    } catch (e) {
        out.log.push("initSymphony: " + (e && e.message));
    }
    const Q = window.__fahrQuellen || [];
    const bStation = async (rueckAntrieb) => {
        const m = { da: false, versuche: [] };
        const sx = -875;
        const sz = -732;
        const tx = -765;
        const tz = -752;
        const fahrt = Math.atan2(tx - sx, tz - sz);
        const fX = Math.sin(fahrt);
        const fZ = Math.cos(fahrt);
        stelle(sx - Math.cos(fahrt) * 1.5, sz + Math.sin(fahrt) * 1.5);
        // DER GLUTBRUNNEN der Schau steht 4,4 m vor dem Bug; fehlt er in dieser Welt, setzt die Station ihn (Fixture).
        let glut = st.architectures.find(
            (a) =>
                a &&
                a.type === "glutbrunnen" &&
                Math.abs((a.position.x - sx) * fZ - (a.position.z - sz) * fX) < 1.2 &&
                (a.position.x - sx) * fX + (a.position.z - sz) * fZ > 2 &&
                (a.position.x - sx) * fX + (a.position.z - sz) * fZ < 7
        );
        let fixture = null;
        if (!glut) {
            const gx = sx + fX * 4.4;
            const gz = sz + fZ * 4.4;
            fixture = glut = r.spawnArchitecture(
                "glutbrunnen",
                { x: gx, y: boden(gx, gz) + 0.5, z: gz },
                { silent: true, precise: true, id: "fahr-bahn-glut" }
            );
        }
        m.glut = glut ? { id: glut.id, fixture: !!fixture } : null;
        const e = r.spawnArchitecture(
            "fahrzeug_gt",
            { x: sx, y: boden(sx, sz) + 0.5, z: sz },
            { silent: true, precise: true, rotationY: fahrt - Math.PI / 2, id: "fahr-bahn-gt" }
        );
        if (!e) {
            m.grund = "kein GT an der Stelle der Schau";
            return m;
        }
        await gebaut(e);
        tippe("e");
        frame();
        if (st.player.mountedArch !== e.id) {
            m.grund = "E steigt an der Stelle der Schau nicht ein";
            wagenWeg(e);
            return m;
        }
        for (let i = 0; i < 12; i++) frame();
        const kern = VC.FAHR.schritt;
        const rueckAlt = kern.rueckAntrieb;
        if (Number.isFinite(rueckAntrieb)) kern.rueckAntrieb = rueckAntrieb;
        // der Stoß: Gas gegen den Glutbrunnen, bis der Wagen steht (höchstens 3 s), dann 0,5 s drücken
        let stoss = false;
        halte(["w"]);
        for (let i = 0; i < 180; i++) {
            frame();
            if (e._fahr && e._fahr.vlong < 0.3 && i > 20) {
                stoss = true;
                break;
            }
        }
        for (let i = 0; i < 30; i++) frame();
        m.stoss = stoss;
        for (const [seite, lenk] of [
            ["mit A", "a"],
            ["mit D", "d"],
        ]) {
            // zurück an den Glutbrunnen (W bis zum Stand), dann die Befreiung der Schau
            halte(["w"]);
            for (let i = 0; i < 150; i++) {
                frame();
                if (e._fahr && Math.abs(e._fahr.vlong) < 0.3 && i > 30) break;
            }
            halte([]);
            for (let i = 0; i < 10; i++) frame();
            const p0 = { x: e.position.x, z: e.position.z };
            let vMin = 0;
            halte(["s", lenk]);
            for (let i = 0; i < 78; i++) {
                frame();
                if (e._fahr) vMin = Math.min(vMin, e._fahr.vlong);
            }
            halte([]);
            m.versuche.push({
                seite,
                zurueck: Math.hypot(e.position.x - p0.x, e.position.z - p0.z),
                vMinKmh: vMin * 3.6,
            });
            for (let i = 0; i < 30; i++) frame();
        }
        kern.rueckAntrieb = rueckAlt;
        m.da = true;
        m.e = e;
        m.fixture = fixture;
        return m;
    };
    // B (das Spiel, wie es ist)
    const b = await bStation(null);
    out.b = Object.assign({}, b, { e: undefined, fixture: undefined });
    if (b.e) wagenWeg(b.e);
    if (b.fixture) r.removeArchitecture(b.fixture);

    // ════ T + S + H — DIE FAHRT AUF DER MESS-WIESE (die Vollgas-Gerade der Schau, Kurs 127,7°): gemessen werden Tacho,
    // Stimme und Handbremse, nie der Wald — die Bahn-Wache räumt die Gerade (70 × 12 m) vor und während der Fahrt. ════
    const tacho = { element: !!document.getElementById("fahr-tacho"), proben: 0, unsichtbar: 0, falsch: 0, maxKmh: 0 };
    const stimme = { symphonie, quellen: 0, fremd: 0, proben: 0, hzSpanne: 0, abweichend: 0, laufendNachAb: 0 };
    const hilfe = { zeilen: [], handbremseWirkt: false };
    {
        const sx = -909.82;
        const sz = -851.89;
        const fahrt = (127.7 * Math.PI) / 180;
        const ux = Math.sin(fahrt);
        const uz = Math.cos(fahrt);
        let geraeumt = 0;
        const raeume = () => {
            for (const a of st.architectures.slice()) {
                if (!a || !a.blockerAABBs || !a.position || /^fahrzeug_/.test(a.type || "")) continue;
                const dx = a.position.x - sx;
                const dz = a.position.z - sz;
                const l = dx * ux + dz * uz;
                if (l > -8 && l < 70 && Math.abs(dx * uz - dz * ux) < 6) {
                    r.removeArchitecture(a);
                    geraeumt++;
                }
            }
        };
        stelle(sx - Math.cos(fahrt) * 1.5, sz + Math.sin(fahrt) * 1.5);
        raeume();
        const e = r.spawnArchitecture(
            "fahrzeug_gt",
            { x: sx, y: boden(sx, sz) + 0.5, z: sz },
            { silent: true, precise: true, rotationY: fahrt - Math.PI / 2, id: "fahr-bahn-fahrt" }
        );
        if (e) {
            await gebaut(e);
            tippe("e");
            frame();
        }
        if (e && st.player.mountedArch === e.id) {
            const takt = (n, jede) => {
                for (let i = 0; i < n; i++) {
                    const vVor = e._fahr ? e._fahr.vlong : 0;
                    frame();
                    if (i % 15 === 0) raeume();
                    if (jede) jede(i, vVor);
                }
            };
            takt(12);
            const tachoProbe = () => {
                const el = document.getElementById("fahr-tacho");
                if (!el || !e._fahr) return;
                tacho.proben++;
                const sichtbar = !el.hidden && getComputedStyle(el).display !== "none";
                if (!sichtbar) tacho.unsichtbar++;
                const zahl = Number(((el.querySelector("[data-kmh]") || el).textContent.match(/-?\d+/) || [NaN])[0]);
                const soll = Math.round(Math.abs(e._fahr.vlong) * VC.FAHR.kmh);
                tacho.maxKmh = Math.max(tacho.maxKmh, soll);
                if (!(Math.abs(zahl - soll) <= SOLL.tachoKmh)) {
                    tacho.falsch++;
                    if (!tacho.beispiel) tacho.beispiel = `zeigt ${zahl}, Fahrt ${soll} km/h`;
                }
            };
            // die Motor-Quelle der Fahrt (Abgriff: Quellen, deren Stapel klang-core fahrtStimme trägt): ihr Frequenz-Ziel
            const motorHz = () => {
                const osc = Q.find((q) => q.fahrt && !q.gestoppt && q.art === "createOscillator");
                return osc && osc.knoten.frequency && Number.isFinite(osc.knoten.frequency.__ziel)
                    ? +osc.knoten.frequency.__ziel.toFixed(1)
                    : null;
            };
            // die Stimme gegen das Gesetz: je Probe der Motor-Ton (Frequenz-Ziel der Quelle) gegen klang:FAHRT zum Tempo und
            // den Deckeln des Fahr-Satzes (der Wirt reicht nur die Lage)
            const KC = window.__klangCore;
            let hzMin = Infinity;
            let hzMax = -Infinity;
            // Der Klang-Takt des Frames liest den Fahr-Zustand vor oder nach dem Sim-Schritt desselben Frames: das Gesetz zu
            // einem der beiden Tempi zählt.
            const stimmProbe = (vVor) => {
                const hz = motorHz();
                if (hz === null || !e._fahr || !e._fahrSatz) return;
                stimme.proben++;
                hzMin = Math.min(hzMin, hz);
                hzMax = Math.max(hzMax, hz);
                const vmax = e._fahrSatz.vmax;
                const gesetz = (v) =>
                    KC && typeof KC.fahrtMischung === "function"
                        ? KC.fahrtMischung({ v, vmax, rueckVmax: vmax * VC.FAHR.schritt.rueckVmax }).motorHz
                        : NaN;
                const passt = (soll) => Math.abs(hz - soll) <= 0.01 * soll + 0.1;
                const soll = gesetz(e._fahr.vlong);
                if (!passt(soll) && !passt(gesetz(vVor))) {
                    stimme.abweichend++;
                    if (!stimme.beispiel)
                        stimme.beispiel = `${(e._fahr.vlong * 3.6).toFixed(0)} km/h: ${hz} Hz, Gesetz ${Number(soll).toFixed(1)} Hz`;
                }
            };
            halte(["w"]);
            takt(150, (i, vVor) => {
                if (i % 10 === 0) {
                    tachoProbe();
                    stimmProbe(vVor);
                }
            });
            stimme.hzSpanne = stimme.proben ? +(hzMax - hzMin).toFixed(1) : 0;
            // DIE HANDBREMSE: was die Taste Shift im Fahr-Schritt des Kerns ankommen lässt (Beobachtungs-Punkt: der Aufruf
            // vc.fahrKraefte mit dem Zustand DIESES Wagens, die Eingabe e.hand) — je 0,5 s ohne Gas, ohne und mit Shift — und
            // die Wirkung: der Tempo-Verlust in derselben Zeit (aus 1 s Gas).
            const kraefte = VC.fahrKraefte;
            let zaehle = null;
            VC.fahrKraefte = function (zf, ein) {
                if (zaehle && zf === e._fahr) {
                    zaehle.schritte++;
                    if (ein && ein.hand) zaehle.hand++;
                }
                return kraefte.apply(this, arguments);
            };
            const auslauf = (mitShift) => {
                halte(["w"]);
                takt(60);
                const v0 = e._fahr ? Math.abs(e._fahr.vlong) : 0;
                zaehle = { schritte: 0, hand: 0 };
                halte(mitShift ? ["shift"] : []);
                takt(30);
                const z = zaehle;
                zaehle = null;
                const v1 = e._fahr ? Math.abs(e._fahr.vlong) : 0;
                return { v0, v1, verlust: v0 - v1, schritte: z.schritte, hand: z.hand };
            };
            const ohne = auslauf(false);
            const mit = auslauf(true);
            VC.fahrKraefte = kraefte;
            hilfe.handbremseWirkt = mit.schritte > 0 && mit.hand >= 0.9 * mit.schritte && ohne.hand === 0;
            hilfe.handbremseDetail = `Shift im Fahr-Schritt ${mit.hand}/${mit.schritte} (ohne ${ohne.hand}/${ohne.schritte}) · 0,5 s ohne Gas aus ${(ohne.v0 * 3.6).toFixed(0)} / ${(mit.v0 * 3.6).toFixed(0)} km/h: Verlust ohne ${ohne.verlust.toFixed(2)} · mit Shift ${mit.verlust.toFixed(2)} m/s`;
            halte([]);
            stimme.quellen = Q.filter((q) => q.fahrt).length;
            stimme.fremd = Q.filter((q) => q.fahrtFremd).length;
            // absteigen: Tacho fort, Stimme still
            takt(60);
            tippe("e");
            takt(10);
            const el = document.getElementById("fahr-tacho");
            tacho.nachAbsteigenSichtbar = !!el && !el.hidden && getComputedStyle(el).display !== "none";
            stimme.laufendNachAb = Q.filter((q) => q.fahrt && !q.gestoppt).length;
        } else out.log.push("Fahrt-Station: E steigt nicht ein");
        out.log.push(`Fahrt-Station: Bahn geräumt ${geraeumt}`);
        wagenWeg(e);
    }
    hilfe.zeilen = typeof r._hilfeZeilen === "function" ? r._hilfeZeilen() : [];
    out.t = tacho;
    out.s = stimme;
    out.h = hilfe;

    return out;
}

// DER QUELLEN-ABGRIFF (vor jedem Seiten-Skript): jede Quelle mit ihrem Stapel; die Quellen der Fahrt (Stapel mit
// `fahrtStimme`) und ihre Frequenz-Ziele (die letzte Automation des AudioParam), ihr Stop.
function quellenAbgriff() {
    if (window.__fahrQuellen) return;
    const Q = (window.__fahrQuellen = []);
    const proto = window.BaseAudioContext && BaseAudioContext.prototype;
    if (!proto) return;
    const AP = AudioParam.prototype;
    for (const m of ["setValueAtTime", "setTargetAtTime", "linearRampToValueAtTime", "exponentialRampToValueAtTime"]) {
        const org = AP[m];
        AP[m] = function (v) {
            this.__ziel = v;
            return org.apply(this, arguments);
        };
    }
    const setV = Object.getOwnPropertyDescriptor(AP, "value");
    Object.defineProperty(AP, "value", {
        get() {
            return setV.get.call(this);
        },
        set(v) {
            this.__ziel = v;
            setV.set.call(this, v);
        },
    });
    for (const art of ["createOscillator", "createBufferSource", "createConstantSource"]) {
        const org = proto[art];
        proto[art] = function () {
            const knoten = org.apply(this, arguments);
            const stapel = (new Error().stack || "").split("\n").slice(2, 8).join(" | ");
            const fahrt = /fahrtStimme/.test(stapel);
            const q = {
                art,
                knoten,
                fahrt: fahrt && /klang-core\.js/.test(stapel),
                fahrtFremd: fahrt && !/klang-core\.js/.test(stapel),
                gestoppt: false,
            };
            if (knoten.frequency) knoten.frequency.__ziel = knoten.frequency.value;
            const stop = knoten.stop;
            knoten.stop = function () {
                q.gestoppt = true;
                return stop.apply(this, arguments);
            };
            Q.push(q);
            return knoten;
        };
    }
}

const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, decodeURIComponent(p));
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

function zeileP(m) {
    if (!m || !m.da) return (m && m.grund) || "—";
    return (
        `bei (${m.x}, ${m.z}) · Neigung ${m.neigung.toFixed(1)}° (steig ${m.steig.toFixed(0)}°, wank ${m.wank.toFixed(0)}°) · ` +
        `Wände ${m.waende} · Blocker ${m.blocker} · W 2 s ${m.vor != null ? m.vor.toFixed(2) : "—"} m · ` +
        `S 2 s ${m.zurueck != null ? m.zurueck.toFixed(2) : "—"} m`
    );
}

async function selbstTest() {
    console.log("=== SELBST-TEST — jedes Urteil nennt seinen eingeschmuggelten Täter ===");
    const gut = {
        p: { da: true, neigung: 8, steig: 5, wank: 6, waende: 0, blocker: 0, blockerNamen: [], eingestiegen: true, vor: 9, zurueck: 4, ausgestiegen: true },
        b: { da: true, stoss: true, versuche: [{ seite: "mit A", zurueck: 3, vMinKmh: -15 }] },
        t: { element: true, proben: 10, unsichtbar: 0, falsch: 0, maxKmh: 40, nachAbsteigenSichtbar: false },
        s: { symphonie: true, quellen: 3, fremd: 0, proben: 15, hzSpanne: 300, abweichend: 0, laufendNachAb: 0 },
        h: { zeilen: ["Fahren: E einsteigen / aussteigen · W/S Gas / Bremse · Shift Handbremse"], handbremseWirkt: true },
    };
    check("gute Fahrt: kein Urteil nennt einen Täter",
        !pVerdict(gut.p).length && !bVerdict(gut.b).length && !tVerdict(gut.t).length && !sVerdict(gut.s).length && !hVerdict(gut.h).length);
    const faelle = [
        ["P Fels (Schau B 05)", pVerdict(Object.assign({}, gut.p, { neigung: 41, steig: 38, wank: -17, waende: 3, vor: 0.08, zurueck: 0.2 })), /Neigung 41°.*3 Wände.*W 2 s 0\.08/],
        ["P Blocker", pVerdict(Object.assign({}, gut.p, { blocker: 2, blockerNamen: ["glutbrunnen"] })), /Blocker im Band \(glutbrunnen\)/],
        ["B Befreiung (Schau B: −0,9 km/h)", bVerdict(Object.assign({}, gut.b, { versuche: [{ seite: "mit A", zurueck: 0.25, vMinKmh: -0.9 }] })), /Befreiung mit A: 0\.25 m/],
        ["T kein Tacho", tVerdict({ element: false }), /kein Tacho/],
        ["T falsche Zahl", tVerdict(Object.assign({}, gut.t, { falsch: 3, beispiel: "zeigt 12, Fahrt 40 km/h" })), /3\/10 Proben ≠/],
        ["T nach dem Absteigen", tVerdict(Object.assign({}, gut.t, { nachAbsteigenSichtbar: true })), /nach dem Absteigen/],
        ["S stumm", sVerdict(Object.assign({}, gut.s, { quellen: 0 })), /Fahren stumm/],
        ["S Ton folgt dem Tempo nicht", sVerdict(Object.assign({}, gut.s, { hzSpanne: 0 })), /folgt dem Tempo nicht/],
        ["S Ton ≠ Gesetz", sVerdict(Object.assign({}, gut.s, { abweichend: 4, beispiel: "40 km/h: 53 Hz, Gesetz 250 Hz" })), /4\/15 Proben ≠ klang:FAHRT/],
        ["S klingt nach", sVerdict(Object.assign({}, gut.s, { laufendNachAb: 2 })), /nach dem Absteigen/],
        ["S Zwilling im Stamm", sVerdict(Object.assign({}, gut.s, { fremd: 1 })), /außerhalb des Gesetzbuchs/],
        ["H ohne Fahr-Tasten (Schau B: die Tastenliste)", hVerdict({ zeilen: ["Tasten: WASD laufen · 1–9 Hotbar"], handbremseWirkt: true }), /E \(einsteigen\) fehlt.*Shift \(Handbremse\) fehlt/],
        ["H Shift wirkungslos", hVerdict(Object.assign({}, gut.h, { handbremseWirkt: false, handbremseDetail: "Shift im Fahr-Schritt 0/30" })), /Shift kommt im Fahr-Schritt nicht/],
    ];
    for (const [name, taeter, re] of faelle) check(`Selbst-Test ${name} → beim Namen`, taeter.length > 0 && re.test(taeter.join(" · ")), taeter.join(" · "));
    // DER KERN mit dem alten Rückwärts-Antrieb (0,4 × aEngine) fällt in K
    require(path.join(root, "vehicle-core.js"));
    const VC = globalThis.__vehicleCore;
    const alt = VC.FAHR.schritt.rueckAntrieb;
    VC.FAHR.schritt.rueckAntrieb = 0.4;
    const kAlt = kVerdict(kernBefreiung(VC));
    VC.FAHR.schritt.rueckAntrieb = alt;
    check("Selbst-Test K: der Kern mit dem alten Rückwärts-Antrieb (0,4) → die Befreiung beim Namen", kAlt.some((t) => /^gt S/.test(t)), kAlt.slice(0, 3).join(" · "));
    if (errs.length) {
        console.error("\n❌ SELBST-TEST ROT — die Linse ist vakuös.");
        process.exit(1);
    }
    console.log("\n✅ SELBST-TEST GRÜN — die Fahr-Bahn-Linse nennt Platz, Befreiung, Tacho, Stimme und Tasten beim Namen.");
    process.exit(0);
}

async function main() {
    if (process.argv.includes("--selftest")) return selbstTest();
    const t0 = Date.now();
    console.log("=== K — DIE BEFREIUNG IM KERN (Node, je Rezept: S + Gegenlenkung und S, eben · 10° · 15° bergauf) ===");
    require(path.join(root, "vehicle-core.js"));
    const VC = globalThis.__vehicleCore;
    const kRows = kernBefreiung(VC);
    const kT = kVerdict(kRows);
    const gt = kRows.filter((z) => z.rezept === "gt" && z.art !== "S + Gegenlenkung rechts");
    check(
        `K die Befreiung: jedes Rezept kommt in 1,3 s ≥ ${SOLL.befreiungM} m rückwärts frei (${kRows.length} Läufe)`,
        kT.length === 0,
        `GT ${gt.map((z) => `${z.art} ${z.grad}° ${z.weg.toFixed(2)} m`).join(" · ")}${kT.length ? " — Täter: " + kT.slice(0, 6).join(" · ") + (kT.length > 6 ? ` (+${kT.length - 6})` : "") : ""}`
    );

    const puppeteer = require("puppeteer");
    const { softwareWebGpuArgs } = require("./lib/software-gpu.cjs");
    await new Promise((res) => server.listen(PORT, "127.0.0.1", res));
    const browser = await puppeteer.launch({
        headless: true,
        protocolTimeout: 600000,
        args: [...softwareWebGpuArgs(), "--autoplay-policy=no-user-gesture-required"],
    });
    let out;
    const pageErrors = [];
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });
        await page.evaluateOnNewDocument(() => {
            window.__anazhForceFoundry = true;
            window.__anazhHeadlessNullRenderer = true;
        });
        await page.evaluateOnNewDocument(quellenAbgriff);
        page.on("pageerror", (e) => pageErrors.push((e.stack || e.message || String(e)).split("\n")[0]));
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "domcontentloaded", timeout: 60000 });
        out = await page.evaluate(probe, SOLL);
    } finally {
        await browser.close();
        server.close();
    }
    if (out.err) {
        console.error("Probe-Fehler: " + out.err);
        process.exit(2);
    }
    console.log("DBG P1", JSON.stringify(out.p1.dbg), out.p1.dbgStops);
    console.log("DBG PENDING", out.dbgPendingN, JSON.stringify(out.dbgPending), "BAEUME", JSON.stringify(out.dbgBaeume), "CHUNKS", out.dbgChunks);
    console.log("DBG BAEUME NACH", JSON.stringify(out.dbgBaeumeNach));
    console.log("DBG P2", JSON.stringify(out.p2.dbg), out.p2.dbgStops);
    console.log("=== P — DER PLATZ (die Vorschau des Garage-Tors · „bau mir einen gt“ am Tor) ===");
    const p1 = pVerdict(out.p1);
    check("P1 die Vorschau am Garage-Tor steht auf fahrbarem Grund und fährt an (E · W 2 s · S 2 s · E)", p1.length === 0, zeileP(out.p1) + (p1.length ? " — Täter: " + p1.join(" · ") : ""));
    const p2 = pVerdict(out.p2);
    check("P2 „bau mir einen gt“ vor dem Fels am Tor: der Wagen steht auf fahrbarem Grund und fährt an", p2.length === 0, zeileP(out.p2) + (p2.length ? " — Täter: " + p2.join(" · ") : ""));
    const sp = pVerdict(out.schmuggelP);
    check(
        "P-SCHMUGGEL die Vorschau ohne das Platz-Gesetz des Stamms an derselben Stelle → ROT beim Namen",
        out.schmuggelP && out.schmuggelP.gesetzStub && sp.length > 0,
        `${out.schmuggelP && out.schmuggelP.gesetzStub ? "Gesetz gestubbt" : "kein Platz-Gesetz im Stamm"} · ${zeileP(out.schmuggelP)}${sp.length ? " — Täter: " + sp.join(" · ") : ""}`
    );
    console.log("=== B — DER STOSS AM GLUTBRUNNEN UND DIE BEFREIUNG DER SCHAU (−875/−732) ===");
    const bv = bVerdict(out.b);
    const bz = (m) =>
        m && m.da
            ? `Glutbrunnen ${m.glut ? (m.glut.fixture ? "gesetzt" : "der Welt") : "—"} · Stoß ${m.stoss ? "ja" : "nein"} · ${m.versuche.map((v) => `${v.seite} ${v.zurueck.toFixed(2)} m (${v.vMinKmh.toFixed(1)} km/h)`).join(" · ")}`
            : (m && m.grund) || "—";
    check(`B die Befreiung (S + Gegenlenkung 1,3 s) bringt den Wagen ≥ ${SOLL.befreiungM} m frei`, bv.length === 0, bz(out.b) + (bv.length ? " — Täter: " + bv.join(" · ") : ""));
    console.log("=== T — DER TACHO (|vlong| × vehicle:FAHR.kmh) ===");
    const tv = tVerdict(out.t);
    check("T im Sattel zeigt #fahr-tacho die Fahrt in km/h, nach dem Absteigen ist er fort", tv.length === 0, `${out.t.proben} Proben · max ${out.t.maxKmh} km/h${tv.length ? " — Täter: " + tv.join(" · ") : ""}`);
    console.log("=== S — DIE STIMME DER FAHRT (klang-core fahrtStimme) ===");
    const sv = sVerdict(out.s);
    check("S im Sattel klingt die Fahrt aus dem Gesetzbuch, ihr Motor-Ton steigt mit dem Tempo, absteigen macht still", sv.length === 0, `${out.s.quellen} Quellen · ${out.s.proben} Proben · Motor-Spanne ${out.s.hzSpanne} Hz · ${out.s.abweichend} abweichend · nach dem Absteigen ${out.s.laufendNachAb} laufend${sv.length ? " — Täter: " + sv.join(" · ") : ""}`);
    console.log("=== H — DIE FAHR-TASTEN IN DER HILFE (E · Shift) ===");
    const hv = hVerdict(out.h);
    const fz = (out.h.zeilen || []).find((z) => /Fahr/i.test(z)) || (out.h.zeilen || []).slice(-1)[0] || "—";
    check("H „hilfe“ nennt E (einsteigen) und Shift (Handbremse), und Shift kommt in Fahrt als Handbremse im Fahr-Schritt an", hv.length === 0, `„${fz}“ · ${out.h.handbremseDetail || ""}${hv.length ? " — Täter: " + hv.join(" · ") : ""}`);
    check("keine Seiten-Ausnahme", pageErrors.length === 0, pageErrors.slice(0, 3).join(" | "));
    for (const l of out.log || []) console.log("  · " + l);
    console.log(`\nLaufzeit ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    if (errs.length) {
        console.error(`\n❌ FAHR-BAHN ROT — ${errs.length} Täter: ${errs.join(" | ")}`);
        process.exit(1);
    }
    console.log("\n✅ FAHR-BAHN GRÜN — der Wagen steht auf fahrbarem Grund, kommt frei, zeigt sein Tempo, klingt, und die Hilfe nennt seine Tasten.");
    process.exit(0);
}

main().catch((e) => {
    console.error(e && e.stack ? e.stack : e);
    process.exit(2);
});
