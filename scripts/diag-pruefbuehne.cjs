#!/usr/bin/env node
// gate:pruefbuehne — WO DIE WILDNIS NICHT TRÄGT, WIRFT DAS FELD NICHTS.
//
// Die Prüfbühne (spec/pruefbuehne/welt.json) trägt statt der Wildnis analytische Terme; auf ihr steht nur, was ihre Saat
// und die Linse setzen. Das Feld handelt dort nie: kein Wald, keine Streu, kein ungesetztes Tier — und kein Wurf des
// Nexus (sein Pool `dslComposeAtomic` baut alle 24 s an `far_player`). Diese Linse nennt jeden Wurf beim Namen.
//
// Je Welt (Standard = die Wildnis als FELD-KONTROLLE; Bühne, importiert wie im Spiel) misst sie:
//   (1) DIE WÜRFE: jede Ort-Op der Welt-Akte (Tier, Baum, Studio-Werk, Dorf, Tempel, Wasserfall, Bauplan,
//       Fraktal, Füll-Kugel) mit der Quelle des Feldes — `nexus` und `rule:nexus` — und ihr Zuwachs an Welt-Substanz
//       (Bauten, Tiere, Pflanz-Schlange, Dorf-Zellen, Edits). Bühne: 0 je Op; Wildnis: > 0 (die Linse sieht).
//   (2) DER AKT: dieselbe Op als Mensch (`human`) setzt auch auf der Bühne (das Prädikat hält das Feld, nie die Hand).
//   (3) DER NEXUS-TAKT, getrieben: N Evolutionen (`generateEvolution` + `_loopNexusUpdate`, Wirk-Kraft voll — im Spiel alle
//       24 s eine) und ein Takt, in dem seine Regeln feuern. Bühne: Zuwachs 0.
//   (4) DER ABSENZ-ZENSUS in 300 m nach dem Takt: fremde Bauten, Streu-Zellen, Nah-Streu, Tiere, Dorf-Zellen,
//       Pflanz-Schlange, Flüsse — auf der Bühne 0.
//   (5) DIE S4-PROBE: die Hindernis-Station (`s4-hindernisse` in spec/pruefbuehne/stationen.json — Würfel, Säule, Mauer,
//       Gasse, Hausrumpf 45°, Engpass) steht, gesät über die Snapshot-Tür: je Körper die Blocker-Boxen ≤ 0,1 m an der
//       Spec und im Blocker-Netz. Der Selbsttest rückt die Mauer 0,5 m — die Probe nennt sie, und nur sie.
//   (6) DIE S0-PROBE: die Feuerstelle, die der Mensch im Atrium setzt, leuchtet nachts — mit und ohne Klang
//       ≥ 1 Licht ≤ 10 m (ein Platz des Licht-Pools), Bestrahlung in 2 m ≥ 2× die Nacht; die Laterne eines Plans nachts an,
//       mittags aus; die Fenster-Glut nachts an, mittags aus; JEDER beleuchtete Stoff trägt den Pool (Bauer im Stamm und
//       Stoffe der Szene), EIN Punktlicht-Gesetz, kein Punktlicht der Szene. Der Selbsttest nimmt der Feuerstelle ihr
//       Datum, dem Plan den Leser und schmuggelt einen Stoff und einen Bauer ohne Pool ein — die Probe nennt jeden.
//   (7) DAS BILD DER S0-PROBE (`--licht`, K11 + K11b): echter Renderer, Ausgabe-Pfad — der Feuerkreis aus 2 m (Luma netto: mit minus ohne Pool bei gehaltener Blende) und
//       der Farbton des Lichts des Feuers auf dem Boden 1–3 m (28–45° netto, die Farbtemperatur des Gesetzes) bei der
//       Sättigung, die das Auge der Nacht sieht (≤ 0,75 brutto, K66); `--bild` legt die Bilder der Schüsse ab (die Figur
//       und das Feuer aus 6 m fielen 08.11. ohne Leser). Selbsttest: der Pool leer, das Feuer bis K11b (Glut-Palette, die Stärke des Welt-Feuers), das Auge des Tages. DIE NACHT
//       (D3-2, `S0_NACHT`): derselbe Boden ohne das Feuer um Mitternacht ist lesbar (Luma am Gesetz: Licht je Albedo, abgesoffen).
//       Selbsttest: der Wurf auf dunkles Korn (am Fleck unter der Soll, am Gesetz darüber), der Bruch von z637 (Licht −4 %) und die
//       Kamera der Nacht 2 Stufen tiefer (seit licht.K1 trägt sie die Nacht, nicht das Sternen-Licht). Dazu DER HIMMEL FOLGT DEM SPRUNG (K10, `himmelProbe`): nach Mittag und Mitternacht über
//       den Pfad des Spielers trägt die Umgebung den Himmel des Orts (`_himmelsBestrahlung`). Selbsttest: der Maler taub.
//       Die Dämmerung und die Belichtung über den Tag urteilt die Tag-Achse auf der Karte (gate:tag-achse:echt). Dazu DAS
//       BODEN-PROGRAMM (`S0_MS`): seine Pipeline entstand asynchron; seine Größe (`S0_ZEICHEN`) und die Zeit sind Auskunft.
//
//   node scripts/diag-pruefbuehne.cjs [--json datei] [--evolutionen 60] [--wurzel dir]
//                                                  (`--wurzel` = der Baum eines anderen Stands: vorher ↔ nachher)
//   node scripts/diag-pruefbuehne.cjs --selftest   zusätzlich: auf der Bühne trägt die Wildnis zum Schein überall
//                                                  (`_wildnisTraegt` → true) — die Würfe MÜSSEN rot werden, beim Namen
// Port: PRUEFBUEHNE_PORT (Default 4394). Exit 1 bei einem Wurf auf der Bühne, einem gehaltenen Akt, einer blinden
// Kontrolle, einem Page-Error oder einem roten Selbsttest.
"use strict";
const { statikServer, starteBrowser, hauptLauf, argOpt: opt, pngDatei, booteWelt, path, fs, weltTor, SELBSTTEST, jsonLesen, jsonSchreiben } = require("./lib/welt-boot.cjs");

const argv = process.argv.slice(2);
const JSON_AUS = opt("--json", null);
const EVOLUTIONEN = Math.max(1, Number(opt("--evolutionen", 60)) || 60);
const PORT = Number(process.env.PRUEFBUEHNE_PORT) || 4394;
const BUEHNE_DATEI = path.resolve(__dirname, "..", "spec", "pruefbuehne", "welt.json");
const STATIONEN = jsonLesen("spec/pruefbuehne/stationen.json").stationen;
const S4 = STATIONEN.find((st) => st.id === "s4-hindernisse");
const S0 = STATIONEN.find((st) => st.id === "s0-atrium");
const S4_SCHEIN = { bauplan: "pruef_mauer", dx: 0.5 }; // der Selbsttest: die Mauer rückt 0,5 m

const server = statikServer({ keinCache: true });

