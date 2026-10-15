class AnazhRealm_Z24 {
    // ===== ATLAS §24 · TAG-NACHT/HIMMEL — Sonnen-Zyklus · Wetter-Sync · Fog/Hemi · Himmelskörper =====
    // V8.48 — ein-Segment Catmull-Rom-Hermite. Liefert den interpolierten
    // Skalar zwischen v1 (bei u=0) und v2 (bei u=1). Die Tangenten m1/m2
    // sind die nicht-uniformen Catmull-Rom-Tangenten aus den Nachbarn
    // p0/p3 — daher ist die Gesamtkurve über alle Stops hinweg C1-stetig.
    _catmullDayNight(v0, v1, v2, v3, t0, t1, t2, t3, u) {
        const h = t2 - t1;
        const m1 = t2 - t0 !== 0 ? (v2 - v0) / (t2 - t0) : 0;
        const m2 = t3 - t1 !== 0 ? (v3 - v1) / (t3 - t1) : 0;
        const u2 = u * u;
        const u3 = u2 * u;
        const h00 = 2 * u3 - 3 * u2 + 1;
        const h10 = u3 - 2 * u2 + u;
        const h01 = -2 * u3 + 3 * u2;
        const h11 = u3 - u2;
        return h00 * v1 + h10 * h * m1 + h01 * v2 + h11 * h * m2;
    }

    // Interpoliert DAY_NIGHT_STOPS nach timeOfDay 0..1 → {sky, light, intensity} (THREE.Color).
    // Catmull-Rom über die periodische Kurve (C1-stetig): kein Pulsen an den Stops wie bei smoothstep;
    // die Werte AN den Stops bleiben exakt (Hermite reproduziert p1 bei u=0, p2 bei u=1).
    _interpolateDayNight(t) {
        const stops = this.constructor.DAY_NIGHT_STOPS;
        const n = stops.length; // 15, mit stops[0] ≡ stops[n-1] (periodisch)
        const uniq = n - 1; // 14 eindeutige Knoten
        const tWrap = ((t % 1) + 1) % 1; // 0..1 sicher
        let i = 0;
        for (let k = 0; k < n - 1; k++) {
            if (tWrap >= stops[k].t && tWrap <= stops[k + 1].t) {
                i = k;
                break;
            }
        }
        const p1 = stops[i];
        const p2 = stops[i + 1];
        // p0/p3 sind die periodischen Nachbarn; der Index-Wrap überspringt
        // das Duplikat (stops[0] ≡ stops[n-1]).
        const p0 = stops[(i - 1 + uniq) % uniq];
        const p3 = stops[(i + 2) % uniq];
        let t0 = p0.t;
        const t1 = p1.t;
        const t2 = p2.t;
        let t3 = p3.t;
        // periodisch korrigieren, damit t0 < t1 < t2 < t3 monoton ist
        if (t0 > t1) t0 -= 1.0;
        if (t3 < t2) t3 += 1.0;
        const span = t2 - t1;
        const u = span > 0 ? (tWrap - t1) / span : 0;
        const c0 = new THREE.Color(p0.sky);
        const c1 = new THREE.Color(p1.sky);
        const c2 = new THREE.Color(p2.sky);
        const c3 = new THREE.Color(p3.sky);
        const l0 = new THREE.Color(p0.light);
        const l1 = new THREE.Color(p1.light);
        const l2 = new THREE.Color(p2.light);
        const l3 = new THREE.Color(p3.light);
        const clamp01 = (x) => Math.max(0, Math.min(1, x));
        const sky = new THREE.Color(
            clamp01(this._catmullDayNight(c0.r, c1.r, c2.r, c3.r, t0, t1, t2, t3, u)),
            clamp01(this._catmullDayNight(c0.g, c1.g, c2.g, c3.g, t0, t1, t2, t3, u)),
            clamp01(this._catmullDayNight(c0.b, c1.b, c2.b, c3.b, t0, t1, t2, t3, u))
        );
        const light = new THREE.Color(
            clamp01(this._catmullDayNight(l0.r, l1.r, l2.r, l3.r, t0, t1, t2, t3, u)),
            clamp01(this._catmullDayNight(l0.g, l1.g, l2.g, l3.g, t0, t1, t2, t3, u)),
            clamp01(this._catmullDayNight(l0.b, l1.b, l2.b, l3.b, t0, t1, t2, t3, u))
        );
        const intensity = Math.max(
            0,
            this._catmullDayNight(p0.intensity, p1.intensity, p2.intensity, p3.intensity, t0, t1, t2, t3, u)
        );
        return { sky, light, intensity };
    }

    // [ATMOSPHERE] Wendet timeOfDay + Wetter + Welt-Feld + Emotionen auf Lights + Skybox an.
    // Drei Modulations-Schichten über den Basis-Stops: Wetter-Multiplier, Welt-Feld-Tint
    // (Affinität am Spieler), Emotion-Tint (siehe _dayNightComputeTint).
    _applyDayNightToScene() {
        if (!this.state.directionalLight) return; // Pre-init safe
        const t = typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5;
        const stop = this._interpolateDayNight(t);
        const tint = this._dayNightComputeTint(stop);
        // der Winkel der Sonne in Stufen (`_sonnenWinkel`): Licht, Schatten, Himmelskörper und Luft lesen dieselbe Richtung
        const angle = this._sonnenWinkel(t);
        const sunDir = this._dayNightSunDirection(angle);
        // Mond-Richtung aus der EINEN Quelle: `_dayNightSunDirection(angle+π)` ist exakt die Formel des
        // sichtbaren Mond-Meshes (`_updateCelestialBodies`); −sunDir hätte eine andere z-Komponente.
        // `lightDir` = der AKTIVE Himmelskörper (Sonne über dem Horizont, sonst Mond) → Richtlicht,
        // Wasser-Glitzer, Gras-Translucency; die Skybox behält sunDir (der Wolken-Glow ist Sonne).
        const moonDir = this._dayNightSunDirection(angle + Math.PI);
        const lightDir = sunDir.y >= 0 ? sunDir : moonDir;
        // V18.390 — Eins W1: die Rayleigh-Atmosphäre EINMAL pro Anwendung gerechnet
        // (reine Funktion der Sonnenhöhe) und an das Licht-Rig durchgereicht — die
        // EINE Licht-Quelle (Gesetz #0), kein Leser leitet die Sonnenfarbe selbst her.
        const atm = this._atmosphere(sunDir.y);
        this._dayNightApplySkybox(tint);
        this._dayNightApplyStarField(t, tint.skyMul);
        this._dayNightApplyDirectionalLight(sunDir, tint, moonDir, atm);
        this._dayNightApplyAmbient(angle);
        this._updateCelestialBodies(angle, tint.lightMul);
        this._dayNightApplyHemiUndLuft(angle, tint, sunDir);
        this._dayNightApplyWaterMaterials(lightDir);
        this._dayNightApplyBelichtung();
        this._dayNightApplyAugenLicht();
    }

    // Tint-Akkumulation aus drei gekoppelten Schichten (jede mutiert skyColor/lightColor/
    // lightIntensity der vorigen): 1) Wetter (WEATHER_TINTS/Transition) 2) Welt-Feld 3) Emotion.
    // Liefert Tint + skyR/G/B (HemiFog braucht sie); geteilte Variablen → EINE Methode.
    _dayNightComputeTint(stop) {
        // Schicht 1 — Wetter-Tint
        const wt = this.state.weatherTransition;
        const tints = this.constructor.WEATHER_TINTS;
        let skyMul, lightMul;
        if (wt && wt.from && wt.to) {
            const fromT = tints[wt.from] || tints.sunny;
            const toT = tints[wt.to] || tints.sunny;
            const p = Math.max(0, Math.min(1, wt.progress || 0));
            skyMul = fromT.skyMul + (toT.skyMul - fromT.skyMul) * p;
            lightMul = fromT.lightMul + (toT.lightMul - fromT.lightMul) * p;
        } else {
            const currentTint = tints[this.state.weather] || tints.sunny;
            skyMul = currentTint.skyMul;
            lightMul = currentTint.lightMul;
        }
        const skyColor = stop.sky.clone();
        const lightColor = stop.light.clone();
        let lightIntensity = stop.intensity * lightMul;
        // Schicht 2 — Welt-Feld-Tint (Welt-Affinität am Spieler).
        // EIN Stärke-Faktor (`atmosphere.auraTintStrength`, live-justierbar) skaliert alle Feld- und
        // Emotion-Beiträge (Schicht 2+3) — die Aura tönt subtil, sie färbt die Welt nicht um.
        const auraK =
            this.state.atmosphere && Number.isFinite(this.state.atmosphere.auraTintStrength)
                ? Math.max(0, this.state.atmosphere.auraTintStrength)
                : 0.3;
        const pm = this.state.playerMesh;
        const aura = pm && typeof this.auraAt === "function" ? this.auraAt(pm.position.x, pm.position.z) : null;
        if (aura) {
            const field = aura; // §5 (V17.25): via auraAt (die living Lese-API)
            {
                const mag = Math.max(0, Math.min(1, field.magieleitung || 0));
                const glut = Math.max(0, Math.min(1, field.glut || 0));
                const lebendig = Math.max(0, Math.min(1, field.lebendig || 0));
                if (mag > 0.5) {
                    const m = (mag - 0.5) * 0.3 * auraK;
                    skyColor.r = Math.min(1, skyColor.r + m * 0.6);
                    skyColor.b = Math.min(1, skyColor.b + m * 1.0);
                    lightColor.b = Math.min(1, lightColor.b + m * 0.4);
                }
                if (glut > 0.5) {
                    const g = (glut - 0.5) * 0.4 * auraK;
                    skyColor.r = Math.min(1, skyColor.r + g);
                    skyColor.g = Math.max(0, skyColor.g - g * 0.3);
                    lightColor.r = Math.min(1, lightColor.r + g * 0.6);
                }
                if (lebendig > 0.5) {
                    const l = (lebendig - 0.5) * 0.25 * auraK;
                    skyColor.g = Math.min(1, skyColor.g + l);
                    skyColor.r = Math.min(1, skyColor.r + l * 0.3);
                }
            }
        }
        // Schicht 3 — Emotion-Tint: liest die emotion-ACHSE des Feldes (`aura.emotion`);
        // Fallback auf `player.emotions`, wenn kein playerMesh (Aura null).
        const emotions = (aura && aura.emotion) || (this.state.player && this.state.player.emotions) || {};
        const joy = Math.max(0, Math.min(1, emotions.joy || 0));
        const sorrow = Math.max(0, Math.min(1, emotions.sorrow || 0));
        const awe = Math.max(0, Math.min(1, emotions.awe || 0));
        const chaos = Math.max(0, Math.min(1, emotions.chaos || 0));
        if (joy > 0.2) {
            const j = (joy - 0.2) * 0.25 * auraK;
            skyColor.r = Math.min(1, skyColor.r + j);
            skyColor.g = Math.min(1, skyColor.g + j * 0.7);
            lightColor.r = Math.min(1, lightColor.r + j * 0.5);
            lightIntensity *= 1 + (joy - 0.2) * 0.15 * auraK;
        }
        if (sorrow > 0.2) {
            const s = (sorrow - 0.2) * 0.5 * auraK;
            const greyR = (skyColor.r + skyColor.g + skyColor.b) / 3;
            skyColor.r = skyColor.r * (1 - s) + greyR * s;
            skyColor.g = skyColor.g * (1 - s) + greyR * s;
            skyColor.b = skyColor.b * (1 - s) + greyR * s;
            lightIntensity *= 1 - (sorrow - 0.2) * 0.2 * auraK;
        }
        if (awe > 0.2) {
            const a = (awe - 0.2) * 0.35 * auraK;
            skyColor.b = Math.min(1, skyColor.b + a);
            skyColor.r = Math.min(1, skyColor.r + a * 0.6);
            lightColor.b = Math.min(1, lightColor.b + a * 0.5);
        }
        if (chaos > 0.3) {
            // performance.now() — Side-Effect-Stream-Position: das chaos-Flimmern
            // liest die Zeit hier (Tint-Phase). V9.56-i bewahrt die Aufruf-
            // Reihenfolge bit-identisch.
            const c = (chaos - 0.3) * 0.15 * auraK;
            const flutter = Math.sin(performance.now() / 180) * c;
            skyColor.r = Math.max(0, Math.min(1, skyColor.r + flutter));
            skyColor.g = Math.max(0, Math.min(1, skyColor.g - flutter * 0.7));
        }
        // grey entsättigt das LICHT, NIE den Himmel (skyColor bleibt unberührt): der grey-Kanal zieht das
        // finale Richtlicht luminanz-erhaltend Richtung Neutralgrau. Läuft nach allen Tint-Schichten.
        {
            const wf = this._weatherFieldFor(this.state.weather);
            if (wf.grey > 0) {
                const gy = lightColor.r * 0.3 + lightColor.g * 0.59 + lightColor.b * 0.11;
                lightColor.lerp(
                    new THREE.Color(gy, gy, gy),
                    Math.max(0, Math.min(1, wf.grey * AnazhRealm.WEATHER_GREY_K))
                );
            }
        }
        return {
            skyColor,
            lightColor,
            lightIntensity,
            skyMul,
            lightMul,
            auraK, // V18.236 — gated auch den Mood/DSL-skyTint-Blend in _dayNightApplySkybox
            skyR: skyColor.r * skyMul,
            skyG: skyColor.g * skyMul,
            skyB: skyColor.b * skyMul,
        };
    }

    // Sonnen-Richtung (Einheitsvektor Oberfläche→Sonne) aus dem Tageswinkel.
    // V8.48 — getrennt von der Licht-POSITION (die folgt dem Spieler für das
    // Shadow-Frustum); diese reine Richtung füttert Beleuchtung + Shader.
    // DIE SONNE IN STUFEN (Welle C, OMEN-Urteil 07.10.: „der Tag steht im Spiel nie"): der Winkel der Sonne, aus dem
    // jede Richtung des Lichts folgt — die EINE Größe, die Schattierung und Schatten lesen (Lehre 21: das Richtlicht, die
    // Kaskaden über sein Ziel, die Himmelskörper, die Luft-Keule, die Godrays). Er folgt der Tageszeit nur in STUFEN: das
    // Licht dreht, wenn die Sonne sich merklich gedreht hat, und steht dazwischen still. Drehte es je Frame mit (8 min je
    // Tag: 0,75° je s), bekam jede Kaskade bei jedem Render eine neue Box und Lage und wählte neu — gemessen (echte GPU,
    // Mess-Wiese, Ruhe mit laufender Sonne, dieselbe Welt): das Licht drehte in 199 von 199 Frames, die Kaskaden rechneten je
    // Frame ~1 400 Licht-Boxen und ihre Wahl neu. Die Stufe (`_sonnenStufe`) verschiebt keine Schatten-Kante um mehr als
    // einen Texel ihrer Karte; ein großer Sprung der Tageszeit (die Bühne, ein Zeit-Befehl) setzt sofort. Bei 8 min je Tag
    // und einem Licht-Weg von 100–170 m fällt sie 10- bis 25-mal je Sekunde — die Wahl der Kaskaden hält darum über die
    // Stufen, bis die Sonne ihren Licht-Rand verbraucht hat (`PASS_WAHL.lichtRandTexel`, `_passLageHaelt`); jede Stufe legt
    // nur die Box neu (die Karte folgt dem Licht, gate:schatten-werfer K8). Die EINE Formel der Tageszeit t (0 Mitternacht ·
    // 0,5 Mittag), die auch Mond, Sterne, Godrays, Tier-Nacht, Feld-Sonne, Umwelt-Klang und das Brennglas lesen (die Welle
    // L-F schrieb sie ein zweites Mal ohne Stufen aus — die spätere Klassen-Methode hätte die Stufen still überschrieben;
    // Integration V18.536: EINE Methode, jeder Leser ruft sie mit der Tageszeit des Spiels).
    _sonnenWinkel(t) {
        const w = t * Math.PI * 2 - Math.PI / 2;
        const s = this.state._sonne || (this.state._sonne = { winkel: NaN, stufe: 0, stufen: 0 });
        s.stufe = this._sonnenStufe();
        if (Number.isFinite(s.winkel)) {
            const a = this._dayNightSunDirection(s.winkel);
            if (a.dot(this._dayNightSunDirection(w)) >= Math.cos(s.stufe)) return s.winkel;
        }
        s.winkel = w;
        s.stufen++;
        return w;
    }

    // DIE STUFE der Sonne (Bogenmaß): eine Drehung des Lichts um α verschiebt in der Karte einer Kaskade jede Schatten-Kante
    // um α × ihren Licht-Weg (vom Werfer zum Empfänger, entlang des Lichts) — die Stufe ist die größte, die in KEINER Kaskade
    // eine Kante um mehr als einen Texel ihrer Karte verschiebt: min texel / weg über die Kaskaden (`_kaskadeFit`: der
    // längste Licht-Weg der Box — der Fall vom höchsten Werfer zum tiefsten Empfänger, geteilt durch die Höhe des Lichts,
    // höchstens die Tiefe der Box; an der Mess-Wiese k0 0,10–0,17 m und k1 0,22–0,47 m je Texel; ohne Kaskaden die EINE
    // Karte des Richtlichts, ihr Texel über ihre Tiefe). Die Schattierung trägt jede kleinere Stufe: N·L ändert sich um
    // höchstens α, unter einer 8-bit-Stufe (`SONNEN_STUFE_SCHATTIERUNG` = 1/255), und die Sonnenscheibe am Himmel springt um
    // höchstens einen Bildpunkt, wo sie auch steht (Gegenprüfung 07.10.: 1/255 rad waren bei 1080p und 75° drei Pixel, 42 %
    // der Scheibe) — die Obergrenze ohne Karte. DER PIXEL-WINKEL aus dem EINEN Schirm (`_schirm`: Zeichenpuffer B × H, die
    // Brennweite f = pxJeM in Bildpunkten): ein Punkt im Winkel θ zur Blickachse liegt bei r = f·tan θ, eine Drehung um α
    // schiebt ihn um α·(f² + r²)/f Bildpunkte — am weitesten in der Bildecke, r² = (B/2)² + (H/2)². Das Sichtfeld je Bildzeile
    // (fov/H) ist nur der Mittelwert über die Höhe: bei 1080p und 75° schiebt es in der Mitte 0,85, am oberen Rand 1,36 und in
    // der Ecke 2,94 Bildpunkte. Die Stufe nimmt die Ecke: f/(f² + r²) — höchstens ein Bildpunkt überall im Bild.
    _sonnenStufe() {
        let stufe = AnazhRealm.SONNEN_STUFE_SCHATTIERUNG;
        const s = this._schirm();
        if (s.pxJeM != null && s.breite > 0 && s.hoehe > 0) {
            const f = s.pxJeM;
            stufe = Math.min(stufe, f / (f * f + (s.breite / 2) ** 2 + (s.hoehe / 2) ** 2));
        }
        const csm = this.state.csmNode;
        if (csm) {
            const fits = csm._anazhFit;
            if (fits)
                for (const f of fits) if (f && f.texelMin > 0 && f.weg > 0) stufe = Math.min(stufe, f.texelMin / f.weg);
            return stufe;
        }
        const dl = this.state.directionalLight;
        const sh = dl && dl.castShadow === true ? dl.shadow : null;
        const c = sh && sh.camera;
        if (c && c.isOrthographicCamera === true && c.far > c.near && sh.mapSize.width > 0)
            stufe = Math.min(stufe, (c.right - c.left) / sh.mapSize.width / (c.far - c.near));
        return stufe;
    }

    _dayNightSunDirection(angle) {
        const sunDirX = Math.cos(angle);
        const sunDirY = Math.sin(angle);
        const sunDirZ = Math.sin(angle * 0.5) * 0.4;
        const sunLen = Math.hypot(sunDirX, sunDirY, sunDirZ) || 1;
        return new THREE.Vector3(sunDirX / sunLen, sunDirY / sunLen, sunDirZ / sunLen);
    }

    // Die Richtung ZUR Sonne jetzt (Einheitsvektor; y ≤ 0 unter dem Horizont) — dieselbe Quelle wie Licht und Skybox.
    _sonnenRichtung() {
        const t = typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5;
        return this._dayNightSunDirection(this._sonnenWinkel(t));
    }

    // Reine Godray-Stärke aus Sonnenhöhe (smoothstep knapp über 0) × Wetter-Klarheit (`weatherSun`,
    // auf [0..1] remappt); keine this-Reads → headless verifizierbar.
    // Der Screen-Sichtbarkeits-Gate (Sonne im Bild) sitzt separat in `_loopRender`.
    _godrayFrameGate(sunDirY, weatherSun) {
        const sm = (a, b, x) => {
            const k = Math.max(0, Math.min(1, (x - a) / (b - a)));
            return k * k * (3 - 2 * k);
        };
        const horizon = sm(0.04, 0.3, sunDirY); // knapp über dem Horizont aufblenden, hoch = voll
        const clarity = sm(0.5, 0.95, Number.isFinite(weatherSun) ? weatherSun : 1); // Sturm→0, sunny→1
        return horizon * clarity;
    }

    // DAS ATMOSPHÄRE-GESETZ (Port der Vorlage phytogenesis.js, byte-treu in der Mathematik):
    // e=sin(Elevation) → Luftmasse → spektrale Beer-Lambert-Transmission (Rayleigh ~1/λ⁴).
    // DIE EINE LICHT-QUELLE: `atm.col` (Sonnen-Hue) + `atm.lum` (Lichtmenge) speisen Key/Fill;
    // Sonnenuntergang und Mond-Nacht (MOONLIGHT-Hue) entstehen aus der Physik, DAY_NIGHT_STOPS
    // bleibt nur Tint-TRÄGER. Rein in e → headless verifizierbar (diag-atmosphere.cjs).
    _atmosphere(e) {
        const B = AnazhRealm.RAYLEIGH_BETA;
        const m = 1.0 / (Math.max(e, 0.0) + 0.06); // Luftmasse: ~1 im Zenit, groß am Horizont
        const tr = Math.exp(-B.r * m);
        const tg = Math.exp(-B.g * m);
        const tb = Math.exp(-B.b * m); // durchgelassenes Sonnenspektrum (Beer-Lambert)
        const lum = 0.21 * tr + 0.72 * tg + 0.07 * tb; // Lichtmenge der direkten Sonne
        const mx = Math.max(tr, tg, tb, 1e-4);
        let cr = tr / mx;
        let cg = tg / mx;
        let cb = tb / mx; // Sonnenfarbe = Hue des Spektrums (Sonnenuntergang → rot)
        const night = Math.max(0, Math.min(1, -e / 0.16)); // unter Horizont → Mond (Purkinje)
        const M = AnazhRealm.MOONLIGHT;
        cr += (M.r - cr) * night;
        cg += (M.g - cg) * night;
        cb += (M.b - cb) * night;
        return {
            col: { r: cr, g: cg, b: cb },
            lum: lum * (1.0 - night) + 0.06 * night,
            day: Math.max(0, Math.min(1, e)),
        };
    }

    // V18.377 — die Helligkeit eines Himmelskörpers fadet smooth auf 0, sobald er den Horizont
    // erreicht (`h` = seine Höhe = sunDir.y für die Sonne, −sunDir.y für den Mond). So ist der
    // Sonne↔Mond-Richtungswechsel bei y=0 unsichtbar (beide dort dunkel) — kein Schatten-Pop.
    _celestialHorizonFade(h) {
        const t = Math.max(0, Math.min(1, h / 0.14));
        return t * t * (3 - 2 * t);
    }

    // Skybox-Uniforms: nebulaColor aus skyR/G/B + Wolken-Deckung aus dem Wetter (Cross-Fade über die
    // Transition); die Uniforms leben in `state.skyboxUniforms` (uniform-Knoten).
    _dayNightApplySkybox(tint) {
        const u = this.state.skyboxUniforms;
        if (!u) return;
        if (u.nebulaColor && u.nebulaColor.value && u.nebulaColor.value.setRGB) {
            u.nebulaColor.value.setRGB(tint.skyR, tint.skyG, tint.skyB);
            // === Sky-Harmonie: die DSL/Mood-Tönung überschreibt die Tag-Nacht-Farbe nicht — sie blendet + fadet.
            // Läuft ~10 Hz (Tag-Nacht-Throttle); die Schritte sind raten-approximativ.
            const st = this.state;
            if (st.skyTint) {
                // V17.24 — Farb-Cross-Fade: die gezeigte Tönung lerpt sanft zur
                // Ziel-Farbe (ein Farbwechsel springt nicht mehr, er fadet).
                if (st.skyTintTo) st.skyTint.lerp(st.skyTintTo, 0.08);
                st.skyTintStrength += (st.skyTintTarget - st.skyTintStrength) * 0.12; // smooth ramp (kein Snap)
                st.skyTintTarget = Math.max(0, st.skyTintTarget - 0.001); // langsamer Decay (~60 s) → fadet aus
                // V18.236 — der Mood/DSL-skyTint-Blend wird vom EINEN auraTintStrength-
                // Knopf mitgedämpft (der Nexus tönte den Himmel bei awe nach lila =
                // magenta-Wäsche). Der Mensch kann auraTintStrength heben, will er es satt.
                const _aK = tint && Number.isFinite(tint.auraK) ? tint.auraK : 1;
                if (st.skyTintStrength * _aK > 0.002) u.nebulaColor.value.lerp(st.skyTint, st.skyTintStrength * _aK);
            }
        }
        if (u.cloudCover) {
            // Wolken-Deckung: klar 0.12 (thr~0.62 = blauer Himmel mit verstreuten Spitzen; 0.32 las schon als
            // bewölkt), Regen 0.9 (Overcast). Der FBM-Wolken-Layer liest sie als Schwellen-Senker.
            u.cloudCover.value = Math.min(1, this._weatherBlendedValue(0.12, 0.9)); // D5a: [0,1]-Konsument clampt lokal
        }
        // Ω-OPSIS §7 — die Sky-Env-Map mit der frischen Himmelsfarbe nachziehen (intern
        // gedrosselt: regeneriert nur bei Farb-Drift). Einmal-Fehlschlag → nicht erneut versuchen.
        if (!this.state._skyEnvFailed) this._ensureSkyEnvironment();
    }

    // Stern-Feld: die Dämmerung setzt die Grenzgröße (Physik der Sichtbarkeit, nie ein Nacht-Faktor), das Wetter
    // dämpft (Wolken); die Uniforms leben in state.starFieldUniforms.
    _dayNightApplyStarField(t, skyMul) {
        const u = this.state.starFieldUniforms;
        if (!u || !u.opacity) return;
        const sa = this._sonnenWinkel(t);
        const sunHeight = Math.max(-1, Math.min(1, Math.sin(sa)));
        u.opacity.value = skyMul;
        if (u.grenze) u.grenze.value = this._himmelGrenzgroesse(sunHeight);
        // Kein Punkt sichtbar (mittags liegt die Grenzgröße über jedem Stern, unter Wolken ist die Deckkraft 0): das Feld
        // zeichnet nicht — es zog am Tag zwei Befehle für ein schwarzes Bild (Band-Linse, Mess-Wiese, Welle 6).
        const sf = this.state.starField;
        if (sf && u.grenze && Number.isFinite(u.hellste))
            sf.visible = skyMul > 0 && u.grenze.value - u.hellste + 0.5 > 0;
    }

    // DIE GRENZGRÖSSE des Himmels (scheinbare Helligkeit, ab der ein Punkt sichtbar ist) aus der Sonnenhöhe: die
    // Dämmerungs-Anker `HIMMEL.grenzgroesse` (Sonnenhöhe in Grad → Größenklasse), linear dazwischen.
    _himmelGrenzgroesse(sunHeight) {
        const A = AnazhRealm.HIMMEL.grenzgroesse;
        const h = (Math.asin(Math.max(-1, Math.min(1, sunHeight))) * 180) / Math.PI;
        if (h >= A[0][0]) return A[0][1];
        for (let i = 1; i < A.length; i++) {
            if (h >= A[i][0]) {
                const t = (h - A[i - 1][0]) / (A[i][0] - A[i - 1][0]);
                return A[i - 1][1] + (A[i][1] - A[i - 1][1]) * t;
            }
        }
        return A[A.length - 1][1];
    }

    // Die Leuchtdichte des Tageshimmels relativ zum Mittag (0,045 Nacht … 1 Tag) aus der Sonnenhöhe — DIE EINE
    // Himmels-Helligkeit: die In-Streu-Farbe der Luft und die Blässe des Mondes lesen sie.
    _himmelHell(sunHeight) {
        let q = (sunHeight + 0.18) / 0.6;
        q = q < 0 ? 0 : q > 1 ? 1 : q;
        return 0.045 + 0.955 * q * q * (3 - 2 * q);
    }

    // DirectionalLight: Position folgt dem Spieler (Shadow-Frustum zentriert), Target am Spieler-Boden,
    // Color = lightColor × lightMul, Intensity aus dem akkumulierten lightIntensity.
    // Stable Shadow Maps: der Fokus wird auf das Shadow-Texel-Grid gesnappt (Light-Space-Snap unten),
    // sonst „kriecht" das Schatten-Muster bei jeder Sub-Texel-Bewegung über statische Geometrie.
    _dayNightApplyDirectionalLight(sunDir, tint, moonDir, atm) {
        const dl = this.state.directionalLight;
        const pm = this.state.playerMesh;
        const lightDist = 200;
        // Das Richtlicht IST die Sonne, solange sie über dem Horizont steht, sonst der Mond (von oben).
        // Der Wechsel bei y=0 ist unsichtbar: beide Körper sind dort auf 0 gedimmt (`_celestialHorizonFade`).
        // `moonDir` kommt vom Aufrufer (_applyDayNightToScene, dieselbe Formel wie das Mond-Mesh); der
        // −sunDir-Guard deckt nur Diag-Aufrufe ohne dritten Parameter.
        const sunUp = sunDir.y >= 0;
        const md = moonDir || { x: -sunDir.x, y: -sunDir.y, z: -sunDir.z };
        const lightDir = sunUp ? sunDir : md;
        let focusX = pm ? pm.position.x : 0;
        let focusY = 0;
        let focusZ = pm ? pm.position.z : 0;
        if (pm && dl.shadow && dl.shadow.camera && dl.shadow.mapSize) {
            const sc = dl.shadow.camera;
            const shadowWidth = sc.right - sc.left; // typisch 600 (±300)
            const shadowMapSize = dl.shadow.mapSize.width; // typisch 2048
            if (shadowWidth > 0 && shadowMapSize > 0) {
                const texelSize = shadowWidth / shadowMapSize; // ~0.293 m bei 600/2048
                // LIGHT-SPACE Texel-Snap: das Shadow-Texel-Grid liegt in der Ebene ⟂ sunDir, nicht in Welt-X/Z
                // (ein Welt-Snap lässt bei schräger Sonne bis ~1 Texel Rest-Swimming). focus auf die Lateral-
                // Achsen projizieren, dort snappen, zurück in Welt-Space → jeder Texel trifft denselben Punkt.
                // Die Basis spiegelt EXAKT Three.js' Matrix4.lookAt der Shadow-Camera (z=sunDir, x=up×z, y=z×x;
                // up=(0,1,0), Zenit-Fallback (0,0,1)); allokationsfreie Skalar-Mathematik.
                const sl = Math.hypot(lightDir.x, lightDir.y, lightDir.z) || 1;
                const sx = lightDir.x / sl;
                const sy = lightDir.y / sl;
                const sz = lightDir.z / sl;
                const zenith = Math.abs(sy) > 0.999;
                const uy = zenith ? 0 : 1;
                const uz = zenith ? 1 : 0;
                // xAxis = normalize(up × sunDir)   (up = (0, uy, uz))
                let axx = uy * sz - uz * sy;
                let axy = uz * sx;
                let axz = -uy * sx;
                const axl = Math.hypot(axx, axy, axz) || 1;
                axx /= axl;
                axy /= axl;
                axz /= axl;
                // yAxis = sunDir × xAxis   (Einheit: sunDir ⟂ xAxis, beide normiert)
                const ayx = sy * axz - sz * axy;
                const ayy = sz * axx - sx * axz;
                const ayz = sx * axy - sy * axx;
                // focus (focusX, 0, focusZ) auf die Lateral-Achsen projizieren +
                // auf das Texel-Grid snappen (focusY=0 → die axy/ayy-Terme entfallen)
                const fa = focusX * axx + focusZ * axz;
                const fb = focusX * ayx + focusZ * ayz;
                const dFa = Math.round(fa / texelSize) * texelSize - fa;
                const dFb = Math.round(fb / texelSize) * texelSize - fb;
                focusX += dFa * axx + dFb * ayx;
                focusY += dFa * axy + dFb * ayy;
                focusZ += dFa * axz + dFb * ayz;
            }
        }
        dl.position.set(
            focusX + lightDir.x * lightDist,
            focusY + lightDir.y * lightDist,
            focusZ + lightDir.z * lightDist
        );
        if (dl.target) {
            dl.target.position.set(focusX, focusY, focusZ);
            dl.target.updateMatrixWorld();
        }
        // Sonne (warm) ODER Mond (kühl), je nach stehendem Körper; dessen Helligkeit fadet am Horizont auf 0
        // (`_celestialHorizonFade`) → der Richtungswechsel bei y=0 ist unsichtbar.
        // Farbe: `atm.col` (Rayleigh, DIE EINE LICHT-QUELLE) × `tint.lightColor` (LUT + Aura/Emotion).
        // Intensität = KEY_BASE·atm.lum·tint.lightIntensity: die Physik trägt die Tageskurve, die LUT
        // (⊇ Wetter-lightMul + Emotion) moduliert; Ziel dir/(amb+hemi) ≥ 3:1.
        const a = atm || this._atmosphere(sunDir.y);
        if (sunUp) {
            dl.color.setRGB(
                a.col.r * tint.lightColor.r * tint.lightMul,
                a.col.g * tint.lightColor.g * tint.lightMul,
                a.col.b * tint.lightColor.b * tint.lightMul
            );
            dl.intensity =
                AnazhRealm.KEY_BASE *
                AnazhRealm.LEGACY_LICHT *
                a.lum *
                tint.lightIntensity *
                this._celestialHorizonFade(sunDir.y);
            // DIE EINE TAG-LICHT-ACHSE: der Impostor-Atlas trägt eingebackenes Tageslicht — derselbe Fade, der
            // das Key-Licht dimmt, schreibt die Uniform, sonst leuchten ferne Karten nachts.
            if (this.state.atmoUniforms && this.state.atmoUniforms.tagLicht)
                this.state.atmoUniforms.tagLicht.value = this._celestialHorizonFade(sunDir.y) * Math.max(0, a.lum);
        } else {
            const M = AnazhRealm.MOONLIGHT;
            // Mond-Pfad: Richtung aus der EINEN Quelle, Intensität MOONLIGHT·Wetter·Horizont-Fade; `atm.col`
            // färbt ihn nur (unter dem Horizont lerpt sie zum MOONLIGHT-Hue).
            dl.color.setRGB(a.col.r, a.col.g, a.col.b);
            // V18.378 — der Fade liest die ECHTE Mond-Höhe (md.y), nicht −sunDir.y (die
            // z-Bogen-Formel gibt dem Mond eine eigene Normierung → eigene Höhe).
            dl.intensity = M.intensity * tint.lightMul * this._celestialHorizonFade(md.y);
            // V18.473 — Nacht: die Tag-Licht-Achse fällt auf 0 (Mond zählt nicht als
            // Tageslicht — die Karten tragen ihr eingebackenes SONNEN-Licht).
            if (this.state.atmoUniforms && this.state.atmoUniforms.tagLicht) this.state.atmoUniforms.tagLicht.value = 0;
        }
        // V18.377 — die Post-FX-Entgrauung (warm-Lift grauer Pixel) WÄSCHT die legitim
        // entsättigte Nacht → sie fadet zur Nacht aus (das „Filter in meinen Augen"). Der Mond
        // gibt die Tiefe gerichtet, kein Post-FX-Lift nötig. `nightFactor` 0=Tag → 1=Nacht.
        if (this.state.postProcessingUniforms && this.state.postProcessingUniforms.nightFactor) {
            this.state.postProcessingUniforms.nightFactor.value = Math.max(0, Math.min(1, 1 - (sunDir.y + 0.05) / 0.2));
        }
        // Die MeshToonNodeMaterials (lights=true) lesen dl.color/intensity/position direkt über die
        // WebGPU-Lighting-Pipeline — kein eigener Uniform-Sync. Nur die Gras-Translucency braucht die
        // Richtung als Uniform (uSunDir): EINE Quelle = derselbe Vektor wie das Richtlicht (aktiver Körper).
        if (this.state.windUniforms && this.state.windUniforms.uSunDir) {
            this.state.windUniforms.uSunDir.value.set(lightDir.x, lightDir.y, lightDir.z).normalize();
        }
        // V17.2 — derselbe sunDir speist den Wolken-Glow im Skybox-Shader
        // (golden-hour-Rand zur Sonne hin). EINE Quelle, drei Konsumenten.
        if (this.state.skyboxUniforms && this.state.skyboxUniforms.sunDir) {
            this.state.skyboxUniforms.sunDir.value.copy(sunDir).normalize();
        }
        // W9 — die Wolken-Beleuchtung des Studio-Gesetzes liest die Rayleigh-
        // Sonnenfarbe der EINEN _atmosphere-Quelle (nachts wird sie zur Mond-
        // Farbe — die Nacht-Wolken folgen gratis). Raw als linear (r128-Gesetz).
        if (this.state.skyboxUniforms && this.state.skyboxUniforms.sunCol && a && a.col) {
            this.state.skyboxUniforms.sunCol.value.setRGB(a.col.r, a.col.g, a.col.b);
        }
    }

    // DIE EINE TAG-ACHSE der Himmels-Lichter: 0 ab ~15° Sonnenhöhe (Tag), 1 am/unter dem Horizont (Nacht).
    // Nebel-Erdanteil, Ambient- und Hemi-Nachtboden lesen sie.
    _nachtAnteil(angle) {
        return 1 - Math.max(0, Math.min(1, Math.sin(angle) / 0.25));
    }

    // DIE BELICHTUNG AUS DEM LICHT (V18.507): die Kamera stellt die 18-%-Karte auf Mittelgrau + 1 EV
    // (die Kamera-Konvention der Profi-Engines, UE5-Belichtungs-Bias +1). Die Karte liest L = 0,18/π · E
    // mit E = Sonne/Mond auf der Waagrechten + Himmels-Umgebung von oben (`_himmelsIrradianz`) + Hemi +
    // Ambient — dieselben Lichter, die jedes Material liest. Vorher stand die Belichtung fest auf 1,0:
    // die Karte las 212 (≈ +1,8 EV über Mittelgrau), Weiß und Himmel liefen in die ACES-Schulter. Die
    // Nacht bleibt, wie sie geeicht ist (Deckel 1,0 — das Auge adaptiert, die Mond-Nacht bleibt dunkel).
    _dayNightApplyBelichtung() {
        const st = this.state;
        const rend = st.renderer;
        if (!rend || !st.directionalLight) return;
        const B = AnazhRealm.BELICHTUNG;
        const e = this._waagrechtIrradianz(this._belichtungE || (this._belichtungE = [0, 0, 0]));
        const E = 0.2126 * e[0] + 0.7152 * e[1] + 0.0722 * e[2];
        const karte = (0.18 / Math.PI) * E;
        const k = karte > 1e-6 ? B.zielKarte / karte : B.max;
        rend.toneMappingExposure = Math.max(B.min, Math.min(B.max, k));
    }

    // DAS LICHT DES AUGES (K02a, Auge 11 bei 762/−138): wo der Himmel das Auge nicht erreicht, trägt der Leib sein Licht. Die
    // Höhle der Boden-Funktion bekommt kein Himmels-Licht (gelaende-core `himmelsSicht`), und 40 m hinter der Mündung erreicht sie auch
    // keine Sonne — die Ich-Sicht war schwarz (Helligkeit 0). Das Licht steht am Auge (die Kamera), seine Stärke folgt dem
    // Anteil des Himmels, der fehlt (`_himmelAmAuge`: das Auge adaptiert — unter dem Himmel bleibt jede Höhle dunkel), und
    // ist so geeicht, dass die 18-%-Karte in `AUGEN_LICHT.karteM` dasselbe Mittelgrau + 1 EV zeigt wie am Tag (die Belichtung
    // aus dem Licht: L = 0,18/π · E · Belichtung = zielKarte; der Abfall des EINEN Punktlicht-Gesetzes, fachwerk `lichtAbfall`).
    // Es ist ein PLATZ DES LICHT-POOLS mit Himmels-Ersatz (K11, `_leuchtTakt`): kein Szenen-Licht (K15), kein eigener Term —
    // es trägt nur, wo der Himmel fehlt (der Boden mit 1 − aHimmel), seine Stärke in der Zahl des Labors (÷ LEGACY_LICHT), damit
    // die EINE Übersetzung Labor → Welt sie trägt wie jede Quelle. Unter dem Himmel ist es aus (`_augenLeuchte` null).
    _dayNightApplyAugenLicht() {
        const st = this.state;
        const cam = st.camera;
        const h = cam ? this._himmelAmAuge(cam.position.x, cam.position.y, cam.position.z) : 1;
        st.himmelAmAuge = h;
        const B = AnazhRealm.BELICHTUNG;
        const A = AnazhRealm.AUGEN_LICHT;
        const k = st.renderer && st.renderer.toneMappingExposure > 0 ? st.renderer.toneMappingExposure : 1;
        const abstKarte = globalThis.__fachwerkCore.lichtAbfall(A, A.karteM);
        const I = ((1 - h) * ((B.zielKarte * Math.PI) / 0.18)) / (k * abstKarte);
        if (!(I > 1e-4)) {
            this._augenLeuchte = null;
            return;
        }
        const q =
            this._augenLeuchte ||
            (this._augenLeuchte = {
                quelle: "auge",
                L: {
                    kelvin: A.kelvin,
                    staerke: 0,
                    reichweiteM: A.reichweiteM,
                    abfall: A.abfall,
                    kernM: A.kernM,
                    ersatz: true,
                },
                masse: 1,
                phase: 0,
            });
        q.L.staerke = I / AnazhRealm.LEGACY_LICHT;
    }

    // DER LICHT-TAKT (K11) — der EINE Schreiber des Licht-Pools und der Fenster-Glut, je Bild vor dem Render (`_gameLoopTick`).
    // Die Plätze gehen an die Leuchtquellen, deren Reichweite dem Auge am nächsten kommt (`_leuchtQuellen`: das Licht des
    // Auges, jede Glut und jede Quelle mit Datum im Verzeichnis, die Laternen der Pläne, das wache Tor; neu gewählt je `wahlS`
    // oder nach `wahlM` Weg). Ein Platz hält seine Quelle, solange sie gewählt ist; eine abgewählte blendet in `blendeS` aus,
    // erst der freie Platz nimmt die nächste auf, und sie blendet ein — kein Licht springt. Die Stärke je Bild: das Emitter-
    // Datum über die EINE Übersetzung Labor → Welt (`_laborLichtStaerke`) × Masse (die Fläche der Glut) × Flackern auf der
    // Wind-Uhr (fachwerk `lichtFlackern`) × Zeitplan (`_lichtZeitplan`) × Blende. Der Ort steht in der Welt (der Stoff rechnet
    // ihn mit der Kamera seines Renderers). Unabhängig vom Klang. Lesbar für Linsen: `_leuchtPool.plaetze` (Quelle, Welt-Ort,
    // Stärke, Reichweite, Abfall, Kern, lineare Farbe, Himmels-Ersatz, Blende). Die Farbe aus der Farbtemperatur (`_lichtLinear`).
    _leuchtTakt() {
        const st = this.state;
        const atmo = st.atmoUniforms;
        const cam = st.camera;
        if (!atmo || !cam) return; // vor der Welt: kein Stoff liest den Pool
        const LP = AnazhRealm.LICHT_POOL;
        const LG = globalThis.__fachwerkCore.LICHT_GESETZ;
        this._lichtLinear(LG.fenster, atmo.fensterGlut.value).multiplyScalar(this._lichtZeitplan(LG.fenster.zeit));
        const pool =
            this._leuchtPool ||
            (this._leuchtPool = {
                t: -Infinity,
                uhr: -Infinity,
                x: NaN,
                y: NaN,
                z: NaN,
                wahl: [],
                halter: new Array(LP.plaetze).fill(null),
                blende: new Float32Array(LP.plaetze),
                plaetze: [],
            });
        const cp = cam.position;
        const jetzt = performance.now() / 1000;
        const schritt = Math.max(0, jetzt - pool.uhr) / LP.blendeS;
        pool.uhr = jetzt;
        if (jetzt - pool.t >= LP.wahlS || !(Math.hypot(cp.x - pool.x, cp.y - pool.y, cp.z - pool.z) < LP.wahlM)) {
            pool.t = jetzt;
            pool.x = cp.x;
            pool.y = cp.y;
            pool.z = cp.z;
            const q = this._leuchtQuellen(cp.x, cp.y, cp.z, LP.umkreisM);
            q.sort((a, b) => a.rang - b.rang);
            pool.wahl = q.slice(0, LP.plaetze);
        }
        // die Plätze: gewählt bleibt und blendet ein, abgewählt blendet aus, der freie Platz nimmt die nächste Gewählte
        const H = pool.halter;
        for (let k = 0; k < H.length; k++) {
            const neu = H[k] && pool.wahl.find((w) => w.id === H[k].id);
            if (neu) {
                H[k] = neu;
                pool.blende[k] = Math.min(1, pool.blende[k] + schritt);
            } else if (H[k]) {
                pool.blende[k] = Math.max(0, pool.blende[k] - schritt);
                if (pool.blende[k] === 0) H[k] = null;
            }
        }
        for (const w of pool.wahl) {
            if (H.some((h) => h && h.id === w.id)) continue;
            const frei = H.indexOf(null);
            if (frei < 0) break;
            H[frei] = w;
            pool.blende[frei] = Math.min(1, schritt);
        }
        const c = this._leuchtC || (this._leuchtC = new THREE.Color());
        const t = this._windZeit();
        pool.plaetze.length = 0;
        for (let k = 0; k < H.length; k++) {
            const q = H[k];
            const lage = atmo.lichtLage[k].value;
            const farbe = atmo.lichtFarbe[k].value;
            const I = q ? this._leuchtStaerke(q, t) * pool.blende[k] : 0;
            if (!(I > 0)) {
                lage.set(0, 0, 0, 0);
                farbe.set(0, 0, 0, 0);
                atmo.lichtErsatz[k].value = 0;
                atmo.lichtKern[k].value = 0;
                continue;
            }
            const L = q.L;
            // das Licht des Auges folgt ihm je Bild
            if (q.quelle === "auge") {
                q.x = cp.x;
                q.y = cp.y;
                q.z = cp.z;
            }
            lage.set(q.x, q.y, q.z, L.reichweiteM);
            this._lichtLinear(L, c);
            // der Bezug des Abfalls in 1 m (fachwerk `lichtAbfall`): der Stoff rechnet (d² + k²)^(−abfall/2), die Stärke trägt (1 + k²)^(abfall/2)
            const k2 = L.kernM * L.kernM;
            const In = I * Math.pow(1 + k2, L.abfall / 2);
            farbe.set(c.r * In, c.g * In, c.b * In, L.abfall);
            atmo.lichtErsatz[k].value = L.ersatz ? 1 : 0;
            atmo.lichtKern[k].value = k2;
            pool.plaetze.push({
                quelle: q.quelle,
                x: q.x,
                y: q.y,
                z: q.z,
                staerke: I,
                reichweite: L.reichweiteM,
                abfall: L.abfall,
                kern: L.kernM,
                farbe: [c.r, c.g, c.b],
                ersatz: !!L.ersatz,
                blende: pool.blende[k],
            });
        }
    }

    // DIE LICHTFARBE einer Quelle, linear, in die Farbe `c` (K11b): ein Wärmestrahler trägt seine Farbtemperatur (`kelvin`,
    // fachwerk `lichtFarbe` über den Planck-Ort) — das Feuer, die Glut, die Laterne, die Fenster und das Licht des Auges. Das
    // Tor ist kein Wärmestrahler: sein Datum (porta GLUT_GESETZ) trägt die Farbe als sRGB-Absicht, die das FARB-GESETZ linear
    // rechnet. Ein Datum ohne beides ist ein Bruch des Vertrags (laut, kein stiller Ersatz).
    _lichtLinear(L, c) {
        if (L.kelvin > 0) return c.setRGB(...globalThis.__fachwerkCore.lichtFarbe(L.kelvin));
        if (L.farbe == null) throw new Error("_lichtLinear: die Leuchtquelle trägt weder kelvin noch farbe");
        return c.set(L.farbe);
    }

    // DIE STÄRKE einer Quelle zur Wind-Zeit t (K11): Datum × Flackern × Zeitplan über die EINE Übersetzung Labor → Welt × Masse.
    _leuchtStaerke(q, t) {
        const L = q.L;
        const fl = L.flacker ? L.flacker.amp * globalThis.__fachwerkCore.lichtFlackern(L, t, q.phase) : 0;
        return this._laborLichtStaerke(L.staerke * (1 + fl)) * q.masse * this._lichtZeitplan(L.zeit);
    }

    // DIE LEUCHTQUELLEN um das Auge (x, y, z) im Umkreis R (K11), je mit stabiler Kennung (`id`) und Rang (der Abstand des
    // Auges zur Kugel ihrer Reichweite, 0 in ihr — dann der Abstand selbst, das Nächste zuerst): das Licht des Auges
    // (`_augenLeuchte`, am Auge: Rang 0), jeder Eintrag des Verzeichnisses „licht" (`_blockerMit`, gestempelt beim Eintritt)
    // mit seinem Emitter-Datum (`_lichtDatum`) — die Masse folgt der Fläche: trägt die Studio-Gestalt das Datum, ist es ihres
    // (Masse = Skala²); eine Glut ohne Datum der Gestalt trägt das Herdfeuer im Verhältnis ihrer Fläche zum Glutbett der
    // Studio-Feuerstelle (klang `bettRefM`, der Bezug des Knisterns) —, die Laternen der Pläne (`_laternenLesen`, Zellen)
    // und das wache Tor (`_portalLeuchte`). Eine Quelle, die jetzt nicht brennt (Zeitplan 0), steht nicht zur Wahl.
    _leuchtQuellen(x, y, z, R) {
        const out = [];
        const t = this._windZeit();
        const nimm = (id, q) => {
            const d = Math.hypot(q.x - x, q.y - y, q.z - z);
            if (d > R + q.L.reichweiteM || !(this._leuchtStaerke(q, t) > 0)) return;
            out.push(Object.assign(q, { id, rang: Math.max(0, d - q.L.reichweiteM) * 1e3 + d }));
        };
        const auge = this._augenLeuchte;
        if (auge) nimm(auge, Object.assign({}, auge, { x, y, z }));
        const bett = AnazhRealm._umweltGesetz().UMWELT.stimmen.glut.bettRefM;
        const bezug = (Math.PI / 4) * bett * bett;
        for (const e of this._blockerMit("licht")) {
            const p = e.position;
            if (!p || (p.x - x) * (p.x - x) + (p.z - z) * (p.z - z) > R * R) continue;
            const L = this._lichtDatum(e);
            if (!L) continue; // das Datum ging mit dem Bauplan (das Verzeichnis stempelt beim Eintritt)
            const sk = Number.isFinite(e.scale) && e.scale > 0 ? e.scale : 1;
            const a = this._lichtDatumDerGestalt(e) ? 0 : this._glutFlaeche(e);
            nimm(e, {
                quelle: e.type,
                x: p.x,
                y: p.y - 0.5 + (L.hoeheM || 0) * sk,
                z: p.z,
                L,
                masse: a > 0 ? a / bezug : sk * sk,
                phase: (((p.x * 12.9898 + p.z * 78.233) % 6.2832) + 6.2832) % 6.2832,
            });
        }
        const LZ = this._laternen;
        if (LZ) {
            const Z = AnazhRealm.LICHT_POOL.zelleM;
            for (let i = Math.floor((x - R) / Z); i <= Math.floor((x + R) / Z); i++)
                for (let j = Math.floor((z - R) / Z); j <= Math.floor((z + R) / Z); j++)
                    for (const l of LZ.zellen.get(i + "," + j) || []) nimm(l, Object.assign({}, l));
        }
        const tor = this._portalLeuchte;
        if (tor) nimm(tor, Object.assign({}, tor));
        return out;
    }

    // DER LESER DER LATERNEN (K11 ↔ K10): `laternen[]` eines Siedlungs-Plans (fachwerk exportSettlement, je Laterne x/z
    // plan-lokal) wird Leuchtquelle mit dem Datum LICHT_GESETZ.laterne — der Kopf `hoeheM` über dem Boden des Gesetzes —, je
    // Plan einmal (der Schlüssel der Siedlung, wie die Wege), abgelegt in Zellen von `LICHT_POOL.zelleM` (die Wahl liest nur die
    // Zellen um das Auge, nie alle Laternen der Welt). Gerufen aus dem EINEN Hebe-Chokepoint `_spawnSettlementErlebnis`.
    _laternenLesen(plan, origin, key) {
        if (!plan || !Array.isArray(plan.laternen) || plan.laternen.length === 0) return 0;
        const LZ = this._laternen || (this._laternen = { zellen: new Map(), schluessel: new Set() });
        if (key) {
            if (LZ.schluessel.has(key)) return 0;
            LZ.schluessel.add(key);
        }
        const L = globalThis.__fachwerkCore.LICHT_GESETZ.laterne;
        const Z = AnazhRealm.LICHT_POOL.zelleM;
        let n = 0;
        for (const l of plan.laternen) {
            if (!l || !Number.isFinite(l.x) || !Number.isFinite(l.z)) continue;
            const wx = origin.x + l.x;
            const wz = origin.z + l.z;
            const wy = this.getTerrainHeightAt(wx, wz);
            if (!Number.isFinite(wy)) continue;
            const zk = Math.floor(wx / Z) + "," + Math.floor(wz / Z);
            const liste = LZ.zellen.get(zk) || [];
            liste.push({ quelle: "laterne", x: wx, y: wy + L.hoeheM, z: wz, L, masse: 1, phase: 0 });
            LZ.zellen.set(zk, liste);
            n++;
        }
        return n;
    }

    // DAS EMITTER-DATUM eines Eintrags (K11): die Zeile `fx.licht` des Studio-Rezepts seiner Gestalt (`studioGestalt` im
    // Gesetzbuch fachwerk, synchron geladen — die Feuerstelle trägt LICHT_GESETZ.feuer, dasselbe Rezept, das das Buch der Welt
    // reist: recipes.json), sonst für jede Glut (Brenn-Fläche > 0) das Herdfeuer des Gesetzbuchs. null: keine Leuchtquelle.
    _lichtDatum(entry) {
        const L = this._lichtDatumDerGestalt(entry);
        if (L) return L;
        return this._glutFlaeche(entry) > 0 ? globalThis.__fachwerkCore.LICHT_GESETZ.feuer : null;
    }

    // Das Emitter-Datum der Studio-Gestalt eines Eintrags (`fx.licht` ihres Rezepts) oder null.
    _lichtDatumDerGestalt(entry) {
        const FC = globalThis.__fachwerkCore;
        const bp = this.state.blueprints && typeof entry.type === "string" ? this.state.blueprints[entry.type] : null;
        const pre = bp && typeof bp.studioGestalt === "string" ? FC.PRESETS[bp.studioGestalt] : null;
        return pre && pre.fx && pre.fx.licht ? pre.fx.licht : null;
    }

    // DIE EINE ÜBERSETZUNG LABOR → WELT eines Punktlichts (K11): das r128-Labor rechnet ohne 1/π-Normierung — derselbe EINE
    // Faktor `LEGACY_LICHT`, durch den die Rig-Werte des Studios laufen; den Abfall rechnet der Stoff nach dem Gesetz (fachwerk
    // `lichtAbfall` in `_lichtPoolTerm`: 1/d^abfall mit Kern und Saum, K11b) — in 1 m trifft er die Stärke des Datums.
    _laborLichtStaerke(I) {
        return I > 0 ? AnazhRealm.LEGACY_LICHT * I : 0;
    }

    // DER ZEITPLAN EINER LEUCHTQUELLE (K11, fachwerk LICHT_GESETZ `zeit`: mittag · morgen · abend · nacht; ohne Zeitplan 1)
    // auf der Tag-Achse der Welt: der Nacht-Anteil der Sonne (`_nachtAnteil`: 0 ab ~15° Sonnenhöhe, 1 am Horizont und darunter)
    // führt stückweise linear vom Mittag über die Dämmerung (Morgen vor, Abend nach der Mitte des Tages) in die Nacht.
    _lichtZeitplan(z) {
        if (!z) return 1;
        const t = typeof this.state.timeOfDay === "number" ? this.state.timeOfDay : 0.5;
        const n = this._nachtAnteil(this._sonnenWinkel(t));
        const daemmer = ((t % 1) + 1) % 1 < 0.5 ? z.morgen : z.abend;
        return n <= 0.5
            ? z.mittag + (daemmer - z.mittag) * (n / 0.5)
            : daemmer + (z.nacht - daemmer) * ((n - 0.5) / 0.5);
    }

    // DER HIMMEL AM AUGE (0…1): der Anteil des Himmels-Lichts am Ort (x, y, z) — gelesen von der Himmels-Sicht des Bodens
    // (`aHimmel`) um ihn, gewichtet 1/(d² + ¼) im Umkreis `AUGEN_LICHT.umkreisM`. Steht der Ort in keiner Luft-Box eines
    // Höhlen-Knotens (`_hoehlenKnoten`, dieselbe Probe wie die Höhlen-Sicht), ist er Himmels-Luft: 1. Die Kosten folgen dem
    // Auge: nur in einer Höhlen-Box, nur die Zellen im Umkreis, neu erst nach `AUGEN_LICHT.neuM` Weg oder neuem Boden.
    _himmelAmAuge(x, y, z) {
        const s = this.state.chunkSaetze ? this.state.chunkSaetze.get("boden") : null;
        if (!s || !s.hoehle) return 1;
        const A = AnazhRealm.AUGEN_LICHT;
        const c = this._himmelAugeMerk || (this._himmelAugeMerk = { x: NaN, y: NaN, z: NaN, boden: -1, wert: 1 });
        const dx0 = x - c.x,
            dy0 = y - c.y,
            dz0 = z - c.z;
        if (c.boden === s.hoehle.boden && dx0 * dx0 + dy0 * dy0 + dz0 * dz0 < A.neuM * A.neuM) return c.wert;
        c.x = x;
        c.y = y;
        c.z = z;
        c.boden = s.hoehle.boden;
        const v = this._himmelAugeV || (this._himmelAugeV = new THREE.Vector3());
        v.set(x, y, z);
        const span = this._voxelChunkConfig(0).span;
        const cx = Math.floor(x / span),
            cz = Math.floor(z / span);
        const um = [];
        let drin = false;
        for (let dx = -1; dx <= 1; dx++)
            for (let dz = -1; dz <= 1; dz++) {
                const b = s.bloecke.get(cx + dx + "," + (cz + dz));
                if (!b) continue;
                um.push(b);
                if (!drin && b.hoehle)
                    for (const kn of b.hoehle.knoten) if (kn.luft && kn.luft.containsPoint(v)) drin = true;
            }
        if (!drin) return (c.wert = 1);
        const P = s.geom.attributes.position.array;
        // die Himmels-Sicht reist im Satz in der vierten Komponente des Normal-Ziels (snorm8, K51-2 `_chunkSatzArt` boden)
        const H = s.geom.attributes.aNormalZiel.array;
        const R2 = A.umkreisM * A.umkreisM;
        let summe = 0,
            gewicht = 0;
        for (const b of um)
            for (const zl of b.zellen) {
                if (zl.huelle.isEmpty() || zl.huelle.distanceToPoint(v) > A.umkreisM) continue;
                const I = zl.idx;
                for (let i = 0; i < I.length; i++) {
                    const o = I[i] * 3;
                    const ddx = P[o] - x,
                        ddy = P[o + 1] - y,
                        ddz = P[o + 2] - z;
                    const d2 = ddx * ddx + ddy * ddy + ddz * ddz;
                    if (d2 > R2) continue;
                    const w = 1 / (d2 + 0.25);
                    summe += (w * H[I[i] * 4 + 3]) / 127;
                    gewicht += w;
                }
            }
        return (c.wert = gewicht > 0 ? summe / gewicht : 1);
    }

    // DIE BESTRAHLUNG EINER WAAGRECHTEN FLÄCHE (rgb, E): Sonne/Mond auf der Waagrechten + Himmels-Umgebung von oben
    // (`_himmelsIrradianz`, E/π) + Hemi + Ambient — dieselben Lichter, die jedes Material liest. EINE Rechnung für
    // die Belichtung (die 18-%-Karte) und das Wasser (sein Körper und sein Schaum leuchten im Licht des Orts).
    _waagrechtIrradianz(out) {
        const st = this.state;
        const dl = st.directionalLight;
        out[0] = out[1] = out[2] = 0;
        if (!dl) return out;
        const dir = this._belichtungRichtung || (this._belichtungRichtung = new THREE.Vector3());
        dir.copy(dl.position);
        if (dl.target) dir.sub(dl.target.position);
        const dy = dir.lengthSq() > 0 ? Math.max(0, dir.normalize().y) : 0;
        const add = (c, k) => {
            out[0] += c.r * k;
            out[1] += c.g * k;
            out[2] += c.b * k;
        };
        add(dl.color, dl.intensity * dy);
        const env = this._himmelsIrradianz(); // liefert E/π (die Antwort einer weißen Lambert-Fläche)
        if (env) {
            out[0] += Math.PI * env.oben[0];
            out[1] += Math.PI * env.oben[1];
            out[2] += Math.PI * env.oben[2];
        }
        if (st.hemiLight) add(st.hemiLight.color, st.hemiLight.intensity);
        if (st.ambientLight) add(st.ambientLight.color, st.ambientLight.intensity);
        return out;
    }

    // Ambient-Light = NUR der Nachthimmel-Boden (EIN Himmel, V18.507): am Tag IST die Himmels-Umgebung
    // der Himmel (aus dem sichtbaren Himmel gemalt) — ein Tag-Ambient zählte ihn doppelt (Licht-Bilanz
    // 01.10.: Umgebung 1,89 + Hemi 0,53 + Ambient 0,16 = 0,36 der Sonne, klarer Himmel real 0,12–0,16).
    // Nachts ist der sichtbare Himmel fast schwarz; dort trägt der Boden (0.04) mit Hemi (0.10) die
    // Nacht-Kalibrierung Mond/(amb+hemi) ≥ 1.5. Er blendet mit `_nachtAnteil` (dieselbe Tag-Achse wie der
    // Nebel). joy/awe/sorrow modulieren wie bisher.
    _dayNightApplyAmbient(angle) {
        const al = this.state.ambientLight;
        if (!al) return;
        const baseAmb = 0.04 * this._nachtAnteil(angle);
        al.intensity = this._emotionModulate(baseAmb, { joy: 0.08, awe: 0.05, sorrow: -0.04 });
        // V12.0-f — kein toonLightUniforms-Sync mehr; die nativen lights=true-
        // Materials konsumieren al.intensity direkt (Three.js-Lighting).
    }

    // ═══ DIE LUFT (V18.530): die EINE Luftperspektive — Physik statt Kulisse ═══
    // Befund 04.10. (Blick-Tour, echte GPU, Mess-Wiese): der Nebel war eine lineare WAND an der Wald-Kante
    // (`fog.far = foliageRadius`, unter Last 60 m) — aus 45 m Höhe nach ~100 m nur Grau-Blau; er kaschierte die
    // Ring-Kante, die Fernform (Fern-Ring bis 8 km, Feld-Pass bis 40 km) war gebaut und unsichtbar. Jetzt trägt
    // die Ferne die Funktion, die Luft dunstet sie nur: Extinktion β (Koschmieder: Sichtweite V = −ln 0,02 / β)
    // aus reiner Luft (Rayleigh) + der Trübung des Wetters (fog-Kanal = Dunst, rain-Kanal = Niederschlag), mit
    // der Höhe exponentiell abnehmend (Dunst-Skalenhöhe), längs des Strahls ANALYTISCH integriert; die
    // In-Streuung ist der Horizont-Himmel + die Vorwärts-Keule der Sonne. EIN Knoten (`scene.fogNode`) für jedes
    // Material, der Feld-Pass ruft DIESELBEN Fn-Knoten, die Linsen lesen `_luftSichtM`.

    // Die Extinktion (1/m) am Bezugs-Niveau aus dem Wetter-Feld. Die Koeffizienten folgen aus den zwei
    // beobachtbaren Ankern (`LUFT.sichtKlarM` bei sunny, `LUFT.sichtSturmM` bei stormy) über DIESELBE
    // Wetter-Tabelle, die der Rest der Welt liest — kein freier Regler, ein neues Wetter-Wort erbt seine Luft.
    _luftBeta(wf) {
        const L = AnazhRealm.LUFT;
        const W = AnazhRealm.WEATHER_FIELD;
        const K = -Math.log(L.kontrast);
        const dunst = (K / L.sichtKlarM - L.betaRayleigh) / W.sunny.fog;
        const regen = (K / L.sichtSturmM - L.betaRayleigh - W.stormy.fog * dunst) / W.stormy.rain;
        const f = wf || this._weatherFieldFor();
        return L.betaRayleigh + Math.max(0, f.fog) * dunst + Math.max(0, f.rain) * regen;
    }

    // Die Sichtweite (m) eines waagrechten Blicks in der Augenhöhe `y` (Kontrast fällt unter `LUFT.kontrast`):
    // der CPU-Leser DERSELBEN Uniforms, die der Knoten liest (Linsen, Fern-Wasser-Reichweite); ohne Szene das Gesetz
    // selbst (`_luftBeta` auf dem Bezugsniveau). Eine fehlende Augenhöhe ist ein Aufrufer-Fehler, nie 0.
    _luftSichtM(y) {
        if (!Number.isFinite(y)) throw new Error("_luftSichtM: die Augenhöhe y fehlt (" + y + ")");
        const luft = this._luftEnsure();
        const L = AnazhRealm.LUFT;
        const K = -Math.log(L.kontrast);
        if (!luft) return K / this._luftBeta();
        const U = luft.U;
        const beta = U.beta.value * Math.exp(-(y - U.bezugY.value) / U.hoehe.value);
        return beta > 0 ? K / beta : Infinity;
    }

    // Die Luft-Knoten (EINMAL je Szene): Uniforms in der geteilten renderGroup (Observer-Diät-Pflicht-Paar),
    // `faktor(auge, punkt)` = 1 − e^{−τ} mit τ = β·e^{−(yAuge−y0)/H}·d·(1−e^{−k})/k (k = Δy/H, k→0: 1 − k/2),
    // `farbe(auge, punkt)` = Horizont-Himmel, zur Sonne hin die Keule. `scene.fogNode` ist der Leser jedes
    // Materials (r184 `getFogNode`), der Feld-Pass ruft dieselben Fn.
    _luftEnsure() {
        const st = this.state;
        if (st.luft) return st.luft;
        if (typeof THREE === "undefined" || !st.scene) return null;
        const T = THREE.TSL;
        // Die Luft ist Pflicht jeder Szene: fehlen die TSL-Organe, ist der Vendor alt — laut, nie ein stiller Klar-Himmel
        // ohne Luft (und ohne Feld-Pass, der dieselben Knoten liest).
        if (!T || !T.fog || !T.Fn || !T.uniform || !T.positionWorld || !T.cameraPosition)
            throw new Error("Die Luft: THREE.TSL trägt fog/Fn/uniform/positionWorld/cameraPosition nicht (Vendor)");
        const L = AnazhRealm.LUFT;
        const U = this._uniformHeimatTeilen({
            beta: T.uniform(this._luftBeta(AnazhRealm.WEATHER_FIELD.sunny)),
            hoehe: T.uniform(L.skalenHoeheM),
            bezugY: T.uniform(0),
            farbe: T.uniform(new THREE.Color(0.651, 0.824, 0.925)),
            sonneFarbe: T.uniform(new THREE.Color(0.651, 0.824, 0.925)),
            sonneDir: T.uniform(new THREE.Vector3(0, 1, 0)),
        });
        const faktor = T.Fn(([auge, punkt]) => {
            const v = punkt.sub(auge);
            const d = v.length();
            const k = v.y.div(U.hoehe);
            const klein = k.abs().lessThan(1e-3);
            const kSicher = T.select(klein, T.float(1e-3), k);
            const fk = T.select(
                klein,
                T.float(1).sub(k.mul(0.5)),
                T.float(1).sub(T.exp(kSicher.negate())).div(kSicher)
            );
            const hoehenTerm = T.exp(auge.y.sub(U.bezugY).div(U.hoehe).negate());
            const tau = U.beta.mul(hoehenTerm).mul(d).mul(fk);
            return T.float(1).sub(T.exp(tau.negate()));
        });
        const farbe = T.Fn(([auge, punkt]) => {
            const dir = punkt.sub(auge).normalize();
            const keule = T.pow(T.max(T.dot(dir, U.sonneDir), 0.0), L.mieKeule).mul(L.mieAnteil);
            return T.mix(U.farbe, U.sonneFarbe, keule);
        });
        st.scene.fogNode = T.fog(farbe(T.cameraPosition, T.positionWorld), faktor(T.cameraPosition, T.positionWorld));
        // `himmelFarbe`: die Farbe der LUFT ÜBER DEM WASSER (die In-Streu des Himmels), auch wenn die Kamera taucht — die
        // Himmels-Umgebung malt sich aus ihr (`_ensureSkyEnvironment`), nie aus dem Medium der Kamera.
        st.luft = { U, faktor, farbe, himmelFarbe: new THREE.Color(0.651, 0.824, 0.925) };
        return st.luft;
    }

    // HemisphereLight + die Luft synchron aus Tag-Nacht-Sky-Color × Welt-Feld am Spieler × Wetter × Sonne; die
    // In-Streu-Farbe = Himmel mit kleinem Erd-Anteil (gMix, unten) — Luft ist Luft, keine Dreck-Schicht.
    // Unterwasser (die KAMERA unter dem Spiegel) trägt dieselbe Formel mit Wasser-Trübung im Licht des Orts.
    _dayNightApplyHemiUndLuft(angle, tint, sunDir) {
        const hl = this.state.hemiLight;
        const pm = this.state.playerMesh;
        if (hl) {
            hl.color.setRGB(tint.skyR * 1.1, tint.skyG * 1.1, tint.skyB * 1.1);
            const earth = new THREE.Color(0x463c2e); // Vorlagen-Hemi-Boden (phytogenesis Z.1291, warmes Braun statt 0x3a2818)
            // `tint.auraK` gated auch den Feld-Term des Hemi-BODENS (er fließt über gMix in die Luft-Farbe):
            // bei Default auraK=0 sind Luft/Boden rein Tag-Nacht+Wetter; Feld-Tönung nur über
            // `atmosphere.auraTintStrength`.
            const _aKGround = tint && Number.isFinite(tint.auraK) ? tint.auraK : 0;
            if (_aKGround > 0 && pm && typeof this.auraAt === "function") {
                const field = this.auraAt(pm.position.x, pm.position.z); // §5 (V17.25): via auraAt (living)
                if (field) {
                    const lebendig = Math.max(0, Math.min(1, field.lebendig || 0)) * _aKGround;
                    const glut = Math.max(0, Math.min(1, field.glut || 0)) * _aKGround;
                    const mag = Math.max(0, Math.min(1, field.magieleitung || 0)) * _aKGround;
                    earth.r = Math.min(1, earth.r + lebendig * 0.15);
                    earth.g = Math.min(1, earth.g + lebendig * 0.25);
                    earth.r = Math.min(1, earth.r + glut * 0.35);
                    earth.g = Math.max(0, earth.g + glut * 0.1);
                    earth.r = Math.min(1, earth.r + mag * 0.15);
                    earth.b = Math.min(1, earth.b + mag * 0.3);
                }
            }
            hl.groundColor.copy(earth);
            // Hemi = NUR der Nachthimmel-Boden 0.1 (EIN Himmel, V18.507): der Tag-Term (Vorlagen-Hemi 0.55·π)
            // zählte die Himmels-Umgebung doppelt; die Mond-Nacht bleibt eigen getuned.
            hl.intensity = 0.1 * this._nachtAnteil(angle) * tint.lightMul;
        }
        // Erd-Anteil der In-Streu-Farbe (gMix): fernes Terrain bleibt ein dunklerer Dunst mit lesbarer Silhouette
        // — mit zu viel Himmelsanteil wird es deckungsgleich und die Sonne „scheint durch" die Berge. gMix
        // skaliert mit der Sonnenhöhe → nachts 0, sonst dominiert der warme groundColor den dunklen Himmel.
        const dayAmt = 1 - this._nachtAnteil(angle); // 1 ab ~15° Sonne, 0 am/unter Horizont
        const gMix = 0.26 * dayAmt;
        const fogRn = tint.skyR * (1 - gMix) + (hl ? hl.groundColor.r : 0.3) * gMix;
        const fogGn = tint.skyG * (1 - gMix) + (hl ? hl.groundColor.g : 0.25) * gMix;
        const fogBn = tint.skyB * (1 - gMix) + (hl ? hl.groundColor.b : 0.2) * gMix;
        // Tag-Luft nach dem Studio-Gesetz (EINE Quelle für Himmel+Luft+Ferne): Helligkeit skyB aus der
        // Sonnenhöhe zwischen den Ankern Tag 0xa6d2ec · Nacht 0x0a1326, die Dämmerungs-Glut ist atm.col.
        // r128 las Hex als LINEAR → Rohwerte per setRGB, nie per Hex (sRGB→linear wäre zu dunkel).
        const sunHeightF = Math.max(0, Math.sin(angle));
        const _fATM = this._atmosphere(sunHeightF);
        const skyB = this._himmelHell(sunHeightF);
        let fdR = 0.039 + (0.651 - 0.039) * skyB; // 0x0a1326 → 0xa6d2ec, raw als LINEAR (r128-treu)
        let fdG = 0.075 + (0.824 - 0.075) * skyB;
        let fdB = 0.149 + (0.925 - 0.149) * skyB;
        const lowSun = Math.max(0, 1 - Math.abs(sunHeightF) / 0.28) * Math.max(0, Math.min(1, 1 + sunHeightF * 3.5));
        const glut = lowSun * lowSun * 0.6;
        fdR += (_fATM.col.r - fdR) * glut;
        fdG += (_fATM.col.g - fdG) * glut;
        fdB += (_fATM.col.b - fdB) * glut;
        // Wetter dämpft wie bisher über den EINEN Tint-Kanal (skyMul: sunny 1 → stormy 0.42).
        const wDim = 0.35 + 0.65 * tint.skyMul;
        const fogR = fogRn * (1 - dayAmt) + fdR * wDim * dayAmt;
        const fogG = fogGn * (1 - dayAmt) + fdG * wDim * dayAmt;
        const fogB = fogBn * (1 - dayAmt) + fdB * wDim * dayAmt;
        // DAS MEDIUM DER KAMERA (W-L-d): unter Wasser ist, wessen AUGE unter dem Spiegel liegt — das der Kamera, nie das
        // des Körpers (bis V18.531: eine Kamera 20 m über dem Ufer zeigte Voll-Bild-Unterwasser, solange die Augen des
        // Körpers in der Ufer-Flut lagen; die Verfolger-Kamera am Seegrund sah klare Luft). Die Kamera-Höhe ist ihr
        // eigener Grund-Bezug: liegt sie unter dem Spiegel, der ihre Spalte füllt, ist sie im Wasser.
        const cam = this.state.camera;
        const kameraUnterWasser =
            !!cam && cam.position.y < this._koerperWasser(cam.position.x, cam.position.z, cam.position.y);
        this.state.kameraUnterWasser = kameraUnterWasser;
        const luft = this._luftEnsure();
        if (luft) {
            const L = AnazhRealm.LUFT;
            const U = luft.U;
            U.bezugY.value = Number.isFinite(this.state.waterLevel) ? this.state.waterLevel : 0;
            luft.himmelFarbe.setRGB(fogR, fogG, fogB);
            if (kameraUnterWasser) {
                // Unter Wasser: DIESELBE Formel, Wasser-Trübung ohne Höhen-Abnahme (H → ∞), keine Sonnen-Keule. Die
                // Farbe ist das Unterwasser-Gesetz des Terrain-Studios: der Durchlass der ersten 0,3 m (WASSER_GESETZ.wK,
                // Beer-Lambert) × das Tageslicht — in der Welt die Helligkeit der Luft über dem Wasser (die EINE
                // tag-, nacht- und wetter-kohärente Himmels-Quelle): mittags türkis, halb so hell wie die Luft, nachts
                // dunkler als die Nacht darüber, im Sturm trüb. Bis V18.531 ein Literal 0,06/0,19/0,32 zu jeder Stunde —
                // Mitternacht unter Wasser war heller als Mittag unter Wasser und 2,5× heller als die Nacht darüber (W-L-a).
                const WGu =
                    AnazhRealm.Gesetz("terrain:WASSER_GESETZ", null) ||
                    AnazhRealm._kernPflichtBruch("terrain:WASSER_GESETZ");
                const tagesLicht = 0.2126 * fogR + 0.7152 * fogG + 0.0722 * fogB;
                U.farbe.value.setRGB(
                    Math.exp(-WGu.wK[0] * 0.3) * tagesLicht,
                    Math.exp(-WGu.wK[1] * 0.3) * tagesLicht,
                    Math.exp(-WGu.wK[2] * 0.3) * tagesLicht
                );
                U.sonneFarbe.value.copy(U.farbe.value);
                U.beta.value = -Math.log(L.kontrast) / L.unterwasserM;
                U.hoehe.value = 1e9;
            } else {
                U.farbe.value.setRGB(fogR, fogG, fogB);
                // Die Keule: zur Sonne hin streut der Dunst ihr (Rayleigh-gefiltertes) Licht vorwärts — der Glast
                // im Gegenlicht, warm bei tiefer Sonne. Unter dem Horizont fällt sie mit der Sonne (Horizont-Fade).
                const sd = sunDir || this._dayNightSunDirection(angle);
                U.sonneDir.value.set(sd.x, sd.y, sd.z).normalize();
                const sonnig = sd.y > 0 ? this._celestialHorizonFade(sd.y) * tint.skyMul : 0;
                const hell = (0.2126 * fogR + 0.7152 * fogG + 0.0722 * fogB) * L.mieGlanz;
                U.sonneFarbe.value.setRGB(
                    fogR + (_fATM.col.r * hell - fogR) * sonnig,
                    fogG + (_fATM.col.g * hell - fogG) * sonnig,
                    fogB + (_fATM.col.b * hell - fogB) * sonnig
                );
                U.beta.value = this._luftBeta();
                U.hoehe.value = L.skalenHoeheM;
            }
        }
        // Mond-Rim atmet mit der Nacht: voll bei Sonne unter dem Horizont, ausgeblendet bis Sonnenhöhe 0.25, tags
        // 0; Regen dämpft. Der Wert IST das Shader-Gate.
        const au = this.state.atmoUniforms;
        if (au && au.terrainMoonRim) {
            const rainyMix = this._weatherBlendedValue(0, 1);
            const moonBase =
                this.state.atmosphere && Number.isFinite(this.state.atmosphere.moonRim)
                    ? this.state.atmosphere.moonRim
                    : AnazhRealm.SUBSTANCE_RESPONSE.moonRim;
            const sunUp = Math.max(0, Math.sin(angle));
            au.terrainMoonRim.value = moonBase * Math.max(0, 1 - sunUp * 4) * (1 - Math.min(1, rainyMix) * 0.7);
        }
        // Unterwasser-Pass: das Wasser rendert als einseitige Oberseite (BackSide + Top-Cull) → von unten
        // fehlte die Decke. Liegt die Kamera unter Wasser, wird das EINE geteilte Wasser-Material
        // DoubleSide, beim Auftauchen zurück BackSide (von oben unverändert).
        const hsm = this.state.hydroSurfaceMaterial;
        if (hsm) {
            const wantSide = kameraUnterWasser ? THREE.DoubleSide : THREE.BackSide;
            if (hsm.side !== wantSide) hsm.side = wantSide;
        }
    }

    // Das Wasser-Material (hydroSurfaceMaterial für Meer/Fluss/See) folgt der
    // Tag-Nacht-Sprache: uSunDir + uLight (die Luft legt `scene.fogNode` auf). `lightDir` ist der AKTIVE
    // Himmelskörper (vom Aufrufer _applyDayNightToScene) → der Glitzer folgt tags der Sonne, nachts dem Mond.
    _dayNightApplyWaterMaterials(lightDir) {
        if (!this.state.directionalLight) return;
        const dl = this.state.directionalLight;
        const lightVal = Math.max(0.22, dl.intensity);
        // Das Licht des Orts für Körper und Schaum: E/π einer waagrechten Fläche (die Bilanz der Belichtung).
        const e = this._waagrechtIrradianz(this._wasserE || (this._wasserE = [0, 0, 0]));
        // Die Uniforms leben in state.hydroSurfaceUniforms.
        const applyToTSL = (uniforms) => {
            if (!uniforms) return;
            if (uniforms.sunDir) uniforms.sunDir.value.copy(lightDir);
            if (uniforms.light) uniforms.light.value = lightVal;
            if (uniforms.irr) uniforms.irr.value.setRGB(e[0] / Math.PI, e[1] / Math.PI, e[2] / Math.PI);
            if (uniforms.sunCol) uniforms.sunCol.value.copy(dl.color);
            // Der Wind des Wetters (0 ruhig … 1 Sturm): die Böen-Amplitude der Welt ohne ihren Verstärker.
            const wu = this.state.windUniforms;
            if (uniforms.wind && wu && wu.uWindStrength)
                uniforms.wind.value = Math.max(0, Math.min(1, wu.uWindStrength.value / AnazhRealm.WEATHER_WIND_AMP));
        };
        applyToTSL(this.state.hydroSurfaceUniforms);
    }

    // [ATMOSPHERE] Sonne + Mond als sichtbare Meshes, gespeist aus _applyDayNightToScene (EINE Quelle).
    // Abstand 380 m (vor der Skybox bei 500 m), sichtbar bei Höhe ≥ 0, Mond gegenüber;
    // emissive-Material leuchtet ohne Licht.
    _updateCelestialBodies(angle, lightMul) {
        const sunDist = AnazhRealm.HIMMEL.koerperAbstandM;
        const sun = this.state.sunMesh;
        const moon = this.state.moonMesh;
        // Himmelskörper folgen der KAMERA, nicht dem Welt-Ursprung: hier nur die RICHTUNG (skyOffset)
        // setzen, `_loopRender` addiert pro Frame camera.position. An absoluten Welt-Positionen stünden sie
        // bei fernem Spieler neben/hinter ihm (vom Terrain verdeckt, Mesh ≠ `sunDir`-Lichtrichtung).
        if (sun) {
            const sx = Math.cos(angle) * sunDist;
            const sy = Math.sin(angle) * sunDist;
            const sz = Math.sin(angle * 0.5) * sunDist * 0.4;
            if (!sun.userData.skyOffset) sun.userData.skyOffset = new THREE.Vector3();
            sun.userData.skyOffset.set(sx, sy, sz);
            sun.visible = sy > -10; // unter Horizont ausblenden
            // Sonne dimmt mit Wetter (rainy = trüber Schein); die Scheibe leuchtet HDR (`HIMMEL.sonneLeucht`) über ihrem
            // Hof — die Ausgabe-Kette tont sie zum hellsten Punkt des Himmels.
            if (sun.material && sun.material.color) {
                const L = AnazhRealm.HIMMEL.sonneLeucht * lightMul;
                sun.material.color.setRGB(1.0 * L, 0.92 * L, 0.7 * L);
            }
        }
        if (moon) {
            // Mond gegenüber der Sonne
            const moonAngle = angle + Math.PI;
            const mx = Math.cos(moonAngle) * sunDist;
            const my = Math.sin(moonAngle) * sunDist;
            const mz = Math.sin(moonAngle * 0.5) * sunDist * 0.4;
            if (!moon.userData.skyOffset) moon.userData.skyOffset = new THREE.Vector3();
            moon.userData.skyOffset.set(mx, my, mz);
            moon.visible = my > -10;
            // Der Mond am Taghimmel ist BLASS: seine Leuchtdichte gegen die des Himmels (`HIMMEL.mondGegenHimmel`)
            // — nachts fast deckend, am Tag ein heller Schleier.
            if (moon.material) {
                const hell = this._himmelHell(Math.sin(angle));
                moon.material.opacity = 0.98 / (1 + hell / AnazhRealm.HIMMEL.mondGegenHimmel);
            }
        }
    }

    // Himmelskörper pro Render-Frame an die Kamera heften: Weltposition = Kamera + skyOffset.
    // Im `_loopRender` SYNCHRON nach skybox/starField — vor dem Camera-Update gäbe 1 Frame Nachlauf.
    _followCelestialBodies() {
        const cam = this.state.camera;
        if (!cam) return;
        const pin = (obj) => {
            if (obj && obj.userData && obj.userData.skyOffset) {
                obj.position.copy(cam.position).add(obj.userData.skyOffset);
            }
        };
        pin(this.state.sunMesh);
        pin(this.state.moonMesh);
    }

    // Treibt timeOfDay nach Echtzeit + dayLength; currentTime in Sekunden (performance.now()/1000).
    // Delta aus _lastDayNightTick, gegen Sprünge (Tab-Wechsel) auf 1.0 s gekappt.
    tickDayNight(currentTime) {
        const last = this.state._lastDayNightTick;
        if (!Number.isFinite(last)) {
            this.state._lastDayNightTick = currentTime;
            this._applyDayNightToScene();
            return;
        }
        const delta = Math.min(1.0, currentTime - last); // Sekunden, gegen Tab-Sleeps
        this.state._lastDayNightTick = currentTime;
        const minutes = this.state.dayLengthMinutes || this.constructor.DAY_LENGTH_DEFAULT_MINUTES;
        const cycleSeconds = Math.max(60, minutes * 60); // hard-floor 1min
        const advance = delta / cycleSeconds; // wieviel von 0..1 in delta vergeht
        this._uhrSetzen((this.state.timeOfDay + advance) % 1, "uhr");
        // Läuft JEDEN Frame, kein Throttle: bei 10 Hz sprang die Beleuchtung in Stufen (ruckelnde Schatten);
        // die Funktion ist billig genug (Color-Lerps + Vector-Copies).
        this._applyDayNightToScene();
        // Status-Zeile und Regler bleiben 10 Hz throttled (DOM ist teurer als die Scene-Updates, und das Auge braucht
        // keine 60-Hz-Uhr).
        const lastApply = this.state._lastDayNightApply || 0;
        if (currentTime - lastApply >= 0.1) {
            this.state._lastDayNightApply = currentTime;
            this._uhrAnzeigen(this.state.timeOfDay);
        }
    }

    // DIE ANZEIGE DER UHR (Leben-Schau 2: der Tageszeit-Regler zeigte 12:00 bei Welt 01:41 — er las die Uhr nur beim
    // Aufbau der Einstellungen): die Status-Zeile UND der Regler (`_tageszeitRegler`) zeigen die Welt-Zeit, nach jedem
    // Satz und im Gang der Uhr.
    _uhrAnzeigen(t) {
        const r = this._statusRefs;
        if (r && r.time) r.time.textContent = this._timeOfDayLabel(t);
        const g = this._tageszeitRegler;
        if (g && g.tod) {
            const wert = String(Math.round((((t % 1) + 1) % 1) * 1000));
            if (g.tod.value !== wert) g.tod.value = wert;
            const text = this._timeOfDayLabel(t).replace(/^[^\s]+\s/, "");
            if (g.todVal && g.todVal.textContent !== text) g.todVal.textContent = text;
        }
    }

    // DAS GESETZ DER SCHREIBER VON UHR UND WETTER (Leben-Schau 2, 09.10., §6 #1 — „Uhr und Wetter gehören dem Spieler"):
    // die Klasse einer Quelle (`ctx.source` der DSL, oder der Name eines Host-Schreibers) für `was` = "uhr" | "wetter".
    //   „spieler" — sein Satz und seine Werkzeuge (`_spielerVerlangt`), der Regler der Einstellungen („regler"), der Begleiter
    //               der geteilten Stimme („remote-voice"); für das GETEILTE Wetter auch ein Mitspieler („remote:…" — die Uhr
    //               reist nie, set_time_of_day ist NON_BROADCASTABLE).
    //   „gesetz"  — ein Gesetz, das der Spieler gab („rule:" + eine Quelle des Spielers), und der Vorschlag eines Wesens,
    //               dem der Spieler mit seinem Klick zusagte („zusage:…", `_executeCreatureProgram`): es schreibt wie er (ein
    //               stehendes Wort folgt ihm).
    //   „eigen"   — der Gang der Uhr („uhr"), der Wetter-Zug („auto-zug"), das Laden eines Spielstands („laden").
    //   „welt"    — alles andere: der Nexus, seine Gesetze, die Emotion, die Wesen („creature:…" — auch das Wesen, das im
    //               Schöpfer-Modus von selbst handelt; bis zur Gegenprüfung las es sich als Zusage und nahm dem Spieler sein
    //               Wort), eine Quelle ohne Namen. Rechte trägt nur eine Quelle, die den Spieler oder seine Zusage NENNT.
    // Die Welt schreibt die Uhr nie und das Wetter nie direkt — sie wünscht das nächste Wort des Wetter-Zugs (`_setWeather`).
    // Vorher schrieben zwei Nexus-Gesetze die Uhr 30-mal in 160 s, und „setze wetter sonnig" hielt bis zum nächsten Regen.
    _himmelSchreiber(quelle, was) {
        if (quelle === "uhr" || quelle === "auto-zug" || quelle === "laden") return "eigen";
        if (typeof quelle !== "string") return "welt";
        const spieler = (q) =>
            this._spielerVerlangt(q) ||
            q === "regler" ||
            q === "remote-voice" ||
            (was === "wetter" && q.startsWith("remote:"));
        if (spieler(quelle)) return "spieler";
        // ein Gesetz trägt die Quelle seines Gebers, auch ein Gesetz, das ein Gesetz gab („rule:rule:human")
        let geber = quelle;
        while (geber.startsWith("rule:")) geber = geber.slice(5);
        if (geber !== quelle && spieler(geber)) return "gesetz";
        // der Vorschlag eines Wesens, dem der Spieler zusagte (sein Klick auf „Ausführen", `_executeCreatureProgram`), schreibt
        // wie ein Gesetz des Spielers; was ein Wesen von selbst tut („creature:…"), ist Welt
        if (quelle.startsWith("zusage:")) return "gesetz";
        return "welt";
    }

    // DER EINE SCHREIBER DER UHR (`state.timeOfDay`): der Gang der Uhr („uhr", `tickDayNight`), der Spieler (`setTimeOfDay`
    // aus seinem Satz, seinem Gesetz, dem Regler) und das Laden („laden") — die Welt nie (`_himmelSchreiber`; sie steht beim
    // Namen im Log). Liefert, ob die Uhr geschrieben wurde. gate:wetter-wache zählt `this.state.timeOfDay =` im Stamm: einmal.
    _uhrSetzen(t, quelle) {
        const v = Number(t);
        if (!Number.isFinite(v)) return false;
        if (this._himmelSchreiber(quelle, "uhr") === "welt") {
            this.log(
                `Uhr gehalten: ${quelle || "?"} wollte ${this._timeOfDayLabel(v)} — die Uhr gehört dem Spieler`,
                "DEBUG"
            );
            return false;
        }
        this.state.timeOfDay = v;
        return true;
    }

    // Liefert eine kurze, lesbare Tageszeit-Beschreibung. z. B. "🌅 06:24".
    // Vier Symbole für vier Phasen: 🌌 Nacht / 🌅 Morgen / ☀️ Tag / 🌇 Abend.
    _timeOfDayLabel(t) {
        const tWrap = ((t % 1) + 1) % 1;
        const hours = tWrap * 24;
        const h = Math.floor(hours);
        const m = Math.floor((hours - h) * 60);
        const hStr = h.toString().padStart(2, "0");
        const mStr = m.toString().padStart(2, "0");
        let emoji = "☀️";
        if (tWrap < 0.22 || tWrap >= 0.85)
            emoji = "🌌"; // Nacht
        else if (tWrap < 0.35)
            emoji = "🌅"; // Morgen
        else if (tWrap < 0.65)
            emoji = "☀️"; // Tag
        else emoji = "🌇"; // Abend
        return `${emoji} ${hStr}:${mStr}`;
    }

    // Setzt die Tag-Länge (in Minuten): die Wahl des Spielers, persistiert bei ihm (localStorage) — nie im Spielstand, sonst
    // hielte ein alter Stand seinen alten Tag fest (bis zur Leben-Schau 2 trug jeder Stand den 8-min-Standard).
    setDayLength(minutes) {
        const min = this.constructor.DAY_LENGTH_MIN_MINUTES;
        const max = this.constructor.DAY_LENGTH_MAX_MINUTES;
        const num = Number(minutes);
        const safeMinutes = Number.isFinite(num) ? num : this.constructor.DAY_LENGTH_DEFAULT_MINUTES;
        const v = Math.max(min, Math.min(max, safeMinutes));
        this.state.dayLengthMinutes = v;
        try {
            if (typeof localStorage !== "undefined") localStorage.setItem("anazh.dayLengthMinutes", String(v));
        } catch (e) {
            void e;
        }
    }

    // Stellt die Uhr (z. B. via DSL-Op set_time_of_day(0.5) für Mittag, oder der Regler „regler") — über den EINEN
    // Uhr-Schreiber und sein Gesetz: eine Quelle der Welt stellt sie nie (false).
    setTimeOfDay(t, quelle) {
        const v = Math.max(0, Math.min(1, Number(t)));
        if (!Number.isFinite(v) || !this._uhrSetzen(v, quelle)) return false;
        this._applyDayNightToScene();
        this._uhrAnzeigen(v);
        return true;
    }

    // ### 6.G3.b — Sanfte Wetter-Übergänge ###

    // Per-Wetter-Skalar, über die laufende Transition cross-gefadet — EINE Quelle für alle
    // wetter-abhängigen Skalare (sonst flippen weatherEffect/cloudCover hart, während Licht fadet).
    // Lerpt über die WEATHER_INTENSITY-Achse (sunny=0 · rainy=1 · stormy=1.35): ein neues Wort
    // extrapoliert die sunny→rainy-Spanne; unbekannte Worte zählen 0.
    _weatherBlendedValue(sunnyVal, rainyVal) {
        const INT = AnazhRealm.WEATHER_INTENSITY;
        const valFor = (w) => sunnyVal + (rainyVal - sunnyVal) * (INT[w] || 0);
        const wt = this.state.weatherTransition;
        if (wt && wt.from && wt.to) {
            const p = Math.max(0, Math.min(1, wt.progress || 0));
            return valFor(wt.from) + (valFor(wt.to) - valFor(wt.from)) * p;
        }
        return valFor(this.state.weather);
    }

    // DER EINE LOOK-WETTER-LESER: die 5 Kanäle {fog,sun,grey,wind,rain}, transition-aware (dieselbe
    // from/to/progress-Lerp wie `_weatherBlendedValue`, vektoriell). `w` = Wort-Vorgabe (Default
    // state.weather), während einer Transition führen from/to; unbekannt → sunny.
    // Gibt eine FRISCHE Kopie zurück (die frozen Statics bleiben unberührt).
    _weatherFieldFor(w) {
        const FLD = AnazhRealm.WEATHER_FIELD;
        const base = FLD.sunny;
        const fieldFor = (word) => FLD[word] || base;
        const lerpField = (a, b, p) => ({
            fog: a.fog + (b.fog - a.fog) * p,
            sun: a.sun + (b.sun - a.sun) * p,
            grey: a.grey + (b.grey - a.grey) * p,
            wind: a.wind + (b.wind - a.wind) * p,
            rain: a.rain + (b.rain - a.rain) * p,
        });
        const wt = this.state.weatherTransition;
        if (wt && wt.from && wt.to) {
            const p = Math.max(0, Math.min(1, wt.progress || 0));
            return lerpField(fieldFor(wt.from), fieldFor(wt.to), p);
        }
        const f = fieldFor(typeof w === "string" ? w : this.state.weather);
        return { fog: f.fog, sun: f.sun, grey: f.grey, wind: f.wind, rain: f.rain };
    }

    // D5a (V18.128) — die wet-Frage: regnet es hier (rainy UND stormy)?
    // Ersetzt die binären ===\"rainy\"-Leser (Journal/Nexus/Spawn-Stimmung).
    _weatherIsWet(w) {
        const word = typeof w === "string" ? w : this.state.weather;
        return (AnazhRealm.WEATHER_INTENSITY[word] || 0) >= 1;
    }

    // Der EINE Wetter-Schreiber: state.weather wird SOFORT gesetzt (weather_is + DSL reagieren instant),
    // die Transition ist rein visuell (Skybox + Symphonie cross-faden ~45 s). Aufrufer: DSL-Op `weather`
    // (Quelle = die DSL-Quelle: emotion:<Achse> · nexus · rule:<Herkunft> · human · remote:<Peer> · llm:grok …)
    // und der Auto-Zug (_loopWeatherAndGrowth, „auto-zug") — nie ein roher Flip am Blend-System vorbei.
    // DIE WETTER-WACHE: eine Uhr des Auto-Zugs unter 0 ist der Halt einer Messung (die Bühne der Linsen,
    // scripts/lib/ausgabe-aufnahme.cjs `__wetterHalten`; im Spiel zählt die Uhr von 0 aufwärts). Halt heißt Halt:
    // solange sie steht, dreht KEIN Schreiber das Wetter. Bis V18.534 hielt sie nur den Auto-Zug — der OMEN
    // fand in einem Boot sunny → rainy bei eingefrorener Uhr (ein anderer Schreiber: Nexus, Emotion, Gesetz).
    // DAS GESETZ DER SCHREIBER (`_himmelSchreiber`, Leben-Schau 2): der SPIELER schreibt, und sein Wort steht
    // (`wetterWort`, bis „setze wetter frei"); ein Gesetz des Spielers schreibt wie er; solange das Wort steht, dreht
    // weder der Zug noch die Welt das Wetter (false). Ohne Wort schreibt die WELT (Nexus, seine Gesetze, die Emotion,
    // die Wesen) nie selbst: sie WÜNSCHT das nächste Wort (`wetterWunsch`, Rückgabe "wunsch"), der Zug zieht es in seinem
    // Takt (`WETTER_ZUG_SEK`). Vorher hielt „setze wetter sonnig" bis zum nächsten Nexus-Regen (alle 4,7 s).
    _setWeather(name, quelle) {
        if (!(name in AnazhRealm.WEATHER_INTENSITY)) return false;
        if (this._messHalt()) {
            this.log(`Wetter gehalten: ${quelle || "?"} wollte ${name}`, "DEBUG");
            return false;
        }
        const wer = this._himmelSchreiber(quelle, "wetter");
        if (wer === "welt" || wer === "eigen") {
            if (this.state.wetterWort) {
                this.log(
                    `Wetter gehalten: ${quelle || "?"} wollte ${name} — es gilt das Wort des Spielers (${this.state.wetterWort})`,
                    "DEBUG"
                );
                return false;
            }
            if (wer === "welt") {
                this.state.wetterWunsch = { wort: name, quelle: quelle || "?" };
                return "wunsch";
            }
        }
        if (wer === "spieler") {
            this.state.wetterWort = name;
            this.state.wetterWunsch = null;
        } else if (wer === "gesetz" && this.state.wetterWort) this.state.wetterWort = name;
        const oldWeather = this.state.weather;
        this.state.weather = name;
        this.state.weatherEffectTime = 0;
        if (oldWeather !== name) {
            this.requestWeatherTransition(name, undefined, oldWeather);
        }
        // updateSkyboxWeather wird nicht direkt gerufen —
        // _applyDayNightToScene übernimmt das pro Frame.
        this.updateCreatureEmotions();
        return true;
    }

    // DER SPIELER GIBT DAS WETTER FREI („setze wetter frei"): sein Wort fällt, ein alter Wunsch der Welt mit ihm; das Wetter
    // steht noch einen Takt des Zugs (seine Uhr beginnt bei 0 — nie unter dem Halt einer Messung), dann zieht es wieder.
    _wetterFreigeben(quelle) {
        const wer = this._himmelSchreiber(quelle, "wetter");
        if (wer !== "spieler" && wer !== "gesetz") return false;
        this.state.wetterWort = null;
        this.state.wetterWunsch = null;
        if (!this._messHalt()) this.state.weatherEffectTime = 0;
        return true;
    }

    // [ATMOSPHERE] Startet einen Cross-Fade. Default-Dauer via _emotionModulate aus den Emotionen
    // (peace ×1.6 langsamer, chaos ×0.4 schneller); eine explizite Dauer überschreibt.
    requestWeatherTransition(target, durationMs, fromWeather) {
        // D5a (V18.128) — das Vokabular ist die WEATHER_INTENSITY-Tabelle
        // (sunny · rainy · stormy), nicht mehr das harte Binär-Paar.
        if (!(target in AnazhRealm.WEATHER_INTENSITY)) return false;
        let dur;
        if (typeof durationMs === "number" && Number.isFinite(durationMs)) {
            dur = Math.max(100, durationMs);
        } else {
            // Default mit Emotion-Modulation
            const baseDur = this.constructor.WEATHER_TRANSITION_DURATION_MS; // 45000
            const modulated = this._emotionModulate(baseDur, {
                peace: { mul: 1.6 }, // peace=1 → ×1.6 (72s)
                chaos: { mul: 0.4 }, // chaos=1 → ×0.4 (18s)
                sorrow: { mul: 1.2 }, // sorrow zieht Wolken langsam-melancholisch
            });
            dur = Math.max(8000, Math.min(120000, modulated));
        }
        const wt = this.state.weatherTransition;
        let from = typeof fromWeather === "string" ? fromWeather : this.state.weather;
        if (wt && wt.from && wt.to && wt.to !== target) {
            // Mitten im Übergang — behalte Vorgänger-from, aber neues to.
            from = wt.from;
        } else if (wt && wt.to === target) {
            // Schon auf demselben Ziel — no-op (idempotent).
            return true;
        }
        if (from === target) {
            // Schon dort, kein Übergang nötig.
            this.state.weatherTransition = null;
            return true;
        }
        this.state.weatherTransition = {
            from,
            to: target,
            progress: 0,
            duration: dur,
            startedAt: typeof performance !== "undefined" ? performance.now() : Date.now(),
        };
        return true;
    }

    // Pro Frame: treibt weatherTransition.progress; bei ≥ 1 state.weather = to, Transition genullt.
    // Währenddessen wirken Skybox-Mul (_applyDayNightToScene) und die Klang-Welt (der Regen liest das
    // transition-aware Wetter-Feld `_weatherFieldFor` — kein zweiter Schreiber).
    tickWeatherTransition(_currentTime) {
        const wt = this.state.weatherTransition;
        if (!wt) return;
        const nowMs = typeof performance !== "undefined" ? performance.now() : Date.now();
        const elapsed = nowMs - wt.startedAt;
        wt.progress = Math.min(1, elapsed / wt.duration);
        if (wt.progress >= 1) {
            // Übergang abgeschlossen: state.weather steht seit dem Aufruf auf dem Ziel; der nächste
            // DayNight-Tick setzt die finale Skybox-Tönung (currentTint direkt).
            this.state.weatherTransition = null;
        }
    }

    // ### 6.G3.c — Fauna-Lifecycle ###

    // Raycast-Helper: der Aufrufer übergibt einen Extractor (Normale, hitPoint oder nur hasHit) —
    // der Lifecycle bleibt in dieser EINEN Funktion. `o` reicht die Optionen des Feld-Strahls durch (`_fieldRaycast`).
    _runRaycast(rayStart, rayEnd, extractor, o) {
        // Feld-nativer Raycast (DDA durch das Dichtefeld + Struktur-Box-Ray, kein Ammo). Ein synthetisches
        // `cb` mit derselben Schnittstelle (get_m_hitPointWorld/get_m_hitNormalWorld/hasHit) hält alle
        // Aufrufer unverändert. rayStart/rayEnd in skalierten Einheiten → × sf rein, ÷ sf im cb raus.
        const sf = this.state.scaleFactor || 1;
        const rc = this._fieldRaycast(
            rayStart.x() * sf,
            rayStart.y() * sf,
            rayStart.z() * sf,
            rayEnd.x() * sf,
            rayEnd.y() * sf,
            rayEnd.z() * sf,
            o
        );
        const cb = {
            get_m_hitPointWorld: () => ({ x: () => rc.x / sf, y: () => rc.y / sf, z: () => rc.z / sf }),
            get_m_hitNormalWorld: () => ({ x: () => rc.nx, y: () => rc.ny, z: () => rc.nz }),
            hasHit: () => rc.hit,
        };
        return extractor(cb, rc.hit);
    }

    // [ATMOSPHERE] Compound-Tags einer Soul (ohne Kreatur-Instanz zu brauchen).
    // Wrapper um computeCompoundTags({parts: soul.bodyParts}) — wird in
    // _pickFaunaSoulAtPlayer für Affinity-Vergleich vor dem Spawn gebraucht.
    _creatureSoulTags(soulName) {
        const soul = AnazhRealm.CREATURE_SOULS && AnazhRealm.CREATURE_SOULS[soulName];
        if (!soul || !soul.bodyParts) return {};
        return this.computeCompoundTags({ parts: soul.bodyParts });
    }

    // [ATMOSPHERE] Soul-Wahl für eine neue Kreatur per Affinity-Pick: Compound-Tags · Welt-Feld
    // (Dot-Product), höchste Resonanz gewinnt (dieselbe Logik wie spawnAffinityForBlueprint);
    // noise 0.15 streut wiederholte Spawns (aus dem Fauna-Strom). Optionales x, z ersetzt die Spieler-Position.
    _pickFaunaSoulAtPlayer(x, z, rng = this._faunaRng()) {
        const pm = this.state.playerMesh;
        if ((!pm && (x === undefined || z === undefined)) || typeof this.worldFieldAt !== "function") {
            return this._pickCreatureSoulName(null, rng);
        }
        const px = x !== undefined ? x : pm.position.x;
        const pz = z !== undefined ? z : pm.position.z;
        const field = this.auraAt(px, pz); // §5 (V17.25): via auraAt (living Lese-API)
        if (!field) return this._pickCreatureSoulName(null, rng);
        // Kandidaten: alle Built-in-Souls mit ihren Compound-Tags
        const souls = AnazhRealm.CREATURE_SOULS;
        if (!souls) return this._pickCreatureSoulName(null, rng);
        // PHASE E — Raubtiere kommen nicht ambient (predator-Filter, sparsam).
        const candidates = Object.keys(souls)
            .filter((name) => !souls[name].predator)
            .map((name) => ({
                name,
                tags: this._creatureSoulTags(name),
            }));
        const { pick } = this._affinityPickFromCandidates(candidates, field, 0.15, rng);
        return (pick && pick.name) || this._pickCreatureSoulName(null, rng);
    }

    // Findet die älteste Kreatur (kleinster bornAt). Für Tod-Wahl bei
    // Überpopulation — wer am längsten da ist, geht zuerst. Defensiv gegen
    // Kreaturen ohne bornAt (z.B. aus Legacy-Save).
    _findOldestCreature() {
        if (!this.state.creatures || this.state.creatures.length === 0) return null;
        let oldest = null;
        let oldestBorn = Infinity;
        for (const c of this.state.creatures) {
            const b = (c && c.userData && c.userData.bornAt) || 0;
            if (b < oldestBorn) {
                oldestBorn = b;
                oldest = c;
            }
        }
        return oldest;
    }

    // [ATMOSPHERE] Lifecycle-Tod: Trauer (sorrow), journal-loss-Eintrag, Aura-Pulse, dann der Fall (_kreaturFaellt: der
    // letzte Ruf, kippen, liegen, sinken). Memory stirbt bewusst mit der Kreatur.
    _creatureNaturalDeath(creature) {
        if (!creature) return false;
        const name = (creature.userData && creature.userData.name) || "(unbenannt)";
        const soul = (creature.userData && creature.userData.soul) || "wesen";
        const bornAt = (creature.userData && creature.userData.bornAt) || 0;
        const ageSec = bornAt > 0 ? (Date.now() - bornAt) / 1000 : null;
        // Tags BEVOR das Wesen fällt
        const tags = this.computeCreatureCompoundTags(creature);
        // Trauer ∝ Bindung × Vitalität: eine gebundene Gefährtin zu verlieren schmerzt mehr. Der
        // `lebendig`-Tag färbt hier SORROW (nicht joy wie die Bau-Brücke) — darum eine explizite Magnitude
        // statt der Tag-Brücke.
        const bond = (creature.userData && creature.userData.bond) || 0;
        const lebendig = Math.min(1, Math.max(0, (tags && tags.lebendig) || 0));
        const griefMag = 0.3 + bond * 1.2 + lebendig * 0.4; // ungebunden ~klein, tief gebunden ~Trauer
        this._feelAction("loss", { magnitude: griefMag });
        // Der Tod nährt das Feld: das Wesen gibt seine Lebendigkeit (∝ lebendig-Substanz) an den Ort
        // zurück — im SELBEN Overlay, in das die Geburt schreibt.
        if (typeof this._depositLife === "function" && creature.position) {
            this._depositLife(
                creature.position.x,
                creature.position.z,
                AnazhRealm.LIFE_FIELD.pulseCenter * (0.8 + lebendig)
            );
        }
        // Journal-Eintrag
        if (typeof this.journalAppend === "function") {
            this.journalAppend("loss", `${name} kehrt zur Erde zurück.`, {
                creature: name,
                soul,
                ageSec,
                cause: "fauna_lifecycle",
            });
        }
        // DER FALL (Posten 7): das Wesen fällt auf die Flanke, liegt und sinkt in die Erde (_kreaturFaellt — derselbe Weg wie
        // der Tod im Kampf); das Lebewohl, der letzte Ruf (klang:UMWELT.tier, Trauer-Kontur), klingt im Fall — der Leichnam
        // ruft nie. Memory wird bewusst verworfen, nicht ins Journal kopiert.
        this._kreaturFaellt(creature);
        this.state.faunaLifecycle.lastDeathAt = Date.now();
        return true;
    }

    // DER FAUNA-STROM (Lehre 7, Γ5): jeder Wurf des Tier-Lebens zieht aus einem seed-gebundenen Strom der Welt, nie aus
    // Math.random (Peers und Reloads würfelten sonst verschiedene Faunen) — je ZWECK ein eigener Strom (das Stream-Gesetz
    // `_streamRng`: ein Wurf mehr re-rollt nie einen anderen): "fauna" der Lebenszyklus (Geburts-Ort, Seele, Gemüt, Geburts-
    // und Todes-Takt, Gegenwehr), "gefuehl" das Wetter-Gefühl, "stimme" die Wahl der Worte, "hof" der Ort einer Hof-Geburt.
    // Wechselt die Welt (ihr Seed), beginnen die Ströme neu.
    _faunaRng(zweck = "fauna") {
        const seed = (this.state.worldMeta && this.state.worldMeta.seed) || "anazh-realm-seed";
        let f = this._faunaStroeme;
        if (!f || f.seed !== seed) f = this._faunaStroeme = { seed, rng: Object.create(null) };
        return f.rng[zweck] || (f.rng[zweck] = this._streamRng(seed + "-" + zweck));
    }

    // DER GEBURTS-ORT — die Boot-Regel als EIN Gesetz für den Boot-Spawn UND die natürliche Geburt: fern
    // (CREATURE_SPAWN_FAR_MIN + Streu-Spanne um den Spieler) und außerhalb des Blicks; das Wesen taucht aus der Distanz
    // auf, sein Satz blendet ein (`einblenden`). Die Leben-Prüfung (R-D13) sah die Geburt 12–25 m vor dem Spieler, einen
    // Hirsch 2 m neben ihm. Bis zu acht Würfe suchen einen Ort außerhalb des Blicks; fern ist jeder. Ein WUNSCH-Ort (die
    // Nexus-Geburt am Ort des Bedarfs) gilt, wenn er selbst fern und außerhalb des Blicks liegt.
    _kreaturGeburtsOrt(rng, spanne = 80, wunsch = null) {
        const pm = this.state.playerMesh;
        const cx = pm ? pm.position.x : 0;
        const cz = pm ? pm.position.z : 0;
        const fr = this._frustumCache;
        const v = this._geburtsOrtV || (this._geburtsOrtV = new THREE.Vector3());
        if (wunsch && Math.hypot(wunsch.x - cx, wunsch.z - cz) >= AnazhRealm.CREATURE_SPAWN_FAR_MIN) {
            v.set(wunsch.x, this.getTerrainHeightAt(wunsch.x, wunsch.z) + 1, wunsch.z);
            if (!fr || !fr.containsPoint(v))
                return this._wildnisTraegt(wunsch.x, wunsch.z) ? { x: wunsch.x, z: wunsch.z } : null;
        }
        let x = cx;
        let z = cz;
        for (let k = 0; k < 8; k++) {
            const ang = rng() * Math.PI * 2;
            const d = AnazhRealm.CREATURE_SPAWN_FAR_MIN + rng() * spanne;
            x = cx + Math.cos(ang) * d;
            z = cz + Math.sin(ang) * d;
            if (!fr) break;
            v.set(x, this.getTerrainHeightAt(x, z) + 1, z);
            if (!fr.containsPoint(v)) break;
        }
        // Die Geburt ist ein Wurf des Feldes: trägt die Wildnis den Ort nicht, gibt es keinen (null — kein Boot-, Natur-
        // oder Nexus-Tier; der Akt eines Menschen ruft Leben weiter überall).
        return this._wildnisTraegt(x, z) ? { x, z } : null;
    }

    // [ATMOSPHERE] Geburt: 6 Kandidaten-Orte nach dem Geburts-Gesetz (fern, außerhalb des Blicks), je die affinity-beste
    // Soul; der Kandidat mit höchstem Affinity-Score gewinnt (bei Gleichstand der frühere Wurf). Stiller Spawn.
    _creatureNaturalBirth() {
        if (typeof this.spawnCreatureAt !== "function") return false;
        const pm = this.state.playerMesh;
        if (!pm) return false;
        const rng = this._faunaRng();
        // 6 Kandidaten-Orte + jeweilige Affinity-beste-Soul
        const candidates = [];
        for (let i = 0; i < 6; i++) {
            const ort = this._kreaturGeburtsOrt(rng);
            if (!ort) continue; // die Wildnis trägt den Ort nicht
            const field = typeof this.worldFieldAt === "function" ? this.worldFieldAt(ort.x, ort.z) : null;
            const soul = this._pickFaunaSoulAtPlayer(ort.x, ort.z, rng);
            // Resonanz-Score: Soul-Tags · Field, total
            let score = 0;
            if (field && soul) {
                const tags = this._creatureSoulTags(soul);
                for (const ax of ["lebendig", "dichte", "glut", "magieleitung"]) {
                    score += (field[ax] || 0) * (tags[ax] || 0);
                }
            }
            candidates.push({ x: ort.x, z: ort.z, soul, score });
        }
        // Welt entscheidet: höchster Resonanz-Score gewinnt; der Strom streut schon die Orte.
        if (!candidates.length) return false;
        let best = candidates[0];
        for (const c of candidates) if (c.score > best.score) best = c;
        const gY = this.getTerrainHeightAt(best.x, best.z);
        const y = (Number.isFinite(gY) ? gY : pm.position.y) + 1;
        // Spawn (silent damit kein Ping-Schwall)
        const prevSymphony = this.state.symphony && this.state.symphony.enabled;
        if (prevSymphony) this.state.symphony.enabled = false;
        const c = this.spawnCreatureAt(best.x, y, best.z, "happy", best.soul);
        if (prevSymphony) this.state.symphony.enabled = true;
        if (!c) return false;
        // Journal-Eintrag — Geburt ist Welt-Atem, leise Notiz mit Affinität
        if (typeof this.journalAppend === "function") {
            const name = (c.userData && c.userData.name) || "(Wesen)";
            this.journalAppend("growth", `${name} (${best.soul}) tritt in die Welt ein.`, {
                creature: name,
                soul: best.soul,
                affinityScore: best.score.toFixed(3),
                cause: "fauna_lifecycle",
            });
        }
        this.state.faunaLifecycle.lastBirthAt = Date.now();
        return true;
    }

    // [ATMOSPHERE] Fauna-Ziel-Population skaliert mit worldFieldAt(player).lebendig: üppiger Wald trägt
    // 12–14 Kreaturen, karger Fels 3–4.
    _currentFaunaTarget() {
        const baseTarget = this.constructor.FAUNA_TARGET_POPULATION; // 8
        const pm = this.state.playerMesh;
        if (!pm || typeof this.auraAt !== "function") return baseTarget;
        const f = this.auraAt(pm.position.x, pm.position.z);
        if (!f) return baseTarget;
        // V17.25 (§5: alle Achsen, via auraAt) — die VOLLE Feld-Lese statt nur
        // lebendig: lebendig HEBT (Leben trägt Leben, +0..10), glut DÄMPFT (eine
        // glühende Ödnis trägt weniger, −0..5). Geklemmt ≥ 2 (nie ganz leer).
        const lebendig = Math.max(0, Math.min(1, f.lebendig || 0));
        const glut = Math.max(0, Math.min(1, f.glut || 0));
        return Math.max(2, Math.round(4 + lebendig * 10 - glut * 5));
    }

    // [ATMOSPHERE] Fauna-Max-Population — symmetrisches Pattern zu Target.
    // Bei sehr lebendiger Region erlauben wir mehr Kreaturen (cap höher).
    _currentFaunaMax() {
        const baseMax = this.constructor.FAUNA_MAX_POPULATION; // 20
        const pm = this.state.playerMesh;
        if (!pm || typeof this.auraAt !== "function") return baseMax;
        const f = this.auraAt(pm.position.x, pm.position.z);
        if (!f) return baseMax;
        // V17.25 (§5: alle Achsen) — lebendig hebt (+0..16), glut dämpft (−0..8).
        const lebendig = Math.max(0, Math.min(1, f.lebendig || 0));
        const glut = Math.max(0, Math.min(1, f.glut || 0));
        return Math.max(4, Math.round(12 + lebendig * 16 - glut * 8)); // 4..28
    }

    // [ATMOSPHERE] Tick alle FAUNA_TICK_INTERVAL_MS: Target + Max aus Welt-Lebendigkeit
    // (_currentFaunaTarget / _currentFaunaMax); Geburt/Tod-Wahrscheinlichkeit durch Emotionen moduliert
    // (sorrow → Tod, peace bremst, hope → Geburten).
    tickFaunaLifecycle(currentTime) {
        const ms = currentTime * 1000;
        const last = this.state.faunaLifecycle.lastTick || 0;
        const interval = this.constructor.FAUNA_TICK_INTERVAL_MS;
        if (ms - last < interval) return;
        this.state.faunaLifecycle.lastTick = ms;
        const count = (this.state.creatures && this.state.creatures.length) || 0;
        const target = this._currentFaunaTarget();
        const max = this._currentFaunaMax();
        const birthCd = this.constructor.FAUNA_BIRTH_COOLDOWN_MS;
        const deathCd = this.constructor.FAUNA_DEATH_COOLDOWN_MS;
        const now = Date.now();
        // die Geburt folgt der EINEN Regel der Kreaturen (`_kreaturenBereit`, K60): unter dem Ladeschirm goss sie, sobald
        // Boot-Phase 3 wartete, die Gattung synchron (Radeon kalt 0,7 s vor dem ersten Bild)
        if (count < target && this._kreaturenBereit()) {
            const sinceBirth = now - (this.state.faunaLifecycle.lastBirthAt || 0);
            // Emotion-Modulation: hope beschleunigt Geburt, peace verlangsamt
            const baseBirth = this.constructor.FAUNA_BIRTH_PROBABILITY;
            const birthP = this._emotionModulate(baseBirth, { hope: 0.08, peace: -0.05 });
            if (sinceBirth >= birthCd && this._faunaRng()() < Math.max(0.02, Math.min(0.5, birthP))) {
                this._creatureNaturalBirth();
            }
        } else if (count > max) {
            const sinceDeath = now - (this.state.faunaLifecycle.lastDeathAt || 0);
            // sorrow erhöht Tod, peace dämpft
            const baseDeath = this.constructor.FAUNA_DEATH_PROBABILITY;
            const deathP = this._emotionModulate(baseDeath, { sorrow: 0.1, peace: -0.06 });
            if (sinceDeath >= deathCd && this._faunaRng()() < Math.max(0.02, Math.min(0.5, deathP))) {
                const oldest = this._findOldestCreature();
                if (oldest) this._creatureNaturalDeath(oldest);
            }
        }
        // Alter zählt: jenseits der Lebensspanne kehrt das älteste Wesen zur Erde zurück, auch bei
        // Population im Soll. Ein Kandidat pro Tick, teilt deathCd.
        {
            const sinceDeath = now - (this.state.faunaLifecycle.lastDeathAt || 0);
            if (count > 2 && sinceDeath >= deathCd) {
                const oldest = this._findOldestCreature();
                const bornAt = oldest && oldest.userData && oldest.userData.bornAt;
                if (bornAt && now - bornAt > AnazhRealm.FAUNA_MAX_AGE_MS) {
                    this._creatureNaturalDeath(oldest);
                    this.state.faunaLifecycle.lastDeathAt = now;
                }
            }
        }
        // Bond-Geburt: ein tief gebundenes Wesen an einem lebendigen Ort (`auraAt`) darf sich über das Soll
        // hinaus fortpflanzen; selbst-limitierend (kleine Chance, geteilter Cooldown, `max` bleibt die Wand).
        if (count >= target && count < max) {
            const sinceBirth = now - (this.state.faunaLifecycle.lastBirthAt || 0);
            if (sinceBirth >= birthCd * 2 && this._faunaRng()() < 0.12) {
                const creatures = this.state.creatures || [];
                for (const c of creatures) {
                    const bond = (c && c.userData && c.userData.bond) || 0;
                    if (bond < 0.6 || !c.position) continue;
                    const aura = typeof this.auraAt === "function" ? this.auraAt(c.position.x, c.position.z) : null;
                    if (!aura || (aura.lebendig || 0) < 0.55) continue;
                    this._creatureNaturalBirth();
                    this.state.faunaLifecycle.lastBirthAt = now;
                    break;
                }
            }
        }
    }
}
