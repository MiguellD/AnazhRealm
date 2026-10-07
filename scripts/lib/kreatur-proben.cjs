// kreatur-proben.cjs — DIE KREATUR-PROBEN (Welle L, Leben-Prüfung 06.10.): jede Probe ruft den ECHTEN Kreatur-Takt
// (`updateCreatures`, der EINE Chokepoint) und misst, was das Fenster der Leben-Prüfung zeigte — Krebsgang, Hüpf-Sturm,
// Geister, Geburt im Blick, Beute ohne Flucht, Bewegung am Frustum, Strahl je Frame. Derselbe Seiten-Code läuft headless
// (gate:kreatur-takt, Null-Renderer, Produktions-Boot) und im sichtbaren Fenster der echten GPU (die Werkbank:
// `node scripts/diag-kreatur-takt.cjs --werkbank <port>`); dort ruht der Spiel-Loop (Lehre 17, die Werkbank-Regel). Gestubbt
// wird nichts: die Selbsttests spielen den alten Defekt als Täter ein (`taeter`) und erwarten Rot.
//
// Die Proben (Klasse der Synthese in Klammern):
//   geister   (Q12) clearCreatures lässt kein Tier als Geist in der Szene
//   geburt    (Q12) die natürliche Geburt liegt fern (≥ CREATURE_SPAWN_FAR_MIN) und außerhalb des Blicks
//   sattel    (Q12) der Tod im Sattel steigt ab (mountedArch = null)
//   huepfer   (Q1/Q2) Luft-Anteil < 3 %, jeder Sprung aus einer Aktion über das EINE Sprung-Gesetz (creatureJump), der
//             Scheitel ist das Freude-Gesetz (froh hopHochM, sonst hopBasisM), Flugzeit gleich bei 30 und 144 Hz
//   wachsen   (Q2) die Skala nach 3600 Wachstums-Takten = 1,000
//   gier      (Q3) Lauf ↔ Blick p90 ≤ 20°, 0 Rückwärts-Frames, Stand-Schlupf quer ≤ 0,2, Beschleunigung im Gesetz,
//             Folgen ohne Gas ↔ Bremse (≤ 30 Wechsel je Minute, R-D17)
//   jagd      (Q3/Q11) Witterungs-Jagd < 10 % Achs-Frames (0,25°, im freien Lauf), die Beute läuft vom Jäger fort (> 80 %)
//   herde     (Q11) Kohäsion je Gattung (herdeZug zählt gleichartige Nachbarn, n > 0; der Fuchs zieht den Hirsch nicht),
//             Bewegung gleich mit und ohne Blick (Frustum + Zufall)
//   hindernis (Q11) kein Feld-Strahl je Tier und Takt, kein Tier in der Wand; der Kontakt liest den EINEN Leib des Tiers
//             (_kreaturLeib, D2), seine vordere Achse bleibt vor dem Stein
//   nacht     (Q11) die Ruhe-Aktion hält den Leib an (Kritik §2.3: 81 % bewegt während ruhen)
//   reload    (Q12) ein verwundetes Tier kehrt verwundet und mit seiner Gier zurück (Kritik §2.5: hp heilte)
//   peer      (Q3) die Sicht-Kopie beim Mitspieler dreht in die Laufrichtung und geht
//   zufall    (Q2) kein Math.random im Kreatur-Leben (window.__codeOf über jede Tier-Methode + die benannten Wurf-Stellen)
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
        }
    };
    // Ein Ort auf Land (nicht im Wasser), relativ zum Spieler.
    const land = (dx, dz) => {
        for (let k = 0; k < 40; k++) {
            const x = P0.x + dx + (k % 8) * 3,
                z = P0.z + dz + Math.floor(k / 8) * 3;
            if (!r._isAboveWaterAt || r._isAboveWaterAt(x, z)) {
                const h = r.getTerrainHeightAt(x, z);
                return { x, y: (Number.isFinite(h) ? h : 0) + 0.5, z };
            }
        }
        return { x: P0.x + dx, y: P0.y, z: P0.z + dz };
    };
    // Ein Ort auf Land ohne Bauwerks-Hülle im Umkreis R — die Witterungs-Jagd im Freien: an einer Wand gleitet ein Leib
    // längs der Box-Kante (achsparallel), das misst die Hindernis-Probe, nicht die Richtung der Jagd.
    const frei = (dx, dz, R) => {
        const arches = s.architectures || [];
        for (let ring = 0; ring < 40; ring++) {
            const n = Math.max(1, ring * 6);
            for (let q = 0; q < n; q++) {
                const a = (q / n) * Math.PI * 2;
                const x = P0.x + dx + Math.cos(a) * ring * 8,
                    z = P0.z + dz + Math.sin(a) * ring * 8;
                if (r._isAboveWaterAt && !r._isAboveWaterAt(x, z)) continue;
                let ok = true;
                for (const e of arches) {
                    if (!e || !e.blockerAABBs || !e.position) continue;
                    const rr = R + (e._blockerReach || 0);
                    if (Math.abs(e.position.x - x) < rr && Math.abs(e.position.z - z) < rr) {
                        ok = false;
                        break;
                    }
                }
                if (ok) {
                    const h = r.getTerrainHeightAt(x, z);
                    return { x, y: (Number.isFinite(h) ? h : 0) + 0.5, z };
                }
            }
        }
        return null;
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
    const takt = (dt) => r.updateCreatures(dt);
    // Der Wand-Kontakt je Takt — instrumentiert, nicht gestubbt: der Hüllen-Kontakt des Tiers läuft unverändert, die Linse
    // merkt nur, wessen Lage er schob. Freier Lauf und Anprall werden getrennt gezählt (an einer Box-Kante gleitet ein Leib
    // achsparallel, der Anprall an der Wand ist kein Gas-oder-Bremse). Die Basis kennt den Kontakt nicht: dort bleibt die
    // Menge leer und jeder Takt zählt als freier Lauf.
    const kontaktZaehler = (restore) => {
        const geschoben = new Set();
        if (typeof r._kreaturHuellenKontakt !== "function") return geschoben;
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

    // ── geburt (Q12): fern und außerhalb des Blicks ──
    await buehne("geburt", async (restore) => {
        if (taeter === "geburt")
            decke(
                restore,
                "_creatureNaturalBirth",
                () =>
                    function () {
                        const c = this.spawnCreatureAt(pm.x + 15, pm.y, pm.z, "happy", "wesen");
                        return !!c;
                    }
            );
        kamera(1, 0);
        const d = [];
        let blick = 0;
        for (let k = 0; k < 12; k++) {
            const vor = s.creatures.length;
            r._creatureNaturalBirth();
            if (s.creatures.length !== vor + 1) continue;
            const c = s.creatures[s.creatures.length - 1];
            d.push(Math.hypot(c.position.x - pm.x, c.position.z - pm.z));
            if (imBlick(c.position.x, c.position.y + 0.5, c.position.z)) blick++;
            r.removeCreature(c);
        }
        return {
            geburten: d.length,
            minM: d.length ? +Math.min(...d).toFixed(1) : null,
            maxM: d.length ? +Math.max(...d).toFixed(1) : null,
            imBlick: blick,
            fernMin: A.CREATURE_SPAWN_FAR_MIN,
        };
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
        const altUhr = s.creatureAnimationTime;
        restore.push(() => {
            s.creatureAnimationTime = altUhr;
        });
        s.creatureAnimationTime = 100;
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
        const start = land(0, 0);
        pm.set(start.x, start.y, start.z);
        const tiere = arten.map((a, i) => {
            const c = tier({ x: pm.x - 4 - i * 2, y: pm.y, z: pm.z - 3 }, a);
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
        if (taeter === "jagd")
            decke(
                restore,
                "_creatureScentHuntDir",
                (alt) =>
                    function (c, w) {
                        const d = alt.call(this, c, w);
                        if (d) {
                            if (Math.abs(d.x) > Math.abs(d.z)) d.set(Math.sign(d.x), 0, 0);
                            else d.set(0, 0, Math.sign(d.z));
                        }
                        return d;
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
        let jagdFrames = 0,
            kontakt = 0,
            achs = 0,
            achs5 = 0,
            bedroht = 0,
            fort = 0;
        let wv = { x: wolf.position.x, z: wolf.position.z };
        const bv = beute.map((c) => ({ x: c.position.x, z: c.position.z }));
        for (let k = 0; k < 1800; k++) {
            takt(dt);
            const dx = wolf.position.x - wv.x,
                dz = wolf.position.z - wv.z;
            const jagt = wolf.userData._motionZustand === "jagd";
            const anprall = geschoben.has(wolf.position);
            geschoben.clear();
            if (jagt && anprall) kontakt++;
            if (jagt && !anprall && Math.hypot(dx, dz) / dt > 0.3) {
                jagdFrames++;
                const h = Math.atan2(dx, dz);
                let m = Infinity;
                for (let q = 0; q < 4; q++) m = Math.min(m, Math.abs(wrap(h - (q * Math.PI) / 2)));
                // Die Achsen-Signatur ist die QUANTISIERUNG: das Argmax aus vier Proben setzte die Richtung exakt auf eine
                // Himmelsachse, der Lauf lag auf ihr (Basis: 100 % auf 0,25° genau). Ein stetiger Gradient trifft das
                // 0,5°-Fenster je Achse zufällig in ~0,6 % der Takte; nahe einer Achse liegt er nur, wenn der Wind dort
                // weht (die Fahne des Geruchs) — darum zählt das enge Fenster, das 5°-Fenster steht als Zahl daneben.
                if (grad(m) < 0.25) achs++;
                if (grad(m) < 5) achs5++;
            }
            beute.forEach((c, i) => {
                const vx = c.position.x - bv[i].x,
                    vz = c.position.z - bv[i].z;
                const rx = bv[i].x - wv.x,
                    rz = bv[i].z - wv.z;
                const d = Math.hypot(rx, rz);
                if (jagt && d < NAT.noticeRadius && Math.hypot(vx, vz) / dt > 0.3) {
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
            achsAnteil: jagdFrames ? +(achs / jagdFrames).toFixed(3) : null,
            achsAnteil5Grad: jagdFrames ? +(achs5 / jagdFrames).toFixed(3) : null,
            bedrohtFrames: bedroht,
            fortAnteil: bedroht ? +(fort / bedroht).toFixed(3) : null,
            bisse: beute.filter((c) => c.userData.hp < 9999).length,
        };
    });

    // ── herde (Q11): Kohäsion je Gattung, und die Bewegung hängt nie am Blick ──
    await buehne("herde", async (restore) => {
        r.setGameMode("frieden");
        if (s.player.emotions)
            Object.assign(s.player.emotions, { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0.9, chaos: 0 });
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
        // Die Herden-Form des Kerns (herdeZug), instrumentiert und durchgereicht: zählt sie gleichartige Nachbarn (n > 0)?
        // Ohne diesen Nachweis wäre „kein artfremder Zug" vakuös (eine Herde, die niemanden zählt, zieht auch niemanden).
        const K = A._steuerGesetz();
        const zugAlt = K.herdeZug;
        let gleichartigN = 0,
            zugRufe = 0;
        K.herdeZug = function (x, z, gattung, nachbarn, H, out) {
            // R-D5 artfremd: die Herde zählt jeden Nachbarn, gleich welcher Gattung (der Fuchs zieht den Hirsch)
            if (taeter === "herde-artfremd") for (const e of nachbarn) e.gattung = gattung;
            const o = zugAlt.call(this, x, z, gattung, nachbarn, H, out);
            zugRufe++;
            if (o && o.n > gleichartigN) gleichartigN = o.n;
            return o;
        };
        restore.push(() => {
            K.herdeZug = zugAlt;
        });
        const seq0 = s._creatureNetSeq || 0;
        const altUhr = s.creatureAnimationTime;
        const altAi = r._creatureAiFrame;
        restore.push(() => {
            s.creatureAnimationTime = altUhr;
            r._creatureAiFrame = altAi;
        });
        const lauf = (mitFuchs, blickX, blickZ, fern) => {
            for (const c of s.creatures.slice()) r.removeCreature(c);
            s._creatureNetSeq = seq0;
            s.creatureAnimationTime = 100;
            r._creatureAiFrame = 0;
            pm.copy(P0);
            kamera(blickX, blickZ);
            const o = fern ? land(58, 6) : land(0, -12);
            const a = tier(o, "wesen");
            const b = tier({ x: o.x + 4, y: o.y, z: o.z }, "wesen");
            const f = mitFuchs ? tier({ x: o.x - 4, y: o.y, z: o.z }, "fuchs") : null;
            const extra = fern
                ? [tier({ x: o.x, y: o.y, z: o.z + 5 }, "baer"), tier({ x: o.x + 3, y: o.y, z: o.z - 6 }, "fuchs")]
                : [];
            for (const c of [a, b, f, ...extra])
                if (c) c.userData.emotions = { joy: 0.2, awe: 0, sorrow: 0, hope: 0.1, peace: 0.15, chaos: 0 };
            const n = fern ? 240 : 30;
            for (let k = 0; k < n; k++) takt(1 / 60);
            return s.creatures.map((c) => ({ x: c.position.x, z: c.position.z }));
        };
        const mit = lauf(true, 0, -1, false);
        const ohne = lauf(false, 0, -1, false);
        const artDiff = Math.hypot(mit[0].x - ohne[0].x, mit[0].z - ohne[0].z);
        const blick = lauf(true, 1, 0, true);
        const weg = lauf(true, -1, 0, true);
        let blickDiff = 0;
        for (let i = 0; i < blick.length; i++)
            blickDiff = Math.max(blickDiff, Math.hypot(blick[i].x - weg[i].x, blick[i].z - weg[i].z));
        return { artFremdZugM: +artDiff.toFixed(4), blickDiffM: +blickDiff.toFixed(4), gleichartigN, zugRufe };
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
        let leibRufe = 0;
        const leibVon = typeof A.prototype._kreaturLeib === "function" ? A.prototype._kreaturLeib : null;
        if (typeof r._kreaturLeib === "function")
            decke(
                restore,
                "_kreaturLeib",
                (alt) =>
                    function (...a) {
                        leibRufe++;
                        return alt.apply(this, a);
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
        const code = window.__codeOf;
        if (typeof code !== "function") return { fehler: "window.__codeOf fehlt (der Kommentar-Stripper der Linse)" };
        const namen = new Set(BENANNT);
        for (const n of Object.getOwnPropertyNames(A.prototype))
            if (/creature|kreatur|fauna|^_?tier|Tier/i.test(n) && typeof A.prototype[n] === "function") namen.add(n);
        const fehlt = [];
        const treffer = [];
        for (const n of namen) {
            const f = r[n];
            if (typeof f !== "function") fehlt.push(n);
            else if (/Math\.random\s*\(/.test(code(f))) treffer.push(n);
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
        // innerhalb der Standbild-Schwelle der Welt-Tiere (TIER_FERN_DIST 35 m): dort geht auch ein Welt-Tier
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
    "nacht",
    "peer",
    "zufall",
];
function urteil(name, z) {
    if (!z) return { ok: false, grund: "keine Zahl" };
    if (z.fehler) return { ok: false, grund: z.fehler };
    const f = [];
    const soll = (bed, text) => {
        if (!bed) f.push(text);
    };
    if (name === "geister") soll(z.geister === 0, `${z.geister} Geister nach clearCreatures (aus ${z.vorher})`);
    if (name === "geburt") {
        soll(z.geburten >= 10, `nur ${z.geburten} Geburten`);
        soll(z.minM >= 0.99 * z.fernMin, `Geburt ${z.minM} m vor dem Spieler (Soll ≥ ${z.fernMin} m)`);
        soll(z.imBlick === 0, `${z.imBlick} Geburten im Blick`);
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
            `Jagd auf den Achsen (0,25°) ${(z.achsAnteil * 100).toFixed(1)} % (5°: ${(z.achsAnteil5Grad * 100).toFixed(1)} %)`
        );
        soll(z.bedrohtFrames >= 60, `nur ${z.bedrohtFrames} bedrohte Beute-Frames`);
        soll(z.fortAnteil !== null && z.fortAnteil > 0.8, `Beute fort vom Jäger ${z.fortAnteil} (Soll > 0,8)`);
    }
    if (name === "herde") {
        soll(z.artFremdZugM < 0.01, `der Fuchs zieht den Hirsch ${z.artFremdZugM} m (Kohäsion artfremd)`);
        soll(
            z.gleichartigN > 0,
            `herdeZug zählt keinen gleichartigen Nachbarn (n = ${z.gleichartigN} in ${z.zugRufe} Rufen — Probe vakuös)`
        );
        soll(z.blickDiffM < 1e-6, `Bewegung hängt am Blick: ${z.blickDiffM} m Unterschied`);
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
    if (name === "nacht") {
        soll(z.ruhFrames >= 300, `nur ${z.ruhFrames} Ruhe-Frames (Probe vakuös)`);
        soll(z.bewegtAnteil !== null && z.bewegtAnteil < 0.03, `${(z.bewegtAnteil * 100).toFixed(1)} % bewegt während ruhen`);
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
    return { ok: f.length === 0, grund: f.join(" · ") };
}

// DIE TÄTER des Selbsttests: je Probe jeder alte Defekt, den sie trägt, und das Wort, an dem das Urteil ihn beim Namen
// nennt — rot aus dem falschen Grund ist blind für den richtigen.
const TAETER = {
    geister: [["geister", /Geister/]],
    geburt: [["geburt", /Geburt/]],
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
        ["jagd-flucht", /Beute fort/],
    ],
    herde: [
        ["herde", /am Blick/],
        ["herde-artfremd", /Kohäsion artfremd/],
    ],
    hindernis: [
        ["hindernis", /Feld-Strahlen/],
        ["hindernis-leib", /benannten Leib/],
    ],
    nacht: [["nacht", /bewegt während ruhen/]],
    peer: [["peer", /Sicht-Kopie/]],
    zufall: [["zufall", /Math\.random im Kreatur-Leben: _pickCreatureName/]],
};

// Der Kommentar-Stripper der Absenz-Proben — dieselbe Quelle wie window.__codeOf im Playtest-Harness (Kommentare
// zitieren gefallenen Code; eine Absenz-Probe liest nie ein Zitat).
const CODE_OF_SRC = String((fnOrSrc) =>
    String(fnOrSrc)
        .replace(/\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
);

module.exports = { KREATUR_PROBEN_SRC: kreaturProben.toString(), PROBEN, TAETER, CODE_OF_SRC, urteil };
