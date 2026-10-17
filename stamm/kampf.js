class AnazhRealm_kampf {
    // ===== ATLAS · Kampf — Schwung · Sweep · Urteil · Bogen · Abbau =====
    // DER CHOKEPOINT DER GLIED-LESER (K59): wer die Welt-Matrizen eines Leibs liest (Biss, Treffer, Tod, das Backen des
    // Felds), zieht sie hier nach — mit der Methode seiner Klasse, an der Wurzel eines ruhenden Leibs vorbei (deren eigene
    // `updateMatrixWorld` hält nur den Szenen-Gang aus dem Skelett).
    _leibMatrix(c) {
        Object.getPrototypeOf(c).updateMatrixWorld.call(c, true);
    }

    // Der LMB-Klick LÖST nur den 3-Phasen-Schwung aus (Windup/Strike/Recover); getroffen wird im
    // Klingen-Sweep der Strike-Phase (_kampfSweepTick). Cooldown = Schwung-Dauer ∝ √I aus der EINEN
    // Quelle _swingDauerFuerBlueprint (kein attackSpeed-Tag-Pfad); Kreaturen behalten ihr Tag-Profil.
    // Stamina + Zorn-Affekt feuern beim Auslösen. `ziel` = der Pick des Fadenkreuzes ({creature, point}) oder ein Tier
    // (seine Leibes-Mitte): die Klinge geht durch ihn (_kampfZielMerken).
    _playerAttackCreature(ziel) {
        return this._beginPlayerSwing(ziel);
    }

    // ═══ KAMPF-GEFÜHL — DIE EINE SCHWUNG-DAUER-QUELLE ═══
    // Dauer = dauerProSqrtI · √I (I = Σ m·r² um den Griff, aus _swingDynamics), geklemmt [min, max].
    // gate:kampf-gefuehl hält das Verhältnis zweier Waffen auf √(I2/I1) ± 5 %.
    _swingDauerFuerBlueprint(bp) {
        // ARENA-GEFÜHL — die Schwung-KONSTANTEN wohnen im schmiede-Gesetzbuch
        // (ARENA.schwung, N6.6-Revision: EIN Regler für Arena UND Welt); die
        // FORMEL bleibt Wirts-Gesetz (Ω-Φ4: dauer = dauerProSqrtI·√I, geklemmt).
        const S = AnazhRealm._arenaGesetz().schwung;
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return S.handDauerSec;
        // Studio-Klingen schwingen ihre GEMESSENE Trägheit (kampfMasze, kg·m² → dauerProSqrtIKg);
        // User-Eigenwerke behalten Ω-Φ4 (deren einzige Quelle — anderer Definitionsbereich, kein Zwilling).
        const km = this._schmiedeKampfMasze(bp);
        if (km && km.traegheit > 1e-9 && Number.isFinite(S.dauerProSqrtIKg)) {
            return Math.min(S.maxDauerSec, Math.max(S.minDauerSec, S.dauerProSqrtIKg * Math.sqrt(km.traegheit)));
        }
        const I = this._swingDynamics(bp).swingInertia;
        if (!(I > 1e-9)) return S.handDauerSec;
        return Math.min(S.maxDauerSec, Math.max(S.minDauerSec, S.dauerProSqrtI * Math.sqrt(I)));
    }
    // die Dauer des GEHALTENEN Geräts (Faust → handDauerSec).
    _playerSwingDauer() {
        return this._swingDauerFuerBlueprint(this._heldImplementBlueprint());
    }

    // Der Schwung-Beginn: läuft schon einer, prallt der Klick ab (der Schwung IST der
    // Cooldown — eine schwere Keule schlägt seltener, weil ihr √I die Dauer streckt). Der Schwung trägt seinen RAHMEN (der
    // Körper und das Gerät, die schwingen — _kampfSchwungRahmen) und sein ZIEL (der Punkt unter dem Fadenkreuz, _kampfZielMerken).
    _beginPlayerSwing(ziel) {
        const p = this.state.player;
        if (!p) return false;
        if (p._swing && p._swing.t < p._swing.dauer) return false; // noch im Schwung
        // WERKZEUG-WAND (Welle L, K-D6): ein verbrauchtes Gerät schlägt nicht — dieselbe Wand wie Schuss und Abbau.
        if (this._geraetVerbraucht(this._heldImplementBlueprint(), "Hieb")) return false;
        const now = performance.now() / 1000;
        p.lastAttackAt = now; // Alt-Leser bleiben versorgt (reine Chronik, kein Gate mehr)
        this._consumeMouseStamina();
        // der Affekt beim AUSLÖSEN: Zorn/Kampf-Intensität ∝ der Substanz des GEHALTENEN
        // Geräts (V17.57 W2-B: das eine „in der Hand"-Ding — Werkzeug + Waffe verschmolzen).
        const weaponName = p.equipped && p.equipped.held;
        this._feelAction("attack", weaponName ? { blueprint: weaponName } : undefined);
        // SPIEGEL-ZENSUS — die Phasen-Anteile wohnen im schmiede-Gesetzbuch (ARENA.schwung, fail-closed —
        // Kern-Pflicht). Die Ausholzeit ist der Anteil der EINEN Dauer ∝ √I (der Phantom-Faktor fiel, Welle L).
        const K = AnazhRealm._arenaGesetz().schwung;
        const dauer = this._playerSwingDauer();
        const rahmen = this._kampfSchwungRahmen({});
        p._swing = {
            t: 0,
            dauer,
            windupSec: dauer * K.windupFrac,
            strikeSec: dauer * K.strikeFrac,
            weapon: weaponName || null,
            hits: new Set(), // Dedup je Schwung: EINE Klinge trifft EIN Wesen EINMAL
            rahmen,
            reach: rahmen.reach,
            ziel: this._kampfZielMerken(ziel),
            lastT: now,
        };
        return true;
    }

    // Der Schwung-Tick (im ewigen Loop, NACH der fixen Sim): läuft auf der ANZEIGE-
    // Uhr — der Hit-Stop pausiert Gang + Schwung, die FIXE SIM läuft IMMER weiter.
    // In der Strike-Phase fegt der Kapsel-Sweep entlang der Klinge.
    _tickKampfSchwung(currentTime) {
        const p = this.state.player;
        const sw = p && p._swing;
        if (!sw) return;
        const rawDt = Math.min(
            AnazhRealm.TAKT_DECKEL_S,
            Math.max(0, currentTime - (Number.isFinite(sw.lastT) ? sw.lastT : currentTime))
        );
        sw.lastT = currentTime;
        const tVor = sw.t;
        sw.t += rawDt * this._hitStopFactor(currentTime);
        // der Sweep fegt das Stück des Strikes, das dieser Takt durchlief (stetig, _kampfSweepTick) — auch das letzte vor
        // dem Ende des Schwungs
        const s0 = Math.max(tVor, sw.windupSec);
        const s1 = Math.min(sw.t, sw.windupSec + sw.strikeSec);
        if (s1 > s0) this._kampfSweepTick(sw, currentTime, s0, s1);
        if (sw.t >= sw.dauer) p._swing = null; // Recover vollendet — der nächste Klick darf schwingen
    }

    // 0 = die Anzeige-Uhr steht (Hit-Stop aktiv), 1 = sie läuft. NUR animatePlayerSoul
    // (Gang-Phase) + _tickKampfSchwung (Schwung-Phase) lesen den Faktor — NIE die Sim.
    _hitStopFactor(nowSec) {
        const p = this.state.player;
        return p && Number.isFinite(p._hitStopUntil) && nowSec < p._hitStopUntil ? 0 : 1;
    }

    // DIE REICHWEITE DER KLINGE ab dem Schultergelenk: der gestreckte Arm bis zur Hand-Mitte und das Gerät vor der Hand —
    // aus EINER Messung des Körpers und des Geräts (_kampfSchwungRahmen). Die leere Faust reicht so weit wie der Arm.
    _kampfBladeReach() {
        return this._kampfSchwungRahmen(this._reachRahmen || (this._reachRahmen = {})).reach;
    }

    // DER SCHWUNG-RAHMEN (Welle LF 09.10., Posten 2): der Körper, der schwingt, gemessen am Leib des Spielers — das rechte
    // Schultergelenk und der Dreh-Punkt des Rumpfs (das Torso-Gelenk) im Leib-Raum (rechts · oben · vorn ab
    // playerMesh.position, die Gier herausgerechnet), der gestreckte Arm bis zur Hand-Mitte (Oberarm + Unterarm + Hand: die
    // Knochen der Gestalt) — und das Gerät: seine Länge und wo die Hand es hält (kampfMasze des Kerns: laengeM, S.pivot; ein
    // Eigenwerk seine Hüll-Länge, am Ende gehalten; die Faust nichts). Ein Leib ohne Arm-Gelenke (eine Tier-Seele) schwingt
    // um die Fühl-Konstanten des Gesetzbuchs (ARENA.schwung.shoulderH über dem Leib, reachBaseM als Arm). Vorher schwang jeder
    // Leib um einen Punkt 0,32 m über und 0,20 m neben der rechten Schulter mit einem Arm von 0,9 m (der Mensch misst 0,66 m):
    // die sichtbare Klinge lag nie auf dem Treffer-Volumen.
    _kampfSchwungRahmen(out) {
        const K = AnazhRealm._arenaGesetz().schwung;
        const pm = this.state.playerMesh;
        const o = out || {};
        const bp = this._heldImplementBlueprint();
        const km = bp ? this._schmiedeKampfMasze(bp) : null;
        let laenge = 0,
            griffX = 0;
        if (km && km.laengeM > 0) {
            laenge = km.laengeM;
            const S = km.mess && km.mess.S;
            griffX = S && Number.isFinite(S.pivot) ? Math.max(0, Math.min(laenge, S.pivot)) : 0;
        } else if (bp) {
            const bb = this._compoundBBox(bp);
            if (bb) laenge = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z);
        }
        o.laenge = laenge;
        o.griffX = griffX;
        const rig = pm && pm.userData && pm.userData.rig;
        const a = rig && rig.armR;
        if (pm && a && a.shoulder && a.elbow && a.wrist && rig.spine) {
            pm.updateMatrixWorld(true);
            const v =
                this._rahmenV ||
                (this._rahmenV = [
                    new THREE.Vector3(),
                    new THREE.Vector3(),
                    new THREE.Vector3(),
                    new THREE.Vector3(),
                    new THREE.Vector3(),
                ]);
            const S = a.shoulder.getWorldPosition(v[0]);
            const E = a.elbow.getWorldPosition(v[1]);
            const W = a.wrist.getWorldPosition(v[2]);
            const G = this._kampfHandMitte(rig, v[3]);
            const H = rig.spine.getWorldPosition(v[4]);
            o.arm = S.distanceTo(E) + E.distanceTo(W) + W.distanceTo(G);
            this._leibLokal(pm, S, o, "s");
            this._leibLokal(pm, H, o, "h");
            o.rig = true;
        } else {
            o.arm = K.reachBaseM;
            o.sr = o.sf = o.hr = o.hf = 0;
            o.su = o.hu = K.shoulderH;
            o.rig = false;
        }
        o.reach = Math.min(K.reachMaxM, o.arm + Math.max(0, laenge - griffX));
        return o;
    }

    // Die Hand-Mitte der rechten Hand in Welt (dort sitzt der Griff der Faust, Ofen-Beipack rig.handMitte), sonst das Handgelenk.
    _kampfHandMitte(rig, out) {
        const w = rig.armR.wrist;
        const hm = rig.handMitte && rig.handMitte[w.name];
        return hm ? w.localToWorld(out.set(hm[0], hm[1], hm[2])) : w.getWorldPosition(out);
    }

    // Ein Welt-Punkt im Leib-Raum des Spielers (rechts r = (−cos, 0, sin) · oben · vorn f = (sin, 0, cos) der Gier ab
    // playerMesh.position), als o[prefix + "r" | "u" | "f"].
    _leibLokal(pm, P, o, prefix) {
        const y = pm.rotation.y;
        const dx = P.x - pm.position.x,
            dz = P.z - pm.position.z;
        o[prefix + "r"] = -Math.cos(y) * dx + Math.sin(y) * dz;
        o[prefix + "u"] = P.y - pm.position.y;
        o[prefix + "f"] = Math.sin(y) * dx + Math.cos(y) * dz;
    }

    // DIE SCHULTER IN DER WELT bei Rumpf-Beuge λ (oben → vorn, um den Rumpf-Punkt), Rumpf-Drehung τ (um die Senkrechte, im
    // Sinn der Gier) und Ausfall `aus` (der Leib tritt so weit nach vorn): der Rahmen R im Leib-Raum, die Gier des Leibs
    // `yaw`. Dieselben Winkel dreht die Pose am Torso-Gelenk, denselben Ausfall trägt die Hülle des Leibs.
    _kampfSchulter(R, yaw, lam, tau, aus, out) {
        const pm = this.state.playerMesh;
        const cy = Math.cos(yaw),
            sy = Math.sin(yaw);
        let vr = R.sr - R.hr,
            vu = R.su - R.hu,
            vf = R.sf - R.hf;
        const cl = Math.cos(lam),
            sl = Math.sin(lam);
        const vu1 = vu * cl - vf * sl;
        vf = vf * cl + vu * sl;
        vu = vu1;
        const ct = Math.cos(tau),
            st = Math.sin(tau);
        const vr1 = vr * ct - vf * st;
        vf = vr * st + vf * ct;
        vr = vr1;
        const r = R.hr + vr,
            f = R.hf + vf + aus;
        out.x = pm.position.x - cy * r + sy * f;
        out.y = pm.position.y + R.hu + vu;
        out.z = pm.position.z + sy * r + cy * f;
        return out;
    }

    // DIE BEUGE DES RUMPFS beim Schlag nach unten (Welle LF, Posten 2): wer tiefer zielt als seine Schulter, beugt sich —
    // KAMPF_BEUGE_K je rad Neigung, höchstens KAMPF_BEUGE_MAX. Pose und Treffer-Volumen beugen gleich (_kampfSchulter).
    _kampfBeuge(pitch) {
        return Math.min(AnazhRealm.KAMPF_BEUGE_MAX, Math.max(0, -pitch) * AnazhRealm.KAMPF_BEUGE_K);
    }

    // DAS ZIEL DES HIEBS (Welle LF, Posten 2): der Punkt unter dem Fadenkreuz beim Drücken, im Raum des Tiers gemerkt (das
    // Tier läuft weiter, der Punkt mit ihm); ein Tier ohne Punkt: seine Leibes-Mitte; ohne Tier null — dann geht die Klinge
    // durch den Austritt des Fadenkreuz-Strahls aus ihrer Reichweite (_kampfKlingenAchse).
    _kampfZielMerken(ziel) {
        const c =
            ziel && ziel.isObject3D ? ziel : ziel && ziel.creature && ziel.creature.isObject3D ? ziel.creature : null;
        if (!c) return null;
        this._leibMatrix(c);
        const pt =
            ziel.point && Number.isFinite(ziel.point.x)
                ? new THREE.Vector3(ziel.point.x, ziel.point.y, ziel.point.z)
                : new THREE.Box3().setFromObject(c).getCenter(new THREE.Vector3());
        return { c, lokal: c.worldToLocal(pt) };
    }

    // DIE ACHSE DES SCHWUNGS (Welle L K-D3, Welle LF Posten 2): Gier und Neigung, in denen die Klinge zur Mitte des Strikes
    // liegt, und die Beuge λ dazu — von der (gebeugten) Schulter durch das Ziel des Hiebs (sw.ziel) oder, ohne Ziel, durch den
    // Punkt, an dem der Strahl des Fadenkreuzes (`_fadenkreuzStrahl`) die Kugel der Reichweite um die Schulter verlässt. Die
    // Klinge trifft, worauf das Fadenkreuz zeigt. Ohne Kamera der Blick selbst. Einmal je Takt.
    _kampfKlingenAchse(sw, out) {
        const R = sw.rahmen;
        const yaw0 = this.state.playerMesh.rotation.y;
        let aus = AnazhRealm.KAMPF_AUSFALL_M;
        const S = this._kampfSchulter(R, yaw0, 0, 0, aus, this._achseS || (this._achseS = {}));
        const P = this._achseP || (this._achseP = new THREE.Vector3());
        const zielPunkt = () => {
            const z = sw.ziel;
            if (z && z.c) {
                this._leibMatrix(z.c);
                return z.c.localToWorld(P.copy(z.lokal));
            }
            const F = this._fadenkreuzStrahl();
            if (!F) return null;
            const d = F.d;
            const wx = F.o.x - S.x,
                wy = F.o.y - S.y,
                wz = F.o.z - S.z;
            const b = d.x * wx + d.y * wy + d.z * wz;
            const disc = b * b - (wx * wx + wy * wy + wz * wz - sw.reach * sw.reach);
            const sAus = disc >= 0 ? -b + Math.sqrt(disc) : 0;
            return sAus > 0
                ? P.set(F.o.x + d.x * sAus, F.o.y + d.y * sAus, F.o.z + d.z * sAus)
                : P.set(S.x + d.x, S.y + d.y, S.z + d.z);
        };
        if (!zielPunkt()) {
            out.yaw = Number.isFinite(this.state.yaw) ? this.state.yaw : 0;
            out.pitch = Number.isFinite(this.state.pitch) ? this.state.pitch : 0;
            out.lam = this._kampfBeuge(out.pitch);
            out.aus = aus;
            return out;
        }
        // DER AUSFALL nach Maß: ein Ziel tritt der Schwertkämpfer nur so weit an, dass sein Schlagpunkt (_kampfSchlagpunkt) es
        // erreicht — höchstens KAMPF_AUSFALL_M, nie zurück; ins Leere tritt er voll aus. Dann die Beuge aus der Neigung zur
        // ungebeugten Schulter und die Achse ab der gebeugten.
        if (sw.ziel && sw.ziel.c) {
            this._kampfSchulter(R, yaw0, 0, 0, 0, S);
            const dist = Math.hypot(P.x - S.x, P.y - S.y, P.z - S.z);
            aus = Math.max(0, Math.min(AnazhRealm.KAMPF_AUSFALL_M, dist - this._kampfSchlagpunkt(R)));
            this._kampfSchulter(R, yaw0, 0, 0, aus, S);
        }
        out.aus = aus;
        out.lam = this._kampfBeuge(Math.atan2(P.y - S.y, Math.hypot(P.x - S.x, P.z - S.z)));
        this._kampfSchulter(R, yaw0, out.lam, 0, aus, S);
        zielPunkt();
        out.yaw = Math.atan2(P.x - S.x, P.z - S.z);
        out.pitch = Math.atan2(P.y - S.y, Math.hypot(P.x - S.x, P.z - S.z));
        return out;
    }

    // DER EINE SCHWUNG (Welle LF 09.10., Posten 2 — K-D10/K-L4): die Lage der Klinge zur Schwung-Zeit t; die Achse (Gier,
    // Neigung, Beuge — _kampfKlingenAchse, je Takt) reicht der Aufrufer herein. Der Strike fegt die Gier achse.yaw − arcHalf
    // … + arcHalf (die Vorhand der rechten Hand: von rechts nach links) in der Neigung der Achse; der Windup führt die Klinge
    // aus der Ruhe an den Anfang des Bogens und hebt sie dabei um KAMPF_AUSHOLEN_RAD (am Strike-Beginn wieder 0 — kein
    // Sprung), der Recover löst sie vom Ende zurück; w ist das Gewicht, mit dem Rumpf und Arm folgen. Der Rumpf beugt (λ·w)
    // und dreht der Gier des Bogens nach (KAMPF_RUMPF_DREH · Abweichung · w), die Schulter S folgt (_kampfSchulter), der
    // gestreckte Arm legt die Hand-Mitte auf S + d·arm, die Klinge liegt vor ihr längs d — vom Knauf B (Hebel hb = arm −
    // griffX) bis zur Spitze T (ht = arm + laenge − griffX). Sweep (das Treffer-Volumen B→T), Treffer-Weg, Pose
    // (_applyKampfSchwungPose) und damit die Ich-Sicht lesen DIESE Lage. Vorher drehte die Pose die Schulter um x (die
    // Klinge über dem Kopf im Treffer-Takt, Bild ks02), getroffen wurde ein waagrechter Bogen um einen Punkt über dem
    // Kopf — die Ich-Sicht zeigte nichts.
    _kampfSchwungLage(sw, t, achse, out) {
        const K = AnazhRealm._arenaGesetz().schwung;
        const R = sw.rahmen;
        const ease = (u) => u * u * (3 - 2 * u);
        const tW = Math.max(1e-6, sw.windupSec);
        const tS = Math.max(1e-6, sw.strikeSec);
        let s, w, heb;
        if (t < tW) {
            const u = Math.max(0, t / tW);
            s = 0;
            w = ease(u);
            heb = AnazhRealm.KAMPF_AUSHOLEN_RAD * Math.sin(Math.PI * u);
        } else if (t < tW + tS) {
            s = (t - tW) / tS;
            w = 1;
            heb = 0;
        } else {
            s = 1;
            w = 1 - ease(Math.min(1, (t - tW - tS) / Math.max(1e-6, sw.dauer - tW - tS)));
            heb = 0;
        }
        const yawLeib = this.state.playerMesh.rotation.y;
        out.s = s;
        out.w = w;
        // DIE SCHNITT-EBENE geht durch die Achse: f = die Achse, u = ihr Oben (senkrecht zu f in der Lot-Ebene), l = u × f
        // (links); die Klinge dreht in der Ebene (f, l) um φ = arcHalf·(2s − 1) — ein Großkreis, das Tempo der Spitze ω·r für
        // jede Neigung (ein reiner Gier-Bogen fegte bei steiler Neigung einen kleinen Kreis: ein Hieb nach unten lief bei
        // 1,3 m mit 11 m/s, waagrecht mit 16). Der Windup hebt sie um heb zum Oben der Ebene.
        const f = this._blickVorn(achse.yaw, achse.pitch, out.f || (out.f = {}));
        const cp = Math.cos(achse.pitch),
            sp = Math.sin(achse.pitch);
        const ux = -Math.sin(achse.yaw) * sp,
            uy = cp,
            uz = -Math.cos(achse.yaw) * sp;
        const lx = uy * f.z - uz * f.y,
            ly = uz * f.x - ux * f.z,
            lz = ux * f.y - uy * f.x;
        const phi = K.arcHalfRad * (2 * s - 1);
        const cf = Math.cos(phi) * Math.cos(heb),
            sf = Math.sin(phi) * Math.cos(heb),
            sh = Math.sin(heb);
        const d = out.d || (out.d = {});
        d.x = f.x * cf + lx * sf + ux * sh;
        d.y = f.y * cf + ly * sf + uy * sh;
        d.z = f.z * cf + lz * sf + uz * sh;
        out.yaw = Math.atan2(d.x, d.z);
        out.pitch = Math.asin(Math.max(-1, Math.min(1, d.y)));
        let dg = out.yaw - yawLeib;
        dg -= 2 * Math.PI * Math.round(dg / (2 * Math.PI));
        out.lam = achse.lam * w;
        out.tau = AnazhRealm.KAMPF_RUMPF_DREH * dg * w;
        out.aus = achse.aus * w;
        const S = this._kampfSchulter(R, yawLeib, out.lam, out.tau, out.aus, out.S || (out.S = {}));
        out.hb = R.arm - R.griffX;
        out.ht = R.arm + R.laenge - R.griffX;
        const B = out.B || (out.B = {});
        const T = out.T || (out.T = {});
        B.x = S.x + d.x * out.hb;
        B.y = S.y + d.y * out.hb;
        B.z = S.z + d.z * out.hb;
        T.x = S.x + d.x * out.ht;
        T.y = S.y + d.y * out.ht;
        T.z = S.z + d.z * out.ht;
        return out;
    }

    // ═══ KAMPF-GEFÜHL — DER KLINGEN-SWEEP (nur Strike-Phase) ═══
    // Das Treffer-Volumen ist die Klinge selbst: die Strecke Knauf → Spitze des EINEN Schwungs (_kampfSchwungLage) mit dem
    // Radius der Klinge (ARENA.schwung.bladeRadiusM), getroffen wird die GESTALT des Tiers (_kreaturGliedTreffer:
    // Glieder-Kapseln, Zone je Glied), das Urteil fällt der Kern (schmiede trefferUrteil, das Tempo des Schlagpunkts, der Ort
    // auf dem Treffer-Weg). STETIG (Welle LF 09.10., Posten 2): der Takt fegt das Stück [tVon, tBis] des Strikes in
    // Teil-Schritten, in denen die Spitze höchstens KAMPF_SWEEP_SCHRITT_M weit läuft; trifft ein Teil-Schritt, steht die
    // Schwung-Uhr auf IHM (sw.t) — der Hit-Stop hält die Klinge, wo sie trifft, und die Pose zeigt sie dort. Vorher fegte je
    // Takt eine 0,35 m dicke Kapsel um einen Punkt über dem Kopf, die Spitze des Großschwerts sprang 0,45 m: der Treffer fiel
    // bis 0,35 m vor der sichtbaren Klinge, im Treffer-Takt stand sie 30° neben dem Hirsch. Invarianten HIER: nie ein Ziel
    // hinter dem Rücken (dot ≤ 0), Dedup je Schwung (hits-Set); die Liste läuft rückwärts — ein Treffer, der tötet, nimmt
    // den Leib aus den Wesen (_kreaturAusListe), ohne das nächste Tier zu überspringen.
    _kampfSweepTick(sw, nowSec, tVon, tBis) {
        const pm = this.state.playerMesh;
        const creatures = this.state.creatures;
        if (!pm || !sw.rahmen || !Array.isArray(creatures) || !creatures.length) return;
        const K = AnazhRealm._arenaGesetz().schwung;
        // das Winkel-Tempo der Strike-Phase (der Bogen 2·arcHalf in strikeSec): die Klinge am Hebel r läuft ω·r
        const omega = (2 * K.arcHalfRad) / Math.max(0.05, sw.strikeSec);
        const t0 = Number.isFinite(tVon) ? tVon : sw.t;
        const t1 = Number.isFinite(tBis) ? tBis : sw.t;
        const n = Math.max(1, Math.ceil((omega * sw.reach * Math.max(0, t1 - t0)) / AnazhRealm.KAMPF_SWEEP_SCHRITT_M));
        const achse = this._kampfKlingenAchse(sw, this._sweepAchse || (this._sweepAchse = {}));
        // die Wand („nie hinter dem Rücken") misst waagrecht entlang der Achse — aus der EINEN Vorwärts-Formel (_blickVorn)
        const vorn = this._blickVorn(achse.yaw, 0, this._sweepVorn || (this._sweepVorn = {}));
        const lage = this._sweepLage || (this._sweepLage = {});
        for (let k = 1; k <= n; k++) {
            const t = t0 + ((t1 - t0) * k) / n;
            this._kampfSchwungLage(sw, t, achse, lage);
            const S = lage.S,
                B = lage.B,
                T = lage.T;
            let getroffen = false;
            for (let i = creatures.length - 1; i >= 0; i--) {
                const c = creatures[i];
                if (!c || !c.userData || sw.hits.has(c)) continue;
                const tx = c.position.x - S.x;
                const tz = c.position.z - S.z;
                if (tx * vorn.x + tz * vorn.z <= 0) continue; // NIE hinter dem Rücken (die Wand)
                if (!this._trefferErreichbar(c, S.x, S.z, lage.ht + K.bladeRadiusM)) continue; // das Grob-Tor (der Leib)
                const tr = this._kampfKlingenKontakt(sw, c, lage, B, T);
                if (!tr) continue;
                sw.hits.add(c);
                getroffen = true;
                // DER TREFFER-WEG (Welle LF, Leben-Schau 07.10. Posten 1): die Energie folgt dem Schwung über den Weg, den
                // die Klinge durch den Leib nimmt (_kampfTrefferWeg), nie der ersten Kontaktstelle — die lag bei nahem Ziel
                // am Griff-Drittel (Großschwert 1,6 m: 15–18 J, in 1,7 m 91 J). Das Tempo ist das des Schlagpunkts der Waffe
                // (_kampfSchlagpunkt), der Kern richtet den Ort auf dem Weg (trefferUrteil t.weg, m ab dem Knauf).
                const hb = lage.hb;
                const weg = this._kampfTrefferWeg(c, sw, achse, t, hb + tr.s * (lage.ht - hb));
                const rS = this._kampfSchlagpunkt(sw.rahmen);
                const hebel = Math.max(weg.lo, Math.min(weg.hi, rS));
                const urteil = this._kampfUrteil(this._kampfSchlagTempo(sw, achse, t, rS), 0, tr.zone, [
                    weg.lo - hb,
                    weg.hi - hb,
                ]);
                const bp = this._heldImplementBlueprint();
                const roh = this._kampfRohSchaden(urteil, tr.zone, this._kampfKraft());
                this._kampfVerschleiss(bp);
                const res = this.damageCreature(c, roh, {
                    source: "player",
                    fromPos: { x: pm.position.x, y: pm.position.y, z: pm.position.z },
                    stoss: urteil
                        ? { p: urteil.p, m: urteil.mEff }
                        : this._kampfStossOhneMessung(this._kampfSchlagTempo(sw, achse, t, hebel)),
                });
                if (res && res.ok) this._kampfHitJuice(c, nowSec, urteil, urteil ? null : this._eigenwerkSchwungKE(bp));
            }
            if (getroffen) {
                // die Schwung-Uhr steht auf dem Teil-Schritt des Treffers: der Hit-Stop hält die Klinge am Ziel
                sw.t = t;
                return;
            }
        }
    }

    // DER KONTAKT DER KLINGE mit einem Tier im Teil-Schritt (B → T, die Lage des Schwungs): das ZIEL DES HIEBS (sw.ziel — der
    // Punkt, auf dem das Fadenkreuz beim Drücken lag) trifft die Klinge, wo sie durch diesen Punkt geht — die Zone ist das Glied
    // unter dem Fadenkreuz, s der Ort auf der Klinge; vorher streift sie es nicht (sie ist auf dem Weg zum Ziel), nach der Mitte
    // des Strikes zählt der erste Kontakt (das Tier lief aus dem Punkt). Jedes andere Tier trifft der erste Kontakt der
    // Gestalt (_kreaturGliedTreffer). Vorher (die dicke Kapsel um einen Punkt über dem Kopf) traf der waagrechte Bogen meist
    // das Glied in Höhe des Fadenkreuzes — mit der Klinge der Gestalt streifte er auf dem Weg zum Kopf den Bauch.
    _kampfKlingenKontakt(sw, c, lage, B, T) {
        const K = AnazhRealm._arenaGesetz().schwung;
        const z = sw.ziel;
        if (!z || z.c !== c) return this._kreaturGliedTreffer(c, B.x, B.y, B.z, T.x, T.y, T.z, K.bladeRadiusM);
        this._leibMatrix(c);
        const P = c.localToWorld((this._kontaktP || (this._kontaktP = new THREE.Vector3())).copy(z.lokal));
        const ex = T.x - B.x,
            ey = T.y - B.y,
            ez = T.z - B.z;
        const l2 = ex * ex + ey * ey + ez * ez;
        const u =
            l2 > 1e-12 ? Math.max(0, Math.min(1, ((P.x - B.x) * ex + (P.y - B.y) * ey + (P.z - B.z) * ez) / l2)) : 0;
        const ab = Math.hypot(B.x + ex * u - P.x, B.y + ey * u - P.y, B.z + ez * u - P.z);
        if (ab <= K.bladeRadiusM + AnazhRealm.KAMPF_ZIEL_SPIEL_M) {
            const tr = this._kreaturGliedTreffer(c, P.x, P.y, P.z, P.x, P.y, P.z, K.bladeRadiusM, true);
            if (tr) return { zone: tr.zone, s: u };
        }
        return lage.s > 0.5 ? this._kreaturGliedTreffer(c, B.x, B.y, B.z, T.x, T.y, T.z, K.bladeRadiusM) : null;
    }

    // DER TREFFER-WEG (Welle LF 09.10., Posten 1): wo die Klinge auf ihrem restlichen Bogen durch den Leib geht — das
    // Intervall des Hebels [lo, hi] (m ab der Schulter), auf dem die Klinge (Knauf → Spitze, _kampfSchwungLage) vom Treffer
    // bis zum Ende des Strikes einer Glied-Kapsel des Tiers näher kommt als Glied- + Klingen-Radius. Die Glieder als Punkte
    // (je Glied TREFFER_WEG_PROBEN + 1, im Augenblick des Treffers), der Bogen in den Teil-Schritten des Sweeps. Saat ist der
    // Kontakt selbst (kein Treffer ohne Weg). Vorher zählte nur der Strecken-Parameter des ersten Kontakts — bei einem Leib
    // längs der Klinge entartet er an ihr nahes Ende: Großschwert in 1,6 m 15–18 J (Griff-Drittel), in 1,7 m 91 J.
    _kampfTrefferWeg(cr, sw, achse, tVon, kontakt) {
        const K = AnazhRealm._arenaGesetz().schwung;
        const out = this._trefferWegOut || (this._trefferWegOut = { lo: 0, hi: 0 });
        out.lo = out.hi = kontakt;
        const gl = this._kreaturTrefferGlieder(cr);
        if (!gl) return out;
        this._leibMatrix(cr);
        const v = this._trefferVek || (this._trefferVek = [new THREE.Vector3(), new THREE.Vector3()]);
        const pts = this._trefferWegPts || (this._trefferWegPts = []);
        const n = AnazhRealm.TREFFER_WEG_PROBEN;
        let np = 0;
        for (const g of gl) {
            const pa = v[0].copy(g.a).applyMatrix4(g.anker.matrixWorld);
            const pb = v[1].copy(g.b).applyMatrix4(g.anker.matrixWorld);
            const rg = K.bladeRadiusM + g.r * g.anker.matrixWorld.getMaxScaleOnAxis();
            for (let k = 0; k <= n; k++) {
                const q = pts[np] || (pts[np] = { x: 0, y: 0, z: 0, r: 0 });
                const u = k / n;
                q.x = pa.x + (pb.x - pa.x) * u;
                q.y = pa.y + (pb.y - pa.y) * u;
                q.z = pa.z + (pb.z - pa.z) * u;
                q.r = rg;
                np++;
            }
        }
        const omega = (2 * K.arcHalfRad) / Math.max(0.05, sw.strikeSec);
        const tEnde = sw.windupSec + sw.strikeSec;
        const m = Math.max(
            1,
            Math.ceil((omega * sw.reach * Math.max(0, tEnde - tVon)) / AnazhRealm.KAMPF_SWEEP_SCHRITT_M)
        );
        const L = this._wegLage || (this._wegLage = {});
        for (let k = 0; k <= m; k++) {
            this._kampfSchwungLage(sw, tVon + ((tEnde - tVon) * k) / m, achse, L);
            const d = L.d,
                B = L.B,
                len = L.ht - L.hb;
            for (let i = 0; i < np; i++) {
                const q = pts[i];
                const wx = q.x - B.x,
                    wy = q.y - B.y,
                    wz = q.z - B.z;
                const u = Math.max(0, Math.min(len, wx * d.x + wy * d.y + wz * d.z));
                const ex = wx - d.x * u,
                    ey = wy - d.y * u,
                    ez = wz - d.z * u;
                const e2 = ex * ex + ey * ey + ez * ez;
                if (e2 > q.r * q.r) continue;
                const halb = Math.sqrt(q.r * q.r - e2);
                out.lo = Math.min(out.lo, L.hb + Math.max(0, u - halb));
                out.hi = Math.max(out.hi, L.hb + Math.min(len, u + halb));
            }
        }
        return out;
    }

    // DAS TEMPO EINES PUNKTS DER KLINGE (Hebel r ab der Schulter) zur Schwung-Zeit t: die Bahn des Punkts selbst — Bogen,
    // Rumpf-Drehung, Beuge und Ausfall zusammen (zwei Lagen im Abstand KAMPF_TEMPO_DT), quer zur Klinge (das vLat des
    // Urteils). Vorher ω·r um einen festen Punkt: die Drehung der Hüfte, die die Klinge mitnimmt, fehlte.
    _kampfSchlagTempo(sw, achse, t, r) {
        const dt = AnazhRealm.KAMPF_TEMPO_DT;
        const L1 = this._kampfSchwungLage(sw, t, achse, this._tempoL1 || (this._tempoL1 = {}));
        const L0 = this._kampfSchwungLage(sw, Math.max(0, t - dt), achse, this._tempoL0 || (this._tempoL0 = {}));
        const d = L1.d;
        let vx = (L1.S.x + d.x * r - (L0.S.x + L0.d.x * r)) / dt,
            vy = (L1.S.y + d.y * r - (L0.S.y + L0.d.y * r)) / dt,
            vz = (L1.S.z + d.z * r - (L0.S.z + L0.d.z * r)) / dt;
        const va = vx * d.x + vy * d.y + vz * d.z;
        vx -= d.x * va;
        vy -= d.y * va;
        vz -= d.z * va;
        return Math.hypot(vx, vy, vz);
    }

    // DER SCHLAGPUNKT der gehaltenen Waffe als Hebel ab der Schulter: der Knauf liegt bei arm − griffX (_kampfSchwungRahmen),
    // der Schlagpunkt des Kerns (S.impactX ab dem Knauf — dort misst kampfMasze die wirksame Masse) davor; ungemessene Geräte
    // (Eigenwerk) schlagen bei 70 % ihrer Länge vor der Hand, die Faust mit der Hand.
    _kampfSchlagpunkt(R) {
        const bp = this._heldImplementBlueprint();
        const km = bp ? this._schmiedeKampfMasze(bp) : null;
        const S = km && km.mess && km.mess.S;
        if (S && Number.isFinite(S.impactX)) return R.arm - R.griffX + Math.max(0, Math.min(R.laenge, S.impactX));
        return R.arm + 0.7 * Math.max(0, R.laenge - R.griffX);
    }

    // DER ABSTAND EINES ZIELS von der Schulter, die nach ihm schlägt (gebeugt wie im Schwung, _kampfBeuge) — das Verb-Tor des
    // Klicks misst so gegen die Reichweite der Klinge (Posten 3: EINE Reichweite).
    _kampfZielAbstand(R, P) {
        const yaw = this.state.playerMesh.rotation.y;
        const aus = AnazhRealm.KAMPF_AUSFALL_M;
        const S = this._kampfSchulter(R, yaw, 0, 0, aus, this._abstandS || (this._abstandS = {}));
        const lam = this._kampfBeuge(Math.atan2(P.y - S.y, Math.hypot(P.x - S.x, P.z - S.z)));
        this._kampfSchulter(R, yaw, lam, 0, aus, S);
        return Math.hypot(P.x - S.x, P.y - S.y, P.z - S.z);
    }

    // DER UNGEMESSENE SCHLAG (das EINE Impuls-Gesetz): Faust und Eigenwerke ohne Schmiede-Rezept tragen keine Messung —
    // ihr Impuls ist der emergente Rückschlag des Gehaltenen (`knockback` ∝ dichte + härte, je Punkt `gefuehl.pProKb`),
    // ihre wirksame Masse folgt aus der Schlag-Geschwindigkeit an der Klinge (m = p / v). Wie der Schaden: gemessen
    // richtet das Urteil, ungemessen die emergente Größe.
    _kampfStossOhneMessung(v) {
        const p = (this._kampfStats().knockback || 0) * AnazhRealm._arenaGesetz().gefuehl.pProKb;
        return p > 0 && v > 0 ? { p, m: p / v } : null;
    }

    // DAS TREFFER-URTEIL der Welt (Welle L, K-D2): das gehaltene Studio-Gerät richtet der Kern (schmiede
    // trefferUrteil über seine Messung kampfMasze.mess — Schnitt · Stich · Schlag, KE, Impuls, Zone). Faust und
    // Eigenwerke ohne Schmiede-Rezept haben keine Messung → null (sie tragen die Hand ×1). `weg` = der Treffer-Weg auf der
    // Waffe ([xLo, xHi], m ab dem Knauf — _kampfTrefferWeg): der Kern richtet den Ort, vLat ist das Tempo des Schlagpunkts.
    _kampfUrteil(vLat, vAx, zone, weg) {
        const sc = typeof globalThis !== "undefined" ? globalThis.__schmiedeCore : null;
        if (!sc || typeof sc.trefferUrteil !== "function") AnazhRealm._kernPflichtBruch("schmiede:trefferUrteil");
        const bp = this._heldImplementBlueprint();
        const km = bp ? this._schmiedeKampfMasze(bp) : null;
        if (!km || !km.mess) return null;
        return sc.trefferUrteil(km.mess, { vLat, vAx, edgeQ: 1, zone, weg: weg || null });
    }

    // DER ROH-SCHADEN EINES TREFFERS (Welle L, K-D5 + K-D6) — das EINE Gesetz für JEDE geführte Waffe, Klinge wie Pfeil:
    // Kraft der Führung (_kampfKraft: Körper × Güte × Verschleiß) × Wirkung × Zone. Wirkung = die Energie des Urteils
    // gegen die Arena-Eichung keRefJ (_trefferWirkung) — keine Klemme: die alte mEff-Klemme [0,6; 2,2] setzte 10 von 17
    // Rezepten auf 2,2. Ohne Urteil (Faust, Eigenwerk) Wirkung 1; die Zone liest dieselbe Tafel (schmiede ARENA.zonen).
    _kampfRohSchaden(urteil, zone, kraft) {
        const A = AnazhRealm._arenaGesetz();
        const zoneMul = urteil ? urteil.zoneMul : A.zonen[zone] ? A.zonen[zone].mul : 1;
        return kraft * this._trefferWirkung(urteil) * zoneMul;
    }

    // DIE KRAFT DER FÜHRUNG (Welle L, K-D6): Körper (stats.damage) × Güte × Verschleiß des gehaltenen Geräts, gelesen im
    // Augenblick des Hiebs oder des Lösens — der Pfeil trägt sie durch den Flug (ein Griff zur anderen Waffe ändert keinen
    // Pfeil in der Luft). Der einzige Leser von _wearStatFactor: vorher setzte der Pfeil seine Kraft selbst zusammen,
    // ohne Verschleiß (ein Bogen bei wear 0,5 traf voll). Die Faust: Güte 1, Verschleiß 1.
    _kampfKraft() {
        const bp = this._heldImplementBlueprint();
        return this._kampfStats().damage * this._heldGueteFaktor() * (bp ? this._wearStatFactor(bp) : 1);
    }

    // DIE WERKZEUG-WAND (Welle L, K-D6): ein verbrauchtes Gerät (wear unter WEAR_KAPUTT_SCHWELLE) führt nichts — kein
    // Hieb, kein Schuss, kein Abbau — und kostet nichts; der Spieler bekommt den Reparatur-Aufruf. Die Hand (bp null)
    // verbraucht nie. EINE Wand für jede Führung: vorher trugen Hieb und Abbau je ihre Kopie, der Bogen keine.
    _geraetVerbraucht(bp, verb) {
        if (!bp) return false;
        const wear = this._blueprintWear(bp);
        if (wear >= AnazhRealm.WEAR_KAPUTT_SCHWELLE) return false;
        this.log(
            `${verb}: „${bp.label || bp.name}" ist verbraucht (${Math.round(wear * 100)} %) — repariere es (eine Material-Geste am Werkzeug) oder lege ein neues an.`,
            "INFO"
        );
        return true;
    }

    // DIE WIRKUNG EINES TREFFERS: die Energie des Urteils (KE am Kontakt — Schnitt · Stich · Schlag) gegen die
    // Arena-Eichung keRefJ (114 J: der Kriegsbogen-Pfeil des Studios, ein sauberer Langschwert-Schnitt) — dieselbe Größe,
    // nach der das Labor richtet (Prüfstand e = KE × Zone) und der Hit-Stop skaliert. Klinge und Pfeil stehen so auf EINER
    // Skala: der volle Kriegsbogen 1,0, der Langbogen 0,70, ein Viertel-Auszug 0,06 des vollen. Ohne Urteil 1.
    _trefferWirkung(urteil) {
        if (!urteil) return 1;
        return urteil.KE / AnazhRealm._arenaGesetz().gefuehl.keRefJ;
    }

    // Die Kampf-Stats des Spielers (die EINE Stat-Wahrheit recomputePlayerStats; kalt → einmal rechnen).
    _kampfStats() {
        const p = this.state.player;
        return p && p.stats && Number.isFinite(p.stats.damage) ? p.stats : this.computePlayerStats().stats;
    }

    // DER VERSCHLEISS DER FÜHRUNG (Welle L, K-D6): jeder Klingen-Treffer und jeder Schuss zehrt das gehaltene Gerät wie
    // ein Abbau-Hieb (_wearPerStrike) — bis hierher zehrte nur der Abbau, Kampf ließ die Klinge ewig neu (wear 0,9968
    // nach 16 Treffern) und den Bogen ebenso, und den Faktor _wearStatFactor las niemand.
    _kampfVerschleiss(bp) {
        if (!bp) return;
        this._setBlueprintWear(bp, this._blueprintWear(bp) - this._wearPerStrike(bp));
    }

    // Die Schwung-Energie eines Eigenwerks ohne Schmiede-Messung (Ω-Φ4: ½·I·ω², I aus _swingDynamics — deren einzige
    // Quelle, anderer Definitionsbereich als kampfMasze); die Faust 0.
    _eigenwerkSchwungKE(bp) {
        if (!bp) return 0;
        const K = AnazhRealm._arenaGesetz().schwung;
        const I = this._swingDynamics(bp).swingInertia;
        const sw = this.state.player && this.state.player._swing;
        const dauer = sw && Number.isFinite(sw.dauer) ? sw.dauer : this._playerSwingDauer();
        const omega = (2 * K.arcHalfRad) / Math.max(0.05, dauer * K.strikeFrac);
        return I > 0 ? 0.5 * I * omega * omega : 0;
    }

    // Kleinste Quadrat-Distanz zweier Strecken (Ericson, Real-Time Collision
    // Detection §5.1.9) — allokationsfrei, reine Zahlen: der Sweep-Kern
    // (Klingen-Kapsel vs Kreatur-Kapsel = Segment-Segment-Distanz vs Radien-Summe).
    _segSegDistSq(p1x, p1y, p1z, q1x, q1y, q1z, p2x, p2y, p2z, q2x, q2y, q2z) {
        const d1x = q1x - p1x;
        const d1y = q1y - p1y;
        const d1z = q1z - p1z;
        const d2x = q2x - p2x;
        const d2y = q2y - p2y;
        const d2z = q2z - p2z;
        const rx = p1x - p2x;
        const ry = p1y - p2y;
        const rz = p1z - p2z;
        const a = d1x * d1x + d1y * d1y + d1z * d1z;
        const e = d2x * d2x + d2y * d2y + d2z * d2z;
        const f = d2x * rx + d2y * ry + d2z * rz;
        let s = 0;
        let t = 0;
        if (a > 1e-12 || e > 1e-12) {
            if (a <= 1e-12) {
                t = Math.max(0, Math.min(1, f / e));
            } else {
                const c = d1x * rx + d1y * ry + d1z * rz;
                if (e <= 1e-12) {
                    s = Math.max(0, Math.min(1, -c / a));
                } else {
                    const b = d1x * d2x + d1y * d2y + d1z * d2z;
                    const denom = a * e - b * b;
                    s = denom > 1e-12 ? Math.max(0, Math.min(1, (b * f - c * e) / denom)) : 0;
                    t = (b * s + f) / e;
                    if (t < 0) {
                        t = 0;
                        s = Math.max(0, Math.min(1, -c / a));
                    } else if (t > 1) {
                        t = 1;
                        s = Math.max(0, Math.min(1, (b - c) / a));
                    }
                }
            }
        }
        const cx = p1x + d1x * s - (p2x + d2x * t);
        const cy = p1y + d1y * s - (p2y + d2y * t);
        const cz = p1z + d1z * s - (p2z + d2z * t);
        // die Parameter des Nah-Paars (s auf der ersten, t auf der zweiten Strecke) für den Treffer-Ort
        const st = this._segSegST || (this._segSegST = { s: 0, t: 0 });
        st.s = s;
        st.t = t;
        return cx * cx + cy * cy + cz * cz;
    }

    // ═══ KAMPF-GEFÜHL — HIT-JUICE (render-seitig, nie Sim) ═══
    // (1) Hit-Stop pausiert NUR die Anzeige-Uhr (_hitStopUntil). (2) Kamera-Impuls über den Landungs-Dip
    // (_landImpactPending → LAND_DIP_*), kein zweiter Kamera-Kanal. (3) Timbre-One-Shot über state.symphony, kein
    // zweiter AudioContext. Stop und Dip skalieren mit der TREFFER-ENERGIE des Urteils (KE am Kontakt, Schnitt ·
    // Stich · Schlag) gegen die Arena-Eichung keRefJ (Welle L, K-D4: Grossschwert und Keule stoppten mit 19,5–20,5 J
    // gleich — KE = ½·I·ω² ist bei ω ∝ 1/√I je Waffe konstant). Die Zone wirkt im Schaden, nicht in der Energie des
    // Schlags (mit ihr lag jeder Brust-Treffer der schweren Klingen auf der Kappe keRefJ). Eigenwerke reichen ihre
    // Ω-Φ4-Energie (keEigen), die Faust 0.
    _kampfHitJuice(creature, nowSec, urteil, keEigen) {
        const G = AnazhRealm._arenaGesetz().gefuehl;
        const ke = urteil ? urteil.KE : Number.isFinite(keEigen) ? keEigen : 0;
        const e = Math.max(0, Math.min(1, ke / Math.max(1, G.keRefJ)));
        const p = this.state.player;
        if (p) p._hitStopUntil = nowSec + G.freezeMinSec + (G.freezeMaxSec - G.freezeMinSec) * e;
        this.state._landImpactPending = Math.max(
            this.state._landImpactPending || 0,
            G.dipMin + (G.dipMax - G.dipMin) * e
        );
        this._playKampfOneShot(this.computeCreatureCompoundTags(creature) || {});
    }

    // ═══ BOGEN — DAS SCHIESS-VERB ═══
    // Bogen = das schmiede-Rezept des gehaltenen Geräts trägt fx.task.art === "bogen" (Preset-Resolver
    // + LIVE-Buch). Buch kalt / kein Rezept / kein Bogen → null → Nahkampf/Abbau-Pfade laufen.
    _heldBogenRecipe() {
        const eq = this.state.player && this.state.player.equipped;
        const held = eq && eq.held;
        if (!held) return null;
        const f = this._foundry;
        if (!f || !f.recipes) return null;
        const preset =
            typeof this._foundryPresetForEntry === "function" ? this._foundryPresetForEntry({ type: held }) : null;
        const rec = preset ? f.recipes[preset] : null;
        return rec && rec.fx && rec.fx.task && rec.fx.task.art === "bogen" ? rec : null;
    }

    // ═══ WAFFEN-GÜTE — DIE SCHMIEDE-ARBEIT ERREICHT DEN KAMPF ═══
    // Der Schadens-Faktor des gehaltenen Geräts: die EINE Güte (computeBlueprintQuality) linear auf
    // [ARENA.guete.faktorLeer, faktorVoll]; Klingen-Sweep UND Pfeil multiplizieren ihn auf stats.damage. Die Faust 1.
    _heldGueteFaktor() {
        const bp = this._heldImplementBlueprint();
        if (!bp) return 1;
        const G = AnazhRealm._arenaGesetz().guete;
        return G.faktorLeer + (G.faktorVoll - G.faktorLeer) * this.computeBlueprintQuality(bp);
    }

    // Der Lehren-Anteil eines Schmiede-Geräts (schmiede gueteAnteil über Gestalt + Prägung, SYNCHRON und Lockstep-fest wie
    // die Kampf-Maße); null = kein Schmiede-Gerät. Memo je Gestalt|ov-Hash (Guss-gefroren), gedeckelt.
    _schmiedeGueteAnteil(bp) {
        const gestalt = this._schmiedeGestalt(bp);
        if (!gestalt) return null;
        const sc = typeof globalThis !== "undefined" ? globalThis.__schmiedeCore : null;
        if (!sc || typeof sc.gueteAnteil !== "function") AnazhRealm._kernPflichtBruch("schmiede:gueteAnteil");
        const ov = this._artifactStudioOv(bp);
        const key = gestalt + (ov ? "|ov:" + this._studioOvHash(ov) : "");
        const memo = this._gueteAnteilMemo || (this._gueteAnteilMemo = new Map());
        let v = memo.get(key);
        if (v === undefined) {
            const a = sc.gueteAnteil(gestalt, ov || undefined);
            v = a === null || !Number.isFinite(a) ? null : Math.max(0, Math.min(1, a));
            if (memo.size > 64) memo.clear(); // gedeckelt (jeder Guss ein Schlüssel)
            memo.set(key, v);
        }
        return v;
    }

    // Die Schmiede-Gattung eines Bauplans, SYNCHRON und Lockstep-fest: die studioGestalt-Zeile oder der
    // KIND_POLICY.weapon-Präfix (nie der async Buch-Stand); null = kein Schmiede-Gerät (Eigenwerk, Bauwerk).
    _schmiedeGestalt(bp) {
        if (!bp) return null;
        if (typeof bp.studioGestalt === "string") return bp.studioGestalt;
        if (typeof bp.name === "string") {
            const pol = AnazhRealm.KIND_POLICY.weapon;
            if (pol && pol.prefix && bp.name.indexOf(pol.prefix) === 0) return bp.name.slice(pol.prefix.length);
        }
        return null;
    }

    // GRÄBT DIESES GERÄT? (die Maus-Absicht, Welle L Q9): die leere Hand und die Grab-Geräte der Schmiede (Werk-Art
    // graben · pick: Spaten, Schaufel, Spitzhacke) graben und schütten auf; Klinge, Keil, Wucht und Bogen nie. Ein
    // Eigenwerk gräbt, wenn es keine Klinge ist (_implementAffordanceLabel — die Form entscheidet); ein Bauwerk nie.
    _geraetGraebt(bp) {
        if (!bp) return true;
        if (this._isPlaceableBlueprint(bp)) return false;
        const gestalt = this._schmiedeGestalt(bp);
        const sc = typeof globalThis !== "undefined" ? globalThis.__schmiedeCore : null;
        if (gestalt && sc && sc.REZEPT_ZU_GATTUNG && sc.GATTUNGEN) {
            const g = sc.GATTUNGEN[sc.REZEPT_ZU_GATTUNG[gestalt]];
            const art = g && g.task ? g.task.art : null;
            return art === "graben" || art === "pick";
        }
        return this._implementAffordanceLabel(bp) !== "Klinge";
    }

    // ═══ DIE KAMPF-MASSE DER GATTUNG ═══
    // schmiede-core misst kampfMasze (Länge, Masse, Trägheit um den Pivot, mEff am Impact; prepP wie
    // gueteFaktor) → Schwung-Dauer, Reichweite, Schadens-Faktor der Studio-Klingen. Auflösung SYNCHRON
    // + Lockstep-fest (studioGestalt-Zeile oder KIND_POLICY.weapon-Präfix), NIE der async Buch-Stand;
    // unbekannt → null (Emergenz-Pfad). Memo je Gestalt|ov-Hash.
    _schmiedeKampfMasze(bp) {
        if (!bp) return null;
        const sc = typeof globalThis !== "undefined" ? globalThis.__schmiedeCore : null;
        if (!sc || typeof sc.kampfMasze !== "function") return null;
        const gestalt = this._schmiedeGestalt(bp);
        if (!gestalt) return null;
        const ov = typeof this._artifactStudioOv === "function" ? this._artifactStudioOv(bp) : null;
        const key = gestalt + (ov ? "|ov:" + this._studioOvHash(ov) : "");
        const memo = this._kampfMaszeMemo || (this._kampfMaszeMemo = new Map());
        let v = memo.get(key);
        if (v === undefined) {
            v = null;
            try {
                const m = sc.kampfMasze(gestalt, ov || undefined);
                if (m && Number.isFinite(m.traegheit) && Number.isFinite(m.laengeM)) v = m;
            } catch (_e) {}
            if (memo.size > 64) memo.clear(); // gedeckelt (jeder Guss ein Schlüssel)
            memo.set(key, v);
        }
        return v;
    }

    // Bogen-Auszug (render-seitig): beim Spannen verengt sich die FOV fovRuhe→fovZug über auszugSec,
    // relativ zur echten Ruhe-FOV (d.fovRest); Abbruch stellt sie wieder her. Kern kalt → No-op.
    _tickBogenZug(nowSec) {
        const p = this.state.player;
        const d = p && p._bogenDraw;
        if (!d) return;
        const cam = this.state.camera;
        if (!this.state.isPointerLocked || !this._heldBogenRecipe()) {
            p._bogenDraw = null;
            if (cam && Number.isFinite(d.fovRest)) {
                cam.fov = d.fovRest;
                cam.updateProjectionMatrix();
            }
            this._bogenHudZeige(null);
            return;
        }
        if (!cam) return;
        const A = AnazhRealm._arenaGesetz().bogen;
        const frac = Math.max(0, Math.min(1, (nowSec - d.start) / Math.max(0.001, A.auszugSec)));
        const ruhe = Number.isFinite(d.fovRest) ? d.fovRest : A.fovRuhe;
        const ziel = ruhe + (A.fovZug - A.fovRuhe) * frac;
        if (Math.abs(cam.fov - ziel) > 0.01) {
            cam.fov = ziel;
            cam.updateProjectionMatrix();
        }
        this._bogenHudZeige(frac);
    }
    // Die vierte Stats-HUD-Row zeigt den Auszug-Anteil frame-genau, nur während des Spannens.
    // frac null = verstecken. DOM lazy-gecacht; ohne DOM No-op.
    _bogenHudZeige(frac) {
        let h = this._bogenHud;
        if (h === undefined) {
            const row = typeof document !== "undefined" && document.getElementById("stats-hud-bogen-row");
            h = this._bogenHud = row
                ? {
                      row,
                      fill: document.getElementById("stats-hud-bogen-fill"),
                      text: document.getElementById("stats-hud-bogen-text"),
                  }
                : null;
        }
        if (!h) return;
        if (!Number.isFinite(frac)) {
            if (!h.row.hidden) h.row.hidden = true;
            return;
        }
        if (h.row.hidden) h.row.hidden = false;
        if (h.fill) h.fill.setAttribute("width", String(Math.round(166 * frac)));
        if (h.text) h.text.textContent = Math.round(frac * 100) + " %";
    }
    // Das Lösen: stellt die FOV wieder her und schießt mit dem Auszug-Anteil
    // (minAuszugFrac deckelt nach unten — ein Zucken ist kein Schuss ins Nichts).
    _bogenRelease() {
        const p = this.state.player;
        if (!p) return;
        const d = p._bogenDraw;
        p._bogenDraw = null;
        this._bogenHudZeige(null);
        if (!d) return;
        const cam = this.state.camera;
        if (cam && Number.isFinite(d.fovRest)) {
            cam.fov = d.fovRest;
            cam.updateProjectionMatrix();
        }
        const rec = this._heldBogenRecipe();
        if (!rec) return;
        const A = AnazhRealm._arenaGesetz().bogen;
        const held = Math.max(0, performance.now() / 1000 - d.start);
        const frac = Math.max(
            Number.isFinite(A.minAuszugFrac) ? A.minAuszugFrac : 1,
            Math.min(1, A.auszugSec > 0 ? held / A.auszugSec : 1)
        );
        this._beginPlayerShot(rec, frac);
    }

    // Klick = EIN Pfeil. Spann-Cooldown = _playerSwingDauer (∝ √I, die EINE Quelle). DIE EINE SCHUSS-PHYSIK (Welle L,
    // K-D8): E = ableitenBogen(task).energie — die Pfeil-Energie des Studios (SI, gegen Stretton 114 J geeicht),
    // v0 = √(2·E/mArrow) × Auszug; die Welt-Eichung zugJouleRef (28,9 J·zug·aus, 25–41 % der Studio-Energie) ist
    // GEFALLEN. Richtung = vom Mündungs-Punkt auf den Fadenkreuz-Punkt (_blickZiel — 1st und 3rd zielen durch
    // dieselbe Kamera). Deterministisch; Stamina + Affekt wie der Hieb. Der Bogen ist eine geführte Waffe wie die Klinge
    // (Welle L, K-D6): dieselbe Werkzeug-Wand, der Pfeil trägt die Kraft der Führung (_kampfKraft, mit Verschleiß) in
    // das EINE Roh-Schaden-Gesetz, und jeder Schuss zehrt den Bogen (_kampfVerschleiss).
    _beginPlayerShot(rec, drawFrac) {
        const p = this.state.player;
        const pm = this.state.playerMesh;
        if (!p || !pm) return false;
        const now = performance.now() / 1000;
        if (Number.isFinite(p._shotCooldownUntil) && now < p._shotCooldownUntil) return false;
        const bp = this._heldImplementBlueprint();
        if (this._geraetVerbraucht(bp, "Schuss")) return false;
        const dauer = this._playerSwingDauer();
        p._shotCooldownUntil = now + dauer;
        p.lastAttackAt = now;
        this._consumeMouseStamina();
        const heldName = p.equipped && p.equipped.held;
        this._feelAction("attack", heldName ? { blueprint: heldName } : undefined);
        const task = rec && rec.fx && rec.fx.task ? rec.fx.task : null;
        const zug = task && Number.isFinite(task.zugkraft) && task.zugkraft > 0 ? task.zugkraft : 1;
        const aus = task && Number.isFinite(task.auszug) && task.auszug > 0 ? task.auszug : 1;
        const AB = AnazhRealm._arenaGesetz().bogen;
        // Fail-closed: ein Kern ohne ableitenBogen ist ein BRUCH; ein Wurfarm-Material, das das lebende Buch nicht
        // trägt, schießt mit dem holz-Anker (die legitime Weiche, BOGENMAT.holz lebt im Buch immer).
        const sc = typeof globalThis !== "undefined" ? globalThis.__schmiedeCore : null;
        if (!sc || typeof sc.ableitenBogen !== "function" || !AnazhRealm.Gesetz("schmiede:BOGENMAT.holz", null))
            AnazhRealm._kernPflichtBruch("schmiede:BOGENMAT/ableitenBogen");
        const bmName = task && typeof task.material === "string" ? task.material : "holz";
        const material = AnazhRealm.Gesetz("schmiede:BOGENMAT." + bmName, null) ? bmName : "holz";
        const E = sc.ableitenBogen({ auszug: aus, zugkraft: zug, material }).energie;
        if (!(Number.isFinite(E) && E > 0)) AnazhRealm._kernPflichtBruch("schmiede:ableitenBogen.energie");
        let v0 = Math.sqrt((2 * E) / Math.max(0.001, AB.mArrow));
        if (Number.isFinite(drawFrac)) v0 *= Math.max(0, Math.min(1, drawFrac));
        const K = AnazhRealm._arenaGesetz().schwung;
        // die Mündung VOR der Schulter in Blickrichtung, die Flugbahn auf den Fadenkreuz-Punkt
        const blick = this._blickVorn(
            Number.isFinite(this.state.yaw) ? this.state.yaw : pm.rotation.y || 0,
            Number.isFinite(this.state.pitch) ? this.state.pitch : 0
        );
        const mx = pm.position.x + blick.x * AB.muendungM;
        // V18.491.148 STUDIO_VIS.host=world-fp — Feel; bow muzzle at schwung.shoulderH.
        const my = pm.position.y + K.shoulderH + blick.y * AB.muendungM;
        const mz = pm.position.z + blick.z * AB.muendungM;
        const ziel = this._blickZiel(AnazhRealm.BLICK_ZIEL_M);
        // DIE BAHN TRIFFT DAS FADENKREUZ (Welle LF, Posten 4): der Pfeil fällt (state.gravity) — er steigt im flachen der zwei
        // Winkel, deren Bahn den Punkt des Fadenkreuzes trifft, tan θ = (v² − √(v⁴ − g(g·x² + 2·y·v²))) / (g·x); jenseits der
        // Weite des Bogens unter 45°. Vorher flog er geradewegs auf den Punkt und fiel bei 13 m 0,2 m darunter durch.
        let dx = ziel.x - mx,
            dy = ziel.y - my,
            dz = ziel.z - mz;
        const gB = Math.abs(this.state.gravity);
        const xh = Math.hypot(dx, dz);
        if (xh > 1e-6 && v0 > 1e-6) {
            const v2 = v0 * v0;
            const disc = v2 * v2 - gB * (gB * xh * xh + 2 * dy * v2);
            const th = disc >= 0 ? Math.atan((v2 - Math.sqrt(disc)) / (gB * xh)) : Math.PI / 4;
            const ch = Math.cos(th);
            dx = (dx / xh) * ch;
            dz = (dz / xh) * ch;
            dy = Math.sin(th);
        } else if (Math.hypot(dx, dy, dz) > 1e-6) {
            const dl = Math.hypot(dx, dy, dz);
            dx /= dl;
            dy /= dl;
            dz /= dl;
        } else {
            dx = blick.x;
            dy = blick.y;
            dz = blick.z;
        }
        const list = this.state._pfeile || (this.state._pfeile = []);
        while (list.length >= AnazhRealm.MAX_PFEILE) this._pfeilDespawn(list.shift()); // bounded (Wirts-Deckel)
        const pf = {
            x: mx,
            y: my,
            z: mz,
            vx: dx * v0,
            vy: dy * v0,
            vz: dz * v0,
            born: now,
            lastT: now,
            // die Kraft der Führung beim Lösen (Körper × Güte × Verschleiß, _kampfKraft) — die Wirkung urteilt der
            // Treffer aus der Energie des Pfeils (trefferUrteil, Stich), der Schaden ist _kampfRohSchaden.
            kraft: this._kampfKraft(),
            mesh: null,
        };
        this._kampfVerschleiss(bp); // der Schuss zehrt den Bogen — NACH dem Lesen der Kraft, wie der Klingen-Treffer
        this._pfeilMeshAttach(pf);
        list.push(pf);
        return true;
    }

    // Pfeil-Tick (Anzeige-Uhr, NACH der fixen Sim): semi-implizit in state.gravity. Das Flug-Segment (alt → neu) trifft
    // zuerst die WELT (Gelände UND Bauten — _fieldRaycast, die EINE Welt-Kollision; Welle L K-D8: 3 von 3 Pfeilen
    // flogen durch ein Haus), davor die GESTALT eines Tiers (_kreaturGliedTreffer, Zone je Glied); das Urteil ist der
    // Stich des Kerns (trefferUrteil: KE = ½·m·v² trägt Schaden und Hit-Stop). Lebenszeit deckelt; MAX_PFEILE, kein Snapshot.
    _tickPfeile(nowSec) {
        const list = this.state._pfeile;
        if (!list || !list.length) return;
        const B = AnazhRealm._arenaGesetz().bogen;
        // V18.491.149 GRAVITY_VIS.host=state-signed — Lab ARENA.g studio +9.81; Host state.gravity world −9.81 dual, not Fake-merge.
        const g = this.state.gravity;
        const creatures = this.state.creatures || [];
        for (let i = list.length - 1; i >= 0; i--) {
            const pf = list[i];
            const dt = Math.min(
                AnazhRealm.TAKT_DECKEL_S,
                Math.max(0, nowSec - (Number.isFinite(pf.lastT) ? pf.lastT : nowSec))
            );
            pf.lastT = nowSec;
            if (nowSec - pf.born > B.maxFlugSec) {
                this._pfeilDespawn(pf);
                list.splice(i, 1);
                continue;
            }
            if (dt <= 0) continue;
            const ox = pf.x;
            const oy = pf.y;
            const oz = pf.z;
            pf.vy += g * dt;
            pf.x += pf.vx * dt;
            pf.y += pf.vy * dt;
            pf.z += pf.vz * dt;
            // NaN-Wand: ein entgleister Pfeil fällt sofort aus der Welt.
            if (!Number.isFinite(pf.x) || !Number.isFinite(pf.y) || !Number.isFinite(pf.z)) {
                this._pfeilDespawn(pf);
                list.splice(i, 1);
                continue;
            }
            // Die Welt zuerst: wo das Segment Gelände oder Bau trifft, endet der Flug (ein Tier dahinter bleibt heil).
            const wand = this._fieldRaycast(ox, oy, oz, pf.x, pf.y, pf.z);
            const ex = wand.hit ? wand.x : pf.x,
                ey = wand.hit ? wand.y : pf.y,
                ez = wand.hit ? wand.z : pf.z;
            // Treffer: das Flug-Segment (alt → Wand oder neu) gegen die Glieder jedes Tiers; das früheste gewinnt.
            let hit = null;
            let hitTr = null;
            const stepR = Math.hypot(ex - ox, ey - oy, ez - oz);
            for (let c = 0; c < creatures.length; c++) {
                const cr = creatures[c];
                if (!cr || !cr.userData) continue;
                if (!this._trefferErreichbar(cr, ex, ez, stepR + B.radiusM)) continue; // das Grob-Tor (der Leib)
                const tr = this._kreaturGliedTreffer(cr, ox, oy, oz, ex, ey, ez, B.radiusM);
                if (tr && (!hitTr || tr.s < hitTr.s)) {
                    hit = cr;
                    hitTr = tr;
                }
            }
            if (hit) {
                const vv = Math.sqrt(pf.vx * pf.vx + pf.vy * pf.vy + pf.vz * pf.vz);
                const sc = globalThis.__schmiedeCore;
                const urteil = sc.trefferUrteil({ M: B.mArrow, mEffFrac: 1 }, { vLat: 0, vAx: vv, zone: hitTr.zone });
                const res = this.damageCreature(hit, this._kampfRohSchaden(urteil, hitTr.zone, pf.kraft), {
                    source: "player",
                    fromPos: { x: ox, y: oy, z: oz },
                    stoss: { p: urteil.p, m: urteil.mEff },
                });
                if (res && res.ok) this._kampfHitJuice(hit, nowSec, urteil, null);
                this._pfeilDespawn(pf);
                list.splice(i, 1);
                continue;
            }
            if (wand.hit) {
                this._pfeilDespawn(pf);
                list.splice(i, 1);
                continue;
            }
            if (pf.mesh) {
                pf.mesh.position.set(pf.x, pf.y, pf.z);
                pf.mesh.lookAt(pf.x + pf.vx, pf.y + pf.vy, pf.z + pf.vz);
            }
        }
    }

    // Pfeil-Optik (render-seitig, headless-fest: ohne THREE/Szene fliegt die reine Sim): DIE GESTALT DES SCHMIEDE-KERNS
    // (Welle LF 09.10., Posten 4 — schmiede buildPfeil: Schaft, Spitze, Nocke, drei Federn; die Albedo im Vertex) durch den
    // EINEN Stoff-Weg der Welt (_ofenMeshEintragAusThree → _foundryBuildGroup, wie jeder Guss des Ofens): einmal als Vorlage
    // gebaut, je Schuss ein Klon, der Geometrie und Stoffe teilt — kein Alloc-Churn. Die Vorlage liegt längs +X, die Hülle
    // dreht sie auf +Z (die lookAt-Konvention des Flugs). Vorher ein eigener Zylinder des Wirts in MeshBasic: ein brauner
    // Stab ohne Spitze, Federn, Licht und Schatten (Leben-Schau 07.10., Bild ks08).
    _pfeilVorlage() {
        if (this._pfeilVorlageMemo) return this._pfeilVorlageMemo;
        const sc = typeof globalThis !== "undefined" ? globalThis.__schmiedeCore : null;
        if (!sc || typeof sc.buildPfeil !== "function") return AnazhRealm._kernPflichtBruch("schmiede:buildPfeil");
        const g = sc.buildPfeil();
        g.updateMatrixWorld(true);
        const eintraege = [];
        g.traverse((o) => {
            if (!o.isMesh) return;
            const geo = o.geometry.clone().applyMatrix4(o.matrixWorld);
            eintraege.push(
                this._ofenMeshEintragAusThree({ geometry: geo, material: o.material, userData: o.userData })
            );
        });
        const teile = this._foundryBuildGroup(eintraege, { lod: 0 });
        let n = 0;
        if (teile)
            teile.traverse((o) => {
                if (!o.isMesh) return;
                o.castShadow = o.receiveShadow = true;
                n++;
            });
        // ein leerer Guss bricht laut (Nachbesserung 2 + 3): keine Gruppe ODER eine Gruppe ohne ein einziges Mesh (jedes
        // _foundryBuildMesh gab null) — vorher flog jeder Pfeil dann unsichtbar, ohne Meldung
        if (!n) return AnazhRealm._kernPflichtBruch("schmiede:buildPfeil (der Guss der Gestalt ist leer)");
        teile.rotation.y = -Math.PI / 2;
        const huelle = new THREE.Group();
        huelle.name = "pfeil";
        huelle.add(teile);
        this._pfeilVorlageMemo = huelle;
        return huelle;
    }

    _pfeilMeshAttach(pf) {
        if (typeof THREE === "undefined" || !this.state.scene) return;
        const v = this._pfeilVorlage();
        pf.mesh = v.clone();
        pf.mesh.position.set(pf.x, pf.y, pf.z);
        pf.mesh.lookAt(pf.x + pf.vx, pf.y + pf.vy, pf.z + pf.vz);
        this.state.scene.add(pf.mesh);
    }

    _pfeilDespawn(pf) {
        if (pf && pf.mesh) {
            if (pf.mesh.parent) pf.mesh.parent.remove(pf.mesh);
            pf.mesh = null; // Geo/Mat sind GETEILT (kein Dispose je Pfeil)
        }
    }

    // ═══ KAMPF-GEFÜHL — DER OBERKÖRPER-LAYER: DER LEIB FOLGT DER KLINGE (Welle LF 09.10., Posten 2) ═══
    // Additiver Layer über der Lokomotion (_animateHumanoidRig setzt die Null-Basis), kein zweites Rig-System. Die Lage der
    // Klinge kommt aus DEM Schwung (_kampfSchwungLage — derselbe, den der Sweep als Treffer-Volumen fegt), und der Leib legt
    // sie dorthin: (1) der Rumpf beugt (λ, um die linke Achse) und dreht (τ, um die Senkrechte) am Torso-Gelenk — dieselben
    // Winkel, mit denen der Rahmen die Schulter rechnet (_kampfSchulter); (2) die Hülle des Leibs trägt die Schulter dorthin,
    // wo der Rahmen sie rechnet (der Ausfall nach vorn); (3) der Unterarm streckt sich in die Flucht des Oberarms; (4) die
    // Schulter legt die Hand-Mitte auf die Achse der Klinge; (5) das Handgelenk legt das Gerät längs der Achse. Gewicht w aus der Lage (Windup aus der Ruhe, Recover zurück, an beiden Rändern 0: kein Pop). NUR Oberkörper — die
    // Beine gehören dem Gang. Vorher drehte die Schulter um x mit Wirts-Literalen (−1,55 · 0,25 · −0,6 · 0,38 · 0,16 rad): im
    // Treffer-Takt stand die Klinge über dem Kopf (Bild ks02), die Ich-Sicht sah keine Klinge (ks01).
    _applyKampfSchwungPose(mesh) {
        const p = this.state.player;
        const sw = p && p._swing;
        const rig = mesh && mesh.userData && mesh.userData.rig;
        const a = rig && rig.armR;
        // (0) ohne Schwung steht die Hülle des Leibs auf ihrem Platz (den Ausfall trägt sie nur im Schwung, Schritt 2)
        const huelle = this._kampfHuelle(mesh);
        if (huelle && !huelle.userData._ausfallBasis) huelle.userData._ausfallBasis = huelle.position.clone();
        if (huelle) huelle.position.copy(huelle.userData._ausfallBasis);
        if (!sw || !sw.rahmen || !a || !a.shoulder || !a.elbow || !a.wrist || !rig.spine || !rig.spine.parent) return;
        const achse = this._kampfKlingenAchse(sw, this._poseAchse || (this._poseAchse = {}));
        const L = this._kampfSchwungLage(sw, sw.t, achse, this._poseLage || (this._poseLage = {}));
        if (!(L.w > 0)) return;
        const V =
            this._poseV ||
            (this._poseV = {
                S: new THREE.Vector3(),
                E: new THREE.Vector3(),
                W: new THREE.Vector3(),
                G: new THREE.Vector3(),
                T: new THREE.Vector3(),
                a: new THREE.Vector3(),
                b: new THREE.Vector3(),
                ax: new THREE.Vector3(),
                up: new THREE.Vector3(0, 1, 0),
                q: new THREE.Quaternion(),
                qp: new THREE.Quaternion(),
                qa: new THREE.Quaternion(),
                qb: new THREE.Quaternion(),
                qw: new THREE.Quaternion(),
                qi: new THREE.Quaternion(),
            });
        // eine Welt-Drehung am Gelenk: q_lokal ← P⁻¹ · q_welt · P · q_lokal (P = die Welt-Drehung des Elternknotens)
        const drehe = (knochen, qWelt) => {
            knochen.parent.getWorldQuaternion(V.qp);
            V.q.copy(V.qp).invert().multiply(qWelt).multiply(V.qp);
            knochen.quaternion.premultiply(V.q);
            knochen.updateMatrixWorld(true);
        };
        const gewichtet = (qWelt) => (L.w < 1 ? qWelt.slerp(V.qi.identity(), 1 - L.w) : qWelt);
        // (1) der Rumpf: erst die Beuge um die linke Achse (oben → vorn), dann die Drehung um die Senkrechte — L.lam und L.tau
        // tragen das Gewicht schon
        const yaw = mesh.rotation.y;
        V.ax.set(Math.cos(yaw), 0, -Math.sin(yaw));
        V.qa.setFromAxisAngle(V.ax, L.lam);
        V.qb.setFromAxisAngle(V.up, L.tau);
        mesh.updateMatrixWorld(true);
        drehe(rig.spine, V.qw.copy(V.qb).multiply(V.qa));
        // (2) die Schulter steht, wo der Rahmen sie rechnet (L.S — mit dem Ausfall): die Hülle trägt den Leib um den Rest
        // (den Ausfall und was die Garde der Lokomotion seit dem Schwung-Beginn verschob), gewichtet mit w — kein Sprung
        if (huelle) {
            a.shoulder.getWorldPosition(V.S);
            mesh.worldToLocal(V.a.set(L.S.x, L.S.y, L.S.z));
            mesh.worldToLocal(V.b.copy(V.S));
            huelle.position.addScaledVector(V.a.sub(V.b), L.w);
            huelle.updateMatrixWorld(true);
        }
        // (3) der Arm streckt sich: der Unterarm in die Flucht des Oberarms
        a.shoulder.getWorldPosition(V.S);
        a.elbow.getWorldPosition(V.E);
        a.wrist.getWorldPosition(V.W);
        V.a.subVectors(V.W, V.E).normalize();
        V.b.subVectors(V.E, V.S).normalize();
        drehe(a.elbow, gewichtet(V.qw.setFromUnitVectors(V.a, V.b)));
        // (4) die Schulter legt die Hand-Mitte auf die Achse der Klinge, (5) das Handgelenk das Gerät längs der Achse (die leere
        // Faust hat keins). Die Kette der Gestalt trägt Skalen (die Morph-Proportionen): eine Welt-Drehung am Gelenk trifft
        // in einem Zug nur auf 0,07 rad — KAMPF_POSE_ZUEGE Züge legen die Klinge auf 0,001 rad.
        V.b.set(L.d.x, L.d.y, L.d.z);
        const geraet = !!mesh.userData.heldMesh;
        for (let zug = 0; zug < AnazhRealm.KAMPF_POSE_ZUEGE; zug++) {
            V.a.subVectors(this._kampfHandMitte(rig, V.G), V.S).normalize();
            drehe(a.shoulder, gewichtet(V.qw.setFromUnitVectors(V.a, V.b)));
            if (geraet && this._kampfGeraetSpitze(mesh, rig, V.T)) {
                V.a.subVectors(V.T, this._kampfHandMitte(rig, V.G)).normalize();
                drehe(a.wrist, gewichtet(V.qw.setFromUnitVectors(V.a, V.b)));
            }
        }
    }

    // Die Hülle des Leibs (der _creatureSkin-Knoten des Avatars, an dessen Knochen Rig und Gerät hängen) oder null.
    _kampfHuelle(mesh) {
        for (const ch of mesh.children) if (ch && ch.userData && ch.userData._creatureSkin) return ch;
        return null;
    }

    // DIE SPITZE DES GEHALTENEN GERÄTS in Welt (der Arm des Schwungs legt sie auf die Achse des Treffer-Volumens): das Ende der
    // längsten Achse seines Hüllquaders (im Raum des Geräts, je Gerät einmal — userData._spitzeEnden), das weiter vom
    // Handgelenk liegt; ohne Gerät die Hand selbst (das Handgelenk). false = keine Hand.
    _kampfGeraetSpitze(mesh, rig, out) {
        const held = mesh.userData && mesh.userData.heldMesh;
        const wrist = rig.armR.wrist;
        if (!held) {
            if (!wrist) return false;
            wrist.getWorldPosition(out);
            return true;
        }
        let e = held.userData._spitzeEnden;
        if (e === undefined) {
            e = null;
            const inv = new THREE.Matrix4().copy(held.matrixWorld).invert();
            const m = new THREE.Matrix4();
            const box = new THREE.Box3().makeEmpty();
            const bb = new THREE.Box3();
            held.traverse((o) => {
                if (!o.isMesh || !o.geometry || !o.geometry.attributes || !o.geometry.attributes.position) return;
                if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
                box.union(bb.copy(o.geometry.boundingBox).applyMatrix4(m.multiplyMatrices(inv, o.matrixWorld)));
            });
            if (!box.isEmpty() && held.userData.heldAxis === "x") {
                // die Studio-Gestalt liegt längs ihrer Vorlagen-Achse +X (Knauf bei 0, die Spitze am Ende) — die Achse selbst,
                // nie die Mitte des Quaders (Parier und Schneide stehen außermittig)
                e = [new THREE.Vector3(box.min.x, 0, 0), new THREE.Vector3(box.max.x, 0, 0)];
            } else if (!box.isEmpty()) {
                const g = box.getSize(new THREE.Vector3());
                const achse = g.x >= g.y && g.x >= g.z ? "x" : g.y >= g.z ? "y" : "z";
                const a = box.getCenter(new THREE.Vector3());
                const z = a.clone();
                a[achse] = box.min[achse];
                z[achse] = box.max[achse];
                e = [a, z];
            }
            held.userData._spitzeEnden = e;
        }
        if (!e) {
            if (!wrist) return false;
            wrist.getWorldPosition(out);
            return true;
        }
        const w = this._spitzeW || (this._spitzeW = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]);
        held.localToWorld(w[0].copy(e[0]));
        held.localToWorld(w[1].copy(e[1]));
        if (wrist) wrist.getWorldPosition(w[2]);
        else w[2].copy(mesh.position);
        out.copy(w[0].distanceToSquared(w[2]) > w[1].distanceToSquared(w[2]) ? w[0] : w[1]);
        return true;
    }

    // Das GEHALTENE Gerät → sein Bauplan: ein Werkzeug ist eine Instanz
    // (state.tools[name].sourceBlueprint); ein direkter Bauplan-Name (Test/Waffe) passt auch.
    _heldImplementBlueprint() {
        const eq = this.state.player && this.state.player.equipped;
        if (!eq) return null;
        const blu = this.state.blueprints || {};
        // V17.57 W2-B — EIN Slot: `held` (ein Bauplan). Direkt auflösen; ein gecraftetes
        // Werkzeug (name == Bauplan, sonst sourceBlueprint) wird ebenso aufgelöst (Robustheit
        // für Alt-Saves / Werkzeug-Namen).
        const held = eq.held;
        if (!held) return null;
        if (blu[held]) return blu[held];
        const tool = this.state.tools && this.state.tools[held];
        if (tool && tool.sourceBlueprint && blu[tool.sourceBlueprint]) return blu[tool.sourceBlueprint];
        return null;
    }

    // V17.56 W2 — der Anteil SPITZER/klingen-Parts (SPATIAL_POINTED_SHAPES) am Bauplan — das
    // reine FORM-Maß. Daraus emergiert die Schärfe (× härte, für das Schneiden) UND die Stumpfheit
    // (1 − das, für die Wucht). Reuse der bestehenden Form-Sprache (dieselben Shapes wie der TIP-Bonus).
    _blueprintPointedFraction(bp) {
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return 0;
        const pointed = AnazhRealm.SPATIAL_POINTED_SHAPES;
        let n = 0;
        for (const part of bp.parts) if (part && pointed.has(part.shape)) n++;
        return n / bp.parts.length;
    }

    // Fähigkeits-Profil = FORM-getriebener Trade-off: WUCHT (minePower ∝ Stumpfheit × (dichte+härte),
    // bricht Fels) vs SCHÄRFE (cutPower ∝ spitze Form × härte, schneidet Weiches). Dieselbe Materie
    // wird Keule oder Klinge — die FORM entscheidet. Die Faust: beides schwach.
    _implementProfile() {
        return this._implementProfileForBlueprint(this._heldImplementBlueprint());
    }

    // V17.57 W2-B — das Profil eines BELIEBIGEN Bauplans (für die UI-Ablesung + das gehaltene Gerät).
    _implementProfileForBlueprint(bp) {
        const H = AnazhRealm.HARVEST;
        if (!bp) return { minePower: H.handMinePower, cutPower: H.handCutPower };
        const t = this.computeCompoundTags(bp) || {};
        const pointedFrac = this._blueprintPointedFraction(bp);
        const sharpness = pointedFrac * (t.härte || 0);
        const bluntness = 1 - pointedFrac;
        // Die GÜTE des Werks moduliert die Welt-Kraft (besseres Gerät bricht/schneidet kräftiger) — die EINE Güte
        // (computeBlueprintQuality: Lehren-Urteil, eingefrorener Werk-Stand oder die Teile; ohne opChain 1.0 → Faktor 1).
        const precMul = 0.5 + 0.5 * this.computeBlueprintQuality(bp);
        const minePower =
            (H.toolMineBase + bluntness * ((t.härte || 0) * H.mineFromHärte + (t.dichte || 0) * H.mineFromDichte)) *
            precMul;
        const cutPower = (H.toolCutBase + sharpness * H.cutFromSharp) * precMul;
        return { minePower, cutPower };
    }

    // V17.57 W2-B — die ROLLE wird ein ABLESEN: das dominante Können des Geräts aus seinem Profil
    // (kein manuelles Markieren mehr). Eine spitze Klinge liest „Klinge" (schneidet), ein stumpfer
    // schwerer Klotz „Brecher" (wuchtet), ausgewogen „Gerät".
    _implementAffordanceLabel(bp) {
        const prof = this._implementProfileForBlueprint(bp);
        if (prof.cutPower > prof.minePower * 1.3) return "Klinge";
        if (prof.minePower > prof.cutPower * 1.3) return "Brecher";
        return "Gerät";
    }

    // WIE wird ein Bauplan benutzt? Aus Rolle + Form ausgelesen, kein Hand-Flag: Bauwerk → place,
    // greifbares Gerät → hold, Rüstung → wear, Seele → embody, Trank → drink. Gerät vs Bauwerk trennt
    // die Form (greifbar ≤ IMPLEMENT_GRASP_SPAN_M → Hand, sonst Welt).
    _blueprintUseKind(bp) {
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return "place";
        // Die EMERGENTE Rolle (_displayRole, Form × Material) entscheidet, nicht der rohe bp.role — ein
        // selbst entworfener Brustpanzer ist ohne Markieren „Rüstung“. roleManual/builtIn haben Vorrang.
        const role = this._displayRole(bp);
        if (role === "armor") return "wear";
        if (role === "soul") return "embody";
        if (role === "consumable") return "drink";
        if (role === "tool" || role === "weapon") return "hold"; // explizite Geräte
        // M2 — vehicle ist ein Welt-Apparat: ein Wagen wird PLATZIERT (Phantom → confirmBuild
        // zahlt), nie in die Hand genommen (Befund 7: der Wagen rutschte in die Hand).
        if (role === "portal" || role === "workshop-station" || role === "machine" || role === "vehicle")
            return "place"; // Welt-Apparate
        // architecture / rollenlos: die FORM entscheidet (_isGraspableImplementForm) — spitz/klingen ODER
        // griff-elongiert und handgroß → „hold“; sonst „place“ (konservativ, bricht keinen Block).
        return this._isGraspableImplementForm(bp) ? "hold" : "place";
    }

    // Reine FORM-Frage (liest NICHT die Rolle): handgroß (IMPLEMENT_GRASP_SPAN_M) + spitz
    // (pointedFraction>0) ODER griff-elongiert (eine Achse ≥2.2×).
    // Leser: computeBlueprintRole + _blueprintUseKind.
    _isGraspableImplementForm(bp) {
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return false;
        const e = this._compoundVisualExtent(bp);
        const span = Math.max(e.dx, e.dy, e.dz);
        if (span > AnazhRealm.IMPLEMENT_GRASP_SPAN_M) return false; // zu groß für die Hand → Welt-Struktur
        const dims = [e.dx, e.dy, e.dz].sort((a, b) => b - a);
        const elongated = dims[0] / Math.max(1e-4, dims[1]) >= 2.2;
        const pointed = this._blueprintPointedFraction(bp) > 0;
        return pointed || elongated;
    }

    // Greifbare KLINGE/SPIKE: spitz UND gestreckt — strenger als _isGraspableImplementForm (ODER), damit
    // in der Rollen-Klassifikation weder kompakter Kristall-Cluster noch stumpfer Stab zum Gerät wird.
    _isGraspableBladeForm(bp) {
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return false;
        const e = this._compoundVisualExtent(bp);
        if (Math.max(e.dx, e.dy, e.dz) > AnazhRealm.IMPLEMENT_GRASP_SPAN_M) return false;
        const dims = [e.dx, e.dy, e.dz].sort((a, b) => b - a);
        const elongated = dims[0] / Math.max(1e-4, dims[1]) >= 2.2;
        return elongated && this._blueprintPointedFraction(bp) > 0;
    }

    // V17.74 — ist der Bauplan eine PLATZIERBARE Welt-Struktur (Phantom) vs ein in-die-Hand/an-den-
    // Körper-Ding? Der Hotbar-Gate-Schalter (Bauwerk → Platzier-Phantom, alles andere → benutzt).
    _isPlaceableBlueprint(bp) {
        return this._blueprintUseKind(bp) === "place";
    }

    // Kosten-Suffix am Dropdown der Mach-Akte: frei → kein Marker, Material da → „· ✓“, fehlt →
    // „· ✗ fehlt 12× stein“. Reuse checkBuildCost (dieselbe Formel, die der Akt zieht).
    _makeActCostSuffix(name) {
        const bp = this.state.blueprints && this.state.blueprints[name];
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return "";
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        if (mode === "schöpfer" || Number.isFinite(bp.forgedPrecision)) return ""; // frei → kein Marker
        const check = this.checkBuildCost(name);
        if (check.ok) return " · ✓"; // Material da → bereit zum Schmieden
        const missing = Object.entries(check.missing || {})
            .map(([m, n]) => `${n}× ${m}`)
            .join(", ");
        return ` · ✗ fehlt ${missing}`;
    }

    // Emergente FÄHIGKEIT eines Bauplans aus Form × Material, unabhängig von der Rolle (Holzstiel +
    // Steinkopf liest „Brecher — wuchtet Fels“). Reuse der Profil-/Form-Leser; Geräte-Lesarten nur bei
    // greif-/schwingbarer Größe — ein Dorf ist kein Brecher.
    _blueprintCapabilityHints(bp) {
        const hints = [];
        if (!bp || !Array.isArray(bp.parts) || !bp.parts.length) return hints;
        const t = this.computeCompoundTags(bp) || {};
        // (1) die in-der-Hand-Lesart (Werkzeug + Waffe vereint, W2-B): Klinge/Brecher/Gerät + was es gut tut.
        const bbox = this._compoundBBox(bp);
        const span = bbox ? Math.max(bbox.max.x - bbox.min.x, bbox.max.y - bbox.min.y, bbox.max.z - bbox.min.z) : 0;
        if (span <= AnazhRealm.IMPLEMENT_GRASP_SPAN_M) {
            const label = this._implementAffordanceLabel(bp);
            const doing =
                label === "Klinge"
                    ? "schneidet Weiches (Holz/Pflanzen), schwach an Fels"
                    : label === "Brecher"
                      ? "wuchtet Fels/Hartes, schneidet kaum"
                      : "ausgewogen (schneiden + wuchten)";
            hints.push(`${label} — ${doing}`);
        }
        // (2) die Schutz-Lesart (Rüstung): dichte + härte verteilen den Stoß.
        const schutz = (t.dichte || 0) + (t.härte || 0);
        if (schutz >= 1.2) hints.push(`Schutz (Rüstung) ~${(schutz * 0.5).toFixed(1)}`);
        // (3) die FORM-emergenten Lesarten (dieselben Prädikate wie computeBlueprintRole):
        if (this._isBodyShaped && this._isBodyShaped(bp)) hints.push("Wesen (Seele/Avatar)");
        if (this._isPortalShaped && this._isPortalShaped(bp)) hints.push("Tor (Portal)");
        if (this._isFoodLike && this._isFoodLike(bp)) hints.push("Wirkung (Trank/Nahrung)");
        return hints;
    }

    // V17.55 W1-Kompat — die reine Grab-Kraft (für Aufrufer, die nur die Wucht brauchen).
    _heldMinePower() {
        return this._implementProfile().minePower;
    }

    // Widerstand in zwei Kanälen aus härte+dichte (je eigene HARVEST-Gewichte): mineResist gegen Wucht,
    // cutResist gegen Schärfe — das MATERIAL entscheidet, welche Kraft greift (Fels nur Wucht).
    _architectureResistance(entry) {
        const H = AnazhRealm.HARVEST;
        const bp = entry && this.state.blueprints && this.state.blueprints[entry.type];
        if (!bp) return { mineResist: H.resistBase, cutResist: H.cutResistBase };
        const t = this.computeCompoundTags(bp) || {};
        const mineResist = H.resistBase + (t.härte || 0) * H.resistFromHärte + (t.dichte || 0) * H.resistFromDichte;
        const cutResist =
            H.cutResistBase + (t.härte || 0) * H.cutResistFromHärte + (t.dichte || 0) * H.cutResistFromDichte;
        return { mineResist, cutResist };
    }

    // Die EINE Tauglichkeit: das Gerät nutzt seinen BESTEN Kanal (max aus Wucht und Schärfe).
    // Tempo (Fortschritt/Hieb), Stamina (invers) und Ertrag (∝ Tauglichkeit) folgen DERSELBEN Zahl.
    _harvestFitnessFromResist(res) {
        const H = AnazhRealm.HARVEST;
        const prof = this._implementProfile();
        const mineFit = prof.minePower / Math.max(0.1, res.mineResist);
        const cutFit = prof.cutPower / Math.max(0.1, res.cutResist);
        const fit = Math.max(mineFit, cutFit);
        const progress = Math.min(H.maxStrikeProgress, Math.max(H.minStrikeProgress, fit * H.strikeScale));
        const stamina = Math.min(
            H.maxStrikeStamina,
            Math.max(H.minStrikeStamina, H.strikeStaminaBase / Math.max(0.12, fit))
        );
        // Floor → SOCKEL: wer den Bruch erarbeitet, erntet mindestens yieldMin — sonst bricht die Faust den
        // Baum nach vielen Hieben und bekommt nichts. Untauglichkeit bestraft weiter über Tempo + Stamina.
        const yieldMult = Math.max(
            H.yieldMin,
            Math.min(1, Math.max(0, (fit - H.yieldFloorRatio) / (1 - H.yieldFloorRatio)))
        );
        return {
            minePower: prof.minePower,
            cutPower: prof.cutPower,
            mineFit,
            cutFit,
            fit,
            progress,
            stamina,
            yieldMult,
            channel: cutFit > mineFit ? "cut" : "mine",
        };
    }

    _harvestFitness(entry) {
        return this._harvestFitnessFromResist(this._architectureResistance(entry));
    }

    // Ein Abbau-HIEB: Fortschritt akkumuliert am Eintrag (∝ Tauglichkeit), jeder Hieb kostet Stamina
    // (invers zur Effizienz, pfad); bei Vollendung fällt das Bauwerk + lootet. Halten → _tickHarvest.
    // true, solange der Hieb zählt; false bei Erschöpfung.
    _strikeArchitecture(entry) {
        if (!entry) return false;
        // WERKZEUG-WAND (_geraetVerbraucht): ein verbrauchtes Gerät schlägt nicht — VOR der Stamina-Wand (kaputt kostet
        // nichts), modus-unabhängig (schöpfer darf reparieren, nicht mit Kaputtem arbeiten); die Hand verbraucht nie.
        const heldBp = this._heldImplementBlueprint();
        if (this._geraetVerbraucht(heldBp, "Abbauen")) return false;
        const fit = this._harvestFitness(entry);
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        if (mode === "pfad") {
            const have = (this.state.player && this.state.player.stamina) || 0;
            if (have < fit.stamina) {
                this.log(`Abbauen: zu erschöpft (${Math.round(have)} Ausdauer).`, "INFO");
                return false;
            }
            this.state.player.stamina = Math.max(0, have - fit.stamina);
        }
        // wear zehrt zusätzlich zur Stamina, modus-unabhängig — sonst wäre Werkzeug im frieden ein Perpetuum.
        // Die Wand oben verhindert negative wear.
        // Derselbe Verschleiß wie im Kampf (_kampfVerschleiss). Kein Stat-Neubau: kein Stat liest wear (der Faktor
        // _wearStatFactor wirkt im Treffer-Schaden).
        this._kampfVerschleiss(heldBp);
        entry.harvestProgress = (entry.harvestProgress || 0) + fit.progress;
        if (entry.harvestProgress < 1) return true; // der Hieb zählt — das Bauwerk steht noch
        const archId = entry.id;
        const harvest = this.harvestArchitecture(entry, "player", fit.yieldMult);
        if (harvest && harvest.materials) {
            const parts = [];
            for (const [mat, n] of Object.entries(harvest.materials)) {
                if (n > 0 && this.addMaterialToInventory(mat, n)) parts.push(`${n}× ${mat}`);
            }
            this.log(
                `Abgebaut: ${harvest.blueprint} → ${parts.join(", ") || "(zu untauglich — kein Material)"}`,
                "INFO"
            );
        }
        if (
            typeof archId === "string" &&
            this.state.p2p &&
            this.state.p2p.enabled &&
            typeof this.p2pBroadcastDsl === "function"
        ) {
            this.p2pBroadcastDsl(["remove_architecture", archId]);
        }
        return true;
    }

    // V17.55 W1 — HALTEN-zum-Abbauen: solange die Abbau-Taste gehalten wird (+ Pointer-Lock,
    // Inventar und Schubladen zu), wird in der strikeInterval-Kadenz nachgesetzt — mit DEMSELBEN Verb wie beim Drücken
    // (die Maus-Absicht, p._mausVerb): der Hieb schlägt weiter, auch wenn der Stoß das Tier aus dem Fadenkreuz schob.
    _tickHarvest() {
        const p = this.state.player;
        if (!p || !p.breakHeld) return;
        if (!this.state.isPointerLocked || this.state.inventoryOpen || this._uiSchubladeOffen()) {
            p.breakHeld = false;
            return;
        }
        const now = performance.now() / 1000;
        const last = Number.isFinite(p.lastHarvestStrikeAt) ? p.lastHarvestStrikeAt : -Infinity;
        if (now - last < AnazhRealm.HARVEST.strikeIntervalSec) return;
        p.lastHarvestStrikeAt = now;
        this.tryMouseBreak(p._mausVerb || undefined);
    }

    // DIE MAUS-ABSICHT (Welle L 06.10., Klasse Q9) — der EINE Dispatcher des linken Klicks. Beim DRÜCKEN liest er das
    // Ziel am Fadenkreuz und das gehaltene Gerät: Kreatur in Nahkampf-Weite vom SCHULTERGELENK (nie von der Kamera: in
    // der 3rd-Person lagen 8,1 m zwischen Kamera und Hirsch, Tor 6 m) → Hieb · Bau → Abbau · Klein-Flora → Pflücken ·
    // sonst gräbt nur ein Grab-Gerät (Spaten, Schaufel, Spitzhacke) oder die leere Hand; jedes andere Gerät schwingt
    // ins Leere (Luftschlag). `gehalten` = das Verb des Drückens (der Halte-Tick): es wiederholt sich, nie ein anderes —
    // ein Hieb bleibt Hieb, ein gefallener Bau beendet das Abbauen. Vorher: 3rd-Person 10 Klicks → 0 Schwünge,
    // 8 Krater; 1st-Person grub der Halte-Tick nach dem Stoß (6 Krater auf 10 Klicks).
    tryMouseBreak(gehalten) {
        // Ein gehaltener Bogen beansprucht den Klick VOR Nahkampf/Abbau.
        // Buch kalt / kein Bogen → die Pfade darunter laufen unverändert.
        const bogenRec = this._heldBogenRecipe();
        if (bogenRec) {
            const bGate = this._mouseActionStaminaGate();
            if (!bGate.ok) {
                this.log(`Schuss: zu wenig Stamina (${bGate.have}/${bGate.cost}).`, "INFO");
                return false;
            }
            // Halten spannt (der Harvest-Kadenz-Tick spannt nicht neu), Loslassen löst (_bogenRelease skaliert
            // v0 mit dem Auszug-Anteil). Kern kalt → auszugSec 0 → sofort voller Schuss.
            const AB = AnazhRealm._arenaGesetz().bogen;
            if (!(AB.auszugSec > 0)) return this._beginPlayerShot(bogenRec);
            const pB = this.state.player;
            if (pB._bogenDraw) return true; // spannt schon (Halte-Tick)
            const nowB = performance.now() / 1000;
            if (Number.isFinite(pB._shotCooldownUntil) && nowB < pB._shotCooldownUntil) return false;
            pB._bogenDraw = {
                start: nowB,
                fovRest: this.state.camera && Number.isFinite(this.state.camera.fov) ? this.state.camera.fov : null,
            };
            return true;
        }
        // V17.54 Kampf D — das NÄCHSTE Ziel gewinnt: eine Kreatur in Angriffs-Reichweite UND näher als eine
        // Architektur wird ANGEGRIFFEN statt abgebaut. _pickCreatureAtCrosshair liefert {creature, point} (far 30);
        // das Nahkampf-Tor misst vom Schultergelenk des Spielers. EINE REICHWEITE AUS DER WAFFE (Welle LF, Posten 3): das
        // Tor liest, was die Klinge fegt (_kampfSchwungRahmen: Arm und Gerät ab der Schulter, die so gebeugt misst wie im Schwung —
        // _kampfZielAbstand; dazu der Klingen-Radius) — vorher wählte es „hieb" bis zum Deckel 6 m,
        // die Klinge reichte 2,46 m: am Hang 9 Schwünge, 0 Treffer, kein Hinweis. Steht das Tier unter dem Fadenkreuz
        // jenseits der Klinge, nennt der Spieler-Kanal beim Drücken die Reichweite (der Klick bleibt ein Luftschlag).
        // DIE EINE ABSICHT DES KLICKS (K13 Runde 2): das Fadenkreuz nennt das Verb, der Schwung-Kegel richtet nur den Hieb.
        // Ein Leib auf dem Strahl vor dem Bauwerk heißt hieb; sonst nennt das Ziel des Strahls sein Verb — das Bauwerk abbau,
        // die Blüte pflücken, der Boden vor einem Grab-Gerät graben. Liegt dieses Ziel in Arm-Länge (FORAGE.reach ab dem Anfang
        // des Strahls, dieselbe Länge, die der Streu-Pick fasst), gilt es; liegt es dahinter oder fehlt es, wählt der Kegel
        // (_kampfKegelZiel) das Tier in Klingen-Reichweite, und der Klick wird sein Hieb. Vorher maß der Kegel den Kamera-Abstand
        // seines Punkts NEBEN dem Strahl gegen das Bauwerk AUF ihm, und Blüte und Boden fragte er nie: Abbau, Pflücken und Graben
        // neben einem ruhigen Wildtier schlugen das Tier (Langschwert, Blick −0,5 rad: abbau → hieb 35,5). Steht das Tier unter dem
        // Fadenkreuz jenseits der Klinge, bleibt der Klick ein Luftschlag mit dem Hinweis — nie ein Pflücken oder Graben dahinter.
        const pick = this._pickArchitectureAtCrosshair();
        let verb = null;
        let zuWeit = null;
        let creaturePick = null;
        let ort = null; // der Punkt des Ziels auf dem Strahl (Bauwerk · Blüte · Boden)
        let flora = null;
        let boden = null;
        const pmB = this.state.playerMesh;
        const R = pmB ? this._kampfSchwungRahmen(this._torRahmen || (this._torRahmen = {})) : null;
        const klinge = R ? R.reach + AnazhRealm._arenaGesetz().schwung.bladeRadiusM : 0;
        const unter = pmB ? this._pickCreatureAtCrosshair() : null;
        if (unter && unter.point) {
            const creatureDist = this.state.camera.position.distanceTo(unter.point);
            const archDist = pick && pick.point ? this.state.camera.position.distanceTo(pick.point) : Infinity;
            if (creatureDist <= archDist) {
                const nahDist = this._kampfZielAbstand(R, unter.point);
                verb = "hieb";
                if (nahDist <= klinge) creaturePick = unter;
                else zuWeit = { d: nahDist, klinge };
            }
        }
        if (!verb) {
            if (pick && pick.entry) {
                verb = "abbau";
                ort = pick.point;
            } else if ((flora = this._pickScatterAtCrosshair())) {
                // S6-B (V18.133) — FORAGING vor dem Graben: wer auf die Blüte zielt, will sie, kein Loch darunter
                verb = "pfluecken";
                ort = flora.point;
            } else if (this._geraetGraebt(this._heldImplementBlueprint())) {
                verb = "graben";
                boden = this._raycastWorldHit(30);
                if (boden.hit) ort = boden;
            }
            const F = ort ? this._fadenkreuzStrahl() : null;
            const inArm = !!F && Math.hypot(ort.x - F.o.x, ort.y - F.o.y, ort.z - F.o.z) <= AnazhRealm.FORAGE.reach;
            const tier = pmB && !inArm ? this._kampfKegelZiel(R, klinge) : null;
            if (tier) {
                verb = "hieb";
                creaturePick = tier;
            } else if (!verb) verb = "hieb";
        }
        const pV = this.state.player;
        if (gehalten) {
            if (verb !== gehalten) {
                if (gehalten !== "hieb") return false; // das Ziel des Drückens ist fort: das Halten endet hier
                verb = "hieb";
            }
        } else if (pV) pV._mausVerb = verb;
        if (verb === "hieb") {
            const gate = this._mouseActionStaminaGate();
            if (!gate.ok) {
                this.log(`Angriff: zu wenig Stamina (${gate.have}/${gate.cost}).`, "INFO");
                return false;
            }
            if (zuWeit && !gehalten) {
                const bpW = this._heldImplementBlueprint();
                const was = bpW ? String(bpW.label || bpW.name).split(/\s[·—(]/)[0] : "Deine Faust";
                const m = (x) => x.toFixed(1).replace(".", ",");
                this._spielerSagt(
                    `Zu weit: ${was} reicht ${m(zuWeit.klinge)} m — das Ziel steht ${m(zuWeit.d)} m vor deiner Schulter.`
                );
            }
            // der Schwung löst das Ziel in der Strike-Phase auf (Kreatur → Treffer, Leere → Luftschlag)
            return this._playerAttackCreature(creaturePick);
        }
        // V17.55 W1 — Abbauen kostet jetzt MÜHE: ein Bauwerk wird per Hieb-Fortschritt
        // abgetragen (Tempo/Stamina/Ertrag ∝ Werkzeug-vs-Material), kein Instant mehr. Der
        // Multi-User-Sync + das Loot + das Gefühl leben in _strikeArchitecture (bei Bruch).
        if (verb === "abbau") return this._strikeArchitecture(pick.entry);
        if (verb === "pfluecken") return this._harvestScatterPick(flora);
        const target = boden || this._raycastWorldHit(30);
        if (!target.hit) {
            this.log("Abbauen: kein Ziel in Reichweite.", "INFO");
            return false;
        }
        // V17.55 W1 — auch der Boden leistet Widerstand: die Stamina pro Grabe-Hieb skaliert
        // invers zur Tauglichkeit (ein gutes Werkzeug gräbt billig, die bloße Faust teuer).
        if ((typeof this.getGameMode === "function" ? this.getGameMode() : "frieden") === "pfad") {
            const digFit = this._harvestFitnessFromResist({
                mineResist: AnazhRealm.HARVEST.terrainResist,
                cutResist: AnazhRealm.HARVEST.terrainCutResist,
            });
            // Stamina ANTEILIG pro Hieb (Σ ≈ Ein-Hieb-Preis): die Mühe der Untauglichkeit ist ZEIT — sonst
            // könnte die Faust kein Loch graben (9 Hiebe × 19 = 173 von 100 Stamina).
            const perStrike = digFit.stamina * Math.min(1, digFit.progress);
            const have = (this.state.player && this.state.player.stamina) || 0;
            if (have < perStrike) {
                this.log(`Graben: zu erschöpft (${Math.round(have)} Ausdauer).`, "INFO");
                return false;
            }
            this.state.player.stamina = Math.max(0, have - perStrike);
            // Graben spricht dieselbe Mühe-Sprache: Fortschritt ∝ Tauglichkeit (Faust mehrere Hiebe, gutes Gerät
            // einer); Reset, wenn das Ziel > 2.5 m wandert. frieden + schöpfer bleiben instant.
            const dig = this.state.player._dig || (this.state.player._dig = { x: 0, y: 0, z: 0, progress: 0 });
            const moved = Math.hypot(target.x - dig.x, target.y - dig.y, target.z - dig.z) > 2.5;
            if (moved) {
                dig.x = target.x;
                dig.y = target.y;
                dig.z = target.z;
                dig.progress = 0;
            }
            dig.progress += digFit.progress;
            if (dig.progress < 1) {
                this.log(`Graben: ${Math.round(dig.progress * 100)} % — der Boden leistet Widerstand.`, "INFO");
                return true;
            }
            dig.progress = 0;
        }
        // Der Grabe-Hieb schnitzt das 3D-Dichte-Feld (echtes Loch). carveRadius 3.5 m spannt ~140 Voxel —
        // eine begehbare Mulde; kleiner wäre eine Nadel.
        const carveRadius = 3.5;
        // Graben läuft durch dslRun (source:"human" → p2pBroadcastDsl), damit Mitspieler dieselbe Mulde
        // sehen; lokal ruft voxel_carve dieselbe carveVoxelSphere. Der DSL-Op ist der EINE Broadcast-Anker
        // — ein direkter API-Call wäre eine Sync-Lücke.
        this.dslRun(["voxel_carve", target.x, target.y, target.z, carveRadius], { source: "human" });
        // Der Boden gibt Materie wie harvestArchitecture: Material aus dem Welt-Affinitäts-Feld am Grabe-Ort
        // (was man SIEHT, bekommt man), geschichtet nach Tiefe (target.y — tief gibt Stein, kein Humus).
        // Yield ist LOKAL, nicht im DSL-Op — ein gebroadcastetes voxel_carve füllt kein fremdes Inventar.
        const digMat = this._terrainMaterialAt(target.x, target.z, target.y);
        const digUnits = Math.max(1, Math.min(10, Math.round(carveRadius * 1.4)));
        if (this.addMaterialToInventory(digMat, digUnits)) {
            this.log(`Gegraben: ${digUnits}× ${digMat}`, "INFO");
            const matDef = this.state.materials && this.state.materials[digMat];
            if (matDef && typeof this.playInventoryHoverPing === "function") {
                this.playInventoryHoverPing(matDef.tags);
            }
        } else {
            this.log(`Gegraben (${digMat}), aber das Inventar ist voll.`, "INFO");
        }
        return true;
    }

    // Welle 6.H Phase 2F.3 — Raycast-Picker für Kreaturen (analog
    // _pickArchitectureAtCrosshair). Iteriert state.creatures, traverse
    // pro Group → Mesh-Liste. Reverse-Map über Map<Mesh, Creature>.
    _pickCreatureAtCrosshair() {
        if (!this.state.scene || !Array.isArray(this.state.creatures)) return null;
        const F = this._fadenkreuzStrahl();
        if (!F) return null;
        const meshes = [];
        const creatureByMesh = new Map();
        for (const c of this.state.creatures) {
            if (!c) continue;
            c.traverse((node) => {
                if (node.isMesh) {
                    meshes.push(node);
                    creatureByMesh.set(node, c);
                }
            });
        }
        if (!meshes.length) return null;
        if (!this._tmpRaycaster) this._tmpRaycaster = new THREE.Raycaster();
        this._tmpRaycaster.set(F.o, F.d);
        this._tmpRaycaster.far = 30;
        const intersects = this._tmpRaycaster.intersectObjects(meshes, false);
        if (!intersects.length) return null;
        let node = intersects[0].object;
        while (node && !creatureByMesh.has(node)) node = node.parent;
        const creature = node ? creatureByMesh.get(node) : null;
        return creature ? { creature, point: intersects[0].point } : null;
    }

    // DER SCHWUNG-KEGEL DER ZIEL-WAHL (K13, schmiede ARENA.schwung.zielKegelUntenRad — Welt und Arena-Lab lesen dieselbe Zeile):
    // liegt kein Leib unter dem Fadenkreuz, wählt der Hieb den Leib im Sektor, den die Klinge fegt — von der Schulter im Stand (den
    // Ausfall tritt der Hieb erst nach dem Ziel an: _kampfKlingenAchse) jeder Punkt der Treffer-Gestalt (Enden und Mitte jeder
    // Glied-Kapsel, _kreaturTrefferGlieder) in der Reichweite der Klinge (im Ausfall gemessen wie das Verb-Tor:
    // _kampfZielAbstand), dessen Gier höchstens arcHalfRad neben dem Fadenkreuz liegt und
    // dessen Neigung höchstens zielKegelUntenRad darunter (nie darüber, nie hinter dem Rücken). Gewählt wird das lebende Tier,
    // dessen Punkt dem Fadenkreuz am nächsten liegt (der Winkel), und dieser Punkt: durch ihn geht die Klinge
    // (_kampfZielMerken). Das Grob-Tor (_trefferErreichbar) filtert jeden Leib außer Reichweite, bevor die Gestalt rechnet.
    // Rückgabe { creature, point } oder null.
    _kampfKegelZiel(R, klinge) {
        const cs = this.state.creatures;
        const F = this._fadenkreuzStrahl();
        const pm = this.state.playerMesh;
        if (!F || !pm || !Array.isArray(cs) || !cs.length) return null;
        const K = AnazhRealm._arenaGesetz().schwung;
        const S = this._kampfSchulter(R, pm.rotation.y, 0, 0, 0, this._kegelS || (this._kegelS = {}));
        const gF = Math.atan2(F.d.x, F.d.z);
        const nF = Math.asin(Math.max(-1, Math.min(1, F.d.y)));
        const P = this._kegelP || (this._kegelP = new THREE.Vector3());
        let best = null;
        let bestW = Infinity;
        for (const c of cs) {
            if (!c || !this._trefferErreichbar(c, S.x, S.z, klinge)) continue;
            // ein Begleiter (ein Auftrag des Spielers: folgen, warten, sammeln) wird nie im Kegel gewählt — wer ihn schlagen
            // will, zielt auf ihn; sonst träfe das Pflücken neben dem folgenden Hund den Hund
            const auftrag = this._getCreatureTask(c);
            if (auftrag && auftrag.name !== "wander") continue;
            const gl = this._kreaturTrefferGlieder(c);
            if (!gl) continue;
            this._leibMatrix(c);
            for (const g of gl) {
                for (let k = 0; k <= 2; k++) {
                    P.copy(g.a)
                        .lerp(g.b, k / 2)
                        .applyMatrix4(g.anker.matrixWorld);
                    const h = Math.hypot(P.x - S.x, P.z - S.z);
                    let dg = Math.atan2(P.x - S.x, P.z - S.z) - gF;
                    dg = Math.atan2(Math.sin(dg), Math.cos(dg));
                    const dn = Math.atan2(P.y - S.y, h) - nF;
                    if (Math.abs(dg) > K.arcHalfRad || dn > 0 || dn < -K.zielKegelUntenRad) continue;
                    const w = Math.hypot(dg, dn);
                    if (w >= bestW || this._kampfZielAbstand(R, P) > klinge) continue;
                    bestW = w;
                    best = { creature: c, point: P.clone() };
                }
            }
        }
        return best;
    }

    // Welle 6.H Phase 2F.3 — Inventar-Konsum für Konsumables. Findet ersten
    // Blueprint-Slot mit `kind:"blueprint"` + matching Name + count > 0, ziehe
    // 1 ab. Slot wird null bei count=0. Liefert true bei Erfolg, false sonst.
    _consumeBlueprintFromInventory(blueprintName) {
        const inv = this.state.player && this.state.player.inventory;
        if (!Array.isArray(inv)) return false;
        for (let i = 0; i < inv.length; i++) {
            const slot = inv[i];
            if (slot && slot.kind === "blueprint" && slot.blueprintName === blueprintName && (slot.count || 0) > 0) {
                slot.count = (slot.count || 0) - 1;
                if (slot.count <= 0) inv[i] = null;
                return true;
            }
        }
        return false;
    }

    // Welle 6.H Phase 2F.3 — Modus-Gate für Konsumable-Übergabe an Kreatur.
    // pfad: muss aus Inventar verbraucht werden. frieden/schöpfer: kostenlos.
    _consumableInventoryGate(blueprintName) {
        const mode = typeof this.getGameMode === "function" ? this.getGameMode() : "frieden";
        if (mode !== "pfad") return { ok: true, free: true };
        const consumed = this._consumeBlueprintFromInventory(blueprintName);
        return consumed ? { ok: true, free: false } : { ok: false, reason: "no_potion_in_inventory" };
    }

    tryMousePlace() {
        // DIE MAUS-ABSICHT (Welle L, Q9) — rechts: ein Bauwerk in der Hand geht in den Bau-Modus (die Hand wird frei;
        // die Eiche lag 7,8 × 8,8 × 6,4 m in der Hand, RMB schüttete auf), aufgeschüttet wird nur mit einem Grab-Gerät
        // oder der leeren Hand — eine Waffe schüttet nie auf (RMB mit Schwert: 3 × voxel_fill r 3,5 m, Spieler +4 m).
        const heldP = this._heldImplementBlueprint();
        const bauModusAn = this.state.buildMode && this.state.buildMode.active;
        if (!bauModusAn && heldP && this._isPlaceableBlueprint(heldP)) {
            this.equipHeld(null);
            const bauRes = this._bauModusFuer(heldP.name);
            if (!bauRes.ok) this._spielerSagt(`${heldP.label || heldP.name}: ${this._machTorHint(bauRes)}`);
            return bauRes.ok;
        }
        // Phase 3b — ist das Voxel-Terrain aktiv und KEIN Bau-Modus aktiv,
        // schüttet der RMB Boden auf (das Gegenstück zum LMB-Graben).
        if (this.state.voxelTerrainActive && !bauModusAn) {
            if (!this._geraetGraebt(heldP)) return false; // Waffe/Werkzeug: kein Aufschütten (Stich: nach v1.0)
            const fillGate = this._mouseActionStaminaGate();
            if (!fillGate.ok) {
                this.log(`Aufschütten: zu wenig Stamina (${fillGate.have}/${fillGate.cost}).`, "INFO");
                return false;
            }
            const fillHit = this._raycastWorldHit(30);
            if (!fillHit.hit) {
                this.log("Aufschütten: kein Ziel in Reichweite.", "INFO");
                return false;
            }
            // Phase 3c — im pfad-Modus kostet das Aufschütten Material
            // (der Erhaltungs-Kreis); in frieden + schöpfer ist es frei.
            const matGate = this._voxelFillGate();
            if (!matGate.ok) {
                this.log("Aufschütten: kein Material im Inventar — erst graben.", "INFO");
                return false;
            }
            this._consumeMouseStamina();
            // Aufschütten via dslRun (voxel_fill, broadcastet; lokal fillVoxelSphere). Der Material-Konsum
            // (matGate oben) bleibt lokal — Inventar-Geste, nicht broadcastbar.
            this.dslRun(["voxel_fill", fillHit.x, fillHit.y, fillHit.z, 3.5], { source: "human" });
            if (!matGate.free) this.log(`Aufgeschüttet (${matGate.cost}× Material verbraucht).`, "INFO");
            return true;
        }
        if (!this.state.buildMode || !this.state.buildMode.active) return false;
        const gate = this._mouseActionStaminaGate();
        if (!gate.ok) {
            this._spielerSagt(`Setzen: zu wenig Ausdauer (${gate.have}/${gate.cost}) — kurz verschnaufen.`);
            return false;
        }
        // role:"consumable" + RMB-Raycast trifft eine Kreatur → Trank-Übergabe statt Bau. Phantom +
        // Bau-Modus bleiben aktiv; erst ESC oder Slot-Wechsel verlässt ihn.
        const bpName = this.state.buildMode.blueprintName;
        const bp = bpName && this.state.blueprints && this.state.blueprints[bpName];
        if (bp && bp.role === "consumable") {
            const hit = this._pickCreatureAtCrosshair();
            if (!hit || !hit.creature) {
                this.log(`Übergabe: keine Kreatur am Fadenkreuz.`, "INFO");
                return false;
            }
            const invGate = this._consumableInventoryGate(bpName);
            if (!invGate.ok) {
                this.log(`Übergabe: kein „${bpName}" im Inventar.`, "INFO");
                return false;
            }
            const result = this.activateCreatureConsumable(hit.creature, bpName);
            if (!result.ok) {
                this.log(`Übergabe fehlgeschlagen: ${result.reason || "unbekannt"}`, "INFO");
                return false;
            }
            const cname = (hit.creature.userData && hit.creature.userData.name) || "Kreatur";
            this.log(`Gabst „${bpName}" an ${cname}.`, "INFO");
            this._consumeMouseStamina();
            if (typeof this.renderInventoryUI === "function") this.renderInventoryUI();
            return true;
        }
        if (this.confirmBuild()) {
            this._consumeMouseStamina();
            return true;
        }
        return false;
    }
}
_stammZonen(AnazhRealm, [AnazhRealm_kampf]);

