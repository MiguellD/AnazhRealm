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
//  (Ü) UNTERTITEL (spielgang.K4): jedes Ereignis mit Quelle trägt seine Zeile, ein stilles keine, jede gespielte Stimme je Ort
//      ihre Zeile; die Tafel `UNTERTITEL` deckt jeden Namen des Gesetzes (Stimmen · Ruf-Stimmungen · SUBSTANZ).
//  (F) DER KÖRPER KLINGT AUS BEWEGUNG (klang.K4 Staffel 2): Motor, Landung, Doppler an sechs Radial-Geschwindigkeiten am Bus.
//  (N) UHR × WETTER × GANG an der Wiese (klang.K1 Staffel 2): nachts (Grillen, kein Vogel), im Regen, gehend und fahrend
//      (im Sattel des GT) — Wetter und Uhr als Wort des Spielers, je Szene das Soll und der Weg in Bewegung.
//  (Ra) RAUM AM OHR (klang.K3 Staffel 1): Tier-Ruf und Glut links und rechts — ILD-Vorzeichen und Pegel über den Abstand.
//  (V) DER WEG ZUM OHR (klang-leib): Laufzeit über den Weg d/c(T), Luft nach ISO 9613-1, kein Panner ohne Kopf.
//  (St) DIE STIMME AUS DEM LEIB (klang-leib): Grundton und Formanten am Abgriff gegen Peterson & Barney 1952, ±15 %.
//  (Dn) DER DONNER AUS DEM BLITZ (klang-leib): der Einsatz am Abgriff gegen d/c(T) vom nächsten Punkt des Kanals, ±2 %.
//  (Db) DER BLITZ FOLGT DEM FELD AM ORT (klang-leib): der Anteil des Sturms im Feld am Ort, exakt im Kern, fern wortfrei.
//  (Mk) DER MARKT AUS SEINER MENGE (markt-klang): nach dem Zensus auf derselben Seite am Ort stadt-voll (an `marktSeite`; allein:
//      `--markt [--sek n]`, 600 = die 10 Minuten der Karte): Stimmen zugleich, L_Aeq gegen die Wochenmärkte, Spitze, Duck am
//      Bus, wer duckt, Lombard; Täter S24–S27.
//  SELBST-TEST (--selftest): je Wand ein gepflanzter Täter (die Zeile S1–S23 und S28 unten), Stubs restauriert.
//  (T) KLANG-TAKT IN BEWEGUNG: der eigene Lauf `--takt` (an `taktSeite`).
//  (U) GESEHEN = GEHÖRT am Bach und im Regen: der eigene Lauf `--gesehen` (an `gesehenSeite`, klang.K2 Staffel 2).
//   node scripts/diag-klang-zensus.cjs [--selftest] [--takt [--echt] [--minuten <n>] | --gesehen | --markt [--sek <n>]] [--json <datei>]
//   (KLANG_WURZEL=<baum> misst einen anderen Arbeitsbaum unter derselben Linse)
// ─────────────────────────────────────────────────────────────────────────
"use strict";
const { statikServer, starteBrowser, warteAufWelt, nullRenderer, halteBis, argOpt, ROOT: root, path, fs, stammLib, SELBSTTEST, mass } = require("./lib/welt-boot.cjs");
const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
const MESS = require("./lib/welt-orte.cjs").messort("wiese"); // der Messort aus spec/profiband/haushalt.json

