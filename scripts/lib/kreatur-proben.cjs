// kreatur-proben.cjs — DIE KREATUR-PROBEN (Welle L): jede Probe ruft den ECHTEN Kreatur-Takt
// (`updateCreatures`, der EINE Chokepoint) und misst, was das Fenster der Leben-Prüfung zeigte — Krebsgang, Hüpf-Sturm,
// Geister, Geburt im Blick, Beute ohne Flucht, Bewegung am Frustum, Strahl je Frame. Derselbe Seiten-Code läuft headless
// (gate:kreatur-takt, Null-Renderer, Produktions-Boot) und im sichtbaren Fenster der echten GPU (die Werkbank:
// `node scripts/diag-kreatur-takt.cjs --werkbank <port>`); dort ruht der Spiel-Loop (Lehre 17, die Werkbank-Regel). Gestubbt
// wird nichts: die Selbsttests spielen den alten Defekt als Täter ein (`taeter`) und erwarten Rot.
// Je Band beschreibt sein Kopf (`// ── <name> (Klasse): …`), was es misst; das Soll trägt `urteil`, das Gate GATE_PROBEN.
"use strict";

// ═══ DIE SEITEN-FUNKTION (läuft im Browser: r = die Welt, T = THREE) ═══
async function kreaturProben(r, T, opts) {
    const s = r.state;
    const A = r.constructor;
    const nur = (opts && opts.proben) || null;
    const taeter = (opts && opts.taeter) || null; // Selbsttest: der alte Defekt als Täter
    const aus = {};
    const echt = !(s.renderer && s.renderer._isHeadlessNull);
    // Der Spiel-Loop ruht (Lehre 17; die Werkbank-Regel: die Welt ruht zwischen den Befehlen, nur `umstellen` tickt).
    if (echt && s.renderer.setAnimationLoop) s.renderer.setAnimationLoop(null);
    const TAU = Math.PI * 2;
    const wrap = (a) => a - TAU * Math.round(a / TAU);
    const grad = (a) => (a * 180) / Math.PI;
    const quantil = (arr, q) => {
        if (!arr.length) return null;
        const b = arr.slice().sort((x, y) => x - y);
        return b[Math.min(b.length - 1, Math.floor(q * (b.length - 1) + 0.5))];
    };
    const pm = s.playerMesh.position;
    const P0 = pm.clone();

    // Die Bühne je Probe: eigene Tier-Liste (die Welt-Tiere ruhen), der Spieler zurück, Modus und Gefühl zurück.
    const buehne = async (name, fn) => {
        if (nur && !nur.includes(name)) return;
        const altK = s.creatures;
        const altE = s.creatureEmotions;
        const altMax = s.maxCreatures;
        const altModus = r.getGameMode();
        const altGefuehl = Object.assign({}, s.player.emotions || {});
        const altNetSeq = s._creatureNetSeq;
        const restore = [];
        s.creatures = [];
        s.creatureEmotions = [];
        s.maxCreatures = 64;
        // DIE UHR DER BÜHNE (K07): jede Probe beginnt am selben Takt der Kreatur-Uhr und des KI-Takts und mit frischen
        // Fauna-Strömen (_faunaRng, aus dem Seed der Welt), der Blick vom Spieler nach Norden (der Schirm wählt, wessen Gang
        // ausgewertet wird: die Raten-Leiter, _creatureAnimDiv) — gleich, wie lange die Welt einschwang (performance.now: ihre
        // Geburten zogen aus denselben Strömen) und welche Probe vorher lief.
        const altUhr = s.creatureAnimationTime;
        const altAi = r._creatureAiFrame;
        const altStroeme = r._faunaStroeme;
        const altFelder = [s.lifeField, s.emotionField];
        const altSpieler = Object.assign({}, s.player);
        const altTempo = [s.speed, s.sprintSpeed, s.jumpPower];
        // DER LEIB DES SPIELERS (K07): sein Lauf (`playerVel`, den der Leib-Löser im Stoß liest, `_stossKoerper`), seine
        // Lage des Vor-Takts (`_spielerLageAlt`, der Lauf, vor dem ein Jäger hetzt) und der Herden-Takt beginnen je Probe
        // in Ruhe — der Sprinter der Jagd-Probe hinterließ dem Rudel einen Spieler, der mit 0,24 m/s lief (Lücke 186° statt
        // 151°, allein gemessen).
        const altVel = s.playerVel ? [s.playerVel.x(), s.playerVel.y(), s.playerVel.z()] : null;
        const altLage = r._spielerLageAlt;
        const altHerde = s._herdContagionAcc;
        if (s.playerVel) s.playerVel.setValue(0, 0, 0);
        r._spielerLageAlt = null;
        s._herdContagionAcc = 0;
        s.lifeField = undefined;
        s.emotionField = undefined;
        s.creatureAnimationTime = 100;
        r._creatureAiFrame = 0;
        r._faunaStroeme = null;
        pm.copy(P0);
        kamera(0, -1);
        try {
            aus[name] = await fn(restore);
        } catch (e) {
            aus[name] = { fehler: String((e && e.stack) || e).slice(0, 600) };
        } finally {
            for (const f of restore.reverse()) {
                try {
                    f();
                } catch (_e) {
                    /* Aufräumen bleibt best effort, die Zahl steht schon */
                }
            }
            for (const c of s.creatures.slice()) r.removeCreature(c);
            s.creatures = altK;
            s.creatureEmotions = altE;
            s.maxCreatures = altMax;
            s._creatureNetSeq = altNetSeq;
            r.setGameMode(altModus);
            if (s.player.emotions) Object.assign(s.player.emotions, altGefuehl);
            pm.copy(P0);
            s.creatureAnimationTime = altUhr;
            r._creatureAiFrame = altAi;
            r._faunaStroeme = altStroeme;
            for (const k of Object.keys(s.player)) if (!(k in altSpieler)) delete s.player[k];
            Object.assign(s.player, altSpieler);
            [s.speed, s.sprintSpeed, s.jumpPower] = altTempo;
            if (altVel && s.playerVel) s.playerVel.setValue(altVel[0], altVel[1], altVel[2]);
            r._spielerLageAlt = altLage;
            s._herdContagionAcc = altHerde;
            s.lifeField = altFelder[0];
            s.emotionField = altFelder[1];
        }
    };
    // Ein Ort auf Land (nicht im Wasser), relativ zum Spieler.
    const land = (dx, dz) => {
        for (let k = 0; k < 40; k++) {
            const x = P0.x + dx + (k % 8) * 3,
                z = P0.z + dz + Math.floor(k / 8) * 3;
            if (r._landAt(x, z)) {
                const h = r.getTerrainHeightAt(x, z);
                return { x, y: (Number.isFinite(h) ? h : 0) + 0.5, z };
            }
        }
        return { x: P0.x + dx, y: P0.y, z: P0.z + dz };
    };
    // Ein Ort auf Land ohne Bauwerks-Hülle und ohne Wasser im Umkreis R — die Witterungs-Jagd im Freien: an einer Wand
    // gleitet ein Leib längs der Box-Kante (achsparallel), im Wasser schwimmt er in einer Himmelsrichtung ans Ufer
    // (`_creatureWaterContextAt`, vier Richtungen) — beides misst die Hindernis- bzw. Wasser-Probe, nicht die Richtung der
    // Jagd. Seit Schau-2 nennt das Land (`_landAt`) das Ufer eines Sees genau (die Zwillings-Probe dehnte jeden See um
    // eine 16-m-Zelle): ohne die Wasser-Wand wählte die Probe ein Feld am Ufer, und die Jagd lief ins Wasser.
    // DIE HÜLLE IM WEG (K16, die Klasse der Ortssuche): eine Hülle des Bestands, die den Leib-Raum über dem Grund h (von der
    // Stufen-Höhe bis 2 m) näher als R an (x, z) schneidet — dieselbe Nachbarschaft und Box-Probe wie der Leib
    // (`_blockerUmPlatz` + `_boxAbstand2`, `_kreaturHuellenKontakt`). Jede Ortssuche der Proben liest sie; vorher lasen
    // frei() und der Querhang nur die Positionen von `architectures` (± 4 m) und sahen keinen Stamm des Bestands: am Querhang
    // stand die Eiche baum_eiche@-66,-37 in der Gasse, der Wolf schlupfte 0,365 statt 0,19.
    const huelleKand = [];
    const huelleNah = (x, z, h, R) => {
        huelleKand.length = 0;
        r._blockerUmPlatz(x, z, R + 8, huelleKand);
        for (const e of huelleKand)
            for (const b of e.blockerAABBs || []) {
                if (b.topY <= h + A.PLAYER_STEP_UP || b.botY >= h + 2) continue;
                if (r._boxAbstand2(b, x, z) < R * R) return true;
            }
        return false;
    };
    const imUmkreisLand = (x, z, R) => {
        for (const f of [0.5, 1])
            for (let q = 0; q < 8; q++) {
                const a = (q / 8) * Math.PI * 2;
                if (!r._landAt(x + Math.cos(a) * R * f, z + Math.sin(a) * R * f)) return false;
            }
        return true;
    };
    const frei = (dx, dz, R) => {
        for (let ring = 0; ring < 40; ring++) {
            const n = Math.max(1, ring * 6);
            for (let q = 0; q < n; q++) {
                const a = (q / n) * Math.PI * 2;
                const x = P0.x + dx + Math.cos(a) * ring * 8,
                    z = P0.z + dz + Math.sin(a) * ring * 8;
                if (!r._landAt(x, z) || !imUmkreisLand(x, z, R)) continue;
                const h = r.getTerrainHeightAt(x, z);
                if (!Number.isFinite(h) || huelleNah(x, z, h, R)) continue;
                return { x, y: h + 0.5, z };
            }
        }
        return null;
    };
    // DIE FREIE BAHN des Sprinters (K16): die Probe trägt den Läufer ohne Physik geradeaus längs +x, durch jeden Stamm und
    // über jede Kante; der Jäger hinter ihm hält am Stamm (der Hüllen-Kontakt seines Leibs). Die Bahn liest die Probe darum
    // aus der Welt: Land ohne Wasser 8 m quer, ebener Grund (Spanne ≤ 3 m, die Dorfplatz-Grenze), kein Fels über ihr und
    // keine Hülle des Bestands in der Gasse (`_blockerUmPlatz` + `_boxAbstand2`, dieselbe Nachbarschaft und Box-Probe wie
    // `_kreaturHuellenKontakt`).
    const freieBahn = (dx, dz, laenge, vor) => {
        const gasse = 1.5; // halbe Breite der Gasse: Radius und halbe Länge des Wolf-Leibs mit Rand
        const bahnFrei = (x0, z0) => {
            let lo = Infinity,
                hi = -Infinity;
            for (let u = -vor; u <= laenge; u += 1.5) {
                const x = x0 + u;
                if (!r._landAt(x, z0) || !r._landAt(x, z0 - 8) || !r._landAt(x, z0 + 8)) return false;
                const h = r.getTerrainHeightAt(x, z0);
                if (!Number.isFinite(h)) return false;
                lo = Math.min(lo, h);
                hi = Math.max(hi, h);
                if (hi - lo > 3 || r._kreaturUnterFels(x, h, z0) || huelleNah(x, z0, h, gasse)) return false;
            }
            return true;
        };
        for (let ring = 0; ring < 40; ring++) {
            const n = Math.max(1, ring * 6);
            for (let q = 0; q < n; q++) {
                const a = (q / n) * Math.PI * 2;
                const x = P0.x + dx + Math.cos(a) * ring * 8,
                    z = P0.z + dz + Math.sin(a) * ring * 8;
                if (bahnFrei(x, z)) return { x, y: r.getTerrainHeightAt(x, z) + 0.5, z };
            }
        }
        return null;
    };
    // DAS FELD OHNE HÖHLE (Leben-Schau 2): ein Ort, unter dessen Umkreis (der Weg des Spielers und der Folger, x −10…+35,
    // z −8…+35) 15 m tief keine Höhle liegt — die Wand hält ein Tier jetzt in jeder Höhle, in die es läuft (ein Folger ohne
    // Wegfindung bleibt darin; vorher sprang er beim ersten Wand-Kontakt durch das Dach auf die Wiese). Die Gang-Probe misst
    // den freien Lauf: am Hang von land(0, 0) lief der Fuchs in einen 1,2-m-Stollen unter dem Hügel.
    const ohneHoehle = (x0, z0, x1, z1) => {
        for (let x = x0; x <= x1; x += 3)
            for (let z = z0; z <= z1; z += 3) {
                const top = r._voxelSurfaceY(x, z);
                if (!Number.isFinite(top)) return false;
                for (const t of [1, 3, 6, 10, 15]) if (!r._fieldSolid(x, top - t, z)) return false;
            }
        return true;
    };
    const feldOhneHoehle = (dx, dz) => {
        for (let ring = 0; ring < 30; ring++) {
            const n = Math.max(1, ring * 6);
            for (let q = 0; q < n; q++) {
                const a = (q / n) * Math.PI * 2;
                const x = P0.x + dx + Math.cos(a) * ring * 10,
                    z = P0.z + dz + Math.sin(a) * ring * 10;
                if (r._nassAt(x, z)) continue; // die EINE Nässe am Körper (kein stiller Wächter: fehlt sie, bricht der Lauf)
                if (!ohneHoehle(x - 10, z - 8, x + 35, z + 35)) continue;
                const h = r.getTerrainHeightAt(x, z);
                return { x, y: (Number.isFinite(h) ? h : 0) + 0.5, z };
            }
        }
        return null;
    };
    // DER ORT NEBEN DEM SPIELER auf dem Land (Leben-Schau 2): die Höhe des Spielers ist am Hang nicht die des Tiers — 8 m
    // daneben lag sie unter der Wiese in einer Höhle (gate:kreatur-takt gier: der Fuchs 8 m unter dem Gras; vorher sprang er
    // beim ersten Wand-Kontakt durch das Dach hinauf, jetzt hält ihn die Wand).
    const neben = (x, z) => {
        const h = r.getTerrainHeightAt(x, z);
        return { x, y: (Number.isFinite(h) ? h : pm.y) + 0.5, z };
    };
    const tier = (p, seele, bodySize) => {
        const c = r.spawnCreatureAt(p.x, p.y, p.z, "happy", seele, { precise: true, bodySize: bodySize || 1 });
        if (!c) throw new Error("Spawn " + seele);
        return c;
    };
    const ruhig = (c) => {
        c.userData.emotions = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
    };
    const kamera = (blickX, blickZ) => {
        const cam = s.camera;
        cam.position.set(pm.x, pm.y + 1.6, pm.z);
        cam.lookAt(pm.x + blickX, pm.y + 1.6, pm.z + blickZ);
        cam.updateMatrixWorld(true);
        if (cam.matrixWorldInverse) cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
        r._loopFrustumCulling();
    };
    const imBlick = (x, y, z) => {
        const cam = s.camera;
        const m = new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
        return new T.Frustum().setFromProjectionMatrix(m).containsPoint(new T.Vector3(x, y, z));
    };
    // Täter-Einspielung (Selbsttest): eine Methode der Instanz überdecken, im Aufräumen zurück.
    const decke = (restore, name, fn) => {
        const hatte = Object.prototype.hasOwnProperty.call(r, name);
        const alt = r[name];
        r[name] = fn(alt);
        restore.push(() => {
            if (hatte) r[name] = alt;
            else delete r[name];
        });
    };
    // DER TAKT WIE IM SPIEL: erst der feste Sim-Schritt der Leiber (`_stepFixedSim`: der gestoßene Leib
    // `_kreaturStossSchritt` und LEIB AN LEIB `_leibKontakte`), dann der Frame-Takt der Tiere (`updateCreatures`) — die
    // Folge von `_gameLoopTick` (`_loopFixedStep` vor `_loopWeatherAndGrowth`). Gemessen wird, was der Frame zeigt.
    const takt = (dt) => {
        r._kreaturStossSchritt(dt);
        r._leibKontakte();
        r.updateCreatures(dt);
    };
    // DER GANG IM SATZ (Schlupf wie gate:tier-gang — Bewohner und Tiere, `_gangSatz`): je Senke mit Gang-Puffer die Füße der
    // Vorlage (`fuesse(geo)`: je Fuß seine Ecken, die tiefere trägt; null = die Senke trägt keine Sohle) an Band, Phase und
    // Gewicht ihrer Instanz (`aGang`) × Instanz-Matrix — so, wie die GPU sie zeichnet. `leib(x, z)` nennt den Leib der Instanz
    // ({ key, bein, x, z, ry } oder null). Gezählt wird der Gang geradeaus, eingeschwungen und in einem Band (nie Wende,
    // Anlauf, Halt, Wechsel); Stand = die untersten 5 % der Beinlänge.
    const satzGang = (fuesse, leib) => {
        const memo = new WeakMap();
        const spuren = new Map();
        const m4 = new T.Matrix4();
        const vL = new T.Vector3();
        let n = 0;
        const lokal = (m, inst, v) => {
            const G = m.userData.gang;
            const a = m.geometry.attributes;
            const x = a.aGang.getX(inst);
            const w = a.aGang.getY(inst);
            const r0 = Math.floor(x) * G.n;
            const f = (x - Math.floor(x)) * G.n;
            const k0 = Math.floor(f);
            const zs = G.baender * G.n;
            const z0 = r0 + k0;
            const z1 = r0 + ((k0 + 1) % G.n);
            // der Knochen j, Zeile r, Spalte c der Matrix in der Pose-Zeile z (drei Texel je Knochen)
            const el = (z, j, r, c) => G.puffer[((z * G.J + j) * 3 + r) * 4 + c];
            const roh = [a.aRoh.getX(v), a.aRoh.getY(v), a.aRoh.getZ(v), 1];
            const o = [0, 0, 0];
            for (let c = 0; c < 4; c++) {
                const g = a.aGewicht.getComponent(v, c);
                if (g === 0) continue;
                const j = a.aKnochen.getComponent(v, c);
                for (let r = 0; r < 3; r++)
                    for (let s = 0; s < 4; s++) {
                        const lauf = el(z0, j, r, s) + (f - k0) * (el(z1, j, r, s) - el(z0, j, r, s));
                        o[r] += g * roh[s] * (el(zs, j, r, s) + w * (lauf - el(zs, j, r, s)));
                    }
            }
            return vL.set(o[0], o[1], o[2]);
        };
        const messen = (senken) => {
            n++;
            for (const m of senken) {
                if (!m.userData.gang || !(m.count > 0)) continue;
                if (!memo.has(m.geometry)) memo.set(m.geometry, fuesse(m.geometry));
                const F = memo.get(m.geometry);
                const IM = m.instanceMatrix.array;
                const aG = m.geometry.attributes.aGang;
                for (let inst = 0; F && inst < m.count; inst++) {
                    const L = leib(IM[inst * 16 + 12], IM[inst * 16 + 14]);
                    const key = L && m.uuid + "|" + L.key;
                    if (L && !spuren.has(key)) spuren.set(key, { reihe: [], bein: L.bein });
                    if (!L || spuren.get(key).reihe.length >= 1800) continue;
                    m4.fromArray(IM, inst * 16);
                    const fuss = F.map((vs) =>
                        vs.map((v) => {
                            const y = lokal(m, inst, v).y;
                            const w = vL.applyMatrix4(m4);
                            return { y, x: w.x, z: w.z };
                        })
                    );
                    const b = Math.floor(aG.getX(inst));
                    spuren.get(key).reihe.push({ fuss, x: L.x, z: L.z, ry: L.ry, w: aG.getY(inst), b, n });
                }
            }
        };
        const schlupf = () => {
            let wegFuss = 0;
            let wegLeib = 0;
            for (const sp of spuren.values()) {
                const R = sp.reihe;
                for (let j = 0; j < R[0].fuss.length; j++) {
                    let ymin = Infinity;
                    for (const e of R) for (const p of e.fuss[j]) ymin = Math.min(ymin, p.y);
                    for (let i = 1; i < R.length; i++) {
                        const [a0, a1] = [R[i - 1], R[i]];
                        if (a1.n !== a0.n + 1 || Math.abs(a1.ry - a0.ry) > 1e-3) continue;
                        if (Math.min(a0.w, a1.w) < 0.99 || a0.b !== a1.b) continue;
                        let k = 0;
                        for (let q = 1; q < a1.fuss[j].length; q++) if (a1.fuss[j][q].y < a1.fuss[j][k].y - 1e-4) k = q;
                        const [p, q] = [a0.fuss[j][k], a1.fuss[j][k]];
                        if (Math.max(p.y, q.y) > ymin + 0.05 * sp.bein) continue;
                        wegFuss += Math.hypot(q.x - p.x, q.z - p.z);
                        wegLeib += Math.hypot(a1.x - a0.x, a1.z - a0.z);
                    }
                }
            }
            const schlupf = wegLeib > 0 ? Math.round((wegFuss / wegLeib) * 1000) / 1000 : null;
            return { schlupf, wegLeib: Math.round(wegLeib * 10) / 10, spuren: spuren.size };
        };
        // eine Lücke (ein neues Gang-Fenster): kein Paar über sie hinweg
        return { messen, schlupf, luecke: () => n++ };
    };
    // Der Wand-Kontakt je Takt — instrumentiert, nicht gestubbt: der Hüllen-Kontakt des Tiers läuft unverändert, die Linse
    // merkt nur, wessen Lage er schob. Freier Lauf und Anprall werden getrennt gezählt (an einer Box-Kante gleitet ein Leib
    // achsparallel, der Anprall an der Wand ist kein Gas-oder-Bremse). Die Basis kennt den Kontakt nicht: dort bleibt die
    // Menge leer und jeder Takt zählt als freier Lauf.
    const kontaktZaehler = (restore) => {
        const geschoben = new Set();
        decke(
            restore,
            "_kreaturHuellenKontakt",
            (alt) =>
                function (c, ...rest) {
                    const x = c.position.x,
                        z = c.position.z;
                    const o = alt.call(this, c, ...rest);
                    if (c.position.x !== x || c.position.z !== z) geschoben.add(c.position);
                    return o;
                }
        );
        // DER EINE LEIB-LÖSER im Sim-Schritt (`_leibKontakte`): ein Leib, den er aus einem anderen oder aus dem Spieler
        // schiebt, prallt — derselbe Anprall wie an der Wand.
        decke(
            restore,
            "_leibKontakte",
            (alt) =>
                function (...a) {
                    const vor = this.state.creatures.map((c) => [c.position, c.position.x, c.position.z]);
                    const o = alt.apply(this, a);
                    for (const [p, x, z] of vor) if (p.x !== x || p.z !== z) geschoben.add(p);
                    return o;
                }
        );
        return geschoben;
    };

    // ── geister (Q12): clearCreatures räumt jedes Tier ──
    await buehne("geister", async () => {
        if (taeter === "geister")
            r.clearCreatures = function () {
                this.state.creatures.forEach((c) => this.removeCreature(c));
                this.state.creatures = [];
                this.state.creatureEmotions = [];
            };
        try {
            for (let i = 0; i < 6; i++) tier(land(90 + i * 4, 40), i % 2 ? "fuchs" : "wesen");
            const meine = s.creatures.slice();
            r.clearCreatures();
            // ein Geist: aus der Liste gefallen, aber noch in der Szene (eingefroren, sichtbar, zahlt jeden Pass)
            const geister = meine.filter((c) => c.parent && !s.creatures.includes(c));
            for (const g of geister) r.removeCreature(g);
            return { vorher: meine.length, geister: geister.length };
        } finally {
            if (taeter === "geister") delete r.clearCreatures;
        }
    });

    // ── geburt (Q12 + G4a): jedes Tier fern und außerhalb des Blicks; der Wurf ist die GRUPPE (tetrapoda herde.wurf) ──
    await buehne("geburt", async (restore) => {
        // die alten Defekte: die Geburt 15 m vor dem Spieler (Q12) · EIN Tier je Wurf, nie ein Raubtier (bis G4a)
        const alt = {
            geburt: () => ({ x: pm.x + 15, z: pm.z }),
            "geburt-einzeln": (w) => w._kreaturGeburtsOrt(w._faunaRng()),
        };
        if (alt[taeter])
            decke(
                restore,
                "_creatureNaturalBirth",
                () =>
                    function () {
                        const o = alt[taeter](this);
                        return !!o && !!this.spawnCreatureAt(o.x, pm.y, o.z, "happy", "wesen");
                    }
            );
        kamera(1, 0);
        const d = [];
        const z = { gruppen: [], rudel: 0, herden: 0, fensterMax: 0, imBlick: 0, journal: 0 };
        for (let k = 0; k < 16; k++) {
            const vor = s.creatures.length;
            r._creatureNaturalBirth();
            const neu = s.creatures.slice(vor);
            if (!neu.length) continue;
            z.gruppen.push(neu[0].userData.gattung + " " + neu.length);
            if (neu.length > 1) z[neu[0].userData.gattung === "wolf" ? "rudel" : "herden"]++;
            const j = s.worldJournal.entries[s.worldJournal.entries.length - 1]; // der Eintrag nennt die Gruppe
            if (j && j.type === "growth" && j.ctx && j.ctx.gruppe === neu.length) z.journal++;
            // der Paar-Raum der Gattung (zwei Tiere der Größe 1) — der nächste der Gruppe steht im Fenster der Herde
            const paar = (2 * r._kreaturRaum(neu[0])) / neu[0].userData.bodySize;
            for (const c of neu) {
                d.push(Math.hypot(c.position.x - pm.x, c.position.z - pm.z));
                if (imBlick(c.position.x, c.position.y + 0.5, c.position.z)) z.imBlick++;
                let nn = Infinity;
                for (const o of neu) if (o !== c) nn = Math.min(nn, c.position.distanceTo(o.position) / paar);
                if (nn < Infinity) z.fensterMax = +Math.max(z.fensterMax, nn).toFixed(2);
            }
            for (const c of neu) r.removeCreature(c);
        }
        const H = A._verhaltenGesetz().herde;
        return Object.assign(z, {
            geburten: z.gruppen.length,
            gruppen: z.gruppen.join(" · "),
            fensterRaum: H.fensterRaum,
            minM: d.length ? +Math.min(...d).toFixed(1) : null,
            maxM: d.length ? +Math.max(...d).toFixed(1) : null,
            fernMin: A.CREATURE_SPAWN_FAR_MIN,
        });
    });

    // ── sattel (Q12): der Tod im Sattel steigt ab ──
    await buehne("sattel", async (restore) => {
        const KS = A.KIND_SUBSTANCE || {};
        if (!KS.fahrzeug_wagen) return { fehler: "KIND_SUBSTANCE.fahrzeug_wagen fehlt" };
        s.blueprints._t_linse_wagen = {
            name: "_t_linse_wagen",
            parts: JSON.parse(JSON.stringify(KS.fahrzeug_wagen.parts)),
            connections: JSON.parse(JSON.stringify(KS.fahrzeug_wagen.connections || [])),
        };
        const p = land(30, 30);
        const e = r.spawnArchitecture("_t_linse_wagen", p, { silent: true });
        const altGnade = s.player.respawnGraceUntil;
        const altHp = s.player.hp;
        restore.push(() => {
            if (s.player.mountedArch != null) r.dismountArchitecture();
            if (e) r.removeArchitecture(e);
            delete s.blueprints._t_linse_wagen;
            s.player.respawnGraceUntil = altGnade;
            s.player.hp = altHp;
            s.player.deathWoundIntensity = 0;
        });
        if (!e) return { fehler: "Wagen-Spawn" };
        r.mountArchitecture(e);
        const auf = s.player.mountedArch === e.id;
        if (taeter === "sattel")
            decke(
                restore,
                "_playerDeathRespawn",
                (alt) =>
                    function (q) {
                        const m = this.state.player.mountedArch;
                        alt.call(this, q);
                        this.state.player.mountedArch = m;
                    }
            );
        s.player.respawnGraceUntil = -Infinity;
        r._playerDeathRespawn("linse");
        return { aufgestiegen: auf, nachTod: s.player.mountedArch == null ? null : s.player.mountedArch };
    });

    // ── huepfer (Q1/Q2 + das Sprung-Gesetz): jeder Sprung aus einer Aktion, über das EINE Sprung-Gesetz (creatureJump),
    // auf die Höhe des Freude-Gesetzes (VERHALTEN.freude: ein frohes Wesen hopHochM, sonst hopBasisM), und die Flugzeit
    // hängt nie am Takt ──
    await buehne("huepfer", async (restore) => {
        r.setGameMode("frieden");
        // Die Kreatur-Uhr fest (die Aktions-Wahl hasht Index × Zeit): jeder Lauf wählt dieselben Aktionen — sonst hing die
        // Zahl der Sprünge (3–5) an der Boot-Dauer der Welt.
        const F = A._verhaltenGesetz().freude;
        const hoehe = (c) => (s.creatureEmotions[s.creatures.indexOf(c)] === "happy" ? F.hopHochM : F.hopBasisM);
        const tiere = [];
        for (let i = 0; i < 6; i++) {
            const c = tier(land(18 + i * 3, 22), "wesen");
            r.assignCreatureTask(c, "wait", {}, { silent: true });
            tiere.push(c);
        }
        // Der Konsum des Sprung-Gesetzes: wie oft creatureJump einen Sprung STARTET (instrumentiert, durchgereicht).
        let rufe = 0;
        decke(
            restore,
            "creatureJump",
            (alt) =>
                function (c, ...rest) {
                    const ud = c && c.userData;
                    const flog = !!ud && (ud._hopV > 0 || ud._hopH > 0);
                    const o = alt.call(this, c, ...rest);
                    if (ud && !flog && ud._hopV > 0) rufe++;
                    return o;
                }
        );
        if (taeter === "huepfer")
            decke(
                restore,
                "updateCreatures",
                (alt) =>
                    function (dt) {
                        alt.call(this, dt);
                        for (let i = 0; i < this.state.creatures.length; i++) {
                            const c = this.state.creatures[i];
                            const h =
                                ((c.userData.netId.length * 7919 +
                                    Math.floor(this.state.creatureAnimationTime * 60) * 104729 +
                                    i) %
                                    997) /
                                997;
                            if (h < 0.02 && !(c.userData._hopH > 0)) this.creatureJump(c);
                        }
                    }
            );
        // Der Zwilling: die Aktion zündet den Hüpfer mit ihrem eigenen Abflug in m/s (der alte `def.hop`, 3,2 m/s),
        // am Sprung-Gesetz vorbei.
        if (taeter === "huepfer-zwilling")
            decke(
                restore,
                "_tickKreaturVerhalten",
                (alt) =>
                    function (c, ...rest) {
                        const ud = c.userData;
                        const vor = ud && ud._verhaltenAktion;
                        const o = alt.call(this, c, ...rest);
                        const VA = ud && ud._verhaltenAktion;
                        if (VA && VA !== vor && VA.def && VA.def.hop && ud._hopV > 0) ud._hopV = 3.2;
                        return o;
                    }
            );
        const dt = 1 / 60;
        let frames = 0,
            luft = 0,
            starts = 0,
            ausAktion = 0,
            scheitel = 0;
        const warLuft = tiere.map(() => false);
        const flugNun = tiere.map(() => null); // je Tier der laufende Sprung: {soll, top}
        const fehler = [];
        for (let k = 0; k < 2400; k++) {
            for (let i = 0; i < tiere.length; i++) if (i < 3) tiere[i].userData.emotions.joy = 0.9;
            takt(dt);
            for (let i = 0; i < tiere.length; i++) {
                const ud = tiere[i].userData;
                const h = ud._hopH || 0;
                const istLuft = h > 0.005;
                frames++;
                if (istLuft) luft++;
                if (istLuft && !warLuft[i]) {
                    starts++;
                    const VA = ud._verhaltenAktion;
                    if (VA && VA.def && VA.def.hop) ausAktion++;
                    flugNun[i] = { soll: hoehe(tiere[i]), top: 0 };
                }
                if (flugNun[i]) flugNun[i].top = Math.max(flugNun[i].top, h);
                if (!istLuft && warLuft[i] && flugNun[i]) {
                    fehler.push(Math.abs(flugNun[i].top / flugNun[i].soll - 1));
                    flugNun[i] = null;
                }
                if (h > scheitel) scheitel = h;
                warLuft[i] = istLuft;
            }
        }
        // Der Takt-Beweis: derselbe Sprung bei 30 und 144 Hz (Scheitel und Flugzeit in Sim-Sekunden), und der Scheitel ist
        // das Freude-Gesetz — froh hopHochM, sonst hopBasisM.
        const flug = (hz, etikett) => {
            const c = tiere[0];
            r.assignCreatureTask(c, "wait", {}, { silent: true });
            c.userData._hopH = 0;
            c.userData._hopV = 0;
            c.userData._verhaltenAktion = null;
            c.userData.emotions.joy = 0;
            takt(1 / hz);
            s.creatureEmotions[s.creatures.indexOf(c)] = etikett;
            const soll = hoehe(c);
            r.creatureJump(c);
            let t = 0,
                top = 0,
                n = 0;
            for (; n < 4000; n++) {
                takt(1 / hz);
                t += 1 / hz;
                top = Math.max(top, c.userData._hopH || 0);
                if (!((c.userData._hopH || 0) > 0)) break;
            }
            return { t, top, soll };
        };
        const rufeImLauf = rufe; // die Flug-Proben unten rufen creatureJump selbst
        const f30 = flug(30, "happy"),
            f144 = flug(144, "happy"),
            fSad = flug(60, "sad");
        return {
            luftAnteil: +(luft / frames).toFixed(4),
            starts,
            ausAktion,
            rufe: rufeImLauf,
            scheitelM: +scheitel.toFixed(3),
            gesetzFehler: fehler.length ? +Math.max(...fehler).toFixed(3) : null,
            hopHochM: F.hopHochM,
            hopBasisM: F.hopBasisM,
            flug30: { t: +f30.t.toFixed(3), top: +f30.top.toFixed(3) },
            flug144: { t: +f144.t.toFixed(3), top: +f144.top.toFixed(3) },
            flugVerhaeltnis: f30.t > 0 ? +(f144.t / f30.t).toFixed(3) : null,
            frohFehler: +Math.abs(f30.top / f30.soll - 1).toFixed(3),
            basisTop: +fSad.top.toFixed(3),
            basisFehler: +Math.abs(fSad.top / fSad.soll - 1).toFixed(3),
        };
    });

    // ── wachsen (Q2): 3600 Wachstums-Takte am Loop-Pfad ──
    await buehne("wachsen", async (restore) => {
        const c = tier(land(95, -40), "wesen");
        r.assignCreatureTask(c, "wait", {}, { silent: true });
        const s0 = c.scale.x;
        const altWetterT = s.weatherEffectTime;
        restore.push(() => {
            s.weatherEffectTime = altWetterT;
        });
        if (taeter === "wachsen")
            decke(
                restore,
                "_loopWeatherAndGrowth",
                (alt) =>
                    function (dt, t) {
                        alt.call(this, dt, t);
                        for (const k of this.state.creatures)
                            if (Math.floor(t) % 20 === 0) k.scale.multiplyScalar(1.01);
                    }
            );
        // 3600 Spiel-Sekunden am Loop-Pfad (je Aufruf eine Sekunde weiter — das alte Wachsen würfelte je Sekunde)
        const t0 = 1e6;
        for (let k = 0; k < 3600; k++) {
            s.weatherEffectTime = 0;
            r._loopWeatherAndGrowth(1 / 60, t0 + k);
        }
        return { skala: +(c.scale.x / s0).toFixed(4) };
    });

    // ── gier (Q3): die Tiere folgen dem Spieler im Quadrat ──
    await buehne("gier", async (restore) => {
        r.setGameMode("frieden");
        const arten = ["wesen", "wolf", "fuchs"];
        const start = feldOhneHoehle(0, 0);
        if (!start) return { fehler: "kein Feld ohne Höhle (45 × 43 m, 15 m tief) für den Gang" };
        pm.set(start.x, start.y, start.z);
        const tiere = arten.map((a, i) => {
            const c = tier(neben(pm.x - 4 - i * 2, pm.z - 3), a);
            ruhig(c);
            r.assignCreatureTask(c, "follow_player", {}, { silent: true });
            return c;
        });
        if (taeter === "gier")
            decke(
                restore,
                "updateCreatures",
                (alt) =>
                    function (dt) {
                        alt.call(this, dt);
                        for (const c of this.state.creatures) c.rotation.y = 0;
                    }
            );
        // R-D17 Folgen als Gas oder Bremse: jenseits des Halts das volle Tempo, davor 0 (am Ankunfts-Gesetz vorbei).
        if (taeter === "gier-folgen")
            decke(
                restore,
                "_kreaturZiel",
                () =>
                    function (out, dx, dz, rest, vMax) {
                        const d = Math.hypot(dx, dz);
                        if (!(d > 1e-6) || !(rest > 0) || !(vMax > 0)) return out.set(0, 0, 0);
                        return out.set((dx / d) * vMax, 0, (dz / d) * vMax);
                    }
            );
        // Pfoten: der Aufsetz-Punkt jeder Pfote im Pfoten-Raum (die Linse von gate:tier-gang, frei gegiert).
        const pfoten = tiere.map((cr) => {
            const tb = cr.userData._tierBaum;
            if (!tb || !tb.teile) return null;
            const Tt = tb.teile;
            const ps = [Tt.flP, Tt.frP, Tt.hlP, Tt.hrP];
            if (ps.some((p) => !p) || !Tt.legHL) return null;
            r._tierBaumNeutralStance(cr);
            cr.updateMatrixWorld(true);
            const boden = cr.position.y;
            const lokal = ps.map((p) => {
                const w = new T.Vector3().setFromMatrixPosition(p.matrixWorld);
                w.y = boden;
                return p.worldToLocal(w.clone());
            });
            const hueft = new T.Vector3().setFromMatrixPosition(Tt.legHL.matrixWorld).y - boden;
            return { ps, lokal, hueft, spur: ps.map(() => []), leib: [], ph: [] };
        });
        const dt = 1 / 60;
        const v = 1.4; // m/s — der Spieler geht
        const ecken = [
            [0, 1],
            [1, 0],
            [0, -1],
            [-1, 0],
        ];
        const zeilen = tiere.map(() => ({
            abw: [],
            rueck: 0,
            seit: 0,
            lauf: 0,
            vs: [],
            beschl: [],
            kontakt: 0,
            phase: 0, // +1 Gas, −1 Bremse (im freien Lauf, |a| > 1,5 m/s²)
            wechsel: 0, // Gas ↔ Bremse
            freiT: 0,
        }));
        const vorher = tiere.map((c) => ({ x: c.position.x, z: c.position.z, v: 0, anprall: false }));
        const geschoben = kontaktZaehler(restore);
        let k = 0;
        for (const [ex, ez] of ecken) {
            for (let j = 0; j < Math.round(30 / v / dt); j++, k++) {
                pm.x += ex * v * dt;
                pm.z += ez * v * dt;
                takt(dt);
                tiere.forEach((c, i) => {
                    const dx = c.position.x - vorher[i].x,
                        dz = c.position.z - vorher[i].z;
                    const sp = Math.hypot(dx, dz) / dt;
                    const z = zeilen[i];
                    const anprall = geschoben.has(c.position);
                    if (anprall && k > 60) z.kontakt++;
                    if (k > 60) {
                        z.vs.push(sp);
                        // der Tempo-Sprung im FREIEN Lauf (der Anprall-Takt und der danach zählen nicht)
                        if (!anprall && !vorher[i].anprall) {
                            const a = (sp - vorher[i].v) / dt;
                            z.beschl.push(Math.abs(a));
                            z.freiT += dt;
                            // GAS ODER BREMSE (R-D17): wie oft der Folger zwischen Anfahren und Bremsen umschlägt — das
                            // Ankunfts-Gesetz lässt ihn im Tempo des Spielers einlaufen, ein 4-oder-0-Wunsch pumpt.
                            const ph = a > 1.5 ? 1 : a < -1.5 ? -1 : 0;
                            if (ph && z.phase && ph !== z.phase) z.wechsel++;
                            if (ph) z.phase = ph;
                        }
                    }
                    // Lauf ↔ Blick im FREIEN Lauf (schiebt die Wand den Leib zurück, ist das kein Rückwärtsgang)
                    if (sp > 0.3 && k > 60 && !anprall) {
                        const a = Math.abs(grad(wrap(Math.atan2(dx, dz) - c.rotation.y)));
                        z.abw.push(a);
                        z.lauf++;
                        if (a > 90) z.rueck++;
                        else if (a > 45) z.seit++;
                    }
                    vorher[i] = { x: c.position.x, z: c.position.z, v: sp, anprall };
                    const pf = pfoten[i];
                    if (pf) {
                        c.updateMatrixWorld(true);
                        const g = c.userData._tierBaum && c.userData._tierBaum._gang;
                        pf.leib.push({ x: c.position.x, z: c.position.z, y: c.position.y, sp, gier: c.rotation.y });
                        pf.ph.push(g && g.ph ? g.ph.slice() : null);
                        pf.ps.forEach((p, j2) => pf.spur[j2].push(p.localToWorld(pf.lokal[j2].clone())));
                    }
                });
                geschoben.clear();
            }
        }
        // DER STAND-SCHLUPF: im STAND einer Pfote (ihre Gang-Phase in [π, 2π), gangFuss: der Fuß wandert dort am Boden)
        // darf ihr Aufsetz-Punkt nicht mit dem Leib wandern — Weg des Stand-Fußes / Weg des Leibs. Zerlegt nach der Gier des
        // Leibs: QUER (seitlich zur Laufrichtung — die Signatur des Krebsgangs, Q3) und LÄNGS (längs der Laufrichtung — am
        // Hang die Schrittlänge des Gangs in XZ gegen den geneigten Leib, Q4 R-D10/R-D11: das Gang-Gesetz misst die Lage nur
        // in XZ). Geurteilt wird QUER; LÄNGS und die Summe stehen als Zahl.
        const TAU2 = Math.PI * 2;
        const imStand = (ph, j) => {
            if (!ph) return false;
            const u = ((ph[j] % TAU2) + TAU2) % TAU2;
            return u >= Math.PI;
        };
        const schlupf = pfoten.map((pf) => {
            if (!pf) return null;
            let wegF = 0,
                wegL = 0,
                wegQ = 0,
                wegH = 0;
            for (let j = 0; j < 4; j++) {
                for (let n = 61; n < pf.spur[j].length; n++) {
                    const a = pf.spur[j][n - 1],
                        b = pf.spur[j][n];
                    if (pf.leib[n].sp < 0.3) continue;
                    if (!imStand(pf.ph[n - 1], j) || !imStand(pf.ph[n], j)) continue;
                    const dx = b.x - a.x,
                        dz = b.z - a.z;
                    const g = pf.leib[n].gier;
                    wegF += Math.hypot(dx, dz);
                    wegQ += Math.abs(dx * Math.cos(g) - dz * Math.sin(g));
                    wegH += Math.abs(dx * Math.sin(g) + dz * Math.cos(g));
                    wegL += Math.hypot(pf.leib[n].x - pf.leib[n - 1].x, pf.leib[n].z - pf.leib[n - 1].z);
                }
            }
            return wegL > 0
                ? { s: +(wegF / wegL).toFixed(3), q: +(wegQ / wegL).toFixed(3), l: +(wegH / wegL).toFixed(3) }
                : null;
        });
        const o = {};
        arten.forEach((a, i) => {
            const z = zeilen[i];
            o[a] = {
                laufFrames: z.lauf,
                kontaktFrames: z.kontakt,
                abwP50: z.abw.length ? +quantil(z.abw, 0.5).toFixed(1) : null,
                abwP90: z.abw.length ? +quantil(z.abw, 0.9).toFixed(1) : null,
                rueckwaerts: z.lauf ? +(z.rueck / z.lauf).toFixed(3) : 0,
                seitwaerts: z.lauf ? +(z.seit / z.lauf).toFixed(3) : 0,
                tempoP50: +quantil(z.vs, 0.5).toFixed(2),
                tempoP90: +quantil(z.vs, 0.9).toFixed(2),
                beschlMax: +Math.max(...z.beschl).toFixed(1),
                gasBremseJeMin: z.freiT > 0 ? +((z.wechsel / z.freiT) * 60).toFixed(1) : null,
                schlupf: schlupf[i] ? schlupf[i].s : null,
                schlupfQuer: schlupf[i] ? schlupf[i].q : null,
                schlupfLaengs: schlupf[i] ? schlupf[i].l : null,
            };
        });
        return o;
    });

    // ── jagd (Q3 + Q11): die Witterungs-Jagd folgt dem Geruch, die Beute flieht vor dem Jäger ──
    await buehne("jagd", async (restore) => {
        r.setGameMode("pfad");
        const w0 = frei(-60, 50, 30);
        if (!w0) return { fehler: "kein freies Feld (30 m ohne Hülle) für die Jagd" };
        pm.set(w0.x + 45, pm.y, w0.z + 20); // der Spieler fern (jenseits der Witterung des Spielers)
        const wolf = tier(w0, "wolf");
        ruhig(wolf);
        const beute = [
            [8, 3],
            [-6, 7],
            [2, -9],
        ].map(([dx, dz]) => {
            const c = tier({ x: w0.x + dx, y: w0.y, z: w0.z + dz }, "wesen");
            ruhig(c);
            c.userData.hp = 9999;
            return c;
        });
        // R-D12: die Richtung der Jagd auf eine Himmelsachse gerastet (der Jagd-Weg ist seit Welle LF _kreaturJagdZug)
        if (taeter === "jagd")
            decke(
                restore,
                "_kreaturJagdZug",
                (alt) =>
                    function (c, tx, tz, key, d, ...rest) {
                        const o = alt.call(this, c, tx, tz, key, d, ...rest);
                        const m = Math.hypot(d.x, d.z);
                        if (m > 0) {
                            if (Math.abs(d.x) > Math.abs(d.z)) d.set(Math.sign(d.x) * m, 0, 0);
                            else d.set(0, 0, Math.sign(d.z) * m);
                        }
                        return o;
                    }
            );
        // R-D4/K-D11: die Beute wittert nur den Spieler — der jagende Jäger ist keine Bedrohung.
        if (taeter === "jagd-flucht")
            decke(
                restore,
                "_creatureWariness",
                () =>
                    function (c) {
                        const ud = c.userData || {};
                        const von = ud._bedrohtVon || (ud._bedrohtVon = { x: 0, z: 0, r: 0 });
                        return this._creatureWarinessSpieler(c, A._verhaltenGesetz().furcht, von);
                    }
            );
        const dt = 1 / 60;
        const NAT = A._verhaltenGesetz().furcht;
        const geschoben = kontaktZaehler(restore);
        // DIE PEILUNG DES ZIELS LIEST DEN ZUSTAND (K13): die Körper, die die Probe selbst kennt — die drei Beutetiere und den
        // Spieler — je Takt an ihrem Ort, vom Ort des Wolfs vor dem Schritt.
        const peilKoerper = [...beute, s.playerMesh];
        // K13: das Raster liegt schon auf dem ZIEL (die äußerste Hülle: der Fehler sitzt vor dem Jagd-Weg) — er bekommt eine Peilung, die vom Wolf aus genau längs einer
        // Himmelsachse liegt (gleicher Abstand); ein Lauf darauf ist ein Raster, auch wenn er „auf sein Ziel" geht
        if (taeter === "jagd-ziel")
            decke(
                restore,
                "_kreaturJagdZug",
                (alt) =>
                    function (c, tx, tz, ...rest) {
                        const dx = tx - c.position.x,
                            dz = tz - c.position.z;
                        const m = Math.hypot(dx, dz);
                        if (Math.abs(dx) > Math.abs(dz)) {
                            tx = c.position.x + Math.sign(dx) * m;
                            tz = c.position.z;
                        } else {
                            tx = c.position.x;
                            tz = c.position.z + Math.sign(dz) * m;
                        }
                        return alt.call(this, c, tx, tz, ...rest);
                    }
            );
        let jagdFrames = 0,
            kontakt = 0,
            achs = 0,
            achs5 = 0,
            achsWasser = 0,
            bedroht = 0,
            fort = 0,
            imWasser = 0;
        const achsOrt = { gierAchse: 0, rein: 0, ansprung: 0, stoss: 0, beispiele: [] };
        let achsZiel = 0; // Achsen-Takte, in denen der Wolf geradewegs auf sein Ziel läuft (es liegt auf derselben Linie)
        let wv = { x: wolf.position.x, z: wolf.position.z };
        const bv = beute.map((c) => ({ x: c.position.x, z: c.position.z }));
        for (let k = 0; k < 1800; k++) {
            takt(dt);
            const dx = wolf.position.x - wv.x,
                dz = wolf.position.z - wv.z;
            const jagt = wolf.userData._motionZustand === "jagd" || wolf.userData._motionZustand === "hetzen";
            const anprall = geschoben.has(wolf.position);
            geschoben.clear();
            if (jagt && anprall) kontakt++;
            if (jagt && r._nassAt(wolf.position.x, wolf.position.z)) imWasser++; // die Jagd im Wasser (Diagnose)
            if (jagt && !anprall && Math.hypot(dx, dz) / dt > 0.3) {
                jagdFrames++;
                const h = Math.atan2(dx, dz);
                let m = Infinity;
                for (let q = 0; q < 4; q++) m = Math.min(m, Math.abs(wrap(h - (q * Math.PI) / 2)));
                // Die Achsen-Signatur ist die QUANTISIERUNG: das Argmax aus vier Proben setzte die Richtung exakt auf eine
                // Himmelsachse, der Lauf lag auf ihr (Basis: 100 % auf 0,25° genau). Ein stetiger Gradient trifft das
                // 0,5°-Fenster je Achse zufällig in ~0,6 % der Takte; nahe einer Achse liegt er nur, wenn der Wind dort
                // weht (die Fahne des Geruchs) — darum zählt das enge Fenster, das 5°-Fenster steht als Zahl daneben.
                // DER LAUF AUF SEIN ZIEL (Nachbesserung 4, der Täter der zwei CI-Ausschläge 38,4 % / 16,2 %): eine gerade Hetze
                // hinter einer Beute, die genau längs einer Himmelsachse flieht (sie flieht vom Jäger fort, er läuft auf sie zu —
                // die Linie hält ihre Richtung), oder ein gerader Lauf auf ein Ziel, das auf einer Achse liegt, ist kein Raster.
                // Welche Linie entsteht, hängt am Zustand der Welt beim Start der Probe (Bauten 1 121–1 258 je Boot, die
                // Kreatur-Uhr nach einem Einschwingen auf der Wand-Uhr). 169 Orte, Kreatur-Uhr und Wind fest: die alte Zählung
                // bis 15,0 % (83 Achsen-Takte, jeder auf sein Ziel), diese höchstens 1,9 %. Das Raster (R-D12) dreht den Lauf von
                // der Peilung fort (Täter jagd: 22–28 %) — gezählt wird nur der Achsen-Takt, dessen Lauf mehr als 1° neben der
                // Peilung des Ziels liegt.
                const aufZiel = peilKoerper.some(
                    (c) =>
                        Math.abs(wrap(h - Math.atan2(c.position.x - wv.x, c.position.z - wv.z))) < (1 * Math.PI) / 180
                );
                if (grad(m) < 0.25 && aufZiel) achsZiel++;
                else if (grad(m) < 0.25) {
                    achs++;
                    // DER ORT DES ACHSEN-TAKTS (Bericht, die Linse nennt die Quelle): im Wasser (die Ufer-Scheu sucht das Ufer
                    // in vier Himmelsrichtungen), die Gier selbst auf einer Achse (der Leib läuft längs seiner Gier), ein
                    // reiner Achsen-Schritt (dx oder dz exakt 0), im Ansprung, mit getragenem Stoß; dazu drei Beispiele
                    const ud = wolf.userData;
                    const gier = ud._steuer ? ud._steuer.gier : wolf.rotation.y;
                    let mg = Infinity;
                    for (let q = 0; q < 4; q++) mg = Math.min(mg, Math.abs(wrap(gier - (q * Math.PI) / 2)));
                    if (r._creatureWaterContextAt(wolf, r._creatureGroundY(wolf)).inWater) achsWasser++;
                    if (grad(mg) < 0.25) achsOrt.gierAchse++;
                    if (dx === 0 || dz === 0) achsOrt.rein++;
                    if (ud._verhaltenAktion && ud._verhaltenAktion.biss) achsOrt.ansprung++;
                    if (ud._stossV) achsOrt.stoss++;
                    if (achsOrt.beispiele.length < 3)
                        achsOrt.beispiele.push({
                            k,
                            zs: ud._motionZustand,
                            ziel: ud._jagdZiel ? String(ud._jagdZiel).slice(0, 8) : null,
                            v: ud._steuer ? +ud._steuer.v.toFixed(2) : null,
                            gierGrad: +grad(gier).toFixed(2),
                            dx: +dx.toFixed(4),
                            dz: +dz.toFixed(4),
                        });
                }
                if (grad(m) < 5) achs5++;
            }
            // Die Beute, die den Jäger bemerkt (Zustand flucht — ein pirschender Jäger bleibt bis jagd.pirschSichtM
            // unbemerkt, Welle LF), läuft von ihm fort.
            beute.forEach((c, i) => {
                const vx = c.position.x - bv[i].x,
                    vz = c.position.z - bv[i].z;
                const rx = bv[i].x - wv.x,
                    rz = bv[i].z - wv.z;
                const d = Math.hypot(rx, rz);
                if (
                    jagt &&
                    c.userData._motionZustand === "flucht" &&
                    d < NAT.noticeRadius &&
                    Math.hypot(vx, vz) / dt > 0.3
                ) {
                    bedroht++;
                    if (vx * rx + vz * rz > 0) fort++;
                }
                bv[i] = { x: c.position.x, z: c.position.z };
            });
            wv = { x: wolf.position.x, z: wolf.position.z };
        }
        return {
            jagdFrames,
            kontaktFrames: kontakt,
            wasserFrames: imWasser,
            achsAnteil: jagdFrames ? +(achs / jagdFrames).toFixed(3) : null,
            achsZielAnteil: jagdFrames ? +(achsZiel / jagdFrames).toFixed(3) : null,
            achsAnteil5Grad: jagdFrames ? +(achs5 / jagdFrames).toFixed(3) : null,
            achsImWasser: achsWasser,
            achsOrt,
            bedrohtFrames: bedroht,
            fortAnteil: bedroht ? +(fort / bedroht).toFixed(3) : null,
            bisse: beute.filter((c) => c.userData.hp < 9999).length,
        };
    });

    // ── herde (Q11, S6): der Verband des ECHTEN Wurfs (`_kreaturWurf`, fünf scheue Hirsche aus dem Strom „verband"; beim
    // Wurf steht der Spieler 140 m fort und blickt fort) hält beim Wandern (der Spieler 45 m fern, jenseits der Witterung)
    // und auf der Flucht (er treibt die Herde mit 1,4 m/s durch ihren Wurf-Ort): je Takt der Anteil der Glieder binnen
    // fensterRaum × Paar-Raum vom Mittel, ab 10 s bzw. solange ein Glied flieht. Ein fremder Verband derselben Art (ein
    // zweiter Wurf, 30 m fort) zieht nie, und die Bewegung hängt nie am Blick (gleiche Lage nach 20 s) ──
    await buehne("herde", async (restore) => {
        r.setGameMode("frieden");
        if (taeter === "herde")
            decke(
                restore,
                "updateCreatures",
                (alt) =>
                    function (dt) {
                        alt.call(this, dt);
                        for (const c of this.state.creatures) if (this.isInFrustum(c)) c.position.x += 0.01;
                    }
            );
        // die Herden-Form vor S6: die Glieder sind jedes Tier DERSELBEN Gattung — zwei fremde Herden einer Art verschmelzen
        if (taeter === "herde-artfremd")
            decke(
                restore,
                "_kreaturVerbandGlieder",
                () =>
                    function (c) {
                        return this.state.creatures.filter((o) => this._kreaturGattung(o) === this._kreaturGattung(c));
                    }
            );
        const VH = A._verhaltenGesetz().herde;
        const heim = frei(0, 70, 40);
        if (!heim) throw new Error("kein freies Land für die Herde (frei(0, 70, 40))");
        const seq0 = s._creatureNetSeq || 0;
        const lauf = (art) => {
            const flucht = art === "flucht";
            for (const c of s.creatures.slice()) r.removeCreature(c);
            Object.assign(s, { _creatureNetSeq: seq0, creatureAnimationTime: 100 });
            Object.assign(r, { _creatureAiFrame: 0, _faunaStroeme: null });
            pm.set(heim.x + 140, heim.y, heim.z);
            kamera(1, 0);
            let glieder = r._kreaturWurf({ x: heim.x, z: heim.z }, "wesen", "happy", r._faunaRng("verband"), 7);
            const fremd =
                art === "fremd"
                    ? r._kreaturWurf({ x: heim.x, z: heim.z + 30 }, "wesen", "happy", r._faunaRng("fremd"), 7)
                    : [];
            // der alte Defekt (vor S6): derselbe Wurf (Orte, Seele, Anker), aber jedes Tier für sich geboren, ungebunden
            if (taeter === "herde-zerfall")
                glieder = glieder.map((c) => {
                    const { x, y, z } = c.position;
                    const anker = c.userData.wanderAnchor;
                    r.removeCreature(c);
                    const n = r.spawnCreatureAt(x, y, z, "happy", c.userData.soul);
                    n.userData.wanderAnchor = anker;
                    return n;
                });
            const anteil = () => {
                const mx = glieder.reduce((m, c) => m + c.position.x, 0) / glieder.length;
                const mz = glieder.reduce((m, c) => m + c.position.z, 0) / glieder.length;
                const d = glieder.map(
                    (c) => Math.hypot(c.position.x - mx, c.position.z - mz) / (2 * r._kreaturRaum(c))
                );
                return d.filter((v) => v <= VH.fensterRaum).length / glieder.length;
            };
            const t = { n: glieder.length, fremdN: fremd.length, wurf: anteil(), summe: 0, bilder: 0, fluchtTakte: 0 };
            Object.assign(t, { fs: 0, fb: 0, fMin: 1 });
            for (let k = 0; k < (art === "fremd" || art === "blick" ? 1200 : 3600); k++) {
                const q = neben(heim.x + (flucht ? -12 + (1.4 * k) / 60 : 45), heim.z);
                pm.set(q.x, q.y, q.z);
                if (k % 600 === 0) kamera(flucht || art === "blick" ? 1 : -1, 0);
                takt(1 / 60);
                if (k === 1199) t.lage = glieder.map((c) => ({ x: c.position.x, z: c.position.z }));
                const fliehen = glieder.filter((c) => c.userData._motionZustand === "flucht").length;
                const a = anteil();
                t.fluchtTakte += fliehen;
                if (k >= 600) ((t.summe += a), t.bilder++);
                if (fliehen) ((t.fs += a), t.fb++, (t.fMin = Math.min(t.fMin, a)));
            }
            return t;
        };
        const [W, F, X, B] = ["wander", "flucht", "fremd", "blick"].map(lauf);
        const abw = (u, v) => Math.max(...u.lage.map((p, i) => Math.hypot(p.x - v.lage[i].x, p.z - v.lage[i].z)));
        const zahl = (t) => ({
            n: t.n,
            wurfAnteil: +t.wurf.toFixed(3),
            mittel: +(t.summe / t.bilder).toFixed(3),
            fluchtAnteil: +(t.fluchtTakte / (3600 * t.n)).toFixed(3),
            fluchtMittel: t.fb ? +(t.fs / t.fb).toFixed(3) : null,
            fluchtMin: t.fb ? +t.fMin.toFixed(3) : null,
        });
        return {
            fremdN: X.fremdN,
            artFremdZugM: +abw(W, X).toFixed(4),
            blickDiffM: +abw(W, B).toFixed(4),
            verband: { fensterRaum: VH.fensterRaum, wander: zahl(W), flucht: zahl(F) },
        };
    });

    // ── hindernis (Q11 + Lehre 25): kein Feld-Strahl je Tier und Takt, die Wand wird umgangen ──
    await buehne("hindernis", async (restore) => {
        r.setGameMode("frieden");
        let strahlen = 0,
            dichte = 0,
            boden = 0;
        const zaehle = (name, inc) =>
            decke(
                restore,
                name,
                (alt) =>
                    function (...a) {
                        inc();
                        return alt.apply(this, a);
                    }
            );
        zaehle("_fieldRaycast", () => strahlen++);
        zaehle("_fieldSolid", () => dichte++);
        zaehle("_voxelSurfaceY", () => boden++);
        if (taeter === "hindernis")
            decke(
                restore,
                "updateCreatures",
                (alt) =>
                    function (dt) {
                        alt.call(this, dt);
                        for (const c of this.state.creatures)
                            this._fieldRaycast(
                                c.position.x,
                                c.position.y + 0.5,
                                c.position.z,
                                c.position.x + 2,
                                c.position.y + 0.5,
                                c.position.z + 2
                            );
                    }
            );
        kamera(1, 0);
        for (let i = 0; i < 8; i++) {
            const c = tier(land(14 + (i % 4) * 7, -16 + Math.floor(i / 4) * 14), i % 3 ? "wesen" : "fuchs");
            ruhig(c);
        }
        for (let k = 0; k < 60; k++) takt(1 / 60); // eingeschwungen (Boden-Caches)
        strahlen = 0;
        dichte = 0;
        boden = 0;
        const N = 120;
        for (let k = 0; k < N; k++) takt(1 / 60);
        const kosten = {
            tiere: s.creatures.length,
            strahlenJeTakt: +(strahlen / N).toFixed(2),
            dichteJeTakt: +(dichte / N).toFixed(1),
            bodenJeTakt: +(boden / N).toFixed(1),
        };
        for (const c of s.creatures.slice()) r.removeCreature(c);
        // Die Wand: 8 × 2,5 × 0,8 m Stein zwischen dem Folger und dem Spieler.
        s.blueprints._t_linse_wand = {
            name: "_t_linse_wand",
            parts: [
                { shape: "box", material: "stein", position: { x: 0, y: 1.25, z: 0 }, size: { x: 8, y: 2.5, z: 0.8 } },
            ],
        };
        const wo = land(20, 20);
        const e = r.spawnArchitecture("_t_linse_wand", wo, { silent: true });
        restore.push(() => {
            if (e) r.removeArchitecture(e);
            delete s.blueprints._t_linse_wand;
        });
        if (!e || !Array.isArray(e.blockerAABBs) || !e.blockerAABBs.length)
            return Object.assign(kosten, { fehler: "Wand ohne Hülle" });
        const box = e.blockerAABBs[0];
        const mz = (box.minZ + box.maxZ) / 2,
            mx = (box.minX + box.maxX) / 2;
        pm.set(mx, pm.y, mz + 10);
        const c = tier({ x: mx + 0.3, y: wo.y, z: mz - 8 }, "wesen");
        ruhig(c);
        r.assignCreatureTask(c, "follow_player", {}, { silent: true });
        // DER LEIB DES TIERS (D2): EINE benannte Größe (_kreaturLeib), die der Hüllen-Kontakt liest — gezählt, durchgereicht.
        // Die Probe selbst liest den Leib am Prototyp (zählt nicht mit) und misst, wie weit die vordere Leib-Achse (die
        // Schnauze) vor dem Stein bleibt.
        // gezählt werden nur die Rufe AUS dem Hüllen-Kontakt (der Leib-Löser der Welle LF liest den Leib auch)
        let leibRufe = 0,
            imKontakt = 0;
        const leibVon = A.prototype._kreaturLeib;
        decke(
            restore,
            "_kreaturLeib",
            (alt) =>
                function (...a) {
                    if (imKontakt > 0) leibRufe++;
                    return alt.apply(this, a);
                }
        );
        decke(
            restore,
            "_kreaturHuellenKontakt",
            (alt) =>
                function (...a) {
                    imKontakt++;
                    try {
                        return alt.apply(this, a);
                    } finally {
                        imKontakt--;
                    }
                }
        );
        // Der Zwilling: der Kontakt rechnet einen eigenen Leib (dieselben Zahlen, aber nicht die benannte Größe).
        if (taeter === "hindernis-leib")
            decke(
                restore,
                "_kreaturHuellenKontakt",
                (alt) =>
                    function (...a) {
                        const spion = this._kreaturLeib;
                        this._kreaturLeib = (cr, l, o) => {
                            const q = o || {};
                            q.L = l;
                            q.radius = Math.max(0.12, 0.3 * l);
                            q.halb = 0.8 * l;
                            q.hoehe = Math.max(0.5, 1.8 * l);
                            q.fx = Math.sin(cr.rotation.y);
                            q.fz = Math.cos(cr.rotation.y);
                            return q;
                        };
                        try {
                            return alt.apply(this, a);
                        } finally {
                            this._kreaturLeib = spion;
                        }
                    }
            );
        let drin = 0,
            durch = false,
            vornMin = null;
        const N2 = 900;
        for (let k = 0; k < N2; k++) {
            takt(1 / 60);
            const p = c.position;
            if (p.x > box.minX && p.x < box.maxX && p.z > box.minZ && p.z < box.maxZ) drin++;
            if (p.z > box.maxZ + 1) durch = true;
            if (leibVon) {
                const lb = leibVon.call(r, c);
                const qx = p.x + lb.fx * lb.halb,
                    qz = p.z + lb.fz * lb.halb;
                const ax = Math.max(box.minX - qx, 0, qx - box.maxX),
                    az = Math.max(box.minZ - qz, 0, qz - box.maxZ);
                const ab =
                    ax > 0 || az > 0
                        ? Math.hypot(ax, az)
                        : -Math.min(qx - box.minX, box.maxX - qx, qz - box.minZ, box.maxZ - qz);
                if (vornMin === null || ab < vornMin) vornMin = ab;
            }
        }
        return Object.assign(kosten, {
            wandFrames: drin,
            wandAnteil: +(drin / N2).toFixed(3),
            angekommen: durch,
            leibRufe,
            vornMinM: vornMin === null ? null : +vornMin.toFixed(3),
        });
    });

    // ── gedreht (D5): das Tier am GEDREHTEN Haus — die Hülle der Stufe reist als gedrehte Box (`_hausHuelleSetzen` →
    // `_hausObb`, derselbe Weg wie der Beipack `__huelle` der Foundry); der Leib löst im Rahmen der Box und meldet seinen
    // Kontakt an sich, nie an die Parkour-Wand des Spielers (state._wandKontakt*) ──
    await buehne("gedreht", async (restore) => {
        r.setGameMode("frieden");
        // Täter 1: der OBB-Zweig reicht den Kontakt-Empfänger des Tiers nicht weiter (der Integrations-Stand vor D5).
        if (taeter === "gedreht-kontakt")
            decke(
                restore,
                "_resolveCapsuleVsAABB",
                (alt) =>
                    function (box, pos, f, h, rad, st, k) {
                        return alt.call(this, box, pos, f, h, rad, st, box && box.obb ? null : k);
                    }
            );
        // Täter 2: Innen-Test und Reichweite lesen die Welt-AABB der gedrehten Box (größer als die Box).
        if (taeter === "gedreht-rahmen")
            decke(
                restore,
                "_boxAbstand2",
                (alt) =>
                    function (box, x, z) {
                        return alt.call(this, { minX: box.minX, maxX: box.maxX, minZ: box.minZ, maxZ: box.maxZ }, x, z);
                    }
            );
        // Das Haus: eine Wand 8 × 0,8 m, 34° gedreht, als Hülle der Stufe (haus-lokal [x0,y0,z0,x1,y1,z1], in den Boden
        // gesenkt, damit der Hang unter ihr nie eine Lücke lässt).
        const PHI = 0.6;
        s.blueprints._t_linse_haus = {
            name: "_t_linse_haus",
            parts: [
                { shape: "box", material: "stein", position: { x: 0, y: 1.25, z: 0 }, size: { x: 8, y: 2.5, z: 0.8 } },
            ],
        };
        const wo = frei(-60, 40, 30) || land(-60, 40);
        const e = r.spawnArchitecture("_t_linse_haus", wo, { silent: true, rotationY: PHI });
        restore.push(() => {
            if (e) r.removeArchitecture(e);
            delete s.blueprints._t_linse_haus;
        });
        if (!e) return { fehler: "Haus nicht gesetzt" };
        // die EINE Hüllen-Form (N5, S3 haus): die Wand als Kasten c ± h, rolle "fest" (vorher die Zahlen-Zeile `boxen`)
        r._hausHuelleSetzen(e, {
            stufe: 0,
            teile: [{ art: "box", c: [0, -0.25, 0], h: [4, 2.75, 0.4], rolle: "fest" }],
        });
        const box = (e.blockerAABBs || []).find((b) => b.obb);
        if (!box) return { fehler: "die Hülle trägt keine gedrehte Box" };
        const ob = box.obb;
        const lokal = (x, z) => {
            const dx = x - ob.cx,
                dz = z - ob.cz;
            return { x: dx * ob.c - dz * ob.s, z: dx * ob.s + dz * ob.c };
        };
        // die Normale der Wand (lokal z) in der Welt, die Längs-Achse (lokal x)
        const nx = ob.s,
            nz = ob.c,
            lx = ob.c,
            lz = -ob.s;
        pm.set(ob.cx + nx * 10, pm.y, ob.cz + nz * 10);
        const c = tier({ x: ob.cx - nx * 8 + lx * 0.3, y: wo.y, z: ob.cz - nz * 8 + lz * 0.3 }, "wesen");
        ruhig(c);
        r.assignCreatureTask(c, "follow_player", {}, { silent: true });
        const geschoben = kontaktZaehler(restore);
        const leibVon = A.prototype._kreaturLeib;
        let drin = 0,
            kontaktFrames = 0,
            spielerWand = 0,
            vornMin = null,
            seiteVorher = null,
            querDurch = 0;
        // Die Parkour-Wand des Spielers trägt je Takt eine Marke (NaN): jeder Schreiber im Tier-Takt überschreibt sie — auch
        // derselbe Wert in derselben Millisekunde zählt. Danach kehrt der Zustand des Spielers zurück.
        const wandVorher = [s._wandKontaktAt, s._wandKontaktNx, s._wandKontaktNz];
        restore.push(() => {
            [s._wandKontaktAt, s._wandKontaktNx, s._wandKontaktNz] = wandVorher;
        });
        const N2 = 900;
        for (let k = 0; k < N2; k++) {
            s._wandKontaktAt = s._wandKontaktNx = s._wandKontaktNz = NaN;
            geschoben.clear();
            takt(1 / 60);
            if (!Number.isNaN(s._wandKontaktAt) || !Number.isNaN(s._wandKontaktNx) || !Number.isNaN(s._wandKontaktNz))
                spielerWand++;
            if (geschoben.size) kontaktFrames++;
            const p = c.position;
            const q = lokal(p.x, p.z);
            if (Math.abs(q.x) < ob.hx && Math.abs(q.z) < ob.hz) drin++;
            // quer durch die Wand: das Vorzeichen der Wand-Normale kippt, während die Achse innerhalb der Wand-Länge liegt
            const seite = Math.sign(q.z);
            if (seiteVorher !== null && seite !== 0 && seite !== seiteVorher && Math.abs(q.x) < ob.hx) querDurch++;
            if (seite !== 0) seiteVorher = seite;
            if (leibVon) {
                const lb = leibVon.call(r, c);
                const v = lokal(p.x + lb.fx * lb.halb, p.z + lb.fz * lb.halb);
                const ax = Math.max(Math.abs(v.x) - ob.hx, 0),
                    az = Math.max(Math.abs(v.z) - ob.hz, 0);
                const ab =
                    ax > 0 || az > 0 ? Math.hypot(ax, az) : -Math.min(ob.hx - Math.abs(v.x), ob.hz - Math.abs(v.z));
                if (vornMin === null || ab < vornMin) vornMin = ab;
            }
        }
        return {
            gierGrad: +grad(PHI).toFixed(1),
            kontaktFrames,
            wandFrames: drin,
            querDurch,
            spielerWand,
            vornMinM: vornMin === null ? null : +vornMin.toFixed(3),
        };
    });

    // ── nacht (Q11, Kritik §2.3): die Ruhe-Aktion hält den Leib an ──
    await buehne("nacht", async (restore) => {
        r.setGameMode("frieden");
        const altTod = s.timeOfDay;
        restore.push(() => {
            s.timeOfDay = altTod;
        });
        s.timeOfDay = 0; // Mitternacht: die Stimmung „nacht" wählt ruhen/yawn
        if (taeter === "nacht")
            decke(
                restore,
                "updateCreatures",
                (alt) =>
                    function (dt) {
                        alt.call(this, dt);
                        for (const c of this.state.creatures) {
                            const VA = c.userData._verhaltenAktion;
                            if (VA && VA.name === "ruhen") c.position.x += 0.02;
                        }
                    }
            );
        const o = land(25, 0);
        const arten = ["wesen", "wesen", "wesen", "wesen", "wolf", "wolf", "fuchs", "fuchs"];
        const tiere = arten.map((a, i) => {
            const c = tier({ x: o.x + (i % 4) * 4, y: o.y, z: o.z + Math.floor(i / 4) * 5 }, a);
            ruhig(c);
            return c;
        });
        const dt = 1 / 60;
        const vor = tiere.map((c) => ({ x: c.position.x, z: c.position.z }));
        // die Ruhe einer Aktion zählt in Takten seit ihrem Stempel (dieselbe Uhr wie der Spieler sie sieht — die Aktion
        // trug vor Welle L die Wand-Uhr, die Linse misst unabhängig davon)
        const gesehen = tiere.map(() => ({ va: null, k0: 0 }));
        let ruhFrames = 0,
            ruhBewegt = 0;
        for (let k = 0; k < 3600; k++) {
            takt(dt);
            tiere.forEach((c, i) => {
                const VA = c.userData._verhaltenAktion;
                const sp = Math.hypot(c.position.x - vor[i].x, c.position.z - vor[i].z) / dt;
                vor[i] = { x: c.position.x, z: c.position.z };
                // die Ruhe ab ihrer zweiten Sekunde (der Leib bremst mit der Brems-Grenze in den Stand)
                if (VA !== gesehen[i].va) gesehen[i] = { va: VA, k0: k };
                const alter = (k - gesehen[i].k0) * dt;
                if (VA && VA.name === "ruhen" && alter > 1 && alter < VA.def.dauer) {
                    ruhFrames++;
                    if (sp > 0.1) ruhBewegt++;
                }
            });
        }
        return { ruhFrames, ruhBewegt, bewegtAnteil: ruhFrames ? +(ruhBewegt / ruhFrames).toFixed(3) : null };
    });

    // ── reload (Q12): ein verwundetes Tier kehrt verwundet und mit seiner Gier zurück ──
    await buehne("reload", async (restore) => {
        const c = tier(land(30, 12), "wesen");
        const hpMax = c.userData.hpMax;
        c.userData.hp = 0.55 * hpMax;
        c.rotation.y = 1.0;
        if (c.userData._steuer) c.userData._steuer.gier = 1.0;
        if (taeter === "reload")
            decke(
                restore,
                "_serializeCreature",
                (alt) =>
                    function (cr) {
                        const o = alt.call(this, cr);
                        if (o) {
                            delete o.hp;
                            delete o.hpAnteil; // die Wunde reist als Anteil des Lebens (Welle LF kampf Nachbesserung 2)
                            delete o.gier;
                        }
                        return o;
                    }
            );
        const snap = r._serializeCreature(c);
        const hpVor = c.userData.hp;
        r.removeCreature(c);
        const c2 = r._restoreCreatureFromSnapshot(snap);
        if (!c2) return { fehler: "Restore" };
        return {
            hpVor: +hpVor.toFixed(2),
            hpNach: +c2.userData.hp.toFixed(2),
            gierFehlerGrad: +Math.abs(grad(wrap(c2.rotation.y - 1.0))).toFixed(1),
        };
    });

    // ── zufall (Q2, Lehre 7): kein Math.random im Kreatur-Leben ──
    // Gelesen wird der LEBENDE Code jeder Methode (r[name] — die Instanz vor dem Prototyp, was die Welt ruft) über
    // window.__codeOf (Kommentare gestrippt: sie zitieren den gefallenen Würfel). Die Klasse: jede Methode der Welt, deren
    // Name ein Tier trägt (creature · kreatur · fauna · tier), dazu die benannten Wurf-Stellen der Leben-Prüfung ohne
    // Tier im Namen. Eine benannte Methode, die fehlt, ist rot (die Liste veraltet nie still).
    await buehne("zufall", async (restore) => {
        const BENANNT = [
            "_spawnOneInitialCreature",
            "_creatureNaturalBirth",
            "_kreaturGeburtsOrt",
            "tickFaunaLifecycle",
            "_pickCreatureSoulName",
            "_pickCreatureName",
            "_affinityPickFromCandidates",
            "_pickFaunaSoulAtPlayer",
            "damageCreature",
            "updateCreatures",
            "updateCreatureEmotions",
            "_creatureSpeakProactive",
            "creatureDrawerInitDOM",
            "creatureJump",
            "_tickKreaturVerhalten",
            "_faunaRng",
        ];
        if (taeter === "zufall")
            decke(
                restore,
                "_pickCreatureName",
                (alt) =>
                    function (...a) {
                        return Math.random() < 2 ? alt.apply(this, a) : null;
                    }
            );
        if (typeof window.__fehlt !== "function")
            return { fehler: "window.__fehlt fehlt (der Absenz-Helfer der Linse)" };
        const namen = new Set(BENANNT);
        for (const n of Object.getOwnPropertyNames(A.prototype))
            if (/creature|kreatur|fauna|^_?tier|Tier/i.test(n) && typeof A.prototype[n] === "function") namen.add(n);
        const fehlt = [];
        const treffer = [];
        for (const n of namen) {
            const f = r[n];
            if (typeof f !== "function") fehlt.push(n);
            else if (!window.__fehlt(f, /Math\.random\s*\(/)) treffer.push(n);
        }
        return { methoden: namen.size, benannt: BENANNT.length, fehlt, treffer };
    });

    // ── peer (Q3): die Sicht-Kopie beim Mitspieler dreht und geht ──
    await buehne("peer", async (restore) => {
        const remote = s.p2p && s.p2p.remoteCreatures;
        if (!remote) return { fehler: "kein p2p-Zustand" };
        // Der Täter: die Kopie geht nicht (der alte Defekt — kein Gang je Sicht-Kopie). Er läuft am lebenden Chokepoint
        // (Q0, wie jeder andere Täter): der echte Takt zieht Lage und Gier nach, nur der Gang der Kopie ruht. Die alte
        // Methoden-Kopie samt harter Gier-Zeile trug einen gefallenen Namen in die Linse (Rückkehr-Wand, D12).
        if (taeter === "peer")
            decke(
                restore,
                "_p2pTickRemoteCreatures",
                (alt) =>
                    function (t, dt) {
                        const hatte = Object.prototype.hasOwnProperty.call(this, "_animateCompoundMotion");
                        const gang = this._animateCompoundMotion;
                        this._animateCompoundMotion = function () {};
                        try {
                            return alt.call(this, t, dt);
                        } finally {
                            if (hatte) this._animateCompoundMotion = gang;
                            else delete this._animateCompoundMotion;
                        }
                    }
            );
        // diesseits der Stufen-Grenze der Welt-Tiere (`ab` 35 m der Kern-Zeile kreatur): dort geht auch ein Welt-Tier
        const o = land(14, -16);
        const dt = 1 / 30;
        let x = o.x;
        restore.push(() => {
            for (const [key, rc] of remote) if (rc.peerId === "linse-peer") r._disposeRemoteCreature(key, rc);
        });
        for (let k = 0; k < 150; k++) {
            x += 1.5 * dt;
            r._p2pHandleCreaturePos("linse-peer", {
                list: [{ id: "c9001", x, y: o.y, z: o.z, yaw: Math.PI / 2, soul: "wesen" }],
            });
            r._p2pTickRemoteCreatures(100 + k * dt, dt);
        }
        const rc = remote.get("linse-peer:c9001");
        if (!rc) return { fehler: "keine Sicht-Kopie" };
        const tb = rc.mesh.userData && rc.mesh.userData._tierBaum;
        return {
            gierFehlerGrad: +Math.abs(grad(wrap(rc.mesh.rotation.y - Math.PI / 2))).toFixed(1),
            gangV: tb && tb._gang ? +(tb._gang.v || 0).toFixed(2) : 0,
        };
    });

    // ── nexus: kein Würfel schreibt ein Körper-Gesetz. Der Nexus würfelte dem Spieler Gehen
    // 4–12 und Sprungkraft 8–20 zu (gemessen 11,1 m/s, Sprint 45 m/s, Sprung 18,6 statt 2,6), blähte jedes Tier um ×1,11
    // ohne die bodySize-Achse auf, und `spawn_creature at_player` setzte Geburten in den Blick. Gemessen werden der Würfel
    // (ein fester Strom über den Kompositions-Pool), die Ops selbst (die Werte des Würfels, Quelle nexus: das Ergebnis liegt
    // im Gesetz-Band des Körpers, koerper fx.bewegung), die Größe (nur die bodySize-Achse in den Bändern VERHALTEN.groessen),
    // der Tempo-Hauch der Tiere (gelesen und im Band wandern.speedMulMin..Max) und die Nexus-Geburt (fern, nie im Blick) ──
    await buehne("nexus", async (restore) => {
        const KOERPER = ["player_speed", "player_jump_power", "creatures_speed_mul", "creatures_size_mul"];
        const eff = r.dslEffects;
        const ops0 = {};
        for (const k of KOERPER) ops0[k] = eff[k];
        restore.push(() => {
            for (const k of KOERPER) {
                if (ops0[k]) eff[k] = ops0[k];
                else delete eff[k];
            }
        });
        // Die alten Ops als Täter (der Stand vor dem Schnitt, wörtlich): ein absoluter Wert, eine Skala ohne Achse, ein
        // Tempo ohne Leser, die Geburt im Ring um den Ziel-Punkt.
        if (taeter === "nexus-gesetz") {
            const W = A.DSL_WERTE; // das Band hält dslEval — der Täter nimmt es mit
            A.DSL_WERTE = { ...W, player_jump_power: null, player_speed: null };
            restore.push(() => (A.DSL_WERTE = W));
            eff.player_jump_power = ([v]) => {
                s.jumpPower = r.dslClamp(v, 5, 40);
            };
            eff.player_speed = ([v]) => r._applyPlayerSpeed(r.dslClamp(v, 1, 30));
        }
        if (taeter === "nexus-groesse")
            eff.creatures_size_mul = ([f]) => {
                for (const cr of s.creatures) if (cr.scale) cr.scale.multiplyScalar(r.dslClamp(f, 0.5, 3));
            };
        if (taeter === "nexus-wuerfel")
            decke(
                restore,
                "dslComposeAtomic",
                (alt) =>
                    function (g) {
                        return g() < 0.1 ? ["player_jump_power", 18.56] : alt.call(this, g);
                    }
            );
        if (taeter === "nexus-geburt")
            decke(
                restore,
                "_kreaturGeburtsOrt",
                () =>
                    function () {
                        return { x: pm.x + 3, z: pm.z + 1 };
                    }
            );
        // (a) DER WÜRFEL: ein fester Strom (mulberry32) über den Kompositions-Pool des Nexus.
        let sd = 0x9e3779b9;
        const rng = () => {
            sd = (sd + 0x6d2b79f5) | 0;
            let t = Math.imul(sd ^ (sd >>> 15), 1 | sd);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const flach = (n, out) => {
            if (Array.isArray(n)) {
                if (typeof n[0] === "string") out.push(n[0]);
                for (const x of n) flach(x, out);
            }
            return out;
        };
        let wuerfe = 0,
            koerperWuerfe = 0;
        for (let k = 0; k < 4000; k++) {
            wuerfe++;
            if (flach(r.dslComposeAtomic(rng), []).some((o) => KOERPER.includes(o))) koerperWuerfe++;
        }
        // (b) DAS GESETZ-BAND des Körpers (koerper fx.bewegung: base + leicht + mag, die Tags in [0, 1]) × die Größe des
        // Leibs — dieselbe Pipeline, die die Stats rechnet (computePlayerStats): g = Stat / Rohwert der Tags.
        const altSp = s.speed,
            altSprint = s.sprintSpeed,
            altJ = s.jumpPower;
        restore.push(() => {
            s.speed = altSp;
            s.sprintSpeed = altSprint;
            s.jumpPower = altJ;
        });
        const cps = r.computePlayerStats();
        const band = (stat) => {
            const K = A._bewegungsKoeff(stat);
            const roh = A.STAT_FROM_TAGS[stat](cps.tags);
            const g = roh > 0 ? cps.stats[stat] / roh : 1;
            return { min: K.base * g, max: (K.base + K.leicht + K.mag) * g };
        };
        const bS = band("speed"),
            bJ = band("jumpPower");
        r.dslRun(["player_speed", 10.01], { source: "nexus" });
        r.dslRun(["player_jump_power", 18.56], { source: "nexus" });
        const speedNach = s.speed,
            sprintNach = s.sprintSpeed,
            sprungNach = s.jumpPower;
        // (c) DIE GRÖSSE nur über die bodySize-Achse, in den Bändern des Gesetzes.
        const GB = A._verhaltenGesetz().groessen;
        const bsMin = Math.min(...GB.map((z) => z.min)),
            bsMax = Math.max(...GB.map((z) => z.max));
        const o = land(40, -30);
        const tiere = [1, 0.7, 2.5, 1.2].map((bs, i) => tier({ x: o.x + i * 4, y: o.y, z: o.z }, "wesen", bs));
        r.dslRun(["creatures_size_mul", 1.11], { source: "nexus" });
        r.dslRun(["creatures_size_mul", 3], { source: "nexus" });
        let ohneAchse = 0,
            ausserBand = 0;
        for (const c of tiere) {
            const bs = c.userData.bodySize;
            if (Math.abs(c.scale.x - bs) > 1e-6) ohneAchse++;
            if (!(bs >= bsMin - 1e-9 && bs <= bsMax + 1e-9)) ausserBand++;
        }
        // (d) DER TEMPO-HAUCH der Tiere: gelesen (der Charakter ändert sich) und im Band des Wander-Gesetzes.
        const W = A._verhaltenGesetz().wandern;
        const c0 = tiere[0];
        const vor = r._creatureMoveCharacter(c0).speedMul;
        r.dslRun(["creatures_speed_mul", 0.7], { source: "emotion:peace" });
        const nach = r._creatureMoveCharacter(c0).speedMul;
        r.dslRun(["creatures_speed_mul", 5], { source: "nexus" });
        r.dslRun(["creatures_speed_mul", 5], { source: "nexus" });
        const hoch = r._creatureMoveCharacter(c0).speedMul;
        // (e) DIE NEXUS-GEBURT: fern und nie im Blick (dasselbe Gesetz wie die natürliche Geburt).
        for (const c of tiere) r.removeCreature(c);
        kamera(1, 0);
        const vorN = s.creatures.length;
        r.dslRun(["spawn_creature", ["at_player"], 4, "happy"], { source: "nexus" });
        const geboren = s.creatures.slice(vorN);
        let imBlickN = 0,
            minD = Infinity;
        for (const c of geboren) {
            if (imBlick(c.position.x, c.position.y + 0.5, c.position.z)) imBlickN++;
            minD = Math.min(minD, Math.hypot(c.position.x - pm.x, c.position.z - pm.z));
        }
        return {
            wuerfe,
            koerperWuerfe,
            speedBand: [+bS.min.toFixed(3), +bS.max.toFixed(3)],
            speedNach: +speedNach.toFixed(3),
            sprintNach: +sprintNach.toFixed(3),
            sprintSoll: +(speedNach * A._sprintMulGesetz()).toFixed(3),
            sprungBand: [+bJ.min.toFixed(3), +bJ.max.toFixed(3)],
            sprungNach: +sprungNach.toFixed(3),
            groessen: tiere.length,
            ohneAchse,
            ausserBand,
            tempoVor: +vor.toFixed(3),
            tempoNach: +nach.toFixed(3),
            tempoHoch: +hoch.toFixed(3),
            tempoBand: [W.speedMulMin, W.speedMulMax],
            geburten: geboren.length,
            geburtImBlick: imBlickN,
            geburtMinM: geboren.length ? +minD.toFixed(1) : null,
            fernMin: A.CREATURE_SPAWN_FAR_MIN,
        };
    });

    // ── temperament (D16 / K-D12): das Temperament aus der Gattungs- und Größen-Achse (Lehre 8: die
    // Tiere sind tag-gleich) — Hirsch und Fuchs blieben „wehrhaft" (aus den Tags), alle Hirsche Wariness −1,0 (neugierig),
    // die Herde drängte auf 0,6 m heran. Gemessen: das Temperament je Seele und Größe, die Wariness vor einem ruhigen
    // Spieler in frieden, was der Leib daraus macht (Fluchttier fort, Wehrhafter heran), und dass der Kampf dasselbe
    // Temperament liest (die Furcht-Dauer nach einem Treffer = furcht.fearSec × fleeMul des Temperaments) ──
    await buehne("temperament", async (restore) => {
        if (taeter === "temperament")
            decke(
                restore,
                "_creatureTemperament",
                () =>
                    function (c) {
                        return (c && c.userData && c.userData.soul) === "wolf" ? "wild" : "wehrhaft";
                    }
            );
        if (taeter === "temperament-masse")
            // der Zwilling der Vereinigung (Welle LF auf V18.533): das Gemüt aus der Dial-Masse size × Größe
            decke(
                restore,
                "_creatureTemperament",
                () =>
                    function (c) {
                        const ud = c.userData;
                        const d = this._ofenKreaturDials(this._kreaturGattung(c), ud.gussDials || null).dials;
                        const masse = d.size * (ud.bodySize || 1);
                        if (d.diet >= 0.75) return masse >= 2 ? "wild" : "scheu";
                        if (d.diet <= 0.25) return masse >= 5 ? "wehrhaft" : "scheu";
                        return masse >= 3 ? "wehrhaft" : "sanft";
                    }
            );
        r.setGameMode("frieden");
        if (s.player.emotions)
            Object.assign(s.player.emotions, { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0.9, chaos: 0 });
        const art = {};
        const kg = {}; // die EINE Masse des Leibs (`_leibMasse`), aus der das Temperament liest
        const o = land(30, 30);
        const probe = (seele, bs) => {
            const c = tier({ x: o.x, y: o.y, z: o.z }, seele, bs);
            const t = r._creatureTemperament(c);
            kg[seele + "@" + bs] = +r._leibMasse(c).toFixed(1);
            r.removeCreature(c);
            return t;
        };
        for (const [seele, bs] of [
            ["wesen", 1],
            ["wolf", 1],
            ["baer", 1],
            ["fuchs", 1],
            ["wesen", 2.5],
            ["wolf", 0.6],
            ["baer", 0.7],
        ])
            art[seele + "@" + bs] = probe(seele, bs);
        // DIE EINE MASSE (V18.536): Temperament und Beute lesen die Masse des Leibs, die auch der Stoß liest (`_leibMasse`,
        // Volumen der Gestalt × Dichte des Kerns) — nie eine zweite (die Dial-Masse size × Größe fiel mit der Vereinigung).
        // Beweis am Ruf: `_leibMasse` zählt, was das Gemüt eines frischen Leibs und das Beute-Urteil lesen.
        const leibRufe = (fn) => {
            const alt = r._leibMasse;
            let n = 0;
            r._leibMasse = function (...a) {
                n++;
                return alt.apply(this, a);
            };
            try {
                fn();
            } finally {
                delete r._leibMasse;
            }
            return n;
        };
        const wolfB = tier(land(36, 30), "wolf", 1);
        const hirschB = tier(land(36, 34), "wesen", 1);
        r._creatureTemperament(hirschB); // sein Gemüt steht: das Beute-Urteil zählt nur die eigenen Masse-Rufe
        const frisch = tier(land(30, 34), "wolf", 1);
        delete frisch.userData._temperament;
        const masseQuelle =
            leibRufe(() => r._creatureTemperament(frisch)) > 0 &&
            leibRufe(() => r._kreaturIstBeute(wolfB, hirschB)) >= 2 &&
            typeof r._kreaturMasse !== "function";
        const beute = {
            hirsch: r._kreaturIstBeute(wolfB, hirschB),
            kitz: r._kreaturIstBeute(wolfB, tier(land(36, 38), "wesen", 0.6)),
            baer: r._kreaturIstBeute(wolfB, tier(land(40, 30), "baer", 1)),
        };
        for (const c of s.creatures.slice()) r.removeCreature(c);
        // Die Wariness 6 m vor dem ruhigen Spieler und was der Leib daraus macht (600 Takte, frei).
        const start = land(0, 0);
        pm.set(start.x, start.y, start.z);
        const ring = (seele) =>
            [0, 1, 2, 3].map((k) => {
                const a = (k / 4) * Math.PI * 2 + 0.4;
                const c = tier(neben(pm.x + Math.cos(a) * 6, pm.z + Math.sin(a) * 6), seele, 1);
                ruhig(c);
                return c;
            });
        const dMit = (cs) =>
            cs.reduce((acc, c) => acc + Math.hypot(c.position.x - pm.x, c.position.z - pm.z), 0) / cs.length;
        const hirsche = ring("wesen");
        const wHirsch = r._creatureWariness(hirsche[0]);
        for (let k = 0; k < 600; k++) takt(1 / 60);
        const hirschM = dMit(hirsche);
        for (const c of hirsche) r.removeCreature(c);
        const baeren = ring("baer");
        const wBaer = r._creatureWariness(baeren[0]);
        for (let k = 0; k < 600; k++) takt(1 / 60);
        const baerM = dMit(baeren);
        for (const c of baeren) r.removeCreature(c);
        // Der Kampf liest dasselbe Temperament: die Furcht-Dauer eines getroffenen Wesens.
        const VG = A._verhaltenGesetz();
        const furcht = (seele) => {
            const c = tier(land(20, -20), seele, 1);
            c.userData.hp = 9999;
            const t0 = s.creatureAnimationTime; // die Kampf-Furcht auf der Kreatur-Uhr
            r.damageCreature(c, 1, { source: "linse" });
            const dauer = c.userData.fearUntil - t0;
            const soll = VG.furcht.fearSec * VG.temperament.profile[r._creatureTemperament(c)].fleeMul;
            r.removeCreature(c);
            return { dauer: +dauer.toFixed(2), soll: +soll.toFixed(2) };
        };
        return {
            art,
            kg,
            masseQuelle,
            beute,
            wHirsch: +wHirsch.toFixed(3),
            wBaer: +wBaer.toFixed(3),
            hirschAbstandM: +hirschM.toFixed(1),
            baerAbstandM: +baerM.toFixed(1),
            fleeThreshold: VG.furcht.fleeThreshold,
            curiousThreshold: VG.furcht.curiousThreshold,
            kampfHirsch: furcht("wesen"),
            kampfBaer: furcht("baer"),
        };
    });

    // ── abstand (D5/Neu 2): der persönliche Raum je Leib — die neugierige Schar am ruhigen Spieler im
    // Modus frieden kroch auf 0,7 m zusammen (Paar-Abstand 0,66–0,96 m), die Leiber durchdrangen sich und den Spieler. Der
    // Leib ist die EINE benannte Größe (_kreaturLeib: Achse längs der Gier ± halb, Radius); gemessen je Takt die Lücke
    // zwischen zwei Leibern (Kapsel gegen Kapsel in XZ) und zwischen Leib und Spieler-Kapsel (PLAYER_WALL_RADIUS), am Ende
    // der Abstand der Mitten gegen die Körper-Kugeln (halb + Radius) ──
    await buehne("abstand", async (restore) => {
        r.setGameMode("frieden");
        if (s.player.emotions)
            Object.assign(s.player.emotions, { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0.9, chaos: 0 });
        if (taeter === "abstand") {
            // der alte Defekt: der Zug der Herde je Glied ab 1 m als Summe (der Körper zählt nicht), keine Kontakt-Lösung
            const K = A._steuerGesetz();
            const alt = K.verbandZug;
            K.verbandZug = function (x, z, vx, vz, tempo, raum, glieder) {
                const o = { x: vx, z: vz, n: 0 };
                for (const nb of glieder) {
                    const d = Math.hypot(nb.x - x, nb.z - z);
                    if (o.n >= 6 || !(d > 1 && d < 5)) continue;
                    o.x += ((nb.x - x) / d) * 0.5 * tempo;
                    o.z += ((nb.z - z) / d) * 0.5 * tempo;
                    o.n++;
                }
                return o;
            };
            restore.push(() => (K.verbandZug = alt));
            decke(restore, "_leibKontakte", () => function () {});
        }
        if (taeter === "abstand-spieler")
            // die Separation ohne den Spieler (V18.536): nur die Schar stößt, ein Nachbar drückt das vordere Tier in ihn
            decke(
                restore,
                "_applyCreatureSeparation",
                (alt) =>
                    function (...a) {
                        const p = this.state.playerMesh;
                        this.state.playerMesh = null;
                        try {
                            return alt.apply(this, a);
                        } finally {
                            this.state.playerMesh = p;
                        }
                    }
            );
        // im Freien (keine Hülle im Umkreis): die Wand eines Baus hat das letzte Wort und schöbe einen Leib in den nächsten
        const start = frei(40, -40, 20) || land(40, -40);
        pm.set(start.x, start.y, start.z);
        const tiere = [];
        // sechs Bären und zwei Wölfe im Ring; die Verbände (S6): zwei Bärinnen und ihr Junges (0,6) GEGENÜBER, der Spieler
        // zwischen ihnen — der Verband zieht sie über ihn hinweg zusammen, sein Raum muss halten; die Wölfe ein Rudel
        for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2 + 0.2;
            const d = k < 6 ? 7 : 9;
            const c = tier(
                { x: pm.x + Math.cos(a) * d, y: pm.y, z: pm.z + Math.sin(a) * d },
                k < 6 ? "baer" : "wolf",
                k === 4 || k === 5 ? 0.6 : 1
            );
            ruhig(c);
            tiere.push(c);
        }
        for (const v of [
            [0, 4],
            [1, 5],
            [6, 7],
        ])
            r._kreaturVerbinden(v.map((i) => tiere[i]));
        const leibVon = A.prototype._kreaturLeib;
        const seg = (c) => {
            const lb = leibVon.call(r, c, undefined, {});
            return {
                ax: c.position.x - lb.fx * lb.halb,
                az: c.position.z - lb.fz * lb.halb,
                bx: c.position.x + lb.fx * lb.halb,
                bz: c.position.z + lb.fz * lb.halb,
                r: lb.radius,
                halb: lb.halb,
                kugel: lb.halb + lb.radius,
            };
        };
        // Abstand zweier Strecken in XZ (die Kapsel-Achsen)
        const pS = (px, pz, s0) => {
            const vx = s0.bx - s0.ax,
                vz = s0.bz - s0.az;
            const l2 = vx * vx + vz * vz;
            const t = l2 > 0 ? Math.max(0, Math.min(1, ((px - s0.ax) * vx + (pz - s0.az) * vz) / l2)) : 0;
            return Math.hypot(px - (s0.ax + vx * t), pz - (s0.az + vz * t));
        };
        const sS = (a, b) => {
            // Kreuzung?
            const cr = (ox, oz, ux, uz, wx, wz) => ux * (wz - oz) - uz * (wx - ox);
            const d1 = cr(a.ax, a.az, a.bx - a.ax, a.bz - a.az, b.ax, b.az),
                d2 = cr(a.ax, a.az, a.bx - a.ax, a.bz - a.az, b.bx, b.bz),
                d3 = cr(b.ax, b.az, b.bx - b.ax, b.bz - b.az, a.ax, a.az),
                d4 = cr(b.ax, b.az, b.bx - b.ax, b.bz - b.az, a.bx, a.bz);
            if (d1 * d2 < 0 && d3 * d4 < 0) return 0;
            return Math.min(pS(a.ax, a.az, b), pS(a.bx, a.bz, b), pS(b.ax, b.az, a), pS(b.bx, b.bz, a));
        };
        const RP = A.PLAYER_WALL_RADIUS;
        // DER LÖSER LEBT IM SIM-SCHRITT (`_leibKontakte`), der Frame zeigt den Steuer-Schritt danach: eine Lücke zweier Leiber
        // unter null darf nur so tief sein, wie beide in DIESEM Frame liefen und wendeten (der Weg der Mitte + die Wende an
        // der Achsen-Spitze, |Δgier| · halb) — tiefer ERBTE sie eine Durchdringung, die der Sim-Schritt nicht löste. Den
        // Spieler meidet schon der Schritt (die Separation hält seinen Raum): dort zählt jede Lücke unter −2 cm.
        const vorher = tiere.map(() => ({ x: 0, z: 0, g: 0 }));
        const schritt = tiere.map(() => 0);
        let minLeib = Infinity,
            minSpieler = Infinity,
            erbeMax = 0,
            ueberFrames = 0,
            durchFrames = 0,
            spielerFrames = 0;
        const nnRaum = []; // je Tier und Takt (die zweite Hälfte): der nächste Nachbar in Körper-Kugeln
        const N = 900;
        for (let k = 0; k < N; k++) {
            tiere.forEach((c, i) => {
                vorher[i].x = c.position.x;
                vorher[i].z = c.position.z;
                vorher[i].g = c.rotation.y;
            });
            takt(1 / 60);
            if (k < 30) continue;
            const S = tiere.map(seg);
            tiere.forEach((c, i) => {
                schritt[i] =
                    Math.hypot(c.position.x - vorher[i].x, c.position.z - vorher[i].z) +
                    Math.abs(wrap(c.rotation.y - vorher[i].g)) * S[i].halb;
            });
            if (k >= N / 2)
                for (let i = 0; i < tiere.length; i++) {
                    let m = Infinity;
                    for (let j = 0; j < tiere.length; j++)
                        if (j !== i)
                            m = Math.min(
                                m,
                                Math.hypot(
                                    tiere[i].position.x - tiere[j].position.x,
                                    tiere[i].position.z - tiere[j].position.z
                                ) /
                                    (S[i].kugel + S[j].kugel)
                            );
                    nnRaum.push(m);
                }
            let durch = false,
                imSp = false,
                ueber = false;
            for (let i = 0; i < S.length; i++) {
                const gs = pS(pm.x, pm.z, S[i]) - S[i].r - RP;
                if (gs < minSpieler) minSpieler = gs;
                if (gs < -0.02) imSp = true;
                for (let j = i + 1; j < S.length; j++) {
                    const g = sS(S[i], S[j]) - S[i].r - S[j].r;
                    if (g < minLeib) minLeib = g;
                    if (g < -0.02) ueber = true;
                    const erbe = -g - schritt[i] - schritt[j];
                    if (g < -0.02 && erbe > 0.002) durch = true;
                    if (g < 0) erbeMax = Math.max(erbeMax, erbe);
                }
            }
            if (durch) durchFrames++;
            if (imSp) spielerFrames++;
            if (ueber) ueberFrames++;
        }
        // am Ende die zwei nächsten Mitten der Schar (der Satz „kein persönlicher Raum“ nennt sie)
        const paar = tiere.flatMap((a, i) => tiere.slice(i + 1).map((b) => a.position.distanceTo(b.position)));
        return {
            tiere: tiere.length,
            minLeibLueckeM: +minLeib.toFixed(3),
            durchFrames,
            minSpielerLueckeM: +minSpieler.toFixed(3),
            spielerFrames,
            // die Tiefe zweier Leiber über ihrem Frame-Schritt (geerbt) und die Takte mit einer Lücke unter −2 cm (auch frisch)
            erbeMaxM: +erbeMax.toFixed(3),
            ueberFrames,
            paarMinM: +Math.min(...paar).toFixed(2),
            nachbarRaumP10: +quantil(nnRaum, 0.1).toFixed(3),
            nachbarRaumP50: +quantil(nnRaum, 0.5).toFixed(3),
        };
    });

    // ── jagdkreis (Kampf Neu 3 / D6): der Kreislauf Jäger–Beute schließt sich. Der Witterungs-Jäger
    // stand still (ein Wolf 1200 Takte „jagd", 0,3 m bewegt, 0 Bisse in 3600 Takten) und holte keinen Sprinter ein (der
    // Abstand wuchs von 3,9 auf 34,6 m). Zwei Bühnen am ECHTEN Takt: (A) der Riss (unten); (B) der Sprinter — der Spieler sprintet (state.sprintSpeed) geradeaus, der Wolf
    // startet 6 m hinter ihm: der Abstand schrumpft, ein Biss trifft ──
    await buehne("jagdkreis", async (restore) => {
        r.setGameMode("pfad");
        // ein ruhiger Spieler, je Takt (ein zorniger verschreckt den Wolf — seine Wariness schlägt die Jagd; die Ansteckung
        // der Gefühle im Kreatur-Takt trägt die Furcht der Beute zu ihm)
        const ruhigSpieler = () => {
            if (s.player.emotions)
                Object.assign(s.player.emotions, { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 });
        };
        ruhigSpieler();
        // Die alten Wege als Täter: der Gradient des Geruchs-Felds (vier Proben, die vor dem Schnitt die Richtung gaben)
        // und der Jagd-Weg im Schritt-Tempo geradewegs auf das Ziel (kein Platz im Rudel, keine Hetze).
        if (taeter === "jagd-gradient")
            decke(
                restore,
                "_creatureScentHuntDir",
                (alt) =>
                    function (c, w) {
                        const d0 = alt.call(this, c, w);
                        if (!d0) return null;
                        const beute = c.userData._beute;
                        const S = A.SCENT;
                        const q = [{ x: beute.position.x, z: beute.position.z, strength: 1 }];
                        const cx = c.position.x,
                            cz = c.position.z;
                        const gx = (this._scentAt(cx + 4, cz, q, {}) - this._scentAt(cx - 4, cz, q, {})) / 2;
                        const gz = (this._scentAt(cx, cz + 4, q, {}) - this._scentAt(cx, cz - 4, q, {})) / 2;
                        const g = Math.hypot(gx, gz);
                        if (!(g > 0.02 * (S ? 1 : 1))) return null;
                        d0.set(gx / g, 0, gz / g);
                        // der Gradient führt — das Ziel ist der Punkt, auf den er zeigt
                        c.userData._beute = {
                            position: { x: cx + (gx / g) * 10, z: cz + (gz / g) * 10 },
                            rotation: { y: 0 },
                            userData: { netId: "gradient", _motionZustand: null },
                        };
                        return d0;
                    }
            );
        const schrittJagd = () =>
            decke(
                restore,
                "_kreaturJagdZug",
                () =>
                    function (c, tx, tz, key, direction, speed) {
                        c.userData._jagdZiel = key;
                        this._kreaturZustandStempel(c, "jagd");
                        const dx = tx - c.position.x,
                            dz = tz - c.position.z;
                        const J = A._verhaltenGesetz().jagd;
                        // der alte Pirsch-Stopp (1,6 m um die Mitten — jagd.pirschStoppM fiel mit dem Biss im Ansprung)
                        this._kreaturZiel(direction, dx, dz, Math.hypot(dx, dz) - 1.6, speed * J.speedBoost);
                    }
            );
        if (taeter === "jagd-schritt") schrittJagd();
        // der Fall ohne Kadaver (der Leib liegt und sinkt, kein Fleisch) und die Nase ohne Aas-Witterung als Täter
        if (taeter === "jagd-aas")
            decke(
                restore,
                "_kreaturFaellt",
                (alt) =>
                    function (c) {
                        const out = alt.call(this, c);
                        delete c.userData.kadaver;
                        return out;
                    }
            );
        if (taeter === "jagd-duft") decke(restore, "_kreaturAasZug", () => () => false);
        const dt = 1 / 60;
        // (A) DER RISS SCHLIESST DEN KREISLAUF (Meisterkarte Tiere H3): drei Wölfe gegen einen GESUNDEN Hirsch (Tiere K2: ~20
        // Bisse, jeder jagt ihn in die Flucht) an zehn Orten (die Mitte, ein Ring von 70 m) — die Riss-Quote. Der erste Riss
        // trägt die Kette: der Leib wird Kadaver (Fleisch in kg), Fressen verbraucht ihn, sein Geruch (`_scentAt`) ruft Fuchs
        // und Bär, 35 m fern beim Riss. Der Spieler steht 150 m fern (nah jagte das Rudel IHN, jagd.radius).
        const R = { fensterS: 600, zeiten: [], rissS: null, fleisch0: null, fleischEnde: null, gaeste: [] };
        for (let ort = 0; ort < 10; ort++) {
            const w = (2 * Math.PI * (ort - 1)) / 9,
                rO = ort ? 70 : 0;
            s.creatureAnimationTime = 100;
            r._creatureAiFrame = 0;
            const o4 = frei(-60 + Math.cos(w) * rO, 40 + Math.sin(w) * rO, 25) || land(-60, 40);
            pm.set(o4.x + 150, pm.y, o4.z + 20);
            const beute = tier({ x: o4.x, y: o4.y, z: o4.z }, "wesen", 1);
            ruhig(beute);
            if (taeter === "jagd-hp") beute.userData.hp *= 0.1; // der alte Schleichweg: die verwundete Beute
            R.hp0 = Math.round(beute.userData.hp);
            for (let i = 0; i < 3; i++)
                ruhig(
                    tier(
                        { x: o4.x - Math.cos(i * 0.6 - 0.6) * 20, y: o4.y, z: o4.z + Math.sin(i * 0.6 - 0.6) * 20 },
                        "wolf"
                    )
                );
            r._kreaturVerbinden(s.creatures.filter((c) => c !== beute));
            const kette = R.rissS === null;
            const zuK = (c) => Math.hypot(c.position.x - beute.position.x, c.position.z - beute.position.z);
            R.zeiten.push(null);
            for (let k = 0, ende = R.fensterS * 60; k < ende; k++) {
                ruhigSpieler();
                takt(dt);
                if (R.zeiten[ort] === null && s.leichname.includes(beute)) {
                    R.zeiten[ort] = +(k * dt).toFixed(1);
                    if (!kette) break;
                    R.rissS = R.zeiten[ort];
                    R.fleisch0 = beute.userData.kadaver ? +beute.userData.kadaver.fleisch.toFixed(1) : null;
                    for (const [seele, dz] of [
                        ["fuchs", 18],
                        ["baer", -18],
                    ]) {
                        const g = tier(land(beute.position.x - 30 - P0.x, beute.position.z + dz - P0.z), seele);
                        ruhig(g);
                        R.gaeste.push({ seele, c: g, d0: +zuK(g).toFixed(1), dMin: Infinity, frissS: 0 });
                    }
                    ende = k + 7200;
                }
                for (const G of kette ? R.gaeste : []) {
                    G.dMin = Math.min(G.dMin, +zuK(G.c).toFixed(1));
                    if (G.c.userData._motionZustand === "fressen") G.frissS = +(G.frissS + dt).toFixed(3);
                }
            }
            if (kette && beute.userData.kadaver) R.fleischEnde = +beute.userData.kadaver.fleisch.toFixed(1);
            for (const G of R.gaeste) delete G.c;
            for (const c of [...s.creatures, ...s.leichname]) r.removeCreature(c);
        }
        // (B) der Sprinter: der Spieler läuft im Sprint geradeaus, der Wolf jagt ihn — auf einer freien Bahn aus der Welt
        // (die Länge seines Laufs, der Wolf 6 m dahinter); keine freie Bahn ist ein Fehler, kein Ersatz-Ort
        const sprint = s.sprintSpeed;
        const o2 = freieBahn(-50, 60, sprint * 600 * dt + 4, 8);
        if (!o2) throw new Error("keine freie Bahn für den Sprinter (Land, eben, ohne Hülle)");
        pm.set(o2.x, o2.y, o2.z);
        const wolf2 = tier({ x: o2.x - 6, y: o2.y, z: o2.z }, "wolf", 1);
        ruhig(wolf2);
        const altHp = s.player.hp,
            altGnade = s.player.respawnGraceUntil;
        restore.push(() => {
            s.player.hp = altHp;
            s.player.respawnGraceUntil = altGnade;
        });
        s.player.hp = 1e9;
        // gezählt wird der Biss, der den Spieler trifft (das Maul am Leib, Welle LF kampf) — nicht der Ansprung
        let spielerBisse = 0;
        decke(
            restore,
            "damagePlayer",
            (alt) =>
                function (amount, quelle) {
                    if (quelle === "jagd") spielerBisse++;
                    return alt.call(this, amount, quelle);
                }
        );
        const abst0 = Math.hypot(wolf2.position.x - pm.x, wolf2.position.z - pm.z);
        let abstMin = abst0;
        for (let k = 0; k < 600; k++) {
            pm.x += sprint * dt;
            // die Füße des Läufers bleiben auf dem Boden (die Probe trägt ihn ohne Physik; der Biss braucht den Kopf am
            // Leib, auch in der Höhe — Welle LF kampf)
            const hS = r.getTerrainHeightAt(pm.x, pm.z);
            if (Number.isFinite(hS)) pm.y = hS + 0.5;
            ruhigSpieler();
            takt(dt);
            abstMin = Math.min(abstMin, Math.hypot(wolf2.position.x - pm.x, wolf2.position.z - pm.z));
        }

        const abst1 = Math.hypot(wolf2.position.x - pm.x, wolf2.position.z - pm.z);
        return {
            riss: R,
            sprinter: {
                sprintMs: +sprint.toFixed(2),
                abstand0: +abst0.toFixed(1),
                abstandEnde: +abst1.toFixed(1),
                abstandMin: +abstMin.toFixed(1),
                bisse: spielerBisse,
                wolfSprintMs: +A._steuerGesetz().sprintTempo(r._kreaturHueftL(wolf2)).toFixed(2),
                bahn: [Math.round(o2.x), Math.round(o2.z)],
            },
        };
    });

    // ── rudel (Leben-Schau 07.10., Kampf: „Rudel gegen Spieler"): ein Rudel umstellt. Drei Wölfe, die von einer Seite
    // kamen, standen alle in einem Sektor von 72° (größte Lücke im Median 288°, Kampf-Schau). Gemessen am
    // echten Takt: drei Wölfe in 15 m auf einer Seite des stehenden Spielers (Modus pfad); in jedem Takt, in dem alle drei
    // näher als 2 × jagd.hetzM stehen, die größte Winkel-Lücke ihrer Richtungen um den Spieler, dazu die Lücke beim ersten
    // Biss ──
    await buehne("rudel", async (restore) => {
        r.setGameMode("pfad");
        const ruhigSpieler = () => {
            if (s.player.emotions)
                Object.assign(s.player.emotions, { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 });
        };
        if (taeter === "rudel")
            decke(
                restore,
                "_kreaturJagdZug",
                () =>
                    function (c, tx, tz, key, direction, speed) {
                        c.userData._jagdZiel = key;
                        this._kreaturZustandStempel(c, "jagd");
                        const dx = tx - c.position.x,
                            dz = tz - c.position.z;
                        const J = A._verhaltenGesetz().jagd;
                        // der alte Pirsch-Stopp (1,6 m um die Mitten — jagd.pirschStoppM fiel mit dem Biss im Ansprung)
                        this._kreaturZiel(direction, dx, dz, Math.hypot(dx, dz) - 1.6, speed * J.speedBoost);
                    }
            );
        const o = frei(60, -60, 25) || land(60, -60);
        pm.set(o.x, o.y, o.z);
        const altHp = s.player.hp,
            altGnade = s.player.respawnGraceUntil;
        restore.push(() => {
            s.player.hp = altHp;
            s.player.respawnGraceUntil = altGnade;
        });
        s.player.hp = 1e9;
        const woelfe = [-0.25, 0, 0.25].map((a) => {
            const c = tier(neben(pm.x + Math.sin(a) * 11, pm.z + Math.cos(a) * 11), "wolf", 1);
            ruhig(c);
            return c;
        });
        r._kreaturVerbinden(woelfe); // das Rudel ist EIN Verband (S6) — wie aus dem Wurf
        // die Lücke beim ersten Biss, der den Spieler trifft (das Maul am Leib, Welle LF kampf)
        let ersterBiss = null;
        decke(
            restore,
            "damagePlayer",
            (alt) =>
                function (amount, quelle) {
                    if (quelle === "jagd" && ersterBiss === null) ersterBiss = luecke();
                    return alt.call(this, amount, quelle);
                }
        );
        const luecke = () => {
            const w = woelfe.map((c) => Math.atan2(c.position.x - pm.x, c.position.z - pm.z)).sort((a, b) => a - b);
            let g = 0;
            for (let i = 0; i < w.length; i++) {
                const n = i + 1 < w.length ? w[i + 1] : w[0] + Math.PI * 2;
                g = Math.max(g, n - w[i]);
            }
            return grad(g);
        };
        const J = A._verhaltenGesetz().jagd;
        const luecken = [];
        for (let k = 0; k < 1500; k++) {
            ruhigSpieler();
            takt(1 / 60);
            if (woelfe.every((c) => Math.hypot(c.position.x - pm.x, c.position.z - pm.z) < 2 * J.hetzM))
                luecken.push(luecke());
        }
        return {
            nahTakte: luecken.length,
            lueckeP50: luecken.length ? +quantil(luecken, 0.5).toFixed(0) : null,
            lueckeBeimBiss: ersterBiss === null ? null : +ersterBiss.toFixed(0),
        };
    });

    // ── sockel (D7/Neu 4): das Tier steht auf der Auflage der Bauten wie der Spieler. 5 Hirsche folgten
    // durchs Dorf, 7,6 % ihrer Takte lagen in einer Hüllen-Box, p50 73 cm tief; ein Hirsch stand 0,35 m tief im Sockel, auf
    // dem der Spieler stand (Bild ls-09) — das Tier las nur den Boden (_standSicht ohne Struktur). Gemessen am echten Takt:
    // ein Sockel aus Stein, seine Oberkante 0,35 m über dem Boden seiner Mitte (wie der Sockel des Hauses), ein Hirsch steht
    // auf ihm und folgt dem Spieler, der auf dem Sockel hin und her geht; je Takt, wie tief die Sohle unter der Oberkante
    // liegt ──
    await buehne("sockel", async (restore) => {
        r.setGameMode("frieden");
        if (taeter === "sockel") decke(restore, "_kreaturAuflage", () => () => -Infinity);
        // der Sockel 4 × 4 m an einem Ort ohne Bau im Umkreis, seine Oberkante 0,35 m über dem Boden seiner Mitte, nach unten
        // tief genug für jede Mulde. Gezählt wird nur, wo er eine STUFE ist (Oberkante 5 cm bis PLAYER_STEP_UP über dem
        // Boden unter dem Hirsch): dort trägt er den Spieler — und das Tier.
        const wo = frei(-40, -60, 6) || land(-40, -60);
        wo.y = r.getTerrainHeightAt(wo.x, wo.z);
        const hs = [-2, 0, 2].flatMap((dx) => [-2, 0, 2].map((dz) => r.getTerrainHeightAt(wo.x + dx, wo.z + dz)));
        const unten = Math.min(...hs) - 0.3 - wo.y;
        const oben = 0.35;
        // Der Sockel ist die HÜLLE eines Hauses (wie im Dorf: die gedrehte Box der Studio-Stufe, _hausHuelleSetzen) — ein
        // Bauplan-Teil würde den Boden unter sich einebnen (der Fußabdruck des Baus), die Haus-Hülle tut es nicht. Der Bau
        // selbst ist ein Kiesel in der Mitte. spawnArchitecture legt die Basis 0,5 m unter den Ort (die at_player-Eichung).
        s.blueprints._t_linse_sockel = {
            name: "_t_linse_sockel",
            parts: [
                {
                    shape: "box",
                    material: "stein",
                    position: { x: 0, y: 0.05, z: 0 },
                    size: { x: 0.1, y: 0.1, z: 0.1 },
                },
            ],
        };
        const e = r.spawnArchitecture("_t_linse_sockel", { x: wo.x, y: wo.y + 0.5, z: wo.z }, { silent: true });
        restore.push(() => {
            if (e) r.removeArchitecture(e);
            delete s.blueprints._t_linse_sockel;
        });
        if (!e) return { fehler: "Sockel nicht gesetzt" };
        // die EINE Hüllen-Form (N5, S3 haus): der Sockel als Kasten c ± h, rolle "fest" — 4 × 4 m, von `unten` bis `oben`
        r._hausHuelleSetzen(e, {
            stufe: 0,
            teile: [{ art: "box", c: [0, (unten + oben) / 2, 0], h: [2, (oben - unten) / 2, 2], rolle: "fest" }],
        });
        if (!Array.isArray(e.blockerAABBs) || !e.blockerAABBs.length) return { fehler: "Sockel ohne Hülle" };
        const box = e.blockerAABBs[0];
        const mx = (box.minX + box.maxX) / 2,
            mz = (box.minZ + box.maxZ) / 2;
        // die Kreatur-Uhr fest (die Aktions-Wahl hasht sie): jeder Lauf sieht dieselben Schritte, gleich welche Probe vorher lief
        pm.set(mx, box.topY + 0.5, mz + 1.6);
        // der Hirsch auf der Mitte des Sockels: erst wartet er dort (die Mitte ist eine Stufe von 0,35 m), dann folgt er dem
        // Spieler, der auf dem Sockel hin und her geht
        const c = tier({ x: mx, y: wo.y, z: mz }, "wesen", 1);
        ruhig(c);
        r.assignCreatureTask(c, "wait", {}, { silent: true });
        let ueber = 0,
            imSockel = 0,
            tiefMax = 0;
        const dt = 1 / 60;
        for (let k = 0; k < 900; k++) {
            if (k === 300) r.assignCreatureTask(c, "follow_player", {}, { silent: true });
            if (k >= 300) pm.z = mz + 1.6 * Math.cos((k - 300) / 120);
            takt(dt);
            if (k < 30) continue;
            const stufe = box.topY - r.getTerrainHeightAt(c.position.x, c.position.z);
            if (r._boxAbstand2(box, c.position.x, c.position.z) === 0 && stufe > 0.05 && stufe < A.PLAYER_STEP_UP) {
                ueber++;
                const tief = box.topY - c.position.y;
                if (tief > 0.05) {
                    imSockel++;
                    tiefMax = Math.max(tiefMax, tief);
                }
            }
        }
        return {
            ueberTakte: ueber,
            imSockelTakte: imSockel,
            tiefMaxM: +tiefMax.toFixed(3),
            oberkanteUeberBodenM: +(box.topY - wo.y).toFixed(2),
        };
    });

    // ── querhang (D11/D1-Rest): die Beine stehen lotrecht, der Leib rollt — am Querhang standen die
    // Beine 20–31° aus dem Lot (sie kippten mit dem Leib, Bild ls-10), der Stand-Schlupf im Lauf lag bei 0,56–1,27 (Soll
    // ≤ 0,2). Gemessen am echten Takt wie in der Leben-Schau: ein Hang von 20–30° nahe dem Spieler; Wolf und Hirsch stehen
    // QUER zur Fall-Linie (warten, 120 Takte): je Bein der Winkel Hüfte → Pfote gegen das Lot und die Sohle über dem Boden
    // unter ihr; dann folgen beide dem Spieler, der längs der Höhenlinie geht (600 Takte): der Stand-Schlupf — eine Pfote,
    // deren Sohle höchstens 3 cm über dem Boden unter ihr liegt, steht; ihr Weg in solchen Takten je Weg des Leibs ──
    await buehne("querhang", async (restore) => {
        r.setGameMode("frieden");
        if (taeter === "querhang")
            decke(
                restore,
                "_animateTierBaum",
                (alt) =>
                    function (group, ...a) {
                        const o = alt.call(this, group, ...a);
                        const Tt =
                            group && group.userData && group.userData._tierBaum && group.userData._tierBaum.teile;
                        if (Tt) for (const k of [Tt.legFL, Tt.legFR, Tt.legHL, Tt.legHR]) if (k) k.rotation.z = 0;
                        return o;
                    }
            );
        if (taeter === "querhang-gleiten") {
            // der Täter: der Fuß im Stand hat keinen Halt am Aufsetz-Punkt — die Pfoten-Haltung wird je Takt vergessen,
            // jeder Takt greift die Pfote dort, wohin der Leib sie mitnahm (der Fuß wandert mit dem Leib)
            decke(
                restore,
                "_animateTierBaum",
                (alt) =>
                    function (group, ...a) {
                        const gg =
                            group && group.userData && group.userData._tierBaum && group.userData._tierBaum._gang;
                        if (gg && gg.fuss)
                            gg.fuss.forEach((L, j) => {
                                if (((gg.ph[j] % TAU) + TAU) % TAU >= Math.PI) L.an = false;
                            });
                        return alt.call(this, group, ...a);
                    }
            );
        }
        const h = (x, z) => r.getTerrainHeightAt(x, z);
        // der Hang an (x, z): seine Neigung im Band [lo, hi] über 6 m eben (die Fall-Linie trägt die Neigung, quer kaum
        // Krümmung), kein Bau und kein Wasser in der Gasse des Laufs — sonst der Grund, der ihn verwirft
        const hangAn = (x, z, lo, hi) => {
            if (!r._landAt(x, z)) return { grund: "kein Land" };
            const gx = (h(x + 1.5, z) - h(x - 1.5, z)) / 3,
                gz = (h(x, z + 1.5) - h(x, z - 1.5)) / 3;
            const g = Math.hypot(gx, gz);
            const grad0 = (Math.atan(g) * 180) / Math.PI;
            if (!(grad0 >= lo && grad0 <= hi)) return { grund: `Neigung ${grad0.toFixed(1)}° außerhalb ${lo}–${hi}°` };
            const ux = gx / g,
                uz = gz / g; // bergauf
            for (const t of [-3, -1.5, 1.5, 3])
                for (const o of [-3, 3]) {
                    const px = x + ux * t - uz * o,
                        pz = z + uz * t + ux * o;
                    if (Math.abs(h(px, pz) - (h(x, z) + g * t)) > 0.5) return { grund: "nicht eben über 6 m" };
                }
            // die Gasse des Laufs: längs der Höhenlinie −4 … +10 m (Stand ±1,6 m, der Spieler geht 7 m und zurück, die
            // Folger hinter ihm), quer von 2 m talab bis 6 m bergauf (der Spieler geht 4 m über dem Hang-Punkt)
            for (let l = -4; l <= 10; l += 1.5)
                for (let o = -2; o <= 6; o += 2) {
                    const px = x - uz * l + ux * o,
                        pz = z + ux * l + uz * o;
                    if (!r._landAt(px, pz) || huelleNah(px, pz, h(px, pz), 1.5))
                        return { grund: `die Gasse ist nicht frei (${px.toFixed(1)}|${pz.toFixed(1)})` };
                }
            return { hang: { x, z, ux, uz, grad: grad0 } };
        };
        // DER ORT (K16-Q): in der Welt der erste Hang von 20–30° nahe dem Spieler — welcher, entscheidet die Welt (im
        // K16-Gelände fand die CI 22,2°, lokal fand dieselbe Suche je nach Bestand 22,2° oder 25,5°); auf der Prüfbühne die
        // feste Rampe ihrer Station (`opts.hangOrt`, spec/pruefbuehne/stationen.json): ihre Neigung ≤ 1° an der Spec, sonst
        // trägt die Bühne nicht, was die Probe misst — ein Fehler, nie ein Ausweichen auf einen anderen Hang
        const ort = (opts && opts.hangOrt) || null;
        let hang = null;
        if (ort) {
            const a = hangAn(ort.x, ort.z, ort.winkel - 1, ort.winkel + 1);
            if (!a.hang) return { fehler: `die Rampe ${ort.id} (${ort.winkel}°) trägt den Querhang nicht: ${a.grund}` };
            hang = a.hang;
        }
        for (let ring = 1; ring < 70 && !hang; ring++) {
            const n = ring * 8;
            for (let q = 0; q < n && !hang; q++) {
                const a = (q / n) * Math.PI * 2;
                hang = hangAn(P0.x + Math.cos(a) * ring * 5, P0.z + Math.sin(a) * ring * 5, 20, 30).hang || null;
            }
        }
        if (!hang) return { fehler: "kein Hang von 20–30° ohne Bau nahe dem Spieler" };
        // quer: die Gier längs der Höhenlinie (senkrecht zur Fall-Linie)
        const gierQuer = Math.atan2(-hang.uz, hang.ux);
        const stelle = (seele, o) => {
            const x = hang.x - hang.uz * o,
                z = hang.z + hang.ux * o;
            const c = tier({ x, y: h(x, z) + 0.3, z }, seele, 1);
            ruhig(c);
            c.rotation.y = gierQuer;
            if (c.userData._steuer) c.userData._steuer.gier = gierQuer;
            else c.userData._steuer = { gier: gierQuer, v: 0 };
            r.assignCreatureTask(c, "wait", {}, { silent: true });
            return c;
        };
        pm.set(hang.x + hang.ux * 5, h(hang.x + hang.ux * 5, hang.z + hang.uz * 5) + 0.5, hang.z + hang.uz * 5);
        const tiere = [stelle("wolf", -1.6), stelle("wesen", 1.6)];
        // die Pfoten: der Aufsetz-Punkt jeder Pfote im Pfoten-Raum (die Kalibrierung der Leben-Schau in der Stand-Pose)
        const kalib = tiere.map((cr) => {
            const tb = cr.userData._tierBaum;
            if (!tb || !tb.teile) return null;
            const Tt = tb.teile;
            const ps = [Tt.flP, Tt.frP, Tt.hlP, Tt.hrP];
            const hf = [Tt.legFL, Tt.legFR, Tt.legHL, Tt.legHR];
            if (ps.some((p) => !p) || hf.some((p) => !p)) return null;
            const altPos = cr.position.clone(),
                altRot = cr.rotation.clone();
            cr.rotation.set(0, 0, 0);
            r._tierBaumNeutralStance(cr);
            cr.updateMatrixWorld(true);
            const boden = cr.position.y;
            const lokal = ps.map((p) => {
                const w = new T.Vector3().setFromMatrixPosition(p.matrixWorld);
                w.y = boden;
                return p.worldToLocal(w.clone());
            });
            cr.position.copy(altPos);
            cr.rotation.copy(altRot);
            cr.updateMatrixWorld(true);
            return { ps, hf, lokal };
        });
        if (kalib.some((k) => !k)) return { fehler: "keine Nah-Gestalt (Pfoten)" };
        const sohlen = (i) => {
            const cr = tiere[i],
                K = kalib[i];
            cr.updateMatrixWorld(true);
            return K.ps.map((p, j) => ({
                w: p.localToWorld(K.lokal[j].clone()),
                hip: new T.Vector3().setFromMatrixPosition(K.hf[j].matrixWorld),
            }));
        };
        const boden = (x, z, ref) => r._standSicht(x, z, ref, false);
        for (let k = 0; k < 120; k++) takt(1 / 60);
        const stand = tiere.map((cr, i) => {
            const S = sohlen(i);
            const lot = S.map((p) => {
                const bx = p.w.x - p.hip.x,
                    by = p.w.y - p.hip.y,
                    bz = p.w.z - p.hip.z;
                return grad(Math.acos(Math.max(-1, Math.min(1, -by / Math.max(1e-6, Math.hypot(bx, by, bz))))));
            });
            const spalt = S.map((p) => p.w.y - boden(p.w.x, p.w.z, cr.position.y));
            return {
                rollGrad: +grad(cr.rotation.z || 0).toFixed(1),
                lotMaxGrad: +Math.max(...lot).toFixed(1),
                sohleMinCm: +(Math.min(...spalt) * 100).toFixed(1),
                sohleMaxCm: +(Math.max(...spalt) * 100).toFixed(1),
            };
        });
        // der Lauf längs der Höhenlinie: der Spieler geht 1,4 m/s quer, Wolf und Hirsch folgen
        for (const c of tiere) r.assignCreatureTask(c, "follow_player", {}, { silent: true });
        const qx = Math.cos(gierQuer) * 0 + Math.sin(gierQuer),
            qz = Math.cos(gierQuer);
        const dt = 1 / 60;
        const spur = tiere.map(() => [[], [], [], []]);
        const leib = tiere.map(() => []);
        let w = 0;
        for (let k = 0; k < 600; k++) {
            w += 1.4 * dt * (k < 300 ? 1 : -1);
            const x = hang.x + qx * w + hang.ux * 4,
                z = hang.z + qz * w + hang.uz * 4;
            pm.set(x, h(x, z) + 0.5, z);
            takt(dt);
            tiere.forEach((cr, i) => {
                const S = sohlen(i);
                leib[i].push({ x: cr.position.x, z: cr.position.z, hop: (cr.userData._hopH || 0) > 0 });
                S.forEach((p, j) =>
                    spur[i][j].push({ x: p.w.x, z: p.w.z, y: p.w.y - boden(p.w.x, p.w.z, cr.position.y) })
                );
            });
        }
        const schlupf = tiere.map((cr, i) => {
            let fuss = 0,
                weg = 0;
            for (let j = 0; j < 4; j++)
                for (let n = 31; n < spur[i][j].length; n++) {
                    const a = spur[i][j][n - 1],
                        b = spur[i][j][n];
                    const la = leib[i][n - 1],
                        lb = leib[i][n];
                    if (la.hop || lb.hop) continue;
                    const lw = Math.hypot(lb.x - la.x, lb.z - la.z);
                    if (lw < 0.004) continue;
                    if (a.y < 0.03 && b.y < 0.03) {
                        fuss += Math.hypot(b.x - a.x, b.z - a.z);
                        weg += lw;
                    }
                }
            return weg > 0.05 ? +(fuss / weg).toFixed(3) : null;
        });
        return {
            ort: ort ? ort.id : "welt",
            hangGrad: +hang.grad.toFixed(1),
            stand: { wolf: stand[0], hirsch: stand[1] },
            schlupf: { wolf: schlupf[0], hirsch: schlupf[1] },
        };
    });

    // ── ferngang (D-Fern): ferne Tiere gehen, sie gleiten nie — 5 Hirsche in 65 m glitten erstarrt
    // (jenseits der Standbild-Schwelle 35·L fror der Baum in der Stand-Pose ein, das gemergte Standbild trug ihn, die
    // Glieder-Kapseln jenseits 64 m lasen eingefrorene Knochen). Seit S3 trägt jenseits der Stufen-Grenze (`ab` × Größe)
    // die gelenkige Grobstufe das Bild, an die Knochen der feinen gebunden (EIN Skelett, `_gelenkGestalt`). Gemessen am
    // echten Takt: 4 Hirsche in der Grobstufen-Zone (45–60 m), 4 in der Kapsel-Zone (70–90 m) folgen dem Spieler (er
    // steht, der Blick liegt auf ihnen); je laufendem Takt (Leib-Weg > 0,3 m/s) GLEITET ein Tier, wenn sein SICHTBARER
    // Leib die Beine nicht bewegt: trägt die Grobstufe, zählen die Gelenke, an die ihre Haut gebunden ist (eine Grobstufe
    // ohne Haut-Gelenke ist ein Standbild — sie gleitet immer), sonst die der feinen; gleiten heißt, die Hüft-Winkel der
    // vier Beine liegen über 24 Takte (0,4 s, die Stufe 1/8 wertet dreimal aus) in 0,02 rad ──
    await buehne("ferngang", async (restore) => {
        r.setGameMode("frieden");
        if (taeter === "ferngang")
            decke(
                restore,
                "_kreaturLaeuft",
                () =>
                    function () {
                        return false; // der Täter: die Ruhe jenseits der Grenze gilt auch dem, der läuft
                    }
            );
        if (taeter === "ferngang-bindung")
            decke(
                restore,
                "_gelenkGestalt",
                (orig) =>
                    function (...arg) {
                        // der Täter: die Grobstufe trägt ihre EIGENEN Knochen (das Fern-Bild vor S3 ohne Spiegel) — sie
                        // bindet nie an die animierten Knochen der feinen
                        const g = orig.apply(this, arg);
                        if (g && g.fern) {
                            const eigene = {};
                            g.fern.traverse((n) => {
                                if ((n.isGroup || n.isBone) && n.name) eigene[n.name] = n;
                            });
                            r.constructor._ofenKlonRebind(g.fern, eigene);
                        }
                        return g;
                    }
            );
        // die Richtung mit Land in 45–90 m
        let richtung = null;
        for (let q = 0; q < 16 && !richtung; q++) {
            const a = (q / 16) * Math.PI * 2;
            let ok = true;
            for (const d of [45, 55, 65, 75, 85, 95]) {
                const x = P0.x + Math.cos(a) * d,
                    z = P0.z + Math.sin(a) * d;
                if (!r._landAt(x, z)) ok = false;
            }
            if (ok) richtung = a;
        }
        if (richtung === null) return { fehler: "kein Land in 45–95 m um den Spieler" };
        const ux = Math.cos(richtung),
            uz = Math.sin(richtung);
        kamera(ux, uz);
        const zonen = { grobstufe: [45, 50, 55, 60], kapsel: [70, 77, 84, 90] };
        const tiere = [];
        for (const [zone, ds] of Object.entries(zonen))
            ds.forEach((d, k) => {
                const o = (k % 2 ? 1 : -1) * 3;
                const x = P0.x + ux * d - uz * o,
                    z = P0.z + uz * d + ux * o;
                const c = tier({ x, y: r.getTerrainHeightAt(x, z) + 0.3, z }, "wesen", 1);
                ruhig(c);
                r.assignCreatureTask(c, "follow_player", {}, { silent: true });
                tiere.push({ c, zone, spur: [], lage: null });
            });
        const BEINE = ["legFL", "legFR", "legHL", "legHR"];
        // der sichtbare Leib: der Satz seiner Gestalt (Phase × Gewicht seiner Instanz im Wurf, der jedes Satz-Tier trägt —
        // `_tickTierSatz`), die Grobstufe (die Gelenke ihrer Haut) oder die feine Stufe
        const imSatz = (c) => {
            for (const m of s.scene.children) {
                if (!m.isInstancedMesh || m.userData.inventar !== "tier" || m.userData.teil !== "wurf") continue;
                const e = m.instanceMatrix.array;
                const a = m.geometry.attributes.aGang;
                for (let i = 0; i < m.count; i++)
                    if (Math.hypot(e[i * 16 + 12] - c.position.x, e[i * 16 + 14] - c.position.z) < 1e-3)
                        return BEINE.map(() => (a.getX(i) % 1) * a.getY(i) * TAU);
            }
            return null;
        };
        const sichtbar = (c) => {
            if (c.userData._satz) return { fern: true, beine: imSatz(c) };
            const tb = c.userData._tierBaum;
            const gl = c.userData._gelenk;
            if (!tb || !gl) return { fern: false, beine: null };
            if (gl.fern.visible && !gl.nah.visible) {
                let haut = null;
                gl.fern.traverse((o) => {
                    if (!haut && o.isSkinnedMesh && o.skeleton && o.userData && o.userData.__skinJoints) haut = o;
                });
                if (!haut) return { fern: true, beine: null };
                const B = {};
                for (const b of haut.skeleton.bones) B[b.name] = b;
                return { fern: true, beine: BEINE.map((n) => (B[n] ? B[n].rotation.x : 0)) };
            }
            const Tt = tb.teile;
            return { fern: false, beine: Tt ? BEINE.map((n) => (Tt[n] ? Tt[n].rotation.x : 0)) : null };
        };
        const z = {
            grobstufe: { lauf: 0, gleit: 0, fernBild: 0 },
            kapsel: { lauf: 0, gleit: 0, fernBild: 0 },
        };
        const dt = 1 / 60;
        for (let k = 0; k < 420; k++) {
            pm.copy(P0);
            takt(dt);
            for (const t of tiere) {
                const c = t.c;
                const p = { x: c.position.x, z: c.position.z };
                const sb = sichtbar(c);
                const b = sb.beine;
                if (t.warFern !== sb.fern) t.spur.length = 0; // der Wechsel feine Stufe ↔ Grobstufe beginnt eine neue Spur
                t.warFern = sb.fern;
                t.spur.push(b);
                if (t.spur.length > 24) t.spur.shift();
                const v = t.lage ? Math.hypot(p.x - t.lage.x, p.z - t.lage.z) / dt : 0;
                t.lage = p;
                if (k < 60 || v < 0.3) continue;
                const Z = z[t.zone];
                Z.lauf++;
                if (sb.fern) Z.fernBild++;
                if (!b) {
                    Z.gleit++; // ein Standbild ohne Gelenke
                    continue;
                }
                if (t.spur.length < 24) continue;
                let spanne = 0;
                for (let j = 0; j < 4; j++) {
                    let mn = Infinity,
                        mx = -Infinity;
                    for (const w of t.spur) {
                        if (!w) continue;
                        mn = Math.min(mn, w[j]);
                        mx = Math.max(mx, w[j]);
                    }
                    spanne = Math.max(spanne, mx - mn);
                }
                if (spanne < 0.02) Z.gleit++;
            }
        }
        const aus2 = {};
        for (const [zone, Z] of Object.entries(z))
            aus2[zone] = {
                laufTakte: Z.lauf,
                gleitTakte: Z.gleit,
                gleitAnteil: Z.lauf ? +(Z.gleit / Z.lauf).toFixed(3) : null,
                fernBild: Z.fernBild,
            };
        aus2.abstandM = tiere.map((t) => +Math.hypot(t.c.position.x - P0.x, t.c.position.z - P0.z).toFixed(1));
        return aus2;
    });

    // DIE GESTALT AUS DER RUHE (K07): die Treffer-Kapseln einer Gattung (_kreaturTrefferGlieder, der Biss liest sie über
    // _kreaturMaul) sind EINE Passung — gleich, an welchem Tier, an welcher Lage, in welcher Pose und Größe sie zuerst
    // entsteht. Zwei Wölfe an zwei Orten, der zweite größer und gedreht, beide mitten im Schritt (jedes Glied ausgelenkt):
    // jede Kapsel muss bit-gleich sein, und die laufende Pose steht danach unverändert.
    await buehne("gestalt", async (restore) => {
        const altK = r._gliedKapseln,
            altN = r._trefferGliedNamen;
        restore.push(() => {
            r._gliedKapseln = altK;
            r._trefferGliedNamen = altN;
        });
        if (taeter === "gestalt")
            decke(
                restore,
                "_gestaltRuhe",
                () =>
                    function () {
                        // der Täter: die Passung im laufenden Rahmen des Tiers (Lage, Pose, Größe des ersten)
                        return (n) => (n.updateWorldMatrix(true, false), n.matrixWorld);
                    }
            );
        const passung = (dx, dz, groesse, pose) => {
            r._gliedKapseln = new Map();
            r._trefferGliedNamen = new Map();
            const o = frei(dx, dz, 6) || land(dx, dz);
            const c = tier({ x: o.x, y: o.y, z: o.z }, "wolf", groesse);
            c.rotation.y = pose * 1.3;
            const T = c.userData._tierBaum.teile;
            let k = 0;
            for (const nm of Object.keys(T).sort()) {
                T[nm].rotation.x += Math.sin(pose * 7 + k) * 0.4;
                T[nm].rotation.z += Math.cos(pose * 5 + k++) * 0.3;
            }
            c.updateMatrixWorld(true);
            const lage = () =>
                Object.keys(T)
                    .sort()
                    .map((nm) => T[nm].quaternion.toArray().join() + T[nm].matrixWorld.elements.join())
                    .join("|");
            const vorher = lage();
            const gl = r._kreaturTrefferGlieder(c);
            const nachher = lage();
            const kaps = new Map();
            for (const [key, kp] of r._gliedKapseln)
                if (kp) kaps.set(key, [kp.a.x, kp.a.y, kp.a.z, kp.b.x, kp.b.y, kp.b.z, kp.r]);
            r.removeCreature(c);
            return { kaps, n: gl ? gl.length : 0, gehalten: vorher === nachher };
        };
        const A = passung(30, 30, 1, 0);
        const B = passung(-40, 60, 1.3, 1);
        let maxAbw = 0,
            glied = null;
        const fehlt = [];
        for (const [key, a] of A.kaps) {
            const b = B.kaps.get(key);
            if (!b) {
                fehlt.push(key);
                continue;
            }
            for (let i = 0; i < a.length; i++) {
                const d = Math.abs(a[i] - b[i]);
                if (d > maxAbw) {
                    maxAbw = d;
                    glied = key;
                }
            }
        }
        for (const key of B.kaps.keys()) if (!A.kaps.has(key)) fehlt.push(key);
        return {
            glieder: A.n,
            kapseln: A.kaps.size,
            fehlt,
            maxAbw,
            glied,
            gehalten: A.gehalten && B.gehalten,
        };
    });

    // ── bewohner (Klassen: das leere Dorf und die Menge als Leib, mensch.K1): das Start-Dorf wächst wie im Spiel, der Spiel-Takt
    // läuft, bis jeder Bewohner seinen Leib trägt; je stehendem Haus die Leiber (`userData.heim`) gegen `leuteVon`, am Dorfplatz
    // (Ego, Third) um 10 Uhr die Menschen im Blick, die im Tag gingen (Frustum, gezeichnet als Leib, Satz oder Feld, Sichtlinie
    // frei von Grundrissen), höchstens `nahLeiber` zeichnen als Leib; und DER TAG (mensch.K2): 24 Spielstunden im Zeitraffer
    // der Spieler-Uhr, je Bewohner die Treffer seiner Soll-Orte (koerper-core `tagesPlan`), die Schmiede um 10 und um 2 Uhr,
    // die Sprung-Wand im Nahbereich.
    await buehne("bewohner", async (restore) => {
        const W = window;
        const altHook = W.__anazhAutoSettlement;
        restore.push(() => {
            if (altHook === undefined) delete W.__anazhAutoSettlement;
            else W.__anazhAutoSettlement = altHook;
        });
        W.__anazhAutoSettlement = true;
        const schlaf = (ms) => new Promise((z) => setTimeout(z, ms));
        const FC = globalThis.__fachwerkCore;
        const wm = s.worldMeta;
        const t0 = performance.now();
        if (!(wm.settlementCells && wm.settlementCells.start)) r._startDorfBestellen(pm);
        for (
            const weiter = W.__deckel("bewohner: das Start-Dorf", 200, () => !!r._autoSettlementPendingKey);
            weiter() && (r._autoSettlementPendingKey || !(wm.settlementCells && wm.settlementCells.start));
        )
            await schlaf(50);
        for (let n = 0; r._autoSettlementQueue && n < 2000; n++) {
            r._tickAutoSettlement(pm);
            await schlaf(0);
        }
        const zelle = wm.settlementCells && wm.settlementCells.start;
        if (!zelle) return { fehler: "das Start-Dorf entstand nicht (kein Dorf-Zug am Genesis-Ort)" };
        const plan = [...(r._ortPlaene || new Map()).values()].find(
            (v) => v && v.ort && Math.abs(v.ort.x - zelle.x) < 0.5 && Math.abs(v.ort.z - zelle.z) < 0.5
        );
        if (!plan) return { fehler: "der Plan v2 des Start-Dorfs fehlt (_ortPlaene)" };
        const steht = (sl) =>
            s.architectures.some(
                (e) =>
                    e &&
                    e.seed >>> 0 === sl.seed >>> 0 &&
                    Math.hypot(e.position.x - (plan.ort.x + sl.x), e.position.z - (plan.ort.z + sl.z)) < 1
            );
        const hausE = s.architectures.filter(
            (e) => e && e.tuer && plan.slots.some((sl) => e.seed >>> 0 === sl.seed >>> 0)
        );
        const haeuser = plan.slots.filter(steht).map((sl) => ({
            seed: sl.seed >>> 0,
            rolle: sl.rolle,
            kultur: sl.kultur,
            soll: FC.leuteVon(sl.ov),
        }));
        // der Spieler am Rand des Dorfplatzes (Lehre 17: Enden der langen Achse, Seiten, Diagonalen — frei von Grundrissen)
        const pz = plan.platz;
        const pc = { x: plan.ort.x + pz.cx, z: plan.ort.z + pz.cz };
        const lang = pz.ex >= pz.ez ? 0 : Math.PI / 2;
        let stand = null;
        for (const k of [0, 4, 2, -2, 1, 3, -1, -3])
            for (const plus of [2, 5, 9]) {
                if (stand) break;
                const da = (k * Math.PI) / 4;
                const a = (pz.phi || 0) + lang + da;
                const ex = Math.abs(Math.cos(da)) * pz.ex + Math.abs(Math.sin(da)) * pz.ez + plus;
                const x = pc.x - Math.cos(a) * ex;
                const z = pc.z + Math.sin(a) * ex;
                const g = r._imGrundriss(x, z, 0.5);
                if (g !== "haus" && g !== "bau" && r._landAt(x, z)) stand = { x, z };
            }
        if (!stand) return { fehler: "kein freier Stand am Rand des Dorfplatzes" };
        const sl0 = Math.hypot(pc.x - stand.x, pc.z - stand.z) || 1;
        const ax = (pc.x - stand.x) / sl0;
        const az = (pc.z - stand.z) / sl0;
        const hS = r.getTerrainHeightAt(stand.x, stand.z);
        pm.set(stand.x, (Number.isFinite(hS) ? hS : pm.y) + A.PLAYER_FOOT_OFFSET, stand.z);
        const leiber = () =>
            s.scene.children.filter((o) => o && o.userData && o.userData.rig && o.userData.heim != null);
        const sollSumme = haeuser.reduce((a, h) => a + (h.soll || 0), 0);
        let stall = null;
        try {
            // mit Bild trägt jeder Leib draußen sein Feld (`_weltOffen().leiber`), jedes Haus die Hülle seines Studios
            const offen = () =>
                leiber().length < sollSumme || r._weltOffen().leiber > 0 || hausE.some((e) => !e._hausHuelle);
            for (const weiter = W.__deckel("bewohner: die Leiber", 120); weiter() && offen();) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {
                    /* der Takt meldet selbst */
                }
                await schlaf(16);
            }
        } catch (e) {
            stall = String((e && e.message) || e).slice(0, 160);
        }
        // Täter (Selbsttest): ein Haus ohne seine Bewohner — die Leiber des ersten bewohnten Hauses fallen aus der Szene
        if (taeter === "bewohner-haus") {
            const h = haeuser.find((x) => x.soll > 0);
            for (const b of leiber()) if (h && b.userData.heim === h.seed) s.scene.remove(b);
        }
        const L = leiber();
        // Täter (Selbsttest): die Menge als Leib — jeder Bewohner zeichnet seinen eigenen Leib (Befehle je Kopf)
        if (taeter === "bewohner-menge") for (const b of L) b.visible = true;
        const jeHaus = new Map();
        for (const b of L) jeHaus.set(b.userData.heim, (jeHaus.get(b.userData.heim) || 0) + 1);
        const leer = haeuser
            .filter((h) => h.soll > 0 && !jeHaus.get(h.seed))
            .map((h) => `${h.rolle} ${h.kultur} #${h.seed}: 0 von ${h.soll}`);
        const alsLeibStart = L.filter((b) => b.visible).length;
        const cam = s.camera;
        const gezeichnet = (b) => b.visible || b.userData._satz === true || r._kzBesitztFeld(b);
        const blickZaehlen = (sicht, zaehlt) => {
            const auge =
                sicht === "ego"
                    ? new T.Vector3(pm.x, pm.y + 0.9, pm.z)
                    : new T.Vector3(pm.x - ax * 4.5, pm.y + 2.6, pm.z - az * 4.5);
            cam.position.copy(auge);
            cam.lookAt(pc.x, pm.y + 0.6, pc.z);
            cam.updateMatrixWorld(true);
            if (cam.matrixWorldInverse) cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
            const fr = new T.Frustum().setFromProjectionMatrix(
                new T.Matrix4().multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse)
            );
            const imBild = [];
            for (const b of zaehlt) {
                if (!gezeichnet(b)) continue;
                const brust = new T.Vector3(b.position.x, b.position.y + 0.4, b.position.z);
                if (!fr.containsPoint(brust)) continue;
                const d = auge.distanceTo(brust);
                if (d > cam.far) continue;
                let frei = true;
                for (let t = 0.6; t < d - 0.6 && frei; t += 0.5) {
                    const k = t / d;
                    const x = auge.x + (brust.x - auge.x) * k;
                    const z = auge.z + (brust.z - auge.z) * k;
                    if (r._imGrundriss(x, z, 0) === "haus") frei = false;
                }
                if (frei) imBild.push(b);
            }
            return imBild;
        };
        // ── DER TAG (mensch.K2): Zeitraffer auf der Uhr des Spieler-Worts — je Ereignis 0,1 Spielstunden (das Wort des
        // Spielers setzt die Uhr), dazwischen der Bewohner-Takt so viele Takte, wie die Uhr der Welt in 0,1 h echt läuft
        // (der Tag des Spielers, `dayLengthMinutes`); je Ereignis die Soll-Orte des Gesetzes (koerper-core `tagesPlan`)
        // gegen den Stand jedes Leibs, je Takt die Sprung-Wand im Nahbereich und der Weg jedes Leibs.
        const KC = window.__koerperCore;
        const planFn = KC && typeof KC.tagesPlan === "function" ? KC.tagesPlan : null;
        const S = [...(r._bewohnerSiedlungen || new Map()).values()].find((x) => x.liste && x.plan.seed === plan.seed);
        const liste = S ? S.liste.filter((b) => L.includes(b.leib)) : [];
        const tag0 = s.timeOfDay;
        restore.push(
            () => r._uhrSetzen(tag0, "regler"),
            () => delete r._bewohnerStrecke
        );
        // Täter (Selbsttest): der Weg geradeaus zum Ziel, durch jedes Haus
        if (taeter === "bewohner-wand") r._bewohnerStrecke = (S0, von, ziel) => [ziel];
        const DT = 0.1;
        const takte = Math.round((0.1 / 24) * (s.dayLengthMinutes || A.DAY_LENGTH_DEFAULT_MINUTES) * 600);
        const nahR = A.BEWOHNER.nahM + A.BEWOHNER.nahHystM;
        const weg = new Map(L.map((g) => [g, 0]));
        const lage = new Map(L.map((g) => [g, { x: g.position.x, z: g.position.z }]));
        const treffer = new Map();
        const vorher = new Map();
        const z = { sprungN: 0, alsLeib: alsLeibStart, schmiede10: null, schmiede2: null };
        let blick10 = null;
        let planGleich = !!planFn;
        const stationen = liste.filter((b) => b.rolle === "schmiede" && b.orte.werk).map((b) => b.orte.werk);
        const anStation = () =>
            L.filter(
                (g) => gezeichnet(g) && stationen.some((o) => Math.hypot(g.position.x - o.x, g.position.z - o.z) < 1.5)
            ).length;
        // DER GANG IM SATZ: der Fuß jedes gehenden Satz-Bewohners (`satzGang`) — jede Senke `bewohner-satz` mit Sohle, Ferse
        // und Ballen je Seite
        const saetze = () => s.scene.children.filter((o) => o && o.name === "bewohner-satz" && o.isInstancedMesh);
        const fussIx = (geo) => {
            const P = geo.attributes.position;
            const ix = {
                ymin: Infinity,
                fuss: [
                    [-1, -1],
                    [-1, -1],
                ],
            };
            for (let v = 0; v < P.count; v++) ix.ymin = Math.min(ix.ymin, P.getY(v));
            for (let v = 0; v < P.count; v++) {
                if (P.getY(v) > ix.ymin + 0.03) continue;
                const f = ix.fuss[P.getX(v) < 0 ? 0 : 1];
                if (f[0] < 0 || P.getZ(v) < P.getZ(f[0])) f[0] = v;
                if (f[1] < 0 || P.getZ(v) > P.getZ(f[1])) f[1] = v;
            }
            // die Sohle liegt PLAYER_FOOT_OFFSET unter dem Ursprung des Leibs — die Haut endet am Knöchel
            return ix.ymin > -A.PLAYER_FOOT_OFFSET + 0.03 ? null : ix.fuss;
        };
        let gehend = [];
        const gang = satzGang(fussIx, (x, z) => {
            const b = gehend.find((q) => Math.hypot(x - q.leib.position.x, z - q.leib.position.z) <= 1e-3);
            const g = b && b.leib;
            return b
                ? {
                      key: b.same,
                      bein: (b.beinL || 0.9) / (b.groesse || 1),
                      x: g.position.x,
                      z: g.position.z,
                      ry: g.rotation.y,
                  }
                : null;
        });
        const gangMessen = (SZ) => {
            gehend = liste.filter((b) => b.weg && b.leib && b.leib.userData._satz === true);
            if (gehend.length) gang.messen(SZ);
        };
        // DER BLICK DER STEHENDEN (mensch.K2): am Platz zur Mitte, vor der Tür vom Haus fort — die Drehung des Leibs, die der
        // Satz zeichnet; dazu die Streuung (der größte Anteil in einem Sektor von 30 Grad)
        const blicke = { n: 0, treffer: 0, sektor: new Array(12).fill(0) };
        const blickMessen = () => {
            for (const b of liste) {
                const g = b.leib;
                if (!g || !b.da || b.drinnen || !gezeichnet(g) || !b.ziel) continue;
                if (taeter === "bewohner-nord") g.rotation.y = 0;
                const o = b.orte;
                const th = g.rotation.y;
                blicke.sektor[((Math.round(th / (Math.PI / 6)) % 12) + 12) % 12]++;
                const soll =
                    b.ziel === o.platz
                        ? Math.atan2(pc.x - g.position.x, pc.z - g.position.z)
                        : b.ziel === o.heim || (b.ziel === o.werk && b.beruf !== "feld" && b.beruf !== "markt")
                          ? Math.atan2(g.position.x - o.tuer.x, g.position.z - o.tuer.z)
                          : null;
                if (soll === null) continue;
                blicke.n++;
                const d = th - soll;
                if (Math.abs(d - 2 * Math.PI * Math.round(d / (2 * Math.PI))) <= 1.3) blicke.treffer++;
            }
        };
        // DER PLATZ (mensch.K2): wem das Gesetz den Platz gibt, der hat dort einen Stand — am Platz,
        // seinem Rand oder dem Rand seiner Gassen (bis 12 m über den Platz hinaus), nie daheim statt dort
        if (taeter === "bewohner-daheim") for (const b of liste.slice(0, 6)) b.orte.platz = null;
        const platzR = Math.hypot(pz.ex, pz.ez) + 12;
        const ohnePlatz = liste.filter(
            (b) => !(b.orte.platz && Math.hypot(b.orte.platz.x - pc.x, b.orte.platz.z - pc.z) <= platzR)
        );
        // ── DIE WEGE (mensch.K3): je Takt jeder Bewohner draußen als Kapsel des Spielers gegen das EINE Blocker-Netz — ein
        // Takt in einer Box ist Durchdringung, beim Namen des Baus; drinnen steht er im Kern seines Hauses, wer einen Kern
        // (Tür-Zeile `tuer` des Plans) betritt oder verlässt, geht durch die Ebene einer Tür; dazu die Gangzeit auf Wegen
        // (`_aufWeg`) und je Bewohner die Wege (Ankunft nach ≥ 2 m) — wer im Haus bleibt, irrt nie.
        const RW = A.PLAYER_WALL_RADIUS;
        const WG = { wand: new Map(), durch: 0, tuer: 0, falsch: [], geh: 0, aufWeg: 0 };
        const wSpur = new Map();
        const kandW = [];
        const nameVon = (e) => `${e.type} #${e.seed >>> 0}`;
        const kernVon = (e) => (e && e.tuer && e.tuer.W > 1.5 && e.tuer.D > 1.5 ? e.tuer : null);
        const hausLage = (e, x, z) => {
            const [c, sn, k] = [Math.cos(e.rotationY || 0), Math.sin(e.rotationY || 0), e.scale > 0 ? e.scale : 1];
            const [dx, dz] = [x - e.position.x, z - e.position.z];
            return { x: (dx * c - dz * sn) / k, z: (dx * sn + dz * c) / k };
        };
        const durchTuer = (e, ax, az, ex, ez) => {
            const [t, p, q] = [kernVon(e), hausLage(e, ax, az), hausLage(e, ex, ez)];
            return [[t.z, t.x, t.w], t.hinten ? [-t.z, t.hinten.x, t.hinten.w] : []].some(([zF, xT, wT]) => {
                const [u, v] = [p.z - zF, q.z - zF];
                if (!(wT > 0) || (u * v > 0 && Math.abs(u) > 1e-3 && Math.abs(v) > 1e-3)) return false;
                const k = Math.abs(u - v) > 1e-9 ? Math.max(0, Math.min(1, u / (u - v))) : 1;
                return Math.abs(p.x + (q.x - p.x) * k - xT) <= wT / 2 + 0.05;
            });
        };
        const wegeMessen = () => {
            for (const b of liste) {
                const [x, z] = [b.leib.position.x, b.leib.position.z];
                if (!wSpur.has(b))
                    wSpur.set(b, { x, z, innen: b.drinnen ? b.orte.tuer.haus : null, weg: null, m: 0, n: 0 });
                const sp = wSpur.get(b);
                kandW.length = 0;
                r._blockerUmPlatz(x, z, 4, kandW);
                let innen = b.drinnen ? b.orte.tuer.haus : null;
                for (const e of b.drinnen ? [] : kandW) {
                    const [t, l] = [kernVon(e), hausLage(e, x, z)];
                    if (t && Math.abs(l.x) < t.W / 2 - 1e-3 && Math.abs(l.z) < t.D / 2 - 1e-3) innen = e;
                }
                for (const e of innen === sp.innen ? [] : [sp.innen, innen].filter(Boolean)) {
                    WG.durch++;
                    if (durchTuer(e, sp.x, sp.z, x, z)) WG.tuer++;
                    else WG.falsch.push(`${b.rolle} #${b.heim} an ${nameVon(e)}`);
                }
                const fuss = b.leib.position.y - A.PLAYER_FOOT_OFFSET * (b.groesse || 1);
                const imLeib = (box) => box.topY > fuss + A.PLAYER_STEP_UP && box.botY < fuss + 1.7 * (b.groesse || 1);
                const wand = b.drinnen
                    ? null
                    : kandW.find((e) =>
                          (e.blockerAABBs || []).some((q) => imLeib(q) && r._boxAbstand2(q, x, z) < RW * RW)
                      );
                if (wand) WG.wand.set(nameVon(wand), (WG.wand.get(nameVon(wand)) || 0) + 1);
                if (b.weg && !b.drinnen && (x !== sp.x || z !== sp.z)) {
                    WG.geh++;
                    if (r._aufWeg(x, z, 0)) WG.aufWeg++;
                }
                if (sp.weg) sp.m += Math.hypot(x - sp.x, z - sp.z);
                if (b.weg !== sp.weg) {
                    if (sp.weg && !b.weg && b.da && sp.m >= 2) sp.n++;
                    [sp.weg, sp.m] = [b.weg, 0];
                }
                Object.assign(sp, { x, z, innen });
            }
        };
        // der Takt (seine Kosten im Spieltakt, den Gang-Fenstern) und je Takt die Wege
        const zeiten = [];
        let quer = null;
        const takt = (dt) => {
            const t = performance.now();
            r._tickBewohner(dt);
            if (dt < 0.05) zeiten.push(performance.now() - t);
            wegeMessen();
            if (taeter === "bewohner-quer" && !quer) quer = querSetzen();
        };
        // Täter (Selbsttest): ein Haus quer vor einem Gehenden auf seinem Weg, der die Wand nach ihm nie prüft
        const querSetzen = () => {
            const vorbild = s.architectures.find((e) => kernVon(e) && liste.some((b) => b.orte.tuer.haus === e));
            const t = kernVon(vorbild);
            const voraus = t.W / 2 + 1.5;
            for (const b of liste) {
                if (!b.weg || b.drinnen || !(b.wegRest > voraus + t.W + 2)) continue;
                let p = { x: b.leib.position.x, z: b.leib.position.z };
                let rest = voraus;
                for (let i = b.wi; i < b.weg.length; p = b.weg[i++]) {
                    const q = b.weg[i];
                    const d = Math.hypot(q.x - p.x, q.z - p.z);
                    if (d < rest) {
                        rest -= d;
                        continue;
                    }
                    const [ux, uz] = [(q.x - p.x) / d, (q.z - p.z) / d];
                    const [x, y] = [p.x + ux * rest, p.z + uz * rest];
                    r._bewohnerWegPruefen = () => {};
                    restore.push(() => delete r._bewohnerWegPruefen);
                    const e = r.spawnArchitecture(
                        vorbild.type,
                        { x, y: r.getTerrainHeightAt(x, y) + 0.5, z: y },
                        { seed: 4242, rotationY: Math.atan2(-uz, ux), silent: true, tuer: t }
                    );
                    if (e) restore.push(() => r.removeArchitecture(e));
                    return e;
                }
            }
            return null;
        };
        const tTag = performance.now();
        for (let i = 1; i <= 240; i++) {
            const stunde = (s.timeOfDay * 24 + 0.1) % 24;
            r._uhrSetzen(stunde / 24, "regler");
            const SZ = saetze();
            for (let k = 0; k < takte; k++) {
                takt(DT);
                // Täter (Selbsttest): der Teleport an den Soll-Ort
                if (taeter === "bewohner-sprung")
                    for (const b of liste) if (b.ziel) b.leib.position.set(b.ziel.x, b.leib.position.y, b.ziel.z);
                for (const g of L) {
                    const v = lage.get(g);
                    const d = Math.hypot(g.position.x - v.x, g.position.z - v.z);
                    weg.set(g, weg.get(g) + d);
                    if (
                        d > 2 &&
                        Math.min(
                            Math.hypot(v.x - pm.x, v.z - pm.z),
                            Math.hypot(g.position.x - pm.x, g.position.z - pm.z)
                        ) < nahR
                    )
                        z.sprungN++;
                    v.x = g.position.x;
                    v.z = g.position.z;
                }
            }
            // DAS GANG-FENSTER: die Wege zum Werk, zum Platz, nach Hause — 10 s im Takt des Spiels (1/60 s)
            if ([7.5, 12, 17.2].some((h) => Math.abs(stunde - h) < 0.05)) {
                gang.luecke(); // das Fenster beginnt jede Spur neu
                for (let k = 0; k < 600; k++) {
                    takt(1 / 60);
                    // Täter (Selbsttest): der Satz gleitet — jede Instanz steht in der Phase 0 (die Pose friert ein)
                    if (taeter === "bewohner-gleiten")
                        for (const m of SZ) {
                            const a = m.geometry.attributes.aGang;
                            if (a) for (let q = 0; q < a.count; q++) a.setX(q, 0);
                        }
                    gangMessen(SZ);
                }
                for (const g of L) lage.set(g, { x: g.position.x, z: g.position.z }); // das Fenster ist kein Sprung
            }
            z.alsLeib = Math.max(z.alsLeib, L.filter((g) => g.visible).length);
            // die Soll-Orte: am Ort (≤ 1,5 m, gezeichnet) · drinnen (an der Tür, ungezeichnet) · unterwegs: sein Weg zu DIESEM
            // Soll begann seit dem letzten Ereignis oder schrumpfte um die Hälfte dessen, was sein Tempo in der Zeit trägt
            for (const b of planFn ? liste : []) {
                const o = b.orte;
                const sh = (stunde + (taeter === "bewohner-plan6" ? 6 : 0)) % 24;
                const soll = planFn(b.same, b.rolle, o.heim, o.werk, sh, o.platz);
                if (JSON.stringify(soll) !== JSON.stringify(planFn(b.same, b.rolle, o.heim, o.werk, sh, o.platz)))
                    planGleich = false;
                const ziel = soll.drinnen ? o.tuer : soll.ort;
                const g = b.leib;
                const alt = vorher.get(b);
                const rest = b.ziel === ziel && Number.isFinite(b.wegRest) ? b.wegRest : null;
                const unterwegs =
                    rest !== null && (!alt || alt.ziel !== ziel || alt.rest - rest >= 0.5 * b.tempo * takte * DT);
                const da =
                    Math.hypot(g.position.x - ziel.x, g.position.z - ziel.z) < 1.5 && gezeichnet(g) !== soll.drinnen;
                treffer.set(b, (treffer.get(b) || 0) + (da || unterwegs ? 1 / 240 : 0));
                vorher.set(b, { ziel: b.ziel, rest });
            }
            if (Math.abs(stunde - 10) < 0.05) {
                z.schmiede10 = anStation();
                blick10 = [blickZaehlen("ego", L), blickZaehlen("third", L)];
            }
            if (Math.abs(stunde - 10) < 0.05 || Math.abs(stunde - 12.5) < 0.05 || Math.abs(stunde - 19) < 0.05)
                blickMessen();
            if (Math.abs(stunde - 2) < 0.05) z.schmiede2 = anStation();
        }
        // gezählt: ein Leib mit Rig, der im Tag ging
        const gegangen = (g) => weg.get(g) > 0.5 && !!g.userData.rig;
        const unter = liste.filter((b) => !(treffer.get(b) >= 0.9));
        const q3 = (v) => Math.round(v * 1000) / 1000;
        return Object.assign(z, {
            dorf: plan.name,
            haeuser: haeuser.length,
            sollSumme,
            leiber: L.length,
            quote: sollSumme > 0 ? q3(L.length / sollSumme) : null,
            leer: leer.slice(0, 6),
            leerN: leer.length,
            imBlick: {
                ego: blick10 ? blick10[0].filter(gegangen).length : 0,
                third: blick10 ? blick10[1].filter(gegangen).length : 0,
            },
            nahLeiber: A.BEWOHNER.nahLeiber,
            plan: !!planFn,
            planGleich,
            tagSek: Math.round((performance.now() - tTag) / 100) / 10,
            bewohner: liste.length,
            trefferMin: liste.length ? q3(Math.min(...liste.map((b) => treffer.get(b) || 0))) : null,
            unter: unter
                .slice(0, 5)
                .map((b) => `${b.rolle}/${b.beruf} #${b.heim}: ${Math.round((treffer.get(b) || 0) * 100)} %`),
            unterN: unter.length,
            stationen: stationen.length,
            satzGang: gang.schlupf(),
            blick: {
                n: blicke.n,
                quote: blicke.n ? q3(blicke.treffer / blicke.n) : null,
                sektorMax: q3(
                    Math.max(...blicke.sektor) /
                        Math.max(
                            1,
                            blicke.sektor.reduce((a, x) => a + x, 0)
                        )
                ),
            },
            ohnePlatz: ohnePlatz.length,
            ohnePlatzWer: ohnePlatz.slice(0, 4).map((b) => `${b.rolle}/${b.beruf} #${b.heim}`),
            takt: {
                n: zeiten.length,
                p95: q3(quantil(zeiten, 0.95)),
                mittel: q3(zeiten.reduce((a, t) => a + t, 0) / zeiten.length),
            },
            huellen: hausE.filter((e) => e._hausHuelle).length,
            wege: (() => {
                const zahl = liste.map((b) => {
                    const [o, sp] = [b.orte, wSpur.get(b) || { n: 0 }];
                    const soll = o.platz ? 2 * Math.hypot(o.tuer.x - o.platz.x, o.tuer.z - o.platz.z) : Infinity;
                    return {
                        wer: `${b.rolle}/${b.beruf} #${b.heim}`,
                        n: sp.n,
                        m: Math.round(weg.get(b.leib) || 0),
                        soll,
                    };
                });
                const [ausser, kurz] = [zahl.filter((q) => q.n < 4 || q.n > 10), zahl.filter((q) => !(q.m >= q.soll))];
                return {
                    wandN: [...WG.wand.values()].reduce((a, n) => a + n, 0),
                    wand: [...WG.wand]
                        .sort((a, b) => b[1] - a[1])
                        .slice(0, 4)
                        .map(([n, k]) => `${n}: ${k}`),
                    durch: WG.durch,
                    tuer: WG.tuer,
                    falsch: WG.falsch.slice(0, 4),
                    aufWeg: WG.geh ? q3(WG.aufWeg / WG.geh) : null,
                    wegeMin: Math.min(...zahl.map((q) => q.n)),
                    wegeMax: Math.max(...zahl.map((q) => q.n)),
                    ausserN: ausser.length,
                    ausser: ausser.slice(0, 4).map((q) => `${q.wer}: ${q.n}`),
                    streckeMin: Math.min(...zahl.map((q) => q.m)),
                    kurzN: kurz.length,
                    kurz: kurz.slice(0, 3).map((q) => `${q.wer}: ${q.m} von ${Math.round(q.soll)} m`),
                };
            })(),
            stall,
            sek: Math.round((performance.now() - t0) / 100) / 10,
        });
    });

    // ── tiersatz (Klasse: die Menge der Tiere als Einzel-Draws, profiband.K1 „Sturm mit 50 Tieren“): 10 und 50 Tiere derselben
    // vier Gattungen im Nah-Kreis um den Spieler, der echte Kreatur-Takt — die Befehle der Tiere (je gezeichnetes Mesh im
    // Bild und im Wurf, je Senke mit Instanzen) hängen nie an der Kopfzahl; wer nicht als Leib lebt, steht und geht im Satz
    // seiner Gattung, und dessen Gang gleitet nicht (Schlupf aus dem, was die GPU zeichnet: die Vorlage an Phase, Band und
    // Gewicht seiner Instanz × Instanz-Matrix, je Bein die tiefste Ecke — wie gate:tier-gang).
    await buehne("tiersatz", async (restore) => {
        const SM = A.TETRAPODA_SOUL_MAP;
        const seelen = ["wolf", "fox", "bear", "deer"].map((g) => Object.keys(SM).find((k) => SM[k] === g));
        const sichtbar = (o) => {
            for (let x = o; x; x = x.parent) if (!x.visible) return false;
            return true;
        };
        const saetze = () => s.scene.children.filter((o) => o && o.isInstancedMesh && o.userData.inventar === "tier");
        const befehle = () => {
            let haupt = 0,
                wurf = 0,
                leiber = 0,
                satz = 0;
            for (const c of s.creatures) {
                let n = 0;
                c.traverse((o) => {
                    if (!o.isMesh || !sichtbar(o)) return;
                    if (o.layers.mask & 1) (haupt++, n++);
                    if (o.castShadow) wurf++;
                });
                if (n > 0) leiber++;
            }
            for (const o of saetze())
                if (o.count > 0 && o.visible) {
                    if (o.layers.mask & 1) (haupt++, satz++);
                    if (o.castShadow) wurf++;
                }
            return { haupt, wurf, leiber, satz };
        };
        // Täter (Selbsttest): die Menge als Leib (keine Satz-Wahl) · der Satz geht schneller, als der Leib läuft
        if (taeter === "tiersatz-kopf") decke(restore, "_tierSatzWahl", () => () => null);
        // · das Auge trägt jedes Satz-Tier (kein Blick) · der Takt schreibt jeden Platz, ob sich etwas rührte oder nicht
        if (taeter === "tiersatz-blick") decke(restore, "_kreaturAusserBlick", () => () => false);
        if (taeter === "tiersatz-schreiben") decke(restore, "_tierSatzStempel", () => () => true);
        // · die Sicht-Kopien der Mitspieler stehen nicht in der Menge des Satzes (jede Kopie ein Leib)
        if (taeter === "tiersatz-kopie")
            decke(
                restore,
                "_tickTierSatz",
                (alt) =>
                    function (...a) {
                        const k = s.p2p.remoteCreatures;
                        s.p2p.remoteCreatures = new Map();
                        try {
                            return alt.apply(this, a);
                        } finally {
                            s.p2p.remoteCreatures = k;
                        }
                    }
            );
        if (taeter === "tiersatz-gleiten")
            decke(
                restore,
                "_tierSatzSchritt",
                (alt) =>
                    function (u, weg, ...rest) {
                        return alt.call(this, u, weg * 1.5, ...rest);
                    }
            );
        const ring = (n, rMin, rMax, saat) => {
            let k = 0;
            for (let i = 0; i < 400 && k < n; i++) {
                const w = ((saat + i) * 2.39996) % TAU,
                    d = rMin + (rMax - rMin) * (((saat + i) * 0.618034) % 1);
                const o = land(Math.cos(w) * d, Math.sin(w) * d);
                if (Math.hypot(o.x - P0.x, o.z - P0.z) < rMin - 1) continue;
                tier(o, seelen[s.creatures.length % 4], 1);
                k++;
            }
        };
        // der Takt samt dem Blick des Bilds (`_ruheImBild`, im Render-Pfad): dort schreibt das Auge des Satzes
        const bildTakt = (dt) => {
            takt(dt);
            r._ruheImBild();
        };
        const laufen = (n) => {
            for (let i = 0; i < n; i++) bildTakt(1 / 60);
        };
        ring(10, 15, 30, 1);
        laufen(240);
        const B10 = befehle();
        ring(40, 15, 55, 101);
        laufen(240);
        const B50 = befehle();
        // DIE KOSTEN AN SCHIRM UND ÄNDERUNG (Gebot 7): ein Takt ohne Zeit rückt keinen Gang — er schreibt nur die Plätze der
        // Satz-Tiere, deren Lage oder Drehung sich rührte (je Tier höchstens eine Instanz je Senke); der Blick nach +x: das Auge trägt jedes Satz-Tier, dessen Lage
        // der Frustum enthält (keines fehlt), und nicht alle; der Wurf jedes Satz-Tier
        const schreibe = A._gangSatzInstanz;
        let schriebe = 0;
        A._gangSatzInstanz = function (...a) {
            schriebe++;
            return schreibe.apply(this, a);
        };
        restore.push(() => (A._gangSatzInstanz = schreibe));
        const lage = (c) => [c.position.x, c.position.y, c.position.z, c.quaternion.x, c.quaternion.y, c.quaternion.z, c.quaternion.w];
        let ruehrte = 0;
        for (let i = 0; i < 4; i++) {
            const vor = new Map(s.creatures.filter((c) => c.userData._satz).map((c) => [c, lage(c)]));
            bildTakt(0);
            for (const [c, a] of vor) if (lage(c).some((x, k) => x !== a[k])) ruehrte++;
        }
        A._gangSatzInstanz = schreibe;
        const ruhe = { schriebe, ruehrte, senken: saetze().length };
        kamera(1, 0);
        laufen(2);
        const fr = new T.Frustum().setFromProjectionMatrix(
            new T.Matrix4().multiplyMatrices(s.camera.projectionMatrix, s.camera.matrixWorldInverse)
        );
        const imSatz = s.creatures.filter((c) => c.userData._satz);
        const fell = saetze().filter((m) => m.userData.teil === "fell");
        const gezeichnet = (c) =>
            fell.some((m) => {
                const IM = m.instanceMatrix.array;
                for (let i = 0; i < m.count; i++)
                    if (Math.hypot(IM[i * 16 + 12] - c.position.x, IM[i * 16 + 14] - c.position.z) < 1e-3) return true;
                return false;
            });
        const imBlick = imSatz.filter((c) => fr.containsPoint(c.position));
        const zahlVon = (teil) => saetze().filter((m) => m.userData.teil === teil).reduce((n, m) => n + m.count, 0);
        const blick = {
            satz: imSatz.length,
            imBlick: imBlick.length,
            fehlt: imBlick.filter((c) => !gezeichnet(c)).length,
            fell: zahlVon("fell"),
            wurf: zahlVon("wurf"),
        };
        // DER PUFFER GEHÖRT DEM SKELETT (Lehre 19): je Gestalt der Gang-Puffer gegen die Ecken ihrer Senken; je Senke die
        // Vertex-Puffer ihrer Pipeline (WebGPU sagt über 8 die Pipeline ab — der Satz zeichnete nie)
        const vertexPuffer = Math.max(
            ...saetze().map(
                (m) => new Set(Object.values(m.geometry.attributes).map((a) => (a.isInterleavedBufferAttribute ? a.data : a))).size
            )
        );
        const puffer = saetze()
            .filter((m) => m.userData.teil === "fell")
            .map((m) => ({
                puffer: m.userData.gang.puffer.byteLength,
                ecken: [
                    ...new Set(
                        Object.values(m.geometry.attributes)
                            .filter((a) => !a.isInstancedBufferAttribute)
                            .map((a) => (a.isInterleavedBufferAttribute ? a.data.array : a.array))
                    ),
                ].reduce((n, a) => n + a.byteLength, 0),
            }));
        // DER GANG IM SATZ (`satzGang`): je Senke `fell` die tiefste Ecke je Bein (Seite × vorn/hinten der stehenden Vorlage)
        const fuesse = (geo) => {
            const P = geo.attributes.position;
            let zM = 0;
            for (let v = 0; v < P.count; v++) zM += P.getZ(v) / P.count;
            const ix = [[-1], [-1], [-1], [-1]];
            for (let v = 0; v < P.count; v++) {
                const f = ix[(P.getX(v) < 0 ? 0 : 1) + (P.getZ(v) < zM ? 0 : 2)];
                if (f[0] < 0 || P.getY(v) < P.getY(f[0])) f[0] = v;
            }
            return ix;
        };
        const gang = satzGang(fuesse, (x, z) => {
            const c = s.creatures.find((k) => Math.hypot(k.position.x - x, k.position.z - z) < 1e-3);
            return c
                ? {
                      key: c.userData.netId,
                      bein: c.userData._tierBaum.beinL,
                      x: c.position.x,
                      z: c.position.z,
                      ry: c.rotation.y,
                  }
                : null;
        });
        for (let i = 0; i < 360; i++) {
            bildTakt(1 / 60);
            gang.messen(saetze().filter((m) => m.userData.teil === "wurf"));
        }
        const G = gang.schlupf();
        // DIE SICHT-KOPIEN (dieselbe Klasse): 8 Kopien eines Mitspielers im Ring 20–40 m stehen in der Menge — als Leib zeichnen
        // höchstens die `nahLeiber` Nächsten aller Tiere, eigene und Kopien zusammen
        const remote = s.p2p.remoteCreatures;
        restore.push(() => {
            for (const [key, rc] of remote) if (rc.peerId === "linse-satz") r._disposeRemoteCreature(key, rc);
        });
        const kopien = [];
        for (let i = 0; i < 8; i++) {
            const o = land(Math.cos(i * 0.785 + 0.3) * (20 + 2.5 * i), Math.sin(i * 0.785 + 0.3) * (20 + 2.5 * i));
            kopien.push({ id: "k" + i, x: o.x, y: o.y, z: o.z, yaw: 0, soul: seelen[i % 4] });
        }
        for (let k = 0; k < 120; k++) {
            r._p2pHandleCreaturePos("linse-satz", { list: kopien });
            r._p2pTickRemoteCreatures(200 + k / 60, 1 / 60);
            bildTakt(1 / 60);
        }
        const kopieLeib = [...remote.values()].filter((rc) => {
            let n = 0;
            rc.mesh.traverse((o) => o.isMesh && sichtbar(o) && o.layers.mask & 1 && n++);
            return rc.peerId === "linse-satz" && n > 0;
        }).length;
        const kopieSatz = [...remote.values()].filter((rc) => rc.peerId === "linse-satz" && rc.mesh.userData._satz).length;
        const eigenLeib = befehle().leiber;
        return {
            kopie: { leib: kopieLeib, satz: kopieSatz, eigenLeib },
            b10: B10,
            b50: B50,
            nahLeiber: A.KREATUR_SATZ ? A.KREATUR_SATZ.nahLeiber : null,
            senken: saetze().length,
            satzTiere: G.spuren,
            schlupf: G.schlupf,
            wegLeib: G.wegLeib,
            ruhe,
            blick,
            puffer,
            vertexPuffer,
        };
    });

    return aus;
}