// ===== ATLAS · Kampf — Außen-Konstanten =====
// ═══ KAMPF-GEFÜHL — DIE GESETZE DES SCHWUNGS ═══
// Die EINE Schwung-Dauer-Quelle ist die gerechnete Trägheit (_swingDynamics: I = Σ m·r² um den
// Griff), Dauer = dauerProSqrtI·√I, geklemmt; Cooldown/HUD/Werkstatt lesen sie (Kreaturen behalten
// ihr tag-emergentes attackSpeed). Dauer, Hieb-Geometrie, Reichweite, Stoß/Hit-Stop/Dip und
// Pfeil-Flug-Physik wohnen im schmiede-Gesetzbuch (ARENA.schwung/.gefuehl/.bogen/.guete) — alle
// Konsumenten lesen _arenaGesetz(), fail-closed. Die Mechanik hält gate:kampf-gefuehl.
// maxPfeile ist Wirts-Infrastruktur (Perf-Deckel lebender Pfeile), kein Gefühls-Gesetz:
AnazhRealm.MAX_PFEILE = 16;
// Der Treffer-Weg (_kampfTrefferWeg) tastet jede Glied-Kapsel in so vielen Schritten ab — Wirts-Auflösung, kein Gefühls-
// Gesetz; je Treffer, nie je Frame.
AnazhRealm.TREFFER_WEG_PROBEN = 6;
// Die Optik des EINEN Schwungs (_kampfSchwungLage, _applyKampfSchwungPose) — Wirts-Pose, keine Treffer-Größe: im Windup hebt
// der Arm die Klinge um KAMPF_AUSHOLEN_RAD über die Neigung des Strikes (an dessen Anfang wieder 0), der Rumpf folgt der Gier
// des Bogens mit diesem Anteil.
AnazhRealm.KAMPF_AUSHOLEN_RAD = 0.5;
AnazhRealm.KAMPF_RUMPF_DREH = 0.4;
// Die Beuge des Rumpfs beim Schlag nach unten (_kampfBeuge): je rad Neigung unter der Schulter KAMPF_BEUGE_K rad, höchstens
// KAMPF_BEUGE_MAX (34°) — der Schwertkämpfer beugt sich zum tiefen Ziel; Pose und Treffer-Volumen beugen gleich.
AnazhRealm.KAMPF_BEUGE_K = 0.6;
AnazhRealm.KAMPF_BEUGE_MAX = 0.6;
// Der Ausfall des Hiebs (_kampfSchulter, die Hülle des Leibs in der Pose): der Leib tritt im Strike so weit nach vorn — ein
// halber Schritt. Die Reichweite einer Klinge ist Ausfall + Arm + Klinge vor der Hand (Langschwert 2,1 m ab der Schulter).
AnazhRealm.KAMPF_AUSFALL_M = 0.45;
// Der Abstand zweier Lagen, aus denen das Tempo eines Klingen-Punkts fällt (_kampfSchlagTempo) — Wirts-Auflösung.
AnazhRealm.KAMPF_TEMPO_DT = 0.002;
// Die Züge, in denen die Pose Schulter und Handgelenk auf die Achse der Klinge legt (_applyKampfSchwungPose) — Wirts-Auflösung.
AnazhRealm.KAMPF_POSE_ZUEGE = 3;
// Wie nah die Klinge am Punkt unter dem Fadenkreuz vorbeigehen muss, damit er getroffen ist (_kampfKlingenKontakt) — über den
// Klingen-Radius hinaus die halbe Strecke eines Teil-Schritts.
AnazhRealm.KAMPF_ZIEL_SPIEL_M = 0.04;
// Die Stetigkeit des Sweeps (_kampfSweepTick): je Teil-Schritt läuft die Spitze der Klinge höchstens so weit — unter dem
// Durchmesser des dünnsten Glieds samt Klingen-Radius, kein Glied fällt zwischen zwei Schritte. Wirts-Auflösung.
AnazhRealm.KAMPF_SWEEP_SCHRITT_M = 0.08;
// Die Weite des Fadenkreuz-Punkts (_blickZiel): der Pfeil zielt auf den Welt-Treffer des Blicks bis hierhin, dahinter
// auf den Punkt in dieser Weite (die Parallaxe Mündung ↔ Auge fällt dort unter 0,3°).
AnazhRealm.BLICK_ZIEL_M = 80;
// ═══ ARENA-GEFÜHL — DER EINE GEFÜHLS-LESER ═══
// Schwung-Konstanten · energie-skalierter Hit-Stop/Dip · die EINE Bogen-Physik + Auszug ·
// Waffen-Güte aus __schmiedeCore.ARENA. Fail-closed; Memo nur im Erfolgs-Fall.
AnazhRealm._arenaGesetz = function () {
    if (AnazhRealm._arenaGesetzMemo) return AnazhRealm._arenaGesetzMemo;
    const a = AnazhRealm.Gesetz("schmiede:ARENA", null);
    // Die Gültigkeits-Wand deckt je Block EIN Zensus-Feld mit: ein ALTER
    // Kern ohne die gereisten Zeilen ist ein BRUCH, nie ein Misch-Gesetz
    // aus halb Kern / halb undefined.
    if (
        a &&
        a.schwung &&
        a.gefuehl &&
        a.bogen &&
        Number.isFinite(a.schwung.dauerProSqrtI) &&
        Number.isFinite(a.schwung.windupFrac) &&
        Number.isFinite(a.schwung.zielKegelUntenRad) &&
        Number.isFinite(a.gefuehl.wucht) &&
        Number.isFinite(a.gefuehl.pProKb) &&
        Number.isFinite(a.bogen.muendungM)
    ) {
        AnazhRealm._arenaGesetzMemo = a;
        return a;
    }
    return AnazhRealm._kernPflichtBruch("schmiede:ARENA");
};

