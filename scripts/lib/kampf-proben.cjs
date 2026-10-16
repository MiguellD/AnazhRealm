"use strict";
// scripts/lib/kampf-proben.cjs — die Seiten-Probe der Leben-Prüfung „Kampf“ (gate:kampf-gefuehl), am Domänen-Tag Kampf geteilt
// (Datei-Decke 4 000, PFLICHT-OFFEN D(3)): eine Seiten-Funktion, die scripts/diag-kampf-gefuehl.cjs per page.evaluate fährt.

// ── WELLE L — die Proben der Leben-Prüfung „Kampf" (Seiten-Funktion; läuft auf JEDEM Stand: fehlt eine Naht, misst
// die Probe das Verhalten trotzdem — so ist die Linse auf dem Vorher-Stand rot und benennt den Defekt) ──
async function WELLE_L() {
    const r = window.anazhRealm,
        s = r.state,
        A = r.constructor,
        p = s.player,
        pm = s.playerMesh;
    const w = { z: {}, c: {}, fehler: [] };
    const fn = (n) => typeof r[n] === "function";
    const V3 = () => new THREE.Vector3();
    const grad = (rad) => (rad * 180) / Math.PI;
    const saved = {
        yaw: s.yaw,
        pitch: s.pitch,
        cam: s.cameraMode,
        held: p.equipped ? p.equipped.held : null,
        swing: p._swing,
        hitStop: p._hitStopUntil,
        mode: r.getGameMode(),
        maxC: s.maxCreatures,
        lock: s.isPointerLocked,
        hp: p.hp,
        grace: p.respawnGraceUntil,
        breakHeld: p.breakHeld,
        hotbar: Array.isArray(s.hotbar) ? s.hotbar.slice() : s.hotbar,
    };
    // ── die mitlaufenden Zähler (rufen IMMER durch; nur die Voxel-Ops werden gezählt statt geschnitzt) ──
    const orig = {
        damageCreature: r.damageCreature,
        juice: r._kampfHitJuice,
        swing: r._beginPlayerSwing,
        dsl: r.dslRun,
        damagePlayer: r.damagePlayer,
    };
    let T = 50000; // die Anzeige-Uhr der Probe (Kamera + Schwung), synthetisch
    const treff = [];
    const juice = [];
    const zaehl = { schwung: 0, carve: 0, fill: 0, gegenwehr: 0 };
    r.damageCreature = function (c, amount, opts) {
        const res = orig.damageCreature.call(this, c, amount, opts);
        const st0 = opts && opts.stoss;
        treff.push({
            c,
            amount,
            src: opts && opts.source,
            t: T,
            ok: !!(res && res.ok),
            stoss: st0 ? { p: st0.p, m: st0.m } : null,
        });
        return res;
    };
    r._kampfHitJuice = function (...a) {
        // neu: (creature, now, urteil, keEigen) — die Zone reist im Urteil; alt: (creature, now, keOpt, zoneKind)
        const z = a[2] && typeof a[2] === "object" ? a[2].zone || null : typeof a[3] === "string" ? a[3] : null;
        const u = a[2] && typeof a[2] === "object" ? a[2] : null;
        juice.push({
            zone: z,
            t: T,
            ke: u && Number.isFinite(u.KE) ? u.KE : null,
            ort: u ? u.ort || null : null,
            eff: u && Number.isFinite(u.eff) ? u.eff : null,
            v: u && Number.isFinite(u.v) ? u.v : null,
        });
        return orig.juice.apply(this, a);
    };
    // die Zähl-Hülle reicht die Argumente durch (das Ziel des Hiebs, Welle LF)
    r._beginPlayerSwing = function (...a) {
        const ok = orig.swing.apply(this, a);
        if (ok) zaehl.schwung++;
        return ok;
    };
    r.dslRun = function (prog, opts) {
        const op = Array.isArray(prog) ? prog[0] : null;
        if (op === "voxel_carve") return (zaehl.carve++, { ok: true });
        if (op === "voxel_fill") return (zaehl.fill++, { ok: true });
        return orig.dsl.call(this, prog, opts);
    };
    r.damagePlayer = function (amount, source) {
        if (source === "gegenwehr") zaehl.gegenwehr++;
        return orig.damagePlayer.call(this, amount, source);
    };
    const tiere = [];
    // JE PRÜFUNG IHR EIGENER ABBRUCH (Welle LF kampf Nachbesserung 2): fehlt einer Prüfung ihre Naht (ein älterer Stand), nennt sie
    // sich mit dem Fehler, und die übrigen laufen weiter — vorher brach die Linse am Basis-Stand mit „_kampfSchwungRahmen is
    // not a function“ ganz ab und nannte keinen Täter.
    const teil = async (name, f) => {
        try {
            await f();
        } catch (e) {
            w.fehler.push(name + " ABBRUCH " + ((e && e.stack) || String(e)).split("\n").slice(0, 2).join(" | "));
        }
    };
    try {
        const kamera = () => {
            T += 0.02;
            r._loopCamera(T);
            s.camera.updateMatrixWorld(true);
        };
        const camDir = () => s.camera.getWorldDirection(V3());
        // Das Fadenkreuz auf einen Welt-Punkt führen wie die Hand des Spielers: Gier und Neigung nachführen, bis der
        // Strahl der ECHTEN Kamera ihn trifft (beide Kamera-Arten; die Neigung in der Spiel-Klemme ±90°).
        // Rückgabe: der Rest-Winkel in Grad (ein unerreichbarer Blick bleibt als Fehler stehen).
        const zielen = (pt) => {
            const fehler = () => {
                kamera();
                const c = s.camera.position;
                const d = camDir();
                const v = V3()
                    .set(pt.x - c.x, pt.y - c.y, pt.z - c.z)
                    .normalize();
                const gy = Math.atan2(v.x, v.z) - Math.atan2(d.x, d.z);
                return {
                    gy: Math.atan2(Math.sin(gy), Math.cos(gy)),
                    gp: Math.asin(Math.max(-1, Math.min(1, v.y))) - Math.asin(Math.max(-1, Math.min(1, d.y))),
                    ang: d.angleTo(v),
                };
            };
            const kl = (x) => Math.max(-Math.PI / 2, Math.min(Math.PI / 2, x));
            for (let it = 0; it < 40; it++) {
                const e = fehler();
                if (e.ang < 2e-4) break;
                s.yaw += e.gy;
                const p0 = s.pitch;
                const e0 = fehler().gp;
                s.pitch = kl(p0 + (p0 > 1.5 ? -0.01 : 0.01));
                const ab = (fehler().gp - e0) / (s.pitch - p0);
                s.pitch = Math.abs(ab) > 1e-6 ? kl(p0 - Math.max(-0.5, Math.min(0.5, e0 / ab))) : p0;
            }
            return grad(fehler().ang);
        };
        const fussY = () => pm.position.y - 0.5;
        const setze = (seele) => {
            s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 8);
            const c = r.spawnCreatureAt(pm.position.x + 300, pm.position.y, pm.position.z + 300, "happy", seele);
            if (c) tiere.push(c);
            return c;
        };
        // vor den Spieler stellen (Breitseite, Füße auf der Fuß-Höhe des Spielers + dy), unverwundbar gezählt
        const stelle = (c, d, seit = 0, dy = 0) => {
            c.position.set(pm.position.x + seit, fussY() + dy, pm.position.z + d);
            c.rotation.set(0, Math.PI / 2, 0);
            c.userData.hp = 1e6;
            c.userData.fearUntil = 0;
            c.userData._steuer = null; // es STEHT: der Steuer-Schritt beginnt neu aus dieser Gier, ohne Lauf und Sprung
            c.userData._hopH = 0;
            c.userData._hopV = 0;
            c.updateMatrixWorld(true);
        };
        const parke = (c) => stelle(c, 60, 60 + tiere.indexOf(c) * 4);
        // der Spieler STEHT auf dem Boden (seine Füße auf der Höhe, auf der die Tiere im Takt stehen): ein Biss braucht den Kopf
        // am Leib, auch in der Höhe (Posten 5). `halte` stellt ihn je Takt zurück, `zurueck` an die Lage davor.
        const amBoden = () => {
            const alt = { x: pm.position.x, y: pm.position.y, z: pm.position.z };
            const P = { x: alt.x, y: r.getTerrainHeightAt(alt.x, alt.z) + A.PLAYER_FOOT_OFFSET, z: alt.z };
            const halte = () => pm.position.set(P.x, P.y, P.z);
            halte();
            return { P, halte, zurueck: () => pm.position.set(alt.x, alt.y, alt.z) };
        };
        const punkt = (c, teil) => {
            c.updateMatrixWorld(true);
            const tb = c.userData._tierBaum;
            const o = teil && tb && tb.teile && tb.teile[teil];
            if (o) return o.getWorldPosition(V3());
            return new THREE.Box3().setFromObject(c).getCenter(V3());
        };
        const schwung = () => {
            p._swing = null;
            p._hitStopUntil = 0;
            const n0 = treff.length,
                j0 = juice.length;
            // der Klick: das Ziel ist der Pick unter dem Fadenkreuz, wie der EINE Dispatcher ihn reicht (tryMouseBreak)
            const ok = r._beginPlayerSwing(r._pickCreatureAtCrosshair());
            if (!ok || !p._swing) return { ok: false, treff: [], juice: [] };
            p._swing.lastT = T;
            for (let k = 0; k < 1200 && p._swing; k++) {
                T += 0.005;
                r._tickKampfSchwung(T);
            }
            return { ok: true, treff: treff.slice(n0), juice: juice.slice(j0) };
        };
        const ausruesten = (name) => {
            const res = r.equipHeld(name);
            if (name && !(res && res.ok)) w.fehler.push("equipHeld " + name + ": " + (res && res.reason));
        };
        const traf = (sw, c) => sw.treff.find((t) => t.c === c && t.src === "player") || null;
        if (fn("setCameraMode")) r.setCameraMode("first");
        if (fn("closeAllDrawers")) r.closeAllDrawers();
        if (s.buildMode && s.buildMode.active && fn("_clearBuildMode")) r._clearBuildMode();

        // ═══ Q8 — TREFFER ═══
        const hirsch = setze("wesen");
        const fuchs = setze("fuchs");
        if (!hirsch || !fuchs) throw new Error("Kreatur-Spawn fehlgeschlagen");
        const L0 = hirsch.scale.x;
        parke(fuchs);
        ausruesten("klinge_langschwert");
        // (T1) die Zone wirkt: Kopf und Hinterlauf desselben Hirschs, dieselbe Klinge
        stelle(hirsch, 1.6);
        w.z.zielKopf = zielen(punkt(hirsch, "headGroup"));
        const sK = schwung();
        stelle(hirsch, 1.6);
        w.z.zielBein = zielen(punkt(hirsch, "hlP"));
        const sB = schwung();
        const aK = traf(sK, hirsch),
            aB = traf(sB, hirsch);
        w.z.zoneKopfBein = aK && aB ? aK.amount / aB.amount : null;
        const jz = [...sK.juice, ...sB.juice];
        w.z.zonen = jz.map((j) => j.zone);
        w.c.zoneJederTreffer = jz.length >= 2 && jz.every((j) => !!j.zone);
        w.c.zoneWirkt = w.z.zoneKopfBein !== null && w.z.zoneKopfBein >= 1.5;
        // (T2) hangab und klein auf gleicher Höhe, je 10 Hiebe mit dem Fadenkreuz auf der Leibes-Mitte: der Hirsch
        // des Befunds (1,6 m, Füße 0,62 m unter deinen — „hangab 2/5"), der Fuchs 1,3 m vor dir 0,6 m tiefer, der
        // kleine Hirsch L 0,64 auf gleicher Höhe („1 aus 10"). Jedes Ziel liegt in der Reichweite der Klinge (Schulter
        // 1,7 m über dem Fuß, Langschwert 2,1 m + Klingen-Radius) — was die Klinge erreicht und das Fadenkreuz trägt,
        // trifft sie.
        const seiten = [-0.3, -0.15, 0, 0.15, 0.3, -0.22, 0.22, -0.05, 0.05, 0.1];
        const serie = (c, d, dy) => {
            let n = 0;
            for (const sx of seiten) {
                stelle(c, d, sx, dy);
                zielen(punkt(c, null));
                if (traf(schwung(), c)) n++;
            }
            return n;
        };
        w.z.hangabHirsch = serie(hirsch, 1.6, -0.62);
        parke(hirsch);
        w.z.hangabFuchs = serie(fuchs, 1.3, -0.6);
        parke(fuchs);
        hirsch.scale.setScalar(0.64);
        w.z.kleinFlach = serie(hirsch, 1.6, 0);
        hirsch.scale.setScalar(L0);
        w.c.hangab = w.z.hangabHirsch >= 8 && w.z.hangabFuchs >= 8;
        w.c.kleinFlach = w.z.kleinFlach >= 8;
        // (S5) SELBST-TEST: ohne Glieder-Treffer trifft die Klinge nichts (die Serie misst die Gestalt)
        if (fn("_kreaturGliedTreffer")) {
            const sv = r._kreaturGliedTreffer;
            r._kreaturGliedTreffer = () => null;
            try {
                hirsch.scale.setScalar(0.64);
                w.z.s5 = serie(hirsch, 1.6, 0);
            } finally {
                r._kreaturGliedTreffer = sv;
                hirsch.scale.setScalar(L0);
            }
            w.c.s5 = w.z.s5 === 0;
        }
        // (T3) die Hit-Stop-Energie: Grossschwert und Keule auf denselben Brust-Punkt
        const G = A._arenaGesetz().gefuehl;
        const stopEnergie = (name) => {
            ausruesten(name);
            stelle(hirsch, 1.6);
            zielen(punkt(hirsch, null));
            const t = traf(schwung(), hirsch);
            if (!t) return null;
            const e = (p._hitStopUntil - t.t - G.freezeMinSec) / (G.freezeMaxSec - G.freezeMinSec);
            return e * G.keRefJ;
        };
        w.z.stopGross = stopEnergie("klinge_grossschwert");
        w.z.stopKeule = stopEnergie("klinge_keule");
        // (K-D4 entscheidet unten an der ganzen Rezept-Tafel, T4: jede Waffe stoppt nach IHRER Energie)
        // (T13) DER RÜCKSTOSS JE MASSE UND WAFFE (0710-2, K-D9 — jedes Ziel sprang bei JEDER Waffe 2,16 m, eine Kappe, in
        // EINEM Takt): ein frischer Fuchs und ein frischer Bär, Dolch und Keule, je EIN Hieb auf die Brust. Für die Probe
        // steht der Steuer-Schritt der Tiere (die Naht `_steuerGesetz`, danach restauriert): kein Wunsch, keine Flucht nach dem
        // Treffer bewegt das Ziel — der Weg nach 1,5 s Kreatur-Takt ist allein der Stoß. Gemessen: der Sprung im Treffer-Takt
        // und der Weg danach.
        const fuchsR = setze("fuchs");
        const baer = setze("baer");
        const rueck = (c, name) => {
            if (!c || !s.blueprints[name]) return null;
            ausruesten(name);
            stelle(c, 1.1);
            c.userData._stossV = null;
            c.userData._steuer = { gier: c.rotation.y, v: 0 };
            zielen(punkt(c, null));
            const x0 = c.position.x,
                z0 = c.position.z;
            const t = traf(schwung(), c);
            if (!t) return null;
            const sprung = Math.hypot(c.position.x - x0, c.position.z - z0);
            const sv = c.userData._stossV;
            const dv = sv ? Math.hypot(sv.x, sv.z) : 0;
            const masse =
                typeof r._leibMasse === "function"
                    ? r._leibMasse(c)
                    : typeof r._kreaturMasse === "function"
                      ? r._kreaturMasse(c)
                      : null;
            const steuerRoh = A._steuerGesetz;
            const steht = Object.create(steuerRoh.call(A));
            steht.steuerSchritt = (st) => {
                st.v = 0;
            };
            A._steuerGesetz = () => steht;
            try {
                // wie der Loop: der feste Sim-Schritt trägt den Stoß (0710-5), dann der Kreatur-Takt
                for (let k = 0; k < 90; k++) {
                    if (typeof r._kreaturStossSchritt === "function") {
                        r._kreaturStossSchritt(1 / 60);
                        r._leibKontakte();
                    }
                    r.updateCreatures(1 / 60);
                }
            } finally {
                A._steuerGesetz = steuerRoh;
            }
            const weg = Math.hypot(c.position.x - x0, c.position.z - z0);
            parke(c);
            return {
                sprung: +sprung.toFixed(3),
                weg: +weg.toFixed(3),
                dv: +dv.toFixed(3),
                masse: masse === null ? null : +masse.toFixed(1),
                p: t.stoss && Number.isFinite(t.stoss.p) ? +t.stoss.p.toFixed(2) : null,
                m: t.stoss && Number.isFinite(t.stoss.m) ? +t.stoss.m.toFixed(2) : null,
            };
        };
        w.z.rueck = {
            fuchsDolch: rueck(fuchsR, "klinge_dolch"),
            fuchsKeule: rueck(fuchsR, "klinge_keule"),
            baerDolch: rueck(baer, "klinge_dolch"),
            baerKeule: rueck(baer, "klinge_keule"),
        };
        // (T14) DIE MASSE-TAFEL (0710-4): je Gattung ein frisches Tier der Größe 1, der Spieler und ein GT — die Masse, mit
        // der der Wirt stößt, gegen das Gewicht der Gestalt (die Linse misst die geschlossene Haut selbst).
        {
            const TC = globalThis.__tetrapodaCore;
            const KC = globalThis.__koerperCore;
            const VC = globalThis.__vehicleCore;
            const dichteTier = TC && TC.MASSSTAB ? TC.MASSSTAB.dichteKgM3 : undefined;
            const dichteMensch = KC && KC.LEIB ? KC.LEIB.dichteKgM3 : undefined;
            const dichteWagen = VC && VC.FAHR ? VC.FAHR.masseDichte : undefined;
            const kernFehlt = [];
            if (!(dichteTier > 0)) kernFehlt.push("tetrapoda MASSSTAB.dichteKgM3");
            if (!(dichteMensch > 0)) kernFehlt.push("koerper LEIB.dichteKgM3");
            if (!(dichteWagen > 0)) kernFehlt.push("vehicle FAHR.masseDichte");
            const zwillinge = [];
            if (A.STOSS && A.STOSS.dichteLeib !== undefined) zwillinge.push("STOSS.dichteLeib " + A.STOSS.dichteLeib);
            if (A.STOSS && A.STOSS.dichteWagen !== undefined)
                zwillinge.push("STOSS.dichteWagen " + A.STOSS.dichteWagen);
            if (typeof r._kreaturMasse === "function") zwillinge.push("_kreaturMasse (die Kapsel aus der Hüft-Höhe)");
            // das Volumen der geschlossenen Haut (Klasse fell/haut, jede Kante gerade oft) im Rahmen von `rahmen` — dazu, was der
            // Stoff-Schnitt des Ofens öffnet (`__leibV` am Gelenk der Hülle, vor dem Schnitt gemessen); Kopf und Hände misst die Linse
            const hautVolumen = (teil, rahmen, klassen) => {
                rahmen.updateMatrixWorld(true);
                const inv = new THREE.Matrix4().copy(rahmen.matrixWorld).invert();
                const mm = new THREE.Matrix4();
                let vol = 0;
                teil.traverse((o) => {
                    if (o.userData && o.userData.__leibV > 0)
                        vol += o.userData.__leibV * Math.abs(mm.multiplyMatrices(inv, o.matrixWorld).determinant());
                    if (!o.isMesh || !o.geometry || !o.geometry.attributes.position) return;
                    const kl = o.material && o.material.userData ? o.material.userData.foundryKind : null;
                    if (!klassen.includes(kl)) return;
                    const pa = o.geometry.attributes.position.array;
                    const ix = o.geometry.index ? o.geometry.index.array : null;
                    const n = ix ? ix.length : pa.length / 3;
                    const kanten = new Map();
                    let vv = 0;
                    for (let t = 0; t + 2 < n; t += 3) {
                        const ia = ix ? ix[t] : t;
                        const ib = ix ? ix[t + 1] : t + 1;
                        const ic = ix ? ix[t + 2] : t + 2;
                        const [ax, ay, az] = [pa[3 * ia], pa[3 * ia + 1], pa[3 * ia + 2]];
                        const [bx, by, bz] = [pa[3 * ib], pa[3 * ib + 1], pa[3 * ib + 2]];
                        const [cx, cy, cz] = [pa[3 * ic], pa[3 * ic + 1], pa[3 * ic + 2]];
                        vv += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
                        for (const [u, q] of [
                            [ia, ib],
                            [ib, ic],
                            [ic, ia],
                        ]) {
                            const key = u < q ? u + ":" + q : q + ":" + u;
                            kanten.set(key, (kanten.get(key) || 0) + 1);
                        }
                    }
                    for (const zz of kanten.values()) if (zz % 2) return; // offen: keine Masse
                    mm.multiplyMatrices(inv, o.matrixWorld);
                    vol += Math.abs(vv) * Math.abs(mm.determinant());
                });
                return vol;
            };
            const wirtLeib = (k) =>
                typeof r._leibMasse === "function" ? r._leibMasse(k) : r._kreaturMasse ? r._kreaturMasse(k) : 0;
            const leiber = {};
            const ort = pm.position;
            for (const [name, seele] of [
                ["fuchs", "fuchs"],
                ["wolf", "wolf"],
                ["hirsch", "wesen"],
                ["baer", "baer"],
            ]) {
                s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 2);
                const c = r.spawnCreatureAt(ort.x + 320, ort.y, ort.z + 320, "calm", seele, { bodySize: 1 });
                if (!c) continue;
                const tb = c.userData._tierBaum;
                const sk = new THREE.Vector3();
                c.getWorldScale(sk);
                // die feine Stufe allein (die Grobstufe unter demselben Wrap trägt die Haut noch einmal)
                const gl = c.userData._gelenk;
                const vol = tb && gl ? hautVolumen(gl.nah, c, ["fell"]) * sk.x * sk.y * sk.z : 0;
                leiber[name] = { wirtKg: wirtLeib(c), gestaltKg: dichteTier > 0 ? vol * dichteTier : null, vM3: vol };
                r.removeCreature(c);
            }
            {
                // der Spieler: seine Nah-Gestalt (die Grobstufe daneben trägt dieselbe Haut noch einmal)
                let nah = null;
                pm.traverse((o) => {
                    if (!nah && o.userData && o.userData._gelenk && o.userData._gelenk.nah)
                        nah = o.userData._gelenk.nah;
                });
                const vol = hautVolumen(nah || pm, pm, ["haut"]);
                leiber.mensch = { wirtKg: wirtLeib(pm), gestaltKg: dichteMensch > 0 ? vol * dichteMensch : null, vM3: vol };
            }
            {
                const e = r.spawnArchitecture(
                    "fahrzeug_gt",
                    { x: ort.x + 330, y: r.getTerrainHeightAt(ort.x + 330, ort.z + 330) + 0.5, z: ort.z + 330 },
                    { silent: true, precise: true }
                );
                const prof = e ? r._vehicleProfile(e) : null;
                const G = prof ? r._fahrSatz(e, prof) : null;
                if (G)
                    leiber.gt = {
                        wirtKg:
                            typeof r._fahrMasse === "function"
                                ? r._fahrMasse(G)
                                : A.STOSS && A.STOSS.dichteWagen
                                  ? G.m * A.STOSS.dichteWagen
                                  : 0,
                        gestaltKg: dichteWagen > 0 ? G.m * dichteWagen : null,
                        vM3: G.m,
                    };
                if (e) r.removeArchitecture(e);
            }
            w.z.masse = { leiber, kernFehlt, zwillinge };
        }
        // (T15) DER BISS ALS STOSS (0710-4): je Jäger (Größe 1) ein Biss auf ein frisches Kitz 1,2 m neben ihm (die Jagd auf
        // Beute, _tickCreatureScentStrike) und einer auf den Spieler 1,2 m vor ihm (die Jagd, _tickCreatureHuntStrike, im
        // Pfad-Modus, volle Gesundheit, der Spieler auf dem Boden). Der Biss ist der Ansprung (Posten 5): der Kreatur-Takt läuft,
        // bis das Maul schnappt (höchstens 1,5 s). Gemessen: das Δv, das der Stoß des Bisses dem Ziel gibt (im Biss-Takt, am
        // Ziel gelesen — vorher und nachher _stossV bzw. playerVel).
        {
            const bissAlt = { mode: r.getGameMode(), hp: p.hp, gnade: p.respawnGraceUntil };
            r.setGameMode("pfad");
            const B0 = amBoden();
            const ort0 = B0.P;
            const beute = {};
            const spieler = {};
            let stossNach = null;
            const geschw = (ziel) => {
                if (!ziel) return { x: s.playerVel.x(), z: s.playerVel.z() };
                const sv = ziel.userData._stossV;
                return { x: sv ? sv.x : 0, z: sv ? sv.z : 0 };
            };
            const bsRoh = r._bissStoss;
            r._bissStoss = function (beisser, ziel) {
                const v0 = geschw(ziel);
                const o = bsRoh.call(this, beisser, ziel);
                const v1 = geschw(ziel);
                stossNach = Math.hypot(v1.x - v0.x, v1.z - v0.z);
                return o;
            };
            const beiss = (fest) => {
                stossNach = null;
                for (let k = 0; k < 90 && stossNach === null; k++) {
                    fest();
                    r.updateCreatures(1 / 60);
                    r._kreaturStossSchritt(1 / 60);
                    r._leibKontakte();
                }
                return stossNach;
            };
            try {
                for (const seele of ["fuchs", "wolf", "baer"]) {
                    s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 3);
                    const bx = ort0.x + 400,
                        bz = ort0.z + 400;
                    const j = r.spawnCreatureAt(bx, ort0.y, bz, "calm", seele, { bodySize: 1 });
                    const h = r.spawnCreatureAt(bx + 1.2, ort0.y, bz, "calm", "wesen", { bodySize: 0.6 });
                    if (j && h) {
                        // gemessen wird der Stoß des Bisses, nicht seine Trefferquote: bis zu drei Ansprünge aus der Ruhe (ein
                        // Ansprung des Freude-Hüpfers geht über ein Kitz hinweg — benannt offen, Nachbesserung 2; vorher
                        // wackelte die Wand in 2 von 27 Läufen am Fuchs)
                        let dv = null;
                        let ansatz = false;
                        for (let a = 0; a < 3 && dv === null; a++) {
                            j.position.set(bx, r.getTerrainHeightAt(bx, bz), bz);
                            j.rotation.set(0, Math.PI / 2, 0); // dem Kitz zugewandt
                            Object.assign(j.userData, {
                                _steuer: null,
                                _stossV: null,
                                _verhaltenAktion: null,
                                _hopH: 0,
                                _hopV: 0,
                                nextHuntStrikeAt: 0,
                            });
                            h.position.set(bx + 1.2, r.getTerrainHeightAt(bx + 1.2, bz), bz);
                            h.userData._stossV = null;
                            h.userData.hp = 1e6;
                            ansatz = r._tickCreatureScentStrike(j) === true;
                            if (!ansatz) break;
                            dv = beiss(() => {
                                h.position.x = bx + 1.2;
                                h.position.z = bz;
                                h.userData.fearUntil = 0;
                            });
                        }
                        beute[seele] = { biss: dv !== null, dv: dv || 0 };
                    }
                    if (h) r.removeCreature(h);
                    if (j) {
                        // derselbe Jäger 1,2 m vor dem Spieler, ihm zugewandt
                        j.position.set(ort0.x + 1.2, r.getTerrainHeightAt(ort0.x + 1.2, ort0.z), ort0.z);
                        j.rotation.set(0, -Math.PI / 2, 0);
                        j.userData._steuer = null;
                        j.userData._stossV = null;
                        j.userData._verhaltenAktion = null;
                        j.userData._hopH = 0; // es steht (der Sprung am Kitz ist gelandet)
                        j.userData._hopV = 0;
                        j.userData.nextHuntStrikeAt = 0;
                        p.hp = p.maxHp || 100;
                        p.respawnGraceUntil = 0;
                        B0.halte();
                        s.playerVel.setValue(0, s.playerVel.y(), 0);
                        const ansatz = r._tickCreatureHuntStrike(j) === true;
                        const dv = ansatz ? beiss(B0.halte) : null;
                        spieler[seele] = { biss: dv !== null, dv: dv || 0 };
                        s.playerVel.setValue(0, s.playerVel.y(), 0);
                        r.removeCreature(j);
                    }
                }
            } finally {
                delete r._bissStoss;
                B0.zurueck();
                p.hp = bissAlt.hp;
                p.respawnGraceUntil = bissAlt.gnade;
                if (r.getGameMode() !== bissAlt.mode) r.setGameMode(bissAlt.mode);
            }
            w.z.biss = { beute, spieler };
        }
        parke(hirsch);
        // (T4) keine Schadens-Kappe: je Nahkampf-Rezept EIN Hieb auf die Brust, Faktor = Schaden ÷ (Kraft × Güte × Zone)
        const sc = globalThis.__schmiedeCore;
        const ZT = A._arenaGesetz().zonen || null;
        const faktoren = [];
        for (const id of Object.keys(sc.REZEPT_ZU_GATTUNG)) {
            const g = sc.GATTUNGEN[sc.REZEPT_ZU_GATTUNG[id]];
            if (g && g.task && g.task.art === "bogen") continue;
            const name = "klinge_" + id;
            if (!s.blueprints[name]) continue;
            ausruesten(name);
            r._setBlueprintWear(s.blueprints[name], 1);
            stelle(hirsch, 1.5);
            zielen(punkt(hirsch, null));
            const sw = schwung();
            const t = traf(sw, hirsch);
            if (!t) {
                faktoren.push({ id, f: null });
                continue;
            }
            const z = sw.juice.length && sw.juice[0].zone;
            const zm = z && ZT && ZT[z] ? ZT[z].mul : 1;
            const ke = sw.juice.length && Number.isFinite(sw.juice[0].ke) ? sw.juice[0].ke : null;
            faktoren.push({ id, f: t.amount / ((p.stats.damage || 5) * r._heldGueteFaktor() * zm), ke });
        }
        const fs = faktoren.filter((x) => x.f !== null).map((x) => x.f);
        const fMax = Math.max(...fs);
        w.z.faktoren = faktoren.map((x) => x.id + ":" + (x.f === null ? "-" : x.f.toFixed(2))).join(" ");
        w.z.aufDerKappe = fs.filter((f) => f >= fMax * 0.99).length;
        w.z.nahkampfRezepte = faktoren.length;
        w.c.keineKappe = fs.length >= 15 && w.z.aufDerKappe <= 2;
        // K-D4 — DER HIT-STOP IST ENERGIE-SKALIERT an der ganzen Tafel: die Treffer-Energie (sie trägt Hit-Stop und Dip) je
        // Nahkampf-Rezept, ein Hieb auf die Brust; die größte Gruppe von Rezepten, deren Energie auf ±3 % gleich ist. Der Befund
        // (Ω-Φ4-Tautologie KE = ½·I·ω² bei ω ∝ 1/√I): 13 von 17 Rezepten stoppten mit 19,8 J.
        {
            const ke = faktoren
                .map((x) => x.ke)
                .filter((x) => Number.isFinite(x) && x > 0)
                .sort((a, b) => a - b);
            let gruppe = 0;
            for (let i = 0; i < ke.length; i++) {
                let n = 0;
                for (let j = i; j < ke.length && ke[j] <= ke[i] * 1.06; j++) n++;
                gruppe = Math.max(gruppe, n);
            }
            w.z.keGruppe = gruppe;
            w.z.keRezepte = ke.length;
            w.z.keSpanne = ke.length ? +(ke[ke.length - 1] / ke[0]).toFixed(1) : null;
            w.c.hitStopEnergie = ke.length >= 15 && gruppe <= 3;
        }
        // (T5) die Gegenwehr folgt dem TEMPERAMENT DER GATTUNG (Welle LF 08.10., K-D12): 20 Treffer mit Rückstoß aus 1,6 m
        // im Modus pfad — der Bär (wehrhaft) schlägt zurück, der Hirsch derselben Größe (scheu, ein Fluchttier) nie.
        // Vorher lief die Probe am Hirsch, den die Substanz-Tags „wehrhaft" nannten.
        r.setGameMode("pfad");
        p.hp = 1e9;
        p.respawnGraceUntil = -Infinity;
        // Die Gegenwehr ist der Ansprung (Welle LF kampf, Posten 5): nach jedem Treffer läuft der Kreatur-Takt 1 s (der Spieler
        // steht auf dem Boden) — gezählt wird, was das Maul am Leib schnappt.
        const gegenwehrAn = (c) => {
            const g0 = zaehl.gegenwehr;
            const B = amBoden();
            try {
                for (let i = 0; i < 20; i++) {
                    stelle(c, 1.6);
                    r.damageCreature(c, 5, {
                        source: "player",
                        fromPos: { x: pm.position.x, y: pm.position.y, z: pm.position.z },
                        knockback: 16,
                    });
                    for (let k = 0; k < 60; k++) {
                        B.halte();
                        r.updateCreatures(1 / 60);
                        r._kreaturStossSchritt(1 / 60);
                        r._leibKontakte();
                    }
                }
            } finally {
                B.zurueck();
            }
            parke(c);
            return zaehl.gegenwehr - g0;
        };
        const baerG = r.spawnCreatureAt(pm.position.x + 300, pm.position.y, pm.position.z + 300, "happy", "baer", {
            bodySize: 1,
        });
        const hirschG = r.spawnCreatureAt(pm.position.x + 300, pm.position.y, pm.position.z + 304, "happy", "wesen", {
            bodySize: 1,
        });
        if (baerG) tiere.push(baerG);
        if (hirschG) tiere.push(hirschG);
        w.z.gegenwehr = baerG ? gegenwehrAn(baerG) : 0;
        w.z.gegenwehrHirsch = hirschG ? gegenwehrAn(hirschG) : -1;
        w.z.temperamentBaer = baerG ? r._creatureTemperament(baerG) : null;
        w.z.temperamentHirsch = hirschG ? r._creatureTemperament(hirschG) : null;
        r.setGameMode(saved.mode);
        p.hp = saved.hp;
        w.c.gegenwehr =
            w.z.temperamentBaer === "wehrhaft" &&
            w.z.gegenwehr > 0 &&
            w.z.temperamentHirsch === "scheu" &&
            w.z.gegenwehrHirsch === 0;
        // (T6) die Hand ist kein Panzer
        ausruesten(null);
        const st0 = r.computePlayerStats().stats;
        const leer = { d: st0.defense, hp: st0.hpMax, dmg: st0.damage };
        ausruesten("klinge_langschwert");
        const st1 = r.computePlayerStats().stats;
        w.z.panzer = `defense ${leer.d.toFixed(2)}→${st1.defense.toFixed(2)} · hpMax ${leer.hp.toFixed(1)}→${st1.hpMax.toFixed(1)} · damage ${leer.dmg.toFixed(2)}→${st1.damage.toFixed(2)}`;
        w.c.keinPanzer = st1.defense === leer.d && st1.hpMax === leer.hp && st1.damage > leer.dmg;
        // (T7) Verschleiß: 16 Treffer zehren die Klinge, ein verbrauchtes Gerät schlägt nicht
        const bpL = s.blueprints.klinge_langschwert;
        r._setBlueprintWear(bpL, 1);
        let n7 = 0;
        for (let i = 0; i < 16; i++) {
            stelle(hirsch, 1.6);
            zielen(punkt(hirsch, null));
            if (traf(schwung(), hirsch)) n7++;
        }
        w.z.wear16 = r._blueprintWear(bpL);
        w.z.treffer16 = n7;
        r._setBlueprintWear(bpL, 0.02);
        stelle(hirsch, 1.6);
        zielen(punkt(hirsch, null));
        w.z.trefferVerbraucht = traf(schwung(), hirsch) ? 1 : 0;
        r._setBlueprintWear(bpL, 1);
        w.c.verschleiss = n7 >= 12 && w.z.wear16 < 0.99 && w.z.trefferVerbraucht === 0;
        // (T8) der Pfeil: Impuls im Schaden, die Wand hält ihn
        ausruesten("klinge_langbogen");
        const rec = fn("_heldBogenRecipe") ? r._heldBogenRecipe() : null;
        const schuss = (frac, ziel) => {
            const n0 = treff.length;
            const list = s._pfeile || [];
            const vorher = list.length;
            p._shotCooldownUntil = 0;
            p._swing = null;
            r._beginPlayerShot(rec, frac);
            const pf = (s._pfeile || [])[vorher];
            if (!pf) return { flog: false, treffer: null };
            for (let k = 1; k <= 360 && s._pfeile.includes(pf); k++) r._tickPfeile(pf.born + k / 120);
            const t = treff.slice(n0).find((x) => x.c === ziel);
            return { flog: true, treffer: t || null };
        };
        if (!rec) w.fehler.push("Bogen-Rezept kalt");
        else {
            stelle(hirsch, 2.5);
            zielen(punkt(hirsch, null));
            const voll = schuss(1, hirsch);
            stelle(hirsch, 2.5);
            zielen(punkt(hirsch, null));
            const viertel = schuss(0.25, hirsch);
            w.z.pfeilVoll = voll.treffer ? voll.treffer.amount : null;
            w.z.pfeilViertel = viertel.treffer ? viertel.treffer.amount : null;
            w.c.pfeilImpuls =
                w.z.pfeilVoll !== null && w.z.pfeilViertel !== null && w.z.pfeilViertel <= 0.5 * w.z.pfeilVoll;
            // die Wand: ein Stein-Riegel 4 m vor dem Spieler, der Hirsch 9 m dahinter
            s.blueprints._kg_wand = {
                name: "_kg_wand",
                parts: [
                    {
                        shape: "box",
                        material: "stein",
                        size: { x: 6, y: 4, z: 0.4 },
                        position: { x: 0, y: 2, z: 0 },
                    },
                ],
            };
            const wand = r.spawnArchitecture(
                "_kg_wand",
                { x: pm.position.x, y: pm.position.y, z: pm.position.z + 4 },
                { precise: true, seed: 1 } // genau dort (keine Spieler-Klemme), der Fuß der Wand auf deinem
            );
            if (!wand) w.fehler.push("Wand-Spawn fehlgeschlagen");
            stelle(hirsch, 13);
            zielen(punkt(hirsch, null));
            const hinter = schuss(1, hirsch);
            w.z.pfeilHinterWand = hinter.treffer ? 1 : 0;
            if (wand) r.removeArchitecture(wand);
            delete s.blueprints._kg_wand;
            stelle(hirsch, 13);
            zielen(punkt(hirsch, null));
            const frei = schuss(1, hirsch);
            w.z.pfeilFrei = frei.treffer ? 1 : 0;
            w.c.pfeilWand = !!wand && w.z.pfeilHinterWand === 0 && w.z.pfeilFrei === 1;
            // (T7b) der Bogen ist eine geführte Waffe wie die Klinge (K-D6 ganz): sein Verschleiß wirkt im Schaden
            // (wear 0,5 → _wearStatFactor 0,65 des vollen), jeder Schuss zehrt ihn, ein verbrauchter Bogen (wear 0,02,
            // unter WEAR_KAPUTT_SCHWELLE) löst nicht — dieselbe Wand wie Hieb und Abbau.
            const bpB = s.blueprints.klinge_langbogen;
            const bogenBei = (wear) => {
                r._setBlueprintWear(bpB, wear);
                stelle(hirsch, 2.5);
                zielen(punkt(hirsch, null));
                const sh = schuss(1, hirsch);
                return { flog: sh.flog, amount: sh.treffer ? sh.treffer.amount : null, nach: r._blueprintWear(bpB) };
            };
            const bogenProbe = () => {
                const b1 = bogenBei(1),
                    b5 = bogenBei(0.5),
                    b02 = bogenBei(0.02);
                r._setBlueprintWear(bpB, 1);
                const F = A.WEAR_STAT_FLOOR;
                const soll = F + (1 - F) * 0.5;
                const verh = b1.amount && b5.amount !== null ? b5.amount / b1.amount : null;
                return {
                    voll: b1.amount,
                    halb: b5.amount,
                    verh,
                    soll,
                    zehrtVoll: 1 - b1.nach,
                    zehrtHalb: 0.5 - b5.nach,
                    verbrauchtFlog: b02.flog ? 1 : 0,
                    verbrauchtTraf: b02.amount !== null ? 1 : 0,
                    ok:
                        verh !== null &&
                        Math.abs(verh - soll) < 0.01 &&
                        b1.nach < 1 &&
                        b5.nach < 0.5 &&
                        !b02.flog &&
                        b02.amount === null,
                };
            };
            w.z.bogen = bogenProbe();
            w.c.bogenVerschleiss = w.z.bogen.ok;
            // (S6) SELBST-TEST mit dem Täter: der Pfeil ohne Verschleiß (Faktor ≡ 1, kein Zehren — der alte Zwilling)
            {
                const svF = r._wearStatFactor,
                    svV = r._kampfVerschleiss;
                r._wearStatFactor = () => 1;
                r._kampfVerschleiss = () => {};
                try {
                    w.z.s6 = bogenProbe();
                } finally {
                    r._wearStatFactor = svF;
                    r._kampfVerschleiss = svV;
                    delete r._wearStatFactor;
                    delete r._kampfVerschleiss;
                    r._setBlueprintWear(bpB, 1);
                }
                w.c.s6 = w.z.s6.ok === false;
            }
        }
        // (T7c) die KLASSE der Waffen-Schadens-Pfade: jede Methode, die ein Wesen im Namen des Spielers schädigt
        // (damageCreature mit source "player"), rechnet ihren Schaden im EINEN Roh-Schaden-Gesetz _kampfRohSchaden —
        // kein Pfad setzt Kraft × Wirkung × Zone selbst zusammen (der Pfeil tat es, ohne Verschleiß).
        {
            const klasse = () => {
                const tat = [];
                const pfade = [];
                for (const k of Object.getOwnPropertyNames(A.prototype)) {
                    const d = Object.getOwnPropertyDescriptor(A.prototype, k);
                    if (k === "constructor" || !d || typeof d.value !== "function") continue; // constructor = die ganze Klasse
                    const code = window.__codeOf(d.value);
                    if (!/damageCreature\(/.test(code) || !/source:\s*"player"/.test(code)) continue;
                    pfade.push(k);
                    if (!/_kampfRohSchaden\(/.test(code)) tat.push(k);
                }
                return { pfade, tat };
            };
            const kl = klasse();
            w.z.schadensPfade = kl.pfade.join(",");
            w.z.schadensZwillinge = kl.tat.join(",") || "–";
            w.c.einRohSchaden = kl.pfade.length >= 2 && kl.tat.length === 0;
            // (S7) SELBST-TEST mit dem Täter: ein Waffen-Pfad, der seinen Schaden selbst zusammensetzt (die Pfeil-Zeile
            // von d1ab1c64 wörtlich, als Wurf verkleidet) — die Klassen-Linse muss ihn beim Namen nennen
            A.prototype.__taeterWurf = function (hit, pf, urteil) {
                return this.damageCreature(hit, pf.kraft * this._trefferWirkung(urteil) * urteil.zoneMul, {
                    source: "player",
                });
            };
            try {
                const kt = klasse();
                w.z.s7 = kt.tat.join(",") || "–";
                w.c.s7 = kt.tat.includes("__taeterWurf");
            } finally {
                delete A.prototype.__taeterWurf;
            }
        }
        // (T9) EINE Güte je Gerät: der Schadens-Faktor (_heldGueteFaktor) und die Güte des Werks (computeBlueprintQuality —
        // Werkstoff-Kraft, Equip-Fold) lesen dasselbe Lehren-Urteil des Kerns (schmiede gueteFaktor → Anteil)
        {
            const GU = A._arenaGesetz().guete;
            let uneins = 0,
                n9 = 0;
            const proben9 = [];
            for (const id of Object.keys(sc.REZEPT_ZU_GATTUNG)) {
                const name = "klinge_" + id;
                if (!s.blueprints[name]) continue;
                ausruesten(name);
                const anteil = (sc.gueteFaktor(id) - GU.faktorLeer) / (GU.faktorVoll - GU.faktorLeer);
                const q = r.computeBlueprintQuality(s.blueprints[name]);
                const gF = r._heldGueteFaktor();
                const gSoll = GU.faktorLeer + (GU.faktorVoll - GU.faktorLeer) * q;
                n9++;
                const eins = Math.abs(q - anteil) < 1e-9 && Math.abs(gF - gSoll) < 1e-9;
                if (!eins) {
                    uneins++;
                    if (proben9.length < 4)
                        proben9.push(
                            `${id}: Güte ${q.toFixed(2)} · Lehre ${anteil.toFixed(2)} · Schaden ×${gF.toFixed(2)}`
                        );
                }
            }
            w.z.gueteUneins = uneins;
            w.z.gueteGeraete = n9;
            w.z.gueteProben = proben9.join(" | ");
            w.c.eineGuete = n9 >= 17 && uneins === 0;
        }
        // die fünf Phantom-Leser (0 Definitionen im Kern) — kein Aufruf im Stamm
        // (Absenz über den Code ohne Kommentare — Kommentare dürfen die Gefallenen zitieren, Lehre 6)
        const stamm = Object.getOwnPropertyNames(A.prototype)
            .map((k) => {
                const d = Object.getOwnPropertyDescriptor(A.prototype, k);
                return d && typeof d.value === "function"
                    ? window.__codeOf(d.value)
                    : "";
            })
            .join("\n");
        w.z.phantome = (stamm.match(/\b(zoneMulAt|zoneKindAt|zoneJuiceAt|handlingMul|handlingWindF)\b/g) || []).length;
        w.c.keinePhantome = w.z.phantome === 0;
        const codeVon = (name) =>
            fn(name)
                ? window.__codeOf(A.prototype[name])
                : "";
        // (T10) KERN-PFLICHT des Treffer-Volumens: fehlt tetrapoda trefferZone, bricht der erste Treffer-Test LAUT
        // (_kernPflichtBruch, benannt) — nie still null, das je Tier gespeichert jedes Wesen unverwundbar machte.
        // Gegenprobe: mit dem Kern trägt dasselbe Tier seine Glieder, jedes mit Zone.
        {
            const frisch = setze("wesen");
            const tcEcht = globalThis.__tetrapodaCore;
            let bruch = null,
                rueck;
            globalThis.__tetrapodaCore = Object.assign({}, tcEcht, { trefferZone: undefined });
            try {
                rueck = r._kreaturTrefferGlieder(frisch);
            } catch (e) {
                bruch = String((e && e.message) || e);
            } finally {
                globalThis.__tetrapodaCore = tcEcht;
            }
            w.z.kernOhneZone = bruch
                ? /tetrapoda:trefferZone/.test(bruch)
                    ? "Bruch benannt"
                    : "Bruch ohne Namen"
                : rueck === null
                  ? "still null" + (frisch.userData._trefferGlieder === null ? ", je Tier gespeichert" : "")
                  : "Liste";
            delete frisch.userData._trefferGlieder;
            const gl = r._kreaturTrefferGlieder(frisch);
            w.z.kernMitZone = Array.isArray(gl) ? gl.length : 0;
            w.c.kernPflichtZone =
                w.z.kernOhneZone === "Bruch benannt" && Array.isArray(gl) && gl.length > 0 && gl.every((g) => !!g.zone);
            r.removeCreature(frisch);
            tiere.splice(tiere.indexOf(frisch), 1);
        }
        // (T11) der KALTE ERSTE TREFFER je Gattung (Lehre 14): ein Tier einer Gattung, deren Treffer-Glieder noch niemand
        // kennt, steht in der Welt, die Welt läuft 60 Spiel-Takte, dann der erste Hieb — gezählt werden die Haut-Vertices,
        // die der Hieb SELBST zerlegt (_kreaturGliederGruppen im Treffer-Pfad). Vorgebacken (die EINE Bake-Uhr): 0.
        const gattungVon = (c) => {
            const ud = c.userData || {};
            return (
                ud.gattung ||
                ud.recipe ||
                ud.preset ||
                (A.TETRAPODA_SOUL_MAP && A.TETRAPODA_SOUL_MAP[ud.soul || "wesen"]) ||
                ud.soul ||
                "wesen"
            );
        };
        const kalterTreffer = (seele) => {
            ausruesten("klinge_langschwert");
            const c = setze(seele);
            if (!c) return { traf: false, zerlegt: null };
            if (r._trefferGliedNamen) r._trefferGliedNamen.delete(gattungVon(c));
            stelle(c, 9, 4);
            for (let k = 0; k < 60; k++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
            }
            p._swing = null;
            p._hitStopUntil = 0;
            let zerlegt = 0;
            const svG = r._kreaturGliederGruppen;
            r._kreaturGliederGruppen = function (cr) {
                const G = svG.call(this, cr);
                if (G) for (const [, g] of G.gruppen) zerlegt += g.verts;
                return G;
            };
            let t = null;
            try {
                stelle(c, 1.6);
                zielen(punkt(c, null));
                t = traf(schwung(), c);
            } finally {
                r._kreaturGliederGruppen = svG;
                delete r._kreaturGliederGruppen;
            }
            parke(c);
            return { traf: !!t, zerlegt, gattung: gattungVon(c) };
        };
        w.z.kalt = kalterTreffer("baer");
        w.c.kaltVorgebacken = w.z.kalt.traf && w.z.kalt.zerlegt === 0;
        // (S8) SELBST-TEST mit dem Täter: ohne das Vorbacken zerlegt der erste Hieb die Haut (die Linse zählt den Hieb)
        if (fn("_tickTrefferGliederVorbacken")) {
            r._tickTrefferGliederVorbacken = () => {};
            try {
                w.z.s8 = kalterTreffer("wolf");
            } finally {
                delete r._tickTrefferGliederVorbacken;
            }
            w.c.s8 = w.z.s8.traf && w.z.s8.zerlegt > 0;
        }
        // (G1) der Klingen-Sweep liest die EINE Vorwärts-Richtung (_blickVorn) — keine Inline-Kopie der Formel
        {
            const sw = codeVon("_kampfSweepTick");
            w.z.sweepFormel = (sw.match(/Math\.(sin|cos)\(/g) || []).length;
            w.c.sweepBlickVorn = /this\._blickVorn\(/.test(sw) && w.z.sweepFormel === 0;
        }
        // (G2) keine typeof-Probe auf eine EIGENE Methode in den Methoden, die die Welle L (Kampf und Maus) schrieb —
        // die Methode existiert immer; die Probe wäre ein stiller Rückfall, nie ein Vertrag
        {
            const welleL = [
                "fertigeBlueprint",
                "_ruestungDaempft",
                "_kreaturGliederGruppen",
                "_gliedKapselMemo",
                "_kreaturTrefferGlieder",
                "_kreaturGliedTreffer",
                "_kreaturGattung",
                "_tickTrefferGliederVorbacken",
                "_bauModusFuer",
                "_kampfKlingenAchse",
                "_kampfUrteil",
                "_kampfKraft",
                "_kampfRohSchaden",
                "_trefferWirkung",
                "_kampfStats",
                "_kampfVerschleiss",
                "_geraetVerbraucht",
                "_eigenwerkSchwungKE",
                "_schmiedeGueteAnteil",
                "_schmiedeGestalt",
                "_geraetGraebt",
                "_blickVorn",
                "_blickGierZu",
                "_blickZiel",
                "_uiSchubladeOffen",
                "_uiZeigerFrei",
            ];
            const selbst = [];
            for (const m of welleL) {
                for (const x of codeVon(m).matchAll(/typeof this\.([\w$]+) === "function"/g))
                    if (typeof A.prototype[x[1]] === "function") selbst.push(m + "→" + x[1]);
            }
            w.z.typeofSelbst = selbst.join(",") || "–";
            w.c.keinTypeofSelbst = selbst.length === 0;
        }
        // (G3) KEIN DRITTER LEIB (Integration Welle L, Gesetz #0): Klinge und Pfeil fragen das EINE Grob-Tor
        // (_trefferErreichbar), und das liest den kreatur-Leib (_kreaturLeib) — kein eigenes Körpermaß (2 × Skala) im
        // Treffer-Pfad.
        {
            const sw = codeVon("_kampfSweepTick");
            const pf = codeVon("_tickPfeile");
            w.z.grobFremd = ((sw + pf).match(/\.scale\.x\b/g) || []).length;
            w.c.grobLiestLeib =
                /this\._trefferErreichbar\(/.test(sw) &&
                /this\._trefferErreichbar\(/.test(pf) &&
                /this\._kreaturLeib\(/.test(codeVon("_trefferErreichbar")) &&
                w.z.grobFremd === 0;
        }
        // (T12) DAS GROB-TOR DECKT DIE GESTALT: jede Gattung in jeder Größen-Grenze (VERHALTEN.groessen), 90 Spiel-Takte;
        // je Probe jedes Ende jeder Treffer-Glied-Kapsel (+ ihr Radius) — ein Punkt der Gestalt, den das Tor abweist,
        // wäre ein Treffer, den die Gestalt nie richten darf. Gemessen wird die RÄUMLICHE Spanne vom Fuß-Ursprung (das Tor
        // fragt waagrecht): sie deckt das Tier in jeder Lage (gekippt, am Hang, im Sprung), nicht nur in der gezeigten.
        // Ohne die Naht (Vorher-Stand) misst sie das alte Inline-Tor.
        const grobTor = fn("_trefferErreichbar")
            ? (c, x, z, sp) => r._trefferErreichbar(c, x, z, sp)
            : (c, x, z, sp) => {
                  const L = Math.max(0.3, c.scale.x || 1);
                  return Math.hypot(c.position.x - x, c.position.z - z) <= sp + 2 * L;
              };
        const gestaltSchar = [];
        {
            const G = A._verhaltenGesetz().groessen;
            const groessen = [...new Set(G.flatMap((k) => [k.min, k.max]))].sort((a, b) => a - b);
            let n = 0;
            for (const seele of ["wesen", "wolf", "fuchs", "baer"]) {
                for (const bs of groessen) {
                    s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 8);
                    const ort = pm.position;
                    const c = r.spawnCreatureAt(ort.x + 300, ort.y, ort.z + 300, "happy", seele, { bodySize: bs });
                    if (!c) continue;
                    tiere.push(c);
                    stelle(c, 12 + 4 * Math.floor(n / 8), -14 + 4 * (n % 8));
                    gestaltSchar.push({ c, seele, bs });
                    n++;
                }
            }
        }
        const gestaltDeckung = () => {
            const v = V3();
            const o = { proben: 0, ausserhalb: 0, jeL: {}, taeter: [] };
            for (const e of gestaltSchar) {
                const c = e.c;
                const gl = r._kreaturTrefferGlieder(c);
                if (!gl) continue;
                c.updateMatrixWorld(true);
                const L = r._kreaturHueftL(c);
                for (const g of gl) {
                    const rr = g.r * g.anker.matrixWorld.getMaxScaleOnAxis();
                    for (const q of [g.a, g.b]) {
                        v.copy(q).applyMatrix4(g.anker.matrixWorld);
                        const dx = v.x - c.position.x,
                            dz = v.z - c.position.z;
                        const d = Math.hypot(dx, dz);
                        const h = Math.hypot(dx, v.y - c.position.y, dz) + rr;
                        o.proben++;
                        o.jeL[e.seele] = Math.max(o.jeL[e.seele] || 0, h / L);
                        // der äußerste Punkt der Kapsel in dieser Richtung, mit Spanne 0 befragt
                        const ux = d > 1e-9 ? dx / d : 1,
                            uz = d > 1e-9 ? dz / d : 0;
                        if (!grobTor(c, c.position.x + ux * h, c.position.z + uz * h, 0)) {
                            o.ausserhalb++;
                            if (o.taeter.length < 3) o.taeter.push(e.seele + "@" + e.bs.toFixed(2));
                        }
                    }
                }
            }
            return o;
        };
        {
            const summe = { proben: 0, ausserhalb: 0, jeL: {}, taeter: [] };
            for (let k = 0; k < 90; k++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                if (k % 6) continue;
                const o = gestaltDeckung();
                summe.proben += o.proben;
                summe.ausserhalb += o.ausserhalb;
                for (const [g, x] of Object.entries(o.jeL)) summe.jeL[g] = Math.max(summe.jeL[g] || 0, x);
                for (const t of o.taeter) if (summe.taeter.length < 3) summe.taeter.push(t);
            }
            w.z.grob = summe;
            w.c.grobDeckt = summe.proben > 0 && summe.ausserhalb === 0;
        }
        // (S9) SELBST-TEST mit dem Täter: der Leib ohne seine Glieder (Reichweite = halb + radius, der Kontakt-Leib) —
        // Kopf und Rute liegen draußen, die Deckungs-Probe nennt sie
        if (fn("_trefferErreichbar")) {
            const svLeib = r._kreaturLeib;
            r._kreaturLeib = function (cr, L, out) {
                const o = svLeib.call(this, cr, L, out);
                o.reichweite = o.halb + o.radius;
                return o;
            };
            try {
                w.z.s9 = gestaltDeckung();
            } finally {
                delete r._kreaturLeib;
            }
            w.c.s9 = w.z.s9.ausserhalb > 0;
        }
        for (const e of gestaltSchar) {
            r.removeCreature(e.c);
            tiere.splice(tiere.indexOf(e.c), 1);
        }

        // ═══ Q9 — MAUS-ABSICHT ═══
        ausruesten("klinge_langschwert");
        s.isPointerLocked = true;
        // (M1) 3rd-Person: 10 Klicks auf den Hirsch 2 m vor dir. Liegt ein Bau näher auf dem Kamera-Strahl (die
        // Start-Plattform), gilt das Nächste — der Klick zählt dann als verdeckt, nie als Treffer-Probe.
        if (fn("setCameraMode")) r.setCameraMode("third");
        const z1 = { c: zaehl.carve, t: treff.length };
        let fk = 0,
            frei = 0,
            freiSchwung = 0;
        for (let i = 0; i < 10; i++) {
            stelle(hirsch, 2);
            zielen(punkt(hirsch, null));
            const pick = r._pickCreatureAtCrosshair();
            const imKreuz = !!(pick && pick.creature === hirsch);
            if (imKreuz) fk++;
            const ap = r._pickArchitectureAtCrosshair();
            const istFrei =
                imKreuz &&
                !(ap && ap.point && s.camera.position.distanceTo(ap.point) < s.camera.position.distanceTo(pick.point));
            if (istFrei) frei++;
            p._swing = null;
            p.breakHeld = false;
            p.stamina = (p.stats && p.stats.staminaMax) || 100; // zwischen zwei Klicks atmet der Spieler
            const s0 = zaehl.schwung;
            r.tryMouseBreak();
            if (istFrei && zaehl.schwung > s0) freiSchwung++;
            if (p._swing) {
                p._swing.lastT = T;
                for (let k = 0; k < 1200 && p._swing; k++) {
                    T += 0.005;
                    r._tickKampfSchwung(T);
                }
            }
        }
        w.z.dritte = {
            fadenkreuz: fk,
            frei,
            schwuenge: freiSchwung,
            krater: zaehl.carve - z1.c,
            treffer: treff.slice(z1.t).filter((t) => t.c === hirsch).length,
        };
        w.c.dritteSchwingt = fk === 10 && frei >= 8 && freiSchwung === frei && w.z.dritte.krater === 0;
        // (M2) 1st-Person: Drücken auf den Hirsch, der Stoß schiebt ihn fort, das Halten setzt nach
        if (fn("setCameraMode")) r.setCameraMode("first");
        stelle(hirsch, 1.6);
        zielen(punkt(hirsch, null));
        const z2 = zaehl.carve;
        p._swing = null;
        p.breakHeld = true;
        p.lastHarvestStrikeAt = performance.now() / 1000;
        r.tryMouseBreak();
        stelle(hirsch, 1.6, 7); // aus dem Fadenkreuz geschoben
        for (let i = 0; i < 6; i++) {
            if (p._swing) {
                p._swing.lastT = T;
                for (let k = 0; k < 1200 && p._swing; k++) {
                    T += 0.005;
                    r._tickKampfSchwung(T);
                }
            }
            p.lastHarvestStrikeAt = -Infinity;
            r._tickHarvest();
        }
        p.breakHeld = false;
        p._swing = null;
        w.z.haltenKrater = zaehl.carve - z2;
        w.c.haltenOhneKrater = w.z.haltenKrater === 0;
        // (M3) RMB: Schwert schüttet nie auf; Spaten und leere Hand schon
        parke(hirsch);
        const boden = (d) => {
            s.yaw = 0;
            zielen({ x: pm.position.x, y: fussY(), z: pm.position.z + d });
        };
        const rmb = (n) => {
            const f0 = zaehl.fill;
            for (let i = 0; i < n; i++) r.tryMousePlace();
            return zaehl.fill - f0;
        };
        boden(4);
        w.z.rmbSchwert = rmb(3);
        ausruesten("klinge_spaten");
        boden(4);
        w.z.rmbSpaten = rmb(1);
        ausruesten(null);
        boden(4);
        w.z.rmbHand = rmb(1);
        w.c.rmbSchwert = w.z.rmbSchwert === 0 && w.z.rmbSpaten === 1 && w.z.rmbHand === 1;
        // (S4) SELBST-TEST: gräbt jedes Gerät, schüttet das Schwert auf
        if (fn("_geraetGraebt")) {
            const sv = r._geraetGraebt;
            r._geraetGraebt = () => true;
            try {
                ausruesten("klinge_langschwert");
                boden(4);
                w.z.s4 = rmb(1);
            } finally {
                r._geraetGraebt = sv;
            }
            w.c.s4 = w.z.s4 === 1;
        }
        // (M4) die offene Werkstatt: 4 Klicks auf den Canvas — gezählt wird, wie oft der Canvas in die Welt greift
        // (sein Dispatcher tryMouseBreak; hier gezählt statt ausgeführt, die Probe misst den Canvas, nicht das Ziel)
        ausruesten(null);
        boden(4);
        const cv = document.getElementById("world-canvas");
        const tmbOrig = r.tryMouseBreak;
        let griffe = 0;
        r.tryMouseBreak = () => (griffe++, true);
        try {
            r.toggleDrawer("werkstatt");
            const offen = !!document.querySelector('.drawer[data-drawer="werkstatt"]:not([hidden])');
            s.isPointerLocked = true; // der Zeiger war gefangen, als die Schublade aufging (Befund V-D2)
            for (let i = 0; i < 4 && cv; i++) {
                cv.dispatchEvent(new MouseEvent("mousedown", { button: 0, bubbles: true }));
                cv.dispatchEvent(new MouseEvent("mouseup", { button: 0, bubbles: true }));
            }
            w.z.werkstattGriffe = cv ? griffe : null;
            r.closeAllDrawers();
            // Gegenprobe: ohne Schublade greift derselbe Klick in die Welt
            s.isPointerLocked = true;
            griffe = 0;
            if (cv) {
                cv.dispatchEvent(new MouseEvent("mousedown", { button: 0, bubbles: true }));
                cv.dispatchEvent(new MouseEvent("mouseup", { button: 0, bubbles: true }));
            }
            w.z.ohneWerkstattGriffe = cv ? griffe : null;
            w.c.werkstattTaub = offen && w.z.werkstattGriffe === 0 && w.z.ohneWerkstattGriffe === 1;
        } finally {
            r.tryMouseBreak = tmbOrig;
            delete r.tryMouseBreak;
            p.breakHeld = false;
        }
        // (M5) FERTIGEN eines Bauwerks (die Eiche) → der Bau-Modus, nicht die Hand
        r.setGameMode("schöpfer");
        const fert = r.fertigeBlueprint("baum_eiche");
        w.z.fertigen = {
            ok: !!(fert && fert.ok),
            hand: (p.equipped && p.equipped.held) || null,
            bauModus: !!(s.buildMode && s.buildMode.active && s.buildMode.blueprintName === "baum_eiche"),
        };
        w.c.fertigenBaut = w.z.fertigen.bauModus && w.z.fertigen.hand !== "baum_eiche";
        if (s.buildMode && s.buildMode.active && fn("_clearBuildMode")) r._clearBuildMode();
        ausruesten(null);
        r.setGameMode(saved.mode);
        s.isPointerLocked = saved.lock;

        // ═══ Q10 — BLICK-WAHRHEIT ═══
        if (fn("setCameraMode")) r.setCameraMode("first");
        const blickBei = (pitch) => {
            s.pitch = pitch;
            kamera();
            return grad(Math.asin(Math.max(-1, Math.min(1, camDir().y))));
        };
        w.z.blick90 = blickBei(-Math.PI / 2);
        w.z.blick57 = blickBei(-1.0);
        w.c.egoBlick = Math.abs(w.z.blick90 + 90) < 0.5 && Math.abs(w.z.blick57 - grad(-1.0)) < 0.5;
        // „vor dir": at_player_forward und „baue dorf hier" gegen den Blick der Kamera (waagrecht)
        const vorDir = (naht) => {
            let min = Infinity;
            for (const y of [0, 0.9, 2.4, -1.7]) {
                s.yaw = y;
                s.pitch = 0;
                kamera();
                const d = camDir();
                const h = Math.hypot(d.x, d.z) || 1;
                // die Naht (Selbst-Test) gilt nur der DSL-Position, nie der Kamera
                const sv = naht ? r._blickVorn : null;
                if (naht) r._blickVorn = naht;
                let pos;
                try {
                    pos = r.dslPositions.at_player_forward([10], { state: s, rng: () => 0.5 });
                } finally {
                    if (naht) {
                        r._blickVorn = sv;
                        delete r._blickVorn;
                    }
                }
                const vx = pos.x - pm.position.x,
                    vz = pos.z - pm.position.z;
                min = Math.min(min, (vx * d.x + vz * d.z) / (h * (Math.hypot(vx, vz) || 1)));
            }
            return min;
        };
        w.z.vorDirCos = vorDir();
        s.yaw = 0.9;
        s.pitch = 0;
        kamera();
        const dD = camDir();
        // „baue dorf hier" trägt den Blick des Sprechers (Gier, Programm-Stelle 3 — die Welle L Folge, Gegenprüfung Runde 1:
        // der Anker hing am Blick jedes Peers): seine Vorwärts-Richtung (`_blickVorn`) blickt wie die Kamera.
        const dsl = r.parseChatToDsl("baue dorf hier");
        const gier = dsl && dsl.program ? dsl.program[3] : null;
        const vg = Number.isFinite(gier) ? r._blickVorn(gier, 0) : null;
        w.z.dorfCos = vg
            ? (vg.x * dD.x + vg.z * dD.z) / (Math.hypot(dD.x, dD.z) * (Math.hypot(vg.x, vg.z) || 1))
            : null;
        w.c.vorDir = w.z.vorDirCos > 0.9 && w.z.dorfCos !== null && w.z.dorfCos > 0.9;
        // (S3) SELBST-TEST: die alte −(sin, cos)-Richtung in der Naht → „vor dir" kippt hinter dich
        if (fn("_blickVorn")) {
            const echt = r._blickVorn;
            w.z.s3 = vorDir((yaw, pitch, out) => {
                const o = echt.call(r, yaw, pitch, out);
                o.x = -o.x;
                o.z = -o.z;
                return o;
            });
            w.c.s3 = w.z.s3 < 0;
        }
        // der Pfeil aufs Fadenkreuz bei 45° Steigung: seine BAHN erreicht den Punkt des Fadenkreuzes (Welle LF: er fällt, die
        // Ballistik hebt ihn) — gemessen der Winkel zwischen Pfeil und Fadenkreuz-Punkt von der Kamera aus, wenn der Pfeil die
        // Weite des Punkts erreicht
        if (rec) {
            ausruesten("klinge_langbogen");
            s.yaw = 0;
            s.pitch = Math.PI / 4;
            kamera();
            const cam = s.camera.position.clone();
            const zp = r._blickZiel(A.BLICK_ZIEL_M);
            const Z = V3().set(zp.x, zp.y, zp.z);
            const weite = Z.distanceTo(cam);
            const vorher = (s._pfeile || []).length;
            p._shotCooldownUntil = 0;
            r._beginPlayerShot(rec, 1);
            const pf = (s._pfeile || [])[vorher];
            if (pf) {
                for (let k = 1; k <= 2400 && s._pfeile.includes(pf); k++) {
                    if (V3().set(pf.x, pf.y, pf.z).distanceTo(cam) >= weite) break;
                    r._tickPfeile(pf.born + k / 240);
                }
                const P = V3().set(pf.x, pf.y, pf.z);
                w.z.pfeilFadenkreuz = grad(P.sub(cam).angleTo(V3().subVectors(Z, cam)));
                if (s._pfeile.includes(pf)) {
                    r._pfeilDespawn(pf);
                    s._pfeile.splice(s._pfeile.indexOf(pf), 1);
                }
            }
            w.c.pfeilFadenkreuz = Number.isFinite(w.z.pfeilFadenkreuz) && w.z.pfeilFadenkreuz < 1;
        }

        // ═══ WELLE LF KAMPF (09.10.) — die Posten der Leben-Schau 07.10. (artifacts/profiband/leben/befund-kampf.md) ═══
        if (fn("setCameraMode")) r.setCameraMode("first");
        // (T16) DIE TREFFER-ENERGIE FOLGT DEM SCHWUNG (Posten 1): derselbe Hieb auf denselben Hirsch — drei Abstände (1,3 ·
        // 1,6 · 1,9 m) × fünf Lagen des Leibs (Breitseite, abgewandt, zugewandt, zwei schräg), das Fadenkreuz auf der
        // Leibes-Mitte. Gemessen: die Energie des Urteils je Treffer (KE am Kontakt). Befund: Großschwert in 1,6 m, Hirsch
        // abgewandt → Kontakt am Griff-Drittel, 15–18 J; in 1,7 m 91 J; der Dolch 24–32 J.
        await teil("T16", async () => {
            const hE = setze("wesen");
            const detail = [];
            const energie = (name, d, rotY, dy = 0) => {
                ausruesten(name);
                if (s.blueprints[name]) r._setBlueprintWear(s.blueprints[name], 1);
                stelle(hE, d, 0, dy);
                hE.rotation.set(0, rotY, 0);
                hE.updateMatrixWorld(true);
                zielen(punkt(hE, null));
                const sw = schwung();
                const j = traf(sw, hE) && sw.juice[0];
                if (j)
                    detail.push({
                        name: name.replace("klinge_", ""),
                        d,
                        ort: j.ort,
                        eff: j.eff && +j.eff.toFixed(2),
                        v: j.v && +j.v.toFixed(1),
                    });
                return j && Number.isFinite(j.ke) ? +j.ke.toFixed(2) : null;
            };
            const lagen = [Math.PI / 2, 0, Math.PI, Math.PI / 4, -Math.PI / 4];
            const reihe = (name, abst) => {
                const out = [];
                for (const d of abst) for (const ry of lagen) out.push(energie(name, d, ry));
                return out;
            };
            w.z.energie = {
                gross: reihe("klinge_grossschwert", [1.3, 1.6, 1.9]),
                dolch: reihe("klinge_dolch", [1.2, 1.6]),
            };
            w.z.energie.detail = detail;
            w.z.energie.befund = [1.5, 1.6, 1.7].map((d) => energie("klinge_grossschwert", d, 0));
            // die benannte Streuung: zu nah (ein Kitz, L 0,6, in 0,6 m auf einer Stufe 1 m über dem Fuß, Breitseite — der Bogen
            // liegt waagrecht, der Leib nur am Griff-Teil) trifft das Großschwert nicht mit dem Schlagpunkt — der Kern nennt
            // den Ort und hält die Wirkung über seinem Boden
            {
                const wegRoh = r._kampfTrefferWeg;
                let weg = null;
                r._kampfTrefferWeg = function (...a) {
                    const o = wegRoh.apply(this, a);
                    weg = o ? [+o.lo.toFixed(2), +o.hi.toFixed(2)] : null;
                    return o;
                };
                let ke;
                const L0e = hE.scale.x;
                try {
                    hE.scale.setScalar(0.6);
                    ke = energie("klinge_grossschwert", 0.6, Math.PI / 2, 1.0);
                } finally {
                    hE.scale.setScalar(L0e);
                    r._kampfTrefferWeg = wegRoh;
                    delete r._kampfTrefferWeg;
                }
                const j = juice[juice.length - 1];
                w.z.energie.nah = { ke, ort: j ? j.ort : null, eff: j ? j.eff : null, weg };
            }
            if (hE) parke(hE);
        });
        // (T17) EINE REICHWEITE AUS DER WAFFE (Posten 3): die Befund-Geometrie — ein Fuchs 1,8 m vor dir, seine Füße 0,77 m
        // tiefer, das Fadenkreuz auf ihm, neun Klicks über den EINEN Dispatcher (tryMouseBreak) mit dem Langschwert. Gemessen:
        // das Verb des Drückens (hieb am Tier oder Luftschlag), Treffer, und was der Spieler-Kanal sagt. Gegenprobe: derselbe
        // Fuchs in 1,3 m / −0,6 m (in Reichweite) trifft. Befund: das Tor wählte „hieb" bis 6 m ab der Schulter, die Klinge
        // reichte 2,46 m — 9 Schwünge, 0 Treffer, kein Hinweis.
        await teil("T17", async () => {
            const fR = setze("fuchs");
            ausruesten("klinge_langschwert");
            if (s.blueprints.klinge_langschwert) r._setBlueprintWear(s.blueprints.klinge_langschwert, 1);
            const sagRoh = r._spielerSagt;
            const gesagt = [];
            r._spielerSagt = function (t) {
                gesagt.push(String(t));
                return sagRoh.call(this, t);
            };
            const klick = () => {
                p._swing = null;
                p._hitStopUntil = 0;
                r._spielerSagtLetzte = null;
                const n0 = treff.length;
                r.tryMouseBreak();
                if (p._swing) {
                    p._swing.lastT = T;
                    for (let k = 0; k < 1200 && p._swing; k++) {
                        T += 0.005;
                        r._tickKampfSchwung(T);
                    }
                }
                return treff.slice(n0).filter((t) => t.c === fR && t.src === "player").length;
            };
            const serieR = (d, dy) => {
                const g0 = gesagt.length;
                let n = 0;
                for (let i = 0; i < 9; i++) {
                    stelle(fR, d, 0, dy);
                    zielen(punkt(fR, null));
                    n += klick();
                }
                return { treffer: n, gesagt: gesagt.slice(g0) };
            };
            try {
                w.z.reich = {
                    klinge: +r._kampfBladeReach().toFixed(2),
                    weit: serieR(1.8, -0.77),
                    nah: serieR(1.3, -0.6),
                    // der Code des Dispatchers ohne Kommentare (die Kommentare zitieren die alte Zahl)
                    toreZahl: (
                        window.__codeOf(A.prototype.tryMouseBreak).match(/reachMaxM/g) || []
                    ).length,
                };
            } finally {
                r._spielerSagt = sagRoh;
                delete r._spielerSagt;
                parke(fR);
            }
        });
        // (T26) DER HIEB TRIFFT IM HORIZONT-BLICK (K13): die Klick-Pfad-Matrix gegen einen gehaltenen Wolf (Größe 1, Breitseite,
        // die Mitte d vor dem Spieler) — je Fall ein Klick über tryMouseBreak, der Schwung bis zu seinem Ende. „rumpf": das
        // Fadenkreuz auf der Leibes-Mitte; „horizont": die Gier aufs Tier, die Neigung waagrecht (der Blick geht über den Wolf).
        // Der Täter je Fall: kein Schwung (der Klick wurde kein Hieb) · zu weit (der Hinweis) · kein Ziel unter dem Fadenkreuz
        // (der Schwung ohne Ziel) · Sweep vorbei. Dazu der Wolf 1 m hinter dem Rücken (Horizont nach vorn) und der Dolch Reichweite + 0,8 m vor
        // dem Wolf (Rumpf, jenseits seiner Klinge). Selbst-Test (S10): die Kegel-Wahl ≡ null → die Horizont-Fälle nennen „kein
        // Ziel unter dem Fadenkreuz".
        await teil("T26", async () => {
            s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 2);
            const wolf = r.spawnCreatureAt(pm.position.x + 300, pm.position.y, pm.position.z + 300, "calm", "wolf", {
                bodySize: 1,
            });
            if (!wolf) throw new Error("Wolf-Spawn");
            tiere.push(wolf);
            const sagRoh = r._spielerSagt;
            const gesagt = [];
            r._spielerSagt = function (t) {
                gesagt.push(String(t));
                return sagRoh.call(this, t);
            };
            const horizont = (pt) => {
                for (let it = 0; it < 20; it++) {
                    kamera();
                    const c = s.camera.position;
                    const d = camDir();
                    const gy = Math.atan2(pt.x - c.x, pt.z - c.z) - Math.atan2(d.x, d.z);
                    s.yaw += Math.atan2(Math.sin(gy), Math.cos(gy));
                    s.pitch = 0;
                }
                kamera();
            };
            const klick = (c) => {
                p._swing = null;
                p._hitStopUntil = 0;
                p._mausVerb = null;
                p.stamina = Math.max(p.stamina || 0, 100);
                r._spielerSagtLetzte = null;
                const n0 = treff.length,
                    g0 = gesagt.length;
                r.tryMouseBreak();
                const sw = p._swing;
                const ziel = !!(sw && sw.ziel);
                if (sw) {
                    sw.lastT = T;
                    for (let k = 0; k < 1200 && p._swing; k++) {
                        T += 0.005;
                        r._tickKampfSchwung(T);
                    }
                }
                const dmg = treff
                    .slice(n0)
                    .filter((t) => t.c === c && t.src === "player")
                    .reduce((a, t) => a + t.amount, 0);
                const hinweis = gesagt.slice(g0).some((x) => /reicht/.test(x));
                return {
                    dmg: +dmg.toFixed(1),
                    schwung: !!sw,
                    ziel,
                    hinweis,
                    verb: p._mausVerb || null,
                    taeter:
                        dmg > 0
                            ? null
                            : !sw
                              ? `kein Schwung (${p._mausVerb || "–"})`
                              : hinweis
                                ? "zu weit"
                                : !ziel
                                  ? "kein Ziel unter dem Fadenkreuz"
                                  : "Sweep vorbei",
                };
            };
            const K = A._arenaGesetz().schwung;
            // die Leibes-Mitte: die Mitte der Rumpf-Kapsel der Treffer-Gestalt (die Mitte der Hülle liegt unter dem Bauch,
            // zwischen den Läufen — ein Strahl durch sie verfehlt den Leib)
            const rumpfPunkt = (c) => {
                c.updateMatrixWorld(true);
                const g = (r._kreaturTrefferGlieder(c) || []).find((x) => x.zone === "rumpf");
                return g ? g.a.clone().lerp(g.b, 0.5).applyMatrix4(g.anker.matrixWorld) : punkt(c, null);
            };
            const matrix = (waffen, modi) => {
                const faelle = [];
                for (const mode of modi) {
                    r.setCameraMode(mode);
                    for (const wn of waffen) {
                        const name = "klinge_" + wn;
                        ausruesten(name);
                        if (s.blueprints[name]) r._setBlueprintWear(s.blueprints[name], 1);
                        const klinge = r._kampfSchwungRahmen({}).reach + K.bladeRadiusM;
                        for (const [dn, d] of [
                            ["0,9", 0.9],
                            ["1,3", 1.3],
                            ["R−0,2", klinge - 0.2],
                        ])
                            for (const blick of ["rumpf", "horizont"]) {
                                stelle(wolf, d);
                                if (blick === "rumpf") zielen(rumpfPunkt(wolf));
                                else horizont(rumpfPunkt(wolf));
                                faelle.push({ mode, wn, d: dn, blick, ...klick(wolf) });
                            }
                    }
                }
                return faelle;
            };
            try {
                const W8 = [
                    "degen",
                    "saebel",
                    "langschwert",
                    "grossschwert",
                    "kriegsaxt",
                    "kriegshammer",
                    "keule",
                    "streitkolben",
                ];
                const t0 = Date.now();
                const faelle = matrix(W8, ["third", "first"]);
                // der Wolf 1 m hinter dem Rücken, der Blick waagrecht nach vorn
                r.setCameraMode("first");
                ausruesten("klinge_langschwert");
                s.pitch = 0;
                kamera();
                const vorn = camDir();
                stelle(wolf, 0);
                wolf.position.set(pm.position.x - vorn.x, fussY(), pm.position.z - vorn.z);
                wolf.updateMatrixWorld(true);
                const rk = klick(wolf);
                const dot = vorn.x * (wolf.position.x - pm.position.x) + vorn.z * (wolf.position.z - pm.position.z);
                // der Wolf als Begleiter (er folgt dir) 1,3 m vor dir, der Blick waagrecht über ihn: der Kegel wählt ihn nie
                r.assignCreatureTask(wolf, "follow_player", {}, { silent: true });
                stelle(wolf, 1.3);
                horizont(rumpfPunkt(wolf));
                const bg = klick(wolf);
                r.assignCreatureTask(wolf, "wander", {}, { silent: true });
                // der Dolch Reichweite + 0,8 m vor dem Wolf, das Fadenkreuz auf ihm (3rd): jenseits der Klinge
                r.setCameraMode("third");
                ausruesten("klinge_dolch");
                if (s.blueprints.klinge_dolch) r._setBlueprintWear(s.blueprints.klinge_dolch, 1);
                const klingeD = r._kampfSchwungRahmen({}).reach + K.bladeRadiusM;
                stelle(wolf, klingeD + 0.8);
                zielen(rumpfPunkt(wolf));
                const zw = klick(wolf);
                // DIE ERNTE NEBEN DEM WILDTIER (Runde 2): ein ruhiger wilder Wolf steht 1,2 m neben dem Spieler (0,5 rad seitlich) im
                // Schwung-Kegel, der Blick geht −0,5 rad abwärts (3rd), und das Fadenkreuz trägt sein Ziel in Arm-Länge — ein Stein-
                // Block (abbau, Langschwert), eine Blüte (pflücken, Langschwert; die Nah-Streu wächst erst im Takt um den Spieler: der
                // Streu-Pick nennt die Blüte, die Ernte zeichnet auf), der Boden vor der Spitzhacke (graben; der Erd-Auftrag zeichnet
                // auf, die Welt bleibt ungekerbt). Der Klick bleibt beim Ziel des Fadenkreuzes, der Wolf heil. Gegenfall „fern": ein
                // Stein-Pfeiler 8 m voraus, jenseits der Arm-Länge, unter dem waagrechten Fadenkreuz, der Wolf 1,3 m voraus — der Hieb
                // trifft den Wolf. Der Ort: freier Boden (der Spawn steht auf der Start-Plattform), kein Bauwerk unter dem Fadenkreuz.
                const ernte = [];
                const ortAlt = pm.position.clone();
                const ernteSteine = [];
                const gepflueckt = [];
                const erde = [];
                try {
                    r.setCameraMode("third");
                    const geraet = (name) => {
                        ausruesten(name);
                        if (s.blueprints[name]) r._setBlueprintWear(s.blueprints[name], 1);
                    };
                    // die Kamera folgt dem Spieler mit Nachlauf: nach jedem Ortswechsel und jeder Neigung bis zur Ruhe führen
                    const neige = (pitch) => {
                        s.pitch = pitch;
                        for (let i = 0; i < 40; i++) kamera();
                    };
                    const vorn = (dist, seit = 0) => {
                        const dd = camDir();
                        const g = Math.atan2(dd.x, dd.z) + seit;
                        const x = pm.position.x + Math.sin(g) * dist;
                        const z = pm.position.z + Math.cos(g) * dist;
                        return { g, P: V3().set(x, r.getTerrainHeightAt(x, z), z) };
                    };
                    const wolfAn = (dist, seit) => {
                        const { g, P } = vorn(dist, seit);
                        stelle(wolf, 0);
                        wolf.position.copy(P);
                        wolf.rotation.set(0, g + Math.PI / 2, 0);
                        wolf.updateMatrixWorld(true);
                    };
                    const stein = (P, hoch) => {
                        const nm = "_kg_stein_" + ernteSteine.length;
                        s.blueprints[nm] = {
                            name: nm,
                            parts: [
                                {
                                    shape: "box",
                                    material: "stein",
                                    size: { x: 0.8, y: hoch, z: 0.8 },
                                    position: { x: 0, y: hoch / 2, z: 0 },
                                },
                            ],
                        };
                        const e = r.spawnArchitecture(nm, { x: P.x, y: P.y, z: P.z }, { precise: true, seed: 1 });
                        ernteSteine.push({ nm, e });
                        return { e, M: e && e.mesh ? new THREE.Box3().setFromObject(e.mesh).getCenter(V3()) : null };
                    };
                    // der Abstand des Ziels vom Anfang des Fadenkreuz-Strahls (die Arm-Länge misst dort)
                    const strahlAb = (P) => {
                        const F = r._fadenkreuzStrahl();
                        return F ? +F.o.distanceTo(P).toFixed(2) : null;
                    };
                    let frei = false;
                    let ortK = -1;
                    for (let k = 0; k < 24 && !frei; k++) {
                        const g = k * 2.4;
                        const x = ortAlt.x + Math.sin(g) * (40 + 8 * k);
                        const z = ortAlt.z + Math.cos(g) * (40 + 8 * k);
                        pm.position.set(x, r.getTerrainHeightAt(x, z) + A.PLAYER_FOOT_OFFSET, z);
                        pm.updateMatrixWorld(true);
                        neige(0);
                        const w0 = r._pickArchitectureAtCrosshair();
                        const waagrecht = !w0 || w0.point.distanceTo(pm.position) > 12;
                        neige(-0.5);
                        const H = r._raycastWorldHit(30);
                        const abH = H.hit ? strahlAb(V3().set(H.x, H.y, H.z)) : Infinity;
                        // der Boden unter dem geneigten Fadenkreuz liegt sicher in Arm-Länge (am Hang abwärts läge er dahinter)
                        frei =
                            waagrecht && !r._pickArchitectureAtCrosshair() && abH >= 1.5 && abH <= A.FORAGE.reach - 1.5;
                        ortK = k;
                    }
                    ernte.ortK = frei ? ortK : -1;
                    const fall = (soll, ziel, ab) => {
                        wolfAn(1.2, 0.5);
                        const k = klick(wolf);
                        ernte.push({ soll, ziel: !!(frei && ziel), ab, verb: k.verb, dmg: k.dmg });
                    };
                    const armLaenge = A.FORAGE.reach;
                    const bodenPunkt = () => {
                        const H = r._raycastWorldHit(30);
                        return H.hit ? V3().set(H.x, H.y, H.z) : null;
                    };
                    // abbau: der Stein-Block (1,2 m hoch) 3,2 m voraus, das Fadenkreuz auf seiner Mitte — der Wolf daneben steht dem
                    // Auge näher als der Block (die Kamera-Abstände, die der Kegel vorher verglich)
                    geraet("klinge_langschwert");
                    neige(-0.5);
                    const sb = stein(vorn(3.2).P, 1.2);
                    if (sb.M) zielen(sb.M);
                    const unterB = r._pickArchitectureAtCrosshair();
                    const abA = unterB ? strahlAb(unterB.point) : null;
                    fall("abbau", !!(sb.e && unterB && unterB.entry === sb.e && abA <= armLaenge), abA);
                    if (sb.e) r.removeArchitecture(sb.e);
                    // pflücken: die Blüte, wo das Fadenkreuz den Boden trifft
                    neige(-0.5);
                    const PB = bodenPunkt();
                    const abB = PB ? strahlAb(PB) : null;
                    r._pickScatterAtCrosshair = () =>
                        PB ? { key: "_kg", senke: "_kg", name: "bluete", id: 0, point: PB } : null;
                    r._harvestScatterPick = (pk) => (gepflueckt.push(pk && pk.name), true);
                    fall("pfluecken", !!PB && !r._pickArchitectureAtCrosshair() && abB <= armLaenge, abB);
                    delete r._pickScatterAtCrosshair;
                    delete r._harvestScatterPick;
                    // graben: der Boden vor der Spitzhacke
                    geraet("klinge_spitzhacke");
                    neige(-0.5);
                    const PC = bodenPunkt();
                    const abC = PC ? strahlAb(PC) : null;
                    r.dslRun = (op) => (erde.push(op && op[0]), { ok: true });
                    fall(
                        "graben",
                        !!s.blueprints.klinge_spitzhacke &&
                            !!PC &&
                            !r._pickArchitectureAtCrosshair() &&
                            abC <= armLaenge,
                        abC
                    );
                    delete r.dslRun;
                    // fern: der Pfeiler 8 m voraus jenseits der Arm-Länge, das Fadenkreuz waagrecht auf ihm, der Wolf 1,3 m voraus
                    geraet("klinge_langschwert");
                    neige(0);
                    const PF = vorn(8).P;
                    const FoY = r._fadenkreuzStrahl().o.y;
                    // der Pfeiler (6 m hoch) überragt den waagrechten Strahl, wie der Boden dort auch fällt oder steigt
                    const sp = stein(V3().set(PF.x, Math.min(PF.y, FoY - 2), PF.z), 6);
                    if (sp.M) zielen(V3().set(sp.M.x, FoY, sp.M.z));
                    wolfAn(1.3, 0);
                    const unterF = r._pickArchitectureAtCrosshair();
                    const abF = unterF ? strahlAb(unterF.point) : null;
                    const kf = klick(wolf);
                    ernte.push({
                        soll: "hieb",
                        fern: true,
                        ziel: !!(frei && sp.e && unterF && unterF.entry === sp.e && abF > armLaenge),
                        ab: abF,
                        verb: kf.verb,
                        dmg: kf.dmg,
                    });
                } finally {
                    delete r._pickScatterAtCrosshair;
                    delete r._harvestScatterPick;
                    delete r.dslRun;
                    for (const x of ernteSteine) {
                        if (x.e) r.removeArchitecture(x.e);
                        delete s.blueprints[x.nm];
                    }
                    pm.position.copy(ortAlt);
                    pm.updateMatrixWorld(true);
                }
                const ernteZeugen = { gepflueckt: gepflueckt.length, erde: erde.length, ort: ernte.ortK };
                // Selbst-Test (S10): die Kegel-Wahl verstummt — die Horizont-Fälle müssen den Täter nennen
                r._kampfKegelZiel = () => null;
                let selbst;
                try {
                    selbst = matrix(["langschwert"], ["third", "first"]);
                } finally {
                    delete r._kampfKegelZiel; // die eigene Hülle fällt, die Methode der Klasse trägt wieder
                }
                w.z.klick = {
                    faelle,
                    ruecken: { dmg: rk.dmg, ziel: rk.ziel, dot: +dot.toFixed(2) },
                    begleiter: { dmg: bg.dmg, ziel: bg.ziel },
                    zuWeit: {
                        klinge: +klingeD.toFixed(2),
                        schwung: zw.schwung,
                        gesagt: zw.hinweis,
                        dmg: zw.dmg,
                        verb: zw.verb,
                    },
                    ernte: ernte.map((e) => ({ ...e })),
                    ernteZeugen,
                    selbst: selbst.filter((f) => f.blick === "horizont").map((f) => f.taeter),
                    ms: Date.now() - t0,
                };
            } finally {
                r._spielerSagt = sagRoh;
                delete r._spielerSagt;
                r.setCameraMode("first");
                parke(wolf);
            }
        });
        // (T18) POSE, TREFFER-VOLUMEN UND ICH-SICHT LESEN DENSELBEN SCHWUNG (Posten 2): je Ziel EIN Großschwert-Hieb; im
        // Treffer-Takt steht die Anzeige-Uhr (Hit-Stop ∞), die Pose des Spielers wird gelegt (animatePlayerSoul), die Kamera
        // folgt (_loopCamera). Gemessen gegen das TREFFER-VOLUMEN selbst — die Strecke, die der Sweep der Gestalt reicht
        // (_kreaturGliedTreffer, Strecke a→b): der Abstand der sichtbaren Spitze und der Klingen-Mitte (Ecken des Geräts in
        // Welt, die Spitze am weitesten vom Handgelenk) von ihrer Geraden, und ob Spitze und Mitte im Bild der Ich-Kamera
        // liegen (Spitze UND Mitte). Befund: im Treffer-Takt stand das Großschwert über dem Kopf (ks02), die Ich-Sicht zeigte keine Klinge (ks01).
        await teil("T18", async () => {
            const hP = setze("wesen");
            ausruesten("klinge_grossschwert");
            if (s.blueprints.klinge_grossschwert) r._setBlueprintWear(s.blueprints.klinge_grossschwert, 1);
            // die Studio-Gestalt in der Hand abwarten (die Foundry baut sie; bis dahin trägt der Teile-Bau) — gemessen wird die
            // Klinge, die der Spieler sieht
            for (let i = 0; i < 120 && !(pm.userData.heldMesh && pm.userData.heldMesh.userData.foundryHeld); i++)
                await new Promise((res) => setTimeout(res, 125));
            // die Ich-Regel bleibt rückstandsfrei: 3rd → 1st → 3rd stellt jede Sichtbarkeit UND Ebene des Leibs wieder her, und
            // im 1st zeichnet keine Haut (die Kamera sitzt im Leib) außer dem Gerät in der Hand. „Zeichnet" fragt, was r184s
            // _projectObject fragt: jeder Ahne sichtbar UND die eigene Ebene in der Haupt-Kamera — die Ich-Regel ist die
            // Ebenen-Regel (0910-5): die Haut verlässt Ebene 0 und bleibt sichtbar, damit sie in den Kaskaden wirft
            {
                const heldR = pm.userData.heldMesh;
                const unterGeraet = (o) => {
                    for (let n = o; n && n !== pm; n = n.parent) if (n === heldR) return true;
                    return false;
                };
                const sicht = () => {
                    const a = [];
                    pm.traverse((o) => {
                        if (o.isMesh) a.push(o.visible + "/" + o.layers.mask);
                    });
                    return a.join(",");
                };
                r.setCameraMode("third");
                r._loopCamera(T);
                const v3 = sicht();
                r.setCameraMode("first");
                r._loopCamera(T);
                let hautSichtbar = 0;
                pm.traverseVisible((o) => {
                    if (o.isMesh && !unterGeraet(o) && o.layers.test(s.camera.layers)) hautSichtbar++;
                });
                r.setCameraMode("third");
                r._loopCamera(T);
                w.z.egoRegel = { rueckstand: sicht() !== v3, hautImErsten: hautSichtbar };
                r.setCameraMode("first");
                r._loopCamera(T);
            }
            // die Strecke der Klinge im Kontakt-Takt: der Kontakt-Richter des Sweeps (Welle LF: _kampfKlingenKontakt —
            // Klinge B → T und das Tier), auf älteren Ständen der Glied-Test der Gestalt (Strecke a → b)
            const naht = fn("_kampfKlingenKontakt") ? "_kampfKlingenKontakt" : "_kreaturGliedTreffer";
            const gtRoh = r[naht];
            let strecke = null;
            r[naht] = function (...arg) {
                const tr = gtRoh.apply(this, arg);
                if (naht === "_kampfKlingenKontakt") {
                    const [, cr, , B, Tt] = arg;
                    if (tr && cr === hP && !strecke)
                        strecke = {
                            a: V3().set(B.x, B.y, B.z),
                            b: V3().set(Tt.x, Tt.y, Tt.z),
                            rad: A._arenaGesetz().schwung.bladeRadiusM,
                        };
                } else {
                    const [cr, ax, ay, az, bx, by, bz, rad] = arg;
                    if (tr && cr === hP && !strecke)
                        strecke = { a: V3().set(ax, ay, az), b: V3().set(bx, by, bz), rad };
                }
                return tr;
            };
            const geraetPunkte = () => {
                const held = pm.userData && pm.userData.heldMesh;
                const rig = pm.userData && pm.userData.rig;
                if (!held || !rig || !rig.armR || !rig.armR.wrist) return null;
                pm.updateMatrixWorld(true);
                const W = rig.armR.wrist.getWorldPosition(V3());
                let tip = null,
                    best = -1;
                const v = V3();
                held.traverse((o) => {
                    const pa = o.isMesh && o.geometry && o.geometry.attributes && o.geometry.attributes.position;
                    if (!pa) return;
                    for (let i = 0; i < pa.count; i += Math.max(1, Math.floor(pa.count / 400))) {
                        v.fromBufferAttribute(pa, i).applyMatrix4(o.matrixWorld);
                        const d2 = v.distanceToSquared(W);
                        if (d2 > best) {
                            best = d2;
                            tip = v.clone();
                        }
                    }
                });
                return tip ? { W, T: tip, M: W.clone().add(tip).multiplyScalar(0.5) } : null;
            };
            const abGerade = (q, a, b) => {
                const ab = V3().subVectors(b, a);
                const t = V3().subVectors(q, a).dot(ab) / Math.max(1e-9, ab.lengthSq());
                return V3().copy(a).addScaledVector(ab, t).distanceTo(q);
            };
            const imBild = (q) => {
                const n = q.clone().project(s.camera);
                return Math.abs(n.x) <= 1 && Math.abs(n.y) <= 1 && n.z < 1 && n.z > -1;
            };
            const probe = (d, rotY, seit) => {
                stelle(hP, d, seit);
                hP.rotation.set(0, rotY, 0);
                hP.updateMatrixWorld(true);
                zielen(punkt(hP, null));
                strecke = null;
                p._swing = null;
                p._hitStopUntil = 0;
                const n0 = treff.length;
                if (!r._beginPlayerSwing(r._pickCreatureAtCrosshair()) || !p._swing) return null;
                p._swing.lastT = T;
                for (let k = 0; k < 1200 && p._swing && !treff.slice(n0).some((t) => t.c === hP); k++) {
                    T += 0.004;
                    r._tickKampfSchwung(T);
                }
                if (!strecke || !p._swing) return { traf: false };
                // der Treffer-Takt: die Anzeige-Uhr steht, die Pose dieses Takts wird gelegt, die Ich-Kamera folgt
                p._hitStopUntil = Infinity;
                r.animatePlayerSoul(T);
                r._loopCamera(T);
                s.camera.updateMatrixWorld(true);
                const g = geraetPunkte();
                const out = { traf: true };
                if (g) {
                    out.spitzeAb = +abGerade(g.T, strecke.a, strecke.b).toFixed(2);
                    out.mitteAb = +abGerade(g.M, strecke.a, strecke.b).toFixed(2);
                    // die Klinge steht im Bild: Spitze UND Mitte in der Ich-Kamera (die Hand allein ist keine Klinge) — und sie
                    // ZEICHNET: das Gerät und jeder Knoten über ihm bis zur Szene sind sichtbar (die Ich-Sicht verbarg den
                    // ganzen Leib samt der Hand, an der das Gerät hängt), und seine Meshes liegen auf der Ebene der Ich-Kamera
                    const held = pm.userData.heldMesh;
                    let zeichnet = true;
                    for (let n = held; n && !n.isScene; n = n.parent) if (!n.visible) zeichnet = false;
                    let meshSichtbar = 0;
                    held.traverseVisible((o) => {
                        if (o.isMesh && o.layers.test(s.camera.layers)) meshSichtbar++;
                    });
                    out.zeichnet = zeichnet && meshSichtbar > 0;
                    out.imBild = out.zeichnet && imBild(g.T) && imBild(g.M);
                    out.held = held.userData.foundryHeld ? "studio" : "teile";
                    // die Klinge TRIFFT, WO MAN SIE SIEHT: der Spalt zwischen der sichtbaren Klinge (Handgelenk → Spitze) und der
                    // Gestalt des Tiers (seine Glieder-Kapseln) im Treffer-Takt
                    const gl = r._kreaturTrefferGlieder(hP) || [];
                    hP.updateMatrixWorld(true);
                    let spalt = Infinity;
                    for (const gg of gl) {
                        const pa = V3().copy(gg.a).applyMatrix4(gg.anker.matrixWorld);
                        const pb = V3().copy(gg.b).applyMatrix4(gg.anker.matrixWorld);
                        const d = Math.sqrt(
                            r._segSegDistSq(
                                g.W.x,
                                g.W.y,
                                g.W.z,
                                g.T.x,
                                g.T.y,
                                g.T.z,
                                pa.x,
                                pa.y,
                                pa.z,
                                pb.x,
                                pb.y,
                                pb.z
                            )
                        );
                        spalt = Math.min(spalt, d - gg.r * gg.anker.matrixWorld.getMaxScaleOnAxis());
                    }
                    out.spalt = Number.isFinite(spalt) ? +Math.max(0, spalt).toFixed(2) : null;
                    out.rad = strecke.rad;
                }
                p._hitStopUntil = 0;
                p._swing = null;
                r.animatePlayerSoul(T + 0.02);
                return out;
            };
            try {
                w.z.pose = [probe(1.6, 0, 0), probe(1.6, Math.PI / 2, 0), probe(1.8, Math.PI / 2, 0.3)];
            } finally {
                r[naht] = gtRoh;
                delete r[naht];
                p._hitStopUntil = 0;
                p._swing = null;
                parke(hP);
            }
        });
        // (T19) DIE AUSDAUER JE HIEB AUS DER MASSE (Posten 8): im Modus pfad je Gerät EIN Hieb über _beginPlayerSwing bei
        // voller Ausdauer — gemessen, was der Hieb zehrt, und die Masse des Geräts (kampfMasze des Kerns). Befund: 5 je Hieb
        // für Dolch, Großschwert und Keule (flach).
        await teil("T19", async () => {
            const modeA = r.getGameMode();
            r.setGameMode("pfad");
            const zehr = [];
            for (const name of [
                null,
                "klinge_dolch",
                "klinge_langschwert",
                "klinge_grossschwert",
                "klinge_keule",
                "klinge_vorschlaghammer",
            ]) {
                ausruesten(name);
                if (name && s.blueprints[name]) r._setBlueprintWear(s.blueprints[name], 1);
                p._swing = null;
                p.stamina = 100;
                const ok = r._beginPlayerSwing();
                const km = name && s.blueprints[name] ? r._schmiedeKampfMasze(s.blueprints[name]) : null;
                zehr.push({
                    geraet: name ? name.replace("klinge_", "") : "faust",
                    kg: km ? +km.masseKg.toFixed(3) : 0,
                    zehrt: ok ? +(100 - p.stamina).toFixed(2) : null,
                });
                p._swing = null;
            }
            p.stamina = 100;
            if (r.getGameMode() !== modeA) r.setGameMode(modeA);
            w.z.ausdauer = zehr;
        });
        // (T27) LEBENSWERTE SIND ZUSTAND (K27): im Modus pfad senkt ein Biss (damagePlayer, jagd) hp und ein Hieb
        // (_beginPlayerSwing) die Ausdauer; danach geht jeder Rufer der Stat-Neuberechnung einmal — Gerät (equipHeld an und
        // ab, equipArmor an und ab, repairHeldDevice), Panel (_ichHandleOverlay), Boost (die Trauer der Bisse über der
        // Schwelle: tickPlayerBoosts an, addPlayerBoost, der Ablauf ab) und der Tod-Takt (drei tickPlayerVitals nach dem Tod
        // über damagePlayer). Vor jedem Rufer verwunden derselbe Biss und Hieb; gemessen werden hp, Ausdauer und Mana davor
        // und danach, erlaubt ist Regen·dt (hp hat kein Regen-Gesetz: 0). Auf das Maximum setzen nur die Wandlung
        // (applyPlayerSoul) und die Rückkehr (_playerDeathRespawn) — die Rufer mit `voll` liest die Probe aus dem Quelltext.
        // Selbst-Test (S11): die alte Zeile (hp, Ausdauer, Mana = Maximum bei JEDER Neuberechnung) als Hülle → der erste
        // Rufer heißt equipHeld. Befund K27: 4 Wege zur Voll-Heilung (Gerät, Panel, Boost, Tod-Takt).
        await teil("T27", async () => {
            const modeL = r.getGameMode();
            const inv = p.inventory;
            const savedL = {
                hp: p.hp,
                stamina: p.stamina,
                mana: p.mana,
                wound: p.deathWoundIntensity,
                grace: p.respawnGraceUntil,
                deathTick: p.deathLastTick,
                boosts: Array.isArray(p.boosts) ? p.boosts.slice() : p.boosts,
                boostTick: p.boostLastTick,
                trig: p.boostLastTriggered ? { ...p.boostLastTriggered } : p.boostLastTriggered,
                emo: p.emotions ? { ...p.emotions } : p.emotions,
                armor: p.equipped ? p.equipped.armor : null,
                ort: pm.position.clone(),
            };
            const zurueck = () => {
                p.hp = savedL.hp;
                p.stamina = savedL.stamina;
                p.mana = savedL.mana;
                p.deathWoundIntensity = savedL.wound;
                p.respawnGraceUntil = savedL.grace;
                p.deathLastTick = savedL.deathTick;
                p.boosts = Array.isArray(savedL.boosts) ? savedL.boosts.slice() : savedL.boosts;
                p.boostLastTick = savedL.boostTick;
                p.boostLastTriggered = savedL.trig ? { ...savedL.trig } : savedL.trig;
                if (savedL.emo) p.emotions = { ...savedL.emo };
                pm.position.copy(savedL.ort);
                pm.updateMatrixWorld(true);
                if (s.playerVel) s.playerVel.setValue(0, 0, 0);
            };
            const r3 = (x) => (Number.isFinite(x) ? +x.toFixed(3) : null);
            const WEG = {
                equipHeld: "Gerät",
                equipArmor: "Gerät",
                repairHeldDevice: "Gerät",
                _ichHandleOverlay: "Panel",
                tickPlayerBoosts: "Boost",
                addPlayerBoost: "Boost",
                tickPlayerVitals: "Tod-Takt",
            };
            const lauf = () => {
                r.setGameMode("pfad");
                p.deathWoundIntensity = 0;
                p.respawnGraceUntil = -Infinity;
                p.boosts = [];
                p.hp = p.hpMax;
                p.stamina = p.staminaMax;
                const lage = () => ({ hp: p.hp, st: p.stamina, mana: p.mana });
                const verwunde = () => {
                    const a = lage();
                    r.damagePlayer(6, "jagd");
                    p._swing = null;
                    r._beginPlayerSwing();
                    p._swing = null;
                    const b = lage();
                    return { hp: r3(a.hp - b.hp), st: r3(a.st - b.st) };
                };
                const schritte = [];
                const schritt = (rufer, f, regen) => {
                    verwunde();
                    if (p.manaMax > 0) p.mana = Math.min(Number.isFinite(p.mana) ? p.mana : 0, 0.3 * p.manaMax);
                    const a = lage();
                    let fehler = null;
                    try {
                        f();
                    } catch (e) {
                        fehler = String((e && e.message) || e).slice(0, 120);
                    }
                    const b = lage();
                    schritte.push({
                        rufer,
                        weg: WEG[rufer.split(" ")[0]] || "?",
                        hp: [r3(a.hp), r3(b.hp)],
                        st: [r3(a.st), r3(b.st)],
                        mana: [r3(a.mana), r3(b.mana)],
                        regen: regen || { hp: 0, st: 0, mana: 0 },
                        fehler,
                    });
                };
                const erst = verwunde();
                // Gerät
                schritt("equipHeld an", () => ausruesten("klinge_dolch"));
                schritt("equipHeld ab", () => ausruesten(null));
                schritt("equipArmor an", () => r.equipArmor("ruestung_brustpanzer"));
                schritt("equipArmor ab", () => r.equipArmor(null));
                ausruesten("klinge_dolch");
                const dolch = s.blueprints.klinge_dolch;
                r._setBlueprintWear(dolch, 0.5);
                const kosten = r.computeBuildCost("klinge_dolch") || {};
                const invAlt = {};
                for (const m of Object.keys(kosten)) {
                    invAlt[m] = inv[m];
                    inv[m] = (inv[m] || 0) + 1000;
                }
                schritt("repairHeldDevice", () => r.repairHeldDevice());
                for (const m of Object.keys(invAlt)) {
                    if (invAlt[m] === undefined) delete inv[m];
                    else inv[m] = invAlt[m];
                }
                r._setBlueprintWear(dolch, 1);
                ausruesten(null);
                // Panel
                schritt("_ichHandleOverlay", () => r._ichHandleOverlay(true));
                try {
                    r._ichHandleOverlay(false);
                } catch (_e) {}
                // Boost: die Trauer der Bisse steht über der Schwelle (die Refrakt-Pause frei), der Takt löst den Boost aus
                p.emotions.sorrow = 0.9;
                p.boostLastTriggered = { ...(p.boostLastTriggered || {}), "emotion:sorrow": -Infinity };
                p.boostLastTick = -Infinity;
                schritt("tickPlayerBoosts an", () => r.tickPlayerBoosts(T + 1000));
                const boostAn = (p.boosts || []).some((b) => b.source === "emotion:sorrow");
                schritt("addPlayerBoost", () =>
                    r.addPlayerBoost({ source: "consume:_t27", tagDelta: { dichte: 0.1 }, durationSeconds: 5 })
                );
                p.emotions.sorrow = 0;
                for (const b of p.boosts || []) b.expiresAt = performance.now() / 1000 - 1;
                p.boostLastTick = -Infinity;
                schritt("tickPlayerBoosts ab", () => r.tickPlayerBoosts(T + 2000));
                // ab: die beiden gesetzten Boosts sind abgelaufen (die Wut der Bisse darf einen eigenen auslösen)
                const boostAb = !(p.boosts || []).some(
                    (b) => b.source === "emotion:sorrow" || b.source === "consume:_t27"
                );
                // Tod über den Schadens-Weg, dann drei Vitals-Takte (je 1 s)
                p.respawnGraceUntil = -Infinity;
                r.damagePlayer(1000, "sturz");
                const rueckkehr = { hp: r3(p.hp), hpMax: r3(p.hpMax), wunde: r3(p.deathWoundIntensity) };
                p.respawnGraceUntil = -Infinity; // die Gnade (8 s) ist um — die Bisse der Vitals-Takte treffen wieder
                let tv = 1e6;
                for (let i = 0; i < 3; i++) {
                    const mag = (p.stats && p.stats.tags && p.stats.tags.magieleitung) || 0;
                    const regen = {
                        hp: 0,
                        st: s.playerUnderwater ? 0 : A.STAMINA_REGEN_PER_SEC || 5,
                        mana: (A.MANA_REGEN_PER_SEC || 3) * (1 + mag),
                    };
                    schritt(
                        "tickPlayerVitals " + (i + 1),
                        () => {
                            p.deathLastTick = tv;
                            tv += 1;
                            r.tickPlayerVitals(tv);
                        },
                        regen
                    );
                }
                return { erst, schritte, rueckkehr, boostAn, boostAb };
            };
            const ohneKommentar = window.__codeOf;
            const vollRufer = Object.getOwnPropertyNames(A.prototype)
                .filter((n) => n !== "constructor" && typeof A.prototype[n] === "function")
                .filter((n) => /recomputePlayerStats\(\s*\{\s*voll\s*:\s*true/.test(ohneKommentar(A.prototype[n])))
                .sort();
            try {
                w.z.leben = { ...lauf(), vollRufer };
                zurueck();
                // Selbst-Test (S11): die alte Zeile als Hülle um die Neuberechnung
                const neu = A.prototype.recomputePlayerStats;
                r.recomputePlayerStats = function (...a) {
                    const c = neu.apply(this, a);
                    const pl = this.state.player;
                    pl.hp = pl.hpMax;
                    pl.stamina = pl.staminaMax;
                    pl.mana = pl.manaMax;
                    return c;
                };
                try {
                    w.z.lebenSelbst = { ...lauf(), vollRufer };
                } finally {
                    delete r.recomputePlayerStats; // die Hülle fällt, die Methode der Klasse trägt wieder
                }
            } finally {
                try {
                    ausruesten(null);
                    r.equipArmor(savedL.armor || null);
                } catch (_e) {}
                zurueck();
                if (r.getGameMode() !== modeL) r.setGameMode(modeL);
            }
        });
        // (T20) DIE KAMPF-WERTE AUS GATTUNG × GRÖSSE (Posten 6): je Gattung (Fuchs · Wolf · Hirsch · Bär) und Größe (0,62 · 1 ·
        // 2) ein frisches Tier — Biss (damage), Haut (defense), Leben (hpMax) aus computeCreatureStats und die EINE Masse
        // seines Leibs (_leibMasse). Befund: damage 19,75 und defense 11,9 überall, nur hpMax 99,8–158,9.
        await teil("T20", async () => {
            const reihe = [];
            for (const seele of ["fuchs", "wolf", "wesen", "baer"])
                for (const L of [0.62, 1, 2]) {
                    s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 2);
                    const c = r.spawnCreatureAt(
                        pm.position.x + 500,
                        pm.position.y,
                        pm.position.z + 500,
                        "calm",
                        seele,
                        {
                            bodySize: L,
                        }
                    );
                    if (!c) continue;
                    const st0 = r.computeCreatureStats(c).stats;
                    reihe.push({
                        seele,
                        L,
                        kg: +r._leibMasse(c).toFixed(1),
                        damage: +st0.damage.toFixed(2),
                        defense: +st0.defense.toFixed(2),
                        hpMax: +st0.hpMax.toFixed(1),
                    });
                    r.removeCreature(c);
                }
            w.z.kampfWerte = reihe;
        });
        // (T21) DIE GESTALT DES PFEILS AUS DEM SCHMIEDE-KERN (Posten 4): ein Schuss mit dem Langbogen — gezählt, was fliegt
        // (Teile, beleuchteter Stoff, Schatten, Länge längs der Flug-Richtung), dazu die Quelle: der Wirt baut keinen eigenen
        // Zylinder, die Prüfstand-Shell keinen eigenen Pfeil. Befund: ein brauner MeshBasic-Zylinder ohne Spitze und Federn.
        await teil("T21", async () => {
            ausruesten("klinge_langbogen");
            const recP = fn("_heldBogenRecipe") ? r._heldBogenRecipe() : null;
            const pfeilAus = { teile: 0, unbeleuchtet: 0, wirft: 0, laenge: null, farben: 0 };
            if (recP) {
                const n0 = (s._pfeile || []).length;
                p._shotCooldownUntil = 0;
                r._beginPlayerShot(recP, 1);
                const pf = (s._pfeile || [])[n0];
                if (pf && pf.mesh) {
                    pf.mesh.updateMatrixWorld(true);
                    const inv = new THREE.Matrix4().copy(pf.mesh.matrixWorld).invert();
                    const box = new THREE.Box3().makeEmpty();
                    const bb = new THREE.Box3();
                    const farben = new Set();
                    pf.mesh.traverse((o) => {
                        if (!o.isMesh) return;
                        pfeilAus.teile++;
                        if (o.material && o.material.isMeshBasicMaterial) pfeilAus.unbeleuchtet++;
                        if (o.castShadow) pfeilAus.wirft++;
                        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
                        box.union(
                            bb
                                .copy(o.geometry.boundingBox)
                                .applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, o.matrixWorld))
                        );
                        const c = o.geometry.attributes.color;
                        if (c) farben.add([c.getX(0), c.getY(0), c.getZ(0)].map((x) => x.toFixed(2)).join("/"));
                    });
                    pfeilAus.laenge = +(box.max.z - box.min.z).toFixed(3);
                    pfeilAus.farben = farben.size;
                }
                if (pf) {
                    r._pfeilDespawn(pf);
                    s._pfeile.splice(s._pfeile.indexOf(pf), 1);
                }
            }
            pfeilAus.wirtZylinder = /CylinderGeometry\(0\.015/.test(A.prototype._pfeilMeshAttach.toString());
            // ein leerer Guss bricht laut (Nachbesserung 2 + 3): der Ofen liefert nichts — null ODER eine Gruppe ohne ein einziges
            // Mesh (jedes _foundryBuildMesh gab null), die Vorlage frisch — der Pfeil darf nicht still unsichtbar fliegen
            if (fn("_pfeilVorlage")) {
                const memo = r._pfeilVorlageMemo;
                const fbg = r._foundryBuildGroup;
                const still = [];
                for (const [name, leer] of [
                    ["null", () => null],
                    ["leere Gruppe", () => new THREE.Group()],
                ]) {
                    const pfT = { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 1 };
                    r._pfeilVorlageMemo = null;
                    r._foundryBuildGroup = leer;
                    try {
                        r._pfeilMeshAttach(pfT);
                        still.push(name);
                    } catch (_e) {
                        /* laut gebrochen — so trägt es */
                    } finally {
                        if (pfT.mesh) r._pfeilDespawn(pfT);
                        r._foundryBuildGroup = fbg;
                        delete r._foundryBuildGroup;
                        r._pfeilVorlageMemo = memo;
                    }
                }
                pfeilAus.leerStill = still.length ? still.join(", ") : false;
            }
            w.z.pfeilGestalt = pfeilAus;
        });
        // (T22) EIN TIER STIRBT WIE EIN TIER (Posten 7): ein Hirsch auf geneigtem Boden, das Gefälle LÄNGS seiner Leibes-Achse
        // (die Befund-Lage ks09: er blickt hangab) — die Naht `_fieldGradient` trägt das Gefälle (0,3 längs der Achse); dann der
        // Tod und der Kreatur-Takt. Gemessen: wohin die Leibes-Achse (vorn, lokal +z) und die Hochachse nach dem Kippen zeigen,
        // und ob der Leib 10 s danach noch liegt. Befund: der Hirsch richtete sich auf das Hinterteil auf (Kopf senkrecht) und war
        // nach 22 Takten fort.
        await teil("T22", async () => {
            const hT = setze("wesen");
            stelle(hT, 20, 6);
            hT.userData.bornAt = 1; // der Älteste der Welt — wählt der Lebenszyklus nach dem Tod noch ihn?
            const gier = 0.7;
            hT.rotation.set(0, gier, 0);
            hT.updateMatrixWorld(true);
            const fgRoh = r._fieldGradient;
            r._fieldGradient = function () {
                // das Gefälle zeigt hangab = längs der Leibes-Achse (die Außen-Normale neigt sich nach vorn)
                return { x: Math.sin(gier) * 0.3, y: 1, z: Math.cos(gier) * 0.3 };
            };
            let tod = null;
            try {
                r.damageCreature(hT, 1e9, { source: "world" });
            } finally {
                r._fieldGradient = fgRoh;
                delete r._fieldGradient;
            }
            const K = A._arenaGesetz().gefuehl;
            for (let k = 0; k < Math.ceil((K.kippDauerSec + 0.2) / 0.05); k++) r.updateCreatures(0.05);
            hT.updateMatrixWorld(true);
            const q = hT.getWorldQuaternion(new THREE.Quaternion());
            const vorn = V3().set(0, 0, 1).applyQuaternion(q);
            const oben = V3().set(0, 1, 0).applyQuaternion(q);
            tod = { vornY: +vorn.y.toFixed(2), obenY: +oben.y.toFixed(2) };
            // DER MEHRSPIELER-STROM (Nachbesserung 3): der Takt des Senders, sein Strom an einen Mitspieler (dieselbe Seite als
            // Empfänger, `_p2pHandleCreaturePos`) und dessen Sicht-Takt — die Kopie liegt, wie der Leib liegt, die ganze Zeit
            const sent = [];
            const sendRoh = r.p2pSend;
            r.p2pSend = (m) => sent.push(m);
            const peer = "kg-peer";
            const kopie = { imStrom: 0, proben: 0, obenMax: -Infinity };
            try {
                for (let k = 0; k < 200; k++) {
                    r.updateCreatures(0.05); // 10 s danach
                    if (k % 20 !== 19) continue;
                    sent.length = 0;
                    r._p2pBroadcastCreatures();
                    const msg = sent.find((m) => m && m.type === "creature-pos");
                    if (msg) r._p2pHandleCreaturePos(peer, msg);
                    for (let f = 0; f < 30; f++) r._p2pTickRemoteCreatures(k * 0.05 + f / 60, 1 / 60);
                    kopie.proben++;
                    const id = hT.userData.netId;
                    if (msg && msg.list.some((e) => e.id === id)) kopie.imStrom++;
                    const rc = s.p2p.remoteCreatures.get(peer + ":" + id);
                    if (rc && rc.mesh) {
                        rc.mesh.updateMatrixWorld(true);
                        const qk = rc.mesh.getWorldQuaternion(new THREE.Quaternion());
                        kopie.obenMax = Math.max(kopie.obenMax, V3().set(0, 1, 0).applyQuaternion(qk).y);
                    }
                }
            } finally {
                r.p2pSend = sendRoh;
                if (r.p2pSend === A.prototype.p2pSend) delete r.p2pSend;
                for (const [key, rc] of s.p2p.remoteCreatures)
                    if (rc.peerId === peer) r._disposeRemoteCreature(key, rc);
            }
            tod.stromAnteil = kopie.proben ? +(kopie.imStrom / kopie.proben).toFixed(2) : 0;
            tod.kopieOben = Number.isFinite(kopie.obenMax) ? +kopie.obenMax.toFixed(2) : null;
            tod.liegt10s = !!hT.parent && !!hT.userData.dying;
            // DER LEICHNAM IST KEIN WESEN (Nachbesserung 2 + 3): er steht nicht in der Liste der Wesen; das Fadenkreuz auf ihm
            // wählt ihn nicht, er belegt keinen Platz der Kappe (ein Spawn bei maxCreatures = alle Leiber samt Leichnam gelingt),
            // der Nexus zählt ihn nicht, der Lebenszyklus wählt ihn nicht als Ältesten, findNearestCreature nicht als Nächsten;
            // und kein Leser fragt selbst nach dem Sterben (die Frage lebt nur im Tod, im Leichnam-Takt und im Schadens-Tor)
            tod.unterWesen = s.creatures.indexOf(hT) !== -1;
            tod.aeltester = r._findOldestCreature() === hT;
            tod.naechster = r.findNearestCreature(hT.position, 3) === hT;
            const ohneKommentar = window.__codeOf;
            const FRAGT_ERLAUBT = new Set([
                "damageCreature",
                "_creatureCombatDeath",
                "_kreaturFaellt",
                "_tickLeichname",
            ]);
            // über die Deskriptoren (nie A.prototype[n]: ein Getter liefe mit dem Prototyp als this und legte seinen Cache dort ab)
            tod.fragen = Object.getOwnPropertyNames(A.prototype).filter((n) => {
                const d = Object.getOwnPropertyDescriptor(A.prototype, n);
                return (
                    n !== "constructor" &&
                    !FRAGT_ERLAUBT.has(n) &&
                    d &&
                    typeof d.value === "function" &&
                    /\.dying\b/.test(ohneKommentar(d.value))
                );
            });
            if (tod.liegt10s) {
                zielen(punkt(hT, null));
                const pick = r._pickCreatureAtCrosshair();
                tod.zielLeichnam = !!(pick && pick.creature === hT);
                const cap0 = s.maxCreatures;
                s.maxCreatures = s.creatures.length + (s.leichname || []).length;
                const neuS = r.spawnCreatureAt(
                    pm.position.x + 300,
                    pm.position.y,
                    pm.position.z + 310,
                    "happy",
                    "wolf"
                );
                s.maxCreatures = cap0;
                tod.platzFrei = !!neuS;
                if (neuS) r.removeCreature(neuS);
                const lebend = s.creatures.filter((c) => c && c.userData && !c.userData.dying).length;
                tod.nexusZaehlt = r.dslConditions.creatures_count_above([lebend], { state: s }) === true;
            }
            // DER TOD AM ALTER (Nachbesserung 3, K-D19 auf dem Weg des Lebenszyklus): ein Wesen, das _creatureNaturalDeath
            // nimmt, liegt 10 s danach wie ein Gefallener — kein Wesen mehr, aber ein Leib im Bild (die Stimmung des Spielers,
            // die die Trauer berührt, kehrt zurück)
            {
                const hN = setze("wesen");
                if (hN) {
                    stelle(hN, 24, -6);
                    const emo0 = p.emotions ? { ...p.emotions } : null;
                    r._creatureNaturalDeath(hN);
                    for (let k = 0; k < 200; k++) r.updateCreatures(0.05);
                    tod.alterLiegt = !!hN.parent && !!hN.userData.dying && s.creatures.indexOf(hN) === -1;
                    if (emo0) Object.assign(p.emotions, emo0);
                    if (hN.parent) r.removeCreature(hN);
                }
            }
            w.z.tod = tod;
            if (hT.parent) r.removeCreature(hT);
        });
        // (T25) DIE WUNDE REIST ALS ANTEIL DES LEBENS (Nachbesserung 2, Posten 6): ein Hirsch (1,0) und ein Bär (1,75) — ein Stand von vor
        // dem Massen-Gesetz trug hp absolut gegen das Leben der Substanz (der Leib ohne Volumen rechnet es noch: leibV = 0);
        // voll gespeichert kehrt er voll zurück, halb verwundet halb; ein neuer Stand mit 30 % Leben kehrt mit 30 % zurück.
        // Befund Gegenprüfung 1: ein voller Hirsch stand nach dem Reload bei 124/168, ein voller Bär bei 159/391.
        await teil("T25", async () => {
            const wunde = [];
            for (const [seele, L] of [
                ["wesen", 1],
                ["baer", 1.75],
            ]) {
                s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 4);
                const c = r.spawnCreatureAt(pm.position.x + 300, pm.position.y, pm.position.z + 320, "happy", seele, {
                    bodySize: L,
                });
                if (!c) continue;
                const tb = c.userData._tierBaum;
                const lv = tb.leibV;
                tb.leibV = 0;
                const hpAlt = r.computeCreatureStats(c).stats.hpMax; // das Leben vor dem Massen-Gesetz
                tb.leibV = lv;
                const zurueck = (snap) => {
                    const c2 = r._restoreCreatureFromSnapshot(snap, "happy");
                    const q = c2 ? +(c2.userData.hp / c2.userData.hpMax).toFixed(3) : null;
                    if (c2) r.removeCreature(c2);
                    return q;
                };
                const roh = r._serializeCreature(c);
                const alt = (hp) => {
                    const o = JSON.parse(JSON.stringify(roh));
                    delete o.hpAnteil;
                    o.hp = hp;
                    return o;
                };
                c.userData.hp = 0.3 * c.userData.hpMax;
                const neu30 = r._serializeCreature(c);
                r.removeCreature(c);
                wunde.push({
                    seele: seele + "@" + L,
                    hpAlt: +hpAlt.toFixed(1),
                    altVoll: zurueck(alt(+hpAlt.toFixed(2))),
                    altHalb: zurueck(alt(+(0.5 * hpAlt).toFixed(2))),
                    neu30: zurueck(neu30),
                });
            }
            w.z.wunde = wunde;
        });
        // (T23) DER BISS TRIFFT, WO DIE GESTE SCHNAPPT (Posten 5): alle drei Biss-Wege im ECHTEN Kreatur-Takt (updateCreatures,
        // 1/60 s) — ein Wolf jagt den stehenden Spieler (6 m vor ihm), ein Wolf beißt ein Kitz 1,5 m vor seiner Schnauze (der
        // Beute-Biss, _tickCreatureScentStrike), ein Bär wehrt sich gegen Hiebe aus 1,6 m (die Gegenwehr). Gemessen im Biss-Takt
        // (damagePlayer / damageCreature): die Geste des Beißers (seine laufende Aktion) und der Spalt zwischen seinem KOPF
        // (die Treffer-Glieder der Zone kopf, die Gestalt) und dem Leib des Gebissenen (die Kapsel des Spielers / die Glieder
        // des Tiers), dazu der Abstand der Mitten. Befund K-D13: 12 Bisse am stehenden Spieler, 9 ohne Geste, aus 1,36–2,39 m XZ.
        await teil("T23", async () => {
            const kopfKapseln = (c) => {
                c.updateMatrixWorld(true);
                return (r._kreaturTrefferGlieder(c) || [])
                    .filter((g) => g.zone === "kopf")
                    .map((g) => ({
                        a: g.a.clone().applyMatrix4(g.anker.matrixWorld),
                        b: g.b.clone().applyMatrix4(g.anker.matrixWorld),
                        r: g.r * g.anker.matrixWorld.getMaxScaleOnAxis(),
                    }));
            };
            const abst = (a, b, c2, d) =>
                Math.sqrt(r._segSegDistSq(a.x, a.y, a.z, b.x, b.y, b.z, c2.x, c2.y, c2.z, d.x, d.y, d.z));
            const spaltSpieler = (c) => {
                // die Achse der Spieler-Kapsel zwischen ihren Kappen (Fuß + Radius … Saum − Radius)
                const rK = A.PLAYER_WALL_RADIUS;
                const P0 = V3().set(pm.position.x, pm.position.y - A.PLAYER_FOOT_OFFSET + rK, pm.position.z);
                const P1 = V3().set(
                    pm.position.x,
                    pm.position.y + A.PLAYER_FOOT_OFFSET + A.PLAYER_STEP_UP - rK,
                    pm.position.z
                );
                let m = Infinity;
                for (const k of kopfKapseln(c)) m = Math.min(m, abst(k.a, k.b, P0, P1) - k.r - A.PLAYER_WALL_RADIUS);
                return m;
            };
            const spaltTier = (c, z) => {
                const K = kopfKapseln(c);
                z.updateMatrixWorld(true);
                let m = Infinity;
                for (const g of r._kreaturTrefferGlieder(z) || []) {
                    const pa = g.a.clone().applyMatrix4(g.anker.matrixWorld);
                    const pb = g.b.clone().applyMatrix4(g.anker.matrixWorld);
                    const rg = g.r * g.anker.matrixWorld.getMaxScaleOnAxis();
                    for (const k of K) m = Math.min(m, abst(k.a, k.b, pa, pb) - k.r - rg);
                }
                return m;
            };
            const geste = (c) => {
                const a = c.userData._verhaltenAktion;
                return a && (a.bissAkt || s.creatureAnimationTime < a.bis) ? a.name : "keine"; // ein Ansprung gilt bis zum Schnappen (die Landung zählt, K13)
            };
            const xz = (a, b) => +Math.hypot(a.position.x - b.position.x, a.position.z - b.position.z).toFixed(2);
            const neu = (seele, x, z, L) => {
                s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 4);
                const c = r.spawnCreatureAt(x, pm.position.y, z, "calm", seele, { bodySize: L });
                if (!c) return null;
                tiere.push(c);
                c.position.set(x, fussY(), z);
                c.userData.emotions = { joy: 0, awe: 0, sorrow: 0, hope: 0, peace: 0, chaos: 0 };
                c.userData.fearUntil = 0;
                c.userData.hp = 1e6;
                c.updateMatrixWorld(true);
                return c;
            };
            const bisse = { jagd: [], beute: [], gegenwehr: [] };
            const mitBiss = { spieler: null, tier: null, kitz: null };
            const dpGate = r.damagePlayer;
            const dcGate = r.damageCreature;
            // WER BEISST (K13): gezählt wird nur der Biss des Tiers der Probe — das Schnappen (_kreaturBissTakt) nennt den
            // Beißer; ein Wild-Tier der Welt, das den Spieler im selben Takt beißt, ist nicht der Wolf der Probe (vorher in
            // 1 von 20 Läufen: „jagd beißt ohne Ansprung, Kopf 5,56 m vor dem Leib" — gebissen hatte ein anderes Tier)
            const btRoh = r._kreaturBissTakt;
            let beisser = null;
            if (typeof btRoh === "function")
                r._kreaturBissTakt = function (c, ...rest) {
                    const b0 = beisser;
                    beisser = c;
                    try {
                        return btRoh.call(this, c, ...rest);
                    } finally {
                        beisser = b0;
                    }
                };
            const istBeisser = (c) => typeof btRoh !== "function" || beisser === c;
            r.damagePlayer = function (amount, source) {
                const c = mitBiss.spieler;
                if (c && istBeisser(c) && (source === "jagd" || source === "gegenwehr"))
                    bisse[source].push({ geste: geste(c), spalt: +spaltSpieler(c).toFixed(3), xz: xz(c, pm) });
                return dpGate.call(this, amount, source);
            };
            r.damageCreature = function (c2, amount, opts) {
                const j = mitBiss.tier;
                if (j && istBeisser(j) && c2 === mitBiss.kitz && opts && opts.source === "jagd")
                    bisse.beute.push({ geste: geste(j), spalt: +spaltTier(j, c2).toFixed(3), xz: xz(j, c2) });
                return dcGate.call(this, c2, amount, opts);
            };
            const savedT23 = {
                mode: r.getGameMode(),
                hp: p.hp,
                gnade: p.respawnGraceUntil,
                ort: { x: pm.position.x, y: pm.position.y, z: pm.position.z },
            };
            // der Spieler steht auf dem Boden (seine Füße auf der Höhe, auf der auch die Tiere stehen)
            const P = {
                x: pm.position.x,
                y: r.getTerrainHeightAt(pm.position.x, pm.position.z) + A.PLAYER_FOOT_OFFSET,
                z: pm.position.z,
            };
            const halte = () => {
                pm.position.set(P.x, P.y, P.z);
                s.playerVel.setValue(0, s.playerVel.y(), 0);
                p.hp = 1e9;
                p.respawnGraceUntil = -Infinity;
            };
            // der Takt des Spiels: der Kreatur-Takt, dann der feste Sim-Schritt der Leiber (der getragene Stoß, Leib an Leib)
            const tickT23 = () => {
                halte();
                r.updateCreatures(1 / 60);
                r._kreaturStossSchritt(1 / 60);
                r._leibKontakte();
            };
            try {
                r.setGameMode("pfad");
                for (const c of tiere) if (c.parent) parke(c);
                // (a) die Jagd auf den stehenden Spieler
                const wolf = neu("wolf", P.x + 0.4, P.z + 6, 1);
                if (wolf) {
                    wolf.rotation.set(0, Math.PI, 0);
                    mitBiss.spieler = wolf;
                    for (let k = 0; k < 1500 && bisse.jagd.length < 3; k++) tickT23();
                    mitBiss.spieler = null;
                    r.removeCreature(wolf);
                }
                // (b) der Beute-Biss: ein Wolf, das Kitz 1,5 m vor ihm (40 m vom Spieler — er jagt das Kitz, nicht ihn)
                const jaeger = neu("wolf", P.x + 40, P.z + 40, 1);
                const kitz = neu("wesen", P.x + 40, P.z + 41.5, 0.6);
                if (jaeger && kitz) {
                    jaeger.rotation.set(0, 0, 0);
                    kitz.rotation.set(0, Math.PI / 2, 0);
                    mitBiss.tier = jaeger;
                    mitBiss.kitz = kitz;
                    const K0 = { x: kitz.position.x, y: kitz.position.y, z: kitz.position.z };
                    const J0 = { x: jaeger.position.x, y: jaeger.position.y, z: jaeger.position.z };
                    // je Versuch: der Wolf steht wieder 1,5 m vor dem Kitz (ruhend, ihm zugewandt), seine Biss-Uhr ist frei;
                    // der Takt läuft, bis der Ansprung endet (das Kitz hält still)
                    for (let a = 0; a < 6 && bisse.beute.length < 2; a++) {
                        jaeger.position.set(J0.x, J0.y, J0.z);
                        jaeger.rotation.set(0, 0, 0);
                        jaeger.userData._steuer = null;
                        jaeger.userData._stossV = null;
                        jaeger.userData.nextHuntStrikeAt = 0;
                        jaeger.userData._verhaltenAktion = null;
                        jaeger.userData._hopH = 0;
                        jaeger.userData._hopV = 0;
                        for (let k = 0; k < 90; k++) {
                            kitz.position.set(K0.x, kitz.position.y, K0.z);
                            kitz.userData._stossV = null;
                            kitz.userData.hp = 1e6;
                            kitz.userData.fearUntil = 0;
                            if (k === 0) r._tickCreatureScentStrike(jaeger);
                            tickT23();
                        }
                    }
                    mitBiss.tier = null;
                }
                if (jaeger) r.removeCreature(jaeger);
                if (kitz) r.removeCreature(kitz);
                // (b2) das stehende Reh (Nachbesserung 2): ein Wolf, ein Reh (Größe 0,8) breitseits vor ihm — sechs Ansprünge aus der
                // Ruhe (drei aus 1,6 m, drei aus 1,3 m, wo die Hetze hält), je 90 Takte; gezählt Ansprünge, Bisse und die Takte,
                // in denen das Ziel der Kopf-Neigung an der Klemme des Bisses (BISS.kopfNeigung) steht (Bericht: der Kopf
                // schwang über, solange sein Rest sich je Takt auf das Ziel des Vor-Takts summierte)
                await teil("T24 Reh", async () => {
                    const reh = { versuche: 6, anspruenge: 0, bisse: 0, takte: 0, klemme: 0, je: {} };
                    const j2 = neu("wolf", P.x - 40, P.z + 40, 1);
                    const r2 = neu("wesen", P.x - 40, P.z + 41.6, 0.8);
                    // der Ort: trockener Boden für beide (im Wasser schwämme das Reh mit der Wasserlinie an der Schulter), auf dem
                    // die Boden-Karte des Chunks (die Sicht, auf der ein Tier steht — _standSicht) beim Gesetz liegt: wo sie
                    // tiefer liegt, stünde das Reh tiefer als der Wolf (headless an der ersten Probe 0,94 m)
                    const trocken = (c, x, z) => {
                        const gy = r.getTerrainHeightAt(x, z);
                        c.position.set(x, gy, z);
                        return (
                            r._kreaturSchwimmt(c, r._creatureGroundY(c)) === null &&
                            Math.abs(r._standSicht(x, z, gy, false) - gy) < 0.15
                        );
                    };
                    const eben = (x, z) => {
                        const h = [
                            [x, z + 1.6],
                            [x, z],
                            [x, z + 0.3],
                            [x - 0.8, z + 1.6],
                            [x + 0.8, z + 1.6],
                            [x - 0.8, z],
                            [x + 0.8, z],
                        ].map(([a, b]) => r.getTerrainHeightAt(a, b));
                        return Math.max(...h) - Math.min(...h) <= 0.12;
                    };
                    // der Ort aus der Welt (K16, Orts-Wand): Ringe je 8 Richtungen um den Start, 20 … 180 m — der erste, der die Prüfung
                    // unten trägt (eben, trocken, frei); kein Versatz der alten Welt als Liste
                    const ortR = ((radien) =>
                        radien.flatMap((rr) =>
                            [0, 1, 2, 3, 4, 5, 6, 7].map((k) => [
                                Math.round(Math.cos((k * Math.PI) / 4) * rr),
                                Math.round(Math.sin((k * Math.PI) / 4) * rr),
                            ])
                        ))([20, 57, 70, 100, 140, 180]).find(
                        ([ox, oz]) =>
                            j2 &&
                            r2 &&
                            // EBEN (K16): Reh, beide Absprung-Orte und die Flanken liegen in 0,12 m — am Hang (−14|14 im neuen
                            // Gelände) stand der Wolf 0,76 m über dem Gesetz, der Kopf zielte an die Klemme
                            eben(P.x + ox, P.z + oz) &&
                            trocken(r2, P.x + ox, P.z + oz + 1.6) &&
                            trocken(j2, P.x + ox, P.z + oz) &&
                            trocken(j2, P.x + ox, P.z + oz + 0.3)
                    );
                    if (j2 && r2 && ortR) {
                        const R0 = { x: P.x + ortR[0], z: P.z + ortR[1] + 1.6 };
                        r2.position.set(R0.x, r.getTerrainHeightAt(R0.x, R0.z), R0.z);
                        r2.rotation.set(0, Math.PI / 2, 0);
                        const J0 = { x: R0.x, y: r.getTerrainHeightAt(R0.x, R0.z - 1.6), z: R0.z - 1.6 };
                        j2.position.set(J0.x, J0.y, J0.z);
                        // beide stehen erst (die Erdung des Takts), der Wolf ohne Ansprung
                        j2.userData.nextHuntStrikeAt = Infinity;
                        for (let k = 0; k < 30; k++) {
                            r2.position.x = R0.x;
                            r2.position.z = R0.z;
                            tickT23();
                        }
                        reh.boden = {
                            ort: ortR,
                            reh: +(r2.position.y - r.getTerrainHeightAt(R0.x, R0.z)).toFixed(2),
                            // der Grund des Wolfs ohne seinen Hüpfer (im Takt kann ein Ansprung laufen: Bericht 0,76 m = Hüpfer 0,75)
                            wolf: +(
                                j2.position.y -
                                (j2.userData._hopH || 0) -
                                r.getTerrainHeightAt(j2.position.x, j2.position.z)
                            ).toFixed(2),
                            hop: +(j2.userData._hopH || 0).toFixed(2),
                        };
                        const KN = A._bissGesetz().kopfNeigung;
                        const dcT = r.damageCreature;
                        r.damageCreature = function (c2, amount, opts) {
                            if (c2 === r2 && opts && opts.source === "jagd") reh.bisse++;
                            return dcT.call(this, c2, amount, opts);
                        };
                        try {
                            for (let a = 0; a < reh.versuche; a++) {
                                // drei Ansprünge aus 1,6 m, drei aus 1,3 m (dort hält die Hetze: der Spalt ist die halbe Weite)
                                const dist = a < reh.versuche / 2 ? 1.6 : 1.3;
                                const zeile = reh.je[dist] || (reh.je[dist] = { anspruenge: 0, bisse: 0 });
                                const b0 = reh.bisse,
                                    n0 = reh.anspruenge;
                                j2.position.set(J0.x, r.getTerrainHeightAt(J0.x, R0.z - dist), R0.z - dist);
                                j2.rotation.set(0, 0, 0);
                                Object.assign(j2.userData, {
                                    _steuer: null,
                                    _stossV: null,
                                    nextHuntStrikeAt: 0,
                                    _verhaltenAktion: null,
                                    _hopH: 0,
                                    _hopV: 0,
                                });
                                let letzte = null;
                                for (let k = 0; k < 90; k++) {
                                    r2.position.set(R0.x, r2.position.y, R0.z);
                                    Object.assign(r2.userData, { _stossV: null, _steuer: null, hp: 1e6, fearUntil: 0 });
                                    if (k === 0) r._tickCreatureScentStrike(j2);
                                    tickT23();
                                    const VA = j2.userData._verhaltenAktion;
                                    if (!(VA && VA.bissAkt && s.creatureAnimationTime < VA.bis)) continue;
                                    if (VA !== letzte) {
                                        letzte = VA;
                                        reh.anspruenge++;
                                    }
                                    // die Höhe des Ansprungs (Bericht: der Freude-Hüpfer 0,8 / 1,2 m oder so hoch wie das Ziel)
                                    reh.hubMaxM = Math.max(reh.hubMaxM || 0, +(j2.userData._hopH || 0).toFixed(3));
                                    if (VA.biss && Number.isFinite(VA.kopfZiel)) {
                                        reh.takte++;
                                        if (VA.kopfZiel <= KN[0] + 1e-6 || VA.kopfZiel >= KN[1] - 1e-6) reh.klemme++;
                                    }
                                }
                                zeile.anspruenge += reh.anspruenge - n0;
                                zeile.bisse += reh.bisse - b0;
                            }
                        } finally {
                            r.damageCreature = dcT;
                        }
                    }
                    // DIE REST-SUMME (Nachbesserung 3, deterministisch): der Wolf 1,3 m vor dem Reh in der Stand-Pose, eine Biss-Geste
                    // offen; zehnmal das Zielen des Kopfs (_kreaturBissKopf) ohne Takt dazwischen — die gezeigte Pose steht still.
                    // Beide Leiber stehen in der STAND-POSE des Kerns (_tierBaumNeutralStance, Nachbesserung 4): vorher trug der Wolf
                    // die Haltung seines letzten Ansprungs — der erste Rest schwankte je Lauf 0,31–1,0 rad und stand oft an der
                    // Klemme (BISS.kopfNeigung), wo eine Summe sich nie zeigt (die Wand war dort vakuös).
                    // DIE GIER DES REHS hält die Probe fest (K13b): unter den sechs Ansprüngen dreht der Steuer-Schritt das Reh nach
                    // dem Wunsch seines Takts (rotation.y = _steuer.gier), je Lauf anders — und das Glied, das dem Kopf des Wolfs
                    // am nächsten liegt, wechselt mit der Gier: Hinterschenkel (hlT/hrT, Gier ±0,72…±1,56) 0,5871, Vorderlauf
                    // (flL/frL) 0,81–0,92, Unterschenkel (hlC/hrC, |Gier| ≤ 0,71) die Klemme 1,0, Rumpf −0,02…−0,23. Am Stand
                    // a5f05612 + gang-gesetz 48e7b013 (Gestalt aus der Ruhe, Pose und Kapseln in 20 Läufen gleich): 18 × 0,5871 bei
                    // Gier −1,55…−1,01, 2 × 1,0 bei Gier 0,05 (rot). Breitseits (π/2) stünde die Probe auf der Kante zwischen
                    // Hinterschenkel und Vorderlauf; π/2 − 0,4 liegt mitten im Band des Hinterschenkels (0,45 / 0,40 rad Rand).
                    if (j2 && r2 && ortR && j2.userData._tierBaum) {
                        // EINE HÖHE (K16): beide Leiber stehen auf dem Grund des Wolfs — die Probe misst das Zielen, nie den Hang.
                        // Vorher stand das Reh auf dem Gesetz unter sich: am Hang der alten Welt 0,2 m über dem Wolf (der
                        // Hinterschenkel auf Kopfhöhe, Rest 0,5871), im ebenen Gelände des Kerns 0,28 m unter dem Kopf (Rest
                        // 0,9921 an der Klemme). Die Gier des Rehs kommt aus einer festen Reihe ab π/2 − 0,4: die erste, deren
                        // erster Rest im Band der Klemme liegt (Rand 0,05 rad = REH_SOLL.kopfRest), trägt die Probe; ihr Glied steht im Bericht.
                        const R0 = { x: P.x + ortR[0], z: P.z + ortR[1] + 1.6 };
                        const gW = r.getTerrainHeightAt(R0.x, R0.z - 1.3);
                        const KL = A._bissGesetz().kopfNeigung;
                        const reiheGier = [0, 0.2, -0.2, 0.4, -0.4, 0.6, -0.6, 0.8, -0.8, 1.0, -1.0, 1.2, -1.2].map(
                            (d) => Math.PI / 2 - 0.4 + d
                        );
                        for (const gier of reiheGier) {
                            r2.position.set(R0.x, gW, R0.z);
                            r2.rotation.set(0, gier, 0);
                            j2.position.set(R0.x, gW, R0.z - 1.3);
                            j2.rotation.set(0, 0, 0);
                            Object.assign(j2.userData, { _hopH: 0, _hopV: 0 });
                            r._tierBaumNeutralStance(j2);
                            r._tierBaumNeutralStance(r2);
                            const gang = j2.userData._tierBaum._gang || (j2.userData._tierBaum._gang = {});
                            gang.bissKopf = 0;
                            gang.bissRumpf = 0;
                            j2.updateMatrixWorld(true);
                            r2.updateMatrixWorld(true);
                            const VA = { biss: { ziel: r2 }, kopfZiel: 0, rumpfZiel: 0 };
                            const m = r._kreaturMaul(j2, {});
                            const reihe = [];
                            if (m)
                                for (let k = 0; k < 10; k++) {
                                    r._kreaturBissKopf(j2, VA, m, r2);
                                    reihe.push(+VA.kopfZiel.toFixed(4));
                                }
                            if (!reihe.length) break;
                            reh.kopfSumme = {
                                takte: reihe.length,
                                rest: reihe[0],
                                drift: +(Math.max(...reihe) - Math.min(...reihe)).toFixed(6),
                                reihe: reihe.slice(0, 4),
                                klemme: KL.slice(),
                                gier: +gier.toFixed(2),
                            };
                            if (reihe[0] >= KL[0] + 0.05 && reihe[0] <= KL[1] - 0.05) break; // der Rand: REH_SOLL.kopfRest
                        }
                    }
                    if (j2) r.removeCreature(j2);
                    if (r2) r.removeCreature(r2);
                    w.z.bissReh = reh;
                });
                // (c) die Gegenwehr: ein Bär wird aus 1,6 m geschlagen (Breitseite, wie T5), dann läuft der Takt 1 s
                const baer = neu("baer", P.x, P.z + 1.6, 1);
                if (baer) {
                    mitBiss.spieler = baer;
                    for (let h = 0; h < 30 && bisse.gegenwehr.length < 2; h++) {
                        stelle(baer, 1.6);
                        baer.userData._stossV = null;
                        dcGate.call(r, baer, 5, {
                            source: "player",
                            fromPos: { x: P.x, y: P.y, z: P.z },
                            knockback: 16,
                        });
                        for (let k = 0; k < 60; k++) tickT23();
                    }
                    mitBiss.spieler = null;
                    r.removeCreature(baer);
                }
                // (T24) DER BISS KOSTET, WAS IN REICHWEITE STEHT, UND SPRINGT NIE INS LEERE (Nachbesserung 2):
                // (a) die Kosten — ein Wolf, 15 Beutetiere 8–28 m um ihn (keines in der Weite seines Ansprungs): je Beute-Biss-
                // Takt gezählt, wie viele Gestalten er rechnet (_kreaturBissRadial auf ein Tier), dazu die Zeit je Takt (Bericht)
                const reich = {
                    gestaltenJeTakt: null,
                    msJeTakt: null,
                    simsAnspruenge: null,
                    simsSek: 10,
                    kaltZerlegt: null,
                };
                await teil("T24", async () => {
                    // (c) DIE KALTE GATTUNG (Nachbesserung 3, Lehre 14): ein Wolf und ein Fuchs 35 m vor ihm, beide Gattungen kalt
                    // (wie eine Gattung, die nie nah beim Spieler stand — das Namen-Memo vergessen, danach wiederhergestellt);
                    // gezählt, wie oft die Wahl der Beute eine Gestalt synchron zerlegt (_kreaturGliederGruppen) und wie viele
                    // Vertices. Befund Gegenprüfung 2: das Maul des Jägers (Wolf 29 987 Vertices) und die Gestalt der Beute (Fuchs
                    // 31 405) — 12,4 und 3,1 ms im Kreatur-Takt, an der Bake-Uhr vorbei
                    {
                        const J1 = { x: P.x + 60, z: P.z - 60 };
                        const wolfC = neu("wolf", J1.x, J1.z, 1);
                        const fuchsC = neu("fuchs", J1.x + 35, J1.z, 1);
                        if (wolfC && fuchsC) {
                            wolfC.position.y = r.getTerrainHeightAt(J1.x, J1.z);
                            fuchsC.position.y = r.getTerrainHeightAt(J1.x + 35, J1.z);
                            const memo = r._trefferGliedNamen || new Map();
                            const gesichert = new Map();
                            for (const c of [wolfC, fuchsC]) {
                                const g = r._kreaturGattung(c);
                                if (memo.has(g)) gesichert.set(g, memo.get(g));
                                memo.delete(g);
                                delete c.userData._trefferGlieder;
                            }
                            const grRoh = r._kreaturGliederGruppen;
                            let zerlegt = 0,
                                verts = 0;
                            r._kreaturGliederGruppen = function (cr) {
                                zerlegt++;
                                const G = grRoh.call(this, cr);
                                if (G) for (const [, g] of G.gruppen) verts += g.verts || 0;
                                return G;
                            };
                            try {
                                wolfC.userData.nextHuntStrikeAt = 0;
                                wolfC.userData._verhaltenAktion = null;
                                r._tickCreatureScentStrike(wolfC);
                            } finally {
                                r._kreaturGliederGruppen = grRoh;
                                delete r._kreaturGliederGruppen;
                                for (const [g, n] of gesichert) memo.set(g, n);
                            }
                            reich.kaltZerlegt = zerlegt;
                            reich.kaltVerts = verts;
                        }
                        if (wolfC) r.removeCreature(wolfC);
                        if (fuchsC) r.removeCreature(fuchsC);
                    }
                    {
                        const J0 = { x: P.x - 60, z: P.z - 60 };
                        const wolfK = neu("wolf", J0.x, J0.z, 1);
                        const schar = [];
                        for (let i = 0; i < 15 && wolfK; i++) {
                            const a = (i / 15) * Math.PI * 2,
                                d = 8 + (i % 5) * 5;
                            const x = J0.x + Math.sin(a) * d,
                                z = J0.z + Math.cos(a) * d;
                            const c = neu(i % 3 ? "wesen" : "fuchs", x, z, 0.8);
                            if (!c) continue;
                            c.position.y = r.getTerrainHeightAt(x, z);
                            schar.push(c);
                        }
                        if (wolfK && schar.length === 15) {
                            wolfK.position.y = r.getTerrainHeightAt(J0.x, J0.z);
                            for (const c of [wolfK, ...schar]) c.updateMatrixWorld(true);
                            reich.beute = schar.filter((o) => r._kreaturIstBeute(wolfK, o)).length;
                            const radRoh = r._kreaturBissRadial;
                            let gestalten = 0;
                            r._kreaturBissRadial = function (c2, z2, m2) {
                                if (z2) gestalten++;
                                return radRoh.call(this, c2, z2, m2);
                            };
                            const takt = () => {
                                wolfK.userData.nextHuntStrikeAt = 0;
                                wolfK.userData._verhaltenAktion = null;
                                r._tickCreatureScentStrike(wolfK);
                            };
                            try {
                                for (let k = 0; k < 20; k++) takt();
                                gestalten = 0;
                                const N = 200;
                                const t0 = performance.now();
                                for (let k = 0; k < N; k++) takt();
                                reich.msJeTakt = +((performance.now() - t0) / N).toFixed(4);
                                reich.gestaltenJeTakt = gestalten / N;
                            } finally {
                                r._kreaturBissRadial = radRoh;
                            }
                        }
                        for (const c of schar) r.removeCreature(c);
                        if (wolfK) r.removeCreature(wolfK);
                    }
                    // (b) der Sims — auf trockenem Boden neben der Plattform (der erste Ort, an dem weder der Wolf noch der Fuß des
                    // Sims im Wasser steht) steht der Spieler 3,5 m über dem Boden, ein Wolf jagt ihn wie in (a): 10 s im Takt,
                    // gezählt jeder Ansprung; je Takt die Höhe der Füße über Kopf plus Sprung (das Kleinste zählt — so hoch reicht
                    // der Wolf nie); die Gegenprobe: waagrecht steht er in der Weite seines Ansprungs (ohne die Höhe spränge er)
                    {
                        const P0 = { x: P.x, y: P.y, z: P.z };
                        const wolfS = neu("wolf", P.x + 0.4, P.z + 6, 1);
                        const trocken = (x, z) => {
                            wolfS.position.set(x, r.getTerrainHeightAt(x, z), z);
                            return r._kreaturSchwimmt(wolfS, r._creatureGroundY(wolfS)) === null;
                        };
                        const ort = wolfS
                            ? ((radien) =>
                                  radien.flatMap((rr) =>
                                      [0, 1, 2, 3, 4, 5, 6, 7].map((k) => [
                                          Math.round(Math.cos((k * Math.PI) / 4) * rr),
                                          Math.round(Math.sin((k * Math.PI) / 4) * rr),
                                      ])
                                  ))([57, 70]).find(
                                  ([ox, oz]) => trocken(P0.x + ox, P0.z + oz) && trocken(P0.x + ox + 0.4, P0.z + oz + 6)
                              )
                            : null;
                        if (wolfS && ort) {
                            P.x = P0.x + ort[0];
                            P.z = P0.z + ort[1];
                            P.y = r.getTerrainHeightAt(P.x, P.z) + A.PLAYER_FOOT_OFFSET + 3.5;
                            halte();
                            wolfS.position.set(P.x + 0.4, r.getTerrainHeightAt(P.x + 0.4, P.z + 6), P.z + 6);
                            wolfS.rotation.set(0, Math.PI, 0);
                            wolfS.userData._steuer = null;
                            let letzte = null,
                                n = 0,
                                minWaag = Infinity,
                                minUeber = Infinity;
                            const zustaende = new Set();
                            try {
                                for (let k = 0; k < reich.simsSek * 60; k++) {
                                    tickT23();
                                    const VA = wolfS.userData._verhaltenAktion;
                                    if (VA && VA.bissAkt && VA !== letzte) {
                                        letzte = VA;
                                        n++;
                                    }
                                    zustaende.add(wolfS.userData._motionZustand || "–");
                                    const w2 = r._kreaturBissRadial(wolfS, null);
                                    if (w2 !== null && w2 < minWaag) minWaag = w2;
                                    const m = r._kreaturMaul(wolfS, {});
                                    const hop = A._bissGesetz().geste.hop ? r._kreaturSprungHoehe(wolfS) : 0;
                                    if (m && !(wolfS.userData._hopH > 0))
                                        minUeber = Math.min(
                                            minUeber,
                                            r._spielerKapsel({}).y0 - (Math.max(m.ay, m.by) + m.r + hop)
                                        );
                                }
                                reich.simsUeber = +minUeber.toFixed(2);
                                reich.simsAnspruenge = n;
                                reich.simsWaagrecht = +minWaag.toFixed(2);
                                reich.simsReich = +r._kreaturBissReich(wolfS).toFixed(2);
                                reich.simsZustaende = [...zustaende];
                            } finally {
                                Object.assign(P, P0);
                                halte();
                            }
                        }
                        if (wolfS) r.removeCreature(wolfS);
                    }
                });
                w.z.bissReich = reich;
            } finally {
                r.damagePlayer = dpGate;
                r.damageCreature = dcGate;
                if (typeof btRoh === "function") delete r._kreaturBissTakt;
                halte();
                pm.position.set(savedT23.ort.x, savedT23.ort.y, savedT23.ort.z);
                p.hp = savedT23.hp;
                p.respawnGraceUntil = savedT23.gnade;
                if (r.getGameMode() !== savedT23.mode) r.setGameMode(savedT23.mode);
            }
            w.z.bissGeste = bisse;
        });
    } catch (e) {
        w.fehler.push("ABBRUCH " + ((e && e.stack) || String(e)).split("\n").slice(0, 3).join(" | "));
    } finally {
        r.damageCreature = orig.damageCreature;
        r._kampfHitJuice = orig.juice;
        r._beginPlayerSwing = orig.swing;
        r.dslRun = orig.dsl;
        r.damagePlayer = orig.damagePlayer;
        delete r.damageCreature;
        delete r._kampfHitJuice;
        delete r._beginPlayerSwing;
        delete r.dslRun;
        delete r.damagePlayer;
        for (const c of tiere) if (c.parent) r.removeCreature(c); // die Wesen und die Gefallenen
        for (const pf of (s._pfeile || []).slice()) r._pfeilDespawn(pf);
        if (s._pfeile) s._pfeile.length = 0;
        try {
            r.equipHeld(saved.held || null);
        } catch (_e) {}
        if (s.buildMode && s.buildMode.active && fn("_clearBuildMode")) r._clearBuildMode();
        if (Array.isArray(saved.hotbar)) s.hotbar = saved.hotbar;
        if (r.getGameMode() !== saved.mode) r.setGameMode(saved.mode);
        if (fn("setCameraMode")) r.setCameraMode(saved.cam);
        s.yaw = saved.yaw;
        s.pitch = saved.pitch;
        s.isPointerLocked = saved.lock;
        p.hp = saved.hp;
        p.respawnGraceUntil = saved.grace;
        p.breakHeld = saved.breakHeld;
        p._swing = saved.swing;
        p._hitStopUntil = saved.hitStop;
        s.maxCreatures = saved.maxC;
    }
    return w;
}

module.exports = { WELLE_L };
