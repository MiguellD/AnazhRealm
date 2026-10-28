// diag-fernwald.cjs — DER FERNWALD IST KARTE (npm run gate:fernwald).
//
// Studio-Vertrag B2c: Baum und Strauch tragen `lod.budget[kind].fernform: "karte"` — jenseits der Nah-Grenze des Wirts
// IST die Art ihre Karte (der Leser `_foundryFernForm`; Tor und Fahrzeug tragen "gesetz", ihren Box-Satz) — auch im
// GESETZTEN Wald (Architektur-Einträge aus `_forestPlantChunk`) jenseits der Mesh-Zone (des geregelten Cull-Radius,
// 100–150 m). Der EINE Chokepoint `tickArchitectureCulling` liest `_archKartenPreset`: ein Karten-Ding trägt seine
// Studio-Kette über die Mesh-Zone hinaus — dieselbe EINE Stufen-Wahl wie nah legt es jenseits seines L1↔Karte-Bands auf
// die Karte allein (kein Partner; ein Riese trägt sein Band über den Radius hinaus) bis zu SEINEM Rand im Saum vor
// `SCATTER.outerM` (`_archKartenHorizont`, aus dem Samen), geräumt erst `KARTEN_HORIZONT_TOTBAND_M` dahinter. Keine
// Karte dithert am Horizont (die Maske trägt keinen Schwund).
//
// Boot mit Foundry-ON und Null-Renderer (die Form-Entscheidung fällt CPU-seitig; headless trägt der Rahmen aus der
// L1-Geometrie, die Karte steht ohne Bake). Die Linse nennt jeden Täter beim Namen (Art, Distanz, Grund).
//   A FORM      an der Mess-Wiese trägt JEDES Karten-Ding zwischen Mesh-Zone und seinem Rand seine Gestalt: platziert,
//               jenseits seines Bands (d·min(lodRef/Sichthöhe, 1) ≥ D1 + M) die Karte allein, Stufe 2 ohne Partner —
//               nicht vakuös: mindestens 100 solche Bäume.
//   B ABSENZ    kein Karten-Ding trägt einen Feld-Satz; der Satz-Weg (`_archZiegelFern`, mit echtem Renderer) legt für
//               ein Karten-Ding keinen an.
//   C HORIZONT  der Spieler zieht 320 m weiter: kein Karten-Ding jenseits seines Rands + Totband ist platziert, jedes in
//               der Karten-Zone trägt seine Gestalt; die Ränder liegen im Saum und streuen über mindestens seine Hälfte.
//   D ÜBERGANG  ein Baum am Rand der Mesh-Zone (Karte, diesseits) wandert hinüber und zurück: dieselben Instanz-Slots
//               (kein Abbau, kein Neubau, kein Takt ohne Gestalt), draußen die Karte allein — kein Pop am Radius.
//   D2 RIESE    eine Eiche mit Sichthöhe 110 m (Band 134–270 m, jenseits jedes Radius): im Band trägt sie ihren Partner
//               (nicht voll gestempelt), jenseits die Karte allein, zurück wieder das Band — kein Takt ohne Gestalt.
//   E STAND     die Gestalt des Orts (Solitär/Bestand) merkt sich erst nach der Wasser-Wahrheit ihrer Kachel.
//   F GRUNDRISS ein Haus über dem einzigen stehenden Nachbarn einer Eiche macht sie zum Solitär, gemerkt wie frisch.
//   SELBSTTEST (sonst wäre das Grün vakuös): (1) der alte Weg (`_archKartenPreset` → null: jenseits der Mesh-Zone
//               geräumt) macht A und D rot; (2) ein injizierter Feld-Satz an einem Baum macht B rot mit Namen;
//               (3) kein Band jenseits des Radius — D2 rot; (4) ein Gedächtnis mit
//               gekippter Gestalt macht E rot; (5) dasselbe Haus ohne Grundriss macht F rot.
//
//   node scripts/diag-fernwald.cjs        (Port: FERNWALD_PORT)
"use strict";
const { WELT_ORTE_INSTALL } = require("./lib/welt-orte.cjs");
const { statikServer, hauptLauf, nullSeite, pruefer, urteilEnde } = require("./lib/welt-boot.cjs");

const PORT = Number(process.env.FERNWALD_PORT || 4598);
const server = statikServer();

const { errs, check } = pruefer();

