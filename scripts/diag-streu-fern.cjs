// diag-streu-fern.cjs — DIE FERNFORM DER KLEIN-STREU KOMMT AUS DEM BUDGET (npm run gate:streu-fern).
//
// Studio-Vertrag B2c: jede Art trägt `PORTAL_RENDER_CONFIG.lod.budget[kind].fernform` ("gesetz" | "boden" | "karte") —
// was sie jenseits der EINEN Nah-Grenze des Wirts ist (`AnazhRealm.ANALOG_NAH_M`, 64 m; diesseits trägt das Studio-Mesh,
// auch auf dem Fern-Wunsch). Der EINE Zellen-Chokepoint
// `_scatterMaterializeCell` liest sie über `_streuFernBahn` VOR jedem Mesh-Zug: eine Nicht-Baum-Zelle jenseits der
// Grenze fragt nie ein geklemmtes L0 an. "gesetz" = Platz im Welt-March (oder `wartet`: slots [], keine Instanz-Bahn),
// "boden" = Datensatz ohne Geometrie (die Boden-Funktion trägt), "karte" = die Studio-Karte.
//
// Boot mit Foundry-ON und Null-Renderer (die Form-Entscheidung fällt CPU-seitig). Die Gesetz-Bahn ist headless zu
// (Lehre 16) — die Linse öffnet die Backend-Wand `_weltMarchGezeichnet` (die Kapsel-Liste ist CPU-Daten), damit die
// Plätze WIRKLICH belegt werden und D die echte Füllung misst. Die Echt-GPU-Zahl kommt aus `werkbank zaehlen`.
//
//   A KONSUM   die fernform-Zeilen liegen live auf dem Host (tree/shrub/grass karte · flower/rock gesetz); der
//              Flip `rock.fernform = "boden"` baut eine Region neu und ihre Fels-Zellen jenseits der Grenze tragen
//              form "boden" — zurück auf "gesetz" tragen sie "gesetz". Das Datum ändert die Welt, kein Zwilling fährt.
//   B ABSENZ   keine lebende Instanz einer Gesetz-/Boden-Art (`fscatter:<art>:<g>:<stufe>`) steht jenseits der
//              Nah-Grenze + 8 m Totband; ein Treffer nennt Gruppe und Distanz.
//   C FORM     jenseits Grenze + Totband trägt jede Nicht-Baum-Zelle mit Fern-Wunsch ihre Budget-Form ("gesetz"/"boden"
//              ohne Slots); DIESSEITS der Grenze trägt keine Zelle eine Fernform (das Studio-Mesh trägt); keine
//              litter-Zelle (die Schicht fiel final).
//   D WAND     im eingeschwungenen Ring (Gesetz-Bahn offen) ist die Kapsel-Liste nicht erschöpft und keine Gesetz-Zelle
//              wartet — Füllstand beim Namen (Cursor / Kapazität).
//   E TICK     die Wiederholung einer wartenden Zelle legt keine Instanz-Slots an (kein Duplikat-Zug je Durchlauf).
//   F PASSUNG  die Geröll-Fernform passt aus den UNVERSCHMOLZENEN Steinen der Studio-Gestalt: 6 Fuß-Steine statt
//              einer liegenden Haufen-Kapsel.
//   G BAHNWECHSEL  der Spieler tritt an einen fernen Gesetz-Fels: der EINE Bahnwechsel des LOD-Ticks tauscht jede
//              Fernform-Zelle diesseits der Grenze auf ihr Studio-Mesh (mit Instanzen); zurück an der Mess-Wiese zieht
//              sie jenseits des Totbands wieder ins Gesetz.
//   H VOR DEM BUCH  kommt das Buch nach dem Ring (im Browser steht der Ring nach ~1 s, das Buch nach 5–8 s), liest
//              kein Deko-Takt das Budget, bevor es dockt: eine zweite Seite hält die Buch-Nachricht zurück, der echte
//              Spiel-Takt (`_gameLoopTick` → Deko-Job) läuft, bis die Nah-Wiese 8× kalt getaktet hat — die Loop-Grenze
//              fängt 0 Fehler; nach dem Buch legt die Nah-Wiese ihre 4 Studio-Vorlagen, wieder ohne Fehler. Jeder
//              gefangene Fehler trägt seine Täter (die ersten Stamm-Methoden des Stacks). SELBSTTEST (sonst wäre das Grün vakuös): (1) eine injizierte `fscatter:geroell:3:0`-Instanz bei 200 m macht B rot
//   mit Namen; (2) die ECHTE Erschöpfung (Bump-Cursor an der Kapazität, keine freien Segmente — der echte Spawn läuft)
//   lässt die Zellen `wartet` stehen — 0 L0-Instanzen, die Warn-Flagge fällt im Allokator, kein Fit läuft im Tick —
//   und D wird rot; (3) ohne `budget.flower.fernform` bricht der Host-Leser fail-closed (KERN-PFLICHT); (4) die alte
//   Lese-Reihenfolge (ein Deko-Leser fragt das Budget vor dem Buch) macht H rot und nennt `_foundryBudgetZeile <
//   _tickNahStreu`.
//
//   node scripts/diag-streu-fern.cjs        (Port: STREU_FERN_PORT)
"use strict";
const { WELT_ORTE_INSTALL } = require("./lib/welt-orte.cjs");
const { statikServer, hauptLauf, nullSeite, pruefer, wandEnde } = require("./lib/welt-boot.cjs");

