#!/usr/bin/env node
// gate:pruefbuehne — WO DIE WILDNIS NICHT TRÄGT, WIRFT DAS FELD NICHTS.
//
// Die Prüfbühne (spec/pruefbuehne/welt.json) trägt statt der Wildnis analytische Terme; auf ihr steht nur, was ihre Saat
// und die Linse setzen. Das Feld handelt dort nie: kein Wald, keine Streu, kein ungesetztes Tier — und kein Wurf des
// Nexus (sein Pool `dslComposeAtomic` baut alle 24 s an `far_player`). Diese Linse nennt jeden Wurf beim Namen.
//
// Je Welt (Standard = die Wildnis als FELD-KONTROLLE; Bühne, importiert wie im Spiel) misst sie:
//   (1) DIE WÜRFE: jede Ort-Op der Welt-Akte (Tier, Baum, Studio-Werk, Insel, UFO, Dorf, Tempel, Wasserfall, Bauplan,
//       Fraktal, Füll-Kugel) mit der Quelle des Feldes — `nexus` und `rule:nexus` — und ihr Zuwachs an Welt-Substanz
//       (Bauten, Tiere, Inseln, UFOs, Pflanz-Schlange, Dorf-Zellen, Edits). Bühne: 0 je Op; Wildnis: > 0 (die Linse sieht).
//   (2) DER AKT: dieselbe Op als Mensch (`human`) setzt auch auf der Bühne (das Prädikat hält das Feld, nie die Hand).
//   (3) DER NEXUS-TAKT, getrieben: N Evolutionen (`generateEvolution` + `_loopNexusUpdate`, Wirk-Kraft voll — im Spiel alle
//       24 s eine) und ein Takt, in dem seine Regeln feuern. Bühne: Zuwachs 0.
//   (4) DER ABSENZ-ZENSUS in 300 m nach dem Takt: fremde Bauten, Streu-Zellen, Nah-Streu, Tiere, Inseln, Dorf-Zellen,
//       Pflanz-Schlange, Flüsse — auf der Bühne 0.
//   (5) DIE S4-PROBE: die Hindernis-Station (`s4-hindernisse` in spec/pruefbuehne/stationen.json — Würfel, Säule, Mauer,
//       Gasse, Hausrumpf 45°, Engpass) steht, gesät über die Snapshot-Tür: je Körper die Blocker-Boxen ≤ 0,1 m an der
//       Spec und im Blocker-Netz. Der Selbsttest rückt die Mauer 0,5 m — die Probe nennt sie, und nur sie.
//   (6) DIE S0-PROBE: die Feuerstelle, die der Mensch im Atrium setzt, leuchtet nachts — mit und ohne Klang
//       ≥ 1 Licht ≤ 10 m (ein Platz des Licht-Pools), Bestrahlung in 2 m ≥ 2× die Nacht; die Laterne eines Plans nachts an,
//       mittags aus; die Fenster-Glut nachts an, mittags aus; JEDER beleuchtete Stoff trägt den Pool (Bauer im Stamm und
//       Stoffe der Szene), EIN Punktlicht-Gesetz, kein Punktlicht der Szene. Der Selbsttest nimmt der Feuerstelle ihr
//       Datum, dem Plan den Leser und schmuggelt einen Stoff und einen Bauer ohne Pool ein — die Probe nennt jeden.
//   (7) DAS BILD DER S0-PROBE (`--licht`, K11 + K11b): echter Renderer, Ausgabe-Pfad — der Feuerkreis aus 2 m (Luma) und
//       der Farbton des Lichts des Feuers auf dem Boden 1–3 m (28–45° netto, die Farbtemperatur des Gesetzes) bei der
//       Sättigung, die das Auge der Nacht sieht (≤ 0,75 brutto, K66); `--bild` legt die Bilder aus 2 m, aus 6 m und der
//       Figur ab. Selbsttest: der Pool leer, das Feuer bis K11b (Glut-Palette, nacht 12), das Auge des Tages. DIE NACHT
//       (D3-2, `S0_NACHT`): derselbe Boden ohne das Feuer um Mitternacht ist lesbar (Luma, abgesoffen). Selbsttest: die
//       Kamera der Nacht 2 Stufen tiefer (seit licht.K1 trägt sie die Nacht, nicht das Sternen-Licht). Dazu DER HIMMEL FOLGT DEM SPRUNG (K10, `himmelProbe`): nach Mittag und Mitternacht über
//       den Pfad des Spielers trägt die Umgebung den Himmel des Orts (`_himmelsBestrahlung`). Selbsttest: der Maler taub.
//       Die Dämmerung und die Belichtung über den Tag urteilt die Tag-Achse auf der Karte (gate:tag-achse:echt).
//
//   node scripts/diag-pruefbuehne.cjs [--json datei] [--evolutionen 60] [--wurzel dir]
//                                                  (`--wurzel` = der Baum eines anderen Stands: vorher ↔ nachher)
//   node scripts/diag-pruefbuehne.cjs --selftest   zusätzlich: auf der Bühne trägt die Wildnis zum Schein überall
//                                                  (`_wildnisTraegt` → true) — die Würfe MÜSSEN rot werden, beim Namen
// Port: PRUEFBUEHNE_PORT (Default 4394). Exit 1 bei einem Wurf auf der Bühne, einem gehaltenen Akt, einer blinden
// Kontrolle, einem Page-Error oder einem roten Selbsttest.
"use strict";
const { statikServer, starteBrowser, hauptLauf, argOpt: opt, pngDatei, booteWelt } = require("./lib/welt-boot.cjs");
const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const SELBSTTEST = argv.includes("--selftest");
const JSON_AUS = opt("--json", null);
const EVOLUTIONEN = Math.max(1, Number(opt("--evolutionen", 60)) || 60);
const PORT = Number(process.env.PRUEFBUEHNE_PORT) || 4394;
const BUEHNE_DATEI = path.resolve(__dirname, "..", "spec", "pruefbuehne", "welt.json");
const STATIONEN = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, "..", "spec", "pruefbuehne", "stationen.json"), "utf8")
).stationen;
const S4 = STATIONEN.find((st) => st.id === "s4-hindernisse");
const S0 = STATIONEN.find((st) => st.id === "s0-atrium");
const S4_SCHEIN = { bauplan: "pruef_mauer", dx: 0.5 }; // der Selbsttest: die Mauer rückt 0,5 m

const server = statikServer({ keinCache: true });

// Die Würfe: jede Ort-Op der Welt-Akte in ihrer kanonischen Form (die Orte, die der Nexus selbst wählt).
const WUERFE = [
    ["spawn_creature", ["near_player", 20], 3, "happy"],
    ["spawn_tree", ["far_player", 40, 90], 3],
    ["spawn_studio", "eiche", ["far_player", 40, 90], 2],
    ["spawn_island", ["far_player", 60, 120]],
    ["spawn_ufo", ["near_player", 30]],
    ["spawn_village", ["far_player", 180, 380]],
    ["spawn_temple", ["far_player", 180, 380]],
    ["spawn_waterfall", ["far_player", 180, 380]],
    ["spawn_blueprint", "baum_eiche", ["near_player", 25]],
    ["spawn_fractal", ["far_player", 220, 400], "temple", 1, 0.5],
];

// (5) DIE S4-PROBE: die Hindernis-Station steht, wie ihre Spec sagt (spec/pruefbuehne/stationen.json `s4-hindernisse`) —
// je Körper sein Bau (der Bauplan der Saat) in der Station, je Teil seine Blocker-Box (die Wahrheit, die Leib-Löser, Kapsel,
// Wagen-Hülle und Strahl lesen) ≤ 0,1 m an der Spec: Welt-AABB, die Sohle auf dem Boden-Gesetz (`_terrainMacroSurfaceY`),
// gedreht die OBB mit ihrer Gier; und das Blocker-Netz (`_blockerNahe`, der EINE Weg jedes Kontakt-Lesers) kennt ihn.
// `schein` (der Selbsttest): ein Körper rückt zum Schein ab — die Probe MUSS ihn beim Namen nennen.
const S4_TOLERANZ = 0.1;
async function s4Probe(page, station, schein) {
    return page.evaluate(
        (st, tol, schein) => {
            const s = r.state;
            const out = { station: st.id, koerper: [], befunde: [] };
            const inStation = (e) =>
                e &&
                e.position &&
                Math.abs(e.position.x - st.x) <= st.eben / 2 &&
                Math.abs(e.position.z - st.z) <= st.eben / 2;
            const bauten = (s.architectures || []).filter(inStation);
            if (schein) {
                const e = bauten.find((b) => b.type === schein.bauplan);
                if (e) {
                    e.position.x += schein.dx;
                    r._populateBlockerAABBs(e);
                }
            }
            for (const k of st.koerper) {
                const e = bauten.find((b) => b.type === k.bauplan);
                const rep = { id: k.id, bauplan: k.bauplan, steht: !!e, abw: null, teile: k.teile.length };
                out.koerper.push(rep);
                if (!e) {
                    out.befunde.push(`${k.id}: steht nicht — kein Bau „${k.bauplan}" in der Station ${st.x}|${st.z}`);
                    continue;
                }
                const boden = r._terrainMacroSurfaceY(k.x, k.z, true);
                const g = (k.gier * Math.PI) / 180;
                const c = Math.cos(g);
                const sn = Math.sin(g);
                const live = Array.isArray(e.blockerAABBs) ? e.blockerAABBs : [];
                if (live.length !== k.teile.length) {
                    out.befunde.push(`${k.id}: ${live.length} Blocker-Boxen statt ${k.teile.length}`);
                    continue;
                }
                let abw = 0;
                let wo = "";
                const miss = (name, ist, soll) => {
                    const d = Math.abs(ist - soll);
                    if (!(d <= abw)) {
                        abw = Number.isFinite(d) ? d : Infinity;
                        wo = name;
                    }
                };
                k.teile.forEach((t, i) => {
                    const [mx, my, mz] = t.mitte;
                    const [sx, sy, sz] = t.mass;
                    // die Gier des Eintrags: x' = x·cos + z·sin, z' = −x·sin + z·cos (THREE um die Hoch-Achse)
                    const wx = k.x + mx * c + mz * sn;
                    const wz = k.z - mx * sn + mz * c;
                    const ex = (Math.abs(c) * sx + Math.abs(sn) * sz) / 2;
                    const ez = (Math.abs(sn) * sx + Math.abs(c) * sz) / 2;
                    const b = live[i];
                    miss(`Teil ${i} minX`, b.minX, wx - ex);
                    miss(`Teil ${i} maxX`, b.maxX, wx + ex);
                    miss(`Teil ${i} minZ`, b.minZ, wz - ez);
                    miss(`Teil ${i} maxZ`, b.maxZ, wz + ez);
                    miss(`Teil ${i} Sohle`, b.botY, boden + my - sy / 2);
                    miss(`Teil ${i} Krone`, b.topY, boden + my + sy / 2);
                    if (Math.abs(Math.sin(2 * g)) > 1e-9) {
                        if (!b.obb) {
                            abw = Infinity;
                            wo = `Teil ${i} ohne gedrehte Box (Gier ${k.gier}°)`;
                        } else {
                            miss(`Teil ${i} OBB-Mitte x`, b.obb.cx, wx);
                            miss(`Teil ${i} OBB-Mitte z`, b.obb.cz, wz);
                            miss(`Teil ${i} OBB halb x`, b.obb.hx, sx / 2);
                            miss(`Teil ${i} OBB halb z`, b.obb.hz, sz / 2);
                            // die Gier als Bogen am Rand der Box (Halb-Diagonale × Winkel-Fehler)
                            const dg = Math.atan2(b.obb.s * c - b.obb.c * sn, b.obb.c * c + b.obb.s * sn);
                            miss(`Teil ${i} OBB-Gier`, Math.abs(dg) * Math.hypot(sx, sz) * 0.5, 0);
                        }
                    }
                });
                rep.abw = Math.round(abw * 1000) / 1000;
                rep.wo = wo || null;
                rep.boden = Math.round(boden * 1000) / 1000;
                if (abw > tol) out.befunde.push(`${k.id}: ${rep.abw} m neben der Spec (${wo})`);
                // der Konsum: das Blocker-Netz, durch das jeder Kontakt-Leser fragt, kennt den Körper an seiner Spec
                rep.imNetz = r._blockerNahe(k.x, k.z, 0.5, 0, []).includes(e);
                if (!rep.imNetz) out.befunde.push(`${k.id}: das Blocker-Netz kennt ihn an ${k.x}|${k.z} nicht`);
            }
            out.stehen = out.koerper.filter((k) => k.steht && k.abw != null && k.abw <= tol && k.imNetz).length;
            return out;
        },
        station,
        S4_TOLERANZ,
        schein || null
    );
}