// KLANG_WURZEL: eine Überlagerung — liegt eine Datei dort, gewinnt sie (z. B. die Stände eines älteren Commits);
// vorher↔nachher unter derselben Linse, denselben Bedingungen.
const UEBER = process.env.KLANG_WURZEL ? path.resolve(process.env.KLANG_WURZEL) : null;
const PORT = Number(process.env.KLANG_ZENSUS_PORT) || 7452;
const argv = process.argv.slice(2);
const TAKT = argv.includes("--takt");
const ECHT = TAKT && argv.includes("--echt"); // der Zensus misst im Null-Renderer
const GESEHEN = argv.includes("--gesehen");
const JSON_AUS = argOpt("--json", null);

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
    const W = {};
    // Ein Frame des echten Loops (Bühne fest, Tiere halten); die Szene (klang.K1 Staffel 2): Wetter und Uhr als Wort der Bühne
    // (R9), je Takt (die Uhr der Szene ist ihr Wort, `__buehne` liest `uhr` — bis w4-himmel-uhr stand die Welt je Takt erst auf
    // Mittag, dann sprang der Regler zurück in die Nacht und die Umgebung malte sich zweimal).
    W.takt = () => {
        try {
            __buehne(W.szene);
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
        // die Nässe ist die des Klangs (`_nassAt`: der Boden unter der EINEN Wasser-Wahrheit am Körper), nie nachgerechnet
        // Seeufer: der trockene Punkt vor dem nächsten SEE des Gesetzes (die Senken des Flussnetzes, ≥ 16 Zellen, über dem
        // Meer) in den Kacheln bis zum zweiten Ring, die Zelle nächst der Wiese.
        let best;
        const kachel = AnazhRealm.HYDROSPHERE.regionSize;
        let seeZelle, wfN;
        for (let rx = -2; rx <= 2; rx++)
            for (let rz = -2; rz <= 2; rz++) {
                await __weltDa(() => !r._ensureHydroTilesAround(wx + rx * kachel, wz + rz * kachel, 0));
                const h = r._hydroFor(wx + rx * kachel, wz + rz * kachel);
                for (const lake of h?.lakes || []) {
                    if (!lake.cells || lake.cells.length < 16 || !(lake.level > st.waterLevel + 2)) continue;
                    for (const q of lake.cells) {
                        const x = h.originX + ((q % h.dim) + 0.5) * h.cell;
                        const z = h.originZ + (((q / h.dim) | 0) + 0.5) * h.cell;
                        const d = Math.hypot(x - wx, z - wz);
                        if (!seeZelle || d < seeZelle.d) seeZelle = { x, z, d };
                    }
                }
                // der nächste Wasserfall (die Armlänge unten)
                for (const f of h?.waterfalls || []) {
                    const d = Math.hypot(f.x - wx, f.z - wz);
                    if (!wfN || d < wfN.d) wfN = { f, d };
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
                        if (!r._nassAt(x + Math.sin(a) * rad, z + Math.cos(a) * rad)) continue;
                        alle++;
                        if (rad === O.radien[0]) erst++;
                    }
                return { erst, alle };
            };
            for (let s = 1; s < r0; s++) {
                const qx = seeZelle.x + ux * s;
                const qz = seeZelle.z + uz * s;
                if (!r._nassAt(qx, qz)) {
                    let wahl;
                    for (let t = 0; t <= O.radien[0]; t += 0.5) {
                        const fx = qx + ux * t;
                        const fz = qz + uz * t;
                        if (r._nassAt(fx, fz)) continue;
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
                if (y == null || r._nassAt(x, z)) continue;
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
                    if (r._nassAt(px, pz)) return false;
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
                if (r._nassAt(x, z)) continue;
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
    // (Ü) die Zeilen der Untertitel bisher · die Namen des Gesetzes ohne Satz in der Tafel
    W.zeilen = () => (st._untertitel ? st._untertitel.zeilen : 0);
    W.luecken = (K = __klangCore) =>
        [["stimme", K.UMWELT.stimmen], ["ruf", K.UMWELT.tier.rufProMin], ["substanz", K.SUBSTANZ], ["laut", K.STIMME.laute]].flatMap(([a, t]) =>
            Object.keys(t).filter((n) => !AnazhRealm.UNTERTITEL[a][n]).map((n) => a + ":" + n)
        );
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
            const [syn0, u0] = [W.synthese(), W.zeilen()];
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
                ut: W.zeilen() - u0,
            });
        };
        await fang("treffer", () => r._trefferPaar("stahl", "stein"));
        // Wasser strömt zurück — am Wasser des Seeufers; auf der trockenen Wiese (das Ohr steht dort) bleibt es still.
        const wp = W.wasserPunkt;
        // die Kachel des Ufers steht beim Fragen (der Ort liegt fern vom Ohr): die Welt hält nur die Kacheln in der Reichweite
        // ihrer Leser (w28-speicher-ring, `ZELL_GEDAECHTNISSE`) — wer fern fragt, bestellt sie, wie die Suche des Ufers oben
        if (wp) await __weltDa(() => !r._ensureHydroTilesAround(wp.x, wp.z, 32));
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
        // DER KNALL (same.physik.reaktion#2): die Druckwelle am Ohr über ihren echten Weg (`_druckTrifft`, Art „ohr") — 10 kPa
        // über 5 ms klingen (ein Graph im Audio-Thread: kein Sample im Haupt-Thread, Wand W), 1 Pa liegt unter der Schwelle
        // des Gesetzes (`SUBSTANZ.knall.still`): dort bleibt die Welt still.
        await fang("knall", () => r._druckTrifft({ art: "ohr", w: { dp: 1e4, dauer: 0.005 } }));
        await fang("knallFern", () => r._druckTrifft({ art: "ohr", w: { dp: 1, dauer: 0.005 } }), 0, true);
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
        rot: ok ? [] : [`G Stamm: ${stammLib.fehlt.wo} baut eine Klang-Quelle ohne Gesetz`],
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
            const W = __klangW;
            const P = Object.getPrototypeOf(r);
            const alt = { _untertitelZeile: stubs?.ohneZeile && P._untertitelZeile };
            if (alt._untertitelZeile) P._untertitelZeile = () => false; // der Selbst-Test: die Zeile schweigt, der Ton spielt
            if (stubs?.ohneWasser) {
                // das Wasser an seiner Quelle weg: die EINE Wahrheit am Körper (die Nässe des Klangs liest sie)
                alt._koerperWasser = P._koerperWasser;
                P._koerperWasser = () => -Infinity;
            }
            if (stubs?.ohneLeib || stubs?.stehend) {
                // der Leib weg: das Revier-Gesetz trägt kein Revier — oder er steht (Selbst-Test S12): die Bahn des Gesetzes
                // auf der Uhr dieses Takts; die Vogel-Karte neu — der Phantom-Vogel (Selbst-Test) singt in der Lage am Ohr
                // ohne einen Leib: an der Hälfte, die sie schließt (`_umweltLageZwei`, der Takt und `_umweltLage` rufen sie)
                [alt.vogel, alt.lage] = [AnazhRealm._vogelGesetzMemo, P._umweltLageZwei];
                const T = st.spielZeit;
                const mut = stubs.stehend ? { bahn: (w, a, _t, ...x) => alt.vogel.bahn(w, a, T, ...x) } : { revier: () => false };
                [AnazhRealm._vogelGesetzMemo, r._vogelKarte] = [{ ...alt.vogel, ...mut }, null];
                if (stubs.phantom)
                    P._umweltLageZwei = function () {
                        return Object.assign(alt.lage.apply(this, arguments), { voegel: [{ d: 20 }] });
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
                let [vor, tv, weg, hoch] = [[], 0, [], []];
                for (
                    let i = 0, t0 = performance.now();
                    performance.now() - t0 < (sz.weg ? 3e4 : 4500) && !(um.weg >= sz.weg);
                    i++
                ) {
                    [halt.vor, halt.zurueck] = sz.weg ? [i % 120 < 60, i % 120 >= 60] : [];
                    W.takt();
                    const Q = st.vogelPool?.mesh || { count: 0 };
                    const nun = Array.from({ length: Q.count }, (_, i) => Q.instanceMatrix.array.slice(16 * i + 12, 16 * i + 15));
                    if (nun.length && nun.length === vor.length)
                        weg.push(nun.reduce((s, p, i) => s + Math.hypot(...p.map((v, k) => v - vor[i][k])), 0) / nun.length / (performance.now() - tv) * 1e3);
                    for (const p of nun) hoch.push(p[1] - r._voxelSurfaceY(p[0], p[2]));
                    [vor, tv] = [nun, performance.now()];
                    await sleep(30);
                    um.weg += q.distanceTo(p);
                    q.copy(p);
                }
                um.sattel = st.player.mountedArch != null;
                // aus dem Sattel: die Stimme der Fahrt (klang:FAHRT, ihre Quellen trägt sie selbst) verklingt im nächsten Takt
                if (sz.e) (r.dismountArchitecture(), r.removeArchitecture(sz.e, { still: true }), W.takt());
                const med = (a) => +(rang(a.sort(aufsteigend)) || 0).toFixed(2);
                const laufend = W.laufend();
                const zensus = W.zensus();
                if (zensus) zensus.leiber.flug = { mps: med(weg), hoeheM: med(hoch) };
                const syn1 = W.synthese();
                const baeume = W.bestand(p.x, p.z, 15);
                // (Ü) die gespielten Stimmen, deren Satz in keiner stehenden Zeile steht
                const ut = document.getElementById("untertitel").textContent;
                const ohneZeile = (zensus ? zensus.stimmen : []).filter((v) => v.an && !ut.includes(AnazhRealm._t(AnazhRealm.UNTERTITEL.stimme[v.name]))).map((v) => v.name);
                return { name, ort, um, laufend, zensus, baeume, hauptSynthese: syn1 - syn0, ohneZeile };
            } finally {
                halt.vor = halt.zurueck = W.szene = false;
                if (alt.luft) P._temperaturAt = alt.luft;
                if (alt.lage)
                    [AnazhRealm._vogelGesetzMemo, r._vogelKarte, P._umweltLageZwei] = [alt.vogel, null, alt.lage];
                for (const k of ["_koerperWasser", "_untertitelZeile"]) if (alt[k]) P[k] = alt[k];
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
        return await page.evaluate(() => {
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
                // DER MISCH-TAKT VON HAND, GEZÄHLT (abdruck-am-takt): jeder Klick auf den Ort ist EIN Takt der Mischung (`ort` →
                // `anwenden`), und der Graph bestellt je Takt höchstens EINE Stimme — nach `stimmenMax` Takten steht jede gewählte.
                // Bis hier 1,5 s Wanduhr über dem 0,1-s-Intervall des Labs: unter Last liefen in ihr zu wenige Takte.
                const ufer = () => (__klangWelt?.zensus?.() || []).some((v) => v.name === "ufer" && v.an);
                for (o.mischTakte = 0; knopf && o.mischTakte < K.UMWELT.stimmenMax && !ufer(); o.mischTakte++) knopf.click();
                o.seeuferUfer = ufer();
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
// (luftwasser.K1): ≥ 1 m/s und ≥ 2 m über dem Boden.
const leibUrteil = (name, z) => {
    const [L, singt] = [z.leiber || { gehoert: 0, gezeichnet: 0 }, z.stimmen.some((v) => v.name === "vogel" && v.an)];
    const F = L.flug || {};
    return L.gehoert !== L.gezeichnet ||
        (singt && (!L.gezeichnet || /OhneLeib$/.test(name))) ||
        (L.gezeichnet && !(F.mps >= 1 && F.hoeheM >= 2))
        ? [`R ${name}: ${L.gehoert} gehört, ${L.gezeichnet} gezeichnet${singt ? ", singt" : ""}, Flug ${F.mps} m/s ${F.hoeheM} m — ein Ruf ohne fliegenden Körper`]
        : [];
};
// (Ü) UNTERTITEL (spielgang.K4): EIN Ereignis, zwei Leser — wer klingt, steht am Schirm; wer still ist, nicht.
// Je Fall [wo, klingt, Zeile]: die Ereignisse der Tour, dann jede gespielte Stimme je Ort.
const untertitelUrteil = (ereig, daten, luecken) => {
    const f = ereig.filter((e) => !e.fehler).map((e) => [e.art, !e.still && e.quellen.length > 0, e.ut > 0]);
    for (const [wo, d] of Object.entries(daten))
        for (const v of d.zensus ? d.zensus.stimmen.filter((x) => x.an) : []) f.push([wo + "/" + v.name, true, !d.ohneZeile.includes(v.name)]);
    const rot = luecken.map((n) => "Ü Tafel: kein Satz für " + n);
    for (const [wo, k, z] of f) if (k !== z) rot.push(`Ü ${wo}: ${k ? "klingt ohne Zeile" : "Zeile, wo die Welt still ist"}`);
    const k = f.filter((x) => x[1]);
    return { rot, zahl: `${k.filter((x) => x[2]).length} von ${k.length} Klang-Ereignissen und Stimmen tragen ihre Zeile` };
};
function urteile(daten, offline, lab, ereig, phasen, spitzen) {
    const rot = [];
    const zeilen = [];
    const mixAlle = {};
    // (W) DIE WERKSTATT: der Haupt-Thread rechnet keinen Sample (Texturen, Rufe) — weder auf der Anreise noch an einem
    // Ort, in den Kosten-Takten oder für ein Ereignis.
    const werkstatt = (wo, n) => {
        if (n > 0) rot.push(`W ${wo}: ${n} Samples im Haupt-Thread`);
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
        for (const a of e.amAusgang) rot.push(`E ${e.art}: ${kette(a)} am Master vorbei`);
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
        if (d.um?.wald === false) rot.push(`O ${name}: der Wald steht nach ${d.um.takte} Takten nicht`);
        // (W) die Welt rechnet in der Werkstatt
        werkstatt(name, d.hauptSynthese);
        if (d.zensus && !d.zensus.werkstatt?.laeuft) rot.push(`W ${name}: keine Klang-Werkstatt`);
        // (H) Hörbar-Kosten
        const z = d.zensus;
        const stimmen = z?.stimmen || [];
        const sumQuellen = stimmen.filter((v) => v.an).reduce((a, v) => a + v.quellen, 0);
        const dauernd = d.laufend.filter((q) => q.dauernd);
        for (const q of dauernd) {
            if (!q.gesetzKnoten) rot.push(`H ${name}: ohne Gesetz-Stimme ${kette(q.frames)}`);
        }
        const imKnoten = dauernd.filter((q) => q.gesetzKnoten).length;
        if (z && imKnoten !== sumQuellen) rot.push(`H ${name}: ${imKnoten} Gesetz-Quellen ≠ ${sumQuellen} hörbar`);
        for (const v of stimmen)
            if (v.an && !(v.db >= -68)) rot.push(`H ${name}: Stimme ${v.name} läuft bei ${v.db} dB`);
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
        rot.push(`S wald: der Bestand trägt keinen Wald (${daten.wald.baeume} < 2 × ${daten.wiese.baeume})`);
    for (const name of Object.keys(SOLL))
        if (!mixAlle[name]) rot.push(daten[name] ? `S ${name}: keine Lage am Ohr` : `O ${name}: der Ort fehlt`);
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
        if (!lab.weltModus) rot.push("L: kein Welt-Modus");
        else {
            if (!lab.graphGebaut) rot.push("L: das Lab baut nicht über umweltGraph");
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
            rot.push(`P ${wo}: Spitze ${sp.spitzeDbfs} dBFS (${sp.wand ? "trotz" : "ohne"} Spitzen-Wand)`);
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
    console.log(`── KOSTEN je Takt ${JSON.stringify(kostenErg.vor)} → ${JSON.stringify(kostenErg.nach)}`);
}

// (T) DER KLANG-TAKT IN BEWEGUNG (`--takt [--echt]`, klang.K5): je präsentiertem Bild die Haupt-Faden-ms der Klang-Arbeit
// (symphonyTick + _schrittKlangTick + _tierRuf, der äußere Aufruf) im echten Spiel, Klang über den Knopf — gehen, Fahrt
// (GT, Gas und rückwärts im Wechsel), nachts gehen; p95 ≤ TAKT_SOLL_MS je Phase, der Träger der Bilder über dem Soll beim
// Namen (die Teile: die Folge der Musik, die zwei Hälften der Lage, der Schwenk des Raums `_raumStrahlen` — bis w12-klang-lage
// fehlte er, und die Sichtung nannte die Lage, wo der Schwenk trug), und hinter dem max in [ ] der Träger des teuersten Bilds (bis
// w13-klang-fahrt ohne Namen — die Fahrt: der erste Bau der Stimme im Bild des Aufsitzens); über den Gang 0 Aussetzer am Ausgang. Die Seite ist
// isoliert (COOP + COEP: 5 µs statt des 100-µs-Rasters).
// `--echt`: Fenster, echte GPU und Audio-Gerät. `--minuten`: der Spielgang, gehen · Fahrt · nachts zu 4 : 3 : 3.
// `--selftest`: Phase „selbst", der Takt fragt je Bild 300 Rufer → ROT, eine stotternde Stimme → Aussetzer gezählt.
const TAKT_SOLL_MS = 0.2;
const MINUTEN = Number(argOpt("--minuten")) || 0;
const TAKT_TEILE = ("_lofiPlayChord _lofiPlayMelody _lofiPlayGroove _lofiPlayBass _lofiRaum _umweltLageEins _umweltLageZwei " +
    "_raumStrahlen _tierRufTakt _fahrtKlangTick _schrittMaterialAt _playSchrittOneShot").split(" ");
function taktSeite(m, echt, namen) {
    const P = Object.getPrototypeOf(r);
    const T = (window.__klangTakt = { phase: "", bilder: [], weg: 0 });
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
        const q = (st.player?.mountedArch != null ? __klangGT : st.playerMesh).position;
        if (vor?.q === q) T.weg += Math.hypot(q.x - vor.x, q.z - vor.z);
        vor = { q, x: q.x, z: q.z };
        if (T.phase) T.bilder.push(b);
        b = { ms: 0, teile: {} };
        requestAnimationFrame(bild);
    };
    requestAnimationFrame(bild);
    // der Null-Renderer zeichnet nicht: hier trägt die Linse den Takt des Spiels (das Fenster trägt ihn selbst)
    if (!echt) requestAnimationFrame(__klangW.spiel);
    (T.mitte = () => st.playerMesh.position.set(m.x, r._voxelSurfaceY(m.x, m.z) + 1.8, m.z))();
    document.getElementById("anazh-symphony-toggle").click();
    T.start = (p) => Object.assign(T, { phase: p, bilder: [], weg0: T.weg });
    T.urteil = (soll) => {
        T.phase = "";
        const s = [...T.bilder].sort((x, y) => x.ms - y.ms);
        const q = (k) => +(rang(s, k)?.ms || 0).toFixed(2);
        const ueber = T.bilder.filter((x) => x.ms > soll);
        const last = {};
        for (const x of ueber) for (const k in x.teile) last[k] = (last[k] || 0) + x.teile[k] / ueber.length;
        const nenne = (t) =>
            Object.entries(t)
                .sort((u, v) => v[1] - u[1])
                .slice(0, 3)
                .map(([k, v]) => `${k} ${v.toFixed(2)}`);
        // der Träger der Spitze (des teuersten Bilds) beim Namen — bis w13-klang-fahrt stand das max ohne ihn (die Fahrt: der Bau der
        // Stimme beim Aufsitzen)
        return {
            bilder: s.length,
            weg: Math.round(T.weg - T.weg0),
            p95: q(0.95),
            max: q(1),
            traeger: nenne(last),
            spitze: nenne(s.at(-1)?.teile || {}),
        };
    };
    // der Aussetzer-Zähler am Ausgang (AudioContext.playbackStats), dazu ob es noch der Kontext des ersten Abrufs ist
    T.audio = () => {
        const c = st.symphony.ctx,
            p = c?.playbackStats;
        T.ctx ||= c;
        return p && { n: p.underrunEvents, still: p.underrunDuration, s: p.totalDuration, gleich: T.ctx === c };
    };
    T.uhr = () => st.symphony.ctx?.currentTime; // ohne Kontext undefined: die Differenz ist NaN, die Phase endet
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
        `── ${phase}: p95 ${z.p95} · max ${z.max} ms [${z.spitze}] (${z.bilder} Bilder, ${z.weg} m) · ${z.traeger.join(" · ")}`
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
        const p = __klangTakt.mitte();
        r.mountArchitecture((window.__klangGT = await __klangW.wagen(p.x + 3, p.z)));
    });
    ph.fahrt = await taktPhase(page, "fahrt", 20, true, MINUTEN * 18);
    ph.fahrt.sattel = await page.evaluate(() => !!st.symphony.fahrt?.size);
    await page.evaluate(() => {
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
    if (!aus) rot.push("T aussetzer: ungezählt");
    else if (aus.n) rot.push(`T aussetzer: ${aus.n} in ${aus.s} s Wiedergabe`);
    for (const [name, z] of Object.entries(ph)) {
        if (!(z.bilder >= 300 && z.weg >= 10)) rot.push(`T ${name}: ${z.bilder} Bilder, ${z.weg} m`);
        // ZEIT (w28-tor-bruch): p95 der Wanduhr meldet am Lande-Tor (`mass`), ihr Richter ist das Band-Gerät
        else if (!mass("ZEIT", z.p95 <= TAKT_SOLL_MS, `T ${name}: p95 ${z.p95} > ${TAKT_SOLL_MS} ms`))
            rot.push(`T ${name}: p95 ${z.p95} > ${TAKT_SOLL_MS} ms (${z.traeger.join(" · ")})`);
    }
    if (!ph.fahrt.sattel) rot.push("T fahrt: nicht im Sattel");
    let feuert = true;
    if (SELBSTTEST) {
        await page.evaluate(() => __klangTakt.taeter());
        const s0 = await audio();
        await page.evaluate(() => __klangTakt.stotterer());
        erg.selbst = await taktPhase(page, "selbst", 10);
        const s1 = await audio();
        erg.selbst.aussetzer = s0 && s1 ? s1.n - s0.n : null;
        feuert = erg.selbst.p95 > TAKT_SOLL_MS && erg.selbst.aussetzer > 0;
        console.log(
            `${feuert ? "✅" : "❌"} SELBSTTEST: 300 Rufer p95 ${erg.selbst.p95} ms · ${erg.selbst.aussetzer} Aussetzer`
        );
    }
    for (const t of rot) console.log("   " + t);
    console.log(rot.length ? "❌ ROT — Klang-Takt" : `✅ GRÜN — Klang-Takt p95 ≤ ${TAKT_SOLL_MS} ms`);
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
    const [s, A, P, amOhr] = [r.state, AnazhRealm, Object.getPrototypeOf(r), K.fahrtAmOhr];
    const [sy, pm, gas, F] = [
        s.symphony,
        s.playerMesh,
        A.FAHR_TASTEN.gas.aktion,
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
            halt[gas] = true;
            for (let i = 0; i < 20; i++) {
                bild(1 / 60, 12);
                const d = await abgriff(() => r._fahrtKlangTick());
                F.motor.push([K.fahrtUpm(e._fahr.vlong, e._fahrSatz.vmax, 0), gipfel(linie(d), 20, 1000, 1)]);
            }
            halt[gas] = false;
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
            // DIE VORBEIFAHRT AUF DER WIESE (w20-wald-kosten, z289): die Bahn läuft durch den Ring des Messorts (sein Gesetz hält ihn
            // offen, Kronen-Deckung ≤ 0,12, der Blick frei 15 m) — bis hier begann sie 30 m vor ihm, jenseits des Rings, und eine
            // Kiefer des Bestands 9,5 m in der Bahn hielt den GT an (alle Vorbeifahrten stumm)
            const e = await wagen(m.x - 12, m.z);
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
        halt[gas] = false;
    }
    // über die EINE Brücke (`endlich`, Lehre 17): die stumme Landung misst −∞ dB und reiste als null — null > −90 ist wahr,
    // der Abgriff hörte Ton, wo die Stille lag
    return __klangW.endlich(F);
}
// Das Urteil (F) je Teil beim Namen und die drei Zahlen: Hz je 1000 Upm, Landung dB je m/s, Doppler je Vorbeifahrt.
function koerperUrteil(F) {
    const q = F.motor.map(([u, hz]) => (hz / u) * 1000).sort(aufsteigend);
    const [rot, fall] = [[], F.landung.slice(1)];
    if (q.length && (new Set(F.motor.map(([u]) => Math.round(u / 250))).size < 4 || !(q.at(-1) / q[0] <= 1.04)))
        rot.push(`F motor stumm: ${q[0]}–${q.at(-1)} Hz je 1000 Upm`);
    if (F.landung[0]?.[2]) rot.push(`F landung: der Hopser klingt`);
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
        zahl: `Motor ${rang(q)} Hz je 1000 Upm · Landung ${(l1[4] - l0[4]) / (l1[1] - l0[1])} dB je m/s (${fall.map((x) => `${x[0]} m ${x[1]} m/s ${x[4]} dB`).join(" · ")}) · Doppler ${F.doppler.map((x) => `${x[0]} m ${x[2]}/${x[1]}`).join(" · ")}`,
    };
}

// (Ra) DER RAUM AM OHR (klang.K3 Staffel 1): derselbe Tier-Ruf (ein Leib der Welt: `_tierRuf`, gespielt vom Gesetzbuch
// `tierRuf` — dieselben zwei Schritte wie in der Werkstatt) und dieselbe Glut (der Bau des Dorfs: die Lage am Ohr durch den
// Studio-Graphen) in drei Abständen, und das Ohr dreht sich (die Kamera): die Quelle gerade links und rechts und 30° neben dem
// Blick, der Master an einem Stereo-OfflineAudioContext. Die Seite misst die Spalte 0 der Kamera-Matrix, nie den Rechts-Vektor
// des gemessenen Gesetzes. ROT beim Namen der Probe, wenn ILD = R − L nicht mit dem Vorzeichen der Seite ≥ 3 dB trägt, der
// Pegel nicht ≥ 1 dB je Abstands-Stufe fällt oder die Welt die Quelle in einem anderen Abstand hört (eine nähere Glut) — und
// (erleben.klang.raum#1) wenn die LAUFZEIT je Ohr fehlt: der Gipfel der Kreuzkorrelation Σ L[i]·R[i−t] (±40 Samples) steht nicht
// auf der Seite der Quelle (t > 0: das linke Ohr hört später, die Quelle steht rechts; das Gesetz `ohrLaufzeit`, Woodworth).
// Je Probe: Quelle, Winkel, Abstand, ILD/Pegel in dB, Lag in Samples. Die Täter: S15 der Schatten des Kopfs aus (`ohrRichtung`:
// das Regal ohne Verstärkung — Ruf und Glut klingen mittig), S17 die Laufzeit aus (die Verzögerung ein Gain mit totem delayTime).
async function raumSeite(dorf, mut) {
    const [r, K, P, rot, zahl] = [anazhRealm, __klangCore, BaseAudioContext.prototype, [], []];
    const [s, bq, dly, g] = [r.state, P.createBiquadFilter, P.createDelay, dorf.glut];
    const [pm, cam, tier] = [s.playerMesh, s.camera, s.creatures.find((c) => !c.userData?.dying)];
    // W.orte stellt das Dorf 4 m vor den Bau: (ux, uz) ist ein Meter vom Bau zum Dorf
    const [t0, p0, ux, uz] = [tier.position.clone(), pm.position.clone(), (dorf.x - g.x) / 4, (dorf.z - g.z) / 4];
    if (mut === "pegel")
        P.createBiquadFilter = function () {
            const f = bq.call(this);
            return Object.defineProperty(f, "gain", { value: this.createGain().gain });
        };
    if (mut === "laufzeit")
        P.createDelay = function () {
            return Object.assign(this.createGain(), { delayTime: this.createGain().gain });
        };
    // je Quelle: Abstände, Sekunden, gemessen ab, ihre Richtung vom Ohr und das Spiel in d Metern — es nennt den Abstand der Welt
    const Q = {
        tier: [
            [3, 8, 20],
            2,
            0,
            [1, 0],
            (ctx, d) => {
                tier.position.set(p0.x + d, p0.y, p0.z);
                const ruf = r._tierRuf(tier, "ruhe");
                if (ruf) K.tierRuf(ctx, ctx.destination, ruf);
                return ruf?.d;
            },
        ],
        glut: [
            [1.5, 3, 6],
            3.5,
            1.5,
            [-ux, -uz],
            (ctx, d) => {
                pm.position.set(g.x + ux * d, p0.y, g.z + uz * d);
                const glut = r._umweltLage().glut;
                const mix = K.umweltMischung({ glut });
                for (const k in mix) if (k !== "glut") mix[k].db = -Infinity;
                K.umweltGraph(ctx, ctx.destination).anwenden(mix, 0);
                return glut.d;
            },
        ],
    };
    try {
        for (const [q, [dists, sek, ab, [vx, vz], spiel]] of Object.entries(Q))
            for (const w of [-90, 90, -30, 30])
                for (let i = 0, db0 = Infinity; i < 3; i++) {
                    // der Blick steht so, dass die Quelle w° rechts von ihm klingt (vor jedem Spiel: der Loop dreht die Kamera)
                    const [d, ctx, a] = [
                        dists[i],
                        new OfflineAudioContext(2, 48000 * sek, 48000),
                        Math.atan2(vz, vx) - (w * Math.PI) / 180,
                    ];
                    cam.lookAt(cam.position.x + Math.cos(a), cam.position.y, cam.position.z + Math.sin(a));
                    cam.updateMatrixWorld();
                    const [e, welt] = [cam.matrixWorld.elements, spiel(ctx, d)];
                    const [seite, buf] = [Math.sign(vx * e[0] + vz * e[2]), await ctx.startRendering()];
                    const [kl, kr] = [0, 1].map((c) => buf.getChannelData(c).subarray(48000 * ab));
                    const [L, R] = [kl, kr].map((c) => c.reduce((v, x) => v + x * x, 0) / c.length + 1e-12);
                    // der Pegel-Unterschied dort, wo der Kopf schattet: über f0 = c/(2πa) (ein Hochpass 2. Ordnung, RBJ, in
                    // f0) — darunter beugt sich der Schall um den Kopf, dort trägt die Laufzeit die Seite
                    const [hl, hr] = [kl, kr].map((c) => {
                        const w = (2 * Math.PI * K.schallC()) / (2 * Math.PI * K.UMWELT.ohr.kopfRadiusM) / 48000;
                        const [cw, al] = [Math.cos(w), Math.sin(w) / Math.SQRT2];
                        const [b0, b1, a0, a1, a2] = [(1 + cw) / 2, -(1 + cw), 1 + al, -2 * cw, 1 - al];
                        let [x1, x2, y1, y2, e] = [0, 0, 0, 0, 0];
                        for (const x of c) {
                            const y = (b0 * x + b1 * x1 + b0 * x2 - a1 * y1 - a2 * y2) / a0;
                            [x2, x1, y2, y1, e] = [x1, x, y1, y, e + y * y];
                        }
                        return e / c.length + 1e-12;
                    });
                    const [ild, db] = [10 * Math.log10(hr / hl), 10 * Math.log10(L + R)];
                    // die Laufzeit: der Gipfel von Σ L[i]·R[i−t] über ±40 Samples auf 0,25 s ab der Messung
                    const n = Math.min(kl.length, 12000);
                    let [lag, best] = [0, -Infinity];
                    for (let t = -40; t <= 40; t++) {
                        let v = 0;
                        for (let i = Math.max(0, t); i < n; i++) v += kl[i] * kr[i - t];
                        if (v > best) [lag, best] = [t, v];
                    }
                    // das Gesetz: die Woodworth-Laufzeit der Lage in Samples — der Gipfel trägt mindestens 60 % davon (das Regal
                    // allein verschiebt die Phase um wenige Samples, nie um die Laufzeit des Kopfs)
                    const soll = K.ohrLaufzeit(Math.sin((w * Math.PI) / 180)) * 48000;
                    zahl.push(`${q} ${w}° ${d} m ${ild.toFixed(1)}/${db.toFixed(1)} dB · Lag ${lag}/${soll.toFixed(1)}`);
                    const lagOk = Math.sign(lag) === seite && Math.abs(lag) >= 0.6 * Math.abs(soll);
                    if (!(ild * seite >= 3 && db <= db0 - 1 && Math.abs(welt - d) < 0.1 && lagOk))
                        rot.push(`Ra ${zahl.at(-1)}, Seite ${seite}, gehört in ${welt} m`);
                    db0 = db;
                }
    } finally {
        [P.createBiquadFilter, P.createDelay] = [bq, dly];
        // die Kamera stellt der Loop im nächsten Bild aus dem Blick des Spielers
        tier.position.copy(t0);
        pm.position.copy(p0);
    }
    return { rot, proben: zahl };
}

// (V) DER WEG ZUM OHR (klang-leib, das Raum-Gesetz `raumWeg`): je Ruf der Einsatz am Ohr gegen d / c(T) (Rw: ±0,5 ms oder
// ±2 % an 3, 20, 50 m bei −10, 20, 35 °C), je Weg die Höhen gegen ISO 9613-1 (Rl: ein Sinus 0,5–4 kHz über 300, 1 000 und
// 3 000 m, ±3 dB, wo die Norm ≤ 12 dB dämpft — die Leiter der Luft), kein StereoPanner im Graph aller Stimmen und im Nachhall
// (Rp). Die Täter: S18 der Ruf startet sofort (die Laufzeit über den Weg fehlt), S19 die Leiter flach (kappeDb 0: die Höhen
// reisen ungedämpft), S20 ein Panner im Weg.
async function wegSeite(mut) {
    const [K, P, B, rot, zahl] = [__klangCore, BaseAudioContext.prototype, AudioBufferSourceNode.prototype, [], []];
    const [start, bq, mg] = [B.start, P.createBiquadFilter, P.createChannelMerger];
    let panner = 0;
    const sp = P.createStereoPanner;
    P.createStereoPanner = function () {
        panner++;
        return sp.call(this);
    };
    if (mut === "weg")
        B.start = function (when, ...rest) {
            return start.call(this, 0, ...rest);
        };
    const kappe = K.SCHALLWEG.leiter.kappeDb;
    if (mut === "luft") K.SCHALLWEG.leiter.kappeDb = 0; // die Luft ohne Daempfung: die Leiter steht flach
    if (mut === "panner")
        P.createChannelMerger = function (...a) {
            this.createStereoPanner();
            return mg.apply(this, a);
        };
    try {
        for (const T of [-10, 20, 35])
            for (const d of [3, 20, 50]) {
                const ctx = new OfflineAudioContext(2, 48000 * 0.6, 48000);
                const ruf = K.tierRuf(ctx, ctx.destination, { laengeM: 1, stimmung: "ruhe", d, pan: 0, saat: 7, temperatur: T });
                const buf = await ctx.startRendering();
                const A = buf.getChannelData(0);
                let [peak, ein] = [0, -1];
                for (const x of A) peak = Math.max(peak, Math.abs(x));
                for (let i = 0; i < A.length && ein < 0; i++) if (Math.abs(A[i]) > 0.01 * peak) ein = i;
                const soll = (d / K.schallC(T)) * 48000;
                zahl.push(`${T} °C ${d} m Einsatz ${ein}/${soll.toFixed(0)}`);
                // der Einsatz des Rufs selbst (die Hülle hebt ihn in 0,06 · 0,32 s): 1,6 ms nach seinem Start
                if (!ruf || !(Math.abs(ein - soll - 77) <= Math.max(24, 0.02 * soll))) rot.push(`Rw tier ${d} m bei ${T} °C: Einsatz ${(ein / 48).toFixed(1)} ms, Soll d/c(T) ${(soll / 48).toFixed(1)} ms + 1,6 ms (klang-core raumWeg, die Laufzeit über den Weg)`);
            }
        for (const D of [300, 1000, 3000])
            for (const f of [500, 1000, 2000, 4000]) {
                const iso = K.luftAlpha(f, 20, 70) * D;
                if (iso > 12) continue;
                const db = [];
                for (const d of [0, D]) {
                    const ctx = new OfflineAudioContext(2, 48000 * 0.3, 48000);
                    const o = ctx.createOscillator();
                    o.frequency.value = f;
                    const w = K.raumWeg(ctx, { d, pan: 0, temperatur: 20, feuchte: 70 }, 0);
                    o.connect(w.eingang);
                    w.ausgang.connect(ctx.destination);
                    o.start(0);
                    const c = (await ctx.startRendering()).getChannelData(0).subarray(4800);
                    db.push(10 * Math.log10(c.reduce((v, x) => v + x * x, 0) / c.length + 1e-15));
                }
                const ist = db[0] - db[1];
                zahl.push(`Luft ${f} Hz ${D} m ${ist.toFixed(1)}/${iso.toFixed(1)} dB`);
                if (!(Math.abs(ist - iso) <= 3)) rot.push(`Rl ${f} Hz über ${D} m: ${ist.toFixed(1)} dB gedämpft, ISO 9613-1 ${iso.toFixed(1)} dB (klang-core luftLeiter, die Luft des Wegs)`);
            }
        const ctx = new OfflineAudioContext(2, 4800, 48000);
        const mix = K.umweltMischung(K.UMWELT.orte.sturm);
        for (const k of Object.keys(K.UMWELT.stimmen)) if (mix[k]) mix[k].db = Math.max(mix[k].db, K.UMWELT.hoerschwelleDb + 10);
        K.umweltGraph(ctx, ctx.destination).anwenden(mix, 0);
        K.umweltRaum(ctx, ctx.createGain(), ctx.destination);
        zahl.push(`Panner ${panner}`);
        if (panner) rot.push(`Rp ${panner} StereoPanner im Graph und im Nachhall: ein Weg ohne Kopf und ohne Laufzeit (klang-core raumWeg)`);
    } finally {
        [B.start, P.createBiquadFilter, P.createChannelMerger, P.createStereoPanner] = [start, bq, mg, sp];
        K.SCHALLWEG.leiter.kappeDb = kappe;
    }
    return { rot, proben: zahl };
}

// (St) DIE STIMME AUS DEM LEIB (klang-leib, das Stimm-Gesetz `stimmPuffer`, erleben.klang.stimme#1): je Sprecher-Gruppe der Tafel
// von Peterson & Barney 1952 (die Mittel der 1 520 Messungen, CRAN phonTools `pb52` — 33 Männer, 28 Frauen, 15 Kinder; ihre
// Leibmaße K.STIMME.bezug, K.STIMME.bezugFrau und ein Kind von zehn Jahren, 1,35 m) und je Vokal ein gehaltener Laut über den
// EINEN Weg zum Ohr (`rufSpielen`, 1 m) gerendert; am Abgriff der Grundton (YIN über 92 ms) und F1–F3 im freien Ausklingen
// nach dem letzten Puls (Kovarianz 14. Ordnung über 8 ms — die Pole, gleich welcher Grundton; die Autokorrelation sähe bei
// hohem f0 nur die Harmonischen). Je Wert ±15 % zur Tafel (St); Mann und Frau sind die Eichung der Formen, das Kind die
// Vorhersage des Gesetzes aus seinem Leib. Der Täter: S21 Rachen und Kehle des Manns ohne Pubertät (rachen 0, kehle 0).
// prettier-ignore
const PB_BAND = {"mann":{"i":[136,267,2294,2937],"I":[136,392,1993,2569],"E":[128,526,1854,2481],"ae":[125,664,1727,2420],"A":[124,718,1091,2442],"O":[127,568,836,2403],"U":[136,437,1023,2245],"u":[139,307,876,2239],"V":[129,631,1192,2377],"er":[133,489,1360,1709]},"frau":{"i":[231,310,2783,3312],"I":[232,441,2474,3063],"E":[220,608,2334,2999],"ae":[208,863,2049,2832],"A":[212,864,1229,2783],"O":[217,587,915,2736],"U":[234,469,1162,2685],"u":[235,378,961,2666],"V":[223,758,1409,2768],"er":[219,503,1641,1977]},"kind":{"i":[270,360,3178,3763],"I":[270,534,2744,3604],"E":[259,700,2616,3564],"ae":[248,1017,2334,3366],"A":[258,1030,1383,3188],"O":[259,694,1064,3263],"U":[273,560,1402,3332],"u":[278,432,1193,3250],"V":[263,855,1592,3328],"er":[264,569,1806,2194]}};
const PB_LEIB = { kind: { hoeheM: 1.35, sex: 0.5, jahre: 10 } }; // Mann und Frau: K.STIMME.bezug, K.STIMME.bezugFrau
// (St) DIE RÄNDER DES LEIBS (stimme-leib-2): der kleinste und der größte Leib des Genoms (koerper kh 0,215 · (1 ± 0,08) · 8 =
// 1,58 / 1,86 m) am weichen und am harten Rand jedes Pols der Gestalten (Mann sex 0,25 / 0, Frau 0,75 / 1) gegen die Tafel seines
// Geschlechts, ±15 % — die Stimme eines Erwachsenen folgt seinem Geschlecht und nur schwach seiner Höhe (Pisanski et al. 2014:
// f0 < 2 % der Varianz der Höhe innerhalb eines Geschlechts). Der Täter: S28 die Falte folgt der Höhe voll (falteExp 1, das
// Gesetz bis stimme-leib-2) — der kleine Mann und die große Frau fallen beim Namen.
const PB_RAND = { mannKlein: { hoeheM: 1.5824, sex: 0.25, jahre: 30 }, mannGross: { hoeheM: 1.8576, sex: 0, jahre: 30 }, frauKlein: { hoeheM: 1.5824, sex: 0.75, jahre: 30 }, frauGross: { hoeheM: 1.8576, sex: 1, jahre: 30 } }; // prettier-ignore
const PB_RAND_BAND = Object.fromEntries(Object.keys(PB_RAND).map((g) => [g, PB_BAND[g.startsWith("mann") ? "mann" : "frau"]]));
async function stimmSeite(arg) {
    const { band, leiber, mut } = arg;
    const K = __klangCore, S = K.STIMME, rot = [], je = [], alt = { rachen: S.rachen, kehle: S.kehle, falteExp: S.falteExp };
    if (mut === "pubertaet") [S.rachen, S.kehle] = [0, 0];
    if (mut === "hoehe") S.falteExp = 1;
    const sr = S.sr;
    // die Kovarianz-Methode (Prony): das freie Ausklingen ist eine Summe gedämpfter Schwingungen an den Polen — exakt, gleich
    // welcher Grundton (die Autokorrelation sieht bei hohem f0 nur die Harmonischen)
    const kovarianz = (x, p) => {
        const M = Array.from({ length: p }, () => new Float64Array(p + 1));
        for (let i = 1; i <= p; i++)
            for (let j = 0; j <= p; j++) {
                let s = 0;
                for (let n = p; n < x.length; n++) s += x[n - i] * x[n - j];
                M[i - 1][j === 0 ? p : j - 1] = j === 0 ? -s : s;
            }
        for (let c = 0; c < p; c++) {
            let m = c;
            for (let r = c + 1; r < p; r++) if (Math.abs(M[r][c]) > Math.abs(M[m][c])) m = r;
            [M[c], M[m]] = [M[m], M[c]];
            for (let r = 0; r < p; r++)
                if (r !== c) {
                    const f = M[r][c] / M[c][c];
                    for (let k = c; k <= p; k++) M[r][k] -= f * M[c][k];
                }
        }
        return [1].concat(M.map((z, i) => z[p] / z[i]));
    };
    try {
        for (const gruppe of Object.keys(band)) {
            const leib = leiber[gruppe] || (gruppe === "frau" ? S.bezugFrau : S.bezug);
            for (const v of Object.keys(band[gruppe])) {
                const ctx = new OfflineAudioContext(2, sr * 0.9, sr);
                const tex = K.stimmPuffer({ leib, laut: "halten", vokal: v, saat: 5 });
                const ruf = K.rufSpielen(ctx, ctx.destination, { leib, d: 1, pan: 0, temperatur: 20 }, tex);
                const A = (await ctx.startRendering()).getChannelData(0);
                // der Grundton: YIN (de Cheveigné & Kawahara 2002) über 92 ms des gehaltenen Tons ab 0,2 s, die normierte Differenz
                const i0 = Math.round(0.2 * sr), W = Math.round(0.092 * sr), dif = [1];
                let summe = 0, tau = 0;
                for (let L = 1; L <= Math.ceil(sr / 50); L++) {
                    let s = 0;
                    for (let i = 0; i < W; i++) s += (A[i0 + i] - A[i0 + i + L]) ** 2;
                    summe += s;
                    dif.push((s * L) / summe);
                }
                // die tiefste Senke, dann ihr kürzester Teiler, der ebenso tief sinkt (die Periode, nie ihr Vielfaches)
                const L0 = Math.floor(sr / 600);
                for (let L = L0; L < dif.length - 1; L++) if (!tau || dif[L] < dif[tau]) tau = L;
                for (let k = 5; k >= 2; k--) {
                    let c = Math.round(tau / k);
                    for (let L = c - 2; L <= c + 2; L++) if (L >= L0 && dif[L] < dif[c]) c = L;
                    if (c >= L0 && dif[c] <= dif[tau] + 0.03) {
                        tau = c;
                        break;
                    }
                }
                const bestL = tau + (dif[tau - 1] - dif[tau + 1]) / (2 * (dif[tau - 1] - 2 * dif[tau] + dif[tau + 1]) || 1);
                // die Formanten: das freie Ausklingen nach dem letzten Puls (die Silbe endet bei tex: 0,6 s, dazu der Weg),
                // 8 ms, Kovarianz 14. Ordnung, die Wurzeln (Durand–Kerner): Winkel → Frequenz, Betrag → Bandbreite (< 400 Hz)
                const mul = (u, w) => [u[0] * w[0] - u[1] * w[1], u[0] * w[1] + u[1] * w[0]];
                const div = (u, w) => { const d = w[0] * w[0] + w[1] * w[1]; return [(u[0] * w[0] + u[1] * w[1]) / d, (u[1] * w[0] - u[0] * w[1]) / d]; }; // prettier-ignore
                const pole = (vers) => {
                    const t0 = Math.round((0.6 + ruf.verzug + vers) * sr), N = Math.round(0.008 * sr), x = new Float64Array(N);
                    let gross = 0;
                    for (let i = 0; i < N; i++) gross = Math.max(gross, Math.abs((x[i] = A[t0 + i])));
                    for (let i = 0; i < N; i++) x[i] /= gross || 1;
                    const a = kovarianz(x, 14), p = a.length - 1;
                    let z = Array.from({ length: p }, (_, k) => [Math.pow(0.9, k) * Math.cos(0.4 + 0.9 * k), Math.pow(0.9, k) * Math.sin(0.4 + 0.9 * k)].map((q) => q * 0.999));
                    // bis 800 Schritte, bis kein Wurzel-Schritt 1e-13 übersteigt (die Wurzeln stehen; drei Fenster je Laut)
                    for (let it = 0, schritt = 1; it < 800 && schritt > 1e-13; it++) {
                        schritt = 0;
                        z = z.map((zi, i) => {
                            let f = [1, 0];
                            for (let k = 1; k <= p; k++) f = [mul(f, zi)[0] + a[k], mul(f, zi)[1]];
                            let q = [1, 0];
                            z.forEach((zj, j) => j !== i && (q = mul(q, [zi[0] - zj[0], zi[1] - zj[1]])));
                            const d = div(f, q);
                            schritt = Math.max(schritt, Math.hypot(d[0], d[1]));
                            return [zi[0] - d[0], zi[1] - d[1]];
                        });
                    }
                    return z
                        .filter((w) => w[1] > 0)
                        .map((w) => [(Math.atan2(w[1], w[0]) * sr) / (2 * Math.PI), (-Math.log(Math.hypot(w[0], w[1])) * sr) / Math.PI])
                        .filter(([f, b]) => f > 150 && b < 400)
                        .map(([f]) => f)
                        .sort((u, w) => u - w);
                };
                // DER POL, DER BLEIBT (stimme-leib-2): das freie Ausklingen ist eine Summe FESTER gedämpfter Moden (Prony) — ein
                // Formant steht in jedem Fenster des Ausklingens, ein Pol der Überanpassung (14. Ordnung für fünf Resonatoren) nur in
                // einem. Je Formant der Median aus drei Fenstern ab 3, 4 und 5 ms (am Dorf 1,1 sah das EINE Fenster bei 4 ms an
                // einer Frau 1,67 m einen Pol bei 702 Hz als F2 von /i/, 75 %; die Fenster bei 3 und 5 ms und jede andere Ordnung
                // 2694 Hz)
                const FF = [0.003, 0.004, 0.005].map(pole), mitte = (k) => FF.map((f) => f[k]).filter(Number.isFinite).sort((u, w) => u - w)[1];
                const F = [0, 1, 2].map(mitte);
                const ist = [sr / bestL, F[0], F[1], F[2]], soll = band[gruppe][v];
                const abw = ist.map((q, i) => (Number.isFinite(q) ? Math.abs(q / soll[i] - 1) : 1));
                je.push({ gruppe, v, ist: ist.map((q) => Math.round(q)), soll, abw: abw.map((q) => +(100 * q).toFixed(1)) });
                ["f0", "F1", "F2", "F3"].forEach((n, i) => {
                    if (!(abw[i] <= 0.15)) rot.push(`St ${gruppe} /${v}/ ${n} ${Math.round(ist[i])} Hz, Peterson & Barney ${soll[i]} Hz (${(100 * abw[i]).toFixed(0)} %, klang-core STIMME: der Leib der Stimme)`);
                });
            }
        }
    } finally {
        Object.assign(S, alt);
    }
    const alle = je.flatMap((z) => z.abw);
    return { rot, je, mittelPct: +(alle.reduce((s, q) => s + q, 0) / alle.length).toFixed(2), maxPct: Math.max(...alle), innerhalbPct: +((100 * alle.filter((q) => q <= 15).length) / alle.length).toFixed(1) };
}

// (Dn) DER DONNER AUS DEM BLITZ (klang-leib, das Gesetz `donnerPuffer`, erleben.kopplung.ein-ereignis#2): je Blitz an 400,
// 1 500, 5 000 und 12 000 m bei −10, 20 und 35 °C der Donner über den EINEN Weg zum Ohr (`rufSpielen`, der Blitz bei t0 = 0)
// gerendert; am Abgriff der erste Laut gegen den Weg vom nächsten Punkt des Kanals, d / c(T): das Verhältnis ±2 % (Dn). Der
// Täter: S22 der Donner startet sofort (der Einsatz ohne die Laufzeit über den Weg).
async function donnerSeite(mut) {
    const [K, B, rot, je] = [__klangCore, AudioBufferSourceNode.prototype, [], []];
    const start = B.start;
    if (mut === "sofort")
        B.start = function (when, ...rest) {
            return start.call(this, 0, ...rest);
        };
    try {
        const sr = K.DONNER.sr;
        for (const T of [-10, 20, 35])
            for (const d of [400, 1500, 5000, 12000]) {
                const ruf = { blitz: {}, d, pan: 0.3, saat: 9 + d, t0: 0, temperatur: T };
                const tex = K.donnerPuffer(ruf);
                const soll = tex.dNah / K.schallC(T);
                const ctx = new OfflineAudioContext(2, Math.ceil(sr * (soll + tex.sek + 0.5)), sr);
                const q = K.rufSpielen(ctx, ctx.destination, ruf, tex);
                const A = (await ctx.startRendering()).getChannelData(0);
                let ein = -1;
                for (let i = 0; i < A.length && ein < 0; i++) if (Math.abs(A[i]) > 1e-9) ein = i;
                const verh = ein / sr / soll;
                je.push(+verh.toFixed(4));
                if (!q || !(Math.abs(verh - 1) <= 0.02))
                    rot.push(`Dn ${d} m bei ${T} °C: Einsatz ${(ein / sr).toFixed(3)} s, Soll d/c(T) ${soll.toFixed(3)} s vom nächsten Punkt des Kanals (${tex.dNah.toFixed(0)} m; klang-core donnerPuffer → rufSpielen, der Anschlag des Wegs)`);
            }
    } finally {
        B.start = start;
    }
    return { rot, je };
}

// (Db) DER BLITZ FOLGT DEM FELD AM ORT (klang-leib, `blitzAnteil` über `_wetterFeldAm`, erleben.kopplung.ein-ereignis#2): der
// Kern — je Zeile der EINEN Tafel WEATHER_FIELD der Anteil 1 (Sturm) oder 0, je Mischung des Sturms mit jeder Zeile (¼, ½, ¾)
// ihr Gewicht, im Lee 0,4 das Gewicht × 0,6, je ±1e-9 — und die Welt über den Leser des Donners (`_blitzAnteilAm`): am
// Spieler unter dem Sturm-Wort 1, unter Sonne 0; 12 km fern in acht Richtungen derselbe Anteil unter beiden Worten (die Front
// am Ort), im Lee des Eingriffs unter dem Sturm nie mehr als unter der Sonne. Der Täter: S23 das Wort gilt überall (der Leser
// fragt das Feld des Spielers statt des Felds am Ort — der Stand von klang-leib vor wetter-am-ort).
async function blitzSeite(mut) {
    const [K, F, st, rot, je] = [__klangCore, AnazhRealm.WEATHER_FIELD, r.state, [], { kern: 0, welt: [], lee: 0 }];
    const eigen = Object.hasOwn(r, "_wetterFeldAm");
    const feld = r._wetterFeldAm;
    if (mut === "wort-ueberall")
        r._wetterFeldAm = function () {
            return Object.assign({ lee: 0 }, this._weatherFieldFor());
        };
    const alt = { weather: st.weather, wetterWort: st.wetterWort, weatherTransition: st.weatherTransition };
    const wort = (w) => Object.assign(st, { weather: w, wetterWort: w, weatherTransition: null });
    try {
        const misch = (a, b, t) => Object.fromEntries(Object.keys(a).map((c) => [c, a[c] * (1 - t) + b[c] * t]));
        for (const w of Object.keys(F)) {
            const a = K.blitzAnteil(F[w], F, "stormy");
            const soll = w === "stormy" ? 1 : 0;
            je.kern++;
            if (!(Math.abs(a - soll) <= 1e-9))
                rot.push(
                    `Db Zeile ${w}: Anteil ${a}, Soll ${soll} (klang-core blitzAnteil, der duale Vektor der Tafel)`
                );
            if (w === "stormy") continue;
            for (const t of [0.25, 0.5, 0.75]) {
                const f = misch(F[w], F.stormy, t);
                const b = K.blitzAnteil(f, F, "stormy");
                const c = K.blitzAnteil(Object.assign({}, f, { rain: f.rain * 0.6, lee: 0.4 }), F, "stormy");
                je.kern += 2;
                if (!(Math.abs(b - t) <= 1e-9))
                    rot.push(`Db ${w}↔stormy ${t}: Anteil ${b}, Soll ${t} (klang-core blitzAnteil, die Mischung)`);
                if (!(Math.abs(c - 0.6 * t) <= 1e-9))
                    rot.push(
                        `Db ${w}↔stormy ${t} im Lee 0,4: Anteil ${c}, Soll ${0.6 * t} (klang-core blitzAnteil, das Lee nimmt den Sturm mit dem Regen)`
                    );
            }
        }
        const pm = st.playerMesh;
        const [px, pz] = [pm.position.x, pm.position.z];
        wort("stormy");
        const hierS = r._blitzAnteilAm(px, pz);
        wort("sunny");
        const hierK = r._blitzAnteilAm(px, pz);
        je.hier = [+hierS.toFixed(4), +hierK.toFixed(4)];
        if (!(Math.abs(hierS - 1) <= 1e-6 && hierK <= 1e-6))
            rot.push(
                `Db am Spieler: Anteil unter dem Sturm-Wort ${hierS}, unter Sonne ${hierK} (stamm/klang _blitzAnteilAm: am Spieler gilt sein Wort)`
            );
        const lee = (x, z) => feld.call(r, x, z, st.spielZeit, undefined, false).lee;
        for (let k = 0; k < 8; k++) {
            const [x, z] = [px + 12000 * Math.cos((k * Math.PI) / 4), pz + 12000 * Math.sin((k * Math.PI) / 4)];
            wort("stormy");
            const [s, ls] = [r._blitzAnteilAm(x, z), lee(x, z)];
            wort("sunny");
            const [k0, lk] = [r._blitzAnteilAm(x, z), lee(x, z)];
            je.welt.push([k * 45, +s.toFixed(4), +k0.toFixed(4)]);
            if (ls !== 0 || lk !== 0) {
                je.lee++;
                if (!(s <= k0 + 1e-9))
                    rot.push(
                        `Db 12 km ${k * 45}° im Lee: Anteil unter dem Sturm-Wort ${s.toFixed(3)} über dem unter Sonne ${k0.toFixed(3)} (stamm/klang _blitzAnteilAm: das Lee trocknet den Sturm)`
                    );
            } else if (!(Math.abs(s - k0) <= 1e-9))
                rot.push(
                    `Db 12 km ${k * 45}°: Anteil unter dem Sturm-Wort ${s.toFixed(3)}, unter Sonne ${k0.toFixed(3)} — das Wort gilt fern (stamm/klang _blitzAnteilAm: die Front am Ort, nie das Wort überall)`
                );
        }
    } finally {
        if (eigen) r._wetterFeldAm = feld;
        else delete r._wetterFeldAm;
        Object.assign(st, alt);
    }
    return { rot, je };
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
    const st = r.state;
    const adv = AnazhRealm.Gesetz("terrain:WASSER_GESETZ").wellen.adv;
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
        if (g !== o.gain) (g?.connect(o.an), (o.gain = g));
        if (!g) return 0;
        o.an.getFloatTimeDomainData(o.td);
        return Math.sqrt(o.td.reduce((x, v) => x + v * v, 0) / o.td.length);
    };
    // DAS BILD: die Strömung, die das Wasser im Blick zeichnet, und die Deckkraft des Regens
    const v = new THREE.Vector3();
    const stroemung = (cam) => {
        const fr = r._frustumVon(cam); // der EINE Bau des Sichtkegels (wie der Takt)
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
            G.proben.push([
                Math.hypot(rms("fluss"), rms("ufer")),
                stroemung(st.camera),
                rms("regen"),
                R?.mesh.visible ? R.mesh.material.opacity : 0,
            ]);
    }, 100);
    // der Täter des Selbsttests: das Ohr hört Fluss, Ufer und Regen, wie sie beim Pflanzen klangen — das Bild geht weiter
    G.taeter = () => {
        const Pr = Object.getPrototypeOf(r);
        const alt = Pr._umweltLageZwei; // die Hälfte, die die Lage schließt (der Takt und `_umweltLage` rufen sie)
        let fest;
        Pr._umweltLageZwei = function () {
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
    const mittel = (z) => z.reduce(addiere, 0) / z.length;
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
    await G((w) => r._setWeather(w, "human"), worte[0]);
    for (let g = 0; g < 16 && (i < worte.length || g % 2); g++) {
        const ziel = g % 2 ? () => __gesehen.abstand() >= 45 : () => __gesehen.amWasser();
        if (!(await halteBis(page, { taste: "ws"[g % 2], ziel, frist: g ? 60000 : 180000 })).erreicht)
            throw new Error(`der Gang ${g} am Bach kam nicht an`);
        if (!(await G(() => __gesehen.wandelt())) && ++i < worte.length)
            await G((w) => r._setWeather(w, "human"), worte[i]);
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
    console.log("Bach (x, z, Abstand):", erg.seite.join(" · "));
    erg.gesehen = await gesehenGang(page, ["stormy", "cloudy"]);
    const rot = Object.keys(erg.gesehen).filter((n) => !erg.gesehen[n].gruen);
    let feuert = true;
    if (SELBSTTEST) {
        await page.evaluate(() => __gesehen.taeter());
        erg.selbst = await gesehenGang(page, ["rainy"]);
        feuert = !erg.selbst.ufer.gruen && !erg.selbst.regen.gruen;
        console.log(`${feuert ? "✅" : "❌"} SELBSTTEST: der eingefrorene Pegel ist ROT`);
    }
    console.log(rot.length ? `❌ ROT — gesehen ≠ gehört: ${rot.join(" · ")}` : "✅ GRÜN — gesehen = gehört");
    return !rot.length && feuert ? 0 : 1;
}

// ─────────────────────────────────────────────────────────────────────────
// (Mk) DER MARKT AUS SEINER MENGE (markt-klang, erleben.klang.getuemmel#1 — klang:MENGE): der Markt der Metropole (Messort
// stadt-voll, „dorf 7 300“ am Anker, die Pose `platz` des Profi-Bands, 10 Uhr) am Abgriff der Spitzen-Wand (`s.spitze.ausgang`)
// über `--sek` Sekunden Klang (Vorgabe 30; 600 = die 10 Minuten der Karte), die Musik spielt. Je 250 ms: die Stimmen
// zugleich (der Graph · die klingenden Laute der Werkstatt · die Fahrt), der Pegel am Abgriff (A-bewertet über die Terz-Bänder,
// IEC 61672) und der Gain des Duck-Busses. L_Aeq in dB(A) über die EICHUNG des Gesetzes (`mengeDbA`: die Sprechstimme 60 dB(A)
// in 1 m), am Abgriff gelesen: der Gain von Master und Welt-Bus heraus, die A-Bewertung der Sprechstimme selbst (ihr Laut,
// `stimmPuffer`) heraus. DER DUCK wie die Station (der Mess-Ton 15 kHz −60 dBFS durch den Duck-Bus, `_musikDuck("gespraech", 30)`)
// und am Gain des Busses — der Gain ist das Urteil, die Linie die Zeugin. SOLL: ≥ 7 Stimmen zugleich im Median · L_Aeq im Band
// der Wochenmärkte (MENGE.markt) · Spitze ≤ 0 dBFS · Duck 8–12 dB am Bus · kein Laut der Menge duckt · die Menge spricht (Sprecher
// in Rede, ihr Lärm über dem Knick hebt die Stimme: Lombard). Selbst-Test: S24 der Duck 13,27 dB (die Zahl der Station) · S25 die
// Menge stumm · S26 die Menge duckt die Musik · S27 Lombard aus — je beim Namen.
const MARKT = argv.includes("--markt");
const MARKT_SEK = Number(argOpt("--sek")) || 30;
const FRIST = Math.max(600000, (MARKT_SEK + 400) * 1000); // die Protokoll-Frist trägt den längsten Lauf einer Seite
async function marktSeite(o) {
    const s = r.state, pm = s.playerMesh.position;
    const K = window.__klangCore;
    const leute = (dt) => (r._bewohnerWerkTakt(Infinity), r._tickBewohner(dt));
    const W = window.__markt || (window.__markt = {});
    const __handTakt = () => {
        try {
            r._gameLoopTick(performance.now());
        } catch (e) {
            r._loopErrorBoundary(e);
        }
    };
    // DIE STADT (einmal je Seite): das Wort am Anker, bis jeder Bewohner seinen Leib trägt; die Pose des Platzes; die Uhr
    if (!W.S) {
        const H = await (await fetch("spec/profiband/haushalt.json")).json();
        const M = H.messorte.find((m) => m.id === o.ort);
        const w = M.gruendung.wort.split(" ");
        const [seed, nH, [ax, az]] = [+w[1], +w[2], M.gruendung.anker];
        const S0 = () => [...(r._bewohnerSiedlungen || new Map()).values()].find((q) => q.plan.seed === seed && Math.hypot(q.ox - ax, q.oz - az) < 200);
        if (!S0()) await r.spawnSettlement({ seed, nH, position: { x: ax, y: 0, z: az } });
        const S = S0();
        if (!S) return { fehler: `keine Stadt aus „${M.gruendung.wort}“ am Anker` };
        pm.set(S.ox, r.getTerrainHeightAt(S.ox, S.oz) + 1, S.oz);
        const da = () => !!S.liste && S.liste.every((b) => b.leib && !b.ankunft);
        for (let i = 0; i < 4 * nH && !da(); i++) (__handTakt(), leute(0), await sleep(2));
        let [pose, warum] = [null, ""];
        for (let i = 0; i < 4000 && !pose; i++)
            try {
                pose = r._ortPose([ax, az], "platz");
            } catch (e) {
                warum = e.message;
                if (!e.warten) break;
                (__handTakt(), leute(1 / 60), await sleep(2));
            }
        if (!pose) return { fehler: `keine Pose am Platz: ${warum}` };
        pm.set(pose.x, r.getTerrainHeightAt(pose.x, pose.z) + 1, pose.z);
        for (const t of [o.uhr + 12, o.uhr]) (r._uhrSetzen((t % 24) / 24, "regler"), leute(0));
        for (let i = 0; i < 4 * nH && !da(); i++) leute(0);
        for (let i = 0; i < 300; i++) (__handTakt(), i % 10 || (await sleep(1)));
        if (!s.symphony || !s.symphony.enabled) r.initSymphony();
        Object.assign(W, { S, pose, liste: S.liste.length });
    }
    const nahListe = () => W.S.liste.filter((b) => b.leib && b.leib.position && !b.drinnen && Math.hypot(b.leib.position.x - pm.x, b.leib.position.z - pm.z) < K.STIMME.pegel.hoerweiteM);
    const nahBei = () => nahListe().length;
    const sy = s.symphony, ctx = sy.ctx, um = sy.umwelt, SR = ctx.sampleRate, N = 4096;
    if (um.kern !== K) return { fehler: "der Kern der Umwelt ist nicht __klangCore — die Mutanten träfen ins Leere" };
    if (ctx.state !== "running") await ctx.resume();
    // DIE MUTANTEN (Selbst-Test), zurück im finally
    const zurueck = [];
    const tausche = (o2, k, v) => {
        const [a, eigen] = [o2[k], Object.prototype.hasOwnProperty.call(o2, k)];
        zurueck.push(() => (eigen ? (o2[k] = a) : delete o2[k]));
        o2[k] = v;
    };
    const DG = r.constructor._musikGesetz().duck; // die Tafel, die der Duck liest (`_musikDuck`)
    if (o.mut === "duck") tausche(DG.gespraech, "db", -13.27);
    if (o.mut === "stumm") tausche(K, "mengeRedet", () => null);
    if (o.mut === "lombard") tausche(K.MENGE.lombard, "dbJeDb", 0);
    const duckGesetz = Object.entries(DG).filter(([, v]) => v && typeof v.db === "number").map(([k, v]) => [k, v.db]);
    if (o.mut === "duckt")
        tausche(r, "_bewohnerLaut", ((alt) => function (b, laut, rede) {
            const ruf = alt.call(this, b, laut, rede);
            if (ruf) this._musikDuck("ruf");
            return ruf;
        })(r._bewohnerLaut));
    // die Zeugen: jeder gespielte Ruf (Einsatz, Ende, Rede?), jeder Duck nach Art — und wer ihn griff (ein Laut der Menge?)
    const rufe = [], ducks = {};
    let inMenge = false;
    tausche(r, "_bewohnerLaut", ((alt) => function () {
        inMenge = true;
        try {
            return alt.apply(this, arguments);
        } finally {
            inMenge = false;
        }
    })(r._bewohnerLaut));
    tausche(um.kern, "rufSpielen", ((alt) => function (c, aus, ruf) {
        const e = alt.apply(this, arguments);
        if (e) rufe.push({ t0: e.einsatz, t1: e.einsatz + e.sek, rede: !!(ruf && ruf.silben), an: (ruf && ruf.anstrengungDb) || 0 });
        return e;
    })(um.kern.rufSpielen));
    tausche(r, "_musikDuck", ((alt) => function (art) {
        const k = inMenge ? "menge" : art;
        ducks[k] = (ducks[k] || 0) + 1;
        return alt.apply(this, arguments);
    })(r._musikDuck));
    // die Terz-Bänder 25 Hz … 20 kHz, ihre A-Bewertung (IEC 61672)
    const mitten = [];
    for (let k = -16; k <= 13; k++) mitten.push(1000 * Math.pow(2, k / 3));
    const aW = mitten.map((f) => {
        const f2 = f * f;
        const ra = (12194 ** 2 * f2 * f2) / ((f2 + 20.6 ** 2) * Math.sqrt((f2 + 107.7 ** 2) * (f2 + 737.9 ** 2)) * (f2 + 12194 ** 2));
        return Math.pow(10, (20 * Math.log10(ra) + 2.0) / 10);
    });
    const bandVon = (sr, n) => {
        const bb = new Int16Array(n / 2).fill(-1);
        for (let i = 1; i < n / 2; i++)
            for (let b = 0; b < mitten.length; b++) if ((i * sr) / n >= mitten[b] / Math.pow(2, 1 / 6) && (i * sr) / n < mitten[b] * Math.pow(2, 1 / 6)) bb[i] = b;
        return bb;
    };
    const aAnteil = (band) => {
        let [ea, el] = [0, 0];
        for (let b = 0; b < band.length; b++) (ea += band[b] * aW[b], el += band[b]);
        return el > 0 ? ea / el : 0;
    };
    // DIE A-BEWERTUNG DER SPRECHSTIMME (die Eichung liest sie heraus): ihr Laut im Gesetz, Hann-Fenster je 4096, eine DFT der Bänder
    const ref = K.stimmPuffer({ leib: K.STIMME.bezug, laut: K.MENGE.laut, silben: 6, saat: 7 });
    const rb = new Float64Array(mitten.length), rbb = bandVon(ref.sr, N);
    const fft = (re, im) => {
        for (let i = 1, j = 0; i < N; i++) {
            let b = N >> 1;
            for (; j & b; b >>= 1) j ^= b;
            j ^= b;
            if (i < j) ([re[i], re[j]] = [re[j], re[i]], [im[i], im[j]] = [im[j], im[i]]);
        }
        for (let l = 2; l <= N; l <<= 1)
            for (let i = 0; i < N; i += l)
                for (let k = 0; k < l / 2; k++) {
                    const w = (-2 * Math.PI * k) / l, [c, sn] = [Math.cos(w), Math.sin(w)], [a, b] = [i + k, i + k + l / 2];
                    const [xr, xi] = [re[b] * c - im[b] * sn, re[b] * sn + im[b] * c];
                    [re[b], im[b], re[a], im[a]] = [re[a] - xr, im[a] - xi, re[a] + xr, im[a] + xi];
                }
    };
    for (let a0 = 0; a0 + N <= ref.daten.length; a0 += N / 2) {
        const [re, im] = [new Float64Array(N), new Float64Array(N)];
        for (let n = 0; n < N; n++) re[n] = ref.daten[a0 + n] * (0.5 - 0.5 * Math.cos((2 * Math.PI * n) / N));
        fft(re, im);
        for (let i = 1; i < N / 2; i++) if (rbb[i] >= 0) rb[rbb[i]] += re[i] * re[i] + im[i] * im[i];
    }
    const aSprache = 10 * Math.log10(aAnteil(rb));
    const an = ctx.createAnalyser();
    an.fftSize = N;
    an.smoothingTimeConstant = 0;
    sy.spitze.ausgang.connect(an);
    const td = new Float32Array(N), fd = new Float32Array(N / 2), bb = bandVon(SR, N);
    const proben = [], spek = [];
    let [spitze, eZ, eA, nE] = [0, 0, 0, 0];
    const D0 = { ...ducks };
    let laeuft = true;
    const spiel = () => laeuft && (__handTakt(), requestAnimationFrame(spiel));
    requestAnimationFrame(spiel);
    // die Menge tritt aus den Häusern auf den Platz (die Uhr sprang auf o.uhr): gemessen wird, sobald sie in Hörweite steht —
    // über das EINE Warten (`__weltDa`, ohne Frist: hängt es, nennt die Stall-Akte die Bedingung)
    const tW = ctx.currentTime;
    await window.__weltDa(() => nahBei() > 0);
    const wartete = +(ctx.currentTime - tW).toFixed(1);
    const tA = ctx.currentTime;
    const probe = () => {
        an.getFloatTimeDomainData(td);
        let [p, e] = [0, 0];
        for (let i = 0; i < N; i++) ((p = Math.max(p, Math.abs(td[i]))), (e += td[i] * td[i]));
        spitze = Math.max(spitze, p);
        an.getFloatFrequencyData(fd);
        const band = new Float64Array(mitten.length);
        for (let i = 1; i < N / 2; i++) if (bb[i] >= 0) band[bb[i]] += Math.pow(10, fd[i] / 10);
        const ea = (e / N) * aAnteil(band);
        const lz = 10 * Math.log10(e / N + 1e-20);
        [eZ, eA, nE] = [eZ + e / N, eA + ea, nE + 1];
        if (o.spek) spek.push(Array.from(band, (v) => +(10 * Math.log10(v + 1e-20)).toFixed(1)));
        const jetzt = ctx.currentTime;
        const graph = um.graph.zensus().filter((v) => v.an).length;
        const fliegen = rufe.filter((q) => q.t0 <= jetzt && q.t1 > jetzt);
        const m = sy.menge || {};
        const redner = nahListe().filter((b) => b.genom && !b.amSteuer && K.mengeRedet(b.akt, b.rolle) != null).length;
        proben.push({
            t: +(jetzt - tA).toFixed(2),
            la: +(10 * Math.log10(ea + 1e-20)).toFixed(1),
            l: +lz.toFixed(1),
            p: +(20 * Math.log10(p + 1e-12)).toFixed(1),
            graph,
            rede: fliegen.filter((q) => q.rede).length,
            laute: fliegen.filter((q) => !q.rede).length,
            fahrt: sy.fahrt ? sy.fahrt.size : 0,
            sprecher: m.sprecher || 0,
            redner,
            laerm: Number.isFinite(m.laermDbA) ? +m.laermDbA.toFixed(1) : null,
            ohr: Number.isFinite(m.ohrDbA) ? +m.ohrDbA.toFixed(1) : null,
            lombard: +(m.lombardDb || 0).toFixed(2),
            rest: +(m.rest || 0).toFixed(3),
            duck: +sy.lofi.duck.gain.value.toFixed(3),
        });
    };
    // DER DUCK wie die Station: der Mess-Ton durch den Duck-Bus, Linie und Gain vor und 300 ms nach dem Gespräch
    const duckProbe = async () => {
        const Lf = sy.lofi, an2 = ctx.createAnalyser();
        an2.fftSize = 4096;
        an2.smoothingTimeConstant = 0;
        const k = Math.round(15000 / (SR / an2.fftSize));
        const ton = ctx.createOscillator(), tonG = ctx.createGain();
        ton.frequency.value = (k * SR) / an2.fftSize;
        tonG.gain.value = 1e-3;
        ton.connect(tonG);
        tonG.connect(Lf.duck);
        Lf.duck.connect(an2);
        ton.start();
        const f2 = new Float32Array(an2.frequencyBinCount);
        const linie = async () => {
            let q = 0;
            for (let i = 0; i < 3; i++) (await sleep(60), an2.getFloatFrequencyData(f2), (q += Math.pow(10, f2[k] / 10)));
            return 10 * Math.log10(q / 3);
        };
        await sleep(200);
        for (let i = 0; i < 60 && Lf.duckBis > ctx.currentTime; i++) await sleep(50);
        const frei = !(Lf.duckBis > ctx.currentTime);
        const [l0, g0] = [await linie(), Lf.duck.gain.value];
        r._musikDuck("gespraech", 30);
        await sleep(300);
        const [l1, g1] = [await linie(), Lf.duck.gain.value];
        ton.stop();
        tonG.disconnect();
        Lf.duck.disconnect(an2);
        return { linieDb: +(l0 - l1).toFixed(2), busDb: +(20 * Math.log10(g0 / g1)).toFixed(2), g0: +g0.toFixed(4), frei };
    };
    const duckProben = [];
    try {
        const iv = setInterval(probe, 250);
        let naechster = 3;
        while (ctx.currentTime - tA < o.sek) {
            await sleep(200);
            if (ctx.currentTime - tA > naechster && duckProben.length < o.ducks)
                (duckProben.push(await duckProbe()), (naechster += o.sek / o.ducks));
        }
        clearInterval(iv);
    } finally {
        laeuft = false;
        sy.spitze.ausgang.disconnect(an);
        while (zurueck.length) zurueck.pop()();
    }
    const G = 20 * Math.log10(sy.masterGain.gain.value * um.bus.gain.value);
    const dbA = (lTap) => +(lTap - G - aSprache + K.mengeDbA(0)).toFixed(2);
    const zugleich = proben.map((q) => q.graph + q.rede + q.laute + q.fahrt).sort((a, b) => a - b);
    const nahe = nahBei();
    const duckNach = Object.fromEntries(Object.entries(ducks).map(([k, v]) => [k, v - (D0[k] || 0)]));
    return {
        mut: o.mut || null,
        ort: [+W.pose.x.toFixed(1), +W.pose.z.toFixed(1)],
        uhr: +(s.timeOfDay * 24).toFixed(2),
        sek: +(ctx.currentTime - tA).toFixed(1),
        liste: W.liste,
        nahe,
        wartete,
        lAeqDbA: dbA(10 * Math.log10(eA / nE)),
        leqDbfs: +(10 * Math.log10(eZ / nE)).toFixed(2),
        spitzeDbfs: +(20 * Math.log10(spitze)).toFixed(2),
        zugleichP50: rang(zugleich),
        zugleichMax: zugleich[zugleich.length - 1],
        zugleichMin: zugleich[0],
        redeMax: Math.max(...proben.map((q) => q.rede)),
        sprecherP50: rang(proben.map((q) => q.sprecher).sort(aufsteigend)),
        rednerP50: rang(proben.map((q) => q.redner).sort(aufsteigend)),
        redeAnteilP50: +rang(proben.filter((q) => q.redner > 0).map((q) => q.sprecher / q.redner).sort(aufsteigend))?.toFixed(3),
        redeSoll: +(K.MENGE.rede.sprechSek / (K.MENGE.rede.sprechSek + K.MENGE.rede.pauseSek)).toFixed(3),
        laermDbA: proben.length ? proben[proben.length - 1].laerm : null,
        lombardDb: Math.max(...proben.map((q) => q.lombard)),
        anMax: +Math.max(0, ...rufe.filter((q) => q.rede).map((q) => q.an)).toFixed(2),
        restP50: rang(proben.map((q) => q.rest).sort(aufsteigend)),
        duckGesetz,
        rufe: rufe.length,
        rede: rufe.filter((q) => q.rede).length,
        ducks: duckNach,
        duckAnteil: +(proben.filter((q) => q.duck < 0.99).length / proben.length).toFixed(3),
        duckProben,
        aSprache: +aSprache.toFixed(2),
        mitten: o.spek ? mitten.map((f) => +f.toFixed(1)) : undefined,
        proben: o.spek ? proben : undefined,
        spek: o.spek ? spek : undefined,
    };
}
// DAS URTEIL des Markts: je verfehltes Soll EINE Zeile mit Täter-Namen
function marktUrteil(m) {
    const rot = [];
    if (m.fehler) return [`Mk markt: ${m.fehler}`];
    const K = m.gesetz;
    const [lo, hi] = K.markt;
    // die Menge redet im Anteil des Gesetzes (P.59: Rede / (Rede + Pause)); die Hälfte ist die Wand (der Median über n Redner
    // streut um √(p(1−p)/n) — bei 10 Rednern 0,15)
    if (!(m.sprecherP50 > 0) || !(m.redeAnteilP50 >= m.redeSoll / 2))
        rot.push(`Mk Menge stumm: im Median ${m.sprecherP50} Sprecher in Rede von ${m.rednerP50} Rednern in Hörweite (Anteil ${m.redeAnteilP50}, P.59 trägt ${m.redeSoll}; klang:MENGE mengeRedet)`);
    if (!(m.zugleichP50 >= 7)) rot.push(`Mk zugleich: ${m.zugleichP50} Stimmen im Median (max ${m.zugleichMax}), Soll ≥ 7 — Rede ${m.redeMax} zugleich`);
    if (!(m.lAeqDbA >= lo && m.lAeqDbA <= hi)) rot.push(`Mk L_Aeq ${m.lAeqDbA} dB(A) außerhalb der Wochenmärkte ${lo}–${hi} (MENGE.markt)`);
    if (!(m.spitzeDbfs <= 0)) rot.push(`Mk Spitze ${m.spitzeDbfs} dBFS hinter der Wand`);
    for (const [art, db] of m.duckGesetz) if (db < -12) rot.push(`Mk Duck-Gesetz: MUSIK.duck.${art} senkt ${-db} dB, tiefer als 12`);
    const bus = m.duckProben.map((d) => d.busDb);
    for (const d of bus) if (!(d >= 8 && d <= 12)) rot.push(`Mk Duck ${d} dB am Bus bei Stimme (MUSIK.duck.gespraech), Soll 8–12`);
    if (!bus.length) rot.push("Mk Duck: keine Probe des Busses");
    const menge = m.ducks.menge || 0;
    if (menge > 0) rot.push(`Mk die Menge duckt die Musik: ${menge}× \`_musikDuck("ruf")\` aus Lauten der Menge in ${m.sek} s (Bus ${Math.round(m.duckAnteil * 100)} % gesenkt)`);
    if (m.laermDbA > K.lombardAb && !(m.lombardDb > 0 && m.anMax > 0))
        rot.push(`Mk Lombard aus: Lärm ${m.laermDbA} dB(A) am Sprecher über dem Knick ${K.lombardAb}, die Stimme hebt sich um ${m.lombardDb} dB (Rede bis ${m.anMax} dB)`);
    return rot;
}
async function markt(page, erg) {
    const lauf = async (mut, sek, ducks) => {
        const m = await page.evaluate(marktSeite, { ort: "stadt-voll", uhr: 10, sek, ducks, mut, spek: !!JSON_AUS && !mut });
        const g = await page.evaluate(() => ({ markt: __klangCore.MENGE.markt.lAeqDbA, lombardAb: __klangCore.MENGE.lombard.abDbA }));
        return Object.assign(m, { gesetz: g });
    };
    const m = (erg.markt = await lauf(null, MARKT_SEK, Math.max(2, Math.round(MARKT_SEK / 20))));
    const rot = marktUrteil(m);
    const { proben, spek, mitten, ...kopf } = m;
    console.log(`── (Mk) DER MARKT AUS SEINER MENGE: ${JSON.stringify(kopf)}`);
    let fehl = [];
    if (SELBSTTEST) {
        console.log("\n── SELBST-TEST (Mk)");
        for (const [mut, re, was] of [
            ["duck", /^Mk Duck 13\.27 dB/, "S24: der Duck 13,27 dB"],
            ["stumm", /^Mk Menge stumm/, "S25: die Menge stumm"],
            ["duckt", /^Mk die Menge duckt/, "S26: die Menge duckt die Musik"],
            ["lombard", /^Mk Lombard aus/, "S27: Lombard aus"],
        ]) {
            const u = marktUrteil(await lauf(mut, 8, 1));
            const t = u.find((z) => re.test(z));
            if (!t) fehl.push(`${was} bleibt unbemerkt (${u.join(" · ") || "GRÜN"})`);
            else console.log(`   ${was} → ${t}`);
        }
        for (const t of fehl) console.log("   ❌ " + t);
        if (!fehl.length) console.log("   ✅ S24–S27 nennen jeden Täter beim Namen");
    }
    console.log("");
    if (rot.length) {
        console.log(`❌ ROT — ${rot.length} Befund(e) am Markt:`);
        for (const t of rot) console.log("   " + t);
    } else console.log("✅ GRÜN — der Markt klingt aus seiner Menge");
    return !rot.length && !fehl.length ? 0 : 1;
}

// DER ZENSUS (O · Z · G · H · S · K · E · L · W · A · P) an den Orten aus dem Gesetz.
async function zensus(page, browser, ergebnis) {
    await page.evaluate(AUSGABE_INSTALL);
    // Symphonie an, die Musik ruht (die Linse misst die WELT), die Tiere halten still.
    await page.evaluate(() => {
        __halten();
        Object.getPrototypeOf(r)._lofiTick = function () {};
        r.initSymphony();
        document.getElementById("untertitel-toggle").click(); // die Untertitel über das Spieler-Wort (Ü)
    });
    // der Werkzeugkasten der Seite beim Namen; die Lage bei mittlerer Böe; der Synthese-Zähler je Welt-Phase (die
    // Offline-Renders rechnen für die LINSE, nie gezählt)
    const kW = (fn, ...a) => page.evaluate((fn, a) => __klangW[fn](...a), fn, a);
    const mitte = (l) => ({ ...l, boe: 0.7 });
    const syn = () => kW("synthese");
    const phasen = {};
    // Die Orte.
    let s0 = await syn();
    await kW("umstellen", MESS.x, MESS.z);
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
    await kW("umstellen", MESS.x, MESS.z);
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
    const ut = untertitelUrteil(ereig, daten, await kW("luecken"));
    rot.push(...ut.rot);
    console.log(`── (Ü) UNTERTITEL: ${ut.zahl}`);
    // (Ra) der Raum am Ohr: derselbe Ruf und dieselbe Glut links und rechts
    const ra = (ergebnis.raum = await page.evaluate(raumSeite, orte.dorf, false));
    rot.push(...ra.rot);
    console.log(
        `── (Ra) DER RAUM AM OHR: ${ra.proben.length - ra.rot.length}/${ra.proben.length} Proben GRÜN · ${ra.proben.join(" · ")}`
    );
    // (V) der Weg zum Ohr: Laufzeit über den Weg, Luft nach ISO 9613-1, kein Panner ohne Kopf
    const wg = (ergebnis.weg = await page.evaluate(wegSeite, false));
    rot.push(...wg.rot);
    console.log(`── (V) DER WEG ZUM OHR: ${wg.proben.length - wg.rot.length}/${wg.proben.length} Proben GRÜN · ${wg.proben.join(" · ")}`);
    // (Dn) der Donner aus dem Blitz: der Einsatz am Abgriff gegen d / c(T)
    const dn = (ergebnis.donner = await page.evaluate(donnerSeite, false));
    rot.push(...dn.rot);
    console.log(`── (Dn) DER DONNER AUS DEM BLITZ: ${dn.je.length - dn.rot.length}/${dn.je.length} Einsätze ±2 % zu d/c(T) · Verhältnis ${Math.min(...dn.je)}…${Math.max(...dn.je)}`);
    // (Db) der Blitz folgt dem Feld am Ort: der Anteil des Sturms im Kern und über den Leser des Donners in der Welt
    const db = (ergebnis.blitz = await page.evaluate(blitzSeite, false));
    rot.push(...db.rot);
    console.log(
        `── (Db) DER BLITZ FOLGT DEM FELD AM ORT: Kern ${db.je.kern} Anteile exakt · am Spieler Sturm ${db.je.hier[0]} / Sonne ${db.je.hier[1]} · 12 km je 45° (Sturm-Wort/Sonne) ${db.je.welt.map((w) => `${w[0]}° ${w[1]}/${w[2]}`).join(" · ")} · im Lee ${db.je.lee} von 8`
    );
    // (St) die Stimme aus dem Leib: Grundton und Formanten am Abgriff gegen Peterson & Barney 1952
    const sm = (ergebnis.stimme = await page.evaluate(stimmSeite, { band: PB_BAND, leiber: PB_LEIB, mut: false }));
    rot.push(...sm.rot);
    console.log(
        `── (St) DIE STIMME AUS DEM LEIB: ${sm.je.length * 4 - sm.rot.length}/${sm.je.length * 4} Werte ±15 % zu Peterson & Barney · Mittel ${sm.mittelPct} % · max ${sm.maxPct} % · Kind max ${Math.max(...sm.je.filter((z) => z.gruppe === "kind").flatMap((z) => z.abw))} %`
    );
    // (St) die Ränder des Leibs: der kleinste und der größte Erwachsene am weichen und harten Rand jedes Pols
    const sRand = (ergebnis.stimmeRand = await page.evaluate(stimmSeite, { band: PB_RAND_BAND, leiber: PB_RAND, mut: false }));
    rot.push(...sRand.rot);
    const randMax = (g) => Math.max(...sRand.je.filter((z) => z.gruppe === g).flatMap((z) => z.abw));
    console.log(
        `── (St) DIE RÄNDER DES LEIBS: ${sRand.je.length * 4 - sRand.rot.length}/${sRand.je.length * 4} Werte ±15 % · max ${sRand.maxPct} % · ${Object.keys(PB_RAND).map((g) => `${g} ${randMax(g)} %`).join(" · ")}`
    );
    Object.assign(ergebnis, { orte, daten, offline, kosten: kostenErg, lab, ereig, rot });

    let selbstOk = true;
    if (SELBSTTEST) {
        console.log("\n── SELBST-TEST");
        const fehl = [];
        // der Täter ist benannt, wenn ein Befund der Liste sein Muster trägt — sonst steht er in `fehl`
        const nennt = (rot, re, txt) => rot.some((t) => re.test(t)) || fehl.push(`${txt} bleibt unbemerkt`);
        // S1 + S2: der Drohn-Zwilling und die stumme Schleife.
        await page.evaluate(() => {
            const s = st.symphony;
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
            window.__selbst = [zwillingDrohne(), stummeSchleife()];
        });
        const dS = { wiese: await messeOrt(page, "wiese", orte.wiese, { stehend: true }) };
        await page.evaluate(() => __selbst.forEach((q) => q.stop()));
        const uS = urteile(dS).rot;
        nennt(uS, /^G wiese: .*zwillingDrohne/, "S1: der Drohn-Zwilling");
        nennt(uS, /^H wiese: .*stummeSchleife/, "S2: die stumme Schleife");
        nennt(uS, /^R wiese: .*gezeichnet, singt, Flug 0 m/, "S12: der stehende Vogel");
        // S3: das Wasser am Seeufer weg.
        if (orte.seeufer) {
            const d3 = await messeOrt(page, "seeufer", orte.seeufer, { ohneWasser: true });
            const m3 = d3.zensus?.lage && (await kW("mischung", mitte(d3.zensus.lage)));
            if (m3 && SOLL.seeufer(m3, {}).every(([, ok]) => ok))
                fehl.push("S3: das Seeufer ohne Wasser hält das SOLL");
        } else fehl.push("S3: kein Seeufer gefunden");
        // S4: ein Glut-Umlauf über alle Bauten.
        await kW("umstellen", MESS.x, MESS.z);
        nennt((await kosten(page, { alleBauten: true })).wachsen, /^bauten/, "S4: der Voll-Umlauf über alle Bauten");
        // S5: ein Ereignis-Zwilling (Glocke aus dem Stamm, direkt an den Ausgang).
        // die Ereignis-Tour mit einem Zwilling statt des Glieds `glied` (sein Funktions-Name ist der Täter-Name)
        const mitZwilling = (glied, zwilling) =>
            page.evaluate(
                async (glied, zwilling) => {
                    const P = Object.getPrototypeOf(r);
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
                        zeileAus: () => false,
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
        const u5 = urteile({}, 0, 0, await mitZwilling("_playWaterReactionPing", "zwillingGlocke")).rot;
        nennt(u5, /^E wasser: .*zwillingGlocke.*kein Gesetz/, "S5: der Ereignis-Zwilling");
        nennt(u5, /^E wasser: .*am Master vorbei/, "S5: die Verbindung am Master vorbei");
        // S6: ein Ort, dessen Graph im Haupt-Thread rechnet (ohne Lieferung der Werkstatt).
        if (orte.seeufer) {
            const d6 = await messeOrt(page, "seeufer", orte.seeufer, { ohneWerkstatt: true });
            nennt(
                urteile({ seeufer: d6 }).rot,
                /^W seeufer: \d+ Samples im Haupt-Thread/,
                "S6: der Graph ohne Werkstatt"
            );
        }
        // S7: ein Ruf, der im Haupt-Thread rechnet (der Zwilling ruft das Gesetzbuch direkt im Spiel-Takt).
        const u7 = urteile({}, 0, 0, await mitZwilling("_tierRuf", "zwillingRuf")).rot;
        nennt(u7, /^W tier: \d+ Samples im Haupt-Thread/, "S7: der Ruf im Haupt-Thread");
        // S8: die Glut auf Armlänge (Lab-Ort des Gesetzes) OHNE Spitzen-Wand clippt — und die Probe nennt es.
        const s8 = await imOffline(page, "glutArm", false);
        const u8 = urteile({}, 0, 0, [], {}, { "lab:glutArm": s8 }).rot;
        nennt(
            u8,
            /^P lab:glutArm: Spitze .*ohne Spitzen-Wand/,
            `S8: die Glut auf Armlänge ohne Spitzen-Wand (${s8?.spitzeDbfs} dBFS)`
        );
        // S9: ein Ping-Zwilling im Stamm-Text — eine Methode, die einen Oszillator baut, ohne Wirt-Leser zu sein (keine
        // Tour löst sie aus; die statische Linse nennt sie trotzdem beim Namen).
        const s9 = stammQuellen((t) => {
            const nach = stammLib.glieder(t)[0].ende; // hinter das erste Glied der Klasse (die Methode am AST)
            const ping =
                "\n    zwillingPing(\n        tags\n    ) {\n        const o = this.state.symphony.ctx.createOscillator();\n    }";
            return t.slice(0, nach) + ping + t.slice(nach);
        });
        nennt(
            s9.rot,
            /^G Stamm: Zeile \d+ `\.createOscillator\(` baut eine Klang-Quelle ohne Gesetz/,
            "S9: der Ping-Zwilling im Stamm"
        );
        // S10: ein Wald-Ort, an dem die Karte Wald sagt, aber kein Baum steht — der Bestand nennt es.
        if (daten.wald && daten.wiese) {
            const d10 = { wiese: daten.wiese, wald: { ...daten.wald, baeume: 0 } };
            nennt(urteile(d10).rot, /^S wald: der Bestand trägt keinen Wald/, "S10: ein Wald ohne Bäume");
        } else fehl.push("S10: kein Wald-/Wiesen-Ort gemessen");
        // S11: ein Wasser-Hauch, der den Fußabdruck nicht liest (er klänge auch auf trockenem Land) — die Tour nennt es.
        const u11 = urteile({}, 0, 0, await mitZwilling("_playWaterReactionPing", "zwillingHauch")).rot;
        nennt(
            u11,
            /^E wasserTrocken: \d+ Quelle\(n\), wo die Welt still ist/,
            "S11: der Wasser-Hauch auf trockenem Land"
        );
        // S12: der Phantom-Vogel — gehört ohne Leib: beide Arme der Linse nennen ihn
        const d12 = await messeOrt(page, "wieseOhneLeib", orte.wiese, { ohneLeib: true, phantom: true });
        nennt(leibUrteil(d12.name, d12.zensus), /1 gehört, 0 gezeichnet, singt/, "S12: der Phantom-Vogel");
        // S13: die Täter des Körpers — ein stummer Motor, eine tonlose Landung, ein Doppler mit falschem Vorzeichen
        for (const [mut, re] of [
            ["motor", /^F motor stumm/],
            ["landung", /^F landung \S+ m tonlos/],
            ["doppler", /falsches Vorzeichen/],
        ])
            nennt(koerperUrteil(await page.evaluate(koerperSeite, MESS, mut)).rot, re, `S13: ${mut}`);
        // S14: die Grille liest die Luft am Ohr ohne die Trägheit des Bodens ihrer Röhre — die Sommernacht der Wiese schweigt
        const d14 = await messeOrt(page, "nacht", orte.wiese, { szene: SZENEN.nacht, luft: true });
        d14.mixMitte = await kW("mischung", mitte(d14.zensus.lage));
        nennt(urteile({ nacht: d14 }).rot, /^N nacht: grille/, "S14: die Grille ohne den Boden ihrer Röhre");
        // S15: der Schatten des Kopfs aus — Ruf und Glut klingen mittig; S17: die Laufzeit aus — beide Ohren hören zugleich
        const u15 = (await page.evaluate(raumSeite, orte.dorf, "pegel")).rot;
        for (const q of ["tier", "glut"]) nennt(u15, new RegExp(`^Ra ${q} `), `S15: ${q} ohne Schatten des Kopfs`);
        const u17 = (await page.evaluate(raumSeite, orte.dorf, "laufzeit")).rot;
        for (const q of ["tier", "glut"]) nennt(u17, new RegExp(`^Ra ${q} `), `S17: ${q} ohne Laufzeit je Ohr`);
        // S18: der Ruf startet sofort (die Laufzeit über den Weg fehlt); S19: die Leiter der Luft flach; S20: ein Panner im Weg
        for (const [mut, re, was] of [
            ["weg", /^Rw tier /, "S18: der Ruf ohne Laufzeit über den Weg"],
            ["luft", /^Rl /, "S19: die Luft ohne Dämpfung der Höhen"],
            ["panner", /^Rp /, "S20: ein StereoPanner im Weg"],
        ])
            nennt((await page.evaluate(wegSeite, mut)).rot, re, was);
        // S22: der Donner startet sofort — der Einsatz ohne die Laufzeit über den Weg
        nennt((await page.evaluate(donnerSeite, "sofort")).rot, /^Dn /, "S22: der Donner ohne Laufzeit");
        nennt((await page.evaluate(blitzSeite, "wort-ueberall")).rot, /^Db 12 km /, "S23: das Wort gilt überall");
        // S21: der Mann ohne Pubertät (Rachen und Kehle wie die Frau) — sein Grundton fällt beim Namen
        nennt((await page.evaluate(stimmSeite, { band: PB_BAND, leiber: PB_LEIB, mut: "pubertaet" })).rot, /^St mann /, "S21: der Mann ohne Pubertät");
        // S28: die Falte folgt der Höhe voll (das Gesetz bis stimme-leib-2) — der Grundton des kleinen Manns fällt beim Namen
        nennt((await page.evaluate(stimmSeite, { band: PB_RAND_BAND, leiber: PB_RAND, mut: "hoehe" })).rot, /^St mannKlein \/\S+\/ f0 /, "S28: die Falte folgt der Höhe voll");
        // S16: die Untertitel aus — der Ton spielt, die Zeile schweigt: jedes klingende Ereignis und jede Stimme fallen beim Namen
        const e16 = await mitZwilling("_untertitelZeile", "zeileAus");
        const u16 = untertitelUrteil(e16, { wiese: await messeOrt(page, "wiese", orte.wiese, { ohneZeile: true }) }, []).rot;
        for (const re of [/^Ü treffer: klingt ohne/, /^Ü auftrag: klingt ohne/, /^Ü wiese\/\S+: klingt ohne/])
            nennt(u16, re, `S16: die Untertitel aus (${re})`);
        for (const t of fehl) console.log("   ❌ " + t);
        if (!fehl.length) console.log("   ✅ S1–S23 und S28 nennen jeden Täter beim Namen");
        selbstOk = !fehl.length;
        ergebnis.selbsttest = fehl;
    }
    console.log("");
    if (rot.length) {
        console.log(`❌ ROT — ${rot.length} Befund(e):`);
        for (const t of rot) console.log("   " + t);
    } else console.log("✅ GRÜN — Klang-Zensus");
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
        frist: FRIST,
        zusatz: ["--autoplay-policy=no-user-gesture-required"],
    });
    let exit = 1;
    const ergebnis = {};
    try {
        const page = await browser.newPage();
        page.setDefaultTimeout(FRIST - 10000);
        if (!ECHT) await nullRenderer(page);
        // der Quellen-Abgriff kostet je Quelle einen Stapel — der Takt misst ohne ihn
        if (!TAKT) await page.evaluateOnNewDocument(quellenAbgriff);
        await warteAufWelt(page, 180000, server);
        await page.evaluate(`window.__klangW = (${werkzeug})();`);
        exit = await (TAKT
            ? takt(page, ergebnis)
            : GESEHEN
              ? gesehen(page, ergebnis)
              : MARKT
                ? markt(page, ergebnis)
                : zensus(page, browser, ergebnis).then(async (z) => {
                      // der Markt auf einer FRISCHEN Seite: die Bühne des Zensus (ausgabe-aufnahme `buehne`) hält danach Tag,
                      // Bild-Zeit und Wetter — auf ihr hörte die Wand eine erstarrte Menge (2 Sprecher in Rede statt 47)
                      await page.close().catch(() => {});
                      const p2 = await browser.newPage();
                      p2.setDefaultTimeout(FRIST - 10000);
                      await nullRenderer(p2);
                      await warteAufWelt(p2, 180000, server);
                      return (await markt(p2, ergebnis)) || z;
                  }));
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
