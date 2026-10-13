class AnazhRealm_Z15c {
    // ===== ATLAS §15c · SPIELER-SEELEN/BEWEGUNG — Block Koerper =====
    // Wind-Vektor an (x, z): deterministisch aus dem Welt-Seed (_voxelNoise), dreht sanft über
    // km-Distanzen (windScale = 1/1000). windTimeRate = 0 → statischer Wind je Welt (deterministisch).
    _worldWindDirAt(x, z, t) {
        const n = this._gelaende().noise;
        const S = AnazhRealm.SCENT;
        const tt = (typeof t === "number" ? t : 0) * S.windTimeRate;
        // Wind-Phase: Noise als Winkel-Quelle (0..2π).
        const phase = (n.noise2D(x * S.windScale + tt, z * S.windScale - tt) + 1) * Math.PI;
        return { x: Math.cos(phase), z: Math.sin(phase) };
    }

    // Geruch an (x, z) aus `sources` [{x, z, strength}], Σ über alle Quellen, ∈ [0, ∞) — cappen und
    // deuten die Konsumenten. Je Quelle: decay = exp(−dist/rangeM); dot = toRecv · windDir (toRecv =
    // Einheitsvektor Quelle→Empfänger, windDir = Wind an der Quelle; positiv = downwind);
    // windMod = max(minDirectional, (1−windFactor) + windFactor · max(0, dot));
    // geruch = strength · decay · windMod.
    _scentAt(x, z, sources, opts) {
        if (!Array.isArray(sources) || sources.length === 0) return 0;
        const S = AnazhRealm.SCENT;
        const t = opts && typeof opts.time === "number" ? opts.time : 0;
        let total = 0;
        for (const src of sources) {
            if (!src || typeof src.x !== "number" || typeof src.z !== "number") continue;
            const strength = typeof src.strength === "number" ? src.strength : 1;
            if (!(strength > 0)) continue;
            const dx = x - src.x;
            const dz = z - src.z;
            const dist = Math.hypot(dx, dz);
            if (dist > S.rangeM * 4) continue; // jenseits 4× range vernachlässigbar
            const decay = Math.exp(-dist / S.rangeM);
            // Wind an der Quelle (der Wind, der den Geruch wegträgt)
            const wind = this._worldWindDirAt(src.x, src.z, t);
            // Normierter Vektor von Source zum Receiver
            const norm = dist > 0.001 ? 1 / dist : 0;
            const dirX = dx * norm;
            const dirZ = dz * norm;
            // dot mit windDir: positiv = Receiver liegt downwind (wind weht
            // VON src ZU recv, trägt also den Geruch hin).
            const dot = dirX * wind.x + dirZ * wind.z;
            const windMod = Math.max(S.minDirectional, 1 - S.windFactor + S.windFactor * Math.max(0, dot));
            total += strength * decay * windMod;
        }
        return total;
    }

    // DER EINE Stat-Chokepoint: jede Mutation der Spieler-Stats ruft recomputePlayerStats
    // (computePlayerStats ist die EINE Berechnung) — nie inline neu rechnen, sonst driftet eine zweite
    // Stat-Wahrheit. Die LEBENSWERTE (hp · stamina · mana) sind ZUSTAND: jede Neuberechnung klemmt sie auf das
    // neue Maximum, keine hebt sie. Auf das Maximum setzen nur die Wandlung (applyPlayerSoul) und die Rückkehr
    // (_playerDeathRespawn) mit `{ voll: true }` — vorher heilte jeder Rufer voll: Gerät, Panel, Boost und der
    // Tod-Takt (K27, gate:kampf-gefuehl T27). Ein fehlender Wert (vor der ersten Wandlung) ist nie 0: er steht voll.
    // player_speed/player_jump_power dürfen danach überschreiben.
    recomputePlayerStats(opts) {
        const computed = this.computePlayerStats();
        if (!this.state.player) return computed;
        const pl = this.state.player;
        pl.stats = computed.stats;
        pl.statTags = computed.tags;
        // Anwendung auf die Live-Bewegungs-Werte. V9.44-b: speed + sprintSpeed
        // über den kanonischen Setter — Sprint = 2× speed konsistent gehalten.
        this._applyPlayerSpeed(computed.stats.speed);
        this.state.jumpPower = computed.stats.jumpPower;
        // Die Lebenswerte: das Maximum aus der Berechnung, der Zustand geklemmt (Mana ist die zweite Ausdauer-Achse;
        // Verbrauch und Regen leben in den Verben und tickPlayerVitals).
        const voll = !!(opts && opts.voll);
        const lebenswert = (v, max) => (voll || v == null ? max : Math.min(v, max));
        pl.hpMax = computed.stats.hpMax;
        pl.hp = lebenswert(pl.hp, pl.hpMax);
        pl.staminaMax = computed.stats.staminaMax;
        pl.stamina = lebenswert(pl.stamina, pl.staminaMax);
        pl.manaMax = computed.stats.manaMax;
        pl.mana = lebenswert(pl.mana, pl.manaMax);
        return computed;
    }

    // Pro-Frame-Animation des aktuellen Soul-Group. Wird im Render-Loop
    // direkt nach der Kamera aufgerufen — playerMesh.position ist da schon
    // mit dem Physik-Body synchronisiert.
    animatePlayerSoul(currentTime) {
        const mesh = this.state.playerMesh;
        if (!mesh || !mesh.userData) return;
        const soulName = this.state.player.soul || "human";
        const def = this.playerSoulDefs[soulName];
        const hasSkeleton = !!(def && typeof def.animate === "function" && mesh.userData.parts);
        // Custom-Seelen erben die emergente Bewegung: Rollen aus ihren bodyParts (einmal je Seele am Mesh
        // gecacht — ein Wechsel baut eine frische Group), derselbe Geh-/Schwimm-Takt wie die Hand-Skelette.
        let customRoles = null;
        if (!hasSkeleton) {
            // ABSCHIEDS-WELLE (Konvergenz C) — die EINE Rollen-Quelle für ALLE Compound-
            // Seelen: `_getSoulDef` deckt Built-ins (Phönix/Drache — ihre Hand-Skelette
            // sind konvergiert, sie bauen + bewegen wie jede Custom-Seele) UND Customs.
            const sdef = this._getSoulDef(soulName);
            if (!sdef || !Array.isArray(sdef.bodyParts)) return;
            if (mesh.userData._motionSoul !== soulName) {
                mesh.userData._motionSoul = soulName;
                mesh.userData._motionRoles = this.computeMotionRoles(sdef.bodyParts);
                mesh.userData._motionBase = null;
            }
            customRoles = mesh.userData._motionRoles;
            if (!customRoles) return;
        }
        const p = this.state.player;
        // Im Sattel pausiert der Schritt (Phase eingefroren); der Mensch-Avatar SITZT (_applySeatPose),
        // andere Seelen ruhen in der Idle-Pose.
        const mounted = p.mountedArch !== null && p.mountedArch !== undefined;
        if (mounted) {
            p.animationLastTick = currentTime;
            if (hasSkeleton && soulName === "human" && mesh.userData.parts) {
                this._applySeatPose(mesh, currentTime);
            } else if (hasSkeleton) {
                def.animate(mesh, currentTime, p.walkPhase, false, false, p.emotions);
            } else if (customRoles) {
                this._animateCompoundMotion(mesh, customRoles, currentTime, p.walkPhase, false, p.emotions);
            }
            return;
        }
        if (mesh.userData.rig && mesh.userData.rig._sitzLage) this._sitzLageLoesen(mesh.userData.rig);
        // isMoving aus horizontaler Geschwindigkeit. Schwelle 0.4 m/s
        // verhindert Mikro-Walk wenn der Spieler steht aber leicht rutscht.
        let speedNow = 0;
        if (this.state.playerVel) {
            const v = this.state.playerVel;
            speedNow = Math.hypot(v.x(), v.z());
            if (!Number.isFinite(speedNow)) speedNow = 0;
        }
        const isMoving = speedNow > 0.4;
        // V8.33 — unter Wasser schwimmt der Avatar statt zu laufen.
        const underwater = !!this.state.playerUnderwater;
        // Frame-Delta aus animationLastTick. Hit-Stop pausiert NUR diese Anzeige-Uhr (Gang-/Schwung-Phase
        // frieren 60–100 ms, _hitStopFactor 0); die fixe Sim (_loopFixedStep/_stepFixedSim) liest den Faktor
        // NIE (gate:kampf-gefuehl).
        const last = p.animationLastTick;
        const dt = (last > -Infinity ? Math.max(0, currentTime - last) : 0) * this._hitStopFactor(currentTime);
        p.animationLastTick = currentTime;
        let gait = null;
        if (underwater) {
            // Schwimm-Takt: die Phase läuft auch im Stillstand (Wasser-Treten), in Bewegung schneller — kein
            // Rhythmus-Sprung bei Start/Stopp. Takt aus dem koerperstudio-Gesetzbuch (_schwimmGesetz).
            const SG = AnazhRealm._schwimmGesetz();
            p.walkPhase += dt * (isMoving ? SG.taktZug : SG.taktTreten);
        } else if (hasSkeleton && mesh.userData.rig) {
            // ═══ KÖRPER-BEWEGUNG ═══
            // Der Biped geht die WEG-Phase (Weg / Schrittlänge — der Sprint skatet nie); w(speed) blendet die
            // Posen; nur der lokale Avatar trägt Fuß-IK/Foot-Lock/Becken/Hang-Lehne (_gaitTick = der EINE
            // Chokepoint). Die Emotion reist als Kadenz-Faktor (neutral 1, sorrow 0.8×); kaltes Buch → 1.
            let emoF = 1;
            const mpv = this._koerperMotionProfile(true, p.emotions);
            const mpr = mpv ? this._koerperMotionProfile(true, null) : null;
            if (mpv && mpr && Number.isFinite(mpv.freq) && mpr.freq > 0) emoF = mpv.freq / mpr.freq;
            gait = this._gaitTick(mesh, p, speedNow, dt, {
                emoFaktor: emoF,
                // LUFT-SPERRE: nur der stehende Körper erdet die Füße — im Sprung blieb die IK an, das Becken sank 0,25 m,
                // während die Kapsel 0,24–0,31 m stieg (der sichtbare Sprung fast null, Leben-Prüfung N-D1).
                ik: this.state.isInAir !== true,
                soleY: mesh.position.y - AnazhRealm.PLAYER_FOOT_OFFSET,
                yaw: mesh.rotation.y,
            });
        } else if (isMoving) {
            // Compound-/Nicht-Rig-Seelen bleiben zeit-getrieben (Flügel/Räder takten zur Uhr); Takt-Basis +
            // Emotions-Brücke im EINEN Chokepoint _compoundTaktHz (Kern: schritt.taktCompound).
            p.walkPhase += dt * this._compoundTaktHz(p.emotions);
        }
        // Schritt-Klang als Konsument der Gang-Phase (keine eigene Uhr): je Halbzyklus ein Schritt, nur
        // geerdet + über der Tempo-Schwelle; Hit-Stop friert ihn mit, im Sattel kein Fuß-Klappern.
        this._schrittKlangTick(p, speedNow, underwater, mesh);
        if (hasSkeleton) {
            def.animate(mesh, currentTime, p.walkPhase, isMoving, underwater, p.emotions, gait);
            // Der 3-Phasen-Kampf-Schwung ist ein additiver Oberkörper-Layer über der Lokomotion (dieselbe
            // Null-Reset-Basis, danach +=) — kein zweites Rig-System. No-op ohne Schwung/Rig.
            this._applyKampfSchwungPose(mesh);
        } else {
            // ABSCHIEDS-WELLE (Konvergenz C) — DIE EINE SCHWIMM-LEHNE für jede Compound-
            // Seele (konvergierte Built-ins + Customs; die Spieler-Gruppe ist IMMER YXZ,
            // applyPlayerSoul erzwingt die Order → die Lehne kippt lokal-vorwärts).
            const L = AnazhRealm.SOUL_SWIM_LEAN;
            mesh.rotation.x = underwater ? (isMoving ? L.moving : L.idle) : 0;
            this._animateCompoundMotion(mesh, customRoles, currentTime, p.walkPhase, isMoving, p.emotions);
        }
    }

    // ### Ring 6 – architectureTemplates V1 ###
    //
    // Drei DSL-Primitives, die je einen THREE.Group aus Three.js-Primitives
    // bauen: Dorf (Hütten + Lagerplatz), Tempel (Pfeiler + Dach + Altar),
    // Wasserfall (Vertex-animierte Wasser-Plane + Becken). Jede Struktur
    // bekommt einen Seed; Save persistiert nur {type, position, seed} und
    // der Mesh wird beim Laden aus dem Seed neu gebaut — keine Mesh-Daten
    // im JSON, kleine Save-Dateien.
    //
    // Strukturen sind global (nicht pro-Chunk parented). Sie überleben
    // Chunk-Prune und liegen in `state.architectures`. FIFO-Cap (30) gegen
    // Mesh-Spam wenn der Nexus mehrmals hintereinander baut.
    //
    // Pro-Frame-Animation (z. B. fließendes Wasser) läuft via
    // `tickArchitectures(t)` — jede Struktur darf eine `userData.animate`-
    // Funktion mitbringen, die der Tick aufruft. Statische Strukturen
    // (Hütten, Tempel) brauchen das nicht.

    // === Bauplan-Datenschicht ===
    // Ein Bauplan ist eine flache JSON-Liste von Primitiv-Parts, _buildFromBlueprint rendert sie zur
    // THREE.Group: { name, label, builtIn, parts: [...] }. Part = { shape, color: 0xRRGGBB, position,
    // rotation? (Radiant), size (je Primitiv interpretiert), opacity? (< 1 = transparent),
    // animate? (Marker für tickArchitectures, z. B. "water_wave") }.

    _makePartGeometry(part) {
        const sx = (part.size && part.size.x) || 1;
        const sy = (part.size && part.size.y) || sx;
        const sz = (part.size && part.size.z) || sx;
        const segments = part.segments || 12;
        switch (part.shape) {
            case "sphere":
                return new THREE.SphereGeometry(sx / 2, segments, Math.max(4, Math.floor(segments * 0.6)));
            case "cylinder":
                return new THREE.CylinderGeometry(sx / 2, sz / 2, sy, segments);
            case "cone":
                return new THREE.ConeGeometry(sx / 2, sy, segments);
            case "pyramid":
                // Vier-seitige Pyramide = Kegel mit 4 Segmenten
                return new THREE.ConeGeometry(sx / 2, sy, 4);
            case "octahedron":
                return new THREE.OctahedronGeometry(sx / 2, 0);
            case "plane":
                // Plane: optional segmentiert für Vertex-Animation. Default
                // 1×1, für animate="water_wave" lieber 6×18.
                if (part.animate === "water_wave") {
                    return new THREE.PlaneGeometry(sx, sy, 6, 18);
                }
                return new THREE.PlaneGeometry(sx, sy);
            case "torus":
                return new THREE.TorusGeometry(sx / 2, Math.max(0.05, sx / 6), 8, segments);
            case "helix": {
                // Helix als TubeGeometry über eine parametrische Kurve: size.x = Wendel-Durchmesser, size.y =
                // Gesamt-Länge, size.z = Windungen; Tube-Radius ∝ sx/12, mindestens 0.05.
                const helixRadius = Math.max(0.05, sx / 2);
                const helixLength = Math.max(0.1, sy);
                const turns = Math.max(0.5, Math.min(20, sz || 3));
                const tubeRadius = Math.max(0.05, sx / 12);
                const curve = new THREE.Curve();
                curve.getPoint = function (t, optionalTarget) {
                    const target = optionalTarget || new THREE.Vector3();
                    const angle = t * turns * Math.PI * 2;
                    return target.set(
                        Math.cos(angle) * helixRadius,
                        (t - 0.5) * helixLength,
                        Math.sin(angle) * helixRadius
                    );
                };
                const tubularSegments = Math.max(20, Math.floor(turns * 16));
                return new THREE.TubeGeometry(curve, tubularSegments, tubeRadius, 6, false);
            }
            case "limb": {
                // Glied/Knochen als verjüngte KAPSEL aus EINER Lathe-Geometrie: untere Halbkugel (rb) → konischer
                // Schaft → obere Halbkugel (rt). size.x = unterer ⌀, size.y = Länge, size.z = oberer ⌀
                // (dick an der Hüfte, schmal am Knöchel).
                const rb = Math.max(0.005, sx / 2);
                const rt = Math.max(0.005, sz / 2);
                const L = Math.max(0.04, sy);
                const capB = Math.min(rb, L * 0.48);
                const capT = Math.min(rt, L * 0.48);
                const yBot = -L / 2,
                    yTop = L / 2;
                const NB = 5;
                const pts = [];
                for (let i = 0; i <= NB; i++) {
                    const a = (i / NB) * (Math.PI / 2);
                    pts.push(new THREE.Vector2(Math.sin(a) * rb, yBot + capB - Math.cos(a) * capB));
                }
                pts.push(new THREE.Vector2(rt, yTop - capT)); // Schaft-Verjüngung
                for (let i = 1; i <= NB; i++) {
                    const a = (i / NB) * (Math.PI / 2);
                    pts.push(new THREE.Vector2(Math.cos(a) * rt, yTop - capT + Math.sin(a) * capT));
                }
                return new THREE.LatheGeometry(pts, Math.max(6, Math.min(20, segments)));
            }
            case "crystalPoint": {
                // Quarz-Kristall = n-seitiges PRISMA mit pyramidaler Termination, nie eine Kugel; EINE Geometrie,
                // deterministisch. size.x/z = Prisma-⌀ (darf elliptisch sein), size.y = Länge;
                // part.facets = n (6 = Quarz), part.termFrac = Anteil der Spitze.
                const n = Math.max(3, Math.min(12, part.facets | 0 || 6));
                const rX = Math.max(0.01, sx / 2);
                const rZ = Math.max(0.01, sz / 2);
                const L = Math.max(0.05, sy);
                const termFrac = Number.isFinite(part.termFrac) ? Math.max(0.05, Math.min(0.9, part.termFrac)) : 0.32;
                // Prisma aus der geteilten Quelle (phyto-core `pushCrystal`): M-seitig + Schulter (Radius 0.9) +
                // Apex. Der shape-String bleibt EXAKT `crystalPoint` → Tags frozen. Ohne __phytoCore: Inline-Pfad.
                {
                    const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
                    if (core && typeof core.buildCrystalPointGeometry === "function") {
                        const g = core.buildCrystalPointGeometry(THREE, {
                            facets: n,
                            rX,
                            rZ,
                            length: L,
                            termFrac,
                        });
                        if (g) return g;
                    }
                }
                const yBot = -L / 2,
                    yTop = L / 2,
                    yShoulder = yTop - termFrac * L;
                const verts = [];
                const idx = [];
                // Ring 0 (Boden) + Ring 1 (Schulter), dann Apex + Boden-Zentrum.
                for (const yy of [yBot, yShoulder]) {
                    for (let i = 0; i < n; i++) {
                        const a = (i / n) * Math.PI * 2;
                        verts.push(Math.cos(a) * rX, yy, Math.sin(a) * rZ);
                    }
                }
                const apex = verts.length / 3;
                verts.push(0, yTop, 0);
                const botC = verts.length / 3;
                verts.push(0, yBot, 0);
                for (let i = 0; i < n; i++) {
                    const a = i,
                        b = (i + 1) % n,
                        a2 = n + i,
                        b2 = n + ((i + 1) % n);
                    idx.push(a, a2, b, b, a2, b2); // Prisma-Wand (Quad)
                    idx.push(apex, a2, b2); // Termination (Dreieck → Spitze)
                    idx.push(botC, b, i); // Boden-Kappe
                }
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
                g.setIndex(idx);
                g.computeVertexNormals();
                return g;
            }
            case "latheProfile": {
                // Lathe-Gefäß (Phiole · Vase · Urne · Goblet · Becken · Baluster): die Silhouette (Bauch · Schulter ·
                // Hals · Lippe) emergiert aus part.profile = [[radiusFrac, heightFrac], …] (0..1).
                // size.x = max ⌀, size.y = Höhe.
                const prof =
                    Array.isArray(part.profile) && part.profile.length >= 2
                        ? part.profile
                        : [
                              [0.5, 0],
                              [0.5, 1],
                          ];
                const rMax = Math.max(0.01, sx / 2);
                const H = Math.max(0.05, sy);
                const lpts = prof.map(
                    (p) => new THREE.Vector2(Math.max(0.0008, (p[0] || 0) * rMax), ((p[1] || 0) - 0.5) * H)
                );
                return new THREE.LatheGeometry(lpts, Math.max(8, Math.min(28, part.segments || 16)));
            }
            case "plateShell": {
                // Gewölbte Platte als Zylinder-Sektion (Brustplatte folgt dem Torso, Pauldron der Schulter, Fauld
                // als Lamelle). size.x = Sehne, size.y = Höhe, size.z = Wölbungs-Tiefe; part.wrap = Bogen (rad).
                const W = Math.max(0.05, sx);
                const Hs = Math.max(0.04, sy);
                const bulge = Math.max(0.02, sz);
                const wrap = Number.isFinite(part.wrap) ? Math.max(0.4, Math.min(3.0, part.wrap)) : 2.0;
                const R = W / 2 / Math.sin(wrap / 2);
                const th = Math.max(0.012, bulge * 0.35);
                const seg = Math.max(6, Math.min(28, part.segments || 12));
                const verts = [];
                const idx = [];
                // 4 Ringe: außen-unten, außen-oben, innen-unten, innen-oben (je seg+1 Punkte).
                const ring = (rad, top) => {
                    for (let i = 0; i <= seg; i++) {
                        const th2 = -wrap / 2 + (i / seg) * wrap;
                        verts.push(Math.sin(th2) * rad, top ? Hs / 2 : -Hs / 2, Math.cos(th2) * rad - (R - bulge));
                    }
                };
                ring(R, false);
                ring(R, true);
                ring(R - th, false);
                ring(R - th, true);
                const N = seg + 1;
                const OU = 0,
                    OO = N,
                    IU = 2 * N,
                    IO = 3 * N;
                for (let i = 0; i < seg; i++) {
                    // Außenfläche (sieht nach vorn) + Innenfläche (umgekehrt) + obere/untere Kante.
                    idx.push(OU + i, OO + i, OU + i + 1, OU + i + 1, OO + i, OO + i + 1);
                    idx.push(IU + i, IU + i + 1, IO + i, IU + i + 1, IO + i + 1, IO + i);
                    idx.push(OO + i, IO + i, OO + i + 1, OO + i + 1, IO + i, IO + i + 1); // Oberkante
                    idx.push(OU + i, OU + i + 1, IU + i, OU + i + 1, IU + i + 1, IU + i); // Unterkante
                }
                // die zwei seitlichen Kanten (Bogen-Enden) schließen.
                idx.push(OU, IU, OO, OO, IU, IO);
                idx.push(OU + seg, OO + seg, IU + seg, OO + seg, IO + seg, IU + seg);
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
                g.setIndex(idx);
                g.computeVertexNormals();
                return g;
            }
            case "spokeWheel": {
                // Speichen-Rad: Nabe + N radiale Speichen + Felgen-Ring statt voller Scheibe. Achse = lokal Y (wie
                // der ersetzte cylinder → dieselbe z-Rotation stellt es auf). size.x = size.z = ⌀, size.y = Breite;
                // part.spokes = N.
                const Rw = Math.max(0.05, sx / 2);
                const wid = Math.max(0.03, sy);
                const nsp = Math.max(4, Math.min(16, part.spokes | 0 || 8));
                const rimW = Rw * 0.16; // Felgen-Dicke
                const hubR = Rw * 0.2;
                const verts = [];
                const idx = [];
                const NS = 24; // Ring-Auflösung
                const pushRing = (rad, y) => {
                    const base = verts.length / 3;
                    for (let i = 0; i < NS; i++) {
                        const a = (i / NS) * Math.PI * 2;
                        verts.push(Math.cos(a) * rad, y, Math.sin(a) * rad);
                    }
                    return base;
                };
                // FELGE: ein rechteckiger Torus (außen Ro, innen Ri) über beide Breiten-Seiten.
                const Ro = Rw,
                    Ri = Rw - rimW;
                const roT = pushRing(Ro, wid / 2),
                    roB = pushRing(Ro, -wid / 2),
                    riT = pushRing(Ri, wid / 2),
                    riB = pushRing(Ri, -wid / 2);
                const band = (a, b) => {
                    for (let i = 0; i < NS; i++) {
                        const j = (i + 1) % NS;
                        idx.push(a + i, a + j, b + i, a + j, b + j, b + i);
                    }
                };
                band(roT, roB); // Außen-Lauffläche
                band(riB, riT); // Innen (umgekehrt)
                band(riT, roT); // Oberkante (Innen→Außen)
                band(roB, riB); // Unterkante
                // NABE: ein kleiner Zylinder in der Mitte.
                const huT = pushRing(hubR, wid / 2),
                    huB = pushRing(hubR, -wid / 2);
                band(huB, huT);
                const cT = verts.length / 3;
                verts.push(0, wid / 2, 0);
                const cB = verts.length / 3;
                verts.push(0, -wid / 2, 0);
                for (let i = 0; i < NS; i++) {
                    const j = (i + 1) % NS;
                    idx.push(cT, huT + i, huT + j);
                    idx.push(cB, huB + j, huB + i);
                }
                // SPEICHEN: N dünne Balken von der Nabe zur Felge (als schmale Quads in der Rad-Ebene).
                for (let s = 0; s < nsp; s++) {
                    const a = (s / nsp) * Math.PI * 2;
                    const ca = Math.cos(a),
                        sa = Math.sin(a);
                    const pa = a + Math.PI / 2;
                    const cp = Math.cos(pa) * rimW * 0.35,
                        sp = Math.sin(pa) * rimW * 0.35;
                    const b = verts.length / 3;
                    verts.push(ca * hubR + cp, wid * 0.18, sa * hubR + sp);
                    verts.push(ca * hubR - cp, wid * 0.18, sa * hubR - sp);
                    verts.push(ca * Ri + cp, wid * 0.18, sa * Ri + sp);
                    verts.push(ca * Ri - cp, wid * 0.18, sa * Ri - sp);
                    verts.push(ca * hubR + cp, -wid * 0.18, sa * hubR + sp);
                    verts.push(ca * hubR - cp, -wid * 0.18, sa * hubR - sp);
                    verts.push(ca * Ri + cp, -wid * 0.18, sa * Ri + sp);
                    verts.push(ca * Ri - cp, -wid * 0.18, sa * Ri - sp);
                    // Top-Fläche + Bottom-Fläche der Speiche (sichtbar von der Seite).
                    idx.push(b, b + 2, b + 1, b + 1, b + 2, b + 3);
                    idx.push(b + 4, b + 5, b + 6, b + 5, b + 7, b + 6);
                }
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
                g.setIndex(idx);
                g.computeVertexNormals();
                return g;
            }
            case "pickHead": {
                // Gebogener Spitzhacken-Kopf: Spitze auf der einen, flacher Adze auf der anderen Seite, beide vom Auge
                // ausschwingend, entlang X. size.x = Spannweite, size.y = Höhe (Auge), size.z = Dicke;
                // part.curve = Krümmung.
                const span = Math.max(0.1, sx);
                const eyeH = Math.max(0.05, sy);
                const thick = Math.max(0.03, sz);
                const curve = Number.isFinite(part.curve) ? Math.max(0, Math.min(0.6, part.curve)) : 0.28;
                const NSEG = 8;
                const verts = [];
                const idx = [];
                // ein verjüngter, gebogener Arm von t=0 (Auge) nach t=1 (Spitze), in der XY-Ebene,
                // Dicke in Z. zwei Arme: pick (+x, spitz) + adze (−x, stumpf breit).
                const arm = (dir, tipFrac, taper, reach) => {
                    const base = verts.length / 3;
                    for (let j = 0; j <= NSEG; j++) {
                        const t = j / NSEG;
                        const x = dir * (span / 2) * reach * t;
                        const droop = -curve * span * 0.32 * t * t; // schwingt leicht nach unten
                        const hw = (eyeH / 2) * (1 - (1 - taper) * t); // Höhe verjüngt
                        const hz = (thick / 2) * (1 - (1 - tipFrac) * t); // Dicke verjüngt → Schneide
                        verts.push(x, droop + hw, hz, x, droop + hw, -hz, x, droop - hw, hz, x, droop - hw, -hz);
                    }
                    for (let j = 0; j < NSEG; j++) {
                        const a = base + j * 4;
                        const b = base + (j + 1) * 4;
                        // 4 Längs-Flächen (oben/unten/vorn/hinten) der Arm-„Röhre".
                        idx.push(a, b, a + 1, a + 1, b, b + 1); // oben
                        idx.push(a + 2, a + 3, b + 2, a + 3, b + 3, b + 2); // unten
                        idx.push(a, a + 2, b, b, a + 2, b + 2); // +z
                        idx.push(a + 1, b + 1, a + 3, a + 3, b + 1, b + 3); // −z
                    }
                };
                arm(1, 0.04, 0.06, 1.15); // pick: lang + verjüngt zur scharfen Spitze
                arm(-1, 0.7, 0.7, 0.55); // adze: kurz + stumpf-breit (Brecher)
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
                g.setIndex(idx);
                g.computeVertexNormals();
                return g;
            }
            case "noiserock": {
                // Noiserock: Ikosaeder, Vertices radial per SimplexNoise verschoben (Facetten/Brüche); härte →
                // Angularität. Fixe Noise-Seed → alle Peers teilen die Form (render-only). NON-indexed: die
                // Verschiebung als f(POSITION) hält geteilte Kanten verschweißt; danach flache Facetten-Normalen.
                // Detail skaliert mit der Größe: < 0.7 m det 0 (20 Flächen — Tausende Kiesel wären sonst der größte
                // Dreiecks-Posten), ≥ 0.7 m det 1. Explizites `noiseDetail` bleibt Override.
                const _maxDim = Math.max(sx, sy, sz);
                const det = Number.isFinite(part.noiseDetail)
                    ? Math.max(0, Math.min(3, part.noiseDetail | 0))
                    : _maxDim < 0.7
                      ? 0
                      : 1;
                const matDef = part.material && this.state.materials ? this.state.materials[part.material] : null;
                const haerte = matDef && matDef.tags && Number.isFinite(+matDef.tags.härte) ? +matDef.tags.härte : 0.5;
                if (!this._archRockNoise) this._archRockNoise = new SimplexNoise("anazh-arch-rock");
                // Stein aus der geteilten Quelle (phyto-core `buildBoulder`, Zingg/Wadell): mehr-oktavige Brüche +
                // Sediment-Bänke + Facetten; härte treibt die Angularität; deterministisch (fixe noise3 + seed aus
                // den Maßen). shape bleibt `noiserock` → Tags frozen. Nur für det ≥ 1 (≥ 0.7 m) — ein Kiesel
                // (det 0) bleibt auf dem billigen 20-Flächen-Pfad.
                const core = typeof globalThis !== "undefined" && globalThis.__phytoCore;
                if (det >= 1 && core && typeof core.buildBoulderGeometry === "function") {
                    const noise3 = (x, y, z) => this._archRockNoise.noise3D(x, y, z);
                    let hs =
                        (Math.round(sx * 97) * 131 + Math.round(sy * 89) * 71 + Math.round(sz * 83) * 53) &
                            0x7fffffff || 1;
                    const seq = () => {
                        hs = (hs * 1664525 + 1013904223) & 0x7fffffff;
                        return hs / 0x7fffffff;
                    };
                    // Geologie-Farbe (phyto-core `withColor`: Speckle · Kavitäts-AO · Sediment-Bänke · Eisen-Schlieren ·
                    // Moos-Bleach). part.color (Strata + Fuß-Moos aus _rockVariant) ist der Basis-Ton rockA; rockB/rockC
                    // leiten deterministisch ab. Tag-neutral (nur das color-Attribut). Das Material liest die
                    // Vertex-Farbe (matOpts.vertexColorAlbedo).
                    const _shadeRock = (c, f) => {
                        const _r = Math.max(0, Math.min(255, Math.round(((c >> 16) & 0xff) * f)));
                        const _g = Math.max(0, Math.min(255, Math.round(((c >> 8) & 0xff) * f)));
                        const _b = Math.max(0, Math.min(255, Math.round((c & 0xff) * f)));
                        return (_r << 16) | (_g << 8) | _b;
                    };
                    const _rockBase = Number.isFinite(part.color) ? part.color : 0x8a8278;
                    // Werkstatt-Regler: `part.rockDials` (Rundheit/Rauheit/Streckung/Schichtung) / `part.rockSeed`
                    // überschreiben die Geologie live über dieselbe buildBoulderGeometry-Quelle; ohne Override das
                    // härte-abgeleitete Default.
                    const _rk = part.rockDials || null;
                    const g = core.buildBoulderGeometry(
                        THREE,
                        noise3,
                        {
                            size: 1,
                            elong: _rk && Number.isFinite(_rk.elong) ? _rk.elong : 0.2 + 0.2 * (1 - haerte),
                            sph: _rk && Number.isFinite(_rk.sph) ? _rk.sph : 0.62,
                            round:
                                _rk && Number.isFinite(_rk.round)
                                    ? _rk.round
                                    : Math.max(0.05, Math.min(0.9, 0.62 - 0.5 * haerte)),
                            rough: _rk && Number.isFinite(_rk.rough) ? _rk.rough : 0.34 + 0.4 * haerte,
                            strat: _rk && Number.isFinite(_rk.strat) ? _rk.strat : 0.12,
                            // LOD-Override (Werkstatt-Regler): gröbere Regeneration = weniger Detail.
                            detail: Math.max(1, det + 2 - (Number.isFinite(part.rockLod) ? part.rockLod : 0)),
                            seed: Number.isFinite(part.rockSeed) ? (part.rockSeed % 9973) + 1 : (hs % 9973) + 1,
                            withColor: true,
                            speckle: true,
                            rockA: _rockBase,
                            rockB: _shadeRock(_rockBase, 0.52),
                            rockC: _shadeRock(_rockBase, 1.14),
                        },
                        seq
                    );
                    if (g) {
                        g.scale(0.5 * sx, 0.5 * sy, 0.5 * sz);
                        g.computeVertexNormals();
                        return g;
                    }
                }
                // Fallback (kein phyto-core): die alte ein-oktavige Noise-Kugel.
                const strength = Number.isFinite(part.noiseStrength) ? part.noiseStrength : 0.16 + 0.18 * (1 - haerte);
                const freq = 1.5 + haerte * 2.2;
                const g = new THREE.IcosahedronGeometry(0.5, det);
                const ap = g.attributes.position;
                for (let i = 0; i < ap.count; i++) {
                    const vx = ap.getX(i);
                    const vy = ap.getY(i);
                    const vz = ap.getZ(i);
                    const n = this._archRockNoise.noise3D(vx * freq + 11.2, vy * freq - 7.4, vz * freq + 3.1);
                    const d = 1 + n * strength;
                    ap.setXYZ(i, vx * d * sx, vy * d * sy, vz * d * sz);
                }
                ap.needsUpdate = true;
                g.computeVertexNormals();
                return g;
            }
            case "flutedColumn": {
                // Klassische Säule als EINE Mesh: Entasis (konvexe Verjüngung nach oben) und Kanneluren (N konkave
                // Rillen mit scharfen Graten) ECHT in der Geometrie, nicht als N Groove-Parts. Parametrisch
                // (dorisch 20 / ionisch 24 Rillen), deterministisch.
                const bottomR = Math.max(0.02, sx / 2); // size.x = unterer Durchmesser D
                const topR = Math.max(0.02, sz / 2); // size.z = oberer ⌀ (Verjüngung)
                const H = Math.max(0.1, sy); // size.y = Schaft-Höhe
                const flutes = Math.max(0, Math.min(40, part.flutes | 0 || 0));
                const fluteDepth = Number.isFinite(part.fluteDepth)
                    ? Math.max(0, Math.min(0.3, part.fluteDepth))
                    : 0.05;
                const entasis = Number.isFinite(part.entasis) ? Math.max(0, Math.min(0.3, part.entasis)) : 0.04;
                const radial = flutes > 0 ? Math.max(24, flutes * 3) : Math.max(10, segments);
                const rings = Math.max(2, Math.min(20, part.heightSegments || 6));
                const radAtT = (t) => {
                    const lin = bottomR + (topR - bottomR) * t; // lineare Verjüngung
                    return lin + entasis * bottomR * Math.sin(Math.PI * t); // konvexe Wölbung (max bei t=0.5)
                };
                const fluteAt = (theta) => {
                    if (flutes <= 0) return 1;
                    // konkave Mulde je Rille (0.5−0.5·cos = glatte Rinne; an den Graten voll-radial)
                    return 1 - fluteDepth * (0.5 - 0.5 * Math.cos(theta * flutes));
                };
                const verts = [];
                const idx = [];
                for (let j = 0; j <= rings; j++) {
                    const t = j / rings;
                    const y = (t - 0.5) * H;
                    const r0 = radAtT(t);
                    for (let i = 0; i < radial; i++) {
                        const theta = (i / radial) * Math.PI * 2;
                        const r = r0 * fluteAt(theta);
                        verts.push(Math.cos(theta) * r, y, Math.sin(theta) * r);
                    }
                }
                for (let j = 0; j < rings; j++) {
                    for (let i = 0; i < radial; i++) {
                        const a = j * radial + i;
                        const b = j * radial + ((i + 1) % radial);
                        const c = (j + 1) * radial + i;
                        const d = (j + 1) * radial + ((i + 1) % radial);
                        idx.push(a, c, b, b, c, d);
                    }
                }
                // Deckel oben + unten (Fächer) — die Schnitt-Flächen auf Stylobat / unter Kapitell
                const baseCenter = verts.length / 3;
                verts.push(0, -H / 2, 0);
                const topCenter = verts.length / 3;
                verts.push(0, H / 2, 0);
                const topRing = rings * radial;
                for (let i = 0; i < radial; i++) {
                    const i1 = (i + 1) % radial;
                    idx.push(baseCenter, i1, i);
                    idx.push(topCenter, topRing + i, topRing + i1);
                }
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
                g.setIndex(idx);
                g.computeVertexNormals();
                return g;
            }
            case "bladeProfile": {
                // Klinge als EINE Mesh: distale Verjüngung, Hohlkehle (Masse an der neutralen Achse entfernt:
                // leichter bei gleicher Steifigkeit), linsenförmiger Querschnitt zu den Schneiden. Die Formel
                // (klingenProfil) wohnt in schmiede-core — der Stamm delegiert fail-closed (kalter Kern → Wurf,
                // nie ein Nachbau; index.html lädt den Kern vor dem Stamm).
                const core = (typeof globalThis !== "undefined" && globalThis.__schmiedeCore) || null;
                if (!core || typeof core.klingenProfil !== "function")
                    throw new Error("bladeProfile braucht das Gesetzbuch schmiede-core (klingenProfil)");
                const spec = {
                    baseHalfW: Math.max(0.01, sx / 2), // size.x = Klingen-Breite an der Parier
                    maxThick: Math.max(0.01, sz), // size.z = max Dicke (Mittelgrat)
                    tipWidth: part.tipWidth,
                    fuller: part.fuller,
                };
                const L = Math.max(0.1, sy); // size.y = Klingen-Länge
                const wseg = 8;
                const hseg = Math.max(6, Math.min(40, part.heightSegments || 14));
                const W1 = wseg + 1;
                const verts = [];
                const idx = [];
                const ring = (zSign) => {
                    for (let j = 0; j <= hseg; j++) {
                        const t = j / hseg;
                        const y = (t - 0.5) * L;
                        for (let k = 0; k <= wseg; k++) {
                            const w = (k / wseg - 0.5) * 2;
                            const p = core.klingenProfil(spec, t, w);
                            verts.push(p.w, y, (zSign * p.h) / 2);
                        }
                    }
                };
                ring(1); // FRONT
                const backBase = verts.length / 3;
                ring(-1); // BACK
                for (let j = 0; j < hseg; j++)
                    for (let k = 0; k < wseg; k++) {
                        const a = j * W1 + k,
                            b = j * W1 + k + 1,
                            c = (j + 1) * W1 + k,
                            d = (j + 1) * W1 + k + 1;
                        idx.push(a, c, b, b, c, d); // FRONT (+z)
                        const a2 = backBase + a,
                            b2 = backBase + b,
                            c2 = backBase + c,
                            d2 = backBase + d;
                        idx.push(a2, b2, c2, b2, d2, c2); // BACK (−z, umgekehrt)
                    }
                for (let k = 0; k < wseg; k++) {
                    // Basis-Kappe (j=0) zwischen Front + Back
                    idx.push(k, k + 1, backBase + k, k + 1, backBase + k + 1, backBase + k);
                }
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
                g.setIndex(idx);
                g.computeVertexNormals();
                return g;
            }
            case "gableTriangle": {
                // Ω-B1 (wahrerbauplan §6) — das TYMPANON: ein flaches dreieckiges Giebelfeld
                // (Basis unten, Spitze am First) als dünnes Prisma — schließt den Giebel
                // vorne/hinten (kein offenes Dach). size: x=Basis-Breite, y=Höhe, z=Dicke.
                const w = Math.max(0.02, sx),
                    hh = Math.max(0.02, sy),
                    tt = Math.max(0.01, sz);
                const v = [
                    -w / 2,
                    -hh / 2,
                    tt / 2,
                    w / 2,
                    -hh / 2,
                    tt / 2,
                    0,
                    hh / 2,
                    tt / 2, // Front
                    -w / 2,
                    -hh / 2,
                    -tt / 2,
                    w / 2,
                    -hh / 2,
                    -tt / 2,
                    0,
                    hh / 2,
                    -tt / 2, // Rück
                ];
                const tri = [0, 1, 2, 5, 4, 3, 0, 3, 1, 1, 3, 4, 1, 4, 2, 2, 4, 5, 2, 5, 0, 0, 5, 3];
                const g = new THREE.BufferGeometry();
                g.setAttribute("position", new THREE.Float32BufferAttribute(v, 3));
                g.setIndex(tri);
                g.computeVertexNormals();
                return g;
            }
            case "box":
            default:
                return new THREE.BoxGeometry(sx, sy, sz);
        }
    }

    // ═══ DIE ARCHITEKTUR-GRAMMATIK ═══
    // Kein Spiel-Pfad ruft sie mehr (Tempel kommen aus den fachwerk-Kulturen); sie bleibt als
    // Physik-Richter-Saat für die diag-genom-Gates. Aus der ORDNUNG (dorisch/ionisch) folgt alles:
    // Schlankheit (dorisch 1:7), Entasis + Kanneluren, Kapitell, Gebälk, Giebel — die Säulen schließen
    // den Lastpfad und knicken nicht. Reine Daten; peripteral, columnsFront/Side parametrisch.
    _buildClassicalTemple(orderName, opts) {
        const O =
            (AnazhRealm.CLASSICAL_ORDERS && AnazhRealm.CLASSICAL_ORDERS[orderName]) ||
            AnazhRealm.CLASSICAL_ORDERS.dorisch;
        opts = opts || {};
        const D = opts.columnDiameter || 0.85; // unterer Säulen-Durchmesser = das Modul
        const colsFront = Math.max(2, opts.columnsFront || O.columnsFront || 6); // hexastyle
        const colsSide = Math.max(2, opts.columnsSide || 2 * (O.columnsFront || 6) - 3); // dorische Tiefen-Regel
        const shaftH = D * O.slenderness; // Schaft-Höhe = Schlankheit × D (dorisch 1:7)
        const axis = D * O.intercolumniation; // Achs-Abstand der Säulen
        const mat = "stein";
        // Stein-Paletten-Override (Marmor/Sandstein/Granit/Basalt, aus dem Seed gewürfelt): Material bleibt
        // "stein" (Affinität unberührt), nur die Farben wechseln. Default = Ordnungs-Marmor.
        const PAL = opts.palette || null;
        const marble = (PAL && PAL.marble) || O.marble;
        const cap = (PAL && PAL.cap) || O.capitalColor || 0xe4ddca;
        const friezeCol = (PAL && PAL.frieze) || 0xd7cfba;
        const trigCol2 = (PAL && PAL.trig) || 0xc9c1ac;
        const parts = [];
        const frontW = (colsFront - 1) * axis; // Achs-Spanne in X
        const sideD = (colsSide - 1) * axis; // Achs-Spanne in Z
        const halfX = frontW / 2;
        const halfZ = sideD / 2;
        const box = (color, x, y, z, sx, sy, sz) =>
            parts.push({ shape: "box", material: mat, color, position: { x, y, z }, size: { x: sx, y: sy, z: sz } });

        // (1) STYLOBAT/KREPIS — 3 gestufte rechteckige Stufen (abnehmend nach oben).
        const stepColor = (PAL && PAL.step) || 0xcfc8b4;
        const steps = [
            { m: 3.2, y: 0.2, h: 0.4 },
            { m: 2.4, y: 0.55, h: 0.35 },
            { m: 1.7, y: 0.85, h: 0.3 }, // die oberste = der Stylobat, auf dem die Säulen stehen
        ];
        for (const s of steps) box(stepColor, 0, s.y, 0, frontW + s.m * D + 2 * D, s.h, sideD + s.m * D + 2 * D);
        const stylTop = 1.0; // Oberkante Stylobat = Säulen-Fuß

        // (2) PERISTYL — die Säulen am Rechteck-Rand (peripteral). Jede: optional Basis
        // (ionisch), flutedColumn-SCHAFT (Entasis + Kanneluren), Echinus-Flare + Abakus.
        const baseH = O.hasBase ? D * 0.28 : 0;
        const echH = D * 0.26;
        const abH = D * 0.16;
        const abW = D * 1.18;
        const shaftTopR = (D * O.topRatio) / 2;
        const colTopY = stylTop + baseH + shaftH + echH + abH;
        const isPerimeter = (fx, fz) => fx === 0 || fx === colsFront - 1 || fz === 0 || fz === colsSide - 1;
        for (let fx = 0; fx < colsFront; fx++) {
            for (let fz = 0; fz < colsSide; fz++) {
                if (!isPerimeter(fx, fz)) continue;
                const px = (fx - (colsFront - 1) / 2) * axis;
                const pz = (fz - (colsSide - 1) / 2) * axis;
                let y = stylTop;
                if (O.hasBase) {
                    box(marble, px, y + baseH / 2, pz, D * 1.15, baseH, D * 1.15); // Profil-Basis (ionisch)
                    y += baseH;
                }
                parts.push({
                    shape: "flutedColumn",
                    material: mat,
                    color: marble,
                    position: { x: px, y: y + shaftH / 2, z: pz },
                    size: { x: D, y: shaftH, z: D * O.topRatio }, // Entasis: oberer ⌀ < unterer
                    flutes: O.flutes,
                    fluteDepth: O.fluteDepth,
                    entasis: O.entasis,
                    heightSegments: 6,
                });
                y += shaftH;
                // Echinus: ein nach oben aufweitender Flare (Kissen) — unterer ⌀ = Schaft-Top,
                // oberer ⌀ = Richtung Abakus. cylinder nimmt top=sx/2, bottom=sz/2 → sx>sz = Flare.
                parts.push({
                    shape: "cylinder",
                    material: mat,
                    color: cap,
                    position: { x: px, y: y + echH / 2, z: pz },
                    size: { x: D * 1.02, y: echH, z: shaftTopR * 2 },
                    segments: 14,
                });
                y += echH;
                box(cap, px, y + abH / 2, pz, abW, abH, abW); // Abakus (quadratische Deckplatte)
            }
        }

        // (3) GEBÄLK — der EINE Ring aus 4 Balken je Schicht (Architrav · Fries · Gesims).
        const archH = D * 0.85;
        const friezeH = D * 0.8;
        const cornH = D * 0.36;
        const ringX = frontW + 1.6 * D; // Außenmaß des Gebälks in X
        const ringZ = sideD + 1.6 * D;
        const beamW = D * 0.7;
        const ringRow = (color, yc, h, ext) => {
            const ex = ext || 0;
            box(color, 0, yc, halfZ + beamW / 2 + ex, frontW + 2 * D + 2 * ex, h, beamW); // vorne (+Z)
            box(color, 0, yc, -(halfZ + beamW / 2 + ex), frontW + 2 * D + 2 * ex, h, beamW); // hinten
            box(color, halfX + beamW / 2 + ex, yc, 0, beamW, h, sideD + 2 * D); // rechts (+X)
            box(color, -(halfX + beamW / 2 + ex), yc, 0, beamW, h, sideD + 2 * D); // links
        };
        const archY = colTopY + archH / 2;
        ringRow(marble, archY, archH); // Architrav
        const friezeY = colTopY + archH + friezeH / 2;
        ringRow(friezeCol, friezeY, friezeH); // Fries (Grundband)
        const cornY = colTopY + archH + friezeH + cornH / 2;
        ringRow(cap, cornY, cornH, D * 0.35); // Gesims (Überstand)

        // (3b) TRIGLYPHEN — die dorische Fries-Signatur: an JEDER Säule + JEDER Joch-Mitte
        // ein Triglyph (vorstehender Block) auf der Vorder-/Rück-Front (die Giebel-Fronten).
        const trigW = D * 0.34;
        const trigD = D * 0.16;
        const trigCol = trigCol2;
        const trigZ = halfZ + beamW + trigD / 2;
        const trigPositions = [];
        for (let k = 0; k < colsFront; k++) trigPositions.push((k - (colsFront - 1) / 2) * axis); // über den Säulen
        for (let k = 0; k < colsFront - 1; k++) trigPositions.push((k - (colsFront - 1) / 2) * axis + axis / 2); // über den Jochen
        for (const tx of trigPositions) {
            box(trigCol, tx, friezeY, trigZ, trigW, friezeH * 0.92, trigD);
            box(trigCol, tx, friezeY, -trigZ, trigW, friezeH * 0.92, trigD);
        }

        // (4) GIEBEL — Satteldach: zwei geneigte Flächen treffen sich am First (längs Z) → dreieckige
        // Pediment-Silhouette an den Schmalseiten; das Dach ruht auf dem Gesims (Lastpfad geschlossen).
        const eaveY = cornY + cornH / 2;
        const roofRise = ringX * 0.16; // Giebel-Höhe ≈ Spannweite/6 (flacher griechischer Giebel ~17°)
        const eaveX = ringX / 2 + 0.4 * D; // X der Traufe (mit Überstand)
        const slopeLen = Math.hypot(eaveX, roofRise);
        const pitch = Math.atan2(roofRise, eaveX);
        const roofThick = D * 0.22;
        const roofZ = ringZ + 0.8 * D;
        for (const sgn of [-1, 1]) {
            // Jede Dach-Fläche läuft von der Traufe (außen ±X, tief) zum First (x=0, hoch): Rotation
            // `−sgn·pitch` — `sgn·pitch` ergäbe einen Schmetterling statt Giebel.
            parts.push({
                shape: "box",
                material: mat,
                color: cap,
                position: { x: (sgn * eaveX) / 2, y: eaveY + roofRise / 2, z: 0 },
                size: { x: slopeLen, y: roofThick, z: roofZ },
                rotation: { x: 0, y: 0, z: -sgn * pitch },
            });
        }
        box(cap, 0, eaveY + roofRise + roofThick * 0.3, 0, D * 0.5, roofThick * 1.2, roofZ); // First-Balken
        // TYMPANON — das dreieckige Giebelfeld schließt den Giebel vorne + hinten (kein offenes Dach).
        for (const sgnZ of [-1, 1]) {
            parts.push({
                shape: "gableTriangle",
                material: mat,
                color: trigCol2,
                position: { x: 0, y: eaveY + roofRise / 2, z: sgnZ * (ringZ / 2 + 0.05 * D) },
                size: { x: eaveX * 1.9, y: roofRise, z: roofThick * 0.9 },
            });
        }

        // (5) CELLA (Naos) — der innere Raum: 4 Wände innerhalb des Peristyls, auf dem
        // Stylobat bis unters Gebälk. Die FRONT-Wand (+Z) trägt den EINGANG — eine TÜR
        // (Lücke + Sturz), durch die man den Tempel betritt (der „Eingang", Schöpfer-Wunsch).
        const cellaX = frontW - 1.4 * D;
        const cellaZ = sideD - 1.4 * D;
        const cellaH = shaftH + echH + abH;
        const cellaYc = stylTop + cellaH / 2;
        const wallT = D * 0.4;
        const wallC = (PAL && PAL.wall) || 0xc4bda8;
        const cellaFrontZ = cellaZ / 2;
        const doorW = Math.min(cellaX * 0.5, 1.7 * D); // Tür-Breite
        const doorH = cellaH * 0.72; // Tür-Höhe
        const sideW = (cellaX - doorW) / 2; // je ein Wand-Pfeiler links + rechts der Tür
        box(wallC, -(doorW / 2 + sideW / 2), cellaYc, cellaFrontZ, sideW, cellaH, wallT); // Pfeiler links
        box(wallC, doorW / 2 + sideW / 2, cellaYc, cellaFrontZ, sideW, cellaH, wallT); // Pfeiler rechts
        box(wallC, 0, stylTop + (doorH + cellaH) / 2, cellaFrontZ, doorW, cellaH - doorH, wallT); // Sturz über der Tür
        box(wallC, 0, cellaYc, -cellaZ / 2, cellaX, cellaH, wallT); // Rück-Wand (geschlossen)
        box(wallC, cellaX / 2, cellaYc, 0, wallT, cellaH, cellaZ - wallT); // Seiten-Wand +X
        box(wallC, -cellaX / 2, cellaYc, 0, wallT, cellaH, cellaZ - wallT); // Seiten-Wand −X

        // (6) ALTAR + KRISTALL — im Cella-Inneren, auf dem Boden (Lastpfad intakt: der
        // Kristall sitzt auf dem Altar, schwebt NICHT — der Tempel ist strukturell ehrlich).
        box(0x8a7a9a, 0, stylTop + 0.35, 0, 1.5, 0.7, 1.5); // Altar-Sockel
        box(0x6a4a8a, 0, stylTop + 0.95, 0, 1.0, 0.6, 1.0); // Altar
        parts.push({
            shape: "octahedron",
            material: "quarz",
            color: 0xd9a3ff,
            position: { x: 0, y: stylTop + 1.6, z: 0 },
            size: { x: 0.8, y: 1.0, z: 0.8 },
        });
        return parts;
    }

    // ═══ DER GETEILTE GENOM-ROLLER ═══
    // EINE Quelle für deterministisches Achsen-Würfeln aller _<genre>Variant, UNSIGNED (`h >>> n` lebt
    // NUR hier). Jede Achse ist ein eigener FNV-Stream (namespace|seed|name) → eine neue Achse re-rollt
    // nie eine andere. `.seq(name)` = sequentieller xorshift32-Sub-Strom für Wuchs-Schleifen.
    _rollGenome(seed, namespace) {
        const base = (namespace == null ? "g" : String(namespace)) + "|" + (seed == null ? "anazh" : String(seed));
        const hashStr = (str) => {
            let h = 2166136261;
            for (let i = 0; i < str.length; i++) {
                h ^= str.charCodeAt(i);
                h = Math.imul(h, 16777619);
            }
            return h >>> 0; // UNSIGNED — die EINE Vorzeichen-Wand
        };
        const axis = (name) => hashStr(base + "|" + String(name)) / 4294967296; // [0,1)
        return {
            seed: seed,
            namespace: namespace,
            axis: axis,
            // lo + axis·(hi−lo) → kontinuierlich [lo, hi)
            range: (name, lo, hi) => lo + axis(name) * (hi - lo),
            // ganzzahlig, INKLUSIV [lo..hi]
            int: (name, lo, hi) => lo + Math.floor(axis(name) * (hi - lo + 1)),
            // ein Element der Liste (UNSIGNED → kein neg.-Index-Leak)
            pick: (name, list) =>
                list && list.length ? list[Math.floor(axis(name) * list.length) % list.length] : undefined,
            chance: (name, p) => axis(name) < p,
            // sequentieller Sub-Strom für Wuchs-Schleifen: deterministisch, eigener
            // Strom je name (unabhängig von den Achsen UND voneinander). xorshift32.
            seq: (name) => {
                let h = hashStr(base + "#" + String(name)) || 1;
                return () => {
                    h ^= h << 13;
                    h >>>= 0;
                    h ^= h >> 17;
                    h ^= h << 5;
                    h >>>= 0;
                    return h / 4294967296;
                };
            },
        };
    }

    // ═══ DAS FELS-GENOM ═══
    // Form-Klasse (Brocken · Stapel · Nadel · Geröll), Größe, Verwitterung, Detail über den geteilten
    // Roller. Tag-neutral (nur `noiserock` + `stein` → Affinität wie stein_block). Der Fels steht, der
    // Stapel-Lastpfad schließt, die Nadel knickt nicht (diag-genom); Stapel bleibt achsen-parallel
    // (exakter AABB-Lastpfad).
    _rockVariant(seed) {
        const g = this._rollGenome(seed, "rock");
        const parts = [];
        // Sediment-Schichtung: die noiserock-Farbe folgt der Welt-Höhe (Strata-Bänder); ein feuchter Fels
        // (mossy) trägt am Fuß Flechten. Nur Farbe → Tags bleiben == stein_block.
        const mossy = g.chance("mossy", 0.4);
        const SEDIMENT = [0x6f6b62, 0x787262, 0x837c6e, 0x6a6258, 0x726c60, 0x7d7568];
        const blendCol = (a, b, t) => {
            t = Math.max(0, Math.min(1, t));
            const ar = (a >> 16) & 0xff,
                ag = (a >> 8) & 0xff,
                ab = a & 0xff;
            const br = (b >> 16) & 0xff,
                bg = (b >> 8) & 0xff,
                bb = b & 0xff;
            return (
                ((Math.round(ar + (br - ar) * t) & 0xff) << 16) |
                ((Math.round(ag + (bg - ag) * t) & 0xff) << 8) |
                (Math.round(ab + (bb - ab) * t) & 0xff)
            );
        };
        const rock = (x, y, z, sx, sy, sz, str, det, rot) => {
            let col = SEDIMENT[Math.abs(Math.floor(y * 1.7)) % SEDIMENT.length]; // Strata aus der Höhe
            if (mossy && y < 1.2) col = blendCol(col, 0x4a5a36, 0.5 * (1 - y / 1.2)); // Moos am Fuß
            parts.push({
                shape: "noiserock",
                material: "stein",
                color: col,
                position: { x, y, z },
                size: { x: sx, y: sy, z: sz },
                noiseStrength: str,
                noiseDetail: det,
                ...(rot ? { rotation: rot } : {}),
            });
        };
        const form = g.pick("form", ["brocken", "brocken", "stapel", "nadel", "geroell"]);
        this._lastLandmarkForm = form; // T-FULLSTACK: die Form reist zur Platzierung (field-meaningful)
        const weather = g.range("weather", 0.12, 0.4); // Verwitterung (scharf↔gerundet)
        const det = g.int("detail", 1, 2);
        if (form === "brocken") {
            // ein gedrungener Felsbrocken (breite Basis, tief → kippt nie); optional ein Begleiter.
            const r = g.range("brockenR", 0.7, 2.6);
            rock(0, r * 0.5, 0, r * 1.4, r * 0.95, r * 1.3, weather, det);
            if (g.chance("companion", 0.55)) {
                const r2 = r * g.range("c2", 0.3, 0.55);
                rock(r * 0.85, r2 * 0.5, r * 0.4, r2 * 1.3, r2 * 0.9, r2 * 1.2, weather, det, {
                    x: 0.15,
                    y: g.axis("cy") * 6.283,
                    z: 0.1,
                });
            }
        } else if (form === "stapel") {
            // ein verwitterter Stapel/Cairn: N achsen-parallele Blöcke, jeder auf dem
            // darunter (überlappend → Lastpfad schließt), nach oben schmaler, kleiner
            // Versatz (Schwerpunkt bleibt über der Basis → steht, Ω-Φ2).
            const n = g.int("stackN", 3, 5);
            let r = g.range("stapelR", 0.65, 1.25);
            let y = 0;
            for (let i = 0; i < n; i++) {
                const bw = r * 1.6;
                const bh = r * 0.9;
                y += bh * 0.5;
                rock(
                    (g.axis("ox" + i) - 0.5) * r * 0.3,
                    y,
                    (g.axis("oz" + i) - 0.5) * r * 0.3,
                    bw,
                    bh,
                    bw * 0.92,
                    weather,
                    det
                );
                y += bh * 0.42; // den nächsten Block leicht überlappen (Lastpfad-Berührung)
                r *= 0.8;
            }
        } else if (form === "nadel") {
            // eine verjüngte Fels-NADEL/Spire mit BREITEM Fuß (steht + knickt nicht).
            const h = g.range("nadelH", 3, 7.5);
            const baseR = h * 0.16; // breite Basis → Schwerpunkt stabil + niedrige Schlankheit
            const segs = 4;
            let y = 0;
            for (let i = 0; i < segs; i++) {
                const t = i / segs;
                const rr = baseR * (1 - t * 0.62);
                const segH = h / segs;
                rock(0, y + segH * 0.5, 0, rr * 2, segH, rr * 2, weather, det);
                y += segH;
            }
        } else {
            // Geröll-Streu (Scree): N kleine Felsen, jeder auf dem Boden (alle boden-
            // verankert → Lastpfad intakt; die gemeinsame Hülle trägt den Schwerpunkt).
            const n = g.int("screeN", 4, 7);
            for (let i = 0; i < n; i++) {
                const rr = g.range("r" + i, 0.18, 0.55);
                const ang = g.axis("a" + i) * 6.283;
                const dist = g.range("d" + i, 0, 1.1);
                rock(
                    Math.cos(ang) * dist,
                    rr * 0.45,
                    Math.sin(ang) * dist,
                    rr * 1.2,
                    rr * 0.85,
                    rr * 1.1,
                    weather,
                    det,
                    {
                        x: g.axis("rx" + i) * 0.4,
                        y: g.axis("ry" + i) * 6.283,
                        z: g.axis("rz" + i) * 0.4,
                    }
                );
            }
        }
        return parts;
    }

    // ═══ DAS KRISTALL-GENOM ═══
    // Habitus (Einzel-Spitze · Cluster · Geode · Säulen-Druse) · Größe · Facetten. Nur `quarz` + die
    // kristall_geode-Formen → tag-frozen zu kristall_geode. Eine breite quarz-Matrix trägt die Spitzen.
    _crystalVariant(seed) {
        const g = this._rollGenome(seed, "crystal");
        const parts = [];
        // Quarz-Bett (flache Matrix, trägt Tags + Schwerpunkt) + N facettierte `crystalPoint`-Spitzen. Achsen:
        // Habitus · Größe · Facetten · Spitzen-Zahl · Glanz (emissiv aus magieleitung). crystalPoint aktiviert
        // wie octahedron → Compound == kristall_geode. Breite ∝ Höhe hält den Knick-Richter.
        const glow = g.range("glow", 0.7, 1.7);
        const facets = g.int("facets", 6, 8); // n des Prismas (Quarz hexagonal, manche 8)
        const term = g.range("term", 0.26, 0.44);
        const sizeMul = g.range("size", 0.7, 1.8);
        const baseR = g.range("baseR", 0.5, 0.95) * sizeMul;
        const bed = (x, y, z, sx, sy, sz) =>
            parts.push({
                shape: "sphere",
                material: "quarz",
                color: 0x86bccf,
                opacity: 0.78,
                emissiveBoost: glow * 0.6,
                position: { x, y, z },
                size: { x: sx, y: sy, z: sz },
            });
        const point = (x, y, z, h, aspect, rot) => {
            const w = h * aspect; // die Schlankheit gebunden → knickt nicht (Ω-Φ3-b)
            parts.push({
                shape: "crystalPoint",
                material: "quarz",
                color: 0x9fd6e8,
                opacity: 0.86,
                emissiveBoost: glow,
                facets,
                termFrac: term,
                position: { x, y, z },
                size: { x: w, y: h, z: w },
                ...(rot ? { rotation: rot } : {}),
            });
        };
        const habitus = g.pick("habitus", ["einzel", "cluster", "geode", "druse"]);
        this._lastLandmarkForm = habitus; // T-FULLSTACK: die Habitus-Form reist zur Platzierung
        // das BETT — ein KLEINER, tief-sitzender quarz-Matrix-Nub (trägt nur die Tags + den
        // Fuß; sphere nutzt nur size.x → es ist IMMER rund, darum KLEIN halten, sonst dominiert
        // ein Ball [§11-Befund]). Die SPITZEN dominieren die Silhouette + wurzeln im Nub (Ω-Φ5).
        bed(0, baseR * 0.16, 0, baseR * 0.95, baseR * 0.6, baseR * 0.95);
        if (habitus === "einzel") {
            // EIN großer dominanter Quarz (ein „Kristall-Zepter") + tight wurzelnde Begleiter.
            const h = g.range("h", 2.1, 3.6) * sizeMul;
            point(0, baseR * 0.2 + h * 0.46, 0, h, g.range("asp", 0.3, 0.4), {
                x: g.range("tlt", -0.1, 0.1),
                y: g.axis("ry") * 6.283,
                z: g.range("tlt2", -0.1, 0.1),
            });
            const m = g.int("comp", 2, 3);
            for (let i = 0; i < m; i++) {
                const a = g.axis("a" + i) * 6.283;
                const d = baseR * g.range("d" + i, 0.2, 0.46);
                const hh = g.range("hh" + i, 0.9, 1.8) * sizeMul;
                point(Math.cos(a) * d, baseR * 0.2 + hh * 0.44, Math.sin(a) * d, hh, g.range("as" + i, 0.3, 0.42), {
                    x: Math.cos(a) * 0.35,
                    y: a,
                    z: Math.sin(a) * 0.35,
                });
            }
        } else if (habitus === "cluster") {
            const n = g.int("pts", 5, 9);
            for (let i = 0; i < n; i++) {
                const a = g.axis("a" + i) * 6.283;
                const d = g.range("d" + i, 0, baseR * 0.5);
                const hh = g.range("hh" + i, 1.0, 2.6) * sizeMul;
                point(Math.cos(a) * d, baseR * 0.18 + hh * 0.44, Math.sin(a) * d, hh, g.range("as" + i, 0.3, 0.4), {
                    x: Math.cos(a) * g.range("t" + i, 0.1, 0.4),
                    y: a,
                    z: Math.sin(a) * g.range("t2" + i, 0.1, 0.4),
                });
            }
        } else if (habitus === "geode") {
            const r = g.range("r", 0.8, 1.5) * sizeMul;
            bed(0, r * 0.18, 0, r * 1.1, r * 0.55, r * 1.1); // ein etwas breiterer Matrix-Boden
            const n = g.int("pts", 7, 11);
            for (let i = 0; i < n; i++) {
                const a = (i / n) * 6.283 + g.axis("j" + i) * 0.4;
                const hh = g.range("hh" + i, 0.55, 1.15) * r;
                const tilt = g.range("tl" + i, 0.35, 0.8);
                point(
                    Math.cos(a) * r * 0.42,
                    r * 0.3 + hh * 0.32,
                    Math.sin(a) * r * 0.42,
                    hh,
                    g.range("as" + i, 0.32, 0.42),
                    {
                        x: Math.sin(a) * -tilt,
                        y: a,
                        z: Math.cos(a) * tilt,
                    }
                );
            }
        } else {
            // druse: eine Säule aus Spitzen, nach oben schmaler (steht, knickt nicht).
            const n = g.int("pts", 4, 7);
            let y = baseR * 0.3;
            for (let i = 0; i < n; i++) {
                const hh = (1.1 - i * 0.1) * baseR * g.range("k", 1.4, 2.2);
                point(
                    (g.axis("ox" + i) - 0.5) * baseR * 0.5,
                    y + hh * 0.4,
                    (g.axis("oz" + i) - 0.5) * baseR * 0.5,
                    Math.max(0.18, hh),
                    g.range("as" + i, 0.32, 0.42),
                    {
                        x: g.range("rx" + i, -0.22, 0.22),
                        y: g.axis("ry" + i) * 6.283,
                        z: g.range("rz" + i, -0.22, 0.22),
                    }
                );
                y += hh * 0.3;
            }
        }
        return parts;
    }

    // ═══ DIE ESSE ALS FORGE ═══
    // Die Funktion diktiert die Teile: Feuerbox + Kohlen-Bett (`latheProfile`, emissiv) + Haube auf zwei
    // Pfeilern + Schornstein + Amboss (eisen + Horn auf Holz-Stumpf) + Blasebalg. Die Domäne bleibt
    // forging (_computeWorkshopDomain). opts.master = die Eisen-Meister-Esse.
    _buildForgeParts(opts) {
        opts = opts || {};
        const bodyMat = opts.master ? "eisen" : "stein";
        // Der Amboss-Werkstoff trägt die Steigerung: Basis-Esse BRONZE, Meister-Esse EISEN — ohne eisen
        // bleibt die Compound-dichte (Quelle von _workshopStationPrecision) unter der Meister-Esse.
        const anvilMat = opts.master ? "eisen" : "bronze";
        const anvilCol = opts.master ? 0x9aa0a6 : 0xb08d57;
        const stoneCol = opts.master ? 0x8a8f96 : 0x6a6258;
        const P = [];
        const add = (shape, material, x, y, z, sx, sy, sz, extra) =>
            P.push({ shape, material, position: { x, y, z }, size: { x: sx, y: sy, z: sz }, ...(extra || {}) });
        // (1) Feuerbox — der breite Herd (steht).
        add("box", bodyMat, 0, 0.55, 0, 2.0, 1.1, 1.6, { color: stoneCol });
        // (2) Kohlen-Bett — die glühende Glut (latheProfile-Schale, emissiv).
        add("latheProfile", "glut", 0, 1.18, 0, 1.4, 0.5, 1.2, {
            color: 0xff7a2a,
            opacity: 0.88,
            emissiveBoost: opts.master ? 1.7 : 1.5,
            profile: [
                [0, 0],
                [0.85, 0.05],
                [1.0, 0.35],
                [0.8, 0.6],
                [0, 0.66],
            ],
        });
        // (3) Esse-Haube auf zwei Hinter-Pfeilern (das Feuer bleibt vorn offen) + Schornstein.
        for (const sx of [-1, 1]) add("box", bodyMat, sx * 0.82, 1.7, -0.6, 0.24, 1.7, 0.24, { color: stoneCol });
        add("cone", bodyMat, 0, 2.85, -0.45, 1.9, 1.3, 1.5, { color: stoneCol });
        add("cylinder", bodyMat, 0, 3.8, -0.45, 0.55, 1.1, 0.55, { segments: 10, color: stoneCol });
        // (4) Amboss — eisen-Block + Horn auf einem Holz-Stumpf, neben dem Herd.
        add("cylinder", "holz", 1.55, 0.45, 0.6, 0.55, 0.9, 0.55, { segments: 8, color: 0x6e4a28 });
        add("box", anvilMat, 1.55, 1.05, 0.6, 0.5, 0.32, 1.0, { color: anvilCol });
        add("cone", anvilMat, 1.55, 1.05, 1.32, 0.32, 0.7, 0.32, {
            rotation: { x: Math.PI / 2, y: 0, z: 0 },
            color: anvilCol,
        });
        // (5) Blasebalg — ein Holz-Keil an der Herd-Seite (die Luft-Pumpe).
        add("box", "holz", -1.15, 0.8, 0, 0.5, 0.6, 1.1, { color: 0x6e4a28 });
        return P;
    }

    // ═══ DAS BAUWERK-GENOM ═══
    // Funktionale Bauten (Werkstätten · Portale · Rüstung · Trank · Fahrzeug) werden PARAMETRISIERT,
    // nie neu erfunden — die Funktion bleibt lesbar. Basis-verankert (der tiefste Boden bleibt am Ort →
    // kein Schweben nach dem Skalieren); index-basierte connections reisen mit (Part-Reihenfolge fest).
    _stationVariant(parts, seed) {
        if (!Array.isArray(parts) || !parts.length) return parts;
        const g = this._rollGenome(seed, "station");
        // Drei Achsen auf der bestehenden Parts-Liste: (1) GRÖSSE (Gesamt-Skala) · (2) PROPORTION
        // (nicht-uniform x/y/z, so beschränkt, dass Funktion + Stand halten) · (3) DETAIL-DICHTE (0–3
        // Ornamente, geklont aus einem bestehenden Teil gleicher Form+Material → tag-frozen, an die Bbox
        // skaliert) · dazu PALETTE (Farb-Tönung).
        const base = g.range("scale", 0.85, 1.35);
        const propX = g.range("propX", 0.85, 1.2);
        const propY = g.range("propY", 0.8, 1.25);
        const propZ = g.range("propZ", 0.85, 1.2);
        const sx = base * propX,
            sy = base * propY,
            sz = base * propZ;
        const tr = g.range("tintR", 0.84, 1.12),
            tg = g.range("tintG", 0.84, 1.12),
            tb = g.range("tintB", 0.84, 1.12);
        const clampB = (v) => Math.max(0, Math.min(255, Math.round(v)));
        const tint = (c) =>
            typeof c === "number"
                ? (clampB(((c >> 16) & 0xff) * tr) << 16) |
                  (clampB(((c >> 8) & 0xff) * tg) << 8) |
                  clampB((c & 0xff) * tb)
                : c;
        const lowBottom = (arr) => {
            let m = Infinity;
            for (const p of arr) {
                const py = (p.position && p.position.y) || 0;
                const syy = (p.size && p.size.y) || 0.3;
                if (py - syy / 2 < m) m = py - syy / 2;
            }
            return m;
        };
        const before = lowBottom(parts);
        const out = parts.map((p) => {
            const np = { ...p };
            if (p.size) np.size = { x: (p.size.x || 0.3) * sx, y: (p.size.y || 0.3) * sy, z: (p.size.z || 0.3) * sz };
            if (p.position)
                np.position = {
                    x: (p.position.x || 0) * sx,
                    y: (p.position.y || 0) * sy,
                    z: (p.position.z || 0) * sz,
                };
            if (typeof p.color === "number") np.color = tint(p.color);
            return np;
        });
        // ── DETAIL-DICHTE: Ornamente aus einem Klon-Teil (Form+Material gewahrt → tag-frozen) ──
        const detail = g.int("detail", 0, 3);
        if (detail > 0) {
            // Bbox des skalierten Kerns (für die Ornament-Platzierung am oberen Rand).
            let minX = Infinity,
                maxX = -Infinity,
                minZ = Infinity,
                maxZ = -Infinity,
                maxY = -Infinity;
            for (const p of out) {
                const px = (p.position && p.position.x) || 0,
                    py = (p.position && p.position.y) || 0,
                    pz = (p.position && p.position.z) || 0;
                const hx = ((p.size && p.size.x) || 0.3) / 2,
                    hy = ((p.size && p.size.y) || 0.3) / 2,
                    hz = ((p.size && p.size.z) || 0.3) / 2;
                if (px - hx < minX) minX = px - hx;
                if (px + hx > maxX) maxX = px + hx;
                if (pz - hz < minZ) minZ = pz - hz;
                if (pz + hz > maxZ) maxZ = pz + hz;
                if (py + hy > maxY) maxY = py + hy;
            }
            // Klon-Vorlage: das Teil mit dem KLEINSTEN Volumen (ein Detail, kein Tragwerk) —
            // sein shape+material wird übernommen → die Compound-Tags bleiben bit-identisch.
            let tmpl = out[0],
                tmplVol = Infinity;
            for (const p of out) {
                const v = ((p.size && p.size.x) || 0.3) * ((p.size && p.size.y) || 0.3) * ((p.size && p.size.z) || 0.3);
                if (v < tmplVol) {
                    tmplVol = v;
                    tmpl = p;
                }
            }
            const studS = Math.max(0.12, Math.min(maxX - minX, maxZ - minZ) * 0.14);
            // an den 4 oberen Ecken (innerhalb des Stützpolygons → kippt nicht), `detail` Stück.
            const corners = [
                [minX + studS, maxZ - studS],
                [maxX - studS, maxZ - studS],
                [minX + studS, minZ + studS],
                [maxX - studS, minZ + studS],
            ];
            for (let d = 0; d < detail; d++) {
                const [ox, oz] = corners[d % 4];
                // Den LOKALEN Scheitel an dieser Ecke finden (höchstes Teil, dessen Grundfläche die Ecke enthält) —
                // sonst schwebt der Stud bei hohen Strukturen über dem Schornstein.
                let localTop = -Infinity;
                for (const p of out) {
                    const px = (p.position && p.position.x) || 0,
                        pz = (p.position && p.position.z) || 0;
                    const hx = ((p.size && p.size.x) || 0.3) / 2,
                        hz = ((p.size && p.size.z) || 0.3) / 2,
                        hy = ((p.size && p.size.y) || 0.3) / 2,
                        py = (p.position && p.position.y) || 0;
                    if (ox >= px - hx && ox <= px + hx && oz >= pz - hz && oz <= pz + hz && py + hy > localTop)
                        localTop = py + hy;
                }
                if (!Number.isFinite(localTop)) continue; // nichts an dieser Ecke → kein Schweben
                out.push({
                    ...tmpl,
                    position: { x: ox, y: localTop - studS * 0.4, z: oz },
                    size: { x: studS, y: studS, z: studS },
                    ...(typeof tmpl.color === "number" ? { color: tint(tmpl.color) } : {}),
                });
            }
        }
        const shift = before - lowBottom(out); // den Boden re-verankern (kein Schweben)
        if (Math.abs(shift) > 1e-9) for (const p of out) if (p.position) p.position.y += shift;
        return out;
    }

    // ═══ DAS RÜSTUNGS-GENOM ═══
    // Gesten-/Bibliothek-gespawnt (nie scatter) → Material frei. Achsen: Brustplatten-Größe
    // (chestW/chestH) · Artikulation (Pauldron-Größe/-Spreizung, optional Gorget) · Werkstoff
    // (eisen/bronze → role bleibt armor). Bilateral symmetrisch; getragen → kein Stand-Richter.
    _armorVariant(seed) {
        const g = this._rollGenome(seed, "armor");
        const parts = [];
        const plateMat = g.pick("plateMat", ["eisen", "eisen", "bronze"]);
        const trimMat = plateMat === "eisen" ? "bronze" : "eisen";
        const chestW = g.range("chestW", 0.9, 1.35); // Platten-Breite (Sehne)
        const chestH = g.range("chestH", 1.0, 1.45); // Platten-Höhe
        const pauld = g.range("pauldron", 0.36, 0.62); // Schulter-Kappen-Größe
        const wrap = g.range("wrap", 1.7, 2.3); // wie eng der Brustpanzer umschließt
        const cY = 1.05;
        const spread = chestW * 0.52;
        // Gewölbte Platten (`plateShell`): Brustplatte + Pauldron-Paar + Fauld-Lamellen + Gurt + opt. Gorget.
        // (1) Brustplatte — gewölbt, Bauch nach vorn.
        parts.push({
            shape: "plateShell",
            material: plateMat,
            position: { x: 0, y: cY, z: 0 },
            size: { x: chestW, y: chestH, z: 0.42 },
            wrap,
        });
        // (2) Pauldrons — gewölbte Schulter-Kappen (Spiegel-Paar, nach außen geneigt).
        for (const sgn of [-1, 1])
            parts.push({
                shape: "plateShell",
                material: plateMat,
                position: { x: sgn * spread, y: cY + chestH * 0.4, z: 0.02 },
                size: { x: pauld, y: pauld * 0.8, z: pauld * 0.7 },
                wrap: 2.6,
                rotation: { x: 0, y: 0, z: sgn * 0.6 },
            });
        // (3) FAULD — artikulierte Lamellen-Schürze (2-3 horizontale Streifen unter der Brust).
        const lam = g.int("lam", 2, 3);
        for (let i = 0; i < lam; i++)
            parts.push({
                shape: "plateShell",
                material: plateMat,
                position: { x: 0, y: cY - chestH * 0.5 - i * 0.16, z: 0 },
                size: { x: chestW * (0.95 - i * 0.08), y: 0.15, z: 0.4 },
                wrap: wrap * 1.05,
            });
        // (4) Gurt-Zier (Material-Kontrast).
        parts.push({
            shape: "plateShell",
            material: trimMat,
            position: { x: 0, y: cY - chestH * 0.44, z: 0 },
            size: { x: chestW * 1.02, y: 0.12, z: 0.44 },
            wrap,
        });
        // (5) optional Gorget (Hals-Schutz).
        if (g.chance("gorget", 0.5))
            parts.push({
                shape: "plateShell",
                material: plateMat,
                position: { x: 0, y: cY + chestH * 0.55, z: 0.02 },
                size: { x: chestW * 0.5, y: 0.28, z: 0.36 },
                wrap: 2.4,
            });
        return parts;
    }

    // ═══ DAS TRANK-GENOM ═══
    // Phiolen-Proportion · Hals-Höhe · Glasur-Farbe (die Wirkung: heil/mana/blut/…). Materialien bleiben
    // weich (leder/kraut/holz) → role consumable robust.
    _potionVariant(seed) {
        const g = this._rollGenome(seed, "potion");
        const parts = [];
        const bodyW = g.range("bodyW", 0.4, 0.6); // Phiole-Breite
        const bodyH = g.range("bodyH", 0.55, 0.95); // Phiole-Höhe (schmal-hoch ↔ breit-gedrungen)
        const belly = g.range("belly", 0.82, 1.05); // Bauch-Fülle
        // Glasur-Farbe aus der Wirkung (eine kleine Trank-Palette: heil/mana/blut/gift/arkan).
        const glaze = g.pick("glaze", [0x4e9a3c, 0x3c8ad8, 0xd84e6e, 0xd8b43c, 0x9a4ed8]);
        const bodyY = bodyH * 0.5;
        // F2 (§11): eine geformte APOTHEKER-PHIOLE (`latheProfile`: Bauch · Schulter · Hals ·
        // Lippe) aus klarem Glas, durch das die Wirkungs-Flüssigkeit (Glasur-Farbe) sichtbar
        // ist + ein Korken. Liest als Trank, nicht als Ball+Zylinder (§11-Befund).
        const phial = [
            [0, 0],
            [0.5 * belly, 0.05],
            [0.58 * belly, 0.3],
            [0.5, 0.48],
            [0.28, 0.62],
            [0.24, 0.82],
            [0.32, 0.9],
            [0.26, 0.97],
            [0, 0.99],
        ];
        // Flasche (leder = das „Glas", klar) — die längliche Achse (size.y) ist die Höhe.
        parts.push({
            shape: "latheProfile",
            material: "leder",
            opacity: 0.42,
            color: 0xcfe6f0,
            position: { x: 0, y: bodyY, z: 0 },
            size: { x: bodyW, y: bodyH, z: bodyW },
            profile: phial,
        });
        // Flüssigkeit (kraut, Glasur-Farbe) — füllt den Bauch bis zu einem Meniskus.
        const liq = [
            [0, 0],
            [0.45 * belly, 0.05],
            [0.52 * belly, 0.28],
            [0.42, 0.46],
            [0.22, 0.56],
            [0, 0.59],
        ];
        parts.push({
            shape: "latheProfile",
            material: "kraut",
            color: glaze,
            opacity: 0.85,
            position: { x: 0, y: bodyY, z: 0 },
            size: { x: bodyW * 0.92, y: bodyH, z: bodyW * 0.92 },
            profile: liq,
        });
        // Korken (holz) auf dem Hals.
        parts.push({
            shape: "cylinder",
            material: "holz",
            color: 0x6e4a28,
            position: { x: 0, y: bodyY + bodyH * 0.49, z: 0 },
            size: { x: 0.14, y: 0.11, z: 0.14 },
            segments: 8,
        });
        return parts;
    }

    // ═══ DIE PARAMETRISCHE KLINGE ═══
    // Kein Spiel-Pfad ruft sie mehr (Klingen kommen aus den schmiede-core-Rezepten, Substanz aus
    // KIND_SUBSTANCE); sie bleibt Physik-Richter-Saat für die Balance-Gates (diag-genom). Oakeshott-Typ:
    // Knauf · Griff · Parier · Klinge mit Hohlkehle. Die BALANCE folgt aus der Massen-Verteilung der
    // Teile — gerechnet, nie gesetzt. Klinge eisen, Griff leder/holz.
    _buildBladedWeapon(typeName, opts) {
        const T =
            (AnazhRealm.OAKESHOTT_TYPES && AnazhRealm.OAKESHOTT_TYPES[typeName]) || AnazhRealm.OAKESHOTT_TYPES.XII;
        opts = opts || {};
        const parts = [];
        const gripLen = opts.gripLen || T.gripLen || 0.34;
        const pommelR = opts.pommelR || T.pommelR || 0.13; // der KONTERGEWICHT-Knauf (Balance!)
        const guardW = opts.guardW || T.guardW || 0.46; // die Parierstange (Kreuz)
        const bladeLen = opts.bladeLen || T.bladeLen;
        const bladeW = opts.bladeBaseW || T.bladeBaseW;
        const bladeThick = opts.bladeThick || T.thick;
        const steel = opts.bladeMaterial || "eisen";
        const gripMat = opts.gripMaterial || "leder";
        // (1) KNAUF (Pommel) — das Kontergewicht ganz unten; seine Masse balanciert die Klinge.
        // Oktaeder (facettiert) — zählt als spitze/klingen-Form (mit der bladeProfile-Klinge
        // hält das den pointedFraction hoch genug, dass das Werk als KLINGE liest, V17.86).
        parts.push({
            shape: "octahedron",
            material: steel,
            color: 0x9aa0a6,
            position: { x: 0, y: pommelR, z: 0 },
            size: { x: pommelR * 2, y: pommelR * 2, z: pommelR * 2 },
        });
        // (2) GRIFF — von über dem Knauf bis zur Parierstange.
        const gripY0 = pommelR * 2;
        parts.push({
            shape: "cylinder",
            material: gripMat,
            color: 0x4a3526,
            position: { x: 0, y: gripY0 + gripLen / 2, z: 0 },
            size: { x: 0.07, y: gripLen, z: 0.07 },
            segments: 8,
        });
        // (3) PARIER als Oktaeder (Kreuz mit Quillon-Spitzen): zählt als spitze Form, damit das Schwert
        // pointedFraction 0.75 trägt → cutPower > minePower (es schneidet, statt zu brechen).
        const guardY = gripY0 + gripLen;
        parts.push({
            shape: "octahedron",
            material: steel,
            color: 0x9aa0a6,
            position: { x: 0, y: guardY + 0.04, z: 0 },
            size: { x: guardW, y: 0.1, z: 0.16 },
        });
        // (4) KLINGE — der bladeProfile-Mesh: distale Verjüngung + Hohlkehle aus dem Oakeshott-Typ.
        const bladeY0 = guardY + 0.08;
        parts.push({
            shape: "bladeProfile",
            material: steel,
            color: 0xc7ccd2,
            position: { x: 0, y: bladeY0 + bladeLen / 2, z: 0 },
            size: { x: bladeW, y: bladeLen, z: bladeThick },
            tipWidth: T.tipWidth,
            fuller: T.fuller,
            heightSegments: 16,
        });
        return parts;
    }

    // Einen Bauplan in eine THREE.Group rendern; Materialien je Part. Ein Part mit
    // `animate: "water_wave"` bekommt die Wasser-Animation automatisch.
    _buildFromBlueprint(blueprint, depth, visited, opts) {
        // Fraktale Verschachtelung: shape:"blueprint" bettet via refName einen anderen Bauplan als
        // Sub-Group ein. Cycle-Guard über visited, Tiefe ≤ MAX_BLUEPRINT_DEPTH (4).
        const MAX_BLUEPRINT_DEPTH = 4;
        const d = depth || 0;
        const seen = visited || new Set();
        const group = new THREE.Group();
        if (!blueprint || !Array.isArray(blueprint.parts)) {
            group.userData.kind = blueprint ? blueprint.name : "empty";
            return group;
        }
        if (d > MAX_BLUEPRINT_DEPTH) {
            group.userData.kind = `${blueprint.name}_depthCapped`;
            return group;
        }
        // Cycle-Guard: ein Bauplan kann sich nicht selbst (direkt/indirekt)
        // enthalten — sonst Endlos-Rekursion. visited bleibt eine Pfad-Liste,
        // sodass Geschwister-Verwendungen erlaubt sind.
        if (seen.has(blueprint.name)) {
            group.userData.kind = `${blueprint.name}_cycle`;
            return group;
        }
        seen.add(blueprint.name);
        const materials = [];
        const waveTargets = [];
        for (const part of blueprint.parts) {
            if (part.shape === "blueprint" && typeof part.refName === "string") {
                const ref = this.state.blueprints && this.state.blueprints[part.refName];
                if (!ref) continue;
                const sub = this._buildFromBlueprint(ref, d + 1, seen);
                const pos = part.position || { x: 0, y: 0, z: 0 };
                sub.position.set(pos.x || 0, pos.y || 0, pos.z || 0);
                if (part.rotation) {
                    sub.rotation.set(part.rotation.x || 0, part.rotation.y || 0, part.rotation.z || 0);
                }
                const s = part.scale;
                if (typeof s === "number" && s > 0) {
                    sub.scale.setScalar(s);
                } else if (s && typeof s === "object") {
                    sub.scale.set(s.x || 1, s.y || 1, s.z || 1);
                }
                group.add(sub);
                continue;
            }
            const geom = this._makePartGeometry(part);
            // Farbe: explizites part.color (Werkstatt-Wahl) vor der Material-Farbe, sonst Weiß. Präzision
            // moduliert die Helligkeit (0.6 + 0.4·precision) — roh gebaut wirkt matt, poliert voll.
            let baseColor = typeof part.color === "number" ? part.color : null;
            const partMatDef =
                typeof part.material === "string" && this.state.materials ? this.state.materials[part.material] : null;
            if (baseColor === null && partMatDef && typeof partMatDef.color === "number") {
                baseColor = partMatDef.color;
            }
            if (baseColor === null) baseColor = 0xffffff;
            const precision = this.computePartPrecision(part);
            const brightness = 0.6 + 0.4 * Math.max(0, Math.min(1, precision));
            const r8 = (baseColor >> 16) & 0xff;
            const g8 = (baseColor >> 8) & 0xff;
            const b8 = baseColor & 0xff;
            const tintedColor =
                ((Math.round(r8 * brightness) & 0xff) << 16) |
                ((Math.round(g8 * brightness) & 0xff) << 8) |
                (Math.round(b8 * brightness) & 0xff);
            const matOpts = { color: tintedColor };
            // W-E (§8.3) — die Antenne IST die Substanz: das Material-Tag-Profil
            // reist in den Material-Bau (Glut glimmt, Eisen spiegelt, Holz wärmt).
            if (partMatDef && partMatDef.tags) matOpts.tags = partMatDef.tags;
            // Trägt die Part-Geometrie ein `color`-Attribut (phyto-core `withColor`-Fels), liest das Material die
            // Vertex-Farbe als Albedo (`vertexColorAlbedo` in _buildPbrNodeMaterial, ohne Terrain-Geologie-
            // Overlay). Rein geometrie-getrieben; Parts ohne color-Attribut unverändert.
            if (geom && geom.attributes && geom.attributes.color) {
                matOpts.vertexColors = true;
                matOpts.vertexColorAlbedo = true;
            }
            // T3 — der per-Teil GLANZ-Boost (Kristall/Glut-Genom): skaliert den tag-getragenen
            // Emissiv-Glimmen je Variante (tag-neutral; das SEIN bleibt der Material-Tag).
            if (Number.isFinite(part.emissiveBoost)) matOpts.emissiveBoost = part.emissiveBoost;
            if (Number.isFinite(part.opacity) && part.opacity < 1) {
                matOpts.transparent = true;
                matOpts.opacity = part.opacity;
            }
            // Architektur-Part-Material über den EINEN Helfer _buildToonNodeMaterial (immer PBR: roughness/
            // metalness aus den Tags).
            const mat = this._buildToonNodeMaterial(matOpts);
            materials.push(mat);
            const mesh = new THREE.Mesh(geom, mat);
            const pos = part.position || { x: 0, y: 0, z: 0 };
            mesh.position.set(pos.x || 0, pos.y || 0, pos.z || 0);
            if (part.rotation) {
                mesh.rotation.set(part.rotation.x || 0, part.rotation.y || 0, part.rotation.z || 0);
            }
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);
            if (part.animate === "water_wave") waveTargets.push(mesh);
        }
        seen.delete(blueprint.name);
        group.userData.kind = blueprint.name;
        group.userData.materials = materials;
        // Wasser-Animations-Hook: alle Wasser-Planes Sinus-wellen lassen.
        // baseY je Mesh cachen damit die Welle relativ zur Ausgangsposition
        // schwingt statt absolut zur 0.
        if (waveTargets.length > 0) {
            const captured = waveTargets.map((mesh) => {
                const positions = mesh.geometry.attributes.position;
                const baseY = new Float32Array(positions.count);
                for (let i = 0; i < positions.count; i++) baseY[i] = positions.getY(i);
                return { mesh, positions, baseY };
            });
            group.userData.animate = (t) => {
                for (const cap of captured) {
                    for (let i = 0; i < cap.positions.count; i++) {
                        const y = cap.baseY[i];
                        const wave = Math.sin(t * 4.5 + y * 1.5) * 0.12;
                        cap.positions.setZ(i, wave);
                    }
                    cap.positions.needsUpdate = true;
                }
            };
        }
        // Verbindungs-Linien nur am Top-Level (sonst doppelt bei Fraktal-Bauplänen). Farbe/Opacity folgen der
        // Lastformel (stark grün, ok goldgelb, schwach rot). Werkstatt-Werkzeug, kein Welt-Schmuck: nur mit
        // opts.connectionLines — depthTest:false zeichnete sonst über jedes gespawnte Werk.
        if (
            opts &&
            opts.connectionLines === true &&
            !depth &&
            Array.isArray(blueprint.connections) &&
            blueprint.connections.length > 0
        ) {
            this._addConnectionLines(group, blueprint);
        }
        // Ein EXPLIZIT gesetzter sitz-Anker trägt eine Sattel-Andeutung als Teil des Werks (Welt UND
        // Werkstatt); Linien/Marker/Ghost bleiben opts-bestellt. Top-Level only; children[i]↔parts[i] bleibt
        // heil (Anhang am ENDE, vom Preview-Mapping übersprungen).
        if (!depth && Array.isArray(blueprint.connections)) {
            const sitzConn = blueprint.connections.find(
                (c) => c && c.type === "sitz" && blueprint.parts && blueprint.parts[c.partA]
            );
            if (sitzConn) {
                const seat = this._buildSeatVisual(blueprint);
                if (seat) group.add(seat);
            }
        }
        return group;
    }

    // Sattel am sitz-Anker: Leder-Kissen + Pommel, reiter-skaliert (nicht mit dem Gefährt). Position =
    // exakt der _attachPointFor-Punkt, den auch der Reiter konsumiert.
    _buildSeatVisual(blueprint) {
        const ap = this._attachPointFor(blueprint, "sitz");
        if (!ap || !ap.point) return null;
        const grp = new THREE.Group();
        const leather = this._buildToonNodeMaterial({ color: 0x6b4a2f });
        const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.09, 0.46), leather);
        cushion.position.y = 0.045;
        grp.add(cushion);
        const pommel = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.1), leather);
        pommel.position.set(0, 0.1, 0.2);
        grp.add(pommel);
        grp.position.set(ap.point.x, ap.point.y, ap.point.z);
        grp.userData.isAttachmentVisual = true;
        grp.userData.connectionType = "sitz";
        return grp;
    }

    // Probesitzen in der Werkstatt: durchscheinender Reiter-Ghost in der _applySeatPose-Haltung am
    // sitz-Anker (opts-bestellt wie Linien/Marker) — zeigt Höhe + Richtung ohne Aufsteigen.
    _buildSeatGhost(point) {
        const grp = new THREE.Group();
        const mat = new THREE.MeshBasicMaterial({
            color: 0x9fd8ff,
            transparent: true,
            opacity: 0.3,
            depthWrite: false,
        });
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.5, 0.2), mat);
        torso.position.y = 0.62;
        grp.add(torso);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), mat);
        head.position.y = 1.0;
        grp.add(head);
        for (const side of [-1, 1]) {
            const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.12, 0.42), mat);
            thigh.position.set(side * 0.11, 0.32, 0.16);
            grp.add(thigh);
            const shin = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.36, 0.11), mat);
            shin.position.set(side * 0.11, 0.1, 0.34);
            grp.add(shin);
            const arm = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.36, 0.09), mat);
            arm.position.set(side * 0.24, 0.62, 0.1);
            arm.rotation.x = -0.45;
            grp.add(arm);
        }
        grp.position.set(point.x, point.y, point.z);
        grp.userData.isConnectionLine = true; // Ablese-Werkzeug: vom Preview-Part-Mapping übersprungen
        grp.userData.isSeatGhost = true;
        return grp;
    }

    // Welle 6.F1 — Verbindungs-Linien an einen Bauplan-Group anhängen.
    _addConnectionLines(group, blueprint) {
        const conns = blueprint.connections || [];
        const parts = blueprint.parts || [];
        for (const c of conns) {
            const a = parts[c.partA];
            // Anker-Punkte (attachment, partB=-1) zeigen im Viewer einen violetten Mini-Oktaeder am exakten
            // Face-Snap-Punkt (Default = _attachPointFor, derselbe Punkt, den Hand/Reiter/Torso konsumieren).
            const typeDef = AnazhRealm.CONNECTION_TYPES[c.type];
            if (typeDef && typeDef.attachment) {
                if (!a) continue;
                const pa = a.position || { x: 0, y: 0, z: 0 };
                let px = pa.x || 0;
                let py = pa.y || 0;
                let pz = pa.z || 0;
                if (c.anchor && Number.isFinite(c.anchor.x) && Number.isFinite(c.anchor.y)) {
                    px += c.anchor.x;
                    py += c.anchor.y;
                    pz += c.anchor.z || 0;
                } else if (c.type === "sitz") {
                    py += Math.abs((a.size && a.size.y) || 0.3) / 2;
                }
                const anchorMarker = new THREE.Mesh(
                    new THREE.OctahedronGeometry(0.14, 0),
                    new THREE.MeshBasicMaterial({
                        color: 0xb06ad9,
                        transparent: true,
                        opacity: 0.95,
                        depthTest: false,
                    })
                );
                anchorMarker.position.set(px, py, pz);
                anchorMarker.renderOrder = 1000;
                anchorMarker.userData.isConnectionLine = true;
                anchorMarker.userData.connectionType = c.type;
                anchorMarker.userData.isAnchorPoint = true;
                group.add(anchorMarker);
                // Am sitz-Anker sitzt der Reiter-Ghost (Werkstatt-only, opts-bestellt).
                if (c.type === "sitz") {
                    group.add(this._buildSeatGhost({ x: px, y: py, z: pz }));
                }
                continue;
            }
            const b = parts[c.partB];
            if (!a || !b) continue;
            const pa = a.position || { x: 0, y: 0, z: 0 };
            const pb = b.position || { x: 0, y: 0, z: 0 };
            const strength = this.computeConnectionStrength(c, blueprint);
            const color = this._connectionColor(strength);
            // Die Linie verläuft zwischen Part-Zentren und steckt bei überlappenden Parts im Mesh — darum
            // depthTest:false + hoher renderOrder; der Mittelpunkt-Marker zeigt die Verbindung auch bei
            // voller Überlappung.
            const geom = new THREE.BufferGeometry();
            geom.setAttribute(
                "position",
                new THREE.Float32BufferAttribute([pa.x || 0, pa.y || 0, pa.z || 0, pb.x || 0, pb.y || 0, pb.z || 0], 3)
            );
            const mat = new THREE.LineBasicMaterial({
                color,
                transparent: true,
                opacity: 0.9,
                depthTest: false,
            });
            const line = new THREE.Line(geom, mat);
            line.renderOrder = 999;
            line.userData.isConnectionLine = true;
            line.userData.connectionStrength = strength;
            line.userData.connectionType = c.type;
            group.add(line);
            // Mittelpunkt-Marker — ein kleiner Oktaeder in der Lastfarbe.
            const marker = new THREE.Mesh(
                new THREE.OctahedronGeometry(0.28, 0),
                new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.92, depthTest: false })
            );
            marker.position.set(
                ((pa.x || 0) + (pb.x || 0)) / 2,
                ((pa.y || 0) + (pb.y || 0)) / 2,
                ((pa.z || 0) + (pb.z || 0)) / 2
            );
            marker.renderOrder = 1000;
            marker.userData.isConnectionLine = true;
            marker.userData.connectionStrength = strength;
            marker.userData.connectionType = c.type;
            group.add(marker);
        }
        // Achsen-Geister: jedes erkannte Gelenk (computeMotionRoles) zeigt seine Dreh-Achse als Linie durch
        // den Anker. Nur im Viewer (opts.connectionLines), depthTest:false; try/catch — ohne Motion-Rollen
        // bleibt die Optik heil.
        try {
            const roles =
                Array.isArray(parts) && parts.length >= 2
                    ? this.computeMotionRoles(parts, blueprint.connections)
                    : null;
            if (roles) {
                const AXIS_VEC = { x: [1, 0, 0], y: [0, 1, 0], z: [0, 0, 1] };
                const ROLE_COL = { rad: 0x5fa7ff, tuer: 0x66ff88, wirbel: 0xffaa44, scharnier: 0xffe066 };
                for (let i = 0; i < roles.length; i++) {
                    const rl = roles[i];
                    if (!rl || !rl.joint || !rl.axis) continue;
                    const anc = rl.anchor || (parts[i] && parts[i].position) || { x: 0, y: 0, z: 0 };
                    const pSize = parts[i] && parts[i].size ? parts[i].size : { x: 1, y: 1, z: 1 };
                    const half = Math.max(0.5, (Math.max(pSize.x, pSize.y, pSize.z) || 1) * 0.85);
                    const v = AXIS_VEC[rl.axis] || AXIS_VEC.y;
                    const aGeom = new THREE.BufferGeometry();
                    aGeom.setAttribute(
                        "position",
                        new THREE.Float32BufferAttribute(
                            [
                                (anc.x || 0) - v[0] * half,
                                (anc.y || 0) - v[1] * half,
                                (anc.z || 0) - v[2] * half,
                                (anc.x || 0) + v[0] * half,
                                (anc.y || 0) + v[1] * half,
                                (anc.z || 0) + v[2] * half,
                            ],
                            3
                        )
                    );
                    const aCol = ROLE_COL[rl.role] || 0xb06ad9;
                    const aLine = new THREE.Line(
                        aGeom,
                        new THREE.LineBasicMaterial({ color: aCol, transparent: true, opacity: 0.95, depthTest: false })
                    );
                    aLine.renderOrder = 1001;
                    aLine.userData.isConnectionLine = true;
                    aLine.userData.isJointAxis = true;
                    aLine.userData.jointRole = rl.role;
                    aLine.userData.jointAxis = rl.axis;
                    aLine.userData.jointTeach = this._jointTeachLine(rl.role, rl.axis);
                    group.add(aLine);
                    // Pfeil-Spitze (kleiner Kegel) am +Ende der Achse → Richtung lesbar.
                    const tip = new THREE.Mesh(
                        new THREE.ConeGeometry(0.1, 0.26, 8),
                        new THREE.MeshBasicMaterial({ color: aCol, transparent: true, opacity: 0.95, depthTest: false })
                    );
                    tip.position.set(
                        (anc.x || 0) + v[0] * half,
                        (anc.y || 0) + v[1] * half,
                        (anc.z || 0) + v[2] * half
                    );
                    // Kegel zeigt per Default +Y; auf die Achse drehen.
                    if (rl.axis === "x") tip.rotation.z = -Math.PI / 2;
                    else if (rl.axis === "z") tip.rotation.x = Math.PI / 2;
                    tip.renderOrder = 1001;
                    tip.userData.isConnectionLine = true;
                    tip.userData.isJointAxis = true;
                    group.add(tip);
                }
            }
        } catch (_e) {
            if (typeof window !== "undefined") window.__jointAxisError = String((_e && _e.message) || _e);
        }
    }

    // Welle 6.F1+F2 — Farb-Mapping aus Verbindungs-Stärke (0..3-Skala der
    // computeConnectionStrength-Lastformel). <0.7 = Brech-Risiko (rot),
    // 0.7..1.5 = ok (goldgelb), ≥1.5 = stark (grün).
    _connectionColor(strength) {
        if (strength < 0.7) return 0xff5555;
        if (strength < 1.5) return 0xffcc44;
        return 0x66ff88;
    }
}