const PORT = Number(process.env.STREU_FERN_PORT || 4586);
const server = statikServer();

const { errs, check } = pruefer();

hauptLauf(async () => {
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 600000 });
    await page.evaluateOnNewDocument(WELT_ORTE_INSTALL); // der Messort aus spec/profiband/haushalt.json (`__messWiese`)
    await server.zeige(page, 60000);

    const out = await page.evaluate(async () => {
        const res = {};
        await window.__weltDa();
        const AR = r.constructor;
        const f = r._ensureAssetFoundry();
        await window.__weltDa(() => f && f.ready && f.recipes && AR._studioRenderConfig && AR._studioRenderConfig.lod);
        const cfg = AR._studioRenderConfig;
        const B = cfg && cfg.lod && cfg.lod.budget;
        res.buch = !!B;
        if (!B) return res;
        // ── A1: die fernform-Zeilen live auf dem Host ──
        res.fern = {};
        for (const k of ["tree", "shrub", "grass", "flower", "rock"]) res.fern[k] = B[k] ? B[k].fernform : undefined;

        // Die Gesetz-Bahn öffnen (Linsen-Naht: der Null-Renderer zeichnet den Welt-March nie, seine Kapsel-Liste ist
        // CPU-Daten) — die Plätze werden wirklich belegt, D misst die echte Füllung.
        r._weltMarchGezeichnet = () => true;
        const N = AR.ANALOG_NAH_M;
        const TOT = 8; // das Totband des LOD-Ticks (Mesh → Fernform erst 8 m hinter der Grenze)
        res.grenze = N;

        // Die Mess-Wiese (der Messort des Haushalts, dieselbe Stelle wie werkbank umstellen --ort wiese).
        const pm = r.state.playerMesh.position;
        const [MX, MZ] = window.__messWiese;
        pm.set(MX, r._voxelSurfaceY(MX, MZ) + 1.8, MZ);
        const map = r._ensureScatterRegionMap();
        const zellen = () => {
            let n = 0;
            for (const reg of map.values()) n += reg.cells ? reg.cells.length : 0;
            return n;
        };
        // die Streu steht: jede Region in Reichweite (`_streuWartet`, auch eine fehlende) und der Karte (`_streuRegionWartet`),
        // der Takt der Streu wie im Spiel (`waldPlan` vor `scatterDeco`; ohne den Wald kommt die Zusage ihrer Bäume nie)
        const liste = [];
        try {
            for (let ruhig = 0, letzt = -1, weiter = window.__deckel("die Streu-Zellen", 3000, false); ruhig < 20 && weiter(); ) {
                r._tickWaldPlan(Infinity);
                r._tickScatterStreaming(pm);
                const n = zellen();
                liste.length = 0;
                r._streuWartet(pm, liste);
                for (const k of map.keys()) if (r._streuRegionWartet(k)) liste.push(`${k} ${r._streuRegionWartet(k)}`);
                ruhig = n === letzt && n > 0 && !liste.length ? ruhig + 1 : 0;
                letzt = n;
                await sleep(40);
            }
        } catch (e) {
            throw new Error(`${e.message} — es wartet: ${liste.slice(0, 8).join(" · ")}`);
        }
        res.zellen = zellen();
        const NICHT_BAUM = new Set(["under", "litter", "rock"]);
        const istKarte = (p) => {
            try {
                return r._foundryFernForm(p) === "karte";
            } catch {
                return false;
            }
        };
        const dZ = (c) => Math.hypot(c.x - pm.x, c.z - pm.z);
        const wartend = () => {
            let n = 0;
            for (const reg of map.values()) for (const c of reg.cells || []) if (c.wartet) n++;
            return n;
        };
        // Einschwingen der Gesetz-Bahn: der LOD-Tick wiederholt wartende Zellen (Fit-Takt 16/s), bis keine mehr wartet.
        {
            let vor = -1,
                gleich = 0;
            for (const weiter = window.__deckel("die wartende Streu", 1200, false); weiter(); ) {
                r._tickScatterLod(pm, 64, 4000);
                const w = wartend();
                if (w === 0) break;
                gleich = w === vor ? gleich + 1 : 0;
                vor = w;
                if (gleich >= 60) break;
                await sleep(50);
            }
        }

        // ── B: Absenz-Zensus über die lebenden Instanz-Gruppen ──
        const dGrenze = N + TOT;
        res.dGrenze = dGrenze;
        const absenz = () => {
            const treffer = [];
            let n = 0;
            const groups = r.state.archInstanceGroups;
            if (!groups) return { n, treffer };
            for (const [key, g] of groups) {
                const m = /^fscatter:([^:#]+):(\d+):(\d)#/.exec(key);
                if (!m || r._foundryPresetIsTree(m[1]) || istKarte(m[1])) continue;
                if (!g.mesh || !g.mesh.instanceMatrix) continue;
                // Die Gruppe ist dicht (`_archGroupFree` verdichtet): jeder Slot in [0, count) lebt.
                const a = g.mesh.instanceMatrix.array;
                for (let s = 0; s < g.mesh.count; s++) {
                    const o = s * 16;
                    const d = Math.hypot(a[o + 12] - pm.x, a[o + 14] - pm.z);
                    if (d > dGrenze) {
                        n++;
                        if (treffer.length < 4) treffer.push(`${key.split("#")[0]} @ ${d.toFixed(0)} m`);
                    }
                }
            }
            return { n, treffer };
        };
        res.b = absenz();

        // ── C: die Form je Nicht-Baum-Zelle — jenseits Grenze + Totband die Budget-Form, diesseits nie eine Fernform ──
        const formZensus = () => {
            const z = {
                gesetz: 0,
                boden: 0,
                wartet: 0,
                ohneForm: 0,
                slotsBeiForm: 0,
                litter: 0,
                nahMesh: 0,
                nahFern: 0,
                falsch: [],
            };
            for (const reg of map.values()) {
                for (const c of reg.cells || []) {
                    if (c.layer === "litter") z.litter++;
                    if (!NICHT_BAUM.has(c.layer)) continue;
                    const preset = r._foundryPresetFor(c.species);
                    if (!preset) continue;
                    const d = dZ(c);
                    const fernForm = c.form === "gesetz" || c.form === "boden";
                    if (d < N) {
                        if (fernForm) {
                            z.nahFern++;
                            if (z.falsch.length < 3) z.falsch.push(`${c.species} ${c.form} in ${d.toFixed(0)} m`);
                        } else if (c.lod >= 2) z.nahMesh++;
                        continue;
                    }
                    if (!(c.lod >= 2) || d < dGrenze) continue;
                    let soll;
                    try {
                        soll = r._foundryFernForm(preset);
                    } catch {
                        soll = "BRUCH";
                    }
                    if (soll === "karte") continue;
                    if (!c.form) {
                        z.ohneForm++;
                        if (z.falsch.length < 3) z.falsch.push(`${c.species} ohne form`);
                        continue;
                    }
                    if (c.form !== soll) {
                        if (z.falsch.length < 3)
                            z.falsch.push(`${c.species}: ${c.form} ≠ ${soll} in ${d.toFixed(0)} m`);
                        continue;
                    }
                    z[c.form]++;
                    if (c.wartet) z.wartet++;
                    if (Array.isArray(c.slots) && c.slots.length) z.slotsBeiForm++;
                }
            }
            return z;
        };
        res.c = formZensus();
        {
            const wm = r.state.weltMarch;
            res.d = {
                voll: r._weltKapselnVollWarn === true || !!(wm && wm.kapselVoll),
                cursor: wm ? wm.kapselCursor : -1,
                kapazitaet: AR.WELT_MARCH.kapseln,
                plaetze: wm ? wm.gesetzPlaetze : -1,
                bloecke: wm ? wm.gesetzBloecke : -1,
                wartet: wartend(),
            };
        }

        // ── G: DER EINE BAHNWECHSEL — der Spieler tritt an einen fernen Gesetz-Fels: der LOD-Tick tauscht jede Gesetz-/
        //    Boden-Zelle diesseits der Grenze auf ihr Studio-Mesh (mit Instanzen, kein Loch); zurück an der Mess-Wiese
        //    zieht sie jenseits des Totbands wieder ins Gesetz — dieselbe Grenze wie der Zellen-Chokepoint ──
        const g = {};
        {
            const heim = { x: pm.x, y: pm.y, z: pm.z };
            let ziel = null;
            for (const reg of map.values())
                for (const c of reg.cells || [])
                    if (!ziel && c.layer === "rock" && c.form === "gesetz" && dZ(c) > 120 && dZ(c) < 220) ziel = c;
            if (ziel) {
                g.zielD = +dZ(ziel).toFixed(0);
                const nahe = () => {
                    const o = { fern: 0, mesh: 0, ohneSlots: 0 };
                    for (const reg of map.values())
                        for (const c of reg.cells || []) {
                            if (!NICHT_BAUM.has(c.layer) || dZ(c) >= N) continue;
                            const p = r._foundryPresetFor(c.species);
                            if (!p || istKarte(p)) continue;
                            if (c.form === "gesetz" || c.form === "boden") o.fern++;
                            else {
                                o.mesh++;
                                if (!Array.isArray(c.slots) || !c.slots.length) o.ohneSlots++;
                            }
                        }
                    return o;
                };
                pm.set(ziel.x + 3, r._voxelSurfaceY(ziel.x + 3, ziel.z) + 1.8, ziel.z);
                for (const weiter = window.__deckel("die Streu am Ziel", 900, false); weiter(); ) {
                    r._tickScatterLod(pm, 64, 4000);
                    const n = nahe();
                    if (n.fern === 0 && n.mesh > 0 && n.ohneSlots === 0) break;
                    await sleep(100);
                }
                g.hin = nahe();
                const umZiel = () => {
                    const o = { gesetz: 0, mesh: 0 };
                    for (const reg of map.values())
                        for (const c of reg.cells || []) {
                            if (!NICHT_BAUM.has(c.layer)) continue;
                            if (Math.hypot(c.x - ziel.x, c.z - ziel.z) > 30) continue;
                            const p = r._foundryPresetFor(c.species);
                            if (!p || istKarte(p)) continue;
                            if (c.form === "gesetz" || c.form === "boden") o.gesetz++;
                            else o.mesh++;
                        }
                    return o;
                };
                // zurück wartet die Probe auf den GANZEN Wechsel: die Scheibe um das Ziel UND jede Instanz jenseits des
                // Totbands (an der Mess-Wiese −278/−1038 lag eine Mesh-Zelle 30–64 m vom Ziel, die Probe brach nach der
                // Scheibe ab und zählte sie in B)
                pm.set(heim.x, heim.y, heim.z);
                for (const weiter = window.__deckel("die Absenz nach der Rückkehr", 900, false); weiter(); ) {
                    r._tickScatterLod(pm, 64, 4000);
                    if (umZiel().mesh === 0 && absenz().n === 0) break;
                    await sleep(100);
                }
                g.zurueck = umZiel();
                const bz = absenz();
                g.bNachZurueck = bz.n;
                g.bTreffer = bz.treffer;
            }
        }
        res.g = g;

        // Eine Region mit Fels-Zellen auf der Fernstufe jenseits der Grenze (Flip-Ziel).
        const felsFern = (reg) =>
            (reg && Array.isArray(reg.cells) ? reg.cells : []).filter(
                (c) => c.layer === "rock" && c.lod >= 2 && dZ(c) >= N
            );
        let flipKey = null,
            flipBest = 0;
        for (const [k, reg] of map) {
            const n = felsFern(reg).length;
            if (n > flipBest) [flipBest, flipKey] = [n, k];
        }
        res.flipKey = flipKey;
        const neuBau = (k) => {
            const reg = map.get(k);
            const rx = reg.regX,
                rz = reg.regZ;
            r._disposeScatterRegion(k);
            return r._scatterRegion(rx, rz, pm);
        };
        const felsFormen = (reg) => {
            const s = { n: 0, formen: {}, slots: 0 };
            for (const c of felsFern(reg)) {
                s.n++;
                s.formen[c.form] = (s.formen[c.form] || 0) + 1;
                if (Array.isArray(c.slots)) s.slots += c.slots.length;
            }
            return s;
        };
        // ── A2: der Flip (Konsum, nicht Existenz) ──
        if (flipKey && B.rock) {
            const alt = B.rock.fernform;
            try {
                B.rock.fernform = "boden";
                res.flipBoden = felsFormen(neuBau(flipKey) || {});
            } catch (e) {
                res.flipErr = String((e && e.message) || e);
            } finally {
                B.rock.fernform = alt;
            }
            try {
                res.flipZurueck = felsFormen(neuBau(flipKey) || {});
            } catch (e) {
                res.flipErr = String((e && e.message) || e);
            }
        }

        // ── F: die Geröll-Passung aus den unverschmolzenen Steinen ──
        const fit = {};
        try {
            let satz = null;
            for (const weiter = window.__deckel("der Gesetz-Fit des Gerölls", 600, false); weiter(); ) {
                satz = r._streuGesetzFit("geroell", 7);
                if (satz && satz.length) break;
                await sleep(100);
            }
            fit.n = satz ? satz.length : 0;
            let groesste = 0;
            for (const d of satz || []) {
                const ausdehnung = d.h
                    ? 2 * Math.max(d.h.x, d.h.y, d.h.z)
                    : d.a && d.b
                      ? Math.hypot(d.b.x - d.a.x, d.b.y - d.a.y, d.b.z - d.a.z) + 2 * d.r
                      : 0;
                groesste = Math.max(groesste, ausdehnung);
            }
            fit.groessteM = +groesste.toFixed(2);
            // die Quelle: unverschmolzen trägt der Haufen mehr Teile, als der Satz übernimmt
            const bf = r._foundryFlattenFor({ seed: 7 }, "geroell", 1);
            fit.teile =
                bf && bf.leaves && bf.leaves[0] && bf.leaves[0]._srcGroup ? bf.leaves[0]._srcGroup.children.length : 0;
            fit.leaves = bf && bf.leaves ? bf.leaves.length : 0;
        } catch (e) {
            fit.err = String((e && e.message) || e);
        }
        res.f = fit;

        // ── SELBSTTEST 1: eine injizierte Geröll-L0-Instanz bei 200 m macht B rot ──
        const st1 = {};
        try {
            let flat = null;
            for (const weiter = window.__deckel("das Flat des Gerölls", 600, false); weiter(); ) {
                flat = r._foundryFlattenFor({ seed: 7 }, "geroell", 0);
                if (flat && flat.instanceable && flat.leaves && flat.leaves.length) break;
                await sleep(100);
            }
            if (flat && flat.leaves) {
                const vor = absenz().n;
                const slots = r._scatterInstanceAdd(
                    "fscatter:geroell:3:0",
                    pm.x + 200,
                    0,
                    pm.z,
                    0,
                    1,
                    null,
                    Math.floor((pm.x + 200) / AR.SCATTER.regionM) + "," + Math.floor(pm.z / AR.SCATTER.regionM),
                    flat
                );
                const mit = absenz();
                st1.feuert = mit.n > vor && mit.treffer.some((t) => t.startsWith("fscatter:geroell:3:0"));
                st1.treffer = mit.treffer[0] || "";
                r._scatterFreeSlots(slots);
                st1.zurueck = absenz().n === vor;
            }
        } catch (e) {
            st1.err = String((e && e.message) || e);
        }
        res.st1 = st1;

        // ── SELBSTTEST 2 + E: die ECHTE Erschöpfung — der Bump-Cursor steht an der Kapazität, keine freien Segmente,
        //    der echte Spawn läuft (kein Stub): die Warn-Flagge fällt im Allokator, die Zellen warten ohne Geometrie,
        //    und die Wiederholung im Tick rechnet keinen Fit und legt keine Instanz an ──
        const st2 = {};
        const wm = r.state.weltMarch;
        if (flipKey && wm) {
            const add0 = r._scatterInstanceAdd;
            const fit0 = r._streuGesetzFit;
            let zuege = 0,
                fits = 0;
            const cursor0 = wm.kapselCursor;
            const segs0 = wm.freiKapselSeg;
            const plaetze0 = new Map();
            try {
                const reg0 = map.get(flipKey);
                const rx = reg0.regX,
                    rz = reg0.regZ;
                r._disposeScatterRegion(flipKey); // ihre Plätze fallen frei (Segmente in die alte Freiliste)
                // ERSCHÖPFT ist die Liste erst, wenn keine der drei Quellen mehr trägt: der Bump-Cursor, die freien Segmente
                // UND die freien Plätze der stehenden Gesetz-Blöcke — ein Spawn füllt zuerst den Block seiner Kachel
                // (`_streuGesetzSpawn`), auch wenn die Region ihre Kacheln mit Nachbarn teilt.
                for (const bloecke of wm.gesetzKacheln.values())
                    for (const b of bloecke) {
                        plaetze0.set(b, b.freiPlaetze);
                        b.freiPlaetze = [];
                    }
                wm.freiKapselSeg = new Map();
                wm.kapselCursor = AR.WELT_MARCH.kapseln;
                wm.kapselVoll = false;
                r._weltKapselnVollWarn = false;
                r._weltBakeHunger = Infinity;
                r._weltBakeFenster = undefined; // ein frisches Fit-Takt-Fenster: der echte Allokator wird erreicht
                r._scatterInstanceAdd = function (name) {
                    const m = /^fscatter:([^:]+):/.exec(String(name));
                    if (m && !r._foundryPresetIsTree(m[1]) && !istKarte(m[1])) zuege++;
                    return add0.apply(this, arguments);
                };
                r._streuGesetzFit = function () {
                    fits++;
                    return fit0.apply(this, arguments);
                };
                const reg = r._scatterRegion(rx, rz, pm) || {};
                let wartet = 0,
                    gesetzZellen = 0;
                for (const c of reg.cells || [])
                    if (NICHT_BAUM.has(c.layer) && c.lod >= 2 && c.form === "gesetz") {
                        gesetzZellen++;
                        if (c.wartet && Array.isArray(c.slots) && !c.slots.length && !c.feld) wartet++;
                    }
                st2.gesetzZellen = gesetzZellen;
                st2.wartet = wartet;
                st2.l0 = absenz().n;
                st2.wandRot = r._weltKapselnVollWarn === true && wm.kapselVoll === true;
                st2.bauZuege = zuege;
                // E: die Wiederholung im Tick — 40 Durchläufe, kein Instanz-Zug für Gesetz-/Boden-Arten, kein Fit
                const zVor = zuege,
                    fVor = fits;
                for (let i = 0; i < 40; i++) r._tickScatterLod(pm, 8, 800);
                st2.tickZuege = zuege - zVor;
                st2.tickFits = fits - fVor;
            } catch (e) {
                st2.err = String((e && e.message) || e);
            } finally {
                delete r._scatterInstanceAdd;
                delete r._streuGesetzFit;
                for (const [n, l] of wm.freiKapselSeg) {
                    const alt = segs0.get(n) || [];
                    segs0.set(n, alt.concat(l));
                }
                wm.freiKapselSeg = segs0;
                // die freien Plätze der Blöcke zurück (ein Block, der in der Erschöpfung fiel, kehrt nicht zurück)
                for (const [b, frei] of plaetze0) b.freiPlaetze = frei.concat(b.freiPlaetze);
                wm.kapselCursor = cursor0;
                wm.kapselVoll = false;
                r._weltKapselnVollWarn = false;
            }
            try {
                neuBau(flipKey);
            } catch {}
        }
        res.st2 = st2;

        // ── SELBSTTEST 3: ohne budget.flower.fernform bricht der Leser fail-closed ──
        const st3 = {};
        if (B.flower) {
            const alt = B.flower.fernform;
            try {
                delete B.flower.fernform;
                try {
                    r._foundryFernForm("blume");
                    st3.bruch = false;
                } catch (e) {
                    st3.bruch = /KERN-PFLICHT/.test(String(e && e.message));
                    st3.meldung = String(e && e.message).slice(0, 120);
                }
            } finally {
                B.flower.fernform = alt;
            }
        }
        res.st3 = st3;
        res.bNachher = absenz();
        delete r._weltMarchGezeichnet;
        return res;
    });

    console.log(
        "=== STREU-FERN — die Fernform der Klein-Streu kommt aus dem Budget (B2c `fernform`), jenseits der EINEN Nah-Grenze ==="
    );
    check(
        "Studio-Buch (lod.budget) auf dem Host",
        out.buch,
        `zellen=${out.zellen} · Nah-Grenze ${out.grenze} m`
    );
    const F = out.fern || {};
    check(
        "A KONSUM: fernform je Art live (tree/shrub/grass karte · flower/rock gesetz)",
        F.tree === "karte" &&
            F.shrub === "karte" &&
            F.flower === "gesetz" &&
            F.rock === "gesetz" &&
            F.grass === "karte",
        F
    );
    const fb = out.flipBoden || {},
        fz = out.flipZurueck || {};
    check(
        'A KONSUM: Flip rock.fernform="boden" → die neu gebaute Region trägt jenseits der Grenze form boden (ohne Slots), zurück → gesetz',
        fb.n > 0 && fb.formen && fb.formen.boden === fb.n && fb.slots === 0 && fz.formen && fz.formen.gesetz === fz.n,
        out.flipErr || `Region ${out.flipKey}: boden ${JSON.stringify(fb.formen)} · zurück ${JSON.stringify(fz.formen)}`
    );
    const b = out.b || { n: -1, treffer: [] };
    check(
        `B ABSENZ: keine Gesetz-/Boden-Art als Instanz jenseits Nah-Grenze + Totband (${out.dGrenze} m)`,
        b.n === 0,
        `${b.n} Instanzen${b.treffer.length ? ": " + b.treffer.join(" · ") : ""}`
    );
    const c = out.c || {};
    check(
        "C FORM: jenseits der Grenze trägt jede Nicht-Baum-Fern-Zelle ihre Budget-Form (ohne Slots), diesseits keine eine Fernform, keine litter-Zelle",
        c.ohneForm === 0 &&
            c.slotsBeiForm === 0 &&
            c.litter === 0 &&
            c.nahFern === 0 &&
            (c.falsch || []).length === 0 &&
            c.gesetz > 0,
        `gesetz ${c.gesetz} (wartet ${c.wartet}) · boden ${c.boden} · diesseits Mesh auf Fern-Wunsch ${c.nahMesh} · diesseits Fernform ${c.nahFern} · ohne Form ${c.ohneForm} · litter ${c.litter}${c.falsch && c.falsch.length ? " · " + c.falsch.join(" · ") : ""}`
    );
    const gg = out.g || {};
    const gh = gg.hin || {},
        gz = gg.zurueck || {};
    check(
        "G BAHNWECHSEL: am fernen Gesetz-Fels trägt jede Zelle < 64 m ihr Studio-Mesh (mit Instanzen), zurück an der Mess-Wiese wieder das Gesetz",
        gg.zielD > 0 &&
            gh.fern === 0 &&
            gh.mesh > 0 &&
            gh.ohneSlots === 0 &&
            gz.mesh === 0 &&
            gz.gesetz > 0 &&
            gg.bNachZurueck === 0,
        `Ziel ${gg.zielD} m · hin: Mesh ${gh.mesh} (ohne Instanz ${gh.ohneSlots}) · Fernform ${gh.fern} · zurück um das Ziel: Gesetz ${gz.gesetz} · Mesh ${gz.mesh} · B danach ${gg.bNachZurueck}${gg.bTreffer && gg.bTreffer.length ? " (" + gg.bTreffer.join(", ") + ")" : ""}`
    );
    const d = out.d || {};
    check(
        "D WAND: im eingeschwungenen Ring ist die Kapsel-Liste nicht erschöpft und keine Gesetz-Zelle wartet",
        d.voll === false && d.wartet === 0 && d.plaetze > 0,
        `Kapseln ${d.cursor}/${d.kapazitaet} · Gesetz-Plätze ${d.plaetze} in ${d.bloecke} Blöcken · wartend ${d.wartet}`
    );
    const st2 = out.st2 || {};
    check(
        "E TICK: die Wiederholung wartender Zellen legt keine Instanz-Slots an und rechnet keinen Fit (40 Durchläufe, Liste voll)",
        st2.tickZuege === 0 && st2.tickFits === 0,
        st2.err || `Züge im Tick ${st2.tickZuege} · Fits im Tick ${st2.tickFits}`
    );
    const ft = out.f || {};
    check(
        "F PASSUNG: Geröll fern = die 6 größten Fuß-Steine (unverschmolzen), kein Haufen-Primitiv",
        ft.n === 6 && ft.teile > 6 && ft.groessteM > 0 && ft.groessteM < 2,
        ft.err ||
            `${ft.n} Primitive aus ${ft.teile} Steinen (verschmolzen ${ft.leaves} Leaf), größtes ${ft.groessteM} m`
    );
    const st1 = out.st1 || {};
    check(
        "SELBSTTEST 1: eine injizierte fscatter:geroell:3:0-Instanz bei 200 m macht B rot (mit Namen)",
        st1.feuert === true && st1.zurueck === true,
        st1.err || st1.treffer
    );
    check(
        "SELBSTTEST 2: die ECHTE Erschöpfung (Cursor an der Kapazität, echter Spawn) → die Zellen warten (0 L0), der Allokator setzt die Wand",
        st2.gesetzZellen > 0 &&
            st2.wartet === st2.gesetzZellen &&
            st2.l0 === 0 &&
            st2.bauZuege === 0 &&
            st2.wandRot === true,
        st2.err ||
            `wartet ${st2.wartet}/${st2.gesetzZellen} · L0 ${st2.l0} · Bau-Züge ${st2.bauZuege} · Wand ${st2.wandRot}`
    );
    const st3 = out.st3 || {};
    check(
        "SELBSTTEST 3: ohne budget.flower.fernform bricht der Host-Leser fail-closed",
        st3.bruch === true,
        st3.meldung || ""
    );
    check(
        "nach den Selbsttests: B wieder leer",
        out.bNachher && out.bNachher.n === 0,
        out.bNachher ? `${out.bNachher.n}` : "—"
    );

    // ── H — VOR DEM BUCH: eine eigene Seite, deren Buch-Nachricht zurückgehalten wird (die Welt oben bleibt unberührt) ──
    const hPage = await browser.newPage();
    await hPage.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        // Der Halt sitzt, sobald die Instanz steht — lange vor dem Buch (der Worker rechnet es Sekunden). Kam es doch
        // davor, meldet die Linse `zuSpaet` statt still grün.
        const H = (window.__buchHalt = { nachrichten: [], frei: false, zuSpaet: false, los: null });
        const iv = setInterval(() => {
            if (!r) return;
            clearInterval(iv);
            if (r._foundry && r._foundry.recipes) {
                H.zuSpaet = true;
                return;
            }
            const roh = r._foundryIngestBook;
            r._foundryIngestBook = function (m) {
                if (H.frei) return roh.call(this, m);
                H.nachrichten.push(m);
            };
            H.los = () => {
                H.frei = true;
                delete r._foundryIngestBook;
                for (const m of H.nachrichten.splice(0)) roh.call(r, m);
            };
        }, 5);
    });
    await server.zeige(hPage, 60000);
    const h = await hPage.evaluate(async (KALT) => {
        const H = window.__buchHalt;
        await window.__weltDa(() => H.zuSpaet || H.los);
        const res = { zuSpaet: H.zuSpaet, halt: !!H.los };
        if (!H.los) return res;
        r._ensureAssetFoundry();
        // Die Linse: jeder Fehler, den die Loop-Grenze fängt, mit seinen Tätern (die ersten Stamm-Methoden des Stacks).
        const fehler = [];
        r._loopErrorBoundary = function (e) {
            const zeilen = String((e && e.stack) || e).split("\n");
            const taeter = zeilen
                .map((z) => (z.match(/^\s*at (?:[\w$]+\.)?(_\w+) /) || [])[1])
                .filter((n) => n && n !== "_kernPflichtBruch")
                .slice(0, 2);
            fehler.push({ msg: zeilen[0].slice(0, 110), taeter: taeter.join(" < ") });
            return Object.getPrototypeOf(r)._loopErrorBoundary.call(this, e);
        };
        // Die Deko-Takte zählen: die Nah-Wiese ist der erste Buch-Leser des Deko-Jobs.
        let kalt = 0,
            warm = 0;
        r._tickNahWiese = function (dl) {
            if (r._foundry && r._foundry.recipes) warm++;
            else kalt++;
            return Object.getPrototypeOf(r)._tickNahWiese.call(this, dl);
        };
        let tMs = performance.now();
        const takt = async () => {
            for (let i = 0; i < 4; i++) r._gameLoopTick((tMs += 1000 / 60));
            await sleep(10);
        };
        for (const weiter = window.__deckel("der kalte Takt ohne Buch", 12000); kalt < KALT && weiter(); ) await takt();
        res.kalt = kalt;
        res.buchKalt = !(r._foundry && r._foundry.recipes);
        res.fehlerKalt = fehler.splice(0);
        // SELBSTTEST 4: die alte Lese-Reihenfolge — ein Deko-Leser fragt das Budget vor dem Buch; H muss ihn nennen.
        r._tickNahStreu = function (dl) {
            this._foundryBudgetZeile("gras", 1);
            return Object.getPrototypeOf(r)._tickNahStreu.call(this, dl);
        };
        const k0 = kalt;
        for (const weiter = window.__deckel("drei Takte der Selbstprobe", 6000); kalt < k0 + 3 && weiter(); ) await takt();
        delete r._tickNahStreu;
        res.selbst = fehler.splice(0);
        // Das Buch dockt: die Nah-Wiese liest jetzt ihr Budget und legt die vier Studio-Vorlagen (2 Gestalten × L1/L2).
        H.los();
        for (const weiter = window.__deckel("die vier Vorlagen der Nah-Wiese", 12000); weiter(); ) {
            await takt();
            if (warm > 0 && st.nahWiese && st.nahWiese.vorlagen.size >= 4) break;
        }
        res.warm = warm;
        res.vorlagen = st.nahWiese ? st.nahWiese.vorlagen.size : -1;
        res.fehlerWarm = fehler.splice(0);
        delete r._tickNahWiese;
        delete r._loopErrorBoundary;
        return res;
    }, 8);
    await hPage.close();
    const hTaeter = (liste) => {
        const namen = (liste || []).map((x) => `${x.taeter} (${x.msg.replace(/^Error: /, "").slice(0, 60)})`);
        return [...new Set(namen)].join(" · ");
    };
    check(
        "H VOR DEM BUCH: der Deko-Takt liest kein Budget, bevor das Buch dockt (Buch zurückgehalten, echter Spiel-Takt)",
        h.halt && !h.zuSpaet && h.buchKalt && h.kalt >= 8 && h.fehlerKalt.length === 0,
        h.halt
            ? `${h.kalt} kalte Deko-Takte · Loop-Fehler ${h.fehlerKalt.length}${h.fehlerKalt.length ? " — Täter: " + hTaeter(h.fehlerKalt) : ""}`
            : h.zuSpaet
              ? "das Buch kam vor dem Halt"
              : "kein Halt (die Instanz stand nicht)"
    );
    check(
        "H NACH DEM BUCH: die Nah-Wiese legt ihre 4 Studio-Vorlagen (das Budget gelesen, gras wirft nicht), ohne Loop-Fehler",
        h.warm > 0 && h.vorlagen >= 4 && (h.fehlerWarm || []).length === 0,
        `${h.warm} warme Takte · Vorlagen ${h.vorlagen} · Loop-Fehler ${(h.fehlerWarm || []).length}${(h.fehlerWarm || []).length ? " — Täter: " + hTaeter(h.fehlerWarm) : ""}`
    );
    const hs = h.selbst || [];
    check(
        "SELBSTTEST 4: die alte Lese-Reihenfolge (ein Deko-Leser fragt das Budget vor dem Buch) macht H rot und nennt den Täter",
        hs.length > 0 &&
            hs.every(
                (x) => x.taeter === "_foundryBudgetZeile < _tickNahStreu" && /phyto:lod\.budget \(gras\)/.test(x.msg)
            ),
        `${hs.length} Loop-Fehler — ${hTaeter(hs)}`
    );

    await browser.close();
    server.close();
    wandEnde(errs, "die Klein-Streu liest ihre Fernform aus dem Studio-Budget jenseits der EINEN Nah-Grenze: dort kein L0-Mesh, diesseits kein Kapsel-Satz, wartende Zellen ohne Instanz-Zug und ohne Fit, die echte Erschöpfung wird rot statt still L0.");
});
