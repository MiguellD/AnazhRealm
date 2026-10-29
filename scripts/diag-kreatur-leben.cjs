#!/usr/bin/env node
// gate:kreatur-leben — DIE LEBENS-LINSE: als Skript die Seele im Kern; als Stück der Seiten-Funktion der Kreatur-Proben
// (`BUEHNEN` an ihrer Marke) Furcht, Lebensraum, Tages-Budget, die Kaskade samt dem Bestand und Folgen am ECHTEN Takt (gate:kreatur-takt).
"use strict";

// ── furcht (Ökologie K3, tetrapoda FURCHT_GESETZ): (A) je Ort und Rolle ein Tier allein — geschlagen, gefüttert, gebunden,
// zur Kontrolle, der Bär vor ruhiger, zorniger, friedlicher Aura — über den Speicherstand, dann geht der Spieler bis 8 m
// heran und steht 15 s: der Median des Abstands. (B) ein Rudel um einen Riss: sein Aufenthalt in dessen Zelle über 90 s,
// gegen den Gegenlauf ohne Feld-Furcht ──
async function lebenBuehnen(buehne, taeter, decke, r, s, A, pm, frei, land, tier, ruhig, ruhigSpieler, takt, quantil) {
    const dt = 1 / 60;
    const boden = (x, z) => r.getTerrainHeightAt(x, z) + 0.5;
    await buehne("furcht", async (restore) => {
        if (taeter === "furcht-gedaechtnis") decke("_kreaturFurchtErinnert", () => () => 0);
        if (taeter === "furcht-ort") decke("_kreaturFurchtOrt", () => (c, NAT, von, w) => w);
        if (taeter === "furcht-speicher")
            decke("_serializeCreature", (alt) => (c) => Object.assign(alt.call(r, c), { memory: [] }));
        if (taeter === "furcht-aura") {
            const F = A._furchtGesetz();
            A._furchtGesetzMemo = Object.freeze(Object.assign({}, F, { bedrohung: () => 0 }));
            restore.push(() => (A._furchtGesetzMemo = F));
        }
        const lauf = (n, e) => {
            for (let k = 0; k < n; k++) {
                ruhigSpieler(e);
                takt(dt);
            }
        };
        const zorn = { chaos: 0.9 };
        const rollen = {
            kontrolle: ["wesen"],
            geschlagen: ["wesen"],
            gefuettert: ["wesen"],
            gebunden: ["wesen"],
            baerRuhig: ["baer"],
            baerZornig: ["baer", zorn],
            baerFrieden: ["baer", zorn, "frieden"],
        };
        const erinnert = {};
        for (const [rolle, [seele, e, modus]] of Object.entries(rollen)) {
            const R = { abstand: [], naeher: [], erinnerungen: [] };
            r.setGameMode(modus || "pfad");
            for (let o = 0; o < 4; o++) {
                s.creatureAnimationTime = 100;
                r._creatureAiFrame = 0;
                const ort = frei(70 + Math.cos(o * 1.57) * 60, -40 + Math.sin(o * 1.57) * 60, 20) || land(70, -40);
                pm.set(ort.x + 3, boden(ort.x + 3, ort.z), ort.z);
                const c0 = tier(ort, seele, 1);
                ruhig(c0);
                if (rolle === "geschlagen") r.damageCreature(c0, 4, { source: "player", fromPos: pm.clone() });
                if (rolle === "gefuettert" && !r.activateCreatureConsumable(c0, "trank_lebenssaft").ok)
                    throw new Error("keine Gabe");
                pm.set(ort.x + 150, boden(ort.x + 150, ort.z), ort.z);
                lauf(600);
                const snap = JSON.parse(JSON.stringify(r._serializeCreature(c0)));
                r.removeCreature(c0);
                const c = r._restoreCreatureFromSnapshot(snap);
                ruhig(c);
                if (rolle === "gebunden") c.userData.bond = 1;
                R.erinnerungen.push((c.userData.memory || []).length);
                pm.set(c.position.x + 30, boden(c.position.x + 30, c.position.z), c.position.z);
                for (let k = 0, d = 30; k < 2400 && d > 8; k++) {
                    d = Math.hypot(c.position.x - pm.x, c.position.z - pm.z);
                    pm.x += ((c.position.x - pm.x) / d) * s.speed * dt;
                    pm.z += ((c.position.z - pm.z) / d) * s.speed * dt;
                    pm.y = boden(pm.x, pm.z);
                    lauf(1, e);
                }
                const d0 = Math.hypot(c.position.x - pm.x, c.position.z - pm.z);
                for (let k = 0; k < 900; k++) {
                    lauf(1, e);
                    R.abstand.push(Math.hypot(c.position.x - pm.x, c.position.z - pm.z));
                }
                R.naeher.push(d0 - Math.min(...R.abstand.slice(-900)));
                for (const k of [...s.creatures, ...s.leichname]) r.removeCreature(k);
            }
            erinnert[rolle] = {
                medianM: +quantil(R.abstand, 0.5).toFixed(2),
                naeherM: +quantil(R.naeher, 0.5).toFixed(2),
                erinnerungen: R.erinnerungen,
            };
        }
        r.setGameMode("pfad");
        const Z = A.LIFE_FIELD.cell;
        const zelle = (x, z, mx, mz) =>
            Math.floor(x / Z) === Math.floor(mx / Z) && Math.floor(z / Z) === Math.floor(mz / Z);
        const ort = { riss: [], gegenlauf: [] };
        for (const gegen of [false, true])
            for (let o = 0; o < 3; o++) {
                s.creatureAnimationTime = 100;
                r._creatureAiFrame = 0;
                s.emotionField = undefined;
                const f =
                    frei(-80 + Math.cos(o * 2.1 + 0.4) * 70, 60 + Math.sin(o * 2.1 + 0.4) * 70, 28) || land(-80, 60);
                const mx = (Math.floor(f.x / Z) + 0.5) * Z,
                    mz = (Math.floor(f.z / Z) + 0.5) * Z;
                pm.set(mx + 150, boden(mx + 150, mz), mz);
                const herde = [];
                for (let i = 0; i < 5; i++) {
                    const x = mx + Math.cos(i * 2.4) * 3 * Math.sqrt(i + 0.5),
                        z = mz + Math.sin(i * 2.4) * 3 * Math.sqrt(i + 0.5);
                    const c = tier({ x, y: boden(x, z), z }, "wesen", 1);
                    ruhig(c);
                    c.userData.wanderAnchor = { x: mx, z: mz };
                    herde.push(c);
                }
                r._kreaturVerbinden(herde);
                lauf(300);
                const opfer = tier({ x: mx, y: boden(mx, mz), z: mz }, "wesen", 1);
                r.damageCreature(opfer, 1e9, { source: "jagd" });
                if (!s.leichname.includes(opfer)) throw new Error("der Riss fällt nicht");
                if (gegen) s.emotionField = undefined; // der Gegenlauf: Feld-Furcht 0
                let drin = 0;
                for (let k = 0; k < 5400; k++) {
                    lauf(1);
                    for (const c of herde) if (zelle(c.position.x, c.position.z, mx, mz)) drin++;
                }
                ort[gegen ? "gegenlauf" : "riss"].push(+(drin / 5400 / herde.length).toFixed(3));
                for (const k of [...s.creatures, ...s.leichname]) r.removeCreature(k);
            }
        const mittel = (a) => +(a.reduce((p, q) => p + q, 0) / a.length).toFixed(3);
        return { erinnert, ort: { aufenthalt: mittel(ort.riss), gegenlauf: mittel(ort.gegenlauf) } };
    });
    // ── DER ZEITRAFFER (Ökologie K1/K2): `tickFaunaLifecycle` je 10 s Spiel-Zeit an EINEM Ort, ab Takt `ab` lebendig × ½ ──
    const zeitraffer = () => {
        if (taeter === "bestand-nahrung") decke("_kreaturNahrung", () => () => 0.5);
        if (taeter === "bestand-deckel" || taeter === "kaskade-riss")
            decke("_kreaturBestand", (alt) => (...a) => {
                const b = alt.apply(r, a);
                for (const g in b) Object.assign(b[g], taeter === "kaskade-riss" ? { riss: 0 } : { geburt: 1, tod: 0 });
                return b;
            });
        let halb = false;
        decke("worldFieldAt", (wfa) => (x, z) => {
            const f = wfa.call(r, x, z);
            return halb ? Object.assign({}, f, { lebendig: f.lebendig / 2 }) : f;
        });
        const tod = { n: 0, aeltester: 0, trauer: 0, journal: 0 };
        const gattung = (c) => A.TETRAPODA_SOUL_MAP[c.userData.soul];
        decke("_creatureNaturalDeath", (dies) => (c, grund) => {
            const aelteste = s.creatures.every(
                (o) => gattung(o) !== gattung(c) || !(o.userData.alterS > c.userData.alterS)
            );
            const o = dies.call(r, c, grund);
            const j = s.worldJournal.entries;
            if (grund === "hunger")
                Object.assign(tod, {
                    n: tod.n + 1,
                    aeltester: tod.aeltester + aelteste,
                    trauer: tod.trauer + (s.player.emotions.sorrow > 0),
                    journal: tod.journal + (j[j.length - 1].type === "loss"),
                });
            return o;
        });
        return (saat, takte, ab, eingriff) => {
            // die Saat setzt den Strom UND die netIds (die Größe eines Tiers folgt seiner netId, `_creatureBodySize`); die
            // Spiel-Zeit beginnt bei 0 (ihre Differenzen sind sonst je Boot andere Fließkomma-Zahlen)
            r._faunaStroeme = { seed: s.worldMeta.seed, rng: { fauna: r._streamRng("bestand-" + saat) } };
            [s._creatureNetSeq, s.spielZeit, s.faunaLifecycle] = [1e4 * saat, 0, { lastTick: 0 }];
            s.lifeField = undefined;
            const n = [];
            let kappe = 0;
            for (let k = 0; k < takte; k++) {
                halb = k >= ab;
                s.spielZeit += 10;
                ruhigSpieler();
                r.tickFaunaLifecycle();
                if (eingriff) eingriff(gattung, k);
                for (const c of s.leichname.slice()) r.removeCreature(c);
                // der Leerlauf zwischen den Takten (`_imLeerlauf` kommt im Zeitraffer nie): die Tod-Lage der Entfernten fällt
                r._todLageTick();
                // an der Kappe misst der Lauf nichts mehr (der Bestand ohne Tod wüchse je Takt quadratisch teurer)
                if (s.creatures.length >= s.maxCreatures && ++kappe) break;
                n.push(s.creatures.map(gattung));
            }
            for (const c of s.creatures.slice()) r.removeCreature(c);
            const mittel = (a, b, g) =>
                +(n.slice(a, b).reduce((p, je) => p + je.filter((x) => !g || x === g).length, 0) / (b - a)).toFixed(2);
            return { kappe, mittel, tod };
        };
    };
    // ── kaskade (Ökologie K1): je Saat acht Stunden, je Gattung die zweite gegen die achte (die erste besiedelt); gegen diesen
    // Grundlauf je Saat 6 h die Szenarien — die Wölfe entfernt, die Hirsche bejagt (je halbe Spielminute einer), das Leben
    // des Felds ab der ersten Stunde halbiert (Ökologie K2: Geburt und Hungertod folgen der Nahrung; bis heim-z29b die Probe
    // bestand an EINER Saat) und die Mutante „Fraß-Leser aus“ (der Fraß liest keinen Jungwuchs) ohne Wölfe. In der 6. Stunde
    // je Gattung der Bestand und der Jungwuchs: die Äsung des Reviers, wie die Kapazität des Rotwilds sie liest
    // (K ∝ Σ Lebensraum × Äsung) ──
    await buehne("kaskade", async () => {
        const lauf = zeitraffer();
        let frassAus = false;
        decke(
            "_kreaturFrass",
            (alt) =>
                (...a) =>
                    frassAus || alt.apply(r, a)
        );
        const weg = (art, n) => (g) =>
            s.creatures
                .filter((c) => g(c) === art)
                .slice(0, n)
                .forEach((c) => r.removeCreature(c));
        const L = {};
        for (const [name, eingriff] of Object.entries({
            grund: null,
            ohneWolf: weg("wolf"),
            bejagt: (g, k) => k % 3 || weg("deer", 1)(g),
            halb: null,
            mutante: weg("wolf"),
        })) {
            if ((frassAus = name === "mutante") && taeter) break;
            L[name] = [];
            for (let i = 1; i <= (taeter ? 4 : 8); i++) {
                let jung = 0;
                const l = lauf(i, name === "grund" ? 2880 : 2160, name === "halb" ? 360 : Infinity, (g, k) => {
                    if (eingriff) eingriff(g, k);
                    if (k >= 1800 && k < 2160) jung += r._kreaturBestand().deer.K / 360;
                });
                L[name].push(Object.assign(l, { jung }));
            }
        }
        // je Richtung der Effekt (das Mittel der Differenzen je Saat durch das Mittel des Grundlaufs) und sein Intervall
        // [kleinste, größte Differenz]: über 8 Saaten deckt es den Median mit 1 − 2 · 0,5⁸ = 99,2 % (die Ordnungs-Statistik)
        const m = (v) => v.reduce((p, q) => p + q, 0) / v.length;
        const richtung = (b, g, soll) => {
            const wert = (l) => (g === "jung" ? l.jung : l.mittel(1800, 2160, g));
            const g0 = m(L.grund.map(wert));
            const d = L[b].map((l, i) => +((wert(l) - wert(L.grund[i])) / g0).toFixed(3));
            const [effekt, lo, hi] = [+m(d).toFixed(3), Math.min(...d), Math.max(...d)];
            return {
                effekt,
                ki: [lo, hi],
                soll,
                haelt: soll > 0 ? lo > 0 && effekt >= soll : hi < 0 && effekt <= soll,
            };
        };
        const richtungen = {
            hirsche: richtung("ohneWolf", "deer", 0.3),
            jungwuchs: richtung("ohneWolf", "jung", -0.2),
            woelfe: richtung("bejagt", "wolf", 0),
            nahrung: richtung("halb", null, -0.3),
        };
        if (L.mutante) richtungen.mutante = richtung("mutante", "jung", -0.2);
        const G = Object.keys(A._lebensraumGesetz().L.gattung);
        return {
            saaten: L.grund.map((l) =>
                Object.fromEntries(G.map((g) => [g, [l.mittel(360, 720, g), l.mittel(2520, 2880, g)]]))
            ),
            kappe: Object.values(L)
                .flat()
                .reduce((p, l) => p + l.kappe, 0),
            richtungen,
            hungertod: L.grund[0].tod, // je Hungertod aller Läufe
        };
    });
    // ── folgen (Ökologie K5, der Parcours): „folge mir“, dann geht der Spieler 10 min mit W (`_stepFixedSim`) über Hang und
    // Wasser, um Wand und gedrehtes Haus, über den Sockel; Gegenlauf ohne die Geste ──
    await buehne("folgen", async (restore) => {
        const um = (name, fn) => decke(name, (alt) => fn(alt));
        if (taeter === "folgen")
            um(
                "_tickCreatureFollowPlayer",
                (alt) =>
                    (...a) =>
                        alt.apply(r, a).set(0, 0, 0)
            );
        if (taeter === "folgen-wand") um("_kreaturHuellenKontakt", () => () => {});
        if (taeter === "sockel") um("_kreaturAuflage", () => () => -Infinity);
        if (taeter === "gedreht-kontakt")
            um(
                "_resolveCapsuleVsAABB",
                (alt) => (b, pos, f, h, rad, st, k) => alt.call(r, b, pos, f, h, rad, st, b.obb ? null : k)
            );
        if (taeter === "gedreht-rahmen")
            um(
                "_boxAbstand2",
                (alt) => (b, x, z) => alt.call(r, { minX: b.minX, maxX: b.maxX, minZ: b.minZ, maxZ: b.maxZ }, x, z)
            );
        if (taeter === "hindernis")
            um("updateCreatures", (alt) => (dt) => {
                alt.call(r, dt);
                for (const { position: p } of s.creatures)
                    r._fieldRaycast(p.x, p.y + 0.5, p.z, p.x + 2, p.y + 0.5, p.z + 2);
            });
        if (taeter === "hindernis-leib")
            um("_kreaturHuellenKontakt", (alt) => (...a) => {
                const echt = r._kreaturLeib;
                r._kreaturLeib = (...b) => A.prototype._kreaturLeib.apply(r, b); // der Zwilling: dieselben Zahlen, nicht der Leser
                try {
                    return alt.apply(r, a);
                } finally {
                    r._kreaturLeib = echt;
                }
            });
        const n = { leib: 0, strahlen: 0, takt: 0, kontakt: 0, spielerWand: 0 };
        const H = [];
        um(
            "_kreaturLeib",
            (alt) =>
                (...a) => (n.kontakt && n.leib++, alt.apply(r, a))
        );
        um("_kreaturHuellenKontakt", (alt) => (c, ...a) => {
            const [x, z] = [c.position.x, c.position.z];
            n.kontakt++;
            try {
                return alt.call(r, c, ...a);
            } finally {
                n.kontakt--;
                if (c.position.x !== x || c.position.z !== z)
                    for (const h of H) if (Math.hypot(h.cx - x, h.cz - z) < 7) h.kontakt++;
            }
        });
        um(
            "_fieldRaycast",
            (alt) =>
                (...a) => (n.takt && n.strahlen++, alt.apply(r, a))
        );
        const WK = ["_wandKontaktAt", "_wandKontaktNx", "_wandKontaktNz"];
        um("updateCreatures", (alt) => (dt) => {
            const vor = WK.map((k) => s[k]);
            for (const k of WK) s[k] = NaN;
            n.takt++;
            try {
                return alt.call(r, dt);
            } finally {
                n.takt--;
                if (WK.some((k) => !Number.isNaN(s[k]))) n.spielerWand++;
                else WK.forEach((k, i) => (s[k] = vor[i]));
            }
        });
        r.setGameMode("pfad");
        const v = s.speed;
        const hang = (x, z) => {
            const h = (dx, dz) => r.getTerrainHeightAt(x + dx, z + dz);
            return (Math.atan(Math.hypot(h(1, 0) - h(-1, 0), h(0, 1) - h(0, -1)) / 2) * 180) / Math.PI;
        };
        const P = pm.clone();
        const [sx, sz] = [
            [1, 1],
            [1, -1],
            [-1, 1],
            [-1, -1],
        ].find(([a, b]) => [100, 200, 300].every((d) => r._landAt(P.x + a * d, P.z + b * d))) || [0, 0];
        if (!sx) return { fehler: "kein Land auf einer Diagonale bis 300 m" };
        const ziele = [];
        let [wx, wz] = [P.x, P.z];
        for (let i = 0; i < Math.ceil((v * 640) / 60); i++) {
            const [ux, uz] = i % 2 ? [0, sz] : [sx, 0];
            const art = i % 3 === 1 && ["wand", "haus", "sockel", "wand"][H.length];
            if (art) {
                const [mx, mz] = [wx + ux * 30, wz + uz * 30];
                H.push({ art, cx: mx, cz: mz, ux, kontakt: 0, drin: 0, quer: 0, vornMinM: Infinity, seite: 0 });
                if (art !== "sockel")
                    for (const [a, b] of [
                        [-3, 0],
                        [-3, 1],
                        [3, 1],
                        [3, 0],
                    ])
                        ziele.push([mx + ux * a + (ux ? 0 : 5.5) * b, mz + uz * a + (ux ? 5.5 : 0) * b]);
            }
            [wx, wz] = [wx + ux * 60, wz + uz * 60];
            ziele.push([wx, wz]);
        }
        // die Wand ragt überall 2,5 m, das Haus 34° gedreht, der Sockel 0,35 m über dem Boden
        const gebaut = H.map((h, i) => {
            const name = "_t_folgen_" + i;
            const g = (f, q = 0) => r.getTerrainHeightAt(h.cx + (h.ux ? q : 4 * f), h.cz + (h.ux ? 4 * f : q));
            const [lo, hi] = [
                Math.min(...[-1, -0.5, 0, 0.5, 1].map((f) => g(f))) - 0.2,
                Math.max(...[-1, 0, 1].map((f) => g(f))),
            ];
            const size =
                h.art === "sockel"
                    ? { x: 0.1, y: 0.1, z: 0.1 }
                    : { x: h.ux ? 0.8 : 8, y: hi - lo + 2.5, z: h.ux ? 8 : 0.8 };
            s.blueprints[name] = {
                name,
                parts: [{ shape: "box", material: "stein", position: { x: 0, y: size.y / 2, z: 0 }, size }],
            };
            restore.push(() => delete s.blueprints[name]);
            const y = h.art === "wand" ? lo : g(0) + 0.5;
            const e = r.spawnArchitecture(
                name,
                { x: h.cx, y, z: h.cz },
                { silent: true, rotationY: h.art === "haus" ? 0.6 : 0 }
            );
            const unten = Math.min(...[-0.5, 0, 0.5].flatMap((f) => [-2, 0, 2].map((q) => g(f, q)))) - 0.3 - g(0);
            const teil =
                h.art === "haus"
                    ? { c: [0, 0, 0], h: h.ux ? [0.4, 6, 4] : [4, 6, 0.4] }
                    : h.art === "sockel" && { c: [0, (unten + 0.35) / 2, 0], h: [2, (0.35 - unten) / 2, 2] };
            if (e && teil)
                r._hausHuelleSetzen(e, { stufe: 0, teile: [Object.assign({ art: "box", rolle: "fest" }, teil)] });
            const b = e && (e.blockerAABBs || []).find((q) => h.art !== "haus" || q.obb);
            const o =
                b &&
                (b.obb || {
                    cx: (b.minX + b.maxX) / 2,
                    cz: (b.minZ + b.maxZ) / 2,
                    c: 1,
                    s: 0,
                    hx: (b.maxX - b.minX) / 2,
                    hz: (b.maxZ - b.minZ) / 2,
                });
            Object.assign(h, { box: b, F: o });
            return e;
        });
        restore.push(() => gebaut.forEach((e) => e && r.removeArchitecture(e)));
        if (H.length < 4 || H.some((h) => !h.box))
            return { fehler: "ein Hindernis ohne Hülle (" + H.length + " gebaut)" };
        // steht der Spieler 1 s, lenkt er 1 s 60° zur Seite
        const gehen = (sek, je) => {
            pm.set(P.x, boden(P.x, P.z), P.z);
            if (s.playerVel) s.playerVel.setValue(0, 0, 0);
            const tasten = s.keys;
            s.keys = { w: true };
            const t0 = (s._simZeit || 0) + 1;
            let [zi, seite, aus, mark] = [0, 1, 0, [pm.x, pm.z]];
            try {
                for (let k = 0; k < sek * 60; k++) {
                    const [zx, zz] = ziele[Math.min(zi, ziele.length - 1)];
                    if (Math.hypot(zx - pm.x, zz - pm.z) < 1.5) zi++;
                    if (k % 60 === 59) {
                        if (!aus && Math.hypot(pm.x - mark[0], pm.z - mark[1]) < 0.3 * v) [aus, seite] = [60, -seite];
                        mark = [pm.x, pm.z];
                    }
                    s.yaw = Math.atan2(zx - pm.x, zz - pm.z) + (aus > 0 ? (seite * Math.PI) / 3 : 0);
                    if (aus > 0) aus--;
                    ruhigSpieler();
                    r._stepFixedSim(t0 + k * dt, dt);
                    r.updateCreatures(dt);
                    je(k);
                }
            } finally {
                s.keys = tasten;
            }
        };
        const hirsch = (gebunden) => {
            const [hx, hz] = [P.x - sx * 2.8, P.z - sz * 2.8];
            const c = tier({ x: hx, y: boden(hx, hz), z: hz }, "wesen", 1);
            ruhig(c);
            if (gebunden) r.dslRun(r.parseChatToDsl("folge mir").program, { source: "human" });
            return c;
        };
        const c = hirsch(true);
        if ((c.userData.task || {}).name !== "follow_player") return { fehler: "die Geste „folge mir“ bindet nicht" };
        const bond0 = c.userData.bond;
        const z = { proben: 0, aufgabe: 0, nassS: 0, steilS: 0 };
        const [abstand, leibVon, abstand2] = [[], A.prototype._kreaturLeib, A.prototype._boxAbstand2];
        n.strahlen = 0;
        gehen(600, (k) => {
            const p = c.position;
            const lb = leibVon.call(r, c);
            const [vx, vz] = [p.x + lb.fx * lb.halb, p.z + lb.fz * lb.halb];
            for (const h of H) {
                const [b, F] = [h.box, h.F];
                if (h.art === "sockel") {
                    const stufe = b.topY - r.getTerrainHeightAt(p.x, p.z);
                    if (abstand2.call(r, b, p.x, p.z) === 0 && stufe > 0.05 && stufe < A.PLAYER_STEP_UP) {
                        h.ueber = (h.ueber || 0) + 1;
                        const tief = b.topY - p.y;
                        if (tief > 0.05)
                            [h.imSockel, h.tiefMaxM] = [
                                (h.imSockel || 0) + 1,
                                +Math.max(h.tiefMaxM || 0, tief).toFixed(3),
                            ];
                    }
                    h.stufeM = +(b.topY - r.getTerrainHeightAt(h.cx, h.cz)).toFixed(2);
                    continue;
                }
                const lok = (x, y) => [(x - F.cx) * F.c - (y - F.cz) * F.s, (x - F.cx) * F.s + (y - F.cz) * F.c];
                const [a, q] = lok(p.x, p.z);
                if (Math.abs(a) < F.hx && Math.abs(q) < F.hz) h.drin++;
                const [lang, duenn] = F.hx > F.hz ? [Math.abs(a) < F.hx, q] : [Math.abs(q) < F.hz, a];
                if (h.seite && Math.sign(duenn) && Math.sign(duenn) !== h.seite && lang) h.quer++;
                h.seite = Math.sign(duenn) || h.seite;
                const [va, vq] = lok(vx, vz);
                const [oa, oq] = [Math.max(Math.abs(va) - F.hx, 0), Math.max(Math.abs(vq) - F.hz, 0)];
                const innen = Math.min(F.hx - Math.abs(va), F.hz - Math.abs(vq));
                h.vornMinM = Math.min(h.vornMinM, +(oa > 0 || oq > 0 ? Math.hypot(oa, oq) : -innen).toFixed(3));
            }
            if (k % 60 !== 59) return;
            z.proben++;
            abstand.push(Math.hypot(p.x - pm.x, p.z - pm.z));
            if ((c.userData.task || {}).name === "follow_player") z.aufgabe++;
            if (r._nassAt(p.x, p.z)) z.nassS++;
            if (hang(p.x, p.z) > 15) z.steilS++;
        });
        Object.assign(z, {
            abstand: {
                p50: +quantil(abstand, 0.5).toFixed(2),
                p95: +quantil(abstand, 0.95).toFixed(2),
                max: +Math.max(...abstand).toFixed(1),
            },
            bindung: [+bond0.toFixed(2), +c.userData.bond.toFixed(2)],
            hindernisse: H.map(({ art, kontakt, drin, quer, vornMinM, ueber, imSockel, tiefMaxM, stufeM }) =>
                art === "sockel"
                    ? { art, ueber: ueber || 0, imSockel: imSockel || 0, tiefMaxM: tiefMaxM || 0, stufeM }
                    : { art, kontakt, drin, quer, vornMinM }
            ),
            leibRufe: n.leib,
            strahlenJeTakt: +(n.strahlen / 36000).toFixed(3),
            spielerWand: n.spielerWand,
        });
        r.removeCreature(c);
        const u = hirsch(false);
        gehen(120, () => {});
        z.gegenlauf = { abstandM: +Math.hypot(u.position.x - pm.x, u.position.z - pm.z).toFixed(1) };
        return z;
    });
    // ── tagesbudget (Tiere K4, ETHOGRAMM_GESETZ · DURST_GESETZ): je Gattung drei Tiere ohne Verband am Ufer (15–30 m vom Fluss), im
    // frieden (ohne Jagd), der Spieler ruhig 90 m fern. Die Uhr des Spieler-Worts läuft 12 Spielstunden ein und misst 24: je Tier
    // und Takt die Tätigkeit, die es zeigt (Auftrag und Flucht sind wach), sein Lauf in der Ruhe, seine Trünke am Wasser; der
    // Gegenlauf „Durst aus“ (drei Hirsche, 10 Spielstunden) ──
    await buehne("tagesbudget", async (restore) => {
        const LG = A._lebensraumGesetz(),
            SW = A._verhaltenGesetz().stimmung.schwellen;
        // die Täter: kein Durst · der Ruhe-Pegel leer · die alte Uhr (Ruhe, solange die Sonne unter nachtSin steht, am Tag weidet,
        // wer weidet) · die Ruhe läuft
        const durstAus = () => decke("_kreaturDurstig", () => () => false);
        if (taeter === "durst") durstAus();
        if (taeter === "tagesbudget-ruhe")
            decke(
                "_kreaturTaetigkeit",
                (alt) =>
                    function (c) {
                        const t = alt.call(this, c);
                        c.userData._ruhe = 0;
                        return t;
                    }
            );
        if (taeter === "tagesbudget-sonne")
            decke(
                "_kreaturTaetigkeit",
                () =>
                    function (c) {
                        c.userData._gezeigt = null;
                        const nacht = this._sonnenRichtung().y < SW.nachtSin;
                        return (c.userData._taetigkeit = nacht
                            ? "ruhen"
                            : this._kreaturDiet(c) <= SW.weideDiet
                              ? "nahrung"
                              : "ziehen");
                    }
            );
        if (taeter === "nacht")
            decke(
                "updateCreatures",
                (alt) =>
                    function (dt) {
                        alt.call(this, dt);
                        for (const c of this.state.creatures) if (c.userData._gezeigt === "ruhen") c.position.x += 0.02;
                    }
            );
        let U = null;
        for (let k = 0; k < 441 && !U; k++) {
            const x = pm.x + ((k % 21) - 10) * 25,
                z = pm.z + (Math.floor(k / 21) - 10) * 25;
            const h = r._hydroDistAt(x, z),
                rand = h.dist - Math.max(1, h.halfW);
            if (rand > 15 && rand < 30 && r._landAt(x, z)) U = { x, z };
        }
        if (!U) throw new Error("kein Fluss im Umkreis von 250 m");
        r.setGameMode("frieden");
        const tag0 = s.timeOfDay;
        restore.push(() => r._uhrSetzen(tag0, "regler"));
        r._uhrSetzen(0.5, "regler");
        const takte = Math.round((0.1 / 24) * (s.dayLengthMinutes || A.DAY_LENGTH_DEFAULT_MINUTES) * 600);
        const z = { budget: {}, soll: {}, ruhe: [0, 0] };
        const tagLauf = (seelen, ein, mess, z) => {
            const tiere = seelen.flatMap((seele) =>
                [0, 1, 2].map((i) => {
                    const x = U.x + Math.cos(i * 2.1 + seele.length) * 6,
                        zz = U.z + Math.sin(i * 2.1 + seele.length) * 6;
                    const c = tier({ x, y: r.getTerrainHeightAt(x, zz) + 0.5, z: zz }, seele, 1);
                    ruhig(c);
                    return { c, g: A.TETRAPODA_SOUL_MAP[seele], x, z: zz, ruhK: 0, trunk: 0, nass: 0 };
                })
            );
            pm.set(U.x, r.getTerrainHeightAt(U.x, U.z + 90) + 0.5, U.z + 90);
            for (let i = 0; i < (ein + mess) * 10; i++) {
                r._uhrSetzen(((s.timeOfDay * 24 + 0.1) % 24) / 24, "regler");
                for (let k = 0; k < takte; k++) {
                    ruhigSpieler();
                    takt(0.1);
                    for (const t of tiere) {
                        const ud = t.c.userData,
                            p = t.c.position;
                        if (t.g0 !== undefined && ud._getrunken !== t.g0)
                            (t.trunk++, (t.nass += r._findNearestWaterPoint(p.x, p.z, 4) ? 1 : 0));
                        t.g0 = ud._getrunken;
                        const kat = (ud.task && ud.task.name === "drink") || !ud._gezeigt ? "ziehen" : ud._gezeigt;
                        t.ruhK = kat === "ruhen" ? t.ruhK + 1 : 0;
                        if (i >= ein * 10) {
                            const B = z.budget[t.g] || (z.budget[t.g] = { ruhen: 0, nahrung: 0, ziehen: 0 });
                            B[kat]++;
                            if (t.ruhK > 20)
                                (z.ruhe[0]++, (z.ruhe[1] += Math.hypot(p.x - t.x, p.z - t.z) > 0.01 ? 1 : 0));
                        }
                        [t.x, t.z] = [p.x, p.z];
                    }
                }
            }
            for (const t of tiere) r.removeCreature(t.c);
            return tiere;
        };
        const tiere = tagLauf(["wesen", "baer", "fuchs", "wolf"], ...(taeter ? [2, 12] : [12, 24]), z);
        for (const g in z.budget) {
            const B = z.budget[g],
                n = B.ruhen + B.nahrung + B.ziehen,
                G = LG.E.gattung[g];
            for (const k in B) B[k] = +(B[k] / n).toFixed(3);
            z.soll[g] = { ruhen: G.ruhen, nahrung: G.nahrung, ziehen: +(1 - G.ruhen - G.nahrung).toFixed(3) };
        }
        z.truenke = tiere.map((t) => t.trunk);
        z.amWasser = tiere.reduce((a, t) => a + t.nass, 0);
        durstAus();
        z.durstAus = tagLauf(["wesen"], 0, 10, { budget: {}, ruhe: [0, 0] }).reduce((a, t) => a + t.trunk, 0);
        return z;
    });
    // ── lebensraum (Tiere K4; die Geburt fern, außer Blick, in Gruppen): an neun Orten (Raster 300 m) je 25 Geburten — je Tier
    // Gattung, Boden-Klasse, Abstand, Blick, der Nächste der Gruppe, je Wurf der Bär am Fluss; die Gegenprobe in anderer Saat ──
    await buehne("lebensraum", async () => {
        if (taeter === "lebensraum")
            decke("_pickFaunaSoulAtPlayer", () => (x, z, rng) => A.CREATURE_SOUL_NAMES[Math.floor(rng() * 4)]);
        const alt = {
            geburt: () => ({ x: pm.x + 15, z: pm.z }),
            "geburt-einzeln": () => r._kreaturGeburtsOrt(r._faunaRng()),
        };
        if (alt[taeter])
            decke("_creatureNaturalBirth", () => () => {
                const o = alt[taeter]();
                return !!o && !!r.spawnCreatureAt(o.x, pm.y, o.z, "happy", "wesen");
            });
        const LG = A._lebensraumGesetz();
        const z = { n: 0, drin: 0, gattung: {}, klasse: {}, geburten: 0, gruppen: 0, journal: 0, minM: Infinity };
        Object.assign(z, {
            imBlick: 0,
            fensterMax: 0,
            fernMin: A.CREATURE_SPAWN_FAR_MIN,
            baer: { fluss: [0, 0], sonst: [0, 0] },
        });
        const p0 = pm.clone();
        for (let i = 0; i < (taeter ? 3 : 9); i++) {
            pm.set(p0.x + ((i % 3) - 1) * 300, p0.y, p0.z + (Math.floor(i / 3) - 1) * 300);
            kamera(1, 0);
            for (let k = 0; k < 25; k++) {
                const vor = s.creatures.length;
                r._creatureNaturalBirth();
                const neu = s.creatures.slice(vor);
                if (!neu.length) continue;
                z.geburten++;
                if (neu.length > 1) z.gruppen++;
                const j = s.worldJournal.entries[s.worldJournal.entries.length - 1];
                if (j && j.type === "growth" && j.ctx && j.ctx.gruppe === neu.length) z.journal++;
                const paar = (2 * r._kreaturRaum(neu[0])) / neu[0].userData.bodySize;
                for (const c of neu) {
                    const g = A.TETRAPODA_SOUL_MAP[c.userData.soul],
                        kl = r._bodenKlasseAt(c.position.x, c.position.z);
                    z.n++;
                    if (LG.lebensraum(g, kl, LG.L) > 0) z.drin++;
                    z.gattung[g] = (z.gattung[g] || 0) + 1;
                    z.klasse[kl] = (z.klasse[kl] || 0) + 1;
                    // DER BÄR AM FLUSS (Staffel 2): je Wurf [Würfe, Bären] am Fluss und abseits
                    const B = c === neu[0] && z.baer[kl === "fluss" ? "fluss" : "sonst"];
                    if (B) (B[0]++, (B[1] += g === "bear" ? 1 : 0));
                    z.minM = Math.min(z.minM, +Math.hypot(c.position.x - pm.x, c.position.z - pm.z).toFixed(1));
                    if (imBlick(c.position.x, c.position.y + 0.5, c.position.z)) z.imBlick++;
                    const nn = Math.min(
                        ...neu
                            .filter((o) => o !== c)
                            .map((o) => Math.hypot(c.position.x - o.position.x, c.position.z - o.position.z) / paar)
                    );
                    if (nn < Infinity) z.fensterMax = +Math.max(z.fensterMax, nn).toFixed(2);
                }
                for (const c of neu) r.removeCreature(c);
            }
        }
        return Object.assign(z, {
            anteil: z.n ? +(z.drin / z.n).toFixed(3) : null,
            saat: s.worldMeta.seed,
            fensterRaum: A._verhaltenGesetz().herde.fensterRaum,
        });
    });
}
// das Soll der Lebens-Proben (`soll(bedingung, grund)` aus dem Urteil der Kreatur-Proben)
function lebenUrteil(name, z, soll) {
    if (name === "kaskade") {
        soll(
            z.kappe === 0,
            `der Bestand bricht an die Kosten-Kappe aus: ${z.kappe} Takte an ihr (Soll 0 — die Nahrung begrenzt, nie der Deckel)`
        );
        const T = z.hungertod;
        soll(
            T.n >= 1 && T.aeltester === T.n && T.trauer === T.n && T.journal === T.n,
            `der Hungertod nimmt nicht das Älteste, trauert nicht oder schreibt kein Journal: ${T.n} Tode, ${T.aeltester} die Ältesten, ${T.trauer} betrauert, ${T.journal} im Journal`
        );
        const paare = z.saaten.flatMap((je, i) =>
            Object.entries(je).map(([g, [a, e]]) => ({ wo: `Saat ${i + 1} ${g} ${a} → ${e}`, a, e }))
        );
        const da = paare.filter((p) => p.a >= 1).length;
        const bruch = paare.filter((p) => (p.a >= 1 ? !(p.e >= p.a / 3 && p.e <= 3 * p.a) : p.e > 3));
        soll(
            z.saaten.length >= 8 && da >= 16 && !bruch.length,
            `der Bestand bricht aus oder stirbt aus: ${bruch.map((p) => p.wo).join(" · ") || da + " Bestände in " + z.saaten.length + " Saaten"} (Soll je Gattung in [⅓×, 3×], 8 Saaten)`
        );
        for (const [k, q] of Object.entries(z.richtungen))
            soll(
                q.haelt === (k !== "mutante"),
                `die Kaskade ${k}: ${q.effekt} [${q.ki}] gegen den Grundlauf (Soll ${q.soll}${k === "mutante" ? ", ohne Fraß-Leser ROT" : ""})`
            );
    }
    if (name === "folgen") {
        soll(z.bindung[0] > 0 && z.bindung[1] > z.bindung[0], `die Geste bindet nicht: bond ${z.bindung}`);
        soll(
            z.proben >= 600 && z.aufgabe === z.proben && z.abstand.p95 <= 10,
            `das gebundene Tier folgt nicht: ${z.aufgabe} von ${z.proben} s in der Aufgabe, Abstand p95 ${z.abstand.p95} m, max ${z.abstand.max} m (Soll p95 ≤ 10 m über 600 s)`
        );
        const W = z.hindernisse.filter((h) => h.art !== "sockel");
        const bruch = W.filter((h) => !(h.kontakt > 0 && h.drin === 0 && h.quer === 0 && h.vornMinM > 0));
        soll(
            W.length >= 3 && !bruch.length,
            `die Hindernisse halten nicht: ${bruch.map((h) => `${h.art === "haus" ? "in der gedrehten Wand" : "in der Wand"} ${h.drin} Takte, ${h.quer}× quer hindurch, die Schnauze ${-h.vornMinM} m, ${h.kontakt} Schübe`).join(" · ")}`
        );
        const S = z.hindernisse.find((h) => h.art === "sockel") || { ueber: 0 };
        soll(S.ueber >= 30, `der Hirsch kommt nicht über den Sockel (${S.ueber} Takte, vakuös)`);
        soll(
            !S.imSockel,
            `das Tier steht im Sockel: ${S.imSockel} von ${S.ueber} Takten über ihm, bis ${S.tiefMaxM} m tief (Oberkante ${S.stufeM} m über dem Boden)`
        );
        soll(z.strahlenJeTakt === 0, `${z.strahlenJeTakt} Feld-Strahlen je Takt im Kreatur-Takt (Lehre 25)`);
        soll(z.leibRufe > 0, `der Hüllen-Kontakt liest keinen benannten Leib (_kreaturLeib: ${z.leibRufe} Rufe)`);
        soll(
            z.spielerWand === 0,
            `${z.spielerWand} Takte des Tiers schrieben die Parkour-Wand des Spielers (state._wandKontakt*)`
        );
        soll(
            z.gegenlauf.abstandM >= 30,
            `das ungebundene Tier folgt auch (${z.gegenlauf.abstandM} m nach 2 min, vakuös)`
        );
    }
    if (name === "tagesbudget") {
        // DAS ETHOGRAMM (±20 % je Tätigkeit; was die Gattung nicht tut, tut sie nie)
        for (const [g, S] of Object.entries(z.soll))
            for (const [k, v] of Object.entries(S)) {
                const ist = z.budget[g][k];
                soll(
                    v > 0 ? Math.abs(ist / v - 1) <= 0.2 : ist <= 0.01,
                    `das Tages-Budget verfehlt das Ethogramm (${g} ${k}): ${ist} gegen ${v} (±20 %)`
                );
            }
        soll(Object.keys(z.soll).length >= 4, `nur ${Object.keys(z.soll).length} Gattungen im Tag (vakuös)`);
        soll(
            z.ruhe[0] >= 1000 && z.ruhe[1] < 0.03 * z.ruhe[0],
            `${((100 * z.ruhe[1]) / z.ruhe[0]).toFixed(1)} % bewegt während ruhen (${z.ruhe[0]} Takte)`
        );
        soll(
            z.truenke.length >= 12 &&
                z.truenke.every((n) => n >= 1) &&
                z.amWasser === z.truenke.reduce((a, b) => a + b, 0),
            `kein Tier trinkt aus Durst: Trünke ${z.truenke}, ${z.amWasser} am Wasser`
        );
        soll(z.durstAus === 0, `das Trinken folgt dem Durst nicht: ohne Durst ${z.durstAus} Trünke`);
    }
    if (name === "lebensraum") {
        soll(z.minM >= 0.99 * z.fernMin, `Geburt ${z.minM} m vor dem Spieler (Soll ≥ ${z.fernMin} m)`);
        soll(z.imBlick === 0, `${z.imBlick} Geburten im Blick`);
        soll(
            z.gruppen >= 10 && z.gattung.wolf && z.gattung.deer,
            `keine Gruppe: ${z.gruppen} von ${z.geburten} Würfen`
        );
        soll(z.fensterMax <= z.fensterRaum, `ein Tier ${z.fensterMax} Paar-Räume vom Nächsten seiner Gruppe`);
        soll(z.journal === z.geburten, `${z.geburten - z.journal} Würfe ohne growth-Eintrag ihrer Gruppe`);
    }
    if (name === "lebensraum")
        for (const [wo, L] of [
            ["", z],
            ["Gegenprobe ", z.gegen || { fehler: "die Gegenprobe in einer Welt anderer Saat lief nicht" }],
        ]) {
            if (L.fehler) soll(false, wo + L.fehler);
            else
                soll(
                    L.n >= 150 &&
                        Object.keys(L.gattung).length >= 3 &&
                        L.anteil >= 0.9 &&
                        L.saat !== (wo ? z.saat : null),
                    `${wo}Geburten außerhalb des Lebensraums: ${L.drin} von ${L.n} (Soll ≥ 0,9; ${JSON.stringify(L.gattung)}, Saat ${L.saat})`
                );
        }
    if (name === "lebensraum") {
        const gb = (z.gegen && z.gegen.baer) || { fluss: [0, 0], sonst: [0, 0] };
        const [F, N] = ["fluss", "sonst"].map((k) => [z.baer[k][0] + gb[k][0], z.baer[k][1] + gb[k][1]]);
        soll(
            F[0] >= 10 && N[0] >= 10 && F[1] > 0 && F[1] / F[0] >= (2 * N[1]) / N[0],
            `der Bär sucht den Fluss nicht: am Fluss ${F[1]}/${F[0]} Würfe ein Bär, abseits ${N[1]}/${N[0]} (Soll ≥ 2×)`
        );
    }
    if (name !== "furcht") return;
    const { kontrolle: K, geschlagen: G, gefuettert: F, gebunden: B, baerRuhig, baerZornig, baerFrieden } = z.erinnert;
    soll(
        [...G.erinnerungen, ...F.erinnerungen].every((n) => n >= 1),
        `das Gedächtnis reist nicht über den Speicherstand: geschlagen ${G.erinnerungen}, gefüttert ${F.erinnerungen}`
    );
    soll(K.medianM >= 5, `der Kontroll-Hirsch hält keinen Abstand (Median ${K.medianM} m, vakuös)`);
    soll(
        G.medianM >= 2 * K.medianM,
        `das Wesen vergisst, wer es schlug: ${G.medianM} m gegen ${K.medianM} m der Kontrolle (Soll ≥ 2×)`
    );
    soll(
        F.medianM <= 0.5 * K.medianM && F.naeherM >= 2,
        `das gefütterte Wesen nähert sich nicht: ${F.medianM} m (Soll ≤ ½×), selbst ${F.naeherM} m näher (Soll ≥ 2 m)`
    );
    soll(B.medianM <= 0.8 * K.medianM, `die Bindung macht nicht mutig: ${B.medianM} m`);
    soll(
        baerZornig.medianM >= 2 * baerRuhig.medianM && baerFrieden.medianM <= 0.5 * baerZornig.medianM,
        `die Aura treibt die Furcht nicht: der Bär ruhig ${baerRuhig.medianM} m, zornig ${baerZornig.medianM} m, im frieden ${baerFrieden.medianM} m`
    );
    const O = z.ort;
    soll(O.gegenlauf >= 0.2, `das Rudel steht im Gegenlauf nicht am Riss-Ort (${O.gegenlauf}, vakuös)`);
    soll(
        O.aufenthalt <= 0.5 * O.gegenlauf,
        `die Herde meidet den Riss nicht: Aufenthalt ${O.aufenthalt} gegen ${O.gegenlauf} ohne Feld-Furcht (Soll −50 %)`
    );
}
const lebenQuelle = lebenBuehnen.toString();
module.exports = {
    BUEHNEN: `await (${lebenQuelle})(buehne, taeter, decke, r, s, A, pm, frei, land, tier, ruhig, ruhigSpieler, takt, quantil);`,
    PROBEN: ["furcht", "lebensraum", "tagesbudget", "kaskade", "folgen"],
    TAETER: {
        tagesbudget: [
            ["durst", /kein Tier trinkt aus Durst/],
            ["tagesbudget-ruhe", /verfehlt das Ethogramm \(\w+ ruhen\)/],
            ["tagesbudget-sonne", /verfehlt das Ethogramm/],
            ["nacht", /bewegt während ruhen/],
        ],
        kaskade: [
            ["kaskade-riss", /die Kaskade hirsche/],
            ["bestand-nahrung", /die Kaskade nahrung/],
            ["bestand-deckel", /Kosten-Kappe/],
        ],
        folgen: [
            ["folgen", /das gebundene Tier folgt nicht/],
            ["folgen-wand", /die Hindernisse halten nicht/],
            ["hindernis", /Feld-Strahlen/],
            ["hindernis-leib", /benannten Leib/],
            ["sockel", /steht im Sockel/],
            ["gedreht-kontakt", /Parkour-Wand des Spielers/],
            ["gedreht-rahmen", /gedrehten Wand/],
        ],
        lebensraum: [
            [
                "lebensraum",
                /Geburten außerhalb des Lebensraums[\s\S]*Gegenprobe Geburten außerhalb[\s\S]*der Bär sucht den Fluss nicht/,
            ],
            ["geburt", /vor dem Spieler/],
            ["geburt-einzeln", /keine Gruppe/],
        ],
        furcht: [
            ["furcht-gedaechtnis", /vergisst, wer es schlug[\s\S]*nähert sich nicht/],
            ["furcht-ort", /meidet den Riss nicht/],
            ["furcht-speicher", /reist nicht über den Speicherstand/],
            ["furcht-aura", /die Aura treibt die Furcht nicht/],
        ],
    },
    urteil: lebenUrteil,
};
if (require.main !== module) return;
const path = require("path");
const root = path.resolve(__dirname, "..");