// Die Würfe: jede Ort-Op der Welt-Akte in ihrer kanonischen Form (die Orte, die der Nexus selbst wählt).
const WUERFE = [
    ["spawn_creature", ["near_player", 20], 3, "happy"],
    ["spawn_tree", ["far_player", 40, 90], 3],
    ["spawn_studio", "eiche", ["far_player", 40, 90], 2],
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
// (`userData.lichtPool`); EIN Punktlicht-Gesetz (`_lichtPlatz`, der Rumpf des Pools, ruft `_punktLichtBrdf`, kein anderer, kein Szenen-Licht); die
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
// am Feuer (der Schuss aus 2 m, der Boden um die Glut im Bild) schließt die Blende gegen dieselbe Nacht ohne das Feuer mindestens so
// viele Stufen (`_poolAmBild`, sonnenbahn 2; bis dahin unter der Laterne am Auge, nacht-lichter: Radeon 0432dd70 1,22 Stufen, k
// 52 802 → 22 675 — die Kurve der Belichtung steigt mit 0,75 je Stufe Licht; der Messer ohne Pool: 0 Stufen)
const S0_MESSER_EV = 1.0;
// DER POOL WIEGT IN JEDER DUNKLEN NACHT GLEICH (belichtung-daemmerung): der Pool, den der Messer am Bild des Feuers liest, unter
// dem Himmel der Stunde gegen denselben Pool unter dem Himmel der Nacht der REF (`BELICHTUNG.nachtRefE`, 0,0963 lx: der Vollmond
// gegenüber bei −20°, USNO Circular 171) — höchstens so viele Stufen auseinander. Die Untergrenze der Auto-Belichtung der Profis
// (Unreal, Auto Exposure, Min EV100: „limits the lower brightness the camera can adapt within“; zu tief gesetzt „the viewport
// image appears too bright“). Bis hier wog das Fenster jede Kachel gegen den Himmel der Stunde: seit der Mond auf seiner Bahn
// reist (w28-kosmos-bahn), steht er um Mitternacht auch unter dem Horizont, und gegen das Sternen-Licht (2,84e-8) wog derselbe
// Pool ein Bruchteil — die Prüfbühne und genesis (Radeon, a7b7a4b1): das Feuer bei k 76 969 statt 26 054 unter dem Mond, Boden
// 1–3 m Luma 91,3 statt 46,9; unter der Laterne von genesis 36 % des Bilds ausgebrannt, nach dem Wort Mitternacht 44 % der Pixel
// bei Luma ≥ 235.
const S0_MESSER_NACHT_EV = 0.5;
// die Zahlen des Täters an dieser Bühne (Radeon, a7b7a4b1, der Schuss mit dem Feuer): der Selbsttest stellt sie
const S0_MESSER_TAETER = Object.freeze({ k: 77045.02, kNacht: 31134169.659, poolE: 0.00001105, poolKnoten: 0.00002736, n: 474 });
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
            const takt = (n) => __takte(n, 16); // ein Takt-Fehler zählt der Page-Error
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
                // der Wert, nie der Getter: `P[n]` rief den Getter mit dem Prototyp als `this` (`dslPositions` legte seinen
                // Speicher `_dslPositionsCache` auf den Prototyp), und nach dem Tausch am Ort las die neue Welt ihn
                const f = Object.getOwnPropertyDescriptor(P, n).value;
                if (n === "constructor" || typeof f !== "function") continue;
                if (!__fehlt(f, /new THREE\.PointLight\(/)) out.bauer.push(n);
                if (!__fehlt(f, LIT)) out.ohnePool.push(n);
                if (!__fehlt(f, /this\._punktLichtBrdf\(/)) out.brdf.push(n);
            }
            if (schein) delete P._scheinRueckfall;
            // das EINE Punktlicht-Gesetz am Ruf: das Gesetz eines Platzes (`_lichtPlatz`, der Rumpf der Schleife des Pools —
            // w28-baum-programm) rechnet ihn über _punktLichtBrdf (Spion am Ruf)
            const echtB = r._punktLichtBrdf;
            let brdf = 0;
            r._punktLichtBrdf = function (...x) {
                brdf++;
                return echtB.apply(this, x);
            };
            try {
                const A = r._ensureAtmoUniforms();
                r._lichtPlatz(THREE.TSL, { lage: A.lichtLage[0], farbe: A.lichtFarbe[0], ersatz: A.lichtErsatz[0], kern: A.lichtKern[0] }, null);
            } catch {
                /* ein Wurf nach dem Ruf entwertet den Konsum nicht */
            }
            delete r._punktLichtBrdf;
            out.poolRuftBrdf = brdf > 0;
            r._setWeather("sunny", "human");
            window.__uebergangFaellt(r);
            // die Uhr springt über den Pfad des Spielers (sein Satz, `setTimeOfDay`): EIN Anwenden des Tags, kein Nachmalen
            const uhr = (t) => {
                if (r.setTimeOfDay(t, "human") !== true) throw new Error("S0: die Uhr nimmt den Spieler nicht (" + t + ")");
            };
            // der Mensch steht am Rand des Genesis-Orts: 2 m jenseits seines Freiraums (fachwerk GENESIS_ORT.freiraum), zwischen
            // zwei Toren (18°, neben jedem Weg), der Blick des Schusses weg von der Mitte
            const R0 = window.__fachwerkCore.GENESIS_ORT.freiraum.r + 2;
            const w0 = Math.PI / 10;
            const sx = st.x + R0 * Math.cos(w0);
            const sz = st.z + R0 * Math.sin(w0);
            const y0 = r.getTerrainHeightAt(sx, sz);
            s.playerMesh.position.set(sx, y0 + 1, sz);
            const vor = new Set(s.architectures || []);
            // DIE FEUERSTELLE IST, WAS DER SATZ SETZTE (`spawned_studio`: ihre Art), nie irgendein neuer Bau der Welt — am 30.10.
            // (tore-k5-tuer-neu, Schein-Lauf) griff die Probe einen Felsturm 180 m fern als „Feuerstelle", nach ihm die Glut eines
            // Dorfs des Scheins, während der Satz warf; steht sie nicht, BRICHT die Probe beim Namen AB (`abbruch`: was der Satz
            // sagte — ein Ort ohne Antwort, ein Wurf des Interpreters, das Ergebnis) — der Selbsttest meldete still BLIND
            const log = r.dslRun(["spawn_studio", "feuerstelle", ["near_player", 3], 1], { source: "human" }).log;
            const art = log.find((l) => l?.event === "spawned_studio" && l.count > 0)?.kind;
            await takt(20);
            const feuer = (s.architectures || []).find((e) => e?.position && !vor.has(e) && e.type === art);
            if (!feuer) {
                const grund = JSON.stringify(log.filter((l) => /invalid|exception|unknown|ergebnis/.test(l?.event)));
                out.befunde.push((out.abbruch = `S0: die Feuerstelle steht nicht (der Satz \`spawn_studio feuerstelle\`: ${grund})`));
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
                out.befunde.push((out.abbruch = "S0 Laterne: kein Platz in 6 m um das Feuer, den Wasser- und Bau-Wand frei nennen"));
                return out;
            }
            r._spawnSettlementErlebnis({ laternen: [{ x: frei[0], z: frei[1] }] }, { x: f.x, z: f.z }, { key: "pruef-s0-laterne" });
            const cam = s.camera;
            // DAS AUGE DER PROBE HÄLT SEINE POSE (w28-pop-treue): jede Pose führt die Kamera über die Tür eines Studios
            // (`kameraFuehren`) — sonst setzt der Takt der Schleife die Spieler-Kamera (`_loopCamera`), und gemessen wurde am
            // Spieler: unter der Laterne las der Messer den Pool 5,4 m statt 2,5 m fern (0,77 Stufen), wo der Same des Satzes das
            // Feuer dem Spieler näher setzte, 1,22 — dieselbe Laterne, zwei Urteile.
            const auge = (x, y, z, zx, zy, zz) => {
                const setze = (c) => {
                    c.position.set(x, y, z);
                    c.lookAt(zx, zy, zz);
                    c.updateMatrixWorld(true);
                };
                setze(cam);
                r.kameraFuehren(setze);
            };
            const zaehle = (um) => {
                const lichter = [];
                const v = new T.Vector3();
                s.scene.traverse((o) => {
                    if (!o.isPointLight || !(o.intensity > 0)) return;
                    o.getWorldPosition(v);
                    if (v.distanceTo(um) <= umkreis) lichter.push({ art: "szene", I: +o.intensity.toPrecision(4) });
                });
                let e2 = 0;
                const pool = r._leuchtPool;
                for (const p of pool?.plaetze || []) {
                    if (!(p.staerke > 0) || Math.hypot(p.x - um.x, p.y - um.y, p.z - um.z) > umkreis) continue;
                    // das Licht DIESER Feuerstelle steht über ihrem Bett (≤ 1,5 m waagrecht); jedes andere zählt nur als Licht
                    const eigen = Math.hypot(p.x - um.x, p.z - um.z) <= 1.5;
                    lichter.push({ art: "pool", quelle: p.quelle, I: +p.staerke.toPrecision(4), eigen });
                    if (!eigen) continue;
                    // der Pool in 2 m: das EINE Gesetz (fachwerk `lichtAbfall`: 1/d^abfall mit Kern und Saum), die Farbe nach Luminanz
                    const ab = window.__fachwerkCore.lichtAbfall({ reichweiteM: p.reichweite, abfall: p.abfall, kernM: p.kern }, 2);
                    const lum = luma709(p.farbe);
                    e2 += p.staerke * ab * lum;
                }
                const en = r._waagrechtIrradianz([0, 0, 0]);
                const nacht = luma709(en);
                // vier Ziffern, nie drei Stellen hinter dem Komma (w28-pop-treue): beide stehen in Welt-Einheiten um 1e-5, auf
                // drei Stellen lasen sie 0 und 0 — die Prüfung „≥ 10× die Nacht" las 0 ≥ 0 und war blind
                return { n: lichter.length, lichter, e2: +e2.toPrecision(4), nacht: +nacht.toPrecision(4) };
            };
            for (const klang of [false, true]) {
                if (s.symphony) s.symphony.enabled = klang;
                uhr(0);
                auge(f.x - 2, f.y + 1.2, f.z, f.x, f.y, f.z);
                await takt(45); // die Plätze blenden ein (LICHT_POOL.blendeS)
                const z = zaehle(f);
                out.nacht[klang ? "klang" : "still"] = z;
                const wie = klang ? "Klang an" : "Klang aus";
                const amFeuer = z.lichter.filter((l) => l.eigen);
                if (!amFeuer.length) {
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
                            "(fachwerk LICHT_GESETZ.feuer, Lichtstärke `cd` ÷ EINHEIT_LX × Schaltplan) über `_leuchtStaerke`"
                    );
            }
            if (s.symphony) s.symphony.enabled = false;
            // die Laterne: nachts ein Platz, mittags keiner
            const lp = { x: f.x + frei[0], y: f.y + 3, z: f.z + frei[1] };
            const laterneAn = () =>
                (r._leuchtPool?.plaetze || []).filter(
                    (p) => p.quelle === "laterne_dorf" && Math.hypot(p.x - lp.x, p.z - lp.z) < 1
                ).length;
            auge(lp.x - 2, lp.y - 1.5, lp.z, lp.x, lp.y - 1.5, lp.z);
            uhr(0);
            await takt(45);
            const nachtL = laterneAn();
            // DER MESSER LIEST DEN POOL AM BODEN DES BILDS (sonnenbahn 2, `_poolAmBild`): der Null-Renderer zeichnet keinen Boden, den
            // der Messer läse — sein Urteil fährt im Licht-Lauf (`--licht`, S0 MESSER: die Belichtung des Schusses mit und ohne Feuer)
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
                const c = s.atmoUniforms?.lichtGlut?.fenster?.value;
                return c ? +luma709([c.r, c.g, c.b]).toFixed(4) : null;
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
            if (!out.poolRuftBrdf || out.brdf.some((b) => b !== "_lichtPlatz"))
                out.befunde.push(
                    `S0 Punktlicht-Gesetz: die BRDF eines Punktlichts rufen ${out.brdf.map((b) => "`" + b + "`").join(", ") || "niemand"} ` +
                        "(Soll: nur `_lichtPlatz`, das EINE Gesetz eines Platzes im Pool)"
                );
            if (out.bauer.length)
                out.befunde.push(
                    `S0 Punktlicht: ${out.bauer.length} Stamm-Methode(n) bauen ein Szenen-Licht (${out.bauer.join(", ")}) — ` +
                        "jedes Szenen-Licht kostet jeden beleuchteten Stoff, auch auf 0"
                );
            r.kameraFuehren(null); // die Kamera geht an den Spieler zurück
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
            const s = st;
            const out = { welt, wuerfe: [], akt: null, nexus: null, zensus: null, befunde: [] };
            const takt = (ms) => window.__takte(Math.ceil(ms / 16), 16); // ein Takt-Fehler zählt der Page-Error
            // Die Welt reift aus (Genesis-Ring, Vorschauen, Start-Dorf der Wildnis): erst wenn ihr Bestand 4 s steht, misst
            // die Linse — was danach wächst, ist ein Wurf.
            {
                let n = -1;
                let still = 0;
                await window
                    .__gebautNach("noch: still < 4", {
                        fertig: () => !(still < 4),
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
                    res = { wurf: String(e?.message || e).slice(0, 160) };
                }
                // das Dorf (und das Fraktal) reist über den Worker, die Pflanz-Schlange leert sich im Takt
                await takt(prog[0] === "spawn_village" || prog[0] === "spawn_fractal" ? 3000 : 700);
                const z = zuwachs(vor, substanz());
                const log = res && Array.isArray(res.log) ? res.log : [];
                const halt = log.find((l) => l?.event === "invalid_position");
                return {
                    op: prog[0],
                    quelle,
                    zuwachs: z.summe,
                    was: z.d,
                    ereignisse: log
                        .map((l) => l?.event)
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
                    const innen = JSON.stringify(evo?.program || []).match(/"spawn_[a-z_]+"/g) || [];
                    for (const w of innen) zaehl[w.replace(/"/g, "")] = (zaehl[w.replace(/"/g, "")] || 0) + 1;
                    if (kopf) laeufe++;
                    r._loopNexusUpdate();
                    if (i % 10 === 9) await takt(400);
                }
                await takt(6000); // die Regeln des Nexus feuern, das Dorf landet
                const z = zuwachs(vor, substanz());
                out.nexus = { evolutionen: laeufe, wuerfeImPool: zaehl, zuwachs: z.summe, was: z.d };
            }
            // (4) DER ABSENZ-ZENSUS in 300 m um den Genesis-Ort der Welt (die Mitte ihres Plans)
            {
                const M = r._genesisMitte();
                if (!M) throw new Error("der Absenz-Zensus ohne Genesis-Ort (der Plan der Welt kam nicht)");
                const R = 300;
                const d = (p) => Math.hypot(p.x - M.x, p.z - M.z);
                const fremd = {};
                for (const e of s.architectures || [])
                    if (e?.position && d(e.position) <= R && !bestand.has(e))
                        fremd[e.type] = (fremd[e.type] || 0) + 1;
                let streu = 0;
                const SC = AnazhRealm.SCATTER;
                if (s.scatterRegions && SC)
                    for (const [key, reg] of s.scatterRegions) {
                        const [rx, rz] = key.split(",").map(Number);
                        const c = { x: (rx + 0.5) * SC.regionM, z: (rz + 0.5) * SC.regionM };
                        if (d(c) <= R + SC.regionM * 0.71) streu += reg?.instanceCount || 0;
                    }
                let nahStreu = 0;
                if (s.nahStreu?.kacheln)
                    for (const k of s.nahStreu.kacheln.values()) nahStreu += (k.items || []).length;
                const h = s.hydrosphere;
                out.zensus = {
                    R,
                    fremdeBauten: fremd,
                    streuZellen: streu,
                    nahStreu,
                    tiere: (s.creatures || []).filter((c) => c?.position && d(c.position) <= R).length,
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
    window.__s0Nah = (mitte, radius) => {
        const rend = st.renderer;
        const welt = st.scene;
        // WAS DER FEUERKREIS LIEST: der Boden-Satz und die Feuerstelle (ihr Bau-Satz, ihre Gruppe oder ihr eigenes Mesh)
        // — gefragt beim Zeichnen: der Bau-Satz entsteht erst im ersten Frame des Schusses (`_tickBauSatz` vor dem Render)
        const feuer = window.__s0Feuer;
        const gruppen = () => st.archInstanceGroups || new Map();
        const feuerGruppe = (g) => !!g?.slotEntry?.includes(feuer);
        // der Satz eines Objekts: was für ihn zeichnet (`_sichtZeichner`) — im Hauptbild seine zwei Züge der Sicht (Bild/tiefe),
        // nie er selbst; fragte die Bühne nur nach dem Satz-Mesh, warf sie die Feuerstelle aus dem Schuss (Nacht-Luma 22,4 → 21,4)
        const satzVon = (o) => {
            for (const s of (st.chunkSaetze || new Map()).values()) if (r._sichtZeichner(s).includes(o)) return s;
            return null;
        };
        const liest = (o, ohne) => {
            if (ohne) return false;
            for (let p = o; p; p = p.parent) {
                if (feuer && p === feuer.mesh) return true;
                const s = satzVon(p);
                if (s) {
                    if (s.art === "boden") return true;
                    for (const key of s.bloecke.keys()) if (feuerGruppe(gruppen().get(key))) return true;
                    return false;
                }
                if (p.isInstancedMesh && feuerGruppe(gruppen().get(p.userData?.archInstanceKey))) return true;
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
            return q.name || q.userData?.inventar || q.type;
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
                const a = s.abschnitte?.get("haupt");
                if (!a || !(a.n > 0) || !r._sichtZeichner(s).some((o) => gezeichnet.has(o))) continue;
                let n = 0;
                for (const z of a.liste || []) if (z?.huelle && !z.huelle.isEmpty() && z.huelle.distanceToPoint(m) > radius) n++;
                const k = s.mesh?.name || s.art;
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
        const s = st;
        if (!feuer || !s.architectures.includes(feuer))
            return { fiel: feuer?.__s0Fiel || "nicht über removeArchitecture", fehlt: [] };
        const fehlt = [];
        if (!r._archIsRendered(feuer)) fehlt.push("die Feuerstelle wächst");
        const ring = r._builtRingRadius();
        const K = AnazhRealm;
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
        const platz = q.findIndex((a) => a?.msg && a.msg.presetId === pr);
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
// DER FEUERKREIS NETTO (Entscheid des Koordinators 25.11., sonnenbahn 3): der Kreis aus 2 m zählt das Licht des Pools — der Kreis
// MIT Pool minus der Kreis OHNE Pool bei GEHALTENER Blende (das k des sauberen Schusses, `gehalten`, ein weiterer Schuss in derselben
// Welt), Soll netto ≥ S0_LUMA_2M. Brutto las er bis hier die Nacht mit: der Messer belichtet ohne das Feuer nach (k 26 069 → 150 415),
// und seit dem Fuß am Schlüssel trug die Nacht allein 0,1508 — ein Feuer, das nichts beleuchtet, hätte bestanden. Das Urteil der
// NACHT (der Boden lesbar ohne Feuer) liest weiter den nachbelichteten Schuss: zwei Fragen, zwei Schüsse. Hielt die Blende nicht,
// ist die Probe blind (Befund).
const S0_LUMA_2M = 0.15;
function s0KreisNetto(mit, ohne) {
    if (!mit || mit.fehler) return { netto: null, befund: null };
    if (!ohne || ohne.fehler || !(ohne.kreis >= 0))
        return { netto: null, befund: "S0 Bild: der Kreis netto ist ungemessen — der Schuss ohne Pool bei gehaltener Blende fehlt" };
    if (!(Math.abs(ohne.belichtung - mit.belichtung) <= 1e-3 * mit.belichtung))
        return {
            netto: null,
            befund: `S0 Bild: die Blende hielt nicht — der Schuss ohne Pool steht bei k ${ohne.belichtung}, das Feuer bei ${mit.belichtung} (\`_blendeBestellen\`)`,
        };
    const netto = +(mit.kreis - ohne.kreis).toFixed(4);
    return {
        netto,
        befund:
            netto >= S0_LUMA_2M
                ? null
                : `S0 Bild: der Feuerkreis aus 2 m trägt netto Luma ${netto} (brutto ${mit.kreis}, ohne Pool ${ohne.kreis} bei k ${mit.belichtung}; Soll ≥ ${S0_LUMA_2M}) — das Licht der Feuerstelle ` +
                  "(fachwerk LICHT_GESETZ.feuer über `_leuchtStaerke` in den Licht-Pool `_lichtPoolTerm`) trägt den Boden nicht",
    };
}
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
const S0_TON = { hue: [28, 45], satMax: 0.75, palette: { hex: 0xff7a35 }, paletteUnter: 2 };
// ZWEI GRÖSSEN, ZWEI LESER (D3-2 mit K66): der FARBTON ist das Licht des Feuers (netto, die Nacht abgezogen — die Farbtemperatur
// des Gesetzes), die SÄTTIGUNG ist, was das Auge sieht (brutto, das Bild mit der Nacht — die Wand des Auges der Nacht). Netto
// gemessen trägt jedes Licht seine volle Sättigung (das Feuer allein, ohne den Boden der Nacht: 0,96).
// DAS LICHT ADDIERT LINEAR (F1, die Foto-Kette): mit minus ohne Feuer je Kanal im LINEAREN Licht der Ausgabe (sRGB entschlüsselt),
// der Rest wieder in sRGB — unter der Tonkurve Khronos PBR Neutral (linear bis zur Schulter, der Schwarzpunkt fällt in der
// Differenz) ist das das Licht des Feuers auf dem Boden (die Differenz der sRGB-Werte zöge die Nacht nichtlinear ab).
const { srgbLin: s0Lin, linSrgb: s0Srgb, luma709 } = require("./lib/abnahme-urteil.cjs");
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
const s0TonImBand = (t) => t?.hue >= S0_TON.hue[0] && t.hue <= S0_TON.hue[1];
const s0TonPasst = (t) => s0TonImBand(t) && t.sat <= S0_TON.satMax;
// DER STOFF DES SCHUSSES (K17-3, die Shader-Kosten-Linse scripts/lib/shader-kosten.cjs): der Schuss zeichnet das Boden-Programm
// (`voxelChunkMaterial`). Keine Hilfs-Funktion des Programms liest eine Bindung (`bindungInFunktionMax` 0): die Layout-Funktion
// `wieseRelief` las den Rausch-Atlas und vererbte seinen Namen in jedes weitere Programm — auf der Bühne sagte swiftshader die
// Pipeline ab. Der Selbsttest (Mutante c) lässt eine Hilfs-Funktion eine Bindung des gezeichneten Programms lesen. DIE GRÖSSE
// IST EINE ZAHL, KEIN TOR (`S0_ZEICHEN`; Entscheid des Koordinators 24.11. auf das Wort des Schöpfers vom selben Tag: „ist das
// wirklich ein problem? was ist das wahre ziel dieser regel“ — und 19.11.: der Kaltstart ist kein Tor). Bis dahin hielt hier eine
// Ratsche (der Stand + 2 % Luft) seit z713 (main bf5a1542) JEDE Vorprüfung an 108 011 Zeichen (Budget ≤ 104 162): der Zuwachs
// von 4 664 Zeichen war gelandeter Bild-Gewinn (stadtklima#1 `_naesseOrtKnoten`, jahreslauf#2 `uLaubJahr`), und dieselbe Probe
// maß kalt 701 ms bei 108 011 und 1 081 ms bei 103 347 Zeichen (beide Radeon 890M) — die Zeichenzahl sagt die Übersetzungszeit
// nicht voraus. Die Zeile „S0 BODEN-PROGRAMM“ nennt die Zahl und ihren Zuwachs gegen den gebuchten Stand: laut, aber grün
// (Selbsttest e). Tor bleibt, was bricht: die Bindung (`bindungInFunktionMax` 0), der Weg der Pipeline, die Abtastungen (die
// Budgets der Stoffe in der Shader-Kosten-Linse) und gate:webgl-probe (16 Sampler). Der gebuchte Stand: 108 011 Zeichen am
// 24.11. (main bf9be26c, GTX 1050 und Radeon 890M gleich) — davor 12.11. 95 297 · 18.11. 102 120 (Weg-Körper) · 103 347.
const S0_ZEICHEN = { stand: 108011 };
const S0_STOFF = (() => {
    const SK = require("./lib/shader-kosten.cjs");
    const budget = { bindungInFunktionMax: 0 };
    return (wgsl, name = "S0 Boden-Programm") => SK.kostenUrteil(SK.wgslKosten(wgsl), budget, name);
})();
// DIE ÜBERSETZUNG DES BODEN-PROGRAMMS (Regel-Inventur 07.11., Entwurf 3; Tor-Schnitt 12.11.): IM TOR URTEILT DAS GESETZ DES
// PROGRAMMS, NIE DIE WANDUHR (Wort des Schöpfers 16.10. und 11.11.: Linsen im Zug urteilen Verhalten und Gesetz, nie Läufer-Zeit;
// Zeit gehört in eine Station mit Referenzfahrt derselben Sitzung). Je Programm, das ein Schuss zeichnet, urteilt (1) DER WEG
// seiner Pipeline (das Register `s0PipeRegister`): asynchron, wie die Erst-Zeichnung (`_renderObjectDirect`) jede Pipeline der
// Welt anlegt — synchron übersetzt der GPU-Prozess sie, bevor er das nächste Bild zeigt; dazu oben (`S0_STOFF`) die Bindung.
// (2) AUSKUNFT ohne Urteil: die Größe (oben `S0_ZEICHEN`) und, auf echter GPU, die kalte Übersetzung — Vertex und Fragment neu
// (`createShaderModule`), bis die Pipeline steht (`createRenderPipelineAsync`), je Lauf eine eigene Zahl im Rumpf (kein Cache von
// Dawn, Chrome oder Treiber trifft), `n` Läufe, wenn kein Bau der Welt mehr übersetzt; die Zeile nennt die Zeiten, den Median und
// das Verhältnis zum K17-Fall derselben Sitzung (die Referenzfahrt: an ihr kürzt sich die Last des Läufers). Bis 12.11. urteilte
// hier ein Zeit-Soll (≤ 250 ms, darüber ≤ 1,1 × main 721 ms Radeon / 1132 ms GTX, gesetzt 08.11. ohne Referenzfahrt): z409 fiel
// 78 min an 1111 ms unter Last, und die Radeon maß am selben Stand 1295–1740 ms bei Median/schnellster 1,08–1,14 — gleichmäßige
// Last sieht kein Maß einer Sitzung. Der Selbsttest auf echter GPU zeichnet den K17-Fall (das Fels-Gesetz ausgeschrieben im Pixel,
// `s0BodenMessung`, ~188 000 Zeichen) auf dem Vendor-Weg: er fällt am Weg (synchron).
const S0_MS = { n: 9 };
const s0Median = (p) => (p?.ms?.length ? rang([...p.ms].sort(aufsteigend)) : null);
function s0BodenUrteil(name, p) {
    return [p.weg !== "asynchron" && `${name}: die Pipeline entstand ${p.weg}, nie asynchron wie jede der Erst-Zeichnung (\`_renderObjectDirect\`)`].filter(Boolean);
}
// die Größe als Auskunft: die Zahl und ihr Zuwachs gegen den gebuchten Stand (`S0_ZEICHEN`) — laut, nie Urteil
const s0Groesse = (zeichen) => {
    const d = zeichen - S0_ZEICHEN.stand;
    return `${zeichen} Zeichen WGSL (gebuchter Stand ${S0_ZEICHEN.stand}, ${d > 0 ? `ZUWACHS +${d}` : d < 0 ? `kleiner um ${-d}` : "±0"} — Auskunft, kein Urteil)`;
};
// die Zeile je Programm: das Urteil (Weg + Stoff: `u`), die Größe und die Zeit als Auskunft; `ref` — der K17-Fall derselben
// Sitzung; `fang` — ein erwarteter Fang des Selbsttests heißt GEFANGEN, nie ROT
const s0ZeileText = (name, p, u, ref, fang) => {
    const [m, mr] = [s0Median(p), s0Median(ref)];
    const zeit = !p.ms.length
        ? "ungemessen (swiftshader)"
        : `${p.ms.join(" · ")} ms, Median ${m} ms${mr ? ` · ÷ K17 derselben Sitzung ${String((m / mr).toFixed(2)).replace(".", ",")}` : ""} (Auskunft, kein Zeit-Urteil)`;
    const urteil = u.length ? (fang ? "GEFANGEN" : "ROT") : fang ? "nicht gefangen" : "GRÜN";
    return `  ${name}: ${s0Groesse(p.zeichen)} · Pipeline ${p.weg} → ${urteil} · kalt ${zeit}`;
};
const s0Zeile = (...a) => console.log(s0ZeileText(...a));
// DAS REGISTER DER PIPELINES (vor dem ersten Skript der Seite): je Pipeline des Geräts ihr Weg und ihr Deskriptor; `__s0Flug`
// zählt die Bauten im Flug (die Messung beginnt erst, wenn kein Bau der Welt mehr übersetzt)
function s0PipeRegister() {
    const P = window.GPUDevice?.prototype;
    if (!P) return;
    const [syn, asyn, reg] = [P.createRenderPipeline, P.createRenderPipelineAsync, (window.__s0Pipes = new WeakMap())];
    window.__s0Flug = 0;
    P.createRenderPipeline = function (d) {
        const p = syn.call(this, d);
        reg.set(p, { weg: "synchron", d });
        return p;
    };
    P.createRenderPipelineAsync = function (d) {
        window.__s0Flug++;
        return asyn.call(this, d).then((p) => (reg.set(p, { weg: "asynchron", d }), p)).finally(() => window.__s0Flug--);
    };
}
// DIE ÜBERSETZUNG AUF DER SEITE: je Programm, das ein Schuss zeichnete (`__s0BodenRo`), der Weg aus dem Register und auf echter
// GPU die kalte Zeit. Der K17-Fall (nur Selbsttest, echte GPU): der Boden-Stoff neu gebaut, wie er bis K17-3 im Pixel stand — die
// Ziehung `felsZufall` und die Fels-Funktion `felsFein` ohne Layout (r184 `Fn` ist ein Proxy um den Fn-Knoten: die Hülle fängt
// ihr `setLayout` ab, der Rumpf steht im Einstieg), die Falte ausgerollt, `fest` ohne Variable —, gezeichnet auf einem Abbild eines
// Boden-Stücks (Schicht 31) über den Vendor-Weg. DIE ZAHL IM RUMPF (`stufe`): das letzte `return` des Einstiegs (r184 schreibt
// `main` zuletzt, sein Ergebnis zuletzt) multipliziert das erste vec4 seines Ergebnisses mit `z` — ein Rumpf, den kein Cache kennt
// (Dawn und Chrome schlüsseln den Text, der Treiber das übersetzte DXIL). Die Zeiten laufen im Wechsel (Boden, K17, Boden, …).
async function s0BodenMessung({ hw, selbst, n }) {
    try {
        const s = st;
        const rend = s.renderer;
        const dev = rend.backend.device;
        const lies = (ro) => {
            const nbs = ro.getNodeBuilderState();
            const e = window.__s0Pipes.get(ro.pipeline && rend.backend.get(ro.pipeline).pipeline) || {};
            return { e, vs: nbs.vertexShader, fs: nbs.fragmentShader, ms: [] };
        };
        const ro0 = [...(window.__s0BodenRo || new Map()).values()];
        const progs = ro0.map(lies);
        let k17 = null;
        if (hw && selbst && ro0.length) {
            const [T, AR] = [window.THREE, AnazhRealm];
            const alt = [T.TSL, AR._felsRwMemo, AR._zweigMemo, AR._felsRechenwerkTSL, s.voxelChunkMaterial];
            const huelle = (f) => ({ get: (_, k) => (k === "setLayout" ? (l) => (/^fels/.test(l.name) ? f : f.setLayout(l)) : f[k]) });
            T.TSL = { ...alt[0], Fn: (...a) => ((f) => new Proxy(f, huelle(f)))(alt[0].Fn(...a)) };
            AR._felsRechenwerkTSL = function (TT, raum) {
                const N = (v) => (typeof v === "number" ? TT.float(v) : v);
                const falte = (k, z, schritt) => {
                    for (let i = 0; i < k; i++) z = schritt(TT.float(i), z.map(N));
                    return z.map(N);
                };
                return { ...alt[3].call(this, TT, raum), fest: N, falte };
            };
            let mat;
            try {
                AR._felsRwMemo = s.voxelChunkMaterial = null;
                mat = r._getVoxelChunkMaterial();
            } finally {
                [T.TSL, AR._felsRwMemo, AR._zweigMemo, AR._felsRechenwerkTSL, s.voxelChunkMaterial] = alt;
            }
            const m2 = new T.Mesh(ro0[0].object.geometry, mat);
            m2.frustumCulled = false;
            m2.layers.set(31);
            const [cam, objs, ort] = [s.camera, rend._objects, rend._renderObjectDirect];
            const [maske, roh] = [cam.layers.mask, objs.get];
            objs.get = function (...a) {
                const ro = roh.apply(this, a);
                if (ro.material === mat) k17 = ro;
                return ro;
            };
            s.scene.add(m2);
            cam.layers.set(31);
            delete rend._renderObjectDirect;
            try {
                for (let i = 0; i < 4 && !k17?.pipeline; i++) {
                    window.__loopBild();
                    await dev.queue.onSubmittedWorkDone();
                }
            } finally {
                [rend._renderObjectDirect, objs.get, cam.layers.mask] = [ort, roh, maske];
                s.scene.remove(m2);
            }
            if (!k17?.pipeline) throw new Error("der K17-Fall zeichnet nicht");
            k17 = lies(k17);
        }
        const stufe = (code, z) => {
            const [p, i] = [code.lastIndexOf("->"), code.lastIndexOf("return ")];
            const typ = code.slice(p + 2, code.indexOf("{", p)).replace(/@\w+\s*\([^)]*\)/g, "").trim();
            const feld = code.split(`struct ${typ} {`)[1]?.match(/(\w+)\s*:\s*vec4<f32>/)?.[1];
            const [j, e] = [code.indexOf(";", i), code.slice(i + 7, code.indexOf(";", i))];
            const rumpf = feld ? `var s0o = ${e};\n\ts0o.${feld} *= ${z};\n\treturn s0o` : `return ( ${e} ) * ${z}`;
            return code.slice(0, i) + rumpf + code.slice(j);
        };
        const kalt = async ({ e, vs, fs, ms }) => {
            const z = (1 + Math.random() / 8).toPrecision(12);
            const [v, f] = [stufe(vs, z), stufe(fs, z)];
            const mod = (code) => dev.createShaderModule({ code });
            const t0 = performance.now();
            await dev.createRenderPipelineAsync({ ...e.d, vertex: { ...e.d.vertex, module: mod(v) }, fragment: { ...e.d.fragment, module: mod(f) } });
            ms.push(Math.round(performance.now() - t0));
        };
        while (window.__s0Flug > 0) await sleep(50);
        for (let i = 0; i < (hw ? n : 0); i++) for (const p of k17 ? [...progs, k17] : progs) await kalt(p);
        const aus = ({ e, fs, ms }) => ({ weg: e.weg || "am Register vorbei (die Linse ist blind)", zeichen: fs.length, ms });
        return { programme: progs.map(aus), k17: k17 && { ...aus(k17), wgsl: k17.fs } };
    } catch (e) {
        return { fehler: String(e?.message || e) };
    }
}
// DER HIMMEL FOLGT DEM SPRUNG (K10, die Nacht der Gasse): die Uhr springt über den Pfad des Spielers (`setTimeOfDay`, sein Satz
// „nacht") — EIN Anwenden des Tags (`_applyDayNightToScene`) später trägt die Himmels-Umgebung (die IBL jedes Stoffs, ihre
// Lesung `_himmelsIrradianz`) die Bestrahlung des Himmels, der jetzt gilt: den Himmel des Orts, den die Belichtung und das Wasser
// synchron lesen (`_himmelsBestrahlung`, S7). Seit D3 lebt der Himmel auf der GPU und kommt EINE Lesung nach der Malung
// auf die CPU (`state._skyEnvLesung`) — die Probe misst darum im Bild-Lauf (der Null-Renderer malt keinen Himmel, Lehre 16): sie
// wartet auf die Lesung, die der Sprung angestoßen hat; malt der Maler nicht, bleibt die Lesung der vorigen Stunde stehen.
// Morgen als Ausgang (frisch gemalt), dann Mittag, dann sofort Mitternacht (die zweite Malung liegt in der Raten-Drossel).
// `taub` (der Selbsttest): der Maler der Umgebung hört die Uhr nicht (`_ensureSkyEnvironment` taub) — die Probe MUSS ihn nennen.
// DIE MITTERNACHT IN GELTENDEN ZIFFERN (sonnenbahn 2, Wort des Koordinators 25.11.): die Nacht liegt um 1e-8 Welt-Einheiten — mit
// vier Stellen nach dem Komma und 0,005 absolut druckte die Zeile „Umgebung 0 · Himmel des Orts 0“ und war blind für den Himmel,
// der fehlt. Um Mitternacht gilt darum nur das Verhältnis (`tol`), und beide tragen mindestens den BODEN DER NACHT.
// DER BODEN DER NACHT IST, WAS DER HIMMEL OHNE MOND TRÄGT (nachthimmel-einig): das Sternen-Licht des Gesetzes (welt-licht
// `nachtHimmel` an der Tag-Achse der Stunde) DURCH DIE LUFT — van Rhijn aus der Schicht des Luftleuchtens × der Durchlass des
// Mediums jetzt, über die Halbkugel kosinus-gewichtet, hier auf der CPU gerechnet (`ATMO_RECHNUNG.durchlass`, 64 Ringe × 400
// Schritte: 0,876 · π · nachtHimmel in klarer Luft; die Tafel des Orts liest 0,882, die Umgebung 0,879). Der Mond kommt nur
// dazu, wenn er steht: dann mindestens ein Zehntel seines Richtlichts auf der waagrechten Fläche (der klare Himmel streut auch
// unter der Zenit-Quelle nie weniger). Bis hier galt π · nachtHimmel OHNE die Luft, „der Mond streut darüber“ — das setzte den
// ewigen Vollmond der Sonne gegenüber voraus; seit w28-kosmos-bahn reist der Mond auf seiner Bahn und steht um Mitternacht
// auch unter dem Horizont (die Mitternacht der Linse: −24° … −27°). `nachtlos` (der Selbsttest): die Welt schreibt der Nacht weder
// Mond noch Sterne in die Tafeln (`AnazhRealm.MOONLIGHT` ohne Stärke, `_atmoSternenLicht` null → `__weltLicht.tafelLicht`) —
// die Probe MUSS „der Himmel der Nacht fehlt“ nennen.
// ZWEI MITTERNÄCHTE: die der Ankunft und die erste der nächsten 60 Tage der Welt (`worldMeta.tag`), an der der Mond 17° oder
// höher steht (sin ≥ 0,3) — die Ephemeride des Monds selbst, keine gestellte Bahn; danach steht der Tag der Ankunft wieder.
// `erdschatten` (der Selbsttest, der Täter von main c0634d86 … 12029279): Ψ_ms trägt eine Stufe des Halb-Floats über dem Boden
// seiner Ablage, wo die Quelle im Erdschatten steht (bis nachthimmel-einig schnitt D3D ln 2^−24 auf −16,625, der Leser las
// 6,24e-10 statt 0) — die Sonne bei −22° wiegt nachts ohne Mond 2,63e8, die Umgebung trug 3,288e-8 gegen 2,740e-8 am Ort. Die
// Probe MUSS „im Erdschatten“ und `mehrfach` nennen.
// DIE DÄMMERUNG (belichtung-daemmerung): der Messer liest den Himmel, den das Bild trägt, auch wo die Sonne unter dem Horizont
// steht — drei Abend-Stunden der Probe (`S0_DAEMMER_GRAD`, die Uhr aus der Bahn der Sonne selbst gesucht), je Stunde die Umgebung
// gegen den Himmel des Orts (`S0_DAEMMER_TOL`). Bis hier maß die Probe nur Mittag und Mitternacht, und die Bestrahlungs-Tafel
// trug die Sonne unter −10° nicht mehr: je Einheit E0 abgelegt, fiel ihr Licht unter die kleinste Stufe des Halb-Floats
// (5,96e-8) — genesis, Radeon, a7b7a4b1: bei −12,54° Umgebung 1,212e-7 gegen den Himmel des Orts 2,369e-8 (das 5,1-Fache), die
// Belichtung stand 1,2 Stufen zu hoch und fiel bei −12° in sechs Sekunden um 0,9 Stufen (die letzte Stufe der Tafel).
// `daemmer-stufe` (der Selbsttest, dieser Täter): die Tafel der CPU ohne das Maß der Dämmerung — jeder Texel unter dem Horizont
// auf der Halb-Float-Stufe seiner Bestrahlung je Einheit E0 (`__weltLicht.tafelMass` zurückgerechnet). Die Probe MUSS „die
// Dämmerung“ und `passBestrahlung` nennen.
const S0_HIMMEL_TOL = 0.03; // relativ, mittags plus 0,005 absolut: die Umgebung nach dem Sprung gegen den Himmel des Orts (Radeon 1,9 %)
const S0_DAEMMER_GRAD = [-9, -12.5, -15.5]; // die Sonnenhöhen der Dämmerung (Grad): nautisch, ihr Ende, astronomisch
// relativ: die Umgebung der Dämmerung gegen den Himmel des Orts — 0,1 Stufen, der Schritt der Tag-Wand (`TAG_SOLL.sprung`). Radeon,
// die drei Stunden: am Täter 6,0 % · 427 % · 23,3 %, im Maß der Dämmerung mit den Ringen gleich im Raumwinkel 1,4 % · 5,0 % · 2,6 %
// (mit den Ringen gleich in der Bestrahlung, der unterste bei 11,8°: 2,7 % · 13,2 % · 2,8 %)
const S0_DAEMMER_TOL = 0.07;
async function himmelProbe(page, schein) {
    return page.evaluate(
        async (schein, tol, daemmerGrad, tolD) => {
            const s = st;
            const taub = schein === "taub";
            const out = { himmel: [], befunde: [] };
            const MO = AnazhRealm.MOONLIGHT;
            if (schein === "nachtlos") {
                AnazhRealm.MOONLIGHT = Object.freeze({ ...MO, intensity: 0 });
                r._atmoSternenLicht = () => [0, 0, 0];
            }
            let ankerSpaet = null;
            let tagAnkunft = null;
            let msSchein = false;
            let tafelSchein = null;
            try {
            const uhr = (t) => {
                if (r.setTimeOfDay(t, "human") !== true) throw new Error("S0: die Uhr nimmt den Spieler nicht (" + t + ")");
            };
            const lum = luma709;
            r._setWeather("sunny", "human");
            window.__uebergangFaellt(r);
            // DIE SONNE STEHT AN IHREM ORT, BEVOR GEMESSEN WIRD (nacht-himmel, S0-Rennen): das EINE Prädikat der Ankunft
            // (`_belichtungSteht`, Term „licht“ — erst mit dem Anker des Planet-Fadens, `_sonnenAnker`). Bis dahin maß die Probe
            // ab spiel 1,5 s auf der Bahn der Bühne, und die Antwort des Fadens (`_sonnenAnkerFragen` → `_himmelSprung`) landete
            // bei spiel ≈ 2,0–2,1 s im Messfenster: Umgebung der alten Bahn gegen den Ort der neuen, −20,0 % (GTX, uhr 0,3).
            for (let q = 0; q < 600 && !s._belichtungSteht; q++) await window.__takte(1, 16);
            if (!s._belichtungSteht) {
                out.befunde.push(
                    "S0 Himmel: die Sonne steht nach 600 Takten nicht an ihrem Ort (`_belichtungSteht` offen, Anker " +
                        (r._sonnenAnker ? "da" : "fehlt — `_sonnenAnkerFragen`") +
                        ") — die Probe mäße die Bahn der Bühne"
                );
                return out;
            }
            // `anker-spaet` (der Selbsttest): die Antwort des Planet-Fadens kommt erst NACH der ersten Malung (wie im Rennen) —
            // die Probe MUSS „die Sonne sprang im Messfenster“ nennen
            ankerSpaet = schein === "anker-spaet" ? r._sonnenAnker : null;
            if (ankerSpaet) r._sonnenAnker = null;
            uhr(0.3);
            if (!(await r._himmelFrisch())) {
                out.befunde.push("S0 Himmel: keine Lesung der Umgebung (`_himmelFrisch`) — die Probe ist blind");
                return out;
            }
            const A = s.atmoLut;
            // das Sternen-Licht des Gesetzes durch die Luft auf der waagrechten Fläche (Welt-Einheiten, Luma), auf der CPU
            const sterneLuft = (sonneY) => {
                const [R, M, G, N] = [r._atmoRechnung(), r._atmoMediumJetzt(), r._atmoGesetz(), __weltLicht.STERNENLICHT];
                const [h, tn, T, NT] = [A.U.hKm.value, A.U.toenung.value, [0, 0, 0], 64];
                const q = (M.RG + h) / (M.RG + G.nacht.glutHoeheM / 1000);
                let E = 0;
                for (let a = 0; a < NT; a++) {
                    const ct = Math.sqrt(1 - (a + 0.5) / NT);
                    R.durchlass(M, h, ct, 400, T);
                    E += lum([N.r * T[0] * tn.x, N.g * T[1] * tn.y, N.b * T[2] * tn.z]) / Math.sqrt(Math.max(1 - q * q * (1 - ct * ct), 1e-4));
                }
                return (Math.PI * __weltLicht.nachtHimmel(r._tagAchse(sonneY)) * E) / NT;
            };
            // das Gesetz des Orts nach Quellen (dieselbe `bestrahlung`, je eine Quelle allein)
            const NULL3 = { value: { x: 0, y: 0, z: 0 } };
            const teil = (so, mo, na) =>
                lum(__weltLicht.bestrahlung(A.tafel, { ...A.U, sonneE: so ? A.U.sonneE : { value: 0 }, mondE: mo ? A.U.mondE : NULL3, nachtE: na ? A.U.nachtE : NULL3 }, [0, 0, 0]));
            if (schein === "erdschatten") {
                // eine Stufe des Halb-Floats über dem Boden der Ablage (−16,625 + 1/64) in jedem Texel von Ψ_ms
                const TS = THREE.TSL;
                const q = __weltLicht.schirmDreieck(TS.Fn(() => TS.vec4(-16.609375, -16.609375, -16.609375, 1)), "schein-erdschatten");
                msSchein = true;
                let da = false;
                for (let i = 0; i < 240 && !(da = r._atmoZeichne(q, A.rtMS)); i++) await window.__takte(1, 16);
                q.material.dispose();
                if (!da) throw new Error("S0: der Schein „erdschatten“ zeichnet Ψ_ms nicht");
            }
            // die Uhr des Abends, an der die Sonne `g` Grad steht: ihre Bahn selbst (Bisektion Mittag … Mitternacht), null ohne Durchgang
            const uhrBei = (g) => {
                const y = (t) => r._dayNightSunDirection(__weltLicht.sonnenWinkel(t)).y - Math.sin((g * Math.PI) / 180);
                let [a, b] = [0.5, 0.9999];
                if (!(y(a) > 0 && y(b) < 0)) return null;
                for (let i = 0; i < 40; i++) {
                    const m = (a + b) / 2;
                    if (y(m) > 0) a = m;
                    else b = m;
                }
                return (a + b) / 2;
            };
            const miss = async (t, mondOben, daemmer = null) => {
                if (taub) r._ensureSkyEnvironment = () => true; // der taube Maler
                const nr0 = s._skyEnvLeseNr || 0;
                uhr(t);
                const gemalt = (s._skyEnvLeseNr || 0) !== nr0; // der Sprung malt die Umgebung der neuen Stunde
                const sonneGemalt = r._dayNightSunDirection(r._sonnenWinkel(s.timeOfDay));
                await s._skyEnvLesung;
                delete r._ensureSkyEnvironment;
                if (ankerSpaet && !r._sonnenAnker) {
                    r._sonnenAnker = ankerSpaet; // die späte Antwort des Fadens, wie sie im Rennen landete
                    r._himmelSprung = true;
                }
                const env = r._himmelsIrradianz();
                const sprung = env ? Math.PI * lum(env.oben) : 0;
                const ort = lum(r._himmelsBestrahlung([0, 0, 0]));
                const ziffern = (x) => +x.toPrecision(4);
                const sonneGelesen = r._dayNightSunDirection(r._sonnenWinkel(s.timeOfDay));
                if (sonneGelesen.distanceTo(sonneGemalt) > 1e-6)
                    out.befunde.push(
                        `S0 Himmel: die Sonne sprang im Messfenster — gemalt bei y ${sonneGemalt.y.toFixed(4)}, gelesen bei y ` +
                            `${sonneGelesen.y.toFixed(4)}: ein Schreiber der Bahn (\`_sonnenAnker\` aus \`_sonnenAnkerFragen\`) landete ` +
                            "zwischen Malung und Lesung, die Umgebung trägt die alte Bahn"
                    );
                const sonneY = r._dayNightSunDirection(r._sonnenWinkel(s.timeOfDay)).y;
                const grad = (y) => +((Math.asin(y) * 180) / Math.PI).toFixed(2);
                const nachts = t === 0;
                const mondY = r._mondRichtung().y;
                const sterne = nachts ? sterneLuft(sonneY) : null;
                const MO = AnazhRealm.MOONLIGHT;
                const mondRicht = nachts && mondY > 0 ? lum([MO.r, MO.g, MO.b]) * MO.intensity * mondY * r._mondDurchlass(mondY) : 0;
                const boden = nachts ? sterne + 0.1 * mondRicht : null;
                const teile = nachts && A.tafel ? { sonne: teil(1, 0, 0), mond: teil(0, 1, 0), sterne: teil(0, 0, 1) } : null;
                out.himmel.push({
                    uhr: t, gemalt, sprung: ziffern(sprung), ort: ziffern(ort), mondOben: !!mondOben,
                    ...(daemmer != null ? { daemmer, sonneGrad: grad(sonneY), mondGrad: grad(mondY) } : {}),
                    ...(nachts ? { sterne: ziffern(sterne), boden: ziffern(boden), sonneGrad: grad(sonneY), mondGrad: grad(mondY), teile: teile && { sonne: ziffern(teile.sonne), mond: ziffern(teile.mond), sterne: ziffern(teile.sterne) } } : {}),
                });
                const wo = daemmer != null ? `die Dämmerung (Sonne ${grad(sonneY)}°)` : nachts ? (mondOben ? "die Mitternacht mit dem Mond am Himmel" : "Mitternacht") : "Mittag";
                if (!gemalt || !(Math.abs(sprung - ort) <= (daemmer != null ? tolD : tol) * ort + (nachts || daemmer != null ? 0 : 0.005)))
                    out.befunde.push(
                        `S0 Himmel: nach dem Sprung auf ${wo} trägt die Umgebung die Bestrahlung ` +
                            `${ziffern(sprung)}${gemalt ? "" : " (ungemalt)"}, der Himmel des Orts ${ziffern(ort)} — ` +
                            // DER TÄTER DER DÄMMERUNG: gemalt, und das Bild trägt mehr Himmel, als der Messer liest — die Tafel des
                            // Messers löst die Sonne unter dem Horizont nicht auf.
                            // DER TÄTER DER NACHT: gemalt, mehr als das Gesetz, die Sonne in der astronomischen Nacht und im Gesetz
                            // ohne Licht — dann trägt der Maler Licht einer Quelle im Erdschatten (Ψ_ms über dem Boden seiner Ablage)
                            (gemalt && daemmer != null && sprung > ort
                                ? `der Messer liest den Himmel nicht, den das Bild trägt (das ${(sprung / Math.max(ort, 1e-30)).toFixed(2)}-Fache): die ` +
                                  "Bestrahlungs-Tafel löst die Sonne unter dem Horizont nicht auf — ihre Ablage ohne das Maß der Dämmerung, " +
                                  "eine Halb-Float-Stufe 5,96e-8 je Einheit E0 (`passBestrahlung` und `tafelMass` in welt-licht.js; Leser " +
                                  "`bestrahlung` → `_belichtungAusLicht`)"
                                : gemalt && nachts && teile && sprung > ort && sonneY < Math.sin((-18 * Math.PI) / 180) && teile.sonne <= tol * ort
                                ? `die Umgebung trägt ${ziffern(sprung - ort)} über dem Gesetz (Sonne ${ziffern(teile.sonne)} · Mond ` +
                                  `${ziffern(teile.mond)} · Sterne ${ziffern(teile.sterne)}), und die Sonne steht bei ${grad(sonneY)}° im Erdschatten ` +
                                  "(unter −18° trägt sie kein Licht zum Himmel): die Himmels-Sicht streut Licht einer Quelle, die keine Luft " +
                                  "trifft — Ψ_ms liest über dem Boden seiner Ablage (`mehrfach` und `passMehrfach`, `MS_LOG` in welt-licht.js)"
                                : "die Himmels-Umgebung (`_ensureSkyEnvironment`) folgt dem Sprung der Uhr nicht: gemalt vor der Luft-Farbe " +
                                  "(`_dayNightApplyLuft`) oder vom Sprung in der Raten-Drossel (SKY_ENV_REGEN_MIN_MS) gehalten")
                    );
                if (nachts && !(sprung >= (1 - tol) * boden && ort >= (1 - tol) * boden))
                    out.befunde.push(
                        `S0 Himmel: der Himmel der Nacht fehlt — um ${wo} trägt die Umgebung ${ziffern(sprung)}, der Himmel des ` +
                            `Orts ${ziffern(ort)}, der Boden der Nacht ${ziffern(boden)} (das Sternen-Licht des Gesetzes durch die Luft ` +
                            `${ziffern(sterne)}${mondY > 0 ? `, dazu ein Zehntel des Mond-Richtlichts ${ziffern(mondRicht)} bei ${grad(mondY)}°` : `, der Mond steht bei ${grad(mondY)}° unter dem Horizont`}; Sonne ` +
                            `${grad(sonneY)}°) — die Tafeln tragen Mond und Sterne nicht ` +
                            "(`__weltLicht.tafelLicht` aus `_atmoTakt`: `AnazhRealm.MOONLIGHT`, `_atmoSternenLicht`)"
                    );
            };
            for (const t of [0.5, 0]) await miss(t, false);
            if (!schein || schein === "daemmer-stufe") {
                if (schein) {
                    // die Tafel der CPU ohne das Maß der Dämmerung: unter dem Horizont jede Zahl auf der Halb-Float-Stufe ihrer
                    // Bestrahlung je Einheit E0 (D3D schneidet ab), zurück im Maß — was der Leser bis belichtung-daemmerung las
                    const [T, W] = [A.tafel, A.tafel.W];
                    const w = Float32Array.from(T.werte);
                    const halb = (x) => {
                        if (!(x > 0)) return 0;
                        const p = 2 ** (Math.max(Math.floor(Math.log2(x)), -14) - 10);
                        return Math.floor(x / p) * p;
                    };
                    for (let i = 0; i < W - 1; i++) {
                        const c = (i / (W - 2)) * 2 - 1;
                        const mu = Math.max(-1, Math.min(1, c * Math.abs(c)));
                        if (!(mu < 0)) continue;
                        const m = __weltLicht.tafelMass(mu);
                        for (let k = 0; k < 3; k++) w[i * 3 + k] = halb(T.werte[i * 3 + k] / m) * m;
                    }
                    tafelSchein = { vor: T, schein: (A.tafel = { ...T, werte: w }) };
                }
                for (const g of daemmerGrad) {
                    const t = uhrBei(g);
                    if (t == null) {
                        out.befunde.push(`S0 Himmel: die Sonne der Probe erreicht am Abend ${g}° nicht (ihre Bahn, \`_sonnenBahn\`) — die Dämmerung bleibt ungemessen`);
                        continue;
                    }
                    await miss(t, false, g);
                }
                if (tafelSchein && A.tafel === tafelSchein.schein) A.tafel = tafelSchein.vor;
                tafelSchein = null;
                // zurück auf Mitternacht: die zweite Mitternacht sucht den Tag des hohen Monds an der Uhr, die steht
                uhr(0);
                await s._skyEnvLesung;
            }
            if (msSchein) {
                // der Schein geht: Durchlass und Ψ_ms zeichnen neu, mit ihnen Himmels-Sicht, Bestrahlung und Umgebung
                A.tafelnFrisch = false;
                msSchein = false;
                uhr(0.5);
                await s._skyEnvLesung;
                uhr(0);
                await s._skyEnvLesung;
            }
            if (!schein) {
                // die zweite Mitternacht: der erste Tag der Welt, an dem der Mond um Mitternacht hoch steht
                const wm = s.worldMeta;
                tagAnkunft = wm.tag || 0;
                let k = 1;
                for (; k <= 60; k++) {
                    wm.tag = tagAnkunft + k;
                    if (r._mondRichtung().y >= 0.3) break;
                }
                if (k > 60) {
                    out.befunde.push("S0 Himmel: in 60 Tagen der Welt steht der Mond um Mitternacht nie 17° hoch — die Bahn des Monds trägt keinen Lauf (`_sonnenBahn`, `kosmosZeit(...).mond`)");
                } else {
                    uhr(0.5);
                    await s._skyEnvLesung;
                    await miss(0, true);
                    out.mondTag = k;
                }
                wm.tag = tagAnkunft;
                tagAnkunft = null;
                uhr(0.5);
                await s._skyEnvLesung;
                uhr(0);
                await s._skyEnvLesung;
            }
            } finally {
                if (tagAnkunft != null) s.worldMeta.tag = tagAnkunft;
                if (tafelSchein && s.atmoLut.tafel === tafelSchein.schein) s.atmoLut.tafel = tafelSchein.vor;
                if (msSchein) s.atmoLut.tafelnFrisch = false; // Durchlass und Ψ_ms zeichnen im nächsten Takt neu, mit ihnen jede Tafel
                if (ankerSpaet && !r._sonnenAnker) r._sonnenAnker = ankerSpaet;
                if (schein === "nachtlos") {
                    AnazhRealm.MOONLIGHT = MO;
                    delete r._atmoSternenLicht;
                }
            }
            return out;
        },
        schein || null,
        S0_HIMMEL_TOL,
        S0_DAEMMER_GRAD,
        S0_DAEMMER_TOL
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
// Kontrast der Nacht gate:post-kette (h), die Dämmerung die Tag-Achse. DER TÄTER BEIM NAMEN (w27-boden-nah-2): trägt das Mittel
// und reißt nur der Anteil abgesoffen, ist es der STOFF — das Korn des Mikro-Reliefs (`_mikroStoff`, die Spalte `korn` der Zeile
// erde in der Stoff-Tafel) nimmt der Mulde zu viel Albedo. Der Zug z352 fiel so (w26-boden-nah, Korn × Kavität 3,6 linear im Himmels-Licht: Luma 24,6,
// abgesoffen 10,0 % auf der Radeon wie auf swiftshader; main mit 2,1 stand bei 4,0 %, pascal bei 6,4 %), und das Urteil nannte
// Belichtung und Post-Kette. Seit w28-himmel-korn liest das Himmels-Licht kein eigenes Bild der Höhe mehr: in der Nacht steht
// das Korn der Albedo allein. Der Zweig „kein Sternen-Licht" fiel dafür: seit licht.K1 schwärzt es den Boden nie (oben).
// Selbsttest: die Zahlen von z352 MÜSSEN `_mikroStoff` nennen. Die letzte Zeile des Laufs trägt Luma und Anteil der Nacht (der
// Probe-Post liest sie).
// DAS LICHT JE ALBEDO (Welle SAMEN, Wort des Koordinators 20.11.): die Wand urteilt die Licht-Kette, nie den Wurf. Das Korn des
// Boden-Stoffs liegt in der Welt (`_mikroStoff`: 1 + korn · h, mittelfrei), die Feuerstelle landet, wohin der Strom des Satzes sie
// wirft (`near_player 3`) — ein anderer Strom (samen-core, je DSL-Op ihr Strom) warf sie 0,82 m daneben auf einen dunkleren Fleck
// desselben Stoffs: Luma 22,3 → 21,8 am Ring bei GLEICHEM Licht (Belichtung 46 770,794, Pool, Himmel gleich; OMEN wie Radeon). Darum
// misst der Schuss ohne das Feuer an derselben Kamera auch die ALBEDO (wie `__albedoSicht`: hell − dunkel unter weißem
// Umgebungslicht π im linearen Ziel, `__linsenZiel`) am Ring (`ring`) und am Stoff um ihn (`stoffM`, 1–10 m: viele Körner, der
// Wurf verschiebt ihn kaum), und das Urteil liest den Ring am Gesetz: je Pixel sein Licht je Albedo (linear ÷ Albedo des Pixels)
// × die Albedo des Stoffs, zurück in sRGB, davon der MEDIAN (`gesetz.luma`). Gemessen (GTX 1060, je zwei Boots): Fleck 0,1067
// (Samen) / 0,1085 (main + Laub-Kante 5), Stoff 0,1177 / 0,1178 — am Gesetz 22,79 / 22,89 (0,44 % auseinander), am Fleck 21,8 / 22,3.
// DER REST beim Namen: das Licht je Albedo streut je Pixel q10–q90 18,2–26,7 — die Mulden des Korns (`_mikroGestalt` kippt die
// Normale; die Nacht schattiert sie, die Lampe der Albedo nicht) und die sRGB-Kurve (konkav: mehr Streuung, kleineres Mittel). Das
// Mittel trug den Fleck mit (23,3 / 23,6, 1,3 %; das Mittel des Linearen 26,9 / 27,2, 0,8 %), der Median nicht. Abgesoffen bleibt
// am Pixel des Flecks (die Mulden des Korns sind der Stoff, nicht der Wurf).
// DIE SOLL IN DER EINHEIT DES GESETZES (Wort des Koordinators 20.11.): die Mitte zwischen dem Bruch von z637 am Gesetz und dem kleineren
// gesunden Wert. z637: die Nah-Bühne ohne den EINEN Leser `_sichtZeichner` las 21,4 am Fleck, wo der gesunde Kopf 22,3 las (× 0,9596,
// −4,0 %) — am Gesetz 22,89 × 0,9596 = 21,97; der kleinere gesunde Wert 22,79 (Samen); die Mitte 22,38 → 22,4. Die alte Soll 22 galt
// am Fleck (main 1,3 % darüber); am Gesetz hätte sie den Bruch von z637 nicht mehr genannt.
const S0_NACHT = {
    nacht: { luma: 22.4, schwarz: 0.05 },
    ring: [1, 1.5, 2, 2.5, 3],
    stoffM: [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 7, 8, 9, 10],
    albedoMin: 0.005, // ein Pixel ohne Albedo (Glut, Leere) trägt kein Licht je Albedo
    gesund: { kopf: 22.79, basis: 22.89 }, // am Gesetz, GTX 1060 (Samen 02447ebc + Median, main + Laub-Kante 5 e77d5ff4)
    bruchZ637: 0.9596, // 21,4 ÷ 22,3: der Bruch von z637 im Verhältnis zum gesunden Licht
};
function s0NachtUrteil(e, soll) {
    const g = e.grund;
    if (!g) return ["S0 Nacht: kein Boden im Schuss um Mitternacht — die Probe ist blind"];
    const a = e.gesetz;
    if (!a || !(a.aRing > 0) || !(a.aStoff > 0))
        return [`S0 Nacht: keine Albedo am Ort des Schusses (${JSON.stringify(a)}) — die Probe ist blind (Licht je Albedo, \`__linsenZiel\`)`];
    // ABGESOFFEN (sonnenbahn 2, Wort des Koordinators 25.11.): der Boden, den das Licht der Nacht TRIFFT (Mond-Sicht > 0, `imLicht`)
    // und der doch schwarz ist — der Schlagschatten des Mondes ist Geometrie, kein Bruch der Kette (er steht als Lesewert in der
    // Zeile). Ohne die Sicht des Mondes (kein Richtlicht der Nacht, die gestellten Zahlen der Selbsttests) der Boden 1–3 m.
    const L = a.imLicht;
    if (L && !(L.n > 0))
        return [
            `S0 Nacht: das Licht der Nacht trifft keinen Boden 1–3 m (Mond-Sicht 0 an jedem Pixel des Rings, Mond ${e.mondHoehe}°) — ` +
                "das Richtlicht der Nacht fehlt im Bild (`directionalLight`, `_dayNightApplyToScene`)",
        ];
    const schwarz = L ? L.schwarz : g.schwarz;
    if (a.luma >= soll.luma && schwarz <= soll.schwarz) return [];
    const taeter =
        a.luma >= soll.luma
            ? "das Mittel trägt, die Mulden saufen ab — das Korn des Mikro-Reliefs nimmt der Mulde zu viel Albedo (`_mikroStoff`, " +
              "die Spalte `korn` der Zeile erde in der Stoff-Tafel)"
            : `der Himmel trägt Licht (Sternen-Licht ${e.stern}, Umgebung ${e.himmel}), das Bild schwärzt es — die Belichtung ` +
              "der Nacht (`_dayNightApplyBelichtung`) oder die Post-Kette (Kontrast 25c, gate:post-kette (h))";
    return [
        `S0 Nacht: der Boden 1–3 m ohne das Feuer um Mitternacht trägt am Gesetz Luma ${a.luma} (Licht je Albedo: der Fleck ${a.aRing}, ` +
            `sein Stoff ${a.aStoff}; am Fleck ${g.luma}), abgesoffen ${(100 * schwarz).toFixed(1)} %${L ? " im Licht der Nacht" : ""} ` +
            `(Soll ≥ ${soll.luma} und ≤ ${(100 * soll.schwarz).toFixed(1)} %, die Nacht der EINEN Licht-Kette) — ${taeter}`,
    ];
}
const S0_FRIST_S = Math.max(30, Number(opt("--frist", 170)) || 170);
async function lichtLauf() {
    const { AUSGABE_INSTALL } = require("./lib/ausgabe-aufnahme.cjs");
    const { LINSEN_INSTALL } = require("./lib/licht-linsen.cjs");
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
    const { adapterZeile, istHardwareAdapter } = require("./lib/software-gpu.cjs");
    const adapter = await adapterZeile(browser);
    const HW = istHardwareAdapter(adapter);
    const GERAET = `${adapter.vendor}/${adapter.architecture}`;
    const ende = async (befund) => {
        console.log(`\n⛔ S0 BILD ROT: ${befund} (${Math.round((Date.now() - t0) / 1000)} s)\n`);
        await browser.close().catch(() => {});
        server.close();
        process.exit(1);
    };
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(s0PipeRegister);
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
    const json = jsonLesen(BUEHNE_DATEI);
    const ergebnis = {};
    const himmel = {}; // der Himmel folgt dem Sprung (oben `himmelProbe`): sauber und — im Selbsttest — der taube Maler
    let wache = null; // der Schein der Wache (Selbsttest): das Urteil über ein Werk, das ein benannter Rufer räumte
    let boden = null; // die Übersetzung des Boden-Programms (oben `S0_MS`)
    try {
        await phase("Laden", async (rest) => {
            await page.goto(url, { waitUntil: "domcontentloaded", timeout: rest });
            await weltTor(page, json);
            zeit("die Bühne importiert");
        });
        await phase("Boot", async () => {
            const b = await booteWelt(page);
            if (!b.ok) throw new Error("Boot nicht bereit nach 120 s");
            zeit("die Bühne gebootet");
            await page.evaluate(AUSGABE_INSTALL);
            await page.evaluate(S0_NAH_INSTALL);
            await page.evaluate(S0_GESTALT_INSTALL);
            await page.evaluate(LINSEN_INSTALL);
        });
        for (const schein of SELBSTTEST ? [null, "taub", "nachtlos", "anker-spaet", "erdschatten", "daemmer-stufe"] : [null]) {
            himmel[schein || "sauber"] = await phase(schein ? "Himmel " + schein : "Himmel", () => himmelProbe(page, schein));
            zeit(schein ? `der Himmel (Schein ${schein}) gemessen` : "der Himmel nach dem Sprung gemessen");
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
                            // am Rand des Genesis-Orts, 2 m jenseits seines Freiraums, zwischen zwei Toren
                            const R0 = window.__fachwerkCore.GENESIS_ORT.freiraum.r + 2;
                            const w0 = Math.PI / 10;
                            const sx = st.x + R0 * Math.cos(w0);
                            const sz = st.z + R0 * Math.sin(w0);
                            const y0 = r.getTerrainHeightAt(sx, sz);
                            s.playerMesh.position.set(sx, y0 + 1, sz);
                            const vor = new Set(s.architectures);
                            const pm = s.playerMesh.position;
                            let feuer = null;
                            for (const weiter = __deckel("die Feuerstelle", 3000); !feuer && weiter(); ) {
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
                        for (const weiter = __deckel("die Feuerstelle und ihr Boden", 3000); weiter(); ) {
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
        // die Schüsse: das Feuer um Mitternacht (sauber), die Nacht ohne das Feuer (`S0_NACHT`, unten), der Pool leer bei der
        // GEHALTENEN Blende des sauberen Schusses (`gehalten`, der Kreis netto: oben `S0_LUMA_2M`) — und im Selbsttest das Feuer bis
        // K11b, die Nacht unter der Kamera 2 Stufen tiefer und das Auge des Tages
        const schuesse = ergebnis.sauber ? [] : [false, "nacht", "gehalten", ...(SELBSTTEST ? ["farbe", "kamera", "tag", "messer"] : [])];
        for (const schein of schuesse) {
            ergebnis[schein || "sauber"] = await phase(schein ? "Schuss " + schein : "Schuss", () =>
                page.evaluate(async (schein, nahM, palette, NACHT, kHalt) => {
                    const s = st;
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
                    // DER POOL LEER BEI GEHALTENER BLENDE (Entscheid des Koordinators 25.11.): derselbe leere Pool wie die Nacht, die
                    // Blende bei der Welt bestellt (`_blendeBestellen`, nie am Renderer) auf das k des sauberen Schusses — die Albedo-
                    // und L1-Lampen der Nacht fährt er nicht
                    const ohnePool = ohneFeuer || schein === "gehalten";
                    if (schein === "gehalten") {
                        if (!(kHalt > 0)) throw new Error("S0 Schuss gehalten: der saubere Schuss trägt keine Belichtung");
                        r._blendeBestellen({ k: kHalt });
                    }
                    if (ohnePool)
                        r._leuchtTakt = function () {
                            alt.call(this);
                            for (const u of this.state.atmoUniforms.lichtLage) u.value.w = 0;
                        };
                    // DIE NACHT OHNE DAS FEUER auch für den Messer (sonnenbahn 2, `_poolAmBild`): der Schuss löscht JEDEN Platz des
                    // Pools im Bild (oben: jede `lichtLage` w 0 — Feuer, Esse, Tor, Laterne), der Messer liest denselben leeren Pool
                    // (`_leuchtQuellen` ohne Quelle). Bis hier war der Messer dem Feuer unter dem Auge blind, die Uniforms allein trugen
                    // es; ein Messer, der nur das Feuer verlor, las Esse (5,7 m) und Tor im leeren Bild: k 35 017, die Nacht am Gesetz 1,55
                    if (ohnePool) {
                        r._leuchtQuellen = () => [];
                        if (r._leuchtPool) r._leuchtPool.t = -Infinity;
                    }
                    // der Schein des Messers: er liest den Pool am Boden des Bilds nicht (der Messer des Himmels allein)
                    if (schein === "messer") r._poolAmBild = (w, aus) => ((aus[0] = w[0]), (aus[1] = w[1]), (aus[2] = w[2]), aus);
                    // der Schein der Kamera: die Stufen der 18-%-Karte 2 tiefer (`_belichtungStufen`, das EINE Glied der Kamera) —
                    // die Uhr unten wendet die Belichtung an (`_dayNightApplyBelichtung`)
                    const AR = AnazhRealm;
                    const stufenAlt = AR._belichtungStufen;
                    if (schein === "kamera") AR._belichtungStufen = (h, q) => stufenAlt.call(AR, h, q) - 2;
                    // der Farb-Schein: der Platz des Feuers leuchtet wie bis K11b in der Glut-Palette (sRGB → linear) — die Farbe
                    // des Stoffs statt der Farbtemperatur
                    // der Tag-Schein: das Auge des Tages — die Post-Kette ohne das Auge der Nacht (`nightFactor` 0, volle
                    // Sättigung wie bis K66), über jede Anwendung der Uhr hinweg
                    const tagUhr = r._applyDayNightToScene;
                    if (schein === "tag")
                        r._applyDayNightToScene = function () {
                            tagUhr.call(this);
                            if (this.state.postProcessingUniforms) this.state.postProcessingUniforms.nightFactor.value = 0;
                        };
                    // (licht-eine-skala) GENAU EINE Eigenschaft anders: der Ton. Die Stärke des Platzes bleibt die des Welt-Feuers
                    // (`_leuchtStaerke`: cd ÷ EINHEIT_LX × Schaltplan, getragen vom hellsten Kanal — die Lichtfarbe ist auf ihn
                    // normiert, `lichtFarbe`); die Palette auf ihren hellsten Kanal normiert, nie × Zeitplan (er fiel als Belichtung)
                    if (schein === "farbe") {
                        const pal = new T.Color().set(palette.hex);
                        pal.multiplyScalar(1 / Math.max(pal.r, pal.g, pal.b));
                        r._leuchtTakt = function () {
                            alt.call(this);
                            const A = this.state.atmoUniforms;
                            for (let k = 0; k < A.lichtLage.length; k++) {
                                const p = A.lichtLage[k].value;
                                const c = A.lichtFarbe[k].value;
                                if (p.w > 0 && Math.hypot(p.x - f.x, p.z - f.z) <= 1.5)
                                {
                                    const hell = Math.max(c.x, c.y, c.z);
                                    c.set(pal.r * hell, pal.g * hell, pal.b * hell, c.w);
                                }
                            }
                        };
                    }
                    const FC = window.__fachwerkCore;
                    const flAlt = FC.lichtFlackern;
                    FC.lichtFlackern = () => 0; // die Flamme steht still (der Schuss misst das Gesetz, nicht den Atem)
                    const cam = s.camera;
                    let auf = null;
                    let albedoBild = null;
                    let himmelL = null;
                    let sternL = null;
                    let mondL = null;
                    let mondHoehe = null;
                    window.__s0Still = false; // der Schuss zeichnet
                    // die Nah-Bühne (oben): auf swiftshader zeichnet der Schuss die Nähe des Feuers
                    const nahLos = nahM ? window.__s0Nah(new T.Vector3(f.x, g, f.z), nahM) : null;
                    let nahZahl = null;
                    // DAS BODEN-PROGRAMM (oben S0_STOFF und S0_MS): je Render-Objekt des Boden-Stoffs das erzeugte Fragment, das der
                    // Schuss zeichnet (der Zustand des Render-Objekts, wie `__shaderKosten`), und je Programm ein Render-Objekt
                    const bodenWgsl = new Map();
                    const bodenRo = (window.__s0BodenRo ??= new Map());
                    const objs = rend._objects;
                    const roh = objs.get;
                    objs.get = function (...a) {
                        const ro = roh.apply(this, a);
                        if (ro && ro.material === s.voxelChunkMaterial) {
                            const st = ro.getNodeBuilderState();
                            if (st?.fragmentShader) bodenWgsl.set(st.fragmentShader, (bodenWgsl.get(st.fragmentShader) || 0) + 1);
                            if (st?.fragmentShader) bodenRo.set(st.fragmentShader, ro);
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
                        await sleep(1000 * AnazhRealm.LICHT_POOL.blendeS + 100);
                        // der Satz „messung" (K32, scripts/lib/abnahme-urteil.cjs): der Schuss ist ein Mess-Frame der Nacht — sein
                        // Urteil liest den Kreis um das Feuer (kreis, ton) aus den Pixeln; die Belichtungs-Zeile des Beweis-Satzes
                        // (Tag-Bühne, abgesoffen ≤ 60 %) warf hier an der Mitternacht (schwarz 71,9 %, Kreis hell)
                        // der Schein übersetzt nichts (dieselben Programme, nur Uniform-Werte): EINE Aufnahme mit ihren 32 Warm-Frames
                        for (let i = 0; i < (schein ? 1 : 2); i++) {
                            auf = await window.__ausgabeAufnahme(w, h, 1, { satz: "messung" });
                        }
                        // das Licht des Himmels im Schuss (der Täter der Nacht beim Namen): die Bestrahlung der Umgebung von oben
                        // und das Sternen-Licht der EINEN Atmosphäre (Zenit-Leuchtdichte, Welt-Einheiten) bei der Sonne des Schusses
                        // — in geltenden Ziffern: die Nacht liegt um 1e-5 Welt-Einheiten, vier Stellen nach dem Komma druckten 0 (25.11.,
                        // main und Kopf der Sonnenbahn: „Himmel 0 Sternen-Licht 0“); daneben das Richtlicht (der Mond) auf der Waagrechten
                        // und der Anteil des Himmels daran — das zweite Licht des Mondschattens
                        const env = r._himmelsIrradianz();
                        const sonneY = r._dayNightSunDirection(r._sonnenWinkel(s.timeOfDay)).y;
                        const ziffern = (x) => +x.toPrecision(4);
                        himmelL = env ? ziffern(Math.PI * luma709(env.oben)) : null;
                        sternL = ziffern(luma709(r._atmoSternenLicht(sonneY)));
                        const dl = s.directionalLight;
                        const dy = dl ? dl.position.clone().sub(dl.target.position).normalize().y : 0;
                        mondL = dl ? ziffern(luma709([dl.color.r, dl.color.g, dl.color.b]) * dl.intensity * Math.max(0, dy)) : null;
                        mondHoehe = +((Math.asin(Math.max(-1, Math.min(1, dy))) * 180) / Math.PI).toFixed(2);
                        // DIE ALBEDO AM ORT (oben `S0_NACHT`, Licht je Albedo): ohne das Feuer an derselben Kamera zwei Bilder ins lineare
                        // Ziel unter der Lampe der Linse (weißes Umgebungslicht π, die übrigen Lichter, der Himmel und die Luft still).
                        // Die Lampe ist eine Licht-Variante der Linse, kein Programm des Spiels: ihr Boden-Programm zählt das
                        // Boden-Programm des Schusses (oben `S0_MS`, `S0_ZEICHEN`) nicht — am 20.11. hieß es „Boden-Programm 2 … synchron“
                        if (ohneFeuer) {
                            const zl = window.__linsenZiel(w, h);
                            const sc = s.scene;
                            const lichter = [];
                            sc.traverse((o) => o.isLight && lichter.push([o, o.intensity]));
                            const [envA, amb, luftZ, haken] = [sc.environment, new T.AmbientLight(0xffffff, 0), zl.ohneLuft(), objs.get];
                            let envZurueck = envA; // die Umgebung, die nach den Lampen der Linse wieder gilt (L1 springt die Uhr)
                            objs.get = roh;
                            sc.add(amb);
                            try {
                                for (const [l] of lichter) l.intensity = 0;
                                sc.environment = null;
                                amb.intensity = Math.PI;
                                await zl.ruhe(cam, "S0 Albedo");
                                for (let i = 0; i < 2; i++) zl.zeichne(cam);
                                const hell = await zl.lies();
                                amb.intensity = 0;
                                for (let i = 0; i < 2; i++) zl.zeichne(cam);
                                albedoBild = { hell, dunkel: await zl.lies() };
                                // DIE SICHT DES MONDES (sonnenbahn 2, Wort des Koordinators 25.11.): dasselbe Ziel allein unter dem
                                // Richtlicht der Nacht (die Lampe aus, die Umgebung still) — ein Pixel ohne sein Licht liegt im Schatten
                                // des Mondes (Geometrie, kein Bruch der Kette); abgesoffen zählt nur der Boden, den es TRIFFT.
                                // DIE UMGEBUNG STILL heißt ihre Einheit 0 (`U.licht` der Tafeln): die Umgebung der Stoffe ist der Knoten
                                // der Szene (`scene.environmentNode`, r184 `getEnvironmentNode` nimmt ihn vor `scene.environment`) — bis
                                // sonnenbahn 3 leuchtete sie in die Sicht des Mondes, und der Mond selbst lag unverstärkt (Albedo · E ÷ π
                                // ≈ 1e-7) im Halb-Float des Ziels unter seiner kleinsten normalen Zahl: × G = 1 ÷ (Himmel + Richtlicht)
                                const dlI = lichter.find(([l]) => l === dl);
                                const UL = r._atmoLutBau().U.licht;
                                if (dl && dlI && dlI[1] > 0) {
                                    const lA = UL.value;
                                    try {
                                        UL.value = 0;
                                        dl.intensity = dlI[1] * (himmelL + mondL > 0 ? 1 / (himmelL + mondL) : 1);
                                        for (let i = 0; i < 2; i++) zl.zeichne(cam);
                                        albedoBild.mond = await zl.lies();
                                    } finally {
                                        dl.intensity = 0;
                                        UL.value = lA;
                                    }
                                }
                                // L1 (Wort des Koordinators 25.11. 05:30): EINE Atmosphäre, der Mond ist nur die schwächere Lampe — am
                                // Boden das Licht der Umgebung allein gegen das des Richtlichts allein, unter dem Mond und unter der Sonne
                                // in derselben Höhe. Die Umgebung der Stoffe ist der Knoten der Szene (`scene.environmentNode`, r184
                                // `getEnvironmentNode`: er gilt vor `scene.environment`) — sie bleibt an, das Richtlicht kommt dazu:
                                // Richtlicht = beide − Umgebung. Beide × G = 1 ÷ (Himmel + Richtlicht) der Lesung, die Umgebung über die
                                // Einheit der Tafeln (`U.licht`, nur `_atmoTakt` schreibt sie): ein Pixel der Nacht (Albedo · E ÷ π ≈ 1e-7)
                                // läge im Halb-Float des Ziels unter seiner kleinsten normalen Zahl
                                const paar = async (G) => {
                                    const [dI, lA] = [dl.intensity, UL.value];
                                    try {
                                        for (const [l] of lichter) l.intensity = 0;
                                        UL.value = lA * G;
                                        for (let i = 0; i < 2; i++) zl.zeichne(cam);
                                        const umgebung = await zl.lies();
                                        dl.intensity = dI * G;
                                        for (let i = 0; i < 2; i++) zl.zeichne(cam);
                                        return { umgebung, beide: await zl.lies() };
                                    } finally {
                                        dl.intensity = 0;
                                        UL.value = lA;
                                    }
                                };
                                if (schein === "nacht" && dl && dlI && dlI[1] > 0 && himmelL + mondL > 0) {
                                    dl.intensity = dlI[1];
                                    albedoBild.l1 = { nacht: await paar(1 / (himmelL + mondL)) };
                                    // die Sonne in der Höhe des Mondes, am Vormittag (die Höhe steigt bis Mittag)
                                    const hoeheBei = (t) => r._dayNightSunDirection(r._sonnenWinkel(t)).y;
                                    const ziel = Math.sin((mondHoehe * Math.PI) / 180);
                                    let [a, b] = [0.5, 0.5];
                                    while (a > 0 && hoeheBei(a) >= ziel) a -= 0.01;
                                    for (let i = 0; i < 40; i++) {
                                        const m = (a + b) / 2;
                                        if (hoeheBei(m) < ziel) a = m;
                                        else b = m;
                                    }
                                    await uhr(b);
                                    const envT = r._himmelsIrradianz();
                                    const dyT = dl.position.clone().sub(dl.target.position).normalize().y;
                                    const hT = ziffern(Math.PI * luma709(envT.oben));
                                    const rT = ziffern(luma709([dl.color.r, dl.color.g, dl.color.b]) * dl.intensity * Math.max(0, dyT));
                                    await zl.ruhe(cam, "S0 L1 Tag");
                                    albedoBild.l1.tag = Object.assign(await paar(1 / (hT + rT)), {
                                        uhr: +b.toFixed(5),
                                        hoehe: +((Math.asin(dyT) * 180) / Math.PI).toFixed(2),
                                        himmel: hT,
                                        richt: rT,
                                    });
                                    await uhr(zeit);
                                    envZurueck = sc.environment;
                                    sc.environment = null;
                                    for (const [l] of lichter) l.intensity = 0;
                                }
                            } finally {
                                sc.remove(amb);
                                for (const [l, i] of lichter) l.intensity = i;
                                sc.environment = envZurueck;
                                luftZ();
                                zl.rt.dispose();
                                objs.get = haken;
                            }
                        }
                    } finally {
                        r._leuchtTakt = alt;
                        if (ohnePool) {
                            delete r._leuchtQuellen;
                            if (r._leuchtPool) r._leuchtPool.t = -Infinity;
                        }
                        if (schein === "gehalten") r._blendeBestellen(null);
                        if (schein === "messer") delete r._poolAmBild;
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
                    const lum = (i) => luma709(u8, i) / 255;
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
                    const pool = r._leuchtPool?.plaetze || [];
                    // die Programme und Pipelines (ein Wechsel der Plätze baut keins: Pool voll und leer zählen gleich)
                    const PL = rend._pipelines;
                    const zaehl =
                        PL?.programs
                            ? [PL.programs.vertex.size, PL.programs.fragment.size, PL.caches ? PL.caches.size : null]
                            : null;
                    const eigen = pool.find((p) => Math.hypot(p.x - f.x, p.z - f.z) <= 1.5);
                    // DER RING AM GESETZ (oben `S0_NACHT`): die Albedo je geschriebenem Pixel (hell − dunkel), am Ring und am Stoff um ihn;
                    // je Pixel des Rings sein Licht je Albedo × die Albedo des Stoffs, zurück in sRGB — der Median (q10/q90 die Streuung der
                    // Mulden); k (Stoff ÷ Ring) ist Auskunft
                    let gesetz = null;
                    if (albedoBild) {
                        const { hell, dunkel } = albedoBild;
                        const alb = (radien) => {
                            let [n, sa] = [0, 0];
                            ringe(radien, (i) => {
                                if (!(hell[i + 3] > 0)) return;
                                n++;
                                sa += luma709([hell[i] - dunkel[i], hell[i + 1] - dunkel[i + 1], hell[i + 2] - dunkel[i + 2]]);
                            });
                            return n ? sa / n : 0;
                        };
                        const [aRing, aStoff] = [alb(NACHT.ring), alb(NACHT.stoffM)];
                        const k = aRing > 0 ? aStoff / aRing : 0;
                        const je = [];
                        // DIE ABGESOFFENEN BEIM GRUND (25.11., Sonnenbahn: der Mond in 22° statt 74°): je Pixel unter Luma 4 sein Licht je
                        // Albedo (am Stoff, wie `je`) und seine Albedo gegen die des Rings — dunkel vom LICHT (der Schatten ohne zweites
                        // Licht) oder vom STOFF (das Korn der Mulde)
                        const [sJe, sA] = [[], []];
                        // DER SCHATTEN DES MONDES (oben, die Sicht des Mondes): je Pixel des Rings trifft ihn das Richtlicht der Nacht
                        // (Mond-Sicht > 0) oder nicht — abgesoffen zählt nur, wen es trifft; der Schatten ist ein Lesewert
                        const mond = albedoBild.mond;
                        const schattenJe = [];
                        let [nLicht, nLichtSchwarz] = [0, 0];
                        ringe(NACHT.ring, (i) => {
                            if (!(hell[i + 3] > 0)) return;
                            const a = luma709([hell[i] - dunkel[i], hell[i + 1] - dunkel[i + 1], hell[i + 2] - dunkel[i + 2]]);
                            if (!(a > NACHT.albedoMin)) return;
                            const l = 255 * linSrgb(Math.min(1, (srgbLin(luma709(u8, i)) / a) * aStoff));
                            je.push(l);
                            if (luma709(u8, i) < 4) sJe.push(l), sA.push(a / (aRing || 1));
                            if (!mond) return;
                            if (luma709(mond, i) > 0) {
                                nLicht++;
                                if (luma709(u8, i) < 4) nLichtSchwarz++;
                            } else schattenJe.push(l);
                        });
                        schattenJe.sort(aufsteigend);
                        sJe.sort(aufsteigend);
                        sA.sort(aufsteigend);
                        // DER EINE RANG (welt-boot `rang`, in jeder Seite derselbe Text): der Median und die Quantile der Mulden
                        je.sort(aufsteigend);
                        const q = (p) => (je.length ? +rang(je, p).toFixed(2) : null);
                        const schwarz = sJe.length ? { n: sJe.length, licht: +rang(sJe, 0.5).toFixed(2), albedo: +rang(sA, 0.5).toFixed(3) } : null;
                        // der Schatten: sein Anteil am Boden des Rings, sein Licht (Median) gegen das Median-Licht des Rings in EV
                        const schatten = mond
                            ? {
                                  anteil: je.length ? +(schattenJe.length / je.length).toFixed(4) : null,
                                  ev: schattenJe.length && je.length ? +Math.log2(srgbLin(rang(schattenJe, 0.5)) / srgbLin(rang(je, 0.5))).toFixed(2) : null,
                                  n: schattenJe.length,
                              }
                            : null;
                        const imLicht = mond ? { n: nLicht, schwarz: nLicht ? +(nLichtSchwarz / nLicht).toFixed(4) : null } : null;
                        // L1 AM BODEN: je Pixel des Rings die Umgebung allein und das Richtlicht allein je Albedo — ihre Mediane und ihr
                        // Verhältnis; nachts dazu die Umgebung an den Abgesoffenen im Licht des Mondes gegen ihren Median (fehlt ihnen
                        // der Himmel des Orts, oder fehlt er dem ganzen Boden)
                        const l1Von = (P) => {
                            if (!P) return null;
                            const [uJe, dJe, uSchwarz, dSchwarz] = [[], [], [], []];
                            ringe(NACHT.ring, (i) => {
                                if (!(hell[i + 3] > 0)) return;
                                const a = luma709([hell[i] - dunkel[i], hell[i + 1] - dunkel[i + 1], hell[i + 2] - dunkel[i + 2]]);
                                if (!(a > NACHT.albedoMin)) return;
                                uJe.push(luma709(P.umgebung, i) / a);
                                dJe.push((luma709(P.beide, i) - luma709(P.umgebung, i)) / a);
                                if (mond && luma709(mond, i) > 0 && luma709(u8, i) < 4) {
                                    uSchwarz.push(luma709(P.umgebung, i) / a);
                                    dSchwarz.push((luma709(P.beide, i) - luma709(P.umgebung, i)) / a);
                                }
                            });
                            [uJe, dJe, uSchwarz, dSchwarz].forEach((x) => x.sort(aufsteigend));
                            const [u, d] = [rang(uJe, 0.5), rang(dJe, 0.5)];
                            return {
                                u: +u.toPrecision(4),
                                d: +d.toPrecision(4),
                                v: d > 0 ? +(u / d).toFixed(3) : null,
                                n: uJe.length,
                                schwarzU: uSchwarz.length && u > 0 ? +(rang(uSchwarz, 0.5) / u).toFixed(3) : null,
                                schwarzD: dSchwarz.length && d > 0 ? +(rang(dSchwarz, 0.5) / d).toFixed(3) : null,
                            };
                        };
                        // DER FUSS DER TONKURVE (L1 trägt nicht, 25.11.): je Pixel des Rings mit Mond-Sicht sein lineares Licht der
                        // Lampen (Umgebung + Richtlicht, `beide`) durch die Tonkurve der Ausgabe (Khronos PBR Neutral, welt-licht.js
                        // `tonKurve`: grau 6,25 · x² unter 0,08, darüber x − 0,04), die Blende EINMAL aus dem Median des Bilds —
                        // sagt die Kurve die Abgesoffenen des Bilds voraus, liegt der Täter im Licht des Bodens UND im Fuß der Kurve;
                        // daneben die Gerade durch denselben Median (ein Fuß ohne Quadrat) und die Schwelle Luma 4 in Blenden
                        // des Eingangs unter dem Median
                        const fussVon = (P) => {
                            if (!P || !mond) return null;
                            // die Kurve der Seite (welt-licht `tonKurve`, sonnenbahn 3): grau der Fuß am Schlüssel (× 2^−n), sein
                            // Abzug × 2^n — n die Stufen hinter dem Fuß an der Stunde des Schusses (`tonStufen`)
                            const m = 2 ** __weltLicht.tonStufen().n;
                            const ton = (x) => m * (x / m < 0.08 ? 6.25 * (x / m) ** 2 : x / m - 0.04);
                            const tonInv = (y) => m * (y / m < 0.04 ? Math.sqrt(y / m / 6.25) : y / m + 0.04);
                            const [xs, ys] = [[], []];
                            ringe(NACHT.ring, (i) => {
                                if (!(hell[i + 3] > 0) || !(luma709(mond, i) > 0)) return;
                                const a = luma709([hell[i] - dunkel[i], hell[i + 1] - dunkel[i + 1], hell[i + 2] - dunkel[i + 2]]);
                                if (!(a > NACHT.albedoMin)) return;
                                xs.push(luma709(P.beide, i));
                                ys.push(srgbLin(luma709(u8, i)));
                            });
                            if (!xs.length) return null;
                            const [xm, ym, y4] = [rang([...xs].sort(aufsteigend), 0.5), rang([...ys].sort(aufsteigend), 0.5), srgbLin(4)];
                            const s = tonInv(ym) / xm;
                            let [kurve, gerade, bild] = [0, 0, 0];
                            for (let j = 0; j < xs.length; j++) {
                                if (ton(s * xs[j]) < y4) kurve++;
                                if ((xs[j] / xm) * ym < y4) gerade++;
                                if (ys[j] < y4) bild++;
                            }
                            return {
                                n: xs.length,
                                stufen: +Math.log2(m).toFixed(3),
                                eingang: +(s * xm).toFixed(4),
                                bild: +(bild / xs.length).toFixed(4),
                                kurve: +(kurve / xs.length).toFixed(4),
                                gerade: +(gerade / xs.length).toFixed(4),
                                schwelleEV: +Math.log2(tonInv(y4) / tonInv(ym)).toFixed(2),
                            };
                        };
                        const L1 = albedoBild.l1
                            ? {
                                  nacht: Object.assign(l1Von(albedoBild.l1.nacht), { fuss: fussVon(albedoBild.l1.nacht) }),
                                  tag: albedoBild.l1.tag ? Object.assign(l1Von(albedoBild.l1.tag), { uhr: albedoBild.l1.tag.uhr, hoehe: albedoBild.l1.tag.hoehe, himmel: albedoBild.l1.tag.himmel, richt: albedoBild.l1.tag.richt }) : null,
                              }
                            : null;
                        gesetz = { luma: q(0.5), q02: q(0.02), q05: q(0.05), q10: q(0.1), q90: q(0.9), aRing: +aRing.toFixed(4), aStoff: +aStoff.toFixed(4), k: +k.toFixed(3), punkte: je.length / 9, schwarz, schatten, imLicht, l1: L1 };
                    }
                    return {
                        gesetz,
                        himmel: himmelL,
                        stern: sternL,
                        mond: mondL,
                        mondHoehe,
                        kreis: nk ? +(lk / nk).toFixed(4) : null,
                        punkte: nk / 9,
                        ton,
                        grund: nt ? { luma: +(bl / nt).toFixed(1), schwarz: +(bs / nt).toFixed(3) } : null,
                        uhr: +zeit.toFixed(4),
                        lichtFarbe: eigen ? eigen.farbe.map((c) => +(c / Math.max(...eigen.farbe)).toFixed(3)) : null,
                        kelvin: FC.LICHT_GESETZ.feuer.kelvin == null ? null : FC.LICHT_GESETZ.feuer.kelvin,
                        // die Belichtung des GEZÄHLTEN Bilds (`auf.info.licht`, die Aufnahme liest sie beim Zeichnen) — nie der
                        // Renderer danach: der Schuss „gehalten“ gibt die Blende im finally oben dem Gesetz zurück (k 150 415 statt
                        // des gehaltenen 26 054 stand bis hier in der Zeile)
                        belichtung: +auf.info.licht.k.toFixed(3),
                        poolE: typeof r._poolE === "number" ? +r._poolE.toPrecision(4) : null,
                        // derselbe Pool unter dem Himmel der Nacht der REF (der Messer selbst, sein Wort `w`; `_poolE` bleibt der des Schusses)
                        poolKnoten: (() => {
                            const [K, e0] = [AnazhRealm.BELICHTUNG.nachtRefE, r._poolE];
                            if (!(K > 0)) return null;
                            r._poolAmBild([K, K, K], [0, 0, 0]);
                            const e = r._poolE;
                            r._poolE = e0;
                            return typeof e === "number" ? +e.toPrecision(4) : null;
                        })(),
                        punkteN: s.rueckstrahlLeser && s.rueckstrahlLeser.punkte ? s.rueckstrahlLeser.punkte.n : null,
                        nacht: s.postProcessingUniforms ? +s.postProcessingUniforms.nightFactor.value.toFixed(3) : null,
                        pool: pool.map((p) => ({ q: p.quelle, I: +p.staerke.toPrecision(4), d: +Math.hypot(p.x - f.x, p.z - f.z).toFixed(1) })),
                        feuer: [feuer.type, ...[f.x, g, f.z].map((x) => +x.toFixed(2))],
                        dc: auf.info && auf.info.drawCalls,
                        nah: nahZahl,
                        zaehl,
                        boden: [...bodenWgsl.keys()],
                        png: __png(u8, w, h),
                    };
                }, schein, ECHT ? 0 : S0_NAH_M, S0_TON.palette, S0_NACHT, ergebnis.sauber ? ergebnis.sauber.belichtung : null)
            );
            zeit(schein ? `der Schuss (${schein}) aufgenommen` : "das Feuer aufgenommen");
        }
        if (ergebnis.sauber && !ergebnis.sauber.fehler) {
            boden = await phase("Boden-Übersetzung", () => page.evaluate(s0BodenMessung, { hw: HW, selbst: SELBSTTEST, n: S0_MS.n }));
            zeit("das Boden-Programm übersetzt");
        }
    } catch (e) {
        if (e?.message === "FRIST")
            await ende(
                `die Frist von ${S0_FRIST_S} s riss in der Phase „${phaseJetzt}" — der Deckel der Linse (≤ 3 min CI) hält nicht`
            );
        throw e;
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
            messer: "SCHEIN (der Messer blind für den Pool am Boden des Bilds)",
            gehalten: "OHNE POOL (die Blende des Feuers gehalten)",
        }[k];
        console.log(
            `  S0 BILD ${wer}: Uhr ${e.uhr} · Feuerkreis aus 2 m Luma ${e.kreis} brutto (${e.punkte} Punkte; das Urteil liest ihn netto, S0 KREIS) · Boden 1–3 m Luma ${e.grund && e.grund.luma} abgesoffen ${e.grund && e.grund.schwarz}${e.gesetz ? ` · am Gesetz Luma ${e.gesetz.luma} (q02 ${e.gesetz.q02} · q05 ${e.gesetz.q05} · q10 ${e.gesetz.q10}; Albedo Fleck ${e.gesetz.aRing} → Stoff ${e.gesetz.aStoff}, k ${e.gesetz.k})${e.gesetz.schwarz ? ` · schwarz ${e.gesetz.schwarz.n} Pixel: Licht je Albedo am Stoff ${e.gesetz.schwarz.licht}, Albedo ${e.gesetz.schwarz.albedo} × Ring` : ""}${e.gesetz.schatten ? ` · Mondschatten ${(100 * e.gesetz.schatten.anteil).toFixed(1)} % des Bodens (${e.gesetz.schatten.n} Pixel), sein Licht ${e.gesetz.schatten.ev == null ? "0 (schwarz)" : e.gesetz.schatten.ev + " EV"} gegen das Median-Licht, Mond ${e.mondHoehe}° · abgesoffen im Licht der Nacht ${e.gesetz.imLicht.schwarz == null ? "—" : (100 * e.gesetz.imLicht.schwarz).toFixed(1) + " %"} von ${e.gesetz.imLicht.n} Pixeln mit Mond-Sicht` : ""}` : ""} Farbton ${e.ton && e.ton.hue}° Sättigung ${e.ton && e.ton.sat} sRGB ${JSON.stringify(e.ton && e.ton.rgb)} (Soll ${S0_TON.hue[0]}–${S0_TON.hue[1]}°, ≤ ${S0_TON.satMax}) · Himmel ${e.himmel} Sternen-Licht ${e.stern} · Richtlicht waagrecht ${e.mond} bei ${e.mondHoehe}° (Himmel : Richtlicht ${e.mond > 0 && e.himmel != null ? (e.himmel / e.mond).toFixed(3) : "—"}) · Lichtfarbe linear ${JSON.stringify(e.lichtFarbe)} · kelvin ${e.kelvin} · Belichtung ${e.belichtung} · Feuer ${JSON.stringify(e.feuer)} · Pool ${JSON.stringify(e.pool)} · Befehle ${e.dc} · Nah-Bühne ${JSON.stringify(e.nah)} · Programme/Pipelines ${JSON.stringify(e.zaehl)}`
        );
    }
    // L1 (Wort des Koordinators 25.11. 05:30, Lesewert): Umgebung ÷ Richtlicht am Boden unter dem Mond gegen dasselbe unter der
    // Sonne in derselben Höhe — EINE Atmosphäre, der Mond die schwächere Lampe. Das Band der Profis: das Tageslicht des klaren
    // Himmels nach IES (Lighting Handbook, RP-5: Himmel auf der Waagrechten 0,8 + 15,5 · √sin α klx, die Sonne senkrecht
    // 127,5 · e^(−0,21 ÷ sin α) klx) bei der Höhe des Schusses
    const L1 = ergebnis.nacht && ergebnis.nacht.gesetz && ergebnis.nacht.gesetz.l1;
    if (L1 && L1.nacht) {
        const sa = Math.sin((ergebnis.nacht.mondHoehe * Math.PI) / 180);
        const ies = (0.8 + 15.5 * Math.sqrt(sa)) / (127.5 * Math.exp(-0.21 / sa) * sa);
        const T = L1.tag;
        console.log(
            `  S0 L1 (Umgebung ÷ Richtlicht am Boden, Median je Pixel des Rings): Nacht (Mond ${ergebnis.nacht.mondHoehe}°) ${L1.nacht.v} ` +
                `(Umgebung ${L1.nacht.u} · Richtlicht ${L1.nacht.d}, Lesung ${ergebnis.nacht.himmel && ergebnis.nacht.mond ? (ergebnis.nacht.himmel / ergebnis.nacht.mond).toFixed(3) : "—"}) · ` +
                (T ? `Tag (Sonne ${T.hoehe}°, Uhr ${T.uhr}) ${T.v} (Umgebung ${T.u} · Richtlicht ${T.d}, Lesung ${T.richt > 0 ? (T.himmel / T.richt).toFixed(3) : "—"}) · ` : "Tag — · ") +
                `IES klar bei ${ergebnis.nacht.mondHoehe}° ${ies.toFixed(3)} · die Abgesoffenen im Licht des Mondes tragen ${L1.nacht.schwarzU ?? "—"} × die Umgebung und ${L1.nacht.schwarzD ?? "—"} × das Richtlicht des Medians` +
                    (L1.nacht.fuss
                        ? ` · DER FUSS: der Median steht im Eingang der Kurve auf ${L1.nacht.fuss.eingang} (Fuß 6,25 · x² unter 0,08 am Schlüssel, ${L1.nacht.fuss.stufen} Stufen hinter ihm), Luma 4 liegt ${L1.nacht.fuss.schwelleEV} Blenden des Eingangs unter ihm — abgesoffen im Licht: das Bild ${(100 * L1.nacht.fuss.bild).toFixed(1)} %, die Kurve aus dem Licht der Lampen ${(100 * L1.nacht.fuss.kurve).toFixed(1)} %, die Gerade durch den Median ${(100 * L1.nacht.fuss.gerade).toFixed(1)} % (${L1.nacht.fuss.n} Pixel)`
                        : "")
        );
    }
    // DIE NACHT ohne das Feuer (oben `S0_NACHT`)
    const nacht = ergebnis.nacht;
    if (sauber && !sauber.fehler) {
        if (!nacht) befunde.push("S0 Nacht: der Schuss lief nicht");
        else if (!nacht.fehler) befunde.push(...s0NachtUrteil(nacht, S0_NACHT.nacht));
    }
    // DER MESSER AM BODEN DES BILDS (sonnenbahn 2, oben `S0_MESSER_EV`): die Belichtung des Schusses mit dem Feuer gegen dieselbe
    // Nacht ohne es (der Schuss „nacht": die Wahl des Orts kennt das Feuer nicht) — der Messer liest das Feuer am Boden, den das Bild
    // zeigt. Bis sonnenbahn 2 standen beide gleich (149 434,762: der Messer am Auge sah die Quelle unter ihm nicht)
    const messerUrteil = (mit, ohne) => {
        if (!mit || mit.fehler || !ohne || ohne.fehler) return { ev: null, befund: "S0 Messer: ein Schuss fehlt — die Probe ist blind" };
        const ev = Math.log2(ohne.belichtung / mit.belichtung);
        // der Pool unter dem Himmel der Stunde gegen denselben unter der Nacht der REF (oben `S0_MESSER_NACHT_EV`)
        const nachtEv = mit.poolE > 0 && mit.poolKnoten > 0 ? Math.log2(mit.poolE / mit.poolKnoten) : null;
        return {
            ev,
            nachtEv,
            befund:
                ev >= S0_MESSER_EV
                    ? null
                    : `S0 Messer: am Feuer schließt die Belichtung ${ev.toFixed(2)} Stufen gegen die Nacht ohne es (k ${mit.belichtung} ` +
                      `gegen ${ohne.belichtung}, Pool am Boden des Bilds ${mit.poolE} aus ${mit.punkteN} Punkten; Soll ≥ ${S0_MESSER_EV}) — ` +
                      "der Lichtmesser liest den Pool am Boden des Bilds nicht (`_poolAmBild` in `_belichtungAusLicht`)",
            nacht:
                nachtEv == null
                    ? "S0 Messer: der Pool am Bild des Feuers fehlt unter dem Himmel der Stunde oder unter der Nacht der REF " +
                      `(${mit.poolE} · ${mit.poolKnoten}) — die Probe ist blind`
                    : Math.abs(nachtEv) <= S0_MESSER_NACHT_EV
                      ? null
                      : `S0 Messer: der Pool des Feuers wiegt unter dem Himmel der Stunde ${mit.poolE}, unter dem Himmel der Nacht der REF ` +
                        `${mit.poolKnoten} — ${nachtEv.toFixed(2)} Stufen (Soll ± ${S0_MESSER_NACHT_EV}): der Messer wiegt die Leuchten gegen das Dunkel ` +
                        "des Himmels, in der Nacht ohne Mond brennt der beleuchtete Boden aus (`_poolAmBild`: der Bezug seines Fensters, " +
                        "`BELICHTUNG.nachtRefE`)",
        };
    };
    if (sauber && !sauber.fehler) {
        const m = messerUrteil(sauber, nacht);
        console.log(
            `  S0 MESSER: Belichtung mit dem Feuer ${sauber.belichtung} · ohne es ${nacht && nacht.belichtung} → ${m.ev == null ? "—" : m.ev.toFixed(2)} Stufen ` +
                `(Soll ≥ ${S0_MESSER_EV}) · Pool am Boden des Bilds ${sauber.poolE} aus ${sauber.punkteN} Punkten, ohne das Feuer ${nacht && nacht.poolE} · ` +
                `derselbe Pool unter der Nacht der REF ${sauber.poolKnoten} → ${m.nachtEv == null ? "—" : m.nachtEv.toFixed(2)} Stufen (Soll ± ${S0_MESSER_NACHT_EV})`
        );
        if (m.befund) befunde.push(m.befund);
        if (m.nacht) befunde.push(m.nacht);
    }
    for (const [k, e] of Object.entries(himmel))
        for (const h of e.himmel)
            console.log(
                `  S0 HIMMEL${k === "taub" ? " SCHEIN (der Maler taub)" : k === "nachtlos" ? " SCHEIN (die Nacht ohne Mond und Sterne)" : k === "anker-spaet" ? " SCHEIN (der Anker nach der Malung)" : k === "erdschatten" ? " SCHEIN (Ψ_ms über dem Boden seiner Ablage)" : k === "daemmer-stufe" ? " SCHEIN (die Tafel ohne das Maß der Dämmerung)" : ""}: nach dem Sprung auf ${h.daemmer != null ? `die Dämmerung (Sonne ${h.sonneGrad}° · Mond ${h.mondGrad}°)` : h.uhr === 0 ? (h.mondOben ? `die Mitternacht mit dem Mond am Himmel (Tag +${e.mondTag})` : "Mitternacht") : "Mittag"} ` +
                    `Umgebung ${h.sprung} · Himmel des Orts ${h.ort}${h.ort > 0 ? ` (${(((h.sprung - h.ort) / h.ort) * 100).toFixed(2)} %)` : ""}${h.sterne == null ? "" : ` · Sonne ${h.sonneGrad}° · Mond ${h.mondGrad}° · das Gesetz des Orts nach Quellen ${h.teile ? `Sonne ${h.teile.sonne} · Mond ${h.teile.mond} · Sterne ${h.teile.sterne}` : "—"} · der Boden der Nacht ${h.boden} (das Sternen-Licht durch die Luft ${h.sterne})`} · ${h.gemalt ? "gemalt" : "UNGEMALT"}`
            );
    if (himmel.sauber) befunde.push(...himmel.sauber.befunde);
    else befunde.push("S0 Himmel: die Probe lief nicht");
    const gehalten = ergebnis.gehalten;
    const kreis = s0KreisNetto(sauber, gehalten);
    if (sauber && !sauber.fehler)
        console.log(
            `  S0 KREIS (der Feuerkreis aus 2 m netto: mit minus ohne Pool bei gehaltener Blende): brutto ${sauber.kreis} · ohne Pool ` +
                `${gehalten && gehalten.kreis} bei k ${gehalten && gehalten.belichtung} (das Feuer ${sauber.belichtung}) · netto ${kreis.netto} ` +
                `(Soll ≥ ${S0_LUMA_2M}) · AUSKUNFT der Farbton netto bei gehaltener Blende ${JSON.stringify(s0TonNetto(sauber, gehalten))}`
        );
    if (sauber && !sauber.fehler && kreis.befund) befunde.push(kreis.befund);
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
            befunde.push(...S0_STOFF(wgsl));
            const aus = opt("--wgsl", null);
            if (aus) fs.writeFileSync(aus.replace(/(\.wgsl)?$/, i ? `-${i + 1}.wgsl` : ".wgsl"), wgsl);
        });
        // DIE ÜBERSETZUNG (oben `S0_MS`): je Programm das Urteil des Wegs, die Zeichen gegen den gebuchten Stand und die Zeit als Auskunft
        // neben dem K17-Fall derselben Sitzung
        if (boden?.fehler || !boden?.programme.length)
            befunde.push(`S0 Boden-Übersetzung: ${boden?.fehler || "kein Programm (die Linse ist blind)"}`);
        else
            boden.programme.forEach((p, i) => {
                const u = s0BodenUrteil(`S0 Boden-Programm ${i + 1}`, p);
                s0Zeile(`S0 BODEN-PROGRAMM ${i + 1}/${boden.programme.length}`, p, u, boden.k17);
                befunde.push(...u);
            });
    }
    // DIE WAND DER NAH-BÜHNE: kein Satz zeichnet im Schuss eine Zelle jenseits der Kugel (sonst übersetzt der Schuss die Stoffe
    // der Welt, nicht die des Feuers)
    const s0Jenseits = (e) => Object.entries(e?.nah?.jenseits || {});
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
        // der Pool leer fährt DENSELBEN Weg (`s0KreisNetto`): sein Schuss ist die Nacht ohne Pool, sein Partner ohne Pool bei seiner
        // gehaltenen Blende derselbe Schuss — ein Feuer, das nichts beleuchtet, trägt netto 0, brutto die nachbelichtete Nacht
        const sc = ergebnis.nacht;
        const leer = sc && !sc.fehler ? s0KreisNetto(sc, sc) : null;
        const getroffen = !!(leer && leer.befund && leer.netto < S0_LUMA_2M);
        console.log(
            `  SELBSTTEST S0 BILD (der Pool leer): ${getroffen ? `getroffen — ein Feuer, das nichts beleuchtet: brutto ${sc.kreis} (die nachbelichtete Nacht), netto ${leer.netto} (unter ${S0_LUMA_2M}): das Urteil liest den Pool netto` : "BLIND " + JSON.stringify(leer)}`
        );
        const fb = ergebnis.farbe;
        // das Feuer bis K11b reißt am Farbton (netto), das Auge des Tages an der Sättigung (brutto) bei Farbton im Band
        const fbTon = fb && !fb.fehler ? s0Ton(fb, ergebnis.nacht) : null;
        // DIE DIFFERENZ IM SELBEN LAUF (w28-glut-nacht): die Mutante gilt als gefangen, wenn ihr Farbton netto mindestens
        // `S0_TON.paletteUnter` Grad UNTER dem des Kopfs im selben Lauf liegt (Gerät und Lauf kürzen sich heraus). Bis hierher
        // musste sie aus dem Band 28–45° fallen — das fing sie nur, weil das Rosa des alten Auges der Nacht sie unter 28° zog:
        // die Linse lehnte am Fehler. Ohne das Rosa liest sie 29,1° (im Band), der Kopf 32,2°. Das Band bleibt dem Kopf.
        const kopfTon = sauber && !sauber.fehler ? s0Ton(sauber, ergebnis.nacht) : null;
        const fbUnter = fbTon && kopfTon ? +(kopfTon.hue - fbTon.hue).toFixed(1) : null;
        const farbGetroffen = fbUnter != null && fbUnter >= S0_TON.paletteUnter;
        console.log(
            `  SELBSTTEST S0 BILD (das Feuer bis K11b, Glut-Palette bei der Stärke des Welt-Feuers): ${farbGetroffen ? `getroffen — das Licht des Feuers fällt netto auf Farbton ${fbTon.hue}°, ${fbUnter}° unter dem Kopf (${kopfTon.hue}°, Soll ≥ ${S0_TON.paletteUnter}°): die Farbtemperatur trägt ihn` : `BLIND — ${fbUnter}° unter dem Kopf (Soll ≥ ${S0_TON.paletteUnter}°) ` + JSON.stringify({ kopf: kopfTon, mutante: fbTon })}`
        );
        const tg = ergebnis.tag;
        const tgTon = tg && !tg.fehler ? s0Ton(tg, ergebnis.nacht) : null;
        const tagGetroffen = s0TonImBand(tgTon) && !(tgTon.sat <= S0_TON.satMax);
        console.log(
            `  SELBSTTEST S0 BILD (das Auge des Tages, wie bis K66): ${tagGetroffen ? `getroffen — der Boden 1–3 m reißt an der Sättigung ${tgTon.sat} (Soll ≤ ${S0_TON.satMax}) bei Farbton ${tgTon.hue}° netto im Band: das Auge der Nacht trägt ihn` : "BLIND " + JSON.stringify(tgTon)}`
        );
        // (c) eine Hilfs-Funktion liest eine Bindung des gezeichneten Programms
        const prog = (sauber && !sauber.fehler && sauber.boden?.[0]) || "";
        const bind = /@group\s*\(\s*\d+\s*\)\s*var(?:<[^>]*>)?\s+(\w+)/.exec(prog);
        const bindRot = bind ? S0_STOFF(`${prog}\nfn s0Mutante() {\n\tlet s0 = ${bind[1]};\n}\n`) : [];
        const bindGetroffen = bindRot.some((b) => b.includes(`s0Mutante: ${bind[1]}`));
        console.log(`  SELBSTTEST S0 BODEN-PROGRAMM (c: eine Hilfs-Funktion liest eine Bindung): ${bindGetroffen ? `getroffen — ${bindRot[0].split(" — ")[0]}` : "BLIND"}`);
        // (a+b) der K17-Fall, gezeichnet auf dem Vendor-Weg: er fällt am Weg (synchron) — seine Größe (~188 000 Zeichen) nennt die
        // Zeile als Zuwachs, sie urteilt nicht mehr (Fall e); die Bindung steht als Auskunft daneben (der Fall schreibt das
        // Fels-Gesetz ohne Layout-Funktion aus — die Bindung fängt Mutante c)
        const k17 = boden?.k17;
        const k17Rot = k17 ? [...s0BodenUrteil("S0 K17-Fall", k17), ...S0_STOFF(k17.wgsl || "", "S0 K17-Fall")] : [];
        if (k17) s0Zeile("S0 K17-FALL (Selbsttest)", k17, k17Rot, null, true);
        const k17Getroffen = !HW || k17Rot.some((b) => b.includes("entstand synchron"));
        console.log(`  SELBSTTEST S0 BODEN-PROGRAMM (a+b: der K17-Fall auf dem Vendor-Weg, der Weg): ${!HW ? "nur auf echter GPU" : k17Getroffen ? "GEFANGEN — " + k17Rot.map((b) => b.split(" (Budget")[0].split(" — ")[0]).join(" · ") : "BLIND " + JSON.stringify(k17 ? { ...k17, wgsl: undefined } : boden)}`);
        // (d) ZEITEN JEDER ART ÄNDERN DEN EXIT NICHT (z409, Stummel-Zeiten): unter Last (Median 1487 > 1,3 × 1111), ruhig über dem
        // alten Soll (1111–1170) und schnell (90–99) — dasselbe Urteil, keine Zeile ROT (`istRotZeile`). Die Mutante „Wanduhr
        // urteilt“ (das Zeit-Soll bis 12.11.: ≤ 1,1 × main 721 ms) muss fallen
        const { istRotZeile } = require("./lib/urteil-zeile.cjs");
        const zeiten = [
            [1111, 1300, 1458, 1629, 1574, 1487, 1671, 1413, 1582],
            [1111, 1120, 1125, 1130, 1135, 1140, 1150, 1160, 1170],
            [90, 91, 92, 93, 94, 95, 96, 97, 99],
        ].map((ms) => ({ weg: "asynchron", zeichen: S0_ZEICHEN.stand, ms }));
        const zeitProbe = (urteil) =>
            zeiten.every((p) => {
                const u = urteil("S0 Zeit-Probe", p);
                return !u.length && !istRotZeile(s0ZeileText("S0 ZEIT-PROBE", p, u, zeiten[1]));
            });
        const wanduhr = (n, p) => [...s0BodenUrteil(n, p), Math.min(...p.ms) > 1.1 * 721 && `${n}: kalt ${Math.min(...p.ms)} ms (Soll ≤ 793 ms)`].filter(Boolean);
        const zeitGetroffen = zeitProbe(s0BodenUrteil) && !zeitProbe(wanduhr);
        console.log(
            `  SELBSTTEST S0 BODEN-PROGRAMM (d: Zeiten jeder Art ändern den Exit nicht — z409 unter Last, ruhig 1111 ms, schnell 90 ms): ${zeitGetroffen ? `getroffen — kein Befund, keine Zeile urteilt · die Mutante „Wanduhr urteilt“ GEFANGEN` : "BLIND"}`
        );
        // (e) DIE GRÖSSE ÄNDERT DEN EXIT NICHT (Entscheid 24.11., oben `S0_ZEICHEN`): das gezeichnete Programm, um den Fall von z713
        // gewachsen (4 664 Zeichen Kommentar), trägt keinen Befund mehr als das Programm selbst, und seine Zeile nennt den Zuwachs,
        // ohne zu urteilen. Die Mutante „die Ratsche urteilt“ (bis 24.11.: der Stand + 2 %) muss an derselben Probe fallen
        const z713 = 4664;
        const dick = `${prog}\n// ${"z".repeat(z713 - 5)}\n`;
        const dickZeile = s0ZeileText("S0 GRÖSSEN-PROBE", { weg: "asynchron", zeichen: S0_ZEICHEN.stand + z713, ms: [] }, []);
        const groessenProbe = (urteil) => urteil(dick).length === urteil(prog).length;
        const ratsche = (w) => [...S0_STOFF(w), w.length > 1.02 * prog.length && `${w.length} Zeichen WGSL (Budget ≤ ${Math.round(1.02 * prog.length)})`].filter(Boolean);
        const groesseGetroffen =
            !!prog && groessenProbe(S0_STOFF) && !groessenProbe(ratsche) && !istRotZeile(dickZeile) && dickZeile.includes(`ZUWACHS +${z713}`);
        console.log(
            `  SELBSTTEST S0 BODEN-PROGRAMM (e: die Größe ändert den Exit nicht — das Programm ${z713} Zeichen größer): ${groesseGetroffen ? `getroffen — kein Befund, die Zeile nennt „ZUWACHS +${z713}“ ohne Urteil · die Mutante „die Ratsche urteilt“ GEFANGEN` : "BLIND " + JSON.stringify({ programm: prog.length, zeile: dickZeile })}`
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
        const hb = himmel.taub?.befunde || [];
        const taubGetroffen = hb.some((b) => /^S0 Himmel: nach dem Sprung auf Mitternacht .*`_ensureSkyEnvironment`/.test(b));
        console.log(
            `  SELBSTTEST S0 HIMMEL (der Maler taub): ${taubGetroffen ? `getroffen — ${hb.find((b) => /Mitternacht/.test(b)).split(" — ")[0]}` : "BLIND " + JSON.stringify(hb)}`
        );
        const ha = himmel["anker-spaet"]?.befunde || [];
        const ankerGetroffen = ha.find((b) => /^S0 Himmel: die Sonne sprang im Messfenster/.test(b));
        console.log(
            `  SELBSTTEST S0 HIMMEL (der Anker des Planet-Fadens kommt nach der Malung): ${ankerGetroffen ? "getroffen — " + ankerGetroffen.split(": ein Schreiber")[0] : "BLIND " + JSON.stringify(ha)}`
        );
        const he = himmel.erdschatten?.befunde || [];
        const erdschattenGetroffen = he.find((b) => /^S0 Himmel: nach dem Sprung auf Mitternacht .*im Erdschatten.*`mehrfach`/.test(b));
        console.log(
            `  SELBSTTEST S0 HIMMEL (Ψ_ms eine Stufe über dem Boden seiner Ablage, die Sonne im Erdschatten): ${erdschattenGetroffen ? "getroffen — " + erdschattenGetroffen.split("): die Himmels-Sicht")[0] + ")" : "BLIND " + JSON.stringify(he)}`
        );
        const hd = himmel["daemmer-stufe"]?.befunde || [];
        const daemmerGetroffen = hd.find((b) => /^S0 Himmel: nach dem Sprung auf die Dämmerung .*`passBestrahlung`/.test(b));
        console.log(
            `  SELBSTTEST S0 HIMMEL (die Bestrahlungs-Tafel ohne das Maß der Dämmerung): ${daemmerGetroffen ? "getroffen — " + daemmerGetroffen.split(": die Bestrahlungs-Tafel")[0] : "BLIND " + JSON.stringify(hd)}`
        );
        const hn = himmel.nachtlos?.befunde || [];
        const nachtlosGetroffen = hn.find((b) => /^S0 Himmel: der Himmel der Nacht fehlt/.test(b));
        console.log(
            `  SELBSTTEST S0 HIMMEL (die Nacht ohne Mond und Sterne): ${nachtlosGetroffen ? "getroffen — " + nachtlosGetroffen.split(" — die Tafeln")[0] : "BLIND " + JSON.stringify(hn)}`
        );
        const st = ergebnis.kamera;
        const kameraTreffer =
            st && !st.fehler ? s0NachtUrteil(st, S0_NACHT.nacht).find((b) => /`_dayNightApplyBelichtung`/.test(b)) : null;
        console.log(
            `  SELBSTTEST S0 NACHT (die Kamera der Nacht 2 Stufen tiefer): ${kameraTreffer ? "getroffen — " + kameraTreffer.slice(0, 230) : "BLIND " + JSON.stringify(st && (st.grund || st.fehler))}`
        );
        pass =
            pass && getroffen && farbGetroffen && tagGetroffen && bindGetroffen && k17Getroffen && zeitGetroffen && groesseGetroffen && nahGetroffen && liesGetroffen && wacheGetroffen;
        const stoffTreffer = /`_mikroStoff`/.test(
            s0NachtUrteil({ grund: { luma: 24.6, schwarz: 0.1 }, gesetz: { luma: 24.6, aRing: 0.11, aStoff: 0.11, k: 1 } }, S0_NACHT.nacht)
        );
        console.log(`  SELBSTTEST S0 NACHT (z352): ${stoffTreffer ? "getroffen — der Stoff" : "BLIND"}`);
        // DER WURF AUF DUNKLES KORN (Welle SAMEN, Probe-Lauf 44765083728): das Feuer 0,82 m daneben, derselbe Stoff, dasselbe Licht —
        // am Fleck (k = 1, die alte Lesung) fällt er unter die Soll, am Gesetz (der Median, 22,79) hält er. Ohne Albedo blind.
        // DER BRUCH VON z637 (Licht −4 %): am Gesetz unter der Soll; die gesunden Werte von Kopf und Basis halten. Die Kamera 2 Stufen
        // tiefer (oben) bleibt und ersetzt ihn nicht. Die Zeilen tragen kein Rot-Wort: der getroffene Selbsttest ist kein Urteil
        // (scripts/lib/urteil-zeile.cjs las „am Fleck ROT“ als rote Zeile, GPU-Probe 02447ebc).
        const G = S0_NACHT.gesund;
        const an = (luma) => s0NachtUrteil({ grund: { luma: 21.8, schwarz: 0 }, gesetz: { luma, aRing: 0.1067, aStoff: 0.1177, k: 1.103 } }, S0_NACHT.nacht);
        const [wurfVorher, wurfGesetz, wurfBlind] = [an(21.8), an(G.kopf), s0NachtUrteil({ grund: { luma: 21.8, schwarz: 0 } }, S0_NACHT.nacht)];
        const wurfGetroffen = wurfVorher.length === 1 && wurfGesetz.length === 0 && /blind/.test(wurfBlind.join(""));
        console.log(
            `  SELBSTTEST S0 NACHT (der Wurf auf dunkles Korn, Licht je Albedo): ${wurfGetroffen ? `getroffen — am Fleck 21.8 unter der Soll ${S0_NACHT.nacht.luma}, am Gesetz ${G.kopf} darüber, ohne Albedo blind` : "BLIND " + JSON.stringify([wurfVorher, wurfGesetz, wurfBlind])}`
        );
        const bruch = +(G.basis * S0_NACHT.bruchZ637).toFixed(2);
        const [bruchU, kopfU, basisU] = [an(bruch), an(G.kopf), an(G.basis)];
        const bruchGetroffen = bruchU.length === 1 && kopfU.length === 0 && basisU.length === 0;
        console.log(
            `  SELBSTTEST S0 NACHT (Licht −4 %, der Bruch von z637): ${bruchGetroffen ? `getroffen — der Bruch ${bruch} unter der Soll ${S0_NACHT.nacht.luma}, Kopf ${G.kopf} und Basis ${G.basis} darüber` : "BLIND " + JSON.stringify([bruchU, kopfU, basisU])}`
        );
        // DIE SICHT DES MONDES im Urteil (gestellt): ohne Mond-Sicht an jedem Pixel ROT · schwarz im Licht der Nacht ROT beim Stoff ·
        // schwarz nur im Schatten des Mondes (8 % des Rings, im Licht 0) grün — der Schatten ist Geometrie
        const amOrt = (imLicht, schwarzAlle) =>
            s0NachtUrteil({ grund: { luma: 24, schwarz: schwarzAlle }, gesetz: { luma: 24, aRing: 0.11, aStoff: 0.11, k: 1, imLicht }, mondHoehe: 22.08 }, S0_NACHT.nacht);
        const [ohneSicht, imLicht, imSchatten] = [amOrt({ n: 0, schwarz: null }, 0), amOrt({ n: 900, schwarz: 0.08 }, 0.08), amOrt({ n: 900, schwarz: 0 }, 0.08)];
        const sichtGetroffen =
            ohneSicht.some((b) => /das Licht der Nacht trifft keinen Boden/.test(b)) &&
            imLicht.some((b) => /abgesoffen 8\.0 % im Licht der Nacht .*`_mikroStoff`/.test(b)) &&
            imSchatten.length === 0;
        console.log(
            `  SELBSTTEST S0 NACHT (die Sicht des Mondes): ${sichtGetroffen ? `getroffen — ohne Mond-Sicht „${ohneSicht[0].split(" — ")[0]}“ · schwarz 8 % im Licht → ROT · schwarz 8 % allein im Schatten grün`: "BLIND " + JSON.stringify([ohneSicht, imLicht, imSchatten])}`
        );
        const mm = messerUrteil(ergebnis.messer, nacht);
        const messerGetroffen = !!mm.befund && /`_poolAmBild`/.test(mm.befund) && mm.ev != null;
        console.log(
            `  SELBSTTEST S0 MESSER (der Messer blind für den Pool am Boden des Bilds): ${messerGetroffen ? "getroffen — " + mm.befund.split(" (k ")[0] : "BLIND " + JSON.stringify(mm)}`
        );
        // DER POOL GEGEN DAS STERNEN-LICHT (gestellt, die Zahlen des Täters a7b7a4b1 an dieser Bühne): ROT am Bezug des Fensters;
        // derselbe Pool an der Nacht der REF gewogen grün; ohne Lesung blind
        const T0 = S0_MESSER_TAETER;
        const [sternU, knotenU, blindU] = [
            messerUrteil({ belichtung: T0.k, poolE: T0.poolE, poolKnoten: T0.poolKnoten, punkteN: T0.n }, { belichtung: T0.kNacht }),
            messerUrteil({ belichtung: T0.k, poolE: T0.poolKnoten, poolKnoten: T0.poolKnoten, punkteN: T0.n }, { belichtung: T0.kNacht }),
            messerUrteil({ belichtung: T0.k, poolE: T0.poolE, poolKnoten: null, punkteN: T0.n }, { belichtung: T0.kNacht }),
        ];
        const messerNachtGetroffen = !!sternU.nacht && /`_poolAmBild`.*`BELICHTUNG\.nachtRefE`/.test(sternU.nacht) && knotenU.nacht === null && /blind/.test(blindU.nacht || "");
        console.log(
            `  SELBSTTEST S0 MESSER (der Pool gewogen gegen das Sternen-Licht): ${messerNachtGetroffen ? "getroffen — " + sternU.nacht.split(" (Soll")[0] + " · an der Nacht der REF gewogen grün · ohne Lesung blind" : "BLIND " + JSON.stringify([sternU.nacht, knotenU.nacht, blindU.nacht])}`
        );
        pass = pass && messerGetroffen && messerNachtGetroffen && taubGetroffen && !!nachtlosGetroffen && !!ankerGetroffen && !!erdschattenGetroffen && !!daemmerGetroffen && !!kameraTreffer && stoffTreffer && wurfGetroffen && bruchGetroffen && sichtGetroffen;
    }
    console.log(
        `\n${pass ? "✅" : "⛔"} S0 BILD ${pass ? "GRÜN: die Feuerstelle trägt den Feuerkreis aus 2 m in der Ausgabe" : "ROT"} · Nacht ${JSON.stringify(nacht && { ...nacht.grund, gesetz: nacht.gesetz && nacht.gesetz.luma })} (${Math.round((Date.now() - t0) / 1000)} s, ${ECHT ? "echte GPU" : adapter.fehlt || adapter.vendor + "/" + adapter.architecture} · Holz ${HOLZ})\n`
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
    // Die Proben der Seite (S0 `s0Probe`) lesen die EINE Leuchtdichte (abnahme-urteil `luma709`) — der Licht-Lauf trägt sie mit
    // AUSGABE_INSTALL, der Hauptlauf legt sie hier vor jedem Dokument in die Seite (jede Bühne kommt frisch durch die Tür).
    await page.evaluateOnNewDocument(`window.luma709 = ${luma709};`);
    await page.evaluateOnNewDocument(() => {
        window.__anazhHeadlessNullRenderer = true;
        // DER STOFF-ZENSUS: jeder direkt beleuchtete Stoff der Szene (Standard, Physical, Lambert, Phong, Toon — Basic
        // trägt in r184 nur das indirekte Licht) trägt den Licht-Pool (`userData.lichtPool`, `_leuchtStoff`) oder ist Quelle
        window.__stoffZensus = () => {
            const s = st;
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
                    if (m.userData?.lichtPool) continue;
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
    for (const [welt, schein] of laeufe) {
        // jeder Bühnen-Lauf auf frischer Bühne, geboren wie im Spiel durch die Tür (der Schein-Lauf erbt nichts vom sauberen)
        if (welt === "buehne") await weltTor(page, jsonLesen(BUEHNE_DATEI));
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
            for (const k of ["streuZellen", "nahStreu", "dorfZellen", "pflanzSchlange", "fluesse"])
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
            `  SELBSTTEST S0 (Feuer ohne Datum · Laterne ungelesen · Stoff und Bauer ohne Pool): ${selbst.s0Treffer ? "getroffen — " + s0Namen[0] : s.s0?.abbruch || "BLIND " + JSON.stringify(selbst.s0Rest)}`
        );
    }
    if (JSON_AUS) jsonSchreiben(JSON_AUS, { berichte, selbst });
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
