#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// diag-kampf-gefuehl.cjs — DIE GERECHNETE SCHWUNGPHYSIK ERREICHT DEN KAMPF
// (npm run gate:kampf-gefuehl; Orakel Tier-1 #5).
//
// Die Linse hält fünf Kampf-Gesetze am ECHTEN Chokepoint (_beginPlayerSwing /
// _tickKampfSchwung / _kampfSweepTick / damageCreature / updateCreatures),
// headless/Null-Renderer:
//
//  (A) DAUER ∝ √I: die Schwung-Dauer zweier Waffen (echte _swingDynamics-
//      Trägheiten zweier Blueprints, beide UNGEKLEMMT im [min,max]-Band)
//      verhält sich wie √(I2/I1) ± 5 % — die EINE Quelle; die attackSpeed-
//      Parallel-Wahrheit ist für den Spieler-Schwung gefallen (Source-Proben:
//      Cooldown/HUD/Werkstatt lesen _swingDauer*, _playerAttackCreature liest
//      KEIN attackSpeed und schädigt NICHT selbst — der Klick löst nur aus).
//  (B) KLINGEN-SWEEP: ein Ziel NEBEN dem Crosshair (0.9 m seitlich der Blick-
//      Linie, innerhalb der Klingen-Kapsel) wird in der Strike-Phase getroffen,
//      GENAU EINMAL je Schwung (Dedup); ein Ziel HINTER dem Rücken NIE.
//      Treffer-Juice: Hit-Stop-Fenster gesetzt + Kamera-Impuls über den
//      BESTEHENDEN Landungs-Dip (_landImpactPending) + Klang-One-Shot über die
//      EXISTIERENDE Maschine (Stimme-aus → stumm, kein zweiter AudioContext).
//  (C) HIT-STOP ≠ SIM: während des Hit-Stops steht die ANZEIGE-Uhr (walkPhase
//      + Schwung-Phase frieren), aber die FIXE SIM läuft weiter — die Fixed-
//      Akku-Probe (_loopFixedStep steppt, _fixedSimTime wächst) beweist es;
//      Source-Probe: _stepFixedSim/_loopFixedStep lesen _hitStopFactor NIE.
//  (D) TOD-KIPPEN: ein Kill despawnt NICHT sofort — der Körper kippt (die
//      Rotation WÄCHST über die Ticks, Richtung aus _fieldGradient), das
//      sterbende Wesen ist inert (damageCreature-Wand), der Despawn kommt
//      erst NACH der Frist (kippDauer + Nachklang).
//  (E) OBERKÖRPER-LAYER: der Schwung ist ein WEITERER additiver Posen-Layer
//      über der Lokomotion (rechter Arm/Rumpf bewegen sich, die BEINE bleiben
//      byte-gleich); nach dem Schwung ist die Pose rückstandsfrei byte-alt.
//  (S) SELBST-TESTS (die Linse feuert): (S1) _hitStopFactor ≡ 1 gestubbt →
//      die Anzeige-Uhr läuft trotz Hit-Stop — die Freeze-Messung misst den
//      echten Faktor. (S2) _segSegDistSq ≡ ∞ gestubbt → der Sweep trifft
//      nichts — die Treffer-Messung fließt durch die echte Kapsel-Mathe.
//      Beide Stubs restauriert (Gate-Hook-Lehre).
//
// WELLE L (06.10.) — die Leben-Prüfung „Kampf" (artifacts/profiband/leben/befund-kampf.md) als Linse am ECHTEN
// Chokepoint, gespielt wie ein Mensch: das Fadenkreuz wird über Gier und Neigung durch die ECHTE Kamera
// (_loopCamera, 1st und 3rd) auf das Ziel geführt, geklickt wird über den EINEN Dispatcher (tryMouseBreak /
// _tickHarvest / tryMousePlace / Canvas-mousedown), geschlagen über _beginPlayerSwing + _tickKampfSchwung.
// Gezählt wird nur mitlaufend (damageCreature, _kampfHitJuice, _beginPlayerSwing, dslRun-Voxel-Ops); keine Probe
// ersetzt die Stelle, an der ein Defekt saß (Q0). Die Voxel-Ops werden gezählt und nicht ausgeführt (der Krater ist
// das Urteil des Dispatchers, nicht des Schnitzers).
//  (Q8 TREFFER) Zone wirkt (Kopf ÷ Hinterlauf, jeder Treffer trägt eine Zone) · hangab (Hirsch 1,6 m/−0,62 m, Fuchs
//      1,3 m/−0,6 m) und klein flach (Hirsch L 0,64) je ≥ 8/10 · Hit-Stop-Energie Keule ≠ Grossschwert (≥ 10 %) · keine Schadens-Kappe (höchstens
//      2 von 17 Rezepten auf dem Maximal-Faktor) · Gegenwehr > 0 bei 20 Treffern in 1,6 m (pfad) · die Hand ist
//      kein Panzer (defense/hpMax gleich) · Kampf verschleißt, ein verbrauchtes Gerät schlägt nicht · der Pfeil:
//      Schaden ∝ Impuls (25 %-Auszug < 0,5 × voll) und eine Wand hält ihn (0 Treffer dahinter) · die fünf
//      Phantom-Leser sind aus dem Stamm verschwunden.
//  (Q9 MAUS) 3rd-Person 10 Klicks auf ein Tier in 2 m → 10 Schwünge, 0 Krater · 1st-Person Halten nach dem Stoß →
//      0 Krater · RMB mit Schwert → 0 Aufschüttungen (Spaten und leere Hand schütten weiter) · offene Werkstatt →
//      4 Canvas-Klicks, 0 Griffe in die Welt · FERTIGEN eines Bauwerks → Bau-Modus, die Hand bleibt leer.
//  (Q10 BLICK) Ego-Neigung −90° → Blick −90° · jedes „vor dir" (at_player_forward, „baue dorf hier") liegt vor dem
//      Blick (cos > 0,9) · der Pfeil fliegt aufs Fadenkreuz (< 1° bei 45° Steigung).
//  SELBST-TESTS (nur wo die Naht existiert): (S3) _blickVorn mit der alten −(sin, cos)-Richtung → „vor dir" kippt
//      hinter dich · (S4) _geraetGraebt ≡ true → das Schwert schüttet auf · (S5) _kreaturGliedTreffer ≡ null → kein
//      Treffer. Jede Naht restauriert.
//
//   node scripts/diag-kampf-gefuehl.cjs
// ─────────────────────────────────────────────────────────────────────────
const puppeteer = require("puppeteer");
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
// Port über KAMPF_GEFUEHL_PORT (parallele Worktrees fahren je eigenen Bereich), Standard 4451.
const PORT = Number(process.env.KAMPF_GEFUEHL_PORT || 4451);
const mime = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".wasm": "application/wasm",
    ".json": "application/json",
    ".css": "text/css",
    ".woff2": "font/woff2",
    ".png": "image/png",
};
const server = http.createServer((req, res) => {
    let p = req.url.split("?")[0];
    if (p === "/") p = "/index.html";
    const fp = path.join(root, p);
    if (!fp.startsWith(root)) return ((res.statusCode = 403), res.end());
    fs.readFile(fp, (err, data) => {
        if (err) return ((res.statusCode = 404), res.end());
        res.setHeader("Content-Type", mime[path.extname(fp)] || "application/octet-stream");
        res.end(data);
    });
});

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
        treff.push({ c, amount, src: opts && opts.source, t: T, ok: !!(res && res.ok) });
        return res;
    };
    r._kampfHitJuice = function (...a) {
        // neu: (creature, now, urteil, keEigen) — die Zone reist im Urteil; alt: (creature, now, keOpt, zoneKind)
        const z = a[2] && typeof a[2] === "object" ? a[2].zone || null : typeof a[3] === "string" ? a[3] : null;
        juice.push({ zone: z, t: T });
        return orig.juice.apply(this, a);
    };
    r._beginPlayerSwing = function () {
        const ok = orig.swing.call(this);
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
            c.updateMatrixWorld(true);
        };
        const parke = (c) => stelle(c, 60, 60 + tiere.indexOf(c) * 4);
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
            const ok = r._beginPlayerSwing();
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
        w.c.hitStopEnergie =
            w.z.stopGross !== null &&
            w.z.stopKeule !== null &&
            Math.abs(w.z.stopKeule - w.z.stopGross) / Math.max(w.z.stopKeule, w.z.stopGross) >= 0.1;
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
            faktoren.push({ id, f: t.amount / ((p.stats.damage || 5) * r._heldGueteFaktor() * zm) });
        }
        const fs = faktoren.filter((x) => x.f !== null).map((x) => x.f);
        const fMax = Math.max(...fs);
        w.z.faktoren = faktoren.map((x) => x.id + ":" + (x.f === null ? "-" : x.f.toFixed(2))).join(" ");
        w.z.aufDerKappe = fs.filter((f) => f >= fMax * 0.99).length;
        w.z.nahkampfRezepte = faktoren.length;
        w.c.keineKappe = fs.length >= 15 && w.z.aufDerKappe <= 2;
        // (T5) die Gegenwehr: 20 Treffer mit Rückstoß aus 1,6 m im Modus pfad
        r.setGameMode("pfad");
        p.hp = 1e9;
        p.respawnGraceUntil = -Infinity;
        const g0 = zaehl.gegenwehr;
        for (let i = 0; i < 20; i++) {
            stelle(hirsch, 1.6);
            r.damageCreature(hirsch, 5, {
                source: "player",
                fromPos: { x: pm.position.x, y: pm.position.y, z: pm.position.z },
                knockback: 16,
            });
        }
        w.z.gegenwehr = zaehl.gegenwehr - g0;
        r.setGameMode(saved.mode);
        p.hp = saved.hp;
        w.c.gegenwehr = w.z.gegenwehr > 0;
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
        }
        // die fünf Phantom-Leser (0 Definitionen im Kern) — kein Aufruf im Stamm
        // (Absenz über den Code ohne Kommentare — Kommentare dürfen die Gefallenen zitieren, Lehre 6)
        const stamm = Object.getOwnPropertyNames(A.prototype)
            .map((k) => {
                const d = Object.getOwnPropertyDescriptor(A.prototype, k);
                return d && typeof d.value === "function"
                    ? String(d.value)
                          .replace(/\/\/.*$/gm, "")
                          .replace(/\/\*[\s\S]*?\*\//g, "")
                    : "";
            })
            .join("\n");
        w.z.phantome = (stamm.match(/\b(zoneMulAt|zoneKindAt|zoneJuiceAt|handlingMul|handlingWindF)\b/g) || []).length;
        w.c.keinePhantome = w.z.phantome === 0;

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
        const dsl = r.parseChatToDsl("baue dorf hier");
        const at = dsl && dsl.program && Array.isArray(dsl.program[1]) ? dsl.program[1] : null;
        w.z.dorfCos = at
            ? ((at[1] - pm.position.x) * dD.x + (at[3] - pm.position.z) * dD.z) /
              (Math.hypot(dD.x, dD.z) * (Math.hypot(at[1] - pm.position.x, at[3] - pm.position.z) || 1))
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
        // der Pfeil aufs Fadenkreuz bei 45° Steigung
        if (rec) {
            ausruesten("klinge_langbogen");
            s.yaw = 0;
            s.pitch = Math.PI / 4;
            kamera();
            const d = camDir();
            const vorher = (s._pfeile || []).length;
            p._shotCooldownUntil = 0;
            r._beginPlayerShot(rec, 1);
            const pf = (s._pfeile || [])[vorher];
            if (pf) {
                const v = V3().set(pf.vx, pf.vy, pf.vz).normalize();
                w.z.pfeilFadenkreuz = grad(v.angleTo(d));
                r._pfeilDespawn(pf);
                s._pfeile.splice(s._pfeile.indexOf(pf), 1);
            }
            w.c.pfeilFadenkreuz = Number.isFinite(w.z.pfeilFadenkreuz) && w.z.pfeilFadenkreuz < 1;
        }
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
        for (const c of tiere) if (s.creatures.indexOf(c) !== -1) r.removeCreature(c);
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

(async () => {
    await new Promise((r) => server.listen(PORT, r));
    const browser = await puppeteer.launch({
        headless: "new",
        protocolTimeout: 300000,
        args: ["--no-sandbox", "--disable-gpu"],
    });
    const page = await browser.newPage();
    page.setDefaultTimeout(280000);
    let pageErr = null;
    page.on("pageerror", (e) => {
        const m = (e.stack || e.message).split("\n")[0];
        if (!pageErr) pageErr = m;
        console.log("[PAGE-ERROR]", m);
    });
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true; // GPU-frei, Produktions-Boot
    });
    let out = null;
    let welle = null;
    try {
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle0", timeout: 120000 });
        await page.waitForFunction(() => window.anazhRealm && typeof window.anazhRealm._gameLoopTick === "function", {
            timeout: 120000,
        });
        // Warmup: die Welt settled pumpen (plateau-basiert, die V18.273-Lehre).
        await page.evaluate(async () => {
            const r = window.anazhRealm;
            let lastSize = -1,
                stable = 0,
                ticks = 0;
            while (ticks < 3000) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (_e) {}
                ticks++;
                const sz = r.state.voxelChunks ? r.state.voxelChunks.size : 0;
                if (sz === lastSize) stable++;
                else {
                    stable = 0;
                    lastSize = sz;
                }
                if (sz > 20 && stable > 40) break;
                if (ticks % 10 === 0) await new Promise((res) => setTimeout(res, 0));
            }
        });

        // SYNCHRON messen (keine awaits — der rAF-Loop kann nicht dazwischenfunken).
        out = await page.evaluate(() => {
            const r = window.anazhRealm,
                s = r.state,
                A = r.constructor;
            const o = { checks: {} };
            for (const fn of [
                "_swingDynamics",
                "_swingDauerFuerBlueprint",
                "_playerSwingDauer",
                "_beginPlayerSwing",
                "_playerAttackCreature",
                "_tickKampfSchwung",
                "_kampfSweepTick",
                "_kampfBladeReach",
                "_segSegDistSq",
                "_hitStopFactor",
                "_kampfHitJuice",
                "_playKampfOneShot",
                "_applyKampfSchwungPose",
                "damageCreature",
                "_creatureCombatDeath",
                "updateCreatures",
                "_loopFixedStep",
                "animatePlayerSoul",
            ]) {
                if (typeof r[fn] !== "function") return { error: fn + " fehlt" };
            }
            // KERN-PFLICHT 17.07. — der SWING_LAWS-Zwilling ist gefallen: die
            // Schwung-/Gefühls-Gesetze leben NUR im schmiede-Gesetzbuch (ARENA).
            const AG = A._arenaGesetz();
            if (!AG || !AG.schwung || !AG.gefuehl) return { error: "ARENA-Gesetz fehlt" };
            const K = AG.schwung;
            const G = AG.gefuehl;
            const codeOf = (fn) =>
                String(fn)
                    .replace(/\/\/.*$/gm, "")
                    .replace(/\/\*[\s\S]*?\*\//g, "");

            // ── KONSUM-Proben (Lehre 6): die EINE Quelle ist verdrahtet ──
            const atkSrc = codeOf(r._playerAttackCreature);
            o.checks.klickLoestNurAus =
                /_beginPlayerSwing/.test(atkSrc) && !/attackSpeed/.test(atkSrc) && !/damageCreature/.test(atkSrc);
            o.checks.cooldownLiestQuelle =
                /_playerSwingDauer/.test(codeOf(r._beginPlayerSwing)) && !/attackSpeed/.test(codeOf(r._beginPlayerSwing));
            o.checks.hudLiestQuelle = /_playerSwingDauer/.test(codeOf(r.tickStatsHud));
            o.checks.werkstattLiestQuelle = /_swingDauerFuerBlueprint/.test(codeOf(r._blueprintAbilityStats));
            o.checks.simLiestNieHitStop =
                !/_hitStopFactor/.test(codeOf(r._stepFixedSim)) && !/_hitStopFactor/.test(codeOf(r._loopFixedStep));
            o.checks.anzeigeLiestHitStop =
                /_hitStopFactor/.test(codeOf(r.animatePlayerSoul)) && /_hitStopFactor/.test(codeOf(r._tickKampfSchwung));
            o.checks.layerImRigPfad = /_applyKampfSchwungPose/.test(codeOf(r.animatePlayerSoul));
            const juiceSrc = codeOf(r._kampfHitJuice);
            o.checks.juiceKanaele = /_landImpactPending/.test(juiceSrc) && /_playKampfOneShot/.test(juiceSrc);
            // Welle 5 Klang: der Treffer klingt aus dem Gesetz (klang:SUBSTANZ.treffer) über den EINEN Ereignis-
            // Chokepoint `_substanzKlang` — er trägt Master, Symphonie-Wand und keinen zweiten Kontext.
            const shotSrc = codeOf(r._substanzKlang);
            o.checks.klangEineMaschine =
                /_substanzKlang\(/.test(codeOf(r._playKampfOneShot)) &&
                /masterGain/.test(shotSrc) &&
                /enabled/.test(shotSrc) &&
                !/new\s+AudioContext/.test(shotSrc);
            const deathSrc = codeOf(r._creatureCombatDeath);
            o.checks.todKipptStattDespawn =
                /_fieldGradient/.test(deathSrc) && /dying/.test(deathSrc) && !/removeCreature\(/.test(deathSrc);
            o.checks.abschiedNachFrist = /dying/.test(codeOf(r.updateCreatures)) && /removeCreature\(/.test(codeOf(r.updateCreatures));
            // Stimme-aus respektiert (headless: Symphonie nie aktiviert → stumm, kein Throw)
            o.checks.stimmeAusStumm = r._playKampfOneShot({ härte: 1 }) === false && !s.symphony.enabled;

            // ── (A) DAUER ∝ √I — zwei ECHTE Blueprints durch die ECHTE Quelle ──
            const box = (m, sz, p) => ({ shape: "box", material: m, size: sz, position: p || { x: 0, y: 0, z: 0 } });
            const blu = s.blueprints;
            const leicht = {
                name: "_kg_klinge",
                parts: [box("holz", { x: 0.15, y: 1.5, z: 0.15 }), box("eisen", { x: 0.6, y: 0.6, z: 0.6 }, { x: 0, y: 1.5, z: 0 })],
            };
            const schwer = {
                name: "_kg_hammer",
                parts: [box("holz", { x: 0.15, y: 2.0, z: 0.15 }), box("eisen", { x: 0.9, y: 0.9, z: 0.9 }, { x: 0, y: 2.0, z: 0 })],
            };
            const I1 = r._swingDynamics(leicht).swingInertia;
            const I2 = r._swingDynamics(schwer).swingInertia;
            const D1 = r._swingDauerFuerBlueprint(leicht);
            const D2 = r._swingDauerFuerBlueprint(schwer);
            o.dauer = { I1, I2, D1, D2 };
            const eps = 0.005;
            o.checks.aBeideUngeklemmt =
                I2 > I1 * 1.5 &&
                D1 > K.minDauerSec + eps &&
                D1 < K.maxDauerSec - eps &&
                D2 > K.minDauerSec + eps &&
                D2 < K.maxDauerSec - eps;
            o.dauerRatio = D1 > 0 ? D2 / D1 : 0;
            o.dauerSoll = I1 > 0 ? Math.sqrt(I2 / I1) : 0;
            o.checks.aVerhaeltnisWurzelI = o.dauerSoll > 0 && Math.abs(o.dauerRatio / o.dauerSoll - 1) <= 0.05;
            // die Faust hat eine endliche Dauer (kein Instant-Prügeln)
            o.checks.aFaustDauer = r._swingDauerFuerBlueprint(null) === K.handDauerSec && K.handDauerSec > 0.1;

            // ── Bühne für (B)/(C)/(E): Waffe in die Hand, bekannte Blickrichtung ──
            const p = s.player;
            const pm = s.playerMesh;
            if (!p || !pm) return { error: "kein Spieler" };
            const saved = {
                yaw: s.yaw,
                equipped: p.equipped,
                swing: p._swing,
                hitStop: p._hitStopUntil,
                landImpact: s._landImpactPending,
                lastAttackAt: p.lastAttackAt,
                maxCreatures: s.maxCreatures,
                vel: s.playerVel,
                uw: s.playerUnderwater,
                mounted: p.mountedArch,
                walkPhase: p.walkPhase,
                gaitW: p._gaitW,
                lastTick: p.animationLastTick,
                soul: p.soul,
            };
            blu._kg_klinge = leicht;
            p.equipped = { held: "_kg_klinge" };
            s.maxCreatures = Math.max(s.maxCreatures || 0, s.creatures.length + 4);
            s.yaw = 0; // Blick nach +z (die _loopCamera-Konvention)
            s.pitch = 0;
            // die Klinge folgt dem Fadenkreuz (Welle L): die ECHTE Kamera steht auf dem Blick
            if (typeof r.setCameraMode === "function") r.setCameraMode("first");
            r._loopCamera(900);
            p._hitStopUntil = 0;
            p._swing = null;

            const spawnBei = (dx, dz) => {
                const c = r.spawnCreatureAt(pm.position.x + 200, pm.position.y, pm.position.z + 200, "happy", "wesen");
                if (c) c.position.set(pm.position.x + dx, pm.position.y, pm.position.z + dz);
                return c;
            };
            const reach = r._kampfBladeReach();
            o.reach = reach;
            const cNeben = spawnBei(0.9, Math.min(1.8, reach - 0.4)); // NEBEN dem Crosshair, in der Kapsel
            const cRuecken = spawnBei(0, -2.0); // HINTER dem Rücken
            if (!cNeben || !cRuecken) return { error: "Kreatur-Spawn fehlgeschlagen (Cap?)" };
            // Das Fadenkreuz steht 0,9 m NEBEN dem Ziel auf seiner Leibes-Höhe (Gier 0, die Neigung auf die Mitte):
            // die Klinge zielt durchs Fadenkreuz und fegt den Bogen ±arcHalf (Welle L).
            {
                const b = new THREE.Box3().setFromObject(cNeben);
                const c = s.camera.position;
                s.pitch = Math.atan2((b.min.y + b.max.y) / 2 - c.y, Math.max(0.5, cNeben.position.z - c.z));
                r._loopCamera(901);
            }

            const schwinge = (t0) => {
                // ein voller Schwung über die synthetische Anzeige-Uhr; zählt die
                // hp-Abfälle des Neben-Ziels (Dedup-Beweis) + merkt das Hit-Fenster.
                p._swing = null;
                const okStart = r._beginPlayerSwing();
                if (!okStart || !p._swing) return { okStart: false, hits: 0 };
                p._swing.lastT = t0;
                let hits = 0;
                let tHit = null;
                let prevHp = cNeben.userData.hp;
                let t = t0;
                for (let k = 0; k < 200 && p._swing; k++) {
                    t += 0.02;
                    r._tickKampfSchwung(t);
                    if (cNeben.userData.hp < prevHp) {
                        hits++;
                        if (tHit === null) tHit = t;
                        prevHp = cNeben.userData.hp;
                    }
                }
                return { okStart: true, hits, tEnd: t, tHit };
            };

            // ── (B) SWEEP: Neben-Ziel EINMAL, Rücken-Ziel NIE, Juice feuert ──
            const hpNeben0 = cNeben.userData.hp;
            const hpRueck0 = cRuecken.userData.hp;
            s._landImpactPending = 0;
            const lauf1 = schwinge(1000);
            o.sweep = lauf1;
            o.checks.bTrifftNeben = lauf1.okStart && cNeben.userData.hp < hpNeben0;
            o.checks.bDedupEinmal = lauf1.hits === 1;
            o.checks.bNieRuecken = cRuecken.userData.hp === hpRueck0 && !cRuecken.userData.dying;
            // das Hit-Stop-Fenster liegt im Gesetz-Band [freezeMinSec, freezeMaxSec] ab dem Treffer-Takt
            o.freeze = lauf1.tHit !== null ? p._hitStopUntil - lauf1.tHit : null;
            o.checks.bHitStopGesetzt =
                o.freeze !== null && o.freeze >= G.freezeMinSec - 1e-9 && o.freeze <= G.freezeMaxSec + 1e-9;
            o.checks.bKameraImpuls = (s._landImpactPending || 0) >= G.dipMin - 1e-9;
            // ein zweiter Schwung trifft WIEDER (der Dedup gilt JE Schwung, nicht
            // global) — das Ziel re-pinnen (der Knockback schob es hinaus).
            const pinNeben = () =>
                cNeben.position.set(pm.position.x + 0.9, pm.position.y, pm.position.z + Math.min(1.8, reach - 0.4));
            p._hitStopUntil = 0;
            pinNeben();
            const hpNeben1 = cNeben.userData.hp;
            const lauf2 = schwinge(2000);
            o.checks.bZweiterSchwungTrifft = lauf2.okStart && cNeben.userData.hp < hpNeben1;

            // ── (S2) SELBST-TEST: Kapsel-Mathe gestubbt (∞) → kein Treffer ──
            p._hitStopUntil = 0;
            pinNeben();
            const savedSeg = r._segSegDistSq;
            r._segSegDistSq = () => Infinity;
            const hpNeben2 = cNeben.userData.hp;
            const laufStub = schwinge(3000);
            r._segSegDistSq = savedSeg; // restaurieren (Gate-Hook-Lehre)
            o.checks.s2LinseFeuert = laufStub.okStart && cNeben.userData.hp === hpNeben2;

            // ── (C) HIT-STOP ≠ SIM: Anzeige friert, die Fixed-Akku läuft weiter ──
            p._hitStopUntil = Number.MAX_SAFE_INTEGER; // Hit-Stop „ewig" (synthetisch)
            // (C1) die Schwung-Phase friert
            p._swing = null;
            r._beginPlayerSwing();
            const swC = p._swing;
            swC.lastT = 5000;
            for (let k = 1; k <= 20; k++) r._tickKampfSchwung(5000 + k * 0.02);
            o.checks.cSchwungFriert = !!p._swing && p._swing.t === 0;
            p._swing = null;
            // (C2) die Gang-Phase friert (echter Konsument animatePlayerSoul)
            if (!pm.userData.rig && typeof r.applyPlayerSoul === "function") r.applyPlayerSoul("human");
            const mesh = s.playerMesh;
            if (!mesh.userData.rig) return { error: "Spieler ohne Rig (koerper-Kern kalt?)" };
            s.playerUnderwater = false;
            p.mountedArch = null;
            let vStub = 5;
            s.playerVel = { x: () => vStub, z: () => 0, y: () => 0 };
            const gehe = (t0, n) => {
                p.animationLastTick = -Infinity;
                r.animatePlayerSoul(t0);
                const ph0 = p.walkPhase;
                for (let k = 1; k <= n; k++) r.animatePlayerSoul(t0 + k / 60);
                return p.walkPhase - ph0;
            };
            const dPhaseGestoppt = gehe(6000, 30);
            o.dPhaseGestoppt = dPhaseGestoppt;
            o.checks.cGangFriert = dPhaseGestoppt === 0;
            // (C3) die FIXE SIM läuft WÄHREND des Hit-Stops weiter (Fixed-Akku-Probe)
            s.playerVel = saved.vel; // die Sim braucht den ECHTEN Body (kein Stub)
            const simT0 = s._fixedSimTime;
            const steps1 = r._loopFixedStep(0.05, performance.now() / 1000);
            const steps2 = r._loopFixedStep(0.05, performance.now() / 1000 + 0.05);
            o.simSteps = steps1 + steps2;
            o.simDelta = s._fixedSimTime - simT0;
            o.checks.cSimLaeuftWeiter = o.simSteps >= 2 && o.simDelta > 0;
            // (C4) Gegenprobe: ohne Hit-Stop läuft die Anzeige-Uhr wieder
            s.playerVel = { x: () => vStub, z: () => 0, y: () => 0 };
            p._hitStopUntil = 0;
            const dPhaseFrei = gehe(7000, 30);
            o.dPhaseFrei = dPhaseFrei;
            o.checks.cGegenprobeLaeuft = dPhaseFrei > 0;
            // (S1) SELBST-TEST: _hitStopFactor ≡ 1 gestubbt → trotz Hit-Stop läuft die Uhr
            const savedFactor = r._hitStopFactor;
            p._hitStopUntil = Number.MAX_SAFE_INTEGER;
            r._hitStopFactor = () => 1;
            const dPhaseStub = gehe(8000, 30);
            r._hitStopFactor = savedFactor; // restaurieren (Gate-Hook-Lehre)
            p._hitStopUntil = 0;
            o.dPhaseStub = dPhaseStub;
            o.checks.s1LinseFeuert = dPhaseStub > 0;

            // ── (E) OBERKÖRPER-LAYER additiv über der Lokomotion ──
            const rig = mesh.userData.rig;
            const poseBei = (swing) => {
                vStub = 0;
                p._gaitW = 0;
                p.walkPhase = 0;
                p._swing = swing || null;
                p.animationLastTick = -Infinity;
                r.animatePlayerSoul(9000);
                r.animatePlayerSoul(9000); // dt=0 (Uhr steht) — deterministische Idle-Pose
                return {
                    armX: rig.armR.shoulder.rotation.x,
                    chestY: rig.chest ? rig.chest.rotation.y : 0,
                    legLHip: rig.legL.hip.rotation.x,
                    legRKnee: rig.legR.knee.rotation.x,
                };
            };
            const dauerE = r._playerSwingDauer();
            const mkSwing = (t) => ({
                t,
                dauer: dauerE,
                windupSec: dauerE * K.windupFrac,
                strikeSec: dauerE * K.strikeFrac,
                weapon: null,
                hits: new Set(),
                reach: 2,
                lastT: 0,
            });
            const pose0 = poseBei(null); // reine Lokomotion (Idle)
            const poseW = poseBei(mkSwing(dauerE * K.windupFrac * 0.6)); // mitten im Windup
            const poseEnd = poseBei(null); // nach dem Schwung: rückstandsfrei
            o.pose = { pose0, poseW };
            o.checks.eArmHebt = Math.abs(poseW.armX - pose0.armX) > 0.3 && Math.abs(poseW.chestY - pose0.chestY) > 0.05;
            o.checks.eBeineByteGleich =
                poseW.legLHip === pose0.legLHip && poseW.legRKnee === pose0.legRKnee;
            o.checks.eRueckstandsfrei =
                poseEnd.armX === pose0.armX && poseEnd.chestY === pose0.chestY;
            p._swing = null;

            // ── (D) TOD-KIPPEN: Rotation wächst, inert, Despawn erst nach Frist ──
            const cTod = spawnBei(60, 60); // weit weg — kein Sweep-/Spieler-Einfluss
            if (!cTod) return { error: "Tod-Kreatur-Spawn fehlgeschlagen" };
            // up·y der gedrehten Hochachse — reine Quaternion-Mathe (R(q)·(0,1,0)).y
            // = 1 − 2(qx² + qz²), kein THREE nötig.
            const upY = (c) => 1 - 2 * (c.quaternion.x * c.quaternion.x + c.quaternion.z * c.quaternion.z);
            const kill = r.damageCreature(cTod, 99999, { source: "world" });
            o.checks.dKillKipptErst =
                !!kill.killed && !!cTod.userData.dying && s.creatures.indexOf(cTod) !== -1;
            const tick = (n, dt) => {
                for (let k = 0; k < n; k++) r.updateCreatures(dt);
            };
            const uy0 = upY(cTod);
            tick(2, 0.1); // t=0.2
            const uyA = upY(cTod);
            tick(3, 0.1); // t=0.5
            const uyB = upY(cTod);
            o.kipp = { uy0, uyA, uyB };
            o.checks.dRotationWaechst = uy0 > 0.95 && uyA < uy0 - 0.005 && uyB < uyA - 0.05;
            o.checks.dNochDa = s.creatures.indexOf(cTod) !== -1;
            const nachtreten = r.damageCreature(cTod, 10, { source: "world" });
            o.checks.dSterbendInert = nachtreten.ok === false && nachtreten.reason === "dying";
            tick(5, 0.1); // t=1.0 — der Kipp ist vollendet, der Nachklang läuft
            const uyC = upY(cTod);
            o.kipp.uyC = uyC;
            o.checks.dGekippt = uyC < 0.35 && s.creatures.indexOf(cTod) !== -1;
            tick(4, 0.1); // t=1.4 > kippDauer + Nachklang → der bestehende Abschied
            o.checks.dDespawnNachFrist = s.creatures.indexOf(cTod) === -1;

            // ── EINHEITSBREI-WAND (18.07.) — die 13 Gattungen differenzieren ──
            // Fake-Blueprints mit BYTE-GLEICHEN Donor-Parts (KIND_SUBSTANCE.
            // geraet_schwert) aber verschiedener studioGestalt: unterscheiden
            // sich Dauer/Reichweite/Schaden, KANN die Quelle nur der Kern sein
            // (kampfMasze) — die Donor-Parts können es nicht liefern (Absenz-
            // Beweis im Konsum-Beweis). Selbst-Test: kampfMasze gestubbt →
            // alles kollabiert auf EINE Dauer — die Wand MUSS es sehen.
            try {
                const sc = globalThis.__schmiedeCore;
                const donorParts = JSON.parse(JSON.stringify(r.constructor.KIND_SUBSTANCE.geraet_schwert.parts));
                const gattungen = ["dolch", "messer", "langschwert", "saebel", "grossschwert", "keule", "kriegsaxt"];
                const probe = () => {
                    const rows = [];
                    for (const id of gattungen) {
                        const bp = { name: "klinge_" + id, studioGestalt: id, parts: donorParts };
                        const dauer = r._swingDauerFuerBlueprint(bp);
                        const heldSaved = r._heldImplementBlueprint;
                        r._heldImplementBlueprint = () => bp;
                        let reach = null;
                        let dmgF = null;
                        try {
                            reach = r._kampfBladeReach();
                            // die WIRKUNG des Treffer-Urteils (Welle L: seine Energie gegen keRefJ, keine Klemme)
                            // bei EINEM Klingen-Tempo — die Ordnung trägt die gemessene Masse.
                            dmgF = r._trefferWirkung(r._kampfUrteil(20, 0, null));
                        } finally {
                            r._heldImplementBlueprint = heldSaved;
                        }
                        rows.push({ id, dauer, reach, dmgF });
                    }
                    return rows;
                };
                r._kampfMaszeMemo = null; // frisch messen
                const rows = probe();
                const by = {};
                for (const row of rows) by[row.id] = row;
                o.brei = rows.map((x) => `${x.id}:${x.dauer.toFixed(2)}s/${x.reach.toFixed(2)}m/×${x.dmgF.toFixed(2)}`).join(" ");
                o.checks.breiDauerDistinct = new Set(rows.map((x) => x.dauer.toFixed(3))).size >= 3;
                o.checks.breiReachDistinct = new Set(rows.map((x) => x.reach.toFixed(2))).size >= 3;
                o.checks.breiDmgDistinct = new Set(rows.map((x) => x.dmgF.toFixed(2))).size >= 3;
                o.checks.breiOrdnung =
                    by.dolch.dauer < by.grossschwert.dauer &&
                    by.dolch.reach < by.grossschwert.reach &&
                    by.messer.dmgF < by.langschwert.dmgF &&
                    by.langschwert.dmgF < by.keule.dmgF;
                // Texel==Gesetz: das UNGEKLEMMTE Paar langschwert/grossschwert
                // hält dauer2/dauer1 == √(I2/I1) ± 5 % gegen kampfMasze.
                const k1 = sc.kampfMasze("langschwert");
                const k2 = sc.kampfMasze("grossschwert");
                const soll = Math.sqrt(k2.traegheit / k1.traegheit);
                const ist = by.grossschwert.dauer / by.langschwert.dauer;
                o.breiRatio = { ist, soll };
                o.checks.breiRatio = Math.abs(ist / soll - 1) < 0.05;
                // Selbst-Test: ohne kampfMasze kollabiert alles auf die EINE
                // Donor-Dauer — die Distinct-Wand MUSS rot sehen können.
                const kmSaved = r._schmiedeKampfMasze;
                r._schmiedeKampfMasze = () => null;
                let stubRows = null;
                try {
                    stubRows = probe();
                } finally {
                    r._schmiedeKampfMasze = kmSaved;
                }
                o.checks.breiSelbsttest =
                    new Set(stubRows.map((x) => x.dauer.toFixed(3))).size === 1 &&
                    new Set(stubRows.map((x) => x.reach.toFixed(2))).size === 1;
            } catch (eBrei) {
                o.breiErr = (eBrei && eBrei.message) || String(eBrei);
            }

            // ── Bühne restaurieren ──
            for (const c of [cNeben, cRuecken]) {
                if (s.creatures.indexOf(c) !== -1) {
                    if (c.userData.dying) {
                        c.userData.dying.t = 9999;
                        r.updateCreatures(0.016);
                    } else r.removeCreature(c);
                }
            }
            delete blu._kg_klinge;
            s.yaw = saved.yaw;
            p.equipped = saved.equipped;
            p._swing = saved.swing;
            p._hitStopUntil = saved.hitStop;
            s._landImpactPending = saved.landImpact;
            p.lastAttackAt = saved.lastAttackAt;
            s.maxCreatures = saved.maxCreatures;
            s.playerVel = saved.vel;
            s.playerUnderwater = saved.uw;
            p.mountedArch = saved.mounted;
            p.walkPhase = saved.walkPhase;
            p._gaitW = saved.gaitW;
            p.animationLastTick = saved.lastTick;

            return o;
        });
        welle = await page.evaluate(WELLE_L);
    } catch (e) {
        out = { error: (e && e.message) || String(e) };
    }
    await browser.close();
    server.close();

    console.log(
        "\n===== KAMPF-GEFÜHL — Dauer ∝ √I · Klingen-Sweep · Hit-Stop ≠ Sim · Tod-Kippen (gate:kampf-gefuehl) =====\n"
    );
    let ok = true;
    const check = (cond, msg) => {
        console.log(`  ${cond ? "✅" : "❌"} ${msg}`);
        if (!cond) ok = false;
    };
    if (!out || out.error) {
        console.log("FEHLER:", out ? out.error : "?");
        ok = false;
    } else {
        const c = out.checks;
        console.log(
            `  (A) I1=${out.dauer.I1.toFixed(3)} → ${out.dauer.D1.toFixed(3)} s · I2=${out.dauer.I2.toFixed(3)} → ${out.dauer.D2.toFixed(3)} s · Ratio ${out.dauerRatio.toFixed(3)} (soll √(I2/I1)=${out.dauerSoll.toFixed(3)})`
        );
        console.log(
            `  (B) Reichweite ${out.reach.toFixed(2)} m · Treffer je Schwung ${out.sweep.hits} · (C) Sim-Schritte im Hit-Stop ${out.simSteps} (Δt ${out.simDelta.toFixed(3)} s) · Phase gestoppt ${out.dPhaseGestoppt.toFixed(3)} / frei ${out.dPhaseFrei.toFixed(2)}`
        );
        console.log(
            `  (D) up·y: ${out.kipp.uy0.toFixed(2)} → ${out.kipp.uyA.toFixed(2)} → ${out.kipp.uyB.toFixed(2)} → ${out.kipp.uyC.toFixed(2)} · (E) Arm ${out.pose.pose0.armX.toFixed(2)} → ${out.pose.poseW.armX.toFixed(2)}\n`
        );
        if (out.brei) console.log(`  (BREI) ${out.brei}\n`);
        check(
            c.breiDauerDistinct && c.breiReachDistinct && c.breiDmgDistinct,
            "EINHEITSBREI: byte-gleiche Donor-Parts, ≥3 distinkte Dauern/Reichweiten/Schadens-Faktoren — die Quelle ist der Kern (kampfMasze)" +
                (out.breiErr ? " — FEHLER: " + out.breiErr : "")
        );
        check(
            c.breiOrdnung,
            "EINHEITSBREI: die Ordnung stimmt (Dolch flink+kurz < Grossschwert · Messer < Langschwert < Keule im Schaden)"
        );
        check(
            c.breiRatio,
            `EINHEITSBREI: Dauer-Verhältnis == √(I-Verhältnis) ± 5 % gegen kampfMasze (ist ${out.breiRatio ? out.breiRatio.ist.toFixed(3) : "?"} soll ${out.breiRatio ? out.breiRatio.soll.toFixed(3) : "?"})`
        );
        check(
            c.breiSelbsttest,
            "EINHEITSBREI-SELBSTTEST: kampfMasze gestubbt → alles kollabiert auf EINE Donor-Dauer (die Wand sieht den Riss)"
        );
        check(c.klickLoestNurAus, "KONSUM: der Crosshair-Klick löst NUR aus (kein attackSpeed, kein Direkt-Schaden)");
        check(c.cooldownLiestQuelle, "KONSUM: der Cooldown IST die Schwung-Dauer (_playerSwingDauer — EINE Quelle)");
        check(c.hudLiestQuelle, "KONSUM: das Stats-HUD (Angriffstempo) liest die Schwung-Quelle");
        check(c.werkstattLiestQuelle, "KONSUM: die Werkstatt-Ablesung (Tempo) liest die Schwung-Quelle");
        check(c.aBeideUngeklemmt, "(A) beide Fixtures liegen UNGEKLEMMT im [min,max]-Band (der Test ist ehrlich)");
        check(
            c.aVerhaeltnisWurzelI,
            `(A) Schwung-Dauer-Verhältnis ∝ √(I2/I1) ± 5 % (${out.dauerRatio.toFixed(3)} vs ${out.dauerSoll.toFixed(3)})`
        );
        check(c.aFaustDauer, "(A) die leere Faust hat die endliche Hand-Dauer (kein Instant-Prügeln)");
        check(c.bTrifftNeben, "(B) der Sweep trifft ein Ziel NEBEN dem Crosshair (in der Klingen-Kapsel)");
        check(c.bDedupEinmal, `(B) dedupliziert je Schwung: GENAU EIN Treffer (${out.sweep.hits})`);
        check(c.bZweiterSchwungTrifft, "(B) ein zweiter Schwung trifft wieder (Dedup gilt JE Schwung)");
        check(c.bNieRuecken, "(B) NIE ein Ziel hinter dem Rücken (die Wand im Sweep-Chokepoint)");
        check(
            c.bHitStopGesetzt,
            `(B) der Treffer öffnet das Hit-Stop-Fenster im Gesetz-Band (${out.freeze !== null ? (out.freeze * 1000).toFixed(0) + " ms" : "kein Treffer"})`
        );
        check(c.bKameraImpuls, "(B) Kamera-Impuls über den BESTEHENDEN Landungs-Dip (_landImpactPending)");
        check(c.juiceKanaele, "(B) Hit-Juice wired: Kamera-Dip + Klang-One-Shot in _kampfHitJuice");
        check(c.klangEineMaschine, "(B) Klang über die EXISTIERENDE Maschine (masterGain, kein zweiter AudioContext)");
        check(c.stimmeAusStumm, "(B) Stimme-aus respektiert: Symphonie aus → der Treffer bleibt stumm");
        check(c.s2LinseFeuert, "SELBST-TEST (S2): Kapsel-Mathe ≡ ∞ gestubbt → kein Treffer (die Messung ist nicht blind)");
        check(c.cSchwungFriert, "(C) HIT-STOP: die Schwung-Phase friert (t bleibt 0)");
        check(c.cGangFriert, "(C) HIT-STOP: die Gang-Phase friert (walkPhase Δ=0 am echten Konsumenten)");
        check(c.cSimLaeuftWeiter, `(C) die FIXE SIM läuft WÄHREND des Hit-Stops weiter (${out.simSteps} Schritte, Fixed-Akku-Probe)`);
        check(c.cGegenprobeLaeuft, "(C) Gegenprobe: ohne Hit-Stop läuft die Anzeige-Uhr wieder");
        check(c.simLiestNieHitStop, "(C) Source-Wand: _stepFixedSim/_loopFixedStep lesen _hitStopFactor NIE");
        check(c.anzeigeLiestHitStop, "(C) und NUR die Anzeige-Uhr (animatePlayerSoul + Schwung-Tick) liest ihn");
        check(c.s1LinseFeuert, "SELBST-TEST (S1): _hitStopFactor ≡ 1 gestubbt → die Uhr läuft (die Freeze-Messung misst den Faktor)");
        check(c.dKillKipptErst, "(D) TOD: der Kill setzt dying — KEIN Sofort-Despawn");
        check(c.dRotationWaechst, "(D) der Körper KIPPT: die Rotation wächst über die Ticks (entlang _fieldGradient)");
        check(c.dSterbendInert, "(D) ein sterbendes Wesen ist inert (damageCreature-Wand: reason=dying)");
        check(c.dGekippt && c.dNochDa, "(D) gekippt (~83°) und noch DA während des Nachklangs");
        check(c.dDespawnNachFrist, "(D) der Despawn kommt erst NACH der Frist (Kipp + Nachklang)");
        check(c.todKipptStattDespawn, "(D) Source-Wand: _creatureCombatDeath kippt (_fieldGradient), despawnt nicht selbst");
        check(c.abschiedNachFrist, "(D) und updateCreatures trägt den Abschied (removeCreature nach der Frist)");
        check(c.eArmHebt, "(E) OBERKÖRPER-Layer: im Windup heben Arm + Rumpf (additiv über der Lokomotion)");
        check(c.eBeineByteGleich, "(E) die BEINE bleiben byte-gleich (der Layer ist NUR Oberkörper)");
        check(c.eRueckstandsfrei, "(E) nach dem Schwung ist die Pose rückstandsfrei byte-alt");
        check(c.layerImRigPfad, "(E) KONSUM: animatePlayerSoul wendet den Schwung-Layer an");
        check(!pageErr, `kein Page-Error (${pageErr || "sauber"})`);
    }
    console.log("\n  ── WELLE L — Treffer · Maus · Blick (die Leben-Prüfung „Kampf“ als Linse) ──\n");
    if (!welle) {
        console.log("FEHLER: die Welle-L-Proben liefen nicht");
        ok = false;
    } else {
        const z = welle.z,
            c = welle.c;
        const f1 = (v) => (v === null || v === undefined ? "–" : Number(v).toFixed(2));
        if (welle.fehler.length) console.log("  Fehler: " + welle.fehler.join(" · "));
        console.log(
            `  (Q8) Zone Kopf÷Bein ${f1(z.zoneKopfBein)} (Ziel-Rest ${f1(z.zielKopf)}°/${f1(z.zielBein)}°, Zonen ${JSON.stringify(z.zonen)}) · hangab Hirsch ${z.hangabHirsch}/10, Fuchs ${z.hangabFuchs}/10 · klein flach ${z.kleinFlach}/10`
        );
        console.log(
            `       Hit-Stop-Energie Grossschwert ${f1(z.stopGross)} J · Keule ${f1(z.stopKeule)} J · Kappe ${z.aufDerKappe} von ${z.nahkampfRezepte} · Gegenwehr ${z.gegenwehr}/20`
        );
        console.log(`       Faktoren ${z.faktoren}`);
        console.log(
            `       ${z.panzer} · Verschleiß wear ${f1(z.wear16)} nach ${z.treffer16} Treffern, verbraucht ${z.trefferVerbraucht} Treffer · Phantome ${z.phantome}`
        );
        console.log(
            `       Pfeil voll ${f1(z.pfeilVoll)} · 25 % ${f1(z.pfeilViertel)} · hinter der Wand ${z.pfeilHinterWand} · frei ${z.pfeilFrei}`
        );
        console.log(
            `  (Q9) 3rd: Fadenkreuz ${z.dritte && z.dritte.fadenkreuz}/10, frei ${z.dritte && z.dritte.frei}, Schwünge ${z.dritte && z.dritte.schwuenge}, Krater ${z.dritte && z.dritte.krater}, Treffer ${z.dritte && z.dritte.treffer} · Halten nach dem Stoß ${z.haltenKrater} Krater · RMB Schwert ${z.rmbSchwert}/3, Spaten ${z.rmbSpaten}, Hand ${z.rmbHand} · Werkstatt: der Canvas greift ${z.werkstattGriffe}/4 (ohne Schublade ${z.ohneWerkstattGriffe}/1) · FERTIGEN ${JSON.stringify(z.fertigen)}`
        );
        console.log(
            `  (Q10) Ego-Neigung −90° → ${f1(z.blick90)}°, −57,3° → ${f1(z.blick57)}° · vor dir min cos ${f1(z.vorDirCos)} · „baue dorf hier" cos ${f1(z.dorfCos)} · Pfeil↔Fadenkreuz ${f1(z.pfeilFadenkreuz)}°\n`
        );
        check(c.zoneJederTreffer, "Q8 K-D2: jeder Treffer trägt eine Zone (die Phantom-Zone war null in 222/222)");
        check(c.zoneWirkt, "Q8 K-D2: die Zone wirkt — Kopf ÷ Bein ≥ 1,5 (dieselbe Klinge, derselbe Hirsch)");
        check(c.keinePhantome, "Q8 K-D2: die fünf Phantom-Leser (zoneMulAt/…/handlingWindF) sind aus dem Stamm verschwunden");
        check(c.hangab, "Q8 K-D3: hangab (Hirsch 1,6 m/−0,62 m, Fuchs 1,3 m/−0,6 m) je ≥ 8/10 — die Klinge folgt dem Fadenkreuz");
        check(c.kleinFlach, "Q8 K-D3: klein auf gleicher Höhe (Hirsch L 0,64) ≥ 8/10 — getroffen wird die Gestalt");
        check(c.hitStopEnergie, "Q8 K-D4: der Hit-Stop ist energie-skaliert — Keule ≠ Grossschwert (≥ 10 %)");
        check(c.keineKappe, "Q8 K-D5: keine Schadens-Kappe — höchstens 2 Nahkampf-Rezepte auf dem Maximal-Faktor");
        check(c.verschleiss, "Q8 K-D6: Kampf verschleißt die Klinge, ein verbrauchtes Gerät schlägt nicht");
        check(c.pfeilImpuls, "Q8 K-D8: der Pfeil trägt seinen Impuls in den Schaden (25 %-Auszug ≤ 0,5 × voll)");
        check(c.pfeilWand, "Q8 K-D8: eine Wand hält den Pfeil (0 Treffer dahinter, frei 1)");
        check(c.keinPanzer, "Q8 K-D15: die Hand ist kein Panzer (defense und hpMax unberührt, der Angriff steigt)");
        check(c.gegenwehr, "Q8 K-D16: Gegenwehr > 0 bei 20 Treffern aus 1,6 m (der Stoß kommt NACH dem Biss-Test)");
        check(c.dritteSchwingt, "Q9 K-D1: 3rd-Person — jeder freie Klick auf das Tier im Fadenkreuz schwingt (≥ 8 von 10 frei), 0 Krater");
        check(c.haltenOhneKrater, "Q9 K-D1: 1st-Person — das Halten nach dem Stoß gräbt nicht (0 Krater)");
        check(c.rmbSchwert, "Q9 K-D17: RMB mit dem Schwert schüttet nie auf (Spaten und leere Hand schon)");
        check(c.werkstattTaub, "Q9 V-D2: bei offener Werkstatt ist der Canvas taub (0 von 4 Griffen; ohne Schublade greift er)");
        check(c.fertigenBaut, "Q9 V-k11: FERTIGEN eines Bauwerks öffnet den Bau-Modus, die Hand bleibt leer");
        check(c.egoBlick, "Q10 K-D14: die Ego-Neigung ist der Blick (−90° → −90°, −57,3° → −57,3°)");
        check(c.vorDir, "Q10 V-D4: jedes „vor dir“ liegt vor dem Blick (at_player_forward, „baue dorf hier“: cos > 0,9)");
        check(c.pfeilFadenkreuz, "Q10 K-D14: der Pfeil fliegt aufs Fadenkreuz (< 1° bei 45° Steigung)");
        check(c.s3 === true, "SELBST-TEST (S3): _blickVorn mit der alten −(sin, cos)-Richtung → „vor dir“ kippt hinter dich");
        check(c.s4 === true, "SELBST-TEST (S4): _geraetGraebt ≡ wahr → das Schwert schüttet auf (die Linse sieht den Rückfall)");
        check(c.s5 === true, "SELBST-TEST (S5): _kreaturGliedTreffer ≡ null → kein Treffer (die Serie misst die Gestalt)");
    }
    console.log(
        `\n  ${ok ? "✅ GRÜN — die gerechnete Schwungphysik erreicht den Kampf: √I führt · die Klinge trifft · die Sim steht nie" : "❌ ROT — das Kampf-Gefühl trägt nicht"}\n`
    );
    process.exit(ok ? 0 : 1);
})();