hauptLauf(async () => {
    await server.lausche(PORT);
    const { browser, page } = await nullSeite({ frist: 900000 });
    await page.evaluateOnNewDocument(WELT_ORTE_INSTALL); // der Messort aus spec/profiband/haushalt.json (`__messWiese`)
    // das Holz der Mess-Wiese ist „voll" (Ring 4): seit die Holz-Wahl auf dem WebGL2-Rückfall den GL-Renderer fragt,
    // wählt swiftshader kienspan (Ring 2) — die Karten-Zone trüge dann 18 statt ≥ 100 Bäume, A wäre vakuös. Der Null-
    // Renderer baut kein Programm: „voll" kostet hier nichts.
    await server.zeige(page, 60000, "index.html?holz=voll");

    const out = await page.evaluate(async () => {
        const res = {};
        const r = await window.__weltDa((r) => r.state.blueprints);
        const AR = r.constructor;
        const st = r.state;
        const f = r._ensureAssetFoundry();
        await window.__weltDa(() => f && f.ready && f.recipes && AR._studioRenderConfig && AR._studioRenderConfig.lod);
        res.buch = !!(f && f.ready);
        if (!res.buch) return res;
        // E DER STAND DES WALD-GESETZES: die Gestalt des Orts (Solitär oder Bestand) ist eine Antwort des Walds, und der
        // Wald wächst aus der Wasser-Wahrheit seines Orts (Erosion, Flüsse, Seen der Hydro-Kachel). Ein Raster gesetzter Eichen
        // in einer Kachel, die noch nicht steht (der Zweit-Boot fragt den gespeicherten Baum vor dem Spieler-Takt), fragt
        // seine Gestalt; dann kommt der Spieler (die Kachel steht), und jede gemerkte Gestalt muss die aus dem Nichts
        // gefragte sein (alle Gedächtnisse des Walds geleert). Vor dem Worldgen (keine Hydrosphäre) wartet die Gestalt (null)
        // und wird nicht gemerkt.
        // DER ORT KOMMT AUS DER WELT (Integration K20 auf K16): die Probe geht die Mitten der Hydro-Kacheln in Ringen um den
        // Ursprung (Kanten-Länge aus HYDROSPHERE.regionSize), nimmt nur Kacheln ohne Wahrheit und prüft jede ganz (vor der
        // Wahrheit gefragt, dann die Wahrheit, gemerkt gegen frisch — jeder Täter jeder geprüften Kachel zählt); sie bleibt an
        // der ersten Kachel stehen, die freie UND gebundene Eichen trägt und eine Eiche im Bestand mit genau EINEM stehenden
        // Nachbarn (die Probe von F). Die Tabelle der alten Welt (vier Kachel-Mitten) fand in der Landform des Kerns nur
        // geschlossenen Wald: 0 von 64 frei, F ohne Probe.
        {
            const kachelVon = (x, z) => globalThis.__gelaendeCore.kachelSchluessel(r._gelaende(), x, z);
            const size = AR.HYDROSPHERE.regionSize;
            const orte = [];
            for (let k = 1; k <= 3; k++)
                for (let rx = -k; rx <= k; rx++)
                    for (let rz = -k; rz <= k; rz++)
                        if (Math.max(Math.abs(rx), Math.abs(rz)) === k) orte.push([rx * size, rz * size]);
            const V = r._foundryGestalten("eiche");
            const FS = globalThis.__phytoCore.FREISTAND;
            const CELL = AR.FOREST.cell;
            const kr = AR.FOREST.crown.baum_eiche;
            // DIE FRAGE IN BAU-EREIGNISSEN (K69: die Schlange des Walds plant im Takt): wartet die Gestalt einer Eiche auf den Plan
            // ihres Walds, pumpt die Linse die Schlange (`_tickWaldPlan`), bis sie steht; jede Zelle plant ihre Wahrheit zuerst
            // (`_ensureHydroTilesAround`). Ihr Rechner ist der Wald-Faden: zwischen zwei Pumpen bekommt er die Nachrichten-Runde.
            const frag = async (e) => {
                let g = r._foundryGestaltFor(e, "eiche");
                for (let i = 0; g == null && i < 4000; i++) {
                    r._forestDartStand(r._forestSeedInt());
                    r._tickWaldPlan(Infinity);
                    await sleep(0);
                    g = r._foundryGestaltFor(e, "eiche");
                }
                return g;
            };
            const frischAlle = async (proben) => {
                r._forestDartMemo = null; // alle Gedächtnisse des Walds fort: die Antwort aus dem Nichts
                r._ortSame = null; // das EINE Gedächtnis der Gestalt des Orts (`_ortGestaltSame`)
                const g = [];
                for (const e of proben) g.push(await frag(e));
                return g;
            };
            // der Eintrag einer Eiche am Ort (x, z) mit Same s im Gedächtnis — es liegt in Eimern (`ORT_SAME_EIMER`, K51-5)
            const ortEintrag = (x, z, s) => {
                const M = r._ortSame;
                const eimer = M && M.get(Math.floor(x / AR.ORT_SAME_EIMER) + "," + Math.floor(z / AR.ORT_SAME_EIMER));
                if (!eimer) return null;
                for (const k of eimer.keys())
                    if (k.startsWith(x + "," + z + ",") && k.endsWith("," + s + ",eiche")) return { eimer, k };
                return null;
            };
            // die Probe von F an einer Kachel: eine Eiche im Bestand mit genau EINEM stehenden Nachbarn (Abstand > 4 m)
            const wahlF = async (proben) => {
                await frischAlle(proben);
                const seedInt = r._forestSeedInt();
                const darts = (gx, gz) => r._forestCellDarts(gx, gz, seedInt);
                for (const e of proben) {
                    if ((await frag(e)) === V) continue;
                    const gx = Math.floor(e.position.x / CELL);
                    const gz = Math.floor(e.position.z / CELL);
                    const nah = [];
                    for (let ax = -4; ax <= 4; ax++)
                        for (let az = -4; az <= 4; az++)
                            for (const o of darts(gx + ax, gz + az)) {
                                const d = Math.hypot(o.x - e.position.x, o.z - e.position.z);
                                if (d < 1e-3 || d >= FS.abstand * (kr + o.T)) continue;
                                if (r._forestDartSteht(o, gx + ax, gz + az, darts)) nah.push({ o, d });
                            }
                    if (nah.length === 1 && nah[0].d > 4) return { e, o: nah[0].o };
                }
                return null;
            };
            const taeter = [];
            let geprueft = 0;
            let wahl = null;
            let gewaehlt = null;
            for (const [KX, KZ] of orte) {
                if (st.hydroTiles && st.hydroTiles.has(kachelVon(KX, KZ))) continue;
                geprueft++;
                const proben = [];
                for (let i = 0; i < 64; i++) {
                    const x = KX + ((i % 8) - 3.5) * 30;
                    const z = KZ + (Math.floor(i / 8) - 3.5) * 30;
                    proben.push({
                        type: "baum_eiche",
                        position: { x, y: 0, z },
                        seed: Math.imul(i + 1, 0x9e3779b1) >>> 0,
                        scale: 1,
                    });
                }
                for (const e of proben) await frag(e);
                await window.__weltDa(() => !r._ensureHydroTilesAround(KX, KZ, 400)); // der Spieler kommt: die Kachel steht
                const alt = [];
                for (const e of proben) alt.push(await frag(e));
                const frisch = await frischAlle(proben);
                proben.forEach((e, i) => {
                    if (alt[i] !== frisch[i])
                        taeter.push(`Eiche (${e.position.x}, ${e.position.z}): Gestalt ${alt[i]} statt ${frisch[i]}`);
                });
                const frei = frisch.filter((g) => g === V).length;
                if (!(frei >= 1 && frei < proben.length)) continue;
                wahl = await wahlF(proben);
                if (!wahl) continue;
                gewaehlt = { KX, KZ, proben, frei };
                break;
            }
            res.E = { kachel: gewaehlt ? kachelVon(gewaehlt.KX, gewaehlt.KZ) : null, geprueft, taeter };
            if (gewaehlt) {
                const { KX, KZ, proben } = gewaehlt;
                // vor dem Worldgen: die Gestalt wartet und wird nicht gemerkt
                const e0 = { type: "baum_eiche", position: { x: KX, y: 0, z: KZ }, seed: 7, scale: 1 };
                const h = st.hydrosphere;
                let vorWelt;
                st.hydrosphere = null;
                try {
                    vorWelt = {
                        gestalt: r._foundryGestaltFor(e0, "eiche"),
                        gemerkt: !!ortEintrag(KX, KZ, 7),
                    };
                } catch (err) {
                    vorWelt = { fehler: String((err && err.message) || err).split("\n")[0] };
                } finally {
                    st.hydrosphere = h;
                }
                // Selbsttest: ein Gedächtnis am gültigen Stand mit gekippter Gestalt muss beim Namen feuern
                const p0 = proben[0];
                const g0 = await frag(p0);
                const k0 = ortEintrag(p0.position.x, p0.position.z, p0.seed);
                if (k0)
                    k0.eimer.set(
                        k0.k,
                        r._foundryGestaltSame(p0.seed, "eiche", () => g0 !== V)
                    );
                const sAlt = r._foundryGestaltFor(p0, "eiche");
                const sFrisch = (await frischAlle(proben))[0];
                Object.assign(res.E, {
                    n: proben.length,
                    frei: gewaehlt.frei,
                    vorWelt,
                    selbst: sAlt !== sFrisch,
                });
            }
            // F DER GRUNDRISS-STAND: ein Wurf des Walds, den die Natur-Wand hält (`_naturWand`: der
            // Grundriss eines Hauses), steht nie — die Eiche neben ihm steht frei. Eine Eiche im Bestand mit genau EINEM
            // stehenden Nachbarn bekommt über diesem Nachbarn ein Haus; danach muss ihre Gestalt der Solitär sein, gemerkt
            // (die Antwort vor dem Haus) wie frisch gefragt.
            res.E.F = { probe: !!wahl };
            if (wahl && gewaehlt) {
                const { proben } = gewaehlt;
                const { e, o } = wahl;
                await frischAlle(proben);
                const vorher = await frag(e);
                let grund = null;
                const haus = r.spawnArchitecture(
                    "haus_alemannisch",
                    { x: o.x, y: o.surfaceY, z: o.z },
                    { fundament: { ex: 1.5, ez: 1.5 }, silent: true, absage: (g) => (grund = g) }
                );
                const gemerkt = await frag(e);
                const frischF = (await frischAlle(proben))[proben.indexOf(e)];
                if (haus) r.removeArchitecture(haus);
                // Selbsttest: dasselbe Haus OHNE Grundriss hält den Wurf nicht — die Eiche bleibt Bestand (die Linse
                // unterscheidet: frei macht nur der Grundriss). Seit K52 trägt jeder Bau einen (die Hülle seiner Blocker-Boxen), seit
                // S4 das Haus seinen Grund (Plan-Datum, beim Setzen): die Probe nimmt ihm Grund, Fundament, Hülle und Boxen
                r._hausGrundSetzen = () => false;
                const ohne = r.spawnArchitecture(
                    "haus_alemannisch",
                    { x: o.x, y: o.surfaceY, z: o.z },
                    { silent: true }
                );
                delete r._hausGrundSetzen; // der Patch lebt nur im Setzen — auch, wenn es fehlschlägt
                if (ohne) {
                    ohne.fundament = undefined;
                    ohne._hausHuelle = undefined;
                    ohne.blockerAABBs = null;
                    r._grundrissFaellt();
                }
                res.E.F.selbst = !!ohne && (await frag(e)) !== V;
                if (ohne) r.removeArchitecture(ohne);
                Object.assign(res.E.F, {
                    ort: `Eiche (${e.position.x}, ${e.position.z}), Nachbar ${o.sp} (${o.x.toFixed(1)}, ${o.z.toFixed(1)})`,
                    haus: !!haus,
                    grund,
                    vorher,
                    gemerkt,
                    frisch: frischF,
                    V,
                });
            }
        }
        let taktFehler = null;
        const tick = async (n) => {
            for (let i = 0; i < n; i++) {
                try {
                    r._gameLoopTick(performance.now());
                } catch (e) {
                    if (!taktFehler) taktFehler = String((e && e.message) || e).split("\n")[0];
                }
                await sleep(0);
            }
        };
        const warte = (name, fertig) =>
            window
                .__gebautNach(name, { takt: () => tick(1), fertig })
                .then(() => null)
                .catch((f) => f.message.split("\n")[0]);
        const wache = (name) => r._standWache.takte.get(name);
        const pm = st.playerMesh.position;
        const stelle = (x, z) => pm.set(x, r._voxelSurfaceY(x, z) + 1.8, z);
        const [MX, MZ] = window.__messWiese;
        const H = AR.SCATTER.outerM;
        const TOT = AR.KARTEN_HORIZONT_TOTBAND_M;
        res.horizont = H;
        res.totband = TOT;
        const dist = (e) => Math.hypot(e.position.x - pm.x, e.position.z - pm.z);
        // Die Linse liest die Karten-Art über die Prototyp-Methode — der Selbsttest ersetzt nur die der Welt.
        const kartenPreset = (e) => AR.prototype._archKartenPreset.call(r, e);
        const karten = () => st.architectures.filter((e) => e && e.position && kartenPreset(e));
        // Der Stempel einer Karten-Instanz: das Vorzeichen von aKarte.w im Slot (negativ = voll).
        const stempel = (e) => {
            for (const s of e.instSlots || []) {
                const g = st.archInstanceGroups.get(s.key);
                const ak = g && g.mesh && g.mesh.geometry.attributes.aKarte;
                if (ak) return ak.array[s.slot * 4 + 3];
            }
            return null;
        };
        // Jenseits seines L1↔Karte-Bands IST ein Karten-Ding die Karte allein (dieselbe Wahrnehmung wie die Stufen-Wahl);
        // sein Rand liegt im Saum vor dem Horizont (Prototyp — die Selbsttests ersetzen nur Methoden der Welt).
        const LD = AR.LOD_DISTANCES;
        const jenseitsBand = (e, d) => {
            const h = r._lodTreeVisHeight(e);
            return h !== null && r._lodPerceptionDistance(d, h) >= LD.thresh12 + (LD.hysteresis || 0);
        };
        const partner = (e) => (Number.isFinite(e._lodBandLevel) ? e._lodBandLevel : null);
        const rand = (e) => AR.prototype._archKartenHorizont.call(r, e);
        // A: der Zustand jedes Karten-Dings der Karten-Zone, Täter beim Namen.
        const formZensus = () => {
            const R = st.architectureCullingRadius;
            const t = [];
            let n = 0,
                ok = 0,
                riesen = 0;
            for (const e of karten()) {
                const d = dist(e);
                if (!(d > R && d <= rand(e))) continue;
                n++;
                const p = kartenPreset(e);
                const karte = jenseitsBand(e, d);
                if (!karte) riesen++; // sein Band liegt jenseits des Radius: er folgt seiner Kette (D2)
                let grund = null;
                if (!r._archIsRendered(e))
                    grund = r._foundryPlatzBereit(e, p) ? "kalt (Karte bereit)" : "kalt (Karte lädt)";
                else if (karte && e._lodLevel !== 2) grund = "Stufe L" + e._lodLevel;
                else if (karte && partner(e) !== null) grund = "Band-Partner L" + partner(e) + " jenseits des Bands";
                else if (e._ziegelSlot) grund = "Feld-Satz";
                if (grund) {
                    if (t.length < 6) t.push(`${e.type} @ ${d.toFixed(0)} m: ${grund}`);
                } else ok++;
            }
            return { radius: Math.round(R), n, ok, riesen, taeter: t };
        };
        const einschwingen = async (msMax) => {
            let vor = -1,
                ruhig = 0,
                z = formZensus();
            for (const weiter = window.__deckel("die Form der Bäume", msMax / 50); weiter(); ) {
                await tick(10);
                z = formZensus();
                const s = st.architectures.length * 1000 + z.ok;
                ruhig = s !== vor ? 0 : ruhig + !Object.values(r._weltOffen()).some(Boolean); // nur Gänge ohne Offenes
                vor = s;
                if (z.n > 0 && z.ok === z.n && ruhig >= 3) break;
                if (ruhig >= 30) break;
            }
            return z;
        };
        // ── Die Mess-Wiese: der Wald wächst, die Karten stehen ──
        stelle(MX, MZ);
        await tick(60);
        res.A = await einschwingen(240000);

        // ── B: Absenz — kein Satz an einem Karten-Ding; der Satz-Weg legt mit echtem Renderer keinen an ──
        const absenz = () => {
            const t = [];
            for (const e of karten())
                if (e._ziegelSlot && t.length < 6) t.push(`${e.type} @ ${dist(e).toFixed(0)} m trägt einen Feld-Satz`);
            return t;
        };
        res.B = { taeter: absenz() };
        {
            const probe = karten().find((e) => dist(e) > st.architectureCullingRadius);
            const rend = st.renderer;
            const alt = rend._isHeadlessNull;
            if (probe) {
                rend._isHeadlessNull = false; // der Satz-Weg nur bis zur Wand (das Karten-Ding kehrt vor jedem Bau um)
                let ret = null;
                try {
                    ret = r._archZiegelFern(probe);
                } finally {
                    rend._isHeadlessNull = alt;
                }
                res.B.wand = { typ: probe.type, ret, slot: !!probe._ziegelSlot, gebacken: !!probe._ziegelGebacken };
            }
        }

        // ── D: der Übergang am Radius — ein Baum in der Mesh-Zone nahe dem Rand wandert hinaus und zurück ──
        // Der Cull-Radius ist GEREGELT (ARCH_QUALITY_RADIUS_MIN..MAX, headless folgt er dem PID je Takt): der Baum steht
        // diesseits des kleinsten Radius und wandert jenseits des größten, der Zonen-Wechsel hängt nie am Regler-Stand.
        const RMIN = AR.ARCH_QUALITY_RADIUS_MIN,
            RMAX = AR.ARCH_QUALITY_RADIUS_MAX;
        const uebergang = async () => {
            const kand = karten()
                .filter(
                    (e) =>
                        r._archIsRendered(e) &&
                        e._lodLevel === 2 &&
                        !e._bruecke &&
                        !e._occluded &&
                        dist(e) > RMIN - 25 &&
                        dist(e) < RMIN - 3
                )
                .sort((a, b) => dist(b) - dist(a));
            const e = kand[0];
            if (!e) return { fehlt: true };
            const start = { x: pm.x, z: pm.z };
            const slots = JSON.stringify(e.instSlots);
            const d0 = dist(e);
            // den Spieler radial vom Baum weg setzen, bis der Baum RMAX + 15 m entfernt steht
            const ux = (pm.x - e.position.x) / d0,
                uz = (pm.z - e.position.z) / d0;
            const weg = RMAX + 15 - d0;
            let luecke = 0,
                takte = 0;
            const folge = async (n) => {
                for (let i = 0; i < n; i++) {
                    await tick(1);
                    takte++;
                    if (!r._archIsRendered(e)) luecke++;
                }
            };
            stelle(start.x + ux * weg, start.z + uz * weg);
            await folge(40);
            const draussen = {
                d: +dist(e).toFixed(1),
                gleich: JSON.stringify(e.instSlots) === slots,
                voll: stempel(e) < 0,
                partner: partner(e),
                stufe: e._lodLevel,
                radius: Math.round(st.architectureCullingRadius),
            };
            stelle(start.x, start.z);
            await folge(40);
            const drinnen = {
                d: +dist(e).toFixed(1),
                gleich: JSON.stringify(e.instSlots) === slots,
                voll: stempel(e) < 0,
                partner: partner(e),
                stufe: e._lodLevel,
                radius: Math.round(st.architectureCullingRadius),
            };
            return { typ: e.type, d0: +d0.toFixed(1), radius: RMIN + "–" + RMAX, draussen, drinnen, luecke, takte };
        };
        res.D = await uebergang();

        // ── D2: der Riese — sein L1↔Karte-Band liegt jenseits des Radius: er trägt dort seinen Band-Partner (kein harter
        // Sprung am Radius) und ist erst jenseits des Bands die Karte allein. Die Sichthöhe 110 m legt das Band auf
        // 134–270 m, jenseits jedes geregelten Radius; die Distanzen folgen der Wahrnehmung (dn 18 im Band, auch unter
        // Perf ×1,3 unter D1 + M; dn 36 jenseits), beide diesseits des Saums. ──
        const lodRef = st.lodRef > 0 ? st.lodRef : AR.LOD_DISTANCES.lodRef;
        const ZIEL_H = 110;
        const dBand = (18 * ZIEL_H) / lodRef,
            dKarte = (36 * ZIEL_H) / lodRef;
        let riesenEintrag = null;
        const rieseZustand = (e) => ({
            d: +dist(e).toFixed(1),
            stufe: e._lodLevel,
            partner: Number.isFinite(e._lodBandLevel) ? e._lodBandLevel : null,
            voll: stempel(e) < 0,
            da: r._archIsRendered(e),
        });
        const riese = async () => {
            const vorbild = karten().find(
                (e) => kartenPreset(e) === "eiche" && r._foundrySichtHoehe("eiche", e, 1) > 0
            );
            if (!vorbild) return { fehlt: "keine Eiche mit bekannter Höhe" };
            const h0 = r._foundrySichtHoehe("eiche", vorbild, 1);
            const x = pm.x + dBand,
                z = pm.z;
            const e = r.spawnArchitecture(
                "baum_eiche",
                { x, y: r._voxelSurfaceY(x, z), z },
                {
                    rotationY: 0,
                    scale: ZIEL_H / h0,
                    seed: vorbild.seed,
                }
            );
            if (!e) return { fehlt: "Spawn verweigert" };
            riesenEintrag = e;
            const start = { x: pm.x, z: pm.z };
            let luecke = 0,
                takte = 0;
            const bis = async (n, fertig) => {
                for (let i = 0; i < n; i++) {
                    await tick(1);
                    if (takte++ > 0 && !r._archIsRendered(e)) luecke++;
                    if (fertig && fertig()) break;
                }
            };
            // das Band einschwingen: platziert, Höhe bekannt, Partner gedockt
            await bis(600, () => r._archIsRendered(e) && Number.isFinite(e._lodBandLevel));
            const sichtH = r._foundrySichtHoehe("eiche", e, e.scale);
            luecke = 0;
            await bis(20);
            const imBand = rieseZustand(e);
            // jenseits des Bands: der Spieler rückt vom Riesen weg, bis er dKarte entfernt steht
            stelle(e.position.x - dKarte, e.position.z);
            await bis(60);
            const jenseitsBand = rieseZustand(e);
            stelle(e.position.x - dBand, e.position.z);
            await bis(60, () => Number.isFinite(e._lodBandLevel));
            const zurueck = rieseZustand(e);
            stelle(start.x, start.z);
            return { sichtH: sichtH && +sichtH.toFixed(1), imBand, jenseitsBand, zurueck, luecke, takte };
        };
        res.D2 = await riese();
        // ── SELBSTTEST (3): kein Band jenseits des Radius (die Zonen-Klemme: jenseits des Radius trug ein Karten-Ding
        // keinen Band-Partner) — D2 muss rot werden; Tausch und Rückweg wecken (wie S1), der Regler hält (unter
        // CI-Last klemmt er), die Wahl schläft nie über den Rückweg ──
        if (riesenEintrag) {
            const e = riesenEintrag;
            stelle(e.position.x - dBand, e.position.z);
            const regler = st.perfRegulator;
            st.perfRegulator = false;
            const BP = AR.prototype._foundryLodBandPartner;
            r._foundryLodBandPartner = function (en, d) {
                const R = this.state.architectureCullingRadius;
                return Number.isFinite(R) && d > R && this._archKartenPreset(en) ? null : BP.call(this, en, d);
            };
            r._weltRegt();
            const band = () => Number.isFinite(e._lodBandLevel);
            const ruhte = wache("archLod").ruht;
            const ohne = await warte(
                "Riese ohne Band, die Wahl schläft",
                () => !band() && wache("archLod").ruht > ruhte
            );
            res.S3 = rieseZustand(e);
            delete r._foundryLodBandPartner;
            r._weltRegt();
            const schlief = wache("archLod").ruht;
            const wieder = await warte("Riese wieder im Band", band);
            res.S3.zurueck = Object.assign(rieseZustand(e), {
                schlief: wache("archLod").ruht - schlief,
                warten: ohne || wieder,
            });
            st.perfRegulator = regler;
            stelle(MX, MZ);
            await tick(10);
        }

        // ── C: der Horizont — der Spieler zieht weiter, die Ferne räumt, die Karten-Zone trägt ──
        stelle(MX + 320, MZ);
        const zC = await einschwingen(240000);
        const jenseits = [];
        let nJ = 0,
            randMin = Infinity,
            randMax = -Infinity;
        for (const e of karten()) {
            const d = dist(e);
            const h = rand(e);
            randMin = Math.min(randMin, h);
            randMax = Math.max(randMax, h);
            if (d > h + TOT) {
                nJ++;
                if (r._archIsRendered(e) && jenseits.length < 6)
                    jenseits.push(`${e.type} @ ${d.toFixed(0)} m (Rand ${h.toFixed(0)} m) platziert`);
            }
        }
        res.C = { zone: zC, jenseitsN: nJ, jenseits, randMin, randMax, saum: AR.KARTEN_HORIZONT_SAUM_M };

        // ── SELBSTTEST (1): der alte Weg — kein Karten-Ding: jenseits der Mesh-Zone geräumt ──
        stelle(MX, MZ);
        await einschwingen(120000);
        const kandS1 = await uebergang(); // der Kandidat unter dem echten Weg (der Baum steht am Rand)
        // Der Tausch ändert, was Cull und Stufen-Wahl urteilen: er ist ein Schreiber und trägt seinen Weckruf (die Stand-Wache,
        // `_standRuht` — ohne ihn ging der Cull in einer eingeschwungenen Welt nie, A blieb unter dem alten Weg grün: CI
        // 91c44f0f, A 1558/1558). A zählt erst, wenn der Cull nach dem Tausch gegangen ist — nie nach einer festen Taktzahl.
        // Seit pbk4-fahrt schläft ein Eintrag mit stehendem Urteil in der Cull-Wache (`_cullWache`, ihr Schlüssel: Bestand und
        // Buch) — der Tausch ist ein neues Buch und weckt sie ganz (`_weltRegt` → undefined; ohne ihn A 2230/2230 grün unter dem
        // alten Weg).
        const cullVor = wache("archCull").arbeit;
        r._archKartenPreset = () => null;
        r._cullWacheStand = r._weltRegt();
        await warte("der Cull nach dem Tausch", () => wache("archCull").arbeit > cullVor);
        const cullGaenge = wache("archCull").arbeit - cullVor;
        res.S1 = { A: formZensus(), cullGaenge, D: await uebergang(), vorher: !kandS1.fehlt };
        delete r._archKartenPreset; // die Prototyp-Methode trägt wieder
        r._cullWacheStand = r._weltRegt();
        // ── SELBSTTEST (2): ein injizierter Satz an einem Baum ──
        const opfer = karten()[0];
        if (opfer) {
            opfer._ziegelSlot = { feld: -1, injiziert: true };
            res.S2 = absenz();
            opfer._ziegelSlot = null;
        }
        res.taktFehler = taktFehler;
        res.arch = st.architectures.length;
        return res;
    });
    await browser.close();
    server.close();

    console.log("=== DER FERNWALD IST KARTE (gate:fernwald) ===");
    if (!out.buch) {
        console.log(`  ❌ Buch ${out.buch}`);
        process.exit(2);
    }
    const A = out.A;
    check(
        "A FORM",
        A.n >= 100 && A.ok === A.n,
        `Karten-Zone ${A.radius} m bis zum Rand: ${A.ok}/${A.n} Karten-Dinge tragen ihre Gestalt (jenseits des Bands die Karte allein; ${A.riesen} Riesen im Band)` +
            (A.taeter.length ? ` · Täter: ${A.taeter.join(" | ")}` : "")
    );
    const w = out.B.wand;
    check(
        "B ABSENZ",
        out.B.taeter.length === 0 && !!w && w.ret === false && !w.slot && !w.gebacken,
        `Feld-Sätze an Karten-Dingen: ${out.B.taeter.length}` +
            (out.B.taeter.length ? ` (${out.B.taeter.join(" | ")})` : "") +
            ` · Satz-Weg für ${w ? w.typ : "?"}: ${w ? `ret ${w.ret}, Slot ${w.slot}, aufgegeben ${w.gebacken}` : "keine Probe"}`
    );
    const C = out.C;
    // Die Ränder liegen im Saum und streuen über ihn (mindestens die halbe Breite): der Wald dünnt aus, kein Ring.
    const saumOk =
        C.randMin >= out.horizont - C.saum && C.randMax <= out.horizont && C.randMax - C.randMin >= C.saum / 2;
    check(
        "C HORIZONT",
        C.jenseitsN > 0 && C.jenseits.length === 0 && C.zone.n > 0 && C.zone.ok === C.zone.n && saumOk,
        `nach dem Umzug: ${C.jenseitsN} Karten-Dinge jenseits ihres Rands + ${out.totband} m, platziert: ${C.jenseits.length}` +
            (C.jenseits.length ? ` (${C.jenseits.join(" | ")})` : "") +
            ` · Ränder ${C.randMin.toFixed(1)}–${C.randMax.toFixed(1)} m (Saum ${out.horizont - C.saum}–${out.horizont})` +
            ` · Karten-Zone ${C.zone.ok}/${C.zone.n}` +
            (C.zone.taeter.length ? ` · Täter: ${C.zone.taeter.join(" | ")}` : "")
    );
    const D = out.D;
    const dOk = (x) =>
        !x.fehlt &&
        x.luecke === 0 &&
        x.draussen.gleich &&
        x.draussen.partner === null &&
        x.draussen.stufe === 2 &&
        x.drinnen.gleich &&
        x.drinnen.voll === (x.drinnen.partner === null) && // voll heißt der Halt: die Karte ohne Partner (K36, F1)
        x.drinnen.stufe === 2;
    check(
        "D ÜBERGANG",
        dOk(D),
        D.fehlt
            ? "kein Baum am Rand der Mesh-Zone"
            : `${D.typ} (${D.d0} m, Radius geregelt ${D.radius} m) → ${D.draussen.d} m (Radius ${D.draussen.radius}): Slots gleich ${D.draussen.gleich}, L${D.draussen.stufe}${D.draussen.partner !== null ? "+L" + D.draussen.partner : " allein"}` +
                  ` · zurück ${D.drinnen.d} m: Slots gleich ${D.drinnen.gleich}, voll ${D.drinnen.voll} · Takte ohne Gestalt ${D.luecke}/${D.takte}`
    );
    // D2: im Band der Partner (kein Voll-Stempel), jenseits die Karte allein, zurück wieder das Band — lückenlos.
    const R2 = out.D2 || { fehlt: "nicht gelaufen" };
    const mitBand = (z) => z && z.da && !z.voll && z.partner !== null && z.partner !== z.stufe;
    const kartAllein = (z) => z && z.da && z.stufe === 2 && z.partner === null;
    const zs = (z) =>
        z ? `${z.d} m L${z.stufe}${z.partner !== null ? "+L" + z.partner : ""}${z.voll ? " voll" : ""}` : "—";
    check(
        "D2 RIESE",
        !R2.fehlt && mitBand(R2.imBand) && kartAllein(R2.jenseitsBand) && mitBand(R2.zurueck) && R2.luecke === 0,
        R2.fehlt
            ? R2.fehlt
            : `Sichthöhe ${R2.sichtH} m · im Band ${zs(R2.imBand)} · jenseits ${zs(R2.jenseitsBand)} · zurück ${zs(R2.zurueck)}` +
                  ` · Takte ohne Gestalt ${R2.luecke}/${R2.takte}`
    );
    const s3 = out.S3;
    check(
        "SELBSTTEST 3 (kein Band jenseits des Radius — D2 rot)",
        !!s3 && !mitBand(s3) && mitBand(s3.zurueck) && s3.zurueck.schlief === 0 && !s3.zurueck.warten,
        s3
            ? `alt: ${zs(s3)} · wieder: ${zs(s3.zurueck)} · die Wahl schlief ${s3.zurueck.schlief} Takte ${s3.zurueck.warten || ""}`
            : "kein Riese"
    );
    const s1 = out.S1;
    const s1Rot =
        s1.vorher && s1.cullGaenge >= 1 && !(s1.A.n >= 100 && s1.A.ok === s1.A.n) && !s1.D.fehlt && !dOk(s1.D);
    check(
        "SELBSTTEST 1 (der alte Weg macht A und D rot)",
        s1Rot,
        (s1.cullGaenge >= 1 ? "" : "der Cull ging nach dem Tausch nie (der Weckruf fehlt) · ") +
            `A ${s1.A.ok}/${s1.A.n}` +
            (s1.A.taeter[0] ? ` (${s1.A.taeter[0]})` : "") +
            ` · D ${s1.D.fehlt ? "kein Kandidat" : `Takte ohne Gestalt ${s1.D.luecke}, Slots gleich ${s1.D.draussen.gleich}`}`
    );
    check(
        "SELBSTTEST 2 (ein injizierter Satz macht B rot)",
        Array.isArray(out.S2) && out.S2.length === 1,
        out.S2 ? out.S2.join(" | ") : "kein Opfer"
    );
    const E = out.E || {};
    const vw = E.vorWelt || {};
    check(
        "E GESTALT-STAND (die Wahrheit vor der Antwort)",
        !!E.kachel &&
            E.frei >= 1 &&
            E.frei < E.n &&
            E.taeter.length === 0 &&
            vw.gestalt === null &&
            vw.gemerkt === false,
        !E.kachel
            ? `keine Kachel ohne Wahrheit mit freien und gebundenen Eichen und einer F-Probe (${E.geprueft || 0} geprüft, gemerkt ≠ frisch: ${(E.taeter || []).length}) — keine Probe`
            : `Kachel ${E.kachel} (die ${E.geprueft}. geprüfte): ${E.n} gesetzte Eichen vor ihrer Wasser-Wahrheit gefragt (${E.frei} frei), gemerkt ≠ frisch in allen geprüften: ${E.taeter.length}` +
                  (E.taeter.length ? ` (${E.taeter.slice(0, 4).join(" | ")})` : "") +
                  ` · vor dem Worldgen: ${vw.fehler ? "Fehler " + vw.fehler : "Gestalt " + vw.gestalt + (vw.gemerkt ? ", gemerkt" : ", nicht gemerkt")}`
    );
    const F = E.F || {};
    check(
        "F GRUNDRISS-STAND (ein Wurf im Haus steht nie)",
        F.probe === true && F.haus === true && F.vorher !== F.V && F.gemerkt === F.V && F.frisch === F.V,
        !F.probe
            ? "keine Eiche mit genau einem stehenden Nachbarn (keine Probe)"
            : !F.haus
              ? `das Haus fiel (${F.grund}) — keine Probe`
              : `${F.ort}: vor dem Haus Gestalt ${F.vorher}, mit Haus gemerkt ${F.gemerkt} · frisch ${F.frisch} (Solitär ${F.V})` +
                (F.frisch !== F.V ? " — _forestStehtFrei zählt den Wurf im Grundriss" : "") +
                (F.gemerkt !== F.frisch ? " — _foundryGestaltFor merkt vor dem Grundriss" : "")
    );
    check("SELBSTTEST 5 (ein Haus ohne Grundriss macht F rot)", F.selbst === true, F.probe ? "" : "keine Probe");
    check(
        "SELBSTTEST 4 (ein Gedächtnis mit gekippter Gestalt macht E rot)",
        E.selbst === true,
        E.kachel ? "" : "keine Probe"
    );
    check("T keine Ausnahme im Spiel-Takt", !out.taktFehler, out.taktFehler || "");
    urteilEnde(errs.length, `\n❌ ROT — ${errs.join(", ")}`, () => `\n✅ GRÜN — der gesetzte Wald ist jenseits der Mesh-Zone seine Karte (${A.ok} Bäume), kein Satz, kein Pop am Radius.`);
});
