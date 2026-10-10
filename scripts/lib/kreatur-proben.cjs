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
//   herde     (Q11) Kohäsion je Gattung (herdeZug zählt gleichartige Nachbarn, n > 0; der Fuchs zieht den Bären nicht),
//             Bewegung gleich mit und ohne Blick (Frustum + Zufall)
//   hindernis (Q11) kein Feld-Strahl je Tier und Takt, kein Tier in der Wand; der Kontakt liest den EINEN Leib des Tiers
//             (_kreaturLeib, D2), seine vordere Achse bleibt vor dem Stein
//   gedreht   (D5) das Tier am GEDREHTEN Haus: die Haus-Hülle ist eine gedrehte Box (obb); der Leib löst im Rahmen der
//             Box (Innen-Test, Reichweite, Kontakt), läuft nicht hindurch und schreibt nie die Parkour-Wand des Spielers
//   nacht     (Q11) die Ruhe-Aktion hält den Leib an (Kritik §2.3: 81 % bewegt während ruhen)
//   reload    (Q12) ein verwundetes Tier kehrt verwundet und mit seiner Gier zurück (Kritik §2.5: hp heilte)
//   peer      (Q3) die Sicht-Kopie beim Mitspieler dreht in die Laufrichtung und geht
//   zufall    (Q2) kein Math.random im Kreatur-Leben (window.__codeOf über jede Tier-Methode + die benannten Wurf-Stellen)
//   querhang  (Welle LF) am Hang von 20–30°: das Bein-Lot ≤ 10° bei rollendem Leib, der Stand-Schlupf im Lauf ≤ 0,2
//             (eine Sohle höchstens 3 cm über dem Boden unter ihr steht; ihr Weg je Weg des Leibs)
//   ferngang  (Welle LF) laufende Hirsche in der Standbild-Zone (45–60 m) und der Kapsel-Zone (70–90 m) bewegen die Beine
//             in ≥ 95 % der laufenden Takte (nie das Standbild, nie eingefrorene Knochen)
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
    // DER TAKT WIE IM SPIEL: erst der feste Sim-Schritt der Leiber (`_stepFixedSim`: der gestoßene Leib
    // `_kreaturStossSchritt` und LEIB AN LEIB `_leibKontakte`), dann der Frame-Takt der Tiere (`updateCreatures`) — die
    // Folge von `_gameLoopTick` (`_loopFixedStep` vor `_loopWeatherAndGrowth`). Gemessen wird, was der Frame zeigt.
    const takt = (dt) => {
        r._kreaturStossSchritt(dt);
        r._leibKontakte();
        r.updateCreatures(dt);
    };
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
        // DER EINE LEIB-LÖSER im Sim-Schritt (`_leibKontakte`): ein Leib, den er aus einem anderen oder aus dem Spieler
        // schiebt, prallt — derselbe Anprall wie an der Wand.
        if (typeof r._leibKontakte === "function")
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
        let jagdFrames = 0,
            kontakt = 0,
            achs = 0,
            achs5 = 0,
            achsWasser = 0,
            bedroht = 0,
            fort = 0;
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
            if (jagt && !anprall && Math.hypot(dx, dz) / dt > 0.3) {
                jagdFrames++;
                const h = Math.atan2(dx, dz);
                let m = Infinity;
                for (let q = 0; q < 4; q++) m = Math.min(m, Math.abs(wrap(h - (q * Math.PI) / 2)));
                // Die Achsen-Signatur ist die QUANTISIERUNG: das Argmax aus vier Proben setzte die Richtung exakt auf eine
                // Himmelsachse, der Lauf lag auf ihr (Basis: 100 % auf 0,25° genau). Ein stetiger Gradient trifft das
                // 0,5°-Fenster je Achse zufällig in ~0,6 % der Takte; nahe einer Achse liegt er nur, wenn der Wind dort
                // weht (die Fahne des Geruchs) — darum zählt das enge Fenster, das 5°-Fenster steht als Zahl daneben.
                if (grad(m) < 0.25) {
                    achs++;
                    // der Ort des Achsen-Takts (Bericht): im Wasser drückt die Ufer-Scheu den Leib entlang einer Himmelsachse
                    // (_creatureWaterContextAt: shoreDir ist kardinal) — eine zweite Quelle der Rasterung neben dem Jagd-Weg
                    if (r._creatureWaterContextAt(wolf, r._creatureGroundY(wolf)).inWater) achsWasser++;
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
            achsAnteil: jagdFrames ? +(achs / jagdFrames).toFixed(3) : null,
            achsAnteil5Grad: jagdFrames ? +(achs5 / jagdFrames).toFixed(3) : null,
            achsImWasser: achsWasser,
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
        K.herdeZug = function (x, z, gattung, nachbarn, H, out, ...rest) {
            // R-D5 artfremd: die Herde zählt jeden Nachbarn, gleich welcher Gattung (der Fuchs zieht den Bären)
            if (taeter === "herde-artfremd") for (const e of nachbarn) e.gattung = gattung;
            const o = zugAlt.call(this, x, z, gattung, nachbarn, H, out, ...rest);
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
            // Die neugierige Schar: das Temperament der Gattung (Welle LF) macht den Hirsch scheu (er kommt nie heran),
            // der wehrhafte Bär tritt neugierig zum ruhigen Spieler — an ihm lebt die Kohäsion des Neugier-Zweigs.
            const o = fern ? land(58, 6) : land(0, -12);
            const a = tier(o, "baer", 1);
            const b = tier({ x: o.x + 4, y: o.y, z: o.z }, "baer", 1);
            const f = mitFuchs ? tier({ x: o.x - 4, y: o.y, z: o.z }, "fuchs") : null;
            const extra = fern
                ? [tier({ x: o.x, y: o.y, z: o.z + 5 }, "wesen"), tier({ x: o.x + 3, y: o.y, z: o.z - 6 }, "fuchs")]
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
        // gezählt werden nur die Rufe AUS dem Hüllen-Kontakt (der Leib-Löser der Welle LF liest den Leib auch)
        let leibRufe = 0,
            imKontakt = 0;
        const leibVon = typeof A.prototype._kreaturLeib === "function" ? A.prototype._kreaturLeib : null;
        if (typeof r._kreaturLeib === "function")
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
        r._hausHuelleSetzen(e, { stufe: 0, boxen: [-4, -3, -0.4, 4, 2.5, 0.4] });
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
        const leibVon = typeof A.prototype._kreaturLeib === "function" ? A.prototype._kreaturLeib : null;
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

    // ── nexus (Leben-Schau 07.10. Neu 1): kein Würfel schreibt ein Körper-Gesetz. Der Nexus würfelte dem Spieler Gehen
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

    // ── temperament (D16 / K-D12, Leben-Schau 07.10.): das Temperament aus der Gattungs- und Größen-Achse (Lehre 8: die
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
        const code = window.__codeOf;
        const masseQuelle =
            typeof code === "function" &&
            /_leibMasse\(/.test(code(r._creatureTemperament)) &&
            /_leibMasse\(/.test(code(r._kreaturIstBeute)) &&
            typeof r._kreaturMasse !== "function";
        const wolfB = tier(land(36, 30), "wolf", 1);
        const beute = {
            hirsch: r._kreaturIstBeute(wolfB, tier(land(36, 34), "wesen", 1)),
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
                const c = tier({ x: pm.x + Math.cos(a) * 6, y: pm.y, z: pm.z + Math.sin(a) * 6 }, seele, 1);
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

    // ── abstand (Leben-Schau 07.10., D5/Neu 2): der persönliche Raum je Leib — die neugierige Schar am ruhigen Spieler im
    // Modus frieden kroch auf 0,7 m zusammen (Paar-Abstand 0,66–0,96 m), die Leiber durchdrangen sich und den Spieler. Der
    // Leib ist die EINE benannte Größe (_kreaturLeib: Achse längs der Gier ± halb, Radius); gemessen je Takt die Lücke
    // zwischen zwei Leibern (Kapsel gegen Kapsel in XZ) und zwischen Leib und Spieler-Kapsel (PLAYER_WALL_RADIUS), am Ende
    // der Abstand der Mitten gegen die Körper-Kugeln (halb + Radius) ──
    await buehne("abstand", async (restore) => {
        r.setGameMode("frieden");
        if (s.player.emotions)
            Object.assign(s.player.emotions, { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0.9, chaos: 0 });
        if (taeter === "abstand") {
            // der alte Zug der Herde: je Nachbar ab 1 m, die Summe (der Körper zählt nicht), keine Kontakt-Lösung
            const K = A._steuerGesetz();
            const alt = K.herdeZug;
            K.herdeZug = function (x, z, gattung, nachbarn, H, out) {
                const o = out || { x: 0, z: 0, n: 0 };
                o.x = 0;
                o.z = 0;
                o.n = 0;
                for (const nb of nachbarn) {
                    if (o.n >= 6 || !nb || nb.gattung !== gattung) continue;
                    const dx = nb.x - x,
                        dz = nb.z - z,
                        dsq = dx * dx + dz * dz;
                    if (!(dsq > 1 && dsq < 25)) continue;
                    const d = Math.sqrt(dsq);
                    o.x += (dx / d) * 0.5;
                    o.z += (dz / d) * 0.5;
                    o.n++;
                }
                return o;
            };
            restore.push(() => {
                K.herdeZug = alt;
            });
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
        for (let k = 0; k < 8; k++) {
            const a = (k / 8) * Math.PI * 2 + 0.2;
            const d = k < 6 ? 7 : 9;
            const c = tier(
                { x: pm.x + Math.cos(a) * d, y: pm.y, z: pm.z + Math.sin(a) * d },
                k < 6 ? "baer" : "wolf",
                1
            );
            ruhig(c);
            tiere.push(c);
        }
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
        // Am Ende: der Abstand der Mitten gegen die Körper-Kugeln (persönlicher Raum), die Schar um den Spieler.
        const S = tiere.map(seg);
        let raumMin = Infinity,
            paarMin = Infinity;
        for (let i = 0; i < tiere.length; i++)
            for (let j = i + 1; j < tiere.length; j++) {
                const d = Math.hypot(
                    tiere[i].position.x - tiere[j].position.x,
                    tiere[i].position.z - tiere[j].position.z
                );
                paarMin = Math.min(paarMin, d);
                raumMin = Math.min(raumMin, d / (S[i].kugel + S[j].kugel));
            }
        const dSp = tiere.map((c) => Math.hypot(c.position.x - pm.x, c.position.z - pm.z));
        return {
            tiere: tiere.length,
            minLeibLueckeM: +minLeib.toFixed(3),
            durchFrames,
            minSpielerLueckeM: +minSpieler.toFixed(3),
            spielerFrames,
            // die Tiefe zweier Leiber über ihrem Frame-Schritt (geerbt) und die Takte mit einer Lücke unter −2 cm (auch frisch)
            erbeMaxM: +erbeMax.toFixed(3),
            ueberFrames,
            paarMinM: +paarMin.toFixed(2),
            raumMin: +raumMin.toFixed(3),
            spielerMinM: +Math.min(...dSp).toFixed(2),
            nachbarRaumP10: +quantil(nnRaum, 0.1).toFixed(3),
            nachbarRaumP50: +quantil(nnRaum, 0.5).toFixed(3),
            spielerMaxM: +Math.max(...dSp).toFixed(2),
            kugelBaerM: +S[0].kugel.toFixed(2),
        };
    });

    // ── jagdkreis (Leben-Schau 07.10., Kampf Neu 3 / D6): der Kreislauf Jäger–Beute schließt sich. Der Witterungs-Jäger
    // stand still (ein Wolf 1200 Takte „jagd", 0,3 m bewegt, 0 Bisse in 3600 Takten) und holte keinen Sprinter ein (der
    // Abstand wuchs von 3,9 auf 34,6 m). Zwei Bühnen am ECHTEN Takt: (A) die Kampf-Schau — Wolf 4 m neben einem Hirsch, der
    // Spieler 40 m fern, 3600 Takte: der Wolf läuft (Tempo in seinen Jagd-Takten), zur Beute hin (Anteil der Takte, deren
    // Weg auf die Beute zeigt), und beißt; (B) der Sprinter — der Spieler sprintet (state.sprintSpeed) geradeaus, der Wolf
    // startet 6 m hinter ihm: der Abstand schrumpft, ein Biss trifft ──
    await buehne("jagdkreis", async (restore) => {
        r.setGameMode("pfad");
        const altUhr = s.creatureAnimationTime,
            altAi = r._creatureAiFrame;
        restore.push(() => {
            s.creatureAnimationTime = altUhr;
            r._creatureAiFrame = altAi;
        });
        s.creatureAnimationTime = 100;
        r._creatureAiFrame = 0;
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
        // (A) die Kampf-Schau
        const o = frei(50, 50, 25) || land(50, 50);
        pm.set(o.x + 40, pm.y, o.z);
        const hirsch = tier({ x: o.x, y: o.y, z: o.z }, "wesen", 1);
        const wolf = tier({ x: o.x - 4, y: o.y, z: o.z + 1 }, "wolf", 1);
        ruhig(hirsch);
        ruhig(wolf);
        hirsch.userData.hp = 1e6;
        let bisse = 0;
        decke(
            restore,
            "damageCreature",
            (alt) =>
                function (c, amount, opt) {
                    if (c === hirsch && opt && opt.source === "jagd") bisse++;
                    return alt.call(this, c, amount, opt);
                }
        );
        let jagdT = 0,
            jagdWeg = 0,
            bewegt = 0,
            hin = 0;
        let wx = wolf.position.x,
            wz = wolf.position.z;
        const dt = 1 / 60;
        for (let k = 0; k < 3600; k++) {
            const hx = hirsch.position.x,
                hz = hirsch.position.z;
            ruhigSpieler();
            takt(dt);
            const z = wolf.userData._motionZustand;
            const vx = wolf.position.x - wx,
                vz = wolf.position.z - wz;
            const v = Math.hypot(vx, vz);
            if (z === "jagd" || z === "hetzen") {
                jagdT += dt;
                jagdWeg += v;
                // der Weg ZUR BEUTE zählt nur die Schritte der Jagd auf sie: verliert der Wolf den Hirsch und kommt dem
                // Spieler nah, jagt er ihn (_jagdZiel "spieler") — seit der Biss ein Ansprung ist (Welle LF kampf), springt er
                // ihn an, statt still neben ihm aus der Ferne zu beißen; diese Schritte gehen nicht zum Hirsch
                if (v / dt > 0.3 && wolf.userData._jagdZiel !== "spieler") {
                    bewegt++;
                    if (vx * (hx - wx) + vz * (hz - wz) > 0) hin++;
                }
            }
            wx = wolf.position.x;
            wz = wolf.position.z;
        }
        const A1 = {
            jagdS: +jagdT.toFixed(1),
            tempoMs: jagdT > 0 ? +(jagdWeg / jagdT).toFixed(2) : 0,
            hinAnteil: bewegt ? +(hin / bewegt).toFixed(3) : null,
            bisse,
        };
        for (const c of s.creatures.slice()) r.removeCreature(c);
        // (C) DER KREISLAUF: ein Rudel aus drei Wölfen wittert einen erwachsenen Hirsch (er entkommt einem einzelnen Wolf
        // im Sprint — so soll es sein), und ein einzelner Wolf wittert ein Kitz (bodySize 0,6, langsamer als er): beide
        // Jagden beißen in 60 s.
        const kreis = (woelfeN, hirschGroesse, ox, oz) => {
            // die Kreatur-Uhr und der KI-Takt fest: jede Jagd beginnt im selben Takt, gleich welche Probe vorher lief
            s.creatureAnimationTime = 100;
            r._creatureAiFrame = 0;
            const o3 = frei(ox, oz, 25) || land(ox, oz);
            pm.set(o3.x + 45, pm.y, o3.z + 20);
            const beute = tier({ x: o3.x, y: o3.y, z: o3.z }, "wesen", hirschGroesse);
            ruhig(beute);
            beute.userData.hp = 1e6;
            const ws = [];
            for (let i = 0; i < woelfeN; i++) {
                const a = -0.6 + i * 0.6;
                const w = tier({ x: o3.x - Math.cos(a) * 20, y: o3.y, z: o3.z + Math.sin(a) * 20 }, "wolf", 1);
                ruhig(w);
                ws.push(w);
            }
            let zaehle = 0;
            decke(
                restore,
                "damageCreature",
                (alt) =>
                    function (c, amount, opt) {
                        if (c === beute && opt && opt.source === "jagd") zaehle++;
                        return alt.call(this, c, amount, opt);
                    }
            );
            for (let k = 0; k < 3600; k++) {
                ruhigSpieler();
                takt(dt);
            }
            for (const c of s.creatures.slice()) r.removeCreature(c);
            return zaehle;
        };
        const rudelBisse = kreis(3, 1, -60, -40);
        const kitzBisse = kreis(1, 0.6, 80, -20);
        // (B) der Sprinter: der Spieler läuft im Sprint geradeaus, der Wolf jagt ihn
        const o2 = frei(-50, 60, 30) || land(-50, 60);
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
        const sprint = s.sprintSpeed;
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
            kampfSchau: A1,
            kreislauf: { rudelGegenHirsch: rudelBisse, wolfGegenKitz: kitzBisse },
            sprinter: {
                sprintMs: +sprint.toFixed(2),
                abstand0: +abst0.toFixed(1),
                abstandEnde: +abst1.toFixed(1),
                abstandMin: +abstMin.toFixed(1),
                bisse: spielerBisse,
                wolfSprintMs: +A._steuerGesetz().sprintTempo(r._kreaturHueftL(wolf2)).toFixed(2),
            },
        };
    });

    // ── rudel (Leben-Schau 07.10., Kampf: „Rudel gegen Spieler"): ein Rudel umstellt. Drei Wölfe, die von einer Seite
    // kamen, standen alle in einem Sektor von 72° (größte Lücke im Median 288°, Kampf-Schau; 239° am 06.10.). Gemessen am
    // echten Takt: drei Wölfe in 15 m auf einer Seite des stehenden Spielers (Modus pfad); in jedem Takt, in dem alle drei
    // näher als 2 × jagd.hetzM stehen, die größte Winkel-Lücke ihrer Richtungen um den Spieler, dazu die Lücke beim ersten
    // Biss ──
    await buehne("rudel", async (restore) => {
        r.setGameMode("pfad");
        const altUhr = s.creatureAnimationTime,
            altAi = r._creatureAiFrame;
        restore.push(() => {
            s.creatureAnimationTime = altUhr;
            r._creatureAiFrame = altAi;
        });
        s.creatureAnimationTime = 100;
        r._creatureAiFrame = 0;
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
            const c = tier({ x: pm.x + Math.sin(a) * 11, y: pm.y, z: pm.z + Math.cos(a) * 11 }, "wolf", 1);
            ruhig(c);
            return c;
        });
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

    // ── sockel (Leben-Schau 07.10., D7/Neu 4): das Tier steht auf der Auflage der Bauten wie der Spieler. 5 Hirsche folgten
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
        r._hausHuelleSetzen(e, { stufe: 0, boxen: [-2, unten, -2, 2, oben, 2] });
        if (!Array.isArray(e.blockerAABBs) || !e.blockerAABBs.length) return { fehler: "Sockel ohne Hülle" };
        const box = e.blockerAABBs[0];
        const mx = (box.minX + box.maxX) / 2,
            mz = (box.minZ + box.maxZ) / 2;
        // die Kreatur-Uhr fest (die Aktions-Wahl hasht sie): jeder Lauf sieht dieselben Schritte, gleich welche Probe vorher lief
        const altUhr = s.creatureAnimationTime;
        restore.push(() => {
            s.creatureAnimationTime = altUhr;
        });
        s.creatureAnimationTime = 100;
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

    // ── querhang (Leben-Schau 07.10., D11/D1-Rest): die Beine stehen lotrecht, der Leib rollt — am Querhang standen die
    // Beine 20–31° aus dem Lot (sie kippten mit dem Leib, Bild ls-10), der Stand-Schlupf im Lauf lag bei 0,56–1,27 (Soll
    // ≤ 0,2). Gemessen am echten Takt wie in der Leben-Schau: ein Hang von 20–30° nahe dem Spieler; Wolf und Hirsch stehen
    // QUER zur Fall-Linie (warten, 120 Takte): je Bein der Winkel Hüfte → Pfote gegen das Lot und die Sohle über dem Boden
    // unter ihr; dann folgen beide dem Spieler, der längs der Höhenlinie geht (600 Takte): der Stand-Schlupf — eine Pfote,
    // deren Sohle höchstens 3 cm über dem Boden unter ihr liegt, steht; ihr Weg in solchen Takten je Weg des Leibs ──
    await buehne("querhang", async (restore) => {
        r.setGameMode("frieden");
        const altUhr = s.creatureAnimationTime;
        restore.push(() => {
            s.creatureAnimationTime = altUhr;
        });
        s.creatureAnimationTime = 100;
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
        // der Hang: 20–30° über 6 m eben (die Fall-Linie trägt die Neigung, quer kaum Krümmung), kein Bau und kein Wasser
        let hang = null;
        for (let ring = 1; ring < 70 && !hang; ring++) {
            const n = ring * 8;
            for (let q = 0; q < n && !hang; q++) {
                const a = (q / n) * Math.PI * 2;
                const x = P0.x + Math.cos(a) * ring * 5,
                    z = P0.z + Math.sin(a) * ring * 5;
                if (r._isAboveWaterAt && !r._isAboveWaterAt(x, z)) continue;
                const gx = (h(x + 1.5, z) - h(x - 1.5, z)) / 3,
                    gz = (h(x, z + 1.5) - h(x, z - 1.5)) / 3;
                const g = Math.hypot(gx, gz);
                const grad0 = (Math.atan(g) * 180) / Math.PI;
                if (grad0 < 20 || grad0 > 30) continue;
                const ux = gx / g,
                    uz = gz / g; // bergauf
                let eben = true;
                for (const t of [-3, -1.5, 1.5, 3])
                    for (const o of [-3, 3]) {
                        const px = x + ux * t - uz * o,
                            pz = z + uz * t + ux * o;
                        if (Math.abs(h(px, pz) - (h(x, z) + g * t)) > 0.5) eben = false;
                    }
                if (!eben) continue;
                if (
                    (s.architectures || []).some(
                        (e) =>
                            e &&
                            e.blockerAABBs &&
                            e.position &&
                            Math.abs(e.position.x - x) < 4 &&
                            Math.abs(e.position.z - z) < 4
                    )
                )
                    continue;
                hang = { x, z, ux, uz, grad: grad0 };
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
            hangGrad: +hang.grad.toFixed(1),
            stand: { wolf: stand[0], hirsch: stand[1] },
            schlupf: { wolf: schlupf[0], hirsch: schlupf[1] },
        };
    });

    // ── ferngang (Leben-Schau 07.10., D-Fern): ferne Tiere gehen, sie gleiten nie — 5 Hirsche in 65 m glitten erstarrt
    // (jenseits der Standbild-Schwelle 35·L fror der Baum in der Stand-Pose ein, das gemergte Standbild trug ihn, die
    // Glieder-Kapseln jenseits 64 m lasen eingefrorene Knochen). Gemessen am echten Takt: 4 Hirsche in der Standbild-Zone
    // (45–60 m), 4 in der Kapsel-Zone (70–90 m) folgen dem Spieler (er steht, der Blick liegt auf ihnen); je laufendem Takt
    // (Leib-Weg > 0,3 m/s) GLEITET ein Tier, wenn sein SICHTBARER Leib die Beine nicht bewegt: trägt das Fern-Bild, zählen
    // die Gelenke, an die seine Haut gebunden ist (ein Fern-Bild ohne Haut-Gelenke ist ein Standbild — es gleitet immer),
    // sonst die des Baums; gleiten heißt, die Hüft-Winkel der vier Beine liegen über 24 Takte (0,4 s, die Stufe 1/8 wertet
    // dreimal aus) in 0,02 rad ──
    await buehne("ferngang", async (restore) => {
        r.setGameMode("frieden");
        const altUhr = s.creatureAnimationTime;
        restore.push(() => {
            s.creatureAnimationTime = altUhr;
        });
        s.creatureAnimationTime = 100;
        if (taeter === "ferngang")
            decke(
                restore,
                "_kreaturLaeuft",
                () =>
                    function () {
                        return false; // der Täter: der Standbild-Freeze gilt auch dem, der läuft
                    }
            );
        if (taeter === "ferngang-spiegel")
            decke(
                restore,
                "_tierFernFolgt",
                () =>
                    function () {
                        // der Täter: das Fern-Bild trägt nicht die Pose des Baums (das ungeskinnte Standbild)
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
                if (r._isAboveWaterAt && !r._isAboveWaterAt(x, z)) ok = false;
            }
            if (ok) richtung = a;
        }
        if (richtung === null) return { fehler: "kein Land in 45–95 m um den Spieler" };
        const ux = Math.cos(richtung),
            uz = Math.sin(richtung);
        kamera(ux, uz);
        const zonen = { standbild: [45, 50, 55, 60], kapsel: [70, 77, 84, 90] };
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
        // der sichtbare Leib: das Fern-Bild (die Gelenke seiner Haut) oder der Baum
        const sichtbar = (c) => {
            const tb = c.userData._tierBaum;
            if (!tb) return { fern: false, beine: null };
            if (tb.fern && tb.fern.visible && !(tb.wrap && tb.wrap.visible)) {
                let haut = null;
                tb.fern.traverse((o) => {
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
            standbild: { lauf: 0, gleit: 0, fernBild: 0 },
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
                if (t.warFern !== sb.fern) t.spur.length = 0; // der Wechsel Baum ↔ Fern-Bild beginnt eine neue Spur
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
            `Jagd auf den Achsen (0,25°) ${(z.achsAnteil * 100).toFixed(1)} % (5°: ${(z.achsAnteil5Grad * 100).toFixed(1)} %; davon im Wasser ${z.achsImWasser} Takte)`
        );
        soll(z.bedrohtFrames >= 60, `nur ${z.bedrohtFrames} bedrohte Beute-Frames`);
        soll(z.fortAnteil !== null && z.fortAnteil > 0.8, `Beute fort vom Jäger ${z.fortAnteil} (Soll > 0,8)`);
    }
    if (name === "herde") {
        soll(z.artFremdZugM < 0.01, `der Fuchs zieht den Bären ${z.artFremdZugM} m (Kohäsion artfremd)`);
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
    if (name === "jagdkreis") {
        const a = z.kampfSchau,
            b = z.sprinter;
        soll(a.jagdS >= 10, `der Wolf jagt nur ${a.jagdS} s von 60 (vakuös)`);
        soll(a.tempoMs >= 0.5, `der Witterungs-Jäger steht still: ${a.tempoMs} m/s in seinen Jagd-Takten (Soll ≥ 0,5)`);
        soll(
            a.hinAnteil !== null && a.hinAnteil >= 0.8,
            `der Witterungs-Jäger läuft nicht zur Beute: ${a.hinAnteil} seiner Schritte zeigen auf sie (Soll ≥ 0,8)`
        );
        const k = z.kreislauf;
        soll(
            k.rudelGegenHirsch >= 1 && k.wolfGegenKitz >= 1,
            `der Kreislauf schließt sich nicht: das Rudel beißt den Hirsch ${k.rudelGegenHirsch}×, der Wolf das Kitz ${k.wolfGegenKitz}× in 3600 Takten (der einzelne Wolf am erwachsenen Hirsch: ${a.bisse})`
        );
        soll(
            b.abstandEnde < b.abstand0 && b.bisse >= 1,
            `der Sprinter entkommt: Abstand ${b.abstand0} → ${b.abstandEnde} m, ${b.bisse} Bisse (Sprint ${b.sprintMs} m/s, Wolf ${b.wolfSprintMs} m/s)`
        );
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
            ["Standbild-Zone 45–60 m", z.standbild],
            ["Kapsel-Zone 70–90 m", z.kapsel],
        ]) {
            soll(Z.laufTakte >= 200, `${zone}: nur ${Z.laufTakte} laufende Takte (die Probe braucht ≥ 200)`);
            soll(
                Z.gleitAnteil !== null && Z.gleitAnteil <= 0.05,
                `ferner Gang gleitet: ${zone} ${Z.gleitTakte} von ${Z.laufTakte} laufenden Takten ohne Beinschlag (Soll ≤ 5 %; das Fern-Bild trug ${Z.fernBild})`
            );
        }
    }
    if (name === "querhang") {
        for (const [wer, a] of [
            ["Wolf", z.stand.wolf],
            ["Hirsch", z.stand.hirsch],
        ])
            soll(
                a.lotMaxGrad <= 10,
                `Bein-Lot am Querhang (${z.hangGrad}°): ${wer} ${a.lotMaxGrad}° (Soll ≤ 10°; der Leib rollt ${a.rollGrad}°)`
            );
        for (const [wer, sl] of [
            ["Wolf", z.schlupf.wolf],
            ["Hirsch", z.schlupf.hirsch],
        ])
            soll(sl !== null && sl <= 0.2, `Stand-Schlupf am Querhang: ${wer} ${sl} (Soll ≤ 0,2)`);
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
        ["jagd-gradient", /läuft nicht zur Beute|steht still|Kreislauf schließt sich nicht/],
        ["jagd-schritt", /Sprinter entkommt/],
    ],
    rudel: [["rudel", /umstellt nicht/]],
    sockel: [["sockel", /steht im Sockel/]],
    querhang: [
        ["querhang", /Bein-Lot am Querhang/],
        ["querhang-gleiten", /Stand-Schlupf am Querhang/],
    ],
    ferngang: [
        ["ferngang", /ferner Gang gleitet/],
        ["ferngang-spiegel", /ferner Gang gleitet: Standbild-Zone/],
    ],
};

// Der Kommentar-Stripper der Absenz-Proben — dieselbe Quelle wie window.__codeOf im Playtest-Harness (Kommentare
// zitieren gefallenen Code; eine Absenz-Probe liest nie ein Zitat).
const CODE_OF_SRC = String((fnOrSrc) =>
    String(fnOrSrc)
        .replace(/\/\/.*$/gm, "")
        .replace(/\/\*[\s\S]*?\*\//g, "")
);

module.exports = { KREATUR_PROBEN_SRC: kreaturProben.toString(), PROBEN, TAETER, CODE_OF_SRC, urteil };
