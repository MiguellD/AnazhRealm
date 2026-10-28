#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-klang-zensus.cjs — DIE KLANG-LINSE (npm run gate:klang-zensus): was hört man je Ort, trägt jede
// klingende Quelle ein GESETZ, und kostet sie nur, solange man sie hört?
//  (O) ORTE aus dem Gesetz (Null-Renderer): Wiese = Messort · Seeufer 3–7 m vor stillem Wasser · Wald = höchste
//      Deckung der Kronen-Karte `_kronenStreuAt`, geprüft am Bestand ≤ 15 m · Dorf 4 m neben dem nächsten Glut-Bau.
//  (Z) ZENSUS je Ort (Mittag · Sonne · Sommer, die Musik ruht): jede Quelle mit Erzeuger, Gesetz-Stimmen, Ausgang je Oktavband.
//  (G) HERKUNFT: gebaut in klang-core.js oder ein Wirt-Leser eines klang-Gesetzes, sonst STAMM-LITERAL beim Namen
//      (dazu statisch jede Quellen-Stelle im Stamm).
//  (H) HÖRBAR: jede Dauer-Quelle gehört einer Stimme über der Hörschwelle.
//  (K) KOSTEN je Takt: die Welt-Abfragen bleiben gleich bei 4000 fernen Bauten und 200 Fluss-Läufen.
//  (E) EREIGNISSE über den echten Weg: jede Quelle aus dem Gesetzbuch, keine am Master vorbei; still, wo die Welt still ist.
//  (L) LAB = WELT: worlds/klang spielt seine Orte über umweltGraph mit demselben SOLL.
//  (W) WERKSTATT: der Haupt-Thread rechnet keinen Sample (klang:umweltSynthese je Thread).
//  (A) ARMLÄNGE: 1 m vor der Glut, 3–24 m neben dem Wasserfall, eigenes SOLL.
//  (P) SPITZEN: jede Mischung offline durch Master und Spitzen-Wand — keine Spitze erreicht 0 dBFS.
//  (R) RUF ← LEIB: jeder gehörte Vogel ist ein gezeichneter Leib; ohne Leib verstummt der Chor (Mutation an der Wiese), ein
//      Tier-Ruf ohne Leib der Welt bleibt stumm.
//  (F) DER KÖRPER KLINGT AUS BEWEGUNG (klang.K4 Staffel 2): Motor, Landung, Doppler an sechs Radial-Geschwindigkeiten am Bus.
//  (N) UHR × WETTER × GANG an der Wiese (klang.K1 Staffel 2): nachts (Grillen, kein Vogel), im Regen, gehend und fahrend
//      (im Sattel des GT) — Wetter und Uhr als Wort des Spielers, je Szene das Soll und der Weg in Bewegung.
//  SELBST-TEST (--selftest): je Wand ein gepflanzter Täter (die Zeile S1–S14 unten), Stubs restauriert.
//  (T) KLANG-TAKT IN BEWEGUNG: der eigene Lauf `--takt` (an `taktSeite`).
//  (U) GESEHEN = GEHÖRT am Bach und im Regen: der eigene Lauf `--gesehen` (an `gesehenSeite`, klang.K2 Staffel 2).
//   node scripts/diag-klang-zensus.cjs [--selftest] [--takt [--echt] [--minuten <n>] | --gesehen] [--json <datei>]
//   (KLANG_WURZEL=<baum> misst einen anderen Arbeitsbaum unter derselben Linse)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const {
    statikServer,
    starteBrowser,
    warteAufWelt,
    nullRenderer,
    halteBis,
    ROOT: root,
} = require("./lib/welt-boot.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const fs = require("fs");
const path = require("path");
const stammLib = require("./lib/stamm.cjs");
const MESS = require("./lib/welt-orte.cjs").messort("wiese"); // der Messort aus spec/profiband/haushalt.json

// KLANG_WURZEL: eine Überlagerung — liegt eine Datei dort, gewinnt sie (z. B. die Stände eines älteren Commits);
// vorher↔nachher unter derselben Linse, denselben Bedingungen.
const UEBER = process.env.KLANG_WURZEL ? path.resolve(process.env.KLANG_WURZEL) : null;
const PORT = Number(process.env.KLANG_ZENSUS_PORT) || 7452;
const argv = process.argv.slice(2);
const SELBST = argv.includes("--selftest");
const TAKT = argv.includes("--takt");
const ECHT = TAKT && argv.includes("--echt"); // der Zensus misst im Null-Renderer
const GESEHEN = argv.includes("--gesehen");
const opt = (k) => {
    const i = argv.indexOf(k);
    return i >= 0 ? argv[i + 1] : null;
};
const JSON_AUS = opt("--json");

const server = statikServer({
    root,
    seiten: {
        "/__stotter.js":
            "registerProcessor('stotter', class extends AudioWorkletProcessor { process() { for (const e = Date.now() + 8; Date.now() < e; ); return true; } });",
    },
    wandle: (p, data) => {
        if (!UEBER) return data;
        const ueber = path.join(UEBER, p);
        return ueber.startsWith(UEBER) && fs.existsSync(ueber) ? fs.readFileSync(ueber) : data;
    },
});

// DER QUELLEN-ABGRIFF (vor jedem Seiten-Skript): jede erzeugte Quelle mit Stapel, Start, Stop, Ende — und jede
// Verbindung direkt an den Ausgang (ctx.destination) mit ihrem Stapel (am Master vorbei?).
function quellenAbgriff() {
    if (window.__klangQuellen) return;
    const Q = (window.__klangQuellen = []);
    const D = (window.__klangAusgang = []);
    const proto = window.BaseAudioContext?.prototype;
    if (!proto) return;
    const conn = AudioNode.prototype.connect;
    const stapel = (n) => (new Error().stack || "").split("\n").slice(3, n); // ohne Error, sich und den Abgriff
    AudioNode.prototype.connect = function (ziel) {
        (this.__an ||= []).push(ziel); // die Kette der Stimme (gesehenSeite folgt ihr bis zum Gain)
        if (ziel && ziel === this.context?.destination)
            D.push({ ctx: this.context, stapel: stapel(7) });
        return conn.apply(this, arguments);
    };
    for (const art of ["createOscillator", "createBufferSource", "createConstantSource"]) {
        const org = proto[art];
        proto[art] = function () {
            const n = org.apply(this, arguments);
            const e = {
                art,
                stapel: stapel(8),
                start: null,
                stop: null,
                ctx: this,
                knoten: n,
            };
            Q.push(e);
            const s0 = n.start;
            const s1 = n.stop;
            n.start = function () {
                e.start = this.context.currentTime;
                e.loop = !!this.loop;
                if (this.frequency) e.freq = this.frequency.value;
                return s0.apply(this, arguments);
            };
            n.stop = function (when) {
                e.stop = when > 0 ? when : this.context.currentTime;
                return s1.apply(this, arguments);
            };
            n.addEventListener("ended", () => (e.ende = true));
            return n;
        };
    }
}

// DER SEITEN-WERKZEUGKASTEN (in die Spiel-Seite): Orte finden, umstellen, messen.
function werkzeug() {
    const r = anazhRealm;
    const st = r.state;
    const W = {};
    // Ein Frame des echten Loops (Bühne fest, Tiere halten); die Szene (klang.K1 Staffel 2): Wetter und Uhr als Wort des
    // Spielers (R9), je Takt über die Bühne.
    W.takt = () => {
        try {
            __buehne(W.szene);
            if (W.szene?.uhr != null) r.setTimeOfDay(W.szene.uhr, "regler");
            r._gameLoopTick(performance.now());
        } catch {}
    };
    W.umstellen = async (x, z) => {
        st.playerMesh.position.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
        // Einschwingen, bis die Welt steht (das EINE Einschwingen, welt-boot `__weltStehtNach`: Ring, Foundry und Wald — die
        // Kronen-Karte trägt nur gepflanzte Kronen). Die Decke zählt Takte, nie Sekunden; steht die Welt nicht, wirft sie.
        const takte = await __weltStehtNach(() => {
            W.takt();
            st.playerMesh.position.x = x;
            st.playerMesh.position.z = z;
        });
        const wald = W.waldSteht();
        // Die Kamera blickt nach Norden (−z), 3 m hinter und 1,6 m über dem Spieler: das Panorama ist definiert.
        const cam = st.camera;
        if (cam) {
            const p = st.playerMesh.position;
            cam.position.set(p.x, p.y + 1.6, p.z + 3);
            cam.lookAt(p.x, p.y + 1.2, p.z - 10);
            cam.updateMatrixWorld(true);
        }
        return { takte, chunks: st.voxelChunks.size, wald };
    };
    // DER WALD STEHT: nichts im Wald baut (`_weltOffen`, A9: Plan-Schlange, Pflanz-Gänge, Pflanz-Schlange), keine Streu-Region wartet.
    // der Takt des Spiels je Bild der Seite (der Null-Renderer zeichnet nicht)
    W.spiel = (t) => (r._gameLoopTick(t), requestAnimationFrame(W.spiel));
    // ein GT neben (x, z), gebaut
    W.wagen = async (
        x,
        z,
        e = r.spawnArchitecture(
            "fahrzeug_gt",
            { x, y: r.getTerrainHeightAt(x, z) + 0.5, z },
            { silent: true, precise: true }
        )
    ) => (await __gebautNach(e), e);
    W.waldSteht = () => r._weltOffen().wald === 0 && r._streuWartet(st.playerMesh.position) === 0;
    // Die Nässe des Klangs ist SEINE (`_nassAt`: der Boden unter der EINEN Wasser-Wahrheit am Körper) — die Linse rechnet
    // sie nie nach.
    W.nass = (x, z) => r._nassAt(x, z);
    // DER BESTAND an (x, z): die stehenden Bäume im Umkreis `m` — Einträge mit Art (gesetzt, promoviert) und die Zellen
    // der Baum-Streu (promotable), gezählt an den Objekten der Welt, nie an der Kronen-Karte.
    W.bestand = (x, z, m) => {
        let n = 0;
        for (const e of st.architectures || [])
            if (e?._lodSpecies && e.position && Math.hypot(e.position.x - x, e.position.z - z) < m) n++;
        for (const reg of st.scatterRegions ? st.scatterRegions.values() : [])
            for (const c of reg.cells || []) if (c?.promotable && Math.hypot(c.x - x, c.z - z) < m) n++;
        return n;
    };
    // DIE ORTE aus dem Gesetz.
    W.orte = async (wx, wz) => {
        const orte = { wiese: { x: wx, z: wz } };
        const O = __klangCore.UMWELT.ohr;
        // Seeufer: der trockene Punkt vor dem nächsten SEE des Gesetzes (die Senken des Flussnetzes, ≥ 16 Zellen, über dem
        // Meer) in den Kacheln bis zum zweiten Ring, die Zelle nächst der Wiese.
        let best;
        const kachel = r.constructor.HYDROSPHERE.regionSize;
        let seeZelle, wfN;
        for (let rx = -2; rx <= 2; rx++)
            for (let rz = -2; rz <= 2; rz++) {
                await __weltDa(() => !r._ensureHydroTilesAround(wx + rx * kachel, wz + rz * kachel, 0));
                const h = r._hydroFor(wx + rx * kachel, wz + rz * kachel);
                // der nächste Fall der Kacheln (die Armlänge am Wasserfall, unten)
                for (const f of h?.waterfalls || []) {
                    const d = Math.hypot(f.x - wx, f.z - wz);
                    if (!wfN || d < wfN.d) wfN = { f, d };
                }
                for (const lake of h?.lakes || []) {
                    if (!lake.cells || lake.cells.length < 16 || !(lake.level > st.waterLevel + 2)) continue;
                    for (const q of lake.cells) {
                        const x = h.originX + ((q % h.dim) + 0.5) * h.cell;
                        const z = h.originZ + (((q / h.dim) | 0) + 0.5) * h.cell;
                        const d = Math.hypot(x - wx, z - wz);
                        if (!seeZelle || d < seeZelle.d) seeZelle = { x, z, d };
                    }
                }
                await sleep(0);
            }
        if (seeZelle) {
            // vom See zurück Richtung Wiese, bis trocken
            const r0 = Math.max(1e-3, seeZelle.d);
            const ux = (wx - seeZelle.x) / r0;
            const uz = (wz - seeZelle.z) / r0;
            // Der Leser ist der Hör-Ring des Ohrs (UMWELT.ohr: radien × richtungen, feste Welt-Achsen): das Ufer steht, wo
            // das Ohr trocken steht und sein ERSTER Ring Wasser trifft — der Punkt hinter dem ersten trockenen Punkt mit den
            // meisten nassen Ring-Punkten.
            const ringNass = (x, z) => {
                let erst = 0,
                    alle = 0;
                for (const rad of O.radien)
                    for (let k = 0; k < O.richtungen; k++) {
                        const a = (k / O.richtungen) * Math.PI * 2;
                        if (!W.nass(x + Math.sin(a) * rad, z + Math.cos(a) * rad)) continue;
                        alle++;
                        if (rad === O.radien[0]) erst++;
                    }
                return { erst, alle };
            };
            for (let s = 1; s < r0; s++) {
                const qx = seeZelle.x + ux * s;
                const qz = seeZelle.z + uz * s;
                if (!W.nass(qx, qz)) {
                    let wahl;
                    for (let t = 0; t <= O.radien[0]; t += 0.5) {
                        const fx = qx + ux * t;
                        const fz = qz + uz * t;
                        if (W.nass(fx, fz)) continue;
                        const n = ringNass(fx, fz);
                        if (n.erst > 0 && (!wahl || n.alle > wahl.n.alle)) wahl = { x: fx, z: fz, n };
                    }
                    if (wahl) best = { x: wahl.x, z: wahl.z, wasser: { x: qx - ux, z: qz - uz }, ring: wahl.n };
                    break;
                }
            }
        }
        if (best) orte.seeufer = best;
        W.wasserPunkt = best?.wasser; // die Ereignis-Tour lässt das Wasser hier zurückströmen
        // Waldinneres: höchste Kronen-Deckung der Kronen-Karte auf trockenem Land (die Karte trägt die stehenden Kronen;
        // bei Gleichstand gewinnt der dichtere Bestand).
        let wald;
        for (let gx = -240; gx <= 240; gx += 12) {
            for (let gz = -240; gz <= 240; gz += 12) {
                const x = wx + gx;
                const z = wz + gz;
                const y = r._voxelSurfaceY(x, z);
                if (y == null || W.nass(x, z)) continue;
                const deck = +r._kronenStreuAt(x, z).toFixed(3);
                if (wald && deck < wald.deckung) continue;
                const bestand = W.bestand(x, z, 15);
                if (!wald || deck > wald.deckung || bestand > wald.bestand) wald = { x, z, deckung: deck, bestand };
            }
            await sleep(0);
        }
        if (wald) orte.wald = wald;
        // Dorf: der nächste Glut-Bau (aus der gestreamten Welt um die Wiese), 4 m davor. Die Bauten streamen nach den
        // Chunks (Pflanz-/Bau-Takt): der Loop läuft weiter, bis einer im Umkreis von 160 m steht (der Deckel zählt Takte).
        const sucheGlut = () => {
            let g;
            for (const e of st.architectures || []) {
                if (!e || !e.position || !(r._glutFlaeche(e) > 0)) continue;
                const d = Math.hypot(e.position.x - wx, e.position.z - wz);
                if (!g || d < g.d) g = { e, d };
            }
            return g;
        };
        let glut = sucheGlut();
        for (const weiter = __deckel("eine Glut in Hörweite", 3000); !(glut?.d < 160) && weiter();) {
            W.takt();
            st.playerMesh.position.x = wx;
            st.playerMesh.position.z = wz;
            await sleep(30);
            glut = sucheGlut();
        }
        if (glut) {
            const ex = glut.e.position.x;
            const ez = glut.e.position.z;
            const d = Math.max(1e-3, glut.d);
            const bau = { x: ex, z: ez, typ: glut.e.type };
            orte.dorf = { x: ex + ((wx - ex) / d) * 4, z: ez + ((wz - ez) / d) * 4, glut: bau };
            // ARMLÄNGE an der Glut: 1 m vor dem Bau (das Knistern aus nächster Nähe — die Spitzen-Probe).
            orte.glutArm = { x: ex + (wx - ex) / d, z: ez + (wz - ez) / d, glut: bau };
        }
        // DIE WIESE liegt jenseits der Hörweite jeder Glut (klang-core UMWELT.stimmen.glut.hoerweiteM): an der Mess-Wiese
        // steht ein Dorf des Gesetzes. Das Dorf wächst erst ganz (die Bau-Schlange leer), dann gilt der nächste trockene,
        // ebene Punkt um den Messort, an dem jede Glut außer Hörweite liegt, kein Wasser im Hör-Ring und kein Fluss in seiner
        // Hörweite (der Kanal, den das Ohr liest, `_hydroDistAt`: bis kk2-ufer stand die Wiese 30,6 m neben einem Bach, den der
        // Ring zwischen seinen Radien 22 und 40 m überhörte).
        for (const weiter = __deckel("der Dorf-Plan", 1000); r._autoSettlementQueue?.plan && weiter();) {
            W.takt();
            await sleep(30);
        }
        const hoerweite = __klangCore.UMWELT.stimmen.glut.hoerweiteM;
        const gluten = (st.architectures || []).filter((e) => e?.position && r._glutFlaeche(e) > 0);
        // offen wie der Messort: keine dichtere Krone, kein größerer Bestand im 15-m-Kreis (der Waldrand dämpft den Wind)
        const deckMess = r._kronenStreuAt(wx, wz);
        const bestandMess = W.bestand(wx, wz, 15);
        const wieseHaelt = (x, z) => {
            for (const e of gluten) if (Math.hypot(e.position.x - x, e.position.z - z) < hoerweite + 4) return false;
            if (r._kronenStreuAt(x, z) > deckMess || W.bestand(x, z, 15) > bestandMess) return false;
            const fl = r._hydroDistAt(x, z);
            if (fl.dist - fl.halfW < __klangCore.UMWELT.stimmen.fluss.hoerweiteM) return false;
            let lo = Infinity,
                hi = -Infinity;
            for (let k = 0; k <= O.richtungen; k++) {
                const a = (k / O.richtungen) * Math.PI * 2;
                for (const rad of k === O.richtungen ? [0] : O.radien) {
                    const px = x + Math.sin(a) * rad,
                        pz = z + Math.cos(a) * rad;
                    if (W.nass(px, pz)) return false;
                    if (rad > 6) continue;
                    const y = r._voxelSurfaceY(px, pz);
                    if (y == null) return false;
                    lo = Math.min(lo, y);
                    hi = Math.max(hi, y);
                }
            }
            return hi - lo <= 1.5;
        };
        if (!wieseHaelt(wx, wz)) {
            let neu;
            for (let rr = 6; rr <= 240 && !neu; rr += 6) {
                const n = Math.round((2 * Math.PI * rr) / 6);
                for (let q = 0; q < n && !neu; q++) {
                    const a = (q / n) * Math.PI * 2;
                    const x = wx + Math.cos(a) * rr,
                        z = wz + Math.sin(a) * rr;
                    if (wieseHaelt(x, z)) neu = { x, z, vomMessort: rr, glutHoerweite: hoerweite };
                }
            }
            orte.wiese = neu || { x: wx, z: wz, ohneOrt: "kein Punkt jenseits der Glut-Hörweite binnen 240 m" };
        }
        // ARMLÄNGE am Wasserfall: der nächste Fall der Kacheln bis zum zweiten Ring (wie der Playtest,
        // `__wasserOrt("fall")`), der nächste trockene Punkt 3–24 m neben seinem Fuß — das Becken eines Falls reicht bis
        // zur Krone seines Kanals, das SOLL misst die Ferne mit (SOLL.fallArm).
        for (const rad of wfN ? [3, 4, 5, 6, 8, 10, 12, 14, 16, 18, 20, 24] : []) {
            for (let a = 0; a < 16 && !orte.fallArm; a++) {
                const ang = (a / 16) * Math.PI * 2;
                const x = wfN.f.x + Math.sin(ang) * rad;
                const z = wfN.f.z + Math.cos(ang) * rad;
                if (W.nass(x, z)) continue;
                orte.fallArm = {
                    x,
                    z,
                    fall: { x: wfN.f.x, z: wfN.f.z, d: rad, hoehe: +(wfN.f.topY - wfN.f.bottomY).toFixed(1) },
                };
            }
            if (orte.fallArm) break;
        }
        // Kein trockener Punkt / kein Fall: die Spur reist mit (der Befund O nennt den Ort).
        if (!orte.fallArm)
            orte.fallSuche = wfN ? { x: wfN.f.x, z: wfN.f.z, d: Math.round(wfN.d) } : "kein Wasserfall der Region";
        return orte;
    };
    // Stapel → [{fn, datei}] (Funktion + Datei je Rahmen).
    W.frames = (stapel) =>
        stapel.map((z) => {
            const m = /^\s*at (?:async )?(?:new )?(?:(\S+) \()?(.*?)\)?$/.exec(z);
            if (!m) return { fn: "?", datei: "?" };
            const d = /([^/?]+\.(?:js|cjs|html))/.exec(m[2]);
            return { fn: (m[1] || "(anonym)").replace(/^.*\./, ""), datei: d ? d[1] : m[2].slice(0, 24) };
        });
    // DER SYNTHESE-ZÄHLER des Haupt-Threads (klang:umweltSynthese — Samples aus Textur- und Ruf-Gesetzen): die Welt
    // rechnet in der Klang-Werkstatt, nie im Spiel-Takt.
    W.synthese = () => __klangCore.umweltSynthese().samples;
    // Die EREIGNIS-KLÄNGE der Welt, je einmal ausgelöst über ihre echten Wege: welche Quellen entstehen, wer baut sie,
    // wer verbindet direkt an den Ausgang (am Master vorbei), und wie viele Samples rechnet der Haupt-Thread dafür?
    // Ein Ereignis darf seine Quelle verzögert bauen (der Tier-Ruf kommt aus der Werkstatt): gewartet wird bis zur
    // ersten Quelle, höchstens `warteMs`.
    W.ereignisse = async () => {
        const s = st.symphony;
        const out = [];
        // `still`: ein Ereignis, das die Welt an diesem Ort NICHT hören darf (keine Quelle ist das Soll).
        const fang = async (art, fn, warteMs, still) => {
            const a = __klangQuellen.length;
            const b = __klangAusgang.length;
            const syn0 = W.synthese();
            try {
                fn();
            } catch (e) {
                out.push({ art, fehler: String(e?.message || e) });
                return;
            }
            const neu = () => __klangQuellen.slice(a).filter((e) => e.ctx === s.ctx);
            const dl = performance.now() + (warteMs || 0);
            while (!neu().length && performance.now() < dl) await sleep(25);
            const syn1 = W.synthese();
            out.push({
                art,
                still: !!still,
                quellen: neu().map((e) => ({ art: e.art.slice(6), frames: W.frames(e.stapel) })),
                amAusgang: __klangAusgang
                    .slice(b)
                    .filter((e) => e.ctx === s.ctx)
                    .map((e) => W.frames(e.stapel)),
                hauptSynthese: syn1 - syn0,
            });
        };
        await fang("treffer", () => r._trefferPaar("stahl", "stein"));
        // Wasser strömt zurück — am Wasser des Seeufers; auf der trockenen Wiese (das Ohr steht dort) bleibt es still.
        const wp = W.wasserPunkt;
        await fang("wasser", () => r._playWaterReactionPing(wp ? [{ cx: wp.x, cz: wp.z, r: 1 }] : []));
        const pm0 = st.playerMesh.position;
        await fang("wasserTrocken", () => r._playWaterReactionPing([{ cx: pm0.x, cz: pm0.z, r: 1 }]), 0, true);
        await fang("abschied", () => r._playArchitectureFarewellPing({ type: "kristall_geode" }));
        await fang("singen", () => {
            st.blueprints.__klangOrb = {
                name: "__klangOrb",
                label: "Linsen-Orb",
                builtIn: false,
                parts: [
                    {
                        shape: "sphere",
                        material: "quarz",
                        opChain: [{ tool: "polierscheibe", op: "polish", cap: 0.97 }],
                    },
                ],
            };
            r._applyCompoundWorldEffects("__klangOrb");
            delete st.blueprints.__klangOrb;
        });
        // ein Ruf ohne Leib der Welt (ein Wesen am Ohr, das kein Wesen der Welt ist) bleibt stumm — auch die Werkstatt antwortet nicht
        await fang("tier", () => r._tierRuf({ position: st.playerMesh.position }), 4000, true);
        // Ein Ding im Inventar (resonierend) unter der Maus.
        await fang("inventar", () => {
            st.inventoryHoverLast = 0;
            r.playInventoryHoverPing({ resoniert: 1 });
        });
        // Ein echtes Tier, 3 m neben dem Ohr: es antwortet auf den Auftrag „folge mir" und steigt eine Stufe auf (danach
        // stehen Ort und Auftrag wie vorher). Antwortet der Weg mit einer Tier-Stimme, kommt sie aus der Werkstatt.
        const tier = (st.creatures || []).find((c) => c?.position && c.userData && !c.userData.dying);
        if (!tier) {
            out.push({ art: "auftrag", fehler: "kein Tier in der Welt" });
            out.push({ art: "stufe", fehler: "kein Tier in der Welt" });
            return out;
        }
        const pos0 = tier.position.clone();
        const task0 = tier.userData.task ? { name: tier.userData.task.name, args: tier.userData.task.args } : null;
        const pm = st.playerMesh.position;
        tier.position.set(pm.x + 3, pm.y, pm.z);
        try {
            await fang(
                "auftrag",
                () => {
                    r.assignCreatureTask(tier, "wander", {}, { silent: true });
                    r.assignCreatureTask(tier, "follow_player");
                },
                4000
            );
            await fang("stufe", () => r._onCreatureLevelUp(tier, "gather", "holz", 3), 4000);
        } finally {
            tier.position.copy(pos0);
            r.assignCreatureTask(tier, task0?.name || "wander", task0?.args || {}, { silent: true });
        }
        return out;
    };
    // Die laufenden Quellen jetzt (gestartet, nicht beendet, Stop noch nicht erreicht).
    W.laufend = () => {
        const s = st.symphony;
        const jetzt = s.ctx?.currentTime || 0;
        const um = s.umwelt;
        const knoten = um?.graph?.knoten;
        return __klangQuellen
            .filter((e) => e.ctx === s.ctx && e.start != null && !e.ende && (e.stop == null || e.stop > jetzt))
            .map((e) => {
                const frames = W.frames(e.stapel);
                return {
                    art: e.art.slice(6),
                    // dauernd = läuft ohne gesetztes Ende (Schleife oder Oszillator ohne Stop); ein gesetzter Stop ist
                    // ein Ausklingen (die Rampe des Verstummens), kein Dauer-Läufer.
                    dauernd: e.stop == null && (e.loop || e.art !== "createBufferSource"),
                    freq: e.freq,
                    frames,
                    gesetzKnoten: !!knoten?.has(e.knoten),
                };
            });
    };
    // ±∞ reist über die Brücke als null (und null > −64 ist wahr — Lehre 17): −∞ (Pegel) wird −999, +∞ (Abstand)
    // wird 1e9 — beide bleiben auf ihrer Seite jeder Schwelle.
    W.endlich = (o) => JSON.parse(JSON.stringify(o, (k, v) => (v === Infinity ? 1e9 : v === -Infinity ? -999 : v)));
    W.zensus = () => W.endlich(r._klangZensus());
    W.mischung = (lage) => W.endlich(__klangCore.umweltMischung(lage));
    return W;
}

// Die Rahmen eines Stapels als Kette der Funktionen; gebaut im Gesetzbuch, wenn klang-core.js im Stapel steht.
const kette = (frames, n = 2) =>
    frames
        .slice(0, n)
        .map((f) => f.fn)
        .join(" ← ");
const imGesetz = (frames) => frames.some((f) => f.datei === "klang-core.js");
// Die Wirt-Leser benannter klang-Gesetze (der Wirt baut die Quelle, das Gesetz trägt die Zahlen).
const WIRT_LESER = {
    _lofiPlayChord: "klang:GENRES",
    _lofiPlayMelody: "klang:GENRES",
    _lofiPlayBass: "klang:GENRES",
    _lofiKick: "klang:GENRES",
    _lofiSnare: "klang:GENRES",
    _lofiHihat: "klang:GENRES",
    _playSchrittOneShot: "klang:SCHRITT_TIMBRE",
};

// (G) DIE STAMM-KLASSE, statisch: jede Stelle im Stamm, die eine Quelle baut (createOscillator · createBufferSource ·
// createConstantSource), liegt in einer Methode, die ein benannter Wirt-Leser ist — sonst ist sie ein STAMM-LITERAL,
// beim Namen und mit Zeile, auch wenn keine Tour sie je auslöst. Kommentare zählen nicht; der Helfer leert die Leiber der
// Wirt-Leser an ihrer Definition (ein toter Wirt-Leser wirft) und nennt den Täter mit Datei und Zeile.
// Der Stamm der Überlagerung, wenn sie einen trägt (eine Form; beide wirft scripts/lib/stamm.cjs), sonst der des Baums.
const QUELL_BAU = /\.create(Oscillator|BufferSource|ConstantSource)\(/;
const STAMM_WURZEL = UEBER && fs.existsSync(path.join(UEBER, stammLib.DIR)) ? UEBER : root;
// die EINE Absenz über den Helfer: außerhalb der Wirt-Leser baut keine Stelle eine Quelle; `q` die Wandlung des Vor-Stands
function stammQuellen(q) {
    const ok = stammLib.fehlt({ ausser: Object.keys(WIRT_LESER) }, QUELL_BAU, { wurzel: STAMM_WURZEL, wandel: q });
    return {
        rot: ok ? [] : [`G Stamm: ${stammLib.fehlt.wo} baut eine Klang-Quelle ohne Gesetz (außerhalb der Wirt-Leser)`],
    };
}
// SOLL je Ort (dB am Welt-Bus, Lage bei mittlerer Böe; der Master legt −9 dB darauf, die Musik liegt bei
// −27 dBFS — die Welt trägt 10–18 dB darunter).
const SOLL = {
    wiese: (m) => [
        ["wind ≥ −46", m.wind.db >= -46],
        ["vogel ≥ −52", m.vogel.db >= -52],
        ["kein Wasser (Ufer/Fluss/Fall)", !(m.ufer.db > -64) && !(m.fluss.db > -64) && !(m.fall.db > -64)],
        ["Glut trägt nicht (≤ wind)", !(m.glut.db > m.wind.db)],
    ],
    seeufer: (m) => [
        ["ufer ≥ −32", m.ufer.db >= -32],
        ["ufer ≥ wind + 6", m.ufer.db >= m.wind.db + 6],
    ],
    wald: (m, alle) => [
        ["laub ≥ −44", m.laub.db >= -44],
        ["laub ≥ Wiese.laub + 8", alle.wiese && m.laub.db >= alle.wiese.laub.db + 8],
    ],
    dorf: (m) => [["glut ≥ −34", m.glut.db >= -34]],
    // ARMLÄNGE: die nahe Quelle trägt den Ort (und die Spitzen-Probe P hält sie unter 0 dBFS).
    glutArm: (m) => [
        ["glut ≥ −20", m.glut.db >= -20],
        ["glut ≥ wind + 6", m.glut.db >= m.wind.db + 6],
    ],
    // Der Fall am nächsten trockenen Punkt (≤ 12 m): der kleinste Fall des Gesetzes (waterfallMinDrop 6 m) trägt dort
    // −14 − 20·lg(12/5) = −21,6 dB. Liegt der Punkt weiter (das Becken reicht bis zur Krone, `ort.fall.d`), fällt das
    // Soll mit der Ferne wie das Gesetz: −14 − 20·lg(d/5) − 0,4 (das Labor misst in 12 m).
    fallArm: (m, _alle, ort) => {
        const d = ort?.fall?.d > 12 ? ort.fall.d : 12;
        const grenze = Math.round((-14 - 20 * Math.log10(d / 5) - 0.4) * 10) / 10;
        return [
            [`fall ≥ ${grenze} (in ${d} m)`, m.fall.db >= grenze],
            ["fall ≥ wind + 10", m.fall.db >= m.wind.db + 10],
        ];
    },
    // DIE SZENEN der Wiese (klang.K1 Staffel 2, Befund N): nachts zirpen die Grillen (DOLBEAR: Nacht × Wärme × Lebensraum) und
    // kein Vogel singt (der Chor schläft), im Regen trägt der Regen-Teppich, gehend und fahrend hält das Soll der Wiese.
    nacht: (m) => [
        ["grille ≥ −46", m.grille.db >= -46],
        ["kein Vogel singt", !(m.vogel.db > -64)],
    ],
    regen: (m) => [["regen ≥ −34", m.regen.db >= -34]],
};
SOLL.gehend = SOLL.fahrend = SOLL.wiese;
// Die Szene je Name: Wetter und Uhr (das Wort des Spielers), der Gang (zu Fuß oder im Sattel des GT) und sein Mindest-Weg (m).
const SZENEN = { nacht: { uhr: 0 }, regen: { wetter: "rainy" }, gehend: { weg: 10 }, fahrend: { weg: 30, wagen: 1 } };
// Band je Stimme (spektraler Schwerpunkt des Offline-Renders, Hz).
const BAND = {
    wind: [80, 1200],
    laub: [1500, 7000],
    ufer: [60, 900],
    fluss: [300, 3000],
    fall: [60, 900],
    regen: [1500, 7500],
    glut: [250, 4000],
    vogel: [2000, 6000],
    grille: [3500, 5600],
};

async function messeOrt(page, name, ort, stubs) {
    return page.evaluate(
        async (name, ort, stubs) => {
            const r = anazhRealm;
            const W = __klangW;
            const st = r.state;
            const P = Object.getPrototypeOf(r);
            const alt = {};
            if (stubs?.ohneWasser) {
                // das Wasser an seiner Quelle weg: die EINE Wahrheit am Körper (die Nässe des Klangs liest sie)
                alt._koerperWasser = P._koerperWasser;
                P._koerperWasser = () => -Infinity;
            }
            if (stubs?.ohneLeib || stubs?.stehend) {
                // der Leib weg: das Revier-Gesetz trägt kein Revier — oder er steht (Selbst-Test S12): die Bahn des Gesetzes
                // auf der Uhr dieses Takts; die Vogel-Karte neu — der Phantom-Vogel (Selbst-Test) singt in der Lage am Ohr
                // ohne einen Leib
                [alt.vogel, alt.lage] = [r.constructor._vogelGesetzMemo, P._umweltLage];
                const T = st.spielZeit;
                const mut = stubs.stehend ? { bahn: (w, a, _t, ...x) => alt.vogel.bahn(w, a, T, ...x) } : { revier: () => false };
                [r.constructor._vogelGesetzMemo, r._vogelKarte] = [{ ...alt.vogel, ...mut }, null];
                if (stubs.phantom)
                    P._umweltLage = function () {
                        return Object.assign(alt.lage.call(this), { voegel: [{ d: 20 }] });
                    };
            }
            const um0 = st.symphony.umwelt;
            if (stubs?.ohneWerkstatt && um0) {
                // Selbst-Test: ein Graph, der im Haupt-Thread rechnet (ohne Lieferung der Werkstatt).
                alt.graph = um0.graph;
                alt.graph.stopAlle();
                um0.graph = __klangCore.umweltGraph(st.symphony.ctx, um0.bus);
            }
            if (stubs?.luft) [alt.luft, P._temperaturAt] = [P._temperaturAt, (y) => alt.luft.call(r, y, 0)];
            const syn0 = W.synthese();
            const sz = (W.szene = stubs?.szene || {});
            try {
                // umstellen schwingt ein, bis der Wald steht (`W.waldSteht`); dann läuft der Ring voll, die Stimmen werden
                // bestellt, geliefert und rampen ein. Im Gang (sz.weg) pendelt die Taste je 60 Takte (W vor, S zurück), zu Fuß oder
                // im Sattel des GT: das Ohr bleibt an der Wiese und misst in Bewegung, bis es seinen Weg ging (höchstens 30 s).
                const um = await W.umstellen(ort.x, ort.z);
                const p = st.playerMesh.position;
                const q = p.clone();
                if (sz.wagen) r.mountArchitecture((sz.e = await W.wagen(q.x + 3, q.z)));
                um.weg = 0;
                // (R) DER FLUG je Takt an den gezeichneten Leibern (die Lagen der Teile im Pool, wie das Bild sie setzt): ihr Weg
                // je Sekunde (der Median der Takte gleicher Zahl) und ihre Höhe über dem Boden (der Median aller Lagen)
                let [vor, t0, weg, hoch] = [[], 0, [], []];
                for (
                    let i = 0, beginn = performance.now();
                    performance.now() - beginn < (sz.weg ? 3e4 : 4500) && !(um.weg >= sz.weg);
                    i++
                ) {
                    [st.keys.w, st.keys.s] = sz.weg ? [i % 120 < 60, i % 120 >= 60] : [];
                    W.takt();
                    const Q = st.vogelPool?.mesh || { count: 0 };
                    const nun = Array.from({ length: Q.count }, (_, i) => Q.instanceMatrix.array.slice(16 * i + 12, 16 * i + 15));
                    if (nun.length && nun.length === vor.length)
                        weg.push(nun.reduce((s, p, i) => s + Math.hypot(...p.map((v, k) => v - vor[i][k])), 0) / nun.length / (performance.now() - t0) * 1e3);
                    for (const p of nun) hoch.push(p[1] - r._voxelSurfaceY(p[0], p[2]));
                    [vor, t0] = [nun, performance.now()];
                    await sleep(30);
                    um.weg += q.distanceTo(p);
                    q.copy(p);
                }
                um.sattel = st.player.mountedArch != null;
                // aus dem Sattel: die Stimme der Fahrt (klang:FAHRT, ihre Quellen trägt sie selbst) verklingt im nächsten Takt
                if (sz.e) (r.dismountArchitecture(), r.removeArchitecture(sz.e, { still: true }), W.takt());
                const med = (a) => +(a.sort((x, y) => x - y)[a.length >> 1] || 0).toFixed(2);
                const laufend = W.laufend();
                const zensus = W.zensus();
                if (zensus) zensus.leiber.flug = { mps: med(weg), hoeheM: med(hoch) };
                const syn1 = W.synthese();
                const baeume = W.bestand(p.x, p.z, 15);
                return { name, ort, um, laufend, zensus, baeume, hauptSynthese: syn1 - syn0 };
            } finally {
                st.keys.w = st.keys.s = W.szene = false;
                if (alt.luft) P._temperaturAt = alt.luft;
                if (alt.lage)
                    [r.constructor._vogelGesetzMemo, r._vogelKarte, P._umweltLage] = [alt.vogel, null, alt.lage];
                if (alt._koerperWasser) P._koerperWasser = alt._koerperWasser;
                if (alt.graph) {
                    um0.graph.stopAlle();
                    um0.graph = alt.graph;
                }
            }
        },
        name,
        ort,
        stubs
    );
}

// OFFLINE über den Studio-Graphen (die Lage, oder der Lab-Ort des Gesetzes beim Namen), gemessen nach 1,5 s Rampe. `wand` null:
// je hörbare Stimme solo — Pegel und Schwerpunkt (das Fenster deckt die längste Schleife der Stimme: spärliche Texturen mitteln
// nur über den ganzen Umlauf). (P) DIE SPITZEN-PROBE, `wand` true/false: die ganze Mischung 9 s durch den Welt-Master, mit oder
// ohne Spitzen-Wand (klang:umweltSpitze) — Spitze und RMS am Ausgang in dBFS.
async function imOffline(page, lage, wand) {
    return page.evaluate(
        async (lage, wand) => {
            const K = __klangCore;
            const mix = K.umweltMischung(typeof lage === "string" ? K.UMWELT.orte[lage] : lage);
            const render = async (m, sek) => {
                const ctx = new OfflineAudioContext(2, Math.ceil(48000 * sek), 48000);
                const [g, w] = [ctx.createGain(), wand && K.umweltSpitze(ctx)];
                g.gain.value = wand == null ? 1 : K.UMWELT.masterBasis;
                g.connect(w?.eingang || ctx.destination);
                if (w) w.ausgang.connect(ctx.destination);
                K.umweltGraph(ctx, g).anwenden(m, 0);
                const b = await ctx.startRendering();
                return [0, 1].map((c) => b.getChannelData(c).subarray(72000));
            };
            const db = (v) => (v > 0 ? +(10 * Math.log10(v)).toFixed(1) : -200);
            let [pk, q] = [0, 0];
            if (wand != null) {
                for (const c of await render(mix, 9))
                    for (const v of c) [pk, q] = [Math.max(pk, Math.abs(v)), q + v * v];
                return { wand: !!wand, spitzeDbfs: db(pk * pk), rmsDbfs: db(q / 720000) };
            }
            const out = {};
            for (const name of Object.keys(mix)) {
                if (!(mix[name].db >= K.UMWELT.hoerschwelleDb)) continue;
                const solo = {};
                for (const k of Object.keys(mix)) solo[k] = k === name ? mix[k] : { ...mix[k], db: -Infinity };
                // die Schleife läuft mit ihrem Takt (rate < 1 dehnt sie)
                const [a, b] = await render(
                    solo,
                    1.5 + Math.max(...[].concat(K.UMWELT.stimmen[name].sek)) / Math.min(1, mix[name].rate)
                );
                q = 0;
                const mono = a.map((l, i) => ((q += l * l + b[i] * b[i]), (l + b[i]) * 0.5)); // Leistung beider Kanäle
                out[name] = {
                    gesetzDb: +mix[name].db.toFixed(1),
                    gemessenDb: +(10 * Math.log10(q / a.length / 2 + 1e-20) + 3.01).toFixed(1),
                    schwerpunktHz: Math.round(K.schwerpunkt(mono, 48000)),
                };
            }
            return out;
        },
        lage,
        wand
    );
}

// DIE KOSTEN je Klang-Takt: Welt-Abfragen zählen (nur innerhalb symphonyTick), vor und nach der Injektion.
async function kosten(page, stubs) {
    return page.evaluate(async (stubs) => {
        const r = anazhRealm;
        const st = r.state;
        const P = Object.getPrototypeOf(r);
        const zaehl = { boden: 0, wasser: 0, stroemung: 0, fluss: 0, segmente: 0, bauten: 0 };
        const wer = {};
        let imTakt = false;
        // zählt eine Welt-Abfrage im Takt, der erste Fragende beim Namen
        const zaehle = (k) => {
            if (!imTakt) return;
            zaehl[k]++;
            if (wer[k]) return;
            const m = /at (?:\S+\.)?(\S+) \(/.exec((new Error().stack || "").split("\n")[3] || "");
            wer[k] = m ? m[1] : "?";
        };
        const fns = {
            _voxelSurfaceY: "boden",
            _koerperWasser: "wasser",
            _waterLevelAt: "wasser",
            _waterFlowAt: "stroemung",
            _hydroRiverAt: "fluss",
            _pointSegDist2D: "segmente",
        };
        const alt = {};
        for (const [fn, k] of Object.entries(fns)) {
            alt[fn] = P[fn];
            P[fn] = function () {
                zaehle(k);
                return alt[fn].apply(this, arguments);
            };
        }
        const altTick = P.symphonyTick;
        P.symphonyTick = function () {
            imTakt = true;
            try {
                return altTick.apply(this, arguments);
            } finally {
                imTakt = false;
            }
        };
        const altArchs = st.architectures;
        st.architectures = new Proxy(altArchs, {
            get(t, k, rcv) {
                if (typeof k === "string" && /^\d+$/.test(k)) zaehle("bauten");
                return Reflect.get(t, k, rcv);
            },
        });
        // der Zwilling der Glut (S4): statt des Verzeichnisses (`_blockerMit("glut")`) ein Umlauf über ALLE Bauten
        const altMit = P._blockerMit;
        if (stubs?.alleBauten && altMit) {
            P._blockerMit = function (name) {
                if (name !== "glut") return altMit.call(this, name);
                return this.state.architectures.filter((e) => e && this._glutFlaeche(e) > 0);
            };
        }
        const lauf = async (n) => {
            for (const k of Object.keys(zaehl)) zaehl[k] = 0;
            for (let i = 0; i < n; i++) {
                r.symphonyTick();
                await sleep(25);
            }
            const o = {};
            for (const k of Object.keys(zaehl)) o[k] = +(zaehl[k] / n).toFixed(2);
            return o;
        };
        let vor, nach;
        const hydro = st.hydrosphere;
        const altRivers = hydro && Array.isArray(hydro.rivers) ? hydro.rivers : null;
        try {
            vor = await lauf(40);
            // Injektion: 4000 ferne Bauten (5 km), 200 ferne Fluss-Läufe (je 20 Punkte).
            const p = st.playerMesh.position;
            for (let i = 0; i < 4000; i++)
                altArchs.push({
                    type: "glutbrunnen",
                    position: { x: p.x + 5000 + i, y: 0, z: p.z + 5000 },
                    __klangFake: true,
                });
            if (altRivers) {
                const fake = [];
                for (let i = 0; i < 200; i++) {
                    const pts = [];
                    for (let k = 0; k < 20; k++) pts.push({ x: p.x + 6000 + k * 10, y: 0, z: p.z + 6000 + i * 10 });
                    fake.push({ points: pts, __klangFake: true });
                }
                hydro.rivers = altRivers.concat(fake);
            }
            nach = await lauf(40);
        } finally {
            for (let i = altArchs.length - 1; i >= 0; i--)
                if (altArchs[i] && altArchs[i].__klangFake) altArchs.splice(i, 1);
            if (altRivers) hydro.rivers = altRivers;
            st.architectures = altArchs;
            P.symphonyTick = altTick;
            for (const fn of Object.keys(alt)) P[fn] = alt[fn];
            if (altMit) P._blockerMit = altMit;
        }
        const wachsen = [];
        for (const k of Object.keys(vor))
            if (nach[k] > vor[k] * 1.25 + 2) wachsen.push(`${k} ${vor[k]} → ${nach[k]} (${wer[k] || "?"})`);
        return { vor, nach, wachsen };
    }, stubs);
}

// DAS LAB: worlds/klang — der Welt-Modus baut über __klangCore.umweltGraph; je Ort hält die Lab-Lage das SOLL.
async function labPruefen(browser) {
    const page = await browser.newPage();
    try {
        await server.zeige(page, 60000, "worlds/klang/index.html", "load");
        return await page.evaluate(async () => {
            const K = __klangCore;
            const o = { weltModus: !!document.getElementById("weltModeBtn"), graphGebaut: 0, orte: {} };
            if (!o.weltModus) return o;
            const org = K.umweltGraph;
            K.umweltGraph = function () {
                o.graphGebaut++;
                return org.apply(this, arguments);
            };
            try {
                document.getElementById("weltModeBtn").click();
                const knopf = document.querySelector('[data-welt-ort="seeufer"]');
                if (knopf) knopf.click();
                await sleep(1500);
                const z = window.__klangWelt?.zensus?.() || [];
                o.seeuferUfer = z.some((v) => v.name === "ufer" && v.an);
                for (const [ort, lage] of Object.entries(K.UMWELT.orte)) {
                    const m = K.umweltMischung({ ...lage, boe: 0.7 });
                    // −∞ als −999 über die Brücke (null > −64 wäre wahr — Lehre 17).
                    o.orte[ort] = Object.fromEntries(
                        Object.entries(m).map(([k, v]) => [k, { db: Number.isFinite(v.db) ? v.db : -999 }])
                    );
                }
            } finally {
                K.umweltGraph = org;
            }
            return o;
        });
    } finally {
        await page.close();
    }
}

// (R) RUF ← LEIB (klang.K1): jeder gehörte Vogel ist ein gezeichneter Leib, der Chor singt nur aus gezeichneten Leibern, und
// ohne Leib (`…OhneLeib`) schweigt er. Ein Spiel, das keine Leiber meldet, hat keine. Jeder gezeichnete Leib fliegt
// (luftwasser.K1): ≥ 1 m/s und ≥ 2 m über dem Boden — unter Regen (die Szene regen) ≥ 1 m/s allein: die Regen-Ruhe des
// Gesetzes (vogelLied × (1 − Regen)²) kürzt das Sing-Fenster unter zwei Steigzeiten (vogelBahn), der Sänger erreicht seine
// Höhe dort nie (gemessen 28.10. am z58b-Kandidaten: 2 Leiber, 3,38 m/s, 1,1 m).
const leibUrteil = (name, z) => {
    const [L, singt] = [z.leiber || { gehoert: 0, gezeichnet: 0 }, z.stimmen.some((v) => v.name === "vogel" && v.an)];
    const F = L.flug || {};
    return L.gehoert !== L.gezeichnet ||
        (singt && (!L.gezeichnet || /OhneLeib$/.test(name))) ||
        (L.gezeichnet && !(F.mps >= 1 && (F.hoeheM >= 2 || z.lage?.regen > 0)))
        ? [`R ${name}: ${L.gehoert} gehört, ${L.gezeichnet} gezeichnet${singt ? ", singt" : ""}, Flug ${F.mps} m/s ${F.hoeheM} m — ein Ruf ohne fliegenden Körper`]
        : [];
};
function urteile(daten, offline, lab, ereig, phasen, spitzen) {
    const rot = [];
    const zeilen = [];
    const mixAlle = {};
    // (W) DIE WERKSTATT: der Haupt-Thread rechnet keinen Sample (Texturen, Rufe) — weder auf der Anreise noch an einem
    // Ort, in den Kosten-Takten oder für ein Ereignis.
    const werkstatt = (wo, n) => {
        if (n > 0) rot.push(`W ${wo}: ${n} Samples im Haupt-Thread gerechnet (rechnen darf nur die Klang-Werkstatt)`);
    };
    for (const [wo, n] of Object.entries(phasen || {})) werkstatt(wo, n);
    // (E) Ereignis-Klänge: jede Quelle aus dem Gesetzbuch, keine Verbindung am Master vorbei.
    for (const e of ereig || []) {
        if (e.fehler) {
            rot.push(`E ${e.art}: wirft (${e.fehler})`);
            continue;
        }
        werkstatt(e.art, e.hauptSynthese);
        if (e.still) {
            if (e.quellen.length)
                rot.push(
                    `E ${e.art}: ${e.quellen.length} Quelle(n), wo die Welt still ist (${kette(e.quellen[0].frames, 3)})`
                );
            continue;
        }
        if (!e.quellen.length) rot.push(`E ${e.art}: keine Quelle (stumm)`);
        for (const q of e.quellen)
            if (!imGesetz(q.frames)) rot.push(`E ${e.art}: ${q.art} aus ${kette(q.frames)} trägt kein Gesetz`);
        for (const a of e.amAusgang)
            rot.push(`E ${e.art}: ${kette(a)} verbindet am Master vorbei direkt an den Ausgang`);
    }
    for (const [name, d] of Object.entries(daten)) {
        // (G) Herkunft
        for (const q of d.laufend) {
            if (!imGesetz(q.frames) && !q.frames.some((f) => WIRT_LESER[f.fn]))
                rot.push(
                    `G ${name}: ${q.art} ${q.freq ? Math.round(q.freq) + " Hz " : ""}aus ${kette(q.frames)} trägt kein Gesetz`
                );
        }
        // (O) der Ort steht: die Stimmen des Walds hört nur, wer ihn gepflanzt findet (`W.waldSteht`)
        if (d.um?.wald === false)
            rot.push(
                `O ${name}: der Wald steht nach ${d.um.takte} Takten nicht (Schlange, Pflanz-Gang oder Streu wartet)`
            );
        // (W) die Welt rechnet in der Werkstatt
        werkstatt(name, d.hauptSynthese);
        if (d.zensus && !d.zensus.werkstatt?.laeuft) rot.push(`W ${name}: keine Klang-Werkstatt`);
        // (H) Hörbar-Kosten
        const z = d.zensus;
        const stimmen = z?.stimmen || [];
        const sumQuellen = stimmen.filter((v) => v.an).reduce((a, v) => a + v.quellen, 0);
        const dauernd = d.laufend.filter((q) => q.dauernd);
        for (const q of dauernd) {
            if (!q.gesetzKnoten) rot.push(`H ${name}: dauernde Quelle ohne Gesetz-Stimme (${kette(q.frames)})`);
        }
        const imKnoten = dauernd.filter((q) => q.gesetzKnoten).length;
        if (z && imKnoten !== sumQuellen)
            rot.push(`H ${name}: ${imKnoten} laufende Gesetz-Quellen ≠ ${sumQuellen} der hörbaren Stimmen`);
        for (const v of stimmen)
            if (v.an && !(v.db >= -68))
                rot.push(`H ${name}: Stimme ${v.name} läuft bei ${v.db} dB (unter der Hörschwelle)`);
        if (z) rot.push(...leibUrteil(name, z));
        // (S) SOLL
        const m = d.mixMitte;
        if (m) mixAlle[name] = m;
        zeilen.push({ name, d, stimmen, dauernd: dauernd.length });
    }
    for (const [name, m] of Object.entries(mixAlle)) {
        if (!SOLL[name]) continue;
        const [sz, d] = [SZENEN[name], daten[name]];
        for (const [txt, ok] of SOLL[name](m, mixAlle, d?.ort))
            if (!ok) rot.push(`${sz ? "N" : "S"} ${name}: ${txt} verfehlt`);
        if (sz?.weg && !(d.um.weg >= sz.weg && !sz.wagen === !d.um.sattel))
            rot.push(`N ${name}: kein Gang (${d.um.weg} von ${sz.weg} m, Sattel?)`);
    }
    // Der Wald-Ort ist aus der Kronen-Karte gewählt, die auch das Ohr liest — geprüft wird er am BESTAND, an den
    // Objekten der Welt (stehende Bäume ≤ 15 m, Einträge + Streu-Zellen): mindestens doppelt so dicht wie die Wiese.
    if (daten.wald && daten.wiese && !(daten.wald.baeume > 0 && daten.wald.baeume >= 2 * daten.wiese.baeume))
        rot.push(
            `S wald: der Bestand trägt keinen Wald (${daten.wald.baeume} Bäume ≤ 15 m, Soll ≥ 2 × Wiese ${daten.wiese.baeume})`
        );
    for (const name of Object.keys(SOLL))
        if (!mixAlle[name])
            rot.push(
                daten[name]
                    ? `S ${name}: kein Umwelt-Gesetz am Ohr (Lage/Mischung fehlt)`
                    : `O ${name}: der Ort fehlt (aus dem Gesetz nicht gefunden)`
            );
    // Offline-Render: Pegel und Band
    for (const [name, o] of Object.entries(offline || {})) {
        if (!o) continue;
        for (const [stimme, v] of Object.entries(o)) {
            if (Math.abs(v.gemessenDb - v.gesetzDb) > 1.5)
                rot.push(`S ${name}/${stimme}: Offline ${v.gemessenDb} dB ≠ Gesetz ${v.gesetzDb} dB`);
            const B = BAND[stimme];
            if (B && !(v.schwerpunktHz >= B[0] && v.schwerpunktHz <= B[1]))
                rot.push(`S ${name}/${stimme}: Schwerpunkt ${v.schwerpunktHz} Hz außerhalb ${B[0]}–${B[1]}`);
        }
    }
    // (L) Lab = Welt
    if (lab) {
        if (!lab.weltModus) rot.push("L: das Klang-Studio kennt die Welt nicht (kein Welt-Modus)");
        else {
            if (!lab.graphGebaut) rot.push("L: das Lab baut seine Welt nicht über __klangCore.umweltGraph");
            if (!lab.seeuferUfer) rot.push("L: das Seeufer des Labs trägt kein Ufer");
            for (const name of Object.keys(SOLL).filter((n) => !SZENEN[n] || lab.orte[n])) {
                const m = lab.orte[name];
                if (!m) {
                    rot.push(`L: Lab-Ort ${name} fehlt`);
                    continue;
                }
                for (const [txt, ok] of SOLL[name](m, lab.orte)) if (!ok) rot.push(`L ${name}: ${txt} verfehlt (Lab)`);
            }
        }
    }
    // (P) keine Spitze erreicht 0 dBFS am Ausgang (die Spitzen-Wand hält sie unter UMWELT.spitze.deckeDb).
    for (const [wo, sp] of Object.entries(spitzen || {}))
        if (sp?.spitzeDbfs >= 0)
            rot.push(
                `P ${wo}: Spitze ${sp.spitzeDbfs} dBFS am Ausgang (${sp.wand ? "trotz" : "ohne"} Spitzen-Wand) — Clipping`
            );
    return { rot, zeilen };
}

function drucke(zeilen, kostenErg) {
    for (const { name, d, stimmen, dauernd } of zeilen)
        console.log(
            `── ${name} (${Math.round(d.ort.x)}/${Math.round(d.ort.z)}, ${d.baeume} Bäume ≤ 15 m): ${stimmen
                .filter((v) => v.an)
                .map((v) => `${v.name} ${v.db.toFixed(1)} dB`)
                .join(" · ")} · ${d.laufend.length} Quellen (${dauernd} dauernd) · Synthese ${d.hauptSynthese} · Leiber ${JSON.stringify(d.zensus?.leiber)}`
        );
    console.log(
        `── KOSTEN je Klang-Takt vor ${JSON.stringify(kostenErg.vor)} → nach 4000 Bauten + 200 Fluss-Läufen ${JSON.stringify(kostenErg.nach)}`
    );
}

// (T) DER KLANG-TAKT IN BEWEGUNG (`--takt [--echt]`, klang.K5): je präsentiertem Bild die Haupt-Faden-ms der Klang-Arbeit
// (symphonyTick + _schrittKlangTick + _tierRuf, der äußere Aufruf) im echten Spiel, Klang über den Knopf — gehen, Fahrt
// (GT, Gas und rückwärts im Wechsel), nachts gehen; p95 ≤ TAKT_SOLL_MS je Phase, der Träger der Bilder über dem Soll beim
// Namen; über den Gang 0 Aussetzer am Ausgang. Die Seite ist isoliert (COOP + COEP: 5 µs statt des 100-µs-Rasters).
// `--echt`: Fenster, echte GPU und Audio-Gerät. `--minuten`: der Spielgang, gehen · Fahrt · nachts zu 4 : 3 : 3.
// `--selftest`: Phase „selbst", der Takt fragt je Bild 300 Rufer → ROT, eine stotternde Stimme → Aussetzer gezählt.
const TAKT_SOLL_MS = 0.2;
const MINUTEN = Number(opt("--minuten")) || 0;
const TAKT_TEILE = [
    "_lofiPlayChord",
    "_lofiPlayMelody",
    "_lofiPlayGroove",
    "_lofiPlayBass",
    "_lofiRaum",
    "_umweltLage",
    "_tierRufTakt",
    "_fahrtKlangTick",
    "_schrittMaterialAt",
    "_playSchrittOneShot",
];
function taktSeite(m, echt, namen) {
    const r = anazhRealm;
    const st = r.state;
    const P = Object.getPrototypeOf(r);
    const T = (window.__klangTakt = { phase: "", bilder: [], weg: 0, m });
    let tiefe = 0;
    let b = { ms: 0, teile: {} }; // das laufende Bild
    const huelle = (o, fn, nach, tief = 0) => {
        const org = o[fn];
        o[fn] = function () {
            const t = performance.now();
            tiefe += tief;
            try {
                return org.apply(this, arguments);
            } finally {
                tiefe -= tief;
                nach(performance.now() - t);
            }
        };
    };
    // der äußere Aufruf zählt (ein innerer liegt in ihm)
    for (const fn of ["symphonyTick", "_schrittKlangTick", "_tierRuf"]) huelle(P, fn, (d) => tiefe || (b.ms += d), 1);
    for (const fn of namen) if (P[fn]) huelle(P, fn, (d) => (b.teile[fn] = (b.teile[fn] || 0) + d));
    let vor;
    const bild = () => {
        const e = st.player?.mountedArch != null ? window.__klangGT : null;
        const q = e ? e.position : st.playerMesh.position;
        if (vor?.q === q) T.weg += Math.hypot(q.x - vor.x, q.z - vor.z);
        vor = { q, x: q.x, z: q.z };
        if (T.phase) T.bilder.push(b);
        b = { ms: 0, teile: {} };
        requestAnimationFrame(bild);
    };
    requestAnimationFrame(bild);
    // der Null-Renderer zeichnet nicht: hier trägt die Linse den Takt des Spiels (das Fenster trägt ihn selbst)
    if (!echt) requestAnimationFrame(__klangW.spiel);
    st.playerMesh.position.set(m.x, r._voxelSurfaceY(m.x, m.z) + 1.8, m.z);
    document.getElementById("anazh-symphony-toggle").click();
    T.start = (p) => Object.assign(T, { phase: p, bilder: [], weg0: T.weg });
    T.urteil = (soll) => {
        T.phase = "";
        const s = T.bilder.map((x) => x.ms).sort((x, y) => x - y);
        const q = (k) => +(s[Math.min(s.length - 1, Math.floor(k * s.length))] || 0).toFixed(2);
        const ueber = T.bilder.filter((x) => x.ms > soll);
        const last = {};
        for (const x of ueber) for (const k in x.teile) last[k] = (last[k] || 0) + x.teile[k] / ueber.length;
        return {
            bilder: s.length,
            weg: Math.round(T.weg - T.weg0),
            p95: q(0.95),
            max: q(1),
            traeger: Object.entries(last)
                .sort((u, v) => v[1] - u[1])
                .slice(0, 3)
                .map(([k, v]) => `${k} ${v.toFixed(2)}`),
        };
    };
    // der Aussetzer-Zähler am Ausgang (AudioContext.playbackStats), dazu ob es noch der Kontext des ersten Abrufs ist
    T.audio = () => {
        const c = st.symphony.ctx,
            p = c?.playbackStats;
        T.ctx ||= c;
        return p && { n: p.underrunEvents, still: p.underrunDuration, s: p.totalDuration, gleich: T.ctx === c };
    };
    T.uhr = () => st.symphony.ctx?.currentTime ?? NaN;
    // sein Täter: eine Worklet-Stimme rechnet je Render-Quantum (2,7 ms) 8 ms
    T.stotterer = async () => {
        await st.symphony.ctx.audioWorklet.addModule("/__stotter.js");
        new AudioWorkletNode(st.symphony.ctx, "stotter").connect(st.symphony.ctx.destination);
    };
    // der Täter des Takts: 300 Rufer im Hör-Radius, und der Takt fragt sie je Bild (statt im Misch-Takt)
    T.taeter = () => {
        for (let i = 0; i < 300; i++)
            st.creatures.push({
                position: { x: m.x + (i % 20) * 2, y: 0, z: m.z + Math.floor(i / 20) * 2 },
                userData: { emotions: { joy: 0.5 } },
            });
        const alt = P._umweltKlangTick;
        P._umweltKlangTick = function () {
            alt.apply(this, arguments);
            for (const c of st.creatures) this._koerperWasser(c.position.x, c.position.z, 0);
            this._tierRufTakt(1 / 60);
        };
    };
    return { isoliert: self.crossOriginIsolated, tiere: st.creatures.length };
}
// Gehen: W gehalten, je 60 Bilder ein Tipp auf A. Fahrt (`pendeln`): je 120 Bilder Gas (W) und rückwärts (S) im Wechsel —
// der Motor dreht hoch und runter, der GT bleibt in der Lichtung der Mess-Wiese. Die Taste hält bis zum Bild, nie nach der Uhr;
// `sek`: die Phase geht, bis der Ausgang so lange spielte (die Uhr des Klangs).
async function taktPhase(page, phase, n, pendeln, sek = 0) {
    const uhr = () => page.evaluate(() => __klangTakt.uhr());
    const t0 = await page.evaluate((p) => (__klangTakt.start(p), __klangTakt.uhr()), phase);
    for (let i = 0; i < n || (await uhr()) - t0 < sek; i++) {
        const taste = pendeln && Math.floor(i / 2) % 2 ? "s" : "w";
        await halteBis(page, { taste, ziel: (b) => __klangTakt.bilder.length >= b, args: [60 * (i + 1)] });
        if (!pendeln) await page.keyboard.press("a", { delay: 70 });
    }
    const z = await page.evaluate((soll) => __klangTakt.urteil(soll), TAKT_SOLL_MS);
    console.log(
        `── ${phase}: Klang-ms je Bild p95 ${z.p95} · max ${z.max} (${z.bilder} Bilder, ${z.weg} m) · über dem Soll trägt ${z.traeger.join(" · ") || "—"}`
    );
    return z;
}
async function takt(page, erg) {
    erg.seite = await page.evaluate(taktSeite, MESS, ECHT, TAKT_TEILE);
    // bereit: W gehalten, bis der Spieler geht (die Ankunft gibt die Kontrolle frei; im Fenster kalt bis 80 s)
    await halteBis(page, { taste: "w", ziel: () => __klangTakt.weg >= 3, frist: 180000 });
    await taktPhase(page, "ein", 5);
    const audio = () => page.evaluate(() => __klangTakt.audio());
    const a = await audio();
    const ph = (erg.phasen = {});
    ph.gehen = await taktPhase(page, "gehen", 20, false, MINUTEN * 24);
    // zurück in die Mitte der Lichtung, der GT daneben, aufsitzen
    await page.evaluate(async () => {
        const r = anazhRealm,
            p = r.state.playerMesh.position,
            m = __klangTakt.m;
        p.set(m.x, r._voxelSurfaceY(m.x, m.z) + 1.8, m.z);
        r.mountArchitecture((window.__klangGT = await __klangW.wagen(p.x + 3, p.z)));
    });
    ph.fahrt = await taktPhase(page, "fahrt", 20, true, MINUTEN * 18);
    ph.fahrt.sattel = await page.evaluate(() => !!(anazhRealm.state.symphony.fahrt || new Map()).size);
    await page.evaluate(() => {
        const r = anazhRealm;
        r.dismountArchitecture();
        r.setTimeOfDay(0, "regler");
    });
    ph.nacht = await taktPhase(page, "nacht", 20, false, MINUTEN * 18);
    const b = await audio();
    const aus =
        a && b?.gleich ? { n: b.n - a.n, still: +(b.still - a.still).toFixed(3), s: +(b.s - a.s).toFixed(1) } : null;
    erg.aussetzer = aus;
    console.log(
        `── Aussetzer am Ausgang: ${aus ? `${aus.n} in ${aus.s} s Wiedergabe (${aus.still} s still)` : "ungezählt"}`
    );
    const rot = (erg.rot = []);
    if (!aus) rot.push("T aussetzer: ungezählt — kein playbackStats am Kontext, oder er wechselte");
    else if (aus.n) rot.push(`T aussetzer: ${aus.n} in ${aus.s} s Wiedergabe`);
    for (const [name, z] of Object.entries(ph)) {
        if (!(z.bilder >= 300 && z.weg >= 10))
            rot.push(`T ${name}: ${z.bilder} Bilder, ${z.weg} m — keine Bewegung gemessen`);
        else if (!(z.p95 <= TAKT_SOLL_MS))
            rot.push(
                `T ${name}: Klang-ms je Bild p95 ${z.p95} > ${TAKT_SOLL_MS} (max ${z.max}; trägt ${z.traeger.join(" · ")})`
            );
    }
    if (!ph.fahrt.sattel) rot.push("T fahrt: die Stimme der Fahrt klang nicht (nicht im Sattel)");
    let feuert = true;
    if (SELBST) {
        await page.evaluate(() => __klangTakt.taeter());
        const s0 = await audio();
        await page.evaluate(() => __klangTakt.stotterer());
        erg.selbst = await taktPhase(page, "selbst", 10);
        const s1 = await audio();
        erg.selbst.aussetzer = s0 && s1 ? s1.n - s0.n : null;
        feuert = erg.selbst.p95 > TAKT_SOLL_MS && erg.selbst.aussetzer > 0;
        console.log(
            `${feuert ? "✅" : "❌"} SELBSTTEST: 300 Rufer je Bild p95 ${erg.selbst.p95} ms · die stotternde Stimme ${erg.selbst.aussetzer} Aussetzer`
        );
    }
    for (const t of rot) console.log("   " + t);
    console.log(
        rot.length
            ? `❌ ROT — Klang-Takt in Bewegung: ${rot.length} Befund(e)`
            : `✅ GRÜN — Klang-Takt in Bewegung p95 ≤ ${TAKT_SOLL_MS} ms je Bild (gehen · Fahrt · nachts)`
    );
    return !rot.length && feuert ? 0 : 1;
}

// (F) DER KÖRPER KLINGT AUS BEWEGUNG (klang.K4 Staffel 2, am Messort nach dem Zensus): je Abgriff liegt der Master-Bus EINEN
// Klang-Takt (oder einen Sturz) lang an einem OfflineAudioContext (wie Q11 halten.K2 in gate:kampf-gefuehl); die Probe fährt den
// festen Schritt des Leibs selbst. Doppler ist Zeit-Stauchung: er misst sich an der Periode. (M) im
// Sattel des GT, Gas über die Taste: der Grundton je Drehzahl der Fahrt (klang `fahrtUpm`), Hz/Upm fest ± 2 % über ≥ 4 Stufen;
// (L) ein Hopser aus 0,2 m bleibt stumm, Stürze aus 1 · 2 · 4 · 8 · 12 m bei 30 Bildern/s (zwei
// Sim-Schritte je Bild) landen genau einmal mit dem Aufprall-Tempo des Leib-Lösers (`_sturzTempo` am Schritt), je Stufe ≥ 0,5 dB
// lauter am Bus. (D) ein gestoßener GT rutscht 4 m am stehenden Ohr vorbei: die Periode seines Abrollens (klang
// FAHRT.abrollen.grundHz) 9 · 4,5 · 2 m vor und hinter dem nächsten Punkt ist der Doppler — Vorzeichen und Betrag (± 10 %) aus
// der Relativ-Geschwindigkeit, c 343 m/s: sechs Radial-Geschwindigkeiten, an jeder das Gesetz, ist die Proportion (klang.K4 Staffel 2). Die Täter des Selbsttests (S13): ein stummer Motor, eine tonlose Landung, ein Doppler mit
// falschem Vorzeichen.
async function koerperSeite(m, mut) {
    const [r, K] = [anazhRealm, __klangCore];
    const [s, A, P, amOhr] = [r.state, r.constructor, Object.getPrototypeOf(r), K.fahrtAmOhr];
    const [sy, pm, gas, F] = [
        s.symphony,
        s.playerMesh,
        A.FAHR_TASTEN.gas.tasten[0],
        { motor: [], landung: [], doppler: [] },
    ];
    if (mut === "motor") r._fahrtKlangTick = () => {};
    if (mut === "doppler") K.fahrtAmOhr = (...a) => ({ ...amOhr(...a), doppler: 1 / amOhr(...a).doppler });
    if (mut === "landung")
        r._schrittKlangParams = (...a) => ({ ...P._schrittKlangParams.apply(r, a), ...(a[1] && { gain: 0 }) });
    await __klangW.umstellen(m.x, m.z);
    __buehne(); // Mittag · Sonne · Sommer über das Spieler-Wort (R9), nie die Lage des Starts
    let t = 1e4;
    const bild = (dt, n = 1) => {
        for (let i = 0; i < n; i++) (r._loopFixedStep(dt, (t += dt)), r.animatePlayerSoul(t));
    };
    const abgriff = async (tick, sek = 1, ab = 0.3) => {
        const [vor, ctx, zufall] = [{ ...sy }, new OfflineAudioContext(1, 48000 * sek, 48000), Math.random];
        Object.assign(sy, { ctx, masterGain: ctx.destination, enabled: true, fahrt: null });
        // der Klang-Körper rauscht aus Math.random (Rausch-Puffer je Kontext, Start-Versatz): je Abgriff derselbe Samen — sonst
        // streute der Pegel ±0,5 dB, und die Landung „skalierte nicht" an wechselnden Höhen (CI bbf798f9: 12 m +0,48 dB)
        let q = 1;
        Math.random = () => (q = (q * 16807) % 2147483647) / 2147483647;
        try {
            tick();
        } finally {
            Object.assign(sy, vor);
            Math.random = zufall;
        }
        const d = (await ctx.startRendering()).getChannelData(0).subarray(48000 * ab);
        return Object.assign(d, { db: 10 * Math.log10(d.reduce((a, x) => a + x * x, 0) / d.length) });
    };
    // der Gipfel von f in [von, bis], fein um ihn; die Tonhöhe des Motors ist seine stärkste Linie (Goertzel: die Zünd-Folge),
    // die des Abrollens seine Periode (der Gipfel der Autokorrelation)
    const gipfel = (f, von, bis, w, n = 2) => {
        let [x, p] = [von, -Infinity];
        for (let k = von; k <= bis; k += w) {
            const q = f(k);
            if (q > p) [x, p] = [k, q];
        }
        return n > 1 ? gipfel(f, x - w, x + w, w / 8, n - 1) : x;
    };
    const linie = (d) => (f) => {
        const c = 2 * Math.cos((2 * Math.PI * f) / 48000);
        let [a, b] = [0, 0];
        for (const x of d) [a, b] = [x + c * a - b, a];
        return a * a + b * b - c * a * b;
    };
    const ac = (d) => (L) => d.subarray(L).reduce((a, x, i) => a + x * d[i], 0);
    const wagen = __klangW.wagen;
    const stell = (x, z, y = r._voxelSurfaceY(x, z) + 1.8) => (pm.position.set(x, y, z), s.playerVel.setValue(0, 0, 0));
    try {
        if (!mut || mut === "motor") {
            stell(m.x, m.z);
            const e = await wagen(m.x + 3, m.z);
            r.mountArchitecture(e);
            s.keys[gas] = true;
            for (let i = 0; i < 20; i++) {
                bild(1 / 60, 12);
                const d = await abgriff(() => r._fahrtKlangTick());
                F.motor.push([K.fahrtUpm(e._fahr.vlong, e._fahrSatz.vmax, 0), gipfel(linie(d), 20, 1000, 1)]);
            }
            s.keys[gas] = false;
            r.dismountArchitecture();
            r.removeArchitecture(e, { still: true });
        }
        if (!mut || mut === "landung") {
            let leib = 0;
            r._loopPhysicsSync = function () {
                P._loopPhysicsSync.apply(this, arguments);
                leib = s._sturzTempo || leib;
            };
            for (const h of [0.2, 1, 2, 4, 8, 12]) {
                r.recomputePlayerStats({ voll: true });
                const n0 = s._schrittKlang?.landungen || 0;
                const d = await abgriff(
                    () => {
                        stell(m.x, m.z, r.getTerrainHeightAt(m.x, m.z) + A.PLAYER_FOOT_OFFSET + h);
                        [s._fieldVy, s.isInAir, leib] = [0, true, 0];
                        for (let k = 0; k < 600 && (k < 2 || s.isInAir); k++) bild(1 / 30);
                        bild(1 / 30, 4);
                    },
                    0.8,
                    0
                );
                const k = s._schrittKlang;
                F.landung.push([h, leib, k.landungen - n0, k.letzter?.aufprall, d.db]);
            }
            delete r._loopPhysicsSync;
        }
        if (!mut || mut === "doppler") {
            const e = await wagen(m.x, m.z + 30);
            const G = r._fahrStossSatz(e);
            r._fahrWagenStoss(e, G, 0, 0); // der Fahr-Zustand des Geparkten (seine Achse), ohne Stoß
            const [fz, T0] = [e._fahr, 48000 / K.FAHRT.abrollen.grundHz];
            const [fx, fz2, v] = [Math.cos(fz.yaw), -Math.sin(fz.yaw), 24 + G.handDecel * A.FIXED_DT];
            stell(fz.x + 12 * fx + 4 * fz2, fz.z + 12 * fz2 - 4 * fx);
            bild(1 / 60, 30);
            r._fahrWagenStoss(e, G, v * fx, v * fz2);
            for (const wo of [-9, -4.5, -2, 2, 4.5, 9]) {
                for (let k = 0; k < 300 && (fz.x - pm.position.x) * fx + (fz.z - pm.position.z) * fz2 < wo; k++)
                    bild(1 / 60);
                const [o, w, d] = [pm.position, r._fahrWagenGeschw(e), await abgriff(() => r._fahrtKlangTick(), 2)];
                const u = [o.x - fz.x, o.y - fz.y, o.z - fz.z];
                F.doppler.push([
                    wo,
                    343 / (343 - (w.x * u[0] + fz.vy * u[1] + w.z * u[2]) / Math.hypot(...u)),
                    d.db > -90 && T0 / gipfel(ac(d), T0 * 0.8, T0 * 1.25, 8),
                ]);
            }
            r.removeArchitecture(e, { still: true });
        }
    } finally {
        K.fahrtAmOhr = amOhr;
        for (const g of ["_fahrtKlangTick", "_schrittKlangParams"]) delete r[g];
        s.keys[gas] = false;
    }
    return F;
}
// Das Urteil (F) je Teil beim Namen und die drei Zahlen: Hz je 1000 Upm, Landung dB je m/s, Doppler je Vorbeifahrt.
function koerperUrteil(F) {
    const q = F.motor.map(([u, hz]) => (hz / u) * 1000).sort((a, b) => a - b);
    const [rot, fall] = [[], F.landung.slice(1)];
    if (q.length && (new Set(F.motor.map(([u]) => Math.round(u / 250))).size < 4 || !(q.at(-1) / q[0] <= 1.04)))
        rot.push(`F motor stumm: ${q[0]}–${q.at(-1)} Hz je 1000 Upm`);
    if (F.landung[0] && F.landung[0][2]) rot.push(`F landung: der Hopser klingt`);
    fall.forEach(([h, leib, n, klang, db], i) => {
        if (n !== 1 || !(db > -90)) rot.push(`F landung ${h} m tonlos (${n}×, ${db} dB)`);
        else if (Math.abs(klang - leib) > 1e-3) rot.push(`F landung ${h} m: Klang ${klang}, Leib-Löser ${leib} m/s`);
        else if (i && !(db >= fall[i - 1][4] + 0.5)) rot.push(`F landung ${h} m skaliert nicht (${db} dB)`);
    });
    for (const [wo, soll, ist] of F.doppler)
        if (!ist) rot.push(`F doppler ${wo} m: die Vorbeifahrt schweigt`);
        else if ((ist - 1) * (soll - 1) <= 0) rot.push(`F doppler ${wo} m: falsches Vorzeichen (${ist}, soll ${soll})`);
        else if (!(Math.abs(ist - soll) <= 0.1 * Math.abs(soll - 1)))
            rot.push(`F doppler ${wo} m: ${ist}, soll ${soll}`);
    const [l0, l1] = [fall[0] || [], fall.at(-1) || []];
    return {
        rot,
        zahl: `Motor ${q[q.length >> 1]} Hz je 1000 Upm · Landung ${(l1[4] - l0[4]) / (l1[1] - l0[1])} dB je m/s (${fall.map((x) => `${x[0]} m ${x[1]} m/s ${x[4]} dB`).join(" · ")}) · Doppler ${F.doppler.map((x) => `${x[0]} m ${x[2]}/${x[1]}`).join(" · ")}`,
    };
}

// (U) GESEHEN = GEHÖRT AM BACH UND IM REGEN (`--gesehen`, klang.K2 Staffel 2): der Spieler geht im echten Spiel (Ego, W und S
// gehalten bis zum Ereignis) an den Bach der Mess-Wiese und zurück, derweil spricht er das Wetter (Sturm, dann bewölkt). Je
// 0,1 s das Ohr — RMS am Gain der Stimmen fluss + ufer und regen (ein Analyser, die Stimme an ihrem Puffer erkannt) — und das
// Bild: die sichtbare Strömung √Σ adv · flowMix / d² über die Wasser-Vertices im Blick (flowMix = die Rampe, mit der der Shader
// die Strähnen über |aFlow| treibt), der Regen = die Deckkraft des gezeichneten Regens. Kreuzkorrelation je Paar in 0,5-s-Fenstern,
// Lag ±3 s wie Staffel 1 (m15-wind): r ≥ 0,6 bei Lag 0, CV beider Reihen ≥ 0,1, nie stumm im Bild. `--selftest`: ein entkoppelter Pegel (Fluss,
// Ufer und Regen am Ohr eingefroren, das Bild geht weiter) ist ROT beim Namen.
const GESEHEN_SOLL = 0.6;
async function gesehenSeite(m) {
    const r = anazhRealm;
    const st = r.state;
    const adv = r.constructor.Gesetz("terrain:WASSER_GESETZ").wellen.adv;
    requestAnimationFrame(__klangW.spiel);
    let h = null;
    await __weltDa((w) => (w._ensureHydroTilesAround(m.x, m.z, 200), (h = w._hydroFor(m.x, m.z)) && h.ready));
    // der nächste Punkt des Bachs; die Normale zur Mess-Wiese steht auf ihm senkrecht
    let P = { d: Infinity };
    for (const f of h.rivers || [])
        for (const q of f.points)
            if (Math.hypot(q.x - m.x, q.z - m.z) < P.d) P = { x: q.x, z: q.z, d: Math.hypot(q.x - m.x, q.z - m.z) };
    const [nx, nz] = [(m.x - P.x) / P.d, (m.z - P.z) / P.d];
    st.playerMesh.position.set(P.x + nx * 45, r._voxelSurfaceY(P.x + nx * 45, P.z + nz * 45) + 1.8, P.z + nz * 45);
    r.setCameraMode("first");
    st.yaw = Math.atan2(-nx, -nz); // der Blick zum Wasser (`_blickVorn`: vorn = (sin yaw, cos yaw))
    st.pitch = -0.2;
    document.getElementById("anazh-symphony-toggle").click();
    const pm = st.playerMesh.position;
    const G = (window.__gesehen = { proben: [] });
    G.abstand = () => Math.hypot(pm.x - P.x, pm.z - P.z);
    G.amWasser = () => G.abstand() < 6 || r._nassAt(pm.x - nx * 3, pm.z - nz * 3);
    G.wandelt = () => !!st.weatherTransition;
    // DAS OHR: je Stimme der Gain ihrer laufenden Quelle (Quelle → Panner → Filter → Gain, umweltGraph), ein Analyser daran
    const ohr = {};
    const rms = (name) => {
        const ctx = st.symphony.ctx;
        const S = __klangCore.UMWELT.stimmen[name];
        const o = (ohr[name] ||= { an: ctx.createAnalyser(), td: new Float32Array(2048) });
        const q = __klangQuellen.findLast(
            ({ ctx: c, start, stop, knoten: { buffer: b } }) =>
                c === ctx &&
                start != null &&
                stop == null &&
                b?.sampleRate === S.sr &&
                Math.abs(b.duration - S.sek) < 0.05
        );
        let g = q?.knoten;
        for (let k = 0; k < 3 && g; k++) g = g.__an && g.__an[0];
        if (g !== o.gain) g?.connect(o.an), (o.gain = g);
        if (!g) return 0;
        o.an.getFloatTimeDomainData(o.td);
        return Math.sqrt(o.td.reduce((x, v) => x + v * v, 0) / o.td.length);
    };
    // DAS BILD: die Strömung, die das Wasser im Blick zeichnet, und die Deckkraft des Regens
    const fr = new THREE.Frustum();
    const v = new THREE.Vector3();
    const stroemung = (cam) => {
        cam.updateMatrixWorld();
        fr.setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
        let summe = 0;
        st.scene.traverse((o) => {
            const f =
                o.isMesh && o.visible && o.material === st.hydroSurfaceMaterial && o.geometry.getAttribute("aFlow");
            for (let k = 0; f && k < f.count; k++) {
                const t = Math.min(1, Math.max(0, (Math.hypot(f.getX(k), f.getY(k)) - 0.03) / 0.27));
                if (t && fr.containsPoint(v.fromBufferAttribute(o.geometry.getAttribute("position"), k)))
                    summe += (adv * t * t * (3 - 2 * t)) / Math.max(4, v.distanceToSquared(cam.position));
            }
        });
        return Math.sqrt(summe);
    };
    setInterval(() => {
        const R = r._rainSystem;
        if (st.symphony.ctx)
            G.proben.push([Math.hypot(rms("fluss"), rms("ufer")), stroemung(st.camera), rms("regen"), R?.mesh.visible ? R.mesh.material.opacity : 0]);
    }, 100);
    // der Täter des Selbsttests: das Ohr hört Fluss, Ufer und Regen, wie sie beim Pflanzen klangen — das Bild geht weiter
    G.taeter = () => {
        const Pr = Object.getPrototypeOf(r);
        const alt = Pr._umweltLage;
        let fest;
        Pr._umweltLage = function () {
            const l = alt.apply(this, arguments);
            return l && Object.assign(l, (fest ||= { fluss: l.fluss, ufer: l.ufer, regen: l.regen }));
        };
        G.proben = [];
    };
    return [P.x, P.z, P.d].map(Math.round);
}
// Je Paar die Kreuzkorrelation in 0,5-s-Fenstern (5 Proben), Lag −3 … +3 s; grün: r bei Lag 0 ≥ Soll, n ≥ 60, CV beider ≥ 0,1, und
// das Ohr schweigt nie, wo das Bild zeigt: höchstens 2 % der Fenster mit Bild ≥ 10 % seiner Spitze tragen ein Ohr unter 10⁻³ RMS.
function gesehenUrteil(proben, ohr, bild) {
    const mittel = (z) => z.reduce((x, w) => x + w, 0) / z.length;
    const reihe = (k) =>
        Array.from({ length: Math.floor(proben.length / 5) }, (_, i) =>
            mittel(proben.slice(5 * i, 5 * i + 5).map((p) => p[k]))
        );
    const [A, B] = [reihe(ohr), reihe(bild)];
    const pear = (x, y) => {
        const [mx, my] = [mittel(x), mittel(y)];
        const [sxy, sxx, syy] = [
            mittel(x.map((u, i) => (u - mx) * (y[i] - my))),
            mittel(x.map((u) => (u - mx) ** 2)),
            mittel(y.map((u) => (u - my) ** 2)),
        ];
        return {
            r: sxy / Math.sqrt(sxx * syy) || 0,
            n: x.length,
            cvBild: Math.sqrt(sxx) / mx || 0,
            cvOhr: Math.sqrt(syy) / my || 0,
        };
    };
    const lags = [];
    for (let k = -6; k <= 6; k++)
        lags.push({
            lagS: k / 2,
            ...pear(
                B.slice(Math.max(0, k), B.length + Math.min(0, k)),
                A.slice(-Math.min(0, k), A.length - Math.max(0, k))
            ),
        });
    const [r0, best] = [lags[6], lags.reduce((x, y) => (y.r > x.r ? y : x))];
    const zeigt = B.map((b) => b >= 0.1 * Math.max(...B));
    const sicht = zeigt.filter(Boolean).length;
    const stumm = zeigt.filter((z, i) => z && A[i] < 1e-3).length;
    const gruen = r0.n >= 60 && r0.r >= GESEHEN_SOLL && r0.cvBild >= 0.1 && r0.cvOhr >= 0.1 && stumm <= 0.02 * sicht;
    return { gruen, r0, best, stumm, sicht, lags };
}
// Gehen, bis das Wetter seine Worte gesprochen hat: hin (W, bis das Wasser vor den Füßen liegt) und zurück (S, bis 45 m);
// höchstens 16 Gänge. Dann je Paar das Urteil beim Namen.
async function gesehenGang(page, worte) {
    const G = (f, ...a) => page.evaluate(f, ...a);
    let i = 0;
    await G((w) => anazhRealm._setWeather(w, "human"), worte[0]);
    for (let g = 0; g < 16 && (i < worte.length || g % 2); g++) {
        const ziel = g % 2 ? () => __gesehen.abstand() >= 45 : () => __gesehen.amWasser();
        if (!(await halteBis(page, { taste: "ws"[g % 2], ziel, frist: g ? 60000 : 180000 })).erreicht)
            throw new Error(`der Gang ${g} am Bach kam nicht an`);
        if (!(await G(() => __gesehen.wandelt())) && ++i < worte.length)
            await G((w) => anazhRealm._setWeather(w, "human"), worte[i]);
    }
    const proben = await G(() => __gesehen.proben);
    const je = { ufer: gesehenUrteil(proben, 0, 1), regen: gesehenUrteil(proben, 2, 3) };
    for (const [name, { gruen, r0, best, stumm, sicht }] of Object.entries(je))
        console.log(
            `${gruen ? "✅" : "❌"} ${name}: r ${r0.r.toFixed(2)} bei Lag 0 (n ${r0.n}), Spitze ${best.r.toFixed(2)} bei ${best.lagS} s, CV Bild ${r0.cvBild.toFixed(2)} / Ohr ${r0.cvOhr.toFixed(2)}, stumm im Bild ${stumm} von ${sicht} Fenstern`
        );
    return je;
}
async function gesehen(page, erg) {
    erg.seite = await page.evaluate(gesehenSeite, MESS);
    console.log("Gesehen = gehört am Bach der Mess-Wiese (x, z, Abstand):", erg.seite.join(" · "));
    erg.gesehen = await gesehenGang(page, ["stormy", "cloudy"]);
    const rot = Object.keys(erg.gesehen).filter((n) => !erg.gesehen[n].gruen);
    let feuert = true;
    if (SELBST) {
        await page.evaluate(() => __gesehen.taeter());
        erg.selbst = await gesehenGang(page, ["rainy"]);
        feuert = !erg.selbst.ufer.gruen && !erg.selbst.regen.gruen;
        console.log(`${feuert ? "✅" : "❌"} SELBSTTEST: der eingefrorene Pegel ist ROT (ufer und regen)`);
    }
    console.log(
        rot.length
            ? `❌ ROT — gesehen ≠ gehört: ${rot.join(" · ")} unter r ${GESEHEN_SOLL}, ohne Varianz oder stumm im Bild`
            : `✅ GRÜN — gesehen = gehört: der Bach-Pegel folgt der sichtbaren Strömung, der Regen-Pegel dem gezeichneten Regen`
    );
    return !rot.length && feuert ? 0 : 1;
}

// zurück an die Mess-Wiese
const heim = (page) => page.evaluate((m) => window.__klangW.umstellen(m.x, m.z), MESS);
// DER ZENSUS (O · Z · G · H · S · K · E · L · W · A · P) an den Orten aus dem Gesetz.
async function zensus(page, browser, ergebnis) {
    await page.evaluate(AUSGABE_INSTALL);
    // Symphonie an, die Musik ruht (die Linse misst die WELT), die Tiere halten still.
    await page.evaluate(() => {
        __tiereHalten();
        Object.getPrototypeOf(anazhRealm)._lofiTick = function () {};
        anazhRealm.initSymphony();
    });
    // der Werkzeugkasten der Seite beim Namen; die Lage bei mittlerer Böe; der Synthese-Zähler je Welt-Phase (die
    // Offline-Renders rechnen für die LINSE, nie gezählt)
    const kW = (fn, ...a) => page.evaluate((fn, a) => __klangW[fn](...a), fn, a);
    const mitte = (l) => ({ ...l, boe: 0.7 });
    const syn = () => kW("synthese");
    const phasen = {};
    // Die Orte.
    let s0 = await syn();
    await heim(page);
    const orte = await kW("orte", MESS.x, MESS.z);
    phasen.anreise = (await syn()) - s0;
    const daten = {};
    const offline = {};
    // die nahen Orte zuerst, dann die fernen (Seeufer und Fall liegen Kilometer weit — kehrt die Tour von dort zurück,
    // pflanzt der Wald seinen Bestand neu)
    // die Szenen stehen an der Wiese
    for (const name of ["wiese", ...Object.keys(SZENEN), "wald", "dorf", "glutArm", "seeufer", "fallArm"]) {
        const ort = orte[SZENEN[name] ? "wiese" : name];
        if (!ort) continue;
        daten[name] = await messeOrt(page, name, ort, { szene: SZENEN[name] });
        // (R) Leib weg → Ruf weg: dieselbe Wiese, deren Revier-Gesetz keinen Vogel trägt
        if (name === "wiese")
            daten.wieseOhneLeib = await messeOrt(page, "wieseOhneLeib", orte.wiese, { ohneLeib: true });
        const z = daten[name].zensus;
        if (z?.lage) {
            daten[name].mixMitte = await kW("mischung", mitte(z.lage));
            offline[name] = await imOffline(page, mitte(z.lage), null);
        }
    }
    s0 = await syn();
    await heim(page);
    const kostenErg = await kosten(page);
    phasen.kosten = (await syn()) - s0;
    const ereig = await kW("ereignisse");
    const lab = await labPruefen(browser);
    // (P) die Spitzen-Probe: jeder Welt-Ort (mittlere Böe) und jeder Lab-Ort des Gesetzes, mit der Spitzen-Wand.
    const spitzen = {};
    for (const [name, d] of Object.entries(daten))
        if (d.zensus?.lage) spitzen[name] = await imOffline(page, mitte(d.zensus.lage), true);
    const labOrte = await page.evaluate(() => Object.keys(__klangCore.UMWELT.orte));
    for (const o of labOrte) spitzen["lab:" + o] = await imOffline(page, o, true);
    const { rot, zeilen } = urteile(daten, offline, lab, ereig, phasen, spitzen);
    for (const w of kostenErg.wachsen) rot.push(`K: ${w} wächst mit der Welt`);
    // (G) die Stamm-Klasse, statisch: jede Quell-Stelle des Stamms in einem Wirt-Leser.
    const stamm = stammQuellen();
    for (const t of stamm.rot) rot.push(t);
    ergebnis.stamm = stamm;
    drucke(zeilen, kostenErg);
    console.log(
        `── EREIGNISSE ${ereig.map((e) => `${e.art} ${e.fehler ? "WIRFT" : e.quellen.length}`).join(" · ")} · SPITZEN ${Object.entries(
            spitzen
        )
            .map(([wo, sp]) => `${wo} ${sp?.spitzeDbfs}`)
            .join(" · ")} dBFS`
    );
    ergebnis.spitzen = spitzen;
    // (F) der Körper klingt am Messort (die Probe fährt Wagen und Stürze)
    const fu = koerperUrteil((ergebnis.koerper = await page.evaluate(koerperSeite, MESS, null)));
    rot.push(...fu.rot);
    console.log(`── (F) DER KÖRPER KLINGT: ${fu.zahl}`);
    Object.assign(ergebnis, { orte, daten, offline, kosten: kostenErg, lab, ereig, rot });

    let selbstOk = true;
    if (SELBST) {
        console.log("\n── SELBST-TEST (die Linse feuert)");
        const fehl = [];
        // die Prüfung je Täter: eine Zeile der Liste trägt sein Muster, sonst ist die Wand blind (der Satz beim Namen)
        const muss = (liste, re, satz) => liste.some((t) => re.test(t)) || fehl.push(satz);
        // S1 + S2: der Drohn-Zwilling und die stumme Schleife.
        await page.evaluate(() => {
            const s = anazhRealm.state.symphony;
            // die Quelle q über einen Gain v am Master, gestartet
            const an = (q, v) => {
                const g = s.ctx.createGain();
                g.gain.value = v;
                q.connect(g);
                g.connect(s.masterGain);
                q.start();
                return q;
            };
            window.zwillingDrohne = function () {
                const o = s.ctx.createOscillator();
                o.frequency.value = 110;
                return an(o, 0.01);
            };
            window.stummeSchleife = function () {
                const q = s.ctx.createBufferSource();
                q.buffer = s.ctx.createBuffer(1, 4800, 48000);
                q.loop = true;
                return an(q, 0);
            };
            window.__selbst = [window.zwillingDrohne(), window.stummeSchleife()];
        });
        const dS = { wiese: await messeOrt(page, "wiese", orte.wiese, { stehend: true }) };
        await page.evaluate(() => window.__selbst.forEach((q) => q.stop()));
        const uS = urteile(dS, null, null).rot;
        muss(uS, /^G wiese: .*zwillingDrohne/, "S1: der Drohn-Zwilling bleibt unbenannt");
        muss(uS, /^H wiese: .*stummeSchleife/, "S2: die stumme Schleife bleibt unbenannt");
        muss(uS, /^R wiese: .*gezeichnet, singt, Flug 0 m/, "S12: der stehende Vogel bleibt unbemerkt");
        // S3: das Wasser am Seeufer weg.
        if (orte.seeufer) {
            const d3 = await messeOrt(page, "seeufer", orte.seeufer, { ohneWasser: true });
            const m3 = d3.zensus?.lage && (await kW("mischung", mitte(d3.zensus.lage)));
            if (m3 && SOLL.seeufer(m3, {}).every(([, ok]) => ok))
                fehl.push("S3: das Seeufer ohne Wasser hält das SOLL (die Linse ist blind)");
        } else fehl.push("S3: kein Seeufer gefunden");
        // S4: ein Glut-Umlauf über alle Bauten.
        await heim(page);
        const k4 = await kosten(page, { alleBauten: true });
        muss(k4.wachsen, /^bauten/, "S4: der Voll-Umlauf über alle Bauten bleibt unbemerkt");
        // S5: ein Ereignis-Zwilling (Glocke aus dem Stamm, direkt an den Ausgang).
        // die Ereignis-Tour mit einem Zwilling statt des Glieds `glied` (sein Funktions-Name ist der Täter-Name)
        const mitZwilling = (glied, zwilling) =>
            page.evaluate(
                async (glied, zwilling) => {
                    const P = Object.getPrototypeOf(anazhRealm);
                    const alt = P[glied];
                    P[glied] = {
                        zwillingGlocke() {
                            const ctx = this.state.symphony.ctx;
                            const o = ctx.createOscillator();
                            o.connect(ctx.destination);
                            o.start();
                            o.stop(ctx.currentTime + 0.05);
                        },
                        zwillingRuf(_c, stimmung) {
                            const s = this.state.symphony;
                            return s.umwelt.kern.tierRuf(s.ctx, s.umwelt.bus, {
                                laengeM: 1,
                                stimmung,
                                d: 3,
                                pan: 0,
                                saat: 5,
                            });
                        },
                        zwillingHauch() {
                            this._substanzKlang("wasser", null);
                        },
                    }[zwilling];
                    try {
                        return await __klangW.ereignisse();
                    } finally {
                        P[glied] = alt;
                    }
                },
                glied,
                zwilling
            );
        const e5 = await mitZwilling("_playWaterReactionPing", "zwillingGlocke");
        const u5 = urteile({}, null, null, e5).rot;
        muss(u5, /^E wasser: .*zwillingGlocke.*kein Gesetz/, "S5: der Ereignis-Zwilling bleibt unbenannt");
        muss(u5, /^E wasser: .*am Master vorbei/, "S5: die Verbindung am Master vorbei bleibt unbemerkt");
        // S6: ein Ort, dessen Graph im Haupt-Thread rechnet (ohne Lieferung der Werkstatt).
        if (orte.seeufer) {
            const d6 = await messeOrt(page, "seeufer", orte.seeufer, { ohneWerkstatt: true });
            const u6 = urteile({ seeufer: d6 }, null, null).rot;
            muss(u6, /^W seeufer: \d+ Samples im Haupt-Thread/, "S6: der Graph ohne Werkstatt bleibt unbemerkt");
        }
        // S7: ein Ruf, der im Haupt-Thread rechnet (der Zwilling ruft das Gesetzbuch direkt im Spiel-Takt).
        const e7 = await mitZwilling("_tierRuf", "zwillingRuf");
        const u7 = urteile({}, null, null, e7).rot;
        muss(u7, /^W tier: \d+ Samples im Haupt-Thread/, "S7: der Ruf im Haupt-Thread bleibt unbemerkt");
        // S8: die Glut auf Armlänge (Lab-Ort des Gesetzes) OHNE Spitzen-Wand clippt — und die Probe nennt es.
        const s8 = await imOffline(page, "glutArm", false);
        const u8 = urteile({}, null, null, [], {}, { "lab:glutArm": s8 }).rot;
        muss(u8, /^P lab:glutArm: Spitze .*ohne Spitzen-Wand/, `S8: die Glut auf Armlänge ohne Spitzen-Wand bleibt unbemerkt (${s8?.spitzeDbfs} dBFS)`);
        // S9: ein Ping-Zwilling im Stamm-Text — eine Methode, die einen Oszillator baut, ohne Wirt-Leser zu sein (keine
        // Tour löst sie aus; die statische Linse nennt sie trotzdem beim Namen).
        const s9 = stammQuellen((t) => {
            const nach = stammLib.glieder(t)[0].ende; // hinter das erste Glied der Klasse (die Methode am AST)
            const ping =
                "\n    zwillingPing(\n        tags\n    ) {\n        const o = this.state.symphony.ctx.createOscillator();\n    }";
            return t.slice(0, nach) + ping + t.slice(nach);
        });
        muss(s9.rot, /^G Stamm: Zeile \d+ `\.createOscillator\(` baut eine Klang-Quelle ohne Gesetz/, "S9: der Ping-Zwilling im Stamm bleibt unbenannt");
        // S10: ein Wald-Ort, an dem die Karte Wald sagt, aber kein Baum steht — der Bestand nennt es.
        if (daten.wald && daten.wiese) {
            const d10 = { wiese: daten.wiese, wald: { ...daten.wald, baeume: 0 } };
            muss(urteile(d10, null, null).rot, /^S wald: der Bestand trägt keinen Wald/, "S10: ein Wald ohne Bäume bleibt unbemerkt");
        } else fehl.push("S10: kein Wald-/Wiesen-Ort gemessen");
        // S11: ein Wasser-Hauch, der den Fußabdruck nicht liest (er klänge auch auf trockenem Land) — die Tour nennt es.
        const e11 = await mitZwilling("_playWaterReactionPing", "zwillingHauch");
        muss(urteile({}, null, null, e11).rot, /^E wasserTrocken: \d+ Quelle\(n\), wo die Welt still ist/, "S11: der Wasser-Hauch auf trockenem Land bleibt unbemerkt");
        // S12: der Phantom-Vogel — gehört ohne Leib: beide Arme der Linse nennen ihn
        const d12 = await messeOrt(page, "wieseOhneLeib", orte.wiese, { ohneLeib: true, phantom: true });
        muss(leibUrteil(d12.name, d12.zensus), /1 gehört, 0 gezeichnet, singt/, "S12: der Phantom-Vogel bleibt unbemerkt");
        // S13: die Täter des Körpers — ein stummer Motor, eine tonlose Landung, ein Doppler mit falschem Vorzeichen
        for (const [mut, re] of [
            ["motor", /^F motor stumm/],
            ["landung", /^F landung \S+ m tonlos/],
            ["doppler", /falsches Vorzeichen/],
        ])
            muss(koerperUrteil(await page.evaluate(koerperSeite, MESS, mut)).rot, re, `S13: ${mut} bleibt unbemerkt`);
        // S14: die Grille liest die Luft am Ohr ohne die Trägheit des Bodens ihrer Röhre — die Sommernacht der Wiese schweigt
        const d14 = await messeOrt(page, "nacht", orte.wiese, { szene: SZENEN.nacht, luft: true });
        d14.mixMitte = await kW("mischung", mitte(d14.zensus.lage));
        muss(urteile({ nacht: d14 }).rot, /^N nacht: grille/, "S14: die Grille ohne den Boden ihrer Röhre bleibt unbemerkt");
        for (const t of fehl) console.log("   ❌ " + t);
        if (!fehl.length) console.log("   ✅ S1–S14 nennen jeden Täter beim Namen");
        selbstOk = !fehl.length;
        ergebnis.selbsttest = fehl;
    }
    console.log("");
    if (rot.length) {
        console.log(`❌ ROT — ${rot.length} Befund(e):`);
        for (const t of rot) console.log("   " + t);
    } else
        console.log(
            "✅ GRÜN — jede klingende Quelle trägt ein Gesetz, kostet nur hörbar, jeder Ort hält sein SOLL, jeder Ruf hat einen Leib, Lab = Welt."
        );
    return !rot.length && selbstOk ? 0 : 1;
}

(async () => {
    if (TAKT)
        server.prependListener("request", (_q, res) => {
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
        });
    await server.lausche(PORT);
    const browser = await starteBrowser({
        art: ECHT ? "echt" : "null",
        headless: !ECHT,
        frist: 600000,
        zusatz: ["--autoplay-policy=no-user-gesture-required"],
    });
    let exit = 1;
    const ergebnis = {};
    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(590000);
        if (!ECHT) await nullRenderer(page);
        // der Quellen-Abgriff kostet je Quelle einen Stapel — der Takt misst ohne ihn
        if (!TAKT) await page.evaluateOnNewDocument(quellenAbgriff);
        await server.zeige(page, 180000, "index.html", "networkidle0");
        await warteAufWelt(page, 180000);
        await page.evaluate(`window.__klangW = (${werkzeug})();`);
        exit = await (TAKT
            ? takt(page, ergebnis)
            : GESEHEN
              ? gesehen(page, ergebnis)
              : zensus(page, browser, ergebnis));
    } catch (e) {
        console.log("FEHLER:", e?.stack || e);
    } finally {
        if (JSON_AUS)
            fs.writeFileSync(
                JSON_AUS,
                JSON.stringify(ergebnis, (k, v) => (v === -Infinity ? "-Infinity" : v), 1)
            );
        await browser.close();
        server.close();
        process.exit(exit);
    }
})();