// ═══ DAS URTEIL (Node): Zahl → grün/rot mit Grund ═══
const PROBEN = [
    "geister",
    "geburt",
    "sattel",
    "reload",
    "huepfer",
    "wachsen",
    "gier",
    "jagd",
    "herde",
    "hindernis",
    "gedreht",
    "nacht",
    "peer",
    "zufall",
    "nexus",
    "temperament",
    "abstand",
    "jagdkreis",
    "rudel",
    "sockel",
    "querhang",
    "ferngang",
    "gestalt",
    "bewohner",
    "tiersatz",
];
function urteil(name, z) {
    if (!z) return { ok: false, grund: "keine Zahl" };
    if (z.fehler) return { ok: false, grund: z.fehler };
    const f = [];
    const soll = (bed, text) => {
        if (!bed) f.push(text);
    };
    if (name === "tiersatz") {
        soll(
            z.b50.haupt - z.b50.satz === z.b10.haupt - z.b10.satz && z.b50.satz <= z.senken && z.b50.wurf === z.b10.wurf,
            `Befehle der Tiere hängen an der Kopfzahl: 10 Tiere ${z.b10.haupt} Bild (${z.b10.satz} Satz) + ${z.b10.wurf} Wurf, 50 Tiere ${z.b50.haupt} (${z.b50.satz}) + ${z.b50.wurf} (Soll: die Leiber gleich, je Senke höchstens ein Befehl — ${z.senken} Senken, Wurf gleich)`
        );
        soll(
            z.nahLeiber != null && z.b50.leiber <= z.nahLeiber,
            `${z.b50.leiber} von 50 Tieren als Leib gezeichnet (Soll ≤ nahLeiber ${z.nahLeiber})`
        );
        soll(
            z.satzTiere >= 10 && z.wegLeib >= 20 && z.schlupf !== null && z.schlupf <= 0.05,
            `der Satz gleitet: Schlupf ${z.schlupf} über ${z.wegLeib} m Gang von ${z.satzTiere} Satz-Tieren (Soll ≤ 0,05 über ≥ 20 m, ≥ 10 Tiere)`
        );
        const Rh = z.ruhe;
        soll(
            Rh.schriebe <= Rh.ruehrte * 4,
            `der Satz schreibt ohne Änderung: 4 Takte ohne Zeit schrieben ${Rh.schriebe} Instanzen, ${Rh.ruehrte}× rührte sich ein Satz-Tier (Soll ≤ 4 je Rühren)`
        );
        const B = z.blick;
        soll(
            B.satz >= 10 && B.fell < B.satz && B.wurf === B.satz,
            `das Auge zeichnet den Satz außer Blick: ${B.fell} Fell-Instanzen bei ${B.imBlick} von ${B.satz} Satz-Tieren im Blick, Wurf ${B.wurf} (Soll Auge < alle, Wurf = alle)`
        );
        soll(B.fehlt === 0, `dem Auge fehlen ${B.fehlt} von ${B.imBlick} Satz-Tieren im Blick (Soll 0)`);
        const Kp = z.kopie;
        soll(
            Kp.satz >= 4 && Kp.leib + Kp.eigenLeib <= z.nahLeiber,
            `die Sicht-Kopien zeichnen als Leib: ${Kp.leib} von 8 Kopien als Leib, ${Kp.satz} im Satz, dazu ${Kp.eigenLeib} eigene Leiber (Soll ≥ 4 im Satz, Leiber zusammen ≤ nahLeiber ${z.nahLeiber})`
        );
        const P = z.puffer || [];
        soll(
            P.length > 0 && P.every((p) => p.puffer <= p.ecken) && z.vertexPuffer <= 8,
            `der Gang-Puffer gehört den Ecken: ${P.map((p) => Math.round(p.puffer / 1024) + " KB gegen " + Math.round(p.ecken / 1024) + " KB Ecken").join(" · ")} ; Vertex-Puffer je Senke höchstens ${z.vertexPuffer} (Soll je Gestalt ≤ die Ecken ihrer Senke, ≤ 8 Vertex-Puffer)`
        );
        return { ok: !f.length, grund: f.join(" · ") };
    }
    if (name === "bewohner") {
        soll(z.leiber > 0, `0 Bewohner im Start-Dorf ${z.dorf} (${z.haeuser} Häuser, Σ leute ${z.sollSumme})`);
        soll(
            z.quote !== null && Math.abs(z.quote - 1) <= 0.05,
            `Bewohner-Quote ${z.quote} (${z.leiber} Leiber ÷ Σ leute ${z.sollSumme}; Soll 1,0 ±0,05)`
        );
        soll(z.leerN === 0, `${z.leerN} Haus ohne Bewohner: ${z.leer.join(" · ")}`);
        soll(
            z.imBlick.ego >= 10 && z.imBlick.third >= 10,
            `Dorfplatz um 10 Uhr: ${z.imBlick.ego} (Ego) / ${z.imBlick.third} (Third) Menschen im Blick, die im Tag gingen (Soll ≥ 10)`
        );
        soll(
            z.alsLeib <= z.nahLeiber,
            `${z.alsLeib} Leiber als Leib gezeichnet (Soll ≤ nahLeiber ${z.nahLeiber}: die Menge steht im Satz)`
        );
        // DER TAG (mensch.K2): das Gesetz der Uhr, jeder Leib geht, trifft seine Soll-Orte, springt nie im Nahbereich
        soll(z.plan, "kein Tagesplan: koerper-core trägt kein tagesPlan (VERHALTEN) — der Bewohner kennt keinen Tag");
        soll(z.planGleich, "der Tagesplan ist bei gleichem Samen nicht bit-gleich");
        soll(
            z.trefferMin !== null && z.trefferMin >= 0.9,
            `Soll-Orte über 24 Spielstunden: min ${z.trefferMin} (Soll ≥ 0,9 je Bewohner; ${z.unterN} darunter: ${z.unter.join(" · ")})`
        );
        soll(z.stationen > 0, "keine Station Schmiede im Start-Dorf (kein Bewohner mit Rolle schmiede)");
        soll(z.schmiede10 > 0, `Station Schmiede um 10 Uhr leer (${z.schmiede10} am Werk)`);
        soll(z.schmiede2 === 0, `Station Schmiede um 2 Uhr besetzt (${z.schmiede2} am Werk)`);
        soll(z.sprungN === 0, `Sprung im Nahbereich: ${z.sprungN} Takte mit > 2 m je Frame`);
        // DER GANG IM SATZ, DER BLICK, DER PLATZ (mensch.K1/K2 Staffel 2)
        const sg = z.satzGang || {};
        soll(
            sg.schlupf !== null && sg.schlupf <= 0.05 && sg.wegLeib >= 10,
            `der Satz gleitet: Schlupf ${sg.schlupf} über ${sg.wegLeib} m Weg (${sg.spuren} Spuren; Soll ≤ 0,05 über ≥ 10 m wie gate:tier-gang)`
        );
        soll(
            z.blick.n >= 10 && z.blick.quote >= 0.9 && z.blick.sektorMax <= 0.5,
            `der Blick der Stehenden: ${z.blick.quote} von ${z.blick.n} schauen auf ihr Ziel (Soll ≥ 0,9), ${z.blick.sektorMax} in einer Richtung (Soll ≤ 0,5)`
        );
        soll(
            z.ohnePlatz === 0,
            `ohne Platz: ${z.ohnePlatz} Bewohner ohne Stand am Platz, seinem Rand oder seinen Gassen (${z.ohnePlatzWer.join(" · ")})`
        );
        // DIE WEGE (mensch.K3): keine Kapsel in einer Wand, jeder Durchgang durch die Tür, jeder geht seinen Tag
        const w = z.wege || {};
        soll(z.huellen === z.haeuser, `${z.haeuser - z.huellen} von ${z.haeuser} Häusern ohne die Hülle ihres Studios`);
        soll(w.wandN === 0, `Durchdringung: ${w.wandN} Takte eines Leibs in einer Wand (${w.wand})`);
        soll(
            w.durch > 0 && w.tuer === w.durch,
            `nicht über die Tür: ${w.durch - w.tuer} von ${w.durch} Ein- und Austritten (${w.falsch})`
        );
        soll(
            w.ausserN === 0,
            `Wege am Tag: ${w.ausserN} Bewohner außerhalb 4–10 (${w.wegeMin}–${w.wegeMax}: ${w.ausser})`
        );
        soll(
            w.kurzN === 0,
            `Strecke am Tag: ${w.kurzN} Bewohner unter zweimal der Luftlinie Tür–Platz (min ${w.streckeMin} m: ${w.kurz})`
        );
        soll(w.aufWeg >= 0.85, `Gangzeit auf Wegen ${w.aufWeg} (Soll ≥ 0,85)`);
    }
    if (name === "geister") soll(z.geister === 0, `${z.geister} Geister nach clearCreatures (aus ${z.vorher})`);
    if (name === "geburt") {
        soll(z.geburten >= 10, `nur ${z.geburten} Geburten`);
        soll(z.minM >= 0.99 * z.fernMin, `Geburt ${z.minM} m vor dem Spieler (Soll ≥ ${z.fernMin} m)`);
        soll(z.imBlick === 0, `${z.imBlick} Geburten im Blick`);
        soll(z.rudel > 0 && z.herden > 0, `keine Gruppe: ${z.rudel} Rudel, ${z.herden} Herden (${z.gruppen})`);
        soll(z.fensterMax <= z.fensterRaum, `ein Tier ${z.fensterMax} Paar-Räume vom Nächsten seiner Gruppe`);
        soll(z.journal === z.geburten, `${z.geburten - z.journal} Würfe ohne growth-Eintrag ihrer Gruppe`);
    }
    if (name === "sattel") {
        soll(z.aufgestiegen === true, "nicht aufgestiegen (Probe vakuös)");
        soll(z.nachTod === null, `nach dem Tod im Sattel: mountedArch ${z.nachTod}`);
    }
    if (name === "huepfer") {
        soll(z.luftAnteil < 0.03, `Luft-Anteil ${(z.luftAnteil * 100).toFixed(1)} % (Soll < 3 %)`);
        soll(z.starts > 0, "kein Sprung (die Aktionen hüpfen nicht — Probe vakuös)");
        soll(z.ausAktion === z.starts, `${z.starts - z.ausAktion} von ${z.starts} Sprüngen ohne Aktion`);
        soll(
            z.rufe === z.starts,
            `${z.starts - z.rufe} von ${z.starts} Sprüngen am Sprung-Gesetz vorbei (creatureJump startete ${z.rufe})`
        );
        soll(
            z.gesetzFehler !== null && z.gesetzFehler < 0.03,
            `Scheitel ${((z.gesetzFehler || 0) * 100).toFixed(1)} % neben dem Sprung-Gesetz (freude.hopHochM ${z.hopHochM} / hopBasisM ${z.hopBasisM} m)`
        );
        soll(
            z.flugVerhaeltnis !== null && Math.abs(z.flugVerhaeltnis - 1) < 0.05,
            `Flugzeit 144 Hz / 30 Hz = ${z.flugVerhaeltnis} (Soll 1)`
        );
        soll(
            z.frohFehler < 0.03,
            `der frohe Sprung steigt ${z.flug30.top} m (Sprung-Gesetz freude.hopHochM ${z.hopHochM} m)`
        );
        soll(
            z.basisFehler < 0.03,
            `der Grund-Sprung steigt ${z.basisTop} m (Sprung-Gesetz freude.hopBasisM ${z.hopBasisM} m)`
        );
    }
    if (name === "wachsen") soll(Math.abs(z.skala - 1) < 0.001, `Skala nach 3600 Takten ×${z.skala}`);
    if (name === "gier") {
        for (const art of Object.keys(z)) {
            const a = z[art];
            soll(a.laufFrames > 300, `${art}: nur ${a.laufFrames} Lauf-Frames`);
            soll(a.abwP90 !== null && a.abwP90 <= 20, `${art}: Lauf ↔ Blick p90 ${a.abwP90}° (Soll ≤ 20°)`);
            soll(a.rueckwaerts === 0, `${art}: ${(a.rueckwaerts * 100).toFixed(1)} % rückwärts`);
            soll(
                a.schlupfQuer !== null && a.schlupfQuer <= 0.2,
                `${art}: Stand-Schlupf quer ${a.schlupfQuer} (Soll ≤ 0,2; längs ${a.schlupfLaengs})`
            );
            soll(a.beschlMax <= 12, `${art}: Tempo-Sprung ${a.beschlMax} m/s² (Soll ≤ 12)`);
            soll(
                a.gasBremseJeMin !== null && a.gasBremseJeMin <= 30,
                `${art}: Folgen als Gas ↔ Bremse ${a.gasBremseJeMin} Wechsel je Minute (Soll ≤ 30, das Ankunfts-Gesetz)`
            );
        }
    }
    if (name === "jagd") {
        soll(z.jagdFrames >= 60, `nur ${z.jagdFrames} Jagd-Frames (Probe vakuös)`);
        soll(
            z.achsAnteil !== null && z.achsAnteil < 0.1,
            `Jagd auf den Achsen (0,25°, der Lauf neben der Peilung des Ziels) ${(z.achsAnteil * 100).toFixed(1)} % (5°: ${(z.achsAnteil5Grad * 100).toFixed(1)} %; auf das Ziel ${(z.achsZielAnteil * 100).toFixed(1)} %; davon im Wasser ${z.achsImWasser} Takte; Ort ${JSON.stringify(z.achsOrt || null)})`
        );
        soll(z.bedrohtFrames >= 60, `nur ${z.bedrohtFrames} bedrohte Beute-Frames`);
        soll(z.fortAnteil !== null && z.fortAnteil > 0.8, `Beute fort vom Jäger ${z.fortAnteil} (Soll > 0,8)`);
    }
    if (name === "herde") {
        soll(z.artFremdZugM < 0.01, `ein fremder Verband verschmilzt: die Herde liegt ${z.artFremdZugM} m anders`);
        soll(z.blickDiffM < 1e-6, `Bewegung hängt am Blick: ${z.blickDiffM} m Unterschied`);
        // höchstens ein Nachzügler je fünf Glieder (S6)
        const { wander: W, flucht: F, fensterRaum: FR } = z.verband;
        soll(
            Math.min(W.n, F.n, z.fremdN) >= 3 && F.fluchtAnteil >= 0.1 && W.fluchtAnteil === 0,
            `Probe vakuös: Glieder ${W.n} / ${F.n} / fremd ${z.fremdN}, in Flucht ${F.fluchtAnteil} (Soll ≥ 0,1), wandernd ${W.fluchtAnteil} (Soll 0)`
        );
        soll(
            W.mittel >= 0.9,
            `Verband zerfällt beim Wandern: im Mittel ${W.mittel} der ${W.n} Glieder binnen ${FR} Paar-Räumen vom Mittel von 10 bis 60 s (Soll ≥ 0,9; Wurf ${W.wurfAnteil})`
        );
        soll(
            F.fluchtMittel !== null && F.fluchtMittel >= 0.8,
            `Verband zerfällt auf der Flucht: im Mittel ${F.fluchtMittel} der ${F.n} Glieder binnen ${FR} Paar-Räumen vom Mittel, solange die Herde flieht (Soll ≥ 0,8; am wenigsten ${F.fluchtMin}, Wurf ${F.wurfAnteil})`
        );
    }
    if (name === "hindernis") {
        soll(z.strahlenJeTakt === 0, `${z.strahlenJeTakt} Feld-Strahlen je Takt (${z.dichteJeTakt} Dichte-Proben)`);
        soll(z.wandFrames === 0, `${z.wandFrames} Frames in der Wand (der Folger läuft durch den Stein)`);
        soll(z.leibRufe > 0, `der Hüllen-Kontakt liest keinen benannten Leib (_kreaturLeib: ${z.leibRufe} Rufe)`);
        soll(
            z.vornMinM !== null && z.vornMinM > 0,
            `die vordere Leib-Achse (Schnauze) ${z.vornMinM === null ? "ohne Leib" : -z.vornMinM + " m im Stein"}`
        );
    }
    if (name === "gedreht") {
        soll(z.kontaktFrames > 0, `kein Kontakt am gedrehten Haus (Probe vakuös)`);
        soll(
            z.wandFrames === 0 && z.querDurch === 0,
            `${z.wandFrames} Frames in der gedrehten Wand, ${z.querDurch}× quer hindurch (der Folger läuft durch das Haus)`
        );
        soll(
            z.vornMinM !== null && z.vornMinM > 0,
            `die vordere Leib-Achse ${z.vornMinM === null ? "ohne Leib" : -z.vornMinM + " m in der gedrehten Wand"}`
        );
        soll(
            z.spielerWand === 0,
            `${z.spielerWand} Takte des Tiers schrieben die Parkour-Wand des Spielers (state._wandKontakt*)`
        );
    }
    if (name === "nacht") {
        soll(z.ruhFrames >= 300, `nur ${z.ruhFrames} Ruhe-Frames (Probe vakuös)`);
        soll(
            z.bewegtAnteil !== null && z.bewegtAnteil < 0.03,
            `${(z.bewegtAnteil * 100).toFixed(1)} % bewegt während ruhen`
        );
    }
    if (name === "reload") {
        soll(Math.abs(z.hpNach - z.hpVor) < 0.01, `hp vor dem Reload ${z.hpVor}, danach ${z.hpNach} (geheilt)`);
        soll(z.gierFehlerGrad <= 1, `die Gier kehrt ${z.gierFehlerGrad}° daneben zurück`);
    }
    if (name === "peer") {
        soll(z.gierFehlerGrad <= 15, `Sicht-Kopie blickt ${z.gierFehlerGrad}° neben die Laufrichtung`);
        soll(z.gangV > 0.5, `Sicht-Kopie geht nicht (Gang-Tempo ${z.gangV})`);
    }
    if (name === "zufall") {
        soll(z.fehlt.length === 0, `benannte Methode fehlt: ${z.fehlt.join(", ")}`);
        soll(z.methoden > z.benannt, `nur ${z.methoden} Methoden gelesen (die Tier-Klasse fehlt — Probe vakuös)`);
        soll(z.treffer.length === 0, `Math.random im Kreatur-Leben: ${z.treffer.join(", ")}`);
    }
    if (name === "nexus") {
        soll(
            z.koerperWuerfe === 0,
            `der Würfel schreibt ein Körper-Gesetz: ${z.koerperWuerfe} von ${z.wuerfe} Würfen (Gang/Sprung/Größe)`
        );
        const eps = 1e-6;
        soll(
            z.speedNach >= z.speedBand[0] - eps && z.speedNach <= z.speedBand[1] + eps,
            `Lauf-Tempo ${z.speedNach} m/s jenseits des Gesetz-Bands ${z.speedBand.join("–")} (Sprint ${z.sprintNach})`
        );
        soll(
            Math.abs(z.sprintNach - z.sprintSoll) < 1e-3,
            `Sprint ${z.sprintNach} ≠ Tempo × sprintMul ${z.sprintSoll}`
        );
        soll(
            z.sprungNach >= z.sprungBand[0] - eps && z.sprungNach <= z.sprungBand[1] + eps,
            `Sprungkraft ${z.sprungNach} jenseits des Gesetz-Bands ${z.sprungBand.join("–")}`
        );
        soll(z.groessen > 0, "keine Tiere für die Größen-Probe (vakuös)");
        soll(z.ohneAchse === 0, `${z.ohneAchse} von ${z.groessen} Tieren: Skala ohne bodySize-Achse`);
        soll(z.ausserBand === 0, `${z.ausserBand} von ${z.groessen} Tieren: bodySize außerhalb der Größen-Bänder`);
        soll(
            z.tempoNach < z.tempoVor - 1e-6,
            `creatures_speed_mul ohne Leser: der Charakter ${z.tempoVor} → ${z.tempoNach} (der Tempo-Hauch wirkt nicht)`
        );
        soll(
            z.tempoNach >= z.tempoBand[0] - eps && z.tempoHoch <= z.tempoBand[1] + eps,
            `Tempo-Hauch ${z.tempoNach}/${z.tempoHoch} jenseits des Wander-Bands ${z.tempoBand.join("–")}`
        );
        soll(z.geburten > 0, "keine Nexus-Geburt (vakuös)");
        soll(z.geburtImBlick === 0, `${z.geburtImBlick} von ${z.geburten} Nexus-Geburten im Blick`);
        soll(
            z.geburtMinM !== null && z.geburtMinM >= 0.99 * z.fernMin,
            `Nexus-Geburt ${z.geburtMinM} m vor dem Spieler (Soll ≥ ${z.fernMin} m)`
        );
    }
    if (name === "temperament") {
        const SOLL = {
            "wesen@1": "scheu",
            "wolf@1": "wild",
            "baer@1": "wehrhaft",
            "fuchs@1": "scheu",
            "wesen@2.5": "wehrhaft",
            "wolf@0.6": "scheu", // das Jungtier (13,8 kg) unter der Jagd-Grenze 21,5 kg
            "baer@0.7": "sanft",
        };
        const falsch = Object.keys(SOLL).filter((k) => z.art[k] !== SOLL[k]);
        soll(
            falsch.length === 0,
            `Temperament nicht aus Gattung und Größe: ${falsch.map((k) => `${k} ${z.art[k]} (Soll ${SOLL[k]})`).join(", ")}`
        );
        soll(
            z.masseQuelle === true,
            "eine zweite Masse: Temperament oder Beute lesen nicht die EINE Masse des Leibs (_leibMasse)"
        );
        soll(
            z.beute && z.beute.hirsch === true && z.beute.kitz === true && z.beute.baer === false,
            `das Beute-Urteil des Wolfs: Hirsch ${z.beute && z.beute.hirsch}, Kitz ${z.beute && z.beute.kitz}, Bär ${z.beute && z.beute.baer} (Soll true · true · false)`
        );
        soll(
            z.wHirsch >= z.fleeThreshold,
            `Hirsch 6 m vor dem ruhigen Spieler: Wariness ${z.wHirsch} (Soll ≥ ${z.fleeThreshold}, ein Fluchttier)`
        );
        soll(z.wBaer <= z.curiousThreshold, `Bär 6 m vor dem ruhigen Spieler: Wariness ${z.wBaer} (Soll neugierig)`);
        soll(
            z.hirschAbstandM >= 10,
            `die Hirsche stehen nach 10 s ${z.hirschAbstandM} m am Spieler (Soll ≥ 10 m, Flucht)`
        );
        soll(z.baerAbstandM <= 6, `die Bären stehen nach 10 s ${z.baerAbstandM} m am Spieler (Soll ≤ 6 m, Neugier)`);
        for (const [wer, k] of [
            ["Hirsch", z.kampfHirsch],
            ["Bär", z.kampfBaer],
        ])
            soll(
                Math.abs(k.dauer - k.soll) < 0.05,
                `der Kampf liest ein anderes Temperament: ${wer} fürchtet ${k.dauer} s (Soll ${k.soll} s)`
            );
    }
    if (name === "abstand") {
        soll(z.tiere >= 6, "keine neugierige Schar (vakuös)");
        // Der EINE Leib-Löser im Sim-Schritt (`_leibKontakte`): keine Durchdringung überlebt ihn — im Frame steht höchstens,
        // was die beiden Leiber in diesem Frame liefen und wendeten (erbeMaxM: die Tiefe darüber).
        soll(
            z.durchFrames === 0,
            `Durchdringung: in ${z.durchFrames} Takten durchdringen sich zwei Leiber über ihren Frame-Schritt hinaus (tiefste ${-z.minLeibLueckeM} m, geerbt ${z.erbeMaxM} m)`
        );
        soll(
            z.spielerFrames === 0,
            `Leib im Spieler: in ${z.spielerFrames} Takten (tiefste ${-z.minSpielerLueckeM} m)`
        );
        // Der persönliche Raum über die zweite Hälfte des Laufs (je Tier und Takt der nächste Nachbar in Körper-Kugeln):
        // die Schar steht im Mittel mindestens Kugel an Kugel, kaum enger (die Leben-Schau maß 0,33–0,48 bei den Hirschen).
        soll(
            z.nachbarRaumP50 >= 1 && z.nachbarRaumP10 >= 0.85,
            `kein persönlicher Raum: der nächste Nachbar p50 ${z.nachbarRaumP50} / p10 ${z.nachbarRaumP10} der Körper-Kugeln (Soll ≥ 1 / 0,85; zuletzt zwei Mitten ${z.paarMinM} m)`
        );
    }
    if (name === "gestalt") {
        soll(z.glieder > 0 && z.kapseln > 0, "der Wolf trägt keine Treffer-Kapseln (vakuös)");
        soll(z.fehlt.length === 0, `die Passung zerlegt den Wolf je Tier anders: ${z.fehlt.join(", ")}`);
        soll(
            z.maxAbw === 0,
            `die Treffer-Gestalt hängt am ersten Tier: die Kapsel ${z.glied} weicht ${z.maxAbw} ab (gepasst in Lage, Pose und Größe des Tiers statt in der Ruhe seiner Gattung)`
        );
        soll(z.gehalten === true, "die Passung verstellt die laufende Pose des Tiers");
    }
    if (name === "jagdkreis") {
        const b = z.sprinter;
        soll(
            b.abstandEnde < b.abstand0 && b.bisse >= 1,
            `der Sprinter entkommt: Abstand ${b.abstand0} → ${b.abstandEnde} m, ${b.bisse} Bisse (Sprint ${b.sprintMs} m/s, Wolf ${b.wolfSprintMs} m/s)`
        );
        const R = z.riss;
        soll(
            R.rissS !== null,
            `kein Riss: das Rudel fällt den gesunden Hirsch (${R.hp0} HP) an keinem der ${R.zeiten.length} Orte in ${R.fensterS} s`
        );
        const erst = Math.min(...R.zeiten.filter((x) => x !== null));
        soll(
            !(erst < 60),
            `Beute ohne Leben: der erste Riss nach ${erst} s (ein gesunder Hirsch trägt ~20 Bisse, Tiere K2)`
        );
        if (R.rissS !== null) {
            soll(R.fleisch0 > 0, "kein Kadaver: der gerissene Leib trägt kein Fleisch (_kreaturFaellt)");
            soll(
                R.fleischEnde !== null && R.fleischEnde < R.fleisch0,
                `Fressen verbraucht den Kadaver nicht: Fleisch ${R.fleisch0} → ${R.fleischEnde} kg in 120 s nach dem Riss bei ${R.rissS} s`
            );
            for (const G of R.gaeste)
                soll(
                    G.frissS > 0,
                    `kein Geruch: der ${G.seele} folgt dem Kadaver nicht (${G.d0} → nächst ${G.dMin} m, frisst ${G.frissS} s)`
                );
        }
    }
    if (name === "rudel") {
        soll(z.nahTakte >= 60, `das Rudel kommt nicht heran (${z.nahTakte} Takte nah, vakuös)`);
        soll(
            z.lueckeP50 !== null && z.lueckeP50 <= 180,
            `das Rudel umstellt nicht: größte Lücke p50 ${z.lueckeP50}° (Soll ≤ 180°)`
        );
        soll(
            z.lueckeBeimBiss !== null && z.lueckeBeimBiss <= 180,
            `das Rudel umstellt nicht: beim ersten Biss ${z.lueckeBeimBiss}° Lücke`
        );
    }
    if (name === "sockel") {
        soll(z.ueberTakte >= 30, `der Hirsch kommt nicht über den Sockel (${z.ueberTakte} Takte, vakuös)`);
        soll(
            z.imSockelTakte === 0,
            `das Tier steht im Sockel: ${z.imSockelTakte} von ${z.ueberTakte} Takten über ihm, bis ${z.tiefMaxM} m tief (Oberkante ${z.oberkanteUeberBodenM} m über dem Boden)`
        );
    }
    if (name === "ferngang") {
        for (const [zone, Z] of [
            ["Grobstufen-Zone 45–60 m", z.grobstufe],
            ["Kapsel-Zone 70–90 m", z.kapsel],
        ]) {
            soll(Z.laufTakte >= 200, `${zone}: nur ${Z.laufTakte} laufende Takte (die Probe braucht ≥ 200)`);
            soll(
                Z.gleitAnteil !== null && Z.gleitAnteil <= 0.05,
                `ferner Gang gleitet: ${zone} ${Z.gleitTakte} von ${Z.laufTakte} laufenden Takten ohne Beinschlag (Soll ≤ 5 %; die Grobstufe trug ${Z.fernBild})`
            );
        }
    }
    if (name === "querhang") {
        // ZWEI ORTE (K16-Q): der Hang, den die Welt nahe dem Spieler trägt, UND die feste Rampe der Prüfbühne (z.rampe, der
        // Lauf auf der Bühne) — das Urteil hängt nie am Zufall der Welt; fehlt die Rampe, ist die Probe nicht gemessen
        const orte = [["am Querhang", z]];
        if (!z.rampe) soll(false, "die Rampe der Prüfbühne ist nicht gemessen (der Querhang hängt am Zufall der Welt)");
        else if (z.rampe.fehler) soll(false, z.rampe.fehler);
        else orte.push([`an der Rampe ${z.rampe.ort}`, z.rampe]);
        for (const [wo, Z] of orte)
            for (const [wer, a] of [
                ["Wolf", Z.stand.wolf],
                ["Hirsch", Z.stand.hirsch],
            ])
                soll(
                    a.lotMaxGrad <= 10,
                    `Bein-Lot ${wo} (${Z.hangGrad}°): ${wer} ${a.lotMaxGrad}° (Soll ≤ 10°; der Leib rollt ${a.rollGrad}°)`
                );
        for (const [wo, Z] of orte)
            for (const [wer, sl] of [
                ["Wolf", Z.schlupf.wolf],
                ["Hirsch", Z.schlupf.hirsch],
            ])
                soll(
                    sl !== null && sl <= 0.05,
                    `Stand-Schlupf ${wo} (${Z.hangGrad}°): ${wer} ${sl} (Soll ≤ 0,05, Ratsche K07)`
                );
    }
    return { ok: f.length === 0, grund: f.join(" · ") };
}