const { pruefer, urteilEnde } = require("./lib/welt-boot.cjs");
const { errs, check } = pruefer();

// ── Kern laden (Namensraum-Muster: self/globalThis) ──
global.self = global;
require(path.join(root, "tetrapoda-core.js"));
const core = global.__tetrapodaCore;

const V = (core && core.VERHALTEN) || null;

// ── die Seele in sich: die Aktionen jeder Stimmung prüft gate:studio-vertrag (§B6+), hier der Takt alle=[min,max] ──
if (V) {
    check(
        "je Stimmung alle=[min,max] (min ≤ max)",
        Object.entries(V.stimmung).every(([k, z]) => k === "schwellen" || (z.alle && z.alle[0] <= z.alle[1]))
    );
    // die Felder der Haltung sind die des Kerns (MOTION, je Stimmung dieselben) — keine Abschrift
    const bekannt = new Set(Object.keys(core.MOTION.idle));
    const fremd = [];
    for (const name in V.aktionen) {
        const p = V.aktionen[name].profil;
        if (!p) continue;
        for (const k in p) if (!bekannt.has(k)) fremd.push(name + ":" + k);
    }
    check("Aktions-Profile nutzen nur bekannte MOTION-Felder", fremd.length === 0, fremd.join(","));
    // (die Blöcke des Buchs prüft der EINE Leser _verhaltenGesetz beim Boot, die Rezepte der Umschlag: gate:studio-vertrag)
    // Die Größen-Bänder sind lückenlos aufsteigend (die letzte Zeile fängt den Rest).
    const gr = Array.isArray(V.groessen) ? V.groessen : [];
    let grOk = gr.length >= 2;
    for (let i = 1; i < gr.length; i++) if (!(gr[i].bis > gr[i - 1].bis)) grOk = false;
    check("groessen-Bänder strikt aufsteigend (bis-Schwellen)", grOk);
}

urteilEnde(
    errs.length,
    `\n❌ ROT — ${errs.length} Verletzung(en).`,
    "\n✅ GRÜN — DIE KREATUR-SEELE IST GESCHLOSSEN: jedes Aktions-Profil zeigt auf ein Feld der Haltung."
);