// (6) DIE S0-PROBE (K11, das Leuchtquellen-Gesetz): im Atrium (`s0-atrium`) setzt der Mensch über den Spiel-Pfad eine
// Feuerstelle (der Satz `spawn_studio feuerstelle`), die Nacht steht still (Mitternacht, Sonne, das Wetter gehalten — Lehre 17),
// das Auge 2 m vor dem Feuer. Gezählt wird jedes Licht ≤ 10 m um das Feuer, das ein Stoff liest — ein Punktlicht der Szene mit
// Stärke oder ein Platz des Licht-Pools mit Stärke (`_leuchtPool`) —, einmal mit „Klang: AUS" (der Standard), einmal mit Klang;
// dazu die Bestrahlung des Pools in 2 m (das EINE Gesetz fachwerk `lichtAbfall`, lineare Farbe nach Luminanz) gegen die der Nacht
// selbst (`_waagrechtIrradianz`, dieselbe, die die Belichtung liest) und die Fenster-Glut des Zeitplans um Mitternacht und
// Mittag (`atmoUniforms.fensterGlut`). DIE KLASSE (K11 Runde 2): JEDER beleuchtete Stoff trägt den Pool — der Zensus der Bauer
// im Stamm (keine Methode baut einen beleuchteten Stoff ohne Knoten) UND jedes beleuchteten Stoffs der Szene
// (`userData.lichtPool`); EIN Punktlicht-Gesetz (`_lichtPoolTerm` ruft `_punktLichtBrdf`, kein anderer, kein Szenen-Licht); die
// Laterne eines Plans (`laternen[]`, gehoben als Studio-Gestalt `laterne_dorf` im Hebe-Chokepoint `_spawnSettlementErlebnis`,
// ihr Licht das Datum ihres Rezepts) leuchtet nachts und mittags nicht. Konsum-Leser: der Licht-Takt (`_leuchtTakt`) und jeder beleuchtete Stoff (`_leuchtStoff`).
// DER HIMMEL FOLGT DEM SPRUNG misst im Bild-Lauf (`--licht`, `himmelProbe`): der Himmel lebt auf der GPU (D3).
// `schein` (der Selbsttest): die Feuerstelle und die Laterne tragen kein Emitter-Datum (`_lichtDatum`), ein
// Bauer `_scheinRueckfall` baut im Fang einen Stoff ohne Knoten, und ein Stoff ohne Pool steht als `pruef-schein` in der Szene — die Probe
// MUSS jeden beim Namen nennen.
const S0_LICHT_M = 10; // der Umkreis der gezählten Lichter um das Feuer
// das Feuer trägt in 2 m mindestens dieses Vielfache der waagrechten Bestrahlung der Nacht — der Nordstern Fachwerk: nachts hebt
// warmes Licht den Platz auf 2–5 lx, der Rest bleibt im Mondlicht bei 0,1–0,3 lx (2 lx gegen 0,2 lx)
const S0_E2_NACHT = 10;
async function s0Probe(page, station, schein) {
    return page.evaluate(
        async (st, umkreis, e2min, schein) => {
            const s = r.state;
            const T = window.THREE;
            const out = {
                station: st.id,
                befunde: [],
                nacht: {},
                fenster: null,
                laterne: null,
                bauer: [],
                ohnePool: [],
                brdf: [],
                stoffe: null,
                code: {},
            };
            const takt = async (n) => {
                for (let i = 0; i < n; i++) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch {
                        /* ein Takt-Fehler zählt der Page-Error */
                    }
                    await sleep(16);
                }
            };
            const P = Object.getPrototypeOf(r);
            if (schein) {
                r._lichtDatum = () => null;
                // der stille Rückfall unter fremdem Namen: ein Bauer mit Pool, dessen Fang einen Stoff ohne Pool baut
                P._scheinRueckfall = function () {
                    const T3 = THREE;
                    try {
                        return this._leuchtStoff(new T3.MeshStandardNodeMaterial({ color: 0xffffff }), null);
                    } catch {
                        return new T3.MeshStandardMaterial({ color: 0xffffff });
                    }
                };
                const m = new T.Mesh(new T.BoxGeometry(1, 1, 1), new T.MeshStandardNodeMaterial({ color: 0x808080 }));
                m.name = "pruef-schein";
                s.scene.add(m);
            }
            // der Zensus der Bauer im Stamm: Punktlichter (die Täter-Klasse von K11 Runde 1), beleuchtete Stoffe ohne Pool,
            // Rufer der BRDF eines Punktlichts (das EINE Gesetz)
            // je Bau eines beleuchteten Stoffs, unter jedem Namen der Bibliothek (`THREE`, `T` …): ein Stoff ohne Knoten trägt
            // den Pool nie (`_leuchtStoff` wirft), ein Knoten-Stoff nur, wo die Methode ihn in den Pool legt
            const LIT = /new\s+[A-Za-z_$][\w$]*\.Mesh(Standard|Physical|Lambert|Phong|Toon)Material\(/;
            for (const n of Object.getOwnPropertyNames(P)) {
                if (n === "constructor" || typeof P[n] !== "function") continue;
                if (!window.__fehlt(P[n], /new THREE\.PointLight\(/)) out.bauer.push(n);
                if (!window.__fehlt(P[n], LIT)) out.ohnePool.push(n);
                if (!window.__fehlt(P[n], /this\._punktLichtBrdf\(/)) out.brdf.push(n);
            }
            if (schein) delete P._scheinRueckfall;
            // das EINE Punktlicht-Gesetz am Ruf: der Pool-Term rechnet jeden Platz über _punktLichtBrdf (Spion am Ruf)
            const echtB = r._punktLichtBrdf;
            let brdf = 0;
            r._punktLichtBrdf = function (...x) {
                brdf++;
                return echtB.apply(this, x);
            };
            try {
                r._lichtPoolTerm(THREE.TSL, r._ensureAtmoUniforms(), null);
            } catch {
                /* ein Wurf nach dem Ruf entwertet den Konsum nicht */
            }
            delete r._punktLichtBrdf;
            out.poolRuftBrdf = brdf > 0;
            r._setWeather("sunny", "human");
            s.weatherTransition = null;
            // die Uhr springt über den Pfad des Spielers (sein Satz, `setTimeOfDay`): EIN Anwenden des Tags, kein Nachmalen
            const uhr = (t) => {
                if (r.setTimeOfDay(t, "human") !== true) throw new Error("S0: die Uhr nimmt den Spieler nicht (" + t + ")");
            };
            // der Mensch steht im Atrium am Rand des Genesis-Platzes (K52: die Scheibe liegt auf dem Grund der Station, der Ring
            // der Tore um sie): 2 m jenseits der Lichtung, zwischen zwei Toren (18°), der Blick des Schusses weg vom Ring
            const A0 = r.constructor.GENESIS_PLATZ;
            const w0 = Math.PI / 10;
            const sx = st.x + (A0.ringR + A0.rand + 2) * Math.cos(w0);
            const sz = st.z + (A0.ringR + A0.rand + 2) * Math.sin(w0);
            const y0 = r.getTerrainHeightAt(sx, sz);
            s.playerMesh.position.set(sx, y0 + 1, sz);
            const vor = new Set(s.architectures || []);
            r.dslRun(["spawn_studio", "feuerstelle", ["near_player", 3], 1], { source: "human" });
            await takt(20);
            const feuer = (s.architectures || []).find((e) => e && e.position && !vor.has(e));
            if (!feuer) {
                out.befunde.push("S0: die Feuerstelle steht nicht (der Satz `spawn_studio feuerstelle`)");
                return out;
            }
            const f = feuer.position;
            out.feuer = { typ: feuer.type, x: +f.x.toFixed(2), z: +f.z.toFixed(2), flaeche: +r._glutFlaeche(feuer).toFixed(3) };
            out.verzeichnis = r._blockerMit("licht").includes(feuer);
            // die Laterne eines Plans 6 m neben dem Feuer (gehoben im Hebe-Chokepoint als Studio-Gestalt `laterne_dorf`) — an
            // der ersten Stelle des Rings, die die Wände des Hebe-Chokepoints selbst frei nennen (Wasser `_landAt`, Bau
            // `_bauFreiRund`): das Feuer landet je Maschine anders (CI 1,46|0,86, lokal −0,6|2,26), fest +6 m in z fiel still.
            const ring = [[0, 6], [6, 0], [0, -6], [-6, 0], [4.2, 4.2], [-4.2, 4.2], [4.2, -4.2], [-4.2, -4.2]];
            const frei = ring.find(([dx, dz]) => {
                const wx = f.x + dx,
                    wz = f.z + dz,
                    wy = r.getTerrainHeightAt(wx, wz);
                return r._landAt(wx, wz, 0.2) && Number.isFinite(wy) && r._bauFreiRund("laterne_dorf", wx, wz, wy);
            });
            if (!frei) {
                out.befunde.push("S0 Laterne: kein Platz in 6 m um das Feuer, den Wasser- und Bau-Wand frei nennen");
                return out;
            }
            r._spawnSettlementErlebnis({ laternen: [{ x: frei[0], z: frei[1] }] }, { x: f.x, z: f.z }, { key: "pruef-s0-laterne" });
            const cam = s.camera;
            const zaehle = (um) => {
                const lichter = [];
                const v = new T.Vector3();
                s.scene.traverse((o) => {
                    if (!o.isPointLight || !(o.intensity > 0)) return;
                    o.getWorldPosition(v);
                    if (v.distanceTo(um) <= umkreis) lichter.push({ art: "szene", I: +o.intensity.toFixed(3) });
                });
                let e2 = 0;
                const pool = r._leuchtPool;
                for (const p of (pool && pool.plaetze) || []) {
                    if (!(p.staerke > 0) || Math.hypot(p.x - um.x, p.y - um.y, p.z - um.z) > umkreis) continue;
                    // das Licht DIESER Feuerstelle steht über ihrem Bett (≤ 1,5 m waagrecht); jedes andere zählt nur als Licht
                    const eigen = Math.hypot(p.x - um.x, p.z - um.z) <= 1.5;
                    lichter.push({ art: "pool", quelle: p.quelle, I: +p.staerke.toFixed(3), eigen });
                    if (!eigen) continue;
                    // der Pool in 2 m: das EINE Gesetz (fachwerk `lichtAbfall`: 1/d^abfall mit Kern und Saum), die Farbe nach Luminanz
                    const ab = window.__fachwerkCore.lichtAbfall({ reichweiteM: p.reichweite, abfall: p.abfall, kernM: p.kern }, 2);
                    const lum = 0.2126 * p.farbe[0] + 0.7152 * p.farbe[1] + 0.0722 * p.farbe[2];
                    e2 += p.staerke * ab * lum;
                }
                const en = r._waagrechtIrradianz([0, 0, 0]);
                const nacht = 0.2126 * en[0] + 0.7152 * en[1] + 0.0722 * en[2];
                return { n: lichter.length, lichter, e2: +e2.toFixed(3), nacht: +nacht.toFixed(3) };
            };
            for (const klang of [false, true]) {
                if (s.symphony) s.symphony.enabled = klang;
                uhr(0);
                cam.position.set(f.x - 2, f.y + 1.2, f.z);
                cam.lookAt(f.x, f.y, f.z);
                cam.updateMatrixWorld(true);
                await takt(45); // die Plätze blenden ein (LICHT_POOL.blendeS)
                const z = zaehle(f);
                out.nacht[klang ? "klang" : "still"] = z;
                const wie = klang ? "Klang an" : "Klang aus";
                const amFeuer = z.lichter.filter((l) => l.eigen);
                if (amFeuer.length < 1) {
                    const taeter = !out.verzeichnis
                        ? "das Verzeichnis nennt die Feuerstelle nicht als Leuchtquelle (`_blockerNamen`: „licht“ fehlt)"
                        : "der Licht-Takt setzt keinen Platz an die Glut";
                    out.befunde.push(
                        `S0 Nacht (${wie}): kein Licht über der Feuerstelle (${z.n} Lichter ≤ ${umkreis} m) — ${taeter}; Punktlichter baut ` +
                            (out.bauer.length ? out.bauer.map((b) => "`" + b + "`").join(", ") : "niemand")
                    );
                } else if (!(z.e2 >= e2min * z.nacht))
                    out.befunde.push(
                        `S0 Nacht (${wie}): die Bestrahlung in 2 m ist ${z.e2}, die Nacht trägt ${z.nacht} — ${(z.e2 / z.nacht).toFixed(1)}× ` +
                            `(Soll ≥ ${e2min}×: Nordstern Fachwerk, warmes Licht 2–5 lx gegen den Mond 0,1–0,3 lx); das Datum des Feuers ` +
                            "(fachwerk LICHT_GESETZ.feuer, Zeitplan nacht) über `_leuchtStaerke`"
                    );
            }
            if (s.symphony) s.symphony.enabled = false;
            // die Laterne: nachts ein Platz, mittags keiner
            const lp = { x: f.x + frei[0], y: f.y + 3, z: f.z + frei[1] };
            const laterneAn = () =>
                ((r._leuchtPool && r._leuchtPool.plaetze) || []).filter(
                    (p) => p.quelle === "laterne_dorf" && Math.hypot(p.x - lp.x, p.z - lp.z) < 1
                ).length;
            cam.position.set(lp.x - 2, lp.y - 1.5, lp.z);
            cam.updateMatrixWorld(true);
            uhr(0);
            await takt(45);
            const nachtL = laterneAn();
            uhr(0.5);
            await takt(45);
            const mittagL = laterneAn();
            out.laterne = { nachts: nachtL, mittags: mittagL };
            if (nachtL !== 1 || mittagL !== 0)
                out.befunde.push(
                    `S0 Laterne: die Laterne des Plans trägt nachts ${nachtL} und mittags ${mittagL} Plätze (Soll 1 und 0) — ` +
                        "die Studio-Gestalt `laterne_dorf` (laternen[] im Hebe-Chokepoint `_spawnSettlementErlebnis`, ihr Datum `_lichtDatumDerGestalt`)"
                );
            // die Fenster-Glut des Zeitplans: um Mitternacht an, mittags aus
            const glut = () => {
                const u = s.atmoUniforms && s.atmoUniforms.lichtGlut && s.atmoUniforms.lichtGlut.fenster;
                const c = u && u.value;
                return c ? +(0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b).toFixed(4) : null;
            };
            uhr(0);
            await takt(2);
            const nachts = glut();
            uhr(0.5);
            await takt(2);
            const mittags = glut();
            out.fenster = { nachts, mittags };
            if (!(nachts > 0) || mittags !== 0)
                out.befunde.push(
                    `S0 Fenster: die Glut des Zeitplans ist nachts ${nachts} und mittags ${mittags} (Soll > 0 und 0; ` +
                        "fachwerk ZEIT_VIS host)"
                );
            // der Zensus jedes beleuchteten Stoffs der Szene: er trägt den Pool (oder ist selbst Quelle)
            out.stoffe = window.__stoffZensus();
            const lit = out.stoffe.beleuchtet;
            if (out.stoffe.ohnePool.length)
                out.befunde.push(
                    `S0 Stoff ohne Pool: ${out.stoffe.ohnePool.length} von ${lit} beleuchteten Stoffen der Szene tragen den ` +
                        `Licht-Pool nicht (${out.stoffe.ohnePool.slice(0, 8).join(", ")}) — nachts bleiben sie neben dem Feuer dunkel`
                );
            if (out.ohnePool.length)
                out.befunde.push(
                    `S0 Bauer ohne Pool: ${out.ohnePool.map((b) => "`" + b + "`").join(", ")} bauen einen beleuchteten Stoff ` +
                        "ohne `_leuchtStoff`"
                );
            if (!out.poolRuftBrdf || out.brdf.some((b) => b !== "_lichtPoolTerm"))
                out.befunde.push(
                    `S0 Punktlicht-Gesetz: die BRDF eines Punktlichts rufen ${out.brdf.map((b) => "`" + b + "`").join(", ") || "niemand"} ` +
                        "(Soll: nur `_lichtPoolTerm`, das EINE Gesetz)"
                );
            if (out.bauer.length)
                out.befunde.push(
                    `S0 Punktlicht: ${out.bauer.length} Stamm-Methode(n) bauen ein Szenen-Licht (${out.bauer.join(", ")}) — ` +
                        "jedes Szenen-Licht kostet jeden beleuchteten Stoff, auch auf 0"
                );
            uhr(0.5);
            return out;
        },
        station,
        S0_LICHT_M,
        S0_E2_NACHT,
        !!schein
    );
}

function zeigeS0(rep, schein) {
    console.log(`\n  ── S0-PROBE ${rep.station}${schein ? " · SCHEIN (Feuer ohne Datum, Laterne ungelesen, Stoff und Bauer ohne Pool)" : ""}`);
    if (rep.feuer)
        console.log(
            `    Feuerstelle ${rep.feuer.typ} bei ${rep.feuer.x}|${rep.feuer.z}, Glut-Fläche ${rep.feuer.flaeche} m², Verzeichnis ${rep.verzeichnis ? "ja" : "NEIN"}`
        );
    for (const k of Object.keys(rep.nacht || {})) {
        const z = rep.nacht[k];
        console.log(
            `    Nacht ${k === "klang" ? "Klang an " : "Klang aus"}: ${z.n} Lichter ≤ ${S0_LICHT_M} m, Bestrahlung in 2 m ${z.e2} (die Nacht ${z.nacht}) ${JSON.stringify(z.lichter)}`
        );
    }
    if (rep.laterne) console.log(`    Laterne des Plans: nachts ${rep.laterne.nachts} · mittags ${rep.laterne.mittags} Plätze`);
    if (rep.fenster) console.log(`    Fenster-Glut: nachts ${rep.fenster.nachts} · mittags ${rep.fenster.mittags}`);
    if (rep.stoffe)
        console.log(
            `    Stoffe der Szene: ${rep.stoffe.beleuchtet} beleuchtet, ohne Pool ${rep.stoffe.ohnePool.length ? rep.stoffe.ohnePool.join(", ") : "keiner"}`
        );
    console.log(
        `    Bauer im Stamm: Punktlicht ${rep.bauer.length ? rep.bauer.join(", ") : "keiner"} · Stoff ohne Pool ${rep.ohnePool.length ? rep.ohnePool.join(", ") : "keiner"} · BRDF-Rufer ${rep.brdf.join(", ") || "keiner"}`
    );
}

function zeigeS4(rep, schein) {
    console.log(
        `\n  ── S4-PROBE ${rep.station}${schein ? ` · SCHEIN (${schein.bauplan} rückt ${schein.dx} m)` : ""}: ${rep.stehen} von ${rep.koerper.length} Körpern an ihrer Spec (≤ ${S4_TOLERANZ} m)`
    );
    for (const k of rep.koerper)
        console.log(
            `    ${k.steht && k.abw <= S4_TOLERANZ && k.imNetz ? "—    " : "FEHLT"} ${k.id.padEnd(10)} ${k.bauplan.padEnd(16)} ${
                k.steht
                    ? `Abw ${k.abw} m${k.wo ? " (" + k.wo + ")" : ""} · Boden ${k.boden} · Netz ${k.imNetz ? "ja" : "NEIN"}`
                    : "steht nicht"
            }`
        );
}

// Die Probe in der Seite: (1)–(4) einer Welt.
async function probe(page, welt, wuerfe, evolutionen, schein) {
    return page.evaluate(
        async (welt, wuerfe, evolutionen, schein) => {
            const s = r.state;
            const out = { welt, wuerfe: [], akt: null, nexus: null, zensus: null, befunde: [] };
            const takt = async (ms) => {
                for (let i = 0; i * 16 < ms; i++) {
                    try {
                        r._gameLoopTick(performance.now());
                    } catch {
                        /* ein Takt-Fehler zählt der Page-Error */
                    }
                    await sleep(16);
                }
            };
            // Die Welt reift aus (Genesis-Ring, Vorschauen, Start-Dorf der Wildnis): erst wenn ihr Bestand 4 s steht, misst
            // die Linse — was danach wächst, ist ein Wurf.
            {
                let n = -1;
                let still = 0;
                await window
                    .__gebautNach("noch: still < 4", {
                        fertig: () => !!(!(still < 4)),
                        takt: async () => {
                        await takt(1000);
                        const m = (s.architectures || []).length + (s.creatures || []).length;
                        still = m === n ? still + 1 : 0;
                        n = m;
                        },
                        max: 800,
                    });
            }
            const wm = () => s.worldMeta || {};
            // Die Welt-Substanz als Mengen (Identität, nie Länge): der Hort-Deckel des Nexus (MAX_NEXUS_STRUCTURES) lässt
            // für jeden neuen Bau den fernsten verblassen — eine Länge sähe den Wurf dann nicht.
            const substanz = () => ({
                bauten: new Set(s.architectures || []),
                tiere: new Set(s.creatures || []),
                inseln: new Set(s.floatingIslands || []),
                ufos: new Set(s.ufos || []),
                pflanzSchlange: new Set(s.pendingVegSpawns || []),
                dorfZellen: new Set(Object.keys(wm().settlementCells || {})),
                edits: new Set(wm().voxelEdits || []),
            });
            const zuwachs = (a, b) => {
                const d = {};
                let summe = 0;
                for (const k of Object.keys(a)) {
                    let x = 0;
                    for (const e of b[k]) if (!a[k].has(e)) x++;
                    if (x > 0) {
                        d[k] = x;
                        summe += x;
                    }
                }
                return { summe, d };
            };
            const lauf = async (prog, quelle) => {
                const vor = substanz();
                let res = null;
                try {
                    res = r.dslRun(prog, { source: quelle });
                } catch (e) {
                    res = { wurf: String((e && e.message) || e).slice(0, 160) };
                }
                // das Dorf (und das Fraktal) reist über den Worker, die Pflanz-Schlange leert sich im Takt
                await takt(prog[0] === "spawn_village" || prog[0] === "spawn_fractal" ? 3000 : 700);
                const z = zuwachs(vor, substanz());
                const log = res && Array.isArray(res.log) ? res.log : [];
                const halt = log.find((l) => l && l.event === "invalid_position");
                return {
                    op: prog[0],
                    quelle,
                    zuwachs: z.summe,
                    was: z.d,
                    ereignisse: log
                        .map((l) => l && l.event)
                        .filter(Boolean)
                        .slice(0, 4),
                    grund: halt ? halt.grund : null,
                };
            };
            if (schein) r._wildnisTraegt = () => true; // der Selbsttest: das Prädikat trägt zum Schein überall
            const basis = Object.fromEntries(Object.entries(substanz()).map(([k, v]) => [k, v.size]));
            const bestand = new Set(s.architectures || []); // der Bestand der Welt und, nach (2), das Gesetzte
            // (1) DIE WÜRFE des Feldes
            for (const prog of wuerfe)
                for (const quelle of ["nexus", "rule:nexus"]) out.wuerfe.push(await lauf(prog, quelle));
            // (2) DER AKT: der Mensch setzt überall
            out.akt = await lauf(["spawn_blueprint", "baum_eiche", ["near_player", 25]], "human");
            if (schein) return Object.assign(out, { basis, erbgut: r._erbgut().terme.map((t) => t.art) });
            for (const e of s.architectures || []) bestand.add(e);
            // (3) DER NEXUS-TAKT, getrieben (im Spiel eine Evolution alle 24 s)
            {
                const vor = substanz();
                const zaehl = {};
                let laeufe = 0;
                for (let i = 0; i < evolutionen; i++) {
                    s.nexusWirk = 1e9; // die Wirk-Kraft hält den Takt nicht an
                    const evo = r.generateEvolution(); // der Takt selbst ruht headless (Gate-Treue)
                    s.nexusEvolutionQueue.push(evo);
                    const kopf = evo && Array.isArray(evo.program) ? String(evo.program[0]) : "?";
                    const innen = JSON.stringify((evo && evo.program) || []).match(/"spawn_[a-z_]+"/g) || [];
                    for (const w of innen) zaehl[w.replace(/"/g, "")] = (zaehl[w.replace(/"/g, "")] || 0) + 1;
                    if (kopf) laeufe++;
                    r._loopNexusUpdate();
                    if (i % 10 === 9) await takt(400);
                }
                await takt(6000); // die Regeln des Nexus feuern, das Dorf landet
                const z = zuwachs(vor, substanz());
                out.nexus = { evolutionen: laeufe, wuerfeImPool: zaehl, zuwachs: z.summe, was: z.d };
            }
            // (4) DER ABSENZ-ZENSUS in 300 m um den Ursprung der Welt (die Genesis-Plattform)
            {
                const pl = r._genesisPlattform();
                const M = pl && pl.position ? { x: pl.position.x, z: pl.position.z } : { x: 0, z: 0 };
                const R = 300;
                const d = (p) => Math.hypot(p.x - M.x, p.z - M.z);
                const fremd = {};
                for (const e of s.architectures || [])
                    if (e && e.position && d(e.position) <= R && !bestand.has(e))
                        fremd[e.type] = (fremd[e.type] || 0) + 1;
                let streu = 0;
                const SC = r.constructor.SCATTER;
                if (s.scatterRegions && SC)
                    for (const [key, reg] of s.scatterRegions) {
                        const [rx, rz] = key.split(",").map(Number);
                        const c = { x: (rx + 0.5) * SC.regionM, z: (rz + 0.5) * SC.regionM };
                        if (d(c) <= R + SC.regionM * 0.71) streu += (reg && reg.instanceCount) || 0;
                    }
                let nahStreu = 0;
                if (s.nahStreu && s.nahStreu.kacheln)
                    for (const k of s.nahStreu.kacheln.values()) nahStreu += (k.items || []).length;
                const h = s.hydrosphere;
                out.zensus = {
                    R,
                    fremdeBauten: fremd,
                    streuZellen: streu,
                    nahStreu,
                    tiere: (s.creatures || []).filter((c) => c && c.position && d(c.position) <= R).length,
                    inseln: (s.floatingIslands || []).length,
                    dorfZellen: Object.keys(wm().settlementCells || {}).length,
                    pflanzSchlange: (s.pendingVegSpawns || []).length,
                    // jeder Fluss, den kein Term der Bühne trägt (der Bach der Klamm S6 ist ihr Gesetz, kein Wurf)
                    fluesse: h && Array.isArray(h.rivers) ? h.rivers.filter((rv) => !rv.term).length : null,
                };
            }
            out.basis = basis;
            out.erbgut = r._erbgut().terme.map((t) => t.art);
            return out;
        },
        welt,
        wuerfe,
        evolutionen,
        !!schein
    );
}

// (7) DAS BILD DER S0-PROBE (`--licht`, K11 Abnahme): ECHTER Renderer (swiftshader und das Holz kienspan; `--echt` die
// Hardware-GPU im Fenster), dieselbe Bühne, dieselbe Feuerstelle über den Satz des Menschen, die Nacht still (Mitternacht,
// Sonne, Sommer — `__buehne`, Lehre 17), das Auge 2 m vor dem Feuer in Augenhöhe, Blick auf das Bett; aufgenommen über den
// AUSGABE-PFAD (`__ausgabeAufnahme`: Tonkurve + sRGB + Post, was der Spieler sieht). Gemessen wird der FEUERKREIS: der Boden in
// 0,75 / 1,25 / 1,75 m um die Feuerstelle (je 24 Winkel, auf den Schirm projiziert, 3×3 gemittelt), Luma der Ausgabe. Die
// Abnahme der Karte: Luma ≥ 0,15. Konsum-Leser: der Licht-Takt (`_leuchtTakt`) und der Licht-Pool in jedem Stoff
// (`_lichtPoolTerm`). Der Selbsttest leert den Pool (jeder Platz ohne Reichweite) — der Kreis MUSS unter die Schwelle fallen
// und den Pool beim Namen nennen.
// DIE FRIST (Kartenkopf: eine Linse ≤ 3 min CI): der ganze Lauf steht unter EINER Uhr (`S0_FRIST_S`), jede Phase (Laden,
// Boot, Satz, Gestalt, Schuss, Schein) läuft gegen ihren Rest — reißt sie, endet die Linse ROT beim Namen der Phase. Und DIE STILLE BIS ZUM SCHUSS: swiftshader übersetzt jede Pipeline beim ersten Zeichnen, und der Schuss wartet
// auf alles, was davor in die Schlange der CPU-Rasterung fiel — die Wildnis des ersten Ladens, der Blick des Spielers in den
// Warte-Takten. Bis zum Schuss zeichnet
// die Seite nichts (`_loopRender` ruht); der Schuss zeichnet alles selbst (Erst-Zeichnung, Warm-Frames).
// DIE NAH-BÜHNE DES SCHUSSES (swiftshader — die CI; `--echt` zeichnet die ganze Welt): der Feuerkreis liest nur Boden, Feuer,
// Pool und Ausgabe — der Schuss zeichnet über den Spielpfad (`_loopRender`, die Stoffe der Welt, der Ausgabe-Pfad) aus der
// Welt-Szene GENAU das: den Boden-Satz und die Feuerstelle (ihren Bau-Satz, ihre Gruppe), dazu die fremden Szenen (Post,
// PMREM) und die Lichter; die Zellen beider Sätze und jede gewählte Instanz urteilt das EINE Gesetz der Pass-Wahl
// (`_passTrifft`) mit der Kugel um das Feuer — nie eine Hülle, nie ein Stempel je Gast.
// DIE WAND: was der Renderer im Schuss zeichnet (`_objects.get`) und der Feuerkreis nicht liest, ist ROT beim Namen (Bau-
// Sätze mit den Formen ihrer Bereiche), ebenso jede Satz-Zelle jenseits der Kugel. Selbsttests: die Kugel 1 km versetzt
// (jede gezeichnete Zelle liegt jenseits), der Feuerkreis liest nichts (Boden und Feuerstelle werden fremd).
const S0_NAH_INSTALL = () => {
    window.__s0Nah = (mitte, radius, mit) => {
        const rend = st.renderer;
        const welt = st.scene;
        // WAS DER FEUERKREIS LIEST: der Boden-Satz, die Feuerstelle (ihr Bau-Satz, ihre Gruppe oder ihr eigenes Mesh) und, was
        // der Aufrufer zeigt (`mit`: die Figur des Beweisbilds)
        // — gefragt beim Zeichnen: der Bau-Satz entsteht erst im ersten Frame des Schusses (`_tickBauSatz` vor dem Render)
        const feuer = window.__s0Feuer;
        const gruppen = () => st.archInstanceGroups || new Map();
        const feuerGruppe = (g) => !!g && !!g.slotEntry && g.slotEntry.includes(feuer);
        const satzVon = (o) => {
            for (const s of (st.chunkSaetze || new Map()).values()) if (s.mesh === o) return s;
            return null;
        };
        const liest = (o, ohne) => {
            if (ohne) return false;
            for (let p = o; p; p = p.parent) {
                if ((mit && mit.includes(p)) || (feuer && p === feuer.mesh)) return true;
                const s = satzVon(p);
                if (s) {
                    if (s.art === "boden") return true;
                    for (const key of s.bloecke.keys()) if (feuerGruppe(gruppen().get(key))) return true;
                    return false;
                }
                if (p.isInstancedMesh && feuerGruppe(gruppen().get(p.userData && p.userData.archInstanceKey))) return true;
            }
            return false;
        };
        const urteil = new WeakMap();
        const zaehl = { nah: 0, fern: 0 };
        // fremde Szenen (Post, PMREM) zeichnen; aus der Welt-Szene nur, was der Feuerkreis liest
        const nah = (o) => {
            let u = urteil.get(o);
            if (u !== undefined) return u;
            let wurzel = o;
            while (wurzel.parent) wurzel = wurzel.parent;
            u = wurzel !== welt || liest(o, false);
            urteil.set(o, u);
            zaehl[u ? "nah" : "fern"]++;
            return u;
        };
        rend._projectObject = function (o, ...rest) {
            if (o.visible !== false && (o.isMesh || o.isLine || o.isPoints || o.isSprite) && !nah(o)) {
                for (const c of o.children) this._projectObject(c, ...rest);
                return undefined;
            }
            return Object.getPrototypeOf(this)._projectObject.call(this, o, ...rest);
        };
        // DIE WAHL JE PASS TRÄGT DIE KUGEL: ein Satz (Hülle 1e9) zeichnet, was das EINE Gesetz der Pass-Wahl (`_passTrifft`) in
        // seinen Zellen trifft, eine Wahl-Gruppe ihre Instanzen ebenso — die Kugel urteilt mit (Körper: Box mit Saum), sonst
        // zeichnete der Schuss jeden Bau, jede Zelle Boden im Blick bis zum Horizont
        const r0 = r;
        zaehl.verworfen = 0;
        r0._passTrifft = function (L, cx, cy, cz, hx, hy, hz, rand) {
            if (!Object.getPrototypeOf(this)._passTrifft.call(this, L, cx, cy, cz, hx, hy, hz, rand)) return false;
            const dx = Math.max(0, Math.abs(mitte.x - cx) - hx - rand);
            const dy = Math.max(0, Math.abs(mitte.y - cy) - hy - rand);
            const dz = Math.max(0, Math.abs(mitte.z - cz) - hz - rand);
            if (dx * dx + dy * dy + dz * dz <= radius * radius) return true;
            zaehl.verworfen++;
            return false;
        };
        // WAS DER SCHUSS ZEICHNET (die Wand, unabhängig von der Regel oben): jedes Objekt, das der Renderer zeichnet (sein
        // Render-Objekt, `_objects.get`) — eines der Welt-Szene, das nicht in `lies` steht (selbst oder ein Vorfahr), ist fremd
        const objs = rend._objects;
        const getAlt = objs.get;
        const gezeichnet = new Set();
        objs.get = function (o, ...rest) {
            if (o) gezeichnet.add(o);
            return getAlt.call(this, o, ...rest);
        };
        // der Name: ein Bau-Satz mit den Formen seiner Bereiche, eine Senke (Instanz-Zeichner) mit dem Namen der Senke
        const name = (o) => {
            const q = o.__instanzQuelle || o;
            const s = satzVon(q);
            if (s && s.art !== "boden") {
                const formen = new Set();
                for (const k of s.bloecke.keys()) for (const m of String(k).matchAll(/f:([^|]+)/g)) formen.add(m[1]);
                return `${q.name}(${[...formen].join(",")})`;
            }
            return q.name || (q.userData && q.userData.inventar) || q.type;
        };
        const fremd = (ohne) => {
            const out = {};
            for (const o of gezeichnet) {
                let w = o;
                while (w.parent) w = w.parent;
                if (w === welt && !liest(o, ohne)) out[name(o)] = (out[name(o)] || 0) + 1;
            }
            return out;
        };
        // DIE ZELLEN JENSEITS DER KUGEL: je gezeichnetem Satz (Name des Satz-Meshes) die Zellen des Hauptbilds (sein Abschnitt
        // „haupt", `_chunkSatzAbschnitt`), deren Hülle die Kugel um `m` nicht schneidet
        const jenseits = (m) => {
            const out = {};
            for (const s of (st.chunkSaetze || new Map()).values()) {
                const a = s.abschnitte && s.abschnitte.get("haupt");
                if (!a || !(a.n > 0) || !gezeichnet.has(s.mesh)) continue;
                let n = 0;
                for (const z of a.liste || []) if (z && z.huelle && !z.huelle.isEmpty() && z.huelle.distanceToPoint(m) > radius) n++;
                const k = (s.mesh && s.mesh.name) || s.art;
                if (n) out[k] = (out[k] || 0) + n;
            }
            return out;
        };
        return () => {
            delete rend._projectObject;
            delete r0._passTrifft;
            objs.get = getAlt;
            // die Wand und ihr Selbsttest (der Feuerkreis läse nichts: jedes gezeichnete Objekt der Welt ist fremd)
            zaehl.fremd = fremd(false);
            zaehl.fremdOhneLesen = fremd(true);
            // die Zellen des letzten Hauptbilds: jenseits der Kugel (die Wand) und gegen die um 1 km versetzte Kugel (der
            // Selbsttest: jede gezeichnete Zelle liegt dort jenseits)
            zaehl.jenseits = jenseits(mitte);
            zaehl.versetzt = jenseits(mitte.clone().add(new window.THREE.Vector3(1000, 0, 0)));
            return zaehl;
        };
    };
};
// DAS URTEIL ÜBER DIE GESTALT DER FEUERSTELLE (K10-6 Nachbesserung 2): wartet die Linse auf die Feuerstelle, nennt sie, was
// fehlt, beim Namen — fiel sie aus der Welt, steht der Rufer von `removeArchitecture` (die Wache, `__s0Wache`) im Urteil, und
// die Linse bricht sofort ab (sie wächst nie mehr); reißt die Frist, nennt sie die Lage der Foundry (das Buch, die Schlange,
// was im Flug ist, wo die Gestalt der Feuerstelle steht) und den längsten Takt.
const S0_GESTALT_INSTALL = () => {
    const weg = Object.getPrototypeOf(r).removeArchitecture;
    r.removeArchitecture = function (e, ...rest) {
        if (e && e === window.__s0Wache && !e.__s0Fiel)
            e.__s0Fiel =
                String(new Error().stack || "")
                    .split("\n")
                    .slice(2, 7)
                    .map((z) => z.trim().replace(/^at /, "").split(" ")[0])
                    // nur Namen (ein Rahmen ohne Namen trägt seine Datei: pptr:evaluate;…, http://…)
                    .filter((n) => n && !/[:/%(]/.test(n) && !/^(async|Promise|new|<anonymous>)$/.test(n))
                    .join(" ← ") || "ein Rufer ohne Namen";
        return weg.call(this, e, ...rest);
    };
    window.__s0Gestalt = (feuer) => {
        const s = r.state;
        if (!feuer || !s.architectures.includes(feuer))
            return { fiel: (feuer && feuer.__s0Fiel) || "nicht über removeArchitecture", fehlt: [] };
        const fehlt = [];
        if (!r._archIsRendered(feuer)) fehlt.push("die Feuerstelle wächst");
        const ring = r._builtRingRadius();
        const K = r.constructor;
        if (!(ring != null && ring >= K.RING_EXIST_FLOOR)) fehlt.push(`der Boden wächst (Ring ${ring} von ${K.RING_EXIST_FLOOR})`);
        return { fiel: null, fehlt };
    };
    window.__s0FoundryLage = (feuer) => {
        const f = r._foundry;
        if (!f) return "keine Foundry";
        let pr = null;
        try {
            pr = r._foundryPresetForEntry(feuer);
        } catch {
            pr = null;
        }
        const q = f.warte || [];
        const platz = q.findIndex((a) => a && a.msg && a.msg.presetId === pr);
        const meine = f.requested ? [...f.requested].filter((k) => String(k).startsWith(pr + "|")) : [];
        const gebaut = meine.filter((k) => r._foundryCacheGet(k) !== undefined);
        const wo =
            platz >= 0
                ? `wartet an Platz ${platz + 1} der Schlange`
                : gebaut.length
                  ? `ist gebaut (${gebaut.join(", ")}), der Eintrag setzt sie nicht ein`
                  : meine.length
                    ? `ist im Flug (${meine.join(", ")})`
                    : "ist nicht angefragt";
        return (
            `Foundry ${f.ready ? "bereit" : "nicht bereit"}${f.recipes ? "" : ", Buch kalt"} · Schlange ${q.length} · im Flug ` +
            `${f.pending ? f.pending.size : 0} · die Gestalt ${pr || "?"} ${wo}`
        );
    };
};
const S0_NAH_M = 4;
const S0_LUMA_2M = 0.15;
// DER FARBTON DES FEUERS (K11b, Auge V18.542: „der Boden glüht lava-rot"): ein Holzfeuer leuchtet warm-orange (Schwarzkörper
// ≈ 1 800–2 000 K) — der Boden 1–3 m um die Feuerstelle trägt in der Ausgabe den Farbton 28–45°. Die Sättigung (HSV, Soll
// der Karte ≤ 0,75) ist eine WAND: das Auge der Nacht sieht mesopisch
// (`NACHT_AUGE`, die Sättigung der Post-Kette folgt der Leuchtdichte, CIE 191:2010). Der Selbsttest `tag` gibt dem Schuss das
// Auge des Tages zurück — der Boden MUSS an der Sättigung reißen, im Farbton nicht. Der Selbsttest (`farbe`) gibt dem Platz
// des Feuers das Datum bis K11b: die
// Glut-Palette des Stoffs (0xff7a35) mit der Nacht-Stärke 12 — der Ring MUSS den Farbton reißen. Die untere Kante ist das Licht
// selbst: 1 800 K liegt in sRGB bei 29,6°, die Glut-Palette bei 20,5°; jeder Boden zieht den Ton zu seinem eigenen (Gras
// hinauf).
// DER TON NETTO (D3-2): seit die Nacht ihr eigenes Licht trägt (Sternen-Licht, der Boden ohne Feuer Luma 36), mischt der Ring
// die Nacht mit — die Glut-Palette des Selbsttests stand gemischt bei 35° im Band (BLIND). Gemessen wird das Licht des Feuers:
// derselbe Ring im Schuss mit Feuer minus im Schuss ohne (`nacht`, dieselbe Kamera, dieselben Pixel), je Kanal in der Ausgabe
// (sRGB, ≥ 0).
const S0_TON = { hue: [28, 45], satMax: 0.75, palette: { hex: 0xff7a35, nacht: 12 } };
// ZWEI GRÖSSEN, ZWEI LESER (D3-2 mit K66): der FARBTON ist das Licht des Feuers (netto, die Nacht abgezogen — die Farbtemperatur
// des Gesetzes), die SÄTTIGUNG ist, was das Auge sieht (brutto, das Bild mit der Nacht — die Wand des Auges der Nacht). Netto
// gemessen trägt jedes Licht seine volle Sättigung (das Feuer allein, ohne den Boden der Nacht: 0,96).
// DAS LICHT ADDIERT LINEAR (F1, die Foto-Kette): mit minus ohne Feuer je Kanal im LINEAREN Licht der Ausgabe (sRGB entschlüsselt),
// der Rest wieder in sRGB — unter der Tonkurve Khronos PBR Neutral (linear bis zur Schulter, der Schwarzpunkt fällt in der
// Differenz) ist das das Licht des Feuers auf dem Boden (die Differenz der sRGB-Werte zöge die Nacht nichtlinear ab).
const s0Lin = (c) => (c / 255 <= 0.04045 ? c / 255 / 12.92 : Math.pow((c / 255 + 0.055) / 1.055, 2.4));
const s0Srgb = (l) => (l <= 0.0031308 ? 12.92 * l : 1.055 * Math.pow(l, 1 / 2.4) - 0.055);
function s0TonNetto(e, ohne) {
    if (!e || !e.ton || !ohne || !ohne.ton) return null;
    const [R, G, B] = e.ton.rgb.map((c, i) => s0Srgb(Math.max(0, s0Lin(c) - s0Lin(ohne.ton.rgb[i]))));
    const mx = Math.max(R, G, B);
    const dl = mx - Math.min(R, G, B);
    let hue = 0;
    if (dl > 0) hue = mx === R ? 60 * (((G - B) / dl + 6) % 6) : mx === G ? 60 * ((B - R) / dl + 2) : 60 * ((R - G) / dl + 4);
    return { hue: +hue.toFixed(1), sat: +(mx > 0 ? dl / mx : 0).toFixed(3), rgb: [R, G, B].map((c) => Math.round(c * 255)) };
}
// der Ton des Schusses `e` gegen den Schuss ohne Feuer `ohne`: Farbton netto, Sättigung brutto
function s0Ton(e, ohne) {
    const n = s0TonNetto(e, ohne);
    return n && { hue: n.hue, sat: e.ton.sat, netto: n };
}
const s0TonImBand = (t) => !!t && t.hue >= S0_TON.hue[0] && t.hue <= S0_TON.hue[1];
const s0TonPasst = (t) => s0TonImBand(t) && t.sat <= S0_TON.satMax;
// DER STOFF DES SCHUSSES (K17-3, die Shader-Kosten-Linse scripts/lib/shader-kosten.cjs): der Schuss übersetzt das Boden-Programm
// (`voxelChunkMaterial`) — seine Zeichen stehen unter der Decke des Bodens (`STOFFE.boden.budget.zeichenMax`). Seit K17 trug
// es das Fels-Gesetz ausgeschrieben im Pixel (78 Ziehungen, 96 050 → 149 521 Zeichen; lokal 4 Kerne Schuss 12 → 20 s), die
// Frist riss auf dem Runner (171 s). Der Selbsttest hält das gemessene Programm gegen eine Decke ein Zeichen darunter.
// Keine Hilfs-Funktion des Programms liest eine Bindung (`bindungInFunktionMax` 0): die Layout-Funktion `wieseRelief` las den
// Rausch-Atlas und vererbte seinen Namen in jedes weitere Programm — auf der Bühne sagte swiftshader die Pipeline ab.
const S0_STOFF = (() => {
    const SK = require("./lib/shader-kosten.cjs");
    const decke = SK.STOFFE.boden.budget.zeichenMax;
    return {
        decke,
        urteil: (wgsl, d) => {
            const k = SK.wgslKosten(wgsl);
            return {
                zeichen: k.zeichen,
                rot: SK.kostenUrteil(k, { zeichenMax: d == null ? decke : d, bindungInFunktionMax: 0 }, "S0 Boden-Programm"),
            };
        },
    };
})();
// DER HIMMEL FOLGT DEM SPRUNG (K10, die Nacht der Gasse): die Uhr springt über den Pfad des Spielers (`setTimeOfDay`, sein Satz
// „nacht") — EIN Anwenden des Tags (`_applyDayNightToScene`) später trägt die Himmels-Umgebung (die IBL jedes Stoffs, ihre
// Lesung `_himmelsIrradianz`) die Bestrahlung des Himmels, der jetzt gilt: den Himmel des Orts, den die Belichtung und das Wasser
// synchron lesen (`_himmelsBestrahlung`, S7). Seit D3 lebt der Himmel auf der GPU und kommt EINE Lesung nach der Malung
// auf die CPU (`state._skyEnvLesung`) — die Probe misst darum im Bild-Lauf (der Null-Renderer malt keinen Himmel, Lehre 16): sie
// wartet auf die Lesung, die der Sprung angestoßen hat; malt der Maler nicht, bleibt die Lesung der vorigen Stunde stehen.
// Morgen als Ausgang (frisch gemalt), dann Mittag, dann sofort Mitternacht (die zweite Malung liegt in der Raten-Drossel).
// `taub` (der Selbsttest): der Maler der Umgebung hört die Uhr nicht (`_ensureSkyEnvironment` taub) — die Probe MUSS ihn nennen.
const S0_HIMMEL_TOL = 0.03; // relativ, plus 0,005 absolut: die Umgebung nach dem Sprung gegen den Himmel des Orts (Radeon 1,9 %)
async function himmelProbe(page, taub) {
    return page.evaluate(
        async (taub, tol) => {
            const s = r.state;
            const out = { himmel: [], befunde: [] };
            const uhr = (t) => {
                if (r.setTimeOfDay(t, "human") !== true) throw new Error("S0: die Uhr nimmt den Spieler nicht (" + t + ")");
            };
            const lum = (e) => 0.2126 * e[0] + 0.7152 * e[1] + 0.0722 * e[2];
            r._setWeather("sunny", "human");
            s.weatherTransition = null;
            uhr(0.3);
            if (!(await r._himmelFrisch())) {
                out.befunde.push("S0 Himmel: keine Lesung der Umgebung (`_himmelFrisch`) — die Probe ist blind");
                return out;
            }
            for (const t of [0.5, 0]) {
                if (taub) r._ensureSkyEnvironment = () => true; // der taube Maler
                const nr0 = s._skyEnvLeseNr || 0;
                uhr(t);
                const gemalt = (s._skyEnvLeseNr || 0) !== nr0; // der Sprung malt die Umgebung der neuen Stunde
                await s._skyEnvLesung;
                delete r._ensureSkyEnvironment;
                const env = r._himmelsIrradianz();
                const sprung = env ? Math.PI * lum(env.oben) : 0;
                const ort = lum(r._himmelsBestrahlung([0, 0, 0]));
                out.himmel.push({ uhr: t, gemalt, sprung: +sprung.toFixed(4), ort: +ort.toFixed(4) });
                if (!gemalt || !(Math.abs(sprung - ort) <= tol * ort + 0.005))
                    out.befunde.push(
                        `S0 Himmel: nach dem Sprung auf ${t === 0 ? "Mitternacht" : "Mittag"} trägt die Umgebung die Bestrahlung ` +
                            `${sprung.toFixed(3)}${gemalt ? "" : " (ungemalt)"}, der Himmel des Orts ${ort.toFixed(3)} — die ` +
                            "Himmels-Umgebung (`_ensureSkyEnvironment`) folgt dem Sprung der Uhr nicht: gemalt vor der Luft-Farbe " +
                            "(`_dayNightApplyHemiUndLuft`) oder vom Sprung in der Raten-Drossel (SKY_ENV_REGEN_MIN_MS) gehalten"
                    );
            }
            return out;
        },
        !!taub,
        S0_HIMMEL_TOL
    );
}
// DIE NACHT (D3-2, F6): der Boden 1–3 m um die Feuerstelle im Schuss OHNE ihr Licht (der Pool leer) ist um Mitternacht lesbar
// (Luma ≥ 22, abgesoffen < 4 wie `bildMasse` ≤ 5 %): die Nacht ist ein Himmel mit Mond und Sternen-Licht in derselben Eichung
// (Lehre 21, Ambient der EINEN Kette) — ohne das Sternen-Licht (`_atmoSternenLicht`, `ATMO_GESETZ.nacht.himmel`) streut nur der
// Mond (Radeon: Luma 18,4 gegen 30,3). SEIT licht.K1 (w3v-licht) trägt die KAMERA die Nacht: unter `BELICHTUNG.gleitung[1]` (8°)
// legt `_belichtungAusLicht` die 18-%-Karte auf zielKarte · 2^n (n die Stufen der Tag-Achse, −2,17 EV bei −20°) und teilt durch
// dasselbe E, das den Boden beleuchtet — Belichtung × E ist konstant, ein Licht des Himmels mehr oder weniger ändert den Boden
// nicht (die REF spec/farbe/tag-ref.json hält −2,17 EV bei 0,0963 lx wie bei 0,397 lx; CI swiftshader 29.10.: Boden 27,3 mit,
// 27,0 ohne Sternen-Licht, die Umgebung 0,290 → 0,029). Der Schein „sterne" kann den Boden darum nie mehr schwärzen; der Schein
// „kamera" (Selbsttest) legt die Stufen der Kamera 2 tiefer (linear × 1/4: Luma 27 → ~9 sRGB), die Probe MUSS
// `_dayNightApplyBelichtung` nennen. Das Sternen-Licht selbst wacht die Umgebung (der Himmel folgt dem Sprung, unten), den
// Kontrast der Nacht gate:post-kette (h), die Dämmerung die Tag-Achse.
const S0_NACHT = { nacht: { luma: 22, schwarz: 0.05 } };
function s0NachtUrteil(k, e, soll) {
    const b = [];
    const wann = "um Mitternacht";
    const g = e.grund;
    if (!g) return [`S0 Nacht: kein Boden im Schuss ${wann} — die Probe ist blind`];
    if (g.luma >= soll.luma && g.schwarz <= soll.schwarz) return b;
    const taeter =
        e.stern == null || !(e.stern > 0)
            ? `der Himmel der Nacht trägt kein eigenes Licht (Sternen-Licht ${e.stern}, \`_atmoSternenLicht\` über ` +
              "`ATMO_GESETZ.nacht.himmel`): nur der Mond streut"
            : `der Himmel trägt Licht (Sternen-Licht ${e.stern}, Umgebung ${e.himmel}), das Bild schwärzt es — die Belichtung ` +
              "der Nacht (`_dayNightApplyBelichtung`) oder die Post-Kette (Kontrast 25c, gate:post-kette (h))";
    b.push(
        `S0 Nacht: der Boden 1–3 m ohne das Feuer ${wann} trägt Luma ${g.luma}, abgesoffen ${(100 * g.schwarz).toFixed(1)} % ` +
            `(Soll ≥ ${soll.luma} und ≤ ${(100 * soll.schwarz).toFixed(1)} %, die Nacht der EINEN Licht-Kette) — ${taeter}`
    );
    return b;
}
const S0_FRIST_S = Math.max(30, Number(opt("--frist", 170)) || 170);
async function lichtLauf() {
    const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
    const ECHT = argv.includes("--echt");
    const HOLZ = opt("--holz", "kienspan");
    const BILD = opt("--bild", null);
    const t0 = Date.now();
    const bis = t0 + S0_FRIST_S * 1000;
    const zeit = (was) => console.log(`    · ${was} nach ${Math.round((Date.now() - t0) / 1000)} s`);
    // je Phase der Rest der EINEN Uhr: die Seite bekommt ihn mit (`rest`), der Lauf wartet höchstens so lange
    let phaseJetzt = "Start";
    const phase = async (name, fn) => {
        phaseJetzt = name;
        const rest = bis - Date.now();
        let uhrwerk = null;
        try {
            return await Promise.race([
                fn(Math.max(0, rest)),
                new Promise((_, nein) => {
                    uhrwerk = setTimeout(() => nein(new Error("FRIST")), Math.max(0, rest));
                }),
            ]);
        } finally {
            clearTimeout(uhrwerk);
        }
    };
    await server.lausche(PORT);
    const browser = await starteBrowser({
        art: ECHT ? "echt" : "linse",
        headless: !ECHT,
        frist: (S0_FRIST_S + 60) * 1000,
        viewport: ECHT ? null : { width: 640, height: 360 },
        zusatz: ECHT ? ["--window-size=1280,800"] : [],
    });
    const { adapterZeile } = require("./lib/software-gpu.cjs");
    const adapter = await adapterZeile(browser);
    const ende = async (befund) => {
        console.log(`\n⛔ S0 BILD ROT: ${befund} (${Math.round((Date.now() - t0) / 1000)} s)\n`);
        await browser.close().catch(() => {});
        server.close();
        process.exit(1);
    };
    const page = await browser.newPage();
    // der Speicher fällt vor dem ersten Skript des ERSTEN Ladens (ein Laden weniger als Laden → Löschen → Neu laden)
    await page.evaluateOnNewDocument(() => {
        try {
            if (!sessionStorage.getItem("__s0Leer")) {
                localStorage.clear();
                sessionStorage.setItem("__s0Leer", "1");
            }
        } catch {
            /* */
        }
    });
    // die Stille bis zum Schuss (oben): `_loopRender` ruht, solange `__s0Still` steht — in jedem Laden ab dem ersten Skript
    await page.evaluateOnNewDocument(() => {
        window.__s0Still = true;
        const warte = setInterval(() => {
            // die Klasse steht ab der ersten Stamm-Datei, ihre Glieder tragen erst die Naht-Rufe auf: gewartet wird auf das
            // Glied selbst — ein vorher gesetztes `_loopRender` wäre ein Zwilling, an dem die Naht laut bricht
            // eslint-disable-next-line no-undef
            const K = typeof AnazhRealm === "function" ? AnazhRealm : null;
            if (!K || typeof K.prototype._loopRender !== "function") return;
            clearInterval(warte);
            const zeichne = K.prototype._loopRender;
            K.prototype._loopRender = function (t) {
                if (window.__s0Still) return undefined;
                return zeichne.call(this, t);
            };
        }, 1);
    });
    const url = `http://127.0.0.1:${PORT}/index.html?holz=${HOLZ}`;
    const json = JSON.parse(fs.readFileSync(BUEHNE_DATEI, "utf8"));
    const ergebnis = {};
    const himmel = {}; // der Himmel folgt dem Sprung (oben `himmelProbe`): sauber und — im Selbsttest — der taube Maler
    let wache = null; // der Schein der Wache (Selbsttest): das Urteil über ein Werk, das ein benannter Rufer räumte
    try {
        await phase("Laden", async (rest) => {
            await page.goto(url, { waitUntil: "domcontentloaded", timeout: rest });
            const id = await page.evaluate(
                async (json) => {
                    await window.__weltDa((w) => w.importWorldBeside);
                    if (!r || !r.importWorldBeside) return null;
                    const res = r.importWorldBeside(json);
                    if (!res.ok) return null;
                    r.activeWorldSet(res.worldId);
                    return res.worldId;
                },
                json,
                rest
            );
            if (!id) throw new Error("die Bühne ließ sich nicht importieren");
            zeit("die Bühne importiert");
            await page.reload({ waitUntil: "domcontentloaded", timeout: Math.max(1, bis - Date.now()) });
        });
        await phase("Boot", async () => {
            const b = await booteWelt(page);
            if (!b.ok) throw new Error("Boot nicht bereit nach 120 s");
            zeit("die Bühne gebootet");
            await page.evaluate(AUSGABE_INSTALL);
            await page.evaluate(S0_NAH_INSTALL);
            await page.evaluate(S0_GESTALT_INSTALL);
        });
        for (const taub of SELBSTTEST ? [false, true] : [false]) {
            himmel[taub ? "taub" : "sauber"] = await phase(taub ? "Himmel taub" : "Himmel", () => himmelProbe(page, taub));
            zeit(taub ? "der Himmel des tauben Malers gemessen" : "der Himmel nach dem Sprung gemessen");
        }
        // der Satz des Menschen, bis die Welt ihn trägt (direkt nach dem Boot lädt das Gesetzbuch noch) — und die Gestalt
        // der Feuerstelle (der Bau der Foundry), ehe der Schuss misst
        for (const [name, gestalt] of [
            ["Satz", false],
            ["Gestalt", true],
        ]) {
            const fehler = await phase(name, (rest) =>
                page.evaluate(
                    async (st, gestalt) => {
                        const s = r.state;
                                                s.renderer.setAnimationLoop(null);
                        let laengsterTakt = 0; // der längste Takt dieser Phase (ms): hielt ein Takt die Seite an, steht er im Urteil
                        const takt = async (n) => {
                            for (let i = 0; i < n; i++) {
                                const t = performance.now();
                                try {
                                    r._gameLoopTick(t);
                                } catch {
                                    /* ein Takt-Fehler zählt der Page-Error */
                                }
                                laengsterTakt = Math.max(laengsterTakt, performance.now() - t);
                                await sleep(16);
                            }
                        };
                        if (!gestalt) {
                            window.__buehne();
                            // am Rand des Genesis-Platzes, zwischen zwei Toren (K52: die Scheibe liegt auf dem Grund der Station)
                            const A0 = r.constructor.GENESIS_PLATZ;
                            const w0 = Math.PI / 10;
                            const sx = st.x + (A0.ringR + A0.rand + 2) * Math.cos(w0);
                            const sz = st.z + (A0.ringR + A0.rand + 2) * Math.sin(w0);
                            const y0 = r.getTerrainHeightAt(sx, sz);
                            s.playerMesh.position.set(sx, y0 + 1, sz);
                            const vor = new Set(s.architectures);
                            const pm = s.playerMesh.position;
                            let feuer = null;
                            for (const weiter = window.__deckel("die Feuerstelle", 3000); !feuer && weiter(); ) {
                                const halt = s.weatherEffectTime;
                                s.weatherEffectTime = 0; // der Satz geht durch den Mess-Halt (der Akt ist die Probe)
                                try {
                                    r.dslRun(["spawn_studio", "feuerstelle", ["near_player", 3], 1], { source: "human" });
                                } finally {
                                    s.weatherEffectTime = halt;
                                }
                                await takt(20);
                                feuer = s.architectures.find(
                                    (e) =>
                                        !vor.has(e) &&
                                        e.position &&
                                        r._glutFlaeche(e) > 0 &&
                                        Math.hypot(e.position.x - pm.x, e.position.z - pm.z) < 8
                                );
                            }
                            window.__s0Feuer = feuer;
                            window.__s0Wache = feuer; // wer sie ab jetzt aus der Welt nimmt, steht im Urteil beim Namen
                            return feuer ? null : "die Feuerstelle steht nicht (der Satz `spawn_studio feuerstelle`)";
                        }
                        // DIE GESTALT, die der Schuss liest: die Feuerstelle gebaut (ein Mesh oder ein Slot im Instanz-Pool,
                        // `_archIsRendered`) und ihr Boden gemesht (der Boden-Teil des EINEN Weltbild-Urteils `_weltbildFehlt`:
                        // der Ring bis `RING_EXIST_FLOOR`; der Schuss misst den Boden im Feuerkreis, nie die Streu).
                        // Das Urteil (`__s0Gestalt`) nennt den Täter: fiel sie aus der Welt, bricht die Linse sofort ab.
                        const feuer = window.__s0Feuer;
                        let fehlt = [];
                        for (const weiter = window.__deckel("die Feuerstelle und ihr Boden", 3000); weiter(); ) {
                            const u = window.__s0Gestalt(feuer);
                            if (u.fiel) return `die Feuerstelle fiel aus der Welt (${u.fiel}) — sie wächst nie mehr`;
                            fehlt = u.fehlt;
                            if (!fehlt.length) return null;
                            await takt(5);
                        }
                        return (
                            `die Feuerstelle und ihr Boden standen nicht in der Frist (${fehlt.join(" · ")}) — ` +
                            `${window.__s0FoundryLage(feuer)} · längster Takt ${Math.round(laengsterTakt)} ms`
                        );
                    },
                    S0,
                    gestalt,
                    rest
                )
            );
            if (fehler) {
                ergebnis.sauber = { fehler };
                break;
            }
            zeit(gestalt ? "die Gestalt steht" : "der Satz steht");
        }
        // DER SCHEIN DER WACHE: ein Werk fällt durch einen benannten Rufer — das Urteil MUSS ihn nennen (ohne Wache stand
        // 158 s lang nur „die Feuerstelle wächst"). Ein zweites Werk 60 m abseits, die Feuerstelle des Schusses bleibt.
        if (SELBSTTEST && !ergebnis.sauber)
            wache = await phase("Schein Wache", () =>
                page.evaluate(() => {
                    const p = window.__s0Feuer.position;
                    const x = p.x + 60;
                    const z = p.z;
                    const e = r.spawnArchitecture(
                        "glutbrunnen",
                        { x, y: r.getTerrainHeightAt(x, z) + 0.5, z },
                        { precise: true, seed: 4711 }
                    );
                    if (!e) return { fehler: "kein Werk für den Schein" };
                    const wache = window.__s0Wache;
                    window.__s0Wache = e;
                    function selbstScheinRaeumt(x) {
                        r.removeArchitecture(x);
                    }
                    selbstScheinRaeumt(e);
                    window.__s0Wache = wache;
                    return window.__s0Gestalt(e);
                })
            );
        // die Schüsse: das Feuer um Mitternacht (sauber), die Nacht ohne das Feuer (`S0_NACHT`, unten) — und im
        // Selbsttest das Feuer bis K11b, die Nacht unter der Kamera 2 Stufen tiefer und das Auge des Tages. Die Nacht ohne Feuer ist
        // zugleich der Schein „der Pool leer" (der Kreis fällt ohne das Feuer): EIN Schuss, zwei Urteile
        const schuesse = ergebnis.sauber ? [] : [false, "nacht", ...(SELBSTTEST ? ["farbe", "kamera", "tag"] : [])];
        for (const schein of schuesse) {
            ergebnis[schein || "sauber"] = await phase(schein ? "Schuss " + schein : "Schuss", () =>
                page.evaluate(async (schein, nahM, palette) => {
                    const s = r.state;
                    const T = window.THREE;
                    const rend = s.renderer;
                    // der Pfad des Spielers: der Himmel folgt dem Sprung, frisch gemalt (die Umgebung der Nacht trägt ihr Licht) —
                    // ohne Schutz: fehlt ein Glied, wirft der Schuss beim Namen
                    const uhr = async (t) => {
                        if (r.setTimeOfDay(t, "human") !== true) throw new Error("S0 Schuss: die Uhr nimmt den Spieler nicht (" + t + ")");
                        await s._skyEnvLesung;
                        await r._himmelFrisch();
                        r._applyDayNightToScene();
                    };
                    const zeit = 0;
                    const feuer = window.__s0Feuer;
                    const f = feuer.position;
                    const g = f.y - 0.5; // der Boden des Feuers: wo es steht (auf dem Grund oder auf der Genesis-Scheibe, K52)
                    const w = 640;
                    const h = 360;
                    const alt = r._leuchtTakt;
                    const ohneFeuer = schein === "nacht" || schein === "kamera";
                    if (ohneFeuer)
                        r._leuchtTakt = function () {
                            alt.call(this);
                            for (const u of this.state.atmoUniforms.lichtLage) u.value.w = 0;
                        };
                    // der Schein der Kamera: die Stufen der 18-%-Karte 2 tiefer (`_belichtungStufen`, das EINE Glied der Kamera) —
                    // die Uhr unten wendet die Belichtung an (`_dayNightApplyBelichtung`)
                    const AR = r.constructor;
                    const stufenAlt = AR._belichtungStufen;
                    if (schein === "kamera") AR._belichtungStufen = (h, q) => stufenAlt.call(AR, h, q) - 2;
                    // der Farb-Schein: der Platz des Feuers leuchtet wie bis K11b — in der Glut-Palette (sRGB → linear) und mit
                    // der Nacht-Stärke von damals (nacht 12 statt des Datums) — die Farbe des Stoffs statt der Farbtemperatur
                    // der Tag-Schein: das Auge des Tages — die Post-Kette ohne das Auge der Nacht (`nightFactor` 0, volle
                    // Sättigung wie bis K66), über jede Anwendung der Uhr hinweg
                    const tagUhr = r._applyDayNightToScene;
                    if (schein === "tag")
                        r._applyDayNightToScene = function () {
                            tagUhr.call(this);
                            if (this.state.postProcessingUniforms) this.state.postProcessingUniforms.nightFactor.value = 0;
                        };
                    if (schein === "farbe") {
                        const nacht = window.__fachwerkCore.LICHT_GESETZ.feuer.zeit.nacht;
                        const pal = new T.Color().set(palette.hex).multiplyScalar(palette.nacht / nacht);
                        r._leuchtTakt = function () {
                            alt.call(this);
                            const A = this.state.atmoUniforms;
                            for (let k = 0; k < A.lichtLage.length; k++) {
                                const p = A.lichtLage[k].value;
                                const c = A.lichtFarbe[k].value;
                                if (p.w > 0 && Math.hypot(p.x - f.x, p.z - f.z) <= 1.5)
                                    c.set(pal.r * c.x, pal.g * c.x, pal.b * c.x, c.w);
                            }
                        };
                    }
                    const FC = window.__fachwerkCore;
                    const flAlt = FC.lichtFlackern;
                    FC.lichtFlackern = () => 0; // die Flamme steht still (der Schuss misst das Gesetz, nicht den Atem)
                    const cam = s.camera;
                    let auf = null;
                    let himmelL = null;
                    let sternL = null;
                    window.__s0Still = false; // der Schuss zeichnet
                    // die Nah-Bühne (oben): auf swiftshader zeichnet der Schuss die Nähe des Feuers
                    const nahLos = nahM ? window.__s0Nah(new T.Vector3(f.x, g, f.z), nahM) : null;
                    let nahZahl = null;
                    // DIE PROGRAMM-GRÖSSE DES BODENS (K17-3, oben S0_STOFF): je Render-Objekt des Boden-Stoffs das erzeugte Fragment,
                    // das der Schuss übersetzt (der Zustand des Render-Objekts, wie `__shaderKosten`)
                    const bodenWgsl = new Map();
                    const objs = rend._objects;
                    const roh = objs.get;
                    objs.get = function (...a) {
                        const ro = roh.apply(this, a);
                        if (ro && ro.material === s.voxelChunkMaterial) {
                            const st = ro.getNodeBuilderState();
                            if (st && st.fragmentShader) bodenWgsl.set(st.fragmentShader, (bodenWgsl.get(st.fragmentShader) || 0) + 1);
                        }
                        return ro;
                    };
                    try {
                        window.__buehne();
                        await uhr(zeit);
                        cam.position.set(f.x - 2, g + 1.6, f.z);
                        cam.lookAt(f.x, g + 0.2, f.z + 1e-4);
                        cam.updateMatrixWorld(true);
                        // die Plätze des Pools blenden in LICHT_POOL.blendeS ein: die Wand-Uhr läuft, ehe der Schuss misst
                        await sleep(1000 * r.constructor.LICHT_POOL.blendeS + 100);
                        // der Satz „messung" (K32, scripts/lib/abnahme-urteil.cjs): der Schuss ist ein Mess-Frame der Nacht — sein
                        // Urteil liest den Kreis um das Feuer (kreis, ton) aus den Pixeln; die Belichtungs-Zeile des Beweis-Satzes
                        // (Tag-Bühne, abgesoffen ≤ 60 %) warf hier an der Mitternacht (schwarz 71,9 %, Kreis hell)
                        // der Schein übersetzt nichts (dieselben Programme, nur Uniform-Werte): EINE Aufnahme mit ihren 32 Warm-Frames
                        for (let i = 0; i < (schein ? 1 : 2); i++) {
                            r._schattenAlleNeu();
                            auf = await window.__ausgabeAufnahme(w, h, 1, { satz: "messung" });
                        }
                        // das Licht des Himmels im Schuss (der Täter der Nacht beim Namen): die Bestrahlung der Umgebung von oben
                        // und das Sternen-Licht der EINEN Atmosphäre (Zenit-Leuchtdichte, Welt-Einheiten) bei der Sonne des Schusses
                        const L3 = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
                        const env = r._himmelsIrradianz();
                        const sonneY = r._dayNightSunDirection(r._sonnenWinkel(s.timeOfDay)).y;
                        himmelL = env ? +(Math.PI * L3(env.oben)).toFixed(4) : null;
                        sternL = +L3(r._atmoSternenLicht(sonneY)).toFixed(4);
                    } finally {
                        r._leuchtTakt = alt;
                        if (schein === "tag") {
                            delete r._applyDayNightToScene;
                            r._applyDayNightToScene();
                        }
                        FC.lichtFlackern = flAlt;
                        objs.get = roh;
                        if (nahLos) nahZahl = nahLos();
                        if (schein === "kamera") {
                            AR._belichtungStufen = stufenAlt;
                            r._applyDayNightToScene();
                        }
                    }
                    const u8 = auf.u8;
                    const lum = (i) => (0.2126 * u8[i] + 0.7152 * u8[i + 1] + 0.0722 * u8[i + 2]) / 255;
                    const v = new T.Vector3();
                    // je Ring rr (m) um die Feuerstelle 24 Winkel: der Boden-Punkt im Bild, je der 3×3 Pixel um ihn fn(i)
                    const ringe = (radien, fn) => {
                        for (const rr of radien)
                            for (let a = 0; a < 24; a++) {
                                const x = f.x + rr * Math.cos((a / 24) * 2 * Math.PI);
                                const z = f.z + rr * Math.sin((a / 24) * 2 * Math.PI);
                                v.set(x, r._voxelSurfaceY(x, z) + 0.02, z).project(cam);
                                if (v.z > 1 || Math.abs(v.x) > 0.98 || Math.abs(v.y) > 0.98) continue;
                                const sx = Math.round((v.x * 0.5 + 0.5) * (w - 1));
                                const sy = Math.round((0.5 - v.y * 0.5) * (h - 1));
                                for (let dy = -1; dy <= 1; dy++)
                                    for (let dx = -1; dx <= 1; dx++) fn(((sy + dy) * w + sx + dx) * 4);
                            }
                    };
                    let lk = 0;
                    let nk = 0;
                    ringe([0.75, 1.25, 1.75], (i) => {
                        lk += lum(i);
                        nk++;
                    });
                    // DER FARBTON DES FEUERS: der Boden 1–3 m um die Feuerstelle (5 Ringe × 24 Winkel, 3×3 Pixel), die
                    // mittlere Farbe der Ausgabe — Farbton (Grad) und Sättigung (HSV: (max − min) / max)
                    // — derselbe Boden misst ohne das Feuer die Nacht (`S0_NACHT`): Luma (0–255) und der Anteil abgesoffen (< 4,
                    // wie `bildMasse` der Abnahme)
                    const rgb = [0, 0, 0];
                    let nt = 0;
                    let bl = 0;
                    let bs = 0;
                    ringe([1, 1.5, 2, 2.5, 3], (i) => {
                        for (let c = 0; c < 3; c++) rgb[c] += u8[i + c] / 255;
                        const l = 255 * lum(i);
                        bl += l;
                        if (l < 4) bs++;
                        nt++;
                    });
                    let ton = null;
                    if (nt) {
                        const [R, G, B] = rgb.map((c) => c / nt);
                        const mx = Math.max(R, G, B);
                        const mn = Math.min(R, G, B);
                        const dl = mx - mn;
                        let hue = 0;
                        if (dl > 0)
                            hue = mx === R ? 60 * (((G - B) / dl + 6) % 6) : mx === G ? 60 * ((B - R) / dl + 2) : 60 * ((R - G) / dl + 4);
                        ton = {
                            hue: +hue.toFixed(1),
                            sat: +(mx > 0 ? dl / mx : 0).toFixed(3),
                            rgb: [R, G, B].map((c) => Math.round(c * 255)),
                            punkte: nt / 9,
                        };
                    }
                    const pool = (r._leuchtPool && r._leuchtPool.plaetze) || [];
                    // die Programme und Pipelines (ein Wechsel der Plätze baut keins: Pool voll und leer zählen gleich)
                    const PL = rend._pipelines;
                    const zaehl =
                        PL && PL.programs
                            ? [PL.programs.vertex.size, PL.programs.fragment.size, PL.caches ? PL.caches.size : null]
                            : null;
                    const eigen = pool.find((p) => Math.hypot(p.x - f.x, p.z - f.z) <= 1.5);
                    return {
                        himmel: himmelL,
                        stern: sternL,
                        kreis: nk ? +(lk / nk).toFixed(4) : null,
                        punkte: nk / 9,
                        ton,
                        grund: nt ? { luma: +(bl / nt).toFixed(1), schwarz: +(bs / nt).toFixed(3) } : null,
                        uhr: +zeit.toFixed(4),
                        lichtFarbe: eigen ? eigen.farbe.map((c) => +(c / Math.max(...eigen.farbe)).toFixed(3)) : null,
                        kelvin: FC.LICHT_GESETZ.feuer.kelvin == null ? null : FC.LICHT_GESETZ.feuer.kelvin,
                        belichtung: +rend.toneMappingExposure.toFixed(3),
                        nacht: s.postProcessingUniforms ? +s.postProcessingUniforms.nightFactor.value.toFixed(3) : null,
                        pool: pool.map((p) => ({ q: p.quelle, I: +p.staerke.toFixed(2), d: +Math.hypot(p.x - f.x, p.z - f.z).toFixed(1) })),
                        feuer: [feuer.type, ...[f.x, g, f.z].map((x) => +x.toFixed(2))],
                        dc: auf.info && auf.info.drawCalls,
                        nah: nahZahl,
                        zaehl,
                        boden: [...bodenWgsl.keys()],
                        png: window.__png(u8, w, h),
                    };
                }, schein, ECHT ? 0 : S0_NAH_M, S0_TON.palette)
            );
            zeit(schein ? `der Schuss (${schein}) aufgenommen` : "das Feuer aufgenommen");
        }
    } catch (e) {
        if (e && e.message === "FRIST")
            await ende(
                `die Frist von ${S0_FRIST_S} s riss in der Phase „${phaseJetzt}" — der Deckel der Linse (≤ 3 min CI) hält nicht`
            );
        throw e;
    }
    // das Beweisbild der Figur (nur mit `--bild`, kein Urteil): ein Wolf 2,3 m neben dem Feuer, der Spieler gegenüber, das Auge
    // 5 m zurück — die Figur im Licht des Pools; dazu das Feuer aus 6 m (K11b: der Lichtkreis und sein Saum)
    if (BILD && ergebnis.sauber && !ergebnis.sauber.fehler) {
        const pngs = await page.evaluate(async (nahM) => {
            const s = r.state;
            const f = window.__s0Feuer.position;
            const g = (x, z) => r._voxelSurfaceY(x, z);
            const wolf = r.spawnCreatureAt(f.x, g(f.x, f.z - 2.3) + 0.5, f.z - 2.3, "calm", "wolf", { precise: true, bodySize: 1 });
            if (window.__tiereHalten) window.__tiereHalten();
            s.playerMesh.position.set(f.x + 2.3, g(f.x + 2.3, f.z) + 1, f.z);
            const cam = s.camera;
            window.__buehne();
            r.setTimeOfDay(0, "human"); // der Pfad des Spielers: der Himmel folgt dem Sprung
            cam.position.set(f.x - 3.6, g(f.x, f.z) + 1.8, f.z - 3.8);
            cam.lookAt(f.x + 0.6, g(f.x, f.z) + 0.6, f.z - 0.6);
            cam.updateMatrixWorld(true);
            await sleep(700);
            let auf = null;
            // die Figuren im Licht des Pools zeichnen mit (der Feuerkreis allein läse sie nicht)
            const nahLos = nahM
                ? window.__s0Nah(new window.THREE.Vector3(f.x, g(f.x, f.z), f.z), nahM, [wolf, s.playerMesh].filter(Boolean))
                : null;
            try {
                for (let i = 0; i < 2; i++) {
                    r._schattenAlleNeu();
                    auf = await window.__ausgabeAufnahme(960, 540, 1);
                }
            } finally {
                if (nahLos) nahLos();
            }
            const bild = (a) => window.__png(a.u8, 960, 540);
            const figur = bild(auf);
            if (wolf) r.removeCreature(wolf);
            cam.position.set(f.x - 6, g(f.x - 6, f.z) + 1.7, f.z);
            cam.lookAt(f.x, g(f.x, f.z) + 0.3, f.z + 1e-4);
            cam.updateMatrixWorld(true);
            await sleep(700);
            const nahLos6 = nahM ? window.__s0Nah(new window.THREE.Vector3(f.x, g(f.x, f.z), f.z), nahM + 6) : null;
            try {
                for (let i = 0; i < 2; i++) {
                    r._schattenAlleNeu();
                    auf = await window.__ausgabeAufnahme(960, 540, 1);
                }
            } finally {
                if (nahLos6) nahLos6();
            }
            return { figur, sechs: bild(auf) };
        }, ECHT ? 0 : S0_NAH_M);
        pngDatei(BILD.replace(/\.png$/, "") + "-figur.png", pngs.figur);
        pngDatei(BILD.replace(/\.png$/, "") + "-6m.png", pngs.sechs);
    }
    await browser.close();
    server.close();
    const befunde = [];
    const sauber = ergebnis.sauber;
    for (const [k, e] of Object.entries(ergebnis)) {
        if (e.fehler) {
            befunde.push(`S0 Bild (${k}): ${e.fehler}`);
            continue;
        }
        if (BILD) pngDatei(BILD.replace(/\.png$/, "") + (k === "sauber" ? "" : "-" + k) + ".png", e.png);
        delete e.png;
        const wer = {
            sauber: "      ",
            nacht: "NACHT (ohne das Feuer)",
            farbe: "SCHEIN (das Feuer bis K11b)",
            kamera: "SCHEIN (die Kamera der Nacht 2 Stufen tiefer)",
            tag: "SCHEIN (das Auge des Tages)",
        }[k];
        console.log(
            `  S0 BILD ${wer}: Uhr ${e.uhr} · Feuerkreis aus 2 m Luma ${e.kreis} (${e.punkte} Punkte, Soll ≥ ${S0_LUMA_2M}) · Boden 1–3 m Luma ${e.grund && e.grund.luma} abgesoffen ${e.grund && e.grund.schwarz} Farbton ${e.ton && e.ton.hue}° Sättigung ${e.ton && e.ton.sat} sRGB ${JSON.stringify(e.ton && e.ton.rgb)} (Soll ${S0_TON.hue[0]}–${S0_TON.hue[1]}°, ≤ ${S0_TON.satMax}) · Himmel ${e.himmel} Sternen-Licht ${e.stern} · Lichtfarbe linear ${JSON.stringify(e.lichtFarbe)} · kelvin ${e.kelvin} · Belichtung ${e.belichtung} · Feuer ${JSON.stringify(e.feuer)} · Pool ${JSON.stringify(e.pool)} · Befehle ${e.dc} · Nah-Bühne ${JSON.stringify(e.nah)} · Programme/Pipelines ${JSON.stringify(e.zaehl)}`
        );
    }
    // DIE NACHT ohne das Feuer (oben `S0_NACHT`)
    for (const k of ["nacht"])
        if (sauber && !sauber.fehler) {
            const e = ergebnis[k];
            if (!e) befunde.push(`S0 Nacht (${k}): der Schuss lief nicht`);
            else if (!e.fehler) befunde.push(...s0NachtUrteil(k, e, S0_NACHT[k]));
        }
    for (const [k, e] of Object.entries(himmel))
        for (const h of e.himmel)
            console.log(
                `  S0 HIMMEL${k === "taub" ? " SCHEIN (der Maler taub)" : ""}: nach dem Sprung auf ${h.uhr === 0 ? "Mitternacht" : "Mittag"} ` +
                    `Umgebung ${h.sprung} · Himmel des Orts ${h.ort} · ${h.gemalt ? "gemalt" : "UNGEMALT"}`
            );
    if (himmel.sauber) befunde.push(...himmel.sauber.befunde);
    else befunde.push("S0 Himmel: die Probe lief nicht");
    if (sauber && !sauber.fehler && !(sauber.kreis >= S0_LUMA_2M))
        befunde.push(
            `S0 Bild: der Feuerkreis aus 2 m trägt Luma ${sauber.kreis} (Soll ≥ ${S0_LUMA_2M}) — das Licht der Feuerstelle ` +
                "(fachwerk LICHT_GESETZ.feuer über `_leuchtStaerke` in den Licht-Pool `_lichtPoolTerm`) trägt den Boden nicht"
        );
    const ton = s0Ton(sauber, ergebnis.nacht);
    if (sauber && !sauber.fehler) console.log(`  S0 TON (Farbton netto: mit minus ohne Feuer · Sättigung brutto): ${JSON.stringify(ton)}`);
    if (sauber && !sauber.fehler && !s0TonPasst(ton))
        befunde.push(
            `S0 Bild: das Licht des Feuers trägt den Boden 1–3 m im Farbton ${ton && ton.hue}° (netto, ohne die Nacht), das Auge sieht ihn ` +
                `bei Sättigung ${ton && ton.sat} (Soll ${S0_TON.hue[0]}–${S0_TON.hue[1]}°, Sättigung ≤ ${S0_TON.satMax}) — die Lichtfarbe des Feuers (linear ${JSON.stringify(sauber.lichtFarbe)}) ` +
                (sauber.kelvin == null
                    ? "ist die Glut-Palette des Datums (fachwerk LICHT_GESETZ.feuer `farbe`), keine Farbtemperatur (`kelvin` fehlt)"
                    : `aus ${sauber.kelvin} K (fachwerk LICHT_GESETZ.feuer \`kelvin\` über \`lichtFarbe\`) mit ihrem Abfall (\`lichtAbfall\`), gesehen mit dem Auge der Nacht (\`NACHT_AUGE\`, \`nightFactor\` ${sauber.nacht})`)
        );
    if (sauber && !sauber.fehler) {
        const progs = sauber.boden || [];
        if (!progs.length)
            befunde.push(
                "S0 Boden-Programm: der Schuss zeichnet kein Programm des Boden-Stoffs (`voxelChunkMaterial`) — die Linse ist blind"
            );
        progs.forEach((wgsl, i) => {
            const u = S0_STOFF.urteil(wgsl);
            console.log(`  S0 BODEN-PROGRAMM ${i + 1}/${progs.length}: ${u.zeichen} Zeichen WGSL (Decke ${S0_STOFF.decke})`);
            befunde.push(...u.rot);
            const aus = opt("--wgsl", null);
            if (aus) fs.writeFileSync(aus.replace(/(\.wgsl)?$/, i ? `-${i + 1}.wgsl` : ".wgsl"), wgsl);
        });
    }
    // DIE WAND DER NAH-BÜHNE: kein Satz zeichnet im Schuss eine Zelle jenseits der Kugel (sonst übersetzt der Schuss die Stoffe
    // der Welt, nicht die des Feuers)
    const s0Jenseits = (e) => Object.entries((e && e.nah && e.nah.jenseits) || {});
    const s0Liste = (o) =>
        Object.entries(o || {})
            .map(([k, n]) => `${k} ${n}`)
            .join(" · ");
    if (sauber && !sauber.fehler && sauber.nah && Object.keys(sauber.nah.fremd || {}).length)
        befunde.push(
            `S0 Nah-Bühne: der Schuss zeichnet, was der Feuerkreis nicht liest (${s0Liste(sauber.nah.fremd)}) — jeder fremde Stoff ` +
                "übersetzt sein Programm im Schuss, und was davon steht, entscheidet das Rennen der Welt bis zum Schuss"
        );
    if (sauber && !sauber.fehler && sauber.nah && s0Jenseits(sauber).length)
        befunde.push(
            `S0 Nah-Bühne: der Schuss zeichnet Zellen jenseits der Kugel von ${S0_NAH_M} m (${s0Jenseits(sauber)
                .map(([k, n]) => `${k} ${n}`)
                .join(" · ")}) — die Wahl je Pass (\`_passTrifft\`) trägt die Kugel nicht, jeder Stoff der Welt im Blick übersetzt sein Programm`
        );
    let pass = befunde.length === 0;
    for (const bf of befunde) console.log(`    ⛔ ${bf}`);
    if (SELBSTTEST) {
        const sc = ergebnis.nacht;
        const getroffen = sc && !sc.fehler && sc.kreis < S0_LUMA_2M && sauber && sc.kreis < sauber.kreis;
        console.log(
            `  SELBSTTEST S0 BILD (der Pool leer): ${getroffen ? `getroffen — der Kreis fällt ${sauber.kreis} → ${sc.kreis} (unter ${S0_LUMA_2M}): der Licht-Pool trägt ihn` : "BLIND"}`
        );
        const fb = ergebnis.farbe;
        // das Feuer bis K11b reißt am Farbton (netto), das Auge des Tages an der Sättigung (brutto) bei Farbton im Band
        const fbTon = !!fb && !fb.fehler ? s0Ton(fb, ergebnis.nacht) : null;
        const farbGetroffen = !!fbTon && !s0TonImBand(fbTon);
        console.log(
            `  SELBSTTEST S0 BILD (das Feuer bis K11b, Glut-Palette und nacht 12): ${farbGetroffen ? `getroffen — das Licht des Feuers fällt netto auf Farbton ${fbTon.hue}°: die Farbtemperatur trägt ihn` : "BLIND " + JSON.stringify(fbTon)}`
        );
        const tg = ergebnis.tag;
        const tgTon = !!tg && !tg.fehler ? s0Ton(tg, ergebnis.nacht) : null;
        const tagGetroffen = s0TonImBand(tgTon) && !(tgTon.sat <= S0_TON.satMax);
        console.log(
            `  SELBSTTEST S0 BILD (das Auge des Tages, wie bis K66): ${tagGetroffen ? `getroffen — der Boden 1–3 m reißt an der Sättigung ${tgTon.sat} (Soll ≤ ${S0_TON.satMax}) bei Farbton ${tgTon.hue}° netto im Band: das Auge der Nacht trägt ihn` : "BLIND " + JSON.stringify(tgTon)}`
        );
        const prog = sauber && !sauber.fehler && sauber.boden && sauber.boden[0];
        const gross = prog ? S0_STOFF.urteil(prog, prog.length - 1) : null;
        const grossGetroffen = !!gross && gross.rot.length === 1;
        console.log(
            `  SELBSTTEST S0 PROGRAMM-GRÖSSE (die Decke ein Zeichen unter dem Boden-Programm): ${grossGetroffen ? `getroffen — ${gross.rot[0].split(" — ")[0]}` : "BLIND"}`
        );
        const nb = (sauber && !sauber.fehler && sauber.nah) || {};
        const vers = Object.keys(nb.versetzt || {});
        const nahGetroffen = vers.length > 0;
        console.log(
            `  SELBSTTEST S0 NAH-BÜHNE (die Kugel 1 km versetzt): ${nahGetroffen ? `getroffen — jenseits ${s0Liste(nb.versetzt)}` : "BLIND"}`
        );
        const ohne = Object.keys(nb.fremdOhneLesen || {});
        const liesGetroffen = ohne.includes("bodenSatz") && ohne.some((k) => k.startsWith("bauSatz("));
        console.log(
            `  SELBSTTEST S0 NAH-BÜHNE (der Feuerkreis liest nichts): ${liesGetroffen ? `getroffen — fremd ${s0Liste(nb.fremdOhneLesen)}` : "BLIND"}`
        );
        const wa = wache;
        const wacheGetroffen = !!wa && !wa.fehler && typeof wa.fiel === "string" && wa.fiel.includes("selbstScheinRaeumt");
        console.log(
            `  SELBSTTEST S0 WACHE (ein Werk fällt durch einen benannten Rufer): ${wacheGetroffen ? `getroffen — das Urteil nennt ${wa.fiel}` : "BLIND " + JSON.stringify(wa)}`
        );
        const hb = (himmel.taub && himmel.taub.befunde) || [];
        const taubGetroffen = hb.some((b) => /^S0 Himmel: nach dem Sprung auf Mitternacht .*`_ensureSkyEnvironment`/.test(b));
        console.log(
            `  SELBSTTEST S0 HIMMEL (der Maler taub): ${taubGetroffen ? `getroffen — ${hb.find((b) => /Mitternacht/.test(b)).split(" — ")[0]}` : "BLIND " + JSON.stringify(hb)}`
        );
        const st = ergebnis.kamera;
        const kameraTreffer =
            st && !st.fehler ? s0NachtUrteil("nacht", st, S0_NACHT.nacht).find((b) => /`_dayNightApplyBelichtung`/.test(b)) : null;
        console.log(
            `  SELBSTTEST S0 NACHT (die Kamera der Nacht 2 Stufen tiefer): ${kameraTreffer ? "getroffen — " + kameraTreffer.split(" — ")[0] + " — " + kameraTreffer.split(" — ")[1].slice(0, 60) : "BLIND " + JSON.stringify(st && (st.grund || st.fehler))}`
        );
        pass =
            pass && getroffen && farbGetroffen && tagGetroffen && grossGetroffen && nahGetroffen && liesGetroffen && wacheGetroffen;
        pass = pass && taubGetroffen && !!kameraTreffer;
    }
    console.log(
        `\n${pass ? "✅" : "⛔"} S0 BILD ${pass ? "GRÜN: die Feuerstelle trägt den Feuerkreis aus 2 m in der Ausgabe" : "ROT"} (${Math.round((Date.now() - t0) / 1000)} s, ${ECHT ? "echte GPU" : adapter.fehlt || adapter.vendor + "/" + adapter.architecture} · Holz ${HOLZ})\n`
    );
    process.exit(pass ? 0 : 1);
}

function zeige(rep) {
    console.log(`\n  ── ${rep.welt.toUpperCase()} · Erbgut [${rep.erbgut.join(", ")}]${rep.schein ? " · SCHEIN" : ""}`);
    for (const w of rep.wuerfe)
        console.log(
            `    ${w.zuwachs > 0 ? "WURF " : "—    "} ${w.op.padEnd(16)} ${w.quelle.padEnd(11)} +${w.zuwachs} ${
                w.zuwachs > 0 ? JSON.stringify(w.was) : ""
            }${w.grund ? "  (" + w.grund + ")" : ""}`
        );
    console.log(
        `    Akt (human) spawn_blueprint: +${rep.akt.zuwachs} ${JSON.stringify(rep.akt.was)}${rep.akt.grund ? "  (" + rep.akt.grund + ")" : ""}`
    );
    if (!rep.nexus) return;
    console.log(
        `    Nexus-Takt: ${rep.nexus.evolutionen} Evolutionen, Würfe im Pool ${JSON.stringify(rep.nexus.wuerfeImPool)} → Zuwachs +${rep.nexus.zuwachs} ${JSON.stringify(rep.nexus.was)}`
    );
    console.log(`    Zensus ${rep.zensus.R} m: ${JSON.stringify(rep.zensus)}`);
}

hauptLauf(async () => {
    if (argv.includes("--licht")) return lichtLauf();
    await server.lausche(PORT);
    const browser = await starteBrowser({ art: "standard", frist: 900000 });
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        // DER STOFF-ZENSUS: jeder direkt beleuchtete Stoff der Szene (Standard, Physical, Lambert, Phong, Toon — Basic
        // trägt in r184 nur das indirekte Licht) trägt den Licht-Pool (`userData.lichtPool`, `_leuchtStoff`) oder ist Quelle
        window.__stoffZensus = () => {
            const s = r.state;
            const gesehen = new Set();
            const ohne = new Map();
            let lit = 0;
            s.scene.traverse((o) => {
                if (!o.isMesh) return;
                for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
                    if (!m || gesehen.has(m)) continue;
                    gesehen.add(m);
                    if (!/^Mesh(Standard|Physical|Lambert|Phong|Toon|SSS)(Node)?Material$/.test(m.type)) continue;
                    lit++;
                    if (m.userData && m.userData.lichtPool) continue;
                    const name =
                        o.name ||
                        (o.userData && (o.userData.inventar || o.userData.poolKennung)) ||
                        m.type + (m.userData ? "{" + Object.keys(m.userData).slice(0, 3).join(",") + "}" : "");
                    ohne.set(name, (ohne.get(name) || 0) + 1);
                }
            });
            return { beleuchtet: lit, ohnePool: [...ohne.entries()].map(([n, k]) => n + (k > 1 ? " ×" + k : "")) };
        };
    });
    const url = `http://127.0.0.1:${PORT}/index.html`;
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.evaluate(() => {
        try {
            localStorage.clear();
        } catch {
            /* */
        }
    });
    await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });

    console.log("\n========= DIE PRÜFBÜHNE — wo die Wildnis nicht trägt, wirft das Feld nichts =========");
    let rot = false;
    const berichte = {};
    const laeufe = [
        ["standard", false],
        ["buehne", false],
    ];
    if (SELBSTTEST) laeufe.push(["buehne", true]);
    let importiert = false;
    for (const [welt, schein] of laeufe) {
        if (welt === "buehne" && !importiert) {
            const json = JSON.parse(fs.readFileSync(BUEHNE_DATEI, "utf8"));
            // Geboren wie im Spiel: importWorldBeside (Welt-Tor) + aktiv + Reload.
            const id = await page.evaluate((json) => {
                const res = r.importWorldBeside(json);
                if (!res.ok) return null;
                r.activeWorldSet(res.worldId);
                return res.worldId;
            }, json);
            if (!id) throw new Error("die Bühne ließ sich nicht importieren");
            importiert = id;
        }
        if (welt === "buehne") {
            // jeder Bühnen-Lauf auf frischer Bühne (der Schein-Lauf erbt nichts vom sauberen)
            await page.evaluate((id) => {
                r.activeWorldSet(id);
            }, importiert);
            await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });
        }
        const b = await booteWelt(page);
        if (!b.ok) {
            console.log(`  ⛔ Welt ${welt}: Boot nicht bereit nach 120 s`);
            rot = true;
            continue;
        }
        const rep = await probe(page, welt, WUERFE, EVOLUTIONEN, schein);
        rep.schein = schein;
        rep.bootMs = b.ms;
        zeige(rep);
        berichte[welt + (schein ? "-schein" : "")] = rep;
        const wurfe = rep.wuerfe.filter((w) => w.zuwachs > 0);
        if (welt === "standard") {
            // DER STOFF-ZENSUS der Wildnis: jeder beleuchtete Stoff ihrer Häuser, Tiere, Bäume und Wasser trägt den Pool
            const z = await page.evaluate(() => window.__stoffZensus());
            console.log(`    Stoffe der Wildnis: ${z.beleuchtet} beleuchtet, ohne Pool ${z.ohnePool.length ? z.ohnePool.join(", ") : "keiner"}`);
            if (z.ohnePool.length)
                rep.befunde.push(
                    `S0 Stoff ohne Pool (Wildnis): ${z.ohnePool.length} von ${z.beleuchtet} beleuchteten Stoffen tragen den Licht-Pool ` +
                        `nicht (${z.ohnePool.slice(0, 8).join(", ")})`
                );
            // DIE FELD-KONTROLLE: in der Wildnis wirft das Feld — sonst ist die Linse blind
            const bau = wurfe.some((w) => (w.was.bauten || 0) > 0);
            const tier = wurfe.some((w) => (w.was.tiere || 0) > 0);
            if (!bau || !tier) {
                rep.befunde.push(
                    `Kontrolle blind: in der Wildnis warf das Feld ${bau ? "" : "keinen Bau "}${tier ? "" : "kein Tier"}`
                );
            }
            if (rep.akt.zuwachs < 1) rep.befunde.push("der Akt (human) setzte in der Wildnis nichts");
        } else if (!schein) {
            for (const w of wurfe)
                rep.befunde.push(`WURF auf der Bühne: ${w.op} (${w.quelle}) +${w.zuwachs} ${JSON.stringify(w.was)}`);
            if (rep.nexus.zuwachs > 0)
                rep.befunde.push(
                    `der Nexus-Takt warf auf der Bühne +${rep.nexus.zuwachs} ${JSON.stringify(rep.nexus.was)}`
                );
            if (rep.akt.zuwachs < 1)
                rep.befunde.push("der Akt (human) setzte auf der Bühne nichts — das Prädikat hält die Hand");
            const z = rep.zensus;
            const fremd = Object.keys(z.fremdeBauten);
            if (fremd.length) rep.befunde.push(`Zensus: fremde Bauten ${JSON.stringify(z.fremdeBauten)}`);
            for (const k of ["streuZellen", "nahStreu", "inseln", "dorfZellen", "pflanzSchlange", "fluesse"])
                if (z[k]) rep.befunde.push(`Zensus: ${k} ${z[k]}`);
            // die Tiere: nur das gesetzte (der Akt pflanzt einen Baum, kein Tier) — jedes Tier ist ein Wurf
            if (z.tiere) rep.befunde.push(`Zensus: ${z.tiere} Tiere, die niemand setzte`);
            // (5) die Hindernis-Station steht an ihrer Spec
            rep.s4 = await s4Probe(page, S4, null);
            zeigeS4(rep.s4, null);
            for (const f of rep.s4.befunde) rep.befunde.push(`S4 ${f}`);
            // (6) die Feuerstelle im Atrium leuchtet nachts
            rep.s0 = await s0Probe(page, S0, null);
            zeigeS0(rep.s0, null);
            for (const f of rep.s0.befunde) rep.befunde.push(f);
        } else {
            rep.s4 = await s4Probe(page, S4, S4_SCHEIN);
            zeigeS4(rep.s4, S4_SCHEIN);
            rep.s0 = await s0Probe(page, S0, true);
            zeigeS0(rep.s0, true);
        }
        if (!schein) {
            for (const f of rep.befunde) console.log(`    ⛔ ${f}`);
            if (rep.befunde.length) rot = true;
        }
    }
    let selbst = null;
    if (SELBSTTEST && berichte["buehne-schein"]) {
        const s = berichte["buehne-schein"];
        const namen = s.wuerfe.filter((w) => w.zuwachs > 0).map((w) => `${w.op}/${w.quelle}`);
        // die S4-Probe nennt den abgerückten Körper, und nur ihn
        const s4Namen = (s.s4 ? s.s4.befunde : []).map((b) => b.split(":")[0]);
        const s4Soll = S4.koerper.find((k) => k.bauplan === S4_SCHEIN.bauplan).id;
        // die S0-Probe nennt die Glut ohne Datum beim Verzeichnis, die Laterne ohne Datum bei ihrer Gestalt, den Stoff und den
        // Bauer ohne Pool beim Namen
        const s0B = s.s0 ? s.s0.befunde : [];
        const s0Namen = s0B.filter((b) => /^S0 Nacht/.test(b));
        const s0Rest = {
            laterne: s0B.some((b) => /^S0 Laterne: .*`laterne_dorf`/.test(b)),
            stoff: s0B.some((b) => /^S0 Stoff ohne Pool: .*pruef-schein/.test(b)),
            bauer: s0B.some((b) => /^S0 Bauer ohne Pool: .*`_scheinRueckfall`/.test(b)),
        };
        selbst = {
            benannt: namen,
            s4: s4Namen,
            s4Treffer: s4Namen.length === 1 && s4Namen[0] === s4Soll,
            s0Treffer:
                s0Namen.length === 2 &&
                s0Namen.every((b) => /das Verzeichnis nennt die Feuerstelle nicht/.test(b)) &&
                s0Rest.laterne &&
                s0Rest.stoff &&
                s0Rest.bauer,
            s0Rest,
        };
        console.log(
            `\n  SELBSTTEST (die Wildnis trägt zum Schein überall): ${namen.length} Würfe beim Namen — ${namen.join(", ")}`
        );
        console.log(
            `  SELBSTTEST S4 (${S4_SCHEIN.bauplan} rückt ${S4_SCHEIN.dx} m): beim Namen [${s4Namen.join(", ")}] — ${
                selbst.s4Treffer ? "getroffen" : "BLIND"
            }`
        );
        console.log(
            `  SELBSTTEST S0 (Feuer ohne Datum · Laterne ungelesen · Stoff und Bauer ohne Pool): ${selbst.s0Treffer ? "getroffen — " + s0Namen[0] : "BLIND " + JSON.stringify(selbst.s0Rest)}`
        );
    }
    if (JSON_AUS) fs.writeFileSync(JSON_AUS, JSON.stringify({ berichte, selbst }, null, 1));
    let pass;
    if (SELBSTTEST) {
        pass = !rot && selbst && selbst.benannt.length > 0 && selbst.s4Treffer && selbst.s0Treffer;
        console.log(
            `\n${pass ? "✅" : "⛔"} SELBSTTEST ${pass ? "GRÜN: auf der Bühne wirft das Feld nichts, der Akt setzt, die Wildnis wirft — und der Schein fällt rot beim Namen" : "ROT: " + (rot ? "der saubere Lauf ist schon rot" : "der Schein blieb unentdeckt (die Linse ist blind)")}\n`
        );
    } else {
        pass = !rot;
        console.log(
            `\n${pass ? "✅" : "⛔"} ${pass ? "Auf der Bühne wirft das Feld nichts (Würfe 0, Nexus 0, Zensus 0); der Akt setzt, die Wildnis wirft; die Stationen stehen" : "DIE BÜHNE HÄLT IHR GESETZ NICHT (Befunde oben)"}\n`
        );
    }
    await browser.close();
    server.close();
    process.exit(pass ? 0 : 1);
});