// DIE TÄTER des Selbsttests: je Probe jeder alte Defekt, den sie trägt, und das Wort, an dem das Urteil ihn beim Namen
// nennt — rot aus dem falschen Grund ist blind für den richtigen.
const TAETER = {
    geister: [["geister", /Geister/]],
    geburt: [
        ["geburt", /vor dem Spieler/],
        ["geburt-einzeln", /keine Gruppe/],
    ],
    sattel: [["sattel", /mountedArch/]],
    reload: [["reload", /geheilt|Gier/]],
    huepfer: [
        ["huepfer", /ohne Aktion|Luft-Anteil/],
        ["huepfer-zwilling", /neben dem Sprung-Gesetz/],
    ],
    wachsen: [["wachsen", /Skala/]],
    gier: [
        ["gier", /Lauf ↔ Blick|rückwärts/],
        ["gier-folgen", /Gas ↔ Bremse/],
    ],
    jagd: [
        ["jagd", /Achsen/],
        ["jagd-ziel", /Achsen/],
        ["jagd-flucht", /Beute fort/],
    ],
    herde: [
        ["herde", /am Blick/],
        ["herde-artfremd", /fremder Verband verschmilzt/],
        // S6: der Wurf ohne Bindung (jedes Glied für sich geboren) — der Verband zerfällt beim Wandern UND auf der Flucht
        ["herde-zerfall", /Verband zerfällt beim Wandern[\s\S]*Verband zerfällt auf der Flucht/],
    ],
    hindernis: [
        ["hindernis", /Feld-Strahlen/],
        ["hindernis-leib", /benannten Leib/],
    ],
    gedreht: [
        ["gedreht-kontakt", /Parkour-Wand des Spielers/],
        ["gedreht-rahmen", /gedrehten Wand/],
    ],
    nacht: [["nacht", /bewegt während ruhen/]],
    peer: [["peer", /Sicht-Kopie/]],
    zufall: [["zufall", /Math\.random im Kreatur-Leben: _pickCreatureName/]],
    nexus: [
        ["nexus-wuerfel", /der Würfel schreibt ein Körper-Gesetz/],
        ["nexus-gesetz", /jenseits des Gesetz-Bands/],
        ["nexus-groesse", /Skala ohne bodySize-Achse/],
        ["nexus-geburt", /Nexus-Geburten im Blick|Nexus-Geburt .* vor dem Spieler/],
    ],
    temperament: [
        ["temperament", /Temperament nicht aus Gattung und Größe/],
        ["temperament-masse", /eine zweite Masse/],
    ],
    abstand: [
        ["abstand", /Durchdringung|kein persönlicher Raum/],
        ["abstand-spieler", /Leib im Spieler/],
    ],
    jagdkreis: [
        ["jagd-gradient", /kein Riss/],
        ["jagd-schritt", /Sprinter entkommt/],
        ["jagd-aas", /kein Kadaver/],
        ["jagd-duft", /kein Geruch/],
        ["jagd-hp", /Beute ohne Leben/],
    ],
    rudel: [["rudel", /umstellt nicht/]],
    sockel: [["sockel", /steht im Sockel/]],
    // je Täter nennen BEIDE Orte ihn: der Hang der Welt und die Rampe der Prüfbühne
    querhang: [
        ["querhang", /Bein-Lot am Querhang[\s\S]*Bein-Lot an der Rampe/],
        ["querhang-gleiten", /Stand-Schlupf am Querhang[\s\S]*Stand-Schlupf an der Rampe/],
    ],
    ferngang: [
        ["ferngang", /ferner Gang gleitet/],
        ["ferngang-bindung", /ferner Gang gleitet: Grobstufen-Zone/],
    ],
    gestalt: [["gestalt", /hängt am ersten Tier/]],
    tiersatz: [
        ["tiersatz-kopf", /hängen an der Kopfzahl/],
        ["tiersatz-gleiten", /der Satz gleitet/],
        ["tiersatz-blick", /Satz außer Blick/],
        ["tiersatz-schreiben", /schreibt ohne Änderung/],
        ["tiersatz-kopie", /Sicht-Kopien zeichnen als Leib/],
    ],
    bewohner: [
        ["bewohner-haus", /Haus ohne Bewohner/],
        ["bewohner-menge", /Leiber als Leib gezeichnet/],
        ["bewohner-plan6", /Soll-Orte über 24 Spielstunden/],
        ["bewohner-sprung", /Sprung im Nahbereich/],
        ["bewohner-wand", /Durchdringung: [1-9]/],
        ["bewohner-quer", /Durchdringung: [1-9]\d* Takte[^)]*#4242/],
        ["bewohner-gleiten", /der Satz gleitet/],
        ["bewohner-nord", /der Blick der Stehenden/],
        ["bewohner-daheim", /ohne Platz/],
    ],
};

module.exports = { KREATUR_PROBEN_SRC: kreaturProben.toString(), PROBEN, TAETER, urteil };