// Welle 6.A6 — Maus-Aktionen (abbauen/platzieren): der Kosten-Satz wohnt im
// koerperstudio-Gesetzbuch (fx.bewegung.aktionAusdauer), Leser _aktionAusdauer;
// der Konstanten-Zwilling MOUSE_ACTION_STAMINA_COST ist gefallen (Kern-Pflicht).

// Abbauen kostet substanz-gebundene MÜHE (mehrere Hiebe). EINE Tauglichkeit (Grab-Kraft des
// gehaltenen Dings vs Material-Widerstand) dirigiert vier Kanäle: TEMPO (Fortschritt/Hieb), STAMINA
// (invers zur Effizienz), ERTRAG (∝ Tauglichkeit, mit Floor → falsches Werkzeug gibt nichts), GEFÜHL
// (_feelAction skaliert mit dem Ertrag). Kein Slider — die Substanz entscheidet.
AnazhRealm.HARVEST = Object.freeze({
    // V17.56 W2 — das FORM-getriebene Doppel-Profil. WUCHT (mine) ∝ STUMPFHEIT × (härte+dichte);
    // SCHÄRFE (cut) ∝ spitze Form × härte. So wird DIESELBE harte Materie zur Keule ODER zur Klinge.
    handMinePower: 0.5, // die bloße Faust — schwach beim Wuchten
    handCutPower: 0.4, // die bloße Faust — schwach beim Schneiden (pflückt nur ganz Weiches)
    toolMineBase: 0.5,
    toolCutBase: 0.4,
    mineFromHärte: 1.6, // ein hartes stumpfes Gerät bricht Hartes
    mineFromDichte: 2.2, // die MASSE wuchtet (eine schwere Keule) — der dominante Mine-Term
    cutFromSharp: 3.4, // die SCHÄRFE (spitze Form × härte) schneidet
    resistBase: 0.7, // Wucht-Widerstand: jedes Material leistet etwas
    resistFromHärte: 2.2, // hartes Material widersteht der Wucht
    resistFromDichte: 1.3, // dichtes Material widersteht der Wucht
    cutResistBase: 0.5, // Schneid-Widerstand
    cutResistFromHärte: 6.0, // HARTES ist UNschneidbar (Fels) — der dominante Cut-Resist-Term: eine Klinge gräbt Fels miserabel
    cutResistFromDichte: 0.7, // dichtes etwas
    strikeScale: 0.55, // Fortschritt/Hieb = clamp(Tauglichkeit · strikeScale, min, max)
    minStrikeProgress: 0.06, // selbst die Faust an Granit macht WINZIGEN Fortschritt (nie 0 = Hänger)
    maxStrikeProgress: 1.0, // ein überlegenes Werkzeug ein-hiebt Weiches
    strikeStaminaBase: 4, // Stamina/Hieb-Basis (pfad) ÷ Tauglichkeit (INVERS zur Effizienz)
    minStrikeStamina: 2,
    maxStrikeStamina: 30, // ein falsches Werkzeug verbrennt Ausdauer für fast nichts
    yieldFloorRatio: 0.35, // unter dieser Tauglichkeit greift nur noch der Sockel (oberhalb rampt der Ertrag auf 1)
    yieldMin: 0.34, // M6 (Befund 18) — der ERTRAGS-SOCKEL: wer den Bruch erarbeitet, bekommt mindestens 1/3 (die Faust holt das Grobe; Feines braucht Werkzeug)
    strikeIntervalSec: 0.2, // Halten → Auto-Hieb-Kadenz (5 Hiebe/s) → kontinuierliches Mahlen
    terrainResist: 2.4, // der Boden-Wucht-Widerstand (W1: konstant; später aus der lokalen Dichte)
    terrainCutResist: 9, // der Boden wird GEWUCHTET, nicht geschnitten (Schärfe greift nicht)
});

// S1 (kampf-plan §11.7) — bis zu dieser Bauplan-Spannweite (m) liest die Werkstatt die
// in-der-Hand-Lesart (Klinge/Brecher); größere Baupläne sind Bauwerke/Strukturen (kein
// „Brecher" auf einem Dorf). Browser-justierbar (Hand bis Großschwert ja, Dorf/Tempel nein).
AnazhRealm.IMPLEMENT_GRASP_SPAN_M = 6;
AnazhRealm.WEAR_KAPUTT_SCHWELLE = 0.05; // unter 5 % wear → Hieb scheitert, Reparatur-Aufruf
